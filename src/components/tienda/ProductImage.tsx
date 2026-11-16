import { cn } from '@/lib/utils'

/** Imagen de producto con un marcador sobrio cuando no hay foto. */
export default function ProductImage({
  src,
  alt,
  className,
  eager,
}: {
  src?: string | null
  alt: string
  className?: string
  eager?: boolean
}) {
  if (!src) {
    return (
      <div className={cn('flex h-full w-full items-center justify-center bg-bone text-black/[0.07]', className)} aria-label={alt} role="img">
        <svg viewBox="0 0 64 64" className="h-1/4 w-1/4" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
          <path d="M24 12c0 4.4 3.6 8 8 8s8-3.6 8-8l12 6-4 10-6-3v27H22V25l-6 3-4-10z" />
        </svg>
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={cn('h-full w-full object-cover', className)}
    />
  )
}
