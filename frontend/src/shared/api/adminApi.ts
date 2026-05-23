import { request } from './client'
import type {
  AdminProfile,
  OrderStatus,
  OrderSummary,
  ProductForm,
} from '../../entities/admin/types'

const TOKEN_KEY = 'lumen.admin.token.v1'

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAdminToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY)
}

function authHeaders(): Record<string, string> {
  const token = getAdminToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

type LoginResult = {
  token: string
  admin: AdminProfile
}

export async function login(loginName: string, password: string): Promise<LoginResult> {
  return request<LoginResult>('/api/admin/login', {
    method: 'POST',
    body: { login: loginName, password },
  })
}

export async function logout(): Promise<void> {
  await request('/api/admin/logout', { method: 'POST', headers: authHeaders() })
}

type MeResponse = AdminProfile & { created_at: string }

export async function me(): Promise<AdminProfile> {
  const data = await request<MeResponse>('/api/admin/me', { headers: authHeaders() })
  return { id: data.id, login: data.login, name: data.name }
}

function toProductBody(form: ProductForm) {
  return {
    name: form.name,
    description: form.description,
    category_id: form.categoryId,
    price: form.price,
    power: form.power,
    socket_type: form.socketType,
    color_temp: form.colorTemp,
    lifespan: form.lifespan,
    stock: form.stock,
  }
}

export async function createProduct(form: ProductForm): Promise<void> {
  await request('/api/products', {
    method: 'POST',
    headers: authHeaders(),
    body: toProductBody(form),
  })
}

export async function updateProduct(id: number, form: ProductForm): Promise<void> {
  await request(`/api/products/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: toProductBody(form),
  })
}

export async function deleteProduct(id: number): Promise<void> {
  await request(`/api/products/${id}`, { method: 'DELETE', headers: authHeaders() })
}

type OrderSummaryRaw = {
  id: number
  order_number: string
  status: OrderStatus
  customer_name: string
  delivery_city: string
  delivery_method: string
  payment_method: string
  total: number
  created_at: string
}

type OrdersResponse = {
  orders: OrderSummaryRaw[]
  total: number
  page: number
  limit: number
}

export type ListOrdersResult = {
  orders: OrderSummary[]
  total: number
  page: number
  limit: number
}

export async function listOrders(
  params: { status?: string; page?: number; limit?: number } = {},
): Promise<ListOrdersResult> {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  const qs = query.toString()
  const url = qs ? `/api/orders?${qs}` : '/api/orders'
  const data = await request<OrdersResponse>(url, { headers: authHeaders() })
  return {
    orders: data.orders.map((raw) => ({
      id: raw.id,
      orderNumber: raw.order_number,
      status: raw.status,
      customerName: raw.customer_name,
      deliveryCity: raw.delivery_city,
      deliveryMethod: raw.delivery_method,
      paymentMethod: raw.payment_method,
      total: raw.total,
      createdAt: raw.created_at,
    })),
    total: data.total,
    page: data.page,
    limit: data.limit,
  }
}

export async function updateOrderStatus(orderId: number, status: OrderStatus): Promise<void> {
  await request(`/api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: { status },
  })
}
