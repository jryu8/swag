import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// simple in-memory store (same as before)
const items: any[] = [];

export async function GET(req: NextRequest) {
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image uploaded" },
        { status: 400 }
      );
    }

    const itemName = formData.get("itemName")?.toString() || "";
    const type = formData.get("type")?.toString() || "";
    const color = formData.get("color")?.toString() || "";
    const season = formData.get("season")?.toString() || "all";
    const tags = formData.get("tags")?.toString() || "";
    const favorite = formData.get("favorite") === "true";

    // ---- Upload to Supabase instead of local filesystem ----
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${randomUUID()}.${ext}`;
    const filePath = `uploads/${filename}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("swag-bucket")               // your bucket name
      .upload(filePath, buffer, {
        contentType: file.type || "image/jpeg",
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { success: false, error: "Failed to upload image" },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage
      .from("swag-bucket")
      .getPublicUrl(filePath);

    const image_url = urlData.publicUrl;

    const newItem = {
      item_id: randomUUID(),
      item_name: itemName,
      type,
      color,
      season,
      tags,
      image_url,
      is_favorite: favorite,
      created_at: new Date().toISOString(),
    };

    items.push(newItem);

    return NextResponse.json({ success: true, item: newItem });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { success: false, error: "Upload failed on server" },
      { status: 500 }
    );
  }
}
