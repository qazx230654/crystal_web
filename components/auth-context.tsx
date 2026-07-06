"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

type Member = {
  profile: {
    email: string;
    id: string;
    line_id?: string | null;
    name?: string | null;
    phone?: string | null;
  } | null;
  user: {
    email?: string;
    id: string;
  };
};

type AuthContextValue = {
  loading: boolean;
  logout: () => Promise<void>;
  member: Member | null;
  refreshMember: () => Promise<Member | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshMember() {
    const response = await fetch("/api/auth/me", { cache: "no-store" });

    if (!response.ok) {
      setMember(null);
      setLoading(false);
      return null;
    }

    const payload = await response.json();
    setMember(payload.data);
    setLoading(false);

    return payload.data as Member | null;
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMember(null);
  }

  useEffect(() => {
    refreshMember();
  }, []);

  const value = useMemo(() => ({ loading, logout, member, refreshMember }), [loading, member]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");

  return value;
}
