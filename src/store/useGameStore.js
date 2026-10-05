import { create } from 'zustand'

export const useGameStore = create(() => ({
  avatarLoaded: false, // player character (incl. Bloxity accessories) finished loading; gates the loading screen

  // HUD stats (components/hud/HUD.jsx).
  cash: 0,
  rebirths: 0,
  strength: 1,
  level: 1,
  xp: 1,
  xpNeeded: 10,
  backpack: 0,
  backpackMax: 3,
  inventory: [], // carried loot: { name, rarity, value } (systems/loot.js)
  sellOpen: false, // Sell window (components/hud/SellWindow.jsx)
  rebirthOpen: false, // Rebirth window (components/hud/RebirthWindow.jsx)
  indexOpen: false, // Index window (components/hud/IndexWindow.jsx)
  discovered: [], // item names collected at least once (systems/loot.js)
  collectedLoot: [], // indices into data/loot.js LOOT already picked up
  luckBoost: 0, // % shown bottom-left
}))
