import { ReactNode, useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Compass,
  Crown,
  Flame,
  Gift,
  GraduationCap,
  Heart,
  HeartHandshake,
  Home,
  MessageCircle,
  Scale,
  Shield,
  Skull,
  Sparkles,
  Swords,
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
  const [selectedValhallaKey, setSelectedValhallaKey] = useState<string | null>(null);
  const [confirmingDivorce, setConfirmingDivorce] = useState<boolean>(false);
  const [showAllValhalla, setShowAllValhalla] = useState<boolean>(false);
  const [lastModalFeedback, setLastModalFeedback] = useState<string | null>(null);

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
    setSelectedPersonId(personId);
  };

  const closePersonSheet = () => {
    setConfirmingDivorce(false);
    setLastModalFeedback(null);
    setSelectedPersonId(null);
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

  // Compact Person Row: ONLY Appearance (Avatar) + Name (+ tiny role badge & chevron)
  const renderCompactCharacterRow = (p: RelationshipPerson, groupAccent: NorseAccent) => {
    const isEnemy = ENEMY_ROLES.has(p.role);
    const displayName = formatPersonName(p.name, lang);
    const epText = p.epithet
      ? isFa
        ? ` «${EPITHET_FA[p.epithet] ?? p.epithet}»`
        : ` "${p.epithet}"`
      : '';

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
          <div className="shrink-0">
            <VikingPortrait
              age={p.age}
              sex={p.sex}
              traits={p.traits}
              title={mapSocialClassToPortraitRank(p.socialClass)}
              seedId={p.id}
              size={42}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs sm:text-sm font-bold text-[#F1F5F9] truncate">
              {displayName}
              {epText}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8] truncate mt-0.5">
              <span>{ROLE_LABELS[lang][p.role]}</span>
              {p.isHeirEligible && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#F59E0B] font-semibold">
                    {isFa ? 'وارث' : 'Heir'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="w-7 h-7 rounded-lg bg-[#131D2B] border border-[#1E2D40] flex items-center justify-center text-[#94A3B8] shrink-0">
          {isFa ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
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
  const selectedValhallaItem = selectedValhallaKey
    ? valhallaItems.find((item) =>
        item.kind === 'ancestor'
          ? `anc_${item.data.id}` === selectedValhallaKey
          : `fallen_${item.data.id}` === selectedValhallaKey
      ) ?? null
    : null;

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
                              ? `فرمانروای نسل ${anc.generation}`
                              : `Gen ${anc.generation} Ruler`}
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
                            ? `${ROLE_LABELS.fa[d.role]} مرحوم`
                            : `Late ${ROLE_LABELS.en[d.role]}`}
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
      {/* LIVING PERSON DOSSIER & NESTED INTERACTIONS MODAL WINDOW          */}
      {/* ================================================================= */}
      {selectedPerson && (() => {
        const p = selectedPerson;
        const isEnemy = ENEMY_ROLES.has(p.role);
        const isChildOrFoster = p.role === 'Child' || p.role === 'Foster-Child';
        const isSpouse = p.role === 'Spouse';
        const famUsed = state.familyInteractionsUsed ?? {};
        const pct = Math.max(0, Math.min(100, isEnemy ? 100 - p.affinity : p.affinity));
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

        const triggerInteraction = (
          interaction: FamilyInteractionType,
          feedbackMsg: string,
          closeAfter = false
        ) => {
          onMemberInteraction(p.id, interaction);
          if (closeAfter) {
            closePersonSheet();
          } else {
            setLastModalFeedback(feedbackMsg);
          }
        };

        const friendlyOptions: {
          key: FamilyInteractionType;
          title: string;
          subtitle: string;
          badge: string;
          costSilver?: number;
          minAge?: number;
          onlyChild?: boolean;
          onlySpouse?: boolean;
          icon: ReactNode;
          tone: 'ice' | 'amber' | 'emerald' | 'violet' | 'crimson';
          feedback: string;
        }[] = [
          {
            key: 'talk',
            title: isFa ? 'گپ صمیمی و وقت‌گذرانی' : 'Heart-to-Heart Talk',
            subtitle: isFa
              ? 'گفتگو کنار آتش تالار و شنیدن دغدغه‌ها'
              : 'Share warm ale and stories by the longhouse hearth',
            badge: isFa ? 'رایگان · +صمیمیت · +شادی' : 'Free · +Bond · +Joy',
            icon: <MessageCircle className="w-4 h-4" />,
            tone: 'ice',
            feedback: isFa
              ? `با «${pName}» گفتگوی صمیمانه‌ای داشتید (+صمیمیت، +شادی).`
              : `You had a warm talk with ${pName} (+Bond, +Joy).`,
          },
          {
            key: 'compliment',
            title: isFa ? 'ستایش و دلگرمی در تالار' : 'Praise in the Mead Hall',
            subtitle: isFa
              ? 'تعریف از منش و وفاداری او در جمع یاران'
              : 'Speak warmly of their virtues before the hearth-companions',
            badge: isFa ? 'رایگان · +صمیمیت · +شرافت' : 'Free · +Bond · +Honor',
            icon: <Sparkles className="w-4 h-4" />,
            tone: 'emerald',
            feedback: isFa
              ? `از «${pName}» در جمع تالار ستایش کردید (+صمیمیت، +شرافت).`
              : `You praised ${pName} before the hall (+Bond, +Honor).`,
          },
          {
            key: 'gift',
            title: isFa ? 'اهدای سنجاق و هدیه نقره' : 'Give Silver Brooch',
            subtitle: isFa
              ? 'پیشکش یک زیور نقره‌کوب برای ابراز محبت'
              : 'Present a finely worked silver brooch as a token of affection',
            badge: isFa ? '۵ نقره · +۱۵ صمیمیت' : '5 Silver · +15 Bond',
            costSilver: 5,
            icon: <Gift className="w-4 h-4" />,
            tone: 'amber',
            feedback: isFa
              ? `هدیه نقره به «${pName}» تقدیم شد (+۱۵ صمیمیت).`
              : `Silver gift presented to ${pName} (+15 Bond).`,
          },
          {
            key: 'lavish_gift',
            title: isFa ? 'اهدای بازوبند زرین و جواهر' : 'Bestow Golden Arm-Ring',
            subtitle: isFa
              ? 'بستن بازوبند گران‌بها برای تحکیم وفاداری ابدی'
              : 'Clasp a heavy gilded arm-ring to seal unshakeable devotion',
            badge: isFa ? '۱۵ نقره · +۲۸ صمیمیت · +شهرت' : '15 Silver · +28 Bond · +Fame',
            costSilver: 15,
            icon: <Crown className="w-4 h-4" />,
            tone: 'amber',
            feedback: isFa
              ? `بازوبند زرین بر بازوی «${pName}» بسته شد (+۲۸ صمیمیت، +۶ شرافت).`
              : `Golden arm-ring bestowed upon ${pName} (+28 Bond, +6 Honor).`,
          },
          {
            key: 'feast_together',
            title: isFa ? 'بزم خصوصی و نوشیدن مید' : 'Private Mead & Venison Feast',
            subtitle: isFa
              ? 'سفره رنگین و جام‌های مید عسلی به افتخار او'
              : 'Share roasted venison and honeyed mead-horns together',
            badge: isFa ? '۸ نقره · +۱۸ صمیمیت · +۹ شادی' : '8 Silver · +18 Bond · +9 Joy',
            costSilver: 8,
            icon: <Flame className="w-4 h-4" />,
            tone: 'amber',
            feedback: isFa
              ? `بزم خصوصی به افتخار «${pName}» برگزار شد (+۱۸ صمیمیت، +۹ شادی).`
              : `Shared a private mead-feast with ${pName} (+18 Bond, +9 Joy).`,
          },
          {
            key: 'try_for_child',
            title: isFa ? 'خلوت عاشقانه و تلاش برای فرزندآوری' : 'Romantic Night & Try for Heir',
            subtitle: isFa
              ? 'افزایش مهر زناشویی و شانس تولد وارث جدید برای خاندان'
              : 'Deepen marital love with a high chance of conceiving a new heir',
            badge: isFa ? 'رایگان · شانس فرزند جدید' : 'Free · Chance of New Child',
            onlySpouse: true,
            minAge: 17,
            icon: <Heart className="w-4 h-4" />,
            tone: 'emerald',
            feedback: isFa
              ? `با «${pName}» خلوت عاشقانه داشتید (نتیجه در گزارش سال ثبت شد).`
              : `Shared romantic time with ${pName}.`,
          },
          {
            key: 'teach',
            title: isFa ? 'آموزش مهارت و رسم وایکینگی' : 'Mentor & Train Norse Skills',
            subtitle: isFa
              ? 'تعلیم سپرداری، قانون شمال و پرورش ویژگی‌های رهبری در فرزند'
              : 'Drill in shield-work and northern law to shape a capable heir',
            badge: isFa ? 'رایگان · تقویت وارث · +شرافت' : 'Free · Train Heir · +Honor',
            onlyChild: true,
            minAge: 5,
            icon: <GraduationCap className="w-4 h-4" />,
            tone: 'emerald',
            feedback: isFa
              ? `به «${pName}» فنون رزم و رسم زندگی آموختید (+۱۰ صمیمیت، تقویت وارث).`
              : `Mentored ${pName} in Norse skills (+10 Bond, Heir Trained).`,
          },
          {
            key: 'spar',
            title: isFa ? 'تمرین شمشیرزنی و رزم مشترک' : 'Spar in the Courtyard',
            subtitle: isFa
              ? 'نبرد تمرینی با سپر و شمشیر چوبی برای تقویت بازو و احترام'
              : 'Trade practice blows with shield and blade to hone combat prowess',
            badge: isFa ? 'رایگان · +۱۲ صمیمیت · +رزم' : 'Free · +12 Bond · +Combat',
            minAge: 10,
            icon: <Swords className="w-4 h-4" />,
            tone: 'ice',
            feedback: isFa
              ? `با «${pName}» تمرین شمشیرزنی کردید (+۱۲ صمیمیت، +۳ رزم، +۳ قدرت).`
              : `Sparred with ${pName} (+12 Bond, +3 Combat, +3 Strength).`,
          },
          {
            key: 'council',
            title: isFa ? 'مشورت در امور خاندان و سیاست' : 'Seek Dynasty & Political Counsel',
            subtitle: isFa
              ? 'هم‌فکری درباره املاک، تجارت و رقابت‌های سیاسی'
              : 'Discuss realm governance, trade routes, and family strategy',
            badge: isFa ? 'رایگان · +۱۰ صمیمیت · +ذکاوت' : 'Free · +10 Bond · +Cunning',
            minAge: 14,
            icon: <Scale className="w-4 h-4" />,
            tone: 'ice',
            feedback: isFa
              ? `با «${pName}» در امور سیاسی مشورت کردید (+۱۰ صمیمیت، +۳ ذکاوت).`
              : `Sought counsel from ${pName} (+10 Bond, +3 Cunning).`,
          },
          {
            key: 'hunt_together',
            title: isFa ? 'شکار در جنگل‌های شمالی' : 'Hunt in the Northern Woods',
            subtitle: isFa
              ? 'ردیابی گوزن و شکار دسته‌جمعی برای نشاط و ذخیره آذوقه'
              : 'Track game through the pine-forests for health, joy, and food stores',
            badge: isFa ? 'رایگان · +سلامتی · +۸ آذوقه' : 'Free · +Health · +8 Food',
            minAge: 12,
            icon: <Compass className="w-4 h-4" />,
            tone: 'emerald',
            feedback: isFa
              ? `همراه با «${pName}» به شکار رفتید (+۱۴ صمیمیت، +۴ سلامتی، +۸ آذوقه).`
              : `Hunted with ${pName} (+14 Bond, +4 Health, +8 Food).`,
          },
          {
            key: 'bless_kin',
            title: isFa ? 'دعای خیر و نذر در نیایشگاه' : 'Sacred Sanctuary Blessing',
            subtitle: isFa
              ? 'نذر نقره نزد خدایان برای تندرستی و بخت بلند او'
              : 'Offer silver and prayers for their health and wyrd',
            badge: isFa ? '۵ نقره · +۱۲ صمیمیت · +ایمان' : '5 Silver · +12 Bond · +Faith',
            costSilver: 5,
            icon: <Sparkles className="w-4 h-4" />,
            tone: 'violet',
            feedback: isFa
              ? `برای «${pName}» در نیایشگاه دعای خیر و نذر کردید (+۱۲ صمیمیت، +ایمان).`
              : `Offered sacred blessings for ${pName} (+12 Bond, +Faith).`,
          },
          {
            key: 'argue',
            title: isFa ? 'بحث، توبیخ و مشاجره' : 'Confront & Argue',
            subtitle: isFa
              ? 'برخورد تند و تحکم‌آمیز بر سر اختلافات تالار'
              : 'Challenge them sharply over hall disputes (+Strength, -Bond)',
            badge: isFa ? 'رایگان · -۱۸ صمیمیت · +قدرت' : 'Free · -18 Bond · +Strength',
            icon: <Flame className="w-4 h-4" />,
            tone: 'crimson',
            feedback: isFa
              ? `با «${pName}» مشاجره تندی داشتید (-۱۸ صمیمیت، +۲ قدرت).`
              : `Had a heated argument with ${pName} (-18 Bond, +2 Strength).`,
          },
        ].filter((opt) => {
          if (opt.onlySpouse && !isSpouse) return false;
          if (opt.onlyChild && !isChildOrFoster) return false;
          if (opt.minAge && p.age < opt.minAge) return false;
          return true;
        });

        return (
          <NorseBottomSheet
            isOpen={true}
            onClose={closePersonSheet}
            accent={isEnemy ? 'crimson' : isSpouse ? 'amber' : 'ice'}
            closeLabel={isFa ? 'بستن' : 'Close'}
            title={`${pName}${pEp}`}
            subtitle={`${ROLE_LABELS[lang][p.role]} · ${formatAgeLabel(p.age, lang)} · ${CLASS_SHORT_LABELS_I18N[lang][p.socialClass]}`}
            icon={
              <VikingPortrait
                age={p.age}
                sex={p.sex}
                traits={p.traits}
                title={mapSocialClassToPortraitRank(p.socialClass)}
                seedId={p.id}
                size={58}
              />
            }
          >
            {/* Live Feedback Banner When an Action is Performed */}
            {lastModalFeedback && (
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs font-semibold text-emerald-400 flex items-center justify-between gap-2">
                <span>✓ {lastModalFeedback}</span>
              </div>
            )}

            {/* ============================================================= */}
            {/* PART 1: FINE-GRAINED CHARACTER DOSSIER (جزئیات دقیق شخص)      */}
            {/* ============================================================= */}
            <div className="p-3.5 rounded-2xl bg-[#131D2B] border border-[#233246] space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-[#1E2D40] pb-2">
                <span className="text-xs font-extrabold text-[#F59E0B]">
                  {isFa ? 'پرونده و جزئیات کامل شخص' : 'Detailed Character Dossier'}
                </span>
                <span className="text-[11px] font-mono text-[#94A3B8]">
                  {isFa ? `خزانه شما: ${state.realm.silver} نقره` : `Treasury: ${state.realm.silver} Silver`}
                </span>
              </div>

              {/* 6-Cell Identity Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-[#101926] border border-[#1E2D40]">
                  <div className="text-[10px] text-[#94A3B8]">{isFa ? 'نسبت در خاندان' : 'Relation'}</div>
                  <div className="font-bold text-[#F1F5F9] mt-0.5">{ROLE_LABELS[lang][p.role]}</div>
                </div>
                <div className="p-2 rounded-xl bg-[#101926] border border-[#1E2D40]">
                  <div className="text-[10px] text-[#94A3B8]">{isFa ? 'سن و سال تولد' : 'Age & Birth'}</div>
                  <div className="font-bold text-[#F1F5F9] font-mono tabular-nums mt-0.5">
                    {isFa ? `${p.age} سال (${birthYear} م)` : `${p.age} yrs (${birthYear} AD)`}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-[#101926] border border-[#1E2D40]">
                  <div className="text-[10px] text-[#94A3B8]">{isFa ? 'طبقه اجتماعی' : 'Social Class'}</div>
                  <div className="font-bold text-[#F1F5F9] mt-0.5">
                    {CLASS_SHORT_LABELS_I18N[lang][p.socialClass]}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-[#101926] border border-[#1E2D40]">
                  <div className="text-[10px] text-[#94A3B8]">{isFa ? 'محل اقامت' : 'Location'}</div>
                  <div className="font-bold text-[#F1F5F9] mt-0.5">{pLocName}</div>
                </div>
                <div className="p-2 rounded-xl bg-[#101926] border border-[#1E2D40]">
                  <div className="text-[10px] text-[#94A3B8]">{isFa ? 'وضعیت وراثت' : 'Succession'}</div>
                  <div
                    className={`font-bold mt-0.5 ${
                      p.isHeirEligible ? 'text-[#F59E0B]' : 'text-[#94A3B8]'
                    }`}
                  >
                    {p.isHeirEligible
                      ? isFa
                        ? 'وارث قانونی خاندان'
                        : 'Eligible Dynasty Heir'
                      : isFa
                        ? 'خارج از صف وراثت'
                        : 'Non-Heir'}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-[#101926] border border-[#1E2D40]">
                  <div className="text-[10px] text-[#94A3B8]">{isFa ? 'خلق‌وخو و روحیه' : 'Temperament'}</div>
                  <div className="font-bold text-[#38BDF8] mt-0.5">{temperament}</div>
                </div>
              </div>

              {/* 5 Fine-Grained Stat Bars */}
              <div className="space-y-2 pt-1">
                {/* 1. Loyalty / Hostility */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                    <span className="text-[#CBD5E1] font-semibold">
                      {isEnemy
                        ? isFa
                          ? 'شدت خصومت و دشمنی'
                          : 'Feud Hostility'
                        : isFa
                          ? 'میزان صمیمیت و وفاداری'
                          : 'Loyalty & Affection'}
                    </span>
                    <span className={isEnemy ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'}>
                      {pct}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#0B1118] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isEnemy ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* 2–5. Health, Martial, Wisdom, Charisma in 2x2 grid */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
                      <span className="text-[#94A3B8]">{isFa ? 'سلامتی و بنیه' : 'Health'}</span>
                      <span className="font-bold text-[#F1F5F9]">{detailedStats.health}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#0B1118] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-teal-500"
                        style={{ width: `${detailedStats.health}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
                      <span className="text-[#94A3B8]">{isFa ? 'رزم‌آوری و شجاعت' : 'Martial'}</span>
                      <span className="font-bold text-[#F1F5F9]">{detailedStats.martial}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#0B1118] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-rose-500"
                        style={{ width: `${detailedStats.martial}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
                      <span className="text-[#94A3B8]">{isFa ? 'خرد و تدبیر' : 'Wisdom'}</span>
                      <span className="font-bold text-[#F1F5F9]">{detailedStats.wisdom}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#0B1118] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500"
                        style={{ width: `${detailedStats.wisdom}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
                      <span className="text-[#94A3B8]">{isFa ? 'جذابیت و نفوذ' : 'Charisma'}</span>
                      <span className="font-bold text-[#F1F5F9]">{detailedStats.charisma}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#0B1118] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-sky-500"
                        style={{ width: `${detailedStats.charisma}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Personality Traits */}
              {p.traits.length > 0 && (
                <div className="pt-2 border-t border-[#1E2D40] space-y-1.5">
                  <div className="text-[11px] font-bold text-[#94A3B8]">
                    {isFa ? 'ویژگی‌های شخصیتی:' : 'Personality Traits:'}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
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
                          className="px-2.5 py-1 rounded-lg bg-[#101926] border border-[#1E2D40] text-xs"
                        >
                          <span className="font-bold text-[#F59E0B]">{tName}</span>
                          {tDesc && (
                            <span className="text-[#94A3B8] text-[11px]"> — {tDesc}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ============================================================= */}
            {/* PART 2: NESTED INTERACTION OPTIONS (گزینه‌های تعامل با شخص)   */}
            {/* ============================================================= */}
            {!isEnemy ? (
              <div className="space-y-2">
                <RuneDivider
                  label={
                    isFa
                      ? `گزینه‌ها و فعالیت‌های مربوط به «${pName}»`
                      : `Interactions & Activities with ${pName}`
                  }
                  accent="ice"
                />

                <div className="space-y-2">
                  {friendlyOptions.map((opt) => {
                    const usageKey = `${p.id}_${opt.key}`;
                    const isUsed = Boolean(famUsed[usageKey]);
                    const cantAfford = Boolean(opt.costSilver && state.realm.silver < opt.costSilver);
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
                        onClick={() => triggerInteraction(opt.key, opt.feedback)}
                        className="w-full p-3 rounded-xl bg-[#101926] hover:bg-[#131D2B] disabled:opacity-50 border border-[#1E2D40] hover:border-[#38BDF8]/60 flex items-center justify-between gap-3 text-start transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
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

                        <span
                          className={`px-2 py-1 rounded-lg border text-[10px] font-mono font-bold shrink-0 ${
                            isUsed
                              ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-500'
                              : cantAfford
                                ? 'bg-[#131D2B] border-[#1E2D40] text-[#64748B]'
                                : 'bg-[#131D2B] border-[#233246] text-[#F59E0B]'
                          }`}
                        >
                          {isUsed
                            ? isFa
                              ? 'انجام شد ✓'
                              : 'Done ✓'
                            : opt.badge}
                        </span>
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
                        {isFa ? 'درخواست طلاق طبق قانون نورس…' : 'Declare Divorce Under Norse Law…'}
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
              </div>
            ) : (
              /* Enemy / Blood Feud Nested Options */
              <div className="space-y-2">
                <RuneDivider
                  label={
                    isFa
                      ? `گزینه‌های رویارویی و دیپلماسی با «${pName}»`
                      : `Feud & Confrontation Options with ${pName}`
                  }
                  accent="crimson"
                />

                {!isAdult ? (
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    {isFa
                      ? 'پس از رسیدن به ۱۷ سالگی می‌توانید این کینه را با دوئل هولم‌گانگ، مذاکره یا خون‌بها یکسره کنید.'
                      : 'Reach age 17 to settle this feud by Holmgang duel, Wergild silver, or peace marriage.'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        onFamilyAction('holmgang_rival', p.id);
                        closePersonSheet();
                      }}
                      className="w-full p-3 rounded-xl bg-[#241016] hover:bg-[#31121A] border border-[#EF4444] flex items-center justify-between gap-3 text-start cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shrink-0 mt-0.5">
                          <Swords className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-bold text-[#F1F5F9]">
                            {isFa ? 'فراخوان به دوئل تن‌به‌تن (هولم‌گانگ)' : 'Challenge to Holmgang Duel'}
                          </div>
                          <p className="text-[11px] text-[#CBD5E1] mt-0.5">
                            {isFa
                              ? 'نبرد مستقیم در حلقه مقدس برای پایان دادن به دشمنی و کسب شهرت'
                              : 'Single combat in the staked ring to settle the feud for good'}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-bold shrink-0">
                        {isFa ? 'نبرد مرگ و زندگی' : 'High Stakes'}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={Boolean(famUsed[`${p.id}_send_envoy`]) || state.realm.silver < 10}
                      onClick={() =>
                        triggerInteraction(
                          'send_envoy',
                          isFa
                            ? `پیک مذاکره نزد «${pName}» فرستاده شد.`
                            : `Envoy sent to ${pName}.`
                        )
                      }
                      className="w-full p-3 rounded-xl bg-[#101926] hover:bg-[#131D2B] disabled:opacity-50 border border-[#1E2D40] hover:border-[#38BDF8]/60 flex items-center justify-between gap-3 text-start cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/35 flex items-center justify-center shrink-0 mt-0.5">
                          <Scale className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-bold text-[#F1F5F9]">
                            {isFa ? 'اعزام پیک صلح و مذاکره سیاسی' : 'Send Diplomatic Peace Envoy'}
                          </div>
                          <p className="text-[11px] text-[#94A3B8] mt-0.5">
                            {isFa
                              ? 'کاهش خصومت با پیشکش و دیپلماسی (در صورت کاهش کامل، تبدیل به متحد می‌شود)'
                              : 'Reduce hostility via diplomacy; may reconcile them into an ally'}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-[#131D2B] border border-[#233246] text-[#F59E0B] text-[10px] font-mono font-bold shrink-0">
                        {famUsed[`${p.id}_send_envoy`]
                          ? isFa
                            ? 'انجام شد ✓'
                            : 'Done ✓'
                          : isFa
                            ? '۱۰ نقره · +دیپلماسی'
                            : '10 Silver'}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={Boolean(famUsed[`${p.id}_intimidate_foe`])}
                      onClick={() =>
                        triggerInteraction(
                          'intimidate_foe',
                          isFa
                            ? `در برابر «${pName}» نمایش اقتدار دادید (+۴ شرافت، +۶ شهرت).`
                            : `Displayed force against ${pName} (+4 Honor, +6 Fame).`
                        )
                      }
                      className="w-full p-3 rounded-xl bg-[#101926] hover:bg-[#131D2B] disabled:opacity-50 border border-[#1E2D40] hover:border-[#F59E0B]/60 flex items-center justify-between gap-3 text-start cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/35 flex items-center justify-center shrink-0 mt-0.5">
                          <Shield className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-bold text-[#F1F5F9]">
                            {isFa ? 'نمایش اقتدار و نهیب در شورا' : 'Show of Force at Assembly'}
                          </div>
                          <p className="text-[11px] text-[#94A3B8] mt-0.5">
                            {isFa
                              ? 'ایستادگی با صلابت در برابر رقیب برای کسب شرافت و شهرت'
                              : 'Stand firm against your rival before the freemen (+Honor, +Fame)'}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-[#131D2B] border border-[#233246] text-emerald-500 text-[10px] font-mono font-bold shrink-0">
                        {famUsed[`${p.id}_intimidate_foe`]
                          ? isFa
                            ? 'انجام شد ✓'
                            : 'Done ✓'
                          : isFa
                            ? 'رایگان · +شرافت'
                            : 'Free · +Honor'}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={state.realm.silver < 30}
                      onClick={() => {
                        onFamilyAction('pay_wergild', p.id);
                        closePersonSheet();
                      }}
                      className="w-full p-3 rounded-xl bg-[#101926] hover:bg-[#131D2B] disabled:opacity-50 border border-[#1E2D40] hover:border-[#F59E0B]/60 flex items-center justify-between gap-3 text-start cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/35 flex items-center justify-center shrink-0 mt-0.5">
                          <Gift className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-bold text-[#F1F5F9]">
                            {isFa ? 'پرداخت خون‌بهای ورگیلد برای صلح کامل' : 'Pay Wergild Blood-Price'}
                          </div>
                          <p className="text-[11px] text-[#94A3B8] mt-0.5">
                            {isFa
                              ? 'پایان فوری و رسمی دشمنی خونی طبق سنت حقوقی اسکاندیناوی'
                              : 'End the blood feud immediately by paying traditional compensation'}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-[#131D2B] border border-[#233246] text-[#F59E0B] text-[10px] font-mono font-bold shrink-0">
                        {isFa ? '۳۰ نقره' : '30 Silver'}
                      </span>
                    </button>

                    {!livingSpouse && (
                      <button
                        type="button"
                        onClick={() =>
                          triggerInteraction('peace_marry', '', true)
                        }
                        className="w-full p-3 rounded-xl bg-[#101926] hover:bg-[#131D2B] border border-[#38BDF8]/50 flex items-center justify-between gap-3 text-start cursor-pointer transition-colors"
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/35 flex items-center justify-center shrink-0 mt-0.5">
                            <HeartHandshake className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs sm:text-sm font-bold text-[#F1F5F9]">
                              {isFa
                                ? 'پیشنهاد وصلتِ صلح و پایان دشمنی'
                                : 'Propose Peace-Weaving Marriage'}
                            </div>
                            <p className="text-[11px] text-[#94A3B8] mt-0.5">
                              {isFa
                                ? 'تبدیل کینه خونی به پیوند زناشویی و افزایش ثبات قلمرو'
                                : 'Turn blood feud into a marital alliance (+12 Joy, +10 Stability)'}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded-lg bg-[#38BDF8]/15 border border-[#38BDF8]/35 text-[#38BDF8] text-[10px] font-bold shrink-0">
                          {isFa ? 'پیمان ازدواج' : 'Peace Union'}
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </NorseBottomSheet>
        );
      })()}

      {/* ================================================================= */}
      {/* VALHALLA MEMORIAL DETAIL MODAL WINDOW                             */}
      {/* ================================================================= */}
      {selectedValhallaItem && (() => {
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
                  size={56}
                />
              }
            >
              <div className="p-3.5 rounded-2xl bg-[#131D2B] border border-[#233246] space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-[#101926] border border-[#1E2D40]">
                    <div className="text-[10px] text-[#94A3B8]">{isFa ? 'دوران زندگی' : 'Lifespan'}</div>
                    <div className="font-bold text-[#F1F5F9] font-mono mt-0.5">
                      {anc.birthYear}–{anc.deathYear} ({anc.ageAtDeath})
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#101926] border border-[#1E2D40]">
                    <div className="text-[10px] text-[#94A3B8]">{isFa ? 'شهرت کسب‌شده' : 'Fame Earned'}</div>
                    <div className="font-bold text-[#F59E0B] font-mono mt-0.5">{anc.fameEarned}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#101926] border border-[#1E2D40]">
                    <div className="text-[10px] text-[#94A3B8]">{isFa ? 'آیین' : 'Faith'}</div>
                    <div className="font-bold text-[#F1F5F9] mt-0.5">
                      {RELIGION_LABELS[lang][anc.religion]}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#101926] border border-[#1E2D40] text-xs space-y-1">
                  <div className="text-[10px] text-[#94A3B8]">{isFa ? 'علت درگذشت' : 'Cause of Death'}</div>
                  <div className="font-semibold text-rose-400">
                    {isFa ? anc.causeOfDeathFa ?? anc.causeOfDeath : anc.causeOfDeath}
                  </div>
                </div>

                {(anc.obituaryProseFa || anc.obituaryProse) && (
                  <p className="text-xs text-[#CBD5E1] leading-relaxed">
                    {isFa ? anc.obituaryProseFa ?? anc.obituaryProse : anc.obituaryProse}
                  </p>
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
                size={56}
              />
            }
          >
            <div className="p-3.5 rounded-2xl bg-[#131D2B] border border-[#233246] space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-xl bg-[#101926] border border-[#1E2D40]">
                  <div className="text-[10px] text-[#94A3B8]">{isFa ? 'نسبت' : 'Relation'}</div>
                  <div className="font-bold text-[#F1F5F9] mt-0.5">{ROLE_LABELS[lang][d.role]}</div>
                </div>
                <div className="p-2 rounded-xl bg-[#101926] border border-[#1E2D40]">
                  <div className="text-[10px] text-[#94A3B8]">{isFa ? 'سن در زمان مرگ' : 'Age at Death'}</div>
                  <div className="font-bold text-[#F1F5F9] font-mono mt-0.5">
                    {formatAgeLabel(d.age, lang)}
                  </div>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#101926] border border-[#1E2D40] space-y-1">
                <div className="text-[10px] text-[#94A3B8]">{isFa ? 'علت درگذشت' : 'Cause of Death'}</div>
                <div className="font-semibold text-[#CBD5E1]">
                  {isFa ? d.causeOfDeathFa ?? d.causeOfDeath ?? 'درگذشته' : d.causeOfDeath ?? 'Passed away'}
                </div>
              </div>
            </div>
          </NorseBottomSheet>
        );
      })()}
    </div>
  );
}
