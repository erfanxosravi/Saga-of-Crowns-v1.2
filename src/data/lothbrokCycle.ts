import { GameEventFa } from '../i18n/eventsFa';
import {
  ContentIntensity,
  GameEvent,
  RagnarBloodlineBranch,
  Religion,
  TitleRank,
} from '../types/game';
import { hashSeedString, SeededRNG } from '../engine/prng';

// ==========================================
// 1. BLOODLINE BRANCHES ("Ragnarsættin — Blood of Ragnar")
// ==========================================

export interface LothbrokBranchDef {
  id: RagnarBloodlineBranch;
  nameEn: string;
  nameFa: string;
  norseTitle: string;
  descEn: string;
  descFa: string;
  perkEn: string;
  perkFa: string;
  startingHeirloomId?: string;
}

export const LOTHBROK_BLOODLINE_BRANCHES: LothbrokBranchDef[] = [
  {
    id: 'ivar',
    nameEn: 'Line of Ivar the Boneless',
    nameFa: 'شاخه ایوار بیاستخوان',
    norseTitle: 'Ívarr hinn Beinlausi · Uí Ímair',
    descEn: 'Carried on a battle-shield; ruthless strategist who founded the Norse kingships of Jórvík and Dyflinn.',
    descFa: 'سردار زیرک و بی‌پروا که بر سپر جنگی حمل می‌شد و پایه‌گذار پادشاهی‌های وایکینگی یورویک و دوبلین گشت.',
    perkEn: '+14 Cunning · +15 Raid Power vs England · Raven Banner Claim',
    perkFa: '+14 ذکاوت · +15 قدرت یورش به انگلستان · وارث پرچم زاغ سیاه',
    startingHeirloomId: 'hrafnsmerki_banner',
  },
  {
    id: 'bjorn',
    nameEn: 'Line of Björn Ironside',
    nameFa: 'شاخه بیورن پهلوآهنین',
    norseTitle: 'Björn Járnsíða · Munsö Line',
    descEn: 'Hardened by Aslaug’s wards; raided the Seine, Iberia, and Luna before ruling Uppsala.',
    descFa: 'رویین‌تن از طلسم‌های اسلاگ؛ فاتح رود سن، اندلس و مدیترانه و نیای پادشاهان سوئد در اوپسالا.',
    perkEn: '+10 Combat · +8 Health · Shield of Ironside Claim',
    perkFa: '+10 رزم · +8 سلامتی · وارث سپر پولادین پهلوآهنین',
    startingHeirloomId: 'shield_of_ironside',
  },
  {
    id: 'halfdan',
    nameEn: 'Line of Halfdan Ragnarsson',
    nameFa: 'شاخه هالفدان پسر راگنار',
    norseTitle: 'Hálfdan Ragnarsson · Plough-King',
    descEn: 'War-leader of the Great Army who measured out Northumbrian ploughland by the sword.',
    descFa: 'فرمانده ارتش بزرگ که دشت‌های نورثامبریا را با طناب و شمشیر میان جنگجویانش تقسیم کرد.',
    perkEn: '+8 Combat · +8 Farming · +15% English Tribute',
    perkFa: '+8 رزم · +8 کشاورزی · +15٪ خراج متصرفات انگلستان',
    startingHeirloomId: 'bragarfull_horn_lejre',
  },
  {
    id: 'ubba',
    nameEn: 'Line of Ubba Ragnarsson',
    nameFa: 'شاخه اوبّا پسر راگنار',
    norseTitle: 'Ubbi · Frisian Wolf-Coat',
    descEn: 'Feared úlfheðinn champion and rune-caster who broke East Anglia’s shield-wall.',
    descFa: 'پهلوان گرگ‌پوش و طلسم‌خوان مخوف که دیوار سپرهای ایست آنگلیا را در هم کوبید.',
    perkEn: '+12 Strength · +10 Seidr · Berserk Terror in Raids',
    perkFa: '+12 قدرت بدنی · +10 آیین سیدر · وحشت برزرکی در یورش‌ها',
    startingHeirloomId: 'serpent_of_the_wash',
  },
  {
    id: 'sigurd',
    nameEn: 'Line of Sigurd Snake-in-the-Eye',
    nameFa: 'شاخه سیگورد مار-در-چشم',
    norseTitle: 'Sigurðr Ormr-í-Auga · Völsung Mark',
    descEn: 'Born with the ouroboros ring around his pupil — heir to Zealand, Scania, and Fafnir’s memory.',
    descFa: 'فرزندی که با حلقه مارِ دم‌به‌دهان در مردمک چشم زاده شد؛ وارث تاج شیلند و خون اژدهاکش ولسونگ.',
    perkEn: '+12 Honor · +10 Wyrd · Fang of Fafnir Claim',
    perkFa: '+12 شرافت · +10 سرنوشت (ویرد) · وارث تیغ نیش فافنیر',
    startingHeirloomId: 'fang_of_fafnir',
  },
  {
    id: 'hvitserk',
    nameEn: 'Line of Hvitserk the White-Shirt',
    nameFa: 'شاخه هویتسرک پیراهن‌سپید',
    norseTitle: 'Hvítserkr · Eastern Flame',
    descEn: 'Reckless vanguard captain who fought from English estuaries to the burning pyres of the East.',
    descFa: 'طلایه‌دار بی‌باک که از رودهای انگلستان تا دشت‌های سوزان شرق هرگز گامی به عقب برنداشت.',
    perkEn: '+10 Combat · +10 Honor · Undying Vanguard Morale',
    perkFa: '+10 رزم · +10 شرافت · روحیه شکست‌ناپذیر در خط مقدم',
    startingHeirloomId: 'bragarfull_horn_lejre',
  },
  {
    id: 'lagertha',
    nameEn: 'Line of Lagertha the Shieldmaiden',
    nameFa: 'شاخه لاگرتا بانوی سپردار',
    norseTitle: 'Hlaðgerðr · Skjaldmær of Gaular',
    descEn: 'Saxo’s legendary shieldmaiden who flew around the enemy rear with flowing hair and iron spear.',
    descFa: 'بانوی سپردار افسانه‌ای در روایت ساکسو گراماتیکوس که با گیسوان افشان جناح دشمن را در هم شکست.',
    perkEn: '+12 Combat · +10 Charisma · Shieldmaiden Wing Bonus',
    perkFa: '+12 رزم · +10 کاریزما · امتیاز جناح بانوان سپردار',
    startingHeirloomId: 'shield_of_ironside',
  },
  {
    id: 'aslaug',
    nameEn: 'Line of Queen Aslaug (Kráka)',
    nameFa: 'شاخه ملکه اسلاگ (کراکا)',
    norseTitle: 'Áslaug Sigurðardóttir · Daughter of Fafnir’s Slayer',
    descEn: 'Daughter of Sigurd and Brynhild; völva-queen whose prophecies and unwoven shirt shaped the saga.',
    descFa: 'دختر سیگورد اژدهاکش و برونهیلد؛ ملکه پیشگو که پیراهن بی‌درز و پیشگویی‌هایش سرنوشت شمال را رقم زد.',
    perkEn: '+16 Seidr · +14 Wyrd · Aslaug’s Unwoven Shirt',
    perkFa: '+16 آیین سیدر · +14 سرنوشت · پیراهن جادویی و بی‌درز اسلاگ',
    startingHeirloomId: 'aslaug_unwoven_shirt',
  },
];

// ==========================================
// 2. NAMED SAGA HEIRLOOMS & SHIPS
// ==========================================

export interface SagaHeirloomDef {
  id: string;
  nameEn: string;
  nameFa: string;
  norseName: string;
  type: 'garment' | 'banner' | 'ship' | 'weapon' | 'horn' | 'shield';
  rune: string;
  loreEn: string;
  loreFa: string;
  effectsLabelEn: string;
  effectsLabelFa: string;
  raidPowerBonus: number;
  englishFameBonus: number;
}

export const SAGA_HEIRLOOMS: SagaHeirloomDef[] = [
  {
    id: 'aslaug_unwoven_shirt',
    nameEn: "Aslaug's Unwoven Shirt",
    nameFa: 'پیراهن بی‌درز اسلاگ',
    norseName: 'Skyrta Áslaugar',
    type: 'garment',
    rune: 'ᛉ',
    loreEn:
      'Knitted of grey hair-silk neither spun nor woven by Queen Aslaug. No iron blade can bite through its threads so long as the wearer keeps their oath — until King Ælla stripped it off Ragnar at the snake-pit.',
    loreFa:
      'جامه‌ای خاکستری از ابریشم گره‌خورده که بدون دوخت و تاروپود به دست ملکه اسلاگ بافته شد. هیچ تیغ پولادینی بر دارنده آن کارگر نیست؛ مگر آن‌که چون راگنار در چاه مارهای شاه ائلا از تنش بیرون کشیده شود.',
    effectsLabelEn: '+8 Wyrd · +6 Health · -25% Battle Injury Risk · +6 Raid Power',
    effectsLabelFa: '+8 سرنوشت · +6 سلامتی · ۲۵٪ کاهش خطر جراحت · +6 قدرت یورش',
    raidPowerBonus: 6,
    englishFameBonus: 6,
  },
  {
    id: 'hrafnsmerki_banner',
    nameEn: 'Hrafnsmerki (The Raven Banner)',
    nameFa: 'پرچم زاغ سیاه (هرافنزمِرکی)',
    norseName: 'Hrafnsmerki Ragnarsdóttur',
    type: 'banner',
    rune: 'ᚺ',
    loreEn:
      'Woven in a single noon by Ragnar’s daughters. When the wind fills the linen before victory, the black raven spreads its wings as if alive; when wyrd turns dark, its feathers droop.',
    loreFa:
      'پرچمی که دختران راگنار لُدبروک در یک نیمروز بافتند. هنگامی که بخت پیروزی یار سپاه باشد، زاغ سیاه بر پارچه بال می‌گشاید و چون سرنوشت تیره گردد، بال‌هایش فرو می‌افتد.',
    effectsLabelEn: '+15 Raid Power vs England · +12 Fame on Raids · +8 Morale',
    effectsLabelFa: '+15 قدرت یورش به انگلستان · +12 شهرت در هر غارت · +8 روحیه سپاه',
    raidPowerBonus: 15,
    englishFameBonus: 12,
  },
  {
    id: 'serpent_of_the_wash',
    nameEn: 'Ormrinn (Serpent of the Wash Longship)',
    nameFa: 'کشتی «مار دریای شمال» (اورمرین)',
    norseName: 'Ormrinn · Dreki',
    type: 'ship',
    rune: 'ᚱ',
    loreEn:
      'A sleek thirty-bench oak dragon-ship with a gilded viper figurehead, built to thread shallow English fenland estuaries and strike before the fyrd can muster.',
    loreFa:
      'کشتی اژدهاپیکر سی‌پارویی از چوب بلوط با سردیس افعی زرکوب که برای شکافتن خورهای کم‌عمق انگلستان و شبیخون پیش از گردآمدن سپاه ساکسون ساخته شده است.',
    effectsLabelEn: '+10 Seamanship · +10 Raid Power · Faster English Landfalls',
    effectsLabelFa: '+10 دریانوردی · +10 قدرت یورش · برتری در سواحل انگلستان',
    raidPowerBonus: 10,
    englishFameBonus: 8,
  },
  {
    id: 'fang_of_fafnir',
    nameEn: 'Fáfnisbani Shard (Völsung Blade)',
    nameFa: 'تیغ «نیش فافنیر» (یادگار ولسونگ)',
    norseName: 'rein-egg Gramr',
    type: 'weapon',
    rune: 'ᛏ',
    loreEn:
      'A pattern-welded sword forged with a dark core of dragon-slayer steel passed through Aslaug from her father Sigurd Fafnir’s-Bane. Its fuller hums like a wound-bee when drawn.',
    loreFa:
      'شمشیری موج‌دار از پولاد کهن که از طریق ملکه اسلاگ از پدرش سیگوردِ اژدهاکش به ارث رسیده است؛ به وقت کشیده‌شدن از نیام، چون زنبور زخم زوزه می‌کشد.',
    effectsLabelEn: '+10 Combat · +6 Strength · +12 Raid Power',
    effectsLabelFa: '+10 مهارت رزم · +6 قدرت بدنی · +12 قدرت یورش',
    raidPowerBonus: 12,
    englishFameBonus: 10,
  },
  {
    id: 'bragarfull_horn_lejre',
    nameEn: 'Bragarfull Oath-Horn of Lejre',
    nameFa: 'شاخ سوگند لیره (جام براگارفول)',
    norseName: 'Bragarfull Hleiðrar',
    type: 'horn',
    rune: 'ᚷ',
    loreEn:
      'An aurochs drinking-horn rimmed in nielloed silver over which the sons of Ragnar swore blood-vengeance (Hefnd) upon King Ælla of Northumbria.',
    loreFa:
      'شاخ نوشیدنی گاو وحشی با لبه نقره‌کوب که پسران راگنار لُدبروک بر فراز آن سوگند انتقام خونین (هفند) از شاه ائلا و پادشاهی نورثامبریا یاد کردند.',
    effectsLabelEn: '+10 Honor · +8 Charisma · +25% Hefnd Vengeance Satisfaction',
    effectsLabelFa: '+10 شرافت · +8 کاریزما · ۲۵٪ پاداش بیشتر از ادای انتقام (هفند)',
    raidPowerBonus: 8,
    englishFameBonus: 10,
  },
  {
    id: 'shield_of_ironside',
    nameEn: 'Bossed Shield of Ironside',
    nameFa: 'سپر پولادین بیورن پهلوآهنین',
    norseName: 'Skjöldr Járnsíðu',
    type: 'shield',
    rune: 'Algiz',
    loreEn:
      'Linden-wood bound in thrice-quenched iron rims and incised with the helm of awe (Ægishjálmr), borne at the Seine and the walls of York.',
    loreFa:
      'سپری از چوب نمدار با کفه و لبه‌های سه‌بار آب‌دیده‌شده و نقش طلسم وحشت (اگیشهیالمر) که در محاصره پاریس و فتح یورک در خط مقدم درخشید.',
    effectsLabelEn: '+8 Combat · +8 Health · +10 Shield-Wall Defense',
    effectsLabelFa: '+8 رزم · +8 سلامتی · +10 استحکام دیوار سپرها',
    raidPowerBonus: 9,
    englishFameBonus: 8,
  },
  {
    id: 'ragnar_serpent_armring',
    nameEn: "Ragnar's Ouroboros Arm-Ring",
    nameFa: 'بازوبند زرین مارپیچ راگنار',
    norseName: 'Ormbaugr Ragnars',
    type: 'garment',
    rune: 'ᛟ',
    loreEn:
      'A heavy twisted arm-ring of Frankish tribute gold, stamped with the tail-biting Lindworm. Drawn by Ragnar Lothbrok from his own forearm on the Seine to bind an oath-companion to his bench.',
    loreFa:
      'بازوبندی سنگین از طلای باجِ فرانکستان با نقش اژدهای دم‌به‌دهان (لیندورم). راگنار لُدبروک در سواحل رود سن آن را از ساعد خود بیرون کشید تا هم‌قسمِ نیمکت خود را جاودانه سازد.',
    effectsLabelEn: '+10 Charisma · +8 Honor · +10 Raid Power',
    effectsLabelFa: '+10 کاریزما · +8 شرافت · +10 قدرت یورش',
    raidPowerBonus: 10,
    englishFameBonus: 9,
  },
  {
    id: 'lagertha_hlathgerd_spear',
    nameEn: 'Wing-Spear of Gaular (Geirr Hlaðgerðar)',
    nameFa: 'نیزه بال‌دار گولار (یادگار لاگرتا)',
    norseName: 'Geirr Hlaðgerðar',
    type: 'weapon',
    rune: 'ᛏ',
    loreEn:
      'An ash-shafted lugged war-spear inlaid with silver knotwork, borne by Hlaðgerðr (Lagertha) when she wheeled around the Swedish flank and later defended the freedom of her Norwegian hall.',
    loreFa:
      'نیزه‌ای جنگی از چوب زبان‌گنجشک با گره‌نگارهای نقره‌کوب که لاگرتا (هلادگرد) در نبرد علیه سوئدی‌ها و دفاع از استقلال تالار خود در نروژ در دست داشت.',
    effectsLabelEn: '+12 Combat · +6 Cunning · +9 Raid Power',
    effectsLabelFa: '+12 مهارت رزم · +6 ذکاوت · +9 قدرت یورش',
    raidPowerBonus: 9,
    englishFameBonus: 6,
  },
  {
    id: 'floki_raven_lodestone',
    nameEn: "Hrafna-Flóki's Sunstone & Raven-Compass",
    nameFa: 'سنگ خورشید و قطب‌نمای زاغ فلوکی',
    norseName: 'Sólarsteinn Hrafna-Flóka',
    type: 'ship',
    rune: 'ᚲ',
    loreEn:
      'A cleaved Icelandic spar crystal set in whalebone beside an oak talisman carved with the three ravens of Smjörsund. Reveals the sun’s hidden bearing through the thickest North Atlantic fog.',
    loreFa:
      'بلور شفافی از کلسیت ایسلندی در قاب استخوان نهنگ به همراه نشان بلوطی سه زاغِ اسمیورسوند؛ حتی در غلیظ‌ترین مه اقیانوس اطلس شمالی جایگاه خورشید را آشکار می‌سازد.',
    effectsLabelEn: '+14 Seamanship · +8 Craft · Safer Atlantic Voyages',
    effectsLabelFa: '+14 دریانوردی · +8 صنعتگری · ایمنی سفرهای اقیانوس اطلس',
    raidPowerBonus: 7,
    englishFameBonus: 5,
  },
  {
    id: 'rollo_rouen_armring',
    nameEn: "Rollo's Seine-Warden Torque",
    nameFa: 'طوق نقره و طلای رولو (نگهبان رود سن)',
    norseName: 'Hringr Göngu-Hrólfs',
    type: 'garment',
    rune: 'ᚱ',
    loreEn:
      'A heavy braided neck-torque of Frankish silver and Norse gold forged at Rouen when Göngu-Hrólfr bound his river-captains to guard the Seine estuary.',
    loreFa:
      'طوقی سنگین و بافته‌شده از نقره فرانکی و طلای نورس که گونگو-هرولف (رولو) در روآن برای هم‌پیمانان خود در نگهبانی از دهانه رود سن ضرب کرد.',
    effectsLabelEn: '+10 Diplomacy · +8 Combat · +10 Raid Power',
    effectsLabelFa: '+10 دیپلماسی · +8 مهارت رزم · +10 قدرت یورش',
    raidPowerBonus: 10,
    englishFameBonus: 7,
  },
  {
    id: 'hvitserk_eastern_blade',
    nameEn: "Hvitserk's Eastern River-Sabre",
    nameFa: 'شمشیر خاوری هویتسرک پیراهن‌سپید',
    norseName: 'Austr-Sax Hvítserks',
    type: 'weapon',
    rune: 'ᛋ',
    loreEn:
      'A slightly curved crucible-steel blade with a silver-wired grip won on the portages of Garðaríki and borne by Hvitserk in the vanguard of every river storming.',
    loreFa:
      'شمشیری از پولاد جوهرنمود با قبضه نقره‌پیچ که هویتسرک پیراهن‌سپید در گذرگاه‌های رودهای شرق به دست آورد و در خط مقدم نبردها می‌افراشت.',
    effectsLabelEn: '+12 Combat · +8 Honor · +11 Raid Power',
    effectsLabelFa: '+12 مهارت رزم · +8 شرافت · +11 قدرت یورش',
    raidPowerBonus: 11,
    englishFameBonus: 7,
  },
  {
    id: 'ecbert_bretwalda_signet',
    nameEn: "King Ecgberht's Bretwalda Ring",
    nameFa: 'انگشتری و نشان برتوالدای شاه اکبرت',
    norseName: 'Konungshringr Egberhts',
    type: 'garment',
    rune: 'ᛟ',
    loreEn:
      'A Carolingian-style gold signet ring inlaid with nielloed West Saxon wyverns, worn by King Ecgberht after breaking Mercian dominance at Ellandun.',
    loreFa:
      'انگشتری زرین به سبک کارولنژی با سیاه‌قلمِ اژدهای وسکس که شاه اکبرت پس از پیروزی در الاندون و کسب عنوان برتوالدا بر دست داشت.',
    effectsLabelEn: '+10 Law · +8 Diplomacy · +6 Raid Power',
    effectsLabelFa: '+10 قانون‌دانی · +8 دیپلماسی · +6 قدرت یورش',
    raidPowerBonus: 6,
    englishFameBonus: 9,
  },
  {
    id: 'aella_york_crown_brooch',
    nameEn: 'Northumbrian Boar-Clasp of Eoforwic',
    nameFa: 'سنجاق سلطنتی گراز یورک (غنیمت شاه ائلا)',
    norseName: 'Jórvíkur-Sylgja Ellu',
    type: 'garment',
    rune: 'ᛇ',
    loreEn:
      'A heavy gilded shoulder-clasp embossed with the boar of Eoforwic, taken from King Ælla’s royal treasury inside the Roman walls of York.',
    loreFa:
      'سنجاق شنل زرکوب با نقش گراز باستانی شهر یورک که از خزانه شاه ائلا در درون دیوارهای رومی یورویک به غنیمت گرفته شد.',
    effectsLabelEn: '+8 Cunning · +8 Raid Power · +10 English Renown',
    effectsLabelFa: '+8 ذکاوت · +8 قدرت یورش · +10 شهرت در انگلستان',
    raidPowerBonus: 8,
    englishFameBonus: 10,
  },
  {
    id: 'alfred_gold_aestel',
    nameEn: "King Alfred's Gold Jewel-Pointer (Æstel)",
    nameFa: 'نشانگر زرین و میناکاری‌شده شاه آلفرد کبیر (اَستل)',
    norseName: 'Gull-Æstel Álfráðs',
    type: 'horn',
    rune: 'ᛗ',
    loreEn:
      'A filigree gold and rock-crystal manuscript pointer inscribed “AELFRED MEC HEHT GEWYRCAN” (Alfred ordered me made), gifted in solemn truce by the scholar-king of Wessex.',
    loreFa:
      'نشانگر کتاب از طلای ملیله‌کاری و بلور کوهی با کتیبه «آلفرد فرمان ساخت مرا داد» که پادشاه دانش‌پرور وسکس در پیمان صلح اهدا کرد.',
    effectsLabelEn: '+12 Diplomacy · +10 Law · +8 English Renown',
    effectsLabelFa: '+12 دیپلماسی · +10 قانون‌دانی · +8 آوازه در انگلستان',
    raidPowerBonus: 6,
    englishFameBonus: 8,
  },
  {
    id: 'guthrum_wedmore_cross_torque',
    nameEn: "Guthrum-Æthelstan's Wedmore Peace-Torque",
    nameFa: 'طوق دوگانه گوتورم-اتلستن (یادگار پیمان ودمور)',
    norseName: 'Friðbaugr Gorms Enska',
    type: 'garment',
    rune: 'ᚷ',
    loreEn:
      'A hacked silver Viking arm-ring fused with a Saxon baptismal cross, struck by King Guthrum after taking the name Æthelstan to seal the Danelaw frontier.',
    loreFa:
      'بازوبند نقره وایکینگی پیوندخورده با صلیب تعمیدی ساکسون که شاه گوتورم پس از پذیرش نام «اتلستن» و تثبیت مرز دانلا به یادگار ساخت.',
    effectsLabelEn: '+10 Trade · +8 Diplomacy · +8 Raid Power',
    effectsLabelFa: '+10 تجارت · +8 دیپلماسی · +8 قدرت یورش',
    raidPowerBonus: 8,
    englishFameBonus: 9,
  },
];

