"use client";

import { ChangeEvent, useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import {
  getCategories,
  getProducts,
  saveCategories,
  saveProducts,
  Category,
  Product,
} from "../../lib/storage";

export default function AdminPage() {
  const [category, setCategory] = useState<string>("");
  const [productName, setProductName] = useState<string>("");
  const [productDesc, setProductDesc] = useState<string>("");
  const [productCategory, setProductCategory] = useState<string>("");
  const [productImages, setProductImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setCategories(getCategories());
    setProducts(getProducts());
  }, []);

  function resetProductForm() {
    setProductName("");
    setProductDesc("");
    setProductCategory("");
    setProductImages([]);
    setEditingProductId(null);
  }

  function handleAddCategory() {
    if (!category.trim()) return;

    const newCategory: Category = {
      id: Date.now(),
      name: category,
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
    if (!productName.trim() || !productDesc.trim() || !productCategory.trim()) {
      return;
    }

    const mainImage =
      productImages[0] || "https://via.placeholder.com/600x1066?text=Jewelry";

    if (editingProductId) {
      const updatedProducts = products.map((product) =>
        product.id === editingProductId
          ? {
              ...product,
              name: productName,
              description: productDesc,
              category: productCategory,
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

    const newProduct: Product = {
      id: Date.now(),
      name: productName,
      description: productDesc,
      category: productCategory,
      image: mainImage,
      images: productImages,
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
          maxSizeMB: 1,
          maxWidthOrHeight: 1600,
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

        const text = await response.text();

        let data: any = {};
        try {
          data = JSON.parse(text);
        } catch {
          data = { raw: text };
        }

        if (!response.ok) {
          console.error("Cloudinary upload error:", data);
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
      console.error("Unexpected upload error:", error);
      alert("Unexpected upload error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-4xl font-bold text-yellow-400">
          Admin Panel
        </h1>

        <div className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="mb-4 text-xl font-semibold">Add Category</h2>

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
                    Delete Category
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

          <div className="mt-6 space-y-2">
            {products.map((product) => {
              const gallery =
                product.images && product.images.length > 0
                  ? product.images
                  : product.image
                    ? [product.image]
                    : [];

              return (
                <div
                  key={product.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 p-3"
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

                  <div className="font-semibold">{product.name}</div>

                  <div className="text-sm text-gray-400">
                    {product.description}
                  </div>

                  <div className="text-sm text-yellow-400">
                    {product.category}
                  </div>

                  <div className="mt-3 flex gap-2">
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
          </div>
        </div>
      </div>
    </main>
  );
}