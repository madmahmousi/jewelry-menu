export type Category = {
  id: number;
  name: string;
};

export type ProductStatus = "available" | "reserved" | "sold";

export type SortMode =
  | "mix"
  | "weightLight"
  | "weightHeavy"
  | "barcodeAsc"
  | "barcodeDesc";

export type Product = {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
  images?: string[];
  barcode: string;
  weight: number;
  status: ProductStatus;
  order: number;
};

const CATEGORY_KEY = "jewelry_categories";
const PRODUCT_KEY = "jewelry_products";

function normalizeProducts(rawProducts: any[]): Product[] {
  return rawProducts.map((product, index) => ({
    id: product.id ?? Date.now() + index,
    name: product.name ?? "",
    description: product.description ?? "",
    category: product.category ?? "",
    image:
      product.image || "https://via.placeholder.com/600x1066?text=Jewelry",
    images:
      Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : product.image
          ? [product.image]
          : [],
    barcode: product.barcode ?? "",
    weight:
      typeof product.weight === "number"
        ? product.weight
        : Number(product.weight ?? 0),
    status: product.status ?? "available",
    order: typeof product.order === "number" ? product.order : index,
  }));
}

export function getCategories(): Category[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(CATEGORY_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveCategories(categories: Category[]) {
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
}

export function getProducts(): Product[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(PRODUCT_KEY);
  if (!data) return [];
  const parsed = JSON.parse(data);
  return normalizeProducts(parsed);
}

export function saveProducts(products: Product[]) {
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
}