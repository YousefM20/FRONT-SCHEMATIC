import { createContext, useContext, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getToken, setToken } from "./api";

type Ctx = { loggedIn: boolean; signIn: (token: string) => void; signOut: () => void };

const AuthCtx = createContext<Ctx>({ loggedIn: false, signIn: () => {}, signOut: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTok] = useState<string | null>(getToken());

  const signIn = (t: string) => {
    setToken(t);
    setTok(t);
  };
  const signOut = () => {
    setToken(null);
    setTok(null);
  };

  return <AuthCtx.Provider value={{ loggedIn: !!token, signIn, signOut }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { loggedIn } = useAuth();
  if (!loggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}