// components/feature-grid.tsx
export function FeatureGrid() {
  const features = [
    { title: "Weather-aware picks", desc: "Auto-adjusts for temperature, rain, and wind." },
    { title: "Your closet, organized", desc: "Tag by season, color, and occasion to mix & match." },
    { title: "One-tap outfits", desc: "Daily suggestions with alternatives you can swap." },
    { title: "Smart feedback", desc: "Like/skip to teach the model your style." },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20">
      <h2 className="text-xl font-semibold tracking-tight">Why S.W.A.G.?</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl border p-5 shadow-sm transition hover:shadow-md dark:border-neutral-800">
            <h3 className="text-base font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}