"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getCategories,
  getProducts,
  Category,
  Product,
  ProductStatus,
  SortMode,
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
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [sortMode, setSortMode] = useState<SortMode>("mix");

  useEffect(() => {
    setCategories(getCategories());
    setProducts(getProducts());

    const savedTheme = localStorage.getItem("jewelry-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("jewelry-theme", theme);
  }, [theme]);

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    let result = products.filter((product) => {
      const matchCategory =
        activeCategory === "All" || product.category === activeCategory;

      const name = product.name?.toLowerCase() || "";
      const barcode = product.barcode?.toLowerCase() || "";
      const weight = String(product.weight ?? "");
      const matchSearch =
        !q || name.includes(q) || barcode.includes(q) || weight.includes(q);

      return matchCategory && matchSearch;
    });

    if (sortMode === "mix") {
      result = [...result].sort((a, b) => a.order - b.order);
    } else if (sortMode === "weight") {
      result = [...result].sort((a, b) => a.weight - b.weight);
    } else if (sortMode === "barcode") {
      result = [...result].sort((a, b) =>
        String(a.barcode).localeCompare(String(b.barcode))
      );
    }

    return result;
  }, [products, activeCategory, searchTerm, sortMode]);

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

  const isLight = theme === "light";

  return (
    <main
      className={`min-h-screen px-3 py-4 sm:px-5 sm:py-6 md:px-8 md:py-8 ${
        isLight ? "bg-zinc-100 text-zinc-900" : "bg-black text-white"
      }`}
    >
      <div className="mx-auto max-w-7xl">
        <div
          className={`mb-5 rounded-[24px] border p-4 sm:mb-6 sm:p-5 md:mb-8 md:p-8 ${
            isLight
              ? "border-zinc-200 bg-white"
              : "border-zinc-800 bg-zinc-950"
          }`}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div
                  className={`mb-2 text-[10px] uppercase tracking-[0.28em] sm:text-xs ${
                    isLight ? "text-amber-700/80" : "text-yellow-500/70"
                  }`}
                >
                  Luxury Showcase
                </div>
                <h1
                  className={`text-2xl font-bold sm:text-3xl md:text-5xl ${
                    isLight ? "text-amber-700" : "text-yellow-400"
                  }`}
                >
                  Jewelry Collection
                </h1>
                <p
                  className={`mt-2 max-w-2xl text-sm leading-6 md:text-base ${
                    isLight ? "text-zinc-600" : "text-zinc-400"
                  }`}
                >
                  Search by name, barcode, or weight and sort products the way
                  you want.
                </p>
              </div>

              <button
                onClick={() => setTheme(isLight ? "dark" : "light")}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold sm:text-base ${
                  isLight
                    ? "bg-zinc-900 text-white"
                    : "bg-yellow-500 text-black"
                }`}
              >
                {isLight ? "Dark Mode" : "Light Mode"}
              </button>
            </div>

            <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name / barcode / weight"
                className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none sm:text-base ${
                  isLight
                    ? "border-zinc-300 bg-zinc-50"
                    : "border-zinc-700 bg-zinc-900"
                }`}
              />

              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className={`rounded-2xl border px-4 py-3 text-sm outline-none sm:text-base ${
                  isLight
                    ? "border-zinc-300 bg-zinc-50"
                    : "border-zinc-700 bg-zinc-900"
                }`}
              >
                <option value="mix">Mix / Default</option>
                <option value="weight">Sort by Weight</option>
                <option value="barcode">Sort by Barcode</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2 sm:mb-6 md:mb-8 md:gap-3">
          <button
            onClick={() => setActiveCategory("All")}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              activeCategory === "All"
                ? isLight
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-yellow-500 bg-yellow-500 text-black"
                : isLight
                  ? "border-zinc-300 bg-white text-zinc-900"
                  : "border-zinc-700 bg-zinc-900 text-white"
            }`}
          >
            All
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.name)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                activeCategory === category.name
                  ? isLight
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-yellow-500 bg-yellow-500 text-black"
                  : isLight
                    ? "border-zinc-300 bg-white text-zinc-900"
                    : "border-zinc-700 bg-zinc-900 text-white"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => {
            const isSold = product.status === "sold";

            return (
              <button
                key={product.id}
                onClick={() => {
                  setSelectedProduct(product);
                  setActiveImageIndex(0);
                }}
                className={`overflow-hidden rounded-3xl border p-4 text-left transition ${
                  isSold ? "opacity-70" : ""
                } ${
                  isLight
                    ? "border-zinc-200 bg-white hover:border-zinc-400"
                    : "border-zinc-800 bg-zinc-950 hover:border-yellow-500"
                }`}
              >
                <div className="mx-auto aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-2xl">
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
                    className={`rounded-full border px-3 py-1 text-[11px] ${statusBadge(
                      product.status
                    )}`}
                  >
                    {statusLabel[product.status]}
                  </div>
                </div>

                <p
                  className={`mt-2 line-clamp-2 text-sm leading-6 ${
                    isLight ? "text-zinc-600" : "text-gray-400"
                  }`}
                >
                  {product.description}
                </p>

                <div
                  className={`mt-3 text-sm sm:text-base ${
                    isLight ? "text-amber-700" : "text-yellow-400"
                  }`}
                >
                  {product.category}
                </div>

                <div className="mt-1 text-xs text-cyan-400 sm:text-sm">
                  Barcode: {product.barcode}
                </div>

                <div className="mt-1 text-xs text-violet-500 sm:text-sm">
                  Weight: {product.weight}
                </div>
              </button>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div
            className={`mt-8 rounded-3xl border p-8 text-center ${
              isLight
                ? "border-zinc-200 bg-white text-zinc-500"
                : "border-zinc-800 bg-zinc-950 text-gray-400"
            }`}
          >
            No matching products found
          </div>
        )}

        {selectedProduct && (
          <div
            className={`fixed inset-0 z-50 p-3 sm:p-4 ${
              isLight ? "bg-black/70" : "bg-black/90"
            }`}
          >
            <div className="mx-auto flex h-full max-w-6xl items-center justify-center">
              <div
                className={`relative flex h-full max-h-[96vh] w-full flex-col overflow-hidden rounded-3xl border shadow-2xl xl:flex-row ${
                  isLight
                    ? "border-zinc-200 bg-white"
                    : "border-zinc-800 bg-zinc-950"
                }`}
              >
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute right-3 top-3 z-20 rounded-full bg-black/60 px-4 py-2 text-xs text-white backdrop-blur hover:bg-red-500 sm:right-4 sm:top-4 sm:text-sm"
                >
                  Close
                </button>

                <div className="flex w-full flex-col items-center bg-black px-4 pb-4 pt-14 sm:px-5 xl:w-1/2 xl:justify-center xl:p-5">
                  <div className="relative aspect-[9/16] w-full max-w-[260px] overflow-hidden rounded-2xl border border-zinc-800 sm:max-w-[300px]">
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
                    <div className="mt-4 grid w-full max-w-[260px] grid-cols-4 gap-2 sm:max-w-[300px]">
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

                <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto p-5 sm:p-6 xl:w-1/2 xl:justify-center xl:p-10">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <h2
                      className={`text-2xl font-bold sm:text-3xl ${
                        isLight ? "text-amber-700" : "text-yellow-400"
                      }`}
                    >
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

                  <p
                    className={`mb-5 text-sm leading-7 sm:text-base sm:leading-8 ${
                      isLight ? "text-zinc-700" : "text-gray-300"
                    }`}
                  >
                    {selectedProduct.description}
                  </p>

                  <div
                    className={`mb-4 inline-block w-fit rounded-full border px-5 py-2 text-sm ${
                      isLight
                        ? "border-amber-300 bg-amber-50 text-amber-700"
                        : "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
                    }`}
                  >
                    {selectedProduct.category}
                  </div>

                  <div className="text-sm text-cyan-400 sm:text-base">
                    Barcode: {selectedProduct.barcode}
                  </div>

                  <div className="mt-2 text-sm text-violet-500 sm:text-base">
                    Weight: {selectedProduct.weight}
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