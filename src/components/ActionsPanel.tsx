import { ReactNode, useState } from 'react';
import {
  AlertTriangle,
  Castle,
  Check,
  ChevronDown,
  ChevronUp,
  Coins,
  Compass,
  Crown,
  Flame,
  GraduationCap,
  Heart,
  History,
  LockOpen,
  MapPin,
  Scale,
  Shield,
  Ship,
  Sparkles,
  Swords,
} from 'lucide-react';
import { calculateVoyageMetrics, SETTLEMENTS, SETTLEMENTS_BY_ID } from '../data/geography';
import { hasBoathouse, isFortifiedEnemyCity, RaidTactic } from '../engine/gameEngine';
import { SETTLEMENTS_FA } from '../i18n/gameDataFa';
import { REGION_LABELS, RELIGION_LABELS, SKILL_LABELS } from '../i18n/ui';
import { EventIconType, FullGameState, Religion, SkillKey, TitleRank } from '../types/game';
import { NordicAccordion, NordicSelect, NordicSelectOption } from './NordicControls';
import {
  NorseAccent,
  NorseBottomSheet,
  NorseCornerOrnament,
  RuneDivider,
} from './NorseMotifs';

interface ActionsPanelProps {
  state: FullGameState;
  onGeneralAction: (
    actionType:
      | 'trade_voyage'
      | 'farm_settle'
      | 'attend_thing'
      | 'hold_feast'
      | 'patronize_skald'
      | 'recruit_hird'
      | 'build_longship'
      | 'build_knarr'
      | 'buy_freedom'
      | 'convert_pagan'
      | 'convert_christian',
    extra?: string
  ) => void;
  onRaid: (targetId: string, tactic: RaidTactic) => void;
  onSail: (destinationId: string) => void;
  onTrainSkill: (skill: SkillKey) => void;
  onConquerCity?: (targetId: string) => void;
}

type ActivitySheetId = 'raid' | 'train' | 'voyage' | 'hall' | 'land' | 'faith';
type ActivityCategoryId = 'military' | 'diplomacy' | 'personal';

const SKILL_HINTS: Record<SkillKey, { fa: string; en: string }> = {
  combat: {
    fa: 'نبرد تن‌به‌تن، غارت ساحلی و دوئل هولم‌گانگ (+۳ قدرت بدنی)',
    en: 'Raiding, shield-wall combat & Holmgang duels (+3 Power)',
  },
  seamanship: {
    fa: 'کاهش خطر طوفان و مهارت هدایت کشتی در دریاهای شمال',
    en: 'Safer sea voyages & storm navigation across northern waters',
  },
  law: {
    fa: 'نفوذ در شورای ثینگ و داوری اختلاف‌ها (+۳ ذکاوت)',
    en: 'Influence at the Thing assembly & disputes (+3 Cunning)',
  },
  diplomacy: {
    fa: 'مذاکره، پیمان صلح و روابط خاندان',
    en: 'Alliances, peace pacts & family persuasion',
  },
  skaldcraft: {
    fa: 'شعرخوانی، آوازه حماسی و اعتبار در تالار (+۳ کاریزما)',
    en: 'Saga poetry, lasting fame & hall prestige (+3 Charisma)',
  },
  trade: {
    fa: 'سود بیشتر در بازارها و معاملات دریایی',
    en: 'Higher silver profits from market voyages',
  },
  craft: {
    fa: 'آهنگری، کشتی‌سازی و ساخت تجهیزات بهتر',
    en: 'Smithing, shipbuilding & artisan mastery',
  },
  farming: {
    fa: 'برداشت غله بیشتر و رونق مزارع خاندان',
    en: 'Richer harvests & estate food stores',
  },
  seidr: {
    fa: 'شناخت اسرار سرنوشت، رون‌ها و پیشگویی',
    en: 'Rune lore, wyrd insight & mystic rites',
  },
};

const ALL_TRAINABLE_SKILLS: SkillKey[] = [
  'combat',
  'seamanship',
  'law',
  'diplomacy',
  'skaldcraft',
  'trade',
  'craft',
  'farming',
  'seidr',
];

interface ActivityCardItem {
  id: ActivitySheetId;
  category: ActivityCategoryId;
  title: string;
  description: string;
  costRiskBadge: string;
  costRiskTone: 'crimson' | 'amber' | 'ice' | 'emerald' | 'violet';
  statusLabel: string;
  isDone: boolean;
  isLocked: boolean;
  accent: NorseAccent;
  icon: ReactNode;
  isRaidHero?: boolean;
}

