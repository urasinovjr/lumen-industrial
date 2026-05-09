import type { InputHTMLAttributes } from 'react'
import { useId } from 'react'
import styles from './Input.module.css'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string | null
  hint?: string
}

export function Input({
  label,
  error,
  hint,
  className,
  id,
  ...rest
}: InputProps) {
  const reactId = useId()
  const inputId = id ?? reactId

  const fieldClass = [
    styles.field,
    error ? styles.fieldError : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.wrap}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}
      <input id={inputId} className={fieldClass} {...rest} />
      {error && <span className={styles.error}>{error}</span>}
      {!error && hint && <span className={styles.hint}>{hint}</span>}
    </div>
  )
}
