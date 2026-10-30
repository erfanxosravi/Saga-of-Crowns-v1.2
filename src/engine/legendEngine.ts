import { SETTLEMENTS_BY_ID } from '../data/geography';
import {
  LEGENDS_BY_ID,
  LEGENDS_REGISTRY,
  LegendRegistryEntry,
  LegendTimelineBeat,
  ORDSTIRR_RANK_LABELS,
  validateLegendsRegistry,
} from '../data/legendsRegistry';
import { SETTLEMENTS_FA } from '../i18n/gameDataFa';
import {
  ContentIntensity,
  FullGameState,
  LegendOrdstirrRank,
  LegendStandingRecord,
  LegendWorldState,
  LogEntry,
  NewsSourceType,
  PendingLegendNewsItem,
  Season,
} from '../types/game';
import { hashSeedString, SeededRNG } from './prng';

export const PAY_LEGEND_INTEL_COST = 12;

const SEASON_ORDER: Season[] = [Season.Spring, Season.Summer, Season.Autumn, Season.Winter];

export const NEWS_SOURCE_LABELS: Record<
  NewsSourceType,
  { en: string; fa: string; reliabilityEn: string; reliabilityFa: string }
> = {
  EYEWITNESS: {
    en: 'EYEWITNESS',
    fa: 'شاهد عینی',
    reliabilityEn: 'Direct Harbor Sighting',
    reliabilityFa: 'مشاهده مستقیم در بندر',
  },
  SKALD_SONG: {
    en: "SKALD'S SONG",
    fa: 'سروده اسکالدها',
    reliabilityEn: 'Court Verse & Oral Tradition',
    reliabilityFa: 'شعر درباری و روایت شفاهی',
  },
  TRADER_TALE: {
    en: "TRADER'S TALE",
    fa: 'روایت بازرگانان',
    reliabilityEn: 'Merchant Knarr Rumor',
    reliabilityFa: 'شایعه کشتی‌های تجاری (احتمال اغراق)',
  },
  MONK_CHRONICLE: {
    en: "MONK'S CHRONICLE",
    fa: 'تواریخ راهبان',
    reliabilityEn: 'Scriptorium Parchment',
    reliabilityFa: 'ثبت‌شده در پوست‌نوشته صومعه',
  },
};

// Run registry validation once at module load
const validation = validateLegendsRegistry();
if (!validation.valid) {
  console.warn('[Hall of Legends] Registry validation warnings:', validation.errors);
}

export function createEmptyStandingRecord(legendId: string): LegendStandingRecord {
  return {
    legendId,
    standing: 0,
    oaths: [],
    feuds: [],
    gifts: [],
    metYears: [],
  };
}

export function createInitialLegendState(startYear: number, seedString: string): LegendWorldState {
  const deliveredBeatIds: string[] = [];
  const standings: Record<string, LegendStandingRecord> = {};

  for (const leg of LEGENDS_REGISTRY) {
    standings[leg.id] = createEmptyStandingRecord(leg.id);
    for (const beat of leg.timeline) {
      if (beat.year < startYear) {
        deliveredBeatIds.push(beat.id);
      }
    }
  }

  // Deterministic slight initial affinity if seed favors certain halls
  const rng = new SeededRNG(hashSeedString(`${seedString}_legends_init`));
  if (rng.chance(0.5) && standings['ragnar_lothbrok']) {
    standings['ragnar_lothbrok'].standing = 5;
  }

  return {
    deliveredBeatIds,
    rumorQueue: [],
    correctedBeatIds: [],
    standings,
    divergedBeatIds: [],
    memorializedLegendIds: [],
  };
}

