export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-300">Try going back to the homepage.</p>
      <a href="/" className="mt-6 inline-block rounded-lg border px-4 py-2">Back Home</a>
    </div>
  );
}