"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, getAccessToken, setAccessToken, type Cart, type User } from "@/lib/api";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  cartCount: number;
  refreshCart: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = useCallback(async () => {
    if (!getAccessToken()) {
      setCartCount(0);
      return;
    }
    try {
      const cart = await apiFetch<Cart>("/cart/");
      setCartCount(cart.items.reduce((count, item) => count + item.quantity, 0));
    } catch {
      // The shared API client clears expired sessions on 401.
    }
  }, []);

  const refreshSession = useCallback(async () => {
    await Promise.resolve();
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setCartCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const profile = await apiFetch<User>("/auth/profile");
      setUser(profile);
      await refreshCart();
    } catch {
      setUser(null);
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  }, [refreshCart]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refreshSession(), 0);
    window.addEventListener("agentic-auth-change", refreshSession);
    window.addEventListener("storage", refreshSession);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("agentic-auth-change", refreshSession);
      window.removeEventListener("storage", refreshSession);
    };
  }, [refreshSession]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    cartCount,
    refreshCart,
    logout: () => setAccessToken(null),
  }), [user, loading, cartCount, refreshCart]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
