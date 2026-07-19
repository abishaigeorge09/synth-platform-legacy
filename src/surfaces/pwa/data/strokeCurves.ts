/**
 * Synthetic per-stroke gate-force / gate-angle telemetry, styled after a
 * Concept2 PowerLine export (see docs reference: gate force vs. gate
 * angle, and gate angle velocity vs. gate angle — both render as closed
 * loops per stroke: a rounded "belly" through the drive, a near-flat
 * line back through the recovery).
 *
 * No real per-stroke telemetry exists in the mock dataset (only
 * aggregate 2K times / splits / rates), so this generates a believable
 * multi-stroke overlay deterministically per athlete, matching the
 * reference report's visual shape rather than real physics.
 */

export type CurvePoint = { angle: number; value: number }
export type StrokeCurve = { stroke: number; color: string; points: CurvePoint[] }

/** Distinct, saturated per-stroke colors — mirrors the reference report's
 *  cyan/black/green/blue/purple/orange/red overlay. */
export const STROKE_COLORS = [
  '#06B6D4', // cyan
  '#18181B', // near-black
  '#10B981', // green
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#F97316', // orange
  '#EF4444', // red
] as const

function prand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

/** Smooth 0→1→0 easing over t in [0,1], skewed so the peak lands past
 *  the midpoint — real drive-phase force peaks around 55-65% through. */
function skewedBell(t: number, peakAt: number): number {
  if (t <= peakAt) {
    return Math.sin((t / peakAt) * (Math.PI / 2))
  }
  return Math.cos(((t - peakAt) / (1 - peakAt)) * (Math.PI / 2))
}

const CATCH_ANGLE = -55
const FINISH_ANGLE = 38
const DRIVE_SAMPLES = 26
const RECOVERY_SAMPLES = 16

/**
 * Builds `strokeCount` overlaid closed-loop curves for one metric
 * (force or angular velocity) against gate angle. `peakSeed` offsets the
 * pseudo-random sequence so force and angle-velocity curves for the same
 * stroke set vary independently instead of moving in lockstep.
 */
function buildLoopCurves(args: {
  athleteSeed: number
  peakSeed: number
  strokeCount: number
  driveMin: number
  driveMax: number
  drivePeakAt: number
  recoveryLevel: number
  recoveryNoise: number
}): StrokeCurve[] {
  const { athleteSeed, peakSeed, strokeCount, driveMin, driveMax, drivePeakAt, recoveryLevel, recoveryNoise } = args
  const curves: StrokeCurve[] = []
  for (let s = 0; s < strokeCount; s++) {
    const seed = athleteSeed * 97 + peakSeed * 13 + s * 29
    const peak = driveMin + prand(seed) * (driveMax - driveMin)
    const peakAt = drivePeakAt + (prand(seed + 1) - 0.5) * 0.12
    const points: CurvePoint[] = []

    // Drive: catch → finish, force/velocity rises then falls.
    for (let i = 0; i <= DRIVE_SAMPLES; i++) {
      const t = i / DRIVE_SAMPLES
      const angle = CATCH_ANGLE + t * (FINISH_ANGLE - CATCH_ANGLE)
      const noise = (prand(seed + 2 + i) - 0.5) * peak * 0.03
      points.push({ angle, value: skewedBell(t, peakAt) * peak + noise })
    }
    // Recovery: finish → catch, value stays near the (usually near-zero,
    // sometimes negative for angle-velocity) recovery level.
    for (let i = 1; i <= RECOVERY_SAMPLES; i++) {
      const t = i / RECOVERY_SAMPLES
      const angle = FINISH_ANGLE - t * (FINISH_ANGLE - CATCH_ANGLE)
      const noise = (prand(seed + 60 + i) - 0.5) * recoveryNoise
      points.push({ angle, value: recoveryLevel + noise })
    }
    curves.push({ stroke: s + 1, color: STROKE_COLORS[s % STROKE_COLORS.length], points })
  }
  return curves
}

function athleteSeed(athleteId: string): number {
  let h = 0
  for (let i = 0; i < athleteId.length; i++) h = (h * 31 + athleteId.charCodeAt(i)) >>> 0
  return h % 10_000
}

/**
 * Gate force (kgf) vs. gate angle (°) — the classic rowing "power curve"
 * loop. Drive peak lands around kgf 55-90 depending on the athlete,
 * recovery hugs a near-flat line just above zero.
 */
export function buildForceAngleCurves(athleteId: string, strokeCount = 7): StrokeCurve[] {
  const seed = athleteSeed(athleteId)
  return buildLoopCurves({
    athleteSeed: seed,
    peakSeed: 1,
    strokeCount,
    driveMin: 58,
    driveMax: 92,
    drivePeakAt: 0.42,
    recoveryLevel: 4,
    recoveryNoise: 3,
  })
}

/**
 * Gate angle velocity (°/s) vs. gate angle (°) — drive swings positive
 * (oar sweeping through the water), recovery swings negative (handle
 * moving back toward the catch), forming a rounder, more symmetric loop
 * than the force curve.
 */
export function buildAngleVelocityCurves(athleteId: string, strokeCount = 7): StrokeCurve[] {
  const seed = athleteSeed(athleteId)
  const drive = buildLoopCurves({
    athleteSeed: seed,
    peakSeed: 2,
    strokeCount,
    driveMin: 95,
    driveMax: 150,
    drivePeakAt: 0.5,
    recoveryLevel: 0,
    recoveryNoise: 0,
  })
  // Recovery half needs its own negative-going bell rather than a flat
  // line, so build it separately and splice it in past the drive samples.
  for (let s = 0; s < drive.length; s++) {
    const curve = drive[s]
    const seedBase = seed * 97 + 2 * 13 + s * 29
    const troughPeak = 90 + prand(seedBase + 5) * 55
    const troughAt = 0.5 + (prand(seedBase + 6) - 0.5) * 0.1
    for (let i = 1; i <= RECOVERY_SAMPLES; i++) {
      const t = i / RECOVERY_SAMPLES
      const noise = (prand(seedBase + 70 + i) - 0.5) * troughPeak * 0.04
      curve.points[DRIVE_SAMPLES + i].value = -skewedBell(t, troughAt) * troughPeak + noise
    }
  }
  return drive
}
