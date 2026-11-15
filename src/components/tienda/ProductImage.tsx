import { cn } from '@/lib/utils'

/** Imagen de producto con marcador elegante cuando no hay foto. */
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
      <div
        className={cn(
          'flex h-full w-full items-center justify-center bg-gradient-to-br from-sand-100 to-sand-200 text-sand-300',
          className
        )}
        aria-label={alt}
        role="img"
      >
        <svg viewBox="0 0 64 64" className="h-1/3 w-1/3" fill="currentColor" aria-hidden="true">
          <path d="M22 14l10 6 10-6 10 8-6 8-4-3v25H22V27l-4 3-6-8z" />
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
