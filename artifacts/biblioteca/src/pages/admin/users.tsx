import React, { useState } from "react";
import { useListUsers, useCreateUser, useUpdateUser, useDeleteUser, getListUsersQueryKey, User } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, Button, Input, Modal, Table, Th, Td, Tr, Badge } from "@/components/ui/shared";
import { Plus, Search, Edit2, Trash2, UserCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const userSchema = z.object({
  name: z.string().min(1, "Obrigatório"),
  email: z.string().email("Inválido"),
  password: z.string().min(6, "Mín. 6 chars").optional().or(z.literal('')),
  matricula: z.string().optional(),
});
type UserForm = z.infer<typeof userSchema>;

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useListUsers();
  
  const createMutation = useCreateUser({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() }) } });
  const updateMutation = useUpdateUser({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() }) } });
  const deleteMutation = useDeleteUser({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() }) } });

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<UserForm>({ resolver: zodResolver(userSchema) });

  const openAdd = () => {
    setEditingUser(null);
    reset({ name: "", email: "", password: "", matricula: "" });
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setValue("name", user.name);
    setValue("email", user.email);
    setValue("matricula", user.matricula || "");
    setValue("password", ""); // Keep empty unless changing
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja remover este aluno?")) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const onSubmit = async (data: UserForm) => {
    if (editingUser) {
      await updateMutation.mutateAsync({ id: editingUser.id, data: { name: data.name, email: data.email, matricula: data.matricula } });
    } else {
      if (!data.password) return alert("Senha é obrigatória para novo usuário");
      await createMutation.mutateAsync({ data: { ...data, password: data.password, role: "aluno" } });
    }
    setModalOpen(false);
  };

  const filteredUsers = users?.filter(u => 
    u.role === 'aluno' && 
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Alunos</h1>
          <p className="text-muted-foreground mt-1">Gerencie os alunos cadastrados no sistema.</p>
        </div>
        <Button onClick={openAdd} className="shrink-0 gap-2">
          <Plus className="w-5 h-5" /> Adicionar Aluno
        </Button>
      </div>

      <Card className="p-4 sm:p-6 flex flex-col gap-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input 
            placeholder="Buscar por nome ou email..." 
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
                <Th>Aluno</Th>
                <Th>Matrícula</Th>
                <Th>Status</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <Tr key={user.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <span className="font-mono text-xs">{user.matricula || '-'}</span>
                  </Td>
                  <Td>
                    <Badge variant="success">Ativo</Badge>
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(user)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(user.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Td>
                </Tr>
              ))}
              {filteredUsers.length === 0 && (
                <Tr>
                  <Td colSpan={4} className="text-center py-12 text-muted-foreground">
                    Nenhum aluno encontrado.
                  </Td>
                </Tr>
              )}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingUser ? "Editar Aluno" : "Novo Aluno"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nome Completo</label>
            <Input {...register("name")} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">E-mail</label>
            <Input type="email" {...register("email")} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Matrícula</label>
            <Input {...register("matricula")} />
          </div>
          {!editingUser && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Senha</label>
              <Input type="password" {...register("password")} />
            </div>
          )}
          
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
