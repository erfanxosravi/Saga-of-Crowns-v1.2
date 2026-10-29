import { useState } from 'react';
import {
  Anchor,
  Award,
  Castle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Coins,
  Compass,
  Crown,
  Flame,
  GitBranch,
  History,
  Lock,
  Scale,
  ScrollText,
  Shield,
  Ship,
  Smile,
  Sparkles,
  Swords,
  Trophy,
  Users,
} from 'lucide-react';
import { AchievementDef, BITLIFE_ACHIEVEMENTS } from '../data/deathsAndAchievements';
import { FullGameState, Language } from '../types/game';

export type BadgeCategory = 'warfare' | 'seafaring' | 'dynasty' | 'crown' | 'saga';

export interface HistoricalMilestoneDef {
  id: string;
  year: number;
  eventId?: string;
  settlementId?: string;
  rune: string;
  iconKey: 'flame' | 'anchor' | 'coins' | 'swords' | 'crown' | 'compass' | 'shield' | 'castle' | 'scale' | 'scroll' | 'ship';
  titleEn: string;
  titleFa: string;
  shortEn: string;
  shortFa: string;
  descEn: string;
  descFa: string;
  eraLabelEn: string;
  eraLabelFa: string;
}

export const HISTORICAL_MILESTONES: HistoricalMilestoneDef[] = [
  {
    id: 'ms_793_lindisfarne',
    year: 793,
    eventId: 'hist_793_lindisfarne',
    settlementId: 'lindisfarne',
    rune: 'ᛚ',
    iconKey: 'flame',
    titleEn: '793 AD · Dragon Prows at Lindisfarne',
    titleFa: '۷۹۳ م · یورش به صومعه لیندیسفارن',
    shortEn: 'Lindisfarne 793',
    shortFa: 'لیندیسفارن ۷۹۳',
    descEn: 'Northern keels strike Holy Island in Northumbria, igniting the Viking Age across European chronicles.',
    descFa: 'کشتی‌های اژدهاپیکر شمال به جزیره مقدس لیندیسفارن یورش بردند و عصر وایکینگ‌ها در تاریخ آغاز شد.',
    eraLabelEn: 'Dawn of Raids',
    eraLabelFa: 'طلوع غارت‌ها',
  },
  {
    id: 'ms_841_dublin',
    year: 841,
    settlementId: 'dublin',
    rune: 'ᛞ',
    iconKey: 'anchor',
    titleEn: '841 AD · The Longphort of Dyflinn',
    titleFa: '۸۴۱ م · بنای دژ دریایی دوبلین',
    shortEn: 'Dyflinn 841',
    shortFa: 'دوبلین ۸۴۱',
    descEn: 'Norse fleets fortify a permanent ship-enclosure at Dublin, turning seasonal raids into Irish Sea rule.',
    descFa: 'ناوگان وایکینگ‌ها در دوبلین اردوگاه دائمی ساختند و فرمانروایی بر دریای ایرلند را پایه گذاشتند.',
    eraLabelEn: 'Sea Strongholds',
    eraLabelFa: 'دژهای دریایی',
  },
  {
    id: 'ms_845_paris',
    year: 845,
    settlementId: 'paris',
    rune: 'ᛈ',
    iconKey: 'coins',
    titleEn: '845 AD · Seven Thousand Pounds on the Seine',
    titleFa: '۸۴۵ م · محاصره پاریس و خراج نقره',
    shortEn: 'Paris 845',
    shortFa: 'پاریس ۸۴۵',
    descEn: '120 Danish ships row up the Seine to Paris, exacting 7,000 pounds of silver and gold in Danegeld.',
    descFa: '۱۲۰ کشتی دانمارکی از رود سن بالا رفتند و هفت‌هزار پوند نقره و طلا از شاه فرانک‌ها خراج گرفتند.',
    eraLabelEn: 'Frankish Rivers',
    eraLabelFa: 'رودهای فرانکستان',
  },
  {
    id: 'ms_865_great_army',
    year: 865,
    eventId: 'hist_865_great_army',
    settlementId: 'jorvik',
    rune: 'ᚺ',
    iconKey: 'swords',
    titleEn: '865 AD · The Great Heathen Army',
    titleFa: '۸۶۵ م · فرود ارتش بزرگ وایکینگ‌ها',
    shortEn: 'Great Army 865',
    shortFa: 'ارتش بزرگ ۸۶۵',
    descEn: 'A massive coalition host under Halfdan and Ivar lands in England to conquer kingdoms and establish Jórvík.',
    descFa: 'سپاه عظیم پسران راگنار برای فتح پادشاهی‌های انگلستان و بنیان‌گذاری یورویک وارد جزیره شد.',
    eraLabelEn: 'Age of Conquest',
    eraLabelFa: 'عصر فتوحات',
  },
  {
    id: 'ms_872_hafrsfjord',
    year: 872,
    eventId: 'hist_872_hafrsfjord',
    settlementId: 'avaldsnes',
    rune: 'ᚲ',
    iconKey: 'crown',
    titleEn: '872 AD · Oars at Hafrsfjord',
    titleFa: '۸۷۲ م · نبرد هافرسفیورد و تاج نروژ',
    shortEn: 'Hafrsfjord 872',
    shortFa: 'هافرسفیورد ۸۷۲',
    descEn: 'Harald Fairhair clashes with western petty kings at Hafrsfjord, uniting the Norwegian fjords under one crown.',
    descFa: 'هارالد موبلند در نبرد دریایی بزرگ هافرسفیورد شاهان محلی را شکست داد و نروژ را متحد ساخت.',
    eraLabelEn: 'Royal Unification',
    eraLabelFa: 'اتحاد پادشاهی',
  },
  {
    id: 'ms_874_iceland',
    year: 874,
    settlementId: 'reykjavik',
    rune: 'ᛁ',
    iconKey: 'compass',
    titleEn: '874 AD · High-Seat Pillars of Reykjavik',
    titleFa: '۸۷۴ م · کوچ بزرگ به ایسلند (لاندنام)',
    shortEn: 'Iceland 874',
    shortFa: 'ایسلند ۸۷۴',
    descEn: 'Free bondi and chieftains steer across the North Atlantic to claim steamed valleys in Iceland.',
    descFa: 'آزادمردان و سرداران شمال از اقیانوس اطلس گذشتند و دره‌های بکر ایسلند را به خانه خود تبدیل کردند.',
    eraLabelEn: 'Landnám Era',
    eraLabelFa: 'عصر مهاجرت',
  },
  {
    id: 'ms_911_normandy',
    year: 911,
    eventId: 'hist_911_normandy',
    settlementId: 'rouen',
    rune: 'ᚱ',
    iconKey: 'castle',
    titleEn: '911 AD · Rollo & the Duchy of Normandy',
    titleFa: '۹۱۱ م · پیمان نورماندی با رولو',
    shortEn: 'Normandy 911',
    shortFa: 'نورماندی ۹۱۱',
    descEn: 'Rollo receives Rouen and the lower Seine by treaty, founding the Viking-descended Duchy of Normandy.',
    descFa: 'رولو سردار وایکینگ با پیمان رسمی شهر روآن و مصب رود سن را گرفت و دوک‌نشین نورماندی را بنا نهاد.',
    eraLabelEn: 'Norman Treaty',
    eraLabelFa: 'پیمان نورماندی',
  },
  {
    id: 'ms_930_althing',
    year: 930,
    eventId: 'hist_930_althing',
    settlementId: 'thingvellir',
    rune: 'ᛏ',
    iconKey: 'scale',
    titleEn: '930 AD · The Law Rock at Þingvellir',
    titleFa: '۹۳۰ م · تأسیس شورای بزرگ آلثینگ',
    shortEn: 'Althing 930',
    shortFa: 'آلثینگ ۹۳۰',
    descEn: 'Icelandic chieftains establish the Althing assembly at Lögberg — governing a free commonwealth by law alone.',
    descFa: 'سران ایسلند در صخره قانون ثینگ‌ولیر نخستین شورای سراسری آزاد بدون پادشاه را بنیان گذاشتند.',
    eraLabelEn: 'Saga Commonwealth',
    eraLabelFa: 'حکومت قانون',
  },
  {
    id: 'ms_965_jelling',
    year: 965,
    settlementId: 'jelling',
    rune: 'ᛃ',
    iconKey: 'scroll',
    titleEn: '965 AD · Harald Bluetooth’s Jelling Stone',
    titleFa: '۹۶۵ م · سنگ‌نوشته هارالد در یلینگ',
    shortEn: 'Jelling 965',
    shortFa: 'یلینگ ۹۶۵',
    descEn: 'King Harald Bluetooth raises the great runestone at Jelling, proclaiming rule over Denmark and Norway.',
    descFa: 'هارالد دندان‌آبی بر سنگ رونیک بزرگ یلینگ فرمانروایی بر دانمارک و نروژ را جاودانه کرد.',
    eraLabelEn: 'Runic Kingdoms',
    eraLabelFa: 'عصر سنگ‌نوشته‌ها',
  },
  {
    id: 'ms_985_greenland',
    year: 985,
    eventId: 'hist_985_greenland',
    settlementId: 'brattahlid',
    rune: 'ᚷ',
    iconKey: 'ship',
    titleEn: '985 AD · Erik the Red’s Greenland Fleet',
    titleFa: '۹۸۵ م · ناوگان اریک سرخ به گرینلند',
    shortEn: 'Greenland 985',
    shortFa: 'گرینلند ۹۸۵',
    descEn: 'Erik Thorvaldsson leads twenty-five ships west from Iceland to settle the inner fjords of Brattahlíð.',
    descFa: 'اریک سرخ با ناوگانی از ایسلند به غرب راند و در آبدره‌های پناه‌دار گرینلند مستقر شد.',
    eraLabelEn: 'Western Ice-Seas',
    eraLabelFa: 'دریاهای غرب',
  },
  {
    id: 'ms_1000_vinland',
    year: 1000,
    eventId: 'hist_1000_vinland',
    settlementId: 'vinland',
    rune: 'ᚹ',
    iconKey: 'compass',
    titleEn: '1000 AD · Landfall in Vínland',
    titleFa: '۱۰۰۰ م · کشف سواحل وینلند (دنیای نو)',
    shortEn: 'Vínland 1000',
    shortFa: 'وینلند ۱۰۰۰',
    descEn: 'Norse crews sail past Helluland and Markland to raise sod halls on the shores of North America.',
    descFa: 'دریانوردان شمال از اقیانوس گذشتند و به جنگل‌ها و سواحل وینلند در قاره آمریکا قدم گذاشتند.',
    eraLabelEn: 'New World Horizon',
    eraLabelFa: 'افق دنیای نو',
  },
  {
    id: 'ms_1016_cnut',
    year: 1016,
    eventId: 'hist_1016_cnut',
    settlementId: 'london',
    rune: 'ᛟ',
    iconKey: 'crown',
    titleEn: '1016 AD · Empire of the North Sea',
    titleFa: '۱۰۱۶ م · امپراتوری دریای شمال (کانوت)',
    shortEn: 'North Sea 1016',
    shortFa: 'امپراتوری ۱۰۱۶',
    descEn: 'Cnut the Great unites England, Denmark, and Norway into a vast maritime empire across northern waters.',
    descFa: 'کانوت کبیر تاج انگلستان، دانمارک و نروژ را متحد ساخت و بزرگ‌ترین امپراتوری دریایی شمال را بنا کرد.',
    eraLabelEn: 'High Empire',
    eraLabelFa: 'اوج امپراتوری',
  },
  {
    id: 'ms_1066_stamford',
    year: 1066,
    eventId: 'hist_1066_stamford_bridge',
    settlementId: 'jorvik',
    rune: 'ᛋ',
    iconKey: 'shield',
    titleEn: '1066 AD · Sunset at Stamford Bridge',
    titleFa: '۱۰۶۶ م · نبرد پل استمفورد و پایان عصر',
    shortEn: 'Stamford 1066',
    shortFa: 'پل استمفورد ۱۰۶۶',
    descEn: 'The final great clash of the Viking Age in Yorkshire, where northern legend enters immortal saga.',
    descFa: 'آخرین نبرد بزرگ عصر وایکینگ‌ها در یورکشایر که نام جنگجویان شمال را به افسانه‌های جاودان سپرد.',
    eraLabelEn: 'Saga Twilight',
    eraLabelFa: 'غروب عصر وایکینگ',
  },
];

