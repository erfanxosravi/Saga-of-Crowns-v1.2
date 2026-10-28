import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  Anchor,
  Castle,
  Check,
  ChevronLeft,
  ChevronRight,
  Church,
  CloudRain,
  Coins,
  Compass,
  Crown,
  Eye,
  Flame,
  Hammer,
  Handshake,
  Heart,
  Info,
  Landmark,
  LocateFixed,
  Minus,
  Plus,
  Shield,
  Ship,
  Snowflake,
  Sparkles,
  Sun,
  Swords,
  Users,
  Wind,
  X,
} from 'lucide-react';
import {
  calculateVoyageMetrics,
  getControllerInYear,
  getSeasonalWeatherProfile,
  INLAND_LAKES,
  LANDMASS_POLYGONS,
  MAP_BOUNDS,
  MOUNTAIN_RANGES,
  NAVIGABLE_RIVERS,
  pointsToSmoothSvgPath,
  projectLatLon,
  SETTLEMENTS,
  SETTLEMENTS_BY_ID,
} from '../data/geography';
import { BUILDINGS_CATALOG } from '../data/namesAndTraits';
import {
  DiplomacyApproach,
  hasBoathouse,
  RaidTactic,
  SiegeApproach,
} from '../engine/gameEngine';
import { BUILDINGS_FA, SETTLEMENTS_FA } from '../i18n/gameDataFa';
import {
  REGION_LABELS,
  RELIGION_LABELS,
  SEASON_LABELS,
  SETTLEMENT_STATUS_LABELS,
  SETTLEMENT_TYPE_LABELS,
} from '../i18n/ui';
import {
  BuildingType,
  FullGameState,
  Season,
  Settlement,
  SettlementStatus,
  SettlementType,
  TributeBurden,
} from '../types/game';
import { NorseBottomSheet } from './NorseMotifs';

interface VikingMapProps {
  state: FullGameState;
  onSailTo?: (settlementId: string) => void;
  onRaidPort?: (settlementId: string, tactic: RaidTactic) => void;
  onConquerCity?: (settlementId: string) => void;
  onTradeHere?: () => void;
  onBesiege?: (settlementId: string, approach: SiegeApproach) => void;
  onSettle?: (settlementId: string) => void;
  onDiplomacy?: (settlementId: string, approach: DiplomacyApproach) => void;
  onMarryLocal?: (settlementId: string) => void;
  onBuildHoldingStructure?: (settlementId: string, building: BuildingType) => void;
  onSendSettlers?: (settlementId: string) => void;
  onStationGarrison?: (settlementId: string, delta: number) => void;
  onSetTributeBurden?: (settlementId: string, burden: TributeBurden) => void;
  onAppointJarl?: (settlementId: string) => void;
  onTakeHostages?: (settlementId: string) => void;
  onToggleTolerance?: (settlementId: string) => void;
}

type MapLensId = 'all' | 'owned' | 'loot' | 'trade';
type SheetTabId = 'assets' | 'buildings' | 'actions' | 'raid' | 'siege' | 'diplomacy' | 'lore';

/**
 * Faded classic cartographic country/realm names rendered directly on the map landmasses.
 */
const REALM_MAP_LABELS: {
  id: string;
  labelFa: string;
  labelEn: string;
  lat: number;
  lon: number;
  rotate?: number;
  size?: number;
}[] = [
  { id: 'norway', labelFa: 'نروژ', labelEn: 'NORWAY', lat: 62.0, lon: 8.8, rotate: -22, size: 15 },
  { id: 'sweden', labelFa: 'سوئد', labelEn: 'SWEDEN', lat: 60.8, lon: 15.6, rotate: -14, size: 15 },
  { id: 'denmark', labelFa: 'دانمارک', labelEn: 'DENMARK', lat: 55.9, lon: 9.5, rotate: 0, size: 11.5 },
  { id: 'britain', labelFa: 'بریتانیا', labelEn: 'BRITAIN', lat: 53.5, lon: -2.0, rotate: -8, size: 14 },
  { id: 'ireland', labelFa: 'ایرلند', labelEn: 'IRELAND', lat: 53.3, lon: -8.0, rotate: -8, size: 11.5 },
  { id: 'iceland', labelFa: 'ایسلند', labelEn: 'ICELAND', lat: 64.9, lon: -18.5, rotate: 0, size: 12 },
  { id: 'greenland', labelFa: 'گرینلند', labelEn: 'GREENLAND', lat: 63.3, lon: -45.5, rotate: -12, size: 13.5 },
  { id: 'vinland', labelFa: 'وینلند', labelEn: 'VINLAND', lat: 50.8, lon: -56.5, rotate: -6, size: 13 },
  { id: 'frankia', labelFa: 'فرانکیه', labelEn: 'FRANKIA', lat: 47.8, lon: 2.2, rotate: 0, size: 15 },
  { id: 'saxony', labelFa: 'ساکسون و آلمان', labelEn: 'SAXONY', lat: 51.3, lon: 10.8, rotate: 0, size: 13 },
  { id: 'baltic', labelFa: 'بالتیک و وندلند', labelEn: 'BALTIC', lat: 55.6, lon: 22.8, rotate: 0, size: 12.5 },
  { id: 'rus', labelFa: 'روس کیف', labelEn: 'KIEVAN RUS', lat: 53.2, lon: 31.5, rotate: 0, size: 16.5 },
  { id: 'andalus', labelFa: 'اندلس', labelEn: 'AL-ANDALUS', lat: 39.6, lon: -4.2, rotate: 0, size: 14.5 },
  { id: 'italy', labelFa: 'ایتالیا', labelEn: 'ITALY', lat: 42.6, lon: 12.2, rotate: 28, size: 12.5 },
  { id: 'byzantium', labelFa: 'امپراتوری بیزانس', labelEn: 'BYZANTIUM', lat: 39.2, lon: 32.8, rotate: 0, size: 14.5 },
  { id: 'caliphate', labelFa: 'خلافت عباسی', labelEn: 'CALIPHATE', lat: 33.6, lon: 42.5, rotate: 0, size: 14.5 },
  { id: 'maghreb', labelFa: 'مغرب', labelEn: 'MAGHREB', lat: 33.8, lon: 3.5, rotate: 0, size: 14 },
];

const SEA_MAP_LABELS: {
  id: string;
  labelFa: string;
  labelEn: string;
  lat: number;
  lon: number;
  rotate?: number;
  size?: number;
}[] = [
  { id: 'north_sea', labelFa: 'دریای شمال', labelEn: 'North Sea', lat: 56.2, lon: 3.2, rotate: -6, size: 11 },
  { id: 'norwegian_sea', labelFa: 'دریای نروژ', labelEn: 'Norwegian Sea', lat: 64.2, lon: -2.5, rotate: -14, size: 12 },
  { id: 'baltic_sea', labelFa: 'دریای بالتیک', labelEn: 'Baltic Sea', lat: 56.8, lon: 19.6, rotate: -18, size: 10.5 },
  { id: 'atlantic', labelFa: 'اقیانوس اطلس شمالی', labelEn: 'North Atlantic', lat: 53.5, lon: -25.0, rotate: -8, size: 13 },
  { id: 'mediterranean', labelFa: 'دریای مدیترانه', labelEn: 'Mediterranean Sea', lat: 36.2, lon: 18.0, rotate: -4, size: 12.5 },
  { id: 'black_sea', labelFa: 'دریای سیاه', labelEn: 'Black Sea', lat: 43.2, lon: 34.2, rotate: 0, size: 11 },
];

const LABEL_ANCHOR_HINTS: Record<
  string,
  { anchor?: 'start' | 'end' | 'middle'; dx?: number; dy?: number }
> = {
  ribe: { anchor: 'end', dx: -8, dy: 3 },
  jelling: { anchor: 'end', dx: -8, dy: -4 },
  hedeby: { anchor: 'start', dx: 8, dy: 9 },
  roskilde: { anchor: 'start', dx: 8, dy: 3 },
  uppsala: { anchor: 'start', dx: 8, dy: -5 },
  birka: { anchor: 'start', dx: 8, dy: 8 },
  kaupang: { anchor: 'end', dx: -8, dy: 3 },
  dublin: { anchor: 'end', dx: -8, dy: -3 },
  wexford: { anchor: 'end', dx: -8, dy: 8 },
  limerick: { anchor: 'end', dx: -8, dy: 3 },
  constantinople: { anchor: 'start', dx: 9, dy: -2 },
  baghdad: { anchor: 'start', dx: 9, dy: 2 },
  kiev: { anchor: 'start', dx: 8, dy: 2 },
  cordoba: { anchor: 'end', dx: -8, dy: 2 },
  seville: { anchor: 'end', dx: -8, dy: 4 },
  rome: { anchor: 'start', dx: 8, dy: 2 },
};

/**
 * Classic, understated cartographic node for settlements on the sea chart.
 */
function SettlementGlyph({
  type,
  status,
  isCurrent,
  isSelected,
  playerOwns,
  isKnown,
  isLightTheme,
  zoom,
}: {
  type: SettlementType;
  status: SettlementStatus;
  isCurrent: boolean;
  isSelected: boolean;
  playerOwns: boolean;
  isKnown: boolean;
  isLightTheme: boolean;
  zoom: number;
}) {
  const scale = 1 / Math.sqrt(zoom);
  const isFeatured = isCurrent || isSelected || playerOwns;
  const isMajor = type === 'capital' || type === 'monastery';

  const ringColor = isCurrent
    ? isLightTheme
      ? '#D97706'
      : '#F59E0B'
    : isSelected
      ? isLightTheme
        ? '#0284C7'
        : '#38BDF8'
      : playerOwns
        ? isLightTheme
          ? '#059669'
          : '#10B981'
        : status === 'conquered'
          ? '#DC2626'
          : status === 'tributary'
            ? '#D97706'
            : isMajor
              ? isLightTheme
                ? '#78350F'
                : '#FBBF24'
              : isKnown
                ? isLightTheme
                  ? '#334155'
                  : '#94A3B8'
                : isLightTheme
                  ? '#94A3B8'
                  : '#475569';

  const coreFill = isLightTheme ? '#FFFDF8' : '#0B131E';

  if (!isFeatured) {
    return (
      <g transform={`scale(${scale})`}>
        <circle
          cx="0"
          cy="0"
          r={isMajor ? '4.5' : '3.4'}
          fill={isMajor ? coreFill : ringColor}
          stroke={isMajor ? ringColor : coreFill}
          strokeWidth={isMajor ? '1.6' : '1.2'}
        />
        {isMajor && <circle cx="0" cy="0" r="1.6" fill={ringColor} />}
      </g>
    );
  }

  return (
    <g transform={`scale(${scale})`}>
      {isCurrent && (
        <circle
          cx="0"
          cy="0"
          r="11.5"
          fill="rgba(217, 119, 6, 0.16)"
          stroke={ringColor}
          strokeWidth="1.2"
        />
      )}
      {isSelected && !isCurrent && (
        <circle
          cx="0"
          cy="0"
          r="10.5"
          fill="rgba(2, 132, 199, 0.15)"
          stroke={ringColor}
          strokeWidth="1.2"
        />
      )}

      <circle
        cx="0"
        cy="0"
        r={isCurrent || isSelected ? '6.6' : '5.4'}
        fill={coreFill}
        stroke={ringColor}
        strokeWidth="2"
      />
      <circle
        cx="0"
        cy="0"
        r={isCurrent || isSelected ? '2.8' : '2.2'}
        fill={ringColor}
      />
    </g>
  );
}

