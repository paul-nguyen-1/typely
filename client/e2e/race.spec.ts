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

  await page.keyboard.type(PASSAGE, { delay: 20 })

  await expect(page.getByText('Status: finished')).toBeVisible()
  await expect(page.getByText('Progress: 100%')).toBeVisible()
  await expect(input).toBeDisabled()
})
