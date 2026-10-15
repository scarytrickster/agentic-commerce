"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";

export default function Header() {
  const router = useRouter();
  const { user, loading, cartCount, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    if (!search.trim()) event.preventDefault();
    setMenuOpen(false);
  }

  function signOut() {
    logout();
    setMenuOpen(false);
    router.push("/");
  }

  const navLinks = (
    <>
      <Link href="/#shop" onClick={() => setMenuOpen(false)} className="transition hover:text-[#20342b]">Shop all</Link>
      <Link href="/#categories" onClick={() => setMenuOpen(false)} className="transition hover:text-[#20342b]">Categories</Link>
      <Link href="/#assistant" onClick={() => setMenuOpen(false)} className="transition hover:text-[#20342b]">AI shopping</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-[#fbfaf7]/95 backdrop-blur">
      <div className="mx-auto flex min-h-[74px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Agentic Commerce home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#243d32] text-base font-bold text-[#f2c879]">a.</span>
          <span className="hidden text-lg font-semibold tracking-tight text-[#20342b] sm:block">Agentic<span className="font-normal text-stone-500"> Commerce</span></span>
        </Link>

        <form action="/#shop" method="get" onSubmit={submitSearch} className="hidden w-full max-w-[330px] items-center rounded-full border border-stone-200 bg-white px-4 py-2 focus-within:border-[#78916c] lg:flex">
          <label htmlFor="site-search" className="sr-only">Search products</label>
          <span aria-hidden="true" className="mr-2 text-lg text-stone-400">⌕</span>
          <input id="site-search" name="q" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the store" className="min-w-0 flex-1 bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400" />
          <button aria-label="Submit product search" className="text-xs font-semibold text-[#526c4e]">Search</button>
        </form>

        <nav className="hidden items-center gap-6 text-[13px] font-medium text-stone-600 xl:flex" aria-label="Store navigation">{navLinks}</nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link href="/cart" className="relative rounded-full border border-stone-200 bg-white px-3.5 py-2 text-sm font-semibold text-[#20342b] transition hover:border-[#243d32]" aria-label={`Cart, ${cartCount} items`}>
            <span aria-hidden="true">🛍</span><span className="ml-1.5 hidden sm:inline">Cart</span>
            <span className="ml-1.5 inline-flex min-w-5 justify-center rounded-full bg-[#d6bd83] px-1.5 py-0.5 text-[10px] font-bold text-[#243d32]">{cartCount}</span>
          </Link>
          {!loading && user ? (
            <div className="group relative">
              <button className="hidden max-w-40 truncate rounded-full px-3 py-2 text-sm font-semibold text-[#20342b] hover:bg-stone-100 sm:block" aria-haspopup="true">{user.email}</button>
              <div className="absolute right-0 top-full hidden w-48 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl group-focus-within:block group-hover:block">
                <Link href="/profile" className="block rounded-xl px-3 py-2 text-sm text-stone-700 hover:bg-stone-50">My profile</Link>
                <Link href="/orders" className="block rounded-xl px-3 py-2 text-sm text-stone-700 hover:bg-stone-50">My orders</Link>
                <button onClick={signOut} className="w-full rounded-xl px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50">Sign out</button>
              </div>
            </div>
          ) : !loading ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login" className="rounded-full px-3 py-2 text-sm font-semibold text-[#20342b] hover:bg-stone-100">Log in</Link>
              <Link href="/signup" className="rounded-full bg-[#243d32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#182d23]">Sign up</Link>
            </div>
          ) : null}
          <button onClick={() => setMenuOpen((open) => !open)} className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-lg text-[#20342b] xl:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>{menuOpen ? "×" : "☰"}</button>
        </div>
      </div>

      {menuOpen && <div className="border-t border-stone-200 bg-[#fbfaf7] px-5 py-4 xl:hidden">
        <form action="/#shop" method="get" onSubmit={submitSearch} className="mb-4 flex items-center rounded-full border border-stone-200 bg-white px-4 py-2">
          <label htmlFor="mobile-site-search" className="sr-only">Search products</label>
          <input id="mobile-site-search" name="q" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-none" />
          <button className="text-sm font-semibold text-[#526c4e]">Search</button>
        </form>
        <nav className="flex flex-col gap-4 py-2 text-sm font-medium text-stone-700" aria-label="Mobile store navigation">{navLinks}
          {user ? <><Link href="/profile" onClick={() => setMenuOpen(false)}>My profile</Link><Link href="/orders" onClick={() => setMenuOpen(false)}>My orders</Link><button onClick={signOut} className="text-left">Sign out</button></> : <><Link href="/login" onClick={() => setMenuOpen(false)}>Log in</Link><Link href="/signup" onClick={() => setMenuOpen(false)}>Sign up</Link></>}
        </nav>
      </div>}
    </header>
  );
}
