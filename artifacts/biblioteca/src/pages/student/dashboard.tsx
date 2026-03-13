import React from "react";
import { useGetMyLoans } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { Card, Button, Badge } from "@/components/ui/shared";
import { BookOpen, CalendarClock, AlertCircle } from "lucide-react";
import { format, parseISO, isAfter, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "wouter";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: myLoans, isLoading } = useGetMyLoans();

  const activeLoans = myLoans?.filter(l => l.status === 'ativo') || [];
  const overdueLoans = activeLoans.filter(l => isAfter(new Date(), parseISO(l.dueDate)));

  if (isLoading) return <div className="animate-pulse h-full bg-muted/20 rounded-xl" />;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-primary to-accent p-8 rounded-3xl text-primary-foreground shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-display font-bold">Olá, {user?.name?.split(' ')[0]}!</h1>
          <p className="mt-2 text-primary-foreground/80 max-w-lg">Bem-vindo(a) à Biblioteca Athena. Descubra novos mundos ou acompanhe suas leituras atuais.</p>
          <div className="mt-6 flex gap-3">
            <Link href="/student/catalog">
              <Button className="bg-white text-primary hover:bg-white/90">Explorar Catálogo</Button>
            </Link>
          </div>
        </div>
        <BookOpen className="absolute -right-4 -bottom-4 w-48 h-48 text-white/10 rotate-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold">Lendo Atualmente</h2>
          </div>
          
          <div className="space-y-4">
            {activeLoans.map(loan => {
              const isOverdue = isAfter(new Date(), parseISO(loan.dueDate));
              const daysLeft = differenceInDays(parseISO(loan.dueDate), new Date());
              
              return (
                <div key={loan.id} className="p-4 rounded-xl border border-border/50 bg-muted/30 flex justify-between items-center group hover:bg-muted/50 transition-colors">
                  <div>
                    <h3 className="font-semibold text-foreground line-clamp-1">{loan.book?.title}</h3>
                    <p className="text-sm text-muted-foreground">{loan.book?.author}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    {isOverdue ? (
                      <Badge variant="destructive" className="animate-pulse">Atrasado</Badge>
                    ) : (
                      <div className="text-xs font-medium text-muted-foreground">
                        Faltam {daysLeft} dias
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {activeLoans.length === 0 && (
              <div className="text-center p-8 text-muted-foreground border border-dashed rounded-xl">
                Você não possui livros emprestados no momento.
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 bg-accent/5 border-accent/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold">Avisos</h2>
          </div>
          
          <div className="space-y-3 mt-6">
            {overdueLoans.length > 0 ? (
              <div className="p-4 rounded-xl bg-destructive/10 text-destructive font-medium flex items-start gap-3 border border-destructive/20">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <p>Você tem {overdueLoans.length} {overdueLoans.length > 1 ? 'livros atrasados' : 'livro atrasado'}. Por favor, compareça à biblioteca para devolução.</p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-background/50 border border-border text-muted-foreground flex items-center gap-3">
                <CalendarClock className="w-5 h-5" />
                <p>Sua situação está regular! Nenhuma pendência encontrada.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
