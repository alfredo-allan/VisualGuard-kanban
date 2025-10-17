import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <nav className="flex flex-col md:flex-row gap-3 md:gap-6 items-center">
            <Link href="/sobre">
              <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-sobre">
                Sobre Nós
              </span>
            </Link>
            <Link href="/servicos">
              <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-servicos">
                Serviços
              </span>
            </Link>
            <Link href="/contato">
              <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-contato">
                Contato
              </span>
            </Link>
          </nav>
          
          <div className="text-sm text-muted-foreground text-center md:text-right">
            © {new Date().getFullYear()} Leap In Technology. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
}
