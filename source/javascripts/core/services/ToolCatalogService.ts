import semver from 'semver';

import ToolCatalogApi from '../api/ToolCatalogApi';
import { ParsedToolVersion, ToolCatalog, ToolVersionCatalog } from '../models/Tools';

// Keep the catalog and per-tool version lists in memory for the session so the
// same user does not re-fetch them on every interaction. Entries live for 30
// minutes; failures are not cached so a transient error retries on next access.
const CACHE_TTL_MS = 30 * 60 * 1000;

type CacheEntry<T> = {
  value: Promise<T>;
  expiresAt: number;
};

let catalogEntry: CacheEntry<ToolCatalog | undefined> | undefined;
const versionCatalogEntries = new Map<string, CacheEntry<ToolVersionCatalog | undefined>>();

/**
 * Return the cached value if still fresh, otherwise fetch a new one and cache it.
 * The in-flight promise is cached too, so concurrent callers share a single
 * request. A fetch that resolves to `undefined` (or rejects) is evicted so it is
 * not cached for the full TTL — the next caller retries.
 */
function memoize<T>(
  getEntry: () => CacheEntry<T | undefined> | undefined,
  setEntry: (entry: CacheEntry<T | undefined> | undefined) => void,
  fetcher: () => Promise<T | undefined>,
): Promise<T | undefined> {
  const now = Date.now();
  const existing = getEntry();
  if (existing && existing.expiresAt > now) {
    return existing.value;
  }

  const value = fetcher();
  const entry: CacheEntry<T | undefined> = { value, expiresAt: now + CACHE_TTL_MS };
  setEntry(entry);

  value.then(
    (result) => {
      if (result === undefined && getEntry() === entry) {
        setEntry(undefined);
      }
    },
    () => {
      if (getEntry() === entry) {
        setEntry(undefined);
      }
    },
  );

  return value;
}

/** Fetch the catalog index, cached for the session. Returns `undefined` when unavailable. */
function getToolCatalog(): Promise<ToolCatalog | undefined> {
  return memoize<ToolCatalog>(
    () => catalogEntry,
    (entry) => {
      catalogEntry = entry;
    },
    () => ToolCatalogApi.getToolCatalog(),
  );
}

/** Fetch a single tool's version list, cached per tool for the session. Returns `undefined` when unavailable. */
function getToolVersionCatalog(toolId: string): Promise<ToolVersionCatalog | undefined> {
  return memoize<ToolVersionCatalog>(
    () => versionCatalogEntries.get(toolId),
    (entry) => {
      if (entry) {
        versionCatalogEntries.set(toolId, entry);
      } else {
        versionCatalogEntries.delete(toolId);
      }
    },
    () => ToolCatalogApi.getToolVersionCatalog(toolId),
  );
}

/** Drop all cached catalog and version data. Mainly useful for tests and forced refreshes. */
function clearCache(): void {
  catalogEntry = undefined;
  versionCatalogEntries.clear();
}

/**
 * Resolve a parsed version selector to a concrete version from a tool's catalog.
 *
 * - `latest-released` without a prefix → the highest released (non-prerelease) version.
 * - `latest-released` with a prefix (e.g. `3.14`) → the highest version within that range.
 * - `exact` → the version itself when present in the catalog.
 * - `latest-installed` / `unset` → `undefined`: these depend on the stack's
 *   preinstalled state, which the released-version catalog cannot resolve.
 *
 * Returns `undefined` when nothing matches — including for non-SemVer tools,
 * whose `versions` should be consumed as opaque strings instead.
 */
function resolveVersion(catalog: ToolVersionCatalog, selector: ParsedToolVersion): string | undefined {
  const { versions } = catalog;

  switch (selector.strategy) {
    case 'latest-released':
      try {
        // `maxSatisfying` ignores entries that are not valid SemVer and excludes
        // prereleases by default, so it safely handles mixed/partial version lists.
        return semver.maxSatisfying(versions, selector.prefix ?? '*') ?? undefined;
      } catch {
        // An unparseable prefix range — fall back to no resolution.
        return undefined;
      }
    case 'exact':
      return versions.includes(selector.version) ? selector.version : undefined;
    default:
      return undefined;
  }
}

export default {
  getToolCatalog,
  getToolVersionCatalog,
  clearCache,
  resolveVersion,
};
