import { ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

export interface NordicSelectOption<T extends string = string> {
  value: T;
  label: string;
  sublabel?: string;
  badge?: string;
  badgeTone?: 'gold' | 'ice' | 'danger' | 'emerald' | 'muted';
}

interface NordicSelectProps<T extends string = string> {
  label?: string;
  value: T;
  options: NordicSelectOption<T>[];
  onChange: (next: T) => void;
  icon?: ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
}

function getBadgeToneClass(tone: NordicSelectOption['badgeTone']): string {
  switch (tone) {
    case 'gold':
      return 'text-accent-amber';
    case 'ice':
      return 'text-accent-ice';
    case 'danger':
      return 'text-accent-crimson';
    case 'emerald':
      return 'text-accent-emerald';
    case 'muted':
    default:
      return 'text-ink-muted';
  }
}

export function NordicSelect<T extends string = string>({
  label,
  value,
  options,
  onChange,
  icon,
  disabled = false,
  ariaLabel,
}: NordicSelectProps<T>) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [menuStyle, setMenuStyle] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxHeight: number;
  }>({ left: 0, width: 260, maxHeight: 240 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((opt) => opt.value === value) ?? options[0];

  const updateMenuPosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const spaceBelow = vh - rect.bottom - 12;
    const spaceAbove = rect.top - 12;
    const shouldUp = spaceBelow < 180 && spaceAbove > spaceBelow;
    const avail = shouldUp ? spaceAbove : spaceBelow;
    const maxHeight = Math.max(140, Math.min(260, Math.floor(avail)));

    if (shouldUp) {
      setMenuStyle({
        bottom: Math.max(8, vh - rect.top + 6),
        left: Math.max(8, rect.left),
        width: rect.width,
        maxHeight,
      });
    } else {
      setMenuStyle({
        top: rect.bottom + 6,
        left: Math.max(8, rect.left),
        width: rect.width,
        maxHeight,
      });
    }
  };

  const handleToggleOpen = () => {
    if (disabled) return;
    if (!isOpen) {
      updateMenuPosition();
    }
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleOutside = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        (!menuRef.current || !menuRef.current.contains(target))
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setIsOpen(false);
      }
    };

    const handleReposition = () => {
      updateMenuPosition();
    };

    window.addEventListener('pointerdown', handleOutside);
    window.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    return () => {
      window.removeEventListener('pointerdown', handleOutside);
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isOpen]);

  const docDir =
    typeof document !== 'undefined' ? document.documentElement.dir || 'rtl' : 'rtl';

  return (
    <div ref={containerRef} className={`relative ${isOpen ? 'z-50' : 'z-10'} space-y-1.5`}>
      {label && <label className="block text-xs font-medium text-ink-muted px-0.5">{label}</label>}

      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel ?? label}
        onClick={handleToggleOpen}
        className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border text-start flex items-center justify-between gap-2.5 transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/70 ${
          isOpen
            ? 'bg-surface-secondary border-gold-500 text-ink-primary'
            : 'bg-surface-canvas border-border-subtle hover:border-status-ice/70 text-ink-primary'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {icon && <span className="shrink-0">{icon}</span>}
          <div className="min-w-0 flex-1">
            <div className="text-xs sm:text-sm font-semibold text-ink-primary whitespace-normal break-words leading-snug">
              {selectedOption?.label}
            </div>
            {selectedOption?.sublabel && (
              <div className="text-xs text-ink-muted whitespace-normal break-words leading-snug mt-0.5">
                {selectedOption.sublabel}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {selectedOption?.badge && (
            <span
              className={`text-xs font-mono tabular-nums font-semibold ${getBadgeToneClass(
                selectedOption.badgeTone
              )}`}
            >
              {selectedOption.badge}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 motion-reduce:transition-none ${
              isOpen ? 'rotate-180 text-accent-amber' : 'text-ink-muted'
            }`}
          />
        </div>
      </button>

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            dir={docDir}
            role="listbox"
            style={{
              position: 'fixed',
              top: menuStyle.top !== undefined ? `${menuStyle.top}px` : undefined,
              bottom: menuStyle.bottom !== undefined ? `${menuStyle.bottom}px` : undefined,
              left: `${menuStyle.left}px`,
              width: `${menuStyle.width}px`,
              maxHeight: `${menuStyle.maxHeight}px`,
            }}
            className="z-[120] overflow-y-auto rounded-xl bg-surface-elevated border border-border-strong shadow-[0_18px_42px_rgba(0,0,0,0.92)] p-1.5 space-y-1"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full min-h-[44px] px-3 py-2.5 rounded-lg text-start flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-surface-interactive text-ink-primary'
                      : 'hover:bg-surface-secondary text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-semibold leading-snug break-words">
                      {opt.label}
                    </div>
                    {opt.sublabel && (
                      <div className="text-xs text-ink-muted leading-snug mt-0.5 break-words">
                        {opt.sublabel}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {opt.badge && (
                      <span
                        className={`text-xs font-mono tabular-nums font-semibold ${getBadgeToneClass(
                          opt.badgeTone
                        )}`}
                      >
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && <Check className="w-4 h-4 text-accent-amber shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}

interface NordicAccordionProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  accent?: 'gold' | 'ice' | 'crimson' | 'emerald' | 'neutral';
  statusNode?: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function NordicAccordion({
  title,
  subtitle,
  icon,
  accent = 'ice',
  statusNode,
  isOpen,
  onToggle,
  children,
}: NordicAccordionProps) {
  const [allowOverflow, setAllowOverflow] = useState<boolean>(isOpen);

  useEffect(() => {
    if (isOpen) {
      const timer = window.setTimeout(() => setAllowOverflow(true), 220);
      return () => window.clearTimeout(timer);
    }
    setAllowOverflow(false);
  }, [isOpen]);

  const iconBgClass =
    accent === 'gold'
      ? 'bg-gold-500/15 text-accent-amber'
      : accent === 'crimson'
        ? 'bg-blood-500/15 text-accent-crimson'
        : accent === 'emerald'
          ? 'bg-status-emerald/15 text-accent-emerald'
          : accent === 'ice'
            ? 'bg-status-ice/15 text-accent-ice'
            : 'bg-surface-interactive text-ink-muted';

  const activeBorderClass =
    accent === 'gold'
      ? 'border-gold-500/60'
      : accent === 'crimson'
        ? 'border-blood-500/60'
        : accent === 'emerald'
          ? 'border-status-emerald/60'
          : 'border-status-ice/60';

  return (
    <div
      className={`flex flex-col rounded-xl bg-surface-secondary border transition-colors ${
        isOpen ? activeBorderClass : 'border-border-subtle hover:border-border-strong'
      }`}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        className="w-full min-h-[60px] px-4 py-3 flex items-center justify-between gap-3 text-start hover:bg-surface-secondary/70 rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/70"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {icon && (
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBgClass}`}
            >
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm sm:text-[15px] font-semibold text-ink-primary leading-snug break-words">
              {title}
            </div>
            {subtitle && (
              <div className="text-xs text-ink-muted leading-snug mt-0.5 break-words">
                {subtitle}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {statusNode}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 motion-reduce:transition-none ${
              isOpen ? 'rotate-180 text-accent-amber' : 'text-ink-muted'
            }`}
          />
        </div>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className={allowOverflow ? 'overflow-visible' : 'overflow-hidden'}>
          <div className="px-4 pb-4 pt-3 border-t border-border-subtle bg-surface-elevated/85 rounded-b-xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
