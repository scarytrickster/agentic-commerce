"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/header";
import ProductDetails from "@/components/products/ProductDetails";
import ProductGrid from "@/components/home/ProductGrid";
import type { Product } from "@/types/product";
import { apiFetch } from "@/lib/api";

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProduct = useCallback(async () => {
    await Promise.resolve();
    const productId = Number(id);
    if (!Number.isInteger(productId) || productId < 1) {
      setError("Product not found.");
      setLoading(false);
      return;
    }
    try {
      const selectedProduct = await apiFetch<Product>(`/products/${productId}`);
      setProduct(selectedProduct);
      try {
        const params = new URLSearchParams({ category: selectedProduct.category, limit: "5" });
        const recommendations = await apiFetch<{ results: Product[] }>(`/products/recommendations?${params}`);
        setRelated(recommendations.results.filter((item) => item.id !== selectedProduct.id).slice(0, 4));
      } catch {
        setRelated([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load this product.");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => void fetchProduct(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchProduct]);

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#20342b]"><Header />
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <Link href="/#shop" className="mb-6 inline-flex text-sm text-stone-500 transition hover:text-[#20342b]">← Back to the collection</Link>
        {loading ? <div className="grid gap-8 md:grid-cols-2"><div className="aspect-square animate-pulse rounded-[2rem] bg-stone-200/70" /><div className="h-96 animate-pulse rounded-[2rem] bg-stone-200/70" /></div> : error || !product ? <div role="alert" className="rounded-[1.75rem] border border-stone-200 bg-white p-10 text-center"><p className="text-stone-600">{error || "Product not found."}</p><button onClick={() => { setLoading(true); setError(""); void fetchProduct(); }} className="mt-4 font-semibold text-[#526c4e] underline">Try again</button></div> : <ProductDetails product={product} />}
        {!loading && product && related.length > 0 && <section className="mt-16"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#78916c]">More to explore</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">You may also like</h2><div className="mt-6"><ProductGrid products={related} loading={false} /></div></section>}
      </main>
    </div>
  );
}
