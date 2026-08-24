import semver from 'semver';

import { ParsedToolVersion, ToolCatalog, ToolVersions, VersionStrategy } from '../models/Tools';
import { bitriseYmlStore, updateBitriseYmlDocument } from '../stores/BitriseYmlStore';
import YmlUtils from '../utils/YmlUtils';
import WorkflowService from './WorkflowService';

type ToolScope = { type: 'root' } | { type: 'workflow'; workflowId: string };

function parseToolVersion(rawValue: unknown): ParsedToolVersion {
  // A value written by hand can be a number (`python: 3.13`) or empty, not the declared string.
  const raw = typeof rawValue === 'string' ? rawValue : String(rawValue ?? '');
  const lower = raw.toLowerCase();

  if (lower === 'unset') {
    return { strategy: 'unset' };
  }

  if (lower === 'latest' || lower === 'installed') {
    return { strategy: 'latest-of', prefix: '', preferInstalled: lower === 'installed' };
  }

  const colonIndex = raw.indexOf(':');
  if (colonIndex > 0) {
    const prefix = raw.slice(0, colonIndex);
    const suffix = raw.slice(colonIndex + 1).toLowerCase();

    if (suffix === 'latest' || suffix === 'installed') {
      return { strategy: 'latest-of', prefix, preferInstalled: suffix === 'installed' };
    }
  }

  return { strategy: 'exact', version: raw };
}

function serializeToolVersion(parsed: ParsedToolVersion): string {
  switch (parsed.strategy) {
    case 'unset':
      return 'unset';
    case 'latest-of': {
      const keyword = parsed.preferInstalled ? 'installed' : 'latest';
      return parsed.prefix ? `${parsed.prefix}:${keyword}` : keyword;
    }
    case 'exact':
      return parsed.version;
  }
}

/** Builds a parsed version from the row's controls, the strategy deciding what the fields mean. */
function toParsedToolVersion(
  strategy: VersionStrategy,
  inputValue: string,
  preferInstalled = false,
): ParsedToolVersion {
  switch (strategy) {
    case 'exact':
      return { strategy, version: inputValue };
    case 'unset':
      return { strategy };
    case 'latest-of':
      return { strategy, prefix: inputValue, preferInstalled };
  }
}

