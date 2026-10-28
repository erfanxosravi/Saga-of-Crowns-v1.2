import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Anchor,
  Castle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Church,
  CloudRain,
  Coins,
  Compass,
  Crown,
  Eye,
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
  getHistoricalBordersForYear,
  getSeasonalWeatherProfile,
  LANDMASS_POLYGONS,
  MAP_BOUNDS,
  NAVIGABLE_RIVERS,
  pointsToSvgPath,
  pointsToSvgPolygon,
  projectLatLon,
  SEA_ROUTES,
  SETTLEMENTS,
  SETTLEMENTS_BY_ID,
} from '../data/geography';
import {
  DiplomacyApproach,
  hasBoathouse,
  RaidTactic,
  SiegeApproach,
} from '../engine/gameEngine';
import { SETTLEMENTS_FA } from '../i18n/gameDataFa';
import {
  REGION_LABELS,
  RELIGION_LABELS,
  SEASON_LABELS,
  SETTLEMENT_STATUS_LABELS,
  SETTLEMENT_TYPE_LABELS,
} from '../i18n/ui';
import {
  FullGameState,
  Season,
  Settlement,
  SettlementStatus,
  SettlementType,
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
}

type TheaterId = 'all' | 'scandinavia' | 'britain' | 'atlantic' | 'continental' | 'east';
type MapLensId = 'all' | 'owned' | 'loot' | 'trade';

const THEATER_PRESETS: {
  id: TheaterId;
  labelFa: string;
  labelEn: string;
  lat: number;
  lon: number;
  zoom: number;
}[] = [
  { id: 'scandinavia', labelFa: 'اسکاندیناوی', labelEn: 'Scandinavia', lat: 59.5, lon: 11.5, zoom: 2.1 },
  { id: 'britain', labelFa: 'بریتانیا و ایرلند', labelEn: 'British Isles', lat: 54.2, lon: -3.5, zoom: 2.35 },
  { id: 'atlantic', labelFa: 'اطلس شمالی', labelEn: 'North Atlantic', lat: 62.0, lon: -24.0, zoom: 1.55 },
  { id: 'continental', labelFa: 'اروپا و مدیترانه', labelEn: 'Europe & Med', lat: 43.5, lon: 4.0, zoom: 1.75 },
  { id: 'east', labelFa: 'روسیه و شرق', labelEn: 'Rus & East', lat: 49.0, lon: 33.0, zoom: 1.65 },
  { id: 'all', labelFa: 'نمای کل جهان', labelEn: 'World View', lat: 51.0, lon: 2.0, zoom: 0.95 },
];

const ZONE_LABELS_FA: Record<string, string> = {
  danelaw: 'قلمرو دانلو',
  normandy: 'نورماندی',
  north_sea_empire: 'امپراتوری دریای شمال',
  iceland_commonwealth: 'شورای آزاد ایسلند',
};

const LABEL_ANCHOR_HINTS: Record<
  string,
  { anchor?: 'start' | 'end' | 'middle'; dx?: number; dy?: number }
> = {
  ribe: { anchor: 'end', dx: -9, dy: 2 },
  jelling: { anchor: 'end', dx: -9, dy: -4 },
  hedeby: { anchor: 'start', dx: 9, dy: 10 },
  roskilde: { anchor: 'start', dx: 9, dy: 3 },
  uppsala: { anchor: 'start', dx: 9, dy: -6 },
  birka: { anchor: 'start', dx: 9, dy: 9 },
  kaupang: { anchor: 'end', dx: -9, dy: 3 },
  dublin: { anchor: 'end', dx: -9, dy: -3 },
  wexford: { anchor: 'end', dx: -9, dy: 9 },
  limerick: { anchor: 'end', dx: -9, dy: 3 },
  constantinople: { anchor: 'start', dx: 10, dy: -2 },
  baghdad: { anchor: 'start', dx: 10, dy: 2 },
  kiev: { anchor: 'start', dx: 9, dy: 2 },
  cordoba: { anchor: 'end', dx: -9, dy: 2 },
  seville: { anchor: 'end', dx: -9, dy: 4 },
  rome: { anchor: 'start', dx: 9, dy: 2 },
};

/**
 * Minimal, high-legibility vector node for each settlement on the sea chart.
 */
