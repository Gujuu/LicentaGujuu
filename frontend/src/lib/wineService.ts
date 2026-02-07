import { apiClient, type QueryParams } from '@/lib/api';

export interface ApiWineItem {
  id: number;
  name: string;
  region?: string;
  description?: string;
  full_description?: string;
  price_glass?: number;
  price_bottle?: number;
  image_url?: string;
  grape?: string;
  pairing?: string[];
  is_available: boolean;
}

export interface ApiWinesResponse {
  wines: ApiWineItem[];
}

class WineService {
  private cache: { wines: ApiWineItem[] | null; timestamp: number } = {
    wines: null,
    timestamp: 0,
  };

  private readonly CACHE_DURATION = 5 * 60 * 1000;

  async getWines(params?: QueryParams): Promise<ApiWinesResponse> {
    if (!params && this.cache.wines && Date.now() - this.cache.timestamp < this.CACHE_DURATION) {
      return { wines: this.cache.wines };
    }

    const response = await apiClient.getWines(params);

    if (!params) {
      this.cache = { wines: response.wines, timestamp: Date.now() };
    }

    return response;
  }

  async getAllWines(): Promise<ApiWinesResponse> {
    return apiClient.getAllWines();
  }

  async createWine(wine: {
    name: string;
    region?: string;
    description?: string;
    full_description?: string;
    price_glass?: number;
    price_bottle?: number;
    image_url?: string;
    grape?: string;
    pairing?: string[];
    is_available?: boolean;
  }) {
    return apiClient.createWine(wine);
  }

  async updateWine(
    id: number,
    wine: Partial<{
      name: string;
      region: string;
      description: string;
      full_description: string;
      price_glass: number;
      price_bottle: number;
      image_url: string;
      grape: string;
      pairing: string[];
      is_available: boolean;
    }>
  ) {
    return apiClient.updateWine(id, wine);
  }

  async deleteWine(id: number) {
    return apiClient.deleteWine(id);
  }

  clearCache() {
    this.cache = { wines: null, timestamp: 0 };
  }
}

export const wineService = new WineService();
