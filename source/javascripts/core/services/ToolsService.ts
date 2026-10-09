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

/** The keyword `value` spells, ignoring case. Untrimmed, since the CLI trims only the whole value. */
function findKeyword(value: string) {
  const lower = value.toLowerCase();

  return LATEST_OF_KEYWORDS.find(({ keyword }) => keyword === lower);
}

/** The strategy a keyword means on its own, with no prefix to narrow it. */
function toAbsoluteStrategy(preferInstalled: boolean): ParsedToolVersion {
  return { strategy: preferInstalled ? 'absolute-latest-installed' : 'absolute-latest-released' };
}

function parseToolVersion(rawValue: unknown): ParsedToolVersion {
  // A value written by hand can be a number (`python: 3.13`) or empty, not the declared string.
  // Trimmed, mirroring the `strings.TrimSpace` that opens the CLI's `ParseVersionString`.
  const raw = (typeof rawValue === 'string' ? rawValue : String(rawValue ?? '')).trim();
  const lower = raw.toLowerCase();

  if (lower === UNSET_KEYWORD) {
    return { strategy: 'unset' };
  }

  const bare = findKeyword(raw);
  if (bare) {
    return toAbsoluteStrategy(bare.preferInstalled);
  }

  // Mirrors the CLI's greedy, end anchored `(.*):latest$`, so `a:b:latest` has prefix `a:b`.
  const suffixed = LATEST_OF_SUFFIXES.find(
    ({ suffix }) => raw.slice(raw.length - suffix.length).toLowerCase() === suffix,
  );

  if (suffixed) {
    const prefix = raw.slice(0, raw.length - suffixed.suffix.length);
    // With its default mise provider the CLI reads a `latest` or `installed` prefix as that bare
    // keyword, whichever keyword follows, so `latest:installed` is the newest release.
    const keywordPrefix = findKeyword(prefix);

    if (keywordPrefix) {
      return toAbsoluteStrategy(keywordPrefix.preferInstalled);
    }

    // `:latest` carries no prefix, so it means the same as bare `latest`, and `latest-of` needs one.
    return prefix === ''
      ? toAbsoluteStrategy(suffixed.preferInstalled)
      : { strategy: 'latest-of', prefix, preferInstalled: suffixed.preferInstalled };
  }

  return { strategy: 'exact', version: raw };
}

/** Whether `prefix` is a keyword, which reads back as that bare keyword rather than as a prefix. */
function isKeywordPrefix(prefix: string): boolean {
  return findKeyword(prefix.trim()) !== undefined;
}

/** Whether typing could still turn `prefix` into a keyword, as `lat` could. */
function isKeywordStart(prefix: string): boolean {
  const lower = prefix.trim().toLowerCase();

  return lower !== '' && LATEST_OF_KEYWORDS.some(({ keyword }) => keyword.startsWith(lower));
}

/** Whether the YAML can hold `parsed`. See `docs/decisions.md`. */
function isWritable(parsed: ParsedToolVersion): boolean {
  return parsed.strategy !== 'latest-of' || (parsed.prefix.trim() !== '' && !isKeywordPrefix(parsed.prefix));
}

function serializeToolVersion(parsed: ParsedToolVersion): string {
  switch (parsed.strategy) {
    case 'unset':
      return UNSET_KEYWORD;
    case 'absolute-latest-released':
      return LATEST_KEYWORD;
    case 'absolute-latest-installed':
      return INSTALLED_KEYWORD;
    case 'latest-of': {
      if (!isWritable(parsed)) {
        throw new Error('latest-of requires a prefix that is not empty or a keyword, use an absolute strategy instead');
      }

      const keyword = parsed.preferInstalled ? INSTALLED_KEYWORD : LATEST_KEYWORD;

      // The CLI trims only the ends of the whole value, so a space before the colon would reach mise.
      return `${parsed.prefix.trim()}${KEYWORD_SEPARATOR}${keyword}`;
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
    case 'absolute-latest-released':
    case 'absolute-latest-installed':
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
    case 'absolute-latest-released':
    case 'absolute-latest-installed':
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
    case 'absolute-latest-released':
    case 'absolute-latest-installed':
      return parsed;
    case 'latest-of':
      // The prefix belonged to the old tool, and the new one has no candidates yet.
      return toAbsoluteStrategy(parsed.preferInstalled);
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
  isWritable,
  isKeywordStart,
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
