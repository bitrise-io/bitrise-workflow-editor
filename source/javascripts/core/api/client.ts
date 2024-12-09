import { toMerged } from 'es-toolkit';
import getCookie from '@/utils/cookies';

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

  constructor(error: Error, response?: Response) {
    super(error.message);
    this.name = 'ClientError';
    this.error = error;
    this.response = response;
  }
}

async function client(url: string, options?: ClientOpts) {
  const headers = toMerged(DEFAULT_HEADERS, {
    ...options?.headers,
    ...(options?.excludeCSRF ? {} : { 'X-CSRF-TOKEN': getCookie('CSRF-TOKEN') }),
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort('TimeoutError'), options?.timeout ?? DEFAULT_TIMEOUT);
  options?.signal?.addEventListener('abort', () => {
    controller.abort();
    clearTimeout(timeoutId);
  });

  let response: Response | undefined;

  try {
    response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Response was not 2xx');
    }

    return response;
  } catch (error) {
    throw new ClientError(error as Error, response);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function get<T>(url: string, options?: ClientOpts) {
  const response = await client(url, { ...options, method: 'GET' });
  return (await response.json()) as T;
}

async function post<T>(url: string, options?: ClientOpts) {
  const response = await client(url, { ...options, method: 'POST' });

  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    return undefined;
  }

  return (await response.json()) as T;
}

async function put<T>(url: string, options?: ClientOpts) {
  const response = await client(url, { ...options, method: 'PUT' });

  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    return;
  }

  return (await response.json()) as T;
}

async function patch<T>(url: string, options?: ClientOpts) {
  const response = await client(url, { ...options, method: 'PATCH' });

  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    return;
  }

  return (await response.json()) as T;
}

async function del<T>(url: string, options?: ClientOpts) {
  const response = await client(url, { ...options, method: 'DELETE' });

  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    return;
  }

  return (await response.json()) as T;
}

async function text(url: string, options?: ClientOpts) {
  const response = await client(url, {
    method: 'GET',
    ...options,
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
