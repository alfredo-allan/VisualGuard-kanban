// src/components/header.tsx
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "./theme-toggle";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const navLinks = [
    { href: "/", label: "Painel", testId: "link-painel" },
    { href: "/relatorios", label: "Relatórios", testId: "link-relatorios" },
    { href: "/configuracoes", label: "Configurações", testId: "link-configuracoes" },
  ];

  // Links adicionais para usuários autenticados
  const authNavLinks = [
    { href: "/dashboard", label: "Dashboard", testId: "link-dashboard" },
    { href: "/projects", label: "Projetos", testId: "link-projects" },
  ];

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  const allNavLinks = isAuthenticated
    ? [...navLinks, ...authNavLinks]
    : navLinks;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-8">
          <Link href="/">
            <span
              className="flex items-center space-x-2 cursor-pointer"
              data-testid="link-home"
            >
              <img
                src="../../public/assets/logo-leap.png"
                alt="Logo"
                width={30}
                height={30}
                draggable={false}
                className="cursor-pointer"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
                Leap Tech Painel kanban
              </span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {allNavLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${location === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                    }`}
                  data-testid={link.testId}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Área do usuário autenticado */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Olá, <span className="font-medium text-foreground">{user?.username}</span>
              </span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                data-testid="button-logout"
              >
                Sair
              </Button>
            </div>
          ) : (
            /* Área de login/cadastro */
            <div className="hidden md:flex items-center gap-2">
              <Button
                onClick={() => setIsAuthModalOpen(true)}
                variant="outline"
                size="sm"
                data-testid="button-login"
              >
                Entrar
              </Button>
              <Button
                onClick={() => setIsAuthModalOpen(true)}
                size="sm"
                data-testid="button-register"
              >
                Cadastrar
              </Button>
            </div>
          )}

          <ThemeToggle />

          {/* Menu Mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Menu Mobile Expandido */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container px-4 py-4 flex flex-col gap-3">
            {allNavLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`block py-2 text-sm font-medium transition-colors hover:text-primary cursor-pointer ${location === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                    }`}
                  data-testid={`${link.testId}-mobile`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </span>
              </Link>
            ))}

            {/* Seção de autenticação no mobile */}
            <div className="border-t pt-3 mt-2">
              {isAuthenticated ? (
                <div className="flex flex-col gap-2">
                  <div className="text-xs text-muted-foreground px-2">
                    Logado como: {user?.username}
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    data-testid="button-logout-mobile"
                  >
                    Sair
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    data-testid="button-login-mobile"
                  >
                    Entrar
                  </Button>
                  <Button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    size="sm"
                    className="justify-start"
                    data-testid="button-register-mobile"
                  >
                    Cadastrar
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* Modal de Autenticação */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </header>
  );
}