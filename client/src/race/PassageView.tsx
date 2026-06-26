import { useMemo } from 'react'
import { useRace } from './RaceProvider'
import { splitWords, activeWordIndex } from './words'
import { CompletedWords } from './CompletedWords'
import { ActiveWord } from './ActiveWord'
import { UpcomingWords } from './UpcomingWords'

export function PassageView() {
  const { passage, raceState } = useRace()
  const words = useMemo(() => splitWords(passage), [passage])
  const index = activeWordIndex(words, raceState.cursor)
  const word = words[index]

  return (
    <p className="font-mono text-lg leading-relaxed whitespace-pre-wrap">
      <CompletedWords words={words} endIndex={index} />
      {word && (
        <ActiveWord word={word} cursor={raceState.cursor} errors={raceState.errors} />
      )}
      <UpcomingWords words={words} startIndex={index + 1} />
    </p>
  )
}
