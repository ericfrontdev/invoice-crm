# ========== STAGE 1: Dependencies ==========
  FROM node:20-alpine AS deps

  # Installer les dépendances système nécessaires pour Prisma
  RUN apk add --no-cache libc6-compat openssl

  WORKDIR /app

  # Copier les fichiers de dépendances
  COPY package.json package-lock.json* ./
  COPY prisma ./prisma

  # Installer toutes les dépendances
  RUN npm install

  # ========== STAGE 2: Builder ==========
  FROM node:20-alpine AS builder

  RUN apk add --no-cache libc6-compat openssl

  WORKDIR /app

  # Copier les node_modules du stage précédent
  COPY --from=deps /app/node_modules ./node_modules

  # Copier tout le code source
  COPY . .

  # Générer le client Prisma
  RUN npx prisma generate

  # Build Next.js en mode production
  RUN npm run build

  # ========== STAGE 3: Runner (Image finale) ==========
  FROM node:20-alpine AS runner

  RUN apk add --no-cache libc6-compat openssl wget

  WORKDIR /app

  # Créer un utilisateur non-root pour la sécurité
  RUN addgroup --system --gid 1001 nodejs
  RUN adduser --system --uid 1001 nextjs

  # Copier les fichiers nécessaires depuis le builder
  COPY --from=builder /app/public ./public

  # Copier le build Next.js standalone
  COPY --from=builder /app/.next/standalone ./
  COPY --from=builder /app/.next/static ./.next/static

  # Copier les fichiers Prisma (important pour les migrations)
  COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
  COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
  COPY --from=builder /app/prisma ./prisma

  # Changer le propriétaire des fichiers
  RUN chown -R nextjs:nodejs /app

  # Utiliser l'utilisateur non-root
  USER nextjs

  # Exposer le port 3000
  EXPOSE 3000

  ENV PORT 3000
  ENV HOSTNAME "0.0.0.0"
  ENV NODE_ENV production

  # Démarrer l'application
  CMD ["node", "server.js"]
