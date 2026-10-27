import { useState } from 'react';
import {
  Calendar,
  Compass,
  Crown,
  Dices,
  Flame,
  FolderOpen,
  Hammer,
  HelpCircle,
  MapPin,
  Play,
  RotateCcw,
  Shield,
  Ship,
  SlidersHorizontal,
  Sparkles,
  Swords,
  Users,
} from 'lucide-react';
import { SETTLEMENTS } from '../data/geography';
import {
  FEMALE_NAMES_BY_REGION,
  HISTORICAL_ERAS,
  MALE_NAMES_BY_REGION,
  makePatronymic,
  PREMADE_CHARACTERS,
  SELECTABLE_TRAITS,
  SOCIAL_CLASS_CONFIG,
  WIN_GOALS,
} from '../data/namesAndTraits';
import { NewGameParams } from '../engine/gameEngine';
import { generateReadableSeed } from '../engine/prng';
import {
  formatPersonName,
  PREMADE_CHARACTERS_FA,
  SETTLEMENTS_FA,
  SOCIAL_CLASS_FA,
  TRAITS_FA,
  WIN_GOALS_FA,
} from '../i18n/gameDataFa';
import {
  CLASS_SHORT_LABELS_I18N,
  formatAgeLabel,
  formatYearLabel,
  isRtl,
  REGION_LABELS,
  RELIGION_LABELS,
} from '../i18n/ui';
import {
  CharacterAppearance,
  FullGameState,
  Language,
  PremadeCharacter,
  RegionGroup,
  Religion,
  Sex,
  SocialClass,
  StartingHomeland,
  StartingOccupation,
} from '../types/game';
import longshipHeroUrl from '../assets/images/viking_longship_ember_dusk_1793047790383.jpg';
import { NordicAccordion, NordicSelect } from './NordicControls';
import { VikingPortrait } from './VikingPortrait';

interface CharacterCreationProps {
  lang: Language;
  onOpenGuide: () => void;
  savedGame: FullGameState | null;
  onResumeSaved: () => void;
  onStartNewGame: (params: NewGameParams) => void;
  onOpenLoadModal: () => void;
}

interface HomelandDef {
  id: StartingHomeland;
  regionGroup: RegionGroup;
  defaultBirthplace: string;
  nameEn: string;
  nameFa: string;
  introEn: string;
  introFa: string;
  perkEn: string;
  perkFa: string;
}

