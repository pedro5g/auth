import { Suspense } from "react";
import { ConfirmAccount } from "./_components/confirm-account";

interface ConfirmAccountParams {
  searchParams: {
    code: string | null;
  };
}

export default function ConfirmAccountPage({
  searchParams,
}: ConfirmAccountParams) {
  const { code } = searchParams;
  return (
    <Suspense>
      <ConfirmAccount code={code} />
    </Suspense>
  );
}
