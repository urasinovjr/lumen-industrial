import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '../../shared/ui'
import styles from './Newsletter.module.css'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim()) return
    setSubmitted(true)
    setEmail('')
  }

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>НОВИНКИ И АКЦИИ</h2>
        <p className={styles.text}>
          Раз в месяц присылаем новые товары и скидки. Без спама — отписаться
          можно в один клик.
        </p>
        {submitted ? (
          <p className={styles.confirm}>
            Спасибо, мы добавили вас в рассылку.
          </p>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              type="email"
              required
              placeholder="Ваш e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              aria-label="Email"
            />
            <Button type="submit">Подписаться</Button>
          </form>
        )}
      </div>
    </section>
  )
}
