// app/api/stylist/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Use the model name your key supports, e.g.:
// "gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-2.0-flash", etc.
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: {
    role: "model",
    parts: [
      {
        text: [
          "You are an AI fashion stylist for a virtual closet app called S.W.A.G.",
          "The user has a closet of clothing items, each with type, color, season, and tags.",
          "Give practical outfit suggestions based ONLY on items provided.",
          "",
          "Rules:",
          "- Suggest 1–3 outfits.",
          "- Each outfit should list specific items (e.g. 'white oversized tee', 'black jeans', 'white sneakers').",
          "- Consider season, occasion, and color coordination.",
          "- Keep answers concise and friendly.",
        ].join("\n"),
      },
    ],
  },
});

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message: string = body.message;
    const closet: ClothingItem[] = body.closet || [];
    const extraContext: string | undefined = body.context;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Missing 'message' in request body" },
        { status: 400 }
      );
    }

    const closetSummary =
      closet.length === 0
        ? "The user has not provided any closet items."
        : closet
            .slice(0, 30)
            .map((item) => {
              const name = item.item_name || item.type || "item";
              const bits = [
                name,
                item.type ? `type: ${item.type}` : "",
                item.color ? `color: ${item.color}` : "",
                item.season ? `season: ${item.season}` : "",
                item.tags ? `tags: ${item.tags}` : "",
                item.is_favorite ? "★ favorite" : "",
              ]
                .filter(Boolean)
                .join(", ");
              return `- ${bits}`;
            })
            .join("\n");

    const prompt = [
      extraContext || "",
      "",
      "User request:",
      message,
      "",
      "Closet items:",
      closetSummary,
      "",
      "Now suggest outfits that use only those items.",
    ].join("\n");

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error("Stylist API error:", err);
    return NextResponse.json(
      { error: "Failed to generate AI stylist suggestion." },
      { status: 500 }
    );
  }
}
