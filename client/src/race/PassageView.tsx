import { useRace } from './RaceProvider'

export function PassageView() {
  const { passage, raceState } = useRace()
  const chars = Array.from(passage)

  return (
    <p className="font-mono text-lg leading-relaxed whitespace-pre-wrap">
      {chars.map((char, i) => {
        const isError = raceState.errors.has(i)
        const isTyped = i < raceState.cursor
        const isCursor = i === raceState.cursor

        let className = ''
        if (isError) {
          className = 'text-red-600 underline'
        } else if (isTyped) {
          className = 'text-gray-400'
        } else if (isCursor) {
          className = 'bg-yellow-200'
        }

        return (
          <span key={i} className={className}>
            {char}
          </span>
        )
      })}
    </p>
  )
}
