import {
  BITLIFE_ACHIEVEMENTS,
  evaluateLifeReportTitle,
  resolveDeathCardDetails,
} from '../data/deathsAndAchievements';
import { ALL_EVENTS, EVENTS_BY_ID } from '../data/events';
import {
  calculateVoyageMetrics,
  SETTLEMENTS,
  SETTLEMENTS_BY_ID,
} from '../data/geography';
import { WORLD_CHRONICLES } from '../data/historicalTimeline';
import {
  ALL_TRAITS_MAP,
  BUILDINGS_CATALOG,
  FEMALE_NAMES_BY_REGION,
  MALE_NAMES_BY_REGION,
  makePatronymic,
  SOCIAL_CLASS_CONFIG,
  TITLE_LADDER,
  WIN_GOALS,
} from '../data/namesAndTraits';
import { EVENTS_FA } from '../i18n/eventsFa';
import {
  BUILDINGS_FA,
  formatDynastyName,
  formatPersonName,
  SETTLEMENTS_FA,
  SOCIAL_CLASS_FA,
  TRAITS_FA,
  WIN_GOALS_FA,
  WORLD_CHRONICLES_FA,
} from '../i18n/gameDataFa';
import {
  EPITHET_FA,
  RELIGION_LABELS,
  ROLE_LABELS,
  SEASON_LABELS,
  SHORT_TITLE_LABELS,
  SKILL_LABELS,
  STAT_LABELS,
  TITLE_LABELS,
} from '../i18n/ui';
import {
  BattleIntent,
  BattleState,
  BattleTactic,
  BuildingType,
  CharacterAppearance,
  CharacterState,
  ContentIntensity,
  Difficulty,
  DynastyAncestor,
  EventConditions,
  FullGameState,
  GameEvent,
  GameScreen,
  GameSettings,
  Holding,
  Language,
  LogEntry,
  PersonalStats,
  PlotType,
  RegionGroup,
  RelationshipPerson,
  Religion,
  Season,
  SettlementStatus,
  Sex,
  SkillKey,
  SkillsState,
  SocialClass,
  StartingHomeland,
  StartingOccupation,
  TimeStepMode,
  TitleRank,
  TributeBurden,
} from '../types/game';
import { hashSeedString, SeededRNG } from './prng';
import { CURRENT_SAVE_VERSION, deriveAppearanceFromId } from './storage';

function clampStat(val: number): number {
  return Math.max(0, Math.min(100, Math.round(val)));
}

function clampSkill(val: number): number {
  return Math.max(0, Math.min(100, Math.round(val)));
}

export function getEraFromYear(year: number): 1 | 2 | 3 | 4 {
  if (year < 865) return 1;
  if (year < 954) return 2;
  if (year < 1016) return 3;
  return 4;
}

function getNearbyDiscoveredIds(startId: string, year: number): string[] {
  const start = SETTLEMENTS_BY_ID[startId] ?? SETTLEMENTS[0];
  const discovered = new Set<string>([start.id]);
  for (const s of SETTLEMENTS) {
    if (s.foundedYear && year < s.foundedYear - 5) continue;
    const sameRegion = s.regionGroup === start.regionGroup;
    const dLat = Math.abs(s.lat - start.lat);
    const dLon = Math.abs(s.lon - start.lon);
    if (sameRegion || (dLat < 6.5 && dLon < 13)) {
      discovered.add(s.id);
    }
  }
  // Major emporia known by rumor to most northern mariners
  ['hedeby', 'kaupang', 'birka', 'jorvik', 'dublin'].forEach((id) => discovered.add(id));
  return Array.from(discovered);
}

export interface NewGameParams {
  givenName: string;
  patronymic?: string;
  sex: Sex;
  year: number;
  startAge: number;
  birthplaceId: string;
  socialClass: SocialClass;
  religion: Religion;
  traits: string[];
  winGoalId: string;
  seedString: string;
  appearance?: CharacterAppearance;
  bonusSilver?: number;
  bonusShips?: number;
  bonusWarriors?: number;
  startingFlags?: string[];
  startingHomeland?: StartingHomeland;
  startingOccupation?: StartingOccupation;
}

function generateInitialFamily(
  rng: SeededRNG,
  region: RegionGroup,
  locationId: string,
  socialClass: SocialClass,
  playerAge: number,
  fatherNameInput?: string
): { fatherName: string; relationships: RelationshipPerson[] } {
  const malePool = MALE_NAMES_BY_REGION[region];
  const femalePool = FEMALE_NAMES_BY_REGION[region];

  const fatherGiven = fatherNameInput || rng.pick(malePool);
  const grandFather = rng.pick(malePool);
  const motherGiven = rng.pick(femalePool);
  const matGrandFather = rng.pick(malePool);

  const fatherAge = playerAge + rng.int(20, 32);
  const motherAge = playerAge + rng.int(18, 28);

  const relationships: RelationshipPerson[] = [
    {
      id: `rel_father_${rng.int(1000, 9999)}`,
      name: `${fatherGiven} ${makePatronymic(grandFather, Sex.Male)}`,
      sex: Sex.Male,
      role: 'Father',
      age: fatherAge,
      alive: fatherAge < 62 ? rng.chance(0.78) : rng.chance(0.35),
      affinity: rng.int(65, 92),
      socialClass,
      locationId,
      traits: [rng.pick(['brave', 'strong_limbed', 'oath_keeper', 'seafarer'])],
      causeOfDeath: 'Fell in an earlier coastal skirmish',
      causeOfDeathFa: 'کشته‌شده در یک درگیری ساحلی پیشین',
    },
    {
      id: `rel_mother_${rng.int(1000, 9999)}`,
      name: `${motherGiven} ${makePatronymic(matGrandFather, Sex.Female)}`,
      sex: Sex.Female,
      role: 'Mother',
      age: motherAge,
      alive: motherAge < 64 ? rng.chance(0.84) : rng.chance(0.45),
      affinity: rng.int(72, 96),
      socialClass,
      locationId,
      traits: [rng.pick(['cunning', 'charismatic', 'law_speaker', 'pious'])],
      causeOfDeath: 'Winter fever',
      causeOfDeathFa: 'تب سخت زمستانی',
    },
  ];

  // 1-2 siblings (eligible heirs!)
  const numSiblings = rng.int(1, 2);
  for (let i = 0; i < numSiblings; i++) {
    const sibSex = rng.chance(0.5) ? Sex.Male : Sex.Female;
    const sibGiven = rng.pick(sibSex === Sex.Male ? malePool : femalePool);
    const sibAge = Math.max(1, playerAge + rng.int(-5, 6));
    relationships.push({
      id: `rel_sib_${i}_${rng.int(1000, 9999)}`,
      name: `${sibGiven} ${makePatronymic(fatherGiven, sibSex)}`,
      sex: sibSex,
      role: 'Sibling',
      age: sibAge,
      alive: true,
      affinity: rng.int(58, 88),
      socialClass,
      locationId,
      traits: [rng.pick(['brave', 'cunning', 'seafarer', 'skald_tongued'])],
      isHeirEligible: true,
    });
  }

  // High-born families often start with an existing rival
  if (
    socialClass === SocialClass.HersirKin ||
    socialClass === SocialClass.JarlKin ||
    socialClass === SocialClass.Royal
  ) {
    const rivalGiven = rng.pick(malePool);
    relationships.push({
      id: `rel_rival_init_${rng.int(1000, 9999)}`,
      name: `${rivalGiven} ${makePatronymic(rng.pick(malePool), Sex.Male)}`,
      epithet: rng.pick(['the Proud', 'Crow-Nose', 'Iron-Brow', 'Skull-Splitter']),
      sex: Sex.Male,
      role: 'Rival',
      age: rng.int(22, 45),
      alive: true,
      affinity: rng.int(10, 28),
      socialClass,
      locationId,
      traits: ['wrathful'],
    });
  }

  return { fatherName: fatherGiven, relationships };
}

export function createNewGame(params: NewGameParams, settings: GameSettings): FullGameState {
  const initialSeedNum = hashSeedString(params.seedString || 'ELDSAGA');
  const rng = new SeededRNG(initialSeedNum);

  const settlement = SETTLEMENTS_BY_ID[params.birthplaceId] ?? SETTLEMENTS_BY_ID['nidaros'];
  const classCfg = SOCIAL_CLASS_CONFIG[params.socialClass];

  const extractedFather = params.patronymic
    ? params.patronymic.replace(/(sson|sdottir|son|dottir)$/i, '')
    : undefined;

  const { fatherName, relationships } = generateInitialFamily(
    rng,
    settlement.regionGroup,
    settlement.id,
    params.socialClass,
    params.startAge,
    extractedFather
  );

  const patronymic = params.patronymic?.trim() || makePatronymic(fatherName, params.sex);

  const baseStats: PersonalStats = {
    health: rng.int(72, 92),
    strength: params.startAge < 12 ? rng.int(22, 38) : rng.int(46, 68),
    cunning: rng.int(44, 68),
    charisma: rng.int(44, 68),
    honor: params.socialClass === SocialClass.Thrall ? 18 : rng.int(42, 65),
    wyrd: rng.int(45, 65),
    faith: rng.int(45, 68),
    happiness: params.socialClass === SocialClass.Thrall ? 36 : rng.int(60, 82),
  };

  const baseSkills: SkillsState = {
    combat: params.startAge < 12 ? 8 : rng.int(16, 32),
    seamanship:
      settlement.regionGroup === 'Norway' || settlement.regionGroup === 'North Atlantic'
        ? rng.int(22, 38)
        : rng.int(14, 28),
    farming: rng.int(16, 30),
    trade: settlement.baseWealth >= 8 ? rng.int(22, 36) : rng.int(12, 24),
    diplomacy: rng.int(14, 28),
    law: settlement.isThingSite ? rng.int(20, 34) : rng.int(10, 22),
    craft: rng.int(12, 25),
    skaldcraft: rng.int(10, 24),
    seidr: rng.int(4, 14),
  };

  for (const tid of params.traits) {
    const def = ALL_TRAITS_MAP[tid];
    if (!def) continue;
    if (def.statModifiers) {
      (Object.keys(def.statModifiers) as (keyof PersonalStats)[]).forEach((k) => {
        baseStats[k] = clampStat(baseStats[k] + (def.statModifiers?.[k] ?? 0));
      });
    }
    if (def.skillModifiers) {
      (Object.keys(def.skillModifiers) as (keyof SkillsState)[]).forEach((k) => {
        baseSkills[k] = clampSkill(baseSkills[k] + (def.skillModifiers?.[k] ?? 0));
      });
    }
  }

  // Homeland Gameplay Bonuses
  if (params.startingHomeland) {
    switch (params.startingHomeland) {
      case 'norway':
        baseSkills.seamanship = clampSkill(baseSkills.seamanship + 10);
        baseStats.honor = clampStat(baseStats.honor + 8);
        break;
      case 'denmark':
        baseSkills.trade = clampSkill(baseSkills.trade + 8);
        break;
      case 'sweden':
        baseSkills.combat = clampSkill(baseSkills.combat + 6);
        baseSkills.trade = clampSkill(baseSkills.trade + 6);
        break;
      case 'iceland':
        baseSkills.law = clampSkill(baseSkills.law + 14);
        baseStats.wyrd = clampStat(baseStats.wyrd + 12);
        break;
      case 'orkney':
        baseSkills.combat = clampSkill(baseSkills.combat + 8);
        baseSkills.seamanship = clampSkill(baseSkills.seamanship + 8);
        break;
      case 'normandy':
        baseSkills.diplomacy = clampSkill(baseSkills.diplomacy + 12);
        break;
      case 'rus':
        baseSkills.trade = clampSkill(baseSkills.trade + 12);
        baseSkills.combat = clampSkill(baseSkills.combat + 6);
        break;
      case 'england':
        baseSkills.farming = clampSkill(baseSkills.farming + 12);
        break;
      case 'ireland':
        baseSkills.seamanship = clampSkill(baseSkills.seamanship + 8);
        baseSkills.combat = clampSkill(baseSkills.combat + 8);
        break;
    }
  }

  // Occupation Gameplay Bonuses
  if (params.startingOccupation) {
    switch (params.startingOccupation) {
      case 'fisherman':
        baseSkills.seamanship = clampSkill(baseSkills.seamanship + 14);
        break;
      case 'farmer':
        baseSkills.farming = clampSkill(baseSkills.farming + 16);
        break;
      case 'blacksmith':
        baseSkills.craft = clampSkill(baseSkills.craft + 18);
        baseStats.strength = clampStat(baseStats.strength + 8);
        break;
      case 'merchant':
        baseSkills.trade = clampSkill(baseSkills.trade + 18);
        baseStats.cunning = clampStat(baseStats.cunning + 6);
        break;
      case 'skald':
        baseSkills.skaldcraft = clampSkill(baseSkills.skaldcraft + 20);
        baseStats.charisma = clampStat(baseStats.charisma + 10);
        break;
      case 'warrior':
        baseSkills.combat = clampSkill(baseSkills.combat + 18);
        baseStats.strength = clampStat(baseStats.strength + 8);
        break;
      case 'sailor':
        baseSkills.seamanship = clampSkill(baseSkills.seamanship + 18);
        baseSkills.combat = clampSkill(baseSkills.combat + 6);
        break;
      case 'hunter':
        baseStats.cunning = clampStat(baseStats.cunning + 14);
        baseSkills.combat = clampSkill(baseSkills.combat + 8);
        break;
      case 'seeress':
        baseSkills.seidr = clampSkill(baseSkills.seidr + 22);
        baseStats.wyrd = clampStat(baseStats.wyrd + 16);
        baseStats.faith = clampStat(baseStats.faith + 10);
        break;
      case 'noble':
        baseStats.charisma = clampStat(baseStats.charisma + 12);
        baseSkills.diplomacy = clampSkill(baseSkills.diplomacy + 10);
        break;
      case 'thrall':
        baseStats.strength = clampStat(baseStats.strength + 8);
        baseStats.health = clampStat(baseStats.health + 8);
        break;
    }
  }

  const birthYear = params.year - params.startAge;
  const holdings: Holding[] =
    classCfg.farms > 0
      ? [
          {
            settlementId: settlement.id,
            farms: classCfg.farms,
            buildings: classCfg.farms >= 4 ? ['skali_hall'] : [],
            garrison: Math.floor(classCfg.warriors / 2) || 4,
            unrest: 10,
            norsePopulationShare: 75,
            tributeBurden: 'normal',
            hostagesCount: 0,
            religiousTolerance: true,
          },
        ]
      : [];

  const dynastyBase = fatherName || params.givenName;
  const dynastyName = `House of ${dynastyBase}`;

  const charId = `char_gen1_${rng.int(1000, 9999)}`;
  const character: CharacterState = {
    id: charId,
    givenName: params.givenName.trim() || 'Sigurd',
    patronymic,
    epithet: '',
    sex: params.sex,
    age: params.startAge,
    birthYear,
    birthplaceId: settlement.id,
    locationId: settlement.id,
    socialClass: params.socialClass,
    title: classCfg.startingTitle,
    religion: params.religion,
    traits: [...params.traits],
    stats: baseStats,
    skills: baseSkills,
    appearance: params.appearance ?? deriveAppearanceFromId(charId),
    isOutlawed: false,
    raidsLed: 0,
    voyagesCompleted: 0,
    killsInHolmgang: 0,
    thingsAttended: 0,
  };

  const startingFlags = [...(params.startingFlags ?? [])];
  if (params.startAge >= 16) startingFlags.push('came_of_age');

  const sFa = SETTLEMENTS_FA[settlement.id];
  const fullNameFa = formatPersonName(`${character.givenName} ${character.patronymic}`, 'fa');
  const classFa = SOCIAL_CLASS_FA[params.socialClass]?.label ?? classCfg.label;
  const faithFa = RELIGION_LABELS.fa[character.religion];

  const openingEntry: LogEntry = {
    id: `log_init_${params.year}`,
    year: params.year,
    season: Season.Spring,
    age: params.startAge,
    locationName: `${settlement.name} (${settlement.norseName})`,
    category: 'Chronicle',
    iconType: 'crown',
    title: `A New Viking Life · ${params.year} AD`,
    titleFa: `شروع یک زندگی وایکینگی · سال ${params.year} میلادی`,
    text: `Born into ${settlement.name} as ${classCfg.label.toLowerCase()} following ${RELIGION_LABELS.en[character.religion]}. Northern seas and wild fates await.`,
    textFa: `در ${sFa?.name ?? settlement.name}، زندگی «${fullNameFa}» در جایگاه ${classFa} و پیرو «${faithFa}» شروع شد. دریاهای شمال منتظرند!`,
  };

  return {
    saveVersion: CURRENT_SAVE_VERSION,
    screen: GameScreen.PLAYING,
    seedString: params.seedString,
    rngState: rng.getState(),
    year: params.year,
    season: Season.Spring,
    generation: 1,
    dynastyName,
    winGoalId: params.winGoalId,
    actionsRemainingThisTurn: 2,
    yearlyActivitiesUsed: {},
    builtThisYear: false,
    familyInteractionsUsed: {},
    onboardingStep: 0,
    onboardingDismissed: false,
    epilogue1066Shown: params.year > 1066,
    pending1066Epilogue: false,
    freeModeAfter1066: params.year > 1066,
    totalRaidsWon: 0,
    marriedBloodEnemy: false,
    divorcesCount: 0,
    conquestsWon: 0,
    character,
    realm: {
      silver: classCfg.silver + (params.bonusSilver ?? 0),
      landFarms: classCfg.farms,
      hirdWarriors: classCfg.warriors + (params.bonusWarriors ?? 0),
      longships: classCfg.longships + (params.bonusShips ?? 0),
      knarrs: classCfg.knarrs,
      foodStores: 24 + classCfg.farms * 14,
      population: classCfg.farms * 18 + classCfg.warriors,
      stability: 74,
      fame: params.socialClass === SocialClass.Royal ? 85 : params.socialClass === SocialClass.JarlKin ? 55 : 15,
      tradeNetworks: classCfg.knarrs > 0 ? 1 : 0,
      holdings,
      thrallsOwned: classCfg.farms >= 2 ? Math.floor(classCfg.farms / 2) : 0,
    },
    startingHomeland: params.startingHomeland,
    startingOccupation: params.startingOccupation,
    specialTitles: [],
    relationships,
    ancestors: [],
    discoveredSettlements: getNearbyDiscoveredIds(settlement.id, params.year),
    flags: startingFlags,
    divergences: [],
    divergencesFa: [],
    achievements: [],
    scheduledChains: [],
    firedUniqueEvents: [],
    lifeLog: [openingEntry],
    activeEvent: null,
    lastOutcomeBanner: null,
    pendingDeath: null,
    settings: { ...settings, timeStepMode: TimeStepMode.Year },
  };
}

function evaluateEpithet(c: CharacterState, fame: number): string {
  if (c.epithet) return c.epithet;
  if (c.traits.includes('one_eyed')) return 'the One-Eyed';
  if (c.raidsLed >= 5) return 'Sea-Wolf';
  if (c.voyagesCompleted >= 6) return 'the Far-Traveler';
  if (c.skills.skaldcraft >= 55) return 'Skald-Tongue';
  if (c.skills.law >= 55) return 'the Law-Wise';
  if (fame >= 300 && c.stats.honor >= 75) return 'Ring-Giver';
  if (c.killsInHolmgang >= 2) return 'Ironside';
  return '';
}

function evaluateAchievements(state: FullGameState, isDeadNow = false): string[] {
  const unlocked = new Set(state.achievements);
  for (const ach of BITLIFE_ACHIEVEMENTS) {
    const prog = ach.getProgress(state, isDeadNow);
    if (prog.current >= prog.target) {
      unlocked.add(ach.id);
    }
  }
  return Array.from(unlocked);
}

export function calculateLegacyScore(state: FullGameState): number {
  const rankBonus = TITLE_LADDER.indexOf(state.character.title) * 180;
  const ancestorBonus = state.ancestors.reduce((sum, a) => sum + a.fameEarned + a.holdingsCount * 35, 0);
  return Math.round(
    state.realm.fame * 2 +
      state.realm.landFarms * 45 +
      state.realm.silver * 0.8 +
      (state.realm.longships + state.realm.knarrs) * 60 +
      state.generation * 220 +
      state.achievements.length * 90 +
      rankBonus +
      ancestorBonus
  );
}

export function composeSagaObituary(state: FullGameState, causeOfDeath: string): string {
  const c = state.character;
  const birthPlace = SETTLEMENTS_BY_ID[c.birthplaceId]?.name ?? c.birthplaceId;
  const deathPlace = SETTLEMENTS_BY_ID[c.locationId]?.name ?? c.locationId;
  const fullName = `${c.givenName} ${c.patronymic}${c.epithet ? ` "${c.epithet}"` : ''}`;
  const childrenCount = state.relationships.filter((r) => r.role === 'Child' && r.alive).length;

  const deeds: string[] = [];
  if (c.raidsLed > 0) deeds.push(`led ${c.raidsLed} sea raids`);
  if (c.voyagesCompleted > 0) deeds.push(`completed ${c.voyagesCompleted} sea voyages`);
  if (state.realm.landFarms > 0) deeds.push(`held ${state.realm.landFarms} family farms`);
  if (c.thingsAttended > 0) deeds.push(`spoke ${c.thingsAttended} times at the Thing council`);

  const deedSentence =
    deeds.length > 0
      ? `In life ${c.givenName} ${deeds.join(', ')}, earning ${state.realm.fame} fame and ${state.realm.silver} silver.`
      : `Though fate granted few grand campaigns, ${c.givenName} endured harsh northern winters with quiet grit.`;

  return `Here ends the life of ${fullName}, ${TITLE_LABELS.en[c.title]} of the ${state.dynastyName}. Born at ${birthPlace} in ${c.birthYear} AD, ${c.givenName} lived ${c.age} winters under northern skies and kept faith in ${RELIGION_LABELS.en[c.religion]} until ${state.year} AD at ${deathPlace}. ${deedSentence} Cause of death: ${causeOfDeath} Leaving ${childrenCount} living child${childrenCount === 1 ? '' : 'ren'} and kin to carry the dynasty forward, poets carve these runes so the name shall never fade.`;
}

export function composeSagaObituaryFa(state: FullGameState, causeOfDeathFa: string): string {
  const c = state.character;
  const birthPlaceFa = SETTLEMENTS_FA[c.birthplaceId]?.name ?? c.birthplaceId;
  const deathPlaceFa = SETTLEMENTS_FA[c.locationId]?.name ?? c.locationId;
  const epFa = c.epithet ? EPITHET_FA[c.epithet] ?? c.epithet : '';
  const fullNameFa = `${formatPersonName(`${c.givenName} ${c.patronymic}`, 'fa')}${epFa ? ` «${epFa}»` : ''}`;
  const dynFa = formatDynastyName(state.dynastyName, 'fa');
  const givenFa = formatPersonName(c.givenName, 'fa');
  const childrenCount = state.relationships.filter((r) => r.role === 'Child' && r.alive).length;

  const deedsFa: string[] = [];
  if (c.raidsLed > 0) deedsFa.push(`فرماندهی ${c.raidsLed} غارت دریایی`);
  if (c.voyagesCompleted > 0) deedsFa.push(`${c.voyagesCompleted} سفر در امواج شمال`);
  if (state.realm.landFarms > 0) deedsFa.push(`تملک ${state.realm.landFarms} مزرعه و ملک`);
  if (c.thingsAttended > 0) deedsFa.push(`${c.thingsAttended} بار سخنرانی در شورای آزادگان (ثینگ)`);

  const deedSentenceFa =
    deedsFa.length > 0
      ? `در طول زندگی با ${deedsFa.join('، ')} توانست ${state.realm.fame} شهرت و ${state.realm.silver} سکه نقره گرد آورد.`
      : `هرچند روزگار فرصت نبردهای بزرگ را کمتر به او داد، «${givenFa}» زمستان‌های سخت شمال را با استقامت پشت سر گذاشت.`;

  return `در اینجا رشته زندگی «${fullNameFa}»، ${TITLE_LABELS.fa[c.title]} از «${dynFa}» به پایان می‌رسد. او که در سال ${c.birthYear} میلادی در ${birthPlaceFa} چشم به جهان گشود، ${c.age} زمستان زیر آسمان شمال زیست و با آیین «${RELIGION_LABELS.fa[c.religion]}» در سال ${state.year} میلادی در ${deathPlaceFa} چشم از جهان فروبست. ${deedSentenceFa} علت مرگ: ${causeOfDeathFa} اکنون با بر جای گذاشتن ${childrenCount} فرزند زنده و خویشاوندان، شاعران شمال نامش را بر سنگ رونیک جاودانه می‌سازند.`;
}

function triggerDeathState(
  state: FullGameState,
  causeOfDeath: string,
  causeOfDeathFaInput?: string,
  deathTypeId?: string
): FullGameState {
  const rawCauseFa = causeOfDeathFaInput || 'پایان‌یافتن رشته تقدیر در نبرد و سختی روزگار.';
  const deathCard = resolveDeathCardDetails(state, deathTypeId, causeOfDeath, rawCauseFa);
  const lifeTitleDef = evaluateLifeReportTitle(state);

  const obituaryProse = composeSagaObituary(state, deathCard.causeEn);
  const obituaryProseFa = composeSagaObituaryFa(state, deathCard.causeFa);
  const updatedAchievements = evaluateAchievements(state, true);
  const stateWithAch = { ...state, achievements: updatedAchievements };
  const legacyScore = calculateLegacyScore(stateWithAch);

  // Eligible heirs: living children first (oldest first), then living siblings/foster-children/sworn kin
  const eligibleHeirs = state.relationships
    .filter(
      (r) =>
        r.alive &&
        (r.role === 'Child' ||
          r.role === 'Foster-Child' ||
          r.role === 'Sibling' ||
          r.role === 'Sworn Brother' ||
          r.role === 'Sworn Sister')
    )
    .sort((a, b) => {
      const priority = (role: RelationshipPerson['role']) =>
        role === 'Child' ? 0 : role === 'Foster-Child' ? 1 : role === 'Sibling' ? 2 : 3;
      const diff = priority(a.role) - priority(b.role);
      return diff !== 0 ? diff : b.age - a.age;
    });

  // If no living kin exist at all and the player has hird warriors or farms, allow adopting a loyal household kinsman!
  const finalHeirs = [...eligibleHeirs];
  if (finalHeirs.length === 0 && (state.realm.hirdWarriors > 0 || state.realm.landFarms > 0)) {
    const loc = SETTLEMENTS_BY_ID[state.character.locationId] ?? SETTLEMENTS[0];
    const rng = new SeededRNG(state.rngState);
    const heirGiven = rng.pick(MALE_NAMES_BY_REGION[loc.regionGroup]);
    finalHeirs.push({
      id: `rel_cousin_${state.year}`,
      name: `${heirGiven} ${makePatronymic(state.character.givenName, Sex.Male)}`,
      sex: Sex.Male,
      role: 'Foster-Child',
      age: 19,
      alive: true,
      affinity: 75,
      socialClass: state.character.socialClass === SocialClass.Thrall ? SocialClass.Karl : state.character.socialClass,
      locationId: state.character.locationId,
      traits: ['brave', 'oath_keeper'],
      isHeirEligible: true,
    });
  }

  const fullNameFa = formatPersonName(
    `${state.character.givenName} ${state.character.patronymic}`,
    'fa'
  );

  const deathLog: LogEntry = {
    id: `log_death_${state.year}_${state.character.id}`,
    year: state.year,
    season: state.season,
    age: state.character.age,
    locationName: SETTLEMENTS_BY_ID[state.character.locationId]?.name ?? state.character.locationId,
    category: 'Illness & Death',
    iconType: 'skull',
    title: `End of a Life · ${state.year} AD`,
    titleFa: `پایان یک زندگی · سال ${state.year} میلادی`,
    text: `${state.character.givenName} ${state.character.patronymic} died at age ${state.character.age}: ${deathCard.causeEn} ${deathCard.closingEn}`,
    textFa: `«${fullNameFa}» در ${state.character.age} سالگی رفت آن دنیا: ${deathCard.causeFa} ${deathCard.closingFa}`,
    isDanger: true,
  };

  return {
    ...stateWithAch,
    activeEvent: null,
    lifeLog: [...state.lifeLog, deathLog],
    pendingDeath: {
      causeOfDeath: deathCard.causeEn,
      causeOfDeathFa: deathCard.causeFa,
      deathTypeId: deathCard.deathTypeId,
      closingLine: deathCard.closingEn,
      closingLineFa: deathCard.closingFa,
      lifeTitle: lifeTitleDef.titleEn,
      lifeTitleFa: lifeTitleDef.titleFa,
      obituaryProse,
      obituaryProseFa,
      legacyScore,
      eligibleHeirs: finalHeirs,
    },
  };
}

export function evaluateEventConditions(
  cond: EventConditions,
  state: FullGameState,
  eventId?: string
): boolean {
  const c = state.character;
  const r = state.realm;
  const loc = SETTLEMENTS_BY_ID[c.locationId];
  const era = getEraFromYear(state.year);

  if (cond.exactYear !== undefined && cond.exactYear !== state.year) return false;
  if (cond.yearRange && (state.year < cond.yearRange[0] || state.year > cond.yearRange[1])) {
    return false;
  }
  if (cond.eras && !cond.eras.includes(era)) return false;
  if (cond.ageMin !== undefined && c.age < cond.ageMin) return false;
  if (cond.ageMax !== undefined && c.age > cond.ageMax) return false;
  if (cond.sex && c.sex !== cond.sex) return false;
  if (cond.regions && loc && !cond.regions.includes(loc.regionGroup)) return false;
  if (cond.settlementIds && !cond.settlementIds.includes(c.locationId)) return false;
  if (cond.classes && !cond.classes.includes(c.socialClass)) return false;
  if (cond.religions && !cond.religions.includes(c.religion)) return false;
  if (
    cond.minTitleRankIndex !== undefined &&
    TITLE_LADDER.indexOf(c.title) < cond.minTitleRankIndex
  ) {
    return false;
  }
  if (cond.minSilver !== undefined && r.silver < cond.minSilver) return false;
  if (cond.minFame !== undefined && r.fame < cond.minFame) return false;
  if (cond.minWarriors !== undefined && r.hirdWarriors < cond.minWarriors) return false;
  if (cond.minShips !== undefined && r.longships + r.knarrs < cond.minShips) return false;
  if (cond.maxStability !== undefined && r.stability > cond.maxStability) return false;
  if (cond.requiredTraits && !cond.requiredTraits.every((t) => c.traits.includes(t))) return false;
  if (cond.blockedByTraits && cond.blockedByTraits.some((t) => c.traits.includes(t))) return false;
  if (cond.requiredFlags && !cond.requiredFlags.every((f) => state.flags.includes(f))) return false;
  if (cond.blockedByFlags && cond.blockedByFlags.some((f) => state.flags.includes(f))) return false;
  if (cond.uniqueOncePerCampaign && eventId && state.firedUniqueEvents.includes(eventId)) {
    return false;
  }

  return true;
}

