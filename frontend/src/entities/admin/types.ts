export type AdminProfile = {
  id: number
  login: string
  name: string
}

export type ProductForm = {
  name: string
  description: string
  categoryId: number
  price: number
  power: number
  socketType: string
  colorTemp: number
  lifespan: number
  stock: number
}

export type OrderStatus =
  | 'new'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type OrderSummary = {
  id: number
  orderNumber: string
  status: OrderStatus
  customerName: string
  deliveryCity: string
  deliveryMethod: string
  paymentMethod: string
  total: number
  createdAt: string
}
