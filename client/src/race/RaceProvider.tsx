import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import { createTypingEngine } from '#/engine/engine'
import { RaceClock } from '#/engine/clock'
import type { InputEvent, RaceState, TypingEngine } from '#/engine/types'
import { useRaceLoop } from './useRaceLoop'
import { TRACK_WIDTH_PX } from './Track'

interface RaceContextValue {
  passage: string
  raceState: RaceState
  applyEvent: (e: InputEvent) => void
  now: () => number
  carRef: RefObject<HTMLDivElement | null>
}

const RaceContext = createContext<RaceContextValue | null>(null)

export function useRace(): RaceContextValue {
  const ctx = useContext(RaceContext)
  if (!ctx) throw new Error('useRace must be used within a RaceProvider')
  {
    return ctx
  }
}

export function RaceProvider({
  passage,
  children,
}: {
  passage: string
  children: ReactNode
}) {
  const engineRef = useRef<TypingEngine | null>(null)
  if (!engineRef.current) {
    engineRef.current = createTypingEngine(passage)
  }
  const engine = engineRef.current

  const clockRef = useRef<RaceClock | null>(null)
  if (!clockRef.current) {
    clockRef.current = new RaceClock()
  }
  const clock = clockRef.current

  const carRef = useRef<HTMLDivElement>(null)

  const [raceState, setRaceState] = useState<RaceState>(() =>
    engine.sample(clock.now()),
  )

  useRaceLoop({
    engine,
    clock,
    carRef,
    trackWidthPx: TRACK_WIDTH_PX,
    onSnapshot: setRaceState,
  })

  function applyEvent(e: InputEvent) {
    setRaceState(engine.apply(e))
  }

  return (
    <RaceContext.Provider
      value={{ passage, raceState, applyEvent, now: () => clock.now(), carRef }}
    >
      {children}
    </RaceContext.Provider>
  )
}
