import {
  BuildingType,
  PremadeCharacter,
  RegionGroup,
  Religion,
  Sex,
  SocialClass,
  TitleRank,
  TraitDef,
  WinGoal,
} from '../types/game';

export const MALE_NAMES_BY_REGION: Record<RegionGroup, string[]> = {
  Norway: [
    'Hakon', 'Harald', 'Olaf', 'Eirik', 'Sigurd', 'Bjorn', 'Torstein', 'Einar',
    'ketil', 'Gunnar', 'Rollo', 'Arne', 'Erling', 'Tryggvi', 'Kalf', 'Hallvard',
  ].map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
  Denmark: [
    'Ragnar', 'Bjorn', 'Ivar', 'Halfdan', 'Ubba', 'Sigurd', 'Hvitserk',
    'Sweyn', 'Cnut', 'Gorm', 'Harald', 'Guthrum', 'Toke', 'Ulf',
    'Thorkell', 'Hemming', 'Horik', 'Sigfred', 'Asbjorn', 'Eskil', 'Palnatoke',
  ],
  Sweden: [
    'Ragnar', 'Bjorn', 'Eirik', 'Olof', 'Rurik', 'Ingvar', 'Freyvid', 'Styrbjorn', 'Anund',
    'Hakon', 'Torgny', 'Folke', 'Sven', 'Ragnvald', 'Arnljot',
  ],
  'British Isles': [
    'Ivar', 'Ubba', 'Ubbe', 'Halfdan', 'Hvitserk', 'Sigtrygg', 'Ragnall', 'Thorfinn', 'Sigurd', 'Grim', 'Orm',
    'Hrafn', 'Morcar', 'Oswulf', 'Aethelred', 'Godwin', 'ketil',
  ].map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
  Ireland: [
    'Olaf', 'Sigtrygg', 'Ivar', 'Brodar', 'Gluniarainn', 'Thorgils', 'Amlaib',
    'Magnus', 'echmarcach', 'askel', 'Ottar', 'Gofraid',
  ].map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
  Continent: [
    'Rollo', 'William', 'Richard', 'Hastein', 'Bjorn', 'Ansgar', 'Godfrid',
    'Reginher', 'Sigfried', 'Welund', 'Turstin', 'Osbern',
  ],
  'North Atlantic': [
    'Ingolf', 'Leif', 'Thorvald', 'Skallagrim', 'Egil', 'Njal', 'Gunnar',
    'Snorri', 'Kjartan', 'Bolli', 'Thorfinn', 'Flosi', 'Hoskuld', 'Ari',
  ],
  Baltic: [
    'Palnatoke', 'Sigvaldi', 'Bue', 'Vagn', 'Styrbjorn', 'Vidigoier', 'Gaupo', 'Algirdas',
  ],
  'Kievan Rus & Rivers': [
    'Rurik', 'Oleg', 'Igor', 'Sviatoslav', 'Vladimir', 'Yaroslav', 'Askold', 'Dir', 'Farulf', 'Gorm',
  ],
  'Iberia & Al-Andalus': [
    'Hastein', 'Bjorn', 'Alphonso', 'Pelayo', 'Abd ar-Rahman', 'Tariq', 'Hakam', 'Mundhir',
  ],
  Mediterranean: [
    'Hastein', 'Bjorn Ironside', 'Robert Guiscard', 'Bohemond', 'Tancred', 'Guaimar', 'Leo',
  ],
  'Miklagard & East': [
    'Harald Hardrada', 'Ragnvald', 'Ingvar', 'Alexios', 'Basil', 'Nikephoros', 'Georgios', 'Bardas',
  ],
  'Serkland & Caliphate': [
    'Ingvar the Far-Travelled', 'Harun', 'Al-Mamun', 'Jafar', 'Ibn Fadlan', 'Tariq', 'Ali',
  ],
};

export const FEMALE_NAMES_BY_REGION: Record<RegionGroup, string[]> = {
  Norway: [
    'Lagertha', 'Aslaug', 'Astrid', 'Ragnhild', 'Gunnhild', 'Bergljot', 'Ingeborg', 'Gyda', 'Sigrid',
    'Tora', 'Jorunn', 'Alfhild', 'Solveig', 'Asa', 'Borghild',
  ],
  Denmark: [
    'Aslaug', 'Lagertha', 'Kráka', 'Thyra', 'Estrid', 'Tove', 'Sigrid', 'Gunhild', 'Gytha', 'Bodil',
    'Ingegerd', 'Ragnhild', 'Svanehild', 'Gro',
  ],
  Sweden: [
    'Sigrid', 'Ingegerd', 'Estrid', 'Ylva', 'Freydis', 'Holmfrid', 'kata',
    'Bothild', 'Ragnfrid', 'Gunvor', 'Disa',
  ].map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
  'British Isles': [
    'Aud', 'Thora', 'Ragnhild', 'Gytha', 'Aethelflaed', 'Hild', 'Gunnor',
    'Ingrid', 'frida', 'Helga', 'unna',
  ].map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
  Ireland: [
    'Gormlaith', 'Aud', 'Melkorka', 'Ragnhild', 'Maelmuire', 'Cacht', 'Helga',
    'Thorgerd', 'Nuala', 'Ingibjorg',
  ],
  Continent: [
    'Poppa', 'Gunnor', 'Emma', 'Sprota', 'Gisela', 'Adela', 'Judith',
    'Ragnhild', 'Hildeburh', 'Estrid',
  ],
  'North Atlantic': [
    'Aud', 'Gudrun', 'Hallgerd', 'Freydis', 'Gudrid', 'Bergthora', 'Thorgerd',
    'Unn', 'Hrefna', 'Thurid', 'Yngvild', 'Steingerd',
  ],
  Baltic: [
    'Astrid', 'Ingeborg', 'Tove', 'Danute', 'Ragnfrid', 'Gyrid',
  ],
  'Kievan Rus & Rivers': [
    'Olga', 'Ingegerd', 'Rogneda', 'Anna', 'Malfrida', 'Predslava', 'Svyatoslava',
  ],
  'Iberia & Al-Andalus': [
    'Tuda', 'Jimena', 'Urraca', 'Subh', 'Tarub', 'Zahra', 'Aixa',
  ],
  Mediterranean: [
    'Sichelgaita', 'Adelasia', 'Theodora', 'Gemma', 'Beatrix', 'Costanza',
  ],
  'Miklagard & East': [
    'Zoe', 'Theodora', 'Eudokia', 'Anna Dalassene', 'Irene', 'Helena', 'Maria',
  ],
  'Serkland & Caliphate': [
    'Zubayda', 'Shajar', 'Farida', 'Layla', 'Fatima', 'Maryam',
  ],
};

export function makePatronymic(fatherName: string, sex: Sex): string {
  const clean = fatherName.trim() || 'Ulf';
  const genitive = clean.endsWith('s') ? clean : `${clean}s`;
  return sex === Sex.Male ? `${genitive}son` : `${genitive}dottir`;
}

