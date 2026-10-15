
import Link from "next/link";
import type { Product } from "@/types/product";
import Image from "next/image";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex h-52 items-center justify-center bg-gray-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            width={300}
            height={300}
            className="h-full w-full object-contain p-4 transition group-hover:scale-105"
          />
        ) : (
          <span className="text-sm text-gray-400">No image available</span>
        )}
      </div>

      <div className="space-y-2 p-4">
        <p className="text-xs text-gray-500">{product.category}</p>

        <h3 className="line-clamp-2 font-semibold text-gray-900">
          {product.name}
        </h3>

        <p className="font-bold text-gray-900">
          ₹{Number(product.price).toLocaleString("en-IN")}
        </p>

        <p className="text-xs text-gray-500">
          {product.stock > 0 ? "In stock" : "Out of stock"}
        </p>
      </div>
    </Link>
  );
}
