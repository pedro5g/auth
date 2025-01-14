"use client";
import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { revokeMFAMutationFn } from "@/lib/api/api";
import { toast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";

export const RevokeMfa = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: revokeMFAMutationFn,
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ["auth-user"],
      });
      toast({
        title: "Success",
        description: response.message,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClick = useCallback(() => {
    mutate();
  }, [mutate]);

  return (
    <Button
      disabled={isPending}
      className="h-[35px] !text-[#c40006d3] !bg-red-100 shadow-none mr-1"
      onClick={handleClick}>
      {isPending && <Loader className="animate-spin" />}
      Revoke Access
    </Button>
  );
};