export const SAGA_HEIRLOOMS_MAP: Record<string, SagaHeirloomDef> = SAGA_HEIRLOOMS.reduce<
  Record<string, SagaHeirloomDef>
>((acc, h) => {
  acc[h.id] = h;
  return acc;
}, {});

// ==========================================
// 3. CHAPTER METADATA FOR SAGA TAB UI
// ==========================================

export interface LothbrokChapterMeta {
  id: string;
  eventId: string;
  roman: string;
  yearHint: string;
  titleEn: string;
  titleFa: string;
  summaryEn: string;
  summaryFa: string;
  sagaVsChronicleEn: string;
  sagaVsChronicleFa: string;
}

export const LOTHBROK_CHAPTER_METADATA: LothbrokChapterMeta[] = [
  {
    id: 'ch1_shirt_serpent',
    eventId: 'lothbrok_ch1_shirt_serpent',
    roman: 'I',
    yearHint: 'c. 795–835 AD',
    titleEn: 'The Shirt and the Serpent',
    titleFa: 'پیراهن بی‌درز و اژدهای گوتلند',
    summaryEn:
      'Ragnar wins Thora by slaying the heath-serpent in boiled-pitch breeches, then weds Kráka (Aslaug), daughter of Sigurd Fafnir-slayer, receiving her enchanted unwoven shirt.',
    summaryFa:
      'راگنار لُدبروک با شلوار پشمی قیراندود مار عظیم گوتلند را می‌کشد و سپس با اسلاگ (کراکا)، دختر سیگورد اژدهاکش پیوند می‌بندد و پیراهن بی‌درز او را می‌گیرد.',
    sagaVsChronicleEn:
      'SAGA SAYS: One hero wore pitch-breeches against a lindworm and wed Sigurd’s daughter. CHRONICLE SAYS: "Ragnar" synthesizes several 9th-century Danish sea-kings and the historical warlord Reginherus.',
    sagaVsChronicleFa:
      'روایت حماسه: راگنار با شلوار قیراندود اژدها را کشت و با دختر سیگورد ازدواج کرد. روایت تاریخ: شخصیت راگنار ترکیبی از چند شاه دریایی قرن نهم و سردار تاریخی «رگینهر» است.',
  },
  {
    id: 'ch2_seine_silver',
    eventId: 'lothbrok_ch2_seine_silver',
    roman: 'II',
    yearHint: '845 AD',
    titleEn: 'Seine in Silver',
    titleFa: 'رود سِن غرق در نقره (محاصره پاریس)',
    summaryEn:
      '120 dragon-ships row up the Seine to Paris; King Charles the Bald weighs out 7,000 pounds of silver and gold to buy departure.',
    summaryFa:
      '۱۲۰ اژدهاکشتی از رود سن بالا می‌روند و پاریس را به زانو درمی‌آورند؛ شارل تاس ۷٬۰۰۰ پوند نقره و طلا خراج می‌دهد.',
    sagaVsChronicleEn:
      'SAGA SAYS: Ragnar boasted in his hall that Paris trembled before his spear. CHRONICLE SAYS: The Annals of St-Bertin record Reginherus taking 7,000 lb of Danegeld in 845 before dying of plague on his return.',
    sagaVsChronicleFa:
      'روایت حماسه: راگنار با افتخار از فتح پاریس در تالار خود یاد کرد. روایت تاریخ: سالنامه‌های فرانک ثبت کرده‌اند که «رگینهر» در سال ۸۴۵ میلادی ۷٬۰۰۰ پوند نقره گرفت.',
  },
  {
    id: 'ch3_last_voyage',
    eventId: 'lothbrok_ch3_last_voyage',
    roman: 'III',
    yearHint: 'c. 860–864 AD',
    titleEn: 'The Last Voyage',
    titleFa: 'آخرین سفر دریایی راگنار لُدبروک',
    summaryEn:
      'Jealous of his sons’ growing fame, Ragnar builds two oversized knarrs against Aslaug’s warning and wrecks upon the jagged shoals of Northumbria.',
    summaryFa:
      'راگنار لُدبروک در رقابت با آوازه پسرانش، برخلاف هشدار اسلاگ با دو کشتی عظیم به انگلستان می‌رود و در صخره‌های نورثامبریا درهم می‌شکند.',
    sagaVsChronicleEn:
      'SAGA SAYS: Ragnar sailed with only two great knarrs out of pride to outshine his sons. CHRONICLE SAYS: Anglo-Saxon sources record no single shipwreck of Ragnar, only escalating Danish winterings.',
    sagaVsChronicleFa:
      'روایت حماسه: راگنار از سر غرور با دو کشتی بزرگ به دریا زد تا از پسرانش پیشی بگیرد. روایت تاریخ: منابع آنگلوساکسون از غرق شدن کشتی راگنار یاد نکرده‌اند بلکه از اردوگاه‌های زمستانی دانمارکی‌ها می‌گویند.',
  },
  {
    id: 'ch4_the_pit',
    eventId: 'lothbrok_ch4_the_pit',
    roman: 'IV',
    yearHint: 'c. 864–865 AD',
    titleEn: 'The Pit of Vipers',
    titleFa: 'چاه مارهای شاه ائلا و سرود گراز پیر',
    summaryEn:
      'Stripped of Aslaug’s shirt and cast into King Ælla’s snake-pit, Ragnar chants his death-song: "How the young pigs would grunt if they knew how the old boar suffers!"',
    summaryFa:
      'شاه ائلا پیراهن اسلاگ را از تن راگنار بیرون می‌کشد و او را به چاه افعی‌ها می‌اندازد؛ راگنار با خنده سرود مرگ می‌خواند: «بچه‌گرازها چه غرشی می‌کردند اگر می‌دانستند گراز پیر چه می‌کشد!»',
    sagaVsChronicleEn:
      'SAGA SAYS: Ælla threw Ragnar into a pit of adders, sparking the greatest blood-feud of the North. CHRONICLE SAYS: Ælla was a usurper king of Northumbria slain at York in 867; the snake-pit belongs to skaldic poem Krákumál.',
    sagaVsChronicleFa:
      'روایت حماسه: شاه ائلا راگنار را در چاه مارها افکند و بزرگ‌ترین انتقام خونی شمال را رقم زد. روایت تاریخ: ائلا غاصب تخت نورثامبریا بود که در ۸۶۷ در یورک کشته شد و داستان چاه مار از منظومه «کراکومال» است.',
  },
  {
    id: 'ch5_the_oath',
    eventId: 'lothbrok_ch5_the_oath',
    roman: 'V',
    yearHint: '865 AD',
    titleEn: 'The Oath Over the Bragarfull',
    titleFa: 'سوگند خونین بر جام براگارفول',
    summaryEn:
      'Envoys recount the old boar’s last words: Ivar grips his yew-bow till it bends, Björn snaps his spear-shaft in two, Sigurd pares his nail to the bone, and Hvitserk crushes a gaming-piece.',
    summaryFa:
      'فرستادگان پیام مرگ راگنار را می‌آورند: ایوار کمانش را تا مرز شکستن می‌فشارد، بیورن دسته نیزه‌اش را دو نیم می‌کند، سیگورد کارد را تا استخوان انگشتش فرو می‌برد و هویتسرک مهره شطرنج را خرد می‌کند.',
    sagaVsChronicleEn:
      'SAGA SAYS: Each brother’s silent physical reaction revealed the cold fury of their Hefnd oath. CHRONICLE SAYS: In 865 a coalition "Great Heathen Army" (micel hæþen here) assembled under Ivar, Halfdan, and Ubba.',
    sagaVsChronicleFa:
      'روایت حماسه: واکنش خاموش و هراس‌انگیز هر برادر عمق خشم و سوگند انتقام (هفند) را نشان داد. روایت تاریخ: در سال ۸۶۵ میلادی ائتلاف «ارتش بزرگ بت‌پرستان» به رهبری ایوار، هالفدان و اوبّا شکل گرفت.',
  },
  {
    id: 'ch6_landfall_865',
    eventId: 'lothbrok_ch6_landfall_865',
    roman: 'VI',
    yearHint: '865–866 AD',
    titleEn: 'Landfall in East Anglia',
    titleFa: 'فرود در ایست آنگلیا و اسبان انتقام',
    summaryEn:
      'Under the Raven Banner, the Great Heathen Army beaches in East Anglia, takes horses from King Edmund, and rides north toward the Humber.',
    summaryFa:
      'زیر سایه پرچم زاغ سیاه، ارتش بزرگ در ایست آنگلیا پیاده می‌شود، از شاه ادموند اسب می‌گیرد و چهارنعل به سوی شمال و رود هامبر می‌تازد.',
    sagaVsChronicleEn:
      'SAGA SAYS: Ivar asked only for "as much land as an ox-hide covers," then cut the hide into a thread to encircle a citadel. CHRONICLE SAYS: The Anglo-Saxon Chronicle states the army wintered in East Anglia in 865 and was "horsed" there.',
    sagaVsChronicleFa:
      'روایت حماسه: ایوار با نیرنگ پوست گاو زمین دژ را گرفت. روایت تاریخ: سالنامه آنگلوساکسون ثبت کرده که ارتش در ۸۶۵ در ایست آنگلیا زمستان‌گذرانی کرد و اسب‌های جنگی گرفت.',
  },
  {
    id: 'ch7_eoforwic_burns',
    eventId: 'lothbrok_ch7_eoforwic_burns',
    roman: 'VII',
    yearHint: '866 AD',
    titleEn: 'Eoforwic Burns — Rise of Jórvík',
    titleFa: 'سقوط ایوفورویک و طلوع یورویک وایکینگی',
    summaryEn:
      'On All Saints’ Day (1 November 866), the sons of Ragnar storm Roman-walled York while rival kings Osberht and Ælla quarrel.',
    summaryFa:
      'در روز اول نوامبر ۸۶۶، پسران راگنار از شکاف دیوارهای رومی یورک هجوم می‌برند و شهر را به پایتخت وایکینگی «یورویک» بدل می‌سازند.',
    sagaVsChronicleEn:
      'SAGA SAYS: The brothers lured the Northumbrians inside the breached walls to spring a trap of iron. CHRONICLE SAYS: Both saga and chronicle agree — on 1 Nov 866 York fell, and in March 867 Osberht and Ælla died trying to retake it.',
    sagaVsChronicleFa:
      'روایت حماسه و تاریخ هر دو گواهی می‌دهند: در اول نوامبر ۸۶۶ یورک سقوط کرد و در مارس ۸۶۷ شاه اسبرت و شاه ائلا در تلاش برای بازپس‌گیری شهر در تله افتادند.',
  },
  {
    id: 'ch8_the_eagle',
    eventId: 'lothbrok_ch8_the_eagle',
    roman: 'VIII',
    yearHint: '867 AD',
    titleEn: 'The Eagle of Reckoning',
    titleFa: 'عقاب خونین و فرجام شاه ائلا',
    summaryEn:
      'King Ælla of Northumbria is taken alive outside York’s shattered gate; the debt of the snake-pit is paid in full under Odin’s ravens.',
    summaryFa:
      'شاه ائلا در بیرون دروازه‌های شکسته یورک زنده به چنگ پسران راگنار می‌افتد؛ خون‌بهای چاه مارها زیر نگاه کلاغ‌های اودین ستانده می‌شود.',
    sagaVsChronicleEn:
      'SAGA SAYS: Ivar had the "blood-eagle" (blóðörn) carved upon Ælla’s back. CHRONICLE SAYS: The Anglo-Saxon Chronicle says both kings were slain on the spot inside the walls; modern historians debate whether the blood-eagle was ritual or skaldic misunderstanding.',
    sagaVsChronicleFa:
      'روایت حماسه: ایوار فرمان داد نقش «عقاب خونین» بر پشت شاه ائلا بتراشند. روایت تاریخ: سالنامه آنگلوساکسون می‌گوید هر دو شاه در میدان نبرد کشته شدند و مورخان درباره واقعی یا شعری بودن عقاب خونین بحث دارند.',
  },
  {
    id: 'ch9_edmund_alfred_cost',
    eventId: 'lothbrok_ch9_edmund_alfred_cost',
    roman: 'IX',
    yearHint: '869–878 AD',
    titleEn: 'Edmund, Alfred, and the Ledger of Vengeance',
    titleFa: 'تیرهای شاه ادموند، آلفرد و کارنامه انتقام',
    summaryEn:
      'King Edmund falls to Viking arrows at Hoxne (869), Repton becomes the winter hall, and Alfred rallies Wessex — leaving the Danelaw as the bitter, enduring monument of Hefnd.',
    summaryFa:
      'شاه ادموند در سال ۸۶۹ زیر باران تیر کشته می‌شود، رپتون اردوگاه زمستانی می‌گردد و آلفرد در وسکس می‌ایستد تا قلمرو «دانلو» یادگار ماندگار این انتقام شود.',
    sagaVsChronicleEn:
      'SAGA SAYS: Once Ragnar was avenged, the brothers scattered to rule Dublin, Sweden, Denmark, and Northumbria. CHRONICLE SAYS: Between 869 and 878 the Great Army toppled three kingdoms before dividing the Danelaw.',
    sagaVsChronicleFa:
      'روایت حماسه: پس از انتقام راگنار، برادران هر یک پادشاه سرزمینی شدند. روایت تاریخ: میان سال‌های ۸۶۹ تا ۸۷۸ سه پادشاهی ساکسون سقوط کرد و مرزهای دانلو شکل گرفت.',
  },
];

// ==========================================
// 4. THE 9 LOTHBROK CYCLE EVENTS
// ==========================================

