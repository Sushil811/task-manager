"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      
      // If no token and trying to access a protected route
      if (!token) {
        if (!pathname.startsWith("/login") && !pathname.startsWith("/signup") && pathname !== "/" && !pathname.startsWith("/oauth-callback")) {
          router.push("/login");
        }
        setLoading(false);
        return;
      }

      try {
        // Verify token and get user profile
        const res = await apiFetch("/auth/me");
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          // Token invalid or expired
          localStorage.removeItem("token");
          if (!pathname.startsWith("/login") && !pathname.startsWith("/signup") && pathname !== "/" && !pathname.startsWith("/oauth-callback")) {
            router.push("/login");
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
