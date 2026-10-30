import {
  EventCategory,
  Language,
  RegionGroup,
  RelationRole,
  Religion,
  Season,
  SkillKey,
  SocialClass,
  StatKey,
  TitleRank,
} from '../types/game';

export function isRtl(lang: Language): boolean {
  return lang === 'fa';
}

export function formatYearLabel(year: number, lang: Language): string {
  return lang === 'fa' ? `سال ${year} میلادی` : `${year} AD`;
}

export function formatAgeLabel(age: number, lang: Language): string {
  return lang === 'fa' ? `سن ${age}` : `Age ${age}`;
}

export const SEASON_LABELS: Record<Language, Record<Season, string>> = {
  en: {
    [Season.Spring]: 'Spring',
    [Season.Summer]: 'Summer',
    [Season.Autumn]: 'Autumn',
    [Season.Winter]: 'Winter',
  },
  fa: {
    [Season.Spring]: 'بهار',
    [Season.Summer]: 'تابستان',
    [Season.Autumn]: 'پاییز',
    [Season.Winter]: 'زمستان',
  },
};

export const TITLE_LABELS: Record<Language, Record<TitleRank, string>> = {
  en: {
    [TitleRank.Thrall]: 'Thrall (Bondservant)',
    [TitleRank.Freeman]: 'Freeman',
    [TitleRank.Bonde]: 'Landowner (Bonde)',
    [TitleRank.Hirdman]: 'Sworn Warrior (Hirdman)',
    [TitleRank.Hersir]: 'War-Chieftain (Hersir)',
    [TitleRank.Huscarl]: 'Housecarl Champion (Húskarl)',
    [TitleRank.Captain]: 'Ship Captain (Stýrimaðr)',
    [TitleRank.Jarl]: 'Jarl (Earl / Duke)',
    [TitleRank.Konungr]: 'King (Konungr)',
    [TitleRank.Overking]: 'High King / King of Kings',
  },
  fa: {
    [TitleRank.Thrall]: 'بنده (ترال)',
    [TitleRank.Freeman]: 'مرد آزاد',
    [TitleRank.Bonde]: 'زمین‌دار (بونده)',
    [TitleRank.Hirdman]: 'جنگجوی سوگندخورده (هیردمن)',
    [TitleRank.Hersir]: 'سردار محلی (هرسیر)',
    [TitleRank.Huscarl]: 'دلاور تالار (هوکارل)',
    [TitleRank.Captain]: 'ناخدا و سرکرده کشتی',
    [TitleRank.Jarl]: 'فرمانروا (یارل)',
    [TitleRank.Konungr]: 'پادشاه (کونونگر)',
    [TitleRank.Overking]: 'شاهنشاه / شاه شاهان',
  },
};

export const SHORT_TITLE_LABELS: Record<Language, Record<TitleRank, string>> = {
  en: {
    [TitleRank.Thrall]: 'Thrall',
    [TitleRank.Freeman]: 'Freeman',
    [TitleRank.Bonde]: 'Landowner',
    [TitleRank.Hirdman]: 'Warrior',
    [TitleRank.Hersir]: 'Chieftain',
    [TitleRank.Huscarl]: 'Huscarl',
    [TitleRank.Captain]: 'Captain',
    [TitleRank.Jarl]: 'Jarl',
    [TitleRank.Konungr]: 'King',
    [TitleRank.Overking]: 'High King',
  },
  fa: {
    [TitleRank.Thrall]: 'بنده',
    [TitleRank.Freeman]: 'آزادمرد',
    [TitleRank.Bonde]: 'زمین‌دار',
    [TitleRank.Hirdman]: 'جنگجو',
    [TitleRank.Hersir]: 'سردار',
    [TitleRank.Huscarl]: 'هوکارل',
    [TitleRank.Captain]: 'ناخدا',
    [TitleRank.Jarl]: 'یارل',
    [TitleRank.Konungr]: 'پادشاه',
    [TitleRank.Overking]: 'شاهنشاه',
  },
};

export const RELIGION_LABELS: Record<Language, Record<Religion, string>> = {
  en: {
    [Religion.NorsePagan]: 'Old Norse Gods',
    [Religion.Syncretic]: 'Mixed Faith (Prime-Signed)',
    [Religion.Christian]: 'Christian',
    [Religion.Islam]: 'Islam (Faith of Serkland)',
    [Religion.SlavicPagan]: 'Slavic Gods (Perun & Rod)',
  },
  fa: {
    [Religion.NorsePagan]: 'خدایان کهن شمال',
    [Religion.Syncretic]: 'آیین ترکیبی (صلیب و چکش ثور)',
    [Religion.Christian]: 'مسیحی',
    [Religion.Islam]: 'اسلام (آیین سرزمین‌های شرقی و خلافت)',
    [Religion.SlavicPagan]: 'خدایان اسلاو (پرون و رود)',
  },
};

