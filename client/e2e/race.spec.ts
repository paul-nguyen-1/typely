import { test, expect } from '@playwright/test'

const PASSAGE = 'the quick brown fox jumps over the lazy dog'

test('countdown unlocks input, typing updates stats, finishing shows finished status', async ({
  page,
}) => {
  await page.goto('/')

  const input = page.locator('#typing-input')
  await expect(input).toBeDisabled()

  // countdown is 3s; wait for it to clear and the input to unlock
  await expect(input).toBeEnabled({ timeout: 5000 })
  await expect(input).toBeFocused()

  const car = page.getByTestId('racer-car')
  const ghostCar = page.getByTestId('ghost-car')
  const startTransform = await car.evaluate((el) => el.style.transform)
  const ghostStartTransform = await ghostCar.evaluate((el) => el.style.transform)

  await page.keyboard.type(PASSAGE, { delay: 20 })

  await expect(page.getByText('Status: finished')).toBeVisible()
  await expect(page.getByText('Progress: 100%')).toBeVisible()
  await expect(input).toBeDisabled()

  // the car's transform is written via ref in the rAF loop, not React state
  const endTransform = await car.evaluate((el) => el.style.transform)
  expect(endTransform).not.toBe(startTransform)
  expect(endTransform).toContain('translateX(600px)') // TRACK_WIDTH_PX at 100% progress

  // the ghost car moves independently via the same hot-path discipline
  const ghostEndTransform = await ghostCar.evaluate((el) => el.style.transform)
  expect(ghostEndTransform).not.toBe(ghostStartTransform)
})
