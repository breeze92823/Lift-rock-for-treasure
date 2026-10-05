import { LIFT_ZONES } from './world.js'

// Extra index collectables: [name, rarity, glyph, value in $]. Only those named in ZONE_ITEMS below spawn.
const EXTRA_ITEMS = [
  ['Pirate Hat', 'Rare', '🏴‍☠️', 630],
  ['Anvil', 'Rare', '⚒️', 735],
  ['Dagger', 'Rare', '🗡️', 840],
  ['TNT', 'Rare', '🧨', 945],
  ['Bomb', 'Rare', '💣', 1050],
  ['Helmet', 'Rare', '🪖', 1160],
  ['Quartz', 'Rare', '🔹', 1260],
  ['Feather', 'Common', '🪶', 10],
  ['Seashell', 'Common', '🐚', 13],
  ['Acorn', 'Common', '🌰', 11],
  ['Pinecone', 'Common', '🌲', 15],
  ['Old Boot', 'Common', '🥾', 17],
  ['Compass', 'Uncommon', '🧭', 130],
  ['Silver Key', 'Uncommon', '🗝️', 150],
  ['Crystal Ball', 'Rare', '🔮', 480],
  ['Ancient Scroll', 'Rare', '📜', 510],
  ['Golden Ring', 'Rare', '💍', 560],
  ['Ruby', 'Rare', '🔴', 495],
  ['Sapphire', 'Rare', '🔵', 505],
  ['Pocket Watch', 'Rare', '⌚', 540],
  ['Jade Idol', 'Epic', '🗿', 1800],
  ['Royal Crown', 'Epic', '👑', 2400],
  ['Viking Helmet', 'Epic', '⛑️', 1950],
  ['War Drum', 'Epic', '🥁', 1700],
  ['Dragon Egg', 'Epic', '🥚', 2600],
  ['Magic Lamp', 'Epic', '🪔', 2200],
  ['Siren Harp', 'Epic', '🪕', 2050],
  ['Pirate Flag', 'Epic', '🏴‍☠️', 1850],
  ['Moon Mask', 'Epic', '🎭', 2100],
  ['Thunder Hammer', 'Epic', '🔨', 2500],
  ['Golden Chalice', 'Epic', '🏆', 2300],
  ['Emerald', 'Epic', '🟢', 14200],
  ['Porcelain Vase', 'Epic', '🏺', 9470],
  ['Amethyst', 'Epic', '🟣', 13000],
  ['Phoenix Feather', 'Legendary', '🔥', 9000],
  ['Excalibur', 'Celestial', '🗡️', 12000],
  ['Star Fragment', 'Legendary', '🌟', 10500],
  ['Kraken Eye', 'Legendary', '👁️', 11000],
  ['Titan Gauntlet', 'Legendary', '🥊', 9800],
  ['Sun Medallion', 'Legendary', '🌞', 10200],
  ['Frost Crown', 'Legendary', '❄️', 11500],
  ['Ancient Dragon Skull', 'Celestial', '🐉', 13000],
  ['Time Crystal', 'Mythic', '🕰️', 48000],
  ['Void Orb', 'Celestial', '⚫', 52000],
  ['Rainbow Diamond', 'Celestial', '🌈', 60000],
  ['Astral Blade', 'Celestial', '⚔️', 55000],
  ['Celestial Harp', 'Mythic', '🎶', 50000],
  ['Golden Rocket', 'Divine', '🚀', 250000],
  ['Cosmic Cube', 'Divine', '🧊', 320000],
  ['Infinity Gem', 'Divine', '♾️', 450000],
  ['Griffin Claw', 'Legendary', '🦅', 10800],
  ['Storm Crown', 'Legendary', '⚡', 11200],
  ['Obsidian Throne', 'Mythic', '🪑', 49000],
  ['Phoenix Heart', 'Mythic', '❤️‍🔥', 52000],
  ['Dream Catcher', 'Mythic', '🕸️', 47000],
  ['Galaxy Pearl', 'Celestial', '🪐', 58000],
  ['Aurora Veil', 'Celestial', '🌌', 57000],
  ['Genesis Seed', 'Divine', '🌱', 380000],
  ['Eternity Clock', 'Divine', '⏳', 410000],
  ['Creator Crown', 'Divine', '🔱', 500000],
  ['Omega Star', 'Divine', '✨', 480000],
]

