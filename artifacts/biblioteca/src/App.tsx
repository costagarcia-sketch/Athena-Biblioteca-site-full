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

// Initialize global fetch interceptor
setupApiInterceptor();
const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ component: Component, roleRequired, ...rest }: any) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!isAuthenticated) return <Redirect to="/login" />;
  if (roleRequired && user?.role !== roleRequired) return <Redirect to="/" />;

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
  return <Redirect to={user.role === "adm" ? "/admin" : "/student"} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRedirect} />
      <Route path="/login" component={Login} />
      
      {/* Admin Routes */}
      <Route path="/admin">{(params) => <ProtectedRoute component={AdminDashboard} roleRequired="adm" />}</Route>
      <Route path="/admin/books">{(params) => <ProtectedRoute component={AdminBooks} roleRequired="adm" />}</Route>
      <Route path="/admin/users">{(params) => <ProtectedRoute component={AdminUsers} roleRequired="adm" />}</Route>
      <Route path="/admin/loans">{(params) => <ProtectedRoute component={AdminLoans} roleRequired="adm" />}</Route>

      {/* Student Routes */}
      <Route path="/student">{(params) => <ProtectedRoute component={StudentDashboard} roleRequired="aluno" />}</Route>
      <Route path="/student/catalog">{(params) => <ProtectedRoute component={StudentCatalog} roleRequired="aluno" />}</Route>
      <Route path="/student/loans">{(params) => <ProtectedRoute component={StudentLoans} roleRequired="aluno" />}</Route>

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
