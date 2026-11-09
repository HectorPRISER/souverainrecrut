import {
  createContext,
  useEffect,
  useState,
} from "react";

import api from "../api/axios";

import { storage } from "../utils/storage";
import { authService } from "../services/auth.service";

import type {
  AuthContextType,
  User,
} from "../types/auth.types";

export const AuthContext =
  createContext<AuthContextType>(
    {} as AuthContextType
  );

interface Props {
  children: React.ReactNode;
}

export default function AuthProvider({
  children,
}: Props) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [token, setToken] =
    useState<string | null>(
      storage.getToken()
    );

  useEffect(() => {
    const initialize = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      api.defaults.headers.common.Authorization =
        `Bearer ${token}`;

      try {
        const response =
          await authService.me();

        setUser(response.data);
      } catch {
        storage.removeToken();

        setToken(null);

        delete api.defaults.headers.common.Authorization;
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [token]);

  async function login(
    email: string,
    password: string
  ) {
    const response =
      await authService.login({
        email,
        password,
      });

    storage.setToken(response.data.token);

    api.defaults.headers.common.Authorization =
      `Bearer ${response.data.token}`;

    setToken(response.data.token);

    setUser(response.data.user);
  }

  function logout() {
    storage.removeToken();

    delete api.defaults.headers.common.Authorization;

    setUser(null);

    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}