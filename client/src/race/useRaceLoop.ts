import { useEffect, useRef, type RefObject } from 'react'
import type { Clock, OpponentSource, RaceState, TypingEngine } from '#/engine/types'
import { createInterpolationBuffer } from './interpolation'

const PUSH_INTERVAL_MS = 200

export function useRaceLoop({
  engine,
  clock,
  carRef,
  ghost,
  ghostCarRef,
  trackWidthPx,
  onSnapshot,
}: {
  engine: TypingEngine
  clock: Clock
  carRef: RefObject<HTMLDivElement | null>
  ghost: OpponentSource
  ghostCarRef: RefObject<HTMLDivElement | null>
  trackWidthPx: number
  onSnapshot: (state: RaceState) => void
}) {
  const lastPushRef = useRef(0)

  useEffect(() => {
    let frameId: number
    const ghostBuffer = createInterpolationBuffer()

    const tick = () => {
      const t = clock.now()
      const state = engine.sample(t)

      const car = carRef.current
      if (car) car.style.transform = `translateX(${state.progress * trackWidthPx}px)`

      const ghostSnapshot = ghost.sample(t)
      ghostBuffer.push(t, ghostSnapshot.progress)
      const ghostCar = ghostCarRef.current
      if (ghostCar) {
        ghostCar.style.transform = `translateX(${ghostBuffer.valueAt(t) * trackWidthPx}px)`
      }

      if (
        state.status === 'finished' ||
        t - lastPushRef.current >= PUSH_INTERVAL_MS
      ) {
        lastPushRef.current = t
        onSnapshot(state)
      }

      if (state.status !== 'finished') {
        frameId = requestAnimationFrame(tick)
      }
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [engine, clock, carRef, ghost, ghostCarRef, trackWidthPx, onSnapshot])
}
