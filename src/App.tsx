import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  CloudRain,
  Coins,
  Compass,
  Flame,
  Heart,
  LayoutGrid,
  MapPin,
  Menu,
  Shield,
  Smile,
  Snowflake,
  Sun,
  Swords,
  Users,
  Wind,
  X,
} from 'lucide-react';
import { ActionsPanel } from './components/ActionsPanel';
import { CharacterCreation } from './components/CharacterCreation';
import { DeathSummaryModal } from './components/DeathSummaryModal';
import { DecisionModal } from './components/DecisionModal';
import { EmberCanvas } from './components/EmberCanvas';
import { Epilogue1066Modal } from './components/Epilogue1066Modal';
import { FamilyPanel } from './components/FamilyPanel';
import { HeaderMenuDropdown } from './components/HeaderMenuDropdown';
import {
  HonorToast,
  HonorToastPayload,
  SIGNIFICANT_HONOR_DELTA,
} from './components/HonorToast';
import { LifeFeed } from './components/LifeFeed';
import { MoreMenuPanel, RealmSection } from './components/MoreMenuPanel';
import { QuickGuideModal } from './components/QuickGuideModal';
import { RealmPanel } from './components/RealmPanel';
import { SagaChroniclePanel } from './components/SagaChroniclePanel';
import { SeasonalWeatherOverlay } from './components/SeasonalWeatherOverlay';
import { SettingsSaveModal } from './components/SettingsSaveModal';
import { StatBar } from './components/StatBar';
import { VikingMap } from './components/VikingMap';
import { VikingPortrait } from './components/VikingPortrait';
import { getSeasonalWeatherProfile, SETTLEMENTS_BY_ID } from './data/geography';
import { ALL_TRAITS_MAP } from './data/namesAndTraits';
import {
  advanceTurn,
  cancelBattle,
  claimSpecialTitle,
  continueAsHeir,
  createNewGame,
  DiplomacyApproach,
  dismiss1066Epilogue,
  dismissOnboarding,
  executeAppointJarlAction,
  executeBesiegeAction,
  executeBuildHoldingAction,
  executeCityConquestAction,
  executeDiplomacyAction,
  executeFamilyMemberInteraction,
  executeGeneralAction,
  executeLocalMarriageAction,
  executePlotAction,
  executeRaidAction,
  executeSailAction,
  executeSendSettlersAction,
  executeSetTributeBurdenAction,
  executeSettleAction,
  executeStationGarrisonAction,
  executeTakeHostagesAction,
  executeToggleReligiousToleranceAction,
  executeTrainSkillAction,
  FamilyInteractionType,
  getClaimableNextTitle,
  initiateBattle,
  NewGameParams,
  RaidTactic,
  resolveBattleTactic,
  resolveEventChoice,
  SiegeApproach,
} from './engine/gameEngine';
import {
  playSound,
  resumeAudioIfNeeded,
  stopAmbientSoundscape,
  syncAmbientSoundscape,
} from './engine/sound';
import {
  isSessionActive,
  loadAutosave,
  loadSettings,
  saveAutosave,
  saveLanguagePreference,
  saveSettings,
  setSessionActive,
} from './engine/storage';
import { formatPersonName, SETTLEMENTS_FA, TRAITS_FA } from './i18n/gameDataFa';
import {
  APP_SUBTITLE,
  APP_TITLE,
  EPITHET_FA,
  formatAgeLabel,
  isRtl,
  RELIGION_LABELS,
  SEASON_LABELS,
  SHORT_TITLE_LABELS,
  SKILL_LABELS,
  STAT_LABELS,
  TITLE_LABELS,
} from './i18n/ui';
import {
  BattleTactic,
  BuildingType,
  FullGameState,
  GameScreen,
  GameSettings,
  Language,
  PlotType,
  Religion,
  Season,
  Sex,
  SkillKey,
  SocialClass,
  TabId,
  TributeBurden,
} from './types/game';

