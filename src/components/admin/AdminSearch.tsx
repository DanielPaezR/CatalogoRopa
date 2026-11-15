'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { SearchIcon } from '@/components/ui/Icons'

export default function AdminSearch({ placeholder }: { placeholder: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const next = new URLSearchParams(params.toString())
        if (q.trim()) next.set('q', q.trim())
        else next.delete('q')
        next.delete('page')
        router.push(`${pathname}?${next.toString()}`)
      }}
      className="relative w-full sm:w-72"
    >
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" width={18} height={18} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} className="input pl-10" aria-label="Buscar" />
    </form>
  )
}
