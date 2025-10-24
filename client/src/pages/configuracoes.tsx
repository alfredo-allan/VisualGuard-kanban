import { useState } from "react";
import { useKanbanReal } from "@/hooks/useKanbanReal";
import { Edit2, Trash2, Lock, Folder, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Configuracoes() {
  const { projects, deleteProject, currentProject } = useKanbanReal();
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteProject = async (projectId: string) => {
    setIsDeleting(true);
    try {
      await deleteProject(projectId);
      setProjectToDelete(null);
    } catch (error) {
      // Erro já tratado no hook
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 w-full">
      <div className="container px-4 md:px-6 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">
            Configurações
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus projetos e preferências
          </p>
        </div>

        {/* Seção de Projetos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Meus Projetos
            </CardTitle>
            <CardDescription>
              Gerencie todos os seus projetos. A exclusão remove permanentemente o projeto e todos os dados associados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum projeto encontrado</p>
              </div>
            ) : (
              projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isCurrent={currentProject?.id === project.id}
                  onDelete={() => setProjectToDelete(project.id)}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Modal de Confirmação de Exclusão */}
        <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Excluir Projeto
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o projeto
                <strong> {projects.find(p => p.id === projectToDelete)?.name}</strong>,
                incluindo todos os boards, colunas e tarefas associados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => projectToDelete && handleDeleteProject(projectToDelete)}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Excluindo..." : "Excluir Projeto"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// Componente de Card do Projeto
interface ProjectCardProps {
  project: any;
  isCurrent: boolean;
  onDelete: () => void;
}

function ProjectCard({ project, isCurrent, onDelete }: ProjectCardProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3">
        <Folder className="h-4 w-4 text-muted-foreground" />
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{project.name}</h3>
            {isCurrent && (
              <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                Atual
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {project.description || "Sem descrição"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Criado em: {new Date(project.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled
        >
          <Edit2 className="h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}