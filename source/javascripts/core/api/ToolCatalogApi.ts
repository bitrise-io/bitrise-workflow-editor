import semver from 'semver';

import { ToolCatalog, ToolCatalogEntry, ToolVersions } from '../models/Tools';

// The tool version catalog is served as static, public JSON assets — not the
// Bitrise API — so it is fetched with a plain `fetch` (no CSRF token, no JSON
// `Content-Type`) to keep the cross-origin request a CORS-simple request and
// avoid an unnecessary preflight. Failures throw a `ToolCatalogError` so callers
// can distinguish a network/HTTP/parse failure from a legitimately empty result.
const TOOL_CATALOG_BASE_URL = 'https://bitrise.io/stacks/tools/v1';
const REQUEST_TIMEOUT_MS = 30_000;

/**
 * Raised for any tool-catalog fetch failure: network error, non-2xx response,
 * malformed JSON, or an unexpected payload shape. `status` is set for HTTP
 * failures; `cause` carries the underlying error where there is one.
 */
class ToolCatalogError extends Error {
  readonly url: string;

  readonly status?: number;

  readonly cause?: unknown;

  constructor(message: string, url: string, details?: { status?: number; cause?: unknown }) {
    super(message);
    this.name = 'ToolCatalogError';
    this.url = url;
    this.status = details?.status;
    this.cause = details?.cause;
  }
}

/** Shape of the catalog index JSON (`catalog.json`). */
type ToolCatalogIndexDto = {
  tools?: ToolCatalogEntry[];
  timestamp?: string;
};

/** Shape of a per-tool catalog JSON (e.g. `nodejs.json`). */
type ToolVersionsDto = {
  versions?: string[];
  timestamp?: string;
};

function getCatalogIndexUrl(): string {
  return `${TOOL_CATALOG_BASE_URL}/catalog.json`;
}

function getToolCatalogUrl(toolId: string): string {
  return `${TOOL_CATALOG_BASE_URL}/${encodeURIComponent(toolId)}.json`;
}

/**
 * Fetch and parse a JSON document. Throws a `ToolCatalogError` on any failure —
 * network error, non-2xx status, or malformed JSON.
 */
async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const onExternalAbort = () => controller.abort();
  signal?.addEventListener('abort', onExternalAbort, { once: true });

  try {
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
    } catch (error) {
      throw new ToolCatalogError(`Failed to fetch ${url}`, url, { cause: error });
    }

    if (!response.ok) {
      throw new ToolCatalogError(`Request to ${url} failed with status ${response.status}`, url, {
        status: response.status,
      });
    }

    try {
      return (await response.json()) as T;
    } catch (error) {
      throw new ToolCatalogError(`Malformed JSON from ${url}`, url, { cause: error });
    }
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onExternalAbort);
  }
}

/** Fetch the catalog index. Throws a `ToolCatalogError` when unavailable or malformed. */
async function getToolCatalog(signal?: AbortSignal): Promise<ToolCatalog> {
  const url = getCatalogIndexUrl();
  const dto = await fetchJson<ToolCatalogIndexDto>(url, signal);
  if (!dto || !Array.isArray(dto.tools)) {
    throw new ToolCatalogError('Catalog index is missing a "tools" array', url);
  }

  return { tools: dto.tools };
}

/** Fetch a single tool's version list. Throws a `ToolCatalogError` when unavailable or malformed. */
async function getToolVersions(toolId: string, signal?: AbortSignal): Promise<ToolVersions> {
  const url = getToolCatalogUrl(toolId);
  const dto = await fetchJson<ToolVersionsDto>(url, signal);
  if (!dto || !Array.isArray(dto.versions)) {
    throw new ToolCatalogError(`Version list for "${toolId}" is missing a "versions" array`, url);
  }

  const versions = dto.versions.map((version) => ({ version, isSemver: semver.valid(version) !== null }));
  return { toolId, versions };
}

export { ToolCatalogError };
export default {
  getToolCatalog,
  getToolVersions,
};
