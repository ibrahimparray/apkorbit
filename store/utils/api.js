const API_URL = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/+$/, '');
const API_BASE = API_URL.replace(/\/api\/?$/, '');

export function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/uploads/') && API_BASE) {
    return `${API_BASE}${path}`;
  }
  return path;
}

function buildUrl(endpoint) {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) return endpoint;
  return `${API_URL}${endpoint}`;
}

async function request(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  try {
    const res = await fetch(buildUrl(endpoint), { ...options, headers });
    if (res.status === 204) return null;
    const data = await res.json().catch(() => null);
    if (!res.ok) throw { status: res.status, message: data?.message || 'Request failed', data };
    return data;
  } catch (err) {
    if (err.status) throw err;
    throw { status: 0, message: 'Network error' };
  }
}

export const api = {
  apps: {
    list: (params = {}) => {
      const q = new URLSearchParams();
      if (params.page) q.set('page', params.page);
      if (params.limit) q.set('limit', params.limit);
      if (params.category) q.set('category', params.category);
      if (params.search) q.set('search', params.search);
      if (params.sort) q.set('sort', params.sort);
      if (params.published === true) q.set('published', 'true');
      if (params.published === false) q.set('published', 'false');
      return request(`/apps?${q.toString()}`);
    },
    detail: (id) => request(`/apps/${id}`),
    downloadUrl: (id, versionId) => buildUrl(`/apps/${id}/download${versionId ? `/${versionId}` : ''}`),
    latestVersion: (id) => request(`/apps/${id}/versions/latest`),
    checkUpdate: (packageName, currentVersionCode) =>
      request('/apps/check-update', {
        method: 'POST',
        body: JSON.stringify({ package_name: packageName, current_version_code: currentVersionCode }),
      }),
  },
  categories: {
    list: () => request('/categories'),
    detail: (id) => request(`/categories/${id}`),
  },
  settings: {
    all: () => request('/settings'),
  },
}
