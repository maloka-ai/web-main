# 💻 Maloka'ai

**Maloka'ai** é uma plataforma de inteligência de dados voltada para empresas do setor varejista. Nosso objetivo é fornecer **insights estratégicos**, **dashboards inteligentes** e **relatórios personalizáveis**, ajudando negócios a tomarem decisões baseadas em dados com agilidade e autonomia.

---

## 🚀 Tecnologias

- [Next.js](https://nextjs.org/) — React Framework fullstack
- [Yarn 4 (Plug'n'Play)](https://yarnpkg.com/) — Gerenciador de pacotes rápido e modular
- [CSS Modules](https://nextjs.org/docs/app/building-your-application/styling/css-modules)
- [ESLint + Prettier](https://eslint.org/) — Padronização de código
- [Storybook](https://storybook.js.org/) — Documentação e desenvolvimento de componentes UI

---

## ⚙️ Setup do Projeto

### 1. Clonar o repositório

```bash
git clone git@github.com:maloka-ai/web-main.git
cd web-main
```

### 2. Instalar o Yarn 4 (se ainda não tiver)

```bash
corepack enable
corepack prepare yarn@stable --activate
```

### 3. Instalar as dependências

```bash
yarn install
```

> ⚠️ Esse projeto utiliza **Plug'n'Play (PnP)**, não há `node_modules`.

---

## 🧪 Configurar VS Code (Yarn PnP + TS + ESLint)

### 1. Instalar os SDKs para o VS Code

```bash
yarn dlx @yarnpkg/sdks vscode
```

### 2. Configurar o VS Code para usar TypeScript local

Abra a paleta de comandos (Ctrl+Shift+P) e selecione:

```
> Select TypeScript Version
> Use Workspace Version
```

### 3. Recomendado: `.vscode/settings.json`

```json
{
  "typescript.tsdk": ".yarn/sdks/typescript/lib",
  "eslint.nodePath": ".yarn/sdks",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

---

## 📁 Estrutura do Projeto

```bash
.
└──
  ├── app/                  # App Router do Next.js
  ├── components/           # Componentes reutilizáveis
  ├── styles/               # CSS Modules
  ├── public/               # Arquivos estáticos
├── .env.local            # Variáveis de ambiente (não versionado)
├── package.json
└── README.md
```

---

## 📦 Ambiente `.env.local`

Crie o arquivo `.env.local` com as seguintes variáveis (exemplo):

```bash
NEXT_PUBLIC_API_URL=https://api.malokaai.com
```

---

## 🧪 Scripts

### Desenvolver localmente

```bash
yarn dev
```

### Lint + Prettier

```bash
yarn lint
```

### Storybook

```bash
yarn storybook
```

### Build do Storybook

```bash
yarn build-storybook
```

---


## 🤝 Contribuindo

1. Crie um fork
2. Crie uma branch com sua feature: `git checkout -b minha-feature`
3. Commit suas alterações
4. Abra um Pull Request

---

## 📄 Licença

Copyright (c) 2024 Maloka'ai

Todos os direitos reservados.

Este software é fornecido exclusivamente para uso interno por seus licenciados autorizados. É proibida a cópia, redistribuição, modificação, engenharia reversa ou qualquer outro uso sem permissão expressa por escrito da Maloka - Desenvolvimento de Software LTDA.

Este software não é software livre ou de código aberto.

---