# Saga of Crowns (حماسه‌ی تاج‌ها) — Project State Report

*Generated from live repository inspection, AST/module analysis, and automated check scripts (`npm run check:contrast`, `npm run check:colors`, `npm run check:legends`, `npm run lint`, `npm run build`). Zero numbers below are estimated from memory.*

---

## 1. Overview

### What the Game Is
**Saga of Crowns** (*حماسه‌ی تاج‌ها*, internal storage prefix `eldsaga_`) is a bilingual (Persian RTL default + English LTR), single-player, BitLife-inspired Viking Age dynasty, life, and realm simulation set from **793 AD** (the raid on Lindisfarne) through **1066 AD** (Stamford Bridge & Hastings) with open-ended dynasty continuation beyond 1066.

Players create a custom ruler or select one of **13 historical/saga premade characters** (including the *Ragnarsættin* bloodline of Ragnar Lothbrok), advance year by year, resolve branching life and historical set-piece events, sail across **55 settlements** in **13 geographic regions**, lead tactical coastal raids and multi-round sieges, manage estates/buildings/tribute/unrest, recruit armies and fleets, weave court plots, and track **22 historical & saga figures** in the **Living Legend Calendar ("Saga Mode")**.

### Tech Stack & Versions (from `package.json`)
| Layer | Package | Version |
| :--- | :--- | :--- |
| UI Runtime | `react` / `react-dom` | `^19.0.1` |
| Bundler & Dev Server | `vite` / `@vitejs/plugin-react` | `^8.3.0` (`v8.3.5` resolved) / `^6.1.1` |
| Styling | `tailwindcss` / `@tailwindcss/vite` | `^4.3.3` |
| Animation | `motion` | `^12.23.24` |
| Icons | `lucide-react` | `^0.546.0` |
| Type Checker / Runner | `typescript` / `tsx` | `~7.0.2` / `^4.21.0` |
| Audio | Browser Web Audio API (`src/engine/sound.ts`) | Procedural synthesis (0 external audio files) |
| Persistence | Browser `localStorage` + `sessionStorage` + Base64 `ELDSAGA1:` | Client-only (`SAVE_VERSION = 2`) |

### How to Run, Build & Verify
```bash
npm install                # Install dependencies
npm run dev                # Start Vite dev server on http://0.0.0.0:3000
npm run lint               # TypeScript type-check (tsc --noEmit)
npm run build              # Production bundle to dist/ (vite build)
npm run check:colors       # Verify 0 hard-coded hex/palette classes in components
npm run check:contrast     # Compute WCAG 2.1 contrast ratios for Light & Dark themes
npm run check:legends      # Validate 22 legends, 56 beats, and settlement references
```

### Complete Folder Map with Computed Line Counts & File Sizes
Total source/text lines across 56 text files: **46,204 lines**.
*(Files over 1,500 lines are flagged with **[LARGE FILE]**).*

| File Path | Lines | Size (KB) | Size (Bytes) | Role / Notes |
| :--- | ---: | ---: | ---: | :--- |
| `src/engine/gameEngine.ts` | 5,689 | 244.8 KB | 250,677 B | **[LARGE FILE]** Core turn loop, combat, raids, economy, succession, AI/unrest |
| `src/components/VikingMap.tsx` | 4,187 | 182.8 KB | 187,238 B | **[LARGE FILE]** Interactive SVG pan/zoom map, 5 lenses, 8-tab settlement sheet |
| `src/data/events.ts` | 2,754 | 106.6 KB | 109,114 B | **[LARGE FILE]** 53 core events + 20 historical Viking events + aggregator (`ALL_EVENTS` = 222) |
| `src/data/bitlifeEvents.ts` | 2,591 | 101.3 KB | 103,720 B | **[LARGE FILE]** 108 `makeQuickEvent` BitLife-style life events across 9 life stages |
| `src/data/geography.ts` | 2,504 | 101.5 KB | 103,977 B | **[LARGE FILE]** 55 settlements, 61 sea routes, 21 rivers, 20 landmass polygons, weather |
| `src/components/FamilyPanel.tsx` | 2,394 | 122.2 KB | 125,085 B | **[LARGE FILE]** Kinship cards, romance, marriage, divorce, holmgang, 10 interactions |
| `src/components/RealmPanel.tsx` | 2,287 | 110.6 KB | 113,281 B | **[LARGE FILE]** Estates ledger, fleet/quartermaster, plots, tactical battle modal |
| `src/data/lothbrokCycle.ts` | 2,222 | 142.8 KB | 146,259 B | **[LARGE FILE]** 8 bloodline branches, 9 heirlooms, 9 chapters, 19 Lothbrok events + FA |
| `src/data/legendsRegistry.ts` | 1,984 | 116.0 KB | 118,804 B | **[LARGE FILE]** 22 historical/legendary figures and 56 dated timeline beats |
| `src/i18n/bitlifeEventsFa.ts` | 1,591 | 93.5 KB | 95,763 B | **[LARGE FILE]** Persian translations for all 108 `BITLIFE_EVENTS` |
| `src/App.tsx` | 1,408 | 55.2 KB | 56,489 B | Top-level shell, header, 5-tab dock, stat strip, audio sync, modals |
| `src/data/namesAndTraits.ts` | 1,402 | 50.6 KB | 51,841 B | Names by region, 28 traits, 8 titles, 6 buildings, 11 military units, 13 premades |
| `src/components/ActionsPanel.tsx` | 1,396 | 62.3 KB | 63,746 B | Yearly activities: Raiding, Sailing, Trade, Training, Religion, Special Decisions |
| `src/i18n/eventsFa.ts` | 1,396 | 119.5 KB | 122,411 B | Persian translations for `CORE_LIFE_EVENTS`, `HISTORICAL_VIKING_EVENTS`, etc. (`222` total) |
| `src/i18n/gameDataFa.ts` | 1,266 | 71.4 KB | 73,112 B | Persian dictionary for names, rulers (137), settlements (55), traits, goals, chronicles |
| `src/components/CharacterCreation.tsx` | 1,219 | 57.5 KB | 58,924 B | Start screen, custom ruler builder, 13 premade heroes, Saga Mode toggle, saved game resume |
| `src/components/CityModal.tsx` | 1,217 | 54.7 KB | 55,991 B | Detailed city management modal opened from `RealmPanel` estates ledger |
| `src/components/HallOfLegendsPanel.tsx` | 994 | 45.6 KB | 46,729 B | Living Legends directory, filters, bio/sources, timeline beats, Orðstírr & oaths ledger |
| `src/components/SagaSharePosterModal.tsx` | 982 | 37.8 KB | 38,714 B | 9:16 HTML5 Canvas Instagram Story generator & PNG downloader |
| `src/components/SagaChroniclePanel.tsx` | 867 | 40.0 KB | 40,990 B | Saga overview, Lothbrok 9-chapter tracker, Hefnd meter, heirlooms, ancestors, divergences |
| `src/components/SagaBadgeSystem.tsx` | 856 | 34.4 KB | 35,223 B | 30 BitLife achievements & 13 historical milestones grid |
| `src/types/game.ts` | 836 | 17.7 KB | 18,119 B | Core TypeScript types and enums |
| `src/engine/legendEngine.ts` | 772 | 26.5 KB | 27,135 B | Distance-delayed news propagation, rumors/corrections, Orðstírr rank, skaldic elegies |
| `src/data/legendEncounters.ts` | 771 | 63.7 KB | 65,277 B | 7 interactive face-to-face legend encounter events + inline Persian translations |
| `src/data/historicalTimeline.ts` | 768 | 34.2 KB | 35,068 B | 15 interactive historical set-pieces + 24 passive `WORLD_CHRONICLES` |
| `src/i18n/ui.ts` | 729 | 32.4 KB | 33,137 B | Bilingual UI labels, formatting helpers, Persian digits (`toPersianDigits`) |
| `src/data/deathsAndAchievements.ts` | 711 | 33.9 KB | 34,749 B | 24 illustrated death archetypes, 12 life report titles, 30 achievements |
| `src/components/SettingsSaveModal.tsx` | 694 | 28.6 KB | 29,326 B | 3 save slots, `ELDSAGA1:` import/export, theme/language/difficulty/intensity settings |
| `src/engine/sound.ts` | 663 | 22.0 KB | 22,538 B | Web Audio procedural SFX + seasonal ambient drone/hearth/wind synthesizer |
| `src/components/MoreMenuPanel.tsx` | 591 | 25.5 KB | 26,073 B | Secondary hub with 7 bottom sheets (Legends, Holdings, Fleet, Intrigue, Rank, Badges, Lineage) |
| `src/components/NorseMotifs.tsx` | 572 | 16.7 KB | 17,124 B | SVG knotwork, rune dividers, military unit glyphs, `NorseBottomSheet` |
| `src/components/LifeFeed.tsx` | 538 | 21.5 KB | 22,012 B | Chronological feed grouped by year, category filters, provenance badges, onboarding banner |
| `src/components/HeaderMenuDropdown.tsx` | 530 | 23.1 KB | 23,672 B | Top bar menu with quick badges, save/settings, guide, poster, and restart |
| `src/engine/storage.ts` | 370 | 11.4 KB | 11,638 B | `localStorage` autosave, 3 slots, `migrateGameState` (`v1 -> v2`), Base64 import/export |
| `src/components/NordicControls.tsx` | 362 | 11.7 KB | 11,965 B | Custom Norse select dropdowns and segmented controls |
| `src/components/VikingPortrait.tsx` | 347 | 12.0 KB | 12,270 B | Reactive procedural SVG portrait (ages, hair/beard, crowns, scars, `one_eyed` eyepatch) |
| `src/components/DecisionModal.tsx` | 325 | 11.7 KB | 11,980 B | Branching event modal with skill/stat/silver gates, provenance notes, Hefnd badges |
| `src/components/DeathSummaryModal.tsx` | 318 | 14.8 KB | 15,191 B | Valhalla obituary card, legacy score, heir succession picker, quick new life |
| `src/index.css` | 310 | 7.5 KB | 7,662 B | Single-source `@theme` semantic tokens for Daylight (`light`) and Night (`dark`) modes |
| `tools/contrast-check.mjs` | 240 | 8.6 KB | 8,815 B | Automated WCAG 2.1 contrast verifier across all token pairs |
| `src/components/SeasonalWeatherOverlay.tsx` | 229 | 7.4 KB | 7,599 B | Seasonal snow/rain/sunbeams/leaves overlay |
| `src/components/HonorToast.tsx` | 197 | 6.0 KB | 6,192 B | Floating notification when Honor changes by `>= 4` |
| `src/components/Epilogue1066Modal.tsx` | 184 | 8.0 KB | 8,223 B | End of the Viking Age (1066 AD) summary & free-play continuation modal |
| `tools/check-legends.mjs` | 176 | 5.3 KB | 5,478 B | Validator for `LEGENDS_REGISTRY` dates, monotonic beats, and settlement IDs |
| `src/components/StatBar.tsx` | 149 | 4.2 KB | 4,331 B | Progress bar for personal stats |
| `src/components/EventCategoryIcon.tsx` | 132 | 3.2 KB | 3,251 B | Category badge icons for life feed and decision modal |
| `src/components/QuickGuideModal.tsx` | 109 | 4.6 KB | 4,677 B | Gameplay guide & Old Norse glossary modal |
| `src/components/EmberCanvas.tsx` | 107 | 2.9 KB | 2,947 B | HTML5 canvas rising hearth embers background |
| `README.md` | 78 | 4.8 KB | 4,924 B | Project documentation |
| `src/engine/prng.ts` | 71 | 1.9 KB | 1,971 B | Mulberry32 deterministic PRNG (`SeededRNG`) |
| `tools/check-colors.mjs` | 51 | 1.6 KB | 1,667 B | Linter that fails if any component uses hard-coded hex or Tailwind palette classes |
| `package.json` | 36 | 0.9 KB | 920 B | Scripts and dependencies |
| `index.html` | 30 | 1.6 KB | 1,657 B | App entry HTML (`lang="fa" dir="rtl" data-theme="light"`) |
| `tsconfig.json` | 29 | 0.5 KB | 561 B | TypeScript configuration |
| `vite.config.ts` | 26 | 0.8 KB | 791 B | Vite + React + Tailwind v4 configuration |
| `docs/THEMING.md` | 12 | 1.5 KB | 1,517 B | 12-line theming constitution |
| `metadata.json` | 8 | 0.4 KB | 367 B | AI Studio applet metadata |
| `src/main.tsx` | 6 | 0.2 KB | 159 B | React root mount |
| `src/assets/images/*.jpg` (2 files) | BIN | 1,633.7 KB | 1,672,952 B | Hearth fire (`872.1 KB`) & longship dusk (`761.6 KB`) background artwork |
| `public/assets/aistudio/*.png` (10 files) | BIN | 1,442.5 KB | 1,477,266 B | Historical development screenshots |

