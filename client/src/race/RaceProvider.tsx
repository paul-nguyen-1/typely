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
import { createRngGhostSource } from '#/engine/ghost'
import type { InputEvent, OpponentSource, RaceState, TypingEngine } from '#/engine/types'
import { useRaceLoop } from './useRaceLoop'
import { TRACK_WIDTH_PX } from './Track'

const GHOST_TARGET_WPM = 50

interface RaceContextValue {
  passage: string
  raceState: RaceState
  applyEvent: (e: InputEvent) => void
  now: () => number
  carRef: RefObject<HTMLDivElement | null>
  ghostCarRef: RefObject<HTMLDivElement | null>
  seed: number
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
  const ghostCarRef = useRef<HTMLDivElement>(null)

  const seedRef = useRef<number | null>(null)
  if (seedRef.current === null) seedRef.current = Math.floor(Math.random() * 2 ** 31)
  const seed = seedRef.current

  const ghostRef = useRef<OpponentSource | null>(null)
  if (!ghostRef.current) {
    ghostRef.current = createRngGhostSource({
      id: 'ghost',
      seed,
      passage,
      targetWpm: GHOST_TARGET_WPM,
    })
  }
  const ghost = ghostRef.current

  const [raceState, setRaceState] = useState<RaceState>(() =>
    engine.sample(clock.now()),
  )

  useRaceLoop({
    engine,
    clock,
    carRef,
    ghost,
    ghostCarRef,
    trackWidthPx: TRACK_WIDTH_PX,
    onSnapshot: setRaceState,
  })

  function applyEvent(e: InputEvent) {
    setRaceState(engine.apply(e))
  }

  return (
    <RaceContext.Provider
      value={{
        passage,
        raceState,
        applyEvent,
        now: () => clock.now(),
        carRef,
        ghostCarRef,
        seed,
      }}
    >
      {children}
    </RaceContext.Provider>
  )
}
