import { createContext, useContext } from "react";
import type { User, LoginResponse } from "@workspace/api-client-react";

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
