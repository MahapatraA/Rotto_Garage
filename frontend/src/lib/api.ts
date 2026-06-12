const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const TOKEN_KEY = 'rotto_token';

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

const buildHeaders = (): HeadersInit => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = token;
  }

  return headers;
};

const handleResponse = async (res: Response) => {
  const data = await res.json();
  return data;
};

export const api = {
  get: async (endpoint: string) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'GET',
      headers: buildHeaders(),
    });
    return handleResponse(res);
  },

  post: async (endpoint: string, body: unknown) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  put: async (endpoint: string, body: unknown) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  delete: async (endpoint: string) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    });
    return handleResponse(res);
  },
};
