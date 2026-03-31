import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme";
import { Card, Button, Input } from "@/components/ui/shared";
import { motion } from "framer-motion";
import { BookOpen, Moon, Sun } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "A senha é obrigatória"),
});
type LoginForm = z.infer<typeof loginSchema>;

const roleDestination: Record<string, string> = {
  adm: "/admin",
  aluno: "/student",
  pedagogo: "/pedagogo",
};

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { theme, setTheme } = useTheme();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Credenciais inválidas.");
        return;
      }
      login(json);
      setLocation(roleDestination[json.user?.role] ?? "/");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background relative overflow-hidden">

      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[40%] rounded-full bg-accent/20 blur-[100px] pointer-events-none" />

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-3 rounded-full bg-card/80 backdrop-blur border border-border shadow-lg text-foreground hover:bg-muted transition-all"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full shadow-2xl shadow-black/10 md:my-12 rounded-3xl overflow-hidden bg-card border border-border/50 relative z-10">

        {/* Left Image */}
        <div className="hidden md:block md:w-5/12 lg:w-1/2 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 flex flex-col justify-end p-12 text-white">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-10 h-10 text-accent" />
              <h1 className="text-4xl font-display font-bold">Athena</h1>
            </div>
            <p className="text-lg text-white/80 font-medium">O conhecimento encontra a elegância.</p>
          </div>
          <img
            src={`${import.meta.env.BASE_URL}images/hero-library.png`}
            alt="Library"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Right Form */}
        <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-16 bg-background/50 backdrop-blur-sm">

          {/* Mobile Header */}
          <div className="md:hidden flex items-center gap-2 mb-8 justify-center">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-display font-bold text-foreground">Athena</h1>
          </div>

          <div className="w-full max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold text-foreground">Bem-vindo</h2>
                <p className="text-muted-foreground text-lg">Insira suas credenciais para acessar o sistema.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground ml-1">E-mail</label>
                    <Input
                      placeholder="seu@email.com"
                      type="email"
                      {...register("email")}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive ml-1">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground ml-1">Senha</label>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      {...register("password")}
                      className={errors.password ? "border-destructive" : ""}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive ml-1">{errors.password.message}</p>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-14 text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar no Sistema"}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
