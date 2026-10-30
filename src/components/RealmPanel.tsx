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
  MilitaryPurchaseAction,
  PlotType,
  TributeBurden,
} from '../types/game';
import { NorseCornerOrnament } from './NorseMotifs';

interface RealmPanelProps {
  state: FullGameState;
  initialSection?: 'holdings' | 'fleet' | 'politics' | 'intrigue';
  onClaimRank: () => void;
  onBuildShipOrHird: (action: MilitaryPurchaseAction) => void;
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
  const [fleetCategory, setFleetCategory] = useState<'all' | 'soldiers' | 'ships' | 'stables'>('all');
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
      <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-[#111A26] border border-[#233246]">
        <button
          type="button"
          onClick={() => setTab('holdings')}
          className={`min-h-[44px] px-2 py-2 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            tab === 'holdings'
              ? 'bg-[#F59E0B] text-[#0B1118]'
              : 'text-[#CBD5E1] hover:text-[#F1F5F9] hover:bg-[#162232]'
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
              : 'text-[#CBD5E1] hover:text-[#F1F5F9] hover:bg-[#162232]'
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
              ? 'bg-[#F59E0B] text-[#0B1118]'
              : 'text-[#CBD5E1] hover:text-[#F1F5F9] hover:bg-[#162232]'
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
            <div className="p-2.5 rounded-xl bg-[#131D2B] border border-emerald-500/35 space-y-1">
              <div className="text-emerald-400 font-bold flex items-center justify-between">
                <span>{isFa ? 'سپاه شما' : 'Your Warband'}</span>
                <span className="font-mono">{state.activeBattle.playerWarriors}</span>
              </div>
              <div className="text-[11px] text-[#94A3B8]">
                {isFa ? `روحیه: ${state.activeBattle.playerMorale}٪` : `Morale: ${state.activeBattle.playerMorale}%`}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#131D2B] border border-rose-500/35 space-y-1">
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
          <div className="p-3 rounded-xl bg-[#111A26] border border-[#233246] text-xs font-mono text-[#CBD5E1] space-y-1 max-h-24 overflow-y-auto">
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
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#162232] border border-[#233246] hover:border-[#38BDF8] text-[#38BDF8] cursor-pointer"
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
                    <div className="w-full h-2 rounded-full bg-[#182638] overflow-hidden">
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
                      <div className="flex items-center gap-1 bg-[#162232] px-2 py-1 rounded-xl border border-[#233246]">
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
                                : 'bg-[#162232] text-[#94A3B8] hover:text-[#F1F5F9]'
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

      {/* TAB 2: FLEET, WARBAND, SHIPYARD & STABLES (SLEEK MINIMALIST COMMAND) */}
      {tab === 'fleet' && (() => {
        const totalGarrison = state.realm.holdings.reduce(
          (sum, h) => sum + (h.garrison ?? 4),
          0
        );
        const totalShips = state.realm.longships + state.realm.knarrs;
        const snekkjasCount = state.realm.snekkjas ?? 0;
        const drakkarsCount = Math.max(0, state.realm.longships - snekkjasCount);
        const bondiCount = state.realm.bondiSpearmen ?? 0;
        const archersCount = state.realm.norseArchers ?? 0;
        const berserkersCount = state.realm.berserkers ?? 0;
        const huscarlsCount = Math.max(
          0,
          state.realm.hirdWarriors - bondiCount - archersCount - berserkersCount
        );
        const warhorsesCount = state.realm.warhorses ?? 0;
        const packHorsesCount = state.realm.packHorses ?? 0;
        const totalHorses = warhorsesCount + packHorsesCount;
        const warGearTier = state.realm.warGearTier ?? 0;

        const sealiftCapacity = drakkarsCount * 30 + snekkjasCount * 20;
        const sealiftUsagePct =
          sealiftCapacity > 0
            ? Math.min(100, Math.round((state.realm.hirdWarriors / sealiftCapacity) * 100))
            : state.realm.hirdWarriors > 0
              ? 100
              : 0;
        const combatPower = Math.round(
          state.realm.hirdWarriors * 2 +
            berserkersCount * 1.5 +
            archersCount * 1 +
            state.realm.longships * 12 +
            warhorsesCount * 2 +
            warGearTier * 10 +
            state.character.skills.combat +
            (state.ragnarBloodline ? 12 : 0)
        );
        const raidReady = state.realm.longships >= 1 && state.realm.hirdWarriors >= 1;
        const siegeReady = state.realm.longships >= 1 && state.realm.hirdWarriors >= 12;

        const showSoldiers = fleetCategory === 'all' || fleetCategory === 'soldiers';
        const showShips = fleetCategory === 'all' || fleetCategory === 'ships';
        const showStables = fleetCategory === 'all' || fleetCategory === 'stables';

        return (
          <div className="flex flex-col overflow-hidden space-y-4">
            {/* Minimalist Tactical Command Overview Header */}
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-[#102338] via-[#131D2B] to-[#0F1722] border border-[#38BDF8]/40 space-y-3.5 overflow-hidden">
              <NorseCornerOrnament accent="ice" />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-[#38BDF8]/15 text-[#38BDF8] ring-1 ring-[#38BDF8]/35 flex items-center justify-center shrink-0">
                    <Ship className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-saga text-lg sm:text-xl font-bold text-[#F1F5F9] leading-snug">
                        {isFa
                          ? 'فرماندهی سپاه، کشتی‌سازی و اصطبل'
                          : 'Warband, Shipyard & Stables'}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          siegeReady
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                            : raidReady
                              ? 'bg-[#38BDF8]/15 text-[#7DD3FC] border-[#38BDF8]/35'
                              : 'bg-rose-500/15 text-rose-300 border-rose-500/35'
                        }`}
                      >
                        {siegeReady
                          ? isFa
                            ? 'آماده فتح و محاصره'
                            : 'Siege Ready'
                          : raidReady
                            ? isFa
                              ? 'آماده یورش دریایی'
                              : 'Raid Ready'
                            : isFa
                              ? 'نیازمند تجهیز'
                              : 'Needs Forces'}
                      </span>
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      {isFa
                        ? `رزم ${state.character.skills.combat} · دریانوردی ${state.character.skills.seamanship} · سطح زره ${warGearTier}${boathouseActive ? ' · اسکله فعال ✓' : ''}`
                        : `Combat ${state.character.skills.combat} · Sailing ${state.character.skills.seamanship} · Armory Lv.${warGearTier}${boathouseActive ? ' · Dock Active ✓' : ''}`}
                    </p>
                  </div>
                </div>

                {/* Top Right Treasury vs Upkeep Pill */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="px-3 py-1.5 rounded-xl bg-[#111A26] border border-[#233246] text-end font-mono tabular-nums">
                    <div className="text-[10px] text-[#94A3B8]">
                      {isFa ? 'خزانه / نگهداری سالانه' : 'Treasury / Upkeep'}
                    </div>
                    <div className="text-xs font-bold flex items-center justify-end gap-1.5 mt-0.5">
                      <span className="text-[#F59E0B]">
                        {state.realm.silver} {isFa ? 'نقره' : 'Ag'}
                      </span>
                      <span className="text-[#64748B]">·</span>
                      <span className="text-rose-400">
                        -{totalUpkeep}/{isFa ? 'سال' : 'yr'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4-Column Minimalist Telemetry Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 rounded-xl bg-[#111A26] border border-[#233246] flex flex-col justify-between">
                  <span className="text-[11px] text-[#94A3B8]">
                    {isFa ? 'قدرت رزمی کل' : 'Combat Power'}
                  </span>
                  <div className="flex items-baseline justify-between gap-1 mt-1">
                    <span className="text-lg font-mono font-extrabold tabular-nums text-[#F59E0B]">
                      {combatPower}
                    </span>
                    <span className="text-[10px] text-[#CBD5E1]">
                      {warGearTier > 0
                        ? isFa
                          ? `زره +${warGearTier * 10}`
                          : `Gear +${warGearTier * 10}`
                        : isFa
                          ? 'شاخص نبرد'
                          : 'Rating'}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#111A26] border border-[#233246] flex flex-col justify-between">
                  <span className="text-[11px] text-[#94A3B8]">
                    {isFa ? 'کل سربازان سپاه' : 'Active Warband'}
                  </span>
                  <div className="flex items-baseline justify-between gap-1 mt-1">
                    <span className="text-lg font-mono font-extrabold tabular-nums text-[#F1F5F9]">
                      {state.realm.hirdWarriors}
                    </span>
                    <span className="text-[10px] text-[#94A3B8]">
                      {isFa ? `+${totalGarrison} در پادگان` : `+${totalGarrison} garrison`}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#111A26] border border-[#233246] flex flex-col justify-between">
                  <span className="text-[11px] text-[#94A3B8]">
                    {isFa ? 'ناوگان دریایی' : 'Naval Fleet'}
                  </span>
                  <div className="flex items-baseline justify-between gap-1 mt-1">
                    <span className="text-lg font-mono font-extrabold tabular-nums text-[#38BDF8]">
                      {totalShips}
                    </span>
                    <span className="text-[10px] text-[#94A3B8]">
                      {isFa
                        ? `${state.realm.longships} جنگی · ${state.realm.knarrs} تجاری`
                        : `${state.realm.longships} War · ${state.realm.knarrs} Trade`}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#111A26] border border-[#233246] flex flex-col justify-between">
                  <span className="text-[11px] text-[#94A3B8]">
                    {isFa ? 'اسب‌ها و ظرفیت حمل' : 'Horses & Sealift'}
                  </span>
                  <div className="flex items-baseline justify-between gap-1 mt-1">
                    <span className="text-lg font-mono font-extrabold tabular-nums text-emerald-400">
                      {totalHorses}
                    </span>
                    <span className="text-[10px] text-[#94A3B8]">
                      {isFa
                        ? `ظرفیت کشتی: ${sealiftCapacity}`
                        : `Ship cap: ${sealiftCapacity}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Minimal Sealift & Readiness Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#CBD5E1]">
                    {isFa
                      ? `ظرفیت حمل دریایی سپاه (${state.realm.hirdWarriors} از ${sealiftCapacity} جنگجو)`
                      : `Fleet Troop Sealift (${state.realm.hirdWarriors} / ${sealiftCapacity} warriors)`}
                  </span>
                  <span className="font-mono font-bold text-[#38BDF8] tabular-nums">
                    {sealiftCapacity > 0
                      ? `${sealiftUsagePct}%`
                      : isFa
                        ? 'نیازمند ساخت کشتی جنگی'
                        : 'Build a Warship'}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#090E15] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      sealiftCapacity === 0
                        ? 'bg-rose-500'
                        : state.realm.hirdWarriors > sealiftCapacity
                          ? 'bg-[#F59E0B]'
                          : 'bg-gradient-to-r from-[#38BDF8] to-emerald-400'
                    }`}
                    style={{ width: `${sealiftCapacity === 0 ? 15 : sealiftUsagePct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Sleek Minimalist Sub-Category Filter Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-[#111A26] border border-[#233246]">
              {[
                {
                  id: 'all' as const,
                  labelFa: 'همه بخش‌ها',
                  labelEn: 'All Forces',
                  badge: `${state.realm.hirdWarriors + totalShips + totalHorses}`,
                },
                {
                  id: 'soldiers' as const,
                  labelFa: 'سربازان و گارد',
                  labelEn: 'Soldiers',
                  badge: `${state.realm.hirdWarriors}`,
                },
                {
                  id: 'ships' as const,
                  labelFa: 'کارگاه کشتی‌سازی',
                  labelEn: 'Shipyard',
                  badge: `${totalShips}`,
                },
                {
                  id: 'stables' as const,
                  labelFa: 'اصطبل و اسلحه‌خانه',
                  labelEn: 'Horses & Gear',
                  badge: `${totalHorses}`,
                },
              ].map((cat) => {
                const active = fleetCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFleetCategory(cat.id)}
                    className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between gap-1.5 cursor-pointer transition-all ${
                      active
                        ? 'bg-[#19283B] text-[#F1F5F9] border border-[#38BDF8]/50 shadow-sm'
                        : 'text-[#94A3B8] hover:text-[#F1F5F9] border border-transparent'
                    }`}
                  >
                    <span className="truncate">{isFa ? cat.labelFa : cat.labelEn}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md font-mono text-[10px] tabular-nums ${
                        active
                          ? 'bg-[#38BDF8]/20 text-[#38BDF8]'
                          : 'bg-[#131D2B] text-[#64748B]'
                      }`}
                    >
                      {cat.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ========================================================= */}
            {/* SECTION 1: SOLDIERS & VIKING WARBAND ARCHETYPES           */}
            {/* ========================================================= */}
            {showSoldiers && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Swords className="w-4 h-4 text-[#F59E0B]" />
                    <h4 className="font-saga text-sm sm:text-base font-bold text-[#F1F5F9]">
                      {isFa
                        ? 'سربازگیری و واحدهای رزمی وایکینگ'
                        : 'Viking Warband & Soldier Recruitment'}
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#94A3B8] font-mono">
                    {isFa
                      ? `مجموع سپاه همراه: ${state.realm.hirdWarriors} نفر`
                      : `Total Active: ${state.realm.hirdWarriors} men`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* SOLDIER 1: BONDI LEVY SPEARMEN */}
                  <div className="p-4 rounded-2xl bg-[#131D2B] border border-[#233246] hover:border-[#38BDF8]/55 flex flex-col justify-between gap-3 transition-colors">
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/15 border border-[#38BDF8]/35 text-[#38BDF8] flex items-center justify-center shrink-0">
                            {/* Minimalist Norse Spear & Round Shield SVG */}
                            <svg
                              viewBox="0 0 24 24"
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 19L19 5" />
                              <path d="M15 5h4v4" />
                              <circle cx="11" cy="13" r="5" className="fill-[#131D2B]" />
                              <circle cx="11" cy="13" r="5" />
                              <circle cx="11" cy="13" r="1.5" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-[#F1F5F9] truncate">
                              {isFa ? 'نیزه‌داران آزاد (بوندِه)' : 'Bondi Levy Spearmen'}
                            </div>
                            <div className="text-[11px] text-[#38BDF8] font-medium">
                              {isFa ? 'پیاده‌نظام سبک و پادگان' : 'Light Shield-Levy'}
                            </div>
                          </div>
                        </div>
                        <div className="text-end font-mono tabular-nums shrink-0">
                          <div className="text-xl font-extrabold text-[#F1F5F9] leading-none">
                            {bondiCount}
                          </div>
                          <div className="text-[10px] text-[#94A3B8] mt-0.5">
                            {isFa ? 'نفر' : 'men'}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-[#94A3B8] leading-relaxed">
                        {isFa
                          ? 'مردان آزاد مسلح به نیزه زبان‌گنجشک و سپر چوبی؛ کم‌هزینه‌ترین نیرو برای پر کردن صفوف و نگهبانی از املاک.'
                          : 'Freemen armed with ash-spears and wooden shields; economical troops for swelling ranks and holding garrisons.'}
                      </p>

                      <div className="pt-2 border-t border-[#1E2D40] flex items-center justify-between text-[11px] font-mono text-[#CBD5E1]">
                        <span>{isFa ? 'دسته: +۵ جنگجو' : 'Batch: +5 Warriors'}</span>
                        <span className="text-[#38BDF8]">
                          {isFa ? 'قدرت پایه: +۱۰' : 'Power: +10'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={state.realm.silver < 12}
                      onClick={() => onBuildShipOrHird('recruit_bondi')}
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-[#38BDF8] hover:bg-[#7DD3FC] active:scale-[0.99] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#0B1118] text-xs font-extrabold flex items-center justify-between gap-2 cursor-pointer transition-all"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Plus className="w-4 h-4 shrink-0" />
                        <span>{isFa ? 'جذب ۵ نیزه‌دار بوندِه' : 'Recruit 5 Bondi'}</span>
                      </span>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-[#0B1118]/15">
                        {isFa ? '۱۲ نقره' : '12 Ag'}
                      </span>
                    </button>
                  </div>

                  {/* SOLDIER 2: SWORN HUSCARLS & HIRD */}
                  <div className="p-4 rounded-2xl bg-[#131D2B] border border-[#233246] hover:border-[#F59E0B]/60 flex flex-col justify-between gap-3 transition-colors">
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/35 text-[#F59E0B] flex items-center justify-center shrink-0">
                            {/* Minimalist Crossed Dane-Axes & Boss Shield SVG */}
                            <svg
                              viewBox="0 0 24 24"
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M4 20L20 4M4 4l16 16" />
                              <circle cx="12" cy="12" r="6" className="fill-[#131D2B]" />
                              <circle cx="12" cy="12" r="6" />
                              <circle cx="12" cy="12" r="2" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-[#F1F5F9] truncate">
                              {isFa ? 'هوسکارل‌های سپردار (هیرد)' : 'Sworn Huscarls (Hird)'}
                            </div>
                            <div className="text-[11px] text-[#F59E0B] font-medium">
                              {isFa ? 'گارد زبده دیوار سپرها' : 'Heavy Shield-Wall Elite'}
                            </div>
                          </div>
                        </div>
                        <div className="text-end font-mono tabular-nums shrink-0">
                          <div className="text-xl font-extrabold text-[#F59E0B] leading-none">
                            {huscarlsCount}
                          </div>
                          <div className="text-[10px] text-[#94A3B8] mt-0.5">
                            {isFa ? 'نفر' : 'men'}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-[#94A3B8] leading-relaxed">
                        {isFa
                          ? 'جنگجویان حرفه‌ای با تبرهای دانمارکی و زره؛ ستون اصلی یورش‌ها و شکستن دروازه شهرها (+۱ مهارت رزم).'
                          : 'Veteran household guards with Dane-axes; backbone of the Skjaldborg shield-wall and city sieges (+1 Combat).'}
                      </p>

                      <div className="pt-2 border-t border-[#1E2D40] flex items-center justify-between text-[11px] font-mono text-[#CBD5E1]">
                        <span>{isFa ? 'دسته: +۶ هوسکارل' : 'Batch: +6 Huscarls'}</span>
                        <span className="text-[#F59E0B]">
                          {isFa ? 'رزم +۱ · قدرت +۱۲' : 'Combat +1 · Pwr +12'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={state.realm.silver < 18}
                      onClick={() => onBuildShipOrHird('recruit_hird')}
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] active:scale-[0.99] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#0B1118] text-xs font-extrabold flex items-center justify-between gap-2 cursor-pointer transition-all"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Plus className="w-4 h-4 shrink-0" />
                        <span>{isFa ? 'استخدام ۶ هوسکارل' : 'Recruit 6 Huscarls'}</span>
                      </span>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-[#0B1118]/15">
                        {isFa ? '۱۸ نقره' : '18 Ag'}
                      </span>
                    </button>
                  </div>

                  {/* SOLDIER 3: NORSE YEW-BOWMEN (ARCHERS) */}
                  <div className="p-4 rounded-2xl bg-[#131D2B] border border-[#233246] hover:border-emerald-400/60 flex flex-col justify-between gap-3 transition-colors">
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 flex items-center justify-center shrink-0">
                            {/* Minimalist Norse Longbow & Arrow SVG */}
                            <svg
                              viewBox="0 0 24 24"
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 4c7 4 7 12 0 16" />
                              <path d="M5 4v16" />
                              <path d="M4 12h16" />
                              <path d="M16 8l4 4-4 4" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-[#F1F5F9] truncate">
                              {isFa ? 'کمانداران شکاری شمال' : 'Norse Yew-Bowmen'}
                            </div>
                            <div className="text-[11px] text-emerald-400 font-medium">
                              {isFa ? 'پشتیبانی تیرباران و کمین' : 'Ranged Volley & Skirmish'}
                            </div>
                          </div>
                        </div>
                        <div className="text-end font-mono tabular-nums shrink-0">
                          <div className="text-xl font-extrabold text-emerald-400 leading-none">
                            {archersCount}
                          </div>
                          <div className="text-[10px] text-[#94A3B8] mt-0.5">
                            {isFa ? 'نفر' : 'men'}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-[#94A3B8] leading-relaxed">
                        {isFa
                          ? 'تیراندازان ماهر با کمان‌های چوب سرخدار که پیش از نبرد تن‌به‌تن، عرشه کشتی‌ها و باروی قلعه‌ها را تیرباران می‌کنند.'
                          : 'Sharpshooters with heavy yew longbows who rain broadhead arrows upon enemy decks and ramparts before the clash.'}
                      </p>

                      <div className="pt-2 border-t border-[#1E2D40] flex items-center justify-between text-[11px] font-mono text-[#CBD5E1]">
                        <span>{isFa ? 'دسته: +۵ کماندار' : 'Batch: +5 Bowmen'}</span>
                        <span className="text-emerald-400">
                          {isFa ? 'رزم +۲ · ذکاوت +۲' : 'Combat +2 · Cunning +2'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={state.realm.silver < 20}
                      onClick={() => onBuildShipOrHird('recruit_archers')}
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-[#34D399] hover:bg-[#6EE7B7] active:scale-[0.99] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#0B1118] text-xs font-extrabold flex items-center justify-between gap-2 cursor-pointer transition-all"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Plus className="w-4 h-4 shrink-0" />
                        <span>{isFa ? 'استخدام ۵ کماندار' : 'Recruit 5 Bowmen'}</span>
                      </span>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-[#0B1118]/15">
                        {isFa ? '۲۰ نقره' : '20 Ag'}
                      </span>
                    </button>
                  </div>

                  {/* SOLDIER 4: BERSERKERS & ULFHEDNAR */}
                  <div className="p-4 rounded-2xl bg-[#131D2B] border border-[#233246] hover:border-rose-500/60 flex flex-col justify-between gap-3 transition-colors">
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-400 flex items-center justify-center shrink-0">
                            <Flame className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-[#F1F5F9] truncate">
                              {isFa ? 'برزرکرها و اولف‌هدنار' : 'Berserkers & Ulfhednar'}
                            </div>
                            <div className="text-[11px] text-rose-400 font-medium">
                              {isFa ? 'جنگجویان خشم اودین (خط‌شکن)' : 'Shock Terror Champions'}
                            </div>
                          </div>
                        </div>
                        <div className="text-end font-mono tabular-nums shrink-0">
                          <div className="text-xl font-extrabold text-rose-400 leading-none">
                            {berserkersCount}
                          </div>
                          <div className="text-[10px] text-[#94A3B8] mt-0.5">
                            {isFa ? 'نفر' : 'men'}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-[#94A3B8] leading-relaxed">
                        {isFa
                          ? 'دلاوران بی‌باک در پوست خرس و گرگ که بدون ترس از مرگ، دیوار سپرهای دشمن را متلاشی می‌کنند (+۳ قدرت بدنی و +۸ شهرت).'
                          : 'Bear-coat and wolf-skin shock warriors whose furious charge shatters enemy shield-walls (+3 Strength, +8 Fame).'}
                      </p>

                      <div className="pt-2 border-t border-[#1E2D40] flex items-center justify-between text-[11px] font-mono text-[#CBD5E1]">
                        <span>{isFa ? 'دسته: +۴ برزرکر' : 'Batch: +4 Berserkers'}</span>
                        <span className="text-rose-400">
                          {isFa ? 'قدرت +۳ · شهرت +۸' : 'Str +3 · Fame +8'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={state.realm.silver < 28}
                      onClick={() => onBuildShipOrHird('recruit_berserkers')}
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 active:scale-[0.99] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#0B1118] text-xs font-extrabold flex items-center justify-between gap-2 cursor-pointer transition-all"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Plus className="w-4 h-4 shrink-0" />
                        <span>{isFa ? 'جذب ۴ برزرکر خشمگین' : 'Recruit 4 Berserkers'}</span>
                      </span>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-[#0B1118]/15">
                        {isFa ? '۲۸ نقره' : '28 Ag'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* SECTION 2: NAVAL SHIPYARD (3 VIKING VESSEL CLASSES)       */}
            {/* ========================================================= */}
            {showShips && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Ship className="w-4 h-4 text-[#38BDF8]" />
                    <h4 className="font-saga text-sm sm:text-base font-bold text-[#F1F5F9]">
                      {isFa
                        ? 'کارگاه کشتی‌سازی و ناوگان دریایی'
                        : 'Naval Shipyard & Vessel Construction'}
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#94A3B8] font-mono">
                    {isFa
                      ? `${state.realm.longships} جنگی · ${state.realm.knarrs} تجاری`
                      : `${state.realm.longships} Warships · ${state.realm.knarrs} Knarrs`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* SHIP 1: SWIFT SNEKKJA SCOUT WAR-GALLEY */}
                  <div className="p-4 rounded-2xl bg-[#131D2B] border border-[#233246] hover:border-cyan-400/60 flex flex-col justify-between gap-3 transition-colors">
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/35 text-cyan-400 flex items-center justify-center shrink-0">
                          <svg
                            viewBox="0 0 24 24"
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 16c3 2 15 2 18 0l1-3H4l-1 3z" />
                            <path d="M12 6v7" />
                            <path d="M9 8h6l-1 4H10L9 8z" />
                          </svg>
                        </div>
                        <div className="text-end font-mono tabular-nums">
                          <div className="text-xl font-extrabold text-cyan-400 leading-none">
                            {snekkjasCount}
                          </div>
                          <div className="text-[10px] font-semibold text-cyan-300 mt-0.5">
                            {isFa ? 'اسنکیا تندرو' : 'Swift Snekkja'}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="font-bold text-sm text-[#F1F5F9]">
                          {isFa ? 'کشتی گشتی اسنکیا' : 'Snekkja Raider'}
                        </div>
                        <p className="text-xs text-[#94A3B8] leading-relaxed mt-0.5">
                          {isFa
                            ? 'کشتی باریک و چابک با ۲۰ پاروزن؛ عالی برای شبیخون سحرگاهی، رودخانه‌های کم‌عمق و افزایش مهارت دریانوردی (+۲).'
                            : 'Light, shallow-draft 20-oar warship ideal for river strikes, dawn ambushes (+6 Raid) & +2 Seamanship.'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#1E2D40] flex items-center justify-between text-[11px] font-mono text-[#CBD5E1]">
                        <span>{isFa ? 'ظرفیت: ۲۰ جنگجو' : 'Cap: 20 men'}</span>
                        <span className="text-cyan-400">
                          {isFa ? 'دریانوردی +۲' : 'Sailing +2'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={state.realm.silver < 32}
                      onClick={() => onBuildShipOrHird('build_snekkja')}
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 active:scale-[0.99] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#0B1118] text-xs font-extrabold flex items-center justify-between gap-2 cursor-pointer transition-all"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Plus className="w-4 h-4 shrink-0" />
                        <span>{isFa ? 'ساخت اسنکیا' : 'Build Snekkja'}</span>
                      </span>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-[#0B1118]/15">
                        {isFa ? '۳۲ نقره' : '32 Ag'}
                      </span>
                    </button>
                  </div>

                  {/* SHIP 2: DRAGON LONGSHIP (DRAKKAR) */}
                  <div className="p-4 rounded-2xl bg-[#131D2B] border border-[#233246] hover:border-[#38BDF8]/60 flex flex-col justify-between gap-3 transition-colors">
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/15 border border-[#38BDF8]/35 text-[#38BDF8] flex items-center justify-center shrink-0">
                          <svg
                            viewBox="0 0 24 24"
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 15c2.5 2.5 15.5 2.5 18 0l1.5-4.5c-1.5 0-2.5 1-3.5 2H5c-1-1-1.5-2.5-1.5-4.5 0-1.5 1-2.5 2-2.5" />
                            <path d="M12 4v11" />
                            <path d="M8 7h8l-1 5H9L8 7z" />
                          </svg>
                        </div>
                        <div className="text-end font-mono tabular-nums">
                          <div className="text-xl font-extrabold text-[#38BDF8] leading-none">
                            {drakkarsCount}
                          </div>
                          <div className="text-[10px] font-semibold text-[#7DD3FC] mt-0.5">
                            {isFa ? 'لانگ‌شیپ اژدهانشان' : 'Dragon Drakkar'}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="font-bold text-sm text-[#F1F5F9]">
                          {isFa ? 'ناو جنگی دراکار (لانگ‌شیپ)' : 'Dragon Longship'}
                        </div>
                        <p className="text-xs text-[#94A3B8] leading-relaxed mt-0.5">
                          {isFa
                            ? 'ناو سرفرماندهی با سرِ اژدهای منبت‌کاری‌شده؛ حمل ۳۰ جنگجو، +۱۵ شهرت و قدرت محاصره بالا.'
                            : 'Flagship dragon warship carrying 30 warriors; grants +15 Fame, +3 Craft & heavy siege power.'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#1E2D40] flex items-center justify-between text-[11px] font-mono text-[#CBD5E1]">
                        <span>{isFa ? 'ظرفیت: ۳۰ جنگجو' : 'Cap: 30 men'}</span>
                        <span className="text-[#38BDF8]">
                          {isFa ? 'شهرت +۱۵' : 'Fame +15'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={state.realm.silver < 55}
                      onClick={() => onBuildShipOrHird('build_longship')}
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-[#38BDF8] hover:bg-[#7DD3FC] active:scale-[0.99] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#0B1118] text-xs font-extrabold flex items-center justify-between gap-2 cursor-pointer transition-all"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Plus className="w-4 h-4 shrink-0" />
                        <span>{isFa ? 'ساخت لانگ‌شیپ' : 'Launch Longship'}</span>
                      </span>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-[#0B1118]/15">
                        {isFa ? '۵۵ نقره' : '55 Ag'}
                      </span>
                    </button>
                  </div>

                  {/* SHIP 3: OCEAN TRADE KNARR */}
                  <div className="p-4 rounded-2xl bg-[#131D2B] border border-[#233246] hover:border-emerald-400/60 flex flex-col justify-between gap-3 transition-colors">
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 flex items-center justify-center shrink-0">
                          <Anchor className="w-5 h-5" />
                        </div>
                        <div className="text-end font-mono tabular-nums">
                          <div className="text-xl font-extrabold text-emerald-400 leading-none">
                            {state.realm.knarrs}
                          </div>
                          <div className="text-[10px] font-semibold text-emerald-300 mt-0.5">
                            {isFa ? 'کِنار اقیانوس‌پیما' : 'Merchant Knarr'}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="font-bold text-sm text-[#F1F5F9]">
                          {isFa ? 'کشتی تجاری کِنار' : 'Ocean Trade Knarr'}
                        </div>
                        <p className="text-xs text-[#94A3B8] leading-relaxed mt-0.5">
                          {isFa
                            ? 'کشتی پهن‌پیکر و مقاوم در برابر طوفان برای گشودن مسیرهای تجاری جدید (+۱ مسیر) و افزایش سود سالانه.'
                            : 'Broad-hulled ocean cargo ship that reduces storm peril and opens +1 active Trade Network.'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#1E2D40] flex items-center justify-between text-[11px] font-mono text-[#CBD5E1]">
                        <span>
                          {isFa
                            ? `سود تجارت: +${state.realm.knarrs * 18}٪`
                            : `Trade: +${state.realm.knarrs * 18}%`}
                        </span>
                        <span className="text-emerald-400">
                          {isFa ? '+۱ مسیر تجاری' : '+1 Trade Route'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={state.realm.silver < 45}
                      onClick={() => onBuildShipOrHird('build_knarr')}
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-[#34D399] hover:bg-[#6EE7B7] active:scale-[0.99] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#0B1118] text-xs font-extrabold flex items-center justify-between gap-2 cursor-pointer transition-all"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Plus className="w-4 h-4 shrink-0" />
                        <span>{isFa ? 'ساخت کِنار تجاری' : 'Launch Knarr'}</span>
                      </span>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-[#0B1118]/15">
                        {isFa ? '۴۵ نقره' : '45 Ag'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* SECTION 3: STABLES, HORSES & ROYAL ARMORY                 */}
            {/* ========================================================= */}
            {showStables && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <h4 className="font-saga text-sm sm:text-base font-bold text-[#F1F5F9]">
                      {isFa
                        ? 'اصطبل سلطنتی، خرید اسب و اسلحه‌خانه'
                        : 'Royal Stables, Horses & Forged Armory'}
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#94A3B8] font-mono">
                    {isFa
                      ? `${totalHorses} راس اسب · سطح زره ${warGearTier}`
                      : `${totalHorses} Horses · Gear Lv.${warGearTier}`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* STABLE 1: NORSE WARHORSES */}
                  <div className="p-4 rounded-2xl bg-[#131D2B] border border-[#233246] hover:border-amber-400/60 flex flex-col justify-between gap-3 transition-colors">
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-400 flex items-center justify-center shrink-0">
                          {/* Minimalist Norse Stallion Head SVG */}
                          <svg
                            viewBox="0 0 24 24"
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M7 20v-5l-2-3 2-5 4-3 5 1 2 4-4 2-1 3 3 2v4H7z" />
                            <circle cx="13.5" cy="7.5" r="0.8" fill="currentColor" />
                          </svg>
                        </div>
                        <div className="text-end font-mono tabular-nums">
                          <div className="text-xl font-extrabold text-amber-400 leading-none">
                            {warhorsesCount}
                          </div>
                          <div className="text-[10px] font-semibold text-amber-300 mt-0.5">
                            {isFa ? 'اسب جنگی نوردیک' : 'War Stallions'}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="font-bold text-sm text-[#F1F5F9]">
                          {isFa ? 'اسب‌های جنگی نوردیک' : 'Norse Warhorses'}
                        </div>
                        <p className="text-xs text-[#94A3B8] leading-relaxed mt-0.5">
                          {isFa
                            ? 'اسب‌های چابک برای پیشروی برق‌آسای سپاه در خشکی، محاصره سریع و تاکتیک فرار ساختگی (+۳ رزم، +۱۰ شهرت).'
                            : 'Sturdy stallions for rapid overland strikes, flanking maneuvers, and +3 Combat & +10 Fame.'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#1E2D40] flex items-center justify-between text-[11px] font-mono text-[#CBD5E1]">
                        <span>{isFa ? 'دسته: +۴ اسب جنگی' : 'Batch: +4 Warhorses'}</span>
                        <span className="text-amber-400">
                          {isFa ? 'قدرت +۸ · رزم +۳' : 'Pwr +8 · Combat +3'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={state.realm.silver < 24}
                      onClick={() => onBuildShipOrHird('buy_warhorses')}
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] active:scale-[0.99] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#0B1118] text-xs font-extrabold flex items-center justify-between gap-2 cursor-pointer transition-all"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Plus className="w-4 h-4 shrink-0" />
                        <span>{isFa ? 'خرید ۴ اسب جنگی' : 'Buy 4 Warhorses'}</span>
                      </span>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-[#0B1118]/15">
                        {isFa ? '۲۴ نقره' : '24 Ag'}
                      </span>
                    </button>
                  </div>

                  {/* STABLE 2: CARAVAN PACK HORSES */}
                  <div className="p-4 rounded-2xl bg-[#131D2B] border border-[#233246] hover:border-teal-400/60 flex flex-col justify-between gap-3 transition-colors">
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/35 text-teal-400 flex items-center justify-center shrink-0">
                          <Coins className="w-5 h-5" />
                        </div>
                        <div className="text-end font-mono tabular-nums">
                          <div className="text-xl font-extrabold text-teal-400 leading-none">
                            {packHorsesCount}
                          </div>
                          <div className="text-[10px] font-semibold text-teal-300 mt-0.5">
                            {isFa ? 'ستور بارکش کاروان' : 'Pack Horses'}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="font-bold text-sm text-[#F1F5F9]">
                          {isFa ? 'اسب‌های بارکش و کاروانی' : 'Caravan Pack Horses'}
                        </div>
                        <p className="text-xs text-[#94A3B8] leading-relaxed mt-0.5">
                          {isFa
                            ? 'ستورهای مقاوم با خورجین‌های چرمی؛ افزایش +۱۰٪ غنیمت یورش‌ها، +۱۲ آذوقه انبار و +۳ مهارت تجارت.'
                            : 'Fjord pack horses that haul +10% extra raid plunder, add +12 Food Stores, and grant +3 Trade.'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#1E2D40] flex items-center justify-between text-[11px] font-mono text-[#CBD5E1]">
                        <span>{isFa ? 'دسته: +۴ اسب بارکش' : 'Batch: +4 Pack Horses'}</span>
                        <span className="text-teal-400">
                          {isFa ? '+۱۲ آذوقه · غنیمت+' : '+12 Food · +Loot'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={state.realm.silver < 16}
                      onClick={() => onBuildShipOrHird('buy_pack_horses')}
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-teal-400 hover:bg-teal-300 active:scale-[0.99] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#0B1118] text-xs font-extrabold flex items-center justify-between gap-2 cursor-pointer transition-all"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Plus className="w-4 h-4 shrink-0" />
                        <span>{isFa ? 'خرید ۴ اسب بارکش' : 'Buy 4 Pack Horses'}</span>
                      </span>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-[#0B1118]/15">
                        {isFa ? '۱۶ نقره' : '16 Ag'}
                      </span>
                    </button>
                  </div>

                  {/* STABLE 3: FORGED RING-MAIL & ULFBERHT ARMORY */}
                  <div className="p-4 rounded-2xl bg-[#131D2B] border border-[#233246] hover:border-violet-400/60 flex flex-col justify-between gap-3 transition-colors">
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/35 text-violet-400 flex items-center justify-center shrink-0">
                          <Hammer className="w-5 h-5" />
                        </div>
                        <div className="text-end font-mono tabular-nums">
                          <div className="text-xl font-extrabold text-violet-400 leading-none">
                            {isFa ? `سطح ${warGearTier}` : `Lv.${warGearTier}`}
                          </div>
                          <div className="text-[10px] font-semibold text-violet-300 mt-0.5">
                            {isFa ? 'زره و فولاد اولف‌برهت' : 'Ulfberht Armory'}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="font-bold text-sm text-[#F1F5F9]">
                          {isFa ? 'زره حلقه‌ای و سلاح فولادی' : 'Ring-Mail & Steel Blades'}
                        </div>
                        <p className="text-xs text-[#94A3B8] leading-relaxed mt-0.5">
                          {isFa
                            ? 'تجهیز سپاه به زره‌های زنجیری، کلاه‌خودهای چشمی و شمشیرهای فولادی آبدیده (+۴ رزم، +۳ قدرت بدنی).'
                            : 'Outfit your champions with riveted ring-mail and crucible steel (+4 Combat, +3 Strength, +10 Power).'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#1E2D40] flex items-center justify-between text-[11px] font-mono text-[#CBD5E1]">
                        <span>{isFa ? 'ارتقا: +۱ سطح زره' : 'Upgrade: +1 Tier'}</span>
                        <span className="text-violet-400">
                          {isFa ? 'رزم +۴ · قدرت +۱۰' : 'Combat +4 · Pwr +10'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={state.realm.silver < 30}
                      onClick={() => onBuildShipOrHird('buy_war_gear')}
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-violet-400 hover:bg-violet-300 active:scale-[0.99] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#0B1118] text-xs font-extrabold flex items-center justify-between gap-2 cursor-pointer transition-all"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Plus className="w-4 h-4 shrink-0" />
                        <span>{isFa ? 'تجهیز زره و سلاح' : 'Forge War-Gear'}</span>
                      </span>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-[#0B1118]/15">
                        {isFa ? '۳۰ نقره' : '30 Ag'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Minimalist Garrison Allocation & Naval Logistics Strip */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#131D2B] border border-[#233246] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-bold text-[#F1F5F9] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#38BDF8]" />
                  <span>
                    {isFa
                      ? 'تدارکات دریایی و تقسیم پادگان شهرها'
                      : 'Naval Logistics & Holding Garrisons'}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                    boathouseActive
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                      : 'bg-[#111A26] text-[#94A3B8] border-[#233246]'
                  }`}
                >
                  {boathouseActive
                    ? isFa
                      ? 'اسکله کشتی‌سازی فعال: ۵۰٪ تخفیف نگهداری ناوگان ✓'
                      : 'Boathouse Active: -50% Fleet Upkeep ✓'
                    : isFa
                      ? 'ساخت «اسکله کشتی‌سازی» در املاک هزینه نگهداری کشتی‌ها را نصف می‌کند'
                      : 'Build a Boathouse in Holdings to halve ship upkeep'}
                </span>
              </div>

              {state.realm.holdings.length > 0 && onStationGarrison && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {state.realm.holdings.map((h) => {
                    const sData = SETTLEMENTS_BY_ID[h.settlementId];
                    const sName = isFa
                      ? SETTLEMENTS_FA[h.settlementId]?.name ?? sData?.name ?? h.settlementId
                      : sData?.name.split(' (')[0] ?? h.settlementId;
                    const unrest = h.unrest ?? 15;
                    return (
                      <div
                        key={h.settlementId}
                        className="px-3 py-2 rounded-xl bg-[#111A26] border border-[#233246] flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#F1F5F9] truncate">{sName}</div>
                          <div className="text-[10px] text-[#94A3B8]">
                            {isFa
                              ? `ناآرامی: ${unrest}٪ · مزارع: ${h.farms}`
                              : `Unrest: ${unrest}% · Farms: ${h.farms}`}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            disabled={(h.garrison ?? 0) <= 0}
                            onClick={() => onStationGarrison(h.settlementId, -2)}
                            className="w-7 h-7 rounded-lg bg-[#162232] hover:bg-[#1E2D40] border border-[#233246] text-[#F1F5F9] flex items-center justify-center cursor-pointer disabled:opacity-30 transition-colors"
                            title={isFa ? 'فراخوانی ۲ جنگجو به سپاه همراه' : 'Withdraw 2 warriors to Hird'}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <div className="min-w-[44px] text-center font-mono text-xs font-bold text-[#38BDF8]">
                            {h.garrison ?? 4}
                          </div>
                          <button
                            type="button"
                            disabled={state.realm.hirdWarriors < 2}
                            onClick={() => onStationGarrison(h.settlementId, 2)}
                            className="w-7 h-7 rounded-lg bg-[#162232] hover:bg-[#1E2D40] border border-[#233246] text-emerald-400 flex items-center justify-center cursor-pointer disabled:opacity-30 transition-colors"
                            title={isFa ? 'اعزام ۲ جنگجو به پادگان این شهر' : 'Station 2 warriors in garrison'}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}

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
                          : 'bg-[#111A26] border-[#233246]'
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
            <div className="p-4 rounded-2xl bg-[#131D2B] border border-[#233246] space-y-3">
              <div className="font-saga text-lg font-bold text-[#F1F5F9] flex items-center gap-2">
                <Skull className="w-5 h-5 text-[#F59E0B]" />
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
                  className="p-3.5 rounded-xl bg-[#111A26] hover:bg-[#162232] border border-[#233246] hover:border-[#F59E0B]/60 text-start space-y-1 cursor-pointer disabled:opacity-40 transition-colors"
                >
                  <div className="font-bold text-xs text-[#F1F5F9] flex items-center justify-between gap-2">
                    <span>🗡️ {isFa ? 'ترور شبانه رقیب' : 'Night Assassination'}</span>
                    <span className="font-mono text-[11px] text-[#F59E0B]">{isFa ? '۳۲ نقره' : '32 Silv'}</span>
                  </div>
                  <div className="text-[11px] text-[#94A3B8]">
                    {isFa ? 'آدم‌کش اجیرشده برای قتل سردار یا دشمن خونی' : 'Hired shadow-blade strikes rival in the dark'}
                  </div>
                </button>

                <button
                  type="button"
                  disabled={state.realm.silver < 22}
                  onClick={() => onExecutePlot('poisoning')}
                  className="p-3.5 rounded-xl bg-[#111A26] hover:bg-[#162232] border border-[#233246] hover:border-[#F59E0B]/60 text-start space-y-1 cursor-pointer disabled:opacity-40 transition-colors"
                >
                  <div className="font-bold text-xs text-[#F1F5F9] flex items-center justify-between gap-2">
                    <span>🧪 {isFa ? 'زهر شوکران در جام' : 'Poison Mead Horn'}</span>
                    <span className="font-mono text-[11px] text-[#F59E0B]">{isFa ? '۲۲ نقره' : '22 Silv'}</span>
                  </div>
                  <div className="text-[11px] text-[#94A3B8]">
                    {isFa ? 'ریختن سم شوکران در جام بزم رقیب' : 'Distil hemlock to cause quiet heart failure'}
                  </div>
                </button>

                <button
                  type="button"
                  disabled={state.realm.silver < 25}
                  onClick={() => onExecutePlot('bribe_thing')}
                  className="p-3.5 rounded-xl bg-[#111A26] hover:bg-[#162232] border border-[#233246] hover:border-[#38BDF8]/60 text-start space-y-1 cursor-pointer disabled:opacity-40 transition-colors"
                >
                  <div className="font-bold text-xs text-[#F1F5F9] flex items-center justify-between gap-2">
                    <span>⚖️ {isFa ? 'رشوه به شورای ثینگ' : 'Bribe Thing Speaker'}</span>
                    <span className="font-mono text-[11px] text-[#38BDF8]">{isFa ? '۲۵ نقره' : '25 Silv'}</span>
                  </div>
                  <div className="text-[11px] text-[#94A3B8]">
                    {isFa ? 'تطمیع سخنگوی قانون و تبرئه از تبعید و جرم' : 'Weigh silver rings to clear outlawry & win rulings'}
                  </div>
                </button>

                <button
                  type="button"
                  disabled={state.realm.hirdWarriors < 15}
                  onClick={() => onExecutePlot('mass_reprisal')}
                  className="p-3.5 rounded-xl bg-[#111A26] hover:bg-[#162232] border border-[#233246] hover:border-rose-500/60 text-start space-y-1 cursor-pointer disabled:opacity-40 transition-colors"
                >
                  <div className="font-bold text-xs text-[#F1F5F9] flex items-center justify-between gap-2">
                    <span>🔥 {isFa ? 'سرکوب قاطع توطئه‌گران' : 'Mass Reprisal'}</span>
                    <span className="font-mono text-[11px] text-rose-400">{isFa ? '۱۵+ جنگجو' : '15+ Hird'}</span>
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