// Rarity tiers in order, lowest to highest.
export const RARITIES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Secret', 'Celestial', 'Divine']

// Every collectable shown in the Index window: [name, rarity, glyph].
export const ITEM_CATALOG = [
  ['Rock', 'Common', '🪨'],
  ['Coal', 'Common', '⚫'],
  ['Coin', 'Common', '🪙'],
  ['Bone', 'Common', '🦴'],
  ['Skull', 'Common', '💀'],
  ['Mushroom', 'Common', '🍄'],
  ['Iron Bar', 'Uncommon', '🔩'],
  ['Gem', 'Uncommon', '💎'],
  ['Beaded Bracelet', 'Uncommon', '📿'],
  ['Brass Bell', 'Uncommon', '🔔'],
  ['Anchor', 'Uncommon', '⚓'],
  ['Binoculars', 'Uncommon', '🔭'],
  ...EXTRA_ITEMS.map(([name, rarity, glyph]) => [name, rarity, glyph]),
]

// Luck % per rarity tier: [min, max]. Each item's value below is picked at random within its tier's range.
export const LUCK_RANGES = {
  Common: [1, 8], Uncommon: [9, 20], Rare: [25, 40], Epic: [41, 53], Legendary: [54, 65],
  Mythic: [66, 80], Celestial: [81, 100], Divine: [101, 200],
}

// Luck % granted by each collectable (shown as "+N% Luck").
export const ITEM_LUCK = {
  Rock: 1,
  Coal: 3,
  Coin: 8,
  Bone: 2,
  Skull: 4,
  Mushroom: 3,
  'Iron Bar': 12,
  Gem: 17,
  'Beaded Bracelet': 14,
  'Brass Bell': 11,
  Anchor: 20,
  Binoculars: 14,
  'Pirate Hat': 27,
  Anvil: 31,
  Dagger: 37,
  TNT: 31,
  Bomb: 29,
  Helmet: 27,
  Quartz: 38,
  Feather: 3,
  Seashell: 2,
  Acorn: 4,
  Pinecone: 7,
  'Old Boot': 2,
  Compass: 9,
  'Silver Key': 13,
  'Crystal Ball': 33,
  'Ancient Scroll': 33,
  'Golden Ring': 25,
  Ruby: 28,
  Sapphire: 34,
  'Pocket Watch': 25,
  'Jade Idol': 50,
  'Royal Crown': 48,
  'Viking Helmet': 51,
  'War Drum': 46,
  'Dragon Egg': 44,
  'Magic Lamp': 49,
  'Siren Harp': 46,
  'Pirate Flag': 41,
  'Moon Mask': 44,
  'Thunder Hammer': 44,
  'Golden Chalice': 46,
  Emerald: 45,
  'Porcelain Vase': 49,
  Amethyst: 47,
  'Phoenix Feather': 55,
  Excalibur: 90,
  'Star Fragment': 62,
  'Kraken Eye': 56,
  'Titan Gauntlet': 64,
  'Sun Medallion': 56,
  'Frost Crown': 59,
  'Ancient Dragon Skull': 91,
  'Time Crystal': 72,
  'Void Orb': 88,
  'Rainbow Diamond': 83,
  'Astral Blade': 96,
  'Celestial Harp': 71,
  'Golden Rocket': 154,
  'Cosmic Cube': 185,
  'Infinity Gem': 181,
  'Griffin Claw': 58,
  'Storm Crown': 61,
  'Obsidian Throne': 74,
  'Phoenix Heart': 78,
  'Dream Catcher': 68,
  'Galaxy Pearl': 93,
  'Aurora Veil': 87,
  'Genesis Seed': 142,
  'Eternity Clock': 167,
  'Creator Crown': 195,
  'Omega Star': 176,
}

