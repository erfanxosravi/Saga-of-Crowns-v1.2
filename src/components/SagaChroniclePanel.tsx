import { useState } from 'react';
import {
  Award,
  BookOpen,
  Check,
  Copy,
  Flame,
  GitBranch,
  History,
  Lock,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { BITLIFE_ACHIEVEMENTS } from '../data/deathsAndAchievements';
import { calculateLegacyScore } from '../engine/gameEngine';
import { formatDynastyName, formatPersonName } from '../i18n/gameDataFa';
import { SHORT_TITLE_LABELS } from '../i18n/ui';
import { FullGameState } from '../types/game';
import longhouseHearthUrl from '../assets/images/norse_longhouse_hearth_fire_1793047791880.jpg';
import { NorseCornerOrnament, RuneDivider } from './NorseMotifs';
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
}

export function SagaChroniclePanel({ state }: SagaChroniclePanelProps) {
  const lang = state.settings.language;
  const isFa = lang === 'fa';
  const [subTab, setSubTab] = useState<'badges' | 'milestones' | 'ancestors' | 'history'>('badges');
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'unlocked' | BadgeCategory>('all');
  const [inspectedBadgeId, setInspectedBadgeId] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState(false);
  const [copiedSeed, setCopiedSeed] = useState(false);

  const legacyScore = calculateLegacyScore(state);

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
      <div className="relative min-h-[144px] rounded-2xl overflow-hidden border border-[#24364D] bg-[#0F1722] flex flex-col justify-end p-4">
        {!imgFailed ? (
          <img
            src={longhouseHearthUrl}
            alt="Norse longhouse hearth"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#131D2B]">
            <Flame className="w-8 h-8 text-[#F59E0B]" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1118] via-[#0B1118]/70 to-transparent" />

        <div className="relative z-10 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-mono text-[#38BDF8] whitespace-normal break-words">
              {isFa
                ? `نسل ${state.generation} · کد دنیا ${state.seedString}`
                : `Gen ${state.generation} · Seed ${state.seedString}`}
            </div>
            <h2 className="font-saga text-2xl font-bold text-[#F1F5F9] whitespace-normal break-words leading-snug mt-0.5">
              {formatDynastyName(state.dynastyName, lang)}
            </h2>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="text-end">
              <div className="text-xs text-[#CBD5E1]">
                {isFa ? 'امتیاز میراث' : 'Legacy Score'}
              </div>
              <div className="text-lg font-mono font-bold tabular-nums text-[#FBBF24]">
                {legacyScore.toLocaleString()}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopySeed}
              title={isFa ? 'کپی کد دنیا' : 'Copy Seed'}
              aria-label={isFa ? 'کپی کد دنیا' : 'Copy Seed'}
              className="min-w-[44px] min-h-[44px] px-2.5 rounded-xl bg-[#131D2B]/90 border border-[#283B52] hover:border-[#38BDF8] text-[#F1F5F9] flex items-center justify-center cursor-pointer transition-colors"
            >
              {copiedSeed ? (
                <Check className="w-4 h-4 text-[#34D399]" />
              ) : (
                <Copy className="w-4 h-4 text-[#CBD5E1]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Visually Distinct Unlocked Badges & Historical Seals Showcase */}
      <div className="p-3.5 rounded-2xl bg-[#101926] border border-[#233246] space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#F59E0B] flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-[#F1F5F9]">
                {isFa ? 'ویترین نشان‌های خاندان و مهرهای تاریخی' : 'Unlocked Dynasty & Era Badges'}
              </div>
              <div className="text-[11px] text-[#94A3B8]">
                {isFa
                  ? `${unlockedCount} نشان افتخار دودمان · ${unlockedMilestonesCount} مهر عصر وایکینگ‌ها`
                  : `${unlockedCount} Dynasty Badges · ${unlockedMilestonesCount} Historical Era Seals`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums">
            <span className="px-2 py-0.5 rounded-lg bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-amber-500 font-bold">
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
          <div className="p-3 rounded-xl bg-[#131D2B] border border-[#2A3E59] flex items-start justify-between gap-3 text-xs">
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
                    <span className="font-bold text-sm text-[#F1F5F9]">
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
                  <p className="text-[#CBD5E1] leading-relaxed">
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
                    <span className="font-bold text-sm text-[#F1F5F9]">
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
                  <p className="text-[#CBD5E1] leading-relaxed">
                    {isFa ? inspectedMilestone.def.descFa : inspectedMilestone.def.descEn}
                  </p>
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setInspectedBadgeId(null)}
              className="px-2.5 py-1 rounded-lg bg-[#0B1118] hover:bg-[#19283B] border border-[#233246] text-[11px] text-[#94A3B8] hover:text-[#F1F5F9] shrink-0 cursor-pointer"
            >
              {isFa ? 'بستن' : 'Close'}
            </button>
          </div>
        )}
      </div>

      {/* 4 Sub-Tabs (Dynasty Badges, Historical Milestones, Lineage, Alt-History) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-[#0B1118] border border-[#1E2D40] rounded-2xl">
        <button
          type="button"
          onClick={() => setSubTab('badges')}
          className={`min-h-[44px] min-w-0 px-2 py-1.5 text-xs font-semibold rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
            subTab === 'badges'
              ? 'bg-[#F59E0B] text-[#0B1118]'
              : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
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
              ? 'bg-[#38BDF8] text-[#0B1118]'
              : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
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
              ? 'bg-[#38BDF8] text-[#0B1118]'
              : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
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
              ? 'bg-[#38BDF8] text-[#0B1118]'
              : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
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
                    ? 'bg-[#18293E] border-[#F59E0B]/70 text-[#FBBF24]'
                    : 'bg-[#131D2B] border-[#233246] text-[#94A3B8] hover:text-[#F1F5F9]'
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
                      ? `${pal.cardBg} text-[#F1F5F9]`
                      : 'bg-[#131D2B] border-[#233246] text-[#CBD5E1]'
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
                            ? 'bg-[#182638] border-[#38BDF8]/40 text-[#38BDF8]'
                            : 'bg-[#0B1118] border-[#233246] text-[#64748B]'
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
                        <div className="text-sm font-bold text-[#F1F5F9] whitespace-normal break-words leading-snug">
                          {isFa ? ach.nameFa : ach.nameEn}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold tabular-nums shrink-0 ${
                            earned
                              ? pal.tagPill
                              : 'bg-[#0B1118] border border-[#233246] text-[#94A3B8]'
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

                      <div className="text-xs text-[#94A3B8] whitespace-normal break-words leading-relaxed">
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
            <div className="p-5 rounded-2xl bg-[#131D2B] border border-[#233246] text-xs text-[#94A3B8] text-center leading-relaxed">
              {isFa
                ? `«${formatPersonName(state.character.givenName, 'fa')}» نسل اول خاندان شماست. پس از مرگ و ادامه بازی با وارث، کارنامه فرمانروایان پیشین در اینجا ثبت می‌شود.`
                : `${state.character.givenName} is Generation 1. Past rulers and their obituaries appear here when you continue as an heir.`}
            </div>
          ) : (
            state.ancestors.map((anc) => (
              <div
                key={anc.id}
                className="relative p-4 rounded-2xl bg-[#131D2B] border border-[#233246] space-y-2 overflow-hidden"
              >
                <NorseCornerOrnament accent="amber" />
                <div className="flex flex-wrap justify-between gap-2 text-xs text-[#38BDF8] font-mono tabular-nums">
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
                <div className="font-saga text-lg font-bold text-[#F1F5F9] whitespace-normal break-words leading-snug">
                  {formatPersonName(anc.fullName.replace(/"/g, ''), lang)}
                </div>
                <p className="text-xs sm:text-sm text-[#CBD5E1] whitespace-normal break-words leading-relaxed">
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
            <div className="p-5 rounded-2xl bg-[#131D2B] border border-[#233246] text-xs text-[#94A3B8] text-center leading-relaxed">
              {isFa
                ? 'مسیر تاریخ هنوز مطابق روایت‌های واقعی پیش می‌رود. با رقم‌زدن انتخاب‌های متفاوت در رویدادهای بزرگ تاریخی، تغییرات شما در اینجا ثبت می‌شود.'
                : 'History still flows on its recorded course. Alter major historical events to record divergences here.'}
            </div>
          ) : (
            divergencesList.map((d, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-[#131D2B] border border-purple-400/45 flex items-start gap-2.5 font-saga text-base text-[#F1F5F9] whitespace-normal break-words leading-relaxed"
              >
                <Sparkles className="w-4 h-4 text-purple-300 shrink-0 mt-1" />
                <span>{d}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
