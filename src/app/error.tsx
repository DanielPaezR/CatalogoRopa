'use client'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl">Algo salió mal</h1>
      <p className="text-stone-500">Ocurrió un error inesperado. Intenta de nuevo en unos segundos.</p>
      <button onClick={reset} className="btn-primary mt-2">
        Reintentar
      </button>
    </div>
  )
}
