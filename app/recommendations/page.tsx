// app/recommendations/page.tsx
import Image from "next/image";
import Link from "next/link";

interface Recommendation {
  id: number;
  title: string;
  type: "Outfit" | "Piece";
  context: string; // e.g. "Today", "Work", "Casual"
  reason: string;
  details: string;
  season: string;
  items: { id: number; imageUrl: string; name?: string }[];
}

// SAMPLE DATA – you can still replace this later with real logic
const ALL_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 1,
    title: "Neutral campus layers",
    type: "Outfit",
    context: "Today",
    season: "Fall",
    reason:
      "Temperature is cool and you frequently wear neutral coat + knit on school days.",
    details:
      "Pair your neutral fall coat with a knit top and relaxed trousers for comfortable campus walking and coffee runs.",
    items: [
      {
        id: 101,
        imageUrl: "/images/reco-neutral-coat.jpg",
        name: "Neutral fall coat",
      },
      {
        id: 102,
        imageUrl: "/images/reco-campus-knit.jpg",
        name: "Campus knit top",
      },
      {
        id: 103,
        imageUrl: "/images/reco-relaxed-pants.jpg",
        name: "Relaxed trousers",
      },
    ],
  },
  {
    id: 2,
    title: "Soft knit for study sessions",
    type: "Piece",
    context: "Casual",
    season: "Fall",
    reason:
      "You favor this knit in recent history and it works with most of your neutral bottoms.",
    details:
      "Use this soft knit as the base and add any neutral bottom + simple sneakers. Good for library, café, or casual group work.",
    items: [
      {
        id: 202,
        imageUrl: "/images/reco-soft-knit-focus.jpg",
        name: "Soft knit focus piece",
      },
    ],
  },
];

const CONTEXTS = ["Today", "Work", "Casual", "Evening", "Weather"] as const;

type RecommendationsPageProps = {
  searchParams?: {
    context?: string;
  };
};

export default function RecommendationsPage({
  searchParams,
}: RecommendationsPageProps) {
  const contextFilter = searchParams?.context ?? "Today";

  let recs = ALL_RECOMMENDATIONS;

  if (contextFilter !== "Today") {
    recs = recs.filter(
      (r) =>
        r.context === contextFilter ||
        (contextFilter === "Weather" && r.context === "Today"),
    );
  }

  const buildQuery = (patch: Partial<{ context: string }>) => {
    const base = { context: contextFilter, ...patch };
    const query: Record<string, string> = {};
    if (base.context && base.context !== "Today") query.context = base.context;
    return query;
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f6eadf]">
      <div className="mx-auto max-w-6xl px-8 py-10">
        {/* Hero */}
        <div className="mb-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <h1 className="mb-3 text-4xl font-semibold text-[#1f130a]">
              Recommendations
            </h1>
            <p className="mb-6 max-w-md text-base text-[#6c5a4a]">
              Smart suggestions based on your favorites, history, and the
              current season. Treat them like a gentle nudge, not a rule.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/favorites"
                className="rounded-full bg-[#b46a2a] px-5 py-2.5 text-sm font-medium text-white shadow-sm"
              >
                Adjust favorites →
              </Link>
              <Link
                href="/history"
                className="rounded-full border border-[#d8c6b4] bg-white px-5 py-2.5 text-sm font-medium text-[#6c5a4a] shadow-sm"
              >
                See what you wore recently
              </Link>
            </div>
          </div>

          {/* Hero suggestion card */}
          <div className="relative rounded-[32px] bg-[#e0cbb3] p-3">
            <div className="flex h-64 flex-col justify-between rounded-[28px] bg-[#f9f1e6] px-6 py-5 shadow-md">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.16em] text-[#a08975]">
                  Today&apos;s suggestion
                </p>
                <h2 className="mb-2 text-xl font-semibold text-[#1f130a]">
                  Let your closet suggest the outline
                </h2>
                <p className="text-sm text-[#6c5a4a]">
                  Each recommendation combines your favorite pieces with outfits
                  you wear in similar weather or contexts, so you don&apos;t
                  have to start from zero.
                </p>
              </div>
              <p className="text-[11px] text-[#8f7a66]">
                Later, you can refine this to weigh mood, color, or specific
                events differently.
              </p>
            </div>
          </div>
        </div>

        {/* Context filter */}
        <div className="mb-8 flex flex-wrap items-center gap-3 rounded-3xl bg-white px-5 py-4 shadow-sm">
          <span className="mr-1 text-[11px] text-[#8f7a66]">
            Show suggestions for:
          </span>
          {CONTEXTS.map((ctx) => (
            <Link
              key={ctx}
              href={{
                pathname: "/recommendations",
                query: buildQuery({ context: ctx }),
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-medium ${
                (ctx === "Today" &&
                  (!searchParams?.context || contextFilter === "Today")) ||
                contextFilter === ctx
                  ? "bg-[#1f130a] text-white"
                  : "bg-[#f6eadf] text-[#4f3c2c]"
              }`}
            >
              {ctx === "Weather" ? "Weather-based" : ctx}
            </Link>
          ))}
        </div>

        {/* Recommendation cards */}
        {recs.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center text-sm text-[#8f7a66] shadow-sm">
            No recommendations yet. Try adding a few favorites and wearing some
            outfits so the system has data to work with.
          </div>
        ) : (
          <div className="space-y-4">
            {recs.map((rec) => (
              <article
                key={rec.id}
                className="flex flex-col gap-4 rounded-3xl bg-white px-5 py-4 shadow-sm md:flex-row"
              >
                {/* thumbnails */}
                <div className="flex gap-2 md:w-48">
                  {rec.items.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="relative h-16 w-16 overflow-hidden rounded-2xl bg-[#f9f1e6]"
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.name ?? `Item ${item.id}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>

                {/* text */}
                <div className="flex-1">
                  <p className="mb-1 text-[11px] text-[#8f7a66]">
                    {rec.type} • {rec.context} • {rec.season}
                  </p>
                  <h3 className="mb-1 text-sm font-semibold text-[#1f130a]">
                    {rec.title}
                  </h3>
                  <p className="mb-2 text-[11px] text-[#8f7a66]">
                    Why this: {rec.reason}
                  </p>
                  <p className="mb-3 text-sm text-[#6c5a4a]">{rec.details}</p>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <button
                      type="button"
                      className="rounded-full bg-white px-3 py-1 text-[11px] text-[#4f3c2c] border border-[#e1d2c3]"
                    >
                      Show similar options
                    </button>
                    <Link
                      href="/catalog"
                      className="rounded-full bg-[#f6eadf] px-3 py-1 text-[11px] text-[#4f3c2c]"
                    >
                      Open in catalog
                    </Link>
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
