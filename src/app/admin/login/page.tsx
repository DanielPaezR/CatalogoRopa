'use client'

import Link from 'next/link'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (status === 'authenticated' && session?.user.role === 'ADMIN') router.replace('/admin')
  }, [status, session, router])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await signIn('credentials', { email, password, redirect: false })
    if (!res || res.error) {
      toast.error('Correo o contraseña incorrectos')
      setLoading(false)
      return
    }
    router.replace('/admin')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink font-display text-2xl text-white">
            A
          </div>
          <h1 className="text-3xl">Panel de administración</h1>
          <p className="mt-1 text-sm text-stone-500">Ingresa para gestionar tu tienda</p>
        </div>
        <form onSubmit={submit} className="card space-y-4 p-6 shadow-sm">
          <div>
            <label htmlFor="email" className="label">Correo</label>
            <input id="email" type="email" required autoComplete="username" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="password" className="label">Contraseña</label>
            <input id="password" type="password" required autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-stone-500 hover:text-ink">← Volver a la tienda</Link>
        </p>
      </div>
    </div>
  )
}
