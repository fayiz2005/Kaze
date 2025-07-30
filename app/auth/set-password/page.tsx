
import { Suspense } from "react";
import SetPasswordClient from "./SetPasswordClient";

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
      <SetPasswordClient />
    </Suspense>
  );
}