/** The inverse of `toParsedToolVersion`: what the row's version field shows. */
function getVersionInputValue(parsed: ParsedToolVersion): string {
  switch (parsed.strategy) {
    case 'exact':
      return parsed.version;
    case 'unset':
      return '';
    case 'latest-of':
      return parsed.prefix;
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

/** Every tool ID (canonical name or alias) the catalog recognizes. */
function getKnownToolIds(catalog?: ToolCatalog): string[] {
  return catalog?.tools.flatMap(({ name, aliases }) => [name, ...(aliases ?? [])]) ?? [];
}

/** Whether a tool ID matches a catalog entry, by canonical name or alias. */
function isKnownToolId(catalog: ToolCatalog | undefined, toolId: string): boolean {
  return getKnownToolIds(catalog).includes(toolId);
}

/** Resolves a tool ID (canonical name or alias) to its catalog canonical name, or itself if unknown. */
function resolveToolName(catalog: ToolCatalog | undefined, id: string): string {
  const entry = catalog?.tools.find(({ name, aliases }) => name === id || (aliases ?? []).includes(id));
  return entry?.name ?? id;
}

/**
 * Builds the exact-version dropdown options: semver versions sorted newest first,
 * then non-semver versions in catalog order. A non-empty `currentVersion` missing
 * from the catalog is injected at the top so the dropdown always reflects what's
 * in the YAML instead of showing an empty selection.
 */
function getVersionOptions(
  toolVersions: ToolVersions | undefined,
  currentVersion: string,
): { value: string; label: string }[] {
  const versions = toolVersions?.versions ?? [];
  const ordered = [
    ...versions
      .filter(({ isSemver }) => isSemver)
      .map(({ version }) => version)
      .sort(semver.rcompare),
    ...versions.filter(({ isSemver }) => !isSemver).map(({ version }) => version),
  ];

  if (currentVersion && !ordered.includes(currentVersion)) {
    ordered.unshift(currentVersion);
  }

  return ordered.map((version) => ({ value: version, label: version }));
}

/**
 * Every proper prefix of `version` cut at a separator: `zulu-musl-8.96.0` yields `zulu`,
 * `zulu-musl`, `zulu-musl-8` and `zulu-musl-8.96`. A value with no separator has no proper prefix,
 * so it stands in for itself.
 */
function toPrefixes(version: string): string[] {
  const cuts = [...version].flatMap((char, index) => (/[.\-_+]/.test(char) ? [version.slice(0, index)] : []));
  return cuts.length > 0 ? cuts : [version];
}

/**
 * Prefix suggestions taken from the version list, keeping its order so the newest come first.
 * Derived by cutting each value at its separators rather than by parsing semver, because a prefix
 * is matched as a string and most catalogs are not semver: java publishes `zulu-musl-8.96.0.19`,
 * python `3.15.0rc1`. A `currentPrefix` the list does not suggest is added at the top, so the
 * control always reflects the YAML.
 */
function getPrefixOptions(
  toolVersions: ToolVersions | undefined,
  currentPrefix: string,
): { value: string; label: string }[] {
  const prefixes: string[] = [];
  const seen = new Set<string>();

  (toolVersions?.versions ?? []).forEach(({ version }) => {
    toPrefixes(version).forEach((prefix) => {
      if (prefix && !seen.has(prefix)) {
        seen.add(prefix);
        prefixes.push(prefix);
      }
    });
  });

  if (currentPrefix && !seen.has(currentPrefix)) {
    prefixes.unshift(currentPrefix);
  }

  return prefixes.map((prefix) => ({ value: prefix, label: prefix }));
}

/** Whether any catalog version starts with `prefix`, which is how a prefix is matched. */
function isPrefixInCatalog(toolVersions: ToolVersions, prefix: string): boolean {
  return toolVersions.versions.some(({ version }) => version.startsWith(prefix));
}

function isVersionInCatalog(toolVersions: ToolVersions, version: string): boolean {
  return toolVersions.versions.some((entry) => entry.version === version);
}

/**
 * Builds the tool-ID dropdown options: one per catalog tool, using its canonical name —
 * except the tool matching `toolId` (by name or alias), which is shown using that exact ID
 * so the current selection stays visible without listing the same tool under two IDs.
 */
function getToolIdOptions(catalog: ToolCatalog | undefined, toolId: string): { value: string; label: string }[] {
  return (catalog?.tools ?? []).map(({ name, aliases = [] }) => {
    const value = toolId === name || aliases.includes(toolId) ? toolId : name;
    return { value, label: value };
  });
}

/**
 * `getToolIdOptions`, minus tool IDs already used by another row (a row's own ID is always kept).
 */
function getAvailableToolIdOptions(
  catalog: ToolCatalog | undefined,
  toolId: string,
  existingToolIds: string[],
): { value: string; label: string }[] {
  const usedNames = new Set(existingToolIds.filter((id) => id !== toolId).map((id) => resolveToolName(catalog, id)));
  return getToolIdOptions(catalog, toolId).filter(
    ({ value }) => value === toolId || !usedNames.has(resolveToolName(catalog, value)),
  );
}

function validateToolId(id: string, initialId: string, existingIds: string[] = [], catalog?: ToolCatalog) {
  if (!id.trim()) {
    return 'Tool ID is required';
  }

  if (id !== initialId) {
    const name = resolveToolName(catalog, id);
    const isDuplicate = existingIds.some(
      (existingId) => existingId !== initialId && resolveToolName(catalog, existingId) === name,
    );
    if (isDuplicate) {
      return 'Tool ID must be unique';
    }
  }

  return true;
}

function setTool(toolId: string, parsed: ParsedToolVersion, scope: ToolScope) {
  if (parsed.strategy === 'unset' && scope.type === 'root') {
    throw new Error('Cannot use "unset" strategy at root scope');
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

/**
 * The value to keep when a tool entry is renamed to a different tool: the strategy
 * carries over, but any exact version or prefix is dropped, because it belonged to the
 * previous tool and is very unlikely to be valid for the new one.
 */
function nextParsedVersionOnRename(parsed: ParsedToolVersion): ParsedToolVersion {
  switch (parsed.strategy) {
    case 'exact':
      return { strategy: 'exact', version: '' };
    case 'unset':
      return parsed;
    case 'latest-of':
      // The installed preference is about how a version is resolved, not about which tool, so it
      // survives the rename even though the prefix does not.
      return { strategy: 'latest-of', prefix: '', preferInstalled: parsed.preferInstalled };
  }
}

function renameTool(oldId: string, newId: string, scope: ToolScope) {
  updateBitriseYmlDocument(({ doc }) => {
    validateScope(scope, doc);

    const scopePath = getScopePath(scope);
    const toolsPath = [...scopePath, 'tools'];

    // Move the entry to its new key first. This throws if there is no such entry, before
    // anything else touches it.
    YmlUtils.updateKeyByPath(doc, [...toolsPath, oldId], newId);

    const tools = YmlUtils.getMapIn(doc, toolsPath, true);
    const parsed = parseToolVersion(tools.get(newId));
    // Then overwrite its value: an exact version or prefix picked for the old tool is very
    // unlikely to be valid for the new one, so only the strategy carries over.
    YmlUtils.setIn(tools, [newId], serializeToolVersion(nextParsedVersionOnRename(parsed)), false);

    return doc;
  });
}

export type { ToolScope };
export default {
  parseToolVersion,
  serializeToolVersion,
  toParsedToolVersion,
  getVersionInputValue,
  setTool,
  deleteTool,
  renameTool,
  getKnownToolIds,
  isKnownToolId,
  resolveToolName,
  getVersionOptions,
  getPrefixOptions,
  isVersionInCatalog,
  isPrefixInCatalog,
  getToolIdOptions,
  getAvailableToolIdOptions,
  validateToolId,
};
