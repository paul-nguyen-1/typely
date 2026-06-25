import { useEffect, useRef, useState } from 'react'

export function Countdown({
  seconds = 3,
  onDone,
}: {
  seconds?: number
  onDone: () => void
}) {
  const [count, setCount] = useState(seconds)
  const doneRef = useRef(false)

  useEffect(() => {
    if (count <= 0) {
      if (!doneRef.current) {
        doneRef.current = true
        onDone()
      }
      return
    }
    const id = setTimeout(() => setCount((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [count, onDone])

  if (count <= 0) {
    return null
  }

  return <div className="text-6xl font-bold tabular-nums">{count}</div>
}
