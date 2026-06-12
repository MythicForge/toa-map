export const ALL_LOCATIONS = [
  'Port Nyanzaru', 'Bay of Chult', "Kitcher's Inlet", 'Refuge Bay', 'River Tiryki',
  'Fort Beluarian', 'Hvalspyd', 'Mezro', 'Ataaz Muhahah', 'Firefinger',
  'Nangalore', 'Ishau', 'Hisari', 'Yellyark', 'Camp Righteous',
  'Vorn', 'Camp Vengeance', 'Orolunga', 'Ataaz Yklwazi', "Needle's Bones",
  'Wreck of the Narwhal', 'Ataaz Kahakla', 'Wreck of the Star Goddess',
  'Port Castigliar', 'Kir Sabal', 'Dungrunglung', 'Heart of Ubtao', 'Mbala',
  'Nsi Wastes', 'River Olung', 'Lake Luo', 'Valley of Embers',
  'River Soshenstar', 'Mistcliff', 'Aldani Basin', 'River Tath',
  'Valley of Lost Honor', 'Hrakhamar', 'Wyrmheart Mine', 'Omu',
  'Shilku', 'Shilku Bay', 'The Cauldron', 'Snapping Turtle Bay',
  'Snout of Omgar', 'Valley of Dread', 'Land of Ash and Smoke',
  'Jahaka Anchorage', 'Jahaka Bay',
];

