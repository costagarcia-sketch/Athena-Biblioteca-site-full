import React, { useState } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme";
import { Card, Button, Input } from "@/components/ui/shared";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, UserCircle, Shield, Moon, Sun, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "A senha é obrigatória"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [role, setRole] = useState<"adm" | "aluno" | null>(null);
  
  const loginMutation = useLogin();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    if (!role) return;
    try {
      const result = await loginMutation.mutateAsync({
        data: { ...data, role }
      });
      login(result);
      setLocation(role === "adm" ? "/admin" : "/student");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background relative overflow-hidden">
      
      {/* Background elements */}
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
        
        {/* Left Image Section */}
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

        {/* Right Form Section */}
        <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-16 relative bg-background/50 backdrop-blur-sm">
          
          {/* Mobile Header */}
          <div className="md:hidden flex items-center gap-2 mb-8 justify-center">
             <BookOpen className="w-8 h-8 text-primary" />
             <h1 className="text-3xl font-display font-bold text-foreground">Athena</h1>
          </div>

          <div className="w-full max-w-md mx-auto">
            <AnimatePresence mode="wait">
              {!role ? (
                <motion.div 
                  key="role-select"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2 mb-10">
                    <h2 className="text-3xl font-display font-bold text-foreground">Bem-vindo</h2>
                    <p className="text-muted-foreground text-lg">Selecione seu perfil para continuar</p>
                  </div>
                  
                  <div className="grid gap-6">
                    <button 
                      onClick={() => setRole("aluno")}
                      className="group flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
                    >
                      <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <UserCircle className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">Sou Aluno</h3>
                      <p className="text-sm text-muted-foreground mt-2">Consultar acervo e meus empréstimos</p>
                    </button>

                    <button 
                      onClick={() => setRole("adm")}
                      className="group flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-border bg-card hover:border-accent hover:bg-accent/5 hover:shadow-xl hover:shadow-accent/10 transition-all duration-300"
                    >
                      <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Shield className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors">Administrador</h3>
                      <p className="text-sm text-muted-foreground mt-2">Gestão completa da biblioteca</p>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="login-form"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                >
                  <button 
                    onClick={() => setRole(null)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
                  >
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </button>
                  
                  <div className="space-y-2 mb-8">
                    <h2 className="text-3xl font-display font-bold text-foreground">
                      Acesso <span className="text-primary capitalize">{role}</span>
                    </h2>
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
                        {errors.email && <p className="text-sm text-destructive ml-1">{errors.email.message}</p>}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-foreground ml-1">Senha</label>
                        <Input 
                          placeholder="••••••••" 
                          type="password" 
                          {...register("password")}
                          className={errors.password ? "border-destructive" : ""}
                        />
                        {errors.password && <p className="text-sm text-destructive ml-1">{errors.password.message}</p>}
                      </div>
                    </div>

                    {loginMutation.isError && (
                      <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
                        Credenciais inválidas. Tente novamente.
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full h-14 text-lg" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Entrando..." : "Entrar no Sistema"}
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
