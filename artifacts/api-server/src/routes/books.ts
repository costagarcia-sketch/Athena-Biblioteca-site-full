import { Router } from "express";
import { db, booksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdm, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/books", requireAuth, async (_req, res) => {
  try {
    const books = await db.select().from(booksTable).orderBy(booksTable.title);
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar livros" });
  }
});

router.get("/books/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [book] = await db.select().from(booksTable).where(eq(booksTable.id, id));
    if (!book) {
      res.status(404).json({ error: "Livro não encontrado" });
      return;
    }
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar livro" });
  }
});

router.post("/books", requireAuth, requireAdm, async (req, res) => {
  try {
    const { title, author, isbn, category, description, year, publisher, quantity, available } = req.body;
    if (!title || !author) {
      res.status(400).json({ error: "Título e autor são obrigatórios" });
      return;
    }
    const [book] = await db.insert(booksTable).values({
      title,
      author,
      isbn: isbn || null,
      category: category || null,
      description: description || null,
      year: year ? parseInt(year) : null,
      publisher: publisher || null,
      quantity: quantity ?? 1,
      available: available ?? quantity ?? 1,
    }).returning();
    res.status(201).json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar livro" });
  }
});

router.put("/books/:id", requireAuth, requireAdm, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, author, isbn, category, description, year, publisher, quantity, available } = req.body;
    const [book] = await db.update(booksTable)
      .set({ title, author, isbn, category, description: description || null, year: year ? parseInt(year) : null, publisher: publisher || null, quantity, available })
      .where(eq(booksTable.id, id))
      .returning();
    if (!book) {
      res.status(404).json({ error: "Livro não encontrado" });
      return;
    }
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar livro" });
  }
});

router.delete("/books/:id", requireAuth, requireAdm, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(booksTable).where(eq(booksTable.id, id));
    res.json({ success: true, message: "Livro excluído" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir livro" });
  }
});

export default router;
