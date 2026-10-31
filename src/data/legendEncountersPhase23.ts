import { GameEventFa } from '../i18n/eventsFa';
import { GameEvent } from '../types/game';

/**
 * PHASE 2 & 3 SIGNATURE FACE-TO-FACE LEGEND ENCOUNTERS (24 Events)
 * Priority order:
 *  1. Rollo (rollo_normandy)
 *  2. Ivar the Boneless (ivar_boneless)
 *  3. Björn Ironside (bjorn_ironside)
 *  4. Halfdan Ragnarsson (halfdan_ragnarsson)
 *  5. Ubba Ragnarsson (ubba_ragnarsson)
 *  6. Hvitserk Ragnarsson (hvitserk_ragnarsson)
 *  7. Sigurd Snake-in-the-Eye (sigurd_snake_eye)
 *  8. Queen Aslaug / Kráka (aslaug_kraka)
 *  9. King Ecgberht of Wessex (king_ecbert_wessex)
 * 10. King Ælla of Northumbria (king_aella_northumbria)
 * 11. King Alfred of Wessex (alfred_the_great)
 * 12. King Guthrum / Æthelstan (guthrum_danelaw)
 */

export const LEGEND_ENCOUNTERS_PHASE_23_EVENTS: GameEvent[] = [
  // =========================================================================
  // 1. ROLLO (GÖNGU-HRÓLFR) — ENCOUNTERS I & II
  // =========================================================================
  {
    id: 'leg_enc_rollo_01_walker',
    title: 'Hall of Legends · Göngu-Hrólfr & the Strandhögg Outlawry',
    category: 'Historical Set-Piece',
    iconType: 'ship',
    provenance: 'Heimskringla',
    isSemiLegendary: false,
    sagaVsChronicleNote:
      'DOCUMENTED / CONTESTED: Snorri’s Heimskringla (Haralds saga hárfagra) identifies Rollo with Göngu-Hrólfr Rögnvaldsson, outlawed after a Viken cattle-foray despite his mother Hildr’s skaldic verse; Norman chronicler Dudo of Saint-Quentin places his origins in Dacia/Denmark.',
    yearRange: [876, 908],
    ageMin: 15,
    regions: ['Norway', 'Denmark', 'Continent', 'British Isles'],
    blockedByFlags: ['leg_enc_rollo_01_done'],
    weight: 18,
    text: 'At the timbered wharf, a warrior of immense stature steps down from a broad-beamed longship after leading a sway-backed fjord pony by the bridle — for whenever he mounts a northern horse, his booted ankles drag through the heather and stones. Around the harbor, seasoned oarsmen hail him as Göngu-Hrólfr: Hrólfr the Walker. Norse saga tradition says he was the son of Earl Rognvald of Møre; Frankish chronicler Dudo instead gives Rollo a Danish origin.\n\nOutlawed in Norway after his hungry crew made an old-style cattle foray (strandhögg) on the Viken shore, he rests a scarred forearm on his axe-helve and studies the sleek lines of your hull. “Kings in the north want tame tax-collectors and sheep-wardens, not free sea-captains,” Hrólfr rumbles, his voice carrying over the creak of mooring-hawsers. “Down on the winding Seine, the stone quays and rich vineyards of Rouen wait for men who know how to seize a river-mouth and never let go. Will your prow steer south with mine?”',
    choices: [
      {
        id: 'rollo_swear_seine_pact',
        label: 'Clasp Göngu-Hrólfr’s forearm and swear a river-captain’s pact for the Lower Seine',
        tooltipHint: '+26 Standing with Rollo · +6 Combat & Seamanship · Unlocks Epte Charter',
        outcomeText:
          'Your grip meets Hrólfr’s iron wrist. “Good,” he laughs, his voice shaking the wharf planks. “Let the northern kings keep their barren skerries — we shall carve an earldom of vineyards and stone towers on the Seine!”',
        effects: {
          fame: 16,
          stats: { strength: 5, honor: 5 },
          skills: { combat: 6, seamanship: 6 },
          addFlags: ['leg_enc_rollo_01_done', 'rollo_seine_companion'],
          legendStandingDelta: {
            legendId: 'rollo_normandy',
            delta: 26,
            addOath: 'Swore the Seine Estuary Pact with Göngu-Hrólfr (Rollo)',
            addOathFa: 'پیمان هم‌رزمی در مصب رود سن با گونگو-هرولف (رولو)',
          },
        },
        chain: {
          eventId: 'leg_enc_rollo_02_epte',
          delayYears: 2,
        },
      },
      {
        id: 'rollo_supply_provisions',
        label: 'Refit Hrólfr’s outlawed squadron with salted beef and ash-oars in exchange for Frankish silver',
        tooltipHint: '+18 Standing with Rollo · +35 Silver · +5 Trade & Diplomacy',
        outcomeText:
          'You roll barrels of salt-herring and fresh ash-spars aboard Hrólfr’s flagship. True to his word, the tall war-leader weighs out a heavy pouch of Carolingian deniers from his sea-chest.',
        effects: {
          silver: 35,
          fame: 12,
          skills: { trade: 5, diplomacy: 5 },
          addFlags: ['leg_enc_rollo_01_done'],
          legendStandingDelta: {
            legendId: 'rollo_normandy',
            delta: 18,
            addOath: 'Outfitted Göngu-Hrólfr’s fleet after the Viken outlawry',
            addOathFa: 'تجهیز ناوگان گونگو-هرولف پس از حکم تبعید ویکن',
          },
        },
        chain: {
          eventId: 'leg_enc_rollo_02_epte',
          delayYears: 2,
        },
      },
      {
        id: 'rollo_enforce_strandhogg_ban',
        label: 'Denounce his Viken cattle-raid as lawless piracy and bar your harbor to his ships',
        tooltipHint: '-24 Standing with Rollo · +8 Law · +6 Stability',
        outcomeText:
          'Hrólfr’s jaw sets like granite as your spearmen line the jetty. “Remember the wolf you turned away from the fold,” he warns darkly before backing oars into the open sea.',
        effects: {
          stability: 6,
          stats: { honor: 4 },
          skills: { law: 8 },
          addFlags: ['leg_enc_rollo_01_done'],
          legendStandingDelta: {
            legendId: 'rollo_normandy',
            delta: -24,
            addFeud: 'Barred Göngu-Hrólfr’s fleet over the Viken strandhögg outlawry',
            addFeudFa: 'بستن بندر به روی ناوگان رولو به بهانه مصادره ساحلی ویکن',
          },
        },
      },
    ],
  },

  {
    id: 'leg_enc_rollo_02_epte',
    title: 'Hall of Legends · The Foot-Kiss & the Charter on the River Epte',
    category: 'Historical Set-Piece',
    iconType: 'crown',
    provenance: 'Frankish Annals',
    isSemiLegendary: false,
    sagaVsChronicleNote:
      'DOCUMENTED: Dudo of Saint-Quentin and Flodoard of Reims record the 911 Treaty of Saint-Clair-sur-Epte granting Rouen to Rollo, including the famous scene where a Norse retainer lifts King Charles’s foot rather than kneeling.',
    yearRange: [890, 928],
    ageMin: 16,
    regions: ['Continent', 'British Isles', 'Denmark', 'Norway'],
    blockedByFlags: ['leg_enc_rollo_02_done'],
    weight: 20,
    text: 'Along the grassy banks of the River Epte, Frankish bishops in gold-embroidered copes and mitres face Göngu-Hrólfr’s mail-clad northern captains across an oak boundary table. Weary of decades of siege and river-raids, King Charles the Simple offers the walled city of Rouen and the coastal counties in perpetual fief if Rollo will accept baptism, guard the Lower Seine against all other raiders — and kiss the royal foot in public homage.\n\n“Never will I bend my knee to any man’s shoe, nor bow my head to a Frankish stirrup,” Rollo growls in Norse, his hand tightening on his sword-belt as he turns to you and his inner circle while Archbishop Franco and the Frankish court hold their breath. The parchment charter of Normandy lies unsealed on the table between war and earldom. How do you counsel the founder of Normandy at the sealing of the treaty?',
    choices: [
      {
        id: 'rollo_epte_stand_witness',
        label: 'Have a tall huskarl lift the king’s boot shoulder-high while you witness the Rouen land-charter',
        tooltipHint: '+32 Standing with Rollo · Gain Heirloom: Rollo’s Seine-Warden Torque · +45 Silver · +25 Fame',
        outcomeText:
          'Without bending a knee, the Norseman hoists King Charles’s ankle so high the monarch tumbles back into his bishops’ arms to a roar of Viking laughter! Yet the parchment is sealed in wax, and Rollo clasps his heavy braided Seine-Warden Torque (Hringr Göngu-Hrólfs) around your neck as a co-guarantor of Rouen.',
        effects: {
          silver: 45,
          fame: 25,
          stats: { charisma: 6, honor: 6 },
          skills: { diplomacy: 8, law: 6 },
          addHeirloomIds: ['rollo_rouen_armring'],
          addFlags: ['leg_enc_rollo_02_done', 'anchor_normandy_911_founded'],
          legendStandingDelta: {
            legendId: 'rollo_normandy',
            delta: 32,
            addGift: "Gifted Rollo's Seine-Warden Torque (Hringr Göngu-Hrólfs) at the River Epte treaty",
            addGiftFa: 'دریافت طوق نقره و طلای رولو (نگهبان رود سن) در پیمان رود اپت',
          },
        },
      },
      {
        id: 'rollo_epte_demand_bayeux',
        label: 'Press the Frankish envoys to add the western pastures of Bayeux before a single weapon is sheathed',
        tooltipHint: '+22 Standing with Rollo · +1 Farmstead · +6 Combat & Diplomacy',
        outcomeText:
          'Seeing your locked shields behind Rollo, Archbishop Franco of Rouen persuades King Charles to include the rich coastal pastures in the grant. Rollo awards your house a fertile estate overlooking the Channel.',
        effects: {
          landFarms: 1,
          fame: 20,
          skills: { combat: 6, diplomacy: 6 },
          addFlags: ['leg_enc_rollo_02_done', 'anchor_normandy_911_founded'],
          legendStandingDelta: {
            legendId: 'rollo_normandy',
            delta: 22,
            addOath: 'Secured the western coastal pastures alongside Rollo at Saint-Clair-sur-Epte',
            addOathFa: 'تثبیت مراتع ساحلی غرب نورماندی در کنار رولو در پیمان سن‌کلر',
          },
        },
      },
      {
        id: 'rollo_epte_scorn_baptism',
        label: 'Mock Rollo’s white baptismal robe and sail upriver to raid on your own account',
        tooltipHint: '-28 Standing with Rollo · +55 Silver · +6 Faith (Old Ways)',
        outcomeText:
          'You spit into the Epte and declare that Göngu-Hrólfr has traded Odin’s sea-wind for a Frankish collar. You plunder a riverside priory on the way out to sea, though Rollo’s new river-wardens mark your sails as an enemy of Rouen.',
        effects: {
          silver: 55,
          stats: { faith: 6, cunning: 4 },
          addFlags: ['leg_enc_rollo_02_done'],
          legendStandingDelta: {
            legendId: 'rollo_normandy',
            delta: -28,
            addFeud: 'Scorned Rollo’s baptismal charter at the Epte and raided the Lower Seine',
            addFeudFa: 'تمسخر غسل تعمید و پیمان رولو در رود اپت و غارت مستقل در رود سن',
          },
        },
      },
    ],
  },

  // =========================================================================
  // 2. IVAR THE BONELESS (ÍMAR) — ENCOUNTERS I & II
  // =========================================================================
  {
    id: 'leg_enc_ivar_01_shield_council',
    title: 'Hall of Legends · Carried on Linden-Wood: Ímar’s War-Table Before York',
    category: 'Historical Set-Piece',
    iconType: 'sword',
    provenance: 'Anglo-Saxon Chronicle',
    isSemiLegendary: false,
    sagaVsChronicleNote:
      'DOCUMENTED: The Anglo-Saxon Chronicle (866–867) and Ragnarssona þáttr describe Ivar (Inwær) masterminding the capture of Eoforwic (York) and luring Kings Osberht and Ælla into a fatal street trap inside the Roman walls.',
    yearRange: [856, 872],
    ageMin: 15,
    regions: ['British Isles', 'Ireland', 'Denmark'],
    blockedByFlags: ['leg_enc_ivar_01_done'],
    weight: 20,
    text: 'Four veteran huskarls lower a wide iron-rimmed linden shield onto oak trestles inside the command tent. Upon it sits Ivar the Boneless — Ímar to the Irish annalists and Inwær to the panicked Saxon chroniclers — a bow of seasoned yew resting across his knees and dark eyes as sharp and unblinking as a winter hawk’s.\n\nWith the bone tip of a broadhead arrow, Ivar traces the crumbling Roman stone circuit of Eoforwic (York) in the damp earth between the tent-posts. “Ælla and Osberht hated each other yesterday, yet this spring their rival banners march together to drive us into the Ouse,” he says softly, every captain leaning in to hear. “When their battering-rams break the outer masonry, fools would rush forward to plug the gap. I say we feign disorder, let them pour inside the narrow timbered streets, and shut the iron jaw behind them. Where will your banner stand when the wall falls?”',
    choices: [
      {
        id: 'ivar_hold_inner_trap',
        label: 'Command the hidden cross-street ambush inside York exactly as Ivar’s arrow-tip marks',
        tooltipHint: '+28 Standing with Ivar · +8 Cunning · +7 Combat · Unlocks Dumbarton Rock',
        outcomeText:
          'You station your shield-wall behind the timber storehouses inside the Roman breach. When the Northumbrian host surges in believing the town is won, your horn-blast springs Ivar’s jaw-trap and shatters their column!',
        effects: {
          silver: 40,
          fame: 22,
          stats: { cunning: 8, honor: 4 },
          skills: { combat: 7 },
          addFlags: ['leg_enc_ivar_01_done', 'ivar_york_tactician'],
          legendStandingDelta: {
            legendId: 'ivar_boneless',
            delta: 28,
            addOath: 'Sprung Ivar the Boneless’s inner-street ambush inside the walls of York',
            addOathFa: 'اجرای کمین شهری ایوار بی‌استخوان در درون دیوارهای رومی یورک',
          },
        },
        chain: {
          eventId: 'leg_enc_ivar_02_dumbarton_banner',
          delayYears: 2,
        },
      },
      {
        id: 'ivar_scout_humber_horses',
        label: 'Seize East Anglian and Mercian pasture-horses so Ivar’s host can outride the Saxon scouts',
        tooltipHint: '+20 Standing with Ivar · +6 Seamanship & Trade · +30 Silver',
        outcomeText:
          'Sweeping the river meadows before dawn, you deliver eighty swift mounts to the camp. Ivar nods from his shield-litter: “An army on foot raids a parish; an army on horseback topples kingdoms.”',
        effects: {
          silver: 30,
          fame: 16,
          stats: { cunning: 5 },
          skills: { seamanship: 5, trade: 5 },
          addFlags: ['leg_enc_ivar_01_done'],
          legendStandingDelta: {
            legendId: 'ivar_boneless',
            delta: 20,
            addOath: 'Mounted Ivar’s vanguard columns during the Humber campaign',
            addOathFa: 'تأمین اسب‌های راهوار برای ستون‌های پیشتاز ایوار در کارزار هامبر',
          },
        },
        chain: {
          eventId: 'leg_enc_ivar_02_dumbarton_banner',
          delayYears: 2,
        },
      },
      {
        id: 'ivar_demand_open_field',
        label: 'Scoff that hiding behind stone alleys is craven work and lead your men out onto the open plain',
        tooltipHint: '-22 Standing with Ivar · +6 Strength · -6 Health',
        outcomeText:
          'Ivar’s dark eyes narrow to slits. “Bleed in the mud if you love songs more than victory,” he whispers. Your open-field charge wins bloody renown, though Ivar never forgets that you broke his battle-plan.',
        effects: {
          fame: 18,
          stats: { strength: 6, health: -6, honor: 5 },
          skills: { combat: 5 },
          addFlags: ['leg_enc_ivar_01_done'],
          legendStandingDelta: {
            legendId: 'ivar_boneless',
            delta: -22,
            addFeud: 'Defied Ivar the Boneless’s battle-plan before the walls of Eoforwic',
            addFeudFa: 'سرپیچی از نقشه جنگی ایوار بی‌استخوان در پای دیوارهای یورک',
          },
        },
      },
    ],
  },

  {
    id: 'leg_enc_ivar_02_dumbarton_banner',
    title: 'Hall of Legends · The Raven Banner Over Dumbarton Rock & Dublin',
    category: 'Historical Set-Piece',
    iconType: 'ship',
    provenance: 'Annals of Ulster',
    isSemiLegendary: false,
    sagaVsChronicleNote:
      'DOCUMENTED: The Annals of Ulster (870–871) record Ímar and Amlaíb besieging the British rock-fortress of Alt Clut (Dumbarton Rock) for four months, destroying its well, and returning to Dublin with 200 ships.',
    yearRange: [865, 873],
    ageMin: 16,
    regions: ['Ireland', 'British Isles', 'North Atlantic'],
    blockedByFlags: ['leg_enc_ivar_02_done'],
    weight: 21,
    text: 'Above the cold grey waters of the Firth of Clyde rises the twin-peaked basalt crag of Alt Clut — Dumbarton Rock — which the Britons of Strathclyde deem impregnable to any mortal host. For four bitter months Ivar’s combined fleet from Dublin and York has ringed the tidal estuary, watching the ramparts while above his shield-litter the embroidered Raven Banner (Hrafnsmerki) snaps and spreads its black wings in the salt gale.\n\nCalling you to his litter at dusk, Ivar points his yew bow toward a narrow shadow-cleft in the volcanic rock where seep-water feeds the citadel’s hidden cistern. “Starvation is slow, but thirst breaks a garrison in three suns,” the King of Dublin and York tells you quietly. “Scale that cliff-face and cut that vein of fresh water tonight, and two hundred prize keels laden with British gold and captives will sail back with us to Dyflinn before the autumn gales.”',
    choices: [
      {
        id: 'ivar_crack_dumbarton_well',
        label: 'Scale the basalt cleft by night with iron picks and foul the citadel’s rock-spring',
        tooltipHint: '+32 Standing with Ivar · Gain Heirloom: Hrafnsmerki (Raven Banner) · +50 Silver · +28 Fame',
        outcomeText:
          'Hanging over the surf by braided hide ropes, your sappers split the basalt conduit and drain Dumbarton’s well! Within three days the Strathclyde king yields. At the Dublin division of spoils, Ivar entrusts the sacred Raven Banner (Hrafnsmerki) to your flagship.',
        effects: {
          silver: 50,
          fame: 28,
          stats: { cunning: 7, strength: 4 },
          skills: { combat: 6, craft: 6 },
          addHeirloomIds: ['hrafnsmerki_banner'],
          addFlags: ['leg_enc_ivar_02_done', 'ivar_irish_sea_partner'],
          legendStandingDelta: {
            legendId: 'ivar_boneless',
            delta: 32,
            addGift: 'Entrusted with Hrafnsmerki (The Raven Banner) after breaking Dumbarton Rock',
            addGiftFa: 'دریافت پرچم زاغ سیاه (هرافنزمِرکی) از دست ایوار پس از فتح دژ دامبارتون',
          },
        },
      },
      {
        id: 'ivar_charter_irish_sea_trade',
        label: 'Organize the 200-ship convoy between the Clyde, York, and Dublin’s silver-market',
        tooltipHint: '+24 Standing with Ivar · +65 Silver · +8 Trade & Seamanship',
        outcomeText:
          'You marshal the two hundred laden hulls across the North Channel into Dublin Bay without losing a single keel to the race of Mull. Ivar grants your merchants tax-free moorage at Dyflinn’s longphort.',
        effects: {
          silver: 65,
          fame: 20,
          skills: { trade: 8, seamanship: 7 },
          addFlags: ['leg_enc_ivar_02_done'],
          legendStandingDelta: {
            legendId: 'ivar_boneless',
            delta: 24,
            addOath: 'Steered the 200-ship Dumbarton prize fleet safely into Dublin harbor',
            addOathFa: 'هدایت ناوگان ۲۰۰ کشتی غنایم دامبارتون به بندر دوبلین در کنار ایوار',
          },
        },
      },
    ],
  },

  // =========================================================================
  // 3. BJÖRN IRONSIDE (BJÖRN JÁRNSÍÐA) — ENCOUNTERS I & II
  // =========================================================================
  {
    id: 'leg_enc_bjorn_01_gibraltar',
    title: 'Hall of Legends · Sixty-Two Prows at the Pillars of Hercules',
    category: 'Historical Set-Piece',
    iconType: 'ship',
    provenance: 'Frankish Annals',
    isSemiLegendary: false,
    sagaVsChronicleNote:
      'DOCUMENTED: Latin and Arabic chronicles (Annales Bertiniani, Ibn Idhari, Chronicle of Alfonso III) record Björn and Hastein’s 62-ship expedition of 859–862 passing Gibraltar to raid Algeciras, Nekor, the Rhône, and Italy.',
    yearRange: [853, 876],
    ageMin: 15,
    regions: ['Iberia & Al-Andalus', 'Mediterranean', 'Continent', 'Sweden'],
    blockedByFlags: ['leg_enc_bjorn_01_done'],
    weight: 19,
    text: 'Warm southern spray gleams on sixty-two dragon-prows as the narrow strait of Jabal Tariq — the ancient Pillars of Hercules — opens toward the glittering inland sea. At the steering-oar of the lead flagship stands Björn Ironside, broad-chested in blackened ring-mail, with the scarred Loire veteran Hastein laughing beside him as dolphins leap before the painted stems.\n\nSuddenly lookouts at the masthead cry out that Emir Muhammad’s Umayyad guard-galleys from Algeciras are forming a crescent barrier across the channel, their prows fitted with bronze siphons of Greek fire (naft) that burn even upon the water. Björn grins fiercely and beats his mailed fist against his iron-rimmed bossed shield. “No northern keel has ever plowed the sea beyond that sunlit rock! Do we douse our wool sails in wet ox-hides and ram straight through their center, or ride the deep night current along the Moroccan Rif?”',
    choices: [
      {
        id: 'bjorn_ram_strait_vanguard',
        label: 'Drape wet ox-hides over your gunwales and crash through the Umayyad patrol alongside Björn',
        tooltipHint: '+28 Standing with Björn · +7 Combat & Seamanship · +40 Silver · Unlocks Luna Ruse',
        outcomeText:
          'Hissing pots of naphtha slide harmlessly off your soaked hides as your stem-post shears the oars of the lead patrol galley! Björn salutes your crew with raised sword as the Mediterranean opens before your sixty-two sails.',
        effects: {
          silver: 40,
          fame: 24,
          stats: { strength: 5, honor: 5 },
          skills: { combat: 7, seamanship: 7 },
          addFlags: ['leg_enc_bjorn_01_done', 'bjorn_mediterranean_oath'],
          legendStandingDelta: {
            legendId: 'bjorn_ironside',
            delta: 28,
            addOath: 'Forced the Strait of Gibraltar alongside Björn Ironside’s 62 ships',
            addOathFa: 'شکستن خط محاصره تنگه جبل‌الطارق دوشادوش ۶۲ کشتی بیورن پهلوآهنین',
          },
        },
        chain: {
          eventId: 'leg_enc_bjorn_02_luna_bier',
          delayYears: 2,
        },
      },
      {
        id: 'bjorn_navigate_nekor_current',
        label: 'Use the deep Atlantic inflow current to slip the fleet unseen to the rich port of Nekor',
        tooltipHint: '+22 Standing with Björn · +50 Silver · +8 Seamanship',
        outcomeText:
          'Reading the race of the tide through the Pillars, you guide Björn’s fleet under muffled oars to the Moroccan Rif coast, surprising the emirate of Nekor and filling the holds with silk and dirhams.',
        effects: {
          silver: 50,
          fame: 20,
          stats: { cunning: 6 },
          skills: { seamanship: 8, trade: 4 },
          addFlags: ['leg_enc_bjorn_01_done'],
          legendStandingDelta: {
            legendId: 'bjorn_ironside',
            delta: 22,
            addOath: 'Piloted Björn Ironside’s fleet through the Gibraltar night-current to Nekor',
            addOathFa: 'هدایت شبانه ناوگان بیورن پهلوآهنین از جریان تنگه به سوی بندر نکور',
          },
        },
        chain: {
          eventId: 'leg_enc_bjorn_02_luna_bier',
          delayYears: 2,
        },
      },
      {
        id: 'bjorn_turn_back_with_silver',
        label: 'Demand your share of the Seville silver now and refuse to risk the unknown southern sea',
        tooltipHint: '-20 Standing with Björn · +30 Silver · Safe Return',
        outcomeText:
          'Björn tosses a sack of silver coins onto your deck with a bark of laughter. “Tell the hearth-sitters at home that you saw the gate of the world and turned your rudder around!”',
        effects: {
          silver: 30,
          addFlags: ['leg_enc_bjorn_01_done'],
          legendStandingDelta: {
            legendId: 'bjorn_ironside',
            delta: -20,
            addFeud: 'Turned back at the Pillars of Hercules while Björn sailed into the Mediterranean',
            addFeudFa: 'جدایی از ناوگان بیورن پهلوآهنین در آستانه تنگه جبل‌الطارق',
          },
        },
      },
    ],
  },

  {
    id: 'leg_enc_bjorn_02_luna_bier',
    title: 'Hall of Legends · The Marble Gates of Luna & the Shield of Ironside',
    category: 'Historical Set-Piece',
    iconType: 'sword',
    provenance: 'Frankish Annals',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'CONTESTED: Norman chroniclers (Dudo of Saint-Quentin, William of Jumièges) recount the coffin-bier ruse at marble-walled Luna in Italy (mistaken for Rome), while Hervarar saga records Björn’s later kingship at Uppsala.',
    yearRange: [858, 882],
    ageMin: 16,
    regions: ['Mediterranean', 'Sweden', 'Continent', 'Denmark'],
    blockedByFlags: ['leg_enc_bjorn_02_done'],
    weight: 21,
    text: 'Before your salt-bleached fleet gleam the white Carrara marble ramparts and bell-towers of Luna on the Ligurian coast of Italy — shining so bright in the Mediterranean sun that the awe-struck northern oarsmen swear they have reached the walls of Rome itself. Rather than waste good warriors on towering siege ladders, Björn Ironside and Hastein have sent word to the city’s bishop that their chieftain lies dying on his ship and begs Christian burial inside the cathedral, while naked pattern-welded swords are packed beneath his cloak inside the funeral bier.\n\nInside the awning of the command ship, Björn clasps your shoulder before climbing onto the wooden litter. “Carry the head of my funeral bier through the marble gate while the priests swing their censers,” he whispers with a wolfish grin. “When the bishop closes his Latin book over my chest, we leap up in mail and open the city!”',
    choices: [
      {
        id: 'bjorn_carry_luna_bier',
        label: 'Bear the funeral bier into Luna’s cathedral and spring the gate for the fleet',
        tooltipHint: '+32 Standing with Björn · Gain Heirloom: Bossed Shield of Ironside · +55 Silver · +28 Fame',
        outcomeText:
          'Inside the incense-filled nave, Björn leaps from the bier in glittering mail! Your pallbearers seize the city gatehouse from within, and on the voyage home to Uppsala, Björn gifts you his thrice-quenched Bossed Shield of Ironside (Skjöldr Járnsíðu).',
        effects: {
          silver: 55,
          fame: 28,
          stats: { cunning: 6, strength: 5, honor: 4 },
          skills: { combat: 8 },
          addHeirloomIds: ['shield_of_ironside'],
          addFlags: ['leg_enc_bjorn_02_done', 'bjorn_sworn_brother'],
          legendStandingDelta: {
            legendId: 'bjorn_ironside',
            delta: 32,
            addGift: 'Gifted the Bossed Shield of Ironside (Skjöldr Járnsíðu) after the capture of Luna',
            addGiftFa: 'دریافت سپر پولادین بیورن پهلوآهنین پس از فتح شهر مرمرین لونا',
          },
        },
      },
      {
        id: 'bjorn_munso_hall_feast',
        label: 'Guard the fleet anchorage outside the harbor and escort Björn’s treasure-ships back to Uppsala',
        tooltipHint: '+24 Standing with Björn · +45 Silver · +7 Seamanship & Diplomacy',
        outcomeText:
          'You hold the Ligurian anchorage secure against coastal levies and steer the deep-laden ships back through the Atlantic storms to Svealand, where King Björn honors your name at the royal hall of Munsö.',
        effects: {
          silver: 45,
          fame: 22,
          skills: { seamanship: 7, diplomacy: 6 },
          addFlags: ['leg_enc_bjorn_02_done'],
          legendStandingDelta: {
            legendId: 'bjorn_ironside',
            delta: 24,
            addOath: 'Escorted Björn Ironside’s Mediterranean treasure-fleet home to Uppsala',
            addOathFa: 'همراهی ناوگان گنجینه مدیترانه بیورن پهلوآهنین در بازگشت به اوپسالا',
          },
        },
      },
    ],
  },

  // =========================================================================
  // 4. HALFDAN RAGNARSSON — ENCOUNTERS I & II
  // =========================================================================
  {
    id: 'leg_enc_halfdan_01_repton',
    title: 'Hall of Legends · The D-Shaped Ditch at Repton & the Coins of London',
    category: 'Historical Set-Piece',
    iconType: 'sword',
    provenance: 'Anglo-Saxon Chronicle',
    isSemiLegendary: false,
    sagaVsChronicleNote:
      'DOCUMENTED: The Anglo-Saxon Chronicle (871–874), surviving Healfdene Rex silver pennies from London, and the excavated D-shaped Viking winter camp at Repton on the River Trent.',
    yearRange: [866, 876],
    ageMin: 15,
    regions: ['British Isles', 'Denmark', 'Ireland'],
    blockedByFlags: ['leg_enc_halfdan_01_done'],
    weight: 19,
    text: 'Along the windswept bluff above the River Trent at Repton, hundreds of Danish oarsmen dig a deep D-shaped earthwork ditch and timber palisade, incorporating the stone walls of St Wystan’s Mercian royal monastery as a fortified gatehouse to shelter their beached longships through the winter freeze. Halfdan Ragnarsson stands mud-splattered beside a field anvil where a captive Saxon moneyer strikes silver pennies stamped HEALFDENE REX.\n\nHe tosses you a warm, freshly struck coin that glints in the autumn drizzle. “My brothers Björn and Hvitserk love the spray of distant seas, and Ivar plays with kings like chess-pieces,” Halfdan says, looking out over the rich plough-lands of the Mercian midlands. “I want earth that grows winter barley and shires that pay weighed silver every harvest. Help me finish this rampart and drive King Burgred from Mercia, and your hird shall have its pick of the northern valleys.”',
    choices: [
      {
        id: 'halfdan_fortify_repton_camp',
        label: 'Lead your crew in raising the Repton rampart and marching on King Burgred’s hall',
        tooltipHint: '+26 Standing with Halfdan · +40 Silver · +6 Combat & Craft · Unlocks Ploughland Division',
        outcomeText:
          'With Repton’s earthwork unassailable at your back, your combined columns break Mercian resistance and send King Burgred fleeing toward Rome. Halfdan marks your name first on the roll of northern land-allotments.',
        effects: {
          silver: 40,
          fame: 18,
          stats: { strength: 4, honor: 5 },
          skills: { combat: 6, craft: 5 },
          addFlags: ['leg_enc_halfdan_01_done', 'halfdan_repton_veteran'],
          legendStandingDelta: {
            legendId: 'halfdan_ragnarsson',
            delta: 26,
            addOath: 'Built the Repton winter earthwork and toppled Mercia with Halfdan Ragnarsson',
            addOathFa: 'ساخت اردوگاه زمستانی رپتون و سرنگونی پادشاهی مرسیا در کنار هالفدان',
          },
        },
        chain: {
          eventId: 'leg_enc_halfdan_02_ploughland',
          delayYears: 2,
        },
      },
      {
        id: 'halfdan_mint_tribute_silver',
        label: 'Supervise the Mercian tribute-weighing and coin-dies at the London and Repton mints',
        tooltipHint: '+20 Standing with Halfdan · +50 Silver · +6 Trade & Law',
        outcomeText:
          'You ensure every Mercian ealdorman delivers full weight in hacksilver and coin. Halfdan rewards your sharp reckoning with a chest of newly minted pennies.',
        effects: {
          silver: 50,
          fame: 14,
          skills: { trade: 6, law: 5 },
          addFlags: ['leg_enc_halfdan_01_done'],
          legendStandingDelta: {
            legendId: 'halfdan_ragnarsson',
            delta: 20,
            addOath: 'Administered the Mercian tribute scales for King Halfdan at Repton',
            addOathFa: 'نظارت بر خراج مرسیا و ضرابخانه نقره شاه هالفدان در رپتون',
          },
        },
        chain: {
          eventId: 'leg_enc_halfdan_02_ploughland',
          delayYears: 2,
        },
      },
      {
        id: 'halfdan_spurn_ditch_digging',
        label: 'Refuse to dig mud like a thrall and ride off to plunder on your own',
        tooltipHint: '-22 Standing with Halfdan · +25 Silver · +4 Strength',
        outcomeText:
          'Halfdan’s eyes harden as he plants his spade in the turf. “A raider who will not build a wall sleeps in a shallow grave,” he snaps, striking your ship from his land-roll.',
        effects: {
          silver: 25,
          stats: { strength: 4 },
          addFlags: ['leg_enc_halfdan_01_done'],
          legendStandingDelta: {
            legendId: 'halfdan_ragnarsson',
            delta: -22,
            addFeud: 'Refused winter fortification duty at Halfdan’s Repton camp',
            addFeudFa: 'سرپیچی از ساخت استحکامات اردوگاه زمستانی هالفدان در رپتون',
          },
        },
      },
    ],
  },

  {
    id: 'leg_enc_halfdan_02_ploughland',
    title: 'Hall of Legends · Measuring Northumbria by the Sword and Rope',
    category: 'Historical Set-Piece',
    iconType: 'crown',
    provenance: 'Anglo-Saxon Chronicle',
    isSemiLegendary: false,
    sagaVsChronicleNote:
      'DOCUMENTED: The Anglo-Saxon Chronicle for 876 states: “And that year Healfdene divided the land of the Northumbrians; and they thenceforth continued ploughing and tilling them.”',
    yearRange: [873, 877],
    ageMin: 16,
    regions: ['British Isles', 'Ireland', 'Denmark'],
    blockedByFlags: ['leg_enc_halfdan_02_done'],
    weight: 21,
    text: 'In a green river-valley outside Jórvík (York), Halfdan Ragnarsson drives an iron-shod ash-spear deep into the dark loam while his lawmen uncoil a tarred hemp measuring-rope (*reip*) to mark out the hides and wapentakes. Veteran oarsmen who have rowed and bled behind the sons of Ragnar for ten hard winters step forward by ship-crews to receive their permanent ploughlands (*plógsland*) across Yorkshire and Northumbria.\n\nStanding beside a carved boundary-stone, Halfdan lifts the silver-rimmed Bragarfull Oath-Horn of Lejre brimming with dark English ale. “We have avenged our father Ragnar with iron and fire; now we root our children in this soil with the heavy ploughshare and the law of the host,” he proclaims across the meadow. “Will you drink the oath-horn, take a permanent estate in the Danelaw, and swear to defend Jórvík’s borders against both Scot and Saxon?”',
    choices: [
      {
        id: 'halfdan_claim_yorkshire_ploughland',
        label: 'Drink from the Oath-Horn, claim a Northumbrian estate, and receive Halfdan’s horn of Lejre',
        tooltipHint: '+30 Standing with Halfdan · Gain Heirloom: Bragarfull Oath-Horn · +1 Farm · +20 Food',
        outcomeText:
          'You drain the aurochs horn and drive your boundary stakes into the rich Yorkshire vale. Honoring your service from the Humber to the Tyne, Halfdan presents you with the Bragarfull Oath-Horn of Lejre and deeds a fertile manor to your house.',
        effects: {
          landFarms: 1,
          foodStores: 20,
          fame: 24,
          stats: { honor: 7, charisma: 4 },
          skills: { farming: 7, law: 5 },
          addHeirloomIds: ['bragarfull_horn_lejre'],
          addFlags: ['leg_enc_halfdan_02_done', 'halfdan_danelaw_landholder'],
          legendStandingDelta: {
            legendId: 'halfdan_ragnarsson',
            delta: 30,
            addGift: 'Granted Northumbrian ploughland and the Bragarfull Oath-Horn of Lejre by Halfdan',
            addGiftFa: 'دریافت زمین‌های کشاورزی نورثامبریا و شاخ سوگند لیره از دست هالفدان',
          },
        },
      },
      {
        id: 'halfdan_join_strangford_fleet',
        label: 'Sell your land-lot for silver and volunteer to sail with Halfdan for the throne of Dublin',
        tooltipHint: '+24 Standing with Halfdan · +50 Silver · +7 Combat & Seamanship',
        outcomeText:
          '“Still salt-hungry!” Halfdan laughs, clapping your shoulder. You trade your plough-rope for a chest of silver and prepare your war-gear to cross the Irish Sea with him toward Strangford Lough.',
        effects: {
          silver: 50,
          fame: 20,
          skills: { combat: 7, seamanship: 6 },
          addFlags: ['leg_enc_halfdan_02_done'],
          legendStandingDelta: {
            legendId: 'halfdan_ragnarsson',
            delta: 24,
            addOath: 'Chose the Irish Sea war-prow over the plough alongside Halfdan Ragnarsson',
            addOathFa: 'ترجیح دادن رکاب هالفدان در نبردهای دریای ایرلند به زمین‌های کشاورزی یورک',
          },
        },
      },
    ],
  },

  // =========================================================================
  // 5. UBBA RAGNARSSON — ENCOUNTERS I & II
  // =========================================================================
  {
    id: 'leg_enc_ubba_01_frisian_wolf',
    title: 'Hall of Legends · Dux Fresonum: Wolf-Coats on the Fenland Causeway',
    category: 'Historical Set-Piece',
    iconType: 'sword',
    provenance: 'Anglo-Saxon Chronicle',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'DOCUMENTED / CONTESTED: Continental and English sources (Abbo of Fleury, Annals of St Neots, Ragnarssona þáttr) portray Ubba as Dux Fresonum and a fierce champion skilled in battle-charms who broke East Anglia’s defenses in 869.',
    yearRange: [852, 875],
    ageMin: 15,
    regions: ['Continent', 'British Isles', 'Denmark'],
    blockedByFlags: ['leg_enc_ubba_01_done'],
    weight: 18,
    text: 'Cold mist curls off the East Anglian fens where a narrow timber causeway leads across the black reed-marshes toward King Edmund’s stockade at Thetford. At the head of a veteran shock company draped in grey wolf-pelts stands Ubba Ragnarsson — hailed in the continental chronicles as *Dux Fresonum*, Duke of the Frisian Estuaries — methodically carving blood-red victory runes (*sigrunar*) into the ash shaft of his long-hafted Dane-axe.\n\nUbba looks up as your banner approaches, his eyes wild with the low cadence of the battle-chant. “Ivar plans with twigs in the dirt, and Halfdan counts plough-oxen like a shire-reeve,” Ubba growls, testing his axe-edge against his thumb. “When the shield-wall locks on this narrow dike, neither parchment treaties nor clever traps will move them — only iron and the terror of Odin’s wolf-coats will split King Edmund’s line! Will you bite the shield-rim and charge in the wedge with me?”',
    choices: [
      {
        id: 'ubba_charge_fen_wedge',
        label: 'Bite your shield-rim and storm the Thetford causeway in Ubba’s wolf-pelted wedge',
        tooltipHint: '+28 Standing with Ubba · +8 Combat · +6 Strength · Unlocks Cynwit Encounter',
        outcomeText:
          'Side by side with Ubba, your wedge crashes into the East Anglian shield-wall with such fury that the timber causeway splinters under their retreat! Ubba marks your brow with the rune of Tyr in brotherhood.',
        effects: {
          silver: 35,
          fame: 22,
          stats: { strength: 6, faith: 5 },
          skills: { combat: 8 },
          addFlags: ['leg_enc_ubba_01_done', 'ubba_wolf_brother'],
          legendStandingDelta: {
            legendId: 'ubba_ragnarsson',
            delta: 28,
            addOath: 'Charged in the wolf-coat wedge beside Ubba Ragnarsson at Thetford',
            addOathFa: 'یورش در صف گرگ‌پوشان دوشادوش اوبّا پسر راگنار در نبرد تتفورد',
          },
        },
        chain: {
          eventId: 'leg_enc_ubba_02_cynwit',
          delayYears: 2,
        },
      },
      {
        id: 'ubba_learn_galdr_runes',
        label: 'Chant the old galdr war-staves with Ubba before the battle-horns sound',
        tooltipHint: '+22 Standing with Ubba · +7 Seidr & Wyrd · +5 Faith',
        outcomeText:
          'Around the night-fire in the fenland reeds, Ubba teaches you the ancient Frisian and Danish battle-charms said to dull enemy spear-points and steady a warrior’s heart.',
        effects: {
          fame: 15,
          stats: { wyrd: 7, faith: 5 },
          skills: { seidr: 7 },
          addFlags: ['leg_enc_ubba_01_done'],
          legendStandingDelta: {
            legendId: 'ubba_ragnarsson',
            delta: 22,
            addOath: 'Shared the galdr victory-runes with Ubba Ragnarsson in the fenland camp',
            addOathFa: 'هم‌خوانی سرودهای رونیک پیروزی (گالدر) با اوبّا در اردوگاه مرداب',
          },
        },
        chain: {
          eventId: 'leg_enc_ubba_02_cynwit',
          delayYears: 2,
        },
      },
      {
        id: 'ubba_refuse_reckless_assault',
        label: 'Warn Ubba that charging a narrow causeway without flankers is madness',
        tooltipHint: '-20 Standing with Ubba · +5 Cunning',
        outcomeText:
          'Ubba spits onto the marsh grass. “Keep your dry boots in the rear baggage, then!” he roars, leading his Frisian veterans past your line.',
        effects: {
          stats: { cunning: 5 },
          addFlags: ['leg_enc_ubba_01_done'],
          legendStandingDelta: {
            legendId: 'ubba_ragnarsson',
            delta: -20,
            addFeud: 'Questioned Ubba Ragnarsson’s vanguard charge on the East Anglian causeway',
            addFeudFa: 'مخالفت با یورش بی‌پروای اوبّا در گذرگاه باریک ایست آنگلیا',
          },
        },
      },
    ],
  },

  {
    id: 'leg_enc_ubba_02_cynwit',
    title: 'Hall of Legends · Twenty-Three Keels Before the Crag of Cynwit',
    category: 'Historical Set-Piece',
    iconType: 'ship',
    provenance: 'Anglo-Saxon Chronicle',
    isSemiLegendary: false,
    sagaVsChronicleNote:
      'DOCUMENTED: Asser’s Life of King Alfred and the Anglo-Saxon Chronicle (878) record Ubba landing 23 ships in Devon before Ealdorman Odda’s waterless hill-fort of Cynwit, where a sudden Saxon dawn sally slew Ubba.',
    yearRange: [872, 878],
    ageMin: 16,
    regions: ['British Isles', 'Continent', 'Denmark'],
    blockedByFlags: ['leg_enc_ubba_02_done'],
    weight: 21,
    text: 'In the grey sea-drizzle of early spring 878, twenty-three longships lie beached on the pebble shore of Devon below the steep, wind-swept crag of Cynwit. Inside the dry-stone rampart at the summit, Ealdorman Odda and his West Saxon thegns are completely cut off from fresh spring-water. Confident that parched throats will force their surrender before noon, Ubba Ragnarsson has let his camp-sentries slacken around the cook-fires while the Raven Banner hangs limp and unmoving in the heavy mist.\n\nWalking the wet perimeter above the surf-line, you catch the unmistakable glint of hundreds of Saxon spear-points massing silently behind the eastern timber gate for a desperate dawn sally down the slope! Less than ten heartbeats remain before the hill-fort gates burst open and Odda’s wedge crashes into the sleeping camp. What do you do?',
    choices: [
      {
        id: 'ubba_sound_horn_save_cynwit',
        label: 'Blow your war-horn immediately, form a double shield-ring around Ubba, and repel Odda’s sally',
        tooltipHint: '+34 Standing with Ubba · Gain Heirloom: Ormrinn Longship · Historical Divergence',
        outcomeText:
          'Your horn-blast wakes the camp ten heartbeats before Odda’s men pour down the slope! Locking shields around Ubba, your hird blunts the Saxon charge and covers a fighting withdrawal to the ships. Grateful for his life and banner, Ubba gifts you his sleek thirty-bench flagship Ormrinn (Serpent of the Wash)!',
        effects: {
          fame: 30,
          stats: { cunning: 6, honor: 8 },
          skills: { combat: 8, seamanship: 6 },
          addHeirloomIds: ['serpent_of_the_wash'],
          addFlags: ['leg_enc_ubba_02_done', 'ubba_saved_at_cynwit'],
          divergenceNote:
            'Warned of Ealdorman Odda’s dawn sally at Cynwit in 878, Ubba Ragnarsson formed his shield-wall in time and saved his fleet on the Devon coast.',
          legendStandingDelta: {
            legendId: 'ubba_ragnarsson',
            delta: 34,
            addGift: 'Saved Ubba from the dawn ambush at Cynwit and received the longship Ormrinn',
            addGiftFa: 'نجات اوبّا از شبیخون سحرگاهی قلعه سینویت و دریافت کشتی «مار دریای شمال» (اورمرین)',
          },
        },
      },
      {
        id: 'ubba_guard_ships_tide',
        label: 'Hold the beachhead and refloat the twenty-three longships when the hill-fight turns bloody',
        tooltipHint: '+22 Standing with Ubba · Gain Heirloom: Ormrinn Longship · +40 Silver',
        outcomeText:
          'When Ealdorman Odda’s men burst from Cynwit in a furious dawn charge and Ubba falls hewing in the front rank, your disciplined beach-guard holds the surf-line, rescues the survivors, and brings Ubba’s swift flagship Ormrinn back to the Danelaw.',
        effects: {
          silver: 40,
          fame: 22,
          skills: { seamanship: 7, combat: 5 },
          addHeirloomIds: ['serpent_of_the_wash'],
          addFlags: ['leg_enc_ubba_02_done'],
          legendStandingDelta: {
            legendId: 'ubba_ragnarsson',
            delta: 22,
            addGift: 'Preserved Ubba’s flagship Ormrinn (Serpent of the Wash) from the beach of Cynwit',
            addGiftFa: 'حفظ کشتی سرفرماندهی اوبّا (اورمرین) در نبرد ساحلی سینویت',
          },
        },
      },
    ],
  },

  // =========================================================================
  // 6. HVITSERK RAGNARSSON — ENCOUNTERS I & II
  // =========================================================================
  {
    id: 'leg_enc_hvitserk_01_portage',
    title: 'Hall of Legends · White-Shirt on the Eastern River Portages',
    category: 'Historical Set-Piece',
    iconType: 'ship',
    provenance: 'Legendary / Composite Saga',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'LEGENDARY: Ragnarssona þáttr and Saxo Grammaticus recount Hvitserk campaigning in the East (Garðaríki / Hellespont) after avenging Ragnar in England.',
    yearRange: [864, 878],
    ageMin: 15,
    regions: ['Kievan Rus & Rivers', 'Sweden', 'Denmark', 'British Isles'],
    blockedByFlags: ['leg_enc_hvitserk_01_done'],
    weight: 18,
    text: 'Along a muddy forest portage between the northern rivers of Garðaríki, eighty sweating oarsmen haul shallow-draft karves over grease-slick pine rollers while Pecheneg horsemen and Slavic scouts watch from the shadowy birch-woods. At the very head of the main tow-rope strains Hvitserk Ragnarsson, wearing his signature bleached white linen tunic (*hvítserkr*) over his ring-byrnie so every enemy archer in the trees knows a son of Ragnar leads the column.\n\nHe wipes pine-resin and sweat from his brow and tosses you a braided leather tow-harness. “Halfdan measures cabbage-patches in Yorkshire and Sigurd collects herring-tolls in the Sound,” Hvitserk laughs breathlessly, his hand resting on an eastern crucible-steel sabre. “Out here on the Austrvegr river-road, every rapid hides a chest of Caliphate dirhams and Byzantine silk! Will you haul keels with me and bait the forest ambushers out into the open, or stay behind the timber palisade?”',
    choices: [
      {
        id: 'hvitserk_haul_and_ambush',
        label: 'Wear a white linen surcoat beside Hvitserk and spring a counter-ambush on the forest scouts',
        tooltipHint: '+28 Standing with Hvitserk · +7 Combat · +40 Silver · Unlocks Eastern Steppe Stand',
        outcomeText:
          'Drawing the forest ambushers toward your white tunics, you and Hvitserk drop the tow-ropes, snatch up shields, and rout their raiding party among the birches! The river-way to the south lies open.',
        effects: {
          silver: 40,
          fame: 20,
          stats: { strength: 5, honor: 6 },
          skills: { combat: 7, seamanship: 4 },
          addFlags: ['leg_enc_hvitserk_01_done', 'hvitserk_eastern_comrade'],
          legendStandingDelta: {
            legendId: 'hvitserk_ragnarsson',
            delta: 28,
            addOath: 'Fought in the white-shirt vanguard with Hvitserk on the Garðaríki portages',
            addOathFa: 'نبرد در صف طلایه‌داران پیراهن‌سپید در کنار هویتسرک در گذرگاه رودهای شرق',
          },
        },
        chain: {
          eventId: 'leg_enc_hvitserk_02_steppe_stand',
          delayYears: 2,
        },
      },
      {
        id: 'hvitserk_trade_sable_dirhams',
        label: 'Establish a fortified fur-and-amber trading post at the river portage',
        tooltipHint: '+20 Standing with Hvitserk · +50 Silver · +6 Trade & Craft',
        outcomeText:
          'You erect a timber blockhouse at the portage where Finnic trappers and Khazar silver-merchants trade sable pelts for Baltic amber, keeping Hvitserk’s squadron well supplied.',
        effects: {
          silver: 50,
          fame: 14,
          skills: { trade: 6, craft: 5 },
          addFlags: ['leg_enc_hvitserk_01_done'],
          legendStandingDelta: {
            legendId: 'hvitserk_ragnarsson',
            delta: 20,
            addOath: 'Fortified the eastern river-portage for Hvitserk’s Garðaríki fleet',
            addOathFa: 'ساخت دژ تجاری در گذرگاه رودخانه برای پشتیبانی از ناوگان شرقی هویتسرک',
          },
        },
        chain: {
          eventId: 'leg_enc_hvitserk_02_steppe_stand',
          delayYears: 2,
        },
      },
      {
        id: 'hvitserk_mock_white_shirt',
        label: 'Tell him wearing a bright white target in ambush country is a fool’s vanity',
        tooltipHint: '-20 Standing with Hvitserk · +5 Cunning',
        outcomeText:
          'Hvitserk’s grin vanishes. “Hide in grey wool like a sheep, then,” he snaps, turning his back to haul the keel alone.',
        effects: {
          stats: { cunning: 5 },
          addFlags: ['leg_enc_hvitserk_01_done'],
          legendStandingDelta: {
            legendId: 'hvitserk_ragnarsson',
            delta: -20,
            addFeud: 'Mocked Hvitserk’s white battle-tunic on the eastern river road',
            addFeudFa: 'تمسخر پیراهن رزم سپید هویتسرک در مسیر رودخانه‌های شرق',
          },
        },
      },
    ],
  },

  {
    id: 'leg_enc_hvitserk_02_steppe_stand',
    title: 'Hall of Legends · Iron and Fire on the Eastern Steppe',
    category: 'Historical Set-Piece',
    iconType: 'sword',
    provenance: 'Legendary / Composite Saga',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'LEGENDARY: In Ragnarssona þáttr, Hvitserk is surrounded by an overwhelming eastern host and chooses to die on a blazing pyre of fallen foes rather than live as a captive.',
    yearRange: [870, 879],
    ageMin: 16,
    regions: ['Kievan Rus & Rivers', 'Sweden', 'Denmark'],
    blockedByFlags: ['leg_enc_hvitserk_02_done'],
    weight: 20,
    text: 'On a smoke-blackened bluff above the roaring Dnieper rapids, Hvitserk Ragnarsson’s small Viking warband stands ringed by thousands of steppe horsemen and eastern auxiliaries. Scores of fallen foes lie heaped around his notched linden shield, and enemy envoys have ridden forward under a truce-spear offering to spare his life if he yields his blade in tribute — or else grant whatever manner of death a son of Ragnar Lothbrok chooses.\n\nBleeding from three arrow-grazes through his torn white tunic, Hvitserk laughs aloud and points his watered-steel eastern sabre at the overturned timber wagons. “If no northern keel comes up the rapids to break this ring, I shall ask them for a blazing pyre of fallen skulls so Odin and my father see my smoke from Valhalla!” he shouts across the river-spray as your prows round the bend.',
    choices: [
      {
        id: 'hvitserk_wedge_rescue',
        label: 'Beach your prows under arrow-storm, cut a bloody lane up the bluff, and bring Hvitserk aboard!',
        tooltipHint: '+34 Standing with Hvitserk · Gain Heirloom: Hvitserk’s Eastern Sabre · Historical Divergence',
        outcomeText:
          'Driving your shield-wedge up the riverbank while your archers sweep the ridge, you haul the wounded son of Ragnar aboard your flagship before the steppe cavalry can close the net! Laughing through blood-stained teeth, Hvitserk presses his crucible-steel sabre (Austr-Sax Hvítserks) into your hands.',
        effects: {
          fame: 32,
          stats: { strength: 6, honor: 8, health: -5 },
          skills: { combat: 9 },
          addHeirloomIds: ['hvitserk_eastern_blade'],
          addFlags: ['leg_enc_hvitserk_02_done', 'hvitserk_rescued_east'],
          divergenceNote:
            'Rescued by a sworn northern fleet on the Dnieper bluff, Hvitserk Ragnarsson cheated the eastern pyre and sailed back down the river road.',
          legendStandingDelta: {
            legendId: 'hvitserk_ragnarsson',
            delta: 34,
            addGift: "Rescued Hvitserk from the eastern encirclement and received Hvitserk's Eastern River-Sabre",
            addGiftFa: 'نجات هویتسرک از محاصره دشت‌های شرق و دریافت شمشیر جوهرنمود خاوری او',
          },
        },
      },
      {
        id: 'hvitserk_honor_last_stand',
        label: 'Receive Hvitserk’s heirloom blade by messenger-skiff and chant his death-lay as the pyre blazes',
        tooltipHint: '+26 Standing with Hvitserk · Gain Heirloom: Hvitserk’s Eastern Sabre · +8 Poetry & Honor',
        outcomeText:
          'Refusing to retreat a single pace, Hvitserk sends his youngest page down to your boat with his crucible-steel sabre so the blade will not fall to strangers, then meets his saga end in roaring flame atop the hill. Your skaldic verse carries his name back to every hall in the North.',
        effects: {
          fame: 28,
          stats: { honor: 8, wyrd: 6 },
          skills: { skaldcraft: 8 },
          addHeirloomIds: ['hvitserk_eastern_blade'],
          addFlags: ['leg_enc_hvitserk_02_done'],
          legendStandingDelta: {
            legendId: 'hvitserk_ragnarsson',
            delta: 26,
            addGift: "Entrusted with Hvitserk's Eastern River-Sabre before his blazing pyre in Garðaríki",
            addGiftFa: 'دریافت شمشیر خاوری هویتسرک پیش از فرجام آتشین و حماسی او در شرق',
          },
        },
      },
    ],
  },

  // =========================================================================
  // 7. SIGURD SNAKE-IN-THE-EYE — ENCOUNTERS I & II
  // =========================================================================
  {
    id: 'leg_enc_sigurd_01_ouroboros',
    title: 'Hall of Legends · The Ouroboros Eye & the Völsung Blade at Roskilde',
    category: 'Historical Set-Piece',
    iconType: 'crown',
    provenance: 'Legendary / Composite Saga',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'CONTESTED: Ragnarssona þáttr describes Sigurd Snake-in-the-Eye inheriting Zealand, Scania, and Halland with the mark of Fafnir’s ouroboros in his pupil; the Annals of Fulda (873) attest King Sigifrid of the Danes.',
    yearRange: [853, 886],
    ageMin: 15,
    regions: ['Denmark', 'Sweden', 'Norway', 'British Isles'],
    blockedByFlags: ['leg_enc_sigurd_01_done'],
    weight: 19,
    text: 'In the high-pillared royal hall at Roskilde, resin-torchlight catches the left eye of young King Sigurd Ragnarsson: around his dark pupil coils a pale, unmistakable ring like a tail-biting serpent (*Ormr-í-Auga*), the birth-mark foretold by his völva mother Aslaug from the dragon-blood of his grandfather Sigurd Fafnir’s-Bane.\n\nAcross his knees rests the pattern-welded Völsung sword-shard, its gold wire hilt gleaming against his dyed wool cloak. “My brothers Ivar and Halfdan have carved up the shires of England, and Björn sits enthroned among the mounds of Uppsala,” Sigurd says, his voice measured, cold, and regal as he surveys the captains of the islands. “Here in the narrow Sound between Zealand and Scania lies the iron lock-key of all the Baltic and North Sea trade. Will you swear your prows to the Sound-Guard of Roskilde, or sail without my seal?”',
    choices: [
      {
        id: 'sigurd_swear_sound_guard',
        label: 'Swear your prows to guard the Danish Straits alongside Sigurd Snake-in-the-Eye',
        tooltipHint: '+28 Standing with Sigurd · +6 Combat & Law · +35 Silver · Unlocks Eider Treaty',
        outcomeText:
          'Sigurd rises and touches the flat of the Völsung blade to your shoulder. Together your squadrons sweep Wendish and Saxon raiders from the Sound, securing the rich herring and amber tolls of Zealand.',
        effects: {
          silver: 35,
          fame: 20,
          stats: { honor: 6, wyrd: 5 },
          skills: { combat: 6, law: 6 },
          addFlags: ['leg_enc_sigurd_01_done', 'sigurd_sound_warden'],
          legendStandingDelta: {
            legendId: 'sigurd_snake_eye',
            delta: 28,
            addOath: 'Swore to guard the Øresund and Zealand straits with Sigurd Snake-in-the-Eye',
            addOathFa: 'پیمان نگهبانی از تنگه‌های دانمارک و شیلند در کنار سیگورد مار-در-چشم',
          },
        },
        chain: {
          eventId: 'leg_enc_sigurd_02_eider_peace',
          delayYears: 2,
        },
      },
      {
        id: 'sigurd_recite_volsung_lay',
        label: 'Chant the ancient lay of his grandfather Sigurd Fafnir’s-Bane before the Zealand court',
        tooltipHint: '+24 Standing with Sigurd · +8 Poetry · +6 Charisma',
        outcomeText:
          'As your verses recount how Gram clove Fafnir’s heart on Gnitaheath, the pale serpent-ring in King Sigurd’s eye seems to gleam in the firelight. Deeply moved, he seats you beside his high-seat.',
        effects: {
          silver: 25,
          fame: 22,
          stats: { charisma: 6, wyrd: 5 },
          skills: { skaldcraft: 8 },
          addFlags: ['leg_enc_sigurd_01_done'],
          legendStandingDelta: {
            legendId: 'sigurd_snake_eye',
            delta: 24,
            addOath: 'Honored the Völsung bloodline in skaldic verse at Sigurd’s Roskilde feast',
            addOathFa: 'سرودن چکامه تبار اژدهاکش ولسونگ در بزم شاهانه سیگورد در راسکیله',
          },
        },
        chain: {
          eventId: 'leg_enc_sigurd_02_eider_peace',
          delayYears: 2,
        },
      },
      {
        id: 'sigurd_run_sound_without_toll',
        label: 'Run your trading keels through the Sound by night without paying Roskilde’s royal toll',
        tooltipHint: '-22 Standing with Sigurd · +45 Silver · +5 Seamanship',
        outcomeText:
          'You slip past Zealand’s watch-fires with a full cargo of silver and furs, though King Sigurd’s coast-wardens notch your sail-stripes on their tally-sticks.',
        effects: {
          silver: 45,
          skills: { seamanship: 5 },
          stats: { cunning: 4 },
          addFlags: ['leg_enc_sigurd_01_done'],
          legendStandingDelta: {
            legendId: 'sigurd_snake_eye',
            delta: -22,
            addFeud: 'Evaded Sigurd Snake-in-the-Eye’s royal Sound-toll at Roskilde',
            addFeudFa: 'عبور شبانه از تنگه و نپرداختن عوارض شاهی به سیگورد مار-در-چشم',
          },
        },
      },
    ],
  },

  {
    id: 'leg_enc_sigurd_02_eider_peace',
    title: 'Hall of Legends · Weapon-Oaths on the Eider River Frontier',
    category: 'Historical Set-Piece',
    iconType: 'crown',
    provenance: 'Frankish Annals',
    isSemiLegendary: false,
    sagaVsChronicleNote:
      'DOCUMENTED: The Annals of Fulda (873) record King Sigifrid (Sigurd) of the Danes sending envoys to Louis the German to swear border peace on their weapons at the Eider River so merchants could trade freely.',
    yearRange: [868, 891],
    ageMin: 16,
    regions: ['Denmark', 'Continent'],
    blockedByFlags: ['leg_enc_sigurd_02_done'],
    weight: 20,
    text: 'At the great Danevirke earthwork along the reedy banks of the Eider River, King Sigurd Snake-in-the-Eye meets the mailed margraves and counts of King Louis the German. As the Frankish Annals of Fulda record for the year 873, the Danish royal envoys draw their pattern-welded swords from their scabbards to swear border peace after the ancient custom of the North — pledging upon naked steel that neither side shall raid across the Eider while merchants pass freely between Hedeby and Saxony.\n\nWith the wind snapping the royal banners above the boundary bridge, Sigurd turns to you holding the ancestral Völsung blade *Fáfnisbani Shard* by its fuller. “A treaty without iron behind it is mere ink on sheepskin,” the Danish king says quietly. “Stand as my sword-witness on this border bridge and back our oath with your shield-wall, and the heirloom blade of the Völsungs shall guard your house.”',
    choices: [
      {
        id: 'sigurd_swear_eider_weapon_oath',
        label: 'Lay your hand upon the Völsung hilt and seal the Eider River merchant peace with Sigurd',
        tooltipHint: '+32 Standing with Sigurd · Gain Heirloom: Fang of Fafnir Blade · +50 Silver · +8 Diplomacy',
        outcomeText:
          'You swear the iron border-oath in both Norse and Frankish before the assembled hosts. Caravans of Rhenish glass, Frankish mail, and Baltic furs pour into Hedeby, and King Sigurd honors your house with the ancestral blade Fang of Fafnir (Fáfnisbani Shard)!',
        effects: {
          silver: 50,
          fame: 26,
          stats: { honor: 8, charisma: 5 },
          skills: { diplomacy: 8, trade: 7 },
          addHeirloomIds: ['fang_of_fafnir'],
          addFlags: ['leg_enc_sigurd_02_done', 'sigurd_eider_guarantor'],
          legendStandingDelta: {
            legendId: 'sigurd_snake_eye',
            delta: 32,
            addGift: 'Gifted the Völsung blade Fang of Fafnir (Fáfnisbani Shard) at the Eider River treaty',
            addGiftFa: 'دریافت تیغ موروثی «نیش فافنیر» (یادگار ولسونگ) از دست سیگورد در پیمان رود آیدر',
          },
        },
      },
      {
        id: 'sigurd_fortify_danevirke_gate',
        label: 'Reinforce the Danevirke timber palisade behind the treaty table so the Franks respect the oath',
        tooltipHint: '+24 Standing with Sigurd · +8 Stability · +6 Combat & Law',
        outcomeText:
          'Seeing your disciplined shield-wall manning the freshly timbered Danevirke rampart, the East Frankish margraves sign every clause without cavil. Sigurd praises your vigilance across Denmark.',
        effects: {
          stability: 8,
          fame: 22,
          skills: { combat: 6, law: 6 },
          addFlags: ['leg_enc_sigurd_02_done'],
          legendStandingDelta: {
            legendId: 'sigurd_snake_eye',
            delta: 24,
            addOath: 'Guarded the Danevirke rampart during King Sigurd’s Eider peace embassy',
            addOathFa: 'پاسبانی از دیوار دفاعی دانویرکه در جریان پیمان صلح سیگورد با فرانک‌ها',
          },
        },
      },
    ],
  },

  // =========================================================================
  // 8. QUEEN ASLAUG (KRÁKA / RANDALIN) — ENCOUNTERS I & II
  // =========================================================================
  {
    id: 'leg_enc_aslaug_01_harp_loom',
    title: 'Hall of Legends · The Hollow Harp & the Unwoven Grey Silk of Kráka',
    category: 'Historical Set-Piece',
    iconType: 'religion',
    provenance: 'Legendary / Composite Saga',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'LEGENDARY: Grounded in Völsunga saga and Ragnars saga loðbrókar, where Sigurd and Brynhild’s daughter Aslaug is hidden inside Heimir’s harp, solves Ragnar’s riddle, and knits the enchanted unwoven shirt.',
    yearRange: [825, 872],
    ageMin: 15,
    regions: ['Denmark', 'Norway', 'Sweden'],
    blockedByFlags: ['leg_enc_aslaug_01_done'],
    weight: 19,
    text: 'In the quiet, herb-scented solar above Roskilde’s feast-hall stands a tall, weathered wooden harp — its hollow soundbox large enough to have hidden a three-year-old child when foster-father Heimir fled the burning hall of Brynhild and Sigurd Fafnir’s-Bane. Beside it sits Queen Aslaug, whom the Norwegian peasants of Spangereid once called Kráka (“The Crow”), her copper-red hair braided with gold thread as her slender fingers knot grey hair-silk into a seamless war-garment without loom or iron needle.\n\nShe raises her völva’s eyes to yours, seeing straight through boast and mail-coat alike. “Men think thick iron rings save a warrior’s life on the headland,” she says softly. “Yet wyrd is spun by the Norns before the first spear-socket is forged. Answer me with the wit I once brought aboard Ragnar’s ship — neither naked nor clad, neither fasting nor full: what gift is neither bought with silver nor taken by the sword, yet outlives every king’s barrow?”',
    choices: [
      {
        id: 'aslaug_answer_ordstirr_riddle',
        label: 'Answer softly: “Ordstirr — the word-fame of an honorable deed, which never dies” (Hávamál)',
        tooltipHint: '+30 Standing with Aslaug · Gain Heirloom: Aslaug’s Unwoven Shirt · +8 Wyrd & Seidr',
        outcomeText:
          'A slow, luminous smile touches the Völva-Queen’s lips. “You know the High One’s counsel,” she whispers. Lifting the seamless grey silk tunic from her lap, she bestows Aslaug’s Unwoven Shirt (Skyrta Áslaugar) upon your house to turn aside iron in the day of battle!',
        effects: {
          fame: 26,
          stats: { wyrd: 8, cunning: 5, honor: 5 },
          skills: { seidr: 8, skaldcraft: 5 },
          addHeirloomIds: ['aslaug_unwoven_shirt'],
          addFlags: ['leg_enc_aslaug_01_done', 'aslaug_blessed_champion'],
          legendStandingDelta: {
            legendId: 'aslaug_kraka',
            delta: 30,
            addGift: "Answered Queen Aslaug's riddle and received Aslaug's Unwoven Shirt (Skyrta Áslaugar)",
            addGiftFa: 'پاسخ خردمندانه به معمای ملکه اسلاگ و دریافت «پیراهن بی‌درز اسلاگ»',
          },
        },
        chain: {
          eventId: 'leg_enc_aslaug_02_randalin_tears',
          delayYears: 2,
        },
      },
      {
        id: 'aslaug_honor_spangereid_memory',
        label: 'Pledge to punish any raider who dishonors the memory of her foster-father Heimir in Norway',
        tooltipHint: '+24 Standing with Aslaug · +6 Honor & Law · +18 Fame',
        outcomeText:
          'Aslaug’s fingers brush the scarred soundboard of the great harp. “Long have I remembered the bitterness of Spangereid,” she says. “May the Norns weave a strong thread for your hall.”',
        effects: {
          fame: 18,
          stats: { honor: 6, wyrd: 6 },
          skills: { law: 6, seidr: 4 },
          addFlags: ['leg_enc_aslaug_01_done'],
          legendStandingDelta: {
            legendId: 'aslaug_kraka',
            delta: 24,
            addOath: 'Swore to honor Heimir’s memory and the Völsung line before Queen Aslaug',
            addOathFa: 'پیمان پاسداشت یاد هایمیر و خاندان ولسونگ در حضور ملکه اسلاگ',
          },
        },
        chain: {
          eventId: 'leg_enc_aslaug_02_randalin_tears',
          delayYears: 2,
        },
      },
      {
        id: 'aslaug_scoff_peasant_crow',
        label: 'Mutters that a queen raised in soot as “Kráka” should leave war and wyrd to men',
        tooltipHint: '-26 Standing with Aslaug · -6 Wyrd (Völva’s Curse)',
        outcomeText:
          'The hearth-fire seems to dim to blue ash as Aslaug fixes her gaze upon you. “Even a crow knows which oak will fall in the next gale,” she says coldly.',
        effects: {
          stats: { wyrd: -6, charisma: -4 },
          addFlags: ['leg_enc_aslaug_01_done'],
          legendStandingDelta: {
            legendId: 'aslaug_kraka',
            delta: -26,
            addFeud: 'Mocked Queen Aslaug by her childhood peasant name Kráka in Roskilde',
            addFeudFa: 'طعنه زدن به نام دوران کودکی ملکه اسلاگ (کراکا) در تالار راسکیله',
          },
        },
      },
    ],
  },

  {
    id: 'leg_enc_aslaug_02_randalin_tears',
    title: 'Hall of Legends · The Hailstone Tears of Queen Randalin',
    category: 'Historical Set-Piece',
    iconType: 'sword',
    provenance: 'Legendary / Composite Saga',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'LEGENDARY: In Ragnars saga loðbrókar, when Ragnar’s sons hesitate at the feast table, Aslaug takes the war-name Randalin (“Shield-Goddess”), weeps tears like blood-dark hailstones, and marches with the host.',
    yearRange: [860, 875],
    ageMin: 16,
    regions: ['Denmark', 'Sweden', 'Norway', 'British Isles'],
    blockedByFlags: ['leg_enc_aslaug_02_done'],
    weight: 21,
    text: 'In the smoke-filled royal hall of Zealand, the sons of Ragnar sit over their carved hnefatafl game-boards and ale-horns while debating the autumn gales and the perils of crossing the North Sea against Northumbria. Suddenly the heavy hall doors swing wide: Queen Aslaug steps between the long hearth-fires wearing a burnished ring-mail shirt over her crimson gown and a valkyrie helm upon her braided hair — taking the war-name *Randalin*, the Shield-Goddess.\n\nWhere her fierce tears fall upon the scrubbed oak table, they strike like hard, blood-dark hailstones before the silent bench-captains. “If my sons had died in England before me, Ragnar would not have waited six months at the gaming-board to launch his keels!” she cries in a ringing skaldic stave, turning her blazing gaze to your bench. “I will lead the fleet myself if men have forgotten the law of hefnd! Who in this hall will raise the mast with Queen Randalin?”',
    choices: [
      {
        id: 'aslaug_stand_with_randalin',
        label: 'Strike your sword against your shield and pledge your ships to Queen Randalin’s vanguard',
        tooltipHint: '+32 Standing with Aslaug · +8 Honor & Wyrd · +7 Combat · +25 Fame',
        outcomeText:
          'Your shield-clash echoes through the rafters, shaming every hesitant captain into leaping to their feet! Queen Randalin pours a horn of consecrated mead into your cup and chants a protective völva’s ward over your fleet.',
        effects: {
          fame: 25,
          stats: { honor: 8, wyrd: 8, charisma: 5 },
          skills: { combat: 7, skaldcraft: 5 },
          addFlags: ['leg_enc_aslaug_02_done', 'randalin_vanguard_oath'],
          legendStandingDelta: {
            legendId: 'aslaug_kraka',
            delta: 32,
            addOath: 'Answered Queen Randalin’s war-stave when the halls of Zealand hesitated',
            addOathFa: 'لبیک به رجزخوانی ملکه اسلاگ (راندالین) برای برافراشتن بادبان انتقام',
          },
        },
      },
      {
        id: 'aslaug_weave_banner_protection',
        label: 'Escort Queen Randalin’s sacred command-ship across the sea with your veteran oarsmen',
        tooltipHint: '+24 Standing with Aslaug · +6 Seamanship & Seidr · +35 Silver',
        outcomeText:
          'You lash your finest longship alongside Queen Randalin’s royal vessel, guarding the Völva-Queen as the great fleet sails westward.',
        effects: {
          silver: 35,
          fame: 20,
          skills: { seamanship: 6, seidr: 6 },
          addFlags: ['leg_enc_aslaug_02_done'],
          legendStandingDelta: {
            legendId: 'aslaug_kraka',
            delta: 24,
            addOath: 'Guarded Queen Randalin’s command ship during the mustering of the Great Army',
            addOathFa: 'محافظت از کشتی فرماندهی ملکه راندالین در لشکرکشی بزرگ',
          },
        },
      },
    ],
  },

  // =========================================================================
  // 9. KING ECGBERHT OF WESSEX — ENCOUNTERS I & II
  // =========================================================================
  {
    id: 'leg_enc_ecbert_01_winchester_court',
    title: 'Hall of Legends · Charlemagne’s Pupil on the High-Seat of Winchester',
    category: 'Historical Set-Piece',
    iconType: 'crown',
    provenance: 'Anglo-Saxon Chronicle',
    isSemiLegendary: false,
    sagaVsChronicleNote:
      'DOCUMENTED: The Anglo-Saxon Chronicle records Ecgberht’s thirteen-year exile at Charlemagne’s Frankish court before reigning in Wessex (802–839) and winning the title of Bretwalda after Ellandun (825).',
    yearRange: [802, 839],
    ageMin: 15,
    regions: ['British Isles', 'Continent'],
    blockedByFlags: ['leg_enc_ecbert_01_done'],
    weight: 22,
    text: 'Inside the whitewashed stone aula of Winchester, grey-bearded King Ecgberht of Wessex sits beneath a Carolingian-style arch while his West Saxon thegns finger their seax-hilts at the sight of your salt-stained northern sea-cloak. Having spent thirteen winters of his youth in exile at Emperor Charlemagne’s court in Aachen before crushing Mercian hegemony at the blood-red stream of Ellandun, Ecgberht waves away his Latin interpreter and addresses you directly in practiced Frankish trade-speech.\n\n“I have seen how Northmen fight in the Frisian islands, and I have watched Frankish counts buy a summer’s peace with silver only to invite ten more dragon-keels the following spring,” the old Bretwalda says, tapping his heavy gold signet ring against the carved oak arm-rest. “Tell me plainly, captain: do you beach your prows in Wessex to trade honest Baltic pelts and amber under royal charter, or to test the edge of my shire-levies?”',
    choices: [
      {
        id: 'ecbert_seal_winchester_charter',
        label: 'Swear a coastal trade-and-warning pact with the Bretwalda and receive his Carolingian signet',
        tooltipHint: '+30 Standing with Ecgberht · Gain Heirloom: Bretwalda Ring · +45 Silver · +7 Diplomacy',
        outcomeText:
          'Impressed by your statecraft, King Ecgberht draws his nielloed gold Bretwalda Ring (Konungshringr Egberhts) from his finger and seals a royal safe-conduct for your merchants across Kent, Sussex, and Wessex.',
        effects: {
          silver: 45,
          fame: 22,
          stats: { charisma: 5, cunning: 5 },
          skills: { diplomacy: 7, trade: 7, law: 5 },
          addHeirloomIds: ['ecbert_bretwalda_signet'],
          addFlags: ['leg_enc_ecbert_01_done', 'ecbert_wessex_friend'],
          legendStandingDelta: {
            legendId: 'king_ecbert_wessex',
            delta: 30,
            addGift: "Gifted King Ecgberht's Bretwalda Ring (Konungshringr Egberhts) at Winchester",
            addGiftFa: 'دریافت انگشتری و نشان برتوالدای شاه اکبرت در دربار وینچستر',
          },
        },
        chain: {
          eventId: 'leg_enc_ecbert_02_hingston_down',
          delayYears: 1,
        },
      },
      {
        id: 'ecbert_debate_carolingian_warfare',
        label: 'Debate Frankish cavalry formations versus the Norse shield-wall with the old king',
        tooltipHint: '+20 Standing with Ecgberht · +6 Combat & Law · +25 Silver',
        outcomeText:
          'For two hours over spiced Frankish wine, Ecgberht tests your knowledge of river fortifications and wedge formations. He gifts your steersman a silver-hilted seax in respect.',
        effects: {
          silver: 25,
          fame: 16,
          stats: { cunning: 6 },
          skills: { combat: 6, law: 6 },
          addFlags: ['leg_enc_ecbert_01_done'],
          legendStandingDelta: {
            legendId: 'king_ecbert_wessex',
            delta: 20,
            addOath: 'Shared military counsel with King Ecgberht of Wessex at Winchester',
            addOathFa: 'گفت‌وگوی راهبردی و نظامی با شاه اکبرت وسکس در تالار وینچستر',
          },
        },
        chain: {
          eventId: 'leg_enc_ecbert_02_hingston_down',
          delayYears: 1,
        },
      },
      {
        id: 'ecbert_raid_dorset_coast',
        label: 'Break off the parley and raid the Dorset royal estates on your way down the Channel',
        tooltipHint: '-28 Standing with Ecgberht · +50 Silver · +5 Combat',
        outcomeText:
          'You weigh anchor before dawn and carry off cattle and silver from a West Saxon royal vill, earning Ecgberht’s iron enmity across the southern shires.',
        effects: {
          silver: 50,
          skills: { combat: 5 },
          addFlags: ['leg_enc_ecbert_01_done'],
          legendStandingDelta: {
            legendId: 'king_ecbert_wessex',
            delta: -28,
            addFeud: 'Raided King Ecgberht’s West Saxon coastal estates after the Winchester parley',
            addFeudFa: 'غارت املاک ساحلی وسکس پس از مذاکره با شاه اکبرت در وینچستر',
          },
        },
      },
    ],
  },

  {
    id: 'leg_enc_ecbert_02_hingston_down',
    title: 'Hall of Legends · The Bretwalda’s Shield-Wall at Hingston Down',
    category: 'Historical Set-Piece',
    iconType: 'sword',
    provenance: 'Anglo-Saxon Chronicle',
    isSemiLegendary: false,
    sagaVsChronicleNote:
      'DOCUMENTED: The Anglo-Saxon Chronicle for 838 records a great Danish fleet joining the Cornish Britons against Wessex, only to be routed by aged King Ecgberht at Hingston Down.',
    yearRange: [825, 839],
    ageMin: 15,
    regions: ['British Isles', 'Denmark', 'Norway'],
    blockedByFlags: ['leg_enc_ecbert_02_done'],
    weight: 24,
    text: 'High on the wind-scoured granite ridge of Hingston Down above the River Tamar in Cornwall, a combined host of Danish sea-raiders and Cornish Britons stands arrayed in wedge formations against the massed West Saxon fyrd. Despite his sixty-seven winters, King Ecgberht rides steady along his locked shield-wall in Carolingian scale-armor beneath the golden dragon standard of Wessex, marshaling his ealdormen with the iron discipline he learned under Charlemagne.\n\nAs river-mist rises from the Tamar estuary where your longships ride at anchor, swift riders from both hosts gallop down to the shingle: the Danish-Cornish war-leaders urge you to land your hird and strike Ecgberht’s exposed river flank, while the old Bretwalda’s herald offers forty pounds of pure Winchester silver if your keels hold the Tamar ford neutral until sundown!',
    choices: [
      {
        id: 'ecbert_honor_tamar_truce',
        label: 'Hold the Tamar river-ford for King Ecgberht and earn the Bretwalda’s royal silver',
        tooltipHint: '+28 Standing with Ecgberht · +55 Silver · +7 Diplomacy & Honor',
        outcomeText:
          'With his river flank secure, aged King Ecgberht shatters the Cornish-Danish line on Hingston Down! Before returning in triumph to Winchester, the old monarch pays out forty pounds of pure silver to your crew.',
        effects: {
          silver: 55,
          fame: 22,
          stats: { honor: 7, charisma: 4 },
          skills: { diplomacy: 7, law: 4 },
          addFlags: ['leg_enc_ecbert_02_done'],
          legendStandingDelta: {
            legendId: 'king_ecbert_wessex',
            delta: 28,
            addOath: 'Held the Tamar ford in truce for King Ecgberht at the Battle of Hingston Down (838)',
            addOathFa: 'حفظ گذرگاه رود تامار در پیمان با شاه اکبرت در نبرد هینگستون داون (۸۳۸)',
          },
        },
      },
      {
        id: 'ecbert_clash_with_bretwalda',
        label: 'Lock shields with the Danish-Cornish host and test Ecgberht’s veteran fyrd head-on!',
        tooltipHint: '-30 Standing with Ecgberht · +26 Fame · +8 Combat · Historical Divergence',
        outcomeText:
          'Your veteran hird anchors the center of the ridge against Ecgberht’s charging thegns! Though the Cornish wing wavers, your shield-wall holds the high ground until nightfall, forcing the old Bretwalda to concede safe passage and silver ransom on the Tamar.',
        effects: {
          silver: 40,
          fame: 26,
          stats: { strength: 6, honor: 5 },
          skills: { combat: 8 },
          addFlags: ['leg_enc_ecbert_02_done'],
          divergenceNote:
            'Reinforced by a disciplined Norse hird at Hingston Down (838), the northern coalition held the ridge against King Ecgberht’s West Saxon fyrd.',
          legendStandingDelta: {
            legendId: 'king_ecbert_wessex',
            delta: -30,
            addFeud: 'Fought against King Ecgberht’s West Saxon fyrd on the ridge of Hingston Down',
            addFeudFa: 'نبرد رودررو با سپاه وسکس و شاه اکبرت بر فراز تپه هینگستون داون',
          },
        },
      },
    ],
  },

  // =========================================================================
  // 10. KING ÆLLA OF NORTHUMBRIA — ENCOUNTERS I & II
  // =========================================================================
  {
    id: 'leg_enc_aella_01_eoforwic_usurper',
    title: 'Hall of Legends · King Ælla’s Watch-Tower at Eoforwic (York)',
    category: 'Historical Set-Piece',
    iconType: 'crown',
    provenance: 'Anglo-Saxon Chronicle',
    isSemiLegendary: false,
    sagaVsChronicleNote:
      'DOCUMENTED: The Anglo-Saxon Chronicle and Symeon of Durham record Ælla seizing the Northumbrian crown from King Osberht in 862 while Roman York’s walls stood in disrepair.',
    yearRange: [858, 866],
    ageMin: 15,
    regions: ['British Isles', 'Denmark', 'Norway'],
    blockedByFlags: ['leg_enc_aella_01_done'],
    weight: 20,
    text: 'Inside the ancient Roman Multangular Tower of Eoforwic (York), King Ælla of Northumbria paces restlessly before an iron brazier, a heavy gilded boar-clasp fastening his wool cloak at the shoulder. Having driven the rightful King Osberht into the northern hills in 862, Ælla rules a bitterly divided kingdom whose crumbling Roman stone ramparts stand patched with rotting timber palisades along the Foss and the Ouse.\n\nWhen your longship glides up the tidal Ouse to the merchant jetty, Ælla’s armed port-reeve marches you before the suspicious usurper. “Every Danish keel that crosses the Humber carries either amber-merchants or spies for Ragnar Lothbrok’s vengeful brood,” King Ælla says coldly, his knuckles white on his sword-pommel as his household guards bar the door. “Declare your business in Eoforwic here and now, before I have my coast-wardens chain your steering-oar and cast your crew into the tower pit!”',
    choices: [
      {
        id: 'aella_spy_york_walls',
        label: 'Feign humble merchant business while secretly pacing out the weak gaps in York’s Roman wall',
        tooltipHint: '-18 Standing with Ælla · +8 Cunning · +6 Combat · Unlocks Breach of York',
        outcomeText:
          'Bowing smoothly while paying a modest wool-toll, you count every crumbling courses of Roman stone along the southern rampart. Your secret tally of York’s weak gates will prove priceless when the Great Army marches!',
        effects: {
          silver: -10,
          fame: 18,
          stats: { cunning: 8 },
          skills: { combat: 6, trade: 4 },
          addFlags: ['leg_enc_aella_01_done', 'york_walls_scouted'],
          legendStandingDelta: {
            legendId: 'king_aella_northumbria',
            delta: -18,
            addFeud: 'Secretly charted the breached Roman walls of Eoforwic under King Ælla’s nose',
            addFeudFa: 'نقشه‌برداری پنهانی از شکاف دیوارهای رومی یورک در دربار شاه ائلا',
          },
        },
        chain: {
          eventId: 'leg_enc_aella_02_roman_breach',
          delayYears: 1,
        },
      },
      {
        id: 'aella_sell_mercenary_service',
        label: 'Offer temporary river-guard service on the Ouse against deposed King Osberht’s partisans',
        tooltipHint: '+24 Standing with Ælla · +45 Silver · +5 Diplomacy',
        outcomeText:
          'Relieved to find a northern captain willing to take Northumbrian silver, King Ælla pays out forty-five silver stycas and grants your ship provisions along the Ouse.',
        effects: {
          silver: 45,
          skills: { diplomacy: 5, seamanship: 4 },
          addFlags: ['leg_enc_aella_01_done'],
          legendStandingDelta: {
            legendId: 'king_aella_northumbria',
            delta: 24,
            addOath: 'Entered temporary river-guard compact with King Ælla at Eoforwic',
            addOathFa: 'قرارداد موقت نگهبانی در رود اوز با شاه ائلا در شهر یورک',
          },
        },
        chain: {
          eventId: 'leg_enc_aella_02_roman_breach',
          delayYears: 1,
        },
      },
      {
        id: 'aella_warn_of_young_boars',
        label: 'Look Ælla in the eye and warn him that the sons of Ragnar will soon avenge the snake-pit',
        tooltipHint: '-30 Standing with Ælla · +22 Fame · +8 Honor',
        outcomeText:
          'King Ælla’s face goes ashen at the mention of the old boar’s song. Your crew fights its way back down the Ouse dockside before his spearmen can shut the river-boom!',
        effects: {
          fame: 22,
          stats: { honor: 8, strength: 4 },
          skills: { combat: 5 },
          addFlags: ['leg_enc_aella_01_done'],
          legendStandingDelta: {
            legendId: 'king_aella_northumbria',
            delta: -30,
            addFeud: 'Defied King Ælla to his face in York with the prophecy of Ragnar’s sons',
            addFeudFa: 'به رخ کشیدن انتقام پسران راگنار در برابر چشمان شاه ائلا در تالار یورک',
          },
        },
        chain: {
          eventId: 'leg_enc_aella_02_roman_breach',
          delayYears: 1,
        },
      },
    ],
  },

  {
    id: 'leg_enc_aella_02_roman_breach',
    title: 'Hall of Legends · The Breached Wall of York & Judgment Upon King Ælla',
    category: 'Historical Set-Piece',
    iconType: 'sword',
    provenance: 'Anglo-Saxon Chronicle',
    isSemiLegendary: false,
    sagaVsChronicleNote:
      'DOCUMENTED / CONTESTED: The Anglo-Saxon Chronicle records Kings Osberht and Ælla breaking into York on 21 March 867 and falling in the slaughter within the walls; Ragnarssona þáttr adds the Blood-Eagle vengeance.',
    yearRange: [865, 867],
    ageMin: 16,
    regions: ['British Isles', 'Denmark', 'Norway', 'Sweden'],
    blockedByFlags: ['leg_enc_aella_02_done'],
    weight: 25,
    text: 'On the twenty-first of March, 867, the newly reconciled Northumbrian armies of deposed King Osberht and King Ælla storm the crumbling Roman rampart of Eoforwic (York). Thinking the Danish defenders are routing in panic from the outer ditch, King Ælla raises his sword and charges headlong through the masonry breach beneath his gilded boar standard — straight into the waiting double shield-walls that Ivar and his brothers have drawn up across the narrow timbered streets!\n\nAs the iron jaw-trap slams shut behind the Northumbrians and Osberht falls by the south gate, your hird corners King Ælla’s royal bodyguard against the ancient Roman stonework while the sons of Ragnar close in to exact vengeance for their father’s snake-pit. Amidst the roar of clashing shields and splintering ash-spears, what is your stroke in the fall of Northumbria?',
    choices: [
      {
        id: 'aella_seize_boar_standard',
        label: 'Cut down Ælla’s standard-bearer, capture the Northumbrian king for judgment, and claim his royal clasp',
        tooltipHint: '-35 Standing with Ælla · +25 Standing with Ivar · Gain Heirloom: Boar-Clasp of Eoforwic · +55 Silver',
        outcomeText:
          'Your axe-stroke fells the royal banner-man and rings King Ælla in iron shields! As the debt of the snake-pit (Hefnd) is paid in full before the Great Army, you claim the gilded Northumbrian Boar-Clasp of Eoforwic (Jórvíkur-Sylgja Ellu) from the royal treasury.',
        effects: {
          silver: 55,
          fame: 30,
          stats: { strength: 5, honor: 8 },
          skills: { combat: 8 },
          addHeirloomIds: ['aella_york_crown_brooch'],
          addFlags: ['leg_enc_aella_02_done', 'anchor_york_867_taken'],
          legendStandingDelta: {
            legendId: 'king_aella_northumbria',
            delta: -35,
            addGift: 'Captured the Northumbrian Boar-Clasp of Eoforwic at the fall of King Ælla (867)',
            addGiftFa: 'تصاحب سنجاق سلطنتی گراز یورک در روز سقوط شاه ائلا (۸۶۷ میلادی)',
          },
        },
      },
      {
        id: 'aella_ransom_northumbrian_thegns',
        label: 'Accept silver wergild from Ælla’s surviving Northumbrian earls to govern York’s hinterland',
        tooltipHint: '+15 Standing · Gain Heirloom: Boar-Clasp of Eoforwic · +65 Silver · +6 Diplomacy',
        outcomeText:
          'While King Ælla falls in the street-fighting inside the Roman wall, you spare the surviving Northumbrian thegns beyond the Tyne in exchange for sixty-five silver pieces and the royal Boar-Clasp of Eoforwic.',
        effects: {
          silver: 65,
          fame: 22,
          skills: { diplomacy: 6, law: 6 },
          addHeirloomIds: ['aella_york_crown_brooch'],
          addFlags: ['leg_enc_aella_02_done', 'anchor_york_867_taken'],
          legendStandingDelta: {
            legendId: 'king_aella_northumbria',
            delta: 15,
            addGift: 'Received the Boar-Clasp of Eoforwic from Northumbria’s surviving thegns at York',
            addGiftFa: 'دریافت سنجاق سلطنتی گراز یورک از بزرگان بازمانده نورثامبریا',
          },
        },
      },
    ],
  },

  // =========================================================================
  // 11. KING ALFRED OF WESSEX — ENCOUNTERS I & II
  // =========================================================================
  {
    id: 'leg_enc_alfred_01_athelney_fens',
    title: 'Hall of Legends · Smoke in the Alder-Marshes of Athelney',
    category: 'Historical Set-Piece',
    iconType: 'sword',
    provenance: 'Anglo-Saxon Chronicle',
    isSemiLegendary: false,
    sagaVsChronicleNote:
      'DOCUMENTED: Asser’s Life of King Alfred and the Anglo-Saxon Chronicle (878) describe King Alfred holding out in the Somerset marshes of Athelney before rallying the shires to win Edington.',
    yearRange: [871, 885],
    ageMin: 15,
    regions: ['British Isles', 'Continent', 'Denmark'],
    blockedByFlags: ['leg_enc_alfred_01_done'],
    weight: 21,
    text: 'Deep in the flooded alder-carrs and reed-fens of Somerset rises the low marsh-island of Athelney, reachable only by hidden punt-channels and a narrow timber causeway. Driven into these wetlands after Guthrum’s sudden Twelfth Night strike on Chippenham in January 878, twenty-nine-year-old King Alfred of Wessex sits calmly by a smoky peat watch-fire with a small Latin psalm-book in one hand and a fine whetstone in the other, directing his muddy Somerset thegns as they sharpen spears and fortify the causeway.\n\nWhen your scouting party threads the sluggish marsh channels in a shallow skiff, Alfred steps forward to the water’s edge without a trace of fear. “You see a king whose hall is reed-thatch and whose realm today is three leagues of Somerset mud,” Alfred says in measured speech. “Yet before Whitsuntide, the banners of Somerset, Wiltshire, and Hampshire will meet me at Egbert’s Stone. Will you seal a quiet truce with Wessex now while the fens are dark, or test our shield-wall on the chalk downs?”',
    choices: [
      {
        id: 'alfred_parley_athelney_truce',
        label: 'Respect the marsh-king’s resolve and seal a private truce to keep your ships out of Edington',
        tooltipHint: '+28 Standing with Alfred · +40 Silver · +7 Diplomacy & Law · Unlocks Winchester Scholar-King',
        outcomeText:
          'Alfred clasps your hand with quiet gravity. “A word kept in the dark days is worth ten sworn in triumph,” he says, sharing his camp’s silver and marking your banner for royal welcome when Winchester is restored.',
        effects: {
          silver: 40,
          fame: 20,
          stats: { honor: 6, cunning: 5 },
          skills: { diplomacy: 7, law: 6 },
          addFlags: ['leg_enc_alfred_01_done', 'alfred_athelney_respect'],
          legendStandingDelta: {
            legendId: 'alfred_the_great',
            delta: 28,
            addOath: 'Respected King Alfred’s truce in the Somerset marshes of Athelney (878)',
            addOathFa: 'پیمان احترام و ترک مخاصمه با شاه آلفرد در مرداب‌های اتلنی (۸۷۸ میلادی)',
          },
        },
        chain: {
          eventId: 'leg_enc_alfred_02_wedmore_burhs',
          delayYears: 2,
        },
      },
      {
        id: 'alfred_skirmish_marsh_causeway',
        label: 'Attack the Athelney timber causeway to win Guthrum’s bounty on the fugitive king!',
        tooltipHint: '-26 Standing with Alfred · +6 Combat · +18 Fame',
        outcomeText:
          'You lead a fierce charge across the narrow marsh-bridge, but Alfred’s Somerset household guards fight like cornered badgers in the chest-deep reeds, forcing both sides to pull back with notched blades and grudging respect.',
        effects: {
          fame: 18,
          stats: { strength: 5, health: -5 },
          skills: { combat: 6 },
          addFlags: ['leg_enc_alfred_01_done'],
          legendStandingDelta: {
            legendId: 'alfred_the_great',
            delta: -26,
            addFeud: 'Assailed King Alfred’s marsh-redoubt at Athelney in Somerset',
            addFeudFa: 'یورش به پناهگاه مردابی شاه آلفرد در جزیره اتلنیِ سامرست',
          },
        },
        chain: {
          eventId: 'leg_enc_alfred_02_wedmore_burhs',
          delayYears: 2,
        },
      },
    ],
  },

  {
    id: 'leg_enc_alfred_02_wedmore_burhs',
    title: 'Hall of Legends · The Scholar-King’s Candle-Clock & the Gold Æstel',
    category: 'Historical Set-Piece',
    iconType: 'crown',
    provenance: 'Anglo-Saxon Chronicle',
    isSemiLegendary: false,
    sagaVsChronicleNote:
      'DOCUMENTED: Asser’s Life of King Alfred describes Alfred’s horn-shielded candle-clocks, his 60-oared warships, the Burghal Hidage fortresses, and the gold Æstel pointers sent with his translations (the famous “Alfred Jewel”).',
    yearRange: [878, 899],
    ageMin: 16,
    regions: ['British Isles', 'Continent', 'Denmark', 'Norway'],
    blockedByFlags: ['leg_enc_alfred_02_done'],
    weight: 21,
    text: 'In the restored royal scriptorium at Winchester, a twelve-inch graduated wax candle burns steadily inside a translucent ox-horn lantern — King Alfred’s own invention to measure the hours of law, prayer, and border defense even when winter drafts blow through the hall doors. On the scrubbed oak table, beside vellum rolls of the *Burghal Hidage* fortress network and hull-drawings of his new sixty-oared warships, gleams a masterpiece of gold filigree, cloisonné enamel, and rock crystal inscribed *AELFRED MEC HEHT GEWYRCAN* (“Alfred ordered me made”).\n\nKing Alfred looks up from the Old English parchment where his scribes have just recorded the Arctic voyage of the Norwegian sea-captain Ohthere (*Óttarr* of Hålogaland). “Tell my chroniclers of the northern sea-lanes and sign our Danelaw market-peace,” Alfred says, offering the golden jewel-pointer. “For wisdom and written law bind kingdoms tighter than iron chains.”',
    choices: [
      {
        id: 'alfred_share_northern_geography',
        label: 'Recount the sea-routes of the North (like Ohthere of Hålogaland) and receive Alfred’s Gold Æstel',
        tooltipHint: '+32 Standing with Alfred · Gain Heirloom: King Alfred’s Gold Æstel · +50 Silver · +8 Diplomacy',
        outcomeText:
          'As Alfred’s scribes eagerly record your account of the Norwegian fjords and Danish straits in Old English, the King presents you with his filigree Gold Jewel-Pointer (Gull-Æstel Álfráðs) and fifty silver pennies!',
        effects: {
          silver: 50,
          fame: 26,
          stats: { charisma: 6, cunning: 6 },
          skills: { diplomacy: 8, seamanship: 6, law: 6 },
          addHeirloomIds: ['alfred_gold_aestel'],
          addFlags: ['leg_enc_alfred_02_done', 'alfred_winchester_guest'],
          legendStandingDelta: {
            legendId: 'alfred_the_great',
            delta: 32,
            addGift: "Gifted King Alfred's Gold Jewel-Pointer (Æstel) after recounting the Northern sea-routes",
            addGiftFa: 'دریافت نشانگر زرین شاه آلفرد (اَستل) پس از روایت مسیرهای دریایی شمال در وینچستر',
          },
        },
      },
      {
        id: 'alfred_inspect_sixty_oar_ships',
        label: 'Compare hull-lines at Southampton dockyard where Alfred builds his new 60-oared warships',
        tooltipHint: '+24 Standing with Alfred · +8 Seamanship & Craft · +35 Silver',
        outcomeText:
          'At the Solent shipyards, you and Alfred’s Frisian shipwrights debate the deeper draft and high freeboard of his sixty-oared keels. Both fleets come away wiser in the art of naval war.',
        effects: {
          silver: 35,
          fame: 20,
          skills: { seamanship: 8, craft: 8 },
          addFlags: ['leg_enc_alfred_02_done'],
          legendStandingDelta: {
            legendId: 'alfred_the_great',
            delta: 24,
            addOath: 'Exchanged shipwright lore with King Alfred at the Solent royal dockyards',
            addOathFa: 'تبادل دانش کشتی‌سازی با شاه آلفرد کبیر در کارگاه دریایی وسکس',
          },
        },
      },
    ],
  },

  // =========================================================================
  // 12. KING GUTHRUM (ÆTHELSTAN) — ENCOUNTERS I & II
  // =========================================================================
  {
    id: 'leg_enc_guthrum_01_night_march',
    title: 'Hall of Legends · Oaths on the Sacred Ring & the Night-March to Exeter',
    category: 'Historical Set-Piece',
    iconType: 'sword',
    provenance: 'Anglo-Saxon Chronicle',
    isSemiLegendary: false,
    sagaVsChronicleNote:
      'DOCUMENTED: The Anglo-Saxon Chronicle (876–877) records Guthrum swearing to King Alfred upon the “holy ring” (stórhringr) at Wareham, then breaking camp by night to ride into Exeter.',
    yearRange: [871, 882],
    ageMin: 15,
    regions: ['British Isles', 'Denmark'],
    blockedByFlags: ['leg_enc_guthrum_01_done'],
    weight: 20,
    text: 'At the Dorset port-fortress of Wareham between the Rivers Frome and Piddle, King Guthrum — commander of the Great Summer Army — stands beside a brazier holding a heavy gold temple arm-ring (*stórhringr*) darkened with sacrificial blood. Only hours ago he swore a solemn peace upon that sacred ring to King Alfred’s West Saxon envoys, pledging that his host would quit Wessex; yet already in the courtyard his mounted raiders are muffling their horses’ iron-shod hooves with strips of wool cloth in the gathering dark.\n\nGuthrum catches your eye and grins beneath his nasal helm as his grooms tighten saddle-girths. “I swore to Alfred that we would leave Wareham,” he whispers slyly, tapping the temple-ring against his mail-shirt, “and leave Wareham we shall — riding straight west across the hills into the Roman stone walls of Exeter before his shire-horsemen wake! Will you ride in my night-column and share the Devonshire silver?”',
    choices: [
      {
        id: 'guthrum_ride_exeter_column',
        label: 'Muffle your horses’ hooves and ride with Guthrum’s night-column into Exeter',
        tooltipHint: '+28 Standing with Guthrum · +7 Cunning & Combat · +45 Silver · Unlocks Wedmore Mint',
        outcomeText:
          'Slipping past the West Saxon watch-fires in the mist, your mounted column gallops into the Roman walls of Exeter without losing a man! Guthrum shares out forty-five pieces of silver from the Devonshire spoils.',
        effects: {
          silver: 45,
          fame: 20,
          stats: { cunning: 7 },
          skills: { combat: 7 },
          addFlags: ['leg_enc_guthrum_01_done', 'guthrum_night_rider'],
          legendStandingDelta: {
            legendId: 'guthrum_danelaw',
            delta: 28,
            addOath: 'Rode in Guthrum’s mounted night-march from Wareham to Exeter',
            addOathFa: 'همراهی با ستون سواره‌نظام شبانه گوتورم از ورم به سوی دژ اکستر',
          },
        },
        chain: {
          eventId: 'leg_enc_guthrum_02_aethelstan_mint',
          delayYears: 2,
        },
      },
      {
        id: 'guthrum_rebuke_ring_breaking',
        label: 'Refuse to break an oath sworn upon the sacred temple-ring of Thor and Odin',
        tooltipHint: '-22 Standing with Guthrum · +10 Honor & Faith · +18 Fame',
        outcomeText:
          'You lay your hand upon your own arm-ring and declare that twisting an oath on the holy stórhringr invites the wrath of the gods — and sure enough, a tempest soon wrecks 120 of Guthrum’s ships off Swanage!',
        effects: {
          fame: 18,
          stats: { honor: 10, faith: 8, wyrd: 5 },
          addFlags: ['leg_enc_guthrum_01_done'],
          legendStandingDelta: {
            legendId: 'guthrum_danelaw',
            delta: -22,
            addFeud: 'Rebuked Guthrum for twisting the sacred arm-ring oath at Wareham (876)',
            addFeudFa: 'سرزنش گوتورم به سبب شکستن سوگندِ حلقه مقدس در دژ ورم (۸۷۶ میلادی)',
          },
        },
        chain: {
          eventId: 'leg_enc_guthrum_02_aethelstan_mint',
          delayYears: 2,
        },
      },
    ],
  },

  {
    id: 'leg_enc_guthrum_02_aethelstan_mint',
    title: 'Hall of Legends · The Chrism-Cloth of Wedmore & Coins of King Æthelstan',
    category: 'Historical Set-Piece',
    iconType: 'crown',
    provenance: 'Anglo-Saxon Chronicle',
    isSemiLegendary: false,
    sagaVsChronicleNote:
      'DOCUMENTED: After the Battle of Edington (878), the Anglo-Saxon Chronicle records Guthrum’s baptism at Aller, the loosening of his chrism-cloth at Wedmore, the Treaty of Alfred and Guthrum, and his East Anglian coinage inscribed EDELSTAN REX.',
    yearRange: [878, 890],
    ageMin: 16,
    regions: ['British Isles', 'Denmark', 'Continent'],
    blockedByFlags: ['leg_enc_guthrum_02_done'],
    weight: 21,
    text: 'In the timbered royal hall of East Anglia at Gippeswic, King Guthrum — newly baptized at Aller as King Æthelstan with King Alfred of Wessex standing as his Christian godfather — sits on the high-seat with the white linen chrism-cloth of Wedmore folded beside his notched Danish war-axe. Before him on the table lies the sealed parchment of the *Treaty of Alfred and Guthrum*, fixing the permanent frontier of the Danelaw along the Thames, the River Lea, and the ancient Roman road of Watling Street.\n\nGuthrum holds up a freshly minted silver penny stamped *EDELSTAN REX* in one hand and a hacked Viking silver arm-ring in the other. “Some greybeard raiders in the fleet call me a priest’s convert because I wore Alfred’s white linen for twelve days,” he says with a shrewd, battle-scarred smile. “Yet every jarl who rode with me now holds rich ploughland and market-tolls across East Anglia without a Saxon spear crossing Watling Street. How does your hall judge the Peace of Wedmore?”',
    choices: [
      {
        id: 'guthrum_endorse_danelaw_peace',
        label: 'Praise his statecraft, sign the Danelaw market-charter, and receive his Wedmore Peace-Torque',
        tooltipHint: '+30 Standing with Guthrum · Gain Heirloom: Wedmore Peace-Torque · +50 Silver · +8 Trade',
        outcomeText:
          '“A true jarl knows when to reap what the sword has sown!” Guthrum laughs. He clasps the dual silver-and-cross Wedmore Peace-Torque (Friðbaugr Gorms) onto your arm and grants your ships priority custom in the ports of East Anglia.',
        effects: {
          silver: 50,
          fame: 24,
          stats: { cunning: 6, charisma: 5 },
          skills: { trade: 8, diplomacy: 7, law: 5 },
          addHeirloomIds: ['guthrum_wedmore_cross_torque'],
          addFlags: ['leg_enc_guthrum_02_done', 'guthrum_danelaw_partner'],
          legendStandingDelta: {
            legendId: 'guthrum_danelaw',
            delta: 30,
            addGift: "Gifted Guthrum-Æthelstan's Wedmore Peace-Torque (Friðbaugr Gorms) in East Anglia",
            addGiftFa: 'دریافت طوق دوگانه گوتورم-اتلستن (یادگار پیمان ودمور) در ایست آنگلیا',
          },
        },
      },
      {
        id: 'guthrum_recruit_restless_veterans',
        label: 'Recruit the restless pagan oarsmen in his camp who refuse to settle behind the Watling Street border',
        tooltipHint: '+18 Standing with Guthrum · +12 Warriors · +6 Combat',
        outcomeText:
          'Guthrum nods pragmatically: “Take the hot-bloods to Frankia before they break my border treaty!” Twelve seasoned Danish veterans carry their sea-chests aboard your longships.',
        effects: {
          hirdWarriors: 12,
          fame: 18,
          skills: { combat: 6 },
          stats: { charisma: 4 },
          addFlags: ['leg_enc_guthrum_02_done'],
          legendStandingDelta: {
            legendId: 'guthrum_danelaw',
            delta: 18,
            addOath: 'Relieved King Guthrum-Æthelstan of restless raiders to preserve the Danelaw peace',
            addOathFa: 'جذب جنگجویان ناآرام اردوگاه گوتورم برای حفظ صلح مرزی دانلا',
          },
        },
      },
    ],
  },

  // =========================================================================
  // 13. HASTEIN (HÁSTEINN OF THE LOIRE) — PHASE 3 SIGNATURE ENCOUNTER
  // =========================================================================
  {
    id: 'leg_enc_hastein_01_loire',
    title: 'Hall of Legends · The Wolf of Noirmoutier & the Wine-Presses of the Loire',
    category: 'Historical Set-Piece',
    iconType: 'ship',
    provenance: 'Frankish Annals',
    isSemiLegendary: false,
    sagaVsChronicleNote:
      'DOCUMENTED: The Chronicon Namnetense, Annales Bertiniani, and Regino of Prüm record Hastein (Hastingus) operating from the island base of Noirmoutier on the Loire, routing the Bretons and Franks at Brissarthe (866) where Robert the Strong fell, and campaigning across the Somme and Thames.',
    yearRange: [848, 896],
    ageMin: 15,
    regions: ['Continent', 'Mediterranean', 'British Isles', 'Denmark'],
    blockedByFlags: ['leg_enc_hastein_01_done'],
    weight: 19,
    text: 'On the tidal salt-marsh island of Noirmoutier at the mouth of the River Loire, dozens of tarred dragon-ships lie careened beside captured Frankish stone salt-pans and monastery wine-cellars. Sitting atop a carved bishop’s chair on the shingle is Hastein — Hásteinn to the Norse, Hastingus to the terrified chroniclers of Tours and Nantes — a grizzled sea-wolf with three white scar-lines across his cheek and a gold reliquary chain looped thrice around his mail-wrist.\n\nHe pours red Anjou wine into two silver chalices and thrusts one into your hand. “Kings in the north fight over rocky fjords and frozen turnips,” Hastein laughs, pointing his dagger upriver toward Tours and Angers. “Here on the Loire, we hold the island key to four Frankish counties: when Count Robert marches left, we row right; when the bishops lock their gates, we sell them back their own bells for silver! Will your crew join my Loire brotherhood this season?”',
    choices: [
      {
        id: 'hastein_ride_brissarthe_raid',
        label: 'Lash your prows to Hastein’s Loire flotilla and strike the Frankish river-counts in a swift raid',
        tooltipHint: '+28 Standing with Hastein · +50 Silver · +7 Combat & Cunning · +20 Fame',
        outcomeText:
          'Rowing upstream on the flood-tide with muffled oars, your combined flotilla seizes the fortified stone church of Brissarthe and breaks the pursuing Frankish cavalry at the gates! Hastein tosses you a heavy sack of Aquitanian silver deniers and hails you as a true wolf of the Loire.',
        effects: {
          silver: 50,
          fame: 20,
          stats: { cunning: 6, strength: 4 },
          skills: { combat: 7, seamanship: 5 },
          addFlags: ['leg_enc_hastein_01_done', 'hastein_loire_raider'],
          legendStandingDelta: {
            legendId: 'hastein_loire',
            delta: 28,
            addOath: 'Rowed with Hastein’s Loire flotilla from the island base of Noirmoutier',
            addOathFa: 'هم‌رزمی با ناوگان هستین در رود لوآر و پایگاه جزیره‌ای نوارموتیه',
          },
        },
      },
      {
        id: 'hastein_broker_salt_and_wine',
        label: 'Buy Noirmoutier bay-salt and Anjou wine from Hastein’s fleet to sell in the northern markets',
        tooltipHint: '+20 Standing with Hastein · +40 Silver · +7 Trade & Seamanship',
        outcomeText:
          'You load your cargo-hold with prized Bourgneuf bay-salt and casks of Frankish vintage from Hastein’s island magazines. The veteran sea-king grants your merchants safe-conduct flags across the Bay of Biscay.',
        effects: {
          silver: 40,
          fame: 14,
          stats: { cunning: 4, charisma: 4 },
          skills: { trade: 7, seamanship: 6 },
          addFlags: ['leg_enc_hastein_01_done', 'hastein_trade_partner'],
          legendStandingDelta: {
            legendId: 'hastein_loire',
            delta: 20,
            addOath: 'Traded Biscay bay-salt and Frankish wine at Hastein’s Noirmoutier anchorage',
            addOathFa: 'تجارت نمک دریایی و باده فرانکی در لنگرگاه نوارموتیه با هستین',
          },
        },
      },
      {
        id: 'hastein_spurn_trickster_ways',
        label: 'Warn your crew that Hastein’s feigned baptisms and coffin-tricks dishonor a true warrior’s word',
        tooltipHint: '-22 Standing with Hastein · +8 Honor & Faith · +4 Stability',
        outcomeText:
          'Hastein’s scarred cheek twitches as he drains both chalices himself. “Die honest and poor on a Saxon spear-wall then, greybeard!” he jeers as your ship rows out of the Loire estuary.',
        effects: {
          stability: 4,
          stats: { honor: 8, faith: 5 },
          addFlags: ['leg_enc_hastein_01_done'],
          legendStandingDelta: {
            legendId: 'hastein_loire',
            delta: -22,
            addFeud: 'Denounced Hastein’s ruses and false truces at the Noirmoutier war-camp',
            addFeudFa: 'نکوهش نیرنگ‌ها و پیمان‌های ساختگی هستین در اردوگاه نوارموتیه',
          },
        },
      },
    ],
  },

  // =========================================================================
  // 14. KING HORIK I OF DENMARK — PHASE 3 SIGNATURE ENCOUNTER
  // =========================================================================
  {
    id: 'leg_enc_horik_01_hedeby',
    title: 'Hall of Legends · King Horik’s Toll-Scales & the Envoys of Aachen at Hedeby',
    category: 'Historical Set-Piece',
    iconType: 'crown',
    provenance: 'Frankish Annals',
    isSemiLegendary: false,
    sagaVsChronicleNote:
      'DOCUMENTED: The Royal Frankish Annals, Annales Bertiniani, and Rimbert’s Vita Anskarii record King Horik I (r. 827–854) ruling from Hedeby/Jutland, negotiating border peace with Louis the Pious and Louis the German, executing unauthorized raiders, and permitting Ansgar to build Hedeby’s first church bell.',
    yearRange: [827, 854],
    ageMin: 15,
    regions: ['Denmark', 'Continent', 'Baltic', 'Norway'],
    blockedByFlags: ['leg_enc_horik_01_done'],
    weight: 19,
    text: 'Above the semicircular earthen rampart of Hedeby, the royal standard of King Horik I, son of Gudfred, snaps over a harbor crowded with Frisian cog-merchants, Slav amber-traders, and sleek Danish longships. Inside the royal customs hall, King Horik sits flanked by East Frankish envoys from King Louis the German on one side and the missionary monk Ansgar on the other, while iron chains clink on the wrists of three freelance Viking captains who raided Frisia without royal leave.\n\nHorik fixes his cold, calculating gaze upon you as you step before the high-seat. “Every hot-headed sea-captain from Zealand thinks he can burn Dorestad or Paris and leave my border ramparts at the Danevirke to face the Frankish Emperor’s wrath,” the Danish King declares sharply. “In my realm, one king holds the Rudder and the Toll-Scales! Will you sail under my royal seal and enforce the peace of the Schlei, or join the lawless wolves I hang at the harbor mouth?”',
    choices: [
      {
        id: 'horik_swear_royal_coast_guard',
        label: 'Accept King Horik’s royal seal, patrol the Schlei and Eider frontier, and share the Hedeby tolls',
        tooltipHint: '+28 Standing with King Horik · +45 Silver · +7 Law & Diplomacy · +6 Stability',
        outcomeText:
          'King Horik stamps a lead royal bull bearing the Hedeby ship-mark and hands it to your steersman. Patrolling the Schlei approaches in his name, your crew collects forty-five silver pieces in customs share and wins the king’s high favor.',
        effects: {
          silver: 45,
          fame: 18,
          stability: 6,
          stats: { honor: 5, charisma: 4 },
          skills: { law: 7, diplomacy: 7 },
          addFlags: ['leg_enc_horik_01_done', 'horik_hedeby_warden'],
          legendStandingDelta: {
            legendId: 'king_horik_denmark',
            delta: 28,
            addOath: 'Held King Horik I’s royal coast-warden seal at the port of Hedeby',
            addOathFa: 'دریافت مهر شاهی هوریک یکم و نگهبانی از مرز و گمرک هدبی',
          },
        },
      },
      {
        id: 'horik_counsel_ansgar_bell',
        label: 'Advise Horik to grant Ansgar’s church a trading bell so Christian merchants flock to Hedeby',
        tooltipHint: '+22 Standing with King Horik · +40 Silver · +8 Trade · +5 Cunning',
        outcomeText:
          'Horik strokes his beard thoughtfully and nods: “Let the Saxon bell ring if it brings Dorestad’s silver into my harbor!” Trade volume at Hedeby surges, and your merchant chests overflow with Frankish coin.',
        effects: {
          silver: 40,
          fame: 15,
          stats: { cunning: 5 },
          skills: { trade: 8, diplomacy: 5 },
          addFlags: ['leg_enc_horik_01_done'],
          legendStandingDelta: {
            legendId: 'king_horik_denmark',
            delta: 22,
            addOath: 'Backed King Horik’s mercantile charter for the port of Hedeby',
            addOathFa: 'پشتیبانی از منشور بازرگانی شاه هوریک در بندر هدبی',
          },
        },
      },
      {
        id: 'horik_defy_free_sea_right',
        label: 'Declare before the benches that the open sea belongs to any captain with oak and iron, not to Hedeby’s king',
        tooltipHint: '-26 Standing with King Horik · +20 Fame · +7 Honor & Seamanship',
        outcomeText:
          'Murmurs of fierce approval rise from the young oarsmen along the walls — the same proud faction that follows Ragnar and Gudurm! Horik’s hand tightens on his staff as you stride unhindered back to your longship.',
        effects: {
          fame: 20,
          stats: { honor: 7, strength: 4 },
          skills: { seamanship: 6 },
          addFlags: ['leg_enc_horik_01_done', 'horik_free_captain_rival'],
          legendStandingDelta: {
            legendId: 'king_horik_denmark',
            delta: -26,
            addFeud: 'Defied King Horik I’s royal monopoly over western raids at the Hedeby assembly',
            addFeudFa: 'به چالش کشیدن انحصار شاه هوریک بر سفرهای جنگی غرب در تالار هدبی',
          },
        },
      },
    ],
  },

  // =========================================================================
  // 15. KING CHARLES THE SIMPLE — PHASE 3 SIGNATURE ENCOUNTER
  // =========================================================================
  {
    id: 'leg_enc_charles_01_frankia',
    title: 'Hall of Legends · The Carolingian Crown & the Northmen of the Seine',
    category: 'Historical Set-Piece',
    iconType: 'crown',
    provenance: 'Frankish Annals',
    isSemiLegendary: false,
    sagaVsChronicleNote:
      'DOCUMENTED: Richer of Reims, Flodoard, and Dudo of Saint-Quentin record Charles III “the Simple” (straightforward/honest, *Simplex*, r. 898–922) turning the Norse threat on the Seine into a permanent buffer duchy in 911 after the Battle of Chartres.',
    yearRange: [893, 923],
    ageMin: 15,
    regions: ['Continent', 'British Isles', 'Denmark'],
    blockedByFlags: ['leg_enc_charles_01_done'],
    weight: 19,
    text: 'In the vaulted stone aula of Compiègne north of Paris, young King Charles III of West Francia — whom Latin chroniclers call *Karolus Simplex*, meaning “the Straightforward” rather than foolish — sits beneath the faded eagle banner of his great-grandfather Charlemagne. Around his table, Frankish dukes and Robertian margraves argue bitterly over depleted royal treasuries while northern longships control every bend of the Lower Seine.\n\nDismissing his quarreling counts with a wave of his gloved hand, King Charles steps down from the dais to speak with your northern delegation through Archbishop Franco of Rouen. “My grandfathers paid out mountains of silver Danegeld at Paris only to buy a single winter’s breath,” Charles says candidly. “Silver vanishes, but fertile land turns a sea-wolf into a border-warden. Will you take royal fief-charters and guard the Frankish river-gates, or test the walls of Chartres?”',
    choices: [
      {
        id: 'charles_accept_river_fief',
        label: 'Swear fealty as a river-warden of West Francia in exchange for a fertile Seine estate and silver stipend',
        tooltipHint: '+28 Standing with Charles · +1 Farmstead · +45 Silver · +7 Diplomacy & Law',
        outcomeText:
          'King Charles seals a Latin parchment charter in red wax granting your house toll-rights and manor lands along the lower river in return for barring rival fleets. Both Frankish peasants and Norse oarsmen prosper under your shield.',
        effects: {
          silver: 45,
          landFarms: 1,
          fame: 20,
          stats: { honor: 6, charisma: 5 },
          skills: { diplomacy: 7, law: 7 },
          addFlags: ['leg_enc_charles_01_done', 'charles_frankish_fiefholder'],
          legendStandingDelta: {
            legendId: 'charles_the_simple',
            delta: 28,
            addOath: 'Sealed a royal river-warden fief charter with King Charles III at Compiègne',
            addOathFa: 'امضای منشور اقطاع مرزی و نگهبانی رود سن با شاه شارل ساده در کومپین',
          },
        },
      },
      {
        id: 'charles_negotiate_chartres_ransom',
        label: 'Broker a commercial truce between the northern camps and Charles’s royal mints at Reims and Rouen',
        tooltipHint: '+20 Standing with Charles · +55 Silver · +8 Trade',
        outcomeText:
          'You arrange for captured abbey estates to be redeemed in pure Carolingian deniers while opening the Seine wine-fairs to northern merchants. King Charles commends your straight dealing.',
        effects: {
          silver: 55,
          fame: 15,
          stats: { cunning: 5 },
          skills: { trade: 8, diplomacy: 5 },
          addFlags: ['leg_enc_charles_01_done'],
          legendStandingDelta: {
            legendId: 'charles_the_simple',
            delta: 20,
            addOath: 'Brokered the Seine commercial truce with King Charles the Simple’s chancellery',
            addOathFa: 'میانجی‌گری پیمان تجاری رود سن با دیوان شاه شارل ساده',
          },
        },
      },
      {
        id: 'charles_raid_royal_demesne',
        label: 'Reject the Carolingian parchment and ride with your raiders toward the vineyards of the Marne',
        tooltipHint: '-25 Standing with Charles · +50 Silver · +6 Combat',
        outcomeText:
          '“Parchment burns too easily when the north-wind blows!” you tell the Archbishop, leading your warband upriver to seize silver and horses from the royal demesne before Charles’s heavy cavalry can muster.',
        effects: {
          silver: 50,
          fame: 16,
          stats: { strength: 5, cunning: 4 },
          skills: { combat: 6 },
          addFlags: ['leg_enc_charles_01_done'],
          legendStandingDelta: {
            legendId: 'charles_the_simple',
            delta: -25,
            addFeud: 'Spurned King Charles III’s fief offer at Compiègne and raided the Marne valley',
            addFeudFa: 'رد منشور شاه شارل ساده در کومپین و غارت تاکستان‌های دره مارن',
          },
        },
      },
    ],
  },

  // =========================================================================
  // 16. COUNT ODO OF PARIS — PHASE 3 SIGNATURE ENCOUNTER
  // =========================================================================
  {
    id: 'leg_enc_odo_01_paris_towers',
    title: 'Hall of Legends · Count Odo’s Iron Defense at the Grand-Pont of Paris',
    category: 'Historical Set-Piece',
    iconType: 'sword',
    provenance: 'Frankish Annals',
    isSemiLegendary: false,
    sagaVsChronicleNote:
      'DOCUMENTED: Abbo of Saint-Germain-des-Prés’s eyewitness Latin poem Bella Parisiacae urbis (Wars of the City of Paris) chronicles Count Odo and Bishop Gozlin defending the Île de la Cité and its two fortified bridge-towers against Sigfred and Sinric’s 700 Viking ships in 885–886.',
    yearRange: [880, 898],
    ageMin: 15,
    regions: ['Continent', 'British Isles', 'Denmark'],
    blockedByFlags: ['leg_enc_odo_01_done'],
    weight: 21,
    text: 'Seven hundred northern keels choke the Seine so thickly that for two leagues the river water cannot be seen beneath oak strakes and painted shields. Yet blocking the passage upstream stands the Île de la Cité of Paris, its two low-slung timber bridges guarded by stone-and-oak gatehouse towers. Atop the smoking rampart of the Grand-Pont stands Count Odo of Paris, son of Robert the Strong, his mail-coat blackened with boiling pitch and oil as he hurls back wave after wave of Viking siege-engines.\n\nWhen a sudden flood carries away a span of the Petit-Pont, leaving twelve Frankish defenders trapped in the isolated southern tower, Count Odo rides out onto the northern gatehouse and sounds his horn for a parley or a test of arms. How does your ship-crew act before the iron walls of Paris?',
    choices: [
      {
        id: 'odo_assault_bridge_tower',
        label: 'Drive fireships against the wooden bridge-piers and cross blades with Count Odo’s sallying knights!',
        tooltipHint: '-28 Standing with Odo · +50 Silver · +8 Combat · +24 Fame',
        outcomeText:
          'Launching three pitch-blazing hulls against the bridge pilings, your hird clashes shield-to-shield with Count Odo’s mail-clad sortie on the riverbank! Though Odo’s tower holds until Emperor Charles the Fat arrives with 700 pounds of silver ransom, even the Frankish monks of Saint-Germain record your fierce assault in their Latin verse.',
        effects: {
          silver: 50,
          fame: 24,
          stats: { strength: 6, honor: 6 },
          skills: { combat: 8 },
          addFlags: ['leg_enc_odo_01_done', 'odo_paris_siege_veteran'],
          legendStandingDelta: {
            legendId: 'count_odo_paris',
            delta: -28,
            addFeud: 'Stormed Count Odo’s fortified bridge-tower during the Great Siege of Paris (885–886)',
            addFeudFa: 'یورش به برج پل مستحکم کنت اودو در محاصره بزرگ پاریس (۸۸۵–۸۸۶)',
          },
        },
      },
      {
        id: 'odo_honor_tower_twelve_parley',
        label: 'Salute Count Odo’s valor, grant honorable ransom terms to the bridge-guards, and portage past Paris to Burgundy',
        tooltipHint: '+26 Standing with Odo · +45 Silver · +7 Honor & Diplomacy',
        outcomeText:
          'Impressed that a northern captain honors courageous foes rather than slaughtering trapped guards, Count Odo exchanges a silver-hilted Frankish sword with you at the water-gate and permits your squadron to portage unmolested toward the rich valleys of the Yonne.',
        effects: {
          silver: 45,
          fame: 20,
          stats: { honor: 8, charisma: 5 },
          skills: { diplomacy: 7, seamanship: 5 },
          addFlags: ['leg_enc_odo_01_done', 'odo_chivalric_respect'],
          legendStandingDelta: {
            legendId: 'count_odo_paris',
            delta: 26,
            addOath: 'Exchanged honorable ransom oaths with Count Odo beneath the walls of Paris',
            addOathFa: 'مبادله پیمان جوانمردانه و فدیه با کنت اودو در پای دیوارهای پاریس',
          },
        },
      },
      {
        id: 'odo_enter_frankish_guard',
        label: 'Accept Count Odo’s secret gold stipend to intelligence-screen rival Viking fleets on the Lower Seine',
        tooltipHint: '+22 Standing with Odo · +60 Silver · +7 Cunning & Law',
        outcomeText:
          'When the nobles of West Francia elect Count Odo as their King in 888 for saving Paris, his royal treasury pays out sixty silver pieces to your hall for timely warnings along the river estuaries.',
        effects: {
          silver: 60,
          fame: 14,
          stats: { cunning: 7 },
          skills: { law: 5, trade: 6 },
          addFlags: ['leg_enc_odo_01_done'],
          legendStandingDelta: {
            legendId: 'count_odo_paris',
            delta: 22,
            addOath: 'Entered a river-watch pact with Count Odo, defender and King of West Francia',
            addOathFa: 'پیمان دیده‌بانی رود سن با کنت اودو، مدافع پاریس و پادشاه فرانک باختری',
          },
        },
      },
    ],
  },

  // =========================================================================
  // 17. HARALD FAIRHAIR (HARALDR HÁRFAGRI) — PHASE 3 SIGNATURE ENCOUNTER
  // =========================================================================
  {
    id: 'leg_enc_harald_01_hafrsfjord',
    title: 'Hall of Legends · The Uncut Locks of Harald & the Thunder of Hafrsfjord',
    category: 'Historical Set-Piece',
    iconType: 'crown',
    provenance: 'Heimskringla',
    isSemiLegendary: false,
    sagaVsChronicleNote:
      'DOCUMENTED: Contemporary skaldic verse (Þorbjörn hornklofi’s Haraldskvæði / Hrafnsmál) and Snorri’s Heimskringla recount King Harald Halfdansson’s vow never to cut or comb his hair until he ruled all Norway, culminating in the naval victory of Hafrsfjord (~872) and the combing of his hair by Earl Rognvald of Møre.',
    yearRange: [865, 928],
    ageMin: 15,
    regions: ['Norway', 'North Atlantic', 'British Isles', 'Denmark'],
    blockedByFlags: ['leg_enc_harald_01_done'],
    weight: 21,
    text: 'In the narrow coastal inlet of Hafrsfjord near Stavanger, the greatest war-fleet Norway has ever seen lashes its oak hulls together stem-to-stem. At the prow of his great dragon-ship stands King Harald Halfdansson — still called *Lúfa* (“Shock-Head”) because for ten winters of conquest he has neither cut nor combed his thick golden-brown hair, fulfilling his oath to proud Gyda Eiriksdottir that he would first become sole king over every fjord and upland in Norway.\n\nAcross the churning sound, the rebel kings of Agder, Telemark, and Hordaland — Kjotve the Rich and Haklang the Long-Chinned — beat their shields as Harald’s berserkers, the *úlfhéðnar* in wolf-coats, howl at the forecastle. Harald turns his piercing eyes toward your longship: “Today Norway has either one high-seat at Avaldsnes or thirty petty wolves! Do you lash your gunwale to my royal line and take an earldom’s revenue, or sail west over the sea with the stubborn bondi?”',
    choices: [
      {
        id: 'harald_lash_ship_hafrsfjord',
        label: 'Lash your longship to King Harald’s royal line at Hafrsfjord and witness Earl Rognvald comb the Fairhair’s locks',
        tooltipHint: '+30 Standing with Harald Fairhair · +50 Silver · +8 Combat & Law · +25 Fame',
        outcomeText:
          'Stones and iron javelins hail across the locked decks at Hafrsfjord until Haklang falls and Kjotve flees! Afterward at the feast of Møre, as Earl Rognvald shears and combs Harald’s ten-year mane and names him *Hárfagri* (Fairhair), the new King of Norway grants your house one-third of the local tribute-dues as his sworn lenderman.',
        effects: {
          silver: 50,
          fame: 25,
          stability: 6,
          stats: { strength: 5, honor: 7 },
          skills: { combat: 8, law: 6 },
          addFlags: ['leg_enc_harald_01_done', 'harald_fairhair_lenderman', 'anchor_hafrsfjord_872'],
          legendStandingDelta: {
            legendId: 'harald_fairhair',
            delta: 30,
            addOath: 'Fought in King Harald Fairhair’s locked fleet-line at the Battle of Hafrsfjord',
            addOathFa: 'نبرد در خط کشتی‌های به‌هم‌بسته شاه هارالد موبور در نبرد هافرسفیورد',
          },
        },
      },
      {
        id: 'harald_negotiate_skatt_autonomy',
        label: 'Offer fixed ship-levy (leidang) service so your fjord-hall keeps its ancestral odal laws under the Crown',
        tooltipHint: '+20 Standing with Harald Fairhair · +8 Diplomacy & Law · +8 Stability',
        outcomeText:
          'Assisted by his wise skald Guthorm Sindri, King Harald accepts your leidang ship-quota without sending royal bailiffs to trample your ancestral meadows. Your bondi hail your shrewd diplomacy.',
        effects: {
          stability: 8,
          fame: 18,
          stats: { charisma: 5, cunning: 5 },
          skills: { diplomacy: 8, law: 7 },
          addFlags: ['leg_enc_harald_01_done', 'anchor_hafrsfjord_872'],
          legendStandingDelta: {
            legendId: 'harald_fairhair',
            delta: 20,
            addOath: 'Sealed the Leidang ship-levy compact with King Harald Fairhair of Norway',
            addOathFa: 'بستن پیمان ناوگان لیدانگ و حفظ حقوق تالار با شاه هارالد موبور',
          },
        },
      },
      {
        id: 'harald_defy_tax_sail_west',
        label: 'Refuse to pay land-tax (skatt) like a thrall and steer your free keels toward the Western Isles and Iceland!',
        tooltipHint: '-28 Standing with Harald Fairhair · +24 Fame · +8 Seamanship & Honor',
        outcomeText:
          '“My ancestors took their land from the forest and the sea, not from a king’s tally-stick!” you shout across the water. Joining the great wave of proud Norwegian chieftains sailing for the Hebrides, Orkney, and Iceland, your name rings in every free hall across the North Atlantic.',
        effects: {
          fame: 24,
          stats: { honor: 8, wyrd: 5 },
          skills: { seamanship: 8 },
          addFlags: ['leg_enc_harald_01_done', 'harald_free_exile_pride', 'anchor_hafrsfjord_872'],
          legendStandingDelta: {
            legendId: 'harald_fairhair',
            delta: -28,
            addFeud: 'Refused King Harald Fairhair’s land-tax after Hafrsfjord to remain a free sea-lord',
            addFeudFa: 'سرپیچی از پرداخت خراج زمین به هارالد موبور پس از نبرد هافرسفیورد',
          },
        },
      },
    ],
  },

  // =========================================================================
  // 18. RURIK OF LADOGA (HRŒREKR OF HOLMGARD) — PHASE 3 SIGNATURE ENCOUNTER
  // =========================================================================
  {
    id: 'leg_enc_rurik_01_ladoga',
    title: 'Hall of Legends · The Invitation of the Rus: Rurik’s Citadel on the Volkhov',
    category: 'Historical Set-Piece',
    iconType: 'ship',
    provenance: 'Russian Primary Chronicle',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'DOCUMENTED / CONTESTED: The Russian Primary Chronicle (Tale of Bygone Years, 862) records the Chud, Slavs, Merians, and Krivichi inviting the Varangian Rus under Rurik and his brothers Sineus and Truvor: “Our land is great and rich, but there is no order in it; come to rule and reign over us.” Archaeological layers at Staraya Ladoga (Aldeigjuborg) and Rurikovo Gorodishche (Holmgard) confirm mid-9th-century Scandinavian fortifications.',
    yearRange: [855, 879],
    ageMin: 15,
    regions: ['Kievan Rus & Rivers', 'Baltic', 'Sweden'],
    blockedByFlags: ['leg_enc_rurik_01_done'],
    weight: 20,
    text: 'Where the swift grey waters of the Volkhov River flow toward Lake Ladoga stands the timber-and-limestone fortress of Aldeigjuborg. Inside the great hall, elders of the Ilmen Slavs, Finnic Chud, and Krivichi lay tribute-bundles of dark winter sable,squirrel pelts, and Abbasid silver dirhams before the Varangian prince Rurik (*Hrœrekr*) and his battle-scarred companions.\n\n“Our land is vast and abundant in honey, furs, and river-ways, yet our tribes bleed in endless feuds without impartial law,” the elder of Holmgard proclaims, repeating the famous words of the Primary Chronicle. Rurik rests his hand on his broad-hilted Swedish sword and turns to you: “I am moving my high-seat upriver to build the new citadel at Holmgard (Novgorod), while Askold and Dir press south down the Dnieper toward Kiev and Miklagard. Will you stand as one of my boyar-captains on the Volkhov?”',
    choices: [
      {
        id: 'rurik_build_holmgard_citadel',
        label: 'Raise the oak ramparts of Rurikovo Gorodishche (Holmgard) beside Prince Rurik and judge the river-tribes',
        tooltipHint: '+30 Standing with Rurik · +50 Silver · +7 Law & Combat · +6 Stability',
        outcomeText:
          'You oversee the timber battlements overlooking Lake Ilmen and sit beside Rurik as law-witness over the Slavic and Finnic elders. In gratitude, the founder of the Rus dynasty awards your house a lucrative share of the annual *poliudie* fur-circuit and fifty silver dirhams.',
        effects: {
          silver: 50,
          fame: 24,
          stability: 6,
          stats: { honor: 7, charisma: 5 },
          skills: { law: 7, combat: 6 },
          addFlags: ['leg_enc_rurik_01_done', 'rurik_holmgard_boyar', 'anchor_rurik_862_rus'],
          legendStandingDelta: {
            legendId: 'rurik_of_ladoga',
            delta: 30,
            addOath: 'Co-founded the Holmgard river-court alongside Prince Rurik of the Rus (862)',
            addOathFa: 'هم‌پیمانی با پرنس روریک در بنیان‌گذاری دژ و دیوان هولمگارد (نووگورود)',
          },
        },
      },
      {
        id: 'rurik_charter_volga_convoy',
        label: 'Secure Rurik’s Varangian seal to lead fur-and-amber convoys down the Volga and Dnieper silver road',
        tooltipHint: '+22 Standing with Rurik · +60 Silver · +8 Trade & Seamanship',
        outcomeText:
          'Bearing Prince Rurik’s notched silver token, your river-karves pass freely through the portages of Aldeigjuborg and Beloozero, returning laden with Caliphate dirhams, silk brocade, and Damascus steel.',
        effects: {
          silver: 60,
          fame: 18,
          stats: { cunning: 6 },
          skills: { trade: 8, seamanship: 7 },
          addFlags: ['leg_enc_rurik_01_done', 'anchor_rurik_862_rus'],
          legendStandingDelta: {
            legendId: 'rurik_of_ladoga',
            delta: 22,
            addOath: 'Opened the Austrvegr silver-convoy route under Prince Rurik’s seal at Ladoga',
            addOathFa: 'گشودن کاروان تجاری نقره و خز در شاهراه شرق با مهر پرنس روریک در لادوگا',
          },
        },
      },
      {
        id: 'rurik_back_askold_free_south',
        label: 'Break away from Rurik’s northern toll-gates to sail south as a free Varangian captain toward Kiev',
        tooltipHint: '-22 Standing with Rurik · +45 Silver · +7 Combat & Seamanship',
        outcomeText:
          'Rurik’s brow darkens as you refuse his oath of subordination and steer your hulls down the Dnieper rapids after Askold and Dir. You win rich southern plunder, though Holmgard’s river-guards mark you as an independent rival.',
        effects: {
          silver: 45,
          fame: 20,
          stats: { strength: 5, honor: 4 },
          skills: { combat: 7, seamanship: 6 },
          addFlags: ['leg_enc_rurik_01_done', 'anchor_rurik_862_rus'],
          legendStandingDelta: {
            legendId: 'rurik_of_ladoga',
            delta: -22,
            addFeud: 'Defied Prince Rurik’s authority at Holmgard to sail south as an independent Varangian lord',
            addFeudFa: 'سرپیچی از فرمان پرنس روریک در هولمگارد و حرکت مستقل به سوی جنوب و کیف',
          },
        },
      },
    ],
  },
];

