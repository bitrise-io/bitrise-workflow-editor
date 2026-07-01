import ToolCatalogApi from '../api/ToolCatalogApi';
import { ParsedToolVersion, ToolCatalog, ToolVersions, VersionStrategy } from '../models/Tools';
import { bitriseYmlStore, updateBitriseYmlDocument } from '../stores/BitriseYmlStore';
import YmlUtils from '../utils/YmlUtils';
import WorkflowService from './WorkflowService';

type ToolScope = { type: 'root' } | { type: 'workflow'; workflowId: string };

// Keep the catalog and per-tool version lists in memory for the session so the
// same user does not re-fetch them on every interaction. Entries live for 30
// minutes; failures are not cached so a transient error retries on next access.
const CACHE_TTL_MS = 30 * 60 * 1000;

type CacheEntry<T> = {
  /** The fetch itself, cached as a promise so concurrent callers can share one request. */
  promise: Promise<T>;
  /** Epoch milliseconds after which this entry is stale and should be re-fetched. */
  expiresAt: number;
};

let toolCatalog: CacheEntry<ToolCatalog> | undefined;
const versionsPerTool = new Map<string, CacheEntry<ToolVersions>>();

/**
 * Return the cached value if still fresh, otherwise fetch a new one and cache it.
 * The in-flight promise is cached too, so concurrent callers share a single
 * request. A fetch that rejects is evicted so the failure is not cached for the
 * full TTL — the next caller retries — and the rejection propagates to callers.
 */
function memoize<T>(
  getEntry: () => CacheEntry<T> | undefined,
  setEntry: (entry: CacheEntry<T> | undefined) => void,
  fetcher: () => Promise<T>,
): Promise<T> {
  const now = Date.now();

  const existing = getEntry();
  if (existing && existing.expiresAt > now) {
    return existing.promise;
  }

  const pendingRequest = fetcher();
  const entry: CacheEntry<T> = { promise: pendingRequest, expiresAt: now + CACHE_TTL_MS };
  setEntry(entry);

  // 3. Do not cache failures. If the request rejects, evict this entry so the next
  //    caller retries instead of getting the cached rejected promise for the whole
  //    TTL. The `getEntry() === entry` check is a compare-and-delete: only remove
  //    the entry if it is still the one we just stored. If it was already replaced
  //    (the TTL lapsed and another call re-fetched, or `clearCache` ran), leave the
  //    newer entry alone.
  pendingRequest.catch(() => {
    if (getEntry() === entry) {
      setEntry(undefined);
    }
  });

  // 4. Return the request itself. Attaching the `.catch` above does not swallow the
  //    rejection, so callers still receive it.
  return pendingRequest;
}

/** Fetch the catalog index, cached for the session. Rejects with a `ToolCatalogError` when unavailable. */
function getToolCatalog(): Promise<ToolCatalog> {
  return memoize<ToolCatalog>(
    () => toolCatalog,
    (entry) => {
      toolCatalog = entry;
    },
    () => ToolCatalogApi.getToolCatalog(),
  );
}

/** Fetch a single tool's version list, cached per tool for the session. Rejects with a `ToolCatalogError` when unavailable. */
function getToolVersions(toolId: string): Promise<ToolVersions> {
  return memoize<ToolVersions>(
    () => versionsPerTool.get(toolId),
    (entry) => {
      if (entry) {
        versionsPerTool.set(toolId, entry);
      } else {
        versionsPerTool.delete(toolId);
      }
    },
    () => ToolCatalogApi.getToolVersions(toolId),
  );
}

/** Drop all cached catalog and version data. Mainly useful for tests and forced refreshes. */
function clearCache(): void {
  toolCatalog = undefined;
  versionsPerTool.clear();
}

function parseToolVersion(raw: string): ParsedToolVersion {
  const lower = raw.toLowerCase();

  if (lower === 'unset') {
    return { strategy: 'unset' };
  }

  if (lower === 'latest') {
    return { strategy: 'latest-released' };
  }

  if (lower === 'installed') {
    return { strategy: 'latest-installed' };
  }

  const colonIndex = raw.indexOf(':');
  if (colonIndex > 0) {
    const prefix = raw.slice(0, colonIndex);
    const suffix = raw.slice(colonIndex + 1).toLowerCase();

    if (suffix === 'latest') {
      return { strategy: 'latest-released', prefix };
    }

    if (suffix === 'installed') {
      return { strategy: 'latest-installed', prefix };
    }
  }

  return { strategy: 'exact', version: raw };
}

function serializeToolVersion(parsed: ParsedToolVersion): string {
  switch (parsed.strategy) {
    case 'unset':
      return 'unset';
    case 'latest-released':
      return parsed.prefix ? `${parsed.prefix}:latest` : 'latest';
    case 'latest-installed':
      return parsed.prefix ? `${parsed.prefix}:installed` : 'installed';
    case 'exact':
      return parsed.version;
  }
}

function validateScope(scope: ToolScope, doc = bitriseYmlStore.getState().ymlDocument) {
  if (scope.type === 'workflow') {
    WorkflowService.getWorkflowOrThrowError(scope.workflowId, doc);
  }
}

function getScopePath(scope: ToolScope): (string | number)[] {
  return scope.type === 'workflow' ? ['workflows', scope.workflowId] : [];
}

function validateToolId(id: string, initialId: string, existingIds: string[] = []) {
  if (!id.trim()) {
    return 'Tool ID is required';
  }

  if (id !== initialId && existingIds.includes(id)) {
    return 'Tool ID must be unique';
  }

  return true;
}

function validateToolVersion(raw: string) {
  if (!raw.trim()) {
    return 'Tool version is required';
  }

  const colonIndex = raw.indexOf(':');
  if (colonIndex >= 0) {
    const prefix = raw.slice(0, colonIndex);
    const suffix = raw.slice(colonIndex + 1);

    if (!prefix) {
      return 'Tool version must not start with ":"';
    }

    if (!suffix) {
      return 'Tool version must specify "latest" or "installed" after ":"';
    }

    if (suffix.toLowerCase() !== 'latest' && suffix.toLowerCase() !== 'installed') {
      return 'Tool version suffix must be "latest" or "installed"';
    }
  }

  return true;
}

function setTool(toolId: string, strategy: VersionStrategy, inputValue: string, scope: ToolScope) {
  if (strategy === 'unset' && scope.type === 'root') {
    throw new Error('Cannot use "unset" strategy at root scope');
  }

  let parsed: ParsedToolVersion;
  switch (strategy) {
    case 'exact':
      parsed = { strategy, version: inputValue };
      break;
    case 'unset':
      parsed = { strategy };
      break;
    default:
      parsed = { strategy, prefix: inputValue };
  }
  const versionString = serializeToolVersion(parsed);

  updateBitriseYmlDocument(({ doc }) => {
    validateScope(scope, doc);

    const tools = YmlUtils.getMapIn(doc, [...getScopePath(scope), 'tools'], true);
    YmlUtils.setIn(tools, [toolId], versionString, false);
    return doc;
  });
}

function deleteTool(toolId: string, scope: ToolScope) {
  updateBitriseYmlDocument(({ doc }) => {
    validateScope(scope, doc);

    const scopePath = getScopePath(scope);
    YmlUtils.deleteByPath(doc, [...scopePath, 'tools', toolId], scopePath);
    return doc;
  });
}

export type { ToolScope };
export default {
  parseToolVersion,
  setTool,
  deleteTool,
  validateToolId,
  validateToolVersion,
  getToolCatalog,
  getToolVersions,
  clearCache,
};
