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
  const h = size === 'sm' ? 'h-9' : 'h-11'
  return (
    <div className={`inline-flex ${h} items-center border border-black/15`}>
      <button
        type="button"
        className="flex h-full w-9 items-center justify-center hover:bg-bone disabled:opacity-30"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Disminuir"
      >
        <MinusIcon width={14} height={14} />
      </button>
      <span className="w-7 text-center text-[13px] tabular-nums">{value}</span>
      <button
        type="button"
        className="flex h-full w-9 items-center justify-center hover:bg-bone disabled:opacity-30"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Aumentar"
      >
        <PlusIcon width={14} height={14} />
      </button>
    </div>
  )
}
