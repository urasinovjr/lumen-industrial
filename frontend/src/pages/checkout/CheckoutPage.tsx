import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchCart, resetCart } from '../../entities/cart'
import { submitOrder } from '../../entities/order'
import { formatPrice } from '../../entities/order'
import type {
  CheckoutForm,
  DeliveryMethod,
  PaymentMethod,
} from '../../entities/order'
import {
  Button,
  IconMapPin,
  IconPhone,
  IconUser,
  Input,
  RadioGroup,
} from '../../shared/ui'
import type { RadioOption } from '../../shared/ui'
import { productImagePlaceholder } from '../../shared/api/client'
import styles from './CheckoutPage.module.css'

const DELIVERY_PRICE = 1450
const PICKUP_PRICE = 0
const TAX_RATE = 0.2

const DELIVERY_OPTIONS: RadioOption[] = [
  {
    value: 'courier',
    label: 'Стандартная доставка',
    description: 'Курьер до пункта приёмки, 2–3 рабочих дня',
    hint: '+ 1 450 ₽',
  },
  {
    value: 'pickup',
    label: 'Самовывоз',
    description: 'Терминал отгрузки, ул. Промышленная, 7',
    hint: 'Бесплатно',
  },
]

const PAYMENT_OPTIONS: RadioOption[] = [
  {
    value: 'card_online',
    label: 'Оплата онлайн',
    description: 'Банковская карта, СБП',
  },
  {
    value: 'invoice',
    label: 'Счёт на оплату',
    description: 'Безналичный расчёт для юр. лиц',
  },
]

const INITIAL_FORM: CheckoutForm = {
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  deliveryCity: 'Москва',
  deliveryAddress: '',
  deliveryMethod: 'courier',
  paymentMethod: 'card_online',
}

type Errors = Partial<Record<keyof CheckoutForm, string>>

