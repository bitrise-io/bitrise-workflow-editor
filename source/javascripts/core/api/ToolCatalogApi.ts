import semver from 'semver';

import { ToolCatalog, ToolCatalogEntry, ToolVersions } from '../models/Tools';
import Client from './client';

// The tool version catalog is served as static, public JSON assets
const TOOL_CATALOG_BASE_URL = 'https://bitrise.io/stacks/tools/v1';
const REQUEST_TIMEOUT_MS = 30_000;

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
 * the cross-origin request avoids a preflight.
 */
function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  return Client.get<T>(url, {
    signal,
    timeout: REQUEST_TIMEOUT_MS,
    excludeCSRF: true,
    headers: { 'Content-Type': 'text/plain' },
  });
}

/** Fetch the catalog index. Throws a `ClientError` when unavailable, or an `Error` when malformed. */
async function getToolCatalog(signal?: AbortSignal): Promise<ToolCatalog> {
  const dto = await fetchJson<ToolCatalogIndexDto>(getCatalogIndexUrl(), signal);
  if (!dto || !Array.isArray(dto.tools)) {
    throw new Error('Catalog index is missing a "tools" array');
  }

  return { tools: dto.tools };
}

/** Fetch a single tool's version list. Throws a `ClientError` when unavailable, or an `Error` when malformed. */
async function getToolVersions(toolId: string, signal?: AbortSignal): Promise<ToolVersions> {
  const dto = await fetchJson<ToolVersionsDto>(getToolCatalogUrl(toolId), signal);
  if (!dto || !Array.isArray(dto.versions)) {
    throw new Error(`Version list for "${toolId}" is missing a "versions" array`);
  }

  const versions = dto.versions.map((version) => ({ version, isSemver: semver.valid(version) !== null }));
  return { toolId, versions };
}

export default {
  getToolCatalog,
  getToolVersions,
};
