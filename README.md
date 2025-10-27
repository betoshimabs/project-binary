# Project Binary

Um projeto React moderno construído com Vite e TypeScript, hospedado no GitHub Pages.

## Acesso ao Site

O projeto está disponível em: [https://betoshimabs.github.io/project-binary/](https://betoshimabs.github.io/project-binary/)

## Tecnologias

- [React](https://react.dev/) - Biblioteca JavaScript para construção de interfaces
- [TypeScript](https://www.typescriptlang.org/) - JavaScript com tipagem estática
- [Vite](https://vite.dev/) - Build tool moderna e rápida
- [GitHub Pages](https://pages.github.com/) - Hospedagem gratuita

## Estrutura do Projeto

```
project-binary/
├── src/
│   ├── components/     # Componentes React reutilizáveis
│   ├── pages/          # Páginas/views principais
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Funções utilitárias
│   ├── types/          # TypeScript types e interfaces
│   ├── services/       # APIs e serviços externos
│   ├── assets/         # Imagens, fontes, etc
│   ├── styles/         # CSS global
│   ├── App.tsx         # Componente principal
│   └── main.tsx        # Ponto de entrada
├── public/             # Arquivos estáticos
└── index.html          # HTML principal
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
```

### Comandos

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build de produção
npm run preview
```

## Deploy

O projeto usa GitHub Actions para deploy automático. Cada push na branch `main` dispara automaticamente:

1. Build do projeto
2. Deploy no GitHub Pages

### Primeira vez - Configurar GitHub Pages

1. Vá em **Settings** > **Pages** no repositório
2. Em **Source**, selecione: **GitHub Actions**
3. O site será publicado automaticamente após o próximo push

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.