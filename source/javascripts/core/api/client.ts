import { toMerged } from 'es-toolkit';
import { getCookie } from '../utils/CommonUtils';

const DEFAULT_TIMEOUT = 60_000;
const DEFAULT_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

type ExtraOpts = {
  excludeCSRF?: boolean;
  timeout?: number;
};
type ClientOpts = RequestInit & ExtraOpts;

/* eslint-disable no-underscore-dangle */
class ClientError extends Error {
  public error: Error;

  public response?: Response;

  public status?: number;

  public statusText?: string;

  public data?: unknown;

  constructor(error: Error, response?: Response, data?: unknown) {
    super(error.message);
    this.name = 'ClientError';
    this.error = error;
    this.response = response;
    this.status = response?.status;
    this.statusText = response?.statusText;
    this.data = data;
  }
}

async function client(url: string, options?: ClientOpts) {
  const headers = toMerged(DEFAULT_HEADERS, {
    ...options?.headers,
    ...(options?.excludeCSRF ? {} : { 'X-CSRF-TOKEN': getCookie('CSRF-TOKEN') }),
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(`Request timeout after ${options?.timeout ?? DEFAULT_TIMEOUT}ms`),
    options?.timeout ?? DEFAULT_TIMEOUT,
  );

  options?.signal?.addEventListener(
    'abort',
    () => {
      controller.abort();
      clearTimeout(timeoutId);
    },
    { once: true },
  );

  let response: Response | undefined;

  try {
    response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData;

      try {
        errorData = await response.clone().json();
      } catch (jsonParseError) {
        errorData = undefined;
      }

      if (!errorData) {
        try {
          errorData = await response.clone().text();
        } catch (textParseError) {
          errorData = 'Could not parse error response';
        }
      }

      throw new ClientError(new Error(`HTTP Error: ${response.status} ${response.statusText}`), response, errorData);
    }

    return response;
  } catch (error) {
    const clientError = new ClientError(error as Error, response);
    if ((error as Error).name === 'AbortError') {
      clientError.message = `Request was aborted: ${(error as Error).message}`;
    } else if ((error as Error).name === 'TypeError' && (error as Error).message.includes('Failed to fetch')) {
      clientError.message = `Network error: Could not connect to server (${(error as Error).message})`;
    }
    throw clientError;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function parseResponse<T>(response: Response): Promise<T | undefined> {
  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    return undefined;
  }
  return (await response.json()) as T;
}

async function get<T>(url: string, options?: ClientOpts) {
  const response = await client(url, { ...options, method: 'GET' });
  return (await response.json()) as T;
}

async function post<T>(url: string, options?: ClientOpts) {
  const response = await client(url, { ...options, method: 'POST' });
  return parseResponse<T>(response);
}

async function put<T>(url: string, options?: ClientOpts) {
  const response = await client(url, { ...options, method: 'PUT' });
  return parseResponse<T>(response);
}

async function patch<T>(url: string, options?: ClientOpts) {
  const response = await client(url, { ...options, method: 'PATCH' });
  return parseResponse<T>(response);
}

async function del<T>(url: string, options?: ClientOpts) {
  const response = await client(url, { ...options, method: 'DELETE' });
  return parseResponse<T>(response);
}

async function text(url: string, options?: ClientOpts) {
  const response = await client(url, {
    method: 'GET',
    ...options,
    headers: {
      Accept: 'text/plain,*/*',
      'Content-Type': 'text/plain', // Override the default JSON content type
      ...options?.headers,
    },
  });
  return response.text();
}

export { ClientError };
export default {
  get,
  post,
  put,
  patch,
  del,
  text,
};