---

## 2. State Model

### Core Game State (`FullGameState` in `src/types/game.ts`)
- **Identity & Determinism**: `saveVersion` (`2`), `screen` (`CREATION | PLAYING | DYNASTY_OVER`), `seedString` (e.g., `HRAFN-4821`), `rngState` (32-bit unsigned integer for Mulberry32), `year` (`793+`), `season` (`Spring | Summer | Autumn | Winter`), `generation` (`1+`), `dynastyName`, `winGoalId`, `winGoalAchievedYear`.
- **Turn & Pacing Locks**: `actionsRemainingThisTurn` (reset to `2` each year), `yearlyActivitiesUsed` (`Partial<Record<'trade' | 'train' | 'raid' | 'travel' | 'settle', boolean>>`), `builtThisYear` (`boolean`), `familyInteractionsUsed` (`Record<personId, boolean>`).
- ** Saga & Lothbrok Thread**: `sagaMode` (`boolean`), `legendState` (`LegendWorldState` tracking `deliveredBeatIds`, `rumorQueue`, `correctedBeatIds`, `standings`, `divergedBeatIds`, `memorializedLegendIds`, `lastPaidIntelYear`), `ragnarBloodline` (`boolean`), `bloodlineBranch` (`'ivar' | 'bjorn' | 'halfdan' | 'ubba' | 'sigurd' | 'hvitserk' | 'lagertha' | 'aslaug'`), `hefndMeter` (`0–100`), `heirlooms` (`string[]`), `lothbrokChaptersCompleted` (`string[]`).
- **World & Politics**: `discoveredSettlements` (`string[]`), `settlementStatuses` (`Record<settlementId, 'independent' | 'tributary' | 'conquered' | 'rebellious'>`), `tributaries` (`string[]`), `activePlots` (`ActivePlot[]`), `activeBattle` (`BattleState | null`), `specialTitles` (`string[]`), `flags` (`string[]`), `divergences` / `divergencesFa` (`string[]`), `scheduledChains` (`ScheduledChain[]`), `firedUniqueEvents` (`string[]`).
- **Character (`CharacterState`)**: `id`, `givenName`, `patronymic`, `epithet`, `sex`, `age`, `birthYear`, `birthplaceId`, `locationId`, `socialClass` (`thrall | karl | bonde | hersir_kin | jarl_kin | royal`), `title` (`Thrall` through `Overking of the North Sea`), `religion` (`Norse Pagan | Prime-Signed (Syncretic) | Christian | Islam | Slavic Pagan`), `traits` (`string[]`), `stats` (`health`, `strength`, `cunning`, `charisma`, `honor`, `wyrd`, `faith`, `happiness`, all clamped `0–100`), `skills` (`combat`, `seamanship`, `farming`, `trade`, `diplomacy`, `law`, `craft`, `skaldcraft`, `seidr`, all clamped `0–100`), `appearance` (`skinTone`, `hairColor`, `hairStyle`, `beardStyle`), `isOutlawed`, `raidsLed`, `voyagesCompleted`, `killsInHolmgang`, `thingsAttended`.
- **Realm (`RealmState`)**: `silver`, `landFarms`, `hirdWarriors`, `longships`, `knarrs`, `foodStores`, `population`, `stability` (`0–100`), `fame`, `tradeNetworks`, `holdings` (`Holding[]` with `settlementId`, `farms`, `buildings`, `garrison`, `unrest`, `norsePopulationShare`, `tributeBurden`, `appointedJarl`, `hostagesCount`, `localMarriageAlliance`, `religiousTolerance`), `thrallsOwned`, plus quartermaster breakdown (`bondiSpearmen`, `huscarls`, `norseArchers`, `berserkers`, `snekkjas`, `warhorses`, `packHorses`, `warGearTier`).
- **History & UI Queue**: `relationships` (`RelationshipPerson[]`), `ancestors` (`DynastyAncestor[]`), `achievements` (`string[]`), `lifeLog` (`LogEntry[]`, capped at last `160` entries on save), `activeEvent` (`GameEvent | null`), `lastOutcomeBanner`, `pendingDeath` (`PendingDeathState | null`), `pending1066Epilogue` (`boolean`), `epilogue1066Shown` (`boolean`), `freeModeAfter1066` (`boolean`), `settings` (`GameSettings`).

### How a Turn / Year Advances (`advanceTurn` in `src/engine/gameEngine.ts`, lines 949–1583)
1. **Guard Check**: Returns immediately if `state.activeEvent` or `state.pendingDeath` is active.
2. **Clock & PRNG Init**: Instantiates `new SeededRNG(state.rngState)`, increments `year` by `+1`, and ages `character.age` by `+1`.
3. **Annual Economy & Holdings Loop**:
   - Computes grain harvest (`landFarms * (8 + farming * 0.12) * warmPeriodBonus` where `year >= 950` gives `1.15x`), thrall food/silver, and warrior food upkeep (`hirdWarriors * 0.55`).
   - Iterates every `Holding`: applies building bonuses (`kaupang_market` +18 silver, `skali_hall` +3 fame/+6 stability, `ring_fortress` +8 stability/-5 unrest, `boathouse_naust` -50% ship upkeep, `pagan_hof`/`stave_church` faith/honor), calculates tribute income (`none: 0`, `light: 1`, `normal: 4`, `heavy: 10`, `extortionate: 18`), updates `unrest` (`0–100`), and triggers armed rebellion if `unrest >= 90` (either suppressed by garrison or holding is lost and marked `'rebellious'`).
   - Collects trade income (`tradeNetworks * (6 + floor(trade * 0.14))`) and tributary Danegeld (`round(baseWealth * 4.5)` per tributary).
   - Deducts fleet and hird silver upkeep; if `grossSilver < totalUpkeep`, `2–5` warriors desert and stability drops by `-10`.
   - Applies starvation penalty (`-6` Health, `-6` Happiness) if `foodStores === 0`.
