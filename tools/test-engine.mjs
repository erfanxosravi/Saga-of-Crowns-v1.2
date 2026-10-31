#!/usr/bin/env node
import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

async function loadModule(entryRelPath) {
  const result = await build({
    entryPoints: [path.resolve(rootDir, entryRelPath)],
    bundle: true,
    platform: 'node',
    format: 'esm',
    write: false,
    logLevel: 'silent',
  });
  const code = result.outputFiles[0].text;
  const dataUrl = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
  return import(dataUrl);
}

const CAMPAIGNS = [
  {
    name: 'Saga Mode · Norway (838–938 AD)',
    seed: 'SAGA-SMOKE-NORWAY-838',
    sagaMode: true,
    startYear: 838,
    birthplaceId: 'lade_hladir',
    homeland: 'norway',
    ragnarBloodline: false,
  },
  {
    name: 'Saga Mode · Ragnar Bloodline (850–950 AD)',
    seed: 'SAGA-SMOKE-LOTHBROK-850',
    sagaMode: true,
    startYear: 850,
    birthplaceId: 'roskilde',
    homeland: 'denmark',
    ragnarBloodline: true,
    bloodlineBranch: 'ivar',
  },
  {
    name: 'Saga Mode · Lade & Nidaros Coexistence (950–1050 AD)',
    seed: 'SAGA-SMOKE-TRONDELAG-950',
    sagaMode: true,
    startYear: 950,
    birthplaceId: 'lade_hladir',
    homeland: 'norway',
    ragnarBloodline: false,
  },
  {
    name: 'Classic Mode · Denmark (793–893 AD)',
    seed: 'CLASSIC-SMOKE-DENMARK-793',
    sagaMode: false,
    startYear: 793,
    birthplaceId: 'hedeby',
    homeland: 'denmark',
    ragnarBloodline: false,
  },
];