export const INITIAL_STATE = {
  hexes: {
    '4719': {
      name: 'Port Nyanzaru', location: 'Port Nyanzaru', colorTag: '#4a9c6e', revealTier: 3,
      markdown: "# Port Nyanzaru\n\nThe largest trading city on the Chultan Peninsula, ruled by seven merchant princes.\n\n## Merchant Princes\n- **Ekene-Afa** — weapons & shields\n- **Ifan Talro'a** — beasts & beast training\n- **Jobal** — guides & pathfinders\n- **Kwayothé** — tej, wine, ale\n- **Wakanga O'tamu** — magic items & lore\n- **Zhanthi** — gems, jewelry & cloth\n\n## Key Sites\n- **Tiryki Anchorage** — main docks\n- **Goldenthrone** — merchant prince palace\n- **Executioner's Run** — dinosaur racing",
      gmNote: "PRIVATE: Jobal is secretly allied with the Zhentarim. Incriminating papers in his villa (locked chest, Study, DC 20 Thieves' Tools). Death Curse symptoms visibly spreading — citizens wasting away.",
      sharedNote: 'A bustling trading city on the northern coast. The gateway to the Chultan jungle.',
    },
    '4515': {
      name: 'Fort Beluarian', location: 'Fort Beluarian', colorTag: '#7B9EC9', revealTier: 2,
      markdown: "# Fort Beluarian\n\nA fortified Flaming Fist outpost on the northern coast. Commander Liara Portyr requires adventuring charters.",
      gmNote: "Portyr demands 50gp/person charter fee. Bribe (100gp) or Intimidate DC 18. Has 100 soldiers + 3 griffon mounts. Suspects Lt. Rolph of treason — she's right.",
      sharedNote: 'A Flaming Fist fort. Adventuring charters required before heading south.',
    },
    '3429': {
      name: 'Camp Righteous', location: 'Camp Righteous', colorTag: '#C9923A', revealTier: 1,
      markdown: '# Camp Righteous\n\nAbandoned Order of the Gauntlet camp on the River Soshenstar.',
      gmNote: 'Trap: stone juggernaut activates if players enter without blood-feeding the crocodile statue. Scroll of Protection hidden under altar stone. Easy to miss (DC 15 Perception).',
      sharedNote: null,
    },
    '3131': {
      name: 'Camp Vengeance', location: 'Camp Vengeance', colorTag: '#E05C4B', revealTier: 0,
      markdown: '# Camp Vengeance\n\nA besieged Order of the Gauntlet camp deep in the jungle.',
      gmNote: 'Cmdr Breakbone needs an honorable excuse to retreat. 45 soldiers, losing 2-3/night to undead. Morale: broken. Scroll of Raise Dead in his tent.',
      sharedNote: null,
    },
    '4230': {
      name: 'Firefinger', location: 'Firefinger', colorTag: '#E05C4B', revealTier: 0,
      markdown: '# Firefinger\n\nA volcanic spire 200 ft tall. Pterafolk roost at the summit.',
      gmNote: 'Pterafolk leader Zalk has captive guide Voleka (alive, 12hp). Pterafolk negotiate for gems/shiny objects. Loot at summit: Cloak of the Bat.',
      sharedNote: null,
    },
    '4341': {
      name: 'Nangalore', location: 'Nangalore', colorTag: '#9C7CC0', revealTier: 0,
      markdown: "# Nangalore\n\nRuined palace of Queen Zalkoré, cursed by Ubtao for her vanity.",
      gmNote: "Zalkoré is a medusa (petrifying gaze). Chwinga sprites inhabit the garden — they can be helpful if given gifts. Treasure: Necklace of Prayer Beads (6 beads).",
      sharedNote: null,
    },
    '4729': {
      name: 'Mezro', location: 'Mezro', colorTag: '#4a9c6e', revealTier: 0,
      markdown: '# Mezro\n\nA ruined city that appears empty — yet hides an extraordinary secret.',
      gmNote: 'Ruined palace entrance leads to pocket dimension containing the INTACT living city. Guardian Barae Ara (paladin, CR 10) defends the entrance. Can become an ally.',
      sharedNote: null,
    },
    '3327': {
      name: 'Yellyark', location: 'Yellyark', colorTag: '#C9923A', revealTier: 0,
      markdown: "# Yellyark\n\nBatiri goblin camp ruled by the fearsome Chief Yorb.",
      gmNote: "Chief Yorb on skull throne. ~80 Batiri, fight at night only. Captive grung Kii willing to trade intel for freedom. Yorb has a mechanical eye from Vorn's remains.",
      sharedNote: null,
    },
    '2928': {
      name: 'Vorn', location: 'Vorn', colorTag: '#7B9EC9', revealTier: 0,
      markdown: '# Vorn\n\nAn ancient iron construct the size of a hill giant, worshipped by a goblin tribe.',
      gmNote: 'Vorn = massive iron golem (CR 16). Batiri tribe can command it to some degree. Approaching aggressively triggers attack. It responds to the word "Ubtao."',
      sharedNote: null,
    },
    '2133': {
      name: 'Orolunga', location: 'Orolunga', colorTag: '#4a9c6e', revealTier: 0,
      markdown: '# Orolunga\n\nAn ancient ziggurat hidden deep in the jungle. Few know it exists.',
      gmNote: "Oracle Nanny Pu'pu answers 3 questions per worthy offering. Reveals: Soulmonger location, how to halt Death Curse temporarily, one merchant prince's secret. Worthy offering = something truly personal.",
      sharedNote: null,
    },
    '5135': {
      name: 'Wreck of the Narwhal', location: 'Wreck of the Narwhal', colorTag: '#7B9EC9', revealTier: 0,
      markdown: "# Wreck of the Narwhal\n\nA shipwreck on the eastern coast.",
      gmNote: "Sahaugin lair in the hull. Treasure: 3,000gp in salvageable cargo, +1 Trident in the captain's cabin (underwater, DC 15 Athletics to reach).",
      sharedNote: null,
    },
  },
  partyMarkers: [
    { id: 'p1', name: 'Party', color: '#FFD700', hexId: '4719' },
  ],
  trackers: [
    { id: 'rations',    name: 'Rations',     type: 'progress', current: 14, max: 20, visibleToPlayers: true  },
    { id: 'curse',      name: 'Death Curse', type: 'progress', current: 3,  max: 10, visibleToPlayers: false },
    { id: 'exhaustion', name: 'Exhaustion',  type: 'pip',      current: 1,  max: 6,  visibleToPlayers: true  },
  ],
  playerNotes: {},
  partyNotes: {},
};
