import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { createRngGhostSource } from './ghost'

const PASSAGE = 'the quick brown fox jumps over the lazy dog' // 9 words
const seedArb = fc.integer({ min: 0, max: 2 ** 31 - 1 })
const targetWpmArb = fc.integer({ min: 20, max: 150 })

describe('createRngGhostSource — properties', () => {
  it('same seed produces identical snapshots, for any seed/target', () => {
    fc.assert(
      fc.property(seedArb, targetWpmArb, (seed, targetWpm) => {
        const a = createRngGhostSource({ id: 'a', seed, passage: PASSAGE, targetWpm })
        const b = createRngGhostSource({ id: 'a', seed, passage: PASSAGE, targetWpm })

        for (let t = 0; t <= 10_000; t += 200) {
          expect(a.sample(t)).toEqual(b.sample(t))
        }
      }),
      { numRuns: 25 },
    )
  })

  it('progress is monotonic non-decreasing and <= 1, for any seed/target', () => {
    fc.assert(
      fc.property(seedArb, targetWpmArb, (seed, targetWpm) => {
        const ghost = createRngGhostSource({ id: 'g', seed, passage: PASSAGE, targetWpm })

        let prevProgress = 0
        for (let t = 0; t <= 30_000; t += 200) {
          const { progress } = ghost.sample(t)
          expect(progress).toBeGreaterThanOrEqual(prevProgress)
          expect(progress).toBeLessThanOrEqual(1)
          prevProgress = progress
        }
      }),
      { numRuns: 25 },
    )
  })

  it('mean instantaneous WPM stays within tolerance of the target, for any seed/target', () => {
    fc.assert(
      fc.property(seedArb, targetWpmArb, (seed, targetWpm) => {
        const ghost = createRngGhostSource({ id: 'g', seed, passage: PASSAGE, targetWpm })

        const samples: number[] = []
        for (let t = 0; t <= 120_000; t += 200) {
          samples.push(ghost.sample(t).wpm)
        }
        const mean = samples.reduce((sum, v) => sum + v, 0) / samples.length

        // mean-reverting walk + occasional one-sided stumbles bias the mean
        // slightly low; generous tolerance keeps this non-flaky across seeds.
        expect(mean).toBeGreaterThan(targetWpm * 0.7)
        expect(mean).toBeLessThan(targetWpm * 1.2)
      }),
      { numRuns: 25 },
    )
  })
})