function isEventEligible(ev: GameEvent, state: FullGameState): boolean {
  if (ev.conditions && !evaluateEventConditions(ev.conditions, state, ev.id)) {
    return false;
  }

  const c = state.character;
  const loc = SETTLEMENTS_BY_ID[c.locationId];
  const era = getEraFromYear(state.year);

  if (ev.exactYear !== undefined && ev.exactYear !== state.year) return false;
  if (ev.yearRange && (state.year < ev.yearRange[0] || state.year > ev.yearRange[1])) return false;
  if (ev.eras && !ev.eras.includes(era)) return false;
  if (ev.ageMin !== undefined && c.age < ev.ageMin) return false;
  if (ev.ageMax !== undefined && c.age > ev.ageMax) return false;
  if (ev.sex && c.sex !== ev.sex) return false;
  if (ev.regions && loc && !ev.regions.includes(loc.regionGroup)) return false;
  if (ev.settlementIds && !ev.settlementIds.includes(c.locationId)) return false;
  if (ev.classes && !ev.classes.includes(c.socialClass)) return false;
  if (ev.religions && !ev.religions.includes(c.religion)) return false;
  if (
    ev.minTitleRankIndex !== undefined &&
    TITLE_LADDER.indexOf(c.title) < ev.minTitleRankIndex
  ) {
    return false;
  }
  if (ev.requiredTraits && !ev.requiredTraits.every((t) => c.traits.includes(t))) return false;
  if (ev.blockedByTraits && ev.blockedByTraits.some((t) => c.traits.includes(t))) return false;
  if (ev.requiredFlags && !ev.requiredFlags.every((f) => state.flags.includes(f))) return false;
  if (ev.blockedByFlags && ev.blockedByFlags.some((f) => state.flags.includes(f))) return false;

  // Historical set-pieces and coming-of-age only fire once
  if (ev.category === 'Historical Set-Piece' && state.firedUniqueEvents.includes(ev.id)) {
    return false;
  }

  return true;
}

const SEASON_ORDER: Season[] = [Season.Spring, Season.Summer, Season.Autumn, Season.Winter];

function pickAutomaticSeason(rng: SeededRNG, year: number, chosenEvent: GameEvent | null): Season {
  if (chosenEvent) {
    if (chosenEvent.category === 'Raiding' || chosenEvent.category === 'Voyage & Sea') {
      return rng.chance(0.55)
        ? Season.Summer
        : rng.chance(0.6)
          ? Season.Autumn
          : rng.chance(0.5)
            ? Season.Spring
            : Season.Winter;
    }
    if (chosenEvent.category === 'Illness & Death') {
      return rng.chance(0.65) ? Season.Winter : Season.Autumn;
    }
    if (chosenEvent.category === 'Farm Life') {
      return rng.chance(0.55) ? Season.Spring : Season.Autumn;
    }
  }
  const offset = (year + rng.int(0, 2)) % SEASON_ORDER.length;
  return SEASON_ORDER[offset];
}

export function dismissOnboarding(state: FullGameState): FullGameState {
  return {
    ...state,
    onboardingDismissed: true,
    onboardingStep: 3,
  };
}

export function dismiss1066Epilogue(state: FullGameState): FullGameState {
  return {
    ...state,
    pending1066Epilogue: false,
    freeModeAfter1066: true,
  };
}

export function hasBoathouse(state: FullGameState): boolean {
  return state.realm.holdings.some((h) => h.buildings.includes('boathouse_naust'));
}

export function isFortifiedEnemyCity(state: FullGameState, settlementId: string): boolean {
  const s = SETTLEMENTS_BY_ID[settlementId];
  if (!s || s.baseDefense < 7) return false;
  return !state.realm.holdings.some((h) => h.settlementId === settlementId && h.farms > 0);
}

export function advanceTurn(state: FullGameState): FullGameState {
  if (state.activeEvent || state.pendingDeath) return state;

  const rng = new SeededRNG(state.rngState);
  const nextYear = state.year + 1;
  let nextSeason = SEASON_ORDER[(SEASON_ORDER.indexOf(state.season) + 1) % SEASON_ORDER.length];

  const nextLogs: LogEntry[] = [...state.lifeLog];
  const yearlySideNotices: LogEntry[] = [];
  const loc = SETTLEMENTS_BY_ID[state.character.locationId] ?? SETTLEMENTS[0];

  const char: CharacterState = {
    ...state.character,
    age: state.character.age + 1,
    stats: { ...state.character.stats },
    skills: { ...state.character.skills },
    traits: [...state.character.traits],
  };

  const realm = {
    ...state.realm,
    holdings: state.realm.holdings.map((h) => ({ ...h, buildings: [...h.buildings] })),
  };

  let relationships = state.relationships.map((r) => ({ ...r }));

  // 1. Estate, Thralls, Upkeep & Building Annual Economy
  const warmPeriodBonus = nextYear >= 950 ? 1.15 : 1.0;
  const harvestGrain = Math.round(
    realm.landFarms * (8 + char.skills.farming * 0.12) * warmPeriodBonus
  );
  const thrallFood = (realm.thrallsOwned ?? 0) * 2;
  const thrallSilver = (realm.thrallsOwned ?? 0) * 1;
  const warriorFoodUpkeep = Math.round(realm.hirdWarriors * 0.55);
  realm.foodStores = Math.max(
    0,
    realm.foodStores + harvestGrain + thrallFood - warriorFoodUpkeep - 4
  );

  let buildingSilver = 0;
  let buildingFame = 0;
  let buildingStability = 0;
  let hasBoathouseNow = false;
  let holdingTributeSilver = 0;

  const currentStatuses: Record<string, SettlementStatus> = { ...(state.settlementStatuses ?? {}) };
  const currentTributaries = [...(state.tributaries ?? [])];

  const processedHoldings: Holding[] = [];
  let lostHoldingsCount = 0;

  for (const rawHolding of realm.holdings) {
    const h: Holding = {
      ...rawHolding,
      buildings: [...rawHolding.buildings],
      unrest: rawHolding.unrest ?? 15,
      norsePopulationShare: rawHolding.norsePopulationShare ?? 65,
      tributeBurden: rawHolding.tributeBurden ?? 'normal',
      hostagesCount: rawHolding.hostagesCount ?? 0,
      localMarriageAlliance: rawHolding.localMarriageAlliance ?? false,
      religiousTolerance: rawHolding.religiousTolerance ?? true,
      garrison: rawHolding.garrison ?? 4,
    };

    if (h.buildings.includes('kaupang_market')) buildingSilver += 18;
    if (h.buildings.includes('boathouse_naust')) hasBoathouseNow = true;
    if (h.buildings.includes('skali_hall')) {
      buildingFame += 3;
      buildingStability += 6;
    }
    if (h.buildings.includes('ring_fortress')) {
      buildingStability += 8;
    }
    if (h.buildings.includes('pagan_hof') && char.religion === Religion.NorsePagan) {
      char.stats.faith = clampStat(char.stats.faith + 5);
      char.stats.honor = clampStat(char.stats.honor + 4);
    }
    if (h.buildings.includes('stave_church') && char.religion === Religion.Christian) {
      char.stats.faith = clampStat(char.stats.faith + 5);
    }

    // Tribute income and unrest
    let tSilver = 4;
    let tUnrest = 2;
    if (h.tributeBurden === 'extortionate') {
      tSilver = 18;
      tUnrest = 16;
    } else if (h.tributeBurden === 'heavy') {
      tSilver = 10;
      tUnrest = 9;
    } else if (h.tributeBurden === 'light') {
      tSilver = 1;
      tUnrest = -4;
    } else if (h.tributeBurden === 'none') {
      tSilver = 0;
      tUnrest = -8;
    }
    holdingTributeSilver += tSilver;

    // Unrest modifiers
    let unrestDelta = 3 + tUnrest;
    if (h.garrison >= 15) unrestDelta -= 8;
    else if (h.garrison >= 8) unrestDelta -= 5;
    else if (h.garrison < 4) unrestDelta += 5;
    if (h.garrison === 0) unrestDelta += 8;

    if (h.norsePopulationShare >= 60) unrestDelta -= 4;
    else if (h.norsePopulationShare < 30) unrestDelta += 5;

    if (h.appointedJarl) unrestDelta -= 6;
    if (h.hostagesCount) unrestDelta -= Math.min(9, h.hostagesCount * 3);
    if (h.localMarriageAlliance) unrestDelta -= 5;
    if (h.religiousTolerance) unrestDelta -= 3;
    if (h.buildings.includes('ring_fortress')) unrestDelta -= 5;
    if (realm.stability > 70) unrestDelta -= 2;
    if (realm.stability < 35) unrestDelta += 4;

    h.unrest = Math.max(0, Math.min(100, h.unrest + unrestDelta));

    const sData = SETTLEMENTS_BY_ID[h.settlementId];
    const sName = sData?.name ?? h.settlementId;
    const sNameFa = SETTLEMENTS_FA[h.settlementId]?.name ?? sName;

    // Armed rebellion check
    if (h.unrest >= 90) {
      const rebelStrength = Math.round((sData?.baseDefense ?? 5) * 2.5 + rng.int(8, 16));
      if (h.garrison >= rebelStrength) {
        const dead = Math.min(h.garrison, rng.int(2, 5));
        h.garrison = Math.max(1, h.garrison - dead);
        h.unrest = 35;
        realm.fame += 15;
        yearlySideNotices.push({
          id: `log_rebel_sup_${h.settlementId}_${nextYear}`,
          year: nextYear,
          season: nextSeason,
          age: char.age,
          locationName: sName,
          category: 'Politics & Kings',
          iconType: 'sword',
          title: `Rebellion Suppressed in ${sName}`,
          titleFa: `سرکوب شورش در «${sNameFa}»`,
          text: `Local rebels took up scythes and spears in ${sName}, but your garrison crushed the uprising (-${dead} warriors).`,
          textFa: `شورشیان محلی در «${sNameFa}» دست به شورش زدند، اما پادگان شما آنان را سرکوب کرد (-${dead} سرباز).`,
          deltas: [`Rebellion Crushed`, `-${dead} Garrison Warriors`, '+15 Fame'],
          deltasFa: [`سرکوب شورش`, `-${dead} سرباز پادگان`, '+15 شهرت'],
        });
        processedHoldings.push(h);
      } else {
        lostHoldingsCount += 1;
        currentStatuses[h.settlementId] = 'rebellious';
        realm.landFarms = Math.max(0, realm.landFarms - h.farms);
        realm.stability = Math.max(0, realm.stability - 15);
        realm.fame = Math.max(0, realm.fame - 35);
        char.stats.honor = clampStat(char.stats.honor - 6);
        yearlySideNotices.push({
          id: `log_rebel_lost_${h.settlementId}_${nextYear}`,
          year: nextYear,
          season: nextSeason,
          age: char.age,
          locationName: sName,
          category: 'Politics & Kings',
          iconType: 'skull',
          title: `Holding Lost to Revolt: ${sName}!`,
          titleFa: `سقوط و جدایی «${sNameFa}» در پی شورش مسلحانه!`,
          text: `Overwhelming native rebels stormed the citadel at ${sName}! Your garrison was slaughtered or fled to the ships, and the region threw off your rule.`,
          textFa: `شورشیان بومی به ارگ «${sNameFa}» هجوم بردند! پادگان تارومار شد و این منطقه رسماً از سلطه شما خارج گشت.`,
          deltas: [`Lost ${sName}`, `-${h.farms} Farms`, 'Stability -15', '-35 Fame'],
          deltasFa: [`از دست رفتن ${sNameFa}`, `-${h.farms} مزرعه`, 'ثبات -15', '-35 شهرت'],
          isDanger: true,
        });
      }
    } else {
      if (h.unrest >= 70) {
        yearlySideNotices.push({
          id: `log_unrest_warn_${h.settlementId}_${nextYear}`,
          year: nextYear,
          season: nextSeason,
          age: char.age,
          locationName: sName,
          category: 'Politics & Kings',
          iconType: 'crown',
          title: `Simmering Unrest in ${sName}`,
          titleFa: `هشدار: ناآرامی و خطر شورش در «${sNameFa}»`,
          text: `Local thegns and priests in ${sName} are whispering open treason (Unrest: ${h.unrest}%). Station more hirdmen, send settlers, or lower tribute to prevent revolt!`,
          textFa: `بزرگان و مردم بومی در «${sNameFa}» زمزمه شورش سر داده‌اند (ناآرامی: ${h.unrest}٪). برای جلوگیری از قیام، پادگان را تقویت کنید یا از خراج بکاهید!`,
          isDanger: true,
        });
      }
      processedHoldings.push(h);
    }
  }

  if (lostHoldingsCount > 0) {
    for (const h of processedHoldings) {
      if (h.unrest > 45) {
        h.unrest = Math.min(100, h.unrest + 12);
      }
    }
  }

  realm.holdings = processedHoldings;

  const tradeIncome = realm.tradeNetworks * (6 + Math.floor(char.skills.trade * 0.14));
  const tributaryIncome = currentTributaries.reduce((sum, tribId) => {
    const s = SETTLEMENTS_BY_ID[tribId];
    return sum + (s ? Math.round(s.baseWealth * 4.5) : 10);
  }, 0);
  const rawShipUpkeep = realm.longships * 4 + realm.knarrs * 2;
  const shipSilverUpkeep = hasBoathouseNow ? Math.floor(rawShipUpkeep * 0.5) : rawShipUpkeep;
  const hirdSilverUpkeep = Math.floor(Math.max(0, realm.hirdWarriors - 4) * 0.45);
  const totalUpkeep = hirdSilverUpkeep + shipSilverUpkeep;
  const grossSilver =
    realm.silver + buildingSilver + tradeIncome + realm.landFarms * 3 + thrallSilver + tributaryIncome + holdingTributeSilver;

  if (tributaryIncome > 0 || holdingTributeSilver > 0) {
    const totalTribSum = tributaryIncome + holdingTributeSilver;
    yearlySideNotices.push({
      id: `log_tribute_${nextYear}_${nextLogs.length}`,
      year: nextYear,
      season: nextSeason,
      age: char.age,
      locationName: loc.name,
      category: 'Politics & Kings',
      iconType: 'coin',
      title: 'Tribute & Danegeld Collected',
      titleFa: 'وصول خراج و باج سالانه',
      text: `Caravans and knarrs arrived with ${totalTribSum} silver from your subject realms and conquered holdings.`,
      textFa: `کاروان‌ها و کشتی‌های تجاری با ${totalTribSum} سکه نقره خراج و باج از متصرفات و سرزمین‌های تحت‌الحمایه به دربار رسیدند.`,
      deltas: [`+${totalTribSum} Silver (Tribute)`],
      deltasFa: [`+${totalTribSum} نقره (خراج)`],
    });
  }

  if (grossSilver < totalUpkeep && realm.hirdWarriors > 0) {
    realm.silver = 0;
    const deserted = Math.min(realm.hirdWarriors, rng.int(2, 5));
    realm.hirdWarriors = Math.max(0, realm.hirdWarriors - deserted);
    realm.stability = Math.max(10, realm.stability - 10);
    yearlySideNotices.push({
      id: `log_upkeep_desert_${nextYear}_${nextLogs.length}`,
      year: nextYear,
      season: nextSeason,
      age: char.age,
      locationName: loc.name,
      category: 'Politics & Kings',
      iconType: 'coin',
      title: 'Unpaid Crew Deserted',
      titleFa: 'فرار جنگجویانِ بی‌مواجب!',
      text: `Short on silver for fleet & hird upkeep (${totalUpkeep}/yr), ${deserted} grumbling warriors packed their spears and left.`,
      textFa: `چون نقره‌ی مواجب سالانه‌ی کشتی‌ها و سپاه (${totalUpkeep} سکه) جور نشد، ${deserted} جنگجو غرغرکنان نیزه‌هایشان را برداشتند و رفتند!`,
      deltas: [`-${deserted} Warriors`, 'Stability -10'],
      deltasFa: [`-${deserted} جنگجو`, 'ثبات -10'],
      isDanger: true,
    });
  } else {
    realm.silver = Math.max(0, grossSilver - totalUpkeep);
  }

  realm.fame += buildingFame;
  realm.stability = Math.max(10, Math.min(100, realm.stability + buildingStability - 1));
  realm.population = realm.landFarms * 18 + realm.hirdWarriors + realm.thrallsOwned * 2;

  if (realm.foodStores === 0 && realm.landFarms > 0) {
    char.stats.health = clampStat(char.stats.health - 6);
    char.stats.happiness = clampStat(char.stats.happiness - 6);
    yearlySideNotices.push({
      id: `log_hunger_${nextYear}_${nextLogs.length}`,
      year: nextYear,
      season: Season.Winter,
      age: char.age,
      locationName: loc.name,
      category: 'Farm Life',
      iconType: 'skull',
      title: 'Empty Grain Chests',
      titleFa: 'انبار خالی زمستان',
      text: 'Your grain stores ran dry before spring thaw.',
      textFa: 'آذوقه انبار قبل از آب شدن یخ‌های بهار ته‌کشید و شکم‌ها به قارقار افتاد.',
      deltas: ['Health -6', 'Happiness -6'],
      deltasFa: ['سلامتی -6', 'شادی -6'],
      isDanger: true,
    });
  }

  // 2. Age NPCs & Natural Childbirth Check
  const livingSpouse = relationships.find((r) => r.role === 'Spouse' && r.alive);
  if (
    livingSpouse &&
    char.age >= 18 &&
    char.age <= 48 &&
    livingSpouse.age <= 44 &&
    rng.chance(0.24)
  ) {
    const childSex = rng.chance(0.5) ? Sex.Male : Sex.Female;
    const childGiven = rng.pick(
      childSex === Sex.Male
        ? MALE_NAMES_BY_REGION[loc.regionGroup]
        : FEMALE_NAMES_BY_REGION[loc.regionGroup]
    );
    const fatherFirstName =
      char.sex === Sex.Male ? char.givenName : livingSpouse.name.split(' ')[0];
    const childFull = `${childGiven} ${makePatronymic(fatherFirstName, childSex)}`;
    relationships.push({
      id: `rel_child_${nextYear}_${relationships.length}_${rng.int(100, 999)}`,
      name: childFull,
      sex: childSex,
      role: 'Child',
      age: 0,
      alive: true,
      affinity: 88,
      socialClass: char.socialClass,
      locationId: char.locationId,
      traits: [rng.pick(['brave', 'cunning', 'strong_limbed', 'charismatic', 'seafarer'])],
      isHeirEligible: true,
    });
    const spouseFa = formatPersonName(livingSpouse.name, 'fa');
    const childFa = formatPersonName(childFull, 'fa');
    char.stats.happiness = clampStat(char.stats.happiness + 6);
    yearlySideNotices.unshift({
      id: `log_birth_${nextYear}_${nextLogs.length}_${childGiven}`,
      year: nextYear,
      season: nextSeason,
      age: char.age,
      locationName: loc.name,
      category: 'Family',
      iconType: 'family',
      title: `New Heir Born`,
      titleFa: 'قدم نورسیده مبارک!',
      text: `${livingSpouse.name} welcomed a healthy ${childSex === Sex.Male ? 'son' : 'daughter'}: ${childFull}.`,
      textFa: `«${spouseFa}» یک ${childSex === Sex.Male ? 'پسر' : 'دختر'} کاکل‌زری به دنیا آورد: «${childFa}»!`,
      deltas: ['Happiness +6'],
      deltasFa: ['شادی +6'],
    });
  }

  relationships = relationships.map((rel) => {
    if (!rel.alive) return rel;
    const newAge = rel.age + 1;
    const oldAgeDeathProb = newAge > 68 ? 0.14 : newAge > 56 ? 0.05 : 0.008;
    if (rng.chance(oldAgeDeathProb)) {
      const relNameFa = formatPersonName(rel.name, 'fa');
      const roleFa = ROLE_LABELS.fa[rel.role];
      yearlySideNotices.push({
        id: `log_npcd_${nextYear}_${nextLogs.length}_${rel.id}`,
        year: nextYear,
        season: nextSeason,
        age: char.age,
        locationName: loc.name,
        category: 'Family',
        iconType: 'skull',
        text: `Your ${ROLE_LABELS.en[rel.role].toLowerCase()}, ${rel.name}, died at age ${newAge}.`,
        textFa: `${roleFa} شما، «${relNameFa}»، در ${newAge} سالگی دار فانی را وداع گفت.`,
      });
      return {
        ...rel,
        age: newAge,
        alive: false,
        deathYear: nextYear,
        causeOfDeath: 'Winter sickness & age',
        causeOfDeathFa: 'کهولت سن و بیماری زمستان',
      };
    }
    return { ...rel, age: newAge };
  });

  // 3. Natural Character Aging & Mortality
  if (char.age >= 12 && char.age <= 24) {
    char.stats.strength = clampStat(char.stats.strength + rng.int(1, 3));
  }
  if (char.age >= 48) {
    const decay = char.age >= 64 ? rng.int(3, 7) : rng.int(1, 4);
    char.stats.health = clampStat(char.stats.health - decay);
    if (char.age >= 55) char.stats.strength = clampStat(char.stats.strength - rng.int(1, 2));
  }
  if (char.traits.includes('sickly') && rng.chance(0.35)) {
    char.stats.health = clampStat(char.stats.health - 3);
  }

  const diffMultiplier =
    state.settings.difficulty === Difficulty.Forgiving
      ? 0.55
      : state.settings.difficulty === Difficulty.Brutal
        ? 1.45
        : 1.0;

  if (char.stats.health <= 0) {
    const intermediate: FullGameState = {
      ...state,
      year: nextYear,
      season: nextSeason,
      rngState: rng.getState(),
      yearlyActivitiesUsed: {},
      builtThisYear: false,
      familyInteractionsUsed: {},
      character: char,
      realm,
      relationships,
      lifeLog: [...nextLogs, ...yearlySideNotices.slice(0, 1)],
    };
    return triggerDeathState(
      intermediate,
      'Failing strength and accumulated wounds.',
      'بدنت زیر بار زخم‌های کهنه کم آورد و جانت به والهالا پر کشید.'
    );
  }

  if (char.age >= 58) {
    const ageHazard = ((char.age - 55) * 0.018 + (100 - char.stats.health) * 0.002) * diffMultiplier;
    if (rng.chance(ageHazard)) {
      const intermediate: FullGameState = {
        ...state,
        year: nextYear,
        season: nextSeason,
        rngState: rng.getState(),
        yearlyActivitiesUsed: {},
        builtThisYear: false,
        familyInteractionsUsed: {},
        character: char,
        realm,
        relationships,
        lifeLog: [...nextLogs, ...yearlySideNotices.slice(0, 1)],
      };
      return triggerDeathState(
        intermediate,
        'Passed peacefully by the hearth after many winters of renown.',
        'کنار آتش گرم تالار، بعد از سال‌ها زندگی پرماجرا با خیال راحت چشم بستی.'
      );
    }
  }

  // 4. World Historical Chronicle Notices for this exact year
  const chronicles = WORLD_CHRONICLES.filter((wc) => wc.year === nextYear);
  for (const wc of chronicles) {
    const wcFa = WORLD_CHRONICLES_FA[wc.year];
    yearlySideNotices.unshift({
      id: `log_chron_${wc.year}_${nextLogs.length}_${wc.title.slice(0, 8)}`,
      year: nextYear,
      season: nextSeason,
      age: char.age,
      locationName: 'Northern Europe & the Sea',
      category: 'Chronicle',
      iconType: 'crown',
      title: `${wc.year} AD · ${wc.title}`,
      titleFa: wcFa ? `${wc.year} میلادی · ${wcFa.title}` : wc.title,
      text: wc.text,
      textFa: wcFa?.text ?? wc.text,
      provenance: wc.provenance,
      isSemiLegendary: wc.isSemiLegendary,
    });
  }

  char.epithet = evaluateEpithet(char, realm.fame);
  const nextOnboardingStep = state.onboardingDismissed
    ? 3
    : Math.min(3, (state.onboardingStep ?? 0) + 1);

  const reached1066Now = nextYear >= 1066 && !state.epilogue1066Shown;

  let updatedState: FullGameState = {
    ...state,
    year: nextYear,
    season: nextSeason,
    rngState: rng.getState(),
    actionsRemainingThisTurn: 2,
    yearlyActivitiesUsed: {},
    builtThisYear: false,
    familyInteractionsUsed: {},
    onboardingStep: nextOnboardingStep,
    onboardingDismissed: nextOnboardingStep >= 3 ? true : state.onboardingDismissed,
    epilogue1066Shown: state.epilogue1066Shown || reached1066Now,
    pending1066Epilogue: state.pending1066Epilogue || reached1066Now,
    settlementStatuses: currentStatuses,
    tributaries: currentTributaries,
    character: char,
    realm,
    relationships,
    lifeLog: nextLogs,
    lastOutcomeBanner: null,
  };

  updatedState.achievements = evaluateAchievements(updatedState);
  const goal = WIN_GOALS.find((g) => g.id === updatedState.winGoalId);
  if (goal && !updatedState.winGoalAchievedYear && goal.checkCompleted(updatedState)) {
    updatedState.winGoalAchievedYear = nextYear;
    const goalFa = WIN_GOALS_FA[goal.id];
    const dynFa = formatDynastyName(updatedState.dynastyName, 'fa');
    yearlySideNotices.unshift({
      id: `log_wingoal_${nextYear}_${updatedState.lifeLog.length}`,
      year: nextYear,
      season: nextSeason,
      age: char.age,
      locationName: loc.name,
      category: 'Succession',
      iconType: 'crown',
      title: `Goal Achieved: ${goal.title}!`,
      titleFa: `هدف بزرگ خاندان تیک خورد: ${goalFa?.title ?? goal.title}!`,
      text: `Poets across the North sing that the ${updatedState.dynastyName} achieved: ${goal.title}!`,
      textFa: `شاعران شمال همه‌جا جار می‌زنند که «${dynFa}» به آرزوی بزرگش رسید: ${goalFa?.title ?? goal.title}!`,
    });
  }

  // 5. Select Event: Scheduled Chain -> Exact Historical Set-Piece -> Weighted Life Event
  let chosenEvent: GameEvent | null = null;

  const dueChainIdx = updatedState.scheduledChains.findIndex((sc) => sc.triggerYear <= nextYear);
  if (dueChainIdx >= 0) {
    const due = updatedState.scheduledChains[dueChainIdx];
    const remaining = [...updatedState.scheduledChains];
    remaining.splice(dueChainIdx, 1);
    updatedState.scheduledChains = remaining;
    if (EVENTS_BY_ID[due.eventId]) {
      chosenEvent = EVENTS_BY_ID[due.eventId];
    }
  }

  if (!chosenEvent) {
    const eligibleSetPieces = ALL_EVENTS.filter(
      (ev) => ev.category === 'Historical Set-Piece' && isEventEligible(ev, updatedState)
    );
    if (eligibleSetPieces.length > 0 && rng.chance(0.88)) {
      chosenEvent = rng.weightedPick(eligibleSetPieces);
    }
  }

  if (!chosenEvent) {
    const eligiblePool = ALL_EVENTS.filter(
      (ev) => ev.category !== 'Historical Set-Piece' && isEventEligible(ev, updatedState)
    );
    if (eligiblePool.length > 0) {
      const weightedPool = eligiblePool.map((ev) => ({
        ...ev,
        weight: updatedState.firedUniqueEvents.slice(-10).includes(ev.id)
          ? Math.max(0.4, ev.weight * 0.15)
          : ev.weight,
      }));
      chosenEvent = rng.weightedPick(weightedPool);
    }
  }

  // Automatic season selection (prevents manual season-bypass exploit)
  nextSeason = pickAutomaticSeason(rng, nextYear, chosenEvent);
  updatedState.season = nextSeason;

  // Enforce strict BitLife pacing: max 1–2 events/cards per year
  if (chosenEvent) {
    if (yearlySideNotices.length > 0) {
      updatedState.lifeLog = [...updatedState.lifeLog, yearlySideNotices[0]];
    }
    updatedState.activeEvent = chosenEvent;
    updatedState.firedUniqueEvents = [...updatedState.firedUniqueEvents, chosenEvent.id];
  } else if (yearlySideNotices.length > 0) {
    updatedState.lifeLog = [...updatedState.lifeLog, ...yearlySideNotices.slice(0, 2)];
  } else {
    const locFa = SETTLEMENTS_FA[loc.id]?.name ?? loc.name;
    const seasonFa = SEASON_LABELS.fa[nextSeason];
    updatedState.lifeLog = [
      ...updatedState.lifeLog,
      {
        id: `log_quiet_${nextYear}_${nextSeason}_${updatedState.lifeLog.length}_${rng.int(100, 999)}`,
        year: nextYear,
        season: nextSeason,
        age: char.age,
        locationName: loc.name,
        category: 'Farm Life',
        iconType: 'coin',
        text: `A quiet ${nextSeason.toLowerCase()} in ${loc.name} — tarred hull seams and warm ale by the fire.`,
        textFa: `${seasonFa} بی‌دردسری در ${locFa} گذشت؛ قیرکشی بدنه کشتی و نوشیدن آبجوی گرم کنار آتش.`,
      },
    ];
  }

  updatedState.rngState = rng.getState();
  return updatedState;
}

