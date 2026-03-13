import { Router } from "express";
import { db, loansTable, booksTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdm, type AuthRequest } from "../middlewares/auth";

const router = Router();

async function getLoanWithDetails(id: number) {
  const [loan] = await db.select().from(loansTable).where(eq(loansTable.id, id));
  if (!loan) return null;

  const [user] = await db.select({
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    role: usersTable.role,
    matricula: usersTable.matricula,
    createdAt: usersTable.createdAt,
  }).from(usersTable).where(eq(usersTable.id, loan.userId));

  const [book] = await db.select().from(booksTable).where(eq(booksTable.id, loan.bookId));

  return { ...loan, user: user || null, book: book || null };
}

router.get("/loans", requireAuth, requireAdm, async (_req, res) => {
  try {
    const loans = await db.select().from(loansTable).orderBy(loansTable.loanDate);
    const loansWithDetails = await Promise.all(
      loans.map(async (loan) => {
        const [user] = await db.select({
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          role: usersTable.role,
          matricula: usersTable.matricula,
          createdAt: usersTable.createdAt,
        }).from(usersTable).where(eq(usersTable.id, loan.userId));
        const [book] = await db.select().from(booksTable).where(eq(booksTable.id, loan.bookId));
        return { ...loan, user: user || null, book: book || null };
      })
    );
    res.json(loansWithDetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar empréstimos" });
  }
});

router.get("/loans/my", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const loans = await db.select().from(loansTable).where(eq(loansTable.userId, userId));
    const loansWithDetails = await Promise.all(
      loans.map(async (loan) => {
        const [book] = await db.select().from(booksTable).where(eq(booksTable.id, loan.bookId));
        return { ...loan, book: book || null, user: req.user };
      })
    );
    res.json(loansWithDetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar meus empréstimos" });
  }
});

router.get("/loans/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const loan = await getLoanWithDetails(id);
    if (!loan) {
      res.status(404).json({ error: "Empréstimo não encontrado" });
      return;
    }
    if (req.user!.role !== "adm" && loan.userId !== req.user!.id) {
      res.status(403).json({ error: "Acesso negado" });
      return;
    }
    res.json(loan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar empréstimo" });
  }
});

router.post("/loans", requireAuth, async (req: AuthRequest, res) => {
  try {
    const isAdm = req.user!.role === "adm";
    const { bookId, dueDate, pickupDate } = req.body;
    const userId = isAdm ? req.body.userId : req.user!.id;

    if (!userId || !bookId || !dueDate) {
      res.status(400).json({ error: "bookId e dueDate são obrigatórios" });
      return;
    }

    const [book] = await db.select().from(booksTable).where(eq(booksTable.id, bookId));
    if (!book) {
      res.status(404).json({ error: "Livro não encontrado" });
      return;
    }
    if (book.available <= 0) {
      res.status(400).json({ error: "Livro não disponível para reserva" });
      return;
    }

    // Decrement available immediately when reserved (book is set aside)
    await db.update(booksTable).set({ available: book.available - 1 }).where(eq(booksTable.id, bookId));

    const [loan] = await db.insert(loansTable).values({
      userId,
      bookId,
      pickupDate: pickupDate ? new Date(pickupDate) : null,
      dueDate: new Date(dueDate),
      // ADM creates directly as "ativo"; students create as "reservado"
      status: isAdm ? "ativo" : "reservado",
    }).returning();

    const loanWithDetails = await getLoanWithDetails(loan.id);
    res.status(201).json(loanWithDetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar reserva" });
  }
});

router.put("/loans/:id", requireAuth, requireAdm, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, returnDate, pickupDate, fine, finePaid } = req.body;

    const [existing] = await db.select().from(loansTable).where(eq(loansTable.id, id));
    if (!existing) {
      res.status(404).json({ error: "Empréstimo não encontrado" });
      return;
    }

    // When returning a book: restore availability
    if (status === "devolvido" && existing.status !== "devolvido") {
      const [book] = await db.select().from(booksTable).where(eq(booksTable.id, existing.bookId));
      if (book) {
        await db.update(booksTable).set({ available: book.available + 1 }).where(eq(booksTable.id, existing.bookId));
      }
    }

    // When cancelling a reservation: restore availability
    if (status === "cancelado" && existing.status === "reservado") {
      const [book] = await db.select().from(booksTable).where(eq(booksTable.id, existing.bookId));
      if (book) {
        await db.update(booksTable).set({ available: book.available + 1 }).where(eq(booksTable.id, existing.bookId));
      }
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (pickupDate !== undefined) updateData.pickupDate = pickupDate ? new Date(pickupDate) : null;
    if (returnDate !== undefined) updateData.returnDate = returnDate ? new Date(returnDate) : null;
    if (fine !== undefined) updateData.fine = fine;
    if (finePaid !== undefined) updateData.finePaid = finePaid;

    const [loan] = await db.update(loansTable).set(updateData).where(eq(loansTable.id, id)).returning();
    const loanWithDetails = await getLoanWithDetails(loan.id);
    res.json(loanWithDetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar empréstimo" });
  }
});

export default router;
