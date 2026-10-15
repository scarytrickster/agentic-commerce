import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const price = Number(product.price);

  return (
    <Link
      href={`/products/${product.id}`}
      className="group rounded-[1.35rem] border border-stone-200/80 bg-white p-2.5 transition duration-300 hover:-translate-y-1 hover:border-stone-300 hover:shadow-xl hover:shadow-stone-900/5"
    >
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[1rem] bg-[#f3f2ed]">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            width={480}
            height={360}
            className="h-full w-full object-contain p-6 transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl text-[#8c9a7b] shadow-sm" aria-label="No product image available">✳</div>
        )}
        <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-600 backdrop-blur">{product.category}</span>
      </div>

      <div className="px-2 pb-2 pt-4">
        <h3 className="line-clamp-2 min-h-11 text-sm font-medium leading-5 text-[#27372e]">{product.name}</h3>
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-base font-semibold tracking-tight text-[#20342b]">
            {Number.isFinite(price) ? `₹${price.toLocaleString("en-IN")}` : product.price}
          </p>
          <span className={`text-[11px] font-medium ${product.stock > 0 ? "text-[#63805d]" : "text-stone-400"}`}>
            {product.stock > 0 ? "Ready to ship" : "Out of stock"}
          </span>
        </div>
      </div>
    </Link>
  );
}
