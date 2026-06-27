export interface Word {
  text: string // includes its trailing space, except possibly the last word
  start: number
  end: number // exclusive
}

export function splitWords(passage: string): Word[] {
  const chars = Array.from(passage)
  const words: Word[] = []
  let start = 0

  for (let i = 0; i < chars.length; i++) {
    if (chars[i] === ' ') {
      words.push({ text: chars.slice(start, i + 1).join(''), start, end: i + 1 })
      start = i + 1
    }
  }
  if (start < chars.length) {
    words.push({ text: chars.slice(start).join(''), start, end: chars.length })
  }

  return words
}

export function activeWordIndex(words: Word[], cursor: number): number {
  for (let i = 0; i < words.length; i++) {
    if (cursor < words[i].end) return i
  }
  return words.length - 1
}
