import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import {
  fetchCart,
  removeFromCart,
  setCartItemQuantity,
} from '../../entities/cart'
import { formatPrice } from '../../entities/order'
import { Button, IconPackage, QuantityInput } from '../../shared/ui'
import { productImagePlaceholder } from '../../shared/api/client'
import styles from './CartPage.module.css'

const DELIVERY_PRICE = 4950
const TAX_RATE = 0.2

export default function CartPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items, total, status, error, mutating } = useAppSelector(
    (state) => state.cart,
  )

  useEffect(() => {
    dispatch(fetchCart())
  }, [dispatch])

  const tax = Math.round(total * TAX_RATE)
  const finalTotal = total + DELIVERY_PRICE + tax

  if (status === 'loading' && items.length === 0) {
    return (
      <main className={styles.page}>
        <div className={styles.empty}>
          <h1 className={styles.emptyTitle}>Загружаем корзину…</h1>
        </div>
      </main>
    )
  }

  if (status === 'failed' && items.length === 0) {
    return (
      <main className={styles.page}>
        <div className={styles.empty}>
          <h1 className={styles.emptyTitle}>Не удалось загрузить корзину</h1>
          <p className={styles.emptyText}>
            {error ?? 'Сервис заказов недоступен.'}
          </p>
          <Link to="/catalog" className={styles.emptyLink}>
            ← Перейти в каталог
          </Link>
        </div>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className={styles.page}>
        <div className={styles.empty}>
          <h1 className={styles.emptyTitle}>Корзина пуста</h1>
          <p className={styles.emptyText}>
            Подберите подходящие лампы в каталоге.
          </p>
          <Link to="/catalog" className={styles.emptyLink}>
            ← Перейти в каталог
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>ТЕРМИНАЛ ЗАКУПОК</p>
        <h1 className={styles.title}>Ваша корзина</h1>
        <p className={styles.subtitle}>
          Проверьте товары, подготовленные к заказу.
        </p>
      </header>

      <div className={styles.layout}>
        <section className={styles.itemsCol} aria-label="Товары в корзине">
          {items.map((item) => {
            const fallback = productImagePlaceholder(null)
            const src = item.imageUrl ?? fallback
            return (
              <article key={item.id} className={styles.item}>
                <Link
                  to={`/product/${item.productId}`}
                  className={styles.itemMedia}
                >
                  <img
                    src={src}
                    alt={item.name}
                    onError={(e) => {
                      const img = e.currentTarget
                      if (img.src.endsWith(fallback)) return
                      img.src = fallback
                    }}
                  />
                </Link>
                <div className={styles.itemBody}>
                  <Link
                    to={`/product/${item.productId}`}
                    className={styles.itemName}
                  >
                    {item.name}
                  </Link>
                  <p className={styles.itemDescription}>
                    Промышленный стандарт упаковки, гарантия производителя.
                  </p>
                </div>
                <div className={styles.itemControls}>
                  <QuantityInput
                    value={item.quantity}
                    onChange={(next) =>
                      dispatch(
                        setCartItemQuantity({ itemId: item.id, quantity: next }),
                      )
                    }
                  />
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => dispatch(removeFromCart(item.id))}
                    disabled={mutating}
                  >
                    Убрать
                  </button>
                </div>
                <div className={styles.itemPrice}>
                  <span className={styles.itemPriceLabel}>Цена в RUB</span>
                  <span className={styles.itemPriceValue}>
                    {formatPrice(item.subtotal)} ₽
                  </span>
                </div>
              </article>
            )
          })}

          <Link to="/catalog" className={styles.continue}>
            ← Вернуться к покупкам
          </Link>
        </section>

        <aside className={styles.summary}>
          <h2 className={styles.summaryTitle}>Детали заказа</h2>
          <dl className={styles.summaryList}>
            <div>
              <dt>Подытог товаров</dt>
              <dd>{formatPrice(total)} ₽</dd>
            </div>
            <div>
              <dt>Промышленная доставка</dt>
              <dd>{formatPrice(DELIVERY_PRICE)} ₽</dd>
            </div>
            <div>
              <dt>Налог (НДС 20%)</dt>
              <dd>{formatPrice(tax)} ₽</dd>
            </div>
          </dl>
          <div className={styles.summaryTotal}>
            <span>Итого</span>
            <span className={styles.summaryTotalValue}>
              {formatPrice(finalTotal)} ₽
            </span>
          </div>
          <Button size="large" fullWidth onClick={() => navigate('/checkout')}>
            Оформить заказ →
          </Button>
          <div className={styles.summaryHelp}>
            <span className={styles.summaryHelpIcon}>
              <IconPackage width={20} height={20} />
            </span>
            <p>
              Бесплатная упаковка
              <br />
              для заказа от 50 000 ₽.
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}