export function resolveEventChoice(state: FullGameState, choiceId: string): FullGameState {
  const ev = state.activeEvent;
  if (!ev) return state;
  const choice = ev.choices.find((c) => c.id === choiceId) ?? ev.choices[0];
  const rng = new SeededRNG(state.rngState);

  const char: CharacterState = {
    ...state.character,
    stats: { ...state.character.stats },
    skills: { ...state.character.skills },
    traits: [...state.character.traits],
  };

  const realm = {
    ...state.realm,
    holdings: state.realm.holdings.map((h) => ({ ...h, buildings: [...h.buildings] })),
  };

  const relationships = state.relationships.map((r) => ({ ...r }));
  const flags = new Set(state.flags);
  const divergences = [...state.divergences];
  const divergencesFa = [...(state.divergencesFa ?? [])];
  const discovered = new Set(state.discoveredSettlements);
  const deltaSummary: string[] = [];
  const deltaSummaryFa: string[] = [];

  const evFa = EVENTS_FA[ev.id];
  const chFa = evFa?.choices[choice.id];

  const eff = choice.effects;
  if (eff) {
    if (eff.stats) {
      (Object.keys(eff.stats) as (keyof PersonalStats)[]).forEach((k) => {
        const d = eff.stats?.[k] ?? 0;
        if (d !== 0) {
          char.stats[k] = clampStat(char.stats[k] + d);
          deltaSummary.push(`${STAT_LABELS.en[k]} ${d > 0 ? `+${d}` : d}`);
          deltaSummaryFa.push(`${STAT_LABELS.fa[k]} ${d > 0 ? `+${d}` : d}`);
        }
      });
    }
    if (eff.skills) {
      (Object.keys(eff.skills) as (keyof SkillsState)[]).forEach((k) => {
        const d = eff.skills?.[k] ?? 0;
        if (d !== 0) {
          char.skills[k] = clampSkill(char.skills[k] + d);
          deltaSummary.push(`${SKILL_LABELS.en[k]} ${d > 0 ? `+${d}` : d}`);
          deltaSummaryFa.push(`${SKILL_LABELS.fa[k]} ${d > 0 ? `+${d}` : d}`);
        }
      });
    }
    if (eff.silver) {
      realm.silver = Math.max(0, realm.silver + eff.silver);
      deltaSummary.push(`Silver ${eff.silver > 0 ? `+${eff.silver}` : eff.silver}`);
      deltaSummaryFa.push(`نقره ${eff.silver > 0 ? `+${eff.silver}` : eff.silver}`);
    }
    if (eff.landFarms) {
      realm.landFarms = Math.max(0, realm.landFarms + eff.landFarms);
      const targetLoc = eff.moveToSettlementId || char.locationId;
      const existing = realm.holdings.find((h) => h.settlementId === targetLoc);
      if (existing) {
        existing.farms = Math.max(0, existing.farms + eff.landFarms);
      } else if (eff.landFarms > 0) {
        realm.holdings.push({
          settlementId: targetLoc,
          farms: eff.landFarms,
          buildings: [],
          garrison: 4,
          unrest: 0,
          norsePopulationShare: 50,
          tributeBurden: 'normal',
        });
      }
      deltaSummary.push(`Farms ${eff.landFarms > 0 ? `+${eff.landFarms}` : eff.landFarms}`);
      deltaSummaryFa.push(`مزرعه ${eff.landFarms > 0 ? `+${eff.landFarms}` : eff.landFarms}`);
    }
    if (eff.hirdWarriors) {
      realm.hirdWarriors = Math.max(0, realm.hirdWarriors + eff.hirdWarriors);
      deltaSummary.push(`Warriors ${eff.hirdWarriors > 0 ? `+${eff.hirdWarriors}` : eff.hirdWarriors}`);
      deltaSummaryFa.push(`جنگجو ${eff.hirdWarriors > 0 ? `+${eff.hirdWarriors}` : eff.hirdWarriors}`);
    }
    if (eff.longships) {
      realm.longships = Math.max(0, realm.longships + eff.longships);
      deltaSummary.push(`Warships +${eff.longships}`);
      deltaSummaryFa.push(`کشتی جنگی +${eff.longships}`);
    }
    if (eff.knarrs) {
      realm.knarrs = Math.max(0, realm.knarrs + eff.knarrs);
      deltaSummary.push(`Trade Ships +${eff.knarrs}`);
      deltaSummaryFa.push(`کشتی تجاری +${eff.knarrs}`);
    }
    if (eff.foodStores) {
      realm.foodStores = Math.max(0, realm.foodStores + eff.foodStores);
      deltaSummary.push(`Food ${eff.foodStores > 0 ? `+${eff.foodStores}` : eff.foodStores}`);
      deltaSummaryFa.push(`آذوقه ${eff.foodStores > 0 ? `+${eff.foodStores}` : eff.foodStores}`);
    }
    if (eff.stability) {
      realm.stability = clampStat(realm.stability + eff.stability);
    }
    if (eff.fame) {
      realm.fame = Math.max(0, realm.fame + eff.fame);
      deltaSummary.push(`Fame +${eff.fame}`);
      deltaSummaryFa.push(`شهرت +${eff.fame}`);
    }
    if (eff.addTraits) {
      eff.addTraits.forEach((t) => {
        if (!char.traits.includes(t)) {
          char.traits.push(t);
          const def = ALL_TRAITS_MAP[t];
          if (def) {
            deltaSummary.push(`Trait: ${def.name}`);
            deltaSummaryFa.push(`ویژگی: ${TRAITS_FA[t]?.name ?? def.name}`);
          }
        }
      });
    }
    if (eff.removeTraits) {
      char.traits = char.traits.filter((t) => !eff.removeTraits?.includes(t));
    }
    if (eff.addFlags) eff.addFlags.forEach((f) => flags.add(f));
    if (eff.removeFlags) eff.removeFlags.forEach((f) => flags.delete(f));
    if (eff.newReligion) {
      char.religion = eff.newReligion;
      deltaSummary.push(`Faith: ${RELIGION_LABELS.en[eff.newReligion]}`);
      deltaSummaryFa.push(`آیین: ${RELIGION_LABELS.fa[eff.newReligion]}`);
    }
    if (eff.newTitle) {
      if (TITLE_LADDER.indexOf(eff.newTitle) > TITLE_LADDER.indexOf(char.title)) {
        char.title = eff.newTitle;
        if (char.socialClass === SocialClass.Thrall && eff.newTitle !== TitleRank.Thrall) {
          char.socialClass = SocialClass.Karl;
        }
        deltaSummary.push(`Rank: ${SHORT_TITLE_LABELS.en[eff.newTitle]}`);
        deltaSummaryFa.push(`مقام جدید: ${SHORT_TITLE_LABELS.fa[eff.newTitle]}`);
      }
    }
    if (eff.moveToSettlementId && SETTLEMENTS_BY_ID[eff.moveToSettlementId]) {
      char.locationId = eff.moveToSettlementId;
      char.voyagesCompleted += 1;
      getNearbyDiscoveredIds(eff.moveToSettlementId, state.year).forEach((id) => discovered.add(id));
      deltaSummary.push(`Sailed to ${SETTLEMENTS_BY_ID[eff.moveToSettlementId].name}`);
      deltaSummaryFa.push(
        `ورود به ${SETTLEMENTS_FA[eff.moveToSettlementId]?.name ?? SETTLEMENTS_BY_ID[eff.moveToSettlementId].name}`
      );
    }
    if (eff.spawnRival) {
      const loc = SETTLEMENTS_BY_ID[char.locationId] ?? SETTLEMENTS[0];
      const rName =
        eff.spawnRival.name ||
        `${rng.pick(MALE_NAMES_BY_REGION[loc.regionGroup])} ${makePatronymic(rng.pick(MALE_NAMES_BY_REGION[loc.regionGroup]), Sex.Male)}`;
      relationships.push({
        id: `rel_riv_${state.year}_${rng.int(100, 999)}`,
        name: rName,
        sex: Sex.Male,
        role: eff.spawnRival.role,
        age: Math.max(18, char.age + rng.int(-4, 8)),
        alive: true,
        affinity: 8,
        socialClass: char.socialClass,
        locationId: char.locationId,
        traits: ['wrathful'],
      });
    }
    if (eff.spawnSwornSibling) {
      const loc = SETTLEMENTS_BY_ID[char.locationId] ?? SETTLEMENTS[0];
      const sSex = char.sex;
      const pool = sSex === Sex.Male ? MALE_NAMES_BY_REGION[loc.regionGroup] : FEMALE_NAMES_BY_REGION[loc.regionGroup];
      relationships.push({
        id: `rel_sworn_${state.year}_${rng.int(100, 999)}`,
        name: `${rng.pick(pool)} ${makePatronymic(rng.pick(MALE_NAMES_BY_REGION[loc.regionGroup]), sSex)}`,
        sex: sSex,
        role: sSex === Sex.Male ? 'Sworn Brother' : 'Sworn Sister',
        age: Math.max(15, char.age + rng.int(-2, 3)),
        alive: true,
        affinity: 94,
        socialClass: char.socialClass,
        locationId: char.locationId,
        traits: ['brave', 'oath_keeper'],
        isHeirEligible: true,
      });
    }
    if (eff.marryRandom && !relationships.some((r) => r.role === 'Spouse' && r.alive)) {
      const loc = SETTLEMENTS_BY_ID[char.locationId] ?? SETTLEMENTS[0];
      const spSex = char.sex === Sex.Male ? Sex.Female : Sex.Male;
      const pool = spSex === Sex.Male ? MALE_NAMES_BY_REGION[loc.regionGroup] : FEMALE_NAMES_BY_REGION[loc.regionGroup];
      relationships.push({
        id: `rel_spouse_${state.year}_${rng.int(100, 999)}`,
        name: `${rng.pick(pool)} ${makePatronymic(rng.pick(MALE_NAMES_BY_REGION[loc.regionGroup]), spSex)}`,
        sex: spSex,
        role: 'Spouse',
        age: Math.max(18, char.age + rng.int(-4, 4)),
        alive: true,
        affinity: 80,
        socialClass: char.socialClass,
        locationId: char.locationId,
        traits: [rng.pick(['cunning', 'charismatic', 'law_speaker'])],
      });
    }
    if (eff.birthChild) {
      const loc = SETTLEMENTS_BY_ID[char.locationId] ?? SETTLEMENTS[0];
      const cSex = rng.chance(0.5) ? Sex.Male : Sex.Female;
      const cGiven = rng.pick(cSex === Sex.Male ? MALE_NAMES_BY_REGION[loc.regionGroup] : FEMALE_NAMES_BY_REGION[loc.regionGroup]);
      relationships.push({
        id: `rel_child_ev_${state.year}_${rng.int(100, 999)}`,
        name: `${cGiven} ${makePatronymic(char.givenName, cSex)}`,
        sex: cSex,
        role: 'Child',
        age: 0,
        alive: true,
        affinity: 90,
        socialClass: char.socialClass,
        locationId: char.locationId,
        traits: [rng.pick(['brave', 'blessed_luck', 'cunning'])],
        isHeirEligible: true,
      });
      deltaSummary.push(`Child Born: ${cGiven}`);
      deltaSummaryFa.push(`فرزند جدید: ${formatPersonName(cGiven, 'fa')}`);
    }
    if (eff.marryRivalPeace) {
      const rivalIdx = relationships.findIndex(
        (r) => (r.role === 'Blood-Feud Enemy' || r.role === 'Rival') && r.alive
      );
      const alreadyMarried = relationships.some((r) => r.role === 'Spouse' && r.alive);
      if (rivalIdx >= 0) {
        const foe = relationships[rivalIdx];
        relationships.splice(rivalIdx, 1);
        deltaSummary.push(`Ended Feud: ${foe.name}`);
        deltaSummaryFa.push(`پایان دشمنی با ${formatPersonName(foe.name, 'fa')}`);
      }
      if (!alreadyMarried) {
        const loc = SETTLEMENTS_BY_ID[char.locationId] ?? SETTLEMENTS[0];
        const spSex = char.sex === Sex.Male ? Sex.Female : Sex.Male;
        const pool = spSex === Sex.Male ? MALE_NAMES_BY_REGION[loc.regionGroup] : FEMALE_NAMES_BY_REGION[loc.regionGroup];
        const spName = `${rng.pick(pool)} ${makePatronymic(rng.pick(MALE_NAMES_BY_REGION[loc.regionGroup]), spSex)}`;
        relationships.push({
          id: `rel_peace_spouse_${state.year}_${rng.int(100, 999)}`,
          name: spName,
          sex: spSex,
          role: 'Spouse',
          age: Math.max(18, char.age + rng.int(-3, 3)),
          alive: true,
          affinity: 84,
          socialClass: char.socialClass,
          locationId: char.locationId,
          traits: ['brave', 'cunning'],
        });
        deltaSummary.push(`Peace Wedding: ${spName}`);
        deltaSummaryFa.push(`ازدواج صلح با ${formatPersonName(spName, 'fa')}`);
      }
    }
    if (eff.divergenceNote) {
      divergences.push(eff.divergenceNote);
      divergencesFa.push(chFa?.divergenceNote ?? eff.divergenceNote);
    }
  }

  // Ring Fortress & Garrison bonus on enemy attack event (bl_ab_08_fortress_raid)
  const hasFortress = realm.holdings.some((h) => h.buildings.includes('ring_fortress'));
  const totalGarrison = realm.holdings.reduce((sum, h) => sum + (h.garrison ?? 0), 0);
  if (ev.id === 'bl_ab_08_fortress_raid' && choice.id === 'man_earthworks_garrison') {
    if (hasFortress || totalGarrison >= 12) {
      realm.silver += 18;
      realm.fame += 12;
      char.stats.health = clampStat(char.stats.health + 6);
      deltaSummary.push('Ring Fortress Bonus: +18 Silver');
      deltaSummaryFa.push('امتیاز دژ و پادگان: +18 نقره');
    } else if (totalGarrison < 5 && realm.hirdWarriors < 10) {
      char.stats.health = clampStat(char.stats.health - 8);
      deltaSummary.push('Weak Garrison: Health -8');
      deltaSummaryFa.push('پادگان ضعیف: سلامتی -8');
    }
  }

  // Injury roll
  if (choice.injuryChance && choice.injuryTraitId && rng.chance(choice.injuryChance)) {
    if (!char.traits.includes(choice.injuryTraitId)) {
      char.traits.push(choice.injuryTraitId);
      const tDef = ALL_TRAITS_MAP[choice.injuryTraitId];
      if (tDef) {
        deltaSummary.push(`Scar: ${tDef.name}`);
        deltaSummaryFa.push(`جراحت: ${TRAITS_FA[choice.injuryTraitId]?.name ?? tDef.name}`);
      }
    }
  }

  const scheduledChains = [...state.scheduledChains];
  if (choice.chain) {
    scheduledChains.push({
      eventId: choice.chain.eventId,
      triggerYear: state.year + choice.chain.delayYears,
    });
  }

  const isMild = state.settings.contentIntensity === ContentIntensity.Mild;
  const outcomeProse =
    isMild && choice.mildOutcomeText ? choice.mildOutcomeText : choice.outcomeText;

  const outcomeProseFa =
    isMild && chFa?.mildOutcomeText
      ? chFa.mildOutcomeText
      : chFa?.outcomeText ?? outcomeProse;
  const titleFa = evFa?.title ?? ev.title;

  const loc = SETTLEMENTS_BY_ID[char.locationId] ?? SETTLEMENTS[0];
  const newEntry: LogEntry = {
    id: `log_ev_${state.year}_${ev.id}_${state.lifeLog.length}_${rng.int(100, 999)}`,
    year: state.year,
    season: state.season,
    age: char.age,
    locationName: loc.name,
    category: ev.category,
    iconType: ev.iconType,
    title: ev.title,
    titleFa,
    text: outcomeProse,
    textFa: outcomeProseFa,
    deltas: deltaSummary,
    deltasFa: deltaSummaryFa,
    provenance: ev.provenance,
    isSemiLegendary: ev.isSemiLegendary,
    isDivergence: Boolean(eff?.divergenceNote),
  };

  let nextState: FullGameState = {
    ...state,
    rngState: rng.getState(),
    marriedBloodEnemy: state.marriedBloodEnemy || Boolean(eff?.marryRivalPeace),
    character: char,
    realm,
    relationships,
    flags: Array.from(flags),
    divergences,
    divergencesFa,
    discoveredSettlements: Array.from(discovered),
    scheduledChains,
    activeEvent: null,
    lifeLog: [...state.lifeLog, newEntry],
    lastOutcomeBanner: {
      title: ev.title,
      titleFa,
      text: outcomeProse,
      textFa: outcomeProseFa,
      deltaSummary,
      deltaSummaryFa,
    },
  };

  nextState.achievements = evaluateAchievements(nextState);

  // Death roll adjusted by difficulty, Wyrd, and Ring Fortress protection
  if (choice.deathChance && !(ev.id === 'bl_ab_08_fortress_raid' && hasFortress)) {
    const diffMult =
      state.settings.difficulty === Difficulty.Forgiving
        ? 0.45
        : state.settings.difficulty === Difficulty.Brutal
          ? 1.4
          : 1.0;
    const wyrdProtection = (char.stats.wyrd - 50) * 0.001;
    const finalDeathProb = Math.max(0.005, choice.deathChance * diffMult - wyrdProtection);
    if (rng.chance(finalDeathProb) || char.stats.health <= 0) {
      return triggerDeathState(
        nextState,
        choice.deathReason || 'Fell in a fateful clash of iron.',
        chFa?.deathReason || 'کشته‌شدن در چکاچک شمشیر و نبرد سرنوشت‌ساز.',
        choice.deathTypeId
      );
    }
  } else if (char.stats.health <= 0) {
    return triggerDeathState(
      nextState,
      'Succumbed to grievous wounds and exhaustion.',
      'جان‌باختن بر اثر زخم‌های کاری و خستگی مفرط.',
      'death_exhausted_wounds'
    );
  }

  return nextState;
}

export type RaidTactic = 'surprise' | 'shield_wall' | 'ransom' | 'feigned_retreat';

export function executeRaidAction(
  state: FullGameState,
  targetSettlementId: string,
  tactic: RaidTactic
): FullGameState {
  if (state.yearlyActivitiesUsed?.raid) return state;
  const rng = new SeededRNG(state.rngState);
  const target = SETTLEMENTS_BY_ID[targetSettlementId] ?? SETTLEMENTS_BY_ID['lindisfarne'];
  const char = {
    ...state.character,
    stats: { ...state.character.stats },
    skills: { ...state.character.skills },
    traits: [...state.character.traits],
  };
  const realm = { ...state.realm, holdings: state.realm.holdings.map((h) => ({ ...h })) };

  const playerForce =
    realm.hirdWarriors * 1.4 +
    char.skills.combat * 0.8 +
    char.stats.strength * 0.4 +
    (tactic === 'surprise' ? char.stats.cunning * 0.5 : 0) +
    (tactic === 'shield_wall' ? 18 : 0) +
    (tactic === 'ransom' ? char.skills.diplomacy * 0.6 : 0) +
    (tactic === 'feigned_retreat' ? char.stats.cunning * 0.65 : 0) +
    rng.int(-12, 22);

  const garrisonForce = target.baseDefense * 11 + rng.int(0, 25);
  const margin = playerForce - garrisonForce;

  char.raidsLed += 1;
  const discovered = new Set(state.discoveredSettlements);
  discovered.add(target.id);

  let outcomeText = '';
  let outcomeTextFa = '';
  const deltas: string[] = [];
  const deltasFa: string[] = [];
  const targetFa = SETTLEMENTS_FA[target.id]?.name ?? target.name;

  if (margin >= 0) {
    const isMonastery = target.settlementType === 'monastery';
    const baseLoot = isMonastery
      ? Math.round(target.baseWealth * 15 + rng.int(35, 75))
      : target.baseWealth * (tactic === 'ransom' ? 9 : 7) + rng.int(12, 34);
    const casualties =
      tactic === 'ransom' || isMonastery
        ? rng.int(0, isMonastery ? 0 : 1)
        : Math.min(realm.hirdWarriors, rng.int(0, Math.max(1, Math.floor(target.baseDefense / 3))));
    const fameGain = Math.round(16 + target.baseDefense * 3 + (isMonastery ? 12 : 0));

    realm.silver += baseLoot;
    realm.hirdWarriors = Math.max(0, realm.hirdWarriors - casualties);
    realm.fame += fameGain;
    char.skills.combat = clampSkill(char.skills.combat + 4);
    char.skills.seamanship = clampSkill(char.skills.seamanship + 2);
    char.stats.honor = clampStat(char.stats.honor + (isMonastery && char.religion === Religion.Christian ? -6 : 6));

    deltas.push(`+${baseLoot} Silver`, `+${fameGain} Fame`);
    deltasFa.push(`+${baseLoot} نقره`, `+${fameGain} شهرت`);
    if (isMonastery) {
      deltas.push('Monastery Reliquaries Sacked');
      deltasFa.push('غارت جام‌ها و کتب زرین صومعه');
    }
    if (casualties > 0) {
      deltas.push(`-${casualties} Warriors`);
      deltasFa.push(`-${casualties} جنگجو`);
    }

    const tacticDesc =
      tactic === 'surprise'
        ? 'slipping ashore in grey dawn mist before watch-horns could blow'
        : tactic === 'shield_wall'
          ? 'locking overlapping shields in an unbreakable wall'
          : tactic === 'ransom'
            ? 'drawing up banners before the gates until the town paid silver tribute'
            : 'feigning retreat down the beach before wheeling upon the scattered defenders';

    const tacticDescFa =
      tactic === 'surprise'
        ? 'با شبیخون سحرگاهی پیش از به‌صدا درآمدن شیپور دیده‌بانان'
        : tactic === 'shield_wall'
          ? 'با بستن دیوار مستحکم سپرها در برابر نیزه‌داران ساحل'
          : tactic === 'ransom'
            ? 'با محاصره دروازه‌ها تا زمانی که بزرگان شهر باج نقره پرداختند'
            : 'با عقب‌نشینی ساختگی در ساحل و برگشتن ناگهانی بر سر مدافعان پراکنده';

    const isMild = state.settings.contentIntensity === ContentIntensity.Mild;
    outcomeText = isMild
      ? `Your ships struck ${target.name}, ${tacticDesc}. Carrying ${baseLoot} silver back to the oars, your warband won ${fameGain} fame.`
      : `Your ships struck ${target.name}, ${tacticDesc}. Carrying ${baseLoot} silver back to the oars, you lost ${casualties} warrior${casualties === 1 ? '' : 's'} and won ${fameGain} fame.`;
    outcomeTextFa = isMild
      ? `ناوگان شما ${tacticDescFa} به بندر ${targetFa} رفت و با ${baseLoot} سکه نقره غنیمت و +${fameGain} شهرت به کشتی‌ها بازگشت!`
      : `ناوگان شما ${tacticDescFa} به بندر ${targetFa} یورش برد! با ${baseLoot} سکه نقره غنیمت و +${fameGain} شهرت به کشتی‌ها بازگشتید${casualties > 0 ? ` (${casualties} جنگجو در نبرد کشته شدند)` : ' (بدون تلفات)'}.`;
  } else {
    const isMild = state.settings.contentIntensity === ContentIntensity.Mild;
    const casualties = Math.min(realm.hirdWarriors, rng.int(2, 6));
    const consolationLoot = rng.int(5, 16);
    const hpLoss = rng.int(8, 16);
    realm.silver += consolationLoot;
    realm.hirdWarriors = Math.max(0, realm.hirdWarriors - casualties);
    char.stats.health = clampStat(char.stats.health - hpLoss);
    char.skills.combat = clampSkill(char.skills.combat + 2);
    deltas.push(`+${consolationLoot} Silver`, `-${casualties} Warriors`, `Health -${hpLoss}`);
    deltasFa.push(`+${consolationLoot} نقره`, `-${casualties} جنگجو`, `سلامتی -${hpLoss}`);

    outcomeText = isMild
      ? `Stiff harbor defenses at ${target.name} repelled your landing! You rowed clear with ${consolationLoot} silver from the outer wharf while ${casualties} warriors were lost from your ranks.`
      : `Heavy garrison spears at ${target.name} held firm against your assault! Pulling back to the ships under arrow-fire with ${consolationLoot} silver snatched from the docks, ${casualties} warriors fell on the beach.`;
    outcomeTextFa = isMild
      ? `دفاع سرسختانه در ${targetFa} جلوی پیشروی شما را گرفت! با ${consolationLoot} نقره از اسکله عقب نشستید و ${casualties} جنگجو از صف سپاه کم شد.`
      : `مدافعان پرشمار در ${targetFa} در برابر یورش شما سرسختانه ایستادگی کردند! زیر باران تیر با ${consolationLoot} نقره از اسکله عقب نشستید و ${casualties} تن از جنگجویانتان در ساحل جان باختند.`;
  }

  const raidLogId = `log_raid_${state.year}_${state.lifeLog.length}_${rng.int(100, 999)}`;
  const nextState: FullGameState = {
    ...state,
    rngState: rng.getState(),
    yearlyActivitiesUsed: { ...(state.yearlyActivitiesUsed ?? {}), raid: true },
    totalRaidsWon: margin >= 0 ? (state.totalRaidsWon ?? 0) + 1 : state.totalRaidsWon ?? 0,
    character: char,
    realm,
    discoveredSettlements: Array.from(discovered),
    lifeLog: [
      ...state.lifeLog,
      {
        id: raidLogId,
        year: state.year,
        season: state.season,
        age: char.age,
        locationName: target.name,
        category: 'Raiding',
        iconType: 'sword',
        title: `Raid on ${target.name}`,
        titleFa: `یورش دریایی به ${targetFa}`,
        text: outcomeText,
        textFa: outcomeTextFa,
        deltas,
        deltasFa,
        isDanger: margin < 0,
      },
    ],
    lastOutcomeBanner: {
      title: `Raid on ${target.name}`,
      titleFa: `یورش دریایی به ${targetFa}`,
      text: outcomeText,
      textFa: outcomeTextFa,
      deltaSummary: deltas,
      deltaSummaryFa: deltasFa,
    },
  };

  if (margin < -18 && char.stats.health <= 15 && rng.chance(0.25)) {
    return triggerDeathState(
      nextState,
      `Fell covering the ship-launch during a hard-pressed raid on ${target.name}.`,
      `کشته‌شدن هنگام پوشش عقب‌نشینی یاران به سوی کشتی‌ها در ساحل ${targetFa}.`
    );
  }

  return nextState;
}

