// Smooths a low-cadence stream of progress values (e.g. ~5/sec snapshots from
// an OpponentSource) into a continuous value for a 60fps render loop. New
// values are detected by change, not by a timestamp the source doesn't expose.
export function createInterpolationBuffer() {
  let prevT = 0
  let prevValue = 0
  let currT = 0
  let currValue = 0
  let hasValue = false

  function push(t: number, value: number): void {
    if (!hasValue) {
      hasValue = true
      prevT = t
      prevValue = value
      currT = t
      currValue = value
      return
    }
    if (value === currValue) return

    prevT = currT
    prevValue = currValue
    currT = t
    currValue = value
  }

  function valueAt(t: number): number {
    if (!hasValue) return 0
    const span = currT - prevT
    if (span <= 0) return currValue
    const frac = Math.min(Math.max((t - prevT) / span, 0), 1)
    return prevValue + (currValue - prevValue) * frac
  }

  return { push, valueAt }
}