async function main() {
  const [
    engineMod,
    geoMod,
    legendsMod,
    typesMod,
    heirloomMod,
    storageMod,
  ] = await Promise.all([
    loadModule('src/engine/gameEngine.ts'),
    loadModule('src/data/geography.ts'),
    loadModule('src/data/legendsRegistry.ts'),
    loadModule('src/types/game.ts'),
    loadModule('src/data/lothbrokCycle.ts'),
    loadModule('src/engine/storage.ts'),
  ]);

  const {
    createNewGame,
    advanceTurn,
    resolveEventChoice,
    executeGeneralAction,
    executeTrainSkillAction,
    executeRaidAction,
    executeSailAction,
    continueAsHeir,
  } = engineMod;

  const { SETTLEMENTS_BY_ID, isSettlementActiveInYear } = geoMod;
  const { LEGENDS_REGISTRY, LEGENDS_BY_ID } = legendsMod;
  const { SAGA_HEIRLOOMS } = heirloomMod;
  const { migrateGameState } = storageMod;
  const ALL_LEGEND_BEATS_BY_ID = {};
  for (const leg of LEGENDS_REGISTRY) {
    for (const beat of leg.timeline ?? []) {
      ALL_LEGEND_BEATS_BY_ID[beat.id] = { ...beat, legendId: leg.id };
    }
  }
  const {
    Sex,
    SocialClass,
    Religion,
    Difficulty,
    ContentIntensity,
    TimeStepMode,
  } = typesMod;

  const defaultSettings = {
    difficulty: Difficulty.Balanced,
    contentIntensity: ContentIntensity.Authentic,
    timeStepMode: TimeStepMode.Year,
    language: 'en',
    theme: 'light',
  };

  const errors = [];
  let totalYearsSimulated = 0;
  let totalEventsResolved = 0;
  let totalSuccessions = 0;
  let totalLegendBeatsVerified = 0;

  function validateStateInvariants(state, campaignName, yearIdx) {
    const prefix = `[${campaignName} @ year ${state.year} (step ${yearIdx})]`;

    // 1. Stats in [0, 100] and not NaN
    for (const [k, val] of Object.entries(state.character.stats)) {
      if (typeof val !== 'number' || Number.isNaN(val)) {
        errors.push(`${prefix} character.stats.${k} is NaN or non-number (${val})`);
      } else if (val < 0 || val > 100) {
        errors.push(`${prefix} character.stats.${k} out of [0, 100]: ${val}`);
      }
    }

    // 2. Skills in [0, 100] and not NaN
    for (const [k, val] of Object.entries(state.character.skills)) {
      if (typeof val !== 'number' || Number.isNaN(val)) {
        errors.push(`${prefix} character.skills.${k} is NaN or non-number (${val})`);
      } else if (val < 0 || val > 100) {
        errors.push(`${prefix} character.skills.${k} out of [0, 100]: ${val}`);
      }
    }

    // 3. Realm numeric fields not NaN
    const realmNumericKeys = [
      'silver',
      'landFarms',
      'hirdWarriors',
      'longships',
      'knarrs',
      'foodStores',
      'population',
      'stability',
      'fame',
      'tradeNetworks',
    ];
    for (const rk of realmNumericKeys) {
      const rv = state.realm[rk];
      if (typeof rv !== 'number' || Number.isNaN(rv)) {
        errors.push(`${prefix} realm.${rk} is NaN or non-number (${rv})`);
      }
    }
    if (state.realm.stability < 0 || state.realm.stability > 100) {
      errors.push(`${prefix} realm.stability out of [0, 100]: ${state.realm.stability}`);
    }

    // 4. Current location and discovered settlements must be active in state.year
    const curLoc = SETTLEMENTS_BY_ID[state.character.locationId];
    if (!curLoc) {
      errors.push(`${prefix} invalid character.locationId "${state.character.locationId}"`);
    } else if (!isSettlementActiveInYear(curLoc, state.year)) {
      errors.push(
        `${prefix} character.locationId "${curLoc.id}" is inactive in year ${state.year} (founded: ${curLoc.foundedYear ?? 'start'}, abandoned: ${curLoc.abandonedYear ?? 'none'})`
      );
    }

    for (const discId of state.discoveredSettlements ?? []) {
      const ds = SETTLEMENTS_BY_ID[discId];
      if (!ds) {
        errors.push(`${prefix} unknown discoveredSettlement "${discId}"`);
      } else if (!isSettlementActiveInYear(ds, state.year)) {
        errors.push(
          `${prefix} discoveredSettlement "${discId}" is inactive in year ${state.year}`
        );
      }
    }
  }

  function makeHeirloomTestState() {
    const state = createNewGame(
      {
        givenName: 'Test',
        patronymic: 'Hakonsson',
        sex: Sex.Male,
        year: 838,
        startAge: 30,
        birthplaceId: 'lade_hladir',
        socialClass: SocialClass.HersirKin,
        religion: Religion.NorsePagan,
        traits: [],
        winGoalId: 'freeform_dynasty',
        seedString: 'HEIRLOOM-ANNUAL-EFFECTS',
        startingHomeland: 'norway',
        startingOccupation: 'warrior',
        ragnarBloodline: false,
        sagaMode: true,
      },
      defaultSettings
    );
    state.activeEvent = null;
    state.pendingDeath = null;
    state.character.age = 30;
    state.character.stats = {
      health: 50,
      strength: 50,
      cunning: 50,
      charisma: 50,
      honor: 50,
      wyrd: 50,
      faith: 50,
      happiness: 50,
    };
    state.character.skills = {
      combat: 40,
      seamanship: 40,
      farming: 40,
      trade: 40,
      diplomacy: 40,
      law: 40,
      craft: 40,
      skaldcraft: 40,
      seidr: 40,
    };
    state.realm.fame = 25;
    state.realm.holdings = [];
    state.heirlooms = [];
    return state;
  }

  let annualHeirloomsVerified = 0;
  for (const heirloom of SAGA_HEIRLOOMS.filter((item) => item.annualEffects)) {
    const baseline = makeHeirloomTestState();
    const withHeirloom = structuredClone(baseline);
    withHeirloom.heirlooms = [heirloom.id];
    const expected = heirloom.annualEffects;
    const baselineAfter = advanceTurn(baseline);
    const heirloomAfter = advanceTurn(withHeirloom);

    if (heirloomAfter.realm.fame - baselineAfter.realm.fame !== (expected.fame ?? 0)) {
      errors.push(`[${heirloom.id}] Annual fame effect did not match its catalog value`);
    }
    for (const [stat, bonus] of Object.entries(expected.stats ?? {})) {
      if (heirloomAfter.character.stats[stat] - baselineAfter.character.stats[stat] !== bonus) {
        errors.push(`[${heirloom.id}] Annual ${stat} effect did not match its catalog value`);
      }
    }
    for (const [skill, bonus] of Object.entries(expected.skills ?? {})) {
      if (heirloomAfter.character.skills[skill] - baselineAfter.character.skills[skill] !== bonus) {
        errors.push(`[${heirloom.id}] Annual ${skill} effect did not match its catalog value`);
      }
    }
    annualHeirloomsVerified++;
  }

  const migrationState = makeHeirloomTestState();
  migrationState.heirlooms = [
    'ragna_ring_of_seine',
    'lagertha_spear_of_gaular',
    'floki_sunstone_compass',
    'rollo_seine_charter',
  ];
  const migratedState = migrateGameState(migrationState);
  const migratedHeirlooms = migratedState?.heirlooms ?? [];
  const expectedMigratedHeirlooms = [
    'ragnar_serpent_armring',
    'lagertha_hlathgerd_spear',
    'floki_raven_lodestone',
    'rollo_rouen_armring',
  ];
  if (
    expectedMigratedHeirlooms.some((id) => !migratedHeirlooms.includes(id)) ||
    migratedHeirlooms.length !== expectedMigratedHeirlooms.length
  ) {
    errors.push('[Save migration] Legacy heirloom IDs did not migrate to the canonical IDs');
  }

  console.log('=== HEADLESS ENGINE SMOKE TEST (100-YEAR CAMPAIGNS) ===');
  console.log(
    `Heirloom annual effects verified: ${annualHeirloomsVerified}/${SAGA_HEIRLOOMS.filter((h) => h.annualEffects).length}`
  );
  console.log(
    `Legacy heirloom IDs migrated: ${migratedHeirlooms.length}/${expectedMigratedHeirlooms.length}`
  );

  for (const cfg of CAMPAIGNS) {
    let state = createNewGame(
      {
        givenName: 'Sigurd',
        patronymic: 'Hakonsson',
        sex: Sex.Male,
        year: cfg.startYear,
        startAge: 18,
        birthplaceId: cfg.birthplaceId,
        socialClass: SocialClass.HersirKin,
        religion: Religion.NorsePagan,
        traits: ['brave', 'seafarer'],
        winGoalId: 'freeform_dynasty',
        seedString: cfg.seed,
        startingHomeland: cfg.homeland,
        startingOccupation: 'warrior',
        ragnarBloodline: cfg.ragnarBloodline,
        bloodlineBranch: cfg.bloodlineBranch,
        sagaMode: cfg.sagaMode,
      },
      defaultSettings
    );

    const seenBeats = new Set(state.legendState?.deliveredBeatIds ?? []);
    validateStateInvariants(state, cfg.name, 0);

    for (let step = 1; step <= 100; step++) {
      // Perform a deterministic yearly action before advancing the turn
      const skills = ['combat', 'seamanship', 'law', 'trade', 'farming'];
      state = executeTrainSkillAction(state, skills[step % skills.length]);

      if (step % 3 === 0 && state.realm.silver >= 18) {
        state = executeGeneralAction(state, 'hold_feast');
      } else if (step % 4 === 0 && state.realm.longships > 0 && state.realm.hirdWarriors >= 8) {
        state = executeRaidAction(state, 'lindisfarne', 'shield_wall');
      } else if (step % 5 === 0) {
        state = executeSailAction(state, 'kaupang');
      }

      // If an action triggered death, handle heir succession
      if (state.pendingDeath) {
        const heirs = state.pendingDeath.eligibleHeirs ?? [];
        if (heirs.length > 0) {
          state = continueAsHeir(state, heirs[0].id);
          totalSuccessions++;
        } else {
          // Spawn an emergency cousin heir to keep the 100-year clock running
          state.pendingDeath.eligibleHeirs = [
            {
              id: `emergency_heir_${step}`,
              name: 'Harald Sigurdsson',
              sex: Sex.Male,
              role: 'Sibling',
              age: 20,
              alive: true,
              affinity: 80,
              socialClass: state.character.socialClass,
              locationId: state.character.locationId,
              traits: ['brave', 'oath_keeper'],
              isHeirEligible: true,
            },
          ];
          state = continueAsHeir(state, `emergency_heir_${step}`);
          totalSuccessions++;
        }
      }

      // Advance the year
      state = advanceTurn(state);
      totalYearsSimulated++;

      // Check newly delivered legend beats for this year
      if (state.sagaMode && state.legendState) {
        for (const beatId of state.legendState.deliveredBeatIds ?? []) {
          if (!seenBeats.has(beatId)) {
            seenBeats.add(beatId);
            totalLegendBeatsVerified++;
            const beat = ALL_LEGEND_BEATS_BY_ID[beatId];
            if (!beat) {
              errors.push(`[${cfg.name} @ ${state.year}] Unknown delivered beat "${beatId}"`);
              continue;
            }
            const legend = LEGENDS_BY_ID[beat.legendId];
            if (!legend) {
              errors.push(`[${cfg.name} @ ${state.year}] Beat "${beatId}" has unknown legend "${beat.legendId}"`);
              continue;
            }
            if (beat.year < legend.birthYear || beat.year > legend.deathYear) {
              errors.push(
                `[${cfg.name} @ ${state.year}] Beat "${beatId}" (${beat.year}) outside legend "${legend.id}" lifespan (${legend.birthYear}–${legend.deathYear})`
              );
            }
            if (state.year < legend.birthYear || state.year > legend.deathYear + 3) {
              errors.push(
                `[${cfg.name} @ ${state.year}] Beat "${beatId}" delivered in year ${state.year} outside legend "${legend.id}" lifespan + travel delay (${legend.birthYear}–${legend.deathYear + 3})`
              );
            }
          }
        }
      }

      // Resolve active event if present
      if (state.activeEvent) {
        const choices = state.activeEvent.choices ?? [];
        const pickIdx = step % choices.length;
        state = resolveEventChoice(state, choices[pickIdx].id);
        totalEventsResolved++;
      }

      // Handle any death triggered by advanceTurn or resolveEventChoice
      if (state.pendingDeath) {
        const heirs = state.pendingDeath.eligibleHeirs ?? [];
        if (heirs.length > 0) {
          state = continueAsHeir(state, heirs[0].id);
          totalSuccessions++;
        } else {
          state.pendingDeath.eligibleHeirs = [
            {
              id: `emergency_heir_turn_${step}`,
              name: 'Torstein Sigurdsson',
              sex: Sex.Male,
              role: 'Sibling',
              age: 19,
              alive: true,
              affinity: 82,
              socialClass: state.character.socialClass,
              locationId: state.character.locationId,
              traits: ['brave', 'seafarer'],
              isHeirEligible: true,
            },
          ];
          state = continueAsHeir(state, `emergency_heir_turn_${step}`);
          totalSuccessions++;
        }
      }

      validateStateInvariants(state, cfg.name, step);
    }

    console.log(
      `  PASS: ${cfg.name.padEnd(50)} | Final Year: ${state.year} AD | Gen: ${state.generation} | Fame: ${state.realm.fame} | Discovered: ${state.discoveredSettlements.length}`
    );
  }

  console.log(`\nSummary:`);
  console.log(`  Campaigns simulated:      ${CAMPAIGNS.length} (100 years each = ${totalYearsSimulated} turns)`);
  console.log(`  Events resolved:          ${totalEventsResolved}`);
  console.log(`  Dynasty successions:      ${totalSuccessions}`);
  console.log(`  Legend beats verified:    ${totalLegendBeatsVerified}`);

  if (errors.length > 0) {
    console.error(`\nFAILED with ${errors.length} error(s):`);
    for (const err of errors) console.error(`  ERROR: ${err}`);
    process.exit(1);
  }

  console.log(
    '\nPASS: 0 engine invariant errors across all 100-year campaigns (no crashes, no NaN stats/skills, all stats/skills in [0, 100], all settlements active in year, all legend beats within [birthYear, deathYear]).'
  );
}

main().catch((err) => {
  console.error('Unhandled error in test-engine.mjs:', err);
  process.exit(1);
});