4. **Kin Aging & Natural Childbirth**:
   - If the player (`age 18–48`) has a living spouse (`age <= 44`), rolls a `24%` chance for a new child (`Child`, `isHeirEligible: true`).
   - Ages all living `relationships` by `+1` year and rolls age-based mortality (`0.8%` under 57, `5%` at 57–68, `14%` over 68). If a close relative dies while `ragnarBloodline` is active, `hefndMeter` increases by `+8`.
5. **Heirloom Passives & Hefnd Bleed**:
   - Grants passive annual bonuses for owned heirlooms (`bragarfull_horn_lejre`, `fang_of_fafnir`, `ragnar_serpent_armring`, `lagertha_hlathgerd_spear`, `floki_raven_lodestone`).
   - If `ragnarBloodline` (or `wolf_blood`) and `hefndMeter >= 68`, bleeds `-3` Honor and `-2` Wyrd until English settlements are raided or conquered.
6. **Character Aging & Mortality Check**:
   - Youth growth (`age 12–24`: `+1..3` Strength) and elder decay (`age >= 48`: `-1..4` Health; `age >= 64`: `-3..7` Health; `age >= 55`: `-1..2` Strength).
   - Checks death by `health <= 0` or old-age hazard (`age >= 58`, scaled by `Difficulty` multiplier `0.55x / 1.0x / 1.45x`), calling `triggerDeathState` if fatal.
7. **World Chronicles, Win Goals & 1066 Epilogue**:
   - Injects any matching `WORLD_CHRONICLES` entry for `nextYear`.
   - Resets `actionsRemainingThisTurn = 2`, `yearlyActivitiesUsed = {}`, `builtThisYear = false`, `familyInteractionsUsed = {}`.
   - Evaluates `evaluateAchievements` and `WIN_GOALS`. Sets `pending1066Epilogue = true` on reaching `1066 AD` for the first time.
8. **Living Legends Engine (`processYearlyLegends`)**:
   - Queues due timeline beats from `LEGENDS_REGISTRY` with distance-based delay (`0–2` seasons), delivers matured rumors/eyewitness accounts/skaldic elegies into `lifeLog`, and unlocks encounter flags (`met_ragnar`, `met_lagertha`, `met_floki`, etc.).
9. **Interactive Event Selection & Automatic Season**:
   - Priority order: (1) due `scheduledChains`, (2) eligible `'Historical Set-Piece'` (`88%` trigger chance), (3) weighted pick from eligible `ALL_EVENTS` (dampening recently fired events by `0.15x`).
   - Calls `pickAutomaticSeason` (e.g. `Summer` for raiding/voyages, `Winter` for illness/feasts) so seasons match the narrative without manual season-switching exploits.
   - Commits `rng.getState()` to `updatedState.rngState`.

### Randomness & Persistence (`src/engine/prng.ts` & `src/engine/storage.ts`)
- **PRNG**: `hashSeedString(seed)` uses FNV-1a (`2166136261`) to seed a Mulberry32 generator (`SeededRNG`). Every gameplay roll advances `state.rngState` deterministically.
- **Storage Keys**:
  - `eldsaga_autosave_v1` (`localStorage`): Automatic save after every state update during `GameScreen.PLAYING` (trims `lifeLog` to last 160 items).
  - `eldsaga_slot_v1_1`, `eldsaga_slot_v1_2`, `eldsaga_slot_v1_3` (`localStorage`): Manual save slots with `SaveSlotSummary` metadata.
  - `eldsaga_settings_v1` (`localStorage`): Serialized `GameSettings`.
  - `eldsaga_lang_pref_v1` (`localStorage`): `'fa'` (default) or `'en'`.
  - `eldsaga_theme_pref_v2` (`localStorage`): `'light'` (default) or `'dark'`.
  - `eldsaga_session_active_v1` (`sessionStorage`): `'1'` while actively playing so page reloads resume the active game instead of dropping to the start screen.
- **Save Versioning & Migration**: `CURRENT_SAVE_VERSION = 2`. `migrateGameState(raw)` upgrades v1 saves or `ELDSAGA1:` Base64 strings non-destructively by deriving missing `appearance`, deduplicating `lifeLog`/`relationships`/`ancestors`, and backfilling v2 fields (`sagaMode`, `hefndMeter`, `heirlooms`, `lothbrokChaptersCompleted`, `yearlyActivitiesUsed`, `epilogue1066Shown`, etc.).

---

## 3. Systems Implemented

| System | Status | Key Files & Functions | How It Works (One-Line Summary) |
| :--- | :---: | :--- | :--- |
| **Life Events & Branching Choices** | **DONE** | `src/data/events.ts`, `src/data/bitlifeEvents.ts`, `src/engine/gameEngine.ts` (`evaluateEventConditions`, `isEventEligible`, `resolveEventChoice`) | Filters 222 events by age, era, year range, class, title, religion, traits, flags, and settlement, then applies stat/skill/realm deltas, injury/death rolls, and follow-up event chains. |
| **Aging, Stats, Skills & Death** | **DONE** | `src/engine/gameEngine.ts` (`advanceTurn`, `triggerDeathState`), `src/data/deathsAndAchievements.ts` (`resolveDeathCardDetails`, `evaluateLifeReportTitle`) | Ages the character each year with youth strength gains, elder health decay, 8 personal stats, 9 skills, and 24 illustrated BitLife-style death archetypes. |
| **Family, Marriage, Feuds & Heirs** | **DONE** | `src/components/FamilyPanel.tsx`, `src/engine/gameEngine.ts` (`executeGeneralAction`, `executeFamilyMemberInteraction`, `continueAsHeir`) | Supports courting, marriage, peace-marriage with blood enemies, concubines, threshold divorce, child adoption, holmgang duels, 10 per-member interactions, and multi-generational heir succession. |
| **Realm, Holdings & Unrest** | **DONE** | `src/components/RealmPanel.tsx`, `src/components/CityModal.tsx`, `src/engine/gameEngine.ts` (`executeBuildHoldingAction`, `executeSetTributeBurdenAction`, `executeAppointJarlAction`, `executeTakeHostagesAction`, `executeToggleReligiousToleranceAction`, `executeSendSettlersAction`, `executeStationGarrisonAction`) | Tracks per-city farms, 6 building types, garrison, Norse population share, tribute burden (`none` to `extortionate`), and `0–100%` unrest that triggers armed rebellion at `90%+`. |
| **Recruitment, Ships & Stables** | **DONE** | `src/data/namesAndTraits.ts` (`MILITARY_CATALOG`), `src/engine/gameEngine.ts` (`executeGeneralAction`) | Lets players recruit Bondi spearmen, Hird huscarls, archers, and berserkers, build Snekkjas, Longships, and Knarrs, and buy warhorses, pack horses, and forged war-gear tiers. |
| **Coastal Raids** | **DONE** | `src/components/ActionsPanel.tsx`, `src/components/VikingMap.tsx`, `src/engine/gameEngine.ts` (`executeRaidAction`) | Resolves raids using 3 tactics (`blitz`, `pillage`, `cautious`) against target defense, yielding silver, fame, thralls, or injury/casualties, with bonus modifiers against English settlements for Ragnar's bloodline. |
| **Sailing & Sea Voyages** | **DONE** | `src/data/geography.ts` (`calculateVoyageMetrics`), `src/engine/gameEngine.ts` (`executeSailAction`) | Computes nautical distance, travel days, and seasonal storm hazard between ports, moves the player's location, increments `voyagesCompleted`, and unlocks neighboring ports on arrival. |
| **Sieges (3 Approaches)** | **DONE** | `src/components/VikingMap.tsx`, `src/engine/gameEngine.ts` (`executeBesiegeAction`) | Besieges fortified settlements via `starve` (blockade), `storm` (ladders/rams), or `extort` (Danegeld), either conquering the city or extracting heavy silver tribute. |
| **City Conquest & Tactical Battles** | **DONE** | `src/components/RealmPanel.tsx`, `src/engine/gameEngine.ts` (`executeCityConquestAction`, `initiateBattle`, `resolveBattleTactic`) | Provides both direct city assault and a multi-round tactical battle engine with 7 tactics (`shield_wall`, `svinfylking`, `ambush`, `flank_assault`, `feigned_retreat`, `berserk_charge`, `orderly_retreat`) tracking morale and casualties. |
| **Diplomacy & Tributaries** | **DONE** | `src/components/VikingMap.tsx`, `src/engine/gameEngine.ts` (`executeDiplomacyAction`, `executeLocalMarriageAction`) | Enables `trade_pact`, `demand_tribute` (turning a city into an annual Danegeld tributary), `alliance`, and local noble marriage alliances (`-25` unrest). |
| **Intrigue & Plots** | **DONE** | `src/components/RealmPanel.tsx`, `src/engine/gameEngine.ts` (`executePlotAction`) | Executes 4 covert plot actions (`assassination`, `poisoning`, `bribe_thing` to clear outlawry, and `mass_reprisal` to crush holding unrest to 0% at the cost of Honor). |
| **Religion & Faith** | **DONE** | `src/components/ActionsPanel.tsx`, `src/engine/gameEngine.ts` (`executeGeneralAction`: `'hold_blot'`, `'convert_faith'`) | Supports holding a Great Blót sacrifice (`-15` silver, `+Faith/Honor/Stability`) and converting between Norse Paganism, Prime-Signed Syncretism, and Christianity. |
| **Trade & Cargo Expeditions** | **DONE** | `src/components/ActionsPanel.tsx`, `src/engine/gameEngine.ts` (`executeGeneralAction`: `'trade_voyage'`) | Runs merchant expeditions scaled by Knarrs, trade networks, and `trade` skill, with higher multipliers in major emporia (Hedeby, Birka, Kaupang, Miklagard, Baghdad). |
| **Saga Mode & Legend Calendar** | **PARTIAL** | `src/data/legendsRegistry.ts`, `src/data/legendEncounters.ts`, `src/engine/legendEngine.ts` (`processYearlyLegends`) | **Engine & 22-legend registry DONE** (56 timeline beats); **Phase 1** has 25 beats and 7 interactive encounters (Ragnar 3, Lagertha 2, Floki 2, Brother Aldwin 0), whereas **Phases 2 & 3** (18 legends) have 1–3 anchor beats each and **0 interactive encounter events** yet. |
| **Word from the Lands (News Engine)** | **DONE** | `src/engine/legendEngine.ts` (`calculateNewsDelaySeasons`, `pickNewsSourceType`, `executePayForLegendNewsAction`), `src/components/LifeFeed.tsx` | Propagates legend timeline beats with geographic delay (`0–2` seasons), source provenance (`EYEWITNESS`, `TRADER_TALE`, `SKALD_SONG`, `MONK_CHRONICLE`), distant rumor distortion + later correction, and paid trader intel (`12` silver). |
| **Hall of Legends & Orðstírr** | **DONE** | `src/components/HallOfLegendsPanel.tsx`, `src/engine/legendEngine.ts` (`getLegendOrdstirrScore`, `getLegendOrdstirrRank`, `applyLegendStandingDelta`) | Displays all 22 legends with fog-of-war states (`unknown`, `rumored`, `known`, `memorialized`), historical sources, standing (`-100` to `+100`), oaths/feuds/gifts ledger, and player Orðstírr rank (`UNHEARD_OF` to `IMMORTAL_IN_SONG`). |
| **Ragnar Thread & Hefnd Meter** | **DONE** | `src/data/lothbrokCycle.ts`, `src/components/SagaChroniclePanel.tsx`, `src/engine/gameEngine.ts` | Tracks 8 Ragnar bloodline branches, 9 named saga heirlooms, a 9-chapter Lothbrok Saga cycle (`793–878 AD`), and the `0–100` *Hefnd* (blood-vengeance debt) meter that penalizes passivity and rewards raiding/conquering England. |
| **Progressive Map Unlocks** | **DONE** | `src/engine/gameEngine.ts` (`getNearbyDiscoveredIds`, `executeSailAction`, `executeGeneralAction`: `'explore_west'`) | In Saga Mode, new games start with only the home `regionGroup` discovered; sailing to ports, hiring trader intel, or launching western expeditions progressively reveals neighboring regions, Iceland, Greenland, and Vínland. |

