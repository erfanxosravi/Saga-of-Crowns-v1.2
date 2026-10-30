import { LOTHBROK_CHAPTER_METADATA, SAGA_HEIRLOOMS_MAP } from '../data/lothbrokCycle';
import { EVENTS_FA } from '../i18n/eventsFa';
import { SETTLEMENTS_FA } from '../i18n/gameDataFa';
import {
  CATEGORY_LABELS,
  formatAgeLabel,
  formatYearLabel,
  isRtl,
  SHORT_TITLE_LABELS,
  SKILL_LABELS,
  STAT_LABELS,
} from '../i18n/ui';
import { ContentIntensity, EventChoice, FullGameState, GameEvent, Language } from '../types/game';
import { useModalA11y } from '../utils/useModalA11y';
import { EventCategoryIcon } from './EventCategoryIcon';

interface DecisionModalProps {
  event: GameEvent;
  state: FullGameState;
  onSelectChoice: (choiceId: string) => void;
}

interface ConsequenceTag {
  text: string;
  tone: 'danger' | 'cost' | 'reward' | 'neutral';
}

function getChoiceConsequences(
  ch: EventChoice,
  state: FullGameState,
  lang: Language
): ConsequenceTag[] {
  const tags: ConsequenceTag[] = [];
  const isFa = lang === 'fa';
  const eff = ch.effects;

  // 1. Silver Cost (either requiredSilver or negative effects.silver)
  const silverCost =
    ch.requiredSilver !== undefined
      ? ch.requiredSilver
      : eff?.silver !== undefined && eff.silver < 0
        ? Math.abs(eff.silver)
        : 0;

  if (silverCost > 0) {
    const lacks = ch.requiredSilver !== undefined && state.realm.silver < ch.requiredSilver;
    tags.push({
      text: lacks
        ? isFa
          ? `نیاز به ${silverCost} نقره`
          : `Needs ${silverCost} silver`
        : isFa
          ? `هزینه: ${silverCost} نقره`
          : `Costs ${silverCost} silver`,
      tone: lacks ? 'danger' : 'cost',
    });
  } else if (eff?.silver && eff.silver > 0) {
    tags.push({
      text: isFa ? `+${eff.silver} نقره` : `+${eff.silver} silver`,
      tone: 'reward',
    });
  }

  // 2. Risk & Injury Preview
  const deathRisk = ch.deathChance ?? 0;
  const injuryRisk = ch.injuryChance ?? 0;
  if (deathRisk >= 0.12) {
    tags.push({
      text: isFa ? 'خطر مرگ بالا' : 'High risk',
      tone: 'danger',
    });
  } else if (deathRisk > 0) {
    tags.push({
      text: isFa ? 'ریسک جانی' : 'Mortal risk',
      tone: 'danger',
    });
  } else if (injuryRisk >= 0.15) {
    tags.push({
      text: isFa ? 'احتمال زخم' : 'Injury risk',
      tone: 'cost',
    });
  }

  // 3. Skill / Stat Gate
  if (ch.requiredSkill) {
    const skName = SKILL_LABELS[lang][ch.requiredSkill.skill];
    const lacks = state.character.skills[ch.requiredSkill.skill] < ch.requiredSkill.min;
    tags.push({
      text: isFa ? `${skName} ${ch.requiredSkill.min}+` : `${skName} ${ch.requiredSkill.min}+`,
      tone: lacks ? 'danger' : 'neutral',
    });
  }
  if (ch.requiredStat) {
    const stName = STAT_LABELS[lang][ch.requiredStat.stat];
    const lacks = state.character.stats[ch.requiredStat.stat] < ch.requiredStat.min;
    tags.push({
      text: isFa ? `${stName} ${ch.requiredStat.min}+` : `${stName} ${ch.requiredStat.min}+`,
      tone: lacks ? 'danger' : 'neutral',
    });
  }

  // 4. Key Outcomes (Feud, Marriage, Rank, Ships, Land, Fame, Hefnd, Heirlooms)
  if (eff) {
    if (eff.addHeirloomIds && eff.addHeirloomIds.length > 0) {
      const firstH = SAGA_HEIRLOOMS_MAP[eff.addHeirloomIds[0]];
      if (firstH) {
        tags.push({
          text: isFa ? `میراث: ${firstH.nameFa}` : `Heirloom: ${firstH.nameEn}`,
          tone: 'reward',
        });
      }
    }
    if (eff.hefndDelta !== undefined && eff.hefndDelta !== 0) {
      tags.push({
        text:
          eff.hefndDelta < 0
            ? isFa
              ? `انتقام هفند ${eff.hefndDelta}`
              : `Hefnd Satisfied ${eff.hefndDelta}`
            : isFa
              ? `بدهی انتقام +${eff.hefndDelta}`
              : `Hefnd Debt +${eff.hefndDelta}`,
        tone: eff.hefndDelta < 0 ? 'reward' : 'cost',
      });
    }
    if (eff.spawnRival) {
      tags.push({
        text: isFa ? 'دشمنی خونی!' : 'Starts feud',
        tone: 'danger',
      });
    }
    if (eff.marryRivalPeace) {
      tags.push({
        text: isFa ? 'ازدواج صلح با دشمن' : 'Marry blood enemy',
        tone: 'reward',
      });
    } else if (eff.marryRandom) {
      tags.push({
        text: isFa ? 'ازدواج' : 'Marriage',
        tone: 'reward',
      });
    }
    if (eff.newTitle) {
      tags.push({
        text: isFa
          ? `مقام: ${SHORT_TITLE_LABELS.fa[eff.newTitle]}`
          : `Rank: ${SHORT_TITLE_LABELS.en[eff.newTitle]}`,
        tone: 'reward',
      });
    }
    if (eff.landFarms && eff.landFarms > 0) {
      tags.push({
        text: isFa ? `+${eff.landFarms} مزرعه` : `+${eff.landFarms} farm`,
        tone: 'reward',
      });
    }
    if (eff.longships && eff.longships > 0) {
      tags.push({
        text: isFa ? `+${eff.longships} کشتی جنگی` : `+${eff.longships} warship`,
        tone: 'reward',
      });
    }
    if (eff.hirdWarriors && eff.hirdWarriors > 0) {
      tags.push({
        text: isFa ? `+${eff.hirdWarriors} جنگجو` : `+${eff.hirdWarriors} warriors`,
        tone: 'reward',
      });
    }
    if (eff.moveToSettlementId) {
      const destFa = SETTLEMENTS_FA[eff.moveToSettlementId]?.name;
      tags.push({
        text: isFa && destFa ? `سفر به ${destFa}` : 'Sea voyage',
        tone: 'neutral',
      });
    }
  }

  return tags.slice(0, 3);
}

