import { pgTable, text, serial, integer, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("aluno"),
  matricula: text("matricula"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const booksTable = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  isbn: text("isbn"),
  category: text("category"),
  description: text("description"),
  year: integer("year"),
  publisher: text("publisher"),
  quantity: integer("quantity").notNull().default(1),
  available: integer("available").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const loansTable = pgTable("loans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  bookId: integer("book_id").notNull().references(() => booksTable.id),
  loanDate: timestamp("loan_date").defaultNow(),
  pickupDate: timestamp("pickup_date"),
  dueDate: timestamp("due_date").notNull(),
  returnDate: timestamp("return_date"),
  status: text("status").notNull().default("reservado"),
  fine: decimal("fine", { precision: 10, scale: 2 }).default("0"),
  finePaid: boolean("fine_paid").default(false),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export const insertBookSchema = createInsertSchema(booksTable).omit({ id: true, createdAt: true });
export const insertLoanSchema = createInsertSchema(loansTable).omit({ id: true, loanDate: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof booksTable.$inferSelect;
export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Loan = typeof loansTable.$inferSelect;
