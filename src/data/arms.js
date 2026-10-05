// Arm skins shown in the Arms window. The equipped arm multiplies strength gained
// (systems/strengthGain.js). `price` 0 = owned from the start, null = not buyable with cash.
// `pattern` + `palette` generate the block icon (components/hud/armTextures.js).
export const ARMS = [
  { id: 'dirt', name: 'Dirt', rarity: 'Common', mult: 2, price: 0, pattern: 'noise', palette: ['#b5703c', '#9a5c2e', '#c88650', '#7a4620'] },
  { id: 'wood', name: 'Wood', rarity: 'Uncommon', mult: 5, price: 1000, pattern: 'grain', palette: ['#a67c3e', '#8a6430', '#bf9450', '#5e4420'] },
  { id: 'cobblestone', name: 'Cobblestone', rarity: 'Uncommon', mult: 10, price: 25000, pattern: 'stone', palette: ['#c4c8d0', '#a4a8b2', '#8a8e98', '#6a6e78'] },
  { id: 'brick', name: 'Brick', rarity: 'Rare', mult: 20, price: 100000, pattern: 'brick', palette: ['#b0472f', '#c05a3c', '#9a3a26', '#d8c8b0'] },
  { id: 'gold', name: 'Gold', rarity: 'Rare', mult: 50, price: 300000, pattern: 'ore', palette: ['#ffd84a', '#fff09a', '#d09a10', '#e8b420'] },
  { id: 'glowstone', name: 'Glowstone', rarity: 'Epic', mult: 100, price: 1000000, pattern: 'noise', palette: ['#ffcf6a', '#ffe8a0', '#e8a040', '#c88a2a'] },
  { id: 'obsidian', name: 'Obsidian', rarity: 'Epic', mult: 200, price: 5000000, pattern: 'noise', palette: ['#2a1646', '#3a2658', '#1a0f2e', '#4a3070'] },
  { id: 'glass', name: 'Glass', rarity: 'Exclusive', mult: 350, price: null, pattern: 'glass', palette: ['#d8f2ff', '#ffffff', '#a8d8f0', '#7ab8d8'] },
  { id: 'diamond', name: 'Diamond', rarity: 'Legendary', mult: 500, price: 100000000, pattern: 'ore', palette: ['#5af0e0', '#a0fff4', '#9a9ea8', '#b8bcc4'] },
  { id: 'lava', name: 'Lava', rarity: 'Legendary', mult: 1000, price: 300000000, pattern: 'noise', palette: ['#ff7a1a', '#ffb02a', '#c02a08', '#ff4a10'] },
  { id: 'emerald', name: 'Emerald', rarity: 'Mythic', mult: 2500, price: 1000000000, pattern: 'ore', palette: ['#3aea6a', '#8affa8', '#9a9ea8', '#b8bcc4'] },
  { id: 'glitch', name: 'Glitch', rarity: 'Exclusive', mult: 3750, price: null, pattern: 'glitch', palette: ['#ff2ad4', '#2affd8', '#202020', '#ffffff'] },
  { id: 'bedrock', name: 'Bedrock', rarity: 'Secret', mult: 5000, price: 10000000000, pattern: 'stone', palette: ['#7a7a7e', '#5e5e62', '#46464a', '#2e2e32'] },
  { id: 'nuclear', name: 'Nuclear', rarity: 'Secret', mult: 10000, price: 50000000000, pattern: 'noise', palette: ['#9aff2a', '#c8ff6a', '#4a9a08', '#2a5a04'] },
  { id: 'disco', name: 'Disco', rarity: 'Celestial', mult: 50000, price: 750000000000, pattern: 'disco', palette: ['#ff6ad0', '#6a8aff', '#6affc8', '#ffe46a'] },
]

export const RARITY_COLORS = {
  Common: '#b8bcc4',
  Uncommon: '#5aff7a',
  Rare: '#4aa8ff',
  Epic: '#c070ff',
  Legendary: '#ffb020',
  Mythic: '#ff4a6a',
  Exclusive: '#2affd8',
  Secret: '#ff2a2a',
  Celestial: '#ff9aef',
  Divine: '#fff3a8',
}

export const armById = (id) => ARMS.find((a) => a.id === id) ?? ARMS[0]

const SUFFIXES = ['', 'K', 'M', 'B', 'T']
// 2500 -> '2.5K', 1000000000 -> '1B'
export function shortNum(n) {
  let i = 0
  while (n >= 1000 && i < SUFFIXES.length - 1) {
    n /= 1000
    i++
  }
  return `${+n.toFixed(2)}${SUFFIXES[i]}`
}
