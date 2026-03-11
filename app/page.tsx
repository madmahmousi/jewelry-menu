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

type ViewMode = "gallery" | "story";

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("gallery");
  const [storyIndex, setStoryIndex] = useState(0);

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

  useEffect(() => {
    if (storyIndex > filteredProducts.length - 1) {
      setStoryIndex(0);
    }
  }, [filteredProducts, storyIndex]);

  const gallery =
    selectedProduct?.images && selectedProduct.images.length > 0
      ? selectedProduct.images
      : selectedProduct?.image
        ? [selectedProduct.image]
        : [];

  const currentStoryProduct =
    filteredProducts.length > 0 ? filteredProducts[storyIndex] : null;

  const currentStoryGallery =
    currentStoryProduct?.images && currentStoryProduct.images.length > 0
      ? currentStoryProduct.images
      : currentStoryProduct?.image
        ? [currentStoryProduct.image]
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

  function nextStory() {
    if (!filteredProducts.length) return;
    setStoryIndex((prev) => (prev + 1) % filteredProducts.length);
  }

  function prevStory() {
    if (!filteredProducts.length) return;
    setStoryIndex(
      (prev) => (prev - 1 + filteredProducts.length) % filteredProducts.length
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-[1600px] px-3 py-3 sm:px-5 sm:py-5 lg:px-6">
        <div className="mb-4 rounded-[28px] border border-zinc-800 bg-zinc-950 p-4 sm:p-5 lg:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-2 text-[10px] uppercase tracking-[0.28em] text-yellow-500/70 sm:text-xs">
                Luxury Showroom
              </div>
              <h1 className="text-2xl font-bold text-yellow-400 sm:text-3xl xl:text-5xl">
                Jewelry Collection
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
                Browse your collection in a professional iPad-friendly layout,
                search by barcode, and switch to story-style viewing.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 xl:max-w-2xl xl:flex-row">
              <input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setStoryIndex(0);
                }}
                placeholder="Search by name or barcode"
                className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none sm:text-base"
              />

              <div className="flex overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900">
                <button
                  onClick={() => setViewMode("gallery")}
                  className={`px-4 py-3 text-sm sm:text-base ${
                    viewMode === "gallery"
                      ? "bg-yellow-500 font-semibold text-black"
                      : "text-white"
                  }`}
                >
                  Gallery View
                </button>
                <button
                  onClick={() => {
                    setViewMode("story");
                    setStoryIndex(0);
                  }}
                  className={`px-4 py-3 text-sm sm:text-base ${
                    viewMode === "story"
                      ? "bg-yellow-500 font-semibold text-black"
                      : "text-white"
                  }`}
                >
                  Story Mode
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => {
              setActiveCategory("All");
              setStoryIndex(0);
            }}
            className={`rounded-full border px-4 py-2 text-sm transition ${
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
              onClick={() => {
                setActiveCategory(category.name);
                setStoryIndex(0);
              }}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                activeCategory === category.name
                  ? "border-yellow-500 bg-yellow-500 text-black"
                  : "border-zinc-700 bg-zinc-900 text-white"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {viewMode === "gallery" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const isSold = product.status === "sold";

              return (
                <button
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(product);
                    setActiveImageIndex(0);
                  }}
                  className={`overflow-hidden rounded-3xl border bg-zinc-950 p-4 text-left transition ${
                    isSold
                      ? "border-zinc-800 opacity-70 hover:border-zinc-700"
                      : "border-zinc-800 hover:border-yellow-500"
                  }`}
                >
                  <div className="mx-auto aspect-[9/16] w-full max-w-[300px] overflow-hidden rounded-2xl">
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

                  <p className="mt-2 text-sm leading-6 text-gray-400">
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
        ) : (
          <div className="rounded-[32px] border border-zinc-800 bg-zinc-950 p-3 sm:p-4 lg:p-5">
            {currentStoryProduct ? (
              <div className="grid min-h-[78vh] gap-4 xl:grid-cols-[420px_minmax(0,1fr)] 2xl:grid-cols-[460px_minmax(0,1fr)]">
                <div className="flex items-center justify-center rounded-[28px] bg-black p-4">
                  <div className="relative aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-[24px] border border-zinc-800 md:max-w-[340px] xl:max-w-[380px]">
                    <img
                      src={
                        currentStoryGallery[0] ||
                        "https://via.placeholder.com/600x1066?text=Jewelry"
                      }
                      alt={currentStoryProduct.name}
                      className="h-full w-full object-cover"
                    />

                    <div className="absolute inset-x-0 top-0 flex gap-1 p-3">
                      {filteredProducts.map((_, index) => (
                        <div
                          key={index}
                          className={`h-1 flex-1 rounded-full ${
                            index === storyIndex
                              ? "bg-yellow-400"
                              : "bg-white/20"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex min-h-0 flex-col rounded-[28px] bg-zinc-900/40 p-5 sm:p-6 xl:justify-between xl:p-8">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-bold text-yellow-400 sm:text-3xl xl:text-4xl">
                        {currentStoryProduct.name}
                      </h2>
                      <div
                        className={`rounded-full border px-3 py-1 text-[11px] sm:text-xs ${statusBadge(
                          currentStoryProduct.status
                        )}`}
                      >
                        {statusLabel[currentStoryProduct.status]}
                      </div>
                    </div>

                    <div className="mb-4 text-sm text-yellow-300/80 sm:text-base">
                      {currentStoryProduct.category}
                    </div>

                    <p className="max-w-3xl text-sm leading-7 text-gray-300 sm:text-base sm:leading-8 xl:text-lg">
                      {currentStoryProduct.description}
                    </p>

                    <div className="mt-5 text-sm text-cyan-400 sm:text-base">
                      Barcode: {currentStoryProduct.barcode}
                    </div>

                    {currentStoryGallery.length > 1 && (
                      <div className="mt-6 grid grid-cols-4 gap-2 sm:gap-3">
                        {currentStoryGallery.map((img, index) => (
                          <div
                            key={img + index}
                            className="overflow-hidden rounded-2xl border border-zinc-700"
                          >
                            <img
                              src={img}
                              alt={`${currentStoryProduct.name} ${index + 1}`}
                              className="h-20 w-full object-cover sm:h-24"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <button
                      onClick={prevStory}
                      className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm text-white sm:text-base"
                    >
                      Previous
                    </button>

                    <button
                      onClick={nextStory}
                      className="rounded-2xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-black sm:text-base"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[50vh] items-center justify-center rounded-[28px] bg-zinc-900/40 text-center text-gray-400">
                No matching products found
              </div>
            )}
          </div>
        )}

        {filteredProducts.length === 0 && viewMode === "gallery" && (
          <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center text-gray-400">
            No matching products found
          </div>
        )}

        {selectedProduct && (
          <div className="fixed inset-0 z-50 bg-black/90 p-3 sm:p-4">
            <div className="mx-auto flex h-full max-w-7xl items-center justify-center">
              <div className="relative flex h-full max-h-[96vh] w-full flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl xl:grid xl:grid-cols-[430px_minmax(0,1fr)]">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute right-3 top-3 z-20 rounded-full bg-black/60 px-4 py-2 text-xs text-white backdrop-blur hover:bg-red-500 sm:right-4 sm:top-4 sm:text-sm"
                >
                  Close
                </button>

                <div className="flex w-full flex-col items-center bg-black px-4 pb-4 pt-14 sm:px-5 xl:justify-center xl:p-5">
                  <div className="relative aspect-[9/16] w-full max-w-[260px] overflow-hidden rounded-2xl border border-zinc-800 sm:max-w-[300px] xl:max-w-[360px]">
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
                    <div className="mt-4 grid w-full max-w-[260px] grid-cols-4 gap-2 sm:max-w-[300px] xl:max-w-[360px]">
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

                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5 sm:p-6 xl:justify-center xl:p-10">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-bold text-yellow-400 sm:text-3xl xl:text-4xl">
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

                  <p className="mb-5 text-sm leading-7 text-gray-300 sm:text-base sm:leading-8 xl:text-lg">
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