export function executeSailAction(state: FullGameState, destinationId: string): FullGameState {
  if (state.yearlyActivitiesUsed?.travel || destinationId === state.character.locationId) return state;
  const from = SETTLEMENTS_BY_ID[state.character.locationId] ?? SETTLEMENTS[0];
  const to = SETTLEMENTS_BY_ID[destinationId];
  if (!to) return state;

  const rng = new SeededRNG(state.rngState);
  const effectiveSeamanship =
    state.character.skills.seamanship + (hasBoathouse(state) ? 3 : 0);
  const metrics = calculateVoyageMetrics(
    from,
    to,
    state.season,
    state.year,
    effectiveSeamanship,
    state.realm.knarrs > 0
  );

  const char = {
    ...state.character,
    locationId: to.id,
    voyagesCompleted: state.character.voyagesCompleted + 1,
    stats: { ...state.character.stats },
    skills: {
      ...state.character.skills,
      seamanship: clampSkill(state.character.skills.seamanship + 4),
    },
  };

  const hasKnarr = state.realm.knarrs > 0;
  const toFa = SETTLEMENTS_FA[to.id]?.name ?? to.name;
  const seasonEn = state.season;
  const seasonFa = SEASON_LABELS.fa[state.season];
  const stormHit = rng.int(1, 100) <= metrics.dangerPct;

  let prose = `Sailing ${metrics.nauticalMiles} nautical miles (~${metrics.sailingDays} days at sea in ${seasonEn.toLowerCase()} weather), your ship made landfall at ${to.name}.`;
  let proseFa = `پس از پیمودن ${metrics.nauticalMiles} مایل دریایی (حدود ${metrics.sailingDays} روز دریانوردی در هوای ${seasonFa})، کشتی شما در بندر ${toFa} لنگر انداخت.`;
  const deltas = [`Arrived: ${to.name}`, `Sailing +4`];
  const deltasFa = [`ورود به ${toFa}`, `دریانوردی +4`];

  let nextSilver = state.realm.silver;
  let nextWarriors = state.realm.hirdWarriors;
  let nextFame = state.realm.fame + (to.regionGroup === 'North Atlantic' ? 14 : 5);

  // Deduct expedition provisions
  const provisionCost = metrics.provisionSilverCost ?? 0;
  if (provisionCost > 0) {
    nextSilver = Math.max(0, nextSilver - provisionCost);
    deltas.push(`Provisions: -${provisionCost} Silver`);
    deltasFa.push(`آذوقه سفر: -${provisionCost} نقره`);
  }

  if (stormHit) {
    const hpLoss =
      state.season === Season.Winter
        ? hasKnarr
          ? 10
          : 15
        : state.season === Season.Autumn
          ? 11
          : 8;
    char.stats.health = clampStat(char.stats.health - hpLoss);

    if (state.season === Season.Winter) {
      prose += ` Blinding winter snow and freezing spray coated the oars (-${hpLoss} Health)!`;
      proseFa += ` کولاک برف و یخ‌زدگی عرشه، خدمه را به شدت فرسوده و زخمی کرد (سلامتی -${hpLoss})!`;
      deltas.push(`Winter Gale: Health -${hpLoss}`);
      deltasFa.push(`کولاک زمستان: سلامتی -${hpLoss}`);
      if (!hasKnarr && nextWarriors > 2 && rng.chance(0.35)) {
        nextWarriors -= 1;
        prose += ' One oarsman was swept overboard in the icy gale.';
        proseFa += ' یک جنگجو در امواج یخ‌زده به دریا افتاد.';
        deltas.push('-1 Warrior');
        deltasFa.push('-1 جنگجو');
      }
    } else if (state.season === Season.Autumn) {
      const repairCost = Math.min(nextSilver, 4);
      nextSilver -= repairCost;
      prose += ` Fierce autumn rain squalls tore at the rigging (-${hpLoss} Health${repairCost > 0 ? `, -${repairCost} Silver repairs` : ''})!`;
      proseFa += ` باران شدید و تندباد پاییزی به طناب‌ها و بادبان آسیب زد (سلامتی -${hpLoss}${repairCost > 0 ? `، -${repairCost} نقره تعمیر` : ''})!`;
      deltas.push(`Autumn Storm: Health -${hpLoss}`);
      deltasFa.push(`طوفان پاییزی: سلامتی -${hpLoss}`);
      if (repairCost > 0) {
        deltas.push(`-${repairCost} Silver`);
        deltasFa.push(`-${repairCost} نقره`);
      }
    } else {
      prose += ` Thick ${seasonEn.toLowerCase()} squalls bruised the crew (-${hpLoss} Health)!`;
      proseFa += ` امواج و مه ${seasonFa} خدمه را کوفته کرد (سلامتی -${hpLoss})!`;
      deltas.push(`Squall: Health -${hpLoss}`);
      deltasFa.push(`تندباد: سلامتی -${hpLoss}`);
    }
  } else {
    if (state.season === Season.Summer) {
      char.stats.happiness = clampStat(char.stats.happiness + 3);
      prose += ' Fair summer winds carried the sail smoothly across bright waters (+3 Happiness).';
      proseFa += ' باد موافق تابستانی بادبان را به‌نرمی بر آب‌های آرام پیش راند (شادی +3).';
      deltas.push('Fair Winds: Happiness +3');
      deltasFa.push('باد موافق: شادی +3');
    }
    if (to.regionGroup === 'North Atlantic') {
      char.stats.honor = clampStat(char.stats.honor + 5);
      deltas.push('Honor +5');
      deltasFa.push('شرافت +5');
    }
  }

  // Random Sea Voyage Encounters & Hazards (~42% chance)
  const encounterRoll = rng.int(1, 100);
  if (encounterRoll <= 42) {
    if (to.regionGroup === 'North Atlantic' || from.regionGroup === 'North Atlantic') {
      if (rng.chance(0.5)) {
        char.stats.wyrd = clampStat(char.stats.wyrd + 6);
        char.stats.honor = clampStat(char.stats.honor + 4);
        prose += ' In deep oceanic waters, a colossal sea-creature breached amid boiling spray — the crew whispered in awe of the legendary Hafgufa!';
        proseFa += ' در اعماق اقیانوس، هیولای عظیم دریایی از میان گرداب کف‌آلود سر برآورد — ملوانان با وحشت و شگفتی نام «هافگوفا» را نجوا کردند!';
        deltas.push('Hafgufa Sighting: Wyrd +6', 'Honor +4');
        deltasFa.push('دیدار هیولای دریا (هافگوفا): سرنوشت +6', 'شرافت +4');
      } else {
        char.skills.seamanship = clampSkill(char.skills.seamanship + 3);
        prose += ' Dense arctic sea fog choked the horizon, but your navigator raised the calcite sunstone (solarsteinn) to trace the hidden sun and steer safely through pack-ice.';
        proseFa += ' مه‌های غلیظ قطبی افق را پوشانده بود، اما دیده‌بان با سنگ خورشیدی (سولارستین) نور پنهان خورشید را یافت و کشتی را سالم از میان یخ‌ها راند.';
        deltas.push('Sunstone Navigation: Seamanship +3');
        deltasFa.push('ناوبری با سنگ خورشیدی: دریانوردی +3');
      }
    } else if (
      to.regionGroup === 'Kievan Rus & Rivers' ||
      from.regionGroup === 'Kievan Rus & Rivers' ||
      to.regionGroup === 'Serkland & Caliphate'
    ) {
      if (char.skills.combat >= 28 || nextWarriors >= 8) {
        nextFame += 12;
        char.skills.combat = clampSkill(char.skills.combat + 3);
        prose += ' Dragging the dragon-ships on greased log rollers across river cataracts, your hird drove off a band of horse archers waiting at the narrows.';
        proseFa += ' هنگام غلتاندن کشتی‌ها روی کنده‌های چوب در کنار آبشارهای صخره‌ای رودخانه، جنگجویانتان تیراندازان سواره‌نظام در کمین را پراکنده کردند.';
        deltas.push('River Portage Defended: Combat +3', '+12 Fame');
        deltasFa.push('دفاع در گردنه‌های رودخانه‌ای: نبرد +3', '+12 شهرت');
      } else {
        const arrowLoss = nextWarriors > 1 ? 1 : 0;
        nextWarriors -= arrowLoss;
        char.stats.health = clampStat(char.stats.health - 6);
        prose += ' Portage over the river rapids proved grueling; steppe nomads peppered the wooden shields with arrows (-6 Health).';
        proseFa += ' گذر از آبشارهای صخره‌ای دشوار بود؛ تیراندازان بیابانگرد سپرها را به رگبار بستند (سلامتی -6).';
        deltas.push('Rapids Skirmish: Health -6');
        deltasFa.push('درگیری در آبشار رودخانه: سلامتی -6');
        if (arrowLoss > 0) {
          deltas.push('-1 Warrior');
          deltasFa.push('-1 جنگجو');
        }
      }
    } else if (
      to.regionGroup === 'Iberia & Al-Andalus' ||
      to.regionGroup === 'Mediterranean' ||
      from.regionGroup === 'Iberia & Al-Andalus'
    ) {
      if (rng.chance(0.6)) {
        const loot = rng.int(10, 24);
        nextSilver += loot;
        nextFame += 10;
        char.skills.combat = clampSkill(char.skills.combat + 2);
        prose += ` Andalusian corsairs engaged your ship off the rocky promontory; after a fierce boarding action, you drove them back and stripped ${loot} silver from their lateen galley!`;
        proseFa += ` دزدان دریایی اندلسی در نزدیکی دماغه صخره‌ای به شما حمله کردند؛ پس از نبردی سهمگین عرشه آنها را فتح کرده و ${loot} سکه نقره به غنیمت گرفتید!`;
        deltas.push(`Corsairs Repelled: +${loot} Silver`, 'Combat +2');
        deltasFa.push(`دفع دزدان دریایی اندلس: +${loot} نقره`, 'نبرد +2');
      } else {
        char.stats.health = clampStat(char.stats.health - 8);
        prose += ' Swift southern lateen galleys harried your flanks with incendiary pots, scorching the timbers before you escaped into open waters (-8 Health).';
        proseFa += ' قایق‌های تندرو جنوبی با پرتاب کوزه‌های آتشین به بدنه کشتی آسیب زدند تا این‌که به آب‌های باز گریختید (سلامتی -8).';
        deltas.push('Sea Skirmish: Health -8');
        deltasFa.push('درگیری دریایی: سلامتی -8');
      }
    } else if (to.regionGroup === 'Miklagard & East') {
      nextFame += 15;
      char.skills.diplomacy = clampSkill(char.skills.diplomacy + 3);
      prose += ' An imperial Byzantine dromon escorted your ship into the Golden Horn under the gleaming spires of Constantinople, awe-inspiring to every northern oarsman.';
      proseFa += ' یک کشتی جنگی درومون امپراتوری بیزانس شما را به خلیج شاخ زرین و زیر مناره‌های زرین کنستانتینوپل مشایعت کرد — شکوهی که دل هر دریانورد شمالی را لرزاند.';
      deltas.push('Byzantine Escort: Fame +15', 'Diplomacy +3');
      deltasFa.push('مشایعت امپراتوری روم شرقی: شهرت +15', 'دیپلماسی +3');
    } else {
      if (rng.chance(0.5)) {
        char.stats.happiness = clampStat(char.stats.happiness + 5);
        char.stats.faith = clampStat(char.stats.faith + 4);
        prose += ' Eerie blue flames danced on the masthead through the midnight fog — the crew hailed Thor’s fiery blessing upon the voyage!';
        proseFa += ' شعله‌های آبی‌رنگ و شگفت‌انگیز سنت‌المو در مه نیمه‌شب بر نوک دکل رقصیدند — خدمه آن را نشانه برکت و نگاه تور به سفر دانستند!';
        deltas.push("Thor's Fire: Happiness +5", 'Faith +4');
        deltasFa.push('آتش مقدس تور: شادی +5', 'ایمان +4');
      } else {
        const tradeProfit = rng.int(8, 16);
        nextSilver += tradeProfit;
        char.skills.trade = clampSkill(char.skills.trade + 2);
        prose += ` Hailing a Norse merchant knarr returning from eastern river routes, you bartered walrus ivory and Baltic amber for ${tradeProfit} silver.`;
        proseFa += ` در میانه دریا با یک کنار تجاری نورس دیدار کردید و با مبادله عاج والروس و کهربا، ${tradeProfit} سکه نقره سود کسب کردید.`;
        deltas.push(`Knarr Meeting: +${tradeProfit} Silver`, 'Trade +2');
        deltasFa.push(`ملاقات با کشتی بازرگانی: +${tradeProfit} نقره`, 'تجارت +2');
      }
    }
  }

  const discovered = new Set(state.discoveredSettlements);
  getNearbyDiscoveredIds(to.id, state.year).forEach((id) => discovered.add(id));

  const sailLogId = `log_sail_${state.year}_${to.id}_${state.lifeLog.length}_${rng.int(100, 999)}`;
  const updated: FullGameState = {
    ...state,
    rngState: rng.getState(),
    yearlyActivitiesUsed: { ...(state.yearlyActivitiesUsed ?? {}), travel: true },
    character: char,
    realm: {
      ...state.realm,
      silver: nextSilver,
      hirdWarriors: nextWarriors,
      fame: nextFame,
    },
    discoveredSettlements: Array.from(discovered),
    lifeLog: [
      ...state.lifeLog,
      {
        id: sailLogId,
        year: state.year,
        season: state.season,
        age: char.age,
        locationName: to.name,
        category: 'Voyage & Sea',
        iconType: 'ship',
        title: `Sea Voyage to ${to.name}`,
        titleFa: `سفر دریایی به ${toFa}`,
        text: prose,
        textFa: proseFa,
        deltas,
        deltasFa,
        isDanger: stormHit,
      },
    ],
    lastOutcomeBanner: {
      title: `Landfall at ${to.name}`,
      titleFa: `ورود به بندر ${toFa}`,
      text: prose,
      textFa: proseFa,
      deltaSummary: deltas,
      deltaSummaryFa: deltasFa,
    },
  };

  updated.achievements = evaluateAchievements(updated);
  const winterCapsizeProb = hasKnarr ? 0.03 : 0.08;
  if (stormHit && state.season === Season.Winter && rng.chance(winterCapsizeProb)) {
    return triggerDeathState(
      updated,
      `Lost at sea when a towering winter blizzard wave capsized the ship off ${to.name}.`,
      `غرق‌شدن در دریا بر اثر کولاک و امواج سهمگین زمستانی در نزدیکی سواحل ${toFa}.`
    );
  }
  return updated;
}

export function executeGeneralAction(
  state: FullGameState,
  actionType:
    | 'trade_voyage'
    | 'farm_settle'
    | 'attend_thing'
    | 'hold_feast'
    | 'patronize_skald'
    | 'recruit_hird'
    | 'build_longship'
    | 'build_knarr'
    | 'buy_freedom'
    | 'convert_pagan'
    | 'convert_christian'
    | 'claim_rank'
    | 'court_spouse'
    | 'divorce_spouse'
    | 'pay_wergild'
    | 'holmgang_rival',
  extraParam?: SkillKey | BuildingType | string
): FullGameState {
  if (actionType === 'trade_voyage' && state.yearlyActivitiesUsed?.trade) return state;
  if (actionType === 'farm_settle' && state.yearlyActivitiesUsed?.settle) return state;
  const oncePerYearFreeActions = new Set([
    'attend_thing',
    'hold_feast',
    'patronize_skald',
    'convert_pagan',
    'convert_christian',
  ]);
  if (
    oncePerYearFreeActions.has(actionType) &&
    state.familyInteractionsUsed?.[`act_${actionType}`]
  ) {
    return state;
  }
  const rng = new SeededRNG(state.rngState);
  const loc = SETTLEMENTS_BY_ID[state.character.locationId] ?? SETTLEMENTS[0];

  const char: CharacterState = {
    ...state.character,
    stats: { ...state.character.stats },
    skills: { ...state.character.skills },
    traits: [...state.character.traits],
  };
  const realm = {
    ...state.realm,
    holdings: state.realm.holdings.map((h) => ({ ...h, buildings: [...h.buildings] })),
  };
  const relationships = state.relationships.map((r) => ({ ...r }));

  const locFa = SETTLEMENTS_FA[loc.id]?.name ?? loc.name;
  let title = '';
  let titleFa = '';
  let text = '';
  let textFa = '';
  const deltas: string[] = [];
  const deltasFa: string[] = [];
  let consumeAction = true;

  if (actionType === 'trade_voyage') {
    const profit = Math.round(24 + loc.baseWealth * 4 + char.skills.trade * 0.6 + rng.int(0, 18));
    realm.silver += profit;
    if (realm.knarrs > 0 && realm.tradeNetworks < 6 && rng.chance(0.4)) {
      realm.tradeNetworks += 1;
      deltas.push('Trade Route +1');
      deltasFa.push('مسیر تجاری +1');
    }
    char.skills.trade = clampSkill(char.skills.trade + 5);
    title = `Market Trade at ${loc.name}`;
    titleFa = `معامله سودآور در بازار ${locFa}`;
    text = `Trading furs, woven wool, and Baltic amber on bronze scales at ${loc.name}, you earned ${profit} silver.`;
    textFa = `با دادوستد خز سمور، پشم و کهربای بالتیک بر ترازوهای برنزی بازار ${locFa}، مبلغ ${profit} سکه نقره سود بردید.`;
    deltas.push(`+${profit} Silver`, 'Trade +5');
    deltasFa.push(`+${profit} نقره`, 'تجارت +5');
  } else if (actionType === 'farm_settle') {
    if (isFortifiedEnemyCity(state, loc.id)) return state;
    const cost = 35;
    if (realm.silver < cost) return state;
    realm.silver -= cost;
    realm.landFarms += 1;
    realm.foodStores += 16;
    const existing = realm.holdings.find((h) => h.settlementId === loc.id);
    if (existing) {
      existing.farms += 1;
    } else {
      realm.holdings.push({
        settlementId: loc.id,
        farms: 1,
        buildings: [],
        garrison: 3,
        unrest: 0,
        norsePopulationShare:
          loc.regionGroup === 'Norway' || loc.regionGroup === 'Denmark' || loc.regionGroup === 'Sweden'
            ? 90
            : 35,
        tributeBurden: 'normal',
      });
    }
    char.skills.farming = clampSkill(char.skills.farming + 5);
    realm.fame += loc.regionGroup === 'North Atlantic' ? 18 : 8;
    title = `New Farmland Claimed at ${loc.name}`;
    titleFa = `تصاحب و آبادانی مزرعه در ${locFa}`;
    text = `Setting boundary-stones at ${loc.name}, you added productive farmland and winter grain stores to the ${state.dynastyName}.`;
    textFa = `با نشاندن سنگ‌های مرزی در ${locFa}، یک مزرعه حاصلخیز و انبار غله زمستانی به املاک «${formatDynastyName(state.dynastyName, 'fa')}» افزودید.`;
    deltas.push('-35 Silver', '+1 Farm', '+16 Food');
    deltasFa.push('-35 نقره', '+1 مزرعه', '+16 آذوقه');
  } else if (actionType === 'attend_thing') {
    char.thingsAttended += 1;
    char.skills.law = clampSkill(char.skills.law + 5);
    char.skills.diplomacy = clampSkill(char.skills.diplomacy + 3);
    char.stats.honor = clampStat(char.stats.honor + 6);
    realm.stability = clampStat(realm.stability + 6);
    if (char.isOutlawed || char.traits.includes('outlaw_mark')) {
      char.isOutlawed = false;
      char.traits = char.traits.filter((t) => t !== 'outlaw_mark');
      deltas.push('Outlawry Cleared');
      deltasFa.push('رفع حکم تبعید');
    }
    title = `Spoke at the Thing Council`;
    titleFa = `سخنرانی در شورای آزادگان (ثینگ)`;
    text = `Standing before assembled freefolk near ${loc.name}, your grasp of law and oaths strengthened your family’s honor.`;
    textFa = `در جمع مردان آزاد در شورای ثینگِ ${locFa}، تسلط شما بر قوانین کهن و سوگندها جایگاه و آبروی خاندانتان را استوار ساخت.`;
    deltas.push('Law +5', 'Honor +6', 'Stability +6');
    deltasFa.push('قانون‌دانی +5', 'شرافت +6', 'ثبات +6');
  } else if (actionType === 'hold_feast') {
    if (realm.silver < 16) return state;
    realm.silver -= 16;
    realm.fame += 18;
    realm.stability = clampStat(realm.stability + 9);
    char.stats.happiness = clampStat(char.stats.happiness + 10);
    char.stats.charisma = clampStat(char.stats.charisma + 4);
    char.stats.faith = clampStat(char.stats.faith + 5);
    title =
      char.religion === Religion.NorsePagan
        ? 'Seasonal Blót & Great Hall Feast'
        : 'Grand Feast in the Longhouse';
    titleFa =
      char.religion === Religion.NorsePagan
        ? 'ضیافت بزرگ و جشن آیینی (بلوت)'
        : 'مهمانی باشکوه در تالار بزرگ';
    text = `Roast meats and horns of honeyed ale warmed every bench in ${loc.name}, binding warriors and neighbors to your side.`;
    textFa = `کباب گرم و جام‌های نوشیدنی عسل در تالار ${locFa} دل جنگجویان و همسایگان را گرم کرد و وفاداری آنان را به جایگاه شما محکم‌تر ساخت.`;
    deltas.push('-16 Silver', '+18 Fame', 'Stability +9', 'Happiness +10');
    deltasFa.push('-16 نقره', '+18 شهرت', 'ثبات +9', 'شادی +10');
  } else if (actionType === 'patronize_skald') {
    if (realm.silver < 15) return state;
    realm.silver -= 15;
    const fameGain = 26 + Math.floor(char.skills.skaldcraft * 0.25);
    realm.fame += fameGain;
    char.stats.honor = clampStat(char.stats.honor + 8);
    char.skills.skaldcraft = clampSkill(char.skills.skaldcraft + 4);
    title = 'Commissioned a Skald Praise-Poem';
    titleFa = 'سرودن چکامه ستایش توسط شاعر (اسکالد)';
    text = `A master skald chanted verses recounting your voyages and generosity — a song that travels faster than ships across the North.`;
    textFa = `شاعری چیره‌دست سرودی حماسی درباره سفرها و بخشندگی شما سرود؛ اشعاری که سریع‌تر از کشتی‌ها در تالارهای شمال دهان‌به‌دهان می‌چرخد.`;
    deltas.push('-15 Silver', `+${fameGain} Fame`, 'Honor +8');
    deltasFa.push('-15 نقره', `+${fameGain} شهرت`, 'شرافت +8');
  } else if (actionType === 'recruit_hird') {
    if (realm.silver < 18) return state;
    realm.silver -= 18;
    realm.hirdWarriors += 6;
    title = 'Recruited 6 Household Warriors (Hird)';
    titleFa = 'استخدام ۶ جنگجوی سوگندخورده (هیرد)';
    text = `Six seasoned spear-men swore loyalty on your sword-hilt at ${loc.name}, joining your personal warband.`;
    textFa = `شش نیزه‌دار کارآزموده در ${locFa} دست بر قبضه شمشیر شما گذاشتند و به سپاه وفادار تالارتان پیوستند.`;
    deltas.push('-18 Silver', '+6 Warriors');
    deltasFa.push('-18 نقره', '+6 جنگجو');
  } else if (actionType === 'build_longship') {
    if (realm.silver < 55) return state;
    realm.silver -= 55;
    realm.longships += 1;
    realm.fame += 15;
    char.skills.craft = clampSkill(char.skills.craft + 3);
    title = 'Launched a War Longship';
    titleFa = 'به‌آب‌اندازی کشتی جنگی (لانگ‌شیپ)';
    text = `Built of split oak planks, iron rivets, and a wool square-sail, your new warship slid into the harbor of ${loc.name}!`;
    textFa = `کشتی جنگی تندرو از الوار بلوط و بادبان پشمی چهارگوش بر ریل‌های چرب‌شده به آب‌های بندر ${locFa} لغزید!`;
    deltas.push('-55 Silver', '+1 War Longship', '+15 Fame');
    deltasFa.push('-55 نقره', '+1 کشتی جنگی', '+15 شهرت');
  } else if (actionType === 'build_knarr') {
    if (realm.silver < 45) return state;
    realm.silver -= 45;
    realm.knarrs += 1;
    realm.tradeNetworks = Math.min(8, realm.tradeNetworks + 1);
    title = 'Launched an Ocean Trade Ship (Knarr)';
    titleFa = 'به‌آب‌اندازی کشتی تجاری اقیانوس‌پیما (کِنار)';
    text = `Broad-beamed to ride deep Atlantic waves with cargo and settlers, your new trade knarr rides at anchor in ${loc.name}.`;
    textFa = `کشتی پهن‌پیکر و استوار برای حمل کالا و عبور ایمن از امواج اقیانوس اطلس ساخته شد و در بندر ${locFa} لنگر انداخت.`;
    deltas.push('-45 Silver', '+1 Trade Ship', '+1 Trade Route');
    deltasFa.push('-45 نقره', '+1 کشتی تجاری', '+1 مسیر تجاری');
  } else if (actionType === 'buy_freedom') {
    if (realm.silver < 25 || char.title !== TitleRank.Thrall) return state;
    realm.silver -= 25;
    char.title = TitleRank.Freeman;
    char.socialClass = SocialClass.Karl;
    char.stats.honor = clampStat(char.stats.honor + 20);
    char.stats.happiness = clampStat(char.stats.happiness + 20);
    realm.fame += 20;
    title = 'Freedom Purchased!';
    titleFa = 'جشن خرید آزادی!';
    text = `Weighing 25 silver before witnesses, you drank the freedom-ale and stood forth as a freeborn citizen with full rights at the Thing!`;
    textFa = `با پرداخت ۲۵ سکه نقره در برابر شاهدان، جام آزادی را نوشیدید و از این پس به عنوان یک انسان آزاد حق حمل سلاح و رأی در شورا دارید!`;
    deltas.push('-25 Silver', 'Rank: Freeman', 'Honor +20');
    deltasFa.push('-25 نقره', 'مقام: مرد آزاد', 'شرافت +20');
  } else if (actionType === 'convert_pagan') {
    char.religion = Religion.NorsePagan;
    char.stats.faith = clampStat(char.stats.faith + 8);
    title = 'Returned to the Old Norse Gods';
    titleFa = 'بازگشت به آیین خدایان کهن شمال';
    text = `Beside the hearth, you consecrated an oath-ring to Thor, Odin, and Freyr according to ancestral custom.`;
    textFa = `در کنار آتش تالار، حلقه سوگند را به نام ثور، اودین و فریر متبرک کردید و به آیین نیاکان بازگشتید.`;
    deltas.push('Faith: Old Norse Gods');
    deltasFa.push('آیین: خدایان کهن اسکاندیناوی');
  } else if (actionType === 'convert_christian') {
    char.religion = Religion.Christian;
    char.stats.faith = clampStat(char.stats.faith + 8);
    char.skills.diplomacy = clampSkill(char.skills.diplomacy + 5);
    title = 'Accepted Christian Baptism';
    titleFa = 'پذیرش غسل تعمید و آیین مسیحیت';
    text = `Clad in white linen, you accepted Christian baptism, opening smoother trade and diplomacy with English and Frankish rulers.`;
    textFa = `با جامه کتان سپید غسل تعمید پذیرفتید؛ تصمیمی که دروازه‌های تجارت و سیاست را با دربارهای انگلستان و اروپا به رویتان می‌گشاید.`;
    deltas.push('Faith: Christian', 'Diplomacy +5');
    deltasFa.push('آیین: مسیحی', 'سیاست +5');
  } else if (actionType === 'claim_rank') {
    consumeAction = false;
    const nextRank = getClaimableNextTitle(state);
    if (!nextRank) return state;
    char.title = nextRank;
    realm.fame += 35;
    char.stats.honor = clampStat(char.stats.honor + 12);
    const rankEn = TITLE_LABELS.en[nextRank];
    const rankFa = TITLE_LABELS.fa[nextRank];
    title = `Acclaimed as ${rankEn}!`;
    titleFa = `ارتقای مقام به «${rankFa}»!`;
    text = `Striking weapons against shields at the assembly, warriors and landowners hailed ${char.givenName} ${char.patronymic} as ${rankEn}!`;
    textFa = `جنگجویان و بزرگان با کوبیدن شمشیر بر سپرها در شورا، «${formatPersonName(`${char.givenName} ${char.patronymic}`, 'fa')}» را به مقام «${rankFa}» برگزیدند!`;
    deltas.push(`New Rank: ${SHORT_TITLE_LABELS.en[nextRank]}`, '+35 Fame');
    deltasFa.push(`مقام جدید: ${SHORT_TITLE_LABELS.fa[nextRank]}`, '+35 شهرت');
  } else if (actionType === 'court_spouse') {
    if (relationships.some((r) => r.role === 'Spouse' && r.alive)) return state;
    if (realm.silver < 15) return state;
    realm.silver -= 15;
    const spSex = char.sex === Sex.Male ? Sex.Female : Sex.Male;
    const pool = spSex === Sex.Male ? MALE_NAMES_BY_REGION[loc.regionGroup] : FEMALE_NAMES_BY_REGION[loc.regionGroup];
    const spName = `${rng.pick(pool)} ${makePatronymic(rng.pick(MALE_NAMES_BY_REGION[loc.regionGroup]), spSex)}`;
    const spNameFa = formatPersonName(spName, 'fa');
    relationships.push({
      id: `rel_sp_${state.year}_${relationships.length}_${rng.int(100, 999)}`,
      name: spName,
      sex: spSex,
      role: 'Spouse',
      age: Math.max(18, char.age + rng.int(-4, 3)),
      alive: true,
      affinity: 82,
      socialClass: char.socialClass,
      locationId: loc.id,
      traits: [rng.pick(['charismatic', 'cunning', 'law_speaker', 'brave'])],
    });
    char.stats.happiness = clampStat(char.stats.happiness + 12);
    title = `Wedding Feast with ${spName}`;
    titleFa = `پیوند زناشویی با «${spNameFa}»`;
    text = `Paying the honorable bride-gift (15 silver), you wed ${spName} amid three nights of feasting at ${loc.name}.`;
    textFa = `با پرداخت مهریه محترمانه (۱۵ نقره) و سه شب جشن و سرور در ${locFa}، با «${spNameFa}» پیمان زناشویی بستید.`;
    deltas.push('-15 Silver', `Married ${spName}`, 'Happiness +12');
    deltasFa.push('-15 نقره', `ازدواج با ${spNameFa}`, 'شادی +12');
  } else if (actionType === 'divorce_spouse') {
    const idx = relationships.findIndex((r) => r.role === 'Spouse' && r.alive);
    if (idx < 0) return state;
    const ex = relationships[idx];
    const exFa = formatPersonName(ex.name, 'fa');
    const settlementCost = Math.min(realm.silver, Math.max(10, Math.round(realm.silver * 0.2)));
    realm.silver = Math.max(0, realm.silver - settlementCost);
    char.stats.happiness = clampStat(char.stats.happiness - 14);
    relationships.splice(idx, 1);

    const feudTriggered = rng.chance(0.4);
    if (feudTriggered) {
      const kinGiven = rng.pick(MALE_NAMES_BY_REGION[loc.regionGroup]);
      const kinName = `${kinGiven} ${makePatronymic(rng.pick(MALE_NAMES_BY_REGION[loc.regionGroup]), Sex.Male)}`;
      relationships.push({
        id: `rel_div_feud_${state.year}_${rng.int(100, 999)}`,
        name: kinName,
        sex: Sex.Male,
        role: 'Blood-Feud Enemy',
        age: Math.max(20, ex.age + rng.int(-3, 5)),
        alive: true,
        affinity: 6,
        socialClass: char.socialClass,
        locationId: loc.id,
        traits: ['wrathful'],
      });
    }

    title = `Threshold Divorce Declared`;
    titleFa = `طلاق رسمی جلوی چهارچوب در`;
    text = feudTriggered
      ? `You divorced ${ex.name}, paying ${settlementCost} silver settlement (-14 Happiness) — and ${ex.name}’s furious brother swore a blood-feud against you!`
      : `Calling witnesses to the threshold, you divorced ${ex.name}, paying ${settlementCost} silver property settlement (-14 Happiness).`;
    textFa = feudTriggered
      ? `از «${exFa}» جدا شدی و ${settlementCost} نقره مهریه و سهم اموال دادی (شادی -14) — اما برادرِ عصبانی‌اش قسمِ انتقام خونی با خاندانت خورد!`
      : `در حضور شاهدان رسماً از «${exFa}» جدا شدی؛ ${settlementCost} نقره سهم اموال پرداختی و دل‌گرفته شدی (شادی -14).`;
    deltas.push(`-${settlementCost} Silver`, 'Happiness -14');
    deltasFa.push(`-${settlementCost} نقره`, 'شادی -14');
    if (feudTriggered) {
      deltas.push('New Blood-Feud!');
      deltasFa.push('دشمنِ خونی جدید!');
    }
  } else if (actionType === 'pay_wergild') {
    if (realm.silver < 30) return state;
    const idx = relationships.findIndex(
      (r) => (r.role === 'Blood-Feud Enemy' || r.role === 'Rival') && r.alive
    );
    if (idx < 0) return state;
    const foe = relationships[idx];
    const foeFa = formatPersonName(foe.name, 'fa');
    realm.silver -= 30;
    relationships.splice(idx, 1);
    realm.stability = clampStat(realm.stability + 8);
    char.skills.law = clampSkill(char.skills.law + 4);
    title = `Blood-Feud Ended by Wergild`;
    titleFa = `پایان دشمنی خونی با پرداخت خون‌بها (ورگیلد)`;
    text = `Weighing 30 silver rings at the Thing council, you settled the feud with ${foe.name} honorably under peace-oaths.`;
    textFa = `با پرداخت ۳۰ حلقه نقره در شورای ثینگ، کینه و دشمنی با «${foeFa}» را به شیوه‌ای آبرومندانه و با سوگند صلح پایان دادید.`;
    deltas.push('-30 Silver', `Ended Feud with ${foe.name}`, 'Stability +8');
    deltasFa.push('-30 نقره', `پایان دشمنی با ${foeFa}`, 'ثبات +8');
  } else if (actionType === 'holmgang_rival') {
    const idx = relationships.findIndex(
      (r) => (r.role === 'Blood-Feud Enemy' || r.role === 'Rival') && r.alive && r.id === extraParam
    );
    const targetIdx =
      idx >= 0
        ? idx
        : relationships.findIndex((r) => (r.role === 'Blood-Feud Enemy' || r.role === 'Rival') && r.alive);
    if (targetIdx < 0) return state;
    const foe = relationships[targetIdx];
    const foeFa = formatPersonName(foe.name, 'fa');
    const roll = char.skills.combat + char.stats.strength * 0.5 + rng.int(-15, 25);
    const isMild = state.settings.contentIntensity === ContentIntensity.Mild;
    if (roll >= 48) {
      relationships[targetIdx] = {
        ...foe,
        alive: false,
        deathYear: state.year,
        causeOfDeath: isMild
          ? `Defeated in holmgang duel by ${char.givenName}`
          : `Slain in holmgang duel by ${char.givenName}`,
        causeOfDeathFa: isMild
          ? `شکست‌خورده در دوئل رسمی برابر ${formatPersonName(char.givenName, 'fa')}`
          : `کشته‌شده در دوئل هولم‌گانگ به دست ${formatPersonName(char.givenName, 'fa')}`,
      };
      char.killsInHolmgang += 1;
      realm.silver += 22;
      realm.fame += 28;
      char.stats.honor = clampStat(char.stats.honor + 12);
      char.skills.combat = clampSkill(char.skills.combat + 6);
      title = `Victory in the Holmgang Duel!`;
      titleFa = `پیروزی در دوئل تن‌به‌تن (هولم‌گانگ)!`;
      text = isMild
        ? `Inside the staked duel-ring, your strike disarmed ${foe.name} cleanly and ended the rivalry once and for all!`
        : `Inside the staked duel-ring, your blade split ${foe.name}’s shield and ended the rivalry once and for all!`;
      textFa = isMild
        ? `در محوطه دوئل، با حرکت سریع «${foeFa}» را خلع سلاح کردی و برای همیشه به این رقابت پایان دادی!`
        : `درون محوطه دوئل، ضربه پولادین شما سپر «${foeFa}» را شکافت و برای همیشه به این رقابت پایان داد!`;
      deltas.push('+22 Silver', '+28 Fame', 'Honor +12');
      deltasFa.push('+22 نقره', '+28 شهرت', 'شرافت +12');
    } else {
      char.stats.health = clampStat(char.stats.health - 22);
      if (!char.traits.includes('battle_scarred')) char.traits.push('battle_scarred');
      title = `Wounded in the Holmgang Duel`;
      titleFa = `زخمی‌شدن در دوئل هولم‌گانگ`;
      text = isMild
        ? `${foe.name} overwhelmed your guard in the duel-ring, forcing you to pay 12 silver duel-ransom to step out!`
        : `${foe.name} drew first blood in the duel-ring, forcing you to pay 12 silver duel-ransom to step out alive!`;
      textFa = isMild
        ? `«${foeFa}» در میدان دوئل بر تو چیره شد و ناچار شدی طبق قانون ۱۲ سکه نقره غرامت بدهی تا نبرد متوقف شود!`
        : `«${foeFa}» در میدان دوئل نخستین زخم را بر شما وارد کرد و ناچار شدید طبق قانون ۱۲ سکه نقره بپردازید تا نبرد متوقف شود!`;
      realm.silver = Math.max(0, realm.silver - 12);
      deltas.push('Health -22', '-12 Silver');
      deltasFa.push('سلامتی -22', '-12 نقره');
    }
  }

  const actLogId = `log_act_${actionType}_${state.year}_${state.lifeLog.length}_${rng.int(100, 999)}`;
  const nextYearlyUsed = { ...(state.yearlyActivitiesUsed ?? {}) };
  if (actionType === 'trade_voyage') nextYearlyUsed.trade = true;
  if (actionType === 'farm_settle') nextYearlyUsed.settle = true;

  const nextFamUsed = { ...(state.familyInteractionsUsed ?? {}) };
  if (oncePerYearFreeActions.has(actionType)) {
    nextFamUsed[`act_${actionType}`] = true;
  }

  const iconType =
    actionType === 'trade_voyage' || actionType === 'farm_settle'
      ? 'coin'
      : actionType === 'build_longship' || actionType === 'build_knarr'
        ? 'ship'
        : actionType === 'holmgang_rival' || actionType === 'recruit_hird'
          ? 'sword'
          : actionType === 'court_spouse' || actionType === 'divorce_spouse'
            ? 'heart'
            : actionType === 'convert_pagan' || actionType === 'convert_christian'
              ? 'religion'
              : 'crown';

  const nextState: FullGameState = {
    ...state,
    rngState: rng.getState(),
    divorcesCount:
      actionType === 'divorce_spouse' ? (state.divorcesCount ?? 0) + 1 : state.divorcesCount ?? 0,
    actionsRemainingThisTurn: consumeAction
      ? Math.max(0, state.actionsRemainingThisTurn - 1)
      : state.actionsRemainingThisTurn,
    yearlyActivitiesUsed: nextYearlyUsed,
    familyInteractionsUsed: nextFamUsed,
    character: char,
    realm,
    relationships,
    flags: state.flags.filter((f) => !(actionType === 'pay_wergild' && f === 'feud_neighbor_active')),
    lifeLog: [
      ...state.lifeLog,
      {
        id: actLogId,
        year: state.year,
        season: state.season,
        age: char.age,
        locationName: loc.name,
        category: 'Action',
        iconType,
        title,
        titleFa,
        text,
        textFa,
        deltas,
        deltasFa,
      },
    ],
    lastOutcomeBanner: {
      title,
      titleFa,
      text,
      textFa,
      deltaSummary: deltas,
      deltaSummaryFa: deltasFa,
    },
  };

  nextState.achievements = evaluateAchievements(nextState);
  if (char.stats.health <= 0) {
    return triggerDeathState(
      nextState,
      'Died of wounds taken in a holmgang duel.',
      'جان‌باختن بر اثر زخم‌های عمیق در دوئل هولم‌گانگ.'
    );
  }
  return nextState;
}

