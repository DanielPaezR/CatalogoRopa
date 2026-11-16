export default function Marquee({ items, dark = false }: { items: string[]; dark?: boolean }) {
  const row = [...items, ...items, ...items]
  return (
    <div className={dark ? 'overflow-hidden bg-ink py-5 text-white' : 'overflow-hidden border-y border-black/10 py-5'} aria-hidden="true">
      <div className="flex w-max animate-marquee whitespace-nowrap">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {row.map((t, i) => (
              <span key={`${k}-${i}`} className="flex items-center font-display text-2xl font-light italic sm:text-3xl">
                <span className="px-8">{t}</span>
                <span className="text-[10px] not-italic opacity-50">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