export const LOTHBROK_CYCLE_EVENTS: GameEvent[] = [
  {
    id: 'lothbrok_ch1_shirt_serpent',
    title: 'The Lothbrok Cycle I · The Shirt and the Serpent',
    category: 'Historical Set-Piece',
    iconType: 'dragon',
    provenance: 'Semi-Legendary Saga Tradition',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'SAGA SAYS: Ragnar slew a great heath-serpent in boiled-pitch breeches ("Loðbrók") and later wed Aslaug (Kráka), daughter of Sigurd Fafnir-slayer. CHRONICLE SAYS: "Ragnar" blends 9th-century Danish royalty with the Frankish raider Reginherus.',
    conditions: {
      yearRange: [793, 864],
      ageMin: 15,
      uniqueOncePerCampaign: true,
    },
    weight: 96,
    text: 'At Spangereid in southern Norway, a peasant girl called Kráka steps onto the dragon-ship — neither clothed nor unclothed in a fishing-net, neither fasting nor full after biting an onion, neither alone nor attended save by a hound. When she reveals the golden Völsung ring of her father Sigurd Fafnir’s-Bane, she offers a grey hair-silk shirt neither spun nor woven, warning that while the oath holds, no iron shall bite through it.',
    choices: [
      {
        id: 'claim_aslaug_shirt_oath',
        label: 'Accept Aslaug’s unwoven shirt and bind your house to the wolf-blood of Ragnarsættin',
        outcomeText:
          'You draw the seamless grey tunic over your mail. Skalds hail the union of dragon-slayer blood and sea-king steel — yet the Norns whisper that a heavy blood-debt (Hefnd) awaits your line across the western sea.',
        effects: {
          fame: 40,
          hefndDelta: 20,
          addHeirloomIds: ['aslaug_unwoven_shirt'],
          completeLothbrokChapterId: 'ch1_shirt_serpent',
          addFlags: ['lothbrok_ch1_done', 'ragnar_blood_active'],
          addTraits: ['wolf_blood'],
          stats: { wyrd: 10, honor: 10, health: 6 },
          skills: { combat: 5, seidr: 4 },
        },
        chain: { eventId: 'lothbrok_ch2_seine_silver', delayYears: 3 },
      },
      {
        id: 'forge_fafnir_shard_instead',
        label: 'Honor her Völsung lineage by reforging a shard of Fafnir-slayer steel into your war-blade',
        outcomeText:
          'Charcoal roars white-hot as the ancient pattern-welded core is beaten into your blade. When swung, the edge hums like a wound-bee hungry for English shields.',
        effects: {
          fame: 35,
          hefndDelta: 15,
          addHeirloomIds: ['fang_of_fafnir'],
          completeLothbrokChapterId: 'ch1_shirt_serpent',
          addFlags: ['lothbrok_ch1_done', 'ragnar_blood_active'],
          stats: { strength: 8, honor: 8 },
          skills: { combat: 8, craft: 5 },
        },
        chain: { eventId: 'lothbrok_ch2_seine_silver', delayYears: 3 },
      },
      {
        id: 'doubt_kraka_legend',
        label: 'Scoff at Völsung riddles as hearth-tales and demand plain silver tribute instead',
        outcomeText:
          'Aslaug’s eyes flash cold as winter fjord-ice. You pocket twenty ounces of silver, though old seamen mutter that you spurned the hamingja of the Völsungs.',
        effects: {
          silver: 38,
          completeLothbrokChapterId: 'ch1_shirt_serpent',
          addFlags: ['lothbrok_ch1_done'],
          stats: { cunning: 6, wyrd: -6, honor: -4 },
          divergenceNote: 'Spurned Queen Aslaug’s Völsung prophecy and unwoven shirt at Spangereid.',
        },
      },
    ],
  },
  {
    id: 'lothbrok_ch2_seine_silver',
    title: 'The Lothbrok Cycle II · 845 AD: Seine in Silver',
    category: 'Historical Set-Piece',
    iconType: 'ship',
    provenance: 'Royal Frankish Annals',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'SAGA SAYS: Ragnar’s fleet humbled the Frankish emperor and returned to Denmark heavy with gold. CHRONICLE SAYS: The Annals of St-Bertin (845 AD) record Reginherus leading 120 ships to Paris and extracting 7,000 pounds of silver from Charles the Bald.',
    conditions: {
      yearRange: [840, 864],
      ageMin: 15,
      uniqueOncePerCampaign: true,
    },
    weight: 96,
    text: 'One hundred and twenty clinker prows choke the winding Seine under Reginherus — Ragnar Lothbrok! River mist hangs over the wooden bridges of Paris while King Charles the Bald’s divided Frankish army watches helplessly from opposite banks. Envoys row out with bronze balance-beams offering 7,000 pounds of silver and gold if the Northmen spare the island city.',
    choices: [
      {
        id: 'weigh_paris_danegeld',
        label: 'Strike your axe on the scale-beam: take your share of the 7,000 pounds and an iron-rimmed shield',
        outcomeText:
          'Frankish carts groan under chests of silver deniers! Returning north with Björn Ironside’s vanguard, you claim a bossed iron-rimmed shield and boast that England’s kingdoms are even richer than Paris.',
        effects: {
          silver: 95,
          fame: 45,
          hefndDelta: 15,
          addHeirloomIds: ['shield_of_ironside'],
          completeLothbrokChapterId: 'ch2_seine_silver',
          moveToSettlementId: 'paris',
          addFlags: ['lothbrok_ch2_done'],
          stats: { honor: 10, strength: 4 },
          skills: { combat: 6, seamanship: 5 },
        },
        chain: { eventId: 'lothbrok_ch3_last_voyage', delayYears: 3 },
      },
      {
        id: 'storm_st_germain_abbey',
        label: 'Reject easy coin and lead a shock-assault on the Abbey of Saint-Germain-des-Prés',
        outcomeText:
          'Your oarsmen pry gilded reliquaries and cellar wine from the abbey stones before rejoining the fleet, though camp-fever (dysentery) stalks the lower decks on the voyage home.',
        effects: {
          silver: 120,
          fame: 50,
          hefndDelta: 20,
          completeLothbrokChapterId: 'ch2_seine_silver',
          moveToSettlementId: 'paris',
          addFlags: ['lothbrok_ch2_done'],
          stats: { honor: 8, health: -10 },
          skills: { combat: 8 },
        },
        injuryChance: 0.16,
        injuryTraitId: 'battle_scarred',
        chain: { eventId: 'lothbrok_ch3_last_voyage', delayYears: 3 },
      },
      {
        id: 'warn_against_paris_fever',
        label: 'Pour a libation to Thor and urge the fleet to put to sea before river-sickness strikes',
        outcomeText:
          'Heeding the omen of dead crows on the Seine mudflats, your crew rows clear into salt water untouched by the fever that fells scores of other raiders.',
        effects: {
          silver: 60,
          fame: 25,
          completeLothbrokChapterId: 'ch2_seine_silver',
          addFlags: ['lothbrok_ch2_done'],
          stats: { wyrd: 10, faith: 8, health: 4 },
          skills: { seamanship: 6 },
          divergenceNote: '845 AD: Saved the northern vanguard from the Seine camp-plague after the siege of Paris.',
        },
        chain: { eventId: 'lothbrok_ch3_last_voyage', delayYears: 3 },
      },
    ],
  },
  {
    id: 'lothbrok_ch3_last_voyage',
    title: 'The Lothbrok Cycle III · The Last Voyage of the Old Boar',
    category: 'Historical Set-Piece',
    iconType: 'ship',
    provenance: 'Semi-Legendary Saga Tradition',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'SAGA SAYS: Stung by his sons’ renown in Sweden and the Mediterranean, aging Ragnar built two huge knarrs instead of swift longships and wrecked on Northumbria’s coast. CHRONICLE SAYS: No contemporary English chronicle records this wreck, yet it forms the dramatic hinge of Ragnars saga loðbrókar.',
    conditions: {
      yearRange: [850, 866],
      ageMin: 15,
      uniqueOncePerCampaign: true,
    },
    weight: 97,
    text: 'In the smoky feast-hall, scalds sing louder of Björn Ironside and Ivar than of grey-bearded Ragnar himself. Furious to prove the old boar still has tusks, Ragnar orders two deep-draft knarrs built to conquer Northumbria with a handful of crews. Queen Aslaug pleads that the rocky English shoals will splinter heavy merchant hulls, yet Ragnar’s pride is iron-set.',
    choices: [
      {
        id: 'sail_escort_ormrinn',
        label: 'Follow Ragnar’s wake in a shallow-draft dragon-ship to pull survivors from the Northumbrian surf',
        outcomeText:
          'Grey North Sea rollers hurl Ragnar’s two heavy knarrs onto jagged Northumbrian reefs! While King Ælla’s horsemen surround the exhausted king ashore, your swift dragon-ship rescues his standard-bearer and brings the grim tidings east.',
        effects: {
          fame: 45,
          hefndDelta: 30,
          addHeirloomIds: ['serpent_of_the_wash'],
          completeLothbrokChapterId: 'ch3_last_voyage',
          addFlags: ['lothbrok_ch3_done'],
          stats: { honor: 12, wyrd: 6 },
          skills: { seamanship: 8, combat: 5 },
        },
        chain: { eventId: 'lothbrok_ch4_the_pit', delayYears: 1 },
      },
      {
        id: 'counsel_aslaug_caution',
        label: 'Stand with Queen Aslaug and prepare the Danish war-fleet for the inevitable reckoning',
        outcomeText:
          'Ragnar laughs off your warning and sails into the mist. You spend the winter stockpiling ash-spears, tar, and oak ribs — knowing blood will soon call for blood.',
        effects: {
          longships: 1,
          hirdWarriors: 8,
          hefndDelta: 25,
          completeLothbrokChapterId: 'ch3_last_voyage',
          addFlags: ['lothbrok_ch3_done'],
          stats: { cunning: 8, honor: 6 },
          skills: { craft: 6, seamanship: 4 },
        },
        chain: { eventId: 'lothbrok_ch4_the_pit', delayYears: 1 },
      },
      {
        id: 'beach_beside_ragnar',
        label: 'Drive your own keel straight onto the Northumbrian shingle and fight Ælla’s fyrd beside Ragnar!',
        outcomeText:
          'Outnumbered ten to one on the wet sand, your shield-wall bleeds until every ash-spear splinters! Wounded and dragged back into a fishing skiff, you watch King Ælla’s thegns lead Ragnar away in chains.',
        effects: {
          fame: 60,
          hefndDelta: 40,
          completeLothbrokChapterId: 'ch3_last_voyage',
          addFlags: ['lothbrok_ch3_done', 'fought_at_ragnar_landing'],
          stats: { honor: 18, health: -14, strength: 5 },
          skills: { combat: 10 },
        },
        injuryChance: 0.25,
        injuryTraitId: 'battle_scarred',
        chain: { eventId: 'lothbrok_ch4_the_pit', delayYears: 1 },
      },
    ],
  },
  {
    id: 'lothbrok_ch4_the_pit',
    title: 'The Lothbrok Cycle IV · The Snake-Pit & the Old Boar’s Song',
    category: 'Historical Set-Piece',
    iconType: 'skull',
    provenance: 'Semi-Legendary Saga Tradition',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'SAGA SAYS: Cast into King Ælla’s pit of vipers, Ragnar chanted the death-lay Krákumál ("Gnyðja mundu grísir, ef galtar hag vissi" — the little pigs would grunt if they knew the old boar’s plight). CHRONICLE SAYS: 12th-century skaldic poetry immortalized this scene as the mythic spark of the 865 invasion.',
    conditions: {
      yearRange: [852, 866],
      ageMin: 15,
      uniqueOncePerCampaign: true,
    },
    weight: 98,
    text: 'In Northumbria, King Ælla casts his captive into a stone pit writhing with adders. At first no serpent strikes — until Ælla’s jailers tear Queen Aslaug’s grey unwoven shirt from Ragnar’s shoulders. As venom enters his veins, the old sea-king laughs up at the torchlight: "Fifty-one times have I stood where spear met spear! How the young pigs would grunt if they knew how the old boar suffers! The Valkyries summon me home — laughing shall I die!"',
    mildText:
      'In Northumbria, King Ælla imprisons the captured sea-king in his dungeon Pit of Vipers after stripping away Queen Aslaug’s protective grey tunic. Unbowed to the last breath, Ragnar chants his defiant death-song: "How the young boars would roar if they knew what the old boar endures! The Valkyries call me to Odin’s hall — laughing shall I die!"',
    choices: [
      {
        id: 'carve_krakumal_runes',
        label: 'Carve Ragnar’s dying words onto boxwood staves and carry the blood-message to his sons',
        outcomeText:
          'Every word of the Old Boar’s death-lay burns into the memory of the North. Across every fjord from Kattegat to Uppsala, war-horns begin to sound for Hefnd!',
        effects: {
          fame: 50,
          hefndDelta: 35,
          completeLothbrokChapterId: 'ch4_the_pit',
          addFlags: ['lothbrok_ch4_done', 'ragnar_pit_avenged_oath'],
          stats: { honor: 14, wyrd: 8 },
          skills: { skaldcraft: 10 },
        },
        chain: { eventId: 'lothbrok_ch5_the_oath', delayYears: 1 },
      },
      {
        id: 'recover_torn_shirt_envoy',
        label: 'Bribe Ælla’s terrified envoy to recover Aslaug’s torn grey shirt as proof of the murder',
        outcomeText:
          'Holding the venom-stained silk before the assembly, no chieftain can deny the debt of vengeance. Men flock to your benches with sharpened axes.',
        effects: {
          hirdWarriors: 10,
          fame: 40,
          hefndDelta: 40,
          addHeirloomIds: ['aslaug_unwoven_shirt'],
          completeLothbrokChapterId: 'ch4_the_pit',
          addFlags: ['lothbrok_ch4_done', 'ragnar_pit_avenged_oath'],
          stats: { cunning: 8, honor: 12 },
          skills: { diplomacy: 6, combat: 5 },
        },
        chain: { eventId: 'lothbrok_ch5_the_oath', delayYears: 1 },
      },
    ],
  },
  {
    id: 'lothbrok_ch5_the_oath',
    title: 'The Lothbrok Cycle V · The Oath Over the Bragarfull',
    category: 'Historical Set-Piece',
    iconType: 'crown',
    provenance: 'Semi-Legendary Saga Tradition',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'SAGA SAYS: In Ragnars saga, Ælla’s messengers watched each brother’s reaction to hear who was most dangerous: Ivar’s face turned red, blue, and pale; Björn gripped his spear so hard his prints stayed in the ash-wood; Sigurd cut his finger to the bone; Hvitserk crushed a nefatafl piece until blood spurted under his nail. CHRONICLE SAYS: In 865 the Great Heathen Army mustered across Denmark and the sea.',
    conditions: {
      yearRange: [855, 867],
      ageMin: 15,
      uniqueOncePerCampaign: true,
    },
    weight: 99,
    text: 'King Ælla’s trembling envoys enter the great hall at Lejre while the brothers sit at board. When the words "How the young pigs would grunt" are spoken aloud: Hvitserk squeezes a walrus-ivory hnefatafl king until it shatters in his fist; Sigurd Snake-in-the-Eye pares his fingernails so deep the knife grates on bone without his blinking; Björn Ironside grips his ash-spear until the shaft snaps in two; and Ivar the Boneless turns crimson, livid blue, and corpse-pale as he asks every detail. Over the great Bragarfull horn, the daughters of Ragnar unfurl Hrafnsmerki — the Raven Banner.',
    choices: [
      {
        id: 'drink_bragarfull_hefnd',
        label: 'Drink deep from the Bragarfull horn and swear blood-vengeance (Hefnd) upon Ælla and England!',
        outcomeText:
          'Odin’s two ravens croak above the smoke-hole as the Raven Banner spreads its black wings! You receive the Bragarfull Horn and Hrafnsmerki, and your warband swells with drengir hungry for English shores.',
        effects: {
          hirdWarriors: 16,
          longships: 1,
          fame: 60,
          hefndDelta: 35,
          addHeirloomIds: ['bragarfull_horn_lejre', 'hrafnsmerki_banner'],
          completeLothbrokChapterId: 'ch5_the_oath',
          addFlags: ['lothbrok_ch5_done', 'swore_bragarfull_hefnd', 'joined_great_army'],
          stats: { honor: 16, faith: 8, strength: 5 },
          skills: { combat: 8 },
        },
        chain: { eventId: 'lothbrok_ch6_landfall_865', delayYears: 1 },
      },
      {
        id: 'counsel_ivar_patience',
        label: 'Echo Ivar’s cold cunning: demand silver wergild from Ælla first to lull Northumbria’s guard',
        outcomeText:
          'While hotheads roar for immediate sail, you and Ivar use Ælla’s guilt to scout every river mouth from the Wash to the Humber before striking.',
        effects: {
          silver: 70,
          hirdWarriors: 10,
          fame: 45,
          hefndDelta: 25,
          addHeirloomIds: ['hrafnsmerki_banner'],
          completeLothbrokChapterId: 'ch5_the_oath',
          addFlags: ['lothbrok_ch5_done', 'swore_bragarfull_hefnd', 'joined_great_army'],
          stats: { cunning: 14, honor: 8 },
          skills: { diplomacy: 8, seamanship: 6 },
        },
        chain: { eventId: 'lothbrok_ch6_landfall_865', delayYears: 1 },
      },
      {
        id: 'refuse_oath_stay_north',
        label: 'Refuse the blood-oath: declare that Ragnar courted his own doom with two ships',
        outcomeText:
          'Silence falls over the benches like winter snow. Björn’s hand twitches toward his hilt, and skalds mock your caution — yet your own ships remain safe in home waters.',
        effects: {
          stability: 10,
          hefndDelta: 20,
          completeLothbrokChapterId: 'ch5_the_oath',
          addFlags: ['lothbrok_ch5_done'],
          stats: { honor: -16, wyrd: -8, cunning: 6 },
          divergenceNote: '865 AD: Refused the Bragarfull oath of the sons of Ragnar at Lejre.',
        },
      },
    ],
  },
  {
    id: 'lothbrok_ch6_landfall_865',
    title: 'The Lothbrok Cycle VI · 865 AD: Landfall & the Ox-Hide Truce',
    category: 'Historical Set-Piece',
    iconType: 'ship',
    provenance: 'Anglo-Saxon Chronicle',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'SAGA SAYS: Ivar asked only for as much English soil as a stretched ox-hide could cover, slicing it into a hair-thin thong to enclose a fortress. CHRONICLE SAYS: In autumn 865 the Great Heathen Army landed in East Anglia, made peace with King Edmund in exchange for war-horses, and wintered at Thetford.',
    conditions: {
      yearRange: [865, 870],
      ageMin: 15,
      uniqueOncePerCampaign: true,
    },
    weight: 98,
    text: 'Three hundred keels grind onto the shingle of East Anglia! This is no summer raid — it is the Great Heathen Army (micel hæþen here) come to collect Ragnar’s blood-debt. Young King Edmund of East Anglia sends bishops offering winter quarters and swift fenland horses if the Raven Banner marches north into Northumbria rather than burning his shires.',
    choices: [
      {
        id: 'take_edmund_horses_march_north',
        label: 'Mount your hird on East Anglian horses and ride north toward York with Ivar and Halfdan!',
        outcomeText:
          'Mounted on swift Saxon steeds, your shield-column gallops north along the Roman road toward the Humber estuary! The Hefnd debt burns lighter as Northumbria’s borders come into sight.',
        effects: {
          silver: 65,
          hirdWarriors: 12,
          fame: 50,
          hefndDelta: -15,
          completeLothbrokChapterId: 'ch6_landfall_865',
          moveToSettlementId: 'jorvik',
          addFlags: ['lothbrok_ch6_done', 'great_army_mounted'],
          stats: { honor: 12, cunning: 6 },
          skills: { combat: 7, seamanship: 4 },
        },
        chain: { eventId: 'lothbrok_ch7_eoforwic_burns', delayYears: 1 },
      },
      {
        id: 'ivar_oxhide_fort_ruse',
        label: 'Slice a boiled bull’s hide into a two-mile thong to stake out a permanent fortified camp',
        outcomeText:
          'Saxon ealdormen stare in disbelief as your turf rampart rises inside the hide-thong boundary! Your dynasty claims fertile English ploughland before a single battle is fought.',
        effects: {
          landFarms: 2,
          silver: 45,
          fame: 45,
          hefndDelta: -10,
          completeLothbrokChapterId: 'ch6_landfall_865',
          moveToSettlementId: 'jorvik',
          addFlags: ['lothbrok_ch6_done', 'oxhide_ruse_claimed'],
          stats: { cunning: 14, honor: 8 },
          skills: { law: 8, farming: 6 },
        },
        chain: { eventId: 'lothbrok_ch7_eoforwic_burns', delayYears: 1 },
      },
      {
        id: 'plunder_east_anglia_now',
        label: 'Break Ivar’s truce and sack the East Anglian fen-abbeys immediately for silver',
        outcomeText:
          'You fill two chests with silver candlesticks and church plate, though Ivar coldly reprimands your haste for alerting the southern kingdoms early.',
        effects: {
          silver: 110,
          fame: 30,
          hefndDelta: -10,
          completeLothbrokChapterId: 'ch6_landfall_865',
          addFlags: ['lothbrok_ch6_done'],
          stats: { honor: -4, strength: 6 },
          skills: { combat: 6 },
          divergenceNote: '865 AD: Broke the East Anglian horse-truce to sack the fenland monasteries ahead of schedule.',
        },
        chain: { eventId: 'lothbrok_ch7_eoforwic_burns', delayYears: 1 },
      },
    ],
  },
  {
    id: 'lothbrok_ch7_eoforwic_burns',
    title: 'The Lothbrok Cycle VII · 866 AD: Eoforwic Burns (Fall of York)',
    category: 'Historical Set-Piece',
    iconType: 'sword',
    provenance: 'Anglo-Saxon Chronicle',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'SAGA SAYS: The sons of Ragnar turned York’s crumbling Roman walls into a death-trap for the Northumbrian hosts. CHRONICLE SAYS: On All Saints’ Day (1 Nov 866) the Great Army seized Eoforwic amid civil war between King Osberht and usurper King Ælla; in March 867 both kings attacked the city and were crushed inside the walls.',
    conditions: {
      yearRange: [866, 872],
      ageMin: 15,
      uniqueOncePerCampaign: true,
    },
    weight: 99,
    text: 'All Saints’ Day, 866 AD. Bells toll in panic across Eoforwic (York) as the Raven Banner surges over the Ouse! Taking the Roman fortress while rival Northumbrian kings Osberht and Ælla feud in the countryside, your host fortifies the crumbling stone walls. Come spring (March 867), Osberht and Ælla unite their armies and smash through a gap in the wall — walking straight into Ivar and Ubba’s street-by-street slaughter-trap!',
    choices: [
      {
        id: 'spring_york_wall_trap',
        label: 'Close the shield-ring behind the breach and roar "Ragnar!" as Osberht falls and Ælla is trapped!',
        outcomeText:
          'Iron rings on iron inside the narrow Roman lanes! King Osberht is cut down in the press, the Northumbrian fyrd is annihilated, and usurper King Ælla — jailer of the snake-pit — is dragged alive in chains before the sons of Ragnar! Eoforwic becomes Norse Jórvík!',
        effects: {
          silver: 125,
          landFarms: 2,
          fame: 75,
          hefndDelta: -30,
          completeLothbrokChapterId: 'ch7_eoforwic_burns',
          moveToSettlementId: 'jorvik',
          addFlags: ['lothbrok_ch7_done', 'veteran_great_army', 'aella_captured_york'],
          stats: { honor: 18, strength: 6, health: -8 },
          skills: { combat: 10 },
        },
        injuryChance: 0.18,
        injuryTraitId: 'battle_scarred',
        chain: { eventId: 'lothbrok_ch8_the_eagle', delayYears: 1 },
      },
      {
        id: 'command_ouse_river_ships',
        label: 'Hold the River Ouse with your longships to cut off every Northumbrian retreat by water',
        outcomeText:
          'Not a single royal thegn escapes across the river! You seize the royal treasury barges of Northumbria and establish a permanent merchant wharf in newborn Jórvík.',
        effects: {
          silver: 140,
          fame: 60,
          hefndDelta: -25,
          completeLothbrokChapterId: 'ch7_eoforwic_burns',
          moveToSettlementId: 'jorvik',
          addFlags: ['lothbrok_ch7_done', 'veteran_great_army', 'aella_captured_york'],
          stats: { cunning: 10, honor: 12 },
          skills: { seamanship: 8, trade: 6 },
        },
        chain: { eventId: 'lothbrok_ch8_the_eagle', delayYears: 1 },
      },
    ],
  },
  {
    id: 'lothbrok_ch8_the_eagle',
    title: 'The Lothbrok Cycle VIII · 867 AD: The Eagle of Reckoning',
    category: 'Historical Set-Piece',
    iconType: 'skull',
    provenance: 'Semi-Legendary Saga Tradition',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'SAGA SAYS: In Þáttr af Ragnars sonum, Ivar the Boneless ordered the sharpest wood-carver to incise the blood-eagle (rista blóðörn) on King Ælla’s back as sacrifice to Odin for Ragnar’s snake-pit. CHRONICLE SAYS: The Anglo-Saxon Chronicle states both kings were slain at York; modern scholars debate whether the blood-eagle was a rare pagan rite or a literalized skaldic kenning.',
    conditions: {
      yearRange: [866, 875],
      ageMin: 15,
      uniqueOncePerCampaign: true,
    },
    weight: 100,
    text: 'Outside the smoking Roman gate of Jórvík, captive King Ælla of Northumbria kneels in the mud beneath the fluttering wings of the Raven Banner. Ivar the Boneless leans forward from his carried shield and speaks softly: "Remember the adders in the stone pit, Ælla, and how the old boar sang of his sons. Today Odin’s birds shall be fed." Beside him, a grim carver steps forward with an iron-bladed axe to trace the red eagle.',
    mildText:
      'Outside the smoking Roman gate of Jórvík, captive King Ælla of Northumbria kneels beneath the fluttering wings of the Raven Banner. Ivar the Boneless leans forward from his carried shield: "Remember the stone pit, Ælla, and how the old boar sang of his sons." As the skalds chant in solemn dróttkvætt verse, the brothers prepare to pronounce final judgment — carving the red bird’s wings in saga memory to pay Ragnar’s blood-debt.',
    choices: [
      {
        id: 'fulfill_blood_eagle_hefnd',
        label: 'Stand beside Ivar and witness the Eagle’s reckoning — let Ragnar’s Hefnd be paid in full!',
        mildLabel: 'Stand beside Ivar and pronounce the skald’s Eagle judgment — let Ragnar’s Hefnd be paid in full!',
        outcomeText:
          'Under leaden Yorkshire skies, the blood-eagle is carved and dedicated to the High One! A great cry goes up from ten thousand throats: Ragnar Lothbrok is avenged! Your Hefnd debt is quenched in triumph, and every Anglo-Saxon king from Mercia to Wessex trembles at your name.',
        mildOutcomeText:
          'Under leaden Yorkshire skies, the skalds chant the verse of the Red Eagle as King Ælla meets his doom! A great cry goes up from ten thousand throats: Ragnar Lothbrok is avenged! Your Hefnd debt is quenched in triumph, and every king in England trembles at your name.',
        effects: {
          fame: 95,
          hefndDelta: -60,
          completeLothbrokChapterId: 'ch8_the_eagle',
          addFlags: ['lothbrok_ch8_done', 'ragnar_avenged_full'],
          stats: { honor: 22, faith: 12, wyrd: 12 },
          skills: { combat: 8, skaldcraft: 6 },
        },
        chain: { eventId: 'lothbrok_ch9_edmund_alfred_cost', delayYears: 2 },
      },
      {
        id: 'grant_clean_sword_stroke',
        label: 'Step forward and end Ælla with a single clean sword-stroke as a crowned king',
        outcomeText:
          'Defying Ivar’s grim ritual, your blade flashes once and ends Ælla cleanly. Halfdan growls in anger, yet Björn Ironside nods slowly: "The boar’s debt is paid either way." Saxon chroniclers marvel that one Norse lord showed a king’s mercy.',
        effects: {
          fame: 70,
          hefndDelta: -45,
          completeLothbrokChapterId: 'ch8_the_eagle',
          addFlags: ['lothbrok_ch8_done', 'ragnar_avenged_full'],
          stats: { honor: 16, charisma: 10 },
          skills: { diplomacy: 8, law: 6 },
          divergenceNote: '867 AD: Granted King Ælla of Northumbria a clean sword-death at York instead of the blood-eagle.',
        },
        chain: { eventId: 'lothbrok_ch9_edmund_alfred_cost', delayYears: 2 },
      },
      {
        id: 'ransom_aella_crown_divergent',
        label: 'Force Ælla to swear vassalage and pay 2,000 pounds of Northumbrian silver as a puppet king!',
        outcomeText:
          'Against all saga prophecy, you and Ivar leave a broken, terrified Ælla on a leash as tax-collector of Northumbria! The brothers quarrel bitterly over the unspilled blood, yet silver pours into your coffers.',
        effects: {
          silver: 180,
          fame: 50,
          hefndDelta: 20,
          completeLothbrokChapterId: 'ch8_the_eagle',
          addFlags: ['lothbrok_ch8_done'],
          stats: { cunning: 16, honor: -12 },
          skills: { trade: 10, diplomacy: 8 },
          divergenceNote: '867 AD: Spared King Ælla at York as a tributary puppet-king instead of avenging Ragnar’s pit in blood.',
        },
        chain: { eventId: 'lothbrok_ch9_edmund_alfred_cost', delayYears: 2 },
      },
    ],
  },
  {
    id: 'lothbrok_ch9_edmund_alfred_cost',
    title: 'The Lothbrok Cycle IX · Edmund, Alfred & the Ledger of Vengeance',
    category: 'Historical Set-Piece',
    iconType: 'crown',
    provenance: 'Anglo-Saxon Chronicle',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'SAGA SAYS: After avenging their father, the sons of Ragnar parted ways: Ivar ruled in England/Dublin until dying in bed, Björn took Uppsala, Sigurd took Denmark, and Halfdan shared out Northumbria. CHRONICLE SAYS: King Edmund was martyred in 869, Mercia fell in 874, and King Alfred’s stand at Ashdown & Edington fixed the Danelaw frontier.',
    conditions: {
      yearRange: [869, 882],
      ageMin: 15,
      uniqueOncePerCampaign: true,
    },
    weight: 98,
    text: 'Vengeance has eaten three kingdoms. At Hoxne (869 AD), King Edmund of East Anglia refuses to renounce Christ or rule as Ivar’s under-king, standing bound to an oak like Saint Sebastian before Viking archers. Mercia’s King Burgred flees to Rome from the great winter-camp at Repton — yet on the chalk downs of Ashdown and the marshes of Athelney, young King Alfred of Wessex refuses to break. As the brothers prepare to divide their conquests, what ledger do you write at the end of the Lothbrok Cycle?',
    mildText:
      'Vengeance has reshaped all England. King Edmund of East Anglia falls defending his crown in 869 AD, Mercia’s king flees to Rome from the great winter-camp at Repton — yet on the chalk downs of Wessex, young King Alfred stands firm. As the sons of Ragnar prepare to divide the conquered shires of the Danelaw, what path do you claim at the climax of the Lothbrok Cycle?',
    choices: [
      {
        id: 'carve_danelaw_jarldom',
        label: 'Share out the Danelaw ploughlands with Halfdan and rule as a Norse lord of England',
        outcomeText:
          'Measuring fertile Yorkshire and Mercian valleys by the rope, your warriors hang up their sea-shields in timber halls. From Ragnar’s snake-pit has grown an enduring Anglo-Scandinavian realm!',
        effects: {
          landFarms: 3,
          silver: 90,
          fame: 80,
          stability: 14,
          hefndDelta: -30,
          completeLothbrokChapterId: 'ch9_edmund_alfred_cost',
          moveToSettlementId: 'jorvik',
          addFlags: ['lothbrok_ch9_done', 'lothbrok_cycle_completed'],
          stats: { honor: 14, happiness: 10 },
          skills: { law: 8, farming: 8 },
        },
      },
      {
        id: 'sail_dublin_ui_imair',
        label: 'Follow Ivar’s sea-road to Dyflinn (Dublin) to rule the Irish Sea as the Uí Ímair dynasty',
        outcomeText:
          'Linking Jórvík and Dyflinn across the Irish Sea, your dragon-prows command both kingdoms! Chroniclers in Ulster and England alike hail the dynasty of Ivar and Ragnar.',
        effects: {
          silver: 130,
          longships: 1,
          fame: 90,
          hefndDelta: -35,
          completeLothbrokChapterId: 'ch9_edmund_alfred_cost',
          moveToSettlementId: 'dublin',
          addFlags: ['lothbrok_ch9_done', 'lothbrok_cycle_completed', 'ui_imair_dynasty'],
          stats: { cunning: 12, honor: 14, wyrd: 8 },
          skills: { seamanship: 10, trade: 8 },
        },
      },
      {
        id: 'swear_never_ending_hefnd_wessex',
        label: 'Spurn every treaty with Alfred and swear the Raven Banner will not rest until Winchester falls!',
        outcomeText:
          'While others beat spears into ploughshares, you raise the Bragarfull horn once more! Wessex burns along the Thames, and the blood-feud of Ragnarsættin roars on across generations!',
        effects: {
          hirdWarriors: 18,
          silver: 80,
          fame: 95,
          hefndDelta: 15,
          completeLothbrokChapterId: 'ch9_edmund_alfred_cost',
          moveToSettlementId: 'winchester',
          addFlags: ['lothbrok_ch9_done', 'lothbrok_cycle_completed', 'unending_wessex_war'],
          stats: { honor: 18, strength: 8 },
          skills: { combat: 12 },
          divergenceNote: '878 AD: Rejected the Danelaw partition to wage unending Ragnarsættin war against Alfred’s Wessex.',
        },
      },
    ],
  },
];

