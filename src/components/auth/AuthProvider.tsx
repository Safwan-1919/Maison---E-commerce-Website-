"use client";

import { useEffect, useState, createContext, useContext, useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; name: string; password: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true);
      return;
    }
    if (session?.user) {
      setUser({
        id: (session.user as any).id,
        email: session.user.email || "",
        name: session.user.name,
        role: (session.user as any).role || "user",
      });
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, [session, status]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        return { success: false, error: "Invalid email or password" };
      }
      await update();
      return { success: true };
    } catch {
      return { success: false, error: "Something went wrong" };
    }
  }, [update]);

  const register = useCallback(async (data: { email: string; name: string; password: string; phone?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        const loginRes = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });
        if (loginRes?.error) {
          return { success: true, error: "Account created. Please sign in." };
        }
        await update();
        return { success: true };
      }
      return { success: false, error: result.message || result.error || "Registration failed" };
    } catch {
      return { success: false, error: "Something went wrong" };
    }
  }, [update]);

  const logout = useCallback(async () => {
    await signOut({ callbackUrl: "/" });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}