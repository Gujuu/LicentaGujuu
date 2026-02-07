import { apiClient } from '@/lib/api';

// Types for API responses
export interface ApiMenuItem {
  id: number;
  name: string;
  description: string;
  short_description?: string;
  full_description?: string;
  allergens?: string[];
  ingredients?: string[];
  price: number;
  image_url?: string;
  is_available: boolean;
}

export interface ApiMenuCategory {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  items: ApiMenuItem[];
}

export interface ApiMenuResponse {
  categories: ApiMenuCategory[];
}

// Menu service to handle API calls and fallbacks
class MenuService {
  private cache: { categories: ApiMenuCategory[] | null; timestamp: number } = {
    categories: null,
    timestamp: 0,
  };

  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getMenu(): Promise<ApiMenuResponse> {
    // Check cache first
    if (
      this.cache.categories &&
      this.cache.categories.length > 0 &&
      Date.now() - this.cache.timestamp < this.CACHE_DURATION
    ) {
      return { categories: this.cache.categories };
    }

    try {
      const response = await apiClient.getMenu();
      if (Array.isArray(response.categories) && response.categories.length > 0) {
        this.cache = {
          categories: response.categories,
          timestamp: Date.now(),
        };
      } else {
        this.cache = { categories: null, timestamp: 0 };
      }
      return response;
    } catch (error) {
      console.warn('Failed to fetch menu from API, using fallback data:', error);
      // Return empty data - components should handle this gracefully
      return { categories: [] };
    }
  }

  async getMenuCategories() {
    try {
      return await apiClient.getMenuCategories();
    } catch (error) {
      console.warn('Failed to fetch categories from API:', error);
      return { categories: [] };
    }
  }

  // Admin functions
  async createCategory(category: { name: string; description?: string; image_url?: string }) {
    return apiClient.createMenuCategory(category);
  }

  async updateCategory(
    id: number,
    category: { name: string; description?: string; image_url?: string }
  ) {
    return apiClient.updateMenuCategory(id, category);
  }

  async deleteCategory(id: number) {
    return apiClient.deleteMenuCategory(id);
  }

  async createMenuItem(item: {
    category_id: number;
    name: string;
    description: string;
    short_description?: string;
    full_description?: string;
    allergens?: string[];
    ingredients?: string[];
    price: number;
    image_url?: string;
    is_available?: boolean;
  }) {
    return apiClient.createMenuItem(item);
  }

  async updateMenuItem(id: number, item: Partial<{
    category_id: number;
    name: string;
    description: string;
    short_description: string;
    full_description: string;
    allergens: string[];
    ingredients: string[];
    price: number;
    image_url: string;
    is_available: boolean;
  }>) {
    return apiClient.updateMenuItem(id, item);
  }

  async deleteMenuItem(id: number) {
    return apiClient.deleteMenuItem(id);
  }

  // Clear cache when data is modified
  clearCache() {
    this.cache = { categories: null, timestamp: 0 };
  }
}

export const menuService = new MenuService();