"use client";

import { useEffect, useMemo, useState } from "react";
import { getCategories, getProducts, Category, Product } from "../lib/storage";

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setCategories(getCategories());
    setProducts(getProducts());
  }, []);

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchCategory =
        activeCategory === "All" || product.category === activeCategory;

      const name = product.name?.toLowerCase() || "";
      const barcode = product.barcode?.toLowerCase() || "";

      const matchSearch =
        !q || name.includes(q) || barcode.includes(q);

      return matchCategory && matchSearch;
    });
  }, [products, activeCategory, searchTerm]);

  const gallery =
    selectedProduct?.images && selectedProduct.images.length > 0
      ? selectedProduct.images
      : selectedProduct?.image
        ? [selectedProduct.image]
        : [];

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-4xl font-bold text-yellow-400">
          Jewelry Collection
        </h1>

        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or barcode"
          className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-3 outline-none"
        />
      </div>

      <div className="mb-10 flex flex-wrap gap-3">
        <button
          onClick={() => setActiveCategory("All")}
          className={`rounded-full border px-5 py-2 transition ${
            activeCategory === "All"
              ? "border-yellow-500 bg-yellow-500 text-black"
              : "border-zinc-700 bg-zinc-900 text-white"
          }`}
        >
          All
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.name)}
            className={`rounded-full border px-5 py-2 transition ${
              activeCategory === category.name
                ? "border-yellow-500 bg-yellow-500 text-black"
                : "border-zinc-700 bg-zinc-900 text-white"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {filteredProducts.map((product) => (
          <button
            key={product.id}
            onClick={() => {
              setSelectedProduct(product);
              setActiveImageIndex(0);
            }}
            className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-left transition hover:border-yellow-500"
          >
            <div className="aspect-[9/16] w-full overflow-hidden rounded-2xl">
              <img
                src={
                  (product.images && product.images[0]) ||
                  product.image ||
                  "https://via.placeholder.com/600x1066?text=Jewelry"
                }
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>

            <h2 className="mt-4 text-xl font-semibold">{product.name}</h2>

            <p className="mt-2 text-gray-400">{product.description}</p>

            <div className="mt-2 text-yellow-400">{product.category}</div>

            <div className="mt-1 text-sm text-cyan-400">
              Barcode: {product.barcode}
            </div>
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center text-gray-400">
          No matching products found
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative flex w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl md:flex-row">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/60 px-4 py-2 text-sm text-white backdrop-blur hover:bg-red-500"
            >
              Close
            </button>

            <div className="flex w-full flex-col items-center justify-center bg-black p-6 md:w-1/2">
              <div className="aspect-[9/16] w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-800">
                <img
                  src={
                    gallery[activeImageIndex] ||
                    "https://via.placeholder.com/600x1066?text=Jewelry"
                  }
                  alt={selectedProduct.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {gallery.length > 1 && (
                <div className="mt-4 grid w-full max-w-sm grid-cols-4 gap-2">
                  {gallery.map((img, index) => (
                    <button
                      key={img + index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`overflow-hidden rounded-xl border ${
                        activeImageIndex === index
                          ? "border-yellow-500"
                          : "border-zinc-700"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="h-20 w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center p-10 md:w-1/2">
              <h2 className="mb-4 text-3xl font-bold text-yellow-400">
                {selectedProduct.name}
              </h2>

              <p className="mb-6 text-lg leading-8 text-gray-300">
                {selectedProduct.description}
              </p>

              <div className="mb-4 inline-block w-fit rounded-full border border-yellow-500/30 bg-yellow-500/10 px-5 py-2 text-sm text-yellow-300">
                {selectedProduct.category}
              </div>

              <div className="text-base text-cyan-400">
                Barcode: {selectedProduct.barcode}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}