export function executeTrainSkillAction(state: FullGameState, skill: SkillKey): FullGameState {
  if (state.yearlyActivitiesUsed?.train) return state;
  const rng = new SeededRNG(state.rngState);
  const gain = rng.int(5, 9);
  const char: CharacterState = {
    ...state.character,
    stats: { ...state.character.stats },
    skills: {
      ...state.character.skills,
      [skill]: clampSkill(state.character.skills[skill] + gain),
    },
  };
  const deltas: string[] = [];
  const deltasFa: string[] = [];
  const labelEn = SKILL_LABELS.en[skill];
  const labelFa = SKILL_LABELS.fa[skill];
  deltas.push(`${labelEn} +${gain}`);
  deltasFa.push(`${labelFa} +${gain}`);

  if (skill === 'combat') {
    char.stats.strength = clampStat(char.stats.strength + 3);
    deltas.push('Strength +3');
    deltasFa.push('قدرت بدنی +3');
  }
  if (skill === 'skaldcraft') {
    char.stats.charisma = clampStat(char.stats.charisma + 3);
    deltas.push('Charisma +3');
    deltasFa.push('کاریزما +3');
  }
  if (skill === 'law') {
    char.stats.cunning = clampStat(char.stats.cunning + 3);
    deltas.push('Cunning +3');
    deltasFa.push('ذکاوت +3');
  }

  const loc = SETTLEMENTS_BY_ID[char.locationId] ?? SETTLEMENTS[0];
  const locFa = SETTLEMENTS_FA[loc.id]?.name ?? loc.name;
  const text = `Dedicated practice in ${labelEn.toLowerCase()} at ${loc.name} sharpened your edge.`;
  const textFa = `تمرین جدی «${labelFa}» در ${locFa} حسابی کارکشته‌ترت کرد!`;
  const trainLogId = `log_train_${skill}_${state.year}_${state.lifeLog.length}_${rng.int(100, 999)}`;

  return {
    ...state,
    rngState: rng.getState(),
    yearlyActivitiesUsed: { ...(state.yearlyActivitiesUsed ?? {}), train: true },
    character: char,
    lifeLog: [
      ...state.lifeLog,
      {
        id: trainLogId,
        year: state.year,
        season: state.season,
        age: char.age,
        locationName: loc.name,
        category: 'Action',
        iconType: skill === 'combat' ? 'sword' : skill === 'seamanship' ? 'ship' : 'crown',
        title: `Trained ${labelEn}`,
        titleFa: `تمرین مهارت: ${labelFa}`,
        text,
        textFa,
        deltas,
        deltasFa,
      },
    ],
    lastOutcomeBanner: {
      title: `Trained ${labelEn}`,
      titleFa: `تمرین مهارت: ${labelFa}`,
      text,
      textFa,
      deltaSummary: deltas,
      deltaSummaryFa: deltasFa,
    },
  };
}

export function executeCityConquestAction(
  state: FullGameState,
  settlementId?: string
): FullGameState {
  if (state.yearlyActivitiesUsed?.settle) return state;
  const targetId = settlementId ?? state.character.locationId;
  const target = SETTLEMENTS_BY_ID[targetId];
  if (!target || !isFortifiedEnemyCity(state, target.id)) return state;
  if (state.realm.longships < 1 || state.realm.hirdWarriors < 12) return state;

  const rng = new SeededRNG(state.rngState);
  const isMild = state.settings.contentIntensity === ContentIntensity.Mild;

  const char: CharacterState = {
    ...state.character,
    locationId: target.id,
    stats: { ...state.character.stats },
    skills: { ...state.character.skills },
    traits: [...state.character.traits],
  };
  const realm = {
    ...state.realm,
    holdings: state.realm.holdings.map((h) => ({ ...h, buildings: [...h.buildings] })),
  };

  const attackPower =
    realm.hirdWarriors * 1.5 +
    realm.longships * 12 +
    char.skills.combat * 0.9 +
    char.stats.strength * 0.4 +
    rng.int(-15, 25);
  const cityPower = target.baseDefense * 16 + 30;
  const targetFa = SETTLEMENTS_FA[target.id]?.name ?? target.name;

  const discovered = new Set(state.discoveredSettlements);
  discovered.add(target.id);

  let title = '';
  let titleFa = '';
  let text = '';
  let textFa = '';
  const deltas: string[] = [];
  const deltasFa: string[] = [];
  const won = attackPower >= cityPower;

  if (won) {
    const losses = Math.min(realm.hirdWarriors, rng.int(2, 6));
    const spoilSilver = target.baseWealth * 12;
    realm.hirdWarriors = Math.max(0, realm.hirdWarriors - losses);
    realm.silver += spoilSilver;
    realm.landFarms += 2;
    realm.fame += 45;
    realm.stability = clampStat(realm.stability + 6);
    char.stats.honor = clampStat(char.stats.honor + 14);
    char.skills.combat = clampSkill(char.skills.combat + 6);

    const existing = realm.holdings.find((h) => h.settlementId === target.id);
    if (existing) {
      existing.farms += 2;
      existing.garrison += 10;
    } else {
      realm.holdings.push({
        settlementId: target.id,
        farms: 2,
        buildings: [],
        garrison: 10,
        unrest: 25,
        norsePopulationShare: 25,
        tributeBurden: 'normal',
      });
    }

    title = `Conquered ${target.name}!`;
    titleFa = `فتح بزرگ شهر مستحکم «${targetFa}»!`;
    text = isMild
      ? `Battering the gates of ${target.name} with ${state.realm.longships} warships, the ruler surrendered the citadel, 2 fertile estates, and ${spoilSilver} silver tribute!`
      : `Ramming the gates of ${target.name} beneath locked shields, your warband broke the garrison, seizing the city, 2 estates, and ${spoilSilver} silver (-${losses} warriors)!`;
    textFa = isMild
      ? `با محاصره‌ی دروازه‌های «${targetFa}»، حاکم شهر تسلیم شد و کلید دژ، ۲ مزرعه بزرگ و ${spoilSilver} سکه نقره به چنگت افتاد!`
      : `سپر در سپر دروازه‌های سنگی «${targetFa}» را در هم شکستی و شهر، ۲ ملک حاصلخیز و ${spoilSilver} سکه نقره را فتح کردی (-${losses} جنگجو)!`;

    deltas.push(`+2 Farms (${target.name})`, `+${spoilSilver} Silver`, '+45 Fame');
    deltasFa.push(`+2 ملک (${targetFa})`, `+${spoilSilver} نقره`, '+45 شهرت');
    if (losses > 0) {
      deltas.push(`-${losses} Warriors`);
      deltasFa.push(`-${losses} جنگجو`);
    }
  } else {
    const losses = Math.min(realm.hirdWarriors, rng.int(4, 10));
    realm.hirdWarriors = Math.max(0, realm.hirdWarriors - losses);
    char.stats.health = clampStat(char.stats.health - 18);
    if (rng.chance(0.2) && !char.traits.includes('battle_scarred')) {
      char.traits.push('battle_scarred');
      deltas.push('Scar: Cheek-Scarred');
      deltasFa.push('جراحت: زخم چهره');
    }

    title = `Repulsed Before ${target.name}`;
    titleFa = `عقب‌نشینی از پای دیوارهای «${targetFa}»`;
    text = isMild
      ? `Towering stone walls at ${target.name} held out against your assault! Your battered warband pulled back to the ships (-${losses} warriors, -18 Health).`
      : `Heavy boulders and spear-volleys from ${target.name}’s ramparts smashed your scaling ladders! You dragged your wounded back to the oars (-${losses} warriors, -18 Health).`;
    textFa = isMild
      ? `دیوارهای بلند «${targetFa}» در برابر یورش شما مقاومت کرد و ناچار به عقب‌نشینی به سوی کشتی‌ها شدی (-${losses} جنگجو، سلامتی -18).`
      : `باران سنگ و نیزه از بالای باروی «${targetFa}» نردبان‌هایت را شکست و مجروح و خسته به سمت کشتی‌ها عقب نشستی (-${losses} جنگجو، سلامتی -18)!`;

    deltas.push(`-${losses} Warriors`, 'Health -18');
    deltasFa.push(`-${losses} جنگجو`, 'سلامتی -18');
  }

  const nextState: FullGameState = {
    ...state,
    rngState: rng.getState(),
    conquestsWon: won ? (state.conquestsWon ?? 0) + 1 : state.conquestsWon ?? 0,
    yearlyActivitiesUsed: { ...(state.yearlyActivitiesUsed ?? {}), settle: true },
    character: char,
    realm,
    discoveredSettlements: Array.from(discovered),
    lifeLog: [
      ...state.lifeLog,
      {
        id: `log_conq_${target.id}_${state.year}_${state.lifeLog.length}_${rng.int(100, 999)}`,
        year: state.year,
        season: state.season,
        age: char.age,
        locationName: target.name,
        category: 'War',
        iconType: 'sword',
        title,
        titleFa,
        text,
        textFa,
        deltas,
        deltasFa,
        isDanger: !won,
      },
    ],
    lastOutcomeBanner: {
      title,
      titleFa,
      text,
      textFa,
      deltaSummary: deltas,
      deltaSummaryFa: deltasFa,
    },
  };

  nextState.achievements = evaluateAchievements(nextState);

  if (!won && (char.stats.health <= 0 || rng.chance(0.1))) {
    return triggerDeathState(
      nextState,
      `Struck down by a heavy rampart stone while storming the gates of ${target.name}.`,
      `هنگام یورش به دروازه‌ی مستحکم «${targetFa}»، تختهسنگی از بالای برج صاف آمد سر وقتت!`,
      'death_siege_rock'
    );
  }

  return nextState;
}

export type SiegeApproach = 'assault' | 'blockade' | 'demand_tribute';

export function executeBesiegeAction(
  state: FullGameState,
  settlementId: string,
  approach: SiegeApproach = 'assault'
): FullGameState {
  if (state.yearlyActivitiesUsed?.raid) return state;
  const target = SETTLEMENTS_BY_ID[settlementId];
  if (!target) return state;
  if (state.realm.longships < 1 && state.realm.hirdWarriors < 6) return state;

  const rng = new SeededRNG(state.rngState);
  const isMild = state.settings.contentIntensity === ContentIntensity.Mild;
  const targetFa = SETTLEMENTS_FA[target.id]?.name ?? target.name;

  const char: CharacterState = {
    ...state.character,
    stats: { ...state.character.stats },
    skills: { ...state.character.skills },
    traits: [...state.character.traits],
  };
  const realm = {
    ...state.realm,
    holdings: state.realm.holdings.map((h) => ({ ...h, buildings: [...h.buildings] })),
  };

  const currentStatuses = { ...(state.settlementStatuses ?? {}) };
  const currentTributaries = [...(state.tributaries ?? [])];
  const discovered = new Set(state.discoveredSettlements);
  discovered.add(target.id);

  let title = '';
  let titleFa = '';
  let text = '';
  let textFa = '';
  const deltas: string[] = [];
  const deltasFa: string[] = [];
  let isDanger = false;
  let won = false;

  if (approach === 'assault') {
    const attackPower =
      realm.hirdWarriors * 1.5 +
      realm.longships * 14 +
      char.skills.combat * 0.9 +
      char.stats.strength * 0.4 +
      rng.int(-12, 22);
    const defensePower = target.baseDefense * 14 + 25;
    won = attackPower >= defensePower;

    if (won) {
      const losses = Math.min(realm.hirdWarriors, rng.int(2, 6));
      const spoilSilver = target.baseWealth * 15 + rng.int(25, 60);
      realm.hirdWarriors = Math.max(0, realm.hirdWarriors - losses);
      realm.silver += spoilSilver;
      realm.landFarms += 2;
      realm.fame += 45;
      realm.stability = clampStat(realm.stability + 6);
      char.stats.honor = clampStat(char.stats.honor + 12);
      char.skills.combat = clampSkill(char.skills.combat + 5);

      const existing = realm.holdings.find((h) => h.settlementId === target.id);
      if (existing) {
        existing.farms += 2;
        existing.garrison += 8;
      } else {
        realm.holdings.push({
          settlementId: target.id,
          farms: 2,
          buildings: [],
          garrison: 8,
          unrest: 25,
          norsePopulationShare: 25,
          tributeBurden: 'normal',
        });
      }
      currentStatuses[target.id] = 'conquered';

      title = `Breached the Gates of ${target.name}!`;
      titleFa = `شکستن دروازه‌ها و تسخیر «${targetFa}»!`;
      text = isMild
        ? `Under covered dragon-shields, your warriors breached ${target.name}’s outer gates! The garrison yielded the citadel, 2 fertile estates, and ${spoilSilver} silver in tribute.`
        : `Swarming the stone ramparts with battleaxes, your warband smashed the defenders of ${target.name}! Seizing 2 estates and ${spoilSilver} silver in spoils (-${losses} warriors).`;
      textFa = isMild
        ? `با سپرپوش‌های اژدهایی، دژ «${targetFa}» را گشودید! مدافعان تسلیم شدند و ۲ ملک حاصلخیز و ${spoilSilver} سکه نقره نصیب خاندان شد.`
        : `با تبرزین‌های بران از باروی «${targetFa}» بالا رفتید و شهر را گشودید! ۲ ملک و ${spoilSilver} سکه نقره به چنگ آمد (-${losses} جنگجو).`;

      deltas.push(`Conquered ${target.name}`, `+${spoilSilver} Silver`, '+2 Farms', '+45 Fame');
      deltasFa.push(`تسخیر ${targetFa}`, `+${spoilSilver} نقره`, '+2 ملک', '+45 شهرت');
      if (losses > 0) {
        deltas.push(`-${losses} Warriors`);
        deltasFa.push(`-${losses} جنگجو`);
      }
    } else {
      isDanger = true;
      const losses = Math.min(realm.hirdWarriors, rng.int(3, 8));
      realm.hirdWarriors = Math.max(0, realm.hirdWarriors - losses);
      char.stats.health = clampStat(char.stats.health - 18);
      title = `Assault Repulsed at ${target.name}`;
      titleFa = `عقب‌نشینی از پای دیوارهای «${targetFa}»`;
      text = `Heavy iron-tipped stakes and catapult fire from ${target.name} broke your assault ladders! Your warband retreated back to the ships (-${losses} warriors, -18 Health).`;
      textFa = `سنگ‌اندازها و موانع چوبی «${targetFa}» نردبان‌های یورش را شکست و ناچار به عقب‌نشینی به کشتی‌ها شدید (-${losses} جنگجو، سلامتی -18).`;
      deltas.push(`-${losses} Warriors`, 'Health -18');
      deltasFa.push(`-${losses} جنگجو`, 'سلامتی -18');
    }
  } else if (approach === 'blockade') {
    const blockadePower =
      (realm.longships + realm.knarrs) * 16 +
      char.skills.seamanship * 0.8 +
      char.stats.cunning * 0.5 +
      rng.int(-10, 20);
    const resistancePower = target.baseDefense * 11 + 20;
    won = blockadePower >= resistancePower;

    if (won) {
      const ransomSilver = target.baseWealth * 12 + rng.int(15, 40);
      realm.silver += ransomSilver;
      realm.fame += 30;
      char.skills.seamanship = clampSkill(char.skills.seamanship + 4);
      char.stats.cunning = clampStat(char.stats.cunning + 3);

      if (!currentTributaries.includes(target.id)) {
        currentTributaries.push(target.id);
      }
      currentStatuses[target.id] = 'tributary';

      title = `${target.name} Starved into Submission`;
      titleFa = `تسلیم «${targetFa}» بر اثر محاصره دریایی`;
      text = `Closing harbor boom-chains and throttling supply knarrs, ${target.name} had to sue for terms! They paid ${ransomSilver} silver immediately and swore annual tribute.`;
      textFa = `با بستن دهانه بندر و قطع آذوقه، حاکم «${targetFa}» تسلیم شد، ${ransomSilver} سکه نقره باج داد و متعهد به پرداخت خراج سالانه گشت.`;
      deltas.push(`Tributary: ${target.name}`, `+${ransomSilver} Silver`, '+30 Fame');
      deltasFa.push(`خراجگزار: ${targetFa}`, `+${ransomSilver} نقره`, '+30 شهرت');
    } else {
      isDanger = true;
      const shipDmg = Math.min(realm.silver, 8);
      realm.silver = Math.max(0, realm.silver - shipDmg);
      title = `Blockade Broken at ${target.name}`;
      titleFa = `شکست محاصره در دهانه «${targetFa}»`;
      text = `A nighttime sortie of fire-hulks from ${target.name} scattered your blockade cordon! You were forced to raise anchor and clear the channel (-8 Silver repairs).`;
      textFa = `شبیخون قایق‌های آتشین مدافعان «${targetFa}» خط محاصره را شکست و ناچار به کشیدن لنگر شدید (-8 نقره خسارت).`;
      deltas.push('-8 Silver (Repairs)');
      deltasFa.push('-8 نقره (تعمیرات)');
    }
  } else {
    // Demand Tribute
    const intimiPower =
      realm.fame * 0.12 +
      realm.hirdWarriors * 0.8 +
      char.skills.diplomacy * 0.7 +
      char.skills.combat * 0.4 +
      rng.int(-8, 16);
    const demandDC = target.baseDefense * 9 + 25;
    won = intimiPower >= demandDC;

    if (won) {
      const tributeSilver = target.baseWealth * 11 + rng.int(20, 45);
      realm.silver += tributeSilver;
      realm.fame += 25;
      char.stats.honor = clampStat(char.stats.honor + 8);
      char.skills.diplomacy = clampSkill(char.skills.diplomacy + 4);

      if (!currentTributaries.includes(target.id)) {
        currentTributaries.push(target.id);
      }
      currentStatuses[target.id] = 'tributary';

      title = `Danegeld Extorted from ${target.name}`;
      titleFa = `دریافت باج دانگلد از بزرگان «${targetFa}»`;
      text = `Displaying drawn longships and ranked shield-walls before the harbor, ${target.name}’s council paid ${tributeSilver} silver Danegeld and swore peace-tribute.`;
      textFa = `با صف‌آرایی ناوگان و سپرداران در ساحل، شورای «${targetFa}» ناچار به پرداخت ${tributeSilver} سکه باج و تعهد خراج صلح شد.`;
      deltas.push(`Tributary: ${target.name}`, `+${tributeSilver} Silver`, '+25 Fame', 'Diplomacy +4');
      deltasFa.push(`خراجگزار: ${targetFa}`, `+${tributeSilver} نقره`, '+25 شهرت', 'دیپلماسی +4');
    } else {
      title = `Tribute Refused at ${target.name}`;
      titleFa = `رد تقاضای باج در «${targetFa}»`;
      text = `The ruler of ${target.name} laughed at your envoy from the battlements, daring your warband to test their stone walls.`;
      textFa = `حاکم «${targetFa}» از بالای بارو سفیر شما را به تمسخر گرفت و گفت دیوارها تسلیم رجزخوانی نمی‌شوند.`;
      deltas.push('Tribute Demand Spurned');
      deltasFa.push('رد درخواست خراج');
    }
  }

  const siegeLogId = `log_siege_${target.id}_${state.year}_${state.lifeLog.length}_${rng.int(100, 999)}`;
  const nextState: FullGameState = {
    ...state,
    rngState: rng.getState(),
    yearlyActivitiesUsed: { ...(state.yearlyActivitiesUsed ?? {}), raid: true },
    conquestsWon: won && approach === 'assault' ? (state.conquestsWon ?? 0) + 1 : state.conquestsWon ?? 0,
    character: char,
    realm,
    tributaries: currentTributaries,
    settlementStatuses: currentStatuses,
    discoveredSettlements: Array.from(discovered),
    lifeLog: [
      ...state.lifeLog,
      {
        id: siegeLogId,
        year: state.year,
        season: state.season,
        age: char.age,
        locationName: target.name,
        category: 'War',
        iconType: 'sword',
        title,
        titleFa,
        text,
        textFa,
        deltas,
        deltasFa,
        isDanger,
      },
    ],
    lastOutcomeBanner: {
      title,
      titleFa,
      text,
      textFa,
      deltaSummary: deltas,
      deltaSummaryFa: deltasFa,
    },
  };

  nextState.achievements = evaluateAchievements(nextState);
  return nextState;
}

export function executeSettleAction(
  state: FullGameState,
  settlementId: string
): FullGameState {
  if (state.yearlyActivitiesUsed?.settle) return state;
  const target = SETTLEMENTS_BY_ID[settlementId];
  if (!target) return state;
  const cost = 30;
  if (state.realm.silver < cost) return state;

  const rng = new SeededRNG(state.rngState);
  const targetFa = SETTLEMENTS_FA[target.id]?.name ?? target.name;

  const char: CharacterState = {
    ...state.character,
    locationId: target.id,
    stats: { ...state.character.stats },
    skills: {
      ...state.character.skills,
      farming: clampSkill(state.character.skills.farming + 5),
    },
  };

  const realm = {
    ...state.realm,
    silver: state.realm.silver - cost,
    landFarms: state.realm.landFarms + 1,
    foodStores: state.realm.foodStores + 18,
    fame: state.realm.fame + (target.regionGroup === 'North Atlantic' ? 24 : 10),
    holdings: state.realm.holdings.map((h) => ({ ...h, buildings: [...h.buildings] })),
  };

  const existing = realm.holdings.find((h) => h.settlementId === target.id);
  if (existing) {
    existing.farms += 1;
  } else {
    realm.holdings.push({
      settlementId: target.id,
      farms: 1,
      buildings: [],
      garrison: 3,
      unrest: 0,
      norsePopulationShare: 80,
      tributeBurden: 'normal',
    });
  }

  const currentStatuses = { ...(state.settlementStatuses ?? {}) };
  if (!currentStatuses[target.id] || currentStatuses[target.id] === 'independent') {
    currentStatuses[target.id] = 'conquered';
  }

  const discovered = new Set(state.discoveredSettlements);
  discovered.add(target.id);

  const title = `Founded Norse Settlement at ${target.name}`;
  const titleFa = `احداث و آبادانی شهرک نورس در «${targetFa}»`;
  const text = `Bringing seed grain, timber, and kinfolk to ${target.name}, you drove Norse land-stakes and established a productive family estate.`;
  const textFa = `با بردن بذر، الوار و افراد خاندان به «${targetFa}»، سنگ‌های مرزی را نشاندید و شهرک جدید و باصفایی برای خاندان پایه‌گذاری کردید.`;
  const deltas = ['-30 Silver', '+1 Farm', '+18 Food', 'Farming +5'];
  const deltasFa = ['-30 نقره', '+1 مزرعه', '+18 آذوقه', 'کشاورزی +5'];

  const settleLogId = `log_settle_${target.id}_${state.year}_${state.lifeLog.length}_${rng.int(100, 999)}`;
  const nextState: FullGameState = {
    ...state,
    rngState: rng.getState(),
    yearlyActivitiesUsed: { ...(state.yearlyActivitiesUsed ?? {}), settle: true },
    character: char,
    realm,
    settlementStatuses: currentStatuses,
    discoveredSettlements: Array.from(discovered),
    lifeLog: [
      ...state.lifeLog,
      {
        id: settleLogId,
        year: state.year,
        season: state.season,
        age: char.age,
        locationName: target.name,
        category: 'Farm Life',
        iconType: 'crown',
        title,
        titleFa,
        text,
        textFa,
        deltas,
        deltasFa,
      },
    ],
    lastOutcomeBanner: {
      title,
      titleFa,
      text,
      textFa,
      deltaSummary: deltas,
      deltaSummaryFa: deltasFa,
    },
  };

  nextState.achievements = evaluateAchievements(nextState);
  return nextState;
}

export type DiplomacyApproach = 'trade_pact' | 'varangian_oath' | 'tribute_demand';

