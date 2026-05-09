import { Button } from '../../shared/ui'
import styles from './PromoBanner.module.css'

export function PromoBanner() {
  return (
    <article className={styles.banner}>
      <p className={styles.eyebrow}>КОРПОРАТИВНЫЕ РЕШЕНИЯ</p>
      <h3 className={styles.title}>
        ОПТОВАЯ ИНДИВИДУАЛЬНАЯ
        <br />
        РАЗРАБОТКА
      </h3>
      <p className={styles.text}>
        Мы специализируемся на спектральных решениях для производственных
        пространств и архитектурных проектов. Индивидуальные параметры для
        вашего предприятия.
      </p>
      <Button variant="secondary">Запросить доступ</Button>
    </article>
  )
}
