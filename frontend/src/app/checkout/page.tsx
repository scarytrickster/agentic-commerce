"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import { useAuth } from "@/components/layout/AuthProvider";
import { apiFetch, formatPrice, type Cart, type Order } from "@/lib/api";
import type { Product } from "@/types/product";

type CheckoutLine = {
  product_id: number;
  product_name: string;
  quantity: number;
  price: string | number;
  image_url: string | null;
  stock: number;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshCart } = useAuth();
  const [lines, setLines] = useState<CheckoutLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const loadCheckout = useCallback(async (preserveError = false) => {
    await Promise.resolve();
    if (!preserveError) setError("");
    try {
      const params = new URLSearchParams(window.location.search);
      const productId = Number(params.get("product_id"));
      if (params.has("product_id")) {
        const quantity = Number(params.get("quantity") ?? "1");
        if (!Number.isInteger(productId) || productId < 1 || !Number.isInteger(quantity) || quantity < 1) throw new Error("This checkout link is invalid.");
        const product = await apiFetch<Product>(`/products/${productId}`);
        setLines([{ product_id: product.id, product_name: product.name, quantity, price: product.price, image_url: product.image_url, stock: product.stock }]);
      } else {
        const cart = await apiFetch<Cart>("/cart/");
        setLines(cart.items.map((item) => ({ product_id: item.product_id, product_name: item.product_name, quantity: item.quantity, price: item.price, image_url: item.image_url, stock: item.stock })));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load checkout details.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.replace(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    if (!user) return;
    const timer = window.setTimeout(() => void loadCheckout(), 0);
    return () => window.clearTimeout(timer);
  }, [authLoading, user, router, loadCheckout]);

  const total = lines.reduce((sum, line) => sum + Number(line.price) * line.quantity, 0);

  async function placeOrder() {
    if (placing || !lines.length) return;
    setPlacing(true);
    setError("");
    try {
      const order = await apiFetch<Order>("/orders", {
        method: "POST",
        body: JSON.stringify({ items: lines.map(({ product_id, quantity }) => ({ product_id, quantity })) }),
      });
      await refreshCart();
      router.replace(`/orders/${order.id}?placed=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order placement failed. Please try again.");
      await loadCheckout(true);
    } finally {
      setPlacing(false);
    }
  }

  if (authLoading || !user) return <div className="min-h-screen bg-[#fbfaf7]"><Header /><p className="py-24 text-center text-stone-500">Checking your account…</p></div>;

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#20342b]"><Header />
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <Link href="/cart" className="text-sm text-stone-500 hover:text-[#20342b]">← Back to cart</Link>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#78916c]">Almost yours</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Review your order</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">Order placement records your order and updates stock availability. This project does not currently collect delivery details or process payment.</p>
        {error && <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><p>{error}</p>{!lines.length && <button onClick={() => { setLoading(true); void loadCheckout(); }} className="mt-2 font-semibold underline">Try again</button>}</div>}
        {loading ? <div className="mt-8 h-48 animate-pulse rounded-3xl bg-stone-200/70" /> : lines.length ? <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
          <section className="divide-y divide-stone-200 rounded-[1.75rem] border border-stone-200 bg-white px-5 sm:px-7">
            <h2 className="py-5 text-lg font-semibold">Items ({lines.reduce((sum, line) => sum + line.quantity, 0)})</h2>
            {lines.map((line) => <article key={line.product_id} className="flex items-center gap-4 py-5">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f3f2ed]">{line.image_url ? <Image src={line.image_url} alt={line.product_name} width={120} height={120} className="h-full w-full object-contain p-2" /> : <span className="text-2xl text-[#8c9a7b]">✳</span>}</div>
              <div className="min-w-0 flex-1"><p className="font-medium">{line.product_name}</p><p className="mt-1 text-sm text-stone-500">Qty {line.quantity} · {formatPrice(line.price)} each</p>{line.quantity > line.stock && <p className="mt-1 text-xs font-medium text-red-700">Only {line.stock} currently available.</p>}</div>
              <p className="shrink-0 font-semibold">{formatPrice(Number(line.price) * line.quantity)}</p>
            </article>)}
          </section>
          <aside className="rounded-[1.75rem] border border-stone-200 bg-white p-6 sm:p-7"><h2 className="text-xl font-semibold">Order summary</h2><div className="mt-6 flex justify-between border-t border-stone-100 pt-5"><span className="text-sm text-stone-500">Total</span><span className="font-semibold">{formatPrice(total)}</span></div><div className="mt-5 rounded-2xl bg-[#f4f5ef] p-4"><p className="text-sm font-semibold">No payment collected</p><p className="mt-1 text-xs leading-5 text-stone-500">The order will be recorded as pending. Payment and delivery are not set up yet.</p></div><button onClick={() => void placeOrder()} disabled={placing || !lines.length || lines.some((line) => line.quantity > line.stock)} className="mt-6 w-full rounded-full bg-[#243d32] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#182d23] disabled:cursor-not-allowed disabled:opacity-50">{placing ? "Placing order…" : "Place order"}</button></aside>
        </div> : !error ? <div className="mt-8 rounded-[1.75rem] border border-dashed border-stone-300 bg-white p-12 text-center"><h2 className="text-xl font-semibold">There’s nothing to check out</h2><p className="mt-2 text-sm text-stone-500">Your cart is empty.</p><Link href="/#shop" className="mt-5 inline-flex rounded-full bg-[#243d32] px-5 py-3 text-sm font-semibold text-white">Browse products</Link></div> : null}
      </main>
    </div>
  );
}
