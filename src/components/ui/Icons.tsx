import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>

function Base({ children, ...props }: P) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={20}
      height={20}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export const BagIcon = (p: P) => (
  <Base {...p}>
    <path d="M6 7h12l1 13H5L6 7z" />
    <path d="M9 7V6a3 3 0 0 1 6 0v1" />
  </Base>
)
export const SearchIcon = (p: P) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Base>
)
export const MenuIcon = (p: P) => (
  <Base {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Base>
)
export const XIcon = (p: P) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
)
export const PlusIcon = (p: P) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
)
export const MinusIcon = (p: P) => (
  <Base {...p}>
    <path d="M5 12h14" />
  </Base>
)
export const TrashIcon = (p: P) => (
  <Base {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </Base>
)
export const TruckIcon = (p: P) => (
  <Base {...p}>
    <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" />
    <circle cx="7" cy="18" r="1.8" />
    <circle cx="17" cy="18" r="1.8" />
  </Base>
)
export const ShieldIcon = (p: P) => (
  <Base {...p}>
    <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3z" />
    <path d="m9 12 2 2 4-4" />
  </Base>
)
export const RefreshIcon = (p: P) => (
  <Base {...p}>
    <path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5" />
  </Base>
)
export const ChevronRightIcon = (p: P) => (
  <Base {...p}>
    <path d="m9 6 6 6-6 6" />
  </Base>
)
export const ChevronLeftIcon = (p: P) => (
  <Base {...p}>
    <path d="m15 6-6 6 6 6" />
  </Base>
)
export const ChevronDownIcon = (p: P) => (
  <Base {...p}>
    <path d="m6 9 6 6 6-6" />
  </Base>
)
export const CheckIcon = (p: P) => (
  <Base {...p}>
    <path d="m5 12 5 5L20 7" />
  </Base>
)
export const UploadIcon = (p: P) => (
  <Base {...p}>
    <path d="M12 16V4M7 9l5-5 5 5M4 16v4h16v-4" />
  </Base>
)
export const GridIcon = (p: P) => (
  <Base {...p}>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </Base>
)
export const BoxIcon = (p: P) => (
  <Base {...p}>
    <path d="M12 3 4 7v10l8 4 8-4V7l-8-4zM4 7l8 4 8-4M12 11v10" />
  </Base>
)
export const TagIcon = (p: P) => (
  <Base {...p}>
    <path d="M3 12V4h8l10 10-8 8L3 12z" />
    <circle cx="7.5" cy="7.5" r="1.5" />
  </Base>
)
export const ReceiptIcon = (p: P) => (
  <Base {...p}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6" />
  </Base>
)
export const SettingsIcon = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </Base>
)
export const LogOutIcon = (p: P) => (
  <Base {...p}>
    <path d="M9 21H5V3h4M16 17l5-5-5-5M21 12H9" />
  </Base>
)
export const EditIcon = (p: P) => (
  <Base {...p}>
    <path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" />
  </Base>
)
export const EyeIcon = (p: P) => (
  <Base {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Base>
)
export const StarIcon = (p: P) => (
  <Base {...p}>
    <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3z" />
  </Base>
)
export const ImageIcon = (p: P) => (
  <Base {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="2" />
    <path d="m21 16-5-5-9 9" />
  </Base>
)
export const ExternalIcon = (p: P) => (
  <Base {...p}>
    <path d="M14 4h6v6M20 4 10 14M18 14v6H4V6h6" />
  </Base>
)
export const MapPinIcon = (p: P) => (
  <Base {...p}>
    <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" />
    <circle cx="12" cy="9" r="2.5" />
  </Base>
)
export const MailIcon = (p: P) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Base>
)
export const PhoneIcon = (p: P) => (
  <Base {...p}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  </Base>
)
export const ClockIcon = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Base>
)

export function WhatsappIcon(p: P) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" aria-hidden="true" {...p}>
      <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zm8.4-18.2A11.8 11.8 0 0 0 1.7 17.9L0 24l6.3-1.7a11.8 11.8 0 0 0 5.7 1.4A11.8 11.8 0 0 0 20.4 3.6z" />
    </svg>
  )
}

export function InstagramIcon(p: P) {
  return (
    <Base {...p}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </Base>
  )
}

export function FacebookIcon(p: P) {
  return (
    <Base {...p}>
      <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h2V3z" />
    </Base>
  )
}

export function TiktokIcon(p: P) {
  return (
    <Base {...p}>
      <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 2.5 2.5 4.5 5 4.5" />
    </Base>
  )
}

export const HeartIcon = (p: P) => (
  <Base {...p}>
    <path d="M12 20s-7.5-4.6-9.2-9.3C1.6 7.4 3.8 4 7.2 4c2 0 3.6 1.1 4.8 2.8C13.2 5.1 14.8 4 16.8 4c3.4 0 5.6 3.4 4.4 6.7C19.5 15.4 12 20 12 20z" />
  </Base>
)
export const ArrowRightIcon = (p: P) => (
  <Base {...p}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </Base>
)
export const ArrowLeftIcon = (p: P) => (
  <Base {...p}>
    <path d="M20 12H4M10 6l-6 6 6 6" />
  </Base>
)
export const SlidersIcon = (p: P) => (
  <Base {...p}>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </Base>
)
export const RulerIcon = (p: P) => (
  <Base {...p}>
    <path d="M3 15 15 3l6 6L9 21l-6-6zM7 11l2 2M10 8l2 2M13 5l2 2" />
  </Base>
)
export const Grid2Icon = (p: P) => (
  <Base {...p}>
    <rect x="4" y="4" width="7" height="16" />
    <rect x="13" y="4" width="7" height="16" />
  </Base>
)
export const Grid4Icon = (p: P) => (
  <Base {...p}>
    <rect x="3" y="4" width="3.5" height="16" />
    <rect x="8.5" y="4" width="3.5" height="16" />
    <rect x="14" y="4" width="3.5" height="16" />
    <rect x="19.5" y="4" width="1.5" height="16" />
  </Base>
)
export const UserIcon = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
  </Base>
)
