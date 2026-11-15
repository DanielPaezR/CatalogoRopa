import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatPrice(value: number) {
  return copFormatter.format(value)
}

export function formatDate(date: Date | string, withTime = false) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Bogota',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

export function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function discountPercent(precio: number, anterior?: number | null) {
  if (!anterior || anterior <= precio) return 0
  return Math.round(((anterior - precio) / anterior) * 100)
}

/** Normaliza un número de WhatsApp a formato internacional (asume Colombia si tiene 10 dígitos). */
export function normalizeWhatsapp(numero?: string | null) {
  if (!numero) return null
  const digits = numero.replace(/\D/g, '')
  if (!digits) return null
  if (digits.length === 10 && digits.startsWith('3')) return `57${digits}`
  return digits
}

export function whatsappLink(numero: string | null | undefined, mensaje: string) {
  const n = normalizeWhatsapp(numero)
  if (!n) return null
  return `https://wa.me/${n}?text=${encodeURIComponent(mensaje)}`
}

export function firstImage(imagenes?: string[] | null) {
  return imagenes && imagenes.length > 0 ? imagenes[0] : null
}

/** URL pública del sitio a partir de la petición (respeta proxies como Railway). */
export function baseUrlFromHeaders(headers: Headers) {
  if (process.env.NEXT_PUBLIC_URL) return process.env.NEXT_PUBLIC_URL.replace(/\/$/, '')
  const host = headers.get('x-forwarded-host') ?? headers.get('host') ?? 'localhost:3000'
  const proto = headers.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto.split(',')[0]}://${host.split(',')[0]}`
}
