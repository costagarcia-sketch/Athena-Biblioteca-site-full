import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetMe, User, LoginResponse } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("biblioteca_token"));
  
  const { data: user, isLoading, isError } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  useEffect(() => {
    if (isError) {
      setToken(null);
      localStorage.removeItem("biblioteca_token");
    }
  }, [isError]);

  const login = (data: LoginResponse) => {
    localStorage.setItem("biblioteca_token", data.token);
    setToken(data.token);
  };

  const logout = () => {
    localStorage.removeItem("biblioteca_token");
    setToken(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ 
      user: user || null, 
      isLoading: isLoading && !!token, 
      login, 
      logout,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
