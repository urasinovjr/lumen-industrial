import { test, expect } from '@playwright/test'
import { setupApiMocks } from './mocks'

test.beforeEach(async ({ page }) => {
  await setupApiMocks(page)
})

async function fillCartAndGoToCheckout(page: import('@playwright/test').Page) {
  await page.goto('/product/1')
  await page.getByRole('button', { name: 'В корзину' }).click()
  await expect(page).toHaveURL(/\/cart$/)
  await page.getByRole('button', { name: 'Оформить заказ' }).click()
  await expect(page).toHaveURL(/\/checkout$/)
}

test('форма оформления показывает ошибки валидации', async ({ page }) => {
  await fillCartAndGoToCheckout(page)
  await page.getByRole('button', { name: 'Подтвердить заказ' }).click()
  await expect(page.getByText('Укажите ФИО получателя')).toBeVisible()
})

test('успешное оформление ведёт на подтверждение', async ({ page }) => {
  await fillCartAndGoToCheckout(page)
  await page.getByLabel('ФИО').fill('Иванов Иван Иванович')
  await page.getByLabel('Номер телефона').fill('+7 (495) 000-00-00')
  await page.getByLabel('E-mail').fill('test@example.ru')
  await page.getByLabel('Улица, дом, корпус').fill('ул. Промышленная, 7')
  await page.getByRole('button', { name: 'Подтвердить заказ' }).click()
  await expect(page).toHaveURL(/\/confirmation\//)
  await expect(page.getByRole('heading', { name: 'ЗАКАЗ ПОДТВЕРЖДЁН' })).toBeVisible()
})
