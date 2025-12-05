import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f6eadf] flex items-center justify-center px-4">
      <div className="max-w-5xl w-full grid gap-10 md:grid-cols-2 items-center">
        {/* Left: branding + copy */}
        <section>
          <p className="text-xs uppercase tracking-[0.14em] text-[#a08975] mb-2">
            Smart Wear AI Guide
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold text-[#1f130a] mb-4">
            Your digital closet,
            <span className="block">without the chaos.</span>
          </h1>
          <p className="text-base text-[#6c5a4a] mb-6 max-w-md">
            Upload your pieces, favorite your go-tos, and let the AI stylist
            suggest outfits for campus, work, and everything in between.
          </p>

          <div className="flex flex-wrap gap-3 mb-3">
            {/* Primary action: go to login */}
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-full bg-[#1f130a] text-white text-sm font-medium shadow-sm hover:bg-[#3b2816] transition-colors"
            >
              Log in
            </Link>
            {/* Secondary: go to register */}
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-full border border-[#d8c6b4] bg-white text-sm text-[#6c5a4a] font-medium shadow-sm hover:bg-[#f9f1e6] transition-colors"
            >
              Create an account
            </Link>
          </div>

          <p className="text-[11px] text-[#8f7a66]">
            Already logged in? You&apos;ll be redirected straight to your
            dashboard after login.
          </p>
        </section>

        {/* Right: auth preview card */}
        <section className="relative">
          <div className="rounded-[32px] bg-[#e0cbb3] p-3 shadow-sm">
            <div className="rounded-[28px] bg-[#f9f1e6] px-6 py-6 h-full flex flex-col gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[#a08975] mb-2">
                  Quick start
                </p>
                <h2 className="text-lg font-semibold text-[#1f130a] mb-1">
                  Sign in & start curating
                </h2>
                <p className="text-sm text-[#6c5a4a]">
                  Once you log in, you can upload clothes, mark favorites,
                  build outfits, and see recommendations from your AI stylist.
                </p>
              </div>

              <div className="mt-2 space-y-2 text-[12px] text-[#6c5a4a]">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f6eadf] text-[11px] text-[#4f3c2c]">
                    1
                  </span>
                  <span>Create an account or log in.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f6eadf] text-[11px] text-[#4f3c2c]">
                    2
                  </span>
                  <span>Upload a few key pieces from your closet.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f6eadf] text-[11px] text-[#4f3c2c]">
                    3
                  </span>
                  <span>Let the AI stylist suggest outfits for your day.</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                <Link
                  href="/upload"
                  className="px-3 py-1.5 rounded-full bg-[#1f130a] text-white font-medium hover:bg-[#3b2816] transition-colors"
                >
                  Skip ahead to upload →
                </Link>
                <Link
                  href="/assistant"
                  className="px-3 py-1.5 rounded-full bg-white border border-[#e1d2c3] text-[#4f3c2c] hover:bg-[#f9f1e6] transition-colors"
                >
                  Chat with AI stylist
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
