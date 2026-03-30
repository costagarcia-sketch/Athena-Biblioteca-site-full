import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "biblioteca-secret-key-change-in-production";

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
    const payload = jwt.verify(token, JWT_SECRET) as {
      id: number;
      name: string;
      email: string;
      role: string;
      matricula: string | null;
    };

    req.user = {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      matricula: payload.matricula,
    };
    next();
  } catch {
    res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

export function requireAdm(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "adm") {
    res.status(403).json({ error: "Acesso negado. Apenas ADM." });
    return;
  }
  next();
}

export function requireStaff(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || (req.user.role !== "adm" && req.user.role !== "pedagogo")) {
    res.status(403).json({ error: "Acesso negado. Apenas ADM ou Pedagogo." });
    return;
  }
  next();
}