export default function CheckoutPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items, total } = useAppSelector((state) => state.cart)
  const { status: orderStatus, error: orderError } = useAppSelector(
    (state) => state.orders,
  )

  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState<CheckoutForm>(INITIAL_FORM)
  const [errors, setErrors] = useState<Errors>({})

  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchCart())
    }
  }, [dispatch, items.length])

  const summary = useMemo(() => {
    const deliveryPrice =
      form.deliveryMethod === 'courier' ? DELIVERY_PRICE : PICKUP_PRICE
    const tax = Math.round(total * TAX_RATE)
    return {
      deliveryPrice,
      tax,
      finalTotal: total + deliveryPrice + tax,
    }
  }, [form.deliveryMethod, total])

  function update<K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  function validate(): Errors {
    const next: Errors = {}
    if (form.customerName.trim().length < 2) {
      next.customerName = 'Укажите ФИО получателя'
    }
    if (!/^[+\d\s()-]{6,}$/.test(form.customerPhone.trim())) {
      next.customerPhone = 'Некорректный телефон'
    }
    if (!/^.+@.+\..+$/.test(form.customerEmail.trim())) {
      next.customerEmail = 'Некорректный email'
    }
    if (form.deliveryMethod === 'courier') {
      if (form.deliveryCity.trim().length < 2) {
        next.deliveryCity = 'Укажите город'
      }
      if (form.deliveryAddress.trim().length < 4) {
        next.deliveryAddress = 'Укажите адрес доставки'
      }
    }
    return next
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return

    try {
      const order = await dispatch(submitOrder(form)).unwrap()
      setSubmitted(true)
      dispatch(resetCart())
      navigate(`/confirmation/${order.orderNumber}`)
    } catch {
      // ошибка уже сохранена в orders state
    }
  }

  if (items.length === 0 && !submitted) {
    return <Navigate to="/cart" replace />
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Оформление заказа</h1>
        <p className={styles.subtitle}>
          Проверьте параметры доставки и завершите оформление.
        </p>
      </header>

      <form className={styles.layout} onSubmit={handleSubmit} noValidate>
        <div className={styles.formCol}>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>
              <span className={styles.legendIcon}>
                <IconUser width={16} height={16} />
              </span>
              Контактная информация
            </legend>
            <div className={styles.row}>
              <Input
                label="ФИО"
                value={form.customerName}
                onChange={(e) => update('customerName', e.target.value)}
                placeholder="Иванов Иван Иванович"
                error={errors.customerName}
                autoComplete="name"
                required
              />
              <Input
                label="Номер телефона"
                value={form.customerPhone}
                onChange={(e) => update('customerPhone', e.target.value)}
                placeholder="+7 (495) 000-00-00"
                error={errors.customerPhone}
                autoComplete="tel"
                inputMode="tel"
                required
              />
            </div>
            <Input
              label="Рабочий e-mail"
              type="email"
              value={form.customerEmail}
              onChange={(e) => update('customerEmail', e.target.value)}
              placeholder="company@example.ru"
              error={errors.customerEmail}
              autoComplete="email"
              required
            />
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>
              <span className={styles.legendIcon}>
                <IconMapPin width={16} height={16} />
              </span>
              Адрес доставки
            </legend>
            <Input
              label="Город / производственная зона"
              value={form.deliveryCity}
              onChange={(e) => update('deliveryCity', e.target.value)}
              error={errors.deliveryCity}
              disabled={form.deliveryMethod === 'pickup'}
              autoComplete="address-level2"
            />
            <Input
              label="Улица, дом, корпус"
              value={form.deliveryAddress}
              onChange={(e) => update('deliveryAddress', e.target.value)}
              placeholder="ул. Промышленная, 7, корпус 2"
              error={errors.deliveryAddress}
              disabled={form.deliveryMethod === 'pickup'}
              autoComplete="street-address"
            />
          </fieldset>

          <div className={styles.twoCol}>
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Способ доставки</legend>
              <RadioGroup
                name="deliveryMethod"
                value={form.deliveryMethod}
                options={DELIVERY_OPTIONS}
                onChange={(v) => update('deliveryMethod', v as DeliveryMethod)}
              />
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Способ оплаты</legend>
              <RadioGroup
                name="paymentMethod"
                value={form.paymentMethod}
                options={PAYMENT_OPTIONS}
                onChange={(v) => update('paymentMethod', v as PaymentMethod)}
              />
            </fieldset>
          </div>

          <Link to="/cart" className={styles.backLink}>
            ← Вернуться в корзину
          </Link>
        </div>

        <aside className={styles.summary}>
          <h2 className={styles.summaryTitle}>Сводка заказа</h2>
          <ul className={styles.summaryItems}>
            {items.map((item) => {
              const fallback = productImagePlaceholder(null)
              return (
                <li key={item.id} className={styles.summaryItem}>
                  <div className={styles.summaryItemMedia}>
                    <img
                      src={item.imageUrl ?? fallback}
                      alt={item.name}
                      loading="lazy"
                      onError={(e) => {
                        const img = e.currentTarget
                        if (img.src.endsWith(fallback)) return
                        img.src = fallback
                      }}
                    />
                  </div>
                  <div className={styles.summaryItemBody}>
                    <p className={styles.summaryItemName}>{item.name}</p>
                    <p className={styles.summaryItemMeta}>× {item.quantity}</p>
                  </div>
                  <p className={styles.summaryItemPrice}>
                    {formatPrice(item.subtotal)} ₽
                  </p>
                </li>
              )
            })}
          </ul>

          <dl className={styles.summaryRows}>
            <div>
              <dt>Сумма по товарам</dt>
              <dd>{formatPrice(total)} ₽</dd>
            </div>
            <div>
              <dt>Доставка</dt>
              <dd>
                {summary.deliveryPrice === 0
                  ? 'Бесплатно'
                  : `${formatPrice(summary.deliveryPrice)} ₽`}
              </dd>
            </div>
            <div>
              <dt>НДС (20%)</dt>
              <dd>{formatPrice(summary.tax)} ₽</dd>
            </div>
          </dl>

          <div className={styles.summaryTotal}>
            <span>Итого</span>
            <span className={styles.summaryTotalValue}>
              {formatPrice(summary.finalTotal)} ₽
            </span>
          </div>

          <Button
            type="submit"
            size="large"
            fullWidth
            disabled={orderStatus === 'loading'}
          >
            {orderStatus === 'loading' ? 'Оформляем…' : 'Подтвердить заказ'}
          </Button>

          {orderError && (
            <p className={styles.summaryError}>{orderError}</p>
          )}

          <div className={styles.summaryHelp}>
            <span className={styles.summaryHelpIcon}>
              <IconPhone width={20} height={20} />
            </span>
            <p>
              Нужна консультация инженера? Свяжемся в течение часа после
              подтверждения.
            </p>
          </div>
        </aside>
      </form>
    </main>
  )
}
