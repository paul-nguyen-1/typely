export type Prng = () => number // returns a float in [0, 1)

// mulberry32 — small, fast, deterministic given the same seed.
export function mulberry32(seed: number): Prng {
  let a = seed
  return function next() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
