import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchMe } from '../../entities/admin'
import styles from './RequireAdmin.module.css'

type RequireAdminProps = {
  children: ReactNode
}

export function RequireAdmin({ children }: RequireAdminProps) {
  const dispatch = useAppDispatch()
  const { token, profile } = useAppSelector((state) => state.admin)

  useEffect(() => {
    if (token && !profile) {
      dispatch(fetchMe())
    }
  }, [token, profile, dispatch])

  if (!token) {
    return <Navigate to="/admin/login" replace />
  }

  if (!profile) {
    return <div className={styles.checking}>Проверка доступа…</div>
  }

  return <>{children}</>
}
