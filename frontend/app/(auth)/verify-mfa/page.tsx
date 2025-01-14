import { Suspense } from "react";
import { VerifyMfa } from "./_components/verify-mfa";

interface VerifyMfaPageProps {
  searchParams: {
    email: string | null;
  };
}

export default function VerifyMfaPage({ searchParams }: VerifyMfaPageProps) {
  const { email } = searchParams;
  return (
    <Suspense>
      <VerifyMfa email={email} />
    </Suspense>
  );
}
