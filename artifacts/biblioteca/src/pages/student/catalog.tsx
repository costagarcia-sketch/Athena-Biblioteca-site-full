import React, { useState } from "react";
import { useListBooks } from "@workspace/api-client-react";
import { Card, Input, Badge, Button } from "@/components/ui/shared";
import { Search, Library, BookOpen } from "lucide-react";

export default function StudentCatalog() {
  const { data: books, isLoading } = useListBooks();
  const [search, setSearch] = useState("");

  const filteredBooks = books?.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    (b.category && b.category.toLowerCase().includes(search.toLowerCase()))
  ) || [];

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto py-8">
        <Library className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-display font-bold text-foreground">Catálogo da Biblioteca</h1>
        <p className="text-muted-foreground mt-4 text-lg">Pesquise em nosso acervo de milhares de livros disponíveis para o seu aprendizado.</p>
        
        <div className="mt-8 relative max-w-xl mx-auto shadow-lg shadow-primary/5 rounded-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground w-6 h-6" />
          <Input 
            placeholder="Buscar por título, autor ou categoria..." 
            className="pl-16 h-16 text-lg rounded-full border-2 focus-visible:ring-0 focus-visible:border-primary bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="animate-pulse h-72 bg-muted/50 rounded-2xl border border-border" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-12">
          {filteredBooks.map(book => (
            <Card key={book.id} className="group hover:-translate-y-2 transition-all duration-300 flex flex-col h-full hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30">
              <div className="h-48 bg-gradient-to-br from-muted to-muted/50 p-6 flex flex-col items-center justify-center relative border-b border-border/50">
                <BookOpen className="w-16 h-16 text-muted-foreground/30 group-hover:text-primary/40 transition-colors" />
                <Badge variant="outline" className="absolute top-3 right-3 bg-card shadow-sm">
                  {book.category || 'Geral'}
                </Badge>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">{book.title}</h3>
                <p className="text-muted-foreground text-sm mt-1">{book.author}</p>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <div className="text-sm font-medium">
                    {book.available > 0 ? (
                      <span className="text-green-600 dark:text-green-400">{book.available} disponíveis</span>
                    ) : (
                      <span className="text-destructive">Indisponível</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {filteredBooks.length === 0 && (
            <div className="col-span-full text-center py-20 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-xl">Nenhum livro encontrado com esses termos.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
