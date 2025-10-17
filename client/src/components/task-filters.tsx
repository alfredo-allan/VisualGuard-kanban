import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { type Priority } from "@/types/kanban";

interface TaskFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  priorityFilter: Priority | "all";
  onPriorityChange: (priority: Priority | "all") => void;
  onClearFilters: () => void;
}

export function TaskFilters({
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityChange,
  onClearFilters,
}: TaskFiltersProps) {
  const hasActiveFilters = searchQuery || priorityFilter !== "all";

  return (
    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar tarefas..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
          data-testid="input-search-tasks"
        />
      </div>

      <Select value={priorityFilter} onValueChange={(value) => onPriorityChange(value as Priority | "all")}>
        <SelectTrigger className="w-full md:w-[180px]" data-testid="select-filter-priority">
          <SelectValue placeholder="Filtrar por prioridade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" data-testid="option-priority-all">Todas</SelectItem>
          <SelectItem value="urgente" data-testid="option-priority-urgente">Urgente</SelectItem>
          <SelectItem value="alta" data-testid="option-priority-alta">Alta</SelectItem>
          <SelectItem value="media" data-testid="option-priority-media">Média</SelectItem>
          <SelectItem value="baixa" data-testid="option-priority-baixa">Baixa</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="gap-2"
          data-testid="button-clear-filters"
        >
          <X className="h-4 w-4" />
          Limpar Filtros
        </Button>
      )}
    </div>
  );
}
