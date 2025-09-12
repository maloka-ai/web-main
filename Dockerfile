#Created By: igson mendes da silva

# Base stage
FROM node:18-alpine AS base

WORKDIR /app

ENV NODE_ENV=production

# Build stage
FROM base AS build
RUN apk add --no-cache build-base python3 g++ make

# Install dependencies
COPY package*.json ./
RUN npm ci --include=dev

# Copy source code and build
COPY . .
RUN npm run build && npm prune --omit=dev

# Run stage
FROM base AS run
# Copy only the built output
COPY --from=build /app/.next/standalone /app
COPY --from=build /app/.next/static /app/.next/static
COPY --from=build /app/public /app/public

CMD ["node", "server.js"]
