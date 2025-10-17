# Design Guidelines - Leap Tech Panel (Painel Kanban)

## Design Approach
**Reference-Based + Custom Brand Identity**: Inspirado em painéis modernos de metodologias ágeis (Linear, Asana) com identidade visual espacial/neon única da Leap Tech.

## Core Design Elements

### A. Color Palette

**Dark Mode:**
- Primary/Accent: `#A770FF` (Roxo Neon Elétrico)
- Background: Preto profundo ou azul escuro espacial
- Gradients: Roxo → Magenta ou Roxo → Ciano (para títulos principais e botões de destaque)
- Cards: Tons sutis de cinza escuro com bordas levemente iluminadas

**Light Mode:**
- Primary/Accent: `#A770FF` (Roxo Neon mantido para consistência)
- Background: Branco suave ou off-white
- Gradients: Mesmos gradientes roxo-magenta/ciano, ajustados para legibilidade
- Cards: Branco com sombras sutis

### B. Typography
- **Font Family**: Sora (Google Fonts) para todo o projeto
- **Hierarchy**:
  - Títulos principais: Bold, gradiente roxo-magenta aplicado
  - Headers de colunas Kanban: Semibold
  - Cards de tarefa: Regular para corpo, Medium para títulos
  - Footer/navegação: Regular, tamanhos menores

### C. Layout System
**Tailwind Spacing Primitives**: Usar consistentemente p-4, p-6, p-8, gap-4, gap-6, space-y-4, space-y-6

**Structure:**
- **Header (Fixo no topo)**:
  - Logo: "Leap Tech Panel" (texto simulado)
  - Toggle Dark/Light Mode (switch moderno)
  - Menu navegação: Links para "Painel", "Relatórios", "Configurações"
  
- **Main Content (Painel Kanban)**:
  - Grid responsivo de 4 colunas:
    1. Backlog
    2. A Fazer
    3. Em Progresso
    4. Concluído
  
- **Footer**:
  - Links navegação: "Sobre Nós", "Serviços", "Contato"
  - Seção de direitos autorais

### D. Component Library

**Kanban Cards:**
- Cantos arredondados (rounded-lg ou rounded-xl)
- Sombras sutis (shadow-md)
- Design limpo e minimalista
- Conteúdo: Título da tarefa + Descrição breve (opcional) + Etiqueta de Prioridade colorida
- Hover: Elevação sutil

**Buttons:**
- Botão principal: Gradiente roxo-magenta com efeito neon
- Botões secundários: Outline ou ghost style
- Toggle Dark/Light: Switch moderno com ícones sol/lua

**Kanban Columns:**
- Header de coluna destacado com fundo sutil
- Bordas ou divisores visuais entre colunas (desktop)
- Drag-and-drop visual feedback (opcional para futura implementação)

### E. Responsive Behavior (Mobile First)

**Mobile (< 768px):**
- Colunas Kanban empilhadas verticalmente
- Header compacto com menu hamburger (se necessário)
- Cards ocupam largura total

**Tablet/Desktop (≥ 768px):**
- 4 colunas Kanban lado a lado em grid
- Header expandido com navegação horizontal
- Espaçamento generoso entre colunas

## Visual Effects & Interactions

**Gradientes Aplicados:**
- Logo/título principal "Leap Tech Panel"
- Botões de ação primários
- Efeito sutil em headers de colunas (opcional)

**Tema Espacial/Neon:**
- Efeito "buraco negro" sugerido por gradientes profundos
- Brilho neon sutil em elementos interativos no dark mode
- Transições suaves entre dark/light mode

**Animations:**
- Transição suave de tema (300ms ease)
- Hover effects em cards (transform: translateY)
- Toggle switch animado

## Images
**Sem imagens externas** - identidade visual baseada em cores gradientes, tipografia Sora e elementos neon. Foco em UI minimalista com destaque para funcionalidade Kanban.

## Accessibility & UX
- Toggle dark/light mode persistente (localStorage)
- Contraste adequado em ambos os temas
- Etiquetas de prioridade com cores acessíveis e ícones de apoio
- Foco em usabilidade para gerenciamento ágil de tarefas