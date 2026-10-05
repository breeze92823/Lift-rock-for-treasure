import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../../store/useGameStore.js'
import {
  TUTORIAL_ARM, TUTORIAL_DONE, TUTORIAL_LUCK_MS, TUTORIAL_STRENGTH, TUTORIAL_TRAIN_STEPS, VETERAN_STRENGTH, onPlot,
} from '../../data/tutorial.js'
import { LIFT_ZONES, plotSlotsAt } from '../../data/world.js'
import { clearedGates } from '../../systems/liftGate.js'
import { player } from '../../systems/playerState.js'
import { DEV_MODE } from '../../data/bloxity.js'

const shortStrength = (n, max) => Math.min(n, max).toLocaleString('en-US')
const set = (patch) => useGameStore.setState(patch)

// Steps that finish when something non-reactive happens (a gate flying off, the player walking
// somewhere): poll `check` while the step shows and move to `next` when it passes.
function usePoll(step, at, next, check) {
  useEffect(() => {
    if (step !== at) return
    const id = setInterval(() => {
      if (check()) set({ tutorialStep: next })
    }, 200)
    return () => clearInterval(id)
  }, [step, at, next, check])
}

const firstGateThrown = () => clearedGates.has(LIFT_ZONES[0].luck)
const onHomePlot = () => onPlot(useGameStore.getState().homePlot, player.position.x, player.position.z)
const nearSlot = () => {
  const slot = plotSlotsAt(useGameStore.getState().homePlot)[0]
  return Math.hypot(player.position.x - slot.x, player.position.z - slot.z) < 3
}

// Advances the tutorial. Starts once saved progress is known; the step is saved with the account
// (systems/net.js), so finished players never see it again and others resume at their step.
// Only ever moves forward (apart from the Index steps, which back up if the window is closed early).
export function useTutorialProgress() {
  const progressLoaded = useGameStore((s) => s.progressLoaded) || DEV_MODE
  const step = useGameStore((s) => s.tutorialStep)
  const strength = useGameStore((s) => s.strength)
  const rebirths = useGameStore((s) => s.rebirths)
  const hasLoot = useGameStore((s) => s.inventory.length > 0)
  const uncommons = useGameStore((s) => s.inventory.filter((it) => it.rarity === 'Uncommon').length)
  const cash = useGameStore((s) => s.cash)
  const ownsArm = useGameStore((s) => s.ownedArms.includes(TUTORIAL_ARM))
  const indexOpen = useGameStore((s) => s.indexOpen)
  const heldName = useGameStore((s) => s.heldItem?.name)
  const placed = useGameStore((s) => Object.keys(s.plotSlots).length > 0)
  const baseUncommons = useRef(null)

  useEffect(() => {
    if (!progressLoaded) return
    if (!useGameStore.getState().tutorialActive) {
      // The saved step (systems/net.js) decides: a finished tutorial never shows again and an
      // unfinished one resumes where it stopped. Only a fresh step 0 can still be skipped as a
      // veteran (no saved step to go by, e.g. offline).
      if (step >= TUTORIAL_DONE) return
      const veteran = step === 0 && import.meta.env.MODE === 'production' && (rebirths > 0 || strength > VETERAN_STRENGTH)
      if (veteran) set({ tutorialStep: TUTORIAL_DONE, tutorialActive: false })
      else set({ tutorialActive: true })
      return
    }
    const goal = TUTORIAL_TRAIN_STEPS[step]
    if (step === 0 && strength >= TUTORIAL_STRENGTH) set({ tutorialStep: 1 })
    else if (step === 2 && (hasLoot || cash > 0)) set({ tutorialStep: 3 })
    else if (step === 3 && cash > 0) set({ tutorialStep: 4 })
    else if (step === 4 && ownsArm) set({ tutorialStep: 5 })
    else if (goal && strength >= goal) set({ tutorialStep: step + 1 }) // 5 -> 6, 8 -> 9
    else if (step === 12 && indexOpen) set({ tutorialStep: 13 })
    else if ((step === 13 || step === 14) && !indexOpen) set({ tutorialStep: 12 }) // closed too early: open it again
    else if (step === 14 && heldName && heldName === useGameStore.getState().tutorialItem) set({ tutorialStep: 15 })
    else if (step === 15 && !indexOpen) set({ tutorialStep: 16 })
    else if (step === 16 && placed) set({ tutorialStep: 17 })
  }, [progressLoaded, step, strength, rebirths, hasLoot, cash, ownsArm, indexOpen, heldName, placed])

  // Step 10: an Uncommon item newly in the backpack (not one carried over from earlier).
  useEffect(() => {
    if (step !== 10) {
      baseUncommons.current = null
      return
    }
    if (baseUncommons.current == null) baseUncommons.current = uncommons
    else if (uncommons > baseUncommons.current) {
      const item = useGameStore.getState().inventory.findLast((it) => it.rarity === 'Uncommon')
      set({ tutorialStep: 11, tutorialItem: item?.name ?? null })
    }
  }, [step, uncommons])

  usePoll(step, 1, 2, firstGateThrown)
  usePoll(step, 6, 7, onHomePlot)
  usePoll(step, 9, 10, firstGateThrown)
  usePoll(step, 11, 12, nearSlot)

  // Step 17 is just a message: after a few seconds the tutorial is complete.
  useEffect(() => {
    if (step !== 17) return
    const id = setTimeout(() => set({ tutorialStep: TUTORIAL_DONE }), TUTORIAL_LUCK_MS)
    return () => clearTimeout(id)
  }, [step])
}

