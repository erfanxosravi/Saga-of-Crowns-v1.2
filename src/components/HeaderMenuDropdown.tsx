import { useEffect, useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CloudRain,
  Globe,
  Moon,
  Save,
  Ship,
  Snowflake,
  Sun,
  Swords,
  Trophy,
  Volume2,
  VolumeX,
  Wind,
  X,
} from 'lucide-react';
import { BITLIFE_ACHIEVEMENTS } from '../data/deathsAndAchievements';
import { formatYearLabel, isRtl, SEASON_LABELS } from '../i18n/ui';
import { FullGameState, Language, Season, ThemeMode } from '../types/game';
import {
  evaluateHistoricalMilestones,
  HISTORICAL_MILESTONES,
  SagaBadgeRibbon,
} from './SagaBadgeSystem';

interface HeaderMenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  state: FullGameState;
  lang: Language;
  onSetLanguage: (next: Language) => void;
  theme: ThemeMode;
  onSetTheme: (next: ThemeMode) => void;
  season: Season;
  weatherName: string;
  isMapActive: boolean;
  onSelectSeasonMap: () => void;
  onOpenSagaBadges: () => void;
  isAudioOn: boolean;
  onToggleAudio: () => void;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
  year: number;
  hirdWarriors: number;
  fleetShips: number;
}

function renderSeasonIcon(season: Season) {
  switch (season) {
    case Season.Winter:
      return <Snowflake className="w-4 h-4 text-accent-ice shrink-0" />;
    case Season.Autumn:
      return <CloudRain className="w-4 h-4 text-ink-muted shrink-0" />;
    case Season.Spring:
      return <Wind className="w-4 h-4 text-accent-emerald shrink-0" />;
    case Season.Summer:
      return <Sun className="w-4 h-4 text-accent-amber shrink-0" />;
  }
}

