import type { Page, Route } from '@playwright/test'

type Product = {
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

type CartItem = {
  id: number
  product_id: number
  name: string
  price: number
  quantity: number
  subtotal: number
  image_url: string | null
}

const CATEGORIES = [
  { id: 1, name: 'LED' },
  { id: 2, name: 'Галогенные' },
]

const PRODUCTS: Product[] = [
  {
    id: 1,
    category_id: 1,
    name: 'Лампа LED A60 12Вт E27 4000K',
    description: 'Светодиодная лампа общего назначения с нейтральным светом.',
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
    category_id: 1,
    name: 'Лампа LED C37 7Вт E14 2700K',
    description: 'Лампа-свеча с тёплым белым светом для люстр.',
    price: 145,
    image_url: null,
    power: 7,
    socket_type: 'E14',
    color_temp: 2700,
    lifespan: 20000,
    stock: 200,
    is_active: true,
  },
  {
    id: 3,
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

export async function setupApiMocks(page: Page) {
  const cart: { id: number; items: CartItem[]; total: number } = {
    id: 1,
    items: [],
    total: 0,
  }
  let nextItemId = 1
  let lastOrder: Record<string, unknown> | null = null

  const recalc = () => {
    cart.items.forEach((item) => {
      item.subtotal = item.price * item.quantity
    })
    cart.total = cart.items.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const json = (route: Route, status: number, data: unknown) =>
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(data),
    })

  const isApi = (url: URL) => url.pathname.startsWith('/api/')

  await page.route(isApi, async (route) => {
    const request = route.request()
    const method = request.method()
    const url = new URL(request.url())
    const path = url.pathname

    if (path === '/api/categories' && method === 'GET') {
      return json(route, 200, { categories: CATEGORIES })
    }

    if (path === '/api/products' && method === 'GET') {
      const search = (url.searchParams.get('search') ?? '').toLowerCase()
      const categoryId = url.searchParams.get('category_id')
      let items = PRODUCTS
      if (categoryId) {
        items = items.filter((product) => product.category_id === Number(categoryId))
      }
      if (search) {
        items = items.filter((product) => product.name.toLowerCase().includes(search))
      }
      return json(route, 200, {
        products: items,
        total: items.length,
        page: 1,
        limit: 8,
      })
    }

    const productMatch = path.match(/^\/api\/products\/(\d+)$/)
    if (productMatch && method === 'GET') {
      const product = PRODUCTS.find((item) => item.id === Number(productMatch[1]))
      if (!product) {
        return json(route, 404, { error: 'Товар не найден' })
      }
      return json(route, 200, product)
    }

    if (path === '/api/cart' && method === 'GET') {
      return json(route, 200, { cart })
    }

    if (path === '/api/cart' && method === 'DELETE') {
      cart.items = []
      recalc()
      return json(route, 200, { cart })
    }

    if (path === '/api/cart/items' && method === 'POST') {
      const body = request.postDataJSON() as { product_id: number; quantity: number }
      const product = PRODUCTS.find((item) => item.id === body.product_id)
      if (!product) {
        return json(route, 400, { error: 'Товар не найден или недоступен' })
      }
      const existing = cart.items.find((item) => item.product_id === body.product_id)
      if (existing) {
        existing.quantity += body.quantity
      } else {
        cart.items.push({
          id: nextItemId++,
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: body.quantity,
          subtotal: product.price * body.quantity,
          image_url: product.image_url,
        })
      }
      recalc()
      return json(route, 201, { cart })
    }

    const itemMatch = path.match(/^\/api\/cart\/items\/(\d+)$/)
    if (itemMatch && method === 'PUT') {
      const body = request.postDataJSON() as { quantity: number }
      const item = cart.items.find((entry) => entry.id === Number(itemMatch[1]))
      if (item) {
        item.quantity = body.quantity
      }
      recalc()
      return json(route, 200, { cart })
    }
    if (itemMatch && method === 'DELETE') {
      cart.items = cart.items.filter((entry) => entry.id !== Number(itemMatch[1]))
      recalc()
      return json(route, 200, { cart })
    }

    if (path === '/api/orders' && method === 'POST') {
      const body = request.postDataJSON() as Record<string, string>
      lastOrder = {
        id: 1,
        order_number: 'ORD-20260101-0001',
        status: 'new',
        customer_name: body.customer_name,
        customer_phone: body.customer_phone,
        customer_email: body.customer_email,
        delivery_city: body.delivery_city,
        delivery_address: body.delivery_address,
        delivery_method: body.delivery_method,
        payment_method: body.payment_method,
        items: cart.items.map((item) => ({
          product_id: item.product_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
        total: cart.total,
        created_at: '2026-01-01T10:00:00.000Z',
        updated_at: '2026-01-01T10:00:00.000Z',
      }
      cart.items = []
      recalc()
      return json(route, 201, lastOrder)
    }

    if (path.startsWith('/api/orders/') && method === 'GET') {
      if (!lastOrder) {
        return json(route, 404, { error: 'Заказ не найден' })
      }
      return json(route, 200, lastOrder)
    }

    return json(route, 404, { error: 'not mocked' })
  })
}
