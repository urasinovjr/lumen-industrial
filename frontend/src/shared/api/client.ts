const SESSION_KEY = 'lumen.session.v1'

export function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}

export async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, signal } = options

  const init: RequestInit = {
    method,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    signal,
  }
  if (body !== undefined) {
    init.body = JSON.stringify(body)
  }

  let response: Response
  try {
    response = await fetch(url, init)
  } catch (err) {
    throw new Error(
      err instanceof Error
        ? `Сеть недоступна: ${err.message}`
        : 'Сеть недоступна',
    )
  }

  const text = await response.text()
  const data = text ? safeJson(text) : null

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string')
        ? data.error
        : `Ошибка ${response.status}`
    throw new Error(message)
  }

  return data as T
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

const CATEGORY_SLUG_BY_ID: Record<number, string> = {
  1: 'led',
  2: 'halogen',
  3: 'energy',
  4: 'filament',
  5: 'smart',
}

export function productImagePlaceholder(categoryId: number | null | undefined): string {
  const slug = categoryId != null ? CATEGORY_SLUG_BY_ID[categoryId] : undefined
  return `/products/${slug ?? 'led'}.svg`
}
