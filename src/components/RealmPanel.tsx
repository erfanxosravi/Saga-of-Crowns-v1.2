import { useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import {
  ArrowUpDown,
  Castle,
  Check,
  ChevronLeft,
  ChevronRight,
  Coins,
  Crown,
  Flame,
  Hammer,
  MapPin,
  Minus,
  Plus,
  Search,
  Shield,
  Ship,
  Skull,
  Swords,
  Users,
  Wheat,
} from 'lucide-react';
import { SETTLEMENTS_BY_ID } from '../data/geography';
import { BUILDINGS_CATALOG, MILITARY_CATALOG_BY_ID, WIN_GOALS } from '../data/namesAndTraits';
import {
  checkSpecialTitles,
  getClaimableNextTitle,
  getNextTitleRequirementText,
  hasBoathouse,
  isFortifiedEnemyCity,
} from '../engine/gameEngine';
import {
  BUILDINGS_FA,
  SETTLEMENTS_FA,
  WIN_GOALS_FA,
  formatPersonName,
} from '../i18n/gameDataFa';
import {
  ESTATES_LEDGER_UI,
  TITLE_LABELS,
  formatLedgerNumber,
  toPersianDigits,
} from '../i18n/ui';
import {
  BattleTactic,
  BuildingType,
  FullGameState,
  Holding,
  Language,
  MilitaryPurchaseAction,
  PlotType,
  TributeBurden,
} from '../types/game';
import { CityModal, CityModalTab } from './CityModal';
import {
  MilitaryUnitGlyph,
  NorseCornerOrnament,
  RuneDivider,
} from './NorseMotifs';

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

type EstatesSubView = 'estates' | 'build' | 'opportunities';
type HoldingsSortKey = 'attention' | 'farms' | 'garrison' | 'alpha';

/**
 * Animated compact stat tile for the 4-tile "Realm at a Glance" header.
 * Supports abbreviated numbers (e.g. 26k / ۲۶هزار) with tap-to-reveal exact number,
 * Persian tabular numerals, and a brief smooth count-up when values change.
 */
function AnimatedStatTile({
  label,
  value,
  lang,
  icon,
  showExact,
  onToggleExact,
  reducedMotion,
}: {
  label: string;
  value: number;
  lang: Language;
  icon: React.ReactNode;
  showExact: boolean;
  onToggleExact: () => void;
  reducedMotion: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const [pulsing, setPulsing] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const prev = prevValueRef.current;
    if (prev === value) return;
    prevValueRef.current = value;

    if (reducedMotion) {
      setDisplayValue(value);
      return;
    }

    setPulsing(true);
    const start = performance.now();
    const duration = 240;
    let rafId = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(prev + (value - prev) * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setDisplayValue(value);
        setPulsing(false);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value, reducedMotion]);

  const formatted = formatLedgerNumber(displayValue, lang, showExact);
  const exactFormatted = formatLedgerNumber(value, lang, true);
  const isLongNumber = formatted.length >= 6;

  return (
    <button
      type="button"
      onClick={onToggleExact}
      title={`${label}: ${exactFormatted}`}
      aria-label={`${label}: ${exactFormatted}`}
      className="min-h-[60px] px-1.5 py-2 rounded-xl bg-surface-card hover:bg-surface-secondary border border-border-subtle flex flex-col items-center justify-center gap-1 text-center transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
    >
      <div
        className={`${
          isLongNumber ? 'text-[15px] sm:text-[18px]' : 'text-[18px] sm:text-[20px]'
        } font-semibold font-mono tabular-nums text-ink-primary leading-none whitespace-nowrap transition-transform duration-200 ${
          pulsing ? 'scale-[1.04] text-accent-amber' : ''
        }`}
      >
        {formatted}
      </div>
      <div className="inline-flex items-center justify-center gap-1 text-xs font-normal text-ink-muted leading-tight whitespace-nowrap">
        <span className="shrink-0 opacity-90 [&>svg]:w-3.5 [&>svg]:h-3.5">{icon}</span>
        <span>{label}</span>
      </div>
    </button>
  );
}


function getUnrestStatus(unrest: number, lang: Language) {
  const ui = ESTATES_LEDGER_UI[lang];
  if (unrest >= 70) {
    return {
      level: 'critical' as const,
      label: ui.statusCritical,
      sentence: ui.unrestSentenceCritical,
      dotClass: 'bg-blood-500',
      barClass: 'bg-blood-500',
      textClass: 'text-accent-crimson',
    };
  }
  if (unrest >= 40) {
    return {
      level: 'uneasy' as const,
      label: ui.statusUneasy,
      sentence: ui.unrestSentenceUneasy,
      dotClass: 'bg-gold-500',
      barClass: 'bg-gold-500',
      textClass: 'text-accent-amber',
    };
  }
  return {
    level: 'calm' as const,
    label: ui.statusCalm,
    sentence: ui.unrestSentenceCalm,
    dotClass: 'bg-status-emerald',
    barClass: 'bg-status-emerald',
    textClass: 'text-accent-emerald',
  };
}

function holdingNeedsAttention(h: Holding): boolean {
  return (h.unrest ?? 15) >= 60 || (h.garrison ?? 4) <= 2;
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
}: RealmPanelProps) {
  const lang = state.settings.language;
  const isFa = lang === 'fa';
  const ui = ESTATES_LEDGER_UI[lang];
  const prefersReducedMotion = Boolean(useReducedMotion());

  const [tab, setTab] = useState<'holdings' | 'fleet' | 'politics'>('holdings');
  const [fleetCategory, setFleetCategory] = useState<'all' | 'soldiers' | 'ships' | 'stables'>('all');

  // Inside-sheet 3-view segmented navigation for Estates, Cities & Buildings
  const [estatesView, setEstatesView] = useState<EstatesSubView>('estates');
  const [showExactNumbers, setShowExactNumbers] = useState(false);

  // List controls & Dedicated City Modal state (NO inline accordion)
  const [modalHoldingId, setModalHoldingId] = useState<string | null>(null);
  const [cityModalTab, setCityModalTab] = useState<CityModalTab>('overview');
  const [recentlyClosedHoldingId, setRecentlyClosedHoldingId] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<HoldingsSortKey>('attention');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(30);

  // Selected holding for the Build view
  const [selectedHoldingId, setSelectedHoldingId] = useState<string>(
    state.realm.holdings[0]?.settlementId ?? ''
  );

  // Subtle inline feedback toast (shown both in modal and on sheet)
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const highlightTimerRef = useRef<number | null>(null);

  // Refs for focus restoration and history handling
  const rowButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const historyPushedRef = useRef(false);

  // Preserve scroll position per sub-view and across CityModal open/close
  const viewContainerRef = useRef<HTMLDivElement | null>(null);
  const savedModalScrollTopRef = useRef<number>(0);
  const scrollPositionsRef = useRef<Record<EstatesSubView, number>>({
    estates: 0,
    build: 0,
    opportunities: 0,
  });

  const getScrollContainer = (): HTMLElement | null => {
    if (!viewContainerRef.current) return null;
    return (
      (viewContainerRef.current.closest('.overflow-y-auto') as HTMLElement | null) ??
      viewContainerRef.current
    );
  };

  const triggerToast = (message: string) => {
    setFeedbackToast(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setFeedbackToast(null);
    }, 2600);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      if (highlightTimerRef.current) window.clearTimeout(highlightTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (initialSection === 'fleet') setTab('fleet');
    else if (initialSection === 'politics' || initialSection === 'intrigue') setTab('politics');
    else setTab('holdings');
  }, [initialSection]);

  // Ensure selectedHoldingId stays valid if holdings change
  useEffect(() => {
    if (
      state.realm.holdings.length > 0 &&
      !state.realm.holdings.some((h) => h.settlementId === selectedHoldingId)
    ) {
      setSelectedHoldingId(state.realm.holdings[0].settlementId);
    }
  }, [state.realm.holdings, selectedHoldingId]);

  const closeCityModal = (closedFromPopState = false) => {
    const closingId = modalHoldingId;
    setModalHoldingId(null);

    if (historyPushedRef.current && !closedFromPopState) {
      historyPushedRef.current = false;
      try {
        window.history.back();
      } catch {
        // Ignore history errors in restricted iframe environments
      }
    } else {
      historyPushedRef.current = false;
    }

    if (closingId) {
      setRecentlyClosedHoldingId(closingId);
      if (highlightTimerRef.current) window.clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = window.setTimeout(() => {
        setRecentlyClosedHoldingId(null);
      }, 1500);

      const savedScrollTop = savedModalScrollTopRef.current;
      requestAnimationFrame(() => {
        const scrollEl = getScrollContainer();
        if (scrollEl) {
          scrollEl.scrollTop = savedScrollTop;
        }
        rowButtonRefs.current[closingId]?.focus({ preventScroll: true });
      });
    }
  };

  const openCityModal = (settlementId: string, initialTab: CityModalTab = 'overview') => {
    const scrollEl = getScrollContainer();
    if (scrollEl) {
      savedModalScrollTopRef.current = scrollEl.scrollTop;
      scrollPositionsRef.current[estatesView] = scrollEl.scrollTop;
    }

    setModalHoldingId(settlementId);
    setSelectedHoldingId(settlementId);
    setCityModalTab(initialTab);

    if (!historyPushedRef.current) {
      try {
        window.history.pushState({ cityModal: settlementId }, '');
        historyPushedRef.current = true;
      } catch {
        // Ignore in sandboxed contexts
      }
    }
  };

  // Close gracefully if the open holding is lost while modal is open
  useEffect(() => {
    if (!modalHoldingId) return;
    const stillHeld = state.realm.holdings.some((h) => h.settlementId === modalHoldingId);
    if (!stillHeld) {
      closeCityModal(true);
      triggerToast(ui.cityLostToast);
    }
  }, [state.realm.holdings, modalHoldingId]);

  const handleSwitchEstatesView = (nextView: EstatesSubView) => {
    const scrollEl = getScrollContainer();
    if (scrollEl) {
      scrollPositionsRef.current[estatesView] = scrollEl.scrollTop;
    }
    setEstatesView(nextView);
    requestAnimationFrame(() => {
      const nextScrollEl = getScrollContainer();
      if (nextScrollEl) {
        nextScrollEl.scrollTop = scrollPositionsRef.current[nextView] ?? 0;
      }
    });
  };

  const num = (val: number | string) => (isFa ? toPersianDigits(val) : String(val));

  const getSettlementDisplayName = (settlementId: string) => {
    const sData = SETTLEMENTS_BY_ID[settlementId];
    const raw = isFa
      ? SETTLEMENTS_FA[settlementId]?.name ?? sData?.name ?? settlementId
      : sData?.name ?? settlementId;
    return raw.split(' (')[0].trim();
  };

  const getSettlementRegionName = (settlementId: string) => {
    const sData = SETTLEMENTS_BY_ID[settlementId];
    const raw = isFa
      ? SETTLEMENTS_FA[settlementId]?.name ?? sData?.name ?? ''
      : sData?.name ?? '';
    const match = raw.match(/\(([^)]+)\)/);
    return match ? match[1].trim() : null;
  };

  const allBuildingKeys = Object.keys(BUILDINGS_CATALOG) as BuildingType[];
  const claimableRank = getClaimableNextTitle(state);
  const winGoal = WIN_GOALS.find((w) => w.id === state.winGoalId) ?? WIN_GOALS[0];
  const winGoalFa = WIN_GOALS_FA[winGoal.id];

  const boathouseActive = hasBoathouse(state);
  const rawShipUpkeep = state.realm.longships * 4 + state.realm.knarrs * 2;
  const shipUpkeep = boathouseActive ? Math.floor(rawShipUpkeep * 0.5) : rawShipUpkeep;
  const warriorUpkeep = Math.floor(Math.max(0, state.realm.hirdWarriors - 4) * 0.45);
  const totalUpkeep = shipUpkeep + warriorUpkeep;
  const totalShips = state.realm.longships + state.realm.knarrs;

  const currentLocId = state.character.locationId;
  const currentLocName = getSettlementDisplayName(currentLocId);
  const locIsFortified = isFortifiedEnemyCity(state, currentLocId);
  const used = state.yearlyActivitiesUsed ?? {};
  const builtThisYear = Boolean(state.builtThisYear);

  const activeHolding =
    state.realm.holdings.find((h) => h.settlementId === selectedHoldingId) ??
    state.realm.holdings[0];

  const specialTitles = checkSpecialTitles(state);

  // Filter & sort holdings for the Estates ledger view
  const sortedHoldings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const list = state.realm.holdings.filter((h) => {
      if (!query) return true;
      const sData = SETTLEMENTS_BY_ID[h.settlementId];
      const faName = SETTLEMENTS_FA[h.settlementId]?.name ?? '';
      const enName = sData?.name ?? h.settlementId;
      const jarlRaw = h.appointedJarl ?? '';
      const jarlFa = jarlRaw ? formatPersonName(jarlRaw, 'fa') : '';
      return (
        faName.toLowerCase().includes(query) ||
        enName.toLowerCase().includes(query) ||
        jarlRaw.toLowerCase().includes(query) ||
        jarlFa.toLowerCase().includes(query)
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'attention') {
        const aAttn = holdingNeedsAttention(a) ? 1 : 0;
        const bAttn = holdingNeedsAttention(b) ? 1 : 0;
        if (bAttn !== aAttn) return bAttn - aAttn;
        const aUnrest = a.unrest ?? 15;
        const bUnrest = b.unrest ?? 15;
        if (bUnrest !== aUnrest) return bUnrest - aUnrest;
        return (a.garrison ?? 4) - (b.garrison ?? 4);
      }
      if (sortBy === 'farms') {
        return b.farms - a.farms;
      }
      if (sortBy === 'garrison') {
        return (a.garrison ?? 4) - (b.garrison ?? 4);
      }
      const nameA = getSettlementDisplayName(a.settlementId);
      const nameB = getSettlementDisplayName(b.settlementId);
      return nameA.localeCompare(nameB, isFa ? 'fa' : 'en');
    });
  }, [state.realm.holdings, searchQuery, sortBy, isFa]);

  const windowedHoldings = useMemo(
    () => sortedHoldings.slice(0, visibleLimit),
    [sortedHoldings, visibleLimit]
  );

  const attentionCount = useMemo(
    () => state.realm.holdings.filter(holdingNeedsAttention).length,
    [state.realm.holdings]
  );

  // Active holding for the City Modal + Prev/Next navigation within sortedHoldings
  const modalHoldingIndex = useMemo(() => {
    if (!modalHoldingId) return -1;
    const idxInSorted = sortedHoldings.findIndex((h) => h.settlementId === modalHoldingId);
    if (idxInSorted !== -1) return idxInSorted;
    return state.realm.holdings.findIndex((h) => h.settlementId === modalHoldingId);
  }, [modalHoldingId, sortedHoldings, state.realm.holdings]);

  const modalNavList = sortedHoldings.length > 0 ? sortedHoldings : state.realm.holdings;
  const modalHolding = modalHoldingId
    ? state.realm.holdings.find((h) => h.settlementId === modalHoldingId) ?? null
    : null;

  const stepModalCity = (delta: number) => {
    if (modalNavList.length <= 1 || modalHoldingIndex === -1) return;
    const nextIdx = (modalHoldingIndex + delta + modalNavList.length) % modalNavList.length;
    const nextHolding = modalNavList[nextIdx];
    if (nextHolding) {
      setModalHoldingId(nextHolding.settlementId);
      setSelectedHoldingId(nextHolding.settlementId);
    }
  };

  const showTopSectionSwitcher =
    initialSection === 'fleet' || initialSection === 'politics' || initialSection === 'intrigue';

  return (
    <div className="flex flex-col overflow-hidden space-y-3.5 text-start">
      {/* Optional Section Switcher when opened via Fleet or Intrigue */}
      {showTopSectionSwitcher && (
        <div
          role="tablist"
          aria-label={isFa ? 'بخش‌های قلمرو' : 'Realm Sections'}
          className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-surface-card border border-border-subtle"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'holdings'}
            onClick={() => setTab('holdings')}
            className={`min-h-[44px] px-2.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${
              tab === 'holdings'
                ? 'bg-gold-500 text-nordic-950'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-secondary'
            }`}
          >
            <Castle className="w-4 h-4 shrink-0" />
            <span>{isFa ? 'املاک و شهرها' : 'Estates'}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={tab === 'fleet'}
            onClick={() => setTab('fleet')}
            className={`min-h-[44px] px-2.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${
              tab === 'fleet'
                ? 'bg-gold-500 text-nordic-950'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-secondary'
            }`}
          >
            <Ship className="w-4 h-4 shrink-0" />
            <span>{isFa ? 'ناوگان و سپاه' : 'Fleet & Warband'}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={tab === 'politics'}
            onClick={() => setTab('politics')}
            className={`min-h-[44px] px-2.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${
              tab === 'politics'
                ? 'bg-gold-500 text-nordic-950'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-secondary'
            }`}
          >
            <Crown className="w-4 h-4 shrink-0" />
            <span>{isFa ? 'سیاست و توطئه' : 'Intrigue'}</span>
          </button>
        </div>
      )}

      {/* Active Battle Card (If Ongoing) */}
      {state.activeBattle && (
        <div className="p-4 rounded-2xl bg-surface-secondary border border-blood-500/60 flex flex-col overflow-hidden space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-2.5">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-accent-crimson" />
              <div className="font-saga text-[15px] font-semibold text-ink-primary">
                {isFa
                  ? `میدان نبرد: یورش به «${state.activeBattle.targetNameFa}»`
                  : `Battlefield: Assault on ${state.activeBattle.targetName}`}
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-blood-500/15 text-accent-crimson border border-blood-500/35">
              {isFa
                ? `راند ${toPersianDigits(state.activeBattle.round)}`
                : `Round ${state.activeBattle.round}`}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-surface-card border border-border-subtle space-y-1">
              <div className="text-accent-emerald font-semibold flex items-center justify-between">
                <span>{isFa ? 'سپاه شما' : 'Your Warband'}</span>
                <span className="font-mono tabular-nums">
                  {num(state.activeBattle.playerWarriors)}
                </span>
              </div>
              <div className="text-xs text-ink-muted">
                {isFa
                  ? `روحیه: ${num(state.activeBattle.playerMorale)}٪`
                  : `Morale: ${state.activeBattle.playerMorale}%`}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-secondary border border-border-subtle space-y-1">
              <div className="text-accent-crimson font-semibold flex items-center justify-between">
                <span>{isFa ? 'مدافعان دژ' : 'Garrison Defenders'}</span>
                <span className="font-mono tabular-nums">
                  {num(state.activeBattle.enemyWarriors)}
                </span>
              </div>
              <div className="text-xs text-ink-muted">
                {isFa
                  ? `روحیه دشمن: ${num(state.activeBattle.enemyMorale)}٪`
                  : `Enemy Morale: ${state.activeBattle.enemyMorale}%`}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-card border border-border-subtle text-xs text-ink-secondary space-y-1 max-h-24 overflow-y-auto">
            {(isFa ? state.activeBattle.logFa : state.activeBattle.log).map((entry, idx) => (
              <div key={idx} className="leading-relaxed">
                ⚔️ {entry}
              </div>
            ))}
          </div>

          {onResolveBattleTactic && (
            <div className="space-y-2 pt-1">
              <div className="text-xs font-semibold text-accent-amber">
                {isFa ? 'دستور تاکتیکی فرمانده:' : 'Choose Commander Tactic:'}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onResolveBattleTactic('shield_wall')}
                  className="min-h-[44px] p-2.5 rounded-xl bg-surface-card border border-border-subtle hover:border-gold-500 text-xs font-semibold text-ink-primary cursor-pointer"
                >
                  🛡️ {isFa ? 'دیوار سپرها' : 'Shield Wall'}
                </button>
                <button
                  type="button"
                  onClick={() => onResolveBattleTactic('svinfylking')}
                  className="min-h-[44px] p-2.5 rounded-xl bg-surface-card border border-border-subtle hover:border-gold-500 text-xs font-semibold text-ink-primary cursor-pointer"
                >
                  🐗 {isFa ? 'پوزه گراز' : "Boar's Snout"}
                </button>
                <button
                  type="button"
                  onClick={() => onResolveBattleTactic('ambush')}
                  className="min-h-[44px] p-2.5 rounded-xl bg-surface-card border border-border-subtle hover:border-gold-500 text-xs font-semibold text-ink-primary cursor-pointer"
                >
                  🌲 {isFa ? 'شبیخون از دل مه' : 'Mist Ambush'}
                </button>
                <button
                  type="button"
                  onClick={() => onResolveBattleTactic('flank_assault')}
                  className="min-h-[44px] p-2.5 rounded-xl bg-surface-card border border-border-subtle hover:border-gold-500 text-xs font-semibold text-ink-primary cursor-pointer"
                >
                  ⛵ {isFa ? 'دور زدن از جناحین' : 'Flank Assault'}
                </button>
                <button
                  type="button"
                  onClick={() => onResolveBattleTactic('berserk_charge')}
                  className="min-h-[44px] p-2.5 rounded-xl bg-surface-card border border-border-subtle hover:border-gold-500 text-xs font-semibold text-ink-primary cursor-pointer"
                >
                  ⚡ {isFa ? 'حمله برزرکرها' : 'Berserk Charge'}
                </button>
                <button
                  type="button"
                  onClick={() => onResolveBattleTactic('orderly_retreat')}
                  className="min-h-[44px] p-2.5 rounded-xl bg-surface-card border border-border-subtle hover:border-border-strong text-xs font-semibold text-ink-muted cursor-pointer"
                >
                  📯 {isFa ? 'عقب‌نشینی' : 'Sound Retreat'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 1: ESTATES, CITIES & BUILDINGS ("QUIET SAGA LEDGER" REDESIGN)     */}
      {/* ===================================================================== */}
      {tab === 'holdings' && (
        <div ref={viewContainerRef} className="flex flex-col space-y-3.5">
          {/* 1) HEADER — REALM AT A GLANCE (4 COMPACT STAT TILES) */}
          <div className="grid grid-cols-2 min-[340px]:grid-cols-4 gap-2">
            <AnimatedStatTile
              label={ui.statSilver}
              value={state.realm.silver}
              lang={lang}
              icon={<Coins className="w-4 h-4 text-accent-amber" />}
              showExact={showExactNumbers}
              onToggleExact={() => setShowExactNumbers((v) => !v)}
              reducedMotion={prefersReducedMotion}
            />
            <AnimatedStatTile
              label={ui.statFarms}
              value={state.realm.landFarms}
              lang={lang}
              icon={<Wheat className="w-4 h-4 text-accent-emerald" />}
              showExact={showExactNumbers}
              onToggleExact={() => setShowExactNumbers((v) => !v)}
              reducedMotion={prefersReducedMotion}
            />
            <AnimatedStatTile
              label={ui.statShips}
              value={totalShips}
              lang={lang}
              icon={<Ship className="w-4 h-4 text-accent-ice" />}
              showExact={showExactNumbers}
              onToggleExact={() => setShowExactNumbers((v) => !v)}
              reducedMotion={prefersReducedMotion}
            />
            <AnimatedStatTile
              label={ui.statWarriors}
              value={state.realm.hirdWarriors}
              lang={lang}
              icon={<Swords className="w-4 h-4 text-ink-secondary" />}
              showExact={showExactNumbers}
              onToggleExact={() => setShowExactNumbers((v) => !v)}
              reducedMotion={prefersReducedMotion}
            />
          </div>

          {/* 2) SEGMENTED CONTROL: ESTATES · BUILD · OPPORTUNITIES */}
          <div
            role="tablist"
            aria-label={isFa ? 'نمای مدیریت املاک' : 'Estates Ledger Views'}
            className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-surface-card border border-border-subtle"
          >
            {(
              [
                {
                  id: 'estates' as const,
                  label: ui.viewEstates,
                  count: state.realm.holdings.length,
                  hasAlert: attentionCount > 0,
                },
                {
                  id: 'build' as const,
                  label: ui.viewBuild,
                  count: activeHolding ? activeHolding.buildings.length : 0,
                  hasAlert: false,
                },
                {
                  id: 'opportunities' as const,
                  label: ui.viewOpportunities,
                  count: claimableRank ? 1 : 0,
                  hasAlert: Boolean(claimableRank) || (!used.settle && state.realm.silver >= 35),
                },
              ] as const
            ).map((seg) => {
              const isSelected = estatesView === seg.id;
              return (
                <button
                  key={seg.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleSwitchEstatesView(seg.id)}
                  className={`min-h-[44px] px-2 py-2 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${
                    isSelected
                      ? 'bg-gold-500 text-nordic-950'
                      : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-secondary'
                  }`}
                >
                  <span className="whitespace-nowrap">{seg.label}</span>
                  {seg.id === 'estates' && (
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-xs font-mono tabular-nums ${
                        isSelected
                          ? 'bg-surface-canvas/15 text-nordic-950'
                          : 'bg-surface-secondary text-ink-muted'
                      }`}
                    >
                      {num(seg.count)}
                    </span>
                  )}
                  {seg.hasAlert && !isSelected && (
                    <span
                      className="w-2 h-2 rounded-full bg-gold-500 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Gentle Inline Action Toast (when City Modal is closed) */}
          {feedbackToast && !modalHolding && (
            <div
              role="status"
              aria-live="polite"
              className="px-3.5 py-2.5 rounded-xl bg-surface-card border border-gold-500/45 flex items-center gap-2 text-xs font-semibold text-ink-primary transition-opacity"
            >
              <span className="w-5 h-5 rounded-full bg-gold-500/20 text-accent-amber flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </span>
              <span>{feedbackToast}</span>
            </div>
          )}

          {/* =============================================================== */}
          {/* VIEW A: ESTATES LEDGER (COMPACT ROWS -> OPENS CITY MODAL)       */}
          {/* =============================================================== */}
          {estatesView === 'estates' && (
            <div className="space-y-3">
              {state.realm.holdings.length === 0 ? (
                <div className="p-6 rounded-2xl bg-surface-card border border-border-subtle text-center space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-surface-secondary text-accent-amber flex items-center justify-center mx-auto">
                    <Castle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h4 className="text-[15px] font-semibold text-ink-primary">
                      {ui.emptyHoldingsTitle}
                    </h4>
                    <p className="text-sm font-normal text-ink-muted leading-relaxed">
                      {ui.emptyHoldingsDesc}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSwitchEstatesView('opportunities')}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-nordic-950 text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>{ui.emptyHoldingsCta}</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Sort / Filter Bar + Optional Search Toggle */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex flex-wrap items-center gap-1">
                        <ArrowUpDown className="w-3.5 h-3.5 text-ink-muted shrink-0 me-0.5" />
                        {(
                          [
                            { id: 'attention' as const, label: ui.sortAttention },
                            { id: 'farms' as const, label: ui.sortFarms },
                            { id: 'garrison' as const, label: ui.sortGarrison },
                            { id: 'alpha' as const, label: ui.sortAlpha },
                          ] as const
                        ).map((s) => {
                          const active = sortBy === s.id;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setSortBy(s.id)}
                              className={`min-h-[36px] px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${
                                active
                                  ? 'bg-surface-secondary text-accent-amber border border-gold-500/45'
                                  : 'bg-surface-card text-ink-muted hover:text-ink-primary border border-border-subtle'
                              }`}
                            >
                              {s.label}
                              {s.id === 'attention' && attentionCount > 0 && (
                                <span className="ms-1 font-mono tabular-nums text-accent-amber">
                                  ({num(attentionCount)})
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowSearchBar((v) => !v)}
                        aria-expanded={showSearchBar || state.realm.holdings.length >= 15}
                        aria-label={ui.searchPlaceholder}
                        className={`min-h-[36px] min-w-[36px] px-2 py-1 rounded-lg border text-xs font-semibold inline-flex items-center justify-center gap-1 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${
                          showSearchBar || searchQuery
                            ? 'bg-surface-secondary text-accent-amber border-gold-500/45'
                            : 'bg-surface-card text-ink-muted hover:text-ink-primary border-border-subtle'
                        }`}
                      >
                        <Search className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {(showSearchBar || state.realm.holdings.length >= 15) && (
                      <div className="relative">
                        <Search className="w-4 h-4 text-ink-muted absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none" />
                        <input
                          type="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={ui.searchPlaceholder}
                          className="w-full min-h-[44px] ps-9 pe-3 py-2 rounded-xl bg-surface-card border border-border-subtle focus:border-gold-500 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Stable-Height Holdings List (Tapping Any Row Opens the City Modal) */}
                  <div className="rounded-2xl bg-surface-card border border-border-subtle divide-y divide-border-subtle overflow-hidden">
                    {windowedHoldings.map((h) => {
                      const sName = getSettlementDisplayName(h.settlementId);
                      const sRegion = getSettlementRegionName(h.settlementId);
                      const unrest = h.unrest ?? 15;
                      const garrison = h.garrison ?? 4;
                      const status = getUnrestStatus(unrest, lang);
                      const needsAttn = holdingNeedsAttention(h);
                      const isRecentlyClosed = recentlyClosedHoldingId === h.settlementId;

                      const jarlFaName = h.appointedJarl
                        ? formatPersonName(h.appointedJarl, lang)
                        : null;

                      return (
                        <button
                          key={h.settlementId}
                          ref={(el) => {
                            rowButtonRefs.current[h.settlementId] = el;
                          }}
                          type="button"
                          onClick={() => openCityModal(h.settlementId, 'overview')}
                          className={`relative w-full min-h-[58px] px-3 py-2.5 flex items-center justify-between gap-2 text-start cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-500 ${
                            isRecentlyClosed
                              ? 'bg-surface-secondary ring-1 ring-inset ring-gold-500/60'
                              : 'hover:bg-surface-secondary/70 active:bg-surface-secondary'
                          }`}
                        >
                          {/* Subtle attention accent bar on the start edge */}
                          {needsAttn && (
                            <span
                              className={`absolute top-2 bottom-2 start-0 w-1 rounded-e-full ${
                                unrest >= 70 ? 'bg-blood-500' : 'bg-gold-500'
                              }`}
                              aria-hidden="true"
                            />
                          )}

                          {/* Start: Settlement Name + Jarl Line */}
                          <div className="min-w-0 flex-1 pe-1">
                            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                              <span className="text-[15px] font-semibold text-ink-primary leading-snug">
                                {sName}
                              </span>
                              {sRegion && (
                                <span className="text-xs font-normal text-ink-muted">
                                  ({sRegion})
                                </span>
                              )}
                            </div>

                            <div className="text-xs font-normal text-ink-muted mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 leading-snug">
                              {h.appointedJarl ? (
                                <>
                                  <span className="text-ink-secondary">
                                    {ui.jarlPrefix}: {jarlFaName}
                                  </span>
                                  {isFa && (
                                    <bdi
                                      dir="ltr"
                                      className="text-xs text-ink-muted font-mono"
                                    >
                                      ({h.appointedJarl})
                                    </bdi>
                                  )}
                                </>
                              ) : (
                                <span>{ui.noJarlAssigned}</span>
                              )}
                            </div>
                          </div>

                          {/* End: 3 Mini-Metrics (Farms, Garrison, Unrest Bar + Dot) + RTL-Correct Open Chevron */}
                          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                            {/* Metric 1: Farms */}
                            <div className="text-center font-mono tabular-nums min-w-[32px]">
                              <div className="text-sm font-semibold text-ink-primary leading-tight">
                                {num(h.farms)}
                              </div>
                              <div className="text-xs font-normal text-ink-muted whitespace-nowrap">
                                {ui.farmsShort}
                              </div>
                            </div>

                            {/* Metric 2: Garrison */}
                            <div className="text-center font-mono tabular-nums min-w-[36px]">
                              <div
                                className={`text-sm font-semibold leading-tight ${
                                  garrison <= 2 ? 'text-accent-amber' : 'text-ink-primary'
                                }`}
                              >
                                {num(garrison)}
                              </div>
                              <div className="text-xs font-normal text-ink-muted whitespace-nowrap">
                                {ui.garrisonShort}
                              </div>
                            </div>

                            {/* Metric 3: Unrest thin bar + status dot + word */}
                            <div className="w-[58px] flex flex-col items-end gap-1">
                              <div className="flex items-center gap-1 text-xs font-semibold whitespace-nowrap">
                                <span
                                  className={`w-2 h-2 rounded-full ${status.dotClass} shrink-0`}
                                  aria-hidden="true"
                                />
                                <span className={status.textClass}>{status.label}</span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-surface-interactive overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${status.barClass}`}
                                  style={{ width: `${Math.min(100, unrest)}%` }}
                                />
                              </div>
                            </div>

                            {/* RTL-correct "open" chevron (pointing left in Persian, right in English) */}
                            <div className="text-ink-muted ps-0.5">
                              {isFa ? (
                                <ChevronLeft className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Windowing "Load More" for 30+ holdings */}
                  {sortedHoldings.length > visibleLimit && (
                    <button
                      type="button"
                      onClick={() => setVisibleLimit((v) => v + 30)}
                      className="w-full min-h-[44px] py-2 rounded-xl bg-surface-card hover:bg-surface-secondary border border-border-subtle text-xs font-semibold text-ink-secondary cursor-pointer"
                    >
                      {isFa
                        ? `نمایش املاک بیشتر (${num(sortedHoldings.length - visibleLimit)} مورد باقی‌مانده)`
                        : `Show more estates (${sortedHoldings.length - visibleLimit} remaining)`}
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* VIEW B: BUILD (CONSTRUCTION IN SELECTED HOLDING)                */}
          {/* =============================================================== */}
          {estatesView === 'build' && (
            <div className="space-y-3.5">
              {!activeHolding ? (
                <div className="p-6 rounded-2xl bg-surface-card border border-border-subtle text-center space-y-3">
                  <p className="text-sm text-ink-muted">{ui.emptyHoldingsDesc}</p>
                  <button
                    type="button"
                    onClick={() => handleSwitchEstatesView('opportunities')}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-gold-500 text-nordic-950 text-sm font-semibold cursor-pointer"
                  >
                    {ui.emptyHoldingsCta}
                  </button>
                </div>
              ) : (
                <>
                  {/* Estate Selector Strip + Yearly Quota Status Pill */}
                  <div className="p-3.5 rounded-2xl bg-surface-card border border-border-subtle space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-ink-muted">
                        {ui.buildSelectCityLabel}
                      </span>
                      {builtThisYear ? (
                        <span
                          aria-disabled="true"
                          className="px-2.5 py-1 rounded-full bg-surface-secondary border border-border-subtle text-xs font-normal text-ink-muted inline-flex items-center gap-1.5 select-none"
                        >
                          <Check className="w-3.5 h-3.5 text-accent-emerald" />
                          <span>{ui.doneThisSeason}</span>
                        </span>
                      ) : (
                        <span className="text-xs font-normal text-ink-secondary">
                          {ui.buildQuotaAvailable}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 max-h-[120px] overflow-y-auto p-0.5">
                      {state.realm.holdings.map((h) => {
                        const sName = getSettlementDisplayName(h.settlementId);
                        const selected = h.settlementId === activeHolding.settlementId;
                        return (
                          <button
                            key={h.settlementId}
                            type="button"
                            onClick={() => setSelectedHoldingId(h.settlementId)}
                            className={`min-h-[38px] px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap inline-flex items-center gap-1.5 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${
                              selected
                                ? 'bg-gold-500 text-nordic-950'
                                : 'bg-surface-secondary text-ink-secondary hover:text-ink-primary'
                            }`}
                          >
                            <span>{sName}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs font-mono tabular-nums ${
                                selected
                                  ? 'bg-surface-canvas/15 text-nordic-950'
                                  : 'bg-surface-card text-ink-muted'
                              }`}
                            >
                              {num(h.buildings.length)}/{num(allBuildingKeys.length)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Buildings Catalog List */}
                  <div className="rounded-2xl bg-surface-card border border-border-subtle divide-y divide-border-subtle overflow-hidden">
                    {allBuildingKeys.map((bKey) => {
                      const bDef = BUILDINGS_CATALOG[bKey];
                      const bFa = BUILDINGS_FA[bKey];
                      const bName = isFa ? bFa?.name ?? bDef.name : bDef.name;
                      const bDesc = isFa
                        ? bFa?.description ?? bDef.description
                        : bDef.description;
                      const built = activeHolding.buildings.includes(bKey);
                      const wrongFaith =
                        bDef.religionReq !== undefined &&
                        state.character.religion !== bDef.religionReq;
                      const missingSilver = Math.max(0, bDef.costSilver - state.realm.silver);
                      const canBuild =
                        !built && !wrongFaith && !builtThisYear && missingSilver === 0;
                      const activeCityName = getSettlementDisplayName(
                        activeHolding.settlementId
                      );

                      return (
                        <div
                          key={bKey}
                          className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[15px] font-semibold text-ink-primary">
                                {bName}
                              </span>
                              {!built && (
                                <span className="px-2 py-0.5 rounded-md bg-surface-secondary text-xs font-mono font-semibold tabular-nums text-accent-amber">
                                  {num(bDef.costSilver)} {ui.chipSilver}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-normal text-ink-muted leading-relaxed">
                              {bDesc}
                            </p>
                          </div>

                          {/* Right / End Action or Calm Non-Interactive Done Pill */}
                          <div className="shrink-0">
                            {built ? (
                              <span
                                aria-disabled="true"
                                className="min-h-[40px] px-3 py-1.5 rounded-full bg-surface-secondary border border-border-subtle text-xs font-normal text-ink-muted inline-flex items-center gap-1.5 select-none"
                              >
                                <Check className="w-3.5 h-3.5 text-accent-emerald" />
                                <span>{ui.builtPermanent}</span>
                              </span>
                            ) : builtThisYear ? (
                              <span
                                aria-disabled="true"
                                className="min-h-[40px] px-3 py-1.5 rounded-full bg-surface-secondary border border-border-subtle text-xs font-normal text-ink-muted inline-flex items-center gap-1.5 select-none"
                              >
                                <Check className="w-3.5 h-3.5 text-ink-muted" />
                                <span>{ui.doneThisSeason}</span>
                              </span>
                            ) : wrongFaith ? (
                              <span className="min-h-[40px] px-3 py-1.5 rounded-xl bg-surface-secondary text-xs font-normal text-ink-muted inline-flex items-center">
                                {ui.needDifferentFaith}
                              </span>
                            ) : missingSilver > 0 ? (
                              <span className="min-h-[40px] px-3 py-1.5 rounded-xl bg-surface-secondary text-xs font-normal text-ink-muted inline-flex items-center">
                                {ui.needMoreSilver(missingSilver)}
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={!canBuild}
                                onClick={() => {
                                  onBuildHoldingStructure(activeHolding.settlementId, bKey);
                                  triggerToast(ui.toastBuiltStructure(bName, activeCityName));
                                }}
                                className="min-h-[44px] px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-nordic-950 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                              >
                                <Hammer className="w-4 h-4" />
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
                </>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* VIEW C: OPPORTUNITIES (BUY FARM / CONQUER / RANK / DYNASTY GOAL)*/}
          {/* =============================================================== */}
          {estatesView === 'opportunities' && (
            <div className="space-y-3.5">
              {/* 1. Current Port Opportunity (Buy Farmland or Storm Stronghold) */}
              <div className="p-4 rounded-2xl bg-surface-card border border-border-subtle space-y-3">
                <div className="text-xs font-semibold text-ink-muted">
                  {ui.oppCurrentPortHeader}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-surface-secondary text-accent-amber flex items-center justify-center shrink-0">
                      {locIsFortified ? (
                        <Castle className="w-5 h-5" />
                      ) : (
                        <MapPin className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="text-[15px] font-semibold text-ink-primary">
                        {locIsFortified
                          ? isFa
                            ? `تسخیر دژ مستحکم ${currentLocName}`
                            : `Conquer Fortified ${currentLocName}`
                          : isFa
                            ? `خرید مزرعه جدید در ${currentLocName}`
                            : `Buy Farmland in ${currentLocName}`}
                      </div>
                      <div className="text-xs font-normal text-ink-muted leading-relaxed">
                        {locIsFortified
                          ? isFa
                            ? 'دژ مستحکم دشمن · نیازمند ۱ لانگ‌شیپ و ۱۲+ جنگجو'
                            : 'Enemy stronghold · Requires 1 Longship & 12+ Warriors'
                          : isFa
                            ? `آذوقه انبار: ${num(state.realm.foodStores)} · هزینه: ${num(35)} نقره`
                            : `Food stores: ${state.realm.foodStores} · Cost: 35 Silver`}
                      </div>
                    </div>
                  </div>

                  {/* Action or Calm Non-Interactive Done Pill */}
                  <div className="shrink-0">
                    {used.settle ? (
                      <span
                        aria-disabled="true"
                        className="min-h-[40px] px-3.5 py-1.5 rounded-full bg-surface-secondary border border-border-subtle text-xs font-normal text-ink-muted inline-flex items-center gap-1.5 select-none"
                      >
                        <Check className="w-3.5 h-3.5 text-accent-emerald" />
                        <span>{ui.doneThisSeason}</span>
                      </span>
                    ) : locIsFortified && onConquerCity ? (
                      state.realm.longships <= 0 || state.realm.hirdWarriors < 12 ? (
                        <span className="min-h-[40px] px-3 py-1.5 rounded-xl bg-surface-secondary text-xs font-normal text-ink-muted inline-flex items-center">
                          {ui.needShipsAndWarriors}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onConquerCity(currentLocId)}
                          className="min-h-[44px] px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-nordic-950 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Swords className="w-4 h-4" />
                          <span>{isFa ? 'یورش برای فتح' : 'Storm Stronghold'}</span>
                        </button>
                      )
                    ) : state.realm.silver < 35 ? (
                      <span className="min-h-[40px] px-3 py-1.5 rounded-xl bg-surface-secondary text-xs font-normal text-ink-muted inline-flex items-center">
                        {ui.needMoreSilver(35 - state.realm.silver)}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onClearFirstFarm();
                          triggerToast(ui.toastFarmBought(currentLocName));
                        }}
                        className="min-h-[44px] px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-nordic-950 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>
                          {isFa
                            ? `خرید مزرعه (${num(35)} نقره)`
                            : 'Buy Farm (35 Silver)'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <RuneDivider className="my-1" />

              {/* 2. Ruling Rank & Progression */}
              <div className="p-4 rounded-2xl bg-surface-card border border-border-subtle space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-surface-secondary text-accent-amber flex items-center justify-center shrink-0">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-normal text-ink-muted">
                        {ui.oppCrownHeader}
                      </div>
                      <div className="font-saga text-[20px] font-semibold text-ink-primary leading-snug mt-0.5">
                        {TITLE_LABELS[lang][state.character.title]}
                      </div>
                    </div>
                  </div>

                  <div className="text-end font-mono tabular-nums text-xs shrink-0 space-y-0.5">
                    <div className="text-accent-amber font-semibold">
                      {isFa
                        ? `${num(state.realm.fame)} شهرت`
                        : `${state.realm.fame} Fame`}
                    </div>
                    <div className="text-ink-muted">
                      {isFa
                        ? `ثبات ${num(state.realm.stability)}٪`
                        : `Stability ${state.realm.stability}%`}
                    </div>
                  </div>
                </div>

                <p className="text-xs font-normal text-ink-secondary leading-relaxed">
                  {getNextTitleRequirementText(state.character.title, lang)}
                </p>

                {claimableRank && (
                  <button
                    type="button"
                    onClick={onClaimRank}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-nordic-950 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Crown className="w-4 h-4 shrink-0" />
                    <span>
                      {isFa
                        ? `تاج‌گذاری به عنوان «${TITLE_LABELS.fa[claimableRank]}»`
                        : `Claim Title: ${TITLE_LABELS.en[claimableRank]}`}
                    </span>
                  </button>
                )}
              </div>

              {/* 3. Dynasty Saga Goal */}
              <div className="p-4 rounded-2xl bg-surface-card border border-border-subtle space-y-1.5">
                <div className="text-xs font-normal text-ink-muted">
                  {ui.oppGoalHeader}
                </div>
                <div className="text-[15px] font-semibold text-ink-primary">
                  {isFa ? winGoalFa?.title ?? winGoal.title : winGoal.title}
                </div>
                <p className="text-xs font-normal text-ink-muted leading-relaxed">
                  {isFa ? winGoalFa?.description ?? winGoal.description : winGoal.description}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* DEDICATED CITY MODAL (LAYERED ABOVE ESTATES SHEET)                    */}
      {/* ===================================================================== */}
      {modalHolding && (
        <CityModal
          holding={modalHolding}
          settlementName={getSettlementDisplayName(modalHolding.settlementId)}
          settlementRegion={getSettlementRegionName(modalHolding.settlementId)}
          state={state}
          currentIndex={modalHoldingIndex}
          totalCount={modalNavList.length}
          initialTab={cityModalTab}
          feedbackToast={feedbackToast}
          onTriggerToast={triggerToast}
          onClose={closeCityModal}
          onStepCity={stepModalCity}
          onBuildHoldingStructure={onBuildHoldingStructure}
          onSendSettlers={onSendSettlers}
          onStationGarrison={onStationGarrison}
          onSetTributeBurden={onSetTributeBurden}
          onAppointJarl={onAppointJarl}
          onTakeHostages={onTakeHostages}
          onToggleTolerance={onToggleTolerance}
          onExecutePlot={onExecutePlot}
        />
      )}

      {/* ===================================================================== */}
      {/* TAB 2: FLEET, WARBAND, SHIPYARD & STABLES                             */}
      {/* ===================================================================== */}
      {tab === 'fleet' &&
        (() => {
          const totalGarrison = state.realm.holdings.reduce(
            (sum, h) => sum + (h.garrison ?? 4),
            0
          );
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
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-surface-ice-tint via-surface-secondary to-surface-elevated border border-status-ice/40 space-y-3.5 overflow-hidden">
                <NorseCornerOrnament accent="ice" />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-status-ice/15 text-accent-ice ring-1 ring-status-ice/35 flex items-center justify-center shrink-0">
                      <Ship className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-saga text-lg sm:text-xl font-semibold text-ink-primary leading-snug">
                          {isFa
                            ? 'فرماندهی سپاه، کشتی‌سازی و اصطبل'
                            : 'Warband, Shipyard & Stables'}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${
                            siegeReady
                              ? 'bg-status-emerald/15 text-accent-emerald border-status-emerald/35'
                              : raidReady
                                ? 'bg-status-ice/15 text-accent-ice border-status-ice/35'
                                : 'bg-blood-500/15 text-accent-crimson border-blood-500/35'
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
                      <p className="text-xs text-ink-muted mt-0.5">
                        {isFa
                          ? `رزم ${num(state.character.skills.combat)} · دریانوردی ${num(state.character.skills.seamanship)} · سطح زره ${num(warGearTier)}${boathouseActive ? ' · اسکله فعال ✓' : ''}`
                          : `Combat ${state.character.skills.combat} · Sailing ${state.character.skills.seamanship} · Armory Lv.${warGearTier}${boathouseActive ? ' · Dock Active ✓' : ''}`}
                      </p>
                    </div>
                  </div>

                  {/* Top Right Treasury vs Upkeep Pill */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="px-3 py-1.5 rounded-xl bg-surface-card border border-border-subtle text-end font-mono tabular-nums">
                      <div className="text-xs text-ink-muted">
                        {isFa ? 'خزانه / نگهداری سالانه' : 'Treasury / Upkeep'}
                      </div>
                      <div className="text-xs font-semibold flex items-center justify-end gap-1.5 mt-0.5">
                        <span className="text-accent-amber">
                          {num(state.realm.silver)} {isFa ? 'نقره' : 'Ag'}
                        </span>
                        <span className="text-ink-muted">·</span>
                        <span className="text-accent-crimson">
                          -{num(totalUpkeep)}/{isFa ? 'سال' : 'yr'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4-Column Minimalist Telemetry Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-xl bg-surface-card border border-border-subtle flex flex-col justify-between">
                    <span className="text-xs text-ink-muted">
                      {isFa ? 'قدرت رزمی کل' : 'Combat Power'}
                    </span>
                    <div className="flex items-baseline justify-between gap-1 mt-1">
                      <span className="text-lg font-mono font-semibold tabular-nums text-accent-amber">
                        {num(combatPower)}
                      </span>
                      <span className="text-xs text-ink-secondary">
                        {warGearTier > 0
                          ? isFa
                            ? `زره +${num(warGearTier * 10)}`
                            : `Gear +${warGearTier * 10}`
                          : isFa
                            ? 'شاخص نبرد'
                            : 'Rating'}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-surface-card border border-border-subtle flex flex-col justify-between">
                    <span className="text-xs text-ink-muted">
                      {isFa ? 'کل سربازان سپاه' : 'Active Warband'}
                    </span>
                    <div className="flex items-baseline justify-between gap-1 mt-1">
                      <span className="text-lg font-mono font-semibold tabular-nums text-ink-primary">
                        {num(state.realm.hirdWarriors)}
                      </span>
                      <span className="text-xs text-ink-muted">
                        {isFa
                          ? `+${num(totalGarrison)} در پادگان`
                          : `+${totalGarrison} garrison`}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-surface-card border border-border-subtle flex flex-col justify-between">
                    <span className="text-xs text-ink-muted">
                      {isFa ? 'ناوگان دریایی' : 'Naval Fleet'}
                    </span>
                    <div className="flex items-baseline justify-between gap-1 mt-1">
                      <span className="text-lg font-mono font-semibold tabular-nums text-accent-ice">
                        {num(totalShips)}
                      </span>
                      <span className="text-xs text-ink-muted">
                        {isFa
                          ? `${num(state.realm.longships)} جنگی · ${num(state.realm.knarrs)} تجاری`
                          : `${state.realm.longships} War · ${state.realm.knarrs} Trade`}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-surface-card border border-border-subtle flex flex-col justify-between">
                    <span className="text-xs text-ink-muted">
                      {isFa ? 'اسب‌ها و ظرفیت حمل' : 'Horses & Sealift'}
                    </span>
                    <div className="flex items-baseline justify-between gap-1 mt-1">
                      <span className="text-lg font-mono font-semibold tabular-nums text-accent-emerald">
                        {num(totalHorses)}
                      </span>
                      <span className="text-xs text-ink-muted">
                        {isFa
                          ? `ظرفیت کشتی: ${num(sealiftCapacity)}`
                          : `Ship cap: ${sealiftCapacity}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Minimal Sealift & Readiness Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink-secondary">
                      {isFa
                        ? `ظرفیت حمل دریایی سپاه (${num(state.realm.hirdWarriors)} از ${num(sealiftCapacity)} جنگجو)`
                        : `Fleet Troop Sealift (${state.realm.hirdWarriors} / ${sealiftCapacity} warriors)`}
                    </span>
                    <span className="font-mono font-semibold text-accent-ice tabular-nums">
                      {sealiftCapacity > 0
                        ? `${num(sealiftUsagePct)}%`
                        : isFa
                          ? 'نیازمند ساخت کشتی جنگی'
                          : 'Build a Warship'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface-canvas overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        sealiftCapacity === 0
                          ? 'bg-blood-500'
                          : state.realm.hirdWarriors > sealiftCapacity
                            ? 'bg-gold-500'
                            : 'bg-gradient-to-r from-status-ice to-status-emerald'
                      }`}
                      style={{ width: `${sealiftCapacity === 0 ? 15 : sealiftUsagePct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Sleek Minimalist Sub-Category Filter Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-surface-card border border-border-subtle">
                {[
                  {
                    id: 'all' as const,
                    labelFa: 'همه بخش‌ها',
                    labelEn: 'All Forces',
                    badge: num(state.realm.hirdWarriors + totalShips + totalHorses),
                  },
                  {
                    id: 'soldiers' as const,
                    labelFa: 'سربازان و گارد',
                    labelEn: 'Soldiers',
                    badge: num(state.realm.hirdWarriors),
                  },
                  {
                    id: 'ships' as const,
                    labelFa: 'کارگاه کشتی‌سازی',
                    labelEn: 'Shipyard',
                    badge: num(totalShips),
                  },
                  {
                    id: 'stables' as const,
                    labelFa: 'اصطبل و اسلحه‌خانه',
                    labelEn: 'Horses & Gear',
                    badge: num(totalHorses),
                  },
                ].map((cat) => {
                  const active = fleetCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFleetCategory(cat.id)}
                      className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-1.5 cursor-pointer transition-all ${
                        active
                          ? 'bg-surface-interactive text-ink-primary border border-status-ice/50 shadow-sm'
                          : 'text-ink-muted hover:text-ink-primary border border-transparent'
                      }`}
                    >
                      <span className="truncate">{isFa ? cat.labelFa : cat.labelEn}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-md font-mono text-xs tabular-nums ${
                          active
                            ? 'bg-status-ice/20 text-accent-ice'
                            : 'bg-surface-secondary text-ink-muted'
                        }`}
                      >
                        {cat.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* SECTION 1: SOLDIERS & VIKING WARBAND ARCHETYPES */}
              {showSoldiers && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Swords className="w-4 h-4 text-accent-amber" />
                      <h4 className="font-saga text-sm sm:text-base font-semibold text-ink-primary">
                        {isFa
                          ? 'سربازگیری و واحدهای رزمی وایکینگ'
                          : 'Viking Warband & Soldier Recruitment'}
                      </h4>
                    </div>
                    <span className="text-xs text-ink-muted font-mono tabular-nums">
                      {isFa
                        ? `مجموع سپاه همراه: ${num(state.realm.hirdWarriors)} نفر`
                        : `Total Active: ${state.realm.hirdWarriors} men`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(
                      [
                        {
                          cat: MILITARY_CATALOG_BY_ID.bondi_spearmen,
                          count: bondiCount,
                          borderHover: 'hover:border-status-ice/55',
                          iconBox: 'bg-status-ice/15 border-status-ice/35 text-accent-ice',
                          textAccent: 'text-accent-ice',
                          btnClass: 'bg-status-ice hover:bg-status-ice',
                        },
                        {
                          cat: MILITARY_CATALOG_BY_ID.sworn_huscarls,
                          count: huscarlsCount,
                          borderHover: 'hover:border-gold-500/60',
                          iconBox: 'bg-gold-500/15 border-gold-500/35 text-accent-amber',
                          textAccent: 'text-accent-amber',
                          btnClass: 'bg-gold-500 hover:bg-gold-400',
                        },
                        {
                          cat: MILITARY_CATALOG_BY_ID.norse_archers,
                          count: archersCount,
                          borderHover: 'hover:border-status-emerald/60',
                          iconBox: 'bg-status-emerald/15 border-status-emerald/35 text-accent-emerald',
                          textAccent: 'text-accent-emerald',
                          btnClass: 'bg-status-emerald hover:bg-status-emerald',
                        },
                        {
                          cat: MILITARY_CATALOG_BY_ID.berserkers,
                          count: berserkersCount,
                          borderHover: 'hover:border-blood-500/60',
                          iconBox: 'bg-blood-500/15 border-blood-500/35 text-accent-crimson',
                          textAccent: 'text-accent-crimson',
                          btnClass: 'bg-blood-500 hover:bg-blood-500',
                        },
                      ] as const
                    ).map(({ cat, count, borderHover, iconBox, textAccent, btnClass }) => {
                      const copy = cat[lang];
                      return (
                        <div
                          key={cat.id}
                          className={`p-4 rounded-2xl bg-surface-secondary border border-border-subtle ${borderHover} flex flex-col justify-between gap-3 transition-colors`}
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`w-10 h-10 rounded-xl border ${iconBox} flex items-center justify-center shrink-0`}
                                >
                                  <MilitaryUnitGlyph type={cat.id} className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-semibold text-sm text-ink-primary">
                                    {copy.name}
                                  </div>
                                  <div className={`text-xs ${textAccent} font-normal`}>
                                    {copy.role} ·{' '}
                                    <bdi dir="ltr" className="opacity-75 font-mono text-xs">
                                      {cat.norseName}
                                    </bdi>
                                  </div>
                                </div>
                              </div>
                              <div className="text-end font-mono tabular-nums shrink-0">
                                <div className={`text-xl font-semibold ${textAccent} leading-none`}>
                                  {num(count)}
                                </div>
                                <div className="text-xs text-ink-muted mt-0.5">
                                  {copy.unitSuffix}
                                </div>
                              </div>
                            </div>

                            <p className="text-xs text-ink-muted leading-relaxed">
                              {copy.description}
                            </p>

                            <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs font-mono text-ink-secondary">
                              <span>{copy.batchLabel}</span>
                              <span className={textAccent}>{copy.effectText}</span>
                            </div>
                          </div>

                          {cat.action && (
                            <button
                              type="button"
                              disabled={state.realm.silver < cat.costSilver}
                              onClick={() => onBuildShipOrHird(cat.action!)}
                              className={`w-full min-h-[44px] px-3 py-2 rounded-xl ${btnClass} active:scale-[0.99] disabled:bg-surface-disabled disabled:text-ink-disabled text-nordic-950 text-xs font-semibold flex items-center justify-between gap-2 cursor-pointer transition-all`}
                            >
                              <span className="inline-flex items-center gap-1.5">
                                <Plus className="w-4 h-4 shrink-0" />
                                <span>{copy.ctaLabel}</span>
                              </span>
                              <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-surface-canvas/15">
                                {isFa
                                  ? `${num(cat.costSilver)} نقره`
                                  : `${cat.costSilver} Ag`}
                              </span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 2: NAVAL SHIPYARD */}
              {showShips && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Ship className="w-4 h-4 text-accent-ice" />
                      <h4 className="font-saga text-sm sm:text-base font-semibold text-ink-primary">
                        {isFa
                          ? 'کارگاه کشتی‌سازی و ناوگان دریایی'
                          : 'Naval Shipyard & Vessel Construction'}
                      </h4>
                    </div>
                    <span className="text-xs text-ink-muted font-mono tabular-nums">
                      {isFa
                        ? `${num(state.realm.longships)} جنگی · ${num(state.realm.knarrs)} تجاری`
                        : `${state.realm.longships} Warships · ${state.realm.knarrs} Knarrs`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(
                      [
                        {
                          cat: MILITARY_CATALOG_BY_ID.snekkja,
                          count: snekkjasCount,
                          borderHover: 'hover:border-status-ice/60',
                          iconBox: 'bg-status-ice/15 border-status-ice/35 text-accent-ice',
                          textAccent: 'text-accent-ice',
                          btnClass: 'bg-status-ice hover:bg-status-ice',
                        },
                        {
                          cat: MILITARY_CATALOG_BY_ID.drakkar,
                          count: drakkarsCount,
                          borderHover: 'hover:border-status-ice/60',
                          iconBox: 'bg-status-ice/15 border-status-ice/35 text-accent-ice',
                          textAccent: 'text-accent-ice',
                          btnClass: 'bg-status-ice hover:bg-status-ice',
                        },
                        {
                          cat: MILITARY_CATALOG_BY_ID.knarr,
                          count: state.realm.knarrs,
                          borderHover: 'hover:border-status-emerald/60',
                          iconBox: 'bg-status-emerald/15 border-status-emerald/35 text-accent-emerald',
                          textAccent: 'text-accent-emerald',
                          btnClass: 'bg-status-emerald hover:bg-status-emerald',
                        },
                      ] as const
                    ).map(({ cat, count, borderHover, iconBox, textAccent, btnClass }) => {
                      const copy = cat[lang];
                      return (
                        <div
                          key={cat.id}
                          className={`p-4 rounded-2xl bg-surface-secondary border border-border-subtle ${borderHover} flex flex-col justify-between gap-3 transition-colors`}
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <div
                                className={`w-10 h-10 rounded-xl border ${iconBox} flex items-center justify-center shrink-0`}
                              >
                                <MilitaryUnitGlyph type={cat.id} className="w-5 h-5" />
                              </div>
                              <div className="text-end font-mono tabular-nums">
                                <div className={`text-xl font-semibold ${textAccent} leading-none`}>
                                  {num(count)}
                                </div>
                                <div className={`text-xs font-semibold ${textAccent} mt-0.5`}>
                                  {copy.role}
                                </div>
                              </div>
                            </div>

                            <div>
                              <div className="font-semibold text-sm text-ink-primary">
                                {copy.name}
                              </div>
                              <bdi dir="ltr" className="text-xs font-mono text-ink-muted block">
                                {cat.norseName}
                              </bdi>
                              <p className="text-xs text-ink-muted leading-relaxed mt-1">
                                {copy.description}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs font-mono text-ink-secondary">
                              <span>{copy.batchLabel}</span>
                              <span className={textAccent}>{copy.effectText}</span>
                            </div>
                          </div>

                          {cat.action && (
                            <button
                              type="button"
                              disabled={state.realm.silver < cat.costSilver}
                              onClick={() => onBuildShipOrHird(cat.action!)}
                              className={`w-full min-h-[44px] px-3 py-2 rounded-xl ${btnClass} active:scale-[0.99] disabled:bg-surface-disabled disabled:text-ink-disabled text-nordic-950 text-xs font-semibold flex items-center justify-between gap-2 cursor-pointer transition-all`}
                            >
                              <span className="inline-flex items-center gap-1.5">
                                <Plus className="w-4 h-4 shrink-0" />
                                <span>{copy.ctaLabel}</span>
                              </span>
                              <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-surface-canvas/15">
                                {isFa
                                  ? `${num(cat.costSilver)} نقره`
                                  : `${cat.costSilver} Ag`}
                              </span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 3: STABLES, HORSES & ROYAL ARMORY */}
              {showStables && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-accent-amber" />
                      <h4 className="font-saga text-sm sm:text-base font-semibold text-ink-primary">
                        {isFa
                          ? 'اصطبل سلطنتی، خرید اسب و اسلحه‌خانه'
                          : 'Royal Stables, Horses & Forged Armory'}
                      </h4>
                    </div>
                    <span className="text-xs text-ink-muted font-mono tabular-nums">
                      {isFa
                        ? `${num(totalHorses)} راس اسب · سطح زره ${num(warGearTier)}`
                        : `${totalHorses} Horses · Gear Lv.${warGearTier}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(
                      [
                        {
                          cat: MILITARY_CATALOG_BY_ID.warhorses,
                          countDisplay: num(warhorsesCount),
                          borderHover: 'hover:border-gold-500/60',
                          iconBox: 'bg-gold-500/15 border-gold-500/35 text-accent-amber',
                          textAccent: 'text-accent-amber',
                          btnClass: 'bg-gold-500 hover:bg-gold-400',
                        },
                        {
                          cat: MILITARY_CATALOG_BY_ID.pack_horses,
                          countDisplay: num(packHorsesCount),
                          borderHover: 'hover:border-status-emerald/60',
                          iconBox: 'bg-status-emerald/15 border-status-emerald/35 text-accent-emerald',
                          textAccent: 'text-accent-emerald',
                          btnClass: 'bg-status-emerald hover:bg-status-emerald',
                        },
                        {
                          cat: MILITARY_CATALOG_BY_ID.war_gear,
                          countDisplay: isFa ? `سطح ${num(warGearTier)}` : `Lv.${warGearTier}`,
                          borderHover: 'hover:border-status-violet/60',
                          iconBox: 'bg-status-violet/15 border-status-violet/35 text-accent-violet',
                          textAccent: 'text-accent-violet',
                          btnClass: 'bg-status-violet hover:bg-status-violet',
                        },
                      ] as const
                    ).map(({ cat, countDisplay, borderHover, iconBox, textAccent, btnClass }) => {
                      const copy = cat[lang];
                      return (
                        <div
                          key={cat.id}
                          className={`p-4 rounded-2xl bg-surface-secondary border border-border-subtle ${borderHover} flex flex-col justify-between gap-3 transition-colors`}
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <div
                                className={`w-10 h-10 rounded-xl border ${iconBox} flex items-center justify-center shrink-0`}
                              >
                                <MilitaryUnitGlyph type={cat.id} className="w-5 h-5" />
                              </div>
                              <div className="text-end font-mono tabular-nums">
                                <div className={`text-xl font-semibold ${textAccent} leading-none`}>
                                  {countDisplay}
                                </div>
                                <div className={`text-xs font-semibold ${textAccent} mt-0.5`}>
                                  {copy.role}
                                </div>
                              </div>
                            </div>

                            <div>
                              <div className="font-semibold text-sm text-ink-primary">
                                {copy.name}
                              </div>
                              <bdi dir="ltr" className="text-xs font-mono text-ink-muted block">
                                {cat.norseName}
                              </bdi>
                              <p className="text-xs text-ink-muted leading-relaxed mt-1">
                                {copy.description}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs font-mono text-ink-secondary">
                              <span>{copy.batchLabel}</span>
                              <span className={textAccent}>{copy.effectText}</span>
                            </div>
                          </div>

                          {cat.action && (
                            <button
                              type="button"
                              disabled={state.realm.silver < cat.costSilver}
                              onClick={() => onBuildShipOrHird(cat.action!)}
                              className={`w-full min-h-[44px] px-3 py-2 rounded-xl ${btnClass} active:scale-[0.99] disabled:bg-surface-disabled disabled:text-ink-disabled text-nordic-950 text-xs font-semibold flex items-center justify-between gap-2 cursor-pointer transition-all`}
                            >
                              <span className="inline-flex items-center gap-1.5">
                                <Plus className="w-4 h-4 shrink-0" />
                                <span>{copy.ctaLabel}</span>
                              </span>
                              <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-surface-canvas/15">
                                {isFa
                                  ? `${num(cat.costSilver)} نقره`
                                  : `${cat.costSilver} Ag`}
                              </span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Minimalist Garrison Allocation & Naval Logistics Strip */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-secondary border border-border-subtle space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-ink-primary flex items-center gap-2">
                    <Shield className="w-4 h-4 text-accent-ice" />
                    <span>
                      {isFa
                        ? 'تدارکات دریایی و تقسیم پادگان شهرها'
                        : 'Naval Logistics & Holding Garrisons'}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${
                      boathouseActive
                        ? 'bg-status-emerald/15 text-accent-emerald border-status-emerald/35'
                        : 'bg-surface-card text-ink-muted border-border-subtle'
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
                      const sName = getSettlementDisplayName(h.settlementId);
                      const unrest = h.unrest ?? 15;
                      return (
                        <div
                          key={h.settlementId}
                          className="px-3 py-2 rounded-xl bg-surface-card border border-border-subtle flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-ink-primary">
                              {sName}
                            </div>
                            <div className="text-xs text-ink-muted">
                              {isFa
                                ? `ناآرامی: ${num(unrest)}٪ · مزارع: ${num(h.farms)}`
                                : `Unrest: ${unrest}% · Farms: ${h.farms}`}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              disabled={(h.garrison ?? 0) <= 0}
                              onClick={() => onStationGarrison(h.settlementId, -2)}
                              className="w-9 h-9 rounded-lg bg-surface-secondary hover:bg-surface-interactive border border-border-subtle text-ink-primary flex items-center justify-center cursor-pointer disabled:opacity-30 transition-colors"
                              title={
                                isFa
                                  ? 'فراخوانی ۲ جنگجو به سپاه همراه'
                                  : 'Withdraw 2 warriors to Hird'
                              }
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <div className="min-w-[44px] text-center font-mono text-xs font-semibold tabular-nums text-accent-ice">
                              {num(h.garrison ?? 4)}
                            </div>
                            <button
                              type="button"
                              disabled={state.realm.hirdWarriors < 2}
                              onClick={() => onStationGarrison(h.settlementId, 2)}
                              className="w-9 h-9 rounded-lg bg-surface-secondary hover:bg-surface-interactive border border-border-subtle text-accent-emerald flex items-center justify-center cursor-pointer disabled:opacity-30 transition-colors"
                              title={
                                isFa
                                  ? 'اعزام ۲ جنگجو به پادگان این شهر'
                                  : 'Station 2 warriors in garrison'
                              }
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

      {/* ===================================================================== */}
      {/* TAB 3: POLITICS & INTRIGUE                                            */}
      {/* ===================================================================== */}
      {tab === 'politics' && (
        <div className="flex flex-col overflow-hidden space-y-4">
          {/* Emergent Historical Titles */}
          <div className="p-4 rounded-2xl bg-surface-secondary border border-border-subtle space-y-3">
            <div className="font-saga text-lg font-semibold text-ink-primary flex items-center gap-2">
              <Crown className="w-5 h-5 text-accent-amber" />
              <span>
                {isFa
                  ? 'عناوین و تاج‌های تاریخی قابل احراز'
                  : 'Emergent Historical Crowns & Titles'}
              </span>
            </div>
            <p className="text-xs text-ink-muted">
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
                    className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 ${
                      isClaimed
                        ? 'bg-surface-card border-status-emerald/40'
                        : st.canClaim
                          ? 'bg-surface-secondary border-gold-500'
                          : 'bg-surface-card border-border-subtle'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm text-ink-primary flex items-center justify-between gap-2">
                        <span>{isFa ? st.nameFa : st.name}</span>
                        {isClaimed && (
                          <span
                            aria-disabled="true"
                            className="text-xs font-normal text-ink-muted bg-surface-secondary border border-border-subtle px-2.5 py-0.5 rounded-full inline-flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5 text-accent-emerald" />
                            <span>{isFa ? 'احراز شده' : 'Claimed'}</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-ink-muted mt-1">
                        {isFa ? st.requirementsFa : st.requirements}
                      </div>
                    </div>

                    {!isClaimed && onClaimSpecialTitle && (
                      <button
                        type="button"
                        disabled={!st.canClaim}
                        onClick={() => onClaimSpecialTitle(st.id)}
                        className={`w-full min-h-[40px] py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          st.canClaim
                            ? 'bg-gold-500 hover:bg-gold-400 text-nordic-950'
                            : 'bg-surface-secondary text-ink-muted cursor-not-allowed'
                        }`}
                      >
                        {st.canClaim
                          ? isFa
                            ? 'تاج‌گذاری و اعلام این مقام!'
                            : 'Claim This Title!'
                          : isFa
                            ? 'شرایط کامل نیست'
                            : 'Conditions Unmet'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Intrigue & Dark Plots */}
          {onExecutePlot && (
            <div className="p-4 rounded-2xl bg-surface-secondary border border-border-subtle space-y-3">
              <div className="font-saga text-lg font-semibold text-ink-primary flex items-center gap-2">
                <Skull className="w-5 h-5 text-accent-amber" />
                <span>{isFa ? 'توطئه‌ها و دسیسه‌های درباری' : 'Intrigue & Dark Plots'}</span>
              </div>
              <p className="text-xs text-ink-muted">
                {isFa
                  ? 'عملیات مخفیانه با ریسک بالا؛ افشای آن موجب رسوایی و کینه خونی می‌شود.'
                  : 'High-risk covert actions. Discovery leads to public dishonor, feud, or Thing outlawry.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={state.realm.silver < 32}
                  onClick={() => onExecutePlot('assassination')}
                  className="p-3.5 rounded-xl bg-surface-card hover:bg-surface-secondary border border-border-subtle hover:border-gold-500/60 text-start space-y-1 cursor-pointer disabled:opacity-45 transition-colors"
                >
                  <div className="font-semibold text-xs text-ink-primary flex items-center justify-between gap-2">
                    <span>🗡️ {isFa ? 'ترور شبانه رقیب' : 'Night Assassination'}</span>
                    <span className="font-mono text-xs text-accent-amber">
                      {isFa ? `${num(32)} نقره` : '32 Silv'}
                    </span>
                  </div>
                  <div className="text-xs text-ink-muted">
                    {isFa
                      ? 'آدم‌کش اجیرشده برای قتل سردار یا دشمن خونی'
                      : 'Hired shadow-blade strikes rival in the dark'}
                  </div>
                </button>

                <button
                  type="button"
                  disabled={state.realm.silver < 22}
                  onClick={() => onExecutePlot('poisoning')}
                  className="p-3.5 rounded-xl bg-surface-card hover:bg-surface-secondary border border-border-subtle hover:border-gold-500/60 text-start space-y-1 cursor-pointer disabled:opacity-45 transition-colors"
                >
                  <div className="font-semibold text-xs text-ink-primary flex items-center justify-between gap-2">
                    <span>🧪 {isFa ? 'زهر شوکران در جام' : 'Poison Mead Horn'}</span>
                    <span className="font-mono text-xs text-accent-amber">
                      {isFa ? `${num(22)} نقره` : '22 Silv'}
                    </span>
                  </div>
                  <div className="text-xs text-ink-muted">
                    {isFa
                      ? 'ریختن سم شوکران در جام بزم رقیب'
                      : 'Distil hemlock to cause quiet heart failure'}
                  </div>
                </button>

                <button
                  type="button"
                  disabled={state.realm.silver < 25}
                  onClick={() => onExecutePlot('bribe_thing')}
                  className="p-3.5 rounded-xl bg-surface-card hover:bg-surface-secondary border border-border-subtle hover:border-status-ice/60 text-start space-y-1 cursor-pointer disabled:opacity-45 transition-colors"
                >
                  <div className="font-semibold text-xs text-ink-primary flex items-center justify-between gap-2">
                    <span>⚖️ {isFa ? 'رشوه به شورای ثینگ' : 'Bribe Thing Speaker'}</span>
                    <span className="font-mono text-xs text-accent-ice">
                      {isFa ? `${num(25)} نقره` : '25 Silv'}
                    </span>
                  </div>
                  <div className="text-xs text-ink-muted">
                    {isFa
                      ? 'تطمیع سخنگوی قانون و تبرئه از تبعید و جرم'
                      : 'Weigh silver rings to clear outlawry & win rulings'}
                  </div>
                </button>

                <button
                  type="button"
                  disabled={state.realm.hirdWarriors < 15}
                  onClick={() => onExecutePlot('mass_reprisal')}
                  className="p-3.5 rounded-xl bg-surface-card hover:bg-surface-secondary border border-border-subtle hover:border-blood-500/60 text-start space-y-1 cursor-pointer disabled:opacity-45 transition-colors"
                >
                  <div className="font-semibold text-xs text-ink-primary flex items-center justify-between gap-2">
                    <span>🔥 {isFa ? 'سرکوب قاطع توطئه‌گران' : 'Mass Reprisal'}</span>
                    <span className="font-mono text-xs text-accent-crimson">
                      {isFa ? `${num(15)}+ جنگجو` : '15+ Hird'}
                    </span>
                  </div>
                  <div className="text-xs text-ink-muted">
                    {isFa
                      ? 'سرکوب خونین بومیان و صفر کردن ناآرامی (-۱۸ شرافت)'
                      : 'Preemptive terror wipeouts unrest to 0% (-18 Honor)'}
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
