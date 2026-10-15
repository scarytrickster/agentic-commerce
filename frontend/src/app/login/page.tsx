"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import { apiFetch, setAccessToken } from "@/lib/api";
import { useSearchParam } from "@/lib/useSearchParam";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const created = useSearchParam("created") === "1";

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch<{ access_token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setAccessToken(data.access_token);
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next?.startsWith("/") && !next.startsWith("//") ? next : "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#20342b]"><Header />
      <main className="mx-auto grid min-h-[calc(100vh-74px)] max-w-7xl items-center gap-12 px-5 py-12 sm:px-8 lg:grid-cols-2">
        <div className="hidden rounded-[2rem] bg-[#243d32] p-12 text-white lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d6bd83]">Welcome back</p>
          <h1 className="mt-5 max-w-md text-5xl font-semibold leading-tight tracking-[-0.05em]">Good finds are just around the corner.</h1>
          <p className="mt-5 max-w-sm leading-7 text-white/65">Sign in to pick up where you left off and keep your shopping in one place.</p>
          <div className="mt-12 flex h-40 items-center justify-center rounded-3xl bg-white/5 text-6xl text-[#d6bd83]">✳</div>
        </div>
        <div className="mx-auto w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-7 shadow-xl shadow-stone-900/[0.03] sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#78916c]">Your account</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Log in</h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">Welcome back to Agentic Commerce.</p>
          {created && <p role="status" className="mt-5 rounded-xl border border-[#d9e0d4] bg-[#f1f4ed] p-3 text-sm text-[#3f624c]">Your account is ready. Log in to continue.</p>}
          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div><label htmlFor="email" className="mb-2 block text-sm font-medium">Email address</label><input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-[#78916c] focus:ring-2 focus:ring-[#78916c]/15" placeholder="you@example.com" /></div>
            <div><div className="mb-2 flex items-center justify-between"><label htmlFor="password" className="text-sm font-medium">Password</label><Link href="/forgot-password" className="text-xs font-medium text-[#526c4e] underline">Forgot password?</Link></div><input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-[#78916c] focus:ring-2 focus:ring-[#78916c]/15" placeholder="Enter your password" /></div>
            {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            <button type="submit" disabled={loading} className="w-full rounded-full bg-[#243d32] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#182d23] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78916c] disabled:cursor-wait disabled:opacity-60">{loading ? "Logging in…" : "Log in"}</button>
          </form>
          <p className="mt-6 text-center text-sm text-stone-500">New here? <Link href="/signup" className="font-semibold text-[#3f624c] underline">Create an account</Link></p>
        </div>
      </main>
    </div>
  );
}
