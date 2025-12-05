"use client";

import { useEffect, useMemo, useState } from "react";

interface ClothingItem {
  item_id: string;
  item_name?: string;
  type?: string;
  color?: string;
  season?: string;
  tags?: string;
  image_url?: string;
  is_favorite?: boolean;
}

export default function UploadPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [itemName, setItemName] = useState("");
  const [skipAutoTagging, setSkipAutoTagging] = useState(false);
  const [type, setType] = useState("");
  const [color, setColor] = useState("");
  const [season, setSeason] = useState("all");
  const [tags, setTags] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const normalizeUrl = useMemo(
    () => (u?: string) => {
      if (!u) return "";
      if (u.startsWith("./")) return "/" + u.slice(2);
      return u;
    },
    [],
  );

  // Load existing items on mount
  useEffect(() => {
    void fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const res = await fetch("/api/clothing", {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("GET /api/clothing failed:", res.status, text);
        return;
      }

      const data = await res.json();
      if (Array.isArray(data.items)) {
        setItems(data.items);
      }
    } catch (err) {
      console.error("fetchItems failed:", err);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("");

    if (!imageFile) {
      setStatus("Please select an image file.");
      return;
    }

    const form = new FormData();
    form.append("image", imageFile);
    if (itemName) form.append("itemName", itemName);
    form.append("skipAutoTagging", String(skipAutoTagging));
    if (type) form.append("type", type);
    if (color) form.append("color", color);
    if (season) form.append("season", season);
    if (tags) {
      form.append(
        "tags",
        JSON.stringify(
          tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        ),
      );
    }
    form.append("favorite", isFavorite ? "true" : "false");

    try {
      setIsLoading(true);

      const res = await fetch("/api/clothing", {
        method: "POST",
        body: form,
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        const raw = await res.text();
        console.error("Non-JSON response from POST /api/clothing:", raw);
        setStatus("Server did not return JSON.");
        return;
      }

      if (!res.ok || !data?.success) {
        setStatus(data?.error || "Upload failed.");
        return;
      }

      setStatus("Uploaded successfully");
      setImageFile(null);
      setItemName("");
      setType("");
      setColor("");
      setSeason("all");
      setTags("");
      setIsFavorite(false);

      await fetchItems();
    } catch (err: any) {
      console.error("Upload error:", err);
      setStatus(err?.message || "Upload failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f1e7] px-4 py-8 text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        {/* Header */}
        <header className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Upload
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Add a New Piece
          </h1>
          <p className="max-w-xl text-sm text-slate-600">
            Upload a clothing photo, add a few details, and we&apos;ll save it
            into your virtual closet for outfits and favorites.
          </p>
        </header>

        {/* Main content: form + quick preview */}
        <main className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          {/* Upload Card */}
          <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur">
            <form onSubmit={onSubmit} className="space-y-5">
              {/* File input */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-800">
                  Photo
                </label>

                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3 text-xs text-slate-700 hover:bg-slate-50 transition">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {imageFile ? "Change file" : "Click to choose a file"}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      JPG / PNG, up to 5 MB
                    </span>
                  </div>
                  <span className="rounded-full bg-black px-3 py-1 text-[11px] font-semibold text-white">
                    Browse
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      setImageFile(e.target.files?.[0] || null)
                    }
                  />
                </label>

                {imageFile && (
                  <p className="text-[11px] text-slate-500">
                    Selected:{" "}
                    <span className="font-medium">{imageFile.name}</span>
                  </p>
                )}
              </div>

              {/* Item name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-800">
                  Item name
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#c2894f]/50"
                  placeholder="e.g. Cream hoodie"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 text-xs text-slate-700">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={skipAutoTagging}
                    onChange={(e) => setSkipAutoTagging(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-black focus:ring-black"
                  />
                  Skip auto-tagging (enter details manually)
                </label>

                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isFavorite}
                    onChange={(e) => setIsFavorite(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-black focus:ring-black"
                  />
                  Add to favorites
                </label>
              </div>

              {/* Details grid */}
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-800">
                    Category
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#c2894f]/50"
                    placeholder="e.g. Top, Outerwear"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-800">
                    Color
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#c2894f]/50"
                    placeholder="e.g. Black, Beige"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-800">
                    Season
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#c2894f]/50"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                  >
                    <option value="all">All seasons</option>
                    <option value="spring">Spring</option>
                    <option value="summer">Summer</option>
                    <option value="fall">Fall</option>
                    <option value="winter">Winter</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-800">
                    Tags
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#c2894f]/50"
                    placeholder="comma-separated (e.g. casual, work)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit + status */}
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-full bg-[#c2894f] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#a66d33] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Uploading..." : "Upload item"}
                </button>

                {status && (
                  <p className="text-xs text-slate-700">
                    {status}
                  </p>
                )}
              </div>
            </form>
          </section>

          {/* Simple live preview */}
          <aside className="space-y-3">
            <div className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Preview
              </p>
              <div className="flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                {imageFile ? (
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Choose a photo to see it here
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                {itemName && (
                  <span className="rounded-full bg-black px-3 py-1 text-white">
                    {itemName}
                  </span>
                )}
                {type && (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">
                    {type}
                  </span>
                )}
                {season && season !== "all" && (
                  <span className="rounded-full border border-[#e4c9a7] bg-[#f8f1e7] px-3 py-1 text-slate-700">
                    {season}
                  </span>
                )}
                {isFavorite && (
                  <span className="rounded-full bg-[#c2894f] px-3 py-1 text-white">
                    ★ Favorite
                  </span>
                )}
              </div>
            </div>
          </aside>
        </main>

        {/* Items list */}
        <section className="mx-auto mt-2 w-full max-w-5xl">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium text-slate-900">
              Your Collection
            </h2>
            <span className="text-xs text-slate-500">
              {items.length} item{items.length === 1 ? "" : "s"}
            </span>
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-slate-600">
              No items yet. Upload your first piece to start your virtual
              closet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((it) => {
                const img = normalizeUrl(it.image_url);
                return (
                  <div
                    key={it.item_id}
                    className="flex flex-col rounded-3xl border border-white/60 bg-white/80 p-3 text-xs shadow-sm"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-slate-900">
                        {it.item_name || it.type || "Item"}
                      </span>
                      {it.is_favorite && (
                        <span className="rounded-full bg-[#f5d7a5] px-2 py-0.5 text-[10px] font-semibold text-[#8b5a1f]">
                          Favorite
                        </span>
                      )}
                    </div>

                    <div className="mb-2 text-[11px] text-slate-600">
                      {[it.color, it.season]
                        .filter(Boolean)
                        .join(" • ")}
                    </div>

                    {img && (
                      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
                        <img
                          src={img}
                          alt={it.item_name || "Item"}
                          className="h-40 w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
