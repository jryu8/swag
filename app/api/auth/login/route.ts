// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/app/lib/db";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const { rows } = await pool.query(
      "SELECT id, name, email, password_hash FROM users WHERE email = $1",
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 400 }
      );
    }

    const ok = await bcrypt.compare(password, rows[0].password_hash);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid password." },
        { status: 400 }
      );
    }

    const token = (jwt as any).sign(
      { sub: rows[0].id, email },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    const { password_hash, ...user } = rows[0];

    return NextResponse.json({ user, token });
  } catch (err) {
    console.error("LOGIN error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