// ==========================================
// 5. SIGNATURE EVENTS FOR THE 8 PRESETS + LEGACY / FALSE CLAIM
// ==========================================

export const LOTHBROK_SIGNATURE_EVENTS: GameEvent[] = [
  {
    id: 'sig_ivar_shield_council',
    title: 'Signature of Ivar · Borne Upon the War-Shield',
    category: 'War',
    iconType: 'sword',
    provenance: 'Semi-Legendary Saga Tradition',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'SAGA SAYS: Born with cartilage where bone should be because Ragnar broke Aslaug’s three-night wedding warning, Ivar was carried on a shield and possessed unmatched cunning. CHRONICLE SAYS: Invar/Ímar was the supreme strategist of the 865–870 campaigns in England and Ireland.',
    conditions: {
      requiredFlags: ['sig_ivar'],
      ageMin: 15,
      uniqueOncePerCampaign: true,
    },
    weight: 100,
    text: 'Four tall huscarls hoist your bossed oak shield onto their shoulders above the clamour of the shield-wall. Below you, veterans murmur that no legless man could lead a charge — until you point with your unstrung yew-bow toward a hidden marsh-ford behind the Saxon ealdorman’s flank that every standing captain missed.',
    choices: [
      {
        id: 'direct_shield_envelopment',
        label: 'Direct a silent double-envelopment from atop your shield and Loose a single signal arrow',
        outcomeText:
          'Your trap snaps shut like a wolf’s jaws! Not a single huscarl questions your legs again; they swear your mind sees the battlefield as Odin sees from Hliðskjálf.',
        effects: {
          silver: 75,
          fame: 55,
          hefndDelta: -15,
          stats: { cunning: 14, honor: 12, charisma: 8 },
          skills: { combat: 8, law: 6 },
        },
      },
      {
        id: 'draw_great_yew_bow',
        label: 'Brace yourself on the shield-rim and draw a war-bow too stiff for ordinary men',
        outcomeText:
          'With iron-muscled shoulders, you send threegoose-feathered shafts straight through the enemy banner-man’s mail!',
        effects: {
          fame: 60,
          hefndDelta: -15,
          stats: { strength: 10, honor: 14 },
          skills: { combat: 12 },
        },
      },
    ],
  },
  {
    id: 'sig_bjorn_luna_coffin',
    title: 'Signature of Björn Ironside · The Coffin at the Marble Gates',
    category: 'Raiding',
    iconType: 'ship',
    provenance: 'Semi-Legendary Saga Tradition',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'SAGA SAYS: Believing white-marbled Luna in Italy was Rome itself, Björn and Hastein feigned death-bed conversion to carry a sword-filled coffin inside the cathedral. CHRONICLE SAYS: In 859–862 Björn Ironside and Hastein raided Iberia, Morocco (Nekor), the Rhône, and Luna.',
    conditions: {
      requiredFlags: ['sig_bjorn'],
      ageMin: 15,
      uniqueOncePerCampaign: true,
    },
    weight: 100,
    text: 'Gleaming white marble towers rise above the southern coast — so grand your steersmen swear you have reached Rome itself! The gates are barred with iron, so your foster-father Hastein grins darkly: "Let us send word to the bishop that our chieftain has died at sea after taking Christian baptism, and begs only a grave inside the cathedral — with his hirdmen carrying the heavy bier."',
    choices: [
      {
        id: 'leap_from_bier_luna',
        label: 'Lie in the oak bier with naked swords beneath your cloak and leap forth at the altar!',
        outcomeText:
          'As the bishop swings his censer, you kick off the coffin-lid with a war-cry! The gates are thrown open from within, and your fleet loads chests of Mediterranean silk and silver.',
        effects: {
          silver: 115,
          fame: 65,
          addHeirloomIds: ['shield_of_ironside'],
          stats: { cunning: 12, honor: 10, strength: 6 },
          skills: { combat: 10, seamanship: 6 },
        },
      },
      {
        id: 'ransom_bishop_honestly',
        label: 'Spurn the coffin trick and batter the harbor boom with iron-prowed longships',
        outcomeText:
          'Relying on Aslaug’s invulnerable blessing upon your ribs ("Ironside"), you stand in the prow through a hail of stones and force the city to pay heavy tribute!',
        effects: {
          silver: 90,
          fame: 55,
          stats: { honor: 16, health: 6 },
          skills: { combat: 10 },
        },
      },
    ],
  },
  {
    id: 'sig_halfdan_tyne_plough',
    title: 'Signature of Halfdan · The Sword and the Measuring-Rope',
    category: 'Politics & Kings',
    iconType: 'crown',
    provenance: 'Anglo-Saxon Chronicle',
    sagaVsChronicleNote:
      'SAGA SAYS: Halfdan was the sternest of Ragnar’s sons, ruling Northumbria with iron law until his own army feared his wrath. CHRONICLE SAYS: The Anglo-Saxon Chronicle (876 AD) records: "Halfdan shared out the land of the Northumbrians, and they were ploughing and making a living for themselves."',
    conditions: {
      requiredFlags: ['sig_halfdan'],
      ageMin: 15,
      uniqueOncePerCampaign: true,
    },
    weight: 100,
    text: 'Along the banks of the Tyne and Ouse, veteran oarsmen clamor for their promised land-shares while Saxon thegns watch sullenly from the hedgerows. As war-king of the northern host, you hold a tarred measuring-rope in one hand and a notched broadsword in the other.',
    choices: [
      {
        id: 'parcel_wapentake_farms',
        label: 'Drive boundary-stakes for every drengr and establish Norse wapentake law across Yorkshire',
        outcomeText:
          'Old oarsmen weep with pride as they guide ox-ploughs through rich English loam. Your realm’s farms, food stores, and silver tax double overnight.',
        effects: {
          landFarms: 3,
          foodStores: 35,
          silver: 60,
          fame: 50,
          hefndDelta: -15,
          stats: { honor: 12, cunning: 6 },
          skills: { farming: 10, law: 10 },
        },
      },
      {
        id: 'march_strathclyde_picts',
        label: 'Leave tenants to plough while you lead the iron core north against Strathclyde and the Picts',
        outcomeText:
          'Your banners sweep past Hadrian’s crumbling wall! Northern kings pay tribute in cattle and hacksilver.',
        effects: {
          silver: 95,
          fame: 55,
          hirdWarriors: 10,
          hefndDelta: -20,
          stats: { strength: 8, honor: 10 },
          skills: { combat: 10 },
        },
      },
    ],
  },
  {
    id: 'sig_ubba_frisian_fury',
    title: 'Signature of Ubba · Wolf-Coat Runes on the Strand',
    category: 'Mystic & Omens',
    iconType: 'dragon',
    provenance: 'Semi-Legendary Saga Tradition',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'SAGA SAYS: Ubba combined berserk fury with dark seidr taught by northern sorcerers, wading through spear-walls unscathed until an hundred arrows found him. CHRONICLE SAYS: Abbo of Fleury and Asser name Ubba as the fierce co-commander in East Anglia and Devon (Battle of Cynwit, 878).',
    conditions: {
      requiredFlags: ['sig_ubba'],
      ageMin: 15,
      uniqueOncePerCampaign: true,
    },
    weight: 100,
    text: 'Before the dawn tide rises, you draw a wolf-skin coat over your mail and redden carved hazel-wands with sacrificial blood on the shingle. Two black ravens wheel low over the masthead as Saxon horns blow on the hill above.',
    choices: [
      {
        id: 'howl_ulfhednar_charge',
        label: 'Bite the iron shield-rim and lead the úlfheðnar straight through the center of the fyrd!',
        outcomeText:
          'Men swear spears glance off your wolf-pelt like reed-stalks! The Saxon line shatters in blind terror before your howl.',
        effects: {
          silver: 80,
          fame: 65,
          hefndDelta: -20,
          stats: { strength: 12, faith: 10, wyrd: 8 },
          skills: { combat: 12, seidr: 8 },
        },
      },
      {
        id: 'read_raven_flight_omen',
        label: 'Heed the ravens’ wheeling flight to outflank the hill-fort by the hidden tidal creek',
        outcomeText:
          'Instead of charging uphill into a stone-trap, your ships slip behind the earthen rampart and seize the ealdorman’s silver chest intact.',
        effects: {
          silver: 95,
          fame: 50,
          hefndDelta: -15,
          stats: { cunning: 12, wyrd: 12 },
          skills: { seidr: 10, seamanship: 8 },
        },
      },
    ],
  },
  {
    id: 'sig_sigurd_ouroboros_eye',
    title: 'Signature of Sigurd · The Gleam of the Ouroboros Eye',
    category: 'Politics & Kings',
    iconType: 'crown',
    provenance: 'Semi-Legendary Saga Tradition',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'SAGA SAYS: Queen Aslaug prophesied that her son would bear a pale serpent biting its own tail around his iris to prove Ragnar had waited three nights — linking their line to Harthacnut and the Danish kings. CHRONICLE SAYS: Sigfred/Sigurd ruled in Denmark in the 870s–880s and negotiated with Frankish emperors.',
    conditions: {
      requiredFlags: ['sig_sigurd'],
      ageMin: 15,
      uniqueOncePerCampaign: true,
    },
    weight: 100,
    text: 'At the royal assembly of Zealand and Scania, a rival Danish claimant dares question whether Ragnar Lothbrok truly fathered all who claim his name. Stepping into a shaft of sunlight by the high-seat, you turn your gaze upon him — revealing the pale, unmistakable ring of the tail-biting serpent (Ormr-í-Auga) encircling your pupil, and your hand resting on the Völsung hilt.',
    choices: [
      {
        id: 'draw_volsung_blade_acclaim',
        label: 'Draw the Fang of Fafnir a finger’s breadth and demand every jarl’s oath of fealty',
        outcomeText:
          'The claimant drops to one knee, pale as birch-ash! Across the Sound and the Islands, chieftains strike weapons on shields to hail the true heir of Sigurd and Ragnar.',
        effects: {
          silver: 85,
          hirdWarriors: 14,
          fame: 65,
          addHeirloomIds: ['fang_of_fafnir'],
          stats: { honor: 16, charisma: 12, wyrd: 8 },
          skills: { diplomacy: 10, law: 8 },
        },
      },
      {
        id: 'challenge_claimant_holmgang',
        label: 'Cast down the staked hazel-poles for an immediate holmgang duel of honor!',
        outcomeText:
          'Two strokes of Völsung steel split his bossed shield to the grip! You claim his ship and estate by lawful duel-right.',
        effects: {
          silver: 70,
          longships: 1,
          fame: 70,
          stats: { strength: 8, honor: 18 },
          skills: { combat: 12 },
        },
      },
    ],
  },
  {
    id: 'sig_hvitserk_burning_pyre',
    title: 'Signature of Hvitserk · The White Shirt in the Red Storm',
    category: 'War',
    iconType: 'sword',
    provenance: 'Semi-Legendary Saga Tradition',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'SAGA SAYS: After avenging Ragnar in England, Hvitserk raided into Garðaríki (Rus) and the East; when surrounded by overwhelming numbers, he asked to be burned alive upon a pyre of fallen foes’ skulls rather than die by base hands. CHRONICLE SAYS: Hvitserk is often identified by historians with Halfdan ("White-Shirt") or an eastern campaigner.',
    conditions: {
      requiredFlags: ['sig_hvitserk'],
      ageMin: 15,
      uniqueOncePerCampaign: true,
    },
    weight: 100,
    text: 'Fog lifts over a narrow river-bend to reveal three enemy war-hosts blocking both banks and chains stretched across the current. Your steersman pales, asking if you will strike your banner and beg quarter. You laugh aloud, tightening the belt over your blood-flecked white linen war-shirt.',
    choices: [
      {
        id: 'cleave_river_chain_vanguard',
        label: 'Row at full ramming speed to snap the iron river-chain with your dragon-prow!',
        outcomeText:
          'Sparks fly as the rusted chain parts like rotten twine! Rewriting the doom of the sagas, your vanguard cuts clean through the ambush with chests of eastern dirhams and English silver!',
        effects: {
          silver: 95,
          fame: 70,
          hefndDelta: -15,
          stats: { honor: 18, strength: 10, wyrd: 8 },
          skills: { combat: 12, seamanship: 6 },
          divergenceNote: 'Broke the encirclement that in saga tradition claimed Hvitserk’s life.',
        },
      },
      {
        id: 'stack_shield_fort_pyre',
        label: 'Beach the ships, pile enemy shields into a breastwork, and dare their king to single combat!',
        outcomeText:
          'Awed by your reckless laughter in the face of death, the enemy prince halts his archers, exchanges gold arm-rings with you, and opens the river passage in honor!',
        effects: {
          silver: 80,
          fame: 65,
          stats: { honor: 20, charisma: 10 },
          skills: { combat: 8, diplomacy: 8 },
        },
      },
    ],
  },
  {
    id: 'sig_lagertha_shieldmaiden_wing',
    title: 'Signature of Lagertha · The Flying Wing of Shieldmaidens',
    category: 'War',
    iconType: 'sword',
    provenance: 'Semi-Legendary Saga Tradition',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'SAGA SAYS: In Saxo Grammaticus’s Gesta Danorum (Book IX), Lagertha fought in the front rank with hair flowing over her shoulders, circling behind the enemy to turn defeat into victory — and later ruled Gaular in her own right. CHRONICLE SAYS: Birka grave Bj 581 and Byzantine accounts of the 971 Siege of Dorostolon attest to armed women in Viking contexts.',
    conditions: {
      requiredFlags: ['sig_lagertha'],
      ageMin: 15,
      uniqueOncePerCampaign: true,
    },
    weight: 100,
    text: 'In the narrow valley below Gaular, an ambitious usurper jarl presses your center shield-wall back step by bloody step. Your male captains shout to fall back toward the boats — but your chosen wing of thirty mail-clad shieldmaidens waits concealed behind the birch-ridge, spears leveled and braids unbound beneath their helms.',
    choices: [
      {
        id: 'sweep_rear_shieldmaidens',
        label: 'Lead the flying wing down the ridge into the usurper’s unprotected rear!',
        outcomeText:
          'Like Valkyries descending from the storm-wrack, your spear-charge rolls up the enemy line! The usurper flees weaponless, and every bondi in the fjord swears fealty to Lagertha’s high-seat alone.',
        effects: {
          silver: 85,
          hirdWarriors: 12,
          fame: 70,
          addHeirloomIds: ['shield_of_ironside'],
          stats: { honor: 18, strength: 8, charisma: 10 },
          skills: { combat: 12, diplomacy: 6 },
        },
      },
      {
        id: 'bind_hound_and_bear_hall',
        label: 'Lure the rival chieftain into your hall courtyard where achained bear and mastiff guard the threshold',
        outcomeText:
          'Just as in Saxo’s tale, your courtyard guardians scatter his bodyguards while your spear settles the dispute! Your independence in Norway is absolute.',
        effects: {
          silver: 75,
          landFarms: 2,
          fame: 60,
          stats: { cunning: 14, honor: 14 },
          skills: { combat: 8, law: 8 },
        },
      },
    ],
  },
  {
    id: 'sig_aslaug_kraka_prophecy',
    title: 'Signature of Queen Aslaug · The Völva’s Loom of Wyrd',
    category: 'Mystic & Omens',
    iconType: 'dragon',
    provenance: 'Semi-Legendary Saga Tradition',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'SAGA SAYS: Daughter of Sigurd Fafnir-slayer and the valkyrie Brynhild, Aslaug was hidden inside Heimir’s great harp as a child, raised as "Kráka" (Crow), and possessed second sight that guided the entire Lothbrok dynasty. CHRONICLE SAYS: Through Aslaug, Scandinavian royal genealogies linked historical Viking kings to the mythic Völsung cycle.',
    conditions: {
      requiredFlags: ['sig_aslaug'],
      ageMin: 15,
      uniqueOncePerCampaign: true,
    },
    weight: 100,
    text: 'By the glowing embers of the high-seat, you open the gilded secret compartment of Foster-Father Heimir’s ancient wooden harp. Inside lie gold-embroidered Völsung silks and carved rune-lots. When the sons and captains clamor to know where the fleet should strike, your seeress-sight pierces the sea-mist across England and the Baltic.',
    choices: [
      {
        id: 'weave_hrafnsmerki_prophecy',
        label: 'Chant the Völsung Galdr and weave the Raven Banner (Hrafnsmerki) to guide the fleet’s wyrd',
        outcomeText:
          'As the last black thread is tied, the woven raven flutters its wings without a breath of wind in the hall! Warriors kneel in awe, and your dynasty’s hamingja shines across three seas.',
        effects: {
          fame: 75,
          hirdWarriors: 12,
          hefndDelta: -15,
          addHeirloomIds: ['hrafnsmerki_banner', 'aslaug_unwoven_shirt'],
          stats: { wyrd: 18, faith: 14, charisma: 12 },
          skills: { seidr: 14, skaldcraft: 10 },
        },
      },
      {
        id: 'invoke_randalin_shield_march',
        label: 'Don war-gear as "Randalín" and lead the royal levy across the ice yourself!',
        outcomeText:
          'Just as when you marched into Sweden as Randalín to avenge Eystein’s insult, your presence at the head of the host shames every wavering captain into fierce valor!',
        effects: {
          silver: 90,
          fame: 70,
          hefndDelta: -20,
          stats: { honor: 18, charisma: 12, strength: 6 },
          skills: { combat: 10, diplomacy: 10 },
        },
      },
    ],
  },
  {
    id: 'lothbrok_false_claimant_thing',
    title: 'False Wolf-Blood at the Thing Rock',
    category: 'Politics & Kings',
    iconType: 'crown',
    provenance: 'Semi-Legendary Saga Tradition',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'SAGA SAYS: Dozens of chieftains from Iceland to Dublin boasted descent from Ragnar Lothbrok to win followers. CHRONICLE SAYS: Because "Ragnarsættin" carried immense prestige, rival Norse houses frequently fabricated or contested genealogies at the Thing.',
    conditions: {
      requiredFlags: ['ragnar_blood_active'],
      ageMin: 17,
      uniqueOncePerCampaign: true,
    },
    weight: 28,
    text: 'At the district Thing, a wealthy upstart jarl named Ketil Gold-Beard stands upon the Law-Rock displaying a counterfeit serpent-hilt, loudly claiming descent from Björn Ironside to lure away your oarsmen and English tribute-shares!',
    choices: [
      {
        id: 'expose_false_genealogy_skald',
        label: 'Recite the true Völsung-Lothbrok genealogy in dróttkvætt verse and expose his grandfather as a salt-boiler!',
        outcomeText:
          'Roars of laughter echo across the Thing-plain when Ketil cannot name Aslaug’s foster-father! Stripped of his false claim, he pays you forty silver in shame-compensation, and six of his best drengir join your hird.',
        effects: {
          silver: 48,
          hirdWarriors: 6,
          fame: 35,
          hefndDelta: -10,
          stats: { honor: 14, charisma: 8 },
          skills: { law: 8, skaldcraft: 8 },
        },
      },
      {
        id: 'exploit_claimant_vassal',
        label: 'Speak privately in his booth: confirm his "cousinship" publicly if he pays annual tribute and sails under your banner',
        outcomeText:
          'Realpolitik triumphs over purity! Grateful for your public nod, Ketil weighs out sixty ounces of silver and commits a fully crewed longship to your English campaigns.',
        effects: {
          silver: 65,
          longships: 1,
          fame: 20,
          stats: { cunning: 14, honor: -4 },
          skills: { diplomacy: 10, trade: 6 },
        },
      },
      {
        id: 'answer_false_claim_steel',
        label: 'Strike the counterfeit sword from his hand and demand immediate holmgang on the island!',
        outcomeText:
          'Your true Wolf-Blood burns hot! You shatter his forged blade on the third blow and claim his silver arm-rings before the cheering assembly.',
        effects: {
          silver: 55,
          fame: 45,
          hefndDelta: -15,
          stats: { honor: 16, strength: 6, health: -6 },
          skills: { combat: 10 },
        },
        injuryChance: 0.14,
        injuryTraitId: 'battle_scarred',
      },
    ],
  },
  {
    id: 'lothbrok_ui_imair_legacy',
    title: 'Scions of the Uí Ímair · The Twin Thrones of Dyflinn and Jórvík',
    category: 'Politics & Kings',
    iconType: 'crown',
    provenance: 'Annals of Ulster',
    sagaVsChronicleNote:
      'SAGA SAYS: The grandsons of Ivar the Boneless carried the Raven Banner’s wyrd across generations. CHRONICLE SAYS: The historical Uí Ímair ("Grandsons of Ímar", such as Ragnall and Sigtrygg Caích) ruled a dual sea-kingdom linking Dublin and York in the 10th century.',
    conditions: {
      requiredFlags: ['ragnar_blood_active'],
      yearRange: [880, 1066],
      ageMin: 16,
      uniqueOncePerCampaign: true,
    },
    weight: 32,
    text: 'Envoys from the Hiberno-Norse lords of Dyflinn — styling themselves Uí Ímair, the grandsons of Ivar — beach a dragon-ship painted in black and gold. Recognizing the Ragnarsættin blood-claim in your hall, kinsmen of Sigtrygg and Ragnall propose a grand compact to bind Dublin, the Isle of Man, and Jórvík under one unbroken dynasty — and settle the lingering Hefnd debt against the Saxon crown.',
    choices: [
      {
        id: 'seal_ui_imair_axis',
        label: 'Swear the Uí Ímair sea-compact and claim joint lordship of the Irish Sea and Yorkshire!',
        outcomeText:
          'Silver pennies stamped with the Raven and the Sword circulate from Dublin to York! Your trade networks, warband, and ancestral renown surge across the British Isles.',
        effects: {
          silver: 90,
          hirdWarriors: 12,
          fame: 60,
          hefndDelta: -20,
          addFlags: ['ui_imair_dynasty'],
          stats: { honor: 14, charisma: 8, wyrd: 6 },
          skills: { diplomacy: 8, seamanship: 8, trade: 6 },
        },
      },
      {
        id: 'demand_sole_headship_ragnar',
        label: 'Declare your branch the senior high-seat of Ragnarsættin and demand their tribute',
        outcomeText:
          'Awed by your dynasty’s heirlooms and battle-fame, the Dublin captains yield forty ounces of silver and a war-ship to your command.',
        effects: {
          silver: 65,
          longships: 1,
          fame: 45,
          hefndDelta: -10,
          stats: { honor: 12, strength: 6 },
          skills: { combat: 6, law: 6 },
        },
      },
    ],
  },
];

