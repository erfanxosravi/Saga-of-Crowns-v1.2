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
type InteractionFilterId = 'all' | 'bond' | 'gifts' | 'training' | 'dynasty';

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
  const [interactionFilter, setInteractionFilter] = useState<InteractionFilterId>('all');
  const [selectedValhallaKey, setSelectedValhallaKey] = useState<string | null>(null);
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

  // Ordered flat list of all living relationships for smooth Prev / Next navigation in the modal
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
    setModalTab('interactions');
    setInteractionFilter('all');
    setSelectedPersonId(personId);
  };

  const closePersonSheet = () => {
    setConfirmingDivorce(false);
    setLastModalFeedback(null);
    setSelectedPersonId(null);
  };

  const switchPersonInModal = (direction: -1 | 1) => {
    if (!selectedPerson || allLivingOrdered.length <= 1) return;
    const currentIdx = allLivingOrdered.findIndex((item) => item.id === selectedPerson.id);
    if (currentIdx < 0) return;
    const nextIdx = (currentIdx + direction + allLivingOrdered.length) % allLivingOrdered.length;
    setConfirmingDivorce(false);
    setLastModalFeedback(null);
    setInteractionFilter('all');
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
        ? 'bg-[#EF4444]/15 text-[#F87171] ring-1 ring-[#EF4444]/35'
        : accent === 'ice'
          ? 'bg-[#38BDF8]/15 text-[#38BDF8] ring-1 ring-[#38BDF8]/35'
          : accent === 'emerald'
            ? 'bg-[#34D399]/15 text-[#34D399] ring-1 ring-[#34D399]/35'
            : accent === 'slate'
              ? 'bg-[#64748B]/15 text-[#CBD5E1] ring-1 ring-[#64748B]/35'
              : 'bg-[#F59E0B]/15 text-[#F59E0B] ring-1 ring-[#F59E0B]/35';

    return (
      <div className="space-y-1.5 pt-1">
        <RuneDivider accent={accent} />
        <div className="flex items-center justify-between gap-2 px-0.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconTone}`}>
              {icon}
            </div>
            <h3 className="font-saga text-base sm:text-lg font-bold text-[#F1F5F9] whitespace-normal break-words leading-snug">
              {title}
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-[#131D2B] border border-[#1E2D40] text-xs font-mono tabular-nums text-[#94A3B8] shrink-0">
            {count}
          </span>
        </div>
      </div>
    );
  };

  // Compact Person Row: Appearance (Avatar) + Name + Subtle Bond Indicator
  const renderCompactCharacterRow = (p: RelationshipPerson, groupAccent: NorseAccent) => {
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
      ? 'border-[#DC2626]/45 hover:border-[#EF4444]'
      : groupAccent === 'amber'
        ? 'border-[#F59E0B]/35 hover:border-[#F59E0B]'
        : groupAccent === 'emerald'
          ? 'border-[#34D399]/35 hover:border-[#34D399]'
          : 'border-[#233246] hover:border-[#38BDF8]';

    return (
      <button
        key={p.id}
        type="button"
        onClick={() => openPersonSheet(p.id)}
        className={`w-full p-2.5 rounded-xl bg-[#101926] hover:bg-[#131D2B] border ${borderClass} flex items-center justify-between gap-2.5 text-start transition-all active:scale-[0.99] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/70`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="relative shrink-0">
            <VikingPortrait
              age={p.age}
              sex={p.sex}
              traits={p.traits}
              title={mapSocialClassToPortraitRank(p.socialClass)}
              seedId={p.id}
              size={44}
            />
            {isPrimaryHeir && (
              <span
                title={isFa ? 'وارث اول خاندان' : 'Primary Heir'}
                className="absolute -top-1 -end-1 w-4 h-4 rounded-full bg-[#F59E0B] text-[#0B1118] flex items-center justify-center shadow-sm"
              >
                <Crown className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs sm:text-sm font-bold text-[#F1F5F9] truncate">
              {displayName}
              {epText}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8] truncate mt-0.5">
              <span>{ROLE_LABELS[lang][p.role]}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{formatAgeLabel(p.age, lang)}</span>
              {isPrimaryHeir && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#F59E0B] font-semibold">
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
                ? 'text-rose-500'
                : pct >= 70
                  ? 'text-emerald-500'
                  : pct >= 45
                    ? 'text-amber-500'
                    : 'text-rose-400'
            }`}
          >
            {pct}%
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#131D2B] border border-[#1E2D40] flex items-center justify-center text-[#94A3B8]">
            {isFa ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </div>
      </button>
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

  const switchValhallaInModal = (direction: -1 | 1) => {
    if (selectedValhallaIdx < 0 || valhallaItems.length <= 1) return;
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
          <div className="relative p-3.5 rounded-2xl bg-gradient-to-r from-[#241B11] via-[#131D2B] to-[#0F1722] border border-[#F59E0B]/45 flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-hidden">
            <NorseCornerOrnament accent="amber" />
            <div className="space-y-0.5 min-w-0">
              <div className="text-xs sm:text-sm font-bold text-[#F1F5F9] whitespace-normal break-words">
                {isFa ? 'بدون همسر رسمی در تالار' : 'Unmarried — Seek a Spouse'}
              </div>
              <p className="text-xs text-[#CBD5E1] whitespace-normal break-words leading-relaxed">
                {isFa
                  ? 'با پیوند زناشویی، وارثان قانونی برای ادامه دودمان خود پرورش دهید.'
                  : 'Court a worthy partner to raise heirs and secure your dynasty’s future.'}
              </p>
            </div>
            <button
              type="button"
              disabled={state.realm.silver < 15}
              onClick={() => onFamilyAction('court_spouse')}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] disabled:bg-[#1E2D40] disabled:text-[#64748B] text-[#0B1118] text-xs font-extrabold inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer transition-colors"
            >
              <HeartHandshake className="w-4 h-4 shrink-0" />
              <span>{isFa ? 'خواستگاری و ازدواج (۱۵ نقره)' : 'Court & Marry (15 Silver)'}</span>
            </button>
          </div>
        )}

        {householdList.length === 0 ? (
          <div className="p-3 rounded-xl bg-[#131D2B]/75 border border-[#1E2D40] text-xs text-[#94A3B8]">
            {isFa
              ? 'هنوز همسر یا فرزندی در خانه ندارید.'
              : 'No spouse or children in your household yet.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {householdList.map((p) => renderCompactCharacterRow(p, 'amber'))}
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
          <div className="p-3 rounded-xl bg-[#131D2B]/75 border border-[#1E2D40] text-xs text-[#94A3B8]">
            {isFa
              ? 'خویشاوند خونی زنده‌ای در کنار شما نیست.'
              : 'No living parents, siblings, or extended kin right now.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {kinList.map((p) => renderCompactCharacterRow(p, 'ice'))}
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
          <div className="p-3 rounded-xl bg-[#131D2B]/75 border border-[#1E2D40] text-xs text-[#94A3B8]">
            {isFa
              ? 'هنوز خواهر یا برادر قسم‌خورده‌ای ندارید.'
              : 'No sworn shield-companions yet.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {alliesList.map((p) => renderCompactCharacterRow(p, 'emerald'))}
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
          <div className="p-3 rounded-xl bg-[#131D2B]/75 border border-[#1E2D40] text-xs text-[#94A3B8]">
            {isFa
              ? 'در حال حاضر هیچ دشمن خونی یا رقیب سرسختی ندارید.'
              : 'Your hall currently stands free of active rivals and blood feuds.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {enemiesList.map((p) => renderCompactCharacterRow(p, 'crimson'))}
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
          <div className="p-3 rounded-xl bg-[#131D2B]/75 border border-[#1E2D40] text-xs text-[#94A3B8]">
            {isFa
              ? 'هنوز هیچ‌یک از نیاکان یا خویشاوندان به تالار والهالا نپیوسته‌اند.'
              : 'No departed rulers or fallen kin have entered Valhalla’s halls yet.'}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {visibleValhalla.map((item) => {
                if (item.kind === 'ancestor') {
                  const anc = item.data;
                  const key = `anc_${anc.id}`;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedValhallaKey(key)}
                      className="w-full p-2.5 rounded-xl bg-[#101926] hover:bg-[#131D2B] border border-[#233246] hover:border-[#F59E0B]/50 flex items-center justify-between gap-2.5 text-start transition-all cursor-pointer"
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
                          <div className="text-xs sm:text-sm font-bold text-[#F1F5F9] truncate">
                            {formatPersonName(anc.fullName.replace(/"/g, ''), lang)}
                          </div>
                          <div className="text-[11px] text-[#F59E0B] truncate mt-0.5">
                            {isFa
                              ? `فرمانروای نسل ${anc.generation} · ${anc.birthYear}–${anc.deathYear}`
                              : `Gen ${anc.generation} Ruler · ${anc.birthYear}–${anc.deathYear}`}
                          </div>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-lg bg-[#131D2B] border border-[#1E2D40] flex items-center justify-center text-[#94A3B8] shrink-0">
                        {isFa ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </button>
                  );
                }

                const d = item.data;
                const key = `fallen_${d.id}`;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedValhallaKey(key)}
                    className="w-full p-2.5 rounded-xl bg-[#101926] hover:bg-[#131D2B] border border-[#1E2D40] hover:border-[#64748B] flex items-center justify-between gap-2.5 text-start transition-all cursor-pointer"
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
                        <div className="text-xs sm:text-sm font-bold text-[#CBD5E1] truncate">
                          {formatPersonName(d.name, lang)}
                        </div>
                        <div className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                          {isFa
                            ? `${ROLE_LABELS.fa[d.role]} مرحوم · ${formatAgeLabel(d.age, 'fa')}`
                            : `Late ${ROLE_LABELS.en[d.role]} · ${formatAgeLabel(d.age, 'en')}`}
                        </div>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-[#131D2B] border border-[#1E2D40] flex items-center justify-center text-[#94A3B8] shrink-0">
                      {isFa ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {valhallaItems.length > 6 && (
              <button
                type="button"
                onClick={() => setShowAllValhalla((v) => !v)}
                className="w-full min-h-[40px] px-4 py-2 rounded-xl bg-[#131D2B] hover:bg-[#192638] border border-[#233246] text-xs font-semibold text-[#CBD5E1] inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                {showAllValhalla ? (
                  <>
                    <ChevronUp className="w-4 h-4 text-[#38BDF8]" />
                    <span>{isFa ? 'نمایش کمتر' : 'Show Fewer'}</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 text-[#38BDF8]" />
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
        const usedWithThisPersonCount = Object.keys(famUsed).filter(
          (k) => k.startsWith(`${p.id}_`) && famUsed[k]
        ).length;

        const triggerInteraction = (
          interaction: FamilyInteractionType,
          feedbackMsg: string,
          reactionQuote: string,
          closeAfter = false
        ) => {
          onMemberInteraction(p.id, interaction);
          if (closeAfter) {
            closePersonSheet();
          } else {
            setLastModalFeedback({
              message: feedbackMsg,
              quote: reactionQuote,
            });
          }
        };

        const friendlyOptions: {
          key: FamilyInteractionType;
          category: InteractionFilterId;
          title: string;
          subtitle: string;
          effectLabel: string;
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
            category: 'bond',
            title: isFa ? 'گپ صمیمی و وقت‌گذرانی' : 'Heart-to-Heart Talk',
            subtitle: isFa
              ? 'گفتگو کنار آتش تالار و شنیدن دغدغه‌ها'
              : 'Share warm ale and stories by the longhouse hearth',
            effectLabel: isFa ? 'رایگان · +۸ صمیمیت · +۴ شادی' : 'Free · +8 Bond · +4 Joy',
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
            category: 'bond',
            title: isFa ? 'ستایش و دلگرمی در تالار' : 'Praise in the Mead Hall',
            subtitle: isFa
              ? 'تعریف از منش و وفاداری او در جمع یاران'
              : 'Speak warmly of their virtues before the hearth-companions',
            effectLabel: isFa ? 'رایگان · +۹ صمیمیت · +۳ شرافت' : 'Free · +9 Bond · +3 Honor',
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
            category: 'gifts',
            title: isFa ? 'اهدای سنجاق و هدیه نقره' : 'Give Silver Brooch',
            subtitle: isFa
              ? 'پیشکش یک زیور نقره‌کوب برای ابراز محبت'
              : 'Present a finely worked silver brooch as a token of affection',
            effectLabel: isFa ? '۵ نقره · +۱۵ صمیمیت · +۵ شادی' : '5 Silver · +15 Bond · +5 Joy',
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
            category: 'gifts',
            title: isFa ? 'اهدای بازوبند زرین شاهانه' : 'Bestow Golden Arm-Ring',
            subtitle: isFa
              ? 'بستن بازوبند گران‌بها برای تحکیم وفاداری ابدی'
              : 'Clasp a heavy gilded arm-ring to seal unshakeable devotion',
            effectLabel: isFa ? '۱۵ نقره · +۲۸ صمیمیت · +۸ شهرت' : '15 Silver · +28 Bond · +8 Fame',
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
            category: 'gifts',
            title: isFa ? 'بزم خصوصی و نوشیدن مید' : 'Private Mead & Venison Feast',
            subtitle: isFa
              ? 'سفره رنگین و جام‌های مید عسلی به افتخار او'
              : 'Share roasted venison and honeyed mead-horns together',
            effectLabel: isFa ? '۸ نقره · +۱۸ صمیمیت · +۹ شادی' : '8 Silver · +18 Bond · +9 Joy',
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
            category: 'dynasty',
            title: isFa ? 'خلوت عاشقانه و فرزندآوری' : 'Romantic Night & Try for Heir',
            subtitle: isFa
              ? 'افزایش مهر زناشویی و شانس تولد وارث جدید برای خاندان'
              : 'Deepen marital love with a high chance of conceiving a new heir',
            effectLabel: isFa ? 'رایگان · شانس تولد فرزند جدید' : 'Free · Chance of New Child',
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
            category: 'dynasty',
            title: isFa ? 'انتخاب به‌عنوان وارث برگزیده خاندان' : 'Name Primary Dynasty Heir',
            subtitle: isFa
              ? 'معرفی رسمی او در تالار به‌عنوان جانشین اول شما پس از مرگ'
              : 'Proclaim them before the elders as your #1 chosen successor',
            effectLabel: isFa ? 'رایگان · وارث اول · +۱۸ صمیمیت' : 'Free · #1 Heir · +18 Bond',
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
            category: 'dynasty',
            title: isFa ? 'پیمان اخوت و هم‌قسم شدن' : 'Swear Norse Blood-Oath',
            subtitle: isFa
              ? 'بستن پیمان برادری/خواهری خونی برای وفاداری و اتحاد ابدی'
              : 'Mingle blood beneath the turf-arch to make them your Sworn Companion',
            effectLabel: isFa ? 'رایگان · تبدیل به هم‌پیمان · +۱۴ شهرت' : 'Free · Sworn Ally · +14 Fame',
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
            category: 'training',
            title: isFa ? 'آموزش رزم و رسم وایکینگی' : 'Mentor & Train Norse Skills',
            subtitle: isFa
              ? 'تعلیم سپرداری، قانون شمال و پرورش ویژگی‌های رهبری در فرزند'
              : 'Drill in shield-work and northern law to shape a capable heir',
            effectLabel: isFa ? 'رایگان · تقویت وارث · +۱۰ صمیمیت' : 'Free · Train Heir · +10 Bond',
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
            category: 'training',
            title: isFa ? 'تمرین شمشیرزنی و رزم مشترک' : 'Spar in the Courtyard',
            subtitle: isFa
              ? 'نبرد تمرینی با سپر و شمشیر چوبی برای تقویت بازو و احترام'
              : 'Trade practice blows with shield and blade to hone combat prowess',
            effectLabel: isFa ? 'رایگان · +۱۲ صمیمیت · +۳ رزم' : 'Free · +12 Bond · +3 Combat',
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
            category: 'dynasty',
            title: isFa ? 'مشورت در امور خاندان و سیاست' : 'Seek Dynasty & Political Counsel',
            subtitle: isFa
              ? 'هم‌فکری درباره املاک، تجارت و رقابت‌های سیاسی'
              : 'Discuss realm governance, trade routes, and family strategy',
            effectLabel: isFa ? 'رایگان · +۱۰ صمیمیت · +۳ ذکاوت' : 'Free · +10 Bond · +3 Cunning',
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
            category: 'training',
            title: isFa ? 'شکار در جنگل‌های شمالی' : 'Hunt in the Northern Woods',
            subtitle: isFa
              ? 'ردیابی گوزن و شکار دسته‌جمعی برای نشاط و ذخیره آذوقه'
              : 'Track game through the pine-forests for health, joy, and food stores',
            effectLabel: isFa ? 'رایگان · +۱۴ صمیمیت · +۸ آذوقه' : 'Free · +14 Bond · +8 Food',
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
            category: 'bond',
            title: isFa ? 'دعای خیر و نذر در نیایشگاه' : 'Sacred Sanctuary Blessing',
            subtitle: isFa
              ? 'نذر نقره نزد خدایان برای تندرستی و بخت بلند او'
              : 'Offer silver and prayers for their health and wyrd',
            effectLabel: isFa ? '۵ نقره · +۱۲ صمیمیت · +۴ ایمان' : '5 Silver · +12 Bond · +4 Faith',
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
            category: 'bond',
            title: isFa ? 'بحث، توبیخ و مشاجره' : 'Confront & Argue',
            subtitle: isFa
              ? 'برخورد تند و تحکم‌آمیز بر سر اختلافات تالار'
              : 'Challenge them sharply over hall disputes (+Strength, -Bond)',
            effectLabel: isFa ? 'رایگان · -۱۸ صمیمیت · +۲ قدرت' : 'Free · -18 Bond · +2 Strength',
            icon: <Flame className="w-4 h-4" />,
            tone: 'crimson',
            feedback: isFa
              ? `با «${pName}» مشاجره تندی داشتید (-۱۸ صمیمیت، +۲ قدرت).`
              : `Had a heated argument with ${pName} (-18 Bond, +2 Strength).`,
            reactionQuote: isFa
              ? '«سخنان تند امروزت را به این سادگی فراموش نخواهم کرد…»'
              : '“Harsh words spoken in anger leave deep marks in the hall…”',
          },
        ].filter((opt) => {
          if (opt.onlySpouse && !isSpouse) return false;
          if (opt.onlyChild && !isChildOrFoster) return false;
          if (opt.onlyEligibleHeir && (!canBeDesignatedHeir || isPrimaryHeir)) return false;
          if (opt.onlyBloodOathCandidate && !canSwearBloodOath) return false;
          if (opt.minAge && p.age < opt.minAge) return false;
          return true;
        });

        const filteredFriendlyOptions =
          interactionFilter === 'all'
            ? friendlyOptions
            : friendlyOptions.filter((o) => o.category === interactionFilter);

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
              <div className="relative">
                <VikingPortrait
                  age={p.age}
                  sex={p.sex}
                  traits={p.traits}
                  title={mapSocialClassToPortraitRank(p.socialClass)}
                  seedId={p.id}
                  size={60}
                />
                {isPrimaryHeir && (
                  <span className="absolute -top-1 -end-1 w-5 h-5 rounded-full bg-[#F59E0B] text-[#0B1118] flex items-center justify-center shadow">
                    <Crown className="w-3 h-3" />
                  </span>
                )}
              </div>
            }
            footer={
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-1.5 font-mono tabular-nums text-[#F59E0B] font-bold">
                    <Coins className="w-3.5 h-3.5" />
                    <span>
                      {isFa
                        ? `خزانه: ${state.realm.silver} نقره`
                        : `Treasury: ${state.realm.silver} Silver`}
                    </span>
                  </div>
                  <span className="text-[#64748B]" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-[#94A3B8] font-mono tabular-nums">
                    {isFa
                      ? `تعاملات امسال: ${usedWithThisPersonCount}`
                      : `Actions this year: ${usedWithThisPersonCount}`}
                  </span>
                </div>

                {allLivingOrdered.length > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => switchPersonInModal(-1)}
                      className="min-h-[36px] px-2.5 py-1 rounded-xl bg-[#101926] hover:bg-[#182638] border border-[#233246] text-xs font-semibold text-[#CBD5E1] inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {isFa ? (
                        <ChevronRight className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronLeft className="w-3.5 h-3.5" />
                      )}
                      <span>{isFa ? 'قبلی' : 'Prev'}</span>
                    </button>
                    <span className="px-2 py-1 text-[11px] font-mono tabular-nums text-[#94A3B8]">
                      {currentPersonIndex + 1}/{allLivingOrdered.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => switchPersonInModal(1)}
                      className="min-h-[36px] px-2.5 py-1 rounded-xl bg-[#101926] hover:bg-[#182638] border border-[#233246] text-xs font-semibold text-[#CBD5E1] inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>{isFa ? 'بعدی' : 'Next'}</span>
                      {isFa ? (
                        <ChevronLeft className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            }
          >
            {/* ============================================================= */}
            {/* HERO CHARACTER SUMMARY & DIALOGUE CARD                        */}
            {/* ============================================================= */}
            <div className="relative p-3.5 rounded-2xl bg-[#131D2B] border border-[#233246] space-y-3 overflow-hidden">
              <NorseCornerOrnament accent={isEnemy ? 'crimson' : isSpouse ? 'amber' : 'ice'} />

              {/* Top Status Row: Location + Succession + Temperament */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2 text-[#CBD5E1]">
                  <span className="inline-flex items-center gap-1 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>{pLocName}</span>
                  </span>
                  <span className="text-[#64748B]" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-[#94A3B8]">
                    {isFa ? `متولد ${birthYear} میلادی` : `Born ${birthYear} AD`}
                  </span>
                  {isPrimaryHeir && (
                    <>
                      <span className="text-[#64748B]" aria-hidden="true">
                        ·
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#F59E0B] font-bold">
                        <Crown className="w-3.5 h-3.5" />
                        <span>{isFa ? 'وارث اول دودمان' : 'Primary Dynasty Heir'}</span>
                      </span>
                    </>
                  )}
                </div>

                <span className="text-xs font-bold text-[#38BDF8]">{temperament}</span>
              </div>

              {/* 5-Segment Relationship & Loyalty Meter */}
              <div className="p-2.5 rounded-xl bg-[#101926] border border-[#1E2D40] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 font-bold text-[#F1F5F9]">
                    {isEnemy ? (
                      <Swords className="w-3.5 h-3.5 text-rose-500" />
                    ) : (
                      <Heart className="w-3.5 h-3.5 text-emerald-500" />
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
                  <span
                    className={`font-mono tabular-nums font-extrabold ${
                      isEnemy
                        ? 'text-rose-500'
                        : pct >= 70
                          ? 'text-emerald-500'
                          : pct >= 45
                            ? 'text-amber-500'
                            : 'text-rose-400'
                    }`}
                  >
                    {pct}%
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((seg) => {
                    const active = seg <= filledSegments;
                    const activeColor = isEnemy
                      ? 'bg-rose-500'
                      : pct >= 70
                        ? 'bg-emerald-500'
                        : pct >= 45
                          ? 'bg-amber-500'
                          : 'bg-rose-500';
                    return (
                      <div
                        key={seg}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          active ? activeColor : 'bg-[#0B1118]'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Live Character Quote / Action Reaction Box */}
              <div
                className={`p-3 rounded-xl border transition-all ${
                  lastModalFeedback
                    ? 'bg-emerald-500/10 border-emerald-500/40'
                    : 'bg-[#101926] border-[#1E2D40]'
                }`}
              >
                {lastModalFeedback && (
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-500 mb-1">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{lastModalFeedback.message}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-xs text-[#CBD5E1] leading-relaxed">
                  <Quote className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5 opacity-80" />
                  <p className="italic">
                    {lastModalFeedback ? lastModalFeedback.quote : defaultDialogueQuote}
                  </p>
                </div>
              </div>
            </div>

            {/* ============================================================= */}
            {/* SEGMENTED MODAL TABS: 1. INTERACTIONS  |  2. DOSSIER & STATS  */}
            {/* ============================================================= */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#101926] border border-[#1E2D40]">
              <button
                type="button"
                onClick={() => setModalTab('interactions')}
                className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  modalTab === 'interactions'
                    ? 'bg-[#F59E0B] text-[#0B1118] shadow-xs'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isEnemy
                    ? isFa
                      ? 'رویارویی و دیپلماسی'
                      : 'Confrontation & Diplomacy'
                    : isFa
                      ? `تعامل و اقدام (${friendlyOptions.length})`
                      : `Interactions (${friendlyOptions.length})`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('dossier')}
                className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  modalTab === 'dossier'
                    ? 'bg-[#38BDF8] text-[#0B1118] shadow-xs'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{isFa ? 'شناسنامه و ویژگی‌ها' : 'Dossier & Attributes'}</span>
              </button>
            </div>

            {/* ============================================================= */}
            {/* TAB 1: INTERACTIONS & ACTIVITIES                              */}
            {/* ============================================================= */}
            {modalTab === 'interactions' && (
              <div className="space-y-3">
                {!isEnemy ? (
                  <>
                    {/* Category Filter Bar */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(
                        [
                          { id: 'all', labelFa: 'همه گزینه‌ها', labelEn: 'All' },
                          { id: 'bond', labelFa: 'محبت و گفتگو', labelEn: 'Talk & Care' },
                          { id: 'gifts', labelFa: 'هدیه و بزم', labelEn: 'Gifts & Feast' },
                          { id: 'training', labelFa: 'رزم و شکار', labelEn: 'Spar & Hunt' },
                          { id: 'dynasty', labelFa: 'امور خاندان', labelEn: 'Dynasty' },
                        ] as const
                      ).map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setInteractionFilter(cat.id)}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer ${
                            interactionFilter === cat.id
                              ? 'bg-[#18293E] border-[#F59E0B]/70 text-[#F59E0B]'
                              : 'bg-[#101926] border-[#1E2D40] text-[#94A3B8] hover:text-[#F1F5F9]'
                          }`}
                        >
                          {isFa ? cat.labelFa : cat.labelEn}
                        </button>
                      ))}
                    </div>

                    {/* 2-Column Interactive Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {filteredFriendlyOptions.map((opt) => {
                        const usageKey = `${p.id}_${opt.key}`;
                        const isUsed = Boolean(famUsed[usageKey]);
                        const cantAfford = Boolean(
                          opt.costSilver && state.realm.silver < opt.costSilver
                        );
                        const isDisabled = isUsed || cantAfford;

                        const iconBoxTone =
                          opt.tone === 'amber'
                            ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/35'
                            : opt.tone === 'emerald'
                              ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/35'
                              : opt.tone === 'violet'
                                ? 'bg-purple-500/15 text-purple-400 border-purple-500/35'
                                : opt.tone === 'crimson'
                                  ? 'bg-rose-500/15 text-rose-500 border-rose-500/35'
                                  : 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/35';

                        return (
                          <button
                            key={opt.key}
                            type="button"
                            disabled={isDisabled}
                            onClick={() =>
                              triggerInteraction(opt.key, opt.feedback, opt.reactionQuote)
                            }
                            className={`p-3 rounded-xl bg-[#101926] hover:bg-[#131D2B] disabled:opacity-55 border ${
                              isUsed
                                ? 'border-emerald-500/40'
                                : 'border-[#1E2D40] hover:border-[#38BDF8]/65'
                            } flex flex-col justify-between gap-2.5 text-start transition-all active:scale-[0.99] cursor-pointer`}
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              <div
                                className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${iconBoxTone}`}
                              >
                                {opt.icon}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs sm:text-sm font-bold text-[#F1F5F9] leading-snug">
                                  {opt.title}
                                </div>
                                <p className="text-[11px] text-[#94A3B8] leading-relaxed mt-0.5">
                                  {opt.subtitle}
                                </p>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-[#1E2D40]/80 flex items-center justify-between gap-2 w-full">
                              <span
                                className={`text-[11px] font-mono font-bold ${
                                  isUsed
                                    ? 'text-emerald-500'
                                    : cantAfford
                                      ? 'text-[#64748B]'
                                      : 'text-[#F59E0B]'
                                }`}
                              >
                                {isUsed
                                  ? isFa
                                    ? 'امسال انجام شد ✓'
                                    : 'Completed This Year ✓'
                                  : opt.effectLabel}
                              </span>
                              {!isUsed && (
                                <span className="text-[11px] font-bold text-[#38BDF8]">
                                  {isFa ? 'انجام ←' : 'Perform →'}
                                </span>
                              )}
                            </div>
                          </button>
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
                            className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-[#151118] hover:bg-[#22141B] border border-[#581C26] text-xs font-semibold text-[#CBD5E1] hover:text-[#FCA5A5] cursor-pointer transition-colors"
                          >
                            {isFa
                              ? 'درخواست طلاق طبق قانون نورس…'
                              : 'Declare Divorce Under Norse Law…'}
                          </button>
                        ) : (
                          <div
                            role="alertdialog"
                            aria-label={isFa ? 'تأیید طلاق' : 'Confirm Divorce'}
                            className="p-3.5 rounded-2xl bg-[#241016] border border-[#EF4444] flex flex-col overflow-hidden space-y-3"
                          >
                            <div className="flex items-start gap-2.5">
                              <AlertTriangle className="w-5 h-5 text-[#F87171] shrink-0 mt-0.5" />
                              <div className="space-y-1 min-w-0">
                                <div className="text-xs sm:text-sm font-bold text-[#FFE4E6] whitespace-normal break-words">
                                  {isFa
                                    ? `آیا از طلاق دادن «${pName}» مطمئن هستید؟`
                                    : `Divorce ${pName}?`}
                                </div>
                                <p className="text-xs text-[#FECACA] whitespace-normal break-words leading-relaxed">
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
                                className="min-h-[40px] px-3 py-2 rounded-xl bg-[#131D2B] hover:bg-[#1C2A3E] border border-[#2C415C] text-xs font-bold text-[#F1F5F9] cursor-pointer transition-colors"
                              >
                                {isFa ? 'انصراف' : 'Cancel'}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  onFamilyAction('divorce_spouse');
                                  closePersonSheet();
                                }}
                                className="min-h-[40px] px-3 py-2 rounded-xl bg-[#DC2626] hover:bg-[#EF4444] text-xs font-extrabold text-white cursor-pointer transition-colors"
                              >
                                {isFa
                                  ? `تأیید طلاق (${divorceCost} نقره)`
                                  : `Confirm (${divorceCost} Silver)`}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  /* Enemy / Blood Feud Options */
                  <div className="space-y-2.5">
                    {!isAdult ? (
                      <div className="p-3 rounded-xl bg-[#101926] border border-[#1E2D40] text-xs text-[#94A3B8] leading-relaxed">
                        {isFa
                          ? 'پس از رسیدن به ۱۷ سالگی می‌توانید این کینه را با دوئل هولم‌گانگ، مذاکره یا خون‌بها یکسره کنید.'
                          : 'Reach age 17 to settle this feud by Holmgang duel, Wergild silver, or peace marriage.'}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            onFamilyAction('holmgang_rival', p.id);
                            closePersonSheet();
                          }}
                          className="p-3 rounded-xl bg-[#241016] hover:bg-[#31121A] border border-[#EF4444] flex flex-col justify-between gap-2.5 text-start cursor-pointer transition-colors"
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shrink-0 mt-0.5">
                              <Swords className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs sm:text-sm font-bold text-[#F1F5F9]">
                                {isFa
                                  ? 'دوئل تن‌به‌تن (هولم‌گانگ)'
                                  : 'Challenge to Holmgang Duel'}
                              </div>
                              <p className="text-[11px] text-[#CBD5E1] mt-0.5">
                                {isFa
                                  ? 'نبرد مستقیم در حلقه مقدس برای پایان دادن به دشمنی و کسب شهرت'
                                  : 'Single combat in the staked ring to settle the feud for good'}
                              </p>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-rose-500/30 flex items-center justify-between text-[11px] font-bold text-rose-400">
                            <span>{isFa ? 'نبرد مرگ و زندگی · +شهرت' : 'High Stakes · +Fame'}</span>
                            <span>{isFa ? 'ورود به نبرد ←' : 'Fight →'}</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          disabled={
                            Boolean(famUsed[`${p.id}_send_envoy`]) || state.realm.silver < 10
                          }
                          onClick={() =>
                            triggerInteraction(
                              'send_envoy',
                              isFa
                                ? `پیک مذاکره نزد «${pName}» فرستاده شد.`
                                : `Envoy sent to ${pName}.`,
                              isFa
                                ? '«پیام و پیشکش فرستاده‌ات را دیدم؛ شاید بتوانیم از خون‌ریزی بگذریم…»'
                                : '“I received your envoy’s token; perhaps cooler heads may yet prevail…”'
                            )
                          }
                          className="p-3 rounded-xl bg-[#101926] hover:bg-[#131D2B] disabled:opacity-50 border border-[#1E2D40] hover:border-[#38BDF8]/60 flex flex-col justify-between gap-2.5 text-start cursor-pointer transition-colors"
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/35 flex items-center justify-center shrink-0 mt-0.5">
                              <Scale className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs sm:text-sm font-bold text-[#F1F5F9]">
                                {isFa
                                  ? 'اعزام پیک صلح و مذاکره سیاسی'
                                  : 'Send Diplomatic Peace Envoy'}
                              </div>
                              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                                {isFa
                                  ? 'کاهش خصومت با دیپلماسی (امکان تبدیل رقیب به هم‌پیمان)'
                                  : 'Reduce hostility via diplomacy; may reconcile them into an ally'}
                              </p>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-[#1E2D40] flex items-center justify-between text-[11px] font-mono font-bold text-[#F59E0B]">
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
                              <span className="text-[#38BDF8]">{isFa ? 'ارسال ←' : 'Send →'}</span>
                            )}
                          </div>
                        </button>

                        <button
                          type="button"
                          disabled={Boolean(famUsed[`${p.id}_intimidate_foe`])}
                          onClick={() =>
                            triggerInteraction(
                              'intimidate_foe',
                              isFa
                                ? `در برابر «${pName}» نمایش اقتدار دادید (+۴ شرافت، +۶ شهرت).`
                                : `Displayed force against ${pName} (+4 Honor, +6 Fame).`,
                              isFa
                                ? '«سپاه و اقتدارت را به رخ می‌کشی؟ خواهیم دید روزگار به کام که می‌چرخد!»'
                                : '“You flaunt your strength before the assembly? We shall see how fate turns!”'
                            )
                          }
                          className="p-3 rounded-xl bg-[#101926] hover:bg-[#131D2B] disabled:opacity-50 border border-[#1E2D40] hover:border-[#F59E0B]/60 flex flex-col justify-between gap-2.5 text-start cursor-pointer transition-colors"
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/35 flex items-center justify-center shrink-0 mt-0.5">
                              <Shield className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs sm:text-sm font-bold text-[#F1F5F9]">
                                {isFa
                                  ? 'نمایش اقتدار و نهیب در شورا'
                                  : 'Show of Force at Assembly'}
                              </div>
                              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                                {isFa
                                  ? 'ایستادگی با صلابت در برابر رقیب برای کسب شرافت و شهرت'
                                  : 'Stand firm against your rival before the freemen (+Honor, +Fame)'}
                              </p>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-[#1E2D40] flex items-center justify-between text-[11px] font-mono font-bold text-emerald-500">
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
                        </button>

                        <button
                          type="button"
                          disabled={state.realm.silver < 30}
                          onClick={() => {
                            onFamilyAction('pay_wergild', p.id);
                            closePersonSheet();
                          }}
                          className="p-3 rounded-xl bg-[#101926] hover:bg-[#131D2B] disabled:opacity-50 border border-[#1E2D40] hover:border-[#F59E0B]/60 flex flex-col justify-between gap-2.5 text-start cursor-pointer transition-colors"
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/35 flex items-center justify-center shrink-0 mt-0.5">
                              <Gift className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs sm:text-sm font-bold text-[#F1F5F9]">
                                {isFa
                                  ? 'پرداخت خون‌بهای ورگیلد (صلح کامل)'
                                  : 'Pay Wergild Blood-Price'}
                              </div>
                              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                                {isFa
                                  ? 'پایان فوری و رسمی دشمنی خونی طبق سنت حقوقی اسکاندیناوی'
                                  : 'End the blood feud immediately by paying traditional compensation'}
                              </p>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-[#1E2D40] flex items-center justify-between text-[11px] font-mono font-bold text-[#F59E0B]">
                            <span>{isFa ? '۳۰ نقره · پایان قطعی کینه' : '30 Silver · End Feud'}</span>
                            <span className="text-[#38BDF8]">{isFa ? 'پرداخت ←' : 'Pay →'}</span>
                          </div>
                        </button>

                        {!livingSpouse && (
                          <button
                            type="button"
                            onClick={() => triggerInteraction('peace_marry', '', '', true)}
                            className="sm:col-span-2 p-3 rounded-xl bg-[#101926] hover:bg-[#131D2B] border border-[#38BDF8]/50 flex items-center justify-between gap-3 text-start cursor-pointer transition-colors"
                          >
                            <div className="flex items-start gap-2.5 min-w-0 flex-1">
                              <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/35 flex items-center justify-center shrink-0 mt-0.5">
                                <HeartHandshake className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs sm:text-sm font-bold text-[#F1F5F9]">
                                  {isFa
                                    ? 'پیشنهاد وصلتِ صلح و پایان دشمنی خونی'
                                    : 'Propose Peace-Weaving Marriage'}
                                </div>
                                <p className="text-[11px] text-[#94A3B8] mt-0.5">
                                  {isFa
                                    ? 'تبدیل کینه خونی به پیوند زناشویی و افزایش ثبات قلمرو (+۱۲ شادی، +۱۰ ثبات)'
                                    : 'Turn blood feud into a marital alliance (+12 Joy, +10 Stability)'}
                                </p>
                              </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg bg-[#38BDF8]/15 border border-[#38BDF8]/35 text-[#38BDF8] text-[11px] font-bold shrink-0">
                              {isFa ? 'پیمان ازدواج' : 'Peace Union'}
                            </span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================= */}
            {/* TAB 2: DETAILED CHARACTER DOSSIER, ATTRIBUTES & TRAITS        */}
            {/* ============================================================= */}
            {modalTab === 'dossier' && (
              <div className="space-y-3.5">
                {/* 4 Graphical Attribute Cards (2x2 Grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-[#101926] border border-[#1E2D40] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F1F5F9]">
                        <Heart className="w-3.5 h-3.5 text-teal-500" />
                        <span>{isFa ? 'سلامتی و بنیه بدنی' : 'Health & Vitality'}</span>
                      </span>
                      <span className="text-xs font-mono font-extrabold text-teal-500">
                        {detailedStats.health}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#0B1118] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-teal-500"
                        style={{ width: `${detailedStats.health}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-[#94A3B8]">
                      {getStatGradeLabel('health', detailedStats.health, isFa)}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#101926] border border-[#1E2D40] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F1F5F9]">
                        <Swords className="w-3.5 h-3.5 text-rose-500" />
                        <span>{isFa ? 'قدرت رزمی و شجاعت' : 'Martial Prowess'}</span>
                      </span>
                      <span className="text-xs font-mono font-extrabold text-rose-500">
                        {detailedStats.martial}/99
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#0B1118] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-rose-500"
                        style={{ width: `${detailedStats.martial}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-[#94A3B8]">
                      {getStatGradeLabel('martial', detailedStats.martial, isFa)}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#101926] border border-[#1E2D40] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F1F5F9]">
                        <Brain className="w-3.5 h-3.5 text-amber-500" />
                        <span>{isFa ? 'خرد، ذکاوت و تدبیر' : 'Wisdom & Cunning'}</span>
                      </span>
                      <span className="text-xs font-mono font-extrabold text-amber-500">
                        {detailedStats.wisdom}/99
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#0B1118] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500"
                        style={{ width: `${detailedStats.wisdom}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-[#94A3B8]">
                      {getStatGradeLabel('wisdom', detailedStats.wisdom, isFa)}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#101926] border border-[#1E2D40] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F1F5F9]">
                        <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                        <span>{isFa ? 'کاریزما و نفوذ کلام' : 'Charisma & Presence'}</span>
                      </span>
                      <span className="text-xs font-mono font-extrabold text-sky-500">
                        {detailedStats.charisma}/99
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#0B1118] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-sky-500"
                        style={{ width: `${detailedStats.charisma}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-[#94A3B8]">
                      {getStatGradeLabel('charisma', detailedStats.charisma, isFa)}
                    </div>
                  </div>
                </div>

                {/* 6-Cell Complete Identity Table */}
                <div className="p-3 rounded-2xl bg-[#131D2B] border border-[#233246] space-y-2.5">
                  <div className="text-xs font-extrabold text-[#F59E0B]">
                    {isFa ? 'شناسنامه و جایگاه در دودمان' : 'Dynasty Registry & Status'}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#101926] border border-[#1E2D40]">
                      <div className="text-[10px] text-[#94A3B8]">
                        {isFa ? 'نسبت خاندانی' : 'Relation'}
                      </div>
                      <div className="font-bold text-[#F1F5F9] mt-0.5">
                        {ROLE_LABELS[lang][p.role]}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#101926] border border-[#1E2D40]">
                      <div className="text-[10px] text-[#94A3B8]">
                        {isFa ? 'سن و سال تولد' : 'Age & Birth'}
                      </div>
                      <div className="font-bold text-[#F1F5F9] font-mono tabular-nums mt-0.5">
                        {isFa ? `${p.age} سال (${birthYear} م)` : `${p.age} yrs (${birthYear} AD)`}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#101926] border border-[#1E2D40]">
                      <div className="text-[10px] text-[#94A3B8]">
                        {isFa ? 'طبقه اجتماعی' : 'Social Class'}
                      </div>
                      <div className="font-bold text-[#F1F5F9] mt-0.5">
                        {CLASS_SHORT_LABELS_I18N[lang][p.socialClass]}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#101926] border border-[#1E2D40]">
                      <div className="text-[10px] text-[#94A3B8]">
                        {isFa ? 'محل اقامت' : 'Residence'}
                      </div>
                      <div className="font-bold text-[#F1F5F9] mt-0.5">{pLocName}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#101926] border border-[#1E2D40]">
                      <div className="text-[10px] text-[#94A3B8]">
                        {isFa ? 'جایگاه وراثت' : 'Succession'}
                      </div>
                      <div
                        className={`font-bold mt-0.5 ${
                          isPrimaryHeir
                            ? 'text-[#F59E0B]'
                            : canBeDesignatedHeir
                              ? 'text-[#38BDF8]'
                              : 'text-[#94A3B8]'
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
                    <div className="p-2.5 rounded-xl bg-[#101926] border border-[#1E2D40]">
                      <div className="text-[10px] text-[#94A3B8]">
                        {isFa ? 'روحیه و خلق‌وخو' : 'Temperament'}
                      </div>
                      <div className="font-bold text-[#38BDF8] mt-0.5">{temperament}</div>
                    </div>
                  </div>
                </div>

                {/* Detailed Personality Traits Cards */}
                <div className="p-3 rounded-2xl bg-[#131D2B] border border-[#233246] space-y-2.5">
                  <div className="text-xs font-extrabold text-[#F59E0B]">
                    {isFa ? 'ویژگی‌های اخلاقی و ذاتی' : 'Personality & Innate Traits'}
                  </div>
                  {p.traits.length === 0 ? (
                    <p className="text-xs text-[#94A3B8]">
                      {isFa
                        ? 'هنوز ویژگی شخصیتی خاصی برای او ثبت نشده است.'
                        : 'No distinct traits recorded yet.'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {p.traits.map((tId) => {
                        const tName = isFa
                          ? TRAITS_FA[tId]?.name ?? ALL_TRAITS_MAP[tId]?.name ?? tId
                          : ALL_TRAITS_MAP[tId]?.name ?? tId;
                        const tDesc = isFa
                          ? TRAITS_FA[tId]?.description ?? ALL_TRAITS_MAP[tId]?.description ?? ''
                          : ALL_TRAITS_MAP[tId]?.description ?? '';
                        return (
                          <div
                            key={tId}
                            className="p-2.5 rounded-xl bg-[#101926] border border-[#1E2D40] space-y-1"
                          >
                            <div className="text-xs font-bold text-[#F59E0B]">{tName}</div>
                            {tDesc && (
                              <p className="text-[11px] text-[#94A3B8] leading-relaxed">{tDesc}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </NorseBottomSheet>
        );
      })()}

      {/* ================================================================= */}
      {/* VALHALLA MEMORIAL DETAIL MODAL WINDOW                             */}
      {/* ================================================================= */}
      {selectedValhallaItem && (() => {
        const navFooter =
          valhallaItems.length > 1 ? (
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-[#94A3B8]">
                {isFa ? 'تالار جاودانگان والهالا' : 'Hall of Valhalla Memorial'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => switchValhallaInModal(-1)}
                  className="min-h-[36px] px-2.5 py-1 rounded-xl bg-[#101926] hover:bg-[#182638] border border-[#233246] text-xs font-semibold text-[#CBD5E1] inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {isFa ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronLeft className="w-3.5 h-3.5" />
                  )}
                  <span>{isFa ? 'قبلی' : 'Prev'}</span>
                </button>
                <span className="px-2 py-1 text-[11px] font-mono tabular-nums text-[#94A3B8]">
                  {selectedValhallaIdx + 1}/{valhallaItems.length}
                </span>
                <button
                  type="button"
                  onClick={() => switchValhallaInModal(1)}
                  className="min-h-[36px] px-2.5 py-1 rounded-xl bg-[#101926] hover:bg-[#182638] border border-[#233246] text-xs font-semibold text-[#CBD5E1] inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>{isFa ? 'بعدی' : 'Next'}</span>
                  {isFa ? (
                    <ChevronLeft className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
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
              <div className="p-3.5 rounded-2xl bg-[#131D2B] border border-[#233246] space-y-3">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#101926] border border-[#1E2D40]">
                    <div className="text-[10px] text-[#94A3B8]">
                      {isFa ? 'دوران زندگی' : 'Lifespan'}
                    </div>
                    <div className="font-bold text-[#F1F5F9] font-mono mt-0.5">
                      {anc.birthYear}–{anc.deathYear} ({anc.ageAtDeath})
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#101926] border border-[#1E2D40]">
                    <div className="text-[10px] text-[#94A3B8]">
                      {isFa ? 'شهرت کسب‌شده' : 'Fame Earned'}
                    </div>
                    <div className="font-bold text-[#F59E0B] font-mono mt-0.5">
                      {anc.fameEarned}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#101926] border border-[#1E2D40]">
                    <div className="text-[10px] text-[#94A3B8]">{isFa ? 'آیین' : 'Faith'}</div>
                    <div className="font-bold text-[#F1F5F9] mt-0.5">
                      {RELIGION_LABELS[lang][anc.religion]}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#101926] border border-[#1E2D40] text-xs space-y-1">
                  <div className="text-[10px] text-[#94A3B8]">
                    {isFa ? 'علت درگذشت' : 'Cause of Death'}
                  </div>
                  <div className="font-bold text-rose-400">
                    {isFa ? anc.causeOfDeathFa ?? anc.causeOfDeath : anc.causeOfDeath}
                  </div>
                </div>

                {(anc.obituaryProseFa || anc.obituaryProse) && (
                  <div className="p-3 rounded-xl bg-[#101926] border border-[#1E2D40] space-y-1">
                    <div className="text-[10px] font-bold text-[#F59E0B]">
                      {isFa ? 'کتیبه سنگ رونیک نیاکان' : 'Runestone Epitaph'}
                    </div>
                    <p className="text-xs text-[#CBD5E1] leading-relaxed">
                      {isFa ? anc.obituaryProseFa ?? anc.obituaryProse : anc.obituaryProse}
                    </p>
                  </div>
                )}
              </div>
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
            <div className="p-3.5 rounded-2xl bg-[#131D2B] border border-[#233246] space-y-3 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-[#101926] border border-[#1E2D40]">
                  <div className="text-[10px] text-[#94A3B8]">{isFa ? 'نسبت' : 'Relation'}</div>
                  <div className="font-bold text-[#F1F5F9] mt-0.5">
                    {ROLE_LABELS[lang][d.role]}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#101926] border border-[#1E2D40]">
                  <div className="text-[10px] text-[#94A3B8]">
                    {isFa ? 'سن در زمان مرگ' : 'Age at Death'}
                  </div>
                  <div className="font-bold text-[#F1F5F9] font-mono mt-0.5">
                    {formatAgeLabel(d.age, lang)}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#101926] border border-[#1E2D40]">
                  <div className="text-[10px] text-[#94A3B8]">
                    {isFa ? 'طبقه اجتماعی' : 'Social Class'}
                  </div>
                  <div className="font-bold text-[#F1F5F9] mt-0.5">
                    {CLASS_SHORT_LABELS_I18N[lang][d.socialClass]}
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#101926] border border-[#1E2D40] space-y-1">
                <div className="text-[10px] text-[#94A3B8]">
                  {isFa ? 'علت درگذشت' : 'Cause of Death'}
                </div>
                <div className="font-semibold text-rose-400">
                  {isFa
                    ? d.causeOfDeathFa ?? d.causeOfDeath ?? 'درگذشته'
                    : d.causeOfDeath ?? 'Passed away'}
                </div>
              </div>
            </div>
          </NorseBottomSheet>
        );
      })()}
    </div>
  );
}
