import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.post("/auth/login", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    res.status(400).json({ error: "Email, senha e perfil são obrigatórios" });
    return;
  }

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

    if (!user) {
      res.status(401).json({ error: "Email ou senha inválidos" });
      return;
    }

    if (user.password !== password) {
      res.status(401).json({ error: "Email ou senha inválidos" });
      return;
    }

    if (user.role !== role) {
      res.status(401).json({ error: `Este usuário não tem perfil de ${role === "adm" ? "ADM" : "Aluno"}` });
      return;
    }

    const token = String(user.id);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        matricula: user.matricula,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.post("/auth/logout", (_req, res) => {
  res.json({ success: true, message: "Logout realizado" });
});

router.get("/auth/me", requireAuth, async (req: AuthRequest, res) => {
  res.json(req.user);
});

export default router;
