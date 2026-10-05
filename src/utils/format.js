const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc']

// 173e12 -> '173.0T', 906.88e12 -> '906.88T'. Two decimals max, trailing zeros kept to one.
export function compactNumber(n) {
  let i = 0
  while (n >= 1000 && i < SUFFIXES.length - 1) {
    n /= 1000
    i++
  }
  const fixed = i === 0 ? String(Math.floor(n)) : n.toFixed(2).replace(/(\.\d)0$/, '$1')
  return fixed + SUFFIXES[i]
}

export const formatCash = (n) => `$${compactNumber(n)}`

// Seconds -> '6d 11h' (days+hours), '3h 20m', or '12m'.
export function formatDuration(sec) {
  const d = Math.floor(sec / 86400)
  const h = Math.floor((sec % 86400) / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}
