import type { Page } from '@playwright/test'

type AdminProduct = {
  id: number
  category_id: number
  name: string
  description: string
  price: number
  image_url: string | null
  power: number
  socket_type: string
  color_temp: number
  lifespan: number
  stock: number
  is_active: boolean
}

type AdminOrder = {
  id: number
  order_number: string
  status: string
  customer_name: string
  customer_phone: string
  customer_email: string
  delivery_city: string
  delivery_address: string
  delivery_method: string
  payment_method: string
  items: { product_id: number; name: string; price: number; quantity: number; subtotal: number }[]
  total: number
  created_at: string
  updated_at: string
}

const CATEGORIES = [
  { id: 1, name: 'LED' },
  { id: 2, name: 'Галогенные' },
]

export async function setupAdminApiMocks(page: Page) {
  let nextProductId = 3
  const products: AdminProduct[] = [
    {
      id: 1,
      category_id: 1,
      name: 'Лампа LED A60 12Вт E27 4000K',
      description: 'Светодиодная лампа общего назначения.',
      price: 189,
      image_url: null,
      power: 12,
      socket_type: 'E27',
      color_temp: 4000,
      lifespan: 25000,
      stock: 150,
      is_active: true,
    },
    {
      id: 2,
      category_id: 2,
      name: 'Галоген MR16 5Вт GU10',
      description: 'Галогенная лампа направленного света.',
      price: 210,
      image_url: null,
      power: 5,
      socket_type: 'GU10',
      color_temp: 3000,
      lifespan: 4000,
      stock: 80,
      is_active: true,
    },
  ]

  const orders: AdminOrder[] = [
    {
      id: 1,
      order_number: 'ORD-20260101-0001',
      status: 'new',
      customer_name: 'Иванов Алексей Петрович',
      customer_phone: '+7 (916) 123-45-67',
      customer_email: 'ivanov.ap@mail.ru',
      delivery_city: 'Москва',
      delivery_address: 'ул. Ленина, д. 15, кв. 42',
      delivery_method: 'courier',
      payment_method: 'cash',
      items: [
        { product_id: 1, name: 'Лампа LED A60 12Вт E27 4000K', price: 189, quantity: 2, subtotal: 378 },
      ],
      total: 378,
      created_at: '2026-01-01T10:00:00.000Z',
      updated_at: '2026-01-01T10:00:00.000Z',
    },
  ]

  await page.route(
    (url) => url.pathname.startsWith('/api/'),
    async (route) => {
      const request = route.request()
      const method = request.method()
      const url = new URL(request.url())
      const path = url.pathname

      const json = (status: number, data: unknown) =>
        route.fulfill({
          status,
          contentType: 'application/json',
          body: JSON.stringify(data),
        })

      if (path === '/api/admin/login' && method === 'POST') {
        const body = request.postDataJSON() as { login: string; password: string }
        if (body.login === 'admin' && body.password === 'password123') {
          return json(200, {
            token: 'test-admin-jwt',
            admin: { id: 1, login: 'admin', name: 'Администратор' },
          })
        }
        return json(401, { error: 'Неверный логин или пароль' })
      }

      if (path === '/api/admin/me' && method === 'GET') {
        if (request.headers().authorization) {
          return json(200, {
            id: 1,
            login: 'admin',
            name: 'Администратор',
            created_at: '2026-01-01T00:00:00.000Z',
          })
        }
        return json(401, { error: 'Требуется авторизация' })
      }

      if (path === '/api/admin/logout' && method === 'POST') {
        return json(200, { message: 'Сессия завершена' })
      }

      if (path === '/api/categories' && method === 'GET') {
        return json(200, { categories: CATEGORIES })
      }

      if (path === '/api/products' && method === 'GET') {
        return json(200, { products, total: products.length, page: 1, limit: 8 })
      }

      if (path === '/api/products' && method === 'POST') {
        const body = request.postDataJSON() as Record<string, unknown>
        const created: AdminProduct = {
          id: nextProductId++,
          category_id: Number(body.category_id),
          name: String(body.name),
          description: String(body.description ?? ''),
          price: Number(body.price),
          image_url: null,
          power: Number(body.power ?? 0),
          socket_type: String(body.socket_type ?? ''),
          color_temp: Number(body.color_temp ?? 0),
          lifespan: Number(body.lifespan ?? 0),
          stock: Number(body.stock ?? 0),
          is_active: true,
        }
        products.push(created)
        return json(201, created)
      }

      const productMatch = path.match(/^\/api\/products\/(\d+)$/)
      if (productMatch && method === 'PUT') {
        const id = Number(productMatch[1])
        const body = request.postDataJSON() as Record<string, unknown>
        const product = products.find((item) => item.id === id)
        if (product) {
          product.name = String(body.name)
          product.price = Number(body.price)
        }
        return json(200, product)
      }
      if (productMatch && method === 'DELETE') {
        const id = Number(productMatch[1])
        const index = products.findIndex((item) => item.id === id)
        if (index >= 0) {
          products.splice(index, 1)
        }
        return json(200, { message: 'Товар удалён' })
      }

      if (path === '/api/orders' && method === 'GET') {
        return json(200, {
          orders: orders.map((order) => ({
            id: order.id,
            order_number: order.order_number,
            status: order.status,
            customer_name: order.customer_name,
            delivery_city: order.delivery_city,
            delivery_method: order.delivery_method,
            payment_method: order.payment_method,
            total: order.total,
            created_at: order.created_at,
          })),
          total: orders.length,
          page: 1,
          limit: 10,
        })
      }

      const orderMatch = path.match(/^\/api\/orders\/([^/]+)$/)
      if (orderMatch && method === 'GET') {
        const order = orders.find((item) => item.order_number === orderMatch[1])
        if (!order) {
          return json(404, { error: 'Заказ не найден' })
        }
        return json(200, order)
      }

      const statusMatch = path.match(/^\/api\/orders\/(\d+)\/status$/)
      if (statusMatch && method === 'PATCH') {
        const id = Number(statusMatch[1])
        const body = request.postDataJSON() as { status: string }
        const order = orders.find((item) => item.id === id)
        if (order) {
          order.status = body.status
        }
        return json(200, order)
      }

      return json(404, { error: 'not mocked' })
    },
  )
}
