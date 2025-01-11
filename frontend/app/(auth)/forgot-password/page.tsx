import { Suspense } from "react";
import { ForgotPasswordForm } from "./_components/forgot-password-form";

interface ForgotPasswordParams {
  searchParams: {
    email?: string;
  };
}

export default function ForgotPassword({ searchParams }: ForgotPasswordParams) {
  const { email } = searchParams;

  return (
    <Suspense>
      <ForgotPasswordForm email={email} />
    </Suspense>
  );
}
