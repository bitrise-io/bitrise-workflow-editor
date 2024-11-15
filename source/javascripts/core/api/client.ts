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

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
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

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new NetworkError(`HTTP ${response.status} ${response.statusText}`);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    handleError(error);
  }
}

function handleError(error: unknown): never {
  if (error instanceof TypeError) {
    console.error('Fetch Error:', error);
    throw error;
  } else if (error instanceof DOMException) {
    if (error.name === 'TimeoutError') {
      console.error('Timeout Error:', error);
    } else {
      console.error('Abort Error:', error);
    }
    throw error;
  } else if (error instanceof NetworkError) {
    console.error('Network Error:', error);
    throw error;
  } else if (error instanceof SyntaxError) {
    console.error('JSON Error:', error);
    throw error;
  } else {
    console.error('Error during fetch operation:', error);
    throw error;
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
    ...options,
    method: 'GET',
  });
  return response.text();
}

export default {
  get,
  post,
  put,
  patch,
  del,
  text,
};
