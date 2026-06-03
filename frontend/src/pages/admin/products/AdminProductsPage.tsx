import { useCallback, useEffect, useMemo, useState } from 'react'
import { listCategories, listProducts } from '../../../shared/api/productsApi'
import {
  createProduct,
  deleteProduct,
  updateProduct,
  uploadProductImage,
} from '../../../shared/api/adminApi'
import { productImagePlaceholder } from '../../../shared/api/client'
import { formatPrice } from '../../../entities/order'
import type { Category, Product } from '../../../entities/product'
import type { ProductForm } from '../../../entities/admin'
import { ProductFormModal } from './ProductFormModal'
import styles from './AdminProductsPage.module.css'

const PAGE_SIZE = 8

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const loadProducts = useCallback(() => {
    return listProducts({
      page,
      limit: PAGE_SIZE,
      search: search || undefined,
      categoryId: categoryId ?? undefined,
      includeInactive: true,
    })
      .then((result) => {
        setProducts(result.products)
        setTotal(result.total)
        setError(null)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить товары')
      })
  }, [page, search, categoryId])

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const categoryName = useMemo(() => {
    const map = new Map(categories.map((category) => [category.id, category.name]))
    return (id: number) => map.get(id) ?? '—'
  }, [categories])

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(product: Product) {
    setEditing(product)
    setModalOpen(true)
  }

  async function handleSubmit(form: ProductForm, file: File | null) {
    let productId: number
    if (editing) {
      await updateProduct(editing.id, form)
      productId = editing.id
    } else {
      productId = await createProduct(form)
    }
    if (file) {
      await uploadProductImage(productId, file)
    }
    setModalOpen(false)
    setEditing(null)
    await loadProducts()
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(`Удалить товар «${product.name}»?`)) {
      return
    }
    try {
      await deleteProduct(product.id)
      await loadProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить товар')
    }
  }

  return (
    <section>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Склад товаров</h1>
          <p className={styles.subtitle}>
            Добавляйте, редактируйте и удаляйте товары каталога.
          </p>
        </div>
        <button type="button" className={styles.addButton} onClick={openCreate}>
          + Добавить товар
        </button>
      </header>

      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          placeholder="Поиск по названию"
          aria-label="Поиск по названию"
        />
        <select
          className={styles.categorySelect}
          value={categoryId ?? ''}
          onChange={(event) => {
            setCategoryId(event.target.value ? Number(event.target.value) : null)
            setPage(1)
          }}
          aria-label="Категория"
        >
          <option value="">Все категории</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Всего товаров</span>
          <span className={styles.statValue}>{total}</span>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.tableCard}>
        <div className={`${styles.row} ${styles.head}`}>
          <span>ID товара</span>
          <span>Наименование</span>
          <span>Категория</span>
          <span>Цена</span>
          <span>Остаток</span>
          <span className={styles.actionsHead}>Действия</span>
        </div>

        {products.length === 0 && (
          <p className={styles.empty}>Товары не найдены.</p>
        )}

        {products.map((product) => (
          <div key={product.id} className={styles.row}>
            <span className={styles.code}>#{product.id}</span>
            <div className={styles.nameCell}>
              <img
                className={styles.thumb}
                src={product.imageUrl ?? productImagePlaceholder(product.categoryId)}
                alt={product.name}
                onError={(event) => {
                  event.currentTarget.src = productImagePlaceholder(product.categoryId)
                }}
              />
              <div>
                <p className={styles.name}>{product.name}</p>
                <p className={styles.desc}>{product.description}</p>
              </div>
            </div>
            <span>
              <span className={styles.badge}>{categoryName(product.categoryId)}</span>
            </span>
            <span className={styles.price}>{formatPrice(product.price)} ₽</span>
            <span className={styles.stock}>{product.stock} шт.</span>
            <span className={styles.actions}>
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => openEdit(product)}
              >
                Изменить
              </button>
              <button
                type="button"
                className={`${styles.iconButton} ${styles.danger}`}
                onClick={() => handleDelete(product)}
              >
                Удалить
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

      {modalOpen && (
        <ProductFormModal
          initial={editing}
          categories={categories}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  )
}
