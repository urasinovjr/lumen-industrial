import { Fragment, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchCategories, fetchProducts } from '../../entities/product'
import { ProductCard } from '../../widgets/product-card/ProductCard'
import { PromoBanner } from '../../widgets/promo-banner/PromoBanner'
import { Newsletter } from '../../widgets/newsletter/Newsletter'
import styles from './CatalogPage.module.css'

const PAGE_SIZE = 8
const PAGE_SIZE_WITH_PROMO = 6

export default function CatalogPage() {
  const dispatch = useAppDispatch()
  const [params, setParams] = useSearchParams()

  const search = params.get('search')?.trim() ?? ''
  const categoryIdParam = params.get('category_id')
  const categoryId = categoryIdParam ? Number(categoryIdParam) : null
  const pageParam = params.get('page')
  const page = pageParam ? Math.max(1, Number(pageParam)) : 1

  const { items, total, listStatus, listError, categories } = useAppSelector(
    (state) => state.products,
  )

  const promoEligible = !categoryId && !search
  const limit = promoEligible && page === 1 ? PAGE_SIZE_WITH_PROMO : PAGE_SIZE
  const showPromo = promoEligible && page === 1

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  useEffect(() => {
    dispatch(
      fetchProducts({
        page,
        limit,
        search: search || undefined,
        categoryId: categoryId ?? undefined,
      }),
    )
  }, [dispatch, page, limit, search, categoryId])

  const totalPages = (() => {
    if (total === 0) return 1
    if (promoEligible) {
      if (total <= PAGE_SIZE_WITH_PROMO) return 1
      return Math.ceil((total - PAGE_SIZE_WITH_PROMO) / PAGE_SIZE) + 1
    }
    return Math.ceil(total / PAGE_SIZE)
  })()

  function updateParam(key: string, value: string | null) {
    const next = new URLSearchParams(params)
    if (value === null || value === '') {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    next.delete('page')
    setParams(next, { replace: false })
  }

  function gotoPage(next: number) {
    const safe = Math.max(1, Math.min(totalPages, next))
    const nextParams = new URLSearchParams(params)
    if (safe === 1) {
      nextParams.delete('page')
    } else {
      nextParams.set('page', String(safe))
    }
    setParams(nextParams)
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>ОСВЕЩЕНИЕ ПРОМЫШЛЕННОГО КЛАССА</p>
        <h1 className={styles.title}>
          ИНЖЕНЕРНАЯ <span className={styles.titleAccent}>ТОЧНОСТЬ</span>
          <br />
          ДЛЯ АРХИТЕКТУРНЫХ ПРОСТРАНСТВ
        </h1>
        <p className={styles.subtitle}>
          Лампы и компоненты Lumen Industrial созданы для экстремальной
          надёжности и спектральной точности. Высокоэффективные стёкла в
          сочетании с промышленными радиаторами.
        </p>

        <div className={styles.filters} role="tablist">
          <FilterChip
            isActive={categoryId === null}
            onClick={() => updateParam('category_id', null)}
            label="Все типы"
          />
          {categories.map((category) => (
            <FilterChip
              key={category.id}
              isActive={categoryId === category.id}
              onClick={() => updateParam('category_id', String(category.id))}
              label={category.name}
            />
          ))}
        </div>
      </section>

      <section className={styles.gridWrap}>
        {search && (
          <p className={styles.searchHint}>
            Результаты по запросу: <strong>«{search}»</strong>
          </p>
        )}

        {listStatus === 'loading' && (
          <p className={styles.empty}>Загружаем каталог…</p>
        )}

        {listStatus === 'failed' && (
          <p className={styles.empty}>
            Не удалось загрузить товары: {listError ?? 'неизвестная ошибка'}.
            Убедитесь, что сервис товаров запущен на :3001.
          </p>
        )}

        {listStatus === 'succeeded' && items.length === 0 && (
          <p className={styles.empty}>
            По вашему запросу ничего не найдено. Попробуйте изменить фильтр.
          </p>
        )}

        {listStatus === 'succeeded' && items.length > 0 && (
          <div className={styles.grid}>
            {items.map((product, idx) => (
              <Fragment key={product.id}>
                {showPromo && idx === 4 && (
                  <div className={styles.gridPromo}>
                    <PromoBanner />
                  </div>
                )}
                <ProductCard product={product} />
              </Fragment>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className={styles.pagination} aria-label="Пагинация">
            <button
              type="button"
              className={styles.pageNav}
              onClick={() => gotoPage(page - 1)}
              disabled={page <= 1}
              aria-label="Предыдущая"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const className =
                p === page
                  ? `${styles.pageBtn} ${styles.pageBtnActive}`
                  : styles.pageBtn
              return (
                <button
                  key={p}
                  type="button"
                  className={className}
                  onClick={() => gotoPage(p)}
                >
                  {p}
                </button>
              )
            })}
            <button
              type="button"
              className={styles.pageNav}
              onClick={() => gotoPage(page + 1)}
              disabled={page >= totalPages}
              aria-label="Следующая"
            >
              ›
            </button>
          </nav>
        )}
      </section>

      <Newsletter />
    </main>
  )
}

type FilterChipProps = {
  label: string
  isActive: boolean
  onClick: () => void
}

function FilterChip({ label, isActive, onClick }: FilterChipProps) {
  const className = isActive
    ? `${styles.chip} ${styles.chipActive}`
    : styles.chip
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      className={className}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
