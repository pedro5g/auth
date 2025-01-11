import { Suspense } from "react";
import { ResetPasswordForm } from "./_components/reset-password-form";

interface ResetPasswordParams {
  searchParams: {
    code: string;
    exp: string;
  };
}

export default function ResetPassword({ searchParams }: ResetPasswordParams) {
  const { code, exp } = searchParams;
  return (
    <Suspense>
      <ResetPasswordForm code={code} exp={exp} />
    </Suspense>
  );
}