export function executeDiplomacyAction(
  state: FullGameState,
  settlementId: string,
  approach: DiplomacyApproach
): FullGameState {
  if (state.yearlyActivitiesUsed?.trade) return state;
  const target = SETTLEMENTS_BY_ID[settlementId];
  if (!target) return state;

  const rng = new SeededRNG(state.rngState);
  const targetFa = SETTLEMENTS_FA[target.id]?.name ?? target.name;
  const char: CharacterState = {
    ...state.character,
    stats: { ...state.character.stats },
    skills: { ...state.character.skills },
    traits: [...state.character.traits],
  };
  const realm = { ...state.realm };
  const currentStatuses = { ...(state.settlementStatuses ?? {}) };
  const currentTributaries = [...(state.tributaries ?? [])];

  let title = '';
  let titleFa = '';
  let text = '';
  let textFa = '';
  const deltas: string[] = [];
  const deltasFa: string[] = [];

  if (approach === 'varangian_oath') {
    const goldGift = 45;
    realm.silver += goldGift;
    realm.fame += 35;
    char.stats.honor = clampStat(char.stats.honor + 15);
    char.skills.combat = clampSkill(char.skills.combat + 5);
    char.skills.diplomacy = clampSkill(char.skills.diplomacy + 3);
    if (!char.traits.includes('varangian_guard')) {
      char.traits.push('varangian_guard');
      deltas.push('Trait: Varangian Guard');
      deltasFa.push('ویژگی: محافظ امپراتور (وارنگیان)');
    }

    title = `Swore the Varangian Oath at ${target.name}!`;
    titleFa = `سوگند وفاداری گارد وارنگیان در «${targetFa}»!`;
    text = `Standing beneath the gold mosaics of the imperial palace at ${target.name}, you touched your two-handed axe to the sacred altar, entering the elite Varangian Guard and receiving ${goldGift} imperial solidi!`;
    textFa = `زیر کاشی‌های زرین کاخ امپراتوری در «${targetFa}»، تبر دولبه‌ات را بر محراب مقدس گذاشتی و با ورود به گارد سلطنتی وارنگیان، ${goldGift} سکه طلای ناب دریافت کردی!`;
    deltas.push(`+${goldGift} Silver`, '+35 Fame', 'Honor +15', 'Combat +5');
    deltasFa.push(`+${goldGift} نقره`, '+35 شهرت', 'شرافت +15', 'نبرد +5');
  } else if (approach === 'trade_pact') {
    if (realm.silver < 10) return state;
    realm.silver -= 10;
    const profit = Math.round(18 + target.baseWealth * 3 + char.skills.trade * 0.4);
    realm.silver += profit;
    realm.tradeNetworks = Math.min(6, realm.tradeNetworks + 1);
    char.skills.diplomacy = clampSkill(char.skills.diplomacy + 4);
    char.skills.trade = clampSkill(char.skills.trade + 4);
    realm.fame += 15;

    title = `Commercial Treaty Sealed at ${target.name}`;
    titleFa = `امضای پیمان تجاری و حقوق گمرکی در «${targetFa}»`;
    text = `Exchanging gifts and silver seals with the merchants of ${target.name}, your dynasty established guaranteed toll rights and lucrative trade routes.`;
    textFa = `با تبادل هدایا و مهرهای سیمین با بزرگان «${targetFa}»، خاندان شما حقوق ویژه بازرگانی و مسیر جدید تجاری تثبیت کرد.`;
    deltas.push(`+${profit - 10} Net Silver`, 'Trade Route +1', 'Diplomacy +4', 'Trade +4');
    deltasFa.push(`+${profit - 10} نقره خالص`, 'مسیر تجاری +1', 'دیپلماسی +4', 'تجارت +4');
  } else {
    // Tribute demand
    const intimiRoll = char.skills.diplomacy + realm.hirdWarriors * 0.7 + rng.int(5, 25);
    if (intimiRoll >= 35) {
      const tributeSilver = target.baseWealth * 10 + rng.int(15, 35);
      realm.silver += tributeSilver;
      realm.fame += 20;
      char.stats.honor = clampStat(char.stats.honor + 6);
      if (!currentTributaries.includes(target.id)) currentTributaries.push(target.id);
      currentStatuses[target.id] = 'tributary';

      title = `Diplomatic Danegeld at ${target.name}`;
      titleFa = `تسلیم باج صلح (دانگلد) در «${targetFa}»`;
      text = `Negotiating from a position of naval strength, the elders of ${target.name} offered ${tributeSilver} silver to ensure mutual peace and tributary status.`;
      textFa = `با مذاکره از موضع قدرت دریایی، بزرگان «${targetFa}» مبلغ ${tributeSilver} سکه نقره باج صلح پرداخت کردند.`;
      deltas.push(`Tributary: ${target.name}`, `+${tributeSilver} Silver`, '+20 Fame');
      deltasFa.push(`خراجگزار: ${targetFa}`, `+${tributeSilver} نقره`, '+20 شهرت');
    } else {
      title = `Diplomatic Envoy Rebuffed at ${target.name}`;
      titleFa = `رد مذاکره دیپلماتیک در «${targetFa}»`;
      text = `The magistrates of ${target.name} stood firm and refused any tributary overtures without blood being drawn.`;
      textFa = `مقامات «${targetFa}» درخواست خراج را رد کردند و گفتند بدون شمشیر باجی پرداخت نخواهد شد.`;
      deltas.push('Treaty Refused');
      deltasFa.push('رد پیشنهاد صلح');
    }
  }

  const diploLogId = `log_diplo_${target.id}_${state.year}_${state.lifeLog.length}_${rng.int(100, 999)}`;
  const nextState: FullGameState = {
    ...state,
    rngState: rng.getState(),
    yearlyActivitiesUsed: { ...(state.yearlyActivitiesUsed ?? {}), trade: true },
    character: char,
    realm,
    tributaries: currentTributaries,
    settlementStatuses: currentStatuses,
    lifeLog: [
      ...state.lifeLog,
      {
        id: diploLogId,
        year: state.year,
        season: state.season,
        age: char.age,
        locationName: target.name,
        category: 'Politics & Kings',
        iconType: 'crown',
        title,
        titleFa,
        text,
        textFa,
        deltas,
        deltasFa,
      },
    ],
    lastOutcomeBanner: {
      title,
      titleFa,
      text,
      textFa,
      deltaSummary: deltas,
      deltaSummaryFa: deltasFa,
    },
  };

  nextState.achievements = evaluateAchievements(nextState);
  return nextState;
}

export function executeLocalMarriageAction(
  state: FullGameState,
  settlementId: string
): FullGameState {
  const alreadyMarried = state.relationships.some((r) => r.role === 'Spouse' && r.alive);
  if (alreadyMarried || state.character.age < 16) return state;
  const target = SETTLEMENTS_BY_ID[settlementId];
  if (!target) return state;

  const cost = 16;
  if (state.realm.silver < cost) return state;

  const rng = new SeededRNG(state.rngState);
  const targetFa = SETTLEMENTS_FA[target.id]?.name ?? target.name;
  const char = {
    ...state.character,
    stats: { ...state.character.stats },
    skills: { ...state.character.skills },
  };
  const realm = { ...state.realm, silver: state.realm.silver - cost };
  const relationships = state.relationships.map((r) => ({ ...r }));

  const spSex = char.sex === Sex.Male ? Sex.Female : Sex.Male;
  const pool =
    spSex === Sex.Male
      ? MALE_NAMES_BY_REGION[target.regionGroup] ?? MALE_NAMES_BY_REGION['Norway']
      : FEMALE_NAMES_BY_REGION[target.regionGroup] ?? FEMALE_NAMES_BY_REGION['Norway'];
  const given = rng.pick(pool);
  const patPool = MALE_NAMES_BY_REGION[target.regionGroup] ?? MALE_NAMES_BY_REGION['Norway'];
  const patGiven = rng.pick(patPool);
  const spName = `${given} ${makePatronymic(patGiven, spSex)}`;
  const spNameFa = formatPersonName(spName, 'fa');

  const dowrySilver = rng.int(18, 32);
  realm.silver += dowrySilver;
  realm.fame += 20;
  char.stats.happiness = clampStat(char.stats.happiness + 14);
  char.stats.honor = clampStat(char.stats.honor + 8);
  char.skills.diplomacy = clampSkill(char.skills.diplomacy + 4);

  relationships.unshift({
    id: `rel_local_marry_${target.id}_${state.year}_${rng.int(100, 999)}`,
    name: spName,
    sex: spSex,
    role: 'Spouse',
    age: Math.max(16, char.age + rng.int(-3, 3)),
    alive: true,
    affinity: rng.int(80, 95),
    socialClass: char.socialClass,
    locationId: target.id,
    traits: [rng.pick(['charismatic', 'cunning', 'oath_keeper', 'law_speaker'])],
  });

  const title = `Noble Marriage Sealed at ${target.name}`;
  const titleFa = `پیوند زناشویی با خاندان سرشناس در «${targetFa}»`;
  const text = `Paying the honorable gift-feasts, you wed ${spName}, kin of the local ruling house at ${target.name}. They brought ${dowrySilver} silver dowry and strong cross-cultural friendship!`;
  const textFa = `با برگزاری جشن باشکوه در «${targetFa}»، با «${spNameFa}» از خاندان سرشناس شهر پیمان زناشویی بستید و ${dowrySilver} نقره جهیزیه و پیوند محکم نصیبتان شد!`;
  const deltas = [`Married ${spName}`, `+${dowrySilver - cost} Net Silver`, 'Happiness +14', 'Honor +8'];
  const deltasFa = [`ازدواج با ${spNameFa}`, `+${dowrySilver - cost} نقره خالص`, 'شادی +14', 'شرافت +8'];

  const marLogId = `log_mar_${target.id}_${state.year}_${state.lifeLog.length}_${rng.int(100, 999)}`;
  const nextState: FullGameState = {
    ...state,
    rngState: rng.getState(),
    character: char,
    realm,
    relationships,
    lifeLog: [
      ...state.lifeLog,
      {
        id: marLogId,
        year: state.year,
        season: state.season,
        age: char.age,
        locationName: target.name,
        category: 'Family',
        iconType: 'heart',
        title,
        titleFa,
        text,
        textFa,
        deltas,
        deltasFa,
      },
    ],
    lastOutcomeBanner: {
      title,
      titleFa,
      text,
      textFa,
      deltaSummary: deltas,
      deltaSummaryFa: deltasFa,
    },
  };

  nextState.achievements = evaluateAchievements(nextState);
  return nextState;
}

export function executeBuildHoldingAction(
  state: FullGameState,
  settlementId: string,
  building: BuildingType
): FullGameState {
  if (state.builtThisYear) return state;
  const bDef = BUILDINGS_CATALOG[building];
  if (!bDef || state.realm.silver < bDef.costSilver) return state;
  const holdingIdx = state.realm.holdings.findIndex((h) => h.settlementId === settlementId);
  if (holdingIdx < 0) return state;
  if (state.realm.holdings[holdingIdx].buildings.includes(building)) return state;

  const holdings = state.realm.holdings.map((h, idx) =>
    idx === holdingIdx
      ? {
          ...h,
          buildings: [...h.buildings, building],
          garrison: h.garrison + (building === 'ring_fortress' ? 12 : 0),
        }
      : h
  );

  const realm = {
    ...state.realm,
    silver: state.realm.silver - bDef.costSilver,
    fame: state.realm.fame + 20,
    stability: clampStat(state.realm.stability + (building === 'ring_fortress' ? 8 : 0)),
    tradeNetworks:
      building === 'kaupang_market' ? state.realm.tradeNetworks + 1 : state.realm.tradeNetworks,
    holdings,
  };

  const sName = SETTLEMENTS_BY_ID[settlementId]?.name ?? settlementId;
  const sNameFa = SETTLEMENTS_FA[settlementId]?.name ?? sName;
  const bFa = BUILDINGS_FA[building];
  const text = `Built a ${bDef.name} (${bDef.norseName}) on your estate at ${sName}.`;
  const textFa = `بنای «${bFa?.name ?? bDef.name}» در املاک شما در ${sNameFa} ساخته و آماده شد.`;

  const deltas = [
    `-${bDef.costSilver} Silver`,
    '+20 Fame',
    bDef.effectsLabel.split('·')[0].trim(),
  ];
  const deltasFa = [`-${bDef.costSilver} نقره`, '+20 شهرت', bFa?.shortEffect ?? ''];

  const builtState: FullGameState = {
    ...state,
    builtThisYear: true,
    realm,
    lifeLog: [
      ...state.lifeLog,
      {
        id: `log_bld_${building}_${settlementId}_${state.year}_${state.lifeLog.length}`,
        year: state.year,
        season: state.season,
        age: state.character.age,
        locationName: sName,
        category: 'Action',
        iconType: 'crown',
        title: `Built ${bDef.name}`,
        titleFa: `ساخت بنا: ${bFa?.name ?? bDef.name}`,
        text,
        textFa,
        deltas,
        deltasFa,
      },
    ],
    lastOutcomeBanner: {
      title: `Constructed ${bDef.name}`,
      titleFa: `ساخت بنا: ${bFa?.name ?? bDef.name}`,
      text,
      textFa,
      deltaSummary: deltas,
      deltaSummaryFa: deltasFa,
    },
  };

  builtState.achievements = evaluateAchievements(builtState);
  return builtState;
}

export function getClaimableNextTitle(state: FullGameState): TitleRank | null {
  const r = state.realm;
  const c = state.character;
  const title = c.title;

  if (title === TitleRank.Thrall) {
    return null; // Must use buy_freedom or event
  }
  if (title === TitleRank.Freeman) {
    if (r.landFarms >= 1 || r.hirdWarriors >= 4 || c.skills.combat >= 22 || r.silver >= 25) {
      return TitleRank.Hirdman;
    }
  } else if (title === TitleRank.Hirdman || title === TitleRank.Bonde) {
    if (c.skills.combat >= 32 && r.hirdWarriors >= 12 && r.fame >= 75 && c.stats.honor >= 35) {
      return TitleRank.Huscarl;
    }
  } else if (title === TitleRank.Huscarl || title === TitleRank.Hersir) {
    if ((r.longships >= 1 || r.knarrs >= 1) && r.hirdWarriors >= 22 && r.fame >= 150 && c.skills.seamanship >= 28) {
      return TitleRank.Captain;
    }
  } else if (title === TitleRank.Captain) {
    if (r.landFarms >= 4 && r.hirdWarriors >= 40 && (r.longships + r.knarrs) >= 2 && r.fame >= 300 && r.holdings.length >= 1) {
      return TitleRank.Jarl;
    }
  } else if (title === TitleRank.Jarl) {
    const controlledHoldings = r.holdings.length + (state.tributaries?.length ?? 0);
    if (r.landFarms >= 8 && r.hirdWarriors >= 85 && r.longships >= 3 && r.fame >= 550 && controlledHoldings >= 2) {
      return TitleRank.Konungr;
    }
  } else if (title === TitleRank.Konungr) {
    const regionsHeld = new Set(
      r.holdings.map((h) => SETTLEMENTS_BY_ID[h.settlementId]?.regionGroup).filter(Boolean)
    );
    const totalTributaries = state.tributaries?.length ?? 0;
    if ((regionsHeld.size >= 3 || totalTributaries >= 3) && r.hirdWarriors >= 150 && r.longships >= 5 && r.fame >= 900) {
      return TitleRank.Overking;
    }
  }
  return null;
}

export function getNextTitleRequirementText(title: TitleRank, lang: Language = 'en'): string {
  if (lang === 'fa') {
    switch (title) {
      case TitleRank.Thrall:
        return 'برای آزادی: ۲۵ نقره جمع کنید و از تب اقدامات، آزادی خود را بخرید.';
      case TitleRank.Freeman:
        return 'مقام بعدی — جنگجو (هیردمن): ۱ مزرعه یا ۴ جنگجو یا مهارت نبرد ۲۲ و ۲۵ نقره.';
      case TitleRank.Bonde:
      case TitleRank.Hirdman:
        return 'مقام بعدی — دلاور تالار (هوکارل): نبرد ۳۲، ۱۲ جنگجو، ۷۵ شهرت و ۳۵ شرافت.';
      case TitleRank.Hersir:
      case TitleRank.Huscarl:
        return 'مقام بعدی — ناخدا (کاپیتان کشتی): ۱ کشتی لانگ‌شیپ، ۲۲ جنگجو، دریانوردی ۲۸ و ۱۵۰ شهرت.';
      case TitleRank.Captain:
        return 'مقام بعدی — فرمانروا (یارل): ۴ مزرعه، ۴۰ جنگجو، ۲ کشتی، ۳۰۰ شهرت و تملک مقر.';
      case TitleRank.Jarl:
        return 'مقام بعدی — پادشاه (کونونگر): ۸ مزرعه، ۸۵ جنگجو، ۳ کشتی، ۵۵۰ شهرت و ۲ شهر زیر سلطه.';
      case TitleRank.Konungr:
        return 'مقام بعدی — شاهنشاه / شاه شاهان: تسلط بر ۳ منطقه، ۱۵۰ جنگجو، ۵ کشتی و ۹۰۰ شهرت.';
      case TitleRank.Overking:
        return 'بالاترین تاج و اقتدار در دستان شماست — شاهنشاه دریاهای شمال و اروپا!';
    }
  }
  switch (title) {
    case TitleRank.Thrall:
      return 'To become Free: Save 25 Silver and select "Buy Your Freedom" in Actions.';
    case TitleRank.Freeman:
      return 'Next Rank — Warrior (Hirdman): 1 Farm, 4+ Warriors, Combat 22+, or 25+ Silver.';
    case TitleRank.Bonde:
    case TitleRank.Hirdman:
      return 'Next Rank — Housecarl Champion (Húskarl): Combat 32+, 12+ Warriors, 75+ Fame, 35+ Honor.';
    case TitleRank.Hersir:
    case TitleRank.Huscarl:
      return 'Next Rank — Ship Captain (Stýrimaðr): 1+ Longship, 22+ Warriors, Seamanship 28+, 150+ Fame.';
    case TitleRank.Captain:
      return 'Next Rank — Jarl (Earl/Duke): 4+ Farms, 40+ Warriors, 2+ Ships, 300+ Fame, 1+ Holding.';
    case TitleRank.Jarl:
      return 'Next Rank — King (Konungr): 8+ Farms, 85+ Warriors, 3+ Ships, 550+ Fame, 2+ Controlled Holdings.';
    case TitleRank.Konungr:
      return 'Next Rank — High King / King of Kings: Hold lands in 3+ Regions, 150+ Warriors, 5+ Longships, 900+ Fame.';
    case TitleRank.Overking:
      return 'Supreme Crown Achieved — High King across Medieval Europe and Northern Seas!';
  }
}

export type FamilyInteractionType =
  | 'talk'
  | 'compliment'
  | 'gift'
  | 'lavish_gift'
  | 'feast_together'
  | 'spar'
  | 'council'
  | 'hunt_together'
  | 'teach'
  | 'bless_kin'
  | 'try_for_child'
  | 'argue'
  | 'send_envoy'
  | 'intimidate_foe'
  | 'peace_marry';

export function executeFamilyMemberInteraction(
  state: FullGameState,
  personId: string,
  interaction: FamilyInteractionType
): FullGameState {
  const usageKey = `${personId}_${interaction}`;
  if (state.familyInteractionsUsed?.[usageKey]) return state;
  const idx = state.relationships.findIndex((r) => r.id === personId && r.alive);
  if (idx < 0) return state;

  const rng = new SeededRNG(state.rngState);
  const char: CharacterState = {
    ...state.character,
    stats: { ...state.character.stats },
    skills: { ...state.character.skills },
    traits: [...state.character.traits],
  };
  const realm = {
    ...state.realm,
    holdings: state.realm.holdings.map((h) => ({ ...h, buildings: [...h.buildings] })),
  };
  const relationships = state.relationships.map((r) => ({ ...r, traits: [...r.traits] }));
  const target = relationships[idx];
  const nameEn = target.name;
  const nameFa = formatPersonName(target.name, 'fa');
  const loc = SETTLEMENTS_BY_ID[char.locationId] ?? SETTLEMENTS[0];

  let title = '';
  let titleFa = '';
  let text = '';
  let textFa = '';
  const deltas: string[] = [];
  const deltasFa: string[] = [];
  let marriedEnemy = false;

  if (interaction === 'talk') {
    target.affinity = clampStat(target.affinity + rng.int(6, 11));
    char.stats.happiness = clampStat(char.stats.happiness + 4);
    char.stats.charisma = clampStat(char.stats.charisma + 1);
    title = `Heart-to-Heart with ${nameEn}`;
    titleFa = `گپِ صمیمی با «${nameFa}»`;
    text = `You shared warm ale and stories by the hearth with ${nameEn}, growing closer.`;
    textFa = `کنار آتش با «${nameFa}» نشستید، بگووبخند کردید و صمیمیت بینتان بیشتر شد.`;
    deltas.push('Bond +8', 'Happiness +4');
    deltasFa.push('صمیمیت +8', 'شادی +4');
  } else if (interaction === 'compliment') {
    target.affinity = clampStat(target.affinity + rng.int(7, 12));
    char.stats.honor = clampStat(char.stats.honor + 3);
    char.stats.charisma = clampStat(char.stats.charisma + 2);
    title = `Praised ${nameEn} in the Hall`;
    titleFa = `ستایش و دلگرمی به «${nameFa}» در تالار`;
    text = `Before the hearth-companions, you spoke warmly of ${nameEn}’s loyalty and virtues, lifting their pride.`;
    textFa = `در جمع یاران تالار از وفاداری و منش «${nameFa}» به نیکی یاد کردید و غرور و محبتش دوچندان شد.`;
    deltas.push('Bond +9', 'Honor +3', 'Charisma +2');
    deltasFa.push('صمیمیت +9', 'شرافت +3', 'کاریزما +2');
  } else if (interaction === 'gift') {
    if (realm.silver < 5) return state;
    realm.silver -= 5;
    target.affinity = clampStat(target.affinity + rng.int(13, 18));
    char.stats.happiness = clampStat(char.stats.happiness + 5);
    char.stats.honor = clampStat(char.stats.honor + 2);
    title = `Gifted Silver to ${nameEn}`;
    titleFa = `هدیه‌ی نقره به «${nameFa}»`;
    text = `You gifted ${nameEn} a finely worked 5-silver brooch — their eyes lit right up!`;
    textFa = `یک سنجاقِ نقره‌کوبِ ۵ سکه‌ای به «${nameFa}» کادو دادی و چشمانش از خوشحالی برق زد!`;
    deltas.push('-5 Silver', 'Bond +15', 'Happiness +5');
    deltasFa.push('-5 نقره', 'صمیمیت +15', 'شادی +5');
  } else if (interaction === 'lavish_gift') {
    if (realm.silver < 15) return state;
    realm.silver -= 15;
    target.affinity = clampStat(target.affinity + rng.int(24, 32));
    char.stats.happiness = clampStat(char.stats.happiness + 8);
    char.stats.honor = clampStat(char.stats.honor + 6);
    realm.fame += 8;
    title = `Bestowed Golden Arm-Ring on ${nameEn}`;
    titleFa = `اهدای بازوبند زرین به «${nameFa}»`;
    text = `You clasped a heavy 15-silver gilded arm-ring around ${nameEn}’s wrist, sealing unshakeable devotion!`;
    textFa = `یک بازوبند سنگین و زرکوب به ارزش ۱۵ نقره بر بازوی «${nameFa}» بستید و وفاداری او را جاودانه کردید!`;
    deltas.push('-15 Silver', 'Bond +28', 'Honor +6', '+8 Fame');
    deltasFa.push('-15 نقره', 'صمیمیت +28', 'شرافت +6', '+8 شهرت');
  } else if (interaction === 'feast_together') {
    if (realm.silver < 8) return state;
    realm.silver -= 8;
    target.affinity = clampStat(target.affinity + rng.int(15, 21));
    char.stats.happiness = clampStat(char.stats.happiness + 9);
    char.stats.health = clampStat(char.stats.health + 2);
    title = `Private Mead-Feast with ${nameEn}`;
    titleFa = `بزم خصوصی و نوشیدن مید با «${nameFa}»`;
    text = `Over roasted venison and honeyed mead-horns, you and ${nameEn} toasted the dynasty’s fortune.`;
    textFa = `بر سر سفره‌ای از کباب شکار و جام‌های مید عسلی، همراه با «${nameFa}» به سلامتی خاندان نوشیدید.`;
    deltas.push('-8 Silver', 'Bond +18', 'Happiness +9');
    deltasFa.push('-8 نقره', 'صمیمیت +18', 'شادی +9');
  } else if (interaction === 'spar') {
    target.affinity = clampStat(target.affinity + rng.int(9, 14));
    char.skills.combat = clampSkill(char.skills.combat + 3);
    char.stats.strength = clampStat(char.stats.strength + 3);
    char.stats.health = clampStat(char.stats.health + 2);
    title = `Shield-Sparring with ${nameEn}`;
    titleFa = `تمرین رزم و شمشیرزنی با «${nameFa}»`;
    text = `Trading wooden sword-strikes in the courtyard with ${nameEn} sharpened your reflexes and mutual respect.`;
    textFa = `در حیاط تالار با شمشیرهای تمرینی و سپر در برابر «${nameFa}» رزمیدید؛ هم بازویتان قوی‌تر شد و هم احترامتان بیشتر!`;
    deltas.push('Bond +12', 'Combat +3', 'Strength +3');
    deltasFa.push('صمیمیت +12', 'رزم +3', 'قدرت +3');
  } else if (interaction === 'council') {
    target.affinity = clampStat(target.affinity + rng.int(8, 13));
    char.stats.cunning = clampStat(char.stats.cunning + 3);
    char.skills.diplomacy = clampSkill(char.skills.diplomacy + 2);
    char.skills.law = clampSkill(char.skills.law + 2);
    title = `Sought Counsel from ${nameEn}`;
    titleFa = `مشورت در امور خاندان با «${nameFa}»`;
    text = `Listening closely to ${nameEn}’s advice on realm rivalries and trade gave you shrewd new insight.`;
    textFa = `هم‌فکری و شنیدن دیدگاه‌های «${nameFa}» درباره سیاست و املاک خاندان، تدبیر تازه‌ای به شما بخشید.`;
    deltas.push('Bond +10', 'Cunning +3', 'Diplomacy +2');
    deltasFa.push('صمیمیت +10', 'ذکاوت +3', 'دیپلماسی +2');
  } else if (interaction === 'hunt_together') {
    target.affinity = clampStat(target.affinity + rng.int(11, 16));
    char.stats.health = clampStat(char.stats.health + 4);
    char.stats.happiness = clampStat(char.stats.happiness + 5);
    realm.foodStores += 8;
    title = `Northern Hunt with ${nameEn}`;
    titleFa = `شکار در جنگل‌های شمالی با «${nameFa}»`;
    text = `Tracking elk through pine-woods alongside ${nameEn}, you returned to the hall with fresh game and high spirits!`;
    textFa = `پا‌به‌پای «${nameFa}» در جنگل‌های کاج به شکار رفتید و با دست پر و روحیه عالی به تالار بازگشتید!`;
    deltas.push('Bond +14', 'Health +4', '+8 Food');
    deltasFa.push('صمیمیت +14', 'سلامتی +4', '+8 آذوقه');
  } else if (interaction === 'teach') {
    target.affinity = clampStat(target.affinity + 10);
    const mentorTrait = rng.pick(['brave', 'cunning', 'oath_keeper']);
    if (!target.traits.includes(mentorTrait)) {
      target.traits.push(mentorTrait);
    }
    char.stats.honor = clampStat(char.stats.honor + 3);
    char.stats.happiness = clampStat(char.stats.happiness + 4);
    char.skills.combat = clampSkill(char.skills.combat + 2);
    title = `Trained ${nameEn}`;
    titleFa = `آموزش مهارت به «${nameFa}»`;
    text = `You drilled ${nameEn} in shield-work and northern law, preparing a sharper heir for tomorrow!`;
    textFa = `به «${nameFa}» فوت‌وفنِ سپرداری و رسمِ روزگار یاد دادی تا وارثِ کاربلدی بار بیاید!`;
    deltas.push('Bond +10', 'Honor +3', 'Heir Trained');
    deltasFa.push('صمیمیت +10', 'شرافت +3', 'تقویت وارث');
  } else if (interaction === 'bless_kin') {
    if (realm.silver < 5) return state;
    realm.silver -= 5;
    target.affinity = clampStat(target.affinity + 12);
    char.stats.faith = clampStat(char.stats.faith + 4);
    char.stats.wyrd = clampStat(char.stats.wyrd + 3);
    title = `Sacred Blessing for ${nameEn}`;
    titleFa = `دعای خیر و نذر برای «${nameFa}»`;
    text = `Offering silver and prayers at the sanctuary for ${nameEn}’s health and wyrd strengthened your sacred bond.`;
    textFa = `با نذر ۵ سکه نقره در نیایشگاه برای تندرستی و بخت بلند «${nameFa}»، پیوند معنوی‌تان استوارتر شد.`;
    deltas.push('-5 Silver', 'Bond +12', 'Faith +4', 'Wyrd +3');
    deltasFa.push('-5 نقره', 'صمیمیت +12', 'ایمان +4', 'ویرد +3');
  } else if (interaction === 'try_for_child') {
    if (target.role !== 'Spouse' || char.age < 17) return state;
    target.affinity = clampStat(target.affinity + 12);
    char.stats.happiness = clampStat(char.stats.happiness + 8);
    const canConceive = char.age <= 54 && target.age <= 45;
    if (canConceive && rng.chance(0.55)) {
      const childSex = rng.chance(0.5) ? Sex.Male : Sex.Female;
      const childGiven = rng.pick(
        childSex === Sex.Male
          ? MALE_NAMES_BY_REGION[loc.regionGroup]
          : FEMALE_NAMES_BY_REGION[loc.regionGroup]
      );
      const fatherFirstName =
        char.sex === Sex.Male ? char.givenName : target.name.split(' ')[0];
      const childFull = `${childGiven} ${makePatronymic(fatherFirstName, childSex)}`;
      const childFa = formatPersonName(childFull, 'fa');
      relationships.push({
        id: `rel_child_${state.year}_${relationships.length}_${rng.int(100, 999)}`,
        name: childFull,
        sex: childSex,
        role: 'Child',
        age: 0,
        alive: true,
        affinity: 90,
        socialClass: char.socialClass,
        locationId: char.locationId,
        traits: [rng.pick(['brave', 'cunning', 'strong_limbed', 'charismatic', 'seafarer'])],
        isHeirEligible: true,
      });
      realm.fame += 12;
      title = `New Child Born: ${childFull}!`;
      titleFa = `تولد فرزند جدید: «${childFa}»!`;
      text = `The Norns smiled upon your union with ${nameEn}! A healthy ${childSex === Sex.Male ? 'son' : 'daughter'}, ${childFull}, was born into the dynasty!`;
      textFa = `نورن‌های سرنوشت به پیوند شما و «${nameFa}» لبخند زدند و فرزند سالمی به نام «${childFa}» پا به تالار خاندان گذاشت!`;
      deltas.push(`New Heir: ${childFull}`, 'Bond +12', 'Happiness +8', '+12 Fame');
      deltasFa.push(`فرزند جدید: ${childFa}`, 'صمیمیت +12', 'شادی +8', '+12 شهرت');
    } else {
      title = `Romantic Time with ${nameEn}`;
      titleFa = `خلوت عاشقانه با «${nameFa}»`;
      text = `You spent warm, devoted nights with ${nameEn}. Though no child was born yet, your marital bond deepened.`;
      textFa = `شب‌های گرم و صمیمانه‌ای را در کنار «${nameFa}» سپری کردید و مهر و علاقه‌ی زناشویی‌تان عمیق‌تر شد.`;
      deltas.push('Bond +12', 'Happiness +8');
      deltasFa.push('صمیمیت +12', 'شادی +8');
    }
  } else if (interaction === 'argue') {
    target.affinity = clampStat(target.affinity - rng.int(14, 22));
    char.stats.happiness = clampStat(char.stats.happiness - 4);
    char.stats.strength = clampStat(char.stats.strength + 2);
    const turnedRival =
      target.affinity <= 15 &&
      target.role !== 'Child' &&
      target.role !== 'Spouse' &&
      rng.chance(0.35);
    if (turnedRival) {
      target.role = 'Rival';
    }
    title = `Heated Argument with ${nameEn}`;
    titleFa = `بحث و دعوای لفظی با «${nameFa}»`;
    text = turnedRival
      ? `Your shouting match with ${nameEn} got so ugly they stormed out of the hall as an open rival!`
      : `Tempers flared over dinner with ${nameEn}; mugs slammed on oak and the mood soured.`;
    textFa = turnedRival
      ? `کل‌کل و دعوایت با «${nameFa}» آن‌قدر بالا گرفت که درِ تالار را کوبید و رسماً رقیبت شد!`
      : `سرِ شام با «${nameFa}» بحثت بالا گرفت؛ لیوان‌ها کوبیده شد روی میز و فضا شکرآب شد.`;
    deltas.push('Bond -18', 'Happiness -4', 'Strength +2');
    deltasFa.push('صمیمیت -18', 'شادی -4', 'قدرت +2');
  } else if (interaction === 'send_envoy') {
    if (realm.silver < 10) return state;
    realm.silver -= 10;
    const gain = rng.int(16, 26) + Math.floor(char.skills.diplomacy * 0.25);
    target.affinity = clampStat(target.affinity + gain);
    char.skills.diplomacy = clampSkill(char.skills.diplomacy + 3);
    if (target.affinity >= 68) {
      target.role = target.sex === Sex.Female ? 'Sworn Sister' : 'Sworn Brother';
      realm.stability = clampStat(realm.stability + 8);
      title = `Feud Reconciled with ${nameEn}!`;
      titleFa = `آشتی و پایان دشمنی با «${nameFa}»!`;
      text = `Your envoy’s peace-gifts and wise words softened ${nameEn}’s heart — they laid down their grudge and swore friendship!`;
      textFa = `پیک صلح و پیشکش‌های خردمندانه شما دل «${nameFa}» را نرم کرد؛ کینه را کنار گذاشت و هم‌پیمان شما شد!`;
      deltas.push('-10 Silver', 'Feud Ended!', 'Diplomacy +3', 'Stability +8');
      deltasFa.push('-10 نقره', 'پایان دشمنی!', 'دیپلماسی +3', 'ثبات +8');
    } else {
      title = `Peace Envoy Sent to ${nameEn}`;
      titleFa = `اعزام پیک مذاکره نزد «${nameFa}»`;
      text = `Your silver token and diplomatic message cooled ${nameEn}’s hostility substantially.`;
      textFa = `فرستاده و پیام دیپلماتیک شما از شدت خشم و کینه‌ی «${nameFa}» کاست.`;
      deltas.push('-10 Silver', `Hostility -${gain}%`, 'Diplomacy +3');
      deltasFa.push('-10 نقره', `کاهش خصومت ${gain}٪`, 'دیپلماسی +3');
    }
  } else if (interaction === 'intimidate_foe') {
    char.stats.honor = clampStat(char.stats.honor + 4);
    char.stats.strength = clampStat(char.stats.strength + 2);
    realm.fame += 6;
    target.affinity = clampStat(target.affinity + rng.int(8, 15));
    title = `Show of Force Against ${nameEn}`;
    titleFa = `نمایش اقتدار و نهیب به «${nameFa}»`;
    text = `Confronting ${nameEn} with hand on hilt before the assembly, they backed down a step before your resolve.`;
    textFa = `در جمع بزرگان دست بر قبضه شمشیر گذاشتید و با صلابت در برابر «${nameFa}» ایستادید تا جرئت گستاخی نداشته باشد.`;
    deltas.push('Honor +4', 'Strength +2', '+6 Fame');
    deltasFa.push('شرافت +4', 'قدرت +2', '+6 شهرت');
  } else if (interaction === 'peace_marry') {
    const alreadyMarried = relationships.some((r) => r.role === 'Spouse' && r.alive);
    if (alreadyMarried || char.age < 17) return state;
    marriedEnemy = true;
    const spSex = char.sex === Sex.Male ? Sex.Female : Sex.Male;
    if (target.sex === spSex) {
      target.role = 'Spouse';
      target.affinity = 78;
    } else {
      relationships.splice(idx, 1);
      const pool =
        spSex === Sex.Male
          ? MALE_NAMES_BY_REGION[loc.regionGroup]
          : FEMALE_NAMES_BY_REGION[loc.regionGroup];
      const kinName = `${rng.pick(pool)} ${makePatronymic(target.name.split(' ')[0] || 'Ragnar', spSex)}`;
      relationships.push({
        id: `rel_pmarry_${state.year}_${rng.int(100, 999)}`,
        name: kinName,
        sex: spSex,
        role: 'Spouse',
        age: Math.max(18, char.age + rng.int(-3, 3)),
        alive: true,
        affinity: 80,
        socialClass: char.socialClass,
        locationId: loc.id,
        traits: ['brave', 'cunning'],
      });
    }
    realm.stability = clampStat(realm.stability + 10);
    realm.fame += 20;
    char.stats.happiness = clampStat(char.stats.happiness + 12);
    title = `Peace-Marriage Sealed!`;
    titleFa = `پیوندِ ازدواجِ سیاسی با خاندان دشمن!`;
    text = `Instead of trading axe-blows, you sealed a dramatic peace-marriage ending the feud with ${nameEn}!`;
    textFa = `به‌جای تبرکشی و خون‌ریزی، با یک وصلتِ پرماجرا به دشمنی با «${nameFa}» پایان دادی!`;
    deltas.push('Feud Ended!', 'Happiness +12', 'Stability +10');
    deltasFa.push('پایان دشمنی خونی!', 'شادی +12', 'ثبات +10');
  }

  const nextState: FullGameState = {
    ...state,
    rngState: rng.getState(),
    marriedBloodEnemy: state.marriedBloodEnemy || marriedEnemy,
    familyInteractionsUsed: {
      ...(state.familyInteractionsUsed ?? {}),
      [usageKey]: true,
    },
    character: char,
    realm,
    relationships,
    lifeLog: [
      ...state.lifeLog,
      {
        id: `log_fam_${interaction}_${state.year}_${state.lifeLog.length}_${rng.int(100, 999)}`,
        year: state.year,
        season: state.season,
        age: char.age,
        locationName: loc.name,
        category: 'Family',
        iconType:
          interaction === 'argue' || interaction === 'spar' || interaction === 'intimidate_foe'
            ? 'sword'
            : interaction === 'gift' || interaction === 'lavish_gift' || interaction === 'feast_together'
              ? 'coin'
              : 'family',
        title,
        titleFa,
        text,
        textFa,
        deltas,
        deltasFa,
      },
    ],
    lastOutcomeBanner: {
      title,
      titleFa,
      text,
      textFa,
      deltaSummary: deltas,
      deltaSummaryFa: deltasFa,
    },
  };

  nextState.achievements = evaluateAchievements(nextState);
  return nextState;
}

