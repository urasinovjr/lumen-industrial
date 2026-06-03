import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

const FOOTER_LINKS = [
  { to: '/catalog', label: 'Каталог' },
  { to: '/cart', label: 'Корзина' },
]

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.copyright}>© 2026 LUMEN INDUSTRIAL</p>
        <ul className={styles.links}>
          {FOOTER_LINKS.map((link) => (
            <li key={link.to}>
              <Link className={styles.link} to={link.to}>
                {link.label.toUpperCase()}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
