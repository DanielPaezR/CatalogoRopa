'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { redirect, usePathname } from 'next/navigation';

interface AuthContextType {
  isLoading: boolean;
  user: any;
}

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  user: null,
});

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Proteger rutas de admin
  useEffect(() => {
    if (status === 'loading') return;

    const isAdminRoute = pathname?.startsWith('/admin');
    
    if (isAdminRoute) {
      if (status === 'unauthenticated') {
        redirect('/admin/login');
      } else if (session?.user.role !== 'ADMIN') {
        redirect('/');
      }
    }
  }, [status, session, pathname]);

  return (
    <AuthContext.Provider
      value={{
        isLoading: status === 'loading',
        user: session?.user || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProviderInner>{children}</AuthProviderInner>
    </SessionProvider>
  );
}