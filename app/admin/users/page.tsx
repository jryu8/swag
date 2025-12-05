// app/admin/users/page.tsx  (Next.js App Router)
"use client";
import { useEffect, useState } from "react";

type Row = { id: number; name: string | null; email: string; created_at: string };

export default function AdminUsers() {
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/debug/users", { cache: "no-store" });
        const ct = res.headers.get("content-type") || "";
        const isJson = ct.includes("application/json");
        const data = isJson ? await res.json() : await res.text();
        if (!res.ok) throw new Error(isJson ? (data?.error || "Failed") : String(data));
        setRows(data as Row[]);
      } catch (e: any) {
        setErr(e.message || "Failed to load users");
      }
    })();
  }, []);

  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold">Users (DB)</h1>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-50">
            <tr>
              <th className="border px-3 py-2 text-left">ID</th>
              <th className="border px-3 py-2 text-left">Name</th>
              <th className="border px-3 py-2 text-left">Email</th>
              <th className="border px-3 py-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td className="border px-3 py-2">{r.id}</td>
                <td className="border px-3 py-2">{r.name ?? "—"}</td>
                <td className="border px-3 py-2">{r.email}</td>
                <td className="border px-3 py-2">{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="px-3 py-6 text-center" colSpan={4}>No users yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
