'use client'

export default function MoneyInput({
  value,
  onChange,
  id,
  required,
  placeholder,
}: {
  value: number | null
  onChange: (v: number | null) => void
  id?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-stone-400">$</span>
      <input
        id={id}
        required={required}
        inputMode="numeric"
        placeholder={placeholder}
        className="input pl-7"
        value={value === null ? '' : value.toLocaleString('es-CO')}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, '')
          onChange(digits ? Math.min(Number(digits), 999_999_999) : null)
        }}
      />
    </div>
  )
}
