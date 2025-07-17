// src/lib/api/products.ts
// Chỉ gọi API, KHÔNG chứa business logic

const API_BASE = import.meta.env.PUBLIC_API_BASE || '/api';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  specifications: Record<string, any>;
}

export async function getProducts(filters?: {
  category?: string;
  priceRange?: [number, number];
  inStock?: boolean;
}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.priceRange) params.set('priceMin', filters.priceRange[0].toString());
  if (filters?.priceRange) params.set('priceMax', filters.priceRange[1].toString());
  if (filters?.inStock) params.set('inStock', 'true');

  const response = await fetch(`${API_BASE}/products?${params}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function getProductById(id: string): Promise<Product> {
  const response = await fetch(`${API_BASE}/products/${id}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}