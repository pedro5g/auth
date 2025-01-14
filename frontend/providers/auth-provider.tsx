"use client";
import { useAuth } from "@/hooks/use-auth";
import { UserType } from "@/lib/api/types";
import { createContext, useContext } from "react";

type AuthContextType = {
  user?: UserType;
  error: unknown;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const { data, error, isLoading, isFetching, refetch } = useAuth();
  const user = data?.user;
  const value = {
    user,
    error,
    isLoading,
    isFetching,
    refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuhContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within a AuthProvider");
  }
  return context;
};
