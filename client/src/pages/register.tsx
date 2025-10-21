// src/pages/register.tsx
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { RegisterForm } from "../components/auth/RegisterForm";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export function RegisterPage() {
    const { isAuthenticated } = useAuth();
    const [, navigate] = useLocation(); // ✅ CORRETO - wouter
    const { toast } = useToast();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard");
        }
    }, [isAuthenticated, navigate]);

    const handleRegisterSuccess = () => {
        toast({
            title: "Cadastro realizado!",
            description: "Faça login para continuar.",
            variant: "default",
        });
        navigate("/login");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold gradient-text mb-2">
                        KanbanFlow
                    </h1>
                    <p className="text-muted-foreground">
                        Organize seus projetos de forma eficiente
                    </p>
                </div>

                <Card className="border-card-border shadow-lg">
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="text-2xl font-semibold">
                            Criar sua conta
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RegisterForm
                            onSuccess={handleRegisterSuccess}
                            onSwitchToLogin={() => navigate("/login")}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}