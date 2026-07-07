"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile, AuthResponse } from "./api/types";
import { postJson, fetchJson } from "./api/client";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isGuest: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, ageRange?: string) => Promise<void>;
  logout: () => void;
  enableGuestDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_USER: UserProfile = {
  id: "default_user",
  name: "Guest Demo User",
  email: "guest@healthguard.ai",
  age_range: "adult",
  sex: "unspecified",
  language: "en"
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("hg_access_token");
    const guestMode = localStorage.getItem("hg_guest_mode");

    if (storedToken) {
      setToken(storedToken);
      fetchJson<UserProfile | null>("/auth/me", null)
        .then((u) => {
          if (u) {
            setUser(u);
            setIsGuest(false);
          } else {
            // Token invalid or expired, fall back to guest
            enableGuestDemo();
          }
        })
        .finally(() => setIsLoading(false));
    } else if (guestMode === "true" || !storedToken) {
      setUser(GUEST_USER);
      setIsGuest(true);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await postJson<AuthResponse, any>("/auth/login", { email, password: pass });
      localStorage.setItem("hg_access_token", res.access_token);
      localStorage.removeItem("hg_guest_mode");
      setToken(res.access_token);
      setUser(res.user);
      setIsGuest(false);
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
      localStorage.removeItem("hg_guest_mode");
      setToken(res.access_token);
      setUser(res.user);
      setIsGuest(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("hg_access_token");
    localStorage.removeItem("hg_guest_mode");
    setToken(null);
    setUser(null);
    setIsGuest(false);
  };

  const enableGuestDemo = () => {
    localStorage.removeItem("hg_access_token");
    localStorage.setItem("hg_guest_mode", "true");
    setToken(null);
    setUser(GUEST_USER);
    setIsGuest(true);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, isGuest, login, register, logout, enableGuestDemo }}
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
