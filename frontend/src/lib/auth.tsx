"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile, AuthResponse } from "./api/types";
import { postJson, fetchJson } from "./api/client";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, ageRange?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("hg_access_token");

    if (storedToken) {
      setToken(storedToken);
      fetchJson<UserProfile | null>("/auth/me", null)
        .then((u) => {
          if (u) {
            setUser(u);
          } else {
            logout();
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await postJson<AuthResponse, any>("/auth/login", { email, password: pass });
      localStorage.setItem("hg_access_token", res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, pass: string, name: string, ageRange = "adult") => {
    setIsLoading(true);
    try {
      const res = await postJson<AuthResponse, any>("/auth/register", {
        email,
        password: pass,
        name,
        full_name: name,
        age_range: ageRange
      });
      localStorage.setItem("hg_access_token", res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("hg_access_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
