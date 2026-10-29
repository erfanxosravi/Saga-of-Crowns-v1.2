import { ReactNode, useState } from 'react';
import {
  Award,
  Castle,
  Check,
  Crown,
  GitBranch,
  Ship,
  Trophy,
} from 'lucide-react';
import { BITLIFE_ACHIEVEMENTS } from '../data/deathsAndAchievements';
import { WIN_GOALS } from '../data/namesAndTraits';
import {
  calculateLegacyScore,
  getClaimableNextTitle,
  getNextTitleRequirementText,
} from '../engine/gameEngine';
import { WIN_GOALS_FA } from '../i18n/gameDataFa';
import { SHORT_TITLE_LABELS, TITLE_LABELS } from '../i18n/ui';
import {
  BattleTactic,
  BuildingType,
  FullGameState,
  PlotType,
  TabId,
  TributeBurden,
} from '../types/game';
import {
  NorseAccent,
  NorseBottomSheet,
  NorseCornerOrnament,
  RuneDivider,
} from './NorseMotifs';
import { RealmPanel } from './RealmPanel';
import { SagaChroniclePanel } from './SagaChroniclePanel';

export type RealmSection = 'holdings' | 'fleet' | 'intrigue';
type MoreSheetId = 'holdings' | 'fleet' | 'intrigue' | 'rank_goal' | 'badges' | 'lineage';

interface MoreMenuPanelProps {
  state: FullGameState;
  onNavigateTab: (tab: TabId, realmSection?: RealmSection) => void;
  onClaimRank?: () => void;
  onBuildShipOrHird?: (action: 'recruit_hird' | 'build_longship' | 'build_knarr') => void;
  onBuildHoldingStructure?: (settlementId: string, building: BuildingType) => void;
  onClearFirstFarm?: () => void;
  onConquerCity?: (settlementId: string) => void;
  onSendSettlers?: (settlementId: string) => void;
  onStationGarrison?: (settlementId: string, delta: number) => void;
  onSetTributeBurden?: (settlementId: string, burden: TributeBurden) => void;
  onAppointJarl?: (settlementId: string) => void;
  onTakeHostages?: (settlementId: string) => void;
  onToggleTolerance?: (settlementId: string) => void;
  onExecutePlot?: (plotType: PlotType, targetSettlementId?: string) => void;
  onClaimSpecialTitle?: (titleId: string) => void;
  onResolveBattleTactic?: (tactic: BattleTactic) => void;
  onCancelBattle?: () => void;
}

interface MoreCardItem {
  id: MoreSheetId;
  categoryLabel: string;
  title: string;
  description: string;
  costRiskBadge: string;
  costRiskTone: 'crimson' | 'amber' | 'ice' | 'emerald' | 'violet';
  statusLabel: string;
  isReadyHighlight?: boolean;
  accent: NorseAccent;
  icon: ReactNode;
}

