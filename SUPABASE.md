# Guia de Integração Supabase

Este projeto está configurado com Supabase para autenticação, banco de dados, storage e realtime.

## 📋 Índice

- [Configuração Inicial](#configuração-inicial)
- [Autenticação](#autenticação)
- [Banco de Dados](#banco-de-dados)
- [Storage](#storage)
- [Realtime](#realtime)
- [TypeScript Types](#typescript-types)

## 🚀 Configuração Inicial

### 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta ou faça login
3. Crie um novo projeto
4. Aguarde a criação do projeto (leva alguns minutos)

### 2. Configurar variáveis de ambiente

1. No seu projeto Supabase, vá em **Settings** > **API**
2. Copie a **Project URL** e a **anon/public key**
3. Abra o arquivo `.env.local` no projeto
4. Substitua os valores:

```env
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

### 3. Configurar autenticação

1. No Supabase, vá em **Authentication** > **Providers**
2. **Email** já está habilitado por padrão
3. Configure a URL do site em **Authentication** > **URL Configuration**:
   - Site URL: `https://betoshimabs.github.io/project-binary/`
   - Redirect URLs: Adicione as URLs permitidas para redirect após login

## 🔐 Autenticação

### Fluxo implementado

O projeto já possui um sistema completo de autenticação:

- ✅ Login com email/senha
- ✅ Cadastro de usuários
- ✅ Logout
- ✅ Proteção de rotas
- ✅ Context global de autenticação
- ✅ Componentes de UI prontos

### Como usar

```tsx
import { useAuth } from './hooks/useAuth'

function MeuComponente() {
  const { user, signIn, signOut } = useAuth()

  // Verificar se está logado
  if (user) {
    return <p>Olá, {user.email}!</p>
  }

  return <button onClick={() => signIn(email, password)}>Login</button>
}
```

### Adicionar OAuth (Google, GitHub, etc)

1. No Supabase, vá em **Authentication** > **Providers**
2. Habilite o provider desejado (ex: Google)
3. Configure as credenciais OAuth
4. Atualize o componente `LoginPage.tsx`:

```tsx
<Auth
  supabaseClient={supabase}
  providers={['google', 'github']}
  // ... resto das props
/>
```

## 💾 Banco de Dados

### Criar tabelas

Exemplo de tabela de perfis:

```sql
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text not null,
  full_name text,
  avatar_url text
);

-- Habilitar RLS (Row Level Security)
alter table profiles enable row level security;

-- Políticas de acesso
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );
```

### Usar o Database Service

```tsx
import { databaseService } from './services/database.service'

// Buscar todos
const profiles = await databaseService.getAll('profiles')

// Buscar por ID
const profile = await databaseService.getById('profiles', userId)

// Criar
const newProfile = await databaseService.create('profiles', {
  email: 'user@example.com',
  full_name: 'Nome do Usuário'
})

// Atualizar
await databaseService.update('profiles', userId, {
  full_name: 'Novo Nome'
})

// Deletar
await databaseService.delete('profiles', userId)
```

## 📁 Storage

### Criar buckets

1. No Supabase, vá em **Storage**
2. Crie um novo bucket (ex: `avatars`)
3. Configure as políticas de acesso

### Usar o Storage Service

```tsx
import { storageService } from './services/storage.service'

// Upload de arquivo
const file = event.target.files[0]
await storageService.upload('avatars', `${userId}/avatar.png`, file)

// Obter URL pública
const url = storageService.getPublicUrl('avatars', `${userId}/avatar.png`)

// Download
const blob = await storageService.download('avatars', `${userId}/avatar.png`)

// Deletar
await storageService.delete('avatars', [`${userId}/avatar.png`])
```

## ⚡ Realtime

### Configurar subscriptions

```tsx
import { useSupabaseSubscription } from './hooks/useSupabase'

function MeuComponente() {
  useSupabaseSubscription('profiles', (payload) => {
    console.log('Mudança detectada:', payload)
    // Atualizar estado do componente
  })
}
```

### Habilitar Realtime no Supabase

1. No Supabase, vá em **Database** > **Replication**
2. Habilite Realtime para as tabelas desejadas

## 📝 TypeScript Types

### Gerar types automaticamente

1. Instale o Supabase CLI:
```bash
npm install -D supabase
```

2. Configure o projeto:
```bash
npx supabase login
npx supabase link --project-ref seu_project_ref
```

3. Gere os types:
```bash
npm run generate:types
```

Isso irá atualizar o arquivo `src/types/database.types.ts` com os types do seu schema.

### Usar os types

```tsx
import type { Database } from './types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

const profile: Profile = {
  id: '...',
  created_at: '...',
  email: 'user@example.com',
  full_name: 'Nome',
  avatar_url: null
}
```

## 🔒 Row Level Security (RLS)

**IMPORTANTE:** Sempre use RLS para proteger seus dados!

Exemplos de políticas comuns:

```sql
-- Usuários só podem ver seus próprios dados
create policy "Users can view own data"
  on table_name for select
  using ( auth.uid() = user_id );

-- Usuários só podem atualizar seus próprios dados
create policy "Users can update own data"
  on table_name for update
  using ( auth.uid() = user_id );

-- Todos podem ler, mas só donos podem escrever
create policy "Public read access"
  on table_name for select
  using ( true );

create policy "Owner write access"
  on table_name for insert
  with check ( auth.uid() = user_id );
```

## 🐛 Troubleshooting

### Erro: "Missing Supabase environment variables"

- Verifique se o arquivo `.env.local` existe
- Confirme que as variáveis começam com `VITE_`
- Reinicie o servidor de desenvolvimento (`npm run dev`)

### Erro de CORS

- Configure as URLs permitidas em **Authentication** > **URL Configuration**
- Adicione tanto a URL de desenvolvimento quanto a de produção

### Erro de permissão no banco

- Verifique se RLS está configurado corretamente
- Teste as políticas no SQL Editor do Supabase
- Verifique se o usuário está autenticado

## 📚 Recursos

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [Guia de Autenticação](https://supabase.com/docs/guides/auth)
- [Guia de Database](https://supabase.com/docs/guides/database)
- [Guia de Storage](https://supabase.com/docs/guides/storage)