export const LEGEND_ENCOUNTERS_PHASE_23_FA: Record<string, GameEventFa> = {
  // 1. ROLLO
  leg_enc_rollo_01_walker: {
    title: 'تالار افسانه‌ها · گونگو-هرولف (رولو) و حکم تبعید ویکن',
    text: 'در اسکله چوبی، جنگجویی با قامتی ستبر و غول‌آسا در حالی که افسار اسبچه‌ای شمالی را در دست دارد از لانگ‌شیپ پیاده می‌شود؛ چرا که هرگاه بر اسبی شمالی می‌نشیند، قوزک چکمه‌هایش بر بوته‌های خلنگ و سنگ‌های ساحل کشیده می‌شود. پاروزنان کهنه‌کار پیرامون بندر او را «گونگو-هرولف» (هرولفِ پیاده‌رو، فرزند یارل روگنوالد از موره) می‌خوانند؛ همان سرداری که وقایع‌نگاران فرانک در آن سوی کانال «رولو» نامیده‌اند.\n\nاو که پس از مصادره ساحلی گله‌ها (استراندهوگ) در ساحل ویکن از نروژ تبعید شده است، ساعد زخم‌خورده و نیرومندش را بر دسته تبر تکیه می‌دهد و خطوط کشیده بدنه کشتی تو را برانداز می‌کند: «پادشاهان شمال خراج‌گیران رام و چوپانان سرسپرده می‌خواهند، نه ناخدایان آزاد دریا! در پایین‌دست رود پرپیچ‌وخم سن، اسکله‌های سنگی و تاکستان‌های زرخیز روآن چشم به راه مردانی است که دهانه رود را بگیرند و هرگز رها نکنند. آیا دماغه کشتی تو با من به سوی جنوب می‌آید؟»',
    sagaVsChronicleNote:
      'مستند / مورد مناقشه: هایمس‌کرینگلا اثر اسنوری استورلوسون، رولو را همان گونگو-هرولفِ تبعیدی از نروژ می‌داند، در حالی که دودو سن‌کانتن خاستگاه او را دانمارک ثبت کرده است.',
    choices: {
      rollo_swear_seine_pact: {
        label: 'فشردن ساعد گونگو-هرولف و بستن پیمان هم‌رزمی برای فتح مصب رود سن',
        tooltipHint: '+۲۶ جایگاه نزد رولو · +۶ رزم و دریانوردی · گشودن فصل پیمان رود اپت',
        outcomeText:
          'پنجه‌ات در مچ آهنین هرولف قفل می‌شود. او با خنده‌ای که تخته‌های اسکله را می‌لرزاند می‌گوید: «نیکوست! بگذار شاهان شمال صخره‌های سردشان را نگه دارند؛ ما در کرانه رود سن، دوک‌نشینی از تاکستان‌ها و برج‌های سنگی خواهیم ساخت!»',
      },
      rollo_supply_provisions: {
        label: 'تجهیز ناوگان تبعیدی هرولف با گوشت نمک‌سود و پاروهای نو در ازای نقره فرانکی',
        tooltipHint: '+۱۸ جایگاه نزد رولو · +۳۵ نقره · +۵ تجارت و دیپلماسی',
        outcomeText:
          'بشکه‌های ماهی نمک‌سود و پاروهای زبان‌گنجشک را به عرشه کشتی فرماندهی هرولف می‌فرستی و او نیز کیسه‌ای سنگین از سکه‌های نقره کارولنژی را از صندوق خود به تو می‌پردازد.',
      },
      rollo_enforce_strandhogg_ban: {
        label: 'محکوم کردن غارت ساحلی او در ویکن و بستن بندر به روی کشتی‌هایش',
        tooltipHint: '-۲۴ جایگاه نزد رولو · +۸ قانون‌دانی · +۶ ثبات قلمرو',
        outcomeText:
          'هنگامی که نیزه‌دارانت بر اسکله صف می‌کشند، چهره هرولف چون سنگ خارا سخت می‌شود: «گرگی را که از آغل راندی به یاد بسپار!» و فرمان حرکت به سوی دریای آزاد را صادر می‌کند.',
      },
    },
  },

  leg_enc_rollo_02_epte: {
    title: 'تالار افسانه‌ها · بوسه بر پای شاه و منشور نورماندی در رود اپت',
    text: 'در کرانه سرسبز رود اپت، اسقف‌های فرانک با رداهای زردوزی‌شده و کلاه‌های تشریفاتی در برابر ناخدایان زره‌پوش گونگو-هرولف پشت میز مرزی از چوب بلوط ایستاده‌اند. شاه شارل ساده که از دهه‌ها محاصره و غارت رودخانه‌ای به ستوه آمده، پیشنهاد داده است که شهر حصاردار روآن و ایالت‌های ساحلی را برای همیشه به عنوان تیول موروثی به رولو واگذار کند، به شرط آن‌که او غسل تعمید بپذیرد، دهانه رود سن را در برابر دیگر وایکینگ‌ها نگهبانی کند — و به نشانه بیعت در برابر درباریان بر پای شاه بوسه زند.\n\nرولو در حالی که دست بر کمربند شمشیرش می‌فشارد به زبان نورس می‌غرد: «هرگز زانوی خود را در برابر کفش هیچ مردی خم نخواهم کرد و سر در برابر رکاب هیچ فرانکی فرود نمی‌آورم!» و در حالی که اسقف اعظم فرانکو و دربار فرانک نفس در سینه حبس کرده‌اند، به سوی تو و یارانش برمی‌گردد. در لحظه مهر شدن منشور نورماندی چه تدبیری می‌اندیشی؟',
    sagaVsChronicleNote:
      'مستند (DOCUMENTED): تواریخ دودو سن‌کانتن و فلودوارد رنس، پیمان سال ۹۱۱ در سن‌کلر-سور-اپت و ماجرای بلند کردن پای شاه شارل توسط یکی از جنگجویان نورس را ثبت کرده‌اند.',
    choices: {
      rollo_epte_stand_witness: {
        label: 'فرمان به یکی از جنگجویان بلندقد که بدون زانو زدن، چکمه شاه را تا شانه بالا بکشد و گواه منشور روآن شوی',
        tooltipHint: '+۳۲ جایگاه نزد رولو · دریافت میراث: طوق رولو (نگهبان رود سن) · +۴۵ نقره · +۲۵ شهرت',
        outcomeText:
          'جنگجوی نورس بدون آن‌که کمر خم کند، قوزک پای شاه شارل را چنان بالا می‌کشد که پادشاه فرانک در میان خنده رعدآسای وایکینگ‌ها به پشت در آغوش اسقف‌هایش می‌افتد! با این حال منشور با موم مهر می‌شود و رولو «طوق نقره و طلای نگهبان رود سن» (Hringr Göngu-Hrólfs) را به گردن تو می‌آویزد.',
      },
      rollo_epte_demand_bayeux: {
        label: 'فشار بر فرستادگان فرانک برای افزودن مراتع غربی بایو به منشور پیش از غلاف کردن شمشیرها',
        tooltipHint: '+۲۲ جایگاه نزد رولو · +۱ مزرعه · +۶ رزم و دیپلماسی',
        outcomeText:
          'با دیدن دیوار سپرهای تو در پشت سر رولو، اسقف اعظم روآن شاه شارل را متقاعد می‌کند که مراتع حاصلخیز ساحلی را نیز به منشور بیفزاید و رولو مزرعه‌ای آباد بر فراز کانال به خاندانت می‌بخشد.',
      },
      rollo_epte_scorn_baptism: {
        label: 'تمسخر ردای سپید تعمید رولو و حرکت به بالادست رود برای غارت مستقل',
        tooltipHint: '-۲۸ جایگاه نزد رولو · +۵۵ نقره · +۶ ایمان به آیین کهن',
        outcomeText:
          'با تمسخر می‌گویی که گونگو-هرولف باد آزاد اودین را با قلاده فرانکی تاخت زده است! در مسیر بازگشت صومعه‌ای ساحلی را غارت می‌کنی، اما نگهبانان جدید رولو در روآن بادبان تو را به عنوان دشمن نشان می‌کنند.',
      },
    },
  },

  // 2. IVAR THE BONELESS
  leg_enc_ivar_01_shield_council: {
    title: 'تالار افسانه‌ها · بر فراز سپر نمدار: نقشه جنگی ایوار در برابر یورک',
    text: 'چهار تن از نگهبانان کهنه‌کار، سپری پهن از چوب نمدار با لبه آهنین را در خیمه فرماندهی بر چهارپایه بلوط می‌گذارند. بر فراز آن «ایوار بی‌استخوان» — که سالنامه‌نویسان ایرلند او را «ایمار» و وقایع‌نگاران هراسان ساکسون «اینوئر» می‌خوانند — نشسته است؛ کمانی از چوب سرخدار بر زانو دارد و چشمان تیره‌اش چون باز شکاری در زمستان، تیز و بی‌مپک است.\n\nایوار با نوک استخوانی پیکان جنگی، نقشه دیوارهای نیمه‌ویران رومی یورک (ائوفورویک) را بر خاک نمناک میان ستون‌های خیمه می‌کشد و آرام می‌گوید: «ائلا و اسبرت تا دیروز دشمن خونی یکدیگر بودند، اما این بهار درفش‌های رقیبشان با هم به سوی ما لشکر می‌کشند تا ما را به رود اوز بریزند. وقتی دژکوب‌هایشان شکاف دیوار سنگی بیرونی را باز کند، نادان‌ها برای بستن شکاف هجوم می‌برند؛ اما من می‌گویم وانمود به عقب‌نشینی کنیم، بگذاریم به درون کوچه‌های تنگ و چوبی شهر سرازیر شوند و آنگاه آرواره پولادین را پشت سرشان ببندیم! پرچم تو هنگام فروریختن دیوار کجا می‌ایستد؟»',
    sagaVsChronicleNote:
      'مستند (DOCUMENTED): وقایع‌نامه آنگلو-ساکسون (۸۶۶–۸۶۷) و منظومه پسران راگنار، فرماندهی ایوار در تسخیر یورک و به تله انداختن سپاه شاه ائلا و اسبرت در درون دیوارهای شهر را روایت می‌کنند.',
    choices: {
      ivar_hold_inner_trap: {
        label: 'فرماندهی کمینگاه کوچه‌های درونی یورک دقیقاً مطابق نشانی که نوک پیکان ایوار کشیده است',
        tooltipHint: '+۲۸ جایگاه نزد ایوار · +۸ ذکاوت · +۷ مهارت رزم · گشودن فصل دامبارتون و دوبلین',
        outcomeText:
          'دیوار سپرهایت را پشت انبارهای چوبیِ درون شکاف دیوار پنهان می‌کنی. هنگامی که سپاه نورثامبریا به گمان پیروزی به درون شهر هجوم می‌آورد، غرش شیپور تو تله ایوار را می‌بندد و ستون دشمن را در هم می‌شکند!',
      },
      ivar_scout_humber_horses: {
        label: 'مصادره اسب‌های مراتع ایست آنگلیا و مرسیا تا ستون‌های ایوار از دیده‌بانان ساکسون پیشی بگیرند',
        tooltipHint: '+۲۰ جایگاه نزد ایوار · +۶ دریانوردی و تجارت · +۳۰ نقره',
        outcomeText:
          'پیش از سپیده‌دم، هشتاد اسب راهوار به اردوگاه می‌رسانی. ایوار از فراز سپر جنگی خود سر تکان می‌دهد: «سپاه پیاده یک دهکده را غارت می‌کند، اما سپاه سواره پادشاهی‌ها را سرنگون می‌سازد!»',
      },
      ivar_demand_open_field: {
        label: 'اعتراض به پنهان شدن در پس کوچه‌های سنگی و کشاندن جنگجویان خود به نبرد در دشت باز',
        tooltipHint: '-۲۲ جایگاه نزد ایوار · +۶ قدرت بدنی · -۶ سلامتی',
        outcomeText:
          'چشمان تیره ایوار باریک می‌شود: «اگر آوازه‌ها را بیش از پیروزی دوست داری، در گل‌ولای دشت خون بده!» یورش تو در دشت باز شهرتی خونین به همراه دارد، اما ایوار هرگز سرپیچی از نقشه‌اش را فراموش نمی‌کند.',
      },
    },
  },

  leg_enc_ivar_02_dumbarton_banner: {
    title: 'تالار افسانه‌ها · پرچم زاغ سیاه بر فراز صخره دامبارتون و دوبلین',
    text: 'بر فراز آب‌های خاکستری و سرد خور کلاید، صخره دوقلوی بازالتی «آلت کلوت» — دامبارتون راک — سر به آسمان کشیده است که بریتون‌های استراتکلاید آن را در برابر هر لشکری تسخیرناپذیر می‌پندارند. چهار ماه سخت است که ناوگان مشترک ایوار از دوبلین و یورک دهانه رود را در حلقه محاصره گرفته و بر فراز تختِ سپر او، پرچم زاغ سیاه (هرافنزمِرکی) بال‌های سیاهش را در تندباد نمک‌آلود گشوده است.\n\nهنگام غروب، ایوار تو را کنار تخت سپر خود فرا می‌خواند و با کمان سرخدارش به شکافی باریک و سایه‌گرفته در کمرکش صخره آتشفشانی اشاره می‌کند که آب شیرینِ آب‌انبار پنهان دژ از آن می‌جوشد: «گرسنگی کند است، اما تشنگی در سه روز کمر هر پادگانی را می‌شکند! امشب از آن دیواره سنگی بالا برو و رگِ آب شیرین را کور کن، تا پیش از طوفان‌های پاییز با دویست کشتی پر از طلای بریتانیا و غنیمت به دوبلین بازگردیم.»',
    sagaVsChronicleNote:
      'مستند (DOCUMENTED): سالنامه اولستر ایرلند (۸۷۰–۸۷۱) محاصره چهارماهه دژ صخره‌ای دامبارتون توسط ایمار (ایوار)، قطع منبع آب دژ و بازگشت پیروزمندانه با ۲۰۰ کشتی به دوبلین را ثبت کرده است.',
    choices: {
      ivar_crack_dumbarton_well: {
        label: 'صعود شبانه از شکاف صخره با کلنگ‌های آهنی و خشکاندن چشمه آب دژ دامبارتون',
        tooltipHint: '+۳۲ جایگاه نزد ایوار · دریافت میراث: پرچم زاغ سیاه (هرافنزمِرکی) · +۵۰ نقره · +۲۸ شهرت',
        outcomeText:
          'حفاران تو آویخته به طناب‌های چرمی بر فراز امواج، مجرای سنگ بازالت را می‌شکافند و آب‌انبار دامبارتون را خشک می‌کنند! سه روز بعد دژ تسلیم می‌شود و در تقسیم غنایم دوبلین، ایوار «پرچم زاغ سیاه» (هرافنزمِرکی) را به کشتی سرفرماندهی تو می‌سپارد.',
      },
      ivar_charter_irish_sea_trade: {
        label: 'سازماندهی کاروان ۲۰۰ کشتی غنیمت میان خور کلاید، یورک و بازار نقره دوبلین',
        tooltipHint: '+۲۴ جایگاه نزد ایوار · +۶۵ نقره · +۸ تجارت و دریانوردی',
        outcomeText:
          'کاروان دویست کشتی سنگین‌بار را بی‌آنکه حتی یک لنج در گرداب‌های کانال شمالی آسیب ببیند به خلیج دوبلین می‌رسانی و ایوار حق پهلوگیری بدون عوارض در بندر دیفلین را به بازرگانان تو می‌بخشد.',
      },
    },
  },

  // 3. BJÖRN IRONSIDE
  leg_enc_bjorn_01_gibraltar: {
    title: 'تالار افسانه‌ها · شصت‌ودو سردیس اژدها در تنگه جبل‌الطارق',
    text: 'کفِ گرم دریای جنوب بر شصت‌ودو سردیس اژدها می‌درخشد هنگامی که تنگه باریک و صخره‌ای جبل‌الطارق — ستون‌های باستانی هرکول — در میان تندبادهای گرم و خیزاب‌های نیلگون به سوی دریای پهناور مدیترانه گشوده می‌شود. در کنار سکان سنگین کشتی سرفرماندهی، «بیورن پهلوآهنین» فرزند راگنار با سینه‌ای ستبر و زره حلقه‌دار پولادین ایستاده و «هستین»، گرگ باران‌دیده و نیرنگ‌باز رود لوآر، در کنارش نقشه بنادر ساحلی اندلس و مغرب را بر پوست گوساله نشان می‌دهد.\n\nاز فراز دکل، دیده‌بانان فریاد می‌زنند که گالی‌های نگهبان امارت اموی قرطبه با بادبان‌های سه‌گوش و لوله‌های مفرغیِ آتش یونانی (نفت سوزان) در برابر دماغه الخثیراس صف‌آرایی کرده‌اند تا راه ورود وایکینگ‌ها به دریای روم را ببندند. بیورن مشت گره‌کرده خود را بر سپر پولادینش می‌کوبد و بانگ برمی‌آورد: «تا امروز هیچ کشتی شمالی دریای درخشان پسِ آن صخره سرکش را نشکافته است! آیا بادبان‌ها و لبه‌های بلوطی کشتی‌ها را با پوست خیس گاو بپوشانیم و قلب خط جنگی گالی‌های اموی را بشکنیم، یا با جریان عمیق شبانه از کنار ساحل کوهستانی ریفِ مراکش به درون مدیترانه بلغزیم؟»',
    sagaVsChronicleNote:
      'مستند (DOCUMENTED): سالنامه سن‌برتین، تاریخ ابن عذاری و وقایع‌نامه آلفونسوی سوم، سفر دریایی ۶۲ کشتی بیورن و هستین در سال‌های ۸۵۹ تا ۸۶۲ از تنگه جبل‌الطارق به سوی مراکش، رون و ایتالیا را ثبت کرده‌اند.',
    choices: {
      bjorn_ram_strait_vanguard: {
        label: 'کشیدن پوست‌های خیس گاو بر لبه کشتی و شکافتن صف گالی‌های اموی دوشادوش بیورن',
        tooltipHint: '+۲۸ جایگاه نزد بیورن · +۷ رزم و دریانوردی · +۴۰ نقره · گشودن فصل نیرنگ لونا',
        outcomeText:
          'کوزه‌های شعله‌ور نفت بی‌اثر از روی پوست‌های خیس به دریا می‌لغزند و دماغه کشتی تو پاروهای گالی سرفرماندهی دشمن را در هم می‌شکند! بیورن با شمشیر آخته به کشتی تو درود می‌فرستد و مدیترانه در برابر شصت‌ودو بادبان گشوده می‌شود.',
      },
      bjorn_navigate_nekor_current: {
        label: 'بهره‌گیری از جریان عمیق اقیانوس اطلس برای عبور شبانه و غافلگیر کردن بندر ثروتمند نکور',
        tooltipHint: '+۲۲ جایگاه نزد بیورن · +۵۰ نقره · +۸ دریانوردی',
        outcomeText:
          'با خواندن جریان آب در تنگه، ناوگان بیورن را با پاروهای نمدپیچ در دل شب به ساحل ریف مراکش می‌رسانی و انبار کشتی‌ها را از ابریشم و درهم‌های بندر نکور پر می‌سازی.',
      },
      bjorn_turn_back_with_silver: {
        label: 'مطالبه سهم خود از نقره‌های اشبیلیه و خودداری از خطر کردن در دریای ناشناخته جنوب',
        tooltipHint: '-۲۰ جایگاه نزد بیورن · +۳۰ نقره · بازگشت امن',
        outcomeText:
          'بیورن با قهقهه‌ای کیسه‌ای سکه نقره به عرشه‌ات می‌اندازد: «به تالارنشینان شمال بگو که دروازه جهان را به چشم دیدی و سکان کشتی‌ات را برگرداندی!»',
      },
    },
  },

  leg_enc_bjorn_02_luna_bier: {
    title: 'تالار افسانه‌ها · دروازه‌های مرمرین لونا و سپر پولادین بیورن',
    text: 'در برابر ناوگان نمک‌سود تو، باروها و برج‌های ناقوس مرمر سپید شهر «لونا» در ساحل لیگوریای ایتالیا چنان در آفتاب مدیترانه می‌درخشد که پاروزنان شگفت‌زده شمالی سوگند می‌خورند به دروازه‌های خودِ شهر رم رسیده‌اند! به جای تلف کردن جنگجویان کارآزموده بر سر نردبان‌های بلند محاصره، بیورن پهلوآهنین و هستین به اسقف شهر پیام فرستاده‌اند که سالارشان بر عرشه کشتی در بستر مرگ افتاده و تمنای غسل و دفن مسیحی در کلیسای جامع شهر را دارد؛ در حالی که شمشیرهای موج‌دار و آخته زیر ردای او درون تابوت چوبین چیده شده است.\n\nدر زیر سایبان کشتی فرماندهی، بیورن پیش از دراز کشیدن بر تابوت، شانه‌ات را می‌فشارد و با لبخندی گرگ‌وش زمزمه می‌کند: «سرِ تابوت مرا در میان دود عود کشیشان از دروازه مرمرین به درون شهر ببر؛ همین که اسقف کتاب لاتین خود را بر سینه‌ام بست، با زره از جا می‌جهیم و دروازه‌های شهر را می‌گشاییم!»',
    sagaVsChronicleNote:
      'مورد مناقشه (CONTESTED): مورخان نورمن (دودو سن‌کانتن و ویلیام ژومیژ) نیرنگ تابوت در شهر مرمرین لونا را ثبت کرده‌اند و حماسه هروارار سلطنت بعدی بیورن در اوپسالا را روایت می‌کند.',
    choices: {
      bjorn_carry_luna_bier: {
        label: 'حمل تابوت به درون کلیسای جامع لونا و گشودن دروازه شهر به روی ناوگان',
        tooltipHint: '+۳۲ جایگاه نزد بیورن · دریافت میراث: سپر پولادین بیورن پهلوآهنین · +۵۵ نقره · +۲۸ شهرت',
        outcomeText:
          'در میانه شبستان پر از بوی کندر، بیورن با زره درخشان از درون تابوت بیرون می‌جهد! حاملان تابوت دروازه شهر را از درون تسخیر می‌کنند و در سفر بازگشت به اوپسالا، بیورن «سپر پولادین پهلوآهنین» (Skjöldr Járnsíðu) را به تو هدیه می‌دهد.',
      },
      bjorn_munso_hall_feast: {
        label: 'نگهبانی از لنگرگاه ناوگان در بیرون بندر و اسکورت کشتی‌های گنجینه بیورن تا اوپسالا',
        tooltipHint: '+۲۴ جایگاه نزد بیورن · +۴۵ نقره · +۷ دریانوردی و دیپلماسی',
        outcomeText:
          'لنگرگاه لیگوریا را در برابر نیروهای ساحلی امن نگه می‌داری و کشتی‌های سنگین از غنیمت را از دل طوفان‌های اقیانوس اطلس به سوئد می‌رسانی؛ جایی که شاه بیورن در تالار سلطنتی مونسو نام تو را گرامی می‌دارد.',
      },
    },
  },

  // 4. HALFDAN RAGNARSSON
  leg_enc_halfdan_01_repton: {
    title: 'تالار افسانه‌ها · خندق رپتون و سکه‌های نقره شاه هالفدان',
    text: 'بر فراز بلندی‌های بادگیر مشرف به رود ترنت در «رپتون»، صدها پاروزن دانمارکی خندقی عمیق و D-شکل و پرچینی از الوار حفر می‌کنند و دیوارهای سنگی صومعه سلطنتی سنت ویستان را به دژِ دروازه برای پناه دادن به لانگ‌شیپ‌های خود در یخبندان زمستان تبدیل می‌سازند. هالفدان پسر راگنار با چکمه گل‌آلود کنار سندان صحرایی ایستاده که ضراب اسیر ساکسون بر روی آن سکه‌های نقره با نقش HEALFDENE REX («هالفدنه شاه») ضرب می‌کند.\n\nاو سکه‌ای گرم و تازه ضرب‌شده به سویت می‌اندازد که در نم‌نم باران پاییزی می‌درخشد: «برادرانم بیورن و هویتسرک عاشق کفِ دریاهای دوردستند و ایوار با شاهان چون مهره‌های شطرنج بازی می‌کند؛ اما من خاکی می‌خواهم که جوِ زمستانی برویاند و ایالت‌هایی که هر فصل درو نقره وزن‌شده بپردازند! به من یاری برسان تا این بارو را تمام کنیم و شاه بورگرد را از مرسیا بیرون برانیم، تا سپاه تو بهترین دره‌های شمال را برگزیند.»',
    sagaVsChronicleNote:
      'مستند (DOCUMENTED): وقایع‌نامه آنگلو-ساکسون (۸۷۱–۸۷۴)، سکه‌های نقره بازمانده از هالفدان در لندن، و کاوش‌های باستان‌شناسی اردوگاه زمستانی وایکینگ‌ها در رپتون.',
    choices: {
      halfdan_fortify_repton_camp: {
        label: 'رهبری یاران در برافراشتن باروی خاکی رپتون و لشکرکشی به سوی تالار شاه بورگرد در مرسیا',
        tooltipHint: '+۲۶ جایگاه نزد هالفدان · +۴۰ نقره · +۶ رزم و صنعتگری · گشودن فصل تقسیم زمین‌های نورثامبریا',
        outcomeText:
          'با تکیه بر دژ تسخیرناپذیر رپتون، ستون‌های مشترک شما مقاومت مرسیا را در هم می‌شکنند و شاه بورگرد را وادار به فرار به سوی رم می‌سازند. هالفدان نام تو را در صدر طومار تقسیم زمین‌های شمال می‌نویسد.',
      },
      halfdan_mint_tribute_silver: {
        label: 'نظارت بر ترازوی خراج مرسیا و قالب‌های ضرب سکه در ضرابخانه لندن و رپتون',
        tooltipHint: '+۲۰ جایگاه نزد هالفدان · +۵۰ نقره · +۶ تجارت و قانون‌دانی',
        outcomeText:
          'مطمئن می‌شوی که هر یک از بزرگان مرسیا وزن کامل نقره را تحویل می‌دهند و هالفدان به پاداش دقت نظر تو، صندوقچه‌ای از سکه‌های نو به تو می‌بخشد.',
      },
      halfdan_spurn_ditch_digging: {
        label: 'خودداری از بیل زدن در گل‌ولای همچون بردگان و حرکت برای غارت مستقل',
        tooltipHint: '-۲۲ جایگاه نزد هالفدان · +۲۵ نقره · +۴ قدرت بدنی',
        outcomeText:
          'چشمان هالفدان سرد می‌شود و بیل را در خاک فرو می‌کوبد: «جنگجویی که دیوار نسازد، در گوری کم‌عمق می‌خوابد!» و نام کشتی تو را از طومار زمین‌ها خط می‌زند.',
      },
    },
  },

  leg_enc_halfdan_02_ploughland: {
    title: 'تالار افسانه‌ها · تقسیم زمین‌های نورثامبریا با طناب و شمشیر',
    text: 'در دره‌ای سرسبز بیرون شهر یورویک (یورک)، هالفدان پسر راگنار نیزه‌ای آهنین را در خاک سیاه و حاصلخیز فرو می‌کوبد در حالی که قانون‌دانانش طناب قیراندود اندازه‌گیری زمین (*reip*) را برای مشخص کردن مرز تیول‌ها باز می‌کنند. پاروزنان کهنه‌کاری که ده زمستان سخت پیاپی پشت سر پسران راگنار پارو زده و خون داده‌اند، دسته به دسته به ترتیب خدمه کشتی‌ها پیش می‌آیند تا مزارع دائمی خود (*plógsland*) را در سراسر یورکشایر و نورثامبریا تحویل بگیرند.\n\nدر کنار سنگ مرزیِ کنده‌کاری‌شده، هالفدان «شاخ سوگند لیره» (جام براگارفول) را که لبالب از آبجوی تیره انگلیسی است بالا می‌برد و بر فراز دشت بانگ برمی‌آورد: «ما خون پدرمان راگنار را با پولاد و آتش ستاندیم؛ اکنون ریشه فرزندانمان را با گاوآهن سنگین و قانون سپاه در این خاک استوار می‌کنیم! آیا از شاخ سوگند می‌نوشی، ملکی دائمی در دانلا می‌پذیری و سوگند دفاع از مرزهای یورویک در برابر اسکات‌ها و ساکسون‌ها را یاد می‌کنی؟»',
    sagaVsChronicleNote:
      'مستند (DOCUMENTED): وقایع‌نامه آنگلو-ساکسون در سال ۸۷۶ میلادی ثبت کرده است: «در این سال هالفدنه سرزمین نورثامبریا را تقسیم کرد و دانمارکیان از آن پس به شخم زدن و کشت‌وکار پرداختند.»',
    choices: {
      halfdan_claim_yorkshire_ploughland: {
        label: 'نوشیدن از شاخ سوگند، دریافت ملک در نورثامبریا و پذیرفتن شاخ سوگند لیره از دست هالفدان',
        tooltipHint: '+۳۰ جایگاه نزد هالفدان · دریافت میراث: شاخ سوگند لیره · +۱ مزرعه · +۲۰ آذوقه',
        outcomeText:
          'جام شاخ گاو وحشی را سر می‌کشی و تیرک‌های مرزی خود را در دره حاصلخیز یورکشایر می‌کوبی. هالفدان به پاس خدماتت از رود هامبر تا تاین، «شاخ سوگند لیره» و مزرعه‌ای آباد را به خاندانت اهدا می‌کند.',
      },
      halfdan_join_strangford_fleet: {
        label: 'فروش سهم زمین خود در ازای نقره و داوطلب شدن برای همراهی با ناوگان هالفدان به سوی تاج دوبلین',
        tooltipHint: '+۲۴ جایگاه نزد هالفدان · +۵۰ نقره · +۷ رزم و دریانوردی',
        outcomeText:
          'هالفدان با قهقهه‌ای بر شانه‌ات می‌زند: «هنوز تشنه نمک دریایی!» طناب زمین را با صندوقی از نقره عوض می‌کنی و آماده عبور از دریای ایرلند به سوی استرنگفورد لاخ می‌شوی.',
      },
    },
  },

  // 5. UBBA RAGNARSSON
  leg_enc_ubba_01_frisian_wolf: {
    title: 'تالار افسانه‌ها · سالار فریزیان: گرگ‌پوشان بر گذرگاه مرداب',
    text: 'مه غلیظ و یخ‌زده‌ای از فراز مرداب‌های نیزار و آبگیرهای تاریک ایست آنگلیا برمی‌خیزد؛ جایی که تنها یک گذرگاه باریک از الوارهای چوبی خیس و لغزنده از میان باتلاق به سوی حصار و اردوگاه شاه ادموند در «تتفورد» راه می‌برد. در پیشاپیش دسته‌ای هولناک از جنگجویان خط‌شکن و اولف‌هدنار که پوستین‌های گرگ خاکستری بر روی زره حلقه‌دار خود انداخته‌اند، «اوبّا پسر راگنار» — که سالنامه‌نویسان لاتین او را *Dux Fresonum* (سالار جنگجویان فریزی) می‌خوانند — ایستاده و با کارد آیینی، رون‌های سرخ پیروزی (*sigrunar*) را بر دسته تبر جنگی دوسر خود می‌تراشد.\n\nاوبّا سر برمی‌آورد، لبه چوبی سپر خود را به دندان می‌گزد و چشمانش از شور وحشی نبرد می‌درخشد: «ایوار با چوب‌خط بر خاک خیمه نقشه می‌کشد و هالفدان گاوهای شخم و کیسه‌های جو را می‌شمارد؛ اما وقتی دیوار سپرهای ساکسون بر این بندِ باریک و مرگبار قفل شود، فقط پولاد سرخ و وحشت گرگ‌پوشانِ اودین است که خط دشمن را از هم می‌درد! آیا در نوک پیکانِ گوه هجومی دوشادوش من می‌تازی یا پشت نیزه‌داران می‌ایستی؟»',
    sagaVsChronicleNote:
      'مستند / مورد مناقشه: منابع قاره‌ای و انگلیسی (آبو فلوری، سالنامه سنت نئوتس و منظومه پسران راگنار) اوبّا را با عنوان سالار فریزیان و پهلوانی مسلط به افسون‌های رزم در فتح ایست آنگلیا (۸۶۹) توصیف کرده‌اند.',
    choices: {
      ubba_charge_fen_wedge: {
        label: 'گزیدن لبه سپر و یورش به گذرگاه تتفورد در آرایش گوه‌ای گرگ‌پوشان اوبّا',
        tooltipHint: '+۲۸ جایگاه نزد اوبّا · +۸ مهارت رزم · +۶ قدرت بدنی · گشودن فصل نبرد سینویت',
        outcomeText:
          'دوشادوش اوبّا، گوه هجومی شما با چنان خشمی به دیوار سپرهای ایست آنگلیا می‌کوبد که الوارهای گذرگاه زیر پای عقب‌نشینی آنان می‌شکند! اوبّا به نشانه برادری، رونِ تیر (خدای نبرد) را بر پیشانی‌ات نقش می‌زند.',
      },
      ubba_learn_galdr_runes: {
        label: 'هم‌خوانی سرودهای کهن رونیک (گالدر) با اوبّا پیش از به صدا درآمدن شیپورهای جنگ',
        tooltipHint: '+۲۲ جایگاه نزد اوبّا · +۷ آیین سیدر و سرنوشت · +۵ ایمان',
        outcomeText:
          'در کنار آتش شبانه در نیزارهای مرداب، اوبّا افسون‌های رزمی کهن فریزیا و دانمارک را به تو می‌آموزد که می‌گویند تیزی نیزه دشمن را کند و دل جنگجو را استوار می‌سازد.',
      },
      ubba_refuse_reckless_assault: {
        label: 'هشدار به اوبّا که یورش مستقیم در گذرگاهی باریک بدون پوشش جناحین دیوانگی است',
        tooltipHint: '-۲۰ جایگاه نزد اوبّا · +۵ ذکاوت',
        outcomeText:
          'اوبّا بر علف‌های مرداب تف می‌اندازد و می‌غرد: «پس چکمه‌های خشکت را پشت بنه لشکر نگه دار!» و کهنه‌سربازان فریزی خود را از کنار خط تو به پیش می‌راند.',
      },
    },
  },

  leg_enc_ubba_02_cynwit: {
    title: 'تالار افسانه‌ها · بیست‌وسه کشتی در پای صخره سینویت',
    text: 'در نم‌نم باران خاکستری و سرد آغاز بهار ۸۷۸ میلادی، بیست‌وسه لانگ‌شیپ جنگی در ساحل سنگلاخی دوون در پای تپه‌قلعه شیب‌دار و بادگیر «سینویت» با فرونشستن جزر دریا بر شن‌ها نشسته‌اند. در درون حصار سنگ‌چینِ بالای تپه، جنگجویان وسکس به فرماندهی «الدورمن اودا» پشت دیوارهای کهن سنگی سنگر گرفته‌اند، هرچند هیچ چشمه یا چاه آب شیرینی در درون دژ ندارند. اوبّا پسر راگنار با اطمینان کامل از این‌که تشنگی کشنده تا نیمروز فردا ساکسون‌ها را به زانو درآورده و ناچار به تسلیم بی‌قیدوشرط خواهد ساخت، نگهبانان اردوگاه را آسوده گذاشته است، در حالی که پرچم زاغ سیاه (هرافنزمِرکی) در مه غلیظ صبحگاهی بی‌حرکت و سنگین بر نیزه فرو افتاده است.\n\nاما هنگامی که در گرگ‌ومیش سحرگاه به باروی خاموش قلعه بر فراز شیب تند تپه می‌نگری، برقِ صدها سرنیزه و کلاهخود ساکسون را می‌بینی که بی‌صدا پشت دروازه شرقی برای شبیخونی مرگبار و ناگهانی گرد آمده‌اند تا پیش از بالا آمدن آب دریا، شما را از کشتی‌هایتان جدا سازند! در این لحظه سرنوشت‌ساز پیش از گشوده شدن دروازه سینویت چه فرمانی می‌دهی؟',
    sagaVsChronicleNote:
      'مستند (DOCUMENTED): کتاب زندگی شاه آلفرد نوشته اسقف آسر و وقایع‌نامه آنگلو-ساکسون (۸۷۸) فرود ۲۳ کشتی اوبّا در پای قلعه بی‌آب سینویت و شبیخون سحرگاهی الدورمن اودا را ثبت کرده‌اند.',
    choices: {
      ubba_sound_horn_save_cynwit: {
        label: 'دمیدن فوری در شیپور جنگ، بستن حلقه سپر دوگانه پیرامون اوبّا و دفع شبیخون ساکسون‌ها',
        tooltipHint: '+۳۴ جایگاه نزد اوبّا · دریافت میراث: کشتی اورمرین · ثبت انحراف تاریخی (نجات اوبّا)',
        outcomeText:
          'خروش شیپور تو ده تپش قلب پیش از سرازیر شدن سپاه اودا از تپه، اردوگاه را بیدار می‌کند! با قفل کردن سپرها پیرامون اوبّا، موج نخست یورش ساکسون‌ها را در هم می‌شکنی و عقب‌نشینی منظم به سوی کشتی‌ها را پوشش می‌دهی. اوبّا که جان و درفش خود را مدیون توست، کشتی سی‌پارویی خود «اورمرین» (مار دریای شمال) را به تو هدیه می‌دهد!',
        divergenceNote:
          'با هشدار به‌موقع درباره شبیخون سحرگاهی قلعه سینویت در سال ۸۷۸، اوبّا پسر راگنار دیوار سپرهایش را به موقع آراست و ناوگان خود را در ساحل دوون نجات داد.',
      },
      ubba_guard_ships_tide: {
        label: 'نگه داشتن خط ساحل و شناور ساختن بیست‌وسه کشتی هنگامی که نبرد بر سر تپه خونین می‌شود',
        tooltipHint: '+۲۲ جایگاه نزد اوبّا · دریافت میراث: کشتی اورمرین · +۴۰ نقره',
        outcomeText:
          'هنگامی که مردان الدورمن اودا در سپیده‌دم از قلعه سینویت بیرون می‌ریزند و اوبّا در صف نخست نبرد جان می‌بازد، نگهبانان منظم تو خط ساحل را حفظ می‌کنند، بازماندگان را نجات می‌دهند و کشتی تندرو اوبّا (اورمرین) را به قلمرو دانلا بازمی‌گردانند.',
      },
    },
  },

  // 6. HVITSERK RAGNARSSON
  leg_enc_hvitserk_01_portage: {
    title: 'تالار افسانه‌ها · پیراهن‌سپید در گذرگاه خشکیِ رودهای شرق',
    text: 'در گذرگاهی گل‌آلود و مه‌گرفته میان جنگل‌های انبوه توس و سرشاخه‌های رودخانه‌های شمالی «گاردریکی» (سرزمین روس)، هشتاد پاروزن نیرومند و عرق‌ریزان کشتی‌های سبک رودخانه‌ای را با طناب‌های کنفی بر روی کنده‌های چرب‌شده کاج می‌کشند، در حالی که دیده‌بانان کماندار پچنگ و جنگجویان قبیله‌های اسلاو از لابه‌لای سایه درختان، کاروان شما را زیر نظر دارند. در پیشاپیش طنابِ کشش، «هویتسرک پسر راگنار» شانه به طناب داده و پیراهن کتان سپیدِ معروف خود (*hvítserkr*) را بدون هیچ پوششی بر روی زره حلقه‌دارش پوشیده است تا هر کمانداری در دل جنگل تاریک، سینه او را آشکارا ببیند!\n\nاو با پشت دست عرق از پیشانی می‌زداید، قهقهه‌ای بی‌باکانه سر می‌دهد و طناب بافته‌ای را به سوی تو و یارانت می‌اندازد: «برادرم هالفدان در یورکشایر کرت‌های کلم و مرز مزارع را با طناب وجب می‌کند، اما اینجا در شاهراه رودهای خاور، زیر هر تنداب و در پسِ هر گذرگاه جنگلی، صندوقی از درهم‌های نقره خلافت و ابریشم بیزانس خوابیده است! آیا پیراهن سپید رزم می‌پوشی و دوشادوش من کشتی را بر خشکی می‌کشی، یا با احتیاط پشت پرچین چوبی اردوگاه می‌مانی؟»',
    sagaVsChronicleNote:
      'افسانه‌ای (LEGENDARY): منظومه پسران راگنار و تاریخ ساکسو گراماتیکوس لشکرکشی‌های هویتسرک در سرزمین‌های شرقی (گاردریکی و هلسپونت) پس از انتقام خون راگنار را روایت می‌کنند.',
    choices: {
      hvitserk_haul_and_ambush: {
        label: 'پوشیدن بالاپوش کتان سپید در کنار هویتسرک و زدن ضدکمین به دیده‌بانان جنگل',
        tooltipHint: '+۲۸ جایگاه نزد هویتسرک · +۷ مهارت رزم · +۴۰ نقره · گشودن فصل نبرد دشت‌های شرق',
        outcomeText:
          'کمین‌کنندگان جنگل را به سوی پیراهن‌های سپید خود می‌کشانید و ناگهان طناب‌ها را رها کرده، با سپر و شمشیر در میان درختان توس صف آنان را تارومار می‌کنید! شاهراه رودخانه به سوی جنوب گشوده می‌شود.',
      },
      hvitserk_trade_sable_dirhams: {
        label: 'برپایی دژ چوبی و بارانداز تجارت خز سمور و کهربا در گذرگاه رودخانه',
        tooltipHint: '+۲۰ جایگاه نزد هویتسرک · +۵۰ نقره · +۶ تجارت و صنعتگری',
        outcomeText:
          'برجکی چوبی در گذرگاه بنا می‌کنی که شکارچیان شمالی و بازرگانان خزر در آن پوست سمور را با کهربای بالتیک و درهم نقره سودا می‌کنند و آذوقه ناوگان هویتسرک را تأمین می‌سازند.',
      },
      hvitserk_mock_white_shirt: {
        label: 'طعنه زدن که پوشیدن پیراهن سفیدِ درخشان در جنگل پر از کمین، خودنماییِ ابلهانه است',
        tooltipHint: '-۲۰ جایگاه نزد هویتسرک · +۵ ذکاوت',
        outcomeText:
          'لبخند از لبان هویتسرک محو می‌شود: «پس مثل میش در پشم خاکستری پنهان شو!» و به تنهایی شانه زیر طناب کشتی می‌دهد.',
      },
    },
  },

  leg_enc_hvitserk_02_steppe_stand: {
    title: 'تالار افسانه‌ها · پولاد و آتش در دشت‌های خاور',
    text: 'بر فراز تپه‌ای سنگی و دودگرفته مشرف به تنداب‌های خروشان رود دنیپر در مرز دشت‌های پهناور خاور، دسته کوچک اما سرسخت جنگجویان «هویتسرک پسر راگنار» پس از سه روز نبرد بی‌امان، در حلقه محاصره هزاران کماندار سواره دشت‌های شرق افتاده است. ده‌ها تن از مهاجمان پیرامون سپر چاک‌خورده و زره خونین او بر علف‌های سوخته افتاده‌اند و فرستادگان خانِ دشت با پرچم صلح پیش آمده‌اند تا به پاس دلیری بی‌مانندش، در صورت تسلیم شمشیر جان او را ببخشند — یا اگر نپذیرد، هر مرگی را که پسر راگنار خود برگزیند روا دارند.\n\nهویتسرک با سه زخم پیکان در شانه و پهلو، قهقهه‌ای رعدآسا سر می‌دهد و با شمشیر پولادین و جوهرنمود خاوری خود به ارابه‌های هیزم خشک و سپرهای شکسته اشاره می‌کند: «پسر راگنار لُدبروک هرگز دست‌بسته در خیمه بیگانگان زانو نمی‌زند! اگر هیچ کشتی‌ای از یارانم برای شکستن این حلقه نرسد، از آنان پشته‌ای بلند از سرها و هیزمِ شعله‌ور خواهم خواست تا تالار والهالا دودِ پروازم را از کرانه دنیپر ببیند!» و در همین لحظه چشمانش به بادبان‌های تو می‌افتد که از پیچ رودخانه پدیدار شده‌اند.',
    sagaVsChronicleNote:
      'افسانه‌ای (LEGENDARY): در منظومه پسران راگنار، هویتسرک در محاصره سپاهی عظیم در شرق، مرگ بر پشته آتشینِ کشتگان را به اسارت ترجیح می‌دهد.',
    choices: {
      hvitserk_wedge_rescue: {
        label: 'به ساحل کوبیدن کشتی‌ها زیر باران تیر، شکافتن خط محاصره تپه و بردن هویتسرک به عرشه!',
        tooltipHint: '+۳۴ جایگاه نزد هویتسرک · دریافت میراث: شمشیر خاوری هویتسرک · ثبت انحراف تاریخی',
        outcomeText:
          'در حالی که کماندارانت بالای تپه را تیرباران می‌کنند، با آرایش گوه‌ای سپرها از شیب رودخانه بالا می‌زنی و پسر زخمی راگنار را پیش از بسته شدن حلقه سواران به عرشه کشتی فرماندهی می‌رسانی! هویتسرک با دندان‌های خون‌آلود می‌خندد و «شمشیر خاوری» جوهرنمود خود (Austr-Sax Hvítserks) را در دستانت می‌گذارد.',
        divergenceNote:
          'هویتسرک پسر راگنار با یورش ناوگان هم‌پیمان شمالی در کرانه رود دنیپر از حلقه محاصره و پشته آتش رهایی یافت و به مسیر رودهای شمال بازگشت.',
      },
      hvitserk_honor_last_stand: {
        label: 'دریافت شمشیر موروثی هویتسرک با قایق پیک و خواندن سوگ‌سرود حماسی او هم‌زمان با زبانه کشیدن آتش',
        tooltipHint: '+۲۶ جایگاه نزد هویتسرک · دریافت میراث: شمشیر خاوری هویتسرک · +۸ شاعری و شرافت',
        outcomeText:
          'هویتسرک که حاضر نیست حتی یک گام به عقب بردارد، شمشیر جوهرنمود خود را با قایقی کوچک نزد تو می‌فرستد تا به دست بیگانگان نیفتد و خود در میان شعله‌های خروشان بر فراز تپه جاودانه می‌شود. سرود اسکالدی تو نام او را در تمام تالارهای شمال طنین‌انداز می‌سازد.',
      },
    },
  },

  // 7. SIGURD SNAKE-IN-THE-EYE
  leg_enc_sigurd_01_ouroboros: {
    title: 'تالار افسانه‌ها · نقش مار در مردمک چشم و تیغ ولسونگ در راسکیله',
    text: 'در تالار ستون‌دار شاهی در راسکیله، نور مشعل‌های صمغی در چشم چپ شاه جوان، «سیگورد پسر راگنار»، می‌درخشد: پیرامون مردمک تیره‌اش حلقه‌ای روشن و انکارناپذیر به شکل مارِ دم‌به‌دهان (*Ormr-í-Auga*) دیده می‌شود؛ همان نشانی که مادر پیشگویش ملکه اسلاگ پیش از تولد او، به یاد خون اژدهای نیایش سیگورد فافنیرکش پیشگویی کرده بود.\n\nبر روی زانوانش تیغ موج‌دار ولسونگ با قبضه زرکوب بر روی شنل پشمی رنگینش می‌درخشد. سیگورد در حالی که ناخدایان جزایر را از نظر می‌گذراند، با صدایی سنجیده، سرد و شاهانه می‌گوید: «برادرانم ایوار و هالفدان ایالت‌های انگلستان را میان خود تقسیم کرده‌اند و بیورن در میان پشته‌های سلطنتی اوپسالا بر تخت نشسته است؛ اما اینجا در تنگه باریک میان شیلند و اسکانیا، کلیدِ آهنین تمامی تجارت دریای بالتیک و دریای شمال در دست ماست. آیا دماغه کشتی‌هایت را با نگهبانان تنگه راسکیله هم‌پیمان می‌کنی، یا بی‌مهر شاهانه من بادبان می‌کشی؟»',
    sagaVsChronicleNote:
      'مورد مناقشه (CONTESTED): منظومه پسران راگنار میراث سیگورد مار-در-چشم در شیلند و اسکانیا را روایت می‌کند و سالنامه فولدا (۸۷۳ میلادی) از پادشاهی «سیگیفرید» بر دانمارک یاد کرده است.',
    choices: {
      sigurd_swear_sound_guard: {
        label: 'هم‌پیمان کردن کشتی‌های خود با سیگورد مار-در-چشم برای نگهبانی از تنگه‌های دانمارک',
        tooltipHint: '+۲۸ جایگاه نزد سیگورد · +۶ رزم و قانون‌دانی · +۳۵ نقره · گشودن فصل پیمان رود آیدر',
        outcomeText:
          'سیگورد برمی‌خیزد و پهنای تیغ ولسونگ را بر شانه‌ات می‌گذارد. ناوگان مشترک شما دزدان دریایی وند و ساکسون را از تنگه اورسوند می‌راند و عوارض پرسود شاهراه شیلند را تضمین می‌کند.',
      },
      sigurd_recite_volsung_lay: {
        label: 'خواندن سرود کهن نیایش «سیگورد اژدهاکش» در برابر بزرگان دربار شیلند',
        tooltipHint: '+۲۴ جایگاه نزد سیگورد · +۸ شاعری · +۶ کاریزما',
        outcomeText:
          'هنگامی که ابیات تو شکافته شدن قلب اژدهای فافنیر با شمشیر گرام را روایت می‌کند، حلقه مار در چشم شاه سیگورد در نور آتشدان می‌درخشد و او با احترام تو را در کنار تخت شاهی خود می‌نشاند.',
      },
      sigurd_run_sound_without_toll: {
        label: 'عبور دادن شبانه کشتی‌های تجاری خود از تنگه بدون پرداخت عوارض شاهی راسکیله',
        tooltipHint: '-۲۲ جایگاه نزد سیگورد · +۴۵ نقره · +۵ دریانوردی',
        outcomeText:
          'با باری پر از نقره و خز از کنار آتش دیده‌بانان شیلند می‌لغزی و می‌گذری، هرچند نگهبانان ساحلی شاه سیگورد نشان بادبان تو را بر چوب‌خط‌های خود ثبت می‌کنند.',
      },
    },
  },

  leg_enc_sigurd_02_eider_peace: {
    title: 'تالار افسانه‌ها · سوگند بر شمشیر در مرز رود آیدر',
    text: 'در کنار دیوار دفاعی بزرگ «دانویرکه» بر کرانه نیزارپوش رود آیدر، شاه سیگورد مار-در-چشم با مرزبانان زره‌پوش و کنت‌های فرستاده «لوئی ژرمن» (پادشاه فرانک خاوری) دیدار می‌کند. همان‌گونه که در سالنامه فرانکی فولدا برای سال ۸۷۳ میلادی ثبت شده است، فرستادگان سلطنتی دانمارک به رسم دیرین شمال شمشیرهای موج‌دار خود را از نیام می‌کشند تا بر پولاد برهنه سوگند صلح یاد کنند — که هیچ‌یک از دو سو از رود آیدر برای غارت نگذرد و بازرگانان آزادانه میان هدبی و ساکسونی رفت‌وآمد کنند.\n\nدر حالی که باد درفش‌های شاهی را بر فراز پل مرزی به اهتزاز درآورده است، سیگورد تیغ موروثی ولسونگ («نیش فافنیر») را در دست می‌گیرد و رو به تو می‌کند: «پیمانی که پشت آن پولاد نباشد، تنها مرکب بر پوست گوسفند است! بر این پل مرزی به عنوان گواه شمشیر من بایست و با دیوار سپرهایت پشتوانه سوگند ما باش، تا تیغ موروثی خاندان ولسونگ نگهبان دودمان تو باشد.»',
    sagaVsChronicleNote:
      'مستند (DOCUMENTED): سالنامه فولدا در سال ۸۷۳ میلادی ثبت کرده که شاه سیگیفرید (سیگورد) فرستادگانی نزد لوئی ژرمن فرستاد تا بر شمشیرهای خود برای صلح مرزی و آزادی تجارت در رود آیدر سوگند یاد کنند.',
    choices: {
      sigurd_swear_eider_weapon_oath: {
        label: 'گذاشتن دست بر قبضه تیغ ولسونگ و مهر کردن پیمان تجاری رود آیدر در کنار سیگورد',
        tooltipHint: '+۳۲ جایگاه نزد سیگورد · دریافت میراث: تیغ نیش فافنیر · +۵۰ نقره · +۸ دیپلماسی',
        outcomeText:
          'سوگند پولادین مرز را به هر دو زبان نورس و فرانکی در برابر دو سپاه یاد می‌کنی. کاروان‌های جام‌های شیشه‌ای راین و خزهای بالتیک به سوی هدبی روان می‌شوند و شاه سیگورد تیغ موروثی «نیش فافنیر» (Fáfnisbani Shard) را به خاندان تو اهدا می‌کند!',
      },
      sigurd_fortify_danevirke_gate: {
        label: 'تقویت پرچین‌های چوبی دیوار دانویرکه در پشت میز مذاکره تا فرانک‌ها حساب کار را بدانند',
        tooltipHint: '+۲۴ جایگاه نزد سیگورد · +۸ ثبات قلمرو · +۶ رزم و قانون‌دانی',
        outcomeText:
          'مرزبانان فرانک خاوری با دیدن دیوار سپرهای منظم تو بر فراز باروی نوسازی‌شده دانویرکه، تمامی بندهای پیمان را بی‌چون‌وچرا می‌پذیرند و سیگورد بیداری تو را در سراسر دانمارک می‌ستاید.',
      },
    },
  },

  // 8. QUEEN ASLAUG (KRÁKA)
  leg_enc_aslaug_01_harp_loom: {
    title: 'تالار افسانه‌ها · چنگ چوبیِ تهی و ابریشم بی‌درز ملکه اسلاگ (کراکا)',
    text: 'در حجره آرام بر فراز تالار بزم راسکیله، چنگ چوبی بزرگ و کهنه‌ای تکیه داده شده است — به اندازه کافی بزرگ که پدرخوانده‌اش «هایمیر» پس از سوختن تالار برونهیلد، کودکی سه‌ساله را در دل آن پنهان کرد و به نروژ برد. در کنار آن، «ملکه اسلاگ» که نروژیان روزگاری او را «کراکا» می‌خواندند نشسته است؛ گیسوان سرخش با نخ زرین بافته شده و انگشتانش بدون کارگاه بافندگی و سوزن، ابریشم خاکستری را به صورت جامه‌ای بی‌درز گره می‌زند.\n\nاو چشمان پیشگوی خود را به تو می‌دوزد: «مردان گمان می‌کنند زره آهنی جان جنگجو را حفظ می‌کند؛ اما سرنوشت (ویرد) پیش از کوبیده شدن نخستین سرنیزه بر سندان رشته شده است. با همان فراستی که روزی به کشتی راگنار بردم به من پاسخ بده: کدام ارمغان است که نه با نقره خریده می‌شود و نه با شمشیر ربوده، اما پس از فرو ریختن پشته آرامگاه هر پادشاهی زنده می‌ماند؟»',
    sagaVsChronicleNote:
      'افسانه‌ای (LEGENDARY): بر پایه حماسه ولسونگ و حماسه راگنار لُدبروک که پنهان شدن اسلاگ در چنگ هایمیر، حل معمای راگنار و بافتن پیراهن جادویی بی‌درز را روایت می‌کنند.',
    choices: {
      aslaug_answer_ordstirr_riddle: {
        label: 'پاسخ خردمندانه: «اوردستیر — نیک‌نامی و آوازه کردار شرافتمندانه که هرگز نمی‌میرد» (هاوامال)',
        tooltipHint: '+۳۰ جایگاه نزد اسلاگ · دریافت میراث: پیراهن بی‌درز اسلاگ · +۸ سرنوشت و سیدر',
        outcomeText:
          'لبخندی آرام و روشن بر لبان ملکه پیشگو می‌نشیند: «تو پندِ اودین در هاوامال را نیک می‌دانی!» او جامه ابریشمین خاکستری را برمی‌دارد و «پیراهن بی‌درز اسلاگ» (Skyrta Áslaugar) را به تو می‌بخشد تا در روز کارزار، تیغ پولادین بر تنت کارگر نباشد.',
      },
      aslaug_honor_spangereid_memory: {
        label: 'پیمان بستن برای مجازات هر غارتگری که به یاد پدرخوانده او «هایمیر» در نروژ بی‌حرمتی کند',
        tooltipHint: '+۲۴ جایگاه نزد اسلاگ · +۶ شرافت و قانون‌دانی · +۱۸ شهرت',
        outcomeText:
          'انگشتان اسلاگ صفحه چوبی و زخم‌خورده چنگ بزرگ را لمس می‌کند: «سال‌هاست تلخی اسپانگِراید را در سینه دارم؛ بادا که نورن‌ها رشته‌ای استوار برای تالار تو بتابند.»',
      },
      aslaug_scoff_peasant_crow: {
        label: 'زمزمه مغرورانه که ملکه‌ای که در دوده کلبه با نام «کراکا» (کلاغ) بزرگ شده، نباید از رزم و سرنوشت بگوید',
        tooltipHint: '-۲۶ جایگاه نزد اسلاگ · -۶ سرنوشت (نفرین ولوا)',
        outcomeText:
          'شعله آتشدان در برابر نگاه سرد اسلاگ به رنگ خاکستر کبود درمی‌آید: «حتی کلاغ نیز می‌داند کدام درخت بلوط در تندباد بعدی از ریشه خواهد افتاد!»',
      },
    },
  },

  leg_enc_aslaug_02_randalin_tears: {
    title: 'تالار افسانه‌ها · اشک‌های تگرگ‌گون ملکه راندالین (اسلاگ)',
    text: 'در تالار بزرگ و دودگرفته شیلند، پسران راگنار بر سر تخته‌های نرد (هنفاتافل) و جام‌های آبجو نشسته‌اند و درباره تندبادهای پاییزی و خطرات عبور از دریای شمال به سوی نورثامبریا درنگ می‌کنند. ناگهان درهای سنگین تالار گشوده می‌شود: ملکه اسلاگ با زرهی حلقه‌دار و صیقلی بر روی پیراهن سرخ شاهانه و کلاهخود والکیری بر گیسوان بافته‌اش به میانه آتشدان‌ها گام می‌نهد و نام جنگی «راندالین» (الهه سپر) را بر خود می‌گذارد!\n\nقطرات اشک خشمگین او هر کجا بر میز بلوط می‌چکد، در برابر چشمان بهت‌زده ناخدایان چون دانه‌های تگرگِ سرخ و سخت صدا می‌دهد. او با سرودی اسکالدی و کوبنده فریاد می‌زند: «اگر پسرانم پیش از راگنار در انگلستان کشته شده بودند، او شش ماه پای تخته بازی برای به آب انداختن کشتی‌هایش درنگ نمی‌کرد! اگر مردان قانون هفند (خون‌خواهی) را فراموش کرده‌اند، خودم پیشاپیش ناوگان بادبان می‌کشم!» و نگاه آتشینش را به نیمکت تو می‌دوزد: «چه کسی در این تالار دکل کشتی خود را همراه ملکه راندالین برمی‌افرازد؟»',
    sagaVsChronicleNote:
      'افسانه‌ای (LEGENDARY): در حماسه راگنار لُدبروک، هنگامی که پسران راگنار در آغاز تردید می‌کنند، اسلاگ نام رزمی «راندالین» برمی‌گزیند، اشک‌هایی چون تگرگ خونین می‌ریزد و خود همراه سپاه حرکت می‌کند.',
    choices: {
      aslaug_stand_with_randalin: {
        label: 'کوبیدن شمشیر بر سپر و هم‌قسم شدن با طلایه‌داران ملکه راندالین',
        tooltipHint: '+۳۲ جایگاه نزد اسلاگ · +۸ شرافت و سرنوشت · +۷ مهارت رزم · +۲۵ شهرت',
        outcomeText:
          'خروش سپر و شمشیر تو در سقف تالار می‌پیچد و هر ناخدای مرددی را شرمگین بر پا می‌جهاند! ملکه راندالین جام خود را در پیاله تو می‌ریزد و نیایش محافظت ولوا را بر بادبان‌های ناوگان تو می‌خواند.',
      },
      aslaug_weave_banner_protection: {
        label: 'اسکورت کشتی فرماندهی ملکه راندالین در گذر از دریا با پاروزنان کهنه‌کار خود',
        tooltipHint: '+۲۴ جایگاه نزد اسلاگ · +۶ دریانوردی و سیدر · +۳۵ نقره',
        outcomeText:
          'بهترین لانگ‌شیپ خود را در کنار کشتی سلطنتی ملکه راندالین قرار می‌دهی و در طول حرکت ناوگان بزرگ به سوی غرب، پاسدار ملکه پیشگو می‌شوی.',
      },
    },
  },

  // 9. KING ECGBERHT OF WESSEX
  leg_enc_ecbert_01_winchester_court: {
    title: 'تالار افسانه‌ها · شاگرد شارلمانی بر تخت شاهی وینچستر (شاه اکبرت)',
    text: 'در تالار سنگی وینچستر، «شاه اکبرتِ» سپیدریش زیر سایبانی به سبک کارولنژی نشسته است، در حالی که نجیب‌زادگان ساکسون با دیدن شنل دریایی شمالی تو دست بر قبضه کاردهای خود می‌برند. اکبرت که سیزده زمستان از جوانی خود را در دربار امپراتور شارلمانی گذرانده و سپس هژمونی مرسیا را در الاندون شکسته است، مترجم را مرخص می‌کند و با زبان تجاری فرانکی مستقیم با تو سخن می‌گوید:\n\nپادشاه سالخورده (برتوالدا) انگشتری زرین خود را بر دسته کرسی می‌زند: «من دیده‌ام که مردان شمال در فریزیا چگونه می‌جنگند و چگونه امپراتوران با خریدن صلح، پای ده کشتی دیگر را به سواحل خود باز می‌کنند! بی‌پرده بگو ای ناخدا: دماغه کشتی‌هایت را برای تجارت پوست و کهربا به ساحل وسکس آورده‌ای، یا برای آزمودن تیغ سپاه ایالت‌های من؟»',
    sagaVsChronicleNote:
      'مستند (DOCUMENTED): وقایع‌نامه آنگلو-ساکسون سیزده سال تبعید اکبرت در دربار شارلمانی، سلطنت او بر وسکس (۸۰۲–۸۳۹) و کسب عنوان «برتوالدا» پس از پیروزی الاندون را ثبت کرده است.',
    choices: {
      ecbert_seal_winchester_charter: {
        label: 'بستن پیمان تجارت ساحلی و هشدار متقابل با برتوالدا و دریافت انگشتری کارولنژی او',
        tooltipHint: '+۳۰ جایگاه نزد شاه اکبرت · دریافت میراث: انگشتری برتوالدای اکبرت · +۴۵ نقره · +۷ دیپلماسی',
        outcomeText:
          'شاه اکبرت که از کاردانی سیاسی تو به وجد آمده، «انگشتری و نشان برتوالدا» (Konungshringr Egberhts) را از انگشت بیرون می‌آورد و امان‌نامه سلطنتی برای بازرگانان تو در سراسر کنت، ساسکس و وسکس مهر می‌کند.',
      },
      ecbert_debate_carolingian_warfare: {
        label: 'گفت‌وگو با پادشاه کهنه‌کار درباره آرایش سواره‌نظام فرانکی در برابر دیوار سپرهای نورس',
        tooltipHint: '+۲۰ جایگاه نزد شاه اکبرت · +۶ رزم و قانون‌دانی · +۲۵ نقره',
        outcomeText:
          'دو ساعت تمام بر سر باده ادویه‌دار فرانکی، اکبرت دانش تو را درباره دژهای رودخانه‌ای و آرایش گوه‌ای می‌آزماید و به نشانه احترام، خنجری نقره‌کوب به سکان‌دارت هدیه می‌دهد.',
      },
      ecbert_raid_dorset_coast: {
        label: 'برهم زدن مذاکره و غارت املاک سلطنتی دورست در مسیر خروج از کانال مانش',
        tooltipHint: '-۲۸ جایگاه نزد شاه اکبرت · +۵۰ نقره · +۵ مهارت رزم',
        outcomeText:
          'پیش از سپیده‌دم لنگر می‌کشی و دام و نقره یکی از املاک سلطنتی وسکس را به غنیمت می‌بری؛ کاری که دشمنی آهنین شاه اکبرت را در سواحل جنوب برمی‌انگیزد.',
      },
    },
  },

  leg_enc_ecbert_02_hingston_down: {
    title: 'تالار افسانه‌ها · دیوار سپرهای برتوالدا در نبرد هینگستون داون',
    text: 'بر فراز خط‌الرأس خارای بادگیر «هینگستون داون» مشرف به رود تامار در کورنوال، سپاه متحدی از دریانوردان دانمارکی و بریتون‌های کورنوال در آرایش‌های گوه‌ای در برابر لشکر گردآمده وسکس صف آراسته‌اند. شاه اکبرت با وجود شصت‌وهفت سال سن، با زره فلس‌دار کارولنژی در زیر درفش اژدهای زرین وسکس استوار در طول دیوار سپرهای قفل‌شده‌اش اسب می‌تازد و با همان انضباط آهنینی که در رکاب شارلمانی آموخته بود، اشراف خود را فرماندهی می‌کند.\n\nهم‌زمان با برخاستن مه از دهانه رود تامار که لانگ‌شیپ‌های تو در آن لنگر انداخته‌اند، سوارانی تندرو از هر دو لشکر به ساحل شنی می‌تازند: سرداران دانمارکی و کورنوالی از تو می‌خواهند نیرو پیاده کنی و به جناح بازِ رودخانه اکبرت بزنی، و جارچی برتوالدای پیر چهل پوند نقره خالص وینچستر پیشنهاد می‌دهد اگر گذرگاه رود تامار را تا غروب آفتاب بی‌طرف نگه داری!',
    sagaVsChronicleNote:
      'مستند (DOCUMENTED): وقایع‌نامه آنگلو-ساکسون در سال ۸۳۸ میلادی اتحاد ناوگان دانمارکی با مردم کورنوال و شکست آنان از شاه اکبرت در هینگستون داون را ثبت کرده است.',
    choices: {
      ecbert_honor_tamar_truce: {
        label: 'حفظ بی‌طرفی گذرگاه رود تامار به سود شاه اکبرت و دریافت نقره سلطنتی برتوالدا',
        tooltipHint: '+۲۸ جایگاه نزد شاه اکبرت · +۵۵ نقره · +۷ دیپلماسی و شرافت',
        outcomeText:
          'شاه اکبرتِ سالخورده با خیال آسوده از جناح رودخانه، خط اتحاد کورنوال و دانمارکی‌ها را بر فراز هینگستون داون در هم می‌شکند و پیش از بازگشت پیروزمندانه به وینچستر، چهل پوند نقره خالص به ناوگان تو می‌پردازد.',
      },
      ecbert_clash_with_bretwalda: {
        label: 'قفل کردن سپرها با سپاه دانمارکی-کورنوالی و آزمودن لشکر کهنه‌کار شاه اکبرت در نبرد رودررو!',
        tooltipHint: '-۳۰ جایگاه نزد شاه اکبرت · +۲۶ شهرت · +۸ مهارت رزم · ثبت انحراف تاریخی',
        outcomeText:
          'سپاه کهنه‌کار تو قلب خط‌الرأس تپه را در برابر یورش نجیب‌زادگان اکبرت نگه می‌دارد! هرچند جناح کورنوال می‌لرزد، دیوار سپرهای تو تا تاریکی شب بلندی را حفظ می‌کند و برتوالدای پیر را ناچار به پذیرش گذر امن و پرداخت غرامت در رود تامار می‌سازد.',
        divergenceNote:
          'با پشتیبانی یک سپاه منظم نورس در نبرد هینگستون داون (۸۳۸ میلادی)، ائتلاف شمالی بلندی‌های تپه را در برابر لشکر وسکس و شاه اکبرت حفظ کرد.',
      },
    },
  },

  // 10. KING ÆLLA OF NORTHUMBRIA
  leg_enc_aella_01_eoforwic_usurper: {
    title: 'تالار افسانه‌ها · برج دیده‌بانی شاه ائلا در شهر یورک (ائوفورویک)',
    text: 'در درون برج چندضلعی و باستانی رومی در شهر یورک (ائوفورویک)، «شاه ائلا» با گام‌هایی ناآرام در برابر آتشدان زغالی قدم می‌زند و سنجاق زرکوب و گران‌بهایی با نقش گراز نورثامبریا و سنگ‌های گارنت سرخ بر شنل پشمی خود بسته است. او که در سال ۸۶۲ میلادی شاه قانونی، اسبرت، را با کودتایی خونین به کوهستان‌های شمال رانده است، اکنون بر پادشاهی‌ای دوپاره و پرآشوب حکم می‌راند که اشرافش به دو دسته تقسیم شده‌اند و دیوارهای سنگی رومی‌اش در چندین نقطه فروریخته و تنها با پرچین‌های چوبی و فرسوده بسته شده است.\n\nهنگامی که کشتی تو با محموله پوست و کهربا از رود اوز بالا می‌آید و در اسکله چوبی یورک پهلو می‌گیرد، داروغه مسلح شاه تو را به تالار برج نزد فرمانروای بدگمان می‌برد. شاه ائلا در حالی که انگشتانش را بر قبضه شمشیر می‌فشارد، به سردی در چشمانت خیره می‌شود: «هر کشتی دانمارکی که وارد رود اوز می‌شود، یا بازرگان کهرباست و یا جاسوسِ چشم‌تیز توله‌های راگنار لُدبروک! پیش از آن‌که فرمان دهم سکان کشتی‌ات را زنجیر کنند و پاروزنانت را به سیاهچال بیندازند، بگو در یورک به دنبال چه هستی؟»',
    sagaVsChronicleNote:
      'مستند (DOCUMENTED): وقایع‌نامه آنگلو-ساکسون و تواریخ سیمئون دورهام، غصب تاج نورثامبریا توسط ائلا در سال ۸۶۲ و فرسودگی دیوارهای رومی یورک را ثبت کرده‌اند.',
    choices: {
      aella_spy_york_walls: {
        label: 'وانمود کردن به تجارت پشم و شمارش پنهانیِ شکاف‌ها و نقاط سست دیوار رومی یورک با گام‌های خود',
        tooltipHint: '-۱۸ جایگاه نزد ائلا · +۸ ذکاوت · +۶ مهارت رزم · گشودن فصل سقوط یورک',
        outcomeText:
          'با تعظیمی حساب‌شده و پرداخت عوارضی اندک، تک‌تک بخش‌های فروریخته حصار جنوبی شهر را گام‌شماری می‌کنی. این نقشه پنهانی در روز یورش ارتش بزرگ ارزشی بی‌همتا خواهد داشت!',
      },
      aella_sell_mercenary_service: {
        label: 'پیشنهاد نگهبانی موقت در رود اوز در برابر هواداران شاه مخلوع اسبرت در ازای نقره',
        tooltipHint: '+۲۴ جایگاه نزد ائلا · +۴۵ نقره · +۵ دیپلماسی',
        outcomeText:
          'شاه ائلا که از یافتن ناخدایی شمالی برای تقویت رودخانه خرسند است، چهل‌وپنج سکه نقره می‌پردازد و اجازه تهیه آذوقه در کرانه رود اوز را صادر می‌کند.',
      },
      aella_warn_of_young_boars: {
        label: 'خیره شدن در چشمان ائلا و هشدار دادن که «بچه‌گرازهای راگنار» به‌زودی انتقام چاه مارها را خواهند گرفت',
        tooltipHint: '-۳۰ جایگاه نزد ائلا · +۲۲ شهرت · +۸ شرافت',
        outcomeText:
          'با شنیدن یاد سرود «گراز پیر»، رنگ از رخسار شاه ائلا می‌پرد! پیش از آن‌که نیزه‌دارانش بتوانند زنجیر دهانه رود اوز را ببندند، با نبرد در طول اسکله راه خود را به سوی دریا باز می‌کنی.',
      },
    },
  },

  leg_enc_aella_02_roman_breach: {
    title: 'تالار افسانه‌ها · شکاف دیوار یورک و فرجام شاه ائلا',
    text: 'در بیست‌ویکم مارس ۸۶۷ میلادی، سپاهیان تازه‌آشتی‌کرده شاه مخلوع اسبرت و شاه ائلا به باروهای سنگی و فرسوده رومی در شهر یورک (ائوفورویک) هجوم می‌آورند. شاه ائلا به گمان آن‌که مدافعان دانمارکی از خندق بیرونی در حال فرارند، شمشیر خود را بالا می‌برد و زیر درفش گراز زرین بی‌محابا از شکاف دیوار سنگی به درون شهر می‌تازد — و یکسره به درون تله دیوار سپرهای دوگانه‌ای می‌افتد که ایوار و برادرانش در کوچه‌های تنگ و چوبی یورک آراسته‌اند!\n\nهم‌زمان با بسته شدن آرواره پولادین کمین در پشت سر سپاه نورثامبریا و از پای درآمدن اسبرت در کنار دروازه جنوبی، یاران تو محافظان شخصی شاه ائلا را در پای دیوار باستانی رومی به محاصره درمی‌آورند، در حالی که پسران راگنار برای ستاندن انتقام چاه مارهای پدرشان فرا می‌رسند. در میانه غرش سپرهای به هم کوبیده و نیزه‌های شکسته، ضربه تو در سقوط نورثامبریا چیست؟',
    sagaVsChronicleNote:
      'مستند / مورد مناقشه: وقایع‌نامه آنگلو-ساکسون رخنه شاه ائلا و اسبرت به درون دیوار یورک در ۲۱ مارس ۸۶۷ و کشته‌شدن آنان را ثبت کرده و منظومه پسران راگنار انتقام «عقاب خونین» را به آن افزوده است.',
    choices: {
      aella_seize_boar_standard: {
        label: 'از پای درآوردن علمدار ائلا، اسیر کردن پادشاه نورثامبریا برای داوری و برداشتن سنجاق سلطنتی او',
        tooltipHint: '-۳۵ جایگاه نزد ائلا · دریافت میراث: سنجاق گراز یورک · +۵۵ نقره · +۳۰ شهرت',
        outcomeText:
          'ضربه تبر تو علمدار سلطنتی را از پای درمی‌آورد و شاه ائلا در حلقه سپرهای آهنین اسیر می‌شود! هم‌زمان با ادا شدن کامل بدهی خون چاه مارها (هفند) در برابر ارتش بزرگ، «سنجاق سلطنتی گراز یورک» (Jórvíkur-Sylgja Ellu) را از خزانه شاهی برمی‌داری.',
      },
      aella_ransom_northumbrian_thegns: {
        label: 'پذیرش خون‌بهای نقره از اشراف بازمانده نورثامبریا برای اداره آرام سرزمین‌های شمال رود تاین',
        tooltipHint: '+۱۵ جایگاه · دریافت میراث: سنجاق گراز یورک · +۶۵ نقره · +۶ دیپلماسی',
        outcomeText:
          'در حالی که شاه ائلا در نبرد کوچه‌های درون دیوار رومی کشته می‌شود، جان بزرگان بازمانده نورثامبریا در شمال رود تاین را در ازای شصت‌وپنج سکه نقره و «سنجاق سلطنتی گراز یورک» امان می‌دهی.',
      },
    },
  },

  // 11. KING ALFRED OF WESSEX
  leg_enc_alfred_01_athelney_fens: {
    title: 'تالار افسانه‌ها · دودِ آتش در مرداب‌های توسِ اتلنی (شاه آلفرد)',
    text: 'در اعماق نیزارهای مه‌آلود، درختان توس و مرداب‌های سیل‌گرفته سامرست، جزیره کوچک و پست «اتلنی» همچون پناهگاهی پنهان از دل باتلاق سر برآورده است. «شاه آلفردِ» بیست‌ونه‌ساله که پس از شبیخون غافلگیرکننده زمستانی گوتورم به تالار سلطنتی چیپنهام با گروهی اندک از یاران وفادارش به این مرداب غیرقابل‌عبور پناه آورده است، بر کنده‌ای کنار آتش دیده‌بانی نشسته؛ در یک دست کتاب مزامیر لاتین و در دست دیگر سنگ فسان برای تیز کردن شمشیر دارد و با آرامشی شگفت‌انگیز ساخت دژ و گذرگاه چوبی را به صنعتگرانش فرمان می‌دهد.\n\nهنگامی که گروه دیده‌بان تو با قایق‌های کم‌آبخور از آبراه‌های باریک نیزار می‌گذرد، آلفرد بی‌آنکه نشانی از هراس در چهره‌اش باشد پیش می‌آید و می‌گوید: «امروز پادشاهی را می‌بینی که تالارش کلبه‌ای نی‌پوش و قلمروش سه فرسنگ گل‌ولای است؛ اما پیش از عید پنجاهه، درفش‌های سامرست، ویلتشایر و همپشایر در سنگ اکبرت به من خواهند پیوست! آیا در این ساعت تاریک با وسکس پیمان دوستی می‌بندی یا دیوار سپرهای ما را بر فراز تپه‌ها می‌آزمایی؟»',
    sagaVsChronicleNote:
      'مستند (DOCUMENTED): زندگی‌نامه شاه آلفرد اثر اسقف آسر و وقایع‌نامه آنگلو-ساکسون (۸۷۸)، پایداری آلفرد در مرداب‌های اتلنی پیش از پیروزی در ادینگتون را ثبت کرده‌اند.',
    choices: {
      alfred_parley_athelney_truce: {
        label: 'احترام به عزم استوار پادشاه مرداب و بستن پیمان عدم مداخله ناوگان خود در نبرد ادینگتون',
        tooltipHint: '+۲۸ جایگاه نزد آلفرد · +۴۰ نقره · +۷ دیپلماسی و قانون‌دانی · گشودن فصل وینچستر',
        outcomeText:
          'آلفرد دستت را با وقاری آرام می‌فشارد: «پیمانی که در روزهای تاریک بسته شود، به ده سوگند در روز پیروزی می‌ارزد!» او نقره اردوگاه را با تو قسمت می‌کند و نشان بادبانت را برای پذیرایی شاهانه پس از بازگشت به وینچستر به خاطر می‌سپارد.',
      },
      alfred_skirmish_marsh_causeway: {
        label: 'یورش به پل چوبی اتلنی برای به دست آوردن جایزه گوتورم بر سر پادشاه فراری!',
        tooltipHint: '-۲۶ جایگاه نزد آلفرد · +۶ مهارت رزم · +۱۸ شهرت',
        outcomeText:
          'یورشی سخت بر فراز پل باریک مرداب رهبری می‌کنی، اما یاران وفادار آلفرد در آبِ تا سینه و میان نیزارها چنان سرسختانه می‌جنگند که هر دو سو با تیغ‌های چاک‌خورده و احترامی ناگزیر عقب می‌نشینند.',
      },
    },
  },

  leg_enc_alfred_02_wedmore_burhs: {
    title: 'تالار افسانه‌ها · ساعتِ شمعی پادشاه دانش‌پرور و نشانگر زرین (اَستل)',
    text: 'در کتابخانه و دارالانشای بازسازی‌شده وینچستر، شمعی مدرج درون فانوسی از شاخِ تراشیده و شفاف گاو می‌سوزد — ابتکار شاه آلفرد برای سنجش دقیق ساعات قانون‌گذاری، نیایش و دفاع از مرزها حتی هنگامی که باد در تالار می‌وزد. بر میز بلوط، در کنار نقشه‌های دژهای دفاعی نوین (*burhs*) و کشتی‌های شصت‌پارویی، شاهکاری از طلای ملیله‌کاری و بلور کوهی قرار دارد که بر آن حک شده است: *AELFRED MEC HEHT GEWYRCAN* («آلفرد فرمان ساخت مرا داد»).\n\nشاه آلفرد سر از پوست‌نوشته‌ای برمی‌دارد که کاتبانش در آن سفرنامه دریایی ناخدای نروژی، «اوهتره» (اوتار از هالوگالند)، را به انگلیسی باستان نوشته‌اند: «از دریاهای شمال برایم بگو و پیمان بازارهای دانلا را امضا کن؛ چرا که خرد و قانون، پادشاهی‌ها را استوارتر از پولاد به هم پیوند می‌دهند.»',
    sagaVsChronicleNote:
      'مستند (DOCUMENTED): اسقف آسر ساعت شمعی آلفرد، کشتی‌های شصت‌پارویی و شبکه دژهای او را شرح داده و «جواهر آلفرد» (نشانگر زرین اَستل) و سفرنامه اوهتره در ترجمه اوروسیوسِ آلفرد امروزه در موزه اشمولین و کتابخانه بریتانیا موجود است.',
    choices: {
      alfred_share_northern_geography: {
        label: 'روایت مسیرهای دریایی شمال (همچون اوهتره نروژی) برای کاتبان شاه و دریافت نشانگر زرین آلفرد (اَستل)',
        tooltipHint: '+۳۲ جایگاه نزد آلفرد · دریافت میراث: نشانگر زرین شاه آلفرد (اَستل) · +۵۰ نقره · +۸ دیپلماسی',
        outcomeText:
          'در حالی که کاتبان آلفرد با شوق گزارش تو را از آبدره‌های نروژ و تنگه‌های دانمارک بر پوست می‌نگارند، پادشاه «نشانگر زرین و میناکاری‌شده» خود (Gull-Æstel Álfráðs) و پنجاه سکه نقره را به تو هدیه می‌دهد!',
      },
      alfred_inspect_sixty_oar_ships: {
        label: 'بررسی طراحی کشتی‌های شصت‌پارویی جدید آلفرد در کارگاه دریایی ساوت‌همپتون',
        tooltipHint: '+۲۴ جایگاه نزد آلفرد · +۸ دریانوردی و صنعتگری · +۳۵ نقره',
        outcomeText:
          'در کارگاه کشتی‌سازی سولنت، با استادکاران فریزی شاه آلفرد درباره آبخور عمیق‌تر و بدنه بلند کشتی‌های شصت‌پارویی او گفت‌وگو می‌کنی و هر دو ناوگان در فن رزم دریایی داناتر می‌شوند.',
      },
    },
  },

  // 12. KING GUTHRUM (ÆTHELSTAN)
  leg_enc_guthrum_01_night_march: {
    title: 'تالار افسانه‌ها · سوگند بر حلقه مقدس و حرکت شبانه به سوی اکستر',
    text: 'در دژ بندری «ورم» میان دو رود فروم و پیدل در دورست، «شاه گوتورم» — فرمانده سپاه بزرگ تابستانی — در کنار آتشدان بر فراز بازوبند زرین و سنگین معبد (*stórhringr*) ایستاده است که به خون قربانی آغشته است. تنها ساعاتی پیش او در برابر فرستادگان شاه آلفرد بر این حلقه مقدس سوگندی استوار یاد کرد که سپاهش خاک وسکس را ترک خواهد گفت؛ اما هم‌اکنون در حیاط قلعه، سوارانش در تاریکی شب سم‌های نعل‌بندی‌شده اسب‌های خود را با نوارهای پارچه پشمی می‌پیچند!\n\nگوتورم در حالی که مهتران تنگِ زین‌ها را محکم می‌کنند، نگاهت را می‌گیرد و زیر کلاهخودش لبخندی زیرکانه می‌زند: «به آلفرد سوگند خوردم که دژ ورم را ترک کنیم، و ترکش هم می‌کنیم — اما یکسره از فراز تپه‌ها به سوی غرب و به درون دیوارهای سنگی و رومی اکستر، پیش از آن‌که سواران ایالتی او از خواب بیدار شوند! آیا در ستون شبانه من اسب می‌تازی تا در نقره‌های دوون شریک شوی؟»',
    sagaVsChronicleNote:
      'مستند (DOCUMENTED): وقایع‌نامه آنگلو-ساکسون (۸۷۶–۸۷۷) سوگند گوتورم بر «حلقه مقدس» در برابر آلفرد در ورم و سپس حرکت شبانه سواره‌نظام او به سوی دژ اکستر را ثبت کرده است.',
    choices: {
      guthrum_ride_exeter_column: {
        label: 'پیچیدن سم اسب‌ها با پشم و تاختن همراه ستون شبانه گوتورم به درون دیوارهای اکستر',
        tooltipHint: '+۲۸ جایگاه نزد گوتورم · +۷ ذکاوت و رزم · +۴۵ نقره · گشودن فصل ضرابخانه اتلستن',
        outcomeText:
          'در دل مه شبانه از کنار آتش دیده‌بانان وسکس می‌لغزید و بی‌آنکه حتی یک جنگجو از دست بدهید، چهارنعل وارد حصارهای رومی اکستر می‌شوید! گوتورم چهل‌وپنج سکه نقره از غنایم دوون را به تو می‌بخشد.',
      },
      guthrum_rebuke_ring_breaking: {
        label: 'خودداری از شکستن سوگندی که بر حلقه مقدس ثور و اودین یاد شده است',
        tooltipHint: '-۲۲ جایگاه نزد گوتورم · +۱۰ شرافت و ایمان · +۱۸ شهرت',
        outcomeText:
          'دست بر بازوبند خود می‌گذاری و هشدار می‌دهی که بازی با سوگندِ حلقه مقدس خشم خدایان را برمی‌انگیزد — و دیری نمی‌گذرد که طوفانی سهمگین ۱۲۰ کشتی گوتورم را در سواحل سوانج در هم می‌شکند!',
      },
    },
  },

  leg_enc_guthrum_02_aethelstan_mint: {
    title: 'تالار افسانه‌ها · پیشانی‌بند تعمید ودمور و سکه‌های شاه اتلستن (گوتورم)',
    text: 'در تالار چوبی و شاهی ایست آنگلیا در گیپس‌ویک، «شاه گوتورم» — که به تازگی در آلر با پدرخواندگی شاه آلفرد کبیر غسل تعمید یافته و نام سلطنتی «شاه اتلستن» بر خود نهاده است — بر تخت بلند نشسته و نوار کتان سفید تعمید ودمور را در کنار تبر جنگی چاک‌خورده دانمارکی خود گذاشته است. در برابرش بر روی میز، پوست‌نوشته مهرشده «پیمان آلفرد و گوتورم» قرار دارد که مرز دائمی دانلا را در امتداد رود تیمز، رود لیا و جاده باستانی رومی واتلینگ استریت تعیین می‌کند.\n\nگوتورم در یک دست سکه نقره تازه‌ضرب‌شده با نقش *EDELSTAN REX* و در دست دیگر بازوبند نقره وایکینگی را بالا می‌گیرد و با لبخندی زیرکانه می‌گوید: «برخی از غارتگران سپیدریش ناوگان مرا نوکیشِ کشیشان می‌خوانند چون دوازده روز کتان سفید آلفرد را بر پیشانی بستم؛ اما امروز هر یارلی که با من اسب تاخت، در سراسر ایست آنگلیا صاحب مزرعه زرخیز و عوارض بازار است بی‌آنکه نیزه‌ای از ساکسون‌ها از جاده واتلینگ بگذرد! تالار تو صلح ودمور را چگونه داوری می‌کند؟»',
    sagaVsChronicleNote:
      'مستند (DOCUMENTED): وقایع‌نامه آنگلو-ساکسون تعمید گوتورم با نام اتلستن پس از نبرد ادینگتون (۸۷۸)، متن حقوقی پیمان آلفرد و گوتورم، و سکه‌های نقره EDELSTAN REX در ایست آنگلیا را گواهی می‌دهد.',
    choices: {
      guthrum_endorse_danelaw_peace: {
        label: 'ستودن تدبیر سیاسی او، امضای منشور بازارهای دانلا و دریافت طوق دوگانه ودمور',
        tooltipHint: '+۳۰ جایگاه نزد گوتورم · دریافت میراث: طوق دوگانه گوتورم-اتلستن · +۵۰ نقره · +۸ تجارت',
        outcomeText:
          'گوتورم با خنده می‌گوید: «یارلِ خردمند می‌داند چه وقت محصولی را که شمشیر کاشته است درو کند!» او «طوق دوگانه پیمان ودمور» (Friðbaugr Gorms) را بر ساعدت می‌بندد و امتیاز ویژه تجاری در بنادر ایست آنگلیا به کشتی‌هایت می‌بخشد.',
      },
      guthrum_recruit_restless_veterans: {
        label: 'جذب پاروزنان پاگان و ناآرام اردوگاه او که حاضر نیستند پشت مرز واتلینگ استریت زمین‌گیر شوند',
        tooltipHint: '+۱۸ جایگاه نزد گوتورم · +۱۲ جنگجو · +۶ مهارت رزم',
        outcomeText:
          'گوتورم با عمل‌گرایی سر تکان می‌دهد: «جوانان خون‌گرم را پیش از آن‌که پیمان مرزی مرا بشکنند با خود به فرانکستان ببر!» دوازده جنگجوی کارآزموده دانمارکی صندوق‌های خود را به عرشه لانگ‌شیپ‌های تو می‌آورند.',
      },
    },
  },

  // 13. HASTEIN (HÁSTEINN OF THE LOIRE)
  leg_enc_hastein_01_loire: {
    title: 'تالار افسانه‌ها · گرگ جزیره نوارموتیه و چرخشت‌های باده رود لوآر (هستین)',
    text: 'در جزیره نمک‌زار و جزرومدی «نوارموتیه» در دهانه رود لوآر، ده‌ها کشتی اژدهاپیکر قیراندود در کنار حوضچه‌های سنگی نمک و سرداب‌های شرابِ صومعه‌های فرانکی به ساحل کشیده شده‌اند. بر فراز کرسی کنده‌کاری‌شده اسقفی در ساحل شنی، «هستین» نشسته است — که نورس‌ها او را «هاستین» و وقایع‌نگاران وحشت‌زده تور و نانت او را «هاستینگوس» می‌خوانند — گرگ پیر دریا با سه خط زخم سفید بر گونه و زنجیر زرین یادگار کلیسا که سه دور به دور مچ زره‌پوش خود پیچیده است.\n\nاو باده سرخ آنژو را در دو جام نقره‌ای می‌ریزد و یکی را در دست تو می‌گذارد: «پادشاهان شمال بر سر آبدره‌های سنگی و شلغم‌های یخ‌زده با هم می‌جنگند!» هستین با خنده خنجرش را به سوی بالادست رود و شهرهای تور و آنژه می‌گیرد: «اما اینجا در رود لوآر، کلید جزیره‌ای چهار ایالت فرانک در مشت ماست: وقتی کنت روبر به چپ لشکر می‌کشد، ما به راست پارو می‌زنیم؛ و وقتی اسقف‌ها دروازه‌ها را قفل می‌کنند، ناقوس‌های خودشان را در ازای نقره به آن‌ها می‌فروشیم! آیا خدمه کشتی تو این فصل به برادری لوآر می‌پیوندند؟»',
    sagaVsChronicleNote:
      'مستند (DOCUMENTED): وقایع‌نامه نانت، سالنامه سن‌برتین و تاریخ رگینوی پروم، عملیات هستین از پایگاه جزیره‌ای نوارموتیه در دهانه لوآر و نبرد بریسارت (۸۶۶) که به کشته‌شدن روبر قوی انجامید را ثبت کرده‌اند.',
    choices: {
      hastein_ride_brissarthe_raid: {
        label: 'بستن کشتی‌های خود به ناوگان لوآرِ هستین و یورش برق‌آسا به کنت‌نشین‌های ساحلی فرانک',
        tooltipHint: '+۲۸ جایگاه نزد هستین · +۵۰ نقره · +۷ رزم و ذکاوت · +۲۰ شهرت',
        outcomeText:
          'با پاروهای نمدپیچ بر موج مد به بالادست رود می‌رانید، کلیسای سنگی بریسارت را تسخیر می‌کنید و سواره‌نظام تعقیب‌کننده فرانک را در پای دروازه در هم می‌شکنید! هستین کیسه‌ای سنگین از سکه‌های نقره آکیتن به سویت می‌اندازد و تو را گرگ راستین لوآر می‌خواند.',
      },
      hastein_broker_salt_and_wine: {
        label: 'خرید نمک دریایی نوارموتیه و باده آنژو از انبارهای هستین برای فروش در بازارهای شمال',
        tooltipHint: '+۲۰ جایگاه نزد هستین · +۴۰ نقره · +۷ تجارت و دریانوردی',
        outcomeText:
          'انبار کشتی را از نمک مرغوب خلیج بورگنف و چلیک‌های باده فرانکی از انبارهای جزیره‌ای هستین پر می‌کنی و پادشاه پیر دریا پرچم گذر امن در خلیج بیسکای را به بازرگانانت می‌بخشد.',
      },
      hastein_spurn_trickster_ways: {
        label: 'هشدار به یاران که تعمیدهای دروغین و نیرنگ‌های تابوت هستین دونِ شأن کلام یک جنگجوی راستین است',
        tooltipHint: '-۲۲ جایگاه نزد هستین · +۸ شرافت و ایمان · +۴ ثبات قلمرو',
        outcomeText:
          'گونه زخم‌خورده هستین تکان می‌خورد و هر دو جام را خود سر می‌کشد: «پس برو و فقیر و درستکار بر دیوار نیزه‌های ساکسون جان بده!» و کشتی تو از مصب لوآر بیرون می‌راند.',
      },
    },
  },

  // 14. KING HORIK I OF DENMARK
  leg_enc_horik_01_hedeby: {
    title: 'تالار افسانه‌ها · ترازوی گمرک شاه هوریک و فرستادگان آخن در بندر هدبی',
    text: 'بر فراز باروی خاکی نیم‌دایره‌ای «هدبی»، درفش سلطنتی «شاه هوریک یکم» فرزند گودفرد بر بندری پر از کشتی‌های تجاری فریزی، بازرگانان کهربای اسلاو و لانگ‌شیپ‌های کشیده دانمارکی در اهتزاز است. در درون تالار گمرک شاهی، شاه هوریک در حالی بر تخت نشسته که از یک سو فرستادگان لوئی ژرمن (پادشاه فرانک خاوری) و از سوی دیگر راهب مبلغ «آنسگار» ایستاده‌اند، و در پای تخت نیز سه ناخدای خودسر وایکینگ که بدون اجازه شاه به فریزیا تاخته بودند در زنجیرند.\n\nهنگامی که برابر تخت بلند گام می‌نهی، هوریک نگاه سرد و حسابگر خود را به تو می‌دوزد: «هر ناخدای خون‌گرمی از شیلند گمان می‌کند می‌تواند دورستاد یا پاریس را بسوزاند و باروهای مرزی مرا در دانویرکه برابر خشم امپراتور فرانک تنها بگذارد! در قلمرو من، تنها یک پادشاه سکان و ترازوی گمرک را در دست دارد. آیا زیر مهر شاهی من بادبان می‌کشی و صلح آبدره شلای را پاس می‌داری، یا به گرگ‌های بی‌قانونی می‌پیوندی که در دهانه بندر به دار می‌آویزم؟»',
    sagaVsChronicleNote:
      'مستند (DOCUMENTED): سالنامه‌های سلطنتی فرانک و کتاب زندگی آنسگار، سلطنت هوریک یکم (۸۲۷–۸۵۴) در هدبی، مذاکرات مرزی او با امپراتوران کارولنژی، سرکوب غارتگران خودسر و اجازه نصب نخستین ناقوس کلیسای هدبی را ثبت کرده‌اند.',
    choices: {
      horik_swear_royal_coast_guard: {
        label: 'پذیرفتن مهر شاهی هوریک، گشت‌زنی در مرز شلای و آیدر، و شریک شدن در عوارض گمرک هدبی',
        tooltipHint: '+۲۸ جایگاه نزد شاه هوریک · +۴۵ نقره · +۷ قانون‌دانی و دیپلماسی · +۶ ثبات قلمرو',
        outcomeText:
          'شاه هوریک مهر سربی سلطنتی با نشان کشتی هدبی را به سکان‌دارت می‌سپارد. با گشت‌زنی در آبراه شلای به نام شاه، چهل‌وپنج سکه نقره از سهم گمرک دریافت می‌کنی و تقرب ویژه دربار را به دست می‌آوری.',
      },
      horik_counsel_ansgar_bell: {
        label: 'رایزنی با هوریک برای اجازه نصب ناقوس کلیسای آنسگار تا بازرگانان مسیحی به بازار هدبی سرازیر شوند',
        tooltipHint: '+۲۲ جایگاه نزد شاه هوریک · +۴۰ نقره · +۸ تجارت · +۵ ذکاوت',
        outcomeText:
          'هوریک دستی به ریش می‌کشد و سر تکان می‌دهد: «بگذار ناقوس ساکسون‌ها زنگ بزند اگر نقره‌های دورستاد را به بندر من می‌آورد!» رونق بازار هدبی دوچندان می‌شود و صندوق‌های تو از سکه فرانکی پر می‌گردد.',
      },
      horik_defy_free_sea_right: {
        label: 'اعلام بی‌باکانه در برابر نیمکت‌ها که دریای آزاد متعلق به هر ناخدای صاحب بلوط و پولاد است، نه شاه هدبی',
        tooltipHint: '-۲۶ جایگاه نزد شاه هوریک · +۲۰ شهرت · +۷ شرافت و دریانوردی',
        outcomeText:
          'همهمه تحسین از میان پاروزنان جوان کنار دیوارها برمی‌خیزد — همان جرگه مغروری که پیرو راگنار هستند! انگشتان هوریک بر عصای شاهی فشرده می‌شود در حالی که تو آزادانه به سوی لانگ‌شیپ خود بازمی‌گردی.',
      },
    },
  },

  // 15. KING CHARLES THE SIMPLE
  leg_enc_charles_01_frankia: {
    title: 'تالار افسانه‌ها · تاج کارولنژی و مردان شمال در رود سن (شاه شارل ساده)',
    text: 'در تالار سنگی و طاق‌دار «کومپین» در شمال پاریس، پادشاه جوان فرانک باختری، «شارل سوم» — که وقایع‌نگاران لاتین او را *Karolus Simplex* به معنای «راست‌کردار و بی‌پرده» می‌خوانند — در زیر درفش عقابِ نیای بزرگش شارلمانی نشسته است. پیرامون میز او، دوک‌ها و مرزبانان فرانک بر سر خزانه‌های تهی‌شده مشاجره می‌کنند، در حالی که لانگ‌شیپ‌های شمالی هر پیچ‌وخم رود سن را در دست دارند.\n\nشاه شارل با اشاره دستکش خود کنت‌های ستیزه‌جو را مرخص می‌کند و به همراه اسقف اعظم فرانکو از روآن، از سکو پایین می‌آید تا با هیئت شمالی تو سخن بگوید: «پدران من کوهی از نقره دانگلد در پاریس پرداختند و تنها یک زمستان آسودگی خریدند! نقره دود می‌شود و به هوا می‌رود، اما زمین حاصلخیز گرگِ دریا را به مرزبان تبدیل می‌کند. آیا منشور سلطنتی زمین می‌پذیری و دروازه‌های رودخانه فرانکستان را نگهبانی می‌کنی، یا دیوارهای شارتر را می‌آزمایی؟»',
    sagaVsChronicleNote:
      'مستند (DOCUMENTED): تواریخ ریشر رنس، فلودوارد و دودو سن‌کانتن ثبت کرده‌اند که شارل سوم (حکومت ۸۹۸–۹۲۲) پس از نبرد شارتر، با واگذاری نورماندی در سال ۹۱۱ تهدید وایکینگ‌های رود سن را به سپری دفاعی برای فرانسه تبدیل کرد.',
    choices: {
      charles_accept_river_fief: {
        label: 'پذیرش پیمان مرزبانی رود سن در ازای منشور ملک حاصلخیز و مستمری نقره از شاه شارل',
        tooltipHint: '+۲۸ جایگاه نزد شارل ساده · +۱ مزرعه · +۴۵ نقره · +۷ دیپلماسی و قانون‌دانی',
        outcomeText:
          'شاه شارل منشور لاتین را با موم سرخ مهر می‌کند و حق عوارض و املاک ساحلی رود را در ازای بستن راه بر ناوگان‌های رقیب به خاندانت می‌بخشد. هم دهقانان فرانک و هم پاروزنان نورس در پناه سپر تو آباد می‌شوند.',
      },
      charles_negotiate_chartres_ransom: {
        label: 'میانجی‌گری برای پیمان تجاری میان اردوگاه‌های شمالی و ضرابخانه‌های شاهی در رنس و روآن',
        tooltipHint: '+۲۰ جایگاه نزد شارل ساده · +۵۵ نقره · +۸ تجارت',
        outcomeText:
          'ترتیبی می‌دهی که املاک صومعه‌ها با سکه‌های خالص کارولنژی بازخرید شوند و بازارهای باده رود سن به روی بازرگانان شمالی گشوده گردد. شاه شارل درستکاری تو را می‌ستاید.',
      },
      charles_raid_royal_demesne: {
        label: 'رد کردن پوست‌نوشته کارولنژی و تاختن با جنگجویان خود به سوی تاکستان‌های دره مارن',
        tooltipHint: '-۲۵ جایگاه نزد شارل ساده · +۵۰ نقره · +۶ مهارت رزم',
        outcomeText:
          'رو به اسقف اعظم می‌گویی: «پوست‌نوشته در باد شمال بیش از حد آسان می‌سوزد!» و پیش از گرد آمدن سواره‌نظام سنگین شارل، با غنیمت نقره و اسب از املاک سلطنتی بازمی‌گردی.',
      },
    },
  },

  // 16. COUNT ODO OF PARIS
  leg_enc_odo_01_paris_towers: {
    title: 'تالار افسانه‌ها · دفاع پولادین کنت اودو بر فراز پل بزرگ پاریس',
    text: 'هفتصد کشتی شمالی چنان رود سن را انباشته‌اند که تا دو فرسنگ، آب رودخانه در زیر تخته‌های بلوط و سپرهای رنگین دیده نمی‌شود! با این همه، جزیره «ایل دو لا سیته» پاریس با دو پل چوبی کم‌ارتفاع و برج‌های سنگی نگهبانش راه بالادست رود را بسته است. بر فراز باروی دودگرفته «پل بزرگ» (گران-پون)، «کنت اودو» فرزند روبر قوی ایستاده است؛ زره حلقه‌دارش از قیر جوشان و دوده سیاه شده و با تبر جنگی خود موج پس از موجِ منجنیق‌ها و نردبان‌های وایکینگ‌ها را به عقب می‌راند.\n\nهنگامی که طغیان ناگهانی شبانه رود بخشی از «پل کوچک» را می‌برد و دوازده تن از دلیرترین مدافعان فرانک در برج جنوبی محاصره می‌شوند، کنت اودو بر دروازه شمالی اسب می‌تازد و شیپور مذاکره یا نبرد تن‌به‌تن را به صدا درمی‌آورد. خدمه کشتی تو در برابر دیوارهای پولادین پاریس چه می‌کنند؟',
    sagaVsChronicleNote:
      'مستند (DOCUMENTED): منظومه لاتین شاهد عینی، «آبو» راهب سن-ژرمن (Bella Parisiacae urbis)، دفاع قهرمانانه کنت اودو و اسقف گوزلن از برج‌های پل پاریس در برابر ۷۰۰ کشتی وایکینگ در سال‌های ۸۸۵–۸۸۶ را به تصویر کشیده است.',
    choices: {
      odo_assault_bridge_tower: {
        label: 'راندن کشتی‌های آتش‌زا به سوی پایه‌های چوبی پل و نبرد شمشیر به شمشیر با شوالیه‌های کنت اودو!',
        tooltipHint: '-۲۸ جایگاه نزد کنت اودو · +۵۰ نقره · +۸ مهارت رزم · +۲۴ شهرت',
        outcomeText:
          'سه بدنه کشتی پر از قیر شعله‌ور را به پایه‌های پل می‌کوبی و در کرانه رود، سپر به سپر با یورش زره‌پوشان کنت اودو درگیر می‌شوی! هرچند برج اودو تا رسیدن امپراتور شارل فربه و پرداخت ۷۰۰ پوند باج نقره پایدار می‌ماند، حتی راهبان سن-ژرمن نیز دلاوری یورش تو را در اشعار لاتین خود ثبت می‌کنند.',
      },
      odo_honor_tower_twelve_parley: {
        label: 'درود فرستادن به دلیری کنت اودو، پذیرش فدیه شرافتمندانه برای نگهبانان پل و عبور از خشکی به سوی بورگوندی',
        tooltipHint: '+۲۶ جایگاه نزد کنت اودو · +۴۵ نقره · +۷ شرافت و دیپلماسی',
        outcomeText:
          'کنت اودو که از جوانمردی یک ناخدای شمالی در احترام به دشمنان دلیر شگفت‌زده شده است، در دروازه آبی شمشیری نقره‌کوب با تو مبادله می‌کند و اجازه می‌دهد ناوگانت بی‌گزند از کنار پاریس به سوی دره‌های ثروتمند یون بگذرد.',
      },
      odo_enter_frankish_guard: {
        label: 'پذیرش مقرری زرین و پنهانی کنت اودو برای گزارش دادن حرکت ناوگان‌های رقیب در پایین‌دست رود سن',
        tooltipHint: '+۲۲ جایگاه نزد کنت اودو · +۶۰ نقره · +۷ ذکاوت و قانون‌دانی',
        outcomeText:
          'هنگامی که بزرگان فرانک باختری در سال ۸۸۸ کنت اودو را به پاس نجات پاریس به پادشاهی برمی‌گزینند، خزانه سلطنتی او شصت سکه نقره به تالار تو بابت هشدارهای به‌موقع در مصب رود می‌پردازد.',
      },
    },
  },

  // 17. HARALD FAIRHAIR (HARALDR HÁRFAGRI)
  leg_enc_harald_01_hafrsfjord: {
    title: 'تالار افسانه‌ها · گیسوان نبریده هارالد و غرش نبرد هافرسفیورد',
    text: 'در خلیج باریک ساحلی «هافرسفیورد» در نزدیکی استاوانگر، بزرگ‌ترین ناوگان جنگی که نروژ به چشم دیده بدنه کشتی‌های بلوط خود را سینه به سینه به هم بسته است. بر دماغه کشتی اژدهاپیکر سرفرماندهی، «شاه هارالد هالفدانسون» ایستاده است — که هنوز او را «لوفا» (ژولیده‌مو) می‌خوانند، چرا که ده زمستان است در وفای به سوگندش به «گیدا» دختر اریک، گیسوان انبوه و طلایی‌اش را نه بریده و نه شانه زده است تا روزی که یگانه پادشاه سراسر آبدره‌ها و بلندی‌های نروژ شود.\n\nدر آن سوی تنگه خروشان، شاهکان شورشی آگدر، تلمارک و هوردالند — کیوتوه ثروتمند و هاکلانگ درازچانه — بر سپرهای خود می‌کوبند و جنگجویان گرگ‌پوش هارالد (*اولف‌هدنار*) در سینه کشتی نعره می‌کشند. هارالد چشمان نافذش را به لانگ‌شیپ تو می‌دوزد: «امروز نروژ یا یک تخت بلند در آوالدسنس خواهد داشت و یا سی گرگ خرده‌پا! آیا لبه کشتی‌ات را به خط سلطنتی من می‌بندی و سهم یک یارل‌نشین را می‌گیری، یا همراه بوندی‌های لجوج به آن سوی دریای غرب می‌گریزی؟»',
    sagaVsChronicleNote:
      'مستند (DOCUMENTED): اشعار اسکالدی هم‌عصر (هارالدسکودی اثر توربیورن هورنکلوفی) و هایمس‌کرینگلا، سوگند نبریدن موی هارالد، پیروزی دریایی او در هافرسفیورد (~۸۷۲) و شانه زدن مویش توسط یارل روگنوالد موره را روایت می‌کنند.',
    choices: {
      harald_lash_ship_hafrsfjord: {
        label: 'بستن لانگ‌شیپ خود به خط سلطنتی هارالد در هافرسفیورد و حضور در جشن پیرایش گیسوان «هارالد موبور»',
        tooltipHint: '+۳۰ جایگاه نزد هارالد موبور · +۵۰ نقره · +۸ رزم و قانون‌دانی · +۲۵ شهرت',
        outcomeText:
          'سنگ و زوبین‌های آهنین بر عرشه‌های به‌هم‌بسته هافرسفیورد می‌بارد تا آن‌که هاکلانگ از پای درمی‌آید و کیوتوه می‌گریزد! پس از نبرد در بزم موره، هنگامی که یارل روگنوالد گیسوان ده‌ساله شاه را می‌آراید و لقب «هارفاگری» (موبور/خوش‌مو) به او می‌دهد، پادشاه جدید نروژ یک‌سوم خراج منطقه را به عنوان زمین‌دار قسم‌خورده به خاندان تو واگذار می‌کند.',
      },
      harald_negotiate_skatt_autonomy: {
        label: 'پیشنهاد سهمیه مشخص کشتی جنگی (لیدانگ) تا تالار تو قوانین موروثی اودال خود را در زیر چتر تاج حفظ کند',
        tooltipHint: '+۲۰ جایگاه نزد هارالد موبور · +۸ دیپلماسی و قانون‌دانی · +۸ ثبات قلمرو',
        outcomeText:
          'با پادرمیانی اسکالد خردمند شاه، گوتورم سیندری، شاه هارالد سهمیه کشتی‌های لیدانگ تو را می‌پذیرد بی‌آنکه مأموران مالیاتی را به مراتع اجدادی‌ات بفرستد و کشاورزان آزاد آبدره تدبیر تو را می‌ستایند.',
      },
      harald_defy_tax_sail_west: {
        label: 'امتناع از پرداخت مالیات زمین (اسکات) همچون بردگان و هدایت کشتی‌های آزاد خود به سوی جزایر غرب و ایسلند!',
        tooltipHint: '-۲۸ جایگاه نزد هارالد موبور · +۲۴ شهرت · +۸ دریانوردی و شرافت',
        outcomeText:
          'بر فراز امواج فریاد می‌زنی: «پدران من زمین خود را از جنگل و دریا گرفتند، نه از چوب‌خط یک پادشاه!» با پیوستن به موج بزرگ سالاران مغرور نروژی که به سوی هبرید، اورکنی و ایسلند بادبان می‌کشند، نامت در تمام تالارهای آزاد اقیانوس اطلس شمالی طنین‌انداز می‌شود.',
      },
    },
  },

  // 18. RURIK OF LADOGA (HRŒREKR OF HOLMGARD)
  leg_enc_rurik_01_ladoga: {
    title: 'تالار افسانه‌ها · دعوت سرزمین روس: دژ پرنس روریک بر کرانه رود ولخوف',
    text: 'در جایی که آب‌های خاکستری و تند رود ولخوف به سوی دریاچه لادوگا سرازیر می‌شود، دژ چوبی و سنگ‌آهکی «آلدیگیوبورگ» (استارایا لادوگا) قد برافراشته است. در درون تالار بزرگ، ریش‌سفیدان اسلاوهای ایلمن، چودهای فینی و قبیله کریویچی بسته‌های خراج پوست سمور سیاه، سنجاب و درهم‌های نقره عباسی را در برابر شاهزاده وارنگی، «روریک» (*هرورکر*) و یاران زخم‌خورده‌اش بر زمین می‌گذارند.\n\nبزرگِ هولمگارد همان سخنان مشهور وقایع‌نامه نخستین روس را تکرار می‌کند: «سرزمین ما پهناور و سرشار از عسل، خز و رودخانه‌هاست، اما قبایل ما بی‌قانونِ داوری بی‌طرف در کین‌خواهی‌های بی‌پایان خون می‌ریزند؛ بیایید و بر ما حکومت و داوری کنید!» روریک دست بر قبضه شمشیر پهن سوئدی خود می‌گذارد و رو به تو می‌گوید: «من تخت فرمانروایی‌ام را به بالادست رود می‌برم تا دژ نوین هولمگارد (نووگورود) را بنا کنم، در حالی که آسکولد و دیر در طول رود دنیپر به سوی کیف و میکلاگارد (قسطنطنیه) پیش می‌روند. آیا به عنوان یکی از ناخدایان و بویارهای من در ولخوف می‌ایستی؟»',
    sagaVsChronicleNote:
      'مستند / مورد مناقشه: وقایع‌نامه نخستین روس (قصه سالیان گذشته، سال ۸۶۲) دعوت قبایل اسلاو و فینی از روریک و برادرانش را ثبت کرده و کاوش‌های باستان‌شناسی در استارایا لادوگا و «روریکوو گورودیشچه» دژهای اسکاندیناویایی سده نهم را تأیید می‌کنند.',
    choices: {
      rurik_build_holmgard_citadel: {
        label: 'برافراشتن باروهای بلوط هولمگارد (روریکوو گورودیشچه) در کنار پرنس روریک و داوری میان قبایل رودخانه',
        tooltipHint: '+۳۰ جایگاه نزد روریک · +۵۰ نقره · +۷ قانون‌دانی و رزم · +۶ ثبات قلمرو',
        outcomeText:
          'بر ساخت برج‌وهای چوبی مشرف به دریاچه ایلمن نظارت می‌کنی و در کنار روریک به عنوان گواه قانون بر ریش‌سفیدان اسلاو و فینی داوری می‌نشینی. بنیان‌گذار دودمان روس نیز سهمی پرسود از گردش سالانه خراج خز (*پولیودیه*) و پنجاه درهم نقره به خاندانت می‌بخشد.',
      },
      rurik_charter_volga_convoy: {
        label: 'دریافت مهر وارنگی روریک برای هدایت کاروان‌های خز و کهربا در شاهراه نقره ولگا و دنیپر',
        tooltipHint: '+۲۲ جایگاه نزد روریک · +۶۰ نقره · +۸ تجارت و دریانوردی',
        outcomeText:
          'با نشان نقره‌ای پرنس روریک، کشتی‌های رودخانه‌ای تو آزادانه از گذرگاه‌های لادوگا و بلوئوزرو می‌گذرند و انباشته از درهم‌های خلافت، دیبای ابریشمین و پولاد دمشقی بازمی‌گردند.',
      },
      rurik_back_askold_free_south: {
        label: 'جدا شدن از گمرک‌های شمالی روریک برای حرکت به سوی جنوب و کیف به عنوان ناخدای آزاد وارنگی',
        tooltipHint: '-۲۲ جایگاه نزد روریک · +۴۵ نقره · +۷ رزم و دریانوردی',
        outcomeText:
          'با رد کردن سوگند فرمانبری و راندن کشتی‌هایت در پی آسکولد و دیر به سوی تنداب‌های دنیپر، ابروهای روریک در هم می‌رود. غنایم فراوانی در جنوب به دست می‌آوری، هرچند نگهبانان هولمگارد تو را رقیبی مستقل به شمار می‌آورند.',
      },
    },
  },
};
