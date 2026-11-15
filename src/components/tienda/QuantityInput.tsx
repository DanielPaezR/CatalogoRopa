'use client'

import { MinusIcon, PlusIcon } from '@/components/ui/Icons'

export default function QuantityInput({
  value,
  max,
  onChange,
  size = 'md',
}: {
  value: number
  max: number
  onChange: (v: number) => void
  size?: 'sm' | 'md'
}) {
  const h = size === 'sm' ? 'h-8' : 'h-11'
  return (
    <div className={`inline-flex ${h} items-center rounded-full border border-sand-300 bg-white`}>
      <button
        type="button"
        className="flex h-full w-9 items-center justify-center text-ink-soft hover:text-ink disabled:opacity-30"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Disminuir"
      >
        <MinusIcon width={16} height={16} />
      </button>
      <span className="w-7 text-center text-sm font-medium tabular-nums">{value}</span>
      <button
        type="button"
        className="flex h-full w-9 items-center justify-center text-ink-soft hover:text-ink disabled:opacity-30"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Aumentar"
      >
        <PlusIcon width={16} height={16} />
      </button>
    </div>
  )
}
