// Strength needed to pass from level N to N+1, in multiples of 10, two levels per step:
// 1->2: 10, 2->3: 10, 3->4: 20, 4->5: 20, 5->6: 30, 6->7: 30, ...
export function strengthForNextLevel(level) {
  return 10 * Math.ceil(level / 2)
}

// Level needed for the next rebirth: 20, 40, 80, 160, ... (doubles each rebirth).
export function levelForRebirth(rebirths) {
  return 20 * 2 ** rebirths
}

// Cash and strength multiplier: x1, x1.5, x2, ... (+0.5 per rebirth).
export function rebirthMultiplier(rebirths) {
  return 1 + 0.5 * rebirths
}
