"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NavBar() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("vc_token") : null;
    setAuthed(!!t);
  }, []);

  function logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("vc_token");
      window.location.href = "/login";
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/dashboard" className="text-sm font-semibold text-zinc-900">Virtual Closet</Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <Link href="/clothing" className="rounded-md px-3 py-1.5 text-zinc-700 hover:bg-zinc-100">Clothing</Link>
          <Link href="/catalog" className="rounded-md px-3 py-1.5 text-zinc-700 hover:bg-zinc-100">Catalog</Link>
          <Link href="/upload" className="rounded-md px-3 py-1.5 text-zinc-700 hover:bg-zinc-100">Upload</Link>
          <Link href="/outfits" className="rounded-md px-3 py-1.5 text-zinc-700 hover:bg-zinc-100">Outfits</Link>
          <Link href="/favorites" className="rounded-md px-3 py-1.5 text-zinc-700 hover:bg-zinc-100">Favorites</Link>
          <Link href="/history" className="rounded-md px-3 py-1.5 text-zinc-700 hover:bg-zinc-100">History</Link>
          <Link href="/planner" className="rounded-md px-3 py-1.5 text-zinc-700 hover:bg-zinc-100">Planner</Link>
          <Link href="/recommendations" className="rounded-md px-3 py-1.5 text-zinc-700 hover:bg-zinc-100">Recommendations</Link>
          <Link href="/assistant" className="rounded-md px-3 py-1.5 text-zinc-700 hover:bg-zinc-100">Assistant</Link>
          <Link href="/preferences" className="rounded-md px-3 py-1.5 text-zinc-700 hover:bg-zinc-100">Preferences</Link>
          <Link href="/tryon" className="rounded-md px-3 py-1.5 text-zinc-700 hover:bg-zinc-100">Try-On</Link>
          <Link href="/admin/login" className="rounded-md px-3 py-1.5 text-blue-700 hover:bg-blue-50">Admin</Link>
          {authed ? (
            <button onClick={logout} className="ml-1 rounded-md bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700">Logout</button>
          ) : (
            <Link href="/login" className="ml-1 rounded-md bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
