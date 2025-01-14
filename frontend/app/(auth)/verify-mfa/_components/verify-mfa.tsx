"use client";
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { ArrowRight, Loader } from "lucide-react";
import { Logo } from "@/components/logo";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { verifyMFALoginMutationFn } from "@/lib/api/api";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

interface VerifyMfaProps {
  email: string | null;
}

const formSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

type VeryMfaFormSchema = z.infer<typeof formSchema>;

export const VerifyMfa = ({ email }: VerifyMfaProps) => {
  const { replace } = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: verifyMFALoginMutationFn,
  });

  const form = useForm<VeryMfaFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pin: "",
    },
  });

  const onSubmit = async (values: VeryMfaFormSchema) => {
    if (!email) {
      replace("/");
      return;
    }
    const data = {
      code: values.pin,
      email: email,
    };
    mutate(data, {
      onSuccess: (response) => {
        replace("/home");
        toast({
          title: "Success",
          description: response?.message,
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
  };

  return (
    <main className="w-full min-h-[590px] h-full max-w-full flex items-center justify-center ">
      <div className="w-full h-full p-5 rounded-md">
        <Logo />

        <h1
          className="text-xl tracking-[-0.16px] dark:text-[#fcfdffef] font-bold mt-8
        text-center sm:text-left">
          Multi-Factor Authentication
        </h1>
        <p className="mb-6 text-center sm:text-left text-[15px] dark:text-[#f1f7feb5] font-normal">
          Enter the code from your authenticator app.
        </p>

        <div className="mt-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full mt-6 flex flex-col gap-4 ">
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm mb-1 font-normal">
                      One-time code
                    </FormLabel>
                    <FormControl>
                      <InputOTP
                        className="!text-lg flex items-center"
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS}
                        {...field}
                        style={{ justifyContent: "center" }}>
                        <InputOTPGroup autoFocus>
                          <InputOTPSlot
                            index={0}
                            className="!w-14 !h-12 !text-lg"
                          />
                          <InputOTPSlot
                            index={1}
                            className="!w-14 !h-12 !text-lg"
                          />
                        </InputOTPGroup>
                        <InputOTPGroup>
                          <InputOTPSlot
                            index={2}
                            className="!w-14 !h-12 !text-lg"
                          />
                          <InputOTPSlot
                            index={3}
                            className="!w-14 !h-12 !text-lg"
                          />
                        </InputOTPGroup>
                        <InputOTPGroup>
                          <InputOTPSlot
                            index={4}
                            className="!w-14 !h-12 !text-lg"
                          />
                          <InputOTPSlot
                            index={5}
                            className="!w-14 !h-12 !text-lg"
                          />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={isPending} className="w-full h-[40px] mt-2">
                {isPending && <Loader className="animate-spin" />}
                Continue
                <ArrowRight />
              </Button>
            </form>
          </Form>
        </div>

        <Button variant="ghost" className="w-full text-[15px] mt-2 h-[40px]">
          <Link href={"/"}>Return to sign in</Link>
        </Button>
      </div>
    </main>
  );
};
