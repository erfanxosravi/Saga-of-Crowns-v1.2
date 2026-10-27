import { Language, RegionGroup, Religion, Season, Settlement } from '../types/game';

/**
 * MAP PROJECTION & COASTLINE ACCURACY NOTES:
 * - Projection: Equirectangular projection calibrated to 56°N latitude (cos(56°) ≈ 0.559 horizontal compression)
 *   covering longitudes -60°W (Vinland/Labrador) to +22°E (Uppland/Baltic) and latitudes 47.5°N (Loire/Paris)
 *   to 66.5°N (Arctic Circle / Northern Iceland & Helgeland).
 * - SVG Viewport: 1000 x 520 units.
 * - Coastline Polygons: Simplified low-poly vector approximations traced from real lat/lon headland waypoints
 *   so that every settlement's true geographic coordinate sits accurately on its peninsula, fjord, island, or river!
 * - Coordinate Note: In the specification, Wexford was written "52.33N, -6.46E"; historically Wexford (Veisafjörðr)
 *   is in SE Ireland at 52.34°N, 6.46°W (-6.46 longitude), which we use here so it sits accurately on the Irish coast.
 */

export const MAP_BOUNDS = {
  minLon: -64,
  maxLon: 56,
  minLat: 31,
  maxLat: 67.5,
  width: 1300,
  height: 600,
};

export function projectLatLon(lat: number, lon: number): { x: number; y: number } {
  const xRatio = (lon - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon);
  const yRatio = 1 - (lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat);
  return {
    x: Math.round(xRatio * MAP_BOUNDS.width * 10) / 10,
    y: Math.round(yRatio * MAP_BOUNDS.height * 10) / 10,
  };
}

export function pointsToSvgPolygon(coords: [number, number][]): string {
  return coords
    .map(([lat, lon]) => {
      const { x, y } = projectLatLon(lat, lon);
      return `${x},${y}`;
    })
    .join(' ');
}

export function pointsToSvgPath(coords: [number, number][]): string {
  return coords
    .map(([lat, lon], idx) => {
      const { x, y } = projectLatLon(lat, lon);
      return `${idx === 0 ? 'M' : 'L'}${x} ${y}`;
    })
    .join(' ');
}

/**
 * Simplified geographic landmass outlines in [lat, lon] waypoints.
 * Traced from hydrographic headlands to cover the entire Norse known world from Vinland to Baghdad.
 */
export const LANDMASS_POLYGONS: { id: string; name: string; coords: [number, number][] }[] = [
  {
    id: 'scandinavia_peninsula',
    name: 'Scandinavian Peninsula (Norway & Sweden)',
    coords: [
      [55.4, 12.8], [56.1, 15.6], [57.8, 16.7], [59.3, 18.2], [60.6, 17.9],
      [62.4, 17.5], [64.8, 21.2], [65.8, 22.0], [67.4, 21.5], [67.5, 14.5],
      [65.0, 11.8], [63.5, 10.2], [62.2, 5.2], [60.4, 5.0], [58.9, 5.6],
      [58.0, 7.5], [59.1, 10.2], [59.0, 11.2], [57.7, 11.9], [56.3, 12.5],
    ],
  },
  {
    id: 'jutland_denmark',
    name: 'Jutland & Danish Isles',
    coords: [
      [53.9, 8.8], [55.4, 8.4], [57.1, 8.6], [57.7, 10.6], [56.4, 10.9],
      [55.5, 9.8], [54.4, 10.2], [53.9, 9.8],
    ],
  },
  {
    id: 'zealand_funen',
    name: 'Sjælland & Fyn',
    coords: [
      [55.2, 11.0], [56.0, 11.2], [56.0, 12.6], [55.2, 12.4],
    ],
  },
  {
    id: 'gotland_baltic_isle',
    name: 'Gotland (Götland)',
    coords: [
      [57.9, 18.9], [57.7, 19.1], [57.1, 18.4], [57.0, 18.2], [57.4, 18.1], [57.8, 18.4],
    ],
  },
  {
    id: 'continental_europe',
    name: 'Frisia, Frankia, Germany & Central Europe',
    coords: [
      [47.5, -4.5], [48.5, -4.7], [48.7, -1.6], [49.7, -1.9], [49.4, 0.2],
      [50.9, 1.6], [51.9, 4.1], [53.3, 5.2], [53.7, 7.5], [53.9, 8.9],
      [54.1, 11.0], [54.0, 14.5], [54.5, 18.8], [55.5, 21.2], [54.2, 23.5],
      [49.5, 22.0], [47.5, 13.0], [46.0, 8.0], [45.5, 4.5], [43.5, 3.5],
      [43.3, -1.8], [44.8, -1.2], [46.2, -1.3], [47.0, -2.3],
    ],
  },
  {
    id: 'iberian_peninsula',
    name: 'Iberian Peninsula (Al-Andalus, Galicia & Asturias)',
    coords: [
      [43.3, -1.8], [43.6, -5.7], [43.7, -7.9], [42.9, -9.3], [41.2, -8.7],
      [38.7, -9.5], [37.0, -9.0], [36.0, -5.6], [36.7, -4.4], [36.8, -2.5],
      [38.0, -0.6], [40.0, 0.1], [41.4, 2.2], [42.4, 3.2], [42.5, 1.5],
    ],
  },
  {
    id: 'italian_peninsula_sicily',
    name: 'Italian Peninsula & Sicily',
    coords: [
      [44.4, 8.9], [43.8, 10.3], [41.9, 12.3], [40.8, 14.2], [38.2, 15.6],
      [37.0, 15.3], [37.2, 13.5], [38.2, 13.3], [38.2, 15.8], [39.0, 16.5],
      [40.4, 17.2], [41.3, 16.8], [43.6, 13.5], [45.4, 12.3], [45.8, 13.6],
      [45.8, 9.5], [44.8, 7.5],
    ],
  },
  {
    id: 'balkans_greece_byzantium',
    name: 'Balkans, Greece, Miklagard & Anatolia',
    coords: [
      [45.8, 13.6], [43.5, 16.4], [42.0, 19.1], [39.6, 20.0], [38.3, 21.6],
      [36.5, 22.5], [37.8, 23.8], [39.3, 23.0], [40.6, 22.9], [40.9, 24.3],
      [40.8, 27.5], [41.0, 29.0], [42.0, 28.0], [44.2, 28.7], [45.2, 29.7],
      [45.5, 24.0], [45.8, 18.0],
    ],
  },
  {
    id: 'anatolia_minor',
    name: 'Anatolia (Asia Minor / Byzantine Realm)',
    coords: [
      [41.0, 29.0], [42.0, 35.1], [41.5, 38.0], [41.0, 41.5], [38.5, 43.5],
      [36.8, 36.0], [36.5, 34.0], [36.8, 30.6], [37.0, 27.4], [38.4, 27.1],
      [40.2, 26.6],
    ],
  },
  {
    id: 'north_africa_maghreb',
    name: 'North Africa (Maghreb & Ifriqiya)',
    coords: [
      [35.8, -5.9], [35.2, -3.9], [35.9, -0.6], [36.8, 3.0], [37.0, 7.5],
      [37.3, 9.8], [36.8, 10.3], [35.8, 10.6], [34.0, 10.1], [32.8, 13.2],
      [32.0, 20.0], [31.5, 25.0], [31.2, 32.0], [31.0, 34.0], [31.0, -6.0],
    ],
  },
  {
    id: 'eastern_europe_rus',
    name: 'Kievan Rus, River Lands & Volga Basin',
    coords: [
      [54.2, 23.5], [56.8, 24.1], [58.4, 24.5], [59.5, 24.8], [60.0, 28.0],
      [60.0, 32.5], [61.0, 36.0], [61.5, 44.0], [60.0, 52.0], [54.0, 52.0],
      [46.3, 49.0], [45.0, 47.0], [43.5, 47.5], [41.5, 48.5], [37.0, 54.0],
      [36.5, 52.0], [38.0, 48.0], [42.0, 41.5], [43.5, 39.8], [44.5, 37.8],
      [45.3, 36.5], [46.5, 32.2], [45.2, 29.7], [48.0, 24.5], [51.5, 23.8],
    ],
  },
  {
    id: 'mesopotamia_caliphate',
    name: 'Mesopotamia & Serkland (Abbasid Caliphate)',
    coords: [
      [36.8, 36.0], [35.0, 36.0], [33.5, 35.5], [31.5, 34.5], [31.0, 36.0],
      [31.0, 47.5], [33.3, 48.0], [35.5, 46.0], [36.5, 44.0], [38.5, 43.5],
    ],
  },
  {
    id: 'great_britain',
    name: 'Great Britain',
    coords: [
      [50.0, -5.7], [51.2, -4.2], [51.7, -5.2], [52.9, -4.5], [53.4, -3.1],
      [54.8, -3.5], [55.0, -5.1], [56.4, -5.6], [57.5, -6.2], [58.6, -5.0],
      [58.6, -3.1], [57.7, -1.8], [56.0, -2.5], [55.7, -1.8], [54.5, -0.6],
      [53.6, 0.1], [52.9, 1.7], [51.8, 1.4], [51.4, 0.8], [51.2, 1.4],
      [50.7, 0.2], [50.6, -2.4],
    ],
  },
  {
    id: 'ireland',
    name: 'Ireland',
    coords: [
      [51.5, -9.8], [52.1, -10.3], [52.7, -9.7], [53.5, -10.1], [54.3, -9.9],
      [55.3, -7.4], [55.2, -6.1], [54.2, -5.6], [53.3, -6.1], [52.3, -6.4],
      [52.1, -7.1], [51.8, -8.2],
    ],
  },
  {
    id: 'iceland',
    name: 'Iceland (Ísland)',
    coords: [
      [63.4, -19.0], [64.0, -22.7], [64.9, -24.0], [66.4, -22.5], [66.5, -16.0],
      [65.5, -13.6], [64.2, -15.0],
    ],
  },
  {
    id: 'greenland_south',
    name: 'Southern Greenland (Eystribyggð)',
    coords: [
      [66.8, -53.5], [64.1, -51.7], [61.2, -48.2], [59.8, -43.9], [61.5, -42.2],
      [65.6, -37.5], [66.8, -35.0],
    ],
  },
  {
    id: 'vinland_newfoundland',
    name: 'Vinland (Northern Newfoundland & Labrador)',
    coords: [
      [53.5, -60.0], [52.2, -55.7], [51.6, -55.4], [49.5, -53.8], [47.6, -52.7],
      [47.6, -59.3], [50.2, -57.6], [51.4, -57.1], [52.0, -60.0],
    ],
  },
];

export const NAVIGABLE_RIVERS: { name: string; coords: [number, number][] }[] = [
  {
    name: 'Seine',
    coords: [[49.45, 0.15], [49.44, 1.1], [49.1, 1.6], [48.86, 2.35]],
  },
  {
    name: 'Loire',
    coords: [[47.2, -2.1], [47.2, -1.5], [47.3, -0.6], [47.4, 0.7]],
  },
  {
    name: 'Thames',
    coords: [[51.48, 0.85], [51.51, -0.13], [51.6, -1.1]],
  },
  {
    name: 'Humber & Ouse',
    coords: [[53.6, 0.1], [53.7, -0.8], [53.96, -1.08]],
  },
  {
    name: 'Rhine / Lek',
    coords: [[51.9, 4.1], [51.97, 5.34], [51.6, 6.4]],
  },
  {
    name: 'Guadalquivir',
    coords: [[36.8, -6.3], [37.38, -5.99], [37.88, -4.78]],
  },
  {
    name: 'Shannon',
    coords: [[52.55, -9.7], [52.66, -8.63], [53.2, -8.0]],
  },
  {
    name: 'Dnieper (Austrvegr)',
    coords: [[55.2, 33.5], [54.78, 31.88], [52.5, 30.8], [50.45, 30.52], [47.8, 35.1], [46.5, 32.2]],
  },
  {
    name: 'Volga (Trade Route to Serkland)',
    coords: [[57.2, 34.5], [57.6, 39.8], [56.3, 44.0], [54.9, 49.05], [51.5, 46.0], [48.7, 44.5], [46.35, 48.05]],
  },
  {
    name: 'Don',
    coords: [[51.5, 39.0], [49.5, 41.0], [47.7, 42.2], [47.1, 39.3]],
  },
  {
    name: 'Tigris',
    coords: [[37.0, 41.5], [36.3, 43.1], [34.5, 43.8], [33.31, 44.36], [31.5, 47.0]],
  },
];

