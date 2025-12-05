// app/dashboard/page.tsx
import Link from "next/link";
import Image from "next/image";

export default async function DashboardPage() {
  // If you already have auth logic like:
  // const user = await getCurrentUser();
  // if (!user) redirect("/login");
  //
  // leave that above the return and just keep using `user` in the JSX if you want.

  // You can replace these with real values from DB later
  const totalItems = 42;
  const totalOutfits = 8;
  const favoritesCount = 15;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f6eadf]">
      <div className="max-w-6xl mx-auto px-8 py-10">
        {/* Top hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-12">
          {/* Left text */}
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[#a08975] mb-2">
              Dashboard
            </p>
            <h1 className="text-4xl md:text-5xl font-semibold text-[#1f130a] mb-4">
              Your Virtual Closet
            </h1>
            <p className="text-base text-[#6c5a4a] mb-6 max-w-md">
              Quickly jump to your catalog, recent outfits, and favorites. This
              is your overview of what&apos;s in rotation right now.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/catalog"
                className="px-5 py-2.5 rounded-full bg-[#b46a2a] text-white text-sm font-medium shadow-sm"
              >
                Open Catalog →
              </Link>
              <Link
                href="/upload"
                className="px-5 py-2.5 rounded-full border border-[#d8c6b4] bg-white text-sm text-[#6c5a4a] font-medium shadow-sm"
              >
                Upload New Piece
              </Link>
            </div>
          </div>

          {/* Right hero card */}
          <div className="relative rounded-[32px] bg-[#e0cbb3] p-3">
            <div className="rounded-[28px] bg-[#f9f1e6] overflow-hidden shadow-md h-80 relative flex items-center justify-center">
              {/* Main photo inside rounded frame */}
              <div className="absolute inset-y-4 right-4 left-16 rounded-[36px] overflow-hidden shadow-lg">
                <Image
                  src="/images/dashboard-hero.jpg" // replace with your own image
                  alt="Virtual closet dashboard"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Decorative circle */}
              <div className="absolute left-[-40px] top-10 w-44 h-44 rounded-full bg-[#d4b89a] opacity-70" />

              {/* Small overlay card */}
              <div className="absolute bottom-4 left-6 bg-white/90 rounded-2xl px-4 py-3 shadow-md max-w-[220px]">
                <p className="text-[11px] text-[#8f7a66] mb-1">
                  Quick insight
                </p>
                <p className="text-sm font-semibold text-[#1f130a] mb-1">
                  Most–worn pieces
                </p>
                <p className="text-[11px] text-[#8f7a66]">
                  Your favorites and history combine here to suggest what to
                  rewear this week.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-3xl shadow-sm px-5 py-4">
            <p className="text-[11px] text-[#8f7a66] mb-1">Pieces</p>
            <p className="text-2xl font-semibold text-[#1f130a] mb-1">
              {totalItems}
            </p>
            <p className="text-[11px] text-[#a08975]">
              Items currently in your closet
            </p>
          </div>
          <div className="bg-white rounded-3xl shadow-sm px-5 py-4">
            <p className="text-[11px] text-[#8f7a66] mb-1">Outfits</p>
            <p className="text-2xl font-semibold text-[#1f130a] mb-1">
              {totalOutfits}
            </p>
            <p className="text-[11px] text-[#a08975]">
              Saved combinations to reuse
            </p>
          </div>
          <div className="bg-white rounded-3xl shadow-sm px-5 py-4">
            <p className="text-[11px] text-[#8f7a66] mb-1">Favorites</p>
            <p className="text-2xl font-semibold text-[#1f130a] mb-1">
              {favoritesCount}
            </p>
            <p className="text-[11px] text-[#a08975]">
              Pieces you star the most
            </p>
          </div>
        </div>

        {/* Quick navigation tiles */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/favorites"
            className="bg-white rounded-3xl shadow-sm px-5 py-4 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <p className="text-[11px] text-[#8f7a66] mb-1">Quick access</p>
              <h2 className="text-md font-semibold text-[#1f130a] mb-1">
                Favorites
              </h2>
              <p className="text-[11px] text-[#8f7a66]">
                See the pieces you reach for the most and build new outfits
                around them.
              </p>
            </div>
            <span className="mt-3 text-[11px] text-[#b46a2a] underline">
              Open favorites →
            </span>
          </Link>

          <Link
            href="/history"
            className="bg-white rounded-3xl shadow-sm px-5 py-4 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <p className="text-[11px] text-[#8f7a66] mb-1">Recently worn</p>
              <h2 className="text-md font-semibold text-[#1f130a] mb-1">
                History
              </h2>
              <p className="text-[11px] text-[#8f7a66]">
                Look back at what you&apos;ve actually worn in the last days or
                weeks.
              </p>
            </div>
            <span className="mt-3 text-[11px] text-[#b46a2a] underline">
              View history →
            </span>
          </Link>

         <Link
            href="/planner"
            className="bg-white rounded-3xl shadow-sm px-5 py-4 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <p className="text-[11px] text-[#8f7a66] mb-1">Calendar</p>
              <h2 className="text-md font-semibold text-[#1f130a] mb-1">
                Planner
              </h2>
              <p className="text-[11px] text-[#8f7a66]">
                Plan ahead of time with the planner.
              </p>
            </div>
            <span className="mt-3 text-[11px] text-[#b46a2a] underline">
              View Calendar →
            </span>
          </Link>

          <Link
            href="/recommendations"
            className="bg-white rounded-3xl shadow-sm px-5 py-4 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <p className="text-[11px] text-[#8f7a66] mb-1">Suggestions</p>
              <h2 className="text-md font-semibold text-[#1f130a] mb-1">
                Recommendations
              </h2>
              <p className="text-[11px] text-[#8f7a66]">
                Get outfit ideas based on your favorites, history, and the
                current season.
              </p>
            </div>
            <span className="mt-3 text-[11px] text-[#b46a2a] underline">
              See recommendations →
            </span>
          </Link>
        </section>
            </div>
          </div>
     
  );
}
