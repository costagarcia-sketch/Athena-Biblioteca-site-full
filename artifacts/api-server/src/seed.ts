import { db, usersTable, booksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashSync } from "bcryptjs";

export async function seed() {
  console.log("[seed] Verificando dados iniciais...");

  const admins = await db.select().from(usersTable).where(eq(usersTable.role, "adm"));

  if (admins.length === 0) {
    console.log("[seed] Criando usuário administrador padrão...");
    await db.insert(usersTable).values({
      name: "Administrador",
      email: "admin@biblioteca.com",
      password: hashSync("Admin@123", 10),
      role: "adm",
      matricula: null,
    });
    console.log("[seed] Admin criado → email: admin@biblioteca.com  senha: Admin@123");
  }

  const seedStudents = [
    { name: "Joel Alves", email: "joel.alves@biblioteca.com", password: "aluno123", role: "aluno", matricula: "2026001" },
  ];

  for (const student of seedStudents) {
    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, student.email));
    if (!existing) {
      await db.insert(usersTable).values({
        name: student.name,
        email: student.email,
        password: hashSync(student.password, 10),
        role: student.role,
        matricula: student.matricula,
      });
      console.log(`[seed] Aluno criado → ${student.name} (${student.email})`);
    }
  }

  const books = await db.select().from(booksTable);

  if (books.length === 0) {
    console.log("[seed] Inserindo acervo inicial de livros...");
    await db.insert(booksTable).values([
      {
        title: "Dom Casmurro",
        author: "Machado de Assis",
        isbn: "9788535902778",
        category: "Literatura Brasileira",
        description: "Clássico da literatura brasileira do Realismo, narrado por Bentinho (Dom Casmurro).",
        year: 1899,
        publisher: "Companhia das Letras",
        quantity: 3,
        available: 3,
      },
      {
        title: "O Cortiço",
        author: "Aluísio Azevedo",
        isbn: "9788535907247",
        category: "Literatura Brasileira",
        description: "Romance naturalista que retrata a vida em um cortiço no Rio de Janeiro do século XIX.",
        year: 1890,
        publisher: "Ática",
        quantity: 2,
        available: 2,
      },
      {
        title: "A Moreninha",
        author: "Joaquim Manuel de Macedo",
        isbn: "9788572328562",
        category: "Literatura Brasileira",
        description: "Considerado o primeiro romance brasileiro, uma história de amor entre estudantes.",
        year: 1844,
        publisher: "Martin Claret",
        quantity: 2,
        available: 2,
      },
      {
        title: "Vidas Secas",
        author: "Graciliano Ramos",
        isbn: "9788535902747",
        category: "Literatura Brasileira",
        description: "Retrato da seca e do sofrimento de uma família de sertanejos nordestinos.",
        year: 1938,
        publisher: "Record",
        quantity: 3,
        available: 3,
      },
      {
        title: "O Guarani",
        author: "José de Alencar",
        isbn: "9788535907148",
        category: "Literatura Brasileira",
        description: "Romance indianista que narra a história do índio Peri e sua dedicação à família Mariz.",
        year: 1857,
        publisher: "Ática",
        quantity: 2,
        available: 2,
      },
      {
        title: "Iracema",
        author: "José de Alencar",
        isbn: "9788535908022",
        category: "Literatura Brasileira",
        description: "Poema em prosa que conta a história da índia Iracema e o guerreiro Martim.",
        year: 1865,
        publisher: "Ática",
        quantity: 2,
        available: 2,
      },
      {
        title: "Memórias Póstumas de Brás Cubas",
        author: "Machado de Assis",
        isbn: "9788535902754",
        category: "Literatura Brasileira",
        description: "Narrado por um defunto autor, marco do Realismo brasileiro.",
        year: 1881,
        publisher: "Companhia das Letras",
        quantity: 3,
        available: 3,
      },
      {
        title: "Capitães da Areia",
        author: "Jorge Amado",
        isbn: "9788535912241",
        category: "Literatura Brasileira",
        description: "A vida de crianças abandonadas nas ruas de Salvador nas décadas de 1930.",
        year: 1937,
        publisher: "Companhia das Letras",
        quantity: 2,
        available: 2,
      },
      {
        title: "O Pequeno Príncipe",
        author: "Antoine de Saint-Exupéry",
        isbn: "9788573261639",
        category: "Literatura Estrangeira",
        description: "Clássico da literatura mundial sobre amizade, amor e a visão pura das crianças.",
        year: 1943,
        publisher: "Agir",
        quantity: 4,
        available: 4,
      },
      {
        title: "Harry Potter e a Pedra Filosofal",
        author: "J.K. Rowling",
        isbn: "9788532523051",
        category: "Fantasia",
        description: "O início das aventuras de Harry Potter no mundo mágico de Hogwarts.",
        year: 1997,
        publisher: "Rocco",
        quantity: 3,
        available: 3,
      },
      {
        title: "O Senhor dos Anéis: A Sociedade do Anel",
        author: "J.R.R. Tolkien",
        isbn: "9788533613379",
        category: "Fantasia",
        description: "A épica jornada de Frodo para destruir o Um Anel na Terra Média.",
        year: 1954,
        publisher: "Martins Fontes",
        quantity: 2,
        available: 2,
      },
      {
        title: "1984",
        author: "George Orwell",
        isbn: "9788535914849",
        category: "Ficção Científica",
        description: "Distopia sobre um regime totalitário que controla até os pensamentos dos cidadãos.",
        year: 1949,
        publisher: "Companhia das Letras",
        quantity: 2,
        available: 2,
      },
    ]);
    console.log("[seed] 12 livros inseridos no acervo.");
  }

  console.log("[seed] Banco de dados pronto.");
}
