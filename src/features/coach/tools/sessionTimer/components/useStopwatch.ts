import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * requestAnimationFrame-driven stopwatch. Keeps a live `elapsed` value plus
 * a `splits` array (cumulative ms per split). Self-contained — one hook
 * per BoatTimerCard.
 */
export type Split = {
  index: number
  totalMs: number
  intervalMs: number
}

export type StopwatchState =
  | 'idle'
  | 'running'
  | 'paused'
  | 'finished'

export function useStopwatch() {
  const [state, setState] = useState<StopwatchState>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [splits, setSplits] = useState<Split[]>([])

  const startTimeRef = useRef<number>(0)
  const pausedAccumRef = useRef<number>(0)
  const pauseStartRef = useRef<number>(0)
  const rafRef = useRef<number>(0)

  const tick = useCallback(() => {
    const now = performance.now()
    setElapsed(now - startTimeRef.current - pausedAccumRef.current)
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    if (state === 'running') {
      rafRef.current = requestAnimationFrame(tick)
    }
    return () => cancelAnimationFrame(rafRef.current)
  }, [state, tick])

  const start = useCallback(() => {
    if (state === 'idle') {
      startTimeRef.current = performance.now()
      pausedAccumRef.current = 0
      setSplits([])
      setElapsed(0)
    } else if (state === 'paused') {
      pausedAccumRef.current += performance.now() - pauseStartRef.current
    }
    setState('running')
  }, [state])

  const pause = useCallback(() => {
    if (state !== 'running') return
    pauseStartRef.current = performance.now()
    setState('paused')
  }, [state])

  const split = useCallback(() => {
    if (state !== 'running') return
    const now = performance.now()
    const totalMs = now - startTimeRef.current - pausedAccumRef.current
    setSplits((prev) => {
      const prevTotal = prev.length > 0 ? prev[prev.length - 1].totalMs : 0
      return [
        ...prev,
        {
          index: prev.length + 1,
          totalMs,
          intervalMs: totalMs - prevTotal,
        },
      ]
    })
  }, [state])

  const finish = useCallback(() => {
    if (state === 'idle') return
    setState('finished')
  }, [state])

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    startTimeRef.current = 0
    pausedAccumRef.current = 0
    pauseStartRef.current = 0
    setElapsed(0)
    setSplits([])
    setState('idle')
  }, [])

  return { state, elapsed, splits, start, pause, split, finish, reset }
}

export function fmtElapsed(ms: number) {
  const totalSec = Math.max(0, ms) / 1000
  const mins = Math.floor(totalSec / 60)
  const secs = totalSec - mins * 60
  return `${String(mins).padStart(2, '0')}:${secs.toFixed(2).padStart(5, '0')}`
}

export function fmtInterval(ms: number) {
  const totalSec = Math.max(0, ms) / 1000
  if (totalSec >= 60) {
    const m = Math.floor(totalSec / 60)
    const s = totalSec - m * 60
    return `${m}:${s.toFixed(1).padStart(4, '0')}`
  }
  return `${totalSec.toFixed(2)}s`
}
