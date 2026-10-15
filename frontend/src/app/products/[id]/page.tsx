
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/header";
import type { Product } from "@/types/product";
import ProductDetails from "@/components/products/ProductDetails";

const API_URL = "http://127.0.0.1:8000";

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const products: Product[] = await response.json();
        const selectedProduct = products.find(
          (item) => item.id === Number(id)
        );

        if (!selectedProduct) {
          setError("Product not found");
          return;
        }

        setProduct(selectedProduct);
      } catch {
        setError("Unable to load product. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchProduct();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />

      {loading ? (
        <div className="py-24 text-center text-gray-600">
          Loading product...
        </div>
      ) : error || !product ? (
        <div className="py-24 text-center">
          <p className="text-gray-700">
            {error || "Product not found"}
          </p>
          <Link href="/" className="mt-4 inline-block text-blue-600">
            Back to products
          </Link>
        </div>
      ) : (
        <main className="mx-auto max-w-7xl px-6 py-10">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-black"
          >
            ← Back to products
          </Link>

          <ProductDetails product={product} />
        </main>
      )}
    </div>
  );
}