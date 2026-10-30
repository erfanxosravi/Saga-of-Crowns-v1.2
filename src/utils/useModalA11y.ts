import { RefObject, useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface UseModalA11yOptions {
  isOpen?: boolean;
  onClose?: () => void;
  /** Optional selector to check if a higher-layer modal is open above this one */
  ignoreWhenSelectorPresent?: string;
}

/**
 * Provides WCAG-compliant modal accessibility:
 * - Escape-to-close keyboard shortcut
 * - Tab / Shift+Tab focus trapping within the dialog container
 * - Automatic initial focus on open and focus restoration on unmount/close
 */
export function useModalA11y<T extends HTMLElement = HTMLDivElement>({
  isOpen = true,
  onClose,
  ignoreWhenSelectorPresent,
}: UseModalA11yOptions): RefObject<T | null> {
  const containerRef = useRef<T | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusTimer = window.setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;
      if (container.contains(document.activeElement)) return;
      const firstFocusable = container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      firstFocusable?.focus();
    }, 20);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ignoreWhenSelectorPresent &&
        document.querySelector(ignoreWhenSelectorPresent)
      ) {
        return;
      }

      if (e.key === 'Escape' && onCloseRef.current) {
        e.stopPropagation();
        e.preventDefault();
        onCloseRef.current();
        return;
      }

      if (e.key === 'Tab') {
        const container = containerRef.current;
        if (!container) return;
        const focusables = Array.from(
          container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => el.offsetParent !== null || el === document.activeElement);

        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (e.shiftKey) {
          if (!active || !container.contains(active) || active === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (!active || !container.contains(active) || active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        try {
          previouslyFocused.focus();
        } catch {
          // Ignore if node was removed
        }
      }
    };
  }, [isOpen, ignoreWhenSelectorPresent]);

  return containerRef;
}
