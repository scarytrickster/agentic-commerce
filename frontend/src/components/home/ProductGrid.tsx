import type { Product } from "@/types/product";
import ProductCard from "./ProductCard";

type ProductGridProps = {
  products: Product[];
  loading: boolean;
};

export default function ProductGrid({ products, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4" aria-label="Loading products" aria-busy="true">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="rounded-[1.35rem] border border-stone-200/80 bg-white p-2.5">
            <div className="aspect-[4/3] animate-pulse rounded-2xl bg-stone-100" />
            <div className="space-y-3 px-2 pb-2 pt-4"><div className="h-4 w-4/5 animate-pulse rounded bg-stone-100" /><div className="h-4 w-1/3 animate-pulse rounded bg-stone-100" /></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <div className="rounded-3xl border border-dashed border-stone-300 bg-white/70 py-16 text-center text-stone-500">No products found in this category yet.</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}
