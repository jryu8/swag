"use client";
import { useEffect, useState } from "react";

type Log = {
  log_id: number;
  user_id?: number | null;
  admin_id?: number | null;
  log_type: string;
  action: string;
  status: string;
  ip_address?: string | null;
  created_at: string;
};

export default function AdminLogsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [count, setCount] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [logType, setLogType] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [userId, setUserId] = useState("");
  const [limit, setLimit] = useState(100);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('vc_admin_token') : null;
    if (!t) {
      if (typeof window !== 'undefined') window.location.href = '/admin/login';
      return;
    }
    setToken(t);
    void load(t);
  }, []);

  async function load(t: string) {
    setLoading(true); setStatusMsg("");
    try {
      const qs = new URLSearchParams();
      if (logType) qs.set('logType', logType);
      if (status) qs.set('status', status);
      if (startDate) qs.set('startDate', startDate);
      if (endDate) qs.set('endDate', endDate);
      if (userId) qs.set('userId', userId);
      if (limit) qs.set('limit', String(limit));
      const res = await fetch(`/api/admin/logs?${qs.toString()}`, { headers: { Authorization: `Bearer ${t}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load logs');
      setLogs(data.logs || []);
      setCount(data.count || 0);
    } catch (e:any) {
      setStatusMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function exportCsv() {
    if (!token) return;
    try {
      const qs = new URLSearchParams();
      if (startDate) qs.set('startDate', startDate);
      if (endDate) qs.set('endDate', endDate);
      const res = await fetch(`/api/admin/logs/export?${qs.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system_logs_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e:any) {
      setStatusMsg(e.message);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-8">
      <h1 className="mb-4 text-2xl font-semibold text-zinc-900">Admin · System Logs</h1>
      {statusMsg && <p className="mb-3 text-sm text-red-600">{statusMsg}</p>}

      <section className="mb-4 grid gap-3 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm md:grid-cols-6">
        <input placeholder="Log type (e.g. api_call, admin_action, error)" value={logType} onChange={(e)=>setLogType(e.target.value)} className="rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        <input placeholder="Status (e.g. success,error)" value={status} onChange={(e)=>setStatus(e.target.value)} className="rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        <input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} className="rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        <input placeholder="User ID (optional)" value={userId} onChange={(e)=>setUserId(e.target.value)} className="rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        <input type="number" min={1} max={1000} value={limit} onChange={(e)=>setLimit(Number(e.target.value)||100)} className="rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        <div className="md:col-span-6 flex gap-2">
          <button onClick={()=> token && load(token)} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">Apply Filters</button>
          <button onClick={exportCsv} className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-100">Export CSV</button>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-3 text-sm text-zinc-600">Showing {count} logs</div>
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-zinc-50 text-xs">
              <tr>
                <th className="px-2 py-1">Time</th>
                <th className="px-2 py-1">Type</th>
                <th className="px-2 py-1">Status</th>
                <th className="px-2 py-1">Action</th>
                <th className="px-2 py-1">User</th>
                <th className="px-2 py-1">Admin</th>
                <th className="px-2 py-1">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.log_id} className="border-t border-zinc-100">
                  <td className="px-2 py-1 text-zinc-600">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="px-2 py-1">{l.log_type}</td>
                  <td className="px-2 py-1">{l.status}</td>
                  <td className="px-2 py-1 text-zinc-700">{l.action}</td>
                  <td className="px-2 py-1">{l.user_id ?? ''}</td>
                  <td className="px-2 py-1">{l.admin_id ?? ''}</td>
                  <td className="px-2 py-1">{l.ip_address ?? ''}</td>
                </tr>
              ))}
              {logs.length===0 && (
                <tr><td colSpan={7} className="px-2 py-6 text-center text-sm text-zinc-500">No logs for the selected filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
