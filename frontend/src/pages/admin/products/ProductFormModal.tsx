import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '../../../shared/ui'
import type { Category, Product } from '../../../entities/product'
import type { ProductForm } from '../../../entities/admin'
import styles from './ProductFormModal.module.css'

type ProductFormModalProps = {
  initial: Product | null
  categories: Category[]
  onClose: () => void
  onSubmit: (form: ProductForm, file: File | null) => Promise<void>
}

export function ProductFormModal({
  initial,
  categories,
  onClose,
  onSubmit,
}: ProductFormModalProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [categoryId, setCategoryId] = useState(
    initial ? String(initial.categoryId) : String(categories[0]?.id ?? ''),
  )
  const [price, setPrice] = useState(initial ? String(initial.price) : '')
  const [power, setPower] = useState(initial?.power != null ? String(initial.power) : '')
  const [socketType, setSocketType] = useState(initial?.socketType ?? '')
  const [colorTemp, setColorTemp] = useState(
    initial?.colorTemp != null ? String(initial.colorTemp) : '',
  )
  const [lifespan, setLifespan] = useState(
    initial?.lifespan != null ? String(initial.lifespan) : '',
  )
  const [stock, setStock] = useState(initial ? String(initial.stock) : '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim() || !categoryId || !price) {
      setError('Заполните название, категорию и цену')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(
        {
          name: name.trim(),
          description: description.trim(),
          categoryId: Number(categoryId),
          price: Number(price),
          power: Number(power) || 0,
          socketType: socketType.trim(),
          colorTemp: Number(colorTemp) || 0,
          lifespan: Number(lifespan) || 0,
          stock: Number(stock) || 0,
        },
        imageFile,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить товар')
      setSubmitting(false)
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
        <h2 className={styles.title}>
          {initial ? 'Редактирование товара' : 'Новый товар'}
        </h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Наименование</span>
            <input
              className={styles.input}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Описание</span>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
            />
          </label>

          <div className={styles.grid}>
            <label className={styles.field}>
              <span className={styles.label}>Категория</span>
              <select
                className={styles.input}
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                required
              >
                <option value="" disabled>
                  Выберите категорию
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Цена, ₽</span>
              <input
                className={styles.input}
                type="number"
                min="0"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Мощность, Вт</span>
              <input
                className={styles.input}
                type="number"
                min="0"
                value={power}
                onChange={(event) => setPower(event.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Тип цоколя</span>
              <input
                className={styles.input}
                value={socketType}
                onChange={(event) => setSocketType(event.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Цветовая температура, K</span>
              <input
                className={styles.input}
                type="number"
                min="0"
                value={colorTemp}
                onChange={(event) => setColorTemp(event.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Срок службы, ч</span>
              <input
                className={styles.input}
                type="number"
                min="0"
                value={lifespan}
                onChange={(event) => setLifespan(event.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Остаток, шт</span>
              <input
                className={styles.input}
                type="number"
                min="0"
                value={stock}
                onChange={(event) => setStock(event.target.value)}
              />
            </label>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>Изображение</span>
            <input
              className={styles.input}
              type="file"
              accept="image/*"
              onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
            />
            {initial?.imageUrl && !imageFile && (
              <span className={styles.hint}>
                Текущее изображение сохранится, если не выбирать новое.
              </span>
            )}
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.footer}>
            <Button type="button" variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Сохранение…' : 'Сохранить'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