// player.training is mutated in place (not reactive): poll it while a training step is showing.
function useIsTraining(enabled) {
  const [training, setTraining] = useState(false)
  useEffect(() => {
    if (!enabled) return
    const id = setInterval(() => setTraining(player.training != null), 150)
    return () => clearInterval(id)
  }, [enabled])
  return enabled && training
}

// Yellow quest banner under the Spawn / Home buttons. After the last step it says
// COMPLETE for 10 s, pops out, then unmounts.
export default function TutorialBanner() {
  useTutorialProgress()
  const active = useGameStore((s) => s.tutorialActive)
  const step = useGameStore((s) => s.tutorialStep)
  const strength = useGameStore((s) => s.strength)
  const done = step === TUTORIAL_DONE
  const trainGoal = TUTORIAL_TRAIN_STEPS[step]
  const training = useIsTraining(trainGoal != null)
  const [phase, setPhase] = useState('show') // 'show' | 'leaving' | 'gone'

  useEffect(() => {
    if (!done) return
    const leave = setTimeout(() => setPhase('leaving'), 10000)
    const gone = setTimeout(() => setPhase('gone'), 10000 + 500)
    return () => {
      clearTimeout(leave)
      clearTimeout(gone)
    }
  }, [done])

  if (!active || phase === 'gone') return null
  return (
    <div className={`quest${step === 17 ? ' is-long' : ''}${phase === 'leaving' ? ' quest-leaving' : ''}`}>
      <div className="quest-tag rbx">{done ? 'COMPLETE' : 'TUTORIAL'}</div>
      <div className="quest-text rbx">
        {step === 0 && `TAP TO TRAIN (${shortStrength(strength, TUTORIAL_STRENGTH)}/${TUTORIAL_STRENGTH})`}
        {step === 1 && 'LIFT A ROCK!'}
        {step === 2 && 'GRAB SOME LOOT'}
        {step === 3 && 'SELL YOUR LOOT'}
        {step === 4 && 'BUY THE DIRT ARM'}
        {trainGoal != null && (training
          ? `TRAIN TILL ${trainGoal} STRENGTH (${shortStrength(strength, trainGoal)}/${trainGoal})`
          : 'TRAIN ON THE STARTER PAD')}
        {step === 6 && 'GO TO YOUR HOME PLOT'}
        {step === 7 && 'REBIRTH NOW'}
        {step === 9 && 'LIFT A ROCK!'}
        {step === 10 && 'GRAB THE UNCOMMON ITEM'}
        {step === 11 && 'GO TO YOUR TREASURE SLOT'}
        {step === 12 && 'OPEN THE INDEX'}
        {step === 13 && 'SCROLL DOWN'}
        {step === 14 && 'EQUIP YOUR UNCOMMON ITEM'}
        {step === 15 && 'CLOSE THE WINDOW'}
        {step === 16 && 'PRESS E TO PLACE IT'}
        {step === 17 && 'PLACING TREASURES RAISES YOUR TOTAL LUCK, SO YOU HAVE A BETTER CHANCE OF FINDING RARER ITEMS WHEN YOU LOOT!'}
        {done && 'TUTORIAL COMPLETE'}
      </div>
    </div>
  )
}