---

## 4. Content Inventory (Computed via `tsx` over `src/data/*` & `src/i18n/*`)

### Events Breakdown
| Event Collection | Source File | Computed Count | Notes |
| :--- | :--- | ---: | :--- |
| `CORE_LIFE_EVENTS` | `src/data/events.ts` | **53** | Handwritten branching Viking life events |
| `HISTORICAL_VIKING_EVENTS` | `src/data/events.ts` | **20** | Handwritten era/year-gated historical events |
| `HISTORICAL_SET_PIECE_EVENTS` | `src/data/historicalTimeline.ts` | **15** | Major interactive historical set-pieces (793–1066) |
| `BITLIFE_EVENTS` (`makeQuickEvent`) | `src/data/bitlifeEvents.ts` | **108** | Quick-builder events across 9 life categories (Childhood, Thrall, Farm, Romance, Feud, Sea, Court, Mystic, Elder) |
| `LOTHBROK_CYCLE_EVENTS` | `src/data/lothbrokCycle.ts` | **9** | Multi-chapter Ragnar Lothbrok & Great Heathen Army cycle events |
| `LOTHBROK_SIGNATURE_EVENTS` | `src/data/lothbrokCycle.ts` | **10** | Character-specific signature events for Ragnar's kin |
| `LEGEND_ENCOUNTER_EVENTS` | `src/data/legendEncounters.ts` | **7** | Face-to-face encounters with Ragnar (3), Lagertha (2), Floki (2) |
| **`ALL_EVENTS` (Total Interactive)** | `src/data/events.ts` | **222** | Exact total interactive branching events in the engine pool |
| `WORLD_CHRONICLES` (Passive) | `src/data/historicalTimeline.ts` | **24** | Passive year-locked historical news entries (`793` to `1066 AD`) |
| **Grand Total Events + Chronicles** | All event modules | **246** | `222` interactive + `24` passive world chronicles |

### Settlements per Region (`55` Total in `src/data/geography.ts`)
- **By `RegionGroup` (13 regions)**:
  - `British Isles`: **10** (`lindisfarne`, `jorvik`, `london`, `winchester`, `repton`, `maldon`, `stamford_bridge`, `ionia_monastery`, `birsay`, `kirkwall`)
  - `North Atlantic`: **7** (`torshavn`, `reykjavik`, `thingvellir`, `borg`, `brattahlid`, `helluland`, `vinland`)
  - `Kievan Rus & Rivers`: **6** (`staraya_ladoga`, `novgorod`, `gniezdovo`, `polotsk`, `kiev`, `itil`)
  - `Ireland`: **5** (`dublin`, `wexford`, `waterford`, `limerick`, `isle_of_man`)
  - `Denmark`: **4** (`hedeby`, `ribe`, `jelling`, `roskilde`)
  - `Continent`: **4** (`dorestad`, `rouen`, `paris`, `noirmoutier`)
  - `Baltic`: **4** (`wollin`, `truso`, `grobin`, `reval`)
  - `Iberia & Al-Andalus`: **4** (`lisbon`, `seville`, `cadiz`, `algeciras`)
  - `Sweden`: **3** (`birka`, `uppsala`, `gotland_visby`)
  - `Mediterranean`: **3** (`luna`, `pisa`, `palermo`)
  - `Norway`: **2** (`kaupang`, `nidaros`)
  - `Serkland & Caliphate`: **2** (`bardha`, `baghdad`)
  - `Miklagard & East`: **1** (`constantinople`)
- **By `SettlementType` (8 types)**: `capital` (**11**), `trading_post` (**10**), `jarldom_seat` (**8**), `town` (**7**), `city` (**7**), `village` (**5**), `monastery` (**4**), `fortress` (**3**).
- **Cartography Vectors**: `SEA_ROUTES`: **61**, `NAVIGABLE_RIVERS`: **21**, `LANDMASS_POLYGONS`: **20**, `INLAND_LAKES`: **5**, `MOUNTAIN_RANGES`: **7**.

### Legends & Timeline Beats (`22` Legends, `56` Beats in `src/data/legendsRegistry.ts`)
| Phase | Legends | Beats | Interactive Encounters | Breakdown by Legend (`beats / encounters`) |
| :--- | ---: | ---: | ---: | :--- |
| **Phase 1** (Core Circle) | **4** | **25** | **7** | `ragnar_lothbrok` (8 / 3), `lagertha_shieldmaiden` (6 / 2), `floki_raven_sailor` (7 / 2), `brother_aldwin_scribe` (4 / 0) |
| **Phase 2** (Sons & Kin) | **8** | **17** | **0** | `ivar_boneless` (3 / 0), `halfdan_ragnarsson` (3 / 0), `aslaug_kraka` (2 / 0), `rollo_normandy` (2 / 0), `bjorn_ironside` (2 / 0), `ubba_ragnarsson` (2 / 0), `hvitserk_ragnarsson` (2 / 0), `sigurd_snake_eye` (1 / 0) |
| **Phase 3** (Kings & Rivals) | **10** | **14** | **0** | `king_horik_denmark` (2 / 0), `king_ecbert_wessex` (2 / 0), `king_aella_northumbria` (2 / 0), `alfred_the_great` (2 / 0), `hastein_loire` (1 / 0), `guthrum_danelaw` (1 / 0), `charles_the_simple` (1 / 0), `count_odo_paris` (1 / 0), `harald_fairhair` (1 / 0), `rurik_of_ladoga` (1 / 0) |
| **Total** | **22** | **56** | **7** | Validated by `npm run check:legends` (`0` errors) |

### Unlocks, Badges, Heirlooms & Catalogs
- **Saga Heirlooms (`SAGA_HEIRLOOMS`)**: **9** (`aslaug_unwoven_shirt`, `hrafnsmerki_banner`, `serpent_of_the_wash`, `fang_of_fafnir`, `bragarfull_horn_lejre`, `shield_of_ironside`, `ragnar_serpent_armring`, `lagertha_hlathgerd_spear`, `floki_raven_lodestone`).
- **Lothbrok Bloodline Branches (`LOTHBROK_BLOODLINE_BRANCHES`)**: **8** (`ivar`, `bjorn`, `halfdan`, `ubba`, `sigurd`, `hvitserk`, `lagertha`, `aslaug`).
- **Lothbrok Saga Chapters (`LOTHBROK_CHAPTER_METADATA`)**: **9** chapters (`ch1_lindisfarne` through `ch9_danelaw`).
- **BitLife Achievements / Saga Badges (`BITLIFE_ACHIEVEMENTS`)**: **30** badges.
- **Historical Era Milestones (`HISTORICAL_MILESTONES`)**: **13** milestones.
- **Emergent Special Titles (`checkSpecialTitles`)**: **6** claimable realm crowns (`jarl_of_orkney`, `danelaw_lord`, `duke_of_normandy`, `varangian_commander`, `prince_of_rus`, `king_of_norway`).
- **Title Rank Ladder (`TITLE_LADDER`)**: **8** ranks (`Thrall`, `Freeman`, `Hirdman`, `Huscarl`, `Captain`, `Jarl`, `Konungr`, `Overking of the North Sea`).
- **Traits (`ALL_TRAITS_MAP`)**: **28** total (**14** `SELECTABLE_TRAITS` + **14** `SCAR_AND_CONDITION_TRAITS`).
- **Death Archetypes (`DEATH_TYPES`)**: **24** illustrated death cards + **12** life report titles (`evaluateLifeReportTitle`).
- **Win Goals (`WIN_GOALS`)**: **11** dynasty victory ambitions.
- **Premade Characters (`PREMADE_CHARACTERS`)**: **13** playable historical/saga figures.
- **Estate Buildings (`BUILDINGS_CATALOG`)**: **6** (`skali_hall`, `boathouse_naust`, `ring_fortress`, `kaupang_market`, `pagan_hof`, `stave_church`).
- **Military Quartermaster Catalog (`MILITARY_CATALOG`)**: **11** items (`bondi_spearmen`, `hird_huscarls`, `norse_archers`, `berserkers`, `snekkja`, `longship_dreki`, `knarr`, `thralls`, `warhorses`, `pack_horses`, `forged_war_gear`).

