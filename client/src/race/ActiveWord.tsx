import type { Word } from './words'

export function ActiveWord({
  word,
  cursor,
  errors,
}: {
  word: Word
  cursor: number
  errors: ReadonlySet<number>
}) {
  const chars = Array.from(word.text)

  return (
    <span>
      {chars.map((char, offset) => {
        const i = word.start + offset
        const isError = errors.has(i)
        const isTyped = i < cursor
        const isCursor = i === cursor

        let className = ''
        if (isError) className = 'text-red-600 underline'
        else if (isTyped) className = 'text-gray-400'
        else if (isCursor) className = 'bg-yellow-200'

        return (
          <span key={i} className={className}>
            {char}
          </span>
        )
      })}
    </span>
  )
}
