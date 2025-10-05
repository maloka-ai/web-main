FROM node:20-alpine AS base

##################
# Build Stage
##################
FROM base AS builder

RUN corepack enable && apk add --no-cache libc6-compat

WORKDIR /app

# Argumento para arquivo de ambiente (.env.production, .env.test, etc)
ARG ENV_FILE=.env.production
COPY $ENV_FILE .env

# Instalar dependências do gerenciador correto
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN echo 'nodeLinker: "node-modules"' > ./.yarnrc.yml
RUN \
  if [ -f yarn.lock ]; then yarn install --immutable; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Copiando código-fonte e configs
COPY ./src ./src
COPY ./next.config.ts ./tsconfig.json ./
COPY eslint.config.mjs ./

# Build do projeto
RUN \
  if [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

#################
# Production Stage
#################
FROM base AS runner

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY ./public ./public

# Copia artefatos buildados e estáticos otimizados
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