### Persian Translation Coverage & Audit of Missing Keys
| Domain | Total Items | Persian Translated | Coverage | Missing Keys / Notes |
| :--- | ---: | ---: | :---: | :--- |
| Interactive Events (`ALL_EVENTS` in `EVENTS_FA`) | 222 | 222 | **100%** | `0` missing events; `0` missing choices across all 222 events |
| Passive World Chronicles (`WORLD_CHRONICLES_FA`) | 24 | 24 | **100%** | `0` missing |
| Settlements (`SETTLEMENTS_FA`) | 55 | 55 | **100%** | `0` missing (all names, regions, and historical summaries translated) |
| Historical Rulers (`formatRulerName`) | 137 | 137 | **100%** | `0` missing across all `controllersByEra.ruler` entries |
| Legends & Beats (`LEGENDS_REGISTRY`) | 22 / 56 | 22 / 56 | **100%** | Every legend and beat has inline `*Fa` fields (`nameFa`, `bioFa`, `titleFa`, `newsTextFa`, etc.) |
| Saga Heirlooms (`SAGA_HEIRLOOMS`) | 9 | 9 | **100%** | Inline `nameFa`, `loreFa`, `effectsLabelFa` on all 9 heirlooms |
| Traits (`TRAITS_FA`) | 28 | 28 | **100%** | `0` missing |
| Win Goals (`WIN_GOALS_FA`) | 11 | 11 | **100%** | `0` missing |
| Premade Characters (`PREMADE_CHARACTERS_FA`) | 13 | 13 | **100%** | `0` missing |
| Buildings (`BUILDINGS_FA`) | 6 | 6 | **100%** | `0` missing |
| Death Types (`DEATH_TYPES`) | 24 | 24 | **100%** | Inline `titleFa`, `messageFa`, `closingFa` on all 24 |
| Achievements (`BITLIFE_ACHIEVEMENTS`) | 30 | 30 (inline) / 9 (`ACHIEVEMENTS_FA`) | **100% UI** (Legacy dict: 9/30) | Every achievement has inline `nameFa` & `descFa` used by the UI. Note: the legacy `ACHIEVEMENTS_FA` dictionary in `src/i18n/gameDataFa.ts` only contains the original 9 keys and lacks the 21 newer keys (`'Sea Wolf (5 Raids Won)'`, `'Die Before 30'`, `'Marry a Blood Enemy'`, `'Conqueror of Walls'`, `'Living Legend (1000 Fame)'`, `'North Sea Overking'`, `'Silver Hoarder 500'`, `'Holmgang Champion'`, `'Survive to 70'`, `'Thrall Broken Chains'`, `'Full Longhouse (5 Kids)'`, `'Divorce Drama'`, `'One-Eyed Wisdom'`, `'Shieldmaiden Legend'`, `'Fleet Admiral (5 Ships)'`, `'Warlord of Fifty'`, `'Landed Magnate (8 Farms)'`, `'Ring Fortress Builder'`, `'Timeline Breaker'`, `'Master Sea-Captain'`, `'Pure Joy in Cold Lands'`). Because all components read `ach.nameFa` / `ach.descFa` directly, no English leaks in the UI, and `ACHIEVEMENTS_FA` is unused dead code. |

---

## 5. UI Map & Map Lenses

### Screens, Panels, Bottom Sheets & Modals
| Screen / Panel / Modal | Component File | How to Reach It | What It Renders |
| :--- | :--- | :--- | :--- |
| **Start Menu / Character Creation** | `src/components/CharacterCreation.tsx` | App launch (when no active session) or `Settings -> Return to Title` | Resume Autosave card, Saga Mode toggle card, Custom Character tab (homeland, occupation, class, traits, seed) & 13 Premade Characters tab (with Ragnar bloodline branch selector). |
| **Main Game Shell** | `src/App.tsx` | Start or resume a game (`GameScreen.PLAYING`) | Top bar (portrait, ruler name/title, silver, warriors, ships, audio/theme/lang toggles, menu button), desktop left sidebar, center tab viewport, 5-button bottom dock, and 4-stat strip (`Health`, `Honor`, `Power`, `Joy`). |
| **Tab 1: Life Feed (`TabId.Life`)** | `src/components/LifeFeed.tsx` | Default tab; click active tab or `Back` button | Grouped year-by-year chronicle feed, category filter chips, `"Word from the Lands"` legend news cards, provenance tags, and 3-step onboarding card. |
| **Tab 2: Activities (`TabId.Actions`)** | `src/components/ActionsPanel.tsx` | Bottom dock `Activities` (`فعالیت‌ها`) | 5 expandable drawers: Coastal Raiding, Sea Voyage, Trade & Labor, Skill Training, and Special Decisions (Blót, Faith Conversion, Western Exploration, Hire Skald, Pay Trader for Legend News, Claim Title). |
| **Tab 3: Kin (`TabId.Family`)** | `src/components/FamilyPanel.tsx` | Bottom dock `Kin` (`خاندان`) | Family actions (court spouse, peace-marriage, concubine, adopt, divorce, feast) + grouped kin cards (`Spouse`, `Children`, `Parents & Siblings`, `Rivals & Feuds`) with 10 direct member interactions (`gift`, `praise`, `spend_time`, `train_together`, `spar`, `counsel`, `carouse`, `demand_submission`, `insult`, `holmgang`). |
| **Tab 4: Map (`TabId.Map`)** | `src/components/VikingMap.tsx` | Bottom dock `Map` (`نقشه`) or sidebar location pill | Interactive SVG map of Europe, North Atlantic, Mediterranean & Caliphate with pan/zoom, 5 map lenses, realm/sea labels, and an 8-tab settlement bottom sheet. |
| **Tab 5: More Hub (`TabId.More`)** | `src/components/MoreMenuPanel.tsx` | Bottom dock `More` (`بیشتر`) | 7 cards opening full bottom sheets: `Hall of Legends`, `Holdings & Buildings`, `Fleet & Warband`, `Intrigue & Crowns`, `Rank Promotion & Saga Goal`, `Saga Badges (30)`, and `Lineage & Chronicles`. |
| **Realm & Estates (`TabId.Realm`)** | `src/components/RealmPanel.tsx` | Via `More -> Holdings / Fleet / Intrigue` | 3 sub-sections: `holdings` (estates ledger, farm clearing, conquered cities), `fleet` (quartermaster unit/ship/horse purchasing), and `intrigue` (4 covert plots + 6 historical crowns). |
| **City Management Modal** | `src/components/CityModal.tsx` | Click `Manage City` (`مدیریت شهر`) on any owned/conquered holding in `RealmPanel` | Dedicated modal for a single settlement: unrest gauge, tribute burden selector, garrison slider, Norse settler dispatch, building construction, Jarl appointment, hostages, and religious tolerance toggle. |
| **Tactical Battle Modal** | `src/components/RealmPanel.tsx` (lines 1180–1360) | Triggered when `state.activeBattle` is non-null (`initiateBattle`) | Multi-round battle screen showing terrain, player vs. enemy warriors and morale bars, combat log, and 7 tactical command buttons. |
| **Hall of Legends Panel** | `src/components/HallOfLegendsPanel.tsx` | Via `More -> Hall of Legends` or inside `SagaChroniclePanel` | Search/filter directory of all 22 legends, Orðstírr rank banner, paid trader intel CTA, and detailed modal/drawer with historical sources, dated timeline beats, and personal oaths/feuds/gifts. |
| **Saga Chronicle Panel (`TabId.Saga`)** | `src/components/SagaChroniclePanel.tsx` | Via `More -> Lineage & Chronicles` | Lothbrok 9-chapter progress tracker, *Hefnd* vengeance meter, owned Saga Heirlooms showcase, Hall of Legends embed, historical divergences, and ancestor memorials. |
| **Character Profile Sheet** | `src/App.tsx` (lines 1147–1306) | Tap ruler portrait in the top header | Modal sheet showing large `VikingPortrait`, all 8 personal stats, 6 core skills, active traits, rank-up button, and Saga Story Poster CTA. |
| **Header Menu Dropdown** | `src/components/HeaderMenuDropdown.tsx` | Tap hamburger `Menu` icon in top header | Slide-over drawer with Saga Badge ribbon preview, Quick Guide button, Save/Settings button, Saga Story Poster button, and New Saga button. |
| **Event Decision Modal** | `src/components/DecisionModal.tsx` | Automatically opens whenever `state.activeEvent` is non-null | Displays event artwork/icon, category, historical provenance note, narrative text, and choice buttons (with skill/stat/silver requirements and lock reasons). |
| **Death Summary & Succession Modal** | `src/components/DeathSummaryModal.tsx` | Automatically opens whenever `state.pendingDeath` is non-null | Illustrated death archetype card, life report title, skaldic obituary, Legacy Score, share poster trigger, eligible heir cards (`continueAsHeir`), or quick restart. |
| **1066 AD Epilogue Modal** | `src/components/Epilogue1066Modal.tsx` | Automatically opens in year `1066 AD` (`state.pending1066Epilogue`) | Summarizes dynasty achievements at the historical end of the Viking Age and offers `Continue in Free Mode` (`1067+ AD`) or `Start New Saga`. |
| **Saga Share Poster Modal** | `src/components/SagaSharePosterModal.tsx` | Via Profile Sheet, Header Menu, or Death Modal | Renders a 1080×1920 (9:16) high-DPI canvas poster of the character's life, stats, titles, and accomplishments with one-click PNG download. |
| **Settings & Save Slots Modal** | `src/components/SettingsSaveModal.tsx` | Via Start Screen or Header Menu `Save / Settings` | 3 manual save slots (Save/Load/Delete), `ELDSAGA1:` text export/import, language toggle, Daylight/Night theme toggle, text size, audio/weather toggles, difficulty, and content intensity. |
| **Quick Guide Modal** | `src/components/QuickGuideModal.tsx` | Via Start Screen or Header Menu `Guide` | 5-section gameplay manual and Old Norse historical glossary. |
| **Honor Toast** | `src/components/HonorToast.tsx` | Automatically appears when `stats.honor` changes by `>= 4` | Top floating toast showing `+Honor` or `-Honor` delta with audio cue. |

