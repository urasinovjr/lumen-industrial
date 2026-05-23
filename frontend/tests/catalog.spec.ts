import { test, expect } from '@playwright/test'
import { setupApiMocks } from './mocks'

test.beforeEach(async ({ page }) => {
  await setupApiMocks(page)
})

test('каталог показывает товары', async ({ page }) => {
  await page.goto('/catalog')
  await expect(
    page.getByRole('heading', { name: 'Лампа LED A60 12Вт E27 4000K' }),
  ).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Галоген MR16 5Вт GU10' })).toBeVisible()
})

test('фильтр по категории показывает только её товары', async ({ page }) => {
  await page.goto('/catalog')
  await page.getByRole('tab', { name: 'Галогенные' }).click()
  await expect(page.getByRole('heading', { name: 'Галоген MR16 5Вт GU10' })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Лампа LED A60 12Вт E27 4000K' }),
  ).toHaveCount(0)
})

test('поиск фильтрует каталог по названию', async ({ page }) => {
  await page.goto('/catalog')
  const search = page.getByRole('searchbox', { name: 'Поиск по каталогу' })
  await search.fill('Галоген')
  await search.press('Enter')
  await expect(page.getByRole('heading', { name: 'Галоген MR16 5Вт GU10' })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Лампа LED A60 12Вт E27 4000K' }),
  ).toHaveCount(0)
})
