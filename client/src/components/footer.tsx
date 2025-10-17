import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <nav className="flex flex-col md:flex-row gap-3 md:gap-6 items-center">
            <Link href="/sobre">
              <a className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-sobre">
                Sobre Nós
              </a>
            </Link>
            <Link href="/servicos">
              <a className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-servicos">
                Serviços
              </a>
            </Link>
            <Link href="/contato">
              <a className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-contato">
                Contato
              </a>
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
