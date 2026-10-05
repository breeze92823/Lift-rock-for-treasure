// Whether plot `i` is drawn / collides as the upgraded two-storey home build: our own plot after the
// Base Upgrade, another player's plot when that player has upgraded (synced via systems/net.js),
// and a plot nobody owns while store.homeStyleAll.
import { useGameStore } from '../store/useGameStore.js'
import { useRemoteStore } from '../store/useRemoteStore.js'

export function plotStyled(i, game = useGameStore.getState(), remotePlots = useRemoteStore.getState().plots) {
  if (i === game.homePlot) return game.baseUpgraded
  const remote = remotePlots[i]
  return remote ? !!remote.baseUpgraded : game.homeStyleAll
}
