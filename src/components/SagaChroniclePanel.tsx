import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import {
  Award,
  BookOpen,
  Check,
  Copy,
  Flame,
  GitBranch,
  History,
  Lock,
  ShieldAlert,
  Sparkles,
  Swords,
  Trophy,
} from 'lucide-react';
import { BITLIFE_ACHIEVEMENTS } from '../data/deathsAndAchievements';
import {
  LOTHBROK_BLOODLINE_BRANCHES,
  LOTHBROK_CHAPTER_METADATA,
  SAGA_HEIRLOOMS_MAP,
} from '../data/lothbrokCycle';
import { calculateLegacyScore } from '../engine/gameEngine';
import { formatDynastyName, formatPersonName } from '../i18n/gameDataFa';
import { SHORT_TITLE_LABELS } from '../i18n/ui';
import { FullGameState } from '../types/game';
import longhouseHearthUrl from '../assets/images/norse_longhouse_hearth_fire_1793047791880.jpg';
import { NorseBottomSheet, NorseCornerOrnament, RuneDivider } from './NorseMotifs';

const HallOfLegendsPanel = lazy(() =>
  import('./HallOfLegendsPanel').then((m) => ({ default: m.HallOfLegendsPanel }))
);
import {
  BADGE_CATEGORY_LABELS,
  BadgeCategory,
  evaluateHistoricalMilestones,
  getAchievementBadgeMeta,
  getBadgeCategoryPalette,
  HISTORICAL_MILESTONES,
  HistoricalMilestonesGrid,
  renderBadgeIcon,
} from './SagaBadgeSystem';

interface SagaChroniclePanelProps {
  state: FullGameState;
  initialSubTab?: 'badges' | 'milestones' | 'ancestors' | 'history';
  onOpenHallOfLegends?: () => void;
  onPayForLegendNews?: () => void;
}

