import type { Clock } from './types'

export class RaceClock implements Clock {
  now(): number {
    return performance.now()
  }
}

export class ManualClock implements Clock {
  private time = 0

  now(): number {
    return this.time
  }

  set(time: number): void {
    this.time = time
  }

  advance(ms: number): void {
    this.time += ms
  }
}
