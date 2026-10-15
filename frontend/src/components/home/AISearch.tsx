
type AISearchProps = {
  query: string;
  setQuery: (value: string) => void;
  onSearch: () => void;
  loading: boolean;
};

export default function AISearch({
  query,
  setQuery,
  onSearch,
  loading,
}: AISearchProps) {
  return (
    <div className="mx-auto max-w-7xl px-6 pb-12">
      <div className="flex max-w-3xl gap-3">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSearch();
            }
          }}
          placeholder="Try: running shoes under ₹4000"
          className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-black focus:ring-2 focus:ring-gray-200"
        />

        <button
          onClick={onSearch}
          disabled={loading || !query.trim()}
          className="rounded-xl bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Searching..." : "Ask AI"}
        </button>
      </div>
    </div>
  );
}
