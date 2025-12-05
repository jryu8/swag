// app/assistant/page.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";

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

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      text: "Hey! I’m your AI stylist. Tell me what the weather is like and what you’re doing today, and I’ll suggest an outfit from your closet.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // NEW: closet state
  const [closet, setCloset] = useState<ClothingItem[]>([]);

  // Load closet from /api/clothing (same source as upload / favorites)
  useEffect(() => {
    const loadCloset = async () => {
      try {
        const res = await fetch("/api/clothing");
        if (!res.ok) {
          console.error("Failed to load closet:", res.status);
          return;
        }
        const data = await res.json();
        if (Array.isArray(data.items)) {
          setCloset(data.items);
        } else {
          console.error("Unexpected /api/clothing response:", data);
        }
      } catch (err) {
        console.error("Error loading closet:", err);
      }
    };

    void loadCloset();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          closet,
          context:
            "Digital closet app (S.W.A.G.). User is a college student with a neutral/beige wardrobe.",
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Stylist API error:", res.status, text);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "assistant",
            text: "Sorry, I couldn’t reach the stylist service. Try again in a moment.",
          },
        ]);
        return;
      }

      const data = await res.json();
      const replyText: string =
        data?.reply || "I’m not sure what to suggest right now.";

      const aiMsg: Message = {
        id: Date.now() + 2,
        role: "assistant",
        text: replyText,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Stylist fetch error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 3,
          role: "assistant",
          text: "Something went wrong talking to the AI stylist.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f6eadf]">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        {/* Hero */}
        <header className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start">
          <div>
            <h1 className="mb-3 text-4xl font-semibold text-[#1f130a]">
              AI Stylist Assistant
            </h1>
            <p className="mb-4 max-w-md text-sm text-[#6c5a4a]">
              Ask for outfit ideas based on your plans, the weather, or how
              you&apos;re feeling. The stylist will use your neutral, campus
              wardrobe as inspiration.
            </p>
            <ul className="mb-6 space-y-1.5 text-xs text-[#8f7a66]">
              <li>
                • “It’s rainy and I have back-to-back classes. What should I
                wear?”
              </li>
              <li>• “I want a cozy library outfit using my beige coat.”</li>
              <li>• “Give me a fall outfit with sneakers only.”</li>
            </ul>
            <p className="text-[11px] text-[#8f7a66]">
              Closet items available to the stylist: {closet.length}
            </p>
          </div>

          {/* Hero card */}
          <div className="relative rounded-[32px] bg-[#e0cbb3] p-3">
            <div className="flex h-56 flex-col justify-between rounded-[28px] bg-[#f9f1e6] px-6 py-5 shadow-md">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.16em] text-[#a08975]">
                  Style chat
                </p>
                <h2 className="mb-2 text-xl font-semibold text-[#1f130a]">
                  Fast suggestions, less decision fatigue
                </h2>
                <p className="text-sm text-[#6c5a4a]">
                  Instead of scrolling through every item, describe your day.
                  The stylist turns that into 1–2 clear outfit ideas using your
                  closet.
                </p>
              </div>
              <p className="text-[11px] text-[#8f7a66]">
                You can update this later to use real closet + weather data as
                context for the model.
              </p>
            </div>
          </div>
        </header>

        {/* Chat area */}
        <main className="flex flex-col gap-4 rounded-3xl bg-white/90 p-4 shadow-sm">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a08975]">
            Chat
          </div>

          <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto rounded-2xl bg-[#f9f1e6] p-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto bg-[#1f130a] text-white"
                    : "mr-auto bg-white text-[#1f130a] shadow-sm"
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="mr-auto max-w-[70%] rounded-2xl bg-white px-3 py-2 text-[12px] text-[#8f7a66] shadow-sm">
                Thinking about an outfit…
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your day, weather, or vibe..."
              className="flex-1 rounded-2xl border border-[#e1d2c3] bg-[#f9f1e6] px-3 py-2 text-sm text-[#1f130a] placeholder:text-[#b39a85] focus:outline-none focus:ring-2 focus:ring-[#c2894f]/50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-full bg-[#b46a2a] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9a5620] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Send
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
