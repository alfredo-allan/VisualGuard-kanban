// src/components/auth/AuthModal.tsx
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}

export function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const [currentTab, setCurrentTab] = useState<"login" | "register">(defaultTab);
  const { toast } = useToast();

  const handleLoginSuccess = () => {
    toast({
      title: "Login realizado!",
      description: "Bem-vindo de volta!",
      variant: "default",
    });
    onClose();
  };

  const handleRegisterSuccess = () => {
    toast({
      title: "Conta criada!",
      description: "Sua conta foi criada com sucesso. Faça login para continuar.",
      variant: "default",
    });
    setCurrentTab("login");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-card-border">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold  bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
            Bem-vindo ao KanbanFlow
          </DialogTitle>
          {/* ADICIONAR DIALOG DESCRIPTION PARA ACESSIBILIDADE */}
          <DialogDescription className="sr-only">
            Modal de autenticação para fazer login ou criar uma nova conta
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as "login" | "register")} className="mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-muted p-1 rounded-lg">
            <TabsTrigger
              value="login"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all"
            >
              Entrar
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all"
            >
              Cadastrar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-6">
            <LoginForm
              onSuccess={handleLoginSuccess}
              onSwitchToRegister={() => setCurrentTab("register")}
            />
          </TabsContent>

          <TabsContent value="register" className="mt-6">
            <RegisterForm
              onSuccess={handleRegisterSuccess}
              onSwitchToLogin={() => setCurrentTab("login")}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}