export function continueAsHeir(state: FullGameState, heirId: string): FullGameState {
  if (!state.pendingDeath) return state;
  const heir = state.pendingDeath.eligibleHeirs.find((h) => h.id === heirId);
  if (!heir) {
    return { ...state, screen: GameScreen.DYNASTY_OVER };
  }

  const rng = new SeededRNG(state.rngState);
  const old = state.character;

  const ancestorRecord: DynastyAncestor = {
    id: old.id,
    fullName: `${old.givenName} ${old.patronymic}${old.epithet ? ` "${old.epithet}"` : ''}`,
    title: old.title,
    birthYear: old.birthYear,
    deathYear: state.year,
    ageAtDeath: old.age,
    causeOfDeath: state.pendingDeath.causeOfDeath,
    causeOfDeathFa: state.pendingDeath.causeOfDeathFa,
    reportTitle: state.pendingDeath.lifeTitle ?? state.pendingDeath.reportTitle,
    reportTitleFa: state.pendingDeath.lifeTitleFa ?? state.pendingDeath.reportTitleFa,
    generation: state.generation,
    fameEarned: state.realm.fame,
    holdingsCount: state.realm.landFarms,
    raidsLed: old.raidsLed,
    religion: old.religion,
    obituaryProse: state.pendingDeath.obituaryProse,
    obituaryProseFa: state.pendingDeath.obituaryProseFa,
    divergences: [...state.divergences],
  };

  const parts = heir.name.split(' ');
  const givenName = parts[0] || 'Harald';
  const patronymic = parts.slice(1).join(' ') || makePatronymic(old.givenName, heir.sex);
  const newCharId = `char_gen${state.generation + 1}_${rng.int(1000, 9999)}`;
  const heirAge = Math.max(6, heir.age);

  const inheritedTitle =
    old.title === TitleRank.Overking ? TitleRank.Konungr : old.title;

  const newChar: CharacterState = {
    id: newCharId,
    givenName,
    patronymic,
    epithet: '',
    sex: heir.sex,
    age: heirAge,
    birthYear: state.year - heirAge,
    birthplaceId: heir.locationId,
    locationId: old.locationId,
    socialClass:
      old.socialClass === SocialClass.Thrall && inheritedTitle !== TitleRank.Thrall
        ? SocialClass.Karl
        : old.socialClass,
    title: inheritedTitle,
    religion: old.religion,
    appearance: deriveAppearanceFromId(newCharId),
    traits: heir.traits.length > 0 ? [...heir.traits] : ['brave', 'oath_keeper'],
    stats: {
      health: rng.int(76, 94),
      strength: heirAge < 14 ? rng.int(28, 45) : rng.int(52, 74),
      cunning: rng.int(48, 74),
      charisma: rng.int(48, 74),
      honor: clampStat(Math.round(old.stats.honor * 0.75) + 15),
      wyrd: rng.int(48, 72),
      faith: rng.int(45, 70),
      happiness: 68,
    },
    skills: {
      combat: heirAge < 14 ? 12 : rng.int(22, 42),
      seamanship: rng.int(20, 40),
      farming: rng.int(18, 36),
      trade: rng.int(18, 36),
      diplomacy: rng.int(18, 36),
      law: rng.int(16, 34),
      craft: rng.int(14, 30),
      skaldcraft: rng.int(12, 28),
      seidr: rng.int(4, 14),
    },
    isOutlawed: false,
    raidsLed: 0,
    voyagesCompleted: 0,
    killsInHolmgang: 0,
    thingsAttended: 0,
  };

  const heirWasChild = heir.role === 'Child' || heir.role === 'Foster-Child';
  const heirWasSibling = heir.role === 'Sibling';

  // Rebuild all relationship roles from the new character's perspective!
  const nextRelationships: RelationshipPerson[] = state.relationships
    .filter((r) => r.id !== heir.id && r.alive)
    .map((r) => {
      let newRole = r.role;
      if (heirWasChild) {
        if (r.role === 'Child' || r.role === 'Foster-Child') newRole = 'Sibling';
        else if (r.role === 'Spouse' || r.role === 'Concubine') {
          newRole = r.sex === Sex.Female ? 'Mother' : 'Father';
        } else if (r.role === 'Sibling') {
          newRole = 'Uncle/Aunt';
        } else if (r.role === 'Nephew/Niece') {
          newRole = 'Cousin';
        } else if (r.role === 'Father' || r.role === 'Mother') {
          newRole = 'Uncle/Aunt';
        }
      } else if (heirWasSibling) {
        if (r.role === 'Child' || r.role === 'Foster-Child') {
          newRole = 'Nephew/Niece';
        } else if (r.role === 'Spouse') {
          newRole = 'Cousin';
        }
      }
      return {
        ...r,
        role: newRole,
        isHeirEligible:
          newRole === 'Child' ||
          newRole === 'Sibling' ||
          newRole === 'Nephew/Niece' ||
          newRole === 'Foster-Child',
      };
    });

  // Record the late predecessor from the heir's perspective (e.g., Late Father / Late Mother / Late Sibling)
  const lateRole: RelationshipPerson['role'] = heirWasChild
    ? old.sex === Sex.Male
      ? 'Father'
      : 'Mother'
    : heirWasSibling
      ? 'Sibling'
      : old.sex === Sex.Male
        ? 'Sworn Brother'
        : 'Sworn Sister';

  nextRelationships.push({
    id: `rel_late_${old.id}`,
    name: `${old.givenName} ${old.patronymic}`,
    epithet: old.epithet || undefined,
    sex: old.sex,
    role: lateRole,
    age: old.age,
    alive: false,
    affinity: 90,
    socialClass: old.socialClass,
    locationId: old.locationId,
    traits: [...old.traits],
    deathYear: state.year,
    causeOfDeath: state.pendingDeath.causeOfDeath,
    causeOfDeathFa: state.pendingDeath.causeOfDeathFa,
  });

  // Generate age-appropriate Spouse & Children if the heir is already an adult!
  const loc = SETTLEMENTS_BY_ID[newChar.locationId] ?? SETTLEMENTS[0];
  if (heirAge >= 20 && !nextRelationships.some((r) => r.role === 'Spouse' && r.alive)) {
    const spSex = newChar.sex === Sex.Male ? Sex.Female : Sex.Male;
    const spPool =
      spSex === Sex.Male
        ? MALE_NAMES_BY_REGION[loc.regionGroup]
        : FEMALE_NAMES_BY_REGION[loc.regionGroup];
    const spGiven = rng.pick(spPool);
    nextRelationships.unshift({
      id: `rel_heir_sp_${state.year}_${rng.int(100, 999)}`,
      name: `${spGiven} ${makePatronymic(rng.pick(MALE_NAMES_BY_REGION[loc.regionGroup]), spSex)}`,
      sex: spSex,
      role: 'Spouse',
      age: Math.max(18, heirAge + rng.int(-3, 2)),
      alive: true,
      affinity: rng.int(74, 90),
      socialClass: newChar.socialClass,
      locationId: newChar.locationId,
      traits: [rng.pick(['charismatic', 'cunning', 'brave', 'oath_keeper'])],
    });
  }

  if (heirAge >= 22 && !nextRelationships.some((r) => r.role === 'Child' && r.alive)) {
    const targetKids = heirAge >= 34 ? rng.int(2, 3) : heirAge >= 27 ? 2 : 1;
    const maxChildAge = Math.max(1, Math.min(22, heirAge - 19));
    for (let i = 0; i < targetKids; i++) {
      const kSex = rng.chance(0.5) ? Sex.Male : Sex.Female;
      const kGiven = rng.pick(
        kSex === Sex.Male
          ? MALE_NAMES_BY_REGION[loc.regionGroup]
          : FEMALE_NAMES_BY_REGION[loc.regionGroup]
      );
      const childAge = Math.max(1, maxChildAge - i * rng.int(2, 4));
      nextRelationships.push({
        id: `rel_heir_kid_${state.year}_${i}_${rng.int(100, 999)}`,
        name: `${kGiven} ${makePatronymic(newChar.givenName, kSex)}`,
        sex: kSex,
        role: 'Child',
        age: childAge,
        alive: true,
        affinity: rng.int(80, 95),
        socialClass: newChar.socialClass,
        locationId: newChar.locationId,
        traits: [rng.pick(['brave', 'cunning', 'blessed_luck'])],
        isHeirEligible: true,
      });
    }
  }

  // Add a sibling if still no eligible next-gen kin (e.g. young child heir with no brothers/sisters)
  if (!nextRelationships.some((r) => r.alive && r.isHeirEligible)) {
    const kinSex = rng.chance(0.5) ? Sex.Male : Sex.Female;
    const kinGiven = rng.pick(
      kinSex === Sex.Male
        ? MALE_NAMES_BY_REGION[loc.regionGroup]
        : FEMALE_NAMES_BY_REGION[loc.regionGroup]
    );
    nextRelationships.push({
      id: `rel_kin_${state.year}_${rng.int(100, 999)}`,
      name: `${kinGiven} ${makePatronymic(old.givenName, kinSex)}`,
      sex: kinSex,
      role: 'Sibling',
      age: Math.max(4, newChar.age - rng.int(1, 4)),
      alive: true,
      affinity: 78,
      socialClass: newChar.socialClass,
      locationId: newChar.locationId,
      traits: ['cunning'],
      isHeirEligible: true,
    });
  }

  const nextGen = state.generation + 1;
  const locName = SETTLEMENTS_BY_ID[newChar.locationId]?.name ?? newChar.locationId;
  const locNameFa = SETTLEMENTS_FA[newChar.locationId]?.name ?? locName;
  const oldFullEn = `${old.givenName} ${old.patronymic}`;
  const oldFullFa = formatPersonName(oldFullEn, 'fa');
  const newFullFa = formatPersonName(`${newChar.givenName} ${newChar.patronymic}`, 'fa');
  const dynFa = formatDynastyName(state.dynastyName, 'fa');

  const inheritedFame = Math.round(state.realm.fame * 0.75) + 20;
  const totalShips = state.realm.longships + state.realm.knarrs;
  const holdingsCount = state.realm.holdings.length;

  const successionDeltas: string[] = [
    `Inherited from ${oldFullEn}`,
    `${state.realm.silver} Silver`,
    `${state.realm.landFarms} Farms`,
    `${totalShips} Ships (${state.realm.longships} War, ${state.realm.knarrs} Trade)`,
    `${state.realm.hirdWarriors} Warriors`,
    ...(holdingsCount > 0 ? [`${holdingsCount} Holdings`] : []),
    `${inheritedFame} Fame`,
  ];

  const successionDeltasFa: string[] = [
    `میراث از «${oldFullFa}»`,
    `${state.realm.silver} سکه نقره`,
    `${state.realm.landFarms} مزرعه`,
    `${totalShips} کشتی (${state.realm.longships} جنگی، ${state.realm.knarrs} تجاری)`,
    `${state.realm.hirdWarriors} جنگجو`,
    ...(holdingsCount > 0 ? [`${holdingsCount} شهر و ملک`] : []),
    `${inheritedFame} شهرت`,
  ];

  const successionLog: LogEntry = {
    id: `log_succ_gen${nextGen}_${state.year}`,
    year: state.year,
    season: state.season,
    age: newChar.age,
    locationName: locName,
    category: 'Succession',
    iconType: 'crown',
    title: `Generation ${nextGen} · Inheritance of ${newChar.givenName} ${newChar.patronymic}`,
    titleFa: `نسل ${nextGen} · آغاز فرمانروایی و گزارش میراث «${newFullFa}»`,
    text: `Following the passing of ${oldFullEn}, you took the high-seat of ${state.dynastyName} at ${locName}. You inherited ${state.realm.silver} silver, ${state.realm.landFarms} farms, ${state.realm.longships} war longships, ${state.realm.knarrs} trade knarrs, ${state.realm.hirdWarriors} sworn warriors${holdingsCount > 0 ? `, and ${holdingsCount} dynasty holdings` : ''}.`,
    textFa: `پس از درگذشت «${oldFullFa}»، شما در ${locNameFa} بر مسند فرمانروایی «${dynFa}» نشستید و میراث خاندان را تحویل گرفتید: ${state.realm.silver} سکه نقره، ${state.realm.landFarms} مزرعه، ${state.realm.longships} کشتی جنگی، ${state.realm.knarrs} کشتی تجاری، ${state.realm.hirdWarriors} جنگجوی قسم‌خورده${holdingsCount > 0 ? ` و ${holdingsCount} شهر و ملک تحت فرمان` : ''}.`,
    deltas: successionDeltas,
    deltasFa: successionDeltasFa,
  };

  const resumed: FullGameState = {
    ...state,
    rngState: rng.getState(),
    generation: nextGen,
    yearlyActivitiesUsed: {},
    builtThisYear: false,
    familyInteractionsUsed: {},
    character: newChar,
    realm: {
      ...state.realm,
      fame: inheritedFame,
    },
    relationships: nextRelationships,
    ancestors: [...state.ancestors, ancestorRecord],
    pendingDeath: null,
    lastOutcomeBanner: {
      title: `Generation ${nextGen}: ${newChar.givenName} ${newChar.patronymic}`,
      titleFa: `نسل ${nextGen}: ${newFullFa}`,
      text: `You inherited ${state.realm.silver} silver, ${state.realm.landFarms} farms, ${totalShips} ships, and ${state.realm.hirdWarriors} warriors from ${oldFullEn}.`,
      textFa: `از «${oldFullFa}» مجموعاً ${state.realm.silver} نقره، ${state.realm.landFarms} مزرعه، ${totalShips} کشتی و ${state.realm.hirdWarriors} جنگجو به شما ارث رسید.`,
      deltaSummary: successionDeltas.slice(0, 4),
      deltaSummaryFa: successionDeltasFa.slice(0, 4),
    },
    lifeLog: [successionLog],
  };

  resumed.achievements = evaluateAchievements(resumed);
  return resumed;
}

// ==========================================
// HOLDING GOVERNANCE & REBELLION ACTIONS
// ==========================================

export function executeSendSettlersAction(
  state: FullGameState,
  settlementId: string
): FullGameState {
  const holdingIdx = state.realm.holdings.findIndex((h) => h.settlementId === settlementId);
  if (holdingIdx < 0) return state;
  const cost = 28;
  if (state.realm.silver < cost) return state;

  const target = SETTLEMENTS_BY_ID[settlementId];
  const targetFa = SETTLEMENTS_FA[settlementId]?.name ?? target?.name ?? settlementId;
  const rng = new SeededRNG(state.rngState);

  const holdings = state.realm.holdings.map((h, i) =>
    i === holdingIdx
      ? {
          ...h,
          farms: h.farms + 1,
          norsePopulationShare: Math.min(100, (h.norsePopulationShare ?? 50) + 16),
          unrest: Math.max(0, (h.unrest ?? 20) - 14),
        }
      : h
  );

  const realm = {
    ...state.realm,
    silver: state.realm.silver - cost,
    landFarms: state.realm.landFarms + 1,
    fame: state.realm.fame + 15,
    stability: clampStat(state.realm.stability + 4),
    holdings,
  };

  const title = `Norse Settlers Disembarked at ${target?.name ?? settlementId}`;
  const titleFa = `اسکان مهاجران نورس در «${targetFa}»`;
  const text = `A loaded knarr brought hardy Norse farming kin, sheep, and iron plows to ${target?.name ?? settlementId}. Norse culture took deeper root and local unrest subsided!`;
  const textFa = `یک کشتی کنار پر از خانواده‌های مهاجر نورس، دام و گاوآهن‌های آهنی به «${targetFa}» رسید. فرهنگ نورس ریشه دواند و ناآرامی محلی ۱۴٪ فرونشست!`;
  const deltas = [`-${cost} Silver`, '+1 Farm', '+16% Norse Pop', 'Unrest -14%', '+15 Fame'];
  const deltasFa = [`-${cost} نقره`, '+1 مزرعه', '+16٪ جمعیت نورس', 'ناآرامی -14٪', '+15 شهرت'];

  const logId = `log_settle_${settlementId}_${state.year}_${state.lifeLog.length}`;
  return {
    ...state,
    rngState: rng.getState(),
    realm,
    lifeLog: [
      ...state.lifeLog,
      {
        id: logId,
        year: state.year,
        season: state.season,
        age: state.character.age,
        locationName: target?.name ?? settlementId,
        category: 'Politics & Kings',
        iconType: 'coin',
        title,
        titleFa,
        text,
        textFa,
        deltas,
        deltasFa,
      },
    ],
    lastOutcomeBanner: {
      title,
      titleFa,
      text,
      textFa,
      deltaSummary: deltas,
      deltaSummaryFa: deltasFa,
    },
  };
}

export function executeStationGarrisonAction(
  state: FullGameState,
  settlementId: string,
  delta: number
): FullGameState {
  const holdingIdx = state.realm.holdings.findIndex((h) => h.settlementId === settlementId);
  if (holdingIdx < 0) return state;
  const holding = state.realm.holdings[holdingIdx];

  // Moving warriors from personal hird to holding garrison or vice versa
  if (delta > 0 && state.realm.hirdWarriors < delta) return state;
  if (delta < 0 && (holding.garrison ?? 0) < Math.abs(delta)) return state;

  const newGarrison = Math.max(0, (holding.garrison ?? 0) + delta);
  const newHird = Math.max(0, state.realm.hirdWarriors - delta);

  const holdings = state.realm.holdings.map((h, i) =>
    i === holdingIdx
      ? {
          ...h,
          garrison: newGarrison,
          unrest: delta > 0 ? Math.max(0, (h.unrest ?? 20) - Math.round(delta * 0.8)) : h.unrest,
        }
      : h
  );

  return {
    ...state,
    realm: {
      ...state.realm,
      hirdWarriors: newHird,
      holdings,
    },
  };
}

export function executeSetTributeBurdenAction(
  state: FullGameState,
  settlementId: string,
  burden: TributeBurden
): FullGameState {
  const holdingIdx = state.realm.holdings.findIndex((h) => h.settlementId === settlementId);
  if (holdingIdx < 0) return state;

  const holdings = state.realm.holdings.map((h, i) =>
    i === holdingIdx ? { ...h, tributeBurden: burden } : h
  );

  return {
    ...state,
    realm: {
      ...state.realm,
      holdings,
    },
  };
}

export function executeAppointJarlAction(
  state: FullGameState,
  settlementId: string
): FullGameState {
  const holdingIdx = state.realm.holdings.findIndex((h) => h.settlementId === settlementId);
  if (holdingIdx < 0) return state;
  const cost = 20;
  if (state.realm.silver < cost) return state;

  const rng = new SeededRNG(state.rngState);
  const target = SETTLEMENTS_BY_ID[settlementId];
  const targetFa = SETTLEMENTS_FA[settlementId]?.name ?? target?.name ?? settlementId;
  const pool = MALE_NAMES_BY_REGION['Norway'];
  const jarlName = `${rng.pick(pool)} ${makePatronymic(rng.pick(pool), Sex.Male)}`;
  const jarlNameFa = formatPersonName(jarlName, 'fa');

  const holdings = state.realm.holdings.map((h, i) =>
    i === holdingIdx
      ? {
          ...h,
          appointedJarl: jarlName,
          unrest: Math.max(0, (h.unrest ?? 20) - 20),
        }
      : h
  );

  const realm = {
    ...state.realm,
    silver: state.realm.silver - cost,
    fame: state.realm.fame + 25,
    stability: clampStat(state.realm.stability + 6),
    holdings,
  };

  const title = `Appointed Jarl of ${target?.name ?? settlementId}`;
  const titleFa = `انتصاب یارل و حاکم در «${targetFa}»`;
  const text = `Bestowing an arm-ring and swearing oaths in the longhouse, you appointed loyal warrior ${jarlName} as Jarl to rule ${target?.name ?? settlementId}. Unrest plummeted by 20%!`;
  const textFa = `با اهدای بازوبند زرین و سوگند وفاداری، «${jarlNameFa}» را به عنوان یارل و والی «${targetFa}» برگزیدید. ناآرامی محلی ۲۰٪ کاهش یافت!`;
  const deltas = [`-${cost} Silver`, `Jarl: ${jarlName}`, 'Unrest -20%', 'Stability +6'];
  const deltasFa = [`-${cost} نقره`, `یارل: ${jarlNameFa}`, 'ناآرامی -20٪', 'ثبات +6'];

  const logId = `log_jarl_${settlementId}_${state.year}_${state.lifeLog.length}`;
  return {
    ...state,
    rngState: rng.getState(),
    realm,
    lifeLog: [
      ...state.lifeLog,
      {
        id: logId,
        year: state.year,
        season: state.season,
        age: state.character.age,
        locationName: target?.name ?? settlementId,
        category: 'Politics & Kings',
        iconType: 'crown',
        title,
        titleFa,
        text,
        textFa,
        deltas,
        deltasFa,
      },
    ],
    lastOutcomeBanner: {
      title,
      titleFa,
      text,
      textFa,
      deltaSummary: deltas,
      deltaSummaryFa: deltasFa,
    },
  };
}

export function executeTakeHostagesAction(
  state: FullGameState,
  settlementId: string
): FullGameState {
  const holdingIdx = state.realm.holdings.findIndex((h) => h.settlementId === settlementId);
  if (holdingIdx < 0) return state;
  const holding = state.realm.holdings[holdingIdx];
  if ((holding.garrison ?? 0) < 6 && state.realm.hirdWarriors < 10) return state;

  const rng = new SeededRNG(state.rngState);
  const target = SETTLEMENTS_BY_ID[settlementId];
  const targetFa = SETTLEMENTS_FA[settlementId]?.name ?? target?.name ?? settlementId;

  const holdings = state.realm.holdings.map((h, i) =>
    i === holdingIdx
      ? {
          ...h,
          hostagesCount: (h.hostagesCount ?? 0) + 1,
          unrest: Math.max(0, (h.unrest ?? 20) - 15),
        }
      : h
  );

  const title = `Hostages Taken from ${target?.name ?? settlementId}`;
  const titleFa = `گرفتن گروگان‌های اشرافی از «${targetFa}»`;
  const text = `Displaying drawn swords and armored hirdmen, you demanded the eldest sons of local magistrates to reside as wards in your hall, curbing any rebellion.`;
  const textFa = `با اتکا به اقتدار شمشیرها و سپاه، فرزندان اشراف و سران محلی «${targetFa}» را به عنوان گروگان به تالار خود آوردید تا دست از هرگونه شورش بردارند.`;
  const deltas = ['+1 Noble Hostage', 'Unrest -15%', 'Honor +4'];
  const deltasFa = ['+1 گروگان اشرافی', 'ناآرامی -15٪', 'شرافت +4'];

  const logId = `log_hostage_${settlementId}_${state.year}_${state.lifeLog.length}`;
  return {
    ...state,
    rngState: rng.getState(),
    character: {
      ...state.character,
      stats: {
        ...state.character.stats,
        honor: clampStat(state.character.stats.honor + 4),
      },
    },
    realm: {
      ...state.realm,
      holdings,
    },
    lifeLog: [
      ...state.lifeLog,
      {
        id: logId,
        year: state.year,
        season: state.season,
        age: state.character.age,
        locationName: target?.name ?? settlementId,
        category: 'Politics & Kings',
        iconType: 'crown',
        title,
        titleFa,
        text,
        textFa,
        deltas,
        deltasFa,
      },
    ],
    lastOutcomeBanner: {
      title,
      titleFa,
      text,
      textFa,
      deltaSummary: deltas,
      deltaSummaryFa: deltasFa,
    },
  };
}

