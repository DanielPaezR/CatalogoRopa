// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function calculateDiscount(precioOriginal: number, precioActual: number): number {
  if (!precioOriginal || precioOriginal <= precioActual) return 0
  return Math.round(((precioOriginal - precioActual) / precioOriginal) * 100)
}

export function getStockStatus(stock: number, stockMinimo: number = 10): string {
  if (stock === 0) return 'agotado'
  if (stock < stockMinimo * 0.2) return 'critico'
  if (stock < stockMinimo * 0.5) return 'bajo'
  return 'disponible'
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}