export function ActionsPanel({
  state,
  onGeneralAction,
  onRaid,
  onSail,
  onTrainSkill,
  onConquerCity,
}: ActionsPanelProps) {
  const lang = state.settings.language;
  const isFa = lang === 'fa';

  const [activeSheet, setActiveSheet] = useState<ActivitySheetId | null>(null);
  const [isRecentHistoryOpen, setIsRecentHistoryOpen] = useState<boolean>(true);
  const [openCategories, setOpenCategories] = useState<Record<ActivityCategoryId, boolean>>({
    military: true,
    diplomacy: false,
    personal: false,
  });

  const toggleCategory = (catId: ActivityCategoryId) => {
    setOpenCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const allCategoriesOpen =
    openCategories.military && openCategories.diplomacy && openCategories.personal;

  const handleToggleAllCategories = () => {
    const nextState = !allCategoriesOpen;
    setOpenCategories({
      military: nextState,
      diplomacy: nextState,
      personal: nextState,
    });
  };

  // Extract the last 3 performed player actions and their immediate results
  const recentActionLogs = (state.lifeLog ?? [])
    .filter(
      (entry) =>
        entry.category === 'Action' ||
        entry.category === 'Raiding' ||
        entry.category === 'Voyage & Sea' ||
        entry.id.startsWith('log_act_') ||
        entry.id.startsWith('log_raid_') ||
        entry.id.startsWith('log_sail_') ||
        entry.id.startsWith('log_train_') ||
        entry.id.startsWith('log_conq_') ||
        entry.id.startsWith('log_siege_') ||
        entry.id.startsWith('log_settle_') ||
        entry.id.startsWith('log_diplo_') ||
        entry.id.startsWith('log_bldg_') ||
        entry.id.startsWith('log_fam_')
    )
    .slice(-3)
    .reverse();

  const renderActionIcon = (iconType?: EventIconType, id?: string) => {
    if (id?.startsWith('log_train_')) {
      return <GraduationCap className="w-4 h-4 text-[#38BDF8]" />;
    }
    switch (iconType) {
      case 'sword':
        return <Swords className="w-4 h-4 text-[#F87171]" />;
      case 'ship':
        return <Ship className="w-4 h-4 text-[#38BDF8]" />;
      case 'coin':
        return <Coins className="w-4 h-4 text-[#FBBF24]" />;
      case 'religion':
        return <Sparkles className="w-4 h-4 text-[#A78BFA]" />;
      case 'heart':
        return <Heart className="w-4 h-4 text-[#F472B6]" />;
      case 'crown':
        return <Crown className="w-4 h-4 text-[#F59E0B]" />;
      default:
        return <Flame className="w-4 h-4 text-[#F59E0B]" />;
    }
  };

  const getDeltaChipStyle = (delta: string) => {
    if (delta.includes('+')) {
      return 'bg-[#10B981]/15 text-[#34D399] border-[#10B981]/30';
    }
    if (delta.includes('-')) {
      return 'bg-[#EF4444]/15 text-[#FCA5A5] border-[#EF4444]/30';
    }
    return 'bg-[#38BDF8]/15 text-[#7DD3FC] border-[#38BDF8]/30';
  };

  const otherPorts = SETTLEMENTS.filter((s) => s.id !== state.character.locationId);
  const [selectedSkill, setSelectedSkill] = useState<SkillKey>('combat');
  const [raidTargetId, setRaidTargetId] = useState<string>(
    otherPorts.find((s) => s.id === 'lindisfarne')?.id ?? otherPorts[0].id
  );
  const [raidTactic, setRaidTactic] = useState<RaidTactic>('shield_wall');
  const [sailDestId, setSailDestId] = useState<string>(
    otherPorts.find((s) => s.id === 'jorvik')?.id ?? otherPorts[0].id
  );

  const used = state.yearlyActivitiesUsed ?? {};
  const famUsed = state.familyInteractionsUsed ?? {};
  const isChild = state.character.age < 15;
  const currentLoc = SETTLEMENTS_BY_ID[state.character.locationId] ?? SETTLEMENTS[0];
  const currentLocName = isFa
    ? SETTLEMENTS_FA[currentLoc.id]?.name ?? currentLoc.name
    : currentLoc.name.split(' (')[0];

  const validRaidTargetId = otherPorts.some((p) => p.id === raidTargetId)
    ? raidTargetId
    : otherPorts[0].id;
  const validSailDestId = otherPorts.some((p) => p.id === sailDestId)
    ? sailDestId
    : otherPorts[0].id;

  const raidTarget = SETTLEMENTS_BY_ID[validRaidTargetId] ?? otherPorts[0];
  const raidTargetName = isFa
    ? SETTLEMENTS_FA[raidTarget.id]?.name ?? raidTarget.name
    : raidTarget.name.split(' (')[0];

  const sailDest = SETTLEMENTS_BY_ID[validSailDestId] ?? otherPorts[0];
  const sailDestName = isFa
    ? SETTLEMENTS_FA[sailDest.id]?.name ?? sailDest.name
    : sailDest.name.split(' (')[0];

  const effectiveSeamanship = state.character.skills.seamanship + (hasBoathouse(state) ? 3 : 0);
  const locIsFortified = isFortifiedEnemyCity(state, currentLoc.id);

  const voyageInfo = calculateVoyageMetrics(
    currentLoc,
    sailDest,
    state.season,
    state.year,
    effectiveSeamanship,
    state.realm.knarrs > 0
  );

  const canRaid =
    !used.raid && !isChild && state.realm.longships > 0 && state.realm.hirdWarriors > 0;
  const hasShips = state.realm.longships + state.realm.knarrs > 0;

  const hallDoneCount =
    (famUsed.act_attend_thing ? 1 : 0) +
    (famUsed.act_hold_feast ? 1 : 0) +
    (famUsed.act_patronize_skald ? 1 : 0);
  const allHallDone = hallDoneCount === 3;

  const faithDone = Boolean(famUsed.act_convert_pagan || famUsed.act_convert_christian);

  const raidPortOptions: NordicSelectOption<string>[] = otherPorts.map((s) => {
    const sName = isFa ? SETTLEMENTS_FA[s.id]?.name ?? s.name : s.name;
    const regName = REGION_LABELS[lang][s.regionGroup];
    return {
      value: s.id,
      label: sName,
      sublabel: regName,
      badge: isFa
        ? `غنیمت ${s.baseWealth}/10 · دفاع ${s.baseDefense}/10`
        : `Loot ${s.baseWealth}/10 · Def ${s.baseDefense}/10`,
      badgeTone: s.baseDefense >= 7 ? 'danger' : 'gold',
    };
  });

  const sailPortOptions: NordicSelectOption<string>[] = otherPorts.map((s) => {
    const sName = isFa ? SETTLEMENTS_FA[s.id]?.name ?? s.name : s.name;
    const regName = REGION_LABELS[lang][s.regionGroup];
    return {
      value: s.id,
      label: sName,
      sublabel: regName,
      badge: isFa ? `ثروت ${s.baseWealth}/10` : `Wealth ${s.baseWealth}/10`,
      badgeTone: 'ice',
    };
  });

  const raidTacticCards: {
    value: RaidTactic;
    label: string;
    desc: string;
    tag: string;
  }[] = [
    {
      value: 'shield_wall',
      label: isFa ? 'دیوار سپرها' : 'Shield Wall',
      desc: isFa
        ? 'نبرد مستقیم و متعادل با تکیه بر جنگجویان هیرد'
        : 'Balanced frontline clash relying on Hird strength',
      tag: isFa ? 'متعادل' : 'Balanced',
    },
    {
      value: 'surprise',
      label: isFa ? 'شبیخون سحرگاه' : 'Dawn Ambush',
      desc: isFa
        ? 'یورش برق‌آسا پیش از طلوع؛ غنیمت بیشتر با ریسک بالاتر'
        : 'Strike before sunrise for richer plunder at sharper risk',
      tag: isFa ? 'ذکاوت · غنیمت بالا' : 'Cunning · High Loot',
    },
    {
      value: 'ransom',
      label: isFa ? 'گرفتن باج نقره' : 'Demand Tribute',
      desc: isFa
        ? 'تهدید بندر به پرداخت نقره با تلفات کمتر'
        : 'Intimidate defenders into paying silver with fewer losses',
      tag: isFa ? 'کم‌خطرتر' : 'Lower Risk',
    },
    {
      value: 'feigned_retreat',
      label: isFa ? 'فرار ساختگی' : 'Feigned Flight',
      desc: isFa
        ? 'کشاندن مدافعان به کمینگاه و شکستن صف دشمن'
        : 'Lure defenders out of formation into a trap',
      tag: isFa ? 'تاکتیکی' : 'Tactical',
    },
  ];

  const cards: ActivityCardItem[] = [
    {
      id: 'raid',
      category: 'military',
      title: isFa ? 'غارت دریایی' : 'Coastal Raid',
      description: isFa
        ? 'یورش با کشتی جنگی به صومعه‌ها و بنادر برای نقره و شهرت'
        : 'Plunder monasteries and rival ports for silver & glory',
      costRiskBadge: isFa ? 'ریسک بالا · غنیمت کلان' : 'High Risk · Rich Loot',
      costRiskTone: 'crimson',
      statusLabel: used.raid
        ? isFa
          ? 'انجام شد ✓'
          : 'Raided This Year ✓'
        : isChild
          ? isFa
            ? 'نیازمند سن ۱۵+'
            : 'Age 15+ Required'
          : state.realm.longships === 0 || state.realm.hirdWarriors === 0
            ? isFa
              ? 'نیازمند کشتی جنگی و جنگجو'
              : 'Needs Longship & Warriors'
            : isFa
              ? `آماده · ${state.realm.longships} کشتی · ${state.realm.hirdWarriors} جنگجو`
              : `Ready · ${state.realm.longships} ship · ${state.realm.hirdWarriors} men`,
      isDone: Boolean(used.raid),
      isLocked: isChild || state.realm.longships === 0 || state.realm.hirdWarriors === 0,
      accent: 'crimson',
      icon: <Swords className="w-6 h-6" />,
      isRaidHero: true,
    },
    {
      id: 'land',
      category: 'military',
      title: locIsFortified
        ? isFa
          ? 'فتح دژ شهر'
          : 'Storm Stronghold'
        : isFa
          ? 'زمین و مزرعه'
          : 'Land & Homestead',
      description: locIsFortified
        ? isFa
          ? `محاصره و فتح نظامی دژ مستحکم ${currentLocName}`
          : `Lead an assault to conquer fortified ${currentLocName}`
        : isFa
          ? `خرید مزرعه در ${currentLocName} برای درآمد پایدار نقره`
          : `Buy farmland in ${currentLocName} for yearly silver`,
      costRiskBadge: locIsFortified
        ? isFa
          ? '۱۲+ جنگجو · ریسک محاصره'
          : '12+ Men · Siege Risk'
        : isFa
          ? '۳۵ نقره · درآمد سالانه'
          : '35 Silver · +Income',
      costRiskTone: locIsFortified ? 'crimson' : 'amber',
      statusLabel: used.settle
        ? isFa
          ? 'انجام شد ✓'
          : 'Completed This Year ✓'
        : isChild
          ? isFa
            ? 'نیازمند سن ۱۵+'
            : 'Age 15+ Required'
          : locIsFortified
            ? state.realm.longships > 0 && state.realm.hirdWarriors >= 12
              ? isFa
                ? 'آماده محاصره'
                : 'Ready to Storm'
              : isFa
                ? 'نیازمند ۱ کشتی و ۱۲ جنگجو'
                : 'Needs 1 Ship & 12 Men'
            : state.realm.silver >= 35
              ? isFa
                ? 'آماده خرید'
                : 'Ready to Buy'
              : isFa
                ? 'نیازمند ۳۵ نقره'
                : 'Needs 35 Silver',
      isDone: Boolean(used.settle),
      isLocked:
        isChild ||
        (locIsFortified
          ? state.realm.longships <= 0 || state.realm.hirdWarriors < 12
          : state.realm.silver < 35),
      accent: locIsFortified ? 'crimson' : 'amber',
      icon: <Castle className="w-6 h-6" />,
    },
    {
      id: 'hall',
      category: 'diplomacy',
      title: isFa ? 'تالار و شورای ثینگ' : 'Court & Hall',
      description: isFa
        ? 'سخنرانی در ثینگ، برگزاری سوروسات تالار و استخدام شاعر'
        : 'Speak at the Thing, host mead-hall feasts & hire skalds',
      costRiskBadge: isFa ? '۰ تا ۱۶ نقره · +شرافت' : '0–16 Silver · +Honor',
      costRiskTone: 'amber',
      statusLabel: isChild
        ? isFa
          ? 'نیازمند سن ۱۵+'
          : 'Age 15+ Required'
        : allHallDone
          ? isFa
            ? 'تمام مراسم انجام شد ✓'
            : 'All Completed ✓'
          : isFa
            ? `${3 - hallDoneCount} از ۳ اقدام باز است`
            : `${3 - hallDoneCount}/3 Actions Open`,
      isDone: allHallDone,
      isLocked: isChild,
      accent: 'amber',
      icon: <Flame className="w-6 h-6" />,
    },
    {
      id: 'voyage',
      category: 'diplomacy',
      title: isFa ? 'تجارت و سفر دریایی' : 'Trade & Voyage',
      description: isFa
        ? `معامله در بازار ${currentLocName} یا دریانوردی به بندر جدید`
        : `Trade goods in ${currentLocName} or sail to a new port`,
      costRiskBadge: isFa ? '+نقره · خطر دریا' : '+Silver · Sea Risk',
      costRiskTone: 'emerald',
      statusLabel:
        used.trade && used.travel
          ? isFa
            ? 'هر دو انجام شد ✓'
            : 'Both Completed ✓'
          : !used.trade && !isChild
            ? isFa
              ? 'بازار و سفر باز است'
              : 'Trade & Sail Open'
            : !used.travel && hasShips
              ? isFa
                ? 'سفر دریایی باز است'
                : 'Voyage Open'
              : isChild && !hasShips
                ? isFa
                  ? 'نیازمند سن ۱۵+ یا کشتی'
                  : 'Needs Age 15+ or Ship'
                : isFa
                  ? 'در دسترس'
                  : 'Available',
      isDone: Boolean(used.trade && used.travel),
      isLocked: Boolean(isChild && !hasShips),
      accent: 'emerald',
      icon: <Compass className="w-6 h-6" />,
    },
    {
      id: 'train',
      category: 'personal',
      title: isFa ? 'تمرین مهارت' : 'Train Skill',
      description: isFa
        ? 'پرورش شمشیرزنی، دریانوردی، قانون، شعر یا تجارت'
        : 'Sharpen combat, sailing, law, skaldcraft, or trade',
      costRiskBadge: isFa ? 'رایگان · بی‌خطر' : 'Free · Safe',
      costRiskTone: 'ice',
      statusLabel: used.train
        ? isFa
          ? 'تمرین انجام شد ✓'
          : 'Trained This Year ✓'
        : isFa
          ? 'آماده تمرین (۱ بار/سال)'
          : 'Available (1/yr)',
      isDone: Boolean(used.train),
      isLocked: false,
      accent: 'ice',
      icon: <GraduationCap className="w-6 h-6" />,
    },
    {
      id: 'faith',
      category: 'personal',
      title: isFa ? 'آیین و خدایان' : 'Gods & Faith',
      description: isFa
        ? 'پیمان با خدایان کهن نورس یا پذیرش غسل تعمید مسیحی'
        : 'Walk with the Old Norse Gods or accept Christian baptism',
      costRiskBadge: isFa ? 'رایگان · تغییر کیش' : 'Free · Faith Shift',
      costRiskTone: 'violet',
      statusLabel: isChild
        ? isFa
          ? 'نیازمند سن ۱۵+'
          : 'Age 15+ Required'
        : faithDone
          ? isFa
            ? 'امسال تغییر یافت ✓'
            : 'Converted This Year ✓'
          : RELIGION_LABELS[lang][state.character.religion],
      isDone: faithDone,
      isLocked: isChild,
      accent: 'violet',
      icon: <Sparkles className="w-6 h-6" />,
    },
  ];

  const categories: {
    id: ActivityCategoryId;
    title: string;
    subtitle: string;
    accent: 'crimson' | 'gold' | 'ice';
    icon: ReactNode;
  }[] = [
    {
      id: 'military',
      title: isFa ? 'نظامی و قلمروگشایی' : 'Military & Expansion',
      subtitle: isFa
        ? 'غارت دریایی، فتح دژهای دشمن و گسترش املاک و مزارع'
        : 'Coastal raids, stronghold sieges & homestead expansion',
      accent: 'crimson',
      icon: <Swords className="w-5 h-5" />,
    },
    {
      id: 'diplomacy',
      title: isFa ? 'دیپلماسی، تالار و دریانوردی' : 'Diplomacy, Court & Voyages',
      subtitle: isFa
        ? 'شورای ثینگ، سوروسات تالار، تجارت بازار و سفر دریایی'
        : 'The Thing assembly, mead-hall feasts, trade & sea voyages',
      accent: 'gold',
      icon: <Flame className="w-5 h-5" />,
    },
    {
      id: 'personal',
      title: isFa ? 'فردی، مهارت و آیین' : 'Personal & Faith',
      subtitle: isFa
        ? 'پرورش مهارت‌های فردی و پیمان با خدایان نورس یا مسیحیت'
        : 'Hone personal skills, walk with the Norse Gods or convert',
      accent: 'ice',
      icon: <GraduationCap className="w-5 h-5" />,
    },
  ];

  const getBadgeToneClasses = (tone: ActivityCardItem['costRiskTone']) => {
    switch (tone) {
      case 'crimson':
        return 'bg-[#DC2626]/20 text-[#FCA5A5] border-[#EF4444]/40';
      case 'amber':
        return 'bg-[#F59E0B]/15 text-[#FCD34D] border-[#F59E0B]/35';
      case 'ice':
        return 'bg-[#38BDF8]/15 text-[#7DD3FC] border-[#38BDF8]/35';
      case 'emerald':
        return 'bg-[#34D399]/15 text-[#6EE7B7] border-[#34D399]/35';
      case 'violet':
        return 'bg-[#A78BFA]/15 text-[#DDD6FE] border-[#A78BFA]/35';
    }
  };

  return (
    <div className="flex flex-col overflow-hidden space-y-3.5 text-start">
      {/* ================================================================= */}
      {/* RECENT HISTORY: LAST 3 PERFORMED ACTIONS & IMMEDIATE RESULTS      */}
      {/* ================================================================= */}
      <div className="rounded-2xl bg-[#0D1520]/95 border border-[#1E2E42] overflow-hidden">
        <button
          type="button"
          onClick={() => setIsRecentHistoryOpen((prev) => !prev)}
          aria-expanded={isRecentHistoryOpen}
          className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 hover:bg-[#131F30] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#38BDF8]/15 border border-[#38BDF8]/35 flex items-center justify-center shrink-0">
              <History className="w-3.5 h-3.5 text-[#38BDF8]" />
            </div>
            <div className="text-start min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-[#F1F5F9]">
                  {isFa ? 'تاریخچه اقدامات اخیر' : 'Recent History'}
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-[#162436] border border-[#243852] text-[10px] font-mono tabular-nums text-[#94A3B8]">
                  {isFa
                    ? `${recentActionLogs.length}/3 اقدام اخیر`
                    : `Last ${recentActionLogs.length}/3`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8] shrink-0">
            <span className="hidden sm:inline">
              {isFa ? 'نتایج فوری' : 'Immediate Results'}
            </span>
            {isRecentHistoryOpen ? (
              <ChevronUp className="w-4 h-4 text-[#94A3B8]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
            )}
          </div>
        </button>

        {isRecentHistoryOpen && (
          <div className="px-3.5 pb-3 pt-1 border-t border-[#172435]">
            {recentActionLogs.length === 0 ? (
              <div className="py-2.5 px-3 rounded-xl bg-[#091019] border border-[#182638] text-xs text-[#94A3B8] flex items-center justify-between gap-2">
                <span>
                  {isFa
                    ? 'هنوز اقدامی ثبت نشده است — یکی از فعالیت‌های زیر را انجام دهید تا نتیجه فوری آن در اینجا نمایش داده شود.'
                    : 'No actions performed yet — select an activity below to see its immediate results here.'}
                </span>
              </div>
            ) : (
              <div className="space-y-2 mt-1">
                {recentActionLogs.map((entry, idx) => {
                  const isLatest = idx === 0;
                  const entryTitle = isFa
                    ? entry.titleFa ?? entry.title ?? 'اقدام انجام‌شده'
                    : entry.title ?? 'Action Performed';
                  const entryText = isFa ? entry.textFa ?? entry.text : entry.text;
                  const entryDeltas =
                    (isFa ? entry.deltasFa ?? entry.deltas : entry.deltas) ?? [];

                  return (
                    <div
                      key={entry.id}
                      className={`p-2.5 rounded-xl border transition-colors ${
                        isLatest
                          ? entry.isDanger
                            ? 'bg-[#221118]/90 border-[#EF4444]/50'
                            : 'bg-[#122033]/95 border-[#38BDF8]/45'
                          : 'bg-[#0A111B]/90 border-[#1A293D]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              isLatest
                                ? 'bg-[#1B2F48] border border-[#38BDF8]/40'
                                : 'bg-[#121D2C] border border-[#213247]'
                            }`}
                          >
                            {renderActionIcon(entry.iconType, entry.id)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-[#F1F5F9] truncate">
                                {entryTitle}
                              </span>
                              {isLatest && (
                                <span className="px-1.5 py-0.2 rounded bg-[#38BDF8]/20 text-[#7DD3FC] text-[10px] font-semibold">
                                  {isFa ? 'جدید' : 'Latest'}
                                </span>
                              )}
                              <span className="text-[10px] font-mono tabular-nums text-[#64748B]">
                                · {isFa ? `سال ${entry.year}` : `${entry.year} AD`}
                              </span>
                            </div>

                            <p className="text-[11px] text-[#94A3B8] line-clamp-1 mt-0.5 leading-relaxed">
                              {entryText}
                            </p>
                          </div>
                        </div>

                        {/* Immediate Result Delta Chips */}
                        {entryDeltas.length > 0 && (
                          <div className="flex flex-wrap items-center justify-end gap-1 shrink-0 max-w-[48%]">
                            {entryDeltas.slice(0, 3).map((d, dIdx) => (
                              <span
                                key={`${entry.id}_d_${dIdx}`}
                                className={`px-1.5 py-0.5 rounded-md border text-[10px] font-mono tabular-nums font-semibold whitespace-nowrap ${getDeltaChipStyle(
                                  d
                                )}`}
                              >
                                {d}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Thrall Freedom Special Banner */}
      {state.character.title === TitleRank.Thrall && (
        <div className="relative p-4 rounded-2xl bg-gradient-to-r from-[#281C0E] via-[#1B1712] to-[#131D2B] border border-[#F59E0B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-hidden">
          <NorseCornerOrnament accent="amber" />
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#F59E0B]/20 text-[#F59E0B] ring-1 ring-[#F59E0B]/40 flex items-center justify-center shrink-0">
              <LockOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-bold text-[#F1F5F9] whitespace-normal break-words leading-snug">
                {isFa ? 'خریدن آزادی خود!' : 'Buy Your Freedom'}
              </div>
              <div className="text-xs text-[#CBD5E1] whitespace-normal break-words leading-relaxed mt-0.5">
                {isFa
                  ? 'رهایی از بندگی، دریافت حق حمل سلاح و +۲۰ شرافت'
                  : 'Break your thrall collar, bear arms as a freeman & gain +20 Honor'}
              </div>
            </div>
          </div>
          <button
            type="button"
            disabled={state.realm.silver < 25}
            onClick={() => onGeneralAction('buy_freedom')}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#0B1118] text-xs font-extrabold shrink-0 cursor-pointer transition-colors"
          >
            {isFa ? 'آزادی (۲۵ نقره)' : 'Buy Freedom (25 Silver)'}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <RuneDivider
            label={
              isFa
                ? 'دسته‌بندی فعالیت‌های سالانه · با رفتن به سال بعد تازه می‌شود'
                : 'Yearly Activity Categories · Resets Next Year'
            }
            accent="amber"
          />
        </div>
        <button
          type="button"
          onClick={handleToggleAllCategories}
          className="min-h-[34px] px-2.5 py-1 rounded-lg bg-[#131D2B] hover:bg-[#19283B] border border-[#233246] hover:border-[#38BDF8]/50 text-[11px] font-semibold text-[#CBD5E1] hover:text-[#F1F5F9] shrink-0 cursor-pointer transition-colors"
        >
          {allCategoriesOpen
            ? isFa
              ? 'بستن همه'
              : 'Collapse All'
            : isFa
              ? 'باز کردن همه'
              : 'Expand All'}
        </button>
      </div>

      {/* Collapsible Category Sections */}
      <div className="space-y-3">
        {categories.map((cat) => {
          const catCards = cards.filter((c) => c.category === cat.id);
          const doneCount = catCards.filter((c) => c.isDone).length;
          const readyCount = catCards.filter((c) => !c.isDone && !c.isLocked).length;
          const allCatDone = doneCount === catCards.length;

          const statusBadge = (
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-mono tabular-nums font-semibold border ${
                allCatDone
                  ? 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/35'
                  : readyCount > 0
                    ? 'bg-[#F59E0B]/15 text-[#FCD34D] border-[#F59E0B]/35'
                    : 'bg-[#1A2738] text-[#94A3B8] border-[#2A3B52]'
              }`}
            >
              {allCatDone
                ? isFa
                  ? 'تکمیل شد ✓'
                  : 'All Done ✓'
                : readyCount > 0
                  ? isFa
                    ? `${readyCount} آماده`
                    : `${readyCount} Ready`
                  : isFa
                    ? `${doneCount}/${catCards.length}`
                    : `${doneCount}/${catCards.length}`}
            </span>
          );

          return (
            <NordicAccordion
              key={cat.id}
              title={cat.title}
              subtitle={cat.subtitle}
              icon={cat.icon}
              accent={cat.accent}
              statusNode={statusBadge}
              isOpen={openCategories[cat.id]}
              onToggle={() => toggleCategory(cat.id)}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {catCards.map((card) => {
                  const isRaid = Boolean(card.isRaidHero);
                  const cardSurface = isRaid
                    ? 'bg-gradient-to-br from-[#3B0D15] via-[#240D14] to-[#131826] border-[#EF4444]/80 hover:border-[#F87171] shadow-[0_8px_28px_rgba(220,38,38,0.22)]'
                    : card.accent === 'ice'
                      ? 'bg-gradient-to-br from-[#102338] via-[#131D2B] to-[#0F1722] border-[#38BDF8]/40 hover:border-[#38BDF8]'
                      : card.accent === 'emerald'
                        ? 'bg-gradient-to-br from-[#0F2422] via-[#131D2B] to-[#0F1722] border-[#34D399]/40 hover:border-[#34D399]'
                        : card.accent === 'violet'
                          ? 'bg-gradient-to-br from-[#1B1730] via-[#131D2B] to-[#0F1722] border-[#A78BFA]/40 hover:border-[#A78BFA]'
                          : card.accent === 'crimson'
                            ? 'bg-gradient-to-br from-[#2C1016] via-[#181522] to-[#0F1722] border-[#EF4444]/55 hover:border-[#EF4444]'
                            : 'bg-gradient-to-br from-[#231911] via-[#131D2B] to-[#0F1722] border-[#F59E0B]/40 hover:border-[#F59E0B]';

                  const iconWrap = isRaid
                    ? 'bg-[#DC2626]/25 text-[#F87171] ring-1 ring-[#EF4444]/60 shadow-[0_0_16px_rgba(239,68,68,0.28)]'
                    : card.accent === 'ice'
                      ? 'bg-[#38BDF8]/15 text-[#38BDF8] ring-1 ring-[#38BDF8]/30'
                      : card.accent === 'emerald'
                        ? 'bg-[#34D399]/15 text-[#34D399] ring-1 ring-[#34D399]/30'
                        : card.accent === 'violet'
                          ? 'bg-[#A78BFA]/15 text-[#A78BFA] ring-1 ring-[#A78BFA]/30'
                          : card.accent === 'crimson'
                            ? 'bg-[#EF4444]/15 text-[#F87171] ring-1 ring-[#EF4444]/35'
                            : 'bg-[#F59E0B]/15 text-[#F59E0B] ring-1 ring-[#F59E0B]/30';

                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setActiveSheet(card.id)}
                      className={`relative min-h-[152px] p-3.5 rounded-2xl border text-start flex flex-col justify-between gap-2.5 transition-all active:scale-[0.98] cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/70 ${cardSurface} ${
                        card.isDone ? 'opacity-80' : ''
                      }`}
                    >
                      <NorseCornerOrnament accent={card.accent} />

                      {/* Top Icon + Cost/Risk Badge */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconWrap}`}
                          >
                            {card.icon}
                          </div>
                          {card.isDone && (
                            <span className="w-6 h-6 rounded-lg bg-[#34D399]/15 text-[#34D399] flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>

                        {/* Title & Wrapped Short Description */}
                        <div className="space-y-1 min-w-0">
                          <div
                            className={`text-sm font-bold whitespace-normal break-words leading-snug ${
                              isRaid ? 'text-[#FFE4E6]' : 'text-[#F1F5F9]'
                            }`}
                          >
                            {card.title}
                          </div>
                          <p className="text-xs text-[#CBD5E1] whitespace-normal break-words leading-relaxed">
                            {card.description}
                          </p>
                        </div>
                      </div>

                      {/* Cost/Risk Badge + Cooldown/Availability State */}
                      <div className="space-y-1.5 pt-2 border-t border-white/8">
                        <div
                          className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-semibold whitespace-normal break-words leading-snug ${getBadgeToneClasses(
                            card.costRiskTone
                          )}`}
                        >
                          {card.costRiskBadge}
                        </div>
                        <div
                          className={`text-xs font-mono tabular-nums whitespace-normal break-words leading-snug ${
                            card.isDone
                              ? 'text-[#34D399] font-semibold'
                              : card.isLocked
                                ? 'text-[#94A3B8]'
                                : isRaid
                                  ? 'text-[#FCA5A5] font-semibold'
                                  : 'text-[#E2E8F0]'
                          }`}
                        >
                          {card.statusLabel}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </NordicAccordion>
          );
        })}
      </div>

      {/* ================================================================= */}
      {/* 1. RAID BOTTOM SHEET                                              */}
      {/* ================================================================= */}
      <NorseBottomSheet
        isOpen={activeSheet === 'raid'}
        onClose={() => setActiveSheet(null)}
        accent="crimson"
        closeLabel={isFa ? 'بستن' : 'Close'}
        title={isFa ? 'غارت و شبیخون دریایی' : 'Launch a Coastal Raid'}
        subtitle={
          isFa
            ? `ناوگان آماده: ${state.realm.longships} کشتی جنگی · ${state.realm.hirdWarriors} جنگجوی هیرد · مهارت رزم ${state.character.skills.combat}`
            : `Forces: ${state.realm.longships} Longships · ${state.realm.hirdWarriors} Warriors · Combat ${state.character.skills.combat}`
        }
        icon={
          <div className="w-11 h-11 rounded-2xl bg-[#DC2626]/20 text-[#F87171] ring-1 ring-[#EF4444]/50 flex items-center justify-center">
            <Swords className="w-6 h-6" />
          </div>
        }
        footer={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={!canRaid}
              onClick={() => {
                onRaid(validRaidTargetId, raidTactic);
                setActiveSheet(null);
              }}
              className="flex-1 min-h-[48px] px-4 rounded-xl bg-[#DC2626] hover:bg-[#EF4444] disabled:bg-[#1E293B] disabled:text-[#64748B] text-white font-extrabold text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Swords className="w-4 h-4 shrink-0" />
              <span>
                {used.raid
                  ? isFa
                    ? 'امسال غارت دریایی انجام شده است ✓'
                    : 'Already Raided This Year ✓'
                  : canRaid
                    ? isFa
                      ? `فرمان یورش به ${raidTargetName}!`
                      : `Launch Raid on ${raidTargetName}!`
                    : isChild
                      ? isFa
                        ? 'نیازمند حداقل ۱۵ سال سن'
                        : 'Requires Age 15+'
                      : isFa
                        ? 'نیازمند ۱ کشتی جنگی و جنگجو'
                        : 'Requires 1 Longship & Warriors'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSheet(null)}
              className="min-h-[48px] px-4 rounded-xl bg-[#182638] hover:bg-[#22354D] border border-[#2A3E59] text-xs font-bold text-[#CBD5E1] hover:text-[#F1F5F9] shrink-0 cursor-pointer transition-colors"
            >
              {isFa ? 'بستن' : 'Close'}
            </button>
          </div>
        }
      >
        {!canRaid && !used.raid && (
          <div className="p-3.5 rounded-xl bg-[#261116] border border-[#EF4444]/45 flex items-start gap-2.5 text-xs text-[#FECACA]">
            <AlertTriangle className="w-4 h-4 text-[#F87171] shrink-0 mt-0.5" />
            <span className="whitespace-normal break-words leading-relaxed">
              {isChild
                ? isFa
                  ? 'شخصیت شما هنوز نوجوان است؛ از ۱۵ سالگی می‌توانید فرماندهی غارت دریایی را بر عهده بگیرید.'
                  : 'You must reach age 15 before leading a longship raid.'
                : isFa
                  ? 'برای غارت دریایی به حداقل ۱ کشتی جنگی (لانگ‌شیپ) و ۱ جنگجوی هیرد نیاز دارید. از تب «بیشتر ← ناوگان» تهیه کنید.'
                  : 'Launching a raid requires at least 1 War Longship and 1 Hird Warrior. Build them via More → Fleet.'}
            </span>
          </div>
        )}

        <NordicSelect
          label={isFa ? 'بندر یا صومعه هدف' : 'Target Coastal Port'}
          value={validRaidTargetId}
          options={raidPortOptions}
          onChange={setRaidTargetId}
          disabled={Boolean(used.raid)}
          icon={<MapPin className="w-4 h-4 text-[#F87171]" />}
        />

        <div className="space-y-2">
          <div className="text-xs font-semibold text-[#CBD5E1]">
            {isFa ? 'انتخاب تاکتیک نبرد:' : 'Choose Battle Tactic:'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {raidTacticCards.map((tac) => {
              const sel = raidTactic === tac.value;
              return (
                <button
                  key={tac.value}
                  type="button"
                  disabled={Boolean(used.raid)}
                  onClick={() => setRaidTactic(tac.value)}
                  className={`min-h-[68px] p-3 rounded-xl border text-start flex flex-col justify-between gap-1.5 transition-colors cursor-pointer disabled:opacity-50 ${
                    sel
                      ? 'bg-[#2C1219] border-[#EF4444] text-[#F1F5F9] ring-1 ring-[#EF4444]/40'
                      : 'bg-[#131D2B] border-[#233246] hover:border-[#EF4444]/60 text-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs sm:text-sm font-bold text-[#F1F5F9] whitespace-normal break-words">
                      {tac.label}
                    </span>
                    <span className="text-xs font-mono text-[#FCA5A5] shrink-0">{tac.tag}</span>
                  </div>
                  <p className="text-xs text-[#94A3B8] whitespace-normal break-words leading-relaxed">
                    {tac.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </NorseBottomSheet>

      {/* ================================================================= */}
      {/* 2. TRAIN SKILL BOTTOM SHEET                                       */}
      {/* ================================================================= */}
      <NorseBottomSheet
        isOpen={activeSheet === 'train'}
        onClose={() => setActiveSheet(null)}
        accent="ice"
        closeLabel={isFa ? 'بستن' : 'Close'}
        title={isFa ? 'تمرین و پرورش مهارت' : 'Train a Personal Skill'}
        subtitle={
          isFa
            ? 'هر سال می‌توانید یک مهارت فردی را بدون هزینه نقره تقویت کنید'
            : 'Choose one skill to hone this year — free of silver cost'
        }
        icon={
          <div className="w-11 h-11 rounded-2xl bg-[#38BDF8]/15 text-[#38BDF8] ring-1 ring-[#38BDF8]/40 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
        }
        footer={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={Boolean(used.train)}
              onClick={() => {
                onTrainSkill(selectedSkill);
                setActiveSheet(null);
              }}
              className="flex-1 min-h-[48px] px-4 rounded-xl bg-[#0284C7] hover:bg-[#38BDF8] hover:text-[#0B1118] disabled:bg-[#1E293B] disabled:text-[#64748B] text-white font-extrabold text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>
                {used.train
                  ? isFa
                    ? 'امسال تمرین انجام شده است ✓'
                    : 'Already Trained This Year ✓'
                  : isFa
                    ? `تمرین «${SKILL_LABELS[lang][selectedSkill]}»`
                    : `Train ${SKILL_LABELS[lang][selectedSkill]}`}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSheet(null)}
              className="min-h-[48px] px-4 rounded-xl bg-[#182638] hover:bg-[#22354D] border border-[#2A3E59] text-xs font-bold text-[#CBD5E1] hover:text-[#F1F5F9] shrink-0 cursor-pointer transition-colors"
            >
              {isFa ? 'بستن' : 'Close'}
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {ALL_TRAINABLE_SKILLS.map((skKey) => {
            const lv = state.character.skills[skKey];
            const isSel = selectedSkill === skKey;
            return (
              <button
                key={skKey}
                type="button"
                disabled={Boolean(used.train)}
                onClick={() => setSelectedSkill(skKey)}
                className={`w-full min-h-[64px] p-3 rounded-xl border text-start flex items-center justify-between gap-3 transition-colors cursor-pointer disabled:opacity-55 ${
                  isSel
                    ? 'bg-[#15283D] border-[#38BDF8] text-[#F1F5F9] ring-1 ring-[#38BDF8]/40'
                    : 'bg-[#131D2B] border-[#233246] hover:border-[#38BDF8]/50 text-[#CBD5E1]'
                }`}
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="text-xs sm:text-sm font-bold text-[#F1F5F9] whitespace-normal break-words leading-snug">
                    {SKILL_LABELS[lang][skKey]}
                  </div>
                  <div className="text-[11px] text-[#94A3B8] whitespace-normal break-words leading-relaxed">
                    {isFa ? SKILL_HINTS[skKey].fa : SKILL_HINTS[skKey].en}
                  </div>
                </div>
                <div className="shrink-0 text-end space-y-1">
                  <div className="text-xs font-mono font-bold tabular-nums text-[#38BDF8]">
                    {isFa ? `سطح ${lv}` : `Lv ${lv}`}
                  </div>
                  <svg
                    viewBox="0 0 100 6"
                    preserveAspectRatio="none"
                    className="w-14 h-1.5 rounded-full overflow-hidden block"
                    aria-hidden="true"
                  >
                    <rect x="0" y="0" width="100" height="6" className="fill-[#090E15]" />
                    <rect
                      x={isFa ? 100 - Math.min(100, lv) : 0}
                      y="0"
                      width={Math.min(100, lv)}
                      height="6"
                      className="fill-[#38BDF8]"
                    />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </NorseBottomSheet>

      {/* ================================================================= */}
      {/* 3. TRADE & VOYAGE BOTTOM SHEET                                    */}
      {/* ================================================================= */}
      <NorseBottomSheet
        isOpen={activeSheet === 'voyage'}
        onClose={() => setActiveSheet(null)}
        accent="emerald"
        closeLabel={isFa ? 'بستن' : 'Close'}
        title={isFa ? 'تجارت و دریانوردی' : 'Trade & Sea Voyage'}
        subtitle={
          isFa
            ? `موقعیت فعلی: بندر ${currentLocName} · مهارت دریانوردی ${effectiveSeamanship}`
            : `Moored at ${currentLocName} · Effective Sailing ${effectiveSeamanship}`
        }
        icon={
          <div className="w-11 h-11 rounded-2xl bg-[#34D399]/15 text-[#34D399] ring-1 ring-[#34D399]/40 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
        }
        footer={
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={Boolean(used.trade) || isChild}
              onClick={() => {
                onGeneralAction('trade_voyage');
                setActiveSheet(null);
              }}
              className="w-full min-h-[46px] px-3.5 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#0B1118] font-extrabold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Scale className="w-4 h-4 shrink-0" />
              <span>
                {used.trade
                  ? isFa
                    ? 'معامله انجام شد ✓'
                    : 'Traded This Year ✓'
                  : isChild
                    ? isFa
                      ? 'تجارت (نیازمند سن ۱۵+)'
                      : 'Trade (Age 15+)'
                    : isFa
                      ? `معامله در ${currentLocName} (+نقره)`
                      : `Trade in ${currentLocName} (+Silver)`}
              </span>
            </button>

            <button
              type="button"
              disabled={!hasShips || Boolean(used.travel)}
              onClick={() => {
                onSail(validSailDestId);
                setActiveSheet(null);
              }}
              className="w-full min-h-[46px] px-3.5 rounded-xl bg-[#0284C7] hover:bg-[#38BDF8] hover:text-[#0B1118] disabled:bg-[#1E293B] disabled:text-[#64748B] text-white font-extrabold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Compass className="w-4 h-4 shrink-0" />
              <span>
                {used.travel
                  ? isFa
                    ? 'سفر انجام شد ✓'
                    : 'Sailed This Year ✓'
                  : hasShips
                    ? isFa
                      ? `سفر دریایی به ${sailDestName}`
                      : `Sail to ${sailDestName}`
                    : isFa
                      ? 'سفر (نیازمند کشتی)'
                      : 'Sail (Needs Ship)'}
              </span>
            </button>
          </div>
        }
      >
        {/* Option A: Local Market Trade */}
        <div className="p-3.5 rounded-2xl bg-[#131D2B] border border-[#233246] space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/15 text-[#F59E0B] flex items-center justify-center shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-[#F1F5F9] whitespace-normal break-words leading-snug">
                  {isFa ? `۱. معامله در بازار ${currentLocName}` : `1. Market Trade in ${currentLocName}`}
                </div>
                <p className="text-xs text-[#94A3B8] whitespace-normal break-words leading-relaxed mt-0.5">
                  {isChild
                    ? isFa
                      ? 'نیازمند حداقل ۱۵ سال سن'
                      : 'Available starting at age 15'
                    : isFa
                      ? `فروش خز، کهربا و کالاهای شمالی برای کسب نقره نقد (ثروت بازار ${currentLoc.baseWealth}/10)`
                      : `Barter furs, amber & northern wares for instant silver (Port wealth ${currentLoc.baseWealth}/10)`}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-[#FBBF24] shrink-0">
              {used.trade ? (isFa ? 'انجام شد ✓' : 'Done ✓') : isFa ? '+نقره' : '+Silver'}
            </span>
          </div>
        </div>

        <RuneDivider label={isFa ? '۲. سفر به بندر دیگر' : '2. Set Sail to Another Port'} accent="ice" />

        {/* Option B: Sail to Destination */}
        <div className="p-3.5 rounded-2xl bg-[#131D2B] border border-[#233246] space-y-3">
          <NordicSelect
            label={isFa ? 'مقصد سفر دریایی' : 'Voyage Destination Port'}
            value={validSailDestId}
            options={sailPortOptions}
            onChange={setSailDestId}
            disabled={Boolean(used.travel)}
            icon={<MapPin className="w-4 h-4 text-[#38BDF8]" />}
          />

          <div className="p-3 rounded-xl bg-[#0B1118] border border-[#1E2D40] flex flex-wrap items-center justify-between gap-2 text-xs font-mono tabular-nums">
            <span className="text-[#CBD5E1]">
              {isFa
                ? `${voyageInfo.nauticalMiles} مایل دریایی · ~${voyageInfo.sailingDays} روز`
                : `${voyageInfo.nauticalMiles} NM · ~${voyageInfo.sailingDays} days`}
            </span>
            <span
              className={
                voyageInfo.dangerPct >= 30
                  ? 'text-[#F87171] font-bold'
                  : 'text-[#38BDF8] font-semibold'
              }
            >
              {isFa ? `خطر دریا: ${voyageInfo.dangerPct}%` : `Sea Risk: ${voyageInfo.dangerPct}%`}
            </span>
          </div>
        </div>
      </NorseBottomSheet>

      {/* ================================================================= */}
      {/* 4. COURT & HALL BOTTOM SHEET                                      */}
      {/* ================================================================= */}
      <NorseBottomSheet
        isOpen={activeSheet === 'hall'}
        onClose={() => setActiveSheet(null)}
        accent="amber"
        closeLabel={isFa ? 'بستن' : 'Close'}
        title={isFa ? 'تالار و شورای ثینگ' : 'Court, Hall & The Thing'}
        subtitle={
          isFa
            ? `خزانه فعلی: ${state.realm.silver} نقره · کسب شرافت، شادی و آوازه در میان مردم`
            : `Treasury: ${state.realm.silver} Silver · Build honor, hall joy, and saga renown`
        }
        icon={
          <div className="w-11 h-11 rounded-2xl bg-[#F59E0B]/15 text-[#F59E0B] ring-1 ring-[#F59E0B]/40 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
        }
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setActiveSheet(null)}
              className="min-h-[44px] px-5 rounded-xl bg-[#182638] hover:bg-[#22354D] border border-[#2A3E59] text-xs font-bold text-[#F1F5F9] cursor-pointer transition-colors"
            >
              {isFa ? 'بستن پنجره' : 'Done / Close'}
            </button>
          </div>
        }
      >
        {/* 1. Speak at the Thing */}
        <div className="p-3.5 rounded-2xl bg-[#131D2B] border border-[#233246] space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="text-sm font-bold text-[#F1F5F9] whitespace-normal break-words">
                {isFa ? 'سخنرانی در شورای ثینگ' : 'Speak at the Thing Assembly'}
              </div>
              <p className="text-xs text-[#94A3B8] whitespace-normal break-words leading-relaxed">
                {isFa
                  ? 'دفاع از قانون و سخنوری در جمع آزادمردان · +۶ شرافت'
                  : 'Argue law and oaths before the assembly of freemen · +6 Honor'}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#34D399] shrink-0">
              {isFa ? 'رایگان' : 'Free'}
            </span>
          </div>
          <button
            type="button"
            disabled={isChild || Boolean(famUsed.act_attend_thing)}
            onClick={() => {
              onGeneralAction('attend_thing');
              setActiveSheet(null);
            }}
            className="w-full min-h-[44px] px-4 rounded-xl bg-[#0284C7] hover:bg-[#38BDF8] hover:text-[#0B1118] disabled:bg-[#1E293B] disabled:text-[#64748B] text-white font-bold text-xs cursor-pointer transition-colors"
          >
            {famUsed.act_attend_thing
              ? isFa
                ? 'امسال در ثینگ شرکت کردید ✓'
                : 'Attended Thing This Year ✓'
              : isChild
                ? isFa
                  ? 'نیازمند سن ۱۵+'
                  : 'Requires Age 15+'
                : isFa
                  ? 'شرکت و سخنرانی در ثینگ (+۶ شرافت)'
                  : 'Speak at the Thing (+6 Honor)'}
          </button>
        </div>

        {/* 2. Host Great Mead-Hall Feast */}
        <div className="p-3.5 rounded-2xl bg-[#131D2B] border border-[#233246] space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="text-sm font-bold text-[#F1F5F9] whitespace-normal break-words">
                {isFa ? 'برگزاری سوروسات بزرگ در تالار' : 'Host Great Mead-Hall Feast'}
              </div>
              <p className="text-xs text-[#94A3B8] whitespace-normal break-words leading-relaxed">
                {isFa
                  ? 'باده و خوراک مفصل برای یاران و خانواده · +۱۰ شادی و روحیه'
                  : 'Roast boar and mead-horns for kin and warriors · +10 Joy'}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#FBBF24] shrink-0">
              {isFa ? '۱۶ نقره' : '16 Silver'}
            </span>
          </div>
          <button
            type="button"
            disabled={isChild || Boolean(famUsed.act_hold_feast) || state.realm.silver < 16}
            onClick={() => {
              onGeneralAction('hold_feast');
              setActiveSheet(null);
            }}
            className="w-full min-h-[44px] px-4 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#0B1118] font-extrabold text-xs cursor-pointer transition-colors"
          >
            {famUsed.act_hold_feast
              ? isFa
                ? 'امسال سوروسات برگزار شد ✓'
                : 'Feast Hosted This Year ✓'
              : state.realm.silver < 16
                ? isFa
                  ? 'نیازمند ۱۶ سکه نقره'
                  : 'Need 16 Silver'
                : isFa
                  ? 'برگزاری سوروسات (۱۶ نقره)'
                  : 'Host Feast (16 Silver)'}
          </button>
        </div>

        {/* 3. Patronize Skald Poet */}
        <div className="p-3.5 rounded-2xl bg-[#131D2B] border border-[#233246] space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="text-sm font-bold text-[#F1F5F9] whitespace-normal break-words">
                {isFa ? 'استخدام شاعر حماسه‌سرا (اسکالد)' : 'Hire a Skald Poet'}
              </div>
              <p className="text-xs text-[#94A3B8] whitespace-normal break-words leading-relaxed">
                {isFa
                  ? 'سرایش اشعار رزمی به نام خاندان شما · +۲۶ شهرت ماندگار'
                  : 'Compose praise-verses of your deeds · +26 Dynasty Fame'}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#FBBF24] shrink-0">
              {isFa ? '۱۵ نقره' : '15 Silver'}
            </span>
          </div>
          <button
            type="button"
            disabled={isChild || Boolean(famUsed.act_patronize_skald) || state.realm.silver < 15}
            onClick={() => {
              onGeneralAction('patronize_skald');
              setActiveSheet(null);
            }}
            className="w-full min-h-[44px] px-4 rounded-xl bg-[#E07A2F] hover:bg-[#F59E0B] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#0B1118] font-extrabold text-xs cursor-pointer transition-colors"
          >
            {famUsed.act_patronize_skald
              ? isFa
                ? 'امسال شاعر استخدام شد ✓'
                : 'Skald Hired This Year ✓'
              : state.realm.silver < 15
                ? isFa
                  ? 'نیازمند ۱۵ سکه نقره'
                  : 'Need 15 Silver'
                : isFa
                  ? 'استخدام اسکالد (۱۵ نقره)'
                  : 'Hire Skald Poet (15 Silver)'}
          </button>
        </div>
      </NorseBottomSheet>

      {/* ================================================================= */}
      {/* 5. LAND & CONQUEST BOTTOM SHEET                                   */}
      {/* ================================================================= */}
      <NorseBottomSheet
        isOpen={activeSheet === 'land'}
        onClose={() => setActiveSheet(null)}
        accent={locIsFortified ? 'crimson' : 'amber'}
        closeLabel={isFa ? 'بستن' : 'Close'}
        title={
          locIsFortified
            ? isFa
              ? `فتح نظامی ${currentLocName}`
              : `Conquer ${currentLocName}`
            : isFa
              ? `گسترش املاک در ${currentLocName}`
              : `Homestead & Land in ${currentLocName}`
        }
        subtitle={
          isFa
            ? `دارایی فعلی: ${state.realm.landFarms} مزرعه در ${state.realm.holdings.length} ملک · خزانه: ${state.realm.silver} نقره`
            : `Current holdings: ${state.realm.landFarms} farms across ${state.realm.holdings.length} estates · ${state.realm.silver} Silver`
        }
        icon={
          <div className="w-11 h-11 rounded-2xl bg-[#F59E0B]/15 text-[#F59E0B] ring-1 ring-[#F59E0B]/40 flex items-center justify-center">
            <Castle className="w-6 h-6" />
          </div>
        }
        footer={
          <div className="flex items-center gap-2.5">
            {locIsFortified && onConquerCity ? (
              <button
                type="button"
                disabled={
                  isChild ||
                  Boolean(used.settle) ||
                  state.realm.longships <= 0 ||
                  state.realm.hirdWarriors < 12
                }
                onClick={() => {
                  onConquerCity(currentLoc.id);
                  setActiveSheet(null);
                }}
                className="flex-1 min-h-[48px] px-4 rounded-xl bg-[#DC2626] hover:bg-[#EF4444] disabled:bg-[#1E293B] disabled:text-[#64748B] text-white font-extrabold text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Swords className="w-4 h-4 shrink-0" />
                <span>
                  {used.settle
                    ? isFa
                      ? 'امسال اقدام زمین/فتح انجام شد ✓'
                      : 'Already Used Land/Conquest This Year ✓'
                    : state.realm.longships <= 0 || state.realm.hirdWarriors < 12
                      ? isFa
                        ? 'نیازمند ۱ کشتی جنگی و ۱۲+ جنگجو'
                        : 'Requires 1 Longship & 12+ Warriors'
                      : isFa
                        ? `آغاز محاصره و فتح ${currentLocName}!`
                        : `Storm & Conquer ${currentLocName}!`}
                </span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isChild || Boolean(used.settle) || state.realm.silver < 35}
                onClick={() => {
                  onGeneralAction('farm_settle');
                  setActiveSheet(null);
                }}
                className="flex-1 min-h-[48px] px-4 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#0B1118] font-extrabold text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Castle className="w-4 h-4 shrink-0" />
                <span>
                  {used.settle
                    ? isFa
                      ? 'امسال مزرعه خریداری شد ✓'
                      : 'Already Claimed Land This Year ✓'
                    : state.realm.silver < 35
                      ? isFa
                        ? 'نیازمند ۳۵ سکه نقره'
                        : 'Need 35 Silver'
                      : isFa
                        ? `خرید مزرعه در ${currentLocName} (۳۵ نقره)`
                        : `Buy Farmland in ${currentLocName} (35 Silver)`}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveSheet(null)}
              className="min-h-[48px] px-4 rounded-xl bg-[#182638] hover:bg-[#22354D] border border-[#2A3E59] text-xs font-bold text-[#CBD5E1] hover:text-[#F1F5F9] shrink-0 cursor-pointer transition-colors"
            >
              {isFa ? 'بستن' : 'Close'}
            </button>
          </div>
        }
      >
        {locIsFortified && onConquerCity ? (
          <div className="p-4 rounded-2xl bg-[#241117] border border-[#EF4444]/50 space-y-2.5">
            <div className="text-sm font-bold text-[#F1F5F9] whitespace-normal break-words">
              {isFa
                ? `«${currentLocName}» یک دژ مستحکم دشمن است (دفاع ${currentLoc.baseDefense}/10)`
                : `${currentLocName} is a Fortified Stronghold (Defense ${currentLoc.baseDefense}/10)`}
            </div>
            <p className="text-xs text-[#CBD5E1] whitespace-normal break-words leading-relaxed">
              {isFa
                ? 'زمین‌های شهرهای مستحکم با نقره فروخته نمی‌شوند. برای تصاحب آن باید با حداقل ۱ کشتی جنگی و ۱۲ جنگجوی هیرد به باروهای شهر یورش ببرید.'
                : 'Fortified cities cannot be purchased with silver. Storm the ramparts with at least 1 War Longship and 12+ Hird Warriors to claim it as your estate.'}
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#131D2B] border border-[#233246] space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm font-bold text-[#F1F5F9] whitespace-normal break-words">
                {isFa ? `خرید مزرعه در ${currentLocName}` : `Buy Farmland in ${currentLocName}`}
              </div>
              <span className="text-xs font-mono font-bold text-[#FBBF24] shrink-0">
                {isFa ? '۳۵ نقره' : '35 Silver'}
              </span>
            </div>
            <p className="text-xs text-[#CBD5E1] whitespace-normal break-words leading-relaxed">
              {isFa
                ? 'هر مزرعه درآمد سالانه نقره و ذخیره غله خاندان را افزایش می‌دهد و راه رسیدن به مقام بونده، هرسیر و یارل را هموار می‌کند.'
                : 'Each farmstead increases yearly harvest stores and silver income while advancing you toward Bonde, Hersir, and Jarl rank.'}
            </p>
          </div>
        )}
      </NorseBottomSheet>

      {/* ================================================================= */}
      {/* 6. GODS & FAITH BOTTOM SHEET                                      */}
      {/* ================================================================= */}
      <NorseBottomSheet
        isOpen={activeSheet === 'faith'}
        onClose={() => setActiveSheet(null)}
        accent="violet"
        closeLabel={isFa ? 'بستن' : 'Close'}
        title={isFa ? 'آیین و خدایان' : 'Gods, Oaths & Baptism'}
        subtitle={
          isFa
            ? `آیین کنونی شما: ${RELIGION_LABELS[lang][state.character.religion]}`
            : `Current Faith: ${RELIGION_LABELS[lang][state.character.religion]}`
        }
        icon={
          <div className="w-11 h-11 rounded-2xl bg-[#A78BFA]/15 text-[#A78BFA] ring-1 ring-[#A78BFA]/40 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
        }
        footer={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isChild || faithDone}
              onClick={() => {
                onGeneralAction(
                  state.character.religion === Religion.Christian
                    ? 'convert_pagan'
                    : 'convert_christian'
                );
                setActiveSheet(null);
              }}
              className="flex-1 min-h-[48px] px-4 rounded-xl bg-[#8B5CF6] hover:bg-[#A78BFA] hover:text-[#0B1118] disabled:bg-[#1E293B] disabled:text-[#64748B] text-white font-extrabold text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>
                {faithDone
                  ? isFa
                    ? 'امسال تغییر آیین انجام شده است ✓'
                    : 'Already Converted This Year ✓'
                  : isChild
                    ? isFa
                      ? 'نیازمند سن ۱۵+'
                      : 'Requires Age 15+'
                    : state.character.religion === Religion.Christian
                      ? isFa
                        ? 'بازگشت به آیین خدایان نورس'
                        : 'Embrace Old Norse Gods'
                      : isFa
                        ? 'پذیرش غسل تعمید مسیحی'
                        : 'Accept Christian Baptism'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSheet(null)}
              className="min-h-[48px] px-4 rounded-xl bg-[#182638] hover:bg-[#22354D] border border-[#2A3E59] text-xs font-bold text-[#CBD5E1] hover:text-[#F1F5F9] shrink-0 cursor-pointer transition-colors"
            >
              {isFa ? 'بستن' : 'Close'}
            </button>
          </div>
        }
      >
        <div className="p-4 rounded-2xl bg-[#131D2B] border border-[#233246] space-y-2.5">
          <div className="text-sm font-bold text-[#F1F5F9] whitespace-normal break-words">
            {state.character.religion === Religion.Christian
              ? isFa
                ? 'بازگشت به آیین خدایان کهن اسکاندیناوی'
                : 'Return to the Old Norse Gods'
              : isFa
                ? 'پذیرش غسل تعمید مسیحی'
                : 'Accept Christian Baptism'}
          </div>
          <p className="text-xs text-[#CBD5E1] whitespace-normal break-words leading-relaxed">
            {state.character.religion === Religion.Christian
              ? isFa
                ? 'برافراشتن دوباره نشان چکش ثور، قربانی در نیایشگاه هوف و جلب وفاداری جنگجویان سنتی.'
                : 'Raise Thor’s hammer once more, unlock Pagan Hof temples, and rally traditional Norse warriors.'
              : isFa
                ? 'بهبود روابط تجاری با شاهان مسیحی اروپا و امکان ساخت کلیسای چوبی استیو در املاک.'
                : 'Improve trade ties with Christian realms and unlock Stave Church construction on your estates.'}
          </p>
        </div>
      </NorseBottomSheet>
    </div>
  );
}
