import { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
    matricula: string | null;
  };
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Não autorizado" });
    return;
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const userId = parseInt(token, 10);
    if (isNaN(userId)) {
      res.status(401).json({ error: "Token inválido" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) {
      res.status(401).json({ error: "Usuário não encontrado" });
      return;
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      matricula: user.matricula,
    };
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
}

export function requireAdm(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "adm") {
    res.status(403).json({ error: "Acesso negado. Apenas ADM." });
    return;
  }
  next();
}