function SettlementGlyph({
  type,
  factionColor,
  status,
  isCurrent,
  isSelected,
  playerOwns,
  isKnown,
  zoom,
}: {
  type: SettlementType;
  factionColor: string;
  status: SettlementStatus;
  isCurrent: boolean;
  isSelected: boolean;
  playerOwns: boolean;
  isKnown: boolean;
  zoom: number;
}) {
  const scale = 1 / Math.sqrt(zoom);
  const color = isCurrent
    ? '#F59E0B'
    : playerOwns
      ? '#10B981'
      : isSelected
        ? '#38BDF8'
        : isKnown
          ? factionColor
          : '#475569';

  return (
    <g transform={`scale(${scale})`}>
      {/* Outer Halo on Current Fleet Location */}
      {isCurrent && (
        <>
          <circle
            cx="0"
            cy="0"
            r="16"
            fill="rgba(245, 158, 11, 0.14)"
          />
          <circle
            cx="0"
            cy="0"
            r="12.5"
            fill="rgba(245, 158, 11, 0.22)"
            stroke="#F59E0B"
            strokeWidth="1.5"
          />
        </>
      )}

      {/* Selected Port Halo */}
      {isSelected && !isCurrent && (
        <circle
          cx="0"
          cy="0"
          r="13"
          fill="rgba(56, 189, 248, 0.2)"
          stroke="#38BDF8"
          strokeWidth="1.6"
        />
      )}

      {/* Main Node Circle */}
      <circle
        cx="0"
        cy="0"
        r={isCurrent || isSelected ? '8.5' : '7.5'}
        fill="#070D15"
        fillOpacity="0.95"
        stroke={color}
        strokeWidth={isCurrent || isSelected ? '2.2' : playerOwns ? '2' : '1.5'}
      />

      {/* Monastery (Cross & Spire) */}
      {type === 'monastery' && (
        <g stroke={color} strokeWidth="1.25" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M -2.8 3.2 L -2.8 0.5 L 0 -3.2 L 2.8 0.5 L 2.8 3.2 Z" fill={color} fillOpacity="0.38" />
          <line x1="0" y1="-3.2" x2="0" y2="-6.4" />
          <line x1="-1.6" y1="-4.8" x2="1.6" y2="-4.8" />
        </g>
      )}

      {/* Capital (Crown) */}
      {type === 'capital' && (
        <g stroke={color} strokeWidth="1.15" fill={color} fillOpacity="0.45" strokeLinejoin="round">
          <path d="M -4 3 L -4 -1.2 L -1.8 0.5 L 0 -3 L 1.8 0.5 L 4 -1.2 L 4 3 Z" />
        </g>
      )}

      {/* City / Fortress (Battlements) */}
      {(type === 'city' || type === 'fortress') && (
        <g stroke={color} strokeWidth="1.15" fill={color} fillOpacity="0.38" strokeLinejoin="round">
          <path d="M -3.8 3 L -3.8 -2.2 L -2 -2.2 L -2 -0.6 L 0 -2.2 L 2 -0.6 L 2 -2.2 L 3.8 -2.2 L 3.8 3 Z" />
        </g>
      )}

      {/* Trading Post (Merchant Hull & Mast) */}
      {type === 'trading_post' && (
        <g stroke={color} strokeWidth="1.15" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M -4 0.8 C -3 3.2 3 3.2 4 0.8 L 3 -0.8 L -3 -0.8 Z" fill={color} fillOpacity="0.38" />
          <line x1="0" y1="-0.8" x2="0" y2="-4" />
        </g>
      )}

      {/* Jarldom Seat / Town / Village */}
      {(type === 'jarldom_seat' || type === 'town' || type === 'village') && (
        <g stroke={color} strokeWidth="1.15" fill={color} fillOpacity="0.38" strokeLinejoin="round">
          <path d="M -3.6 3 L -3.6 0 L 0 -3 L 3.6 0 L 3.6 3 Z" />
        </g>
      )}

      {/* Subtle top-right ownership/status badge */}
      {playerOwns && !isCurrent && (
        <circle cx="5.2" cy="-5.2" r="2.6" fill="#10B981" stroke="#050A11" strokeWidth="0.9" />
      )}
      {!playerOwns && status === 'tributary' && (
        <circle cx="5.2" cy="-5.2" r="2.6" fill="#FBBF24" stroke="#050A11" strokeWidth="0.9" />
      )}
      {!playerOwns && status === 'conquered' && (
        <circle cx="5.2" cy="-5.2" r="2.6" fill="#EF4444" stroke="#050A11" strokeWidth="0.9" />
      )}
    </g>
  );
}