export const SELECTABLE_TRAITS: TraitDef[] = [
  {
    id: 'brave',
    name: 'Brave',
    oldNorseTerm: 'hugprúðr',
    description: 'Stands steady in the shield wall when iron rings on wood.',
    statModifiers: { honor: 8, strength: 5 },
    skillModifiers: { combat: 8 },
  },
  {
    id: 'cunning',
    name: 'Cunning',
    oldNorseTerm: 'slœgr',
    description: 'Weighs odds, sets ambushes, and reads hidden motives in the hall.',
    statModifiers: { cunning: 14 },
    skillModifiers: { diplomacy: 6, law: 6 },
  },
  {
    id: 'pious',
    name: 'Devout',
    oldNorseTerm: 'blótmaðr',
    description: 'Keeps sacred oaths, honors sacrificial rites or church fasts.',
    statModifiers: { faith: 16, honor: 4 },
  },
  {
    id: 'greedy',
    name: 'Silver-Hungry',
    oldNorseTerm: 'fégiarn',
    description: 'Never lets an ounce of hacksilver slip past the balance scale.',
    statModifiers: { cunning: 5, honor: -6 },
    skillModifiers: { trade: 10 },
  },
  {
    id: 'wrathful',
    name: 'Wrathful',
    oldNorseTerm: 'reiðr',
    description: 'Quick to draw steel over an insult; feared in holmgang.',
    statModifiers: { strength: 10, happiness: -5 },
    skillModifiers: { combat: 10, diplomacy: -8 },
  },
  {
    id: 'charismatic',
    name: 'Word-Gifted',
    oldNorseTerm: 'vinsæll',
    description: 'Draws drengir to your benches with generous rings and warm speech.',
    statModifiers: { charisma: 15, happiness: 5 },
    skillModifiers: { diplomacy: 10 },
  },
  {
    id: 'sickly',
    name: 'Frail Lung',
    oldNorseTerm: 'vanheill',
    description: 'Damp northern winters weigh heavily on your chest, sharpening your mind.',
    statModifiers: { health: -16, cunning: 8 },
    skillModifiers: { law: 6, skaldcraft: 6 },
  },
  {
    id: 'strong_limbed',
    name: 'Strong-Limbed',
    oldNorseTerm: 'rammr',
    description: 'Broad-shouldered at the oar and tireless behind a bossed round-shield.',
    statModifiers: { strength: 15, health: 8 },
    skillModifiers: { combat: 8, farming: 6 },
  },
  {
    id: 'seafarer',
    name: 'Sea-Reader',
    oldNorseTerm: 'farmann',
    description: 'Reads swell, fulmar flight, and sun-stone glimmer through North Atlantic fog.',
    statModifiers: { wyrd: 6 },
    skillModifiers: { seamanship: 16, trade: 6 },
  },
  {
    id: 'skald_tongued',
    name: 'Skald-Tongued',
    oldNorseTerm: 'skáld',
    description: 'Weaves kennings in dróttkvætt meter that kings pay silver to hear.',
    statModifiers: { charisma: 10, honor: 6 },
    skillModifiers: { skaldcraft: 18 },
  },
  {
    id: 'law_speaker',
    name: 'Law-Minded',
    oldNorseTerm: 'lögmaðr',
    description: 'Knows wergild schedules and Thing procedure better than greybeard chieftains.',
    statModifiers: { cunning: 8, honor: 6 },
    skillModifiers: { law: 18, diplomacy: 6 },
  },
  {
    id: 'blessed_luck',
    name: 'Blessed by Wyrd',
    oldNorseTerm: 'gæfumaðr',
    description: 'Good hamingja follows your keel; storms break before your prow.',
    statModifiers: { wyrd: 18, happiness: 6 },
  },
  {
    id: 'cursed_wyrd',
    name: 'Shadow-Fated',
    oldNorseTerm: 'ógæfumaðr',
    description: 'Dark dreams trouble your sleep, yet desperate men fear your resolve.',
    statModifiers: { wyrd: -14, strength: 6, cunning: 8 },
    skillModifiers: { seidr: 10 },
  },
  {
    id: 'oath_keeper',
    name: 'Oath-Fast',
    oldNorseTerm: 'eiðfastr',
    description: 'Your word sworn upon the temple arm-ring is trusted across three seas.',
    statModifiers: { honor: 14 },
    skillModifiers: { diplomacy: 8, law: 5 },
  },
];

export const SCAR_AND_CONDITION_TRAITS: TraitDef[] = [
  {
    id: 'battle_scarred',
    name: 'Cheek-Scarred',
    oldNorseTerm: 'öróttr',
    description: 'A pale sword-seam crosses your jaw — proof you stood in the front rank.',
    isScarOrCondition: true,
    statModifiers: { honor: 6, health: -4 },
  },
  {
    id: 'limping',
    name: 'Spear-Lame',
    oldNorseTerm: 'haltr',
    description: 'A healed thigh wound slows your stride in winter damp.',
    isScarOrCondition: true,
    statModifiers: { health: -10, strength: -8 },
  },
  {
    id: 'one_eyed',
    name: 'One-Eyed',
    oldNorseTerm: 'einsýnn',
    description: 'Like the High One himself, you gave an eye to steel and gained grim renown.',
    isScarOrCondition: true,
    statModifiers: { faith: 8, honor: 8, health: -8 },
  },
  {
    id: 'frost_bitten',
    name: 'Salt-Frosted',
    oldNorseTerm: 'kalinn',
    description: 'Lost two fingers to an icy gale off the western skerries.',
    isScarOrCondition: true,
    statModifiers: { health: -6 },
    skillModifiers: { seamanship: 5 },
  },
  {
    id: 'shieldmaiden_renown',
    name: 'Birka War-Leader',
    oldNorseTerm: 'skjaldmær',
    description: 'Bore weapons in war — rare and fiercely debated in hall-talk, yet undeniable.',
    isScarOrCondition: true,
    statModifiers: { honor: 10 },
    skillModifiers: { combat: 10 },
  },
  {
    id: 'outlaw_mark',
    name: 'Lesser Outlaw',
    oldNorseTerm: 'fjörbaugsmaðr',
    description: 'Sentenced at the Thing; rivals may hunt you without paying wergild.',
    isScarOrCondition: true,
    statModifiers: { honor: -15, happiness: -10 },
  },
  {
    id: 'wolf_blood',
    name: 'Wolf-Blood of Ragnar',
    oldNorseTerm: 'Úlfblóð Ragnars',
    description: 'Claimed blood of Ragnar Lothbrok. Grants fierce renown and plunder in raids against English kingdoms, bound to the Debt of Vengeance (Hefnd).',
    isScarOrCondition: true,
    statModifiers: { honor: 8, strength: 6, wyrd: 6 },
    skillModifiers: { combat: 8, seamanship: 6 },
  },
  {
    id: 'boneless_tactician',
    name: 'Shield-Borne Strategist',
    oldNorseTerm: 'Beinlauss Spekingr',
    description: 'Carried upon a locked ash-shield; though your legs fail in the press, no commander in Christendom or the North matches your cold siege-craft and battlefield traps.',
    isScarOrCondition: true,
    statModifiers: { cunning: 22, charisma: 10, health: -14, strength: -12 },
    skillModifiers: { law: 10, diplomacy: 12, combat: 8 },
  },
  {
    id: 'ironside_hide',
    name: 'Ironside Unscathed',
    oldNorseTerm: 'Járnsíða',
    description: 'Neither Saxon spear nor Frankish arrow seems to bite your mail. Oarsmen swear the gods ward your ribs in the thickest shield-wall.',
    isScarOrCondition: true,
    statModifiers: { strength: 14, health: 12, honor: 10 },
    skillModifiers: { combat: 14, seamanship: 10 },
  },
  {
    id: 'snake_in_the_eye',
    name: 'Ouroboros Mark (Ormr í Auga)',
    oldNorseTerm: 'Ormr í Auga',
    description: 'Born with the pale ring of a serpent biting its tail around your pupil — the prophecy-mark of Aslaug and the Völsung dragon-slayers.',
    isScarOrCondition: true,
    statModifiers: { wyrd: 16, charisma: 10, honor: 8 },
    skillModifiers: { diplomacy: 8, skaldcraft: 8 },
  },
  {
    id: 'shieldmaiden_of_hladgerd',
    name: 'First-Rank Shieldmaiden',
    oldNorseTerm: 'Hlaðgerðr Skjaldmær',
    description: 'With loose hair flying behind a bossed round-shield, your counter-charges break battle-lines that veteran jarls deemed unassailable.',
    isScarOrCondition: true,
    statModifiers: { strength: 10, honor: 14, charisma: 8 },
    skillModifiers: { combat: 14, seamanship: 6 },
  },
  {
    id: 'volsung_vision',
    name: 'Völsung Second-Sight',
    oldNorseTerm: 'Kráku Spádómr',
    description: 'Daughter of Sigurd Fafnir-slayer and Brynhild; you read the weave of Wyrd in raven-flight, loom-threads, and royal oaths.',
    isScarOrCondition: true,
    statModifiers: { wyrd: 20, cunning: 12, faith: 10 },
    skillModifiers: { seidr: 16, skaldcraft: 12, diplomacy: 8 },
  },
  {
    id: 'berserk_fury_ubba',
    name: 'Frisian Galdr-Fury',
    oldNorseTerm: 'Ubba Berserksgangr',
    description: 'Feared from the Scheldt to the Humber for wading into battle chanting grim war-charms where iron blades glance aside.',
    isScarOrCondition: true,
    statModifiers: { strength: 16, faith: 8, honor: 6 },
    skillModifiers: { combat: 14, seidr: 8 },
  },
  {
    id: 'white_shirt_zeal',
    name: 'Unbroken unto the Embers',
    oldNorseTerm: 'Hvítserkr Óbilandi',
    description: 'Sworn never to yield a step while a single brother’s blood-debt remains unpaid from the Humber to the eastern rivers.',
    isScarOrCondition: true,
    statModifiers: { honor: 14, strength: 10, wyrd: 6 },
    skillModifiers: { combat: 12, seamanship: 8 },
  },
];

