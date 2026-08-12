import { z } from 'zod';

export const ApiResponseEnvelopeSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.nullable(),
    error: z
      .object({
        code: z.string().optional(),
        message: z.string(),
      })
      .nullable(),
    meta: z
      .object({
        timestamp: z.string(),
        version: z.string(),
      })
      .optional(),
  });

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || `HTTP Request failed with status ${res.status}`);
    }

    return json.data as T;
  }

  async get<T>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T>(url: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...options, method: 'POST', body: JSON.stringify(body) });
  }

  async put<T>(url: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...options, method: 'PUT', body: JSON.stringify(body) });
  }

  async patch<T>(url: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...options, method: 'PATCH', body: JSON.stringify(body) });
  }
}

export const apiClient = new ApiClient();
