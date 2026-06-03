import type { DeliveryMethod } from './types'

export type {
  CheckoutForm,
  DeliveryMethod,
  Order,
  OrderItem,
  PaymentMethod,
} from './types'
export { fetchOrder, submitOrder, clearCurrentOrder } from './ordersSlice'
export { default as ordersReducer } from './ordersSlice'

export const DELIVERY_PRICES: Record<DeliveryMethod, number> = {
  courier: 1450,
  pickup: 0,
}

export const TAX_RATE = 0.2

export function deliveryPriceFor(method: DeliveryMethod): number {
  return DELIVERY_PRICES[method]
}

export function includedTax(grossTotal: number): number {
  return Math.round((grossTotal * TAX_RATE) / (1 + TAX_RATE))
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDateRu(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}
