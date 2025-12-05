"use client";
import { useEffect, useState, useMemo } from "react";

type Item = {
  item_id: number;
  item_name?: string | null;
  image_url: string;
  color?: string | null;
  season?: string | null;
  type?: string | null;
  category_name?: string | null;
};

type Tax = { taxonomy_id: number; category_name: string };

export default function ClothingPage() {
  const [token, setToken] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [count, setCount] = useState(0);
  const [taxonomy, setTaxonomy] = useState<Tax[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // quick add form
  const [imageUrl, setImageUrl] = useState("");
  const [itemName, setItemName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [type, setType] = useState("");
  const [color, setColor] = useState("");
  const [season, setSeason] = useState("all");
  const [tags, setTags] = useState("");

  // UI filters
  const [activeSeason, setActiveSeason] = useState<string>("all");
  const [activeCategory, setActiveCategory] = useState<string>("all");


  async function loadItems(t: string) {
    try {
      const res = await fetch("/api/clothing", { headers: { Authorization: `Bearer ${t}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load items");
      setItems(data.items || []);
      setCount(data.count || 0);
    } catch (e: any) {
      setStatus(e.message);
    }
  }

  async function loadTaxonomy(t: string) {
    try {
      const res = await fetch("/api/clothing/taxonomy", { headers: { Authorization: `Bearer ${t}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load taxonomy");
      setTaxonomy(data.taxonomy || []);
    } catch (e: any) {
      setStatus(e.message);
    }
  }

  async function quickAdd() {
    if (!token) return;
    setStatus("");
    setLoading(true);
    try {
      if (!imageUrl.trim()) throw new Error("Image URL is required");
      const body: any = {
        imageUrl: imageUrl.trim(),
        itemName: itemName.trim() || undefined,
        season,
        color: color || undefined,
      };
      if (categoryId) body.categoryId = Number(categoryId);
      if (type) body.type = type;
      if (tags.trim()) body.tags = tags.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await fetch("/api/clothing/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add item");
      setImageUrl("");
      setItemName("");
      setCategoryId("");
      setType("");
      setColor("");
      setSeason("all");
      setTags("");
      await loadItems(token);
    } catch (e: any) {
      setStatus(e.message);
    } finally {
      setLoading(false);
    }
  }

  // casual street-style fallback image
  const streetFallback =
    "https://images.unsplash.com/photo-1488161628813-04466f872be2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1964";
  const heroImage = useMemo(() => items[0]?.image_url || streetFallback, [items]);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const seasonOk = activeSeason === "all" || (it.season || "all") === activeSeason;
      const categoryOk =
        activeCategory === "all" ||
        String(it.category_name || "")?.toLowerCase() ===
          taxonomy.find((t) => String(t.taxonomy_id) === activeCategory)?.category_name?.toLowerCase();
      return seasonOk && categoryOk;
    });
  }, [items, activeSeason, activeCategory, taxonomy]);

  return (
    <div className="min-h-screen bg-[#F6F0E8] text-zinc-900">
      {/* Top bar (no logo, no nav) */}
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/70 border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-end">
          <div className="flex items-center gap-3">
            <a
              href="/upload"
              className="inline-flex items-center rounded-full border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100"
            >
              Upload
            </a>
            <details className="group relative">
              <summary className="list-none inline-flex items-center rounded-full bg-zinc-900 text-white px-4 py-2 text-sm cursor-pointer hover:bg-zinc-800">
                Quick Add
              </summary>
              <div className="absolute right-0 mt-3 w-[28rem] rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl">
                {status && <p className="mb-2 text-sm text-red-600">{status}</p>}
                <div className="grid gap-3">
                  <input placeholder="Image URL" value={imageUrl} onChange={(e)=>setImageUrl(e.target.value)} className="rounded-md border border-zinc-300 px-3 py-2 text-sm" />
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Item name (optional)" value={itemName} onChange={(e)=>setItemName(e.target.value)} className="rounded-md border border-zinc-300 px-3 py-2 text-sm" />
                    <input placeholder="Type (e.g., top, jacket)" value={type} onChange={(e)=>setType(e.target.value)} className="rounded-md border border-zinc-300 px-3 py-2 text-sm" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <select value={categoryId} onChange={(e)=>setCategoryId(e.target.value)} className="rounded-md border border-zinc-300 px-3 py-2 text-sm">
                      <option value="">Category</option>
                      {taxonomy.map(t => <option key={t.taxonomy_id} value={t.taxonomy_id}>{t.category_name}</option>)}
                    </select>
                    <input placeholder="Color" value={color} onChange={(e)=>setColor(e.target.value)} className="rounded-md border border-zinc-300 px-3 py-2 text-sm" />
                    <select value={season} onChange={(e)=>setSeason(e.target.value)} className="rounded-md border border-zinc-300 px-3 py-2 text-sm">
                      <option value="all">All seasons</option>
                      <option value="spring">Spring</option>
                      <option value="summer">Summer</option>
                      <option value="fall">Fall</option>
                      <option value="winter">Winter</option>
                    </select>
                  </div>
                  <input placeholder="Tags (comma separated)" value={tags} onChange={(e)=>setTags(e.target.value)} className="rounded-md border border-zinc-300 px-3 py-2 text-sm" />
                  <button onClick={quickAdd} disabled={loading} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50">
                    {loading ? "Adding..." : "Add item"}
                  </button>
                </div>
              </div>
            </details>
          </div>
        </div>
      </header>

      <main>
        {/* HERO (shorter copy, street photo) */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_20%_10%,#ffffff,transparent_60%)]" />
            <div className="pointer-events-none absolute -right-24 top-10 h-[560px] w-[560px] rounded-[48px] bg-[#9b6b3d]/20 blur-3xl" />
          </div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16 grid md:grid-cols-2 items-center gap-10">
            <div>
              <h1 className="font-serif text-4xl md:text-5xl leading-tight tracking-tight">
                Your Virtual Closet
              </h1>
              <p className="mt-3 max-w-xl text-zinc-600">
                Save new pieces, tag them, and start building outfits you’ll actually wear!!!!
              </p>
              <div className="mt-7 flex items-center gap-3">
                <a href="#collections" className="inline-flex items-center rounded-full bg-[#9b6b3d] px-6 py-3 text-sm font-medium text-white hover:brightness-95">
                  View Your Collection →
                </a>
                <a href="/upload" className="inline-flex items-center rounded-full border border-zinc-300 px-6 py-3 text-sm hover:bg-white">
                  Upload Photo
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -right-6 -top-8 h-[520px] w-[380px] rounded-[48px] bg-[#9b6b3d] opacity-80" />
              <div className="relative overflow-hidden rounded-[40px] border border-zinc-200 bg-white shadow-xl">
                <img
                  src={heroImage}
                  alt="Street style hero"
                  className="h-[520px] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* FILTERS */}
        <section id="collections" className="mx-auto max-w-7xl px-4 sm:px-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-serif text-2xl">Your Collection</h2>
            <div className="text-sm text-zinc-500">{count} items</div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {["all","spring","summer","fall","winter"].map((s)=>(
              <button
                key={s}
                onClick={()=>setActiveSeason(s)}
                className={`rounded-full px-4 py-2 text-sm border transition ${
                  activeSeason===s ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300 hover:bg-white"
                }`}
              >
                {s[0].toUpperCase()+s.slice(1)}
              </button>
            ))}
            <div className="mx-2 h-6 w-px bg-zinc-300" />
            <button
              onClick={()=>setActiveCategory("all")}
              className={`rounded-full px-4 py-2 text-sm border transition ${activeCategory==="all" ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300 hover:bg-white"}`}
            >
              All Categories
            </button>
            {taxonomy.map((t)=>(
              <button
                key={t.taxonomy_id}
                onClick={()=>setActiveCategory(String(t.taxonomy_id))}
                className={`rounded-full px-4 py-2 text-sm border transition ${
                  activeCategory===String(t.taxonomy_id) ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300 hover:bg-white"
                }`}
              >
                {t.category_name}
              </button>
            ))}
          </div>
        </section>

        {/* GRID */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/60 p-12 text-center text-zinc-600">
              No items yet. Add some using <span className="font-medium">Quick Add</span> (top right) or the Upload page.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map((it) => (
                <article
                  key={it.item_id}
                  className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-lg"
                  title={it.item_name || ""}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img src={it.image_url} alt={it.item_name || "item"} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    <div className="pointer-events-none absolute left-2 top-2 flex gap-2">
                      {(it.season && it.season !== "all") && (
                        <span className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-zinc-800 shadow">{it.season}</span>
                      )}
                      {!!it.color && (
                        <span className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-zinc-800 shadow">{it.color}</span>
                      )}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="truncate text-sm font-medium text-zinc-900">{it.item_name || "Untitled"}</div>
                    <div className="mt-1 text-xs text-zinc-500">{it.category_name || it.type || "—"}</div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Removed seasonal showcase? keep if you want; it stays minimal */}
      </main>

      {/* Footer removed per request */}
    </div>
  );
}
