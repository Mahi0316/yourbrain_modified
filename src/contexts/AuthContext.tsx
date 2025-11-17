import React, { createContext, useContext, useEffect, useState } from "react";
import {
  studentLogin,
  studentRegister,
  teacherLogin,
  teacherRegister,
} from "../api/auth";

interface AuthContextType {
  user: any;
  role: "student" | "teacher" | null;
  loading: boolean;
  signInStudent: (email: string, password: string) => Promise<any>;
  signInTeacher: (email: string, password: string) => Promise<any>;
  signUpStudent: (name: string, email: string, password: string) => Promise<any>;
  signUpTeacher: (name: string, email: string, password: string) => Promise<any>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<"student" | "teacher" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedRole = localStorage.getItem("role");

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedRole) setRole(savedRole as any);

    setLoading(false);
  }, []);

  const signInStudent = async (email: string, password: string) => {
    try {
      const res = await studentLogin({ email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("role", "student");

      setUser(res.data.user);
      setRole("student");

      return res.data;
    } catch (err: any) {
      return { error: err.response?.data?.message || err.message };
    }
  };

  const signInTeacher = async (email: string, password: string) => {
    try {
      const res = await teacherLogin({ email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("role", "teacher");

      setUser(res.data.user);
      setRole("teacher");

      return res.data;
    } catch (err: any) {
      return { error: err.response?.data?.message || err.message };
    }
  };

  const signUpStudent = async (name: string, email: string, password: string) => {
    try {
      return (await studentRegister({ name, email, password })).data;
    } catch (err: any) {
      return { error: err.response?.data?.message || err.message };
    }
  };

  const signUpTeacher = async (name: string, email: string, password: string) => {
    try {
      return (await teacherRegister({ name, email, password })).data;
    } catch (err: any) {
      return { error: err.response?.data?.message || err.message };
    }
  };

  const signOut = () => {
    localStorage.clear();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        signInStudent,
        signInTeacher,
        signUpStudent,
        signUpTeacher,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
