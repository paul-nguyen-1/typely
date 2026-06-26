import { useRace } from './RaceProvider'

export function RacerCar() {
  const { carRef } = useRace()

  return (
    <div
      ref={carRef}
      data-testid="racer-car"
      className="absolute top-1/2 left-0 h-6 w-6 -translate-y-1/2 rounded-full bg-blue-600"
    />
  )
}
