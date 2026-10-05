import { LIFT_ZONES } from './world.js'

// Extra index collectables: [name, rarity, glyph, value in $]. Any of them can spawn, by rarity (see pickItem).
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
].sort((a, b) => RARITIES.indexOf(a[1]) - RARITIES.indexOf(b[1])) // stable: keeps insertion order within a tier

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

// Luck Bonus %: sum of the Luck of every item placed on the home slots.
export const luckBonus = (plotSlots) => Object.values(plotSlots).reduce((sum, it) => sum + (ITEM_LUCK[it.name] ?? 0), 0)

// A gate's luck scaled by the bonus: x5 with +100% Luck Bonus -> x5 * (100+100)% = x10.
export const finalLuck = (gateLuck, bonus) => Math.round(gateLuck * (100 + bonus)) / 100

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

// Luck-driven loot. A zone's total luck (gate luck x Luck Bonus, see finalLuck) sets how far up the
// rarity ladder its items sit: at x1 the 12 slots hold 8 Common + 4 Uncommon, and at MAX_LUCK every
// slot holds a Divine item. In between the mix climbs smoothly, one slot at a time.
const TIERS = RARITIES.filter((r) => r !== 'Secret') // tiers that actually have items
const POOLS = TIERS.map((r) => Object.keys(ITEM_INFO).filter((n) => ITEM_INFO[n].rarity === r))
const MAX_LUCK = LIFT_ZONES[LIFT_ZONES.length - 1].luck // total luck at which everything is Divine
const COMMON_SLOTS = 8 // slots that start Common; the rest start one tier higher

// Position on the rarity ladder (0 = Common ... TIERS.length - 1 = Divine) for a total luck.
const ladder = (luck) => (Math.min(1, Math.log(Math.max(1, luck)) / Math.log(MAX_LUCK))) * (TIERS.length - 1)

// Re-rolled every time the player returns to the hub, so the same slot holds a different item next run.
let lootSeed = (Math.random() * 2 ** 32) >>> 0
const seedListeners = new Set()
export const rerollLoot = () => {
  lootSeed = (lootSeed + 0x9e3779b9) >>> 0
  seedListeners.forEach((fn) => fn())
}
export const subscribeLootSeed = (fn) => (seedListeners.add(fn), () => seedListeners.delete(fn))
export const getLootSeed = () => lootSeed

// Deterministic per (seed, loot index) so rendering and pickup always agree on the item.
function hash(n) {
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b)
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b)
  return (n ^ (n >>> 16)) >>> 0
}

function pickItem(luck, si, i) {
  const tier = Math.min(TIERS.length - 1, Math.floor(ladder(luck) + si / COMMON_SLOTS))
  const pool = POOLS[tier]
  const name = pool[hash(lootSeed ^ Math.imul(i + 1, 0x9e3779b1)) % pool.length]
  return [name, ITEM_INFO[name].rarity, ITEM_INFO[name].value]
}

// Loot spots on the Lift zones: [name, rarity, value in $, x, z, zone index, slot index] with the
// item as it lies at zero Luck Bonus. x is across the corridor, z runs north.
export const LOOT = LIFT_ZONES.flatMap((zn, zi) =>
  SLOTS.map(([x, dz], si) => [...pickItem(zn.luck, si, zi * SLOTS.length + si), x, zn.gate.zS - dz, zi, si]),
)

// Loot entry `i` as it lies under the current Luck Bonus: the slot keeps its spot and its item is
// rolled from the rarity tier that the zone's final luck (gate luck x (100 + bonus)%) reaches.
export function lootAt(i, bonus) {
  const [, , , x, z, zi, si] = LOOT[i]
  return [...pickItem(finalLuck(LIFT_ZONES[zi].luck, bonus), si, i), x, z, zi, si]
}
