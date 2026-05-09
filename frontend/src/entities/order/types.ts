export type DeliveryMethod = 'courier' | 'pickup'
export type PaymentMethod = 'card_online' | 'invoice'

export type CheckoutForm = {
  customerName: string
  customerPhone: string
  customerEmail: string
  deliveryCity: string
  deliveryAddress: string
  deliveryMethod: DeliveryMethod
  paymentMethod: PaymentMethod
}

export type OrderItem = {
  productId: number
  name: string
  price: number
  quantity: number
  subtotal: number
}

export type Order = {
  id: number
  orderNumber: string
  status: string
  customerName: string
  customerPhone: string
  customerEmail: string
  deliveryCity: string
  deliveryAddress: string
  deliveryMethod: DeliveryMethod
  paymentMethod: PaymentMethod
  items: OrderItem[]
  total: number
  createdAt: string
  updatedAt: string
}
