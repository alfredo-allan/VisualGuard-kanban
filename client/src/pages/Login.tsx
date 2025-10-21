import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

/**
 * Página de login - refatorada para integração total com o novo fluxo global.
 */
export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth(); // ✅ adicionamos isLoading (caso o provider ofereça)
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // ✅ Redireciona automaticamente se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // ✅ Tratamento do sucesso do login
  const handleLoginSuccess = () => {
    toast({
      title: "Login realizado!",
      description: "Redirecionando para o dashboard...",
      variant: "default",
    });
    setTimeout(() => navigate("/dashboard"), 800);
  };

  // ✅ Loader visual durante a checagem de autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-cyan-100 dark:from-gray-900 dark:to-gray-800">
        <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-300 animate-pulse">
          Verificando sessão...
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-cyan-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Cabeçalho visual */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
            KanbanFlow
          </h1>
          <p className="text-muted-foreground">
            Organize seus projetos de forma eficiente
          </p>
        </div>

        {/* Card de Login */}
        <Card className="border-card-border shadow-lg backdrop-blur-sm bg-white/80 dark:bg-gray-800/70">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Entrar na sua conta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LoginForm
              onSuccess={handleLoginSuccess}
              onSwitchToRegister={() => navigate("/register")}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