// ==========================================
// 6. PERSIAN TRANSLATIONS FOR ALL LOTHBROK EVENTS
//    (Exact transliterations: راگنار لُدبروک، ایوار بیاستخوان،
//     بیورن پهلوآهنین، هالفدان، اوبّا، سیگورد مار-در-چشم،
//     هویتسرک، لاگرتا، اسلاگ، ائلا)
// ==========================================

export const LOTHBROK_EVENTS_FA: Record<string, GameEventFa> = {
  lothbrok_ch1_shirt_serpent: {
    title: 'چرخه راگنار لُدبروک (فصل اول) · پیراهن بی‌درز و اژدهای گوتلند',
    text: 'در ساحل اسپانگرید نروژ، دختری به نام «کراکا» پای بر عرشه کشتی اژدهاپیکر می‌گذارد — نه برهنه و نه پوشیده در تور ماهیگیری، نه گرسنه و نه سیر با گزیدن یک پیاز، و نه تنها و نه با همراه مگر یک سگ شکاری. هنگامی که او انگشتر زرین خاندان ولسونگ و یادگار پدرش «سیگورد اژدهاکش» را نشان می‌دهد، نام راستینش «اسلاگ» آشکار می‌گردد. او پیراهنی خاکستری و بی‌درز از ابریشمِ تابیده‌نشده پیشکش می‌کند که تا سوگند پابرجاست، هیچ تیغ و نیزه‌ای بر آن کارگر نیست.',
    choices: {
      claim_aslaug_shirt_oath: {
        label: 'پیراهن بی‌درز اسلاگ را بپذیر و دودمان خود را به خون گرگِ «راگنار لُدبروک» پیوند بزن',
        outcomeText:
          'جامه خاکستری و جادویی اسلاگ را بر زره می‌پوشی. اسکالدها پیوند خون اژدهاکش و شاه دریاها را می‌ستایند — هرچند نورن‌های سرنوشت نجوا می‌کنند که خون‌بهای سنگینی (هفند) در آن‌سوی دریای غرب چشم‌به‌راه خاندان توست!',
      },
      forge_fafnir_shard_instead: {
        label: 'به پاس تبار ولسونگ، پاره‌ای از پولاد اژدهاکش را در کوره آهنگری به تیغ «نیش فافنیر» بدل کن',
        outcomeText:
          'آتش کوره زبانه می‌کشد و مغزِ پولادینِ تیغ کهن در شمشیر تو دمیده می‌شود؛ شمشیری که به گاه کشیده‌شدن از نیام، چون زنبور زخم برای شکافتن سپرهای انگلستان زوزه می‌کشد!',
      },
      doubt_kraka_legend: {
        label: 'معماهای اسلاگ را افسانه شب‌های زمستان بخوان و به‌جای آن نقره خالص طلب کن',
        outcomeText:
          'چشمان اسلاگ چون یخ آبدره سرد می‌شود. سی سکه نقره به کیسه می‌ریزی، اما دریانوردان پیر زیر لب می‌گویند که بخت و اقبالِ خاندان ولسونگ را از خود راندی.',
        divergenceNote: 'رد کردن پیشگویی و پیراهن بی‌درز ملکه اسلاگ در ساحل اسپانگرید.',
      },
    },
  },
  lothbrok_ch2_seine_silver: {
    title: 'چرخه راگنار لُدبروک (فصل دوم) · ۸۴۵ میلادی: رود سِن غرق در نقره',
    text: 'صد و بیست کشتی اژدهاپیکر به فرماندهی «راگنار لُدبروک» پیچ‌وخم رود سِن را تا پای دیوارهای پاریس سیاه کرده‌اند! در حالی که سپاه فرانک‌ها در دو سوی رود زمین‌گیر شده است، فرستادگان شاه شارل تاس با ترازوهای برنزی پیش می‌آیند و هفت‌هزار پوند نقره و طلای ناب پیشکش می‌کنند تا ناوگان شمال شهر را به آتش نکشد.',
    choices: {
      weigh_paris_danegeld: {
        label: 'تبر را بر شاهین ترازو بکوب: سهم خود از ۷٬۰۰۰ پوند نقره و سپر پولادین «بیورن پهلوآهنین» را برگیر',
        outcomeText:
          'گردونه‌های فرانسوی زیر بار صندوق‌های نقره ناله می‌کنند! در بازگشت با طلایه‌داران بیورن پهلوآهنین، سپر پولادین را بر دوش می‌اندازی و در تالار رجز می‌خوانی که خزانه‌های انگلستان از پاریس هم چرب‌تر است!',
      },
      storm_st_germain_abbey: {
        label: 'به باج آسان بسنده نکن و به صومعه بزرگ سن-ژرمن در حومه پاریس یورش ببر',
        outcomeText:
          'یارانت جام‌های زرکوب و بشکه‌های شراب کهنه را از صومعه به عرشه می‌برند؛ هرچند تبِ رودخانه در راه بازگشت تن چند تن از پاروزنان را می‌لرزاند.',
      },
      warn_against_paris_fever: {
        label: 'جامی به نام ثور بریز و ناوگان را پیش از شیوع بیماری ساحلی به سوی دریای آزاد حرکت بده',
        outcomeText:
          'با خواندن نشانه‌های شوم کلاغ‌ها بر گل‌ولای رود سِن، کشتی‌هایت را به موقع به آب‌های شور دریا می‌رسانی و از بیماری مرگباری که دیگر غارتگران را از پا درآورد در امان می‌مانی.',
        divergenceNote: '۸۴۵ میلادی: نجات طلایه‌داران شمال از بیماری اردوگاه رود سن پس از محاصره پاریس.',
      },
    },
  },
  lothbrok_ch3_last_voyage: {
    title: 'چرخه راگنار لُدبروک (فصل سوم) · آخرین سفر دریایی گراز پیر',
    text: 'در تالار پر از دود، شاعران بیش از خودِ «راگنار لُدبروک» از فتوحات «بیورن پهلوآهنین» و «ایوار بیاستخوان» می‌سرایند. راگنار که نمی‌خواهد از پسرانش عقب بماند، برخلاف هشدارهای ملکه «اسلاگ» فرمان می‌دهد دو کشتی باری عظیم (کِنار) بسازند تا تنها با شماری اندک از یاران، نورثامبریا را فتح کند. اسلاگ هشدار می‌دهد که صخره‌های کم‌عمق انگلستان بدنه کشتی‌های سنگین را درهم خواهد شکست.',
    choices: {
      sail_escort_ormrinn: {
        label: 'با کشتی تندروی «مار دریای شمال» در پی راگنار بران تا بازماندگان را از صخره‌های نورثامبریا برهانی',
        outcomeText:
          'امواج سهمگین دریای شمال دو کشتی عظیم راگنار لُدبروک را بر صخره‌های تیز نورثامبریا متلاشی می‌کند! در حالی که سواران «شاه ائلا» راگنارِ خسته را در ساحل محاصره می‌کنند، کشتی تندروی تو پرچمدار او را از امواج بیرون می‌کشد تا خبر را به پسرانش برساند!',
      },
      counsel_aslaug_caution: {
        label: 'در کنار ملکه اسلاگ بمان و ناوگان جنگی دانمارک را برای روز انتقامِ بزرگ آماده ساز',
        outcomeText:
          'راگنار به هشدارت می‌خندد و در مه دریا ناپدید می‌شود. تو تمام زمستان را صرف ساخت نیزه‌های زبان‌گنجشک، قیرکشی کشتی‌ها و گردآوری جنگجویان می‌کنی؛ زیرا می‌دانی خون، خون را خواهد خواند.',
      },
      beach_beside_ragnar: {
        label: 'کشتی خود را در کنار راگنار لُدبروک به ساحل نورثامبریا بکوب و شانه به شانه او با سپاه ائلا بجنگ!',
        outcomeText:
          'در برابر سپاهی ده‌برابر پرشمارتر، دیوار سپرهای شما تا شکستن آخرین نیزه می‌رزمد! با تنی زخم‌خورده به زورق ماهیگیری کشیده می‌شوی و با چشمان خشمگین می‌بینی کهنگهبانان شاه ائلا، راگنار را در زنجیر می‌برند.',
      },
    },
  },
  lothbrok_ch4_the_pit: {
    title: 'چرخه راگنار لُدبروک (فصل چهارم) · چاه مارهای شاه ائلا و سرود گراز پیر',
    text: 'در نورثامبریا، «شاه ائلا» پادشاه اسیر دریاها را به چاهی سنگی پر از افعی‌های زهرآگین می‌اندازد. نخست هیچ ماری به او نزدیک نمی‌شود — تا آن‌که دژخیمان ائلا پیراهن بی‌درز «اسلاگ» را از تن «راگنار لُدبروک» بیرون می‌کشند. هنگامی که نیش مارها بر سینه‌اش می‌نشیند، راگنار رو به مشعل‌ها می‌خندد و سرود مرگ (کراکومال) سر می‌دهد: «پنجاه و یک بار در چکاچک نیزه‌ها ایستاده‌ام! بچه‌گرازها چه غرشی می‌کردند اگر می‌دانستند گراز پیر چه می‌کشد! والکری‌ها مرا به تالار اودین می‌خوانند — خنده‌کنان جان خواهم داد!»',
    mildText:
      'در نورثامبریا، «شاه ائلا» پس از بیرون کشیدن پیراهن محافظ «اسلاگ»، «راگنار لُدبروک» را به سیاهچال مارها می‌افکند. راگنارِ شکست‌ناپذیر تا آخرین نفس با غرور سرود مرگ می‌خواند: «بچه‌گرازها چه غرشی می‌کردند اگر می‌دانستند گراز پیر چه می‌کشد! والکری‌ها مرا به تالار اودین می‌خوانند — خنده‌کنان به بزم خدایان می‌روم!»',
    choices: {
      carve_krakumal_runes: {
        label: 'واپسین سرود راگنار لُدبروک را بر چوب رونیک بتراش و پیام خونین را به پسرانش برسان',
        outcomeText:
          'تک‌تک واژه‌های سرود مرگِ گراز پیر در جان شمال شعله می‌افکند. در تمام آبدره‌ها از کاتگات تا اوپسالا، شیپورهای جنگ برای ستاندن خون‌بها (هفند) به صدا درمی‌آید!',
      },
      recover_torn_shirt_envoy: {
        label: 'فرستاده هراسان ائلا را وادار کن پیراهن دریده‌شده اسلاگ را به عنوان سند خیانت تحویل دهد',
        outcomeText:
          'با نشان دادن پیراهن زهرآلود راگنار در برابر شورا، دیگر هیچ سرداری یارای انکار تکلیف انتقام را ندارد و دلیران با تبرهای تیز به سپاهت می‌پیوندند.',
      },
    },
  },
  lothbrok_ch5_the_oath: {
    title: 'چرخه راگنار لُدبروک (فصل پنجم) · سوگند خونین بر جام براگارفول',
    text: 'فرستادگان لرزانِ «شاه ائلا» وارد تالار بزرگ لیره می‌شوند، جایی که پسران «راگنار لُدبروک» بر سر خوان نشسته‌اند. هنگامی که جمله «بچه‌گرازها چه غرشی می‌کردند» بر زبان جاری می‌شود: «هویتسرک» مهره شطرنج از عاج گراز دریایی را چنان در مشت می‌فشارد که خرد می‌شود؛ «سیگورد مار-در-چشم» بی‌آنکه مژه بزند کارد را تا استخوان انگشتش فرو می‌برد؛ «بیورن پهلوآهنین» چوب نیزه‌اش را در مشت دو نیم می‌کند؛ و چهره «ایوار بیاستخوان» از خشم سرخ و کبود و سپید می‌گردد و مو به مو جزئیات را می‌پرسد! آنگاه بر فراز شاخ بزرگ «براگارفول»، دختران راگنار «پرچم زاغ سیاه (هرافنزمِرکی)» را می‌گشایند.',
    choices: {
      drink_bragarfull_hefnd: {
        label: 'از شاخ براگارفول بنوش و سوگند انتقام خونین (هفند) علیه شاه ائلا و انگلستان یاد کن!',
        outcomeText:
          'دو کلاغ اودین بر فراز روزنه تالار قارقار می‌کنند و زاغ سیاه بر پرچم بال می‌گشاید! شاخ براگارفول و پرچم زاغ سیاه به دستت می‌افتد و جنگجویان تشنه انتقام گرد درفش تو جمع می‌شوند.',
      },
      counsel_ivar_patience: {
        label: 'با تدبیر سردِ ایوار بیاستخوان همراه شو: نخست از ائلا خون‌بهای نقره بخواه تا نگهبانانش غافلگیر شوند',
        outcomeText:
          'در حالی که دیگران فریاد حرکت فوری سر می‌دهند، تو و ایوار با دریافت نقره، تمام خورها و مصب رودهای انگلستان را پیش از ضربه نهایی شناسایی می‌کنید.',
      },
      refuse_oath_stay_north: {
        label: 'سوگند خون را رد کن و بگو راگنار با دو کشتی خود به استقبال مرگ رفت',
        outcomeText:
          'سکوتی سرد چون برف زمستان بر تالار می‌نشیند. دست بیورن پهلوآهنین به سوی قبضه شمشیر می‌رود و شاعران احتیاط تو را طعنه می‌زنند — هرچند کشتی‌هایت در آب‌های وطن امن می‌مانند.',
        divergenceNote: '۸۶۵ میلادی: خودداری از یاد کردن سوگند براگارفول در کنار پسران راگنار لُدبروک در لیره.',
      },
    },
  },
  lothbrok_ch6_landfall_865: {
    title: 'چرخه راگنار لُدبروک (فصل ششم) · ۸۶۵ میلادی: فرود در ایست آنگلیا و اسبان انتقام',
    text: 'سیصد کشتی اژدهاپیکر سینه بر شن‌های ایست آنگلیا می‌سایند! این یک غارت تابستانی نیست — این «ارتش بزرگ بت‌پرستان» است که برای ستاندن خون‌بهای «راگنار لُدبروک» آمده است. شاه ادموند جوان در ایست آنگلیا فرستادگانی با اسب‌های تندرو و آذوقه زمستانی می‌فرستد تا سپاه پرچم زاغ سیاه به جای سوزاندن ولایت او، چهارنعل به سوی نورثامبریا بتازد.',
    choices: {
      take_edmund_horses_march_north: {
        label: 'جنگجویان هیرد را بر اسب‌های ایست آنگلیا سوار کن و همراه ایوار بیاستخوان و هالفدان به سوی یورک بتاز!',
        outcomeText:
          'سوار بر اسب‌های تازه‌نفس ساکسون، ستون سپرداران تو از جاده سنگ‌فرش رومی به سوی رود هامبر پیش می‌تازد! با نزدیک شدن به مرزهای نورثامبریا، آتش هفند در سینه‌تان زبانه می‌کشد.',
      },
      ivar_oxhide_fort_ruse: {
        label: 'به شیوه ایوار بیاستخوان، پوست گاو را به رشته‌ای باریک ببر و زمینی به وسعت یک دژ مستحکم تصاحب کن',
        outcomeText:
          'اشراف ساکسون با دهان باز می‌نگرند که چگونه با یک رشته چرم، باروی دژ جدیدت را پی می‌ریزی! پیش از آغاز نبرد اصلی، دو مزرعه حاصلخیز در خاک انگلستان به نام دودمانت ثبت می‌شود.',
      },
      plunder_east_anglia_now: {
        label: 'آتش‌بس ایوار را بشکن و همین حالا صومعه‌های ثروتمند ایست آنگلیا را غارت کن',
        outcomeText:
          'دو صندوق پر از شمعدان‌های نقره و جام‌های زرین به چنگ می‌آوری، هرچند ایوار بیاستخوان از شتاب‌زدگی تو در هشیار کردن پادشاهان جنوب ابرو درهم می‌کشد.',
        divergenceNote: '۸۶۵ میلادی: شکستن پیمان اسب‌ها در ایست آنگلیا و غارت زودهنگام صومعه‌های منطقه.',
      },
    },
  },
  lothbrok_ch7_eoforwic_burns: {
    title: 'چرخه راگنار لُدبروک (فصل هفتم) · ۸۶۶ میلادی: شعله‌ها بر فراز یورک (تولد یورویک)',
    text: 'روز اول نوامبر سال ۸۶۶ میلادی. ناقوس کلیساهای «ایوفورویک (یورک)» با وحشت به صدا درمی‌آید، هنگامی که پرچم زاغ سیاه از رود اوز بالا می‌آید! در میانه جنگ داخلی میان شاه اسبرت و غاصب تخت «شاه ائلا»، ارتش بزرگ دیوارهای رومی یورک را تسخیر می‌کند. در بهار سال ۸۶۷، اسبرت و ائلا سپاه خود را متحد می‌کنند و از شکاف دیوار شهر به درون می‌ریزند — بی‌خبر از آن‌که مستقیماً وارد تله مرگبار «ایوار بیاستخوان» و «اوبّا» در کوچه‌های تنگ شهر شده‌اند!',
    choices: {
      spring_york_wall_trap: {
        label: 'حلقه سپرها را پشت شکاف دیوار ببند و با نعره «راگنار لُدبروک!» شاه ائلا را زنده به دام بینداز!',
        outcomeText:
          'چکاچک پولاد بر پولاد در کوچه‌های سنگی یورک طنین می‌اندازد! شاه اسبرت در میانه میدان از پا درمی‌آید، سپاه نورثامبریا تارومار می‌شود و «شاه ائلا» — زندانبان چاه مارها — زنده و در زنجیر به پیشگاه پسران راگنار کشیده می‌شود! یورک از این پس «یورویکِ وایکینگی» است!',
      },
      command_ouse_river_ships: {
        label: 'با لانگ‌شیپ‌های خود رود اوز را ببند تا هیچ‌یک از اشراف نورثامبریا از راه آب نگریزند',
        outcomeText:
          'حتی یک تن از سواران دشمن راه گریز نمی‌یابد! کرجی‌های خزانه سلطنتی نورثامبریا را مصادره می‌کنی و اسکله بزرگ خود را در قلب یورویک بنا می‌نهی.',
      },
    },
  },
  lothbrok_ch8_the_eagle: {
    title: 'چرخه راگنار لُدبروک (فصل هشتم) · ۸۶۷ میلادی: عقاب خونین و فرجام شاه ائلا',
    text: 'در بیرون دروازه‌های دودزده یورویک، «شاه ائلا» فرمانروای نورثامبریا زیر بال‌های لرزانِ پرچم زاغ سیاه در گل‌ولای به زانو درآمده است. «ایوار بیاستخوان» از فراز سپرِ بر دوشِ یارانش خم می‌شود و آرام می‌گوید: «افعی‌های درون چاه سنگ را به یاد بیاور، ائلا، و آنگاه که گراز پیر از غرش بچه‌گرازهایش سرود خواند. امروز پرندگان اودین سیر خواهند شد.» در کنار او، مردی با تبر تیز پیش می‌آید تا نقش عقاب خونین را بر پشت او بتراشد.',
    mildText:
      'در بیرون دروازه‌های دودزده یورویک، «شاه ائلا» فرمانروای نورثامبریا زیر بال‌های پرچم زاغ سیاه به زانو درآمده است. «ایوار بیاستخوان» از فراز سپر خود می‌گوید: «چاه سنگ را به یاد بیاور، ائلا، و سرودی که گراز پیر از فرزندانش خواند.» در حالی که شاعران چکامه عقاب سرخ را می‌خوانند، پسران راگنار آماده اجرای حکم نهایی و ستاندن کامل خون‌بهای پدر (هفند) می‌شوند.',
    choices: {
      fulfill_blood_eagle_hefnd: {
        label: 'در کنار ایوار بیاستخوان بایست و حکم عقاب خونین را به جا آور — خون‌بهای راگنار لُدبروک کامل شد!',
        mildLabel: 'در کنار ایوار بیاستخوان بایست و حکم نهایی چکامه عقاب را اجرا کن — خون‌بهای راگنار لُدبروک کامل شد!',
        outcomeText:
          'زیر آسمان سربی یورک‌شر، نقش عقاب خونین به نام اودین بر جای می‌ماند و غرشِ ده‌هزار جنگجو به آسمان برمی‌خیزد: انتقام خون «راگنار لُدبروک» ستانده شد! بار سنگین هفند به افتخار بدل می‌گردد و لرزه بر اندام شاهان مرسیا و وسکس می‌افتد.',
        mildOutcomeText:
          'زیر آسمان سربی یورک‌شر، با طنین چکامه عقاب سرخ، شاه ائلا به سزای چاه مارها می‌رسد و غرشِ ده‌هزار جنگجو برمی‌خیزد: انتقام خون «راگنار لُدبروک» ستانده شد! بار سنگین هفند به افتخار بدل می‌گردد و نامت لرزه بر دل شاهان انگلستان می‌اندازد.',
      },
      grant_clean_sword_stroke: {
        label: 'پیش قدم شو و با یک ضربه سریع شمشیر، به شاه ائلا مرگی درخور یک پادشاه بده',
        outcomeText:
          'برخلاف آیین هولناک ایوار، تیغ تو در یک چشم‌به‌هم‌زدن کار ائلا را تمام می‌کند. هالفدان زیر لب غرولند می‌کند، اما بیورن پهلوآهنین سر تکان می‌دهد: «بدهی گراز پیر به هر روی پرداخت شد.» وقایع‌نگاران ساکسون از جوانمردی تو در شگفت می‌مانند.',
        divergenceNote: '۸۶۷ میلادی: کشتن شاه ائلا با یک ضربه شمشیر در یورک به جای اجرای آیین عقاب خونین.',
      },
      ransom_aella_crown_divergent: {
        label: 'ائلا را زنده بگذار تا در ازای ۲٬۰۰۰ پوند نقره، به عنوان شاه دست‌نشانده برایت خراج جمع کند!',
        outcomeText:
          'برخلاف تمام پیشگویی‌های حماسه، ائلای شکسته و وحشت‌زده را چون خراجگزاری مطیع بر تخت نگه می‌داری! برادران از ریخته‌نشدن خون او خشمگین می‌شوند، اما سیلی از سکه‌های نقره نورثامبریا به خزانه‌ات سرازیر می‌گردد.',
        divergenceNote: '۸۶۷ میلادی: بخشیدن جان شاه ائلا در یورک و تبدیل او به شاه دست‌نشانده و خراجگزار.',
      },
    },
  },
  lothbrok_ch9_edmund_alfred_cost: {
    title: 'چرخه راگنار لُدبروک (فصل نهم) · تیرهای شاه ادموند، آلفرد و کارنامه انتقام',
    text: 'آتشِ انتقام سه پادشاهی را بلعیده است. در سال ۸۶۹ میلادی، شاه ادموند در ایست آنگلیا حاضر نمی‌شود دست از آیین خود بکشد یا دست‌نشانده «ایوار بیاستخوان» گردد و بسته به درخت بلوط، آماج تیرهای کمانداران وایکینگ می‌شود. شاه بورگرد از مرسیا در برابر اردوگاه بزرگ رپتون به رم می‌گریزد — اما در تپه‌های گچی وسکس و مرداب‌های اتلنی، شاه جوان «آلفرد» سر فرود نمی‌آورد. اکنون که پسران راگنار سرزمین‌های فتح‌شده را تقسیم می‌کنند، تو چه پایانی بر دفتر «چرخه راگنار لُدبروک» می‌نویسی؟',
    mildText:
      'توفان انتقام نقشه انگلستان را دگرگون کرده است. شاه ادموند در سال ۸۶۹ در ایست آنگلیا سقوط می‌کند و شاه مرسیا در برابر اردوگاه بزرگ رپتون به رم می‌گریزد — اما در جنوب، شاه جوان «آلفرد» در وسکس مقاومت می‌کند. اکنون که پسران راگنار دشت‌های «دانلو» را تقسیم می‌کنند، چه سرنوشتی برای دودمان خود رقم می‌زنی؟',
    choices: {
      carve_danelaw_jarldom: {
        label: 'همراه هالفدان زمین‌های حاصلخیز «دانلو» را تقسیم کن و فرمانروای ماندگار انگلستان شو',
        outcomeText:
          'با پیمودن دره‌های سرسبز یورک‌شر و مرسیا، جنگجویانت سپرهای دریایی را بر دیوار تالارهای نو می‌آویزند. از دل چاه مارهای راگنار، پادشاهی پرشکوه دانمارکی-انگلیسی سر برمی‌آورد!',
      },
      sail_dublin_ui_imair: {
        label: 'در مسیر دریایی ایوار بیاستخوان به «دوبلین» بران و سلسله «اوی ایمار» را بر دو سوی دریای ایرلند حاکم کن',
        outcomeText:
          'با پیوند زدن یورویک و دوبلین در دو سوی دریای ایرلند، اژدهاکشتی‌های تو بر هر دو پادشاهی فرمان می‌رانند! سالنامه‌نویسان ایرلند و انگلستان یک‌صدا شکوه دودمان ایوار و راگنار را ثبت می‌کنند.',
      },
      swear_never_ending_hefnd_wessex: {
        label: 'هرگونه صلح با آلفرد را رد کن و سوگند بخور که پرچم زاغ سیاه تا فتح وینچستر آرام نگیرد!',
        outcomeText:
          'در حالی که دیگران نیزه‌ها را به گاوآهن بدل می‌کنند، تو بار دیگر شاخ براگارفول را بالا می‌بری! کرانه‌های تیمز در آتش می‌سوزد و نبرد خونین تبار راگنار لُدبروک نسل به نسل ادامه می‌یابد!',
        divergenceNote: '۸۷۸ میلادی: رد کردن مرزهای صلح دانلو و ادامه جنگ بی‌پایان خاندان راگنار علیه وسکسِ آلفرد کبیر.',
      },
    },
  },

  // Signature Events FA
  sig_ivar_shield_council: {
    title: 'حماسه ویژه ایوار بیاستخوان · فرماندهی از فراز سپر جنگی',
    text: 'چهار تن از بلندقدترین محافظان، سپر بزرگ بلوطی تو را بر دوش خود بالای همهمه دیوار سپرها نگه داشته‌اند. در پایین، جنگجویان پیر زیر لب می‌گویند مردی که استخوان پاهایش یارای راه رفتن ندارد چگونه می‌خواهد خط مقدم را بشکند — تا آن‌که تو با کمانِ زهگشوده‌ات به گذرگاهی پنهان در مردابِ پشت جبهه ساکسون‌ها اشاره می‌کنی که از چشم همه ناخدایان پنهان مانده بود.',
    choices: {
      direct_shield_envelopment: {
        label: 'از فراز سپر، فرمان محاصره دوطرفه خاموش را صادر کن و با یک تیر علامت بده',
        outcomeText:
          'تله تو چون آرواره گرگ بسته می‌شود! دیگر هیچ جنگجویی به پاهای تو نمی‌نگرد؛ همه سوگند می‌خورند که ذهن «ایوار بیاستخوان» میدان رزم را همچون اودین از فراز تخت هليدسكيالف می‌بیند.',
      },
      draw_great_yew_bow: {
        label: 'بر لبه سپر تکیه بده و کمان سنگینی را بکش که هیچ مرد عادی یارای خم کردنش را ندارد',
        outcomeText:
          'با بازوان پولادین، سه تیر پرعقابی را پیاپی از زره پرچمدار دشمن می‌گذرانی و فریاد تحسین سپاه به آسمان می‌رود!',
      },
    },
  },
  sig_bjorn_luna_coffin: {
    title: 'حماسه ویژه بیورن پهلوآهنین · تابوت در برابر دروازه‌های مرمرین لونا',
    text: 'برج‌های مرمر سفید شهر «لونا» در ساحل ایتالیا چنان درخشان‌اند که دیده‌بانانت گمان می‌کنند به خودِ شهر رم رسیده‌اید! دروازه‌ها با آهن بسته شده است، اما پدرخوانده‌ات هاستین لبخندی مکارانه می‌زند: «بیایید به اسقف شهر پیغام بفرستیم که سردار ما در دریا غسل تعمید گرفته و اکنون جان سپرده است، و تنها خواهان خاکسپاری در کلیسای جامع است — در حالی که یارانش تابوت سنگین او را بر دوش می‌آورند!»',
    choices: {
      leap_from_bier_luna: {
        label: 'با شمشیرهای برهنه زیر ردا در تابوت بخواب و در پای محراب ناگهان بیرون بجه!',
        outcomeText:
          'هنگامی که اسقف عودسوز را تکان می‌دهد، با نعره‌ای رعدآسا درِ تابوت را می‌شکنی! دروازه‌های شهر از درون گشوده می‌شود و کشتی‌هایت پر از ابریشم و نقره مدیترانه می‌گردد.',
      },
      ransom_bishop_honestly: {
        label: 'نیرنگ تابوت را کنار بگذار و با سینه کشتی‌های جنگی زنجیر بندرگاه را در هم بشکن',
        outcomeText:
          'با تکیه بر رویین‌تنی خود («پهلوآهنین»)، در دماغه کشتی زیر باران سنگ می‌ایستی و شهر مرمرین را وادار به پرداخت خراج سنگین می‌کنی!',
      },
    },
  },
  sig_halfdan_tyne_plough: {
    title: 'حماسه ویژه هالفدان · شمشیر و طناب زمین‌پیما در نورثامبریا',
    text: 'در کرانه‌های رود تاین و اوز، پاروزنان کهنه‌کار خواهان سهم زمین‌های وعده‌داده‌شده هستند و اشراف ساکسون از پشت پرچین‌ها با کینه می‌نگرند. به عنوان شاه جنگیِ سپاه شمال، در یک دست طناب قیراندودِ زمین‌پیما داری و در دست دیگر شمشیری دندانه‌دار.',
    choices: {
      parcel_wapentake_farms: {
        label: 'برای هر جنگجو سنگ مرزی بنشان و قوانین دانمارکی را در سراسر یورک‌شر برقرار کن',
        outcomeText:
          'پاروزنان پیر با اشک شوق گاوآهن‌ها را در خاک حاصلخیز انگلستان می‌رانند. شمار مزارع، انبار غله و خراج نقره قلمرو تو دو برابر می‌شود.',
      },
      march_strathclyde_picts: {
        label: 'کشاورزان را به شخم‌زدن بگذار و خود با زبده‌ترین سپرداران به سوی پیکت‌ها و اسکاتلند بتاز',
        outcomeText:
          'درفش‌های تو از دیوار کهن هادریان می‌گذرد و شاهان شمال با گله‌های گاو و نقره خراج می‌دهند.',
      },
    },
  },
  sig_ubba_frisian_fury: {
    title: 'حماسه ویژه اوبّا · طلسم گرگ‌پوشان در سپیده‌دم ساحل',
    text: 'پیش از بالا آمدن مد سحرگاهی، پوستین گرگ بر زره می‌پوشی و چوب‌های فندقِ منقش به رون را بر ساحل سرخ می‌کنی. دو زاغ سیاه بر فراز دکل چرخ می‌زنند و شیپورهای ساکسون بر فراز تپه به صدا درمی‌آید.',
    choices: {
      howl_ulfhednar_charge: {
        label: 'لبه آهنی سپر را به دندان بگیر و گرگ‌پوشان (اولف‌هدنار) را مستقیم به قلب سپاه دشمن ببر!',
        outcomeText:
          'همه سوگند می‌خورند که نیزه‌ها همچون نی از روی پوستین گرگ تو کمانه می‌کنند! صف ساکسون‌ها از نعره هولناک «اوبّا» در هم می‌شکند.',
      },
      read_raven_flight_omen: {
        label: 'مسیر پرواز زاغ‌ها را بخوان و از خور پنهان جزرومدی، دژ تپه را دور بزن',
        outcomeText:
          'به‌جای دویدن به سوی تله سنگ‌اندازها بر فراز تپه، کشتی‌هایت از پشت خاکریز سر درمی‌آورند و صندوق نقره سردار دشمن را دست‌نخورده تصاحب می‌کنند.',
      },
    },
  },
  sig_sigurd_ouroboros_eye: {
    title: 'حماسه ویژه سیگورد مار-در-چشم · درخشش حلقه افعی در مردمک چشم',
    text: 'در شورای بزرگ شیلند و اسکونه، یکی از مدعیان مغرور دانمارکی جرئت می‌کند در تبار پسران «راگنار لُدبروک» تردید کند. تو در پرتو آفتابِ کنار تخت شاهی گام پیش می‌گذاری و مستقیم در چشمانش خیره می‌شوی — تا حلقه روشنِ ماری که دمش را به دندان گرفته در مردمک چشمت بدرخشد و دستت بر قبضه تیغ ولسونگ بنشیند.',
    choices: {
      draw_volsung_blade_acclaim: {
        label: 'تیغ «نیش فافنیر» را به اندازه یک بند انگشت از نیام بکش و سوگند وفاداری همه یارل‌ها را بخواه',
        outcomeText:
          'مدعی با رنگی پریده چون خاکستر بر زانو می‌افتد! در دو سوی تنگه دانمارک، سرداران شمشیر بر سپر می‌کوبند و وارث راستین سیگورد و راگنار را می‌ستایند.',
      },
      challenge_claimant_holmgang: {
        label: 'چوب‌های فندق را بر زمین بکوب و او را بی‌درنگ به دوئل خونین هولم‌گانگ بخوان!',
        outcomeText:
          'دو ضربه از پولاد ولسونگ سپر او را تا قبضه دو نیم می‌کند! کشتی و املاک او به حکم قانون دوئل از آنِ تو می‌شود.',
      },
    },
  },
  sig_hvitserk_burning_pyre: {
    title: 'حماسه ویژه هویتسرک · پیراهن سپید در توفان سرخ',
    text: 'مه از روی پیچ باریک رودخانه کنار می‌رود و سه سپاه دشمن در دو ساحل به همراه زنجیرهای آهنیِ کشیده‌شده بر آب نمایان می‌شوند! دیده‌بان کشتی رنگ می‌بازد و می‌پرسد آیا پرچم را پایین بکشیم و امان بخواهیم؟ تو با خنده‌ای بلند کمربند را بر پیراهن رزمی سپید و خون‌آلودت محکم‌تر می‌بندی.',
    choices: {
      cleave_river_chain_vanguard: {
        label: 'با تمام توان پارو بزنید تا دماغه اژدهاپیکر کشتی زنجیر آهنی رودخانه را بترکاند!',
        outcomeText:
          'رقص جرقه‌ها بر آب برمی‌خیزد و زنجیر آهنی چون ریسمان پوسیده پاره می‌شود! برخلاف فرجام تلخ افسانه‌ها، طلایه‌داران «هویتسرک» حلقه محاصره را می‌شکافند و با صندوق‌های درهم و نقره بیرون می‌زنند!',
        divergenceNote: 'شکستن حلقه محاصره‌ای که در روایت افسانه‌ها به مرگ هویتسرک انجامیده بود.',
      },
      stack_shield_fort_pyre: {
        label: 'کشتی‌ها را به ساحل بکوب، از سپرها سنگر بساز و شاه دشمن را به نبرد تن‌به‌تن بخوان!',
        outcomeText:
          'شاهزاده دشمن که از خنده بی‌پروای تو در کام مرگ مبهوت شده است، کماندارانش را متوقف می‌کند، بازوبند زرین با تو ردوبدل می‌سازد و راه رودخانه را به احترام شجاعتت می‌گشاید!',
      },
    },
  },
  sig_lagertha_shieldmaiden_wing: {
    title: 'حماسه ویژه لاگرتا · جناح پرنده بانوان سپردار',
    text: 'در دره باریک گائولار، یارلِ غاصب و جاه‌طلب دیوار سپرهای میانی تو را گام‌به‌گام به عقب می‌راند. ناخدایان مرد فریاد عقب‌نشینی به سوی قایق‌ها سر می‌دهند — اما سی تن از بانوان سپردار برگزیده‌ات با گیسوان افشان زیر کلاهخود و نیزه‌های افراشته، پنهان در پشت تپه توسکا منتظر فرمان تو هستند.',
    choices: {
      sweep_rear_shieldmaidens: {
        label: 'جناح بانوان سپردار را چون تندباد از فراز تپه به پشت جبهه بی‌دفاع دشمن هدایت کن!',
        outcomeText:
          'همچون والکری‌های فرودآمده از دل ابرها، یورش نیزه‌داران تو صف دشمن را از پشت متلاشی می‌کند! غاصب بی‌سلاح می‌گریزد و تمام آزادمردان آبدره در برابر تخت فرمانروایی «لاگرتا» سر تعظیم فرود می‌آورند.',
      },
      bind_hound_and_bear_hall: {
        label: 'سردار رقیب را به حیاط تالار بکشان؛ جایی که خرس و سگ شکاریِ زنجیرشده نگهبان درگاه‌اند',
        outcomeText:
          'درست همانند روایت ساکسو گراماتیکوس، نگهبانان درنده‌ی درگاهت محافظان او را تارومار می‌کنند و نیزه تو کار را تمام می‌سازد! فرمانروایی مستقل تو در نروژ تثبیت می‌شود.',
      },
    },
  },
  sig_aslaug_kraka_prophecy: {
    title: 'حماسه ویژه ملکه اسلاگ · چنگ هیمیر و کارگاه سرنوشت (ویرد)',
    text: 'در کنار اخگرهای سرخِ تالار، نهانگاه زرکوبِ چنگ چوبیِ پدرخوانده‌ات «هیمیر» را می‌گشایی؛ همان چنگی که در کودکی تو را در دل آن پنهان کرده بود. در درونش حریرهای زردوزی‌شده ولسونگ و چوب‌های رون قرار دارد. هنگامی که پسران و ناخدایان می‌پرسند بادبان‌ها را به کدام سو بکشند، دیده پیشگوی تو مه دریاهای انگلستان و بالتیک را می‌شکافد.',
    choices: {
      weave_hrafnsmerki_prophecy: {
        label: 'افسون کهن ولسونگ را بخوان و «پرچم زاغ سیاه (هرافنزمِرکی)» را برای هدایت بخت ناوگان بباف',
        outcomeText:
          'با گره خوردن آخرین تار سیاه، زاغِ بافته‌شده بر پارچه بی‌آن‌که نسیمی در تالار بوزد بال می‌گشاید! جنگجویان با شگفتی زانو می‌زنند و بخت خاندانت بر سه دریا می‌درخشد.',
      },
      invoke_randalin_shield_march: {
        label: 'جامه رزم بپوش و با نام حماسی «راندالین» خود پیشاپیش سپاه بر یخ‌ها بتاز!',
        outcomeText:
          'درست همچون روزی که با نام راندالین برای انتقام به سوئد لشکر کشیدی، حضور تو در پیشانی سپاه هر ناخدای مرددی را به شجاعتی بی‌امان وامی‌دارد!',
      },
    },
  },
  lothbrok_false_claimant_thing: {
    title: 'مدعی دروغین خونِ راگنار لُدبروک در شورای ثینگ',
    text: 'در شورای بزرگ ثینگ، یارلِ نوکیسه‌ای به نام «کتیل ریش‌زرین» با شمشیری تقلبی بر صخره قانون ایستاده و به دروغ ادعا می‌کند که از نسل «بیورن پهلوآهنین» و «راگنار لُدبروک» است تا پاروزنان و سهم غنایم انگلستان را به سوی خود بکشد!',
    choices: {
      expose_false_genealogy_skald: {
        label: 'شجره‌نامه راستین ولسونگ و راگنار را به شعر بخوان و فاش کن که پدربزرگش نمک‌پز بوده است!',
        outcomeText:
          'هنگامی که کتیل حتی نمی‌تواند نام پدرخوانده اسلاگ را بگوید، شلیک خنده دشت شورا را می‌لرزاند! او از شرمساری چهل سکه نقره غرامت می‌دهد و شش تن از زبده‌ترین جنگجویانش به هیرد تو می‌پیوندند.',
      },
      exploit_claimant_vassal: {
        label: 'در خیمه خصوصی با او معامله کن: در ازای خراج نقره و یک کشتی جنگی، «خویشاوندی» او را تأیید کن',
        outcomeText:
          'سیاست زیرکانه بر تعصب پیروز می‌شود! کتیلِ سپاسگزار شصت سکه نقره وزن می‌کند و یک لانگ‌شیپ مجهز در اختیار لشکرکشی‌های انگلستان تو می‌گذارد.',
      },
      answer_false_claim_steel: {
        label: 'شمشیر تقلبی را از دستش بپران و همین حالا او را به دوئل هولم‌گانگ بخوان!',
        outcomeText:
          'خون گرگ در رگ‌هایت به جوش می‌آید! در ضربه سوم تیغ تقلبی او را می‌شکنی و بازوبندهای نقره‌اش را در برابر دیدگان شورا مصادره می‌کنی.',
      },
    },
  },
  lothbrok_ui_imair_legacy: {
    title: 'میراث نوادگان ایوار (اوی ایمار) · دو تختگاه دوبلین و یورویک',
    text: 'فرستادگان فرمانروایان نورس-گیلیکِ دوبلین — که خود را «اوی ایمار» (نوادگان ایوار بیاستخوان) می‌خوانند — با کشتی اژدهاپیکری به رنگ سیاه و زرین لنگر می‌اندازند. خویشاوندان «سیگتریگ» و «راگنال» با دیدن نشان خون راگنار در تالار تو، پیشنهاد پیمانی بزرگ می‌دهند تا دوبلین، جزیره من و یورویک زیر یک پرچم متحد شوند و خون‌بهای کهن (هفند) را از تاج ساکسون بستانند.',
    choices: {
      seal_ui_imair_axis: {
        label: 'پیمان دریایی «اوی ایمار» را ببند و فرمانروایی مشترک دریای ایرلند و یورک‌شر را برپا کن!',
        outcomeText:
          'سکه‌های نقره با نقش زاغ و شمشیر از دوبلین تا یورویک دست‌به‌دست می‌شود! شبکه تجاری، شمار جنگجویان و آوازه دودمانت در سراسر جزایر بریتانیا اوج می‌گیرد.',
      },
      demand_sole_headship_ragnar: {
        label: 'شاخه خود را سرور ارشد خاندان راگنار لُدبروک اعلام کن و از آنان خراج و کشتی بخواه',
        outcomeText:
          'ناخدایان دوبلین در برابر یادگارهای اسطوره‌ای و شهرت رزمی تو سر فرود می‌آورند و چهل سکه نقره و یک کشتی جنگی به ناوگانت می‌سپارند.',
      },
    },
  },
};

