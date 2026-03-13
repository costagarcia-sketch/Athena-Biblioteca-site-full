import React, { useState } from "react";
import { useListBooks, useCreateLoan, getGetMyLoansQueryKey, getListBooksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, Input, Badge, Button } from "@/components/ui/shared";
import { Search, Library, BookOpen, X, User, Hash, Tag, Layers, CalendarDays, CheckCircle, AlertCircle, Calendar, Building2, AlignLeft, CalendarCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Book = {
  id: number;
  title: string;
  author: string;
  isbn?: string | null;
  category?: string | null;
  description?: string | null;
  year?: number | null;
  publisher?: string | null;
  quantity: number;
  available: number;
};

export default function StudentCatalog() {
  const queryClient = useQueryClient();
  const { data: books, isLoading } = useListBooks();
  const createLoan = useCreateLoan({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyLoansQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });
      }
    }
  });

  const [search, setSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [pickupDate, setPickupDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [successModal, setSuccessModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const filteredBooks = books?.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    (b.category && b.category.toLowerCase().includes(search.toLowerCase()))
  ) || [];

  const today = new Date();
  const minPickup = new Date(today); minPickup.setDate(today.getDate() + 1);
  const minPickupStr = minPickup.toISOString().split("T")[0];

  const minDue = pickupDate
    ? (() => { const d = new Date(pickupDate); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; })()
    : minPickupStr;

  const handleRequestLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueDate || !selectedBook) return;
    setErrorMsg("");
    try {
      await createLoan.mutateAsync({
        data: {
          bookId: selectedBook.id,
          pickupDate: pickupDate ? new Date(pickupDate).toISOString() : undefined,
          dueDate: new Date(dueDate).toISOString(),
        }
      });
      setSelectedBook(null);
      setPickupDate("");
      setDueDate("");
      setSuccessModal(true);
    } catch (err: any) {
      setErrorMsg(err?.message || "Erro ao solicitar agendamento. Tente novamente.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto py-8">
        <Library className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-display font-bold text-foreground">Catálogo da Biblioteca</h1>
        <p className="text-muted-foreground mt-4 text-lg">Agende a retirada de um livro diretamente pelo sistema.</p>

        <div className="mt-8 relative max-w-xl mx-auto shadow-lg shadow-primary/5 rounded-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground w-6 h-6" />
          <Input
            placeholder="Buscar por título, autor ou categoria..."
            className="pl-16 h-16 text-lg rounded-full border-2 focus-visible:ring-0 focus-visible:border-primary bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid de livros */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="animate-pulse h-72 bg-muted/50 rounded-2xl border border-border" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-12">
          {filteredBooks.map(book => (
            <Card
              key={book.id}
              className="group hover:-translate-y-2 transition-all duration-300 flex flex-col h-full hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 cursor-pointer"
              onClick={() => { setSelectedBook(book as Book); setPickupDate(""); setDueDate(""); setErrorMsg(""); }}
            >
              <div className="h-48 bg-gradient-to-br from-primary/5 to-accent/5 p-6 flex flex-col items-center justify-center relative border-b border-border/50">
                <BookOpen className="w-16 h-16 text-primary/20 group-hover:text-primary/40 transition-colors" />
                {book.year && (
                  <span className="absolute bottom-3 left-3 text-xs text-muted-foreground font-medium">{book.year}</span>
                )}
                <Badge variant="outline" className="absolute top-3 right-3 bg-card shadow-sm">
                  {book.category || 'Geral'}
                </Badge>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">{book.title}</h3>
                <p className="text-muted-foreground text-sm mt-1 line-clamp-1">{book.author}</p>
                {book.description && (
                  <p className="text-muted-foreground/70 text-xs mt-2 line-clamp-2 leading-relaxed">{book.description}</p>
                )}
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <div className="text-sm font-medium">
                    {book.available > 0 ? (
                      <span className="text-green-600 dark:text-green-400">{book.available} disponíve{book.available === 1 ? 'l' : 'is'}</span>
                    ) : (
                      <span className="text-destructive">Indisponível</span>
                    )}
                  </div>
                  <span className="text-xs text-primary font-semibold group-hover:underline">Agendar →</span>
                </div>
              </div>
            </Card>
          ))}
          {filteredBooks.length === 0 && (
            <div className="col-span-full text-center py-20 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-xl">Nenhum livro encontrado com esses termos.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal: Detalhes do Livro + Agendar */}
      <AnimatePresence>
        {selectedBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedBook(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[92vh] overflow-y-auto"
            >
              {/* Header do modal */}
              <div className="bg-gradient-to-br from-primary/10 to-accent/5 border-b border-border p-6 flex gap-5 items-start">
                <div className="w-16 h-20 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1 min-w-0 pr-8">
                  <h2 className="text-xl font-display font-bold text-foreground leading-tight">{selectedBook.title}</h2>
                  <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
                    <User className="w-3.5 h-3.5" /> {selectedBook.author}
                  </p>
                  {(selectedBook.year || selectedBook.publisher) && (
                    <p className="text-muted-foreground/70 mt-1 text-xs flex items-center gap-1.5">
                      {selectedBook.year && <><Calendar className="w-3 h-3" /> {selectedBook.year}</>}
                      {selectedBook.year && selectedBook.publisher && <span className="mx-1">·</span>}
                      {selectedBook.publisher && <><Building2 className="w-3 h-3" /> {selectedBook.publisher}</>}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedBook(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Descrição */}
                {selectedBook.description && (
                  <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2">
                      <AlignLeft className="w-3.5 h-3.5" /> Sinopse
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">{selectedBook.description}</p>
                  </div>
                )}

                {/* Informações do livro */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/40 rounded-xl p-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Categoria</p>
                      <p className="text-sm font-medium text-foreground">{selectedBook.category || "Geral"}</p>
                    </div>
                  </div>
                  <div className="bg-muted/40 rounded-xl p-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Disponíveis</p>
                      <p className={`text-sm font-bold ${selectedBook.available > 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
                        {selectedBook.available} / {selectedBook.quantity}
                      </p>
                    </div>
                  </div>
                  {selectedBook.isbn && (
                    <div className="col-span-2 bg-muted/40 rounded-xl p-3 flex items-center gap-2">
                      <Hash className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">ISBN</p>
                        <p className="text-sm font-medium text-foreground">{selectedBook.isbn}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Formulário de agendamento */}
                {selectedBook.available > 0 ? (
                  <form onSubmit={handleRequestLoan} className="space-y-4 border-t border-border pt-5">
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <CalendarCheck className="w-4 h-4 text-primary" />
                        Agendar Retirada
                      </p>
                      <p className="text-xs text-muted-foreground mb-4 bg-primary/5 border border-primary/10 rounded-xl p-3 leading-relaxed">
                        Reserve o livro agora e retire pessoalmente na biblioteca na data escolhida. O livro ficará separado para você.
                      </p>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5 text-primary" />
                            Data prevista de retirada <span className="text-muted-foreground/50">(opcional)</span>
                          </label>
                          <input
                            type="date"
                            min={minPickupStr}
                            value={pickupDate}
                            onChange={e => { setPickupDate(e.target.value); setDueDate(""); }}
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            Data prevista de devolução <span className="text-destructive text-xs">*</span>
                          </label>
                          <input
                            type="date"
                            required
                            min={minDue}
                            value={dueDate}
                            onChange={e => setDueDate(e.target.value)}
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
                      </div>
                    )}

                    <div className="flex gap-3 pt-1">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setSelectedBook(null)}>
                        Fechar
                      </Button>
                      <Button type="submit" className="flex-1" disabled={createLoan.isPending}>
                        {createLoan.isPending ? "Agendando..." : "Confirmar Agendamento"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="border-t border-border pt-5 space-y-4">
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-center">
                      <p className="text-sm font-medium text-destructive">Este livro não está disponível no momento.</p>
                      <p className="text-xs text-muted-foreground mt-1">Verifique novamente mais tarde.</p>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => setSelectedBook(null)}>
                      Fechar
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Reserva confirmada */}
      <AnimatePresence>
        {successModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSuccessModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center gap-5"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 20 }}
                className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
              >
                <CalendarCheck className="w-10 h-10 text-primary" />
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-xl font-display font-bold text-foreground">Reserva Agendada!</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Seu livro foi reservado com sucesso. Compareça à biblioteca para retirada. Acompanhe o status em <strong>Meus Empréstimos</strong>.
                </p>
              </div>

              <div className="w-full bg-primary/5 border border-primary/10 rounded-xl p-3 text-xs text-muted-foreground leading-relaxed">
                📍 O livro ficará separado para você. Lembre-se de retirar na data combinada!
              </div>

              <Button className="w-full" onClick={() => setSuccessModal(false)}>
                Entendido
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
