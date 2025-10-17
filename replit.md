# Leap Tech Panel - Painel Kanban

## Visão Geral
Aplicação frontend moderna de gerenciamento de tarefas no estilo Kanban, desenvolvida com React, Vite e Tailwind CSS. O painel implementa metodologias ágeis com identidade visual espacial/neon única da Leap In Technology.

## Identidade Visual

### Paleta de Cores
- **Cor Primária**: Roxo Neon (#A770FF / HSL: 270 85% 70%)
- **Tema Dark**: Fundo preto profundo/azul escuro espacial
- **Tema Light**: Branco suave
- **Gradientes**: Roxo → Magenta (#E570FF) → Ciano (#70E5FF)

### Tipografia
- **Fonte Principal**: Sora (Google Fonts)
- Aplicada em todos os textos, títulos e componentes
- Gradientes aplicados nos títulos principais para efeito neon

### Design System
- Tema Dark/Light Mode com toggle funcional
- Persistência de preferência em localStorage
- Componentes shadcn/ui customizados
- Sistema de cores semânticas adaptativo

## Estrutura do Projeto

### Frontend (client/src/)
```
client/src/
├── components/
│   ├── ui/              # Componentes base shadcn
│   ├── header.tsx       # Cabeçalho fixo com logo e navegação
│   ├── footer.tsx       # Rodapé com links e copyright
│   ├── theme-provider.tsx  # Gerenciamento de tema
│   ├── theme-toggle.tsx    # Toggle dark/light mode
│   ├── kanban-board.tsx    # Container do painel Kanban
│   ├── kanban-column.tsx   # Coluna individual do Kanban
│   └── task-card.tsx       # Card de tarefa
├── pages/
│   ├── home.tsx         # Página principal (Painel Kanban)
│   ├── relatorios.tsx   # Página de relatórios
│   └── configuracoes.tsx # Página de configurações
├── types/
│   └── kanban.ts        # Tipos TypeScript para tarefas
├── App.tsx              # Componente raiz
└── index.css            # Estilos globais e tokens
```

### Dados
- **Armazenamento**: Estado local React (useState)
- **Sem banco de dados**: Dados simulados em memória
- **Backend**: Não implementado (apenas frontend)

## Funcionalidades Implementadas

### Painel Kanban
- 4 colunas do fluxo ágil:
  1. **Backlog**: Tarefas futuras
  2. **A Fazer**: Tarefas planejadas
  3. **Em Progresso**: Tarefas em desenvolvimento
  4. **Concluído**: Tarefas finalizadas

### Cards de Tarefa
- Título da tarefa
- Descrição (opcional)
- Etiqueta de prioridade com ícones:
  - **Urgente** (vermelho, ícone AlertCircle)
  - **Alta** (roxo, ícone ArrowUp)
  - **Média** (outline, ícone Minus)
  - **Baixa** (cinza, ícone Minus)

### Layout Responsivo (Mobile First)
- **Mobile (<768px)**: Colunas empilhadas verticalmente
- **Tablet (≥768px)**: 2 colunas lado a lado
- **Desktop (≥1024px)**: 4 colunas lado a lado

### Navegação
- Header fixo com:
  - Logo "Leap Tech Panel" com gradiente
  - Links: Painel, Relatórios, Configurações
  - Toggle Dark/Light Mode
- Footer com:
  - Links: Sobre Nós, Serviços, Contato
  - Copyright Leap In Technology

## Tecnologias

### Core
- **React 18**: Biblioteca UI
- **TypeScript**: Tipagem estática
- **Vite**: Build tool e dev server
- **Wouter**: Roteamento leve

### Estilização
- **Tailwind CSS**: Framework de utilidades
- **shadcn/ui**: Componentes base customizáveis
- **Lucide React**: Ícones modernos

### Estado
- **React useState**: Gerenciamento local
- **localStorage**: Persistência de tema

## Como Executar

```bash
npm install
npm run dev
```

A aplicação estará disponível em `http://localhost:5000`

## Próximas Funcionalidades (Roadmap)
- Drag-and-drop para mover tarefas entre colunas
- Criação, edição e exclusão de tarefas
- Filtros por prioridade
- Busca de tarefas
- Persistência local (localStorage)
- Página de relatórios com métricas
- Exportação de dados

## Notas Técnicas
- Sem integração com MongoDB ou qualquer banco de dados
- Foco total na experiência visual e interface
- Dados simulados para demonstração
- Transições suaves (300ms) entre temas
- Hover effects e animações sutis nos cards
