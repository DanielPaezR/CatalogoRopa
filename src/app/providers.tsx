'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from '@/context/CartContext'
import { FavoritesProvider } from '@/context/FavoritesContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <FavoritesProvider>{children}</FavoritesProvider>
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3000,
            style: { background: '#1c1917', color: '#fff', borderRadius: '0', fontSize: '13px', letterSpacing: '0.02em' },
          }}
        />
      </CartProvider>
    </SessionProvider>
  )
}