export interface EvaluatedMilestone {
  def: HistoricalMilestoneDef;
  unlocked: boolean;
  participated: boolean;
  alteredHistory: boolean;
}

export function evaluateHistoricalMilestones(state: FullGameState): EvaluatedMilestone[] {
  const earliestBirthYear =
    state.ancestors.length > 0
      ? Math.min(...state.ancestors.map((a) => a.birthYear), state.character.birthYear)
      : state.character.birthYear;

  return HISTORICAL_MILESTONES.map((def) => {
    const eventFired = Boolean(def.eventId && state.firedUniqueEvents.includes(def.eventId));
    const alteredHistory = state.divergences.some((d) => d.includes(String(def.year)));
    const loggedInLife = state.lifeLog.some((l) => l.year === def.year);
    const specialDiscovery =
      (def.id === 'ms_1000_vinland' && state.discoveredSettlements.includes('vinland')) ||
      (def.id === 'ms_985_greenland' && state.discoveredSettlements.includes('brattahlid'));

    // Unlocked if the dynasty has lived into/through this milestone year, fired its set-piece event, or discovered its landmark
    const livedThroughYear = state.year >= def.year && earliestBirthYear <= def.year + 25;
    const reachedTimelineYear = state.year >= def.year;

    const unlocked =
      eventFired || alteredHistory || loggedInLife || specialDiscovery || reachedTimelineYear;
    const participated = eventFired || alteredHistory || specialDiscovery || livedThroughYear;

    return {
      def,
      unlocked,
      participated,
      alteredHistory,
    };
  });
}