export function HeaderMenuDropdown({
  isOpen,
  onClose,
  state,
  lang,
  onSetLanguage,
  theme,
  onSetTheme,
  season,
  weatherName,
  isMapActive,
  onSelectSeasonMap,
  onOpenSagaBadges,
  isAudioOn,
  onToggleAudio,
  onOpenGuide,
  onOpenSettings,
  year,
  hirdWarriors,
  fleetShips,
}: HeaderMenuDropdownProps) {
  const [shouldRender, setShouldRender] = useState<boolean>(isOpen);
  const [isAnimatedIn, setIsAnimatedIn] = useState<boolean>(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const frame = window.requestAnimationFrame(() => {
        setIsAnimatedIn(true);
      });
      return () => window.cancelAnimationFrame(frame);
    }

    setIsAnimatedIn(false);
    const timer = window.setTimeout(() => {
      setShouldRender(false);
    }, 200);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  const isFa = lang === 'fa';
  const rtl = isRtl(lang);

  const unlockedAchCount = BITLIFE_ACHIEVEMENTS.filter((ach) => {
    const prog = ach.getProgress(state);
    return state.achievements.includes(ach.id) || prog.current >= prog.target;
  }).length;
  const unlockedMsCount = evaluateHistoricalMilestones(state).filter((m) => m.unlocked).length;

  const rowBaseClass =
    'group w-full min-h-[54px] px-2.5 py-2 rounded-xl flex items-center justify-between gap-3 text-start transition-all duration-200 ease-out motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/70';

  const iconTileBaseClass =
    'w-9 h-9 rounded-lg bg-surface-secondary border border-border-subtle flex items-center justify-center shrink-0 transition-all duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none group-hover:scale-105';

  const chevronClass = `w-4 h-4 text-ink-muted group-hover:text-ink-primary shrink-0 transition-all duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
    rtl ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'
  }`;

  return (
    <>
      {/* Smooth Fading Click-Outside Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-surface-backdrop backdrop-blur-[1px] transition-opacity duration-200 ease-out motion-reduce:transition-none ${
          isAnimatedIn ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <div
        id="header-menu-dropdown"
        dir={rtl ? 'rtl' : 'ltr'}
        role="dialog"
        aria-modal="false"
        aria-label={isFa ? 'منوی سریع بازی' : 'Quick Game Menu'}
        className={`absolute top-full end-2.5 sm:end-5 mt-1.5 z-50 w-[calc(100vw-1.25rem)] max-w-[356px] max-h-[calc(100dvh-5rem)] flex flex-col overflow-hidden rounded-2xl bg-surface-elevated/98 backdrop-blur-md border border-border-subtle shadow-[0_20px_48px_rgba(0,0,0,0.86)] transition-all duration-200 ease-out motion-reduce:transition-none ${
          isAnimatedIn
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-1.5 scale-[0.98] pointer-events-none'
        }`}
      >
        {/* Top Saga Status Strip + Close Button */}
        <div className="shrink-0 px-3.5 py-1.5 border-b border-border-subtle flex items-center justify-between gap-2 bg-surface-secondary/85">
          <div className="flex items-center gap-2.5 text-[11px] font-mono tabular-nums text-ink-muted min-w-0 flex-wrap">
            <span className="text-ink-primary font-semibold">{formatYearLabel(year, lang)}</span>
            <span aria-hidden="true" className="text-ink-muted">
              ·
            </span>
            <span
              className="inline-flex items-center gap-1"
              title={isFa ? 'جنگجویان تالار' : 'Household Warriors'}
            >
              <Swords className="w-3.5 h-3.5 text-accent-crimson shrink-0" />
              <span className="text-ink-primary">{hirdWarriors}</span>
            </span>
            <span aria-hidden="true" className="text-ink-muted">
              ·
            </span>
            <span
              className="inline-flex items-center gap-1"
              title={isFa ? 'مجموع کشتی‌ها' : 'Fleet Ships'}
            >
              <Ship className="w-3.5 h-3.5 text-accent-ice shrink-0" />
              <span className="text-ink-primary">{fleetShips}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={isFa ? 'بستن منو' : 'Close menu'}
            className="min-w-[44px] min-h-[44px] -me-2 rounded-xl flex items-center justify-center text-ink-muted hover:text-ink-primary hover:bg-surface-interactive transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grouped Menu Categories */}
        <div className="flex-1 min-h-0 overflow-y-auto p-2">
          {/* Category 1: Save, Settings, Badges & Guide */}
          <div
            role="group"
            aria-label={isFa ? 'ذخیره، نشان‌ها و راهنما' : 'Saves, Badges & Guide'}
            className="space-y-0.5"
          >
            <div className="px-2.5 pt-0.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted select-none">
              {isFa ? 'نشان‌ها، ذخیره و راهنما' : 'Badges, Saves & Guide'}
            </div>

            {/* 1. Saga & Era Badges (Expandable inside Hamburger Menu) */}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setIsBadgesOpen((v) => !v)}
                aria-expanded={isBadgesOpen}
                className={`${rowBaseClass} ${
                  isBadgesOpen
                    ? 'bg-surface-ice-tint border border-gold-500/40'
                    : 'hover:bg-surface-secondary/90 active:bg-surface-interactive'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`${iconTileBaseClass} border-gold-500/45 bg-gold-500/15 group-hover:border-gold-500/75 group-hover:bg-gold-500/25`}
                  >
                    <Trophy className="w-4 h-4 text-accent-amber shrink-0" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-ink-primary group-hover:text-white leading-tight truncate transition-colors">
                      {isFa ? 'نشان‌های حماسه و تاریخ' : 'Saga & Era Badges'}
                    </div>
                    <div className="text-[11px] font-mono tabular-nums text-ink-muted truncate mt-0.5">
                      {isFa
                        ? `${unlockedAchCount}/${BITLIFE_ACHIEVEMENTS.length} نشان خاندان · ${unlockedMsCount}/${HISTORICAL_MILESTONES.length} مهر تاریخی`
                        : `${unlockedAchCount}/${BITLIFE_ACHIEVEMENTS.length} Dynasty · ${unlockedMsCount}/${HISTORICAL_MILESTONES.length} Era Seals`}
                    </div>
                  </div>
                </div>
                {isBadgesOpen ? (
                  <ChevronUp className="w-4 h-4 text-accent-amber shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-ink-muted shrink-0" />
                )}
              </button>

              {isBadgesOpen && (
                <div className="px-1 pb-1">
                  <SagaBadgeRibbon
                    state={state}
                    compactMenuMode
                    onOpenFullSagaTab={() => {
                      onClose();
                      onOpenSagaBadges();
                    }}
                  />
                </div>
              )}
            </div>

            {/* 2. Save & Settings */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className={`${rowBaseClass} hover:bg-surface-secondary/90 active:bg-surface-interactive`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`${iconTileBaseClass} border-status-emerald/35 bg-status-emerald/12 group-hover:border-status-emerald/65 group-hover:bg-status-emerald/20`}
                >
                  <Save className="w-4 h-4 text-accent-emerald shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-ink-primary group-hover:text-white leading-tight truncate transition-colors">
                    {isFa ? 'ذخیره و تنظیمات' : 'Saves & Settings'}
                  </div>
                  <div className="text-[11px] font-mono tabular-nums text-ink-muted truncate mt-0.5">
                    {isFa
                      ? `سال ${year} · ۳ جایگاه ذخیره · صدا ${isAudioOn ? 'روشن' : 'خاموش'}`
                      : `${year} AD · 3 save slots · Audio ${isAudioOn ? 'on' : 'off'}`}
                  </div>
                </div>
              </div>
              <ChevronRight className={chevronClass} />
            </button>

            {/* 3. Guide & Glossary */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenGuide();
              }}
              className={`${rowBaseClass} hover:bg-surface-secondary/90 active:bg-surface-interactive`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`${iconTileBaseClass} border-status-violet/35 bg-status-violet/12 group-hover:border-status-violet/65 group-hover:bg-status-violet/20`}
                >
                  <BookOpen className="w-4 h-4 text-accent-violet shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-ink-primary group-hover:text-white leading-tight truncate transition-colors">
                    {isFa ? 'راهنما و واژه‌نامه' : 'Guide & Glossary'}
                  </div>
                  <div className="text-[11px] text-ink-muted truncate mt-0.5">
                    {isFa
                      ? 'قوانین بازی، غارت، جانشینی و ۶ اصطلاح نورس'
                      : 'Rules, raids, succession & 6 Norse terms'}
                  </div>
                </div>
              </div>
              <ChevronRight className={chevronClass} />
            </button>

            {/* 4. Season & Sea Weather */}
            <button
              type="button"
              onClick={() => {
                onSelectSeasonMap();
                onClose();
              }}
              className={`${rowBaseClass} ${
                isMapActive
                  ? 'bg-surface-ice-tint text-accent-ice'
                  : 'hover:bg-surface-secondary/90 active:bg-surface-interactive text-ink-primary'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`${iconTileBaseClass} ${
                    isMapActive
                      ? 'border-status-ice/60 bg-surface-ice-tint'
                      : 'group-hover:border-status-ice/50 group-hover:bg-surface-ice-tint'
                  }`}
                >
                  {renderSeasonIcon(season)}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-xs font-semibold leading-tight truncate transition-colors ${
                      isMapActive ? 'text-accent-ice' : 'text-ink-primary group-hover:text-white'
                    }`}
                  >
                    {isFa ? 'فصل و وضعیت دریا' : 'Season & Sea Chart'}
                  </div>
                  <div className="text-[11px] text-ink-muted truncate mt-0.5">
                    {SEASON_LABELS[lang][season]} · {weatherName}
                  </div>
                </div>
              </div>
              <ChevronRight className={chevronClass} />
            </button>
          </div>

          <hr className="border-t border-border-subtle my-2" />

          {/* Category 2: Quick Toggles (Theme, Audio & Language) */}
          <div
            role="group"
            aria-label={isFa ? 'حالت روز و شب، صدا و زبان' : 'Theme, Audio & Language'}
            className="space-y-0.5"
          >
            <div className="px-2.5 pt-0.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted select-none">
              {isFa ? 'حالت روز و شب، صدا و زبان' : 'Theme, Audio & Language'}
            </div>

            {/* 4. Day / Night Theme Switcher */}
            <div className="group min-h-[54px] px-2.5 py-1.5 rounded-xl hover:bg-surface-secondary/85 flex items-center justify-between gap-3 transition-all duration-200 ease-out motion-reduce:transition-none">
              <div className="flex items-center gap-3 min-w-0 flex-1 text-start">
                <div
                  className={`${iconTileBaseClass} ${
                    theme === 'light'
                      ? 'border-gold-500/55 bg-gold-500/15'
                      : 'border-status-ice/45 bg-surface-ice-tint'
                  }`}
                >
                  {theme === 'light' ? (
                    <Sun className="w-4 h-4 text-accent-amber shrink-0" />
                  ) : (
                    <Moon className="w-4 h-4 text-accent-ice shrink-0" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-ink-primary group-hover:text-white leading-tight truncate transition-colors">
                    {isFa ? 'حالت نمایش (روز / شب)' : 'Display Theme'}
                  </div>
                  <div className="text-[11px] text-ink-muted truncate mt-0.5">
                    {theme === 'light'
                      ? isFa
                        ? 'روشن (عاج و طلای شمالی)'
                        : 'Daylight (Nordic Ivory)'
                      : isFa
                        ? 'تاریک (شب فیورد)'
                        : 'Night (Fjord Dark)'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-surface-canvas border border-border-subtle shrink-0">
                <button
                  type="button"
                  onClick={() => onSetTheme('light')}
                  aria-pressed={theme === 'light'}
                  className={`min-h-[40px] min-w-[60px] px-2.5 rounded-md text-xs font-bold inline-flex items-center justify-center gap-1 transition-all duration-150 motion-reduce:transition-none cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/70 ${
                    theme === 'light'
                      ? 'bg-gold-500 text-nordic-950 shadow-[0_2px_8px_rgba(245,158,11,0.28)]'
                      : 'text-ink-muted hover:text-ink-primary hover:bg-surface-secondary'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 shrink-0" />
                  <span>{isFa ? 'روز' : 'Day'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSetTheme('dark')}
                  aria-pressed={theme === 'dark'}
                  className={`min-h-[40px] min-w-[60px] px-2.5 rounded-md text-xs font-bold inline-flex items-center justify-center gap-1 transition-all duration-150 motion-reduce:transition-none cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/70 ${
                    theme === 'dark'
                      ? 'bg-status-ice text-nordic-950 shadow-[0_2px_8px_rgba(56,189,248,0.28)]'
                      : 'text-ink-muted hover:text-ink-primary hover:bg-surface-secondary'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 shrink-0" />
                  <span>{isFa ? 'شب' : 'Night'}</span>
                </button>
              </div>
            </div>

            {/* 4. Language Switcher */}
            <div className="group min-h-[54px] px-2.5 py-1.5 rounded-xl hover:bg-surface-secondary/85 flex items-center justify-between gap-3 transition-all duration-200 ease-out motion-reduce:transition-none">
              <div className="flex items-center gap-3 min-w-0 flex-1 text-start">
                <div
                  className={`${iconTileBaseClass} group-hover:border-gold-500/50 group-hover:bg-surface-interactive`}
                >
                  <Globe className="w-4 h-4 text-accent-amber shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-ink-primary group-hover:text-white leading-tight truncate transition-colors">
                    {isFa ? 'زبان بازی' : 'Language'}
                  </div>
                  <div className="text-[11px] text-ink-muted truncate mt-0.5">
                    {isFa ? 'فارسی / English' : 'English / فارسی'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-surface-canvas border border-border-subtle shrink-0">
                <button
                  type="button"
                  onClick={() => onSetLanguage('fa')}
                  className={`min-h-[44px] min-w-[54px] px-2.5 rounded-md text-xs font-bold transition-all duration-150 motion-reduce:transition-none cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/70 ${
                    lang === 'fa'
                      ? 'bg-gold-500 text-nordic-950 shadow-[0_2px_8px_rgba(245,158,11,0.28)]'
                      : 'text-ink-muted hover:text-ink-primary hover:bg-surface-secondary'
                  }`}
                >
                  فارسی
                </button>
                <button
                  type="button"
                  onClick={() => onSetLanguage('en')}
                  className={`min-h-[44px] min-w-[54px] px-2.5 rounded-md text-xs font-bold transition-all duration-150 motion-reduce:transition-none cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/70 ${
                    lang === 'en'
                      ? 'bg-gold-500 text-nordic-950 shadow-[0_2px_8px_rgba(245,158,11,0.28)]'
                      : 'text-ink-muted hover:text-ink-primary hover:bg-surface-secondary'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* 5. Sound & Ambience Toggle */}
            <button
              type="button"
              role="switch"
              aria-checked={isAudioOn}
              onClick={onToggleAudio}
              className={`${rowBaseClass} hover:bg-surface-secondary/90 active:bg-surface-interactive`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`${iconTileBaseClass} ${
                    isAudioOn
                      ? 'group-hover:border-status-ice/55 group-hover:bg-surface-ice-tint'
                      : 'group-hover:border-border-strong group-hover:bg-surface-interactive'
                  }`}
                >
                  {isAudioOn ? (
                    <Volume2 className="w-4 h-4 text-accent-ice shrink-0" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-ink-muted shrink-0" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-ink-primary group-hover:text-white leading-tight truncate transition-colors">
                    {isFa ? 'صدای بازی و محیط' : 'Sound & Ambience'}
                  </div>
                  <div className="text-[11px] text-ink-muted truncate mt-0.5">
                    {isAudioOn
                      ? isFa
                        ? 'موسیقی محیطی و افکت‌ها فعال'
                        : 'Viking ambience & SFX active'
                      : isFa
                        ? 'تمامی صداها بی‌صدا شده'
                        : 'All game audio muted'}
                  </div>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide border shrink-0 transition-colors duration-200 ${
                  isAudioOn
                    ? 'bg-gold-500/15 border-gold-500/45 text-accent-amber'
                    : 'bg-surface-canvas border-border-subtle text-ink-muted group-hover:text-ink-secondary'
                }`}
              >
                {isAudioOn ? (isFa ? 'روشن' : 'On') : isFa ? 'خاموش' : 'Off'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
