"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import { useAuth } from "@/components/layout/AuthProvider";
import { apiFetch, formatPrice, type Order } from "@/lib/api";
import { useSearchParam } from "@/lib/useSearchParam";

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const placed = useSearchParam("placed") === "1";

  const loadOrder = useCallback(async () => {
    await Promise.resolve();
    const orderId = Number(params.id);
    if (!Number.isInteger(orderId) || orderId < 1) {
      setError("That order number is not valid.");
      setLoading(false);
      return;
    }
    try {
      setOrder(await apiFetch<Order>(`/orders/${orderId}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load this order.");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (!authLoading && !user) router.replace(`/login?next=${encodeURIComponent(`/orders/${params.id}`)}`);
    if (!user) return;
    const timer = window.setTimeout(() => void loadOrder(), 0);
    return () => window.clearTimeout(timer);
  }, [authLoading, user, router, params.id, loadOrder]);

  if (authLoading || !user) return <div className="min-h-screen bg-[#fbfaf7]"><Header /><p className="py-24 text-center text-stone-500">Checking your account…</p></div>;

  return <div className="min-h-screen bg-[#fbfaf7] text-[#20342b]"><Header /><main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
    <Link href="/orders" className="text-sm text-stone-500 hover:text-[#20342b]">← All orders</Link>
    {placed && order && <div role="status" className="mt-6 rounded-2xl border border-[#d9e0d4] bg-[#f1f4ed] p-5"><p className="font-semibold text-[#3f624c]">Order placed successfully.</p><p className="mt-1 text-sm text-stone-600">Your order is recorded as {order.status}. No payment was processed.</p></div>}
    {error && <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"><p>{error}</p><button onClick={() => { setLoading(true); setError(""); void loadOrder(); }} className="mt-2 font-semibold underline">Try again</button></div>}
    {loading ? <div className="mt-8 h-72 animate-pulse rounded-3xl bg-stone-200/70" /> : order ? <>
      <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-[#78916c]">Order details</p><div className="mt-2 flex flex-wrap items-end justify-between gap-4"><h1 className="text-4xl font-semibold tracking-tight">Order #{order.id}</h1><span className="rounded-full bg-[#f1f4ed] px-4 py-2 text-sm font-medium capitalize text-[#3f624c]">{order.status}</span></div><p className="mt-2 text-sm text-stone-500">Placed {new Date(order.created_at).toLocaleString()}</p>
      <section className="mt-8 rounded-[1.75rem] border border-stone-200 bg-white p-5 sm:p-7"><h2 className="text-lg font-semibold">Items</h2><div className="mt-4 divide-y divide-stone-100">{order.items.map((item) => <div key={`${item.product_id}-${item.product_name}`} className="flex items-start justify-between gap-4 py-4"><div><p className="font-medium">{item.product_name}</p><p className="mt-1 text-sm text-stone-500">Qty {item.quantity} · {formatPrice(item.unit_price)} each</p></div><p className="font-semibold">{formatPrice(item.unit_price * item.quantity)}</p></div>)}</div><div className="flex justify-between border-t border-stone-200 pt-5"><span className="font-medium">Order total</span><span className="text-lg font-semibold">{formatPrice(order.total_amount)}</span></div></section>
      <section className="mt-5 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-stone-200 bg-white p-5"><p className="text-xs uppercase tracking-wider text-stone-400">Order status</p><p className="mt-2 font-medium capitalize">{order.status}</p></div><div className="rounded-2xl border border-stone-200 bg-white p-5"><p className="text-xs uppercase tracking-wider text-stone-400">Payment status</p><p className="mt-2 font-medium capitalize">{order.payment_status}</p><p className="mt-1 text-xs text-stone-500">No payment processing is configured.</p></div></section>
    </> : null}
    <Link href="/#shop" className="mt-8 inline-flex text-sm font-semibold text-[#526c4e] underline">Continue shopping</Link>
  </main></div>;
}