export function ensureLegendState(state: FullGameState): LegendWorldState {
  if (state.legendState) {
    return {
      deliveredBeatIds: [...(state.legendState.deliveredBeatIds ?? [])],
      rumorQueue: (state.legendState.rumorQueue ?? []).map((r) => ({ ...r })),
      correctedBeatIds: [...(state.legendState.correctedBeatIds ?? [])],
      standings: { ...(state.legendState.standings ?? {}) },
      divergedBeatIds: [...(state.legendState.divergedBeatIds ?? [])],
      memorializedLegendIds: [...(state.legendState.memorializedLegendIds ?? [])],
      lastPaidIntelYear: state.legendState.lastPaidIntelYear,
    };
  }
  return createInitialLegendState(state.year, state.seedString);
}

/**
 * Calculates seasonal travel delay (0 to 4 seasons) based on great-circle distance
 * between the beat's settlement and the player's current port.
 */
export function calculateNewsDelaySeasons(
  fromSettlementId: string,
  toSettlementId: string
): number {
  if (fromSettlementId === toSettlementId) return 0;
  const from = SETTLEMENTS_BY_ID[fromSettlementId];
  const to = SETTLEMENTS_BY_ID[toSettlementId];
  if (!from || !to) return 1;

  if (from.regionGroup === to.regionGroup) return 0;

  const R_NM = 3440.065;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLon = toRad(to.lon - from.lon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const nm = R_NM * c * 1.25;

  if (nm < 220) return 0;
  if (nm < 520) return 1;
  if (nm < 1050) return 2;
  return 3;
}

export function pickNewsSourceType(
  beat: LegendTimelineBeat,
  delaySeasons: number,
  rng: SeededRNG
): NewsSourceType {
  if (delaySeasons === 0) return 'EYEWITNESS';
  const s = SETTLEMENTS_BY_ID[beat.settlementId];
  if (
    beat.tone === 'chronicle' ||
    s?.isMonastery ||
    beat.region === 'Continent' ||
    beat.region === 'British Isles'
  ) {
    if (rng.chance(0.42)) return 'MONK_CHRONICLE';
  }
  if (beat.importance === 'epic' || beat.isDeathBeat || beat.skaldVerse) {
    return rng.chance(0.75) ? 'SKALD_SONG' : 'TRADER_TALE';
  }
  return rng.chance(0.55) ? 'TRADER_TALE' : 'SKALD_SONG';
}

function checkBeatContradictsPlayerWorld(
  beat: LegendTimelineBeat,
  state: FullGameState
): boolean {
  if (!beat.isCanonicalAnchor) return false;
  // If the player already conquered the target city before the canonical siege/conquest
  const playerHoldsCity = state.realm.holdings.some(
    (h) => h.settlementId === beat.settlementId && h.farms > 0
  );
  if (
    playerHoldsCity &&
    (beat.id === 'beat_ragnar_845_seine_paris' ||
      beat.id === 'beat_ivar_867_york_aella_fall' ||
      beat.id === 'beat_rollo_911_normandy_treaty')
  ) {
    return true;
  }
  return false;
}

function buildLogFromNewsItem(
  item: PendingLegendNewsItem,
  legend: LegendRegistryEntry,
  beat: LegendTimelineBeat,
  state: FullGameState,
  isSkaldDivergence: boolean,
  useDriftVariant: boolean
): LogEntry {
  const isMild = state.settings.contentIntensity === ContentIntensity.Mild;
  const s = SETTLEMENTS_BY_ID[beat.settlementId];
  const locName = s?.name ?? beat.settlementId;
  const locNameFa = SETTLEMENTS_FA[beat.settlementId]?.name ?? locName;

  let baseTitle = useDriftVariant && beat.driftVariant ? beat.driftVariant.title : beat.title;
  let baseTitleFa =
    useDriftVariant && beat.driftVariant ? beat.driftVariant.titleFa : beat.titleFa;
  let baseText =
    useDriftVariant && beat.driftVariant
      ? beat.driftVariant.text
      : isMild && beat.mildText
        ? beat.mildText
        : beat.text;
  let baseTextFa =
    useDriftVariant && beat.driftVariant
      ? beat.driftVariant.textFa
      : isMild && beat.mildTextFa
        ? beat.mildTextFa
        : beat.textFa;

  if (item.isDistortedRumor && item.distortedTitle && item.distortedText) {
    baseTitle = item.distortedTitle;
    baseTitleFa = item.distortedTitleFa ?? item.distortedTitle;
    baseText = item.distortedText;
    baseTextFa = item.distortedTextFa ?? item.distortedText;
  } else if (item.isCorrection) {
    baseTitle = `Verified Word · ${baseTitle}`;
    baseTitleFa = `تصحیح شایعه و خبر موثق · ${baseTitleFa}`;
    baseText = `Reliable skalds arriving at your harbor corrected earlier merchant rumors from ${locName}: ${baseText}`;
    baseTextFa = `اسکالدهای موثق که به بندر رسیدند، شایعات پیشین بازرگانان درباره ${locNameFa} را تصحیح کردند: ${baseTextFa}`;
  }

  if (isSkaldDivergence) {
    baseText = `${baseText} — Yet the skalds tell it differently in your hall, for your own banner had already reshaped the fate of ${locName}.`;
    baseTextFa = `${baseTextFa} — با این حال «اسکالدها روایت دیگری می‌گویند»، چرا که درفش خاندان تو پیش‌تر سرنوشت ${locNameFa} را دگرگون ساخته بود.`;
  }

  const delayNoteEn =
    item.delaySeasons === 0
      ? 'Eyewitness word in port'
      : `Word traveled ${item.delaySeasons} season${item.delaySeasons > 1 ? 's' : ''} from ${locName}`;
  const delayNoteFa =
    item.delaySeasons === 0
      ? `گزارش مستقیم در بندر ${locNameFa}`
      : `رسیدن خبر پس از ${item.delaySeasons} فصل از ${locNameFa}`;

  const deltas: string[] = [
    `${NEWS_SOURCE_LABELS[item.sourceType].en}`,
    delayNoteEn,
    ...(isSkaldDivergence ? ['The Skalds Tell It Differently'] : []),
  ];
  const deltasFa: string[] = [
    `${NEWS_SOURCE_LABELS[item.sourceType].fa}`,
    delayNoteFa,
    ...(isSkaldDivergence ? ['اسکالدها روایت دیگری می‌گویند'] : []),
  ];

  return {
    id: `log_legnews_${beat.id}_${state.year}_${item.isCorrection ? 'corr' : item.isDistortedRumor ? 'rumor' : 'true'}`,
    year: state.year,
    season: item.deliverySeason,
    age: state.character.age,
    locationName: locName,
    category: 'Word from the Lands',
    iconType: beat.isDeathBeat
      ? 'skull'
      : beat.tone === 'voyage'
        ? 'ship'
        : beat.tone === 'prophecy'
          ? 'religion'
          : 'crown',
    title: `${legend.name} · ${baseTitle}`,
    titleFa: `${legend.nameFa} · ${baseTitleFa}`,
    text: baseText,
    textFa: baseTextFa,
    deltas,
    deltasFa,
    provenance: legend.provenance,
    isSemiLegendary: legend.statusTag !== 'DOCUMENTED',
    isDivergence: isSkaldDivergence,
    isDanger: Boolean(beat.isDeathBeat),
    legendNews: {
      legendId: legend.id,
      beatId: beat.id,
      statusTag: legend.statusTag,
      sourceType: item.sourceType,
      delaySeasons: item.delaySeasons,
      isRumor: Boolean(item.isDistortedRumor),
      isCorrection: Boolean(item.isCorrection),
      isElegy: Boolean(beat.isDeathBeat),
      isSkaldDivergence,
      skaldVerse: beat.skaldVerse,
      skaldVerseFa: beat.skaldVerseFa,
    },
  };
}

/**
 * Processes yearly legend beats and queued rumors when advancing a turn.
 */
export function processYearlyLegends(
  state: FullGameState,
  rng: SeededRNG
): {
  legendState: LegendWorldState;
  newsLogs: LogEntry[];
  addedFlags: string[];
} {
  const legendState = ensureLegendState(state);
  if (!state.sagaMode) {
    return { legendState, newsLogs: [], addedFlags: [] };
  }

  const deliveredSet = new Set(legendState.deliveredBeatIds);
  const correctedSet = new Set(legendState.correctedBeatIds);
  const divergedSet = new Set(legendState.divergedBeatIds);
  const nextQueue: PendingLegendNewsItem[] = [];
  const newsLogs: LogEntry[] = [];
  const addedFlags: string[] = [];

  const seedHash = hashSeedString(state.seedString);

  // 1. Check due items already in rumorQueue
  for (const queued of legendState.rumorQueue) {
    if (queued.deliveryYear <= state.year) {
      const leg = LEGENDS_BY_ID[queued.legendId];
      const beat = leg?.timeline.find((b) => b.id === queued.beatId);
      if (leg && beat) {
        const isSkaldDiv = checkBeatContradictsPlayerWorld(beat, state);
        if (isSkaldDiv) divergedSet.add(beat.id);
        const driftRng = new SeededRNG(seedHash ^ hashSeedString(beat.id));
        const useDrift = Boolean(
          beat.driftVariant && !beat.isCanonicalAnchor && driftRng.chance(beat.driftVariant.seedChance)
        );
        newsLogs.push(
          buildLogFromNewsItem(queued, leg, beat, state, isSkaldDiv, useDrift)
        );
        deliveredSet.add(beat.id);
        if (queued.isCorrection) {
          correctedSet.add(beat.id);
        }
        if (beat.setsFlags) {
          beat.setsFlags.forEach((f) => addedFlags.push(f));
        }
      }
    } else {
      nextQueue.push(queued);
    }
  }

  // 2. Evaluate new beats occurring in `state.year`
  for (const leg of LEGENDS_REGISTRY) {
    for (const beat of leg.timeline) {
      if (beat.year !== state.year) continue;
      if (deliveredSet.has(beat.id)) continue;
      if (
        beat.requiresFlags &&
        !beat.requiresFlags.every((f) => state.flags.includes(f) || addedFlags.includes(f))
      ) {
        continue;
      }
      if (
        beat.blockedByFlags &&
        beat.blockedByFlags.some((f) => state.flags.includes(f) || addedFlags.includes(f))
      ) {
        continue;
      }

      const delaySeasons = calculateNewsDelaySeasons(
        beat.settlementId,
        state.character.locationId
      );
      const beatSeasonIdx = SEASON_ORDER.indexOf(beat.season);
      const totalSeasonIdx = beatSeasonIdx + delaySeasons;
      const yearOffset = totalSeasonIdx >= 4 ? 1 : 0;
      const deliverySeason = SEASON_ORDER[totalSeasonIdx % 4];
      const deliveryYear = state.year + yearOffset;
      const sourceType = pickNewsSourceType(beat, delaySeasons, rng);

      // Low-reliability trader tales over long distances can occasionally carry a rumor distortion first
      const canDistort =
        sourceType === 'TRADER_TALE' &&
        delaySeasons >= 2 &&
        !beat.isCanonicalAnchor &&
        !beat.isDeathBeat &&
        rng.chance(0.24);

      if (canDistort) {
        const sName = SETTLEMENTS_BY_ID[beat.settlementId]?.name ?? beat.settlementId;
        const sNameFa = SETTLEMENTS_FA[beat.settlementId]?.name ?? sName;
        const rumorItem: PendingLegendNewsItem = {
          beatId: beat.id,
          legendId: leg.id,
          triggerYear: state.year,
          deliveryYear: state.year,
          deliverySeason: Season.Winter,
          delaySeasons,
          sourceType: 'TRADER_TALE',
          isDistortedRumor: true,
          distortedTitle: `Unconfirmed Trader Rumor from ${sName}`,
          distortedTitleFa: `شایعه تأییدنشده بازرگانان از ${sNameFa}`,
          distortedText: `Salt-traders docking from distant waters claim ${leg.name} met with a sudden reversal at ${sName}, though no two oarsmen agree on the tally of ships.`,
          distortedTextFa: `تاجران نمک که از آب‌های دوردست رسیده‌اند مدعی‌اند «${leg.nameFa}» در ${sNameFa} دچار حادثه‌ای ناگهانی شده، هرچند هیچ دو ملوانی بر سر شمار کشتی‌ها هم‌داستان نیستند.`,
        };
        const isSkaldDiv = checkBeatContradictsPlayerWorld(beat, state);
        newsLogs.push(buildLogFromNewsItem(rumorItem, leg, beat, state, isSkaldDiv, false));

        // Queue the true correction for next year
        nextQueue.push({
          beatId: beat.id,
          legendId: leg.id,
          triggerYear: state.year,
          deliveryYear: state.year + 1,
          deliverySeason: Season.Spring,
          delaySeasons: delaySeasons + 1,
          sourceType: 'SKALD_SONG',
          isCorrection: true,
        });
      } else if (deliveryYear <= state.year) {
        const item: PendingLegendNewsItem = {
          beatId: beat.id,
          legendId: leg.id,
          triggerYear: state.year,
          deliveryYear: state.year,
          deliverySeason,
          delaySeasons,
          sourceType,
        };
        const isSkaldDiv = checkBeatContradictsPlayerWorld(beat, state);
        if (isSkaldDiv) divergedSet.add(beat.id);
        const driftRng = new SeededRNG(seedHash ^ hashSeedString(beat.id));
        const useDrift = Boolean(
          beat.driftVariant && !beat.isCanonicalAnchor && driftRng.chance(beat.driftVariant.seedChance)
        );
        newsLogs.push(buildLogFromNewsItem(item, leg, beat, state, isSkaldDiv, useDrift));
        deliveredSet.add(beat.id);
        if (beat.setsFlags) {
          beat.setsFlags.forEach((f) => addedFlags.push(f));
        }
      } else {
        nextQueue.push({
          beatId: beat.id,
          legendId: leg.id,
          triggerYear: state.year,
          deliveryYear,
          deliverySeason,
          delaySeasons,
          sourceType,
        });
      }
    }
  }

  return {
    legendState: {
      ...legendState,
      deliveredBeatIds: Array.from(deliveredSet),
      rumorQueue: nextQueue,
      correctedBeatIds: Array.from(correctedSet),
      divergedBeatIds: Array.from(divergedSet),
    },
    newsLogs,
    addedFlags,
  };
}

/**
 * Player action in the Hall of Legends: Pay 12 Silver to a traveling skald or knarr-master
 * to immediately gather reliable word, flush pending distant news, and verify rumors.
 */
export function executePayForLegendNewsAction(state: FullGameState): FullGameState {
  if (state.realm.silver < PAY_LEGEND_INTEL_COST) return state;
  const rng = new SeededRNG(state.rngState);
  const legendState = ensureLegendState(state);
  const deliveredSet = new Set(legendState.deliveredBeatIds);
  const correctedSet = new Set(legendState.correctedBeatIds);
  const divergedSet = new Set(legendState.divergedBeatIds);
  const flags = new Set(state.flags);
  const newLogs: LogEntry[] = [];

  const seedHash = hashSeedString(state.seedString);

  // 1. Flush any pending items in rumorQueue immediately with reliable SKALD_SONG/EYEWITNESS source
  for (const item of legendState.rumorQueue) {
    const leg = LEGENDS_BY_ID[item.legendId];
    const beat = leg?.timeline.find((b) => b.id === item.beatId);
    if (leg && beat) {
      const upgraded: PendingLegendNewsItem = {
        ...item,
        deliveryYear: state.year,
        deliverySeason: state.season,
        sourceType: item.isCorrection ? 'SKALD_SONG' : 'EYEWITNESS',
        isDistortedRumor: false,
      };
      const isSkaldDiv = checkBeatContradictsPlayerWorld(beat, state);
      if (isSkaldDiv) divergedSet.add(beat.id);
      const driftRng = new SeededRNG(seedHash ^ hashSeedString(beat.id));
      const useDrift = Boolean(
        beat.driftVariant && !beat.isCanonicalAnchor && driftRng.chance(beat.driftVariant.seedChance)
      );
      newLogs.push(buildLogFromNewsItem(upgraded, leg, beat, state, isSkaldDiv, useDrift));
      deliveredSet.add(beat.id);
      if (item.isCorrection) correctedSet.add(beat.id);
      if (beat.setsFlags) beat.setsFlags.forEach((f) => flags.add(f));
    }
  }

  // 2. If queue was empty, find any beat up to state.year that hasn't been delivered yet, or generate a fresh harbor dispatch
  if (newLogs.length === 0) {
    for (const leg of LEGENDS_REGISTRY) {
      for (const beat of leg.timeline) {
        if (beat.year <= state.year && !deliveredSet.has(beat.id)) {
          const item: PendingLegendNewsItem = {
            beatId: beat.id,
            legendId: leg.id,
            triggerYear: beat.year,
            deliveryYear: state.year,
            deliverySeason: state.season,
            delaySeasons: 0,
            sourceType: 'SKALD_SONG',
          };
          const isSkaldDiv = checkBeatContradictsPlayerWorld(beat, state);
          newLogs.push(buildLogFromNewsItem(item, leg, beat, state, isSkaldDiv, false));
          deliveredSet.add(beat.id);
          if (beat.setsFlags) beat.setsFlags.forEach((f) => flags.add(f));
          break;
        }
      }
      if (newLogs.length > 0) break;
    }
  }

  const activeLegends = LEGENDS_REGISTRY.filter(
    (l) => state.year >= l.birthYear && state.year <= l.deathYear
  );
  const featured =
    activeLegends.find((l) => l.phase === 1) ?? activeLegends[0] ?? LEGENDS_REGISTRY[0];
  const featLoc = SETTLEMENTS_BY_ID[featured.homeSettlementId];
  const featLocFa = SETTLEMENTS_FA[featured.homeSettlementId]?.name ?? featLoc?.name ?? '';

  if (newLogs.length === 0) {
    newLogs.push({
      id: `log_leg_intel_${state.year}_${state.lifeLog.length}`,
      year: state.year,
      season: state.season,
      age: state.character.age,
      locationName: featLoc?.name ?? 'Northern Seas',
      category: 'Word from the Lands',
      iconType: 'ship',
      title: `Skald’s Harbor Dispatch · ${featured.name}`,
      titleFa: `گزارش اسکالدهای بندر درباره «${featured.nameFa}»`,
      text: `Over a horn of honey-mead paid in silver, a well-traveled skald confirmed that ${featured.name} (${featured.epithet}) holds court near ${featLoc?.name ?? 'the straits'} and that all current rumors in your ledger stand verified.`,
      textFa: `در ازای سکه نقره و جامی از مید، اسکالدی جهان‌دیده گزارش داد که «${featured.nameFa}» (${featured.epithetFa}) در حوالی ${featLocFa} مستقر است و تمامی اخبار تالار شما با روایت شاهدان عینی تطبیق داده شد.`,
      deltas: [`-${PAY_LEGEND_INTEL_COST} Silver`, 'EYEWITNESS', 'Rumors Verified'],
      deltasFa: [`-${PAY_LEGEND_INTEL_COST} نقره`, 'شاهد عینی', 'تأیید و راستی‌آزمایی اخبار'],
      provenance: featured.provenance,
      legendNews: {
        legendId: featured.id,
        beatId: `dispatch_${state.year}`,
        statusTag: featured.statusTag,
        sourceType: 'EYEWITNESS',
        delaySeasons: 0,
      },
    });
  }

  const latestLog = newLogs[newLogs.length - 1];

  return {
    ...state,
    rngState: rng.getState(),
    flags: Array.from(flags),
    realm: {
      ...state.realm,
      silver: Math.max(0, state.realm.silver - PAY_LEGEND_INTEL_COST),
    },
    legendState: {
      ...legendState,
      deliveredBeatIds: Array.from(deliveredSet),
      rumorQueue: [],
      correctedBeatIds: Array.from(correctedSet),
      divergedBeatIds: Array.from(divergedSet),
      lastPaidIntelYear: state.year,
    },
    lifeLog: [...state.lifeLog, ...newLogs],
    lastOutcomeBanner: {
      title: latestLog.title ?? 'Word from the Lands Gathered',
      titleFa: latestLog.titleFa ?? 'دریافت اخبار موثق از سرزمین‌ها',
      text: latestLog.text,
      textFa: latestLog.textFa,
      deltaSummary: [`-${PAY_LEGEND_INTEL_COST} Silver`, 'Reliable Word Gathered'],
      deltaSummaryFa: [`-${PAY_LEGEND_INTEL_COST} نقره`, 'دریافت گزارش موثق اسکالدها'],
    },
  };
}

export function applyLegendStandingDelta(
  legendState: LegendWorldState,
  deltaSpec: NonNullable<import('../types/game').EventEffects['legendStandingDelta']>,
  year: number
): {
  nextLegendState: LegendWorldState;
  summaryEn: string;
  summaryFa: string;
} {
  const standings = { ...legendState.standings };
  const existing = standings[deltaSpec.legendId] ?? createEmptyStandingRecord(deltaSpec.legendId);
  const nextStanding = Math.max(-100, Math.min(100, existing.standing + deltaSpec.delta));

  const oaths = [...existing.oaths];
  const feuds = [...existing.feuds];
  const gifts = [...existing.gifts];
  const metYears = existing.metYears.includes(year)
    ? [...existing.metYears]
    : [...existing.metYears, year];

  if (deltaSpec.addOath) {
    oaths.push({
      id: `oath_${deltaSpec.legendId}_${year}_${oaths.length}`,
      text: deltaSpec.addOath,
      textFa: deltaSpec.addOathFa ?? deltaSpec.addOath,
      year,
    });
  }
  if (deltaSpec.addFeud) {
    feuds.push({
      id: `feud_${deltaSpec.legendId}_${year}_${feuds.length}`,
      text: deltaSpec.addFeud,
      textFa: deltaSpec.addFeudFa ?? deltaSpec.addFeud,
      year,
    });
  }
  if (deltaSpec.addGift) {
    gifts.push({
      id: `gift_${deltaSpec.legendId}_${year}_${gifts.length}`,
      text: deltaSpec.addGift,
      textFa: deltaSpec.addGiftFa ?? deltaSpec.addGift,
      year,
    });
  }

  standings[deltaSpec.legendId] = {
    ...existing,
    standing: nextStanding,
    oaths,
    feuds,
    gifts,
    metYears,
  };

  const leg = LEGENDS_BY_ID[deltaSpec.legendId];
  const legNameEn = leg?.name ?? deltaSpec.legendId;
  const legNameFa = leg?.nameFa ?? legNameEn;
  const sign = deltaSpec.delta >= 0 ? `+${deltaSpec.delta}` : `${deltaSpec.delta}`;

  return {
    nextLegendState: {
      ...legendState,
      standings,
    },
    summaryEn: `${legNameEn} Standing ${sign}`,
    summaryFa: `جایگاه نزد ${legNameFa} (${sign})`,
  };
}

/**
 * Carries oaths, feuds, and 70% of legend standing forward to the player's heir on succession.
 */
export function inheritLegendStateForHeir(
  legendState: LegendWorldState | undefined,
  year: number,
  seedString: string
): LegendWorldState {
  if (!legendState) return createInitialLegendState(year, seedString);
  const nextStandings: Record<string, LegendStandingRecord> = {};
  for (const [legId, rec] of Object.entries(legendState.standings)) {
    nextStandings[legId] = {
      ...rec,
      standing: Math.round(rec.standing * 0.75),
      oaths: [...rec.oaths],
      feuds: [...rec.feuds],
      gifts: [...rec.gifts],
      metYears: [...rec.metYears],
    };
  }
  return {
    ...legendState,
    standings: nextStandings,
  };
}

export function getLegendOrdstirrScore(
  legend: LegendRegistryEntry,
  currentYear: number,
  deliveredBeatIds: string[]
): number {
  if (currentYear < legend.birthYear) return 0;
  const deliveredSet = new Set(deliveredBeatIds);
  let score = legend.baseOrdstirr;
  for (const beat of legend.timeline) {
    if (deliveredSet.has(beat.id) || beat.year < currentYear) {
      score += beat.ordstirrGain;
    }
  }
  return Math.min(120, score);
}

export function getLegendOrdstirrRank(score: number): LegendOrdstirrRank {
  if (score <= 15) return 'UNHEARD_OF';
  if (score <= 45) return 'HEARTH_KNOWN';
  if (score <= 72) return 'FJORD_FAMED';
  if (score <= 95) return 'SEA_KINGS_EQUAL';
  return 'IMMORTAL_IN_SONG';
}

export function getLegendOrdstirrLabel(
  legend: LegendRegistryEntry,
  currentYear: number,
  deliveredBeatIds: string[],
  lang: 'en' | 'fa'
): { rank: LegendOrdstirrRank; label: string; norse: string } {
  const score = getLegendOrdstirrScore(legend, currentYear, deliveredBeatIds);
  const rank = getLegendOrdstirrRank(score);
  const info = ORDSTIRR_RANK_LABELS[rank];
  return {
    rank,
    label: lang === 'fa' ? info.fa : info.en,
    norse: info.norse,
  };
}

export function getLegendKnownState(
  legend: LegendRegistryEntry,
  currentYear: number,
  deliveredBeatIds: string[]
): {
  lifeStatus: 'unborn' | 'youth' | 'active' | 'dead';
  knownBeats: LegendTimelineBeat[];
  latestBeat: LegendTimelineBeat | null;
  lastKnownSettlementId: string;
  unheardFutureBeatsCount: number;
} {
  const deliveredSet = new Set(deliveredBeatIds);
  const knownBeats = legend.timeline.filter(
    (b) => deliveredSet.has(b.id) || b.year < currentYear
  );
  const latestBeat = knownBeats.length > 0 ? knownBeats[knownBeats.length - 1] : null;
  const lastKnownSettlementId = latestBeat?.settlementId ?? legend.homeSettlementId;
  const unheardFutureBeatsCount = Math.max(0, legend.timeline.length - knownBeats.length);

  const deathBeat = legend.timeline.find((b) => b.isDeathBeat);
  const deathKnown = deathBeat
    ? deliveredSet.has(deathBeat.id) || currentYear > legend.deathYear
    : currentYear >= legend.deathYear;

  let lifeStatus: 'unborn' | 'youth' | 'active' | 'dead' = 'active';
  if (currentYear < legend.birthYear) {
    lifeStatus = 'unborn';
  } else if (deathKnown) {
    lifeStatus = 'dead';
  } else if (currentYear < legend.activeYears[0]) {
    lifeStatus = 'youth';
  }

  return {
    lifeStatus,
    knownBeats,
    latestBeat,
    lastKnownSettlementId,
    unheardFutureBeatsCount,
  };
}
