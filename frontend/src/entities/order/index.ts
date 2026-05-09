export type {
  CheckoutForm,
  DeliveryMethod,
  Order,
  OrderItem,
  PaymentMethod,
} from './types'
export { fetchOrder, submitOrder, clearCurrentOrder } from './ordersSlice'
export { default as ordersReducer } from './ordersSlice'

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
