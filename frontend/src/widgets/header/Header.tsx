import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { IconCart, IconSearch, Logo } from '../../shared/ui'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchCart } from '../../entities/cart'
import styles from './Header.module.css'

const NAV_ITEMS = [{ to: '/catalog', label: 'Каталог' }]

export function Header() {
  const dispatch = useAppDispatch()
  const totalCount = useAppSelector((state) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0),
  )
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchCart())
  }, [dispatch])

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = search.trim()
    if (!trimmed) {
      navigate('/catalog')
      return
    }
    navigate(`/catalog?search=${encodeURIComponent(trimmed)}`)
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <Logo />
        </div>

        <button
          type="button"
          className={styles.burger}
          onClick={() => setIsMenuOpen((v) => !v)}
          aria-label="Меню"
          aria-expanded={isMenuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          className={
            isMenuOpen ? `${styles.nav} ${styles.navOpen}` : styles.nav
          }
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
              }
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <form className={styles.search} onSubmit={handleSearchSubmit} role="search">
          <span className={styles.searchIcon}>
            <IconSearch width={16} height={16} />
          </span>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Поиск по каталогу"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Поиск по каталогу"
          />
        </form>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label={`Корзина, ${totalCount} товаров`}
            onClick={() => navigate('/cart')}
          >
            <IconCart width={20} height={20} />
            {totalCount > 0 && (
              <span className={styles.cartBadge}>{totalCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
