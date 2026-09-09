export function SearchBar({
  defaultValue = "",
  compact = false,
}: {
  defaultValue?: string;
  compact?: boolean;
}) {
  return (
    <form action="/search" role="search" className={compact ? "flex w-full max-w-lg gap-2" : "mt-8 flex gap-2"}>
      <label className="sr-only" htmlFor={compact ? "nav-article-search" : "article-search"}>
        Search articles
      </label>
      <input
        id={compact ? "nav-article-search" : "article-search"}
        name="q"
        defaultValue={defaultValue}
        className={`w-full rounded border px-3 py-2 ${
          compact ? "border-ink-700 bg-ink-900 text-white placeholder:text-ink-400" : "border-ink-300 bg-white"
        }`}
        placeholder="Search articles..."
        type="search"
        autoComplete="off"
      />
      <button className={`shrink-0 rounded px-4 py-2 text-white ${compact ? "bg-crimson-700" : "bg-ink-950"}`} type="submit">
        Search
      </button>
    </form>
  );
}
