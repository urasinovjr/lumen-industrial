import type { Category, Product } from '../../entities/product/types'
import { request } from './client'

type ProductRaw = {
  id: number
  category_id: number
  name: string
  description: string
  price: number
  image_url: string | null
  power: number | null
  socket_type: string | null
  color_temp: number | null
  lifespan: number | null
  stock: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

type ListResponse = {
  products: ProductRaw[]
  total: number
  page: number
  limit: number
}

type CategoryRaw = { id: number; name: string }

function normalizeProduct(raw: ProductRaw): Product {
  return {
    id: raw.id,
    categoryId: raw.category_id,
    name: raw.name,
    description: raw.description,
    price: raw.price,
    imageUrl: raw.image_url,
    power: raw.power,
    socketType: raw.socket_type,
    colorTemp: raw.color_temp,
    lifespan: raw.lifespan,
    stock: raw.stock,
    isActive: raw.is_active,
  }
}

export type ListProductsParams = {
  page?: number
  limit?: number
  search?: string
  categoryId?: number | null
}

export type ListProductsResult = {
  products: Product[]
  total: number
  page: number
  limit: number
}

export async function listProducts(params: ListProductsParams = {}): Promise<ListProductsResult> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.search && params.search.trim()) query.set('search', params.search.trim())
  if (params.categoryId) query.set('category_id', String(params.categoryId))

  const qs = query.toString()
  const url = qs ? `/api/products?${qs}` : '/api/products'
  const data = await request<ListResponse>(url)
  return {
    products: data.products.map(normalizeProduct),
    total: data.total,
    page: data.page,
    limit: data.limit,
  }
}

export async function getProduct(id: number): Promise<Product> {
  const data = await request<ProductRaw>(`/api/products/${id}`)
  return normalizeProduct(data)
}

export async function listCategories(): Promise<Category[]> {
  const data = await request<{ categories: CategoryRaw[] }>('/api/categories')
  return data.categories.map((c) => ({ id: c.id, name: c.name }))
}
