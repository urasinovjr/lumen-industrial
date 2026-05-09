import { Link } from 'react-router-dom'
import type { Product } from '../../entities/product'
import { formatPrice } from '../../entities/order'
import { productImagePlaceholder } from '../../shared/api/client'
import styles from './ProductCard.module.css'

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const fallback = productImagePlaceholder(product.categoryId)
  const src = product.imageUrl ?? fallback

  function handleError(event: React.SyntheticEvent<HTMLImageElement>) {
    const img = event.currentTarget
    if (img.src.endsWith(fallback)) return
    img.src = fallback
  }

  return (
    <Link className={styles.card} to={`/product/${product.id}`}>
      <div className={styles.media}>
        <img
          className={styles.image}
          src={src}
          alt={product.name}
          loading="lazy"
          onError={handleError}
        />
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>
        <div className={styles.footerRow}>
          <span className={styles.price}>{formatPrice(product.price)} ₽</span>
          <span className={styles.arrow} aria-hidden="true">
            →
          </span>
        </div>
      </div>
    </Link>
  )
}
