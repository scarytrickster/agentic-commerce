import Image from "next/image";
import Link from "next/link";
import type { AgentResponse, AgentProduct } from "@/types/product";
import { formatPrice } from "@/lib/api";

type AgentResultsProps = { result: AgentResponse };

function RecommendedProduct({ product }: { product: AgentProduct }) {
  return <Link href={`/products/${product.id}`} className="flex min-w-0 gap-3 rounded-2xl bg-white p-3 ring-1 ring-stone-200 transition hover:ring-stone-400">
    {product.image_url ? <Image src={product.image_url} alt={product.name} width={72} height={72} className="h-[4.5rem] w-[4.5rem] shrink-0 rounded-xl object-cover" /> : <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-xl bg-[#f3f2ed] text-2xl text-[#8c9a7b]">✳</div>}
    <div className="min-w-0"><p className="line-clamp-2 text-sm font-medium text-[#20342b]">{product.name}</p><p className="mt-1 text-sm font-semibold text-[#20342b]">{formatPrice(product.price)}</p><p className="text-xs text-stone-500">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p></div>
  </Link>;
}

export default function AgentResults({ result }: AgentResultsProps) {
  return <div className="mx-auto mt-6 max-w-7xl px-5 pb-8 sm:px-8">
    <div className="rounded-[1.75rem] border border-[#d9e0d4] bg-[#f1f4ed] p-5 sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#526c4e]">AI shopping assistant</p>
      <p className="mt-2 leading-7 text-stone-600">{result.response}</p>
      {result.products.length > 0 && <section className="mt-5"><h2 className="text-sm font-semibold text-[#20342b]">Recommended for you</h2><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{result.products.map((product) => <RecommendedProduct key={product.id} product={product} />)}</div></section>}
      {result.cross_sell_products.length > 0 && <section className="mt-5"><h2 className="text-sm font-semibold text-[#20342b]">You may also like</h2><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{result.cross_sell_products.map((product) => <RecommendedProduct key={product.id} product={product} />)}</div></section>}
    </div>
  </div>;
}