export const ROLE_LABELS: Record<Language, Record<RelationRole, string>> = {
  en: {
    Father: 'Father',
    Mother: 'Mother',
    'Foster-Parent': 'Foster-Parent',
    Sibling: 'Sibling',
    Spouse: 'Spouse',
    Concubine: 'Consort',
    Child: 'Child',
    'Foster-Child': 'Foster-Child',
    'Sworn Brother': 'Sworn Brother',
    'Sworn Sister': 'Sworn Sister',
    'Uncle/Aunt': 'Uncle / Aunt',
    'Nephew/Niece': 'Nephew / Niece',
    Cousin: 'Cousin',
    Rival: 'Rival',
    'Blood-Feud Enemy': 'Blood-Feud Enemy',
  },
  fa: {
    Father: 'پدر',
    Mother: 'مادر',
    'Foster-Parent': 'سرپرست خوانده',
    Sibling: 'خواهر/برادر',
    Spouse: 'همسر',
    Concubine: 'همدم',
    Child: 'فرزند',
    'Foster-Child': 'فرزندخوانده',
    'Sworn Brother': 'برادر قسم‌خورده',
    'Sworn Sister': 'خواهر قسم‌خورده',
    'Uncle/Aunt': 'عمو / عمه / دایی / خاله',
    'Nephew/Niece': 'برادرزاده / خواهرزاده',
    Cousin: 'پسرعمو / دخترعمو',
    Rival: 'رقیب',
    'Blood-Feud Enemy': 'دشمن خونی',
  },
};

export const REGION_LABELS: Record<Language, Record<RegionGroup, string>> = {
  en: {
    Norway: 'Norway',
    Denmark: 'Denmark',
    Sweden: 'Sweden',
    'British Isles': 'Britain',
    Ireland: 'Ireland',
    Continent: 'Francia',
    'North Atlantic': 'Iceland & Atlantic',
    Baltic: 'Baltic & Wendland',
    'Kievan Rus & Rivers': 'Kievan Rus & Rivers',
    'Iberia & Al-Andalus': 'Iberia & Al-Andalus',
    Mediterranean: 'Mediterranean',
    'Miklagard & East': 'Miklagard (Byzantium)',
    'Serkland & Caliphate': 'Serkland & Baghdad',
  },
  fa: {
    Norway: 'نروژ',
    Denmark: 'دانمارک',
    Sweden: 'سوئد',
    'British Isles': 'بریتانیا',
    Ireland: 'ایرلند',
    Continent: 'فرانسه و فرانکستان',
    'North Atlantic': 'ایسلند و اقیانوس اطلس',
    Baltic: 'دریای بالتیک و وِندلند',
    'Kievan Rus & Rivers': 'روس کی‌یف و رودخانه‌ها',
    'Iberia & Al-Andalus': 'شبه‌جزیره ایبریا و اندلس',
    Mediterranean: 'دریای مدیترانه و روم',
    'Miklagard & East': 'میکلاگارد (بیزانس)',
    'Serkland & Caliphate': 'سرکلند و خلافت عباسی',
  },
};

export const SETTLEMENT_TYPE_LABELS: Record<Language, Record<string, string>> = {
  en: {
    village: 'Coastal Village',
    town: 'Market Town',
    city: 'Walled Metropolis',
    trading_post: 'Trade Emporium',
    monastery: 'Monastery & Abbey',
    fortress: 'Stronghold Fortress',
    jarldom_seat: 'Seat of the Jarl',
    capital: 'Imperial / Royal Capital',
  },
  fa: {
    village: 'روستای ساحلی',
    town: 'شهرک بازرگانی',
    city: 'کلان‌شهر بارودار',
    trading_post: 'مرکز دادوستد تجاری',
    monastery: 'صومعه و کلیسای زرین',
    fortress: 'دژ و قلعه نظامی',
    jarldom_seat: 'مقر فرمانروایی یارل',
    capital: 'پایتخت شاهی / امپراتوری',
  },
};

export const SETTLEMENT_STATUS_LABELS: Record<Language, Record<string, string>> = {
  en: {
    independent: 'Sovereign',
    tributary: 'Tributary (Danegeld)',
    conquered: 'Norse Conquered',
    rebellious: 'Rebellious Unrest',
  },
  fa: {
    independent: 'مستقل و حاکم',
    tributary: 'باج‌گزار (دانگلد)',
    conquered: 'فتح‌شده توسط وایکینگ‌ها',
    rebellious: 'شورشی و ناآرام',
  },
};

