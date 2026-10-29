import { useLayoutEffect, useRef } from 'react';
import {
  Coins,
  Crown,
  Flame,
  Heart,
  Scale,
  Shield,
  Ship,
  Smile,
  Sparkles,
  Swords,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { CATEGORY_LABELS, formatAgeLabel, formatYearLabel } from '../i18n/ui';
import { Language, LogEntry } from '../types/game';
import { EventCategoryIcon } from './EventCategoryIcon';

interface LifeFeedProps {
  entries: LogEntry[];
  lang: Language;
  isActive?: boolean;
  onboardingStep?: number;
  onboardingDismissed?: boolean;
  onDismissOnboarding?: () => void;
}

type DeltaTone = 'pos' | 'neg' | 'neutral';

function classifyDeltaTone(deltaText: string): DeltaTone {
  const trimmed = deltaText.trim();
  if (
    /(?:^|\s)-\d/.test(trimmed) ||
    trimmed.startsWith('-') ||
    trimmed.startsWith('Scar:') ||
    trimmed.startsWith('جراحت:') ||
    trimmed.includes('Outlaw') ||
    trimmed.includes('طرد') ||
    trimmed.includes('Gale') ||
    trimmed.includes('Storm') ||
    trimmed.includes('کولاک') ||
    trimmed.includes('طوفان')
  ) {
    return 'neg';
  }
  if (
    trimmed.includes('+') ||
    trimmed.includes('Cleared') ||
    trimmed.includes('رفع') ||
    trimmed.includes('Rank:') ||
    trimmed.includes('مقام') ||
    trimmed.includes('Married') ||
    trimmed.includes('ازدواج') ||
    trimmed.includes('Child') ||
    trimmed.includes('فرزند')
  ) {
    return 'pos';
  }
  return 'neutral';
}

function renderDeltaChipIcon(deltaText: string, tone: DeltaTone) {
  const lower = deltaText.toLowerCase();

  if (
    lower.includes('silver') ||
    lower.includes('loot') ||
    lower.includes('wealth') ||
    deltaText.includes('نقره') ||
    deltaText.includes('سکه') ||
    deltaText.includes('غنائم')
  ) {
    return <Coins className="w-3 h-3 shrink-0" />;
  }

  if (
    lower.includes('health') ||
    lower.includes('scar') ||
    lower.includes('wound') ||
    deltaText.includes('سلامتی') ||
    deltaText.includes('جراحت') ||
    deltaText.includes('زخم')
  ) {
    return <Heart className="w-3 h-3 shrink-0" />;
  }

  if (
    lower.includes('honor') ||
    lower.includes('fame') ||
    lower.includes('renown') ||
    deltaText.includes('شرافت') ||
    deltaText.includes('آبرو') ||
    deltaText.includes('شهرت')
  ) {
    return <Shield className="w-3 h-3 shrink-0" />;
  }

  if (
    lower.includes('strength') ||
    lower.includes('power') ||
    lower.includes('combat') ||
    lower.includes('warrior') ||
    lower.includes('hird') ||
    deltaText.includes('قدرت') ||
    deltaText.includes('رزم') ||
    deltaText.includes('شمشیر') ||
    deltaText.includes('جنگجو')
  ) {
    return <Swords className="w-3 h-3 shrink-0" />;
  }

  if (
    lower.includes('joy') ||
    lower.includes('happiness') ||
    deltaText.includes('شادی') ||
    deltaText.includes('روحیه')
  ) {
    return <Smile className="w-3 h-3 shrink-0" />;
  }

  if (
    lower.includes('law') ||
    lower.includes('diplomacy') ||
    lower.includes('cunning') ||
    deltaText.includes('قانون') ||
    deltaText.includes('سیاست') ||
    deltaText.includes('مذاکره') ||
    deltaText.includes('ذکاوت')
  ) {
    return <Scale className="w-3 h-3 shrink-0" />;
  }

  if (
    lower.includes('sail') ||
    lower.includes('ship') ||
    lower.includes('knarr') ||
    deltaText.includes('دریانوردی') ||
    deltaText.includes('کشتی') ||
    deltaText.includes('ناوگان')
  ) {
    return <Ship className="w-3 h-3 shrink-0" />;
  }

  if (
    lower.includes('faith') ||
    lower.includes('wyrd') ||
    lower.includes('mystic') ||
    deltaText.includes('ایمان') ||
    deltaText.includes('تقدیر') ||
    deltaText.includes('ویرد') ||
    deltaText.includes('جادو')
  ) {
    return <Flame className="w-3 h-3 shrink-0" />;
  }

  if (
    lower.includes('rank') ||
    lower.includes('married') ||
    lower.includes('child') ||
    deltaText.includes('مقام') ||
    deltaText.includes('ازدواج') ||
    deltaText.includes('فرزند')
  ) {
    return <Crown className="w-3 h-3 shrink-0" />;
  }

  if (tone === 'pos') return <TrendingUp className="w-3 h-3 shrink-0" />;
  if (tone === 'neg') return <TrendingDown className="w-3 h-3 shrink-0" />;
  return <Sparkles className="w-3 h-3 shrink-0" />;
}

const ONBOARDING_HINTS: Record<Language, { title: string; body: string }[]> = {
  en: [
    {
      title: 'Year 1 Tip · Just Tap "Next Year"',
      body: 'Live one year at a time! Each year brings a quick event with risk and cost hints right on the choices.',
    },
    {
      title: 'Year 2 Tip · Quick Yearly Activities',
      body: 'Want extra silver, combat training, or a raid? Open "Activities" below — each button works once per year.',
    },
    {
      title: 'Year 3 Tip · Heirs Keep Your Saga Alive',
      body: 'Watch your 4 stat bars below. Marry in "Kin" so when you die, you continue as your child in one click!',
    },
  ],
  fa: [
    {
      title: 'نکته سال اول · فقط دکمه «سال بعد» رو بزن!',
      body: 'زندگی سال‌به‌سال جلو می‌ره! هر سال یه اتفاق سریع برات میفته و ریسک و هزینه هر انتخاب رو همون‌جا می‌بینی.',
    },
    {
      title: 'نکته سال دوم · فعالیت‌های سبک سالانه',
      body: 'هوس پول بیشتر، تمرین شمشیرزنی یا غارت کردی؟ از پایین برو تو «فعالیت‌ها»؛ هر کدوم سالی یک‌بار قابل استفاده‌ست.',
    },
    {
      title: 'نکته سال سوم · با وارثت ادامه بده!',
      body: 'حواست به ۴ نوار پایین باشه. تو تب «خاندان» ازدواج کن تا بعد از مرگ، فقط با یک کلیک جای بچه‌ت بازی رو ادامه بدی!',
    },
  ],
};

export function LifeFeed({
  entries,
  lang,
  isActive = true,
  onboardingStep = 3,
  onboardingDismissed = true,
  onDismissOnboarding,
}: LifeFeedProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const hasMountedRef = useRef<boolean>(false);
  const prevIsActiveRef = useRef<boolean>(isActive);
  const lastSeenActiveEntryKeyRef = useRef<string>('');
  const prevEntryKeyRef = useRef<string>('');
  const isFa = lang === 'fa';

  const latestEntry = entries.length > 0 ? entries[entries.length - 1] : null;
  const currentEntryKey = latestEntry ? `${entries.length}:${latestEntry.id}` : 'empty';

  useLayoutEffect(() => {
    const scrollParent = rootRef.current?.parentElement ?? null;

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      prevIsActiveRef.current = isActive;
      prevEntryKeyRef.current = currentEntryKey;
      if (isActive) {
        lastSeenActiveEntryKeyRef.current = currentEntryKey;
        if (scrollParent) {
          scrollParent.scrollTop = scrollParent.scrollHeight;
        }
      }
      return;
    }

    const becameActive = !prevIsActiveRef.current && isActive;
    const entryChanged = currentEntryKey !== prevEntryKeyRef.current;

    if (becameActive) {
      if (currentEntryKey !== lastSeenActiveEntryKeyRef.current && scrollParent) {
        scrollParent.scrollTop = scrollParent.scrollHeight;
      }
      lastSeenActiveEntryKeyRef.current = currentEntryKey;
    } else if (isActive && entryChanged) {
      if (scrollParent) {
        const distanceFromBottom =
          scrollParent.scrollHeight - scrollParent.scrollTop - scrollParent.clientHeight;
        if (distanceFromBottom > 380) {
          scrollParent.scrollTop = Math.max(
            0,
            scrollParent.scrollHeight - scrollParent.clientHeight - 160
          );
        }
      }
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      lastSeenActiveEntryKeyRef.current = currentEntryKey;
    }

    prevIsActiveRef.current = isActive;
    prevEntryKeyRef.current = currentEntryKey;
  }, [isActive, currentEntryKey]);

  const showOnboarding = !onboardingDismissed && onboardingStep < 3;
  const activeHint = ONBOARDING_HINTS[lang][Math.max(0, Math.min(2, onboardingStep))];

  // Group consecutive entries by (age, year) for a clean, organized BitLife-style feed
  const ageGroups: { age: number; year: number; items: { entry: LogEntry; index: number }[] }[] = [];
  entries.forEach((entry, index) => {
    const lastGroup = ageGroups[ageGroups.length - 1];
    if (lastGroup && lastGroup.age === entry.age && lastGroup.year === entry.year) {
      lastGroup.items.push({ entry, index });
    } else {
      ageGroups.push({
        age: entry.age,
        year: entry.year,
        items: [{ entry, index }],
      });
    }
  });

  return (
    <div ref={rootRef} className="flex flex-col overflow-hidden pb-1 text-start">
      {showOnboarding && activeHint && (
        <div className="mb-2.5 px-3 py-2 rounded-lg bg-[#132134] border border-[#38BDF8]/35 flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#38BDF8] leading-snug">
                {activeHint.title}
              </div>
              <p className="text-[11px] sm:text-xs text-[#E2E8F0] leading-relaxed mt-0.5">
                {activeHint.body}
              </p>
            </div>
          </div>
          {onDismissOnboarding && (
            <button
              type="button"
              onClick={onDismissOnboarding}
              className="px-2 py-1 rounded-md bg-[#0B1118]/90 hover:bg-[#0B1118] border border-[#24354C] text-[11px] font-semibold text-[#CBD5E1] hover:text-[#F8FAFC] inline-flex items-center gap-1 shrink-0 cursor-pointer whitespace-nowrap transition-colors"
            >
              <X className="w-3 h-3" />
              <span>{isFa ? 'رد کردن' : 'Skip'}</span>
            </button>
          )}
        </div>
      )}

      {/* Organized BitLife-Style Linear Feed with Uniform Coloring */}
      <div className="rounded-xl border border-[#1E2D40] bg-[#101926] overflow-hidden">
        {ageGroups.map((group, groupIdx) => (
          <section
            key={`age_group_${group.age}_${group.year}_${groupIdx}`}
            className={groupIdx > 0 ? 'border-t border-[#1E2D40]' : ''}
          >
            {/* Slim Age & Year Header Bar */}
            <div className="px-3 py-1.5 bg-[#131D2B] border-b border-[#1E2D40] flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-mono tabular-nums">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shrink-0" />
                <span className="text-xs font-extrabold text-[#F59E0B]">
                  {formatAgeLabel(group.age, lang)}
                </span>
                <span className="text-[#64748B]" aria-hidden="true">
                  ·
                </span>
                <span className="text-[11px] font-semibold text-[#94A3B8]">
                  {formatYearLabel(group.year, lang)}
                </span>
              </div>

              {group.items.length > 1 && (
                <span className="text-[10px] font-semibold text-[#94A3B8] font-mono tabular-nums">
                  {isFa ? `${group.items.length} رخداد` : `${group.items.length} events`}
                </span>
              )}
            </div>

            {/* Uniform Entries List for this Age */}
            <div>
              {group.items.map(({ entry, index }, itemIdx) => {
                const isInteractiveEvent = entry.id.startsWith('log_ev_');
                const displayTitle = isFa ? entry.titleFa ?? entry.title : entry.title;
                const displayText = isFa ? entry.textFa ?? entry.text : entry.text;
                const categoryLabel = CATEGORY_LABELS[lang][entry.category];

                // Only show detailed stat/skill deltas on actual events that happen (log_ev_)
                const eventDeltas = isInteractiveEvent
                  ? ((isFa ? entry.deltasFa ?? entry.deltas : entry.deltas)?.filter(Boolean) ?? [])
                  : [];

                return (
                  <article
                    key={`${entry.id}_${index}`}
                    className={`px-3 py-2.5 bg-[#101926] flex items-start gap-2.5 ${
                      itemIdx > 0 ? 'border-t border-[#1E2D40]' : ''
                    }`}
                  >
                    {/* Structured Category Icon Badge */}
                    <div
                      className={`w-6 h-6 rounded-md bg-[#131D2B] border border-[#233246] flex items-center justify-center shrink-0 mt-0.5 ${
                        entry.isDanger ? 'text-rose-500' : 'text-[#F59E0B]'
                      }`}
                    >
                      <EventCategoryIcon
                        category={entry.category}
                        iconType={entry.iconType}
                        isDanger={entry.isDanger}
                        inheritColor
                        className="w-3.5 h-3.5"
                      />
                    </div>

                    {/* Main Event Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        {displayTitle ? (
                          <h3 className="text-xs sm:text-[13px] font-bold text-[#F1F5F9] leading-snug whitespace-normal break-words">
                            {displayTitle}
                          </h3>
                        ) : (
                          <span className="text-xs font-bold text-[#F1F5F9] leading-snug">
                            {categoryLabel}
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#131D2B] border border-[#1E2D40] text-[10px] font-semibold text-[#94A3B8] shrink-0">
                          {entry.isDivergence ? (
                            <>
                              <Sparkles className="w-2.5 h-2.5 text-purple-400 shrink-0" />
                              <span className="text-purple-400">
                                {isFa ? 'تغییر تاریخ' : 'Alt-History'}
                              </span>
                            </>
                          ) : (
                            <span>{categoryLabel}</span>
                          )}
                        </span>
                      </div>

                      <p className="mt-1 text-xs sm:text-[13px] text-[#CBD5E1] leading-relaxed whitespace-normal break-words">
                        {displayText}
                      </p>

                      {/* Compact Inline Deltas ONLY for Actual Events (log_ev_) */}
                      {eventDeltas.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-1">
                          {eventDeltas.map((d, dIdx) => {
                            const tone = classifyDeltaTone(d);
                            const chipColorClass =
                              tone === 'pos'
                                ? 'bg-emerald-500/12 border-emerald-500/30 text-emerald-500'
                                : tone === 'neg'
                                  ? 'bg-rose-500/12 border-rose-500/30 text-rose-500'
                                  : 'bg-sky-500/12 border-sky-500/25 text-sky-500';

                            return (
                              <span
                                key={dIdx}
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] sm:text-[11px] font-semibold font-mono tabular-nums leading-none ${chipColorClass}`}
                              >
                                {renderDeltaChipIcon(d, tone)}
                                <span className="whitespace-normal break-words">{d}</span>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div ref={bottomRef} />
    </div>
  );
}

