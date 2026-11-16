'use client'

import { useEffect } from 'react'
import { XIcon } from '@/components/ui/Icons'

export const GUIA_SUPERIOR = [
  ['XS', '78–82', '60–64', '84–88'],
  ['S', '82–88', '64–70', '88–94'],
  ['M', '88–94', '70–76', '94–100'],
  ['L', '94–100', '76–82', '100–106'],
  ['XL', '100–108', '82–90', '106–114'],
  ['XXL', '108–116', '90–98', '114–122'],
]

export const GUIA_PANTALON = [
  ['6 / 28', '64–68', '90–94'],
  ['8 / 30', '68–72', '94–98'],
  ['10 / 32', '72–76', '98–102'],
  ['12 / 34', '76–80', '102–106'],
  ['14 / 36', '80–86', '106–110'],
]

export function SizeTables() {
  const th = 'py-3 text-left text-[11px] font-medium uppercase tracking-label text-stone-500'
  const td = 'border-t border-black/10 py-3 text-[14px]'
  return (
    <div className="space-y-10">
      <div>
        <p className="mb-3 text-[12px] font-medium uppercase tracking-label">Camisas, blusas, vestidos y chaquetas (cm)</p>
        <table className="w-full">
          <thead>
            <tr><th className={th}>Talla</th><th className={th}>Pecho</th><th className={th}>Cintura</th><th className={th}>Cadera</th></tr>
          </thead>
          <tbody>
            {GUIA_SUPERIOR.map((r) => (
              <tr key={r[0]}>{r.map((c, i) => <td key={i} className={td}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <p className="mb-3 text-[12px] font-medium uppercase tracking-label">Pantalones y jeans (cm)</p>
        <table className="w-full">
          <thead>
            <tr><th className={th}>Talla</th><th className={th}>Cintura</th><th className={th}>Cadera</th></tr>
          </thead>
          <tbody>
            {GUIA_PANTALON.map((r) => (
              <tr key={r[0]}>{r.map((c, i) => <td key={i} className={td}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-bone p-5 text-[14px] leading-relaxed text-ink-soft">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-label text-ink">Cómo medirte</p>
        <p><strong>Pecho:</strong> por la parte más amplia, con la cinta horizontal.</p>
        <p><strong>Cintura:</strong> por la parte más estrecha, sin apretar.</p>
        <p><strong>Cadera:</strong> por la parte más amplia, con los pies juntos.</p>
        <p className="mt-2">¿Entre dos tallas? Elige la mayor para un ajuste más relajado.</p>
      </div>
    </div>
  )
}

export default function SizeGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[55]" role="dialog" aria-modal="true" aria-label="Guía de tallas">
      <div className="absolute inset-0 animate-fade-in bg-black/40" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-lg animate-slide-in flex-col bg-white">
        <div className="flex h-16 items-center justify-between border-b border-black/10 px-6">
          <p className="text-[12px] uppercase tracking-label">Guía de tallas</p>
          <button onClick={onClose} className="icon-btn -mr-2" aria-label="Cerrar"><XIcon width={20} height={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <SizeTables />
        </div>
      </aside>
    </div>
  )
}
