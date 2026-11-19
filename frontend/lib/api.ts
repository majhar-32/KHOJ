const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export interface RequestOptions extends RequestInit {
  token?: string | null;
  params?: Record<string, unknown>;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, params, headers, ...customConfig } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const isFormData = typeof FormData !== 'undefined' && customConfig.body instanceof FormData;

  const reqHeaders: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(headers as Record<string, string>),
  };

  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  let response: Response | undefined;
  const maxRetries = 3;
  const retryDelays = [600, 1000, 1500];

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      response = await fetch(url, {
        ...customConfig,
        headers: reqHeaders,
      });
      break;
    } catch (err: unknown) {
      const isFetchError = err instanceof TypeError && err.message.toLowerCase().includes('fetch');
      if (isFetchError && attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelays[attempt]));
        continue;
      }
      if (isFetchError) {
        throw new ApiError(
          'Server is temporarily unreachable. Please check if the backend is running.',
          503
        );
      }
      throw err;
    }
  }

  if (!response) {
    throw new ApiError('No response received from server.', 500);
  }

  if (response.status === 204) {
    return {} as T;
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMessage = data?.error || data?.message || `Request failed with status ${response.status}`;
    throw new ApiError(errorMessage, response.status);
  }

  return data as T;
}
