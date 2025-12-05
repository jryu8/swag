// app/admin/login/page.tsx
// app/admin/login/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin1234!");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus(null);

    // fake demo auth – no backend
    setLoading(true);
    try {
      if (email === "admin@example.com" && password === "Admin1234!") {
        // pretend login succeeded, go to admin dashboard
        router.push("/admin");
      } else {
        setStatus("Invalid admin credentials (demo: admin@example.com / Admin1234!)");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f6eadf]">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-10">
        <header>
          <h1 className="text-3xl font-semibold text-[#1f130a]">Admin Login</h1>
          <p className="mt-2 text-sm text-[#6c5a4a]">
            Demo login for the S.W.A.G. admin dashboard. This does not use real
            authentication yet.
          </p>
        </header>

        {status && (
          <div className="rounded-2xl bg-[#fbe4df] px-4 py-3 text-sm text-[#b0463c] shadow-sm">
            {status}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-6 shadow-sm"
        >
          <div className="mb-4">
            <label className="mb-1 block text-sm text-[#4f3c2c]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-[#e1d2c3] bg-[#f9f1e6] px-3 py-2 text-sm text-[#1f130a] focus:outline-none focus:ring-2 focus:ring-[#c2894f]/50"
            />
          </div>
          <div className="mb-6">
            <label className="mb-1 block text-sm text-[#4f3c2c]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-[#e1d2c3] bg-[#f9f1e6] px-3 py-2 text-sm text-[#1f130a] focus:outline-none focus:ring-2 focus:ring-[#c2894f]/50"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#b46a2a] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9a5620] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <p className="mt-3 text-[11px] text-[#8f7a66]">
            Demo credentials: <strong>admin@example.com</strong> /{" "}
            <strong>Admin1234!</strong>
          </p>
        </form>
      </div>
    </main>
  );
}
