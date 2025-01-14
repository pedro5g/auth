"use client";

import { getUserSessionQueryFn } from "@/lib/api/api";
import { useQuery } from "@tanstack/react-query";

export const useAuth = () => {
  const query = useQuery({
    queryKey: ["auth-user"],
    queryFn: getUserSessionQueryFn,
    staleTime: Infinity,
  });

  return query;
};