export const CLASS_SHORT_LABELS_I18N: Record<Language, Record<SocialClass, string>> = {
  en: {
    [SocialClass.Thrall]: 'Thrall (Unfree)',
    [SocialClass.Karl]: 'Free Farmer',
    [SocialClass.Bonde]: 'Landowner',
    [SocialClass.HersirKin]: 'Chieftain',
    [SocialClass.JarlKin]: 'Jarl (Noble)',
    [SocialClass.Royal]: 'Royal Blood',
  },
  fa: {
    [SocialClass.Thrall]: 'بنده (اسیر)',
    [SocialClass.Karl]: 'کشاورز آزاد',
    [SocialClass.Bonde]: 'زمین‌دار ثروتمند',
    [SocialClass.HersirKin]: 'فرزند سردار',
    [SocialClass.JarlKin]: 'خاندان یارل',
    [SocialClass.Royal]: 'خون شاهی',
  },
};

export const STAT_LABELS: Record<Language, Record<StatKey, string>> = {
  en: {
    health: 'Health',
    strength: 'Strength',
    cunning: 'Cunning',
    charisma: 'Charisma',
    honor: 'Honor',
    wyrd: 'Fate & Luck (Wyrd)',
    faith: 'Faith',
    happiness: 'Happiness',
  },
  fa: {
    health: 'سلامتی',
    strength: 'قدرت بدنی',
    cunning: 'ذکاوت و تدبیر',
    charisma: 'کاریزما و نفوذ',
    honor: 'شرافت و آبرو',
    wyrd: 'بخت و تقدیر (ویرد)',
    faith: 'ایمان',
    happiness: 'شادی و روحیه',
  },
};

export const SKILL_LABELS: Record<Language, Record<SkillKey, string>> = {
  en: {
    combat: 'Combat',
    seamanship: 'Sailing',
    farming: 'Farming',
    trade: 'Trade',
    diplomacy: 'Diplomacy',
    law: 'Law',
    craft: 'Craft',
    skaldcraft: 'Poetry',
    seidr: 'Mystic Lore',
  },
  fa: {
    combat: 'رزم و شمشیرزنی',
    seamanship: 'دریانوردی',
    farming: 'کشاورزی',
    trade: 'تجارت',
    diplomacy: 'سیاست و مذاکره',
    law: 'قانون‌دانی',
    craft: 'صنعت و کشتی‌سازی',
    skaldcraft: 'شاعری و حماسه',
    seidr: 'جادو و پیشگویی',
  },
};

export const CATEGORY_LABELS: Record<
  Language,
  Record<EventCategory | 'Chronicle' | 'Action' | 'Succession' | 'Word from the Lands', string>
> = {
  en: {
    Childhood: 'Childhood',
    'Coming of Age': 'Coming of Age',
    Family: 'Family & Kin',
    'Farm Life': 'Homestead Life',
    'Blood Feud': 'Blood Feud',
    Feud: 'Blood Feud',
    'Law & the Thing': 'Council of Law (The Thing)',
    'Thing & Law': 'Council of Law (The Thing)',
    Raiding: 'Sea Raid',
    Trade: 'Merchant Trade',
    'Voyage & Sea': 'Open Sea Voyage',
    Religion: 'Gods & Faith',
    'Politics & Kings': 'Halls of Power',
    War: 'Battle',
    'Illness & Death': 'Sickness & Survival',
    'Romance & Marriage': 'Marriage & Hearth',
    Betrayal: 'Treachery',
    'Mystic & Omens': 'Omens & Fate',
    'Historical Set-Piece': 'World History Event',
    Chronicle: 'World Chronicle',
    Action: 'Action',
    Succession: 'Dynasty Succession',
    'Word from the Lands': 'Word from the Lands',
  },
  fa: {
    Childhood: 'دوران کودکی',
    'Coming of Age': 'نوجوانی و بلوغ',
    Family: 'خانواده و تبار',
    'Farm Life': 'زندگی در ملک و مزرعه',
    'Blood Feud': 'کینه و دشمنی خونی',
    Feud: 'کینه و دشمنی خونی',
    'Law & the Thing': 'شورای قانون (ثینگ)',
    'Thing & Law': 'شورای قانون (ثینگ)',
    Raiding: 'غارت دریایی',
    Trade: 'تجارت و بازار',
    'Voyage & Sea': 'سفر در دریاهای شمال',
    Religion: 'آیین و خدایان',
    'Politics & Kings': 'سیاست و شاهان',
    War: 'نبرد و سپرها',
    'Illness & Death': 'بیماری و بقا',
    'Romance & Marriage': 'پیوند و زناشویی',
    Betrayal: 'خیانت در تالار',
    'Mystic & Omens': 'فال و تقدیر',
    'Historical Set-Piece': 'رویداد بزرگ تاریخی',
    Chronicle: 'وقایع‌نامه جهان',
    Action: 'اقدام',
    Succession: 'جانشینی خاندان',
    'Word from the Lands': 'خبر از سرزمین‌ها',
  },
};

