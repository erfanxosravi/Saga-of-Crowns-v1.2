# Saga of Crowns (حماسه‌ی تاج‌ها)

**Saga of Crowns** is a bilingual (Persian RTL & English LTR), historically grounded Viking Age life and dynasty simulation spanning **793–1066 AD** with open-ended dynasty continuation beyond 1066.

Players begin as a custom ruler or historical figure across Scandinavia, the British Isles, Frankia, the Baltic, Kievan Rus, the Mediterranean, or the North Atlantic. Year by year, you lead coastal raids and sieges, sail seasonal sea lanes, govern estates and garrisons, navigate the Thing assembly and blood-feuds (*Hefnd*), witness living historical legends in the **Hall of Legends**, and pass your titles and heirlooms to your heirs when you fall.

## How to Run

```bash
# Install dependencies
npm install

# Start development server on http://localhost:3000
npm run dev

# Type-check & lint
npm run lint

# Run verification checks (WCAG contrast, color token guard, legend timeline integrity)
npm run check:contrast
npm run check:colors
npm run check:legends

# Production build
npm run build
```

## Folder Map

```text
├── docs/
│   └── THEMING.md                  # Semantic theme token rules & migration status
├── src/
│   ├── App.tsx                     # Root game shell, turn progression, modal & tab routing
│   ├── index.css                   # Tailwind v4 @theme tokens + Daylight/Dark CSS variables
│   ├── main.tsx                    # React entry point
│   ├── types/
│   │   └── game.ts                 # Core TypeScript types (character, realm, map, legends)
│   ├── engine/
│   │   ├── gameEngine.ts           # Deterministic turn simulation, combat, raids, succession
│   │   ├── legendEngine.ts         # Living Legends calendar, distance-delayed rumors & oaths
│   │   ├── prng.ts                 # Seeded deterministic PRNG (Mulberry32 / FNV-1a)
│   │   ├── sound.ts                # Procedural Web Audio API Nordic sound synthesis
│   │   └── storage.ts              # LocalStorage save slots, migration & JSON import/export
│   ├── data/
│   │   ├── geography.ts            # 50+ historical settlements, sea routes & polity eras
│   │   ├── historicalTimeline.ts   # Canonical Viking Age historical milestones (793–1066 AD)
│   │   ├── legendsRegistry.ts      # 22 historical & saga figures across Phases 1–3
│   │   ├── legendEncounters.ts     # Interactive multi-choice encounters with living legends
│   │   ├── lothbrokCycle.ts        # 9-chapter Ragnarsættin vengeance campaign & heirlooms
│   │   ├── events.ts               # Core historical & seasonal dilemma events
│   │   ├── bitlifeEvents.ts        # Life-stage personal, family, and court events
│   │   ├── namesAndTraits.ts       # Old Norse names, traits, ranks & historical starts
│   │   └── deathsAndAchievements.ts# Epitaphs, causes of death & saga achievements
│   ├── i18n/
│   │   ├── ui.ts                   # Bilingual UI copy, labels & glossary (FA / EN)
│   │   ├── gameDataFa.ts           # Persian settlement data, name transliteration & rulers
│   │   ├── eventsFa.ts             # Persian translations for core & historical events
│   │   └── bitlifeEventsFa.ts      # Persian translations for life-stage events
│   └── components/
│       ├── CharacterCreation.tsx   # Start menu, custom ruler builder & historical presets
│       ├── LifeFeed.tsx            # Yearly chronicle feed & event log cards
│       ├── ActionsPanel.tsx        # Raids, voyages, court, family & faith actions
│       ├── VikingMap.tsx           # Interactive SVG sea-lane & settlement map
│       ├── CityModal.tsx           # Holding management, garrisons, buildings & Jarls
│       ├── FamilyPanel.tsx         # Dynasty tree, spouse, heirs, thralls & Valhalla roster
│       ├── RealmPanel.tsx          # Economy, estates, military forces & laws
│       ├── SagaChroniclePanel.tsx  # Dynasty score, Ragnarsættin cycle & timeline
│       ├── HallOfLegendsPanel.tsx  # Living Legends roster, rumor dispatches & oath ledger
│       ├── DecisionModal.tsx       # Interactive dilemma & combat tactics modal
│       ├── DeathSummaryModal.tsx   # Obituary, succession selector & legacy breakdown
│       └── Epilogue1066Modal.tsx   # 1066 AD Stamford Bridge epilogue & freeplay transition
└── tools/
    ├── contrast-check.mjs          # WCAG 2.1 contrast verifier for Daylight & Night themes
    ├── check-colors.mjs            # Guard against hard-coded hex/palette classes in components
    └── check-legends.mjs           # Validator for legend birth/death bounds & monotonic beats
```
