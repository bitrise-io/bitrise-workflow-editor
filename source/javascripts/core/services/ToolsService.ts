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

type VersionOption = { value: string; label: string };

/** The configured value put on top when the catalog lacks it, so a control reflects the YAML. */
function withConfiguredValue(options: VersionOption[], configured: string): VersionOption[] {
  if (!configured || options.some(({ value }) => value === configured)) {
    return options;
  }

  return [{ value: configured, label: configured }, ...options];
}

/** Options for the exact version dropdown. Semver newest first, then the rest in catalog order. */
function getVersionOptions(toolVersions: ToolVersions | undefined): VersionOption[] {
  const versions = toolVersions?.versions ?? [];

  return [
    ...versions
      .filter(({ isSemver }) => isSemver)
      .map(({ version }) => version)
      .sort(semver.rcompare),
    ...versions.filter(({ isSemver }) => !isSemver).map(({ version }) => version),
  ].map((version) => ({ value: version, label: version }));
}

/** Version separators, as characters so a single one is tested with `includes`. */
const SEPARATORS = '.-_+';

/** A part of nothing but digits, as the `8` in `zulu-musl-8.96.0.19`, where a version begins. */
const NUMERIC_PART = /^\d+$/;

/** Whether `version` is in `prefix`'s line, the way mise reads it: `24.2` covers `24.2.0`, not `24.20.0`. */
function matchesPrefix(version: string, prefix: string): boolean {
  if (prefix === '' || version === prefix) {
    return true;
  }

  // Length checked first, or `includes` would match a character past the end of the string.
  return version.length > prefix.length && version.startsWith(prefix) && SEPARATORS.includes(version[prefix.length]);
}

/** Where `version` can be cut to name a line: the whole name, then at most major and minor. */
function toPrefixes(version: string): string[] {
  const cuts: string[] = [];
  // All digits, not merely containing one: `miniconda3-3.9` is a line, `miniconda3-3` is not.
  let major = -1;
  let partStart = 0;

  for (let index = 0; index < version.length; index += 1) {
    if (!SEPARATORS.includes(version[index])) {
      continue;
    }

    if (major === -1 && NUMERIC_PART.test(version.slice(partStart, index))) {
      major = cuts.length;
    }

    cuts.push(version.slice(0, index));
    partStart = index + 1;
  }

  if (cuts.length === 0) {
    return [version];
  }

  return major === -1 ? cuts : cuts.slice(0, major + 2);
}

/** A prefix that is nothing but numbers and dots, like `24` or `24.2`, so it can be ordered. */
const NUMERIC_PREFIX = /^\d+(\.\d+)*$/;

/** Newest first, part by part so `24.11` beats `24.2`, and a prefix sorts above what it contains. */
function compareNumericPrefixes(a: string, b: string): number {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);

  for (let index = 0; index < Math.max(aParts.length, bParts.length); index += 1) {
    if (aParts[index] === undefined) {
      return -1;
    }

    if (bParts[index] === undefined) {
      return 1;
    }

    if (aParts[index] !== bParts[index]) {
      return bParts[index] - aParts[index];
    }
  }

  return 0;
}

/** Prefix suggestions cut from each version, since catalogs are rarely semver. Newest first. */
function getPrefixOptions(toolVersions: ToolVersions | undefined): VersionOption[] {
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

  return [
    ...prefixes.filter((prefix) => NUMERIC_PREFIX.test(prefix)).sort(compareNumericPrefixes),
    ...prefixes.filter((prefix) => !NUMERIC_PREFIX.test(prefix)),
  ].map((prefix) => ({ value: prefix, label: prefix }));
}

/** Whether the catalog has any version in `prefix`'s line. */
function isPrefixInCatalog(toolVersions: ToolVersions, prefix: string): boolean {
  return toolVersions.versions.some(({ version }) => matchesPrefix(version, prefix));
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
  withConfiguredValue,
  isVersionInCatalog,
  isPrefixInCatalog,
  getToolIdOptions,
  getAvailableToolIdOptions,
  validateToolId,
};
