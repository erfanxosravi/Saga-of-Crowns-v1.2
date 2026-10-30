import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  Anchor,
  Castle,
  Check,
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
  isSettlementActiveInYear,
  LANDMASS_POLYGONS,
  MAP_BOUNDS,
  MOUNTAIN_RANGES,
  NAVIGABLE_RIVERS,
  pointsToSmoothSvgPath,
  projectLatLon,
  resolveActiveSettlementId,
  SETTLEMENTS,
  SETTLEMENTS_BY_ID,
} from '../data/geography';
import {
  BUILDINGS_CATALOG,
  MILITARY_CATALOG_BY_ID,
  MilitaryCatalogItemId,
} from '../data/namesAndTraits';
import {
  DiplomacyApproach,
  hasBoathouse,
  RaidTactic,
  SiegeApproach,
} from '../engine/gameEngine';
import {
  BUILDINGS_FA,
  formatPersonName,
  formatRulerName,
  SETTLEMENTS_FA,
} from '../i18n/gameDataFa';
import {
  MAP_FORCES_UI,
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
import { MilitaryUnitGlyph, NorseBottomSheet } from './NorseMotifs';

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

type MapLensId = 'all' | 'owned' | 'forces' | 'loot' | 'trade';
type SheetTabId =
  | 'assets'
  | 'forces'
  | 'buildings'
  | 'actions'
  | 'raid'
  | 'siege'
  | 'diplomacy'
  | 'lore';

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

/**
 * Cartographic Boreal & Temperate Forest Clusters for authentic landmass texture.
 */
const MAP_FOREST_CLUSTERS: { lat: number; lon: number; count: number }[] = [
  { lat: 60.5, lon: 11.2, count: 4 },
  { lat: 62.8, lon: 16.2, count: 5 },
  { lat: 58.2, lon: 14.0, count: 3 },
  { lat: 61.5, lon: 25.5, count: 5 },
  { lat: 57.5, lon: 26.8, count: 4 },
  { lat: 55.2, lon: 32.5, count: 5 },
  { lat: 51.8, lon: 28.0, count: 4 },
  { lat: 52.5, lon: 13.5, count: 4 },
  { lat: 49.5, lon: 7.5, count: 4 },
  { lat: 46.8, lon: 1.8, count: 3 },
  { lat: 52.8, lon: -1.8, count: 3 },
  { lat: 56.8, lon: -4.2, count: 3 },
  { lat: 53.2, lon: -7.8, count: 3 },
  { lat: 51.2, lon: -57.2, count: 4 },
  { lat: 41.5, lon: -3.5, count: 3 },
];

/**
 * Decorative Nautical Wave Crests across major seas.
 */
const OCEAN_WAVE_MARKERS: { lat: number; lon: number }[] = [
  { lat: 58.0, lon: 1.5 },
  { lat: 54.5, lon: 4.5 },
  { lat: 63.0, lon: -6.0 },
  { lat: 66.2, lon: 2.0 },
  { lat: 59.5, lon: -16.0 },
  { lat: 51.5, lon: -19.5 },
  { lat: 56.0, lon: -36.0 },
  { lat: 46.0, lon: -12.0 },
  { lat: 37.5, lon: 11.5 },
  { lat: 35.2, lon: 24.5 },
  { lat: 43.5, lon: 32.0 },
  { lat: 57.2, lon: 19.2 },
];

const LABEL_ANCHOR_HINTS: Record<
  string,
  { anchor?: 'start' | 'end' | 'middle'; dx?: number; dy?: number }
> = {
  ribe: { anchor: 'end', dx: -8, dy: 3 },
  jelling: { anchor: 'end', dx: -8, dy: -4 },
  aarhus: { anchor: 'start', dx: 8, dy: -5 },
  odense: { anchor: 'end', dx: -8, dy: 8 },
  hedeby: { anchor: 'start', dx: 8, dy: 9 },
  roskilde: { anchor: 'start', dx: 8, dy: 3 },
  uppsala: { anchor: 'start', dx: 8, dy: -5 },
  sigtuna: { anchor: 'end', dx: -8, dy: -2 },
  birka: { anchor: 'start', dx: 8, dy: 8 },
  skara_gotaland: { anchor: 'end', dx: -8, dy: 2 },
  kalmar_oland: { anchor: 'start', dx: 8, dy: 5 },
  kaupang: { anchor: 'end', dx: -8, dy: 6 },
  tunsberg: { anchor: 'end', dx: -8, dy: -4 },
  oslo: { anchor: 'start', dx: 8, dy: -5 },
  sarpsborg: { anchor: 'start', dx: 8, dy: 6 },
  avaldsnes: { anchor: 'end', dx: -8, dy: 3 },
  giske_more: { anchor: 'end', dx: -8, dy: -3 },
  lade_hladir: { anchor: 'start', dx: 8, dy: 3 },
  nidaros: { anchor: 'start', dx: 8, dy: 3 },
  halogaland_borg: { anchor: 'start', dx: 8, dy: 3 },
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
 * Rich, realistic cartographic miniature node for settlements on the sea chart.
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
            : type === 'monastery'
              ? isLightTheme
                ? '#B45309'
                : '#FBBF24'
              : type === 'capital'
                ? isLightTheme
                  ? '#7C2D12'
                  : '#F59E0B'
                : isKnown
                  ? isLightTheme
                    ? '#334155'
                    : '#94A3B8'
                  : isLightTheme
                    ? '#94A3B8'
                    : '#475569';

  const coreFill = isLightTheme ? '#FFFDF8' : '#0B131E';

  return (
    <g transform={`scale(${scale})`}>
      {/* Pulsing Aura for Current Fleet or Selected Port */}
      {isCurrent && (
        <circle
          cx="0"
          cy="0"
          r="13.5"
          fill="rgba(217, 119, 6, 0.18)"
          stroke={ringColor}
          strokeWidth="1.3"
          strokeDasharray="3 2"
        />
      )}
      {isSelected && !isCurrent && (
        <circle
          cx="0"
          cy="0"
          r="12"
          fill="rgba(2, 132, 199, 0.16)"
          stroke={ringColor}
          strokeWidth="1.2"
        />
      )}
      {playerOwns && !isCurrent && !isSelected && (
        <circle
          cx="0"
          cy="0"
          r="9.2"
          fill="rgba(16, 185, 129, 0.14)"
          stroke={ringColor}
          strokeWidth="1"
        />
      )}

      {/* Architectural Miniature by Settlement Type */}
      {type === 'capital' ? (
        <g>
          <circle
            cx="0"
            cy="0"
            r={isFeatured ? '6.8' : '5.4'}
            fill={coreFill}
            stroke={ringColor}
            strokeWidth="1.9"
          />
          {/* Miniature Crown / Royal Keep */}
          <path
            d="M -3.2 2.2 L -3.2 -1.2 L -1.5 0.4 L 0 -2.4 L 1.5 0.4 L 3.2 -1.2 L 3.2 2.2 Z"
            fill={ringColor}
          />
        </g>
      ) : type === 'monastery' ? (
        <g>
          <circle
            cx="0"
            cy="0"
            r={isFeatured ? '6.2' : '4.8'}
            fill={coreFill}
            stroke={ringColor}
            strokeWidth="1.7"
          />
          {/* Miniature Abbey Cross */}
          <path
            d="M 0 -3.2 L 0 3.2 M -2.4 -0.8 L 2.4 -0.8"
            stroke={ringColor}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </g>
      ) : isFeatured ? (
        <g>
          <circle
            cx="0"
            cy="0"
            r="6.2"
            fill={coreFill}
            stroke={ringColor}
            strokeWidth="2"
          />
          <circle cx="0" cy="0" r="2.6" fill={ringColor} />
        </g>
      ) : (
        <g>
          <circle
            cx="0"
            cy="0"
            r={isMajor ? '4.5' : '3.5'}
            fill={coreFill}
            stroke={ringColor}
            strokeWidth="1.5"
          />
          <circle cx="0" cy="0" r="1.5" fill={ringColor} />
        </g>
      )}

      {/* Miniature Viking Dragon Longship moored at the player's current port */}
      {isCurrent && (
        <g transform="translate(-13, -12)">
          <path
            d="M -5 2 Q 0 5 5 2 L 6 -1 Q 5 -3 4 -2 Q 0 1 -4 -2 Q -5 -3 -6 -1 Z"
            fill="#92400E"
            stroke="#FDE68A"
            strokeWidth="0.6"
          />
          <path d="M 0 1 L 0 -6" stroke="#FDE68A" strokeWidth="0.8" />
          <path
            d="M -3.2 -5.2 Q 0 -6.2 3.2 -5.2 L 2.8 -1 Q 0 -1.6 -2.8 -1 Z"
            fill="#DC2626"
            stroke="#FEF3C7"
            strokeWidth="0.55"
          />
        </g>
      )}
    </g>
  );
}

interface SettlementForceData {
  localGarrison: number;
  activeWarband: number;
  totalGuards: number;
  snekkjas: number;
  drakkars: number;
  knarrs: number;
  totalShips: number;
  dominantShipType: 'drakkar' | 'snekkja' | 'knarr';
  warhorses: number;
  packHorses: number;
  totalHorses: number;
  warGearTier: number;
  totalStrength: number;
  hasAnyForces: boolean;
}

/**
 * Distinct miniature SVG silhouettes for map badges and fleet-at-sea:
 * - Snekkja: slim low hull
 * - Drakkar: dragon-prow high stem
 * - Knarr: broad deep cargo hull
 */
function MapHullSilhouetteSvg({
  shipType,
  strokeColor,
}: {
  shipType: 'drakkar' | 'snekkja' | 'knarr';
  strokeColor: string;
}) {
  if (shipType === 'snekkja') {
    return (
      <g
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M -4.2 1.2 C -2.2 2.4 2.2 2.4 4.2 1.2 L 4.8 0.1 L -4.8 0.1 Z" />
        <path d="M 0 -2.6 L 0 0.2" />
        <path d="M -1.8 -2.0 L 1.8 -2.0 L 1.4 -0.4 L -1.4 -0.4 Z" />
      </g>
    );
  }
  if (shipType === 'knarr') {
    return (
      <g
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M -3.8 0.3 C -3.8 2.6 -1.8 3.3 0 3.3 C 1.8 3.3 3.8 2.6 3.8 0.3 L 4.3 -0.7 C 2.4 -0.2 -2.4 -0.2 -4.3 -0.7 Z" />
        <path d="M 0 -3.2 L 0 0.2" />
        <path d="M -2.3 -2.3 C -0.8 -2.8 0.8 -2.8 2.3 -2.3 L 1.9 -0.5 L -1.9 -0.5 Z" />
      </g>
    );
  }
  // Drakkar (high dragon-prow stem)
  return (
    <g
      fill="none"
      stroke={strokeColor}
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M -3.8 1.4 C -1.8 2.6 1.8 2.6 3.8 1.4 C 4.6 0.6 4.9 -0.9 4.5 -2.5 C 4.3 -3.2 3.6 -3.4 3.2 -2.9 L 3.8 -1.8 C 3.5 -0.8 2.9 0 1.9 0.1 L -2.1 0.1 C -3.1 0 -3.6 -1.0 -3.5 -2.2" />
      <path d="M 0 -3.2 L 0 0.3" />
      <path d="M -2.1 -2.2 L 2.1 -2.2 L 1.7 -0.4 L -1.7 -0.4 Z" />
    </g>
  );
}

/**
 * Memoized Settlement Force Badge Cluster with 3-tier Level of Detail (LOD)
 * and automatic label-collision avoidance (always placed opposite the label anchor/dy).
 */
const SettlementForceBadgeCluster = memo(function SettlementForceBadgeCluster({
  forces,
  zoom,
  isSelected,
  playerOwns,
  isCurrent,
  labelAnchor,
  labelDy,
  isLightTheme,
}: {
  forces: SettlementForceData;
  zoom: number;
  isSelected: boolean;
  playerOwns: boolean;
  isCurrent: boolean;
  labelAnchor: 'start' | 'middle' | 'end';
  labelDy: number;
  isLightTheme: boolean;
}) {
  if (!forces.hasAnyForces) return null;

  const invScale = 1 / Math.sqrt(zoom);
  // Nudge badge away from the settlement name:
  // If label is above the node (labelDy < 0), place badge below (+15);
  // Otherwise place badge above (-15) and nudged opposite horizontal labelAnchor.
  const placeBelow = labelDy < -1;
  const nudgeX = labelAnchor === 'start' ? -7.5 : 7.5;
  const nudgeY = placeBelow ? 14.5 : -14.5;

  // LOD Tier 1: Zoomed out (zoom < 1.38) -> tiny dot + total strength number only
  // LOD Tier 2: Mid zoom (1.38 <= zoom < 2.05) -> badge cluster for selected, owned, and current-port only
  // LOD Tier 3: Zoomed in (zoom >= 2.05) -> full badge cluster with silhouettes
  const isLowZoom = zoom < 1.38;
  const isMidZoom = zoom >= 1.38 && zoom < 2.05;
  const showFullCluster =
    !isLowZoom && (zoom >= 2.05 || isSelected || playerOwns || isCurrent);

  const bgFill = isLightTheme ? 'rgba(253, 250, 243, 0.95)' : 'rgba(10, 19, 32, 0.94)';
  const textFill = isLightTheme ? '#18130E' : '#F8FAFC';
  const dividerStroke = isLightTheme ? '#D6C8B0' : '#23364C';
  const strokeBorder = isCurrent
    ? isLightTheme
      ? '#B45309'
      : '#F59E0B'
    : isSelected
      ? isLightTheme
        ? '#0369A1'
        : '#38BDF8'
      : isLightTheme
        ? '#047857'
        : '#34D399';

  if (!showFullCluster) {
    const pillText = `${forces.totalStrength}`;
    const pillW = Math.max(18, 11 + pillText.length * 4.8);
    return (
      <g
        transform={`translate(${nudgeX * invScale}, ${nudgeY * invScale}) scale(${invScale})`}
        className="pointer-events-none select-none"
      >
        <rect
          x={-pillW / 2}
          y={-5.5}
          width={pillW}
          height={11}
          rx={5.5}
          fill={bgFill}
          stroke={strokeBorder}
          strokeWidth="0.95"
        />
        <circle
          cx={-pillW / 2 + 4.5}
          cy={0}
          r={2}
          fill={strokeBorder}
        />
        <text
          x={2.2}
          y={0.5}
          textAnchor="middle"
          dominantBaseline="central"
          fill={textFill}
          fontSize="7.4"
          fontWeight="800"
          className="font-mono"
        >
          {pillText}
        </text>
      </g>
    );
  }

  // Full / Mid cluster pills: Shield+Guards, Ship+Ships (if >0), Horse+Mounts (if >0)
  const segments: {
    key: string;
    kind: 'shield' | 'ship' | 'horse';
    count: number;
    color: string;
  }[] = [];

  if (forces.totalGuards > 0) {
    segments.push({
      key: 'guards',
      kind: 'shield',
      count: forces.totalGuards,
      color: isCurrent
        ? isLightTheme
          ? '#B45309'
          : '#FBBF24'
        : isLightTheme
          ? '#047857'
          : '#34D399',
    });
  }
  if (forces.totalShips > 0) {
    const shipColor =
      forces.dominantShipType === 'drakkar'
        ? isLightTheme
          ? '#0369A1'
          : '#38BDF8'
        : forces.dominantShipType === 'snekkja'
          ? isLightTheme
            ? '#0E7490'
            : '#22D3EE'
          : isLightTheme
            ? '#047857'
            : '#34D399';
    segments.push({
      key: 'ships',
      kind: 'ship',
      count: forces.totalShips,
      color: shipColor,
    });
  }
  if (forces.totalHorses > 0 && (!isMidZoom || isCurrent || isSelected)) {
    segments.push({
      key: 'horses',
      kind: 'horse',
      count: forces.totalHorses,
      color: isLightTheme ? '#B45309' : '#F59E0B',
    });
  }

  const segWidth = 22;
  const totalW = segments.length * segWidth + 4;
  const startX = -totalW / 2 + segWidth / 2 + 2;

  return (
    <g
      transform={`translate(${nudgeX * invScale}, ${nudgeY * invScale}) scale(${invScale})`}
      className="pointer-events-none select-none"
    >
      <rect
        x={-totalW / 2}
        y={-6.8}
        width={totalW}
        height={13.6}
        rx={6.8}
        fill={bgFill}
        stroke={strokeBorder}
        strokeWidth="1.05"
      />
      {segments.map((seg, idx) => {
        const cx = startX + idx * segWidth;
        return (
          <g key={seg.key} transform={`translate(${cx}, 0)`}>
            {idx > 0 && (
              <line
                x1={-segWidth / 2}
                y1={-4.2}
                x2={-segWidth / 2}
                y2={4.2}
                stroke={dividerStroke}
                strokeWidth="0.8"
              />
            )}
            <g transform="translate(-4.8, 0)">
              {seg.kind === 'shield' && (
                <path
                  d="M 0 -3.5 L 3.1 -2.1 L 3.1 0.5 C 3.1 2.4 1.7 3.7 0 4.3 C -1.7 3.7 -3.1 2.4 -3.1 0.5 L -3.1 -2.1 Z"
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="1.25"
                  strokeLinejoin="round"
                />
              )}
              {seg.kind === 'ship' && (
                <MapHullSilhouetteSvg
                  shipType={forces.dominantShipType}
                  strokeColor={seg.color}
                />
              )}
              {seg.kind === 'horse' && (
                <path
                  d="M -2.4 3.5 L -2.4 0.5 L -3.2 -1.2 L -1.8 -3.4 L 0.6 -3.8 L 2.5 -2.6 L 3.1 -0.6 L 0.8 0.4 L 0.4 1.8 L 2.0 3.5 Z"
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              )}
            </g>
            <text
              x={3.6}
              y={0.5}
              textAnchor="middle"
              dominantBaseline="central"
              fill={textFill}
              fontSize="7.4"
              fontWeight="800"
              className="font-mono"
            >
              {seg.count}
            </text>
          </g>
        );
      })}
    </g>
  );
});

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
  const forcesUi = MAP_FORCES_UI[lang];

  const [selectedId, setSelectedId] = useState<string>(state.character.locationId);
  const [activeLens, setActiveLens] = useState<MapLensId>('all');
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [activeSheetTab, setActiveSheetTab] = useState<SheetTabId>('assets');
  const [showUnexplored, setShowUnexplored] = useState<boolean>(false);
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(false);
  const [legendSection, setLegendSection] = useState<
    'all' | 'settlements' | 'forces' | 'weather'
  >('all');
  const [isForcesDrawerOpen, setIsForcesDrawerOpen] = useState<boolean>(false);
  const [isSeaFleetCardOpen, setIsSeaFleetCardOpen] = useState<boolean>(false);
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

  const viewHeight = MAP_BOUNDS.height / zoom;
  const viewWidth = viewHeight / Math.max(0.35, canvasAspect);
  const viewBoxStr = `${center.x - viewWidth / 2} ${center.y - viewHeight / 2} ${viewWidth} ${viewHeight}`;

  const resolvedSelectedId = resolveActiveSettlementId(selectedId, state.year);
  const inspected: Settlement = SETTLEMENTS_BY_ID[resolvedSelectedId] ?? currentLoc;
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
        return <Wind className={`${className} text-accent-emerald`} />;
      case Season.Summer:
        return <Sun className={`${className} text-accent-amber`} />;
      case Season.Autumn:
        return <CloudRain className={`${className} text-accent-ice`} />;
      case Season.Winter:
        return <Snowflake className={`${className} text-accent-ice`} />;
    }
  };

  const isDiscovered =
    state.discoveredSettlements.includes(inspected.id) || showUnexplored;

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

  const baseNorsePop = inspected.norsePopulation ?? 150;
  const baseNativePop = inspected.nativePopulation ?? 850;
  const baseTotalPop = baseNorsePop + baseNativePop;
  const norsePct =
    cityHolding?.norsePopulationShare ?? Math.round((baseNorsePop / baseTotalPop) * 100);

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

  // Single source of truth for per-settlement military forces
  const settlementForcesById = useMemo<Record<string, SettlementForceData>>(() => {
    const map: Record<string, SettlementForceData> = {};
    const snekkjasPool = state.realm.snekkjas ?? 0;
    const drakkarsPool = Math.max(0, state.realm.longships - snekkjasPool);
    const knarrsPool = state.realm.knarrs;
    const warhorsesPool = state.realm.warhorses ?? 0;
    const packHorsesPool = state.realm.packHorses ?? 0;
    const warGearPool = state.realm.warGearTier ?? 0;
    const dominantShip: 'drakkar' | 'snekkja' | 'knarr' =
      drakkarsPool > 0 ? 'drakkar' : snekkjasPool > 0 ? 'snekkja' : 'knarr';

    for (const s of SETTLEMENTS) {
      const holding = state.realm.holdings.find((h) => h.settlementId === s.id);
      const isHeld = Boolean(holding && holding.farms > 0);
      const isCurrentPort = s.id === currentLoc.id;

      const localGarrison = isHeld ? (holding?.garrison ?? 4) : 0;
      const activeWarband = isCurrentPort ? state.realm.hirdWarriors : 0;
      const totalGuards = localGarrison + activeWarband;

      const snekkjas = isCurrentPort ? snekkjasPool : 0;
      const drakkars = isCurrentPort ? drakkarsPool : 0;
      const knarrs = isCurrentPort ? knarrsPool : 0;
      const totalShips = snekkjas + drakkars + knarrs;

      const warhorses = isCurrentPort ? warhorsesPool : 0;
      const packHorses = isCurrentPort ? packHorsesPool : 0;
      const totalHorses = warhorses + packHorses;
      const warGearTier = isCurrentPort ? warGearPool : 0;

      const totalStrength = totalGuards + totalShips + totalHorses;
      map[s.id] = {
        localGarrison,
        activeWarband,
        totalGuards,
        snekkjas,
        drakkars,
        knarrs,
        totalShips,
        dominantShipType: dominantShip,
        warhorses,
        packHorses,
        totalHorses,
        warGearTier,
        totalStrength,
        hasAnyForces: totalStrength > 0,
      };
    }
    return map;
  }, [
    state.realm.holdings,
    state.realm.hirdWarriors,
    state.realm.longships,
    state.realm.snekkjas,
    state.realm.knarrs,
    state.realm.warhorses,
    state.realm.packHorses,
    state.realm.warGearTier,
    currentLoc.id,
  ]);

  const inspectedForces = settlementForcesById[inspected.id] ?? {
    localGarrison: 0,
    activeWarband: 0,
    totalGuards: 0,
    snekkjas: 0,
    drakkars: 0,
    knarrs: 0,
    totalShips: 0,
    dominantShipType: 'drakkar' as const,
    warhorses: 0,
    packHorses: 0,
    totalHorses: 0,
    warGearTier: 0,
    totalStrength: 0,
    hasAnyForces: false,
  };

  // Detailed unit/ship/mount items stationed at the currently inspected settlement,
  // reading directly from MILITARY_CATALOG_BY_ID
  const inspectedForceItems = useMemo(() => {
    const isCurrentPort = inspected.id === currentLoc.id;
    const bondiCount = state.realm.bondiSpearmen ?? 0;
    const archersCount = state.realm.norseArchers ?? 0;
    const berserkersCount = state.realm.berserkers ?? 0;
    const huscarlsCount = Math.max(
      0,
      state.realm.hirdWarriors - bondiCount - archersCount - berserkersCount
    );

    const warriors: { id: MilitaryCatalogItemId; count: number; displayCount: string }[] = [];
    if (inspectedForces.localGarrison > 0) {
      warriors.push({
        id: 'local_garrison',
        count: inspectedForces.localGarrison,
        displayCount: `×${inspectedForces.localGarrison}`,
      });
    }
    if (isCurrentPort) {
      if (huscarlsCount > 0) {
        warriors.push({
          id: 'sworn_huscarls',
          count: huscarlsCount,
          displayCount: `×${huscarlsCount}`,
        });
      }
      if (bondiCount > 0) {
        warriors.push({
          id: 'bondi_spearmen',
          count: bondiCount,
          displayCount: `×${bondiCount}`,
        });
      }
      if (archersCount > 0) {
        warriors.push({
          id: 'norse_archers',
          count: archersCount,
          displayCount: `×${archersCount}`,
        });
      }
      if (berserkersCount > 0) {
        warriors.push({
          id: 'berserkers',
          count: berserkersCount,
          displayCount: `×${berserkersCount}`,
        });
      }
    }

    const fleet: { id: MilitaryCatalogItemId; count: number; displayCount: string }[] = [];
    if (isCurrentPort) {
      if (inspectedForces.drakkars > 0) {
        fleet.push({
          id: 'drakkar',
          count: inspectedForces.drakkars,
          displayCount: `×${inspectedForces.drakkars}`,
        });
      }
      if (inspectedForces.snekkjas > 0) {
        fleet.push({
          id: 'snekkja',
          count: inspectedForces.snekkjas,
          displayCount: `×${inspectedForces.snekkjas}`,
        });
      }
      if (inspectedForces.knarrs > 0) {
        fleet.push({
          id: 'knarr',
          count: inspectedForces.knarrs,
          displayCount: `×${inspectedForces.knarrs}`,
        });
      }
    }

    const stables: { id: MilitaryCatalogItemId; count: number; displayCount: string }[] = [];
    if (isCurrentPort) {
      if (inspectedForces.warhorses > 0) {
        stables.push({
          id: 'warhorses',
          count: inspectedForces.warhorses,
          displayCount: `×${inspectedForces.warhorses}`,
        });
      }
      if (inspectedForces.packHorses > 0) {
        stables.push({
          id: 'pack_horses',
          count: inspectedForces.packHorses,
          displayCount: `×${inspectedForces.packHorses}`,
        });
      }
      if (inspectedForces.warGearTier > 0) {
        stables.push({
          id: 'war_gear',
          count: inspectedForces.warGearTier,
          displayCount: isFa
            ? `سطح ${inspectedForces.warGearTier}`
            : `Lv.${inspectedForces.warGearTier}`,
        });
      }
    }

    return { warriors, fleet, stables };
  }, [
    inspected.id,
    currentLoc.id,
    inspectedForces,
    state.realm.bondiSpearmen,
    state.realm.norseArchers,
    state.realm.berserkers,
    state.realm.hirdWarriors,
    isFa,
  ]);

  const matchesLens = (s: Settlement): boolean => {
    if (activeLens === 'all') return true;
    if (activeLens === 'forces') {
      return Boolean(settlementForcesById[s.id]?.hasAnyForces);
    }
    if (activeLens === 'owned') {
      const owned = state.realm.holdings.some((h) => h.settlementId === s.id && h.farms > 0);
      const trib = (state.tributaries ?? []).includes(s.id);
      return owned || trib || s.id === currentLoc.id;
    }
    if (activeLens === 'loot') {
      return s.settlementType === 'monastery' || s.baseWealth >= 7;
    }
    if (activeLens === 'trade') {
      return (
        s.settlementType === 'trading_post' ||
        s.settlementType === 'capital' ||
        s.baseWealth >= 8
      );
    }
    return true;
  };

  const activeSettlements = useMemo(
    () =>
      SETTLEMENTS.filter(
        (s) => isSettlementActiveInYear(s, state.year) || s.id === currentLoc.id
      ),
    [state.year, currentLoc.id]
  );

  const navigablePorts = useMemo(() => {
    const filtered = activeSettlements.filter(
      (s) =>
        (state.discoveredSettlements.includes(s.id) ||
          showUnexplored ||
          s.id === currentLoc.id) &&
        matchesLens(s)
    );
    return filtered.length > 0 ? filtered : activeSettlements;
  }, [
    activeSettlements,
    state.discoveredSettlements,
    showUnexplored,
    currentLoc.id,
    activeLens,
    state.realm.holdings,
    settlementForcesById,
  ]);

  const handleCyclePort = (dir: -1 | 1) => {
    if (navigablePorts.length === 0) return;
    const idx = navigablePorts.findIndex((p) => p.id === inspected.id);
    const nextIdx =
      idx === -1 ? 0 : (idx + dir + navigablePorts.length) % navigablePorts.length;
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
      desc: isFa
        ? 'شبیخون غافلگیرانه در مه، تکیه بر زیرکی'
        : 'Stealth landing in coastal mist, relying on Cunning',
      tag: isFa ? 'زیرکی' : 'Cunning',
    },
    {
      value: 'shield_wall',
      label: isFa ? 'دیوار سپرها' : 'Shield-Wall',
      desc: isFa
        ? 'نبرد منظم و سنگین، محافظت در برابر تلفات'
        : 'Disciplined clash of wood and iron, best defense',
      tag: isFa ? 'قدرت' : 'Strength',
    },
    {
      value: 'ransom',
      label: isFa ? 'محاصره و باج‌خواهی' : 'Hostage Ransom',
      desc: isFa
        ? 'گرفتن اسیران اشرافی برای نقره بیشتر بدون تلفات'
        : 'Capture nobles and demand high silver tribute',
      tag: isFa ? 'دیپلماسی' : 'Diplomacy',
    },
    {
      value: 'feigned_retreat',
      label: isFa ? 'عقب‌نشینی ساختگی' : 'Feigned Retreat',
      desc: isFa
        ? 'فریب مدافعان به دشت باز با تغییر تاکتیک ناگهانی'
        : 'Lure garrison into an open beach ambush',
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
  // Midpoint on quadratic bezier (t = 0.5) for the route waypoint ship icon
  const bezierMidX = 0.25 * currentPt.x + 0.5 * midX + 0.25 * targetPt.x;
  const bezierMidY = 0.25 * currentPt.y + 0.5 * midY + 0.25 * targetPt.y;
  // Tangent angle along quadratic Bezier at t = 0.5 is P2 - P0
  const courseAngleDeg = (Math.atan2(dyArc, dxArc) * 180) / Math.PI;
  const isLightTheme = (state.settings.theme ?? 'light') === 'light';

  const currentPortForces = settlementForcesById[currentLoc.id];
  const fleetSealiftCapacity =
    (currentPortForces?.drakkars ?? 0) * 30 + (currentPortForces?.snekkjas ?? 0) * 20;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.965 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full h-full max-h-dvh flex flex-col bg-surface-canvas overflow-hidden select-none"
    >
      {/* ================================================================= */}
      {/* MINIMAL FLOATING CORNER CONTROLS                                  */}
      {/* ================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-2.5 inset-x-2.5 sm:inset-x-3.5 z-30 flex flex-col gap-1.5 pointer-events-none"
      >
        <div className="flex items-center justify-end gap-2">
          <div className="pointer-events-auto flex items-center gap-0.5 p-1 rounded-xl bg-surface-elevated/90 backdrop-blur-md border border-border-subtle shadow-sm shrink-0">
            <button
              type="button"
              onClick={handleResetToFleet}
              title={isFa ? 'تمرکز روی ناوگان شما' : 'Center on Your Fleet'}
              aria-label={isFa ? 'موقعیت ناوگان' : 'Your Fleet'}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-accent-amber hover:bg-surface-secondary transition-colors cursor-pointer"
            >
              <LocateFixed className="w-3.5 h-3.5 shrink-0" />
            </button>
            <button
              type="button"
              onClick={() => applyZoom(zoom + 0.35)}
              aria-label={isFa ? 'بزرگ‌نمایی' : 'Zoom In'}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-primary hover:bg-surface-secondary transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyZoom(zoom - 0.35)}
              aria-label={isFa ? 'کوچک‌نمایی' : 'Zoom Out'}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-primary hover:bg-surface-secondary transition-colors cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-surface-interactive mx-0.5" />
            {/* 1-Tap Quick Lens Toggle for "نیروها / Forces" */}
            <button
              type="button"
              onClick={() =>
                setActiveLens((prev) => (prev === 'forces' ? 'all' : 'forces'))
              }
              aria-pressed={activeLens === 'forces'}
              title={forcesUi.lensTooltip}
              className={`min-h-[28px] px-2 py-0.5 rounded-lg inline-flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer ${
                activeLens === 'forces'
                  ? 'bg-gold-500 text-nordic-950'
                  : 'text-ink-secondary hover:text-white hover:bg-surface-secondary'
              }`}
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span>{forcesUi.lensLabel}</span>
            </button>
            <div className="w-px h-4 bg-surface-interactive mx-0.5" />
            <button
              type="button"
              onClick={() => setIsLegendOpen((prev) => !prev)}
              aria-expanded={isLegendOpen}
              title={isFa ? 'فیلترها، آب‌وهوا و راهنمای نقشه' : 'Filters, Weather & Map Legend'}
              className={`min-h-[28px] px-2 py-0.5 rounded-lg inline-flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                isLegendOpen || activeLens !== 'all'
                  ? 'bg-surface-ice-tint text-accent-ice'
                  : 'text-ink-secondary hover:text-white hover:bg-surface-secondary'
              }`}
            >
              {renderSeasonIcon(state.season, 'w-3.5 h-3.5 shrink-0')}
              <span className="font-bold text-ink-primary">
                {SEASON_LABELS[lang][state.season]}
              </span>
              <Info className="w-3.5 h-3.5 text-accent-ice shrink-0" />
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* FLOATING SEA FLEET MINI-CARD (WHEN SEA VESSEL MARKER IS TAPPED)   */}
        {/* ================================================================= */}
        <AnimatePresence>
          {isSeaFleetCardOpen && inspected.id !== currentLoc.id && hasShips && (
            <motion.div
              key="sea-fleet-mini-card"
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto self-end w-[min(21rem,calc(100vw-1.25rem))] rounded-2xl bg-surface-elevated/95 backdrop-blur-md border border-status-ice/50 shadow-[0_14px_34px_rgba(0,0,0,0.85)] p-3 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-status-ice/15 border border-status-ice/35 text-accent-ice flex items-center justify-center shrink-0">
                    <MilitaryUnitGlyph
                      type={currentPortForces?.dominantShipType ?? 'drakkar'}
                      className="w-4 h-4"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-ink-primary truncate">
                      {forcesUi.seaFleetTitle}
                    </div>
                    <div className="text-[10px] text-accent-ice truncate">
                      {forcesUi.seaFleetDestination}: {inspectedDisplayName} ({voyage.sailingDays}
                      {isFa ? ' روز' : 'd'} · {voyage.dangerPct}% {isFa ? 'خطر' : 'risk'})
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSeaFleetCardOpen(false)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-ink-muted hover:text-white hover:bg-surface-secondary cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {(currentPortForces?.drakkars ?? 0) > 0 && (
                  <span className="px-2 py-0.5 rounded-lg bg-surface-secondary border border-border-subtle text-[11px] font-mono text-accent-ice inline-flex items-center gap-1">
                    <MilitaryUnitGlyph type="drakkar" className="w-3.5 h-3.5" />
                    <span>
                      {MILITARY_CATALOG_BY_ID.drakkar[lang].shortName} ×{currentPortForces.drakkars}
                    </span>
                  </span>
                )}
                {(currentPortForces?.snekkjas ?? 0) > 0 && (
                  <span className="px-2 py-0.5 rounded-lg bg-surface-secondary border border-border-subtle text-[11px] font-mono text-accent-ice inline-flex items-center gap-1">
                    <MilitaryUnitGlyph type="snekkja" className="w-3.5 h-3.5" />
                    <span>
                      {MILITARY_CATALOG_BY_ID.snekkja[lang].shortName} ×{currentPortForces.snekkjas}
                    </span>
                  </span>
                )}
                {(currentPortForces?.knarrs ?? 0) > 0 && (
                  <span className="px-2 py-0.5 rounded-lg bg-surface-secondary border border-border-subtle text-[11px] font-mono text-accent-emerald inline-flex items-center gap-1">
                    <MilitaryUnitGlyph type="knarr" className="w-3.5 h-3.5" />
                    <span>
                      {MILITARY_CATALOG_BY_ID.knarr[lang].shortName} ×{currentPortForces.knarrs}
                    </span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2 rounded-xl bg-surface-secondary border border-border-subtle">
                  <div className="text-[10px] text-ink-muted">{forcesUi.seaFleetCrewCap}</div>
                  <div className="font-mono font-bold text-ink-primary mt-0.5">
                    {state.realm.hirdWarriors} / {fleetSealiftCapacity}{' '}
                    {isFa ? 'جنگجو' : 'men'}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-surface-secondary border border-border-subtle">
                  <div className="text-[10px] text-ink-muted">{forcesUi.seaFleetActiveEffect}</div>
                  <div className="font-mono font-bold text-accent-emerald mt-0.5">
                    {isFa
                      ? `دریانوردی ${effectiveSeamanship} · سود +${state.realm.knarrs * 18}٪`
                      : `Sail ${effectiveSeamanship} · +${state.realm.knarrs * 18}% Trade`}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================================================================= */}
        {/* FLOATING LEGEND, FILTERS & WEATHER PANEL                          */}
        {/* ================================================================= */}
        <AnimatePresence>
          {isLegendOpen && (
            <motion.div
              key="map-legend-panel"
              initial={{ opacity: 0, scale: 0.95, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto self-end w-[min(23rem,calc(100vw-1.25rem))] max-h-[calc(100dvh-15rem)] flex flex-col overflow-hidden rounded-2xl bg-surface-elevated/95 backdrop-blur-md border border-border-subtle shadow-[0_18px_42px_rgba(0,0,0,0.88)]"
            >
              <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border-subtle shrink-0">
                <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-surface-secondary border border-border-subtle">
                  {(
                    [
                      { id: 'all', fa: 'همه', en: 'All' },
                      { id: 'forces', fa: 'نیروها', en: 'Forces' },
                      { id: 'settlements', fa: 'بنادر', en: 'Ports' },
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
                            ? 'bg-surface-interactive text-accent-ice'
                            : 'text-ink-muted hover:text-ink-primary'
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
                        ? 'bg-status-ice/20 text-accent-ice'
                        : 'text-ink-muted hover:text-ink-primary'
                    }`}
                  >
                    <Eye className="w-3 h-3 shrink-0" />
                    <span>
                      {showUnexplored
                        ? isFa
                          ? 'همه بنادر'
                          : 'All'
                        : isFa
                          ? 'مه دریا'
                          : 'Fog'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLegendOpen(false)}
                    aria-label={isFa ? 'بستن راهنما' : 'Close Legend'}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-ink-muted hover:text-white hover:bg-surface-secondary transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Port Lens Filter Strip */}
              <div className="px-3 py-2 border-b border-border-subtle flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
                {(
                  [
                    { id: 'all', fa: 'همه بنادر', en: 'All Ports' },
                    { id: 'forces', fa: 'نیروها', en: 'Forces' },
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
                          ? 'bg-gold-500 text-nordic-950 font-bold'
                          : 'bg-surface-secondary text-ink-muted hover:text-ink-primary'
                      }`}
                    >
                      {isFa ? lens.fa : lens.en}
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 text-xs">
                {(legendSection === 'all' || legendSection === 'forces') && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-accent-amber">
                        {forcesUi.legendForcesHeader}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveLens(activeLens === 'forces' ? 'all' : 'forces')
                        }
                        className="text-[10px] text-accent-ice hover:underline cursor-pointer"
                      >
                        {activeLens === 'forces'
                          ? isFa
                            ? 'نمایش همه بنادر'
                            : 'Show all ports'
                          : isFa
                            ? 'فیلتر نیروها'
                            : 'Filter forces'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                      {[
                        {
                          type: 'local_garrison' as const,
                          color: 'text-accent-emerald border-status-emerald/35 bg-status-emerald/10',
                          label: forcesUi.legendGarrison,
                        },
                        {
                          type: 'drakkar' as const,
                          color: 'text-accent-ice border-status-ice/35 bg-status-ice/10',
                          label: forcesUi.legendDrakkar,
                        },
                        {
                          type: 'snekkja' as const,
                          color: 'text-accent-ice border-status-ice/35 bg-status-ice/10',
                          label: forcesUi.legendSnekkja,
                        },
                        {
                          type: 'knarr' as const,
                          color: 'text-accent-emerald border-status-emerald/35 bg-status-emerald/10',
                          label: forcesUi.legendKnarr,
                        },
                        {
                          type: 'warhorses' as const,
                          color: 'text-accent-amber border-gold-500/35 bg-gold-500/10',
                          label: forcesUi.legendHorses,
                        },
                      ].map((item) => (
                        <div
                          key={item.type}
                          className="p-2 rounded-xl bg-surface-secondary border border-border-subtle flex items-center gap-2.5"
                        >
                          <div
                            className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${item.color}`}
                          >
                            <MilitaryUnitGlyph type={item.type} className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-semibold text-ink-primary">
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(legendSection === 'all' || legendSection === 'settlements') && (
                  <div
                    className={
                      legendSection === 'all'
                        ? 'pt-2.5 border-t border-border-subtle space-y-2'
                        : 'space-y-2'
                    }
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-ink-muted">
                        {isFa ? 'نمادها و نوع سکونتگاه‌ها' : 'Settlement Types & Roles'}
                      </span>
                      <span className="text-[10px] text-ink-muted">
                        {isFa ? 'کلیک برای فیلتر' : 'Click to filter'}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveLens(activeLens === 'loot' ? 'all' : 'loot')}
                        className={`w-full p-2 rounded-xl border text-start flex items-center gap-2.5 transition-colors cursor-pointer ${
                          activeLens === 'loot'
                            ? 'bg-surface-amber-tint border-gold-500/60'
                            : 'bg-surface-secondary border-border-subtle hover:border-border-strong'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-gold-500/15 border border-gold-500/40 flex items-center justify-center shrink-0">
                          <Church className="w-3.5 h-3.5 text-accent-amber" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-ink-primary text-[11px]">
                              {isFa ? 'صومعه مقدس (Monastery)' : 'Holy Monastery'}
                            </span>
                            <span className="text-[10px] font-mono text-accent-amber">
                              {isFa ? 'غنیمت زرین · دفاع کم' : 'High Loot · Low Def'}
                            </span>
                          </div>
                          <p className="text-[10px] text-ink-muted truncate">
                            {isFa
                              ? 'صندوق‌های نقره و عتیقه؛ بهترین هدف برای شبیخون سریع دریایی'
                              : 'Rich silver reliquaries with weak guards; prime raid target'}
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveLens(activeLens === 'trade' ? 'all' : 'trade')}
                        className="w-full p-2 rounded-xl bg-surface-secondary border border-border-subtle hover:border-border-strong text-start flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-lg bg-gold-500/15 border border-gold-500/40 flex items-center justify-center shrink-0">
                          <Crown className="w-3.5 h-3.5 text-accent-amber" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-ink-primary text-[11px]">
                              {isFa ? 'پایتخت پادشاهی (Capital)' : 'Royal Capital'}
                            </span>
                            <span className="text-[10px] font-mono text-accent-amber">
                              {isFa ? 'ثروت بالا · دیپلماسی' : 'High Wealth · Court'}
                            </span>
                          </div>
                          <p className="text-[10px] text-ink-muted truncate">
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
                            ? 'bg-surface-emerald-tint border-status-emerald/60'
                            : 'bg-surface-secondary border-border-subtle hover:border-border-strong'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-status-emerald/15 border border-status-emerald/40 flex items-center justify-center shrink-0">
                          <Landmark className="w-3.5 h-3.5 text-accent-emerald" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-ink-primary text-[11px]">
                              {isFa ? 'اقامتگاه یارل و شهرک (Jarldom / Town)' : 'Jarldom Seat & Town'}
                            </span>
                            <span className="text-[10px] font-mono text-accent-emerald">
                              {isFa ? 'اسکان و ساخت بنا' : 'Settle & Build'}
                            </span>
                          </div>
                          <p className="text-[10px] text-ink-muted truncate">
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
                        ? 'pt-2.5 border-t border-border-subtle space-y-2'
                        : 'space-y-2'
                    }
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-ink-muted">
                        {isFa ? 'تأثیر فصل و آب‌وهوا بر دریانوردی' : 'Seasonal Weather & Sea Impact'}
                      </span>
                      <span className="text-[10px] font-mono tabular-nums text-accent-ice">
                        {isFa
                          ? `مهارت دریانوردی: ${effectiveSeamanship}`
                          : `Seamanship: ${effectiveSeamanship}`}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-surface-secondary border border-border-subtle space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 font-bold text-ink-primary text-xs">
                          {renderSeasonIcon(state.season, 'w-4 h-4')}
                          <span>
                            {SEASON_LABELS[lang][state.season]} — {currentWeather.weatherName}
                          </span>
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold tabular-nums px-1.5 py-0.5 rounded ${
                            state.season === Season.Summer
                              ? 'bg-status-emerald/20 text-accent-emerald'
                              : state.season === Season.Winter
                                ? 'bg-blood-500/20 text-accent-crimson'
                                : 'bg-gold-500/20 text-accent-amber'
                          }`}
                        >
                          {currentWeather.seaEffectShort}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-secondary leading-relaxed">
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
                                ? 'bg-surface-ice-tint border-status-ice/60 text-ink-primary'
                                : 'bg-surface-secondary border-border-subtle text-ink-muted'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span className="inline-flex items-center gap-1 text-ink-primary">
                                {renderSeasonIcon(s, 'w-3 h-3')}
                                <span>{SEASON_LABELS[lang][s]}</span>
                              </span>
                            </div>
                            <div className="font-mono tabular-nums text-[10px] flex items-center justify-between mt-0.5">
                              <span
                                className={
                                  prof.riskPenaltyPct === 0
                                    ? 'text-accent-emerald'
                                    : prof.riskPenaltyPct >= 25
                                      ? 'text-accent-crimson'
                                      : 'text-accent-amber'
                                }
                              >
                                {isFa
                                  ? `خطر +${prof.riskPenaltyPct}%`
                                  : `+${prof.riskPenaltyPct}% Risk`}
                              </span>
                              <span className="text-ink-secondary">
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
      {/* INTERACTIVE FULL-HEIGHT REALISTIC VECTOR MAP SVG STAGE            */}
      {/* ================================================================= */}
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex-1 min-h-0 w-full overflow-hidden bg-surface-ice-tint cursor-grab active:cursor-grabbing"
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
            <radialGradient id="nordicOceanGrad" cx="48%" cy="40%" r="72%">
              <stop offset="0%" stopColor={isLightTheme ? '#D4EAF7' : '#112640'} />
              <stop offset="48%" stopColor={isLightTheme ? '#B6D8EE' : '#0A192B'} />
              <stop offset="100%" stopColor={isLightTheme ? '#8CB7D6' : '#050C15'} />
            </radialGradient>
            <linearGradient id="landTerrainGrad" x1="12%" y1="0%" x2="88%" y2="100%">
              <stop offset="0%" stopColor={isLightTheme ? '#E6DBC2' : '#1B2F46'} />
              <stop offset="45%" stopColor={isLightTheme ? '#F1E8D6' : '#17283C'} />
              <stop offset="100%" stopColor={isLightTheme ? '#DFD0B2' : '#122031'} />
            </linearGradient>
            <linearGradient id="highlandSnowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isLightTheme ? '#FFFFFF' : '#64748B'} />
              <stop offset="100%" stopColor={isLightTheme ? '#DFD1B8' : '#1E324A'} />
            </linearGradient>
          </defs>

          {/* 1. Realistic Bathymetric Sea Canvas */}
          <rect
            x={-600}
            y={-600}
            width={MAP_BOUNDS.width + 1200}
            height={MAP_BOUNDS.height + 1200}
            fill="url(#nordicOceanGrad)"
          />

          {/* 2. Subtle Cartographic Latitude/Longitude Graticules & Rhumb Lines */}
          {[-45, -30, -15, 0, 15, 30, 45].map((lon) => {
            const { x } = projectLatLon(0, lon);
            return (
              <line
                key={`lon_${lon}`}
                x1={x}
                y1={-500}
                x2={x}
                y2={MAP_BOUNDS.height + 500}
                stroke={isLightTheme ? '#6B9DBB' : '#152C47'}
                strokeOpacity={isLightTheme ? '0.22' : '0.42'}
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
                stroke={isLightTheme ? '#6B9DBB' : '#152C47'}
                strokeOpacity={isLightTheme ? '0.22' : '0.42'}
                strokeWidth={0.65 / zoom}
                strokeDasharray="3 3"
              />
            );
          })}

          {/* 3. Decorative Ocean Swells & Wave Crests */}
          <g className="pointer-events-none" opacity={isLightTheme ? '0.32' : '0.22'}>
            {OCEAN_WAVE_MARKERS.map((wv, i) => {
              const { x, y } = projectLatLon(wv.lat, wv.lon);
              return (
                <g key={`wave_${i}`} transform={`translate(${x}, ${y})`}>
                  <path
                    d="M -14 0 Q -10 -2.5 -6 0 T 2 0 T 10 0 M -9 3.5 Q -5 1.5 -1 3.5 T 7 3.5"
                    fill="none"
                    stroke={isLightTheme ? '#2C5E82' : '#38BDF8'}
                    strokeWidth={0.9 / Math.sqrt(zoom)}
                    strokeLinecap="round"
                  />
                </g>
              );
            })}
          </g>

          {/* 4. Ornate 16-Point Nautical Sun-Compass Rose in the North Atlantic */}
          <g
            transform={`translate(${projectLatLon(48.5, -27.5).x}, ${projectLatLon(48.5, -27.5).y})`}
            opacity={isLightTheme ? '0.32' : '0.22'}
            className="pointer-events-none"
          >
            {/* radiating rhumb lines */}
            {[0, 30, 60, 90, 120, 150].map((deg) => (
              <line
                key={`rhumb_${deg}`}
                x1="-220"
                y1="0"
                x2="220"
                y2="0"
                transform={`rotate(${deg})`}
                stroke={isLightTheme ? '#334155' : '#38BDF8'}
                strokeWidth="0.35"
                strokeOpacity="0.45"
                strokeDasharray="4 6"
              />
            ))}
            <circle cx="0" cy="0" r="42" fill="none" stroke={isLightTheme ? '#334155' : '#38BDF8'} strokeWidth="0.85" />
            <circle cx="0" cy="0" r="34" fill="none" stroke={isLightTheme ? '#334155' : '#38BDF8'} strokeWidth="0.5" strokeDasharray="2 2" />
            <circle cx="0" cy="0" r="18" fill="none" stroke={isLightTheme ? '#334155' : '#38BDF8'} strokeWidth="0.5" />
            <path
              d="M 0 -46 L 4.5 -6 L 46 0 L 4.5 6 L 0 46 L -4.5 6 L -46 0 L -4.5 -6 Z"
              fill={isLightTheme ? '#334155' : '#38BDF8'}
            />
            <path
              d="M 0 -30 L 3 -4 L 30 0 L 3 4 L 0 30 L -3 4 L -30 0 L -3 -4 Z"
              transform="rotate(45)"
              fill={isLightTheme ? '#64748B' : '#F59E0B'}
              opacity="0.75"
            />
          </g>

          {/* 5. High-Resolution Landmass Polygons with Multi-Stage Coastal Bathymetry & Relief */}
          {LANDMASS_POLYGONS.map((poly) => {
            const pathD = pointsToSmoothSvgPath(poly.coords, true, 0.18);
            return (
              <g key={poly.id}>
                {/* Outer Continental Shelf Shallow Water Glow */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isLightTheme ? '#C2E4F5' : '#122D4A'}
                  strokeOpacity={isLightTheme ? '0.82' : '0.68'}
                  strokeWidth={10.5 / Math.sqrt(zoom)}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {/* Middle Coastal Shoal Contour */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isLightTheme ? '#A3CFE8' : '#193C60'}
                  strokeOpacity={isLightTheme ? '0.88' : '0.78'}
                  strokeWidth={4.5 / Math.sqrt(zoom)}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {/* Main Topographic Landmass Body */}
                <path
                  d={pathD}
                  fill="url(#landTerrainGrad)"
                  stroke={isLightTheme ? '#6E5A42' : '#3B5F87'}
                  strokeWidth={1.35 / Math.sqrt(zoom)}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {/* Warm Sunlit Inner Coastal Rim Highlight */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isLightTheme ? '#FDF9F0' : '#294566'}
                  strokeOpacity={isLightTheme ? '0.75' : '0.52'}
                  strokeWidth={0.75 / Math.sqrt(zoom)}
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

          {/* 6. Major Inland Seas & Lakes */}
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

          {/* 7. Smaller Archipelago Islands */}
          {['kirkwall', 'shetland', 'faroes', 'isle_of_man', 'iona'].map((islId) => {
            const s = SETTLEMENTS_BY_ID[islId];
            if (!s) return null;
            const { x, y } = projectLatLon(s.lat, s.lon);
            return (
              <g key={`isl_${islId}`}>
                <ellipse
                  cx={x}
                  cy={y}
                  rx={6.2}
                  ry={4.0}
                  fill="none"
                  stroke={isLightTheme ? '#BEE0F2' : '#122D4A'}
                  strokeWidth={3.4 / Math.sqrt(zoom)}
                />
                <ellipse
                  cx={x}
                  cy={y}
                  rx={5.4}
                  ry={3.5}
                  fill={isLightTheme ? '#ECE2CE' : '#1B2F46'}
                  stroke={isLightTheme ? '#6E5A42' : '#3B5F87'}
                  strokeWidth={1.0 / Math.sqrt(zoom)}
                />
              </g>
            );
          })}

          {/* 8. Boreal & Temperate Forest Clusters */}
          <g className="pointer-events-none select-none" opacity={isLightTheme ? '0.62' : '0.48'}>
            {MAP_FOREST_CLUSTERS.map((fc, idx) => {
              const { x, y } = projectLatLon(fc.lat, fc.lon);
              const s = 2.8 / Math.sqrt(zoom);
              const offsets = [
                [0, 0],
                [-4.2, 2.2],
                [4.2, 1.8],
                [-2.2, -3.2],
                [2.8, -2.6],
              ].slice(0, fc.count);

              return (
                <g key={`forest_${idx}`} transform={`translate(${x}, ${y})`}>
                  {offsets.map(([ox, oy], ti) => (
                    <g
                      key={ti}
                      transform={`translate(${ox / Math.sqrt(zoom)}, ${oy / Math.sqrt(zoom)})`}
                    >
                      <path
                        d={`M 0 ${-s * 1.4} L ${-s} ${s * 0.6} L ${s} ${s * 0.6} Z`}
                        fill={isLightTheme ? '#5E7A52' : '#1E463A'}
                        stroke={isLightTheme ? '#3F5636' : '#2D6A56'}
                        strokeWidth={0.45 / Math.sqrt(zoom)}
                        strokeLinejoin="round"
                      />
                    </g>
                  ))}
                </g>
              );
            })}
          </g>

          {/* 9. 3D Shaded Topographic Mountain Ridges & Snow-Capped Peaks */}
          <g className="pointer-events-none select-none">
            {MOUNTAIN_RANGES.map((range) => {
              const pts = range.coords.map(([lat, lon]) => projectLatLon(lat, lon));
              const spineD = pointsToSmoothSvgPath(range.coords, false, 0.22);
              return (
                <g key={range.id}>
                  {/* Highland Elevation Base Shadow */}
                  <path
                    d={spineD}
                    fill="none"
                    stroke={isLightTheme ? '#C4B293' : '#0D1724'}
                    strokeOpacity={isLightTheme ? '0.52' : '0.6'}
                    strokeWidth={8.5 / Math.sqrt(zoom)}
                    strokeLinecap="round"
                  />
                  {/* Individual Shaded Peaks */}
                  {pts.map((pt, idx) => {
                    const s = (idx % 2 === 0 ? 4.8 : 3.6) / Math.sqrt(zoom);
                    return (
                      <g key={`${range.id}_pk_${idx}`} transform={`translate(${pt.x}, ${pt.y})`}>
                        {/* Sunlit Western Slope */}
                        <path
                          d={`M ${-s * 1.4} ${s * 0.78} L 0 ${-s * 1.05} L ${s * 1.4} ${s * 0.78} Z`}
                          fill="url(#highlandSnowGrad)"
                          stroke={isLightTheme ? '#7D684E' : '#4B6F96'}
                          strokeWidth={0.85 / Math.sqrt(zoom)}
                          strokeLinejoin="round"
                        />
                        {/* Shaded Eastern Slope */}
                        <path
                          d={`M 0 ${-s * 1.05} L ${s * 0.28} ${s * 0.78} L ${s * 1.4} ${s * 0.78} Z`}
                          fill={isLightTheme ? '#A89374' : '#0E1B2A'}
                          opacity="0.52"
                        />
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </g>

          {/* 10. Smooth Organic Navigable River Systems */}
          {NAVIGABLE_RIVERS.map((riv) => (
            <path
              key={riv.name}
              d={pointsToSmoothSvgPath(riv.coords, false, 0.22)}
              fill="none"
              stroke={isLightTheme ? '#3B82B6' : '#2563EB'}
              strokeOpacity={isLightTheme ? '0.72' : '0.65'}
              strokeWidth={1.65 / Math.sqrt(zoom)}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* 11. Subtle Nautical Sea & Ocean Labels */}
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
                  fill={isLightTheme ? '#28587B' : '#60A5FA'}
                  opacity={isLightTheme ? 0.46 : 0.32}
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

          {/* 12. Faded Classic Cartographic Country / Realm Names */}
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
                  fill={isLightTheme ? '#54402B' : '#94A3B8'}
                  opacity={isLightTheme ? 0.42 : 0.32}
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

          {/* 13. Curved Sea Course from Current Port to Selected Port + Interactive Fleet at Sea */}
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
                strokeOpacity="0.22"
                strokeWidth={5.5 / Math.sqrt(zoom)}
                strokeLinecap="round"
                className="pointer-events-none"
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
                strokeWidth={2.0 / Math.sqrt(zoom)}
                strokeDasharray="4.5 3.5"
                strokeLinecap="round"
                className="pointer-events-none"
              />
              {/* Mid-route Fleet at Sea Silhouette + Subtle Wake Line (Tappable) */}
              {(() => {
                const angleDeg = courseAngleDeg;
                const flipY = Math.abs(angleDeg) > 90 ? -1 : 1;
                const flagshipType: 'drakkar' | 'snekkja' | 'knarr' =
                  currentPortForces?.dominantShipType ?? 'drakkar';
                const totalFleetShips = currentPortForces?.totalShips ?? 0;
                const strokeCol =
                  voyage.dangerPct >= 35
                    ? '#EF4444'
                    : flagshipType === 'drakkar'
                      ? '#F59E0B'
                      : flagshipType === 'knarr'
                        ? '#34D399'
                        : '#38BDF8';

                return (
                  <g
                    transform={`translate(${bezierMidX}, ${bezierMidY}) scale(${1 / Math.sqrt(zoom)})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!dragRef.current.moved) {
                        setIsSeaFleetCardOpen((v) => !v);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {/* Generous Tap Hitbox */}
                    <circle cx="0" cy="0" r="16" fill="transparent" />
                    {/* Subtle Wake Line trailing behind the hull */}
                    <g transform={`rotate(${angleDeg}) scale(1, ${flipY})`}>
                      <path
                        d="M -17 -2.4 Q -11 -0.9 -6.5 -0.6 M -19 0 L -7 0 M -17 2.4 Q -11 0.9 -6.5 0.6"
                        fill="none"
                        stroke={isLightTheme ? '#0284C7' : '#7DD3FC'}
                        strokeWidth="1.15"
                        strokeLinecap="round"
                        opacity="0.78"
                      />
                    </g>
                    {/* Medallion Plate */}
                    <circle
                      cx="0"
                      cy="0"
                      r="9.2"
                      fill={isLightTheme ? '#FAF3E4' : '#0B131E'}
                      stroke={strokeCol}
                      strokeWidth="1.45"
                    />
                    {/* Oriented Hull Silhouette */}
                    <g transform={`rotate(${angleDeg}) scale(0.95, ${0.95 * flipY})`}>
                      <MapHullSilhouetteSvg shipType={flagshipType} strokeColor={strokeCol} />
                    </g>
                    {/* Total Ships Counter Pip */}
                    {totalFleetShips > 0 && (
                      <g transform="translate(7.5, -7.5)">
                        <circle
                          cx="0"
                          cy="0"
                          r="5"
                          fill={strokeCol}
                          stroke={isLightTheme ? '#FAF3E4' : '#0B131E'}
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="1.8"
                          textAnchor="middle"
                          fill="#0B1118"
                          fontSize="5.8"
                          fontWeight="800"
                          className="font-mono select-none"
                        >
                          {totalFleetShips}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })()}
            </g>
          )}

          {/* 14. World Settlements */}
          {activeSettlements.map((s) => {
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
            const forceData = settlementForcesById[s.id];

            const mapPortLabel = isFa
              ? (SETTLEMENTS_FA[s.id]?.name ?? s.name).split(' (')[0]
              : s.name.split(' (')[0];

            const hint = LABEL_ANCHOR_HINTS[s.id];
            const anchor = hint?.anchor ?? 'start';
            const rawDy = hint?.dy ?? 3.5;
            const dx = (hint?.dx ?? 8) / Math.sqrt(zoom);
            const dy = rawDy / Math.sqrt(zoom);

            // When 'forces' lens is active, settlement names stay legible even on dimmed unrelated ports
            const showLabel =
              isCurrent ||
              isSelected ||
              playerOwns ||
              (activeLens === 'forces' && known && (s.settlementType === 'capital' || zoom >= 1.5)) ||
              (known && inLens && (s.settlementType === 'capital' || zoom >= 1.75));

            const markerOpacity =
              inLens || isCurrent || isSelected
                ? 1
                : activeLens === 'forces'
                  ? 0.34
                  : 0.22;

            const activateSettlementNode = () => {
              setSelectedId(s.id);
              if (activeLens === 'forces') {
                setIsForcesDrawerOpen(true);
              } else {
                setActiveSheetTab('assets');
                setIsSheetOpen(true);
              }
            };

            return (
              <g
                key={s.id}
                role="button"
                tabIndex={0}
                aria-label={`${mapPortLabel} (${s.norseName})`}
                transform={`translate(${x}, ${y})`}
                opacity={markerOpacity}
                onClick={() => {
                  if (!dragRef.current.moved) {
                    activateSettlementNode();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    activateSettlementNode();
                  }
                }}
                className="cursor-pointer transition-opacity focus:outline-none focus-visible:opacity-100"
              >
                <circle cx="0" cy="0" r={22 / Math.sqrt(zoom)} fill="transparent" />

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

                {/* Settlement Force Badge Cluster (held settlements and current port only) */}
                {forceData?.hasAnyForces && (
                  <SettlementForceBadgeCluster
                    forces={forceData}
                    zoom={zoom}
                    isSelected={isSelected}
                    playerOwns={playerOwns}
                    isCurrent={isCurrent}
                    isLightTheme={isLightTheme}
                    labelAnchor={anchor}
                    labelDy={rawDy}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* ================================================================= */}
        {/* SLEEK BOTTOM PORT CARD WITH "FORCES HERE" CHIP ROW & DRAWER       */}
        {/* ================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.34, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-2.5 inset-x-2.5 sm:inset-x-3.5 z-30 pointer-events-none"
        >
          <div className="pointer-events-auto rounded-2xl bg-surface-elevated/94 backdrop-blur-md border border-border-subtle shadow-[0_12px_32px_rgba(0,0,0,0.65)] px-3 py-2.5 flex flex-col gap-2">
            {/* Line 1: Port Emblem, Name, Quick Summary & Cycle Arrows */}
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
                      ? 'bg-gold-500/20 text-accent-amber ring-1 ring-gold-500/40'
                      : isHeldByPlayer
                        ? 'bg-status-emerald/20 text-accent-emerald ring-1 ring-status-emerald/40'
                        : isFortifiedEnemyCity
                          ? 'bg-blood-500/15 text-accent-crimson ring-1 ring-blood-500/35'
                          : 'bg-status-ice/15 text-accent-ice ring-1 ring-status-ice/35'
                  }`}
                >
                  {inspected.settlementType === 'monastery' ? (
                    <Church className="w-4 h-4 text-accent-amber" />
                  ) : inspected.settlementType === 'capital' ? (
                    <Crown className="w-4 h-4 text-accent-amber" />
                  ) : isFortifiedEnemyCity ? (
                    <Castle className="w-4 h-4" />
                  ) : (
                    <Anchor className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0 flex-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <h3 className="text-sm sm:text-base font-bold text-ink-primary group-hover:text-accent-amber transition-colors truncate">
                    {inspectedDisplayName}
                  </h3>
                  <span className="text-[11px] font-mono tabular-nums text-ink-muted truncate">
                    {isHeldByPlayer ? (
                      <span className="font-sans font-semibold text-accent-emerald">
                        {isFa
                          ? `${cityHolding?.farms ?? 0} مزرعه · وفاداری ${cityLoyalty}%`
                          : `${cityHolding?.farms ?? 0} Farms · Loyalty ${cityLoyalty}%`}
                      </span>
                    ) : inspected.id === currentLoc.id ? (
                      <span className="font-sans font-semibold text-accent-amber">
                        {isFa ? 'لنگرگاه شما' : 'Current Port'}
                      </span>
                    ) : (
                      <span className="text-accent-ice">
                        {isFa
                          ? `${voyage.sailingDays} روز راه · خطر ${voyage.dangerPct}%`
                          : `${voyage.sailingDays}d sail · ${voyage.dangerPct}% risk`}
                      </span>
                    )}
                    {' · '}
                    <span className="text-accent-amber">
                      {isFa
                        ? `ثروت ${isDiscovered ? inspected.baseWealth : '?'}`
                        : `W ${isDiscovered ? inspected.baseWealth : '?'}`}
                    </span>
                    {' · '}
                    <span className="text-ink-secondary">
                      {isFa
                        ? `دفاع ${isDiscovered ? inspected.baseDefense : '?'}`
                        : `D ${isDiscovered ? inspected.baseDefense : '?'}`}
                    </span>
                  </span>
                </div>
              </button>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCyclePort(-1)}
                  aria-label={isFa ? 'بندر قبلی' : 'Previous Port'}
                  className="w-7 h-7 rounded-lg bg-surface-secondary hover:bg-surface-interactive border border-border-subtle flex items-center justify-center text-ink-secondary hover:text-ink-primary cursor-pointer transition-colors"
                >
                  {isFa ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronLeft className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleCyclePort(1)}
                  aria-label={isFa ? 'بندر بعدی' : 'Next Port'}
                  className="w-7 h-7 rounded-lg bg-surface-secondary hover:bg-surface-interactive border border-border-subtle flex items-center justify-center text-ink-secondary hover:text-ink-primary cursor-pointer transition-colors"
                >
                  {isFa ? (
                    <ChevronLeft className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Line 1.5: "Forces here" One-Line Chip Row (Under the stats line) */}
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => setIsForcesDrawerOpen((v) => !v)}
                className={`w-full min-h-[34px] px-2.5 py-1 rounded-xl border text-[11px] flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                  inspectedForces.hasAnyForces
                    ? isForcesDrawerOpen
                      ? 'bg-surface-ice-tint border-gold-500/55 text-ink-primary'
                      : 'bg-surface-secondary hover:bg-surface-interactive border-border-subtle text-ink-secondary'
                    : 'bg-surface-card hover:bg-surface-secondary border-border-subtle text-ink-muted'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  <span className="font-bold text-accent-amber shrink-0">
                    {forcesUi.lensLabel}:
                  </span>
                  {inspectedForces.hasAnyForces ? (
                    <span className="font-mono tabular-nums truncate text-ink-primary">
                      <span className="text-accent-amber-strong">
                        {forcesUi.guardsChip} × {inspectedForces.totalGuards}
                      </span>
                      <span className="text-ink-muted mx-1.5">·</span>
                      <span className="text-accent-ice">
                        {forcesUi.shipsChip} × {inspectedForces.totalShips}
                      </span>
                      <span className="text-ink-muted mx-1.5">·</span>
                      <span className="text-accent-emerald">
                        {forcesUi.horsesChip} × {inspectedForces.totalHorses}
                      </span>
                    </span>
                  ) : (
                    <span className="truncate text-ink-muted">
                      {forcesUi.noForcesHere}
                    </span>
                  )}
                </div>

                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-ink-muted shrink-0">
                  <span className="hidden sm:inline">
                    {isForcesDrawerOpen ? forcesUi.hideForces : forcesUi.tapToInspectForces}
                  </span>
                  {isForcesDrawerOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-accent-amber" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </span>
              </button>

              {/* Expandable "Forces here" Detailed Unit/Ship/Mount Breakdown */}
              <AnimatePresence initial={false}>
                {isForcesDrawerOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-1.5 pt-2 border-t border-border-subtle max-h-56 overflow-y-auto space-y-2.5 pe-0.5">
                      {/* Honest Location Note */}
                      <div className="flex items-center justify-between gap-2 px-2 py-1 rounded-lg bg-surface-card border border-border-subtle text-[10px] text-ink-muted">
                        <span className="truncate">
                          {inspected.id === currentLoc.id && isHeldByPlayer
                            ? forcesUi.stationedContextCurrentOwned
                            : inspected.id === currentLoc.id
                              ? forcesUi.stationedContextCurrentPort
                              : isHeldByPlayer
                                ? forcesUi.stationedContextHeldGarrison
                                : forcesUi.noForcesHere}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSheetTab('forces');
                            setIsSheetOpen(true);
                          }}
                          className="text-accent-amber hover:underline font-bold shrink-0 cursor-pointer"
                        >
                          {isFa ? 'نمای کامل ←' : 'Full Sheet →'}
                        </button>
                      </div>

                      {inspectedForces.hasAnyForces ? (
                        (['warriors', 'fleet', 'stables'] as const).map((groupKey) => {
                          const groupEntries = inspectedForceItems[groupKey];
                          if (!groupEntries || groupEntries.length === 0) return null;

                          const groupTitle =
                            groupKey === 'warriors'
                              ? forcesUi.groupWarriors
                              : groupKey === 'fleet'
                                ? forcesUi.groupFleet
                                : forcesUi.groupStables;

                          return (
                            <div key={groupKey} className="space-y-1">
                              <div className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted px-1">
                                {groupTitle}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {groupEntries.map(({ id, displayCount }) => {
                                  const item = MILITARY_CATALOG_BY_ID[id];
                                  return (
                                    <div
                                      key={id}
                                      className="p-2 rounded-xl bg-surface-secondary border border-border-subtle flex items-center justify-between gap-2"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-7 h-7 rounded-lg bg-surface-interactive border border-border-strong flex items-center justify-center text-accent-amber shrink-0">
                                          <MilitaryUnitGlyph
                                            type={item.id}
                                            className="w-4 h-4"
                                          />
                                        </div>
                                        <div className="min-w-0">
                                          <div className="text-xs font-bold text-ink-primary truncate">
                                            {item[lang].name}
                                          </div>
                                          <div className="text-[9px] font-mono text-ink-muted truncate">
                                            <bdi dir="ltr">{item.norseName}</bdi>
                                          </div>
                                          <div className="text-[10px] text-accent-emerald font-semibold truncate">
                                            {item[lang].effectText}
                                          </div>
                                        </div>
                                      </div>
                                      <span className="px-2 py-0.5 rounded-lg bg-surface-canvas border border-border-subtle text-xs font-mono font-extrabold text-accent-amber shrink-0">
                                        {displayCount}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-2.5 py-2 rounded-xl bg-surface-card border border-border-subtle text-[11px] text-ink-muted">
                          {forcesUi.noForcesHere}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Line 2: Contextual Actions (Preserved Place & Mobile Tap Targets) */}
            <div className="flex items-center gap-1.5 pt-1.5 border-t border-border-subtle">
              {inspected.id !== currentLoc.id && onSailTo ? (
                <button
                  type="button"
                  disabled={!hasShips || Boolean(used.travel)}
                  onClick={() => onSailTo(inspected.id)}
                  className="flex-1 min-h-[44px] px-2.5 py-1 rounded-xl bg-cta-ice hover:bg-status-ice hover:text-nordic-950 disabled:bg-surface-disabled disabled:text-ink-disabled text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer truncate transition-colors"
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
                  className="flex-1 min-h-[44px] px-2.5 py-1 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:bg-surface-disabled disabled:text-ink-disabled text-nordic-950 text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer truncate transition-colors"
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
                  className="flex-1 min-h-[44px] px-2.5 py-1 rounded-xl bg-blood-600 hover:bg-blood-500 disabled:bg-surface-disabled disabled:text-ink-disabled text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer truncate transition-colors"
                >
                  <Swords className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {used.raid ? (isFa ? 'غارت شد ✓' : 'Raided ✓') : isFa ? 'غارت' : 'Raid'}
                  </span>
                </button>
              ) : onSettle ? (
                <button
                  type="button"
                  disabled={Boolean(used.settle) || state.realm.silver < 30}
                  onClick={() => onSettle(inspected.id)}
                  className="flex-1 min-h-[44px] px-2.5 py-1 rounded-xl bg-status-emerald hover:bg-status-emerald disabled:bg-surface-disabled disabled:text-ink-disabled text-nordic-950 text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer truncate transition-colors"
                >
                  <Landmark className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {used.settle
                      ? isFa
                        ? 'اسکان یافت ✓'
                        : 'Settled ✓'
                      : isFa
                        ? 'اسکان (۳۰ نقره)'
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
                className="min-h-[44px] px-3 py-1 rounded-xl bg-surface-secondary hover:bg-surface-interactive border border-border-subtle text-xs font-bold text-ink-primary inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors"
              >
                <Compass className="w-3.5 h-3.5 text-accent-ice shrink-0" />
                <span>{isFa ? 'جزئیات شهر' : 'City Panel'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ================================================================= */}
      {/* REDESIGNED COHESIVE CITY DETAILS MODAL (NO STARK BLACK BOXES)     */}
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
                ? 'bg-gold-500/20 text-accent-amber ring-1 ring-gold-500/40'
                : isHeldByPlayer
                  ? 'bg-status-emerald/20 text-accent-emerald ring-1 ring-status-emerald/40'
                  : isFortifiedEnemyCity
                    ? 'bg-blood-500/15 text-accent-crimson ring-1 ring-blood-500/35'
                    : 'bg-status-ice/15 text-accent-ice ring-1 ring-status-ice/35'
            }`}
          >
            {inspected.settlementType === 'monastery' ? (
              <Church className="w-6 h-6 text-accent-amber" />
            ) : inspected.settlementType === 'capital' ? (
              <Crown className="w-6 h-6 text-accent-amber" />
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
                className="flex-1 min-h-[46px] px-4 rounded-xl bg-cta-ice hover:bg-status-ice hover:text-nordic-950 disabled:bg-surface-disabled disabled:text-ink-disabled text-white font-extrabold text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
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
              className="min-h-[46px] px-5 rounded-xl bg-surface-interactive hover:bg-surface-interactive border border-border-subtle text-xs font-bold text-ink-secondary hover:text-ink-primary cursor-pointer transition-colors ms-auto"
            >
              {isFa ? 'بستن' : 'Close'}
            </button>
          </div>
        }
      >
        {/* Cohesive 5-Tab City Switcher (Warm Birch Stone in Light Mode / Slate in Dark Mode) */}
        <div className="grid grid-cols-5 gap-1 p-1 rounded-xl bg-surface-secondary border border-border-subtle">
          <button
            type="button"
            onClick={() => setActiveSheetTab('assets')}
            className={`min-h-[38px] px-1.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeSheetTab === 'assets'
                ? 'bg-gold-500 text-nordic-950 shadow-xs'
                : 'text-ink-muted hover:text-ink-primary'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{isFa ? 'دارایی' : 'Estate'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSheetTab('forces')}
            className={`min-h-[38px] px-1.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeSheetTab === 'forces'
                ? 'bg-gold-500 text-nordic-950 shadow-xs'
                : 'text-ink-muted hover:text-ink-primary'
            }`}
          >
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {isFa
                ? `نیروها (${inspectedForces.totalStrength})`
                : `Forces (${inspectedForces.totalStrength})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSheetTab('buildings')}
            className={`min-h-[38px] px-1.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeSheetTab === 'buildings'
                ? 'bg-gold-500 text-nordic-950 shadow-xs'
                : 'text-ink-muted hover:text-ink-primary'
            }`}
          >
            <Hammer className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {isFa
                ? `ساختمان (${cityHolding?.buildings.length ?? 0})`
                : `Builds (${cityHolding?.buildings.length ?? 0})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSheetTab('actions')}
            className={`min-h-[38px] px-1.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeSheetTab === 'actions' ||
              activeSheetTab === 'raid' ||
              activeSheetTab === 'siege' ||
              activeSheetTab === 'diplomacy'
                ? 'bg-gold-500 text-nordic-950 shadow-xs'
                : 'text-ink-muted hover:text-ink-primary'
            }`}
          >
            <Swords className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{isFa ? 'عملیات' : 'Actions'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSheetTab('lore')}
            className={`min-h-[38px] px-1.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeSheetTab === 'lore'
                ? 'bg-gold-500 text-nordic-950 shadow-xs'
                : 'text-ink-muted hover:text-ink-primary'
            }`}
          >
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{isFa ? 'تاریخچه' : 'Lore'}</span>
          </button>
        </div>

        {/* =============================================================== */}
        {/* TAB: FORCES HERE (WARRIORS · FLEET · STABLE & ARMORY)           */}
        {/* =============================================================== */}
        {activeSheetTab === 'forces' && (
          <div className="space-y-3.5">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-card border border-border-subtle space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-amber">
                  <Shield className="w-4 h-4 shrink-0" />
                  <span>{forcesUi.forcesHereTitle}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-lg bg-surface-secondary border border-border-subtle text-[10px] font-mono font-bold text-accent-amber-strong">
                  {forcesUi.guardsChip} × {inspectedForces.totalGuards} · {forcesUi.shipsChip} ×{' '}
                  {inspectedForces.totalShips} · {forcesUi.horsesChip} × {inspectedForces.totalHorses}
                </span>
              </div>

              <p className="text-[11px] text-ink-muted leading-relaxed">
                {inspected.id === currentLoc.id && isHeldByPlayer
                  ? forcesUi.stationedContextCurrentOwned
                  : inspected.id === currentLoc.id
                    ? forcesUi.stationedContextCurrentPort
                    : isHeldByPlayer
                      ? forcesUi.stationedContextHeldGarrison
                      : forcesUi.noForcesHere}
              </p>

              {inspectedForces.hasAnyForces ? (
                <div className="space-y-3">
                  {(['warriors', 'fleet', 'stables'] as const).map((groupKey) => {
                    const groupEntries = inspectedForceItems[groupKey];
                    if (!groupEntries || groupEntries.length === 0) return null;

                    const groupTitle =
                      groupKey === 'warriors'
                        ? forcesUi.groupWarriors
                        : groupKey === 'fleet'
                          ? forcesUi.groupFleet
                          : forcesUi.groupStables;

                    return (
                      <div key={groupKey} className="space-y-2">
                        <div className="text-[11px] font-extrabold text-ink-secondary border-b border-border-subtle pb-1">
                          {groupTitle}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {groupEntries.map(({ id, displayCount }) => {
                            const item = MILITARY_CATALOG_BY_ID[id];
                            return (
                              <div
                                key={id}
                                className="p-2.5 rounded-xl bg-surface-secondary border border-border-subtle flex items-start justify-between gap-2.5"
                              >
                                <div className="flex items-start gap-2.5 min-w-0">
                                  <div className="w-9 h-9 rounded-xl bg-surface-interactive border border-border-strong flex items-center justify-center text-accent-amber shrink-0">
                                    <MilitaryUnitGlyph type={item.id} className="w-5 h-5" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-extrabold text-ink-primary truncate">
                                      {item[lang].name}
                                    </div>
                                    <div className="text-[10px] font-mono text-ink-muted truncate">
                                      <bdi dir="ltr">{item.norseName}</bdi> · {item[lang].role}
                                    </div>
                                    <div className="mt-1 text-[10px] font-bold text-accent-emerald">
                                      {item[lang].effectText}
                                    </div>
                                  </div>
                                </div>
                                <span className="px-2.5 py-1 rounded-lg bg-surface-canvas border border-border-subtle text-xs font-mono font-extrabold text-accent-amber shrink-0">
                                  {displayCount}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle text-xs text-ink-muted">
                  {forcesUi.noForcesHere}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 1: CITY ASSETS, ECONOMY & LOYALTY STATUS                    */}
        {/* =============================================================== */}
        {activeSheetTab === 'assets' && (
          <div className="space-y-3.5">
            {/* 1. City Assets & Dynasty Holdings Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-card border border-border-subtle space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-amber">
                  <Coins className="w-4 h-4 shrink-0" />
                  <span>
                    {isFa ? 'دارایی‌ها و ظرفیت اقتصادی شهر' : 'City Assets & Dynasty Holdings'}
                  </span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${
                    isHeldByPlayer
                      ? 'bg-status-emerald/15 text-accent-emerald border-status-emerald/35'
                      : isTributaryCity
                        ? 'bg-gold-500/15 text-accent-amber border-gold-500/35'
                        : 'bg-surface-secondary text-ink-secondary border-border-subtle'
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

              {/* 4 Key Asset Counters — Warm Cohesive Surfaces */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 rounded-xl bg-surface-secondary border border-border-subtle">
                  <div className="text-[11px] text-ink-muted">
                    {isFa ? 'مزارع شما در شهر' : 'Your Farms'}
                  </div>
                  <div className="text-sm font-mono font-bold text-ink-primary mt-0.5">
                    {isFa
                      ? `${cityHolding?.farms ?? 0} مزرعه`
                      : `${cityHolding?.farms ?? 0} Farms`}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-secondary border border-border-subtle">
                  <div className="text-[11px] text-ink-muted">
                    {isFa ? 'پادگان مستقر' : 'City Garrison'}
                  </div>
                  <div className="text-sm font-mono font-bold text-ink-primary mt-0.5">
                    {isFa
                      ? `${cityHolding?.garrison ?? 0} جنگجو`
                      : `${cityHolding?.garrison ?? 0} Guards`}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-secondary border border-border-subtle">
                  <div className="text-[11px] text-ink-muted">
                    {isFa ? 'ثروت بازار و دفاع' : 'Wealth & Defense'}
                  </div>
                  <div className="text-sm font-mono font-bold text-accent-amber mt-0.5">
                    {isFa
                      ? `ثروت ${inspected.baseWealth} · دفاع ${inspected.baseDefense}`
                      : `W ${inspected.baseWealth} · D ${inspected.baseDefense}`}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-secondary border border-border-subtle">
                  <div className="text-[11px] text-ink-muted">
                    {isFa ? 'عایدی سالانه شما' : 'Annual Yield'}
                  </div>
                  <div className="text-sm font-mono font-bold text-accent-emerald mt-0.5">
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
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border-subtle">
                {cityHolding && onStationGarrison ? (
                  <div className="flex items-center gap-1.5 bg-surface-secondary px-2.5 py-1.5 rounded-xl border border-border-subtle">
                    <Shield className="w-3.5 h-3.5 text-accent-ice shrink-0" />
                    <span className="text-xs font-semibold text-ink-secondary me-1">
                      {isFa ? 'تنظیم پادگان شهر:' : 'Station Garrison:'}
                    </span>
                    <button
                      type="button"
                      disabled={(cityHolding.garrison ?? 0) <= 0}
                      onClick={() => onStationGarrison(inspected.id, -2)}
                      className="w-7 h-7 rounded-lg bg-surface-interactive hover:bg-surface-interactive text-ink-primary flex items-center justify-center cursor-pointer disabled:opacity-35"
                      title={isFa ? 'بازگرداندن ۲ جنگجو به ناوگان' : 'Withdraw 2 warriors'}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-mono font-bold px-1.5 text-ink-primary">
                      {cityHolding.garrison ?? 0}
                    </span>
                    <button
                      type="button"
                      disabled={state.realm.hirdWarriors < 2}
                      onClick={() => onStationGarrison(inspected.id, 2)}
                      className="w-7 h-7 rounded-lg bg-surface-interactive hover:bg-surface-interactive text-accent-emerald flex items-center justify-center cursor-pointer disabled:opacity-35"
                      title={isFa ? 'استقرار ۲ جنگجو از هیرد در شهر' : 'Station 2 warriors'}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-ink-muted">
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
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:bg-surface-disabled disabled:text-ink-disabled text-nordic-950 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
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
            <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-card border border-border-subtle space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-ice">
                  <Shield className="w-4 h-4 shrink-0" />
                  <span>
                    {isFa
                      ? 'وضعیت وفاداری، نظم و حاکمیت شهر'
                      : 'City Loyalty Status & Governance'}
                  </span>
                </div>
                <span className="text-xs text-ink-secondary">
                  {isFa ? 'حاکم محلی: ' : 'Ruler: '}
                  <strong className="text-accent-amber">
                    {cityHolding?.appointedJarl ? (
                      isFa ? (
                        <>
                          {formatPersonName(cityHolding.appointedJarl, 'fa')}{' '}
                          <bdi dir="ltr" className="text-[11px] font-mono font-normal">
                            ({cityHolding.appointedJarl})
                          </bdi>{' '}
                          · یارل منصوب شما
                        </>
                      ) : (
                        `${cityHolding.appointedJarl} (Your Jarl)`
                      )
                    ) : (
                      formatRulerName(controller.ruler, lang)
                    )}
                  </strong>
                </span>
              </div>

              {/* Dual Loyalty & Unrest Progress Bar */}
              <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-ink-primary inline-flex items-center gap-1.5">
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        cityLoyalty >= 70
                          ? 'text-accent-emerald'
                          : cityLoyalty >= 40
                            ? 'text-accent-amber'
                            : 'text-accent-crimson'
                      }`}
                    />
                    <span>
                      {isFa
                        ? `میزان وفاداری شهر: ${cityLoyalty}%`
                        : `City Loyalty: ${cityLoyalty}%`}
                    </span>
                  </span>
                  <span className="font-mono text-[11px] text-ink-muted inline-flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-accent-crimson" />
                    <span>
                      {isFa ? `ناآرامی: ${cityUnrest}%` : `Unrest: ${cityUnrest}%`}
                    </span>
                  </span>
                </div>

                <div className="w-full h-2.5 rounded-full bg-surface-interactive overflow-hidden flex">
                  <div
                    style={{ width: `${cityLoyalty}%` }}
                    className={`h-full transition-all ${
                      cityLoyalty >= 70
                        ? 'bg-status-emerald'
                        : cityLoyalty >= 40
                          ? 'bg-gold-500'
                          : 'bg-blood-500'
                    }`}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-ink-muted">
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
              <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 text-ink-secondary font-semibold">
                    <Users className="w-3.5 h-3.5 text-accent-ice" />
                    <span>{isFa ? 'بافت جمعیتی و آیینی شهر' : 'Population & Faith'}</span>
                  </span>
                  <span className="text-ink-muted font-mono tabular-nums">
                    {isFa
                      ? `نورس ${norsePct}% · بومی ${100 - norsePct}%`
                      : `Norse ${norsePct}% · Native ${100 - norsePct}%`}
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-surface-interactive overflow-hidden flex">
                  <div
                    style={{ width: `${norsePct}%` }}
                    className="bg-gold-500 h-full transition-all"
                  />
                  <div
                    style={{ width: `${100 - norsePct}%` }}
                    className="bg-status-ice/65 h-full transition-all"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-ink-muted">
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

              {/* Cohesive Governance Tools (When Player Holds Estate in City) */}
              {cityHolding && (
                <div className="space-y-2.5 pt-2 border-t border-border-subtle">
                  {onSetTributeBurden && (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-ink-secondary">
                        {isFa ? 'سطح خراج و مالیات شهر:' : 'City Tribute Burden:'}
                      </span>
                      <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-secondary border border-border-subtle">
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
                                  ? 'bg-gold-500 text-nordic-950'
                                  : 'text-ink-muted hover:text-ink-primary'
                              }`}
                            >
                              {isFa ? tb.fa : tb.en}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {onAppointJarl && !cityHolding.appointedJarl && (
                      <button
                        type="button"
                        disabled={state.realm.silver < 20}
                        onClick={() => onAppointJarl(inspected.id)}
                        className="px-3 py-2 rounded-xl bg-surface-secondary hover:bg-surface-ice-tint border border-border-subtle hover:border-gold-500/60 text-xs font-semibold text-ink-primary flex items-center justify-between gap-2 disabled:opacity-40 cursor-pointer transition-colors"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Crown className="w-3.5 h-3.5 text-accent-amber shrink-0" />
                          <span>{isFa ? 'انتصاب یارل وفادار' : 'Appoint Loyal Jarl'}</span>
                        </span>
                        <span className="text-[11px] font-mono text-accent-amber">
                          {isFa ? '۲۰ نقره · +۲۰٪' : '20s · +20%'}
                        </span>
                      </button>
                    )}

                    {onSendSettlers && (
                      <button
                        type="button"
                        disabled={state.realm.silver < 28}
                        onClick={() => onSendSettlers(inspected.id)}
                        className="px-3 py-2 rounded-xl bg-surface-secondary hover:bg-surface-ice-tint border border-border-subtle hover:border-status-ice/60 text-xs font-semibold text-ink-primary flex items-center justify-between gap-2 disabled:opacity-40 cursor-pointer transition-colors"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Ship className="w-3.5 h-3.5 text-accent-ice shrink-0" />
                          <span>{isFa ? 'ارسال مهاجران نورس' : 'Send Norse Settlers'}</span>
                        </span>
                        <span className="text-[11px] font-mono text-accent-ice">
                          {isFa ? '۲۸ نقره · +۱۴٪' : '28s · +14%'}
                        </span>
                      </button>
                    )}

                    {onTakeHostages && (
                      <button
                        type="button"
                        disabled={
                          (cityHolding.garrison ?? 0) < 6 && state.realm.hirdWarriors < 10
                        }
                        onClick={() => onTakeHostages(inspected.id)}
                        className="px-3 py-2 rounded-xl bg-surface-secondary hover:bg-surface-ice-tint border border-border-subtle hover:border-status-ice/60 text-xs font-semibold text-ink-primary flex items-center justify-between gap-2 disabled:opacity-40 cursor-pointer transition-colors"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-accent-ice shrink-0" />
                          <span>{isFa ? 'گرفتن گروگان اشرافی' : 'Take Noble Hostages'}</span>
                        </span>
                        <span className="text-[11px] font-mono text-accent-emerald">
                          {isFa ? '+۱۸٪ وفاداری' : '+18% Loyalty'}
                        </span>
                      </button>
                    )}

                    {onToggleTolerance && (
                      <button
                        type="button"
                        onClick={() => onToggleTolerance(inspected.id)}
                        className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                          cityHolding.religiousTolerance
                            ? 'bg-surface-emerald-tint border-status-emerald/50 text-accent-emerald'
                            : 'bg-surface-secondary border-border-subtle text-ink-secondary hover:text-ink-primary'
                        }`}
                      >
                        <span>
                          {cityHolding.religiousTolerance
                            ? isFa
                              ? 'مدارای آیینی فعال است'
                              : 'Religious Tolerance Active'
                            : isFa
                              ? 'فعالسازی مدارای آیینی'
                              : 'Enable Religious Tolerance'}
                        </span>
                        <span className="text-[11px] font-mono">
                          {cityHolding.religiousTolerance ? '✓' : '+'}
                        </span>
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
            <div className="p-3 rounded-xl bg-surface-card border border-border-subtle flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-ink-secondary">
                  {isFa ? 'بناهای ذاتی شهر:' : 'City Landmarks:'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-surface-secondary border border-border-subtle text-accent-ice font-semibold">
                  {SETTLEMENT_TYPE_LABELS[lang][inspected.settlementType ?? 'town']}
                </span>
                {inspected.isMonastery && (
                  <span className="px-2 py-0.5 rounded-md bg-gold-500/15 text-accent-amber font-semibold">
                    {isFa ? 'صومعه و خزانه مقدس' : 'Holy Monastery'}
                  </span>
                )}
                {inspected.isThingSite && (
                  <span className="px-2 py-0.5 rounded-md bg-status-emerald/15 text-accent-emerald font-semibold">
                    {isFa ? 'میدان مجمع ثینگ (قانون)' : 'Thing Assembly Site'}
                  </span>
                )}
                {inspected.isRiverPort && (
                  <span className="px-2 py-0.5 rounded-md bg-status-ice/15 text-accent-ice font-semibold">
                    {isFa
                      ? `بندر رودخانه‌ای (${inspected.riverName})`
                      : `River Port (${inspected.riverName})`}
                  </span>
                )}
              </div>

              <span className="font-mono text-[11px] text-ink-muted">
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
              <div className="p-3.5 rounded-xl bg-surface-secondary border border-gold-500/45 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
                <div className="text-ink-secondary leading-relaxed">
                  {isFa
                    ? `برای احداث بناهای اختصاصی در ${inspectedDisplayName}، ابتدا یک مزرعه یا اقامتگاه نورس در این شهر تأسیس کنید.`
                    : `To construct Norse buildings in ${inspectedDisplayName}, first establish a farm holding here.`}
                </div>
                {onSettle && (
                  <button
                    type="button"
                    disabled={Boolean(used.settle) || state.realm.silver < 30}
                    onClick={() => onSettle(inspected.id)}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:opacity-40 text-nordic-950 font-extrabold text-xs shrink-0 cursor-pointer"
                  >
                    {isFa ? 'تأسیس مزرعه (۳۰ نقره)' : 'Establish Farm (30s)'}
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {allBuildingKeys.map((bKey) => {
                const bDef = BUILDINGS_CATALOG[bKey];
                const bFa = BUILDINGS_FA[bKey];
                const isBuilt = Boolean(cityHolding?.buildings.includes(bKey));
                const wrongFaith =
                  bDef.religionReq !== undefined &&
                  state.character.religion !== bDef.religionReq;
                const canConstruct =
                  Boolean(cityHolding) &&
                  !isBuilt &&
                  !wrongFaith &&
                  !builtThisYear &&
                  state.realm.silver >= bDef.costSilver;

                return (
                  <div
                    key={bKey}
                    className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-3 ${
                      isBuilt
                        ? 'bg-surface-emerald-tint border-status-emerald/50'
                        : 'bg-surface-secondary border-border-subtle'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs sm:text-sm text-ink-primary">
                          {isFa ? bFa?.name ?? bDef.name : bDef.name}
                        </span>
                        {isBuilt ? (
                          <span className="px-2 py-0.5 rounded-md bg-status-emerald/20 text-accent-emerald text-[10px] font-bold inline-flex items-center gap-1 shrink-0">
                            <Check className="w-3 h-3" />
                            <span>{isFa ? 'ساخته‌شده' : 'Built'}</span>
                          </span>
                        ) : (
                          <span className="text-xs font-mono font-bold text-accent-amber shrink-0">
                            {bDef.costSilver} {isFa ? 'نقره' : 'Silver'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-ink-muted leading-relaxed">
                        {isFa ? bFa?.description ?? bDef.description : bDef.description}
                      </p>
                    </div>

                    {!isBuilt && onBuildHoldingStructure && (
                      <button
                        type="button"
                        disabled={!canConstruct}
                        onClick={() => onBuildHoldingStructure(inspected.id, bKey)}
                        className="w-full min-h-[38px] py-1.5 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:bg-surface-disabled disabled:text-ink-disabled text-xs font-extrabold text-nordic-950 cursor-pointer transition-colors"
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
        {/* TAB 3: UNIFIED, PROFESSIONAL MILITARY & DIPLOMATIC OPERATIONS   */}
        {/* =============================================================== */}
        {(activeSheetTab === 'actions' ||
          activeSheetTab === 'raid' ||
          activeSheetTab === 'siege' ||
          activeSheetTab === 'diplomacy') && (
          <div className="space-y-2.5">
            {/* Operation 1: Trade in Port Market */}
            {onTradeHere && (
              <div className="p-3.5 rounded-2xl bg-surface-secondary border border-border-subtle flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gold-500/15 text-accent-amber border border-gold-500/35 flex items-center justify-center shrink-0">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-ink-primary">
                      {isFa ? 'تجارت و معامله در بازار بندر' : 'Trade in Port Market'}
                    </div>
                    <div className="text-[11px] text-ink-muted mt-0.5">
                      {isFa
                        ? `کسب سود نقره و ارتقای مهارت بازرگانی (ثروت بازار: ${inspected.baseWealth}/10)`
                        : `Earn silver profit & Trade skill (Market Wealth: ${inspected.baseWealth}/10)`}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={Boolean(used.trade) || state.character.age < 15}
                  onClick={() => {
                    onTradeHere();
                    setIsSheetOpen(false);
                  }}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:bg-surface-disabled disabled:text-ink-disabled text-nordic-950 text-xs font-extrabold shrink-0 cursor-pointer transition-colors"
                >
                  {used.trade ? (isFa ? 'انجام شد ✓' : 'Done ✓') : isFa ? 'شروع تجارت' : 'Trade'}
                </button>
              </div>
            )}

            {/* Operation 2: Raid Port / Monastery */}
            {onRaidPort && (
              <div className="p-3.5 rounded-2xl bg-surface-secondary border border-border-subtle space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blood-500/15 text-accent-crimson border border-blood-500/35 flex items-center justify-center shrink-0">
                      <Swords className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-ink-primary">
                        {inspected.settlementType === 'monastery'
                          ? isFa
                            ? 'غارت صومعه و خزانه‌های مقدس'
                            : 'Raid Holy Monastery'
                          : isFa
                            ? 'یورش دریایی و غارت ساحل'
                            : 'Viking Coastal Raid'}
                      </div>
                      <div className="text-[11px] text-ink-muted mt-0.5">
                        {isFa
                          ? `غنیمت نقره و شهرت جنگی · دفاع شهر: ${inspected.baseDefense}/10`
                          : `Plunder silver & battle fame · City Defense: ${inspected.baseDefense}/10`}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={
                      state.character.age < 15 ||
                      state.realm.longships <= 0 ||
                      state.realm.hirdWarriors <= 0 ||
                      Boolean(used.raid)
                    }
                    onClick={() =>
                      setActiveSheetTab(activeSheetTab === 'raid' ? 'actions' : 'raid')
                    }
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-surface-interactive hover:bg-surface-interactive border border-border-subtle disabled:opacity-40 text-xs font-bold text-ink-primary inline-flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                  >
                    <span>
                      {used.raid
                        ? isFa
                          ? 'انجام شد ✓'
                          : 'Used ✓'
                        : isFa
                          ? 'انتخاب تاکتیک'
                          : 'Select Tactic'}
                    </span>
                    {activeSheetTab === 'raid' ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {activeSheetTab === 'raid' && !used.raid && (
                  <div className="pt-2.5 border-t border-border-subtle space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {raidTacticOptions.map((tac) => {
                        const selected = mapTactic === tac.value;
                        return (
                          <button
                            key={tac.value}
                            type="button"
                            onClick={() => setMapTactic(tac.value)}
                            className={`p-2.5 rounded-xl border text-start cursor-pointer transition-colors ${
                              selected
                                ? 'bg-surface-ice-tint border-gold-500 text-ink-primary'
                                : 'bg-surface-card border-border-subtle text-ink-muted hover:text-ink-primary'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs font-bold text-ink-primary">
                              <span>{tac.label}</span>
                              <span className="text-[10px] font-mono text-accent-amber">
                                {tac.tag}
                              </span>
                            </div>
                            <div className="text-[11px] text-ink-muted mt-0.5">{tac.desc}</div>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onRaidPort(inspected.id, mapTactic);
                        setIsSheetOpen(false);
                      }}
                      className="w-full min-h-[42px] bg-blood-600 hover:bg-blood-500 text-white font-extrabold text-xs rounded-xl cursor-pointer transition-colors"
                    >
                      {isFa
                        ? `آغاز یورش به ${inspectedDisplayName}!`
                        : `Launch Raid on ${inspectedDisplayName}!`}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Operation 3: Besiege / Demand Danegeld */}
            {onBesiege && (
              <div className="p-3.5 rounded-2xl bg-surface-secondary border border-border-subtle space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-status-ice/15 text-accent-ice border border-status-ice/35 flex items-center justify-center shrink-0">
                      <Castle className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-ink-primary">
                        {isFa
                          ? 'محاصره نظامی یا مطالبه باج دانگلد'
                          : 'Siege Warfare & Danegeld'}
                      </div>
                      <div className="text-[11px] text-ink-muted mt-0.5">
                        {isFa
                          ? 'یورش به حصار شهر، محاصره دریایی یا اخذ خراج سنگین نقره'
                          : 'Storm walls, naval blockade, or demand heavy Danegeld tribute'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={
                      Boolean(used.raid) ||
                      (state.realm.longships < 1 && state.realm.hirdWarriors < 6)
                    }
                    onClick={() =>
                      setActiveSheetTab(activeSheetTab === 'siege' ? 'actions' : 'siege')
                    }
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-surface-interactive hover:bg-surface-interactive border border-border-subtle disabled:opacity-40 text-xs font-bold text-ink-primary inline-flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                  >
                    <span>
                      {used.raid
                        ? isFa
                          ? 'انجام شد ✓'
                          : 'Used ✓'
                        : isFa
                          ? 'روش محاصره'
                          : 'Approach'}
                    </span>
                    {activeSheetTab === 'siege' ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {activeSheetTab === 'siege' && !used.raid && (
                  <div className="pt-2.5 border-t border-border-subtle space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {(
                        [
                          {
                            id: 'assault',
                            titleFa: 'یورش مستقیم',
                            titleEn: 'Storm Walls',
                            descFa: 'نبرد سنگین و افتخار بالا',
                            descEn: 'High glory & conquest',
                          },
                          {
                            id: 'blockade',
                            titleFa: 'محاصره دریایی',
                            titleEn: 'Naval Blockade',
                            descFa: 'قطع آذوقه و تسلیم بندر',
                            descEn: 'Starve port into tribute',
                          },
                          {
                            id: 'demand_tribute',
                            titleFa: 'باج صلح (دانگلد)',
                            titleEn: 'Danegeld',
                            descFa: 'اخذ نقره با ارعاب سپاه',
                            descEn: 'Silver via intimidation',
                          },
                        ] as const
                      ).map((opt) => {
                        const selected = siegeApproach === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setSiegeApproach(opt.id)}
                            className={`p-2.5 rounded-xl border text-start cursor-pointer transition-colors ${
                              selected
                                ? 'bg-surface-ice-tint border-status-ice text-ink-primary'
                                : 'bg-surface-card border-border-subtle text-ink-muted hover:text-ink-primary'
                            }`}
                          >
                            <div className="text-xs font-bold text-ink-primary">
                              {isFa ? opt.titleFa : opt.titleEn}
                            </div>
                            <div className="text-[10px] text-ink-muted mt-0.5">
                              {isFa ? opt.descFa : opt.descEn}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onBesiege(inspected.id, siegeApproach);
                        setIsSheetOpen(false);
                      }}
                      className="w-full min-h-[42px] bg-cta-ice hover:bg-status-ice hover:text-nordic-950 text-white font-extrabold text-xs rounded-xl cursor-pointer transition-colors"
                    >
                      {isFa
                        ? `اجرای عملیات در ${inspectedDisplayName}`
                        : `Execute Operation at ${inspectedDisplayName}`}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Operation 4: Conquer Fortified City */}
            {isFortifiedEnemyCity && onConquerCity && (
              <div className="p-3.5 rounded-2xl bg-surface-secondary border border-border-subtle flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gold-500/15 text-accent-amber border border-gold-500/35 flex items-center justify-center shrink-0">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-ink-primary">
                      {isFa ? 'لشکرکشی برای فتح کامل دژ' : 'Conquer Fortified Stronghold'}
                    </div>
                    <div className="text-[11px] text-ink-muted mt-0.5">
                      {isFa
                        ? 'نیازمند حداقل ۱ کشتی جنگی و ۱۲ جنگجوی هیرد'
                        : 'Requires at least 1 Longship & 12 Hird Warriors'}
                    </div>
                  </div>
                </div>

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
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-blood-600 hover:bg-blood-500 disabled:bg-surface-disabled disabled:text-ink-disabled text-white text-xs font-bold shrink-0 cursor-pointer transition-colors"
                >
                  {isFa ? 'فتح شهر' : 'Conquer'}
                </button>
              </div>
            )}

            {/* Operation 5: Diplomacy & Varangian Service */}
            {onDiplomacy && (
              <div className="p-3.5 rounded-2xl bg-surface-secondary border border-border-subtle space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-status-emerald/15 text-accent-emerald border border-status-emerald/35 flex items-center justify-center shrink-0">
                      <Handshake className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-ink-primary">
                        {isFa
                          ? 'سفارت دیپلماتیک و پیمان‌های دربار'
                          : 'Diplomatic Envoy & Treaties'}
                      </div>
                      <div className="text-[11px] text-ink-muted mt-0.5">
                        {isFa
                          ? 'پیمان بازرگانی، خراج صلح یا خدمت در گارد امپراتور'
                          : 'Commercial pact, peace tribute, or imperial Varangian service'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={Boolean(used.trade)}
                    onClick={() =>
                      setActiveSheetTab(
                        activeSheetTab === 'diplomacy' ? 'actions' : 'diplomacy'
                      )
                    }
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-surface-interactive hover:bg-surface-interactive border border-border-subtle disabled:opacity-40 text-xs font-bold text-ink-primary inline-flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                  >
                    <span>
                      {used.trade
                        ? isFa
                          ? 'انجام شد ✓'
                          : 'Used ✓'
                        : isFa
                          ? 'گزینه‌ها'
                          : 'Options'}
                    </span>
                    {activeSheetTab === 'diplomacy' ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {activeSheetTab === 'diplomacy' && !used.trade && (
                  <div className="pt-2.5 border-t border-border-subtle space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDiploApproach('trade_pact')}
                        className={`p-2.5 rounded-xl border text-start cursor-pointer transition-colors ${
                          diploApproach === 'trade_pact'
                            ? 'bg-surface-ice-tint border-status-emerald text-ink-primary'
                            : 'bg-surface-card border-border-subtle text-ink-muted hover:text-ink-primary'
                        }`}
                      >
                        <div className="text-xs font-bold text-ink-primary">
                          {isFa ? 'پیمان تجاری' : 'Commercial Treaty'}
                        </div>
                        <div className="text-[10px] text-ink-muted mt-0.5">
                          {isFa ? 'حقوق بازرگانی و درآمد نقره' : 'Trade Route & Silver'}
                        </div>
                      </button>

                      {inspected.id === 'constantinople' ||
                      inspected.id === 'kiev' ||
                      inspected.id === 'novgorod' ? (
                        <button
                          type="button"
                          onClick={() => setDiploApproach('varangian_oath')}
                          className={`p-2.5 rounded-xl border text-start cursor-pointer transition-colors ${
                            diploApproach === 'varangian_oath'
                              ? 'bg-surface-ice-tint border-gold-500 text-ink-primary'
                              : 'bg-surface-card border-border-subtle text-ink-muted hover:text-ink-primary'
                          }`}
                        >
                          <div className="text-xs font-bold text-accent-amber">
                            {isFa ? 'سوگند گارد وارنگیان' : 'Varangian Guard Oath'}
                          </div>
                          <div className="text-[10px] text-ink-secondary mt-0.5">
                            {isFa
                              ? '+۴۵ طلای امپراتور، ابریشم و شهرت'
                              : '+45 Imperial Gold & Trait'}
                          </div>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDiploApproach('tribute_demand')}
                          className={`p-2.5 rounded-xl border text-start cursor-pointer transition-colors ${
                            diploApproach === 'tribute_demand'
                              ? 'bg-surface-ice-tint border-status-emerald text-ink-primary'
                              : 'bg-surface-card border-border-subtle text-ink-muted hover:text-ink-primary'
                          }`}
                        >
                          <div className="text-xs font-bold text-ink-primary">
                            {isFa ? 'تقاضای خراج صلح' : 'Demand Peace Tribute'}
                          </div>
                          <div className="text-[10px] text-ink-muted mt-0.5">
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
                      className="w-full min-h-[42px] bg-status-emerald hover:bg-status-emerald text-nordic-950 font-extrabold text-xs rounded-xl cursor-pointer transition-colors"
                    >
                      {isFa ? 'اعزام سفیر به دربار' : 'Dispatch Envoy to Court'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Operation 6: Marry into Local Noble Family */}
            {onMarryLocal && (
              <div className="p-3.5 rounded-2xl bg-surface-secondary border border-border-subtle flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gold-500/15 text-accent-amber border border-gold-500/35 flex items-center justify-center shrink-0">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-ink-primary">
                      {isFa
                        ? `پیوند زناشویی با خاندان سرشناس ${inspectedDisplayName}`
                        : `Marry into Local Noble House`}
                    </div>
                    <div className="text-[11px] text-ink-muted mt-0.5">
                      {state.relationships.some((r) => r.role === 'Spouse' && r.alive)
                        ? isFa
                          ? 'شما در حال حاضر همسر دارید'
                          : 'You are already married'
                        : isFa
                          ? 'دریافت جهیزیه نقره، تقویت اتحاد و تداوم نسل (هزینه: ۱۶ نقره)'
                          : 'Gain silver dowry, local alliance & heirs (Cost: 16 Silver)'}
                    </div>
                  </div>
                </div>

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
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:bg-surface-disabled disabled:text-ink-disabled text-nordic-950 text-xs font-extrabold shrink-0 cursor-pointer transition-colors"
                >
                  {isFa ? 'خواستگاری' : 'Propose'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 4: VOYAGE METRICS & HISTORICAL LORE                         */}
        {/* =============================================================== */}
        {activeSheetTab === 'lore' && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-surface-secondary border border-border-subtle">
                <div className="text-[11px] text-ink-muted">
                  {isFa ? 'فاصله دریایی' : 'Sea Distance'}
                </div>
                <div className="text-sm font-mono font-bold text-accent-ice mt-0.5">
                  {inspected.id === currentLoc.id
                    ? isFa
                      ? 'لنگرگاه شما'
                      : 'At Port'
                    : `${voyage.nauticalMiles} nm`}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-surface-secondary border border-border-subtle">
                <div className="text-[11px] text-ink-muted">
                  {isFa ? 'مدت دریانوردی' : 'Sailing Time'}
                </div>
                <div className="text-sm font-mono font-bold text-ink-primary mt-0.5">
                  {inspected.id === currentLoc.id
                    ? '—'
                    : isFa
                      ? `${voyage.sailingDays} روز`
                      : `${voyage.sailingDays} days`}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-surface-secondary border border-border-subtle">
                <div className="text-[11px] text-ink-muted">
                  {isFa ? 'آذوقه سفر' : 'Provisions'}
                </div>
                <div className="text-sm font-mono font-bold text-accent-amber mt-0.5">
                  {inspected.id === currentLoc.id
                    ? '—'
                    : `${voyage.provisionSilverCost ?? 0} ${isFa ? 'نقره' : 'Silver'}`}
                </div>
              </div>
            </div>

            {inspected.id !== currentLoc.id && (
              <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle space-y-2 text-xs">
                <div className="flex items-center justify-between text-ink-secondary font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-accent-amber" />
                    <span>{isFa ? 'تفکیک خطرات مسیر دریایی' : 'Voyage Danger Breakdown'}</span>
                  </span>
                  <span className="font-mono text-xs text-accent-crimson">
                    {isFa ? `کل ریسک: ${voyage.dangerPct}%` : `Total: ${voyage.dangerPct}%`}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-ink-muted">
                  <div className="flex items-center gap-1">
                    <CloudRain className="w-3 h-3 text-accent-ice" />
                    <span>
                      {isFa ? 'طوفان:' : 'Storms:'} {voyage.dangerBreakdown?.stormRiskPct ?? 0}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Swords className="w-3 h-3 text-accent-crimson" />
                    <span>
                      {isFa ? 'دزدان:' : 'Pirates:'}{' '}
                      {voyage.dangerBreakdown?.pirateRiskPct ?? 0}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-accent-ice" />
                    <span>
                      {isFa ? 'ناوگان دشمن:' : 'Navies:'}{' '}
                      {voyage.dangerBreakdown?.hostileFleetRiskPct ?? 0}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {inspected.settlementType === 'monastery' && (
              <div className="p-3.5 rounded-xl bg-surface-amber-tint border border-border-amber-subtle flex items-start gap-2.5 text-xs text-ink-primary">
                <Sparkles className="w-4 h-4 text-accent-amber shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-accent-amber">
                    {isFa ? 'هدف غارت ثروتمند (صومعه مقدس)' : 'Rich Holy Raid Target (Monastery)'}
                  </div>
                  <div className="text-[11px] text-ink-secondary mt-0.5 leading-relaxed">
                    {isFa
                      ? 'حاوی جام‌های نقره، کتاب‌های مقدس زرین و صندوق‌های نذورات با دفاع نظامی ضعیف!'
                      : 'Holds gold chalices, silver reliquaries, and jeweled codices with minimal armed resistance!'}
                  </div>
                </div>
              </div>
            )}

            {isDiscovered && (
              <p className="text-xs text-ink-secondary whitespace-normal break-words leading-relaxed bg-surface-secondary p-3.5 rounded-xl border border-border-subtle">
                {isFa
                  ? inspectedFa?.summary ?? inspected.historicalSummary
                  : inspected.historicalSummary}
              </p>
            )}
          </div>
        )}
      </NorseBottomSheet>
    </motion.div>
  );
}
