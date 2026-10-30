import { BookOpen, Compass, HelpCircle, X } from 'lucide-react';
import { isRtl, QUICK_GUIDE } from '../i18n/ui';
import { Language } from '../types/game';
import { useModalA11y } from '../utils/useModalA11y';

interface QuickGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export function QuickGuideModal({ isOpen, onClose, lang }: QuickGuideModalProps) {
  const modalRef = useModalA11y<HTMLDivElement>({
    isOpen,
    onClose,
  });

  if (!isOpen) return null;
  const g = QUICK_GUIDE[lang];
  const rtl = isRtl(lang);

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 max-h-dvh overflow-hidden flex flex-col items-center justify-center bg-surface-backdrop backdrop-blur-xs p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-guide-title"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="w-full max-w-xl max-h-[min(88dvh,700px)] flex flex-col overflow-hidden bg-surface-elevated border border-border-subtle rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.88)] text-start"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border-subtle bg-surface-secondary flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-status-ice/15 border border-status-ice/35 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 text-accent-ice" />
            </div>
            <div className="min-w-0 flex-1">
              <h2
                id="quick-guide-title"
                className="font-saga text-xl sm:text-2xl font-bold text-ink-primary whitespace-normal break-words leading-snug"
              >
                {g.title}
              </h2>
              <p className="text-xs text-ink-muted whitespace-normal break-words leading-relaxed mt-0.5">
                {g.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={g.closeLabel}
            className="min-w-[44px] min-h-[44px] rounded-xl bg-surface-interactive hover:bg-surface-interactive border border-border-subtle flex items-center justify-center text-ink-muted hover:text-ink-primary cursor-pointer shrink-0 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 pt-5 pb-6 space-y-5 text-start">
          {/* 4-Step Gameplay Loop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {g.steps.map((step, idx) => (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-xl bg-surface-secondary border border-border-subtle space-y-1.5"
              >
                <div className="text-xs sm:text-sm font-bold text-accent-amber flex items-center gap-1.5">
                  <Compass className="w-4 h-4 shrink-0" />
                  <span>{step.heading}</span>
                </div>
                <p className="text-xs sm:text-[13px] text-ink-secondary leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>

          {/* Viking Age Glossary */}
          <div className="space-y-3 pt-3 border-t border-border-subtle">
            <h3 className="text-sm font-bold text-ink-primary flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-accent-ice shrink-0" />
              <span>{g.glossaryTitle}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {g.terms.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-surface-canvas border border-border-subtle space-y-1"
                >
                  <div className="text-xs sm:text-sm font-semibold text-accent-amber">{item.term}</div>
                  <div className="text-xs text-ink-muted leading-relaxed">{item.meaning}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-border-subtle bg-surface-secondary/70 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 bg-gold-500 hover:bg-gold-400 text-nordic-950 font-bold text-xs sm:text-sm rounded-xl cursor-pointer whitespace-nowrap transition-colors"
          >
            {g.closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
