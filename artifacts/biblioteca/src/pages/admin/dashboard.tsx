import React from "react";
import { useListBooks, useListUsers, useListLoans } from "@workspace/api-client-react";
import { Card } from "@/components/ui/shared";
import { BookOpen, Users, History, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, parseISO, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminDashboard() {
  const { data: books } = useListBooks();
  const { data: users } = useListUsers();
  const { data: loans } = useListLoans();

  const stats = React.useMemo(() => {
    if (!books || !users || !loans) return null;
    const totalBooks = books.reduce((acc, b) => acc + b.quantity, 0);
    const activeLoans = loans.filter(l => l.status === "ativo");
    const overdueLoans = activeLoans.filter(l => isAfter(new Date(), parseISO(l.dueDate)));
    
    return {
      totalBooks,
      totalUsers: users.length,
      activeLoans: activeLoans.length,
      overdueLoans: overdueLoans.length
    };
  }, [books, users, loans]);

  // Mock data for chart based on loans (simplified for visual representation)
  const chartData = [
    { name: "Jan", emprestimos: 12 },
    { name: "Fev", emprestimos: 19 },
    { name: "Mar", emprestimos: 15 },
    { name: "Abr", emprestimos: 22 },
    { name: "Mai", emprestimos: 18 },
    { name: "Jun", emprestimos: Math.max(10, loans?.length || 0) },
  ];

  if (!stats) return <div className="animate-pulse h-full bg-muted/20 rounded-xl" />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Visão Geral</h1>
          <p className="text-muted-foreground mt-1">Bem-vindo ao painel de administração da biblioteca.</p>
        </div>
        <div className="text-sm font-medium px-4 py-2 bg-card border border-border rounded-lg text-foreground">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={BookOpen} title="Acervo Total" value={stats.totalBooks} color="primary" />
        <StatCard icon={Users} title="Alunos Ativos" value={stats.totalUsers} color="accent" />
        <StatCard icon={History} title="Empréstimos Ativos" value={stats.activeLoans} color="secondary" />
        <StatCard icon={AlertCircle} title="Em Atraso" value={stats.overdueLoans} color="destructive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-bold mb-6">Volume de Empréstimos</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: "hsl(var(--muted-foreground))"}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: "hsl(var(--muted-foreground))"}} dx={-10} />
                <Tooltip 
                  cursor={{fill: "hsl(var(--muted))"}}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: '12px' }}
                />
                <Bar dataKey="emprestimos" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border/50 bg-muted/20">
            <h3 className="text-lg font-bold">Empréstimos Recentes</h3>
          </div>
          <div className="p-0 flex-1 overflow-auto">
            {loans?.slice(0, 5).map(loan => (
              <div key={loan.id} className="p-4 border-b border-border/50 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-semibold text-sm truncate max-w-[150px]">{loan.book?.title}</p>
                  <p className="text-xs text-muted-foreground">{loan.user?.name}</p>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full font-medium ${loan.status === 'ativo' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {loan.status}
                </div>
              </div>
            ))}
            {(!loans || loans.length === 0) && (
              <div className="p-8 text-center text-muted-foreground">Nenhum empréstimo recente.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color }: { icon: any, title: string, value: number, color: string }) {
  const colorMap: Record<string, string> = {
    primary: "text-primary bg-primary/10",
    accent: "text-accent bg-accent/10",
    secondary: "text-foreground bg-secondary",
    destructive: "text-destructive bg-destructive/10",
  };

  return (
    <Card className="p-6 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorMap[color]}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-muted-foreground text-sm font-medium">{title}</p>
        <p className="text-3xl font-display font-bold text-foreground">{value}</p>
      </div>
    </Card>
  );
}
