import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { setupApiInterceptor } from "@/lib/api-setup";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";
import { AppLayout } from "@/components/layout/AppLayout";
import NotFound from "@/pages/not-found";

import Login from "@/pages/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminBooks from "@/pages/admin/books";
import AdminUsers from "@/pages/admin/users";
import AdminLoans from "@/pages/admin/loans";
import StudentDashboard from "@/pages/student/dashboard";
import StudentCatalog from "@/pages/student/catalog";
import StudentLoans from "@/pages/student/loans";
import PedagogoDashboard from "@/pages/pedagogo/dashboard";

// Initialize global fetch interceptor
setupApiInterceptor();
const queryClient = new QueryClient();

// Protected Route Component — accepts single role or array of roles
function ProtectedRoute({ component: Component, roleRequired, ...rest }: { component: React.ComponentType<any>, roleRequired?: string | string[] }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!isAuthenticated) return <Redirect to="/login" />;
  if (roleRequired) {
    const allowed = Array.isArray(roleRequired) ? roleRequired : [roleRequired];
    if (!user || !allowed.includes(user.role)) return <Redirect to="/" />;
  }

  return (
    <AppLayout>
      <Component {...rest} />
    </AppLayout>
  );
}

// Root router logic
function RootRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Redirect to="/login" />;
  if (user.role === "adm") return <Redirect to="/admin" />;
  if (user.role === "pedagogo") return <Redirect to="/pedagogo" />;
  return <Redirect to="/student" />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRedirect} />
      <Route path="/login" component={Login} />
      
      {/* Admin Routes */}
      <Route path="/admin">{() => <ProtectedRoute component={AdminDashboard} roleRequired="adm" />}</Route>
      <Route path="/admin/books">{() => <ProtectedRoute component={AdminBooks} roleRequired="adm" />}</Route>
      <Route path="/admin/users">{() => <ProtectedRoute component={AdminUsers} roleRequired="adm" />}</Route>
      <Route path="/admin/loans">{() => <ProtectedRoute component={AdminLoans} roleRequired="adm" />}</Route>

      {/* Pedagogo Routes */}
      <Route path="/pedagogo">{() => <ProtectedRoute component={PedagogoDashboard} roleRequired="pedagogo" />}</Route>
      <Route path="/pedagogo/loans">{() => <ProtectedRoute component={AdminLoans} roleRequired="pedagogo" />}</Route>
      <Route path="/pedagogo/books">{() => <ProtectedRoute component={AdminBooks} roleRequired="pedagogo" />}</Route>

      {/* Student Routes */}
      <Route path="/student">{() => <ProtectedRoute component={StudentDashboard} roleRequired="aluno" />}</Route>
      <Route path="/student/catalog">{() => <ProtectedRoute component={StudentCatalog} roleRequired="aluno" />}</Route>
      <Route path="/student/loans">{() => <ProtectedRoute component={StudentLoans} roleRequired="aluno" />}</Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
