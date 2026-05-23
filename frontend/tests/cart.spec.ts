import { test, expect } from '@playwright/test'
import { setupApiMocks } from './mocks'

test.beforeEach(async ({ page }) => {
  await setupApiMocks(page)
})

test('пустая корзина показывает заглушку', async ({ page }) => {
  await page.goto('/cart')
  await expect(page.getByRole('heading', { name: 'Корзина пуста' })).toBeVisible()
})

test('изменение количества и удаление позиции', async ({ page }) => {
  await page.goto('/product/1')
  await page.getByRole('button', { name: 'В корзину' }).click()
  await expect(page).toHaveURL(/\/cart$/)

  const decrease = page.getByRole('button', { name: 'Уменьшить' })
  await expect(decrease).toBeDisabled()
  await page.getByRole('button', { name: 'Увеличить' }).click()
  await expect(decrease).toBeEnabled()

  await page.getByRole('button', { name: 'Убрать' }).click()
  await expect(page.getByRole('heading', { name: 'Корзина пуста' })).toBeVisible()
})
