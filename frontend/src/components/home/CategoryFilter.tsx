type CategoryFilterProps = {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
};

const categories = ["All", "Electronics", "Fashion", "Home", "Books", "Sports"];

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <nav id="categories" aria-label="Shop by category" className="scroll-mt-28">
      <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((category) => (
          <button
            key={category}
            aria-pressed={selectedCategory === category}
            onClick={() => onCategoryChange(category)}
            className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition ${
              selectedCategory === category
                ? "bg-[#243d32] text-white shadow-md shadow-[#243d32]/10"
                : "border border-stone-200 bg-white text-stone-600 hover:border-stone-400 hover:text-[#20342b]"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </nav>
  );
}
