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
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition hover:scale-105"
    >
      <WhatsappIcon width={28} height={28} />
    </a>
  )
}
