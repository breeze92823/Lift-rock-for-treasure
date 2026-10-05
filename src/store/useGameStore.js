import { create } from 'zustand'

export const useGameStore = create(() => ({
  avatarLoaded: false, // player character (incl. Bloxity accessories) finished loading; gates the loading screen

  // HUD stats (components/hud/HUD.jsx).
  cash: 0,
  rebirths: 0,
  rebirthProgress: 5, // % toward the next rebirth, shown over the Rebirth button
  strength: 1,
  level: 1,
  xp: 1,
  xpNeeded: 10,
  backpack: 0,
  backpackMax: 3,
  luckBoost: 0, // % shown bottom-left
}))
