"use client";
import { useEffect, useState } from "react";

type Category = {
  taxonomy_id: number;
  category_name: string;
  is_active: boolean;
  parent_category_id?: number | null;
  description?: string | null;
};

export default function AdminTaxonomyPage() {
  const [token, setToken] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);

  // add form
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [desc, setDesc] = useState("");

  // edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editParentId, setEditParentId] = useState<string>("");
  const [editDesc, setEditDesc] = useState("");
  const [editActive, setEditActive] = useState(true);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('vc_admin_token') : null;
    if (t) {
      setToken(t);
      void load(t);
    } else {
      if (typeof window !== 'undefined') window.location.href = '/admin/login';
    }
  }, []);

  async function load(t: string) {
    setStatus("");
    try {
      const qs = new URLSearchParams();
      if (includeInactive) qs.set('includeInactive', 'true');
      const res = await fetch(`/api/admin/taxonomy?${qs.toString()}`, { headers: { Authorization: `Bearer ${t}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load categories');
      setCategories(data.taxonomy || []);
    } catch (e:any) {
      setStatus(e.message);
    }
  }

  async function addCategory() {
    if (!token || !name.trim()) return;
    setStatus("");
    try {
      const res = await fetch('/api/admin/taxonomy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ categoryName: name.trim(), parentCategoryId: parentId ? Number(parentId) : null, description: desc })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add category');
      setName(""); setParentId(""); setDesc("");
      await load(token);
    } catch (e:any) { setStatus(e.message); }
  }

  function startEdit(c: Category) {
    setEditingId(c.taxonomy_id);
    setEditName(c.category_name);
    setEditParentId(c.parent_category_id ? String(c.parent_category_id) : "");
    setEditDesc(c.description || "");
    setEditActive(!!c.is_active);
  }

  async function saveEdit() {
    if (!token || editingId == null) return;
    setStatus("");
    try {
      const res = await fetch(`/api/admin/taxonomy/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ categoryName: editName, parentCategoryId: editParentId ? Number(editParentId) : null, description: editDesc, isActive: editActive })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      setEditingId(null);
      await load(token);
    } catch (e:any) { setStatus(e.message); }
  }

  async function deleteCategory(id: number) {
    if (!token) return;
    setStatus("");
    try {
      const res = await fetch(`/api/admin/taxonomy/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      await load(token);
    } catch (e:any) { setStatus(e.message); }
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-8">
      <h1 className="mb-4 text-2xl font-semibold text-zinc-900">Admin · Clothing Taxonomy</h1>
      {status && <p className="mb-3 text-sm text-red-600">{status}</p>}

      <section className="mb-4 flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input type="checkbox" checked={includeInactive} onChange={(e)=>{ setIncludeInactive(e.target.checked); if(token) void load(token); }} />
          Include inactive
        </label>
        <button onClick={()=> token && load(token)} className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">Refresh</button>
      </section>

      <section className="mb-6 grid gap-3 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm md:grid-cols-4">
        <input placeholder="Category name" value={name} onChange={(e)=>setName(e.target.value)} className="rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        <select value={parentId} onChange={(e)=>setParentId(e.target.value)} className="rounded-md border border-zinc-300 px-3 py-2 text-sm">
          <option value="">No parent</option>
          {categories.map(c => <option key={c.taxonomy_id} value={c.taxonomy_id}>{c.category_name}</option>)}
        </select>
        <input placeholder="Description (optional)" value={desc} onChange={(e)=>setDesc(e.target.value)} className="rounded-md border border-zinc-300 px-3 py-2 text-sm" />
        <button onClick={addCategory} className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">Add</button>
      </section>

      <section className="grid grid-cols-1 gap-3">
        {categories.map(c => (
          <div key={c.taxonomy_id} className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
            {editingId === c.taxonomy_id ? (
              <div className="grid gap-2 md:grid-cols-5">
                <input value={editName} onChange={(e)=>setEditName(e.target.value)} className="rounded-md border border-zinc-300 px-2 py-1" />
                <select value={editParentId} onChange={(e)=>setEditParentId(e.target.value)} className="rounded-md border border-zinc-300 px-2 py-1">
                  <option value="">No parent</option>
                  {categories.filter(x => x.taxonomy_id !== c.taxonomy_id).map(x => <option key={x.taxonomy_id} value={x.taxonomy_id}>{x.category_name}</option>)}
                </select>
                <input value={editDesc} onChange={(e)=>setEditDesc(e.target.value)} className="rounded-md border border-zinc-300 px-2 py-1" />
                <label className="flex items-center gap-2"><input type="checkbox" checked={editActive} onChange={(e)=>setEditActive(e.target.checked)} /> Active</label>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="rounded-md bg-blue-600 px-3 py-1 text-white">Save</button>
                  <button onClick={()=>setEditingId(null)} className="rounded-md border border-zinc-300 px-3 py-1">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-zinc-900">{c.category_name} {!c.is_active && <span className="ml-1 rounded bg-zinc-200 px-1 text-[10px]">inactive</span>}</div>
                  <div className="text-xs text-zinc-500">{c.description || '—'}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>startEdit(c)} className="rounded-md border border-zinc-300 px-3 py-1">Edit</button>
                  <button onClick={()=>deleteCategory(c.taxonomy_id)} className="rounded-md border border-red-300 bg-red-50 px-3 py-1 text-red-700">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {categories.length===0 && <p className="text-sm text-zinc-600">No categories yet.</p>}
      </section>
    </div>
  );
}