export interface AchievementBadgeMeta {
  category: BadgeCategory;
  rune: string;
  iconKey:
    | 'ship'
    | 'swords'
    | 'crown'
    | 'coins'
    | 'users'
    | 'scale'
    | 'shield'
    | 'flame'
    | 'compass'
    | 'castle'
    | 'sparkles'
    | 'smile';
}

export function getAchievementBadgeMeta(id: string): AchievementBadgeMeta {
  switch (id) {
    case 'First Keel Launched':
    case 'Fleet Admiral (5 Ships)':
    case 'Master Sea-Captain':
      return { category: 'seafaring', rune: 'ᚱ', iconKey: 'ship' };
    case 'Beyond the Ice-Fjords':
    case 'Vínland Voyagers':
      return { category: 'seafaring', rune: 'ᚹ', iconKey: 'compass' };
    case 'Scourge of the Coasts':
    case 'Sea Wolf (5 Raids Won)':
    case 'Holmgang Champion':
    case 'Warlord of Fifty':
      return { category: 'warfare', rune: 'ᛏ', iconKey: 'swords' };
    case 'Conqueror of Walls':
    case 'Ring Fortress Builder':
      return { category: 'warfare', rune: 'ᛉ', iconKey: 'castle' };
    case 'Shieldmaiden Legend':
      return { category: 'warfare', rune: 'ᛋ', iconKey: 'shield' };
    case 'Unbroken Bloodline':
    case 'Four Generations of Saga':
    case 'Full Longhouse (5 Kids)':
    case 'Marry a Blood Enemy':
    case 'Divorce Drama':
      return { category: 'dynasty', rune: 'ᛒ', iconKey: 'users' };
    case 'Crowned Konungr':
    case 'North Sea Overking':
    case 'Landed Magnate (8 Farms)':
      return { category: 'crown', rune: 'ᛟ', iconKey: 'crown' };
    case 'Silver Hoarder 500':
      return { category: 'crown', rune: 'ᚠ', iconKey: 'coins' };
    case 'Voice at Lögberg':
    case 'Thrall Broken Chains':
      return { category: 'saga', rune: 'ᛗ', iconKey: 'scale' };
    case 'Timeline Breaker':
    case 'Undying Word-Fame':
    case 'Living Legend (1000 Fame)':
      return { category: 'saga', rune: 'ᛞ', iconKey: 'sparkles' };
    case 'Pure Joy in Cold Lands':
      return { category: 'saga', rune: 'ᛃ', iconKey: 'smile' };
    case 'Die Before 30':
    case 'Survive to 70':
    case 'One-Eyed Wisdom':
    default:
      return { category: 'saga', rune: 'ᚨ', iconKey: 'flame' };
  }
}

