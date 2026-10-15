
type CategoryFilterProps = {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
};

const categories = [
  "All",
  "Electronics",
  "Fashion",
  "Home",
  "Books",
  "Sports",
];

export default function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="mx-auto flex max-w-7xl flex-wrap gap-3 px-6 py-6">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`rounded-full px-5 py-2 text-sm font-medium transition ${
            selectedCategory === category
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
