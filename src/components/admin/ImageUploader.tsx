'use client'

import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { ChevronLeftIcon, ChevronRightIcon, ImageIcon, UploadIcon, XIcon } from '@/components/ui/Icons'
import { cn } from '@/lib/utils'

const MAX_SIDE = 1600

/** Reduce la imagen en el navegador antes de subirla (más rápido y liviano). */
async function comprimir(file: File): Promise<Blob> {
  if (file.type === 'image/gif') return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
    const w = Math.round(bitmap.width * scale)
    const h = Math.round(bitmap.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, w, h)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85))
    if (blob && blob.type === 'image/webp') return blob
    const jpg = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
    return jpg ?? file
  } catch {
    return file
  }
}

export default function ImageUploader({
  value,
  onChange,
  max = 10,
  single = false,
}: {
  value: string[]
  onChange: (v: string[]) => void
  max?: number
  single?: boolean
}) {
  const input = useRef<HTMLInputElement>(null)
  const [subiendo, setSubiendo] = useState(0)
  const [drag, setDrag] = useState(false)
  const [url, setUrl] = useState('')
  const limite = single ? 1 : max

  const subir = async (files: FileList | File[]) => {
    const lista = Array.from(files).filter((f) => f.type.startsWith('image/'))
    const disponibles = single ? 1 : limite - value.length
    if (disponibles <= 0) {
      toast.error(`Máximo ${limite} imágenes`)
      return
    }
    const aSubir = lista.slice(0, disponibles)
    setSubiendo(aSubir.length)
    const nuevas: string[] = []
    for (const file of aSubir) {
      try {
        const blob = await comprimir(file)
        const fd = new FormData()
        fd.append('file', blob, file.name)
        const res = await fetch('/api/imagenes', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        nuevas.push(data.url)
      } catch (e) {
        toast.error(e instanceof Error && e.message ? e.message : `No se pudo subir ${file.name}`)
      }
      setSubiendo((n) => n - 1)
    }
    if (nuevas.length) onChange(single ? nuevas.slice(0, 1) : [...value, ...nuevas])
  }

  const mover = (i: number, d: number) => {
    const j = i + d
    if (j < 0 || j >= value.length) return
    const next = [...value]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  const agregarUrl = () => {
    const u = url.trim()
    if (!/^https?:\/\/.+/.test(u)) {
      toast.error('Escribe una URL válida (https://…)')
      return
    }
    onChange(single ? [u] : [...value, u].slice(0, limite))
    setUrl('')
  }

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className={cn('grid gap-3', single ? 'grid-cols-1 sm:max-w-xs' : 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5')}>
          {value.map((src, i) => (
            <div key={src + i} className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-sand-200 bg-sand-100">
              <img src={src} alt="" className="h-full w-full object-cover" />
              {i === 0 && !single && <span className="chip absolute left-2 top-2 bg-ink text-white">Principal</span>}
              <button
                type="button"
                onClick={() => onChange(value.filter((_, k) => k !== i))}
                className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-ink shadow hover:bg-white"
                aria-label="Quitar imagen"
              >
                <XIcon width={14} height={14} />
              </button>
              {!single && value.length > 1 && (
                <div className="absolute inset-x-2 bottom-2 flex justify-between opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                  <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} className="rounded-full bg-white/90 p-1 shadow disabled:opacity-30" aria-label="Mover a la izquierda">
                    <ChevronLeftIcon width={14} height={14} />
                  </button>
                  <button type="button" onClick={() => mover(i, 1)} disabled={i === value.length - 1} className="rounded-full bg-white/90 p-1 shadow disabled:opacity-30" aria-label="Mover a la derecha">
                    <ChevronRightIcon width={14} height={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {(single || value.length < limite) && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDrag(true)
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDrag(false)
            if (e.dataTransfer.files.length) subir(e.dataTransfer.files)
          }}
          onClick={() => input.current?.click()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition',
            drag ? 'border-ink bg-sand-100' : 'border-sand-300 bg-white hover:border-ink/50'
          )}
        >
          {subiendo > 0 ? (
            <>
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink border-t-transparent" />
              <p className="text-sm text-stone-500">Subiendo {subiendo} {subiendo === 1 ? 'imagen' : 'imágenes'}…</p>
            </>
          ) : (
            <>
              <div className="rounded-full bg-sand-100 p-3 text-ink-soft">
                {value.length ? <UploadIcon /> : <ImageIcon />}
              </div>
              <p className="text-sm font-medium">
                {single ? 'Sube una imagen' : 'Arrastra fotos aquí o haz clic para elegir'}
              </p>
              <p className="text-xs text-stone-400">JPG, PNG o WEBP · se optimizan automáticamente</p>
            </>
          )}
          <input
            ref={input}
            type="file"
            accept="image/*"
            multiple={!single}
            hidden
            onChange={(e) => {
              if (e.target.files?.length) subir(e.target.files)
              e.target.value = ''
            }}
          />
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              agregarUrl()
            }
          }}
          placeholder="…o pega la URL de una imagen"
          className="input"
        />
        <button type="button" onClick={agregarUrl} className="btn-outline shrink-0">
          Agregar
        </button>
      </div>
    </div>
  )
}
