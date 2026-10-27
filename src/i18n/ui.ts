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
  Record<EventCategory | 'Chronicle' | 'Action' | 'Succession', string>
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
  },
};

export const EPITHET_FA: Record<string, string> = {
  'the One-Eyed': 'تک‌چشم',
  'Sea-Wolf': 'گرگ دریا',
  'the Far-Traveler': 'جهانگرد دریاها',
  'Skald-Tongue': 'سخنور حماسه',
  'the Law-Wise': 'قانون‌دان خردمند',
  'Ring-Giver': 'بخشنده حلقه‌های سیمین',
  Ironside: 'پهلوان رویین‌تن',
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
    subtitle: 'Rise from thrall to high king across blood, faith, and strategy (793–1066 AD).',
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
    subtitle: 'صعود از بندگی تا شاهنشاهی در کشاکش خون، ایمان و سیاست (۷۹۳ تا ۱۰۶۶ میلادی).',
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


