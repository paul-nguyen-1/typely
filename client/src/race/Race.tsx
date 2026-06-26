import { useState } from 'react'
import { RaceProvider } from './RaceProvider'
import { Countdown } from './Countdown'
import { PassageView } from './PassageView'
import { TypingSurface } from './TypingSurface'
import { StatsHUD } from './StatsHUD'
import { Track } from './Track'
import { RacerCar } from './RacerCar'

const SAMPLE_PASSAGE = 'the quick brown fox jumps over the lazy dog'

export function Race() {
  const [ready, setReady] = useState(false)

  return (
    <RaceProvider passage={SAMPLE_PASSAGE}>
      <div className="flex flex-col gap-4 p-8">
        {!ready && <Countdown onDone={() => setReady(true)} />}
        <StatsHUD />
        <Track>
          <RacerCar />
        </Track>
        <PassageView />
        <TypingSurface disabled={!ready} />
      </div>
    </RaceProvider>
  )
}
