import React, { useState } from "react";
import { useListLoans, useCreateLoan, useUpdateLoan, useListBooks, useListUsers, getListLoansQueryKey, getListBooksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, Button, Input, Modal, Table, Th, Td, Tr, Badge } from "@/components/ui/shared";
import { Plus, Search, CheckCircle, AlertTriangle } from "lucide-react";
import { format, parseISO, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminLoans() {
  const queryClient = useQueryClient();
  const { data: loans, isLoading } = useListLoans();
  const { data: books } = useListBooks();
  const { data: users } = useListUsers();
  
  const createMutation = useCreateLoan({ 
    mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListLoansQueryKey() }); queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() }); } } 
  });
  const updateMutation = useUpdateLoan({ 
    mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListLoansQueryKey() }); queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() }); } } 
  });

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const [selectedBook, setSelectedBook] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !selectedUser || !dueDate) return alert("Preencha todos os campos");
    
    await createMutation.mutateAsync({
      data: {
        bookId: parseInt(selectedBook),
        userId: parseInt(selectedUser),
        dueDate: new Date(dueDate).toISOString(),
      }
    });
    setModalOpen(false);
  };

  const handleReturn = async (id: number) => {
    if (confirm("Confirmar a devolução deste livro?")) {
      await updateMutation.mutateAsync({
        id,
        data: {
          status: "devolvido",
          returnDate: new Date().toISOString(),
        }
      });
    }
  };

  const filteredLoans = loans?.filter(l => 
    l.book?.title.toLowerCase().includes(search.toLowerCase()) || 
    l.user?.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Empréstimos</h1>
          <p className="text-muted-foreground mt-1">Controle de saídas e devoluções.</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="shrink-0 gap-2">
          <Plus className="w-5 h-5" /> Novo Empréstimo
        </Button>
      </div>

      <Card className="p-4 sm:p-6 flex flex-col gap-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input 
            placeholder="Buscar por livro ou aluno..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">Carregando...</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Livro / Aluno</Th>
                <Th>Data Empréstimo</Th>
                <Th>Devolução (Prevista)</Th>
                <Th>Status</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.map((loan) => {
                const isOverdue = loan.status === 'ativo' && isAfter(new Date(), parseISO(loan.dueDate));
                
                return (
                  <Tr key={loan.id}>
                    <Td>
                      <div>
                        <p className="font-semibold text-foreground">{loan.book?.title}</p>
                        <p className="text-xs text-muted-foreground">{loan.user?.name}</p>
                      </div>
                    </Td>
                    <Td>
                      {loan.loanDate ? format(parseISO(loan.loanDate), "dd/MM/yyyy", { locale: ptBR }) : '-'}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        {format(parseISO(loan.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                        {isOverdue && <AlertTriangle className="w-4 h-4 text-destructive" />}
                      </div>
                    </Td>
                    <Td>
                      {loan.status === 'devolvido' ? (
                        <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">Devolvido</Badge>
                      ) : isOverdue ? (
                        <Badge variant="destructive">Atrasado</Badge>
                      ) : (
                        <Badge variant="default">Ativo</Badge>
                      )}
                    </Td>
                    <Td className="text-right">
                      {loan.status === 'ativo' && (
                        <Button variant="outline" size="sm" onClick={() => handleReturn(loan.id)} className="gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" /> Devolver
                        </Button>
                      )}
                    </Td>
                  </Tr>
                );
              })}
              {filteredLoans.length === 0 && (
                <Tr>
                  <Td colSpan={5} className="text-center py-12 text-muted-foreground">
                    Nenhum empréstimo encontrado.
                  </Td>
                </Tr>
              )}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Empréstimo">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Aluno</label>
            <select 
              value={selectedUser} 
              onChange={e => setSelectedUser(e.target.value)}
              className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="">Selecione um aluno...</option>
              {users?.filter(u => u.role === 'aluno').map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.matricula || u.email})</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Livro</label>
            <select 
              value={selectedBook} 
              onChange={e => setSelectedBook(e.target.value)}
              className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="">Selecione um livro...</option>
              {books?.filter(b => b.available > 0).map(b => (
                <option key={b.id} value={b.id}>{b.title} (Disp: {b.available})</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Data de Devolução Prevista</label>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={createMutation.isPending}>Confirmar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
