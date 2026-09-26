"use client";

import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: string;
  category: string;
  stock: number;
  image_url: string | null;
};

type AgentProduct = {
  id: number;
  name: string;
  price: string;
  category: string;
  stock: number;
  image_url: string | null;
};

type AgentResponse = {
  response: string;
  products: AgentProduct[];
  cross_sell_products: AgentProduct[];
};

const categories = [
  "All",
  "Running Shoes",
  "Clothing",
  "Electronics",
  "Bags & Accessories",
  "Wearables",
  "Home & Lifestyle",
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  // AI agent state
  const [query, setQuery] = useState("");
  const [agentResult, setAgentResult] =
    useState<AgentResponse | null>(null);
  const [agentLoading, setAgentLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts(category = "All") {
    setLoading(true);

    try {
      const url =
        category === "All"
          ? "http://127.0.0.1:8000/products"
          : `http://127.0.0.1:8000/products?category=${encodeURIComponent(
              category
            )}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data: Product[] = await response.json();

      setProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAgentSearch() {
    if (!query.trim()) return;

    setAgentLoading(true);
    setAgentResult(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/agent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: query,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get agent response");
      }

      const data: AgentResponse = await response.json();

      setAgentResult(data);
    } catch (error) {
      console.error("Agent search failed:", error);
    } finally {
      setAgentLoading(false);
    }
  }

  function handleCategoryChange(category: string) {
    setSelectedCategory(category);
    fetchProducts(category);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
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

          <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
            🛒 Cart
          </button>
        </div>
      </header>

      {/* Hero / AI Search */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900">
            Find what you need.
          </h2>

          <p className="mt-3 max-w-2xl text-gray-600">
            Browse products or use our AI shopping assistant to
            find products using natural language.
          </p>

          {/* AI Search Bar */}
          <div className="mt-8 flex max-w-3xl gap-3">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleAgentSearch();
                }
              }}
              placeholder="Try: running shoes under ₹4000"
              className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-black focus:ring-2 focus:ring-gray-200"
            />

            <button
              onClick={handleAgentSearch}
              disabled={agentLoading || !query.trim()}
              className="rounded-xl bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {agentLoading ? "Searching..." : "Ask AI"}
            </button>
          </div>

          {/* AI Response */}
          {agentResult && (
            <div className="mt-6 max-w-3xl rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm font-semibold text-gray-900">
                AI Shopping Assistant
              </p>

              <p className="mt-2 text-gray-700">
                {agentResult.response}
              </p>

              {/* AI Recommended Products */}
              {agentResult.products.length > 0 && (
                <div className="mt-5">
                  <p className="text-sm font-semibold text-gray-900">
                    Recommended Products
                  </p>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {agentResult.products.map((product) => (
                      <div
                        key={product.id}
                        className="flex gap-3 rounded-xl bg-white p-3 ring-1 ring-gray-200"
                      >
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                            No image
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-medium text-gray-900">
                            {product.name}
                          </p>

                          <p className="mt-1 text-sm font-bold text-gray-900">
                            ₹{product.price}
                          </p>

                          <p className="text-xs text-gray-500">
                            {product.stock} in stock
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cross Sell Products */}
              {agentResult.cross_sell_products.length > 0 && (
                <div className="mt-5">
                  <p className="text-sm font-semibold text-gray-900">
                    You may also like
                  </p>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {agentResult.cross_sell_products.map(
                      (product) => (
                        <div
                          key={product.id}
                          className="flex gap-3 rounded-xl bg-white p-3 ring-1 ring-gray-200"
                        >
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-16 w-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                              No image
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-medium text-gray-900">
                              {product.name}
                            </p>

                            <p className="mt-1 text-sm font-bold text-gray-900">
                              ₹{product.price}
                            </p>

                            <p className="text-xs text-gray-500">
                              {product.stock} in stock
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Product Store */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* Categories */}
        <div className="mb-8 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedCategory === category
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-20 text-center text-gray-500">
            Loading products...
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="py-20 text-center text-gray-500">
            No products found.
          </div>
        )}

        {/* Product Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function ProductCard({
  product,
}: {
  product: Product;
}) {
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-md">
      {/* Product Image */}
      <div className="aspect-square bg-gray-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {product.category}
        </p>

        <h3 className="mt-2 line-clamp-2 min-h-12 font-semibold text-gray-900">
          {product.name}
        </h3>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-lg font-bold text-gray-900">
            ₹{product.price}
          </p>

          <span className="text-xs text-gray-500">
            {product.stock} in stock
          </span>
        </div>

        <button className="mt-4 w-full rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800">
          View Product
        </button>
      </div>
    </article>
  );
}