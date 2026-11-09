# syntax=docker/dockerfile:1
#
# Image du backend SouverainRecrut.
# Contexte de build : le dossier backend/
#   docker build -f integration-continue/Dockerfile -t <compte>/souverainrecrut-backend:<tag> backend
#
# Tag de base fixé (pas de "latest") pour un build reproductible.

# ---------- Étape 1 : build (TypeScript + client Prisma) ----------
FROM node:22.16.0-alpine3.22 AS builder
WORKDIR /app

# OpenSSL requis par les moteurs Prisma sur Alpine
RUN apk add --no-cache openssl

# Dépendances d'abord : exploite le cache des couches
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
RUN npx prisma generate && npm run build

# ---------- Étape 2 : dépendances de production ----------
FROM node:22.16.0-alpine3.22 AS deps
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---------- Étape 3 : exécution ----------
FROM node:22.16.0-alpine3.22 AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=4000

# OpenSSL (Prisma) + mise à jour des paquets Alpine (correctifs de sécurité)
RUN apk add --no-cache openssl && apk upgrade --no-cache \
    # npm/yarn inutiles à l'exécution : réduit la surface d'attaque (CVE node-tar embarqué)
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx \
              /opt/yarn* /usr/local/bin/yarn /usr/local/bin/yarnpkg

COPY --from=deps    --chown=node:node /app/node_modules ./node_modules
# Client Prisma généré lors du build (spécifique au schéma)
COPY --from=builder --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --from=builder --chown=node:node /app/package.json ./package.json

# Utilisateur non-root (fourni par l'image officielle node)
USER node

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4000)+'/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server.js"]