const HOMELANDS: HomelandDef[] = [
  {
    id: 'norway',
    regionGroup: 'Norway',
    defaultBirthplace: 'nidaros',
    nameEn: 'Norway (Fjords of the North)',
    nameFa: 'نروژ (آبدره‌ها و پادشاهان دریا)',
    introEn: 'Glacial fjords, iron-cold gales, and ancestral longship shipwrights.',
    introFa: 'سرزمین آبدره‌های سنگی، کولاک‌های استخوان‌سوز و کشتی‌سازان کهن.',
    perkEn: '+10 Seamanship · +8 Honor · 1 War Longship',
    perkFa: '+10 دریانوردی · +8 شرافت · ۱ کشتی جنگی',
  },
  {
    id: 'denmark',
    regionGroup: 'Denmark',
    defaultBirthplace: 'hedeby',
    nameEn: 'Denmark (Hedeby & Ring-Forts)',
    nameFa: 'دانمارک (باروهای ترلبورگ و بازار هدبی)',
    introEn: 'Rich trading emporia, Danish royal earthworks, and proximity to Frankish silver.',
    introFa: 'امپراتوری بازرگانی هدبی، دژهای سلطنتی ترلبورگ و دسترسی به بازارهای اروپا.',
    perkEn: '+8 Trade · +40 Silver · 1 War Longship',
    perkFa: '+8 تجارت · +40 نقره · ۱ کشتی جنگی',
  },
  {
    id: 'sweden',
    regionGroup: 'Sweden',
    defaultBirthplace: 'birka',
    nameEn: 'Sweden (Birka & Eastern Shores)',
    nameFa: 'سوئد و اسویالاند (مرکز بیرکا و دروازه شرق)',
    introEn: 'The fortified island of Birka, Baltic amber, and the gateway to eastern river routes.',
    introFa: 'جزیره مستحکم بیرکا، کرانه‌های کهربا و دروازه رودخانه‌های بزرگ شرق.',
    perkEn: '+6 Combat · +6 Trade · +30 Silver · +1 Trade Route',
    perkFa: '+6 نبرد · +6 تجارت · +30 نقره · +1 مسیر تجاری',
  },
  {
    id: 'iceland',
    regionGroup: 'North Atlantic',
    defaultBirthplace: 'thingvellir',
    nameEn: 'Iceland (The Free Republic & Althing)',
    nameFa: 'ایسلند (جمهوری آزادگان و شورای آلتینگ)',
    introEn: 'Volcanic wilderness founded by chieftains who defied kings; governed by the law-rock.',
    introFa: 'سرزمین آتش و یخ؛ پناهگاه آزادگانی که با سوگند قانون و بدون باج شاهان حکومت می‌کنند.',
    perkEn: '+14 Law · +12 Wyrd Fate Luck · Free of Royal Taxes',
    perkFa: '+14 قانون‌دانی · +12 بخت ویرد · معاف از باج سلطنتی',
  },
  {
    id: 'orkney',
    regionGroup: 'British Isles',
    defaultBirthplace: 'birsay',
    nameEn: 'Orkney & Hebrides (Western Isles)',
    nameFa: 'اورکنی و جزایر غرب (یارل‌نشین اقیانوس)',
    introEn: 'Storm-tossed Atlantic isles, corsair harbors, and constant clashes with Scottish clans.',
    introFa: 'جزایر بادگیر اقیانوس اطلس، پایگاه دزدان دریایی و سلحشوران دریا.',
    perkEn: '+8 Combat · +8 Seamanship · 1 Raider Ship',
    perkFa: '+8 نبرد · +8 دریانوردی · ۱ کشتی تندرو',
  },
  {
    id: 'normandy',
    regionGroup: 'Continent',
    defaultBirthplace: 'rouen',
    nameEn: 'Normandy & Frankia (Duchy of Northmen)',
    nameFa: 'نورماندی و فرانکستان (دوک‌نشین شمالی‌ها)',
    introEn: 'River blockades along the Seine, cavalry battles, and Frankish feudal intrigue.',
    introFa: 'کرانه‌های رود سن، نبرد سواره‌نظام و دیپلماسی پیچیده با دربار فرانسه.',
    perkEn: '+12 Diplomacy · +45 Silver · Continental Contacts',
    perkFa: '+12 دیپلماسی · +45 نقره · پیوندهای درباری',
  },
  {
    id: 'rus',
    regionGroup: 'Kievan Rus & Rivers',
    defaultBirthplace: 'novgorod',
    nameEn: 'Kievan Rus (Great River Highway)',
    nameFa: 'روس کی‌یف (شاهراه بزرگ رودها تا بیزانس)',
    introEn: 'Hauling longships overland between the Dnieper and Volga to trade furs for Byzantine gold.',
    introFa: 'غلتاندن کشتی‌ها روی زمین بین رودهای دنیپر و ولگا برای رسیدن به قسطنطنیه.',
    perkEn: '+12 Trade · +6 Combat · 1 River Knarr',
    perkFa: '+12 تجارت · +6 نبرد · ۱ کشتی کنار',
  },
  {
    id: 'england',
    regionGroup: 'British Isles',
    defaultBirthplace: 'jorvik',
    nameEn: 'England & Danelaw (Rich Saxon Shires)',
    nameFa: 'انگلستان و دانلا (قلمرو ثروتمند ساکسون‌ها)',
    introEn: 'Gleaming coastal abbeys, rich barley fields, and clash of Saxon and Norse steel.',
    introFa: 'صومعه‌های پر از طلا، دشت‌های زرخیز و برخورد پولاد وایکینگ و آنگلوساکسون.',
    perkEn: '+12 Farming · +35 Silver · 2 Family Farms',
    perkFa: '+12 کشاورزی · +35 نقره · ۲ مزرعه خانوادگی',
  },
  {
    id: 'ireland',
    regionGroup: 'Ireland',
    defaultBirthplace: 'dublin',
    nameEn: 'Kingdom of Dublin (Norse-Gael Havens)',
    nameFa: 'پادشاهی دوبلین (حاکمان نورس-گیلیک)',
    introEn: 'Fortified coastal longphorts, cattle-raiding warfare, and mixed ostmen dynasties.',
    introFa: 'دژهای ساحلی لانگ‌فورت، غارت دام و خاندان‌های پیوندخورده با اشراف ایرلند.',
    perkEn: '+8 Seamanship · +8 Combat · +25 Silver',
    perkFa: '+8 دریانوردی · +8 نبرد · +25 نقره',
  },
];

interface OccupationDef {
  id: StartingOccupation;
  socialClass: SocialClass;
  nameEn: string;
  nameFa: string;
  descEn: string;
  descFa: string;
  perkEn: string;
  perkFa: string;
}

