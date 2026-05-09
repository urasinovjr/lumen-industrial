import styles from './QuantityInput.module.css'

type QuantityInputProps = {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
}

export function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 99,
}: QuantityInputProps) {
  function dec() {
    if (value > min) onChange(value - 1)
  }
  function inc() {
    if (value < max) onChange(value + 1)
  }

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.btn}
        onClick={dec}
        disabled={value <= min}
        aria-label="Уменьшить"
      >
        −
      </button>
      <span className={styles.value}>{value}</span>
      <button
        type="button"
        className={styles.btn}
        onClick={inc}
        disabled={value >= max}
        aria-label="Увеличить"
      >
        +
      </button>
    </div>
  )
}