// Per-item reference: name -> { rarity, value in $, model }. `model` is the 3D
// model asset for the item (null: models are built in code, see
// components/world/LootItems.jsx).
export const ITEM_INFO = {
  Coal: { rarity: 'Common', value: 12, model: null },
  Bone: { rarity: 'Common', value: 16, model: null },
  Skull: { rarity: 'Common', value: 18, model: null },
  Mushroom: { rarity: 'Common', value: 20, model: null },
  Coin: { rarity: 'Common', value: 14, model: null },
  'Iron Bar': { rarity: 'Uncommon', value: 79, model: null },
  Anchor: { rarity: 'Uncommon', value: 142, model: null },
  Gem: { rarity: 'Uncommon', value: 95, model: null },
  'Beaded Bracelet': { rarity: 'Uncommon', value: 111, model: null },
  'Brass Bell': { rarity: 'Uncommon', value: 126, model: null },
  Binoculars: { rarity: 'Uncommon', value: 158, model: null },
  ...Object.fromEntries(EXTRA_ITEMS.map(([name, rarity, , value]) => [name, { rarity, value, model: null }])),
}

// Pickup spots on every zone's Loot Floor: [x across the corridor, metres
// north of the zone's gate edge].
const SLOTS = [
  [-5.5, 1], [0.5, 0], [5.5, 2], [-1.5, 4.5], [3, 6], [-7, 9],
  [6.5, 10.5], [-3, 12], [2, 14], [7, 15], [-6, 7.5], [5, 12.5],
]

