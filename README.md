# Project Binary

Um projeto React moderno construído com Vite e TypeScript, hospedado no GitHub Pages.

## Acesso ao Site

O projeto está disponível em: [https://betoshimabs.github.io/project-binary/](https://betoshimabs.github.io/project-binary/)

## Tecnologias

- [React](https://react.dev/) - Biblioteca JavaScript para construção de interfaces
- [TypeScript](https://www.typescriptlang.org/) - JavaScript com tipagem estática
- [Vite](https://vite.dev/) - Build tool moderna e rápida
- [Supabase](https://supabase.com/) - Backend completo (Auth, Database, Storage, Realtime)
- [React Router](https://reactrouter.com/) - Navegação entre páginas
- [GitHub Pages](https://pages.github.com/) - Hospedagem gratuita

## Estrutura do Projeto

```
project-binary/
├── src/
│   ├── components/
│   │   ├── auth/          # Componentes de autenticação
│   │   └── layout/        # Componentes de layout (Navbar, etc)
│   ├── contexts/          # React Contexts (AuthContext)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Configurações (Supabase client)
│   ├── pages/             # Páginas/views (Home, Dashboard, Profile)
│   ├── services/          # Services (auth, database, storage)
│   ├── types/             # TypeScript types e interfaces
│   ├── utils/             # Funções utilitárias
│   ├── assets/            # Imagens, fontes, etc
│   ├── styles/            # CSS global
│   ├── App.tsx            # Componente principal com rotas
│   └── main.tsx           # Ponto de entrada
├── public/                # Arquivos estáticos
├── .env.local             # Variáveis de ambiente (não commitado)
└── SUPABASE.md            # Guia completo de integração Supabase
```

## Desenvolvimento

### Pré-requisitos

- Node.js 20 ou superior
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/betoshimabs/project-binary.git
cd project-binary

# Instale as dependências
npm install

# Configure o Supabase
# 1. Copie o arquivo .env.example para .env.local
cp .env.example .env.local

# 2. Adicione suas credenciais do Supabase no .env.local
# Veja SUPABASE.md para instruções detalhadas
```

### Comandos

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build de produção
npm run preview

# Gerar TypeScript types do Supabase
npm run generate:types
```

## Supabase

Este projeto está integrado com Supabase para:

- 🔐 **Autenticação** - Login/cadastro com email e senha
- 💾 **Database** - PostgreSQL com Row Level Security
- 📁 **Storage** - Upload e gerenciamento de arquivos
- ⚡ **Realtime** - Subscriptions e updates em tempo real

### Configuração Rápida

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie as credenciais (URL e anon key) para `.env.local`
4. Execute `npm run dev`

Para instruções detalhadas, consulte [SUPABASE.md](SUPABASE.md)

## Deploy

O projeto usa GitHub Actions para deploy automático. Cada push na branch `main` dispara automaticamente:

1. Build do projeto
2. Deploy no GitHub Pages

### Primeira vez - Configurar GitHub Pages

1. Vá em **Settings** > **Pages** no repositório
2. Em **Source**, selecione: **GitHub Actions**
3. O site será publicado automaticamente após o próximo push

### Configurar Credenciais do Supabase para Produção

**IMPORTANTE:** Para o site funcionar no GitHub Pages, você precisa adicionar as credenciais do Supabase como GitHub Secrets:

1. Acesse: **Settings** > **Secrets and variables** > **Actions** do repositório
2. Clique em **"New repository secret"**
3. Adicione dois secrets:

   **Secret 1:**
   - Name: `VITE_SUPABASE_URL`
   - Secret: [Cole sua Project URL do Supabase]

   **Secret 2:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Secret: [Cole sua anon/public key do Supabase]

4. Após adicionar os secrets, faça um novo push para disparar o deploy
5. O site será publicado com as credenciais corretas

**Como obter as credenciais:**
- Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
- Selecione seu projeto
- Vá em **Settings** > **API**
- Copie a **Project URL** e a **anon/public key**

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.