### The 5 Map Lenses in `VikingMap.tsx` (`MapLensId`)
1. **`all` (`همه` / `All`)**: Default political & cartographic view showing all discovered settlements colored by status (gold = player holding, sky = current location, violet = tributary, emerald = high loot, slate = neutral) plus undiscovered fog-of-war nodes.
2. **`owned` (`قلمرو من` / `My Realm`)**: Highlights player-owned estates (`holdings`) and tributaries (`tributaries`) at full opacity with pulsing rings while dimming foreign settlements to `22%` opacity.
3. **`forces` (`قوای نظامی` / `Forces`)**: Displays floating military badges above discovered settlements showing player garrison + stationed warband strength (`⚔`) vs. estimated enemy garrison defense (`🛡`) and fleet count.
4. **`loot` (`غارت` / `Raid Loot`)**: Highlights raidable coastal/river ports and monasteries (`baseWealth >= 6` or `isMonastery`) in emerald/crimson and displays `💰W · 🛡D` (Wealth vs. Defense) pills under each port.
5. **`trade` (`تجارت` / `Trade`)**: Highlights high-wealth merchant emporia (`baseWealth >= 7` or `trading_post`) and active sea trade routes (`SEA_ROUTES`) with `⚖W` wealth indicators.

---

## 6. Theming & Accessibility Contrast

### Status of the Two Color Mechanisms
- **Unified Single System (`COMPLETE`)**: All colors are defined in `src/index.css` via CSS custom properties under `:root, html[data-theme="light"]` (Daylight default) and `html[data-theme="dark"]` (Night mode), exposed to Tailwind v4 via `@theme`.
- **Legacy Overrides Removed**: The old `html[data-theme="light"]` hex-remap override block has been completely removed from `src/index.css`.
- **Remaining Hard-Coded Colors in Components**: **0 across all 27 `.tsx` files** (`src/App.tsx` and all 26 files in `src/components/*.tsx`). All **3,140** previously hard-coded hex/palette classes across 24 files were migrated to semantic tokens (`bg-surface-*`, `text-ink-*`, `text-accent-*`, `border-border-*`, `cta-*`, `status-*`, `gold-*`, `blood-*`), enforced by `npm run check:colors` (`tools/check-colors.mjs`) and documented in `docs/THEMING.md` (12 lines).

| Component File (`src/`) | Initial Hard-Coded Classes | Current Hard-Coded Classes |
| :--- | ---: | ---: |
| `src/App.tsx` + 26 files in `src/components/*.tsx` (27 files total) | 3,140 | **0** (verified via `npm run check:colors`) |

*(Note: Canvas drawing scripts in `SagaSharePosterModal.tsx`, `EmberCanvas.tsx`, and SVG data strings in `VikingMap.tsx`/`VikingPortrait.tsx` use JS canvas/SVG fill strings for bitmap/vector artwork, not Tailwind color utility classes).*

### Measured Contrast Script Output (`npm run check:contrast`)
- **Total Pairs Checked**: **128** token pairs across Daylight (`light`), Night (`dark`), and theme-invariant CTA buttons.
- **Total Failures**: **0** (every text pair passes WCAG AA `>= 4.5:1`; every meaningful boundary passes `>= 3.0:1`).
- **Key Measured Ratios**:
  - Daylight `--text-primary` (`#182230`) on `--surface-canvas` (`#f4efe6`): **13.99:1** (`PASS AA`)
  - Daylight `--text-secondary` (`#2c3a4f`) on `--surface-canvas` (`#f4efe6`): **10.05:1** (`PASS AA`)
  - Daylight `--text-muted` (`#4c5b6e`) on `--surface-canvas` (`#f4efe6`) / `--surface-interactive` (`#e8dfd0`): **6.05:1** / **5.25:1** (`PASS AA`)
  - Daylight `--text-accent-amber` (`#a34608`) on `--surface-canvas` (`#f4efe6`) / `--surface-elevated` (`#fffdf8`) / `--surface-interactive` (`#e8dfd0`): **5.34:1** / **6.01:1** / **4.63:1** (`PASS AA`)
  - Daylight `--text-disabled` (`#546274`) on `--surface-disabled` (`#ede6d8`): **5.01:1** (`PASS AA`)
  - Night `--text-primary` (`#f1f5f9`) on `--surface-canvas` (`#0b1118`): **17.31:1** (`PASS AA`)
  - Night `--text-muted` (`#94a3b8`) on `--surface-interactive` (`#182638`): **5.96:1** (`PASS AA`)
  - Night `--text-disabled` (`#7d8ea3`) on `--surface-disabled` (`#0e1620`): **5.43:1** (`PASS AA`)
  - `Hall of Legends CTA` (`--color-cta-copper: #b85a16` + `#fffdf9`): **4.58:1** (`PASS AA`)
  - `Faith Conversion CTA` (`--color-cta-violet: #8655f4` + `#ffffff`): **4.55:1** (`PASS AA`)
  - `Hire Skald CTA` (`--color-cta-terracotta: #e07a2f` + `#0b1118`): **6.31:1** (`PASS AA`)
  - `Primary Gold CTA` (`--color-gold-500: #f59e0b` + `#0b1118`): **8.83:1** (`PASS AA`)

---

## 7. Owner Request Checklist

| # | Requested Feature / Improvement | Status | File Evidence |
| :-: | :--- | :---: | :--- |
| 1 | **BitLife-style Viking life simulator** (year-by-year aging, childhood-to-elder events, funny/brutal death cards, heir succession) | **DONE** | `src/data/bitlifeEvents.ts` (108 events), `src/data/deathsAndAchievements.ts` (24 death types), `src/components/DeathSummaryModal.tsx` |
| 2 | **Persian RTL UI by default + full English toggle** (`Vazirmatn` font, Persian digits helper, natural Persian tone) | **DONE** | `index.html` (`lang="fa" dir="rtl"`), `src/i18n/ui.ts`, `src/i18n/eventsFa.ts`, `src/i18n/bitlifeEventsFa.ts`, `src/i18n/gameDataFa.ts` |
| 3 | **Faction, raid, siege, conquest, diplomacy & rebellion systems** | **DONE** | `src/engine/gameEngine.ts` (`executeRaidAction`, `executeBesiegeAction`, `executeCityConquestAction`, `executeDiplomacyAction`, unrest/revolt loop in `advanceTurn`) |
| 4 | **Ragnar Lothbrok & Vikings-style storyline** (8 bloodline branches, 9 saga chapters, 9 heirlooms, *Hefnd* vengeance meter) | **DONE** | `src/data/lothbrokCycle.ts`, `src/components/SagaChroniclePanel.tsx`, `src/components/CharacterCreation.tsx` |
| 5 | **Living Legend Calendar ("Saga Mode"), Word from the Lands news engine & Hall of Legends** | **PARTIAL** | `src/engine/legendEngine.ts`, `src/components/HallOfLegendsPanel.tsx`, `src/data/legendsRegistry.ts` (22 legends, 56 beats), `src/data/legendEncounters.ts` (Phase 1 has 7 encounters; Phases 2–3 have anchor beats but 0 encounter events) |
| 6 | **Progressive map reveal** (Saga Mode starts with home `regionGroup` only; sailing/exploration unlocks regions) | **DONE** | `src/engine/gameEngine.ts` (`getNearbyDiscoveredIds`, `executeSailAction`, `'explore_west'`) |
| 7 | **Forces on the map & multi-lens cartography** (`All`, `My Realm`, `Forces`, `Raid Loot`, `Trade` lenses + 8-tab bottom sheet) | **DONE** | `src/components/VikingMap.tsx` (`MapLensId`, `SheetTabId`, garrison vs. defense badges) |
| 8 | **Estates screen redesign with a dedicated City Modal & Quartermaster military catalog** | **DONE** | `src/components/RealmPanel.tsx`, `src/components/CityModal.tsx`, `src/data/namesAndTraits.ts` (`MILITARY_CATALOG`) |
| 9 | **9:16 shareable Instagram Story Saga Poster** | **DONE** | `src/components/SagaSharePosterModal.tsx` |
| 10 | **Daylight & Night single theming system with automated WCAG AA contrast & color checks** | **DONE** | `src/index.css`, `docs/THEMING.md`, `tools/contrast-check.mjs`, `tools/check-colors.mjs` |
| 11 | **Fix carry-over localization & UX bugs** (Persian settlement types, `<bdi dir="ltr">` wrapping + `formatRulerName` for 137 rulers, open-ended 1066+ subtitle, disabled state styling, unused dependency cleanup) | **DONE** | `src/i18n/ui.ts`, `src/i18n/gameDataFa.ts`, `src/components/CharacterCreation.tsx`, `src/components/VikingMap.tsx`, `src/components/CityModal.tsx`, `package.json` |
| 12 | **Web App Manifest (`manifest.webmanifest`) & dedicated PWA app icons** | **MISSING** | `index.html` has `<title>`, meta description, and OpenGraph tags, but no `manifest.webmanifest`, favicon, or apple-touch-icon in `public/`. |

