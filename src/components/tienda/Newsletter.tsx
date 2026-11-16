'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { ArrowRightIcon } from '@/components/ui/Icons'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'ok'>('idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEstado('enviando')
    const res = await fetch('/api/suscribir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).catch(() => null)
    if (!res?.ok) {
      const data = await res?.json().catch(() => ({}))
      toast.error(data?.error ?? 'No pudimos registrar tu correo')
      setEstado('idle')
      return
    }
    setEstado('ok')
  }

  if (estado === 'ok') {
    return <p className="font-display text-2xl font-light italic">Gracias. Pronto tendrás noticias nuestras.</p>
  }

  return (
    <form onSubmit={submit} className="flex items-center border-b border-white/40 focus-within:border-white">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Tu correo electrónico"
        aria-label="Correo electrónico"
        className="h-12 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-white/50"
      />
      <button type="submit" disabled={estado === 'enviando'} className="flex h-12 items-center gap-2 text-[12px] uppercase tracking-label hover:opacity-70">
        Suscribirme <ArrowRightIcon width={16} height={16} />
      </button>
    </form>
  )
}
