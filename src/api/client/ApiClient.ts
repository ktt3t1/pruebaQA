import * as allure from 'allure-js-commons';
import {
  ApiResponse,
  Document,
  EditableFields,
  ListFilters,
  LoginBody,
  NewDocument,
} from '../types';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | number>;
}

/** Cliente API modular y tipado. Adjunta cada request/response al reporte Allure. */
export class ApiClient {
  private token?: string;

  constructor(
    private readonly baseUrl: string,
    private readonly runId: string,
  ) {}

  get hasToken(): boolean {
    return this.token !== undefined;
  }

  clearToken(): void {
    this.token = undefined;
  }

  private async request<T>(
    method: Method,
    path: string,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    const { body, auth = true, query } = options;
    const url = new URL(`${this.baseUrl}${path}`);
    Object.entries(query ?? {}).forEach(([k, v]) => url.searchParams.set(k, String(v)));

    const headers: Record<string, string> = {
      'x-lab-run-id': this.runId,
      Accept: 'application/json',
    };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (auth && this.token) headers.Authorization = `Bearer ${this.token}`;

    return allure.step(`API ${method} ${path}`, async () => {
      await allure.attachment(
        'Request',
        JSON.stringify(
          { method, url: url.toString(), headers: { ...headers, Authorization: headers.Authorization ? 'Bearer ***' : undefined }, body: body ?? null },
          null,
          2,
        ),
        'application/json',
      );

      const res = await fetch(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const raw = await res.text();
      const parsed = raw ? (JSON.parse(raw) as T) : null;
      const result: ApiResponse<T> = {
        status: res.status,
        headers: Object.fromEntries(res.headers.entries()),
        body: parsed,
        raw,
      };

      const printable =
        parsed && typeof parsed === 'object' && 'token' in (parsed as object)
          ? { ...(parsed as object), token: '***' }
          : parsed;
      await allure.attachment(
        'Response',
        JSON.stringify({ status: res.status, headers: result.headers, body: printable }, null, 2),
        'application/json',
      );
      return result;
    });
  }

  async login(email: string, password: string): Promise<ApiResponse<LoginBody>> {
    const res = await this.request<LoginBody>('POST', '/auth/login', {
      body: { email, password },
      auth: false,
    });
    if (res.status === 200 && res.body) this.token = res.body.token;
    return res;
  }

  createDocument(body: NewDocument | Readonly<Record<string, unknown>>) {
    return this.request<Document>('POST', '/documents', { body });
  }

  createDocumentWithoutToken(body: NewDocument) {
    return this.request<unknown>('POST', '/documents', { body, auth: false });
  }

  getDocument(id: string) {
    return this.request<Document>('GET', `/documents/${id}`);
  }

  listDocuments(filters: ListFilters = {}) {
    const query: Record<string, string | number> = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined) query[k] = v;
    });
    return this.request<Document[]>('GET', '/documents', { query });
  }

  putDocument(id: string, body: EditableFields) {
    return this.request<Document>('PUT', `/documents/${id}`, { body });
  }

  patchDocument(id: string, body: EditableFields) {
    return this.request<Document>('PATCH', `/documents/${id}`, { body });
  }

  deleteDocument(id: string) {
    return this.request<null>('DELETE', `/documents/${id}`);
  }
}
