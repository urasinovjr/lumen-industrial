import { test, expect } from '@playwright/test'
import { setupApiMocks } from './mocks'

test.beforeEach(async ({ page }) => {
  await setupApiMocks(page)
})

test('карточка товара показывает характеристики', async ({ page }) => {
  await page.goto('/product/1')
  await expect(
    page.getByRole('heading', { name: 'Лампа LED A60 12Вт E27 4000K' }),
  ).toBeVisible()
  await expect(page.getByText('Тип цоколя')).toBeVisible()
})

test('добавление товара в корзину ведёт в корзину', async ({ page }) => {
  await page.goto('/product/1')
  await page.getByRole('button', { name: 'В корзину' }).click()
  await expect(page).toHaveURL(/\/cart$/)
  await expect(page.getByRole('heading', { name: 'Ваша корзина' })).toBeVisible()
})
