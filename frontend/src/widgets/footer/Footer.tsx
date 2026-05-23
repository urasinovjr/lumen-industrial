import styles from './Footer.module.css'

const FOOTER_LINKS = [
  { href: '/about', label: 'О компании' },
  { href: '/delivery', label: 'Доставка и оплата' },
  { href: '/wholesale', label: 'Оптовикам' },
  { href: '/contacts', label: 'Контакты' },
]

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.copyright}>© 2026 LUMEN INDUSTRIAL</p>
        <ul className={styles.links}>
          {FOOTER_LINKS.map((link) => (
            <li key={link.href}>
              <a className={styles.link} href={link.href}>
                {link.label.toUpperCase()}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
