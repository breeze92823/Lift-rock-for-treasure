// Auras shown in the Aura window. The equipped aura multiplies strength gained
// (systems/strengthGain.js). `price` 0 = owned from the start, null = not buyable with cash.
// `colors` = [core, glow] for the orb icon.
export const AURAS = [
  { id: 'none', name: 'None', rarity: 'Common', mult: 1, price: 0, colors: ['#b8bcc4', '#6a6e78'], shape: 'flame', hidden: true },
  { id: 'radioactive', name: 'Radioactive', rarity: 'Common', mult: 1.2, price: 100000, colors: ['#b8ff4a', '#2aa012'], shape: 'flame' },
  { id: 'halo', name: 'Halo', rarity: 'Uncommon', mult: 1.5, price: 750000, colors: ['#ffe46a', '#9a5ae0'], shape: 'halo' },
  { id: 'firebeam', name: 'Fire Beam', rarity: 'Rare', mult: 2, price: 25000000, colors: ['#6ad0ff', '#1a4ae0'], shape: 'flame' },
  { id: 'redking', name: 'Red King', rarity: 'Epic', mult: 2.5, price: 200000000, colors: ['#ff6a5a', '#b0081c'], shape: 'crown' },
  { id: 'darkmatter', name: 'Dark Matter', rarity: 'Legendary', mult: 3, price: 1000000000, colors: ['#b070ff', '#1a0a40'], shape: 'orb' },
  { id: 'fractal', name: 'Fractal', rarity: 'Mythic', mult: 3.5, price: 25000000000, colors: ['#5af0e0', '#7a3ae0'], shape: 'star' },
  { id: 'rainbow', name: 'Rainbow', rarity: 'Secret', mult: 4, price: 1000000000000, colors: ['#ff6ad0', '#6affc8'], shape: 'flame', rainbow: true },
  { id: 'galaxy', name: 'Galaxy', rarity: 'Celestial', mult: 5, price: 50000000000000, colors: ['#ff9aef', '#3a1a90'], shape: 'orb' },
]

export const auraById = (id) => AURAS.find((a) => a.id === id) ?? AURAS[0]
