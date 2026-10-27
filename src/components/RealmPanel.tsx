import { useEffect, useState } from 'react';
import {
  Anchor,
  Castle,
  Check,
  Coins,
  Crown,
  Hammer,
  MapPin,
  Shield,
  Ship,
  Swords,
} from 'lucide-react';
import { SETTLEMENTS_BY_ID } from '../data/geography';
import { BUILDINGS_CATALOG, WIN_GOALS } from '../data/namesAndTraits';
import {
  getClaimableNextTitle,
  getNextTitleRequirementText,
  hasBoathouse,
  isFortifiedEnemyCity,
} from '../engine/gameEngine';
import { BUILDINGS_FA, SETTLEMENTS_FA, WIN_GOALS_FA } from '../i18n/gameDataFa';
import { RELIGION_LABELS, SHORT_TITLE_LABELS, TITLE_LABELS } from '../i18n/ui';
import { BuildingType, FullGameState } from '../types/game';
import { RealmSection } from './MoreMenuPanel';
import { NorseCornerOrnament, RuneDivider } from './NorseMotifs';

interface RealmPanelProps {
  state: FullGameState;
  initialSection?: RealmSection;
  onClaimRank: () => void;
  onBuildShipOrHird: (action: 'recruit_hird' | 'build_longship' | 'build_knarr') => void;
  onBuildHoldingStructure: (settlementId: string, building: BuildingType) => void;
  onClearFirstFarm: () => void;
  onConquerCity?: (settlementId: string) => void;
}

