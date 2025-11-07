// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  user: any;
  loading: boolean;
  signUp: (email: string, password: string, role?: string) => Promise<{ error?: any }>;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If supabase is stubbed, its onAuthStateChange will be a safe no-op
    const { data } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Try to get current user (v2 style)
    (async () => {
      try {
        const res = await supabase.auth.getUser?.();
        setUser(res?.data?.user ?? null);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      try {
        data?.subscription?.unsubscribe();
      } catch {
        // ignore
      }
    };
  }, []);

  const signUp = async (email: string, password: string, role = "student") => {
    try {
      // supabase v2 signUp
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        // you can add user_metadata with role if needed: options
      } as any);
      if (!error) setUser(data?.user ?? null);
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      } as any);
      if (!error) setUser(data?.user ?? null);
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
