import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Anchor,
  Building2,
  Castle,
  Church,
  CloudRain,
  Coins,
  Compass,
  Crown,
  Eye,
  Flame,
  Handshake,
  Heart,
  Landmark,
  Minus,
  Plus,
  RotateCcw,
  ScrollText,
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
  RegionGroup,
  Season,
  Settlement,
  SettlementStatus,
  SettlementType,
} from '../types/game';
import { NorseBottomSheet, RuneDivider } from './NorseMotifs';

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
 * High-legibility vector glyph representing settlement classification.
 */
function SettlementGlyph({
  type,
  factionColor,
  status,
  isCurrent,
  playerOwns,
  isKnown,
  zoom,
}: {
  type: SettlementType;
  factionColor: string;
  status: SettlementStatus;
  isCurrent: boolean;
  playerOwns: boolean;
  isKnown: boolean;
  zoom: number;
}) {
  const scale = 1 / Math.sqrt(zoom);
  const color = isCurrent
    ? '#F59E0B'
    : playerOwns
      ? '#10B981'
      : isKnown
        ? factionColor
        : '#64748B';

  return (
    <g transform={`scale(${scale})`}>
      {/* Outer Halo on Current Location */}
      {isCurrent && (
        <circle
          cx="0"
          cy="0"
          r="14"
          fill="rgba(245, 158, 11, 0.22)"
          stroke="#F59E0B"
          strokeWidth="1.6"
        />
      )}

      {/* Main Faction Badge Base */}
      <circle
        cx="0"
        cy="0"
        r="8.5"
        fill="#070D15"
        fillOpacity="0.92"
        stroke={color}
        strokeWidth={isCurrent ? '2.4' : playerOwns ? '2' : '1.7'}
      />

      {/* Monastery (Church Spire + Cross) - Rich Holy Raid Target */}
      {type === 'monastery' && (
        <g stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M -3 3.5 L -3 0.5 L 0 -3.5 L 3 0.5 L 3 3.5 Z" fill={color} fillOpacity="0.4" />
          <line x1="0" y1="-3.5" x2="0" y2="-7" />
          <line x1="-1.8" y1="-5.2" x2="1.8" y2="-5.2" />
        </g>
      )}

      {/* Capital (Imperial Crown / Citadel Peaks) */}
      {type === 'capital' && (
        <g stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.45" strokeLinejoin="round">
          <path d="M -4.5 3.5 L -4.5 -1.5 L -2 0.5 L 0 -3.5 L 2 0.5 L 4.5 -1.5 L 4.5 3.5 Z" />
        </g>
      )}

      {/* City (Walled Gatehouse with Crenellations) */}
      {type === 'city' && (
        <g stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.4" strokeLinejoin="round">
          <path d="M -4.5 3.5 L -4.5 -2.5 L -2.5 -2.5 L -2.5 -0.5 L 0 -2.5 L 2.5 -0.5 L 2.5 -2.5 L 4.5 -2.5 L 4.5 3.5 Z" />
          <line x1="-1" y1="3.5" x2="-1" y2="1" strokeWidth="1" />
          <line x1="1" y1="3.5" x2="1" y2="1" strokeWidth="1" />
        </g>
      )}

      {/* Fortress (Round Crenellated Citadel Tower) */}
      {type === 'fortress' && (
        <g stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.4" strokeLinejoin="round">
          <path d="M -4 3.5 L -4 -2.5 L -2.5 -2.5 L -2.5 -1 L 0 -2.5 L 2.5 -1 L 2.5 -2.5 L 4 -2.5 L 4 3.5 Z" />
        </g>
      )}

      {/* Trading Post (Merchant Knarr Prow & Mast) */}
      {type === 'trading_post' && (
        <g stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M -4.5 1 C -3.5 3.8 3.5 3.8 4.5 1 L 3.5 -1 L -3.5 -1 Z" fill={color} fillOpacity="0.4" />
          <line x1="0" y1="-1" x2="0" y2="-4.5" />
          <line x1="-1.8" y1="-2.8" x2="1.8" y2="-2.8" />
        </g>
      )}

      {/* Jarldom Seat (Chieftain Longhouse with Dragon-Prows) */}
      {type === 'jarldom_seat' && (
        <g stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M -4.5 3.5 L -4.5 0 L 0 -3.5 L 4.5 0 L 4.5 3.5 Z" fill={color} fillOpacity="0.4" />
          <line x1="-1" y1="-3.5" x2="-3" y2="-5.5" />
          <line x1="1" y1="-3.5" x2="3" y2="-5.5" />
        </g>
      )}

      {/* Town (Twin Gabled Timber Halls) */}
      {type === 'town' && (
        <g stroke={color} strokeWidth="1.1" fill={color} fillOpacity="0.4" strokeLinejoin="round">
          <path d="M -4.5 3.5 L -4.5 -0.5 L -2.2 -2.8 L 0 -0.5 L 2.2 -2.8 L 4.5 -0.5 L 4.5 3.5 Z" />
        </g>
      )}

      {/* Village (Single Thatched Homestead) */}
      {type === 'village' && (
        <g stroke={color} strokeWidth="1.1" fill={color} fillOpacity="0.4" strokeLinejoin="round">
          <path d="M -3.5 3.5 L -3.5 0 L 0 -3 L 3.5 0 L 3.5 3.5 Z" />
        </g>
      )}

      {/* Status indicator pip at top-right (tributary, conquered, rebellious) */}
      {status === 'tributary' && (
        <circle cx="5.5" cy="-5.5" r="2.8" fill="#FBBF24" stroke="#050A11" strokeWidth="0.9" />
      )}
      {status === 'conquered' && (
        <circle cx="5.5" cy="-5.5" r="2.8" fill="#EF4444" stroke="#050A11" strokeWidth="0.9" />
      )}
      {status === 'rebellious' && (
        <circle cx="5.5" cy="-5.5" r="2.8" fill="#FF6A00" stroke="#050A11" strokeWidth="0.9" />
      )}
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
}: VikingMapProps) {
  const lang = state.settings.language;
  const isFa = lang === 'fa';

  const currentLoc = SETTLEMENTS_BY_ID[state.character.locationId] ?? SETTLEMENTS[0];

  const [selectedId, setSelectedId] = useState<string>(state.character.locationId);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [activeSheetTab, setActiveSheetTab] = useState<'overview' | 'actions' | 'raid' | 'siege' | 'diplomacy'>('overview');
  const [showUnexplored, setShowUnexplored] = useState<boolean>(false);
  const [mapTactic, setMapTactic] = useState<RaidTactic>('shield_wall');
  const [siegeApproach, setSiegeApproach] = useState<SiegeApproach>('assault');
  const [diploApproach, setDiploApproach] = useState<DiplomacyApproach>('trade_pact');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canvasAspect, setCanvasAspect] = useState<number>(1.25);

  const initialProj = projectLatLon(currentLoc.lat, currentLoc.lon);
  const [zoom, setZoom] = useState<number>(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 1.4 : 1.15
  );
  const [center, setCenter] = useState<{ x: number; y: number }>(() => ({
    x: Math.max(260, Math.min(1050, initialProj.x)),
    y: Math.max(120, Math.min(480, initialProj.y)),
  }));

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
    const minX = Math.min(MAP_BOUNDS.width / 2, viewW * 0.35);
    const maxX = Math.max(MAP_BOUNDS.width / 2, MAP_BOUNDS.width - viewW * 0.35);
    const minY = 50;
    const maxY = MAP_BOUNDS.height - 50;
    return {
      x: Math.max(minX, Math.min(maxX, cx)),
      y: Math.max(minY, Math.min(maxY, cy)),
    };
  };

  const applyZoom = (nextZ: number, pivotX?: number, pivotY?: number) => {
    const clampedZ = Math.max(0.75, Math.min(4.5, Number(nextZ.toFixed(2))));
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

  const handleResetView = () => {
    const p = projectLatLon(currentLoc.lat, currentLoc.lon);
    setZoom(1.35);
    setCenter(clampCenter(p.x, p.y, 1.35));
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
  const inspectedDisplayName = isFa ? inspectedFa?.name ?? inspected.name : inspected.name;
  const inspectedNorseName = isFa
    ? inspectedFa?.norseName ?? inspected.norseName
    : inspected.norseName;

  const controller = getControllerInYear(inspected, state.year);
  const borders = getHistoricalBordersForYear(state.year);
  const weather = getSeasonalWeatherProfile(state.season, lang);

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

  const isDiscovered =
    state.discoveredSettlements.includes(inspected.id) || showUnexplored;
  const isHeldByPlayer = state.realm.holdings.some(
    (h) => h.settlementId === inspected.id && h.farms > 0
  );
  const isFortifiedEnemyCity = inspected.baseDefense >= 7 && !isHeldByPlayer;

  const currentStatus: SettlementStatus =
    state.settlementStatuses?.[inspected.id] ?? inspected.defaultStatus ?? 'independent';
  const isTributary =
    currentStatus === 'tributary' || (state.tributaries ?? []).includes(inspected.id);

  const used = state.yearlyActivitiesUsed ?? {};
  const currentLocName = isFa
    ? SETTLEMENTS_FA[currentLoc.id]?.name ?? currentLoc.name
    : currentLoc.name;

  // Demographics calculation
  const norsePop = inspected.norsePopulation ?? 150;
  const nativePop = inspected.nativePopulation ?? 850;
  const totalPop = norsePop + nativePop;
  const norsePct = Math.round((norsePop / totalPop) * 100);

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

  return (
    <div className="relative w-full h-full flex flex-col bg-[#070D15] overflow-hidden select-none">
      {/* ================================================================= */}
      {/* INTERACTIVE FULL-HEIGHT VECTOR MAP SVG STAGE                      */}
      {/* ================================================================= */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-0 w-full overflow-hidden bg-[#0A121D] cursor-grab active:cursor-grabbing"
      >
        {/* Floating Map Controls Dock (Zoom, Reset, World Fog) */}
        <div className="absolute top-3 end-3 z-30 flex items-center gap-1.5 bg-[#0C1521]/90 backdrop-blur-md border border-[#233246] rounded-xl p-1 shadow-lg">
          <button
            type="button"
            onClick={() => applyZoom(zoom + 0.35)}
            aria-label={isFa ? 'بزرگ‌نمایی' : 'Zoom In'}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#F1F5F9] hover:bg-[#1E2D40] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => applyZoom(zoom - 0.35)}
            aria-label={isFa ? 'کوچک‌نمایی' : 'Zoom Out'}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#F1F5F9] hover:bg-[#1E2D40] transition-colors cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetView}
            title={isFa ? 'بازنشانی نقشه به موقعیت فعلی' : 'Reset to current location'}
            aria-label={isFa ? 'بازنشانی موقعیت' : 'Reset view'}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#F59E0B] hover:bg-[#1E2D40] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-5 bg-[#233246]" />
          <button
            type="button"
            onClick={() => setShowUnexplored((v) => !v)}
            aria-pressed={showUnexplored}
            title={
              showUnexplored
                ? isFa
                  ? 'پنهان‌سازی بنادر کشف‌نشده'
                  : 'Hide unexplored ports'
                : isFa
                  ? 'نمایش تمام بنادر جهان'
                  : 'Show all world ports'
            }
            className={`h-8 px-2.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
              showUnexplored
                ? 'bg-[#0284C7]/25 text-[#38BDF8]'
                : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E2D40]'
            }`}
          >
            <Eye className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] font-medium">
              {showUnexplored ? (isFa ? 'همه بنادر' : 'All') : (isFa ? 'مه دریا' : 'Fog')}
            </span>
          </button>
        </div>
        <svg
          viewBox={viewBoxStr}
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full block touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <defs>
            <pattern id="seaGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0E1B2D" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Ocean Background */}
          <rect
            x={-600}
            y={-600}
            width={MAP_BOUNDS.width + 1200}
            height={MAP_BOUNDS.height + 1200}
            fill="#09131F"
          />
          <rect
            x={-600}
            y={-600}
            width={MAP_BOUNDS.width + 1200}
            height={MAP_BOUNDS.height + 1200}
            fill="url(#seaGrid)"
            opacity="0.65"
          />

          {/* Graticule Lines */}
          {[-45, -30, -15, 0, 15, 30, 45].map((lon) => {
            const { x } = projectLatLon(0, lon);
            return (
              <line
                key={`lon_${lon}`}
                x1={x}
                y1={-500}
                x2={x}
                y2={MAP_BOUNDS.height + 500}
                stroke="#0E1E32"
                strokeWidth={1 / zoom}
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
                stroke="#0E1E32"
                strokeWidth={1 / zoom}
              />
            );
          })}

          {/* Landmass Polygons */}
          {LANDMASS_POLYGONS.map((poly) => (
            <polygon
              key={poly.id}
              points={pointsToSvgPolygon(poly.coords)}
              fill="#152435"
              stroke="#2E4663"
              strokeWidth={1.3 / Math.sqrt(zoom)}
            />
          ))}

          {/* Island Polygons / Ellipses */}
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
                fill="#1C2F45"
                stroke="#3B577A"
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
              stroke="#2563EB"
              strokeOpacity="0.65"
              strokeWidth={2.4 / Math.sqrt(zoom)}
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
                  strokeWidth={1.2 / Math.sqrt(zoom)}
                  strokeDasharray="4 3"
                />
                <text
                  x={zCenter.x + 6}
                  y={zCenter.y + 13}
                  fill={zone.stroke}
                  stroke="#050A11"
                  strokeWidth={3.5 / Math.sqrt(zoom)}
                  strokeLinejoin="round"
                  paintOrder="stroke fill"
                  className="[paint-order:stroke_fill]"
                  fontSize={12 / Math.sqrt(zoom)}
                  fontWeight="700"
                  opacity="0.9"
                >
                  {isFa ? ZONE_LABELS_FA[zone.id] ?? zone.label : zone.label}
                </text>
              </g>
            );
          })}

          {/* Sea Routes Network */}
          {SEA_ROUTES.map(([aId, bId]) => {
            const a = SETTLEMENTS_BY_ID[aId];
            const b = SETTLEMENTS_BY_ID[bId];
            if (!a || !b) return null;
            const bothKnown =
              showUnexplored ||
              (state.discoveredSettlements.includes(aId) &&
                state.discoveredSettlements.includes(bId));
            const routeMetrics = calculateVoyageMetrics(
              a,
              b,
              state.season,
              state.year,
              effectiveSeamanship,
              hasKnarr
            );
            const knownStroke =
              routeMetrics.dangerPct >= 35
                ? '#991B1B'
                : routeMetrics.dangerPct >= 20
                  ? '#92400E'
                  : '#24456E';
            const pa = projectLatLon(a.lat, a.lon);
            const pb = projectLatLon(b.lat, b.lon);
            return (
              <line
                key={`route_${aId}_${bId}`}
                x1={pa.x}
                y1={pa.y}
                x2={pb.x}
                y2={pb.y}
                stroke={bothKnown ? knownStroke : '#101B2B'}
                strokeWidth={1.25 / Math.sqrt(zoom)}
                strokeDasharray="3.5 4"
              />
            );
          })}

          {/* Active Course Line to Selected Port */}
          {inspected.id !== currentLoc.id && (
            <line
              x1={projectLatLon(currentLoc.lat, currentLoc.lon).x}
              y1={projectLatLon(currentLoc.lat, currentLoc.lon).y}
              x2={projectLatLon(inspected.lat, inspected.lon).x}
              y2={projectLatLon(inspected.lat, inspected.lon).y}
              stroke={
                voyage.dangerPct >= 35
                  ? '#EF4444'
                  : voyage.dangerPct >= 18
                    ? '#F59E0B'
                    : '#38BDF8'
              }
              strokeWidth={2.4 / Math.sqrt(zoom)}
              strokeDasharray="5 3"
            />
          )}

          {/* World Settlements with Distinct Vector Glyphs & Status Badges */}
          {SETTLEMENTS.map((s) => {
            const { x, y } = projectLatLon(s.lat, s.lon);
            const isCurrent = s.id === currentLoc.id;
            const isSelected = s.id === inspected.id && isSheetOpen;
            const known =
              state.discoveredSettlements.includes(s.id) || showUnexplored;
            const playerOwns = state.realm.holdings.some(
              (h) => h.settlementId === s.id && h.farms > 0
            );
            const status: SettlementStatus =
              state.settlementStatuses?.[s.id] ?? s.defaultStatus ?? 'independent';

            const mapPortLabel = isFa
              ? (SETTLEMENTS_FA[s.id]?.name ?? s.name).split(' (')[0]
              : s.name.split(' (')[0];

            const hint = LABEL_ANCHOR_HINTS[s.id];
            const anchor = hint?.anchor ?? 'start';
            const dx = (hint?.dx ?? 10) / Math.sqrt(zoom);
            const dy = (hint?.dy ?? 4) / Math.sqrt(zoom);

            return (
              <g
                key={s.id}
                transform={`translate(${x}, ${y})`}
                opacity={1}
                onClick={() => {
                  if (!dragRef.current.moved) {
                    setSelectedId(s.id);
                    setActiveSheetTab('overview');
                    setIsSheetOpen(true);
                  }
                }}
                className="cursor-pointer"
              >
                {/* Generous Invisible Touch Target */}
                <circle cx="0" cy="0" r={22 / Math.sqrt(zoom)} fill="transparent" />

                {/* Selected Port Ring Highlight */}
                {isSelected && !isCurrent && (
                  <circle
                    cx="0"
                    cy="0"
                    r={13.5 / Math.sqrt(zoom)}
                    fill="rgba(56, 189, 248, 0.22)"
                    stroke="#38BDF8"
                    strokeWidth={1.8 / Math.sqrt(zoom)}
                  />
                )}

                {/* Distinct Vector Glyph by Settlement Type */}
                <SettlementGlyph
                  type={s.settlementType ?? 'town'}
                  factionColor={s.factionColor ?? '#F59E0B'}
                  status={status}
                  isCurrent={isCurrent}
                  playerOwns={playerOwns}
                  isKnown={known}
                  zoom={zoom}
                />

                {/* High-Legibility Outlined Settlement Label */}
                {(known || isSelected || isCurrent) && (
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
                            : '#F8FAFC'
                    }
                    stroke="#050A11"
                    strokeWidth={4.4 / Math.sqrt(zoom)}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    paintOrder="stroke fill"
                    className="[paint-order:stroke_fill]"
                    fontSize={(isCurrent || isSelected ? 14 : 12) / Math.sqrt(zoom)}
                    fontWeight={isCurrent || isSelected ? '700' : '600'}
                  >
                    {mapPortLabel}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* ================================================================= */}
      {/* BOTTOM FLOATING MAP LEGEND & QUICK SHEET TRIGGER                  */}
      {/* ================================================================= */}
      <div className="relative z-30 shrink-0 px-3 py-2 bg-[#0C1521]/95 border-t border-[#1E2D40] backdrop-blur-xs flex items-center justify-between gap-3 text-xs text-[#94A3B8]">
        {/* Settlement Type & Status Legend */}
        <div className="flex flex-wrap items-center gap-3 overflow-x-auto no-scrollbar py-0.5">
          <span className="inline-flex items-center gap-1.5 text-[#F1F5F9]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <span>{isFa ? 'موقعیت شما' : 'Your Fleet'}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Church className="w-3.5 h-3.5 text-[#FBBF24]" />
            <span>{isFa ? 'صومعه (غارت پرارزش)' : 'Monastery (Rich)'}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Castle className="w-3.5 h-3.5 text-[#EF4444]" />
            <span>{isFa ? 'دژ / شهر بزرگ' : 'Fortress / City'}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Ship className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>{isFa ? 'مرکز تجاری' : 'Trading Post'}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-[#A855F7]" />
            <span>{isFa ? 'پایتخت' : 'Capital'}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-[#FBBF24]" />
            <span>{isFa ? 'خراجگزار' : 'Tributary'}</span>
          </span>
        </div>

        {/* Selected Port Bottom Sheet Open Button */}
        <button
          type="button"
          onClick={() => {
            setActiveSheetTab('overview');
            setIsSheetOpen(true);
          }}
          className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-[#131D2B] hover:bg-[#1B2A3E] border border-[#283B52] text-xs font-bold text-[#F1F5F9] inline-flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
        >
          <Compass className="w-4 h-4 text-[#F59E0B] shrink-0" />
          <span>
            {isFa ? `اطلاعات ${inspectedDisplayName}` : `Port: ${inspectedDisplayName}`}
          </span>
        </button>
      </div>

      {/* ================================================================= */}
      {/* SLIDE-UP SETTLEMENT DETAIL & ACTIONS BOTTOM SHEET                 */}
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
            {isFa ? 'مشخصات و آمار' : 'Overview & Lore'}
          </button>
          <button
            type="button"
            onClick={() => setActiveSheetTab('actions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeSheetTab === 'actions'
                ? 'bg-[#1E2D40] text-[#F1F5F9]'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            {isFa ? 'اقدامات موجود (۶ گانه)' : 'Actions (6)'}
          </button>
        </div>

        {/* TAB 1: OVERVIEW & DEMOGRAPHICS */}
        {activeSheetTab === 'overview' && (
          <div className="space-y-3.5">
            {/* Status & Ruler Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#111A26] border border-[#203043] text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#CBD5E1]">
                  {isFa ? 'حاکم محلی:' : 'Local Ruler:'}
                </span>
                <span className="text-[#38BDF8] font-semibold">{controller.ruler}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#1B293A] text-xs font-medium text-[#F1F5F9]">
                  {SETTLEMENT_TYPE_LABELS[lang][inspected.settlementType ?? 'town']}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                    currentStatus === 'tributary'
                      ? 'bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/40'
                      : currentStatus === 'conquered'
                        ? 'bg-[#EF4444]/20 text-[#F87171] border border-[#EF4444]/40'
                        : currentStatus === 'rebellious'
                          ? 'bg-[#FF6A00]/20 text-[#FFA94D] border border-[#FF6A00]/40'
                          : 'bg-[#1B293A] text-[#94A3B8]'
                  }`}
                >
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
                <span className="text-[#94A3B8] font-mono">
                  {isFa
                    ? `نورس ${norsePct}% · بومی ${100 - norsePct}%`
                    : `Norse ${norsePct}% · Native ${100 - norsePct}%`}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-[#1E2D40] overflow-hidden flex">
                <div
                  style={{ width: `${norsePct}%` }}
                  className="bg-[#F59E0B] h-full transition-all"
                  title={`Norse: ${norsePop.toLocaleString()}`}
                />
                <div
                  style={{ width: `${100 - norsePct}%` }}
                  className="bg-[#38BDF8]/60 h-full transition-all"
                  title={`Native: ${nativePop.toLocaleString()}`}
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

            {/* Danger Breakdown (Storms, Pirates, Hostile Fleets) */}
            {inspected.id !== currentLoc.id && (
              <div className="p-2.5 rounded-xl bg-[#101924] border border-[#1E2D40] space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[#CBD5E1] font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>{isFa ? 'تفکیک خطرات سفر دریایی' : 'Voyage Danger Breakdown'}</span>
                  </span>
                  <span className="font-mono text-xs text-[#F87171]">
                    {isFa
                      ? `کل ریسک: ${voyage.dangerPct}%`
                      : `Total: ${voyage.dangerPct}%`}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-[#94A3B8]">
                  <div className="flex items-center gap-1">
                    <CloudRain className="w-3 h-3 text-[#38BDF8]" />
                    <span>{isFa ? 'طوفان:' : 'Storms:'} {voyage.dangerBreakdown?.stormRiskPct ?? 0}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Swords className="w-3 h-3 text-[#EF4444]" />
                    <span>{isFa ? 'دزدان:' : 'Pirates:'} {voyage.dangerBreakdown?.pirateRiskPct ?? 0}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Castle className="w-3 h-3 text-[#A855F7]" />
                    <span>{isFa ? 'ناوگان دشمن:' : 'Navies:'} {voyage.dangerBreakdown?.hostileFleetRiskPct ?? 0}%</span>
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

        {/* TAB 2: THE 6 CONTEXTUAL ACTIONS */}
        {(activeSheetTab === 'actions' || activeSheetTab === 'raid' || activeSheetTab === 'siege' || activeSheetTab === 'diplomacy') && (
          <div className="space-y-3">
            {/* Action 1: Sail Here */}
            {inspected.id !== currentLoc.id && onSailTo && (
              <button
                type="button"
                disabled={!hasShips || Boolean(used.travel)}
                onClick={() => {
                  onSailTo(inspected.id);
                  setIsSheetOpen(false);
                }}
                className="w-full min-h-[46px] px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#38BDF8] hover:text-[#0B1118] disabled:bg-[#1E293B] disabled:text-[#64748B] text-white text-xs font-bold inline-flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <Ship className="w-4 h-4" />
                  <span>
                    {used.travel
                      ? isFa
                        ? 'امسال سفر رفته‌اید ✓'
                        : 'Sailed This Year ✓'
                      : isFa
                        ? `سفر دریایی به ${inspectedDisplayName}`
                        : `Sail to ${inspectedDisplayName}`}
                  </span>
                </span>
                <span className="text-[11px] opacity-85 font-mono">
                  {`~${voyage.sailingDays}d · ${voyage.provisionSilverCost ?? 0} Silver`}
                </span>
              </button>
            )}

            {/* Action 2: Trade */}
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

            {/* Action 3: Raid Port / Monastery */}
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
                    {used.raid ? (isFa ? 'انجام شد ✓' : 'Used ✓') : isFa ? 'انتخاب تاکتیک ▾' : 'Select Tactic ▾'}
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

            {/* Action 4: Besiege (Assault / Blockade / Danegeld Tribute) */}
            {onBesiege && (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={
                    Boolean(used.raid) ||
                    state.realm.longships < 1 && state.realm.hirdWarriors < 6
                  }
                  onClick={() => setActiveSheetTab(activeSheetTab === 'siege' ? 'actions' : 'siege')}
                  className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-[#1E1424] hover:bg-[#2B1B34] border border-[#A855F7]/60 disabled:border-[#233246] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#F3E8FF] text-xs font-bold inline-flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span className="inline-flex items-center gap-2">
                    <Castle className="w-4 h-4 text-[#C084FC]" />
                    <span>{isFa ? '۳. محاصره یا باج‌خواهی (دژ و شهر)' : '3. Besiege / Demand Danegeld'}</span>
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
                        <div className="text-[10px] text-[#94A3B8] mt-0.5">{isFa ? 'نبرد خونین و فتح کامل' : 'High Glory & Conquest'}</div>
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
                        <div className="text-[10px] text-[#94A3B8] mt-0.5">{isFa ? 'قطع آذوقه و تسلیم شهر' : 'Starve into Tribute'}</div>
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
                        <div className="text-[10px] text-[#94A3B8] mt-0.5">{isFa ? 'اخاذی نقره با ارعاب' : 'Intimidation & Tribute'}</div>
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

            {/* Action 5: Settle Norse Colony */}
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

            {/* Action 6: Diplomacy & Varangian Oath */}
            {onDiplomacy && (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={Boolean(used.trade)}
                  onClick={() => setActiveSheetTab(activeSheetTab === 'diplomacy' ? 'actions' : 'diplomacy')}
                  className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-[#14232B] hover:bg-[#1C323D] border border-[#06B6D4]/60 disabled:border-[#233246] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#CFFAFE] text-xs font-bold inline-flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span className="inline-flex items-center gap-2">
                    <Handshake className="w-4 h-4 text-[#06B6D4]" />
                    <span>{isFa ? '۵. مذاکره دیپلماتیک / گارد سلطنتی' : '5. Diplomacy / Royal Service'}</span>
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
                        <div className="text-[10px] text-[#94A3B8] mt-0.5">{isFa ? 'حقوق بازرگانی و درآمد نقره' : 'Trade Route & Silver'}</div>
                      </button>

                      {(inspected.id === 'constantinople' || inspected.id === 'kiev' || inspected.id === 'novgorod') ? (
                        <button
                          type="button"
                          onClick={() => setDiploApproach('varangian_oath')}
                          className={`p-2 rounded-lg border text-start cursor-pointer transition-colors ${
                            diploApproach === 'varangian_oath'
                              ? 'bg-[#2E1842] border-[#E879F9] text-white'
                              : 'bg-[#0E1520] border-[#22354A] text-[#94A3B8]'
                          }`}
                        >
                          <div className="text-xs font-bold text-[#E879F9]">{isFa ? 'سوگند گارد وارنگیان' : 'Varangian Guard Oath'}</div>
                          <div className="text-[10px] text-[#F0ABFC] mt-0.5">{isFa ? '+۴۵ طلای امپراتور، ابریشم و شهرت' : '+45 Imperial Gold & Trait'}</div>
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
                          <div className="text-xs font-bold">{isFa ? 'تقاضای خراج صلح' : 'Demand Peace Tribute'}</div>
                          <div className="text-[10px] text-[#94A3B8] mt-0.5">{isFa ? 'توافق برای خراج سالانه' : 'Swear tributary oath'}</div>
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

            {/* Action 7: Marry into Local Family */}
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
