'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from '@/context/CartContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3000,
            style: { background: '#1c1917', color: '#fff', borderRadius: '999px', fontSize: '14px' },
          }}
        />
      </CartProvider>
    </SessionProvider>
  )
}
