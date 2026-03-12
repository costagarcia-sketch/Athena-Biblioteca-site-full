import React from "react";
import { useGetMyLoans } from "@workspace/api-client-react";
import { Card, Table, Th, Td, Tr, Badge } from "@/components/ui/shared";
import { History, BookMarked } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function StudentLoans() {
  const { data: myLoans, isLoading } = useGetMyLoans();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Meus Empréstimos</h1>
        <p className="text-muted-foreground mt-1">Histórico completo de suas leituras.</p>
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">Carregando histórico...</div>
        ) : (
          <Table>
            <thead className="bg-muted/30">
              <tr>
                <Th>Livro</Th>
                <Th>Data Retirada</Th>
                <Th>Prazo / Devolução</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {myLoans?.map((loan) => (
                <Tr key={loan.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-muted/50 flex items-center justify-center text-primary/50 shrink-0">
                        <BookMarked className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{loan.book?.title}</p>
                        <p className="text-xs text-muted-foreground">{loan.book?.author}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    {loan.loanDate ? format(parseISO(loan.loanDate), "dd MMM yyyy", { locale: ptBR }) : '-'}
                  </Td>
                  <Td>
                    {loan.status === 'devolvido' && loan.returnDate ? (
                      <span className="text-muted-foreground">
                        Devolvido em {format(parseISO(loan.returnDate), "dd/MM/yyyy")}
                      </span>
                    ) : (
                      <span className="font-medium">
                        Até {format(parseISO(loan.dueDate), "dd/MM/yyyy")}
                      </span>
                    )}
                  </Td>
                  <Td>
                    {loan.status === 'devolvido' ? (
                      <Badge variant="outline" className="border-green-500/50 text-green-600 bg-green-500/5">Devolvido</Badge>
                    ) : (
                      <Badge variant="default" className="shadow-sm">Ativo</Badge>
                    )}
                  </Td>
                </Tr>
              ))}
              {(!myLoans || myLoans.length === 0) && (
                <Tr>
                  <Td colSpan={4} className="text-center py-16">
                    <History className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">Você ainda não realizou nenhum empréstimo.</p>
                  </Td>
                </Tr>
              )}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
