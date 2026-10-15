"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import { apiFetch } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password.length < 8 || password.length > 128) {
      setError("Password must be between 8 and 128 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/auth/signup", { method: "POST", body: JSON.stringify({ email, password }) });
      router.push("/login?created=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#20342b]"><Header />
      <main className="mx-auto grid min-h-[calc(100vh-74px)] max-w-7xl items-center gap-12 px-5 py-12 sm:px-8 lg:grid-cols-2">
        <div className="hidden rounded-[2rem] bg-[#e9eadf] p-12 lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#526c4e]">Make it yours</p>
          <h1 className="mt-5 max-w-md text-5xl font-semibold leading-tight tracking-[-0.05em]">A better way to find your next favorite.</h1>
          <p className="mt-5 max-w-sm leading-7 text-stone-600">Create an account to keep your cart and orders together.</p>
          <div className="mt-12 flex h-40 items-center justify-center rounded-3xl bg-white/60 text-6xl text-[#78916c]">✳</div>
        </div>
        <div className="mx-auto w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-7 shadow-xl shadow-stone-900/[0.03] sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#78916c]">Join the store</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Create an account</h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">It only takes a moment to get started.</p>
          <form onSubmit={handleSignup} className="mt-8 space-y-5">
            <div><label htmlFor="email" className="mb-2 block text-sm font-medium">Email address</label><input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-[#78916c] focus:ring-2 focus:ring-[#78916c]/15" placeholder="you@example.com" /></div>
            <div><label htmlFor="password" className="mb-2 block text-sm font-medium">Password</label><input id="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-[#78916c] focus:ring-2 focus:ring-[#78916c]/15" placeholder="At least 8 characters" /><p className="mt-1.5 text-xs text-stone-400">Use 8–128 characters.</p></div>
            <div><label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">Confirm password</label><input id="confirmPassword" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-[#78916c] focus:ring-2 focus:ring-[#78916c]/15" placeholder="Enter your password again" /></div>
            {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            <button type="submit" disabled={loading} className="w-full rounded-full bg-[#243d32] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#182d23] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78916c] disabled:cursor-wait disabled:opacity-60">{loading ? "Creating account…" : "Create account"}</button>
          </form>
          <p className="mt-6 text-center text-sm text-stone-500">Already a member? <Link href="/login" className="font-semibold text-[#3f624c] underline">Log in</Link></p>
        </div>
      </main>
    </div>
  );
}
