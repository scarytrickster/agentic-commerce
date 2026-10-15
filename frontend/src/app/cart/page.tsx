"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import { useAuth } from "@/components/layout/AuthProvider";
import { apiFetch, formatPrice, type Cart } from "@/lib/api";

export default function CartPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshCart } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyItem, setBusyItem] = useState<number | null>(null);

  const loadCart = useCallback(async () => {
    try {
      setCart(await apiFetch<Cart>("/cart/"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your cart.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login?next=%2Fcart");
    if (!user) return;
    const timer = window.setTimeout(() => void loadCart(), 0);
    return () => window.clearTimeout(timer);
  }, [authLoading, user, router, loadCart]);

  async function changeQuantity(productId: number, quantity: number) {
    setBusyItem(productId);
    setError("");
    try {
      const updated = quantity === 0
        ? await apiFetch<Cart>(`/cart/items/${productId}`, { method: "DELETE" })
        : await apiFetch<Cart>(`/cart/items/${productId}`, { method: "PATCH", body: JSON.stringify({ quantity }) });
      setCart(updated);
      await refreshCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update your cart.");
    } finally {
      setBusyItem(null);
    }
  }

  if (authLoading || !user) return <div className="min-h-screen bg-[#fbfaf7]"><Header /><p className="py-24 text-center text-stone-500">Checking your account…</p></div>;

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#20342b]"><Header />
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <Link href="/" className="text-sm text-stone-500 hover:text-[#20342b]">← Continue shopping</Link>
        <div className="mb-8 mt-5 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#78916c]">Your picks</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Shopping cart</h1></div>{cart && <span className="text-sm text-stone-500">{cart.items.reduce((sum, item) => sum + item.quantity, 0)} items</span>}</div>
        {error && <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><p>{error}</p><button onClick={() => { setLoading(true); setError(""); void loadCart(); }} className="mt-2 font-semibold underline">Try again</button></div>}
        {loading ? <div className="grid gap-4 lg:grid-cols-[1fr_340px]"><div className="h-48 animate-pulse rounded-3xl bg-stone-200/70" /><div className="h-56 animate-pulse rounded-3xl bg-stone-200/70" /></div> : cart?.items.length ? (
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
            <div className="divide-y divide-stone-200 rounded-[1.75rem] border border-stone-200 bg-white px-5 sm:px-7">
              {cart.items.map((item) => <article key={item.product_id} className="flex gap-4 py-5 sm:gap-6">
                <Link href={`/products/${item.product_id}`} className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f3f2ed] sm:h-32 sm:w-32">
                  {item.image_url ? <Image src={item.image_url} alt={item.product_name} width={160} height={160} className="h-full w-full object-contain p-3" /> : <span className="text-3xl text-[#8c9a7b]">✳</span>}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="min-w-0"><p className="text-xs uppercase tracking-wider text-stone-400">{item.category}</p><Link href={`/products/${item.product_id}`} className="mt-1 block font-medium text-[#20342b] hover:underline">{item.product_name}</Link><p className="mt-2 text-sm text-stone-500">{formatPrice(item.price)} each</p></div>
                  <div className="flex items-center justify-between gap-5 sm:flex-col sm:items-end"><p className="font-semibold">{formatPrice(item.subtotal)}</p><div className="flex items-center rounded-full border border-stone-200">
                    <button aria-label={`Decrease ${item.product_name} quantity`} disabled={busyItem === item.product_id} onClick={() => void changeQuantity(item.product_id, item.quantity - 1)} className="h-9 w-9 text-lg text-stone-600 hover:text-[#20342b] disabled:opacity-40">−</button>
                    <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
                    <button aria-label={`Increase ${item.product_name} quantity`} disabled={busyItem === item.product_id || item.quantity >= item.stock} onClick={() => void changeQuantity(item.product_id, item.quantity + 1)} className="h-9 w-9 text-lg text-stone-600 hover:text-[#20342b] disabled:opacity-40">+</button>
                  </div><button onClick={() => void changeQuantity(item.product_id, 0)} disabled={busyItem === item.product_id} className="text-xs text-stone-400 underline hover:text-red-700 disabled:opacity-40">Remove</button></div>
                </div>
              </article>)}
            </div>
            <aside className="rounded-[1.75rem] border border-stone-200 bg-white p-6 sm:p-7"><h2 className="text-xl font-semibold">Order summary</h2><div className="mt-6 flex justify-between border-t border-stone-100 pt-5 text-sm"><span className="text-stone-500">Subtotal</span><span className="font-semibold">{formatPrice(cart.total_amount)}</span></div><p className="mt-3 text-xs leading-5 text-stone-400">Shipping and any applicable charges are confirmed separately. No payment is collected at order placement.</p><Link href="/checkout" className="mt-6 block rounded-full bg-[#243d32] px-5 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-[#182d23]">Proceed to checkout <span aria-hidden="true">→</span></Link></aside>
          </div>
        ) : !error ? <div className="rounded-[1.75rem] border border-dashed border-stone-300 bg-white px-6 py-20 text-center"><span className="text-4xl text-[#78916c]">♧</span><h2 className="mt-4 text-2xl font-semibold">Your cart is taking a little break</h2><p className="mt-2 text-sm text-stone-500">Explore the store and add something you love.</p><Link href="/#shop" className="mt-6 inline-flex rounded-full bg-[#243d32] px-6 py-3 text-sm font-semibold text-white">Explore the collection</Link></div> : null}
      </main>
    </div>
  );
}
