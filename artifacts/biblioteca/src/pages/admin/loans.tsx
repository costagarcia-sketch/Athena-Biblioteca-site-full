import React, { useState } from "react";
import { useListLoans, useCreateLoan, useUpdateLoan, useListBooks, useListUsers, getListLoansQueryKey, getListBooksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, Button, Input, Modal, Table, Th, Td, Tr, Badge } from "@/components/ui/shared";
import { Plus, Search, CheckCircle, AlertTriangle, BookOpen, User, AlertCircle } from "lucide-react";
import { format, parseISO, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

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
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [returnConfirmOpen, setReturnConfirmOpen] = useState(false);
  const [returnLoanId, setReturnLoanId] = useState<number | null>(null);
  const [returnLoanInfo, setReturnLoanInfo] = useState<{ bookTitle: string; userName: string } | null>(null);

  const [selectedBook, setSelectedBook] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !selectedUser || !dueDate) {
      setValidationModalOpen(true);
      return;
    }

    await createMutation.mutateAsync({
      data: {
        bookId: parseInt(selectedBook),
        userId: parseInt(selectedUser),
        dueDate: new Date(dueDate).toISOString(),
      }
    });
    setModalOpen(false);
    setSelectedBook("");
    setSelectedUser("");
    setDueDate("");
  };

  const handleReturnClick = (loan: any) => {
    setReturnLoanId(loan.id);
    setReturnLoanInfo({ bookTitle: loan.book?.title || "Livro", userName: loan.user?.name || "Aluno" });
    setReturnConfirmOpen(true);
  };

  const handleReturnConfirm = async () => {
    if (returnLoanId === null) return;
    await updateMutation.mutateAsync({
      id: returnLoanId,
      data: {
        status: "devolvido",
        returnDate: new Date().toISOString(),
      }
    });
    setReturnConfirmOpen(false);
    setReturnLoanId(null);
    setReturnLoanInfo(null);
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
                        <Button variant="outline" size="sm" onClick={() => handleReturnClick(loan)} className="gap-2">
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

      {/* Modal: Novo Empréstimo */}
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

      {/* Modal: Confirmação de Devolução */}
      <AnimatePresence>
        {returnConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setReturnConfirmOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-8 flex flex-col items-center text-center gap-5"
            >
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-display font-bold text-foreground">Confirmar Devolução</h2>
                <p className="text-muted-foreground text-sm">Você está registrando a devolução do seguinte empréstimo:</p>
              </div>

              <div className="w-full bg-muted/50 rounded-xl p-4 space-y-2 text-left">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-medium text-foreground">{returnLoanInfo?.bookTitle}</span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">{returnLoanInfo?.userName}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Esta ação marcará o livro como devolvido e atualizará a disponibilidade no acervo.
              </p>

              <div className="flex gap-3 w-full pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setReturnConfirmOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleReturnConfirm}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Registrando..." : "Confirmar Devolução"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Validação de campos */}
      <AnimatePresence>
        {validationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setValidationModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center gap-5"
            >
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-display font-bold text-foreground">Campos obrigatórios</h2>
                <p className="text-muted-foreground text-sm">
                  Preencha todos os campos antes de registrar o empréstimo: aluno, livro e data de devolução.
                </p>
              </div>

              <Button className="w-full" onClick={() => setValidationModalOpen(false)}>
                Entendido
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
