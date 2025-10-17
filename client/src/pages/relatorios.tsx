import { useLocalStorage } from "@/hooks/use-local-storage";
import { type Task } from "@/types/kanban";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { CheckCircle2, Clock, AlertCircle, ListTodo } from "lucide-react";

export default function Relatorios() {
  const [tasks] = useLocalStorage<Task[]>("leap-tech-tasks", []);

  const stats = {
    total: tasks.length,
    backlog: tasks.filter(t => t.status === "backlog").length,
    aTodo: tasks.filter(t => t.status === "a-fazer").length,
    inProgress: tasks.filter(t => t.status === "em-progresso").length,
    done: tasks.filter(t => t.status === "concluido").length,
  };

  const priorityData = [
    { name: "Urgente", value: tasks.filter(t => t.priority === "urgente").length, color: "hsl(var(--destructive))" },
    { name: "Alta", value: tasks.filter(t => t.priority === "alta").length, color: "hsl(var(--primary))" },
    { name: "Média", value: tasks.filter(t => t.priority === "media").length, color: "hsl(var(--chart-3))" },
    { name: "Baixa", value: tasks.filter(t => t.priority === "baixa").length, color: "hsl(var(--muted-foreground))" },
  ].filter(item => item.value > 0);

  const statusData = [
    { name: "Backlog", value: stats.backlog },
    { name: "A Fazer", value: stats.aTodo },
    { name: "Em Progresso", value: stats.inProgress },
    { name: "Concluído", value: stats.done },
  ];

  const completionRate = stats.total > 0 ? ((stats.done / stats.total) * 100).toFixed(1) : "0";

  return (
    <div className="flex-1 w-full">
      <div className="container px-4 md:px-6 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">
            Relatórios
          </h1>
          <p className="text-muted-foreground">
            Visualize métricas e análises do seu fluxo de trabalho
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card data-testid="card-stat-total">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
              <ListTodo className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-tasks">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Todas as tarefas cadastradas
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-in-progress">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
              <Clock className="h-4 w-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-in-progress-tasks">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">
                Tarefas sendo desenvolvidas
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-done">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-done-tasks">{stats.done}</div>
              <p className="text-xs text-muted-foreground">
                Tarefas finalizadas
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-completion-rate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-completion-rate">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Tarefas completas vs total
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card data-testid="card-chart-status">
            <CardHeader>
              <CardTitle>Distribuição por Status</CardTitle>
              <CardDescription>Visualização do fluxo de tarefas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300} data-testid="chart-status-distribution">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card data-testid="card-chart-priority">
            <CardHeader>
              <CardTitle>Distribuição por Prioridade</CardTitle>
              <CardDescription>Análise de prioridades das tarefas</CardDescription>
            </CardHeader>
            <CardContent>
              {priorityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300} data-testid="chart-priority-distribution">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px]">
                  <p className="text-sm text-muted-foreground">Nenhuma tarefa cadastrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
