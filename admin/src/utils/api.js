const API_URL = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/+$/, '');

class ApiClient {
  constructor() {
    this.baseUrl = API_URL;
  }

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw {
          status: response.status,
          message: data?.message || 'An error occurred',
          data,
        };
      }

      return data;
    } catch (error) {
      if (error.status) throw error;
      throw { status: 0, message: 'Network error. Please check your connection.' };
    }
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, body) {
    const isFormData = body instanceof FormData;
    return this.request(endpoint, {
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
      ...(isFormData && { headers: {} }),
    });
  }

  put(endpoint, body) {
    const isFormData = body instanceof FormData;
    return this.request(endpoint, {
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body),
      ...(isFormData && { headers: {} }),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();

// Auth
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

// Apps
export const appsApi = {
  list: (params) => api.get(`/apps?${new URLSearchParams(params)}`),
  detail: (id) => api.get(`/apps/${id}`),
  create: (data) => api.post('/apps', data),
  update: (id, data) => api.put(`/apps/${id}`, data),
  delete: (id) => api.delete(`/apps/${id}`),
  togglePublish: (id) => api.put(`/apps/${id}/toggle-publish`),
  toggleArchive: (id) => api.put(`/apps/${id}/toggle-archive`),
  uploadScreenshots: (id, data) => api.post(`/apps/${id}/screenshots`, data),
  uploadVersion: (id, data) => api.post(`/apps/${id}/versions`, data),
  latestVersion: (id) => api.get(`/apps/${id}/versions/latest`),
  checkUpdate: (data) => api.post('/apps/check-update', data),
};

// Categories
export const categoriesApi = {
  list: () => api.get('/categories'),
  detail: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Analytics
export const analyticsApi = {
  dashboard: () => api.get('/analytics/dashboard'),
  downloads: (params) => api.get(`/analytics/downloads?${new URLSearchParams(params)}`),
};

// Settings
export const settingsApi = {
  getAll: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
  uploadLogo: (data) => api.post('/settings/logo', data),
  storage: () => api.get('/settings/storage'),
};
