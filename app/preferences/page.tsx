"use client";

import { useState } from "react";

type StyleVibe = "casual" | "minimal" | "street" | "dressy" | "sporty";
type ColorMood = "neutrals" | "earthy" | "pastels" | "brights";
type FitPref = "oversized" | "regular" | "slim";
type TempPref = "runs_cold" | "average" | "runs_warm";

export default function PreferencesPage() {
  const [styleVibes, setStyleVibes] = useState<StyleVibe[]>(["casual"]);
  const [colorMood, setColorMood] = useState<ColorMood>("neutrals");
  const [fitPref, setFitPref] = useState<FitPref>("regular");
  const [tempPref, setTempPref] = useState<TempPref>("average");
  const [shoppingNotes, setShoppingNotes] = useState("");
  const [notifyNewIdeas, setNotifyNewIdeas] = useState(true);
  const [notifyWeather, setNotifyWeather] = useState(false);

  const toggleStyle = (vibe: StyleVibe) => {
    setStyleVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe],
    );
  };

  const isSelected = (vibe: StyleVibe) => styleVibes.includes(vibe);

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f6eadf]">
      <div className="max-w-6xl mx-auto px-8 py-10 space-y-8">
        {/* Header / hero */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl font-semibold text-[#1f130a] mb-3">
              Preferences
            </h1>
            <p className="text-base text-[#6c5a4a] mb-4 max-w-md">
              Tell the AI stylist how you actually like to dress. These
              settings will guide outfit suggestions, color picks, and what
              gets recommended first.
            </p>
            <p className="text-[11px] text-[#8f7a66]">
              Changes aren&apos;t saved to the backend yet, but this layout is
              ready for when you hook it up.
            </p>
          </div>

          {/* Summary card */}
          <div className="relative rounded-[32px] bg-[#e0cbb3] p-3">
            <div className="rounded-[28px] bg-[#f9f1e6] h-full px-6 py-5 shadow-md flex flex-col justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[#a08975] mb-2">
                  Stylist preview
                </p>
                <h2 className="text-lg font-semibold text-[#1f130a] mb-1">
                  How your closet is interpreted
                </h2>
                <p className="text-sm text-[#6c5a4a]">
                  Based on your preferences, the assistant will lean toward{" "}
                  <span className="font-medium">
                    {colorMood === "neutrals"
                      ? "neutral basics"
                      : colorMood === "earthy"
                      ? "muted earthy tones"
                      : colorMood === "pastels"
                      ? "soft pastel combinations"
                      : "bolder color pairings"}
                  </span>{" "}
                  with a{" "}
                  <span className="font-medium">
                    {fitPref === "oversized"
                      ? "relaxed, oversized fit"
                      : fitPref === "slim"
                      ? "clean, slim silhouettes"
                      : "balanced, regular fit"}
                  </span>
                  .
                </p>
              </div>
              <p className="text-[11px] text-[#8f7a66]">
                Once connected, these settings can steer recommendations,
                shopping links, and weather-based outfit ideas.
              </p>
            </div>
          </div>
        </section>

        {/* Content grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Column 1 – Style vibe */}
          <div className="bg-white rounded-3xl shadow-sm px-5 py-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[#1f130a] mb-1">
                Style vibe
              </h3>
              <p className="text-xs text-[#8f7a66]">
                Pick a few that feel closest to what you wear most days.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {(
                [
                  ["casual", "Campus casual"],
                  ["minimal", "Minimal / clean"],
                  ["street", "Streetwear"],
                  ["dressy", "Smart / dressy"],
                  ["sporty", "Sporty / athleisure"],
                ] as [StyleVibe, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleStyle(value)}
                  className={`px-3 py-1.5 rounded-full border transition-colors ${
                    isSelected(value)
                      ? "bg-[#1f130a] text-white border-[#1f130a]"
                      : "bg-[#f9f1e6] text-[#4f3c2c] border-[#e1d2c3]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-2 text-[11px] text-[#8f7a66]">
              Current mix:{" "}
              <span className="font-medium text-[#4f3c2c]">
                {styleVibes.length === 0
                  ? "No style selected"
                  : styleVibes.join(", ")}
              </span>
            </div>
          </div>

          {/* Column 2 – Color & fit */}
          <div className="bg-white rounded-3xl shadow-sm px-5 py-5 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-[#1f130a] mb-1">
                Color palette
              </h3>
              <p className="text-xs text-[#8f7a66] mb-3">
                What colors do you want the stylist to prioritize?
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(
                  [
                    ["neutrals", "Neutrals (black, white, grey)"],
                    ["earthy", "Earthy (beige, brown, olive)"],
                    ["pastels", "Pastels (soft tones)"],
                    ["brights", "Bright / statement"],
                  ] as [ColorMood, string][]
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setColorMood(value)}
                    className={`px-3 py-1.5 rounded-2xl border text-left transition-colors ${
                      colorMood === value
                        ? "bg-[#1f130a] text-white border-[#1f130a]"
                        : "bg-[#f9f1e6] text-[#4f3c2c] border-[#e1d2c3]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#1f130a] mb-1">
                Preferred fit
              </h3>
              <p className="text-xs text-[#8f7a66] mb-2">
                How do you like most pieces to fit?
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                {(
                  [
                    ["oversized", "Oversized"],
                    ["regular", "Regular"],
                    ["slim", "Slim / fitted"],
                  ] as [FitPref, string][]
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFitPref(value)}
                    className={`px-3 py-1.5 rounded-full border transition-colors ${
                      fitPref === value
                        ? "bg-[#1f130a] text-white border-[#1f130a]"
                        : "bg-[#f9f1e6] text-[#4f3c2c] border-[#e1d2c3]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#1f130a] mb-1">
                Temperature comfort
              </h3>
              <p className="text-xs text-[#8f7a66] mb-2">
                Helps the assistant decide how warm to make outfits.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                {(
                  [
                    ["runs_cold", "I run cold (more layers)"],
                    ["average", "Average"],
                    ["runs_warm", "I run warm (lighter layers)"],
                  ] as [TempPref, string][]
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTempPref(value)}
                    className={`px-3 py-1.5 rounded-full border transition-colors ${
                      tempPref === value
                        ? "bg-[#1f130a] text-white border-[#1f130a]"
                        : "bg-[#f9f1e6] text-[#4f3c2c] border-[#e1d2c3]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3 – Notifications & shopping */}
          <div className="bg-white rounded-3xl shadow-sm px-5 py-5 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-[#1f130a] mb-1">
                Notifications
              </h3>
              <p className="text-xs text-[#8f7a66] mb-3">
                These are ideas for future features; toggles are local only.
              </p>
              <div className="space-y-2 text-sm">
                <label className="flex items-center gap-2 text-[#4f3c2c]">
                  <input
                    type="checkbox"
                    checked={notifyNewIdeas}
                    onChange={(e) => setNotifyNewIdeas(e.target.checked)}
                  />
                  Suggest new outfits when my favorites change
                </label>
                <label className="flex items-center gap-2 text-[#4f3c2c]">
                  <input
                    type="checkbox"
                    checked={notifyWeather}
                    onChange={(e) => setNotifyWeather(e.target.checked)}
                  />
                  Nudge me when weather doesn&apos;t match my planned outfit
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#1f130a] mb-1">
                Shopping notes (optional)
              </h3>
              <p className="text-xs text-[#8f7a66] mb-2">
                Things like &quot;no wool&quot;, &quot;prefer under $60&quot;,
                or favorite brands. Later this can steer links to external
                shops.
              </p>
              <textarea
                className="w-full rounded-2xl border border-[#e1d2c3] bg-[#fdf8f1] px-3 py-2 text-xs text-[#1f130a] placeholder-[#b9a493] focus:outline-none focus:ring-1 focus:ring-[#b46a2a] resize-none min-h-[88px]"
                placeholder="e.g. No itchy fabrics, neutral sneakers, simple outerwear…"
                value={shoppingNotes}
                onChange={(e) => setShoppingNotes(e.target.value)}
              />
            </div>

            <div className="pt-1">
              <button
                type="button"
                disabled
                className="w-full rounded-full bg-[#1f130a]/30 text-white/70 py-2.5 text-sm font-medium cursor-not-allowed"
              >
                Save preferences
              
              </button>
              <p className="mt-1 text-[10px] text-[#8f7a66]">
                This button is just visual for now. Once the backend is wired,
                you can post these settings to an API and reuse them in
                recommendations.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
