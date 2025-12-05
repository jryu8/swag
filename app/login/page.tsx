"use client";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("vc_email") : null;
    if (stored) setEmail(stored);
  }, []);

  function validate(): string | null {
    if (!email) return "Email is required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Enter a valid email";
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const err = validate();
    if (err) {
      setMessage(err);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      if (data.token) {
        localStorage.setItem("vc_token", data.token);
        if (remember) localStorage.setItem("vc_email", email);
      }
      setMessage("Success! Redirecting...");
      setTimeout(() => {
        window.location.href = "/outfits";
      }, 600);
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-lg">
        <h1 className="mb-2 text-2xl font-semibold text-zinc-900">Welcome back</h1>
        <p className="mb-6 text-sm text-zinc-600">Sign in to your Virtual Closet</p>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-700">Email</label>
            <input
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 shadow-sm focus:outline-none"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-700">Password</label>
            <div className="flex items-stretch gap-2">
              <input
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 shadow-sm focus:outline-none"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="rounded-md border border-zinc-300 px-3 text-sm text-zinc-700 hover:bg-zinc-100">
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>
            <a href="#" className="text-sm text-blue-700 underline underline-offset-4 hover:text-blue-900">Forgot password?</a>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`rounded-md px-4 py-2 text-white ${loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          {message && <p className="text-sm text-zinc-700">{message}</p>}
        </form>
        <div className="mt-6 text-center text-sm text-zinc-700">
          New here? <a href="/" className="font-medium text-blue-700 underline underline-offset-4">Create an account</a>
        </div>
        <div className="mt-2 text-center text-xs text-zinc-600">
          Admin? <a href="/admin/login" className="font-medium text-blue-700 underline underline-offset-4">Go to admin login</a>
        </div>
      </div>
    </div>
  );
}