export function VikingMap({
  state,
  onSailTo,
  onRaidPort,
  onTradeHere,
  onBesiege,
  onSettle,
  onDiplomacy,
  onMarryLocal,
}: VikingMapProps) {
  const lang = state.settings.language;
  const isFa = lang === 'fa';

  const currentLoc = SETTLEMENTS_BY_ID[state.character.locationId] ?? SETTLEMENTS[0];

  const [selectedId, setSelectedId] = useState<string>(state.character.locationId);
  const [activeTheater, setActiveTheater] = useState<TheaterId>('scandinavia');
  const [activeLens, setActiveLens] = useState<MapLensId>('all');
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [activeSheetTab, setActiveSheetTab] = useState<
    'overview' | 'actions' | 'raid' | 'siege' | 'diplomacy'
  >('overview');
  const [showUnexplored, setShowUnexplored] = useState<boolean>(false);
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(false);
  const [legendSection, setLegendSection] = useState<'all' | 'settlements' | 'weather'>('all');
  const [mapTactic, setMapTactic] = useState<RaidTactic>('shield_wall');
  const [siegeApproach, setSiegeApproach] = useState<SiegeApproach>('assault');
  const [diploApproach, setDiploApproach] = useState<DiplomacyApproach>('trade_pact');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canvasAspect, setCanvasAspect] = useState<number>(0.65);

  const initialProj = projectLatLon(currentLoc.lat, currentLoc.lon);
  const [zoom, setZoom] = useState<number>(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 1.65 : 1.45
  );
  const [center, setCenter] = useState<{ x: number; y: number }>(() => ({
    x: Math.max(260, Math.min(1050, initialProj.x)),
    y: Math.max(120, Math.min(480, initialProj.y)),
  }));

  // Keep selected port synced if character sails to a new location
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
    const viewW = MAP_BOUNDS.width / z;
    const minX = Math.min(MAP_BOUNDS.width / 2, viewW * 0.3);
    const maxX = Math.max(MAP_BOUNDS.width / 2, MAP_BOUNDS.width - viewW * 0.3);
    const minY = 50;
    const maxY = MAP_BOUNDS.height - 50;
    return {
      x: Math.max(minX, Math.min(maxX, cx)),
      y: Math.max(minY, Math.min(maxY, cy)),
    };
  };

  const applyZoom = (nextZ: number, pivotX?: number, pivotY?: number) => {
    const clampedZ = Math.max(0.8, Math.min(4.5, Number(nextZ.toFixed(2))));
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
    const nextZ = targetZoom ?? Math.max(zoom, 1.65);
    setZoom(nextZ);
    setCenter(clampCenter(p.x, p.y, nextZ));
    setSelectedId(s.id);
  };

  const handleResetToFleet = () => {
    const p = projectLatLon(currentLoc.lat, currentLoc.lon);
    const nextZ = 1.75;
    setZoom(nextZ);
    setCenter(clampCenter(p.x, p.y, nextZ));
    setSelectedId(currentLoc.id);
  };

  const handleSelectTheater = (theaterId: TheaterId) => {
    setActiveTheater(theaterId);
    const preset = THEATER_PRESETS.find((t) => t.id === theaterId);
    if (!preset) return;
    const p = projectLatLon(preset.lat, preset.lon);
    setZoom(preset.zoom);
    setCenter(clampCenter(p.x, p.y, preset.zoom));
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
    if (!rect || rect.width === 0) return;

    const dxPx = e.clientX - dragRef.current.startX;
    const dyPx = e.clientY - dragRef.current.startY;
    if (Math.abs(dxPx) > 4 || Math.abs(dyPx) > 4) {
      dragRef.current.moved = true;
      if (isLegendOpen && typeof window !== 'undefined' && window.innerWidth < 640) {
        setIsLegendOpen(false);
      }
    }

    const svgUnitsPerPx = MAP_BOUNDS.width / zoom / rect.width;
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

  const viewWidth = MAP_BOUNDS.width / zoom;
  const viewHeight = (MAP_BOUNDS.width * canvasAspect) / zoom;
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
  const borders = getHistoricalBordersForYear(state.year);

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
  const isHeldByPlayer = state.realm.holdings.some(
    (h) => h.settlementId === inspected.id && h.farms > 0
  );
  const isFortifiedEnemyCity = inspected.baseDefense >= 7 && !isHeldByPlayer;

  const currentStatus: SettlementStatus =
    state.settlementStatuses?.[inspected.id] ?? inspected.defaultStatus ?? 'independent';

  const used = state.yearlyActivitiesUsed ?? {};
  const canRaidSelected =
    inspected.id !== currentLoc.id &&
    state.character.age >= 15 &&
    state.realm.longships > 0 &&
    state.realm.hirdWarriors > 0 &&
    !used.raid;

  // Demographics calculation
  const norsePop = inspected.norsePopulation ?? 150;
  const nativePop = inspected.nativePopulation ?? 850;
  const totalPop = norsePop + nativePop;
  const norsePct = Math.round((norsePop / totalPop) * 100);

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

  return (
    <div className="relative w-full h-full max-h-dvh flex flex-col bg-[#060B12] overflow-hidden select-none">
      {/* ================================================================= */}
      {/* TOP MINIMAL HUD: REGION CAMERA PRESETS, LENS FILTERS & ZOOM DOCK  */}
      {/* ================================================================= */}
      <div className="absolute top-2.5 inset-x-2.5 sm:inset-x-3.5 z-30 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center justify-between gap-2">
          {/* Region Quick-Jump Bar */}
          <div className="pointer-events-auto flex items-center gap-1 p-1 rounded-xl bg-[#0A1320]/90 backdrop-blur-md border border-[#1E2E42] shadow-lg overflow-x-auto no-scrollbar max-w-full">
            {THEATER_PRESETS.map((th) => {
              const active = activeTheater === th.id;
              return (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => handleSelectTheater(th.id)}
                  className={`min-h-[32px] px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#F59E0B] text-[#0B1118] font-bold'
                      : 'text-[#CBD5E1] hover:text-white hover:bg-[#162334]'
                  }`}
                >
                  {isFa ? th.labelFa : th.labelEn}
                </button>
              );
            })}
          </div>

          {/* Minimal Map Controls (Fleet Focus, Zoom, Fog) */}
          <div className="pointer-events-auto flex items-center gap-1 p-1 rounded-xl bg-[#0A1320]/90 backdrop-blur-md border border-[#1E2E42] shadow-lg shrink-0">
            <button
              type="button"
              onClick={handleResetToFleet}
              title={isFa ? 'تمرکز روی ناوگان شما' : 'Center on Your Fleet'}
              aria-label={isFa ? 'موقعیت ناوگان' : 'Your Fleet'}
              className="h-8 px-2 rounded-lg flex items-center gap-1 text-[#F59E0B] hover:bg-[#162334] text-[11px] font-semibold transition-colors cursor-pointer"
            >
              <LocateFixed className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">{isFa ? 'ناوگان' : 'Fleet'}</span>
            </button>
            <div className="w-px h-4 bg-[#1E2E42]" />
            <button
              type="button"
              onClick={() => applyZoom(zoom + 0.35)}
              aria-label={isFa ? 'بزرگ‌نمایی' : 'Zoom In'}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#F1F5F9] hover:bg-[#162334] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyZoom(zoom - 0.35)}
              aria-label={isFa ? 'کوچک‌نمایی' : 'Zoom Out'}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#F1F5F9] hover:bg-[#162334] transition-colors cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-[#1E2E42]" />
            <button
              type="button"
              onClick={() => setShowUnexplored((v) => !v)}
              aria-pressed={showUnexplored}
              title={isFa ? 'نمایش یا پنهان‌سازی بنادر ناشناخته' : 'Toggle Unexplored Ports'}
              className={`h-8 px-2 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                showUnexplored
                  ? 'bg-[#38BDF8]/20 text-[#38BDF8]'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#162334]'
              }`}
            >
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">
                {showUnexplored ? (isFa ? 'همه' : 'All') : (isFa ? 'مه دریا' : 'Fog')}
              </span>
            </button>
          </div>
        </div>

        {/* Second Row: Map Filter Lens + Floating Minimal Weather & Legend Trigger */}
        <div className="flex items-center justify-between gap-2">
          <div className="pointer-events-auto inline-flex items-center gap-1 p-1 rounded-xl bg-[#0A1320]/85 backdrop-blur-md border border-[#1E2E42] overflow-x-auto no-scrollbar max-w-full">
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
                  className={`min-h-[28px] px-2.5 py-0.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#1D2F44] text-[#38BDF8] font-semibold'
                      : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                  }`}
                >
                  {isFa ? lens.fa : lens.en}
                </button>
              );
            })}
          </div>

          {/* Floating Minimal Weather & Map Legend Toggle */}
          <button
            type="button"
            onClick={() => setIsLegendOpen((prev) => !prev)}
            aria-expanded={isLegendOpen}
            className={`pointer-events-auto min-h-[34px] px-2.5 py-1 rounded-xl backdrop-blur-md border shadow-lg inline-flex items-center gap-1.5 text-[11px] font-semibold shrink-0 transition-colors cursor-pointer ${
              isLegendOpen
                ? 'bg-[#15253A]/95 border-[#38BDF8]/60 text-[#F1F5F9]'
                : 'bg-[#0A1320]/88 border-[#1E2E42] text-[#CBD5E1] hover:text-white hover:bg-[#132033]'
            }`}
          >
            {renderSeasonIcon(state.season, 'w-3.5 h-3.5 shrink-0')}
            <span className="font-bold text-[#F1F5F9]">
              {SEASON_LABELS[lang][state.season]}
            </span>
            <span className="hidden lg:inline text-[10px] font-mono tabular-nums text-[#94A3B8]">
              · {currentWeather.seaEffectShort}
            </span>
            <span className="w-px h-3.5 bg-[#23354C] mx-0.5" />
            <Info className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
            <span className="hidden sm:inline">
              {isFa ? 'راهنمای نقشه' : 'Legend'}
            </span>
            {isLegendOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
            )}
          </button>
        </div>

        {/* ================================================================= */}
        {/* FLOATING MINIMAL LEGEND & WEATHER IMPACTS PANEL (DYNAMIC HEIGHT)  */}
        {/* ================================================================= */}
        {isLegendOpen && (
          <div className="pointer-events-auto self-end w-[min(23.5rem,calc(100vw-1.25rem))] max-h-[calc(100dvh-16.5rem)] flex flex-col overflow-hidden rounded-2xl bg-[#0A1320]/95 backdrop-blur-md border border-[#22344A] shadow-[0_18px_42px_rgba(0,0,0,0.88)]">
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

              <button
                type="button"
                onClick={() => setIsLegendOpen(false)}
                aria-label={isFa ? 'بستن راهنما' : 'Close Legend'}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#162436] transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scrollable Body Adapting to Available Screen Space */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 text-xs">
              {/* SECTION 1: SETTLEMENT TYPES & MAP MARKERS */}
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
                    {/* Monastery */}
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

                    {/* Royal Capital */}
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

                    {/* Fortress / Walled City */}
                    <button
                      type="button"
                      onClick={() => setActiveLens('all')}
                      className="w-full p-2 rounded-xl bg-[#0E1826]/90 border border-[#1C2C40] hover:border-[#2C4462] text-start flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/40 flex items-center justify-center shrink-0">
                        <Castle className="w-3.5 h-3.5 text-[#F87171]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-[#F1F5F9] text-[11px]">
                            {isFa ? 'دژ و شهر مستحکم (Fortress / City)' : 'Fortress & Walled City'}
                          </span>
                          <span className="text-[10px] font-mono text-[#F87171]">
                            {isFa ? 'دفاع ۷+ · محاصره' : 'Def 7+ · Siege'}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#94A3B8] truncate">
                          {isFa
                            ? 'دارای باروهای سنگی و پادگان؛ نیازمند محاصره دریایی یا سپاه بزرگ'
                            : 'Heavily fortified walls; requires siege tactics or a large war fleet'}
                        </p>
                      </div>
                    </button>

                    {/* Trading Post */}
                    <button
                      type="button"
                      onClick={() => setActiveLens(activeLens === 'trade' ? 'all' : 'trade')}
                      className={`w-full p-2 rounded-xl border text-start flex items-center gap-2.5 transition-colors cursor-pointer ${
                        activeLens === 'trade'
                          ? 'bg-[#0D2235] border-[#38BDF8]/60'
                          : 'bg-[#0E1826]/90 border-[#1C2C40] hover:border-[#2C4462]'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#38BDF8]/15 border border-[#38BDF8]/40 flex items-center justify-center shrink-0">
                        <Anchor className="w-3.5 h-3.5 text-[#38BDF8]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-[#F1F5F9] text-[11px]">
                            {isFa ? 'بندر و مرکز تجاری (Trading Post)' : 'Trading Post'}
                          </span>
                          <span className="text-[10px] font-mono text-[#38BDF8]">
                            {isFa ? '+نقره و مهارت تجارت' : '+Silver & Trade'}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#94A3B8] truncate">
                          {isFa
                            ? 'قطب بازرگانی دریایی برای فروش غنایم، خز و کهربا با سود بالا'
                            : 'Major maritime emporium for lucrative merchant voyages'}
                        </p>
                      </div>
                    </button>

                    {/* Jarldom / Town */}
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
                            {isFa ? 'اسکان و پیوند خاندان' : 'Settle & Marry'}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#94A3B8] truncate">
                          {isFa
                            ? 'مناسب خرید مزرعه (اسکان نورس)، جذب جنگجو و ازدواج سیاسی'
                            : 'Ideal for establishing Norse farms, recruiting warriors & marriage'}
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Ring & Status Badges Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 px-1 text-[10px] text-[#CBD5E1]">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] ring-2 ring-[#F59E0B]/35" />
                      <span>{isFa ? 'ناوگان شما' : 'Your Fleet'}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                      <span>{isFa ? 'ملک خاندان' : 'Your Estate'}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" />
                      <span>{isFa ? 'خراجگزار' : 'Tributary'}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                      <span>{isFa ? 'بندر انتخاب‌شده' : 'Selected'}</span>
                    </span>
                  </div>
                </div>
              )}

              {/* SECTION 2: SEASONAL WEATHER & SEA IMPACTS */}
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

                  {/* Active Season Highlight Box */}
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
                    {(hasKnarr || hasBoathouse(state)) && (
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] text-[#34D399] font-medium">
                        {hasKnarr && (
                          <span>
                            ✓{' '}
                            {isFa
                              ? 'کشتی کِنار: کاهش خطر طوفان اقیانوسی و پاییز/زمستان'
                              : 'Knarr Hull: Reduces Atlantic & winter gale risk'}
                          </span>
                        )}
                        {hasBoathouse(state) && (
                          <span>
                            ✓{' '}
                            {isFa
                              ? 'اسکله کشتی‌سازی: +۳ مهارت دریانوردی'
                              : 'Boathouse: +3 Seamanship'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 4-Season Comparison Matrix */}
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
                            {isCurrentSeason && (
                              <span className="text-[9px] text-[#38BDF8]">
                                {isFa ? 'فصل فعلی' : 'Active'}
                              </span>
                            )}
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
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* INTERACTIVE FULL-HEIGHT VECTOR MAP SVG STAGE                      */}
      {/* ================================================================= */}
      <div
        ref={containerRef}
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
            <radialGradient id="nordicOceanGrad" cx="50%" cy="45%" r="65%">
              <stop offset="0%" stopColor="#0D1D31" />
              <stop offset="60%" stopColor="#081320" />
              <stop offset="100%" stopColor="#050B13" />
            </radialGradient>
            <pattern id="seaGrid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#112238" strokeWidth="0.45" />
            </pattern>
          </defs>

          {/* Deep Nordic Ocean Canvas */}
          <rect
            x={-600}
            y={-600}
            width={MAP_BOUNDS.width + 1200}
            height={MAP_BOUNDS.height + 1200}
            fill="url(#nordicOceanGrad)"
          />
          <rect
            x={-600}
            y={-600}
            width={MAP_BOUNDS.width + 1200}
            height={MAP_BOUNDS.height + 1200}
            fill="url(#seaGrid)"
            opacity="0.55"
          />

          {/* Subtle Cartographic Graticules */}
          {[-45, -30, -15, 0, 15, 30, 45].map((lon) => {
            const { x } = projectLatLon(0, lon);
            return (
              <line
                key={`lon_${lon}`}
                x1={x}
                y1={-500}
                x2={x}
                y2={MAP_BOUNDS.height + 500}
                stroke="#0F2036"
                strokeWidth={0.8 / zoom}
              />
            );
          })}
          {[36, 44, 52, 60, 66].map((lat) => {
            const { y } = projectLatLon(lat, 0);
            return (
              <line
                key={`lat_${lat}`}
                x1={-600}
                y1={y}
                x2={MAP_BOUNDS.width + 600}
                y2={y}
                stroke="#0F2036"
                strokeWidth={0.8 / zoom}
              />
            );
          })}

          {/* Subtle Nautical Compass Rose in Open Atlantic */}
          <g
            transform={`translate(${projectLatLon(49, -28).x}, ${projectLatLon(49, -28).y})`}
            opacity="0.16"
          >
            <circle cx="0" cy="0" r="38" fill="none" stroke="#38BDF8" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="28" fill="none" stroke="#38BDF8" strokeWidth="0.5" strokeDasharray="2 2" />
            <path d="M 0 -44 L 4 -6 L 44 0 L 4 6 L 0 44 L -4 6 L -44 0 L -4 -6 Z" fill="#38BDF8" />
          </g>

          {/* Landmass Polygons with Coastal Rim */}
          {LANDMASS_POLYGONS.map((poly) => (
            <g key={poly.id}>
              <polygon
                points={pointsToSvgPolygon(poly.coords)}
                fill="#132233"
                stroke="#2D4A6A"
                strokeWidth={1.35 / Math.sqrt(zoom)}
                strokeLinejoin="round"
              />
            </g>
          ))}

          {/* Island Outcrops */}
          {['kirkwall', 'shetland', 'faroes', 'isle_of_man', 'iona', 'visby'].map((islId) => {
            const s = SETTLEMENTS_BY_ID[islId];
            if (!s) return null;
            const { x, y } = projectLatLon(s.lat, s.lon);
            return (
              <ellipse
                key={`isl_${islId}`}
                cx={x}
                cy={y}
                rx={6.5}
                ry={4.5}
                fill="#192C42"
                stroke="#385678"
                strokeWidth={1 / Math.sqrt(zoom)}
              />
            );
          })}

          {/* Navigable River Systems */}
          {NAVIGABLE_RIVERS.map((riv) => (
            <path
              key={riv.name}
              d={pointsToSvgPath(riv.coords)}
              fill="none"
              stroke="#1D4ED8"
              strokeOpacity="0.55"
              strokeWidth={2.1 / Math.sqrt(zoom)}
              strokeLinecap="round"
            />
          ))}

          {/* Historical Political Zones */}
          {borders.map((zone) => {
            const zCenter = projectLatLon(zone.coords[0][0], zone.coords[0][1]);
            return (
              <g key={zone.id}>
                <polygon
                  points={pointsToSvgPolygon(zone.coords)}
                  fill={zone.fill}
                  stroke={zone.stroke}
                  strokeWidth={1 / Math.sqrt(zoom)}
                  strokeDasharray="4 3"
                  opacity="0.75"
                />
                <text
                  x={zCenter.x + 6}
                  y={zCenter.y + 13}
                  fill={zone.stroke}
                  stroke="#050A11"
                  strokeWidth={3.2 / Math.sqrt(zoom)}
                  strokeLinejoin="round"
                  paintOrder="stroke fill"
                  className="[paint-order:stroke_fill]"
                  fontSize={11 / Math.sqrt(zoom)}
                  fontWeight="700"
                  opacity="0.82"
                >
                  {isFa ? ZONE_LABELS_FA[zone.id] ?? zone.label : zone.label}
                </text>
              </g>
            );
          })}

          {/* Subtle Sea Routes Network */}
          {SEA_ROUTES.map(([aId, bId]) => {
            const a = SETTLEMENTS_BY_ID[aId];
            const b = SETTLEMENTS_BY_ID[bId];
            if (!a || !b) return null;
            const isConnectedToSelected =
              aId === inspected.id ||
              bId === inspected.id ||
              aId === currentLoc.id ||
              bId === currentLoc.id;
            const bothKnown =
              showUnexplored ||
              (state.discoveredSettlements.includes(aId) &&
                state.discoveredSettlements.includes(bId));
            if (!bothKnown) return null;

            const pa = projectLatLon(a.lat, a.lon);
            const pb = projectLatLon(b.lat, b.lon);
            return (
              <line
                key={`route_${aId}_${bId}`}
                x1={pa.x}
                y1={pa.y}
                x2={pb.x}
                y2={pb.y}
                stroke={isConnectedToSelected ? '#2B4C73' : '#16283F'}
                strokeOpacity={isConnectedToSelected ? '0.85' : '0.45'}
                strokeWidth={(isConnectedToSelected ? 1.3 : 0.9) / Math.sqrt(zoom)}
                strokeDasharray="3 4"
              />
            );
          })}

          {/* Active Curved Sea Course to Selected Port */}
          {inspected.id !== currentLoc.id && (
            <g>
              {/* Soft Outer Glow */}
              <path
                d={curvedCoursePath}
                fill="none"
                stroke={
                  voyage.dangerPct >= 35
                    ? '#EF4444'
                    : voyage.dangerPct >= 18
                      ? '#F59E0B'
                      : '#38BDF8'
                }
                strokeOpacity="0.22"
                strokeWidth={6 / Math.sqrt(zoom)}
                strokeLinecap="round"
              />
              {/* Crisp Dashed Navigation Arc */}
              <path
                d={curvedCoursePath}
                fill="none"
                stroke={
                  voyage.dangerPct >= 35
                    ? '#EF4444'
                    : voyage.dangerPct >= 18
                      ? '#F59E0B'
                      : '#38BDF8'
                }
                strokeWidth={2.2 / Math.sqrt(zoom)}
                strokeDasharray="5 3.5"
                strokeLinecap="round"
              />
              {/* Midpoint Voyage Tag on Sea Route */}
              {distSvg > 35 && (
                <g transform={`translate(${midX}, ${midY - 4 / Math.sqrt(zoom)})`}>
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    fill="#E2E8F0"
                    stroke="#050A11"
                    strokeWidth={4 / Math.sqrt(zoom)}
                    paintOrder="stroke fill"
                    fontSize={10.5 / Math.sqrt(zoom)}
                    fontWeight="700"
                  >
                    {isFa
                      ? `~${voyage.sailingDays} روز · خطر ${voyage.dangerPct}%`
                      : `~${voyage.sailingDays}d · ${voyage.dangerPct}% risk`}
                  </text>
                </g>
              )}
            </g>
          )}

          {/* World Settlements with Smart Label Decluttering & Lens Highlighting */}
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
            const dx = (hint?.dx ?? 10) / Math.sqrt(zoom);
            const dy = (hint?.dy ?? 4) / Math.sqrt(zoom);

            // Smart decluttering: at low zoom, show labels for current, selected, owned, capitals, monasteries, or when zoomed in
            const isMajorLandmark =
              s.settlementType === 'capital' ||
              s.settlementType === 'monastery' ||
              s.settlementType === 'jarldom_seat';
            const showLabel =
              isCurrent ||
              isSelected ||
              playerOwns ||
              (known && inLens && (zoom >= 1.35 || isMajorLandmark));

            return (
              <g
                key={s.id}
                transform={`translate(${x}, ${y})`}
                opacity={inLens || isCurrent || isSelected ? 1 : 0.25}
                onClick={() => {
                  if (!dragRef.current.moved) {
                    setSelectedId(s.id);
                  }
                }}
                onDoubleClick={() => {
                  setSelectedId(s.id);
                  setActiveSheetTab('overview');
                  setIsSheetOpen(true);
                }}
                className="cursor-pointer transition-opacity"
              >
                {/* Generous Touch Target */}
                <circle cx="0" cy="0" r={22 / Math.sqrt(zoom)} fill="transparent" />

                {/* Vector Node Glyph */}
                <SettlementGlyph
                  type={s.settlementType ?? 'town'}
                  factionColor={s.factionColor ?? '#F59E0B'}
                  status={status}
                  isCurrent={isCurrent}
                  isSelected={isSelected}
                  playerOwns={playerOwns}
                  isKnown={known}
                  zoom={zoom}
                />

                {/* Decluttered High-Contrast Port Label */}
                {showLabel && (
                  <text
                    x={dx}
                    y={dy}
                    textAnchor={anchor}
                    fill={
                      isCurrent
                        ? '#FCD34D'
                        : isSelected
                          ? '#7DD3FC'
                          : playerOwns
                            ? '#6EE7B7'
                            : '#F1F5F9'
                    }
                    stroke="#050A11"
                    strokeWidth={4.2 / Math.sqrt(zoom)}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    paintOrder="stroke fill"
                    className="[paint-order:stroke_fill]"
                    fontSize={(isCurrent || isSelected ? 13.5 : 11.5) / Math.sqrt(zoom)}
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
        {/* FLOATING BOTTOM PORT INSPECTOR DOCK (MINIMAL & DIRECT ACTIONS)    */}
        {/* ================================================================= */}
        <div className="absolute bottom-2.5 inset-x-2.5 sm:inset-x-3.5 z-30 pointer-events-none flex flex-col gap-2">
          <div className="pointer-events-auto rounded-2xl bg-[#0A1320]/94 backdrop-blur-md border border-[#22344A] shadow-[0_16px_40px_rgba(0,0,0,0.85)] p-3 sm:p-3.5 flex flex-col gap-2.5">
            {/* Top Row: Port Identity, Cycle Prev/Next & Key Unboxed Metrics */}
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {/* Port Type Icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
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
                    <Church className="w-5 h-5 text-[#FBBF24]" />
                  ) : inspected.settlementType === 'capital' ? (
                    <Crown className="w-5 h-5 text-[#A855F7]" />
                  ) : isFortifiedEnemyCity ? (
                    <Castle className="w-5 h-5" />
                  ) : (
                    <Anchor className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-[#F1F5F9] truncate">
                      {inspectedDisplayName}
                    </h3>
                    <span className="text-xs text-[#94A3B8] truncate">
                      ({inspectedNorseName})
                    </span>
                    {inspected.id === currentLoc.id && (
                      <span className="text-[11px] font-semibold text-[#FBBF24]">
                        · {isFa ? 'لنگرگاه فعلی شما' : 'Current Port'}
                      </span>
                    )}
                    {isHeldByPlayer && (
                      <span className="text-[11px] font-semibold text-[#34D399]">
                        · {isFa ? 'ملک خاندان' : 'Your Estate'}
                      </span>
                    )}
                  </div>

                  {/* Clean Unboxed Metadata Line */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] sm:text-xs text-[#94A3B8] font-mono tabular-nums mt-0.5">
                    <span className="font-sans text-[#CBD5E1]">
                      {REGION_LABELS[lang][inspected.regionGroup]}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#FBBF24]">
                      {isFa
                        ? `ثروت ${isDiscovered ? inspected.baseWealth : '?'}/10`
                        : `Wealth ${isDiscovered ? inspected.baseWealth : '?'}/10`}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className={inspected.baseDefense >= 7 ? 'text-[#F87171]' : 'text-[#CBD5E1]'}>
                      {isFa
                        ? `دفاع ${isDiscovered ? inspected.baseDefense : '?'}/10`
                        : `Def ${isDiscovered ? inspected.baseDefense : '?'}/10`}
                    </span>
                    {inspected.id !== currentLoc.id && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#38BDF8]">
                          {isFa
                            ? `${voyage.nauticalMiles} مایل (~${voyage.sailingDays} روز)`
                            : `${voyage.nauticalMiles} nm (~${voyage.sailingDays}d)`}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            voyage.dangerPct >= 30 ? 'text-[#F87171] font-semibold' : 'text-[#94A3B8]'
                          }
                        >
                          {isFa ? `خطر ${voyage.dangerPct}%` : `Risk ${voyage.dangerPct}%`}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Prev / Next Port Cycle Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCyclePort(-1)}
                  title={isFa ? 'بندر قبلی' : 'Previous Port'}
                  aria-label={isFa ? 'بندر قبلی' : 'Previous Port'}
                  className="w-8 h-8 rounded-lg bg-[#131F30] hover:bg-[#1C2D44] border border-[#24364D] flex items-center justify-center text-[#CBD5E1] hover:text-white cursor-pointer transition-colors"
                >
                  {isFa ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleCyclePort(1)}
                  title={isFa ? 'بندر بعدی' : 'Next Port'}
                  aria-label={isFa ? 'بندر بعدی' : 'Next Port'}
                  className="w-8 h-8 rounded-lg bg-[#131F30] hover:bg-[#1C2D44] border border-[#24364D] flex items-center justify-center text-[#CBD5E1] hover:text-white cursor-pointer transition-colors"
                >
                  {isFa ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Bottom Row: Direct 1-Click Contextual Actions + Full Details Trigger */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1C2C40]">
              {/* Primary Action 1: Sail Here (when viewing another port) */}
              {inspected.id !== currentLoc.id && onSailTo && (
                <button
                  type="button"
                  disabled={!hasShips || Boolean(used.travel)}
                  onClick={() => onSailTo(inspected.id)}
                  className="flex-1 min-w-[130px] min-h-[40px] px-3 py-1.5 rounded-xl bg-[#0284C7] hover:bg-[#38BDF8] hover:text-[#0B1118] disabled:bg-[#192434] disabled:text-[#64748B] text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Ship className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {used.travel
                      ? isFa
                        ? 'سفر انجام شد ✓'
                        : 'Sailed ✓'
                      : !hasShips
                        ? isFa
                          ? 'نیازمند کشتی'
                          : 'Needs Ship'
                        : isFa
                          ? `سفر به ${inspectedDisplayName}`
                          : `Sail to ${inspectedDisplayName}`}
                  </span>
                </button>
              )}

              {/* Primary Action 2: Trade (when at current port) */}
              {inspected.id === currentLoc.id && onTradeHere && (
                <button
                  type="button"
                  disabled={Boolean(used.trade) || state.character.age < 15}
                  onClick={() => onTradeHere()}
                  className="flex-1 min-w-[130px] min-h-[40px] px-3 py-1.5 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] disabled:bg-[#192434] disabled:text-[#64748B] text-[#0B1118] text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Coins className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {used.trade
                      ? isFa
                        ? 'تجارت انجام شد ✓'
                        : 'Traded ✓'
                      : isFa
                        ? 'معامله در بازار بندر'
                        : 'Trade in Market'}
                  </span>
                </button>
              )}

              {/* Primary Action 3: Raid Target */}
              {inspected.id !== currentLoc.id && onRaidPort && (
                <button
                  type="button"
                  disabled={!canRaidSelected}
                  onClick={() => {
                    setActiveSheetTab('raid');
                    setIsSheetOpen(true);
                  }}
                  className="flex-1 min-w-[120px] min-h-[40px] px-3 py-1.5 rounded-xl bg-[#2A1119] hover:bg-[#DC2626] border border-[#EF4444]/60 disabled:border-[#233246] disabled:bg-[#192434] disabled:text-[#64748B] text-[#FFE4E6] hover:text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Swords className="w-3.5 h-3.5 shrink-0 text-[#F87171]" />
                  <span>
                    {used.raid
                      ? isFa
                        ? 'غارت شد ✓'
                        : 'Raided ✓'
                      : isFa
                        ? 'غارت بندر'
                        : 'Raid Port'}
                  </span>
                </button>
              )}

              {/* Primary Action 4: Settle Homestead */}
              {onSettle && (
                <button
                  type="button"
                  disabled={Boolean(used.settle) || state.realm.silver < 30}
                  onClick={() => onSettle(inspected.id)}
                  className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#112620] hover:bg-[#16382E] border border-[#10B981]/50 disabled:border-[#233246] disabled:bg-[#192434] disabled:text-[#64748B] text-[#6EE7B7] text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Landmark className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {used.settle
                      ? isFa
                        ? 'اسکان یافت ✓'
                        : 'Settled ✓'
                      : isFa
                        ? 'اسکان (۳۰ نقره)'
                        : 'Settle (30s)'}
                  </span>
                </button>
              )}

              {/* Open Full Port Command & Lore Sheet */}
              <button
                type="button"
                onClick={() => {
                  setActiveSheetTab('overview');
                  setIsSheetOpen(true);
                }}
                className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#152234] hover:bg-[#1E3048] border border-[#293E58] text-xs font-bold text-[#E2E8F0] hover:text-white inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors"
              >
                <Compass className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                <span>{isFa ? 'جزئیات و عملیات کامل' : 'Details & All Actions'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* SLIDE-UP SETTLEMENT DETAIL & ADVANCED OPERATIONS BOTTOM SHEET     */}
      {/* ================================================================= */}
      <NorseBottomSheet
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setActiveSheetTab('overview');
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
        {/* Navigation Tabs inside Bottom Sheet */}
        <div className="flex items-center gap-1 border-b border-[#1E2D40] pb-2">
          <button
            type="button"
            onClick={() => setActiveSheetTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeSheetTab === 'overview'
                ? 'bg-[#1E2D40] text-[#F1F5F9]'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            {isFa ? 'مشخصات و تاریخچه' : 'Overview & Lore'}
          </button>
          <button
            type="button"
            onClick={() => setActiveSheetTab('actions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeSheetTab !== 'overview'
                ? 'bg-[#1E2D40] text-[#F1F5F9]'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            {isFa ? 'عملیات نظامی و دیپلماتیک' : 'Military & Diplomacy'}
          </button>
        </div>

        {/* TAB 1: OVERVIEW & DEMOGRAPHICS */}
        {activeSheetTab === 'overview' && (
          <div className="space-y-3.5">
            {/* Status & Ruler Line */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#111A26] border border-[#203043] text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#CBD5E1]">
                  {isFa ? 'حاکم محلی:' : 'Local Ruler:'}
                </span>
                <span className="text-[#38BDF8] font-semibold">{controller.ruler}</span>
              </div>
              <div className="flex items-center gap-2 text-[#CBD5E1]">
                <span>{SETTLEMENT_TYPE_LABELS[lang][inspected.settlementType ?? 'town']}</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-[#FBBF24]">
                  {SETTLEMENT_STATUS_LABELS[lang][currentStatus]}
                </span>
              </div>
            </div>

            {/* Demographics Bar (Norse vs Native Population) */}
            <div className="p-3 rounded-xl bg-[#111A26] border border-[#203043] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 text-[#CBD5E1] font-semibold">
                  <Users className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>{isFa ? 'ترکیب جمعیتی' : 'Demographics'}</span>
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
                    ? `فرهنگ: ${inspected.primaryCultureFa ?? inspected.primaryCulture ?? 'نورس'}`
                    : `Culture: ${inspected.primaryCulture ?? 'Norse'}`}
                </span>
                <span>
                  {isFa
                    ? `آیین: ${RELIGION_LABELS.fa[controller.religion] ?? controller.religion}`
                    : `Faith: ${RELIGION_LABELS.en[controller.religion] ?? controller.religion}`}
                </span>
              </div>
            </div>

            {/* Port Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl bg-[#131D2B] border border-[#233246]">
                <div className="text-[11px] text-[#94A3B8]">
                  {isFa ? 'ثروت بازار' : 'Market Wealth'}
                </div>
                <div className="text-sm font-mono font-bold text-[#FBBF24] mt-0.5">
                  {isDiscovered ? `${inspected.baseWealth} / 10` : '? / 10'}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#131D2B] border border-[#233246]">
                <div className="text-[11px] text-[#94A3B8]">
                  {isFa ? 'استحکامات' : 'Defense'}
                </div>
                <div
                  className={`text-sm font-mono font-bold mt-0.5 ${
                    inspected.baseDefense >= 7 ? 'text-[#F87171]' : 'text-[#CBD5E1]'
                  }`}
                >
                  {isDiscovered ? `${inspected.baseDefense} / 10` : '? / 10'}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#131D2B] border border-[#233246]">
                <div className="text-[11px] text-[#94A3B8]">
                  {isFa ? 'فاصله دریایی' : 'Distance'}
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
                  {isFa ? 'آذوقه سفر' : 'Provisions'}
                </div>
                <div className="text-sm font-mono font-bold text-[#F59E0B] mt-0.5">
                  {inspected.id === currentLoc.id
                    ? '—'
                    : `${voyage.provisionSilverCost ?? 0} Silver`}
                </div>
              </div>
            </div>

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

            {/* Danger Breakdown */}
            {inspected.id !== currentLoc.id && (
              <div className="p-2.5 rounded-xl bg-[#101924] border border-[#1E2D40] space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[#CBD5E1] font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>{isFa ? 'تفکیک خطرات سفر دریایی' : 'Voyage Danger Breakdown'}</span>
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

            {/* Historical Summary Lore */}
            {isDiscovered && (
              <p className="text-xs text-[#CBD5E1] whitespace-normal break-words leading-relaxed bg-[#0E1622] p-3 rounded-xl border border-[#1C2939]">
                {isFa ? inspectedFa?.summary ?? inspected.historicalSummary : inspected.historicalSummary}
              </p>
            )}
          </div>
        )}

        {/* TAB 2: CONTEXTUAL MILITARY & DIPLOMATIC OPERATIONS */}
        {activeSheetTab !== 'overview' && (
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

            {/* Action 4: Settle Norse Colony */}
            {onSettle && (
              <button
                type="button"
                disabled={Boolean(used.settle) || state.realm.silver < 30}
                onClick={() => {
                  onSettle(inspected.id);
                  setIsSheetOpen(false);
                }}
                className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-[#0F241C] hover:bg-[#153428] border border-[#10B981]/60 disabled:border-[#233246] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#D1FAE5] text-xs font-bold inline-flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-[#10B981]" />
                  <span>{isFa ? '۴. آبادانی و اسکان نورس در اینجا' : '4. Settle Norse Colony'}</span>
                </span>
                <span className="text-[11px] text-[#6EE7B7]">
                  {used.settle
                    ? isFa
                      ? 'امسال انجام شد ✓'
                      : 'Settled This Year ✓'
                    : isFa
                      ? 'هزینه ۳۰ نقره · +۱ مزرعه'
                      : 'Cost 30 Silver · +1 Farm'}
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
      </NorseBottomSheet>
    </div>
  );
}
