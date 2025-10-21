import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/useAuth"; // ✅ caminho atualizado (refatorado)
import { AppInitializer } from "@/components/appInitializer"; // ✅ novo componente global

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

// Páginas
import Home from "@/pages/home";
import Relatorios from "@/pages/relatorios";
import Configuracoes from "@/pages/configuracoes";
import { LoginPage } from "@/pages/Login";
import { RegisterPage } from "@/pages/register";
import { DashboardPage } from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import NotFound from "@/pages/not-found";

// -------------------------------
// Rotas
// -------------------------------
function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/relatorios" component={Relatorios} />
      <Route path="/projects" component={Projects} />
      <Route path="/configuracoes" component={Configuracoes} />
      <Route component={NotFound} />
    </Switch>
  );
}

// -------------------------------
// App principal
// -------------------------------
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="dark">
          <AuthProvider>
            <AppInitializer>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  <Router />
                </main>
                <Footer />
              </div>

              {/* ✅ Toaster mantido no escopo global */}
              <Toaster />
            </AppInitializer>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