export function MoreMenuPanel({
  state,
  onNavigateTab,
  onClaimRank,
  onBuildShipOrHird,
  onBuildHoldingStructure,
  onClearFirstFarm,
  onConquerCity,
  onSendSettlers,
  onStationGarrison,
  onSetTributeBurden,
  onAppointJarl,
  onTakeHostages,
  onToggleTolerance,
  onExecutePlot,
  onClaimSpecialTitle,
  onResolveBattleTactic,
  onCancelBattle,
}: MoreMenuPanelProps) {
  const lang = state.settings.language;
  const isFa = lang === 'fa';
  const [activeModal, setActiveModal] = useState<MoreSheetId | null>(null);

  const claimable = getClaimableNextTitle(state);
  const r = state.realm;
  const totalShips = r.longships + r.knarrs;
  const legacyScore = calculateLegacyScore(state);

  const unlockedCount = BITLIFE_ACHIEVEMENTS.filter((ach) => {
    const p = ach.getProgress(state);
    return state.achievements.includes(ach.id) || p.current >= p.target;
  }).length;

  const winGoal = WIN_GOALS.find((w) => w.id === state.winGoalId) ?? WIN_GOALS[0];
  const winGoalFa = WIN_GOALS_FA[winGoal.id];
  const goalProg = winGoal.getProgress(state);
  const goalPct = Math.min(100, Math.round((goalProg.current / Math.max(1, goalProg.target)) * 100));

  const cards: MoreCardItem[] = [
    {
      id: 'holdings',
      categoryLabel: isFa ? 'مدیریت قلمرو' : 'Realm & Estates',
      title: isFa ? 'املاک و ساختمان‌ها' : 'Holdings & Buildings',
      description: isFa
        ? 'ساخت بناها در شهرها، مدیریت پادگان، اسکان مهاجران و تنظیم خراج'
        : 'Construct estate buildings, manage garrisons, settlers & tribute',
      costRiskBadge: isFa ? `${r.holdings.length} شهر · ${r.landFarms} مزرعه` : `${r.holdings.length} Estates · ${r.landFarms} Farms`,
      costRiskTone: 'amber',
      statusLabel: state.builtThisYear
        ? isFa
          ? 'ساخت‌وساز امسال انجام شد ✓'
          : 'Built This Year ✓'
        : isFa
          ? 'آماده مدیریت و ساخت'
          : 'Ready to Manage',
      accent: 'amber',
      icon: <Castle className="w-5 h-5" />,
    },
    {
      id: 'fleet',
      categoryLabel: isFa ? 'قوای نظامی' : 'Naval & Army',
      title: isFa ? 'ناوگان و سپاه هیرد' : 'Fleet & Warband',
      description: isFa
        ? 'ساخت کشتی جنگی لانگ‌شیپ، کشتی تجاری کنار و استخدام جنگجویان هیرد'
        : 'Build war longships, merchant knarrs, and recruit sworn Hird warriors',
      costRiskBadge: isFa ? `${totalShips} کشتی · ${r.hirdWarriors} جنگجو` : `${totalShips} Ships · ${r.hirdWarriors} Warriors`,
      costRiskTone: 'ice',
      statusLabel: isFa ? `پایداری قلمرو: ${r.stability}٪` : `Stability: ${r.stability}%`,
      accent: 'ice',
      icon: <Ship className="w-5 h-5" />,
    },
    {
      id: 'intrigue',
      categoryLabel: isFa ? 'سیاست و دربار' : 'Court Politics',
      title: isFa ? 'دسیسه‌ها و تاج‌های تاریخی' : 'Intrigue & Historical Crowns',
      description: isFa
        ? 'توطئه ترور، مسمومیت، رشوه در شورای ثینگ و کسب عناوین ویژه تاریخی'
        : 'Assassination plots, poison, Thing bribery & historical crowns',
      costRiskBadge: isFa ? 'توطئه · عناوین ویژه' : 'Plots · Special Titles',
      costRiskTone: 'crimson',
      statusLabel: isFa
        ? `${state.specialTitles?.length ?? 0} عنوان تاریخی فعال`
        : `${state.specialTitles?.length ?? 0} Special Titles`,
      accent: 'crimson',
      icon: <Crown className="w-5 h-5" />,
    },
    {
      id: 'rank_goal',
      categoryLabel: isFa ? 'مقام و سرنوشت' : 'Rank & Destiny',
      title: isFa ? 'ارتقای مقام و هدف حماسه' : 'Rank Promotion & Saga Goal',
      description: isFa
        ? 'بررسی شرایط ارتقای مقام (یارل، پادشاه، شاهنشاه) و پیشرفت هدف پیروزی'
        : 'View requirements for your next noble title and track victory progress',
      costRiskBadge: claimable
        ? isFa
          ? 'آماده ارتقای مقام!'
          : 'Promotion Ready!'
        : isFa
          ? `پیشرفت هدف: ${goalPct}٪`
          : `Goal Progress: ${goalPct}%`,
      costRiskTone: 'emerald',
      statusLabel: SHORT_TITLE_LABELS[lang][state.character.title],
      isReadyHighlight: Boolean(claimable),
      accent: 'emerald',
      icon: <Award className="w-5 h-5" />,
    },
    {
      id: 'badges',
      categoryLabel: isFa ? 'تالار افتخارات' : 'Hall of Fame',
      title: isFa ? 'دستاوردها و نشان‌های حماسه' : 'Achievements & Era Badges',
      description: isFa
        ? 'ویترین نشان‌های افتخار دودمان و مهرهای تاریخی بازشده در عصر وایکینگ‌ها'
        : 'Showcase of unlocked dynasty achievements and historical era seals',
      costRiskBadge: isFa
        ? `${unlockedCount}/${BITLIFE_ACHIEVEMENTS.length} دستاورد`
        : `${unlockedCount}/${BITLIFE_ACHIEVEMENTS.length} Unlocked`,
      costRiskTone: 'amber',
      statusLabel: isFa ? `شهرت خاندان: ${r.fame}` : `Dynasty Fame: ${r.fame}`,
      accent: 'amber',
      icon: <Trophy className="w-5 h-5" />,
    },
    {
      id: 'lineage',
      categoryLabel: isFa ? 'تاریخچه دودمان' : 'Dynasty Chronicle',
      title: isFa ? 'شجره‌نامه و میراث دودمان' : 'Lineage & Alternate History',
      description: isFa
        ? 'فهرست فرمانروایان پیشین خاندان، امتیاز میراث و رخدادهای تغییر تاریخ'
        : 'Ancestral rulers, total dynasty legacy score & historical divergences',
      costRiskBadge: isFa
        ? `نسل ${state.generation} · امتیاز ${legacyScore}`
        : `Gen ${state.generation} · Score ${legacyScore}`,
      costRiskTone: 'violet',
      statusLabel: isFa
        ? `${state.ancestors.length} فرمانروای پیشین`
        : `${state.ancestors.length} Past Rulers`,
      accent: 'violet',
      icon: <GitBranch className="w-5 h-5" />,
    },
  ];

  const getBadgeToneClasses = (tone: MoreCardItem['costRiskTone']) => {
    switch (tone) {
      case 'crimson':
        return 'bg-[#DC2626]/20 text-[#FCA5A5] border-[#EF4444]/40';
      case 'amber':
        return 'bg-[#F59E0B]/15 text-[#FCD34D] border-[#F59E0B]/35';
      case 'ice':
        return 'bg-[#38BDF8]/15 text-[#7DD3FC] border-[#38BDF8]/35';
      case 'emerald':
        return 'bg-[#34D399]/15 text-[#6EE7B7] border-[#34D399]/35';
      case 'violet':
        return 'bg-[#A78BFA]/15 text-[#DDD6FE] border-[#A78BFA]/35';
    }
  };

  return (
    <div className="flex flex-col overflow-hidden space-y-3 text-start">
      {/* Rank Promotion Callout when Eligible */}
      {claimable && (
        <div className="relative p-4 rounded-2xl bg-gradient-to-r from-[#261B0D] via-[#1B1915] to-[#131D2B] border border-[#F59E0B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-hidden">
          <NorseCornerOrnament accent="amber" />
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B] ring-1 ring-[#F59E0B]/40 flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-bold text-[#F1F5F9] whitespace-normal break-words leading-snug">
                {isFa
                  ? `آماده ارتقا به مقام «${SHORT_TITLE_LABELS.fa[claimable]}»!`
                  : `Ready to Claim Rank: ${SHORT_TITLE_LABELS.en[claimable]}`}
              </div>
              <p className="text-xs text-[#CBD5E1] whitespace-normal break-words leading-relaxed mt-0.5">
                {isFa
                  ? 'شرایط املاک، شهرت و سپاه برای ارتقای مقام خاندان فراهم شده است.'
                  : 'Your estates, fame, and warband meet the requirements for a higher title.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onClaimRank) {
                onClaimRank();
              } else {
                onNavigateTab(TabId.Realm, 'holdings');
              }
            }}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0B1118] text-xs font-extrabold cursor-pointer shrink-0 transition-colors"
          >
            {isFa
              ? `ارتقا به ${SHORT_TITLE_LABELS.fa[claimable]}`
              : `Claim ${SHORT_TITLE_LABELS.en[claimable]}`}
          </button>
        </div>
      )}

      <RuneDivider
        label={
          isFa
            ? 'بخش‌های قلمرو و میراث دودمان · برای باز شدن پنجره هر بخش روی آن بزنید'
            : 'Realm, Intrigue & Legacy Sections · Tap Any Section to Open Modal'
        }
        accent="amber"
      />

      {/* Unified 2-Column Modal-Opening Section Cards (Identical layout to ActionsPanel) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cards.map((card) => {
          const cardSurface =
            card.accent === 'ice'
              ? 'bg-gradient-to-br from-[#102338] via-[#131D2B] to-[#0F1722] border-[#38BDF8]/40 hover:border-[#38BDF8]'
              : card.accent === 'emerald'
                ? 'bg-gradient-to-br from-[#0F2422] via-[#131D2B] to-[#0F1722] border-[#34D399]/40 hover:border-[#34D399]'
                : card.accent === 'violet'
                  ? 'bg-gradient-to-br from-[#1B1730] via-[#131D2B] to-[#0F1722] border-[#A78BFA]/40 hover:border-[#A78BFA]'
                  : card.accent === 'crimson'
                    ? 'bg-gradient-to-br from-[#2C1016] via-[#181522] to-[#0F1722] border-[#EF4444]/55 hover:border-[#EF4444]'
                    : 'bg-gradient-to-br from-[#231911] via-[#131D2B] to-[#0F1722] border-[#F59E0B]/40 hover:border-[#F59E0B]';

          const iconWrap =
            card.accent === 'ice'
              ? 'bg-[#38BDF8]/15 text-[#38BDF8] ring-1 ring-[#38BDF8]/30'
              : card.accent === 'emerald'
                ? 'bg-[#34D399]/15 text-[#34D399] ring-1 ring-[#34D399]/30'
                : card.accent === 'violet'
                  ? 'bg-[#A78BFA]/15 text-[#A78BFA] ring-1 ring-[#A78BFA]/30'
                  : card.accent === 'crimson'
                    ? 'bg-[#EF4444]/15 text-[#F87171] ring-1 ring-[#EF4444]/35'
                    : 'bg-[#F59E0B]/15 text-[#F59E0B] ring-1 ring-[#F59E0B]/30';

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setActiveModal(card.id)}
              className={`relative min-h-[138px] p-3.5 rounded-2xl border text-start flex flex-col justify-between gap-2.5 transition-all active:scale-[0.98] cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/70 ${cardSurface}`}
            >
              <NorseCornerOrnament accent={card.accent} />

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconWrap}`}
                    >
                      {card.icon}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-semibold text-[#94A3B8] block">
                        {card.categoryLabel}
                      </span>
                      <div className="text-sm font-bold text-[#F1F5F9] whitespace-normal break-words leading-snug">
                        {card.title}
                      </div>
                    </div>
                  </div>
                  {card.isReadyHighlight && (
                    <span className="w-6 h-6 rounded-lg bg-[#34D399]/15 text-[#34D399] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#CBD5E1] whitespace-normal break-words leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="pt-2 border-t border-white/8 flex flex-wrap items-center justify-between gap-1.5">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-semibold whitespace-normal break-words leading-snug ${getBadgeToneClasses(
                    card.costRiskTone
                  )}`}
                >
                  {card.costRiskBadge}
                </span>
                <span className="text-[11px] font-mono tabular-nums text-[#E2E8F0] font-semibold">
                  {card.statusLabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ================================================================= */}
      {/* MODAL 1–3: HOLDINGS / FLEET / INTRIGUE                            */}
      {/* ================================================================= */}
      {(activeModal === 'holdings' || activeModal === 'fleet' || activeModal === 'intrigue') && (
        <NorseBottomSheet
          isOpen={true}
          onClose={() => setActiveModal(null)}
          maxWidthClass="max-w-2xl"
          accent={
            activeModal === 'fleet'
              ? 'ice'
              : activeModal === 'intrigue'
                ? 'crimson'
                : 'amber'
          }
          closeLabel={isFa ? 'بستن' : 'Close'}
          title={
            activeModal === 'fleet'
              ? isFa
                ? 'ناوگان و سپاه هیرد'
                : 'Fleet & Warband'
              : activeModal === 'intrigue'
                ? isFa
                  ? 'سیاست، دسیسه‌ها و تاج‌های تاریخی'
                  : 'Intrigue & Historical Crowns'
                : isFa
                  ? 'املاک، شهرها و ساختمان‌ها'
                  : 'Holdings & Buildings'
          }
          subtitle={
            isFa
              ? `خزانه نقره: ${r.silver} · مزارع: ${r.landFarms} · کشتی‌ها: ${totalShips} · جنگجویان: ${r.hirdWarriors}`
              : `Silver: ${r.silver} · Farms: ${r.landFarms} · Ships: ${totalShips} · Warriors: ${r.hirdWarriors}`
          }
        >
          <RealmPanel
            state={state}
            initialSection={activeModal === 'intrigue' ? 'politics' : activeModal}
            onClaimRank={() => onClaimRank && onClaimRank()}
            onBuildShipOrHird={(act) => onBuildShipOrHird && onBuildShipOrHird(act)}
            onBuildHoldingStructure={(sid, b) =>
              onBuildHoldingStructure && onBuildHoldingStructure(sid, b)
            }
            onClearFirstFarm={() => onClearFirstFarm && onClearFirstFarm()}
            onConquerCity={onConquerCity}
            onSendSettlers={onSendSettlers}
            onStationGarrison={onStationGarrison}
            onSetTributeBurden={onSetTributeBurden}
            onAppointJarl={onAppointJarl}
            onTakeHostages={onTakeHostages}
            onToggleTolerance={onToggleTolerance}
            onExecutePlot={onExecutePlot}
            onClaimSpecialTitle={onClaimSpecialTitle}
            onResolveBattleTactic={onResolveBattleTactic}
            onCancelBattle={onCancelBattle}
          />
        </NorseBottomSheet>
      )}

      {/* ================================================================= */}
      {/* MODAL 4: RANK PROMOTION & SAGA GOAL                               */}
      {/* ================================================================= */}
      {activeModal === 'rank_goal' && (
        <NorseBottomSheet
          isOpen={true}
          onClose={() => setActiveModal(null)}
          accent="emerald"
          closeLabel={isFa ? 'بستن' : 'Close'}
          title={isFa ? 'ارتقای مقام و هدف حماسه' : 'Rank Promotion & Saga Goal'}
          subtitle={TITLE_LABELS[lang][state.character.title]}
          icon={
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/40 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          }
        >
          <div className="p-4 rounded-2xl bg-[#131D2B] border border-[#233246] space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#F59E0B]">
                {isFa ? 'جایگاه و مقام کنونی' : 'Current Noble Rank'}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-[#101926] border border-[#1E2D40] text-xs font-bold text-[#F1F5F9]">
                {TITLE_LABELS[lang][state.character.title]}
              </span>
            </div>

            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              {getNextTitleRequirementText(state.character.title, lang)}
            </p>

            {claimable && onClaimRank && (
              <button
                type="button"
                onClick={() => {
                  onClaimRank();
                  setActiveModal(null);
                }}
                className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0B1118] text-xs font-extrabold cursor-pointer transition-colors"
              >
                {isFa
                  ? `ارتقا به مقام «${SHORT_TITLE_LABELS.fa[claimable]}»!`
                  : `Claim Rank: ${SHORT_TITLE_LABELS.en[claimable]}!`}
              </button>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-[#131D2B] border border-[#233246] space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-[#38BDF8]">
                  {isFa ? 'هدف نهایی حماسه' : 'Dynasty Victory Goal'}
                </div>
                <div className="text-sm font-bold text-[#F1F5F9] mt-0.5">
                  {isFa ? winGoalFa?.name ?? winGoal.name : winGoal.name}
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-500">
                {goalProg.current} / {goalProg.target} ({goalPct}%)
              </span>
            </div>

            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              {isFa ? winGoalFa?.description ?? winGoal.description : winGoal.description}
            </p>

            <div className="h-2.5 w-full rounded-full bg-[#0B1118] overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${goalPct}%` }}
              />
            </div>
          </div>
        </NorseBottomSheet>
      )}

      {/* ================================================================= */}
      {/* MODAL 5 & 6: ACHIEVEMENTS / LINEAGE                               */}
      {/* ================================================================= */}
      {(activeModal === 'badges' || activeModal === 'lineage') && (
        <NorseBottomSheet
          isOpen={true}
          onClose={() => setActiveModal(null)}
          maxWidthClass="max-w-2xl"
          accent={activeModal === 'badges' ? 'amber' : 'violet'}
          closeLabel={isFa ? 'بستن' : 'Close'}
          title={
            activeModal === 'badges'
              ? isFa
                ? 'دستاوردها و نشان‌های حماسه'
                : 'Achievements & Historical Seals'
              : isFa
                ? 'شجره‌نامه و میراث دودمان'
                : 'Dynasty Lineage & Legacy'
          }
          subtitle={
            isFa
              ? `نسل ${state.generation} · امتیاز میراث: ${legacyScore}`
              : `Generation ${state.generation} · Legacy Score: ${legacyScore}`
          }
        >
          <SagaChroniclePanel
            state={state}
            initialSubTab={activeModal === 'lineage' ? 'ancestors' : 'badges'}
          />
        </NorseBottomSheet>
      )}
    </div>
  );
}