export function VikingMap({
  state,
  onSailTo,
  onRaidPort,
  onConquerCity,
  onTradeHere,
  onBesiege,
  onSettle,
  onDiplomacy,
  onMarryLocal,
  onBuildHoldingStructure,
  onSendSettlers,
  onStationGarrison,
  onSetTributeBurden,
  onAppointJarl,
  onTakeHostages,
  onToggleTolerance,
}: VikingMapProps) {
  const lang = state.settings.language;
  const isFa = lang === 'fa';

  const currentLoc = SETTLEMENTS_BY_ID[state.character.locationId] ?? SETTLEMENTS[0];

  const [selectedId, setSelectedId] = useState<string>(state.character.locationId);
  const [activeLens, setActiveLens] = useState<MapLensId>('all');
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [activeSheetTab, setActiveSheetTab] = useState<SheetTabId>('assets');
  const [showUnexplored, setShowUnexplored] = useState<boolean>(false);
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(false);
  const [legendSection, setLegendSection] = useState<'all' | 'settlements' | 'weather'>('all');
  const [mapTactic, setMapTactic] = useState<RaidTactic>('shield_wall');
  const [siegeApproach, setSiegeApproach] = useState<SiegeApproach>('assault');
  const [diploApproach, setDiploApproach] = useState<DiplomacyApproach>('trade_pact');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canvasAspect, setCanvasAspect] = useState<number>(0.85);

  const initialProj = projectLatLon(currentLoc.lat, currentLoc.lon);
  const [zoom, setZoom] = useState<number>(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 1.55 : 1.35
  );
  const [center, setCenter] = useState<{ x: number; y: number }>(() => ({
    x: Math.max(240, Math.min(1060, initialProj.x)),
    y: Math.max(120, Math.min(480, initialProj.y)),
  }));

  useEffect(() => {
    setSelectedId(state.character.locationId);
    const p = projectLatLon(currentLoc.lat, currentLoc.lon);
    setCenter((prev) => ({
      x: Math.max(180, Math.min(1120, p.x || prev.x)),
      y: Math.max(90, Math.min(510, p.y || prev.y)),
    }));
  }, [state.character.locationId, currentLoc.lat, currentLoc.lon]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const updateAspect = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 20 && rect.height > 20) {
        setCanvasAspect(rect.height / rect.width);
      }
    };
    updateAspect();
    const ro = new ResizeObserver(updateAspect);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const dragRef = useRef<{
    dragging: boolean;
    moved: boolean;
    startX: number;
    startY: number;
    origCx: number;
    origCy: number;
  }>({
    dragging: false,
    moved: false,
    startX: 0,
    startY: 0,
    origCx: MAP_BOUNDS.width / 2,
    origCy: MAP_BOUNDS.height / 2,
  });

  const pinchDistRef = useRef<number | null>(null);

  const clampCenter = (cx: number, cy: number, z: number) => {
    const vH = MAP_BOUNDS.height / z;
    const vW = vH / Math.max(0.35, canvasAspect);
    const minX = Math.min(MAP_BOUNDS.width / 2, Math.max(140, vW * 0.35));
    const maxX = Math.max(MAP_BOUNDS.width / 2, MAP_BOUNDS.width - Math.max(140, vW * 0.35));
    const minY = Math.min(MAP_BOUNDS.height / 2, Math.max(70, vH * 0.35));
    const maxY = Math.max(MAP_BOUNDS.height / 2, MAP_BOUNDS.height - Math.max(70, vH * 0.35));
    return {
      x: Math.max(minX, Math.min(maxX, cx)),
      y: Math.max(minY, Math.min(maxY, cy)),
    };
  };

  const applyZoom = (nextZ: number, pivotX?: number, pivotY?: number) => {
    const clampedZ = Math.max(1.15, Math.min(4.2, Number(nextZ.toFixed(2))));
    if (clampedZ === zoom) return;

    if (pivotX !== undefined && pivotY !== undefined) {
      const factor = 1 - zoom / clampedZ;
      const nextCx = center.x + (pivotX - center.x) * factor;
      const nextCy = center.y + (pivotY - center.y) * factor;
      setCenter(clampCenter(nextCx, nextCy, clampedZ));
    } else {
      setCenter(clampCenter(center.x, center.y, clampedZ));
    }
    setZoom(clampedZ);
  };

  const handleFocusSettlement = (s: Settlement, targetZoom?: number) => {
    const p = projectLatLon(s.lat, s.lon);
    const nextZ = targetZoom ?? Math.max(zoom, 1.55);
    setZoom(nextZ);
    setCenter(clampCenter(p.x, p.y, nextZ));
    setSelectedId(s.id);
  };

  const handleResetToFleet = () => {
    const p = projectLatLon(currentLoc.lat, currentLoc.lon);
    const nextZ = 1.65;
    setZoom(nextZ);
    setCenter(clampCenter(p.x, p.y, nextZ));
    setSelectedId(currentLoc.id);
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    applyZoom(zoom + delta);
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.pointerType === 'touch' && pinchDistRef.current !== null) return;
    dragRef.current = {
      dragging: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      origCx: center.x,
      origCy: center.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current.dragging || pinchDistRef.current !== null) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.height === 0) return;

    const dxPx = e.clientX - dragRef.current.startX;
    const dyPx = e.clientY - dragRef.current.startY;
    if (Math.abs(dxPx) > 4 || Math.abs(dyPx) > 4) {
      dragRef.current.moved = true;
      if (isLegendOpen && typeof window !== 'undefined' && window.innerWidth < 640) {
        setIsLegendOpen(false);
      }
    }

    const svgUnitsPerPx = MAP_BOUNDS.height / zoom / rect.height;
    const nextCx = dragRef.current.origCx - dxPx * svgUnitsPerPx;
    const nextCy = dragRef.current.origCy - dyPx * svgUnitsPerPx;
    setCenter(clampCenter(nextCx, nextCy, zoom));
  };

  const handlePointerUp = () => {
    dragRef.current.dragging = false;
  };

  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchDistRef.current = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 2 && pinchDistRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const scaleFactor = dist / Math.max(10, pinchDistRef.current);
      pinchDistRef.current = dist;
      applyZoom(zoom * scaleFactor);
    }
  };

  const handleTouchEnd = () => {
    pinchDistRef.current = null;
  };

  // Height-anchored isotropic viewBox so the map fills the container vertically with zero empty ocean void
  const viewHeight = MAP_BOUNDS.height / zoom;
  const viewWidth = viewHeight / Math.max(0.35, canvasAspect);
  const viewBoxStr = `${center.x - viewWidth / 2} ${center.y - viewHeight / 2} ${viewWidth} ${viewHeight}`;

  const inspected: Settlement = SETTLEMENTS_BY_ID[selectedId] ?? currentLoc;
  const inspectedFa = SETTLEMENTS_FA[inspected.id];
  const inspectedDisplayName = isFa
    ? (inspectedFa?.name ?? inspected.name).split(' (')[0]
    : inspected.name.split(' (')[0];
  const inspectedNorseName = isFa
    ? inspectedFa?.norseName ?? inspected.norseName
    : inspected.norseName;

  const controller = getControllerInYear(inspected, state.year);

  const effectiveSeamanship =
    state.character.skills.seamanship + (hasBoathouse(state) ? 3 : 0);
  const hasKnarr = state.realm.knarrs > 0;
  const hasShips = state.realm.longships > 0 || hasKnarr;

  const voyage = calculateVoyageMetrics(
    currentLoc,
    inspected,
    state.season,
    state.year,
    effectiveSeamanship,
    hasKnarr
  );

  const currentWeather = getSeasonalWeatherProfile(state.season, lang);
  const allSeasonsOrder: Season[] = [
    Season.Spring,
    Season.Summer,
    Season.Autumn,
    Season.Winter,
  ];

  const renderSeasonIcon = (season: Season, className = 'w-3.5 h-3.5') => {
    switch (season) {
      case Season.Spring:
        return <Wind className={`${className} text-[#34D399]`} />;
      case Season.Summer:
        return <Sun className={`${className} text-[#FBBF24]`} />;
      case Season.Autumn:
        return <CloudRain className={`${className} text-[#38BDF8]`} />;
      case Season.Winter:
        return <Snowflake className={`${className} text-[#93C5FD]`} />;
    }
  };

  const isDiscovered =
    state.discoveredSettlements.includes(inspected.id) || showUnexplored;

  // Player holding in the inspected city
  const cityHolding = state.realm.holdings.find((h) => h.settlementId === inspected.id);
  const isHeldByPlayer = Boolean(cityHolding && cityHolding.farms > 0);
  const isTributaryCity =
    (state.tributaries ?? []).includes(inspected.id) ||
    state.settlementStatuses?.[inspected.id] === 'tributary';
  const isFortifiedEnemyCity = inspected.baseDefense >= 7 && !isHeldByPlayer;

  const currentStatus: SettlementStatus =
    state.settlementStatuses?.[inspected.id] ?? inspected.defaultStatus ?? 'independent';

  const used = state.yearlyActivitiesUsed ?? {};
  const builtThisYear = Boolean(state.builtThisYear);
  const allBuildingKeys = Object.keys(BUILDINGS_CATALOG) as BuildingType[];

  const canRaidSelected =
    inspected.id !== currentLoc.id &&
    state.character.age >= 15 &&
    state.realm.longships > 0 &&
    state.realm.hirdWarriors > 0 &&
    !used.raid;

  // Demographics & Loyalty calculations for the inspected city
  const baseNorsePop = inspected.norsePopulation ?? 150;
  const baseNativePop = inspected.nativePopulation ?? 850;
  const baseTotalPop = baseNorsePop + baseNativePop;
  const norsePct = cityHolding?.norsePopulationShare ?? Math.round((baseNorsePop / baseTotalPop) * 100);

  // Loyalty vs Unrest calculation
  const cityUnrest = cityHolding
    ? cityHolding.unrest ?? 15
    : currentStatus === 'rebellious'
      ? 82
      : currentStatus === 'conquered'
        ? 55
        : currentStatus === 'tributary'
          ? 32
          : controller.religion === state.character.religion
            ? 20
            : 45;
  const cityLoyalty = Math.max(0, Math.min(100, 100 - cityUnrest));

  // Estimated annual income from this city for the player
  const cityAnnualSilver = cityHolding
    ? cityHolding.farms * 6 +
      (cityHolding.buildings.includes('kaupang_market') ? 12 : 0) +
      (cityHolding.tributeBurden === 'extortionate'
        ? 18
        : cityHolding.tributeBurden === 'heavy'
          ? 12
          : cityHolding.tributeBurden === 'normal'
            ? 6
            : cityHolding.tributeBurden === 'light'
              ? 3
              : 0)
    : isTributaryCity
      ? Math.max(8, inspected.baseWealth * 2)
      : 0;
  const cityAnnualFood = cityHolding ? cityHolding.farms * 14 : 0;

  // Filter matching logic for map lens
  const matchesLens = (s: Settlement): boolean => {
    if (activeLens === 'all') return true;
    if (activeLens === 'owned') {
      const owned = state.realm.holdings.some((h) => h.settlementId === s.id && h.farms > 0);
      const trib = (state.tributaries ?? []).includes(s.id);
      return owned || trib || s.id === currentLoc.id;
    }
    if (activeLens === 'loot') {
      return s.settlementType === 'monastery' || s.baseWealth >= 7;
    }
    if (activeLens === 'trade') {
      return s.settlementType === 'trading_post' || s.settlementType === 'capital' || s.baseWealth >= 8;
    }
    return true;
  };

  // Cycle ports in current lens
  const navigablePorts = useMemo(() => {
    const filtered = SETTLEMENTS.filter(
      (s) =>
        (state.discoveredSettlements.includes(s.id) || showUnexplored || s.id === currentLoc.id) &&
        matchesLens(s)
    );
    return filtered.length > 0 ? filtered : SETTLEMENTS;
  }, [state.discoveredSettlements, showUnexplored, currentLoc.id, activeLens, state.realm.holdings]);

  const handleCyclePort = (dir: -1 | 1) => {
    if (navigablePorts.length === 0) return;
    const idx = navigablePorts.findIndex((p) => p.id === inspected.id);
    const nextIdx = idx === -1 ? 0 : (idx + dir + navigablePorts.length) % navigablePorts.length;
    const nextPort = navigablePorts[nextIdx];
    handleFocusSettlement(nextPort, Math.max(zoom, 1.55));
  };

  const raidTacticOptions: {
    value: RaidTactic;
    label: string;
    desc: string;
    tag: string;
  }[] = [
    {
      value: 'surprise',
      label: isFa ? 'شبیخون سحرگاهی' : 'Dawn Surprise',
      desc: isFa ? 'شبیخون غافلگیرانه در مه، تکیه بر زیرکی' : 'Stealth landing in coastal mist, relying on Cunning',
      tag: isFa ? 'زیرکی' : 'Cunning',
    },
    {
      value: 'shield_wall',
      label: isFa ? 'دیوار سپرها' : 'Shield-Wall',
      desc: isFa ? 'نبرد منظم و سنگین، محافظت در برابر تلفات' : 'Disciplined clash of wood and iron, best defense',
      tag: isFa ? 'قدرت' : 'Strength',
    },
    {
      value: 'ransom',
      label: isFa ? 'محاصره و باج‌خواهی' : 'Hostage Ransom',
      desc: isFa ? 'گرفتن اسیران اشرافی برای نقره بیشتر بدون تلفات' : 'Capture nobles and demand high silver tribute',
      tag: isFa ? 'دیپلماسی' : 'Diplomacy',
    },
    {
      value: 'feigned_retreat',
      label: isFa ? 'عقب‌نشینی ساختگی' : 'Feigned Retreat',
      desc: isFa ? 'فریب مدافعان به دشت باز با تغییر تاکتیک ناگهانی' : 'Lure garrison into an open beach ambush',
      tag: isFa ? 'تاکتیک' : 'Tactic',
    },
  ];

  // Active curved voyage arc coordinates
  const currentPt = projectLatLon(currentLoc.lat, currentLoc.lon);
  const targetPt = projectLatLon(inspected.lat, inspected.lon);
  const dxArc = targetPt.x - currentPt.x;
  const dyArc = targetPt.y - currentPt.y;
  const distSvg = Math.hypot(dxArc, dyArc);
  const midX = (currentPt.x + targetPt.x) / 2;
  const midY = (currentPt.y + targetPt.y) / 2 - Math.min(42, distSvg * 0.16);
  const curvedCoursePath = `M ${currentPt.x} ${currentPt.y} Q ${midX} ${midY} ${targetPt.x} ${targetPt.y}`;
  const isLightTheme = (state.settings.theme ?? 'light') === 'light';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.965 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full h-full max-h-dvh flex flex-col bg-[#060B12] overflow-hidden select-none"
    >
      {/* ================================================================= */}
      {/* MINIMAL FLOATING CORNER CONTROLS (NO TRUNCATED COUNTRY BAR)       */}
      {/* ================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-2.5 inset-x-2.5 sm:inset-x-3.5 z-30 flex flex-col gap-1.5 pointer-events-none"
      >
        <div className="flex items-center justify-end gap-2">
          {/* Compact Classic Controls (Fleet Center, Zoom, Season & Legend) */}
          <div className="pointer-events-auto flex items-center gap-0.5 p-1 rounded-xl bg-[#0A1320]/90 backdrop-blur-md border border-[#1E2E42] shadow-sm shrink-0">
            <button
              type="button"
              onClick={handleResetToFleet}
              title={isFa ? 'تمرکز روی ناوگان شما' : 'Center on Your Fleet'}
              aria-label={isFa ? 'موقعیت ناوگان' : 'Your Fleet'}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#F59E0B] hover:bg-[#162334] transition-colors cursor-pointer"
            >
              <LocateFixed className="w-3.5 h-3.5 shrink-0" />
            </button>
            <button
              type="button"
              onClick={() => applyZoom(zoom + 0.35)}
              aria-label={isFa ? 'بزرگ‌نمایی' : 'Zoom In'}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#F1F5F9] hover:bg-[#162334] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyZoom(zoom - 0.35)}
              aria-label={isFa ? 'کوچک‌نمایی' : 'Zoom Out'}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#F1F5F9] hover:bg-[#162334] transition-colors cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-[#1E2E42] mx-0.5" />
            <button
              type="button"
              onClick={() => setIsLegendOpen((prev) => !prev)}
              aria-expanded={isLegendOpen}
              title={isFa ? 'فیلترها، آب‌وهوا و راهنمای نقشه' : 'Filters, Weather & Map Legend'}
              className={`min-h-[28px] px-2 py-0.5 rounded-lg inline-flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                isLegendOpen || activeLens !== 'all'
                  ? 'bg-[#15253A] text-[#38BDF8]'
                  : 'text-[#CBD5E1] hover:text-white hover:bg-[#162334]'
              }`}
            >
              {renderSeasonIcon(state.season, 'w-3.5 h-3.5 shrink-0')}
              <span className="font-bold text-[#F1F5F9]">
                {SEASON_LABELS[lang][state.season]}
              </span>
              <Info className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* FLOATING MINIMAL LEGEND, FILTERS & WEATHER PANEL (DYNAMIC HEIGHT) */}
        {/* ================================================================= */}
        <AnimatePresence>
          {isLegendOpen && (
            <motion.div
              key="map-legend-panel"
              initial={{ opacity: 0, scale: 0.95, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto self-end w-[min(23rem,calc(100vw-1.25rem))] max-h-[calc(100dvh-15rem)] flex flex-col overflow-hidden rounded-2xl bg-[#0A1320]/95 backdrop-blur-md border border-[#22344A] shadow-[0_18px_42px_rgba(0,0,0,0.88)]"
            >
              {/* Compact Header & Section Switcher */}
              <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-[#1B2B3E] shrink-0">
                <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-[#070E18] border border-[#1B2A3D]">
                  {(
                    [
                      { id: 'all', fa: 'همه', en: 'All' },
                      { id: 'settlements', fa: 'نوع بنادر', en: 'Settlements' },
                      { id: 'weather', fa: 'آب‌وهوا', en: 'Weather' },
                    ] as const
                  ).map((tab) => {
                    const active = legendSection === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setLegendSection(tab.id)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#1D2F44] text-[#38BDF8]'
                            : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                        }`}
                      >
                        {isFa ? tab.fa : tab.en}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowUnexplored((v) => !v)}
                    aria-pressed={showUnexplored}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                      showUnexplored
                        ? 'bg-[#38BDF8]/20 text-[#38BDF8]'
                        : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                    }`}
                  >
                    <Eye className="w-3 h-3 shrink-0" />
                    <span>{showUnexplored ? (isFa ? 'همه بنادر' : 'All') : (isFa ? 'مه دریا' : 'Fog')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLegendOpen(false)}
                    aria-label={isFa ? 'بستن راهنما' : 'Close Legend'}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#162436] transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Port Lens Filter Strip Inside Popover */}
              <div className="px-3 py-2 border-b border-[#1B2B3E] flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
                {(
                  [
                    { id: 'all', fa: 'همه بنادر', en: 'All Ports' },
                    { id: 'owned', fa: 'املاک شما', en: 'Your Realm' },
                    { id: 'loot', fa: 'اهداف غارت', en: 'Rich Loot' },
                    { id: 'trade', fa: 'مراکز تجاری', en: 'Trade Hubs' },
                  ] as { id: MapLensId; fa: string; en: string }[]
                ).map((lens) => {
                  const active = activeLens === lens.id;
                  return (
                    <button
                      key={lens.id}
                      type="button"
                      onClick={() => setActiveLens(lens.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#F59E0B] text-[#0B1118] font-bold'
                          : 'bg-[#121D2C] text-[#94A3B8] hover:text-[#F1F5F9]'
                      }`}
                    >
                      {isFa ? lens.fa : lens.en}
                    </button>
                  );
                })}
              </div>

              {/* Scrollable Body Adapting to Available Screen Space */}
              <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 text-xs">
                {(legendSection === 'all' || legendSection === 'settlements') && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#94A3B8]">
                        {isFa ? 'نمادها و نوع سکونتگاه‌ها' : 'Settlement Types & Roles'}
                      </span>
                      <span className="text-[10px] text-[#64748B]">
                        {isFa ? 'کلیک برای فیلتر' : 'Click to filter'}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveLens(activeLens === 'loot' ? 'all' : 'loot')}
                        className={`w-full p-2 rounded-xl border text-start flex items-center gap-2.5 transition-colors cursor-pointer ${
                          activeLens === 'loot'
                            ? 'bg-[#281D0B] border-[#F59E0B]/60'
                            : 'bg-[#0E1826]/90 border-[#1C2C40] hover:border-[#2C4462]'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#F59E0B]/15 border border-[#F59E0B]/40 flex items-center justify-center shrink-0">
                          <Church className="w-3.5 h-3.5 text-[#FBBF24]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[#F1F5F9] text-[11px]">
                              {isFa ? 'صومعه مقدس (Monastery)' : 'Holy Monastery'}
                            </span>
                            <span className="text-[10px] font-mono text-[#FBBF24]">
                              {isFa ? 'غنیمت زرین · دفاع کم' : 'High Loot · Low Def'}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#94A3B8] truncate">
                            {isFa
                              ? 'صندوق‌های نقره و عتیقه؛ بهترین هدف برای شبیخون سریع دریایی'
                              : 'Rich silver reliquaries with weak guards; prime raid target'}
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveLens(activeLens === 'trade' ? 'all' : 'trade')}
                        className="w-full p-2 rounded-xl bg-[#0E1826]/90 border border-[#1C2C40] hover:border-[#2C4462] text-start flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#A855F7]/15 border border-[#A855F7]/40 flex items-center justify-center shrink-0">
                          <Crown className="w-3.5 h-3.5 text-[#C084FC]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[#F1F5F9] text-[11px]">
                              {isFa ? 'پایتخت پادشاهی (Capital)' : 'Royal Capital'}
                            </span>
                            <span className="text-[10px] font-mono text-[#C084FC]">
                              {isFa ? 'ثروت بالا · دیپلماسی' : 'High Wealth · Court'}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#94A3B8] truncate">
                            {isFa
                              ? 'مقر پادشاهان و امپراتوران؛ مناسب پیمان تجاری، باج دانگلد یا گارد وارنگیان'
                              : 'Seat of kings; ideal for grand treaties, Danegeld, or royal service'}
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveLens(activeLens === 'owned' ? 'all' : 'owned')}
                        className={`w-full p-2 rounded-xl border text-start flex items-center gap-2.5 transition-colors cursor-pointer ${
                          activeLens === 'owned'
                            ? 'bg-[#0D261F] border-[#10B981]/60'
                            : 'bg-[#0E1826]/90 border-[#1C2C40] hover:border-[#2C4462]'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center shrink-0">
                          <Landmark className="w-3.5 h-3.5 text-[#34D399]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[#F1F5F9] text-[11px]">
                              {isFa ? 'اقامتگاه یارل و شهرک (Jarldom / Town)' : 'Jarldom Seat & Town'}
                            </span>
                            <span className="text-[10px] font-mono text-[#34D399]">
                              {isFa ? 'اسکان و ساخت بنا' : 'Settle & Build'}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#94A3B8] truncate">
                            {isFa
                              ? 'مناسب خرید مزرعه (اسکان نورس)، ساخت بنا و مدیریت وفاداری شهر'
                              : 'Ideal for establishing Norse farms, buildings & loyalty governance'}
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {(legendSection === 'all' || legendSection === 'weather') && (
                  <div
                    className={
                      legendSection === 'all'
                        ? 'pt-2.5 border-t border-[#1B2B3E] space-y-2'
                        : 'space-y-2'
                    }
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#94A3B8]">
                        {isFa ? 'تأثیر فصل و آب‌وهوا بر دریانوردی' : 'Seasonal Weather & Sea Impact'}
                      </span>
                      <span className="text-[10px] font-mono tabular-nums text-[#38BDF8]">
                        {isFa
                          ? `مهارت دریانوردی: ${effectiveSeamanship}`
                          : `Seamanship: ${effectiveSeamanship}`}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0F1C2E] border border-[#263C57] space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 font-bold text-[#F1F5F9] text-xs">
                          {renderSeasonIcon(state.season, 'w-4 h-4')}
                          <span>
                            {SEASON_LABELS[lang][state.season]} — {currentWeather.weatherName}
                          </span>
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold tabular-nums px-1.5 py-0.5 rounded ${
                            state.season === Season.Summer
                              ? 'bg-[#10B981]/20 text-[#34D399]'
                              : state.season === Season.Winter
                                ? 'bg-[#EF4444]/20 text-[#F87171]'
                                : 'bg-[#F59E0B]/20 text-[#FBBF24]'
                          }`}
                        >
                          {currentWeather.seaEffectShort}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#CBD5E1] leading-relaxed">
                        {currentWeather.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {allSeasonsOrder.map((s) => {
                        const prof = getSeasonalWeatherProfile(s, lang);
                        const isCurrentSeason = s === state.season;
                        return (
                          <div
                            key={s}
                            className={`p-2 rounded-xl border text-[10px] flex flex-col gap-0.5 ${
                              isCurrentSeason
                                ? 'bg-[#16283E] border-[#38BDF8]/60 text-[#F1F5F9]'
                                : 'bg-[#0C1522] border-[#1A293C] text-[#94A3B8]'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span className="inline-flex items-center gap-1 text-[#F1F5F9]">
                                {renderSeasonIcon(s, 'w-3 h-3')}
                                <span>{SEASON_LABELS[lang][s]}</span>
                              </span>
                            </div>
                            <div className="font-mono tabular-nums text-[10px] flex items-center justify-between mt-0.5">
                              <span
                                className={
                                  prof.riskPenaltyPct === 0
                                    ? 'text-[#34D399]'
                                    : prof.riskPenaltyPct >= 25
                                      ? 'text-[#F87171]'
                                      : 'text-[#FBBF24]'
                                }
                              >
                                {isFa
                                  ? `خطر +${prof.riskPenaltyPct}%`
                                  : `+${prof.riskPenaltyPct}% Risk`}
                              </span>
                              <span className="text-[#CBD5E1]">
                                {isFa ? `سرعت ${prof.speedPct}%` : `${prof.speedPct}% Spd`}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ================================================================= */}
      {/* INTERACTIVE FULL-HEIGHT VECTOR MAP SVG STAGE                      */}
      {/* ================================================================= */}
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex-1 min-h-0 w-full overflow-hidden bg-[#07101B] cursor-grab active:cursor-grabbing"
      >
        <svg
          viewBox={viewBoxStr}
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full block touch-none"
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <defs>
            <radialGradient id="nordicOceanGrad" cx="50%" cy="42%" r="68%">
              <stop offset="0%" stopColor={isLightTheme ? '#CDE4F2' : '#0F2238'} />
              <stop offset="55%" stopColor={isLightTheme ? '#B2D3E8' : '#091626'} />
              <stop offset="100%" stopColor={isLightTheme ? '#8FB9D6' : '#050C15'} />
            </radialGradient>
            <linearGradient id="landTerrainGrad" x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stopColor={isLightTheme ? '#E8DEC8' : '#182A3E'} />
              <stop offset="45%" stopColor={isLightTheme ? '#EFE6D5' : '#152538'} />
              <stop offset="100%" stopColor={isLightTheme ? '#E3D5BA' : '#111E2E'} />
            </linearGradient>
          </defs>

          {/* Realistic Bathymetric Sea Canvas */}
          <rect
            x={-600}
            y={-600}
            width={MAP_BOUNDS.width + 1200}
            height={MAP_BOUNDS.height + 1200}
            fill="url(#nordicOceanGrad)"
          />

          {/* Subtle Cartographic Latitude/Longitude Graticules */}
          {[-45, -30, -15, 0, 15, 30, 45].map((lon) => {
            const { x } = projectLatLon(0, lon);
            return (
              <line
                key={`lon_${lon}`}
                x1={x}
                y1={-500}
                x2={x}
                y2={MAP_BOUNDS.height + 500}
                stroke={isLightTheme ? '#6B9DBB' : '#132842'}
                strokeOpacity={isLightTheme ? '0.24' : '0.45'}
                strokeWidth={0.65 / zoom}
                strokeDasharray="3 3"
              />
            );
          })}
          {[35, 45, 55, 65].map((lat) => {
            const { y } = projectLatLon(lat, 0);
            return (
              <line
                key={`lat_${lat}`}
                x1={-600}
                y1={y}
                x2={MAP_BOUNDS.width + 600}
                y2={y}
                stroke={isLightTheme ? '#6B9DBB' : '#132842'}
                strokeOpacity={isLightTheme ? '0.24' : '0.45'}
                strokeWidth={0.65 / zoom}
                strokeDasharray="3 3"
              />
            );
          })}

          {/* Classic Nautical Compass Rose in Open Atlantic */}
          <g
            transform={`translate(${projectLatLon(48.5, -27.5).x}, ${projectLatLon(48.5, -27.5).y})`}
            opacity={isLightTheme ? '0.25' : '0.16'}
          >
            <circle cx="0" cy="0" r="36" fill="none" stroke={isLightTheme ? '#334155' : '#38BDF8'} strokeWidth="0.7" />
            <circle cx="0" cy="0" r="26" fill="none" stroke={isLightTheme ? '#334155' : '#38BDF8'} strokeWidth="0.45" strokeDasharray="2 2" />
            <path d="M 0 -40 L 3.8 -5 L 40 0 L 3.8 5 L 0 40 L -3.8 5 L -40 0 L -3.8 -5 Z" fill={isLightTheme ? '#334155' : '#38BDF8'} />
          </g>

          {/* High-Resolution Landmass Polygons with Multi-Stage Coastal Bathymetry & Relief */}
          {LANDMASS_POLYGONS.map((poly) => {
            const pathD = pointsToSmoothSvgPath(poly.coords, true, 0.18);
            return (
              <g key={poly.id}>
                {/* Outer Continental Shelf Shallow Water Glow */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isLightTheme ? '#BEE0F2' : '#112A45'}
                  strokeOpacity={isLightTheme ? '0.75' : '0.65'}
                  strokeWidth={8.5 / Math.sqrt(zoom)}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {/* Inner Coastal Ripple / Shoal Water Contour */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isLightTheme ? '#9CC8E3' : '#183758'}
                  strokeOpacity={isLightTheme ? '0.85' : '0.75'}
                  strokeWidth={3.6 / Math.sqrt(zoom)}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {/* Main Topographic Landmass Body */}
                <path
                  d={pathD}
                  fill="url(#landTerrainGrad)"
                  stroke={isLightTheme ? '#78644C' : '#35567B'}
                  strokeWidth={1.25 / Math.sqrt(zoom)}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {/* Subtle Inner Coastal Rim Highlight */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isLightTheme ? '#FAF4E8' : '#243C58'}
                  strokeOpacity={isLightTheme ? '0.65' : '0.45'}
                  strokeWidth={0.65 / Math.sqrt(zoom)}
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

          {/* Major Inland Seas & Lakes (Ladoga, Onega, Vänern, Vättern, Caspian) */}
          {INLAND_LAKES.map((lake) => {
            const lakePath = pointsToSmoothSvgPath(lake.coords, true, 0.2);
            return (
              <path
                key={lake.id}
                d={lakePath}
                fill={isLightTheme ? '#B8D9EC' : '#0B1A2C'}
                stroke={isLightTheme ? '#78644C' : '#2D4A6A'}
                strokeWidth={0.95 / Math.sqrt(zoom)}
                strokeLinejoin="round"
              />
            );
          })}

          {/* Smaller Archipelago Islands (Orkney, Shetland, Faroes, Isle of Man, Iona) */}
          {['kirkwall', 'shetland', 'faroes', 'isle_of_man', 'iona'].map((islId) => {
            const s = SETTLEMENTS_BY_ID[islId];
            if (!s) return null;
            const { x, y } = projectLatLon(s.lat, s.lon);
            return (
              <g key={`isl_${islId}`}>
                <ellipse
                  cx={x}
                  cy={y}
                  rx={5.8}
                  ry={3.8}
                  fill="none"
                  stroke={isLightTheme ? '#BEE0F2' : '#112A45'}
                  strokeWidth={3.2 / Math.sqrt(zoom)}
                />
                <ellipse
                  cx={x}
                  cy={y}
                  rx={5.2}
                  ry={3.4}
                  fill={isLightTheme ? '#ECE2CE' : '#182A3E'}
                  stroke={isLightTheme ? '#78644C' : '#35567B'}
                  strokeWidth={1.0 / Math.sqrt(zoom)}
                />
              </g>
            );
          })}

          {/* Topographic Mountain Ridges & Highland Relief */}
          <g className="pointer-events-none select-none">
            {MOUNTAIN_RANGES.map((range) => {
              const pts = range.coords.map(([lat, lon]) => projectLatLon(lat, lon));
              const spineD = pointsToSmoothSvgPath(range.coords, false, 0.22);
              return (
                <g key={range.id}>
                  {/* Soft Highland Elevation Shadow Along Ridge */}
                  <path
                    d={spineD}
                    fill="none"
                    stroke={isLightTheme ? '#C9B99B' : '#0D1724'}
                    strokeOpacity={isLightTheme ? '0.48' : '0.55'}
                    strokeWidth={7.5 / Math.sqrt(zoom)}
                    strokeLinecap="round"
                  />
                  {/* Cartographic Mountain Peaks Along the Spine */}
                  {pts.map((pt, idx) => {
                    const s = (idx % 2 === 0 ? 4.4 : 3.4) / Math.sqrt(zoom);
                    return (
                      <g key={`${range.id}_pk_${idx}`} transform={`translate(${pt.x}, ${pt.y})`}>
                        <path
                          d={`M ${-s * 1.35} ${s * 0.75} L 0 ${-s} L ${s * 1.35} ${s * 0.75}`}
                          fill={isLightTheme ? '#DFD1B8' : '#1F344D'}
                          stroke={isLightTheme ? '#8C775C' : '#436588'}
                          strokeWidth={0.85 / Math.sqrt(zoom)}
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        />
                        <path
                          d={`M 0 ${-s} L ${s * 0.35} ${s * 0.75} L ${s * 1.35} ${s * 0.75} Z`}
                          fill={isLightTheme ? '#B8A486' : '#0F1C2C'}
                          opacity="0.45"
                        />
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </g>

          {/* Smooth Organic Navigable River Systems */}
          {NAVIGABLE_RIVERS.map((riv) => (
            <path
              key={riv.name}
              d={pointsToSmoothSvgPath(riv.coords, false, 0.22)}
              fill="none"
              stroke={isLightTheme ? '#4A8EC2' : '#1E4E8C'}
              strokeOpacity={isLightTheme ? '0.68' : '0.62'}
              strokeWidth={1.55 / Math.sqrt(zoom)}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* SUBTLE NAUTICAL SEA & OCEAN LABELS */}
          <g className="pointer-events-none select-none">
            {SEA_MAP_LABELS.map((sea) => {
              const { x, y } = projectLatLon(sea.lat, sea.lon);
              const fontSize = (sea.size ?? 11.5) / Math.pow(zoom, 0.38);
              return (
                <text
                  key={sea.id}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  transform={sea.rotate ? `rotate(${sea.rotate}, ${x}, ${y})` : undefined}
                  fill={isLightTheme ? '#2C5E82' : '#60A5FA'}
                  opacity={isLightTheme ? 0.42 : 0.28}
                  fontSize={fontSize}
                  fontStyle="italic"
                  fontWeight="600"
                  letterSpacing={isFa ? '0.01em' : '0.14em'}
                  className="font-saga"
                >
                  {isFa ? sea.labelFa : sea.labelEn}
                </text>
              );
            })}
          </g>

          {/* FADED CLASSIC CARTOGRAPHIC COUNTRY / REALM NAMES ON THE MAP */}
          <g className="pointer-events-none select-none">
            {REALM_MAP_LABELS.map((r) => {
              const { x, y } = projectLatLon(r.lat, r.lon);
              const fontSize = (r.size ?? 14) / Math.pow(zoom, 0.35);
              return (
                <text
                  key={r.id}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  transform={r.rotate ? `rotate(${r.rotate}, ${x}, ${y})` : undefined}
                  fill={isLightTheme ? '#5A4631' : '#94A3B8'}
                  opacity={isLightTheme ? 0.38 : 0.30}
                  fontSize={fontSize}
                  fontWeight="800"
                  letterSpacing={isFa ? '0.02em' : '0.18em'}
                  className="font-saga"
                >
                  {isFa ? r.labelFa : r.labelEn}
                </text>
              );
            })}
          </g>

          {/* Single Elegant Curved Sea Course from Current Port to Selected Port */}
          {inspected.id !== currentLoc.id && (
            <g>
              <path
                d={curvedCoursePath}
                fill="none"
                stroke={
                  voyage.dangerPct >= 35
                    ? '#DC2626'
                    : voyage.dangerPct >= 18
                      ? '#D97706'
                      : isLightTheme
                        ? '#0369A1'
                        : '#38BDF8'
                }
                strokeOpacity="0.18"
                strokeWidth={5 / Math.sqrt(zoom)}
                strokeLinecap="round"
              />
              <path
                d={curvedCoursePath}
                fill="none"
                stroke={
                  voyage.dangerPct >= 35
                    ? '#DC2626'
                    : voyage.dangerPct >= 18
                      ? '#D97706'
                      : isLightTheme
                        ? '#0369A1'
                        : '#38BDF8'
                }
                strokeWidth={1.85 / Math.sqrt(zoom)}
                strokeDasharray="4.5 3.5"
                strokeLinecap="round"
              />
            </g>
          )}

          {/* World Settlements — Clicking Any City Selects It and Opens the Interactive Details Panel */}
          {SETTLEMENTS.map((s) => {
            const { x, y } = projectLatLon(s.lat, s.lon);
            const isCurrent = s.id === currentLoc.id;
            const isSelected = s.id === inspected.id;
            const known =
              state.discoveredSettlements.includes(s.id) || showUnexplored;
            const playerOwns = state.realm.holdings.some(
              (h) => h.settlementId === s.id && h.farms > 0
            );
            const status: SettlementStatus =
              state.settlementStatuses?.[s.id] ?? s.defaultStatus ?? 'independent';
            const inLens = matchesLens(s);

            const mapPortLabel = isFa
              ? (SETTLEMENTS_FA[s.id]?.name ?? s.name).split(' (')[0]
              : s.name.split(' (')[0];

            const hint = LABEL_ANCHOR_HINTS[s.id];
            const anchor = hint?.anchor ?? 'start';
            const dx = (hint?.dx ?? 8) / Math.sqrt(zoom);
            const dy = (hint?.dy ?? 3.5) / Math.sqrt(zoom);

            const showLabel =
              isCurrent ||
              isSelected ||
              playerOwns ||
              (known && inLens && (s.settlementType === 'capital' || zoom >= 1.85));

            return (
              <g
                key={s.id}
                transform={`translate(${x}, ${y})`}
                opacity={inLens || isCurrent || isSelected ? 1 : 0.22}
                onClick={() => {
                  if (!dragRef.current.moved) {
                    setSelectedId(s.id);
                    setActiveSheetTab('assets');
                    setIsSheetOpen(true);
                  }
                }}
                className="cursor-pointer transition-opacity"
              >
                {/* Generous Touch Target */}
                <circle cx="0" cy="0" r={22 / Math.sqrt(zoom)} fill="transparent" />

                {/* Classic Cartographic Glyph */}
                <SettlementGlyph
                  type={s.settlementType ?? 'town'}
                  status={status}
                  isCurrent={isCurrent}
                  isSelected={isSelected}
                  playerOwns={playerOwns}
                  isKnown={known}
                  isLightTheme={isLightTheme}
                  zoom={zoom}
                />

                {/* Crisp, Uncluttered Port Label */}
                {showLabel && (
                  <text
                    x={dx}
                    y={dy}
                    textAnchor={anchor}
                    fill={
                      isCurrent
                        ? isLightTheme
                          ? '#B45309'
                          : '#FCD34D'
                        : isSelected
                          ? isLightTheme
                            ? '#0369A1'
                            : '#7DD3FC'
                          : playerOwns
                            ? isLightTheme
                              ? '#047857'
                              : '#6EE7B7'
                            : isLightTheme
                              ? '#1E293B'
                              : '#F1F5F9'
                    }
                    stroke={isLightTheme ? '#FAF6EE' : '#050A11'}
                    strokeWidth={3.8 / Math.sqrt(zoom)}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    paintOrder="stroke fill"
                    className="[paint-order:stroke_fill]"
                    fontSize={(isCurrent || isSelected ? 12.5 : 10.5) / Math.sqrt(zoom)}
                    fontWeight={isCurrent || isSelected ? '700' : '600'}
                  >
                    {mapPortLabel}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* ================================================================= */}
        {/* SLEEK 2-LINE CLASSIC BOTTOM PORT STRIP                            */}
        {/* ================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.34, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-2.5 inset-x-2.5 sm:inset-x-3.5 z-30 pointer-events-none"
        >
          <div className="pointer-events-auto rounded-2xl bg-[#0A1320]/94 backdrop-blur-md border border-[#22344A] shadow-[0_12px_32px_rgba(0,0,0,0.65)] px-3 py-2.5 flex flex-col gap-2">
            {/* Line 1: Port Emblem, Name, Quick Loyalty/Assets Summary & Cycle Arrows */}
            <div className="flex items-center justify-between gap-2 min-w-0">
              <button
                type="button"
                onClick={() => {
                  setActiveSheetTab('assets');
                  setIsSheetOpen(true);
                }}
                className="flex items-center gap-2 min-w-0 flex-1 text-start cursor-pointer group"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    inspected.id === currentLoc.id
                      ? 'bg-[#F59E0B]/20 text-[#F59E0B] ring-1 ring-[#F59E0B]/40'
                      : isHeldByPlayer
                        ? 'bg-[#10B981]/20 text-[#34D399] ring-1 ring-[#10B981]/40'
                        : isFortifiedEnemyCity
                          ? 'bg-[#EF4444]/20 text-[#F87171] ring-1 ring-[#EF4444]/40'
                          : 'bg-[#38BDF8]/15 text-[#38BDF8] ring-1 ring-[#38BDF8]/35'
                  }`}
                >
                  {inspected.settlementType === 'monastery' ? (
                    <Church className="w-4 h-4 text-[#FBBF24]" />
                  ) : inspected.settlementType === 'capital' ? (
                    <Crown className="w-4 h-4 text-[#A855F7]" />
                  ) : isFortifiedEnemyCity ? (
                    <Castle className="w-4 h-4" />
                  ) : (
                    <Anchor className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0 flex-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <h3 className="text-sm sm:text-base font-bold text-[#F1F5F9] group-hover:text-[#F59E0B] transition-colors truncate">
                    {inspectedDisplayName}
                  </h3>
                  <span className="text-[11px] font-mono tabular-nums text-[#94A3B8] truncate">
                    {isHeldByPlayer ? (
                      <span className="font-sans font-semibold text-[#34D399]">
                        {isFa
                          ? `${cityHolding?.farms ?? 0} مزرعه · وفاداری ${cityLoyalty}%`
                          : `${cityHolding?.farms ?? 0} Farms · Loyalty ${cityLoyalty}%`}
                      </span>
                    ) : inspected.id === currentLoc.id ? (
                      <span className="font-sans font-semibold text-[#FBBF24]">
                        {isFa ? 'لنگرگاه شما' : 'Current Port'}
                      </span>
                    ) : (
                      <span className="text-[#38BDF8]">
                        {isFa
                          ? `${voyage.sailingDays} روز راه · خطر ${voyage.dangerPct}%`
                          : `${voyage.sailingDays}d sail · ${voyage.dangerPct}% risk`}
                      </span>
                    )}
                    {' · '}
                    <span className="text-[#FBBF24]">
                      {isFa
                        ? `ثروت ${isDiscovered ? inspected.baseWealth : '?'}`
                        : `W ${isDiscovered ? inspected.baseWealth : '?'}`}
                    </span>
                    {' · '}
                    <span className="text-[#CBD5E1]">
                      {isFa
                        ? `دفاع ${isDiscovered ? inspected.baseDefense : '?'}`
                        : `D ${isDiscovered ? inspected.baseDefense : '?'}`}
                    </span>
                  </span>
                </div>
              </button>

              {/* Compact Prev / Next Port Arrows */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCyclePort(-1)}
                  aria-label={isFa ? 'بندر قبلی' : 'Previous Port'}
                  className="w-7 h-7 rounded-lg bg-[#131F30] hover:bg-[#1C2D44] border border-[#24364D] flex items-center justify-center text-[#CBD5E1] hover:text-white cursor-pointer transition-colors"
                >
                  {isFa ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleCyclePort(1)}
                  aria-label={isFa ? 'بندر بعدی' : 'Next Port'}
                  className="w-7 h-7 rounded-lg bg-[#131F30] hover:bg-[#1C2D44] border border-[#24364D] flex items-center justify-center text-[#CBD5E1] hover:text-white cursor-pointer transition-colors"
                >
                  {isFa ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Line 2: Single Unwrapped Row of Contextual Actions */}
            <div className="flex items-center gap-1.5 pt-1.5 border-t border-[#1C2C40]">
              {inspected.id !== currentLoc.id && onSailTo ? (
                <button
                  type="button"
                  disabled={!hasShips || Boolean(used.travel)}
                  onClick={() => onSailTo(inspected.id)}
                  className="flex-1 min-h-[36px] px-2.5 py-1 rounded-xl bg-[#0284C7] hover:bg-[#38BDF8] hover:text-[#0B1118] disabled:bg-[#192434] disabled:text-[#64748B] text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer truncate transition-colors"
                >
                  <Ship className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {used.travel
                      ? isFa
                        ? 'سفر انجام شد ✓'
                        : 'Sailed ✓'
                      : !hasShips
                        ? isFa
                          ? 'نیازمند کشتی'
                          : 'Needs Ship'
                        : isFa
                          ? 'سفر دریایی'
                          : 'Sail Here'}
                  </span>
                </button>
              ) : onTradeHere ? (
                <button
                  type="button"
                  disabled={Boolean(used.trade) || state.character.age < 15}
                  onClick={() => onTradeHere()}
                  className="flex-1 min-h-[36px] px-2.5 py-1 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] disabled:bg-[#192434] disabled:text-[#64748B] text-[#0B1118] text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer truncate transition-colors"
                >
                  <Coins className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {used.trade
                      ? isFa
                        ? 'تجارت شد ✓'
                        : 'Traded ✓'
                      : isFa
                        ? 'تجارت در بازار'
                        : 'Trade'}
                  </span>
                </button>
              ) : null}

              {inspected.id !== currentLoc.id && onRaidPort ? (
                <button
                  type="button"
                  disabled={!canRaidSelected}
                  onClick={() => {
                    setActiveSheetTab('raid');
                    setIsSheetOpen(true);
                  }}
                  className="flex-1 min-h-[36px] px-2.5 py-1 rounded-xl bg-[#2A1119] hover:bg-[#DC2626] border border-[#EF4444]/60 disabled:border-[#233246] disabled:bg-[#192434] disabled:text-[#64748B] text-[#FFE4E6] hover:text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer truncate transition-colors"
                >
                  <Swords className="w-3.5 h-3.5 shrink-0 text-[#F87171]" />
                  <span className="truncate">
                    {used.raid ? (isFa ? 'غارت شد ✓' : 'Raided ✓') : isFa ? 'غارت' : 'Raid'}
                  </span>
                </button>
              ) : onSettle ? (
                <button
                  type="button"
                  disabled={Boolean(used.settle) || state.realm.silver < 30}
                  onClick={() => onSettle(inspected.id)}
                  className="flex-1 min-h-[36px] px-2.5 py-1 rounded-xl bg-[#112620] hover:bg-[#16382E] border border-[#10B981]/50 disabled:border-[#233246] disabled:bg-[#192434] disabled:text-[#64748B] text-[#6EE7B7] text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer truncate transition-colors"
                >
                  <Landmark className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {used.settle
                      ? isFa
                        ? 'اسکان یافت ✓'
                        : 'Settled ✓'
                      : isFa
                        ? 'اسکان (۳۰ ن...)'
                        : 'Settle (30s)'}
                  </span>
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  setActiveSheetTab('assets');
                  setIsSheetOpen(true);
                }}
                className="min-h-[36px] px-3 py-1 rounded-xl bg-[#152234] hover:bg-[#1E3048] border border-[#293E58] text-xs font-bold text-[#E2E8F0] hover:text-white inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors"
              >
                <Compass className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                <span>{isFa ? 'جزئیات شهر' : 'City Panel'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ================================================================= */}
      {/* INTERACTIVE CITY DETAILS PANEL (ASSETS, LOYALTY & BUILDINGS)      */}
      {/* ================================================================= */}
      <NorseBottomSheet
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setActiveSheetTab('assets');
        }}
        accent={
          inspected.id === currentLoc.id
            ? 'amber'
            : isHeldByPlayer
              ? 'emerald'
              : isFortifiedEnemyCity
                ? 'crimson'
                : 'ice'
        }
        closeLabel={isFa ? 'بستن' : 'Close'}
        title={`${inspectedDisplayName} (${inspectedNorseName})`}
        subtitle={
          isDiscovered
            ? isFa
              ? `${REGION_LABELS.fa[inspected.regionGroup]} · ${inspectedFa?.polity ?? controller.polity}`
              : `${REGION_LABELS.en[inspected.regionGroup]} · ${controller.polity}`
            : isFa
              ? 'ساحل ناشناخته در آن‌سوی افق'
              : 'Unexplored coast beyond known waters'
        }
        icon={
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
              inspected.id === currentLoc.id
                ? 'bg-[#F59E0B]/20 text-[#F59E0B] ring-1 ring-[#F59E0B]/40'
                : isHeldByPlayer
                  ? 'bg-[#10B981]/20 text-[#34D399] ring-1 ring-[#10B981]/40'
                  : isFortifiedEnemyCity
                    ? 'bg-[#EF4444]/20 text-[#F87171] ring-1 ring-[#EF4444]/40'
                    : 'bg-[#38BDF8]/15 text-[#38BDF8] ring-1 ring-[#38BDF8]/35'
            }`}
          >
            {inspected.settlementType === 'monastery' ? (
              <Church className="w-6 h-6 text-[#FBBF24]" />
            ) : inspected.settlementType === 'capital' ? (
              <Crown className="w-6 h-6 text-[#A855F7]" />
            ) : isFortifiedEnemyCity ? (
              <Castle className="w-6 h-6" />
            ) : (
              <Anchor className="w-6 h-6" />
            )}
          </div>
        }
        footer={
          <div className="flex items-center justify-between gap-2.5">
            {inspected.id !== currentLoc.id && onSailTo ? (
              <button
                type="button"
                disabled={!hasShips || Boolean(used.travel)}
                onClick={() => {
                  onSailTo(inspected.id);
                  setIsSheetOpen(false);
                }}
                className="flex-1 min-h-[46px] px-4 rounded-xl bg-[#0284C7] hover:bg-[#38BDF8] hover:text-[#0B1118] disabled:bg-[#1E293B] disabled:text-[#64748B] text-white font-extrabold text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Ship className="w-4 h-4 shrink-0" />
                <span>
                  {used.travel
                    ? isFa
                      ? 'امسال سفر رفته‌اید ✓'
                      : 'Sailed This Year ✓'
                    : isFa
                      ? `سفر دریایی به ${inspectedDisplayName}`
                      : `Sail to ${inspectedDisplayName}`}
                </span>
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setIsSheetOpen(false)}
              className="min-h-[46px] px-5 rounded-xl bg-[#182638] hover:bg-[#22354D] border border-[#2A3E59] text-xs font-bold text-[#CBD5E1] hover:text-[#F1F5F9] cursor-pointer transition-colors ms-auto"
            >
              {isFa ? 'بستن' : 'Close'}
            </button>
          </div>
        }
      >
        {/* 4-Tab Interactive City Switcher */}
        <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#0A121D] border border-[#1E2D40]">
          <button
            type="button"
            onClick={() => setActiveSheetTab('assets')}
            className={`min-h-[36px] px-2 py-1 rounded-lg text-[11px] sm:text-xs font-bold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeSheetTab === 'assets'
                ? 'bg-[#F59E0B] text-[#0B1118]'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{isFa ? 'دارایی و وفاداری' : 'Assets & Loyalty'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSheetTab('buildings')}
            className={`min-h-[36px] px-2 py-1 rounded-lg text-[11px] sm:text-xs font-bold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeSheetTab === 'buildings'
                ? 'bg-[#F59E0B] text-[#0B1118]'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            <Hammer className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {isFa
                ? `ساختمان‌ها (${cityHolding?.buildings.length ?? 0})`
                : `Buildings (${cityHolding?.buildings.length ?? 0})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSheetTab('actions')}
            className={`min-h-[36px] px-2 py-1 rounded-lg text-[11px] sm:text-xs font-bold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeSheetTab === 'actions' ||
              activeSheetTab === 'raid' ||
              activeSheetTab === 'siege' ||
              activeSheetTab === 'diplomacy'
                ? 'bg-[#F59E0B] text-[#0B1118]'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            <Swords className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{isFa ? 'عملیات شهر' : 'Operations'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSheetTab('lore')}
            className={`min-h-[36px] px-2 py-1 rounded-lg text-[11px] sm:text-xs font-bold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeSheetTab === 'lore'
                ? 'bg-[#F59E0B] text-[#0B1118]'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{isFa ? 'تاریخچه و مسیر' : 'Voyage & Lore'}</span>
          </button>
        </div>

        {/* =============================================================== */}
        {/* TAB 1: CITY ASSETS, ECONOMY & LOYALTY STATUS                    */}
        {/* =============================================================== */}
        {activeSheetTab === 'assets' && (
          <div className="space-y-3.5">
            {/* 1. City Assets & Dynasty Holdings Card */}
            <div className="p-3.5 rounded-2xl bg-[#111A26] border border-[#22344A] space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F59E0B]">
                  <Coins className="w-4 h-4 shrink-0" />
                  <span>
                    {isFa ? 'دارایی‌ها و ظرفیت اقتصادی شهر' : 'City Assets & Dynasty Holdings'}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    isHeldByPlayer
                      ? 'bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40'
                      : isTributaryCity
                        ? 'bg-[#F59E0B]/20 text-[#FBBF24] border border-[#F59E0B]/40'
                        : 'bg-[#1E2D40] text-[#CBD5E1]'
                  }`}
                >
                  {isHeldByPlayer
                    ? isFa
                      ? 'ملک خاندان شما'
                      : 'Your Dynasty Estate'
                    : isTributaryCity
                      ? isFa
                        ? 'شهر خراجگزار شما'
                        : 'Your Tributary'
                      : SETTLEMENT_STATUS_LABELS[lang][currentStatus]}
                </span>
              </div>

              {/* 4 Key Asset Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 rounded-xl bg-[#0C141F] border border-[#1E2E42]">
                  <div className="text-[11px] text-[#94A3B8]">
                    {isFa ? 'مزارع شما در شهر' : 'Your Farms'}
                  </div>
                  <div className="text-sm font-mono font-bold text-[#34D399] mt-0.5">
                    {isFa ? `${cityHolding?.farms ?? 0} مزرعه` : `${cityHolding?.farms ?? 0} Farms`}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0C141F] border border-[#1E2E42]">
                  <div className="text-[11px] text-[#94A3B8]">
                    {isFa ? 'پادگان مستقر' : 'City Garrison'}
                  </div>
                  <div className="text-sm font-mono font-bold text-[#38BDF8] mt-0.5">
                    {isFa
                      ? `${cityHolding?.garrison ?? 0} جنگجو`
                      : `${cityHolding?.garrison ?? 0} Guards`}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0C141F] border border-[#1E2E42]">
                  <div className="text-[11px] text-[#94A3B8]">
                    {isFa ? 'ثروت بازار و دفاع' : 'Wealth & Defense'}
                  </div>
                  <div className="text-sm font-mono font-bold text-[#FBBF24] mt-0.5">
                    {isFa
                      ? `ثروت ${inspected.baseWealth} · دفاع ${inspected.baseDefense}`
                      : `W ${inspected.baseWealth} · D ${inspected.baseDefense}`}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0C141F] border border-[#1E2E42]">
                  <div className="text-[11px] text-[#94A3B8]">
                    {isFa ? 'عایدی سالانه شما' : 'Annual Yield'}
                  </div>
                  <div className="text-sm font-mono font-bold text-[#F59E0B] mt-0.5">
                    {cityAnnualSilver > 0 || cityAnnualFood > 0
                      ? isFa
                        ? `+${cityAnnualSilver} نقره · +${cityAnnualFood} غله`
                        : `+${cityAnnualSilver}s · +${cityAnnualFood}f`
                      : isFa
                        ? 'بدون ملک فعال'
                        : 'No Estate'}
                  </div>
                </div>
              </div>

              {/* Interactive Garrison & Farm Expansion Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1D2D42]">
                {cityHolding && onStationGarrison ? (
                  <div className="flex items-center gap-1.5 bg-[#0C141F] px-2.5 py-1.5 rounded-xl border border-[#22344A]">
                    <Shield className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                    <span className="text-xs font-semibold text-[#CBD5E1] me-1">
                      {isFa ? 'تنظیم پادگان شهر:' : 'Station Garrison:'}
                    </span>
                    <button
                      type="button"
                      disabled={(cityHolding.garrison ?? 0) <= 0}
                      onClick={() => onStationGarrison(inspected.id, -2)}
                      className="w-7 h-7 rounded-lg bg-[#162436] hover:bg-[#1E3148] text-[#F1F5F9] flex items-center justify-center cursor-pointer disabled:opacity-35"
                      title={isFa ? 'بازگرداندن ۲ جنگجو به ناوگان' : 'Withdraw 2 warriors'}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-mono font-bold px-1.5 text-[#F1F5F9]">
                      {cityHolding.garrison ?? 0}
                    </span>
                    <button
                      type="button"
                      disabled={state.realm.hirdWarriors < 2}
                      onClick={() => onStationGarrison(inspected.id, 2)}
                      className="w-7 h-7 rounded-lg bg-[#162436] hover:bg-[#1E3148] text-[#34D399] flex items-center justify-center cursor-pointer disabled:opacity-35"
                      title={isFa ? 'استقرار ۲ جنگجو از هیرد در شهر' : 'Station 2 warriors'}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-[#94A3B8]">
                    {isFa
                      ? 'با خرید مزرعه در این شهر، پادگان و ساخت‌وساز برای شما فعال می‌شود.'
                      : 'Establish a farm here to unlock garrison & building construction.'}
                  </span>
                )}

                {onSettle && (
                  <button
                    type="button"
                    disabled={Boolean(used.settle) || state.realm.silver < 30}
                    onClick={() => onSettle(inspected.id)}
                    className="min-h-[36px] px-3 py-1.5 rounded-xl bg-[#10B981]/20 hover:bg-[#10B981]/30 border border-[#10B981]/50 disabled:opacity-40 text-xs font-bold text-[#34D399] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Landmark className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {used.settle
                        ? isFa
                          ? 'اسکان امسال انجام شد ✓'
                          : 'Settled This Year ✓'
                        : isHeldByPlayer
                          ? isFa
                            ? 'توسعه مزرعه (+۱ مزرعه · ۳۰ نقره)'
                            : 'Expand Farm (30s)'
                          : isFa
                            ? 'تأسیس ملک و مزرعه (۳۰ نقره)'
                            : 'Establish Estate (30s)'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* 2. Loyalty Status, Governance & Demographics Card */}
            <div className="p-3.5 rounded-2xl bg-[#111A26] border border-[#22344A] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#38BDF8]">
                  <Shield className="w-4 h-4 shrink-0" />
                  <span>
                    {isFa ? 'وضعیت وفاداری، نظم و حاکمیت شهر' : 'City Loyalty Status & Governance'}
                  </span>
                </div>
                <span className="text-xs text-[#CBD5E1]">
                  {isFa ? 'حاکم محلی: ' : 'Ruler: '}
                  <strong className="text-[#F59E0B]">
                    {cityHolding?.appointedJarl
                      ? `${cityHolding.appointedJarl} (${isFa ? 'یارل منصوب شما' : 'Your Jarl'})`
                      : controller.ruler}
                  </strong>
                </span>
              </div>

              {/* Dual Loyalty & Unrest Progress Bar */}
              <div className="p-3 rounded-xl bg-[#0C141F] border border-[#1E2E42] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#F1F5F9] inline-flex items-center gap-1.5">
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        cityLoyalty >= 70
                          ? 'text-[#34D399]'
                          : cityLoyalty >= 40
                            ? 'text-[#FBBF24]'
                            : 'text-[#F87171]'
                      }`}
                    />
                    <span>
                      {isFa ? `میزان وفاداری شهر: ${cityLoyalty}%` : `City Loyalty: ${cityLoyalty}%`}
                    </span>
                  </span>
                  <span className="font-mono text-[11px] text-[#94A3B8] inline-flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-[#F87171]" />
                    <span>
                      {isFa ? `ناآرامی: ${cityUnrest}%` : `Unrest: ${cityUnrest}%`}
                    </span>
                  </span>
                </div>

                <div className="w-full h-2.5 rounded-full bg-[#1E2D40] overflow-hidden flex">
                  <div
                    style={{ width: `${cityLoyalty}%` }}
                    className={`h-full transition-all ${
                      cityLoyalty >= 70
                        ? 'bg-[#10B981]'
                        : cityLoyalty >= 40
                          ? 'bg-[#F59E0B]'
                          : 'bg-[#EF4444]'
                    }`}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#94A3B8]">
                  <span>
                    {cityLoyalty >= 75
                      ? isFa
                        ? 'وضعیت: کاملاً وفادار و آرام'
                        : 'Status: Loyal & Peaceful'
                      : cityLoyalty >= 45
                        ? isFa
                          ? 'وضعیت: باثبات؛ نیازمند حضور پادگان یا یارل'
                          : 'Status: Stable; keep garrison vigilant'
                        : isFa
                          ? 'وضعیت: ناراضی و مستعد شورش مسلحانه!'
                          : 'Status: Restless & prone to revolt!'}
                  </span>
                  {cityHolding && (
                    <span>
                      {isFa
                        ? `گروگان‌های اشرافی: ${cityHolding.hostagesCount ?? 0} نفر`
                        : `Noble Hostages: ${cityHolding.hostagesCount ?? 0}`}
                    </span>
                  )}
                </div>
              </div>

              {/* Population & Cultural Alignment Bar */}
              <div className="p-3 rounded-xl bg-[#0C141F] border border-[#1E2E42] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 text-[#CBD5E1] font-semibold">
                    <Users className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>{isFa ? 'بافت جمعیتی و آیینی شهر' : 'Population & Faith'}</span>
                  </span>
                  <span className="text-[#94A3B8] font-mono tabular-nums">
                    {isFa
                      ? `نورس ${norsePct}% · بومی ${100 - norsePct}%`
                      : `Norse ${norsePct}% · Native ${100 - norsePct}%`}
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-[#1E2D40] overflow-hidden flex">
                  <div
                    style={{ width: `${norsePct}%` }}
                    className="bg-[#F59E0B] h-full transition-all"
                  />
                  <div
                    style={{ width: `${100 - norsePct}%` }}
                    className="bg-[#38BDF8]/60 h-full transition-all"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                  <span>
                    {isFa
                      ? `فرهنگ غالب: ${inspected.primaryCultureFa ?? inspected.primaryCulture ?? 'نورس'}`
                      : `Culture: ${inspected.primaryCulture ?? 'Norse'}`}
                  </span>
                  <span>
                    {isFa
                      ? `آیین شهر: ${RELIGION_LABELS.fa[controller.religion] ?? controller.religion}`
                      : `Faith: ${RELIGION_LABELS.en[controller.religion] ?? controller.religion}`}
                  </span>
                </div>
              </div>

              {/* Interactive Loyalty & Governance Tools (When Player Holds Estate in City) */}
              {cityHolding && (
                <div className="space-y-2.5 pt-2 border-t border-[#1D2D42]">
                  {/* Tribute Burden Selector */}
                  {onSetTributeBurden && (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#CBD5E1]">
                        {isFa ? 'سطح خراج و مالیات شهر:' : 'City Tribute Burden:'}
                      </span>
                      <div className="flex items-center gap-1">
                        {(
                          [
                            { id: 'none', fa: 'معاف', en: 'None' },
                            { id: 'light', fa: 'سبک', en: 'Light' },
                            { id: 'normal', fa: 'متوسط', en: 'Normal' },
                            { id: 'heavy', fa: 'سنگین', en: 'Heavy' },
                            { id: 'extortionate', fa: 'ظالمانه', en: 'Max' },
                          ] as { id: TributeBurden; fa: string; en: string }[]
                        ).map((tb) => {
                          const active = (cityHolding.tributeBurden ?? 'normal') === tb.id;
                          return (
                            <button
                              key={tb.id}
                              type="button"
                              onClick={() => onSetTributeBurden(inspected.id, tb.id)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                                active
                                  ? 'bg-[#F59E0B] text-[#0B1118]'
                                  : 'bg-[#0C141F] border border-[#22344A] text-[#94A3B8] hover:text-[#F1F5F9]'
                              }`}
                            >
                              {isFa ? tb.fa : tb.en}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quick Loyalty Boost Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {onAppointJarl && !cityHolding.appointedJarl && (
                      <button
                        type="button"
                        disabled={state.realm.silver < 20}
                        onClick={() => onAppointJarl(inspected.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#0C141F] hover:bg-[#162436] border border-[#22344A] hover:border-[#F59E0B] text-xs font-semibold text-[#F59E0B] disabled:opacity-35 cursor-pointer"
                      >
                        👑 {isFa ? 'انتصاب یارل وفادار (۲۰ نقره · +۲۰٪ وفاداری)' : 'Appoint Jarl (20s · +20% Loyalty)'}
                      </button>
                    )}

                    {onSendSettlers && (
                      <button
                        type="button"
                        disabled={state.realm.silver < 28}
                        onClick={() => onSendSettlers(inspected.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#0C141F] hover:bg-[#162436] border border-[#22344A] hover:border-[#38BDF8] text-xs font-semibold text-[#38BDF8] disabled:opacity-35 cursor-pointer"
                      >
                        ⛵ {isFa ? 'ارسال مهاجران نورس (۲۸ نقره · +۱۴٪ وفاداری)' : 'Send Settlers (28s · +14% Loyalty)'}
                      </button>
                    )}

                    {onTakeHostages && (
                      <button
                        type="button"
                        disabled={(cityHolding.garrison ?? 0) < 6 && state.realm.hirdWarriors < 10}
                        onClick={() => onTakeHostages(inspected.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#0C141F] hover:bg-[#162436] border border-[#22344A] hover:border-[#C084FC] text-xs font-semibold text-[#C084FC] disabled:opacity-35 cursor-pointer"
                      >
                        ⛓️ {isFa ? 'گرفتن گروگان اشرافی (+۱۸٪ وفاداری)' : 'Take Hostages (+18% Loyalty)'}
                      </button>
                    )}

                    {onToggleTolerance && (
                      <button
                        type="button"
                        onClick={() => onToggleTolerance(inspected.id)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                          cityHolding.religiousTolerance
                            ? 'bg-[#10B981]/15 border-[#10B981]/50 text-[#34D399]'
                            : 'bg-[#0C141F] border-[#22344A] text-[#94A3B8]'
                        }`}
                      >
                        {cityHolding.religiousTolerance
                          ? isFa
                            ? '✓ مدارای آیینی فعال'
                            : '✓ Religious Tolerance On'
                          : isFa
                            ? 'فعالسازی مدارای آیینی'
                            : 'Enable Religious Tolerance'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 2: CITY BUILDINGS & FORTIFICATIONS                          */}
        {/* =============================================================== */}
        {activeSheetTab === 'buildings' && (
          <div className="space-y-3.5">
            {/* Inherent City Landmarks & Natural Features Banner */}
            <div className="p-3 rounded-xl bg-[#111A26] border border-[#22344A] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-[#CBD5E1]">
                  {isFa ? 'بناهای ذاتی شهر:' : 'City Landmarks:'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#182638] text-[#38BDF8] font-semibold">
                  {SETTLEMENT_TYPE_LABELS[lang][inspected.settlementType ?? 'town']}
                </span>
                {inspected.isMonastery && (
                  <span className="px-2 py-0.5 rounded-md bg-[#F59E0B]/20 text-[#FBBF24] font-semibold">
                    {isFa ? 'صومعه و خزانه مقدس' : 'Holy Monastery'}
                  </span>
                )}
                {inspected.isThingSite && (
                  <span className="px-2 py-0.5 rounded-md bg-[#10B981]/20 text-[#34D399] font-semibold">
                    {isFa ? 'میدان مجمع ثینگ (قانون)' : 'Thing Assembly Site'}
                  </span>
                )}
                {inspected.isRiverPort && (
                  <span className="px-2 py-0.5 rounded-md bg-[#38BDF8]/20 text-[#7DD3FC] font-semibold">
                    {isFa ? `بندر رودخانه‌ای (${inspected.riverName})` : `River Port (${inspected.riverName})`}
                  </span>
                )}
              </div>

              <span className="font-mono text-[11px] text-[#94A3B8]">
                {builtThisYear
                  ? isFa
                    ? 'سهمیه ساخت امسال انجام شد ✓'
                    : 'Built This Year ✓'
                  : isFa
                    ? 'ظرفیت ساخت: ۱ بنا در سال'
                    : '1 Build / Year'}
              </span>
            </div>

            {!cityHolding && (
              <div className="p-3 rounded-xl bg-[#192334] border border-[#F59E0B]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
                <div className="text-[#CBD5E1] leading-relaxed">
                  {isFa
                    ? `برای احداث بناهای اختصاصی در ${inspectedDisplayName}، ابتدا یک مزرعه یا اقامتگاه نورس در این شهر تأسیس کنید.`
                    : `To construct Norse buildings in ${inspectedDisplayName}, first establish a farm holding here.`}
                </div>
                {onSettle && (
                  <button
                    type="button"
                    disabled={Boolean(used.settle) || state.realm.silver < 30}
                    onClick={() => onSettle(inspected.id)}
                    className="min-h-[36px] px-3 py-1.5 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] disabled:opacity-40 text-[#0B1118] font-extrabold text-xs shrink-0 cursor-pointer"
                  >
                    {isFa ? 'تأسیس مزرعه (۳۰ نقره)' : 'Establish Farm (30s)'}
                  </button>
                )}
              </div>
            )}

            {/* 6 Constructible Norse Buildings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {allBuildingKeys.map((bKey) => {
                const bDef = BUILDINGS_CATALOG[bKey];
                const bFa = BUILDINGS_FA[bKey];
                const isBuilt = Boolean(cityHolding?.buildings.includes(bKey));
                const wrongFaith =
                  bDef.religionReq !== undefined && state.character.religion !== bDef.religionReq;
                const canConstruct =
                  Boolean(cityHolding) &&
                  !isBuilt &&
                  !wrongFaith &&
                  !builtThisYear &&
                  state.realm.silver >= bDef.costSilver;

                return (
                  <div
                    key={bKey}
                    className={`p-3 rounded-2xl border flex flex-col justify-between gap-2.5 ${
                      isBuilt
                        ? 'bg-[#10241F] border-[#10B981]/60'
                        : 'bg-[#111A26] border-[#22344A]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs sm:text-sm text-[#F1F5F9]">
                          {isFa ? bFa?.name ?? bDef.name : bDef.name}
                        </span>
                        {isBuilt ? (
                          <span className="px-2 py-0.5 rounded-md bg-[#10B981]/20 text-[#34D399] text-[10px] font-bold inline-flex items-center gap-1 shrink-0">
                            <Check className="w-3 h-3" />
                            <span>{isFa ? 'ساخته‌شده' : 'Built'}</span>
                          </span>
                        ) : (
                          <span className="text-xs font-mono font-bold text-[#F59E0B] shrink-0">
                            {bDef.costSilver} {isFa ? 'نقره' : 'Silver'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                        {isFa ? bFa?.description ?? bDef.description : bDef.description}
                      </p>
                    </div>

                    {!isBuilt && onBuildHoldingStructure && (
                      <button
                        type="button"
                        disabled={!canConstruct}
                        onClick={() => onBuildHoldingStructure(inspected.id, bKey)}
                        className="w-full min-h-[36px] py-1.5 rounded-xl bg-[#1A314A] hover:bg-[#234264] disabled:bg-[#192330] disabled:text-[#64748B] text-xs font-bold text-[#38BDF8] cursor-pointer transition-colors"
                      >
                        {!cityHolding
                          ? isFa
                            ? 'نیازمند تأسیس مزرعه در شهر'
                            : 'Requires Holding in City'
                          : wrongFaith
                            ? isFa
                              ? 'نیازمند آیین منطبق'
                              : 'Requires Matching Faith'
                            : builtThisYear
                              ? isFa
                                ? 'سهمیه ساخت امسال پر شده'
                                : 'Already Built This Year'
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

        {/* =============================================================== */}
        {/* TAB 3: CONTEXTUAL MILITARY & DIPLOMATIC OPERATIONS              */}
        {/* =============================================================== */}
        {(activeSheetTab === 'actions' ||
          activeSheetTab === 'raid' ||
          activeSheetTab === 'siege' ||
          activeSheetTab === 'diplomacy') && (
          <div className="space-y-3">
            {/* Action 1: Trade */}
            {onTradeHere && (
              <button
                type="button"
                disabled={Boolean(used.trade) || state.character.age < 15}
                onClick={() => {
                  onTradeHere();
                  setIsSheetOpen(false);
                }}
                className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-[#1B2A3D] hover:bg-[#233750] border border-[#F59E0B]/50 disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#FBBF24] text-xs font-bold inline-flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[#F59E0B]" />
                  <span>{isFa ? '۱. تجارت در بازار بندر' : '1. Trade in Port Market'}</span>
                </span>
                <span className="text-[11px] text-[#94A3B8]">
                  {isFa ? '+نقره و مهارت تجارت' : '+Silver & Trade Skill'}
                </span>
              </button>
            )}

            {/* Action 2: Raid Port / Monastery */}
            {onRaidPort && (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={
                    state.character.age < 15 ||
                    state.realm.longships <= 0 ||
                    state.realm.hirdWarriors <= 0 ||
                    Boolean(used.raid)
                  }
                  onClick={() => setActiveSheetTab(activeSheetTab === 'raid' ? 'actions' : 'raid')}
                  className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-[#241016] hover:bg-[#34141E] border border-[#EF4444] disabled:border-[#233246] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#FFE4E6] text-xs font-bold inline-flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span className="inline-flex items-center gap-2">
                    <Swords className="w-4 h-4 text-[#EF4444]" />
                    <span>
                      {inspected.settlementType === 'monastery'
                        ? isFa
                          ? '۲. غارت صومعه و خزانه‌های زرین'
                          : '2. Raid Holy Monastery (Rich Loot)'
                        : isFa
                          ? '۲. یورش و غارت بندر'
                          : '2. Raid Settlement'}
                    </span>
                  </span>
                  <span className="text-[11px] text-[#FCA5A5]">
                    {used.raid
                      ? isFa
                        ? 'انجام شد ✓'
                        : 'Used ✓'
                      : isFa
                        ? 'انتخاب تاکتیک ▾'
                        : 'Select Tactic ▾'}
                  </span>
                </button>

                {activeSheetTab === 'raid' && !used.raid && (
                  <div className="p-3 rounded-xl bg-[#180C11] border border-[#EF4444]/60 space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {raidTacticOptions.map((tac) => (
                        <button
                          key={tac.value}
                          type="button"
                          onClick={() => setMapTactic(tac.value)}
                          className={`p-2 rounded-lg border text-start cursor-pointer transition-colors ${
                            mapTactic === tac.value
                              ? 'bg-[#31121A] border-[#EF4444] text-[#F1F5F9]'
                              : 'bg-[#0E1520] border-[#22354A] text-[#94A3B8]'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span>{tac.label}</span>
                            <span className="text-[10px] text-[#FCA5A5]">{tac.tag}</span>
                          </div>
                          <div className="text-[11px] text-[#94A3B8] mt-0.5">{tac.desc}</div>
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onRaidPort(inspected.id, mapTactic);
                        setIsSheetOpen(false);
                      }}
                      className="w-full min-h-[44px] bg-[#DC2626] hover:bg-[#EF4444] text-white font-extrabold text-xs rounded-xl cursor-pointer transition-colors"
                    >
                      {isFa
                        ? `حمله به ${inspectedDisplayName}!`
                        : `Launch Raid on ${inspectedDisplayName}!`}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Action 3: Besiege (Assault / Blockade / Danegeld Tribute) */}
            {onBesiege && (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={
                    Boolean(used.raid) ||
                    (state.realm.longships < 1 && state.realm.hirdWarriors < 6)
                  }
                  onClick={() => setActiveSheetTab(activeSheetTab === 'siege' ? 'actions' : 'siege')}
                  className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-[#1E1424] hover:bg-[#2B1B34] border border-[#A855F7]/60 disabled:border-[#233246] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#F3E8FF] text-xs font-bold inline-flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span className="inline-flex items-center gap-2">
                    <Castle className="w-4 h-4 text-[#C084FC]" />
                    <span>
                      {isFa
                        ? '۳. محاصره یا باج‌خواهی (دژ و شهر)'
                        : '3. Besiege / Demand Danegeld'}
                    </span>
                  </span>
                  <span className="text-[11px] text-[#D8B4FE]">
                    {used.raid ? (isFa ? 'انجام شد ✓' : 'Used ✓') : isFa ? 'روش محاصره ▾' : 'Approach ▾'}
                  </span>
                </button>

                {activeSheetTab === 'siege' && !used.raid && (
                  <div className="p-3 rounded-xl bg-[#140D1A] border border-[#A855F7]/50 space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSiegeApproach('assault')}
                        className={`p-2 rounded-lg border text-start cursor-pointer transition-colors ${
                          siegeApproach === 'assault'
                            ? 'bg-[#331C44] border-[#C084FC] text-white'
                            : 'bg-[#0E1520] border-[#22354A] text-[#94A3B8]'
                        }`}
                      >
                        <div className="text-xs font-bold">{isFa ? 'یورش مستقیم' : 'Storm Walls'}</div>
                        <div className="text-[10px] text-[#94A3B8] mt-0.5">
                          {isFa ? 'نبرد خونین و فتح کامل' : 'High Glory & Conquest'}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSiegeApproach('blockade')}
                        className={`p-2 rounded-lg border text-start cursor-pointer transition-colors ${
                          siegeApproach === 'blockade'
                            ? 'bg-[#331C44] border-[#C084FC] text-white'
                            : 'bg-[#0E1520] border-[#22354A] text-[#94A3B8]'
                        }`}
                      >
                        <div className="text-xs font-bold">{isFa ? 'محاصره دریایی' : 'Naval Blockade'}</div>
                        <div className="text-[10px] text-[#94A3B8] mt-0.5">
                          {isFa ? 'قطع آذوقه و تسلیم شهر' : 'Starve into Tribute'}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSiegeApproach('demand_tribute')}
                        className={`p-2 rounded-lg border text-start cursor-pointer transition-colors ${
                          siegeApproach === 'demand_tribute'
                            ? 'bg-[#331C44] border-[#C084FC] text-white'
                            : 'bg-[#0E1520] border-[#22354A] text-[#94A3B8]'
                        }`}
                      >
                        <div className="text-xs font-bold">{isFa ? 'باج صلح (دانگلد)' : 'Danegeld'}</div>
                        <div className="text-[10px] text-[#94A3B8] mt-0.5">
                          {isFa ? 'اخاذی نقره با ارعاب' : 'Intimidation & Tribute'}
                        </div>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onBesiege(inspected.id, siegeApproach);
                        setIsSheetOpen(false);
                      }}
                      className="w-full min-h-[44px] bg-[#9333EA] hover:bg-[#A855F7] text-white font-extrabold text-xs rounded-xl cursor-pointer transition-colors"
                    >
                      {isFa
                        ? `اجرای عملیات در ${inspectedDisplayName}`
                        : `Execute Operation at ${inspectedDisplayName}`}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Action 4: Conquer Stronghold */}
            {isFortifiedEnemyCity && onConquerCity && (
              <button
                type="button"
                disabled={Boolean(used.settle) || state.realm.longships <= 0 || state.realm.hirdWarriors < 12}
                onClick={() => {
                  onConquerCity(inspected.id);
                  setIsSheetOpen(false);
                }}
                className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-[#2A1215] hover:bg-[#3B181C] border border-[#F87171]/60 disabled:border-[#233246] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#FECACA] text-xs font-bold inline-flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <Crown className="w-4 h-4 text-[#F87171]" />
                  <span>{isFa ? '۴. لشکرکشی برای فتح کامل شهر' : '4. Conquer Fortified City'}</span>
                </span>
                <span className="text-[11px] text-[#FCA5A5]">
                  {isFa ? 'نیازمند ۱ کشتی و ۱۲+ جنگجو' : 'Requires 1 Ship & 12+ Hird'}
                </span>
              </button>
            )}

            {/* Action 5: Diplomacy & Varangian Oath */}
            {onDiplomacy && (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={Boolean(used.trade)}
                  onClick={() =>
                    setActiveSheetTab(activeSheetTab === 'diplomacy' ? 'actions' : 'diplomacy')
                  }
                  className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-[#14232B] hover:bg-[#1C323D] border border-[#06B6D4]/60 disabled:border-[#233246] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#CFFAFE] text-xs font-bold inline-flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span className="inline-flex items-center gap-2">
                    <Handshake className="w-4 h-4 text-[#06B6D4]" />
                    <span>
                      {isFa
                        ? '۵. مذاکره دیپلماتیک / گارد سلطنتی'
                        : '5. Diplomacy / Royal Service'}
                    </span>
                  </span>
                  <span className="text-[11px] text-[#67E8F9]">
                    {used.trade ? (isFa ? 'انجام شد ✓' : 'Used ✓') : isFa ? 'گزینه‌ها ▾' : 'Options ▾'}
                  </span>
                </button>

                {activeSheetTab === 'diplomacy' && !used.trade && (
                  <div className="p-3 rounded-xl bg-[#0B151C] border border-[#06B6D4]/50 space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDiploApproach('trade_pact')}
                        className={`p-2 rounded-lg border text-start cursor-pointer transition-colors ${
                          diploApproach === 'trade_pact'
                            ? 'bg-[#183542] border-[#22D3EE] text-white'
                            : 'bg-[#0E1520] border-[#22354A] text-[#94A3B8]'
                        }`}
                      >
                        <div className="text-xs font-bold">{isFa ? 'پیمان تجاری' : 'Commercial Treaty'}</div>
                        <div className="text-[10px] text-[#94A3B8] mt-0.5">
                          {isFa ? 'حقوق بازرگانی و درآمد نقره' : 'Trade Route & Silver'}
                        </div>
                      </button>

                      {inspected.id === 'constantinople' ||
                      inspected.id === 'kiev' ||
                      inspected.id === 'novgorod' ? (
                        <button
                          type="button"
                          onClick={() => setDiploApproach('varangian_oath')}
                          className={`p-2 rounded-lg border text-start cursor-pointer transition-colors ${
                            diploApproach === 'varangian_oath'
                              ? 'bg-[#2E1842] border-[#E879F9] text-white'
                              : 'bg-[#0E1520] border-[#22354A] text-[#94A3B8]'
                          }`}
                        >
                          <div className="text-xs font-bold text-[#E879F9]">
                            {isFa ? 'سوگند گارد وارنگیان' : 'Varangian Guard Oath'}
                          </div>
                          <div className="text-[10px] text-[#F0ABFC] mt-0.5">
                            {isFa ? '+۴۵ طلای امپراتور، ابریشم و شهرت' : '+45 Imperial Gold & Trait'}
                          </div>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDiploApproach('tribute_demand')}
                          className={`p-2 rounded-lg border text-start cursor-pointer transition-colors ${
                            diploApproach === 'tribute_demand'
                              ? 'bg-[#183542] border-[#22D3EE] text-white'
                              : 'bg-[#0E1520] border-[#22354A] text-[#94A3B8]'
                          }`}
                        >
                          <div className="text-xs font-bold">
                            {isFa ? 'تقاضای خراج صلح' : 'Demand Peace Tribute'}
                          </div>
                          <div className="text-[10px] text-[#94A3B8] mt-0.5">
                            {isFa ? 'توافق برای خراج سالانه' : 'Swear tributary oath'}
                          </div>
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onDiplomacy(inspected.id, diploApproach);
                        setIsSheetOpen(false);
                      }}
                      className="w-full min-h-[44px] bg-[#0891B2] hover:bg-[#06B6D4] text-white font-extrabold text-xs rounded-xl cursor-pointer transition-colors"
                    >
                      {isFa ? 'ارسال سفیر به دربار' : 'Dispatch Envoy to Court'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Action 6: Marry into Local Family */}
            {onMarryLocal && (
              <button
                type="button"
                disabled={
                  state.relationships.some((r) => r.role === 'Spouse' && r.alive) ||
                  state.character.age < 16 ||
                  state.realm.silver < 16
                }
                onClick={() => {
                  onMarryLocal(inspected.id);
                  setIsSheetOpen(false);
                }}
                className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-[#28141F] hover:bg-[#381B2C] border border-[#EC4899]/60 disabled:border-[#233246] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#FCE7F3] text-xs font-bold inline-flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#EC4899]" />
                  <span>
                    {isFa
                      ? `۶. ازدواج با خاندان سرشناس ${inspectedDisplayName}`
                      : `6. Marry into Local Family at ${inspectedDisplayName}`}
                  </span>
                </span>
                <span className="text-[11px] text-[#F472B6]">
                  {state.relationships.some((r) => r.role === 'Spouse' && r.alive)
                    ? isFa
                      ? 'همسر دارید'
                      : 'Already Married'
                    : isFa
                      ? '+جهیزیه نقره و اتحاد'
                      : '+Dowry & Alliance'}
                </span>
              </button>
            )}
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 4: VOYAGE METRICS & HISTORICAL LORE                         */}
        {/* =============================================================== */}
        {activeSheetTab === 'lore' && (
          <div className="space-y-3.5">
            {/* Voyage Distance & Provisions Strip */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-[#131D2B] border border-[#233246]">
                <div className="text-[11px] text-[#94A3B8]">
                  {isFa ? 'فاصله دریایی' : 'Sea Distance'}
                </div>
                <div className="text-sm font-mono font-bold text-[#38BDF8] mt-0.5">
                  {inspected.id === currentLoc.id
                    ? isFa
                      ? 'لنگرگاه شما'
                      : 'At Port'
                    : `${voyage.nauticalMiles} nm`}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#131D2B] border border-[#233246]">
                <div className="text-[11px] text-[#94A3B8]">
                  {isFa ? 'مدت دریانوردی' : 'Sailing Time'}
                </div>
                <div className="text-sm font-mono font-bold text-[#F1F5F9] mt-0.5">
                  {inspected.id === currentLoc.id
                    ? '—'
                    : isFa
                      ? `${voyage.sailingDays} روز`
                      : `${voyage.sailingDays} days`}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#131D2B] border border-[#233246]">
                <div className="text-[11px] text-[#94A3B8]">
                  {isFa ? 'آذوقه سفر' : 'Provisions'}
                </div>
                <div className="text-sm font-mono font-bold text-[#F59E0B] mt-0.5">
                  {inspected.id === currentLoc.id
                    ? '—'
                    : `${voyage.provisionSilverCost ?? 0} ${isFa ? 'نقره' : 'Silver'}`}
                </div>
              </div>
            </div>

            {/* Danger Breakdown */}
            {inspected.id !== currentLoc.id && (
              <div className="p-3 rounded-xl bg-[#101924] border border-[#1E2D40] space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#CBD5E1] font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>{isFa ? 'تفکیک خطرات مسیر دریایی' : 'Voyage Danger Breakdown'}</span>
                  </span>
                  <span className="font-mono text-xs text-[#F87171]">
                    {isFa ? `کل ریسک: ${voyage.dangerPct}%` : `Total: ${voyage.dangerPct}%`}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-[#94A3B8]">
                  <div className="flex items-center gap-1">
                    <CloudRain className="w-3 h-3 text-[#38BDF8]" />
                    <span>
                      {isFa ? 'طوفان:' : 'Storms:'} {voyage.dangerBreakdown?.stormRiskPct ?? 0}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Swords className="w-3 h-3 text-[#EF4444]" />
                    <span>
                      {isFa ? 'دزدان:' : 'Pirates:'} {voyage.dangerBreakdown?.pirateRiskPct ?? 0}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-[#A855F7]" />
                    <span>
                      {isFa ? 'ناوگان دشمن:' : 'Navies:'}{' '}
                      {voyage.dangerBreakdown?.hostileFleetRiskPct ?? 0}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Monastery Rich Loot Callout */}
            {inspected.settlementType === 'monastery' && (
              <div className="p-3 rounded-xl bg-[#3B290C]/60 border border-[#F59E0B]/50 flex items-start gap-2.5 text-xs text-[#FDE68A]">
                <Sparkles className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#FBBF24]">
                    {isFa ? 'هدف غارت ثروتمند (صومعه مقدس)' : 'Rich Holy Raid Target (Monastery)'}
                  </div>
                  <div className="text-[11px] text-[#FDE68A]/80 mt-0.5 leading-relaxed">
                    {isFa
                      ? 'حاوی جام‌های نقره، کتاب‌های مقدس زرین و صندوق‌های نذورات با دفاع نظامی ضعیف!'
                      : 'Holds gold chalices, silver reliquaries, and jeweled codices with minimal armed resistance!'}
                  </div>
                </div>
              </div>
            )}

            {/* Historical Summary Lore */}
            {isDiscovered && (
              <p className="text-xs text-[#CBD5E1] whitespace-normal break-words leading-relaxed bg-[#0E1622] p-3.5 rounded-xl border border-[#1C2939]">
                {isFa ? inspectedFa?.summary ?? inspected.historicalSummary : inspected.historicalSummary}
              </p>
            )}
          </div>
        )}
      </NorseBottomSheet>
    </motion.div>
  );
}
