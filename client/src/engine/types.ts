export interface RaceState {
  status: 'idle' | 'running' | 'finished'
  cursor: number // chars committed
  errors: ReadonlySet<number> // indices typed incorrectly
  progress: number // 0..1 — drives the car
  wpm: number // net, smoothed
  accuracy: number // 0..1
  elapsedMs: number
}

export type InputEvent =
  | { kind: 'char'; char: string; t: number }
  | { kind: 'backspace'; t: number }

export interface Clock {
  now(): number
} // performance.now() in prod, manual in tests

export interface TypingEngine {
  readonly passage: string
  apply(e: InputEvent): RaceState // pure transition on a keystroke
  sample(t: number): RaceState // recompute time-derived fields at time t
  reset(): void
}

export interface Snapshot {
  id: string
  progress: number
  wpm: number
}

export interface OpponentSource {
  sample(t: number): Snapshot
} // same t as the engine
