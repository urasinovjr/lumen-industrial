import styles from './Footer.module.css'

const FOOTER_LINKS = [
  { href: '/gallery', label: 'Галерея проектов' },
  { href: '/wholesale', label: 'Оптовые поставки' },
  { href: '/docs', label: 'Документация' },
  { href: '/support', label: 'Техподдержка' },
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
