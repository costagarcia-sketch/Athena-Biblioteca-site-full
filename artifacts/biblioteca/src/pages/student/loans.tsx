import React from "react";
import { useGetMyLoans } from "@workspace/api-client-react";
import { Card, Badge } from "@/components/ui/shared";
import { History, BookMarked, CalendarCheck, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { format, parseISO, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

function StatusBadge({ status, dueDate }: { status: string; dueDate: string }) {
  if (status === "devolvido") {
    return <Badge variant="outline" className="border-green-500/50 text-green-600 bg-green-500/5 gap-1"><CheckCircle className="w-3 h-3" /> Devolvido</Badge>;
  }
  if (status === "reservado") {
    return <Badge variant="outline" className="border-primary/40 text-primary bg-primary/5 gap-1"><CalendarCheck className="w-3 h-3" /> Agendado</Badge>;
  }
  if (status === "ativo") {
    const overdue = isAfter(new Date(), parseISO(dueDate));
    if (overdue) return <Badge variant="destructive" className="gap-1 animate-pulse"><AlertCircle className="w-3 h-3" /> Atrasado</Badge>;
    return <Badge variant="default" className="gap-1"><Clock className="w-3 h-3" /> Ativo</Badge>;
  }
  return <Badge variant="outline">{status}</Badge>;
}

export default function StudentLoans() {
  const { data: myLoans, isLoading } = useGetMyLoans();

  const reservedLoans = myLoans?.filter(l => l.status === "reservado") || [];
  const activeLoans = myLoans?.filter(l => l.status === "ativo") || [];
  const returnedLoans = myLoans?.filter(l => l.status === "devolvido") || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Meus Empréstimos</h1>
          <p className="text-muted-foreground mt-1">Histórico completo de suas leituras.</p>
        </div>
        <div className="h-64 flex items-center justify-center text-muted-foreground">Carregando histórico...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Meus Empréstimos</h1>
        <p className="text-muted-foreground mt-1">Acompanhe suas reservas e leituras ativas.</p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 flex flex-col items-center text-center gap-1">
          <CalendarCheck className="w-6 h-6 text-primary mb-1" />
          <span className="text-2xl font-bold text-foreground">{reservedLoans.length}</span>
          <span className="text-xs text-muted-foreground">Agendado{reservedLoans.length !== 1 ? 's' : ''}</span>
        </Card>
        <Card className="p-4 flex flex-col items-center text-center gap-1">
          <BookMarked className="w-6 h-6 text-accent mb-1" />
          <span className="text-2xl font-bold text-foreground">{activeLoans.length}</span>
          <span className="text-xs text-muted-foreground">Ativo{activeLoans.length !== 1 ? 's' : ''}</span>
        </Card>
        <Card className="p-4 flex flex-col items-center text-center gap-1">
          <History className="w-6 h-6 text-muted-foreground mb-1" />
          <span className="text-2xl font-bold text-foreground">{returnedLoans.length}</span>
          <span className="text-xs text-muted-foreground">Devolvido{returnedLoans.length !== 1 ? 's' : ''}</span>
        </Card>
      </div>

      {/* Lista de empréstimos */}
      {(!myLoans || myLoans.length === 0) ? (
        <Card className="p-16 flex flex-col items-center text-center gap-3">
          <History className="w-12 h-12 text-muted-foreground/30" />
          <p className="text-muted-foreground font-medium">Você ainda não realizou nenhum agendamento.</p>
          <p className="text-sm text-muted-foreground/60">Vá ao Catálogo para reservar um livro!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {myLoans.map((loan) => {
            const isOverdue = loan.status === 'ativo' && isAfter(new Date(), parseISO(loan.dueDate));
            return (
              <Card key={loan.id} className={`p-5 flex items-center gap-4 ${isOverdue ? 'border-destructive/30 bg-destructive/5' : ''}`}>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <BookMarked className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground line-clamp-1">{loan.book?.title}</p>
                  <p className="text-xs text-muted-foreground">{loan.book?.author}</p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                    {loan.status === "reservado" && (
                      <span className="flex items-center gap-1">
                        <CalendarCheck className="w-3 h-3 text-primary" />
                        {loan.pickupDate
                          ? <>Retirada prevista: <strong>{format(parseISO(loan.pickupDate), "dd MMM yyyy", { locale: ptBR })}</strong></>
                          : "Aguardando retirada na biblioteca"
                        }
                      </span>
                    )}
                    {loan.status === "ativo" && loan.loanDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Retirado em: {format(parseISO(loan.loanDate), "dd MMM yyyy", { locale: ptBR })}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <History className="w-3 h-3" />
                      {loan.status === 'devolvido' && loan.returnDate
                        ? <>Devolvido em: {format(parseISO(loan.returnDate), "dd/MM/yyyy")}</>
                        : <>Devolução prevista: {format(parseISO(loan.dueDate), "dd/MM/yyyy")}</>
                      }
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <StatusBadge status={loan.status} dueDate={loan.dueDate} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
