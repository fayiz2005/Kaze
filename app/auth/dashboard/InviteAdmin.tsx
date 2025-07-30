"use client";

import { useState } from "react";

export default function InviteAdmin() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    try {
      const res = await fetch("/api/auth/send-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("Invite email sent successfully!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.message || "Failed to send invite.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An unexpected error occurred.");
    }
  };

  return (
    <div className="max-w-md py-10">
      <h1 className="text-2xl font-bold mb-6 text-[#5C4A2B]">Invite New Admin</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Admin's Email Address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
          className="w-full px-4 py-2 border border-[#5C4A2B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#5C4A2B]"
        />

        <button
          type="submit"
          disabled={status === "loading"}
          className={`w-full py-2 rounded-md text-white transition ${
            status === "loading"
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#5C4A2B] hover:bg-[#4a3b21] cursor-pointer"
          }`}
        >
          {status === "loading" ? "Sending..." : "Send Invite"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 font-semibold ${
            status === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
