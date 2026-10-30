import React, { useEffect, useMemo, useState } from 'react';
import {
  Anchor,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Compass,
  Crown,
  Feather,
  Flame,
  Handshake,
  Lock,
  MapPin,
  ScrollText,
  Search,
  Shield,
  Skull,
  Sparkles,
  Swords,
  Users,
  X,
} from 'lucide-react';
import { SETTLEMENTS_BY_ID } from '../data/geography';
import {
  HISTORICAL_STATUS_LABELS,
  LEGENDS_BY_ID,
  LEGENDS_REGISTRY,
  LegendRegistryEntry,
} from '../data/legendsRegistry';
import { SAGA_HEIRLOOMS_MAP } from '../data/lothbrokCycle';
import {
  createEmptyStandingRecord,
  ensureLegendState,
  getLegendKnownState,
  getLegendOrdstirrLabel,
  PAY_LEGEND_INTEL_COST,
} from '../engine/legendEngine';
import { SETTLEMENTS_FA } from '../i18n/gameDataFa';
import { formatYearLabel, isRtl, SEASON_LABELS } from '../i18n/ui';
import {
  FullGameState,
  LegendHistoricalStatus,
  TitleRank,
} from '../types/game';
import { VikingPortrait } from './VikingPortrait';

interface HallOfLegendsPanelProps {
  state: FullGameState;
  onPayForLegendNews?: () => void;
}

function toPersianDigits(val: number | string): string {
  const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(val).replace(/[0-9]/g, (d) => persian[Number(d)]);
}

function formatNum(val: number | string, isFa: boolean): string {
  return isFa ? toPersianDigits(val) : String(val);
}