export const EPITHET_FA: Record<string, string> = {
  'the One-Eyed': 'تک‌چشم',
  'Sea-Wolf': 'گرگ دریا',
  'the Far-Traveler': 'جهانگرد دریاها',
  'Skald-Tongue': 'سخنور حماسه',
  'the Law-Wise': 'قانون‌دان خردمند',
  'Ring-Giver': 'بخشنده حلقه‌های سیمین',
  Ironside: 'پهلوآهنین',
  'the Boneless': 'بی‌استخوان',
  'Snake-in-the-Eye': 'مار-در-چشم',
  'the Shieldmaiden': 'بانوی سپردار',
  'Kráka, Daughter of Sigurd': 'کراکا، دختر سیگورد اژدهاکش',
  'the White-Shirt': 'پیراهن‌سپید',
  'of the Raven Banner': 'صاحب درفش کلاغ',
  'the Ferocious': 'سهمگین و رویین‌تن',
  'the Proud': 'مغرور',
  'Crow-Nose': 'کلاغ‌منقار',
  'Iron-Brow': 'آهن‌جبین',
  'Skull-Splitter': 'شکافنده خودها',
};

export const APP_TITLE: Record<Language, string> = {
  en: 'Saga of Crowns',
  fa: 'حماسه‌ی تاج‌ها',
};

export const APP_SUBTITLE: Record<Language, string> = {
  en: 'A Saga of Blood, Faith & Power',
  fa: 'حماسه‌ای از خون، ایمان و اقتدار',
};

export const QUICK_GUIDE: Record<
  Language,
  {
    title: string;
    subtitle: string;
    steps: { heading: string; body: string }[];
    glossaryTitle: string;
    terms: { term: string; meaning: string }[];
    closeLabel: string;
  }
> = {
  en: {
    title: 'Saga of Crowns — Guide to Power',
    subtitle: 'Rise from thrall to high king across blood, faith, and strategy (793–1066 AD & beyond).',
    steps: [
      {
        heading: '1. Advance the Chronicle (Next Year)',
        body: 'Progress year by year through historical eras. Face high-stakes dilemmas, royal politics, omens, and seasonal challenges.',
      },
      {
        heading: '2. Rise Through the 8 Ranks of Power',
        body: 'Climb from Thrall / Freeman to Warrior, Huscarl, Captain, Jarl, King, and High King. Each tier unlocks larger warbands, conquest rights, and realm decisions.',
      },
      {
        heading: '3. Conquest, Raids & Realm Governance',
        body: 'Raid wealthy monasteries, besiege fortified cities, and colonize islands. Balance holding unrest with garrisons, Norse settlers, hostages, and religious tolerance.',
      },
      {
        heading: '4. Dark Plots & Multi-Generational Dynasty',
        body: 'Orchestrate assassinations, poison rivals, bribe the Thing assembly, or forge political marriages. When death strikes, continue your bloodline as your chosen heir.',
      },
    ],
    glossaryTitle: 'Key Historical Terms & Systems',
    terms: [
      { term: 'Rise to Power', meaning: '8 distinct ranks from bondservant to King of Kings; cowardice, defeat, or low honor can strip you of rank.' },
      { term: 'Holding Unrest & Rebellions', meaning: 'Heavy tribute and low garrisons stoke rebellion; neglected realms will rise in armed revolt.' },
      { term: 'Tactical Shield Wall', meaning: 'Lead shield walls, boar wedges, berserk charges, and feigned retreats in battle.' },
      { term: 'The Thing', meaning: 'Assembly of free men where laws are declared, feuds settled, and bribes can sway justice.' },
      { term: 'Holmgang & Blood Feuds', meaning: 'Formal duels of honor on a hide; unresolved slights trigger multi-year feuds.' },
      { term: 'Wyrd & Divine Favor', meaning: 'The weave of fate—determines survival in lethal encounters and shields against assassination.' },
    ],
    closeLabel: 'Return to Chronicle',
  },
  fa: {
    title: 'حماسه‌ی تاج‌ها — راهنمای اقتدار',
    subtitle: 'صعود از بندگی تا شاهنشاهی در کشاکش خون، ایمان و سیاست (۷۹۳ تا ۱۰۶۶ میلادی و ادامه آزاد دودمان).',
    steps: [
      {
        heading: '۱. پیشبرد وقایع‌نامه (سال بعد)',
        body: 'سال‌به‌سال در گذر تاریخ گام بردارید. تصمیم‌های سرنوشت‌ساز، نبردهای دریایی، سیاست‌های درباری و فال‌های کهن را تجربه کنید.',
      },
      {
        heading: '۲. نردبان ۸ پله‌ای قدرت و القاب',
        body: 'از بنده و مرد آزاد تا جنگجو، هوکارل، ناخدا، یارل، پادشاه و شاهنشاه صعود کنید. هر رتبه اختیارات، سپاهیان و قلمروهای بزرگ‌تری می‌گشاید.',
      },
      {
        heading: '۳. فتوحات، غارت و مهار شورش‌ها',
        body: 'دیرهای ثروتمند را غارت کنید یا شهرهای مستحکم را به تصرف درآورید. ناآرامی قلمروها را با پادگان‌ها، کوچ‌نشینان نورس، گروگان‌ها و مدارا آرام کنید.',
      },
      {
        heading: '۴. دسیسه‌های درباری و میراث دودمان',
        body: 'رقبا را با زهر و ترور از سر راه بردارید، شوراها را بخرید، یا با ازدواج‌های سیاسی پیمان ببندید. با مرگ شخصیت، بلافاصله در نقش وارث ادامه دهید.',
      },
    ],
    glossaryTitle: 'اصطلاحات و سازوکارهای کلیدی',
    terms: [
      { term: 'نردبان رتبه‌ها', meaning: '۸ رتبه از بندگی تا شاهنشاهی؛ بی‌آبرویی، شکست سخت یا سرکشی می‌تواند رتبه شما را ساقط کند.' },
      { term: 'ناآرامی و شورش قلمرو', meaning: 'خراج سنگین و پادگان ضعیف موجب شورش مسلحانه و از دست رفتن شهرها و استان‌ها می‌شود.' },
      { term: 'تاکتیک‌های نبرد', meaning: 'دیوار سپرها، پوزه گراز، کمین‌گاه، رخنه از جناحین و حمله دیوانه‌وار برسرکرها را فرماندهی کنید.' },
      { term: 'ثینگ (مجلس قانون)', meaning: 'مجمع مردان آزاد برای دادخواهی؛ رشوه‌ها و نفوذ کلام می‌توانند حکم تبعید یا برائت رقم بزنند.' },
      { term: 'هولم‌گانگ و کینه‌های خونی', meaning: 'دوئل رسمی تن‌به‌تن برای اعاده حیثیت؛ توهین‌های بی‌جواب به جنگ خونین میان خاندان‌ها می‌انجامد.' },
      { term: 'ویرد (Wyrd)', meaning: 'بافت بخت و تقدیر کهن؛ شما را از لبه تیغ مرگ و دسیسه‌های ترور نجات می‌دهد.' },
    ],
    closeLabel: 'بازگشت به بازی',
  },
};

