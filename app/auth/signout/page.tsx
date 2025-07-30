'use client';

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    // Sign out and redirect to /login after sign out
    signOut({ callbackUrl: "/auth/login" });
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Signing you out...</p>
    </div>
  );
}
