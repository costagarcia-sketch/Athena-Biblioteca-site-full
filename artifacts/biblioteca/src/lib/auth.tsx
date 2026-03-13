import React, { useEffect, useState } from "react";
import { useGetMe } from "@workspace/api-client-react";
import type { LoginResponse } from "@workspace/api-client-react";
import { AuthContext } from "./auth-context";

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
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
