// app/catalog/page.tsx
import Image from "next/image";
import Link from "next/link";

interface CatalogItem {
  id: number;
  name: string;
  category: string;
  season: string;
  color?: string;
  imageUrl: string;
  isFavorite?: boolean;
}

// TODO: replace with real data from DB/API
const ALL_ITEMS: CatalogItem[] = [
  {
    id: 1,
    name: "Beige Oversized Coat",
    category: "Outerwear",
    season: "Winter",
    color: "Beige",
    imageUrl: "/sample-coat.jpg",
    isFavorite: true,
  },
  {
    id: 2,
    name: "Soft Knit Sweater",
    category: "Top",
    season: "Fall",
    color: "Brown",
    imageUrl: "/images/sample-sweater.jpg",
  },
  // add more…
];

const SEASONS = ["All", "Spring", "Summer", "Fall", "Winter"] as const;
const CATEGORIES = ["All", "Top", "Bottom", "Outerwear", "Shoes", "Accessories"] as const;

type CatalogPageProps = {
  searchParams?: {
    season?: string;
    category?: string;
    q?: string;
    sort?: string;
  };
};

export default function CatalogPage({ searchParams }: CatalogPageProps) {
  const seasonFilter = searchParams?.season ?? "All";
  const categoryFilter = searchParams?.category ?? "All";
  const q = (searchParams?.q ?? "").toLowerCase();
  const sortBy = searchParams?.sort ?? "recent";

  // --- filtering (pure functions, no hooks) ---
  let items = ALL_ITEMS;

  if (seasonFilter !== "All") {
    items = items.filter((i) => i.season === seasonFilter);
  }
  if (categoryFilter !== "All") {
    items = items.filter((i) => i.category === categoryFilter);
  }
  if (q) {
    items = items.filter((i) => i.name.toLowerCase().includes(q));
  }

  if (sortBy === "name") {
    items = [...items].sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // recent (using id as fake recency)
    items = [...items].sort((a, b) => b.id - a.id);
  }

  // helper to build links that keep other query params
  const buildQuery = (patch: Partial<{ season: string; category: string; q: string; sort: string }>) => {
    const base = {
      season: seasonFilter,
      category: categoryFilter,
      q: searchParams?.q ?? "",
      sort: sortBy,
      ...patch,
    };

    const query: Record<string, string> = {};
    if (base.season && base.season !== "All") query.season = base.season;
    if (base.category && base.category !== "All") query.category = base.category;
    if (base.q) query.q = base.q;
    if (base.sort && base.sort !== "recent") query.sort = base.sort;

    return query;
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f6eadf]">
      <div className="max-w-6xl mx-auto px-8 py-10">
        {/* Header / hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-10">
          <div>
            <h1 className="text-4xl font-semibold text-[#1f130a] mb-3">
              Your Collection
            </h1>
            <p className="text-base text-[#6c5a4a] mb-6 max-w-md">
              Browse everything in your virtual closet, filter by season or
              category, and quickly find pieces that fit your mood today.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/upload"
                className="px-5 py-2.5 rounded-full bg-[#b46a2a] text-white text-sm font-medium shadow-sm"
              >
                Upload New Piece →
              </Link>
              <Link
                href="/outfits"
                className="px-5 py-2.5 rounded-full border border-[#d8c6b4] bg-white text-sm text-[#6c5a4a] font-medium shadow-sm"
              >
                View Outfits
              </Link>
            </div>
          </div>

          <div className="relative rounded-[32px] bg-[#e0cbb3] p-3">
            <div className="rounded-[28px] bg-[#f9f1e6] h-64 flex items-center justify-between overflow-hidden shadow-md">
              <div className="flex-1 h-full flex flex-col justify-center px-6">
                <p className="mb-2 text-xs uppercase tracking-[0.12em] text-[#a08975]">
  Fall Shopping Guide
</p>
<h2 className="mb-2 text-xl font-semibold text-[#1f130a]">
  Build Your Fall Capsule Closet
</h2>
<p className="mb-4 text-sm text-[#6c5a4a]">
  Use this catalog to see what you already own, then compare it with
  a fall essentials list from your favorite store. Fill the gaps
  instead of buying duplicates.
</p>
<div className="flex gap-2">
  {/* Open a fall-shopping site in new tab */}
  <Link
    href="https://www.google.com/search?q=fall+wardrobe+essentials"
    target="_blank"
    rel="noreferrer"
    className="rounded-full bg-[#1f130a] px-4 py-1.5 text-xs font-medium text-white"
  >
    Open Fall Shopping Guide
  </Link>

  {/* Quickly filter this catalog to fall items */}
  <Link
    href={{ pathname: "/catalog", query: buildQuery({ season: "Fall" }) }}
    className="rounded-full border border-[#e1d2c3] bg-white px-4 py-1.5 text-xs text-[#6c5a4a]"
  >
    Show Fall in Closet
  </Link>
</div>

              </div>
              {/* decorative image; replace with your asset */}
              <div className="hidden sm:block flex-1 h-full relative">
                <Image
  src="/fall-shopping.jpg"
  alt="Fall shopping inspiration"
  fill
  className="object-cover rounded-l-[40px]"
/>

              </div>
            </div>
          </div>
        </div>

        {/* Filters row */}
        <div className="bg-white rounded-3xl shadow-sm px-5 py-4 mb-8 flex flex-wrap gap-4 items-center">
          {/* Season pills */}
          <div className="flex gap-2 flex-wrap">
            {SEASONS.map((s) => (
              <Link
                key={s}
                href={{ pathname: "/catalog", query: buildQuery({ season: s }) }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium ${
                  seasonFilter === s || (s === "All" && !searchParams?.season)
                    ? "bg-[#1f130a] text-white"
                    : "bg-[#f6eadf] text-[#4f3c2c]"
                }`}
              >
                {s}
              </Link>
            ))}
          </div>

          <span className="hidden md:inline-block h-6 w-px bg-[#e1d2c3] mx-1" />

          {/* Category dropdown as simple links */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-[11px] text-[#8f7a66]">Category:</span>
            {CATEGORIES.map((c) => (
              <Link
                key={c}
                href={{ pathname: "/catalog", query: buildQuery({ category: c }) }}
                className={`px-3 py-1.5 rounded-full text-[11px] ${
                  categoryFilter === c || (c === "All" && !searchParams?.category)
                    ? "bg-[#f6eadf] text-[#1f130a] border border-[#d8c6b4]"
                    : "bg-[#f9f1e6] text-[#4f3c2c] border border-transparent"
                }`}
              >
                {c}
              </Link>
            ))}
          </div>

          {/* Sort links */}
          <div className="flex gap-2 items-center ml-auto">
            <span className="text-[11px] text-[#8f7a66]">Sort:</span>
            <Link
              href={{ pathname: "/catalog", query: buildQuery({ sort: "recent" }) }}
              className={`px-3 py-1.5 rounded-full text-[11px] ${
                sortBy === "recent" || !searchParams?.sort
                  ? "bg-[#1f130a] text-white"
                  : "bg-[#f9f1e6] text-[#4f3c2c]"
              }`}
            >
              Recent
            </Link>
            <Link
              href={{ pathname: "/catalog", query: buildQuery({ sort: "name" }) }}
              className={`px-3 py-1.5 rounded-full text-[11px] ${
                sortBy === "name"
                  ? "bg-[#1f130a] text-white"
                  : "bg-[#f9f1e6] text-[#4f3c2c]"
              }`}
            >
              Name A–Z
            </Link>
          </div>
        </div>

        {/* Items */}
        <div className="flex items-center mb-3">
          <h2 className="text-md font-semibold text-[#1f130a]">
            {items.length} item{items.length !== 1 && "s"} found
          </h2>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-8 text-center text-sm text-[#8f7a66]">
            No items match these filters yet. Try clearing filters or{" "}
            <Link href="/upload" className="text-[#b46a2a] underline">
              upload a new piece
            </Link>
            .
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map((item) => (
              <article
                key={item.id}
                className="group bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col"
              >
                <div className="relative h-40 bg-[#f9f1e6] overflow-hidden">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  {item.isFavorite && (
                    <span className="absolute top-2 right-2 text-xs bg-white/80 rounded-full px-2 py-1">
                      ⭐
                    </span>
                  )}
                </div>
                <div className="px-4 py-3 flex-1 flex flex-col">
                  <h3 className="text-sm font-semibold text-[#1f130a] truncate mb-1">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-[#8f7a66] mb-2">
                    {item.category} • {item.season}
                    {item.color ? ` • ${item.color}` : ""}
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <button
                      type="button"
                      className="text-[11px] text-[#b46a2a] underline"
                    >
                      Details
                    </button>
                    <button
                      type="button"
                      className="text-[11px] px-2 py-1 rounded-full bg-[#f6eadf] text-[#4f3c2c]"
                    >
                      Add to Outfit
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
