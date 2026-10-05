const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi']

// 1000 -> $1K, 71400000 -> $71.4M, 450 -> $450
export function shortMoney(n) {
  let i = 0
  while (n >= 1000 && i < SUFFIXES.length - 1) {
    n /= 1000
    i++
  }
  return `$${n.toFixed(1).replace(/\.0$/, '')}${SUFFIXES[i]}`
}
