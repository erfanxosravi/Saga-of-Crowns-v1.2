#!/usr/bin/env node
import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const SEASON_ORDER = {
  Spring: 0,
  Summer: 1,
  Autumn: 2,
  Winter: 3,
};

const TARGET_12_LEGENDS = [
  'rollo_normandy',
  'ivar_boneless',
  'bjorn_ironside',
  'halfdan_ragnarsson',
  'ubba_ragnarsson',
  'hvitserk_ragnarsson',
  'sigurd_snake_eye',
  'aslaug_kraka',
  'king_ecbert_wessex',
  'king_aella_northumbria',
  'alfred_the_great',
  'guthrum_danelaw',
];

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

async function main() {
  const [
    { LEGENDS_REGISTRY, LEGENDS_BY_ID },
    { SETTLEMENTS_BY_ID, isSettlementActiveInYear },
    { LEGEND_ENCOUNTER_EVENTS, LEGEND_ENCOUNTERS_FA },
    { SAGA_HEIRLOOMS_MAP },
  ] = await Promise.all([
    loadModule('src/data/legendsRegistry.ts'),
    loadModule('src/data/geography.ts'),
    loadModule('src/data/legendEncounters.ts'),
    loadModule('src/data/lothbrokCycle.ts'),
  ]);

  const errors = [];
  const warnings = [];
  const seenBeatIds = new Set();

  for (const legend of LEGENDS_REGISTRY) {
    if (!SETTLEMENTS_BY_ID[legend.homeSettlementId]) {
      errors.push(
        `[${legend.id}] Invalid homeSettlementId "${legend.homeSettlementId}" (not in SETTLEMENTS_BY_ID)`
      );
    }

    if (legend.birthYear >= legend.deathYear) {
      errors.push(
        `[${legend.id}] birthYear (${legend.birthYear}) must be < deathYear (${legend.deathYear})`
      );
    }

    const timeline = legend.timeline ?? [];
    if (!Array.isArray(timeline) || timeline.length === 0) {
      errors.push(`[${legend.id}] Legend has no timeline beats`);
      continue;
    }

    if (TARGET_12_LEGENDS.includes(legend.id) && timeline.length < 4) {
      errors.push(
        `[${legend.id}] Target legend has only ${timeline.length} timeline beats (expected >= 4)`
      );
    }

    let prevKey = -Infinity;
    let prevLabel = '';

    for (const beat of timeline) {
      if (seenBeatIds.has(beat.id)) {
        errors.push(`[${legend.id}] Duplicate beat ID "${beat.id}"`);
      }
      seenBeatIds.add(beat.id);

      if (beat.legendId && beat.legendId !== legend.id) {
        errors.push(
          `[${legend.id}] Beat "${beat.id}" has mismatched legendId "${beat.legendId}"`
        );
      }

      if (beat.year < legend.birthYear) {
        errors.push(
          `[${legend.id}] Beat "${beat.id}" (${beat.year}) occurs before birthYear (${legend.birthYear})`
        );
      }

      if (beat.year > legend.deathYear) {
        errors.push(
          `[${legend.id}] Beat "${beat.id}" (${beat.year}) occurs after deathYear (${legend.deathYear})`
        );
      }

      if (!beat.title || !beat.titleFa || !beat.text || !beat.textFa) {
        errors.push(`[${legend.id}] Beat "${beat.id}" is missing English or Persian title/text`);
      }

      const seasonIdx = SEASON_ORDER[beat.season];
      if (seasonIdx === undefined) {
        errors.push(`[${legend.id}] Beat "${beat.id}" has invalid season "${beat.season}"`);
      }

      const key = beat.year * 10 + (seasonIdx ?? 0);
      if (key < prevKey) {
        errors.push(
          `[${legend.id}] Non-monotonic beat order at "${beat.id}" (${beat.year} ${beat.season} after ${prevLabel})`
        );
      }
      prevKey = key;
      prevLabel = `${beat.year} ${beat.season}`;

      const beatSettlement = SETTLEMENTS_BY_ID[beat.settlementId];
      const isPreLandnamExploration =
        legend.id === 'floki_raven_sailor' && beatSettlement?.regionGroup === 'North Atlantic';
      if (!beatSettlement) {
        errors.push(
          `[${legend.id}] Beat "${beat.id}" references invalid settlementId "${beat.settlementId}"`
        );
      } else if (!isPreLandnamExploration && !isSettlementActiveInYear(beatSettlement, beat.year)) {
        errors.push(
          `[${legend.id}] Beat "${beat.id}" (${beat.year}) references settlement "${beat.settlementId}" outside its active years (founded: ${beatSettlement.foundedYear ?? 'start'}, abandoned: ${beatSettlement.abandonedYear ?? 'none'})`
        );
      }
    }

    for (const rel of legend.relationships ?? []) {
      if (!LEGENDS_BY_ID[rel.legendId]) {
        warnings.push(
          `[${legend.id}] Relationship references non-registry legendId "${rel.legendId}"`
        );
      }
    }
  }

  // Validate encounter events
  const seenEncIds = new Set();
  const encounterCountByLegend = {};

  for (const ev of LEGEND_ENCOUNTER_EVENTS ?? []) {
    if (seenEncIds.has(ev.id)) {
      errors.push(`Duplicate encounter event ID "${ev.id}"`);
    }
    seenEncIds.add(ev.id);

    const fa = LEGEND_ENCOUNTERS_FA?.[ev.id];
    if (!fa || !fa.title || !fa.text) {
      errors.push(`[Encounter ${ev.id}] Missing Persian translation in LEGEND_ENCOUNTERS_FA`);
    }

    if (!ev.sagaVsChronicleNote || !/DOCUMENTED|CONTESTED|LEGENDARY/.test(ev.sagaVsChronicleNote)) {
      errors.push(
        `[Encounter ${ev.id}] Missing or invalid sagaVsChronicleNote (must include DOCUMENTED/CONTESTED/LEGENDARY)`
      );
    }

    if (!Array.isArray(ev.choices) || ev.choices.length < 2) {
      errors.push(`[Encounter ${ev.id}] Must have at least 2 choices`);
    }

    const touchedLegends = new Set();
    for (const ch of ev.choices ?? []) {
      const chFa = fa?.choices?.[ch.id];
      if (!chFa || !chFa.label || !chFa.outcomeText) {
        errors.push(`[Encounter ${ev.id}] Choice "${ch.id}" missing Persian label or outcomeText`);
      }
      const delta = ch.effects?.legendStandingDelta;
      if (delta?.legendId) {
        if (!LEGENDS_BY_ID[delta.legendId]) {
          errors.push(
            `[Encounter ${ev.id}] Choice "${ch.id}" references unknown legendId "${delta.legendId}"`
          );
        }
        touchedLegends.add(delta.legendId);
      }
      for (const hid of ch.effects?.addHeirloomIds ?? []) {
        if (!SAGA_HEIRLOOMS_MAP[hid]) {
          errors.push(
            `[Encounter ${ev.id}] Choice "${ch.id}" grants unknown heirloomId "${hid}"`
          );
        }
      }
    }

    for (const l of LEGENDS_REGISTRY) {
      const prefix = l.id.split('_')[0];
      if (
        touchedLegends.has(l.id) ||
        ev.id.includes(`_${prefix}_`) ||
        ev.id.startsWith(`leg_enc_${prefix}`)
      ) {
        encounterCountByLegend[l.id] = (encounterCountByLegend[l.id] || 0) + 1;
      }
    }
  }

  for (const targetId of TARGET_12_LEGENDS) {
    const count = encounterCountByLegend[targetId] || 0;
    if (count < 2) {
      errors.push(
        `[${targetId}] Target legend has only ${count} encounter event(s) (expected >= 2)`
      );
    }
  }

  console.log('=== LEGEND CONSISTENCY CHECK ===');
  console.log(`Total Legends Registered: ${LEGENDS_REGISTRY.length}`);
  console.log(`Total Timeline Beats:     ${seenBeatIds.size}`);
  console.log(`Total Encounter Events:   ${(LEGEND_ENCOUNTER_EVENTS ?? []).length}\n`);

  for (const phase of [1, 2, 3]) {
    const inPhase = LEGENDS_REGISTRY.filter((l) => l.phase === phase);
    console.log(`Phase ${phase}: ${inPhase.length} legend(s)`);
    for (const l of inPhase) {
      const encCount = encounterCountByLegend[l.id] || 0;
      console.log(
        `  - ${l.id.padEnd(24)} (${l.birthYear}–${l.deathYear} AD, home: ${l.homeSettlementId.padEnd(18)}) | beats: ${String(l.timeline.length).padStart(2)} | encounters: ${encCount}`
      );
    }
  }

  if (warnings.length > 0) {
    console.log('\nWarnings:');
    for (const w of warnings) console.log(`  WARN: ${w}`);
  }

  if (errors.length > 0) {
    console.error(`\nFAILED with ${errors.length} error(s):`);
    for (const err of errors) console.error(`  ERROR: ${err}`);
    process.exit(1);
  }

  console.log(
    '\nPASS: 0 legend consistency errors (all beats within [birthYear, deathYear], monotonic dates, >=4 beats & >=2 bilingual encounters for all 12 target legends, valid heirlooms & settlements).'
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