export default function App() {
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const [savedPreview, setSavedPreview] = useState<FullGameState | null>(() => loadAutosave());
  const [gameState, setGameState] = useState<FullGameState | null>(() => {
    if (isSessionActive()) {
      const resumed = loadAutosave();
      if (resumed) return { ...resumed, settings: loadSettings() };
    }
    return null;
  });
  const [activeTab, setActiveTab] = useState<TabId>(TabId.Life);
  const [realmSection, setRealmSection] = useState<RealmSection>('holdings');
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [showMoreStats, setShowMoreStats] = useState<boolean>(false);
  const [isSecondaryStatsExpanded, setIsSecondaryStatsExpanded] = useState<boolean>(false);
  const [isMobileStatsSheetOpen, setIsMobileStatsSheetOpen] = useState<boolean>(false);
  const [honorToast, setHonorToast] = useState<HonorToastPayload | null>(null);
  const prevHonorSnapRef = useRef<{ sessionKey: string; honor: number } | null>(null);
  const suppressHonorToastRef = useRef<boolean>(false);

  useEffect(() => {
    setIsSecondaryStatsExpanded(false);
  }, [activeTab]);

  const handleDismissHonorToast = useCallback(() => {
    setHonorToast(null);
  }, []);

  const handleCloseHeaderMenu = useCallback(() => {
    setIsHeaderMenuOpen(false);
  }, []);

  const lang = settings.language;
  const isFa = lang === 'fa';
  const rtl = isRtl(lang);

  const isPlayingGame = Boolean(gameState && gameState.screen === GameScreen.PLAYING);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.dataset.textSize = settings.textSize;
  }, [lang, rtl, settings.textSize]);

  useEffect(() => {
    if (isPlayingGame && settings.ambientAudioEnabled) {
      syncAmbientSoundscape(true, settings.ambientVolume, gameState?.season);
    } else {
      stopAmbientSoundscape();
    }
  }, [isPlayingGame, settings.ambientAudioEnabled, settings.ambientVolume, gameState?.season]);

  useEffect(() => {
    return () => {
      stopAmbientSoundscape();
    };
  }, []);

  useEffect(() => {
    if (!isPlayingGame || !settings.ambientAudioEnabled) return;
    const handleUnlock = () => resumeAudioIfNeeded();
    window.addEventListener('pointerdown', handleUnlock, { passive: true });
    window.addEventListener('keydown', handleUnlock);
    return () => {
      window.removeEventListener('pointerdown', handleUnlock);
      window.removeEventListener('keydown', handleUnlock);
    };
  }, [isPlayingGame, settings.ambientAudioEnabled]);

  useEffect(() => {
    if (gameState && gameState.screen === GameScreen.PLAYING) {
      saveAutosave(gameState);
      setSavedPreview(gameState);
    }
  }, [gameState]);

  useEffect(() => {
    if (!gameState || gameState.screen !== GameScreen.PLAYING) {
      prevHonorSnapRef.current = null;
      suppressHonorToastRef.current = false;
      setHonorToast(null);
      return;
    }

    const sessionKey = `${gameState.seedString}:${gameState.generation}:${gameState.character.id}`;
    const currentHonor = Math.round(gameState.character.stats.honor);
    const prevSnap = prevHonorSnapRef.current;

    prevHonorSnapRef.current = { sessionKey, honor: currentHonor };

    if (suppressHonorToastRef.current) {
      suppressHonorToastRef.current = false;
      setHonorToast(null);
      return;
    }

    if (!prevSnap || prevSnap.sessionKey !== sessionKey) {
      setHonorToast(null);
      return;
    }

    const delta = currentHonor - prevSnap.honor;
    if (Math.abs(delta) >= SIGNIFICANT_HONOR_DELTA) {
      setHonorToast({
        id: Date.now() + Math.random(),
        delta,
        currentHonor,
      });

      if (!gameState.pendingDeath) {
        const soundEnabled = gameState.settings.soundEnabled;
        window.setTimeout(() => {
          playSound(delta > 0 ? 'honor' : 'dishonor', soundEnabled);
        }, 85);
      }
    }
  }, [gameState]);

  const handleUpdateSettings = (next: GameSettings) => {
    if (next.language !== settings.language) {
      saveLanguagePreference(next.language);
    }
    setSettings(next);
    saveSettings(next);
    if (gameState) {
      setGameState({ ...gameState, settings: next });
    }
  };

  const handleSetLanguage = (nextLang: Language) => {
    saveLanguagePreference(nextLang);
    handleUpdateSettings({ ...settings, language: nextLang });
  };

  const isAudioOn = settings.ambientAudioEnabled || settings.soundEnabled;

  const handleToggleGameAudio = () => {
    const nextAudio = !isAudioOn;
    if (nextAudio) {
      resumeAudioIfNeeded();
    }
    handleUpdateSettings({
      ...settings,
      ambientAudioEnabled: nextAudio,
      soundEnabled: nextAudio,
    });
  };

  const handleStartNewGame = (params: NewGameParams) => {
    suppressHonorToastRef.current = true;
    setIsHeaderMenuOpen(false);
    const fresh = createNewGame(params, settings);
    setSessionActive(true);
    playSound('honor', settings.soundEnabled);
    if (settings.ambientAudioEnabled) {
      syncAmbientSoundscape(true, settings.ambientVolume, fresh.season);
    }
    setGameState(fresh);
    setActiveTab(TabId.Life);
  };

  const handleResumeSaved = () => {
    const loaded = loadAutosave();
    if (loaded) {
      suppressHonorToastRef.current = true;
      setSessionActive(true);
      if (settings.ambientAudioEnabled) {
        syncAmbientSoundscape(true, settings.ambientVolume, loaded.season);
      }
      setGameState({ ...loaded, settings });
      setActiveTab(TabId.Life);
    }
  };

  const handleAdvanceTurn = useCallback(() => {
    setIsHeaderMenuOpen(false);
    setGameState((prev) => {
      if (!prev || prev.activeEvent || prev.pendingDeath || prev.pending1066Epilogue) return prev;
      playSound('advance', settings.soundEnabled);
      const next = advanceTurn(prev);
      if (next.pendingDeath) {
        playSound('death', settings.soundEnabled);
      }
      return next;
    });
    setActiveTab(TabId.Life);
  }, [settings.soundEnabled]);

  // Spacebar shortcut to Advance Year when playing with no modal open
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return;
      if (
        gameState &&
        gameState.screen === GameScreen.PLAYING &&
        !gameState.activeEvent &&
        !gameState.pendingDeath &&
        !gameState.pending1066Epilogue &&
        !isHeaderMenuOpen &&
        !isSettingsOpen &&
        !isGuideOpen
      ) {
        e.preventDefault();
        handleAdvanceTurn();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState, isHeaderMenuOpen, isSettingsOpen, isGuideOpen, handleAdvanceTurn]);

  const handleSelectEventChoice = (choiceId: string) => {
    if (!gameState) return;
    playSound('choice', settings.soundEnabled);
    const next = resolveEventChoice(gameState, choiceId);
    if (next.pendingDeath) playSound('death', settings.soundEnabled);
    setGameState(next);
  };

  const handleRaid = (targetId: string, tactic: RaidTactic) => {
    if (!gameState) return;
    playSound('raid', settings.soundEnabled);
    const next = executeRaidAction(gameState, targetId, tactic);
    if (next.pendingDeath) playSound('death', settings.soundEnabled);
    setGameState(next);
    setActiveTab(TabId.Life);
  };

  const handleConquerCity = (targetId?: string) => {
    if (!gameState) return;
    playSound('raid', settings.soundEnabled);
    const next = executeCityConquestAction(gameState, targetId);
    if (next.pendingDeath) playSound('death', settings.soundEnabled);
    setGameState(next);
    setActiveTab(TabId.Life);
  };

  const handleSail = (destId: string) => {
    if (!gameState) return;
    playSound('sail', settings.soundEnabled);
    const next = executeSailAction(gameState, destId);
    if (next.pendingDeath) playSound('death', settings.soundEnabled);
    setGameState(next);
  };

  const handleBesiege = (settlementId: string, approach: SiegeApproach) => {
    if (!gameState) return;
    playSound('raid', settings.soundEnabled);
    const next = executeBesiegeAction(gameState, settlementId, approach);
    if (next.pendingDeath) playSound('death', settings.soundEnabled);
    setGameState(next);
    setActiveTab(TabId.Life);
  };

  const handleSettle = (settlementId: string) => {
    if (!gameState) return;
    playSound('choice', settings.soundEnabled);
    const next = executeSettleAction(gameState, settlementId);
    setGameState(next);
    setActiveTab(TabId.Life);
  };

  const handleDiplomacy = (settlementId: string, approach: DiplomacyApproach) => {
    if (!gameState) return;
    playSound(approach === 'varangian_oath' ? 'honor' : 'choice', settings.soundEnabled);
    const next = executeDiplomacyAction(gameState, settlementId, approach);
    setGameState(next);
    setActiveTab(TabId.Life);
  };

  const handleMarryLocal = (settlementId: string) => {
    if (!gameState) return;
    playSound('honor', settings.soundEnabled);
    const next = executeLocalMarriageAction(gameState, settlementId);
    setGameState(next);
    setActiveTab(TabId.Life);
  };

  const handleGeneralAction = (
    actionType: Parameters<typeof executeGeneralAction>[1],
    extra?: string
  ) => {
    if (!gameState) return;
    playSound(actionType === 'claim_rank' ? 'honor' : 'choice', settings.soundEnabled);
    const next = executeGeneralAction(gameState, actionType, extra);
    if (next.pendingDeath) playSound('death', settings.soundEnabled);
    setGameState(next);
  };

  const handleTrainSkill = (skill: SkillKey) => {
    if (!gameState) return;
    playSound('choice', settings.soundEnabled);
    setGameState(executeTrainSkillAction(gameState, skill));
  };

  const handleBuildStructure = (settlementId: string, building: BuildingType) => {
    if (!gameState) return;
    playSound('honor', settings.soundEnabled);
    setGameState(executeBuildHoldingAction(gameState, settlementId, building));
  };

  const handleContinueWithHeir = (heirId: string) => {
    if (!gameState) return;
    suppressHonorToastRef.current = true;
    playSound('honor', settings.soundEnabled);
    setGameState(continueAsHeir(gameState, heirId));
    setActiveTab(TabId.Life);
  };

  const handleSendSettlers = (holdingId: string) => {
    if (!gameState) return;
    playSound('choice', settings.soundEnabled);
    setGameState(executeSendSettlersAction(gameState, holdingId));
  };

  const handleStationGarrison = (holdingId: string, count: number) => {
    if (!gameState) return;
    playSound('choice', settings.soundEnabled);
    setGameState(executeStationGarrisonAction(gameState, holdingId, count));
  };

  const handleSetTributeBurden = (holdingId: string, burden: TributeBurden) => {
    if (!gameState) return;
    playSound('choice', settings.soundEnabled);
    setGameState(executeSetTributeBurdenAction(gameState, holdingId, burden));
  };

  const handleAppointJarl = (holdingId: string) => {
    if (!gameState) return;
    playSound('honor', settings.soundEnabled);
    setGameState(executeAppointJarlAction(gameState, holdingId));
  };

  const handleTakeHostages = (holdingId: string) => {
    if (!gameState) return;
    playSound('honor', settings.soundEnabled);
    setGameState(executeTakeHostagesAction(gameState, holdingId));
  };

  const handleToggleTolerance = (holdingId: string) => {
    if (!gameState) return;
    playSound('choice', settings.soundEnabled);
    setGameState(executeToggleReligiousToleranceAction(gameState, holdingId));
  };

  const handleExecutePlot = (type: PlotType, targetSettlementId?: string) => {
    if (!gameState) return;
    playSound('raid', settings.soundEnabled);
    const next = executePlotAction(gameState, type, targetSettlementId);
    if (next.pendingDeath) playSound('death', settings.soundEnabled);
    setGameState(next);
  };

  const handleClaimSpecialTitle = (titleId: string) => {
    if (!gameState) return;
    playSound('honor', settings.soundEnabled);
    setGameState(claimSpecialTitle(gameState, titleId));
  };

  const handleResolveBattleTactic = (tactic: BattleTactic) => {
    if (!gameState) return;
    playSound('raid', settings.soundEnabled);
    const next = resolveBattleTactic(gameState, tactic);
    if (next.pendingDeath) playSound('death', settings.soundEnabled);
    setGameState(next);
  };

  const handleCancelBattle = () => {
    if (!gameState) return;
    playSound('choice', settings.soundEnabled);
    setGameState(cancelBattle(gameState));
  };

  const textScaleClass =
    settings.textSize === 'sm'
      ? 'text-sm'
      : settings.textSize === 'lg'
        ? 'text-lg'
        : 'text-base';

  if (!gameState || gameState.screen !== GameScreen.PLAYING) {
    return (
      <div
        dir={rtl ? 'rtl' : 'ltr'}
        className={`h-dvh max-h-dvh w-full flex flex-col overflow-hidden bg-[#0B1118] ${textScaleClass}`}
      >
        <EmberCanvas enabled={settings.emberAnimation} />
        <CharacterCreation
          lang={lang}
          onOpenGuide={() => setIsGuideOpen(true)}
          savedGame={savedPreview}
          onResumeSaved={handleResumeSaved}
          onStartNewGame={handleStartNewGame}
          onOpenLoadModal={() => setIsSettingsOpen(true)}
        />
        <QuickGuideModal
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
          lang={lang}
        />
        <SettingsSaveModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          currentState={gameState}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onLoadState={(loaded) => {
            suppressHonorToastRef.current = true;
            setSessionActive(true);
            if (settings.ambientAudioEnabled) {
              syncAmbientSoundscape(true, settings.ambientVolume);
            }
            setGameState({ ...loaded, screen: GameScreen.PLAYING, settings });
            setActiveTab(TabId.Life);
          }}
        />
      </div>
    );
  }

  const c = gameState.character;
  const r = gameState.realm;
  const currentLoc = SETTLEMENTS_BY_ID[c.locationId];
  const currentLocName = isFa
    ? SETTLEMENTS_FA[c.locationId]?.name ?? currentLoc?.name ?? c.locationId
    : currentLoc?.name.split(' (')[0] ?? c.locationId;
  const claimableTitle = getClaimableNextTitle(gameState);

  const rulerFullName = formatPersonName(`${c.givenName} ${c.patronymic}`, lang);
  const rulerEpithet = c.epithet
    ? isFa
      ? ` «${EPITHET_FA[c.epithet] ?? c.epithet}»`
      : ` "${c.epithet}"`
    : '';
  const fullDisplayName = `${rulerFullName}${rulerEpithet}`;
  const headerNameSizeClass =
    fullDisplayName.length > 34
      ? 'text-xs sm:text-base leading-snug'
      : fullDisplayName.length > 22
        ? 'text-[13px] sm:text-base leading-snug'
        : fullDisplayName.length > 15
          ? 'text-sm sm:text-lg leading-snug'
          : 'text-base sm:text-lg leading-snug';

  const tabTitles: Record<TabId, string> = isFa
    ? {
        [TabId.Life]: 'داستان زندگی',
        [TabId.Actions]: 'فعالیت‌های سالانه',
        [TabId.Realm]: realmSection === 'fleet' ? 'ناوگان و سپاه' : 'املاک و ساختمان‌ها',
        [TabId.Family]: 'خاندان و دشمنی‌ها',
        [TabId.Map]: 'نقشه دریاهای شمال',
        [TabId.Saga]: 'دستاوردها و میراث دودمان',
        [TabId.More]: 'بیشتر',
      }
    : {
        [TabId.Life]: 'Life Saga',
        [TabId.Actions]: 'Activities',
        [TabId.Realm]: realmSection === 'fleet' ? 'Fleet & Warband' : 'Holdings & Rank',
        [TabId.Family]: 'Family & Feuds',
        [TabId.Map]: 'Sea Chart',
        [TabId.Saga]: 'Achievements & Legacy',
        [TabId.More]: 'More',
      };

  const renderTraitsText = (traitIds: string[]) =>
    traitIds
      .map((tid) => (isFa ? TRAITS_FA[tid]?.name ?? ALL_TRAITS_MAP[tid]?.name ?? tid : ALL_TRAITS_MAP[tid]?.name ?? tid))
      .join(' · ');

  const weatherProfile = getSeasonalWeatherProfile(gameState.season, lang);

  const renderWeatherIcon = (s: Season) => {
    switch (s) {
      case Season.Winter:
        return <Snowflake className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />;
      case Season.Autumn:
        return <CloudRain className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />;
      case Season.Spring:
        return <Wind className="w-3.5 h-3.5 text-teal-300 shrink-0" />;
      case Season.Summer:
        return <Sun className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />;
    }
  };

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className={`h-dvh max-h-dvh overflow-hidden bg-[#0B1118] text-[#F1F5F9] flex flex-col select-none ${textScaleClass}`}
    >
      <EmberCanvas enabled={settings.emberAnimation} />
      <SeasonalWeatherOverlay
        season={gameState.season}
        enabled={settings.weatherOverlayEnabled}
      />
      <HonorToast
        toast={honorToast}
        lang={lang}
        onDismiss={handleDismissHonorToast}
      />

      {/* Clean Dark Nordic Game HUD Top Bar + Anchored Hamburger Popup */}
      <div className="relative z-40 shrink-0">
        <header className="relative z-40 w-full border-b border-[#1E2D40] bg-[#0F1722]/95 backdrop-blur-xs">
          <div className="max-w-6xl w-full mx-auto min-h-[62px] py-2 px-3 sm:px-5 lg:px-6 flex items-center justify-between gap-2.5 sm:gap-4">
            {/* Avatar + Full Character Name + Rank/Age Subtitle */}
            <button
              type="button"
              onClick={() => {
                setIsHeaderMenuOpen(false);
                setIsMobileStatsSheetOpen(true);
              }}
              className="flex-1 min-w-0 min-h-[44px] flex items-center gap-2.5 sm:gap-3 text-start rounded-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/70"
            >
              <div className="shrink-0">
                <VikingPortrait
                  age={c.age}
                  sex={c.sex}
                  traits={c.traits}
                  title={c.title}
                  appearance={c.appearance}
                  seedId={c.id}
                  size={44}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={`font-saga font-bold text-[#F1F5F9] whitespace-normal line-clamp-2 [overflow-wrap:anywhere] ${headerNameSizeClass}`}
                >
                  {fullDisplayName}
                </div>
                <div className="text-[11px] sm:text-xs text-[#94A3B8] leading-snug mt-0.5 whitespace-normal [overflow-wrap:anywhere]">
                  {SHORT_TITLE_LABELS[lang][c.title]} · {formatAgeLabel(c.age, lang)}
                </div>
              </div>
            </button>

            {/* Money/Coins Counter + Hamburger Menu Button */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div
                className="min-h-[44px] px-1.5 flex items-center gap-1.5 font-mono tabular-nums text-xs sm:text-sm"
                title={isFa ? `خزانه نقره: ${r.silver}` : `Silver Treasury: ${r.silver}`}
                aria-label={isFa ? `سکه نقره: ${r.silver}` : `Silver: ${r.silver}`}
              >
                <Coins className="w-4 h-4 text-[#F59E0B] shrink-0" />
                <span className="font-bold text-[#F1F5F9]">{r.silver}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  playSound('click', settings.soundEnabled);
                  setIsHeaderMenuOpen((prev) => !prev);
                }}
                aria-expanded={isHeaderMenuOpen}
                aria-haspopup="dialog"
                aria-label={isFa ? 'منوی بالای صفحه' : 'Game Menu'}
                className={`min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl border flex items-center justify-center transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/70 ${
                  isHeaderMenuOpen
                    ? 'bg-[#192A3E] border-[#F59E0B] text-[#F59E0B]'
                    : 'bg-[#131D2B] border-[#233246] hover:border-[#F59E0B]/70 text-[#F1F5F9]'
                }`}
              >
                {isHeaderMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        <div className="relative max-w-6xl w-full mx-auto">
          <HeaderMenuDropdown
            isOpen={isHeaderMenuOpen}
            onClose={handleCloseHeaderMenu}
            lang={lang}
            onSetLanguage={handleSetLanguage}
            season={gameState.season}
            weatherName={weatherProfile.weatherName}
            isMapActive={activeTab === TabId.Map}
            onSelectSeasonMap={() =>
              setActiveTab(activeTab === TabId.Map ? TabId.Life : TabId.Map)
            }
            isAudioOn={isAudioOn}
            onToggleAudio={handleToggleGameAudio}
            onOpenGuide={() => setIsGuideOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            year={gameState.year}
            hirdWarriors={r.hirdWarriors}
            fleetShips={r.longships + r.knarrs}
          />
        </div>
      </div>

      {/* Main Fixed-Height Game Stage */}
      <main className="relative z-10 flex-1 min-h-0 max-h-dvh overflow-hidden max-w-6xl w-full mx-auto px-0 py-0 sm:px-4 sm:py-3.5 lg:px-6 lg:py-4 flex gap-4 lg:gap-5">
        {/* Desktop Nordic Character Sheet */}
        <aside className="hidden lg:flex lg:w-72 xl:w-80 shrink-0 max-h-full flex-col justify-between p-4 rounded-2xl bg-[#0F1722]/94 border border-[#1E2D40] overflow-hidden text-start">
          <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pe-0.5">
            {/* Large Reactive Portrait Card */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#131D2B] border border-[#233246]">
              <VikingPortrait
                age={c.age}
                sex={c.sex}
                traits={c.traits}
                title={c.title}
                appearance={c.appearance}
                seedId={c.id}
                size={68}
              />
              <div className="min-w-0 space-y-1">
                <div className="text-xs font-bold text-[#38BDF8] truncate">
                  {SHORT_TITLE_LABELS[lang][c.title]}
                </div>
                <div className="text-xs text-[#F1F5F9] font-medium truncate">
                  {formatAgeLabel(c.age, lang)}
                </div>
                <div className="text-xs text-[#94A3B8] truncate">
                  {RELIGION_LABELS[lang][c.religion]}
                </div>
              </div>
            </div>

            {/* Location & Automatic Season Button */}
            <button
              type="button"
              onClick={() => setActiveTab(TabId.Map)}
              className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-[#131D2B] border border-[#233246] hover:border-[#38BDF8] flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer"
            >
              <span className="inline-flex items-center gap-1.5 text-[#F1F5F9] font-medium truncate">
                <MapPin className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                {currentLocName}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-[#94A3B8] shrink-0 whitespace-nowrap">
                {renderWeatherIcon(gameState.season)}
                <span>{SEASON_LABELS[lang][gameState.season]}</span>
              </span>
            </button>

            {claimableTitle && (
              <button
                type="button"
                onClick={() => handleGeneralAction('claim_rank')}
                className="w-full min-h-[44px] px-3 text-xs font-extrabold bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0B1118] rounded-xl cursor-pointer whitespace-nowrap transition-colors"
              >
                {isFa
                  ? `ارتقا به «${SHORT_TITLE_LABELS.fa[claimableTitle]}»!`
                  : `Rank Up: ${SHORT_TITLE_LABELS.en[claimableTitle]}!`}
              </button>
            )}

            {/* Secondary Stats & Traits */}
            <div className="space-y-2.5 pt-1 border-t border-[#1E2D40]">
              <div className="text-xs font-semibold text-[#94A3B8]">
                {isFa ? 'ویژگی‌های فرعی و مهارت‌ها' : 'Secondary Stats & Skills'}
              </div>
              <StatBar label={STAT_LABELS[lang].cunning} value={c.stats.cunning} compact lang={lang} />
              <StatBar label={STAT_LABELS[lang].charisma} value={c.stats.charisma} compact lang={lang} />
              <StatBar label={STAT_LABELS[lang].wyrd} value={c.stats.wyrd} compact lang={lang} />
              <StatBar label={STAT_LABELS[lang].faith} value={c.stats.faith} compact lang={lang} />

              {c.traits.length > 0 && (
                <div className="pt-2 border-t border-[#1E2D40] text-xs text-[#CBD5E1] leading-relaxed">
                  <span className="text-[#38BDF8] font-semibold">
                    {isFa ? 'ویژگی‌ها: ' : 'Traits: '}
                  </span>
                  {renderTraitsText(c.traits)}
                </div>
              )}

              <div className="pt-2 border-t border-[#1E2D40] grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs font-mono tabular-nums text-[#CBD5E1]">
                <span>
                  {SKILL_LABELS[lang].combat} {c.skills.combat}
                </span>
                <span>
                  {SKILL_LABELS[lang].seamanship} {c.skills.seamanship}
                </span>
                <span>
                  {SKILL_LABELS[lang].law} {c.skills.law}
                </span>
                <span>
                  {SKILL_LABELS[lang].trade} {c.skills.trade}
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0 pt-3 border-t border-[#1E2D40] flex items-center justify-between text-xs font-mono tabular-nums text-[#94A3B8]">
            <span>{isFa ? `مزرعه: ${r.landFarms}` : `Farms: ${r.landFarms}`}</span>
            <span>{isFa ? `شهرت: ${r.fame}` : `Fame: ${r.fame}`}</span>
          </div>
        </aside>

        {/* Center Game Play Box */}
        <section className="flex-1 min-w-0 flex flex-col min-h-0 max-h-full sm:rounded-2xl bg-[#0F1722]/90 border-x-0 border-b-0 sm:border border-[#1E2D40] overflow-hidden">
          {activeTab !== TabId.Life && (
            <div className="shrink-0 px-3.5 sm:px-5 py-2 border-b border-[#1E2D40] flex items-center justify-between gap-3 bg-[#131D2B]">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      activeTab === TabId.Realm || activeTab === TabId.Saga
                        ? TabId.More
                        : TabId.Life
                    )
                  }
                  className="min-h-[44px] px-3.5 rounded-xl bg-[#0B1118] hover:bg-[#19283B] border border-[#233246] hover:border-[#F59E0B]/65 text-xs font-bold text-[#F1F5F9] inline-flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/70"
                >
                  <ArrowLeft
                    className={`w-4 h-4 text-[#F59E0B] shrink-0 ${rtl ? 'rotate-180' : ''}`}
                  />
                  <span>{isFa ? 'بازگشت' : 'Back'}</span>
                </button>

                <h2 className="font-saga text-lg sm:text-xl font-bold text-[#F1F5F9] whitespace-normal break-words leading-snug">
                  {tabTitles[activeTab]}
                </h2>
              </div>
            </div>
          )}

          {/* Internally Scrollable Viewport (Full-height stage on Map; top-padded soft fade on secondary screens) */}
          <div
            className={
              activeTab === TabId.Life
                ? 'flex-1 min-h-0 overflow-y-auto px-3.5 py-4 sm:px-5 sm:py-5 select-text feed-scroll-mask'
                : activeTab === TabId.Map
                  ? 'flex-1 min-h-0 flex flex-col overflow-hidden select-none'
                  : 'flex-1 min-h-0 overflow-y-auto px-3.5 pt-5 pb-7 sm:px-5 sm:pt-6 sm:pb-8 select-text secondary-scroll-mask'
            }
          >
            {activeTab === TabId.Life && (
              <LifeFeed
                entries={gameState.lifeLog}
                lang={lang}
                onboardingStep={gameState.onboardingStep}
                onboardingDismissed={gameState.onboardingDismissed}
                onDismissOnboarding={() =>
                  setGameState((prev) => (prev ? dismissOnboarding(prev) : prev))
                }
              />
            )}

            {activeTab === TabId.Actions && (
              <ActionsPanel
                state={gameState}
                onGeneralAction={handleGeneralAction}
                onRaid={handleRaid}
                onSail={handleSail}
                onTrainSkill={handleTrainSkill}
                onConquerCity={handleConquerCity}
              />
            )}

            {activeTab === TabId.Realm && (
              <RealmPanel
                state={gameState}
                initialSection={realmSection}
                onClaimRank={() => handleGeneralAction('claim_rank')}
                onBuildShipOrHird={(act) => handleGeneralAction(act)}
                onBuildHoldingStructure={handleBuildStructure}
                onClearFirstFarm={() => handleGeneralAction('farm_settle')}
                onConquerCity={handleConquerCity}
                onSendSettlers={handleSendSettlers}
                onStationGarrison={handleStationGarrison}
                onSetTributeBurden={handleSetTributeBurden}
                onAppointJarl={handleAppointJarl}
                onTakeHostages={handleTakeHostages}
                onToggleTolerance={handleToggleTolerance}
                onExecutePlot={handleExecutePlot}
                onClaimSpecialTitle={handleClaimSpecialTitle}
                onResolveBattleTactic={handleResolveBattleTactic}
                onCancelBattle={handleCancelBattle}
              />
            )}

            {activeTab === TabId.Family && (
              <FamilyPanel
                state={gameState}
                onFamilyAction={(act, targetId) => handleGeneralAction(act, targetId)}
                onMemberInteraction={(personId: string, interaction: FamilyInteractionType) => {
                  playSound('click', settings.soundEnabled);
                  setGameState((prev) =>
                    prev ? executeFamilyMemberInteraction(prev, personId, interaction) : prev
                  );
                }}
              />
            )}

            {activeTab === TabId.Map && (
              <VikingMap
                state={gameState}
                onSailTo={handleSail}
                onRaidPort={handleRaid}
                onConquerCity={handleConquerCity}
                onTradeHere={() => handleGeneralAction('trade_voyage')}
                onBesiege={handleBesiege}
                onSettle={handleSettle}
                onDiplomacy={handleDiplomacy}
                onMarryLocal={handleMarryLocal}
              />
            )}

            {activeTab === TabId.Saga && <SagaChroniclePanel state={gameState} />}

            {activeTab === TabId.More && (
              <MoreMenuPanel
                state={gameState}
                onNavigateTab={(t, sec) => {
                  if (sec) setRealmSection(sec);
                  setActiveTab(t);
                }}
                onClaimRank={() => handleGeneralAction('claim_rank')}
              />
            )}
          </div>

          {activeTab === TabId.Life ? (
            <>
              {/* Expandable Secondary Stats Drawer (anchored right above the 4-stat bar) */}
              {showMoreStats && (
                <div className="shrink-0 px-3.5 sm:px-5 py-3 bg-[#131F30] border-t border-[#26384F] flex flex-col overflow-hidden space-y-2.5 text-start">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <StatBar label={STAT_LABELS[lang].cunning} value={c.stats.cunning} compact lang={lang} />
                    <StatBar label={STAT_LABELS[lang].charisma} value={c.stats.charisma} compact lang={lang} />
                    <StatBar label={STAT_LABELS[lang].wyrd} value={c.stats.wyrd} compact lang={lang} />
                    <StatBar label={STAT_LABELS[lang].faith} value={c.stats.faith} compact lang={lang} />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1E2D40] text-xs font-mono tabular-nums text-[#CBD5E1]">
                    <span className="leading-relaxed">
                      {SKILL_LABELS[lang].combat} {c.skills.combat} · {SKILL_LABELS[lang].seamanship}{' '}
                      {c.skills.seamanship} · {SKILL_LABELS[lang].trade} {c.skills.trade} ·{' '}
                      {SKILL_LABELS[lang].law} {c.skills.law}
                    </span>
                    {c.traits.length > 0 && (
                      <span className="font-sans text-xs text-[#38BDF8] font-medium break-words">
                        {renderTraitsText(c.traits)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Fixed Bottom 4-Stat Bar (Health, Honor, Power, Joy) + Labeled Expand Toggle */}
              <div className="shrink-0 px-3.5 sm:px-5 py-2.5 sm:py-3 bg-[#101926] border-t border-[#1E2D40] flex items-center gap-3">
                <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-x-3.5 gap-y-2.5 sm:gap-4 text-start">
                  <StatBar
                    label={isFa ? 'سلامتی' : 'Health'}
                    value={c.stats.health}
                    compact
                    isDangerWhenLow
                    accent="health"
                    icon={<Heart className="w-3.5 h-3.5" />}
                    lang={lang}
                  />
                  <StatBar
                    label={isFa ? 'شرافت' : 'Honor'}
                    value={c.stats.honor}
                    compact
                    isDangerWhenLow
                    accent="honor"
                    icon={<Shield className="w-3.5 h-3.5" />}
                    lang={lang}
                  />
                  <StatBar
                    label={isFa ? 'قدرت' : 'Power'}
                    value={c.stats.strength}
                    compact
                    isDangerWhenLow
                    accent="strength"
                    icon={<Swords className="w-3.5 h-3.5" />}
                    lang={lang}
                  />
                  <StatBar
                    label={isFa ? 'شادی' : 'Joy'}
                    value={c.stats.happiness}
                    compact
                    isDangerWhenLow
                    accent="happiness"
                    icon={<Smile className="w-3.5 h-3.5" />}
                    lang={lang}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowMoreStats((v) => !v)}
                  aria-expanded={showMoreStats}
                  aria-label={
                    showMoreStats
                      ? isFa
                        ? 'بستن مهارت‌ها و آمار فرعی'
                        : 'Hide secondary stats & skills'
                      : isFa
                        ? 'نمایش مهارت‌ها و آمار فرعی'
                        : 'Show secondary stats & skills'
                  }
                  title={
                    showMoreStats
                      ? isFa
                        ? 'بستن مهارت‌ها، ویژگی‌ها و آمار فرعی'
                        : 'Hide secondary stats, skills & traits'
                      : isFa
                        ? 'نمایش مهارت‌ها، ویژگی‌ها و آمار فرعی'
                        : 'Show secondary stats, skills & traits'
                  }
                  className={`min-w-[58px] sm:min-w-[88px] min-h-[48px] px-2.5 py-1.5 rounded-xl border flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 text-xs font-semibold shrink-0 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]/70 ${
                    showMoreStats
                      ? 'bg-[#18293E] border-[#38BDF8]/55 text-[#38BDF8]'
                      : 'bg-[#152234] hover:bg-[#1C2D44] border-[#26384F] text-[#CBD5E1] hover:text-[#F8FAFC]'
                  }`}
                >
                  {showMoreStats ? (
                    <ChevronDown className="w-4 h-4 shrink-0" />
                  ) : (
                    <ChevronUp className="w-4 h-4 shrink-0" />
                  )}
                  <span className="leading-tight whitespace-nowrap">
                    {showMoreStats ? (isFa ? 'بستن' : 'Hide') : isFa ? 'مهارت‌ها' : 'Skills'}
                  </span>
                </button>
              </div>
            </>
          ) : !isSecondaryStatsExpanded ? (
            /* Slim Single-Row Stat Bar in Secondary Screens (Tap to Expand) */
            <button
              type="button"
              onClick={() => setIsSecondaryStatsExpanded(true)}
              aria-expanded={false}
              aria-label={
                isFa
                  ? 'نمایش کامل نوارهای وضعیت و مهارت‌ها'
                  : 'Expand full character stats and skills'
              }
              className="shrink-0 w-full min-h-[44px] px-3 sm:px-5 py-1.5 bg-[#101926] hover:bg-[#142032] border-t border-[#1E2D40] flex items-center justify-between gap-2.5 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/70"
            >
              <div className="flex-1 min-w-0 grid grid-cols-4 gap-2 sm:gap-4 items-center">
                {[
                  {
                    key: 'health',
                    val: Math.max(0, Math.min(100, Math.round(c.stats.health))),
                    icon: <Heart className="w-3.5 h-3.5 shrink-0" />,
                    tone: c.stats.health < 30 ? 'text-rose-400' : 'text-emerald-400',
                    fill: c.stats.health < 30 ? 'fill-rose-500' : 'fill-emerald-400',
                  },
                  {
                    key: 'honor',
                    val: Math.max(0, Math.min(100, Math.round(c.stats.honor))),
                    icon: <Shield className="w-3.5 h-3.5 shrink-0" />,
                    tone: c.stats.honor < 30 ? 'text-rose-400' : 'text-amber-300',
                    fill: c.stats.honor < 30 ? 'fill-rose-500' : 'fill-amber-300',
                  },
                  {
                    key: 'strength',
                    val: Math.max(0, Math.min(100, Math.round(c.stats.strength))),
                    icon: <Swords className="w-3.5 h-3.5 shrink-0" />,
                    tone: c.stats.strength < 30 ? 'text-rose-400' : 'text-indigo-300',
                    fill: c.stats.strength < 30 ? 'fill-rose-500' : 'fill-indigo-400',
                  },
                  {
                    key: 'happiness',
                    val: Math.max(0, Math.min(100, Math.round(c.stats.happiness))),
                    icon: <Smile className="w-3.5 h-3.5 shrink-0" />,
                    tone: c.stats.happiness < 30 ? 'text-rose-400' : 'text-sky-400',
                    fill: c.stats.happiness < 30 ? 'fill-rose-500' : 'fill-sky-400',
                  },
                ].map((st) => (
                  <div key={st.key} className="flex items-center gap-1.5 min-w-0">
                    <span className={st.tone}>{st.icon}</span>
                    <div className="flex-1 min-w-[20px] h-1.5 rounded-full bg-[#1A2738] overflow-hidden">
                      <svg
                        viewBox="0 0 100 6"
                        preserveAspectRatio="none"
                        className="w-full h-full block"
                        aria-hidden="true"
                      >
                        <rect
                          x={rtl ? 100 - st.val : 0}
                          y="0"
                          width={st.val}
                          height="6"
                          className={st.fill}
                        />
                      </svg>
                    </div>
                    <span className="text-xs font-mono tabular-nums text-[#E2E8F0] shrink-0">
                      {st.val}
                    </span>
                  </div>
                ))}
              </div>

              <ChevronUp className="w-4 h-4 text-[#94A3B8] shrink-0" />
            </button>
          ) : (
            /* Expanded Stat Drawer in Secondary Screens (Tap button to collapse back to slim row) */
            <div className="shrink-0 bg-[#101926] border-t border-[#26384F] flex flex-col overflow-hidden text-start">
              <div className="px-3.5 sm:px-5 py-2.5 border-b border-[#1E2D40] flex items-center gap-3">
                <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-x-3.5 gap-y-2.5 sm:gap-4">
                  <StatBar
                    label={isFa ? 'سلامتی' : 'Health'}
                    value={c.stats.health}
                    compact
                    isDangerWhenLow
                    accent="health"
                    icon={<Heart className="w-3.5 h-3.5" />}
                    lang={lang}
                  />
                  <StatBar
                    label={isFa ? 'شرافت' : 'Honor'}
                    value={c.stats.honor}
                    compact
                    isDangerWhenLow
                    accent="honor"
                    icon={<Shield className="w-3.5 h-3.5" />}
                    lang={lang}
                  />
                  <StatBar
                    label={isFa ? 'قدرت' : 'Power'}
                    value={c.stats.strength}
                    compact
                    isDangerWhenLow
                    accent="strength"
                    icon={<Swords className="w-3.5 h-3.5" />}
                    lang={lang}
                  />
                  <StatBar
                    label={isFa ? 'شادی' : 'Joy'}
                    value={c.stats.happiness}
                    compact
                    isDangerWhenLow
                    accent="happiness"
                    icon={<Smile className="w-3.5 h-3.5" />}
                    lang={lang}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsSecondaryStatsExpanded(false)}
                  aria-expanded={true}
                  aria-label={isFa ? 'جمع‌کردن نوار وضعیت' : 'Collapse stats bar'}
                  className="min-w-[56px] min-h-[44px] px-2.5 py-1.5 rounded-xl bg-[#18293E] border border-[#38BDF8]/55 text-[#38BDF8] flex flex-col sm:flex-row items-center justify-center gap-1 text-xs font-semibold shrink-0 cursor-pointer transition-colors"
                >
                  <ChevronDown className="w-4 h-4 shrink-0" />
                  <span>{isFa ? 'بستن' : 'Slim'}</span>
                </button>
              </div>

              <div className="px-3.5 sm:px-5 py-2.5 bg-[#131F30] space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatBar label={STAT_LABELS[lang].cunning} value={c.stats.cunning} compact lang={lang} />
                  <StatBar label={STAT_LABELS[lang].charisma} value={c.stats.charisma} compact lang={lang} />
                  <StatBar label={STAT_LABELS[lang].wyrd} value={c.stats.wyrd} compact lang={lang} />
                  <StatBar label={STAT_LABELS[lang].faith} value={c.stats.faith} compact lang={lang} />
                </div>
                <div className="pt-1.5 border-t border-[#1E2D40] text-xs font-mono tabular-nums text-[#CBD5E1] leading-relaxed">
                  {SKILL_LABELS[lang].combat} {c.skills.combat} · {SKILL_LABELS[lang].seamanship}{' '}
                  {c.skills.seamanship} · {SKILL_LABELS[lang].trade} {c.skills.trade} ·{' '}
                  {SKILL_LABELS[lang].law} {c.skills.law}
                </div>
              </div>
            </div>
          )}

          {/* Iconic Viking BitLife Control Dock */}
          <div className="shrink-0 px-2 sm:px-4 py-2.5 bg-[#0B1118] border-t border-[#1E2D40] grid grid-cols-5 items-center gap-1.5 sm:gap-2.5">
            <button
              type="button"
              onClick={() =>
                setActiveTab(activeTab === TabId.Actions ? TabId.Life : TabId.Actions)
              }
              className={`min-h-[54px] px-1 rounded-xl flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === TabId.Actions
                  ? 'bg-[#18293E] text-[#38BDF8] ring-1 ring-[#38BDF8]/35'
                  : 'text-[#CBD5E1] hover:text-[#F8FAFC] hover:bg-[#131D2B]'
              }`}
            >
              <Swords className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
              <span className="truncate max-w-full">{isFa ? 'فعالیت‌ها' : 'Activities'}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTab(activeTab === TabId.Family ? TabId.Life : TabId.Family)
              }
              className={`min-h-[54px] px-1 rounded-xl flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === TabId.Family
                  ? 'bg-[#18293E] text-[#38BDF8] ring-1 ring-[#38BDF8]/35'
                  : 'text-[#CBD5E1] hover:text-[#F8FAFC] hover:bg-[#131D2B]'
              }`}
            >
              <Users className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
              <span className="truncate max-w-full">{isFa ? 'خاندان' : 'Kin'}</span>
            </button>

            {/* Center Giant NEXT YEAR Button */}
            <button
              type="button"
              onClick={handleAdvanceTurn}
              disabled={Boolean(
                gameState.activeEvent || gameState.pendingDeath || gameState.pending1066Epilogue
              )}
              className="min-h-[58px] px-2 bg-[#F59E0B] hover:bg-[#FBBF24] active:scale-95 disabled:opacity-50 text-[#0B1118] rounded-2xl shadow-[0_0_24px_rgba(245,158,11,0.35)] flex flex-col items-center justify-center transition-all cursor-pointer"
            >
              <Flame className="w-5 h-5 sm:w-[22px] sm:h-[22px] fill-current" />
              <span className="text-xs sm:text-sm font-extrabold tracking-tight leading-none mt-1 whitespace-nowrap">
                {isFa ? 'سال بعد' : 'Next Year'}
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTab(activeTab === TabId.Map ? TabId.Life : TabId.Map)
              }
              className={`min-h-[54px] px-1 rounded-xl flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === TabId.Map
                  ? 'bg-[#18293E] text-[#38BDF8] ring-1 ring-[#38BDF8]/35'
                  : 'text-[#CBD5E1] hover:text-[#F8FAFC] hover:bg-[#131D2B]'
              }`}
            >
              <Compass className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
              <span className="truncate max-w-full">{isFa ? 'نقشه' : 'Map'}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  activeTab === TabId.More || activeTab === TabId.Realm || activeTab === TabId.Saga
                    ? TabId.Life
                    : TabId.More
                )
              }
              className={`min-h-[54px] px-1 rounded-xl flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors cursor-pointer relative whitespace-nowrap ${
                activeTab === TabId.More || activeTab === TabId.Realm || activeTab === TabId.Saga
                  ? 'bg-[#18293E] text-[#38BDF8] ring-1 ring-[#38BDF8]/35'
                  : 'text-[#CBD5E1] hover:text-[#F8FAFC] hover:bg-[#131D2B]'
              }`}
            >
              <LayoutGrid className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
              <span className="truncate max-w-full">{isFa ? 'بیشتر' : 'More'}</span>
              {claimableTitle && (
                <span className="absolute top-1.5 end-2.5 w-2 h-2 rounded-xs bg-[#F59E0B]" />
              )}
            </button>
          </div>
        </section>
      </main>

      {/* Character Profile Sheet (Tap portrait in header) */}
      {isMobileStatsSheetOpen && (
        <div
          className="fixed inset-0 z-50 max-h-dvh overflow-hidden bg-[#05080D]/85 backdrop-blur-xs flex flex-col items-center justify-center p-3 sm:p-4"
          onClick={() => setIsMobileStatsSheetOpen(false)}
        >
          <div
            className="w-full max-w-lg max-h-[min(88dvh,700px)] flex flex-col overflow-hidden bg-[#0F1722] border border-[#283B52] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.88)] text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[#1E2D40] bg-[#121C2B] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <VikingPortrait
                  age={c.age}
                  sex={c.sex}
                  traits={c.traits}
                  title={c.title}
                  appearance={c.appearance}
                  seedId={c.id}
                  size={58}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-saga text-xl sm:text-2xl font-bold text-[#F1F5F9] break-words leading-snug">
                    {rulerFullName}
                    {rulerEpithet}
                  </h3>
                  <p className="text-xs text-[#94A3B8] break-words leading-snug mt-0.5">
                    {TITLE_LABELS[lang][c.title]} · {currentLocName} ·{' '}
                    {RELIGION_LABELS[lang][c.religion]}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileStatsSheetOpen(false)}
                aria-label={isFa ? 'بستن مشخصات' : 'Close profile'}
                className="min-w-[44px] min-h-[44px] rounded-xl bg-[#182638] hover:bg-[#21334A] border border-[#2A3E59] flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] shrink-0 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-4 space-y-4">
              {claimableTitle && (
                <button
                  type="button"
                  onClick={() => {
                    handleGeneralAction('claim_rank');
                    setIsMobileStatsSheetOpen(false);
                  }}
                  className="w-full min-h-[46px] px-4 text-xs sm:text-sm font-extrabold bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0B1118] rounded-xl cursor-pointer whitespace-nowrap transition-colors"
                >
                  {isFa
                    ? `ارتقا به «${SHORT_TITLE_LABELS.fa[claimableTitle]}»!`
                    : `Rank Up: ${SHORT_TITLE_LABELS.en[claimableTitle]}!`}
                </button>
              )}

            <div className="grid grid-cols-2 gap-3">
              <StatBar
                label={STAT_LABELS[lang].health}
                value={c.stats.health}
                compact
                isDangerWhenLow
                accent="health"
                lang={lang}
              />
              <StatBar
                label={STAT_LABELS[lang].honor}
                value={c.stats.honor}
                compact
                accent="honor"
                lang={lang}
              />
              <StatBar
                label={STAT_LABELS[lang].strength}
                value={c.stats.strength}
                compact
                accent="strength"
                lang={lang}
              />
              <StatBar
                label={STAT_LABELS[lang].happiness}
                value={c.stats.happiness}
                compact
                isDangerWhenLow
                accent="happiness"
                lang={lang}
              />
              <StatBar label={STAT_LABELS[lang].cunning} value={c.stats.cunning} compact lang={lang} />
              <StatBar label={STAT_LABELS[lang].charisma} value={c.stats.charisma} compact lang={lang} />
              <StatBar label={STAT_LABELS[lang].wyrd} value={c.stats.wyrd} compact lang={lang} />
              <StatBar label={STAT_LABELS[lang].faith} value={c.stats.faith} compact lang={lang} />
            </div>

            <div className="pt-2 border-t border-[#1E2D40] grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono tabular-nums text-[#94A3B8]">
              <span>
                {SKILL_LABELS[lang].combat} {c.skills.combat}
              </span>
              <span>
                {SKILL_LABELS[lang].seamanship} {c.skills.seamanship}
              </span>
              <span>
                {SKILL_LABELS[lang].law} {c.skills.law}
              </span>
              <span>
                {SKILL_LABELS[lang].trade} {c.skills.trade}
              </span>
              <span>
                {SKILL_LABELS[lang].diplomacy} {c.skills.diplomacy}
              </span>
              <span>
                {SKILL_LABELS[lang].skaldcraft} {c.skills.skaldcraft}
              </span>
            </div>

            {c.traits.length > 0 && (
              <div className="text-xs text-[#94A3B8]">
                <span className="text-[#38BDF8] font-medium">
                  {isFa ? 'ویژگی‌ها: ' : 'Traits: '}
                </span>
                {renderTraitsText(c.traits)}
              </div>
            )}
            </div>
          </div>
        </div>
      )}

      {/* Event Decision Modal */}
      {gameState.activeEvent && (
        <DecisionModal
          event={gameState.activeEvent}
          state={gameState}
          onSelectChoice={handleSelectEventChoice}
        />
      )}

      {/* Death Obituary & Heir Succession Modal */}
      {gameState.pendingDeath && (
        <DeathSummaryModal
          state={gameState}
          onContinueWithHeir={handleContinueWithHeir}
          onQuickNewLife={() => {
            const randomSeed = `SAGA-${Math.floor(1000 + Math.random() * 9000)}`;
            const randomSex = Math.random() < 0.5 ? Sex.Male : Sex.Female;
            const quickLocations = ['kaupang', 'hedeby', 'jorvik', 'reykjavik', 'dublin', 'birka'];
            const locId = quickLocations[Math.floor(Math.random() * quickLocations.length)];
            const malePool = ['Ragnar', 'Bjorn', 'Harald', 'Leif', 'Erik', 'Ivar', 'Sigurd'];
            const femalePool = ['Freydis', 'Astrid', 'Sigrid', 'Lagertha', 'Thyra', 'Gudrid'];
            const givenName =
              randomSex === Sex.Male
                ? malePool[Math.floor(Math.random() * malePool.length)]
                : femalePool[Math.floor(Math.random() * femalePool.length)];
            const classes = [SocialClass.Karl, SocialClass.Bonde, SocialClass.HersirKin, SocialClass.Thrall];
            const socialClass = classes[Math.floor(Math.random() * classes.length)];
            handleStartNewGame({
              givenName,
              sex: randomSex,
              startAge: 16,
              socialClass,
              birthplaceId: locId,
              year: 790 + Math.floor(Math.random() * 140),
              religion: Religion.NorsePagan,
              traits: ['brave', 'seafarer'],
              winGoalId: 'freeform_dynasty',
              seedString: randomSeed,
            });
          }}
          onEndDynastyAndRestart={() => {
            setSessionActive(false);
            setGameState(null);
          }}
        />
      )}

      {/* 1066 AD End of the Viking Age Epilogue Modal */}
      {gameState.pending1066Epilogue && !gameState.activeEvent && !gameState.pendingDeath && (
        <Epilogue1066Modal
          state={gameState}
          onContinueFreeMode={() => {
            playSound('honor', settings.soundEnabled);
            setGameState((prev) => (prev ? dismiss1066Epilogue(prev) : prev));
          }}
          onStartNewSaga={() => {
            setSessionActive(false);
            setGameState(null);
          }}
        />
      )}

      {/* Quick Gameplay Guide & Viking Glossary Modal */}
      <QuickGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        lang={lang}
      />

      {/* Save Slots & Settings Modal */}
      <SettingsSaveModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentState={gameState}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onLoadState={(loaded) => {
          suppressHonorToastRef.current = true;
          setSessionActive(true);
          if (settings.ambientAudioEnabled) {
            syncAmbientSoundscape(true, settings.ambientVolume);
          }
          setGameState({ ...loaded, screen: GameScreen.PLAYING, settings });
          setActiveTab(TabId.Life);
        }}
        onReturnToTitle={() => {
          setSessionActive(false);
          setGameState(null);
        }}
      />
    </div>
  );
}
