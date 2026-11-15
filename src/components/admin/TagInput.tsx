'use client'

import { useState } from 'react'
import { XIcon } from '@/components/ui/Icons'
import { cn } from '@/lib/utils'

export default function TagInput({
  value,
  onChange,
  sugerencias = [],
  placeholder,
}: {
  value: string[]
  onChange: (v: string[]) => void
  sugerencias?: string[]
  placeholder?: string
}) {
  const [text, setText] = useState('')

  const agregar = (raw: string) => {
    const items = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const next = [...value]
    items.forEach((t) => {
      if (!next.some((x) => x.toLowerCase() === t.toLowerCase())) next.push(t)
    })
    onChange(next)
    setText('')
  }

  const restantes = sugerencias.filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()))

  return (
    <div className="space-y-2">
      <div className="flex min-h-[46px] flex-wrap items-center gap-1.5 rounded-xl border border-sand-300 bg-white p-1.5 focus-within:border-ink focus-within:ring-2 focus-within:ring-ink/10">
        {value.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-full bg-ink py-1 pl-3 pr-1.5 text-xs font-medium text-white">
            {v}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== v))} className="rounded-full p-0.5 hover:bg-white/20" aria-label={`Quitar ${v}`}>
              <XIcon width={12} height={12} />
            </button>
          </span>
        ))}
        <input
          value={text}
          onChange={(e) => {
            if (e.target.value.includes(',')) agregar(e.target.value)
            else setText(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (text.trim()) agregar(text)
            } else if (e.key === 'Backspace' && !text && value.length) {
              onChange(value.slice(0, -1))
            }
          }}
          onBlur={() => text.trim() && agregar(text)}
          placeholder={value.length ? '' : placeholder}
          className="min-w-[120px] flex-1 bg-transparent px-2 py-1 text-sm outline-none"
        />
      </div>
      {restantes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {restantes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange([...value, s])}
              className={cn('rounded-full border border-dashed border-sand-300 px-2.5 py-0.5 text-xs text-stone-500 hover:border-ink hover:text-ink')}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
