import { WhatsappIcon } from '@/components/ui/Icons'
import { whatsappLink } from '@/lib/utils'

export default function WhatsappFloat({ numero, tienda }: { numero: string | null; tienda: string }) {
  const href = whatsappLink(numero, `¡Hola ${tienda}! Quiero más información.`)
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="group fixed bottom-5 right-5 z-30 flex h-12 items-center gap-2 rounded-full bg-[#25D366] pl-3.5 pr-3.5 text-white shadow-lg shadow-black/15 transition-all hover:pr-5"
    >
      <WhatsappIcon width={22} height={22} />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-[12px] font-medium uppercase tracking-label transition-all duration-300 group-hover:max-w-[120px]">
        Escríbenos
      </span>
    </a>
  )
}
