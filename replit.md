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

### Gerenciamento de Tarefas (CRUD Completo)
- **Criar Tarefa**: Modal com formulário validado (título, descrição, prioridade, status)
- **Editar Tarefa**: Atualizar detalhes de tarefas existentes
- **Excluir Tarefa**: Remover tarefas do painel
- **Persistência**: Dados salvos automaticamente em localStorage
- **Sincronização**: Mudanças refletidas em múltiplas abas do navegador

### Drag-and-Drop
- Arrastar tarefas entre colunas usando @dnd-kit
- Feedback visual durante o arrasto (opacidade reduzida)
- Handle de drag (ícone GripVertical) para facilitar interação
- Atualização automática do status ao soltar em nova coluna

### Filtros e Busca
- **Busca por texto**: Filtra tarefas por título ou descrição
- **Filtro por prioridade**: Urgente, Alta, Média, Baixa ou Todas
- **Limpar filtros**: Botão para resetar busca e filtros
- Resultados filtrados em tempo real

### Cards de Tarefa
- Título da tarefa
- Descrição (opcional)
- Handle de drag visual
- Etiqueta de prioridade com ícones:
  - **Urgente** (vermelho, ícone AlertCircle)
  - **Alta** (roxo, ícone ArrowUp)
  - **Média** (outline, ícone Minus)
  - **Baixa** (cinza, ícone Minus)
- Botões de editar e excluir

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

### Página de Relatórios
- **KPIs em Tempo Real**:
  - Total de tarefas cadastradas
  - Tarefas em progresso
  - Tarefas concluídas
  - Taxa de conclusão percentual
- **Gráfico de Barras**: Distribuição de tarefas por status (Backlog, A Fazer, Em Progresso, Concluído)
- **Gráfico de Pizza**: Análise de prioridades das tarefas
- Responsivo e adaptado ao tema dark/light
- Todos os dados testáveis com data-testid

## Como Executar

```bash
npm install
npm run dev
```

A aplicação estará disponível em `http://localhost:5000`

## Próximas Funcionalidades (Roadmap)
- Exportação de dados em CSV/JSON
- Notificações de prazos
- Tags personalizadas
- Modo Kanban colaborativo

## Notas Técnicas
- Sem integração com MongoDB ou qualquer banco de dados
- Foco total na experiência visual e interface
- Dados simulados para demonstração
- Transições suaves (300ms) entre temas
- Hover effects e animações sutis nos cards
