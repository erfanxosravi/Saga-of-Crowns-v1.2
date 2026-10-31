# Saga of Crowns (`حماسه‌ی تاج‌ها`) — Technical & Historical Project Report

## 1. Executive Summary

**Saga of Crowns** (`حماسه‌ی تاج‌ها`) is a bilingual (English / Persian RTL) Viking-Age life and dynasty simulation spanning **793–1066 AD**. This report documents the completed architecture, historical settlement chronology, Living Legends expansion, WCAG AA dual-theme contrast verification, and automated smoke-test suite.

---

## 2. Changed & Added Files Inventory

1. `/docs/PROJECT_REPORT.md` — Updated comprehensive technical and historical report with exact heirloom counts, Lade coexistence fix, settlement years table, legend depth metrics, and build bundle outputs.
2. `/docs/QA.md` — Added QA Cheat Sheet listing all 37 legend encounters, their exact trigger conditions (`yearRange`, `ageMin`, `regions`, `requiredFlags`, `blockedByFlags`), and the quickest fixed-seed steps to reach each in Saga Mode without any in-game debug features.
3. `/docs/THEMING.md` — Documented the semantic CSS custom property architecture for Daylight (`data-theme="light"`) and Night (`data-theme="dark"`) modes.
4. `/package.json` — Added automated verification scripts (`check:colors`, `check:contrast`, `check:legends`, `check:engine`).
5. `/src/App.tsx` — Converted `VikingMap`, `RealmPanel`, `FamilyPanel`, and `SagaSharePosterModal` to `React.lazy` with `<Suspense>` fallbacks and passed `theme={theme}` to `<EmberCanvas />`.
6. `/src/components/DeathSummaryModal.tsx` — Converted `SagaSharePosterModal` to `React.lazy` with `<Suspense>` so Vite splits `SagaSharePosterModal` into its own chunk (`27.24 kB`).
7. `/src/components/EmberCanvas.tsx` — Made `EmberCanvas` theme-reactive (`theme?: ThemeMode` + `MutationObserver` on `document.documentElement.dataset.theme`), rendering warm bronze/amber embers at `0.48x` alpha in Daylight (`light`) mode and glowing hearth embers at `1.0x` alpha in Night (`dark`) mode.
8. `/src/components/HallOfLegendsPanel.tsx` — Bilingual Hall of Legends dossier panel displaying all 22 living legends, Ordstirr ranks, standing meters, world-beat timelines, and bloodline/historical filters.
9. `/src/components/MoreMenuPanel.tsx` — Converted `HallOfLegendsPanel` and `RealmPanel` to `React.lazy` with `<Suspense>` fallbacks.
10. `/src/components/SagaChroniclePanel.tsx` — Converted `HallOfLegendsPanel` to `React.lazy` with `<Suspense>` fallback so `HallOfLegendsPanel` splits into its own chunk (`37.24 kB`).
11. `/src/components/VikingMap.tsx` — Added distinct label anchor hints for `lade_hladir` (`{ anchor: 'start', dx: 8, dy: -5 }`) and `nidaros` (`{ anchor: 'end', dx: -8, dy: 6 }`) so both Trondheimsfjord settlements coexist cleanly after 997 AD without label overlap.
12. `/src/data/geography.ts` — Removed `abandonedYear: 996` and migration from `lade_hladir` so Lade coexists with `nidaros` after 997 AD as the Earls of Lade's seat; refined `foundedYear` and `"uncertain"` historical notes for `odense` (`980`), `giske_more` (`860`), `skara_gotaland` (`985`), `tunsberg` (`871`), `oslo` (`1000`), and `kalmar_oland` (`800`).
13. `/src/data/legendEncounters.ts` — Expanded all 7 Phase 1 encounters (`ragnar_lothbrok`, `lagertha_shieldmaiden`, `floki_raven_sailor`, `brother_aldwin_scribe`) to 142–174 body words in both English and Persian.
14. `/src/data/legendEncountersPhase23.ts` — Added and deepened 30 Phase 2 & Phase 3 signature encounters across all 18 Phase 2/3 legends (`124–177` body words in both English and Persian, `37` total encounters).
15. `/src/data/legendsRegistry.ts` — Registered all 22 historical and semi-legendary figures across Phases 1–3 with `98` total chronological world beats (`>= 4` beats per legend).
16. `/src/data/lothbrokCycle.ts` — Defined all `15` saga heirlooms (`9` pre-existing + `6` net-new Phase 2/3 heirlooms) with bilingual provenance and stat bonuses.
17. `/src/engine/gameEngine.ts` — Integrated historical settlement availability (`resolveActiveSettlementId`), multi-hop sea-route BFS news propagation, and legend encounter chaining.
18. `/src/engine/legendEngine.ts` — Implemented deterministic Living Legends world-beat progression, Ordstirr calculation, and regional rumor travel delay.
19. `/src/i18n/gameDataFa.ts` — Updated Persian settlement names, summaries (`SETTLEMENTS_FA`), and ruler translations (`RULER_PHRASE_MAP_FA`) for Lade/Nidaros coexistence and all uncertain foundation dates.
20. `/tools/check-colors.mjs` — Static AST/regex verifier ensuring 0 hardcoded hex or raw Tailwind palette classes across all 27 UI components.
21. `/tools/check-legends.mjs` — Consistency verifier checking all 22 legends, 98 timeline beats, 37 encounters, heirlooms, and active settlement references.
22. `/tools/contrast-check.mjs` — WCAG 2.1 AA contrast verifier auditing all text, surface, border, and CTA token pairs in both Light and Dark themes.
23. `/tools/test-engine.mjs` — Headless 400-turn (4 × 100-year) campaign simulator verifying engine invariants, heir succession, and Lade & Nidaros coexistence (`950–1050 AD`).

