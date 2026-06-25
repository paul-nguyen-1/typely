import { describe, expect, it } from 'vitest'
import { createTypingEngine } from './engine'

function expectState(
  state: ReturnType<ReturnType<typeof createTypingEngine>['apply']>,
  expected: {
    status: 'idle' | 'running' | 'finished'
    cursor: number
    errors: number[]
    progress: number
    accuracy: number
    elapsedMs: number
    wpm?: number
  },
) {
  expect(state.status).toBe(expected.status)
  expect(state.cursor).toBe(expected.cursor)
  expect(state.errors).toEqual(new Set(expected.errors))
  expect(state.progress).toBeCloseTo(expected.progress, 10)
  expect(state.accuracy).toBeCloseTo(expected.accuracy, 10)
  expect(state.elapsedMs).toBe(expected.elapsedMs)
  if (expected.wpm !== undefined) expect(state.wpm).toBeCloseTo(expected.wpm, 5)
}

describe('createTypingEngine — known sequence', () => {
  it('produces the exact RaceState at each step for "cat"', () => {
    const engine = createTypingEngine('cat')

    // type 'c' (correct)
    let state = engine.apply({ kind: 'char', char: 'c', t: 0 })
    expectState(state, {
      status: 'running',
      cursor: 1,
      errors: [],
      progress: 1 / 3,
      accuracy: 1,
      elapsedMs: 0,
      wpm: 0, // suppressed, < 1000ms
    })

    // type 'x' instead of 'a' (wrong)
    state = engine.apply({ kind: 'char', char: 'x', t: 1100 })
    expectState(state, {
      status: 'running',
      cursor: 2,
      errors: [1],
      progress: 2 / 3,
      accuracy: 0.5,
      elapsedMs: 1100,
      wpm: 1 / 5 / (1100 / 60000),
    })

    // backspace erases the wrong char and its error flag
    state = engine.apply({ kind: 'backspace', t: 1200 })
    expectState(state, {
      status: 'running',
      cursor: 1,
      errors: [],
      progress: 1 / 3,
      accuracy: 1,
      elapsedMs: 1200,
      wpm: 1 / 5 / (1200 / 60000),
    })

    // retype 'a' correctly
    state = engine.apply({ kind: 'char', char: 'a', t: 1300 })
    expectState(state, {
      status: 'running',
      cursor: 2,
      errors: [],
      progress: 2 / 3,
      accuracy: 1,
      elapsedMs: 1300,
      wpm: 2 / 5 / (1300 / 60000),
    })

    // finish with 't'
    state = engine.apply({ kind: 'char', char: 't', t: 2000 })
    expectState(state, {
      status: 'finished',
      cursor: 3,
      errors: [],
      progress: 1,
      accuracy: 1,
      elapsedMs: 2000,
      wpm: 3 / 5 / (2000 / 60000),
    })
  })
})

describe('createTypingEngine — edge cases', () => {
  it('ignores char input once the passage is finished, freezing elapsedMs', () => {
    const engine = createTypingEngine('ab')
    engine.apply({ kind: 'char', char: 'a', t: 0 })
    engine.apply({ kind: 'char', char: 'b', t: 1000 })

    const state = engine.apply({ kind: 'char', char: 'z', t: 9000 })
    expect(state.status).toBe('finished')
    expect(state.cursor).toBe(2)
    expect(state.elapsedMs).toBe(1000) // frozen at finish time, not 9000

    const sampled = engine.sample(50_000)
    expect(sampled.elapsedMs).toBe(1000)
  })

  it('treats backspace at cursor 0 as a no-op (cursor/errors unaffected)', () => {
    const engine = createTypingEngine('cat')
    const state = engine.apply({ kind: 'backspace', t: 0 })
    expect(state.cursor).toBe(0)
    expect(state.errors.size).toBe(0)
  })

  it('does not split a grapheme cluster (emoji as a single unit)', () => {
    const passage = '😀a' // surrogate pair + 'a'; passage.length === 3 in UTF-16, but 2 graphemes
    const engine = createTypingEngine(passage)

    let state = engine.apply({ kind: 'char', char: '😀', t: 0 })
    expect(state.cursor).toBe(1)
    expect(state.progress).toBeCloseTo(0.5, 10)

    state = engine.apply({ kind: 'char', char: 'a', t: 1000 })
    expect(state.cursor).toBe(2)
    expect(state.status).toBe('finished')
  })

  it('handles two events sharing the same timestamp without producing NaN', () => {
    const engine = createTypingEngine('ab')
    engine.apply({ kind: 'char', char: 'a', t: 500 })
    const state = engine.apply({ kind: 'char', char: 'b', t: 500 })
    expect(state.elapsedMs).toBe(0)
    expect(Number.isNaN(state.wpm)).toBe(false)
    expect(state.status).toBe('finished')
  })
})

describe('createTypingEngine — reset', () => {
  it('returns to idle state', () => {
    const engine = createTypingEngine('cat')
    engine.apply({ kind: 'char', char: 'c', t: 0 })
    engine.reset()
    const state = engine.sample(0)
    expect(state.status).toBe('idle')
    expect(state.cursor).toBe(0)
    expect(state.elapsedMs).toBe(0)
  })
})
