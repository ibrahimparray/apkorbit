const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return path;
}

async function request(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  try {
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw { status: res.status, message: data?.message || 'Request failed', data };
    return data;
  } catch (err) {
    if (err.status) throw err;
    throw { status: 0, message: 'Network error' };
  }
}

const storeApi = {
  apps: {
    list: (params = {}) => {
      const q = new URLSearchParams();
      if (params.page) q.set('page', params.page);
      if (params.limit) q.set('limit', params.limit);
      if (params.category) q.set('category', params.category);
      if (params.search) q.set('search', params.search);
      if (params.sort) q.set('sort', params.sort);
      if (params.published) q.set('published', params.published);
      return request(`/apps?${q.toString()}`);
    },
    detail: (id) => request(`/apps/${id}`),
    download: (id, versionId) =>
      `${API_URL.replace('/api', '')}/api/apps/${id}/download${versionId ? `/${versionId}` : ''}`,
    latestVersion: (id) => request(`/apps/${id}/versions/latest`),
  },
  categories: {
    list: () => request('/categories'),
  },
};

export default storeApi;