export const SETTLEMENTS: Settlement[] = [
  // =========================================================================
  // SCANDINAVIA (DENMARK, NORWAY, SWEDEN)
  // =========================================================================
  {
    id: 'hedeby',
    name: 'Hedeby',
    norseName: 'Heiðabýr',
    regionGroup: 'Denmark',
    subRegion: 'Jutland Isthmus',
    lat: 54.49,
    lon: 9.57,
    settlementType: 'trading_post',
    norsePopulation: 1400,
    nativePopulation: 400,
    primaryCulture: 'Old Norse (Dane)',
    primaryCultureFa: 'نورس کهن (دانمارکی)',
    defaultStatus: 'independent',
    factionColor: '#F59E0B',
    baseWealth: 9,
    baseDefense: 7,
    historicalSummary:
      'Premier Danish trading emporium linking the North Sea and Baltic across the Danevirke earthworks.',
    controllersByEra: [
      { untilYear: 935, ruler: 'Kings of Southern Jutland', polity: 'Danish Petty Kingdoms', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 986, ruler: 'Gorm & Harald Bluetooth', polity: 'Kingdom of Denmark', religion: Religion.Christian, factionColor: '#EA580C', status: 'independent' },
      { untilYear: 1035, ruler: 'Sweyn & Cnut the Great', polity: 'North Sea Empire', religion: Religion.Christian, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 1100, ruler: 'Sweyn Estridsen', polity: 'Kingdom of Denmark', religion: Religion.Christian, factionColor: '#EA580C', status: 'independent' },
    ],
  },
  {
    id: 'ribe',
    name: 'Ribe',
    norseName: 'Rípar',
    regionGroup: 'Denmark',
    subRegion: 'West Jutland',
    lat: 55.33,
    lon: 8.76,
    settlementType: 'town',
    norsePopulation: 850,
    nativePopulation: 250,
    primaryCulture: 'Old Norse (Jute)',
    primaryCultureFa: 'نورس کهن (یوتلندی)',
    defaultStatus: 'independent',
    factionColor: '#F59E0B',
    baseWealth: 7,
    baseDefense: 5,
    historicalSummary:
      'Oldest Scandinavian market town on the North Sea marsh coast; minting sceattas and hosting Ansgar’s early mission.',
    controllersByEra: [
      { untilYear: 960, ruler: 'Jutish Kings', polity: 'Kingdom of Denmark', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 1100, ruler: 'Royal Bishops & Kings of Denmark', polity: 'Kingdom of Denmark', religion: Religion.Christian, factionColor: '#EA580C', status: 'independent' },
    ],
  },
  {
    id: 'jelling',
    name: 'Jelling',
    norseName: 'Jelling',
    regionGroup: 'Denmark',
    subRegion: 'Central Jutland',
    lat: 55.76,
    lon: 9.42,
    settlementType: 'jarldom_seat',
    norsePopulation: 700,
    nativePopulation: 120,
    primaryCulture: 'Old Norse (Dane)',
    primaryCultureFa: 'نورس کهن (دانمارکی)',
    defaultStatus: 'independent',
    factionColor: '#EA580C',
    isThingSite: true,
    baseWealth: 7,
    baseDefense: 7,
    historicalSummary:
      'Dynastic ceremonial seat of Gorm the Old and Harald Bluetooth, famed for great ship-settings, royal mounds, and the Jelling Rune Stones.',
    controllersByEra: [
      { untilYear: 965, ruler: 'Gorm the Old', polity: 'Jelling Dynasty', religion: Religion.NorsePagan, factionColor: '#EA580C', status: 'independent' },
      { untilYear: 1100, ruler: 'House of Harald Bluetooth & Cnut', polity: 'Kingdom of Denmark', religion: Religion.Christian, factionColor: '#EA580C', status: 'independent' },
    ],
  },
  {
    id: 'roskilde',
    name: 'Roskilde',
    norseName: 'Hróarskeld',
    regionGroup: 'Denmark',
    subRegion: 'Sjælland',
    lat: 55.64,
    lon: 12.08,
    settlementType: 'capital',
    norsePopulation: 1600,
    nativePopulation: 450,
    primaryCulture: 'Old Norse (Zealander)',
    primaryCultureFa: 'نورس کهن (شیلندی)',
    defaultStatus: 'independent',
    factionColor: '#EA580C',
    baseWealth: 8,
    baseDefense: 7,
    historicalSummary:
      'Sheltered fjord capital on Sjælland commanding the Danish straits; five sunken blockships guard its approaches.',
    controllersByEra: [
      { untilYear: 965, ruler: 'Zealand Chieftains', polity: 'Danish Isles', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 1100, ruler: 'Danish Crown', polity: 'Kingdom of Denmark', religion: Religion.Christian, factionColor: '#EA580C', status: 'independent' },
    ],
  },
  {
    id: 'kaupang',
    name: 'Kaupang',
    norseName: 'Skíringssalr',
    regionGroup: 'Norway',
    subRegion: 'Vestfold',
    lat: 59.05,
    lon: 10.05,
    settlementType: 'trading_post',
    norsePopulation: 950,
    nativePopulation: 180,
    primaryCulture: 'Old Norse (Norwegian)',
    primaryCultureFa: 'نورس کهن (نروژی)',
    defaultStatus: 'independent',
    factionColor: '#F59E0B',
    baseWealth: 7,
    baseDefense: 5,
    historicalSummary:
      'Norway’s bustling Vestfold port described by Ohthere of Hålogaland, trading soapstone, whetstones, walrus ivory, and iron.',
    controllersByEra: [
      { untilYear: 872, ruler: 'Vestfold Petty Kings', polity: 'Vestfold', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 995, ruler: 'Fairhair & Lade Jarls', polity: 'Kingdom of Norway', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 1100, ruler: 'Christian Kings of Norway', polity: 'Kingdom of Norway', religion: Religion.Christian, factionColor: '#38BDF8', status: 'independent' },
    ],
  },
  {
    id: 'nidaros',
    name: 'Nidaros (Trondheim)',
    norseName: 'Niðaróss',
    regionGroup: 'Norway',
    subRegion: 'Trøndelag',
    lat: 63.43,
    lon: 10.40,
    settlementType: 'jarldom_seat',
    norsePopulation: 1200,
    nativePopulation: 250,
    primaryCulture: 'Old Norse (Norwegian)',
    primaryCultureFa: 'نورس کهن (نروژی)',
    defaultStatus: 'independent',
    factionColor: '#F59E0B',
    isThingSite: true,
    baseWealth: 7,
    baseDefense: 7,
    historicalSummary:
      'Heartland of the powerful Jarls of Lade and the Frostathing; founded as a royal market town by Olaf Tryggvason c. 997 and later shrine of St. Olaf.',
    controllersByEra: [
      { untilYear: 997, ruler: 'Jarls of Lade (Håkon Sigurdsson)', polity: 'Trøndelag Earldom', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 1100, ruler: 'Kings of Norway', polity: 'Kingdom of Norway', religion: Religion.Christian, factionColor: '#38BDF8', status: 'independent' },
    ],
  },
  {
    id: 'birka',
    name: 'Birka',
    norseName: 'Björkö',
    regionGroup: 'Sweden',
    subRegion: 'Lake Mälaren',
    lat: 59.34,
    lon: 17.54,
    settlementType: 'trading_post',
    norsePopulation: 1100,
    nativePopulation: 400,
    primaryCulture: 'Old Norse (Svear)',
    primaryCultureFa: 'نورس کهن (سوئدی سویار)',
    defaultStatus: 'independent',
    factionColor: '#F59E0B',
    baseWealth: 8,
    baseDefense: 6,
    historicalSummary:
      'Island emporium of the Svear in Lake Mälaren, rich with Abbasid silver dirhams and eastern Rus fur trade until Sigtuna superseded it c. 975.',
    controllersByEra: [
      { untilYear: 1008, ruler: 'Svear Kings of Mälaren', polity: 'Svealand', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 1100, ruler: 'Olof Skötkonung’s Line', polity: 'Kingdom of Sweden', religion: Religion.Christian, factionColor: '#38BDF8', status: 'independent' },
    ],
  },
  {
    id: 'uppsala',
    name: 'Gamla Uppsala',
    norseName: 'Uppsalir',
    regionGroup: 'Sweden',
    subRegion: 'Uppland',
    lat: 59.86,
    lon: 17.64,
    settlementType: 'jarldom_seat',
    norsePopulation: 1300,
    nativePopulation: 250,
    primaryCulture: 'Old Norse (Svear)',
    primaryCultureFa: 'نورس کهن (سوئدی)',
    defaultStatus: 'independent',
    factionColor: '#F59E0B',
    isThingSite: true,
    baseWealth: 7,
    baseDefense: 6,
    historicalSummary:
      'Sacred royal mounds and great pagan cult center of the Svear, celebrated every nine years with grand blót assemblies.',
    controllersByEra: [
      { untilYear: 1080, ruler: 'High Kings & Lawspeakers of Uppland', polity: 'Svealand', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
    ],
  },
  {
    id: 'sigtuna',
    name: 'Sigtuna',
    norseName: 'Sigtún',
    regionGroup: 'Sweden',
    subRegion: 'Lake Mälaren',
    lat: 59.62,
    lon: 17.72,
    settlementType: 'capital',
    norsePopulation: 1500,
    nativePopulation: 300,
    primaryCulture: 'Old Norse (Svear Christian)',
    primaryCultureFa: 'نورس مسیحی سوئد',
    defaultStatus: 'independent',
    factionColor: '#38BDF8',
    foundedYear: 975,
    baseWealth: 8,
    baseDefense: 7,
    historicalSummary:
      'Founded by King Eric the Victorious and crowned by Olof Skötkonung as Sweden’s first Christian royal minting town with runic coins.',
    controllersByEra: [
      { untilYear: 975, ruler: 'Unsettled Shore', polity: 'Svealand', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 1100, ruler: 'King Olof Skötkonung & Sons', polity: 'Kingdom of Sweden', religion: Religion.Christian, factionColor: '#38BDF8', status: 'independent' },
    ],
  },

  // =========================================================================
  // BRITISH ISLES & IRELAND
  // =========================================================================
  {
    id: 'lindisfarne',
    name: 'Lindisfarne',
    norseName: 'Lindisfarna',
    regionGroup: 'British Isles',
    subRegion: 'Northumbria',
    lat: 55.67,
    lon: -1.80,
    settlementType: 'monastery',
    norsePopulation: 30,
    nativePopulation: 180,
    primaryCulture: 'Anglo-Saxon Christian',
    primaryCultureFa: 'آنگلو-ساکسون مسیحی',
    defaultStatus: 'independent',
    factionColor: '#3B82F6',
    isMonastery: true,
    baseWealth: 7,
    baseDefense: 2,
    historicalSummary:
      'Tidal Holy Island monastery of St. Cuthbert in Northumbria. Its shock plundering on 8 June 793 opened the Viking Age in Christian chronicles.',
    controllersByEra: [
      { untilYear: 867, ruler: 'Kings & Bishops of Northumbria', polity: 'Kingdom of Northumbria', religion: Religion.Christian, factionColor: '#3B82F6', status: 'independent' },
      { untilYear: 954, ruler: 'Norse-Northumbrian Lords', polity: 'Danelaw Northumbria', religion: Religion.Syncretic, factionColor: '#EA580C', status: 'conquered' },
      { untilYear: 1100, ruler: 'Earls of Bamburgh', polity: 'Kingdom of England', religion: Religion.Christian, factionColor: '#3B82F6', status: 'independent' },
    ],
  },
  {
    id: 'jorvik',
    name: 'Jorvik (York)',
    norseName: 'Jórvík',
    regionGroup: 'British Isles',
    subRegion: 'Yorkshire / Danelaw',
    lat: 53.96,
    lon: -1.08,
    settlementType: 'city',
    norsePopulation: 3800,
    nativePopulation: 4500,
    primaryCulture: 'Anglo-Scandinavian',
    primaryCultureFa: 'آنگلو-اسکاندیناویایی',
    defaultStatus: 'independent',
    factionColor: '#EA580C',
    isRiverPort: true,
    riverName: 'Ouse / Humber',
    baseWealth: 9,
    baseDefense: 8,
    historicalSummary:
      'Seized by the Great Heathen Army in 866; transformed from Anglo-Saxon Eoforwic into a thriving Norse royal mint, craft hub, and capital of northern Danelaw.',
    controllersByEra: [
      { untilYear: 866, ruler: 'Ælla & Osberht', polity: 'Kingdom of Northumbria', religion: Religion.Christian, factionColor: '#3B82F6', status: 'independent' },
      { untilYear: 954, ruler: 'Norse Kings of Jórvík (Halfdan to Eric Bloodaxe)', polity: 'Kingdom of Jórvík (Danelaw)', religion: Religion.Syncretic, factionColor: '#EA580C', status: 'conquered' },
      { untilYear: 1013, ruler: 'Anglo-Dane Earls under English Crown', polity: 'Kingdom of England', religion: Religion.Christian, factionColor: '#3B82F6', status: 'independent' },
      { untilYear: 1042, ruler: 'Cnut & Sons', polity: 'North Sea Empire', religion: Religion.Christian, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 1100, ruler: 'Earls Siward, Tostig & Morcar', polity: 'Kingdom of England', religion: Religion.Christian, factionColor: '#3B82F6', status: 'independent' },
    ],
  },
  {
    id: 'repton',
    name: 'Repton',
    norseName: 'Hreppatún',
    regionGroup: 'British Isles',
    subRegion: 'Mercia / Five Boroughs',
    lat: 52.84,
    lon: -1.55,
    settlementType: 'town',
    norsePopulation: 950,
    nativePopulation: 450,
    primaryCulture: 'Anglo-Danish',
    primaryCultureFa: 'آنگلو-دانمارکی',
    defaultStatus: 'independent',
    factionColor: '#EA580C',
    baseWealth: 6,
    baseDefense: 6,
    historicalSummary:
      'Mercian royal burial abbey on the Trent where the Great Heathen Army built a D-shaped winter camp in 873–874, confirmed by mass warrior burials.',
    controllersByEra: [
      { untilYear: 874, ruler: 'King Burgred of Mercia', polity: 'Kingdom of Mercia', religion: Religion.Christian, factionColor: '#3B82F6', status: 'independent' },
      { untilYear: 920, ruler: 'Danish Jarls of the Five Boroughs', polity: 'The Danelaw', religion: Religion.NorsePagan, factionColor: '#EA580C', status: 'conquered' },
      { untilYear: 1100, ruler: 'Ealdormen of Mercia', polity: 'Kingdom of England', religion: Religion.Christian, factionColor: '#3B82F6', status: 'independent' },
    ],
  },
  {
    id: 'london',
    name: 'London (Lundenwic)',
    norseName: 'Lundúnaborg',
    regionGroup: 'British Isles',
    subRegion: 'Thames Valley',
    lat: 51.51,
    lon: -0.13,
    settlementType: 'capital',
    norsePopulation: 1400,
    nativePopulation: 9500,
    primaryCulture: 'Anglo-Saxon',
    primaryCultureFa: 'آنگلو-ساکسون',
    defaultStatus: 'independent',
    factionColor: '#3B82F6',
    isRiverPort: true,
    riverName: 'Thames',
    baseWealth: 10,
    baseDefense: 9,
    historicalSummary:
      'Walled Roman burh refortified by Alfred the Great in 886; repeatedly besieged by Sweyn Forkbeard, Thorkell the Tall, Olaf Haraldsson, and Cnut.',
    controllersByEra: [
      { untilYear: 886, ruler: 'Mercian & Danish Garrison', polity: 'Contested Thames', religion: Religion.Christian, factionColor: '#EA580C', status: 'rebellious' },
      { untilYear: 1016, ruler: 'House of Wessex (Alfred to Æthelred)', polity: 'Kingdom of England', religion: Religion.Christian, factionColor: '#3B82F6', status: 'independent' },
      { untilYear: 1042, ruler: 'Cnut the Great', polity: 'North Sea Empire', religion: Religion.Christian, factionColor: '#F59E0B', status: 'conquered' },
      { untilYear: 1100, ruler: 'Edward the Confessor & Harold Godwinson', polity: 'Kingdom of England', religion: Religion.Christian, factionColor: '#3B82F6', status: 'independent' },
    ],
  },
  {
    id: 'winchester',
    name: 'Winchester',
    norseName: 'Víncestr',
    regionGroup: 'British Isles',
    subRegion: 'Wessex',
    lat: 51.06,
    lon: -1.31,
    settlementType: 'capital',
    norsePopulation: 450,
    nativePopulation: 7000,
    primaryCulture: 'Anglo-Saxon',
    primaryCultureFa: 'آنگلو-ساکسون',
    defaultStatus: 'independent',
    factionColor: '#3B82F6',
    baseWealth: 9,
    baseDefense: 9,
    historicalSummary:
      'Fortified burh, royal treasury, and scriptorium capital of Wessex — seat of Alfred the Great and later Cnut the Great.',
    controllersByEra: [
      { untilYear: 1016, ruler: 'House of Wessex', polity: 'Kingdom of Wessex / England', religion: Religion.Christian, factionColor: '#3B82F6', status: 'independent' },
      { untilYear: 1042, ruler: 'Cnut & Harthacnut', polity: 'North Sea Empire', religion: Religion.Christian, factionColor: '#F59E0B', status: 'conquered' },
      { untilYear: 1100, ruler: 'House of Wessex & Godwin', polity: 'Kingdom of England', religion: Religion.Christian, factionColor: '#3B82F6', status: 'independent' },
    ],
  },
  {
    id: 'maldon',
    name: 'Maldon',
    norseName: 'Mældún',
    regionGroup: 'British Isles',
    subRegion: 'Essex',
    lat: 51.73,
    lon: 0.68,
    settlementType: 'town',
    norsePopulation: 250,
    nativePopulation: 1300,
    primaryCulture: 'Anglo-Saxon',
    primaryCultureFa: 'آنگلو-ساکسون',
    defaultStatus: 'independent',
    factionColor: '#3B82F6',
    baseWealth: 6,
    baseDefense: 5,
    historicalSummary:
      'Blackwater estuary burh in Essex where Ealdorman Byrhtnoth fell against a Viking fleet in August 991, immortalized in Old English heroic verse.',
    controllersByEra: [
      { untilYear: 878, ruler: 'East Saxon Ealdormen', polity: 'Kingdom of Wessex', religion: Religion.Christian, factionColor: '#3B82F6', status: 'independent' },
      { untilYear: 917, ruler: 'Guthrum’s Danish Settlers', polity: 'Southern Danelaw', religion: Religion.Syncretic, factionColor: '#EA580C', status: 'conquered' },
      { untilYear: 1100, ruler: 'Ealdormen of Essex', polity: 'Kingdom of England', religion: Religion.Christian, factionColor: '#3B82F6', status: 'independent' },
    ],
  },
  {
    id: 'kirkwall',
    name: 'Kirkwall (Orkney)',
    norseName: 'Kirkjuvágr',
    regionGroup: 'British Isles',
    subRegion: 'Northern Isles',
    lat: 58.98,
    lon: -2.96,
    settlementType: 'jarldom_seat',
    norsePopulation: 1200,
    nativePopulation: 500,
    primaryCulture: 'Norse-Pictish',
    primaryCultureFa: 'نورس-پیکتی اورکنی',
    defaultStatus: 'independent',
    factionColor: '#F59E0B',
    baseWealth: 6,
    baseDefense: 6,
    historicalSummary:
      'Strategic anchorage of the Jarls of Orkney controlling sea lanes between Norway, Caithness, the Hebrides, and Dublin.',
    controllersByEra: [
      { untilYear: 875, ruler: 'Pictish Mormaers & Early Raiders', polity: 'Pictish Isles', religion: Religion.Christian, factionColor: '#10B981', status: 'independent' },
      { untilYear: 995, ruler: 'Norse Jarls of Orkney (Turf-Einar to Sigurd the Stout)', polity: 'Earldom of Orkney', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 1100, ruler: 'Thorfinn the Mighty', polity: 'Earldom of Orkney', religion: Religion.Christian, factionColor: '#38BDF8', status: 'independent' },
    ],
  },
  {
    id: 'shetland',
    name: 'Shetland',
    norseName: 'Hjaltland',
    regionGroup: 'British Isles',
    subRegion: 'Northern Isles',
    lat: 60.15,
    lon: -1.15,
    settlementType: 'village',
    norsePopulation: 550,
    nativePopulation: 160,
    primaryCulture: 'Old Norse',
    primaryCultureFa: 'نورس کهن',
    defaultStatus: 'independent',
    factionColor: '#F59E0B',
    isThingSite: true,
    baseWealth: 5,
    baseDefense: 5,
    historicalSummary:
      'First landfall a day-and-a-half west of Bergen; soapstone quarries, Jarlshof longhouses, and the Law Ting Holm.',
    controllersByEra: [
      { untilYear: 850, ruler: 'Pictish Coastal Communities', polity: 'Pictland', religion: Religion.Christian, factionColor: '#10B981', status: 'independent' },
      { untilYear: 1100, ruler: 'Jarls of Orkney & Hjaltland', polity: 'Earldom of Orkney', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
    ],
  },
  {
    id: 'iona',
    name: 'Iona',
    norseName: 'Íkolmkill',
    regionGroup: 'British Isles',
    subRegion: 'Hebrides (Suðreyjar)',
    lat: 56.33,
    lon: -6.39,
    settlementType: 'monastery',
    norsePopulation: 60,
    nativePopulation: 220,
    primaryCulture: 'Gaelic Christian',
    primaryCultureFa: 'گیلیک مسیحی',
    defaultStatus: 'independent',
    factionColor: '#10B981',
    isMonastery: true,
    baseWealth: 7,
    baseDefense: 3,
    historicalSummary:
      'Venerable Columban abbey of the Inner Hebrides; raided in 795, 802, and 806 before becoming a revered burial isle of Norse-Gael kings.',
    controllersByEra: [
      { untilYear: 840, ruler: 'Columban Abbots & Dál Riata', polity: 'Dál Riata', religion: Religion.Christian, factionColor: '#10B981', status: 'independent' },
      { untilYear: 1100, ruler: 'Gall-Ghàidheil Lords of the Isles', polity: 'Kingdom of the Isles', religion: Religion.Syncretic, factionColor: '#10B981', status: 'independent' },
    ],
  },
  {
    id: 'isle_of_man',
    name: 'Isle of Man',
    norseName: 'Mön',
    regionGroup: 'British Isles',
    subRegion: 'Irish Sea',
    lat: 54.15,
    lon: -4.48,
    settlementType: 'jarldom_seat',
    norsePopulation: 1050,
    nativePopulation: 950,
    primaryCulture: 'Norse-Gaelic',
    primaryCultureFa: 'نورس-گیلیک',
    defaultStatus: 'independent',
    factionColor: '#10B981',
    isThingSite: true,
    baseWealth: 7,
    baseDefense: 6,
    historicalSummary:
      'Hub of the Irish Sea boasting pagan boat-burials, carved Norse-Celtic stone crosses, silver hoards, and the Tynwald (Þingvöllr) assembly.',
    controllersByEra: [
      { untilYear: 850, ruler: 'Brittonic & Gaelic Rulers', polity: 'Mann', religion: Religion.Christian, factionColor: '#10B981', status: 'independent' },
      { untilYear: 1100, ruler: 'Hiberno-Norse Kings of Mann & the Isles', polity: 'Kingdom of Mann', religion: Religion.Syncretic, factionColor: '#10B981', status: 'independent' },
    ],
  },
  {
    id: 'dublin',
    name: 'Dublin',
    norseName: 'Dyflinn',
    regionGroup: 'Ireland',
    subRegion: 'Leinster Coast',
    lat: 53.35,
    lon: -6.26,
    settlementType: 'city',
    norsePopulation: 4200,
    nativePopulation: 3800,
    primaryCulture: 'Hiberno-Norse (Ostman)',
    primaryCultureFa: 'ایرلندی-نورس (استمن)',
    defaultStatus: 'independent',
    factionColor: '#10B981',
    baseWealth: 9,
    baseDefense: 7,
    historicalSummary:
      'Founded as a fortified winter ship-camp (longphort) in 841; grew into Western Europe’s wealthiest Hiberno-Norse maritime kingdom under the Uí Ímair.',
    controllersByEra: [
      { untilYear: 841, ruler: 'Gaelic Monasteries of Áth Cliath', polity: 'Leinster', religion: Religion.Christian, factionColor: '#10B981', status: 'independent' },
      { untilYear: 980, ruler: 'Uí Ímair Dynasty (Olaf & Ivar)', polity: 'Kingdom of Dyflinn', religion: Religion.Syncretic, factionColor: '#10B981', status: 'independent' },
      { untilYear: 1100, ruler: 'Sigtrygg Silkbeard & Hiberno-Norse Kings', polity: 'Kingdom of Dyflinn', religion: Religion.Christian, factionColor: '#10B981', status: 'independent' },
    ],
  },
  {
    id: 'waterford',
    name: 'Waterford',
    norseName: 'Veðrafjörðr',
    regionGroup: 'Ireland',
    subRegion: 'Munster',
    lat: 52.26,
    lon: -7.11,
    settlementType: 'town',
    norsePopulation: 1500,
    nativePopulation: 1300,
    primaryCulture: 'Hiberno-Norse',
    primaryCultureFa: 'ایرلندی-نورس',
    defaultStatus: 'independent',
    factionColor: '#10B981',
    baseWealth: 7,
    baseDefense: 6,
    historicalSummary:
      'Walled Norse harbor ("Ram-Fjord") re-established in 914 by Ragnall ua Ímair at the confluence of the Suir, Nore, and Barrow.',
    controllersByEra: [
      { untilYear: 914, ruler: 'Déisi Mumhan', polity: 'Munster', religion: Religion.Christian, factionColor: '#10B981', status: 'independent' },
      { untilYear: 1100, ruler: 'Hiberno-Norse Lords of Veðrafjörðr', polity: 'Norse Waterford', religion: Religion.Syncretic, factionColor: '#10B981', status: 'independent' },
    ],
  },
  {
    id: 'wexford',
    name: 'Wexford',
    norseName: 'Veisafjörðr',
    regionGroup: 'Ireland',
    subRegion: 'SE Leinster',
    lat: 52.33,
    lon: -6.46,
    settlementType: 'town',
    norsePopulation: 950,
    nativePopulation: 850,
    primaryCulture: 'Hiberno-Norse',
    primaryCultureFa: 'ایرلندی-نورس',
    defaultStatus: 'independent',
    factionColor: '#10B981',
    baseWealth: 6,
    baseDefense: 5,
    historicalSummary:
      'Tidal mudflat harbor ("Inlet of the Mudflats") commanding the St. George’s Channel crossing to Wales and Bristol.',
    controllersByEra: [
      { untilYear: 890, ruler: 'Uí Cheinnselaig Kings', polity: 'Leinster', religion: Religion.Christian, factionColor: '#10B981', status: 'independent' },
      { untilYear: 1100, ruler: 'Ostmen of Veisafjörðr', polity: 'Norse Wexford', religion: Religion.Syncretic, factionColor: '#10B981', status: 'independent' },
    ],
  },
  {
    id: 'limerick',
    name: 'Limerick',
    norseName: 'Hlymrek',
    regionGroup: 'Ireland',
    subRegion: 'Shannon Estuary',
    lat: 52.66,
    lon: -8.63,
    settlementType: 'town',
    norsePopulation: 1300,
    nativePopulation: 1600,
    primaryCulture: 'Hiberno-Norse',
    primaryCultureFa: 'ایرلندی-نورس',
    defaultStatus: 'independent',
    factionColor: '#10B981',
    isRiverPort: true,
    riverName: 'Shannon',
    baseWealth: 7,
    baseDefense: 6,
    historicalSummary:
      'Island stronghold on the River Shannon enabling Norse fleets to raid deep into the lakes of central Ireland until Brian Boru subdued it in 967.',
    controllersByEra: [
      { untilYear: 922, ruler: 'Thomond Kings', polity: 'Munster', religion: Religion.Christian, factionColor: '#10B981', status: 'independent' },
      { untilYear: 967, ruler: 'Thorgils & Ivar of Limerick', polity: 'Norse Limerick', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 1100, ruler: 'Dál gCais (Brian Boru’s Line)', polity: 'Kingdom of Munster', religion: Religion.Christian, factionColor: '#10B981', status: 'tributary' },
    ],
  },
  {
    id: 'tara',
    name: 'Tara',
    norseName: 'Temair',
    regionGroup: 'Ireland',
    subRegion: 'Meath (Brega)',
    lat: 53.58,
    lon: -6.61,
    settlementType: 'capital',
    norsePopulation: 60,
    nativePopulation: 3200,
    primaryCulture: 'Gaelic',
    primaryCultureFa: 'گیلیک ایرلندی',
    defaultStatus: 'independent',
    factionColor: '#10B981',
    isThingSite: true,
    baseWealth: 7,
    baseDefense: 7,
    historicalSummary:
      'Ancient ceremonial hill of the High Kings of Ireland; near here Mael Sechnaill II broke Dublin’s power at the Battle of Tara in 980.',
    controllersByEra: [
      { untilYear: 1100, ruler: 'Southern Uí Néill & High Kings', polity: 'High Kingship of Ireland', religion: Religion.Christian, factionColor: '#10B981', status: 'independent' },
    ],
  },

  // =========================================================================
  // CONTINENT (FRANKIA, FRISIA, NORMANDY)
  // =========================================================================
  {
    id: 'dorestad',
    name: 'Dorestad',
    norseName: 'Dóristaðr',
    regionGroup: 'Continent',
    subRegion: 'Frisia',
    lat: 51.97,
    lon: 5.34,
    settlementType: 'trading_post',
    norsePopulation: 350,
    nativePopulation: 3800,
    primaryCulture: 'Frisian & Frankish',
    primaryCultureFa: 'فریزی و فرانکی',
    defaultStatus: 'independent',
    factionColor: '#6366F1',
    isRiverPort: true,
    riverName: 'Rhine / Lek',
    baseWealth: 9,
    baseDefense: 5,
    historicalSummary:
      'Great Carolingian river port trading Rhenish wine, glass, and Ulfberht-type sword blades; sacked repeatedly in the 830s and granted in fief to Danish warlord Rorik.',
    controllersByEra: [
      { untilYear: 850, ruler: 'Carolingian Counts', polity: 'Frankish Empire', religion: Religion.Christian, factionColor: '#6366F1', status: 'independent' },
      { untilYear: 885, ruler: 'Danish Fief-Holders (Rorik & Godfrid)', polity: 'Norse Frisia', religion: Religion.Syncretic, factionColor: '#EA580C', status: 'tributary' },
      { untilYear: 1100, ruler: 'Bishops of Utrecht & Counts of Holland', polity: 'East Francia / Empire', religion: Religion.Christian, factionColor: '#6366F1', status: 'independent' },
    ],
  },
  {
    id: 'rouen',
    name: 'Rouen (Normandy)',
    norseName: 'Rúðuborg',
    regionGroup: 'Continent',
    subRegion: 'Seine Valley',
    lat: 49.44,
    lon: 1.10,
    settlementType: 'city',
    norsePopulation: 3000,
    nativePopulation: 6000,
    primaryCulture: 'Norman (Norse-Frankish)',
    primaryCultureFa: 'نورمن (نورس-فرانک)',
    defaultStatus: 'independent',
    factionColor: '#6366F1',
    isRiverPort: true,
    riverName: 'Seine',
    baseWealth: 9,
    baseDefense: 8,
    historicalSummary:
      'Lower Seine metropolis ceded to the Viking leader Rollo (Göngu-Hrólfr) by Charles the Simple in 911, forging the Duchy of Normandy.',
    controllersByEra: [
      { untilYear: 911, ruler: 'West Frankish Archbishops & Counts', polity: 'West Francia', religion: Religion.Christian, factionColor: '#6366F1', status: 'independent' },
      { untilYear: 1100, ruler: 'House of Rollo (Counts/Dukes of Normandy)', polity: 'Duchy of Normandy', religion: Religion.Christian, factionColor: '#6366F1', status: 'independent' },
    ],
  },
  {
    id: 'paris',
    name: 'Paris',
    norseName: 'Parísaborg',
    regionGroup: 'Continent',
    subRegion: 'Île-de-France',
    lat: 48.86,
    lon: 2.35,
    settlementType: 'capital',
    norsePopulation: 180,
    nativePopulation: 19000,
    primaryCulture: 'Frankish',
    primaryCultureFa: 'فرانک',
    defaultStatus: 'independent',
    factionColor: '#6366F1',
    isRiverPort: true,
    riverName: 'Seine',
    baseWealth: 10,
    baseDefense: 10,
    historicalSummary:
      'Fortified island city on the Seine; paid 7,000 pounds of silver Danegeld to Ragnar’s fleet in 845 and endured Sigfred’s epic year-long siege in 885–886.',
    controllersByEra: [
      { untilYear: 987, ruler: 'Carolingian & Robertian Counts (Odo)', polity: 'West Francia', religion: Religion.Christian, factionColor: '#6366F1', status: 'independent' },
      { untilYear: 1100, ruler: 'Capetian Kings of France', polity: 'Kingdom of France', religion: Religion.Christian, factionColor: '#6366F1', status: 'independent' },
    ],
  },
  {
    id: 'nantes_noirmoutier',
    name: 'Noirmoutier / Nantes',
    norseName: 'Herí / Nantar',
    regionGroup: 'Continent',
    subRegion: 'Loire Estuary',
    lat: 47.00,
    lon: -2.25,
    settlementType: 'fortress',
    norsePopulation: 1200,
    nativePopulation: 2500,
    primaryCulture: 'Norse & Breton',
    primaryCultureFa: 'نورس و برتون',
    defaultStatus: 'independent',
    factionColor: '#EF4444',
    isRiverPort: true,
    riverName: 'Loire',
    baseWealth: 8,
    baseDefense: 7,
    historicalSummary:
      'Fortified monastic island base on the Loire estuary seized in 836; served as the premier raiding springboard of Hastein and the Loire Vikings into central Frankia and Iberia.',
    controllersByEra: [
      { untilYear: 836, ruler: 'Saint-Philibert Monks & Frankish Counts', polity: 'Kingdom of Aquitaine', religion: Religion.Christian, factionColor: '#6366F1', status: 'independent' },
      { untilYear: 939, ruler: 'Loire Viking Warlords (Hastein, Rognvald)', polity: 'Loire Norse Base', religion: Religion.NorsePagan, factionColor: '#EF4444', status: 'conquered' },
      { untilYear: 1100, ruler: 'Dukes of Brittany & Counts of Nantes', polity: 'Duchy of Brittany', religion: Religion.Christian, factionColor: '#6366F1', status: 'independent' },
    ],
  },

  // =========================================================================
  // BALTIC & WENDLAND
  // =========================================================================
  {
    id: 'jomsborg',
    name: 'Jomsborg (Wolin)',
    norseName: 'Jómsborg',
    regionGroup: 'Baltic',
    subRegion: 'Oder Estuary / Wendland',
    lat: 53.84,
    lon: 14.61,
    settlementType: 'fortress',
    norsePopulation: 1600,
    nativePopulation: 900,
    primaryCulture: 'Old Norse & Slavic',
    primaryCultureFa: 'نورس و اسلاو وندی',
    defaultStatus: 'independent',
    factionColor: '#F59E0B',
    baseWealth: 7,
    baseDefense: 9,
    historicalSummary:
      'Legendary sea-fortress of the Jomsvikings founded by Palnatoke or Harald Bluetooth, fortified with an iron-chained harbor holding up to 300 longships.',
    controllersByEra: [
      { untilYear: 980, ruler: 'Wendish Slavs & Norse Mercenaries', polity: 'Wolin Slavic Emporium', religion: Religion.NorsePagan, factionColor: '#84CC16', status: 'independent' },
      { untilYear: 1043, ruler: 'Jomsviking Brotherhood (Palnatoke & Sigvaldi)', polity: 'Jómsborg Stronghold', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 1100, ruler: 'Magnus the Good & Pomeranian Dukes', polity: 'Duchy of Pomerania', religion: Religion.Christian, factionColor: '#38BDF8', status: 'conquered' },
    ],
  },
  {
    id: 'visby',
    name: 'Visby (Gotland)',
    norseName: 'Vísbýr',
    regionGroup: 'Baltic',
    subRegion: 'Gotland Island',
    lat: 57.64,
    lon: 18.29,
    settlementType: 'trading_post',
    norsePopulation: 1900,
    nativePopulation: 450,
    primaryCulture: 'Gutnish (Old Norse)',
    primaryCultureFa: 'گوتنیش (نورس گوتلند)',
    defaultStatus: 'independent',
    factionColor: '#F59E0B',
    isThingSite: true,
    baseWealth: 9,
    baseDefense: 6,
    historicalSummary:
      'Premier commercial crossroads of the Baltic Sea; archaeological digs have unearthed over 170,000 Islamic silver dirhams, Anglo-Saxon pennies, and Byzantine seals.',
    controllersByEra: [
      { untilYear: 1100, ruler: 'Allthing of Gotland (Guta Lag)', polity: 'Gutnish Free Commonwealth', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
    ],
  },
  {
    id: 'truso',
    name: 'Truso',
    norseName: 'Drúsó',
    regionGroup: 'Baltic',
    subRegion: 'Vistula Lagoon / Prussia',
    lat: 54.06,
    lon: 19.38,
    settlementType: 'trading_post',
    norsePopulation: 650,
    nativePopulation: 1300,
    primaryCulture: 'Old Prussian & Norse',
    primaryCultureFa: 'پروسی کهن و نورس',
    defaultStatus: 'independent',
    factionColor: '#84CC16',
    baseWealth: 8,
    baseDefense: 5,
    historicalSummary:
      'Famous craft and amber market on Lake Drużno visited by Wulfstan of Hedeby c. 890, trading raw Baltic amber, walrus ivory, and glass beads.',
    controllersByEra: [
      { untilYear: 1000, ruler: 'Old Prussian Chieftains & Norse Merchants', polity: 'Prussian Baltic Guild', religion: Religion.NorsePagan, factionColor: '#84CC16', status: 'independent' },
      { untilYear: 1100, ruler: 'Piast Kings of Poland', polity: 'Kingdom of Poland', religion: Religion.Christian, factionColor: '#EF4444', status: 'conquered' },
    ],
  },
  {
    id: 'grobina',
    name: 'Grobiņa (Courland)',
    norseName: 'Seeburg',
    regionGroup: 'Baltic',
    subRegion: 'Courland (Latvia)',
    lat: 56.54,
    lon: 21.16,
    settlementType: 'jarldom_seat',
    norsePopulation: 950,
    nativePopulation: 850,
    primaryCulture: 'Gotlandic & Curonian',
    primaryCultureFa: 'گوتلندی و کورونی',
    defaultStatus: 'independent',
    factionColor: '#84CC16',
    baseWealth: 7,
    baseDefense: 7,
    historicalSummary:
      'Scandinavian fortified colony and burial mounds in western Latvia; besieged in 854 by King Olof of Sweden as recorded in Rimbert’s Life of Ansgar.',
    controllersByEra: [
      { untilYear: 854, ruler: 'Curonian Chieftains', polity: 'Courland', religion: Religion.NorsePagan, factionColor: '#84CC16', status: 'independent' },
      { untilYear: 950, ruler: 'Swedish & Gotlandic Jarls', polity: 'Seeburg Settlement', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'tributary' },
      { untilYear: 1100, ruler: 'Baltic Curonian Tribes', polity: 'Curonian Confederation', religion: Religion.NorsePagan, factionColor: '#84CC16', status: 'independent' },
    ],
  },

  // =========================================================================
  // KIEVAN RUS & EASTERN RIVER ROUTES (AUSTRVEGR)
  // =========================================================================
  {
    id: 'staraya_ladoga',
    name: 'Staraya Ladoga',
    norseName: 'Aldeigjuborg',
    regionGroup: 'Kievan Rus & Rivers',
    subRegion: 'Lake Ladoga / Volkhov',
    lat: 60.00,
    lon: 32.30,
    settlementType: 'trading_post',
    norsePopulation: 1500,
    nativePopulation: 2200,
    primaryCulture: 'Varangian & East Slavic',
    primaryCultureFa: 'وارنگی و اسلاوی',
    defaultStatus: 'independent',
    factionColor: '#E11D48',
    isRiverPort: true,
    riverName: 'Volkhov',
    baseWealth: 8,
    baseDefense: 6,
    historicalSummary:
      'The primary Baltic gateway to the Russian river routes, founded c. 753. In 862 Rurik established his initial timber fortress here before moving upriver to Holmgard.',
    controllersByEra: [
      { untilYear: 862, ruler: 'Norse & Finnic Traders', polity: 'Early Ladoga Guild', religion: Religion.NorsePagan, factionColor: '#E11D48', status: 'independent' },
      { untilYear: 980, ruler: 'Rurikid Varangians', polity: 'Novgorod Rus', religion: Religion.NorsePagan, factionColor: '#E11D48', status: 'independent' },
      { untilYear: 1100, ruler: 'Ingegerd of Sweden & Rus Jarls', polity: 'Kievan Rus', religion: Religion.Christian, factionColor: '#E11D48', status: 'independent' },
    ],
  },
  {
    id: 'novgorod',
    name: 'Novgorod',
    norseName: 'Hólmgarðr',
    regionGroup: 'Kievan Rus & Rivers',
    subRegion: 'Lake Ilmen Basin',
    lat: 58.52,
    lon: 31.27,
    settlementType: 'jarldom_seat',
    norsePopulation: 2400,
    nativePopulation: 7000,
    primaryCulture: 'East Slavic & Varangian',
    primaryCultureFa: 'اسلاو شرقی و وارنگی',
    defaultStatus: 'independent',
    factionColor: '#E11D48',
    isRiverPort: true,
    riverName: 'Volkhov',
    baseWealth: 9,
    baseDefense: 8,
    historicalSummary:
      'Great northern citadel on the Volkhov where Rurik consolidated power; legendary refuge of future kings Olaf Tryggvason, St. Olaf, and Harald Hardrada.',
    controllersByEra: [
      { untilYear: 882, ruler: 'Prince Rurik & Oleg', polity: 'Novgorod Rus', religion: Religion.NorsePagan, factionColor: '#E11D48', status: 'independent' },
      { untilYear: 988, ruler: 'Vladimir the Great', polity: 'Novgorod & Kiev', religion: Religion.NorsePagan, factionColor: '#E11D48', status: 'independent' },
      { untilYear: 1100, ruler: 'Yaroslav the Wise & Grand Princes', polity: 'Kievan Rus', religion: Religion.Christian, factionColor: '#E11D48', status: 'independent' },
    ],
  },
  {
    id: 'gnezdovo',
    name: 'Gnezdovo (Smolensk)',
    norseName: 'Gnezdovo',
    regionGroup: 'Kievan Rus & Rivers',
    subRegion: 'Upper Dnieper Portage',
    lat: 54.78,
    lon: 31.88,
    settlementType: 'trading_post',
    norsePopulation: 1200,
    nativePopulation: 3000,
    primaryCulture: 'Varangian-Slavic',
    primaryCultureFa: 'وارنگی-اسلاوی',
    defaultStatus: 'independent',
    factionColor: '#E11D48',
    isRiverPort: true,
    riverName: 'Dnieper',
    baseWealth: 8,
    baseDefense: 6,
    historicalSummary:
      'Immense archaeological complex of over 4,000 burial mounds where the portage between the Western Dvina and the Dnieper was dragged over log rollers.',
    controllersByEra: [
      { untilYear: 950, ruler: 'Varangian Portage Guild', polity: 'Dnieper River Route', religion: Religion.NorsePagan, factionColor: '#E11D48', status: 'independent' },
      { untilYear: 1100, ruler: 'Princes of Smolensk', polity: 'Kievan Rus', religion: Religion.Christian, factionColor: '#E11D48', status: 'independent' },
    ],
  },
  {
    id: 'kiev',
    name: 'Kiev',
    norseName: 'Kœnugarðr',
    regionGroup: 'Kievan Rus & Rivers',
    subRegion: 'Middle Dnieper',
    lat: 50.45,
    lon: 30.52,
    settlementType: 'capital',
    norsePopulation: 3200,
    nativePopulation: 16000,
    primaryCulture: 'East Slavic & Varangian',
    primaryCultureFa: 'اسلاو شرقی و وارنگی',
    defaultStatus: 'independent',
    factionColor: '#E11D48',
    isRiverPort: true,
    riverName: 'Dnieper',
    baseWealth: 10,
    baseDefense: 9,
    historicalSummary:
      'High bluff capital overlooking the Dnieper seized by Oleg the Wise in 882; the "Mother of Russian Cities" controlling the waterborne trade to Constantinople.',
    controllersByEra: [
      { untilYear: 882, ruler: 'Askold & Dir (Varangian Warlords)', polity: 'Early Kiev Realm', religion: Religion.NorsePagan, factionColor: '#E11D48', status: 'independent' },
      { untilYear: 988, ruler: 'Oleg, Sviatoslav & Vladimir', polity: 'Kievan Rus', religion: Religion.NorsePagan, factionColor: '#E11D48', status: 'independent' },
      { untilYear: 1100, ruler: 'Yaroslav the Wise & Grand Princes', polity: 'Kievan Rus', religion: Religion.Christian, factionColor: '#E11D48', status: 'independent' },
    ],
  },
  {
    id: 'bulgar',
    name: 'Bulgar (Volga Bulgaria)',
    norseName: 'Bólgar',
    regionGroup: 'Kievan Rus & Rivers',
    subRegion: 'Middle Volga / Kama',
    lat: 54.90,
    lon: 49.05,
    settlementType: 'trading_post',
    norsePopulation: 450,
    nativePopulation: 14000,
    primaryCulture: 'Volga Bulgar & Islamic',
    primaryCultureFa: 'بلغار ولگا و اسلامی',
    defaultStatus: 'independent',
    factionColor: '#14B8A6',
    isRiverPort: true,
    riverName: 'Volga',
    baseWealth: 9,
    baseDefense: 7,
    historicalSummary:
      'Great emporium at the confluence of Volga and Kama where Ahmad ibn Fadlan in 922 recorded his eyewitness account of the Rus merchants and their ship burial.',
    controllersByEra: [
      { untilYear: 922, ruler: 'Almış ilteber (Khan of Volga Bulgars)', polity: 'Volga Bulgaria', religion: Religion.NorsePagan, factionColor: '#14B8A6', status: 'independent' },
      { untilYear: 1100, ruler: 'Muslim Khans of Volga Bulgaria', polity: 'Islamic Volga Bulgaria', religion: Religion.Christian, factionColor: '#14B8A6', status: 'independent' },
    ],
  },
  {
    id: 'atil',
    name: 'Atil (Itil / Khazaria)',
    norseName: 'Átílborg',
    regionGroup: 'Kievan Rus & Rivers',
    subRegion: 'Volga Delta / Caspian',
    lat: 46.35,
    lon: 48.05,
    settlementType: 'capital',
    norsePopulation: 350,
    nativePopulation: 26000,
    primaryCulture: 'Khazar (Turkic, Jewish & Muslim)',
    primaryCultureFa: 'خزری (ترک، یهودی و مسلمان)',
    defaultStatus: 'independent',
    factionColor: '#3B82F6',
    isRiverPort: true,
    riverName: 'Volga',
    baseWealth: 10,
    baseDefense: 8,
    historicalSummary:
      'Delta capital of the Khazar Khaganate collecting 10% tithes on all Rus merchant fleets sailing down the Volga into the Caspian Sea until Sviatoslav sacked it in 969.',
    controllersByEra: [
      { untilYear: 969, ruler: 'Khazar Khagan & Bek', polity: 'Khazar Khaganate', religion: Religion.Syncretic, factionColor: '#3B82F6', status: 'independent' },
      { untilYear: 1100, ruler: 'Kievan Rus & Oghuz Nomads', polity: 'Lower Volga Frontier', religion: Religion.NorsePagan, factionColor: '#E11D48', status: 'conquered' },
    ],
  },

  // =========================================================================
  // BYZANTIUM / MIKLAGARD
  // =========================================================================
  {
    id: 'constantinople',
    name: 'Constantinople (Miklagard)',
    norseName: 'Miklagarðr',
    regionGroup: 'Miklagard & East',
    subRegion: 'Thrace / Bosporus',
    lat: 41.01,
    lon: 28.97,
    settlementType: 'capital',
    norsePopulation: 2600,
    nativePopulation: 280000,
    primaryCulture: 'Greek Byzantine Christian',
    primaryCultureFa: 'یونانی بیزانس مسیحی',
    defaultStatus: 'independent',
    factionColor: '#A855F7',
    isRiverPort: true,
    riverName: 'Golden Horn / Bosporus',
    baseWealth: 10,
    baseDefense: 10,
    historicalSummary:
      'The "Great City" of the Basileus on the Bosporus. Sapped by triple Theodosian walls and defended by Greek Fire, it recruited Norse warriors into the elite Varangian Guard.',
    controllersByEra: [
      { untilYear: 886, ruler: 'Basil I the Macedonian', polity: 'Byzantine Empire', religion: Religion.Christian, factionColor: '#A855F7', status: 'independent' },
      { untilYear: 959, ruler: 'Constantine VII Porphyrogenitus', polity: 'Byzantine Empire', religion: Religion.Christian, factionColor: '#A855F7', status: 'independent' },
      { untilYear: 1025, ruler: 'Basil II (Bulgar-Slayer)', polity: 'Byzantine Empire', religion: Religion.Christian, factionColor: '#A855F7', status: 'independent' },
      { untilYear: 1100, ruler: 'Alexios I Komnenos', polity: 'Byzantine Empire', religion: Religion.Christian, factionColor: '#A855F7', status: 'independent' },
    ],
  },

  // =========================================================================
  // IBERIA & AL-ANDALUS
  // =========================================================================
  {
    id: 'santiago',
    name: 'Santiago de Compostela',
    norseName: 'Jakobsland',
    regionGroup: 'Iberia & Al-Andalus',
    subRegion: 'Galicia',
    lat: 42.88,
    lon: -8.54,
    settlementType: 'monastery',
    norsePopulation: 90,
    nativePopulation: 4000,
    primaryCulture: 'Galician & Asturian',
    primaryCultureFa: 'گالیسیایی و آستوریایی',
    defaultStatus: 'independent',
    factionColor: '#3B82F6',
    isMonastery: true,
    baseWealth: 8,
    baseDefense: 6,
    historicalSummary:
      'Renowned pilgrimage cathedral of St. James in Galicia. Plundered by Björn Ironside and Hastein in 859, and raided again by Gundered in 968.',
    controllersByEra: [
      { untilYear: 910, ruler: 'Kings of Asturias (Ordoño I)', polity: 'Kingdom of Asturias', religion: Religion.Christian, factionColor: '#3B82F6', status: 'independent' },
      { untilYear: 1100, ruler: 'Kings of Galicia & León', polity: 'Kingdom of León', religion: Religion.Christian, factionColor: '#3B82F6', status: 'independent' },
    ],
  },
  {
    id: 'lisbon',
    name: 'Lisbon (Ushbuna)',
    norseName: 'Ushbúna',
    regionGroup: 'Iberia & Al-Andalus',
    subRegion: 'Tagus Estuary',
    lat: 38.72,
    lon: -9.14,
    settlementType: 'city',
    norsePopulation: 140,
    nativePopulation: 20000,
    primaryCulture: 'Andalusian Arabic & Mozarab',
    primaryCultureFa: 'عربی اندلس و موزاراب',
    defaultStatus: 'independent',
    factionColor: '#14B8A6',
    isRiverPort: true,
    riverName: 'Tagus',
    baseWealth: 9,
    baseDefense: 7,
    historicalSummary:
      'Walled Muslim Atlantic harbor on the Tagus attacked for thirteen days in September 844 by 54 Viking ships before they sailed south for Seville.',
    controllersByEra: [
      { untilYear: 1031, ruler: 'Umayyad Emirs & Caliphs', polity: 'Emirate / Caliphate of Cordoba', religion: Religion.Christian, factionColor: '#14B8A6', status: 'independent' },
      { untilYear: 1100, ruler: 'Aftasid Taifa Kings of Badajoz', polity: 'Taifa of Badajoz', religion: Religion.Christian, factionColor: '#14B8A6', status: 'independent' },
    ],
  },
  {
    id: 'seville',
    name: 'Seville (Ishbiliya)',
    norseName: 'Ísbílíya',
    regionGroup: 'Iberia & Al-Andalus',
    subRegion: 'Guadalquivir Valley',
    lat: 37.38,
    lon: -5.99,
    settlementType: 'city',
    norsePopulation: 220,
    nativePopulation: 38000,
    primaryCulture: 'Andalusian Arabic',
    primaryCultureFa: 'عربی اندلسی',
    defaultStatus: 'independent',
    factionColor: '#14B8A6',
    isRiverPort: true,
    riverName: 'Guadalquivir',
    baseWealth: 10,
    baseDefense: 8,
    historicalSummary:
      'Great inland river city on the Guadalquivir captured and pillaged by the Vikings in October 844 until Emir Abd ar-Rahman II destroyed their fleet with catapults.',
    controllersByEra: [
      { untilYear: 844, ruler: 'Umayyad Governor', polity: 'Emirate of Cordoba', religion: Religion.Christian, factionColor: '#14B8A6', status: 'independent' },
      { untilYear: 1031, ruler: 'Emirs & Caliphs of Cordoba', polity: 'Caliphate of Cordoba', religion: Religion.Christian, factionColor: '#14B8A6', status: 'independent' },
      { untilYear: 1100, ruler: 'Abbadid Taifa of Seville (Al-Mutamid)', polity: 'Taifa of Seville', religion: Religion.Christian, factionColor: '#14B8A6', status: 'independent' },
    ],
  },
  {
    id: 'cordoba',
    name: 'Cordoba (Qurtuba)',
    norseName: 'Kordóba',
    regionGroup: 'Iberia & Al-Andalus',
    subRegion: 'Heart of Al-Andalus',
    lat: 37.88,
    lon: -4.78,
    settlementType: 'capital',
    norsePopulation: 120,
    nativePopulation: 110000,
    primaryCulture: 'Andalusian Islamic & Mozarab',
    primaryCultureFa: 'اسلامی اندلس و موزاراب',
    defaultStatus: 'independent',
    factionColor: '#14B8A6',
    isRiverPort: true,
    riverName: 'Guadalquivir',
    baseWealth: 10,
    baseDefense: 9,
    historicalSummary:
      'Gleaming capital of the Umayyad Caliphate, renowned for the Great Mosque, paved lit streets, vast libraries, and envoy Al-Ghazal who visited the Norse court in 845.',
    controllersByEra: [
      { untilYear: 929, ruler: 'Abd ar-Rahman II & III', polity: 'Emirate of Cordoba', religion: Religion.Christian, factionColor: '#14B8A6', status: 'independent' },
      { untilYear: 1031, ruler: 'Umayyad Caliphs (Al-Hakam II & Almanzor)', polity: 'Caliphate of Cordoba', religion: Religion.Christian, factionColor: '#14B8A6', status: 'independent' },
      { untilYear: 1100, ruler: 'Almoravid Dynasts', polity: 'Almoravid Empire', religion: Religion.Christian, factionColor: '#14B8A6', status: 'independent' },
    ],
  },

  // =========================================================================
  // MEDITERRANEAN & NORTH AFRICA
  // =========================================================================
  {
    id: 'luna',
    name: 'Luna / Luni',
    norseName: 'Lúnaborg',
    regionGroup: 'Mediterranean',
    subRegion: 'Liguria / Tuscany (Italy)',
    lat: 44.06,
    lon: 10.04,
    settlementType: 'city',
    norsePopulation: 110,
    nativePopulation: 8500,
    primaryCulture: 'Italian Latin Christian',
    primaryCultureFa: 'ایتالیایی لاتین مسیحی',
    defaultStatus: 'independent',
    factionColor: '#6366F1',
    baseWealth: 8,
    baseDefense: 7,
    historicalSummary:
      'Ancient Roman white-marble walled harbor in northern Italy. Sacked in 860 by Hastein and Björn Ironside, who feigned conversion and entered inside a funeral bier.',
    controllersByEra: [
      { untilYear: 950, ruler: 'Bishops of Luni & Carolingian Counts', polity: 'Kingdom of Italy', religion: Religion.Christian, factionColor: '#6366F1', status: 'independent' },
      { untilYear: 1100, ruler: 'March of Tuscany & Republic of Genoa', polity: 'Holy Roman Empire', religion: Religion.Christian, factionColor: '#6366F1', status: 'independent' },
    ],
  },
  {
    id: 'palermo',
    name: 'Palermo (Balharm)',
    norseName: 'Palermoborg',
    regionGroup: 'Mediterranean',
    subRegion: 'Sicily',
    lat: 38.11,
    lon: 13.36,
    settlementType: 'city',
    norsePopulation: 180,
    nativePopulation: 70000,
    primaryCulture: 'Arab-Sicilian & Greek',
    primaryCultureFa: 'عربی-سیسیلی و یونانی',
    defaultStatus: 'independent',
    factionColor: '#14B8A6',
    baseWealth: 9,
    baseDefense: 8,
    historicalSummary:
      'Bustling cosmopolitan Mediterranean capital under the Kalbid Emirs, later conquered in 1072 by Norman adventurer Robert Guiscard and Roger I.',
    controllersByEra: [
      { untilYear: 1060, ruler: 'Kalbid Emirs of Sicily', polity: 'Emirate of Sicily', religion: Religion.Christian, factionColor: '#14B8A6', status: 'independent' },
      { untilYear: 1100, ruler: 'Robert Guiscard & Roger I (Normans)', polity: 'County of Sicily', religion: Religion.Christian, factionColor: '#6366F1', status: 'conquered' },
    ],
  },
  {
    id: 'nekor',
    name: 'Nekor (Morocco)',
    norseName: 'Blámannaland',
    regionGroup: 'Mediterranean',
    subRegion: 'Rif Coast (North Africa)',
    lat: 35.15,
    lon: -3.85,
    settlementType: 'fortress',
    norsePopulation: 120,
    nativePopulation: 7500,
    primaryCulture: 'Berber & Arab',
    primaryCultureFa: 'بربر و عرب مراکشی',
    defaultStatus: 'independent',
    factionColor: '#14B8A6',
    baseWealth: 7,
    baseDefense: 6,
    historicalSummary:
      'Northern Moroccan coastal emirate attacked by Björn Ironside and Hastein in 859. The Norse defeated the local garrison and took captives called "blámenn".',
    controllersByEra: [
      { untilYear: 1030, ruler: 'Salihid Emirs of Nekor', polity: 'Emirate of Nekor', religion: Religion.Christian, factionColor: '#14B8A6', status: 'independent' },
      { untilYear: 1100, ruler: 'Almoravid Berber Confederation', polity: 'Almoravid Empire', religion: Religion.Christian, factionColor: '#14B8A6', status: 'independent' },
    ],
  },

  // =========================================================================
  // SERKLAND & ABBASID CALIPHATE
  // =========================================================================
  {
    id: 'baghdad',
    name: 'Baghdad (Madinat al-Salam)',
    norseName: 'Serkland / Bagdað',
    regionGroup: 'Serkland & Caliphate',
    subRegion: 'Mesopotamia (Tigris)',
    lat: 33.31,
    lon: 44.36,
    settlementType: 'capital',
    norsePopulation: 90,
    nativePopulation: 450000,
    primaryCulture: 'Abbasid Arab & Persian',
    primaryCultureFa: 'عرب عباسی و پارسی',
    defaultStatus: 'independent',
    factionColor: '#0F172A',
    isRiverPort: true,
    riverName: 'Tigris',
    baseWealth: 10,
    baseDefense: 10,
    historicalSummary:
      'The Round City on the Tigris and apex of the Islamic Golden Age. The source of tens of thousands of silver dirhams that flowed through Rus rivers to Scandinavia.',
    controllersByEra: [
      { untilYear: 892, ruler: 'Abbasid Caliphs (Al-Mutawakkil)', polity: 'Abbasid Caliphate', religion: Religion.Christian, factionColor: '#0F172A', status: 'independent' },
      { untilYear: 945, ruler: 'Abbasid Caliphs (Al-Muqtadir)', polity: 'Abbasid Caliphate', religion: Religion.Christian, factionColor: '#0F172A', status: 'independent' },
      { untilYear: 1055, ruler: 'Buyid Amirs (Persian Shias)', polity: 'Buyid Confederacy', religion: Religion.Christian, factionColor: '#0F172A', status: 'independent' },
      { untilYear: 1100, ruler: 'Seljuk Sultans (Tughril & Alp Arslan)', polity: 'Great Seljuk Empire', religion: Religion.Christian, factionColor: '#0F172A', status: 'independent' },
    ],
  },
  {
    id: 'gorgan',
    name: 'Gorgan / Abaskun',
    norseName: 'Jurján',
    regionGroup: 'Serkland & Caliphate',
    subRegion: 'SE Caspian Shore / Tabaristan',
    lat: 36.84,
    lon: 54.44,
    settlementType: 'trading_post',
    norsePopulation: 280,
    nativePopulation: 20000,
    primaryCulture: 'Persian & Daylamite',
    primaryCultureFa: 'پارسی و دیلمی',
    defaultStatus: 'independent',
    factionColor: '#14B8A6',
    baseWealth: 9,
    baseDefense: 7,
    historicalSummary:
      'Silk road terminus and southern Caspian haven described by Ibn Khordadbeh where Rus traders rode camels to Baghdad; targeted in Rus naval raids in 913 and 943.',
    controllersByEra: [
      { untilYear: 928, ruler: 'Alid Zaydi Rulers of Tabaristan', polity: 'Alid Emirate', religion: Religion.Christian, factionColor: '#14B8A6', status: 'independent' },
      { untilYear: 1040, ruler: 'Ziyarid Dynasty (Mardavij & Qabus)', polity: 'Ziyarid Dynasty', religion: Religion.Christian, factionColor: '#14B8A6', status: 'independent' },
      { untilYear: 1100, ruler: 'Seljuk Governors', polity: 'Great Seljuk Empire', religion: Religion.Christian, factionColor: '#0F172A', status: 'independent' },
    ],
  },

  // =========================================================================
  // NORTH ATLANTIC (FAROES, ICELAND, GREENLAND, VINLAND)
  // =========================================================================
  {
    id: 'faroes',
    name: 'Tórshavn (Faroe Islands)',
    norseName: 'Færeyjar',
    regionGroup: 'North Atlantic',
    subRegion: 'Faroe Archipelago',
    lat: 62.01,
    lon: -6.77,
    settlementType: 'village',
    norsePopulation: 480,
    nativePopulation: 40,
    primaryCulture: 'Old Norse (Faroese)',
    primaryCultureFa: 'نورس فاروئی',
    defaultStatus: 'independent',
    factionColor: '#38BDF8',
    isThingSite: true,
    baseWealth: 4,
    baseDefense: 4,
    historicalSummary:
      'Steep basalt sheep-islands ("Sheep Isles") settled by Norse voyagers c. 825, displacing Irish anchorite monks; home to the Tinganes headland.',
    controllersByEra: [
      { untilYear: 825, ruler: 'Hiberno-Scottish Hermits (Papar)', polity: 'Unclaimed Atlantic', religion: Religion.Christian, factionColor: '#10B981', status: 'independent' },
      { untilYear: 1035, ruler: 'Faroese Chieftains (Tróndur í Gøtu)', polity: 'Faroese Thing', religion: Religion.NorsePagan, factionColor: '#38BDF8', status: 'independent' },
      { untilYear: 1100, ruler: 'Tributary of Norway', polity: 'Kingdom of Norway', religion: Religion.Christian, factionColor: '#38BDF8', status: 'tributary' },
    ],
  },
  {
    id: 'reykjavik',
    name: 'Reykjavik',
    norseName: 'Reykjarvík',
    regionGroup: 'North Atlantic',
    subRegion: 'SW Iceland',
    lat: 64.15,
    lon: -21.94,
    settlementType: 'town',
    norsePopulation: 850,
    nativePopulation: 30,
    primaryCulture: 'Old Norse (Icelandic)',
    primaryCultureFa: 'نورس ایسلندی',
    defaultStatus: 'independent',
    factionColor: '#38BDF8',
    foundedYear: 874,
    baseWealth: 5,
    baseDefense: 4,
    historicalSummary:
      'Steaming bay where Ingólfr Arnarson cast his high-seat pillars overboard c. 874, inaugurating Iceland’s Age of Settlement (Landnámsöld).',
    controllersByEra: [
      { untilYear: 873, ruler: 'Uninhabited (Occasional Irish Papar)', polity: 'Sub-Arctic Wilderness', religion: Religion.NorsePagan, factionColor: '#38BDF8', status: 'independent' },
      { untilYear: 1000, ruler: 'Goðar (Chieftain-Priests)', polity: 'Icelandic Commonwealth', religion: Religion.NorsePagan, factionColor: '#38BDF8', status: 'independent' },
      { untilYear: 1100, ruler: 'Christian Goðar', polity: 'Icelandic Commonwealth', religion: Religion.Christian, factionColor: '#38BDF8', status: 'independent' },
    ],
  },
  {
    id: 'akureyri',
    name: 'Akureyri (Eyjafjörður)',
    norseName: 'Eyjafjörðr',
    regionGroup: 'North Atlantic',
    subRegion: 'North Iceland',
    lat: 65.68,
    lon: -18.10,
    settlementType: 'village',
    norsePopulation: 500,
    nativePopulation: 20,
    primaryCulture: 'Old Norse (Icelandic)',
    primaryCultureFa: 'نورس ایسلندی شمالی',
    defaultStatus: 'independent',
    factionColor: '#38BDF8',
    foundedYear: 890,
    baseWealth: 5,
    baseDefense: 4,
    historicalSummary:
      'Deep, sheltered northern fjord settled by Helgi the Lean c. 890, who syncretically prayed to Christ for voyages and Thor for stormy weather.',
    controllersByEra: [
      { untilYear: 1000, ruler: 'Helgi Magri & Northern Goðar', polity: 'Icelandic Commonwealth', religion: Religion.Syncretic, factionColor: '#38BDF8', status: 'independent' },
      { untilYear: 1100, ruler: 'Christian Northern Goðar', polity: 'Icelandic Commonwealth', religion: Religion.Christian, factionColor: '#38BDF8', status: 'independent' },
    ],
  },
  {
    id: 'thingvellir',
    name: 'Thingvellir',
    norseName: 'Þingvellir',
    regionGroup: 'North Atlantic',
    subRegion: 'Icelandic Rift Valley',
    lat: 64.26,
    lon: -21.13,
    settlementType: 'jarldom_seat',
    norsePopulation: 650,
    nativePopulation: 20,
    primaryCulture: 'Old Norse (Icelandic)',
    primaryCultureFa: 'نورس ایسلندی',
    defaultStatus: 'independent',
    factionColor: '#38BDF8',
    foundedYear: 930,
    isThingSite: true,
    baseWealth: 5,
    baseDefense: 4,
    historicalSummary:
      'Volcanic rift plain of Lögberg (Law Rock) where the Althing convened annually from 930 AD without a king, peacefuly adopting Christianity in 999/1000.',
    controllersByEra: [
      { untilYear: 929, ruler: 'Local Kjalarnes Thing', polity: 'Early Settlement', religion: Religion.NorsePagan, factionColor: '#38BDF8', status: 'independent' },
      { untilYear: 1000, ruler: 'Althing & Lawspeaker (Lögsögumaðr)', polity: 'Icelandic Commonwealth', religion: Religion.NorsePagan, factionColor: '#38BDF8', status: 'independent' },
      { untilYear: 1100, ruler: 'Christian Althing', polity: 'Icelandic Commonwealth', religion: Religion.Christian, factionColor: '#38BDF8', status: 'independent' },
    ],
  },
  {
    id: 'brattahlid',
    name: 'Brattahlid (Greenland)',
    norseName: 'Brattahlíð',
    regionGroup: 'North Atlantic',
    subRegion: 'Eystribyggð (Eastern Settlement)',
    lat: 61.15,
    lon: -45.43,
    settlementType: 'village',
    norsePopulation: 400,
    nativePopulation: 0,
    primaryCulture: 'Greenlandic Norse',
    primaryCultureFa: 'نورس گرینلندی',
    defaultStatus: 'independent',
    factionColor: '#38BDF8',
    foundedYear: 985,
    baseWealth: 5,
    baseDefense: 3,
    historicalSummary:
      'Sheltered inner-fjord farm founded c. 985 by outlawed Erik the Red during the Medieval Warm Period; famed for prized walrus ivory and Thjodhild’s small church.',
    controllersByEra: [
      { untilYear: 984, ruler: 'Unsettled Inner Fjords', polity: 'Greenlandic Coast', religion: Religion.NorsePagan, factionColor: '#38BDF8', status: 'independent' },
      { untilYear: 1002, ruler: 'Erik the Red', polity: 'Eastern Settlement', religion: Religion.NorsePagan, factionColor: '#38BDF8', status: 'independent' },
      { untilYear: 1100, ruler: 'Leif Erikson’s Kin & Greenlanders', polity: 'Greenland Commonwealth', religion: Religion.Christian, factionColor: '#38BDF8', status: 'independent' },
    ],
  },
  {
    id: 'gardar',
    name: 'Garðar (Greenland)',
    norseName: 'Garðar',
    regionGroup: 'North Atlantic',
    subRegion: 'Einar’s Fjord (Greenland)',
    lat: 60.98,
    lon: -45.42,
    settlementType: 'monastery',
    norsePopulation: 320,
    nativePopulation: 0,
    primaryCulture: 'Greenlandic Norse',
    primaryCultureFa: 'نورس گرینلندی',
    defaultStatus: 'independent',
    factionColor: '#38BDF8',
    foundedYear: 1000,
    isMonastery: true,
    baseWealth: 5,
    baseDefense: 4,
    historicalSummary:
      'Fertile isthmus farm in Eystribyggð with lush pastures and walrus ivory export docks; later chosen as the seat of the Greenland Catholic diocese.',
    controllersByEra: [
      { untilYear: 1100, ruler: 'Greenland Lawspeaker & Episcopal Farm', polity: 'Greenland Commonwealth', religion: Religion.Christian, factionColor: '#38BDF8', status: 'independent' },
    ],
  },
  {
    id: 'vinland',
    name: "Vinland (L'Anse aux Meadows)",
    norseName: 'Vínland / Straumfjörðr',
    regionGroup: 'North Atlantic',
    subRegion: 'Newfoundland',
    lat: 51.60,
    lon: -55.50,
    settlementType: 'village',
    norsePopulation: 95,
    nativePopulation: 420,
    primaryCulture: 'Indigenous Beothuk & Norse Outpost',
    primaryCultureFa: 'بومیان بئوتوک و وایکینگ‌ها',
    defaultStatus: 'independent',
    factionColor: '#F97316',
    foundedYear: 1000,
    baseWealth: 5,
    baseDefense: 4,
    historicalSummary:
      'Turf-walled Norse ship-repair and timber camp at the tip of Newfoundland c. 1000 AD — confirmed archaeologically by iron-smelting slag and ringed bronze pins, where Norse crews met Indigenous Skrælingjar.',
    controllersByEra: [
      { untilYear: 1100, ruler: 'Indigenous Peoples (Ancestral Beothuk / Dorset) & Seasonal Norse Voyagers', polity: 'Vínland Outpost', religion: Religion.NorsePagan, factionColor: '#F97316', status: 'independent' },
    ],
  },
];

export const SETTLEMENTS_BY_ID: Record<string, Settlement> = SETTLEMENTS.reduce<Record<string, Settlement>>(
  (acc, s) => {
    acc[s.id] = s;
    return acc;
  },
  {}
);

export function getControllerInYear(settlement: Settlement, year: number) {
  for (const entry of settlement.controllersByEra) {
    if (year <= entry.untilYear) return entry;
  }
  return settlement.controllersByEra[settlement.controllersByEra.length - 1];
}

/**
 * Great-circle Haversine distance in nautical miles, plus realistic Viking Age voyage duration & hazard.
 * Longships & knarrs averaged ~5–6 knots (~110–130 NM per 24h) under good open-sea winds, slower along rivers/coasts.
 */
export interface SeasonalWeatherProfile {
  season: Season;
  weatherName: string;
  seaEffectShort: string;
  description: string;
  riskPenaltyPct: number;
  speedPct: number;
}

export function getSeasonalWeatherProfile(
  season: Season,
  lang: Language = 'en'
): SeasonalWeatherProfile {
  const isFa = lang === 'fa';
  switch (season) {
    case Season.Spring:
      return {
        season,
        weatherName: isFa ? 'مه بهاری و آب‌شدن یخ‌ها' : 'Thaw Mist & Drift Ice',
        seaEffectShort: isFa ? '+6% خطر طوفان · سرعت 85%' : '+6% Sea Risk · 85% Speed',
        description: isFa
          ? 'مه غلیظ ساحلی دید ناخدا را کم می‌کند و تکه‌های یخ شناور در آب‌های شمالی دیده می‌شود.'
          : 'Shifting coastal fog dims headland landmarks and early meltwater swells slow oar-crews.',
        riskPenaltyPct: 6,
        speedPct: 85,
      };
    case Season.Summer:
      return {
        season,
        weatherName: isFa ? 'بادهای موافق تابستانی' : 'Fair Summer Winds',
        seaEffectShort: isFa ? '+0% خطر پایه · سرعت کامل 100%' : '+0% Base Risk · 100% Speed',
        description: isFa
          ? 'شب‌های روشن شمال و دریای آرام، بهترین و ایمن‌ترین فصل دریانوردی وایکینگ‌ها را رقم می‌زند.'
          : 'Long bright northern nights and steady following winds offer the safest Viking sailing window.',
        riskPenaltyPct: 0,
        speedPct: 100,
      };
    case Season.Autumn:
      return {
        season,
        weatherName: isFa ? 'باران و تندباد پاییزی' : 'Autumn Rain & Heavy Swells',
        seaEffectShort: isFa ? '+14% خطر طوفان · سرعت 78%' : '+14% Gale Risk · 78% Speed',
        description: isFa
          ? 'باران‌های تند و طوفان‌های دریای شمال به طناب‌ها و بادبان فشار می‌آورد؛ کشتی کِنار پایدارتر است.'
          : 'Driving rain squalls and equinoctial gales batter low-freeboard hulls across the North Sea.',
        riskPenaltyPct: 14,
        speedPct: 78,
      };
    case Season.Winter:
      return {
        season,
        weatherName: isFa ? 'کولاک برف و یخبندان زمستانی' : 'Winter Blizzard & Pack-Ice',
        seaEffectShort: isFa ? '+32% خطر غرق‌شدن · سرعت 62%' : '+32% Gale & Ice Risk · 62% Speed',
        description: isFa
          ? 'امواج یخ‌زده و برف سنگین دریانوردی زمستان را مرگبار می‌کند؛ وایکینگ‌ها معمولاً کشتی‌ها را به خشکی می‌کشند.'
          : 'Freezing spray, blinding snow, and pack-ice make winter crossings perilous for open hulls.',
        riskPenaltyPct: 32,
        speedPct: 62,
      };
  }
}

export interface VoyageDangerBreakdown {
  stormRiskPct: number;
  pirateRiskPct: number;
  hostileFleetRiskPct: number;
  hazardsSummary: string;
  hazardsSummaryFa: string;
}

export interface VoyageMetricsResult {
  nauticalMiles: number;
  sailingDays: number;
  provisionSilverCost: number;
  dangerPct: number;
  dangerBreakdown: VoyageDangerBreakdown;
  seasonRiskDelta: number;
  hullSavedPct: number;
  dangerLevel: 'low' | 'moderate' | 'high' | 'extreme';
  dangerLabel: 'Low' | 'Moderate' | 'High' | 'Extreme (Winter Gale)';
  medievalWarmNote?: string;
}

export function calculateVoyageMetrics(
  from: Settlement,
  to: Settlement,
  season: Season,
  year: number,
  seamanship: number,
  hasKnarr: boolean
): VoyageMetricsResult {
  if (from.id === to.id) {
    return {
      nauticalMiles: 0,
      sailingDays: 0,
      provisionSilverCost: 0,
      dangerPct: 0,
      dangerBreakdown: {
        stormRiskPct: 0,
        pirateRiskPct: 0,
        hostileFleetRiskPct: 0,
        hazardsSummary: 'At anchor in home harbor',
        hazardsSummaryFa: 'در لنگرگاه بندر فعلی',
      },
      seasonRiskDelta: 0,
      hullSavedPct: 0,
      dangerLevel: 'low',
      dangerLabel: 'Low',
    };
  }

  const R_NM = 3440.065; // Earth radius in nautical miles
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLon = toRad(to.lon - from.lon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Multiply by 1.25 coastal routing factor around headlands, fjords and straits
  const nauticalMiles = Math.max(18, Math.round(R_NM * c * 1.25));

  // Speed in NM/day: ~115 NM/day in summer, slower in spring/autumn, hazardous in winter
  const seasonSpeedFactor =
    season === Season.Summer
      ? 1.0
      : season === Season.Spring
        ? 0.85
        : season === Season.Autumn
          ? 0.78
          : 0.62;
  const dailyNm = 115 * seasonSpeedFactor * (1 + seamanship * 0.003);
  const sailingDays = Math.max(1, Math.ceil(nauticalMiles / dailyNm));

  // Provisioning silver cost for food, water, tar and harbor pilotage
  const provisionSilverCost = Math.max(1, Math.round(sailingDays * 1.25));

  const involvesAtlantic =
    from.regionGroup === 'North Atlantic' || to.regionGroup === 'North Atlantic';
  const involvesMediterranean =
    from.regionGroup === 'Mediterranean' ||
    to.regionGroup === 'Mediterranean' ||
    from.regionGroup === 'Iberia & Al-Andalus' ||
    to.regionGroup === 'Iberia & Al-Andalus';
  const involvesEasternRivers =
    from.regionGroup === 'Kievan Rus & Rivers' ||
    to.regionGroup === 'Kievan Rus & Rivers' ||
    from.regionGroup === 'Miklagard & East' ||
    to.regionGroup === 'Miklagard & East' ||
    from.regionGroup === 'Serkland & Caliphate' ||
    to.regionGroup === 'Serkland & Caliphate';
  const involvesBaltic =
    from.regionGroup === 'Baltic' || to.regionGroup === 'Baltic';

  // Specific hazards breakdown
  // 1. Storm risk
  let stormRiskPct =
    season === Season.Winter
      ? involvesAtlantic ? 38 : 32
      : season === Season.Autumn
        ? 15
        : season === Season.Spring
          ? 7
          : 2;

  // 2. Pirate risk
  let pirateRiskPct = 4;
  if (involvesBaltic) pirateRiskPct += 14; // Wendish / Curonian sea-raiders
  if (involvesMediterranean) pirateRiskPct += 16; // Moorish corsairs
  if (involvesEasternRivers) pirateRiskPct += 15; // Pecheneg nomads along Dnieper cataracts

  // 3. Hostile fleet risk
  let hostileFleetRiskPct = 3;
  if (to.id === 'constantinople' || from.id === 'constantinople') hostileFleetRiskPct += 18; // Byzantine Dromons with Greek fire
  if (involvesMediterranean) hostileFleetRiskPct += 12; // Andalusian / Frankish naval patrols
  if (from.regionGroup === 'British Isles' || to.regionGroup === 'British Isles') hostileFleetRiskPct += 8; // Saxon coastal fyrd fleets

  let hullSavedPct = 0;
  if (involvesAtlantic && hasKnarr) {
    stormRiskPct = Math.max(2, stormRiskPct - 8);
    hullSavedPct += 8;
  }
  if ((season === Season.Autumn || season === Season.Winter) && hasKnarr) {
    const roughWeatherHullSave = season === Season.Winter ? 6 : 4;
    stormRiskPct = Math.max(2, stormRiskPct - roughWeatherHullSave);
    hullSavedPct += roughWeatherHullSave;
  }

  // Medieval Warm Period (~950–1066 AD) eased drift ice along Greenland & Iceland sea lanes
  let medievalWarmNote: string | undefined;
  if (involvesAtlantic && year >= 950) {
    stormRiskPct = Math.max(2, stormRiskPct - 5);
    medievalWarmNote = 'Medieval Warm Period reduces pack-ice drift along high-latitude sea lanes.';
  } else if (involvesAtlantic && year < 870) {
    stormRiskPct += 6;
    medievalWarmNote = 'Uncharted western waters with heavy drift-ice before regular landnám pilot lore.';
  }

  const seasonRiskDelta = stormRiskPct;
  const baseDanger = stormRiskPct + pirateRiskPct * 0.45 + hostileFleetRiskPct * 0.45;
  const seamanshipReduction = seamanship * 0.24;
  const dangerPct = Math.max(3, Math.min(88, Math.round(baseDanger - seamanshipReduction)));

  const dangerLevel: 'low' | 'moderate' | 'high' | 'extreme' =
    season === Season.Winter && dangerPct >= 32
      ? 'extreme'
      : dangerPct >= 35
        ? 'high'
        : dangerPct >= 18
          ? 'moderate'
          : 'low';

  const dangerLabel =
    dangerLevel === 'extreme'
      ? 'Extreme (Winter Gale)'
      : dangerLevel === 'high'
        ? 'High'
        : dangerLevel === 'moderate'
          ? 'Moderate'
          : 'Low';

  const hazardsList: string[] = [];
  const hazardsListFa: string[] = [];
  if (stormRiskPct >= 12) {
    hazardsList.push('Storms & Heavy Swells');
    hazardsListFa.push('طوفان و امواج سنگین');
  }
  if (pirateRiskPct >= 10) {
    hazardsList.push('Pirates & Sea-Raiders');
    hazardsListFa.push('دزدان دریایی و کمین‌کنندگان');
  }
  if (hostileFleetRiskPct >= 10) {
    hazardsList.push('Hostile Coastal Fleets');
    hazardsListFa.push('ناوگان‌های رزمی دشمن');
  }
  if (hazardsList.length === 0) {
    hazardsList.push('Calm Waters & Favorable Winds');
    hazardsListFa.push('آب‌های آرام و بادهای موافق');
  }

  return {
    nauticalMiles,
    sailingDays,
    provisionSilverCost,
    dangerPct,
    dangerBreakdown: {
      stormRiskPct,
      pirateRiskPct,
      hostileFleetRiskPct,
      hazardsSummary: hazardsList.join(' · '),
      hazardsSummaryFa: hazardsListFa.join(' · '),
    },
    seasonRiskDelta,
    hullSavedPct,
    dangerLevel,
    dangerLabel,
    medievalWarmNote,
  };
}

/**
 * Dynamic historical realm overlays by year for the interactive Map tab.
 */
export interface HistoricalBorderZone {
  id: string;
  label: string;
  sublabel: string;
  stroke: string;
  fill: string;
  coords: [number, number][];
}

export function getHistoricalBordersForYear(year: number): HistoricalBorderZone[] {
  const zones: HistoricalBorderZone[] = [];

  if (year >= 866 && year <= 954) {
    zones.push({
      id: 'danelaw',
      label: 'The Danelaw',
      sublabel: year >= 878 ? 'Treaty of Alfred & Guthrum Boundary' : 'Great Heathen Army Conquests',
      stroke: '#FF8C1A',
      fill: 'rgba(255, 106, 0, 0.11)',
      coords: [
        [54.9, -1.5], [53.9, -2.5], [52.8, -1.8], [51.6, -0.2],
        [51.7, 1.3], [52.9, 1.7], [54.5, -0.6],
      ],
    });
  }

  if (year >= 872 && year < 1016) {
    zones.push({
      id: 'norway_kingdom',
      label: 'Kingdom of Norway',
      sublabel: year < 930 ? 'Harald Fairhair’s Unification' : 'Coastal Realm & Lade Earldom',
      stroke: '#C24E00',
      fill: 'rgba(194, 78, 0, 0.10)',
      coords: [
        [58.0, 6.8], [59.1, 10.6], [63.8, 11.2], [65.5, 12.2],
        [63.2, 5.2], [60.2, 4.8],
      ],
    });
  }

  if (year >= 911) {
    zones.push({
      id: 'normandy',
      label: 'Duchy of Normandy',
      sublabel: year < 940 ? 'Rollo’s Grant (Saint-Clair-sur-Epte, 911)' : 'Norman Realm',
      stroke: '#EDE6DC',
      fill: 'rgba(237, 230, 220, 0.09)',
      coords: [
        [49.7, -1.9], [49.9, 1.4], [49.0, 1.6], [48.6, -1.6],
      ],
    });
  }

  if (year >= 1016 && year <= 1035) {
    zones.push({
      id: 'north_sea_empire',
      label: 'North Sea Empire of Cnut',
      sublabel: 'England, Denmark & Norway (1016–1035)',
      stroke: '#FF6A00',
      fill: 'rgba(255, 106, 0, 0.13)',
      coords: [
        [50.6, -2.6], [54.8, -3.2], [58.5, 6.2], [63.6, 10.6],
        [56.2, 12.6], [54.2, 9.8], [51.3, 1.4],
      ],
    });
  }

  return zones;
}

export const SEA_ROUTES: [string, string][] = [
  // Scandinavia & North Sea
  ['hedeby', 'dorestad'],
  ['hedeby', 'roskilde'],
  ['ribe', 'jorvik'],
  ['ribe', 'london'],
  ['kaupang', 'jelling'],
  ['kaupang', 'roskilde'],
  ['roskilde', 'birka'],
  ['birka', 'uppsala'],
  ['birka', 'sigtuna'],
  ['nidaros', 'kaupang'],
  ['nidaros', 'shetland'],

  // North Atlantic Stepping Stones
  ['shetland', 'kirkwall'],
  ['shetland', 'faroes'],
  ['faroes', 'reykjavik'],
  ['reykjavik', 'akureyri'],
  ['reykjavik', 'thingvellir'],
  ['reykjavik', 'brattahlid'],
  ['brattahlid', 'gardar'],
  ['brattahlid', 'vinland'],

  // British Isles & Ireland
  ['kirkwall', 'lindisfarne'],
  ['lindisfarne', 'jorvik'],
  ['jorvik', 'repton'],
  ['repton', 'maldon'],
  ['maldon', 'london'],
  ['london', 'winchester'],
  ['kirkwall', 'iona'],
  ['iona', 'isle_of_man'],
  ['isle_of_man', 'dublin'],
  ['dublin', 'tara'],
  ['dublin', 'waterford'],
  ['waterford', 'wexford'],
  ['waterford', 'limerick'],

  // English Channel & Frankia
  ['waterford', 'rouen'],
  ['winchester', 'rouen'],
  ['london', 'rouen'],
  ['dorestad', 'rouen'],
  ['rouen', 'paris'],
  ['rouen', 'nantes_noirmoutier'],

  // Atlantic Route to Iberia & Al-Andalus
  ['nantes_noirmoutier', 'santiago'],
  ['santiago', 'lisbon'],
  ['lisbon', 'seville'],
  ['seville', 'cordoba'],
  ['seville', 'nekor'],

  // Mediterranean Highway
  ['nekor', 'palermo'],
  ['palermo', 'luna'],
  ['palermo', 'constantinople'],

  // Baltic Sea Routes
  ['roskilde', 'jomsborg'],
  ['jomsborg', 'truso'],
  ['truso', 'grobina'],
  ['grobina', 'visby'],
  ['visby', 'birka'],
  ['visby', 'roskilde'],
  ['birka', 'staraya_ladoga'],

  // The Eastern River Route to Constantinople (Austrvegr)
  ['staraya_ladoga', 'novgorod'],
  ['novgorod', 'gnezdovo'],
  ['gnezdovo', 'kiev'],
  ['kiev', 'constantinople'],

  // The Volga Route to Serkland & Caliphate
  ['novgorod', 'bulgar'],
  ['bulgar', 'atil'],
  ['atil', 'gorgan'],
  ['gorgan', 'baghdad'],
];