const OCCUPATIONS: OccupationDef[] = [
  {
    id: 'thrall',
    socialClass: SocialClass.Thrall,
    nameEn: 'Thrall (Unfree Bondservant)',
    nameFa: 'بنده و برده (ترال)',
    descEn: 'Bound to another household. No legal wergild; must earn or seize freedom first.',
    descFa: 'بدون حق حمل سلاح در خدمت ارباب؛ هدف اول نجات خود و بازخرید آزادی است.',
    perkEn: '+8 Health · +8 Strength · Freedom Quest',
    perkFa: '+8 سلامتی · +8 قدرت · مأموریت کسب آزادی',
  },
  {
    id: 'fisherman',
    socialClass: SocialClass.Karl,
    nameEn: 'Fisherman (Net & Skiff)',
    nameFa: 'ماهیگیر سواحل',
    descEn: 'Surviving stormy fjords with cod-lines and harbor nets, hardened against the cold.',
    descFa: 'مرد امواج و تورهای ساحلی؛ سازگار با آب‌وهوای سخت و مه زمستانی.',
    perkEn: '+14 Seamanship · +25 Food Stores',
    perkFa: '+14 دریانوردی · +25 آذوقه ذخیره',
  },
  {
    id: 'farmer',
    socialClass: SocialClass.Bonde,
    nameEn: 'Farmer (Odal Landholder)',
    nameFa: 'دهقان و زمین‌دار (بونده)',
    descEn: 'Freeborn landowner cultivating ancestral soil, cattle pastures, and barley barns.',
    descFa: 'صاحب مزارع آباواجدادی، گله‌های گاو و انبار غلات با صدای معتبر در شورا.',
    perkEn: '+16 Farming · +2 Farms · +25 Silver',
    perkFa: '+16 کشاورزی · +2 مزرعه · +25 نقره',
  },
  {
    id: 'blacksmith',
    socialClass: SocialClass.Karl,
    nameEn: 'Master Blacksmith',
    nameFa: 'آهنگر و اسلحه‌ساز',
    descEn: 'Forging iron axes, pattern-welded swords, and ship rivets over charcoal fires.',
    descFa: 'کوبنده تبرهای جنگی و تیغه‌های پولادین بر سندان با قدرت بازوی استثنایی.',
    perkEn: '+18 Craft · +8 Strength · +35 Silver',
    perkFa: '+18 صنعتگری · +8 قدرت · +35 نقره',
  },
  {
    id: 'merchant',
    socialClass: SocialClass.Bonde,
    nameEn: 'Scale-Bearing Merchant',
    nameFa: 'بازرگان و ترازو‌دار',
    descEn: 'Weighing silver dirhams and trading northern furs from Baltic ports to Byzantium.',
    descFa: 'سنجش نقره با ترازوی برنزی، تجارت خز سمور و مروارید در بازارهای بزرگ.',
    perkEn: '+18 Trade · +6 Cunning · +65 Silver · 1 Knarr',
    perkFa: '+18 تجارت · +6 زیرکی · +65 نقره · ۱ کشتی تجاری',
  },
  {
    id: 'skald',
    socialClass: SocialClass.Karl,
    nameEn: 'Skald (Saga Poet)',
    nameFa: 'شاعر و راوی چکامه‌ها (اسکالد)',
    descEn: 'Carving oral verses of blood, gods, and glory that kings pay silver to hear.',
    descFa: 'سراینده اشعار حماسی و حفظ‌کننده تبارنامه‌ها؛ زبانش برنده‌تر از شمشیر است.',
    perkEn: '+20 Skaldcraft · +10 Charisma · +35 Fame',
    perkFa: '+20 سخنوری · +10 جذابیت · +35 شهرت',
  },
  {
    id: 'warrior',
    socialClass: SocialClass.HersirKin,
    nameEn: 'Sworn Warrior (Hirdman)',
    nameFa: 'جنگجوی سوگندخورده (هیردمن)',
    descEn: 'Chainmail-clad household guard, sworn by blood-oath to shield their chieftain.',
    descFa: 'سپردار زره‌پوش و جنگاور سوگندخورده در تالار سرداران.',
    perkEn: '+18 Combat · +8 Strength · +6 Warriors · +20 Silver',
    perkFa: '+18 نبرد · +8 قدرت · +6 جنگجو · +20 نقره',
  },
  {
    id: 'sailor',
    socialClass: SocialClass.Karl,
    nameEn: 'Longship Navigator',
    nameFa: 'ناوبر و دیده‌بان دریا',
    descEn: 'Steering through North Atlantic squalls using calcite sunstones and bird-flight.',
    descFa: 'هدایت کشتی از میان امواج اقیانوس با سنگ خورشیدی و پرواز پرندگان دریایی.',
    perkEn: '+18 Seamanship · +6 Combat · Gale Resilience',
    perkFa: '+18 دریانوردی · +6 نبرد · مقاومت در برابر طوفان',
  },
  {
    id: 'hunter',
    socialClass: SocialClass.Karl,
    nameEn: 'Wilderness Hunter',
    nameFa: 'شکارچی و ردیاب بیشه‌ها',
    descEn: 'Tracking reindeer and polar bears in snowy forests, master of bows and stealth.',
    descFa: 'ردیابی خرس و گوزن در جنگل‌های برفی با تیروکمان و شبیخون‌های بی‌صدا.',
    perkEn: '+14 Cunning · +8 Combat · Winter Survival',
    perkFa: '+14 زیرکی · +8 نبرد · بقا در سرمای سخت',
  },
  {
    id: 'seeress',
    socialClass: SocialClass.Karl,
    nameEn: 'Völva / Seeress & Healer',
    nameFa: 'پیشگو و طبیب گیاهی (وولوا)',
    descEn: 'Chanting seidr songs, reading runes of fate, and brewing forest medicines.',
    descFa: 'آشنا با جادوی کهن سیدر، فال رون‌ها و مرحم‌های گیاهی شفابخش.',
    perkEn: '+22 Seidr · +16 Wyrd · +10 Faith',
    perkFa: '+22 آیین سیدر · +16 سرنوشت · +10 ایمان',
  },
  {
    id: 'noble',
    socialClass: SocialClass.JarlKin,
    nameEn: 'Noble Chieftain Born',
    nameFa: 'نجیب‌زاده و شاه‌تبار',
    descEn: 'Born into ancient dynasties; every throne is within claim, and every rival plots against you.',
    descFa: 'زاده خاندان‌های فرمانروا؛ وارث تالار، کشتی‌ها و حسادت دربارهای رقیب.',
    perkEn: '+12 Charisma · +10 Diplomacy · +120 Silver · 16 Hirdmen · 1 Longship',
    perkFa: '+12 جذابیت · +10 دیپلماسی · +120 نقره · ۱۶ جنگجو · ۱ لانگ‌شیپ',
  },
];

const HAIR_COLORS: CharacterAppearance['hairColor'][] = ['blonde', 'red', 'brown', 'black'];

