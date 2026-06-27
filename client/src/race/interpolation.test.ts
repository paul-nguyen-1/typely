import { describe, expect, it } from 'vitest'
import { createInterpolationBuffer } from './interpolation'

describe('createInterpolationBuffer', () => {
  it('returns 0 before any value is pushed', () => {
    const buffer = createInterpolationBuffer()
    expect(buffer.valueAt(0)).toBe(0)
  })

  it('holds steady at the first pushed value until a second arrives', () => {
    const buffer = createInterpolationBuffer()
    buffer.push(0, 0.2)
    expect(buffer.valueAt(0)).toBe(0.2)
    expect(buffer.valueAt(100)).toBe(0.2)
  })

  it('linearly interpolates between the last two distinct values', () => {
    const buffer = createInterpolationBuffer()
    buffer.push(0, 0.0)
    buffer.push(200, 0.2) // a new value arrives 200ms later

    expect(buffer.valueAt(0)).toBeCloseTo(0, 10)
    expect(buffer.valueAt(100)).toBeCloseTo(0.1, 10) // halfway through the span
    expect(buffer.valueAt(200)).toBeCloseTo(0.2, 10)
  })

  it('clamps to the latest value when queried past it (no extrapolation)', () => {
    const buffer = createInterpolationBuffer()
    buffer.push(0, 0.0)
    buffer.push(200, 0.2)
    expect(buffer.valueAt(500)).toBeCloseTo(0.2, 10)
  })

  it('ignores repeated pushes of the same value (does not reset the span)', () => {
    const buffer = createInterpolationBuffer()
    buffer.push(0, 0.0)
    buffer.push(200, 0.2)
    buffer.push(250, 0.2) // same value again, e.g. a re-poll of the same step
    expect(buffer.valueAt(250)).toBeCloseTo(0.2, 10)
  })
})
