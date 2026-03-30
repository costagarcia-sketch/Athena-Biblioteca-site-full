import React from "react";
import { useListBooks, useListLoans } from "@workspace/api-client-react";
import { Card } from "@/components/ui/shared";
import { BookOpen, History, AlertCircle, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, parseISO, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/lib/auth-context";

export default function PedagogoDashboard() {
  const { user } = useAuth();
  const { data: books } = useListBooks();
  const { data: loans } = useListLoans();

  const stats = React.useMemo(() => {
    if (!books || !loans) return null;
    const totalBooks = books.reduce((acc, b) => acc + b.quantity, 0);
    const availableBooks = books.reduce((acc, b) => acc + b.available, 0);
    const activeLoans = loans.filter(l => l.status === "ativo");
    const overdueLoans = activeLoans.filter(l => isAfter(new Date(), parseISO(l.dueDate)));
    const returnedLoans = loans.filter(l => l.status === "devolvido");

    return {
      totalBooks,
      availableBooks,
      activeLoans: activeLoans.length,
      overdueLoans: overdueLoans.length,
      returnedLoans: returnedLoans.length,
    };
  }, [books, loans]);

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
          <h1 className="text-3xl font-display font-bold text-foreground">Painel do Pedagogo</h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo, <span className="font-semibold text-foreground">{user?.name}</span>. Gerencie empréstimos e o acervo da biblioteca.
          </p>
        </div>
        <div className="text-sm font-medium px-4 py-2 bg-card border border-border rounded-lg text-foreground">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={BookOpen} title="Acervo Total" value={stats.totalBooks} sub={`${stats.availableBooks} disponíveis`} color="primary" />
        <StatCard icon={History} title="Empréstimos Ativos" value={stats.activeLoans} color="accent" />
        <StatCard icon={AlertCircle} title="Em Atraso" value={stats.overdueLoans} color="destructive" />
        <StatCard icon={CheckCircle} title="Devolvidos" value={stats.returnedLoans} color="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-bold mb-6">Volume de Empréstimos</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} dx={-10} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "12px" }}
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
            {loans?.slice(0, 6).map(loan => (
              <div key={loan.id} className="p-4 border-b border-border/50 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-semibold text-sm truncate max-w-[150px]">{loan.book?.title}</p>
                  <p className="text-xs text-muted-foreground">{loan.user?.name}</p>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                  loan.status === "ativo" ? "bg-primary/10 text-primary" :
                  loan.status === "reservado" ? "bg-amber-500/10 text-amber-600" :
                  "bg-muted text-muted-foreground"
                }`}>
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

function StatCard({ icon: Icon, title, value, sub, color }: { icon: any; title: string; value: number; sub?: string; color: string }) {
  const colorMap: Record<string, string> = {
    primary: "text-primary bg-primary/10",
    accent: "text-accent bg-accent/10",
    destructive: "text-destructive bg-destructive/10",
    success: "text-emerald-600 bg-emerald-500/10",
  };

  return (
    <Card className="p-6 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${colorMap[color] || colorMap.primary}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-muted-foreground text-sm font-medium">{title}</p>
        <p className="text-3xl font-display font-bold text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </Card>
  );
}
