import type { InputEvent, RaceState, TypingEngine } from './types'

const WPM_SUPPRESS_MS = 1000

function toGraphemes(passage: string): string[] {
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  return Array.from(segmenter.segment(passage), (s) => s.segment)
}

export function createTypingEngine(passage: string): TypingEngine {
  const graphemes = toGraphemes(passage)
  const length = graphemes.length

  let cursor = 0
  let errors = new Set<number>()
  let totalKeystrokes = 0
  let totalMistakes = 0
  let startTime: number | null = null
  let endTime: number | null = null

  function status(): RaceState['status'] {
    if (startTime === null) {
      return 'idle'
    }
    if (cursor >= length) {
      return 'finished'
    }
    return 'running'
  }

  function accuracy(): number {
    if (totalKeystrokes === 0) {
      return 1
    }
    return (totalKeystrokes - totalMistakes) / totalKeystrokes
  }

  function wpm(elapsedMs: number): number {
    if (elapsedMs < WPM_SUPPRESS_MS) {
      return 0
    }
    const correctChars = cursor - errors.size
    const minutes = elapsedMs / 60000
    return correctChars / 5 / minutes
  }

  function snapshot(t: number): RaceState {
    const elapsedMs = startTime === null ? 0 : (endTime ?? t) - startTime
    return {
      status: status(),
      cursor,
      errors: new Set(errors),
      progress: length === 0 ? 1 : cursor / length,
      wpm: wpm(elapsedMs),
      accuracy: accuracy(),
      elapsedMs,
    }
  }

  return {
    passage,

    apply(e: InputEvent): RaceState {
      if (status() === 'finished') return snapshot(e.t)
      if (startTime === null) startTime = e.t

      if (e.kind === 'backspace') {
        if (cursor > 0) {
          cursor -= 1
          errors.delete(cursor)
        }
      } else if (cursor < length) {
        totalKeystrokes += 1
        if (graphemes[cursor] !== e.char) {
          errors.add(cursor)
          totalMistakes += 1
        }
        cursor += 1
        if (cursor === length) endTime = e.t
      }

      return snapshot(e.t)
    },

    sample(t: number): RaceState {
      return snapshot(t)
    },

    reset(): void {
      cursor = 0
      errors = new Set()
      totalKeystrokes = 0
      totalMistakes = 0
      startTime = null
      endTime = null
    },
  }
}