export function SagaChroniclePanel({
  state,
  initialSubTab = 'badges',
  onOpenHallOfLegends,
  onPayForLegendNews,
}: SagaChroniclePanelProps) {
  const lang = state.settings.language;
  const isFa = lang === 'fa';
  const [subTab, setSubTab] = useState<'badges' | 'milestones' | 'ancestors' | 'history'>(
    initialSubTab
  );
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'unlocked' | BadgeCategory>('all');
  const [inspectedBadgeId, setInspectedBadgeId] = useState<string | null>(null);
  const [showLothbrokChapters, setShowLothbrokChapters] = useState(false);
  const [showHallModal, setShowHallModal] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [copiedSeed, setCopiedSeed] = useState(false);

  const legacyScore = calculateLegacyScore(state);
  const hefnd = state.hefndMeter ?? 0;
  const clampedHefnd = Math.min(100, Math.max(0, Math.round(hefnd)));
  const prevHefndRef = useRef<number>(clampedHefnd);
  const [hefndDelta, setHefndDelta] = useState<number>(0);

  useEffect(() => {
    const diff = clampedHefnd - prevHefndRef.current;
    prevHefndRef.current = clampedHefnd;
    if (diff !== 0) {
      setHefndDelta(diff);
      const timer = window.setTimeout(() => setHefndDelta(0), 950);
      return () => window.clearTimeout(timer);
    }
  }, [clampedHefnd]);

  const completedSet = new Set(state.lothbrokChaptersCompleted ?? []);
  const completedChaptersCount = LOTHBROK_CHAPTER_METADATA.filter(
    (ch) => completedSet.has(ch.id) || completedSet.has(ch.eventId)
  ).length;
  const branchInfo = state.bloodlineBranch
    ? LOTHBROK_BLOODLINE_BRANCHES.find((b) => b.id === state.bloodlineBranch)
    : undefined;

  const handleCopySeed = () => {
    navigator.clipboard?.writeText(state.seedString).catch(() => {});
    setCopiedSeed(true);
    setTimeout(() => setCopiedSeed(false), 1800);
  };

  const divergencesList = isFa
    ? state.divergencesFa && state.divergencesFa.length > 0
      ? state.divergencesFa
      : state.divergences
    : state.divergences;

  const evaluatedAchievements = BITLIFE_ACHIEVEMENTS.map((ach) => {
    const prog = ach.getProgress(state);
    const earned = state.achievements.includes(ach.id) || prog.current >= prog.target;
    const pct = Math.min(100, Math.round((prog.current / Math.max(1, prog.target)) * 100));
    const meta = getAchievementBadgeMeta(ach.id);
    return { ach, prog, earned, pct, meta };
  });

  const unlockedAchievements = evaluatedAchievements.filter((a) => a.earned);
  const unlockedCount = unlockedAchievements.length;

  const evaluatedMilestones = evaluateHistoricalMilestones(state);
  const unlockedMilestones = evaluatedMilestones.filter((m) => m.unlocked);
  const unlockedMilestonesCount = unlockedMilestones.length;

  const filteredAchievements = evaluatedAchievements.filter((item) => {
    if (badgeFilter === 'all') return true;
    if (badgeFilter === 'unlocked') return item.earned;
    return item.meta.category === badgeFilter;
  });

  const inspectedAchievement =
    evaluatedAchievements.find((a) => `ach:${a.ach.id}` === inspectedBadgeId) ?? null;
  const inspectedMilestone =
    evaluatedMilestones.find((m) => `ms:${m.def.id}` === inspectedBadgeId) ?? null;

  return (
    <div className="flex flex-col overflow-hidden space-y-4 text-start">
      {/* Nordic Dynasty Banner (wrapped titles, min 12px) */}
      <div className="relative min-h-[144px] rounded-2xl overflow-hidden border border-border-subtle bg-surface-elevated flex flex-col justify-end p-4">
        {!imgFailed ? (
          <img
            src={longhouseHearthUrl}
            alt="Norse longhouse hearth"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-secondary">
            <Flame className="w-8 h-8 text-accent-amber" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-canvas via-surface-canvas/70 to-transparent" />

        <div className="relative z-10 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-mono text-accent-ice whitespace-normal break-words">
              {isFa
                ? `نسل ${state.generation} · کد دنیا ${state.seedString}`
                : `Gen ${state.generation} · Seed ${state.seedString}`}
            </div>
            <h2 className="font-saga text-2xl font-bold text-ink-primary whitespace-normal break-words leading-snug mt-0.5">
              {formatDynastyName(state.dynastyName, lang)}
            </h2>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="text-end">
              <div className="text-xs text-ink-secondary">
                {isFa ? 'امتیاز میراث' : 'Legacy Score'}
              </div>
              <div className="text-lg font-mono font-bold tabular-nums text-accent-amber">
                {legacyScore.toLocaleString()}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopySeed}
              title={isFa ? 'کپی کد دنیا' : 'Copy Seed'}
              aria-label={isFa ? 'کپی کد دنیا' : 'Copy Seed'}
              className="min-w-[44px] min-h-[44px] px-2.5 rounded-xl bg-surface-secondary/90 border border-border-subtle hover:border-status-ice text-ink-primary flex items-center justify-center cursor-pointer transition-colors"
            >
              {copiedSeed ? (
                <Check className="w-4 h-4 text-accent-emerald" />
              ) : (
                <Copy className="w-4 h-4 text-ink-secondary" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* The Lothbrok Cycle & Debt of Vengeance (Hefnd) Panel */}
      <div className="p-3.5 rounded-2xl bg-surface-violet-tint border border-gold-500/40 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-surface-crimson-tint border border-gold-500/50 text-accent-amber flex items-center justify-center shrink-0">
              <Swords className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-ink-primary">
                  {isFa
                    ? 'چرخه راگنار لُدبروک و سوگند انتقام (Hefnd)'
                    : 'The Lothbrok Cycle & Debt of Vengeance (Hefnd)'}
                </span>
                {state.ragnarBloodline && (
                  <span className="px-2 py-0.5 rounded-md bg-gold-500/20 border border-gold-500/50 text-[10px] font-bold text-accent-amber-strong">
                    {isFa ? 'میراث اسطوره‌ای راگنار' : 'LEGENDARY CLAIM: RAGNARSÆTTIN'}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-ink-secondary">
                {branchInfo
                  ? isFa
                    ? `${branchInfo.nameFa} · ${completedChaptersCount}/9 فصل تکمیل‌شده`
                    : `${branchInfo.nameEn} · ${completedChaptersCount}/9 Chapters Completed`
                  : isFa
                    ? `${completedChaptersCount}/9 فصل حماسه‌ی راگنار و ارتش بزرگ در انگلستان`
                    : `${completedChaptersCount}/9 Chapters of Ragnar & the Great Heathen Army`}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (onOpenHallOfLegends) {
                  onOpenHallOfLegends();
                } else {
                  setShowHallModal(true);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-cta-copper hover:bg-cta-copper-hover text-xs font-bold text-cta-ink-light cursor-pointer transition-colors"
            >
              {isFa ? 'تالار افسانه‌ها (راگنار و حلقه او)' : 'Open Hall of Legends'}
            </button>
            <button
              type="button"
              onClick={() => setShowLothbrokChapters((v) => !v)}
              className="px-3 py-1.5 rounded-xl bg-surface-violet-tint hover:bg-surface-violet-tint border border-gold-500/45 text-xs font-bold text-accent-amber-strong cursor-pointer transition-colors"
            >
              {showLothbrokChapters
                ? isFa
                  ? 'بستن فصل‌ها'
                  : 'Hide Chapters'
                : isFa
                  ? 'مشاهده ۹ فصل حماسه'
                  : 'View 9 Chapters'}
            </button>
          </div>
        </div>

        {showHallModal && (
          <NorseBottomSheet
            isOpen={true}
            onClose={() => setShowHallModal(false)}
            maxWidthClass="max-w-3xl"
            accent="amber"
            closeLabel={isFa ? 'بستن' : 'Close'}
            title={isFa ? 'تالار افسانه‌ها — خبر از سرزمین‌ها' : 'The Hall of Legends — Word from the Lands'}
          >
            <Suspense
              fallback={
                <div className="p-6 text-center text-xs text-ink-muted">
                  {isFa ? 'در حال بارگذاری تالار افسانه‌ها...' : 'Loading Hall of Legends...'}
                </div>
              }
            >
              <HallOfLegendsPanel state={state} onPayForLegendNews={onPayForLegendNews} />
            </Suspense>
          </NorseBottomSheet>
        )}

        {/* Hefnd (Vengeance) Meter — 0–100 Gauge in Dark Nordic Container (#0F1722) with Blood-Red Gradient (#991b1b to #dc2626) */}
        <div
          className={`p-3.5 rounded-xl bg-surface-elevated border transition-[border-color,box-shadow] duration-500 space-y-2.5 ${
            hefndDelta > 0
              ? 'border-blood-600 shadow-[0_0_20px_rgba(220,38,38,0.45),inset_0_0_12px_rgba(153,27,27,0.35)]'
              : hefndDelta < 0
                ? 'border-status-emerald/70 shadow-[0_0_16px_rgba(16,185,129,0.25),inset_0_0_10px_rgba(15,23,34,0.8)]'
                : 'border-border-crimson-subtle shadow-inner'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <ShieldAlert
                className={`w-4 h-4 text-accent-crimson shrink-0 transition-transform duration-500 ${
                  hefndDelta > 0 ? 'scale-125 drop-shadow-[0_0_8px_rgba(220,38,38,0.9)]' : ''
                }`}
              />
              <span className="font-bold text-ink-primary">
                {isFa
                  ? 'هفند — کین‌خواهی و انتقام خون (Hefnd · Vengeance)'
                  : 'Hefnd (Vengeance) · هفند (انتقام خون)'}
              </span>
              <span className="text-[10px] font-mono tracking-widest text-accent-crimson px-1.5 py-0.5 rounded bg-surface-crimson-tint border border-border-crimson-subtle">
                ᚺᛖᚠᚾᛞ
              </span>
            </div>

            <div className="flex items-center gap-2">
              {hefndDelta !== 0 && (
                <span
                  dir="ltr"
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-extrabold animate-pulse ${
                    hefndDelta > 0
                      ? 'bg-surface-crimson-tint text-accent-crimson border border-border-crimson-subtle'
                      : 'bg-surface-emerald-tint text-accent-emerald border border-status-emerald/50'
                  }`}
                >
                  {hefndDelta > 0 ? `+${hefndDelta}` : hefndDelta}
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors duration-500 ${
                  clampedHefnd >= 68
                    ? 'bg-surface-crimson-tint border-border-crimson-subtle text-accent-crimson'
                    : clampedHefnd > 20
                      ? 'bg-surface-crimson-tint border-border-crimson-subtle text-accent-crimson'
                      : 'bg-surface-emerald-tint border-status-emerald/40 text-accent-emerald'
                }`}
              >
                {clampedHefnd >= 68
                  ? isFa
                    ? 'خون ناآرام — کاهش سالانه شرافت'
                    : 'Unavenged Blood Bleeds Honor'
                  : clampedHefnd <= 20
                    ? isFa
                      ? 'سوگند انتقام آرام گرفته'
                      : 'Vengeance Satisfied'
                    : isFa
                      ? 'سوگند خون در جریان'
                      : 'Oath of Blood Active'}
              </span>
              <span
                dir="ltr"
                className={`font-mono text-xs font-extrabold text-white bg-gradient-to-r from-blood-600 to-blood-600 px-2.5 py-0.5 rounded-md border border-blood-500/40 shadow-sm transition-transform duration-500 ${
                  hefndDelta > 0 ? 'scale-105 ring-2 ring-blood-600/60' : ''
                }`}
              >
                {clampedHefnd} / 100
              </span>
            </div>
          </div>

          {/* 0–100 Gauge with Blood-Red Gradient (#991b1b to #dc2626) & Visceral Width Transition */}
          <div
            dir="ltr"
            role="meter"
            aria-label="Hefnd (Vengeance) — هفند (انتقام خون)"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={clampedHefnd}
            className="relative w-full h-3.5 rounded-full bg-surface-canvas border border-border-crimson-subtle overflow-hidden shadow-inner"
          >
            {/* Threshold markers at 20 and 68 */}
            <div
              style={{ left: '20%' }}
              className="absolute inset-y-0 w-px bg-gold-400/40 z-10"
              title={isFa ? 'مرز آرامش انتقام (۲۰)' : 'Satisfied Threshold (20)'}
            />
            <div
              style={{ left: '68%' }}
              className="absolute inset-y-0 w-px bg-blood-500/70 z-10"
              title={isFa ? 'مرز نفرین خون بی‌انتقام (۶۸)' : 'Unavenged Penalty Threshold (68)'}
            />

            {/* Blood-Red Gradient Fill (#991b1b -> #dc2626) with Smooth Visceral Width Transition */}
            <div
              style={{
                width: `${clampedHefnd}%`,
                transition:
                  'width 750ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 500ms ease-out, filter 500ms ease-out',
              }}
              className={`h-full rounded-full bg-gradient-to-r from-blood-600 via-blood-600 to-blood-600 transition-[width,box-shadow,filter] duration-700 ease-out will-change-[width] relative ${
                hefndDelta > 0
                  ? 'shadow-[0_0_20px_rgba(220,38,38,0.95)] brightness-125'
                  : clampedHefnd >= 68
                    ? 'shadow-[0_0_16px_rgba(220,38,38,0.85)]'
                    : 'shadow-[0_0_12px_rgba(220,38,38,0.65)]'
              }`}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-white/10 via-blood-500/25 to-white/35" />
              {clampedHefnd > 0 && (
                <div className="absolute right-0 inset-y-0 w-2 rounded-full bg-blood-500/80 blur-[1px] shadow-[0_0_10px_#dc2626]" />
              )}
            </div>
          </div>

          {/* Gauge Scale (0–100) & Mechanical Legend */}
          <div className="flex items-center justify-between gap-2 text-[10px] text-ink-muted">
            <span className="font-mono font-bold text-accent-crimson">0</span>
            <span className="text-center text-ink-secondary">
              {isFa
                ? 'یورش به انگلستان بدهی خون را فرو می‌نشاند (Hefnd ↓) و بی‌تفاوتی یا مرگ خویشاوندان آن را شعله‌ور می‌کند (Hefnd ↑)'
                : 'Raiding England quenches Hefnd (↓); slain kin or neglected oaths fan the blood-debt (↑)'}
            </span>
            <span className="font-mono font-bold text-accent-crimson">100</span>
          </div>
        </div>

        {/* Owned Saga Heirlooms */}
        {(state.heirlooms ?? []).length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {(state.heirlooms ?? []).map((hid) => {
              const h = SAGA_HEIRLOOMS_MAP[hid];
              if (!h) return null;
              return (
                <div
                  key={hid}
                  title={isFa ? `${h.loreFa} (${h.effectsLabelFa})` : `${h.loreEn} (${h.effectsLabelEn})`}
                  className="px-2.5 py-1 rounded-xl bg-surface-crimson-tint border border-gold-500/45 text-xs text-accent-amber-strong flex items-center gap-1.5"
                >
                  <span className="font-serif text-accent-amber">{h.rune}</span>
                  <span className="font-bold">{isFa ? h.nameFa : h.nameEn}</span>
                  <span className="text-[10px] text-ink-secondary">
                    ({isFa ? h.effectsLabelFa : h.effectsLabelEn})
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* 9 Chapters Accordion */}
        {showLothbrokChapters && (
          <div className="grid grid-cols-1 gap-2 pt-1">
            {LOTHBROK_CHAPTER_METADATA.map((ch) => {
              const isDone = completedSet.has(ch.id) || completedSet.has(ch.eventId);
              return (
                <div
                  key={ch.id}
                  className={`p-3 rounded-xl border space-y-1.5 ${
                    isDone
                      ? 'bg-surface-amber-tint border-gold-500/60 text-ink-primary'
                      : 'bg-surface-card border-border-subtle text-ink-muted'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-xs sm:text-sm text-ink-primary">
                      {isFa
                        ? `فصل ${ch.roman}: ${ch.titleFa}`
                        : `Chapter ${ch.roman}: ${ch.titleEn}`}{' '}
                      <span className="text-[11px] font-mono text-accent-ice">({ch.yearHint})</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isDone
                          ? 'bg-surface-emerald-tint text-accent-emerald border border-status-emerald/40'
                          : 'bg-surface-secondary text-ink-muted'
                      }`}
                    >
                      {isDone ? (isFa ? 'روایت‌شده ✓' : 'Chronicled ✓') : isFa ? 'در انتظار' : 'Awaiting'}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-ink-secondary">
                    {isFa ? ch.summaryFa : ch.summaryEn}
                  </p>
                  <div className="p-2 rounded-lg bg-surface-canvas border border-border-subtle text-[11px] text-accent-amber-strong leading-relaxed">
                    {isFa ? ch.sagaVsChronicleFa : ch.sagaVsChronicleEn}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Visually Distinct Unlocked Badges & Historical Seals Showcase */}
      <div className="p-3.5 rounded-2xl bg-surface-card border border-border-subtle space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gold-500/15 border border-gold-500/40 text-accent-amber flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-ink-primary">
                {isFa ? 'ویترین نشان‌های خاندان و مهرهای تاریخی' : 'Unlocked Dynasty & Era Badges'}
              </div>
              <div className="text-[11px] text-ink-muted">
                {isFa
                  ? `${unlockedCount} نشان افتخار دودمان · ${unlockedMilestonesCount} مهر عصر وایکینگ‌ها`
                  : `${unlockedCount} Dynasty Badges · ${unlockedMilestonesCount} Historical Era Seals`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums">
            <span className="px-2 py-0.5 rounded-lg bg-gold-500/15 border border-gold-500/40 text-accent-amber font-bold">
              {Math.round(
                ((unlockedCount + unlockedMilestonesCount) /
                  (BITLIFE_ACHIEVEMENTS.length + HISTORICAL_MILESTONES.length)) *
                  100
              )}
              %
            </span>
          </div>
        </div>

        {/* Medallion Rack */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {unlockedAchievements.map(({ ach, meta }) => {
            const key = `ach:${ach.id}`;
            const isSelected = inspectedBadgeId === key;
            const pal = getBadgeCategoryPalette(meta.category);
            return (
              <button
                key={key}
                type="button"
                onClick={() => setInspectedBadgeId(isSelected ? null : key)}
                title={isFa ? ach.nameFa : ach.nameEn}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  isSelected ? pal.pillSelectedBg : pal.pillBg
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${pal.iconBox}`}
                >
                  {renderBadgeIcon(meta.iconKey, 'w-3.5 h-3.5')}
                </span>
                <span className="whitespace-nowrap">{isFa ? ach.nameFa : ach.nameEn}</span>
              </button>
            );
          })}

          {unlockedMilestones.map(({ def, alteredHistory }) => {
            const key = `ms:${def.id}`;
            const isSelected = inspectedBadgeId === key;
            const pal = getBadgeCategoryPalette(alteredHistory ? 'alt_history' : 'milestone');
            return (
              <button
                key={key}
                type="button"
                onClick={() => setInspectedBadgeId(isSelected ? null : key)}
                title={isFa ? def.titleFa : def.titleEn}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  isSelected ? pal.pillSelectedBg : pal.pillBg
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${pal.iconBox}`}
                >
                  {renderBadgeIcon(def.iconKey, 'w-3.5 h-3.5')}
                </span>
                <span className="whitespace-nowrap">{isFa ? def.shortFa : def.shortEn}</span>
              </button>
            );
          })}
        </div>

        {/* Inspected Badge Detail Banner */}
        {(inspectedAchievement || inspectedMilestone) && (
          <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle flex items-start justify-between gap-3 text-xs">
            {inspectedAchievement ? (
              <div className="flex items-start gap-2.5 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl border flex flex-col items-center justify-center shrink-0 ${
                    getBadgeCategoryPalette(inspectedAchievement.meta.category).iconBox
                  }`}
                >
                  {renderBadgeIcon(inspectedAchievement.meta.iconKey, 'w-4 h-4')}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-bold text-sm text-ink-primary">
                      {isFa ? inspectedAchievement.ach.nameFa : inspectedAchievement.ach.nameEn}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        getBadgeCategoryPalette(inspectedAchievement.meta.category).tagPill
                      }`}
                    >
                      {BADGE_CATEGORY_LABELS[lang][inspectedAchievement.meta.category]}
                    </span>
                  </div>
                  <p className="text-ink-secondary leading-relaxed">
                    {isFa ? inspectedAchievement.ach.descFa : inspectedAchievement.ach.descEn}
                  </p>
                </div>
              </div>
            ) : inspectedMilestone ? (
              <div className="flex items-start gap-2.5 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl border flex flex-col items-center justify-center shrink-0 ${
                    getBadgeCategoryPalette(
                      inspectedMilestone.alteredHistory ? 'alt_history' : 'milestone'
                    ).iconBox
                  }`}
                >
                  {renderBadgeIcon(inspectedMilestone.def.iconKey, 'w-4 h-4')}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-bold text-sm text-ink-primary">
                      {isFa ? inspectedMilestone.def.titleFa : inspectedMilestone.def.titleEn}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        getBadgeCategoryPalette(
                          inspectedMilestone.alteredHistory ? 'alt_history' : 'milestone'
                        ).tagPill
                      }`}
                    >
                      {isFa ? inspectedMilestone.def.eraLabelFa : inspectedMilestone.def.eraLabelEn}
                    </span>
                  </div>
                  <p className="text-ink-secondary leading-relaxed">
                    {isFa ? inspectedMilestone.def.descFa : inspectedMilestone.def.descEn}
                  </p>
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setInspectedBadgeId(null)}
              className="px-2.5 py-1 rounded-lg bg-surface-canvas hover:bg-surface-interactive border border-border-subtle text-[11px] text-ink-muted hover:text-ink-primary shrink-0 cursor-pointer"
            >
              {isFa ? 'بستن' : 'Close'}
            </button>
          </div>
        )}
      </div>

      {/* 4 Sub-Tabs (Dynasty Badges, Historical Milestones, Lineage, Alt-History) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-surface-canvas border border-border-subtle rounded-2xl">
        <button
          type="button"
          onClick={() => setSubTab('badges')}
          className={`min-h-[44px] min-w-0 px-2 py-1.5 text-xs font-semibold rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
            subTab === 'badges'
              ? 'bg-gold-500 text-nordic-950'
              : 'text-ink-secondary hover:text-ink-primary'
          }`}
        >
          <Award className="w-4 h-4 shrink-0" />
          <span className="whitespace-normal leading-tight text-center">
            {isFa
              ? `نشان‌های خاندان (${unlockedCount}/${BITLIFE_ACHIEVEMENTS.length})`
              : `Dynasty (${unlockedCount}/${BITLIFE_ACHIEVEMENTS.length})`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('milestones')}
          className={`min-h-[44px] min-w-0 px-2 py-1.5 text-xs font-semibold rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
            subTab === 'milestones'
              ? 'bg-status-ice text-nordic-950'
              : 'text-ink-secondary hover:text-ink-primary'
          }`}
        >
          <History className="w-4 h-4 shrink-0" />
          <span className="whitespace-normal leading-tight text-center">
            {isFa
              ? `عطف‌های تاریخ (${unlockedMilestonesCount}/${HISTORICAL_MILESTONES.length})`
              : `Eras (${unlockedMilestonesCount}/${HISTORICAL_MILESTONES.length})`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('ancestors')}
          className={`min-h-[44px] min-w-0 px-2 py-1.5 text-xs font-semibold rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
            subTab === 'ancestors'
              ? 'bg-status-ice text-nordic-950'
              : 'text-ink-secondary hover:text-ink-primary'
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          <span className="whitespace-normal leading-tight text-center">
            {isFa ? `نیاکان (${state.ancestors.length})` : `Lineage (${state.ancestors.length})`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('history')}
          className={`min-h-[44px] min-w-0 px-2 py-1.5 text-xs font-semibold rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
            subTab === 'history'
              ? 'bg-status-ice text-nordic-950'
              : 'text-ink-secondary hover:text-ink-primary'
          }`}
        >
          <GitBranch className="w-4 h-4 shrink-0" />
          <span className="whitespace-normal leading-tight text-center">
            {isFa
              ? `تاریخ بدیل (${divergencesList.length})`
              : `Alt-History (${divergencesList.length})`}
          </span>
        </button>
      </div>

      <RuneDivider accent="amber" />

      {subTab === 'badges' && (
        <div className="space-y-3">
          {/* Category Filter Strip */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all', labelEn: 'All Badges', labelFa: 'همه نشان‌ها' },
                { id: 'unlocked', labelEn: 'Unlocked', labelFa: 'کسب‌شده' },
                { id: 'warfare', labelEn: 'War & Conquest', labelFa: 'نبرد و فتح' },
                { id: 'seafaring', labelEn: 'Sea & Discovery', labelFa: 'دریا و اکتشاف' },
                { id: 'dynasty', labelEn: 'Bloodline & Kin', labelFa: 'دودمان و خاندان' },
                { id: 'crown', labelEn: 'Crown & Wealth', labelFa: 'تاج و ثروت' },
                { id: 'saga', labelEn: 'Saga & Legend', labelFa: 'حماسه و افسانه' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setBadgeFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  badgeFilter === f.id
                    ? 'bg-surface-ice-tint border-gold-500/70 text-accent-amber'
                    : 'bg-surface-secondary border-border-subtle text-ink-muted hover:text-ink-primary'
                }`}
              >
                {isFa ? f.labelFa : f.labelEn}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredAchievements.map(({ ach, prog, earned, pct, meta }) => {
              const pal = getBadgeCategoryPalette(meta.category);
              return (
                <div
                  key={ach.id}
                  className={`relative p-4 rounded-2xl border space-y-3 transition-colors overflow-hidden ${
                    earned
                      ? `${pal.cardBg} text-ink-primary`
                      : 'bg-surface-secondary border-border-subtle text-ink-secondary'
                  }`}
                >
                  {earned && <NorseCornerOrnament accent="amber" />}

                  <div className="flex items-start gap-3">
                    {/* Visually Distinct Badge Medallion */}
                    <div
                      className={`w-12 h-12 rounded-2xl border flex flex-col items-center justify-center shrink-0 relative ${
                        earned
                          ? pal.iconBox
                          : pct > 0
                            ? 'bg-surface-interactive border-status-ice/40 text-accent-ice'
                            : 'bg-surface-canvas border-border-subtle text-ink-muted'
                      }`}
                    >
                      {earned ? (
                        renderBadgeIcon(meta.iconKey, 'w-5 h-5')
                      ) : pct > 0 ? (
                        renderBadgeIcon(meta.iconKey, 'w-5 h-5 opacity-80')
                      ) : (
                        <Lock className="w-4 h-4 opacity-70" />
                      )}
                      <span className="text-[10px] font-serif leading-none mt-0.5 opacity-80">
                        {meta.rune}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-bold text-ink-primary whitespace-normal break-words leading-snug">
                          {isFa ? ach.nameFa : ach.nameEn}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold tabular-nums shrink-0 ${
                            earned
                              ? pal.tagPill
                              : 'bg-surface-canvas border border-border-subtle text-ink-muted'
                          }`}
                        >
                          {earned
                            ? isFa
                              ? 'کسب‌شده ✓'
                              : 'Unlocked ✓'
                            : `${prog.current}/${prog.target}`}
                        </span>
                      </div>

                      <div className={`text-[11px] font-semibold ${pal.accentText}`}>
                        {BADGE_CATEGORY_LABELS[lang][meta.category]}
                      </div>

                      <div className="text-xs text-ink-muted whitespace-normal break-words leading-relaxed">
                        {isFa ? ach.descFa : ach.descEn}
                      </div>
                    </div>
                  </div>

                  <svg
                    viewBox="0 0 100 6"
                    preserveAspectRatio="none"
                    className="h-2 w-full rounded-xs overflow-hidden block"
                    aria-hidden="true"
                  >
                    <rect x="0" y="0" width="100" height="6" className="fill-[#090E15]" />
                    <rect
                      x={isFa ? 100 - pct : 0}
                      y="0"
                      width={pct}
                      height="6"
                      className={`transition-all duration-300 ${
                        earned ? 'fill-[#F59E0B]' : 'fill-[#38BDF8]/65'
                      }`}
                    />
                  </svg>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {subTab === 'milestones' && <HistoricalMilestonesGrid state={state} />}

      {subTab === 'ancestors' && (
        <div className="space-y-3">
          {state.ancestors.length === 0 ? (
            <div className="p-5 rounded-2xl bg-surface-secondary border border-border-subtle text-xs text-ink-muted text-center leading-relaxed">
              {isFa
                ? `«${formatPersonName(state.character.givenName, 'fa')}» نسل اول خاندان شماست. پس از مرگ و ادامه بازی با وارث، کارنامه فرمانروایان پیشین در اینجا ثبت می‌شود.`
                : `${state.character.givenName} is Generation 1. Past rulers and their obituaries appear here when you continue as an heir.`}
            </div>
          ) : (
            state.ancestors.map((anc) => (
              <div
                key={anc.id}
                className="relative p-4 rounded-2xl bg-surface-secondary border border-border-subtle space-y-2 overflow-hidden"
              >
                <NorseCornerOrnament accent="amber" />
                <div className="flex flex-wrap justify-between gap-2 text-xs text-accent-ice font-mono tabular-nums">
                  <span>
                    {isFa
                      ? `نسل ${anc.generation} · ${SHORT_TITLE_LABELS.fa[anc.title]}`
                      : `Gen ${anc.generation} · ${SHORT_TITLE_LABELS.en[anc.title]}`}
                  </span>
                  <span>
                    {isFa
                      ? `${anc.birthYear}–${anc.deathYear} م (${anc.ageAtDeath} سال)`
                      : `${anc.birthYear}–${anc.deathYear} AD (Age ${anc.ageAtDeath})`}
                  </span>
                </div>
                <div className="font-saga text-lg font-bold text-ink-primary whitespace-normal break-words leading-snug">
                  {formatPersonName(anc.fullName.replace(/"/g, ''), lang)}
                </div>
                <p className="text-xs sm:text-sm text-ink-secondary whitespace-normal break-words leading-relaxed">
                  {isFa ? anc.obituaryProseFa ?? anc.obituaryProse : anc.obituaryProse}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {subTab === 'history' && (
        <div className="space-y-2.5">
          {divergencesList.length === 0 ? (
            <div className="p-5 rounded-2xl bg-surface-secondary border border-border-subtle text-xs text-ink-muted text-center leading-relaxed">
              {isFa
                ? 'مسیر تاریخ هنوز مطابق روایت‌های واقعی پیش می‌رود. با رقم‌زدن انتخاب‌های متفاوت در رویدادهای بزرگ تاریخی، تغییرات شما در اینجا ثبت می‌شود.'
                : 'History still flows on its recorded course. Alter major historical events to record divergences here.'}
            </div>
          ) : (
            divergencesList.map((d, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-surface-secondary border border-status-violet/45 flex items-start gap-2.5 font-saga text-base text-ink-primary whitespace-normal break-words leading-relaxed"
              >
                <Sparkles className="w-4 h-4 text-accent-violet shrink-0 mt-1" />
                <span>{d}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
