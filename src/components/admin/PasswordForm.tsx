'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

export default function PasswordForm({ email }: { email: string }) {
  const [form, setForm] = useState({ email, actual: '', nueva: '', confirmar: '' })
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.nueva !== form.confirmar) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    setBusy(true)
    const res = await fetch('/api/admin/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, actual: form.actual, nueva: form.nueva }),
    })
    const data = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) {
      toast.error(data.error ?? 'No se pudo cambiar')
      return
    }
    toast.success('Acceso actualizado')
    setForm({ ...form, actual: '', nueva: '', confirmar: '' })
  }

  return (
    <form onSubmit={submit} className="card grid gap-4 p-6 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <h2 className="font-sans text-base font-semibold">Acceso al panel</h2>
        <p className="text-xs text-stone-500">Cambia el correo de ingreso y la contraseña.</p>
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="pw-email">Correo de ingreso</label>
        <input id="pw-email" type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="pw-actual">Contraseña actual *</label>
        <input id="pw-actual" type="password" required autoComplete="current-password" className="input" value={form.actual} onChange={(e) => setForm({ ...form, actual: e.target.value })} />
      </div>
      <div>
        <label className="label" htmlFor="pw-nueva">Nueva contraseña *</label>
        <input id="pw-nueva" type="password" required minLength={8} autoComplete="new-password" className="input" value={form.nueva} onChange={(e) => setForm({ ...form, nueva: e.target.value })} />
      </div>
      <div>
        <label className="label" htmlFor="pw-confirmar">Confirmar *</label>
        <input id="pw-confirmar" type="password" required minLength={8} autoComplete="new-password" className="input" value={form.confirmar} onChange={(e) => setForm({ ...form, confirmar: e.target.value })} />
      </div>
      <div className="sm:col-span-2">
        <button type="submit" disabled={busy} className="btn-outline">
          {busy ? 'Guardando…' : 'Actualizar acceso'}
        </button>
      </div>
    </form>
  )
}
