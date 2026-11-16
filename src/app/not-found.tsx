import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow mb-6 text-stone-500">Error 404</p>
      <h1 className="font-display text-6xl font-light sm:text-8xl">Página no encontrada</h1>
      <p className="mt-5 max-w-md text-[15px] text-stone-500">Puede que la prenda ya no esté disponible o que el enlace haya cambiado.</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/productos" className="cta">Ver la colección</Link>
        <Link href="/" className="cta-outline">Ir al inicio</Link>
      </div>
    </div>
  )
}
