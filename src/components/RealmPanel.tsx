import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Anchor,
  Award,
  Castle,
  Check,
  ChevronDown,
  ChevronUp,
  Coins,
  Crown,
  Eye,
  Flame,
  Hammer,
  Heart,
  MapPin,
  Minus,
  Plus,
  Scroll,
  Shield,
  ShieldAlert,
  Ship,
  Skull,
  Sparkles,
  Swords,
  Users,
} from 'lucide-react';
import { SETTLEMENTS_BY_ID } from '../data/geography';
import { BUILDINGS_CATALOG, WIN_GOALS } from '../data/namesAndTraits';
import {
  checkSpecialTitles,
  getClaimableNextTitle,
  getNextTitleRequirementText,
  hasBoathouse,
  isFortifiedEnemyCity,
} from '../engine/gameEngine';
import { BUILDINGS_FA, SETTLEMENTS_FA, WIN_GOALS_FA } from '../i18n/gameDataFa';
import { RELIGION_LABELS, SHORT_TITLE_LABELS, TITLE_LABELS } from '../i18n/ui';
import {
  BattleTactic,
  BuildingType,
  FullGameState,
  PlotType,
  TributeBurden,
} from '../types/game';
import { NorseCornerOrnament } from './NorseMotifs';

interface RealmPanelProps {
  state: FullGameState;
  initialSection?: 'holdings' | 'fleet' | 'politics' | 'intrigue';
  onClaimRank: () => void;
  onBuildShipOrHird: (action: 'recruit_hird' | 'build_longship' | 'build_knarr') => void;
  onBuildHoldingStructure: (settlementId: string, building: BuildingType) => void;
  onClearFirstFarm: () => void;
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

export function RealmPanel({
  state,
  initialSection = 'holdings',
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
}: RealmPanelProps) {
  const lang = state.settings.language;
  const isFa = lang === 'fa';

  const [tab, setTab] = useState<'holdings' | 'fleet' | 'politics'>('holdings');
  const [selectedHoldingId, setSelectedHoldingId] = useState<string>(
    state.realm.holdings[0]?.settlementId ?? ''
  );

  useEffect(() => {
    if (initialSection === 'fleet') setTab('fleet');
    else if (initialSection === 'politics' || initialSection === 'intrigue') setTab('politics');
  }, [initialSection]);

  const allBuildingKeys = Object.keys(BUILDINGS_CATALOG) as BuildingType[];
  const claimableRank = getClaimableNextTitle(state);
  const winGoal = WIN_GOALS.find((w) => w.id === state.winGoalId) ?? WIN_GOALS[0];
  const winGoalFa = WIN_GOALS_FA[winGoal.id];

  const boathouseActive = hasBoathouse(state);
  const rawShipUpkeep = state.realm.longships * 4 + state.realm.knarrs * 2;
  const shipUpkeep = boathouseActive ? Math.floor(rawShipUpkeep * 0.5) : rawShipUpkeep;
  const warriorUpkeep = Math.floor(Math.max(0, state.realm.hirdWarriors - 4) * 0.45);
  const totalUpkeep = shipUpkeep + warriorUpkeep;

  const currentLocId = state.character.locationId;
  const currentLoc = SETTLEMENTS_BY_ID[currentLocId];
  const currentLocName = isFa
    ? SETTLEMENTS_FA[currentLocId]?.name ?? currentLoc?.name ?? currentLocId
    : currentLoc?.name.split(' (')[0] ?? currentLocId;
  const locIsFortified = isFortifiedEnemyCity(state, currentLocId);
  const used = state.yearlyActivitiesUsed ?? {};
  const builtThisYear = Boolean(state.builtThisYear);

  const activeHolding =
    state.realm.holdings.find((h) => h.settlementId === selectedHoldingId) ??
    state.realm.holdings[0];

  const specialTitles = checkSpecialTitles(state);

  return (
    <div className="flex flex-col overflow-hidden space-y-4 text-start">
      {/* 3-Way Segmented Navigation Header */}
      <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-[#0B1118] border border-[#1E2D40]">
        <button
          type="button"
          onClick={() => setTab('holdings')}
          className={`min-h-[44px] px-2 py-2 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            tab === 'holdings'
              ? 'bg-[#F59E0B] text-[#0B1118]'
              : 'text-[#CBD5E1] hover:text-[#F1F5F9] hover:bg-[#131D2B]'
          }`}
        >
          <Castle className="w-4 h-4 shrink-0" />
          <span className="whitespace-normal leading-tight">
            {isFa ? 'املاک و قلمرو' : 'Holdings & Realm'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab('fleet')}
          className={`min-h-[44px] px-2 py-2 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            tab === 'fleet'
              ? 'bg-[#38BDF8] text-[#0B1118]'
              : 'text-[#CBD5E1] hover:text-[#F1F5F9] hover:bg-[#131D2B]'
          }`}
        >
          <Ship className="w-4 h-4 shrink-0" />
          <span className="whitespace-normal leading-tight">
            {isFa ? 'ناوگان و سپاه' : 'Fleet & Warband'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab('politics')}
          className={`min-h-[44px] px-2 py-2 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            tab === 'politics'
              ? 'bg-rose-500 text-white'
              : 'text-[#CBD5E1] hover:text-[#F1F5F9] hover:bg-[#131D2B]'
          }`}
        >
          <Crown className="w-4 h-4 shrink-0" />
          <span className="whitespace-normal leading-tight">
            {isFa ? 'سیاست و توطئه‌ها' : 'Intrigue & Crown'}
          </span>
        </button>
      </div>

      {/* Active Battle Card (If Ongoing) */}
      {state.activeBattle && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#2A0E12] via-[#1B1422] to-[#0F1722] border-2 border-rose-500 flex flex-col overflow-hidden space-y-3.5 shadow-xl">
          <div className="flex items-center justify-between gap-2 border-b border-rose-500/30 pb-2">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-rose-400 animate-pulse" />
              <div className="font-saga text-lg font-bold text-rose-100">
                {isFa
                  ? `میدان نبرد: یورش به «${state.activeBattle.targetNameFa}»`
                  : `Battlefield: Assault on ${state.activeBattle.targetName}`}
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
              {isFa ? `راند ${state.activeBattle.round}` : `Round ${state.activeBattle.round}`}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-[#0B1118]/80 border border-emerald-500/30 space-y-1">
              <div className="text-emerald-400 font-bold flex items-center justify-between">
                <span>{isFa ? 'سپاه شما' : 'Your Warband'}</span>
                <span className="font-mono">{state.activeBattle.playerWarriors}</span>
              </div>
              <div className="text-[11px] text-[#94A3B8]">
                {isFa ? `روحیه: ${state.activeBattle.playerMorale}٪` : `Morale: ${state.activeBattle.playerMorale}%`}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0B1118]/80 border border-rose-500/30 space-y-1">
              <div className="text-rose-400 font-bold flex items-center justify-between">
                <span>{isFa ? 'مدافعان دژ' : 'Garrison Defenders'}</span>
                <span className="font-mono">{state.activeBattle.enemyWarriors}</span>
              </div>
              <div className="text-[11px] text-[#94A3B8]">
                {isFa ? `روحیه دشمن: ${state.activeBattle.enemyMorale}٪` : `Enemy Morale: ${state.activeBattle.enemyMorale}%`}
              </div>
            </div>
          </div>

          {/* Battle Log */}
          <div className="p-3 rounded-xl bg-[#0B1118] border border-[#1E2D40] text-xs font-mono text-[#CBD5E1] space-y-1 max-h-24 overflow-y-auto">
            {(isFa ? state.activeBattle.logFa : state.activeBattle.log).map((entry, idx) => (
              <div key={idx} className="leading-relaxed">
                ⚔️ {entry}
              </div>
            ))}
          </div>

          {/* Tactical Command Choices */}
          {onResolveBattleTactic && (
            <div className="space-y-1.5 pt-1">
              <div className="text-xs font-bold text-[#F59E0B]">
                {isFa ? 'دستور تاکتیکی فرمانده:' : 'Choose Commander Tactic:'}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onResolveBattleTactic('shield_wall')}
                  className="p-2.5 rounded-xl bg-[#142636] border border-[#38BDF8] hover:bg-[#1E3A52] text-xs font-bold text-[#F1F5F9] cursor-pointer"
                >
                  🛡️ {isFa ? 'دیوار سپرها (اسکیالدبورگ)' : 'Shield Wall'}
                </button>
                <button
                  type="button"
                  onClick={() => onResolveBattleTactic('svinfylking')}
                  className="p-2.5 rounded-xl bg-[#2D1B1B] border border-rose-500 hover:bg-[#3D2525] text-xs font-bold text-rose-200 cursor-pointer"
                >
                  🐗 {isFa ? 'پوزه گراز (یورش گُوه‌ای)' : "Boar's Snout"}
                </button>
                <button
                  type="button"
                  onClick={() => onResolveBattleTactic('ambush')}
                  className="p-2.5 rounded-xl bg-[#142922] border border-emerald-500 hover:bg-[#1E3B32] text-xs font-bold text-emerald-200 cursor-pointer"
                >
                  🌲 {isFa ? 'شبیخون از دل مه' : 'Mist Ambush'}
                </button>
                <button
                  type="button"
                  onClick={() => onResolveBattleTactic('flank_assault')}
                  className="p-2.5 rounded-xl bg-[#1F2438] border border-indigo-400 hover:bg-[#2C344E] text-xs font-bold text-indigo-200 cursor-pointer"
                >
                  ⛵ {isFa ? 'دور زدن از جناحین' : 'Flank Assault'}
                </button>
                <button
                  type="button"
                  onClick={() => onResolveBattleTactic('berserk_charge')}
                  className="p-2.5 rounded-xl bg-[#331828] border border-fuchsia-500 hover:bg-[#482239] text-xs font-bold text-fuchsia-200 cursor-pointer"
                >
                  ⚡ {isFa ? 'حمله برزرکرها' : 'Berserk Charge'}
                </button>
                <button
                  type="button"
                  onClick={() => onResolveBattleTactic('orderly_retreat')}
                  className="p-2.5 rounded-xl bg-[#1E232A] border border-[#64748B] hover:bg-[#2A323D] text-xs font-bold text-[#94A3B8] cursor-pointer"
                >
                  📯 {isFa ? 'عقب‌نشینی به کشتی‌ها' : 'Sound Retreat'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: HOLDINGS & GOVERNANCE */}
      {tab === 'holdings' && (
        <div className="flex flex-col overflow-hidden space-y-4">
          {/* Ruling Rank & Progression Banner */}
          <div className="relative p-4 rounded-2xl bg-gradient-to-br from-[#1D1913] via-[#131D2B] to-[#0F1722] border border-[#F59E0B]/45 space-y-3 overflow-hidden">
            <NorseCornerOrnament accent="amber" />
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/15 text-[#F59E0B] ring-1 ring-[#F59E0B]/35 flex items-center justify-center shrink-0">
                  <Crown className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-[#94A3B8]">
                    {isFa ? 'مقام و جایگاه کنونی' : 'Current Ruling Rank'}
                  </div>
                  <div className="font-saga text-xl sm:text-2xl font-bold text-[#F1F5F9] whitespace-normal break-words leading-snug">
                    {TITLE_LABELS[lang][state.character.title]}
                  </div>
                </div>
              </div>

              <div className="text-end font-mono tabular-nums text-xs shrink-0 space-y-0.5">
                <div className="text-[#F59E0B] font-bold">
                  {isFa ? `${state.realm.fame} شهرت` : `${state.realm.fame} Fame`}
                </div>
                <div className="text-[#CBD5E1]">
                  {isFa ? `ثبات ${state.realm.stability}%` : `Stability ${state.realm.stability}%`}
                </div>
              </div>
            </div>

            <p className="text-xs text-[#CBD5E1] leading-relaxed whitespace-normal break-words">
              {getNextTitleRequirementText(state.character.title, lang)}
            </p>

            {claimableRank && (
              <button
                type="button"
                onClick={onClaimRank}
                className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] hover:brightness-110 active:scale-[0.99] text-[#0B1118] font-saga text-sm sm:text-base font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-[#F59E0B]/20"
              >
                <Crown className="w-5 h-5 shrink-0" />
                <span>
                  {isFa
                    ? `جشن ارتقا: تاج‌گذاری به عنوان «${TITLE_LABELS.fa[claimableRank]}»!`
                    : `Claim Title: Crown as ${TITLE_LABELS.en[claimableRank]}!`}
                </span>
              </button>
            )}
          </div>

          {/* Quick Farm/Conquer at Current Location */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#131D2B] border border-[#233246] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  locIsFortified
                    ? 'bg-[#EF4444]/15 text-[#F87171] ring-1 ring-[#EF4444]/35'
                    : 'bg-[#34D399]/15 text-[#34D399] ring-1 ring-[#34D399]/35'
                }`}
              >
                {locIsFortified ? <Castle className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
              </div>
              <div className="min-w-0 space-y-1">
                <div className="text-sm font-bold text-[#F1F5F9] whitespace-normal break-words leading-snug">
                  {locIsFortified
                    ? isFa
                      ? `تسخیر دژ مستحکم ${currentLocName}`
                      : `Conquer Fortified ${currentLocName}`
                    : isFa
                      ? `خرید مزرعه جدید در ${currentLocName}`
                      : `Buy Farmland in ${currentLocName}`}
                </div>
                <div className="text-xs text-[#CBD5E1] whitespace-normal break-words leading-relaxed">
                  {locIsFortified
                    ? isFa
                      ? 'دژ مستحکم دشمن · نیازمند ۱ لانگ‌شیپ و ۱۲+ جنگجو'
                      : 'Enemy stronghold · Requires 1 Longship & 12+ Warriors'
                    : isFa
                      ? `آذوقه انبار: ${state.realm.foodStores} · هزینه: ۳۵ نقره`
                      : `Food stores: ${state.realm.foodStores} · Cost: 35 Silver`}
                </div>
              </div>
            </div>

            {locIsFortified && onConquerCity ? (
              <button
                type="button"
                disabled={Boolean(used.settle) || state.realm.longships <= 0 || state.realm.hirdWarriors < 12}
                onClick={() => onConquerCity(currentLocId)}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#EF4444] disabled:bg-[#1E293B] disabled:text-[#64748B] text-white font-bold text-xs shrink-0 cursor-pointer transition-colors"
              >
                {used.settle ? (isFa ? 'انجام شد ✓' : 'Done ✓') : isFa ? 'یورش برای فتح' : 'Storm Stronghold'}
              </button>
            ) : (
              <button
                type="button"
                disabled={Boolean(used.settle) || state.realm.silver < 35}
                onClick={onClearFirstFarm}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#34D399] hover:bg-[#6EE7B7] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#0B1118] font-extrabold text-xs shrink-0 cursor-pointer transition-colors"
              >
                {used.settle ? (isFa ? 'انجام شد ✓' : 'Claimed ✓') : isFa ? 'خرید (۳۵ نقره)' : 'Buy Farm (35 Silver)'}
              </button>
            )}
          </div>

          {/* ALL HOLDINGS GOVERNANCE & REBELLION MANAGERS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#F59E0B]">
              <span>{isFa ? 'مدیریت متصرفات و املاک (شورش و خراج):' : 'Holdings Governance & Rebellion:'}</span>
              <span className="font-mono text-[#CBD5E1]">
                {state.realm.holdings.length} {isFa ? 'مقر فعال' : 'holdings'}
              </span>
            </div>

            {state.realm.holdings.map((h) => {
              const sData = SETTLEMENTS_BY_ID[h.settlementId];
              const sName = isFa ? SETTLEMENTS_FA[h.settlementId]?.name ?? sData?.name ?? h.settlementId : sData?.name.split(' (')[0] ?? h.settlementId;
              const isDangerUnrest = (h.unrest ?? 15) >= 70;
              const isCriticalUnrest = (h.unrest ?? 15) >= 90;
              const isSelected = h.settlementId === activeHolding?.settlementId;

              return (
                <div
                  key={h.settlementId}
                  className={`p-4 rounded-2xl border transition-colors space-y-3 ${
                    isCriticalUnrest
                      ? 'bg-rose-950/40 border-rose-500 shadow-md shadow-rose-950/50'
                      : isDangerUnrest
                        ? 'bg-amber-950/30 border-amber-500'
                        : isSelected
                          ? 'bg-[#152335] border-[#F59E0B]'
                          : 'bg-[#131D2B] border-[#233246]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-saga text-lg font-bold text-[#F1F5F9] flex items-center gap-2">
                        <span>{sName}</span>
                        {isCriticalUnrest && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {isFa ? 'خطر شورش مسلحانه!' : 'Imminent Revolt!'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#94A3B8]">
                        {isFa ? `${h.farms} مزرعه · پادگان: ${h.garrison ?? 4} جنگجو` : `${h.farms} Farms · Garrison: ${h.garrison ?? 4} warriors`}
                        {h.appointedJarl && (
                          <span className="text-[#38BDF8] ms-2">
                            · {isFa ? `یارل: ${h.appointedJarl}` : `Jarl: ${h.appointedJarl}`}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedHoldingId(h.settlementId)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#0B1118] border border-[#233246] hover:border-[#38BDF8] text-[#38BDF8] cursor-pointer"
                    >
                      {isFa ? 'ساخت بنا' : 'Build'}
                    </button>
                  </div>

                  {/* Unrest & Demographics Meters */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#CBD5E1] flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-rose-400" />
                        {isFa ? 'میزان ناآرامی محلی:' : 'Local Unrest:'}
                      </span>
                      <span className={`font-mono font-bold ${isDangerUnrest ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {h.unrest ?? 15}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#0B1118] overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isCriticalUnrest
                            ? 'bg-rose-500'
                            : isDangerUnrest
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min(100, h.unrest ?? 15)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-[#94A3B8] pt-0.5">
                      <span>{isFa ? `جمعیت نورس: ${h.norsePopulationShare ?? 65}%` : `Norse Pop: ${h.norsePopulationShare ?? 65}%`}</span>
                      <span>{isFa ? `گروگان‌های اشرافی: ${h.hostagesCount ?? 0}` : `Hostages: ${h.hostagesCount ?? 0}`}</span>
                    </div>
                  </div>

                  {/* Governance Tool Buttons */}
                  <div className="pt-2 border-t border-[#1E2D40] flex flex-wrap items-center gap-2">
                    {/* Garrison Transfer */}
                    {onStationGarrison && (
                      <div className="flex items-center gap-1 bg-[#0B1118] px-2 py-1 rounded-xl border border-[#233246]">
                        <span className="text-[11px] text-[#CBD5E1] me-1">{isFa ? 'پادگان:' : 'Garrison:'}</span>
                        <button
                          type="button"
                          disabled={(h.garrison ?? 0) <= 0}
                          onClick={() => onStationGarrison(h.settlementId, -2)}
                          className="w-6 h-6 rounded bg-[#131D2B] hover:bg-[#1E2D40] text-[#F1F5F9] flex items-center justify-center cursor-pointer disabled:opacity-30"
                          title={isFa ? 'انتقال ۲ جنگجو به سپاه شخصی' : 'Withdraw 2 warriors'}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-bold px-1.5">{h.garrison ?? 4}</span>
                        <button
                          type="button"
                          disabled={state.realm.hirdWarriors < 2}
                          onClick={() => onStationGarrison(h.settlementId, 2)}
                          className="w-6 h-6 rounded bg-[#131D2B] hover:bg-[#1E2D40] text-[#34D399] flex items-center justify-center cursor-pointer disabled:opacity-30"
                          title={isFa ? 'استقرار ۲ جنگجو در پادگان' : 'Station 2 warriors'}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Send Settlers */}
                    {onSendSettlers && (
                      <button
                        type="button"
                        disabled={state.realm.silver < 28}
                        onClick={() => onSendSettlers(h.settlementId)}
                        className="px-2.5 py-1.5 rounded-xl bg-[#131D2B] hover:bg-[#1E2D40] border border-[#233246] hover:border-[#38BDF8] text-xs font-semibold text-[#38BDF8] disabled:opacity-30 cursor-pointer"
                        title={isFa ? 'ارسال مهاجران نورس (-۲۸ نقره، ناآرامی -۱۴٪)' : 'Send Norse settlers (-28 silver, -14% unrest)'}
                      >
                        ⛵ {isFa ? 'ارسال مهاجران (۲۸ نقره)' : 'Send Settlers (28 Silv)'}
                      </button>
                    )}

                    {/* Appoint Jarl */}
                    {onAppointJarl && !h.appointedJarl && (
                      <button
                        type="button"
                        disabled={state.realm.silver < 20}
                        onClick={() => onAppointJarl(h.settlementId)}
                        className="px-2.5 py-1.5 rounded-xl bg-[#131D2B] hover:bg-[#1E2D40] border border-[#233246] hover:border-[#F59E0B] text-xs font-semibold text-[#F59E0B] disabled:opacity-30 cursor-pointer"
                        title={isFa ? 'انتصاب یارل وفادار (-۲۰ نقره، ناآرامی -۲۰٪)' : 'Appoint loyal Jarl (-20 silver, -20% unrest)'}
                      >
                        👑 {isFa ? 'انتصاب یارل (۲۰ نقره)' : 'Appoint Jarl (20 Silv)'}
                      </button>
                    )}

                    {/* Take Hostages */}
                    {onTakeHostages && (
                      <button
                        type="button"
                        disabled={(h.garrison ?? 0) < 6 && state.realm.hirdWarriors < 10}
                        onClick={() => onTakeHostages(h.settlementId)}
                        className="px-2.5 py-1.5 rounded-xl bg-[#131D2B] hover:bg-[#1E2D40] border border-[#233246] hover:border-indigo-400 text-xs font-semibold text-indigo-300 disabled:opacity-30 cursor-pointer"
                        title={isFa ? 'گرفتن گروگان‌های اشرافی از بزرگان محلی' : 'Demand noble hostages to suppress unrest'}
                      >
                        ⛓️ {isFa ? 'گرفتن گروگان اشرافی' : 'Take Hostages'}
                      </button>
                    )}

                    {/* Tribute Burden Selector */}
                    {onSetTributeBurden && (
                      <div className="flex items-center gap-1 text-[11px] ms-auto">
                        <span className="text-[#94A3B8]">{isFa ? 'خراج:' : 'Tribute:'}</span>
                        {(['none', 'light', 'normal', 'heavy', 'extortionate'] as TributeBurden[]).map((tb) => (
                          <button
                            key={tb}
                            type="button"
                            onClick={() => onSetTributeBurden(h.settlementId, tb)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                              (h.tributeBurden ?? 'normal') === tb
                                ? 'bg-[#F59E0B] text-[#0B1118]'
                                : 'bg-[#0B1118] text-[#94A3B8] hover:text-[#F1F5F9]'
                            }`}
                          >
                            {tb === 'none' ? (isFa ? 'هیچ' : '0') : tb === 'light' ? (isFa ? 'کم' : 'Lt') : tb === 'normal' ? (isFa ? 'متوسط' : 'Med') : tb === 'heavy' ? (isFa ? 'سنگین' : 'Hvy') : (isFa ? 'ظالمانه' : 'Max')}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Construction in Active Holding */}
          {activeHolding && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>
                  {isFa
                    ? `بناهای قابل ساخت در «${SETTLEMENTS_FA[activeHolding.settlementId]?.name ?? SETTLEMENTS_BY_ID[activeHolding.settlementId]?.name ?? activeHolding.settlementId}»`
                    : `Construct Structures at ${SETTLEMENTS_BY_ID[activeHolding.settlementId]?.name ?? activeHolding.settlementId}`}
                </span>
                <span className="font-mono text-[#CBD5E1]">
                  {builtThisYear ? (isFa ? 'سهمیه امسال ساخته شد ✓' : 'Built This Year ✓') : isFa ? '۱ بنا در سال' : '1 Build / Year'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allBuildingKeys.map((bKey) => {
                  const bDef = BUILDINGS_CATALOG[bKey];
                  const bFa = BUILDINGS_FA[bKey];
                  const built = activeHolding.buildings.includes(bKey);
                  const wrongFaith = bDef.religionReq !== undefined && state.character.religion !== bDef.religionReq;
                  const canBuild = !built && !wrongFaith && !builtThisYear && state.realm.silver >= bDef.costSilver;

                  return (
                    <div
                      key={bKey}
                      className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-3 ${
                        built ? 'bg-[#112220] border-[#34D399]/50' : 'bg-[#131D2B] border-[#233246]'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-sm text-[#F1F5F9]">
                            {isFa ? bFa?.name ?? bDef.name : bDef.name}
                          </div>
                          {built ? (
                            <span className="text-xs text-[#34D399] font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              {isFa ? 'ساخته‌شده' : 'Built'}
                            </span>
                          ) : (
                            <span className="text-xs font-mono font-bold text-[#F59E0B]">
                              {bDef.costSilver} {isFa ? 'نقره' : 'Silver'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#94A3B8] leading-relaxed">
                          {isFa ? bFa?.description ?? bDef.description : bDef.description}
                        </p>
                      </div>

                      {!built && (
                        <button
                          type="button"
                          disabled={!canBuild}
                          onClick={() => onBuildHoldingStructure(activeHolding.settlementId, bKey)}
                          className="w-full min-h-[38px] py-1.5 rounded-xl bg-[#1E3A52] hover:bg-[#254A6B] disabled:bg-[#1E293B] disabled:text-[#64748B] text-xs font-bold text-[#38BDF8] cursor-pointer transition-colors"
                        >
                          {wrongFaith
                            ? isFa ? 'نیازمند آیین دیگر' : 'Requires Different Faith'
                            : isFa ? `احداث (${bDef.costSilver} نقره)` : `Build (${bDef.costSilver} Silver)`}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FLEET & WARBAND */}
      {tab === 'fleet' && (
        <div className="flex flex-col overflow-hidden space-y-4">
          <div className="p-4 rounded-2xl bg-[#131D2B] border border-[#233246] space-y-3">
            <div className="font-saga text-lg font-bold text-[#F1F5F9] flex items-center gap-2">
              <Ship className="w-5 h-5 text-[#38BDF8]" />
              <span>{isFa ? 'قدرت نظامی و ناوگان دریایی' : 'Military Power & Fleet'}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#0B1118] border border-[#1E2D40]">
                <div className="text-xs text-[#94A3B8]">{isFa ? 'جنگجویان هیرد' : 'Hird Warriors'}</div>
                <div className="text-xl font-mono font-bold text-[#F1F5F9]">{state.realm.hirdWarriors}</div>
                <div className="text-[11px] text-[#CBD5E1]">{isFa ? 'سربازان سوگندخورده' : 'Sworn warriors'}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#0B1118] border border-[#1E2D40]">
                <div className="text-xs text-[#94A3B8]">{isFa ? 'کشتی‌های جنگی' : 'War Longships'}</div>
                <div className="text-xl font-mono font-bold text-[#38BDF8]">{state.realm.longships}</div>
                <div className="text-[11px] text-[#CBD5E1]">{isFa ? 'لانگ‌شیپ اژدهانشان' : 'Fast dragon-ships'}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#0B1118] border border-[#1E2D40]">
                <div className="text-xs text-[#94A3B8]">{isFa ? 'کشتی‌های تجاری' : 'Trade Knarrs'}</div>
                <div className="text-xl font-mono font-bold text-[#F59E0B]">{state.realm.knarrs}</div>
                <div className="text-[11px] text-[#CBD5E1]">{isFa ? 'کِنار اقیانوس‌پیما' : 'Deep-ocean hulls'}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0B1118] border border-[#1E2D40] flex items-center justify-between text-xs font-mono">
              <span className="text-[#94A3B8]">{isFa ? 'هزینه نگهداری سالانه ناوگان و سپاه:' : 'Annual Fleet & Warband Upkeep:'}</span>
              <span className="text-[#F59E0B] font-bold">{totalUpkeep} {isFa ? 'نقره در سال' : 'Silver/yr'}</span>
            </div>
          </div>

          {/* Recruitment & Ship Launching Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              disabled={state.realm.silver < 18}
              onClick={() => onBuildShipOrHird('recruit_hird')}
              className="p-3.5 rounded-2xl bg-[#131D2B] border border-[#233246] hover:border-[#F59E0B] text-start space-y-1.5 cursor-pointer disabled:opacity-40 transition-colors"
            >
              <div className="font-bold text-sm text-[#F1F5F9] flex items-center gap-2">
                <Swords className="w-4 h-4 text-[#F59E0B]" />
                <span>{isFa ? 'استخدام ۶ جنگجو' : 'Recruit 6 Warriors'}</span>
              </div>
              <div className="text-xs text-[#94A3B8]">{isFa ? 'هزینه: ۱۸ نقره · تقویت سپاه هیرد' : 'Cost: 18 Silver · Expand warband'}</div>
            </button>

            <button
              type="button"
              disabled={state.realm.silver < 55}
              onClick={() => onBuildShipOrHird('build_longship')}
              className="p-3.5 rounded-2xl bg-[#131D2B] border border-[#233246] hover:border-[#38BDF8] text-start space-y-1.5 cursor-pointer disabled:opacity-40 transition-colors"
            >
              <div className="font-bold text-sm text-[#F1F5F9] flex items-center gap-2">
                <Ship className="w-4 h-4 text-[#38BDF8]" />
                <span>{isFa ? 'ساخت لانگ‌شیپ' : 'Launch Longship'}</span>
              </div>
              <div className="text-xs text-[#94A3B8]">{isFa ? 'هزینه: ۵۵ نقره · کشتی جنگی برای غارت' : 'Cost: 55 Silver · Warship for raids'}</div>
            </button>

            <button
              type="button"
              disabled={state.realm.silver < 45}
              onClick={() => onBuildShipOrHird('build_knarr')}
              className="p-3.5 rounded-2xl bg-[#131D2B] border border-[#233246] hover:border-emerald-400 text-start space-y-1.5 cursor-pointer disabled:opacity-40 transition-colors"
            >
              <div className="font-bold text-sm text-[#F1F5F9] flex items-center gap-2">
                <Anchor className="w-4 h-4 text-emerald-400" />
                <span>{isFa ? 'ساخت کِنار تجاری' : 'Launch Knarr'}</span>
              </div>
              <div className="text-xs text-[#94A3B8]">{isFa ? 'هزینه: ۴۵ نقره · مسیر تجاری جدید' : 'Cost: 45 Silver · +1 Trade route'}</div>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: POLITICS & INTRIGUE */}
      {tab === 'politics' && (
        <div className="flex flex-col overflow-hidden space-y-4">
          {/* Emergent Historical Titles (Jarl of Orkney, King of Norway, etc.) */}
          <div className="p-4 rounded-2xl bg-[#131D2B] border border-[#233246] space-y-3">
            <div className="font-saga text-lg font-bold text-[#F1F5F9] flex items-center gap-2">
              <Crown className="w-5 h-5 text-[#F59E0B]" />
              <span>{isFa ? 'عناوین و تاج‌های تاریخی قابل احراز' : 'Emergent Historical Crowns & Titles'}</span>
            </div>
            <p className="text-xs text-[#94A3B8]">
              {isFa
                ? 'با فتوحات، شهرت و تسلط بر سرزمین‌ها، عناوین بزرگ تاریخ شمال و اروپا را تصاحب کنید.'
                : 'Conquer shires, win glory, and claim authentic medieval titles without scripted locks.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {specialTitles.map((st) => {
                const isClaimed = (state.specialTitles ?? []).includes(st.id);
                return (
                  <div
                    key={st.id}
                    className={`p-3 rounded-xl border flex flex-col justify-between gap-2.5 ${
                      isClaimed
                        ? 'bg-[#12241C] border-emerald-500/50'
                        : st.canClaim
                          ? 'bg-[#211E16] border-[#F59E0B]'
                          : 'bg-[#0B1118] border-[#1E2D40]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-[#F1F5F9] flex items-center justify-between">
                        <span>{isFa ? st.nameFa : st.name}</span>
                        {isClaimed && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                            {isFa ? 'احراز شده ✓' : 'Claimed ✓'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#94A3B8] mt-1">
                        {isFa ? st.requirementsFa : st.requirements}
                      </div>
                    </div>

                    {!isClaimed && onClaimSpecialTitle && (
                      <button
                        type="button"
                        disabled={!st.canClaim}
                        onClick={() => onClaimSpecialTitle(st.id)}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          st.canClaim
                            ? 'bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0B1118]'
                            : 'bg-[#1E293B] text-[#64748B] cursor-not-allowed'
                        }`}
                      >
                        {st.canClaim
                          ? isFa ? 'تاج‌گذاری و اعلام این مقام!' : 'Claim This Title!'
                          : isFa ? 'شرایط کامل نیست' : 'Conditions Unmet'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Intrigue & Dark Plots */}
          {onExecutePlot && (
            <div className="p-4 rounded-2xl bg-[#131D2B] border border-rose-500/30 space-y-3">
              <div className="font-saga text-lg font-bold text-rose-200 flex items-center gap-2">
                <Skull className="w-5 h-5 text-rose-400" />
                <span>{isFa ? 'توطئه‌ها و دسیسه‌های درباری' : 'Intrigue & Dark Plots'}</span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                {isFa
                  ? 'عملیات مخفیانه با ریسک بالا؛ افشای آن موجب رسوایی و کینه خونی می‌شود.'
                  : 'High-risk covert actions. Discovery leads to public dishonor, feud, or Thing outlawry.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={state.realm.silver < 32}
                  onClick={() => onExecutePlot('assassination')}
                  className="p-3 rounded-xl bg-[#0B1118] border border-rose-500/40 hover:border-rose-400 text-start space-y-1 cursor-pointer disabled:opacity-40"
                >
                  <div className="font-bold text-xs text-rose-300">
                    🗡️ {isFa ? 'ترور شبانه رقیب (۳۲ نقره)' : 'Night Assassination (32 Silv)'}
                  </div>
                  <div className="text-[11px] text-[#94A3B8]">
                    {isFa ? 'آدم‌کش اجیرشده برای قتل سردار یا دشمن خونی' : 'Hired shadow-blade strikes rival in the dark'}
                  </div>
                </button>

                <button
                  type="button"
                  disabled={state.realm.silver < 22}
                  onClick={() => onExecutePlot('poisoning')}
                  className="p-3 rounded-xl bg-[#0B1118] border border-emerald-500/40 hover:border-emerald-400 text-start space-y-1 cursor-pointer disabled:opacity-40"
                >
                  <div className="font-bold text-xs text-emerald-300">
                    🧪 {isFa ? 'زهر شوکران در جام (۲۲ نقره)' : 'Poison Mead Horn (22 Silv)'}
                  </div>
                  <div className="text-[11px] text-[#94A3B8]">
                    {isFa ? 'ریختن سم شوکران در جام بزم رقیب' : 'Distil hemlock to cause quiet heart failure'}
                  </div>
                </button>

                <button
                  type="button"
                  disabled={state.realm.silver < 25}
                  onClick={() => onExecutePlot('bribe_thing')}
                  className="p-3 rounded-xl bg-[#0B1118] border border-amber-500/40 hover:border-amber-400 text-start space-y-1 cursor-pointer disabled:opacity-40"
                >
                  <div className="font-bold text-xs text-amber-300">
                    ⚖️ {isFa ? 'رشوه به شورای ثینگ (۲۵ نقره)' : 'Bribe Thing Speaker (25 Silv)'}
                  </div>
                  <div className="text-[11px] text-[#94A3B8]">
                    {isFa ? 'تطمیع سخنگوی قانون و تبرئه از تبعید و جرم' : 'Weigh silver rings to clear outlawry & win rulings'}
                  </div>
                </button>

                <button
                  type="button"
                  disabled={state.realm.hirdWarriors < 15}
                  onClick={() => onExecutePlot('mass_reprisal')}
                  className="p-3 rounded-xl bg-[#0B1118] border border-fuchsia-500/40 hover:border-fuchsia-400 text-start space-y-1 cursor-pointer disabled:opacity-40"
                >
                  <div className="font-bold text-xs text-fuchsia-300">
                    🔥 {isFa ? 'سرکوب قاطع توطئه‌گران' : 'Mass Reprisal (St Brice Style)'}
                  </div>
                  <div className="text-[11px] text-[#94A3B8]">
                    {isFa ? 'سرکوب خونین بومیان و صفر کردن ناآرامی (-۱۸ شرافت)' : 'Preemptive terror wipeouts unrest to 0% (-18 Honor)'}
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
