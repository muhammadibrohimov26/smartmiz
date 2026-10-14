// Shown instantly while an admin section loads on the server, so a click
// gives immediate feedback instead of the old page staying frozen.
export default function AdminLoading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Yuklanmoqda">
      <div className="h-8 w-48 rounded-lg bg-zinc-200 dark:bg-zinc-800 mb-6" />
      <div className="grid gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" />
        ))}
      </div>
    </div>
  );
}
