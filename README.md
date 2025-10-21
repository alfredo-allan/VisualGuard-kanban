# Kanban Board - Frontend

Um sistema de gerenciamento de tarefas estilo Kanban desenvolvido com React, TypeScript e Tailwind CSS.

## 📋 Descrição

Este projeto é um frontend completo para um sistema Kanban que permite:

- ✅ Criar e gerenciar projetos
- 📋 Organizar tarefas em colunas (Backlog, A Fazer, Em Progresso, Concluído)
- 🎯 Arrastar e soltar tarefas entre colunas
- 👥 Sistema de autenticação de usuários
- 🔄 Atualizações em tempo real

## 🚀 Tecnologias Utilizadas

- **React 18** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Axios** - Cliente HTTP
- **@dnd-kit** - Drag and Drop
- **Lucide React** - Ícones
- **Vite** - Build tool

## 📦 Estrutura do Projeto

src/
├── components/ # Componentes React
│ ├── ui/ # Componentes de UI reutilizáveis
│ ├── kanban-board.tsx
│ ├── kanban-column.tsx
│ └── task-card.tsx
├── hooks/ # Custom Hooks
│ ├── useAuth.ts
│ ├── useKanban.ts
│ └── useTasks.ts
├── api/ # Configuração da API
│ ├── client.ts
│ ├── auth.ts
│ ├── tasks.ts
│ ├── projects.ts
│ └── columns.ts
├── types/ # Definições de tipos TypeScript
│ ├── api.ts
│ └── kanban.ts
├── pages/ # Páginas da aplicação
│ ├── Login.tsx
│ ├── Dashboard.tsx
│ └── Project.tsx
└── App.tsx # Componente principal

## 🛠️ Instalação e Configuração

### Pré-requisitos

- Node.js 16+
- npm ou yarn
- Backend FastAPI rodando na porta 8000

### Passos para instalação

1. **Clone o repositório**

```bash
git clone <url-do-repositorio>
cd kanban-frontend

npm install
# ou
yarn install

cp .env.example .env

VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Kanban Board

npm run dev
# ou
yarn dev

http://localhost:5173

# No diretório do backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

📱 Funcionalidades
🎯 Autenticação

    Login/Registro - Sistema completo de autenticação JWT

    Proteção de Rotas - Acesso restrito a usuários autenticados

    Refresh Token - Renovação automática de tokens

📊 Gestão de Projetos

    Criar novos projetos

    Listar projetos do usuário

    Navegar entre projetos

🗂️ Quadro Kanban

    Colunas Dinâmicas - Backlog, A Fazer, Em Progresso, Concluído

    Drag & Drop - Arraste tarefas entre colunas

    WIP Limits - Limites de trabalho em progresso

    Posicionamento Automático - Ordenação inteligente de tarefas

📝 Gestão de Tarefas

    CRUD Completo - Criar, ler, atualizar e deletar tarefas

    Prioridades - Baixa, média, alta

    Datas de Vencimento - Controle de prazos

    Atribuição - Designar tarefas a usuários

🔄 API Endpoints
Autenticação

    POST /api/auth/register - Registrar usuário

    POST /api/auth/login - Login

    GET /api/auth/me - Perfil do usuário

Projetos

    GET /api/projects - Listar projetos

    POST /api/projects - Criar projeto

    GET /api/projects/{id} - Detalhes do projeto

Boards

    GET /api/boards/project/{project_id} - Boards do projeto

    GET /api/boards/{id} - Detalhes do board

Colunas

    GET /api/columns/board/{board_id} - Colunas do board

    POST /api/columns - Criar coluna

Tarefas

    GET /api/tasks - Listar tarefas

    POST /api/tasks - Criar tarefa

    PATCH /api/tasks/{id}/move - Mover tarefa

    PUT /api/tasks/{id} - Atualizar tarefa

    DELETE /api/tasks/{id} - Deletar tarefa

🎨 Componentes Principais
KanbanBoard

Componente principal que gerencia todo o quadro Kanban.
tsx

<KanbanBoard boardId="board-uuid" />

KanbanColumn

Representa uma coluna no quadro Kanban.
tsx

<KanbanColumn
  column={column}
  onMoveTask={moveTask}
  isReadOnly={false}
/>

TaskCard

Cartão individual de tarefa.
tsx

<TaskCard
  task={task}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>

🪝 Custom Hooks
useAuth

Gerencia autenticação e estado do usuário.
tsx

const { user, login, logout, isAuthenticated } = useAuth();

useKanban

Gerencia estado e operações do quadro Kanban.
tsx

const {
  columns,
  tasks,
  loading,
  moveTask,
  refresh
} = useKanban(boardId);

📊 Tipos TypeScript
Tarefa
typescript

interface Task {
  id: string;
  title: string;
  description: string;
  position: number;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  column_id: string;
  assignee_id: string | null;
  created_by: string;
}

Coluna
typescript

interface Column {
  id: string;
  title: string;
  position: number;
  wip_limit: number | null;
  board_id: string;
  tasks: Task[];
}

🚀 Scripts Disponíveis

    npm run dev - Servidor de desenvolvimento

    npm run build - Build para produção

    npm run preview - Preview do build

    npm run lint - Análise de código

🔧 Configuração Avançada
Personalização de Cores

Edite tailwind.config.js para personalizar o tema:
js
>
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: 'your-color',
      }
    }
  }
}

Variáveis de Ambiente Adicionais
env

VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=false

🐛 Solução de Problemas
Erro de CORS

Certifique-se que o backend permite requisições do frontend:
python

# No backend FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Problemas de Autenticação

    Verifique se os tokens estão sendo salvos no localStorage

    Confirme que o interceptor do axios está adicionando o header Authorization

Drag and Drop Não Funciona

    Verifique se @dnd-kit está corretamente instalado

    Confirme que as colunas têm IDs únicos

📈 Próximos Passos

    Testes unitários e de integração

    PWA (Progressive Web App)

    Notificações em tempo real

    Modo offline

    Exportação de relatórios

    Integração com calendário

🤝 Contribuição

    Fork o projeto

    Crie uma branch para sua feature (git checkout -b feature/AmazingFeature)

    Commit suas mudanças (git commit -m 'Add some AmazingFeature')

    Push para a branch (git push origin feature/AmazingFeature)

    Abra um Pull Request

📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
👥 Autores

    Alfredo Allan - Desenvolvimento inicial - alfredo-allan

```
