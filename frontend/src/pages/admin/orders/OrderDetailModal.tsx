import { useEffect, useState } from 'react'
import { getOrder } from '../../../shared/api/ordersApi'
import { updateOrderStatus } from '../../../shared/api/adminApi'
import { formatPrice } from '../../../entities/order'
import type { Order } from '../../../entities/order'
import { ORDER_STATUS_OPTIONS } from '../../../entities/admin'
import type { OrderStatus } from '../../../entities/admin'
import { Button } from '../../../shared/ui'
import styles from './OrderDetailModal.module.css'

const DELIVERY_LABELS: Record<string, string> = {
  courier: 'Курьерская доставка',
  pickup: 'Самовывоз',
}

const PAYMENT_LABELS: Record<string, string> = {
  card_online: 'Оплата онлайн',
  cash: 'Оплата при получении',
}

type OrderDetailModalProps = {
  orderId: number
  orderNumber: string
  onClose: () => void
  onSaved: () => void
}

export function OrderDetailModal({
  orderId,
  orderNumber,
  onClose,
  onSaved,
}: OrderDetailModalProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [status, setStatus] = useState<OrderStatus>('new')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getOrder(orderNumber)
      .then((data) => {
        setOrder(data)
        setStatus(data.status as OrderStatus)
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Не удалось загрузить заказ'),
      )
  }, [orderNumber])

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await updateOrderStatus(orderId, status)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить статус')
      setSaving(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 className={styles.title}>Заказ {orderNumber}</h2>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </header>

        {!order && !error && <p className={styles.muted}>Загрузка…</p>}
        {error && <p className={styles.error}>{error}</p>}

        {order && (
          <div className={styles.body}>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Клиент</h3>
              <p className={styles.line}>{order.customerName}</p>
              <p className={styles.muted}>{order.customerPhone}</p>
              <p className={styles.muted}>{order.customerEmail}</p>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Доставка и оплата</h3>
              <p className={styles.muted}>
                {DELIVERY_LABELS[order.deliveryMethod] ?? order.deliveryMethod}
              </p>
              {order.deliveryMethod === 'courier' && (
                <p className={styles.line}>
                  {order.deliveryCity}, {order.deliveryAddress}
                </p>
              )}
              <p className={styles.muted}>
                {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
              </p>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Состав заказа</h3>
              <ul className={styles.items}>
                {order.items.map((item) => (
                  <li key={item.productId} className={styles.item}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemMeta}>× {item.quantity}</span>
                    <span className={styles.itemPrice}>
                      {formatPrice(item.subtotal)} ₽
                    </span>
                  </li>
                ))}
              </ul>
              <p className={styles.total}>
                Итоговая сумма: <strong>{formatPrice(order.total)} ₽</strong>
              </p>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Статус заказа</h3>
              <div className={styles.statusRow}>
                <select
                  className={styles.select}
                  value={status}
                  onChange={(event) => setStatus(event.target.value as OrderStatus)}
                >
                  {ORDER_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Button type="button" onClick={handleSave} disabled={saving}>
                  {saving ? 'Сохранение…' : 'Сохранить'}
                </Button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
