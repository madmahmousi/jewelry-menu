"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import {
  getCategories,
  getProducts,
  saveCategories,
  saveProducts,
  Category,
  Product,
  ProductStatus,
} from "../../lib/storage";

const ADMIN_PASSWORD = "8569";

const statusOptions: { value: ProductStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
];

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const [category, setCategory] = useState("");
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productBarcode, setProductBarcode] = useState("");
  const [productStatus, setProductStatus] = useState<ProductStatus>("available");
  const [productImages, setProductImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productSearch, setProductSearch] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const importInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem("admin-auth");
    if (auth === "true") {
      setAuthenticated(true);
    }

    setCategories(getCategories());
    setProducts(getProducts());
  }, []);

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => a.order - b.order);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return sortedProducts;

    return sortedProducts.filter((product) => {
      const name = product.name?.toLowerCase() || "";
      const barcode = product.barcode?.toLowerCase() || "";
      const category = product.category?.toLowerCase() || "";
      const status = product.status?.toLowerCase() || "";

      return (
        name.includes(q) ||
        barcode.includes(q) ||
        category.includes(q) ||
        status.includes(q)
      );
    });
  }, [sortedProducts, productSearch]);

  const stats = useMemo(() => {
    return {
      totalProducts: products.length,
      totalCategories: categories.length,
      available: products.filter((p) => p.status === "available").length,
      sold: products.filter((p) => p.status === "sold").length,
    };
  }, [products, categories]);

  function resetProductForm() {
    setProductName("");
    setProductDesc("");
    setProductCategory("");
    setProductBarcode("");
    setProductStatus("available");
    setProductImages([]);
    setEditingProductId(null);
  }

  function handleLogout() {
    localStorage.removeItem("admin-auth");
    setAuthenticated(false);
    setPasswordInput("");
  }

  function handleAddCategory() {
    if (!category.trim()) return;

    const newCategory: Category = {
      id: Date.now(),
      name: category.trim(),
    };

    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    saveCategories(updatedCategories);
    setCategory("");
  }

  function handleDeleteCategory(id: number) {
    const categoryToDelete = categories.find((cat) => cat.id === id);
    if (!categoryToDelete) return;

    const updatedCategories = categories.filter((cat) => cat.id !== id);
    setCategories(updatedCategories);
    saveCategories(updatedCategories);

    const updatedProducts = products.filter(
      (product) => product.category !== categoryToDelete.name
    );
    setProducts(updatedProducts);
    saveProducts(updatedProducts);

    if (productCategory === categoryToDelete.name) {
      setProductCategory("");
    }
  }

  function handleSaveProduct() {
    if (
      !productName.trim() ||
      !productDesc.trim() ||
      !productCategory.trim() ||
      !productBarcode.trim()
    ) {
      alert("Please fill all fields, including barcode.");
      return;
    }

    const mainImage =
      productImages[0] || "https://via.placeholder.com/600x1066?text=Jewelry";

    if (editingProductId) {
      const updatedProducts = products.map((product) =>
        product.id === editingProductId
          ? {
              ...product,
              name: productName.trim(),
              description: productDesc.trim(),
              category: productCategory,
              barcode: productBarcode.trim(),
              status: productStatus,
              image: mainImage,
              images: productImages,
            }
          : product
      );

      setProducts(updatedProducts);
      saveProducts(updatedProducts);
      resetProductForm();
      return;
    }

    const maxOrder =
      products.length > 0 ? Math.max(...products.map((p) => p.order)) : -1;

    const newProduct: Product = {
      id: Date.now(),
      name: productName.trim(),
      description: productDesc.trim(),
      category: productCategory,
      barcode: productBarcode.trim(),
      status: productStatus,
      image: mainImage,
      images: productImages,
      order: maxOrder + 1,
    };

    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    saveProducts(updatedProducts);
    resetProductForm();
  }

  function handleDeleteProduct(id: number) {
    const updatedProducts = products.filter((product) => product.id !== id);
    setProducts(updatedProducts);
    saveProducts(updatedProducts);

    if (editingProductId === id) {
      resetProductForm();
    }
  }

  function handleEditProduct(product: Product) {
    setEditingProductId(product.id);
    setProductName(product.name);
    setProductDesc(product.description);
    setProductCategory(product.category);
    setProductBarcode(product.barcode || "");
    setProductStatus(product.status || "available");
    setProductImages(
      product.images && product.images.length > 0
        ? product.images
        : product.image
          ? [product.image]
          : []
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleRemovePreviewImage(index: number) {
    setProductImages((prev) => prev.filter((_, i) => i !== index));
  }

  function moveProduct(productId: number, direction: "up" | "down") {
    const ordered = [...products].sort((a, b) => a.order - b.order);
    const currentIndex = ordered.findIndex((p) => p.id === productId);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= ordered.length) return;

    [ordered[currentIndex], ordered[targetIndex]] = [
      ordered[targetIndex],
      ordered[currentIndex],
    ];

    const reOrdered = ordered.map((product, index) => ({
      ...product,
      order: index,
    }));

    setProducts(reOrdered);
    saveProducts(reOrdered);
  }

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const cloudName = "dsbmiysgs";
    const uploadPreset = "jewelry_unsigned";

    try {
      setUploading(true);

      const uploadedUrls: string[] = [];

      for (const originalFile of Array.from(files)) {
        const compressedFile = await imageCompression(originalFile, {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1200,
          initialQuality: 0.7,
          useWebWorker: true,
        });

        const formData = new FormData();
        formData.append("file", compressedFile);
        formData.append("upload_preset", uploadPreset);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          alert(
            "Cloudinary error: " +
              (data?.error?.message || data?.message || JSON.stringify(data))
          );
          return;
        }

        uploadedUrls.push(data.secure_url);
      }

      setProductImages((prev) => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error(error);
      alert("Unexpected upload error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function handleExportData() {
    const backupData = {
      categories,
      products,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jewelry-menu-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    importInputRef.current?.click();
  }

  function handleImportData(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = reader.result as string;
        const parsed = JSON.parse(text);

        const importedCategories: Category[] = Array.isArray(parsed.categories)
          ? parsed.categories
          : [];
        const importedProducts: Product[] = Array.isArray(parsed.products)
          ? parsed.products
          : [];

        setCategories(importedCategories);
        setProducts(importedProducts);

        saveCategories(importedCategories);
        saveProducts(importedProducts);

        alert("Data imported successfully");
      } catch (error) {
        console.error(error);
        alert("Invalid backup file");
      } finally {
        e.target.value = "";
      }
    };

    reader.readAsText(file);
  }

  function statusBadge(status: ProductStatus) {
    if (status === "available") {
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    }
    if (status === "reserved") {
      return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    }
    return "bg-red-500/15 text-red-300 border-red-500/30";
  }

  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">
          <h2 className="mb-6 text-2xl font-bold text-yellow-400">
            Admin Login
          </h2>

          <input
            type="password"
            placeholder="Enter password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="mb-4 w-full rounded-lg bg-zinc-800 p-3 outline-none"
          />

          <button
            onClick={() => {
              if (passwordInput === ADMIN_PASSWORD) {
                localStorage.setItem("admin-auth", "true");
                setAuthenticated(true);
              } else {
                alert("Wrong password");
              }
            }}
            className="w-full rounded-lg bg-yellow-500 p-3 font-semibold text-black"
          >
            Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-4xl font-bold text-yellow-400">Admin Panel</h1>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportData}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm text-white"
            >
              Export Data
            </button>

            <button
              onClick={handleImportClick}
              className="rounded-lg bg-cyan-500 px-4 py-2 text-sm text-white"
            >
              Import Data
            </button>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white"
            >
              Logout
            </button>

            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportData}
              className="hidden"
            />
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="text-sm text-zinc-400">Products</div>
            <div className="mt-2 text-3xl font-bold text-yellow-400">
              {stats.totalProducts}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="text-sm text-zinc-400">Categories</div>
            <div className="mt-2 text-3xl font-bold text-yellow-400">
              {stats.totalCategories}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="text-sm text-zinc-400">Available</div>
            <div className="mt-2 text-3xl font-bold text-emerald-400">
              {stats.available}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="text-sm text-zinc-400">Sold</div>
            <div className="mt-2 text-3xl font-bold text-red-400">
              {stats.sold}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <h2 className="mb-4 text-xl font-semibold">Category Management</h2>

              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category name"
                className="mb-4 w-full rounded-xl bg-zinc-900 p-3"
              />

              <button
                onClick={handleAddCategory}
                className="rounded-xl bg-yellow-500 px-6 py-2 text-black"
              >
                Add Category
              </button>

              <div className="mt-6 space-y-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span>{cat.name}</span>

                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">
                  {editingProductId ? "Edit Product" : "Add Product"}
                </h2>

                {editingProductId ? (
                  <button
                    onClick={resetProductForm}
                    className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-white"
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </div>

              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Product name"
                className="mb-4 w-full rounded-xl bg-zinc-900 p-3"
              />

              <textarea
                value={productDesc}
                onChange={(e) => setProductDesc(e.target.value)}
                placeholder="Product description"
                className="mb-4 w-full rounded-xl bg-zinc-900 p-3"
              />

              <input
                value={productBarcode}
                onChange={(e) => setProductBarcode(e.target.value)}
                placeholder="Barcode"
                className="mb-4 w-full rounded-xl bg-zinc-900 p-3"
              />

              <select
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                className="mb-4 w-full rounded-xl bg-zinc-900 p-3"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={productStatus}
                onChange={(e) => setProductStatus(e.target.value as ProductStatus)}
                className="mb-4 w-full rounded-xl bg-zinc-900 p-3"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="mb-4 w-full rounded-xl bg-zinc-900 p-3"
              />

              {uploading && (
                <p className="mb-4 text-sm text-yellow-400">Uploading images...</p>
              )}

              {productImages.length > 0 && (
                <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {productImages.map((img, index) => (
                    <div
                      key={img + index}
                      className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
                    >
                      <img
                        src={img}
                        alt={`Preview ${index + 1}`}
                        className="h-40 w-full object-cover"
                      />
                      <button
                        onClick={() => handleRemovePreviewImage(index)}
                        className="w-full bg-red-500 px-3 py-2 text-sm text-white"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleSaveProduct}
                className="rounded-xl bg-yellow-500 px-6 py-2 text-black"
              >
                {editingProductId ? "Update Product" : "Add Product"}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Products</h2>

              <input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search by name / barcode / category"
                className="w-full max-w-sm rounded-xl bg-zinc-900 p-3"
              />
            </div>

            <div className="space-y-3">
              {filteredProducts.map((product) => {
                const gallery =
                  product.images && product.images.length > 0
                    ? product.images
                    : product.image
                      ? [product.image]
                      : [];

                return (
                  <div
                    key={product.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
                  >
                    <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                      {gallery.map((img, index) => (
                        <div
                          key={img + index}
                          className="overflow-hidden rounded-xl"
                        >
                          <img
                            src={img}
                            alt={`${product.name} ${index + 1}`}
                            className="h-28 w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-semibold">{product.name}</div>
                      <div
                        className={`rounded-full border px-3 py-1 text-xs ${statusBadge(
                          product.status
                        )}`}
                      >
                        {product.status}
                      </div>
                    </div>

                    <div className="mt-1 text-sm text-gray-400">
                      {product.description}
                    </div>
                    <div className="mt-1 text-sm text-yellow-400">
                      {product.category}
                    </div>
                    <div className="mt-1 text-sm text-cyan-400">
                      Barcode: {product.barcode}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => moveProduct(product.id, "up")}
                        className="rounded-lg bg-zinc-700 px-4 py-2 text-sm text-white"
                      >
                        Move Up
                      </button>

                      <button
                        onClick={() => moveProduct(product.id, "down")}
                        className="rounded-lg bg-zinc-700 px-4 py-2 text-sm text-white"
                      >
                        Move Down
                      </button>

                      <button
                        onClick={() => handleEditProduct(product)}
                        className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white"
                      >
                        Edit Product
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white"
                      >
                        Delete Product
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center text-gray-400">
                  No products found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}