// ==========================================
// 7. ENGLISH VENGEANCE RAID & SIEGE FLAVOR POOLS
// ==========================================

export const ENGLISH_SETTLEMENT_IDS = new Set<string>([
  'lindisfarne',
  'jorvik',
  'repton',
  'london',
  'winchester',
  'maldon',
]);

export function isEnglishSettlement(settlementId: string): boolean {
  return ENGLISH_SETTLEMENT_IDS.has(settlementId);
}

export interface EnglishDefenderFlavor {
  commanderEn: string;
  commanderFa: string;
  bannerDescEn: string;
  bannerDescFa: string;
  warCryEn: string;
  warCryFa: string;
  chroniclerLineEn: string;
  chroniclerLineFa: string;
  ragnarsNameMomentEn: string;
  ragnarsNameMomentFa: string;
  wyrdTurnsDefeatEn: string;
  wyrdTurnsDefeatFa: string;
}

const ENGLISH_DEFENDERS_BY_SETTLEMENT: Record<string, EnglishDefenderFlavor[]> = {
  lindisfarne: [
    {
      commanderEn: 'Abbot Eadwulf & Ealdorman Osric of Bamburgh',
      commanderFa: 'راهب بزرگ ادوولف و الدرمن اسریک از بامبورو',
      bannerDescEn: 'Beneath Hrafnsmerki — the fluttering black Raven Banner of Ragnar’s daughters',
      bannerDescFa: 'زیر سایه پرچم زاغ سیاه (هرافنزمِرکی) بافته دست دختران راگنار لُدبروک',
      warCryEn: '"For the Old Boar in the pit! Feed the wound-gulls!"',
      warCryFa: '«به خونخواه گراز پیر در چاه مارها! زاغ‌های اودین را سیر کنید!»',
      chroniclerLineEn:
        'Northumbrian clerks write in trembling Latin: "The whelps of Lothbrok have returned upon the whale-road to exact their father’s blood-geld."',
      chroniclerLineFa:
        'کاهنان نورثامبریا با دست لرزان نوشتند: «توله‌گرگ‌های راگنار لُدبروک از راه نهنگ بازگشته‌اند تا خون‌بهای پدرشان را بستانند.»',
      ragnarsNameMomentEn:
        'RAGNAR’S NAME: Spotting the wolf-and-serpent standard on your prow, the coastal watchmen drop their spears crying that Ragnar’s avengers have come!',
      ragnarsNameMomentFa:
        'بانگ نام راگنار: نگهبانان ساحلی با دیدن درفش گرگ و افعی بر دماغه کشتی، نیزه‌ها را انداختند و فریاد زدند منتقمان راگنار لُدبروک رسیده‌اند!',
      wyrdTurnsDefeatEn:
        'THE WYRD TURNS: The woven raven on your banner drooped its wings in the salt wind as Northumbrian horsemen held the tidal causeway.',
      wyrdTurnsDefeatFa:
        'چرخش تار سرنوشت: زاغ سیاه بر پرچم در باد شور دریا بال‌هایش فرو افتاد و سواران نورثامبریا گذرگاه ساحلی را حفظ کردند.',
    },
  ],
  jorvik: [
    {
      commanderEn: 'King Ælla & King Osberht of Northumbria',
      commanderFa: 'شاه ائلا و شاه اسبرت، فرمانروایان نورثامبریا',
      bannerDescEn: 'Raising the wolf-and-serpent standard alongside the black Raven Banner',
      bannerDescFa: 'با برافراشتن درفش گرگ و مار در کنار پرچم زاغ سیاه',
      warCryEn: '"How the young boars grunt! Remember Ælla’s vipers!"',
      warCryFa: '«بشنوید غرش بچه‌گرازها را! چاه افعی‌های شاه ائلا را به یاد آورید!»',
      chroniclerLineEn:
        'Simeon of Durham records: "An immense pagan host, driven by the blood-feud of Lothbrok, turned Eoforwic’s Roman stones red."',
      chroniclerLineFa:
        'وقایع‌نگار دورهام نوشت: «سپاهی عظیم به کین‌خواهی خون راگنار لُدبروک، سنگ‌های رومی یورک را سرخ فام ساخت.»',
      ragnarsNameMomentEn:
        'RAGNAR’S NAME: When your champions roar "Lothbrok!" at the Roman gate, King Ælla’s levy wavers in dread of the snake-pit’s curse!',
      ragnarsNameMomentFa:
        'بانگ نام راگنار: هنگامی که پهلوانانت در پای دروازه رومی نعره «راگنار لُدبروک!» سر دادند، لرزه بر ستون سپاه شاه ائلا افتاد!',
      wyrdTurnsDefeatEn:
        'THE WYRD TURNS: Hugin and Munin wheeled away into the smoke as York’s Roman bastions held fast; the blood-debt still gnaws at your hall.',
      wyrdTurnsDefeatFa:
        'چرخش تار سرنوشت: کلاغ‌های اودین در دود نبرد ناپدید شدند و باروهای رومی یورک پایدار ماند؛ بدهی خون (هفند) همچنان بر دوشتان سنگینی می‌کند.',
    },
  ],
  repton: [
    {
      commanderEn: 'King Burgred of Mercia & Ealdorman Algar',
      commanderFa: 'شاه بورگرد فرمانروای مرسیا و الدرمن آلگار',
      bannerDescEn: 'Unfurling Hrafnsmerki above the Trent river-mists',
      bannerDescFa: 'با گشودن پرچم زاغ سیاه بر فراز مه‌های رود ترنت',
      warCryEn: '"Hefnd for Ragnarsættin! Cleave the Mercian dragon!"',
      warCryFa: '«هفند برای تبار راگنار لُدبروک! سپرهای مرسیا را بشکافید!»',
      chroniclerLineEn:
        'The Mercian Register laments: "Ivar and Halfdan’s kin wintered at Repton over Saint Wystan’s crypt and broke King Burgred’s realm."',
      chroniclerLineFa:
        'سالنامه مرسیا مویه سر داد: «تبار ایوار بیاستخوان و هالفدان در رپتون اردو زدند و تخت شاه بورگرد را در هم شکستند.»',
      ragnarsNameMomentEn:
        'RAGNAR’S NAME: At the sight of the Raven Banner’s outspread wings, Mercian thegns whisper that no wall can stand against Ragnar’s bloodline!',
      ragnarsNameMomentFa:
        'بانگ نام راگنار: با دیدن بال‌های گشوده زاغ سیاه، بزرگان مرسیا نجوا کردند که هیچ بارویی یارای ایستادگی در برابر خون راگنار را ندارد!',
      wyrdTurnsDefeatEn:
        'THE WYRD TURNS: The Norns knotted the thread along the Trent; Mercian shield-men held the river-ford and your Hefnd remains unpaid.',
      wyrdTurnsDefeatFa:
        'چرخش تار سرنوشت: نورن‌ها رشته بخت را در گذرگاه رود ترنت گره زدند و سپرداران مرسیا خط را نگه داشتند.',
    },
  ],
  london: [
    {
      commanderEn: 'King Edmund of East Anglia & Ealdorman Æthelred of London',
      commanderFa: 'شاه ادموند و الدرمن اتلرد، نگهبانان لندن و شرق',
      bannerDescEn: 'Rowing up the Thames under the spread wings of Hrafnsmerki',
      bannerDescFa: 'با پارو زدن در رود تیمز زیر بال‌های گشوده پرچم زاغ سیاه',
      warCryEn: '"Odin owns the fallen! Blood-geld for Ragnar Lothbrok!"',
      warCryFa: '«کشتگان از آنِ اودین‌اند! خون‌بهای راگنار لُدبروک را بستانید!»',
      chroniclerLineEn:
        'The Anglo-Saxon Chronicle records: "Here the army of the sons of Lothbrok rowed up the Thames to Lundenburh and took winter-tribute."',
      chroniclerLineFa:
        'سالنامه آنگلوساکسون نوشت: «در این سال سپاه فرزندان راگنار لُدبروک از رود تیمز به لندن راندند و باج سنگین ستاندند.»',
      ragnarsNameMomentEn:
        'RAGNAR’S NAME: The garrison on London’s Roman bridge recognizes the serpent-prow of Ragnarsættin and yields the river-chains in terror!',
      ragnarsNameMomentFa:
        'بانگ نام راگنار: نگهبانان پل رومی لندن با شناختن دماغه افعی‌نشانِ خاندان راگنار، از ترس زنجیرهای رودخانه را رها کردند!',
      wyrdTurnsDefeatEn:
        'THE WYRD TURNS: Arrow-storm from London’s bridge forced your dragon-prows back on the ebb-tide; skalds mutter that the Old Boar still waits.',
      wyrdTurnsDefeatFa:
        'چرخش تار سرنوشت: باران تیر از پل لندن اژدهاکشتی‌ها را با جزر آب به عقب راند؛ شاعران می‌گویند روح گراز پیر هنوز چشم‌به‌راه است.',
    },
  ],
  winchester: [
    {
      commanderEn: 'King Æthelred & Prince Alfred of Wessex',
      commanderFa: 'شاه اتلرد و شاهزاده آلفرد از وسکس',
      bannerDescEn: 'Bearing the Raven Banner against the Golden Dragon of Wessex',
      bannerDescFa: 'برافراشتن پرچم زاغ سیاه در برابر اژدهای زرین وسکس',
      warCryEn: '"Strike for Ivar, Björn, and Ragnar! Break the West Saxon fyrd!"',
      warCryFa: '«به نام ایوار بیاستخوان، بیورن پهلوآهنین و راگنار! صف وسکس را بشکنید!»',
      chroniclerLineEn:
        'Bishop Asser writes in his Life of Alfred: "Like wolves hungry for carrion, the heathens of Lothbrok’s race pressed Wessex to the very edge of ruin."',
      chroniclerLineFa:
        'اسقف آسر در زندگی‌نامه آلفرد نوشت: «همچون گرگ‌های خشمگین، جنگجویان تبار لُدبروک پادشاهی وسکس را تا لبه پرتگاه بردند.»',
      ragnarsNameMomentEn:
        'RAGNAR’S NAME: Even Alfred’s household hearth-troop falls back a pace as your skald chants the death-song of Ragnar before the shield-wall!',
      ragnarsNameMomentFa:
        'بانگ نام راگنار: حتی محافظان ویژه آلفرد با شنیدن سرود مرگ راگنار لُدبروک از زبان اسکالدِ سپاهت، یک گام به عقب برداشتند!',
      wyrdTurnsDefeatEn:
        'THE WYRD TURNS: Alfred’s boar-snout counter-charge held the chalk ridge of Wessex; the Raven Banner’s wings hung heavy with rain.',
      wyrdTurnsDefeatFa:
        'چرخش تار سرنوشت: ضدحمله سپاه آلفرد بر تپه‌های گچی وسکس خط را نگه داشت و بال‌های پرچم زاغ سیاه زیر باران فرو افتاد.',
    },
  ],
  maldon: [
    {
      commanderEn: 'King Edmund of East Anglia & Ealdorman Ulfcytel of the East Angles',
      commanderFa: 'شاه ادموند از ایست آنگلیا و الدرمن اولف‌سیتل',
      bannerDescEn: 'Advancing across the salt-causeway beneath the wolf-and-serpent standard',
      bannerDescFa: 'با پیشروی بر گذرگاه جزرومدی زیر درفش گرگ و افعی',
      warCryEn: '"The whale-road brings Hefnd! Remember the snake-pit!"',
      warCryFa: '«راه نهنگ انتقام آورده است! چاه مارها را به یاد آورید!»',
      chroniclerLineEn:
        'East Anglian monks write: "No stone church between the Wash and the Blackwater escaped the wrath of Ragnar’s avengers."',
      chroniclerLineFa:
        'راهبان ایست آنگلیا نوشتند: «هیچ کلیسای سنگی در کرانه شرقی از خشم منتقمان راگنار لُدبروک در امان نماند.»',
      ragnarsNameMomentEn:
        'RAGNAR’S NAME: Hearing the war-horns of Ragnarsættin across the salt-marsh, the shire-reeves rush out with chests of gafol silver!',
      ragnarsNameMomentFa:
        'بانگ نام راگنار: با پیچیدن صدای شیپورهای خاندان راگنار در مرداب‌های نمکزار، کلانتران شهر با صندوق‌های نقره تسلیم شدند!',
      wyrdTurnsDefeatEn:
        'THE WYRD TURNS: Rising tide and East Anglian ash-spears barred the causeway; your oarsmen rowed out swearing darker Hefnd next summer.',
      wyrdTurnsDefeatFa:
        'چرخش تار سرنوشت: بالا آمدن مد دریا و نیزه‌داران ایست آنگلیا راه گذرگاه را بستند؛ پاروزنان با سوگند انتقام در تابستان بعد عقب نشستند.',
    },
  ],
};

