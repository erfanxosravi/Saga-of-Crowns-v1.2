import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Crown,
  RotateCcw,
  Share2,
  Skull,
  Sparkles,
} from 'lucide-react';
import { evaluateLifeReportTitle } from '../data/deathsAndAchievements';
import { formatPersonName } from '../i18n/gameDataFa';
import { EPITHET_FA, formatAgeLabel, isRtl, ROLE_LABELS } from '../i18n/ui';
import { FullGameState } from '../types/game';
import { SagaSharePosterModal } from './SagaSharePosterModal';
import { VikingPortrait } from './VikingPortrait';

interface DeathSummaryModalProps {
  state: FullGameState;
  onContinueWithHeir: (heirId: string) => void;
  onQuickNewLife?: () => void;
  onEndDynastyAndRestart: () => void;
}

export function DeathSummaryModal({
  state,
  onContinueWithHeir,
  onQuickNewLife,
  onEndDynastyAndRestart,
}: DeathSummaryModalProps) {
  const [showOtherHeirs, setShowOtherHeirs] = useState(false);
  const [showFullSaga, setShowFullSaga] = useState(false);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);

  const death = state.pendingDeath;
  if (!death) return null;

  const lang = state.settings.language;
  const isFa = lang === 'fa';
  const rtl = isRtl(lang);
  const c = state.character;

  const fullName = formatPersonName(`${c.givenName} ${c.patronymic}`, lang);
  const epText = c.epithet
    ? isFa
      ? ` «${EPITHET_FA[c.epithet] ?? c.epithet}»`
      : ` "${c.epithet}"`
    : '';

  const fallbackTitle = evaluateLifeReportTitle(state);
  const lifeTitle = isFa
    ? death.lifeTitleFa ?? fallbackTitle.titleFa
    : death.lifeTitle ?? fallbackTitle.titleEn;
  const closingLine = isFa
    ? death.closingLineFa ?? 'والهالا چشم‌به‌راهته!'
    : death.closingLine ?? 'Valhalla awaits!';
  const causeText = isFa
    ? death.causeOfDeathFa ?? death.causeOfDeath
    : death.causeOfDeath;

  const primaryHeir = death.eligibleHeirs[0] ?? null;
  const otherHeirs = death.eligibleHeirs.slice(1);
  const childrenCount = state.relationships.filter((r) => r.role === 'Child' && r.alive).length;

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 max-h-dvh overflow-hidden flex flex-col items-center justify-center bg-[#05080D]/88 backdrop-blur-xs p-2.5 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="death-modal-title"
    >
      <div className="w-full max-w-xl max-h-[94dvh] sm:max-h-[min(92dvh,760px)] flex flex-col overflow-hidden bg-[#0F1722] border border-[#F59E0B]/55 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.82)] text-start">
        {/* Top Report Header */}
        <div className="shrink-0 px-4 sm:px-5 py-3 sm:py-3.5 bg-[#121C2B] border-b border-[#1E2D40] space-y-2.5">
          {/* Top Kicker Row: Death Age/Year + Legacy Score */}
          <div className="flex items-center justify-between gap-2 border-b border-[#1E2D40]/80 pb-2">
            <div className="text-xs font-mono font-semibold text-[#F87171] inline-flex items-center gap-1.5 min-w-0">
              <Skull className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-normal break-words">
                {isFa
                  ? `پایان زندگی در ${c.age} سالگی · سال ${state.year} میلادی`
                  : `DIED AT AGE ${c.age} · ${state.year} AD`}
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#162232] border border-[#24354C] shrink-0">
              <span className="text-[11px] text-[#94A3B8]">
                {isFa ? 'امتیاز کل:' : 'Score:'}
              </span>
              <span className="text-sm sm:text-base font-mono font-bold tabular-nums text-[#F59E0B]">
                {death.legacyScore.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Character Portrait + Full Name, Epithet & Earned Saga Title */}
          <div className="flex items-center gap-3 min-w-0">
            <VikingPortrait
              age={c.age}
              sex={c.sex}
              traits={c.traits}
              title={c.title}
              appearance={c.appearance}
              seedId={c.id}
              size={58}
              className="shrink-0"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <h2
                id="death-modal-title"
                className="font-saga text-lg sm:text-2xl font-bold text-[#F1F5F9] whitespace-normal break-words leading-snug"
              >
                {fullName}
                {epText}
              </h2>
              <div className="text-xs text-[#F59E0B] font-semibold whitespace-normal break-words leading-snug">
                {isFa ? `لقب کارنامه: ${lifeTitle}` : `Earned Title: ${lifeTitle}`}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Middle Body: Cause of Death + 4 Metrics + Share Poster Studio */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-3.5 space-y-3">
          {/* Complete Cause of Death + Closing Line */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#131D2B] border border-[#24354C] space-y-2">
            <div className="text-[11px] font-bold text-[#F87171]">
              {isFa ? 'سرانجام و علت پایان زندگی:' : 'Cause of Death:'}
            </div>
            <p className="text-xs sm:text-sm font-medium text-[#F1F5F9] whitespace-normal break-words leading-relaxed">
              {causeText}
            </p>
            <p className="font-saga text-sm sm:text-base font-bold text-[#F59E0B] whitespace-normal break-words pt-0.5">
              « {closingLine} »
            </p>
          </div>

          {/* Compact 4-Column Report Metrics */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded-xl bg-[#131D2B] border border-[#233246]">
              <div className="text-[11px] text-[#94A3B8]">{isFa ? 'غارت‌ها' : 'Raids'}</div>
              <div className="text-sm font-mono font-bold text-[#F1F5F9] tabular-nums mt-0.5">
                {c.raidsLed}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[#131D2B] border border-[#233246]">
              <div className="text-[11px] text-[#94A3B8]">{isFa ? 'نقره' : 'Silver'}</div>
              <div className="text-sm font-mono font-bold text-[#F59E0B] tabular-nums mt-0.5">
                {state.realm.silver}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[#131D2B] border border-[#233246]">
              <div className="text-[11px] text-[#94A3B8]">{isFa ? 'مزارع' : 'Farms'}</div>
              <div className="text-sm font-mono font-bold text-[#34D399] tabular-nums mt-0.5">
                {state.realm.landFarms}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[#131D2B] border border-[#233246]">
              <div className="text-[11px] text-[#94A3B8]">{isFa ? 'فرزندان' : 'Kids'}</div>
              <div className="text-sm font-mono font-bold text-[#38BDF8] tabular-nums mt-0.5">
                {childrenCount}
              </div>
            </div>
          </div>

          {/* Highlighted Shareable Story Poster CTA + Full Obituary Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsPosterModalOpen(true)}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#18293E] to-[#132134] hover:brightness-110 border border-[#F59E0B]/60 text-xs font-bold text-[#F59E0B] inline-flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="whitespace-normal break-words">
                {isFa
                  ? 'پوستر داستان زندگی (مناسب استوری)'
                  : 'Create Saga Story Poster'}
              </span>
              <Share2 className="w-3.5 h-3.5 opacity-80 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => setShowFullSaga((v) => !v)}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-[#131D2B] hover:bg-[#1A273A] border border-[#233246] text-xs font-semibold text-[#CBD5E1] hover:text-[#F1F5F9] inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>{isFa ? 'متن کامل حماسه زندگی' : 'Full Saga Obituary'}</span>
              {showFullSaga ? (
                <ChevronUp className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 shrink-0" />
              )}
            </button>
          </div>

          {showFullSaga && (
            <div className="p-3.5 rounded-xl bg-[#131D2B] border border-[#233246] text-xs sm:text-sm text-[#CBD5E1] whitespace-normal break-words leading-relaxed">
              {isFa ? death.obituaryProseFa ?? death.obituaryProse : death.obituaryProse}
            </div>
          )}

          {/* Other Heirs Accordion List */}
          {primaryHeir && otherHeirs.length > 0 && showOtherHeirs && (
            <div className="p-2.5 rounded-xl bg-[#131D2B] border border-[#24354C] space-y-1.5">
              <div className="text-[11px] font-bold text-[#94A3B8] px-1">
                {isFa ? 'سایر وارثان خاندان:' : 'Other Eligible Heirs:'}
              </div>
              {otherHeirs.map((heir) => (
                <button
                  key={heir.id}
                  type="button"
                  onClick={() => onContinueWithHeir(heir.id)}
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-[#162232] hover:bg-[#1A273A] border border-[#24354C] flex items-center justify-between gap-2 text-xs text-[#F1F5F9] cursor-pointer transition-colors"
                >
                  <span className="font-semibold whitespace-normal break-words text-start">
                    {formatPersonName(heir.name, lang)} · {ROLE_LABELS[lang][heir.role]} ·{' '}
                    {formatAgeLabel(Math.max(6, heir.age), lang)}
                  </span>
                  <span className="text-[#F59E0B] font-bold whitespace-nowrap shrink-0">
                    {isFa ? 'انتخاب ←' : 'Play →'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sticky Footer: Heir Continuation & New Life Actions */}
        <div className="shrink-0 px-4 sm:px-5 py-3 bg-[#121C2B] border-t border-[#1E2D40] space-y-2">
          {primaryHeir ? (
            <>
              <button
                type="button"
                onClick={() => onContinueWithHeir(primaryHeir.id)}
                className="w-full min-h-[52px] px-4 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0B1118] font-bold text-xs sm:text-sm shadow-lg flex items-center justify-between gap-2.5 cursor-pointer transition-colors"
              >
                <span className="inline-flex items-center gap-2 min-w-0 text-start">
                  <Crown className="w-5 h-5 shrink-0" />
                  <span className="whitespace-normal break-words leading-snug">
                    {isFa
                      ? `ادامه با وارث: ${formatPersonName(primaryHeir.name, 'fa')} (${ROLE_LABELS.fa[primaryHeir.role]} · ${formatAgeLabel(Math.max(6, primaryHeir.age), 'fa')})`
                      : `Continue as ${primaryHeir.name} (${ROLE_LABELS.en[primaryHeir.role]} · ${formatAgeLabel(Math.max(6, primaryHeir.age), 'en')})`}
                  </span>
                </span>
                <span className="text-xs font-extrabold whitespace-nowrap shrink-0 px-2 py-1 rounded-lg bg-[#0B1118]/15">
                  {isFa ? 'نسل بعد ←' : 'Next Gen →'}
                </span>
              </button>

              {otherHeirs.length > 0 && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowOtherHeirs((v) => !v)}
                    className="text-xs font-medium text-[#94A3B8] hover:text-[#38BDF8] inline-flex items-center gap-1 cursor-pointer py-0.5"
                  >
                    <span>
                      {isFa
                        ? `انتخاب از بین ${otherHeirs.length} وارث دیگر`
                        : `Or pick from ${otherHeirs.length} other heir${otherHeirs.length === 1 ? '' : 's'}`}
                    </span>
                    {showOtherHeirs ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="p-2.5 rounded-xl bg-[#162232] border border-[#24354C] text-xs text-[#F87171] text-center">
              {isFa
                ? 'هیچ وارث زنده‌ای باقی نمانده است؛ یک زندگی جدید را آغاز کنید!'
                : 'No living heirs remain — start a fresh Viking life!'}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {onQuickNewLife && (
              <button
                type="button"
                onClick={onQuickNewLife}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#38BDF8] hover:bg-[#7DD3FC] text-[#0B1118] text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>
                  {isFa ? 'زندگی تصادفی جدید (۱ کلیک)' : 'Random New Life (1-Click)'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onEndDynastyAndRestart}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl bg-[#131D2B] hover:bg-[#1B293D] border border-[#24354C] text-xs font-semibold text-[#CBD5E1] inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                onQuickNewLife ? '' : 'sm:col-span-2'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>
                {isFa ? 'ساخت شخصیت دلخواه جدید' : 'Custom New Character'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <SagaSharePosterModal
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
        state={state}
      />
    </div>
  );
}
