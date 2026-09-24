"use client";

import { useState } from "react";

type AgentProduct = {
  id: number;
  name: string;
  price: string;
  category: string;
  stock: number;
};

type AgentResponse = {
  response: string;
  products: AgentProduct[];
  cross_sell_products: AgentProduct[];
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<AgentResponse | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);
    setSelectedProducts([]);

    try {
      const response = await fetch("http://127.0.0.1:8000/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: query,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get agent response");
      }

      const data: AgentResponse = await response.json();

      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function toggleProduct(productId: number) {
    setSelectedProducts((current) => {
      if (current.includes(productId)) {
        return current.filter((id) => id !== productId);
      }

      return [...current, productId];
    });
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Agentic Commerce
        </h1>

        <p className="mt-2 text-gray-600">
          Find products using natural language.
        </p>

        <div className="mt-8 flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearch();
              }
            }}
            placeholder="Try: running shoes under ₹4000"
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-900"
          />

          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {result && (
          <div className="mt-10">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                AI Assistant
              </h2>

              <p className="mt-3 whitespace-pre-wrap text-gray-700">
                {result.response}
              </p>
            </div>

            {result.products.length > 0 && (
              <section className="mt-8">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Recommended Products
                </h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {result.products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      selected={selectedProducts.includes(product.id)}
                      onToggle={toggleProduct}
                    />
                  ))}
                </div>
              </section>
            )}

            {result.cross_sell_products.length > 0 && (
              <section className="mt-10">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Optional Accessories
                </h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {result.cross_sell_products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      selected={selectedProducts.includes(product.id)}
                      onToggle={toggleProduct}
                    />
                  ))}
                </div>
              </section>
            )}

            {selectedProducts.length > 0 && (
              <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="font-medium text-gray-900">
                  {selectedProducts.length} product
                  {selectedProducts.length !== 1 ? "s" : ""} selected
                </p>

                <button
                  type="button"
                  className="mt-4 rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

type ProductCardProps = {
  product: AgentProduct;
  selected: boolean;
  onToggle: (productId: number) => void;
};

function ProductCard({
  product,
  selected,
  onToggle,
}: ProductCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">
        {product.name}
      </h3>

      <p className="mt-2 text-xl font-bold text-gray-900">
        ₹{product.price}
      </p>

      <p className="mt-2 text-sm text-gray-500">
        {product.stock} in stock
      </p>

      <button
        type="button"
        onClick={() => onToggle(product.id)}
        className={`mt-5 w-full rounded-lg px-4 py-2.5 font-medium ${
          selected
            ? "bg-gray-200 text-gray-900"
            : "bg-black text-white hover:bg-gray-800"
        }`}
      >
        {selected ? "Selected ✓" : "Select"}
      </button>
    </div>
  );
}