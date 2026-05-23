import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { logout } from '../../entities/admin'
import { IconBox, IconPackage } from '../../shared/ui'
import styles from './AdminLayout.module.css'

export function AdminLayout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const profile = useAppSelector((state) => state.admin.profile)

  async function handleLogout() {
    await dispatch(logout())
    navigate('/admin/login', { replace: true })
  }

  function navClass({ isActive }: { isActive: boolean }) {
    return isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandTitle}>ПАНЕЛЬ УПРАВЛЕНИЯ</span>
          <span className={styles.brandSub}>МАГАЗИН LUMEN</span>
        </div>

        <nav className={styles.nav}>
          <NavLink to="/admin/products" className={navClass}>
            <IconBox width={20} height={20} />
            Товары
          </NavLink>
          <NavLink to="/admin/orders" className={navClass}>
            <IconPackage width={20} height={20} />
            Заказы
          </NavLink>
        </nav>

        <div className={styles.sidebarBottom}>
          <button type="button" className={styles.reportButton}>
            Создать отчёт
          </button>
          <span className={styles.sidebarMuted}>Настройки</span>
          <button type="button" className={styles.sidebarLogout} onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <span className={styles.topbarBrand}>LUMEN АДМИН</span>
          <div className={styles.topbarRight}>
            <div className={styles.adminInfo}>
              <span className={styles.adminName}>{profile?.name ?? 'Администратор'}</span>
              <span className={styles.adminRole}>@{profile?.login ?? 'admin'}</span>
            </div>
            <button type="button" className={styles.logoutButton} onClick={handleLogout}>
              Выйти
            </button>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
