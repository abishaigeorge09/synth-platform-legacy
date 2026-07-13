const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Parse M:SS.s or MM:SS.s → total seconds */
export function parseTimeToSec(t: string): number {
  const parts = t.trim().split(':')
  if (parts.length === 2) {
    return parseInt(parts[0], 10) * 60 + parseFloat(parts[1])
  }
  if (parts.length === 3) {
    return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseFloat(parts[2])
  }
  return 0
}

export function formatSecAs2k(sec: number): string {
  const m = Math.floor(sec / 60)
  const rem = sec - m * 60
  return `${m}:${rem.toFixed(1).padStart(4, '0')}`
}

export function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

export function formatTrend(deltaSec: number): string {
  if (Math.abs(deltaSec) < 0.15) return '→ even'
  if (deltaSec < 0) return `↑ ${Math.abs(deltaSec).toFixed(1)}s faster`
  return `↓ ${deltaSec.toFixed(1)}s slower`
}
