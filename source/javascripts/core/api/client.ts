import merge from 'lodash/merge';
import getCookie from '@/utils/cookies';

const DEFAULT_TIMEOUT = 60_000;
const DEFAULT_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

type ExtraOpts = { excludeCSRF?: boolean; timeout?: number };
type ClientOpts = RequestInit & ExtraOpts;

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

async function client<T>(url: string, options?: ClientOpts) {
  // Include CSRF token in headers if not excluded
  const csrfHeader = !options?.excludeCSRF ? { 'X-CSRF-TOKEN': getCookie('CSRF-TOKEN') } : undefined;
  const headers = merge({}, DEFAULT_HEADERS, options?.headers, csrfHeader);

  const externalSignal = options?.signal;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort('TimeoutError');
  }, options?.timeout ?? DEFAULT_TIMEOUT);

  if (externalSignal) {
    externalSignal.addEventListener('abort', () => {
      controller.abort();
      clearTimeout(timeoutId);
    });
  }

  try {
    const opts = merge({}, options, {
      headers,
      signal: controller.signal,
    });
    const response = await fetch(url, opts);
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new NetworkError(`HTTP ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as T;
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
      console.error('Timout Error:', error);
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

function get<T>(url: string, options?: ClientOpts) {
  return client<T>(url, { ...options, method: 'GET' });
}

function post<T>(url: string, options?: ClientOpts) {
  return client<T>(url, { ...options, method: 'POST' });
}

function put<T>(url: string, options?: ClientOpts) {
  return client<T>(url, { ...options, method: 'PUT' });
}

function patch<T>(url: string, options?: ClientOpts) {
  return client<T>(url, { ...options, method: 'PATCH' });
}

function del<T>(url: string, options?: ClientOpts) {
  return client<T>(url, { ...options, method: 'DELETE' });
}

async function text(url: string, options?: ClientOpts) {
  const externalSignal = options?.signal;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort('TimeoutError');
  }, options?.timeout ?? DEFAULT_TIMEOUT);

  if (externalSignal) {
    externalSignal.addEventListener('abort', () => {
      controller.abort();
      clearTimeout(timeoutId);
    });
  }

  try {
    const opts = merge({}, options, {
      signal: controller.signal,
    });
    const response = await fetch(url, opts);
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new NetworkError(`HTTP ${response.status} ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    clearTimeout(timeoutId);
    handleError(error);
  }
}

export default {
  get,
  post,
  put,
  patch,
  del,
  text,
};
