
import Link from "next/link";
import type { AgentResponse, AgentProduct } from "@/types/product";

type AgentResultsProps = {
  result: AgentResponse;
};

function RecommendedProduct({ product }: { product: AgentProduct }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="flex gap-3 rounded-xl bg-white p-3 ring-1 ring-gray-200 transition hover:ring-gray-400"
    >
      {product.image_url ? (
        <img
          src={product.image_url}
          alt={product.name}
          className="h-16 w-16 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
          No image
        </div>
      )}

      <div className="min-w-0">
        <p className="line-clamp-2 text-sm font-medium text-gray-900">
          {product.name}
        </p>

        <p className="mt-1 text-sm font-bold text-gray-900">
          ₹{product.price}
        </p>

        <p className="text-xs text-gray-500">
          {product.stock} in stock
        </p>
      </div>
    </Link>
  );
}

export default function AgentResults({ result }: AgentResultsProps) {
  return (
    <div className="mx-auto mt-6 max-w-7xl px-6 pb-8">
      <div className="max-w-3xl rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <p className="text-sm font-semibold text-gray-900">
          AI Shopping Assistant
        </p>

        <p className="mt-2 text-gray-700">{result.response}</p>

        {result.products.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-semibold text-gray-900">
              Recommended Products
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {result.products.map((product) => (
                <RecommendedProduct
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          </div>
        )}

        {result.cross_sell_products.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-semibold text-gray-900">
              You may also like
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {result.cross_sell_products.map((product) => (
                <RecommendedProduct
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