export const MAP_FORCES_UI = {
  en: {
    lensLabel: 'Forces',
    lensTooltip: 'Highlight held garrisons and your moored warband & fleet',
    guardsChip: 'Guards',
    shipsChip: 'Ships',
    horsesChip: 'Horses',
    noForcesHere: 'No player forces stationed at this port',
    forcesHereTitle: 'Forces Stationed Here',
    tapToInspectForces: 'Details',
    hideForces: 'Hide',
    groupWarriors: 'Warriors & Garrison',
    groupFleet: 'Moored Fleet',
    groupStables: 'Stable & Armory',
    stationedContextCurrentOwned: 'Your main warband & fleet moored at port + local holding garrison',
    stationedContextCurrentPort: 'Your main expeditionary warband, fleet & mounts moored at this port',
    stationedContextHeldGarrison: 'Local holding shield-garrison (main warband & fleet moored with you at current port)',
    seaFleetTitle: 'Active Sea Expedition',
    seaFleetDestination: 'Course toward',
    seaFleetCrewCap: 'Sealift Capacity',
    seaFleetActiveEffect: 'Fleet Effect',
    legendForcesHeader: 'Military & Naval Glyphs',
    legendGarrison: 'Shield — Stationed Garrison & Warband',
    legendDrakkar: 'Drakkar — Dragon Warship (High Prow)',
    legendSnekkja: 'Snekkja — Swift Patrol Ship (Low Hull)',
    legendKnarr: 'Knarr — Deep-Hulled Ocean Trader',
    legendHorses: 'Stallion — Nordic Warhorses & Pack Mounts',
  },
  fa: {
    lensLabel: 'نیروها',
    lensTooltip: 'نمایش پادگان شهرهای شما و محل استقرار سپاه و ناوگان اصلی',
    guardsChip: 'نگهبانان',
    shipsChip: 'کشتی‌ها',
    horsesChip: 'اسب‌ها',
    noForcesHere: 'هیچ نیرویی از شما در این بندر مستقر نیست',
    forcesHereTitle: 'آرایش نیروهای مستقر در این بندر',
    tapToInspectForces: 'جزئیات نیروها',
    hideForces: 'بستن',
    groupWarriors: 'جنگجویان و پادگان',
    groupFleet: 'ناوگان پهلوگرفته',
    groupStables: 'اصطبل و اسلحه‌خانه',
    stationedContextCurrentOwned: 'سپاه و ناوگان اصلی همراه شما در بندر + پادگان محافظ این شهر',
    stationedContextCurrentPort: 'سپاه، ناوگان و اسب‌های همراه شما که در این بندر لنگر انداخته‌اند',
    stationedContextHeldGarrison: 'پادگان محافظ مستقر در این شهر (سپاه و ناوگان اصلی همراه شما در بندر فعلی است)',
    seaFleetTitle: 'ناوگان در مسیر دریایی',
    seaFleetDestination: 'مقصد دریانوردی',
    seaFleetCrewCap: 'ظرفیت حمل سپاه',
    seaFleetActiveEffect: 'اثر فعال ناوگان',
    legendForcesHeader: 'نمادهای نظامی و ناوگان',
    legendGarrison: 'سپر — پادگان شهر و جنگجویان هیرد',
    legendDrakkar: 'دراکار — ناو جنگی اژدهانشان (دماغه بلند)',
    legendSnekkja: 'اسنکیا — کشتی گشتی تندرو (بدنه باریک)',
    legendKnarr: 'کِنار — کشتی تجاری اقیانوس‌پیما (بدنه پهن)',
    legendHorses: 'تکاور — اسب‌های جنگی و ستورهای کاروانی',
  },
} as const;

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'] as const;

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)] ?? d);
}

