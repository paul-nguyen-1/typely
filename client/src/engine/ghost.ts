import { mulberry32 } from './prng'
import type { OpponentSource, Snapshot } from './types'

const STEP_MS = 200 // ~5 snapshots/sec
const REVERSION_RATE = 0.15
const STUMBLE_PROBABILITY = 0.04
const STUMBLE_FACTOR = 0.35

export interface GhostConfig {
  id: string
  seed: number
  passage: string
  targetWpm: number
  /** 'fixed' (default): reverts to targetWpm. 'adaptive': reverts to the player's
   * live WPM (falling back to targetWpm while that's 0), for a rubber-band race. */
  mode?: 'fixed' | 'adaptive'
  getPlayerWpm?: () => number
  /** Standard deviation of the per-step random walk noise. Defaults to 12% of targetWpm. */
  volatility?: number
}

function nextGaussian(rng: () => number): number {
  // Box-Muller transform; clamp away from 0 so log() never sees it.
  const u1 = Math.max(rng(), Number.EPSILON)
  const u2 = rng()
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

function countWords(passage: string): number {
  const trimmed = passage.trim()
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length
}

export function createRngGhostSource(config: GhostConfig): OpponentSource {
  const rng = mulberry32(config.seed)
  const sigma = config.volatility ?? config.targetWpm * 0.12
  const totalWords = countWords(config.passage)

  const wpmSteps: number[] = [config.targetWpm]
  const cumulativeWords: number[] = [0]

  function reversionTarget(): number {
    if (config.mode === 'adaptive' && config.getPlayerWpm) {
      const playerWpm = config.getPlayerWpm()
      return playerWpm > 0 ? playerWpm : config.targetWpm
    }
    return config.targetWpm
  }

  function ensureStep(index: number): void {
    while (wpmSteps.length <= index) {
      const prev = wpmSteps[wpmSteps.length - 1]
      let next = prev + REVERSION_RATE * (reversionTarget() - prev) + sigma * nextGaussian(rng)

      if (rng() < STUMBLE_PROBABILITY) next *= STUMBLE_FACTOR
      next = Math.max(next, 0)

      wpmSteps.push(next)
      const wordsThisStep = next * (STEP_MS / 60000)
      cumulativeWords.push(cumulativeWords[cumulativeWords.length - 1] + wordsThisStep)
    }
  }

  return {
    sample(t: number): Snapshot {
      const index = Math.max(0, Math.floor(t / STEP_MS))
      ensureStep(index)

      const progress =
        totalWords === 0 ? 1 : Math.min(cumulativeWords[index] / totalWords, 1)

      return { id: config.id, progress, wpm: wpmSteps[index] }
    },
  }
}
