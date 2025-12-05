# Etapa 1: Dependencias
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Instalar dependencias (producción + desarrollo para build)
RUN npm ci

# Etapa 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copiar desde deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Generar cliente Prisma
RUN npx prisma generate

# Construir la aplicación
RUN npm run build

# Etapa 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./package.json

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV NODE_ENV production

# Comando de inicio
CMD ["node", "server.js"]