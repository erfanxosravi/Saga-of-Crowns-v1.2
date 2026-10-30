import { GameEventFa } from '../i18n/eventsFa';
import { GameEvent, Religion } from '../types/game';

/**
 * Phase 1 Living Legends Encounters:
 * - Ragnar Lothbrok (Mentor / Sea-King / Seine 845 / Final Voyage & Snake-Pit Memorial)
 * - Lagertha / Hlaðgerðr (Shield-Wall on the Headland / Defense of Gaular's Independence)
 * - Floki — Hrafna-Flóki & Brother Aldwin (The Whispering Keel & Faith Tension / Three Ravens to Ísland)
 *
 * All encounters are gated by year, age, region/fame, and flags — never random spam.
 */
export const LEGEND_ENCOUNTER_EVENTS: GameEvent[] = [
  // =========================================================================
  // 1. RAGNAR LOTHBROK — ENCOUNTER I: THE BENCH-OATH AT HRÓARSKELD
  // =========================================================================
  {
    id: 'leg_enc_ragnar_01_bench',
    title: 'Hall of Legends · The Breeches-Lord’s Bench at Hróarskeld',
    category: 'Historical Set-Piece',
    iconType: 'ship',
    provenance: 'Legendary / Composite Saga',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'CONTESTED: Blends the Norse saga tradition of Ragnarr Loðbrók mustering independent war-crews in Zealand with the historical Danish commander Reginherus.',
    yearRange: [834, 852],
    ageMin: 15,
    regions: ['Denmark', 'Norway', 'Sweden', 'Baltic'],
    blockedByFlags: ['legend_ragnar_dead_865', 'leg_enc_ragnar_01_done'],
    weight: 18,
    text: 'Down by the tar-scented shingle of Hróarskeld, a tall sea-captain in boiled wolf-hide breeches sits astride an upturned oak strake, testing the balance of an ash-spear. Around him, young oarsmen whisper the name Ragnar Lothbrok. Catching your eye, he laughs — sharp and bright as ice cracking in spring — and motions to the empty bench beside his steersman.\n\n“King Horik counts toll-pennies at Hedeby while Frankish bell-towers sag with unguarded silver,” Ragnar says, offering you a horn of dark honey-mead. “Tell me your name, and tell me whether your hull rows for river-gold or stays tied to the goat-pasture.”',
    mildText:
      'Down by the tar-scented shingle of Hróarskeld, a tall sea-captain in weathered hide breeches sits astride an upturned oak strake, testing the balance of an ash-spear. Around him, oarsmen whisper the name Ragnar Lothbrok. Catching your eye, he laughs and motions to the empty bench beside his steersman.\n\n“King Horik counts toll-pennies at Hedeby while western rivers overflow with silver,” Ragnar says, offering you a horn of honey-mead. “Tell me your name, and whether your crew rows with us for the western estuaries.”',
    choices: [
      {
        id: 'swear_ragnar_bench_oath',
        label: 'Drink the horn and swear an oar-oath to sail in Ragnar’s western wake',
        tooltipHint: '+28 Standing with Ragnar · Sworn Oath · +15 Fame · Unlocks Seine 845 Encounter',
        outcomeText:
          'You drain the horn to the dregs and clasp Ragnar’s scarred forearm. “A bench-mate who does not blink!” he roars, striking your shoulder. “When the spring thaw clears the Sound, look for my black dragon-prow heading toward the Seine.”',
        effects: {
          fame: 15,
          stats: { honor: 6, charisma: 4 },
          skills: { seamanship: 4, combat: 3 },
          addFlags: ['leg_enc_ragnar_01_done', 'ragnar_sworn_benchmate'],
          legendStandingDelta: {
            legendId: 'ragnar_lothbrok',
            delta: 28,
            addOath: 'Swore the Oar-Bench Oath to sail with Ragnar Lothbrok’s western fleet',
            addOathFa: 'سوگند نیمکت پاروزنان برای همراهی با ناوگان غربی راگنار لُدبروک',
          },
        },
        chain: {
          eventId: 'leg_enc_ragnar_02_seine',
          delayYears: 2,
        },
      },
      {
        id: 'counsel_ragnar_tactics',
        label: 'Debate river-tides and Frankish bridge defenses with him as an equal captain',
        requiredSkill: { skill: 'seamanship', min: 22 },
        tooltipHint: '+18 Standing with Ragnar · +6 Seamanship · +5 Cunning',
        outcomeText:
          'Using a charred stick on a driftwood plank, you sketch how Frankish counts string iron chains across river narrows and how shallow-draft keels can portage around island forts. Ragnar’s eyes narrow with keen respect. “By Odin’s one eye, you think like a steersman, not a sheep-herder.”',
        effects: {
          fame: 12,
          stats: { cunning: 5 },
          skills: { seamanship: 6, diplomacy: 3 },
          addFlags: ['leg_enc_ragnar_01_done', 'ragnar_respected_counsel'],
          legendStandingDelta: {
            legendId: 'ragnar_lothbrok',
            delta: 18,
            addOath: 'Shared river-chart counsel with Ragnar Lothbrok at Hróarskeld',
            addOathFa: 'هم‌فکری و ترسیم نقشه رودهای فرانکستان با راگنار لُدبروک',
          },
        },
        chain: {
          eventId: 'leg_enc_ragnar_02_seine',
          delayYears: 2,
        },
      },
      {
        id: 'spurn_ragnar_boast',
        label: 'Scoff that your house bows to no breeches-lord and sails under its own banner',
        tooltipHint: '-22 Standing with Ragnar · Starts Rivalry · +8 Honor among proud freemen',
        outcomeText:
          'The dockside falls dead silent as you set the horn down untouched. Ragnar’s smile does not vanish, though his knuckles whiten on his spear-shaft. “Pride is a fine sail in fair weather,” he murmurs softly. “Let us see whose mast stands higher when the gale hits.”',
        effects: {
          fame: 10,
          stats: { honor: 8 },
          addFlags: ['leg_enc_ragnar_01_done', 'ragnar_proud_rival'],
          legendStandingDelta: {
            legendId: 'ragnar_lothbrok',
            delta: -22,
            addFeud: 'Spurned Ragnar Lothbrok’s mead-horn and challenged his renown at the docks',
            addFeudFa: 'رد کردن جام راگنار لُدبروک و به چالش کشیدن آوازه او در اسکله',
          },
        },
      },
    ],
  },

  // =========================================================================
  // 2. RAGNAR LOTHBROK — ENCOUNTER II: OARS ON THE SEINE (PARIS 845)
  // =========================================================================
  {
    id: 'leg_enc_ragnar_02_seine',
    title: 'Hall of Legends · The 120 Proves on the Seine & the Silver of Paris',
    category: 'Historical Set-Piece',
    iconType: 'sword',
    provenance: 'Frankish Annals',
    isSemiLegendary: false,
    sagaVsChronicleNote:
      'DOCUMENTED / CONTESTED: The Annales Bertiniani record Reginherus leading 120 ships to Paris in March 845 and extracting 7,000 pounds of silver from Charles the Bald.',
    yearRange: [842, 855],
    ageMin: 16,
    requiredFlags: ['leg_enc_ragnar_01_done'],
    blockedByFlags: ['legend_ragnar_dead_865', 'leg_enc_ragnar_02_done'],
    weight: 22,
    text: 'Morning river-fog curls around a hundred and twenty dragon-prows gliding up the winding Seine toward the island walls of Paris. On the eastern bank, half of King Charles the Bald’s Frankish army stands separated from the western division by the swollen river.\n\nRagnar Lothbrok stands at the steering-oar of his flagship, Brother Aldwin translating the frantic cries of Frankish heralds on the bridge. Ragnar turns to your hull: “Strike the smaller division on the bank before they cross, or press straight to the island gates to force the King’s silver scales?”',
    mildText:
      'Morning river-fog curls around a hundred and twenty dragon-prows gliding up the winding Seine toward the island walls of Paris. On the eastern bank, King Charles the Bald’s Frankish army stands divided by the river.\n\nRagnar Lothbrok stands at his steering-oar while the Northumbrian scribe Brother Aldwin translates the cries of Frankish envoys. Ragnar calls across the water to your ship: “Strike the eastern bank to break their line, or row straight to the island bridge to demand the 7,000-pound silver tribute?”',
    choices: [
      {
        id: 'seine_shieldwall_vanguard',
        label: 'Lead the vanguard ashore to rout the divided Frankish host and earn Ragnar’s arm-ring',
        tooltipHint: '+30 Standing · Gain Heirloom: Ragnar’s Ouroboros Arm-Ring · +45 Silver · +25 Fame',
        outcomeText:
          'Beaching your prow in the reeds, your shield-wall crashes into the isolated Frankish division before the rest of Charles’s host can cross the bridge! When King Charles’s envoys weigh out the 7,000 pounds of silver Danegeld, Ragnar draws a heavy twisted gold arm-ring stamped with the tail-biting serpent from his own wrist and locks it onto yours.',
        mildOutcomeText:
          'Beaching your prow in the reeds, your shield-wall outflanks the isolated Frankish division before the rest of Charles’s army can cross! When King Charles’s envoys weigh out the 7,000 pounds of silver Danegeld, Ragnar draws a heavy twisted gold arm-ring from his own wrist and locks it onto yours.',
        injuryChance: 0.14,
        injuryTraitId: 'battle_scarred',
        effects: {
          silver: 45,
          fame: 25,
          stats: { honor: 8, strength: 4 },
          skills: { combat: 6 },
          addHeirloomIds: ['ragnar_serpent_armring'],
          addFlags: ['leg_enc_ragnar_02_done', 'fought_beside_ragnar_paris'],
          legendStandingDelta: {
            legendId: 'ragnar_lothbrok',
            delta: 30,
            addGift: "Received Ragnar's Ouroboros Arm-Ring (Ormbaugr) at the Siege of Paris",
            addGiftFa: 'دریافت بازوبند زرین مارپیچ از دست راگنار لُدبروک در محاصره پاریس',
          },
        },
      },
      {
        id: 'seine_weigh_danegeld_aldwin',
        label: 'Stand with Brother Aldwin at the weigh-tables to audit the Frankish silver tribute',
        tooltipHint: '+18 Standing with Ragnar & Aldwin · +55 Silver · +5 Trade & Diplomacy',
        outcomeText:
          'Beside the quiet Northumbrian monk Brother Aldwin, you test every Frankish silver ingot with a chisel, catching the royal treasurers trying to pass lead-cored bars. Ragnar barks a laugh and tosses you a full leather sack of pure deniers.',
        effects: {
          silver: 55,
          fame: 16,
          skills: { trade: 5, diplomacy: 5 },
          addFlags: ['leg_enc_ragnar_02_done', 'aldwin_friend'],
          legendStandingDelta: {
            legendId: 'ragnar_lothbrok',
            delta: 18,
            addGift: 'Shared a chest of pure Frankish deniers from the 845 Paris Danegeld',
            addGiftFa: 'دریافت سهم نقره خالص فرانکی از باج بزرگ پاریس',
          },
        },
      },
      {
        id: 'seine_seize_abbey_solo',
        label: 'Break formation to plunder a river-abbey for yourself before Ragnar’s collectors arrive',
        tooltipHint: '+70 Silver · -25 Standing with Ragnar · Divergence if Paris anchor altered',
        outcomeText:
          'While Ragnar’s main fleet holds the island bridges, your crew slips upriver to empty a wealthy monastery treasury for your own chest. You return heavy with silver, though Ragnar’s steersmen glare at your low-riding hull and mark your breach of fleet discipline.',
        effects: {
          silver: 70,
          fame: 8,
          stats: { cunning: 5, honor: -6 },
          addFlags: ['leg_enc_ragnar_02_done'],
          divergenceNote:
            'At the 845 Siege of Paris, independent captains broke fleet discipline on the Seine to seize abbey silver ahead of Reginherus’s tribute collectors.',
          legendStandingDelta: {
            legendId: 'ragnar_lothbrok',
            delta: -25,
            addFeud: 'Broke fleet formation on the Seine to seize silver before the common division',
            addFeudFa: 'شکستن انضباط ناوگان در رود سن و برداشتن غنیمت پیش از تقسیم عمومی',
          },
        },
      },
    ],
  },

  // =========================================================================
  // 3. RAGNAR LOTHBROK — ENCOUNTER III: THE ELEGY OF THE SNAKE-PIT (865+)
  // =========================================================================
  {
    id: 'leg_enc_ragnar_04_elegy',
    title: 'Hall of Legends · Elegy of the Old Boar: Word from the Snake-Pit',
    category: 'Historical Set-Piece',
    iconType: 'skull',
    provenance: 'Legendary / Composite Saga',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'CONTESTED: Ragnarssona þáttr and Krákumál recount Ragnar’s death in King Ælla’s snake-pit, which the Anglo-Saxon Chronicle links to the 865 landing of the Great Heathen Army.',
    yearRange: [865, 872],
    ageMin: 15,
    requiredFlags: ['legend_ragnar_dead_865'],
    blockedByFlags: ['leg_enc_ragnar_04_elegy_done'],
    weight: 30,
    text: 'A salt-crusted skald steps into your hall out of the autumn rain, his cloak pinned with a black raven feather. The hearth-talk dies to a hush as he strikes his harp-frame and chants the news from Northumbria:\n\nRagnar Lothbrok is dead — shipwrecked with his two great knarrs on the English coast and cast by King Ælla into a pit of vipers after Aslaug’s unwoven shirt was stripped from his back. Yet before his voice failed, he sang: “How the little pigs would grunt if they knew how the old boar suffers!” Already Ivar, Björn, Halfdan, and Ubba are mustering the Great Army. How does your hall answer the passing of the Sea-King?',
    mildText:
      'A salt-crusted skald steps into your hall out of the autumn rain, his cloak pinned with a black raven feather. The hearth-talk dies to a hush as he chants the news from Northumbria:\n\nRagnar Lothbrok has fallen — shipwrecked on the English coast and condemned to die in King Ælla’s dungeon pit near York. Yet before the end, he sang his defiant verse: “How the little pigs would grunt if they knew how the old boar suffers!” Already his sons are mustering the Great Army. How does your hall commemorate the Sea-King?',
    choices: [
      {
        id: 'elegy_pour_bragafull_vengeance',
        label: 'Pour the Bragafull oath-horn and pledge ships to his sons’ vengeance against Northumbria',
        tooltipHint: '+30 Standing · +20 Fame · +8 Honor · Hefnd Call Answered',
        outcomeText:
          'You raise the great ceremonial horn before the hearth-fire and swear that King Ælla’s towers will answer in iron. The skald carves your oath into his tally-stick to carry straight to Ivar and Björn’s muster.',
        effects: {
          fame: 20,
          stats: { honor: 8, wyrd: 5 },
          hefndDelta: -12,
          addFlags: ['leg_enc_ragnar_04_elegy_done', 'ragnar_memorial_vengeance_sworn'],
          legendStandingDelta: {
            legendId: 'ragnar_lothbrok',
            delta: 30,
            addOath: 'Drank the Bragafull Memorial Horn to avenge Ragnar’s death upon King Ælla',
            addOathFa: 'نوشیدن جام سوگند (براگارفول) برای انتقام خون راگنار از شاه ائلا',
          },
        },
      },
      {
        id: 'elegy_raise_runestone',
        label: 'Spend 18 silver to raise a painted memorial runestone on your headland in Ragnar’s name',
        requiredSilver: 18,
        tooltipHint: '-18 Silver · +25 Fame · +6 Skaldcraft · Permanent Memorial',
        outcomeText:
          'Master rune-carvers chisel coiled serpents into red granite on your harbor headland, coloring the runes in bright vermilion so every passing longship reads how your hall honored Ragnar Lothbrok.',
        effects: {
          silver: -18,
          fame: 25,
          stats: { honor: 6, faith: 4 },
          skills: { skaldcraft: 6 },
          addFlags: ['leg_enc_ragnar_04_elegy_done', 'ragnar_runestone_raised'],
          legendStandingDelta: {
            legendId: 'ragnar_lothbrok',
            delta: 22,
            addGift: 'Raised a painted harbor runestone commemorating Ragnar Lothbrok’s saga',
            addGiftFa: 'برافراشتن سنگ رون‌نگار یادبود به نام راگنار لُدبروک در دماغه بندر',
          },
        },
      },
      {
        id: 'elegy_sober_reflection',
        label: 'Pour a quiet libation to the sea: “Even the greatest dragon-prow splinters on wyrd’s reef”',
        tooltipHint: '+6 Wyrd · +4 Law · Calm Stability (+5)',
        outcomeText:
          'You pour dark ale into the hearth-ash in solemn silence, reminding your hird that hubris and two oversized ships brought even Ragnar low, and that a wise ruler guards their own shores first.',
        effects: {
          stability: 5,
          stats: { wyrd: 6, cunning: 4 },
          skills: { law: 4 },
          addFlags: ['leg_enc_ragnar_04_elegy_done'],
          legendStandingDelta: {
            legendId: 'ragnar_lothbrok',
            delta: 8,
          },
        },
      },
    ],
  },

  // =========================================================================
  // 4. LAGERTHA (HLAÐGERÐR) — ENCOUNTER I: THE SHIELD-WALL OF GAULAR
  // =========================================================================
  {
    id: 'leg_enc_lagertha_01_headland',
    title: 'Hall of Legends · Hlaðgerðr’s Shield-Wall on the Gaular Headland',
    category: 'Historical Set-Piece',
    iconType: 'sword',
    provenance: 'Legendary / Composite Saga',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'LEGENDARY: Grounded in Saxo Grammaticus (Gesta Danorum Book IX), where Ladgerda commands her own Norwegian hall and outflanks enemy hosts with her winged shield-wall.',
    yearRange: [825, 868],
    ageMin: 15,
    regions: ['Norway', 'Denmark', 'British Isles'],
    blockedByFlags: ['leg_enc_lagertha_01_done'],
    weight: 18,
    text: 'High on a wind-scoured Norwegian headland above Gaular Fjord, thirty shield-maidens and veteran spearmen drill in a tight wedge while a chained hound and a tame mountain bear watch from the hall porch. At their head stands Hlaðgerðr — Lagertha — her braided hair glinting beneath a nasal helm, an ash-spear balanced lightly in her calloused hand.\n\nShe lowers her spear-point as you approach. “Many captains know how to push straight ahead like an ox,” she says, her voice clear over the surf. “Few know how to wheel a wing around the enemy’s blind shield-rim. Step into the ring and show me how your hird holds its line.”',
    choices: [
      {
        id: 'lagertha_spar_wing_drill',
        label: 'Step into the practice ring and drill the flanking maneuver spear-to-shield with her',
        tooltipHint: '+24 Standing with Lagertha · +7 Combat · +4 Strength · Unlocks Gaular Defense',
        outcomeText:
          'For three hours in the salt wind, Hlaðgerðr tests your footwork, showing how to feint a retreat on the left flank so the right wing can pivot behind the enemy’s locked shields. Bruised but grinning, you earn her nod of iron approval.',
        effects: {
          fame: 14,
          stats: { strength: 4, honor: 5 },
          skills: { combat: 7 },
          addFlags: ['leg_enc_lagertha_01_done', 'lagertha_trained_wing'],
          legendStandingDelta: {
            legendId: 'lagertha_shieldmaiden',
            delta: 24,
            addOath: 'Drilled the Gaular flanking shield-wall beside Hlaðgerðr (Lagertha)',
            addOathFa: 'هم‌تمرینی و آموختن آرایش جناحی دیوار سپر در تالار لاگرتا',
          },
        },
        chain: {
          eventId: 'leg_enc_lagertha_02_usurper',
          delayYears: 2,
        },
      },
      {
        id: 'lagertha_pledge_odal_alliance',
        label: 'Swear a mutual pact to defend independent fjord-halls against encroaching kings',
        tooltipHint: '+28 Standing with Lagertha · +5 Diplomacy · +6 Stability',
        outcomeText:
          'Over carved oak boundary-stakes, you and Hlaðgerðr clasp wrists and swear that neither petty king nor greedy tribute-collector shall strip the odal rights of your halls without facing both your fleets.',
        effects: {
          fame: 16,
          stability: 6,
          stats: { charisma: 5, honor: 6 },
          skills: { diplomacy: 5, law: 4 },
          addFlags: ['leg_enc_lagertha_01_done', 'lagertha_odal_ally'],
          legendStandingDelta: {
            legendId: 'lagertha_shieldmaiden',
            delta: 28,
            addOath: 'Swore the Odal Headland Pact of mutual defense with Lagertha of Gaular',
            addOathFa: 'پیمان دفاع متقابل از استقلال زمین‌های اودال با لاگرتا در گولار',
          },
        },
        chain: {
          eventId: 'leg_enc_lagertha_02_usurper',
          delayYears: 2,
        },
      },
      {
        id: 'lagertha_question_woman_jarl',
        label: 'Remark coldly that a hall without a male lord invites usurpers',
        tooltipHint: '-24 Standing with Lagertha · Holmgang Bruise (-8 Health) · +4 Cunning',
        outcomeText:
          'Before your sentence finishes, Hlaðgerðr’s ash-spear butt sweeps your ankle and plants its iron socket an inch from your throat. “Remember that speed when you speak of my high-seat,” she says coolly, stepping back.',
        effects: {
          stats: { health: -8, cunning: 4 },
          skills: { combat: 2 },
          addFlags: ['leg_enc_lagertha_01_done'],
          legendStandingDelta: {
            legendId: 'lagertha_shieldmaiden',
            delta: -24,
            addFeud: 'Insulted Hlaðgerðr’s sole rule at Gaular and was knocked flat on the headland',
            addFeudFa: 'توهین به فرمانروایی مستقل لاگرتا در گولار و مغلوب شدن در برابر نیزه او',
          },
        },
      },
    ],
  },

  // =========================================================================
  // 5. LAGERTHA (HLAÐGERÐR) — ENCOUNTER II: THE SPEAR-JUDGMENT OF GAULAR
  // =========================================================================
  {
    id: 'leg_enc_lagertha_02_usurper',
    title: 'Hall of Legends · The Spear-Judgment of Hlaðgerðr’s Hall',
    category: 'Historical Set-Piece',
    iconType: 'crown',
    provenance: 'Legendary / Composite Saga',
    isSemiLegendary: true,
    sagaVsChronicleNote:
      'LEGENDARY: In Saxo Grammaticus Book IX, after aiding Ragnar with 120 ships, Ladgerda overthrows a usurping consort at home to rule her Norwegian earldom alone.',
    yearRange: [835, 873],
    ageMin: 16,
    requiredFlags: ['leg_enc_lagertha_01_done'],
    blockedByFlags: ['leg_enc_lagertha_02_done'],
    weight: 20,
    text: 'A swift six-oared boat beaches at your wharf bearing Hlaðgerðr’s token. While her ships were away answering the wars in the Danish straits, an ambitious claimant and his armed retainers seized the outer palisade of Gaular, demanding that she yield her jarldom’s high-seat.\n\nWhen you arrive at the fjord, Hlaðgerðr stands in a dark wool cloak over mail, a forged spearhead concealed beneath her sash just as Saxo’s chronicle tells. “Tonight I reclaim my hall,” she says quietly. “Will your shields lock with mine at the gate?”',
    choices: [
      {
        id: 'lagertha_storm_gate_together',
        label: 'Lock shields with Hlaðgerðr’s veterans and storm the usurper’s palisade',
        tooltipHint: '+32 Standing · Gain Heirloom: Wing-Spear of Gaular · +1 Farm · +24 Fame',
        outcomeText:
          'As your hird batters the outer timber gate, Hlaðgerðr confronts the usurper inside the feast-hall and strikes him down with the hidden spearhead! Victorious on her high-seat, she presses her silver-inlaid ash war-spear (Geirr Hlaðgerðar) into your hand and grants your house an odal farmstead in the fjord.',
        mildOutcomeText:
          'As your hird batters the outer timber gate, Hlaðgerðr confronts the usurper inside the feast-hall and overthrows him in a single decisive stroke! Victorious on her high-seat, she gifts you her silver-inlaid war-spear (Geirr Hlaðgerðar) and grants your house an odal farmstead in the fjord.',
        effects: {
          fame: 24,
          landFarms: 1,
          stats: { honor: 8, strength: 4 },
          skills: { combat: 6 },
          addHeirloomIds: ['lagertha_hlathgerd_spear'],
          addFlags: ['leg_enc_lagertha_02_done', 'lagertha_sworn_champion'],
          legendStandingDelta: {
            legendId: 'lagertha_shieldmaiden',
            delta: 32,
            addGift: 'Gifted the Wing-Spear of Gaular (Geirr Hlaðgerðar) and an odal farmstead',
            addGiftFa: 'دریافت نیزه بال‌دار گولار (یادگار لاگرتا) و یک مزرعه موروثی در آبدره',
          },
        },
      },
      {
        id: 'lagertha_thing_judgment',
        label: 'Invoke the Frostathing law-code to outlaw the usurper’s men without bloodshed',
        requiredSkill: { skill: 'law', min: 20 },
        tooltipHint: '+20 Standing · +30 Silver · +6 Law & Diplomacy',
        outcomeText:
          'Standing before the assembled bondi with law-runes in hand, you declare the usurper’s retainers outlaws without wergild if they do not lay down their axes before sundown. Half his garrison deserts on the spot, leaving Hlaðgerðr undisputed mistress of Gaular.',
        effects: {
          silver: 30,
          fame: 18,
          stats: { cunning: 5, honor: 5 },
          skills: { law: 6, diplomacy: 5 },
          addFlags: ['leg_enc_lagertha_02_done'],
          legendStandingDelta: {
            legendId: 'lagertha_shieldmaiden',
            delta: 20,
            addOath: 'Upheld Hlaðgerðr’s sovereign rule before the Norwegian Thing assembly',
            addOathFa: 'تثبیت قانونی فرمانروایی مستقل لاگرتا در شورای ثینگ نروژ',
          },
        },
      },
    ],
  },

  // =========================================================================
  // 6. FLOKI & BROTHER ALDWIN — ENCOUNTER I: THE OAK-KEEL & FAITH TENSION
  // =========================================================================
  {
    id: 'leg_enc_floki_01_keel',
    title: 'Hall of Legends · Three Ravens & the Monk’s Quill at Smjörsund',
    category: 'Historical Set-Piece',
    iconType: 'ship',
    provenance: 'Icelandic Family Saga',
    isSemiLegendary: false,
    sagaVsChronicleNote:
      'DOCUMENTED: Landnámabók records Flóki Vilgerðarson building his ocean vessel and holding a great blót sacrifice at Smjörsund to consecrate three ravens for his voyage to Iceland.',
    yearRange: [846, 875],
    ageMin: 15,
    regions: ['Norway', 'Denmark', 'British Isles', 'North Atlantic'],
    blockedByFlags: ['leg_enc_floki_01_done'],
    weight: 19,
    text: 'In a smoky boathouse by the sound, the master shipwright Floki Vilgerðarson planes a curved oak stem-post with an adze, his eyes bright with salt-fever. Beside a wicker cage holding three pitch-black ravens stands Brother Aldwin, the captive Northumbrian scribe, carefully copying a Latin star-table onto scraped sheepskin.\n\nFloki points his iron adze at the monk’s parchment. “Tell them, Aldwin! Your nailed carpenter-god sits behind stone walls, while Huginn and Muninn fly through the storm-wrack where no parchment can survive!”\n\nAldwin looks up gently. “And yet, Floki, the same North Star holds steady above your mast and my monastery roof.” Both men turn to you to judge their wager and fund the final strakes of the western keel.',
    choices: [
      {
        id: 'floki_honor_ravens_blot',
        label: 'Contribute 15 silver to Floki’s Smjörsund blót and consecrate the three ravens to Odin',
        requiredSilver: 15,
        tooltipHint: '-15 Silver · +28 Standing with Floki · +6 Seamanship & Craft · Unlocks Iceland Voyage',
        outcomeText:
          'You lay fifteen silver pieces upon the stone cairn at Smjörsund as Floki chants over the three ravens. Overjoyed by your devotion to the old ways, Floki teaches your carpenters how toscarf supple ocean-strakes that never split in heavy Atlantic swells.',
        effects: {
          silver: -15,
          fame: 16,
          stats: { faith: 8, wyrd: 5 },
          skills: { seamanship: 6, craft: 6 },
          addFlags: ['leg_enc_floki_01_done', 'floki_blot_patron'],
          legendStandingDelta: {
            legendId: 'floki_raven_sailor',
            delta: 28,
            addOath: 'Funded the Smjörsund Blót and consecrated Hrafna-Flóki’s three ravens',
            addOathFa: 'مشارکت در آیین بلوت اسمیورسوند و تقدیس سه زاغ سیاه هرافنا-فلوکی',
          },
        },
        chain: {
          eventId: 'leg_enc_floki_02_iceland',
          delayYears: 2,
        },
      },
      {
        id: 'floki_bridge_aldwin_stars',
        label: 'Declare that a wise navigator uses both Odin’s ravens and Brother Aldwin’s star-tables',
        tooltipHint: '+18 Standing with both Floki & Aldwin · +6 Seamanship · +5 Cunning',
        outcomeText:
          'Floki grumbles into his beard before letting out a high, cackling laugh, while Brother Aldwin smiles in quiet gratitude. Together they carve a wooden bearing-dial marked with both runic wind-quarters and Northumbrian solstice notches.',
        effects: {
          fame: 14,
          stats: { cunning: 5, wyrd: 4 },
          skills: { seamanship: 6, diplomacy: 4 },
          addFlags: ['leg_enc_floki_01_done', 'floki_aldwin_reconciled'],
          legendStandingDelta: {
            legendId: 'floki_raven_sailor',
            delta: 18,
            addOath: 'Joined Hrafna-Flóki’s raven-lore with Brother Aldwin’s star-reckoning',
            addOathFa: 'پیوند دادن دانش زاغ‌های فلوکی با ستاره‌شناسی برادر آلدوین',
          },
        },
        chain: {
          eventId: 'leg_enc_floki_02_iceland',
          delayYears: 2,
        },
      },
      {
        id: 'floki_side_with_aldwin_christ',
        label: 'Defend Brother Aldwin’s Christian learning and dismiss Floki’s ravens as mere carrion-birds',
        tooltipHint: '+24 Standing with Aldwin · -20 Standing with Floki · +6 Diplomacy',
        outcomeText:
          'Floki’s face darkens like a thunderhead as he snatches up his cage of ravens and spits into the shavings. Brother Aldwin gifts you an illuminated Latin travel-charter that wins warm welcome in Christian ports, though Floki vows you shall see what his ravens find.',
        effects: {
          fame: 10,
          stats: { faith: 5, charisma: 4 },
          skills: { diplomacy: 6, trade: 4 },
          addFlags: ['leg_enc_floki_01_done', 'aldwin_sworn_protector'],
          legendStandingDelta: {
            legendId: 'brother_aldwin_scribe',
            delta: 24,
            addOath: 'Protected Brother Aldwin’s scriptorium parchments at the boathouse debate',
            addOathFa: 'پشتیبانی از دانش و دست‌نوشته‌های برادر آلدوین در مناظره کارگاه کشتی‌سازی',
          },
        },
      },
    ],
  },

  // =========================================================================
  // 7. FLOKI — ENCOUNTER II: THREE RAVENS IN THE WESTERN MIST (ICELAND)
  // =========================================================================
  {
    id: 'leg_enc_floki_02_iceland',
    title: 'Hall of Legends · The Third Raven & the Drift-Ice of Ísland',
    category: 'Historical Set-Piece',
    iconType: 'ship',
    provenance: 'Icelandic Family Saga',
    isSemiLegendary: false,
    sagaVsChronicleNote:
      'DOCUMENTED: Landnámabók details Flóki releasing his three ravens west of the Faroes, landing at Vatnsfjörður, and naming Ísland after viewing a fjord choked with drift-ice.',
    yearRange: [860, 885],
    ageMin: 16,
    requiredFlags: ['leg_enc_floki_01_done'],
    blockedByFlags: ['leg_enc_floki_02_done'],
    weight: 22,
    text: 'Days west of the Faroes, cold grey fog swallows sea and sky alike. Aboard the creaking oak hull, Floki Vilgerðarson opens the wicker latch. The first raven circles and flies back toward the Faroes; the second rises, sees only endless foam, and drops back onto the gunwale.\n\nWhispering a prayer to the old gods while Brother Aldwin steadies the steering-oar, Floki looses the third raven. It shoots straight forward through the mist! Hours later, black volcanic headlands and steaming valleys rise from the sea. Before parting ways in the newly found bay of Reykjavik, Hrafna-Flóki presses a whalebone-framed sunstone crystal into your palm.',
    choices: [
      {
        id: 'floki_accept_sunstone_discover',
        label: 'Accept Hrafna-Flóki’s Sunstone & chart the sea-lane to Reykjavik for your dynasty',
        tooltipHint: '+30 Standing with Floki · Gain Heirloom: Floki’s Sunstone · Discovers Reykjavik · +8 Seamanship',
        outcomeText:
          'Holding the cleaved Icelandic spar up to the overcast sky, you watch the twin shadows align to reveal the hidden sun. With Floki’s Raven-Compass and Sunstone in your sea-chest, the perilous North Atlantic crossing is forever opened to your ships!',
        effects: {
          fame: 28,
          stats: { wyrd: 6, cunning: 4 },
          skills: { seamanship: 8, craft: 4 },
          addHeirloomIds: ['floki_raven_lodestone'],
          addFlags: ['leg_enc_floki_02_done', 'legend_floki_discovered_iceland'],
          legendStandingDelta: {
            legendId: 'floki_raven_sailor',
            delta: 30,
            addGift: "Gifted Hrafna-Flóki's Sunstone & Raven-Compass (Sólarsteinn) off the coast of Iceland",
            addGiftFa: 'دریافت سنگ خورشید و قطب‌نمای زاغ از دست هرافنا-فلوکی در سواحل ایسلند',
          },
        },
      },
      {
        id: 'floki_help_winter_hay',
        label: 'Warn Floki’s crew not to neglect cutting winter hay while fishing the salmon fjords',
        tooltipHint: '+24 Standing · +20 Food Stores · +6 Farming · Historical Divergence',
        outcomeText:
          'Remembering how northern winters punish careless settlers, you set half the oarsmen scything meadow-grass at Vatnsfjörður while the rest net salmon. Thanks to your foresight, Floki’s livestock survive the spring pack-ice!',
        effects: {
          foodStores: 20,
          fame: 22,
          skills: { farming: 6, seamanship: 5 },
          addHeirloomIds: ['floki_raven_lodestone'],
          addFlags: ['leg_enc_floki_02_done', 'legend_floki_discovered_iceland'],
          divergenceNote:
            'Warned by a fellow captain at Vatnsfjörður, Hrafna-Flóki stored ample winter hay so his cattle survived the first Icelandic winter.',
          legendStandingDelta: {
            legendId: 'floki_raven_sailor',
            delta: 24,
            addOath: 'Saved Hrafna-Flóki’s expedition cattle during the first winter at Vatnsfjörður',
            addOathFa: 'نجات دام‌ها و آذوقه زمستانی کاروان فلوکی در نخستین زمستان ایسلند',
          },
        },
      },
    ],
  },
];

