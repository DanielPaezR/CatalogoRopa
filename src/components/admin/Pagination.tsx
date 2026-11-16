import Link from 'next/link'
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/Icons'
import { cn } from '@/lib/utils'

export default function Pagination({
  page,
  pages,
  basePath,
  params,
}: {
  page: number
  pages: number
  basePath: string
  params: Record<string, string | string[] | undefined>
}) {
  if (pages <= 1) return null

  const href = (p: number) => {
    const sp = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      const val = Array.isArray(v) ? v[0] : v
      if (val && k !== 'page') sp.set(k, val)
    })
    if (p > 1) sp.set('page', String(p))
    const qs = sp.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  const nums: number[] = []
  for (let p = Math.max(1, page - 2); p <= Math.min(pages, page + 2); p++) nums.push(p)

  return (
    <nav className="mt-14 flex items-center justify-center gap-1.5" aria-label="Paginación">
      {page > 1 && (
        <Link href={href(page - 1)} className="btn-ghost p-2" aria-label="Página anterior">
          <ChevronLeftIcon />
        </Link>
      )}
      {nums.map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? 'page' : undefined}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full text-sm',
            p === page ? 'bg-ink text-white' : 'hover:bg-sand-100'
          )}
        >
          {p}
        </Link>
      ))}
      {page < pages && (
        <Link href={href(page + 1)} className="btn-ghost p-2" aria-label="Página siguiente">
          <ChevronRightIcon />
        </Link>
      )}
    </nav>
  )
}
