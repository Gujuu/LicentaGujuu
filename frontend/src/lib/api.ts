// API client for Dei Frati restaurant
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

export type UploadImageOptions = {
  folder?: string;
  baseName?: string;
};

export const resolveBackendUrl = (maybeUrl?: string | null) => {
  if (!maybeUrl) return '';
  if (/^https?:\/\//i.test(maybeUrl)) return maybeUrl;
  if (maybeUrl.startsWith('/')) return `${API_ORIGIN}${maybeUrl}`;
  return maybeUrl;
};

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      } as Record<string, string>,
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private withQuery(endpoint: string, params?: QueryParams) {
    if (!params) return endpoint;
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      searchParams.set(key, String(value));
    }
    const qs = searchParams.toString();
    return qs ? `${endpoint}?${qs}` : endpoint;
  }

  // Auth endpoints
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyToken() {
    return this.request('/auth/verify');
  }

  // Menu endpoints
  async getMenu() {
    return this.request('/menu');
  }

  // Wines endpoints
  async getWines(params?: QueryParams) {
    return this.request(this.withQuery('/wines', params));
  }

  async getAllWines() {
    return this.request('/wines/admin');
  }

  async createWine(wine) {
    return this.request('/wines', {
      method: 'POST',
      body: JSON.stringify(wine),
    });
  }

  async updateWine(id, wine) {
    return this.request(`/wines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(wine),
    });
  }

  async deleteWine(id) {
    return this.request(`/wines/${id}`, {
      method: 'DELETE',
    });
  }

  async getMenuCategories() {
    return this.request('/menu/categories');
  }

  async createMenuCategory(category) {
    return this.request('/menu/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  async updateMenuCategory(id, category) {
    return this.request(`/menu/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  }

  async deleteMenuCategory(id) {
    return this.request(`/menu/categories/${id}`, {
      method: 'DELETE',
    });
  }

  async createMenuItem(item) {
    return this.request('/menu/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateMenuItem(id, item) {
    return this.request(`/menu/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  }

  async deleteMenuItem(id) {
    return this.request(`/menu/items/${id}`, {
      method: 'DELETE',
    });
  }

  // Reservation endpoints
  async getReservations(params?: QueryParams) {
    return this.request(this.withQuery('/reservations', params));
  }

  async getMyReservations(params?: QueryParams) {
    return this.request(this.withQuery('/reservations/my', params));
  }

  async createReservation(reservation) {
    return this.request('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservation),
    });
  }

  async updateReservationStatus(id, status) {
    return this.request(`/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async cancelReservation(id) {
    return this.request(`/reservations/${id}`, {
      method: 'DELETE',
    });
  }

  // Contact endpoints
  async getContactMessages(params?: QueryParams) {
    return this.request(this.withQuery('/contact', params));
  }

  async sendContactMessage(message) {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  async markMessageAsRead(id) {
    return this.request(`/contact/${id}/read`, {
      method: 'PUT',
    });
  }

  async deleteContactMessage(id) {
    return this.request(`/contact/${id}`, {
      method: 'DELETE',
    });
  }

  // Upload endpoints
  async uploadImage(file: File, options?: UploadImageOptions) {
    const formData = new FormData();
    // IMPORTANT: with multer/multer-s3, req.body fields are populated in the order
    // they appear in the multipart form. The S3 key callback runs when the file
    // is handled, so we must append text fields BEFORE the file.
    if (options?.folder) {
      formData.append('folder', options.folder);
    }
    if (options?.baseName) {
      formData.append('baseName', options.baseName);
    }

    formData.append('image', file);

    return fetch(`${this.baseURL}/upload/image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(error.message);
      }
      return response.json();
    });
  }

  async deleteImage(imageUrlOrKey: string) {
    return this.request('/upload/image', {
      method: 'DELETE',
      body: JSON.stringify({ imageUrl: imageUrlOrKey }),
    });
  }
}

export const apiClient = new ApiClient();