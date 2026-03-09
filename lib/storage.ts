export type Category = {
  id: number;
  name: string;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
  images?: string[];
};

const CATEGORY_KEY = "jewelry_categories";
const PRODUCT_KEY = "jewelry_products";

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
  return data ? JSON.parse(data) : [];
}

export function saveProducts(products: Product[]) {
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
}