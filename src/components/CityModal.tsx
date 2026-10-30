import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'motion/react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Coins,
  Crown,
  Flame,
  Hammer,
  Minus,
  MoreHorizontal,
  Plus,
  Shield,
  Swords,
  Users,
  X,
} from 'lucide-react';
import { SETTLEMENTS_BY_ID } from '../data/geography';
import { BUILDINGS_CATALOG } from '../data/namesAndTraits';
import {
  BUILDINGS_FA,
  SETTLEMENTS_FA,
  formatPersonName,
} from '../i18n/gameDataFa';
import { ESTATES_LEDGER_UI, toPersianDigits } from '../i18n/ui';
import {
  BuildingType,
  FullGameState,
  Holding,
  Language,
  PlotType,
  TributeBurden,
} from '../types/game';
import { RuneDivider } from './NorseMotifs';

export type CityModalTab = 'overview' | 'buildings';

export interface CityModalProps {
  holding: Holding;
  settlementName?: string;
  settlementRegion?: string | null;
  state: FullGameState;
  currentIndex: number;
  totalCount: number;
  initialTab?: CityModalTab;
  feedbackToast: string | null;
  onTriggerToast: (message: string) => void;
  onClose: (closedFromPopState?: boolean) => void;
  onStepCity: (delta: number) => void;
  onBuildHoldingStructure: (settlementId: string, building: BuildingType) => void;
  onSendSettlers?: (settlementId: string) => void;
  onStationGarrison?: (settlementId: string, delta: number) => void;
  onSetTributeBurden?: (settlementId: string, burden: TributeBurden) => void;
  onAppointJarl?: (settlementId: string) => void;
  onTakeHostages?: (settlementId: string) => void;
  onToggleTolerance?: (settlementId: string) => void;
  onExecutePlot?: (plotType: PlotType, targetSettlementId?: string) => void;
}

/**
 * Brief animated inline number for live updates inside the City Modal.
 */
function LiveAnimatedNumber({
  value,
  lang,
  suffix = '',
  reducedMotion,
}: {
  value: number;
  lang: Language;
  suffix?: string;
  reducedMotion: boolean;
}) {
  const [display, setDisplay] = useState(value);
  const [highlight, setHighlight] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    const prev = prevRef.current;
    if (prev === value) return;
    prevRef.current = value;

    if (reducedMotion) {
      setDisplay(value);
      return;
    }

    setHighlight(true);
    const start = performance.now();
    const duration = 220;
    let rafId = 0;

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(prev + (value - prev) * p));
      if (p < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
        setHighlight(false);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value, reducedMotion]);

  const text = lang === 'fa' ? toPersianDigits(display) : String(display);
  return (
    <span
      className={`font-mono tabular-nums transition-colors duration-200 ${
        highlight ? 'text-[#F59E0B]' : ''
      }`}
    >
      {text}
      {suffix}
    </span>
  );
}

function getUnrestStatus(unrest: number, lang: Language) {
  const ui = ESTATES_LEDGER_UI[lang];
  if (unrest >= 70) {
    return {
      level: 'critical' as const,
      label: ui.statusCritical,
      sentence: ui.unrestSentenceCritical,
      dotClass: 'bg-rose-500',
      barClass: 'bg-rose-500',
      textClass: 'text-rose-400',
    };
  }
  if (unrest >= 40) {
    return {
      level: 'uneasy' as const,
      label: ui.statusUneasy,
      sentence: ui.unrestSentenceUneasy,
      dotClass: 'bg-[#F59E0B]',
      barClass: 'bg-[#F59E0B]',
      textClass: 'text-[#F59E0B]',
    };
  }
  return {
    level: 'calm' as const,
    label: ui.statusCalm,
    sentence: ui.unrestSentenceCalm,
    dotClass: 'bg-emerald-500',
    barClass: 'bg-emerald-500',
    textClass: 'text-emerald-400',
  };
}

/**
 * Dedicated City Modal ("Quiet Saga Ledger" design language).
 * Renders as a fixed-position dialog layered over the Estates sheet with:
 * - Sticky header: settlement name, region, jarl (<bdi> Latin name), X close button,
 *   prev/next holding navigation arrows + horizontal swipe + "3 / 21" indicator
 * - Two in-modal tabs: Overview · Buildings
 * - Sticky footer: single contextual filled orange primary action
 * - Full RTL support, focus trapping, Escape & browser Back (popstate) handling
 */