export function getEnglishDefenderFlavor(
  settlementId: string,
  yearOrRng?: number | SeededRNG,
  maybeRng?: SeededRNG
): EnglishDefenderFlavor & { defenderEn: string; defenderFa: string } {
  const rng =
    maybeRng ??
    (typeof yearOrRng === 'object' && yearOrRng !== null
      ? yearOrRng
      : new SeededRNG(hashSeedString(`${settlementId}-${yearOrRng ?? 865}`)));
  const pool =
    ENGLISH_DEFENDERS_BY_SETTLEMENT[settlementId] ??
    ENGLISH_DEFENDERS_BY_SETTLEMENT['jorvik'];
  const picked = rng.pick(pool);
  return {
    ...picked,
    defenderEn: picked.commanderEn,
    defenderFa: picked.commanderFa,
  };
}

export function hasLothbrokVengeanceActive(state: {
  ragnarBloodline?: boolean;
  hefndMeter?: number;
  flags: string[];
  character: { traits: string[] };
}): boolean {
  return Boolean(
    state.ragnarBloodline ||
      (state.hefndMeter ?? 0) > 0 ||
      state.character.traits.includes('wolf_blood') ||
      state.flags.includes('ragnar_blood_active') ||
      state.flags.includes('swore_bragarfull_hefnd') ||
      state.flags.includes('joined_great_army')
  );
}

