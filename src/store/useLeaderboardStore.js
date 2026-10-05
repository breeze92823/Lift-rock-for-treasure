import { create } from 'zustand'

// Top saved players from the server (systems/net.js): { name, value } per board, best first.
export const useLeaderboardStore = create(() => ({
  cash: [],
  strength: [],
  playTime: [],
}))
