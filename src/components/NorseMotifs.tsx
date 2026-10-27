import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

export type NorseAccent = 'amber' | 'crimson' | 'ice' | 'emerald' | 'violet' | 'slate';

const ACCENT_HEX: Record<NorseAccent, string> = {
  amber: '#F59E0B',
  crimson: '#EF4444',
  ice: '#38BDF8',
  emerald: '#34D399',
  violet: '#A78BFA',
  slate: '#64748B',
};

const ACCENT_TEXT_CLASS: Record<NorseAccent, string> = {
  amber: 'text-[#F59E0B]',
  crimson: 'text-[#EF4444]',
  ice: 'text-[#38BDF8]',
  emerald: 'text-[#34D399]',
  violet: 'text-[#A78BFA]',
  slate: 'text-[#64748B]',
};

interface RuneDividerProps {
  label?: string;
  rune?: string;
  accent?: NorseAccent;
  className?: string;
}

/**
 * Clean Norse runic / knotwork lozenge divider.
 */
export function RuneDivider({
  label,
  rune = 'ᛟ',
  accent = 'amber',
  className = '',
}: RuneDividerProps) {
  const stroke = ACCENT_HEX[accent];

  return (
    <div
      className={`flex items-center gap-2.5 select-none ${className}`}
      role={label ? undefined : 'separator'}
      aria-hidden={label ? undefined : true}
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#24364D] to-[#2F4663]" />
      <div className="inline-flex items-center gap-2 shrink-0">
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="opacity-75 shrink-0"
        >
          <path
            d="M8 1.5L14.5 8L8 14.5L1.5 8L8 1.5Z"
            stroke={stroke}
            strokeWidth="1.2"
          />
          <path
            d="M8 4.5L11.5 8L8 11.5L4.5 8L8 4.5Z"
            stroke={stroke}
            strokeOpacity="0.55"
            strokeWidth="1"
          />
        </svg>
        {label ? (
          <span className="text-xs font-semibold text-[#CBD5E1] whitespace-normal break-words leading-snug">
            {label}
          </span>
        ) : (
          <span className={`text-xs font-serif leading-none opacity-80 ${ACCENT_TEXT_CLASS[accent]}`}>
            {rune}
          </span>
        )}
        {label && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="opacity-75 shrink-0"
          >
            <path
              d="M8 1.5L14.5 8L8 14.5L1.5 8L8 1.5Z"
              stroke={stroke}
              strokeWidth="1.2"
            />
            <path
              d="M8 4.5L11.5 8L8 11.5L4.5 8L8 4.5Z"
              stroke={stroke}
              strokeOpacity="0.55"
              strokeWidth="1"
            />
          </svg>
        )}
      </div>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#24364D] to-[#2F4663]" />
    </div>
  );
}

interface NorseCornerOrnamentProps {
  accent?: NorseAccent;
  position?: 'top-end' | 'bottom-end';
}

/**
 * Subtle Norse angular interlace corner ornament for cards & tiles.
 */
export function NorseCornerOrnament({
  accent = 'amber',
  position = 'top-end',
}: NorseCornerOrnamentProps) {
  const stroke = ACCENT_HEX[accent];
  const posClass =
    position === 'top-end'
      ? 'top-2 end-2 rtl:-scale-x-100'
      : 'bottom-2 end-2 -scale-y-100 rtl:-scale-x-100';

  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      aria-hidden="true"
      className={`pointer-events-none absolute opacity-30 ${posClass}`}
    >
      <path
        d="M2 2H18L24 8V24"
        stroke={stroke}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 2V7H19V17H24"
        stroke={stroke}
        strokeOpacity="0.65"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="15.5" y="4.5" width="5" height="5" transform="rotate(45 18 7)" stroke={stroke} strokeWidth="1" />
    </svg>
  );
}

interface NorseBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  accent?: NorseAccent;
  closeLabel?: string;
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Mobile-first slide-up bottom sheet (centers cleanly on larger viewports)
 * with 44x44 touch close button, Escape key handling, and non-clipping scroll area.
 */
export function NorseBottomSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  accent = 'amber',
  closeLabel = 'Close',
  footer,
  children,
}: NorseBottomSheetProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const borderAccentClass =
    accent === 'crimson'
      ? 'border-[#DC2626]/60'
      : accent === 'ice'
        ? 'border-[#38BDF8]/50'
        : accent === 'emerald'
          ? 'border-[#34D399]/50'
          : accent === 'violet'
            ? 'border-[#A78BFA]/50'
            : 'border-[#F59E0B]/50';

  return (
    <div
      className="fixed inset-0 z-50 bg-[#05080D]/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`relative w-full sm:max-w-xl max-h-[85dvh] sm:max-h-[min(85dvh,720px)] flex flex-col bg-[#0F1722] border-t sm:border ${borderAccentClass} rounded-t-3xl sm:rounded-2xl shadow-[0_-16px_48px_rgba(0,0,0,0.85)] overflow-hidden text-start`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle Affordance */}
        <div className="pt-2.5 pb-1 flex justify-center sm:hidden shrink-0">
          <div className="w-11 h-1.5 rounded-full bg-[#2A3E59]" />
        </div>

        {/* Sheet Header */}
        <div className="shrink-0 px-4 sm:px-5 py-3 border-b border-[#1E2D40] bg-[#121C2B] flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {icon && <div className="shrink-0 mt-0.5">{icon}</div>}
            <div className="min-w-0 flex-1">
              <h3 className="font-saga text-xl sm:text-2xl font-bold text-[#F1F5F9] whitespace-normal break-words leading-snug">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-[#94A3B8] whitespace-normal break-words leading-relaxed mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="min-w-[44px] min-h-[44px] rounded-xl bg-[#182638] hover:bg-[#22354D] border border-[#2A3E59] flex items-center justify-center text-[#CBD5E1] hover:text-[#F1F5F9] shrink-0 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/70"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sheet Scrollable Content (with top & bottom padding so first/last card is never cut off) */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 pt-4 pb-6 secondary-scroll-mask space-y-3.5">
          {children}
        </div>

        {/* Optional Sticky Footer CTA */}
        {footer && (
          <div className="shrink-0 px-4 sm:px-5 py-3 border-t border-[#1E2D40] bg-[#0B1118]/95">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
