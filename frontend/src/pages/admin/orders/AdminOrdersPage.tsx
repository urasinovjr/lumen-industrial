import { useCallback, useEffect, useState } from 'react'
import { listOrders } from '../../../shared/api/adminApi'
import { formatDateRu, formatPrice } from '../../../entities/order'
import { ORDER_STATUS_LABELS, ORDER_STATUS_OPTIONS } from '../../../entities/admin'
import type { OrderStatus, OrderSummary } from '../../../entities/admin'
import { OrderDetailModal } from './OrderDetailModal'
import styles from './AdminOrdersPage.module.css'

const PAGE_SIZE = 10

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'Все заказы' },
  ...ORDER_STATUS_OPTIONS,
]

function statusClass(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    new: styles.statusNew,
    processing: styles.statusProcessing,
    shipped: styles.statusShipped,
    delivered: styles.statusDelivered,
    cancelled: styles.statusCancelled,
  }
  return `${styles.status} ${map[status]}`
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [detail, setDetail] = useState<{ id: number; orderNumber: string } | null>(null)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const load = useCallback(() => {
    return listOrders({
      status: statusFilter || undefined,
      page,
      limit: PAGE_SIZE,
    })
      .then((result) => {
        setOrders(result.orders)
        setTotal(result.total)
        setError(null)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить заказы')
      })
      .finally(() => setLoaded(true))
  }, [statusFilter, page])

  useEffect(() => {
    load()
  }, [load])

  return (
    <section>
      <header className={styles.header}>
        <h1 className={styles.title}>Управление заказами</h1>
        <p className={styles.subtitle}>
          Просматривайте заказы и меняйте их статусы.
        </p>
      </header>

      <div className={styles.filters} role="tablist">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value || 'all'}
            type="button"
            role="tab"
            aria-selected={statusFilter === filter.value}
            className={
              statusFilter === filter.value
                ? `${styles.chip} ${styles.chipActive}`
                : styles.chip
            }
            onClick={() => {
              setStatusFilter(filter.value)
              setPage(1)
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.tableCard}>
        <div className={`${styles.row} ${styles.head}`}>
          <span>ID заказа</span>
          <span>Дата</span>
          <span>ФИО клиента</span>
          <span>Сумма</span>
          <span>Статус</span>
          <span className={styles.actionsHead}>Действия</span>
        </div>

        {!loaded && <p className={styles.empty}>Загрузка…</p>}
        {loaded && orders.length === 0 && (
          <p className={styles.empty}>Заказы не найдены.</p>
        )}

        {orders.map((order) => (
          <div key={order.id} className={styles.row}>
            <span className={styles.code}>{order.orderNumber}</span>
            <span className={styles.date}>{formatDateRu(new Date(order.createdAt))}</span>
            <span className={styles.client}>
              <span className={styles.avatar}>{initials(order.customerName)}</span>
              {order.customerName}
            </span>
            <span className={styles.sum}>{formatPrice(order.total)} ₽</span>
            <span>
              <span className={statusClass(order.status)}>
                {ORDER_STATUS_LABELS[order.status]}
              </span>
            </span>
            <span className={styles.actions}>
              <button
                type="button"
                className={styles.detailButton}
                onClick={() => setDetail({ id: order.id, orderNumber: order.orderNumber })}
              >
                Подробнее
              </button>
            </span>
          </div>
        ))}

        {totalPages > 1 && (
          <nav className={styles.pagination} aria-label="Пагинация">
            <button
              type="button"
              className={styles.pageNav}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={page <= 1}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((value) => (
              <button
                key={value}
                type="button"
                className={
                  value === page
                    ? `${styles.pageButton} ${styles.pageButtonActive}`
                    : styles.pageButton
                }
                onClick={() => setPage(value)}
              >
                {value}
              </button>
            ))}
            <button
              type="button"
              className={styles.pageNav}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={page >= totalPages}
            >
              ›
            </button>
          </nav>
        )}
      </div>

      {detail && (
        <OrderDetailModal
          orderId={detail.id}
          orderNumber={detail.orderNumber}
          onClose={() => setDetail(null)}
          onSaved={() => {
            setDetail(null)
            load()
          }}
        />
      )}
    </section>
  )
}