/**
 * Formats numbers for the Realm Ledger header and rows:
 * - Abbreviates numbers >= 1,000 (e.g. 26.4k / ۲۶٫۴هزار) unless `showFull` is true.
 * - Uses Persian digits when `lang === 'fa'`.
 */
export function formatLedgerNumber(
  value: number,
  lang: Language,
  showFull = false
): string {
  const safeVal = Math.round(value);
  if (showFull || Math.abs(safeVal) < 1000) {
    const formatted = safeVal.toLocaleString('en-US');
    return lang === 'fa' ? toPersianDigits(formatted.replace(/,/g, '٬')) : formatted;
  }
  const kVal = safeVal / 1000;
  const rounded =
    Math.abs(kVal) >= 10
      ? Math.floor(kVal).toString()
      : kVal.toFixed(1).replace(/\.0$/, '');
  if (lang === 'fa') {
    return `${toPersianDigits(rounded).replace('.', '٫')}هزار`;
  }
  return `${rounded}k`;
}

export const ESTATES_LEDGER_UI = {
  en: {
    statSilver: 'Silver',
    statFarms: 'Farms',
    statShips: 'Ships',
    statWarriors: 'Warriors',
    tapForExact: 'Tap any stat to toggle full exact value',
    viewEstates: 'Estates',
    viewBuild: 'Build',
    viewOpportunities: 'Opportunities',
    sortAttention: 'Needs attention',
    sortFarms: 'Most farms',
    sortGarrison: 'Garrison',
    sortAlpha: 'A–Z',
    searchPlaceholder: 'Search settlement or jarl…',
    noJarlAssigned: 'No Jarl appointed',
    jarlPrefix: 'Jarl',
    farmsShort: 'farms',
    garrisonShort: 'guards',
    statusCalm: 'Calm',
    statusUneasy: 'Uneasy',
    statusCritical: 'Critical',
    needsAttentionBadge: 'Needs attention',
    stripUnrest: 'Local Unrest',
    stripNorsePop: 'Norse Settlers',
    stripFactions: 'Noble Factions',
    hostagesLabel: 'hostages',
    tributeLabel: 'Tribute',
    garrisonStepperTitle: 'Stationed Garrison',
    garrisonStepperSub: 'Transfer warriors between your Hird and this holding (±2)',
    garrisonEmptyReason: 'No guards left to withdraw',
    garrisonNoHirdReason: 'Need 2 warriors in active Hird',
    actionSendSettlers: 'Send settlers',
    actionAppointJarl: 'Appoint Jarl',
    actionTakeHostage: 'Take noble hostage',
    actionBuildHere: 'Build in city',
    chipSilver: 'silver',
    chipGuardsReq: '6+ guards',
    chipStructures: 'structures',
    doneThisSeason: 'Done this season',
    builtPermanent: 'Built',
    jarlAppointedDone: 'Jarl in office',
    needMoreSilver: (missing: number) => `Need ${missing} more silver`,
    needGuardsForHostage: 'Need 6 garrison or 10 Hird warriors',
    needDifferentFaith: 'Requires different religion',
    needShipsAndWarriors: 'Need 1 Longship & 12+ Warriors',
    moreActionsBtn: '⋯ More',
    hideMoreActionsBtn: 'Hide options',
    tributeSectionTitle: 'Annual Tribute Burden',
    toleranceSectionTitle: 'Religious Policy',
    toleranceActive: 'Religious Tolerance (+Stability)',
    toleranceStrict: 'Strict Orthodoxy (+Faith)',
    toggleToleranceBtn: 'Switch Policy',
    reprisalBtn: 'Harsh Crackdown (15+ Hird · -18 Honor)',
    reprisalNeedWarriors: 'Need 15+ warriors in Hird',
    emptyHoldingsTitle: 'No Estates Held Yet',
    emptyHoldingsDesc:
      'You do not own any farmland or cities yet. Open Opportunities to clear your first farm or conquer a coastal stronghold.',
    emptyHoldingsCta: 'View Opportunities',
    buildSelectCityLabel: 'Select estate to construct in:',
    buildQuotaAvailable: '1 structure allowed per year',
    oppCurrentPortHeader: 'Current Port Opportunity',
    oppCrownHeader: 'Ruling Rank & Progression',
    oppGoalHeader: 'Dynasty Saga Goal',
    toastGarrisonAdded: (city: string) => `+2 warriors stationed in ${city}`,
    toastGarrisonRemoved: (city: string) => `2 warriors returned to Hird from ${city}`,
    toastSettlersSent: (city: string) => `Norse settlers dispatched to ${city} (-14% unrest)`,
    toastJarlAppointed: (city: string) => `Loyal Jarl appointed in ${city} (-20% unrest)`,
    toastHostagesTaken: (city: string) => `Noble hostages taken in ${city}`,
    toastTributeChanged: (city: string) => `Tribute burden updated in ${city}`,
    toastToleranceToggled: (city: string) => `Religious policy updated in ${city}`,
    toastBuiltStructure: (bName: string, city: string) => `Constructed ${bName} in ${city}`,
    toastFarmBought: (city: string) => `New farmland cleared in ${city}`,
    modalTabOverview: 'Overview',
    modalTabBuildings: 'Buildings',
    modalPrevCity: 'Previous holding',
    modalNextCity: 'Next holding',
    modalClose: 'Close city details',
    unrestSentenceCalm: 'Calm — Order and peace hold across the settlement.',
    unrestSentenceUneasy: 'Uneasy — Grumbling among the locals; watch the garrison.',
    unrestSentenceCritical: 'Critical — Armed uprising is imminent unless pacified!',
    primaryReinforceGarrison: 'Reinforce garrison (+2 guards)',
    primaryPacifySettlers: 'Pacify city · Send settlers (28 silver)',
    primaryOpenBuildings: 'Construct in this city',
    primaryConstructNext: (bName: string, cost: number) => `Build ${bName} (${cost} silver)`,
    primaryAllBuilt: 'All city structures built',
    emptyBuildingsNote:
      'No structures built here yet. A Boathouse (-50% fleet upkeep) or Market Stall (+annual silver) is a strong first choice.',
    zeroActionsNote:
      'Immediate governance actions are currently unavailable — gather more silver or Hird warriors.',
    cityLostToast: 'That settlement is no longer under your rule.',
  },
  fa: {
    statSilver: 'نقره',
    statFarms: 'مزارع',
    statShips: 'کشتی‌ها',
    statWarriors: 'جنگجویان',
    tapForExact: 'برای مشاهده عدد دقیق روی هر شاخص بزنید',
    viewEstates: 'املاک',
    viewBuild: 'ساخت‌وساز',
    viewOpportunities: 'فرصت‌ها',
    sortAttention: 'نیازمند توجه',
    sortFarms: 'بیشترین مزرعه',
    sortGarrison: 'پادگان',
    sortAlpha: 'الفبا',
    searchPlaceholder: 'جستجوی نام شهر یا یارل…',
    noJarlAssigned: 'بدون یارل منصوب',
    jarlPrefix: 'یارل',
    farmsShort: 'مزرعه',
    garrisonShort: 'نگهبان',
    statusCalm: 'آرام',
    statusUneasy: 'ناآرام',
    statusCritical: 'بحرانی',
    needsAttentionBadge: 'نیازمند توجه',
    stripUnrest: 'ناآرامی محلی',
    stripNorsePop: 'جمعیت نورس',
    stripFactions: 'اشراف و خراج',
    hostagesLabel: 'گروگان',
    tributeLabel: 'خراج',
    garrisonStepperTitle: 'پادگان مستقر در شهر',
    garrisonStepperSub: 'جابه‌جایی جنگجویان میان سپاه همراه و پادگان شهر (۲±)',
    garrisonEmptyReason: 'پادگان شهر خالی است',
    garrisonNoHirdReason: 'نیازمند ۲ جنگجو در سپاه همراه',
    actionSendSettlers: 'ارسال مهاجران',
    actionAppointJarl: 'انتصاب یارل',
    actionTakeHostage: 'گرفتن گروگان اشرافی',
    actionBuildHere: 'ساخت بنا در شهر',
    chipSilver: 'نقره',
    chipGuardsReq: '۶+ نگهبان',
    chipStructures: 'بنا',
    doneThisSeason: 'این فصل انجام شد',
    builtPermanent: 'ساخته شده',
    jarlAppointedDone: 'یارل منصوب شده',
    needMoreSilver: (missing: number) => `نیازمند ${toPersianDigits(missing)} نقره بیشتر`,
    needGuardsForHostage: 'نیازمند ۶ نگهبان یا ۱۰ جنگجو',
    needDifferentFaith: 'نیازمند آیین دیگر',
    needShipsAndWarriors: 'نیازمند ۱ کشتی جنگی و ۱۲+ جنگجو',
    moreActionsBtn: '⋯ بیشتر',
    hideMoreActionsBtn: 'بستن گزینه‌ها',
    tributeSectionTitle: 'میزان خراج سالانه شهر',
    toleranceSectionTitle: 'سیاست مذهبی محلی',
    toleranceActive: 'مدارای مذهبی (+ثبات)',
    toleranceStrict: 'سخت‌گیری مذهبی (+ایمان)',
    toggleToleranceBtn: 'تغییر سیاست',
    reprisalBtn: 'سرکوب قاطع شورش (۱۵+ جنگجو · ۱۸- شرافت)',
    reprisalNeedWarriors: 'نیازمند ۱۵ جنگجو در سپاه همراه',
    emptyHoldingsTitle: 'هنوز ملکی در اختیار ندارید',
    emptyHoldingsDesc:
      'شما هنوز هیچ مزرعه یا شهری در تملک ندارید. از بخش «فرصت‌ها» اولین مزرعه خود را بخرید یا دژی ساحلی را فتح کنید.',
    emptyHoldingsCta: 'مشاهده فرصت‌ها',
    buildSelectCityLabel: 'انتخاب شهر برای احداث بنا:',
    buildQuotaAvailable: 'سهمیه ساخت: ۱ بنا در هر سال',
    oppCurrentPortHeader: 'فرصت پیش‌رو در بندر فعلی',
    oppCrownHeader: 'جایگاه فرمانروایی و ارتقای مقام',
    oppGoalHeader: 'هدف نهایی حماسه دودمان',
    toastGarrisonAdded: (city: string) => `+۲ جنگجو در پادگان ${city} مستقر شد`,
    toastGarrisonRemoved: (city: string) => `۲ جنگجو از پادگان ${city} به سپاه بازگشت`,
    toastSettlersSent: (city: string) => `مهاجران نورس به ${city} اعزام شدند (۱۴٪- ناآرامی)`,
    toastJarlAppointed: (city: string) => `یارل وفادار در ${city} منصوب شد (۲۰٪- ناآرامی)`,
    toastHostagesTaken: (city: string) => `گروگان‌های اشرافی در ${city} گرفته شدند`,
    toastTributeChanged: (city: string) => `میزان خراج ${city} تغییر یافت`,
    toastToleranceToggled: (city: string) => `سیاست مذهبی ${city} به‌روزرسانی شد`,
    toastBuiltStructure: (bName: string, city: string) => `بنای «${bName}» در ${city} ساخته شد`,
    toastFarmBought: (city: string) => `مزرعه جدید در ${city} خریداری شد`,
    modalTabOverview: 'نمای کلی',
    modalTabBuildings: 'ساختمان‌ها',
    modalPrevCity: 'شهر قبلی',
    modalNextCity: 'شهر بعدی',
    modalClose: 'بستن جزئیات شهر',
    unrestSentenceCalm: 'وضعیت آرام — نظم و آرامش در شهر برقرار است.',
    unrestSentenceUneasy: 'وضعیت ناآرام — زمزمه‌های نارضایتی در میان بومیان دیده می‌شود.',
    unrestSentenceCritical: 'وضعیت بحرانی — خطر شورش مسلحانه در شهر بسیار نزدیک است!',
    primaryReinforceGarrison: 'تقویت پادگان (+۲ نگهبان)',
    primaryPacifySettlers: 'آرام‌سازی شهر · ارسال مهاجران (۲۸ نقره)',
    primaryOpenBuildings: 'مشاهده و ساخت بنا در شهر',
    primaryConstructNext: (bName: string, cost: number) =>
      `احداث «${bName}» (${toPersianDigits(cost)} نقره)`,
    primaryAllBuilt: 'تمامی بناهای این شهر ساخته شده‌اند',
    emptyBuildingsNote:
      'هنوز هیچ بنایی در این شهر ساخته نشده است. پیشنهاد می‌شود با «اسکله کشتی‌سازی» (کاهش ۵۰٪ هزینه ناوگان) یا «بازارگاه» (درآمد نقره سالانه) آغاز کنید.',
    zeroActionsNote:
      'در حال حاضر برای اجرای اقدامات حکومتی بیشتر به نقره یا جنگجویان بیشتری در سپاه نیاز دارید.',
    cityLostToast: 'این شهر دیگر در تملک شما نیست.',
  },
} as const;