const ERA_INFO: Record<
  1 | 2 | 3 | 4,
  { year: number; shortEn: string; shortFa: string; descEn: string; descFa: string }
> = {
  1: {
    year: 793,
    shortEn: '793 · First Raids',
    shortFa: '۷۹۳ · آغاز یورش‌ها',
    descEn: 'Early raids on Lindisfarne & Iona; dragon-ships first strike European shores.',
    descFa: 'اولین یورش‌های دریایی به صومعه لیندیسفارن، ایرلند و رودهای اروپا.',
  },
  2: {
    year: 865,
    shortEn: '865 · Great Heathen Army',
    shortFa: '۸۶۵ · ارتش بزرگ بت‌پرستان',
    descEn: 'Ragnar’s sons invade Anglo-Saxon kingdoms, Harald Fairhair unifies Norway & Iceland is settled.',
    descFa: 'لشکرکشی پسران راگنار به انگلستان، اتحاد نروژ و کوچ بزرگ به ایسلند.',
  },
  3: {
    year: 960,
    shortEn: '960 · Kings & Greenland',
    shortFa: '۹۶۰ · پادشاهان و کشف غرب',
    descEn: 'Harald Bluetooth unites Denmark; Christian conversions & voyages to Greenland & Vinland.',
    descFa: 'هارالد دندان‌آبی دانمارک را متحد می‌کند؛ ورود مسیحیت و کشف گرینلند و وینلند.',
  },
  4: {
    year: 1016,
    shortEn: '1016 · North Sea Empire',
    shortFa: '۱۰۱۶ · امپراتوری دریای شمال',
    descEn: 'Cnut the Great rules England, Denmark & Norway down to Stamford Bridge (1066).',
    descFa: 'امپراتوری کانوت کبیر تا نبرد استمفورد بریج و فرجام عصر کهن در سال ۱۰۶۶ میلادی.',
  },
};

