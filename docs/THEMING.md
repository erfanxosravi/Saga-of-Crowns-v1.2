# Theming & Color Token Rules

1. **Single Source of Truth**: Define all colors in `src/index.css` via `:root, html[data-theme="light"]`, `html[data-theme="dark"]`, and `@theme`.
2. **No Hard-Coded Component Classes**: Never use `bg-/text-/border-/from-/via-/to-/ring-/divide-` with `[#…]` hex literals or raw Tailwind palette names (`slate-*`, `amber-*`, `emerald-*`, `rose-*`, etc.) in TSX components.
3. **Surfaces**: Use `bg-surface-{canvas|elevated|card|secondary|interactive|disabled|backdrop}` and semantic tints `bg-surface-{amber|crimson|emerald|ice|violet}-tint`.
4. **Typography**: Use `text-ink-{primary|secondary|muted|disabled}` and semantic accents `text-accent-{amber|amber-strong|ice|emerald|crimson|violet}`.
5. **Borders & Dividers**: Use `border-border-{subtle|strong|amber-subtle|crimson-subtle}` (meaningful borders must maintain ≥ 3.0:1 contrast).
6. **Buttons & Status Fills**: Use `gold-500`/`gold-400`, `blood-600`/`blood-500`, `cta-copper`, `cta-terracotta`, `cta-violet`, `cta-ice`, and `status-{emerald|crimson|violet|ice}`.
7. **Disabled Controls**: Rely on `button:disabled` (`--surface-disabled`, `--text-disabled` ≥ 4.5:1, dashed `--border-subtle`) plus a lock/clock icon and clear reason text.
8. **Verification**: Run `npm run check:colors` (0 hard-coded classes) and `npm run check:contrast` (WCAG AA ≥ 4.5:1 text, ≥ 3.0:1 meaningful boundaries) before committing.
9. **Migration Status**: 24/24 component files migrated (3,140 → 0 hard-coded color classes remaining).
