import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createTypingEngine } from '#/engine/engine'
import { RaceClock } from '#/engine/clock'
import type { InputEvent, RaceState, TypingEngine } from '#/engine/types'

const TICK_MS = 200

interface RaceContextValue {
  passage: string
  raceState: RaceState
  applyEvent: (e: InputEvent) => void
  now: () => number
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

  const [raceState, setRaceState] = useState<RaceState>(() =>
    engine.sample(clock.now()),
  )

  useEffect(() => {
    if (raceState.status !== 'running') return
    const id = setInterval(() => {
      setRaceState(engine.sample(clock.now()))
    }, TICK_MS)
    return () => clearInterval(id)
  }, [raceState.status, engine, clock])

  function applyEvent(e: InputEvent) {
    setRaceState(engine.apply(e))
  }

  return (
    <RaceContext.Provider
      value={{ passage, raceState, applyEvent, now: () => clock.now() }}
    >
      {children}
    </RaceContext.Provider>
  )
}
