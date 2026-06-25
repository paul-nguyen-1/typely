import { useRace } from './RaceProvider'

export function StatsHUD() {
  const { raceState } = useRace()

  return (
    <div className="flex gap-6 font-mono text-sm">
      <span>WPM: {Math.round(raceState.wpm)}</span>
      <span>Accuracy: {Math.round(raceState.accuracy * 100)}%</span>
      <span>Progress: {Math.round(raceState.progress * 100)}%</span>
      <span>Time: {(raceState.elapsedMs / 1000).toFixed(1)}s</span>
      <span>Status: {raceState.status}</span>
    </div>
  )
}
