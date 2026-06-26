import { memo } from 'react'
import type { Word } from './words'

export const CompletedWords = memo(function CompletedWords({
  words,
  endIndex,
}: {
  words: Word[]
  endIndex: number
}) {
  const text = words
    .slice(0, endIndex)
    .map((w) => w.text)
    .join('')

  return <span className="text-gray-400">{text}</span>
})
