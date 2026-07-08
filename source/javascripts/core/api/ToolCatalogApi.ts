import semver from 'semver';

import { ToolCatalog, ToolCatalogEntry, ToolVersions } from '../models/Tools';
import Client, { ClientError } from './client';

// The tool version catalog is served as static, public JSON assets
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
 * Fetch and parse a JSON document through the shared client, kept CORS-simple so
 * the cross-origin request avoids a preflight. Throws a
 * `ToolCatalogError` on any failure — network error, non-2xx status, or
 * malformed JSON.
 */
async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await Client.raw(url, {
      method: 'GET',
      signal,
      timeout: REQUEST_TIMEOUT_MS,
      excludeCSRF: true,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error) {
    const status = error instanceof ClientError ? error.status : undefined;
    const message = status ? `Request to ${url} failed with status ${status}` : `Failed to fetch ${url}`;
    throw new ToolCatalogError(message, url, { status, cause: error });
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    throw new ToolCatalogError(`Malformed JSON from ${url}`, url, { cause: error });
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