// What lies on each zone, in SLOTS order (one list per LIFT_ZONES entry).
const ZONE_ITEMS = [
  ['Coal', 'Bone', 'Coal', 'Skull', 'Anchor', 'Coal', 'Mushroom', 'Gem', 'Beaded Bracelet', 'Coal', 'Coin', 'Brass Bell'],
  ['Coin', 'Iron Bar', 'Binoculars', 'Brass Bell', 'Coal', 'Bone', 'Gem', 'Pirate Hat', 'Anvil', 'Coin', 'Skull', 'Dagger'],
  ['Iron Bar', 'Binoculars', 'Anvil', 'Dagger', 'TNT', 'Pirate Hat', 'Anchor', 'Brass Bell', 'Coin', 'Gem', 'TNT', 'Dagger'],
  ['TNT', 'Bomb', 'Dagger', 'Anvil', 'Pirate Hat', 'Binoculars', 'Helmet', 'Quartz', 'Gem', 'Iron Bar', 'Bomb', 'Coin'],
  ['Bomb', 'Helmet', 'Quartz', 'TNT', 'Anvil', 'Dagger', 'Pirate Hat', 'Gem', 'Binoculars', 'Brass Bell', 'Quartz', 'Bomb'],
  ['Helmet', 'Quartz', 'Bomb', 'TNT', 'Dagger', 'Anvil', 'Pirate Hat', 'Helmet', 'Quartz', 'Anchor', 'Bomb', 'Gem'],
  ['Quartz', 'Helmet', 'Bomb', 'Quartz', 'Helmet', 'TNT', 'Dagger', 'Pirate Hat', 'Anvil', 'Amethyst', 'Bomb', 'Porcelain Vase'],
  ['Quartz', 'Helmet', 'Bomb', 'Emerald', 'TNT', 'Dagger', 'Amethyst', 'Helmet', 'Bomb', 'Porcelain Vase', 'Emerald', 'Bomb'],
  // x100 - x300: Epic + Legendary
  ['Amethyst', 'Phoenix Feather', 'Emerald', 'Star Fragment', 'Porcelain Vase', 'Kraken Eye', 'Dragon Egg', 'Titan Gauntlet', 'Amethyst', 'Sun Medallion', 'Quartz', 'Frost Crown'],
  ['Emerald', 'Star Fragment', 'Amethyst', 'Griffin Claw', 'Phoenix Feather', 'Porcelain Vase', 'Kraken Eye', 'Storm Crown', 'Emerald', 'Titan Gauntlet', 'Sun Medallion', 'Amethyst'],
  ['Porcelain Vase', 'Griffin Claw', 'Frost Crown', 'Amethyst', 'Storm Crown', 'Star Fragment', 'Emerald', 'Kraken Eye', 'Phoenix Feather', 'Titan Gauntlet', 'Time Crystal', 'Sun Medallion'],
  ['Frost Crown', 'Storm Crown', 'Time Crystal', 'Griffin Claw', 'Amethyst', 'Star Fragment', 'Titan Gauntlet', 'Celestial Harp', 'Kraken Eye', 'Phoenix Feather', 'Emerald', 'Sun Medallion'],
  // x500 - x1500: Legendary + Mythic
  ['Time Crystal', 'Storm Crown', 'Celestial Harp', 'Frost Crown', 'Dream Catcher', 'Griffin Claw', 'Star Fragment', 'Obsidian Throne', 'Titan Gauntlet', 'Kraken Eye', 'Phoenix Feather', 'Sun Medallion'],
  ['Dream Catcher', 'Time Crystal', 'Storm Crown', 'Celestial Harp', 'Obsidian Throne', 'Frost Crown', 'Phoenix Heart', 'Griffin Claw', 'Star Fragment', 'Time Crystal', 'Titan Gauntlet', 'Kraken Eye'],
  ['Phoenix Heart', 'Obsidian Throne', 'Time Crystal', 'Dream Catcher', 'Celestial Harp', 'Storm Crown', 'Void Orb', 'Time Crystal', 'Frost Crown', 'Phoenix Heart', 'Griffin Claw', 'Obsidian Throne'],
  ['Obsidian Throne', 'Void Orb', 'Phoenix Heart', 'Celestial Harp', 'Dream Catcher', 'Time Crystal', 'Astral Blade', 'Storm Crown', 'Phoenix Heart', 'Time Crystal', 'Obsidian Throne', 'Dream Catcher'],
  // x2000 - x3000: Mythic + Celestial
  ['Void Orb', 'Phoenix Heart', 'Astral Blade', 'Obsidian Throne', 'Rainbow Diamond', 'Celestial Harp', 'Dream Catcher', 'Excalibur', 'Time Crystal', 'Galaxy Pearl', 'Phoenix Heart', 'Ancient Dragon Skull'],
  ['Excalibur', 'Aurora Veil', 'Void Orb', 'Phoenix Heart', 'Astral Blade', 'Galaxy Pearl', 'Obsidian Throne', 'Rainbow Diamond', 'Ancient Dragon Skull', 'Celestial Harp', 'Aurora Veil', 'Time Crystal'],
  // x5000 - x10000: Celestial + Divine (the final floor is nearly all Divine)
  ['Astral Blade', 'Golden Rocket', 'Galaxy Pearl', 'Cosmic Cube', 'Aurora Veil', 'Excalibur', 'Genesis Seed', 'Rainbow Diamond', 'Ancient Dragon Skull', 'Eternity Clock', 'Void Orb', 'Infinity Gem'],
  ['Infinity Gem', 'Cosmic Cube', 'Creator Crown', 'Golden Rocket', 'Omega Star', 'Eternity Clock', 'Genesis Seed', 'Cosmic Cube', 'Infinity Gem', 'Creator Crown', 'Aurora Veil', 'Omega Star'],
]

// Loot lying on the Lift zones.
// [name, rarity, value in $, x, z]; x is across the corridor, z runs north.
export const LOOT = LIFT_ZONES.flatMap((zn, zi) =>
  ZONE_ITEMS[zi].map((name, si) => {
    const { rarity, value } = ITEM_INFO[name]
    const [x, dz] = SLOTS[si]
    return [name, rarity, value, x, zn.gate.zS - dz]
  }),
)
