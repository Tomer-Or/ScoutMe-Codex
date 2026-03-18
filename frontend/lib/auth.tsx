"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

import type { AuthResponse, User } from "@/lib/types";

const STORAGE_KEY = "scoutme-auth";

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (auth: AuthResponse | null) => void;
  isReady: boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as AuthResponse;
      setToken(parsed.access_token);
      setUser(parsed.user);
    }
    setIsReady(true);
  }, []);

  const value = {
    token,
    user,
    isReady,
    setAuth(auth: AuthResponse | null) {
      if (!auth) {
        window.localStorage.removeItem(STORAGE_KEY);
        setToken(null);
        setUser(null);
        return;
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
      setToken(auth.access_token);
      setUser(auth.user);
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