export const BADGE_CATEGORY_LABELS: Record<Language, Record<BadgeCategory, string>> = {
  en: {
    warfare: 'War & Conquest',
    seafaring: 'Sea & Discovery',
    dynasty: 'Bloodline & Kin',
    crown: 'Crown & Wealth',
    saga: 'Saga & Legend',
  },
  fa: {
    warfare: 'نبرد و فتوحات',
    seafaring: 'دریانوردی و اکتشاف',
    dynasty: 'دودمان و خاندان',
    crown: 'تاج‌وتخت و ثروت',
    saga: 'حماسه و افسانه',
  },
};

export interface BadgePalette {
  pillBg: string;
  pillSelectedBg: string;
  iconBox: string;
  tagPill: string;
  cardBg: string;
  accentText: string;
}

export function getBadgeCategoryPalette(
  category: BadgeCategory | 'milestone' | 'alt_history'
): BadgePalette {
  switch (category) {
    case 'warfare':
      return {
        pillBg: 'bg-rose-500/12 hover:bg-rose-500/20 border-rose-500/45 text-[#F1F5F9]',
        pillSelectedBg: 'bg-rose-500/25 border-rose-500 text-[#F1F5F9] ring-1 ring-rose-500/50',
        iconBox: 'bg-rose-500 text-white border-rose-600/40 shadow-xs',
        tagPill: 'bg-rose-500/20 border border-rose-500/45 text-rose-500',
        cardBg: 'bg-[#131D2B] border-rose-500/55',
        accentText: 'text-rose-500',
      };
    case 'seafaring':
      return {
        pillBg: 'bg-sky-500/12 hover:bg-sky-500/20 border-sky-500/45 text-[#F1F5F9]',
        pillSelectedBg: 'bg-sky-500/25 border-sky-500 text-[#F1F5F9] ring-1 ring-sky-500/50',
        iconBox: 'bg-sky-500 text-white border-sky-600/40 shadow-xs',
        tagPill: 'bg-sky-500/20 border border-sky-500/45 text-sky-500',
        cardBg: 'bg-[#131D2B] border-sky-500/55',
        accentText: 'text-sky-500',
      };
    case 'dynasty':
      return {
        pillBg: 'bg-emerald-500/12 hover:bg-emerald-500/20 border-emerald-500/45 text-[#F1F5F9]',
        pillSelectedBg:
          'bg-emerald-500/25 border-emerald-500 text-[#F1F5F9] ring-1 ring-emerald-500/50',
        iconBox: 'bg-emerald-500 text-white border-emerald-600/40 shadow-xs',
        tagPill: 'bg-emerald-500/20 border border-emerald-500/45 text-emerald-500',
        cardBg: 'bg-[#131D2B] border-emerald-500/55',
        accentText: 'text-emerald-500',
      };
    case 'crown':
      return {
        pillBg: 'bg-amber-500/14 hover:bg-amber-500/22 border-amber-500/50 text-[#F1F5F9]',
        pillSelectedBg: 'bg-amber-500/25 border-amber-500 text-[#F1F5F9] ring-1 ring-amber-500/50',
        iconBox: 'bg-amber-500 text-[#0B1118] border-amber-600/40 shadow-xs',
        tagPill: 'bg-amber-500/20 border border-amber-500/45 text-amber-500',
        cardBg: 'bg-[#131D2B] border-amber-500/60',
        accentText: 'text-amber-500',
      };
    case 'saga':
      return {
        pillBg: 'bg-violet-500/12 hover:bg-violet-500/20 border-violet-500/45 text-[#F1F5F9]',
        pillSelectedBg:
          'bg-violet-500/25 border-violet-500 text-[#F1F5F9] ring-1 ring-violet-500/50',
        iconBox: 'bg-violet-500 text-white border-violet-600/40 shadow-xs',
        tagPill: 'bg-violet-500/20 border border-violet-500/45 text-violet-500',
        cardBg: 'bg-[#131D2B] border-violet-500/55',
        accentText: 'text-violet-500',
      };
    case 'alt_history':
      return {
        pillBg: 'bg-fuchsia-500/12 hover:bg-fuchsia-500/20 border-fuchsia-500/45 text-[#F1F5F9]',
        pillSelectedBg:
          'bg-fuchsia-500/25 border-fuchsia-500 text-[#F1F5F9] ring-1 ring-fuchsia-500/50',
        iconBox: 'bg-fuchsia-500 text-white border-fuchsia-600/40 shadow-xs',
        tagPill: 'bg-fuchsia-500/20 border border-fuchsia-500/45 text-fuchsia-500',
        cardBg: 'bg-[#131D2B] border-fuchsia-500/55',
        accentText: 'text-fuchsia-500',
      };
    case 'milestone':
    default:
      return {
        pillBg: 'bg-teal-500/12 hover:bg-teal-500/20 border-teal-500/45 text-[#F1F5F9]',
        pillSelectedBg: 'bg-teal-500/25 border-teal-500 text-[#F1F5F9] ring-1 ring-teal-500/50',
        iconBox: 'bg-teal-500 text-white border-teal-600/40 shadow-xs',
        tagPill: 'bg-teal-500/20 border border-teal-500/45 text-teal-500',
        cardBg: 'bg-[#131D2B] border-teal-500/55',
        accentText: 'text-teal-500',
      };
  }
}