export function CityModal({
  holding: h,
  settlementName,
  settlementRegion,
  state,
  currentIndex,
  totalCount,
  initialTab = 'overview',
  feedbackToast,
  onTriggerToast,
  onClose,
  onStepCity,
  onBuildHoldingStructure,
  onSendSettlers,
  onStationGarrison,
  onSetTributeBurden,
  onAppointJarl,
  onTakeHostages,
  onToggleTolerance,
  onExecutePlot,
}: CityModalProps) {
  const lang = state.settings.language;
  const isFa = lang === 'fa';
  const ui = ESTATES_LEDGER_UI[lang];
  const prefersReducedMotion = Boolean(useReducedMotion());

  const [cityModalTab, setCityModalTab] = useState<CityModalTab>(initialTab);
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);

  const cityModalCardRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const swipeStartXRef = useRef<number | null>(null);
  const swipeStartYRef = useRef<number | null>(null);

  useEffect(() => {
    setCityModalTab(initialTab);
  }, [initialTab]);

  // Collapse "More" panel when cycling between holdings
  useEffect(() => {
    setMoreActionsOpen(false);
  }, [h.settlementId]);

  // Focus trap, Escape key, Back button (popstate), and body scroll lock
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      if (closeButtonRef.current) {
        closeButtonRef.current.focus();
        return;
      }
      const firstFocusable = cityModalCardRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }, 30);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        onClose(false);
        return;
      }

      if (e.key === 'Tab' && cityModalCardRef.current) {
        const focusables = Array.from(
          cityModalCardRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    const handlePopState = () => {
      onClose(true);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  const num = (val: number | string) => (isFa ? toPersianDigits(val) : String(val));

  const sData = SETTLEMENTS_BY_ID[h.settlementId];
  const rawSettlementName = isFa
    ? SETTLEMENTS_FA[h.settlementId]?.name ?? sData?.name ?? h.settlementId
    : sData?.name ?? h.settlementId;
  const sName = settlementName ?? rawSettlementName.split(' (')[0].trim();
  const regionMatch = rawSettlementName.match(/\(([^)]+)\)/);
  const sRegion =
    settlementRegion !== undefined ? settlementRegion : regionMatch ? regionMatch[1].trim() : null;

  const unrest = h.unrest ?? 15;
  const garrison = h.garrison ?? 4;
  const status = getUnrestStatus(unrest, lang);
  const jarlFaName = h.appointedJarl ? formatPersonName(h.appointedJarl, lang) : null;

  const builtThisYear = Boolean(state.builtThisYear);
  const allBuildingKeys = Object.keys(BUILDINGS_CATALOG) as BuildingType[];

  const missingSettlerSilver = Math.max(0, 28 - state.realm.silver);
  const missingJarlSilver = Math.max(0, 20 - state.realm.silver);
  const canTakeHostages = garrison >= 6 || state.realm.hirdWarriors >= 10;

  const unbuiltKeys = allBuildingKeys.filter((bKey) => {
    if (h.buildings.includes(bKey)) return false;
    const bDef = BUILDINGS_CATALOG[bKey];
    if (bDef.religionReq !== undefined && state.character.religion !== bDef.religionReq) {
      return false;
    }
    return true;
  });

  const recommendedBuildingKey = unbuiltKeys[0] ?? null;
  const recommendedBuildingDef = recommendedBuildingKey
    ? BUILDINGS_CATALOG[recommendedBuildingKey]
    : null;
  const recommendedBuildingName = recommendedBuildingKey
    ? isFa
      ? BUILDINGS_FA[recommendedBuildingKey]?.name ?? recommendedBuildingDef?.name ?? ''
      : recommendedBuildingDef?.name ?? ''
    : '';
  const recommendedMissingSilver = recommendedBuildingDef
    ? Math.max(0, recommendedBuildingDef.costSilver - state.realm.silver)
    : 0;

  const noImmediateGovernancePossible =
    missingSettlerSilver > 0 &&
    (Boolean(h.appointedJarl) || missingJarlSilver > 0) &&
    !canTakeHostages &&
    state.realm.hirdWarriors < 2;

  const currentDir = document.documentElement.dir === 'ltr' || !isFa ? 'ltr' : 'rtl';

  const handleModalPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, input')) return;
    swipeStartXRef.current = e.clientX;
    swipeStartYRef.current = e.clientY;
  };

  const handleModalPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (swipeStartXRef.current === null || swipeStartYRef.current === null) return;
    const dx = e.clientX - swipeStartXRef.current;
    const dy = e.clientY - swipeStartYRef.current;
    swipeStartXRef.current = null;
    swipeStartYRef.current = null;

    if (Math.abs(dx) >= 56 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      if (isFa) {
        if (dx > 0) onStepCity(1);
        else onStepCity(-1);
      } else {
        if (dx < 0) onStepCity(1);
        else onStepCity(-1);
      }
    }
  };

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      setCityModalTab((prev) => (prev === 'overview' ? 'buildings' : 'overview'));
    }
  };

  return createPortal(
    <motion.div
      dir={currentDir}
      data-city-modal="true"
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.15, ease: 'easeOut' }}
      onClick={() => onClose(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="city-modal-title"
      aria-describedby="city-modal-subtitle"
      className="fixed inset-0 z-[130] max-h-dvh overflow-hidden bg-[#05080D]/55 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-2 sm:p-4 text-[#F1F5F9]"
    >
      <motion.div
        ref={cityModalCardRef}
        initial={
          prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96, y: 16 }
        }
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={handleModalPointerDown}
        onPointerUp={handleModalPointerUp}
        className="relative w-full max-w-lg h-[88dvh] max-h-[88dvh] sm:h-auto sm:max-h-[86dvh] flex flex-col overflow-hidden rounded-[20px] bg-[#0F1722] border border-[#233246] shadow-[0_18px_50px_rgba(0,0,0,0.45)] text-start"
      >
        {/* STICKY HEADER */}
        <div className="sticky top-0 z-20 shrink-0 bg-[#121C2B] pt-3.5 px-4 pb-2.5 space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <h3
                  id="city-modal-title"
                  className="font-saga text-[20px] font-semibold text-[#F1F5F9] leading-snug"
                >
                  {sName}
                </h3>
                {sRegion && (
                  <span className="text-xs font-normal text-[#94A3B8]">({sRegion})</span>
                )}
              </div>

              {/* Jarl Line (Persian transliteration + <bdi> Latin original) */}
              <div
                id="city-modal-subtitle"
                className="text-xs font-normal text-[#94A3B8] mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 leading-snug"
              >
                {h.appointedJarl ? (
                  <>
                    <span className="text-[#CBD5E1] font-semibold">
                      {ui.jarlPrefix}: {jarlFaName}
                    </span>
                    {isFa && (
                      <bdi dir="ltr" className="text-xs text-[#64748B] font-mono">
                        ({h.appointedJarl})
                      </bdi>
                    )}
                  </>
                ) : (
                  <span>{ui.noJarlAssigned}</span>
                )}
              </div>
            </div>

            {/* Close X Button (44x44px) */}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => onClose(false)}
              aria-label={ui.modalClose}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-[#182638] hover:bg-[#22354D] border border-[#2A3E59] flex items-center justify-center text-[#CBD5E1] hover:text-[#F1F5F9] shrink-0 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Prev / Next Navigation + Quiet "3 / 21" Indicator + Live Silver & Warriors Pill */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="inline-flex items-center gap-1.5">
              <button
                type="button"
                disabled={totalCount <= 1}
                onClick={() => onStepCity(-1)}
                aria-label={ui.modalPrevCity}
                className="w-9 h-9 rounded-lg bg-[#111A26] hover:bg-[#162232] border border-[#233246] flex items-center justify-center text-[#CBD5E1] disabled:opacity-35 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
              >
                {isFa ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>

              <span
                aria-live="polite"
                className="px-2.5 py-1 rounded-lg bg-[#111A26] border border-[#233246] text-xs font-mono tabular-nums text-[#94A3B8]"
              >
                {num(currentIndex + 1)} / {num(totalCount)}
              </span>

              <button
                type="button"
                disabled={totalCount <= 1}
                onClick={() => onStepCity(1)}
                aria-label={ui.modalNextCity}
                className="w-9 h-9 rounded-lg bg-[#111A26] hover:bg-[#162232] border border-[#233246] flex items-center justify-center text-[#CBD5E1] disabled:opacity-35 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
              >
                {isFa ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Live Silver & Active Hird Indicator */}
            <div className="inline-flex items-center gap-2.5 px-2.5 py-1 rounded-lg bg-[#111A26] border border-[#233246] text-xs">
              <span className="inline-flex items-center gap-1 text-[#CBD5E1]">
                <Coins className="w-3.5 h-3.5 text-[#94A3B8]" />
                <LiveAnimatedNumber
                  value={state.realm.silver}
                  lang={lang}
                  reducedMotion={prefersReducedMotion}
                />
              </span>
              <span className="text-[#64748B]">·</span>
              <span className="inline-flex items-center gap-1 text-[#CBD5E1]">
                <Swords className="w-3.5 h-3.5 text-[#94A3B8]" />
                <LiveAnimatedNumber
                  value={state.realm.hirdWarriors}
                  lang={lang}
                  reducedMotion={prefersReducedMotion}
                />
              </span>
            </div>
          </div>

          {/* In-Modal Tabs: Overview · Buildings */}
          <div
            role="tablist"
            aria-label={isFa ? 'بخش‌های شهر' : 'City Tabs'}
            onKeyDown={handleTabKeyDown}
            className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#111A26] border border-[#233246]"
          >
            <button
              id="city-tab-overview"
              type="button"
              role="tab"
              aria-selected={cityModalTab === 'overview'}
              aria-controls="city-panel-overview"
              onClick={() => setCityModalTab('overview')}
              className={`min-h-[40px] px-3 py-1.5 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] ${
                cityModalTab === 'overview'
                  ? 'bg-[#162232] text-[#F1F5F9] border border-[#233246]'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              <span>{ui.modalTabOverview}</span>
            </button>

            <button
              id="city-tab-buildings"
              type="button"
              role="tab"
              aria-selected={cityModalTab === 'buildings'}
              aria-controls="city-panel-buildings"
              onClick={() => setCityModalTab('buildings')}
              className={`min-h-[40px] px-3 py-1.5 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] ${
                cityModalTab === 'buildings'
                  ? 'bg-[#162232] text-[#F1F5F9] border border-[#233246]'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              <span>{ui.modalTabBuildings}</span>
              <span className="px-1.5 py-0.5 rounded text-xs font-mono tabular-nums bg-[#111A26] text-[#94A3B8]">
                {num(h.buildings.length)}/{num(allBuildingKeys.length)}
              </span>
            </button>
          </div>
        </div>

        {/* Single Subtle Knotwork Divider Under Header */}
        <RuneDivider className="px-4 py-1 bg-[#121C2B]" />

        {/* SCROLLABLE MODAL BODY */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
          {/* Result Toast Inside Modal */}
          {feedbackToast && (
            <div
              role="status"
              aria-live="polite"
              className="px-3.5 py-2.5 rounded-xl bg-[#111A26] border border-[#233246] flex items-center gap-2 text-xs font-semibold text-[#F1F5F9]"
            >
              <span className="w-5 h-5 rounded-full bg-[#162232] text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </span>
              <span>{feedbackToast}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* IN-MODAL TAB 1: OVERVIEW                                  */}
          {/* ========================================================= */}
          {cityModalTab === 'overview' && (
            <div
              id="city-panel-overview"
              role="tabpanel"
              aria-labelledby="city-tab-overview"
              className="space-y-4"
            >
              {/* 1. Calm Stat Strip with Thin Dividers: Farms · Garrison · Population · Noble Factions */}
              <div className="rounded-xl bg-[#111A26] border border-[#233246] grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x rtl:sm:divide-x-reverse divide-[#1E2D40] overflow-hidden">
                <div className="p-2.5 text-center">
                  <div className="text-xs font-normal text-[#94A3B8]">{ui.statFarms}</div>
                  <div className="text-[15px] font-semibold text-[#F1F5F9] mt-0.5">
                    <LiveAnimatedNumber
                      value={h.farms}
                      lang={lang}
                      reducedMotion={prefersReducedMotion}
                    />
                  </div>
                </div>

                <div className="p-2.5 text-center">
                  <div className="text-xs font-normal text-[#94A3B8]">{ui.sortGarrison}</div>
                  <div
                    className={`text-[15px] font-semibold mt-0.5 ${
                      garrison <= 2 ? 'text-[#F59E0B]' : 'text-[#F1F5F9]'
                    }`}
                  >
                    <LiveAnimatedNumber
                      value={garrison}
                      lang={lang}
                      reducedMotion={prefersReducedMotion}
                    />
                  </div>
                </div>

                <div className="p-2.5 text-center">
                  <div className="text-xs font-normal text-[#94A3B8]">{ui.stripNorsePop}</div>
                  <div className="text-[15px] font-semibold text-[#F1F5F9] mt-0.5">
                    <LiveAnimatedNumber
                      value={h.norsePopulationShare ?? 65}
                      lang={lang}
                      suffix="%"
                      reducedMotion={prefersReducedMotion}
                    />
                  </div>
                </div>

                <div className="p-2.5 text-center">
                  <div className="text-xs font-normal text-[#94A3B8]">{ui.stripFactions}</div>
                  <div className="text-[15px] font-semibold text-[#F1F5F9] mt-0.5">
                    <LiveAnimatedNumber
                      value={h.hostagesCount ?? 0}
                      lang={lang}
                      reducedMotion={prefersReducedMotion}
                    />{' '}
                    <span className="text-xs font-normal text-[#94A3B8]">
                      {ui.hostagesLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Unrest Meter with One-Line Status in Words */}
              <div className="p-3.5 rounded-xl bg-[#111A26] border border-[#233246] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#CBD5E1] flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${status.dotClass} shrink-0`}
                      aria-hidden="true"
                    />
                    <span>{ui.stripUnrest}</span>
                  </span>
                  <span
                    className={`text-sm font-semibold font-mono tabular-nums ${status.textClass}`}
                  >
                    <LiveAnimatedNumber
                      value={unrest}
                      lang={lang}
                      suffix="%"
                      reducedMotion={prefersReducedMotion}
                    />{' '}
                    · {status.label}
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-[#182638] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${status.barClass}`}
                    style={{ width: `${Math.min(100, unrest)}%` }}
                  />
                </div>

                <p className="text-xs font-normal text-[#94A3B8] leading-relaxed">
                  {status.sentence}
                </p>
              </div>

              {/* 3. Garrison Stepper (Large 44x44px − / + targets) */}
              {onStationGarrison && (
                <div className="p-3.5 rounded-xl bg-[#111A26] border border-[#233246] flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-[#F1F5F9] flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-[#CBD5E1] shrink-0" />
                      <span>{ui.garrisonStepperTitle}</span>
                    </div>
                    <div className="text-xs font-normal text-[#94A3B8] mt-0.5 leading-relaxed">
                      {garrison <= 0
                        ? ui.garrisonEmptyReason
                        : state.realm.hirdWarriors < 2
                          ? ui.garrisonNoHirdReason
                          : ui.garrisonStepperSub}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={garrison <= 0}
                      onClick={() => {
                        onStationGarrison(h.settlementId, -2);
                        onTriggerToast(ui.toastGarrisonRemoved(sName));
                      }}
                      aria-label={isFa ? 'کاهش ۲ نگهبان از پادگان' : 'Remove 2 guards'}
                      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-[#162232] hover:bg-[#1E2D40] border border-[#233246] text-[#F1F5F9] flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="min-w-[54px] text-center">
                      <div className="text-[15px] font-semibold text-[#F1F5F9]">
                        <LiveAnimatedNumber
                          value={garrison}
                          lang={lang}
                          reducedMotion={prefersReducedMotion}
                        />
                      </div>
                      <div className="text-xs font-normal text-[#94A3B8]">
                        {ui.garrisonShort}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={state.realm.hirdWarriors < 2}
                      onClick={() => {
                        onStationGarrison(h.settlementId, 2);
                        onTriggerToast(ui.toastGarrisonAdded(sName));
                      }}
                      aria-label={isFa ? 'افزودن ۲ نگهبان به پادگان' : 'Add 2 guards'}
                      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-[#162232] hover:bg-[#1E2D40] border border-[#233246] text-[#F1F5F9] flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* 4. 2-Column Icon-Button Grid with Cost Chips (Outlined/Neutral) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Send Settlers · 28 Silver */}
                {onSendSettlers && (
                  <button
                    type="button"
                    disabled={missingSettlerSilver > 0}
                    onClick={() => {
                      onSendSettlers(h.settlementId);
                      onTriggerToast(ui.toastSettlersSent(sName));
                    }}
                    className={`min-h-[48px] px-3 py-2 rounded-xl border flex items-center justify-between gap-2 text-start transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] ${
                      missingSettlerSilver === 0
                        ? 'bg-[#111A26] hover:bg-[#162232] border-[#233246] text-[#F1F5F9] cursor-pointer'
                        : 'bg-[#111A26] border-[#233246] text-[#94A3B8] cursor-not-allowed'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold flex items-center gap-1.5 leading-snug">
                        <Users className="w-4 h-4 text-[#CBD5E1] shrink-0" />
                        <span>{ui.actionSendSettlers}</span>
                      </div>
                      {missingSettlerSilver > 0 && (
                        <div className="text-xs font-normal text-[#94A3B8] mt-0.5">
                          {ui.needMoreSilver(missingSettlerSilver)}
                        </div>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-xs font-mono font-semibold tabular-nums bg-[#162232] text-[#CBD5E1] shrink-0">
                      {num(28)} {ui.chipSilver}
                    </span>
                  </button>
                )}

                {/* Appoint Jarl · 20 Silver (or Muted Non-Interactive Pill if Done) */}
                {onAppointJarl &&
                  (h.appointedJarl ? (
                    <div
                      aria-disabled="true"
                      className="min-h-[48px] px-3 py-2 rounded-xl bg-[#111A26] border border-[#1E2D40] flex items-center justify-between gap-2 select-none"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-normal text-[#94A3B8] flex items-center gap-1.5 leading-snug">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{ui.jarlAppointedDone}</span>
                        </div>
                        <div className="text-xs font-normal text-[#64748B] mt-0.5">
                          {jarlFaName}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-xs font-normal bg-[#162232] text-[#94A3B8] shrink-0">
                        ✓
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={missingJarlSilver > 0}
                      onClick={() => {
                        onAppointJarl(h.settlementId);
                        onTriggerToast(ui.toastJarlAppointed(sName));
                      }}
                      className={`min-h-[48px] px-3 py-2 rounded-xl border flex items-center justify-between gap-2 text-start transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] ${
                        missingJarlSilver === 0
                          ? 'bg-[#111A26] hover:bg-[#162232] border-[#233246] text-[#F1F5F9] cursor-pointer'
                          : 'bg-[#111A26] border-[#233246] text-[#94A3B8] cursor-not-allowed'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold flex items-center gap-1.5 leading-snug">
                          <Crown className="w-4 h-4 text-[#CBD5E1] shrink-0" />
                          <span>{ui.actionAppointJarl}</span>
                        </div>
                        {missingJarlSilver > 0 && (
                          <div className="text-xs font-normal text-[#94A3B8] mt-0.5">
                            {ui.needMoreSilver(missingJarlSilver)}
                          </div>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-xs font-mono font-semibold tabular-nums bg-[#162232] text-[#CBD5E1] shrink-0">
                        {num(20)} {ui.chipSilver}
                      </span>
                    </button>
                  ))}

                {/* Take Noble Hostage · 6+ Guards */}
                {onTakeHostages && (
                  <button
                    type="button"
                    disabled={!canTakeHostages}
                    onClick={() => {
                      onTakeHostages(h.settlementId);
                      onTriggerToast(ui.toastHostagesTaken(sName));
                    }}
                    className={`min-h-[48px] px-3 py-2 rounded-xl border flex items-center justify-between gap-2 text-start transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] ${
                      canTakeHostages
                        ? 'bg-[#111A26] hover:bg-[#162232] border-[#233246] text-[#F1F5F9] cursor-pointer'
                        : 'bg-[#111A26] border-[#233246] text-[#94A3B8] cursor-not-allowed'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold flex items-center gap-1.5 leading-snug">
                        <Shield className="w-4 h-4 text-[#CBD5E1] shrink-0" />
                        <span>{ui.actionTakeHostage}</span>
                      </div>
                      {!canTakeHostages && (
                        <div className="text-xs font-normal text-[#94A3B8] mt-0.5">
                          {ui.needGuardsForHostage}
                        </div>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-xs font-mono font-semibold tabular-nums bg-[#162232] text-[#CBD5E1] shrink-0">
                      {ui.chipGuardsReq}
                    </span>
                  </button>
                )}

                {/* Open City Buildings Tab */}
                <button
                  type="button"
                  onClick={() => setCityModalTab('buildings')}
                  className="min-h-[48px] px-3 py-2 rounded-xl bg-[#111A26] hover:bg-[#162232] border border-[#233246] text-[#F1F5F9] flex items-center justify-between gap-2 text-start cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold flex items-center gap-1.5 leading-snug">
                      <Hammer className="w-4 h-4 text-[#CBD5E1] shrink-0" />
                      <span>{ui.actionBuildHere}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono font-semibold tabular-nums bg-[#162232] text-[#CBD5E1] shrink-0">
                    {num(h.buildings.length)}/{num(allBuildingKeys.length)} {ui.chipStructures}
                  </span>
                </button>
              </div>

              {/* Friendly Note When Zero Immediate Governance Actions Are Available */}
              {noImmediateGovernancePossible && (
                <div className="px-3 py-2 rounded-xl bg-[#111A26] border border-[#233246] text-xs font-normal text-[#94A3B8] leading-relaxed">
                  {ui.zeroActionsNote}
                </div>
              )}

              {/* 5. Rare Actions Behind "⋯ More" */}
              <div>
                <button
                  type="button"
                  aria-expanded={moreActionsOpen}
                  onClick={() => setMoreActionsOpen((v) => !v)}
                  className="min-h-[44px] px-3 py-1.5 rounded-xl bg-[#111A26] hover:bg-[#162232] border border-[#233246] text-xs font-semibold text-[#CBD5E1] inline-flex items-center gap-1.5 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
                >
                  <MoreHorizontal className="w-4 h-4" />
                  <span>{moreActionsOpen ? ui.hideMoreActionsBtn : ui.moreActionsBtn}</span>
                </button>

                {moreActionsOpen && (
                  <div className="mt-2 p-3.5 rounded-xl bg-[#111A26] border border-[#233246] space-y-3">
                    {/* Tribute Burden Selector */}
                    {onSetTributeBurden && (
                      <div className="space-y-1.5">
                        <div className="text-xs font-semibold text-[#CBD5E1]">
                          {ui.tributeSectionTitle}
                        </div>
                        <div className="grid grid-cols-5 gap-1">
                          {(
                            [
                              'none',
                              'light',
                              'normal',
                              'heavy',
                              'extortionate',
                            ] as TributeBurden[]
                          ).map((tb) => {
                            const active = (h.tributeBurden ?? 'normal') === tb;
                            const label =
                              tb === 'none'
                                ? isFa
                                  ? 'معاف'
                                  : 'None'
                                : tb === 'light'
                                  ? isFa
                                    ? 'سبک'
                                    : 'Light'
                                  : tb === 'normal'
                                    ? isFa
                                      ? 'متوسط'
                                      : 'Normal'
                                    : tb === 'heavy'
                                      ? isFa
                                        ? 'سنگین'
                                        : 'Heavy'
                                      : isFa
                                        ? 'ظالمانه'
                                        : 'Max';
                            return (
                              <button
                                key={tb}
                                type="button"
                                onClick={() => {
                                  onSetTributeBurden(h.settlementId, tb);
                                  onTriggerToast(ui.toastTributeChanged(sName));
                                }}
                                className={`min-h-[40px] px-1.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] ${
                                  active
                                    ? 'bg-[#182638] text-[#F1F5F9] border border-[#233246]'
                                    : 'bg-[#162232] text-[#94A3B8] hover:text-[#F1F5F9]'
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Religious Tolerance Toggle */}
                    {onToggleTolerance && (
                      <div className="pt-2 border-t border-[#1E2D40] flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-[#CBD5E1]">
                            {ui.toleranceSectionTitle}
                          </div>
                          <div className="text-xs font-normal text-[#94A3B8] mt-0.5">
                            {h.religiousTolerance ? ui.toleranceActive : ui.toleranceStrict}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onToggleTolerance(h.settlementId);
                            onTriggerToast(ui.toastToleranceToggled(sName));
                          }}
                          className="min-h-[44px] px-3 py-1.5 rounded-xl bg-[#162232] hover:bg-[#1E2D40] border border-[#233246] text-xs font-semibold text-[#F1F5F9] cursor-pointer shrink-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
                        >
                          {ui.toggleToleranceBtn}
                        </button>
                      </div>
                    )}

                    {/* Harsh Crackdown / Mass Reprisal */}
                    {onExecutePlot && (
                      <div className="pt-2 border-t border-[#1E2D40]">
                        <button
                          type="button"
                          disabled={state.realm.hirdWarriors < 15}
                          onClick={() => onExecutePlot('mass_reprisal', h.settlementId)}
                          className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#162232] hover:bg-rose-950/40 border border-[#233246] text-xs font-semibold text-rose-300 flex items-center justify-between gap-2 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed transition-colors"
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <Flame className="w-4 h-4 text-rose-400 shrink-0" />
                            <span>{ui.reprisalBtn}</span>
                          </span>
                          {state.realm.hirdWarriors < 15 && (
                            <span className="text-xs font-normal text-[#94A3B8]">
                              {ui.reprisalNeedWarriors}
                            </span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* IN-MODAL TAB 2: BUILDINGS                                 */}
          {/* ========================================================= */}
          {cityModalTab === 'buildings' && (
            <div
              id="city-panel-buildings"
              role="tabpanel"
              aria-labelledby="city-tab-buildings"
              className="space-y-3.5"
            >
              {/* Yearly Quota Bar */}
              <div className="px-3.5 py-2.5 rounded-xl bg-[#111A26] border border-[#233246] flex items-center justify-between gap-2">
                <span className="text-xs font-normal text-[#CBD5E1]">
                  {ui.buildQuotaAvailable}
                </span>
                {builtThisYear && (
                  <span
                    aria-disabled="true"
                    className="px-2.5 py-1 rounded-full bg-[#162232] border border-[#233246] text-xs font-normal text-[#94A3B8] inline-flex items-center gap-1.5 select-none"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{ui.doneThisSeason}</span>
                  </span>
                )}
              </div>

              {/* Friendly Empty Suggestion if City Has No Buildings Yet */}
              {h.buildings.length === 0 && (
                <div className="p-3.5 rounded-xl bg-[#111A26] border border-[#233246] text-xs font-normal text-[#CBD5E1] leading-relaxed">
                  {ui.emptyBuildingsNote}
                </div>
              )}

              {/* Clean Rows of Constructible & Existing Buildings Separated by Thin Dividers */}
              <div className="rounded-2xl bg-[#111A26] border border-[#233246] divide-y divide-[#1E2D40] overflow-hidden">
                {allBuildingKeys.map((bKey) => {
                  const bDef = BUILDINGS_CATALOG[bKey];
                  const bFa = BUILDINGS_FA[bKey];
                  const bName = isFa ? bFa?.name ?? bDef.name : bDef.name;
                  const bDesc = isFa
                    ? bFa?.description ?? bDef.description
                    : bDef.description;
                  const built = h.buildings.includes(bKey);
                  const wrongFaith =
                    bDef.religionReq !== undefined &&
                    state.character.religion !== bDef.religionReq;
                  const missingSilver = Math.max(0, bDef.costSilver - state.realm.silver);
                  const canBuild =
                    !built && !wrongFaith && !builtThisYear && missingSilver === 0;

                  return (
                    <div
                      key={bKey}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-semibold text-[#F1F5F9]">
                            {bName}
                          </span>
                          {!built && (
                            <span className="px-2 py-0.5 rounded-md bg-[#162232] text-xs font-mono font-semibold tabular-nums text-[#CBD5E1]">
                              {num(bDef.costSilver)} {ui.chipSilver}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-normal text-[#94A3B8] leading-relaxed">
                          {bDesc}
                        </p>
                      </div>

                      {/* Outlined Action or Calm Muted Pill (Footer holds the single filled orange CTA) */}
                      <div className="shrink-0">
                        {built ? (
                          <span
                            aria-disabled="true"
                            className="min-h-[40px] px-3 py-1.5 rounded-full bg-[#162232] border border-[#233246] text-xs font-normal text-[#94A3B8] inline-flex items-center gap-1.5 select-none"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{ui.builtPermanent}</span>
                          </span>
                        ) : builtThisYear ? (
                          <span
                            aria-disabled="true"
                            className="min-h-[40px] px-3 py-1.5 rounded-full bg-[#162232] border border-[#233246] text-xs font-normal text-[#94A3B8] inline-flex items-center gap-1.5 select-none"
                          >
                            <Check className="w-3.5 h-3.5 text-[#94A3B8]" />
                            <span>{ui.doneThisSeason}</span>
                          </span>
                        ) : wrongFaith ? (
                          <span className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#162232] text-xs font-normal text-[#94A3B8] inline-flex items-center">
                            {ui.needDifferentFaith}
                          </span>
                        ) : missingSilver > 0 ? (
                          <span className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#162232] text-xs font-normal text-[#94A3B8] inline-flex items-center">
                            {ui.needMoreSilver(missingSilver)}
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={!canBuild}
                            onClick={() => {
                              onBuildHoldingStructure(h.settlementId, bKey);
                              onTriggerToast(ui.toastBuiltStructure(bName, sName));
                            }}
                            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#162232] hover:bg-[#1E2D40] border border-[#233246] text-[#F1F5F9] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
                          >
                            <Hammer className="w-4 h-4 text-[#CBD5E1]" />
                            <span>
                              {isFa
                                ? `احداث (${num(bDef.costSilver)} نقره)`
                                : `Build (${bDef.costSilver} Silver)`}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* STICKY FOOTER: EXACTLY ONE FILLED ORANGE PRIMARY ACTION */}
        <div className="sticky bottom-0 z-20 shrink-0 border-t border-[#1E2D40] bg-[#121C2B] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {garrison <= 2 && onStationGarrison ? (
            <button
              type="button"
              disabled={state.realm.hirdWarriors < 2}
              onClick={() => {
                onStationGarrison(h.settlementId, 2);
                onTriggerToast(ui.toastGarrisonAdded(sName));
              }}
              className={`w-full min-h-[46px] px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between gap-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] ${
                state.realm.hirdWarriors >= 2
                  ? 'bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0B1118] cursor-pointer'
                  : 'bg-[#162232] border border-[#233246] text-[#94A3B8] cursor-not-allowed'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Shield className="w-4 h-4 shrink-0" />
                <span>{ui.primaryReinforceGarrison}</span>
              </span>
              {state.realm.hirdWarriors < 2 && (
                <span className="text-xs font-normal">{ui.garrisonNoHirdReason}</span>
              )}
            </button>
          ) : unrest >= 50 && onSendSettlers ? (
            <button
              type="button"
              disabled={missingSettlerSilver > 0}
              onClick={() => {
                onSendSettlers(h.settlementId);
                onTriggerToast(ui.toastSettlersSent(sName));
              }}
              className={`w-full min-h-[46px] px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between gap-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] ${
                missingSettlerSilver === 0
                  ? 'bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0B1118] cursor-pointer'
                  : 'bg-[#162232] border border-[#233246] text-[#94A3B8] cursor-not-allowed'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Users className="w-4 h-4 shrink-0" />
                <span>{ui.primaryPacifySettlers}</span>
              </span>
              {missingSettlerSilver > 0 && (
                <span className="text-xs font-normal">
                  {ui.needMoreSilver(missingSettlerSilver)}
                </span>
              )}
            </button>
          ) : cityModalTab === 'overview' && unbuiltKeys.length > 0 ? (
            <button
              type="button"
              onClick={() => setCityModalTab('buildings')}
              className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0B1118] text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
            >
              <Hammer className="w-4 h-4 shrink-0" />
              <span>{ui.primaryOpenBuildings}</span>
            </button>
          ) : !recommendedBuildingKey || !recommendedBuildingDef ? (
            <div
              aria-disabled="true"
              className="w-full min-h-[44px] px-4 py-2 rounded-full bg-[#162232] border border-[#233246] text-xs font-normal text-[#94A3B8] flex items-center justify-center gap-1.5 select-none"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{ui.primaryAllBuilt}</span>
            </div>
          ) : builtThisYear ? (
            <div
              aria-disabled="true"
              className="w-full min-h-[44px] px-4 py-2 rounded-full bg-[#162232] border border-[#233246] text-xs font-normal text-[#94A3B8] flex items-center justify-center gap-1.5 select-none"
            >
              <Check className="w-4 h-4 text-[#94A3B8]" />
              <span>{ui.doneThisSeason}</span>
            </div>
          ) : (
            <button
              type="button"
              disabled={recommendedMissingSilver > 0}
              onClick={() => {
                onBuildHoldingStructure(h.settlementId, recommendedBuildingKey);
                onTriggerToast(
                  ui.toastBuiltStructure(recommendedBuildingName, sName)
                );
              }}
              className={`w-full min-h-[46px] px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between gap-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] ${
                recommendedMissingSilver === 0
                  ? 'bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0B1118] cursor-pointer'
                  : 'bg-[#162232] border border-[#233246] text-[#94A3B8] cursor-not-allowed'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Hammer className="w-4 h-4 shrink-0" />
                <span>
                  {ui.primaryConstructNext(
                    recommendedBuildingName,
                    recommendedBuildingDef.costSilver
                  )}
                </span>
              </span>
              {recommendedMissingSilver > 0 && (
                <span className="text-xs font-normal">
                  {ui.needMoreSilver(recommendedMissingSilver)}
                </span>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
