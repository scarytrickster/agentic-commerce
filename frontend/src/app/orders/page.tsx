"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import { useAuth } from "@/components/layout/AuthProvider";
import { apiFetch, formatPrice, type Order } from "@/lib/api";

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    try {
      setOrders(await apiFetch<Order[]>("/orders"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login?next=%2Forders");
    if (!user) return;
    const timer = window.setTimeout(() => void loadOrders(), 0);
    return () => window.clearTimeout(timer);
  }, [authLoading, user, router, loadOrders]);

  if (authLoading || !user) return <div className="min-h-screen bg-[#fbfaf7]"><Header /><p className="py-24 text-center text-stone-500">Checking your account…</p></div>;

  return <div className="min-h-screen bg-[#fbfaf7] text-[#20342b]"><Header /><main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#78916c]">Your account</p><div className="mt-2 flex flex-wrap items-end justify-between gap-4"><h1 className="text-4xl font-semibold tracking-tight">Your orders</h1><div className="flex gap-4 text-sm"><Link href="/profile" className="text-stone-500 underline">Profile</Link><Link href="/cart" className="text-stone-500 underline">Cart</Link></div></div>
    {error && <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><p>{error}</p><button onClick={() => { setLoading(true); setError(""); void loadOrders(); }} className="mt-2 font-semibold underline">Try again</button></div>}
    {loading ? <div className="mt-8 space-y-4"><div className="h-32 animate-pulse rounded-3xl bg-stone-200/70" /><div className="h-32 animate-pulse rounded-3xl bg-stone-200/70" /></div> : orders.length ? <div className="mt-8 space-y-4">{orders.map((order) => <Link key={order.id} href={`/orders/${order.id}`} className="block rounded-[1.5rem] border border-stone-200 bg-white p-5 transition hover:border-stone-300 hover:shadow-lg hover:shadow-stone-900/5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-wider text-stone-400">Order #{order.id}</p><p className="mt-1 text-sm text-stone-500">{new Date(order.created_at).toLocaleString()}</p></div><div className="text-right"><p className="font-semibold">{formatPrice(order.total_amount)}</p><p className="mt-1 text-xs capitalize text-stone-500">{order.status} · payment {order.payment_status}</p></div></div><div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-stone-100 pt-4 text-sm text-stone-600">{order.items.map((item) => <span key={`${order.id}-${item.product_id}`}>{item.product_name} <span className="text-stone-400">× {item.quantity}</span></span>)}</div></Link>)}</div> : !error ? <div className="mt-8 rounded-[1.75rem] border border-dashed border-stone-300 bg-white px-6 py-16 text-center"><h2 className="text-xl font-semibold">No orders yet</h2><p className="mt-2 text-sm text-stone-500">Your next favorite find is waiting.</p><Link href="/#shop" className="mt-5 inline-flex rounded-full bg-[#243d32] px-5 py-3 text-sm font-semibold text-white">Explore the store</Link></div> : null}
  </main></div>;
}