export const ALL_TRAITS_MAP: Record<string, TraitDef> = [
  ...SELECTABLE_TRAITS,
  ...SCAR_AND_CONDITION_TRAITS,
].reduce<Record<string, TraitDef>>((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {});

export const SOCIAL_CLASS_CONFIG: Record<
  SocialClass,
  {
    label: string;
    norseTerm: string;
    startingTitle: TitleRank;
    silver: number;
    farms: number;
    warriors: number;
    longships: number;
    knarrs: number;
    description: string;
  }
> = {
  [SocialClass.Thrall]: {
    label: 'Thrall (Unfree Bondservant)',
    norseTerm: 'Þræll / Ambátt',
    startingTitle: TitleRank.Thrall,
    silver: 3,
    farms: 0,
    warriors: 0,
    longships: 0,
    knarrs: 0,
    description: 'Bound to another household with no wergild rights. Must earn or seize freedom first.',
  },
  [SocialClass.Karl]: {
    label: 'Karl (Free Tenant Farmer)',
    norseTerm: 'Karl',
    startingTitle: TitleRank.Freeman,
    silver: 22,
    farms: 1,
    warriors: 2,
    longships: 0,
    knarrs: 0,
    description: 'Freeborn spear-bearer with Thing voice, working modest barley fields and coastal nets.',
  },
  [SocialClass.Bonde]: {
    label: 'Wealthy Bonde (Odal Landholder)',
    norseTerm: 'Óðalsbóndi',
    startingTitle: TitleRank.Bonde,
    silver: 65,
    farms: 2,
    warriors: 8,
    longships: 0,
    knarrs: 1,
    description: 'Ancestral odal farmer with a trading knarr, livestock, and household retainers.',
  },
  [SocialClass.HersirKin]: {
    label: "Hersir's Kin (Local War-Chieftain)",
    norseTerm: 'Hersir',
    startingTitle: TitleRank.Hersir,
    silver: 130,
    farms: 4,
    warriors: 24,
    longships: 1,
    knarrs: 1,
    description: 'Commands a fjord district longship and sworn hirdmen; expected to feast and lead raids.',
  },
  [SocialClass.JarlKin]: {
    label: "Jarl's Kin (Regional Ruler)",
    norseTerm: 'Jarl',
    startingTitle: TitleRank.Jarl,
    silver: 260,
    farms: 7,
    warriors: 55,
    longships: 2,
    knarrs: 1,
    description: 'High-born ruler of shires or islands, surrounded by ambitious cousins and rival claimants.',
  },
  [SocialClass.Royal]: {
    label: 'Royal Scion (Yngling / Skjöldung Blood)',
    norseTerm: 'Konungborinn',
    startingTitle: TitleRank.Jarl,
    silver: 380,
    farms: 9,
    warriors: 80,
    longships: 3,
    knarrs: 2,
    description: 'Descended from ancient kings. Every throne is within claim — and every king sees you as a threat.',
  },
};

export const TITLE_LADDER: TitleRank[] = [
  TitleRank.Thrall,
  TitleRank.Freeman,
  TitleRank.Hirdman,
  TitleRank.Huscarl,
  TitleRank.Captain,
  TitleRank.Jarl,
  TitleRank.Konungr,
  TitleRank.Overking,
];

export function getTitleRankIndex(title: TitleRank): number {
  if (title === TitleRank.Bonde) return 2; // maps to Hirdman/Warrior level
  if (title === TitleRank.Hersir) return 3; // maps to Huscarl level
  const idx = TITLE_LADDER.indexOf(title);
  return idx >= 0 ? idx : 1;
}

export const BUILDINGS_CATALOG: Record<
  BuildingType,
  {
    name: string;
    norseName: string;
    costSilver: number;
    description: string;
    religionReq?: Religion;
    effectsLabel: string;
  }
> = {
  skali_hall: {
    name: 'Timber Long-Hall',
    norseName: 'Skáli',
    costSilver: 90,
    description: 'Oak-pillared feast hall with a long central hearth for hirdmen and guests.',
    effectsLabel: '+6 Stability/yr · +3 Fame/yr · Hird capacity +25',
  },
  boathouse_naust: {
    name: 'Clinker Ship-Shed',
    norseName: 'Naust',
    costSilver: 75,
    description: 'Shelters oak hulls and tarred rigging through winter gales.',
    effectsLabel: 'Reduces ship upkeep · Seamanship +3 on voyages',
  },
  ring_fortress: {
    name: 'Earthen Ring-Fortress',
    norseName: 'Trelleborg',
    costSilver: 220,
    description: 'Circular turf-and-timber rampart quartered on geometric axes in the Danish royal fashion.',
    effectsLabel: '+12 Garrison defense · +8 Stability · Deter rival raids',
  },
  kaupang_market: {
    name: 'Seasonal Emporium',
    norseName: 'Kaupangr',
    costSilver: 140,
    description: 'Staked beach plots where scales weigh Arabic dirhams, Baltic amber, and northern furs.',
    effectsLabel: '+18 Silver/yr · +1 Trade Network',
  },
  pagan_hof: {
    name: 'Sacrificial Temple-Hall',
    norseName: 'Hof',
    costSilver: 110,
    religionReq: Religion.NorsePagan,
    description: 'Carved high-seat pillars of Thor and Freyr where seasonal blót feasts bind the district.',
    effectsLabel: '+5 Pagan Faith/yr · +4 Honor at local Thing',
  },
  stave_church: {
    name: 'Timber Stave Church',
    norseName: 'Stafkirkja',
    costSilver: 120,
    religionReq: Religion.Christian,
    description: 'Tarred pine sanctuary housing Latin clerks, relics, and Christian envoys.',
    effectsLabel: '+5 Christian Faith/yr · +Diplomacy with Frankish & Saxon courts',
  },
};

export const HISTORICAL_ERAS = [
  {
    id: 1 as const,
    name: 'Era I · Early Raids',
    years: '793–865 AD',
    defaultYear: 793,
    summary:
      'Longships strike Lindisfarne and Iona; coastal monasteries hold unguarded silver while Norse longphorts take root in Ireland.',
  },
  {
    id: 2 as const,
    name: 'Era II · Great Heathen Army & Landnám',
    years: '865–954 AD',
    defaultYear: 865,
    summary:
      'Coalition fleets conquer Jorvik and carve out the Danelaw; Harald Fairhair consolidates Norway, driving proud bondi to settle Iceland.',
  },
  {
    id: 3 as const,
    name: 'Era III · Kingdom Building & Conversion',
    years: '954–1015 AD',
    defaultYear: 960,
    summary:
      'Ring fortresses rise in Denmark, Greenland and Vinland open under the Medieval Warm Period, and missionary kings contest the Old Gods.',
  },
  {
    id: 4 as const,
    name: 'Era IV · North Sea Empire & Twilight',
    years: '1016–1066 AD',
    defaultYear: 1016,
    summary:
      'Cnut the Great rules England, Denmark, and Norway; Varangians serve Constantinople until Stamford Bridge closes the age in 1066.',
  },
];

export const PREMADE_CHARACTERS: PremadeCharacter[] = [
  {
    id: 'hakon_fairhair_era',
    name: 'Hakon',
    patronymic: 'Sigurdsson',
    subtitle: "Norwegian Hersir's Son (872 AD)",
    historicalContext:
      'Harald Fairhair demands tax on ancestral odal land around Trondelag. Submit as his jarl, fight against him, or sail west to unsettled Iceland.',
    isSagaInspired: true,
    year: 872,
    age: 19,
    sex: Sex.Male,
    birthplaceId: 'nidaros',
    socialClass: SocialClass.HersirKin,
    religion: Religion.NorsePagan,
    traits: ['brave', 'seafarer', 'oath_keeper'],
    winGoalId: 'king_norway',
    bonusShips: 1,
    bonusWarriors: 12,
  },
  {
    id: 'ivar_great_army',
    name: 'Toke',
    patronymic: 'Hundason',
    subtitle: 'Danish Drengr of the Great Army (865 AD)',
    historicalContext:
      'Drawn to the banners of Ivar and Halfdan crossing from Jutland into Anglo-Saxon England in search of silver and ploughland.',
    year: 865,
    age: 21,
    sex: Sex.Male,
    birthplaceId: 'hedeby',
    socialClass: SocialClass.Bonde,
    religion: Religion.NorsePagan,
    traits: ['strong_limbed', 'greedy', 'brave'],
    winGoalId: 'king_england',
    bonusSilver: 45,
    bonusShips: 1,
    bonusWarriors: 18,
    startingFlags: ['joined_great_army'],
  },
  {
    id: 'aud_iceland_settler',
    name: 'Aud',
    patronymic: 'Ketilsdottir',
    subtitle: "Icelandic Settler's Daughter (876 AD)",
    historicalContext:
      'Inspired by the landnám pioneers of western fjords. Guide a household across the North Atlantic, claim valleys, and speak at the Thing.',
    isSagaInspired: true,
    year: 876,
    age: 20,
    sex: Sex.Female,
    birthplaceId: 'reykjavik',
    socialClass: SocialClass.HersirKin,
    religion: Religion.Syncretic,
    traits: ['law_speaker', 'charismatic', 'seafarer'],
    winGoalId: 'iceland_chieftain',
    bonusSilver: 80,
    bonusShips: 1,
  },
  {
    id: 'thorstein_dublin_merchant',
    name: 'Thorstein',
    patronymic: 'Olafsson',
    subtitle: 'Hiberno-Norse Merchant of Dyflinn (942 AD)',
    historicalContext:
      'Positioned on the Irish Sea crossroads linking Dublin, Chester, Jorvik, and Rouen. Wealth in silver and knarr fleets decides kings.',
    year: 942,
    age: 23,
    sex: Sex.Male,
    birthplaceId: 'dublin',
    socialClass: SocialClass.Bonde,
    religion: Religion.Syncretic,
    traits: ['cunning', 'seafarer', 'greedy'],
    winGoalId: 'king_dublin',
    bonusSilver: 140,
    bonusShips: 1,
  },
  {
    id: 'astrid_thrall_past',
    name: 'Astrid',
    patronymic: 'Ingvarsdottir',
    subtitle: 'Thrall Girl in Hedeby with a Hidden Past (826 AD)',
    historicalContext:
      'Captured as a child when raiders burned a Westfold hall, you carry a silver rune-brooch sewn inside your wool tunic. Win freedom and reclaim your kin-right.',
    isSagaInspired: true,
    year: 826,
    age: 16,
    sex: Sex.Female,
    birthplaceId: 'hedeby',
    socialClass: SocialClass.Thrall,
    religion: Religion.NorsePagan,
    traits: ['cunning', 'blessed_luck', 'skald_tongued'],
    winGoalId: 'freeform_dynasty',
    startingFlags: ['hidden_noble_brooch'],
  },
  {
    id: 'ivar_boneless',
    name: 'Ivar',
    patronymic: 'Ragnarsson',
    epithet: 'the Boneless',
    subtitle: 'Shield-Borne Mastermind of the Great Army · 865 AD',
    historicalContext:
      'Carried upon four locked ash-shields, your legs are twisted yet your mind is sharpest in the North. King Ælla cast your father Ragnar into a Northumbrian snake-pit; now East Anglia and York await the Raven Banner.',
    year: 865,
    age: 29,
    sex: Sex.Male,
    birthplaceId: 'jorvik',
    socialClass: SocialClass.Royal,
    religion: Religion.NorsePagan,
    traits: ['wolf_blood', 'boneless_tactician', 'cunning'],
    winGoalId: 'avenge_ragnar_england',
    bonusSilver: 95,
    bonusShips: 2,
    bonusWarriors: 35,
    startingFlags: ['veteran_great_army', 'lothbrok_heir', 'ivar_shield_borne'],
    isSagaInspired: true,
    isLegendaryClaim: true,
    ragnarBloodline: true,
    bloodlineBranch: 'ivar',
    startingHeirlooms: ['hrafnsmerki_banner', 'serpent_of_the_wash'],
    signatureEventId: 'sig_ivar_shield_council',
  },
  {
    id: 'bjorn_ironside',
    name: 'Bjorn',
    patronymic: 'Ragnarsson',
    epithet: 'Ironside',
    subtitle: 'Sea-King of Uppsala & Mediterranean Raider · 859 AD',
    historicalContext:
      'Aslaug’s eldest son, famed from the Seine to the marble walls of Luna in Italy. Whether steering back north to avenge Ragnar in England or crowning a Swedish dynasty at Uppsala, no steel pierces your flank.',
    year: 859,
    age: 28,
    sex: Sex.Male,
    birthplaceId: 'uppsala',
    socialClass: SocialClass.Royal,
    religion: Religion.NorsePagan,
    traits: ['wolf_blood', 'ironside_hide', 'seafarer'],
    winGoalId: 'avenge_ragnar_england',
    bonusSilver: 110,
    bonusShips: 3,
    bonusWarriors: 30,
    startingFlags: ['lothbrok_heir', 'mediterranean_raider'],
    isSagaInspired: true,
    isLegendaryClaim: true,
    ragnarBloodline: true,
    bloodlineBranch: 'bjorn',
    startingHeirlooms: ['shield_of_ironside'],
    signatureEventId: 'sig_bjorn_luna_coffin',
  },
  {
    id: 'halfdan_ragnarsson',
    name: 'Halfdan',
    patronymic: 'Ragnarsson',
    epithet: 'of the Raven Banner',
    subtitle: 'War-King of Jórvík & Plough-Lord of Northumbria · 865 AD',
    historicalContext:
      'Grim, iron-fisted commander of the Great Heathen Army. Where Ivar weaves traps, you shatter gates and parcel out conquered English shires to your veteran oarsmen.',
    year: 865,
    age: 27,
    sex: Sex.Male,
    birthplaceId: 'roskilde',
    socialClass: SocialClass.Royal,
    religion: Religion.NorsePagan,
    traits: ['wolf_blood', 'strong_limbed', 'wrathful'],
    winGoalId: 'avenge_ragnar_england',
    bonusSilver: 70,
    bonusShips: 2,
    bonusWarriors: 40,
    startingFlags: ['veteran_great_army', 'lothbrok_heir'],
    isSagaInspired: true,
    isLegendaryClaim: true,
    ragnarBloodline: true,
    bloodlineBranch: 'halfdan',
    startingHeirlooms: ['bragarfull_horn_lejre'],
    signatureEventId: 'sig_halfdan_tyne_plough',
  },
  {
    id: 'ubba_ragnarsson',
    name: 'Ubba',
    patronymic: 'Ragnarsson',
    epithet: 'the Ferocious',
    subtitle: 'Galdr-Champion of the Frisian & English Estuaries · 865 AD',
    historicalContext:
      'Chronicles from Frisia to East Anglia dread your name. Armed with a heavy Dane-axe and battle-runes, you lead the bloodiest vanguard charges for your father’s Hefnd.',
    year: 865,
    age: 26,
    sex: Sex.Male,
    birthplaceId: 'ribe',
    socialClass: SocialClass.JarlKin,
    religion: Religion.NorsePagan,
    traits: ['wolf_blood', 'berserk_fury_ubba', 'brave'],
    winGoalId: 'avenge_ragnar_england',
    bonusSilver: 60,
    bonusShips: 2,
    bonusWarriors: 32,
    startingFlags: ['veteran_great_army', 'lothbrok_heir'],
    isSagaInspired: true,
    isLegendaryClaim: true,
    ragnarBloodline: true,
    bloodlineBranch: 'ubba',
    startingHeirlooms: ['hrafnsmerki_banner'],
    signatureEventId: 'sig_ubba_frisian_fury',
  },
  {
    id: 'sigurd_snake_eye',
    name: 'Sigurd',
    patronymic: 'Ragnarsson',
    epithet: 'Snake-in-the-Eye',
    subtitle: 'Ouroboros Prince of Zealand & the Sound · 865 AD',
    historicalContext:
      'Born with the white serpent-ring encircling your pupil as foretold by your mother Aslaug. You inherit the islands of Denmark and the dragon-legacy of Sigurd Fafnir-slayer.',
    year: 865,
    age: 23,
    sex: Sex.Male,
    birthplaceId: 'roskilde',
    socialClass: SocialClass.Royal,
    religion: Religion.NorsePagan,
    traits: ['wolf_blood', 'snake_in_the_eye', 'charismatic'],
    winGoalId: 'king_denmark',
    bonusSilver: 85,
    bonusShips: 2,
    bonusWarriors: 28,
    startingFlags: ['lothbrok_heir', 'volsung_heir'],
    isSagaInspired: true,
    isLegendaryClaim: true,
    ragnarBloodline: true,
    bloodlineBranch: 'sigurd',
    startingHeirlooms: ['fang_of_fafnir'],
    signatureEventId: 'sig_sigurd_ouroboros_eye',
  },
  {
    id: 'hvitserk_ragnarsson',
    name: 'Hvitserk',
    patronymic: 'Ragnarsson',
    epithet: 'the White-Shirt',
    subtitle: 'Restless Blade From Eoforwic to the Eastern Rivers · 865 AD',
    historicalContext:
      'When your hand gripped the chess-piece so tightly blood burst beneath the nail at news of Ragnar’s pit, you swore never to rest until Ælla fell — and beyond England lie the blazing pyres of the East.',
    year: 865,
    age: 24,
    sex: Sex.Male,
    birthplaceId: 'hedeby',
    socialClass: SocialClass.JarlKin,
    religion: Religion.NorsePagan,
    traits: ['wolf_blood', 'white_shirt_zeal', 'brave'],
    winGoalId: 'avenge_ragnar_england',
    bonusSilver: 55,
    bonusShips: 1,
    bonusWarriors: 26,
    startingFlags: ['veteran_great_army', 'lothbrok_heir'],
    isSagaInspired: true,
    isLegendaryClaim: true,
    ragnarBloodline: true,
    bloodlineBranch: 'hvitserk',
    startingHeirlooms: ['bragarfull_horn_lejre'],
    signatureEventId: 'sig_hvitserk_burning_pyre',
  },
  {
    id: 'lagertha_shieldmaiden',
    name: 'Lagertha',
    patronymic: 'Skjaldmær',
    epithet: 'the Shieldmaiden',
    subtitle: 'Shieldmaiden Jarl of Gaulardal · 840 AD',
    historicalContext:
      'Celebrated in Saxo’s Gesta Danorum: you fought beside Ragnar in his youth, slew the guardian bear and hound at your porch, and now rule your own Norwegian hall with twenty-seven ships at your call.',
    year: 840,
    age: 26,
    sex: Sex.Female,
    birthplaceId: 'nidaros',
    socialClass: SocialClass.JarlKin,
    religion: Religion.NorsePagan,
    traits: ['wolf_blood', 'shieldmaiden_of_hladgerd', 'oath_keeper'],
    winGoalId: 'king_norway',
    bonusSilver: 65,
    bonusShips: 2,
    bonusWarriors: 28,
    startingFlags: ['shieldmaiden_commander', 'lothbrok_heir'],
    isSagaInspired: true,
    isLegendaryClaim: true,
    ragnarBloodline: true,
    bloodlineBranch: 'lagertha',
    startingHeirlooms: ['shield_of_ironside'],
    signatureEventId: 'sig_lagertha_shieldmaiden_wing',
  },
  {
    id: 'aslaug_kraka',
    name: 'Aslaug',
    patronymic: 'Sigurdsdóttir',
    epithet: 'Kráka, Daughter of Sigurd',
    subtitle: 'Daughter of Sigurd Fafnir-Slayer & Mother of Sea-Kings · 845 AD',
    historicalContext:
      'Hidden in childhood inside Heimir’s great harp, you solved Ragnar’s riddle wrapped in a fish-net. You wove the enchanted seamless shirt and foresaw the snake-in-the-eye; now your prophecies guide the dynasty’s vengeance.',
    year: 845,
    age: 27,
    sex: Sex.Female,
    birthplaceId: 'roskilde',
    socialClass: SocialClass.Royal,
    religion: Religion.NorsePagan,
    traits: ['wolf_blood', 'volsung_vision', 'skald_tongued'],
    winGoalId: 'avenge_ragnar_england',
    bonusSilver: 90,
    bonusShips: 2,
    bonusWarriors: 24,
    startingFlags: ['volsung_heir', 'lothbrok_heir'],
    isSagaInspired: true,
    isLegendaryClaim: true,
    ragnarBloodline: true,
    bloodlineBranch: 'aslaug',
    startingHeirlooms: ['aslaug_unwoven_shirt', 'fang_of_fafnir'],
    signatureEventId: 'sig_aslaug_kraka_prophecy',
  },
];

export const WIN_GOALS: WinGoal[] = [
  {
    id: 'freeform_dynasty',
    title: 'Enduring Saga of the North',
    norseSubtitle: 'Orðstírr deyr aldregi',
    description: 'Survive 3+ generations, amass 450+ Fame, and hold at least 8 odal farms across the seas.',
    checkCompleted: (s) => s.generation >= 3 && s.realm.fame >= 450 && s.realm.landFarms >= 8,
    progressLabel: (s) =>
      `Gen ${s.generation}/3 · Fame ${s.realm.fame}/450 · Farms ${s.realm.landFarms}/8`,
  },
  {
    id: 'king_norway',
    title: 'Konungr of Norway',
    norseSubtitle: 'Nóregs Konungr',
    description: 'Attain rank of Konungr, hold Nidaros and Kaupang, and command 120+ Hird warriors.',
    checkCompleted: (s) =>
      TITLE_LADDER.indexOf(s.character.title) >= TITLE_LADDER.indexOf(TitleRank.Konungr) &&
      s.realm.holdings.some((h) => h.settlementId === 'nidaros') &&
      s.realm.holdings.some((h) => h.settlementId === 'kaupang') &&
      s.realm.hirdWarriors >= 120,
    progressLabel: (s) =>
      `Rank: ${s.character.title} · Hird ${s.realm.hirdWarriors}/120`,
  },
  {
    id: 'king_denmark',
    title: 'King of the Danes',
    norseSubtitle: 'Danakonungr',
    description: 'Attain rank of Konungr, hold Jelling, Hedeby, and Roskilde, with 500+ Fame.',
    checkCompleted: (s) =>
      TITLE_LADDER.indexOf(s.character.title) >= TITLE_LADDER.indexOf(TitleRank.Konungr) &&
      ['jelling', 'hedeby', 'roskilde'].every((id) =>
        s.realm.holdings.some((h) => h.settlementId === id)
      ) &&
      s.realm.fame >= 500,
    progressLabel: (s) =>
      `Danish seats held: ${['jelling', 'hedeby', 'roskilde'].filter((id) => s.realm.holdings.some((h) => h.settlementId === id)).length}/3 · Fame ${s.realm.fame}/500`,
  },
  {
    id: 'king_england',
    title: 'Ruler of England (Danelaw & Crown)',
    norseSubtitle: 'Englands Konungr',
    description: 'Attain Konungr or Overking, hold Jorvik and London or Winchester, with 150+ Hird warriors.',
    checkCompleted: (s) =>
      TITLE_LADDER.indexOf(s.character.title) >= TITLE_LADDER.indexOf(TitleRank.Konungr) &&
      s.realm.holdings.some((h) => h.settlementId === 'jorvik') &&
      (s.realm.holdings.some((h) => h.settlementId === 'london') ||
        s.realm.holdings.some((h) => h.settlementId === 'winchester')) &&
      s.realm.hirdWarriors >= 150,
    progressLabel: (s) =>
      `Jorvik: ${s.realm.holdings.some((h) => h.settlementId === 'jorvik') ? 'Held' : 'Unheld'} · Hird ${s.realm.hirdWarriors}/150`,
  },
  {
    id: 'duke_normandy',
    title: 'Count of Rouen & Normandy (Rollo Path)',
    norseSubtitle: 'Rúðujarl',
    description: 'Hold Rouen with at least 6 farms, reach Jarl+, and secure Frankish recognition or Christian diplomacy.',
    checkCompleted: (s) =>
      TITLE_LADDER.indexOf(s.character.title) >= TITLE_LADDER.indexOf(TitleRank.Jarl) &&
      s.realm.holdings.some((h) => h.settlementId === 'rouen' && h.farms >= 4) &&
      s.realm.landFarms >= 6,
    progressLabel: (s) =>
      `Rank: ${s.character.title} · Farms ${s.realm.landFarms}/6 · Rouen ${s.realm.holdings.some((h) => h.settlementId === 'rouen') ? 'Held' : 'Unheld'}`,
  },
  {
    id: 'king_dublin',
    title: 'King of Dyflinn & the Irish Sea',
    norseSubtitle: 'Dyflinnar Konungr',
    description: 'Reach Jarl or Konungr, hold Dublin and Isle of Man or Waterford, and operate 3+ Trade Networks.',
    checkCompleted: (s) =>
      TITLE_LADDER.indexOf(s.character.title) >= TITLE_LADDER.indexOf(TitleRank.Jarl) &&
      s.realm.holdings.some((h) => h.settlementId === 'dublin') &&
      (s.realm.holdings.some((h) => h.settlementId === 'isle_of_man') ||
        s.realm.holdings.some((h) => h.settlementId === 'waterford')) &&
      s.realm.tradeNetworks >= 3,
    progressLabel: (s) =>
      `Dublin: ${s.realm.holdings.some((h) => h.settlementId === 'dublin') ? 'Held' : 'Unheld'} · Trade Links ${s.realm.tradeNetworks}/3`,
  },
  {
    id: 'jarl_orkney',
    title: 'Jarl of Orkney & the Northern Isles',
    norseSubtitle: 'Orkneyinga Jarl',
    description: 'Reach Jarl+, hold Kirkwall and Shetland, and command a fleet of 4+ Longships.',
    checkCompleted: (s) =>
      TITLE_LADDER.indexOf(s.character.title) >= TITLE_LADDER.indexOf(TitleRank.Jarl) &&
      s.realm.holdings.some((h) => h.settlementId === 'kirkwall') &&
      s.realm.holdings.some((h) => h.settlementId === 'shetland') &&
      s.realm.longships >= 4,
    progressLabel: (s) =>
      `Longships ${s.realm.longships}/4 · Isles held: ${['kirkwall', 'shetland'].filter((id) => s.realm.holdings.some((h) => h.settlementId === id)).length}/2`,
  },
  {
    id: 'iceland_chieftain',
    title: 'Goði of the Icelandic Commonwealth',
    norseSubtitle: 'Allsherjargoði',
    description: 'Hold farms at Reykjavik and Thingvellir, reach Law skill 55+, and earn 350+ Fame without bowing to a foreign crown.',
    checkCompleted: (s) =>
      s.realm.holdings.some((h) => h.settlementId === 'reykjavik') &&
      s.realm.holdings.some((h) => h.settlementId === 'thingvellir') &&
      s.character.skills.law >= 55 &&
      s.realm.fame >= 350,
    progressLabel: (s) =>
      `Law Skill ${s.character.skills.law}/55 · Fame ${s.realm.fame}/350`,
  },
  {
    id: 'greenland_founder',
    title: 'Chieftain of the Western Edge (Greenland & Vinland)',
    norseSubtitle: 'Grœnlandsbyggð',
    description: 'Establish holdings at Brattahlid and explore Vinland across the western ocean.',
    checkCompleted: (s) =>
      s.realm.holdings.some((h) => h.settlementId === 'brattahlid') &&
      s.discoveredSettlements.includes('vinland') &&
      s.realm.landFarms >= 5,
    progressLabel: (s) =>
      `Brattahlid: ${s.realm.holdings.some((h) => h.settlementId === 'brattahlid') ? 'Settled' : 'Unsettled'} · Vinland: ${s.discoveredSettlements.includes('vinland') ? 'Sighted' : 'Unknown'}`,
  },
  {
    id: 'north_sea_emperor',
    title: 'High King of the North Sea',
    norseSubtitle: 'Norðrsjávar Yfirkonungr',
    description: 'Hold at least one seat each in Norway, Denmark, and England, command 200+ Hirdmen, and attain Overking rank.',
    checkCompleted: (s) =>
      s.character.title === TitleRank.Overking &&
      s.realm.hirdWarriors >= 200,
    progressLabel: (s) =>
      `Rank: ${s.character.title} · Hird ${s.realm.hirdWarriors}/200 · Fame ${s.realm.fame}/900`,
  },
  {
    id: 'avenge_ragnar_england',
    title: 'Blood-Debt of the Little Piglets (Lothbrok Vengeance)',
    norseSubtitle: 'Gnyðja mundu grísir, ef galtar hag vissi',
    description: 'Avenge Ragnar Lothbrok: conquer or hold Jórvík (York) and at least one other English seat, complete Chapter VIII (The Eagle) or reduce Hefnd debt below 20 with 500+ Fame.',
    checkCompleted: (s) =>
      s.realm.holdings.some((h) => h.settlementId === 'jorvik') &&
      s.realm.holdings.filter((h) =>
        ['lindisfarne', 'jorvik', 'repton', 'london', 'winchester', 'maldon'].includes(h.settlementId)
      ).length >= 2 &&
      s.realm.fame >= 500 &&
      ((s.lothbrokChaptersCompleted ?? []).includes('ch8_the_eagle') ||
        (s.lothbrokChaptersCompleted ?? []).includes('lothbrok_ch8_the_eagle') ||
        (s.hefndMeter ?? 0) <= 20),
    progressLabel: (s) =>
      `Jórvík: ${s.realm.holdings.some((h) => h.settlementId === 'jorvik') ? 'Held' : 'Unheld'} · English Seats ${
        s.realm.holdings.filter((h) =>
          ['lindisfarne', 'jorvik', 'repton', 'london', 'winchester', 'maldon'].includes(h.settlementId)
        ).length
      }/2 · Hefnd Debt ${s.hefndMeter ?? 0}/100 · Fame ${s.realm.fame}/500`,
  },
];

export type MilitaryCatalogItemId =
  | 'local_garrison'
  | 'bondi_spearmen'
  | 'sworn_huscarls'
  | 'norse_archers'
  | 'berserkers'
  | 'snekkja'
  | 'drakkar'
  | 'knarr'
  | 'warhorses'
  | 'pack_horses'
  | 'war_gear';

export interface MilitaryCatalogItem {
  id: MilitaryCatalogItemId;
  group: 'warriors' | 'fleet' | 'stables';
  action?:
    | 'recruit_bondi'
    | 'recruit_hird'
    | 'recruit_archers'
    | 'recruit_berserkers'
    | 'build_snekkja'
    | 'build_longship'
    | 'build_knarr'
    | 'buy_warhorses'
    | 'buy_pack_horses'
    | 'buy_war_gear';
  norseName: string;
  costSilver: number;
  batchSize: number;
  sealiftCap?: number;
  accentHex: string;
  en: {
    name: string;
    shortName: string;
    role: string;
    description: string;
    batchLabel: string;
    effectText: string;
    ctaLabel: string;
    unitSuffix: string;
  };
  fa: {
    name: string;
    shortName: string;
    role: string;
    description: string;
    batchLabel: string;
    effectText: string;
    ctaLabel: string;
    unitSuffix: string;
  };
}

export const MILITARY_CATALOG: MilitaryCatalogItem[] = [
  {
    id: 'local_garrison',
    group: 'warriors',
    norseName: 'Borgverðir · Garrison',
    costSilver: 0,
    batchSize: 2,
    accentHex: '#34D399',
    en: {
      name: 'Holding Shield-Guards',
      shortName: 'Guards',
      role: 'Settlement Garrison & Watch',
      description: 'Stationed shield-men defending the settlement walls, farms, and keeping local unrest in check.',
      batchLabel: 'Stationed in holding',
      effectText: '-Unrest · +Holding Defense',
      ctaLabel: 'Station Garrison',
      unitSuffix: 'guards',
    },
    fa: {
      name: 'نگهبانان دژ و پادگان شهر',
      shortName: 'نگهبانان',
      role: 'پادگان مستقر و محافظ شهر',
      description: 'جنگجویان سپردار مستقر در برج‌ها و دروازه‌های شهر برای مهار شورش و دفاع از مزارع.',
      batchLabel: 'مستقر در پادگان شهر',
      effectText: 'کاهش ناآرامی · +دفاع شهر',
      ctaLabel: 'تقویت پادگان',
      unitSuffix: 'نگهبان',
    },
  },
  {
    id: 'bondi_spearmen',
    group: 'warriors',
    action: 'recruit_bondi',
    norseName: 'Bóndi Spjótmenn',
    costSilver: 12,
    batchSize: 5,
    accentHex: '#38BDF8',
    en: {
      name: 'Free Spearmen (Bondé)',
      shortName: 'Bondé Spearmen',
      role: 'Light Shield-Levy',
      description: 'Freemen armed with ash-spears and wooden shields; economical troops for swelling ranks and holding garrisons.',
      batchLabel: 'Batch: +5 Warriors',
      effectText: '+10 Base Power · Garrison Levy',
      ctaLabel: 'Recruit 5 Bondi',
      unitSuffix: 'men',
    },
    fa: {
      name: 'نیزه‌داران آزاد (بوندِه)',
      shortName: 'نیزه‌داران بوندِه',
      role: 'پیاده‌نظام سبک و پادگان',
      description: 'مردان آزاد مسلح به نیزه زبان‌گنجشک و سپر چوبی؛ کم‌هزینه‌ترین نیرو برای پر کردن صفوف و نگهبانی از املاک.',
      batchLabel: 'دسته: +۵ جنگجو',
      effectText: 'قدرت پایه: +۱۰ · نیروی پادگان',
      ctaLabel: 'جذب ۵ نیزه‌دار بوندِه',
      unitSuffix: 'نفر',
    },
  },
  {
    id: 'sworn_huscarls',
    group: 'warriors',
    action: 'recruit_hird',
    norseName: 'Hirðmenn · Húskarlar',
    costSilver: 18,
    batchSize: 6,
    accentHex: '#F59E0B',
    en: {
      name: 'Shield-Huskarls (Hird Guard)',
      shortName: 'Huskarls',
      role: 'Heavy Shield-Wall Elite',
      description: 'Veteran household guards with Dane-axes; backbone of the Skjaldborg shield-wall and city sieges (+1 Combat).',
      batchLabel: 'Batch: +6 Huscarls',
      effectText: '+1 Combat · +12 Power',
      ctaLabel: 'Recruit 6 Huscarls',
      unitSuffix: 'men',
    },
    fa: {
      name: 'هوسکارل‌های سپردار (هیرد)',
      shortName: 'هوسکارل‌ها',
      role: 'گارد زبده دیوار سپرها',
      description: 'جنگجویان حرفه‌ای با تبرهای دانمارکی و زره؛ ستون اصلی یورش‌ها و شکستن دروازه شهرها (+۱ مهارت رزم).',
      batchLabel: 'دسته: +۶ هوسکارل',
      effectText: 'رزم +۱ · قدرت +۱۲',
      ctaLabel: 'استخدام ۶ هوسکارل',
      unitSuffix: 'نفر',
    },
  },
  {
    id: 'norse_archers',
    group: 'warriors',
    action: 'recruit_archers',
    norseName: 'Bogamenn · Yew-Bowmen',
    costSilver: 20,
    batchSize: 5,
    accentHex: '#34D399',
    en: {
      name: 'Hunting Archers',
      shortName: 'Archers',
      role: 'Ranged Volley & Skirmish',
      description: 'Sharpshooters with heavy yew longbows who rain broadhead arrows upon enemy decks and ramparts before the clash.',
      batchLabel: 'Batch: +5 Bowmen',
      effectText: '+2 Combat · +2 Cunning',
      ctaLabel: 'Recruit 5 Bowmen',
      unitSuffix: 'men',
    },
    fa: {
      name: 'کمانداران شکاری شمال',
      shortName: 'کمانداران',
      role: 'پشتیبانی تیرباران و کمین',
      description: 'تیراندازان ماهر با کمان‌های چوب سرخدار که پیش از نبرد تن‌به‌تن، عرشه کشتی‌ها و باروی قلعه‌ها را تیرباران می‌کنند.',
      batchLabel: 'دسته: +۵ کماندار',
      effectText: 'رزم +۲ · ذکاوت +۲',
      ctaLabel: 'استخدام ۵ کماندار',
      unitSuffix: 'نفر',
    },
  },
  {
    id: 'berserkers',
    group: 'warriors',
    action: 'recruit_berserkers',
    norseName: 'Berserkir ok Úlfhéðnar',
    costSilver: 28,
    batchSize: 4,
    accentHex: '#F43F5E',
    en: {
      name: 'Berserkers & Úlfhéðnar',
      shortName: 'Berserkers',
      role: 'Shock Terror Champions',
      description: 'Bear-coat and wolf-skin shock warriors whose furious charge shatters enemy shield-walls (+3 Strength, +8 Fame).',
      batchLabel: 'Batch: +4 Berserkers',
      effectText: '+3 Strength · +8 Fame',
      ctaLabel: 'Recruit 4 Berserkers',
      unitSuffix: 'men',
    },
    fa: {
      name: 'برزرکرها و اولف‌هدنار',
      shortName: 'برزرکرها',
      role: 'جنگجویان خشم اودین (خط‌شکن)',
      description: 'دلاوران بی‌باک در پوست خرس و گرگ که بدون ترس از مرگ، دیوار سپرهای دشمن را متلاشی می‌کنند (+۳ قدرت بدنی و +۸ شهرت).',
      batchLabel: 'دسته: +۴ برزرکر',
      effectText: 'قدرت +۳ · شهرت +۸',
      ctaLabel: 'جذب ۴ برزرکر خشمگین',
      unitSuffix: 'نفر',
    },
  },
  {
    id: 'snekkja',
    group: 'fleet',
    action: 'build_snekkja',
    norseName: 'Snekkja · 20-Oar Patrol',
    costSilver: 32,
    batchSize: 1,
    sealiftCap: 20,
    accentHex: '#22D3EE',
    en: {
      name: 'Snekkja Patrol Ship',
      shortName: 'Snekkja',
      role: 'Swift Shallow-Draft Raider',
      description: 'Light, shallow-draft 20-oar warship ideal for river strikes, dawn ambushes (+6 Raid) & +2 Seamanship.',
      batchLabel: 'Cap: 20 men',
      effectText: '+2 Seamanship · Cap 20',
      ctaLabel: 'Build Snekkja',
      unitSuffix: 'ships',
    },
    fa: {
      name: 'کشتی گشتی اسنکیا',
      shortName: 'اسنکیا',
      role: 'اسنکیا تندرو و کم‌آبخور',
      description: 'کشتی باریک و چابک با ۲۰ پاروزن؛ عالی برای شبیخون سحرگاهی، رودخانه‌های کم‌عمق و افزایش مهارت دریانوردی (+۲).',
      batchLabel: 'ظرفیت: ۲۰ جنگجو',
      effectText: 'دریانوردی +۲ · ظرفیت ۲۰ نفر',
      ctaLabel: 'ساخت اسنکیا',
      unitSuffix: 'فروند',
    },
  },
  {
    id: 'drakkar',
    group: 'fleet',
    action: 'build_longship',
    norseName: 'Dreki · Dragon Longship',
    costSilver: 55,
    batchSize: 1,
    sealiftCap: 30,
    accentHex: '#38BDF8',
    en: {
      name: 'Drakkar Dragon Longship',
      shortName: 'Drakkar',
      role: 'Flagship Dragon Warship',
      description: 'Flagship dragon warship carrying 30 warriors; grants +15 Fame, +3 Craft & heavy siege power.',
      batchLabel: 'Cap: 30 men',
      effectText: '+15 Fame · +3 Craft · Cap 30',
      ctaLabel: 'Launch Longship',
      unitSuffix: 'ships',
    },
    fa: {
      name: 'ناو جنگی دراکار (لانگ‌شیپ)',
      shortName: 'دراکار',
      role: 'لانگ‌شیپ اژدهانشان',
      description: 'ناو سرفرماندهی با سرِ اژدهای منبت‌کاری‌شده؛ حمل ۳۰ جنگجو، +۱۵ شهرت و قدرت محاصره بالا.',
      batchLabel: 'ظرفیت: ۳۰ جنگجو',
      effectText: 'شهرت +۱۵ · ظرفیت ۳۰ نفر',
      ctaLabel: 'ساخت لانگ‌شیپ',
      unitSuffix: 'فروند',
    },
  },
  {
    id: 'knarr',
    group: 'fleet',
    action: 'build_knarr',
    norseName: 'Knörr · Ocean Trader',
    costSilver: 45,
    batchSize: 1,
    sealiftCap: 15,
    accentHex: '#34D399',
    en: {
      name: 'Knarr Ocean Trader',
      shortName: 'Knarr',
      role: 'Merchant Cargo Vessel',
      description: 'Broad-hulled ocean cargo ship that reduces storm peril and opens +1 active Trade Network.',
      batchLabel: '+18% Trade Profit',
      effectText: '+18% Trade Profit · +1 Route',
      ctaLabel: 'Launch Knarr',
      unitSuffix: 'ships',
    },
    fa: {
      name: 'کشتی تجاری کِنار',
      shortName: 'کِنار تجاری',
      role: 'کِنار اقیانوس‌پیما',
      description: 'کشتی پهن‌پیکر و مقاوم در برابر طوفان برای گشودن مسیرهای تجاری جدید (+۱ مسیر) و افزایش سود سالانه.',
      batchLabel: 'سود تجارت: +۱۸٪',
      effectText: '+۱۸٪ سود تجارت · +۱ مسیر تجاری',
      ctaLabel: 'ساخت کِنار تجاری',
      unitSuffix: 'فروند',
    },
  },
  {
    id: 'warhorses',
    group: 'stables',
    action: 'buy_warhorses',
    norseName: 'Víghestar · Stallions',
    costSilver: 24,
    batchSize: 4,
    accentHex: '#F59E0B',
    en: {
      name: 'Nordic War Horses',
      shortName: 'Warhorses',
      role: 'War Stallions',
      description: 'Sturdy stallions for rapid overland strikes, flanking maneuvers, and +3 Combat & +10 Fame.',
      batchLabel: 'Batch: +4 Warhorses',
      effectText: '+3 Combat · +8 Power · +10 Fame',
      ctaLabel: 'Buy 4 Warhorses',
      unitSuffix: 'horses',
    },
    fa: {
      name: 'اسب‌های جنگی نوردیک',
      shortName: 'اسب جنگی',
      role: 'اسب جنگی نوردیک',
      description: 'اسب‌های چابک برای پیشروی برق‌آسای سپاه در خشکی، محاصره سریع و تاکتیک فرار ساختگی (+۳ رزم، +۱۰ شهرت).',
      batchLabel: 'دسته: +۴ اسب جنگی',
      effectText: 'قدرت +۸ · رزم +۳ · شهرت +۱۰',
      ctaLabel: 'خرید ۴ اسب جنگی',
      unitSuffix: 'راس',
    },
  },
  {
    id: 'pack_horses',
    group: 'stables',
    action: 'buy_pack_horses',
    norseName: 'Klyfjahestar · Pack Mounts',
    costSilver: 16,
    batchSize: 4,
    accentHex: '#2DD4BF',
    en: {
      name: 'Caravan Pack Horses',
      shortName: 'Pack Horses',
      role: 'Pack Mounts',
      description: 'Fjord pack horses that haul +10% extra raid plunder, add +12 Food Stores, and grant +3 Trade.',
      batchLabel: 'Batch: +4 Pack Horses',
      effectText: '+10% Plunder · +12 Food · +3 Trade',
      ctaLabel: 'Buy 4 Pack Horses',
      unitSuffix: 'horses',
    },
    fa: {
      name: 'اسب‌های بارکش و کاروانی',
      shortName: 'اسب بارکش',
      role: 'ستور بارکش کاروان',
      description: 'ستورهای مقاوم با خورجین‌های چرمی؛ افزایش +۱۰٪ غنیمت یورش‌ها، +۱۲ آذوقه انبار و +۳ مهارت تجارت.',
      batchLabel: 'دسته: +۴ اسب بارکش',
      effectText: '+۱۰٪ غنیمت · +۱۲ آذوقه · تجارت +۳',
      ctaLabel: 'خرید ۴ اسب بارکش',
      unitSuffix: 'راس',
    },
  },
  {
    id: 'war_gear',
    group: 'stables',
    action: 'buy_war_gear',
    norseName: 'Brynja ok Ulfberht',
    costSilver: 30,
    batchSize: 1,
    accentHex: '#A78BFA',
    en: {
      name: 'Ulfberht Ring-Mail & Steel',
      shortName: 'Ulfberht Armory',
      role: 'Ulfberht Armory',
      description: 'Outfit your champions with riveted ring-mail and crucible steel (+4 Combat, +3 Strength, +10 Power).',
      batchLabel: 'Upgrade: +1 Tier',
      effectText: '+4 Combat · +3 Strength · +10 Power',
      ctaLabel: 'Forge War-Gear',
      unitSuffix: 'tier',
    },
    fa: {
      name: 'زره حلقه‌ای و شمشیرهای فولادی',
      shortName: 'زره اولف‌برهت',
      role: 'زره و فولاد اولف‌برهت',
      description: 'تجهیز سپاه به زره‌های زنجیری، کلاه‌خودهای چشمی و شمشیرهای فولادی آبدیده (+۴ رزم، +۳ قدرت بدنی).',
      batchLabel: 'ارتقا: +۱ سطح زره',
      effectText: 'رزم +۴ · قدرت +۱۰ · نیرو +۳',
      ctaLabel: 'تجهیز زره و سلاح',
      unitSuffix: 'سطح',
    },
  },
];

export const MILITARY_CATALOG_BY_ID: Record<MilitaryCatalogItemId, MilitaryCatalogItem> =
  Object.fromEntries(MILITARY_CATALOG.map((item) => [item.id, item])) as Record<
    MilitaryCatalogItemId,
    MilitaryCatalogItem
  >;

