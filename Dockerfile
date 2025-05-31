FROM node:18-alpine

WORKDIR /app

# Copia todos os arquivos necessários do Yarn PnP
COPY . .

# Define o carregamento do .pnp.cjs no Node
ENV NODE_OPTIONS="--require ./.pnp.cjs"

# Instala Yarn globalmente
RUN corepack enable && corepack prepare yarn@stable --activate

# Instala dependências (modo Plug'n'Play)
RUN yarn install

# Gera a build
RUN yarn build

# Expõe a porta
EXPOSE 3000

# Start do app
CMD ["yarn", "start"]
