import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { login } from '../../../entities/admin'
import styles from './AdminLoginPage.module.css'

export default function AdminLoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { token, status, error } = useAppSelector((state) => state.admin)

  const [loginName, setLoginName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (token) {
      navigate('/admin/products', { replace: true })
    }
  }, [token, navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = await dispatch(
      login({ login: loginName.trim(), password }),
    )
    if (login.fulfilled.match(result)) {
      navigate('/admin/products', { replace: true })
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <aside className={styles.brandPanel}>
          <span className={styles.brandLogo}>LUMEN INDUSTRIAL</span>
          <h1 className={styles.brandTitle}>Панель управления магазином</h1>
          <p className={styles.brandText}>
            Раздел для сотрудников: управление товарами и заказами. Вход только
            для администраторов.
          </p>
          <span className={styles.brandBadge}>Защищённый вход</span>
        </aside>

        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 className={styles.formTitle}>Вход для администратора</h2>
          <p className={styles.formSubtitle}>Введите логин и пароль</p>

          <label className={styles.field}>
            <span className={styles.label}>Логин</span>
            <input
              className={styles.input}
              type="text"
              value={loginName}
              onChange={(event) => setLoginName(event.target.value)}
              placeholder="Введите логин"
              autoComplete="username"
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Пароль</span>
            <span className={styles.passwordWrap}>
              <input
                className={styles.input}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Введите пароль"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className={styles.toggle}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? 'Скрыть' : 'Показать'}
              </button>
            </span>
          </label>

          {status === 'failed' && error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.submit}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Вход…' : 'Войти'}
          </button>

          <p className={styles.support}>
            Поддержка: <strong>support@lumen-industrial.ru</strong>
          </p>
        </form>
      </div>
    </div>
  )
}