export function CharacterCreation({
  lang,
  onOpenGuide,
  savedGame,
  onResumeSaved,
  onStartNewGame,
  onOpenLoadModal,
}: CharacterCreationProps) {
  const isFa = lang === 'fa';
  const rtl = isRtl(lang);

  const [mode, setMode] = useState<'create' | 'presets'>('create');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [bgFailed, setBgFailed] = useState(false);

  const [selectedEra, setSelectedEra] = useState<1 | 2 | 3 | 4>(2);
  const [year, setYear] = useState<number>(865);

  const [homelandId, setHomelandId] = useState<StartingHomeland>('norway');
  const [birthplaceId, setBirthplaceId] = useState<string>('nidaros');
  const [occupationId, setOccupationId] = useState<StartingOccupation>('farmer');
  const [religion, setReligion] = useState<Religion>(Religion.NorsePagan);

  const [sex, setSex] = useState<Sex>(Sex.Male);
  const [givenName, setGivenName] = useState<string>('Sigurd');
  const [patronymic, setPatronymic] = useState<string>('Hakonsson');
  const [startAge, setStartAge] = useState<number>(16);
  const [selectedTraits, setSelectedTraits] = useState<string[]>(['brave', 'seafarer']);
  const [winGoalId, setWinGoalId] = useState<string>('freeform_dynasty');
  const [seedString, setSeedString] = useState<string>(() => generateReadableSeed());
  const [appearance, setAppearance] = useState<CharacterAppearance>({
    skinTone: 1,
    hairColor: 'blonde',
    hairStyle: 1,
    beardStyle: 2,
  });

  const selectedHomeland = HOMELANDS.find((h) => h.id === homelandId) ?? HOMELANDS[0];
  const selectedOcc = OCCUPATIONS.find((o) => o.id === occupationId) ?? OCCUPATIONS[2];
  const settlementsInRegion = SETTLEMENTS.filter((s) => s.regionGroup === selectedHomeland.regionGroup);

  const rollName = (reg: RegionGroup, nextSex: Sex) => {
    const gPool = nextSex === Sex.Male ? MALE_NAMES_BY_REGION[reg] ?? MALE_NAMES_BY_REGION['Norway'] : FEMALE_NAMES_BY_REGION[reg] ?? FEMALE_NAMES_BY_REGION['Norway'];
    const fPool = MALE_NAMES_BY_REGION[reg] ?? MALE_NAMES_BY_REGION['Norway'];
    const g = gPool[Math.floor(Math.random() * gPool.length)];
    const f = fPool[Math.floor(Math.random() * fPool.length)];
    setGivenName(g);
    setPatronymic(makePatronymic(f, nextSex));
  };

  const cycleAppearance = () => {
    setAppearance({
      skinTone: Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3,
      hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
      hairStyle: Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3,
      beardStyle: Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3,
    });
  };

  const handleHomelandChange = (hId: StartingHomeland) => {
    setHomelandId(hId);
    const def = HOMELANDS.find((h) => h.id === hId) ?? HOMELANDS[0];
    setBirthplaceId(def.defaultBirthplace);
    rollName(def.regionGroup, sex);
  };

  const handleRandomizeEverything = () => {
    const randomHome = HOMELANDS[Math.floor(Math.random() * HOMELANDS.length)];
    const randomOcc = OCCUPATIONS[Math.floor(Math.random() * OCCUPATIONS.length)];
    const randomSex = Math.random() < 0.5 ? Sex.Male : Sex.Female;
    const randomEra = HISTORICAL_ERAS[Math.floor(Math.random() * HISTORICAL_ERAS.length)];
    const shuffledTraits = [...SELECTABLE_TRAITS].sort(() => Math.random() - 0.5);

    setHomelandId(randomHome.id);
    setBirthplaceId(randomHome.defaultBirthplace);
    setOccupationId(randomOcc.id);
    setSex(randomSex);
    setSelectedEra(randomEra.id);
    setYear(randomEra.defaultYear);
    setSelectedTraits([shuffledTraits[0].id, shuffledTraits[1].id]);
    cycleAppearance();
    rollName(randomHome.regionGroup, randomSex);
  };

  const handleToggleTrait = (traitId: string) => {
    if (selectedTraits.includes(traitId)) {
      if (selectedTraits.length > 1) {
        setSelectedTraits(selectedTraits.filter((t) => t !== traitId));
      }
      return;
    }
    if (selectedTraits.length >= 3) {
      setSelectedTraits([...selectedTraits.slice(1), traitId]);
    } else {
      setSelectedTraits([...selectedTraits, traitId]);
    }
  };

  const handleStart = () => {
    onStartNewGame({
      givenName: givenName.trim() || 'Sigurd',
      patronymic: patronymic.trim() || 'Hakonsson',
      sex,
      year: Math.max(793, Math.min(1066, year)),
      startAge,
      birthplaceId,
      socialClass: selectedOcc.socialClass,
      religion,
      traits: selectedTraits,
      winGoalId,
      seedString: seedString.trim() || generateReadableSeed(),
      appearance,
      startingHomeland: homelandId,
      startingOccupation: occupationId,
    });
  };

  const handleStartPreset = (pm: PremadeCharacter) => {
    onStartNewGame({
      givenName: pm.name,
      patronymic: pm.patronymic,
      sex: pm.sex,
      year: pm.year,
      startAge: pm.age,
      birthplaceId: pm.birthplaceId,
      socialClass: pm.socialClass,
      religion: pm.religion,
      traits: pm.traits,
      winGoalId: pm.winGoalId,
      seedString: generateReadableSeed(),
      appearance: pm.appearance,
    });
  };

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className="relative z-10 h-dvh w-full overflow-y-auto overflow-x-hidden bg-[#0B1118] text-[#F1F5F9]"
    >
      {!bgFailed && (
        <div className="pointer-events-none fixed inset-x-0 top-0 h-80 opacity-25 overflow-hidden">
          <img
            src={longshipHeroUrl}
            alt="Viking longship at dusk"
            referrerPolicy="no-referrer"
            onError={() => setBgFailed(true)}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B1118]/75 to-[#0B1118]" />
        </div>
      )}

      <div className="relative z-10 min-h-full w-full max-w-xl sm:max-w-2xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 flex flex-col justify-start sm:justify-center gap-4">
        {/* Top Utility Strip */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onOpenLoadModal}
            className="min-h-[44px] px-3.5 rounded-xl bg-[#131D2B]/95 border border-[#233246] hover:border-[#F59E0B] text-xs font-medium text-[#CBD5E1] hover:text-[#F1F5F9] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors"
          >
            <FolderOpen className="w-4 h-4 text-[#F59E0B]" />
            <span>{isFa ? 'مدیریت ذخیره‌ها' : 'Save Files'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenGuide}
            className="min-h-[44px] px-3.5 rounded-xl bg-[#131D2B]/95 border border-[#233246] hover:border-[#38BDF8] text-xs font-medium text-[#F1F5F9] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-[#38BDF8]" />
            <span>{isFa ? 'راهنمای سریع بازی' : 'How to Play'}</span>
          </button>
        </div>

        {/* Rebranded Game Title */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="text-xs font-mono tracking-widest text-[#38BDF8] flex items-center justify-center gap-2">
            <span>᛫</span>
            <span>{isFa ? 'حماسه‌ی تاج‌ها' : 'SAGA OF CROWNS'}</span>
            <span>᛫</span>
          </div>
          <h1 className="font-saga text-4xl sm:text-5xl font-extrabold text-[#F1F5F9] tracking-tight">
            {isFa ? 'حماسه‌ی تاج‌ها' : 'Saga of Crowns'}
          </h1>
          <p className="text-xs sm:text-sm text-[#F59E0B] font-semibold tracking-wide">
            {isFa ? 'حماسه‌ای از خون، ایمان و اقتدار' : 'A Saga of Blood, Faith & Power'}
          </p>
          <p className="text-[11px] text-[#94A3B8]">
            {isFa
              ? 'شخصیت خود را بساز، در اروپا و اقیانوس بجنگ، حکومت کن و میراث دودمانت را بساز · ۷۹۳ تا ۱۰۶۶ میلادی'
              : 'Forge your ruler, conquer kingdoms across medieval Europe & pass your legacy to heirs · 793–1066 AD'}
          </p>
        </div>

        {/* Continue Saved Game Banner */}
        {savedGame && (
          <button
            type="button"
            onClick={onResumeSaved}
            className="w-full min-h-[60px] px-4 py-3 rounded-xl bg-[#132235] border border-[#F59E0B] hover:bg-[#192C44] transition-colors flex items-center justify-between gap-3 cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0 text-start">
              <VikingPortrait
                age={savedGame.character.age}
                sex={savedGame.character.sex}
                traits={savedGame.character.traits}
                title={savedGame.character.title}
                appearance={savedGame.character.appearance}
                seedId={savedGame.character.id}
                size={44}
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs text-[#F59E0B] font-semibold">
                  {isFa ? 'ادامه بازی ذخیره‌شده' : 'Continue Current Life'}
                </div>
                <div className="font-saga text-base sm:text-lg font-bold text-[#F1F5F9] line-clamp-2 break-words leading-snug">
                  {formatPersonName(
                    `${savedGame.character.givenName} ${savedGame.character.patronymic}`,
                    lang
                  )}{' '}
                  · {formatAgeLabel(savedGame.character.age, lang)} (
                  {formatYearLabel(savedGame.year, lang)})
                </div>
              </div>
            </div>
            <RotateCcw className="w-5 h-5 text-[#F59E0B] shrink-0" />
          </button>
        )}

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#131D2B] border border-[#233246] rounded-xl">
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`min-h-[44px] px-3 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              mode === 'create'
                ? 'bg-[#F59E0B] text-[#0B1118]'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            {isFa ? 'شخصیت اختصاصی' : 'Custom Origin'}
          </button>
          <button
            type="button"
            onClick={() => setMode('presets')}
            className={`min-h-[44px] px-3 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              mode === 'presets'
                ? 'bg-[#F59E0B] text-[#0B1118]'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            {isFa ? '۵ شخصیت آماده تاریخی' : '5 Historical Lives'}
          </button>
        </div>

        {mode === 'presets' ? (
          <div className="space-y-2.5">
            {PREMADE_CHARACTERS.map((pm) => {
              const place = SETTLEMENTS.find((s) => s.id === pm.birthplaceId);
              const pmFa = PREMADE_CHARACTERS_FA[pm.id];
              const placeName = isFa
                ? SETTLEMENTS_FA[pm.birthplaceId]?.name ?? place?.name
                : place?.name;
              return (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => handleStartPreset(pm)}
                  className="w-full p-4 text-start rounded-xl bg-[#131D2B] border border-[#233246] hover:border-[#F59E0B] transition-colors flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <VikingPortrait
                      age={pm.age}
                      sex={pm.sex}
                      traits={pm.traits}
                      title={SOCIAL_CLASS_CONFIG[pm.socialClass].startingTitle}
                      seedId={pm.id}
                      size={56}
                    />
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="font-saga text-xl font-bold text-[#F1F5F9] break-words leading-snug">
                        {isFa
                          ? pmFa?.displayName ?? `${pm.name} ${pm.patronymic}`
                          : `${pm.name} ${pm.patronymic}`}
                      </div>
                      <div className="text-xs text-[#38BDF8] break-words leading-snug">
                        {isFa ? pmFa?.subtitle ?? pm.subtitle : pm.subtitle} · {placeName}
                      </div>
                      <p className="text-xs text-[#94A3B8] leading-relaxed">
                        {isFa ? pmFa?.context ?? pm.historicalContext : pm.historicalContext}
                      </p>
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-[#F59E0B] text-[#0B1118] flex items-center justify-center shrink-0">
                    <Play className={`w-4 h-4 fill-current ${isFa ? 'rotate-180' : ''}`} />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-4 sm:p-6 rounded-2xl bg-[#131D2B] border border-[#233246] space-y-4 text-start">
            {/* Live Portrait + Name & Sex Row */}
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={cycleAppearance}
                title={isFa ? 'تغییر قیافه، مو و ریش' : 'Tap to change hair, beard & skin'}
                className="relative group cursor-pointer shrink-0"
              >
                <VikingPortrait
                  age={startAge}
                  sex={sex}
                  traits={selectedTraits}
                  title={selectedOcc.socialClass === SocialClass.Thrall ? undefined : undefined}
                  appearance={appearance}
                  seedId="creator_preview"
                  size={68}
                />
                <span className="absolute -bottom-1 inset-x-1 rounded bg-[#0B1118]/90 border border-[#38BDF8]/40 text-[9px] text-[#38BDF8] text-center py-0.5 font-semibold">
                  {isFa ? 'تغییر چهره' : 'Restyle'}
                </span>
              </button>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span className="truncate">
                    {formatPersonName(`${givenName} ${patronymic}`, lang)}
                  </span>
                  <button
                    type="button"
                    onClick={handleRandomizeEverything}
                    className="text-[#F59E0B] hover:underline inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isFa ? 'انتخاب تصادفی' : 'Randomize'}
                  </button>
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={givenName}
                    onChange={(e) => setGivenName(e.target.value)}
                    placeholder={isFa ? 'نام' : 'Name'}
                    aria-label="Given Name"
                    className="flex-1 min-w-0 min-h-[42px] px-3 text-sm bg-[#0B1118] border border-[#283B52] rounded-lg text-[#F1F5F9] focus:outline-none focus:border-[#38BDF8]"
                  />
                  <button
                    type="button"
                    onClick={() => rollName(selectedHomeland.regionGroup, sex)}
                    title={isFa ? 'تولید نام تصادفی' : 'Roll Norse Name'}
                    className="min-w-[42px] min-h-[42px] flex items-center justify-center bg-[#0B1118] border border-[#283B52] hover:border-[#38BDF8] rounded-lg text-[#38BDF8] cursor-pointer shrink-0"
                  >
                    <Dices className="w-4 h-4" />
                  </button>
                  <div className="flex p-1 bg-[#0B1118] border border-[#283B52] rounded-lg shrink-0">
                    {([Sex.Male, Sex.Female] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setSex(s);
                          rollName(selectedHomeland.regionGroup, s);
                        }}
                        className={`px-2.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                          sex === s ? 'bg-[#38BDF8] text-[#0B1118] font-bold' : 'text-[#94A3B8]'
                        }`}
                      >
                        {s === Sex.Male ? (isFa ? 'مرد' : 'M') : isFa ? 'زن' : 'F'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Core Saga Choices */}
            <div className="space-y-3">
              {/* 1. Starting Homeland & Culture */}
              <NordicSelect
                label={isFa ? 'سرزمین زادگاه و فرهنگ شروع' : 'Starting Homeland & Culture'}
                value={homelandId}
                icon={<Compass className="w-4 h-4 text-[#38BDF8]" />}
                onChange={(val) => handleHomelandChange(val as StartingHomeland)}
                options={HOMELANDS.map((h) => ({
                  value: h.id,
                  label: isFa ? h.nameFa : h.nameEn,
                  sublabel: isFa ? `${h.introFa} (${h.perkFa})` : `${h.introEn} (${h.perkEn})`,
                  badge: isFa ? h.perkFa.split('·')[0].trim() : h.perkEn.split('·')[0].trim(),
                  badgeTone: 'gold',
                }))}
              />

              {/* Birth Port in Selected Homeland */}
              <NordicSelect
                label={isFa ? 'بندرگاه یا پایتخت زادگاه' : 'Birth Settlement & Port'}
                value={birthplaceId}
                icon={<MapPin className="w-4 h-4 text-[#F59E0B]" />}
                onChange={(val) => setBirthplaceId(val)}
                options={settlementsInRegion.map((s) => ({
                  value: s.id,
                  label: isFa ? SETTLEMENTS_FA[s.id]?.name ?? s.name : s.name.split(' (')[0],
                  sublabel: s.settlementType ? `Type: ${s.settlementType}` : undefined,
                }))}
              />

              {/* 2. Social Class & Occupation */}
              <NordicSelect
                label={isFa ? 'طبقه اجتماعی و پیشه شروع' : 'Starting Class & Occupation'}
                value={occupationId}
                icon={<Crown className="w-4 h-4 text-[#F59E0B]" />}
                onChange={(val) => setOccupationId(val as StartingOccupation)}
                options={OCCUPATIONS.map((occ) => ({
                  value: occ.id,
                  label: isFa ? occ.nameFa : occ.nameEn,
                  sublabel: isFa ? `${occ.descFa} (${occ.perkFa})` : `${occ.descEn} (${occ.perkEn})`,
                  badge: isFa ? occ.perkFa.split('·')[0].trim() : occ.perkEn.split('·')[0].trim(),
                  badgeTone: occ.id === 'noble' ? 'gold' : 'ice',
                }))}
              />

              {/* 3. Starting Religion */}
              <NordicSelect
                label={isFa ? 'آیین و باور مذهبی' : 'Starting Faith & Religion'}
                value={religion}
                icon={<Flame className="w-4 h-4 text-[#38BDF8]" />}
                onChange={(val) => setReligion(val as Religion)}
                options={[
                  {
                    value: Religion.NorsePagan,
                    label: isFa ? 'خدایان کهن شمال (اودین، ثور و فریر)' : 'Old Norse Gods (Thor, Odin & Freyr)',
                    sublabel: isFa ? 'برگزاری جشن بلوت، افتخار در دوئل هولم‌گانگ و غارت بدون گناه صومعه‌ها' : 'Blót feasts, holmgang duels, no sin in monastery raids',
                    badge: isFa ? 'پاگان شمال' : 'Norse Pagan',
                    badgeTone: 'gold',
                  },
                  {
                    value: Religion.Christian,
                    label: isFa ? 'مسیح سپید (آیین مسیحیت)' : 'White Christ (Christianity)',
                    sublabel: isFa ? 'محبوبیت در دربارهای اروپا، کلیساهای چوبی و کاهش شورش متصرفات مسیحی' : 'Court favor in Frankia & England, stave churches, calmer unrest',
                    badge: isFa ? 'مسیحی' : 'Christian',
                    badgeTone: 'ice',
                  },
                  {
                    value: Religion.Islam,
                    label: isFa ? 'اسلام (آیین سرزمین‌های شرقی و خلافت)' : 'Islam (Faith of Serkland & Caliphate)',
                    sublabel: isFa ? 'تجارت مستقیم درهم و عاج با بغداد و مسیرهای خزر، انضباط و محاسبه' : 'Direct dirham trade with Baghdad & Caspian, algebra & trade routes',
                    badge: isFa ? 'سرکلند' : 'Serkland',
                    badgeTone: 'gold',
                  },
                  {
                    value: Religion.SlavicPagan,
                    label: isFa ? 'خدایان اسلاو (پرون و ایزدان جنگل)' : 'Slavic Gods (Perun & Forest Spirits)',
                    sublabel: isFa ? 'مقاومت در سرمای زمستان، پیوند خونی با مردمان اسلاو و رودخانه‌ها' : 'Winter cold resilience, river portage endurance, Slavic kinship',
                    badge: isFa ? 'اسلاو' : 'Slavic',
                    badgeTone: 'ice',
                  },
                ]}
              />

              {/* 4. Historical Starting Era */}
              <NordicSelect
                label={isFa ? 'دوره تاریخی شروع' : 'Historical Era'}
                value={String(selectedEra)}
                icon={<Calendar className="w-4 h-4 text-[#38BDF8]" />}
                onChange={(val) => {
                  const nextEra = Number(val) as 1 | 2 | 3 | 4;
                  setSelectedEra(nextEra);
                  setYear(ERA_INFO[nextEra].year);
                }}
                options={([1, 2, 3, 4] as const).map((eId) => ({
                  value: String(eId),
                  label: isFa ? ERA_INFO[eId].shortFa : ERA_INFO[eId].shortEn,
                  sublabel: isFa ? ERA_INFO[eId].descFa : ERA_INFO[eId].descEn,
                  badge: formatYearLabel(ERA_INFO[eId].year, lang),
                  badgeTone: 'ice',
                }))}
              />
            </div>

            {/* Collapsible Drawer: Traits, Start Age & Dynasty Goal */}
            <NordicAccordion
              title={
                isFa
                  ? 'ویژگی‌های شخصیتی، سن شروع و هدف خاندان'
                  : 'Traits, Starting Age & Dynasty Goal'
              }
              subtitle={
                isFa
                  ? `${formatAgeLabel(startAge, 'fa')} · ${selectedTraits
                      .map((tid) => TRAITS_FA[tid]?.name ?? tid)
                      .join('، ')}`
                  : `${formatAgeLabel(startAge, 'en')} · ${selectedTraits
                      .map((tid) => SELECTABLE_TRAITS.find((t) => t.id === tid)?.name ?? tid)
                      .join(', ')}`
              }
              icon={<SlidersHorizontal className="w-4 h-4" />}
              accent="ice"
              isOpen={showAdvanced}
              onToggle={() => setShowAdvanced((v) => !v)}
            >
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <NordicSelect
                    label={isFa ? 'سن شروع زندگی' : 'Starting Age'}
                    value={String(startAge)}
                    onChange={(val) => setStartAge(Number(val))}
                    options={[
                      {
                        value: '16',
                        label: isFa ? '۱۶ ساله (جوان آماده نبرد و سفر)' : 'Age 16 (Young Adult)',
                        sublabel: isFa ? 'ورود مستقیم به سفرهای دریایی و سیاست' : 'Direct entry into voyages & politics',
                      },
                      {
                        value: '6',
                        label: isFa ? '۶ ساله (دوران کودکی)' : 'Age 6 (Childhood)',
                        sublabel: isFa ? 'رویدادهای کودکی، آموزش و رشد' : 'Childhood education & training',
                      },
                      {
                        value: '0',
                        label: isFa ? 'نوزاد تازه متولد (۰ سال)' : 'Newborn (Age 0)',
                        sublabel: isFa ? 'زندگی کامل از گهواره تا کهنسالی' : 'Full life from cradle to grave',
                      },
                    ]}
                  />

                  <NordicSelect
                    label={isFa ? 'هدف بزرگ دودمان' : 'Dynasty Ambition'}
                    value={winGoalId}
                    onChange={(val) => setWinGoalId(val)}
                    options={WIN_GOALS.map((wg) => ({
                      value: wg.id,
                      label: isFa ? WIN_GOALS_FA[wg.id]?.title ?? wg.title : wg.title,
                      sublabel: isFa ? WIN_GOALS_FA[wg.id]?.description ?? wg.description : wg.description,
                    }))}
                  />
                </div>

                {/* Traits selector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                    <span>{isFa ? 'ویژگی‌های شخصیتی (۱ تا ۳ مورد)' : 'Personality Traits (1–3)'}</span>
                    <span className="font-mono text-[#38BDF8]">{selectedTraits.length}/3</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {SELECTABLE_TRAITS.map((t) => {
                      const isSel = selectedTraits.includes(t.id);
                      const tFa = TRAITS_FA[t.id];
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleToggleTrait(t.id)}
                          className={`min-h-[44px] px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                            isSel
                              ? 'bg-[#38BDF8] border-[#38BDF8] text-[#0B1118] font-bold shadow-xs'
                              : 'bg-[#0B1118] border-[#283B52] text-[#CBD5E1] hover:border-[#38BDF8]/60'
                          }`}
                        >
                          {isFa ? tFa?.name ?? t.name : t.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Seed Input */}
                <div className="space-y-1">
                  <label className="text-xs text-[#94A3B8]">
                    {isFa ? 'کد بذر جهان (Seed)' : 'World Seed String'}
                  </label>
                  <input
                    type="text"
                    value={seedString}
                    onChange={(e) => setSeedString(e.target.value)}
                    className="w-full min-h-[42px] px-3 text-xs font-mono bg-[#0B1118] border border-[#283B52] rounded-lg text-[#F1F5F9] focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
              </div>
            </NordicAccordion>

            {/* Launch Game Button */}
            <button
              type="button"
              onClick={handleStart}
              className="w-full min-h-[52px] sm:min-h-[56px] px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] hover:brightness-110 active:scale-[0.99] text-[#0B1118] font-saga text-lg sm:text-xl font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#F59E0B]/20 transition-all"
            >
              <Swords className="w-5 h-5 shrink-0" />
              <span>
                {isFa
                  ? `آغاز سفر در سال ${year} میلادی`
                  : `Begin Saga in ${year} AD`}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
