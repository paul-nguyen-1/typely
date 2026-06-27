import { useRace } from './RaceProvider'

export function GhostCar() {
  const { ghostCarRef } = useRace()

  return (
    <div
      ref={ghostCarRef}
      data-testid="ghost-car"
      className="absolute top-3/4 left-0 h-6 w-6 -translate-y-1/2 rounded-full bg-gray-400 opacity-70"
    />
  )
}
