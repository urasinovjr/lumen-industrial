import { useId } from 'react'
import styles from './RadioGroup.module.css'

export type RadioOption = {
  value: string
  label: string
  description?: string
  hint?: string
}

type RadioGroupProps = {
  name: string
  value: string
  options: RadioOption[]
  onChange: (value: string) => void
}

export function RadioGroup({ name, value, options, onChange }: RadioGroupProps) {
  const reactId = useId()
  return (
    <div className={styles.group} role="radiogroup">
      {options.map((opt) => {
        const optId = `${reactId}-${opt.value}`
        const isActive = opt.value === value
        const labelClass = isActive
          ? `${styles.option} ${styles.optionActive}`
          : styles.option
        return (
          <label key={opt.value} htmlFor={optId} className={labelClass}>
            <input
              id={optId}
              type="radio"
              name={name}
              value={opt.value}
              checked={isActive}
              onChange={() => onChange(opt.value)}
              className={styles.input}
            />
            <span className={styles.dot} aria-hidden="true">
              <span className={styles.dotInner} />
            </span>
            <span className={styles.text}>
              <span className={styles.label}>{opt.label}</span>
              {opt.description && (
                <span className={styles.description}>{opt.description}</span>
              )}
            </span>
            {opt.hint && <span className={styles.hint}>{opt.hint}</span>}
          </label>
        )
      })}
    </div>
  )
}
