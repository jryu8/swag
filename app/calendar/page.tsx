"use client";
import { useEffect, useState } from "react";

type Outfit = {
  outfit_id: number;
  outfit_name: string | null;
};

type CalendarEntry = {
  calendar_id: number;
  outfit_id: number;
  planned_date: string;
  event_name?: string | null;
  event_type?: string | null;
  outfit_name?: string | null;
  items?: Array<{ item_id: number; item_name?: string | null; image_url: string; }>;
};

export default function CalendarPage() {
  const [token, setToken] = useState<string | null>(null);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [status, setStatus] = useState("");

  // form
  const [selectedOutfit, setSelectedOutfit] = useState<number | "">("");
  const [date, setDate] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("");

  // filters
  const now = new Date();
  const [month, setMonth] = useState<string>(String(now.getMonth() + 1).padStart(2, '0'));
  const [year, setYear] = useState<string>(String(now.getFullYear()));

  // inline edit
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDate, setEditDate] = useState<string>("");
  const [editName, setEditName] = useState<string>("");
  const [editType, setEditType] = useState<string>("");

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("vc_token") : null;
    if (t) {
      setToken(t);
      void fetchOutfits(t);
      void fetchEntries(t);
    }
  }, []);

  async function fetchOutfits(t: string) {
    try {
      const res = await fetch(`/api/outfit`, { headers: { Authorization: `Bearer ${t}` } });
      const data = await res.json();
      if (res.ok) setOutfits((data.outfits || []).map((o: any) => ({ outfit_id: o.outfit_id, outfit_name: o.outfit_name })));
    } catch {}
  }

  async function fetchEntries(t: string) {
    try {
      const params = new URLSearchParams();
      if (month) params.set('month', String(Number(month))); // backend expects numeric
      if (year) params.set('year', year);
      const res = await fetch(`/api/calendar?${params.toString()}`, { headers: { Authorization: `Bearer ${t}` } });
      const data = await res.json();
      if (res.ok) setEntries(data.calendarEntries || []);
    } catch {}
  }

  async function schedule() {
    setStatus("");
    if (!token) { setStatus("Please login first."); return; }
    if (!selectedOutfit || !date) { setStatus("Pick an outfit and date."); return; }
    try {
      const res = await fetch(`/api/calendar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ outfitId: selectedOutfit, plannedDate: date, eventName, eventType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule");
      setStatus("Scheduled");
      setSelectedOutfit(""); setDate(""); setEventName(""); setEventType("");
      await fetchEntries(token);
    } catch (e: any) {
      setStatus(e.message);
    }
  }

  async function remove(id: number) {
    if (!token) return;
    try {
      const res = await fetch(`/api/calendar/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      await fetchEntries(token);
    } catch (e: any) {
      setStatus(e.message);
    }
  }

  function startEdit(e: CalendarEntry) {
    setEditingId(e.calendar_id);
    setEditDate(e.planned_date.slice(0,10));
    setEditName(e.event_name || "");
    setEditType(e.event_type || "");
  }

  async function saveEdit(id: number) {
    if (!token) return;
    try {
      const res = await fetch(`/api/calendar/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plannedDate: editDate, eventName: editName, eventType: editType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      setEditingId(null);
      await fetchEntries(token!);
    } catch (e: any) {
      setStatus(e.message);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900">Calendar Planner</h1>
      {status && <p className="mb-4 text-sm text-zinc-700">{status}</p>}

      <section className="mb-4 flex flex-wrap gap-2">
        <select value={month} onChange={(e)=>setMonth(e.target.value)} className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm">
          {Array.from({length:12},(_,i)=>({v:String(i+1).padStart(2,'0'), l:new Date(0,i).toLocaleString(undefined,{month:'long'})})).map(m => (
            <option key={m.v} value={m.v}>{m.l}</option>
          ))}
        </select>
        <input value={year} onChange={(e)=>setYear(e.target.value)} className="w-24 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" />
        <button onClick={()=> token && fetchEntries(token)} className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">Apply</button>
      </section>

      <section className="mb-6 grid gap-3 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm md:grid-cols-5">
        <select value={selectedOutfit as any} onChange={(e)=>setSelectedOutfit(e.target.value ? Number(e.target.value) : "")} className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm">
          <option value="">Choose outfit</option>
          {outfits.map(o => (
            <option key={o.outfit_id} value={o.outfit_id}>{o.outfit_name || `Outfit #${o.outfit_id}`}</option>
          ))}
        </select>
        <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" />
        <input value={eventName} onChange={(e)=>setEventName(e.target.value)} placeholder="Event name (optional)" className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" />
        <input value={eventType} onChange={(e)=>setEventType(e.target.value)} placeholder="Event type (optional)" className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" />
        <div className="flex items-end">
          <button onClick={schedule} className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">Schedule</button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {entries.map((e) => (
          <div key={e.calendar_id} className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
            <div className="flex items-center justify-between">
              <div className="font-medium text-zinc-900">{e.outfit_name || `Outfit #${e.outfit_id}`}</div>
              <div className="text-xs text-zinc-600">{new Date(e.planned_date).toLocaleDateString()}</div>
            </div>
            {e.items && e.items.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {e.items.slice(0,4).map(it => (
                  <img key={it.item_id} src={(it.image_url || '').replace(/^\.\//,'/')} alt={it.item_name || 'Item'} className="h-12 w-12 rounded-md border border-zinc-200 object-cover" />
                ))}
              </div>
            )}
            {editingId === e.calendar_id ? (
              <div className="mt-3 grid gap-2 md:grid-cols-4">
                <input type="date" value={editDate} onChange={(ev)=>setEditDate(ev.target.value)} className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm" />
                <input value={editName} onChange={(ev)=>setEditName(ev.target.value)} placeholder="Event name" className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm" />
                <input value={editType} onChange={(ev)=>setEditType(ev.target.value)} placeholder="Event type" className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm" />
                <div className="flex gap-2">
                  <button onClick={()=>saveEdit(e.calendar_id)} className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">Save</button>
                  <button onClick={()=>setEditingId(null)} className="rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-800 hover:bg-zinc-100">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                {e.event_name && <div className="mt-1 text-zinc-700">Event: {e.event_name}</div>}
                {e.event_type && <div className="text-zinc-700">Type: {e.event_type}</div>}
                <div className="mt-3 flex gap-2">
                  <button onClick={()=>startEdit(e)} className="rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-800 hover:bg-zinc-100">Edit</button>
                  <button onClick={()=>remove(e.calendar_id)} className="rounded-md border border-red-300 bg-red-50 px-3 py-1 text-sm text-red-700 hover:bg-red-100">Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
        {entries.length===0 && <p className="text-sm text-zinc-600">No planned outfits yet.</p>}
      </section>
    </div>
  );
}
