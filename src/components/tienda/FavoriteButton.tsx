'use client'

import toast from 'react-hot-toast'
import { useFavorites, type FavItem } from '@/context/FavoritesContext'
import { HeartIcon } from '@/components/ui/Icons'
import { cn } from '@/lib/utils'

export default function FavoriteButton({ item, className, size = 18 }: { item: FavItem; className?: string; size?: number }) {
  const { has, toggle, ready } = useFavorites()
  const active = ready && has(item.id)
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        const added = toggle(item)
        toast(added ? 'Guardado en favoritos' : 'Quitado de favoritos', { icon: added ? '♥' : '♡' })
      }}
      className={cn('inline-flex items-center justify-center transition-transform active:scale-90', className)}
      aria-label={active ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      aria-pressed={active}
    >
      <HeartIcon width={size} height={size} fill={active ? 'currentColor' : 'none'} />
    </button>
  )
}
