import { ReactNode, useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Crown,
  Flame,
  Gift,
  GraduationCap,
  HeartHandshake,
  Home,
  MessageCircle,
  Shield,
  Skull,
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

export function FamilyPanel({
  state,
  onFamilyAction,
  onMemberInteraction,
}: FamilyPanelProps) {
  const lang = state.settings.language;
  const isFa = lang === 'fa';

  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [confirmingDivorce, setConfirmingDivorce] = useState<boolean>(false);
  const [showAllValhalla, setShowAllValhalla] = useState<boolean>(false);

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

  const selectedPerson =
    selectedPersonId
      ? state.relationships.find((r) => r.id === selectedPersonId && r.alive) ?? null
      : null;

  const openPersonSheet = (personId: string) => {
    setConfirmingDivorce(false);
    setSelectedPersonId(personId);
  };

  const closePersonSheet = () => {
    setConfirmingDivorce(false);
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
      <div className="space-y-2 pt-1">
        <RuneDivider accent={accent} />
        <div className="flex items-center justify-between gap-2 px-0.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconTone}`}>
              {icon}
            </div>
            <h3 className="font-saga text-lg sm:text-xl font-bold text-[#F1F5F9] whitespace-normal break-words leading-snug">
              {title}
            </h3>
          </div>
          <span className="text-xs font-mono tabular-nums text-[#94A3B8] shrink-0">
            {count}
          </span>
        </div>
      </div>
    );
  };

  const renderCharacterCard = (p: RelationshipPerson, groupAccent: NorseAccent) => {
    const isEnemy = ENEMY_ROLES.has(p.role);
    const usedThisYear = Boolean(state.familyInteractionsUsed?.[p.id]);
    const pct = Math.max(0, Math.min(100, isEnemy ? 100 - p.affinity : p.affinity));
    const displayName = formatPersonName(p.name, lang);
    const epText = p.epithet
      ? isFa
        ? ` «${EPITHET_FA[p.epithet] ?? p.epithet}»`
        : ` "${p.epithet}"`
      : '';

    const cardSurface = isEnemy
      ? 'bg-gradient-to-br from-[#271016] via-[#181118] to-[#0F1722] border-[#DC2626]/60 hover:border-[#EF4444]'
      : groupAccent === 'amber'
        ? 'bg-gradient-to-br from-[#1E1913] via-[#131D2B] to-[#0F1722] border-[#F59E0B]/40 hover:border-[#F59E0B]'
        : groupAccent === 'emerald'
          ? 'bg-gradient-to-br from-[#10221E] via-[#131D2B] to-[#0F1722] border-[#34D399]/40 hover:border-[#34D399]'
          : 'bg-gradient-to-br from-[#102033] via-[#131D2B] to-[#0F1722] border-[#283B52] hover:border-[#38BDF8]';

    const barColorClass = isEnemy
      ? 'fill-[#EF4444]'
      : pct >= 70
        ? 'fill-[#34D399]'
        : pct >= 40
          ? 'fill-[#38BDF8]'
          : 'fill-[#F59E0B]';

    return (
      <div
        key={p.id}
        onClick={() => openPersonSheet(p.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPersonSheet(p.id);
          }
        }}
        className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer overflow-hidden space-y-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/70 ${cardSurface}`}
      >
        <NorseCornerOrnament accent={isEnemy ? 'crimson' : groupAccent} />

        {/* Portrait + Name + Relation/Age */}
        <div className="flex items-start gap-3">
          <VikingPortrait
            age={p.age}
            sex={p.sex}
            traits={p.traits}
            title={mapSocialClassToPortraitRank(p.socialClass)}
            seedId={p.id}
            size={54}
          />

          <div className="min-w-0 flex-1 space-y-1">
            <div className="text-sm sm:text-base font-bold text-[#F1F5F9] whitespace-normal break-words leading-snug">
              {displayName}
              {epText}
            </div>

            <div className="text-xs text-[#CBD5E1] whitespace-normal break-words leading-relaxed">
              <span>{ROLE_LABELS[lang][p.role]}</span>
              <span aria-hidden="true"> · </span>
              <span>{formatAgeLabel(p.age, lang)}</span>
              {p.isHeirEligible && (
                <>
                  <span aria-hidden="true"> · </span>
                  <span className="text-[#FBBF24] font-semibold">
                    {isFa ? 'وارث خاندان' : 'Eligible Heir'}
                  </span>
                </>
              )}
              {usedThisYear && !isEnemy && (
                <>
                  <span aria-hidden="true"> · </span>
                  <span className="text-[#34D399] font-medium">
                    {isFa ? 'دیدار شد ✓' : 'Visited ✓'}
                  </span>
                </>
              )}
            </div>

            {/* Loyalty / Hostility Bar */}
            <div className="pt-1 space-y-1">
              <div className="flex items-center justify-between gap-2 text-xs font-mono tabular-nums">
                <span className={isEnemy ? 'text-[#FCA5A5]' : 'text-[#94A3B8]'}>
                  {isEnemy
                    ? isFa
                      ? 'شدت خصومت'
                      : 'Hostility'
                    : isFa
                      ? 'وفاداری و صمیمیت'
                      : 'Loyalty & Bond'}
                </span>
                <span className="font-bold text-[#F1F5F9]">{pct}%</span>
              </div>
              <svg
                viewBox="0 0 100 6"
                preserveAspectRatio="none"
                className="h-2 w-full rounded-full overflow-hidden block"
                aria-hidden="true"
              >
                <rect x="0" y="0" width="100" height="6" className="fill-[#090E15]" />
                <rect
                  x={isFa ? 100 - pct : 0}
                  y="0"
                  width={pct}
                  height="6"
                  className={`transition-all duration-300 motion-reduce:transition-none ${barColorClass}`}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Visible Primary Action Row */}
        <div
          className="pt-2.5 border-t border-white/8 flex flex-wrap items-center justify-between gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {!isEnemy ? (
            <>
              <button
                type="button"
                disabled={usedThisYear}
                onClick={() => onMemberInteraction(p.id, 'talk')}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#18293E] hover:bg-[#213753] disabled:opacity-45 border border-[#2C4360] text-xs font-bold text-[#F1F5F9] inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#38BDF8] shrink-0" />
                <span>
                  {usedThisYear
                    ? isFa
                      ? 'تعامل انجام شد'
                      : 'Visited This Year'
                    : isFa
                      ? 'گپ صمیمی (+صمیمیت)'
                      : 'Talk (+Bond)'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => openPersonSheet(p.id)}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#0F1722] hover:bg-[#172436] border border-[#24364D] text-xs font-semibold text-[#CBD5E1] hover:text-[#F1F5F9] cursor-pointer transition-colors"
              >
                {isFa ? 'جزئیات و تعامل‌ها' : 'Details & Actions'}
              </button>
            </>
          ) : (
            <>
              {isAdult ? (
                <button
                  type="button"
                  onClick={() => onFamilyAction('holmgang_rival', p.id)}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#DC2626] hover:bg-[#EF4444] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Swords className="w-4 h-4 shrink-0" />
                  <span>{isFa ? 'دوئل هولم‌گانگ' : 'Holmgang Duel'}</span>
                </button>
              ) : (
                <span className="text-xs text-[#94A3B8]">
                  {isFa ? 'دوئل از سن ۱۷ سالگی' : 'Duels unlock at age 17'}
                </span>
              )}

              <button
                type="button"
                onClick={() => openPersonSheet(p.id)}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#1A1116] hover:bg-[#271820] border border-[#7F1D1D] text-xs font-semibold text-[#FECACA] cursor-pointer transition-colors"
              >
                {isFa ? 'خون‌بها / گزینه‌ها' : 'Wergild / Options'}
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Combine Dynasty Ancestors + Fallen Relationships for "Ancestors (in Valhalla)"
  type ValhallaItem =
    | { kind: 'ancestor'; data: FullGameState['ancestors'][number] }
    | { kind: 'fallen'; data: RelationshipPerson };

  const valhallaItems: ValhallaItem[] = [
    ...state.ancestors
      .slice()
      .reverse()
      .map((a) => ({ kind: 'ancestor' as const, data: a })),
    ...fallenRelationships.map((f) => ({ kind: 'fallen' as const, data: f })),
  ];

  const visibleValhalla = showAllValhalla ? valhallaItems : valhallaItems.slice(0, 4);

  return (
    <div className="space-y-4 text-start">
      {/* ================================================================= */}
      {/* 1. HOUSEHOLD (Spouse, Consorts, Children + Courting if unmarried) */}
      {/* ================================================================= */}
      <section className="space-y-3">
        {renderSectionHeader(
          isFa ? 'اهل خانه و خانواده نزدیک' : 'Household',
          householdList.length,
          <Home className="w-4 h-4" />,
          'amber'
        )}

        {/* Unmarried Courting Card (clean, positive primary action; zero loose divorce button!) */}
        {isAdult && !livingSpouse && (
          <div className="relative p-4 rounded-2xl bg-gradient-to-r from-[#241B11] via-[#131D2B] to-[#0F1722] border border-[#F59E0B]/45 flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-hidden">
            <NorseCornerOrnament accent="amber" />
            <div className="space-y-1 min-w-0">
              <div className="text-sm sm:text-base font-bold text-[#F1F5F9] whitespace-normal break-words">
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
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] disabled:bg-[#1E2D40] disabled:text-[#64748B] text-[#0B1118] text-xs font-extrabold inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer transition-colors"
            >
              <HeartHandshake className="w-4 h-4 shrink-0" />
              <span>{isFa ? 'خواستگاری و ازدواج (۱۵ نقره)' : 'Court & Marry (15 Silver)'}</span>
            </button>
          </div>
        )}

        {householdList.length === 0 ? (
          <div className="p-4 rounded-2xl bg-[#131D2B]/75 border border-[#1E2D40] text-xs text-[#94A3B8] leading-relaxed">
            {isFa
              ? 'هنوز همسر یا فرزندی در خانه ندارید.'
              : 'No spouse or children in your household yet.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {householdList.map((p) => renderCharacterCard(p, 'amber'))}
          </div>
        )}
      </section>

      {/* ================================================================= */}
      {/* 2. KIN (Parents, Siblings, Extended Blood Relatives)              */}
      {/* ================================================================= */}
      <section className="space-y-3">
        {renderSectionHeader(
          isFa ? 'خویشاوندان خونی' : 'Kin',
          kinList.length,
          <Users className="w-4 h-4" />,
          'ice'
        )}

        {kinList.length === 0 ? (
          <div className="p-4 rounded-2xl bg-[#131D2B]/75 border border-[#1E2D40] text-xs text-[#94A3B8] leading-relaxed">
            {isFa
              ? 'خویشاوند خونی زنده‌ای در کنار شما نیست.'
              : 'No living parents, siblings, or extended kin right now.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {kinList.map((p) => renderCharacterCard(p, 'ice'))}
          </div>
        )}
      </section>

      {/* ================================================================= */}
      {/* 3. ALLIES (Sworn Brothers & Sworn Sisters)                        */}
      {/* ================================================================= */}
      <section className="space-y-3">
        {renderSectionHeader(
          isFa ? 'متحدان و هم‌پیمانان خونی' : 'Allies',
          alliesList.length,
          <Shield className="w-4 h-4" />,
          'emerald'
        )}

        {alliesList.length === 0 ? (
          <div className="p-4 rounded-2xl bg-[#131D2B]/75 border border-[#1E2D40] text-xs text-[#94A3B8] leading-relaxed">
            {isFa
              ? 'هنوز خواهر یا برادر قسم‌خورده‌ای ندارید؛ در سفرها و نبردها هم‌پیمان خواهید یافت.'
              : 'No sworn shield-companions yet — blood-oaths forged during voyages and battles appear here.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alliesList.map((p) => renderCharacterCard(p, 'emerald'))}
          </div>
        )}
      </section>

      {/* ================================================================= */}
      {/* 4. ENEMIES / BLOOD FEUDS                                          */}
      {/* ================================================================= */}
      <section className="space-y-3">
        {renderSectionHeader(
          isFa ? 'دشمنان و کینه‌های خونی' : 'Enemies & Blood Feuds',
          enemiesList.length,
          <Swords className="w-4 h-4" />,
          'crimson'
        )}

        {enemiesList.length === 0 ? (
          <div className="p-4 rounded-2xl bg-[#131D2B]/75 border border-[#1E2D40] text-xs text-[#94A3B8] leading-relaxed">
            {isFa
              ? 'در حال حاضر هیچ دشمن خونی یا رقیب سرسختی در برابر خاندان شما نایستاده است.'
              : 'Your hall currently stands free of active rivals and blood feuds.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {enemiesList.map((p) => renderCharacterCard(p, 'crimson'))}
          </div>
        )}
      </section>

      {/* ================================================================= */}
      {/* 5. ANCESTORS (IN VALHALLA)                                        */}
      {/* ================================================================= */}
      <section className="space-y-3">
        {renderSectionHeader(
          isFa ? 'نیاکان (در والهالا)' : 'Ancestors (in Valhalla)',
          valhallaItems.length,
          <Skull className="w-4 h-4" />,
          'slate'
        )}

        {valhallaItems.length === 0 ? (
          <div className="p-4 rounded-2xl bg-[#131D2B]/75 border border-[#1E2D40] text-xs text-[#94A3B8] leading-relaxed">
            {isFa
              ? 'هنوز هیچ‌یک از نیاکان یا خویشاوندان به تالار والهالا نپیوسته‌اند.'
              : 'No departed rulers or fallen kin have entered Valhalla’s halls yet.'}
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {visibleValhalla.map((item) => {
                if (item.kind === 'ancestor') {
                  const anc = item.data;
                  return (
                    <div
                      key={`anc_${anc.id}`}
                      className="relative p-3.5 rounded-2xl bg-[#111926] border border-[#293B52] flex items-start gap-3 overflow-hidden"
                    >
                      <NorseCornerOrnament accent="amber" />
                      <div className="opacity-85 grayscale-[30%] shrink-0">
                        <VikingPortrait
                          age={anc.ageAtDeath}
                          sex={Sex.Male}
                          traits={[]}
                          title={anc.title}
                          seedId={anc.id}
                          size={48}
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-[#FBBF24] font-semibold">
                          <Crown className="w-3.5 h-3.5 shrink-0" />
                          <span className="whitespace-normal break-words">
                            {isFa
                              ? `فرمانروای نسل ${anc.generation} · ${SHORT_TITLE_LABELS.fa[anc.title]}`
                              : `Gen ${anc.generation} Ruler · ${SHORT_TITLE_LABELS.en[anc.title]}`}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-[#F1F5F9] whitespace-normal break-words leading-snug">
                          {formatPersonName(anc.fullName.replace(/"/g, ''), lang)}
                        </div>
                        <div className="text-xs text-[#94A3B8] whitespace-normal break-words leading-relaxed">
                          {isFa
                            ? `${anc.birthYear}–${anc.deathYear} م (${anc.ageAtDeath} سال) · ${
                                anc.causeOfDeathFa ?? anc.causeOfDeath
                              }`
                            : `${anc.birthYear}–${anc.deathYear} AD (Age ${anc.ageAtDeath}) · ${anc.causeOfDeath}`}
                        </div>
                      </div>
                    </div>
                  );
                }

                const d = item.data;
                return (
                  <div
                    key={`fallen_${d.id}`}
                    className="p-3.5 rounded-2xl bg-[#0E1520] border border-[#1E2D40] flex items-start gap-3"
                  >
                    <div className="opacity-75 grayscale-[45%] shrink-0">
                      <VikingPortrait
                        age={d.age}
                        sex={d.sex}
                        traits={d.traits}
                        title={mapSocialClassToPortraitRank(d.socialClass)}
                        seedId={d.id}
                        size={46}
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="text-sm font-bold text-[#CBD5E1] whitespace-normal break-words leading-snug">
                        {formatPersonName(d.name, lang)}
                      </div>
                      <div className="text-xs text-[#94A3B8] whitespace-normal break-words">
                        {isFa
                          ? `${ROLE_LABELS.fa[d.role]} مرحوم · ${formatAgeLabel(d.age, 'fa')}`
                          : `Late ${ROLE_LABELS.en[d.role]} · ${formatAgeLabel(d.age, 'en')}`}
                      </div>
                      <div className="text-xs text-[#94A3B8]/85 whitespace-normal break-words leading-relaxed">
                        {isFa
                          ? d.causeOfDeathFa ?? d.causeOfDeath ?? 'درگذشته'
                          : d.causeOfDeath ?? 'Passed away'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Secondary Accordion Toggle Only When > 4 Departed */}
            {valhallaItems.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllValhalla((v) => !v)}
                className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-[#131D2B] hover:bg-[#192638] border border-[#233246] text-xs font-semibold text-[#CBD5E1] inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
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
      {/* CHARACTER DETAIL & INTERACTIONS BOTTOM SHEET                      */}
      {/* (Includes safe Spouse Divorce flow + explicit confirmation)       */}
      {/* ================================================================= */}
      {selectedPerson && (() => {
        const p = selectedPerson;
        const isEnemy = ENEMY_ROLES.has(p.role);
        const isChildOrFoster = p.role === 'Child' || p.role === 'Foster-Child';
        const isSpouse = p.role === 'Spouse';
        const usedThisYear = Boolean(state.familyInteractionsUsed?.[p.id]);
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
        const pTraits = p.traits
          .map((t) =>
            isFa
              ? TRAITS_FA[t]?.name ?? ALL_TRAITS_MAP[t]?.name ?? t
              : ALL_TRAITS_MAP[t]?.name ?? t
          )
          .join(' · ');

        return (
          <NorseBottomSheet
            isOpen={true}
            onClose={closePersonSheet}
            accent={isEnemy ? 'crimson' : isSpouse ? 'amber' : 'ice'}
            closeLabel={isFa ? 'بستن' : 'Close'}
            title={`${pName}${pEp}`}
            subtitle={`${ROLE_LABELS[lang][p.role]} · ${formatAgeLabel(p.age, lang)} · ${CLASS_SHORT_LABELS_I18N[lang][p.socialClass]} · ${pLocName}`}
            icon={
              <VikingPortrait
                age={p.age}
                sex={p.sex}
                traits={p.traits}
                title={mapSocialClassToPortraitRank(p.socialClass)}
                seedId={p.id}
                size={62}
              />
            }
          >
            {/* Relationship / Loyalty Meter + Traits */}
            <div className="p-3.5 rounded-2xl bg-[#131D2B] border border-[#233246] space-y-2.5">
              <div className="flex items-center justify-between gap-2 text-xs font-mono tabular-nums">
                <span className="text-[#CBD5E1]">
                  {isEnemy
                    ? isFa
                      ? 'شدت کینه و خصومت'
                      : 'Feud Hostility'
                    : isFa
                      ? 'وفاداری و صمیمیت'
                      : 'Loyalty & Relationship'}
                </span>
                <span className={isEnemy ? 'text-[#F87171] font-bold' : 'text-[#38BDF8] font-bold'}>
                  {pct}%
                </span>
              </div>
              <svg
                viewBox="0 0 100 6"
                preserveAspectRatio="none"
                className="h-2.5 w-full rounded-full overflow-hidden block"
                aria-hidden="true"
              >
                <rect x="0" y="0" width="100" height="6" className="fill-[#090E15]" />
                <rect
                  x={isFa ? 100 - pct : 0}
                  y="0"
                  width={pct}
                  height="6"
                  className={isEnemy ? 'fill-[#EF4444]' : 'fill-[#38BDF8]'}
                />
              </svg>

              {pTraits && (
                <div className="pt-1.5 border-t border-[#1E2D40] text-xs text-[#CBD5E1] whitespace-normal break-words leading-relaxed">
                  <span className="text-[#38BDF8] font-semibold">
                    {isFa ? 'ویژگی‌ها: ' : 'Traits: '}
                  </span>
                  {pTraits}
                </div>
              )}
            </div>

            {/* Interactions */}
            {!isEnemy ? (
              <div className="space-y-2.5">
                <div className="text-xs font-semibold text-[#94A3B8]">
                  {usedThisYear
                    ? isFa
                      ? 'امسال با این عضو خانواده تعامل داشته‌اید (سال بعد دوباره باز می‌شود).'
                      : 'You already interacted with them this year (resets next year).'
                    : isFa
                      ? 'انتخاب تعامل سالانه:'
                      : 'Yearly Interactions:'}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled={usedThisYear}
                    onClick={() => {
                      onMemberInteraction(p.id, 'talk');
                      closePersonSheet();
                    }}
                    className="min-h-[48px] px-4 py-2.5 rounded-xl bg-[#162436] hover:bg-[#1E314A] disabled:opacity-45 border border-[#2A3F5B] text-xs font-bold text-[#F1F5F9] inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-[#38BDF8] shrink-0" />
                    <span>{isFa ? 'گپ زدن و هم‌نشینی (+صمیمیت)' : 'Heart-to-Heart Talk (+Bond)'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={usedThisYear || state.realm.silver < 5}
                    onClick={() => {
                      onMemberInteraction(p.id, 'gift');
                      closePersonSheet();
                    }}
                    className="min-h-[48px] px-4 py-2.5 rounded-xl bg-[#1F1A12] hover:bg-[#2B2317] disabled:opacity-45 border border-[#F59E0B]/45 text-xs font-bold text-[#FDE68A] inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Gift className="w-4 h-4 text-[#FBBF24] shrink-0" />
                    <span>{isFa ? 'اهدا هدیه نقره (۵ نقره)' : 'Give Silver Gift (5 Silver)'}</span>
                  </button>

                  {isChildOrFoster && p.age >= 5 && (
                    <button
                      type="button"
                      disabled={usedThisYear}
                      onClick={() => {
                        onMemberInteraction(p.id, 'teach');
                        closePersonSheet();
                      }}
                      className="min-h-[48px] px-4 py-2.5 rounded-xl bg-[#112420] hover:bg-[#16302B] disabled:opacity-45 border border-[#34D399]/50 text-xs font-bold text-[#6EE7B7] inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <GraduationCap className="w-4 h-4 text-[#34D399] shrink-0" />
                      <span>{isFa ? 'آموزش مهارت و رسم زندگی' : 'Teach Norse Skills'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={usedThisYear}
                    onClick={() => {
                      onMemberInteraction(p.id, 'argue');
                      closePersonSheet();
                    }}
                    className="min-h-[48px] px-4 py-2.5 rounded-xl bg-[#1A1216] hover:bg-[#271820] disabled:opacity-45 border border-[#7F1D1D]/60 text-xs font-semibold text-[#FCA5A5] inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Flame className="w-4 h-4 text-[#EF4444] shrink-0" />
                    <span>{isFa ? 'بحث و مشاجره' : 'Confront / Argue'}</span>
                  </button>
                </div>

                {/* SPOUSE RISKY ACTION: DIVORCE WITH EXPLICIT CONFIRMATION DIALOG */}
                {isSpouse && isAdult && (
                  <div className="pt-3 space-y-3">
                    <RuneDivider
                      label={isFa ? 'فسخ پیوند زناشویی' : 'Marital Dissolution'}
                      accent="crimson"
                    />

                    {!confirmingDivorce ? (
                      <button
                        type="button"
                        onClick={() => setConfirmingDivorce(true)}
                        className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-[#151118] hover:bg-[#22141B] border border-[#581C26] text-xs font-semibold text-[#CBD5E1] hover:text-[#FCA5A5] cursor-pointer transition-colors"
                      >
                        {isFa ? 'درخواست طلاق طبق قانون نورس…' : 'Declare Divorce Under Norse Law…'}
                      </button>
                    ) : (
                      <div
                        role="alertdialog"
                        aria-label={isFa ? 'تأیید طلاق' : 'Confirm Divorce'}
                        className="p-4 rounded-2xl bg-[#241016] border border-[#EF4444] space-y-3"
                      >
                        <div className="flex items-start gap-2.5">
                          <AlertTriangle className="w-5 h-5 text-[#F87171] shrink-0 mt-0.5" />
                          <div className="space-y-1 min-w-0">
                            <div className="text-sm font-bold text-[#FFE4E6] whitespace-normal break-words">
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
                            className="min-h-[44px] px-3 py-2 rounded-xl bg-[#131D2B] hover:bg-[#1C2A3E] border border-[#2C415C] text-xs font-bold text-[#F1F5F9] cursor-pointer transition-colors"
                          >
                            {isFa ? 'انصراف' : 'Cancel'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onFamilyAction('divorce_spouse');
                              closePersonSheet();
                            }}
                            className="min-h-[44px] px-3 py-2 rounded-xl bg-[#DC2626] hover:bg-[#EF4444] text-xs font-extrabold text-white cursor-pointer transition-colors"
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
              /* Enemy / Blood Feud Options */
              <div className="space-y-2.5">
                {!isAdult ? (
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    {isFa
                      ? 'پس از رسیدن به ۱۷ سالگی می‌توانید این کینه را با دوئل هولم‌گانگ یا خون‌بها یکسره کنید.'
                      : 'Reach age 17 to settle this feud by Holmgang duel, Wergild silver, or peace marriage.'}
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        onFamilyAction('holmgang_rival', p.id);
                        closePersonSheet();
                      }}
                      className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#EF4444] text-white text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Swords className="w-4 h-4 shrink-0" />
                      <span>
                        {isFa
                          ? 'فراخوان به دوئل تن‌به‌تن (هولم‌گانگ)'
                          : 'Challenge to Holmgang Duel'}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={state.realm.silver < 30}
                      onClick={() => {
                        onFamilyAction('pay_wergild', p.id);
                        closePersonSheet();
                      }}
                      className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-[#131D2B] hover:bg-[#1B293D] disabled:opacity-45 border border-[#F59E0B]/50 text-[#FDE68A] text-xs font-bold cursor-pointer transition-colors"
                    >
                      {isFa
                        ? 'پرداخت خون‌بهای ورگیلد برای صلح (۳۰ نقره)'
                        : 'Pay Wergild Blood-Price for Peace (30 Silver)'}
                    </button>

                    {!livingSpouse && (
                      <button
                        type="button"
                        onClick={() => {
                          onMemberInteraction(p.id, 'peace_marry');
                          closePersonSheet();
                        }}
                        className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-[#132235] hover:bg-[#1A2F49] border border-[#38BDF8]/60 text-[#7DD3FC] text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <HeartHandshake className="w-4 h-4 shrink-0" />
                        <span>
                          {isFa
                            ? 'پیشنهاد وصلتِ صلح و پایان دشمنی'
                            : 'Propose Peace-Weaving Marriage'}
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
    </div>
  );
}