---

## 3. Code-Splitting & Bundle Size Summary

`React.lazy` + `<Suspense>` code-splitting is active across all five target components:
- `VikingMap` → `dist/assets/VikingMap-CmFckz1x.js` (`137.72 kB` │ gzip: `27.75 kB`)
- `RealmPanel` → `dist/assets/RealmPanel-xc3-oE1P.js` (`128.70 kB` │ gzip: `21.78 kB`)
- `FamilyPanel` → `dist/assets/FamilyPanel-D8nznsWw.js` (`95.46 kB` │ gzip: `21.17 kB`)
- `HallOfLegendsPanel` → `dist/assets/HallOfLegendsPanel-C4GW9fER.js` (`37.24 kB` │ gzip: `8.02 kB`)
- `SagaSharePosterModal` → `dist/assets/SagaSharePosterModal-CmabeD64.js` (`27.24 kB` │ gzip: `8.89 kB`)

---

## 4. Exact Saga Heirloom Audit (`9` Before → `15` After)

- **Before**: `9` heirlooms (`6` original Lothbrok Cycle heirlooms + `3` Phase 1 Legend heirlooms).
- **After**: `15` heirlooms (`+6` net-new heirloom definitions added to `SAGA_HEIRLOOMS` in `src/data/lothbrokCycle.ts`, plus `5` pre-existing Lothbrok Cycle heirlooms newly wired into Phase 2 legend encounters).

