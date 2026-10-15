
"use client";

import { useEffect, useState } from "react";

import Header from "@/components/layout/header";
import HeroSection from "@/components/home/HeroSection";
import AISearch from "@/components/home/AISearch";
import AgentResults from "@/components/home/AgentResults";
import CategoryFilter from "@/components/home/CategoryFilter";
import ProductGrid from "@/components/home/ProductGrid";

import type {
  Product,
  AgentResponse,
} from "@/types/product";
import { apiFetch } from "@/lib/api";
import { useSearchParam } from "@/lib/useSearchParam";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const catalogQuery = useSearchParam("q").trim();

  const [query, setQuery] = useState("");
  const [agentResult, setAgentResult] =
    useState<AgentResponse | null>(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts(category = "All") {
    try {
      const path =
        category === "All"
          ? "/products"
          : `/products?category=${encodeURIComponent(category)}`;

      const data = await apiFetch<Product[]>(path);
      setProducts(data);
      setProductsError("");
    } catch (error) {
      console.error("Failed to load products:", error);
      setProductsError("We couldn’t load the collection. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAgentSearch() {
    if (!query.trim()) return;

    setAgentLoading(true);
    setAgentResult(null);
    setAgentError("");

    try {
      const data = await apiFetch<AgentResponse>("/agent", {
        method: "POST",
        body: JSON.stringify({
          message: query,
        }),
      });
      setAgentResult(data);
    } catch (error) {
      console.error("Agent search failed:", error);
      setAgentError(error instanceof Error ? error.message : "We couldn’t complete that search. Please try again.");
    } finally {
      setAgentLoading(false);
    }
  }

  function handleCategoryChange(category: string) {
    setSelectedCategory(category);
    setLoading(true);
    setProductsError("");
    fetchProducts(category);
  }

  const visibleProducts = products.filter((product) => {
    const term = catalogQuery.toLocaleLowerCase();
    return !term || `${product.name} ${product.category} ${product.description ?? ""}`.toLocaleLowerCase().includes(term);
  });

  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <Header />

      <section className="border-b border-stone-200/70 bg-[#fbfaf7]">
        <HeroSection />

        <AISearch
          query={query}
          setQuery={setQuery}
          onSearch={handleAgentSearch}
          loading={agentLoading}
        />

        {agentError && <p role="alert" className="mx-auto -mt-8 mb-8 max-w-7xl px-5 text-sm text-red-700 sm:px-8">{agentError}</p>}

        {agentResult && (
          <AgentResults result={agentResult} />
        )}
      </section>

      <section id="shop" className="mx-auto max-w-7xl scroll-mt-28 px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#78916c]">{catalogQuery ? "Your search" : "A little something for you"}</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#20342b] sm:text-4xl">{catalogQuery ? `Results for “${catalogQuery}”` : "Shop the collection"}</h2>
          </div>
          <p className="text-sm text-stone-500">Good finds for all the corners of your life.</p>
        </div>

        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        <div className="mt-6">
          {productsError ? (
            <div role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
              <p>{productsError}</p>
              <button onClick={() => { setLoading(true); setProductsError(""); void fetchProducts(selectedCategory); }} className="mt-3 font-semibold underline">Try again</button>
            </div>
          ) : <ProductGrid products={visibleProducts} loading={loading} />}
        </div>
      </section>

      <footer className="border-t border-stone-200 bg-[#f3f1eb]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span className="font-semibold text-[#20342b]">Agentic Commerce</span>
          <span>Thoughtful shopping, with a little help from AI.</span>
        </div>
      </footer>
    </main>
  );
}
