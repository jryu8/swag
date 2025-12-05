"use client";
import { useEffect, useMemo, useState } from "react";

type Item = {
  item_id: number;
  item_name?: string | null;
  image_url: string; // kept in type, but unused
  color?: string | null;
  season?: string | null;
  type?: string | null;
  category_name?: string | null;
};

type Tax = { taxonomy_id: number; category_name: string };

type SlotName = "Top" | "Bottom" | "Outerwear" | "Shoes" | "Accessory";

export default function OutfitBuilderPage() {
  const [token, setToken] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [count, setCount] = useState(0);
  const [taxonomy, setTaxonomy] = useState<Tax[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // quick add form (no image required)
  const [itemName, setItemName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [type, setType] = useState("");
  const [color, setColor] = useState("");
  const [season, setSeason] = useState("all");
  const [tags, setTags] = useState("");

  // filters
  const [activeSeason, setActiveSeason] = useState<string>("all");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // outfit canvas (no images—just colored pills)
  const allSlots: SlotName[] = ["Top", "Bottom", "Outerwear", "Shoes", "Accessory"];
  const [slots, setSlots] = useState<Record<SlotName, Item | null>>({
    Top: null,
    Bottom: null,
    Outerwear: null,
    Shoes: null,
    Accessory: null,
  });

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("vc_token") : null;
    if (!t) {
      if (typeof window !== "undefined") window.location.href = "/login";
      return;
    }
    setToken(t);
    void Promise.all([loadItems(t), loadTaxonomy(t)]);
  }, []);

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
      // minimal body—no image
      const body: any = {
        imageUrl: "", // backend expects this—send empty
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

  // palette for nice neutral / brand colors
  const brand = {
    bg: "#F6F0E8",
    accent: "#9b6b3d", // warm brown for CTAs
    dark: "#0a0a0a",
  };

  // simple color chip: map common color words to hex
  function colorToHex(name?: string | null) {
    const n = (name || "").toLowerCase().trim();
    const map: Record<string, string> = {
      black: "#111827",
      white: "#f9fafb",
      gray: "#9ca3af",
      grey: "#9ca3af",
      blue: "#3b82f6",
      navy: "#1e3a8a",
      red: "#ef4444",
      green: "#22c55e",
      olive: "#6b8e23",
      beige: "#d6c7a1",
      brown: "#8b5e34",
      tan: "#D2B48C",
      pink: "#ec4899",
      purple: "#8b5cf6",
      yellow: "#f59e0b",
      orange: "#f97316",
      cream: "#f3e8d7",
    };
    return map[n] || "#e5e7eb"; // default light gray
  }

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

  // outfit actions
  function setSlot(slot: SlotName, item: Item | null) {
    setSlots((s) => ({ ...s, [slot]: item }));
  }
  function clearAll() {
    const cleared = Object.fromEntries(allSlots.map((k) => [k, null])) as Record<SlotName, Item | null>;
    setSlots(cleared);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: brand.bg }}>
      {/* Header (right-aligned buttons) */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex max-w-7xl items-center justify-end gap-3 px-4 py-3 sm:px-6">
          <a
            href="/upload"
            className="inline-flex items-center rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-100"
          >
            Upload
          </a>

          <details className="group relative">
            <summary className="list-none inline-flex cursor-pointer items-center rounded-full px-4 py-2 text-sm text-white hover:brightness-95"
                     style={{ backgroundColor: brand.dark }}>
              Quick Add
            </summary>
            <div className="absolute right-0 mt-3 w-[28rem] rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl">
              {status && <p className="mb-2 text-sm text-red-600">{status}</p>}
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Item name"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Type (e.g., top, jeans)"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  >
                    <option value="">Category</option>
                    {taxonomy.map((t) => (
                      <option key={t.taxonomy_id} value={t.taxonomy_id}>
                        {t.category_name}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Color (word)"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  />
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  >
                    <option value="all">All seasons</option>
                    <option value="spring">Spring</option>
                    <option value="summer">Summer</option>
                    <option value="fall">Fall</option>
                    <option value="winter">Winter</option>
                  </select>
                </div>
                <input
                  placeholder="Tags (comma separated)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                />
                <button
                  onClick={quickAdd}
                  disabled={loading}
                  className="rounded-lg px-4 py-2 text-sm text-white disabled:opacity-50"
                  style={{ backgroundColor: brand.dark }}
                >
                  {loading ? "Adding..." : "Add item"}
                </button>
              </div>
            </div>
          </details>
        </div>
      </header>

      <main>
        {/* HERO (no image) */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            {/* soft glow + warm accent blob */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_20%_10%,#ffffff,transparent_60%)]" />
            <div className="pointer-events-none absolute -right-24 top-10 h-[560px] w-[560px] rounded-[48px] opacity-20 blur-3xl"
                 style={{ backgroundColor: brand.accent }} />
          </div>
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-16">
            <div>
              <h1 className="font-serif text-4xl leading-tight tracking-tight md:text-5xl">
                Outfit Builder
              </h1>
              <p className="mt-3 max-w-xl text-zinc-600">
                Mix your pieces, color-code them, and save looks—no photos required.
              </p>
              <div className="mt-7 flex items-center gap-3">
                <a
                  href="#collections"
                  className="inline-flex items-center rounded-full px-6 py-3 text-sm font-medium text-white hover:brightness-95"
                  style={{ backgroundColor: brand.accent }}
                >
                  Your Collection →
                </a>
                <a
                  href="#builder"
                  className="inline-flex items-center rounded-full border border-zinc-300 px-6 py-3 text-sm hover:bg-white"
                >
                  Open Builder
                </a>
              </div>
            </div>

            {/* Decorative card (no image) */}
            <div className="relative">
              <div className="absolute -right-6 -top-8 h-[520px] w-[380px] rounded-[40px] opacity-80" style={{ backgroundColor: brand.accent }} />
              <div className="relative rounded-[40px] border border-zinc-200 bg-white p-10 shadow-xl">
                <div className="grid gap-3">
                  <div className="h-3 w-24 rounded-full" style={{ backgroundColor: brand.dark }} />
                  <div className="h-3 w-40 rounded-full bg-zinc-200" />
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-16 rounded-xl border border-zinc-200 bg-zinc-50" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FILTERS */}
        <section id="collections" className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-serif text-2xl">Your Collection</h2>
            <div className="text-sm text-zinc-500">{count} items</div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {["all", "spring", "summer", "fall", "winter"].map((s) => (
              <button
                key={s}
                onClick={() => setActiveSeason(s)}
                className={`rounded-full px-4 py-2 text-sm border transition ${
                  activeSeason === s ? "text-white border-transparent" : "border-zinc-300 hover:bg-white"
                }`}
                style={activeSeason === s ? { backgroundColor: brand.dark } : {}}
              >
                {s[0].toUpperCase() + s.slice(1)}
              </button>
            ))}

            <div className="mx-2 h-6 w-px bg-zinc-300" />

            <button
              onClick={() => setActiveCategory("all")}
              className={`rounded-full px-4 py-2 text-sm border transition ${
                activeCategory === "all" ? "text-white border-transparent" : "border-zinc-300 hover:bg-white"
              }`}
              style={activeCategory === "all" ? { backgroundColor: brand.dark } : {}}
            >
              All Categories
            </button>

            {taxonomy.map((t) => (
              <button
                key={t.taxonomy_id}
                onClick={() => setActiveCategory(String(t.taxonomy_id))}
                className={`rounded-full px-4 py-2 text-sm border transition ${
                  activeCategory === String(t.taxonomy_id)
                    ? "text-white border-transparent"
                    : "border-zinc-300 hover:bg-white"
                }`}
                style={activeCategory === String(t.taxonomy_id) ? { backgroundColor: brand.dark } : {}}
              >
                {t.category_name}
              </button>
            ))}
          </div>
        </section>

        {/* COLLECTION GRID (text-only cards with color chips) */}
        <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/60 p-12 text-center text-zinc-600">
              No items yet. Use <span className="font-medium">Quick Add</span> (top right) to start your closet.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map((it) => {
                const chip = colorToHex(it.color);
                return (
                  <article
                    key={it.item_id}
                    className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm transition hover:shadow-lg"
                    title={it.item_name || ""}
                  >
                    <div className="flex items-center justify-between">
                      <div className="truncate text-sm font-medium text-zinc-900">
                        {it.item_name || "Untitled"}
                      </div>
                      {/* color dot */}
                      <span
                        className="ml-2 inline-block h-3 w-3 shrink-0 rounded-full ring-1 ring-black/5"
                        style={{ backgroundColor: chip }}
                        title={it.color || "Color"}
                      />
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">
                      {it.category_name || it.type || "—"}
                      {it.season && it.season !== "all" ? ` · ${it.season}` : ""}
                    </div>

                    {/* builder shortcut */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(["Top", "Bottom", "Outerwear", "Shoes", "Accessory"] as SlotName[]).map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSlot(slot, it)}
                          className="rounded-full border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-50"
                          title={`Add as ${slot}`}
                        >
                          Add to {slot}
                        </button>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* OUTFIT BUILDER (no images) */}
        <section id="builder" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl">Outfit Canvas</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearAll}
                  className="rounded-full border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
                >
                  Clear
                </button>
                <button
                  className="rounded-full px-4 py-2 text-sm text-white hover:brightness-95"
                  style={{ backgroundColor: brand.accent }}
                  onClick={() => alert("Saved! (wire up to your API if needed)")}
                >
                  Save Look
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-5">
              {allSlots.map((slot) => {
                const it = slots[slot];
                const chip = colorToHex(it?.color);
                return (
                  <div key={slot} className="rounded-2xl border border-zinc-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{slot}</div>
                      <span
                        className="inline-block h-3 w-3 rounded-full ring-1 ring-black/5"
                        style={{ backgroundColor: chip }}
                      />
                    </div>

                    {it ? (
                      <>
                        <div className="mt-2 truncate text-sm text-zinc-800">{it.item_name || "Unnamed item"}</div>
                        <div className="text-xs text-zinc-500">{it.category_name || it.type || "—"}</div>
                        <div className="mt-3 flex gap-2">
                          <button
                            className="rounded-full border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-50"
                            onClick={() => setSlot(slot, null)}
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="mt-3 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4 text-center text-xs text-zinc-500">
                        Empty — choose an item below and “Add to {slot}”
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