---

## 8. Quality, Verification & Risk Audit

### Real Command Execution Results
- **`npm run lint` (`tsc --noEmit`)**: **PASS** (Exit code `0`, `0` TypeScript errors or warnings).
- **`npm run build` (`vite build`)**: **PASS** (Built in `1.40s`; `2,112` modules transformed; `dist/index.html` `1.75 kB`, `dist/assets/index.css` `109.00 kB` / `15.65 kB` gzip, `dist/assets/index.js` `2,431.40 kB` / `684.56 kB` gzip).
- **`npm run check:contrast`**: **PASS** (Exit code `0`, `0` failures across 128 pairs).
- **`npm run check:colors`**: **PASS** (Exit code `0`, `0` hard-coded hex or Tailwind palette classes across 27 component files).
- **`npm run check:legends`**: **PASS** (Exit code `0`, `0` consistency errors across 22 legends, 56 beats, 7 encounters).
- **Automated Unit/Integration Tests**: No unit test runner (e.g., Vitest) is currently configured beyond the 3 validation scripts in `tools/*.mjs`.

### Known Bugs, Dead Code & Fragile Areas
1. **Unused Legacy Dictionary (`ACHIEVEMENTS_FA` in `src/i18n/gameDataFa.ts`, lines 1129–1166)**: Contains only 9 of the 30 achievement keys and is never imported by any UI component because `BITLIFE_ACHIEVEMENTS` in `src/data/deathsAndAchievements.ts` stores `nameFa` and `descFa` inline on all 30 items.
2. **Legacy Unused Enum Values (`TitleRank.Bonde` and `TitleRank.Hersir` in `src/types/game.ts`, lines 28 & 30)**: Kept in the `TitleRank` enum for v1 save compatibility, but excluded from `TITLE_LADDER` in `src/data/namesAndTraits.ts`.
3. **Unused Historical Screenshots in `public/assets/aistudio/`**: 10 PNG screenshots (`1.44 MB` total) sit in `public/assets/aistudio/` and are copied into `dist/` on build without being referenced by the app.
4. **Unused Dependencies**: **0** remaining (`@google/genai`, `express`, `dotenv`, and `@types/express` were removed from `package.json`).
5. **Performance Risks**:
   - **Single 2.43 MB JS Bundle (`684.56 KB` gzip)**: All data modules (`events.ts`, `bitlifeEvents.ts`, `lothbrokCycle.ts`, `legendsRegistry.ts`, `geography.ts`, `eventsFa.ts`, `bitlifeEventsFa.ts`) and heavy modals (`VikingMap.tsx`, `SagaSharePosterModal.tsx`, `HallOfLegendsPanel.tsx`) are statically imported into the initial bundle. Code-splitting via `React.lazy()` or `rolldownOptions.output.codeSplitting` would cut initial load size by ~60%.
   - **Large SVG DOM in `VikingMap.tsx`**: Renders 20 landmass polygons, 21 rivers, 61 sea routes, forest clusters, wave markers, and 55 interactive settlement nodes simultaneously. While memoized, low-end mobile devices can experience frame drops during rapid pinch-zoom.
6. **Accessibility Gaps**:
   - Interactive SVG settlement nodes in `VikingMap.tsx` use `<g onClick={...}>` without `role="button"`, `tabIndex={0}`, or keyboard `Enter`/`Space` handlers, making map node selection mouse/touch-only.
   - Modals (`DecisionModal`, `CityModal`, `SettingsSaveModal`, `QuickGuideModal`) support backdrop click and close buttons, but do not implement a focus trap (`Tab` cycling within the modal) or universal `Escape` key dismissal.

---

## 9. How to Extend (Step-by-Step Recipes)

### A. Add a New Life Event
1. **Define the Event**:
   - For a rich event, add a `GameEvent` object to `CORE_LIFE_EVENTS` in `src/data/events.ts` with a unique `id`, `title`, `category`, `iconType`, `weight`, optional `conditions` (`ageMin`, `ageMax`, `eras`, `classes`, `requiredFlags`, etc.), `text`, and `choices`.
   - Or for a quick BitLife event, add a `makeQuickEvent({ ... })` entry to `BITLIFE_EVENTS` in `src/data/bitlifeEvents.ts`.
2. **Add Persian Translation**:
   - Add the matching `[event.id]: { title, text, mildText?, choices: { [choice.id]: { label, outcomeText } } }` entry to `EVENTS_FA` in `src/i18n/eventsFa.ts` (or `BITLIFE_EVENTS_FA` in `src/i18n/bitlifeEventsFa.ts`).
3. **Verify**: Run `npm run lint`.

### B. Add a New Settlement
1. **Add Settlement Data**: Append a `Settlement` object to `SETTLEMENTS` in `src/data/geography.ts` with `id`, `name`, `norseName`, `regionGroup`, `subRegion`, `lat` (`29..69`), `lon` (`-62..48`), `settlementType`, `baseWealth` (`1–10`), `baseDefense` (`1–10`), `historicalSummary`, and `controllersByEra`.
2. **Connect Sea Routes**: Add one or more `{ from: '<new_id>', to: '<neighbor_id>' }` entries to `SEA_ROUTES` in `src/data/geography.ts`.
3. **Localize in Persian**: Add the settlement's `id` to `SETTLEMENTS_FA` in `src/i18n/gameDataFa.ts` (`name`, `subRegion`, `summary`), and ensure any new `controllersByEra.ruler` names are mapped in `RULER_EXACT_FA` / `NORSE_NAME_MAP_FA` in `src/i18n/gameDataFa.ts`.

### C. Add a Legend & Timeline Beats
1. **Register the Legend**: Append a `LegendRegistryEntry` to `LEGENDS_REGISTRY` in `src/data/legendsRegistry.ts` with `id`, `phase` (`1 | 2 | 3`), `name`, `nameFa`, `epithet`, `epithetFa`, `statusTag` (`DOCUMENTED | CONTESTED | LEGENDARY`), `provenance`, `homeRegion`, `homeSettlementId` (must exist in `SETTLEMENTS_BY_ID`), `birthYear`, `deathYear`, `activeYears`, `bioEn`, `bioFa`, and `timeline` (`LegendTimelineBeat[]` sorted chronologically within `[birthYear, deathYear]`).
2. **Add Face-to-Face Encounters (Optional)**: Add a `GameEvent` to `LEGEND_ENCOUNTER_EVENTS` and its Persian translation to `LEGEND_ENCOUNTERS_FA` in `src/data/legendEncounters.ts`, gating on `requiredFlags: ['met_<legend>']` and using `effects.legendStandingDelta`.
3. **Verify**: Run `npm run check:legends` to validate dates, monotonic beat ordering, and settlement IDs.

### D. Add a Recruitable Unit or Military Item
1. **Add Action Union**: Add the new action key (e.g., `'recruit_varangians'`) to `MilitaryPurchaseAction` in `src/types/game.ts` and optional count field to `RealmState`.
2. **Add Catalog Metadata**: Append an entry to `MILITARY_CATALOG` in `src/data/namesAndTraits.ts` (`id`, `action`, `category`, `nameEn`, `nameFa`, `norseTerm`, `costSilver`, `upkeepNoteEn`, `upkeepNoteFa`, `effectSummaryEn`, `effectSummaryFa`).
3. **Add Engine Handler**: Handle the new `action` inside `executeGeneralAction` in `src/engine/gameEngine.ts` (deduct `costSilver`, increment `realm.hirdWarriors` and unit counter, append log entry).
4. **Add Icon Glyph**: Add a case to `MilitaryUnitGlyph` in `src/components/NorseMotifs.tsx` and wire the card in `RealmPanel.tsx` (`fleet` section).

### E. Add a Map Lens
1. **Extend Lens Type**: Add the new lens ID to `MapLensId` (`'all' | 'owned' | 'forces' | 'loot' | 'trade' | '<new_lens>'`) in `src/components/VikingMap.tsx`.
2. **Add Lens Button**: Add the button config (`id`, `label`, `icon`) to the lens switcher bar in `VikingMap.tsx`.
3. **Configure Node Highlighting & Badges**: Update the node opacity/ring logic and pill badge renderer inside the `SETTLEMENTS.map(...)` loop in `VikingMap.tsx` to display the new lens metric.

