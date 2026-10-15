
"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/types/product";

const API_URL = "http://127.0.0.1:8000";

type ProductDetailsProps = {
  product: Product;
};

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [adding, setAdding] = useState(false);

  async function handleAddToCart() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please log in to add items to your cart.");
      return;
    }

    setAdding(true);

    try {
      const response = await fetch(`${API_URL}/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to add product to cart");
      }

      alert("Product added to cart!");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="grid gap-12 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2 md:p-10">
      <div className="flex min-h-[400px] items-center justify-center rounded-xl bg-gray-100 p-8">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            width={600}
            height={600}
            className="max-h-[450px] w-full object-contain"
          />
        ) : (
          <p className="text-gray-400">No image available</p>
        )}
      </div>

      <div className="flex flex-col justify-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
          {product.category}
        </p>

        <h1 className="text-3xl font-bold leading-tight md:text-4xl">
          {product.name}
        </h1>

        <p className="mt-6 text-3xl font-bold">
          ₹{Number(product.price).toLocaleString("en-IN")}
        </p>

        <div className="my-6 h-px bg-gray-200" />

        <h2 className="mb-2 text-lg font-semibold">
          Product description
        </h2>

        <p className="max-h-52 overflow-y-auto whitespace-pre-line text-sm leading-7 text-gray-600">
          {product.description || "No description available."}
        </p>

        <p
          className={`mt-5 text-sm font-medium ${
            product.stock > 0 ? "text-green-700" : "text-red-600"
          }`}
        >
          {product.stock > 0
            ? `${product.stock} units available`
            : "Currently out of stock"}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || adding}
            className="flex-1 rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {adding ? "Adding..." : "Add to Cart"}
          </button>

          <button
            disabled={product.stock === 0}
            className="flex-1 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-900 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
