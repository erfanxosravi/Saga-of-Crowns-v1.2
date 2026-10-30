import { ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

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
  maxWidthClass?: string;
  children: ReactNode;
}

/**
 * Mobile-First Bottom Sheet (~92% height) with drag handle, rounded-t-[20px],
 * swipe-down gesture or X to close, sticky header, and safe-area support.
 * Rendered via React Portal to document.body so it is never clipped.
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
  maxWidthClass = 'max-w-2xl',
  children,
}: NorseBottomSheetProps) {
  const prefersReducedMotion = useReducedMotion();
  const dragStartYRef = useRef<number | null>(null);
  const [dragOffsetY, setDragOffsetY] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setDragOffsetY(0);
      dragStartYRef.current = null;
      return;
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.querySelector('[data-city-modal="true"]')) return;
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
      ? 'border-[#DC2626]/45'
      : accent === 'ice'
        ? 'border-[#38BDF8]/45'
        : accent === 'emerald'
          ? 'border-[#34D399]/45'
          : accent === 'violet'
            ? 'border-[#A78BFA]/45'
            : 'border-[#243447]';

  const currentDir =
    typeof document !== 'undefined' && document.documentElement.dir
      ? (document.documentElement.dir as 'rtl' | 'ltr')
      : 'rtl';

  const handleHeaderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Do not start swipe-drag if clicking a button inside header
    if ((e.target as HTMLElement).closest('button')) return;
    dragStartYRef.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleHeaderPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartYRef.current === null) return;
    const delta = e.clientY - dragStartYRef.current;
    if (delta > 0) {
      setDragOffsetY(delta);
    } else {
      setDragOffsetY(0);
    }
  };

  const handleHeaderPointerUp = () => {
    if (dragStartYRef.current === null) return;
    if (dragOffsetY >= 68) {
      setDragOffsetY(0);
      dragStartYRef.current = null;
      onClose();
      return;
    }
    setDragOffsetY(0);
    dragStartYRef.current = null;
  };

  const sheetNode = (
    <motion.div
      dir={currentDir}
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.16, ease: 'easeOut' }}
      className="fixed inset-0 z-[100] max-h-dvh overflow-hidden bg-[#05080D]/65 backdrop-blur-[2px] flex flex-col items-center justify-end sm:justify-center p-0 sm:p-4 text-[#F1F5F9]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0.9, y: 42 }}
        animate={{ opacity: 1, y: dragOffsetY }}
        transition={
          dragStartYRef.current !== null || prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.22, ease: [0.16, 1, 0.3, 1] }
        }
        className={`relative w-full ${maxWidthClass} h-[92dvh] max-h-[92dvh] sm:h-auto sm:max-h-[90dvh] flex flex-col overflow-hidden bg-[#0F1722] border-t sm:border ${borderAccentClass} rounded-t-[20px] sm:rounded-[20px] shadow-[0_-12px_42px_rgba(0,0,0,0.45)] text-start`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle + Sticky Sheet Header (Swipe-down enabled) */}
        <div
          onPointerDown={handleHeaderPointerDown}
          onPointerMove={handleHeaderPointerMove}
          onPointerUp={handleHeaderPointerUp}
          onPointerCancel={handleHeaderPointerUp}
          className="sticky top-0 z-20 shrink-0 border-b border-[#1E2D40] bg-[#121C2B] touch-none select-none cursor-grab active:cursor-grabbing"
        >
          {/* Centered Drag Pill */}
          <div className="pt-2.5 pb-1 flex justify-center">
            <div className="w-10 h-1.5 rounded-full bg-[#334863] opacity-75" />
          </div>

          <div className="px-4 sm:px-5 pb-3 pt-1 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {icon && <div className="shrink-0">{icon}</div>}
              <div className="min-w-0 flex-1">
                <h3 className="font-saga text-[20px] font-semibold text-[#F1F5F9] whitespace-normal break-words leading-snug">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-[12px] text-[#94A3B8] whitespace-normal break-words leading-relaxed mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-[#182638] hover:bg-[#22354D] border border-[#2A3E59] flex items-center justify-center text-[#CBD5E1] hover:text-[#F1F5F9] shrink-0 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sheet Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-4">
          {children}
        </div>

        {/* Sticky Footer CTA */}
        {footer && (
          <div className="shrink-0 px-4 sm:px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-[#1E2D40] bg-[#121C2B]">
            {footer}
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(sheetNode, document.body);
  }
  return sheetNode;
}

export type MilitaryGlyphType =
  | 'local_garrison'
  | 'bondi_spearmen'
  | 'sworn_huscarls'
  | 'norse_archers'
  | 'berserkers'
  | 'snekkja'
  | 'drakkar'
  | 'knarr'
  | 'warhorses'
  | 'pack_horses'
  | 'war_gear';

/**
 * Custom minimalist SVG glyphs with one consistent stroke weight (1.75)
 * matching the app's orange/cream/charcoal/ice palette.
 * Used across both RealmPanel and VikingMap.
 */
export function MilitaryUnitGlyph({
  type,
  className = 'w-5 h-5',
}: {
  type: MilitaryGlyphType;
  className?: string;
}) {
  switch (type) {
    case 'local_garrison':
      return (
        <svg
          viewBox="0 0 24 24"
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z" />
          <circle cx="12" cy="11" r="2.2" />
          <path d="M12 3v5.8M12 13.2V21" strokeOpacity="0.6" />
        </svg>
      );

    case 'bondi_spearmen':
      return (
        <svg
          viewBox="0 0 24 24"
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 19L19 5" />
          <path d="M15 5h4v4" />
          <circle cx="11" cy="13" r="5" fill="#0F1722" />
          <circle cx="11" cy="13" r="5" />
          <circle cx="11" cy="13" r="1.5" />
        </svg>
      );

    case 'sworn_huscarls':
      return (
        <svg
          viewBox="0 0 24 24"
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 20L20 4M4 4l16 16" />
          <path d="M17 3c2 1.2 2.8 3 2 5M7 3C5 4.2 4.2 6 5 8" />
          <circle cx="12" cy="12" r="5.5" fill="#0F1722" />
          <circle cx="12" cy="12" r="5.5" />
          <circle cx="12" cy="12" r="1.8" />
        </svg>
      );

    case 'norse_archers':
      return (
        <svg
          viewBox="0 0 24 24"
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 4c7 4 7 12 0 16" />
          <path d="M6 4v16" strokeOpacity="0.65" />
          <path d="M4 12h16" />
          <path d="M16 8.5L20 12l-4 3.5" />
        </svg>
      );

    case 'berserkers':
      /* Bear-claw / Wolf-fang emblem */
      return (
        <svg
          viewBox="0 0 24 24"
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 4l3 5-2 4 3 3 3-2 3 2 3-3-2-4 3-5-4 2-3-2-3 2-4-2z" />
          <path d="M9.5 11.5L11 13M14.5 11.5L13 13" />
          <path d="M8 18l2 3M12 17.5V21M16 18l-2 3" />
        </svg>
      );

    case 'snekkja':
      /* Slim low-draft patrol hull */
      return (
        <svg
          viewBox="0 0 24 24"
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M2.5 15.5c3.5 2.2 15.5 2.2 19 0l1-2.5H1.5l1 2.5z" />
          <path d="M12 6.5V13" />
          <path d="M8.5 8h7l-1 4h-5l-1-4z" />
          <path d="M6 16.5l-1 2.5M10 17l-.8 2.5M14 17l.8 2.5M18 16.5l1 2.5" strokeOpacity="0.7" />
        </svg>
      );

    case 'drakkar':
      /* High dragon-prow stem longship */
      return (
        <svg
          viewBox="0 0 24 24"
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 16c3 2.5 15 2.5 18 0 1.4-1.3 2-3.4 1.6-6-.3-1.6-1.4-2.4-2.5-1.8l1.2 1.8c-.4 1.8-1.4 3-3 3.2H5.5c-1.4-.2-2.2-1.8-2-4.2.1-1.8 1.2-3.2 2.6-3.2L4.5 4.2C2.4 4.6 1.2 6.8 1.4 10c.2 2.6.7 4.7 1.6 6z" />
          <path d="M12 4.5V13" />
          <path d="M7.5 6.8h9l-1 5h-7l-1-5z" />
        </svg>
      );

    case 'knarr':
      /* Broad deep-hulled ocean cargo ship */
      return (
        <svg
          viewBox="0 0 24 24"
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3.5 13.5c0 4 3.5 6 8.5 6s8.5-2 8.5-6l1-2.5c-2.5 1-4.5 1.5-9.5 1.5S5 12 2.5 11l1 2.5z" />
          <path d="M12 4v8.5" />
          <path d="M7 6c3.2-1 6.8-1 10 0l-1.2 5H8.2L7 6z" />
        </svg>
      );

    case 'warhorses':
      return (
        <svg
          viewBox="0 0 24 24"
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M7 20v-5l-2-3 2-5 4-3 5 1 2 4-4 2-1 3 3 2v4H7z" />
          <circle cx="13.5" cy="7.5" r="0.8" fill="currentColor" />
        </svg>
      );

    case 'pack_horses':
      return (
        <svg
          viewBox="0 0 24 24"
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 19v-5l-1.5-2.5L6 7l3.5-2.5 4 1 1.5 3-3 1.5-.5 2H17l2 2.5V19" />
          <rect x="11" y="10.5" width="5.5" height="4.5" rx="1" />
        </svg>
      );

    case 'war_gear':
      return (
        <svg
          viewBox="0 0 24 24"
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 11a6 6 0 0112 0v4l-2 2H8l-2-2v-4z" />
          <path d="M12 5v9M8.5 11.5h7" />
          <path d="M9 17v2.5M12 17v3M15 17v2.5" />
        </svg>
      );
  }
}


