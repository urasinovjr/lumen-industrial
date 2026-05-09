import { Link } from 'react-router-dom'
import styles from './Logo.module.css'

export function Logo() {
  return (
    <Link to="/" className={styles.logo}>
      <span className={styles.lumen}>LUMEN</span>
      <span className={styles.divider} aria-hidden="true">
        |
      </span>
      <span className={styles.industrial}>INDUSTRIAL</span>
    </Link>
  )
}