export function DecisionModal({ event, state, onSelectChoice }: DecisionModalProps) {
  const lang = state.settings.language;
  const isFa = lang === 'fa';
  const rtl = isRtl(lang);
  const isMild = state.settings.contentIntensity === ContentIntensity.Mild;

  const firstUnlockedChoice = event.choices.find((ch) => {
    const lacksSilver =
      ch.requiredSilver !== undefined && state.realm.silver < ch.requiredSilver;
    const lacksSkill =
      ch.requiredSkill !== undefined &&
      state.character.skills[ch.requiredSkill.skill] < ch.requiredSkill.min;
    const lacksStat =
      ch.requiredStat !== undefined &&
      state.character.stats[ch.requiredStat.stat] < ch.requiredStat.min;
    return !lacksSilver && !lacksSkill && !lacksStat;
  });

  const modalRef = useModalA11y<HTMLDivElement>({
    isOpen: true,
    onClose: firstUnlockedChoice ? () => onSelectChoice(firstUnlockedChoice.id) : undefined,
  });

  const evFa = EVENTS_FA[event.id];
  const displayTitle = isFa ? evFa?.title ?? event.title : event.title;
  const narrativeText = isFa
    ? (isMild && evFa?.mildText ? evFa.mildText : evFa?.text) ?? event.text
    : isMild && event.mildText
      ? event.mildText
      : event.text;

  const lothbrokMeta = LOTHBROK_CHAPTER_METADATA.find((m) => m.eventId === event.id);
  const sagaVsChronicleText = isFa
    ? lothbrokMeta?.sagaVsChronicleFa ?? event.sagaVsChronicleNote
    : lothbrokMeta?.sagaVsChronicleEn ?? event.sagaVsChronicleNote;

  const categoryText = CATEGORY_LABELS[lang][event.category];
  const ageText = formatAgeLabel(state.character.age, lang);
  const yearText = formatYearLabel(state.year, lang);

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 max-h-dvh overflow-hidden flex flex-col items-center justify-center bg-surface-backdrop backdrop-blur-xs p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="decision-modal-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-xl max-h-[min(90dvh,720px)] flex flex-col overflow-hidden bg-surface-elevated border border-border-subtle rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.88)]"
      >
        <div className="shrink-0 px-4 sm:px-6 pt-4 sm:pt-5 pb-3.5 text-center space-y-1.5 border-b border-border-subtle bg-surface-secondary/85">
          <div className="inline-flex items-center justify-center gap-1.5 text-xs text-accent-ice font-medium">
            <EventCategoryIcon
              category={event.category}
              iconType={event.iconType}
              className="w-4 h-4"
            />
            <span>
              {ageText} · {yearText} · {categoryText}
            </span>
            {lothbrokMeta && (
              <span className="px-2 py-0.5 rounded-md bg-surface-crimson-tint border border-gold-500/50 text-accent-amber-strong text-[10px] font-bold">
                {isFa
                  ? `فصل ${lothbrokMeta.roman} چرخه لُدبروک`
                  : `Lothbrok Cycle · Chapter ${lothbrokMeta.roman}`}
              </span>
            )}
          </div>
          <h2
            id="decision-modal-title"
            className="font-saga text-xl sm:text-2xl font-bold text-ink-primary leading-snug"
          >
            {displayTitle}
          </h2>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4">
          <p className="font-saga text-base sm:text-lg leading-relaxed text-ink-secondary text-center">
            {narrativeText}
          </p>

          {sagaVsChronicleText && (
            <div className="p-3 rounded-xl bg-surface-secondary border border-gold-500/40 text-start space-y-1">
              <div className="text-[11px] font-bold text-accent-amber flex items-center justify-between gap-2">
                <span>
                  {isFa
                    ? '📜 روایت حماسه در برابر سالنامه‌های تاریخی'
                    : '📜 SAGA SAYS vs. CHRONICLE SAYS'}
                </span>
                {event.isSemiLegendary && (
                  <span className="px-1.5 py-0.5 rounded bg-gold-500/15 text-accent-amber-strong text-[10px]">
                    {isFa ? 'مرز اسطوره و تاریخ' : 'Myth & Record'}
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-secondary leading-relaxed">{sagaVsChronicleText}</p>
            </div>
          )}

          <div className="space-y-2.5 pt-1">
            {event.choices.map((ch) => {
              const lacksSilver =
                ch.requiredSilver !== undefined && state.realm.silver < ch.requiredSilver;
              const lacksSkill =
                ch.requiredSkill !== undefined &&
                state.character.skills[ch.requiredSkill.skill] < ch.requiredSkill.min;
              const lacksStat =
                ch.requiredStat !== undefined &&
                state.character.stats[ch.requiredStat.stat] < ch.requiredStat.min;
              const isLocked = lacksSilver || lacksSkill || lacksStat;

              const chFa = evFa?.choices[ch.id];
              const label = isFa
                ? (isMild && chFa?.mildLabel ? chFa.mildLabel : chFa?.label) ?? ch.label
                : isMild && ch.mildLabel
                  ? ch.mildLabel
                  : ch.label;

              const consequences = getChoiceConsequences(ch, state, lang);

              return (
                <button
                  key={ch.id}
                  type="button"
                  disabled={isLocked}
                  onClick={() => onSelectChoice(ch.id)}
                  className={`w-full min-h-[56px] px-4 py-3 rounded-xl border text-center transition-all ${
                    isLocked
                      ? 'bg-surface-canvas border-border-subtle text-ink-muted cursor-not-allowed'
                      : 'bg-surface-secondary border-border-strong hover:border-gold-500 hover:bg-surface-interactive text-ink-primary cursor-pointer active:scale-[0.99]'
                  }`}
                >
                  <div className="text-sm sm:text-[15px] font-semibold leading-snug">{label}</div>

                  {consequences.length > 0 && (
                    <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-xs font-mono tabular-nums">
                      {consequences.map((tag, idx) => {
                        const color =
                          tag.tone === 'danger'
                            ? 'text-accent-crimson font-semibold'
                            : tag.tone === 'cost'
                              ? 'text-accent-amber'
                              : tag.tone === 'reward'
                                ? 'text-accent-emerald'
                                : 'text-accent-ice';
                        return (
                          <span key={idx} className={color}>
                            {idx > 0 && <span className="text-ink-muted me-2">·</span>}
                            {tag.text}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
