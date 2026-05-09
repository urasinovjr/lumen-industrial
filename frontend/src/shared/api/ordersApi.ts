import type { CartItem, CartState } from '../../entities/cart/types'
import type { CheckoutForm, Order } from '../../entities/order/types'
import { getSessionId, request } from './client'

type CartItemRaw = {
  id: number
  product_id: number
  name: string
  price: number
  quantity: number
  subtotal: number
  image_url: string | null
}

type CartRaw = {
  id: number | null
  items: CartItemRaw[]
  total: number
}

type OrderItemRaw = {
  product_id: number
  name: string
  price: number
  quantity: number
  subtotal: number
}

type OrderRaw = {
  id: number
  order_number: string
  status: string
  customer_name: string
  customer_phone: string
  customer_email: string
  delivery_city: string
  delivery_address: string | null
  delivery_method: string
  payment_method: string
  items: OrderItemRaw[]
  total: number
  created_at: string
  updated_at: string
}

function normalizeCartItem(raw: CartItemRaw): CartItem {
  return {
    id: raw.id,
    productId: raw.product_id,
    name: raw.name,
    price: raw.price,
    quantity: raw.quantity,
    subtotal: raw.subtotal,
    imageUrl: raw.image_url,
  }
}

function normalizeCart(raw: CartRaw): CartState {
  return {
    items: raw.items.map(normalizeCartItem),
    total: raw.total,
  }
}

function normalizeOrder(raw: OrderRaw): Order {
  return {
    id: raw.id,
    orderNumber: raw.order_number,
    status: raw.status,
    customerName: raw.customer_name,
    customerPhone: raw.customer_phone,
    customerEmail: raw.customer_email,
    deliveryCity: raw.delivery_city,
    deliveryAddress: raw.delivery_address ?? '',
    deliveryMethod: raw.delivery_method as Order['deliveryMethod'],
    paymentMethod: raw.payment_method as Order['paymentMethod'],
    items: raw.items.map((it) => ({
      productId: it.product_id,
      name: it.name,
      price: it.price,
      quantity: it.quantity,
      subtotal: it.subtotal,
    })),
    total: raw.total,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}

function sessionHeaders(): Record<string, string> {
  return { 'X-Session-Id': getSessionId() }
}

export async function getCart(): Promise<CartState> {
  const data = await request<{ cart: CartRaw }>('/api/cart', {
    headers: sessionHeaders(),
  })
  return normalizeCart(data.cart)
}

export async function addCartItem(productId: number, quantity: number): Promise<CartState> {
  const data = await request<{ cart: CartRaw }>('/api/cart/items', {
    method: 'POST',
    headers: sessionHeaders(),
    body: { product_id: productId, quantity },
  })
  return normalizeCart(data.cart)
}

export async function updateCartItem(itemId: number, quantity: number): Promise<CartState> {
  const data = await request<{ cart: CartRaw }>(`/api/cart/items/${itemId}`, {
    method: 'PUT',
    headers: sessionHeaders(),
    body: { quantity },
  })
  return normalizeCart(data.cart)
}

export async function removeCartItem(itemId: number): Promise<CartState> {
  const data = await request<{ cart: CartRaw }>(`/api/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: sessionHeaders(),
  })
  return normalizeCart(data.cart)
}

export async function clearCart(): Promise<CartState> {
  const data = await request<{ cart: CartRaw }>('/api/cart', {
    method: 'DELETE',
    headers: sessionHeaders(),
  })
  return normalizeCart(data.cart)
}

export async function createOrder(form: CheckoutForm): Promise<Order> {
  const data = await request<OrderRaw>('/api/orders', {
    method: 'POST',
    headers: sessionHeaders(),
    body: {
      customer_name: form.customerName,
      customer_phone: form.customerPhone,
      customer_email: form.customerEmail,
      delivery_city: form.deliveryCity,
      delivery_address: form.deliveryAddress,
      delivery_method: form.deliveryMethod,
      payment_method: form.paymentMethod,
    },
  })
  return normalizeOrder(data)
}

export async function getOrder(orderNumber: string): Promise<Order> {
  const data = await request<OrderRaw>(`/api/orders/${orderNumber}`)
  return normalizeOrder(data)
}
