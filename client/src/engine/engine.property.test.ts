import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { createTypingEngine } from './engine'

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz '.split('')
const passageArb = fc
  .array(fc.constantFrom(...ALPHABET), { minLength: 1, maxLength: 40 })
  .map((chars) => chars.join(''))

describe('createTypingEngine — properties', () => {
  it('progress is monotonic non-decreasing and <= 1 for forward-only typing; accuracy stays in [0,1]', () => {
    fc.assert(
      fc.property(
        passageArb,
        fc.array(fc.boolean(), { minLength: 1, maxLength: 40 }),
        (passage, correctFlags) => {
          const engine = createTypingEngine(passage)
          let prevProgress = 0
          let t = 0

          for (let i = 0; i < passage.length && i < correctFlags.length; i++) {
            const isCorrect = correctFlags[i]
            const expected = passage[i]
            const char = isCorrect ? expected : expected === 'x' ? 'y' : 'x'
            t += 10

            const state = engine.apply({ kind: 'char', char, t })

            expect(state.progress).toBeGreaterThanOrEqual(prevProgress)
            expect(state.progress).toBeLessThanOrEqual(1)
            expect(state.accuracy).toBeGreaterThanOrEqual(0)
            expect(state.accuracy).toBeLessThanOrEqual(1)

            prevProgress = state.progress
          }
        },
      ),
    )
  })

  it('backspace at cursor 0 is always a no-op', () => {
    fc.assert(
      fc.property(passageArb, fc.nat(1_000_000), (passage, t) => {
        const engine = createTypingEngine(passage)
        const state = engine.apply({ kind: 'backspace', t })
        expect(state.cursor).toBe(0)
        expect(state.errors.size).toBe(0)
      }),
    )
  })
})
