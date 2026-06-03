import styles from './PromoBanner.module.css'

export function PromoBanner() {
  return (
    <article className={styles.banner}>
      <p className={styles.eyebrow}>ОПТОВЫМ ПОКУПАТЕЛЯМ</p>
      <h3 className={styles.title}>
        ПОСТАВКИ
        <br />
        ДЛЯ БИЗНЕСА
      </h3>
      <p className={styles.text}>
        Отгружаем партии от 100 штук со склада. Поможем подобрать лампы под
        ваш объект и согласуем цену.
      </p>
    </article>
  )
}
