"use client";
import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin1234!");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setStatus(""); setLoading(true);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      if (typeof window !== 'undefined') {
        localStorage.setItem('vc_admin_token', data.token);
      }
      setStatus('Login successful');
      window.location.href = '/dashboard';
    } catch (e:any) {
      setStatus(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900">Admin Login</h1>
      {status && <p className="mb-4 text-sm text-zinc-700">{status}</p>}

      <div className="max-w-md rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-3">
          <label className="mb-1 block text-sm text-zinc-700">Email</label>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" />
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-sm text-zinc-700">Password</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" />
        </div>
        <button onClick={login} disabled={loading} className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">{loading ? 'Signing in...' : 'Sign in'}</button>
      </div>
    </div>
  );
}
