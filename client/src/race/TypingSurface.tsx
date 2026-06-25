import { useEffect, useRef, type KeyboardEvent } from 'react'
import { useRace } from './RaceProvider'

export function TypingSurface({ disabled }: { disabled: boolean }) {
  const { raceState, applyEvent, now } = useRace()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus()
    }
  }, [disabled])

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (raceState.status === 'finished') {
      return
    }
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return
    }

    if (e.key === 'Backspace') {
      e.preventDefault()
      applyEvent({ kind: 'backspace', t: now() })
      return
    }

    if (e.key.length === 1) {
      e.preventDefault()
      applyEvent({ kind: 'char', char: e.key, t: now() })
    }
  }

  return (
    <div>
      <label htmlFor="typing-input" className="sr-only">
        Typing input
      </label>
      <input
        ref={inputRef}
        id="typing-input"
        type="text"
        value=""
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        disabled={disabled || raceState.status === 'finished'}
        autoComplete="off"
        className="w-full rounded border px-3 py-2 font-mono"
      />
    </div>
  )
}
