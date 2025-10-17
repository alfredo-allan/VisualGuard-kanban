import { useState } from "react";
import { KanbanBoard } from "@/components/kanban-board";
import { type Task } from "@/types/kanban";

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Configurar ambiente de desenvolvimento",
    description: "Instalar dependências e configurar ferramentas necessárias para o projeto",
    priority: "alta",
    status: "concluido",
  },
  {
    id: "2",
    title: "Criar design system",
    description: "Definir paleta de cores, tipografia e componentes base",
    priority: "alta",
    status: "concluido",
  },
  {
    id: "3",
    title: "Implementar autenticação de usuários",
    description: "Sistema de login e registro com validação de credenciais",
    priority: "alta",
    status: "em-progresso",
  },
  {
    id: "4",
    title: "Desenvolver dashboard principal",
    description: "Página inicial com métricas e visualizações de dados",
    priority: "media",
    status: "em-progresso",
  },
  {
    id: "5",
    title: "Integrar API de pagamentos",
    description: "Conectar com gateway de pagamento para processar transações",
    priority: "alta",
    status: "a-fazer",
  },
  {
    id: "6",
    title: "Implementar notificações em tempo real",
    description: "Sistema de notificações push para eventos importantes",
    priority: "media",
    status: "a-fazer",
  },
  {
    id: "7",
    title: "Otimizar performance da aplicação",
    description: "Melhorar tempo de carregamento e responsividade",
    priority: "media",
    status: "a-fazer",
  },
  {
    id: "8",
    title: "Criar documentação técnica",
    description: "Documentar APIs, componentes e fluxos da aplicação",
    priority: "baixa",
    status: "backlog",
  },
  {
    id: "9",
    title: "Implementar testes automatizados",
    description: "Configurar testes unitários e de integração",
    priority: "media",
    status: "backlog",
  },
  {
    id: "10",
    title: "Adicionar suporte multi-idioma",
    description: "Implementar internacionalização (i18n) para PT, EN e ES",
    priority: "baixa",
    status: "backlog",
  },
  {
    id: "11",
    title: "Configurar CI/CD pipeline",
    description: "Automatizar deploy e testes com GitHub Actions",
    priority: "media",
    status: "backlog",
  },
  {
    id: "12",
    title: "Implementar modo offline",
    description: "Cache de dados e sincronização quando voltar online",
    priority: "baixa",
    status: "backlog",
  },
];

export default function Home() {
  const [tasks] = useState<Task[]>(initialTasks);

  return (
    <div className="flex-1 w-full">
      <div className="container px-4 md:px-6 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-[#E570FF] to-[#70E5FF] bg-clip-text text-transparent">
            Gerenciamento Ágil de Tarefas
          </h1>
          <p className="text-muted-foreground">
            Organize seu fluxo de trabalho com metodologia Kanban
          </p>
        </div>

        <KanbanBoard tasks={tasks} />
      </div>
    </div>
  );
}