export function renderBadgeIcon(iconKey: string, className = 'w-4 h-4') {
  switch (iconKey) {
    case 'ship':
      return <Ship className={className} />;
    case 'anchor':
      return <Anchor className={className} />;
    case 'swords':
      return <Swords className={className} />;
    case 'crown':
      return <Crown className={className} />;
    case 'coins':
      return <Coins className={className} />;
    case 'users':
      return <Users className={className} />;
    case 'scale':
      return <Scale className={className} />;
    case 'shield':
      return <Shield className={className} />;
    case 'compass':
      return <Compass className={className} />;
    case 'castle':
      return <Castle className={className} />;
    case 'scroll':
      return <ScrollText className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'smile':
      return <Smile className={className} />;
    case 'flame':
    default:
      return <Flame className={className} />;
  }
}

interface SagaBadgeRibbonProps {
  state: FullGameState;
  onOpenFullSagaTab?: () => void;
  compactMenuMode?: boolean;
}

/**
 * Compact, visually distinct badge showcase used inside the Hamburger Menu (`HeaderMenuDropdown`)
 * or Legacy Hall to highlight unlocked historical milestones and dynasty achievements with distinct category colors.
 */
export function SagaBadgeRibbon({
  state,
  onOpenFullSagaTab,
  compactMenuMode = false,
}: SagaBadgeRibbonProps) {
  const lang = state.settings.language;
  const isFa = lang === 'fa';
  const [selectedBadgeKey, setSelectedBadgeKey] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(compactMenuMode);

  const milestones = evaluateHistoricalMilestones(state);
  const unlockedMilestones = milestones.filter((m) => m.unlocked);
  const nextMilestone = milestones.find((m) => !m.unlocked) ?? null;

  const evaluatedAchievements = BITLIFE_ACHIEVEMENTS.map((ach) => {
    const prog = ach.getProgress(state);
    const earned = state.achievements.includes(ach.id) || prog.current >= prog.target;
    const meta = getAchievementBadgeMeta(ach.id);
    return { ach, prog, earned, meta };
  });

  const unlockedAchievements = evaluatedAchievements.filter((a) => a.earned);

  type RibbonItem =
    | {
        key: string;
        kind: 'milestone';
        milestone: EvaluatedMilestone;
      }
    | {
        key: string;
        kind: 'achievement';
        item: {
          ach: AchievementDef;
          prog: { current: number; target: number };
          earned: boolean;
          meta: AchievementBadgeMeta;
        };
      };

  const ribbonItems: RibbonItem[] = [
    ...unlockedAchievements.map((item) => ({
      key: `ach:${item.ach.id}`,
      kind: 'achievement' as const,
      item,
    })),
    ...unlockedMilestones
      .slice()
      .reverse()
      .map((milestone) => ({
        key: `ms:${milestone.def.id}`,
        kind: 'milestone' as const,
        milestone,
      })),
  ];

  const selectedItem = ribbonItems.find((it) => it.key === selectedBadgeKey) ?? null;

  return (
    <div className="rounded-xl bg-[#131D2B] border border-[#223247] p-2.5 space-y-2 transition-all">
      {/* Top Header Row: Summary Counts + Open Full Hall */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/40 text-[11px] font-mono font-bold tabular-nums text-amber-500">
            <Award className="w-3 h-3 shrink-0" />
            {unlockedAchievements.length}/{BITLIFE_ACHIEVEMENTS.length}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-500/15 border border-teal-500/40 text-[11px] font-mono font-bold tabular-nums text-teal-500">
            <History className="w-3 h-3 shrink-0" />
            {unlockedMilestones.length}/{HISTORICAL_MILESTONES.length}
          </span>
          {nextMilestone && !compactMenuMode && (
            <span
              className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0F1722] border border-[#233246] text-[11px] font-mono text-[#94A3B8]"
              title={isFa ? nextMilestone.def.titleFa : nextMilestone.def.titleEn}
            >
              <span>{isFa ? 'رویداد بعدی:' : 'Next Era:'}</span>
              <strong className="text-[#CBD5E1]">{nextMilestone.def.year} AD</strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!compactMenuMode && (
            <button
              type="button"
              onClick={() => setIsExpanded((v) => !v)}
              className="min-h-[30px] px-2 py-1 rounded-lg bg-[#0F1722] hover:bg-[#19283B] border border-[#233246] text-[11px] font-semibold text-[#CBD5E1] inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>
                {isExpanded ? (isFa ? 'جمع‌کردن' : 'Compact') : isFa ? 'همه نشان‌ها' : 'All Badges'}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {onOpenFullSagaTab && (
            <button
              type="button"
              onClick={onOpenFullSagaTab}
              className="min-h-[30px] px-2.5 py-1 rounded-lg bg-[#F59E0B] hover:bg-[#FBBF24] text-[11px] font-bold text-[#0B1118] inline-flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
            >
              <span>{isFa ? 'تالار کامل افتخارات' : 'Full Legacy Hall'}</span>
              <ChevronRight className={`w-3.5 h-3.5 ${isFa ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Distinct Color-Coded Badge Medallions */}
      {ribbonItems.length > 0 ? (
        <div
          className={
            isExpanded
              ? 'flex flex-wrap items-center gap-1.5 pt-0.5 max-h-[190px] overflow-y-auto pr-0.5'
              : 'flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 pt-0.5'
          }
        >
          {ribbonItems.map((entry) => {
            const isSelected = selectedBadgeKey === entry.key;

            if (entry.kind === 'achievement') {
              const { ach, meta } = entry.item;
              const pal = getBadgeCategoryPalette(meta.category);
              return (
                <button
                  key={entry.key}
                  type="button"
                  onClick={() =>
                    setSelectedBadgeKey((prev) => (prev === entry.key ? null : entry.key))
                  }
                  className={`group shrink-0 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                    isSelected ? pal.pillSelectedBg : pal.pillBg
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${pal.iconBox}`}
                  >
                    {renderBadgeIcon(meta.iconKey, 'w-3 h-3')}
                  </span>
                  <span className="whitespace-nowrap">{isFa ? ach.nameFa : ach.nameEn}</span>
                </button>
              );
            }

            const { def, alteredHistory } = entry.milestone;
            const pal = getBadgeCategoryPalette(alteredHistory ? 'alt_history' : 'milestone');
            return (
              <button
                key={entry.key}
                type="button"
                onClick={() =>
                  setSelectedBadgeKey((prev) => (prev === entry.key ? null : entry.key))
                }
                className={`group shrink-0 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                  isSelected ? pal.pillSelectedBg : pal.pillBg
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-md border flex items-center justify-center text-[10px] font-bold shrink-0 ${pal.iconBox}`}
                >
                  {renderBadgeIcon(def.iconKey, 'w-3 h-3')}
                </span>
                <span className="whitespace-nowrap">{isFa ? def.shortFa : def.shortEn}</span>
                {alteredHistory && <Sparkles className="w-3 h-3 text-fuchsia-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-xs text-[#94A3B8] py-0.5">
          {isFa
            ? 'با پیشبرد سال‌ها، غارت، دریانوردی و رقم‌زدن وقایع تاریخی، نشان‌های افتخار خاندان شما اینجا می‌درخشند.'
            : 'Advance years, sail, raid, and shape history to unlock dynasty badges and historical era seals here.'}
        </div>
      )}

      {/* Selected Badge Inline Details Popover */}
      {selectedItem && (
        <div className="p-2.5 rounded-xl bg-[#0F1722] border border-[#283B52] flex items-start justify-between gap-2.5 text-xs">
          {selectedItem.kind === 'achievement' ? (
            <div className="flex items-start gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-lg border flex flex-col items-center justify-center shrink-0 ${
                  getBadgeCategoryPalette(selectedItem.item.meta.category).iconBox
                }`}
              >
                {renderBadgeIcon(selectedItem.item.meta.iconKey, 'w-4 h-4')}
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-[#F1F5F9]">
                    {isFa ? selectedItem.item.ach.nameFa : selectedItem.item.ach.nameEn}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      getBadgeCategoryPalette(selectedItem.item.meta.category).tagPill
                    }`}
                  >
                    {BADGE_CATEGORY_LABELS[lang][selectedItem.item.meta.category]}
                  </span>
                </div>
                <p className="text-[#CBD5E1] leading-relaxed">
                  {isFa ? selectedItem.item.ach.descFa : selectedItem.item.ach.descEn}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-lg border flex flex-col items-center justify-center shrink-0 ${
                  getBadgeCategoryPalette(
                    selectedItem.milestone.alteredHistory ? 'alt_history' : 'milestone'
                  ).iconBox
                }`}
              >
                {renderBadgeIcon(selectedItem.milestone.def.iconKey, 'w-4 h-4')}
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-[#F1F5F9]">
                    {isFa
                      ? selectedItem.milestone.def.titleFa
                      : selectedItem.milestone.def.titleEn}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      getBadgeCategoryPalette(
                        selectedItem.milestone.alteredHistory ? 'alt_history' : 'milestone'
                      ).tagPill
                    }`}
                  >
                    {selectedItem.milestone.alteredHistory
                      ? isFa
                        ? 'تغییر مسیر تاریخ'
                        : 'History Altered'
                      : isFa
                        ? 'نقطه عطف تاریخی'
                        : 'Historical Milestone'}
                  </span>
                </div>
                <p className="text-[#CBD5E1] leading-relaxed">
                  {isFa
                    ? selectedItem.milestone.def.descFa
                    : selectedItem.milestone.def.descEn}
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setSelectedBadgeKey(null)}
            className="px-2 py-1 rounded-lg bg-[#131D2B] hover:bg-[#19283B] border border-[#233246] text-[11px] text-[#94A3B8] hover:text-[#F1F5F9] shrink-0 cursor-pointer"
          >
            {isFa ? 'بستن' : 'Close'}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Full Historical Milestones Timeline & Seal Grid for `SagaChroniclePanel` (`TabId.Saga`)
 */
export function HistoricalMilestonesGrid({ state }: { state: FullGameState }) {
  const lang = state.settings.language;
  const isFa = lang === 'fa';
  const milestones = evaluateHistoricalMilestones(state);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {milestones.map(({ def, unlocked, participated, alteredHistory }) => {
        const yearsRemaining = Math.max(0, def.year - state.year);
        const pal = getBadgeCategoryPalette(alteredHistory ? 'alt_history' : 'milestone');

        return (
          <div
            key={def.id}
            className={`relative p-3.5 rounded-2xl border flex items-start gap-3 transition-all overflow-hidden ${
              unlocked
                ? `${pal.cardBg} text-[#F1F5F9]`
                : 'bg-[#131D2B]/75 border-[#233246] text-[#94A3B8] opacity-80'
            }`}
          >
            {/* Distinct Nordic Seal Medallion */}
            <div
              className={`w-12 h-12 rounded-2xl border flex flex-col items-center justify-center shrink-0 relative ${
                unlocked ? pal.iconBox : 'bg-[#0B1118] border-[#233246] text-[#64748B]'
              }`}
            >
              {unlocked ? (
                renderBadgeIcon(def.iconKey, 'w-5 h-5')
              ) : (
                <Lock className="w-4 h-4 opacity-75" />
              )}
              <span className="text-[10px] font-mono font-bold leading-none mt-1">
                {def.year}
              </span>
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <span className={`text-[11px] font-mono font-semibold ${pal.accentText}`}>
                  {isFa ? def.eraLabelFa : def.eraLabelEn} · {def.rune}
                </span>

                {alteredHistory ? (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${pal.tagPill}`}
                  >
                    <GitBranch className="w-3 h-3" />
                    {isFa ? 'تاریخ بدیل' : 'Alt-History'}
                  </span>
                ) : unlocked ? (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${pal.tagPill}`}
                  >
                    {participated
                      ? isFa
                        ? 'تجربه‌شده ✓'
                        : 'Witnessed ✓'
                      : isFa
                        ? 'ثبت‌شده ✓'
                        : 'Unlocked ✓'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0B1118] border border-[#233246] text-[10px] font-mono text-[#94A3B8]">
                    {isFa ? `${yearsRemaining} سال مانده` : `In ${yearsRemaining}y`}
                  </span>
                )}
              </div>

              <div className="text-sm font-bold text-[#F1F5F9] leading-snug">
                {isFa ? def.titleFa : def.titleEn}
              </div>

              <p className="text-xs text-[#94A3B8] leading-relaxed">
                {isFa ? def.descFa : def.descEn}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