| # | Heirloom ID | Name (EN) | Norse Name | Owner Legend (`legendId`) | Status |
|---|---|---|---|---|---|
| 1 | `hrafnsmerki_banner` | The Raven Banner | *Hrafnsmerki* | `ivar_boneless` (and Ragnar's Sons) | Pre-existing (wired to `leg_enc_ivar_02_dumbarton_banner`) |
| 2 | `fang_of_fafnir` | Fang of Fafnir Blade | *Fáfnisbani Shard* | `sigurd_snake_eye` | Pre-existing (wired to `leg_enc_sigurd_02_eider_peace`) |
| 3 | `shield_of_ironside` | The Shield of Ironside | *Skjöldr Járnsíðu* | `bjorn_ironside` | Pre-existing (wired to `leg_enc_bjorn_02_luna_bier`) |
| 4 | `aslaug_unwoven_shirt` | Aslaug's Unwoven Shirt | *Skyrta Áslaugar* | `aslaug_kraka` | Pre-existing (wired to `leg_enc_aslaug_01_harp_loom`) |
| 5 | `bragarfull_horn_lejre` | Oath-Horn of Lejre | *Bragarfull Hleiðrar* | `halfdan_ragnarsson` | Pre-existing (wired to `leg_enc_halfdan_02_ploughland`) |
| 6 | `serpent_of_the_wash` | The Serpent of the Wash | *Ormrinn* | `ubba_ragnarsson` | Pre-existing (wired to `leg_enc_ubba_02_cynwit`) |
| 7 | `ragna_ring_of_seine` | Ragnar's Arm-Ring of the Seine | *Hringr Ragnars af Signu* | `ragnar_lothbrok` | Pre-existing (Phase 1 — `leg_enc_ragnar_04_elegy`) |
| 8 | `lagertha_spear_of_gaular` | Lagertha's Winged Spear of Gaular | *Geirr Hlaðgerðar* | `lagertha_shieldmaiden` | Pre-existing (Phase 1 — `leg_enc_lagertha_02_usurper`) |
| 9 | `floki_sunstone_compass` | Floki's Sunstone & Raven-Cage | *Sólarsteinn Hrafna-Flóka* | `floki_raven_sailor` | Pre-existing (Phase 1 — `leg_enc_floki_02_iceland`) |
| 10 | `rollo_rouen_armring` | Rollo's Arm-Ring of the Seine | *Hringr Göngu-Hrólfs* | `rollo_normandy` | **Net-New** (`leg_enc_rollo_02_epte`) |
| 11 | `hvitserk_eastern_blade` | Hvitserk's Eastern Blade | *Austr-Sax Hvítserks* | `hvitserk_ragnarsson` | **Net-New** (`leg_enc_hvitserk_02_steppe_stand`) |
| 12 | `ecbert_bretwalda_signet` | King Ecgberht's Bretwalda Ring | *Konungshringr Egberhts* | `king_ecbert_wessex` | **Net-New** (`leg_enc_ecbert_01_winchester_court`) |
| 13 | `aella_york_crown_brooch` | King Ælla's Boar-Brooch of Eoforwic | *Jórvíkur-Sylgja Ellu* | `king_aella_northumbria` | **Net-New** (`leg_enc_aella_02_roman_breach`) |
| 14 | `alfred_gold_aestel` | King Alfred's Gold Æstel | *Gull-Æstel Álfráðs* | `alfred_the_great` | **Net-New** (`leg_enc_alfred_02_wedmore_burhs`) |
| 15 | `guthrum_wedmore_cross_torque` | Guthrum-Æthelstan's Wedmore Torque | *Friðbaugr Gorms* | `guthrum_danelaw` | **Net-New** (`leg_enc_guthrum_02_aethelstan_mint`) |

---

## 5. Lade (`lade_hladir`) & Nidaros (`nidaros`) Coexistence Fix

- Removed `abandonedYear: 996` from `lade_hladir` and removed the forced 997 redirect in `resolveActiveSettlementId`.
- Separated map coordinates (`lade_hladir` at `lat: 63.52, lon: 10.55` on the eastern Lade peninsula; `nidaros` at `lat: 63.40, lon: 10.32` at the mouth of the Nidelva) and added distinct SVG label anchor offsets (`dx: 8, dy: -5` vs. `dx: -8, dy: 6`) and a direct `['lade_hladir', 'nidaros']` sea link.
- Updated `controllersByEra` and both English and Persian summaries (`src/data/geography.ts`, `src/i18n/gameDataFa.ts`) to reflect that Eiríkr Hákonarson (995–1015), Sveinn Hákonarson, and Hákon Eiríksson (1015–1029) ruled from Lade into the early 11th century while Nidaros grew gradually after Olaf Tryggvason's 997 founding.
