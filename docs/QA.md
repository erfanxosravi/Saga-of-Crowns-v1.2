# Saga of Crowns — Living Legends QA Cheat Sheet (`docs/QA.md`)

This QA cheat sheet documents the exact deterministic trigger conditions for all **39 Living Legends encounters** across the **22 historical and semi-legendary figures** in **Saga of Crowns** (`حماسه‌ی تاج‌ها`), along with the quickest fixed PRNG seed (`SAGA-793`) and step-by-step route to reach each encounter in **Saga Mode** (`realityMode: 'SAGA'`) without adding any debug UI or cheat toggles to the game.

---

## 1. How Legend Encounters Trigger in the Engine

1. **Deterministic PRNG Seed**:
   - In **Character Creation**, enter a fixed seed string (e.g., `SAGA-793`, `LOTHBROK-835`, `DANELAW-865`, or `NORMANDY-890`) in the **Saga Seed** field and select **Saga Mode** (`realityMode: 'SAGA'`).
   - All seasonal event rolls, legend beat drift variants, and encounter weights (`weight: 18–26`) are evaluated deterministically by `SeededRandom` (`src/engine/prng.ts`).
2. **Direct Chaining (`chain.eventId`)**:
   - Most Encounter II set-pieces (e.g., `leg_enc_ragnar_02_seine`, `leg_enc_lagertha_02_usurper`, `leg_enc_floki_02_iceland`, `leg_enc_rollo_02_epte`, `leg_enc_ivar_02_dumbarton_banner`, `leg_enc_bjorn_02_luna_bier`, `leg_enc_halfdan_02_ploughland`, `leg_enc_ubba_02_cynwit`, `leg_enc_hvitserk_02_steppe_stand`, `leg_enc_sigurd_02_eider_peace`, `leg_enc_aslaug_02_randalin_tears`, `leg_enc_ecbert_02_hingston_down`, `leg_enc_aella_02_roman_breach`, `leg_enc_alfred_02_wedmore_burhs`, `leg_enc_guthrum_02_aethelstan_mint`) are **guaranteed to queue via `delayedEvents`** (`delayYears: 1` or `2`) when you pick Choice 1 or Choice 2 in that legend's Encounter I, in addition to being eligible in the regional pool during their historical window.
3. **Starting Era Shortcuts**:
   - **793 AD Start (Dawn of the Viking Age, player age 16)**: Best for early-era encounters (`king_ecbert_wessex` 802–839, `king_horik_denmark` 827–854, `lagertha_shieldmaiden` 825–868, `aslaug_kraka` 825–872, `ragnar_lothbrok` 834–852). If your first ruler dies around 830–840, continue as your adult **Heir** to seamlessly hit the 840–895 encounters.

---

## First 10 Minutes — Saga Mode, Norway, 838 AD

1. Start a new Saga Mode game in Norway in **838 AD**, at **Hlaðir (Lade)**, age 18 or older. Use a fixed seed (for repeatable QA, `SAGA-793`) and stay in the Norway region while advancing the year.
2. The settlements active in Norway in 838 are **Kaupang**, **Tunsberg & Borre**, **Avaldsnes (Karmøy)**, **Hlaðir (Lade)**, and **Borg in Lofoten (Hålogaland)**. Giske & Borgund, Nidaros, and later-founded Norwegian settlements are not active yet.
3. The starting encounter pool includes `leg_enc_aldwin_01_captive_scribe`, `leg_enc_ragnar_01_bench`, `leg_enc_lagertha_01_headland`, `leg_enc_aslaug_01_harp_loom`, and `leg_enc_horik_01_hedeby`. Encounters are weighted, not all guaranteed on the first annual roll. Resolve Aldwin’s captive-scribe encounter in Norway, Denmark, or the British Isles by 858; its three choices set the player’s religion to Christian, Norse Pagan, or Syncretic.
4. Choose any Aldwin I outcome to queue `leg_enc_aldwin_02_cross_and_grove` **two in-game years later**. It presents a separate decision about a chapel, the sacred grove, or a bilingual peace-law, again applying the selected religion through the game’s `newReligion` effect.
5. Living Legends beats progress on their historical dates and reach Lade after the listed regional travel delay: Ecgberht’s Hingston Down (838 Summer; 2 seasons), Ecgberht’s death at Winchester (839 Summer; 2), Ragnar’s Kattegat muster (840 Spring; 2), Lagertha’s fleet at Roskilde (842 Summer; 2), Hastein at Noirmoutier (843 Summer; 3), Floki at Kaupang (844 Spring; 0), Ragnar at Paris and Aldwin at Paris (845 Spring; 3), and Horik’s Hamburg fleet (845 Summer; 2). A beat occurs in its dated year; the rumor arrives later according to its delay and the player’s location.

