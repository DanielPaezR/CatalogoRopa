import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-display text-8xl text-sand-300">404</p>
      <h1 className="text-3xl">No encontramos esta página</h1>
      <p className="text-stone-500">Puede que el producto ya no esté disponible.</p>
      <Link href="/productos" className="btn-primary mt-2">
        Ver catálogo
      </Link>
    </div>
  )
}
