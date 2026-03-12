import React, { useState } from "react";
import { useListBooks, useCreateBook, useUpdateBook, useDeleteBook, getListBooksQueryKey, Book } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, Button, Input, Modal, Table, Th, Td, Tr, Badge } from "@/components/ui/shared";
import { Plus, Search, Edit2, Trash2, BookOpen } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const bookSchema = z.object({
  title: z.string().min(1, "Obrigatório"),
  author: z.string().min(1, "Obrigatório"),
  isbn: z.string().optional(),
  category: z.string().optional(),
  quantity: z.coerce.number().min(1, "Mín. 1"),
});
type BookForm = z.infer<typeof bookSchema>;

export default function AdminBooks() {
  const queryClient = useQueryClient();
  const { data: books, isLoading } = useListBooks();
  
  const createMutation = useCreateBook({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() }) } });
  const updateMutation = useUpdateBook({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() }) } });
  const deleteMutation = useDeleteBook({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() }) } });

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<BookForm>({ resolver: zodResolver(bookSchema) });

  const openAdd = () => {
    setEditingBook(null);
    reset({ title: "", author: "", isbn: "", category: "", quantity: 1 });
    setModalOpen(true);
  };

  const openEdit = (book: Book) => {
    setEditingBook(book);
    setValue("title", book.title);
    setValue("author", book.author);
    setValue("isbn", book.isbn || "");
    setValue("category", book.category || "");
    setValue("quantity", book.quantity);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja remover este livro?")) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const onSubmit = async (data: BookForm) => {
    const payload = { ...data, available: data.quantity }; // Simplified: available starts as quantity
    if (editingBook) {
      await updateMutation.mutateAsync({ id: editingBook.id, data: payload });
    } else {
      await createMutation.mutateAsync({ data: payload });
    }
    setModalOpen(false);
  };

  const filteredBooks = books?.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Acervo de Livros</h1>
          <p className="text-muted-foreground mt-1">Gerencie os títulos disponíveis na biblioteca.</p>
        </div>
        <Button onClick={openAdd} className="shrink-0 gap-2">
          <Plus className="w-5 h-5" /> Adicionar Livro
        </Button>
      </div>

      <Card className="p-4 sm:p-6 flex flex-col gap-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input 
            placeholder="Buscar por título ou autor..." 
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
                <Th>Livro</Th>
                <Th>Categoria</Th>
                <Th>Estoque (Disp/Total)</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <Tr key={book.id}>
                  <Td>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-14 rounded bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border/50">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground line-clamp-1">{book.title}</p>
                        <p className="text-xs text-muted-foreground">{book.author}</p>
                        {book.isbn && <p className="text-[10px] text-muted-foreground/60 mt-0.5">ISBN: {book.isbn}</p>}
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <Badge variant="outline">{book.category || 'Sem Categoria'}</Badge>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <Badge variant={book.available > 0 ? "success" : "destructive"}>
                        {book.available} / {book.quantity}
                      </Badge>
                    </div>
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(book)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(book.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Td>
                </Tr>
              ))}
              {filteredBooks.length === 0 && (
                <Tr>
                  <Td colSpan={4} className="text-center py-12 text-muted-foreground">
                    Nenhum livro encontrado.
                  </Td>
                </Tr>
              )}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingBook ? "Editar Livro" : "Novo Livro"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Título</label>
            <Input {...register("title")} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Autor</label>
            <Input {...register("author")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Categoria</label>
              <Input {...register("category")} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">ISBN</label>
              <Input {...register("isbn")} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Quantidade Total</label>
            <Input type="number" {...register("quantity")} />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
