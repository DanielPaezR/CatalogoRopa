'use client'

import { useState } from 'react'
import { MinusIcon, PlusIcon } from '@/components/ui/Icons'

export default function Accordion({ items }: { items: { title: string; content: React.ReactNode; open?: boolean }[] }) {
  const [open, setOpen] = useState<number | null>(items.findIndex((i) => i.open))
  return (
    <div className="border-t border-black/10">
      {items.map((it, i) => (
        <div key={it.title} className="border-b border-black/10">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between py-5 text-left text-[12px] uppercase tracking-label"
            aria-expanded={open === i}
          >
            {it.title}
            {open === i ? <MinusIcon width={16} height={16} /> : <PlusIcon width={16} height={16} />}
          </button>
          <div className={open === i ? 'pb-6 text-[14px] leading-relaxed text-ink-soft' : 'hidden'}>{it.content}</div>
        </div>
      ))}
    </div>
  )
}
