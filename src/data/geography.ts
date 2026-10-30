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
 * Converts a sequence of [lat, lon] waypoints into a smooth Catmull-Rom cubic Bezier SVG path.
 * Produces organic, realistic coastlines and river bends without sharp geometric corners.
 */
export function pointsToSmoothSvgPath(
  coords: [number, number][],
  closed = true,
  tension = 0.22
): string {
  if (coords.length === 0) return '';
  const pts = coords.map(([lat, lon]) => projectLatLon(lat, lon));
  if (pts.length < 3) {
    return (
      pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ') +
      (closed ? ' Z' : '')
    );
  }

  const n = pts.length;
  const getPt = (idx: number) => {
    if (closed) {
      return pts[((idx % n) + n) % n];
    }
    return pts[Math.max(0, Math.min(n - 1, idx))];
  };

  let d = `M ${pts[0].x} ${pts[0].y}`;
  const count = closed ? n : n - 1;

  for (let i = 0; i < count; i++) {
    const p0 = getPt(i - 1);
    const p1 = getPt(i);
    const p2 = getPt(i + 1);
    const p3 = getPt(i + 2);

    const cp1x = Math.round((p1.x + (p2.x - p0.x) * tension) * 10) / 10;
    const cp1y = Math.round((p1.y + (p2.y - p0.y) * tension) * 10) / 10;
    const cp2x = Math.round((p2.x - (p3.x - p1.x) * tension) * 10) / 10;
    const cp2y = Math.round((p2.y - (p3.y - p1.y) * tension) * 10) / 10;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  if (closed) d += ' Z';
  return d;
}

/**
 * High-resolution geographic landmass outlines in [lat, lon] waypoints.
 * Continuous continental rings eliminate artificial seams between European regions.
 */
export const LANDMASS_POLYGONS: { id: string; name: string; coords: [number, number][] }[] = [
  {
    id: 'scandinavia_nordic',
    name: 'Scandinavian Peninsula, Finland & Kola',
    coords: [
      // Scania & Blekinge
      [55.38, 12.82], [55.42, 13.85], [55.55, 14.32], [56.02, 14.55], [56.16, 15.58],
      // Kalmar & Småland coast
      [56.65, 16.36], [57.25, 16.52], [57.78, 16.68], [58.42, 16.95], [58.75, 17.45],
      // Södermanland, Birka/Mälaren mouth & Uppland
      [59.28, 18.35], [59.75, 19.05], [60.25, 18.65], [60.65, 17.95], [61.28, 17.25],
      // Gulf of Bothnia west shore (Hälsingland, Ångermanland, Västerbotten)
      [62.38, 17.48], [63.25, 18.85], [63.82, 20.45], [64.75, 21.25], [65.58, 22.18],
      [65.85, 24.15],
      // Gulf of Bothnia east shore (Finland: Oulu, Vaasa, Turku, Helsinki)
      [65.02, 25.45], [64.22, 23.92], [63.12, 21.55], [62.15, 21.35], [61.48, 21.48],
      [60.45, 22.15], [59.98, 23.45], [60.15, 24.95], [60.45, 26.85], [60.68, 28.65],
      // Karelia & Northeast connection to Arctic/Kola
      [61.55, 30.25], [64.55, 34.85], [66.55, 34.25], [66.25, 38.55], [67.15, 41.25],
      [68.85, 37.25], [69.25, 33.45], [69.75, 30.85], [70.05, 27.95], [70.45, 25.45],
      // Northern Norway (Finnmark, Troms, Lofoten, Narvik)
      [69.65, 18.95], [68.85, 16.55], [68.15, 13.55], [68.55, 14.95], [67.85, 15.35],
      // Helgeland & Trøndelag (Nidaros / Trondheimsfjord)
      [66.85, 13.65], [65.85, 12.25], [64.85, 11.15], [63.85, 9.65], [63.43, 10.39],
      [63.55, 9.25], [62.95, 7.15], [62.45, 6.15], [62.15, 5.12],
      // Western Norway Fjords (Sognefjord, Bergen, Hardangerfjord, Stavanger)
      [61.55, 4.85], [61.12, 5.05], [61.08, 6.45], [60.88, 5.15], [60.39, 5.22],
      [59.95, 5.35], [59.42, 5.28], [58.97, 5.65], [58.45, 6.02], [58.02, 7.05],
      // Agder, Telemark & Oslofjord (Kaupang, Tønsberg, Oslo)
      [58.15, 8.05], [58.45, 8.78], [59.03, 10.03], [59.38, 10.48], [59.88, 10.72],
      [59.45, 10.92], [58.95, 11.18],
      // Bohuslän, Göta Älv & Halland down to Øresund
      [58.35, 11.42], [57.71, 11.88], [57.12, 12.22], [56.65, 12.68], [56.28, 12.48],
      [56.02, 12.68], [55.65, 12.95],
    ],
  },
  {
    id: 'continental_europe_rus',
    name: 'Continental Europe, Jutland, Iberia, Italy, Greece & Kievan Rus',
    coords: [
      // Strait of Gibraltar & Southern Spain
      [36.02, -5.62], [36.15, -5.35], [36.52, -4.85], [36.72, -4.42], [36.75, -3.55],
      [36.82, -2.45], [37.58, -0.98], [38.35, -0.48], [38.85, 0.12], [39.48, -0.32],
      [40.42, 0.45], [40.72, 0.85], [41.38, 2.18], [41.95, 3.18], [42.45, 3.18],
      // Gulf of Lion, Provence & Côte d'Azur
      [42.85, 3.05], [43.32, 3.52], [43.45, 4.82], [43.28, 5.38], [43.12, 6.15],
      [43.55, 7.02], [43.78, 7.55],
      // Italian Peninsula — West Coast (Liguria, Tuscany, Rome, Naples, Calabria)
      [44.41, 8.93], [44.08, 9.82], [43.55, 10.31], [42.92, 10.55], [42.42, 11.15],
      [41.88, 12.25], [41.25, 13.55], [40.82, 14.25], [40.62, 14.55], [40.02, 15.28],
      [39.15, 16.05], [38.22, 15.65], [37.92, 15.82], [38.35, 16.48],
      // Gulf of Taranto, Apulia (Heel), Gargano & Adriatic East Coast of Italy
      [39.05, 17.12], [39.75, 16.52], [40.45, 17.22], [40.12, 17.98], [39.82, 18.36],
      [40.65, 17.95], [41.12, 16.86], [41.65, 15.92], [41.92, 16.15], [42.15, 15.45],
      [42.85, 13.92], [43.62, 13.51], [44.42, 12.28], [45.22, 12.28], [45.44, 12.33],
      [45.68, 13.58],
      // Istria, Dalmatia & Albanian Coast
      [45.15, 13.62], [44.85, 13.85], [45.28, 14.45], [44.12, 15.22], [43.51, 16.44],
      [42.65, 18.09], [41.92, 19.35], [41.32, 19.45], [40.45, 19.48], [39.62, 20.02],
      // Greece — Ionian Coast, Gulf of Patras & Peloponnese
      [38.95, 20.75], [38.32, 21.42], [38.18, 21.35], [37.68, 21.15], [36.92, 21.68],
      [36.75, 21.95], [37.02, 22.12], [36.42, 22.48], [36.82, 22.65], [36.45, 23.15],
      [37.55, 22.82], [37.45, 23.45], [37.78, 23.15],
      // Attica (Athens/Piraeus), Euboea, Thessaly, Chalkidiki & Thrace
      [37.94, 23.64], [37.68, 24.02], [38.45, 23.85], [38.95, 23.15], [39.35, 22.95],
      [39.95, 22.65], [40.52, 22.92], [40.02, 23.55], [40.25, 24.15], [40.85, 24.42],
      [40.88, 25.85], [40.55, 26.75], [40.15, 26.42],
      // Sea of Marmara North Shore & Constantinople (Bosporus)
      [40.95, 27.52], [41.01, 28.97],
      // Western & Northern Black Sea (Bulgaria, Danube Delta, Odessa, Crimea, Sea of Azov)
      [41.85, 27.95], [42.52, 27.48], [43.21, 27.92], [44.18, 28.65], [45.22, 29.68],
      [46.15, 30.45], [46.62, 31.95], [46.15, 33.45],
      // Crimean Peninsula (Chersonesus, Yalta, Kerch)
      [45.35, 32.55], [44.58, 33.52], [44.42, 34.15], [44.95, 35.35], [45.32, 36.45],
      // Sea of Azov & Taman / Caucasus Black Sea Shore
      [46.15, 35.15], [46.72, 36.85], [47.18, 39.15], [46.65, 38.25], [45.35, 37.15],
      [44.62, 37.95], [43.58, 39.72], [42.85, 41.15], [41.65, 41.62],
      // Caucasus Interior & Caspian Sea Basin Sweep
      [42.05, 45.25], [42.85, 47.65], [44.25, 46.85], [45.85, 47.45], [46.35, 48.05],
      [47.12, 51.85], [45.55, 53.25], [47.55, 58.0], [67.5, 58.0], [67.5, 42.5],
      // Northern Russia & Baltic East Coast (Gulf of Finland, Estonia, Riga, Prussia)
      [60.15, 29.85], [59.93, 30.25], [59.65, 28.15], [59.43, 24.75], [59.15, 23.55],
      [58.38, 24.48], [57.75, 24.35], [56.95, 24.11], [57.58, 21.75], [56.65, 21.02],
      [55.71, 21.12], [54.95, 20.25], [54.68, 19.95], [54.35, 18.95], [54.45, 18.55],
      [54.78, 18.35], [54.55, 16.85], [54.15, 15.55], [53.92, 14.25], [54.42, 13.45],
      [54.18, 12.12], [53.98, 10.88], [54.42, 10.22], [54.51, 9.56],
      // Jutland Peninsula — East Coast (Schleswig/Hedeby, Aarhus, Kattegat, Skagen)
      [54.82, 9.85], [55.25, 9.75], [55.58, 9.78], [55.85, 10.15], [56.15, 10.22],
      [56.45, 10.88], [56.72, 10.32], [57.05, 10.02], [57.45, 10.52], [57.72, 10.58],
      // Jutland Peninsula — West Coast (Thy, Ringkøbing, Ribe, Wadden Sea)
      [57.12, 8.62], [56.55, 8.15], [55.95, 8.15], [55.45, 8.42], [55.32, 8.75],
      [54.85, 8.65], [54.32, 8.62], [53.88, 8.85],
      // Frisia, Zuiderzee, Rhine Delta & Flanders (Dorestad, Utrecht, Antwerp, Calais)
      [53.55, 8.12], [53.68, 7.25], [53.42, 6.15], [53.25, 5.15], [52.88, 4.72],
      [52.38, 4.55], [51.92, 4.08], [51.55, 3.55], [51.28, 3.05], [50.95, 1.85],
      // Normandy, Contentin Peninsula (Cherbourg) & Brittany (Brest, Quiberon, Nantes)
      [50.45, 1.58], [49.95, 1.12], [49.48, 0.12], [49.32, -0.45], [49.38, -1.15],
      [49.68, -1.32], [49.68, -1.92], [48.65, -1.58], [48.68, -2.35], [48.78, -3.55],
      [48.42, -4.75], [48.02, -4.65], [47.78, -4.15], [47.48, -3.05], [47.22, -2.18],
      // Bay of Biscay (Poitou, Bordeaux, Gascony)
      [46.62, -1.85], [46.15, -1.18], [45.55, -1.12], [44.65, -1.22], [43.48, -1.55],
      // Northern Spain & Galicia (Bilbao, Santander, Gijón, Santiago/Coruña, Finisterre)
      [43.32, -1.98], [43.45, -3.82], [43.55, -5.65], [43.58, -7.25], [43.72, -7.88],
      [43.36, -8.42], [42.88, -9.26], [42.22, -8.75],
      // Portugal & Southwestern Iberia (Porto, Coimbra, Lisbon, Cape St. Vincent, Seville, Cadiz)
      [41.15, -8.68], [40.15, -8.88], [39.35, -9.38], [38.72, -9.45], [38.68, -9.15],
      [38.45, -8.88], [37.75, -8.82], [37.02, -8.98], [37.02, -7.92], [37.18, -6.95],
      [36.78, -6.35], [36.52, -6.28], [36.18, -5.92],
    ],
  },
  {
    id: 'anatolia_levant_maghreb',
    name: 'Anatolia, Levant, Mesopotamia, Egypt & North Africa',
    coords: [
      // Bosporus Asian Shore & Southern Black Sea (Pontus, Sinop, Trebizond, Batumi)
      [41.02, 29.08], [41.22, 30.15], [41.45, 31.78], [41.95, 33.45], [42.02, 35.15],
      [41.62, 35.95], [41.28, 36.35], [41.02, 37.88], [41.01, 39.72], [41.45, 41.45],
      // Eastern Highlands, Persia & Southern Map Border
      [39.85, 44.55], [38.25, 48.85], [37.15, 50.25], [36.65, 53.55], [37.25, 58.0],
      [25.0, 58.0], [25.0, -14.0],
      // Atlantic Morocco (Agadir, Casablanca, Rabat, Cape Spartel, Tangier, Ceuta)
      [31.52, -9.75], [33.58, -7.62], [34.25, -6.62], [35.78, -5.92], [35.88, -5.32],
      // Rif, Oran, Algiers, Kabylia, Annaba & Tunis / Cape Bon
      [35.22, -3.92], [35.18, -2.25], [35.72, -0.65], [36.15, 0.25], [36.78, 3.05],
      [36.92, 5.75], [37.05, 7.25], [37.28, 9.85], [36.82, 10.22], [37.05, 11.05],
      // Eastern Tunisia (Sousse, Sfax, Djerba), Tripoli & Gulf of Sidra
      [35.82, 10.65], [34.74, 10.76], [33.85, 10.12], [33.15, 11.55], [32.89, 13.19],
      [32.35, 15.12], [31.22, 16.58], [30.45, 18.55], [30.85, 20.12],
      // Cyrenaica (Benghazi, Tobruk), Alexandria & Nile Delta
      [32.12, 20.08], [32.85, 21.85], [32.08, 23.98], [31.52, 25.15], [31.35, 27.25],
      [31.21, 29.92], [31.55, 31.15], [31.25, 32.32], [31.12, 33.85],
      // Levant Coast (Gaza, Jaffa, Acre, Tyre, Beirut, Tripoli, Latakia, Antioch)
      [31.52, 34.45], [32.08, 34.78], [32.92, 35.08], [33.89, 35.49], [34.45, 35.82],
      [35.52, 35.78], [36.12, 35.92], [36.58, 36.15], [36.82, 35.48],
      // Southern & Western Anatolia (Cilicia, Antalya, Lycia, Rhodes coast, Smyrna, Troy, Marmara)
      [36.28, 33.85], [36.08, 32.82], [36.55, 31.98], [36.88, 30.71], [36.22, 29.65],
      [36.68, 28.05], [37.03, 27.42], [37.85, 27.25], [38.42, 27.12], [38.65, 26.52],
      [39.25, 26.65], [39.48, 26.12], [40.02, 26.22], [40.38, 27.82], [40.42, 28.95],
      [40.75, 29.35],
    ],
  },
  {
    id: 'great_britain',
    name: 'Great Britain (England, Scotland & Wales)',
    coords: [
      // Cornwall & South Coast (Land's End, Plymouth, Isle of Wight, Sussex, Kent)
      [50.07, -5.71], [49.96, -5.21], [50.35, -4.15], [50.22, -3.65], [50.62, -2.45],
      [50.68, -1.32], [50.78, -0.15], [50.92, 0.96], [51.12, 1.38], [51.38, 1.44],
      // Thames Estuary, Essex & East Anglia
      [51.48, 0.65], [51.78, 1.15], [52.15, 1.62], [52.48, 1.76], [52.95, 1.32],
      [52.92, 0.48],
      // The Wash, Lincolnshire, Humber Estuary & Yorkshire
      [52.82, 0.05], [53.15, 0.35], [53.58, 0.12], [53.68, -0.45], [53.72, 0.12],
      [54.12, -0.08], [54.49, -0.61], [54.68, -1.18], [55.02, -1.42], [55.62, -1.65],
      // Eastern Scotland (Firth of Forth, Fife, Aberdeenshire, Moray Firth, Caithness)
      [55.98, -2.65], [56.02, -3.35], [56.18, -2.95], [56.28, -2.58], [56.72, -2.45],
      [57.15, -2.08], [57.69, -1.98], [57.68, -3.25], [57.58, -4.15], [57.85, -3.85],
      [58.25, -3.45], [58.64, -3.07],
      // Northern & Western Scotland (Cape Wrath, Skye, Mull, Kintyre, Firth of Clyde)
      [58.58, -4.02], [58.62, -5.01], [58.15, -5.35], [57.75, -5.78], [57.25, -6.25],
      [56.72, -6.18], [56.42, -5.52], [55.85, -5.65], [55.31, -5.62], [55.65, -5.25],
      [55.88, -4.85], [55.45, -4.65], [54.98, -5.15], [54.65, -4.88],
      // Solway Firth, Cumbria, Lancashire & Wales (Anglesey, Llŷn, Pembrokeshire, Gower)
      [54.85, -3.55], [54.45, -3.58], [54.05, -2.95], [53.42, -3.08], [53.32, -3.82],
      [53.42, -4.55], [53.15, -4.32], [52.78, -4.75], [52.88, -4.12], [52.38, -4.08],
      [52.02, -4.95], [51.88, -5.28], [51.66, -5.05], [51.58, -4.18], [51.45, -3.55],
      // Bristol Channel & North Devon
      [51.52, -2.85], [51.22, -3.45], [51.18, -4.22], [50.98, -4.55], [50.55, -4.95],
    ],
  },
  {
    id: 'ireland',
    name: 'Ireland (Éire / Hibernia)',
    coords: [
      // South & Southwest (Mizen Head, Bantry, Kerry, Dingle, Shannon Estuary)
      [51.45, -9.82], [51.72, -10.15], [52.12, -10.38], [52.28, -9.85], [52.56, -9.92],
      [52.66, -8.85], [52.75, -9.55],
      // Connacht & Donegal (Galway Bay, Connemara, Mayo, Donegal Bay, Malin Head)
      [53.12, -9.35], [53.25, -9.08], [53.42, -10.15], [53.85, -9.95], [54.25, -10.02],
      [54.28, -8.85], [54.58, -8.35], [54.68, -8.78], [55.15, -8.32], [55.37, -7.37],
      // Ulster & East Coast (Lough Foyle, Antrim, Belfast Lough, Dundalk, Dublin, Wexford, Cork)
      [55.18, -6.55], [54.85, -5.82], [54.65, -5.65], [54.22, -5.62], [53.98, -6.18],
      [53.65, -6.12], [53.35, -6.12], [52.98, -6.02], [52.34, -6.38], [52.15, -6.58],
      [52.12, -7.12], [51.98, -7.68], [51.82, -8.25], [51.58, -8.95],
    ],
  },
  {
    id: 'iceland',
    name: 'Iceland (Ísland)',
    coords: [
      // South Coast & Reykjanes
      [63.42, -19.05], [63.82, -21.15], [63.82, -22.68], [64.08, -22.05], [64.35, -21.65],
      // Snæfellsnes & Breiðafjörður
      [64.75, -23.85], [64.95, -23.95], [65.05, -22.45], [65.38, -21.95],
      // Westfjords (Vestfirðir)
      [65.52, -24.35], [66.05, -23.82], [66.45, -22.45], [65.85, -21.35],
      // North Coast (Húnaflói, Tröllaskagi, Eyjafjörður, Tjörnes, Langanes)
      [65.62, -20.65], [66.15, -18.95], [65.72, -18.12], [66.18, -17.15], [66.52, -16.15],
      [66.38, -14.65], [65.85, -14.55],
      // Eastfjords & Vatnajökull South Shore
      [65.25, -13.62], [64.55, -14.48], [64.22, -15.22], [63.95, -16.45], [63.65, -17.85],
    ],
  },
  {
    id: 'greenland_south',
    name: 'Southern Greenland (Eystribyggð & Vestribyggð)',
    coords: [
      [67.5, -53.6], [66.45, -53.35], [65.25, -52.55], [64.18, -51.72], [63.85, -50.65],
      [63.15, -50.95], [62.05, -49.65], [61.15, -48.35], [60.75, -46.05], [61.15, -45.45],
      [60.45, -45.25], [59.78, -43.92], [60.55, -42.85], [61.85, -42.15], [63.25, -41.15],
      [64.45, -40.15], [65.62, -37.55], [66.45, -35.25], [67.5, -33.2],
    ],
  },
  {
    id: 'vinland_newfoundland',
    name: 'Vinland (Newfoundland, Markland & Labrador)',
    coords: [
      [54.8, -64.0], [54.25, -57.45], [53.25, -55.78], [52.15, -55.62], [51.62, -56.45],
      [51.58, -55.45], [50.85, -56.15], [49.95, -55.65], [49.45, -54.15], [48.65, -53.05],
      [47.55, -52.68], [46.85, -53.55], [47.15, -55.65], [47.62, -57.85], [47.58, -59.32],
      [48.55, -59.15], [49.35, -58.25], [50.25, -57.55], [51.15, -56.95], [51.45, -57.25],
      [50.25, -60.55], [50.15, -64.0],
    ],
  },
  {
    id: 'zealand',
    name: 'Sjælland (Zealand)',
    coords: [
      [55.98, 11.35], [56.12, 12.25], [55.68, 12.62], [55.28, 12.42], [55.02, 11.95],
      [55.22, 11.18], [55.65, 11.08],
    ],
  },
  {
    id: 'funen',
    name: 'Fyn (Funen)',
    coords: [
      [55.58, 10.35], [55.45, 10.78], [55.05, 10.68], [55.08, 10.12], [55.38, 9.85],
    ],
  },
  {
    id: 'gotland_baltic_isle',
    name: 'Gotland (Götland)',
    coords: [
      [57.92, 19.05], [57.72, 18.98], [57.42, 18.88], [56.92, 18.18], [57.25, 18.12],
      [57.65, 18.32], [57.88, 18.65],
    ],
  },
  {
    id: 'oland_baltic_isle',
    name: 'Öland',
    coords: [
      [57.35, 17.08], [56.85, 16.82], [56.22, 16.42], [56.35, 16.32], [56.95, 16.62],
    ],
  },
  {
    id: 'saaremaa_baltic_isle',
    name: 'Saaremaa (Ösel)',
    coords: [
      [58.62, 22.55], [58.45, 23.08], [58.18, 22.58], [57.95, 22.05], [58.35, 21.85],
    ],
  },
  {
    id: 'sicily_island',
    name: 'Sicily (Sikiley)',
    coords: [
      [38.25, 15.62], [37.52, 15.12], [36.68, 15.08], [37.12, 13.85], [37.65, 12.52],
      [38.15, 12.75], [38.12, 13.36], [38.05, 14.45],
    ],
  },
  {
    id: 'sardinia_island',
    name: 'Sardinia',
    coords: [
      [41.22, 9.25], [40.55, 9.78], [39.15, 9.55], [38.88, 8.65], [39.85, 8.45],
      [40.85, 8.22],
    ],
  },
  {
    id: 'corsica_island',
    name: 'Corsica',
    coords: [
      [42.98, 9.42], [42.25, 9.55], [41.38, 9.18], [41.75, 8.68], [42.58, 8.75],
    ],
  },
  {
    id: 'crete_island',
    name: 'Crete',
    coords: [
      [35.58, 23.58], [35.42, 24.45], [35.32, 25.15], [35.18, 26.28], [34.95, 25.45],
      [35.02, 24.65], [35.22, 23.62],
    ],
  },
  {
    id: 'cyprus_island',
    name: 'Cyprus',
    coords: [
      [35.65, 34.55], [35.02, 33.98], [34.62, 32.98], [34.92, 32.32], [35.18, 32.85],
      [35.35, 33.65],
    ],
  },
  {
    id: 'mallorca_island',
    name: 'Mallorca (Balearic Isles)',
    coords: [
      [39.92, 3.18], [39.58, 3.42], [39.32, 2.98], [39.55, 2.38], [39.82, 2.75],
    ],
  },
  {
    id: 'outer_hebrides',
    name: 'Outer Hebrides (Suðreyjar)',
    coords: [
      [58.48, -6.22], [58.12, -6.38], [57.65, -7.12], [57.08, -7.38], [57.38, -7.45],
      [57.95, -6.98],
    ],
  },
];

/**
 * Major European & Eurasian inland seas/lakes rendered in ocean tones over landmass polygons.
 */
export const INLAND_LAKES: { id: string; name: string; coords: [number, number][] }[] = [
  {
    id: 'lake_ladoga',
    name: 'Lake Ladoga (Aldeigjuborg Sea)',
    coords: [
      [61.65, 30.35], [61.45, 31.85], [60.55, 32.65], [60.05, 31.15], [60.65, 30.12],
    ],
  },
  {
    id: 'lake_onega',
    name: 'Lake Onega',
    coords: [
      [62.65, 34.45], [62.25, 35.85], [61.15, 35.65], [61.45, 34.35],
    ],
  },
  {
    id: 'lake_vanern',
    name: 'Lake Vänern',
    coords: [
      [59.35, 13.15], [59.15, 14.05], [58.45, 13.65], [58.38, 12.45], [58.95, 12.65],
    ],
  },
  {
    id: 'lake_vattern',
    name: 'Lake Vättern',
    coords: [
      [58.85, 14.95], [58.35, 14.65], [57.78, 14.22], [58.25, 14.15],
    ],
  },
  {
    id: 'caspian_sea',
    name: 'Caspian Sea (Serkland Sea)',
    coords: [
      [46.85, 47.65], [47.15, 51.85], [45.25, 51.55], [44.25, 50.25], [42.15, 52.55],
      [39.85, 53.25], [37.15, 53.85], [36.65, 51.85], [37.45, 49.25], [39.15, 49.05],
      [40.35, 50.15], [41.85, 48.55], [43.85, 47.55], [45.55, 47.25],
    ],
  },
];

/**
 * Topographic mountain ridge chains in [lat, lon] waypoints for authentic physical map relief.
 */
export const MOUNTAIN_RANGES: { id: string; name: string; coords: [number, number][] }[] = [
  {
    id: 'scandes_kjolen',
    name: 'Scandinavian Mountains (Kjølen)',
    coords: [
      [59.5, 7.2], [60.8, 7.8], [62.0, 8.8], [63.2, 11.5], [64.8, 13.5], [66.5, 15.2], [68.2, 17.8],
    ],
  },
  {
    id: 'scottish_highlands',
    name: 'Scottish Highlands',
    coords: [
      [56.5, -4.8], [57.0, -4.3], [57.5, -4.7], [58.1, -4.5],
    ],
  },
  {
    id: 'pyrenees',
    name: 'Pyrenees',
    coords: [
      [43.0, -1.3], [42.7, 0.2], [42.5, 1.6], [42.4, 2.7],
    ],
  },
  {
    id: 'alps',
    name: 'The Alps',
    coords: [
      [44.3, 6.8], [45.8, 7.2], [46.5, 8.6], [47.0, 10.8], [47.2, 13.2], [47.4, 15.2],
    ],
  },
  {
    id: 'apennines',
    name: 'Apennines',
    coords: [
      [44.2, 10.6], [43.1, 12.6], [42.0, 13.8], [40.8, 15.4], [39.5, 16.3],
    ],
  },
  {
    id: 'carpathians',
    name: 'Carpathian Mountains',
    coords: [
      [49.2, 19.5], [48.8, 22.2], [47.5, 24.8], [45.8, 25.6], [45.4, 23.5],
    ],
  },
  {
    id: 'balkans_pindus',
    name: 'Dinaric & Pindus Range',
    coords: [
      [44.2, 16.5], [42.8, 18.8], [41.2, 20.6], [39.6, 21.4],
    ],
  },
  {
    id: 'caucasus',
    name: 'Greater Caucasus',
    coords: [
      [44.2, 39.5], [43.3, 42.4], [42.4, 45.2], [41.4, 47.8],
    ],
  },
  {
    id: 'taurus_anatolia',
    name: 'Taurus Mountains',
    coords: [
      [37.2, 30.2], [37.0, 32.8], [37.6, 35.4], [38.4, 38.5], [38.8, 41.8],
    ],
  },
  {
    id: 'atlas_maghreb',
    name: 'Atlas Mountains',
    coords: [
      [31.8, -7.2], [32.8, -4.5], [34.2, -1.5], [35.5, 3.2], [36.0, 6.8],
    ],
  },
];

export const NAVIGABLE_RIVERS: { name: string; coords: [number, number][] }[] = [
  {
    name: 'Seine',
    coords: [[49.45, 0.15], [49.44, 1.1], [49.1, 1.6], [48.86, 2.35], [48.3, 4.0]],
  },
  {
    name: 'Loire',
    coords: [[47.2, -2.1], [47.2, -1.5], [47.3, -0.6], [47.4, 0.7], [47.9, 1.9], [46.9, 3.1]],
  },
  {
    name: 'Garonne',
    coords: [[45.55, -1.05], [44.84, -0.57], [44.2, 0.6], [43.6, 1.44]],
  },
  {
    name: 'Rhône',
    coords: [[43.45, 4.82], [43.95, 4.8], [44.9, 4.88], [45.76, 4.83], [46.2, 6.1]],
  },
  {
    name: 'Thames',
    coords: [[51.48, 0.72], [51.51, -0.13], [51.46, -0.97], [51.75, -1.25]],
  },
  {
    name: 'Humber & Ouse',
    coords: [[53.6, 0.1], [53.7, -0.8], [53.96, -1.08], [54.2, -1.5]],
  },
  {
    name: 'Rhine',
    coords: [[51.92, 4.12], [51.97, 5.34], [51.45, 6.75], [50.94, 6.96], [50.0, 8.27], [48.58, 7.75], [47.56, 7.59]],
  },
  {
    name: 'Elbe',
    coords: [[53.88, 8.88], [53.55, 9.99], [53.1, 11.4], [52.13, 11.62], [51.05, 13.74], [50.08, 14.42]],
  },
  {
    name: 'Vistula',
    coords: [[54.35, 18.95], [53.01, 18.6], [52.23, 21.01], [50.06, 19.94]],
  },
  {
    name: 'Danube',
    coords: [[45.22, 29.68], [44.4, 28.0], [43.8, 24.8], [44.82, 20.46], [47.5, 19.04], [48.2, 16.37], [48.7, 13.4]],
  },
  {
    name: 'Tagus',
    coords: [[38.68, -9.15], [39.2, -8.6], [39.47, -7.5], [39.86, -4.02]],
  },
  {
    name: 'Guadalquivir',
    coords: [[36.8, -6.3], [37.38, -5.99], [37.88, -4.78], [38.0, -3.4]],
  },
  {
    name: 'Ebro',
    coords: [[40.72, 0.85], [41.2, 0.3], [41.65, -0.88], [42.46, -2.45]],
  },
  {
    name: 'Po',
    coords: [[44.95, 12.28], [45.05, 11.1], [45.1, 9.7], [45.07, 7.68]],
  },
  {
    name: 'Shannon',
    coords: [[52.56, -9.75], [52.66, -8.63], [53.42, -7.94], [53.95, -8.08]],
  },
  {
    name: 'Daugava (Western Dvina)',
    coords: [[56.95, 24.11], [56.5, 25.9], [55.88, 26.53], [55.19, 30.2]],
  },
  {
    name: 'Dnieper (Austrvegr)',
    coords: [[54.78, 31.88], [53.9, 30.33], [52.4, 30.9], [50.45, 30.52], [49.44, 32.06], [48.46, 35.04], [46.62, 32.05]],
  },
  {
    name: 'Volga (Itil Route to Serkland)',
    coords: [[57.2, 34.5], [57.62, 39.87], [56.33, 44.0], [55.79, 49.12], [53.2, 50.15], [51.53, 46.03], [48.71, 44.51], [46.35, 48.05]],
  },
  {
    name: 'Don (Tanais)',
    coords: [[52.6, 38.9], [51.67, 39.2], [49.5, 41.0], [47.7, 42.2], [47.18, 39.15]],
  },
  {
    name: 'Tigris & Euphrates',
    coords: [[37.8, 41.1], [36.34, 43.13], [34.6, 43.7], [33.31, 44.36], [31.0, 47.4]],
  },
  {
    name: 'Nile',
    coords: [[31.45, 31.15], [30.04, 31.24], [28.1, 30.75], [26.0, 32.7]],
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
    id: 'aarhus',
    name: 'Aros (Aarhus)',
    norseName: 'Árós',
    regionGroup: 'Denmark',
    subRegion: 'East Jutland',
    lat: 56.16,
    lon: 10.21,
    settlementType: 'town',
    norsePopulation: 950,
    nativePopulation: 220,
    primaryCulture: 'Old Norse (Dane)',
    primaryCultureFa: 'نورس کهن (دانمارکی)',
    defaultStatus: 'independent',
    factionColor: '#F59E0B',
    baseWealth: 7,
    baseDefense: 6,
    historicalSummary:
      'Fortified East Jutland harbor at the mouth of the Aarhus River (“River-Mouth”), established c. 770–790 AD, ringed with a turf-and-timber rampart in the 930s, and recorded as a bishopric in 948.',
    controllersByEra: [
      { untilYear: 934, ruler: 'East Jutland Sea-Kings', polity: 'Danish Petty Kingdoms', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 965, ruler: 'Gorm the Old & Harald Bluetooth', polity: 'Kingdom of Denmark', religion: Religion.NorsePagan, factionColor: '#EA580C', status: 'independent' },
      { untilYear: 1100, ruler: 'Danish Crown & Bishops of Aros', polity: 'Kingdom of Denmark', religion: Religion.Christian, factionColor: '#EA580C', status: 'independent' },
    ],
  },
  {
    id: 'odense',
    name: 'Odense (Nonnebakken)',
    norseName: 'Óðinsvé',
    regionGroup: 'Denmark',
    subRegion: 'Funen (Fyn)',
    lat: 55.40,
    lon: 10.39,
    settlementType: 'jarldom_seat',
    norsePopulation: 900,
    nativePopulation: 200,
    primaryCulture: 'Old Norse (Dane)',
    primaryCultureFa: 'نورس کهن (دانمارکی)',
    defaultStatus: 'independent',
    factionColor: '#EA580C',
    isThingSite: true,
    baseWealth: 7,
    baseDefense: 7,
    historicalSummary:
      'Central island sanctuary of Odin (“Odin’s Vi”) on Funen commanding the Belt straits; fortified by Harald Bluetooth c. 980 with the Nonnebakken geometric ring-fortress.',
    controllersByEra: [
      { untilYear: 965, ruler: 'Funen Goðar & Jarls', polity: 'Danish Isles', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 1100, ruler: 'House of Jelling & Danish Crown', polity: 'Kingdom of Denmark', religion: Religion.Christian, factionColor: '#EA580C', status: 'independent' },
    ],
  },
  {
    id: 'kaupang',
    name: 'Kaupang',
    norseName: 'Skíringssalr',
    regionGroup: 'Norway',
    subRegion: 'Vestfold',
    lat: 58.92,
    lon: 9.78,
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
      'Norway’s bustling Vestfold port described by Ohthere of Hålogaland, trading soapstone, whetstones, walrus ivory, and iron alongside the sacred hall at Huseby.',
    controllersByEra: [
      { untilYear: 872, ruler: 'Vestfold Petty Kings', polity: 'Vestfold', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 995, ruler: 'Fairhair & Lade Jarls', polity: 'Kingdom of Norway', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 1100, ruler: 'Christian Kings of Norway', polity: 'Kingdom of Norway', religion: Religion.Christian, factionColor: '#38BDF8', status: 'independent' },
    ],
  },
  {
    id: 'tunsberg',
    name: 'Tunsberg & Borre',
    norseName: 'Túnsberg ok Borró',
    regionGroup: 'Norway',
    subRegion: 'Vestfold',
    lat: 59.35,
    lon: 10.38,
    settlementType: 'jarldom_seat',
    norsePopulation: 1050,
    nativePopulation: 180,
    primaryCulture: 'Old Norse (Norwegian)',
    primaryCultureFa: 'نورس کهن (نروژی)',
    defaultStatus: 'independent',
    factionColor: '#F59E0B',
    isThingSite: true,
    baseWealth: 7,
    baseDefense: 6,
    historicalSummary:
      'Monumental royal ship-burial mounds of the Yngling/Fairhair line at Borre and the sheltered port of Tunsberg. Historical note (uncertain/debated): Snorri’s Heimskringla dates Tunsberg as a market town before Hafrsfjord (c. 871), whereas archaeological dendrochronology of the urban layers is debated between the 10th and 11th centuries.',
    controllersByEra: [
      { untilYear: 872, ruler: 'Yngling Kings of Vestfold', polity: 'Vestfold', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 995, ruler: 'Sons of Harald Fairhair (Bjørn Farmann)', polity: 'Kingdom of Norway', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 1100, ruler: 'Kings of Norway', polity: 'Kingdom of Norway', religion: Religion.Christian, factionColor: '#38BDF8', status: 'independent' },
    ],
  },
  {
    id: 'avaldsnes',
    name: 'Avaldsnes (Karmøy)',
    norseName: 'Avaldsnes á Kormt',
    regionGroup: 'Norway',
    subRegion: 'Rogaland / Western Coast',
    lat: 59.35,
    lon: 5.29,
    settlementType: 'jarldom_seat',
    norsePopulation: 1100,
    nativePopulation: 200,
    primaryCulture: 'Old Norse (Norwegian)',
    primaryCultureFa: 'نورس کهن (نروژی)',
    defaultStatus: 'independent',
    factionColor: '#F59E0B',
    baseWealth: 8,
    baseDefense: 7,
    historicalSummary:
      'Ancient royal seat on Karmøy island commanding the narrow Karmsund strait — the literal “North-Way” (Norðvegr) shipping lane. Famed for the late-8th-century Storhaug and Grønhaug ship burials and chosen by Harald Fairhair as his primary royal manor after Hafrsfjord (872).',
    controllersByEra: [
      { untilYear: 872, ruler: 'Sea-Kings of Rogaland & Agder', polity: 'Western Fjord Kingdoms', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 995, ruler: 'Harald Fairhair & Eric Bloodaxe’s Line', polity: 'Kingdom of Norway', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 1100, ruler: 'Olaf Tryggvason & St. Olaf’s Crown', polity: 'Kingdom of Norway', religion: Religion.Christian, factionColor: '#38BDF8', status: 'independent' },
    ],
  },
  {
    id: 'giske_more',
    name: 'Giske & Møre',
    norseName: 'Giski á Mæri',
    regionGroup: 'Norway',
    subRegion: 'Sunnmøre / Western Fjords',
    lat: 62.35,
    lon: 5.95,
    settlementType: 'jarldom_seat',
    norsePopulation: 880,
    nativePopulation: 150,
    primaryCulture: 'Old Norse (Norwegian)',
    primaryCultureFa: 'نورس کهن (نروژی)',
    defaultStatus: 'independent',
    factionColor: '#F59E0B',
    baseWealth: 6,
    baseDefense: 6,
    historicalSummary:
      'Strategic island earldom seat of Ragnvald Eysteinsson (Earl of Møre, father of Göngu-Hrólfr/Rollo and Torf-Einarr of Orkney) and later the powerful Arnmøding clan. Historical note (uncertain): saga tradition places Ragnvald’s 9th-century seat in Møre, while exact early hall layers between Giske and Borgund are partly reconstructed.',
    controllersByEra: [
      { untilYear: 870, ruler: 'Petty Kings of Møre & Romsdal', polity: 'Møre Chiefdoms', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 995, ruler: 'Ragnvald Earl of Møre & Kin', polity: 'Earldom of Møre', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 1100, ruler: 'Arnmøding Chieftains (Kalv & Finn Arnesson)', polity: 'Kingdom of Norway', religion: Religion.Christian, factionColor: '#38BDF8', status: 'independent' },
    ],
  },
  {
    id: 'lade_hladir',
    name: 'Hlaðir (Lade)',
    norseName: 'Hlaðir í Þrándheimi',
    regionGroup: 'Norway',
    subRegion: 'Trøndelag',
    lat: 63.44,
    lon: 10.44,
    settlementType: 'jarldom_seat',
    norsePopulation: 1200,
    nativePopulation: 240,
    primaryCulture: 'Old Norse (Norwegian)',
    primaryCultureFa: 'نورس کهن (نروژی)',
    defaultStatus: 'independent',
    factionColor: '#F59E0B',
    abandonedYear: 996,
    isThingSite: true,
    baseWealth: 7,
    baseDefense: 7,
    historicalSummary:
      'Pre-Christian power seat of Trøndelag on the Lade peninsula beside the Trondheimsfjord; stronghold of the semi-sovereign Earls of Lade (Håkon Grjotgardsson, Sigurd Håkonsson, and Håkon Sigurdsson the Mighty) and their great pagan hof until Olaf Tryggvason founded Nidaros across the river in 997.',
    controllersByEra: [
      { untilYear: 996, ruler: 'Jarls of Lade (Håkon Grjotgardsson to Håkon Sigurdsson)', polity: 'Earldom of Lade (Trøndelag)', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 1100, ruler: 'Earls Eirik & Svein Håkonsson', polity: 'Trøndelag Earldom', religion: Religion.Syncretic, factionColor: '#F59E0B', status: 'independent' },
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
    norsePopulation: 1350,
    nativePopulation: 250,
    primaryCulture: 'Old Norse (Norwegian)',
    primaryCultureFa: 'نورس کهن (نروژی)',
    defaultStatus: 'independent',
    factionColor: '#38BDF8',
    foundedYear: 997,
    isThingSite: true,
    baseWealth: 8,
    baseDefense: 7,
    historicalSummary:
      'Royal kaupang and Christian capital founded at the mouth of the Nidelva by King Olaf Tryggvason in 997 AD — superseding nearby pagan Hlaðir (Lade) as the seat of Trøndelag and the Øreting, and after 1030 revered as the shrine of St. Olaf.',
    controllersByEra: [
      { untilYear: 997, ruler: 'Jarls of Lade (Håkon Sigurdsson)', polity: 'Trøndelag Earldom', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 1100, ruler: 'Christian Kings of Norway (Olaf Tryggvason to Harald Hardrada)', polity: 'Kingdom of Norway', religion: Religion.Christian, factionColor: '#38BDF8', status: 'independent' },
    ],
  },
  {
    id: 'halogaland_borg',
    name: 'Borg in Lofoten (Hålogaland)',
    norseName: 'Borg í Lófót (Hálogaland)',
    regionGroup: 'Norway',
    subRegion: 'Hålogaland / Arctic Coast',
    lat: 66.50,
    lon: 13.60,
    settlementType: 'jarldom_seat',
    norsePopulation: 780,
    nativePopulation: 260,
    primaryCulture: 'Old Norse & Sámi Frontier',
    primaryCultureFa: 'نورس شمالی و مرز سامی',
    defaultStatus: 'independent',
    factionColor: '#F59E0B',
    baseWealth: 7,
    baseDefense: 6,
    historicalSummary:
      'Arctic chieftain seat in Hålogaland where archaeologists excavated an 83-meter longhouse (the largest Viking Age hall known). Homeland of the seafarer Ohthere (Óttarr) who described his walrus ivory, whalebone, and Sámi fur tribute (finnskattr) to King Alfred of Wessex c. 890, and of Tore Hund of Bjarkøy.',
    controllersByEra: [
      { untilYear: 1030, ruler: 'Chieftains of Borg & Bjarkøy (Ohthere to Tore Hund)', polity: 'Hålogaland Chiefdoms', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 1100, ruler: 'Northern Lendmenn under the Norwegian Crown', polity: 'Kingdom of Norway', religion: Religion.Christian, factionColor: '#38BDF8', status: 'independent' },
    ],
  },
  {
    id: 'sarpsborg',
    name: 'Borg (Sarpsborg)',
    norseName: 'Borg við Sarpsfoss',
    regionGroup: 'Norway',
    subRegion: 'Østfold / Viken',
    lat: 59.28,
    lon: 11.18,
    settlementType: 'town',
    norsePopulation: 1000,
    nativePopulation: 200,
    primaryCulture: 'Old Norse (Norwegian)',
    primaryCultureFa: 'نورس کهن (نروژی)',
    defaultStatus: 'independent',
    factionColor: '#38BDF8',
    foundedYear: 1016,
    isThingSite: true,
    baseWealth: 7,
    baseDefense: 7,
    historicalSummary:
      'Fortified town and earthwork rampart (St. Olavs Voll) founded in 1016 AD by King Olaf Haraldsson (St. Olaf) beside the Sarpsfoss waterfall on the Glomma River to anchor eastern Viken and host the Borgarthing assembly.',
    controllersByEra: [
      { untilYear: 1015, ruler: 'Viken Petty Lords', polity: 'Viken Frontier', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 1100, ruler: 'St. Olaf & Christian Kings of Norway', polity: 'Kingdom of Norway', religion: Religion.Christian, factionColor: '#38BDF8', status: 'independent' },
    ],
  },
  {
    id: 'oslo',
    name: 'Ánslo (Oslo)',
    norseName: 'Ánslo / Ósló',
    regionGroup: 'Norway',
    subRegion: 'Head of Oslofjord',
    lat: 59.98,
    lon: 10.75,
    settlementType: 'town',
    norsePopulation: 1150,
    nativePopulation: 220,
    primaryCulture: 'Old Norse (Norwegian)',
    primaryCultureFa: 'نورس کهن (نروژی)',
    defaultStatus: 'independent',
    factionColor: '#38BDF8',
    foundedYear: 1048,
    baseWealth: 7,
    baseDefense: 7,
    historicalSummary:
      'Founded c. 1048 AD by King Harald Hardrada at the head of the Viken fjord (Heimskringla) as a strategic naval and market base facing Denmark. Historical note: Christian graves near St. Clement’s date to c. 1000, while Snorri places the royal town foundation around 1048.',
    controllersByEra: [
      { untilYear: 1047, ruler: 'Viken Chieftains', polity: 'Viken', religion: Religion.Syncretic, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 1100, ruler: 'Harald Hardrada & Olaf Kyrre', polity: 'Kingdom of Norway', religion: Religion.Christian, factionColor: '#38BDF8', status: 'independent' },
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
  {
    id: 'skara_gotaland',
    name: 'Skara & Göta Älv',
    norseName: 'Skara í Gautlandi',
    regionGroup: 'Sweden',
    subRegion: 'Västergötland',
    lat: 58.28,
    lon: 13.15,
    settlementType: 'jarldom_seat',
    norsePopulation: 1000,
    nativePopulation: 220,
    primaryCulture: 'Old Norse (Geat / Götar)',
    primaryCultureFa: 'نورس کهن (گوتلند غربی)',
    defaultStatus: 'independent',
    factionColor: '#F59E0B',
    isThingSite: true,
    baseWealth: 7,
    baseDefense: 6,
    historicalSummary:
      'Heartland assembly seat of the Western Geats (Allra Göta þing) and corridor to the Göta Älv estuary looking toward Denmark and Norway; near here Olof Skötkonung was baptized at Husaby c. 1008 and Sweden’s oldest bishopric was established c. 1014. Historical note (uncertain): early Viking Age pagan sanctuary attested in tradition, while urban town layers date mainly from c. 1000 AD.',
    controllersByEra: [
      { untilYear: 1000, ruler: 'Geatish Jarls & Lawspeakers of Västergötland', polity: 'Västergötland (Gautland)', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 1100, ruler: 'Christian Earls (Ragnvald Ulfsson & Stenkil)', polity: 'Kingdom of Sweden', religion: Religion.Christian, factionColor: '#38BDF8', status: 'independent' },
    ],
  },
  {
    id: 'kalmar_oland',
    name: 'Kalmar & Köpingsvik (Öland)',
    norseName: 'Kalmarnir ok Eyland',
    regionGroup: 'Sweden',
    subRegion: 'Småland & Öland Sound',
    lat: 56.68,
    lon: 16.36,
    settlementType: 'trading_post',
    norsePopulation: 860,
    nativePopulation: 190,
    primaryCulture: 'Old Norse (Swede / Ölander)',
    primaryCultureFa: 'نورس کهن (ساحل بالتیک سوئد)',
    defaultStatus: 'independent',
    factionColor: '#F59E0B',
    baseWealth: 7,
    baseDefense: 6,
    historicalSummary:
      'Strategic Baltic sound between Småland and the island of Öland (Köpingsvik market and Eketorp ring-fort), where Swedish fleets mustered for the Eastern Route (Austrvegr) and Danish border wars.',
    controllersByEra: [
      { untilYear: 1020, ruler: 'Öland & Småland Sea-Chieftains', polity: 'Eastern Götaland', religion: Religion.NorsePagan, factionColor: '#F59E0B', status: 'independent' },
      { untilYear: 1100, ruler: 'Swedish Crown & Coastal Leidang', polity: 'Kingdom of Sweden', religion: Religion.Christian, factionColor: '#38BDF8', status: 'independent' },
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
    foundedYear: 870,
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

/**
 * Checks whether a settlement exists in the given historical year based on
 * optional `foundedYear` and `abandonedYear` bounds.
 */
export function isSettlementActiveInYear(
  settlementOrId: Settlement | string | undefined,
  year: number
): boolean {
  const s =
    typeof settlementOrId === 'string'
      ? SETTLEMENTS_BY_ID[settlementOrId]
      : settlementOrId;
  if (!s) return false;
  if (s.foundedYear !== undefined && year < s.foundedYear) return false;
  if (s.abandonedYear !== undefined && year > s.abandonedYear) return false;
  return true;
}

/**
 * Returns all settlements active in the given year.
 */
export function getActiveSettlementsForYear(year: number): Settlement[] {
  return SETTLEMENTS.filter((s) => isSettlementActiveInYear(s, year));
}

/**
 * Maps a settlement ID to its active historical counterpart if it is before its
 * `foundedYear` or after its `abandonedYear` (e.g., Hlaðir/Lade < 997 <-> Nidaros >= 997).
 */
export function resolveActiveSettlementId(settlementId: string, year: number): string {
  if (settlementId === 'nidaros' && year < 997) return 'lade_hladir';
  if (settlementId === 'lade_hladir' && year >= 997) return 'nidaros';
  if (settlementId === 'sigtuna' && year < 975) return 'birka';
  if (settlementId === 'oslo' && year < 1048) return 'tunsberg';
  if (settlementId === 'sarpsborg' && year < 1016) return 'tunsberg';
  if (settlementId === 'reykjavik' && year < 870) return 'faroes';
  if (settlementId === 'akureyri' && year < 890) return year >= 870 ? 'reykjavik' : 'faroes';
  if (settlementId === 'thingvellir' && year < 930) return year >= 870 ? 'reykjavik' : 'faroes';
  if (settlementId === 'brattahlid' && year < 985) return year >= 870 ? 'reykjavik' : 'faroes';
  if ((settlementId === 'gardar' || settlementId === 'vinland') && year < 1000) {
    return year >= 985 ? 'brattahlid' : year >= 870 ? 'reykjavik' : 'faroes';
  }
  return settlementId;
}

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
  ['hedeby', 'odense'],
  ['hedeby', 'roskilde'],
  ['ribe', 'jorvik'],
  ['ribe', 'london'],
  ['ribe', 'jelling'],
  ['jelling', 'aarhus'],
  ['jelling', 'odense'],
  ['odense', 'roskilde'],
  ['aarhus', 'roskilde'],
  ['aarhus', 'kaupang'],
  ['kaupang', 'jelling'],
  ['kaupang', 'roskilde'],
  ['kaupang', 'tunsberg'],
  ['kaupang', 'avaldsnes'],
  ['tunsberg', 'sarpsborg'],
  ['tunsberg', 'oslo'],
  ['sarpsborg', 'oslo'],
  ['sarpsborg', 'skara_gotaland'],
  ['skara_gotaland', 'roskilde'],
  ['skara_gotaland', 'birka'],
  ['avaldsnes', 'giske_more'],
  ['avaldsnes', 'shetland'],
  ['giske_more', 'lade_hladir'],
  ['giske_more', 'nidaros'],
  ['giske_more', 'shetland'],
  ['lade_hladir', 'kaupang'],
  ['lade_hladir', 'shetland'],
  ['lade_hladir', 'halogaland_borg'],
  ['nidaros', 'kaupang'],
  ['nidaros', 'shetland'],
  ['nidaros', 'halogaland_borg'],
  ['roskilde', 'kalmar_oland'],
  ['kalmar_oland', 'visby'],
  ['kalmar_oland', 'birka'],
  ['roskilde', 'birka'],
  ['birka', 'uppsala'],
  ['birka', 'sigtuna'],

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
