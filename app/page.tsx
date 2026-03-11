"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getCategories,
  getProducts,
  Category,
  Product,
  ProductStatus,
} from "../lib/storage";

const statusLabel: Record<ProductStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

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

  const orderedProducts = useMemo(() => {
    return [...products].sort((a, b) => a.order - b.order);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return orderedProducts.filter((product) => {
      const matchCategory =
        activeCategory === "All" || product.category === activeCategory;

      const name = product.name?.toLowerCase() || "";
      const barcode = product.barcode?.toLowerCase() || "";
      const matchSearch = !q || name.includes(q) || barcode.includes(q);

      return matchCategory && matchSearch;
    });
  }, [orderedProducts, activeCategory, searchTerm]);

  const gallery =
    selectedProduct?.images && selectedProduct.images.length > 0
      ? selectedProduct.images
      : selectedProduct?.image
        ? [selectedProduct.image]
        : [];

  function statusBadge(status: ProductStatus) {
    if (status === "available") {
      return "border-emerald-500/30 bg-emerald-500/15 text-emerald-300";
    }
    if (status === "reserved") {
      return "border-amber-500/30 bg-amber-500/15 text-amber-300";
    }
    return "border-red-500/30 bg-red-500/15 text-red-300";
  }

  function nextImage() {
    if (!gallery.length) return;
    setActiveImageIndex((prev) => (prev + 1) % gallery.length);
  }

  function prevImage() {
    if (!gallery.length) return;
    setActiveImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  }

  return (
    <main className="min-h-screen bg-black p-4 text-white sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-[28px] border border-zinc-800 bg-zinc-950 p-5 sm:p-6 md:mb-8 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 text-xs uppercase tracking-[0.3em] text-yellow-500/70 sm:text-sm">
                Luxury Showcase
              </div>
              <h1 className="text-3xl font-bold text-yellow-400 sm:text-4xl md:text-5xl">
                Jewelry Collection
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-400 sm:text-base">
                Search products by name or barcode and browse your collection in
                a clean showroom-style layout.
              </p>
            </div>

            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or barcode"
              className="w-full max-w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none sm:max-w-md sm:px-5 sm:text-base"
            />
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 sm:mb-8 sm:gap-3">
          <button
            onClick={() => setActiveCategory("All")}
            className={`rounded-full border px-4 py-2 text-sm transition sm:px-5 ${
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
              className={`rounded-full border px-4 py-2 text-sm transition sm:px-5 ${
                activeCategory === category.name
                  ? "border-yellow-500 bg-yellow-500 text-black"
                  : "border-zinc-700 bg-zinc-900 text-white"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 xl:gap-6">
          {filteredProducts.map((product) => {
            const isSold = product.status === "sold";

            return (
              <button
                key={product.id}
                onClick={() => {
                  setSelectedProduct(product);
                  setActiveImageIndex(0);
                }}
                className={`overflow-hidden rounded-3xl border bg-zinc-950 p-4 text-left transition sm:p-5 ${
                  isSold
                    ? "border-zinc-800 opacity-70 hover:border-zinc-700"
                    : "border-zinc-800 hover:border-yellow-500"
                }`}
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

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold sm:text-xl">
                    {product.name}
                  </h2>
                  <div
                    className={`rounded-full border px-3 py-1 text-[11px] sm:text-xs ${statusBadge(
                      product.status
                    )}`}
                  >
                    {statusLabel[product.status]}
                  </div>
                </div>

                <p className="mt-2 line-clamp-2 text-sm text-gray-400 sm:text-base">
                  {product.description}
                </p>

                <div className="mt-3 text-sm text-yellow-400 sm:text-base">
                  {product.category}
                </div>

                <div className="mt-1 text-xs text-cyan-400 sm:text-sm">
                  Barcode: {product.barcode}
                </div>
              </button>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center text-gray-400">
            No matching products found
          </div>
        )}

        {selectedProduct && (
          <div className="fixed inset-0 z-50 bg-black/90 p-3 sm:p-4">
            <div className="mx-auto flex h-full max-w-7xl items-center justify-center">
              <div className="relative flex max-h-[96vh] w-full flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl lg:flex-row">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute right-3 top-3 z-20 rounded-full bg-black/60 px-4 py-2 text-xs text-white backdrop-blur hover:bg-red-500 sm:right-4 sm:top-4 sm:text-sm"
                >
                  Close
                </button>

                <div className="flex w-full flex-col items-center justify-center bg-black p-4 sm:p-5 lg:w-1/2">
                  <div className="relative aspect-[9/16] w-full max-w-[260px] overflow-hidden rounded-2xl border border-zinc-800 sm:max-w-xs md:max-w-sm">
                    <img
                      src={
                        gallery[activeImageIndex] ||
                        "https://via.placeholder.com/600x1066?text=Jewelry"
                      }
                      alt={selectedProduct.name}
                      className="h-full w-full object-cover"
                    />

                    {gallery.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-white"
                        >
                          ‹
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-white"
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>

                  {gallery.length > 1 && (
                    <div className="mt-4 grid w-full max-w-[260px] grid-cols-4 gap-2 sm:max-w-xs md:max-w-sm">
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
                            className="h-16 w-full object-cover sm:h-20"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex w-full flex-col justify-center overflow-y-auto p-6 sm:p-8 lg:w-1/2 lg:p-10">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-bold text-yellow-400 sm:text-3xl">
                      {selectedProduct.name}
                    </h2>
                    <div
                      className={`rounded-full border px-3 py-1 text-[11px] sm:text-xs ${statusBadge(
                        selectedProduct.status
                      )}`}
                    >
                      {statusLabel[selectedProduct.status]}
                    </div>
                  </div>

                  <p className="mb-6 text-sm leading-7 text-gray-300 sm:text-base sm:leading-8 lg:text-lg">
                    {selectedProduct.description}
                  </p>

                  <div className="mb-4 inline-block w-fit rounded-full border border-yellow-500/30 bg-yellow-500/10 px-5 py-2 text-sm text-yellow-300">
                    {selectedProduct.category}
                  </div>

                  <div className="text-sm text-cyan-400 sm:text-base">
                    Barcode: {selectedProduct.barcode}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}