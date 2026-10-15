type AISearchProps = {
  query: string;
  setQuery: (value: string) => void;
  onSearch: () => void;
  loading: boolean;
};

export default function AISearch({ query, setQuery, onSearch, loading }: AISearchProps) {
  return (
    <div id="assistant" className="mx-auto max-w-7xl scroll-mt-28 px-5 pb-12 sm:px-8 sm:pb-16">
      <div className="rounded-[1.75rem] bg-[#243d32] p-5 text-white shadow-xl shadow-[#243d32]/10 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-7 lg:px-9">
        <div className="mb-5 sm:mb-0 sm:max-w-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d4c18f]">A smarter way to shop</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">Tell us what you’re looking for.</h2>
          <p className="mt-1.5 text-sm leading-6 text-white/65">Describe it in your own words. We’ll find a good match.</p>
        </div>
        <div className="flex w-full gap-2 rounded-full bg-white p-1.5 sm:max-w-xl">
          <label htmlFor="shopping-query" className="sr-only">Describe what you want to find</label>
          <input
            id="shopping-query"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onSearch();
            }}
            placeholder="Try: running shoes under ₹4,000"
            className="min-w-0 flex-1 rounded-full bg-transparent px-4 py-2.5 text-sm text-stone-900 outline-none placeholder:text-stone-400"
          />
          <button
            onClick={onSearch}
            disabled={loading || !query.trim()}
            className="shrink-0 rounded-full bg-[#d6bd83] px-5 py-2.5 text-sm font-semibold text-[#26382e] transition hover:bg-[#e5d09f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Searching…" : "Find it ↗"}
          </button>
        </div>
      </div>
    </div>
  );
}
