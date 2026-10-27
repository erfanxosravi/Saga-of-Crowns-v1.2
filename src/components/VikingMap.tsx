import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Anchor,
  Castle,
  CloudRain,
  Compass,
  Eye,
  Minus,
  Plus,
  RotateCcw,
  Snowflake,
  Sun,
  Swords,
  Wind,
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
import { hasBoathouse, RaidTactic } from '../engine/gameEngine';
import { SETTLEMENTS_FA } from '../i18n/gameDataFa';
import { REGION_LABELS, SEASON_LABELS } from '../i18n/ui';
import { FullGameState, RegionGroup, Season, Settlement } from '../types/game';
import { NorseBottomSheet, RuneDivider } from './NorseMotifs';

interface VikingMapProps {
  state: FullGameState;
  onSailTo?: (settlementId: string) => void;
  onRaidPort?: (settlementId: string, tactic: RaidTactic) => void;
  onConquerCity?: (settlementId: string) => void;
  onTradeHere?: () => void;
}

const ZONE_LABELS_FA: Record<string, string> = {
  danelaw: 'قلمرو دانلو',
  normandy: 'نورماندی',
  north_sea_empire: 'امپراتوری دریای شمال',
  iceland_commonwealth: 'شورای آزاد ایسلند',
};

const REGION_CHIPS: ('ALL' | RegionGroup)[] = [
  'ALL',
  'Norway',
  'Denmark',
  'Sweden',
  'British Isles',
  'Ireland',
  'Continent',
  'North Atlantic',
];

/**
 * Pure presentation label placement offsets so neighboring port labels stay legible
 * without modifying underlying settlement geographic coordinates.
 */
const LABEL_ANCHOR_HINTS: Record<
  string,
  { anchor?: 'start' | 'end' | 'middle'; dx?: number; dy?: number }
> = {
  ribe: { anchor: 'end', dx: -8, dy: 2 },
  jelling: { anchor: 'end', dx: -8, dy: -4 },
  hedeby: { anchor: 'start', dx: 8, dy: 10 },
  roskilde: { anchor: 'start', dx: 8, dy: 3 },
  uppsala: { anchor: 'start', dx: 8, dy: -6 },
  birka: { anchor: 'start', dx: 8, dy: 9 },
  kaupang: { anchor: 'end', dx: -8, dy: 3 },
  dublin: { anchor: 'end', dx: -8, dy: -3 },
  wexford: { anchor: 'end', dx: -8, dy: 9 },
  limerick: { anchor: 'end', dx: -8, dy: 3 },
};