export function calculateLothbrokEnglishRaidModifiers(
  state: {
    ragnarBloodline?: boolean;
    hefndMeter?: number;
    heirlooms?: string[];
    flags: string[];
    character: { traits: string[] };
  },
  targetSettlementId?: string,
  rng?: SeededRNG
): {
  active: boolean;
  combatBonus: number;
  lootMultiplier: number;
  fameMultiplier: number;
  hefndDeltaOnWin: number;
  hefndDeltaOnLoss: number;
  warCryEn: string;
  warCryFa: string;
  bannerDescEn: string;
  bannerDescFa: string;
  combatPowerBonus: number;
  fameBonusPct: number;
  lootBonusPct: number;
  hefndSatisfied: number;
  activeLabelsEn: string[];
  activeLabelsFa: string[];
} {
  let combatPowerBonus = 0;
  let fameBonusPct = 0;
  let lootBonusPct = 0;
  let hefndSatisfied = 0;
  const activeLabelsEn: string[] = [];
  const activeLabelsFa: string[] = [];

  const isTargetEnglish = !targetSettlementId || ENGLISH_SETTLEMENT_IDS.has(targetSettlementId);
  const vengeanceActive = isTargetEnglish && hasLothbrokVengeanceActive(state);

  const isWolfBlood =
    state.ragnarBloodline ||
    state.character.traits.includes('wolf_blood') ||
    state.flags.includes('ragnar_blood_active');

  if (vengeanceActive && isWolfBlood) {
    combatPowerBonus += 12;
    fameBonusPct += 25;
    lootBonusPct += 15;
    hefndSatisfied += 18;
    activeLabelsEn.push('Wolf-Blood (+12 Power, +25% Fame)');
    activeLabelsFa.push('خون گرگ (+۱۲ قدرت رزم، +۲۵٪ شهرت)');
  }

  const hefnd = state.hefndMeter ?? 0;
  if (vengeanceActive && hefnd > 0) {
    const hefndPower = Math.max(4, Math.round(hefnd * 0.18));
    combatPowerBonus += hefndPower;
    fameBonusPct += Math.round(hefnd * 0.2);
    hefndSatisfied = Math.max(hefndSatisfied, 22);
    activeLabelsEn.push(`Hefnd Debt ${hefnd}/100 (+${hefndPower} Vengeance Fury)`);
    activeLabelsFa.push(`خون‌بهای هفند ${hefnd}/100 (+${hefndPower} خشم انتقام)`);
  }

  const heirlooms = state.heirlooms ?? [];
  if (vengeanceActive) {
    for (const hid of heirlooms) {
      const def = SAGA_HEIRLOOMS_MAP[hid];
      if (def) {
        combatPowerBonus += def.raidPowerBonus;
        fameBonusPct += def.englishFameBonus;
        activeLabelsEn.push(`${def.nameEn} (+${def.raidPowerBonus} Power)`);
        activeLabelsFa.push(`${def.nameFa} (+${def.raidPowerBonus} قدرت)`);
      }
    }

    if (heirlooms.includes('bragarfull_horn_lejre') && hefndSatisfied > 0) {
      hefndSatisfied = Math.round(hefndSatisfied * 1.25);
    }
  }

  const flavor =
    vengeanceActive && targetSettlementId
      ? getEnglishDefenderFlavor(targetSettlementId, rng)
      : getEnglishDefenderFlavor('jorvik', rng);

  return {
    active: vengeanceActive,
    combatBonus: combatPowerBonus,
    lootMultiplier: 1 + lootBonusPct / 100,
    fameMultiplier: 1 + fameBonusPct / 100,
    hefndDeltaOnWin: -Math.max(16, hefndSatisfied),
    hefndDeltaOnLoss: 12,
    warCryEn: flavor.warCryEn,
    warCryFa: flavor.warCryFa,
    bannerDescEn: flavor.bannerDescEn,
    bannerDescFa: flavor.bannerDescFa,
    combatPowerBonus,
    fameBonusPct,
    lootBonusPct,
    hefndSatisfied,
    activeLabelsEn,
    activeLabelsFa,
  };
}
