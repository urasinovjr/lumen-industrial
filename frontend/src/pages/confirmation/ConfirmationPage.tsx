import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchOrder, formatDateRu, formatPrice } from '../../entities/order'
import {
  Button,
  IconBox,
  IconCalendar,
  IconCheck,
  IconMapPin,
} from '../../shared/ui'
import styles from './ConfirmationPage.module.css'

export default function ConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const dispatch = useAppDispatch()
  const { current: order, status, error } = useAppSelector(
    (state) => state.orders,
  )

  useEffect(() => {
    if (!orderNumber) return
    if (order && order.orderNumber === orderNumber) return
    dispatch(fetchOrder(orderNumber))
  }, [dispatch, orderNumber, order])

  if (status === 'loading' || (status === 'idle' && !order)) {
    return (
      <main className={styles.page}>
        <div className={styles.unknown}>
          <h1>Загружаем заказ…</h1>
        </div>
      </main>
    )
  }

  if (status === 'failed' || !order) {
    return (
      <main className={styles.page}>
        <div className={styles.unknown}>
          <h1>Заказ не найден</h1>
          <p>{error ?? 'Возможно, вы открыли страницу подтверждения напрямую.'}</p>
          <Link to="/catalog" className={styles.unknownLink}>
            ← В каталог
          </Link>
        </div>
      </main>
    )
  }

  const expectedDate = new Date(order.createdAt)
  expectedDate.setDate(expectedDate.getDate() + 4)

  const subtotal = order.items.reduce((sum, it) => sum + it.subtotal, 0)
  const deliveryPrice = Math.max(0, order.total - subtotal)

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <span className={styles.checkmark}>
          <IconCheck width={32} height={32} />
        </span>
        <h1 className={styles.title}>ЗАКАЗ ПОДТВЕРЖДЁН</h1>
        <p className={styles.subtitle}>
          Заказ принят. Подтверждение мы отправили на ваш e-mail.
        </p>
        <p className={styles.orderNumber}>
          НОМЕР ЗАКАЗА: <strong>{order.orderNumber}</strong>
        </p>
      </header>

      <div className={styles.layout}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span className={styles.cardIcon}>
              <IconBox width={18} height={18} />
            </span>
            Список товаров
          </h2>
          {order.items.length > 0 && (
            <ul className={styles.itemList}>
              {order.items.map((item) => (
                <li key={item.productId} className={styles.itemRow}>
                  <div className={styles.itemBody}>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.itemMeta}>× {item.quantity}</p>
                  </div>
                  <p className={styles.itemPrice}>
                    {formatPrice(item.subtotal)} ₽
                  </p>
                </li>
              ))}
            </ul>
          )}
          <p className={styles.cardSummary}>
            Подытог: <strong>{formatPrice(subtotal)} ₽</strong>
          </p>
          {deliveryPrice > 0 && (
            <p className={styles.cardSummary}>
              Доставка: <strong>{formatPrice(deliveryPrice)} ₽</strong>
            </p>
          )}
          <hr className={styles.divider} />
          <p className={styles.cardTotal}>
            ИТОГО К ОПЛАТЕ:{' '}
            <span className={styles.cardTotalValue}>
              {formatPrice(order.total)} ₽
            </span>
          </p>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span className={styles.cardIcon}>
              <IconMapPin width={18} height={18} />
            </span>
            Адрес доставки
          </h2>
          {order.deliveryMethod === 'pickup' ? (
            <p className={styles.cardText}>
              Самовывоз со склада: ул. Промышленная, 7.
            </p>
          ) : (
            <p className={styles.cardText}>
              {order.deliveryCity}, {order.deliveryAddress}
              <br />
              Получатель: {order.customerName}
            </p>
          )}
          <p className={styles.cardMeta}>
            <IconCalendar width={16} height={16} />
            <span>Ожидаемая дата: {formatDateRu(expectedDate)}</span>
          </p>
        </section>
      </div>

      <div className={styles.actions}>
        <Button
          size="large"
          onClick={() =>
            alert(
              `Отслеживание заказа ${order.orderNumber} появится после отгрузки.`,
            )
          }
        >
          Отследить заказ
        </Button>
        <Link to="/catalog" className={styles.backLink}>
          <Button variant="secondary" size="large">
            В каталог
          </Button>
        </Link>
      </div>

      <section className={styles.tracking}>
        <div className={styles.trackingMap} aria-hidden="true" />
        <div className={styles.trackingInfo}>
          <span className={styles.trackingTag}>СТАТУС</span>
          <p className={styles.trackingText}>
            Заказ собирается на складе.
          </p>
        </div>
      </section>
    </main>
  )
}
