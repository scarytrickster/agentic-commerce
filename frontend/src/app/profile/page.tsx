"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import { useAuth } from "@/components/layout/AuthProvider";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=%2Fprofile");
  }, [loading, user, router]);

  if (loading || !user) return <div className="min-h-screen bg-[#fbfaf7]"><Header /><p className="py-24 text-center text-stone-500">Checking your account…</p></div>;

  return <div className="min-h-screen bg-[#fbfaf7] text-[#20342b]"><Header /><main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#78916c]">Your account</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Profile</h1><p className="mt-3 text-sm text-stone-500">Manage your shopping account and orders.</p>
    <div className="mt-8 grid gap-5 md:grid-cols-[1fr_300px]">
      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-6 sm:p-8"><h2 className="text-lg font-semibold">Account details</h2><dl className="mt-6 divide-y divide-stone-100"><div className="py-4"><dt className="text-xs uppercase tracking-wider text-stone-400">Email address</dt><dd className="mt-2 font-medium">{user.email}</dd></div><div className="py-4"><dt className="text-xs uppercase tracking-wider text-stone-400">Account ID</dt><dd className="mt-2 font-medium">{user.id}</dd></div></dl><p className="mt-2 rounded-xl bg-[#f4f5ef] p-4 text-xs leading-5 text-stone-500">Profile editing is not available in the current backend. These details are read-only.</p></section>
      <nav aria-label="Account navigation" className="flex flex-col gap-3"><Link href="/orders" className="rounded-2xl border border-stone-200 bg-white p-5 font-medium transition hover:border-stone-300">Your orders <span className="float-right text-stone-400">→</span></Link><Link href="/cart" className="rounded-2xl border border-stone-200 bg-white p-5 font-medium transition hover:border-stone-300">Shopping cart <span className="float-right text-stone-400">→</span></Link><button onClick={() => { logout(); router.replace("/"); }} className="rounded-2xl border border-stone-200 bg-white p-5 text-left font-medium text-stone-600 transition hover:border-red-200 hover:text-red-700">Sign out</button></nav>
    </div>
  </main></div>;
}
