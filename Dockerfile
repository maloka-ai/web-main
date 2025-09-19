# =========================
# Production image
# =========================
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copia o build pronto do Next.js e os assets
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public
COPY package.json yarn.lock ./

# Expõe porta do Next.js
EXPOSE 3000

# Roda o servidor standalone do Next.js
CMD ["node", "server.js"]
