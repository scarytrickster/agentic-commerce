
import type { Product } from "@/types/product";
import ProductCard from "./ProductCard";

type ProductGridProps = {
  products: Product[];
  loading: boolean;
};

export default function ProductGrid({
  products,
  loading,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="py-12 text-center text-gray-500">
        Loading products...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        No products found.
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 pb-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
