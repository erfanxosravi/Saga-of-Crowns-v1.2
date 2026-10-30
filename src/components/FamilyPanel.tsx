import { ReactNode, useState } from 'react';
import {
  AlertTriangle,
  Award,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Coins,
  Compass,
  Crown,
  Flame,
  Gift,
  GraduationCap,
  Heart,
  HeartHandshake,
  Home,
  MapPin,
  MessageCircle,
  Quote,
  Scale,
  Shield,
  Skull,
  Sparkles,
  Swords,
  UserCheck,
  Users,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { SETTLEMENTS_BY_ID } from '../data/geography';
import { ALL_TRAITS_MAP } from '../data/namesAndTraits';
import type { FamilyInteractionType } from '../engine/gameEngine';
import {
  formatPersonName,
  SETTLEMENTS_FA,
  TRAITS_FA,
} from '../i18n/gameDataFa';
import {
  CLASS_SHORT_LABELS_I18N,
  EPITHET_FA,
  formatAgeLabel,
  RELIGION_LABELS,
  ROLE_LABELS,
  SHORT_TITLE_LABELS,
} from '../i18n/ui';
import {
  FullGameState,
  RelationRole,
  RelationshipPerson,
  Sex,
  SocialClass,
  TitleRank,
} from '../types/game';
import {
  NorseAccent,
  NorseBottomSheet,
  NorseCornerOrnament,
  RuneDivider,
} from './NorseMotifs';
import { VikingPortrait } from './VikingPortrait';

interface FamilyPanelProps {
  state: FullGameState;
  onFamilyAction: (
    action: 'court_spouse' | 'divorce_spouse' | 'pay_wergild' | 'holmgang_rival',
    targetId?: string
  ) => void;
  onMemberInteraction: (personId: string, interaction: FamilyInteractionType) => void;
}

const HOUSEHOLD_ROLES = new Set<RelationRole>([
  'Spouse',
  'Concubine',
  'Child',
  'Foster-Child',
]);

const ALLY_ROLES = new Set<RelationRole>(['Sworn Brother', 'Sworn Sister']);

const ENEMY_ROLES = new Set<RelationRole>(['Rival', 'Blood-Feud Enemy']);

type ModalTabId = 'interactions' | 'dossier';

function mapSocialClassToPortraitRank(sc: SocialClass): TitleRank {
  switch (sc) {
    case SocialClass.Royal:
      return TitleRank.Konungr;
    case SocialClass.JarlKin:
      return TitleRank.Jarl;
    case SocialClass.HersirKin:
      return TitleRank.Hersir;
    case SocialClass.Bonde:
      return TitleRank.Bonde;
    case SocialClass.Thrall:
      return TitleRank.Thrall;
    case SocialClass.Karl:
    default:
      return TitleRank.Freeman;
  }
}

function hashSeed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function derivePersonDetailedStats(p: RelationshipPerson) {
  const h = hashSeed(p.id);
  const ageFactor = p.age < 14 ? 0.65 : p.age > 55 ? 0.78 : 1.0;

  let health = Math.round((68 + (h % 28)) * (p.age > 60 ? 0.75 : 1));
  let martial = Math.round((38 + ((h >> 3) % 52)) * ageFactor);
  let wisdom = Math.round(42 + ((h >> 6) % 48) + Math.min(15, Math.floor(p.age * 0.25)));
  let charisma = Math.round(44 + ((h >> 9) % 46));

  if (p.traits.includes('strong_limbed') || p.traits.includes('brave')) {
    martial = Math.min(99, martial + 16);
    health = Math.min(100, health + 8);
  }
  if (p.traits.includes('sickly')) {
    health = Math.max(25, health - 24);
  }
  if (p.traits.includes('cunning') || p.traits.includes('rune_wise')) {
    wisdom = Math.min(99, wisdom + 18);
  }
  if (p.traits.includes('charismatic') || p.traits.includes('poet_tongue')) {
    charisma = Math.min(99, charisma + 18);
  }

  return {
    health: Math.max(20, Math.min(100, health)),
    martial: Math.max(10, Math.min(99, martial)),
    wisdom: Math.max(15, Math.min(99, wisdom)),
    charisma: Math.max(15, Math.min(99, charisma)),
  };
}

function getStatGradeLabel(
  statKey: 'health' | 'martial' | 'wisdom' | 'charisma',
  val: number,
  isFa: boolean
): string {
  if (statKey === 'health') {
    if (val >= 80) return isFa ? 'نیرومند و تندرست' : 'Vigorous';
    if (val >= 55) return isFa ? 'سالم و استوار' : 'Healthy';
    return isFa ? 'نیازمند مراقبت' : 'Frail';
  }
  if (statKey === 'martial') {
    if (val >= 78) return isFa ? 'جنگجوی نامدار' : 'Battle-Hardened';
    if (val >= 50) return isFa ? 'رزم‌آور کارآزموده' : 'Capable Fighter';
    return isFa ? 'تازه‌کار در رزم' : 'Untested';
  }
  if (statKey === 'wisdom') {
    if (val >= 78) return isFa ? 'خردمند و دوراندیش' : 'Wise & Shrewd';
    if (val >= 50) return isFa ? 'آگاه و مدبر' : 'Discerning';
    return isFa ? 'ساده‌دل و جوان' : 'Inexperienced';
  }
  if (val >= 78) return isFa ? 'سخنور و محبوب تالار' : 'Silver-Tongued';
  if (val >= 50) return isFa ? 'خوش‌برخورد و محترم' : 'Well-Regarded';
  return isFa ? 'کم‌سخن و آرام' : 'Reserved';
}

function getPersonTemperament(p: RelationshipPerson, isFa: boolean, isEnemy: boolean): string {
  if (isEnemy) {
    if (p.affinity < 25) return isFa ? 'کینه‌توز و تشنه انتقام' : 'Vengeful & Bitter';
    if (p.affinity < 50) return isFa ? 'خصمانه و سرسخت' : 'Hostile & Defiant';
    return isFa ? 'محتاط و آماده مذاکره' : 'Wary & Open to Terms';
  }
  if (p.affinity >= 85) return isFa ? 'وفادار، صمیمی و فداکار' : 'Devoted & Warmhearted';
  if (p.affinity >= 65) return isFa ? 'همدل و پشتیبان خاندان' : 'Supportive & Steadfast';
  if (p.affinity >= 45) return isFa ? 'آرام و میانه‌رو' : 'Calm & Reserved';
  return isFa ? 'دلخور و سردمزاج' : 'Distant & Discontent';
}

function getPersonDialogueQuote(p: RelationshipPerson, isFa: boolean, isEnemy: boolean): string {
  if (isEnemy) {
    if (p.affinity >= 50) {
      return isFa
        ? '«شاید زمان آن رسیده باشد که پیش از ریخته شدن خون بیشتر، سخن آخر را بشنویم…»'
        : '“Perhaps it is time we heard terms before more blood stains the snow…”';
    }
    return isFa
      ? '«این کینه‌ی کهنه تنها با نقره‌ی ورگیلد یا تیغ فولاد در میدان هولم‌گانگ پاک می‌شود!»'
      : '“This feud ends only with Wergild silver or cold iron inside the staked ring!”';
  }

  if (p.age < 7) {
    return isFa
      ? '«وقتی بزرگ شدم، می‌خواهم مثل تو سپر و شمشیر دستم بگیرم و به دریا بزنم!»'
      : '“When I grow tall, I want to carry a painted shield and sail with your fleet!”';
  }

  if (p.role === 'Spouse') {
    if (p.affinity >= 80) {
      return isFa
        ? '«آتش این تالار به نام و شکوه تو گرم است؛ تا آخرین نفس کنار تو و فرزندانمان ایستاده‌ام.»'
        : '“Our longhouse hearth burns bright under your rule; my heart and counsel are ever yours.”';
    }
    return isFa
      ? '«امیدوارم در میان سفرها و نبردها، وقت بیشتری برای اهل خانه و تالار بگذاری.»'
      : '“Between campaigns and councils, remember those who keep the hearth warm for you.”';
  }

  if (p.role === 'Child' || p.role === 'Foster-Child') {
    if (p.isHeirEligible) {
      return isFa
        ? '«هر روز در حیاط تالار تمرین می‌کنم تا روزی نام و میراث خاندانمان را سربلند نگه دارم.»'
        : '“I train each day so that I may honor your name and carry our dynasty’s banner.”';
    }
    return isFa
      ? '«فرمان بده؛ چه در میدان شکار و چه در شورای تالار، آماده یادگیری از تو هستم.»'
      : '“Give the word — whether in the hunting woods or the shield-yard, I am ready to learn.”';
  }

  if (p.role === 'Sworn Brother' || p.role === 'Sworn Sister') {
    return isFa
      ? '«پیمان خونی ما شکستنی نیست؛ سپر من همیشه در دیواره‌ی نبرد کنار سپر توست!»'
      : '“Our blood-oath stands unbowed; my shield is locked beside yours in every storm!”';
  }

  if (p.affinity >= 75) {
    return isFa
      ? '«افتخار می‌کنم که هم‌خون تو هستم؛ نام خاندان ما در تمام سواحل شمال طنین انداخته است.»'
      : '“Proud am I to share your blood; our house’s renown echoes across the northern fjords.”';
  }

  if (p.affinity < 40) {
    return isFa
      ? '«مدت‌هاست در این تالار کسی جویای حال من نشده است…»'
      : '“It has been many moons since my voice was heeded in this hall…”';
  }

  return isFa
    ? '«سفرها و تصمیم‌های پیش رویت را به فال نیک می‌گیرم؛ خدایان شمال نگهدار خاندانمان باشند.»'
    : '“May the gods grant fair winds to our house in the seasons ahead.”';
}

type ValhallaItem =
  | { kind: 'ancestor'; data: FullGameState['ancestors'][number] }
  | { kind: 'fallen'; data: RelationshipPerson };

export function FamilyPanel({
  state,
  onFamilyAction,
  onMemberInteraction,
}: FamilyPanelProps) {
  const lang = state.settings.language;
  const isFa = lang === 'fa';

  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<ModalTabId>('interactions');
  const [navDirection, setNavDirection] = useState<1 | -1>(1);
  const [actionPulseKey, setActionPulseKey] = useState<number>(0);
  const [floatingBurst, setFloatingBurst] = useState<{
    id: number;
    label: string;
    tone: 'emerald' | 'amber' | 'ice' | 'crimson' | 'violet';
  } | null>(null);
  const [selectedValhallaKey, setSelectedValhallaKey] = useState<string | null>(null);
  const [valhallaNavDirection, setValhallaNavDirection] = useState<1 | -1>(1);
  const [confirmingDivorce, setConfirmingDivorce] = useState<boolean>(false);
  const [showAllValhalla, setShowAllValhalla] = useState<boolean>(false);
  const [lastModalFeedback, setLastModalFeedback] = useState<{
    message: string;
    quote: string;
  } | null>(null);

  const livingSpouse = state.relationships.find((r) => r.role === 'Spouse' && r.alive);

  const householdList = state.relationships.filter(
    (r) => r.alive && HOUSEHOLD_ROLES.has(r.role)
  );
  const kinList = state.relationships.filter(
    (r) =>
      r.alive &&
      !HOUSEHOLD_ROLES.has(r.role) &&
      !ALLY_ROLES.has(r.role) &&
      !ENEMY_ROLES.has(r.role)
  );
  const alliesList = state.relationships.filter(
    (r) => r.alive && ALLY_ROLES.has(r.role)
  );
  const enemiesList = state.relationships.filter(
    (r) => r.alive && ENEMY_ROLES.has(r.role)
  );
  const fallenRelationships = state.relationships.filter((r) => !r.alive);

  // Ordered flat list of all living relationships for smooth character-to-character navigation
  const allLivingOrdered: RelationshipPerson[] = [
    ...householdList,
    ...kinList,
    ...alliesList,
    ...enemiesList,
  ];

  // Determine the single primary heir ID (first eligible child/kin according to succession rules)
  const primaryHeirId =
    state.relationships
      .filter(
        (r) =>
          r.alive &&
          (r.role === 'Child' ||
            r.role === 'Foster-Child' ||
            r.role === 'Sibling' ||
            r.role === 'Sworn Brother' ||
            r.role === 'Sworn Sister')
      )
      .sort((a, b) => {
        if (Boolean(a.isHeirEligible) !== Boolean(b.isHeirEligible)) {
          return a.isHeirEligible ? -1 : 1;
        }
        const priority = (role: RelationshipPerson['role']) =>
          role === 'Child' ? 0 : role === 'Foster-Child' ? 1 : role === 'Sibling' ? 2 : 3;
        const diff = priority(a.role) - priority(b.role);
        return diff !== 0 ? diff : b.age - a.age;
      })[0]?.id ?? null;

  const isAdult = state.character.age >= 17;
  const divorceCost = Math.min(
    state.realm.silver,
    Math.max(10, Math.round(state.realm.silver * 0.2))
  );

  const selectedPerson = selectedPersonId
    ? state.relationships.find((r) => r.id === selectedPersonId && r.alive) ?? null
    : null;

  const openPersonSheet = (personId: string) => {
    setConfirmingDivorce(false);
    setLastModalFeedback(null);
    setFloatingBurst(null);
    setNavDirection(1);
    setModalTab('interactions');
    setSelectedPersonId(personId);
  };

  const closePersonSheet = () => {
    setConfirmingDivorce(false);
    setLastModalFeedback(null);
    setFloatingBurst(null);
    setSelectedPersonId(null);
  };

  const switchPersonInModal = (direction: -1 | 1) => {
    if (!selectedPerson || allLivingOrdered.length <= 1) return;
    const currentIdx = allLivingOrdered.findIndex((item) => item.id === selectedPerson.id);
    if (currentIdx < 0) return;
    const nextIdx = (currentIdx + direction + allLivingOrdered.length) % allLivingOrdered.length;
    setNavDirection(direction);
    setConfirmingDivorce(false);
    setLastModalFeedback(null);
    setFloatingBurst(null);
    setSelectedPersonId(allLivingOrdered[nextIdx].id);
  };

  const renderSectionHeader = (
    title: string,
    count: number,
    icon: ReactNode,
    accent: NorseAccent
  ) => {
    const iconTone =
      accent === 'crimson'
        ? 'bg-blood-500/15 text-accent-crimson ring-1 ring-blood-500/35'
        : accent === 'ice'
          ? 'bg-status-ice/15 text-accent-ice ring-1 ring-status-ice/35'
          : accent === 'emerald'
            ? 'bg-status-emerald/15 text-accent-emerald ring-1 ring-status-emerald/35'
            : accent === 'slate'
              ? 'bg-surface-secondary text-ink-secondary ring-1 ring-border-subtle'
              : 'bg-gold-500/15 text-accent-amber ring-1 ring-gold-500/35';

    return (
      <div className="space-y-1.5 pt-1">
        <RuneDivider accent={accent} />
        <div className="flex items-center justify-between gap-2 px-0.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconTone}`}>
              {icon}
            </div>
            <h3 className="font-saga text-base sm:text-lg font-bold text-ink-primary whitespace-normal break-words leading-snug">
              {title}
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-surface-secondary border border-border-subtle text-xs font-mono tabular-nums text-ink-muted shrink-0">
            {count}
          </span>
        </div>
      </div>
    );
  };

  // Compact Person Row: Appearance (Avatar) + Name + Animated Subtle Bond Bar
  const renderCompactCharacterRow = (
    p: RelationshipPerson,
    groupAccent: NorseAccent,
    idx: number
  ) => {
    const isEnemy = ENEMY_ROLES.has(p.role);
    const isPrimaryHeir = p.id === primaryHeirId;
    const displayName = formatPersonName(p.name, lang);
    const epText = p.epithet
      ? isFa
        ? ` «${EPITHET_FA[p.epithet] ?? p.epithet}»`
        : ` "${p.epithet}"`
      : '';

    const pct = Math.max(0, Math.min(100, isEnemy ? 100 - p.affinity : p.affinity));

    const borderClass = isEnemy
      ? 'border-blood-600/45 hover:border-blood-500'
      : groupAccent === 'amber'
        ? 'border-gold-500/35 hover:border-gold-500'
        : groupAccent === 'emerald'
          ? 'border-status-emerald/35 hover:border-status-emerald'
          : 'border-border-subtle hover:border-status-ice';

    const barColorClass = isEnemy
      ? 'bg-blood-500'
      : pct >= 70
        ? 'bg-status-emerald'
        : pct >= 45
          ? 'bg-gold-500'
          : 'bg-blood-500';

    return (
      <motion.button
        key={p.id}
        type="button"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.24,
          delay: Math.min(idx * 0.04, 0.24),
          ease: 'easeOut',
        }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.985 }}
        onClick={() => openPersonSheet(p.id)}
        className={`group relative w-full p-2.5 rounded-xl bg-surface-card hover:bg-surface-secondary border ${borderClass} flex flex-col gap-2 text-start transition-colors cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/70`}
      >
        <div className="flex items-center justify-between gap-2.5 w-full">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative shrink-0 transition-transform duration-200 group-hover:scale-105">
              <VikingPortrait
                age={p.age}
                sex={p.sex}
                traits={p.traits}
                title={mapSocialClassToPortraitRank(p.socialClass)}
                seedId={p.id}
                size={44}
              />
              {isPrimaryHeir && (
                <motion.span
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  title={isFa ? 'وارث اول خاندان' : 'Primary Heir'}
                  className="absolute -top-1 -end-1 w-4 h-4 rounded-full bg-gold-500 text-nordic-950 flex items-center justify-center shadow-sm"
                >
                  <Crown className="w-2.5 h-2.5" />
                </motion.span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-bold text-ink-primary truncate">
                {displayName}
                {epText}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-ink-muted truncate mt-0.5">
                <span>{ROLE_LABELS[lang][p.role]}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{formatAgeLabel(p.age, lang)}</span>
                {isPrimaryHeir && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-accent-amber font-semibold">
                      {isFa ? 'وارث اول' : 'Primary Heir'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`text-[11px] font-mono tabular-nums font-bold ${
                isEnemy
                  ? 'text-accent-crimson'
                  : pct >= 70
                    ? 'text-accent-emerald'
                    : pct >= 45
                      ? 'text-accent-amber'
                      : 'text-accent-crimson'
              }`}
            >
              {pct}%
            </span>
            <div className="w-7 h-7 rounded-lg bg-surface-secondary border border-border-subtle flex items-center justify-center text-ink-muted group-hover:text-accent-amber transition-colors">
              {isFa ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {/* Sleek Animated Mini Bond / Hostility Strip */}
        <div className="h-1 w-full rounded-full bg-surface-canvas overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            className={`h-full rounded-full ${barColorClass}`}
          />
        </div>
      </motion.button>
    );
  };

  const valhallaItems: ValhallaItem[] = [
    ...state.ancestors
      .slice()
      .reverse()
      .map((a) => ({ kind: 'ancestor' as const, data: a })),
    ...fallenRelationships.map((f) => ({ kind: 'fallen' as const, data: f })),
  ];

  const visibleValhalla = showAllValhalla ? valhallaItems : valhallaItems.slice(0, 6);
  const selectedValhallaIdx = selectedValhallaKey
    ? valhallaItems.findIndex((item) =>
        item.kind === 'ancestor'
          ? `anc_${item.data.id}` === selectedValhallaKey
          : `fallen_${item.data.id}` === selectedValhallaKey
      )
    : -1;
  const selectedValhallaItem =
    selectedValhallaIdx >= 0 ? valhallaItems[selectedValhallaIdx] : null;

  const getValhallaItemName = (item: ValhallaItem): string => {
    if (item.kind === 'ancestor') {
      return formatPersonName(item.data.fullName.replace(/"/g, ''), lang);
    }
    return formatPersonName(item.data.name, lang);
  };

  const switchValhallaInModal = (direction: -1 | 1) => {
    if (selectedValhallaIdx < 0 || valhallaItems.length <= 1) return;
    setValhallaNavDirection(direction);
    const nextIdx = (selectedValhallaIdx + direction + valhallaItems.length) % valhallaItems.length;
    const nextItem = valhallaItems[nextIdx];
    setSelectedValhallaKey(
      nextItem.kind === 'ancestor' ? `anc_${nextItem.data.id}` : `fallen_${nextItem.data.id}`
    );
  };

  return (
    <div className="flex flex-col overflow-hidden space-y-3.5 text-start">
      {/* ================================================================= */}
      {/* 1. HOUSEHOLD (Spouse, Consorts, Children + Courting if unmarried) */}
      {/* ================================================================= */}
      <section className="space-y-2.5">
        {renderSectionHeader(
          isFa ? 'اهل خانه و خانواده نزدیک' : 'Household',
          householdList.length,
          <Home className="w-4 h-4" />,
          'amber'
        )}

        {isAdult && !livingSpouse && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative p-3.5 rounded-2xl bg-gradient-to-r from-surface-amber-tint via-surface-secondary to-surface-elevated border border-gold-500/45 flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-hidden"
          >
            <NorseCornerOrnament accent="amber" />
            <div className="space-y-0.5 min-w-0">
              <div className="text-xs sm:text-sm font-bold text-ink-primary whitespace-normal break-words">
                {isFa ? 'بدون همسر رسمی در تالار' : 'Unmarried — Seek a Spouse'}
              </div>
              <p className="text-xs text-ink-secondary whitespace-normal break-words leading-relaxed">
                {isFa
                  ? 'با پیوند زناشویی، وارثان قانونی برای ادامه دودمان خود پرورش دهید.'
                  : 'Court a worthy partner to raise heirs and secure your dynasty’s future.'}
              </p>
            </div>
            <button
              type="button"
              disabled={state.realm.silver < 15}
              onClick={() => onFamilyAction('court_spouse')}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:bg-surface-disabled disabled:text-ink-disabled text-nordic-950 text-xs font-extrabold inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer transition-colors"
            >
              <HeartHandshake className="w-4 h-4 shrink-0" />
              <span>{isFa ? 'خواستگاری و ازدواج (۱۵ نقره)' : 'Court & Marry (15 Silver)'}</span>
            </button>
          </motion.div>
        )}

        {householdList.length === 0 ? (
          <div className="p-3 rounded-xl bg-surface-secondary/75 border border-border-subtle text-xs text-ink-muted">
            {isFa
              ? 'هنوز همسر یا فرزندی در خانه ندارید.'
              : 'No spouse or children in your household yet.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {householdList.map((p, idx) => renderCompactCharacterRow(p, 'amber', idx))}
          </div>
        )}
      </section>

      {/* ================================================================= */}
      {/* 2. KIN (Parents, Siblings, Extended Blood Relatives)              */}
      {/* ================================================================= */}
      <section className="space-y-2.5">
        {renderSectionHeader(
          isFa ? 'خویشاوندان خونی' : 'Kin',
          kinList.length,
          <Users className="w-4 h-4" />,
          'ice'
        )}

        {kinList.length === 0 ? (
          <div className="p-3 rounded-xl bg-surface-secondary/75 border border-border-subtle text-xs text-ink-muted">
            {isFa
              ? 'خویشاوند خونی زنده‌ای در کنار شما نیست.'
              : 'No living parents, siblings, or extended kin right now.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {kinList.map((p, idx) => renderCompactCharacterRow(p, 'ice', idx))}
          </div>
        )}
      </section>

      {/* ================================================================= */}
      {/* 3. ALLIES (Sworn Brothers & Sworn Sisters)                        */}
      {/* ================================================================= */}
      <section className="space-y-2.5">
        {renderSectionHeader(
          isFa ? 'متحدان و هم‌پیمانان خونی' : 'Allies',
          alliesList.length,
          <Shield className="w-4 h-4" />,
          'emerald'
        )}

        {alliesList.length === 0 ? (
          <div className="p-3 rounded-xl bg-surface-secondary/75 border border-border-subtle text-xs text-ink-muted">
            {isFa
              ? 'هنوز خواهر یا برادر قسم‌خورده‌ای ندارید.'
              : 'No sworn shield-companions yet.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {alliesList.map((p, idx) => renderCompactCharacterRow(p, 'emerald', idx))}
          </div>
        )}
      </section>

      {/* ================================================================= */}
      {/* 4. ENEMIES / BLOOD FEUDS                                          */}
      {/* ================================================================= */}
      <section className="space-y-2.5">
        {renderSectionHeader(
          isFa ? 'دشمنان و کینه‌های خونی' : 'Enemies & Blood Feuds',
          enemiesList.length,
          <Swords className="w-4 h-4" />,
          'crimson'
        )}

        {enemiesList.length === 0 ? (
          <div className="p-3 rounded-xl bg-surface-secondary/75 border border-border-subtle text-xs text-ink-muted">
            {isFa
              ? 'در حال حاضر هیچ دشمن خونی یا رقیب سرسختی ندارید.'
              : 'Your hall currently stands free of active rivals and blood feuds.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {enemiesList.map((p, idx) => renderCompactCharacterRow(p, 'crimson', idx))}
          </div>
        )}
      </section>

      {/* ================================================================= */}
      {/* 5. ANCESTORS (IN VALHALLA) — COMPACT AVATAR + NAME                */}
      {/* ================================================================= */}
      <section className="space-y-2.5">
        {renderSectionHeader(
          isFa ? 'نیاکان و درگذشتگان (در والهالا)' : 'Ancestors (in Valhalla)',
          valhallaItems.length,
          <Skull className="w-4 h-4" />,
          'slate'
        )}

        {valhallaItems.length === 0 ? (
          <div className="p-3 rounded-xl bg-surface-secondary/75 border border-border-subtle text-xs text-ink-muted">
            {isFa
              ? 'هنوز هیچ‌یک از نیاکان یا خویشاوندان به تالار والهالا نپیوسته‌اند.'
              : 'No departed rulers or fallen kin have entered Valhalla’s halls yet.'}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {visibleValhalla.map((item, idx) => {
                if (item.kind === 'ancestor') {
                  const anc = item.data;
                  const key = `anc_${anc.id}`;
                  return (
                    <motion.button
                      key={key}
                      type="button"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.18) }}
                      whileHover={{ y: -1.5 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => {
                        setValhallaNavDirection(1);
                        setSelectedValhallaKey(key);
                      }}
                      className="w-full p-2.5 rounded-xl bg-surface-card hover:bg-surface-secondary border border-border-subtle hover:border-gold-500/50 flex items-center justify-between gap-2.5 text-start transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="opacity-85 grayscale-[30%] shrink-0">
                          <VikingPortrait
                            age={anc.ageAtDeath}
                            sex={Sex.Male}
                            traits={[]}
                            title={anc.title}
                            seedId={anc.id}
                            size={40}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-bold text-ink-primary truncate">
                            {formatPersonName(anc.fullName.replace(/"/g, ''), lang)}
                          </div>
                          <div className="text-[11px] text-accent-amber truncate mt-0.5">
                            {isFa
                              ? `فرمانروای نسل ${anc.generation} · ${anc.birthYear}–${anc.deathYear}`
                              : `Gen ${anc.generation} Ruler · ${anc.birthYear}–${anc.deathYear}`}
                          </div>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-lg bg-surface-secondary border border-border-subtle flex items-center justify-center text-ink-muted shrink-0">
                        {isFa ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </motion.button>
                  );
                }

                const d = item.data;
                const key = `fallen_${d.id}`;
                return (
                  <motion.button
                    key={key}
                    type="button"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.18) }}
                    whileHover={{ y: -1.5 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => {
                      setValhallaNavDirection(1);
                      setSelectedValhallaKey(key);
                    }}
                    className="w-full p-2.5 rounded-xl bg-surface-card hover:bg-surface-secondary border border-border-subtle hover:border-border-strong flex items-center justify-between gap-2.5 text-start transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="opacity-75 grayscale-[45%] shrink-0">
                        <VikingPortrait
                          age={d.age}
                          sex={d.sex}
                          traits={d.traits}
                          title={mapSocialClassToPortraitRank(d.socialClass)}
                          seedId={d.id}
                          size={40}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-bold text-ink-secondary truncate">
                          {formatPersonName(d.name, lang)}
                        </div>
                        <div className="text-[11px] text-ink-muted truncate mt-0.5">
                          {isFa
                            ? `${ROLE_LABELS.fa[d.role]} مرحوم · ${formatAgeLabel(d.age, 'fa')}`
                            : `Late ${ROLE_LABELS.en[d.role]} · ${formatAgeLabel(d.age, 'en')}`}
                        </div>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-surface-secondary border border-border-subtle flex items-center justify-center text-ink-muted shrink-0">
                      {isFa ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {valhallaItems.length > 6 && (
              <button
                type="button"
                onClick={() => setShowAllValhalla((v) => !v)}
                className="w-full min-h-[40px] px-4 py-2 rounded-xl bg-surface-secondary hover:bg-surface-interactive border border-border-subtle text-xs font-semibold text-ink-secondary inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                {showAllValhalla ? (
                  <>
                    <ChevronUp className="w-4 h-4 text-accent-ice" />
                    <span>{isFa ? 'نمایش کمتر' : 'Show Fewer'}</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 text-accent-ice" />
                    <span>
                      {isFa
                        ? `نمایش تمام ${valhallaItems.length} درگذشته در والهالا`
                        : `Show All ${valhallaItems.length} in Valhalla`}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </section>

      {/* ================================================================= */}
      {/* LIVING PERSON ROYAL DOSSIER & INTERACTIVE MODAL WINDOW            */}
      {/* ================================================================= */}
      {selectedPerson && (() => {
        const p = selectedPerson;
        const isEnemy = ENEMY_ROLES.has(p.role);
        const isChildOrFoster = p.role === 'Child' || p.role === 'Foster-Child';
        const isSpouse = p.role === 'Spouse';
        const isAlly = ALLY_ROLES.has(p.role);
        const isPrimaryHeir = p.id === primaryHeirId;
        const canBeDesignatedHeir =
          !isEnemy &&
          !isSpouse &&
          (p.role === 'Child' ||
            p.role === 'Foster-Child' ||
            p.role === 'Sibling' ||
            p.role === 'Sworn Brother' ||
            p.role === 'Sworn Sister');
        const canSwearBloodOath =
          !isEnemy &&
          !isSpouse &&
          !isChildOrFoster &&
          !isAlly &&
          p.age >= 15 &&
          p.affinity >= 60;

        const famUsed = state.familyInteractionsUsed ?? {};
        const pct = Math.max(0, Math.min(100, isEnemy ? 100 - p.affinity : p.affinity));
        const filledSegments = Math.max(1, Math.min(5, Math.ceil(pct / 20)));

        const pName = formatPersonName(p.name, lang);
        const pEp = p.epithet
          ? isFa
            ? ` «${EPITHET_FA[p.epithet] ?? p.epithet}»`
            : ` "${p.epithet}"`
          : '';
        const pLoc = SETTLEMENTS_BY_ID[p.locationId];
        const pLocName = isFa
          ? SETTLEMENTS_FA[p.locationId]?.name ?? pLoc?.name ?? p.locationId
          : pLoc?.name.split(' (')[0] ?? p.locationId;
        const birthYear = state.year - p.age;
        const detailedStats = derivePersonDetailedStats(p);
        const temperament = getPersonTemperament(p, isFa, isEnemy);
        const defaultDialogueQuote = getPersonDialogueQuote(p, isFa, isEnemy);

        const currentPersonIndex = allLivingOrdered.findIndex((item) => item.id === p.id);
        const prevPerson =
          allLivingOrdered.length > 1 && currentPersonIndex >= 0
            ? allLivingOrdered[(currentPersonIndex - 1 + allLivingOrdered.length) % allLivingOrdered.length]
            : null;
        const nextPerson =
          allLivingOrdered.length > 1 && currentPersonIndex >= 0
            ? allLivingOrdered[(currentPersonIndex + 1) % allLivingOrdered.length]
            : null;

        const prevPersonName = prevPerson ? formatPersonName(prevPerson.name, lang) : '';
        const nextPersonName = nextPerson ? formatPersonName(nextPerson.name, lang) : '';

        const usedWithThisPersonCount = Object.keys(famUsed).filter(
          (k) => k.startsWith(`${p.id}_`) && famUsed[k]
        ).length;

        const auraRingColor = isEnemy
          ? 'ring-blood-500/50 shadow-[0_0_24px_rgba(244,63,94,0.35)]'
          : isSpouse || isPrimaryHeir
            ? 'ring-gold-500/60 shadow-[0_0_24px_rgba(245,158,11,0.35)]'
            : isAlly
              ? 'ring-status-emerald/55 shadow-[0_0_24px_rgba(52,211,153,0.32)]'
              : 'ring-status-ice/50 shadow-[0_0_24px_rgba(56,189,248,0.28)]';

        const triggerInteraction = (
          interaction: FamilyInteractionType,
          feedbackMsg: string,
          reactionQuote: string,
          burstLabel: string,
          burstTone: 'emerald' | 'amber' | 'ice' | 'crimson' | 'violet' = 'emerald',
          closeAfter = false
        ) => {
          onMemberInteraction(p.id, interaction);
          if (closeAfter) {
            closePersonSheet();
          } else {
            const nextKey = Date.now();
            setActionPulseKey(nextKey);
            setFloatingBurst({ id: nextKey, label: burstLabel, tone: burstTone });
            setLastModalFeedback({
              message: feedbackMsg,
              quote: reactionQuote,
            });
          }
        };

        const allFriendlyOptions: {
          key: FamilyInteractionType;
          title: string;
          subtitle: string;
          effectLabel: string;
          burstLabel: string;
          costSilver?: number;
          minAge?: number;
          onlyChild?: boolean;
          onlySpouse?: boolean;
          onlyEligibleHeir?: boolean;
          onlyBloodOathCandidate?: boolean;
          icon: ReactNode;
          tone: 'ice' | 'amber' | 'emerald' | 'violet' | 'crimson';
          feedback: string;
          reactionQuote: string;
        }[] = [
          {
            key: 'talk',
            title: isFa ? 'گپ صمیمی و وقت‌گذرانی' : 'Heart-to-Heart Talk',
            subtitle: isFa
              ? 'گفتگو کنار آتش تالار و شنیدن دغدغه‌ها'
              : 'Share warm ale and stories by the longhouse hearth',
            effectLabel: isFa ? 'رایگان · +۸ صمیمیت · +۴ شادی' : 'Free · +8 Bond · +4 Joy',
            burstLabel: isFa ? '+۸ صمیمیت · +۴ شادی' : '+8 Bond · +4 Joy',
            icon: <MessageCircle className="w-4 h-4" />,
            tone: 'ice',
            feedback: isFa
              ? `با «${pName}» گفتگوی صمیمانه‌ای داشتید (+۸ صمیمیت، +۴ شادی).`
              : `Had a warm talk with ${pName} (+8 Bond, +4 Joy).`,
            reactionQuote: isFa
              ? '«خوشحالم که در میان مشغله‌های تالار، پای صحبت من نشستی!»'
              : '“It warms my heart that you made time to sit by the fire with me!”',
          },
          {
            key: 'compliment',
            title: isFa ? 'ستایش و دلگرمی در تالار' : 'Praise in the Mead Hall',
            subtitle: isFa
              ? 'تعریف از منش و وفاداری او در جمع یاران'
              : 'Speak warmly of their virtues before the hearth-companions',
            effectLabel: isFa ? 'رایگان · +۹ صمیمیت · +۳ شرافت' : 'Free · +9 Bond · +3 Honor',
            burstLabel: isFa ? '+۹ صمیمیت · +۳ شرافت' : '+9 Bond · +3 Honor',
            icon: <Sparkles className="w-4 h-4" />,
            tone: 'emerald',
            feedback: isFa
              ? `از «${pName}» در جمع تالار ستایش کردید (+۹ صمیمیت، +۳ شرافت).`
              : `Praised ${pName} before the hall (+9 Bond, +3 Honor).`,
            reactionQuote: isFa
              ? '«سخنان زیبایت در حضور بزرگان تالار مایه مباهات من است!»'
              : '“Your generous praise before the hearth-warriors fills me with pride!”',
          },
          {
            key: 'gift',
            title: isFa ? 'اهدای سنجاق و هدیه نقره' : 'Give Silver Brooch',
            subtitle: isFa
              ? 'پیشکش یک زیور نقره‌کوب برای ابراز محبت'
              : 'Present a finely worked silver brooch as a token of affection',
            effectLabel: isFa ? '۵ نقره · +۱۵ صمیمیت · +۵ شادی' : '5 Silver · +15 Bond · +5 Joy',
            burstLabel: isFa ? '+۱۵ صمیمیت · +۵ شادی' : '+15 Bond · +5 Joy',
            costSilver: 5,
            icon: <Gift className="w-4 h-4" />,
            tone: 'amber',
            feedback: isFa
              ? `هدیه نقره به «${pName}» تقدیم شد (+۱۵ صمیمیت، +۵ شادی).`
              : `Silver gift presented to ${pName} (+15 Bond, +5 Joy).`,
            reactionQuote: isFa
              ? '«چه نقش‌ونگار ظریفی! این سنجاق نقره را همیشه بر ردایم خواهم بست.»'
              : '“Such fine silver-craft! I shall wear this brooch with honor.”',
          },
          {
            key: 'lavish_gift',
            title: isFa ? 'اهدای بازوبند زرین شاهانه' : 'Bestow Golden Arm-Ring',
            subtitle: isFa
              ? 'بستن بازوبند گران‌بها برای تحکیم وفاداری ابدی'
              : 'Clasp a heavy gilded arm-ring to seal unshakeable devotion',
            effectLabel: isFa ? '۱۵ نقره · +۲۸ صمیمیت · +۸ شهرت' : '15 Silver · +28 Bond · +8 Fame',
            burstLabel: isFa ? '👑 +۲۸ صمیمیت · +۸ شهرت' : '👑 +28 Bond · +8 Fame',
            costSilver: 15,
            icon: <Crown className="w-4 h-4" />,
            tone: 'amber',
            feedback: isFa
              ? `بازوبند زرین بر بازوی «${pName}» بسته شد (+۲۸ صمیمیت، +۸ شهرت).`
              : `Golden arm-ring bestowed upon ${pName} (+28 Bond, +8 Fame).`,
            reactionQuote: isFa
              ? '«به این حلقه زرین سوگند، وفاداری من به تو تا تالار والهالا پابرجاست!»'
              : '“By this golden ring, my loyalty to you shall never waver!”',
          },
          {
            key: 'feast_together',
            title: isFa ? 'بزم خصوصی و نوشیدن مید' : 'Private Mead & Venison Feast',
            subtitle: isFa
              ? 'سفره رنگین و جام‌های مید عسلی به افتخار او'
              : 'Share roasted venison and honeyed mead-horns together',
            effectLabel: isFa ? '۸ نقره · +۱۸ صمیمیت · +۹ شادی' : '8 Silver · +18 Bond · +9 Joy',
            burstLabel: isFa ? '🍺 +۱۸ صمیمیت · +۹ شادی' : '🍺 +18 Bond · +9 Joy',
            costSilver: 8,
            icon: <Flame className="w-4 h-4" />,
            tone: 'amber',
            feedback: isFa
              ? `بزم خصوصی به افتخار «${pName}» برگزار شد (+۱۸ صمیمیت، +۹ شادی).`
              : `Shared a private mead-feast with ${pName} (+18 Bond, +9 Joy).`,
            reactionQuote: isFa
              ? '«جامم را به سلامتی تو و آینده درخشان خاندانمان بالا می‌برم — اسکول!»'
              : '“I raise my horn to your health and our house’s glory — Skål!”',
          },
          {
            key: 'try_for_child',
            title: isFa ? 'خلوت عاشقانه و فرزندآوری' : 'Romantic Night & Try for Heir',
            subtitle: isFa
              ? 'افزایش مهر زناشویی و شانس تولد وارث جدید برای خاندان'
              : 'Deepen marital love with a high chance of conceiving a new heir',
            effectLabel: isFa ? 'رایگان · شانس تولد فرزند جدید' : 'Free · Chance of New Child',
            burstLabel: isFa ? '❤️ پیوند زناشویی و امید وارث جدید' : '❤️ Marital Union Blessed',
            onlySpouse: true,
            minAge: 17,
            icon: <Heart className="w-4 h-4" />,
            tone: 'emerald',
            feedback: isFa
              ? `با «${pName}» خلوت عاشقانه داشتید (نتیجه در کارنامه سال ثبت شد).`
              : `Shared romantic time with ${pName}.`,
            reactionQuote: isFa
              ? '«باشد که نورن‌های سرنوشت، نسل ما را با فرزندان صالح و نیرومند برکت دهند.»'
              : '“May the Norns bless our union with strong sons and daughters.”',
          },
          {
            key: 'designate_heir',
            title: isFa ? 'انتخاب به‌عنوان وارث برگزیده خاندان' : 'Name Primary Dynasty Heir',
            subtitle: isFa
              ? 'معرفی رسمی او در تالار به‌عنوان جانشین اول شما پس از مرگ'
              : 'Proclaim them before the elders as your #1 chosen successor',
            effectLabel: isFa ? 'رایگان · وارث اول · +۱۸ صمیمیت' : 'Free · #1 Heir · +18 Bond',
            burstLabel: isFa ? '👑 وارث اول دودمان · +۱۸ صمیمیت' : '👑 #1 Dynasty Heir · +18 Bond',
            onlyEligibleHeir: true,
            icon: <Award className="w-4 h-4" />,
            tone: 'amber',
            feedback: isFa
              ? `«${pName}» رسماً به‌عنوان وارث اول و جانشین برگزیده شما معرفی شد!`
              : `${pName} was proclaimed your primary designated heir!`,
            reactionQuote: isFa
              ? '«سوگند می‌خورم پس از تو پرچم خاندانمان را بر بلندترین قله‌های شمال برافراشته نگه دارم!»'
              : '“I swear to uphold your legacy and lead our dynasty with honor!”',
          },
          {
            key: 'swear_blood_oath',
            title: isFa ? 'پیمان اخوت و هم‌قسم شدن' : 'Swear Norse Blood-Oath',
            subtitle: isFa
              ? 'بستن پیمان برادری/خواهری خونی برای وفاداری و اتحاد ابدی'
              : 'Mingle blood beneath the turf-arch to make them your Sworn Companion',
            effectLabel: isFa ? 'رایگان · تبدیل به هم‌پیمان · +۱۴ شهرت' : 'Free · Sworn Ally · +14 Fame',
            burstLabel: isFa ? '🛡️ پیمان خونی ابدی · +۱۴ شهرت' : '🛡️ Sworn Blood-Oath · +14 Fame',
            onlyBloodOathCandidate: true,
            icon: <Shield className="w-4 h-4" />,
            tone: 'emerald',
            feedback: isFa
              ? `با «${pName}» پیمان اخوت خونی بستید (+۲۲ صمیمیت، +۸ شرافت، +۱۴ شهرت).`
              : `Swore a blood-oath with ${pName} (+22 Bond, +8 Honor, +14 Fame).`,
            reactionQuote: isFa
              ? '«از امروز خون ما یکی است؛ تا دم مرگ در کنار تو خواهم جنگید!»'
              : '“From this day our blood is one; I stand with you unto Valhalla!”',
          },
          {
            key: 'teach',
            title: isFa ? 'آموزش رزم و رسم وایکینگی' : 'Mentor & Train Norse Skills',
            subtitle: isFa
              ? 'تعلیم سپرداری، قانون شمال و پرورش ویژگی‌های رهبری در فرزند'
              : 'Drill in shield-work and northern law to shape a capable heir',
            effectLabel: isFa ? 'رایگان · تقویت وارث · +۱۰ صمیمیت' : 'Free · Train Heir · +10 Bond',
            burstLabel: isFa ? '🎓 تقویت مهارت وارث · +۱۰ صمیمیت' : '🎓 Heir Trained · +10 Bond',
            onlyChild: true,
            minAge: 5,
            icon: <GraduationCap className="w-4 h-4" />,
            tone: 'emerald',
            feedback: isFa
              ? `به «${pName}» فنون رزم و رسم زندگی آموختید (+۱۰ صمیمیت، تقویت وارث).`
              : `Mentored ${pName} in Norse skills (+10 Bond, Heir Trained).`,
            reactionQuote: isFa
              ? '«درس‌های امروزت را هرگز فراموش نمی‌کنم؛ بازویم روزبه‌روز قوی‌تر می‌شود!»'
              : '“I will remember every lesson you taught me in the courtyard today!”',
          },
          {
            key: 'spar',
            title: isFa ? 'تمرین شمشیرزنی و رزم مشترک' : 'Spar in the Courtyard',
            subtitle: isFa
              ? 'نبرد تمرینی با سپر و شمشیر چوبی برای تقویت بازو و احترام'
              : 'Trade practice blows with shield and blade to hone combat prowess',
            effectLabel: isFa ? 'رایگان · +۱۲ صمیمیت · +۳ رزم' : 'Free · +12 Bond · +3 Combat',
            burstLabel: isFa ? '⚔️ +۱۲ صمیمیت · +۳ مهارت رزم' : '⚔️ +12 Bond · +3 Combat',
            minAge: 10,
            icon: <Swords className="w-4 h-4" />,
            tone: 'ice',
            feedback: isFa
              ? `با «${pName}» تمرین شمشیرزنی کردید (+۱۲ صمیمیت، +۳ رزم، +۳ قدرت).`
              : `Sparred with ${pName} (+12 Bond, +3 Combat, +3 Strength).`,
            reactionQuote: isFa
              ? '«ضربات سپرت واقعاً سنگین بود! تمرین عالی و نفس‌گیری داشتیم.»'
              : '“A fierce bout! Few in the hall can match your shield-work.”',
          },
          {
            key: 'council',
            title: isFa ? 'مشورت در امور خاندان و سیاست' : 'Seek Dynasty & Political Counsel',
            subtitle: isFa
              ? 'هم‌فکری درباره املاک، تجارت و رقابت‌های سیاسی'
              : 'Discuss realm governance, trade routes, and family strategy',
            effectLabel: isFa ? 'رایگان · +۱۰ صمیمیت · +۳ ذکاوت' : 'Free · +10 Bond · +3 Cunning',
            burstLabel: isFa ? '⚖️ +۱۰ صمیمیت · +۳ ذکاوت' : '⚖️ +10 Bond · +3 Cunning',
            minAge: 14,
            icon: <Scale className="w-4 h-4" />,
            tone: 'ice',
            feedback: isFa
              ? `با «${pName}» در امور سیاسی مشورت کردید (+۱۰ صمیمیت، +۳ ذکاوت).`
              : `Sought counsel from ${pName} (+10 Bond, +3 Cunning).`,
            reactionQuote: isFa
              ? '«خرد و مشورت جمعی، ستون استوار فرمانروایی خاندان ماست.»'
              : '“Wise counsel keeps a dynasty strong when winter winds blow.”',
          },
          {
            key: 'hunt_together',
            title: isFa ? 'شکار در جنگل‌های شمالی' : 'Hunt in the Northern Woods',
            subtitle: isFa
              ? 'ردیابی گوزن و شکار دسته‌جمعی برای نشاط و ذخیره آذوقه'
              : 'Track game through the pine-forests for health, joy, and food stores',
            effectLabel: isFa ? 'رایگان · +۱۴ صمیمیت · +۸ آذوقه' : 'Free · +14 Bond · +8 Food',
            burstLabel: isFa ? '🏹 +۱۴ صمیمیت · +۸ آذوقه' : '🏹 +14 Bond · +8 Food',
            minAge: 12,
            icon: <Compass className="w-4 h-4" />,
            tone: 'emerald',
            feedback: isFa
              ? `همراه با «${pName}» به شکار رفتید (+۱۴ صمیمیت، +۴ سلامتی، +۸ آذوقه).`
              : `Hunted with ${pName} (+14 Bond, +4 Health, +8 Food).`,
            reactionQuote: isFa
              ? '«چه شکاری! انبار تالار پر از گوشت تازه شد و تیرهایمان به خطا نرفت.»'
              : '“A grand hunt! Our larder is full and our spirits are high.”',
          },
          {
            key: 'bless_kin',
            title: isFa ? 'دعای خیر و نذر در نیایشگاه' : 'Sacred Sanctuary Blessing',
            subtitle: isFa
              ? 'نذر نقره نزد خدایان برای تندرستی و بخت بلند او'
              : 'Offer silver and prayers for their health and wyrd',
            effectLabel: isFa ? '۵ نقره · +۱۲ صمیمیت · +۴ ایمان' : '5 Silver · +12 Bond · +4 Faith',
            burstLabel: isFa ? '✨ +۱۲ صمیمیت · +۴ ایمان' : '✨ +12 Bond · +4 Faith',
            costSilver: 5,
            icon: <Sparkles className="w-4 h-4" />,
            tone: 'violet',
            feedback: isFa
              ? `برای «${pName}» در نیایشگاه دعای خیر و نذر کردید (+۱۲ صمیمیت، +۴ ایمان).`
              : `Offered sacred blessings for ${pName} (+12 Bond, +4 Faith).`,
            reactionQuote: isFa
              ? '«دعای خیر تو دلگرمی بزرگی است؛ برکت خدایان همراه قدم‌هایت باد.»'
              : '“Your prayers at the sacred grove bring peace to my spirit.”',
          },
          {
            key: 'argue',
            title: isFa ? 'بحث، توبیخ و مشاجره' : 'Confront & Argue',
            subtitle: isFa
              ? 'برخورد تند و تحکم‌آمیز بر سر اختلافات تالار'
              : 'Challenge them sharply over hall disputes (+Strength, -Bond)',
            effectLabel: isFa ? 'رایگان · -۱۸ صمیمیت · +۲ قدرت' : 'Free · -18 Bond · +2 Strength',
            burstLabel: isFa ? '🔥 -۱۸ صمیمیت · +۲ قدرت' : '🔥 -18 Bond · +2 Strength',
            icon: <Flame className="w-4 h-4" />,
            tone: 'crimson',
            feedback: isFa
              ? `با «${pName}» مشاجره تندی داشتید (-۱۸ صمیمیت، +۲ قدرت).`
              : `Had a heated argument with ${pName} (-18 Bond, +2 Strength).`,
            reactionQuote: isFa
              ? '«سخنان تند امروزت را به این سادگی فراموش نخواهم کرد…»'
              : '“Harsh words spoken in anger leave deep marks in the hall…”',
          },
        ];

        const friendlyOptions = allFriendlyOptions.filter((opt) => {
          if (opt.onlySpouse && !isSpouse) return false;
          if (opt.onlyChild && !isChildOrFoster) return false;
          if (opt.onlyEligibleHeir && (!canBeDesignatedHeir || isPrimaryHeir)) return false;
          if (opt.onlyBloodOathCandidate && !canSwearBloodOath) return false;
          if (opt.minAge && p.age < opt.minAge) return false;
          return true;
        });

        return (
          <NorseBottomSheet
            isOpen={true}
            onClose={closePersonSheet}
            maxWidthClass="max-w-2xl"
            accent={isEnemy ? 'crimson' : isSpouse ? 'amber' : isAlly ? 'emerald' : 'ice'}
            closeLabel={isFa ? 'بستن' : 'Close'}
            title={`${pName}${pEp}`}
            subtitle={`${ROLE_LABELS[lang][p.role]} · ${formatAgeLabel(p.age, lang)} · ${CLASS_SHORT_LABELS_I18N[lang][p.socialClass]}`}
            icon={
              <motion.div
                key={`portrait_${p.id}_${actionPulseKey}`}
                initial={{ scale: 0.92, rotate: -2 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 340, damping: 18 }}
                className={`relative rounded-xl ring-2 ${auraRingColor}`}
              >
                <VikingPortrait
                  age={p.age}
                  sex={p.sex}
                  traits={p.traits}
                  title={mapSocialClassToPortraitRank(p.socialClass)}
                  seedId={p.id}
                  size={60}
                />
                {isPrimaryHeir && (
                  <motion.span
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full bg-gold-500 text-nordic-950 flex items-center justify-center shadow"
                  >
                    <Crown className="w-3 h-3" />
                  </motion.span>
                )}
              </motion.div>
            }
            footer={
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-3 shrink-0">
                  <div className="inline-flex items-center gap-1.5 font-mono tabular-nums text-accent-amber font-bold">
                    <Coins className="w-3.5 h-3.5" />
                    <span>
                      {isFa
                        ? `خزانه: ${state.realm.silver} نقره`
                        : `Treasury: ${state.realm.silver} Silver`}
                    </span>
                  </div>
                  <span className="text-ink-muted" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-ink-muted font-mono tabular-nums">
                    {isFa
                      ? `تعاملات امسال: ${usedWithThisPersonCount}`
                      : `Actions this year: ${usedWithThisPersonCount}`}
                  </span>
                </div>

                {/* Dynamic Name-Sized Character Switcher Buttons */}
                {allLivingOrdered.length === 2 && nextPerson && (
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => switchPersonInModal(1)}
                      className="w-fit max-w-full min-h-[36px] px-3 py-1.5 rounded-xl bg-surface-card hover:bg-surface-interactive border border-border-subtle hover:border-status-ice/60 text-xs font-bold text-ink-primary inline-flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                    >
                      <div className="shrink-0">
                        <VikingPortrait
                          age={nextPerson.age}
                          sex={nextPerson.sex}
                          traits={nextPerson.traits}
                          title={mapSocialClassToPortraitRank(nextPerson.socialClass)}
                          seedId={nextPerson.id}
                          size={22}
                        />
                      </div>
                      <span className="whitespace-nowrap">{nextPersonName}</span>
                      {isFa ? (
                        <ChevronLeft className="w-3.5 h-3.5 text-accent-ice shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-accent-ice shrink-0" />
                      )}
                    </button>
                  </div>
                )}

                {allLivingOrdered.length >= 3 && prevPerson && nextPerson && (
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => switchPersonInModal(-1)}
                      className="w-fit max-w-full min-h-[36px] px-2.5 py-1.5 rounded-xl bg-surface-card hover:bg-surface-interactive border border-border-subtle hover:border-status-ice/60 text-xs font-bold text-ink-secondary hover:text-ink-primary inline-flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    >
                      {isFa ? (
                        <ChevronRight className="w-3.5 h-3.5 text-accent-ice shrink-0" />
                      ) : (
                        <ChevronLeft className="w-3.5 h-3.5 text-accent-ice shrink-0" />
                      )}
                      <div className="shrink-0">
                        <VikingPortrait
                          age={prevPerson.age}
                          sex={prevPerson.sex}
                          traits={prevPerson.traits}
                          title={mapSocialClassToPortraitRank(prevPerson.socialClass)}
                          seedId={prevPerson.id}
                          size={20}
                        />
                      </div>
                      <span className="whitespace-nowrap">{prevPersonName}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => switchPersonInModal(1)}
                      className="w-fit max-w-full min-h-[36px] px-2.5 py-1.5 rounded-xl bg-surface-card hover:bg-surface-interactive border border-border-subtle hover:border-status-ice/60 text-xs font-bold text-ink-secondary hover:text-ink-primary inline-flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    >
                      <span className="whitespace-nowrap">{nextPersonName}</span>
                      <div className="shrink-0">
                        <VikingPortrait
                          age={nextPerson.age}
                          sex={nextPerson.sex}
                          traits={nextPerson.traits}
                          title={mapSocialClassToPortraitRank(nextPerson.socialClass)}
                          seedId={nextPerson.id}
                          size={20}
                        />
                      </div>
                      {isFa ? (
                        <ChevronLeft className="w-3.5 h-3.5 text-accent-ice shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-accent-ice shrink-0" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            }
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: (isFa ? -1 : 1) * navDirection * 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: (isFa ? 1 : -1) * navDirection * 24 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="space-y-3.5"
              >
                {/* ========================================================= */}
                {/* HERO CHARACTER SUMMARY & DIALOGUE CARD                    */}
                {/* ========================================================= */}
                <div className="relative p-3.5 rounded-2xl bg-surface-secondary border border-border-subtle space-y-3 overflow-hidden">
                  <NorseCornerOrnament accent={isEnemy ? 'crimson' : isSpouse ? 'amber' : 'ice'} />

                  {/* Floating Action Reward Burst */}
                  <AnimatePresence>
                    {floatingBurst && (
                      <motion.div
                        key={floatingBurst.id}
                        initial={{ opacity: 0, y: 14, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -14 }}
                        transition={{ type: 'spring', stiffness: 360, damping: 22 }}
                        className="flex items-center justify-end pointer-events-none"
                      >
                        <span
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-extrabold shadow-sm ${
                            floatingBurst.tone === 'amber'
                              ? 'bg-gold-500/20 border-gold-500/50 text-accent-amber'
                              : floatingBurst.tone === 'crimson'
                                ? 'bg-blood-500/20 border-blood-500/50 text-accent-crimson'
                                : floatingBurst.tone === 'violet'
                                  ? 'bg-status-violet/20 border-status-violet/50 text-accent-violet'
                                  : 'bg-status-emerald/20 border-status-emerald/50 text-accent-emerald'
                          }`}
                        >
                          {floatingBurst.label}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Top Status Row: Location + Succession + Temperament */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2 text-ink-secondary">
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-accent-ice" />
                        <span>{pLocName}</span>
                      </span>
                      <span className="text-ink-muted" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-ink-muted">
                        {isFa ? `متولد ${birthYear} میلادی` : `Born ${birthYear} AD`}
                      </span>
                      {isPrimaryHeir && (
                        <>
                          <span className="text-ink-muted" aria-hidden="true">
                            ·
                          </span>
                          <span className="inline-flex items-center gap-1 text-accent-amber font-bold">
                            <Crown className="w-3.5 h-3.5" />
                            <span>{isFa ? 'وارث اول دودمان' : 'Primary Dynasty Heir'}</span>
                          </span>
                        </>
                      )}
                    </div>

                    <span className="text-xs font-bold text-accent-ice">{temperament}</span>
                  </div>

                  {/* 5-Segment Animated Relationship & Loyalty Meter */}
                  <div className="p-2.5 rounded-xl bg-surface-card border border-border-subtle space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1.5 font-bold text-ink-primary">
                        {isEnemy ? (
                          <Swords className="w-3.5 h-3.5 text-accent-crimson" />
                        ) : (
                          <Heart className="w-3.5 h-3.5 text-accent-emerald" />
                        )}
                        <span>
                          {isEnemy
                            ? isFa
                              ? 'شدت خصومت و کینه خونی'
                              : 'Blood-Feud Hostility'
                            : isFa
                              ? 'میزان صمیمیت و وفاداری به شما'
                              : 'Loyalty & Affection Toward You'}
                        </span>
                      </span>
                      <motion.span
                        key={pct}
                        initial={{ scale: 1.25 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 360, damping: 18 }}
                        className={`font-mono tabular-nums font-extrabold ${
                          isEnemy
                            ? 'text-accent-crimson'
                            : pct >= 70
                              ? 'text-accent-emerald'
                              : pct >= 45
                                ? 'text-accent-amber'
                                : 'text-accent-crimson'
                        }`}
                      >
                        {pct}%
                      </motion.span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5">
                      {[1, 2, 3, 4, 5].map((seg) => {
                        const active = seg <= filledSegments;
                        const activeColor = isEnemy
                          ? 'bg-blood-500'
                          : pct >= 70
                            ? 'bg-status-emerald'
                            : pct >= 45
                              ? 'bg-gold-500'
                              : 'bg-blood-500';
                        return (
                          <div
                            key={seg}
                            className="h-2 rounded-full bg-surface-canvas overflow-hidden"
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: active ? '100%' : '0%' }}
                              transition={{
                                type: 'spring',
                                stiffness: 220,
                                damping: 24,
                                delay: seg * 0.03,
                              }}
                              className={`h-full rounded-full ${activeColor}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live Character Quote / Action Reaction Box */}
                  <motion.div
                    key={lastModalFeedback ? lastModalFeedback.message : 'default_quote'}
                    initial={{ opacity: 0.6, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`p-3 rounded-xl border transition-colors ${
                      lastModalFeedback
                        ? 'bg-status-emerald/10 border-status-emerald/40'
                        : 'bg-surface-card border-border-subtle'
                    }`}
                  >
                    {lastModalFeedback && (
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-accent-emerald mb-1">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{lastModalFeedback.message}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-xs text-ink-secondary leading-relaxed">
                      <Quote className="w-4 h-4 text-accent-amber shrink-0 mt-0.5 opacity-80" />
                      <p className="italic">
                        {lastModalFeedback ? lastModalFeedback.quote : defaultDialogueQuote}
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* ========================================================= */}
                {/* SEGMENTED MODAL TABS: 1. INTERACTIONS  |  2. DOSSIER      */}
                {/* ========================================================= */}
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-surface-card border border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setModalTab('interactions')}
                    className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      modalTab === 'interactions'
                        ? 'bg-gold-500 text-nordic-950 shadow-xs'
                        : 'text-ink-muted hover:text-ink-primary'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {isEnemy
                        ? isFa
                          ? 'رویارویی و دیپلماسی'
                          : 'Confrontation & Diplomacy'
                        : isFa
                          ? `تعامل و اقدامات (${friendlyOptions.length})`
                          : `Interactions (${friendlyOptions.length})`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalTab('dossier')}
                    className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      modalTab === 'dossier'
                        ? 'bg-status-ice text-nordic-950 shadow-xs'
                        : 'text-ink-muted hover:text-ink-primary'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{isFa ? 'شناسنامه و ویژگی‌ها' : 'Dossier & Attributes'}</span>
                  </button>
                </div>

                {/* ========================================================= */}
                {/* TAB 1: ALL CHARACTER INTERACTIONS (NO SUB-CATEGORIES)     */}
                {/* ========================================================= */}
                {modalTab === 'interactions' && (
                  <div className="space-y-3">
                    {!isEnemy ? (
                      <>
                        {/* Direct 2-Column Interactive Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {friendlyOptions.map((opt, idx) => {
                            const usageKey = `${p.id}_${opt.key}`;
                            const isUsed = Boolean(famUsed[usageKey]);
                            const cantAfford = Boolean(
                              opt.costSilver && state.realm.silver < opt.costSilver
                            );
                            const isDisabled = isUsed || cantAfford;

                            const iconBoxTone =
                              opt.tone === 'amber'
                                ? 'bg-gold-500/15 text-accent-amber border-gold-500/35'
                                : opt.tone === 'emerald'
                                  ? 'bg-status-emerald/15 text-accent-emerald border-status-emerald/35'
                                  : opt.tone === 'violet'
                                    ? 'bg-status-violet/15 text-accent-violet border-status-violet/35'
                                    : opt.tone === 'crimson'
                                      ? 'bg-blood-500/15 text-accent-crimson border-blood-500/35'
                                      : 'bg-status-ice/15 text-accent-ice border-status-ice/35';

                            return (
                              <motion.button
                                key={opt.key}
                                type="button"
                                disabled={isDisabled}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.2,
                                  delay: Math.min(idx * 0.03, 0.24),
                                  ease: 'easeOut',
                                }}
                                whileHover={isDisabled ? undefined : { y: -2 }}
                                whileTap={isDisabled ? undefined : { scale: 0.98 }}
                                onClick={() =>
                                  triggerInteraction(
                                    opt.key,
                                    opt.feedback,
                                    opt.reactionQuote,
                                    opt.burstLabel,
                                    opt.tone
                                  )
                                }
                                className={`p-3 rounded-xl bg-surface-card hover:bg-surface-secondary disabled:opacity-55 border ${
                                  isUsed
                                    ? 'border-status-emerald/45'
                                    : 'border-border-subtle hover:border-status-ice/65'
                                } flex flex-col justify-between gap-2.5 text-start transition-colors cursor-pointer`}
                              >
                                <div className="flex items-start gap-2.5 min-w-0">
                                  <div
                                    className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${iconBoxTone}`}
                                  >
                                    {opt.icon}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs sm:text-sm font-bold text-ink-primary leading-snug">
                                      {opt.title}
                                    </div>
                                    <p className="text-[11px] text-ink-muted leading-relaxed mt-0.5">
                                      {opt.subtitle}
                                    </p>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-border-subtle/80 flex items-center justify-between gap-2 w-full">
                                  <span
                                    className={`text-[11px] font-mono font-bold ${
                                      isUsed
                                        ? 'text-accent-emerald'
                                        : cantAfford
                                          ? 'text-ink-muted'
                                          : 'text-accent-amber'
                                    }`}
                                  >
                                    {isUsed
                                      ? isFa
                                        ? 'امسال انجام شد ✓'
                                        : 'Completed This Year ✓'
                                      : opt.effectLabel}
                                  </span>
                                  {!isUsed && (
                                    <span className="text-[11px] font-bold text-accent-ice">
                                      {isFa ? 'انجام ←' : 'Perform →'}
                                    </span>
                                  )}
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>

                        {/* SPOUSE RISKY ACTION: DIVORCE WITH EXPLICIT CONFIRMATION */}
                        {isSpouse && isAdult && (
                          <div className="pt-2 space-y-2.5">
                            <RuneDivider
                              label={isFa ? 'فسخ پیوند زناشویی' : 'Marital Dissolution'}
                              accent="crimson"
                            />

                            {!confirmingDivorce ? (
                              <button
                                type="button"
                                onClick={() => setConfirmingDivorce(true)}
                                className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-surface-violet-tint hover:bg-surface-crimson-tint border border-border-crimson-subtle text-xs font-semibold text-ink-secondary hover:text-accent-crimson cursor-pointer transition-colors"
                              >
                                {isFa
                                  ? 'درخواست طلاق طبق قانون نورس…'
                                  : 'Declare Divorce Under Norse Law…'}
                              </button>
                            ) : (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                role="alertdialog"
                                aria-label={isFa ? 'تأیید طلاق' : 'Confirm Divorce'}
                                className="p-3.5 rounded-2xl bg-surface-crimson-tint border border-blood-500 flex flex-col overflow-hidden space-y-3"
                              >
                                <div className="flex items-start gap-2.5">
                                  <AlertTriangle className="w-5 h-5 text-accent-crimson shrink-0 mt-0.5" />
                                  <div className="space-y-1 min-w-0">
                                    <div className="text-xs sm:text-sm font-bold text-accent-crimson whitespace-normal break-words">
                                      {isFa
                                        ? `آیا از طلاق دادن «${pName}» مطمئن هستید؟`
                                        : `Divorce ${pName}?`}
                                    </div>
                                    <p className="text-xs text-accent-crimson whitespace-normal break-words leading-relaxed">
                                      {isFa
                                        ? `بازپرداخت مهریه: ${divorceCost} نقره · کاهش شادی ۱۴- · ۴۰٪ احتمال آغاز کینه خونی با خاندان همسر.`
                                        : `Settlement cost: ${divorceCost} Silver · -14 Joy · 40% risk of sparking a Blood Feud with their kin.`}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                  <button
                                    type="button"
                                    onClick={() => setConfirmingDivorce(false)}
                                    className="min-h-[40px] px-3 py-2 rounded-xl bg-surface-secondary hover:bg-surface-interactive border border-border-strong text-xs font-bold text-ink-primary cursor-pointer transition-colors"
                                  >
                                    {isFa ? 'انصراف' : 'Cancel'}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      onFamilyAction('divorce_spouse');
                                      closePersonSheet();
                                    }}
                                    className="min-h-[40px] px-3 py-2 rounded-xl bg-blood-600 hover:bg-blood-500 text-xs font-extrabold text-white cursor-pointer transition-colors"
                                  >
                                    {isFa
                                      ? `تأیید طلاق (${divorceCost} نقره)`
                                      : `Confirm (${divorceCost} Silver)`}
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      /* Enemy / Blood Feud Options */
                      <div className="space-y-2.5">
                        {!isAdult ? (
                          <div className="p-3 rounded-xl bg-surface-card border border-border-subtle text-xs text-ink-muted leading-relaxed">
                            {isFa
                              ? 'پس از رسیدن به ۱۷ سالگی می‌توانید این کینه را با دوئل هولم‌گانگ، مذاکره یا خون‌بها یکسره کنید.'
                              : 'Reach age 17 to settle this feud by Holmgang duel, Wergild silver, or peace marriage.'}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <motion.button
                              type="button"
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                onFamilyAction('holmgang_rival', p.id);
                                closePersonSheet();
                              }}
                              className="p-3 rounded-xl bg-surface-crimson-tint hover:bg-surface-crimson-tint border border-blood-500 flex flex-col justify-between gap-2.5 text-start cursor-pointer transition-colors"
                            >
                              <div className="flex items-start gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-blood-500/20 text-accent-crimson border border-blood-500/40 flex items-center justify-center shrink-0 mt-0.5">
                                  <Swords className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs sm:text-sm font-bold text-ink-primary">
                                    {isFa
                                      ? 'دوئل تن‌به‌تن (هولم‌گانگ)'
                                      : 'Challenge to Holmgang Duel'}
                                  </div>
                                  <p className="text-[11px] text-ink-secondary mt-0.5">
                                    {isFa
                                      ? 'نبرد مستقیم در حلقه مقدس برای پایان دادن به دشمنی و کسب شهرت'
                                      : 'Single combat in the staked ring to settle the feud for good'}
                                  </p>
                                </div>
                              </div>
                              <div className="pt-2 border-t border-blood-500/30 flex items-center justify-between text-[11px] font-bold text-accent-crimson">
                                <span>{isFa ? 'نبرد مرگ و زندگی · +شهرت' : 'High Stakes · +Fame'}</span>
                                <span>{isFa ? 'ورود به نبرد ←' : 'Fight →'}</span>
                              </div>
                            </motion.button>

                            <motion.button
                              type="button"
                              disabled={
                                Boolean(famUsed[`${p.id}_send_envoy`]) || state.realm.silver < 10
                              }
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() =>
                                triggerInteraction(
                                  'send_envoy',
                                  isFa
                                    ? `پیک مذاکره نزد «${pName}» فرستاده شد.`
                                    : `Envoy sent to ${pName}.`,
                                  isFa
                                    ? '«پیام و پیشکش فرستاده‌ات را دیدم؛ شاید بتوانیم از خون‌ریزی بگذریم…»'
                                    : '“I received your envoy’s token; perhaps cooler heads may yet prevail…”',
                                  isFa ? '🕊️ کاهش خصومت و مذاکره' : '🕊️ Hostility Reduced',
                                  'ice'
                                )
                              }
                              className="p-3 rounded-xl bg-surface-card hover:bg-surface-secondary disabled:opacity-50 border border-border-subtle hover:border-status-ice/60 flex flex-col justify-between gap-2.5 text-start cursor-pointer transition-colors"
                            >
                              <div className="flex items-start gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-status-ice/15 text-accent-ice border border-status-ice/35 flex items-center justify-center shrink-0 mt-0.5">
                                  <Scale className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs sm:text-sm font-bold text-ink-primary">
                                    {isFa
                                      ? 'اعزام پیک صلح و مذاکره سیاسی'
                                      : 'Send Diplomatic Peace Envoy'}
                                  </div>
                                  <p className="text-[11px] text-ink-muted mt-0.5">
                                    {isFa
                                      ? 'کاهش خصومت با دیپلماسی (امکان تبدیل رقیب به هم‌پیمان)'
                                      : 'Reduce hostility via diplomacy; may reconcile them into an ally'}
                                  </p>
                                </div>
                              </div>
                              <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] font-mono font-bold text-accent-amber">
                                <span>
                                  {famUsed[`${p.id}_send_envoy`]
                                    ? isFa
                                      ? 'امسال انجام شد ✓'
                                      : 'Done ✓'
                                    : isFa
                                      ? '۱۰ نقره · کاهش خصومت'
                                      : '10 Silver · -Hostility'}
                                </span>
                                {!famUsed[`${p.id}_send_envoy`] && (
                                  <span className="text-accent-ice">{isFa ? 'ارسال ←' : 'Send →'}</span>
                                )}
                              </div>
                            </motion.button>

                            <motion.button
                              type="button"
                              disabled={Boolean(famUsed[`${p.id}_intimidate_foe`])}
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() =>
                                triggerInteraction(
                                  'intimidate_foe',
                                  isFa
                                    ? `در برابر «${pName}» نمایش اقتدار دادید (+۴ شرافت، +۶ شهرت).`
                                    : `Displayed force against ${pName} (+4 Honor, +6 Fame).`,
                                  isFa
                                    ? '«سپاه و اقتدارت را به رخ می‌کشی؟ خواهیم دید روزگار به کام که می‌چرخد!»'
                                    : '“You flaunt your strength before the assembly? We shall see how fate turns!”',
                                  isFa ? '🛡️ +۴ شرافت · +۶ شهرت' : '🛡️ +4 Honor · +6 Fame',
                                  'amber'
                                )
                              }
                              className="p-3 rounded-xl bg-surface-card hover:bg-surface-secondary disabled:opacity-50 border border-border-subtle hover:border-gold-500/60 flex flex-col justify-between gap-2.5 text-start cursor-pointer transition-colors"
                            >
                              <div className="flex items-start gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-gold-500/15 text-accent-amber border border-gold-500/35 flex items-center justify-center shrink-0 mt-0.5">
                                  <Shield className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs sm:text-sm font-bold text-ink-primary">
                                    {isFa
                                      ? 'نمایش اقتدار و نهیب در شورا'
                                      : 'Show of Force at Assembly'}
                                  </div>
                                  <p className="text-[11px] text-ink-muted mt-0.5">
                                    {isFa
                                      ? 'ایستادگی با صلابت در برابر رقیب برای کسب شرافت و شهرت'
                                      : 'Stand firm against your rival before the freemen (+Honor, +Fame)'}
                                  </p>
                                </div>
                              </div>
                              <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] font-mono font-bold text-accent-emerald">
                                <span>
                                  {famUsed[`${p.id}_intimidate_foe`]
                                    ? isFa
                                      ? 'امسال انجام شد ✓'
                                      : 'Done ✓'
                                    : isFa
                                      ? 'رایگان · +۴ شرافت · +۶ شهرت'
                                      : 'Free · +4 Honor · +6 Fame'}
                                </span>
                              </div>
                            </motion.button>

                            <motion.button
                              type="button"
                              disabled={state.realm.silver < 30}
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                onFamilyAction('pay_wergild', p.id);
                                closePersonSheet();
                              }}
                              className="p-3 rounded-xl bg-surface-card hover:bg-surface-secondary disabled:opacity-50 border border-border-subtle hover:border-gold-500/60 flex flex-col justify-between gap-2.5 text-start cursor-pointer transition-colors"
                            >
                              <div className="flex items-start gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-gold-500/15 text-accent-amber border border-gold-500/35 flex items-center justify-center shrink-0 mt-0.5">
                                  <Gift className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs sm:text-sm font-bold text-ink-primary">
                                    {isFa
                                      ? 'پرداخت خون‌بهای ورگیلد (صلح کامل)'
                                      : 'Pay Wergild Blood-Price'}
                                  </div>
                                  <p className="text-[11px] text-ink-muted mt-0.5">
                                    {isFa
                                      ? 'پایان فوری و رسمی دشمنی خونی طبق سنت حقوقی اسکاندیناوی'
                                      : 'End the blood feud immediately by paying traditional compensation'}
                                  </p>
                                </div>
                              </div>
                              <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] font-mono font-bold text-accent-amber">
                                <span>{isFa ? '۳۰ نقره · پایان قطعی کینه' : '30 Silver · End Feud'}</span>
                                <span className="text-accent-ice">{isFa ? 'پرداخت ←' : 'Pay →'}</span>
                              </div>
                            </motion.button>

                            {!livingSpouse && (
                              <motion.button
                                type="button"
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() =>
                                  triggerInteraction('peace_marry', '', '', '', 'emerald', true)
                                }
                                className="sm:col-span-2 p-3 rounded-xl bg-surface-card hover:bg-surface-secondary border border-status-ice/50 flex items-center justify-between gap-3 text-start cursor-pointer transition-colors"
                              >
                                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                  <div className="w-8 h-8 rounded-lg bg-status-ice/15 text-accent-ice border border-status-ice/35 flex items-center justify-center shrink-0 mt-0.5">
                                    <HeartHandshake className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs sm:text-sm font-bold text-ink-primary">
                                      {isFa
                                        ? 'پیشنهاد وصلتِ صلح و پایان دشمنی خونی'
                                        : 'Propose Peace-Weaving Marriage'}
                                    </div>
                                    <p className="text-[11px] text-ink-muted mt-0.5">
                                      {isFa
                                        ? 'تبدیل کینه خونی به پیوند زناشویی و افزایش ثبات قلمرو (+۱۲ شادی، +۱۰ ثبات)'
                                        : 'Turn blood feud into a marital alliance (+12 Joy, +10 Stability)'}
                                    </p>
                                  </div>
                                </div>
                                <span className="px-2.5 py-1 rounded-lg bg-status-ice/15 border border-status-ice/35 text-accent-ice text-[11px] font-bold shrink-0">
                                  {isFa ? 'پیمان ازدواج' : 'Peace Union'}
                                </span>
                              </motion.button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ========================================================= */}
                {/* TAB 2: DETAILED CHARACTER DOSSIER, ATTRIBUTES & TRAITS    */}
                {/* ========================================================= */}
                {modalTab === 'dossier' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                    className="space-y-3.5"
                  >
                    {/* 4 Graphical Animated Attribute Cards (2x2 Grid) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-surface-card border border-border-subtle space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-primary">
                            <Heart className="w-3.5 h-3.5 text-accent-emerald" />
                            <span>{isFa ? 'سلامتی و بنیه بدنی' : 'Health & Vitality'}</span>
                          </span>
                          <span className="text-xs font-mono font-extrabold text-accent-emerald">
                            {detailedStats.health}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-surface-canvas overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${detailedStats.health}%` }}
                            transition={{ type: 'spring', stiffness: 130, damping: 20 }}
                            className="h-full rounded-full bg-status-emerald"
                          />
                        </div>
                        <div className="text-[11px] text-ink-muted">
                          {getStatGradeLabel('health', detailedStats.health, isFa)}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-surface-card border border-border-subtle space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-primary">
                            <Swords className="w-3.5 h-3.5 text-accent-crimson" />
                            <span>{isFa ? 'قدرت رزمی و شجاعت' : 'Martial Prowess'}</span>
                          </span>
                          <span className="text-xs font-mono font-extrabold text-accent-crimson">
                            {detailedStats.martial}/99
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-surface-canvas overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${detailedStats.martial}%` }}
                            transition={{ type: 'spring', stiffness: 130, damping: 20, delay: 0.04 }}
                            className="h-full rounded-full bg-blood-500"
                          />
                        </div>
                        <div className="text-[11px] text-ink-muted">
                          {getStatGradeLabel('martial', detailedStats.martial, isFa)}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-surface-card border border-border-subtle space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-primary">
                            <Brain className="w-3.5 h-3.5 text-accent-amber" />
                            <span>{isFa ? 'خرد، ذکاوت و تدبیر' : 'Wisdom & Cunning'}</span>
                          </span>
                          <span className="text-xs font-mono font-extrabold text-accent-amber">
                            {detailedStats.wisdom}/99
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-surface-canvas overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${detailedStats.wisdom}%` }}
                            transition={{ type: 'spring', stiffness: 130, damping: 20, delay: 0.08 }}
                            className="h-full rounded-full bg-gold-500"
                          />
                        </div>
                        <div className="text-[11px] text-ink-muted">
                          {getStatGradeLabel('wisdom', detailedStats.wisdom, isFa)}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-surface-card border border-border-subtle space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-primary">
                            <Sparkles className="w-3.5 h-3.5 text-accent-ice" />
                            <span>{isFa ? 'کاریزما و نفوذ کلام' : 'Charisma & Presence'}</span>
                          </span>
                          <span className="text-xs font-mono font-extrabold text-accent-ice">
                            {detailedStats.charisma}/99
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-surface-canvas overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${detailedStats.charisma}%` }}
                            transition={{ type: 'spring', stiffness: 130, damping: 20, delay: 0.12 }}
                            className="h-full rounded-full bg-status-ice"
                          />
                        </div>
                        <div className="text-[11px] text-ink-muted">
                          {getStatGradeLabel('charisma', detailedStats.charisma, isFa)}
                        </div>
                      </div>
                    </div>

                    {/* 6-Cell Complete Identity Table */}
                    <div className="p-3 rounded-2xl bg-surface-secondary border border-border-subtle space-y-2.5">
                      <div className="text-xs font-extrabold text-accent-amber">
                        {isFa ? 'شناسنامه و جایگاه در دودمان' : 'Dynasty Registry & Status'}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-surface-card border border-border-subtle">
                          <div className="text-[10px] text-ink-muted">
                            {isFa ? 'نسبت خاندانی' : 'Relation'}
                          </div>
                          <div className="font-bold text-ink-primary mt-0.5">
                            {ROLE_LABELS[lang][p.role]}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-surface-card border border-border-subtle">
                          <div className="text-[10px] text-ink-muted">
                            {isFa ? 'سن و سال تولد' : 'Age & Birth'}
                          </div>
                          <div className="font-bold text-ink-primary font-mono tabular-nums mt-0.5">
                            {isFa ? `${p.age} سال (${birthYear} م)` : `${p.age} yrs (${birthYear} AD)`}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-surface-card border border-border-subtle">
                          <div className="text-[10px] text-ink-muted">
                            {isFa ? 'طبقه اجتماعی' : 'Social Class'}
                          </div>
                          <div className="font-bold text-ink-primary mt-0.5">
                            {CLASS_SHORT_LABELS_I18N[lang][p.socialClass]}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-surface-card border border-border-subtle">
                          <div className="text-[10px] text-ink-muted">
                            {isFa ? 'محل اقامت' : 'Residence'}
                          </div>
                          <div className="font-bold text-ink-primary mt-0.5">{pLocName}</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-surface-card border border-border-subtle">
                          <div className="text-[10px] text-ink-muted">
                            {isFa ? 'جایگاه وراثت' : 'Succession'}
                          </div>
                          <div
                            className={`font-bold mt-0.5 ${
                              isPrimaryHeir
                                ? 'text-accent-amber'
                                : canBeDesignatedHeir
                                  ? 'text-accent-ice'
                                  : 'text-ink-muted'
                            }`}
                          >
                            {isPrimaryHeir
                              ? isFa
                                ? 'وارث اول دودمان 👑'
                                : 'Primary Heir 👑'
                              : canBeDesignatedHeir
                                ? isFa
                                  ? 'واجد شرایط جانشینی'
                                  : 'Eligible Successor'
                                : isFa
                                  ? 'خارج از صف وراثت'
                                  : 'Non-Heir'}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-surface-card border border-border-subtle">
                          <div className="text-[10px] text-ink-muted">
                            {isFa ? 'روحیه و خلق‌وخو' : 'Temperament'}
                          </div>
                          <div className="font-bold text-accent-ice mt-0.5">{temperament}</div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Personality Traits Cards */}
                    <div className="p-3 rounded-2xl bg-surface-secondary border border-border-subtle space-y-2.5">
                      <div className="text-xs font-extrabold text-accent-amber">
                        {isFa ? 'ویژگی‌های اخلاقی و ذاتی' : 'Personality & Innate Traits'}
                      </div>
                      {p.traits.length === 0 ? (
                        <p className="text-xs text-ink-muted">
                          {isFa
                            ? 'هنوز ویژگی شخصیتی خاصی برای او ثبت نشده است.'
                            : 'No distinct traits recorded yet.'}
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {p.traits.map((tId, idx) => {
                            const tName = isFa
                              ? TRAITS_FA[tId]?.name ?? ALL_TRAITS_MAP[tId]?.name ?? tId
                              : ALL_TRAITS_MAP[tId]?.name ?? tId;
                            const tDesc = isFa
                              ? TRAITS_FA[tId]?.description ?? ALL_TRAITS_MAP[tId]?.description ?? ''
                              : ALL_TRAITS_MAP[tId]?.description ?? '';
                            return (
                              <motion.div
                                key={tId}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.18, delay: idx * 0.04 }}
                                className="p-2.5 rounded-xl bg-surface-card border border-border-subtle space-y-1"
                              >
                                <div className="text-xs font-bold text-accent-amber">{tName}</div>
                                {tDesc && (
                                  <p className="text-[11px] text-ink-muted leading-relaxed">{tDesc}</p>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </NorseBottomSheet>
        );
      })()}

      {/* ================================================================= */}
      {/* VALHALLA MEMORIAL DETAIL MODAL WINDOW                             */}
      {/* ================================================================= */}
      {selectedValhallaItem && (() => {
        const prevValhallaItem =
          valhallaItems.length > 1 && selectedValhallaIdx >= 0
            ? valhallaItems[(selectedValhallaIdx - 1 + valhallaItems.length) % valhallaItems.length]
            : null;
        const nextValhallaItem =
          valhallaItems.length > 1 && selectedValhallaIdx >= 0
            ? valhallaItems[(selectedValhallaIdx + 1) % valhallaItems.length]
            : null;

        const prevValhallaName = prevValhallaItem ? getValhallaItemName(prevValhallaItem) : '';
        const nextValhallaName = nextValhallaItem ? getValhallaItemName(nextValhallaItem) : '';

        const navFooter =
          valhallaItems.length > 1 ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-ink-muted shrink-0">
                {isFa ? 'تالار جاودانگان والهالا' : 'Hall of Valhalla Memorial'}
              </span>

              {valhallaItems.length === 2 && nextValhallaItem && (
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => switchValhallaInModal(1)}
                    className="w-fit max-w-full min-h-[36px] px-3 py-1.5 rounded-xl bg-surface-card hover:bg-surface-interactive border border-border-subtle hover:border-gold-500/60 text-xs font-bold text-ink-secondary hover:text-ink-primary inline-flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <span className="whitespace-nowrap">{nextValhallaName}</span>
                    {isFa ? (
                      <ChevronLeft className="w-3.5 h-3.5 text-accent-amber shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-accent-amber shrink-0" />
                    )}
                  </button>
                </div>
              )}

              {valhallaItems.length >= 3 && prevValhallaItem && nextValhallaItem && (
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => switchValhallaInModal(-1)}
                    className="w-fit max-w-full min-h-[36px] px-2.5 py-1.5 rounded-xl bg-surface-card hover:bg-surface-interactive border border-border-subtle hover:border-gold-500/60 text-xs font-bold text-ink-secondary hover:text-ink-primary inline-flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    {isFa ? (
                      <ChevronRight className="w-3.5 h-3.5 text-accent-amber shrink-0" />
                    ) : (
                      <ChevronLeft className="w-3.5 h-3.5 text-accent-amber shrink-0" />
                    )}
                    <span className="whitespace-nowrap">{prevValhallaName}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => switchValhallaInModal(1)}
                    className="w-fit max-w-full min-h-[36px] px-2.5 py-1.5 rounded-xl bg-surface-card hover:bg-surface-interactive border border-border-subtle hover:border-gold-500/60 text-xs font-bold text-ink-secondary hover:text-ink-primary inline-flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <span className="whitespace-nowrap">{nextValhallaName}</span>
                    {isFa ? (
                      <ChevronLeft className="w-3.5 h-3.5 text-accent-amber shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-accent-amber shrink-0" />
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : undefined;

        if (selectedValhallaItem.kind === 'ancestor') {
          const anc = selectedValhallaItem.data;
          const ancName = formatPersonName(anc.fullName.replace(/"/g, ''), lang);
          return (
            <NorseBottomSheet
              isOpen={true}
              onClose={() => setSelectedValhallaKey(null)}
              accent="amber"
              closeLabel={isFa ? 'بستن' : 'Close'}
              title={ancName}
              subtitle={
                isFa
                  ? `فرمانروای نسل ${anc.generation} · ${SHORT_TITLE_LABELS.fa[anc.title]}`
                  : `Generation ${anc.generation} Ruler · ${SHORT_TITLE_LABELS.en[anc.title]}`
              }
              icon={
                <VikingPortrait
                  age={anc.ageAtDeath}
                  sex={Sex.Male}
                  traits={[]}
                  title={anc.title}
                  seedId={anc.id}
                  size={58}
                />
              }
              footer={navFooter}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`anc_${anc.id}`}
                  initial={{ opacity: 0, x: (isFa ? -1 : 1) * valhallaNavDirection * 22 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: (isFa ? 1 : -1) * valhallaNavDirection * 22 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="p-3.5 rounded-2xl bg-surface-secondary border border-border-subtle space-y-3"
                >
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-surface-card border border-border-subtle">
                      <div className="text-[10px] text-ink-muted">
                        {isFa ? 'دوران زندگی' : 'Lifespan'}
                      </div>
                      <div className="font-bold text-ink-primary font-mono mt-0.5">
                        {anc.birthYear}–{anc.deathYear} ({anc.ageAtDeath})
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-card border border-border-subtle">
                      <div className="text-[10px] text-ink-muted">
                        {isFa ? 'شهرت کسب‌شده' : 'Fame Earned'}
                      </div>
                      <div className="font-bold text-accent-amber font-mono mt-0.5">
                        {anc.fameEarned}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-card border border-border-subtle">
                      <div className="text-[10px] text-ink-muted">{isFa ? 'آیین' : 'Faith'}</div>
                      <div className="font-bold text-ink-primary mt-0.5">
                        {RELIGION_LABELS[lang][anc.religion]}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-card border border-border-subtle text-xs space-y-1">
                    <div className="text-[10px] text-ink-muted">
                      {isFa ? 'علت درگذشت' : 'Cause of Death'}
                    </div>
                    <div className="font-bold text-accent-crimson">
                      {isFa ? anc.causeOfDeathFa ?? anc.causeOfDeath : anc.causeOfDeath}
                    </div>
                  </div>

                  {(anc.obituaryProseFa || anc.obituaryProse) && (
                    <div className="p-3 rounded-xl bg-surface-card border border-border-subtle space-y-1">
                      <div className="text-[10px] font-bold text-accent-amber">
                        {isFa ? 'کتیبه سنگ رونیک نیاکان' : 'Runestone Epitaph'}
                      </div>
                      <p className="text-xs text-ink-secondary leading-relaxed">
                        {isFa ? anc.obituaryProseFa ?? anc.obituaryProse : anc.obituaryProse}
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </NorseBottomSheet>
          );
        }

        const d = selectedValhallaItem.data;
        const dName = formatPersonName(d.name, lang);
        return (
          <NorseBottomSheet
            isOpen={true}
            onClose={() => setSelectedValhallaKey(null)}
            accent="slate"
            closeLabel={isFa ? 'بستن' : 'Close'}
            title={dName}
            subtitle={
              isFa
                ? `${ROLE_LABELS.fa[d.role]} مرحوم · ${formatAgeLabel(d.age, 'fa')}`
                : `Late ${ROLE_LABELS.en[d.role]} · ${formatAgeLabel(d.age, 'en')}`
            }
            icon={
              <VikingPortrait
                age={d.age}
                sex={d.sex}
                traits={d.traits}
                title={mapSocialClassToPortraitRank(d.socialClass)}
                seedId={d.id}
                size={58}
              />
            }
            footer={navFooter}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`fallen_${d.id}`}
                initial={{ opacity: 0, x: (isFa ? -1 : 1) * valhallaNavDirection * 22 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: (isFa ? 1 : -1) * valhallaNavDirection * 22 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="p-3.5 rounded-2xl bg-surface-secondary border border-border-subtle space-y-3 text-xs"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-surface-card border border-border-subtle">
                    <div className="text-[10px] text-ink-muted">{isFa ? 'نسبت' : 'Relation'}</div>
                    <div className="font-bold text-ink-primary mt-0.5">
                      {ROLE_LABELS[lang][d.role]}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-card border border-border-subtle">
                    <div className="text-[10px] text-ink-muted">
                      {isFa ? 'سن در زمان مرگ' : 'Age at Death'}
                    </div>
                    <div className="font-bold text-ink-primary font-mono mt-0.5">
                      {formatAgeLabel(d.age, lang)}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-card border border-border-subtle">
                    <div className="text-[10px] text-ink-muted">
                      {isFa ? 'طبقه اجتماعی' : 'Social Class'}
                    </div>
                    <div className="font-bold text-ink-primary mt-0.5">
                      {CLASS_SHORT_LABELS_I18N[lang][d.socialClass]}
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-surface-card border border-border-subtle space-y-1">
                  <div className="text-[10px] text-ink-muted">
                    {isFa ? 'علت درگذشت' : 'Cause of Death'}
                  </div>
                  <div className="font-semibold text-accent-crimson">
                    {isFa
                      ? d.causeOfDeathFa ?? d.causeOfDeath ?? 'درگذشته'
                      : d.causeOfDeath ?? 'Passed away'}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </NorseBottomSheet>
        );
      })()}
    </div>
  );
}
