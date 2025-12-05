# SOLUCIÓN MÁS FÁCIL - Cambia Node 18 por Node 20
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl openssl-dev
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci

# Etapa 2: Builder
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app

# Copiar desde deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Configurar variable para Prisma (opcional)
ENV PRISMA_QUERY_ENGINE_BINARY=/app/node_modules/.prisma/client/libquery_engine-linux-musl.so.node

# Generar cliente Prisma
RUN npx prisma generate

# Construir la aplicación
RUN npm run build

# Etapa 3: Runner
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./package.json

# Copiar Prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV NODE_ENV production

CMD ["node", "server.js"]