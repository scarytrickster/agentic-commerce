
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

const API_URL = "http://127.0.0.1:8000";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

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
          ? `${API_URL}/products`
          : `${API_URL}/products?category=${encodeURIComponent(category)}`;

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
      const response = await fetch(`${API_URL}/agent`, {
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
      <Header />

      <section className="border-b bg-white">
        <HeroSection />

        <AISearch
          query={query}
          setQuery={setQuery}
          onSearch={handleAgentSearch}
          loading={agentLoading}
        />

        {agentResult && (
          <AgentResults result={agentResult} />
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        <ProductGrid
          products={products}
          loading={loading}
        />
      </section>
    </main>
  );
}