export function executeToggleReligiousToleranceAction(
  state: FullGameState,
  settlementId: string
): FullGameState {
  const holdingIdx = state.realm.holdings.findIndex((h) => h.settlementId === settlementId);
  if (holdingIdx < 0) return state;

  const holdings = state.realm.holdings.map((h, i) =>
    i === holdingIdx ? { ...h, religiousTolerance: !h.religiousTolerance } : h
  );

  return {
    ...state,
    realm: {
      ...state.realm,
      holdings,
    },
  };
}

// ==========================================
// POLITICS & INTRIGUE PLOTS
// ==========================================

export function executePlotAction(
  state: FullGameState,
  plotType: PlotType,
  targetSettlementId?: string,
  targetPersonId?: string
): FullGameState {
  const rng = new SeededRNG(state.rngState);
  const char = {
    ...state.character,
    stats: { ...state.character.stats },
    skills: { ...state.character.skills },
    traits: [...state.character.traits],
  };
  const realm = {
    ...state.realm,
    holdings: state.realm.holdings.map((h) => ({ ...h, buildings: [...h.buildings] })),
  };
  const relationships = state.relationships.map((r) => ({ ...r }));

  let title = '';
  let titleFa = '';
  let text = '';
  let textFa = '';
  const deltas: string[] = [];
  const deltasFa: string[] = [];
  let isDanger = false;

  if (plotType === 'assassination') {
    const cost = 32;
    if (realm.silver < cost) return state;
    realm.silver -= cost;
    const targetIdx = relationships.findIndex(
      (r) => (r.role === 'Blood-Feud Enemy' || r.role === 'Rival') && r.alive
    );
    const foe = targetIdx >= 0 ? relationships[targetIdx] : null;
    const foeName = foe ? foe.name : 'a powerful rival chieftain';
    const foeNameFa = foe ? formatPersonName(foe.name, 'fa') : 'سردار رقیب';

    const roll = char.stats.cunning * 0.7 + char.skills.combat * 0.3 + rng.int(-15, 25);
    if (roll >= 48) {
      if (foe) {
        relationships[targetIdx] = {
          ...foe,
          alive: false,
          deathYear: state.year,
          causeOfDeath: 'Assassinated in dark tavern cellar',
          causeOfDeathFa: 'ترور مخفیانه در دخمه شبانه',
        };
      }
      realm.fame += 35;
      realm.silver += 25;
      char.skills.combat = clampSkill(char.skills.combat + 4);
      title = `Blade in the Dark: ${foeName} Slain!`;
      titleFa = `خنجر در تاریکی: ترور موفق «${foeNameFa}»!`;
      text = `Your hired shadow-blade slipped into the hall undetected. ${foeName} choked on their own blood without sounding the alarm!`;
      textFa = `آدم‌کش اجیرشده شبانه به خوابگاه رخنه کرد و خنجر را در سینه «${foeNameFa}» نشاند، بی‌آن‌که حتی نگهبانی فریاد بزند!`;
      deltas.push(`-${cost} Silver`, `Slain: ${foeName}`, '+35 Fame', '+25 Loot');
      deltasFa.push(`-${cost} نقره`, `هلاکت: ${foeNameFa}`, '+35 شهرت', '+25 غنیمت');
    } else {
      isDanger = true;
      char.stats.honor = clampStat(char.stats.honor - 22);
      title = `Assassination Discovered!`;
      titleFa = `افشای توطئه ترور و رسوایی بزرگ!`;
      text = `The assassin was caught alive! Under torture, they named your house. Outrage spread across the Thing council!`;
      textFa = `آدم‌کش زنده دستگیر شد و زیر شکنجه نام خاندان شما را لو داد! رسوایی بزرگی در شورای ثینگ برپا گشت.`;
      deltas.push(`-${cost} Silver`, 'Honor -22', 'Infamy Gained');
      deltasFa.push(`-${cost} نقره`, 'شرافت -22', 'رسوایی سیاسی');
    }
  } else if (plotType === 'poisoning') {
    const cost = 22;
    if (realm.silver < cost) return state;
    realm.silver -= cost;
    const roll = char.stats.cunning + char.skills.seidr * 0.5 + rng.int(-10, 20);
    if (roll >= 44) {
      realm.fame += 20;
      char.skills.seidr = clampSkill(char.skills.seidr + 4);
      title = `Venom in the Mead Horn`;
      titleFa = `جام زهر در بزم شبانه`;
      text = `Distilling hemlock into the great drinking horn, your rival succumbed to a quiet "heart seizure" by morning.`;
      textFa = `زهر شوکران در جام زرین ریخته شد؛ رقیب شما تا صبح بر اثر ایست ناگهانی قلب جان داد و رازی برملا نشد.`;
      deltas.push(`-${cost} Silver`, '+20 Fame', 'Rival Removed');
      deltasFa.push(`-${cost} نقره`, '+20 شهرت', 'حذف رقیب');
    } else {
      isDanger = true;
      char.stats.honor = clampStat(char.stats.honor - 15);
      title = `Poison Plot Thwarted`;
      titleFa = `کشف سم در جام و خنثی شدن توطئه`;
      text = `A watchful feast-skald smelled the hemlock on the rim! You barely hushed the rumors with silver bribes.`;
      textFa = `شاعر تیزبین بوی گیاه سمی را از لبه جام حس کرد! با دستپاچگی و رشوه توانستید سرپوشی روی قضیه بگذارید.`;
      deltas.push(`-${cost} Silver`, 'Honor -15');
      deltasFa.push(`-${cost} نقره`, 'شرافت -15');
    }
  } else if (plotType === 'bribe_thing') {
    const cost = 25;
    if (realm.silver < cost) return state;
    realm.silver -= cost;
    char.isOutlawed = false;
    char.traits = char.traits.filter((t) => t !== 'outlaw_mark');
    char.skills.law = clampSkill(char.skills.law + 5);
    realm.stability = clampStat(realm.stability + 10);
    title = `Thing Assembly Law-Speaker Bribed`;
    titleFa = `رشوه به سخنگوی قانون در شورای ثینگ`;
    text = `Weighing 25 silver rings into the law-speaker's tunic beneath the Law-Rock, the council declared all judgments in your dynasty’s favor!`;
    textFa = `با لغزاندن ۲۵ حلقه نقره در ردای سخنگوی قانون کنار صخره مقدس، شورا احکام و دعاوی را به نفع دودمان شما مختومه کرد!`;
    deltas.push(`-${cost} Silver`, 'Stability +10', 'Law +5', 'Outlawry Cleared');
    deltasFa.push(`-${cost} نقره`, 'ثبات +10', 'قانون‌دانی +5', 'رفع تبعید');
  } else if (plotType === 'mass_reprisal') {
    if (realm.hirdWarriors < 15) return state;
    const targetH = targetSettlementId
      ? realm.holdings.find((h) => h.settlementId === targetSettlementId)
      : realm.holdings[0];
    if (!targetH) return state;

    targetH.unrest = 0;
    targetH.hostagesCount = (targetH.hostagesCount ?? 0) + 2;
    char.stats.honor = clampStat(char.stats.honor - 18);
    realm.fame += 30;
    realm.stability = clampStat(realm.stability + 8);
    if (!char.traits.includes('cruel')) char.traits.push('cruel');

    const sName = SETTLEMENTS_BY_ID[targetH.settlementId]?.name ?? targetH.settlementId;
    const sNameFa = SETTLEMENTS_FA[targetH.settlementId]?.name ?? sName;

    title = `Iron Reprisal at ${sName}`;
    titleFa = `کشتار و سرکوب قاطع در «${sNameFa}»`;
    text = `In the grim tradition of the 1002 St Brice's Day, you struck before the rebels could arm! Conspirators were swept away; unrest in ${sName} dropped to 0%!`;
    textFa = `همانند واقعه تاریخی سنت برایس در سال ۱۰۰۲، پیش‌دستی کرده و سران توطئه را در دم از میان برداشتید! ناآرامی در «${sNameFa}» به صفر رسید.`;
    deltas.push('Unrest: 0%', 'Honor -18', '+2 Hostages', 'Trait: Cruel');
    deltasFa.push('ناآرامی: ۰٪', 'شرافت -18', '+2 گروگان', 'ویژگی: بی‌رحم');
  }

  const logId = `log_plot_${plotType}_${state.year}_${state.lifeLog.length}`;
  return {
    ...state,
    rngState: rng.getState(),
    character: char,
    realm,
    relationships,
    lifeLog: [
      ...state.lifeLog,
      {
        id: logId,
        year: state.year,
        season: state.season,
        age: char.age,
        locationName: SETTLEMENTS_BY_ID[char.locationId]?.name ?? char.locationId,
        category: 'Politics & Kings',
        iconType: 'crown',
        title,
        titleFa,
        text,
        textFa,
        deltas,
        deltasFa,
        isDanger,
      },
    ],
    lastOutcomeBanner: {
      title,
      titleFa,
      text,
      textFa,
      deltaSummary: deltas,
      deltaSummaryFa: deltasFa,
    },
  };
}

// ==========================================
// TACTICAL BATTLE RESOLUTION ENGINE
// ==========================================

export function initiateBattle(
  state: FullGameState,
  settlementId: string,
  intent: BattleIntent = 'raid'
): FullGameState {
  const target = SETTLEMENTS_BY_ID[settlementId];
  if (!target) return state;

  const rng = new SeededRNG(state.rngState);
  const targetFa = SETTLEMENTS_FA[target.id]?.name ?? target.name;
  const enemyWarriors = Math.round(target.baseDefense * 4 + rng.int(8, 20));
  const playerWarriors = state.realm.hirdWarriors;
  const playerShips = state.realm.longships + state.realm.knarrs;

  const terrain: 'coastal' | 'river' | 'forest' | 'open_plains' | 'fortified_walls' =
    target.isRiverPort
      ? 'river'
      : target.baseDefense >= 8
        ? 'fortified_walls'
        : rng.pick(['coastal', 'open_plains', 'forest'] as const);

  const battle: BattleState = {
    id: `battle_${settlementId}_${state.year}_${Date.now()}`,
    settlementId,
    intent,
    targetName: target.name,
    targetNameFa: targetFa,
    enemyWarriors,
    playerWarriors,
    playerShips,
    terrain,
    season: state.season,
    round: 1,
    playerMorale: 85 + Math.round(state.character.stats.honor * 0.15),
    enemyMorale: 75 + target.baseDefense * 3,
    log: [`Battle lines formed before the walls of ${target.name}. Choose your opening tactic!`],
    logFa: [`آرایش نبرد در برابر باروهای «${targetFa}» شکل گرفت. تاکتیک فرماندهی خود را برگزینید!`],
    resolved: false,
  };

  return {
    ...state,
    rngState: rng.getState(),
    activeBattle: battle,
  };
}

export function resolveBattleTactic(
  state: FullGameState,
  tactic: BattleTactic
): FullGameState {
  const battle = state.activeBattle;
  if (!battle || battle.resolved) return state;

  const rng = new SeededRNG(state.rngState);
  const char = { ...state.character, stats: { ...state.character.stats }, skills: { ...state.character.skills } };
  const realm = {
    ...state.realm,
    holdings: state.realm.holdings.map((h) => ({ ...h, buildings: [...h.buildings] })),
  };
  const target = SETTLEMENTS_BY_ID[battle.settlementId];
  const targetFa = battle.targetNameFa;

  let playerLosses = 0;
  let enemyLosses = 0;
  let tacticDescEn = '';
  let tacticDescFa = '';

  if (tactic === 'shield_wall') {
    // Skjaldborg - solid defensive grind
    playerLosses = rng.int(0, Math.max(1, Math.floor(battle.enemyWarriors * 0.08)));
    enemyLosses = Math.round(char.skills.combat * 0.3 + rng.int(6, 14));
    battle.enemyMorale -= 28;
    tacticDescEn = `Locking rim-to-rim shields in an unbreakable Skjaldborg, your front line held against arrows while grinding the defenders down!`;
    tacticDescFa = `با بستن دیوار سپرهای نفوذناپذیر (اسکیالدبورگ)، باران تیرها دفع شد و صفوف دشمن زیر فشار کوبنده نیزه‌ها عقب نشست!`;
  } else if (tactic === 'svinfylking') {
    // Boar's Snout wedge charge
    playerLosses = rng.int(2, Math.max(2, Math.floor(battle.enemyWarriors * 0.14)));
    enemyLosses = Math.round(char.skills.combat * 0.5 + char.stats.strength * 0.3 + rng.int(10, 22));
    battle.enemyMorale -= 40;
    tacticDescEn = `Spearheading the wedge in a furious Boar's Snout charge, your champions smashed through the enemy center!`;
    tacticDescFa = `با یورش گوه‌شکل پوزه گراز (سوئین‌فیلکینگ)، دلاوران صفوف میانی دشمن را شکافتند و خطوط مدافعان را متلاشی کردند!`;
  } else if (tactic === 'ambush') {
    // Cunning ambush
    if (char.stats.cunning >= 42 || rng.chance(0.6)) {
      playerLosses = rng.int(0, 1);
      enemyLosses = Math.round(char.stats.cunning * 0.4 + rng.int(12, 20));
      battle.enemyMorale -= 45;
      tacticDescEn = `Emerging through river mist and pine woods, your warriors surprised the enemy from the rear with deadly fury!`;
      tacticDescFa = `از میان مه غلیظ و جنگل‌های کاج ناگهان از پشت سر بر سر مدافعان تاختید و وحشت را بر دلشان انداختید!`;
    } else {
      playerLosses = rng.int(2, 5);
      enemyLosses = rng.int(4, 9);
      battle.playerMorale -= 15;
      tacticDescEn = `The enemy scouts spotted the flanking column, engaging in a bloody skirmish in the brush!`;
      tacticDescFa = `دیده‌بانان دشمن متوجه پیشروی مخفیانه شدند و درگیری شدیدی در بیشه‌زار درگرفت!`;
    }
  } else if (tactic === 'flank_assault') {
    // Longship outflanking
    playerLosses = rng.int(1, 3);
    enemyLosses = Math.round(char.skills.seamanship * 0.4 + rng.int(8, 16));
    battle.enemyMorale -= 32;
    tacticDescEn = `Beaching swift longships behind the defensive palisade, your oarsmen enveloped the garrison's exposed flank!`;
    tacticDescFa = `با به‌گل‌نشاندن سریع کشتی‌ها پشت باروی چوبی، پاروزنان جناح بی‌دفاع پادگان را دور زدند!`;
  } else if (tactic === 'feigned_retreat') {
    // Fake panic to lure defenders
    if (char.stats.cunning >= 38) {
      playerLosses = rng.int(0, 2);
      enemyLosses = Math.round(char.stats.cunning * 0.45 + rng.int(14, 25));
      battle.enemyMorale -= 50;
      tacticDescEn = `Feigning panic down the muddy slope, you drew the defenders out into the open before turning to encircle them!`;
      tacticDescFa = `با عقب‌نشینی ساختگی مدافعان از دژ بیرون کشیده شدند و در دشت هموار به محاصره کامل درآمدند!`;
    } else {
      playerLosses = rng.int(2, 6);
      enemyLosses = rng.int(5, 10);
      battle.playerMorale -= 20;
      tacticDescEn = `The retreat turned chaotic under heavy crossbow fire before order could be restored!`;
      tacticDescFa = `عقب‌نشینی زیر باران تیر به بی‌نظمی کشیده شد تا این‌که با دشواری صفوف دوباره بسته شد!`;
    }
  } else if (tactic === 'berserk_charge') {
    // Furious terror assault
    playerLosses = rng.int(3, 7);
    enemyLosses = Math.round(char.skills.combat * 0.6 + rng.int(16, 30));
    battle.enemyMorale -= 60;
    battle.playerMorale += 10;
    tacticDescEn = `Biting shield rims and howling the names of Odin and Thor, your berserkers threw terror into the enemy ranks!`;
    tacticDescFa = `با دندان گرفتن لبه سپرها و نعره‌های مستانه خدایان کهن، برزرکرهای خشمگین وحشت مرگبار بر دل دشمن انداختند!`;
  } else if (tactic === 'orderly_retreat') {
    // Sound horns and pull back
    battle.resolved = true;
    battle.won = false;
    battle.log.push(`Sounded the war-horns and rowed clear of the harbor, preserving your ships and warband.`);
    battle.logFa.push(`با به‌صدا درآوردن شیپورهای عقب‌نشینی به کشتی‌ها بازگشتید و جان جنگجویان را نجات دادید.`);
    return {
      ...state,
      activeBattle: null,
      lastOutcomeBanner: {
        title: `Retreat from ${battle.targetName}`,
        titleFa: `عقب‌نشینی از ${targetFa}`,
        text: `You sounded the horns and disengaged back to the longships, preserving your hird.`,
        textFa: `با درایت شیپور بازگشت را زدید و نیروها را سالم به کشتی‌ها بازگرداندید.`,
        deltaSummary: ['Preserved Warband'],
        deltaSummaryFa: ['حفظ جنگجویان'],
      },
    };
  }

  battle.playerWarriors = Math.max(0, battle.playerWarriors - playerLosses);
  battle.enemyWarriors = Math.max(0, battle.enemyWarriors - enemyLosses);
  realm.hirdWarriors = Math.max(0, realm.hirdWarriors - playerLosses);

  battle.log.push(tacticDescEn);
  battle.logFa.push(tacticDescFa);

  // Victory or Defeat determination
  if (battle.enemyWarriors <= 0 || battle.enemyMorale <= 15) {
    battle.resolved = true;
    battle.won = true;
    const isMonastery = target?.settlementType === 'monastery';
    const lootSilver = isMonastery
      ? Math.round((target?.baseWealth ?? 5) * 16 + rng.int(40, 90))
      : Math.round((target?.baseWealth ?? 5) * 12 + rng.int(25, 60));
    const lootFame = Math.round(25 + (target?.baseDefense ?? 5) * 5);
    realm.silver += lootSilver;
    realm.fame += lootFame;
    char.stats.honor = clampStat(char.stats.honor + 10);
    char.skills.combat = clampSkill(char.skills.combat + 5);

    const currentStatuses = { ...(state.settlementStatuses ?? {}) };

    if (battle.intent === 'conquer') {
      currentStatuses[battle.settlementId] = 'conquered';
      const existingHolding = realm.holdings.find((h) => h.settlementId === battle.settlementId);
      if (existingHolding) {
        existingHolding.farms += 2;
        existingHolding.garrison += 6;
      } else {
        realm.holdings.push({
          settlementId: battle.settlementId,
          farms: 2,
          buildings: [],
          garrison: 8,
          unrest: 30,
          norsePopulationShare: 25,
          tributeBurden: 'normal',
          hostagesCount: 1,
          religiousTolerance: true,
        });
      }
      realm.landFarms += 2;
    } else if (battle.intent === 'settle') {
      currentStatuses[battle.settlementId] = 'conquered';
      realm.holdings.push({
        settlementId: battle.settlementId,
        farms: 2,
        buildings: [],
        garrison: 5,
        unrest: 10,
        norsePopulationShare: 75,
        tributeBurden: 'light',
        hostagesCount: 0,
        religiousTolerance: true,
      });
      realm.landFarms += 2;
    }

    const bannerTitle = `Glorious Victory at ${battle.targetName}!`;
    const bannerTitleFa = `پیروزی باشکوه و درخشان در «${targetFa}»!`;
    const bannerText = `The defenders broke and surrendered the citadel! You won ${lootSilver} silver, ${lootFame} fame, and military dominance.`;
    const bannerTextFa = `مدافعان شکست را پذیرفتند و تسلیم شدند! ${lootSilver} نقره غنیمت، +${lootFame} شهرت و تسلط کامل نصیب سپاه شما شد.`;

    const logId = `log_bat_won_${battle.settlementId}_${state.year}_${state.lifeLog.length}`;
    const nextState: FullGameState = {
      ...state,
      rngState: rng.getState(),
      activeBattle: null,
      conquestsWon: (state.conquestsWon ?? 0) + (battle.intent === 'conquer' ? 1 : 0),
      totalRaidsWon: (state.totalRaidsWon ?? 0) + (battle.intent === 'raid' ? 1 : 0),
      settlementStatuses: currentStatuses,
      character: char,
      realm,
      lifeLog: [
        ...state.lifeLog,
        {
          id: logId,
          year: state.year,
          season: state.season,
          age: char.age,
          locationName: battle.targetName,
          category: 'War',
          iconType: 'sword',
          title: bannerTitle,
          titleFa: bannerTitleFa,
          text: bannerText,
          textFa: bannerTextFa,
          deltas: [`+${lootSilver} Silver`, `+${lootFame} Fame`, `-${playerLosses} Warriors`],
          deltasFa: [`+${lootSilver} نقره`, `+${lootFame} شهرت`, `-${playerLosses} جنگجو`],
        },
      ],
      lastOutcomeBanner: {
        title: bannerTitle,
        titleFa: bannerTitleFa,
        text: bannerText,
        textFa: bannerTextFa,
        deltaSummary: [`+${lootSilver} Silver`, `+${lootFame} Fame`],
        deltaSummaryFa: [`+${lootSilver} نقره`, `+${lootFame} شهرت`],
      },
    };
    nextState.achievements = evaluateAchievements(nextState);
    return nextState;
  } else if (battle.playerWarriors <= 0 || battle.playerMorale <= 15) {
    battle.resolved = true;
    battle.won = false;
    char.stats.health = clampStat(char.stats.health - 20);
    realm.fame = Math.max(0, realm.fame - 25);

    const bannerTitle = `Assault Repelled at ${battle.targetName}`;
    const bannerTitleFa = `شکست یورش و عقب‌نشینی در «${targetFa}»`;
    const bannerText = `Your battle line was shattered by heavy garrison archery and catapult stones. You pulled the wounded back to the ships.`;
    const bannerTextFa = `صف نبرد زیر آتش سنگین کمانداران دژ از هم پاشید؛ ناچار شدید با زخمی‌ها به سوی کشتی‌ها عقب‌نشینی کنید.`;

    const logId = `log_bat_lost_${battle.settlementId}_${state.year}_${state.lifeLog.length}`;
    const nextState: FullGameState = {
      ...state,
      rngState: rng.getState(),
      activeBattle: null,
      character: char,
      realm,
      lifeLog: [
        ...state.lifeLog,
        {
          id: logId,
          year: state.year,
          season: state.season,
          age: char.age,
          locationName: battle.targetName,
          category: 'War',
          iconType: 'skull',
          title: bannerTitle,
          titleFa: bannerTitleFa,
          text: bannerText,
          textFa: bannerTextFa,
          deltas: [`-${playerLosses} Warriors`, 'Health -20', '-25 Fame'],
          deltasFa: [`-${playerLosses} جنگجو`, 'سلامتی -20', '-25 شهرت'],
          isDanger: true,
        },
      ],
      lastOutcomeBanner: {
        title: bannerTitle,
        titleFa: bannerTitleFa,
        text: bannerText,
        textFa: bannerTextFa,
        deltaSummary: [`-${playerLosses} Warriors`, 'Health -20'],
        deltaSummaryFa: [`-${playerLosses} جنگجو`, 'سلامتی -20'],
      },
    };
    if (char.stats.health <= 0) {
      return triggerDeathState(
        nextState,
        `Fell in the breach while leading the storm of ${battle.targetName}.`,
        `در شکاف دیوارهای «${targetFa}» در اوج نبرد تیرباران شدی و جان باختی.`
      );
    }
    return nextState;
  }

  // Next round
  battle.round += 1;
  return {
    ...state,
    rngState: rng.getState(),
    activeBattle: { ...battle },
    character: char,
    realm,
  };
}

export function cancelBattle(state: FullGameState): FullGameState {
  return {
    ...state,
    activeBattle: null,
  };
}

// ==========================================
// EMERGENT DYNAMIC SPECIAL TITLES
// ==========================================

export interface SpecialTitleClaim {
  id: string;
  name: string;
  nameFa: string;
  requirements: string;
  requirementsFa: string;
  canClaim: boolean;
}

export function checkSpecialTitles(state: FullGameState): SpecialTitleClaim[] {
  const holdingsSet = new Set(state.realm.holdings.map((h) => h.settlementId));
  const tribsSet = new Set(state.tributaries ?? []);
  const hasSettlement = (id: string) => holdingsSet.has(id) || tribsSet.has(id);
  const alreadyClaimed = new Set(state.specialTitles ?? []);

  return [
    {
      id: 'jarl_of_orkney',
      name: 'Jarl of Orkney',
      nameFa: 'یارل اورکنی و جزایر غرب',
      requirements: 'Hold Birsay or Kirkwall + 25+ Warriors',
      requirementsFa: 'تسلط بر بیرسی یا کیرک‌وال + ۲۵ جنگجو',
      canClaim: !alreadyClaimed.has('jarl_of_orkney') && (hasSettlement('birsay') || hasSettlement('kirkwall')) && state.realm.hirdWarriors >= 25,
    },
    {
      id: 'danelaw_lord',
      name: 'Lord of the Danelaw',
      nameFa: 'فرمانروای قلمرو دانلا (انگلستان)',
      requirements: 'Hold Jorvik or London + 45+ Warriors + 250+ Fame',
      requirementsFa: 'تسلط بر یورک یا لندن + ۴۵ جنگجو + ۲۵۰ شهرت',
      canClaim: !alreadyClaimed.has('danelaw_lord') && (hasSettlement('jorvik') || hasSettlement('london')) && state.realm.hirdWarriors >= 45 && state.realm.fame >= 250,
    },
    {
      id: 'duke_of_normandy',
      name: 'Duke of Normandy',
      nameFa: 'دوک نورماندی و سرحدات فرانکستان',
      requirements: 'Hold Rouen + 50+ Warriors + Christian or Syncretic',
      requirementsFa: 'تسلط بر روآن + ۵۰ جنگجو + آیین مسیحی یا ترکیبی',
      canClaim: !alreadyClaimed.has('duke_of_normandy') && hasSettlement('rouen') && state.realm.hirdWarriors >= 50 && state.character.religion !== Religion.NorsePagan,
    },
    {
      id: 'varangian_commander',
      name: 'Varangian Guard Commander',
      nameFa: 'فرمانده گارد وارنگیان بیزانس',
      requirements: 'Combat 45+ + Visited Miklagard + 300+ Fame',
      requirementsFa: 'مهارت نبرد ۴۵ + سفر به میکلاگارد (کنستانتینوپل) + ۳۰۰ شهرت',
      canClaim: !alreadyClaimed.has('varangian_commander') && state.character.skills.combat >= 45 && state.discoveredSettlements.includes('constantinople') && state.realm.fame >= 300,
    },
    {
      id: 'prince_of_rus',
      name: 'Grand Prince of the Rus',
      nameFa: 'شاهزاده بزرگ روس کی‌یف',
      requirements: 'Hold Kiev or Novgorod + 60+ Warriors + 2+ River Knarrs',
      requirementsFa: 'تسلط بر کی‌یف یا نووگورود + ۶۰ جنگجو + ۲ کشتی کنار',
      canClaim: !alreadyClaimed.has('prince_of_rus') && (hasSettlement('kiev') || hasSettlement('novgorod')) && state.realm.hirdWarriors >= 60 && state.realm.knarrs >= 2,
    },
    {
      id: 'king_of_norway',
      name: 'King of All Norway',
      nameFa: 'پادشاه سراسر نروژ',
      requirements: 'Hold 3 Norwegian Ports + 80+ Warriors + 500+ Fame',
      requirementsFa: 'تسلط بر ۳ شهر نروژ (نیداروس، کاوپانگ...) + ۸۰ جنگجو + ۵۰۰ شهرت',
      canClaim: !alreadyClaimed.has('king_of_norway') && ['nidaros', 'kaupang', 'bergen', 'stavanger'].filter(hasSettlement).length >= 2 && state.realm.hirdWarriors >= 80 && state.realm.fame >= 500,
    },
  ];
}

export function claimSpecialTitle(
  state: FullGameState,
  specialTitleId: string
): FullGameState {
  const specialTitles = [...(state.specialTitles ?? []), specialTitleId];
  const titleInfo = checkSpecialTitles(state).find((t) => t.id === specialTitleId);
  if (!titleInfo) return state;

  const char = {
    ...state.character,
    stats: { ...state.character.stats, honor: clampStat(state.character.stats.honor + 18) },
  };
  const realm = {
    ...state.realm,
    fame: state.realm.fame + 80,
    stability: clampStat(state.realm.stability + 12),
  };

  const titleEn = `Acclaimed: ${titleInfo.name}!`;
  const titleFa = `دستیابی به عنوان تاریخی: «${titleInfo.nameFa}»!`;
  const textEn = `Echoing through stone halls and across northern seas, heralds proclaimed ${char.givenName} as ${titleInfo.name}!`;
  const textFa = `با پژواک در تالارهای سنگی و امواج دریا، جارچیان رسماً «${formatPersonName(char.givenName, 'fa')}» را به مقام تاریخی «${titleInfo.nameFa}» آراستند!`;

  const logId = `log_spectitle_${specialTitleId}_${state.year}_${state.lifeLog.length}`;
  return {
    ...state,
    specialTitles,
    character: char,
    realm,
    lifeLog: [
      ...state.lifeLog,
      {
        id: logId,
        year: state.year,
        season: state.season,
        age: char.age,
        locationName: SETTLEMENTS_BY_ID[char.locationId]?.name ?? char.locationId,
        category: 'Politics & Kings',
        iconType: 'crown',
        title: titleEn,
        titleFa,
        text: textEn,
        textFa,
        deltas: [`Special Title: ${titleInfo.name}`, '+80 Fame', 'Honor +18', 'Stability +12'],
        deltasFa: [`عنوان ویژه: ${titleInfo.nameFa}`, '+80 شهرت', 'شرافت +18', 'ثبات +12'],
      },
    ],
    lastOutcomeBanner: {
      title: titleEn,
      titleFa,
      text: textEn,
      textFa,
      deltaSummary: [`Special Title: ${titleInfo.name}`, '+80 Fame'],
      deltaSummaryFa: [`عنوان ویژه: ${titleInfo.nameFa}`, '+80 شهرت'],
    },
  };
}
