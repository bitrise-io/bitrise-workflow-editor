import semver from 'semver';

import { ParsedToolVersion, ToolCatalog, ToolVersions, VersionStrategy } from '../models/Tools';
import { bitriseYmlStore, updateBitriseYmlDocument } from '../stores/BitriseYmlStore';
import ToolVersionUtils from '../utils/ToolVersionUtils';
import YmlUtils from '../utils/YmlUtils';
import WorkflowService from './WorkflowService';

type ToolScope = { type: 'root' } | { type: 'workflow'; workflowId: string };

/** Separates a prefix from its keyword, as the colon in `22:latest`. */
const KEYWORD_SEPARATOR = ':';

/** Turns a tool off for one workflow. A strategy of its own, so it carries no prefix. */
const UNSET_KEYWORD = 'unset';

const LATEST_KEYWORD = 'latest';
const INSTALLED_KEYWORD = 'installed';

/** The keywords `latest-of` can carry. Matched ignoring case, unlike the CLI, because that matches intent. */
const LATEST_OF_KEYWORDS = [
  { keyword: INSTALLED_KEYWORD, preferInstalled: true },
  { keyword: LATEST_KEYWORD, preferInstalled: false },
];

/** The same keywords with their separator, longest first so neither suffix shadows the other. */
const LATEST_OF_SUFFIXES = LATEST_OF_KEYWORDS.map(({ keyword, preferInstalled }) => ({
  suffix: `${KEYWORD_SEPARATOR}${keyword}`,
  preferInstalled,
}));

function parseToolVersion(rawValue: unknown): ParsedToolVersion {
  // A value written by hand can be a number (`python: 3.13`) or empty, not the declared string.
  // Trimmed, mirroring the `strings.TrimSpace` that opens the CLI's `ParseVersionString`.
  const raw = (typeof rawValue === 'string' ? rawValue : String(rawValue ?? '')).trim();
  const lower = raw.toLowerCase();

  if (lower === UNSET_KEYWORD) {
    return { strategy: 'unset' };
  }

  const bare = LATEST_OF_KEYWORDS.find(({ keyword }) => lower === keyword);
  if (bare) {
    return { strategy: 'latest-of', prefix: '', preferInstalled: bare.preferInstalled };
  }

  // Mirrors the CLI's greedy, end anchored `(.*):latest$`, so `a:b:latest` has prefix `a:b`.
  const suffixed = LATEST_OF_SUFFIXES.find(
    ({ suffix }) => raw.slice(raw.length - suffix.length).toLowerCase() === suffix,
  );

  if (suffixed) {
    return {
      strategy: 'latest-of',
      prefix: raw.slice(0, raw.length - suffixed.suffix.length),
      preferInstalled: suffixed.preferInstalled,
    };
  }

  return { strategy: 'exact', version: raw };
}

function serializeToolVersion(parsed: ParsedToolVersion): string {
  switch (parsed.strategy) {
    case 'unset':
      return UNSET_KEYWORD;
    case 'latest-of': {
      const keyword = parsed.preferInstalled ? INSTALLED_KEYWORD : LATEST_KEYWORD;

      return parsed.prefix ? `${parsed.prefix}${KEYWORD_SEPARATOR}${keyword}` : keyword;
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

/** Options for the prefix dropdown, offering only lines mise can resolve. */
function getPrefixOptions(toolVersions: ToolVersions | undefined): VersionOption[] {
  return ToolVersionUtils.getPrefixes(toolVersions).map((prefix) => ({ value: prefix, label: prefix }));
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
  getToolIdOptions,
  getAvailableToolIdOptions,
  validateToolId,
};
