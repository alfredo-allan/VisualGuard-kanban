import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Página de Dashboard — protegida, com sincronização de sessão e gradiente padrão.
 */
export function DashboardPage() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 py-10 px-6">
      <div className="container mx-auto">
        {/* Cabeçalho do Dashboard */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-base">
              Bem-vindo,{" "}
              <span className="font-semibold text-foreground">
                {user?.full_name || user?.username || "usuário"}!
              </span>
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="mt-4 md:mt-0">
            Sair
          </Button>
        </div>

        {/* Cards de Acesso Rápido */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-xl transition-shadow duration-300">
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

          <Card className="hover:shadow-xl transition-shadow duration-300">
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

          <Card className="hover:shadow-xl transition-shadow duration-300">
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
      </div>
    </div>
  );
}
