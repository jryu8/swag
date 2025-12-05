// app/register/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

 async function onSubmit(e: React.FormEvent) {
  e.preventDefault();
  setStatus(null);
  setLoading(true);

  try {
    const payload = { name, email, password };

    // If your frontend proxies /api/* to the backend, this can just be "/api/auth/register"
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setStatus(
        (data && (data.error || data.message)) ||
          "Registration failed. Check your details and try again."
      );
      setLoading(false);
      return;
    }

    // success – either redirect to login or dashboard
    setStatus(null);
    setLoading(false);
    router.push("/login"); // or "/dashboard" if your backend logs them in
  } catch (err: any) {
    console.error("Register error:", err);
    setStatus(err?.message || "Registration failed.");
    setLoading(false);
  }
}


  return (
    <main className="min-h-screen bg-[#f6eadf] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-sm px-6 py-7">
        <p className="text-xs uppercase tracking-[0.14em] text-[#a08975] mb-2">
          Create account
        </p>
        <h1 className="text-2xl font-semibold text-[#1f130a] mb-4">
          Join your digital closet
        </h1>
        <p className="text-sm text-[#6c5a4a] mb-5">
          Sign up to upload pieces, favorite outfits, and get suggestions from
          the AI stylist.
        </p>

        <form onSubmit={onSubmit} className="space-y-3 text-sm">
          <div>
            <label className="block text-xs text-[#8f7a66] mb-1">
              Name
            </label>
            <input
              className="w-full rounded-lg border border-[#e1d2c3] bg-[#fdf8f1] px-3 py-2 text-[#1f130a] placeholder-[#b9a493] focus:outline-none focus:ring-1 focus:ring-[#b46a2a]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8f7a66] mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-[#e1d2c3] bg-[#fdf8f1] px-3 py-2 text-[#1f130a] placeholder-[#b9a493] focus:outline-none focus:ring-1 focus:ring-[#b46a2a]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8f7a66] mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-[#e1d2c3] bg-[#fdf8f1] px-3 py-2 text-[#1f130a] placeholder-[#b9a493] focus:outline-none focus:ring-1 focus:ring-[#b46a2a]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {status && (
            <p className="text-xs text-red-600 mt-1">{status}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full bg-[#1f130a] text-white py-2.5 text-sm font-medium hover:bg-[#3b2816] disabled:opacity-60 transition-colors"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-[11px] text-[#8f7a66]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#b46a2a] underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
