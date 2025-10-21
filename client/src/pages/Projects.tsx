// src/pages/Projects.tsx
import { useState } from "react";
import { useLocation } from "wouter";
import { useKanbanReal } from "@/hooks/useKanbanReal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ArrowRight, Kanban } from "lucide-react";
import { ProjectDialog } from "@/components/ProjectDialog";
import { useToast } from "@/hooks/use-toast";

export default function Projects() {
  const [, navigate] = useLocation();
  const { projects, isLoading, error, createProject, selectProject } = useKanbanReal();
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateProject = async (projectData: { name: string; description?: string }) => {
    try {
      await createProject(projectData);
      toast({
        title: "Projeto criado!",
        description: "Seu projeto foi criado com sucesso.",
        variant: "default",
      });
      setIsProjectDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao criar projeto",
        description: "Não foi possível criar o projeto.",
        variant: "destructive",
      });
    }
  };

  const handleSelectProject = async (projectId: string) => {
    await selectProject(projectId);
    navigate("/"); // Volta para home que agora mostrará o projeto selecionado
  };

  if (isLoading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando projetos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 w-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full">
      <div className="container px-4 md:px-6 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
              Meus Projetos
            </h1>
            <p className="text-muted-foreground">
              Gerencie todos os seus projetos Kanban em um só lugar
            </p>
          </div>

          <Button
            onClick={() => setIsProjectDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Projeto
          </Button>
        </div>

        {projects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Kanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum projeto criado</h3>
              <p className="text-muted-foreground mb-6">
                Comece criando seu primeiro projeto para organizar suas tarefas
              </p>
              <Button onClick={() => setIsProjectDialogOpen(true)}>
                Criar Primeiro Projeto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:shadow-lg transition-shadow group"
                onClick={() => handleSelectProject(project.id)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{project.name}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description || "Sem descrição"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Criado em {new Date(project.created_at!).toLocaleDateString('pt-BR')}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <ProjectDialog
          open={isProjectDialogOpen}
          onOpenChange={setIsProjectDialogOpen}
          onSave={handleCreateProject}
        />
      </div>
    </div>
  );
}