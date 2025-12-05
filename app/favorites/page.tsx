"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface ClothingItem {
  item_id: string;
  item_name?: string;
  type?: string;
  season?: string;
  color?: string;
  image_url?: string;
  is_favorite?: boolean;
}

const SEASONS = ["All", "Spring", "Summer", "Fall", "Winter"] as const;
const CATEGORIES = [
  "All",
  "Top",
  "Bottom",
  "Outerwear",
  "Shoes",
  "Accessories",
] as const;

type FavoritesPageProps = {
  searchParams?: {
    season?: string;
    category?: string;
  };
};

export default function FavoritesPage({ searchParams }: FavoritesPageProps) {
  const seasonFilter = searchParams?.season ?? "All";
  const categoryFilter = searchParams?.category ?? "All";

  const [allFavorites, setAllFavorites] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizeUrl = useMemo(
    () => (u?: string) => {
      if (!u) return "";
      if (u.startsWith("./")) return "/" + u.slice(2);
      return u;
    },
    [],
  );

  // Fetch favorites from backend (same data source as upload)
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/clothing", {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("GET /api/clothing failed:", res.status, text);
          setError("Could not load favorites.");
          return;
        }

        const data = await res.json();
        if (!Array.isArray(data.items)) {
          console.error("Unexpected /api/clothing response:", data);
          setError("Unexpected server response.");
          return;
        }

        // Keep only favorites
        const favs = data.items.filter(
          (item: ClothingItem) => item.is_favorite,
        );
        setAllFavorites(favs);
      } catch (err) {
        console.error("fetchFavorites error:", err);
        setError("Could not load favorites.");
      } finally {
        setLoading(false);
      }
    };

    void fetchFavorites();
  }, []);

  // Apply season/category filters
  let items = allFavorites;

  if (seasonFilter !== "All") {
    items = items.filter((i) => i.season === seasonFilter);
  }

  if (categoryFilter !== "All") {
    items = items.filter((i) => i.type === categoryFilter);
  }

  const buildQuery = (
    patch: Partial<{ season: string; category: string }>,
  ) => {
    const base = {
      season: seasonFilter,
      category: categoryFilter,
      ...patch,
    };
    const query: Record<string, string> = {};
    if (base.season && base.season !== "All") query.season = base.season;
    if (base.category && base.category !== "All")
      query.category = base.category;
    return query;
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f6eadf]">
      <div className="mx-auto max-w-6xl px-8 py-10">
        {/* Hero */}
        <div className="mb-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <h1 className="mb-3 text-4xl font-semibold text-[#1f130a]">
              Favorites
            </h1>
            <p className="mb-6 max-w-md text-base text-[#6c5a4a]">
              Your most–worn pieces, all in one place. Use favorites to build
              quick outfits from items you actually reach for.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/catalog"
                className="rounded-full bg-[#b46a2a] px-5 py-2.5 text-sm font-medium text-white shadow-sm"
              >
                Browse full catalog →
              </Link>
              <Link
                href="/history"
                className="rounded-full border border-[#d8c6b4] bg-white px-5 py-2.5 text-sm font-medium text-[#6c5a4a] shadow-sm"
              >
                See how you wore them
              </Link>
            </div>
          </div>

          {/* Hero card */}
          <div className="relative rounded-[32px] bg-[#e0cbb3] p-3">
            <div className="flex h-64 flex-col justify-between rounded-[28px] bg-[#f9f1e6] px-6 py-5 shadow-md">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.16em] text-[#a08975]">
                  Favorite focus
                </p>
                <h2 className="mb-2 text-xl font-semibold text-[#1f130a]">
                  Build around your go-to pieces
                </h2>
                <p className="text-sm text-[#6c5a4a]">
                  Star items you love wearing in the catalog or upload screen.
                  They&apos;ll show up here first when you plan outfits.
                </p>
              </div>
              <p className="text-[11px] text-[#8f7a66]">
                Tip: keep this list small so it really reflects what you enjoy
                wearing.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-4 rounded-3xl bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {SEASONS.map((s) => (
              <Link
                key={s}
                href={{ pathname: "/favorites", query: buildQuery({ season: s }) }}
                className={`rounded-full px-4 py-1.5 text-xs font-medium ${
                  seasonFilter === s || (s === "All" && !searchParams?.season)
                    ? "bg-[#1f130a] text-white"
                    : "bg-[#f6eadf] text-[#4f3c2c]"
                }`}
              >
                {s}
              </Link>
            ))}
          </div>

          <span className="mx-1 hidden h-6 w-px bg-[#e1d2c3] md:inline-block" />

          <div className="flex flex-wrap gap-2">
            <span className="text-[11px] text-[#8f7a66]">Category:</span>
            {CATEGORIES.map((c) => (
              <Link
                key={c}
                href={{
                  pathname: "/favorites",
                  query: buildQuery({ category: c }),
                }}
                className={`rounded-full px-3 py-1.5 text-[11px] ${
                  categoryFilter === c || (c === "All" && !searchParams?.category)
                    ? "border border-[#d8c6b4] bg-[#f6eadf] text-[#1f130a]"
                    : "border border-transparent bg-[#f9f1e6] text-[#4f3c2c]"
                }`}
              >
                {c}
              </Link>
            ))}
          </div>
        </div>

        {/* Status line */}
        <div className="mb-3 flex items-center">
          <h2 className="text-md font-semibold text-[#1f130a]">
            {loading
              ? "Loading favorites..."
              : `${items.length} favorite${items.length !== 1 ? "s" : ""}`}
          </h2>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl bg-white/80 p-4 text-sm text-[#b0463c] shadow-sm">
            {error}
          </div>
        )}

        {/* Grid */}
        {items.length === 0 && !loading ? (
          <div className="rounded-3xl bg-white p-8 text-center text-sm text-[#8f7a66] shadow-sm">
            You haven&apos;t added any favorites yet. On the upload page or in
            your collection, mark pieces as favorites so they appear here.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => {
              const img = normalizeUrl(item.image_url);
              return (
                <article
                  key={item.item_id}
                  className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm"
                >
                  <div className="relative h-40 overflow-hidden bg-[#f9f1e6]">
                   {img && (
                    <img
                      src={img}
                      alt={item.item_name || item.type || "Favorite item"}
                      className="h-full w-full object-cover"
                    />
                  )}

                    <span className="absolute right-2 top-2 rounded-full bg-white/80 px-2 py-1 text-xs">
                      ⭐
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col px-4 py-3">
                    <h3 className="mb-1 truncate text-sm font-semibold text-[#1f130a]">
                      {item.item_name || item.type || "Favorite item"}
                    </h3>
                    <p className="mb-2 text-[11px] text-[#8f7a66]">
                      {item.type || "Item"}
                      {item.season ? ` • ${item.season}` : ""}
                      {item.color ? ` • ${item.color}` : ""}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <Link
                        href="/catalog"
                        className="text-[11px] text-[#b46a2a] underline"
                      >
                        View in catalog
                      </Link>
                      {/* TODO: wire this up to an API to un-favorite */}
                      <button
                        type="button"
                        className="rounded-full bg-[#f6eadf] px-2 py-1 text-[11px] text-[#4f3c2c]"
                      >
                        Remove ★
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
