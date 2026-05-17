export type ProductStatus = 'live' | 'out_of_stock' | 'archived';
export type ProductCategory = 'Bakery' | 'Fast Food' | 'Vegetables' | 'Fruits' | 'Frozen' | 'Beverages' | 'Dairy' | 'Meals' | 'Snacks' | 'Produce';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  stock: number;
  originalPrice: number;
  aiPrice: number;
  expiry: string;
  status: ProductStatus;
  image: string;
  storeId: string;
  storeName: string;
  discount: number;
  createdAt: string;
  rating?: number;
  reviewCount?: number;
  co2Saved?: number;
  rescuedScore?: number;
  ingredients?: string[];
  allergens?: string[];
  nutrition?: { calories: number; protein: number; carbs: number; fat: number; fiber: number };
  distance?: number;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  openHours: string;
  distance: number;
  dealsCount: number;
  image: string;
  since: string;
}

async function api(path: string, options?: RequestInit) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) return null;
  return res.json();
}

function parseProduct(p: any): Product {
  return {
    ...p,
    ingredients: typeof p.ingredients === 'string' ? JSON.parse(p.ingredients || '[]') : p.ingredients || [],
    allergens: typeof p.allergens === 'string' ? JSON.parse(p.allergens || '[]') : p.allergens || [],
    nutrition: typeof p.nutrition === 'string' ? JSON.parse(p.nutrition || '{}') : p.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  };
}

export const productService = {
  async getAll(): Promise<Product[]> {
    const res = await api('/products');
    return (res || []).map(parseProduct);
  },

  async getById(id: string): Promise<Product | undefined> {
    const res = await api(`/products?id=${id}`);
    return res ? parseProduct(res) : undefined;
  },

  async getByStore(storeId: string): Promise<Product[]> {
    const res = await api(`/products?storeId=${storeId}`);
    return (res || []).map(parseProduct);
  },

  async getLive(): Promise<Product[]> {
    const res = await api('/products?live=true');
    return (res || []).map(parseProduct);
  },

  async getByCategory(category: string): Promise<Product[]> {
    const res = await api(`/products?category=${encodeURIComponent(category)}`);
    return (res || []).map(parseProduct);
  },

  async getNearby(maxDistance: number): Promise<Product[]> {
    const res = await api(`/products?nearby=${maxDistance}`);
    return (res || []).map(parseProduct);
  },

  async getTopRated(limit: number = 10): Promise<Product[]> {
    const res = await api(`/products?topRated=${limit}`);
    return (res || []).map(parseProduct);
  },

  async getEndingSoon(hours: number = 2): Promise<Product[]> {
    const res = await api(`/products?endingSoon=${hours}`);
    return (res || []).map(parseProduct);
  },

  async create(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const res = await api('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
    return res ? parseProduct(res) : {} as Product;
  },

  async update(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const res = await api('/products', {
      method: 'PATCH',
      body: JSON.stringify({ id, ...updates }),
    });
    return res ? parseProduct(res) : undefined;
  },

  async delete(id: string): Promise<boolean> {
    await api('/products', { method: 'DELETE', body: JSON.stringify({ id }) });
    return true;
  },

  async search(query: string): Promise<Product[]> {
    const res = await api(`/products?q=${encodeURIComponent(query)}`);
    return (res || []).map(parseProduct);
  },

  async getStores(): Promise<Store[]> {
    const res = await api('/stores');
    return Array.isArray(res) ? res : [];
  },

  async getStoreById(id: string): Promise<Store | undefined> {
    const res = await api(`/stores?id=${id}`);
    return res || undefined;
  },

  async getCategories(): Promise<string[]> {
    const res = await api('/categories');
    return Array.isArray(res) ? res : [];
  },
};
