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
  description?: string;
  details?: string;
  mfgDate?: string;
  expiryDate?: string;
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
    credentials: 'include',
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return res.json();
}

function safeJsonParse(str: string | null | undefined, fallback: any = []) {
  if (!str) return fallback;
  try { return JSON.parse(str); } catch { return fallback; }
}

function parseProduct(p: any): Product {
  const nutritionObj = typeof p.nutrition === 'string' ? safeJsonParse(p.nutrition, {}) : p.nutrition || {};
  return {
    ...p,
    ingredients: typeof p.ingredients === 'string' ? safeJsonParse(p.ingredients) : p.ingredients || [],
    allergens: typeof p.allergens === 'string' ? safeJsonParse(p.allergens) : p.allergens || [],
    nutrition: {
      calories: typeof nutritionObj.calories === 'number' ? nutritionObj.calories : parseInt(nutritionObj.calories) || 0,
      protein: typeof nutritionObj.protein === 'number' ? nutritionObj.protein : parseInt(nutritionObj.protein) || 0,
      carbs: typeof nutritionObj.carbs === 'number' ? nutritionObj.carbs : parseInt(nutritionObj.carbs) || 0,
      fat: typeof nutritionObj.fat === 'number' ? nutritionObj.fat : parseInt(nutritionObj.fat) || 0,
      fiber: typeof nutritionObj.fiber === 'number' ? nutritionObj.fiber : parseInt(nutritionObj.fiber) || 0,
    },
    description: p.description || nutritionObj.description || '',
    details: p.details || nutritionObj.details || '',
    mfgDate: p.mfg_date || p.mfgDate || nutritionObj.mfgDate || '',
    expiryDate: p.expiry_date || p.expiryDate || nutritionObj.expiryDate || p.expiry || '',
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

  async getByCategory(category: ProductCategory): Promise<Product[]> {
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

  async create(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product | null> {
    const res = await api('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
    return res ? parseProduct(res) : null;
  },

  async update(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const res = await api('/products', {
      method: 'PATCH',
      body: JSON.stringify({ id, ...updates }),
    });
    return res ? parseProduct(res) : undefined;
  },

  async delete(id: string): Promise<boolean> {
    const res = await api('/products', { method: 'DELETE', body: JSON.stringify({ id }) });
    return !!res;
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