### F. Add a UI Translation
1. **Shared Labels**: Add the key to both `en` and `fa` objects in the relevant dictionary in `src/i18n/ui.ts` (`STAT_LABELS`, `SKILL_LABELS`, `SETTLEMENT_TYPE_LABELS`, `MAP_FORCES_UI`, `ESTATES_LEDGER_UI`, etc.).
2. **Entity Names**: For person/ruler/dynasty names, add tokens to `NORSE_NAME_MAP_FA` or `RULER_EXACT_FA` in `src/i18n/gameDataFa.ts` and format with `formatPersonName(name, lang)` or `formatRulerName(ruler, lang)` wrapped in `<bdi dir="ltr">` when Latin text is shown inside RTL.

---

## 10. Glossary of Norse, English & Persian Terms

| Code / Old Norse Term | English UI Term | Persian UI Term (فارسی) | Meaning in Game Mechanics |
| :--- | :--- | :--- | :--- |
| `Thrall` (*Þræll*) | Thrall | برده (ثرال) | Lowest social rank (`TitleRank.Thrall`); can buy or win freedom |
| `Karl` / `Freeman` | Freeman | آزادمرد (کارل) | Free peasant/craftsman rank (`TitleRank.Freeman`) |
| `Bonde` (*Bóndi*) | Yeoman / Landholder | زمین‌دار آزاد (بونده) | Independent farm owner (`SocialClass.Bonde`) |
| `Hird` / `Hirdman` (*Hirð*) | Hird Warrior / Retainer | جنگجوی هیرد / ملازم جنگی | Sworn household warband (`realm.hirdWarriors`) |
| `Huscarl` (*Húskarl*) | Huscarl | گارد ویژه (هوسکارل) | Elite armored retainer (`TitleRank.Huscarl`, `realm.huscarls`) |
| `Hersir` | Hersir (Local Commander) | سردار محلی (هرسیر) | Noble war-leader social class (`SocialClass.HersirKin`) |
| `Jarl` | Jarl (Earl) | یارل (فرمانروای ایالت) | Regional ruler rank (`TitleRank.Jarl`) or appointed city governor |
| `Konungr` | King (Konungr) | پادشاه (کونونگر) | Royal monarch rank (`TitleRank.Konungr`) |
| `Overking` | High King / Overking | شاهنشاه دریای شمال | Supreme rank (`TitleRank.Overking`) |
| `Wyrd` (*Urðr*) | Wyrd / Fate | سرنوشت (ویرد) | Personal fate/luck stat (`stats.wyrd`) |
| `Orðstírr` | Word-Fame / Renown | آوازه و نام نیک (اوردستیر) | Undying reputation score & 5-tier rank in `legendEngine.ts` |
| `Hefnd` | Blood-Vengeance Debt | بدهی انتقام خون (هِفند) | `0–100` meter (`state.hefndMeter`) tracking unavenged Lothbrok blood |
| `Holmgang` (*Hólmganga*) | Holmgang Duel | دوئل هولم‌گانگ | Ritual single combat to settle feuds or claim honor |
| `Thing` / `Althing` (*Þing*) | Thing Assembly | شورای ثینگ / آلثینگ | Law assembly where disputes, outlawry, and laws are decided |
| `Seiðr` (`seidr`) | Seidr / Norse Magic | آیین سیدر (جادوی شمال) | Divination and shamanic craft skill (`skills.seidr`) |
| `Skald` / `Skaldcraft` | Skald / Poetry | شاعر حماسی (اسکالد) | Court poetry skill (`skills.skaldcraft`) and hireable action |
| `Blót` (`hold_blot`) | Sacrificial Blót | جشن قربانی بلوت | Seasonal ritual sacrifice to the Æsir & Vanir for Faith/Stability |
| `Prime-Signed` (*Primsigna*) | Prime-Signed (Syncretic) | موسوم به صلیب (تلفیقی) | Syncretic faith allowing trade with Christians while keeping Norse rites |
| `Skáli` (`skali_hall`) | Mead-Hall (Skáli) | تالار بزرگ (اسکالی) | Estate building granting `+3` Fame and `+6` Stability/yr |
| `Naust` (`boathouse_naust`) | Boathouse (Naust) | آشیانه کشتی (ناوست) | Estate building cutting annual fleet silver upkeep by `50%` |
| `Kaupang` (`kaupang_market`) | Market Emporium | بازارگاه تجاری (کاوپانگ) | Estate building generating `+18` silver/yr |
| `Trelleborg` (`ring_fortress`) | Ring Fortress | دژ حلقه‌ای (ترلبرگ) | Fortification granting `+8` Stability and `-5` Unrest/yr |
| `Snekkja` / `Dreki` / `Knarr` | Scout Ship / Dragon Longship / Merchant Knarr | کشتی گشتی (اسنکیا) / لانگ‌شیپ جنگی / کشتی تجاری (کنار) | The 3 ship classes in the fleet (`snekkjas`, `longships`, `knarrs`) |
| `Svinfylking` | Boar's Snout Wedge | آرایش پوزه گراز (سوئین‌فیلکینگ) | Aggressive wedge battle tactic in `resolveBattleTactic` |
| `Skjaldborg` (`shield_wall`) | Shield-Wall | دیوار سپرها (اسکیالدبورگ) | Defensive battle tactic in `resolveBattleTactic` |
| `Danegeld` | Tribute / Danegeld | خراج و باج (دین‌گلد) | Silver extracted from tributaries and conquered holdings |
| `Miklagard` / `Serkland` | Constantinople / Abbasid Caliphate | میکلاگارد (قسطنطنیه) / سرکلند (بغداد و خلافت) | Eastern river/sea destinations for Varangian & Silk Road expeditions |

---

## 11. Top 10 Prioritized Next Improvements

1. **Complete Phase 2 & Phase 3 Legend Timelines and Interactive Encounters** — **Effort: Medium**
   - *Why*: Phase 1 legends (`Ragnar`, `Lagertha`, `Floki`) have 6–8 timeline beats and 7 interactive encounters, whereas Brother Aldwin (Phase 1) and all 18 legends in Phases 2 & 3 currently have only 1–3 anchor beats and `0` interactive encounter events in `src/data/legendEncounters.ts`. Expanding them fulfills the full promise of Saga Mode.
2. **Code-Split Heavy Panels & Data Modules (`React.lazy` + Rollup Chunks)** — **Effort: Small**
   - *Why*: `dist/assets/index.js` is currently `2,431 KB` (`684 KB` gzip). Lazy-loading `VikingMap`, `HallOfLegendsPanel`, `SagaSharePosterModal`, `RealmPanel`, and `FamilyPanel` will cut initial bundle weight by more than half.
3. **Keyboard & Screen-Reader Accessibility for `VikingMap.tsx` and Modals** — **Effort: Small**
   - *Why*: Adding `tabIndex={0}`, `role="button"`, `aria-label`, and `Enter`/`Space` handlers to map settlement `<g>` nodes—plus `Escape`-to-close and focus trapping in modals—closes the main accessibility gap.
4. **Add Web App Manifest (`public/manifest.webmanifest`) & Custom SVG/PNG App Icons** — **Effort: Small**
   - *Why*: Allows mobile users to install Saga of Crowns to their home screen as a standalone full-screen web app with offline asset caching.
5. **Integrate Detailed Quartermaster Units into Tactical Combat Rounds** — **Effort: Medium**
   - *Why*: Players can recruit `bondiSpearmen`, `huscarls`, `norseArchers`, `berserkers`, and `warhorses` in `RealmPanel`, which currently roll up into `hirdWarriors`. Giving archers ranged volley phases, berserkers morale shock, and cavalry flank bonuses in `resolveBattleTactic` makes unit composition tactically meaningful.
6. **Clean Up Dead Assets & Legacy Dictionary (`public/assets/aistudio/*.png` & `ACHIEVEMENTS_FA`)** — **Effort: Small**
   - *Why*: Removing the 10 unused historical screenshots (`1.44 MB`) from `public/assets/aistudio/` and removing the unused 9-key `ACHIEVEMENTS_FA` export in `src/i18n/gameDataFa.ts` keeps the repository and build output lean.
7. **Add Automated Engine Simulation Smoke Tests (`tools/test-engine.mjs`)** — **Effort: Small**
   - *Why*: A deterministic headless script that simulates 100-year campaigns across fixed seeds (`HRAFN-1000`, etc.) in both normal and Saga Mode will catch any future regressions in `advanceTurn`, `resolveEventChoice`, or `continueAsHeir`.
8. **Dynamic AI Jarl & Rival Raids Against Player Holdings** — **Effort: Medium**
   - *Why*: Currently, holdings only face internal rebellions (`unrest >= 90`). Allowing rival kings or blood-feud enemies to besiege lightly garrisoned player coastal holdings adds strategic tension to garrison placement.
9. **Interactive Family Tree Graph in `SagaChroniclePanel`** — **Effort: Medium**
   - *Why*: `ancestors` and `relationships` are currently rendered as linear lists. A visual SVG dynasty tree connecting generations, spouses, and bloodline branches would elevate multi-generational storytelling.
10. **Expanded Regional Trade Goods & Commodity Specializations** — **Effort: Large**
    - *Why*: Differentiating ports by regional trade goods (Arctic walrus ivory & falcons in Greenland/Norway, furs & wax in Rus, silk & dirhams in Miklagard/Baghdad, Frankish swords in Dorestad) would deepen merchant playthroughs.
