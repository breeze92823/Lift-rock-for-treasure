import { create } from 'zustand'

// Starting cash, set via VITE_START_CASH in .env / .env.local (see .env.example).
const envCash = Number(import.meta.env.VITE_START_CASH)
const START_CASH = Number.isFinite(envCash) && envCash > 0 ? Math.floor(envCash) : 0

// Starting gems, set via VITE_START_GEMS (handy for testing gem purchases).
const envGems = Number(import.meta.env.VITE_START_GEMS)
const START_GEMS = Number.isFinite(envGems) && envGems > 0 ? Math.floor(envGems) : 0

// Starting strength, set via VITE_START_STRENGTH (default 1).
const envStrength = Number(import.meta.env.VITE_START_STRENGTH)
const START_STRENGTH = Number.isFinite(envStrength) && envStrength > 0 ? Math.floor(envStrength) : 1

export const useGameStore = create(() => ({
  progressLoaded: false, // saved progress received from the server (systems/net.js); gates the loading screen
  netError: '', // set when the server/database could not be reached on first load; LoadingScreen shows a retry button
  avatarLoaded: false, // player character (incl. Bloxity accessories) finished loading; gates the loading screen

  // HUD stats (components/hud/HUD.jsx).
  cash: START_CASH,
  gems: START_GEMS,
  rebirths: 0,
  strength: START_STRENGTH,
  level: 1,
  xp: 1,
  xpNeeded: 10,
  backpack: 0,
  backpackMax: 3,
  backpackLevel: 1, // Upgrades window levels (data/upgrades.js)
  speedLevel: 1,
  inventory: [], // carried loot: { name, rarity, value } (systems/loot.js)
  sellOpen: false, // Sell window (components/hud/SellWindow.jsx)
  rebirthOpen: false, // Rebirth window (components/hud/RebirthWindow.jsx)
  upgradesOpen: false, // Upgrades window (components/hud/UpgradesWindow.jsx)
  indexOpen: false, // Index window (components/hud/IndexWindow.jsx)
  armsOpen: false, // Arms window (components/hud/ArmsWindow.jsx)
  auraOpen: false, // Aura window (components/hud/AuraWindow.jsx)
  ownedAuras: ['none'], // data/auras.js ids
  equippedAura: 'none',
  ownedArms: ['dirt'], // data/arms.js ids
  equippedArm: 'dirt',
  heldItem: null, // { name, rarity, glyph } picked from the Index (Uncommon and up; see IndexWindow.jsx)
  homePlot: 0, // index into data/world.js PLOTS, assigned by the server (systems/net.js)
  plotSlots: {}, // home ground-floor slot index (data/world.js HOME_SLOTS) -> { name, rarity, glyph } (systems/plotSlots.js)
  discovered: [], // item names collected at least once (systems/loot.js)
  collectedLoot: [], // indices into data/loot.js LOOT already picked up
  luckBoost: 0, // % shown bottom-left
}))

// Opens one HUD window ('sell' | 'rebirth' | 'upgrades' | 'index' | 'arms' | 'aura') and closes all the others.
export const openWindow = (name) =>
  useGameStore.setState({ sellOpen: false, rebirthOpen: false, upgradesOpen: false, indexOpen: false, armsOpen: false, auraOpen: false,[`${name}Open`]: true })
