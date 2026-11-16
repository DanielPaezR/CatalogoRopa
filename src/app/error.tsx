'use client'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-5xl font-light sm:text-6xl">Algo salió mal</h1>
      <p className="mt-4 max-w-md text-[15px] text-stone-500">Ocurrió un error inesperado. Intenta de nuevo en unos segundos.</p>
      <button onClick={reset} className="cta mt-10">Reintentar</button>
    </div>
  )
}
