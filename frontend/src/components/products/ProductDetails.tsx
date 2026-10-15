"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/product";
import { apiFetch, formatPrice } from "@/lib/api";
import { useAuth } from "@/components/layout/AuthProvider";

export default function ProductDetails({ product }: { product: Product }) {
  const router = useRouter();
  const { user, refreshCart } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  async function handleAddToCart() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/products/${product.id}`)}`);
      return;
    }
    setAdding(true);
    setError("");
    setAdded(false);
    try {
      await apiFetch("/cart/items", { method: "POST", body: JSON.stringify({ product_id: product.id, quantity }) });
      await refreshCart();
      setAdded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add this item to your cart.");
    } finally {
      setAdding(false);
    }
  }

  function buyNow() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/checkout?product_id=${product.id}&quantity=${quantity}`)}`);
      return;
    }
    router.push(`/checkout?product_id=${product.id}&quantity=${quantity}`);
  }

  return (
    <div className="grid gap-8 rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm sm:p-7 md:grid-cols-2 md:gap-12 md:p-9">
      <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-[1.5rem] bg-[#f3f2ed] p-6 sm:min-h-[440px]">
        {product.image_url ? <Image src={product.image_url} alt={product.name} width={720} height={720} className="max-h-[500px] w-full object-contain" /> : <span className="text-6xl text-[#8c9a7b]">✳</span>}
        <span className="absolute left-4 top-4 rounded-full bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stone-600 backdrop-blur">{product.category}</span>
      </div>
      <div className="flex flex-col justify-center px-2 py-3 sm:px-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#78916c]">A good find</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#20342b] sm:text-4xl">{product.name}</h1>
        <p className="mt-5 text-3xl font-semibold tracking-tight">{formatPrice(product.price)}</p>
        <p className={`mt-4 text-sm font-medium ${product.stock > 0 ? "text-[#63805d]" : "text-red-700"}`}>{product.stock > 0 ? `${product.stock} in stock` : "Currently out of stock"}</p>
        <div className="my-6 h-px bg-stone-200" />
        <h2 className="text-sm font-semibold">Details</h2>
        <p className="mt-2 whitespace-pre-line text-sm leading-7 text-stone-600">{product.description || "No description is available for this product."}</p>
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <div className="flex items-center rounded-full border border-stone-200"><button aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="h-11 w-11 text-lg disabled:opacity-30">−</button><span className="w-8 text-center text-sm tabular-nums">{quantity}</span><button aria-label="Increase quantity" disabled={quantity >= product.stock} onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))} className="h-11 w-11 text-lg disabled:opacity-30">+</button></div>
          <span className="text-xs text-stone-400">Max {product.stock}</span>
        </div>
        {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {added && <p role="status" className="mt-4 rounded-xl border border-[#d9e0d4] bg-[#f1f4ed] p-3 text-sm text-[#3f624c]">Added to your cart. <Link href="/cart" className="font-semibold underline">View cart</Link></p>}
        {!user && <p className="mt-4 text-xs text-stone-500">Sign in is required to add items to your cart.</p>}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button onClick={() => void handleAddToCart()} disabled={product.stock < 1 || adding} className="rounded-full bg-[#243d32] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#182d23] disabled:cursor-not-allowed disabled:opacity-50">{adding ? "Adding…" : "Add to cart"}</button>
          <button onClick={buyNow} disabled={product.stock < 1} className="rounded-full border border-[#243d32] px-5 py-3.5 text-sm font-semibold text-[#243d32] transition hover:bg-[#f1f4ed] disabled:cursor-not-allowed disabled:opacity-50">Buy now</button>
        </div>
      </div>
    </div>
  );
}
