import { createHash } from 'crypto'
import { getServerSession, type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import { prisma } from './db'

// Permite desplegar sin configurar NEXTAUTH_URL (p. ej. en Railway): se usa el
// dominio público de Railway o, en su defecto, el host de la petición.
if (!process.env.NEXTAUTH_URL) {
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    process.env.NEXTAUTH_URL = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  } else {
    process.env.AUTH_TRUST_HOST = 'true'
  }
}

function resolveSecret() {
  if (process.env.NEXTAUTH_SECRET) return process.env.NEXTAUTH_SECRET
  // Secreto derivado y estable si no se configuró uno explícito.
  const base = process.env.DATABASE_URL || 'catalogo-ropa'
  return createHash('sha256').update(`nextauth:${base}`).digest('hex')
}

export const authOptions: NextAuthOptions = {
  secret: resolveSecret(),
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: '/admin/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim()
        const password = credentials?.password
        if (!email || !password) return null

        const usuario = await prisma.usuario.findUnique({ where: { email } })
        if (!usuario) return null

        const ok = await bcrypt.compare(password, usuario.password)
        if (!ok) return null

        return { id: usuario.id, email: usuario.email, nombre: usuario.nombre, role: usuario.rol }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.nombre = user.nombre
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.nombre = token.nombre
      }
      return session
    },
  },
}

export async function getAdminSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') return null
  return session
}

/** Para páginas del panel: redirige al login si no hay sesión de administrador. */
export async function requireAdminPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  return session
}

/** Para rutas API del panel: devuelve una respuesta 401 si no hay sesión. */
export async function requireAdminApi() {
  const session = await getAdminSession()
  if (!session) {
    return { session: null, error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) }
  }
  return { session, error: null }
}
