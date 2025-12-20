import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/**
 * Página de Dashboard — protegida, com sincronização de sessão e gradiente padrão.
 */
export function DashboardPage() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

  // ✅ Redireciona se o usuário não estiver autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const kanbanTerms = [
    {
      id: "scrum",
      title: "Scrum",
      icon: "💪",
      description: "Framework ágil para gestão de projetos complexos",
      details: {
        when: "Início de cada sprint (geralmente 2-4 semanas)",
        duration: "Sprints de 2 a 4 semanas",
        how: "Dividir o projeto em sprints, com planejamento, daily meetings, revisão e retrospectiva",
      },
    },
    {
      id: "daily",
      title: "Daily Meeting",
      icon: "📅",
      description: "Reunião diária de sincronização da equipe",
      details: {
        when: "Todos os dias, no mesmo horário",
        duration: "Máximo 15 minutos",
        how: "Cada membro responde: 1) O que fez ontem? 2) O que fará hoje? 3) Há impedimentos?",
      },
    },
    {
      id: "kanban",
      title: "Kanban",
      icon: "📋",
      description: "Sistema visual de gestão de fluxo de trabalho",
      details: {
        when: "Continuamente, durante todo o projeto",
        duration: "Processo contínuo",
        how: "Visualizar trabalho, limitar trabalho em progresso (WIP), gerenciar fluxo",
      },
    },
    {
      id: "backlog",
      title: "Backlog",
      icon: "📝",
      description: "Lista priorizada de tarefas a serem realizadas",
      details: {
        when: "Atualizado continuamente durante o projeto",
        duration: "Revisões periódicas",
        how: "Coletar, priorizar e refinar requisitos em itens de trabalho",
      },
    },
    {
      id: "sprint",
      title: "Sprint",
      icon: "⚡",
      description:
        "Período de tempo fixo para completar um conjunto de trabalho",
      details: {
        when: "Ciclicamente (ex: a cada 2 semanas)",
        duration: "1 a 4 semanas (mais comum: 2 semanas)",
        how: "Selecionar itens do backlog, comprometer-se com metas, executar e revisar",
      },
    },
    {
      id: "retrospective",
      title: "Retrospectiva",
      icon: "🤝",
      description: "Reunião para reflexão e melhoria contínua",
      details: {
        when: "Ao final de cada sprint",
        duration: "45-90 minutos",
        how: "Discutir: 1) O que foi bem? 2) O que pode melhorar? 3) Plano de ação",
      },
    },
  ];

  // ✅ Loader durante a checagem da sessão
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-cyan-100 dark:from-gray-900 dark:to-gray-800">
        <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-300 animate-pulse">
          Carregando painel...
        </h2>
      </div>
    );
  }

  // ✅ Evita renderização incorreta
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 py-10 px-4 sm:px-6">
      <div className="container mx-auto">
        {/* Cabeçalho do Dashboard */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-base">
              Bem-vindo,{" "}
              <span className="font-semibold text-foreground">
                {user?.full_name || user?.username || "usuário"}!
              </span>{" "}
              ao{" "}
              <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
                Leap Tech Painel Kanban
              </span>
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="mt-4 md:mt-0 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950"
          >
            Sair
          </Button>
        </div>

        {/* Cards de Acesso Rápido */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
                📊 Meus Projetos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Gerencie seus projetos Kanban de forma visual e colaborativa.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
                ✅ Tarefas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Acompanhe o progresso das suas atividades em tempo real.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
                👥 Equipe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Colabore com sua equipe e mantenha todos sincronizados.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Termos Kanban */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent mb-6">
            📚 Glossário Kanban
          </h2>
          <p className="text-muted-foreground mb-8">
            Clique em cada card para entender os principais conceitos do Kanban
            de forma prática e resumida.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {kanbanTerms.map((term) => (
              <Card
                key={term.id}
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600"
                onClick={() => setSelectedTerm(term.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-2xl">{term.icon}</span>
                    <span className="bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
                      {term.title}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {term.description}
                  </p>
                  <div className="flex items-center text-sm text-purple-600 dark:text-purple-400">
                    <span className="font-medium">Clique para detalhes →</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Modal/Pop-up de Detalhes */}
        <Dialog
          open={!!selectedTerm}
          onOpenChange={(open) => !open && setSelectedTerm(null)}
        >
          <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-gray-800 border-purple-200 dark:border-purple-800">
            {selectedTerm && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <span className="text-2xl">
                      {kanbanTerms.find((t) => t.id === selectedTerm)?.icon}
                    </span>
                    <span className="bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
                      {kanbanTerms.find((t) => t.id === selectedTerm)?.title}
                    </span>
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground pt-2">
                    {
                      kanbanTerms.find((t) => t.id === selectedTerm)
                        ?.description
                    }
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 dark:from-purple-500/20 dark:to-cyan-500/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <span className="text-purple-500">⏰</span> Quando
                      realizar?
                    </h4>
                    <p className="text-muted-foreground">
                      {
                        kanbanTerms.find((t) => t.id === selectedTerm)?.details
                          .when
                      }
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 dark:from-purple-500/20 dark:to-cyan-500/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <span className="text-cyan-500">⏱️</span> Quanto tempo
                      deve durar?
                    </h4>
                    <p className="text-muted-foreground">
                      {
                        kanbanTerms.find((t) => t.id === selectedTerm)?.details
                          .duration
                      }
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 dark:from-purple-500/20 dark:to-cyan-500/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <span className="text-purple-500">✅</span> Como fazer?
                    </h4>
                    <p className="text-muted-foreground">
                      {
                        kanbanTerms.find((t) => t.id === selectedTerm)?.details
                          .how
                      }
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setSelectedTerm(null)}
                    className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white border-none"
                  >
                    Fechar
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
