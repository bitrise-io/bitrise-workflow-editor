import semver from 'semver';

import { ToolCatalog, ToolVersionCatalog } from '../models/Tools';

// The tool version catalog is served as static, public JSON assets — not the
// Bitrise API — so it is fetched with a plain `fetch` (no CSRF token, no JSON
// `Content-Type`) to keep the cross-origin request a CORS-simple request and
// avoid an unnecessary preflight. Failures degrade to `undefined` so consumers
// can fall back to free-form input.
const TOOL_CATALOG_BASE_URL = 'https://bitrise.io/stacks/tools/v1';
const REQUEST_TIMEOUT_MS = 30_000;

/** Shape of the catalog index JSON (`catalog.json`). */
type ToolCatalogIndexDto = {
  tools?: unknown;
  timestamp?: string;
};

/** Shape of a per-tool catalog JSON (e.g. `nodejs.json`). */
type ToolVersionsDto = {
  versions?: unknown;
  timestamp?: string;
};

function getCatalogIndexUrl(): string {
  return `${TOOL_CATALOG_BASE_URL}/catalog.json`;
}

function getToolCatalogUrl(toolId: string): string {
  return `${TOOL_CATALOG_BASE_URL}/${encodeURIComponent(toolId)}.json`;
}

/**
 * Fetch and parse a JSON document. Returns `undefined` on any failure — network
 * error, non-2xx status, or malformed JSON — never throws.
 */
async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T | undefined> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const onExternalAbort = () => controller.abort();
  signal?.addEventListener('abort', onExternalAbort, { once: true });

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      return undefined;
    }

    return (await response.json()) as T;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onExternalAbort);
  }
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

/**
 * Whether a version list is SemVer-compatible. Treated as a heuristic: a list is
 * SemVer-compatible when at least one entry is a valid SemVer version, so that
 * SemVer selectors can be resolved against it. Lists with no parseable version
 * (e.g. date- or channel-based schemes) are exposed as opaque strings instead.
 */
function isSemverVersionList(versions: string[]): boolean {
  return versions.some((version) => semver.valid(version) !== null);
}

/** Fetch the catalog index. Returns `undefined` when unavailable or malformed. */
async function getToolCatalog(signal?: AbortSignal): Promise<ToolCatalog | undefined> {
  const dto = await fetchJson<ToolCatalogIndexDto>(getCatalogIndexUrl(), signal);
  if (!dto || !Array.isArray(dto.tools)) {
    return undefined;
  }

  return { toolIds: toStringArray(dto.tools) };
}

/** Fetch a single tool's version list. Returns `undefined` when unavailable or malformed. */
async function getToolVersionCatalog(toolId: string, signal?: AbortSignal): Promise<ToolVersionCatalog | undefined> {
  const dto = await fetchJson<ToolVersionsDto>(getToolCatalogUrl(toolId), signal);
  if (!dto || !Array.isArray(dto.versions)) {
    return undefined;
  }

  const versions = toStringArray(dto.versions);
  return { toolId, versions, isSemver: isSemverVersionList(versions) };
}

export default {
  getCatalogIndexUrl,
  getToolCatalogUrl,
  getToolCatalog,
  getToolVersionCatalog,
};
