"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { Role } from "@/lib/types";
import {
  AuthUser,
  LoginData,
  SignupData,
  login as apiLogin,
  signup as apiSignup,
  getMe,
} from "@/lib/authApi";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  role: Role;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<AuthUser>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "khoj_auth_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    getMe(storedToken)
      .then((res) => {
        setUser(res.user);
        setToken(storedToken);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setToken(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(async (data: LoginData) => {
    const res = await apiLogin(data);
    localStorage.setItem(TOKEN_KEY, res.token);
    setUser(res.user);
    setToken(res.token);
    return res.user;
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    const res = await apiSignup(data);
    localStorage.setItem(TOKEN_KEY, res.token);
    setUser(res.user);
    setToken(res.token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
  }, []);

  // Derive role matching frontend's Role type ("user" | "organizer" | "admin")
  const role: Role = user ? (user.role.toLowerCase() as Role) : "user";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

// Re-export useRole for backwards compatibility with any remaining views
export function useRole() {
  const { role, user, logout } = useAuth();
  return {
    role,
    setRole: () => {
      console.warn("setRole is deprecated; roles are now derived from authentication state.");
    },
    user,
    logout,
  };
}
