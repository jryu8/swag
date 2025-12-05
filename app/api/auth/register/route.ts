// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/app/lib/db"; // adjust import if needed
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { name = "", email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1,$2,$3)
       ON CONFLICT (email) DO NOTHING
       RETURNING id,name,email,created_at`,
      [name, email, hash]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "User already exists." },
        { status: 409 }
      );
    }

  
const token = (jwt as any).sign(
  { sub: result.rows[0].id, email },
  process.env.JWT_SECRET || "dev-secret",
  { expiresIn: process.env.JWT_EXPIRE || "7d" }
);

    return NextResponse.json(
      { user: result.rows[0], token },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("REGISTER error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
