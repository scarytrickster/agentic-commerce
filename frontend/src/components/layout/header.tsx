
import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Agentic Commerce
          </h1>

          <p className="text-sm text-gray-500">
            AI-powered shopping
          </p>
        </div>

        <Link
          href="/cart"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          🛒 Cart
        </Link>
      </div>
    </header>
  );
}
