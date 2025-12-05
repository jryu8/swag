console.log("Loaded app from:", __filename);
// src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("./db");

const app = express();

// --- middleware ---
app.use(helmet());
app.use(express.json());
app.use(cors({ origin: "http://localhost:3001", credentials: true }));

// --- health ---
app.get("/health", (_req, res) => res.json({ ok: true }));

// --- REGISTER ---
app.post("/api/auth/register", async (req, res, next) => {
  try {
    const { name = "", email, password } = req.body || {};
    console.log("🟢 [REGISTER] Attempt:", email);

    if (!email || !password) {
      console.log("⚠️ [REGISTER] Missing fields");
      return res.status(400).json({ error: "Email and password are required." });
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
      console.log("⚠️ [REGISTER] Duplicate:", email);
      return res.status(409).json({ error: "User already exists." });
    }

    console.log("✅ [REGISTER] Added to DB:", result.rows[0].email);

    const token = jwt.sign(
      { sub: result.rows[0].id, email },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    return res.status(201).json({ user: result.rows[0], token });
  } catch (err) {
    if (err.code === "23505") {
      console.log("⚠️ [REGISTER] PG unique violation:", err.detail);
      return res.status(409).json({ error: "User already exists." });
    }
    console.error("❌ [REGISTER] Error:", err.message);
    next(err);
  }
});

// --- LOGIN ---
app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    console.log("🟠 [LOGIN] Attempt:", email);

    if (!email || !password) {
      console.log("⚠️ [LOGIN] Missing fields");
      return res.status(400).json({ error: "Email and password are required." });
    }

    const { rows } = await pool.query(
      "SELECT id,name,email,password_hash FROM users WHERE email=$1",
      [email]
    );

    if (rows.length === 0) {
      console.log("⚠️ [LOGIN] No user:", email);
      return res.status(400).json({ error: "User not found." });
    }

    const ok = await bcrypt.compare(password, rows[0].password_hash);
    if (!ok) {
      console.log("⚠️ [LOGIN] Bad password:", email);
      return res.status(400).json({ error: "Invalid password." });
    }

    const token = jwt.sign(
      { sub: rows[0].id, email },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    console.log("✅ [LOGIN] Authenticated:", email);

    const { password_hash, ...user } = rows[0];
    return res.json({ user, token });
  } catch (err) {
    console.error("❌ [LOGIN] Error:", err.message);
    next(err);
  }
});

// --- (Optional) Demo proof endpoint; remove in prod ---
app.get("/api/debug/users", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT id,name,email,created_at FROM users ORDER BY id DESC LIMIT 20"
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// --- JSON error handler (ALWAYS LAST) ---
app.use((err, req, res, _next) => {
  console.error("💥 Unhandled error:", err);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

module.exports = app;
