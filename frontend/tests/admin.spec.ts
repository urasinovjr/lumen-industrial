import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { setupAdminApiMocks } from './admin-mocks'

test.beforeEach(async ({ page }) => {
  await setupAdminApiMocks(page)
})

async function loginAsAdmin(page: Page) {
  await page.goto('/admin/login')
  await page.getByPlaceholder('Введите логин').fill('admin')
  await page.getByPlaceholder('Введите пароль').fill('password123')
  await page.getByRole('button', { name: 'Войти' }).click()
  await expect(page).toHaveURL(/\/admin\/products$/)
}

test('вход в панель и просмотр товаров', async ({ page }) => {
  await loginAsAdmin(page)
  await expect(page.getByRole('heading', { name: 'Склад товаров' })).toBeVisible()
  await expect(page.getByText('Лампа LED A60 12Вт E27 4000K')).toBeVisible()
})

test('неверные данные показывают ошибку', async ({ page }) => {
  await page.goto('/admin/login')
  await page.getByPlaceholder('Введите логин').fill('admin')
  await page.getByPlaceholder('Введите пароль').fill('wrong')
  await page.getByRole('button', { name: 'Войти' }).click()
  await expect(page.getByText('Неверный логин или пароль')).toBeVisible()
})

test('добавление товара', async ({ page }) => {
  await loginAsAdmin(page)
  await page.getByRole('button', { name: 'Добавить товар' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByLabel('Наименование').fill('Лампа TEST новая')
  await page.getByLabel('Цена, ₽').fill('500')
  await page.getByRole('button', { name: 'Сохранить' }).click()
  await expect(page.getByText('Лампа TEST новая')).toBeVisible()
})

test('редактирование товара', async ({ page }) => {
  await loginAsAdmin(page)
  await page.getByRole('button', { name: 'Изменить' }).first().click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByLabel('Наименование').fill('Лампа LED обновлённая')
  await page.getByRole('button', { name: 'Сохранить' }).click()
  await expect(page.getByText('Лампа LED обновлённая')).toBeVisible()
})

test('удаление товара', async ({ page }) => {
  await loginAsAdmin(page)
  page.on('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Удалить' }).first().click()
  await expect(page.getByText('Лампа LED A60 12Вт E27 4000K')).toHaveCount(0)
})

test('изменение статуса заказа', async ({ page }) => {
  await loginAsAdmin(page)
  await page.getByRole('link', { name: 'Заказы' }).click()
  await expect(page).toHaveURL(/\/admin\/orders$/)
  await expect(page.getByText('ORD-20260101-0001')).toBeVisible()
  await page.getByRole('button', { name: 'Подробнее' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('combobox').selectOption('processing')
  await page.getByRole('button', { name: 'Сохранить' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('выход из панели управления', async ({ page }) => {
  await loginAsAdmin(page)
  await page.getByRole('button', { name: 'Выйти' }).first().click()
  await expect(page).toHaveURL(/\/admin\/login$/)
})