export const LEGEND_ENCOUNTERS_FA: Record<string, GameEventFa> = {
  leg_enc_ragnar_01_bench: {
    title: 'تالار افسانه‌ها · نیمکت راگنار لُدبروک در بندر راسکیله',
    text: 'در ساحل قیراندود راسکیله، ناخدایی بلندبالا با شلواری از پوست گرگِ جوشانده در قیر بر تخته بلوط واژگونی نشسته و تعادل نیزه‌ای از چوب زبان‌گنجشک را می‌آزماید. پاروزنان جوان پیرامونش نام «راگنار لُدبروک» را زمزمه می‌کنند. او با دیدن تو، خنده‌ای تیز و درخشان چون شکستن یخ در بهار سر می‌دهد و به نیمکت خالی کنار سکان‌دارش اشاره می‌کند.\n\nراگنار شاخ پر از مید (شراب عسل) را به سویت می‌گیرد و می‌گوید: «شاه هوریک در هدبی سکه‌های عوارض می‌شمارد، در حالی که برج‌های ناقوس فرانکستان زیر بار نقره‌های بی‌نگهبان خم شده‌اند! نامت را بگو و روشن کن که کشتی‌ات برای طلای رودهای غرب پارو می‌زند یا به چراگاه بزها بسته مانده است؟»',
    mildText:
      'در ساحل قیراندود راسکیله، ناخدایی بلندبالا با شلوار چرمی کهنه بر تخته بلوطی نشسته و تعادل نیزه‌اش را می‌آزماید. پاروزنان نام «راگنار لُدبروک» را زمزمه می‌کنند. او با خنده شاخ مید را به سویت می‌گیرد: «شاه هوریک در هدبی سکه‌های عوارض می‌شمارد، در حالی که رودهای غرب پر از نقره است! آیا با ناوگان ما به سوی غرب بادبان می‌کشی؟»',
    sagaVsChronicleNote:
      'مورد مناقشه (CONTESTED): پیوندی میان روایت حماسه‌های نورس از راگنار لُدبروک و شخصیت تاریخی «رگین‌هروس» در سالنامه‌های فرانکی.',
    choices: {
      swear_ragnar_bench_oath: {
        label: 'سر کشیدن جام و یاد کردن سوگند همراهی با ناوگان غربی راگنار',
        tooltipHint: '+۲۸ جایگاه نزد راگنار · ثبت سوگند · +۱۵ شهرت · گشودن فصل محاصره پاریس (۸۴۵)',
        outcomeText:
          'جام را تا قطره آخر سر می‌کشی و ساعد زخم‌خورده راگنار را می‌فشاری. او با غرشی شادمانه بر شانه‌ات می‌کوبد: «هم‌نیمکتی که پلک نمی‌زند! هنگامی که یخ‌های بهار در تنگه آب شد، چشم به راه سردیس اژدهای سیاه من به سوی رود سن باش.»',
      },
      counsel_ragnar_tactics: {
        label: 'بحث هم‌طراز با او درباره جزرومد رودها و زنجیر پل‌های فرانکستان',
        tooltipHint: '+۱۸ جایگاه نزد راگنار · +۶ دریانوردی · +۵ ذکاوت',
        outcomeText:
          'با چوبی سوخته بر تخته‌ای ساحلی، نشان می‌دهی چگونه کنت‌های فرانک زنجیرهای آهنی بر تنگناهای رود می‌بندند و چگونه می‌توان کشتی‌های کم‌عمق را از کنار جزیره‌ها عبور داد. چشمان راگنار از تحسین برق می‌زند: «به تک‌چشم اودین قسم، تو چون سکان‌داران بزرگ می‌اندیشی!»',
      },
      spurn_ragnar_boast: {
        label: 'پاسخ مغرورانه که خاندان تو فرمانبر هیچ سروری نیست و زیر درفش خود بادبان می‌کشد',
        tooltipHint: '-۲۲ جایگاه نزد راگنار · آغاز رقابت · +۸ شرافت نزد آزادمردان',
        outcomeText:
          'سکوتی سنگین بر اسکله سایه می‌افکند هنگامی که شاخ نوشیدنی را دست‌نخورده بر زمین می‌گذاری. لبخند راگنار محو نمی‌شود، اما انگشتانش بر چوب نیزه سپید می‌گردد: «غرور بادبان زیبایی در هوای آرام است؛ ببینیم در روز طوفان دکل کدام‌یک از ما بالاتر می‌ماند.»',
      },
    },
  },

  leg_enc_ragnar_02_seine: {
    title: 'تالار افسانه‌ها · ۱۲۰ سردیس اژدها در رود سن و نقره‌های پاریس',
    text: 'مه بامدادی پیرامون صد و بیست کشتی اژدهاپیکر که در پیچ‌وخم رود سن به سوی دیوارهای جزیره‌ای پاریس می‌لغزند، حلقه زده است. در کرانه شرقی، نیمی از سپاه شارل تاس (پادشاه فرانک باختری) به واسطه رود خروشان از نیمه دیگر جدا افتاده است.\n\nراگنار لُدبروک کنار سکان کشتی سرفرماندهی ایستاده و «برادر آلدوین» فریادهای هراسان جارچیان فرانک را از فراز پل ترجمه می‌کند. راگنار رو به کشتی تو فریاد می‌زند: «نخست بر لشکر جداافتاده در ساحل بتازیم، یا یکسره به دروازه‌های جزیره هجوم ببریم تا ترازوی نقره‌های پادشاه را به کار اندازیم؟»',
    mildText:
      'مه بامدادی پیرامون صد و بیست کشتی در رود سن به سوی پاریس حلقه زده است و سپاه شارل تاس در دو سوی رود جدا افتاده‌اند. راگنار لُدبروک در حالی که برادر آلدوین پیام فرستادگان فرانک را ترجمه می‌کند، رو به کشتی تو فریاد می‌زند: «نخست صف ساحل شرقی را بشکنیم یا مستقیم پای پل جزیره برویم و باج ۷۰۰۰ پوند نقره را مطالبه کنیم؟»',
    sagaVsChronicleNote:
      'مستند / مورد مناقشه: سالنامه فرانکی سن‌برتین محاصره پاریس در مارس ۸۴۵ به رهبری رگین‌هروس و پرداخت ۷۰۰۰ پوند نقره توسط شارل تاس را ثبت کرده است.',
    choices: {
      seine_shieldwall_vanguard: {
        label: 'رهبری طلایه‌داران در ساحل برای درهم‌شکستن سپاه فرانک و دریافت بازوبند راگنار',
        tooltipHint: '+۳۰ جایگاه · دریافت میراث: بازوبند زرین مارپیچ راگنار · +۴۵ نقره · +۲۵ شهرت',
        outcomeText:
          'دماغه کشتی را به نیزار ساحل می‌کوبی و دیوار سپرهایت پیش از آن‌که دیگر نیروهای شارل بتوانند از پل بگذرند، جناح شرقی فرانک‌ها را در هم می‌شکند! هنگامی که فرستادگان شارل تاس ۷۰۰۰ پوند نقره دانگلد را وزن می‌کنند، راگنار بازوبند زرین و سنگینِ خود با نقش اژدهای دم‌به‌دهان را از مچ باز می‌کند و بر ساعد تو می‌بندد.',
        mildOutcomeText:
          'دماغه کشتی را به ساحل می‌رسانی و دیوار سپرهایت جناح شرقی سپاه فرانک را پیش از رسیدن کمکی‌ها محاصره و وادار به عقب‌نشینی می‌کند! هنگام تحویل ۷۰۰۰ پوند باج نقره، راگنار بازوبند زرین مارپیچ خود را از مچ باز کرده و به پاس دلیری بر ساعد تو می‌بندد.',
      },
      seine_weigh_danegeld_aldwin: {
        label: 'ایستادن در کنار برادر آلدوین پای میز ترازوها برای سنجش عیار شمش‌های نقره فرانکی',
        tooltipHint: '+۱۸ جایگاه نزد راگنار و آلدوین · +۵۵ نقره · +۵ تجارت و دیپلماسی',
        outcomeText:
          'در کنار راهب نورثامبریایی، برادر آلدوین، هر شمش نقره فرانکی را با اسکنه می‌آزمایی و مچ خزانه‌داران شاه را که می‌خواستند شمش‌های سرب‌اندود تحویل دهند باز می‌کنی! راگنار قاه‌قاه می‌خندد و کیسه‌ای پر از سکه‌های نقره خالص به سویت می‌اندازد.',
      },
      seine_seize_abbey_solo: {
        label: 'جدا شدن از صف ناوگان برای غارت تنهایی یک صومعه ساحلی پیش از رسیدن مأموران راگنار',
        tooltipHint: '+۷۰ نقره · -۲۵ جایگاه نزد راگنار · ثبت انحراف تاریخی در صورت تغییر نظم سن',
        outcomeText:
          'در حالی که ناوگان اصلی راگنار پل‌های جزیره را محاصره کرده، کشتی تو به بالادست رود می‌لغزد و خزانه صومعه‌ای ثروتمند را یکجا برای خودت خالی می‌کند. با کشتی سنگین از نقره بازمی‌گردی، اما سکان‌داران راگنار با خشم به پیمان‌شکنی تو در نظم ناوگان می‌نگرند.',
        divergenceNote:
          'در محاصره سال ۸۴۵ پاریس، ناخدایان مستقل انضباط ناوگان را در رود سن شکستند و پیش از تقسیم باج رگین‌هروس، خزانه صومعه‌ها را تصاحب کردند.',
      },
    },
  },

  leg_enc_ragnar_04_elegy: {
    title: 'تالار افسانه‌ها · سوگ‌سرود گراز پیر: خبر چاه مارهای نورثامبریا',
    text: 'اسکالدی نمک‌سود از دل باران پاییزی به درون تالارت گام می‌نهد؛ بر شنل او پرِ زاغ سیاهی سنجاق شده است. همهمه تالار فرو می‌نشیند هنگامی که او بر قاب چنگ می‌کوبد و خبر نورثامبریا را به آواز می‌خواند:\n\n«راگنار لُدبروک درگذشت!» — دو کشتی بزرگش در طوفان سواحل انگلستان در هم شکست و شاه ائلا پس از بیرون کشیدن پیراهن بی‌درز اسلاگ از تنش، او را در چاه افعی‌ها افکند. اما راگنار پیش از خاموشی صدا، با خنده سرود خواند: «بچه‌گرازها چه نعره‌ای خواهند کشید اگر بدانند گراز پیر چه می‌کشد!» اکنون ایوار، بیورن، هالفدان و اوبّا در حال گردآوری ارتش بزرگ هستند. تالار تو چگونه به سوگ پادشاه دریا پاسخ می‌دهد؟',
    mildText:
      'اسکالدی از دل باران پاییزی به درون تالارت گام می‌نهد و در سکوت حاضران خبر نورثامبریا را می‌خواند:\n\n«راگنار لُدبروک جان باخت!» — کشتی‌های او در ساحل انگلستان شکست و در سیاه‌چال شاه ائلا در نزدیکی یورک جان سپرد، در حالی که تا آخرین دم می‌خواند: «بچه‌گرازها چه نعره‌ای خواهند کشید اگر بدانند گراز پیر چه می‌کشد!» اکنون پسرانش ارتش بزرگ را گرد می‌آورند. تالار تو چگونه یاد او را گرامی می‌دارد؟',
    sagaVsChronicleNote:
      'مورد مناقشه (CONTESTED): منظومه پسران راگنار و سرود کراکومال مرگ او در چاه مارهای شاه ائلا را روایت می‌کنند که در وقایع‌نامه آنگلو-ساکسون به حمله سال ۸۶۵ ارتش بزرگ پیوند می‌خورد.',
    choices: {
      elegy_pour_bragafull_vengeance: {
        label: 'پر کردن شاخ سوگند (براگارفول) و پیمان بستن برای همراهی با انتقام پسرانش در انگلستان',
        tooltipHint: '+۳۰ جایگاه · +۲۰ شهرت · +۸ شرافت · کاهش بار بدهی هِفند',
        outcomeText:
          'شاخ بزرگ آیینی را در برابر آتش تالار بالا می‌بری و سوگند یاد می‌کنی که برج‌های شاه ائلا پاسخ خود را با پولاد خواهند گرفت. اسکالد سوگند تو را بر چوب‌خط خود حک می‌کند تا یکسره به اردوگاه ایوار و بیورن برساند.',
      },
      elegy_raise_runestone: {
        label: 'هزینه ۱۸ سکه نقره برای برافراشتن سنگ رون‌نگار رنگ‌آمیزی‌شده در دماغه بندر به یاد راگنار',
        tooltipHint: '-۱۸ نقره · +۲۵ شهرت · +۶ شاعری · یادبود ماندگار',
        outcomeText:
          'استادان رون‌نگار، نقش مارهای درهم‌تنیده را بر خاراگوش سرخِ دماغه بندر می‌تراشند و حروف رون را با شنگرف درخشان رنگ می‌زنند تا هر کشتی گذری ببیند تالار تو چگونه یاد راگنار لُدبروک را گرامی داشته است.',
      },
      elegy_sober_reflection: {
        label: 'ریختن جرعه‌ای آرام به نام دریا: «حتی بزرگ‌ترین کشتی اژدها نیز بر صخره سرنوشت می‌شکند»',
        tooltipHint: '+۶ ویرد (سرنوشت) · +۴ قانون‌دانی · +۵ ثبات قلمرو',
        outcomeText:
          'در سکوتی سنگین جرعه‌ای آبجو بر خاکستر آتشدان می‌ریزی و به یارانت یادآور می‌شوی که غرور و دو کشتیِ بیش‌ازحد بزرگ حتی راگنار را به کام مرگ کشاند، و فرمانروای خردمند نخست سواحل خود را استوار می‌دارد.',
      },
    },
  },

  leg_enc_lagertha_01_headland: {
    title: 'تالار افسانه‌ها · دیوار سپر لاگرتا (هلادگرد) بر دماغه گولار',
    text: 'بر فراز دماغه‌ای بادگیر در آبدره گولارِ نروژ، سی بانوی سپردار و نیزه‌دار کهنه‌کار در آرایشی گوه‌شکل تمرین می‌کنند، در حالی که سگی شکاری و خرسی کوهی در ایوان تالار نگهبانی می‌دهند. در پیشاپیش آنان «هلادگرد» — لاگرتا — ایستاده است؛ گیسوان بافته‌اش از زیر کلاهخود می‌درخشد و نیزه‌ای از چوب زبان‌گنجشک در دستان پینه‌بسته‌اش تعادل دارد.\n\nبا نزدیک شدن تو، نوک نیزه‌اش را پایین می‌آورد و می‌گوید: «بسیاری از ناخدایان فقط بلدند مثل گاو نر مستقیم به جلو شاخ بزنند؛ اما اندکی می‌دانند چگونه جناح سپاه را به دور نقطه کور سپر دشمن بچرخانند. به میدان بیا و نشان بده سپاهت چگونه خط خود را نگه می‌دارد!»',
    sagaVsChronicleNote:
      'افسانه‌ای (LEGENDARY): بر پایه کتاب نهم ساکسو گراماتیکوس که لادگردا را فرمانده تالار مستقل خود در نروژ و استاد چرخش به جناح دشمن معرفی می‌کند.',
    choices: {
      lagertha_spar_wing_drill: {
        label: 'ورود به حلقه تمرین و آزمودن مانور چرخش جناحی، نیزه در برابر سپر، دوشادوش لاگرتا',
        tooltipHint: '+۲۴ جایگاه نزد لاگرتا · +۷ مهارت رزم · +۴ قدرت بدنی · گشودن فصل دفاع از گولار',
        outcomeText:
          'سه ساعت تمام در باد نمک‌آلود، لاگرتا گام‌های تو را می‌آزماید و نشان می‌دهد چگونه با عقب‌نشینی ساختگی در جناح چپ، جناح راست را به پشت سپرهای قفل‌شده دشمن برگردانی. با شانه‌های کوفته اما لبخندی پیروزمند، تحسین آهنین او را برمی‌انگیزی.',
      },
      lagertha_pledge_odal_alliance: {
        label: 'بستن پیمان دفاع متقابل برای حفظ استقلال تالارهای آبدره در برابر پادشاهان زیاده‌خواه',
        tooltipHint: '+۲۸ جایگاه نزد لاگرتا · +۵ دیپلماسی · +۶ ثبات قلمرو',
        outcomeText:
          'بر فراز تیرک‌های مرزیِ کنده‌کاری‌شده، مچ دست لاگرتا را می‌فشاری و هم‌قسم می‌شوید که هیچ شاهک یا باج‌گیر طمع‌کاری نتواند حق مالکیت موروثی (اودال) تالارهای شما را بدون روبه‌رو شدن با هر دو ناوگان سلب کند.',
      },
      lagertha_question_woman_jarl: {
        label: 'طعنه زدن که تالاری بدون سرورِ مرد، طمع غاصبان را برمی‌انگیزد',
        tooltipHint: '-۲۴ جایگاه نزد لاگرتا · کوفتگی در رزم (-۸ سلامتی) · +۴ ذکاوت',
        outcomeText:
          'پیش از آن‌که جمله‌ات تمام شود، تهِ نیزه لاگرتا قوزک پایت را می‌روبد و تیغه پولادینش در یک انگشتی گلویت می‌ایستد! او آرام عقب می‌رود و می‌گوید: «هرگاه خواستی درباره تخت فرمانروایی من سخن بگویی، شتاب این نیزه را به یاد بیاور.»',
      },
    },
  },

  leg_enc_lagertha_02_usurper: {
    title: 'تالار افسانه‌ها · داوری نیزه در تالار لاگرتا',
    text: 'قایقی تندرو و شش‌پارویی با نشان لاگرتا به اسکله‌ات می‌رسد. هنگامی که کشتی‌های او برای جنگ‌های تنگه دانمارک به جنوب رفته بودند، مدعی جاه‌طلبی با جنگجویان مسلح حصار بیرونی گولار را تصرف کرده و خواهان تسلیم تخت فرمانروایی او شده است.\n\nوقتی به آبدره می‌رسی، لاگرتا با شنلی از پشم تیره بر روی زره ایستاده و درست همان‌گونه که در تاریخ ساکسو آمده، سرنیزه‌ای پولادین زیر شال کمرش پنهان کرده است. او آرام می‌گوید: «امشب تالارم را بازپس می‌گیرم؛ آیا سپرهای تو در دروازه با سپرهای من قفل می‌شوند؟»',
    sagaVsChronicleNote:
      'افسانه‌ای (LEGENDARY): در کتاب نهم ساکسو گراماتیکوس، لادگردا پس از بازگشت از یاری راگنار، همسر غاصب را با سرنیزه‌ای پنهان در ردا از میان برمی‌دارد تا به تنهایی حکومت کند.',
    choices: {
      lagertha_storm_gate_together: {
        label: 'قفل کردن سپرها با یاران لاگرتا و یورش به حصار چوبی غاصبان',
        tooltipHint: '+۳۲ جایگاه · دریافت میراث: نیزه بال‌دار گولار · +۱ مزرعه · +۲۴ شهرت',
        outcomeText:
          'در حالی که سپاه تو دروازه چوبی بیرونی را در هم می‌کوبد، لاگرتا در درون تالار بزم با سرنیزه پنهان خود غاصب را از پای درمی‌آورد! او که دوباره بر تخت فرمانروایی نشسته، نیزه جنگی نقره‌کوب خود (Geirr Hlaðgerðar) را در دستت می‌گذارد و مزرعه‌ای موروثی در آبدره به خاندانت می‌بخشد.',
        mildOutcomeText:
          'در حالی که سپاه تو دروازه بیرونی را می‌گشاید، لاگرتا در تالار بزم غاصب را در یک ضربه سرنوشت‌ساز سرنگون می‌سازد! او به پاس وفاداری، نیزه جنگی نقره‌کوب خود و یک مزرعه آباد در آبدره را به خاندانت اهدا می‌کند.',
      },
      lagertha_thing_judgment: {
        label: 'استناد به قانون فروستاثینگ برای یاغی اعلام کردن همراهان غاصب بدون خون‌ریزی',
        tooltipHint: '+۲۰ جایگاه · +۳۰ نقره · +۶ قانون‌دانی و دیپلماسی',
        outcomeText:
          'در برابر کشاورزان آزاد (بوندی) و با چوب‌خط‌های قانون در دست، اعلام می‌کنی هر کس تا غروب آفتاب تبر زمین نگذارد، طبق قانون بی‌خون‌بها و تبعیدی است. نیمی از نگهبانان غاصب در دم پراکنده می‌شوند و لاگرتا بی‌رقیب بر گولار حکم می‌راند.',
      },
    },
  },

  leg_enc_floki_01_keel: {
    title: 'تالار افسانه‌ها · سه زاغ سیاه و قلم راهب در اسمیورسوند',
    text: 'در کارگاه دودگرفته کشتی‌سازی کنار تنگه، استاد «فلوکی ویلگردارسون» با تیشه، تیرک خمیده بلوطی را می‌تراشد و چشمانش از تب دریا می‌درخشد. در کنار قفسی بافته‌شده که سه زاغ سیاه در آن بال می‌زنند، «برادر آلدوین» — کاتب اسیر نورثامبریایی — با دقت جدول ستارگان لاتین را بر پوست گوسفند رونویسی می‌کند.\n\nفلوکی تیشه آهنی‌اش را به سوی پوست‌نوشته راهب می‌گیرد: «به آن‌ها بگو آلدوین! خدای نجارِ میخکوب‌شده تو پشت دیوارهای سنگی نشسته، اما هوگین و مونین (زاغ‌های اودین) در دل طوفانی پرواز می‌کنند که هیچ کاغذی در آن دوام نمی‌آورد!»\n\nآلدوین با آرامش سر برمی‌آورد: «و با این همه ای فلوکی، همان ستاره قطبی که بر فراز دکل تو می‌درخشد، بر بام صومعه من نیز استوار است.» هر دو به سوی تو برمی‌گردند تا داور این مناظره باشی و هزینه آخرین تخته‌های کشتی غرب را تأمین کنی.',
    sagaVsChronicleNote:
      'مستند (DOCUMENTED): کتاب لاندنامابوک ساخت کشتی اقیانوس‌پیمای فلوکی و قربانی بزرگ او در اسمیورسوند برای تقدیس سه زاغ راهنما را به دقت ثبت کرده است.',
    choices: {
      floki_honor_ravens_blot: {
        label: 'پرداخت ۱۵ سکه نقره برای آیین بلوت اسمیورسوند و تقدیس سه زاغ به نام اودین',
        tooltipHint: '-۱۵ نقره · +۲۸ جایگاه نزد فلوکی · +۶ دریانوردی و صنعتگری · گشودن سفر ایسلند',
        outcomeText:
          'پانزده سکه نقره بر چینه سنگی اسمیورسوند می‌گذاری در حالی که فلوکی سرود تقدیس سه زاغ را می‌خواند. فلوکی که از پایبندی تو به آیین کهن به وجد آمده، راز تراشیدن تخته‌های انعطاف‌پذیر اقیانوس‌پیما را به نجاران تو می‌آموزد.',
      },
      floki_bridge_aldwin_stars: {
        label: 'داوری خردمندانه: «ناخدای دانا هم از زاغ‌های اودین بهره می‌برد و هم از جدول ستارگان آلدوین»',
        tooltipHint: '+۱۸ جایگاه نزد فلوکی و آلدوین · +۶ دریانوردی · +۵ ذکاوت',
        outcomeText:
          'فلوکی زیر لب غرولندی می‌کند و ناگهان قهقهه‌ای بلند سر می‌دهد، و برادر آلدوین نیز با سپاس لبخند می‌زند. آن دو به اتفاق هم، صفحه جهت‌یابی چوبی‌ای می‌تراشند که هم نشانه‌های رونیک بادها و هم درجات انقلابین خورشید بر آن حک شده است.',
      },
      floki_side_with_aldwin_christ: {
        label: 'حمایت از دانش مسیحی برادر آلدوین و لاشخور خواندن زاغ‌های فلوکی',
        tooltipHint: '+۲۴ جایگاه نزد آلدوین · -۲۰ جایگاه نزد فلوکی · +۶ دیپلماسی',
        outcomeText:
          'چهره فلوکی چون ابر طوفان‌زا تیره می‌شود؛ قفس زاغ‌هایش را برمی‌دارد و سوگند می‌خورد به تو نشان دهد پرندگان اودین چه سرزمینی را خواهند یافت. در مقابل، برادر آلدوین منشور سفری به زبان لاتین برایت می‌نگارد که در بنادر مسیحی ارج بسیار دارد.',
      },
    },
  },

  leg_enc_floki_02_iceland: {
    title: 'تالار افسانه‌ها · پرواز زاغ سوم و یخ‌های شناور ایسلند',
    text: 'روزها در غرب جزایر فارو، مه خاکستری و سرد دریا و آسمان را یکسره می‌بلعد. بر عرشه کشتیِ بلوط، فلوکی ویلگردارسون چفت قفس را می‌گشاید: نخستین زاغ چرخی می‌زند و به سوی فارو بازمی‌گردد؛ زاغ دوم اوج می‌گیرد، اما جز کفِ بی‌پایان امواج چیزی نمی‌بیند و دوباره بر لبه کشتی می‌نشیند.\n\nدر حالی که برادر آلدوین سکان را محکم نگه داشته، فلوکی نیایشی به درگاه خدایان کهن زمزمه می‌کند و زاغ سوم را پر می‌دهد. پرنده سیاه یکسره مه را می‌شکافد و به پیش می‌تازد! ساعاتی بعد، دماغه‌های سیاه آتشفشانی و دره‌های پر از بخار از دل آب سر برمی‌آورند. پیش از جدایی در خلیج نویافته ریکیاویک، هرافنا-فلوکی بلور شفافی در قاب استخوان نهنگ را در کف دستت می‌گذارد.',
    sagaVsChronicleNote:
      'مستند (DOCUMENTED): لاندنامابوک رها کردن سه زاغ، فرود در واتنس‌فیورد و نام‌گذاری «ایسلند» پس از دیدن آبدره پر از یخ شناور را روایت می‌کند.',
    choices: {
      floki_accept_sunstone_discover: {
        label: 'پذیرفتن سنگ خورشید هرافنا-فلوکی و ثبت مسیر دریایی ریکیاویک برای خاندان',
        tooltipHint: '+۳۰ جایگاه نزد فلوکی · دریافت میراث: سنگ خورشید فلوکی · کشف ریکیاویک · +۸ دریانوردی',
        outcomeText:
          'بلور کلسیت ایسلندی را برابر آسمان ابری می‌گیری و با هم‌راستا شدن دو سایه، جایگاه پنهان خورشید را می‌بینی! با سنگ خورشید و قطب‌نمای زاغ فلوکی در صندوق کشتی، شاهراه اقیانوس اطلس شمالی برای همیشه به روی ناوگان تو گشوده می‌شود.',
      },
      floki_help_winter_hay: {
        label: 'هشدار به یاران فلوکی که در کنار صید ماهی آزاد، درو کردن علوفه زمستان را فراموش نکنند',
        tooltipHint: '+۲۴ جایگاه · +۲۰ ذخیره آذوقه · +۶ کشاورزی · ثبت انحراف تاریخی به سود فلوکی',
        outcomeText:
          'با یادآوری سرمای بی‌رحم زمستان‌های شمال، نیمی از پاروزنان را به درو کردن علفزارهای واتنس‌فیورد می‌گماری. به برکت دوراندیشی تو، دام‌های کاروان فلوکی از یخبندان بهار جان سالم به در می‌برند و او نیز سنگ خورشید خود را به تو هدیه می‌دهد!',
        divergenceNote:
          'با هشدار یکی از ناخدایان هم‌سفر در واتنس‌فیورد، کاروان هرافنا-فلوکی علوفه کافی برای زمستان انبار کرد و دام‌هایش از نخستین زمستان ایسلند جان به در بردند.',
      },
    },
  },
};
