import type { ReactNode } from 'react'

export const TRACK_WIDTH_PX = 600

export function Track({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative h-20 overflow-hidden rounded bg-gray-100"
      style={{ width: TRACK_WIDTH_PX }}
    >
      {children}
    </div>
  )
}