export const HallOfLegendsPanel: React.FC<HallOfLegendsPanelProps> = ({
  state,
  onPayForLegendNews,
}) => {
  const lang = state.settings.language;
  const isFa = lang === 'fa';
  const rtl = isRtl(lang);

  const [scopeFilter, setScopeFilter] = useState<'all' | 'phase1' | 'alive' | 'oaths'>('all');
  const [statusFilter, setStatusFilter] = useState<'ALL' | LegendHistoricalStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLegendId, setSelectedLegendId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<'timeline' | 'ledger' | 'kin'>('timeline');
  const [visibleBeatsLimit, setVisibleBeatsLimit] = useState<number>(8);

  const legendState = useMemo(() => ensureLegendState(state), [state]);
  const deliveredIds = legendState.deliveredBeatIds;
  const pendingRumorsCount = legendState.rumorQueue.length;
  const canAffordIntel = state.realm.silver >= PAY_LEGEND_INTEL_COST;

  const evaluatedLegends = useMemo(() => {
    return LEGENDS_REGISTRY.map((legend) => {
      const known = getLegendKnownState(legend, state.year, deliveredIds);
      const ordstirr = getLegendOrdstirrLabel(legend, state.year, deliveredIds, lang);
      const standingRec =
        legendState.standings[legend.id] ?? createEmptyStandingRecord(legend.id);
      const loc = SETTLEMENTS_BY_ID[known.lastKnownSettlementId];
      const locName = isFa
        ? SETTLEMENTS_FA[known.lastKnownSettlementId]?.name ?? loc?.name ?? known.lastKnownSettlementId
        : loc?.name ?? known.lastKnownSettlementId;
      const ageInYear =
        known.lifeStatus === 'dead'
          ? legend.deathYear - legend.birthYear
          : known.lifeStatus === 'unborn'
            ? 18
            : Math.max(14, state.year - legend.birthYear);

      return {
        legend,
        known,
        ordstirr,
        standingRec,
        locName,
        ageInYear,
      };
    });
  }, [state.year, deliveredIds, legendState.standings, lang, isFa]);

  const filteredLegends = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return evaluatedLegends.filter((item) => {
      if (scopeFilter === 'phase1' && item.legend.phase !== 1) return false;
      if (
        scopeFilter === 'alive' &&
        item.known.lifeStatus !== 'active' &&
        item.known.lifeStatus !== 'youth'
      ) {
        return false;
      }
      if (scopeFilter === 'oaths') {
        const hasBond =
          item.standingRec.standing !== 0 ||
          item.standingRec.oaths.length > 0 ||
          item.standingRec.feuds.length > 0 ||
          item.standingRec.gifts.length > 0;
        if (!hasBond) return false;
      }
      if (statusFilter !== 'ALL' && item.legend.statusTag !== statusFilter) return false;
      if (q) {
        const hay = `${item.legend.name} ${item.legend.nameFa} ${item.legend.norseName} ${item.legend.epithet} ${item.legend.epithetFa} ${item.locName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [evaluatedLegends, scopeFilter, statusFilter, searchQuery]);

  const aliveCount = useMemo(
    () =>
      evaluatedLegends.filter(
        (i) => i.known.lifeStatus === 'active' || i.known.lifeStatus === 'youth'
      ).length,
    [evaluatedLegends]
  );

  const totalOathsAndFeuds = useMemo(
    () =>
      evaluatedLegends.reduce(
        (sum, i) => sum + i.standingRec.oaths.length + i.standingRec.feuds.length,
        0
      ),
    [evaluatedLegends]
  );

  const selectedIndex = useMemo(
    () => filteredLegends.findIndex((i) => i.legend.id === selectedLegendId),
    [filteredLegends, selectedLegendId]
  );

  const selectedItem = useMemo(
    () => evaluatedLegends.find((i) => i.legend.id === selectedLegendId) ?? null,
    [evaluatedLegends, selectedLegendId]
  );

  useEffect(() => {
    setVisibleBeatsLimit(8);
  }, [selectedLegendId]);

  const handleCycleSelected = (dir: -1 | 1) => {
    if (filteredLegends.length <= 1 || selectedIndex < 0) return;
    const nextIdx = (selectedIndex + dir + filteredLegends.length) % filteredLegends.length;
    setSelectedLegendId(filteredLegends[nextIdx].legend.id);
  };

  const getStatusDotColor = (status: LegendHistoricalStatus) => {
    if (status === 'DOCUMENTED') return 'bg-status-emerald';
    if (status === 'CONTESTED') return 'bg-gold-500';
    return 'bg-status-violet';
  };

  const getStatusTextColor = (status: LegendHistoricalStatus) => {
    if (status === 'DOCUMENTED') return 'text-accent-emerald';
    if (status === 'CONTESTED') return 'text-accent-amber';
    return 'text-accent-violet';
  };

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className="flex flex-col space-y-3.5 text-ink-primary bg-surface-card rounded-2xl p-3.5 sm:p-4 border border-border-subtle"
    >
      {/* Top Quiet Saga Ledger Header */}
      <div className="flex flex-col gap-2.5 border-b border-border-subtle pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <Feather className="w-3.5 h-3.5 text-accent-amber shrink-0" />
              <span>
                {isFa
                  ? `تقویم افسانه‌های زنده · سال ${formatNum(state.year, true)} میلادی`
                  : `Living Legends Calendar · ${formatYearLabel(state.year, lang)}`}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-accent-amber">
                {state.sagaMode
                  ? isFa
                    ? 'حالت حماسه فعال'
                    : 'Saga Mode Active'
                  : isFa
                    ? 'حالت تاریخ آزاد'
                    : 'Historical Archive'}
              </span>
            </div>
            <h2 className="font-saga text-xl sm:text-2xl font-bold text-ink-primary mt-0.5">
              {isFa ? 'تالار افسانه‌ها و خبر از سرزمین‌ها' : 'The Hall of Legends'}
            </h2>
            <p className="text-xs text-ink-secondary leading-relaxed mt-0.5">
              {isFa
                ? 'زندگی تو هم‌زمان با راگنار لُدبروک، لاگرتا، هرافنا-فلوکی و فرمانروایان سده نهم جریان دارد؛ اخبار آنان به تناسب فاصله جغرافیایی با کشتی‌ها و اسکالدها به تالارت می‌رسد.'
                : 'Your life unfolds alongside Ragnar Lothbrok, Lagertha, Hrafna-Flóki, and the rulers of the 9th century. Word of their deeds travels across the sea by trader and skald.'}
            </p>
          </div>
        </div>

        {/* 3 Compact Summary Metrics + Pay Skald/Trader Action */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="bg-surface-secondary border border-border-subtle rounded-xl px-2.5 py-2">
            <div className="text-[11px] text-ink-muted">
              {isFa ? 'افسانه‌های زنده در این سال' : 'Living in This Year'}
            </div>
            <div className="text-base sm:text-lg font-bold tabular-nums text-ink-primary">
              {formatNum(aliveCount, isFa)}{' '}
              <span className="text-xs font-normal text-ink-muted">
                / {formatNum(LEGENDS_REGISTRY.length, isFa)}
              </span>
            </div>
          </div>

          <div className="bg-surface-secondary border border-border-subtle rounded-xl px-2.5 py-2">
            <div className="text-[11px] text-ink-muted">
              {isFa ? 'اخبار رسیده‌شده به تالار' : 'Known Saga Beats'}
            </div>
            <div className="text-base sm:text-lg font-bold tabular-nums text-ink-primary">
              {formatNum(deliveredIds.length, isFa)}
            </div>
          </div>

          <div className="bg-surface-secondary border border-border-subtle rounded-xl px-2.5 py-2">
            <div className="text-[11px] text-ink-muted">
              {isFa ? 'سوگندها و کینه‌های شما' : 'Sworn Oaths & Feuds'}
            </div>
            <div className="text-base sm:text-lg font-bold tabular-nums text-accent-amber">
              {formatNum(totalOathsAndFeuds, isFa)}
            </div>
          </div>
        </div>

        {/* Intelligence Gather Bar ("Pay Trader or Skald for Word") */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-surface-secondary border border-border-subtle rounded-xl p-2.5">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-ink-primary flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-accent-amber shrink-0" />
              <span>
                {isFa
                  ? 'پرس‌وجو از اسکالدها و ناخدایان تجاری در بندر'
                  : 'Inquire of Harbor Skalds & Knarr-Masters'}
              </span>
            </div>
            <div className="text-[11px] text-ink-secondary mt-0.5">
              {pendingRumorsCount > 0
                ? isFa
                  ? `${formatNum(pendingRumorsCount, true)} خبر دوردست یا شایعه در راه است — با پرداخت نقره فوراً روایت موثق را دریافت کنید.`
                  : `${pendingRumorsCount} distant news item(s) in transit — pay to gather immediate eyewitness word.`
                : isFa
                  ? 'دریافت گزارش موثق شاهد عینی از آخرین مکان و کارنامه افسانه‌های زنده و تصحیح شایعات.'
                  : 'Gather verified eyewitness dispatches on living legends and clear any merchant rumor distortions.'}
            </div>
          </div>

          <button
            type="button"
            disabled={!canAffordIntel}
            onClick={onPayForLegendNews}
            className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors shrink-0 ${
              canAffordIntel
                ? 'bg-cta-copper hover:bg-cta-copper-hover text-cta-ink-light cursor-pointer shadow-xs'
                : 'bg-surface-disabled text-ink-disabled border border-dashed border-border-subtle cursor-not-allowed'
            }`}
          >
            {canAffordIntel ? (
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <Lock className="w-3.5 h-3.5 shrink-0 opacity-80" />
            )}
            <span>
              {canAffordIntel
                ? isFa
                  ? `دریافت خبر موثق (${formatNum(PAY_LEGEND_INTEL_COST, true)} نقره)`
                  : `Pay Skald for Word (${PAY_LEGEND_INTEL_COST} Silver)`
                : isFa
                  ? `نیازمند ${formatNum(PAY_LEGEND_INTEL_COST, true)} نقره · دریافت خبر`
                  : `Need ${PAY_LEGEND_INTEL_COST} Silver · Pay Skald`}
            </span>
          </button>
        </div>
      </div>

      {/* Historical Grounding Legend Bar (Unboxed metadata explanation) */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-ink-secondary px-1">
        <div className="flex flex-wrap items-center gap-3">
          {(['DOCUMENTED', 'CONTESTED', 'LEGENDARY'] as LegendHistoricalStatus[]).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter((prev) => (prev === st ? 'ALL' : st))}
              className={`inline-flex items-center gap-1.5 py-1 cursor-pointer transition-opacity ${
                statusFilter !== 'ALL' && statusFilter !== st ? 'opacity-45' : 'opacity-100'
              }`}
              title={isFa ? HISTORICAL_STATUS_LABELS[st].descFa : HISTORICAL_STATUS_LABELS[st].descEn}
            >
              <span className={`w-2 h-2 rounded-full ${getStatusDotColor(st)}`} />
              <span className={`font-bold ${getStatusTextColor(st)}`}>
                {isFa ? HISTORICAL_STATUS_LABELS[st].fa : HISTORICAL_STATUS_LABELS[st].en}
              </span>
            </button>
          ))}
        </div>
        {statusFilter !== 'ALL' && (
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className="text-[11px] text-accent-amber underline cursor-pointer"
          >
            {isFa ? 'نمایش همه وضعیت‌ها' : 'Reset status filter'}
          </button>
        )}
      </div>

      {/* Segmented Scope Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex items-center bg-surface-secondary p-1 rounded-xl border border-border-subtle overflow-x-auto">
          {(
            [
              { id: 'all', en: 'All Roster', fa: 'همه چهره‌ها' },
              { id: 'phase1', en: 'Ragnar’s Circle', fa: 'حلقه اصلی (فاز ۱)' },
              { id: 'alive', en: 'Alive Now', fa: 'زنده در این سال' },
              { id: 'oaths', en: 'Oaths & Feuds', fa: 'سوگندها و کینه‌ها' },
            ] as const
          ).map((tab) => {
            const active = scopeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setScopeFilter(tab.id)}
                className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'bg-cta-copper text-cta-ink-light shadow-xs'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                {isFa ? tab.fa : tab.en}
              </button>
            );
          })}
        </div>

        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-ink-muted absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isFa
                ? 'جستجوی نام افسانه، لقب یا شهر...'
                : 'Search legend name, epithet, or port...'
            }
            className="w-full min-h-[38px] ps-8 pe-3 py-1.5 rounded-xl bg-surface-secondary border border-border-subtle text-xs text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-gold-500"
          />
        </div>
      </div>

      {/* Legends List / Grid */}
      <div className="divide-y divide-border-subtle border-t border-b border-border-subtle">
        {filteredLegends.length === 0 ? (
          <div className="py-8 text-center text-xs text-ink-muted">
            {isFa
              ? 'هیچ چهره‌ای با این فیلتر یافت نشد.'
              : 'No legends match the current filter.'}
          </div>
        ) : (
          filteredLegends.map((item) => {
            const { legend, known, ordstirr, standingRec, locName, ageInYear } = item;
            const latestBeat = known.latestBeat;
            const lifeLabelEn =
              known.lifeStatus === 'dead'
                ? `Fell ${legend.deathYear} AD`
                : known.lifeStatus === 'unborn'
                  ? `Born ${legend.birthYear} AD`
                  : `Age ${ageInYear} · Active`;
            const lifeLabelFa =
              known.lifeStatus === 'dead'
                ? `درگذشته در ${formatNum(legend.deathYear, true)} م`
                : known.lifeStatus === 'unborn'
                  ? `تولد در ${formatNum(legend.birthYear, true)} م`
                  : `${formatNum(ageInYear, true)} ساله · زنده`;

            return (
              <button
                key={legend.id}
                type="button"
                onClick={() => {
                  setSelectedLegendId(legend.id);
                  setDetailTab('timeline');
                }}
                className="w-full py-3 px-2 hover:bg-surface-secondary transition-colors flex items-start gap-3 text-start cursor-pointer group"
              >
                {/* Portrait */}
                <div
                  className={`relative shrink-0 rounded-xl overflow-hidden border ${
                    known.lifeStatus === 'dead'
                      ? 'border-border-strong grayscale opacity-80'
                      : legend.phase === 1
                        ? 'border-gold-500'
                        : 'border-border-subtle'
                  }`}
                >
                  <VikingPortrait
                    sex={legend.sex}
                    age={ageInYear}
                    traits={[]}
                    title={TitleRank.Jarl}
                    appearance={legend.appearance}
                    seedId={legend.id}
                    size={54}
                  />
                </div>

                {/* Main Info */}
                <div className="min-w-0 flex-1">
                  {/* Top metadata kicker (unboxed text with typographic separators) */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-ink-muted">
                    <span className={`w-2 h-2 rounded-full ${getStatusDotColor(legend.statusTag)}`} />
                    <span className={`font-bold ${getStatusTextColor(legend.statusTag)}`}>
                      {isFa
                        ? HISTORICAL_STATUS_LABELS[legend.statusTag].fa
                        : HISTORICAL_STATUS_LABELS[legend.statusTag].en}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{isFa ? lifeLabelFa : lifeLabelEn}</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-0.5 text-ink-secondary">
                      <MapPin className="w-3 h-3 text-accent-amber" />
                      {locName}
                    </span>
                  </div>

                  {/* Name & Epithet */}
                  <div className="flex flex-wrap items-baseline gap-1.5 mt-0.5">
                    <span className="font-saga text-base sm:text-lg font-bold text-ink-primary group-hover:text-accent-amber transition-colors">
                      {isFa ? legend.nameFa : legend.name}
                    </span>
                    <bdi className="text-[11px] text-ink-muted font-mono">
                      ({legend.norseName})
                    </bdi>
                  </div>

                  <div className="text-xs text-ink-secondary font-medium">
                    {isFa ? legend.epithetFa : legend.epithet} ·{' '}
                    <span className="text-accent-amber font-semibold">
                      {ordstirr.label}
                    </span>
                  </div>

                  {/* Last Known Word Snippet */}
                  <div className="text-[11px] text-ink-muted line-clamp-1 mt-1">
                    {latestBeat ? (
                      <>
                        <span className="font-mono font-semibold text-ink-primary">
                          [{formatNum(latestBeat.year, isFa)}]
                        </span>{' '}
                        {isFa ? latestBeat.titleFa : latestBeat.title}
                      </>
                    ) : isFa ? (
                      'هنوز خبری از کارنامه او به بندر شما نرسیده است.'
                    ) : (
                      'No word of their deeds has yet reached your harbor.'
                    )}
                  </div>

                  {/* Standing & Oaths / Feuds Row */}
                  {(standingRec.standing !== 0 ||
                    standingRec.oaths.length > 0 ||
                    standingRec.feuds.length > 0 ||
                    standingRec.gifts.length > 0) && (
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px]">
                      <span
                        className={`font-mono font-bold ${
                          standingRec.standing > 0
                            ? 'text-accent-emerald'
                            : standingRec.standing < 0
                              ? 'text-accent-crimson'
                              : 'text-ink-muted'
                        }`}
                      >
                        {isFa ? 'جایگاه:' : 'Standing:'}{' '}
                        {standingRec.standing > 0
                          ? `+${formatNum(standingRec.standing, isFa)}`
                          : formatNum(standingRec.standing, isFa)}
                      </span>
                      {standingRec.oaths.length > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-accent-emerald font-semibold">
                            {formatNum(standingRec.oaths.length, isFa)}{' '}
                            {isFa ? 'سوگند هم‌پیمانی' : 'Oath(s)'}
                          </span>
                        </>
                      )}
                      {standingRec.feuds.length > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-accent-crimson font-semibold">
                            {formatNum(standingRec.feuds.length, isFa)}{' '}
                            {isFa ? 'کینه خونی' : 'Feud(s)'}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Open Chevron */}
                <div className="self-center text-ink-muted group-hover:text-accent-amber transition-colors shrink-0">
                  {rtl ? (
                    <ChevronLeft className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* LEGEND DETAIL MODAL (Layered Dialog in Quiet Saga Ledger Style) */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-surface-backdrop backdrop-blur-[2px]"
          onClick={() => setSelectedLegendId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={isFa ? selectedItem.legend.nameFa : selectedItem.legend.name}
            dir={rtl ? 'rtl' : 'ltr'}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl max-h-[88dvh] bg-surface-card text-ink-primary rounded-[20px] border border-border-subtle shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Sticky Modal Header */}
            <div className="px-4 py-3 bg-surface-secondary border-b border-border-subtle flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleCycleSelected(-1)}
                  disabled={filteredLegends.length <= 1}
                  aria-label={isFa ? 'چهره قبلی' : 'Previous legend'}
                  className="w-8 h-8 rounded-lg border border-border-subtle bg-surface-card hover:border-gold-500 flex items-center justify-center text-ink-primary disabled:opacity-40 cursor-pointer"
                >
                  {rtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
                <span className="text-xs font-mono tabular-nums text-ink-muted px-1">
                  {formatNum(selectedIndex + 1, isFa)} /{' '}
                  {formatNum(filteredLegends.length, isFa)}
                </span>
                <button
                  type="button"
                  onClick={() => handleCycleSelected(1)}
                  disabled={filteredLegends.length <= 1}
                  aria-label={isFa ? 'چهره بعدی' : 'Next legend'}
                  className="w-8 h-8 rounded-lg border border-border-subtle bg-surface-card hover:border-gold-500 flex items-center justify-center text-ink-primary disabled:opacity-40 cursor-pointer"
                >
                  {rtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLegendId(null)}
                aria-label={isFa ? 'بستن' : 'Close'}
                className="w-8 h-8 rounded-lg border border-border-subtle bg-surface-card hover:border-gold-500 flex items-center justify-center text-ink-primary cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Identity Banner */}
            <div className="p-4 border-b border-border-subtle bg-surface-canvas shrink-0">
              <div className="flex items-start gap-3.5">
                <div className="rounded-xl overflow-hidden border border-gold-500 shrink-0">
                  <VikingPortrait
                    sex={selectedItem.legend.sex}
                    age={selectedItem.ageInYear}
                    traits={[]}
                    title={TitleRank.Konungr}
                    appearance={selectedItem.legend.appearance}
                    seedId={selectedItem.legend.id}
                    size={68}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-ink-muted">
                    <span
                      className={`w-2 h-2 rounded-full ${getStatusDotColor(
                        selectedItem.legend.statusTag
                      )}`}
                    />
                    <span
                      className={`font-bold ${getStatusTextColor(selectedItem.legend.statusTag)}`}
                    >
                      {isFa
                        ? HISTORICAL_STATUS_LABELS[selectedItem.legend.statusTag].fa
                        : HISTORICAL_STATUS_LABELS[selectedItem.legend.statusTag].en}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {formatNum(selectedItem.legend.birthYear, isFa)}–
                      {formatNum(selectedItem.legend.deathYear, isFa)}{' '}
                      {isFa ? 'میلادی' : 'AD'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedItem.locName}</span>
                  </div>

                  <h3 className="font-saga text-xl font-bold text-ink-primary mt-0.5">
                    {isFa ? selectedItem.legend.nameFa : selectedItem.legend.name}{' '}
                    <bdi className="text-xs font-mono font-normal text-ink-muted">
                      ({selectedItem.legend.norseName})
                    </bdi>
                  </h3>

                  <div className="text-xs text-ink-secondary">
                    {isFa ? selectedItem.legend.roleFa : selectedItem.legend.role}
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-accent-amber">
                      {isFa ? 'آوازه (Orðstírr):' : 'Orðstírr:'} {selectedItem.ordstirr.label}
                    </span>
                    <bdi className="text-[11px] font-mono text-ink-muted">
                      [{selectedItem.ordstirr.norse}]
                    </bdi>
                  </div>
                </div>
              </div>

              {/* Bio & Historical Source Note */}
              <p className="text-xs text-ink-secondary leading-relaxed mt-3">
                {isFa ? selectedItem.legend.bioFa : selectedItem.legend.bioEn}
              </p>
              <div className="mt-2 pt-2 border-t border-border-subtle text-[11px] text-ink-muted">
                <span className="font-bold text-ink-primary">
                  {isFa ? 'منابع تاریخی و حماسی: ' : 'Chronicle & Saga Sources: '}
                </span>
                {isFa
                  ? selectedItem.legend.historicalSourcesFa
                  : selectedItem.legend.historicalSourcesEn}
              </div>
            </div>

            {/* In-Modal Segmented Tabs */}
            <div className="px-4 py-2 bg-surface-secondary border-b border-border-subtle flex items-center gap-1.5 shrink-0">
              {(
                [
                  {
                    id: 'timeline',
                    en: `Known Saga (${selectedItem.known.knownBeats.length})`,
                    fa: `کارنامه رسیده‌شده (${formatNum(selectedItem.known.knownBeats.length, true)})`,
                  },
                  {
                    id: 'ledger',
                    en: 'Oaths & Feuds',
                    fa: 'سوگندها و کینه‌ها',
                  },
                  {
                    id: 'kin',
                    en: `Kin & Circle (${selectedItem.legend.relationships.length})`,
                    fa: `پیوندها (${formatNum(selectedItem.legend.relationships.length, true)})`,
                  },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDetailTab(t.id)}
                  className={`flex-1 min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    detailTab === t.id
                      ? 'bg-cta-copper text-cta-ink-light'
                      : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  {isFa ? t.fa : t.en}
                </button>
              ))}
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
              {detailTab === 'timeline' && (
                <>
                  {selectedItem.known.knownBeats.length === 0 ? (
                    <div className="py-8 text-center text-xs text-ink-muted">
                      {isFa
                        ? 'هنوز هیچ خبری از کارنامه این شخصیت به تالار شما نرسیده است.'
                        : 'No word of this figure’s deeds has reached your hall yet.'}
                    </div>
                  ) : (
                    <div className="divide-y divide-border-subtle">
                      {selectedItem.known.knownBeats
                        .slice(0, visibleBeatsLimit)
                        .map((beat) => {
                          const bLoc = SETTLEMENTS_BY_ID[beat.settlementId];
                          const bLocName = isFa
                            ? SETTLEMENTS_FA[beat.settlementId]?.name ??
                              bLoc?.name ??
                              beat.settlementId
                            : bLoc?.name ?? beat.settlementId;
                          const isDiverged = legendState.divergedBeatIds.includes(beat.id);
                          return (
                            <div key={beat.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-ink-muted">
                                <span className="font-mono font-bold text-accent-amber">
                                  {formatNum(beat.year, isFa)} {isFa ? 'م' : 'AD'}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span>{SEASON_LABELS[lang][beat.season]}</span>
                                <span aria-hidden="true">·</span>
                                <span>{bLocName}</span>
                                {beat.isCanonicalAnchor && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span className="font-bold text-accent-emerald">
                                      {isFa ? 'نقطه عطف تاریخی' : 'Canonical Anchor'}
                                    </span>
                                  </>
                                )}
                                {isDiverged && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span className="font-bold text-accent-amber-strong">
                                      {isFa
                                        ? 'اسکالدها روایت دیگری می‌گویند'
                                        : 'The skalds tell it differently'}
                                    </span>
                                  </>
                                )}
                              </div>

                              <div className="font-bold text-sm text-ink-primary">
                                {isFa ? beat.titleFa : beat.title}
                              </div>

                              <p className="text-xs text-ink-secondary leading-relaxed">
                                {isFa ? beat.textFa : beat.text}
                              </p>

                              {(beat.skaldVerse || beat.skaldVerseFa) && (
                                <blockquote className="mt-1.5 ps-3 border-s-2 border-gold-500 italic text-xs text-ink-secondary">
                                  {isFa ? beat.skaldVerseFa ?? beat.skaldVerse : beat.skaldVerse}
                                </blockquote>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {selectedItem.known.knownBeats.length > visibleBeatsLimit && (
                    <button
                      type="button"
                      onClick={() => setVisibleBeatsLimit((v) => v + 8)}
                      className="w-full py-2 rounded-xl border border-border-subtle bg-surface-secondary text-xs font-bold text-ink-primary cursor-pointer"
                    >
                      {isFa ? 'نمایش رویدادهای بیشتر' : 'Show More Beats'}
                    </button>
                  )}

                  {selectedItem.known.unheardFutureBeatsCount > 0 && (
                    <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle text-xs text-ink-muted">
                      {isFa
                        ? `مهِ زمان و مسافت: ${formatNum(selectedItem.known.unheardFutureBeatsCount, true)} فصل دیگر از سرنوشت این افسانه هنوز رخ نداده یا خبرش به بندر شما نرسیده است.`
                        : `Fog of Time & Sea: ${selectedItem.known.unheardFutureBeatsCount} further chapter(s) of this legend’s life have either not yet come to pass or their word is still at sea.`}
                    </div>
                  )}
                </>
              )}

              {detailTab === 'ledger' && (
                <div className="space-y-4">
                  {/* Standing Meter */}
                  <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-ink-primary">
                        {isFa
                          ? 'جایگاه و رابطه خاندان شما با این افسانه'
                          : 'Your Dynasty’s Standing'}
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          selectedItem.standingRec.standing > 0
                            ? 'text-accent-emerald'
                            : selectedItem.standingRec.standing < 0
                              ? 'text-accent-crimson'
                              : 'text-ink-muted'
                        }`}
                      >
                        {selectedItem.standingRec.standing > 0
                          ? `+${formatNum(selectedItem.standingRec.standing, isFa)}`
                          : formatNum(selectedItem.standingRec.standing, isFa)}{' '}
                        / {formatNum(100, isFa)}
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-surface-interactive overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          selectedItem.standingRec.standing >= 0
                            ? 'bg-status-emerald'
                            : 'bg-status-crimson'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(6, (selectedItem.standingRec.standing + 100) / 2)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Signature Heirloom if any */}
                  {selectedItem.legend.heirloomId &&
                    SAGA_HEIRLOOMS_MAP[selectedItem.legend.heirloomId] && (
                      <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-accent-amber">
                            {isFa ? 'میراث و یادگار ویژه:' : 'Signature Heirloom:'}{' '}
                            {isFa
                              ? SAGA_HEIRLOOMS_MAP[selectedItem.legend.heirloomId].nameFa
                              : SAGA_HEIRLOOMS_MAP[selectedItem.legend.heirloomId].nameEn}
                          </span>
                          <span className="text-[11px] font-bold text-accent-emerald">
                            {(state.heirlooms ?? []).includes(selectedItem.legend.heirloomId)
                              ? isFa
                                ? 'در خزانه خاندان شما ✓'
                                : 'In Your Treasury ✓'
                              : isFa
                                ? 'قابل دریافت در رویدادهای ملاقات'
                                : 'Earned via Encounter'}
                          </span>
                        </div>
                        <p className="text-xs text-ink-secondary">
                          {isFa
                            ? SAGA_HEIRLOOMS_MAP[selectedItem.legend.heirloomId].loreFa
                            : SAGA_HEIRLOOMS_MAP[selectedItem.legend.heirloomId].loreEn}
                        </p>
                      </div>
                    )}

                  {/* Sworn Oaths */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-accent-emerald flex items-center gap-1.5">
                      <Handshake className="w-4 h-4" />
                      <span>{isFa ? 'سوگندهای هم‌پیمانی' : 'Sworn Oaths'}</span>
                    </h4>
                    {selectedItem.standingRec.oaths.length === 0 ? (
                      <div className="text-xs text-ink-muted">
                        {isFa
                          ? 'هنوز سوگندی میان شما و این افسانه بسته نشده است.'
                          : 'No oaths sworn with this legend yet.'}
                      </div>
                    ) : (
                      selectedItem.standingRec.oaths.map((o) => (
                        <div
                          key={o.id}
                          className="p-2.5 rounded-xl bg-surface-secondary border border-border-subtle text-xs"
                        >
                          <span className="font-mono font-bold text-accent-amber">
                            [{formatNum(o.year, isFa)}]
                          </span>{' '}
                          {isFa ? o.textFa : o.text}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Blood-Feuds & Grudges */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-accent-crimson flex items-center gap-1.5">
                      <Swords className="w-4 h-4" />
                      <span>{isFa ? 'کینه‌ها و دشمنی‌ها' : 'Feuds & Grudges'}</span>
                    </h4>
                    {selectedItem.standingRec.feuds.length === 0 ? (
                      <div className="text-xs text-ink-muted">
                        {isFa
                          ? 'هیچ دشمنی یا کینه‌ای ثبت نشده است.'
                          : 'No blood-feuds recorded with this legend.'}
                      </div>
                    ) : (
                      selectedItem.standingRec.feuds.map((f) => (
                        <div
                          key={f.id}
                          className="p-2.5 rounded-xl bg-surface-secondary border border-border-subtle text-xs"
                        >
                          <span className="font-mono font-bold text-accent-crimson">
                            [{formatNum(f.year, isFa)}]
                          </span>{' '}
                          {isFa ? f.textFa : f.text}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Gifts & Memorials */}
                  {selectedItem.standingRec.gifts.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-accent-amber flex items-center gap-1.5">
                        <Crown className="w-4 h-4" />
                        <span>{isFa ? 'هدایا و یادبودها' : 'Gifts & Memorials'}</span>
                      </h4>
                      {selectedItem.standingRec.gifts.map((g) => (
                        <div
                          key={g.id}
                          className="p-2.5 rounded-xl bg-surface-secondary border border-border-subtle text-xs"
                        >
                          <span className="font-mono font-bold text-accent-amber">
                            [{formatNum(g.year, isFa)}]
                          </span>{' '}
                          {isFa ? g.textFa : g.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'kin' && (
                <div className="divide-y divide-border-subtle">
                  {selectedItem.legend.relationships.map((rel) => {
                    const targetLeg = LEGENDS_BY_ID[rel.legendId];
                    if (!targetLeg) return null;
                    return (
                      <button
                        key={rel.legendId}
                        type="button"
                        onClick={() => {
                          setSelectedLegendId(targetLeg.id);
                          setDetailTab('timeline');
                        }}
                        className="w-full py-2.5 px-2 hover:bg-surface-secondary transition-colors flex items-center justify-between gap-3 text-start cursor-pointer"
                      >
                        <div>
                          <div className="text-sm font-bold text-ink-primary">
                            {isFa ? targetLeg.nameFa : targetLeg.name}
                          </div>
                          <div className="text-xs text-accent-amber font-medium">
                            {isFa ? rel.roleFa : rel.roleEn}
                          </div>
                          {(rel.noteEn || rel.noteFa) && (
                            <div className="text-[11px] text-ink-muted mt-0.5">
                              {isFa ? rel.noteFa ?? rel.noteEn : rel.noteEn}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-ink-muted shrink-0">
                          {rtl ? (
                            <ChevronLeft className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