## 2. Master Trigger Table — All 39 Legend Encounters

| # | Encounter ID | Legend (`legendId`) | Year Range | Min Age | Eligible Regions (`regions`) | Required Flags (`requiredFlags`) | Blocked By Flags (`blockedByFlags`) | Heirloom Granted (Choice) |
|---|---|---|---|---|---|---|---|---|
| 1 | `leg_enc_ragnar_01_bench` | `ragnar_lothbrok` | `834–852` | `15` | `Denmark`, `Norway`, `Sweden`, `Baltic` | None | `legend_ragnar_dead_865`, `leg_enc_ragnar_01_done` | — |
| 2 | `leg_enc_ragnar_02_seine` | `ragnar_lothbrok` | `842–855` | `16` | Any (Queued by `leg_enc_ragnar_01_bench` +1 yr) | `leg_enc_ragnar_01_done` | `legend_ragnar_dead_865`, `leg_enc_ragnar_02_done` | — |
| 3 | `leg_enc_ragnar_04_elegy` | `ragnar_lothbrok` | `865–872` | `15` | Any (Triggers after Ragnar's 865 death beat) | `legend_ragnar_dead_865` | `leg_enc_ragnar_04_elegy_done` | `ragnar_serpent_armring` (Choice 1/2) |
| 4 | `leg_enc_lagertha_01_headland` | `lagertha_shieldmaiden` | `825–868` | `15` | `Norway`, `Denmark`, `British Isles` | None | `leg_enc_lagertha_01_done` | — |
| 5 | `leg_enc_lagertha_02_usurper` | `lagertha_shieldmaiden` | `835–873` | `16` | Any (Queued by `leg_enc_lagertha_01_headland` +2 yrs) | `leg_enc_lagertha_01_done` | `leg_enc_lagertha_02_done` | `lagertha_hlathgerd_spear` (Choice 1) |
| 6 | `leg_enc_floki_01_keel` | `floki_raven_sailor` & `brother_aldwin_scribe` | `846–875` | `15` | `Norway`, `Denmark`, `British Isles`, `North Atlantic` | None | `leg_enc_floki_01_done` | — |
| 7 | `leg_enc_floki_02_iceland` | `floki_raven_sailor` | `860–885` | `16` | Any (Queued by `leg_enc_floki_01_keel` +2 yrs) | `leg_enc_floki_01_done` | `leg_enc_floki_02_done` | `floki_raven_lodestone` (Choice 1/2) |
| 8 | `leg_enc_rollo_01_walker` | `rollo_normandy` | `876–908` | `15` | `Norway`, `Denmark`, `Continent`, `British Isles` | None | `leg_enc_rollo_01_done` | — |
| 9 | `leg_enc_rollo_02_epte` | `rollo_normandy` | `890–928` | `16` | `Continent`, `British Isles`, `Denmark`, `Norway` (or +2 yr chain) | None | `leg_enc_rollo_02_done` | `rollo_rouen_armring` (Choice 1) |
| 10 | `leg_enc_ivar_01_shield_council` | `ivar_boneless` | `856–872` | `15` | `British Isles`, `Ireland`, `Denmark` | None | `leg_enc_ivar_01_done` | — |
| 11 | `leg_enc_ivar_02_dumbarton_banner` | `ivar_boneless` | `865–873` | `16` | `Ireland`, `British Isles`, `North Atlantic` (or +2 yr chain) | None | `leg_enc_ivar_02_done` | `hrafnsmerki_banner` (Choice 1) |
| 12 | `leg_enc_bjorn_01_gibraltar` | `bjorn_ironside` | `853–876` | `15` | `Iberia & Al-Andalus`, `Mediterranean`, `Continent`, `Sweden` | None | `leg_enc_bjorn_01_done` | — |
| 13 | `leg_enc_bjorn_02_luna_bier` | `bjorn_ironside` | `858–882` | `16` | `Mediterranean`, `Sweden`, `Continent`, `Denmark` (or +1 yr chain) | None | `leg_enc_bjorn_02_done` | `shield_of_ironside` (Choice 1) |
| 14 | `leg_enc_halfdan_01_repton` | `halfdan_ragnarsson` | `866–876` | `15` | `British Isles`, `Denmark`, `Ireland` | None | `leg_enc_halfdan_01_done` | — |
| 15 | `leg_enc_halfdan_02_ploughland` | `halfdan_ragnarsson` | `873–877` | `16` | `British Isles`, `Ireland`, `Denmark` (or +2 yr chain) | None | `leg_enc_halfdan_02_done` | `bragarfull_horn_lejre` (Choice 1) |
| 16 | `leg_enc_ubba_01_frisian_wolf` | `ubba_ragnarsson` | `852–875` | `15` | `Continent`, `British Isles`, `Denmark` | None | `leg_enc_ubba_01_done` | — |
| 17 | `leg_enc_ubba_02_cynwit` | `ubba_ragnarsson` | `872–878` | `16` | `British Isles`, `Continent`, `Denmark` (or +2 yr chain) | None | `leg_enc_ubba_02_done` | `serpent_of_the_wash` (Choice 1/2) |
| 18 | `leg_enc_hvitserk_01_portage` | `hvitserk_ragnarsson` | `864–878` | `15` | `Kievan Rus & Rivers`, `Sweden`, `Denmark`, `British Isles` | None | `leg_enc_hvitserk_01_done` | — |
| 19 | `leg_enc_hvitserk_02_steppe_stand` | `hvitserk_ragnarsson` | `870–879` | `16` | `Kievan Rus & Rivers`, `Sweden`, `Denmark` (or +2 yr chain) | None | `leg_enc_hvitserk_02_done` | `hvitserk_eastern_blade` (Choice 1/2) |
| 20 | `leg_enc_sigurd_01_ouroboros` | `sigurd_snake_eye` | `853–886` | `15` | `Denmark`, `Sweden`, `Norway`, `British Isles` | None | `leg_enc_sigurd_01_done` | — |
| 21 | `leg_enc_sigurd_02_eider_peace` | `sigurd_snake_eye` | `868–891` | `16` | `Denmark`, `Continent` (or +2 yr chain) | None | `leg_enc_sigurd_02_done` | `fang_of_fafnir` (Choice 1) |
| 22 | `leg_enc_aslaug_01_harp_loom` | `aslaug_kraka` | `825–872` | `15` | `Denmark`, `Norway`, `Sweden` | None | `leg_enc_aslaug_01_done` | `aslaug_unwoven_shirt` (Choice 1) |
| 23 | `leg_enc_aslaug_02_randalin_tears` | `aslaug_kraka` | `860–875` | `16` | `Denmark`, `Sweden`, `Norway`, `British Isles` (or +2 yr chain) | None | `leg_enc_aslaug_02_done` | — |
| 24 | `leg_enc_ecbert_01_winchester_court` | `king_ecbert_wessex` | `802–839` | `15` | `British Isles`, `Continent` | None | `leg_enc_ecbert_01_done` | `ecbert_bretwalda_signet` (Choice 1) |
| 25 | `leg_enc_ecbert_02_hingston_down` | `king_ecbert_wessex` | `825–839` | `15` | `British Isles`, `Denmark`, `Norway` (or +1 yr chain) | None | `leg_enc_ecbert_02_done` | — |
| 26 | `leg_enc_aella_01_eoforwic_usurper` | `king_aella_northumbria` | `858–866` | `15` | `British Isles`, `Denmark`, `Norway` | None | `leg_enc_aella_01_done` | — |
| 27 | `leg_enc_aella_02_roman_breach` | `king_aella_northumbria` | `865–867` | `16` | `British Isles`, `Denmark`, `Norway`, `Sweden` (or +1 yr chain) | None | `leg_enc_aella_02_done` | `aella_york_crown_brooch` (Choice 1/2) |
| 28 | `leg_enc_alfred_01_athelney_fens` | `alfred_the_great` | `871–885` | `15` | `British Isles`, `Continent`, `Denmark` | None | `leg_enc_alfred_01_done` | — |
| 29 | `leg_enc_alfred_02_wedmore_burhs` | `alfred_the_great` | `878–899` | `16` | `British Isles`, `Continent`, `Denmark`, `Norway` (or +1 yr chain) | None | `leg_enc_alfred_02_done` | `alfred_gold_aestel` (Choice 1) |
| 30 | `leg_enc_guthrum_01_night_march` | `guthrum_danelaw` | `871–882` | `15` | `British Isles`, `Denmark` | None | `leg_enc_guthrum_01_done` | — |
| 31 | `leg_enc_guthrum_02_aethelstan_mint` | `guthrum_danelaw` | `878–890` | `16` | `British Isles`, `Denmark`, `Continent` (or +2 yr chain) | None | `leg_enc_guthrum_02_done` | `guthrum_wedmore_cross_torque` (Choice 1) |
| 32 | `leg_enc_hastein_01_loire` | `hastein_loire` | `848–896` | `15` | `Continent`, `Mediterranean`, `British Isles`, `Denmark` | None | `leg_enc_hastein_01_done` | — |
| 33 | `leg_enc_horik_01_hedeby` | `king_horik_denmark` | `827–854` | `15` | `Denmark`, `Continent`, `Baltic`, `Norway` | None | `leg_enc_horik_01_done` | — |
| 34 | `leg_enc_charles_01_frankia` | `charles_the_simple` | `893–923` | `15` | `Continent`, `British Isles`, `Denmark` | None | `leg_enc_charles_01_done` | — |
| 35 | `leg_enc_odo_01_paris_towers` | `count_odo_paris` | `880–898` | `15` | `Continent`, `British Isles`, `Denmark` | None | `leg_enc_odo_01_done` | — |
| 36 | `leg_enc_harald_01_hafrsfjord` | `harald_fairhair` | `865–928` | `15` | `Norway`, `North Atlantic`, `British Isles`, `Denmark` | None | `leg_enc_harald_01_done` | — |
| 37 | `leg_enc_rurik_01_ladoga` | `rurik_of_ladoga` | `855–879` | `15` | `Kievan Rus & Rivers`, `Baltic`, `Sweden` | None | `leg_enc_rurik_01_done` | — |
| 38 | `leg_enc_aldwin_01_captive_scribe` | `brother_aldwin_scribe` | `838–858` | `15` | `Norway`, `Denmark`, `British Isles` | None | `leg_enc_aldwin_01_done` | — |
| 39 | `leg_enc_aldwin_02_cross_and_grove` | `brother_aldwin_scribe` | `840–878` | `16` | Any (queued by Aldwin I +2 yrs) | `leg_enc_aldwin_01_done` | `leg_enc_aldwin_02_done` | — |

---

## 3. Quickest Fixed Seed & Step-by-Step Playbook per Encounter

### Route A — Scandinavian & Early Carolingian Window (`802–855 AD`)
- **Fixed Seed**: `SAGA-793`
- **Setup**: Start in **Saga Mode**, Homeland **Denmark** (`hedeby` or `roskilde_lejre`) or **Norway** (`lade_hladir`).

1. **`leg_enc_ecbert_01_winchester_court` (`802–839`) & `leg_enc_ecbert_02_hingston_down` (`825–839`)**:
   - **Steps**: From `hedeby`, open the Map (`VikingMap`) or Sea Voyage action and sail to `london` or `jorvik_york` (`British Isles` region) by `802 AD`. Advance seasons (`Next Season`).
   - **Trigger**: `leg_enc_ecbert_01_winchester_court` fires in `British Isles` (`weight: 22`). Select Choice 1 (`ecbert_seal_winchester_charter`) to claim **King Ecgberht's Bretwalda Ring** (`ecbert_bretwalda_signet`) and automatically queue `leg_enc_ecbert_02_hingston_down` 1 year later (or trigger it directly between `825–839`).
2. **`leg_enc_lagertha_01_headland` (`825–868`) & `leg_enc_lagertha_02_usurper` (`835–873`)**:
   - **Steps**: Remain in or sail to `Norway` (`lade_hladir` / `kaupang`) or `Denmark` (`roskilde_lejre`) starting in `825 AD`.
   - **Trigger**: `leg_enc_lagertha_01_headland` triggers (`weight: 18`). Choose Choice 1 (`lagertha_spar_wing_drill`) to queue `leg_enc_lagertha_02_usurper` (+2 years), then choose Choice 1 (`lagertha_storm_gate_together`) to earn **Lagertha's Winged Spear of Gaular** (`lagertha_hlathgerd_spear`).
3. **`leg_enc_aslaug_01_harp_loom` (`825–872`) & `leg_enc_aslaug_02_randalin_tears` (`860–875`)**:
   - **Steps**: Stay in `Denmark` (`roskilde_lejre` / `hedeby`), `Norway`, or `Sweden` (`birka` / `uppsala`) from `825 AD` onward.
   - **Trigger**: `leg_enc_aslaug_01_harp_loom` fires (`weight: 19`). Pick Choice 1 (`aslaug_answer_ordstirr_riddle`) to immediately receive **Aslaug's Unwoven Shirt** (`aslaug_unwoven_shirt`) and queue `leg_enc_aslaug_02_randalin_tears`.
4. **`leg_enc_horik_01_hedeby` (`827–854`)**:
   - **Steps**: Stay moored at `hedeby` or `roskilde_lejre` (`Denmark`) between `827` and `854 AD`.
   - **Trigger**: `leg_enc_horik_01_hedeby` fires (`weight: 20`). Pick Choice 1 (`horik_swear_royal_coast_guard`) for +28 Standing with King Horik I and +45 Silver.
5. **`leg_enc_ragnar_01_bench` (`834–852`), `leg_enc_ragnar_02_seine` (`842–855`), & `leg_enc_ragnar_04_elegy` (`865–872`)**:
   - **Steps**: Be in `Denmark`, `Norway`, or `Sweden` between `834` and `852 AD`.
   - **Trigger**:
     1. In `leg_enc_ragnar_01_bench`, pick Choice 1 (`swear_ragnar_bench_oath`) or Choice 2 (`sail_independent_partner`), which sets `leg_enc_ragnar_01_done` and queues `leg_enc_ragnar_02_seine` (+1 year).
     2. Advance 4 seasons to trigger `leg_enc_ragnar_02_seine` (Siege of Paris, 7,000 lbs silver ransom).
     3. Advance to `865 AD`: Ragnar's canonical death beat (`ragnar_beat_865_snake_pit`) sets `legend_ragnar_dead_865`, unlocking `leg_enc_ragnar_04_elegy` (`weight: 26`), where Choice 1 or 2 grants **Ragnar's Ouroboros Arm-Ring** (`ragnar_serpent_armring`).
6. **`leg_enc_floki_01_keel` (`846–875`) & `leg_enc_floki_02_iceland` (`860–885`)**:
   - **Steps**: Stay in `Norway` (`avaldsnes` / `lade_hladir`) or `Denmark` from `846 AD` onward.
   - **Trigger**: `leg_enc_floki_01_keel` triggers both **Hrafna-Flóki** and **Brother Aldwin** standing effects (`floki_honor_ravens_blot`, `floki_bridge_aldwin_stars`, or `floki_side_with_aldwin_christ`) and queues `leg_enc_floki_02_iceland` (+2 years), which grants **Floki's Sunstone & Raven-Cage** (`floki_raven_lodestone`).

---

### Route B — Mediterranean, Loire & Kievan Rus Window (`848–882 AD`)
- **Fixed Seed**: `LOTHBROK-850`
- **Setup**: Continue with your adult heir in `848–855 AD` in **Saga Mode**.

7. **`leg_enc_hastein_01_loire` (`848–896`)**:
   - **Steps**: Sail to `rouen_seine`, `paris`, or `dorestad` (`Continent`), or remain in `Denmark` / `British Isles` between `848` and `896 AD`.
   - **Trigger**: `leg_enc_hastein_01_loire` fires (`weight: 20`). Choose `hastein_ride_brissarthe_raid` for +28 Standing with Hastein and +50 Silver.
8. **`leg_enc_bjorn_01_gibraltar` (`853–876`) & `leg_enc_bjorn_02_luna_bier` (`858–882`)**:
   - **Steps**: Sail to `Sweden` (`uppsala` / `birka`), `Continent` (`rouen_seine`), or `Mediterranean` / `Iberia & Al-Andalus` between `853` and `876 AD`.
   - **Trigger**: In `leg_enc_bjorn_01_gibraltar`, select Choice 1 (`bjorn_ram_strait_vanguard`) or Choice 2 (`bjorn_navigate_nekor_current`) to queue `leg_enc_bjorn_02_luna_bier` (+1 year). In `leg_enc_bjorn_02_luna_bier`, select Choice 1 (`bjorn_carry_luna_bier`) to claim **The Shield of Björn Ironside** (`shield_of_ironside`).
9. **`leg_enc_rurik_01_ladoga` (`855–879`)**:
   - **Steps**: Sail east to `staraya_ladoga`, `novgorod_holmgard`, or `birka` (`Kievan Rus & Rivers`, `Baltic`, or `Sweden`) between `855` and `879 AD`.
   - **Trigger**: `leg_enc_rurik_01_ladoga` fires (`weight: 21`). Choose `rurik_swear_holmgard_compact` for +28 Standing with Prince Rurik and eastern river tribute.
10. **`leg_enc_hvitserk_01_portage` (`864–878`) & `leg_enc_hvitserk_02_steppe_stand` (`870–879`)**:
    - **Steps**: Remain in `Kievan Rus & Rivers` (`staraya_ladoga` / `novgorod_holmgard` / `kiev_konugard`) or `Sweden` / `Denmark` between `864` and `878 AD`.
    - **Trigger**: In `leg_enc_hvitserk_01_portage`, select Choice 1 (`hvitserk_haul_and_ambush`) or Choice 2 (`hvitserk_trade_sable_dirhams`) to queue `leg_enc_hvitserk_02_steppe_stand` (+2 years). Both Choice 1 (historical divergence rescue) and Choice 2 (honoring his last stand) grant **Hvitserk's Eastern Blade** (`hvitserk_eastern_blade`).

---

### Route C — Great Heathen Army, Northumbria & Danelaw Window (`856–891 AD`)
- **Fixed Seed**: `DANELAW-865`
- **Setup**: Position your ruler at `jorvik_york`, `london`, `dublin`, or `hedeby` in **Saga Mode** between `856` and `885 AD`.

11. **`leg_enc_aella_01_eoforwic_usurper` (`858–866`) & `leg_enc_aella_02_roman_breach` (`865–867`)**:
    - **Steps**: Be in `British Isles` (`jorvik_york`), `Denmark`, or `Norway` between `858` and `866 AD`.
    - **Trigger**: In `leg_enc_aella_01_eoforwic_usurper`, choose Choice 1 (`aella_spy_york_walls`) or Choice 2 (`aella_sell_mercenary_service`) to queue `leg_enc_aella_02_roman_breach` (+1 year). In `leg_enc_aella_02_roman_breach`, either choice grants **King Ælla's Boar-Brooch of Eoforwic** (`aella_york_crown_brooch`).
12. **`leg_enc_ivar_01_shield_council` (`856–872`) & `leg_enc_ivar_02_dumbarton_banner` (`865–873`)**:
    - **Steps**: Be in `British Isles` (`jorvik_york`), `Ireland` (`dublin`), or `Denmark` from `856 AD`.
    - **Trigger**: In `leg_enc_ivar_01_shield_council`, pick Choice 1 (`ivar_hold_inner_trap`) or Choice 2 (`ivar_scout_humber_horses`) to queue `leg_enc_ivar_02_dumbarton_banner` (+2 years). Pick Choice 1 (`ivar_crack_dumbarton_well`) to claim the **Raven Banner (Hrafnsmerki)** (`hrafnsmerki_banner`).
13. **`leg_enc_ubba_01_frisian_wolf` (`852–875`) & `leg_enc_ubba_02_cynwit` (`872–878`)**:
    - **Steps**: Be in `British Isles`, `Continent` (`dorestad`), or `Denmark` from `852 AD`.
    - **Trigger**: In `leg_enc_ubba_01_frisian_wolf`, pick Choice 1 (`ubba_charge_fen_wedge`) or Choice 2 (`ubba_learn_galdr_runes`) to queue `leg_enc_ubba_02_cynwit` (+2 years). Both Choice 1 (saving Ubba at Cynwit) and Choice 2 (holding the shore) grant **The Serpent of the Wash (Ormrinn)** (`serpent_of_the_wash`).
14. **`leg_enc_halfdan_01_repton` (`866–876`) & `leg_enc_halfdan_02_ploughland` (`873–877`)**:
    - **Steps**: Stay in `British Isles` (`jorvik_york` / `london`) or `Denmark` between `866` and `876 AD`.
    - **Trigger**: In `leg_enc_halfdan_01_repton`, pick Choice 1 (`halfdan_fortify_repton_camp`) or Choice 2 (`halfdan_mint_tribute_silver`) to queue `leg_enc_halfdan_02_ploughland` (+2 years). Pick Choice 1 (`halfdan_claim_yorkshire_ploughland`) to claim the **Oath-Horn of Lejre (Bragarfull)** (`bragarfull_horn_lejre`).
15. **`leg_enc_sigurd_01_ouroboros` (`853–886`) & `leg_enc_sigurd_02_eider_peace` (`868–891`)**:
    - **Steps**: Be in `Denmark` (`roskilde_lejre` / `hedeby`) from `853 AD`.
    - **Trigger**: In `leg_enc_sigurd_01_ouroboros`, pick Choice 1 (`sigurd_pledge_sound_fleet`) or Choice 2 (`sigurd_recite_volsung_lay`) to queue `leg_enc_sigurd_02_eider_peace` (+2 years). Pick Choice 1 (`sigurd_swear_eider_weapon_oath`) to claim the **Fang of Fafnir Blade** (`fang_of_fafnir`).
16. **`leg_enc_alfred_01_athelney_fens` (`871–885`) & `leg_enc_alfred_02_wedmore_burhs` (`878–899`)**:
    - **Steps**: Be in `British Isles` (`london` / `jorvik_york`), `Continent`, or `Denmark` between `871` and `885 AD`.
    - **Trigger**: In `leg_enc_alfred_01_athelney_fens`, pick Choice 1 (`alfred_parley_athelney_truce`) to queue `leg_enc_alfred_02_wedmore_burhs` (+1 year). In `leg_enc_alfred_02_wedmore_burhs`, pick Choice 1 (`alfred_share_northern_geography`) to claim **King Alfred's Gold Æstel** (`alfred_gold_aestel`).
17. **`leg_enc_guthrum_01_night_march` (`871–882`) & `leg_enc_guthrum_02_aethelstan_mint` (`878–890`)**:
    - **Steps**: Be in `British Isles` or `Denmark` between `871` and `882 AD`.
    - **Trigger**: In `leg_enc_guthrum_01_night_march`, pick Choice 1 (`guthrum_ride_exeter_column`) to queue `leg_enc_guthrum_02_aethelstan_mint` (+2 years). Pick Choice 1 (`guthrum_endorse_danelaw_peace`) to claim **Guthrum-Æthelstan's Wedmore Torque** (`guthrum_wedmore_cross_torque`).

---

### Route D — Hafrsfjord, Siege of Paris & Normandy Charter Window (`865–928 AD`)
- **Fixed Seed**: `NORMANDY-890`
- **Setup**: Sail between `Norway` (`avaldsnes` / `lade_hladir`) and `Continent` (`rouen_seine` / `paris`) between `865` and `923 AD`.

18. **`leg_enc_harald_01_hafrsfjord` (`865–928`)**:
    - **Steps**: Be in `Norway` (`avaldsnes`, `tunsberg`, `lade_hladir`, or `giske_more`), `North Atlantic` (`reykjavik`), `British Isles`, or `Denmark` between `865` and `928 AD`.
    - **Trigger**: `leg_enc_harald_01_hafrsfjord` fires (`weight: 22`). Choose `harald_join_hafrsfjord_line` (+30 Standing with Harald Fairhair, +1 Farmstead), `harald_sail_free_to_iceland` (-24 Standing, unlocks Reykjavik), or `harald_negotiate_jarl_autonomy` (+22 Standing, +45 Silver).
19. **`leg_enc_odo_01_paris_towers` (`880–898`)**:
    - **Steps**: Sail to `paris` or `rouen_seine` (`Continent`), or `British Isles` / `Denmark` between `880` and `898 AD`.
    - **Trigger**: `leg_enc_odo_01_paris_towers` fires (`weight: 22`). Choose `odo_storm_grand_pont`, `odo_broker_charles_fat_ransom` (+55 Silver), or `odo_salute_iron_defender`.
20. **`leg_enc_rollo_01_walker` (`876–908`) & `leg_enc_rollo_02_epte` (`890–928`)**:
    - **Steps**: Be in `Norway`, `Denmark`, `Continent` (`rouen_seine`), or `British Isles` from `876 AD`.
    - **Trigger**: In `leg_enc_rollo_01_walker`, pick Choice 1 (`rollo_swear_seine_pact`) or Choice 2 (`rollo_supply_provisions`) to queue `leg_enc_rollo_02_epte` (+2 years). In `leg_enc_rollo_02_epte`, pick Choice 1 (`rollo_epte_stand_witness`) to claim **Rollo's Arm-Ring of the Seine** (`rollo_rouen_armring`).
21. **`leg_enc_charles_01_frankia` (`893–923`)**:
    - **Steps**: Be in `Continent` (`rouen_seine` / `paris`), `British Isles`, or `Denmark` between `893` and `923 AD`.
    - **Trigger**: `leg_enc_charles_01_frankia` fires (`weight: 21`). Choose `charles_seal_epte_charter` (+28 Standing with Charles the Simple, +50 Silver) or `charles_demand_flanders_silver`.

---

## 4. Automated CLI Verification

You can verify all 22 legends, 98 world beats, 39 encounters, 16 canonical heirlooms, and the engine simulation at any time from the terminal without touching the UI:

```bash
npm run check:legends
npm run check:engine
```
