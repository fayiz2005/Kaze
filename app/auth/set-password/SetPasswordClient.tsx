
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function SetPasswordClient() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const token = useSearchParams().get("token");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    const res = await fetch("/api/auth/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-xl font-bold mb-4">Set Your Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">Password set! Redirecting...</p>}
        <button className="bg-[#5C4A2B] text-white px-4 py-2 rounded cursor-pointer" type="submit">
          Set Password
        </button>
      </form>
    </div>
  );
}
