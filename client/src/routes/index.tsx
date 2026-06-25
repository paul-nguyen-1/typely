import { createFileRoute } from '@tanstack/react-router'
import { Race } from '#/race/Race'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div>
      <h1 className="p-8 pb-0 text-4xl font-bold">Typing Racer</h1>
      <Race />
    </div>
  )
}
