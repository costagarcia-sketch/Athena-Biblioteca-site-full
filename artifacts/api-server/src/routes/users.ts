import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, ne } from "drizzle-orm";
import { requireAuth, requireAdm, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/users", requireAuth, requireAdm, async (_req, res) => {
  try {
    const users = await db.select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      matricula: usersTable.matricula,
      createdAt: usersTable.createdAt,
    }).from(usersTable).where(ne(usersTable.role, "adm")).orderBy(usersTable.name);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar usuários" });
  }
});

router.get("/users/:id", requireAuth, requireAdm, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const [user] = await db.select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      matricula: usersTable.matricula,
      createdAt: usersTable.createdAt,
    }).from(usersTable).where(eq(usersTable.id, id));
    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
});

router.post("/users", requireAuth, requireAdm, async (_req, res) => {
  try {
    const { name, email, password, role, matricula } = _req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
      return;
    }
    const [user] = await db.insert(usersTable).values({
      name,
      email,
      password,
      role: role || "aluno",
      matricula: matricula || null,
    }).returning({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      matricula: usersTable.matricula,
      createdAt: usersTable.createdAt,
    });
    res.status(201).json(user);
  } catch (err: any) {
    console.error(err);
    if (err.code === "23505") {
      res.status(400).json({ error: "Email já cadastrado" });
      return;
    }
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

router.put("/users/:id", requireAuth, requireAdm, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email, matricula } = req.body;
    const [user] = await db.update(usersTable)
      .set({ name, email, matricula })
      .where(eq(usersTable.id, id))
      .returning({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
        matricula: usersTable.matricula,
        createdAt: usersTable.createdAt,
      });
    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});

router.delete("/users/:id", requireAuth, requireAdm, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(usersTable).where(eq(usersTable.id, id));
    res.json({ success: true, message: "Usuário excluído" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir usuário" });
  }
});

export default router;