export function RealmPanel({
  state,
  initialSection = 'holdings',
  onClaimRank,
  onBuildShipOrHird,
  onBuildHoldingStructure,
  onClearFirstFarm,
  onConquerCity,
}: RealmPanelProps) {
  const lang = state.settings.language;
  const isFa = lang === 'fa';

  const [section, setSection] = useState<RealmSection>(initialSection);
  const [selectedHoldingId, setSelectedHoldingId] = useState<string>(
    state.realm.holdings[0]?.settlementId ?? ''
  );

  useEffect(() => {
    setSection(initialSection);
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
  const famUsed = state.familyInteractionsUsed ?? {};
  const builtThisYear = Boolean(state.builtThisYear);

  const activeHolding =
    state.realm.holdings.find((h) => h.settlementId === selectedHoldingId) ??
    state.realm.holdings[0];

  return (
    <div className="space-y-4 text-start">
      {/* Clean Segmented Switcher: Holdings vs Fleet */}
      <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-[#0B1118] border border-[#1E2D40]">
        <button
          type="button"
          onClick={() => setSection('holdings')}
          className={`min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            section === 'holdings'
              ? 'bg-[#F59E0B] text-[#0B1118]'
              : 'text-[#CBD5E1] hover:text-[#F1F5F9] hover:bg-[#131D2B]'
          }`}
        >
          <Castle className="w-4 h-4 shrink-0" />
          <span className="whitespace-normal leading-tight">
            {isFa ? 'املاک و مقام' : 'Holdings & Rank'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSection('fleet')}
          className={`min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            section === 'fleet'
              ? 'bg-[#38BDF8] text-[#0B1118]'
              : 'text-[#CBD5E1] hover:text-[#F1F5F9] hover:bg-[#131D2B]'
          }`}
        >
          <Ship className="w-4 h-4 shrink-0" />
          <span className="whitespace-normal leading-tight">
            {isFa ? 'ناوگان و سپاه' : 'Fleet & Warband'}
          </span>
        </button>
      </div>

      {section === 'holdings' ? (
        <div className="space-y-4">
          {/* Rank & Dynasty Goal Visible Hero Card */}
          <div className="relative p-4 rounded-2xl bg-gradient-to-br from-[#1D1913] via-[#131D2B] to-[#0F1722] border border-[#F59E0B]/45 space-y-3 overflow-hidden">
            <NorseCornerOrnament accent="amber" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/15 text-[#F59E0B] ring-1 ring-[#F59E0B]/35 flex items-center justify-center shrink-0">
                  <Crown className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-[#94A3B8]">
                    {isFa ? 'مقام کنونی شما' : 'Current Ruling Rank'}
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
                className="w-full min-h-[46px] px-4 bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0B1118] font-extrabold text-xs sm:text-sm rounded-xl cursor-pointer transition-colors"
              >
                {isFa
                  ? `ارتقای مقام به «${SHORT_TITLE_LABELS.fa[claimableRank]}»!`
                  : `Claim Rank: ${SHORT_TITLE_LABELS.en[claimableRank]}!`}
              </button>
            )}

            <div className="pt-2.5 border-t border-[#1E2D40] flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-[#94A3B8] whitespace-normal break-words">
                {isFa
                  ? `هدف دودمان: ${winGoalFa?.title ?? winGoal.title}`
                  : `Dynasty Goal: ${winGoal.title}`}
              </span>
              <span className="font-mono tabular-nums font-semibold text-[#F1F5F9]">
                {state.winGoalAchievedYear
                  ? isFa
                    ? 'تکمیل شد ✓'
                    : 'Completed ✓'
                  : isFa
                    ? winGoalFa?.progressLabel(state) ?? winGoal.progressLabel(state)
                    : winGoal.progressLabel(state)}
              </span>
            </div>
          </div>

          <RuneDivider
            label={
              isFa
                ? `املاک خاندان (${state.realm.holdings.length} ملک · ${state.realm.landFarms} مزرعه)`
                : `Dynasty Estates (${state.realm.holdings.length} Estates · ${state.realm.landFarms} Farms)`
            }
            accent="emerald"
          />

          {/* Expand Land / Claim or Conquer at Current Port */}
          <div className="relative p-4 rounded-2xl bg-gradient-to-br from-[#10221E] via-[#131D2B] to-[#0F1722] border border-[#34D399]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-hidden">
            <NorseCornerOrnament accent={locIsFortified ? 'crimson' : 'emerald'} />
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
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
                      ? `فتح دژ مستحکم ${currentLocName}`
                      : `Conquer Fortified ${currentLocName}`
                    : isFa
                      ? `خرید مزرعه در ${currentLocName}`
                      : `Buy Farmland in ${currentLocName}`}
                </div>
                <div className="text-xs text-[#CBD5E1] whitespace-normal break-words leading-relaxed">
                  {locIsFortified
                    ? isFa
                      ? 'شهر مستحکم دشمن · نیازمند ۱ کشتی جنگی و حداقل ۱۲ جنگجو'
                      : 'Enemy stronghold · Requires 1 Longship & 12+ Warriors'
                    : isFa
                      ? `ذخیره غله: ${state.realm.foodStores} · افزایش درآمد سالانه نقره`
                      : `Food stores: ${state.realm.foodStores} · Boosts annual silver income`}
                </div>
              </div>
            </div>

            {locIsFortified && onConquerCity ? (
              <button
                type="button"
                disabled={
                  Boolean(used.settle) ||
                  state.realm.longships <= 0 ||
                  state.realm.hirdWarriors < 12
                }
                onClick={() => onConquerCity(currentLocId)}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#EF4444] disabled:bg-[#1E293B] disabled:text-[#64748B] text-white font-bold text-xs shrink-0 cursor-pointer transition-colors"
              >
                {used.settle
                  ? isFa
                    ? 'انجام شد ✓'
                    : 'Done This Year ✓'
                  : isFa
                    ? 'حمله برای فتح'
                    : 'Storm Stronghold'}
              </button>
            ) : (
              <button
                type="button"
                disabled={Boolean(used.settle) || state.realm.silver < 35}
                onClick={onClearFirstFarm}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#34D399] hover:bg-[#6EE7B7] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#0B1118] font-extrabold text-xs shrink-0 cursor-pointer transition-colors"
              >
                {used.settle
                  ? isFa
                    ? 'انجام شد ✓'
                    : 'Claimed ✓'
                  : isFa
                    ? 'خرید (۳۵ نقره)'
                    : 'Buy Farm (35 Silver)'}
              </button>
            )}
          </div>

          {/* Visible Estate Selector + Building Cards */}
          {activeHolding && (
            <div className="space-y-3">
              {state.realm.holdings.length > 1 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-[#94A3B8]">
                    {isFa ? 'انتخاب ملک برای ساخت‌وساز:' : 'Select Estate to Build In:'}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {state.realm.holdings.map((h) => {
                      const s = SETTLEMENTS_BY_ID[h.settlementId];
                      const sName = isFa
                        ? SETTLEMENTS_FA[h.settlementId]?.name ?? s?.name ?? h.settlementId
                        : s?.name.split(' (')[0] ?? h.settlementId;
                      const isSel = h.settlementId === activeHolding.settlementId;
                      return (
                        <button
                          key={h.settlementId}
                          type="button"
                          onClick={() => setSelectedHoldingId(h.settlementId)}
                          className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                            isSel
                              ? 'bg-[#192A3E] border-[#F59E0B] text-[#F1F5F9]'
                              : 'bg-[#131D2B] border-[#233246] hover:border-[#38BDF8] text-[#CBD5E1]'
                          }`}
                        >
                          {sName} · {isFa ? `${h.farms} مزرعه` : `${h.farms} farms`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 px-1 text-xs text-[#94A3B8]">
                <span className="whitespace-normal break-words">
                  {isFa
                    ? `بناهای قابل احداث در ${
                        SETTLEMENTS_FA[activeHolding.settlementId]?.name ??
                        SETTLEMENTS_BY_ID[activeHolding.settlementId]?.name.split(' (')[0] ??
                        activeHolding.settlementId
                      }`
                    : `Structures at ${
                        SETTLEMENTS_BY_ID[activeHolding.settlementId]?.name.split(' (')[0] ??
                        activeHolding.settlementId
                      }`}
                </span>
                <span className="font-mono tabular-nums shrink-0 text-[#CBD5E1]">
                  {builtThisYear
                    ? isFa
                      ? 'سهمیه امسال ساخته شد ✓'
                      : '1/1 Built This Year ✓'
                    : isFa
                      ? '۱ بنا در سال مجاز'
                      : '1 Build / Year'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allBuildingKeys.map((bKey) => {
                  const bDef = BUILDINGS_CATALOG[bKey];
                  const bFa = BUILDINGS_FA[bKey];
                  const built = activeHolding.buildings.includes(bKey);
                  const wrongFaith =
                    bDef.religionReq !== undefined &&
                    state.character.religion !== bDef.religionReq;
                  const canBuild =
                    !built &&
                    !wrongFaith &&
                    !builtThisYear &&
                    state.realm.silver >= bDef.costSilver;

                  return (
                    <div
                      key={bKey}
                      className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-3 ${
                        built
                          ? 'bg-[#112220] border-[#34D399]/50'
                          : 'bg-[#131D2B] border-[#233246]'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                built
                                  ? 'bg-[#34D399]/15 text-[#34D399]'
                                  : 'bg-[#F59E0B]/15 text-[#F59E0B]'
                              }`}
                            >
                              {built ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Hammer className="w-4 h-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-[#F1F5F9] whitespace-normal break-words leading-snug">
                                {isFa ? bFa?.name ?? bDef.name : bDef.name}
                              </div>
                              <div className="text-xs text-[#94A3B8] font-mono tabular-nums mt-0.5">
                                {built
                                  ? isFa
                                    ? 'ساخته‌شده ✓'
                                  : 'Constructed ✓'
                                  : isFa
                                    ? `${bDef.costSilver} نقره`
                                    : `${bDef.costSilver} Silver`}
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-[#CBD5E1] whitespace-normal break-words leading-relaxed">
                          {wrongFaith
                            ? isFa
                              ? `نیازمند آیین: ${RELIGION_LABELS.fa[bDef.religionReq!]}`
                              : `Requires faith: ${RELIGION_LABELS.en[bDef.religionReq!]}`
                            : isFa
                              ? bFa?.shortEffect ?? bDef.effectsLabel
                              : bDef.effectsLabel}
                        </p>
                      </div>

                      {!built && (
                        <button
                          type="button"
                          disabled={!canBuild}
                          onClick={() =>
                            onBuildHoldingStructure(activeHolding.settlementId, bKey)
                          }
                          className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#E07A2F] hover:bg-[#F59E0B] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#0B1118] font-bold text-xs cursor-pointer transition-colors"
                        >
                          {builtThisYear
                            ? isFa
                              ? 'سال بعد در دسترس است'
                              : 'Available Next Year'
                            : wrongFaith
                              ? isFa
                                ? 'آیین ناسازگار'
                                : 'Wrong Faith'
                              : state.realm.silver < bDef.costSilver
                                ? isFa
                                  ? `نیازمند ${bDef.costSilver} نقره`
                                  : `Need ${bDef.costSilver} Silver`
                                : isFa
                                  ? `احداث بنا (${bDef.costSilver} نقره)`
                                  : `Construct (${bDef.costSilver} Silver)`}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* FLEET & WARBAND VISIBLE CARDS */
        <div className="space-y-4">
          {/* Upkeep & Thralls Overview */}
          <div className="p-3.5 rounded-2xl bg-[#131D2B] border border-[#233246] flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="inline-flex items-center gap-2 text-[#CBD5E1] whitespace-normal break-words">
              <Coins className="w-4 h-4 text-[#F59E0B] shrink-0" />
              {isFa ? (
                <span>
                  نگهداری سالانه ناوگان و سپاه:{' '}
                  <strong className="font-mono tabular-nums text-[#F1F5F9]">
                    {totalUpkeep} نقره
                  </strong>
                  {boathouseActive ? ' · ۵۰٪ تخفیف اسکله فعال' : ''}
                </span>
              ) : (
                <span>
                  Annual Fleet & Hird Upkeep:{' '}
                  <strong className="font-mono tabular-nums text-[#F1F5F9]">
                    {totalUpkeep} Silver/yr
                  </strong>
                  {boathouseActive ? ' · -50% Boathouse Active' : ''}
                </span>
              )}
            </span>

            {state.realm.thrallsOwned > 0 && (
              <span className="font-mono tabular-nums text-[#34D399]">
                {isFa
                  ? `${state.realm.thrallsOwned} برده (+${state.realm.thrallsOwned} نقره/سال)`
                  : `${state.realm.thrallsOwned} Thralls (+${state.realm.thrallsOwned} Silver/yr)`}
              </span>
            )}
          </div>

          <RuneDivider
            label={isFa ? 'تقویت سپاه و ساخت کشتی' : 'Ships & Household Warband'}
            accent="ice"
          />

          <div className="space-y-3">
            {/* 1. Hird Warband Card */}
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-[#231217] via-[#131D2B] to-[#0F1722] border border-[#EF4444]/40 space-y-3 overflow-hidden">
              <NorseCornerOrnament accent="crimson" />
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-[#EF4444]/15 text-[#F87171] ring-1 ring-[#EF4444]/35 flex items-center justify-center shrink-0">
                    <Swords className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-base font-bold text-[#F1F5F9] whitespace-normal break-words leading-snug">
                      {isFa ? 'جنگجویان قسم‌خورده هیرد' : 'Hird Household Warriors'}
                    </div>
                    <div className="text-xs text-[#CBD5E1] whitespace-normal break-words leading-relaxed mt-0.5">
                      {isFa
                        ? 'ستون اصلی قدرت در غارت‌های ساحلی و فتح شهرهای مستحکم'
                        : 'Frontline shield-wall power for coastal raids & city sieges'}
                    </div>
                  </div>
                </div>
                <div className="text-end font-mono tabular-nums text-xs shrink-0">
                  <div className="text-sm font-bold text-[#F1F5F9]">
                    {state.realm.hirdWarriors}
                  </div>
                  <div className="text-[#94A3B8]">{isFa ? 'جنگجو' : 'Warriors'}</div>
                </div>
              </div>

              <button
                type="button"
                disabled={Boolean(famUsed.act_recruit_hird) || state.realm.silver < 18}
                onClick={() => onBuildShipOrHird('recruit_hird')}
                className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#EF4444] disabled:bg-[#1E293B] disabled:text-[#64748B] text-white font-bold text-xs inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Shield className="w-4 h-4 shrink-0" />
                <span>
                  {famUsed.act_recruit_hird
                    ? isFa
                      ? 'امسال استخدام انجام شد ✓'
                      : 'Recruited This Year ✓'
                    : isFa
                      ? 'استخدام +۶ جنگجوی هیرد (۱۸ نقره)'
                      : 'Recruit +6 Hird Warriors (18 Silver)'}
                </span>
              </button>
            </div>

            {/* 2. War Longship Card */}
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-[#102236] via-[#131D2B] to-[#0F1722] border border-[#38BDF8]/40 space-y-3 overflow-hidden">
              <NorseCornerOrnament accent="ice" />
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-[#38BDF8]/15 text-[#38BDF8] ring-1 ring-[#38BDF8]/35 flex items-center justify-center shrink-0">
                    <Ship className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-base font-bold text-[#F1F5F9] whitespace-normal break-words leading-snug">
                      {isFa ? 'کشتی جنگی (لانگ‌شیپ)' : 'War Longship (Langskip)'}
                    </div>
                    <div className="text-xs text-[#CBD5E1] whitespace-normal break-words leading-relaxed mt-0.5">
                      {isFa
                        ? 'کشتی سریع و کم‌آبخور برای غارت صومعه‌ها، رودخانه‌ها و محاصره دژها'
                        : 'Shallow-draft warship required for coastal raids, rivers & conquests'}
                    </div>
                  </div>
                </div>
                <div className="text-end font-mono tabular-nums text-xs shrink-0">
                  <div className="text-sm font-bold text-[#38BDF8]">
                    {state.realm.longships}
                  </div>
                  <div className="text-[#94A3B8]">{isFa ? 'فروند' : 'Ships'}</div>
                </div>
              </div>

              <button
                type="button"
                disabled={Boolean(famUsed.act_build_longship) || state.realm.silver < 55}
                onClick={() => onBuildShipOrHird('build_longship')}
                className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#38BDF8] hover:text-[#0B1118] disabled:bg-[#1E293B] disabled:text-[#64748B] text-white font-bold text-xs inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Ship className="w-4 h-4 shrink-0" />
                <span>
                  {famUsed.act_build_longship
                    ? isFa
                      ? 'امسال ساخته شد ✓'
                      : 'Built This Year ✓'
                    : isFa
                      ? 'ساخت +۱ کشتی جنگی (۵۵ نقره)'
                      : 'Build +1 War Longship (55 Silver)'}
                </span>
              </button>
            </div>

            {/* 3. Trade Knarr Card */}
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-[#1C1A12] via-[#131D2B] to-[#0F1722] border border-[#F59E0B]/40 space-y-3 overflow-hidden">
              <NorseCornerOrnament accent="amber" />
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/15 text-[#F59E0B] ring-1 ring-[#F59E0B]/35 flex items-center justify-center shrink-0">
                    <Anchor className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-base font-bold text-[#F1F5F9] whitespace-normal break-words leading-snug">
                      {isFa ? 'کشتی تجاری اقیانوس‌پیما (کنار)' : 'Ocean Trade Knarr'}
                    </div>
                    <div className="text-xs text-[#CBD5E1] whitespace-normal break-words leading-relaxed mt-0.5">
                      {isFa
                        ? 'بدنه پهن و مقاوم در برابر طوفان اقیانوس اطلس و افزایش سود بازار'
                        : 'Deep-hulled merchant vessel that cuts storm risk & boosts trade silver'}
                    </div>
                  </div>
                </div>
                <div className="text-end font-mono tabular-nums text-xs shrink-0">
                  <div className="text-sm font-bold text-[#F59E0B]">{state.realm.knarrs}</div>
                  <div className="text-[#94A3B8]">{isFa ? 'فروند' : 'Ships'}</div>
                </div>
              </div>

              <button
                type="button"
                disabled={Boolean(famUsed.act_build_knarr) || state.realm.silver < 45}
                onClick={() => onBuildShipOrHird('build_knarr')}
                className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#0B1118] font-extrabold text-xs inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Anchor className="w-4 h-4 shrink-0" />
                <span>
                  {famUsed.act_build_knarr
                    ? isFa
                      ? 'امسال ساخته شد ✓'
                      : 'Built This Year ✓'
                    : isFa
                      ? 'ساخت +۱ کشتی تجاری کنار (۴۵ نقره)'
                      : 'Build +1 Trade Knarr (45 Silver)'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
