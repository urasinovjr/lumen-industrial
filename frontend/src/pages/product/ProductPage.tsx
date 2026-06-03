import { useEffect, useState } from 'react'
import type { SyntheticEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { addToCart } from '../../entities/cart'
import { fetchProduct } from '../../entities/product'
import { formatPrice } from '../../entities/order'
import { Button, QuantityInput } from '../../shared/ui'
import { productImagePlaceholder } from '../../shared/api/client'
import styles from './ProductPage.module.css'

export default function ProductPage() {
  const { productId } = useParams<{ productId: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const { current, currentStatus, currentError, categories } = useAppSelector(
    (state) => state.products,
  )

  useEffect(() => {
    const id = Number(productId)
    if (Number.isFinite(id) && id > 0) {
      dispatch(fetchProduct(id))
    }
  }, [dispatch, productId])

  if (currentStatus === 'loading' || currentStatus === 'idle') {
    return (
      <main className={styles.page}>
        <p className={styles.notFound}>Загружаем товар…</p>
      </main>
    )
  }

  if (currentStatus === 'failed' || !current) {
    return (
      <main className={styles.page}>
        <div className={styles.notFound}>
          <h1>Товар не найден</h1>
          <p>{currentError ?? 'Возможно, артикул был снят с производства.'}</p>
          <Link to="/catalog" className={styles.backLink}>
            ← Вернуться в каталог
          </Link>
        </div>
      </main>
    )
  }

  const product = current
  const category = categories.find((c) => c.id === product.categoryId)
  const fallback = productImagePlaceholder(product.categoryId)
  const mainImage = product.imageUrl ?? fallback

  function handleImageError(event: SyntheticEvent<HTMLImageElement>) {
    const img = event.currentTarget
    if (img.src.endsWith(fallback)) return
    img.src = fallback
  }

  async function handleAddToCart() {
    setAdding(true)
    setAddError(null)
    try {
      await dispatch(addToCart({ productId: product.id, quantity })).unwrap()
      navigate('/cart')
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Не удалось добавить в корзину')
    } finally {
      setAdding(false)
    }
  }

  return (
    <main className={styles.page}>
      <nav className={styles.breadcrumbs} aria-label="Хлебные крошки">
        <Link to="/catalog">Каталог</Link>
        <span aria-hidden="true">›</span>
        {category && <span>{category.name}</span>}
        <span aria-hidden="true">›</span>
        <span className={styles.crumbCurrent}>{product.name}</span>
      </nav>

      <div className={styles.layout}>
        <div className={styles.mediaCol}>
          <div className={styles.mainImage}>
            <img src={mainImage} alt={product.name} onError={handleImageError} />
          </div>
          <div className={styles.thumbs}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={styles.thumb}>
                <img src={mainImage} alt={`Вид ${i + 1}`} onError={handleImageError} />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.infoCol}>
          {category && (
            <p className={styles.series}>{category.name.toUpperCase()}</p>
          )}
          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.description}>{product.description}</p>

          <dl className={styles.specs}>
            {product.power != null && (
              <div className={styles.specItem}>
                <dt>Мощность</dt>
                <dd>{product.power} Вт</dd>
              </div>
            )}
            {product.socketType && (
              <div className={styles.specItem}>
                <dt>Тип цоколя</dt>
                <dd>{product.socketType}</dd>
              </div>
            )}
            {product.colorTemp != null && product.colorTemp > 0 && (
              <div className={styles.specItem}>
                <dt>Цветовая температура</dt>
                <dd>{product.colorTemp}K</dd>
              </div>
            )}
            {product.lifespan != null && (
              <div className={styles.specItem}>
                <dt>Срок службы</dt>
                <dd>{Math.round(product.lifespan / 1000)}к часов</dd>
              </div>
            )}
          </dl>

          <p className={styles.price}>{formatPrice(product.price)} ₽</p>

          {product.stock > 0 ? (
            <>
              <p className={styles.stockNote}>В наличии: {product.stock} шт.</p>
              <div className={styles.actions}>
                <QuantityInput
                  value={quantity}
                  onChange={(next) =>
                    setQuantity(Math.min(Math.max(1, next), product.stock))
                  }
                  min={1}
                  max={product.stock}
                />
                <Button size="large" onClick={handleAddToCart} disabled={adding}>
                  {adding ? 'Добавляем…' : 'В корзину'}
                </Button>
              </div>
            </>
          ) : (
            <p className={styles.outOfStock}>Нет в наличии</p>
          )}

          {addError && <p className={styles.notFound}>{addError}</p>}

          <ul className={styles.benefits}>
            <li>
              <span className={styles.benefitDot} aria-hidden="true">●</span>
              Упаковка по 5 штук в коробке
            </li>
            <li>
              <span className={styles.benefitDot} aria-hidden="true">●</span>
              Гарантия производителя 2 года
            </li>
            <li>
              <span className={styles.benefitDot} aria-hidden="true">●</span>
              Поможем подобрать аналог за 1–2 дня
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}
