import Link from "next/link";
import Header from "@/components/layout/header";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#20342b]"><Header />
      <main className="mx-auto flex min-h-[calc(100vh-74px)] max-w-7xl items-center justify-center px-5 py-12 sm:px-8">
        <section className="w-full max-w-lg rounded-[2rem] border border-stone-200 bg-white p-8 shadow-xl shadow-stone-900/[0.03] sm:p-10">
          <Link href="/login" className="text-sm font-medium text-stone-500 hover:text-[#20342b]">← Back to login</Link>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-[#78916c]">Account support</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Password reset isn’t available yet</h1>
          <p className="mt-4 text-sm leading-7 text-stone-600">This store’s backend does not have a password reset or email verification flow, so it can’t send a reset link. No request has been submitted. Please contact the store administrator for help accessing your account.</p>
          <Link href="/login" className="mt-7 inline-flex rounded-full bg-[#243d32] px-5 py-3 text-sm font-semibold text-white hover:bg-[#182d23]">Return to log in</Link>
        </section>
      </main>
    </div>
  );
}
