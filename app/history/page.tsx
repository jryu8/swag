// app/history/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface HistoryItemThumb {
  id: number | string;
  imageUrl: string;
}

interface HistoryEntry {
  id: number | string;
  date: string; // ISO
  title: string;
  season: string;
  occasion: string;
  mood?: string;
  items: HistoryItemThumb[];
}

/**
 * Sample fallback data – used if /api/history
 * is not implemented or fails.
 */
const SAMPLE_HISTORY: HistoryEntry[] = [
  {
    id: 1,
    date: "2025-11-14",
    title: "Campus & coffee",
    season: "Fall",
    occasion: "Casual",
    mood: "Neutral layers",
    items: [
      { id: 101, imageUrl: "/images/sample-coat.jpg" },
      { id: 102, imageUrl: "/images/sample-sweater.jpg" },
    ],
  },
  {
    id: 2,
    date: "2025-11-10",
    title: "Group project meeting",
    season: "Fall",
    occasion: "Work",
    items: [
      { id: 201, imageUrl: "/images/sample-shirt.jpg" },
      { id: 202, imageUrl: "/images/sample-pants.jpg" },
    ],
  },
];

const PERIODS = ["Week", "30days", "All"] as const;

type HistoryPageProps = {
  searchParams?: {
    period?: string;
  };
};

export default function HistoryPage({ searchParams }: HistoryPageProps) {
  const period = searchParams?.period ?? "Week";

  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Try to load from /api/history, fallback to SAMPLE_HISTORY
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/history", {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          // No API yet or error → fallback
          console.warn("GET /api/history failed, using sample data");
          setEntries(SAMPLE_HISTORY);
          return;
        }

        const data = await res.json();

        // Accept either { entries: [...] } or just [...]
        const list: HistoryEntry[] = Array.isArray(data)
          ? data
          : Array.isArray(data.entries)
          ? data.entries
          : [];

        if (!list.length) {
          setEntries([]);
        } else {
          setEntries(list);
        }
      } catch (err) {
        console.error("loadHistory error:", err);
        setError("Could not load history; showing sample data.");
        setEntries(SAMPLE_HISTORY);
      } finally {
        setLoading(false);
      }
    };

    void loadHistory();
  }, []);

  const now = new Date();

  // Filter by period (Week / 30days / All)
  let filtered = entries;

  if (period === "Week") {
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    filtered = filtered.filter((e) => {
      const d = new Date(e.date);
      return d >= sevenDaysAgo && d <= now;
    });
  } else if (period === "30days") {
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    filtered = filtered.filter((e) => {
      const d = new Date(e.date);
      return d >= thirtyDaysAgo && d <= now;
    });
  }

  // Newest first
  filtered = [...filtered].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const buildQuery = (patch: Partial<{ period: string }>) => {
    const base = { period, ...patch };
    const query: Record<string, string> = {};
    if (base.period && base.period !== "Week") query.period = base.period;
    return query;
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      weekday: "short",
    });

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f6eadf]">
      <div className="mx-auto max-w-6xl px-8 py-10">
        {/* Hero */}
        <div className="mb-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <h1 className="mb-3 text-4xl font-semibold text-[#1f130a]">
              History
            </h1>
            <p className="mb-6 max-w-md text-base text-[#6c5a4a]">
              See what you actually wore over time. Use your history to spot
              patterns and decide what to keep, rewear, or let go.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/outfits"
                className="rounded-full bg-[#b46a2a] px-5 py-2.5 text-sm font-medium text-white shadow-sm"
              >
                Reuse a favorite outfit →
              </Link>
              <Link
                href="/favorites"
                className="rounded-full border border-[#d8c6b4] bg-white px-5 py-2.5 text-sm font-medium text-[#6c5a4a] shadow-sm"
              >
                Compare with favorites
              </Link>
            </div>
          </div>

          {/* Hero summary card */}
          <div className="relative rounded-[32px] bg-[#e0cbb3] p-3">
            <div className="flex h-64 flex-col justify-between rounded-[28px] bg-[#f9f1e6] px-6 py-5 shadow-md">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.16em] text-[#a08975]">
                  Wear frequency
                </p>
                <h2 className="mb-2 text-xl font-semibold text-[#1f130a]">
                  Track your real rotation
                </h2>
                <p className="text-sm text-[#6c5a4a]">
                  History shows which pieces you repeat and which ones never
                  leave the hanger, so you can make smarter closet decisions.
                </p>
              </div>
              <p className="text-[11px] text-[#8f7a66]">
                Tip: when you log outfits, note the occasion and mood to see
                what actually works for your week.
              </p>
            </div>
          </div>
        </div>

        {/* Period filter */}
        <div className="mb-8 flex flex-wrap items-center gap-3 rounded-3xl bg-white px-5 py-4 shadow-sm">
          <span className="mr-1 text-[11px] text-[#8f7a66]">Show:</span>
          {PERIODS.map((p) => (
            <Link
              key={p}
              href={{ pathname: "/history", query: buildQuery({ period: p }) }}
              className={`rounded-full px-4 py-1.5 text-xs font-medium ${
                (p === "Week" &&
                  (!searchParams?.period || period === "Week")) ||
                period === p
                  ? "bg-[#1f130a] text-white"
                  : "bg-[#f6eadf] text-[#4f3c2c]"
              }`}
            >
              {p === "Week"
                ? "This week"
                : p === "30days"
                ? "Last 30 days"
                : "All time"}
            </Link>
          ))}
        </div>

        {/* Status line */}
        <div className="mb-3 flex items-center">
          <h2 className="text-md font-semibold text-[#1f130a]">
            {loading
              ? "Loading outfits..."
              : `${filtered.length} outfit${
                  filtered.length !== 1 ? "s" : ""
                } recorded`}
          </h2>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl bg-white/80 p-4 text-sm text-[#b0463c] shadow-sm">
            {error}
          </div>
        )}

        {/* Entries */}
        {filtered.length === 0 && !loading ? (
          <div className="rounded-3xl bg-white p-8 text-center text-sm text-[#8f7a66] shadow-sm">
            No outfits recorded for this period yet. Once you start saving
            outfits and marking them as worn, they&apos;ll appear here.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((entry) => (
              <article
                key={entry.id}
                className="flex flex-col gap-4 rounded-3xl bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center"
              >
                {/* date & info */}
                <div className="w-full sm:w-52">
                  <p className="mb-1 text-xs text-[#8f7a66]">
                    {formatDate(entry.date)}
                  </p>
                  <h3 className="mb-1 text-sm font-semibold text-[#1f130a]">
                    {entry.title}
                  </h3>
                  <p className="mb-1 text-[11px] text-[#8f7a66]">
                    {entry.season} • {entry.occasion}
                    {entry.mood ? ` • ${entry.mood}` : ""}
                  </p>
                  <Link
                    href="/outfits"
                    className="text-[11px] text-[#b46a2a] underline"
                  >
                    Reuse this outfit
                  </Link>
                </div>

                {/* thumbnails */}
                <div className="flex flex-1 flex-wrap gap-2">
                  {entry.items.map((item) => (
                    <div
                      key={item.id}
                      className="relative h-16 w-16 overflow-hidden rounded-2xl bg-[#f9f1e6]"
                    >
                      <Image
                        src={item.imageUrl}
                        alt={`Item ${item.id}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
