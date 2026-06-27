import { describe, expect, it } from 'vitest'
import { createRngGhostSource } from './ghost'

const PASSAGE = 'the quick brown fox jumps over the lazy dog' // 9 words

describe('createRngGhostSource — determinism', () => {
  it('produces identical snapshots for the same seed, sampled at the same cadence', () => {
    const configA = { id: 'ghost', seed: 1234, passage: PASSAGE, targetWpm: 50 }
    const a = createRngGhostSource(configA)
    const b = createRngGhostSource({ ...configA })

    for (let t = 0; t <= 5000; t += 200) {
      expect(a.sample(t)).toEqual(b.sample(t))
    }
  })

  it('is independent of polling cadence — same seed, different query pattern, same result at the same t', () => {
    const config = { id: 'ghost', seed: 99, passage: PASSAGE, targetWpm: 60 }
    const fineGrained = createRngGhostSource({ ...config })
    const coarse = createRngGhostSource({ ...config })

    // poll fineGrained every 16ms (simulating a 60fps loop) up to 4000ms
    let last
    for (let t = 0; t <= 4000; t += 16) {
      last = fineGrained.sample(t)
    }
    // poll coarse by jumping straight to the same final t in one call
    const direct = coarse.sample(4000)

    expect(last).toEqual(direct)
  })

  it('different seeds produce different races', () => {
    const a = createRngGhostSource({ id: 'a', seed: 1, passage: PASSAGE, targetWpm: 50 })
    const b = createRngGhostSource({ id: 'b', seed: 2, passage: PASSAGE, targetWpm: 50 })
    expect(a.sample(2000).progress).not.toBe(b.sample(2000).progress)
  })
})

describe('createRngGhostSource — edge cases', () => {
  it('never produces negative WPM', () => {
    const ghost = createRngGhostSource({
      id: 'ghost',
      seed: 7,
      passage: PASSAGE,
      targetWpm: 10, // low target + noise could push toward 0
    })
    for (let t = 0; t <= 30_000; t += 200) {
      expect(ghost.sample(t).wpm).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('createRngGhostSource — adaptive mode', () => {
  it('reverts toward the live player WPM instead of the fixed target', () => {
    let playerWpm = 0
    const ghost = createRngGhostSource({
      id: 'ghost',
      seed: 11,
      passage: PASSAGE,
      targetWpm: 40,
      mode: 'adaptive',
      getPlayerWpm: () => playerWpm,
      volatility: 0, // isolate the reversion behavior from noise
    })

    // with no player signal yet, reverts toward the fixed fallback target
    let last = ghost.sample(0).wpm
    for (let t = 200; t <= 2000; t += 200) {
      last = ghost.sample(t).wpm
    }
    expect(last).toBeCloseTo(40, 0)

    // once the player is going much faster, the ghost should climb toward it
    playerWpm = 120
    for (let t = 2200; t <= 8000; t += 200) {
      last = ghost.sample(t).wpm
    }
    expect(last).toBeGreaterThan(60)
  })
})
