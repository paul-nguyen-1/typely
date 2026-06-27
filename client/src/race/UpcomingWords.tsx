import { memo } from 'react'
import type { Word } from './words'

export const UpcomingWords = memo(function UpcomingWords({
  words,
  startIndex,
}: {
  words: Word[]
  startIndex: number
}) {
  const text = words
    .slice(startIndex)
    .map((w) => w.text)
    .join('')

  return <span>{text}</span>
})