export function VikingMap({
  state,
  onSailTo,
  onRaidPort,
  onConquerCity,
  onTradeHere,
}: VikingMapProps) {
  const lang = state.settings.language;
  const isFa = lang === 'fa';

  const currentLoc = SETTLEMENTS_BY_ID[state.character.locationId] ?? SETTLEMENTS[0];

  const [selectedId, setSelectedId] = useState<string>(state.character.locationId);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [regionFilter, setRegionFilter] = useState<'ALL' | RegionGroup>('ALL');
  const [showUnexplored, setShowUnexplored] = useState<boolean>(false);
  const [showRaidTactics, setShowRaidTactics] = useState<boolean>(false);
  const [mapTactic, setMapTactic] = useState<RaidTactic>('shield_wall');

  // Container size for 1:1 undistorted full-height SVG aspect ratio
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canvasAspect, setCanvasAspect] = useState<number>(1.25);

  // Start slightly zoomed around current location on compact viewports so labels are crisp immediately
  const initialProj = projectLatLon(currentLoc.lat, currentLoc.lon);
  const [zoom, setZoom] = useState<number>(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 1.45 : 1.15
  );
  const [center, setCenter] = useState<{ x: number; y: number }>(() => ({
    x: Math.max(260, Math.min(820, initialProj.x)),
    y: Math.max(150, Math.min(390, initialProj.y)),
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
    const minY = 60;
    const maxY = MAP_BOUNDS.height - 60;
    return {
      x: Math.max(minX, Math.min(maxX, cx)),
      y: Math.max(minY, Math.min(maxY, cy)),
    };
  };

  const applyZoom = (nextZoomRaw: number) => {
    const nextZ = Math.max(1, Math.min(3.6, Number(nextZoomRaw.toFixed(2))));
    setZoom(nextZ);
    setCenter((prev) => clampCenter(prev.x, prev.y, nextZ));
  };

  const resetZoomPan = () => {
    setRegionFilter('ALL');
    setZoom(1);
    setCenter({ x: MAP_BOUNDS.width * 0.56, y: MAP_BOUNDS.height * 0.5 });
  };

  const focusCurrentPort = () => {
    const p = projectLatLon(currentLoc.lat, currentLoc.lon);
    const targetZ = Math.max(zoom, 1.85);
    setZoom(targetZ);
    setCenter(clampCenter(p.x, p.y, targetZ));
    setSelectedId(currentLoc.id);
    setShowRaidTactics(false);
    setIsSheetOpen(true);
  };

  const handleSelectRegion = (reg: 'ALL' | RegionGroup) => {
    setRegionFilter(reg);
    if (reg === 'ALL') {
      setZoom(1);
      setCenter({ x: MAP_BOUNDS.width * 0.56, y: MAP_BOUNDS.height * 0.5 });
      return;
    }
    const matching = SETTLEMENTS.filter((s) => s.regionGroup === reg);
    if (matching.length === 0) return;
    const pts = matching.map((s) => projectLatLon(s.lat, s.lon));
    const minX = Math.min(...pts.map((p) => p.x));
    const maxX = Math.max(...pts.map((p) => p.x));
    const minY = Math.min(...pts.map((p) => p.y));
    const maxY = Math.max(...pts.map((p) => p.y));
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const spanX = Math.max(95, maxX - minX + 90);
    const computedZ = Math.max(1.35, Math.min(3.0, Number((MAP_BOUNDS.width / spanX).toFixed(2))));
    setZoom(computedZ);
    setCenter(clampCenter(cx, cy, computedZ));
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

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.28 : -0.28;
    applyZoom(zoom + delta);
  };

  const inspected: Settlement = SETTLEMENTS_BY_ID[selectedId] ?? currentLoc;
  const inspectedFa = SETTLEMENTS_FA[inspected.id];
  const controller = getControllerInYear(inspected, state.year);
  const borders = getHistoricalBordersForYear(state.year);
  const weather = getSeasonalWeatherProfile(state.season, lang);

  const used = state.yearlyActivitiesUsed ?? {};
  const hasShips = state.realm.longships + state.realm.knarrs > 0;
  const hasKnarr = state.realm.knarrs > 0;
  const isDiscovered = state.discoveredSettlements.includes(inspected.id) || showUnexplored;
  const isHeldByPlayer = state.realm.holdings.some(
    (h) => h.settlementId === inspected.id && h.farms > 0
  );
  const isFortifiedEnemyCity = inspected.baseDefense >= 7 && !isHeldByPlayer;
  const effectiveSeamanship =
    state.character.skills.seamanship + (hasBoathouse(state) ? 3 : 0);

  const voyage = calculateVoyageMetrics(
    currentLoc,
    inspected,
    state.season,
    state.year,
    effectiveSeamanship,
    hasKnarr
  );

  const inspectedDisplayName = isFa ? inspectedFa?.name ?? inspected.name : inspected.name;
  const inspectedNorseName = isFa
    ? inspectedFa?.norseName ?? inspected.norseName
    : inspected.norseName;
  const currentLocName = isFa
    ? (SETTLEMENTS_FA[currentLoc.id]?.name ?? currentLoc.name).split(' (')[0]
    : currentLoc.name.split(' (')[0];

  const viewW = MAP_BOUNDS.width / zoom;
  const viewH = Math.max(260, viewW * canvasAspect);
  const vbX = center.x - viewW / 2;
  const vbY = center.y - viewH / 2;

  const renderSeasonIcon = (s: Season, cls = 'w-4 h-4 shrink-0') => {
    switch (s) {
      case Season.Winter:
        return <Snowflake className={`${cls} text-[#38BDF8]`} />;
      case Season.Autumn:
        return <CloudRain className={`${cls} text-[#94A3B8]`} />;
      case Season.Spring:
        return <Wind className={`${cls} text-teal-300`} />;
      case Season.Summer:
        return <Sun className={`${cls} text-[#F59E0B]`} />;
    }
  };

  const raidTacticOptions: { value: RaidTactic; label: string; desc: string; tag: string }[] = [
    {
      value: 'shield_wall',
      label: isFa ? 'دیوار سپرها' : 'Shield Wall',
      desc: isFa ? 'نبرد مستقیم و متعادل' : 'Balanced frontline clash',
      tag: isFa ? 'متعادل' : 'Balanced',
    },
    {
      value: 'surprise',
      label: isFa ? 'شبیخون سحرگاه' : 'Dawn Ambush',
      desc: isFa ? 'یورش سریع با غنیمت بیشتر' : 'Cunning strike · higher loot',
      tag: isFa ? 'ذکاوت' : 'Cunning',
    },
    {
      value: 'ransom',
      label: isFa ? 'گرفتن باج نقره' : 'Demand Tribute',
      desc: isFa ? 'محاصره با تلفات کمتر' : 'Intimidate for silver · safer',
      tag: isFa ? 'کم‌خطر' : 'Safer',
    },
    {
      value: 'feigned_retreat',
      label: isFa ? 'فرار ساختگی' : 'Feigned Flight',
      desc: isFa ? 'کشاندن مدافعان به تله' : 'Tactical ambush maneuver',
      tag: isFa ? 'تاکتیکی' : 'Tactical',
    },
  ];

  return (
    <div className="h-full min-h-[380px] flex flex-col bg-[#070E17] text-start overflow-hidden">
      {/* Top Region Filter Chips Row */}
      <div className="shrink-0 px-3 py-2 bg-[#0D1624] border-b border-[#1E2D40] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {REGION_CHIPS.map((reg) => {
          const active = regionFilter === reg;
          const label =
            reg === 'ALL'
              ? isFa
                ? 'همه دریاها'
                : 'All Seas'
              : REGION_LABELS[lang][reg];
          return (
            <button
              key={reg}
              type="button"
              onClick={() => handleSelectRegion(reg)}
              className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 whitespace-nowrap transition-colors cursor-pointer ${
                active
                  ? 'bg-[#F59E0B] text-[#0B1118]'
                  : 'bg-[#131D2B] hover:bg-[#1A293D] border border-[#24364D] text-[#CBD5E1]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Main Full-Height Interactive Sea Chart Stage */}
      <div
        ref={containerRef}
        dir="ltr"
        className="relative flex-1 min-h-[260px] w-full bg-[#070E17] overflow-hidden touch-none"
      >
        {/* Top-Left Compact Season & Sea Weather Overlay */}
        <div
          dir={isFa ? 'rtl' : 'ltr'}
          className="absolute top-2.5 left-2.5 z-20 max-w-[calc(100%-70px)] px-3 py-2 rounded-xl bg-[#0B131F]/90 backdrop-blur-xs border border-[#24364D] flex items-center gap-2 pointer-events-none"
        >
          {renderSeasonIcon(state.season)}
          <div className="text-xs leading-snug">
            <span className="font-semibold text-[#F1F5F9]">
              {SEASON_LABELS[lang][state.season]}
            </span>
            <span className="text-[#94A3B8]"> · </span>
            <span className="font-mono tabular-nums text-[#38BDF8]">{weather.seaEffectShort}</span>
          </div>
        </div>

        {/* Neat Vertical Map Controls Stack (Top-Right, all 44x44 touch targets) */}
        <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => applyZoom(zoom + 0.45)}
            aria-label={isFa ? 'بزرگ‌نمایی نقشه' : 'Zoom In'}
            title={isFa ? 'بزرگ‌نمایی نقشه' : 'Zoom In'}
            className="min-w-[44px] min-h-[44px] rounded-xl bg-[#0F1722]/92 border border-[#283B52] hover:border-[#38BDF8] text-[#F1F5F9] flex items-center justify-center shadow-md cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => applyZoom(zoom - 0.45)}
            aria-label={isFa ? 'کوچک‌نمایی نقشه' : 'Zoom Out'}
            title={isFa ? 'کوچک‌نمایی نقشه' : 'Zoom Out'}
            className="min-w-[44px] min-h-[44px] rounded-xl bg-[#0F1722]/92 border border-[#283B52] hover:border-[#38BDF8] text-[#F1F5F9] flex items-center justify-center shadow-md cursor-pointer transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={focusCurrentPort}
            aria-label={isFa ? 'رفتن به موقعیت فعلی' : 'Center on Current Port'}
            title={isFa ? 'رفتن به بندر فعلی شما' : 'Center on Current Port'}
            className="min-w-[44px] min-h-[44px] rounded-xl bg-[#0F1722]/92 border border-[#F59E0B]/60 hover:border-[#F59E0B] text-[#F59E0B] flex items-center justify-center shadow-md cursor-pointer transition-colors"
          >
            <Anchor className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowUnexplored((v) => !v)}
            aria-label={
              showUnexplored
                ? isFa
                  ? 'پوشاندن ناشناخته‌ها'
                  : 'Hide Unexplored Ports'
                : isFa
                  ? 'نمایش کل بنادر'
                  : 'Reveal All Ports'
            }
            title={
              showUnexplored
                ? isFa
                  ? 'پوشاندن بنادر ناشناخته'
                  : 'Hide Unexplored Ports'
                : isFa
                  ? 'نمایش تمام بنادر روی نقشه'
                  : 'Reveal All Ports'
            }
            className={`min-w-[44px] min-h-[44px] rounded-xl border flex items-center justify-center shadow-md cursor-pointer transition-colors ${
              showUnexplored
                ? 'bg-[#172B42] border-[#38BDF8] text-[#38BDF8]'
                : 'bg-[#0F1722]/92 border-[#283B52] hover:border-[#38BDF8] text-[#CBD5E1]'
            }`}
          >
            <Eye className="w-4 h-4" />
          </button>

          {(zoom > 1.05 || regionFilter !== 'ALL') && (
            <button
              type="button"
              onClick={resetZoomPan}
              aria-label={isFa ? 'بازنشانی نمای نقشه' : 'Reset Map View'}
              title={isFa ? 'بازنشانی نمای نقشه' : 'Reset Map View'}
              className="min-w-[44px] min-h-[44px] rounded-xl bg-[#0F1722]/92 border border-[#283B52] hover:border-[#F59E0B] text-[#CBD5E1] hover:text-[#F59E0B] flex items-center justify-center shadow-md cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Zoom / Tap Hint */}
        <div
          dir={isFa ? 'rtl' : 'ltr'}
          className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none text-xs font-mono text-[#CBD5E1] bg-[#0B131F]/85 border border-[#1E2D40] px-2.5 py-1 rounded-lg"
        >
          {isFa
            ? `${zoom.toFixed(1)}x · روی هر بندر بزنید`
            : `${zoom.toFixed(1)}x · Tap any port`}
        </div>

        <svg
          viewBox={`${vbX} ${vbY} ${viewW} ${viewH}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          className="w-full h-full block select-none cursor-grab active:cursor-grabbing"
          role="img"
          aria-label="Viking Age Sea Chart"
        >
          {/* Extended Ocean Graticule */}
          {[-45, -30, -15, 0, 15].map((lon) => {
            const { x } = projectLatLon(55, lon);
            return (
              <line
                key={`lon_${lon}`}
                x1={x}
                y1={-450}
                x2={x}
                y2={MAP_BOUNDS.height + 450}
                stroke="#0E1B2D"
                strokeWidth={1 / zoom}
              />
            );
          })}
          {[48, 52, 56, 60, 64].map((lat) => {
            const { y } = projectLatLon(lat, 0);
            return (
              <line
                key={`lat_${lat}`}
                x1={-400}
                y1={y}
                x2={MAP_BOUNDS.width + 400}
                y2={y}
                stroke="#0E1B2D"
                strokeWidth={1 / zoom}
              />
            );
          })}

          {/* Landmasses */}
          {LANDMASS_POLYGONS.map((poly) => (
            <polygon
              key={poly.id}
              points={pointsToSvgPolygon(poly.coords)}
              fill="#162333"
              stroke="#334B68"
              strokeWidth={1.35 / Math.sqrt(zoom)}
            />
          ))}

          {/* Small Island Markers */}
          {['kirkwall', 'shetland', 'faroes', 'isle_of_man', 'iona'].map((islId) => {
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
                fill="#1C2C40"
                stroke="#3A5575"
                strokeWidth={1 / Math.sqrt(zoom)}
              />
            );
          })}

          {/* Navigable Rivers */}
          {NAVIGABLE_RIVERS.map((riv) => (
            <path
              key={riv.name}
              d={pointsToSvgPath(riv.coords)}
              fill="none"
              stroke="#2563EB"
              strokeOpacity="0.55"
              strokeWidth={2 / Math.sqrt(zoom)}
              strokeLinecap="round"
            />
          ))}

          {/* Historical Political Zones (with crisp halo labels) */}
          {borders.map((zone) => {
            const zCenter = projectLatLon(zone.coords[0][0], zone.coords[0][1]);
            return (
              <g key={zone.id}>
                <polygon
                  points={pointsToSvgPolygon(zone.coords)}
                  fill={zone.fill}
                  stroke={zone.stroke}
                  strokeWidth={1.3 / Math.sqrt(zoom)}
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
                  opacity="0.92"
                >
                  {isFa ? ZONE_LABELS_FA[zone.id] ?? zone.label : zone.label}
                </text>
              </g>
            );
          })}

          {/* Sea Routes */}
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

          {/* Active Route Preview Line */}
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
              strokeWidth={2.2 / Math.sqrt(zoom)}
              strokeDasharray="5 3"
            />
          )}

          {/* Settlements & High-Legibility Halo Labels */}
          {SETTLEMENTS.map((s) => {
            const { x, y } = projectLatLon(s.lat, s.lon);
            const isCurrent = s.id === currentLoc.id;
            const isSelected = s.id === inspected.id && isSheetOpen;
            const known =
              state.discoveredSettlements.includes(s.id) ||
              showUnexplored ||
              regionFilter === s.regionGroup;
            const playerOwns = state.realm.holdings.some(
              (h) => h.settlementId === s.id && h.farms > 0
            );
            const isFortified = s.baseDefense >= 7 && !playerOwns;
            const matchesRegion = regionFilter === 'ALL' || s.regionGroup === regionFilter;

            const mapPortLabel = isFa
              ? (SETTLEMENTS_FA[s.id]?.name ?? s.name).split(' (')[0]
              : s.name.split(' (')[0];

            const hint = LABEL_ANCHOR_HINTS[s.id];
            const anchor = hint?.anchor ?? 'start';
            const dx = (hint?.dx ?? 8) / Math.sqrt(zoom);
            const dy = (hint?.dy ?? 4) / Math.sqrt(zoom);

            return (
              <g
                key={s.id}
                opacity={matchesRegion || isCurrent ? 1 : 0.32}
                onClick={() => {
                  if (!dragRef.current.moved) {
                    setSelectedId(s.id);
                    setShowRaidTactics(false);
                    setIsSheetOpen(true);
                  }
                }}
                className="cursor-pointer"
              >
                {/* Generous Touch Target Circle */}
                <circle cx={x} cy={y} r={18 / Math.sqrt(zoom)} fill="transparent" />

                {/* Current Location Outer Halo */}
                {isCurrent && (
                  <circle
                    cx={x}
                    cy={y}
                    r={11.5 / Math.sqrt(zoom)}
                    fill="rgba(245, 158, 11, 0.25)"
                    stroke="#F59E0B"
                    strokeWidth={1.6 / Math.sqrt(zoom)}
                  />
                )}

                {/* Fortified Stronghold Ring */}
                {known && isFortified && !isCurrent && (
                  <circle
                    cx={x}
                    cy={y}
                    r={7.5 / Math.sqrt(zoom)}
                    fill="none"
                    stroke="#EF4444"
                    strokeOpacity="0.85"
                    strokeWidth={1.35 / Math.sqrt(zoom)}
                  />
                )}

                {/* Selected Port Ring */}
                {isSelected && !isCurrent && (
                  <circle
                    cx={x}
                    cy={y}
                    r={10 / Math.sqrt(zoom)}
                    fill="rgba(56, 189, 248, 0.18)"
                    stroke="#38BDF8"
                    strokeWidth={1.6 / Math.sqrt(zoom)}
                  />
                )}

                {/* Core Port Dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={(isCurrent ? 5.6 : playerOwns ? 5 : 4.2) / Math.sqrt(zoom)}
                  fill={
                    isCurrent
                      ? '#F59E0B'
                      : playerOwns
                        ? '#34D399'
                        : known
                          ? '#F8FAFC'
                          : '#64748B'
                  }
                  stroke="#050A11"
                  strokeWidth={1.4 / Math.sqrt(zoom)}
                />

                {/* High-Contrast Outlined Port Name Label */}
                {(known || isSelected || isCurrent) && (
                  <text
                    x={x + dx}
                    y={y + dy}
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
                    strokeWidth={4.2 / Math.sqrt(zoom)}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    paintOrder="stroke fill"
                    className="[paint-order:stroke_fill]"
                    fontSize={(isCurrent || isSelected ? 14.5 : 12.5) / Math.sqrt(zoom)}
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

      {/* Bottom Legend + Quick Current Port Sheet Trigger */}
      <div className="shrink-0 px-3 py-2 bg-[#0D1624] border-t border-[#1E2D40] flex flex-wrap items-center justify-between gap-2">
        {/* Map Legend */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#CBD5E1]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0" />
            <span>{isFa ? 'موقعیت شما' : 'You'}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#34D399] shrink-0" />
            <span>{isFa ? 'ملک شما' : 'Estate'}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F8FAFC] shrink-0" />
            <span>{isFa ? 'بندر' : 'Port'}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full border-2 border-[#EF4444] shrink-0" />
            <span>{isFa ? 'دژ مستحکم' : 'Fortified'}</span>
          </span>
        </div>

        {/* Open Port Sheet Button */}
        <button
          type="button"
          onClick={() => {
            setShowRaidTactics(false);
            setIsSheetOpen(true);
          }}
          className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-[#131D2B] hover:bg-[#1B2A3E] border border-[#283B52] text-xs font-bold text-[#F1F5F9] inline-flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
        >
          <Compass className="w-4 h-4 text-[#F59E0B] shrink-0" />
          <span>
            {isFa ? `اطلاعات ${currentLocName}` : `Port: ${currentLocName}`}
          </span>
        </button>
      </div>

      {/* ================================================================= */}
      {/* SLIDE-UP LOCATION DETAIL BOTTOM SHEET                             */}
      {/* ================================================================= */}
      <NorseBottomSheet
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setShowRaidTactics(false);
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
            {isFortifiedEnemyCity ? (
              <Castle className="w-6 h-6" />
            ) : (
              <Anchor className="w-6 h-6" />
            )}
          </div>
        }
      >
        {/* Port Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl bg-[#131D2B] border border-[#233246]">
            <div className="text-xs text-[#94A3B8]">
              {isFa ? 'ثروت بازار' : 'Market Wealth'}
            </div>
            <div className="text-sm font-mono font-bold tabular-nums text-[#FBBF24] mt-0.5">
              {isDiscovered ? `${inspected.baseWealth} / 10` : '? / 10'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#131D2B] border border-[#233246]">
            <div className="text-xs text-[#94A3B8]">
              {isFa ? 'استحکامات دفاعی' : 'Port Defense'}
            </div>
            <div
              className={`text-sm font-mono font-bold tabular-nums mt-0.5 ${
                inspected.baseDefense >= 7 ? 'text-[#F87171]' : 'text-[#CBD5E1]'
              }`}
            >
              {isDiscovered ? `${inspected.baseDefense} / 10` : '? / 10'}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-[#131D2B] border border-[#233246]">
            <div className="text-xs text-[#94A3B8]">
              {inspected.id === currentLoc.id
                ? isFa
                  ? 'وضعیت بندر'
                  : 'Port Status'
                : isFa
                  ? `مسیر دریایی (~${voyage.sailingDays} روز)`
                  : `Voyage (~${voyage.sailingDays}d · ${voyage.nauticalMiles} nm)`}
            </div>
            <div className="text-sm font-mono font-bold tabular-nums mt-0.5">
              {inspected.id === currentLoc.id ? (
                <span className="text-[#F59E0B]">
                  {isHeldByPlayer
                    ? isFa
                      ? 'ملک شما · لنگرگاه'
                      : 'Your Estate · Moored'
                    : isFa
                      ? 'لنگرگاه فعلی شما'
                      : 'Moored Here'}
                </span>
              ) : (
                <span
                  className={`inline-flex items-center gap-1 ${
                    voyage.dangerPct >= 35
                      ? 'text-[#F87171]'
                      : voyage.dangerPct >= 18
                        ? 'text-[#F59E0B]'
                        : 'text-[#34D399]'
                  }`}
                >
                  {voyage.dangerPct >= 30 && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                  {isFa ? `خطر دریا ${voyage.dangerPct}%` : `Sea Risk ${voyage.dangerPct}%`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Historical Lore */}
        {isDiscovered && (
          <p className="text-xs sm:text-sm text-[#CBD5E1] whitespace-normal break-words leading-relaxed">
            {isFa ? inspectedFa?.summary ?? inspected.historicalSummary : inspected.historicalSummary}
          </p>
        )}

        <RuneDivider accent="ice" />

        {/* Contextual Actions */}
        {inspected.id === currentLoc.id ? (
          <div className="space-y-2.5">
            {onTradeHere && (
              <button
                type="button"
                disabled={Boolean(used.trade) || state.character.age < 15}
                onClick={() => {
                  onTradeHere();
                  setIsSheetOpen(false);
                }}
                className="w-full min-h-[48px] px-4 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#0B1118] text-xs sm:text-sm font-extrabold cursor-pointer transition-colors"
              >
                {used.trade
                  ? isFa
                    ? 'امسال در این بازار معامله شد ✓'
                    : 'Traded Here This Year ✓'
                  : state.character.age < 15
                    ? isFa
                      ? 'تجارت نیازمند سن ۱۵+ است'
                      : 'Trade Requires Age 15+'
                    : isFa
                      ? 'تجارت در بازار این بندر (+نقره)'
                      : 'Trade in Port Market (+Silver)'}
              </button>
            )}

            {isFortifiedEnemyCity && onConquerCity && (
              <button
                type="button"
                disabled={
                  Boolean(used.settle) ||
                  state.realm.longships <= 0 ||
                  state.realm.hirdWarriors < 12
                }
                onClick={() => {
                  onConquerCity(inspected.id);
                  setIsSheetOpen(false);
                }}
                className="w-full min-h-[48px] px-4 rounded-xl bg-[#DC2626] hover:bg-[#EF4444] disabled:bg-[#1E293B] disabled:text-[#64748B] text-white text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Castle className="w-4 h-4 shrink-0" />
                <span>
                  {used.settle
                    ? isFa
                      ? 'اقدام فتح/اسکان امسال انجام شد ✓'
                      : 'Conquest Used This Year ✓'
                    : isFa
                      ? 'حمله برای فتح نظامی شهر (۱ کشتی و ۱۲+ جنگجو)'
                      : 'Conquer Fortified City (1 Ship & 12+ Warriors)'}
                </span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {onSailTo && (
                <button
                  type="button"
                  disabled={!hasShips || Boolean(used.travel)}
                  onClick={() => {
                    onSailTo(inspected.id);
                    setIsSheetOpen(false);
                  }}
                  className="min-h-[48px] px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#38BDF8] hover:text-[#0B1118] disabled:bg-[#1E293B] disabled:text-[#64748B] text-white text-xs sm:text-sm font-extrabold cursor-pointer transition-colors"
                >
                  {used.travel
                    ? isFa
                      ? 'امسال سفر رفته‌اید ✓'
                      : 'Sailed This Year ✓'
                    : hasShips
                      ? isFa
                        ? `سفر دریایی به اینجا (~${voyage.sailingDays} روز)`
                        : `Sail Here (~${voyage.sailingDays} days)`
                      : isFa
                        ? 'نیازمند ساخت کشتی'
                        : 'Requires a Ship'}
                </button>
              )}

              {onRaidPort && (
                <button
                  type="button"
                  disabled={
                    state.character.age < 15 ||
                    state.realm.longships <= 0 ||
                    state.realm.hirdWarriors <= 0 ||
                    Boolean(used.raid)
                  }
                  onClick={() => setShowRaidTactics((v) => !v)}
                  className="min-h-[48px] px-4 py-2 rounded-xl border border-[#EF4444] bg-[#241016] hover:bg-[#DC2626] disabled:border-[#233246] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#FFE4E6] text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Swords className="w-4 h-4 shrink-0" />
                  <span>
                    {used.raid
                      ? isFa
                        ? 'امسال غارت رفتید ✓'
                        : 'Raided This Year ✓'
                      : isFa
                        ? 'غارت این بندر'
                        : 'Raid Port'}
                  </span>
                </button>
              )}
            </div>

            {isFortifiedEnemyCity && onConquerCity && (
              <button
                type="button"
                disabled={
                  Boolean(used.settle) ||
                  state.realm.longships <= 0 ||
                  state.realm.hirdWarriors < 12
                }
                onClick={() => {
                  onConquerCity(inspected.id);
                  setIsSheetOpen(false);
                }}
                className="w-full min-h-[46px] px-4 py-2 rounded-xl bg-[#1F1218] border border-[#EF4444]/65 hover:bg-[#DC2626] disabled:border-[#233246] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#F1F5F9] text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Castle className="w-4 h-4 text-[#F87171] shrink-0" />
                <span className="whitespace-normal break-words leading-snug">
                  {used.settle
                    ? isFa
                      ? 'فتح امسال انجام شد ✓'
                      : 'Conquest Used This Year ✓'
                    : isFa
                      ? `فتح دژ ${inspectedDisplayName} (۱ کشتی جنگی و ۱۲+ جنگجو)`
                      : `Conquer ${inspectedDisplayName} (1 Longship & 12+ Warriors)`}
                </span>
              </button>
            )}

            {/* Visible Raid Tactic Cards when Raid Port is tapped */}
            {showRaidTactics && onRaidPort && !used.raid && (
              <div className="p-3.5 rounded-2xl bg-[#1A0D12] border border-[#EF4444]/60 space-y-3">
                <div className="text-xs font-bold text-[#FECACA]">
                  {isFa ? 'انتخاب تاکتیک حمله:' : 'Select Raid Battle Tactic:'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {raidTacticOptions.map((tac) => {
                    const sel = mapTactic === tac.value;
                    return (
                      <button
                        key={tac.value}
                        type="button"
                        onClick={() => setMapTactic(tac.value)}
                        className={`min-h-[56px] p-2.5 rounded-xl border text-start cursor-pointer transition-colors ${
                          sel
                            ? 'bg-[#31121A] border-[#EF4444] text-[#F1F5F9]'
                            : 'bg-[#0F1722] border-[#24364D] text-[#CBD5E1]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs font-bold">
                          <span>{tac.label}</span>
                          <span className="font-mono text-[#FCA5A5]">{tac.tag}</span>
                        </div>
                        <div className="text-xs text-[#94A3B8] mt-0.5">{tac.desc}</div>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onRaidPort(inspected.id, mapTactic);
                    setShowRaidTactics(false);
                    setIsSheetOpen(false);
                  }}
                  className="w-full min-h-[46px] bg-[#DC2626] hover:bg-[#EF4444] text-white font-extrabold text-xs sm:text-sm rounded-xl cursor-pointer transition-colors"
                >
                  {isFa
                    ? `آغاز یورش به ${inspectedDisplayName}!`
                    : `Launch Raid on ${inspectedDisplayName}!`}
                </button>
              </div>
            )}
          </div>
        )}
      </NorseBottomSheet>
    </div>
  );
}
