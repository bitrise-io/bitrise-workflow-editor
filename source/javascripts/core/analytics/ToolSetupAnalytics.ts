import { isEqual, isPlainObject } from 'es-toolkit';
import { Document } from 'yaml';

import { BitriseYml } from '@/core/models/BitriseYml';
import { VersionStrategy } from '@/core/models/Tools';
import ToolsService, { ToolScope } from '@/core/services/ToolsService';
import { activeFileKey, bitriseYmlStore, configDocumentsByFile } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';

import { segmentTrack } from './SegmentBaseTracking';

/** A tool entry as saved: where it sits and its raw version string. */
type ToolEntry = { fileKey: string; scope: ToolScope; toolId: string; value: string };

type ToolSnapshot = { entries: Map<string, ToolEntry>; scopes: Set<string> };

const workflowIdOf = (scope: ToolScope) => (scope.type === 'workflow' ? scope.workflowId : null);

const scopeKey = (fileKey: string, scope: ToolScope) => JSON.stringify([fileKey, workflowIdOf(scope)]);

const entryKey = (fileKey: string, scope: ToolScope, toolId: string) =>
  JSON.stringify([fileKey, workflowIdOf(scope), toolId]);

/** Hand-written values can be numbers (`python: 3.13`) or empty, so they're compared as `parseToolVersion` reads them. */
const toRawValue = (value: unknown) => (typeof value === 'string' ? value : String(value ?? ''));

/** Hand-written YAML can hold anything where a map belongs, so only a map is read. */
const mapEntries = (value: unknown) => (isPlainObject(value) ? Object.entries(value) : []);

/** What the tool setup UI last left in each entry it wrote, `null` for one it removed. */
const uiWrites = new Map<string, string | null>();

/**
 * Remembers what a tool setup UI write left in the active file. Read back from the document rather than
 * taken from the write, so a rename or a removal needs nothing of its own.
 */
export function recordToolSetupWrite(scope: ToolScope, toolIds: string[]) {
  const state = bitriseYmlStore.getState();
  const tools = ToolsService.getToolsForScope(state.yml, scope);

  toolIds.forEach((toolId) => {
    const value = Object.keys(tools).includes(toolId) ? toRawValue(tools[toolId]) : null;
    uiWrites.set(entryKey(activeFileKey(state), scope, toolId), value);
  });
}

/**
 * The document as JSON, or nothing for a file whose tools can't be read: one with parse errors, where a
 * partial parse can drop or move tools, or one `toJSON` throws on, such as too many aliases. Its tools then
 * count only when the UI wrote them. This runs inside store updates, so a throw would break the save.
 */
function readConfig(document: Document) {
  if (document.errors.length > 0) {
    return undefined;
  }

  try {
    return YmlUtils.toJSON(document);
  } catch {
    return undefined;
  }
}

function snapshotTools(documents: Record<string, Document>): ToolSnapshot {
  const entries = new Map<string, ToolEntry>();
  const scopes = new Set<string>();

  const addScope = (fileKey: string, yml: BitriseYml, scope: ToolScope) => {
    scopes.add(scopeKey(fileKey, scope));
    mapEntries(ToolsService.getToolsForScope(yml, scope)).forEach(([toolId, value]) => {
      entries.set(entryKey(fileKey, scope, toolId), { fileKey, scope, toolId, value: toRawValue(value) });
    });
  };

  Object.entries(documents).forEach(([fileKey, document]) => {
    const yml = readConfig(document);
    if (!yml) {
      return;
    }

    addScope(fileKey, yml, { type: 'root' });
    mapEntries(yml.workflows).forEach(([workflowId]) => addScope(fileKey, yml, { type: 'workflow', workflowId }));
  });

  return { entries, scopes };
}

/** The strategy names in the Avo tracking plan. */
const AVO_STRATEGIES: Record<VersionStrategy, string> = {
  exact: 'exact',
  'latest-of': 'latest_of',
  'absolute-latest-released': 'latest_released',
  'absolute-latest-installed': 'latest_installed',
  unset: 'unset',
};

type VersionProperties = {
  tool_version_strategy: string;
  tool_version?: string;
  is_installed_version_preferred?: boolean;
};

function describeVersion(value: string): VersionProperties {
  const parsed = ToolsService.parseToolVersion(value);
  const strategy = AVO_STRATEGIES[parsed.strategy];

  switch (parsed.strategy) {
    case 'exact':
      return { tool_version_strategy: strategy, tool_version: parsed.version };
    case 'latest-of':
      return {
        tool_version_strategy: strategy,
        tool_version: parsed.prefix,
        is_installed_version_preferred: parsed.preferInstalled,
      };
    default:
      return { tool_version_strategy: strategy };
  }
}

/**
 * What an update changed. The preference flag is sent only when both sides have the preference,
 * otherwise the strategy change already says it.
 */
function describeUpdate(before: VersionProperties, after: VersionProperties) {
  const hasPreference =
    before.is_installed_version_preferred !== undefined && after.is_installed_version_preferred !== undefined;

  return {
    previous_tool_version_strategy: before.tool_version_strategy,
    is_tool_version_strategy_changed: before.tool_version_strategy !== after.tool_version_strategy,
    is_tool_version_changed: before.tool_version !== after.tool_version,
    ...(hasPreference && {
      is_installed_version_preference_changed:
        before.is_installed_version_preferred !== after.is_installed_version_preferred,
    }),
  };
}

/** Sends a Segment event per tool entry a save added, changed or removed, and whether the tool setup UI made it. */
export function trackToolSetupSaved(prevDocuments: Record<string, Document>, nextDocuments: Record<string, Document>) {
  const prev = snapshotTools(prevDocuments);
  const next = snapshotTools(nextDocuments);
  const saveId = crypto.randomUUID();

  new Set([...prev.entries.keys(), ...next.entries.keys()]).forEach((key) => {
    const before = prev.entries.get(key);
    const after = next.entries.get(key);
    const entry = after ?? before;
    if (!entry || before?.value === after?.value) {
      return;
    }

    const { fileKey, scope, toolId, value } = entry;
    const version = describeVersion(value);
    const previous = before && after ? describeVersion(before.value) : undefined;
    // An edit that reads the same, such as `22:Latest` for `22:latest`, changed nothing.
    if (previous && isEqual(previous, version)) {
      return;
    }

    const viaUi = uiWrites.has(key) && uiWrites.get(key) === (after?.value ?? null);
    // A scope missing from either snapshot, such as a renamed workflow or a file with parse errors, has
    // nothing to compare with, so only entries the UI wrote count there.
    const scopeId = scopeKey(fileKey, scope);
    if (!viaUi && !(prev.scopes.has(scopeId) && next.scopes.has(scopeId))) {
      return;
    }

    segmentTrack('Tool Setup Changed', {
      event_type: 'product',
      tool_setup_save_id: saveId,
      tool_change_type: !before ? 'added' : !after ? 'removed' : 'updated',
      tool_scope: scope.type,
      tool_id: toolId,
      ...version,
      ...(previous && describeUpdate(previous, version)),
      tool_edit_method: viaUi ? 'ui' : 'yaml_editor',
    });
  });
}

/** A save or a load replaces the documents the UI wrote to, so none of it can reach a later save. */
export function clearToolSetupWrites() {
  uiWrites.clear();
}

/**
 * Forgets the UI writes the live documents no longer hold. A discard drops every write it reverted, and
 * edits that keep the changes, such as applying the diff dialog, keep the writes they left alone.
 */
export function pruneToolSetupWrites() {
  const { entries } = snapshotTools(configDocumentsByFile(bitriseYmlStore.getState()));

  uiWrites.forEach((value, key) => {
    if (value !== (entries.get(key)?.value ?? null)) {
      uiWrites.delete(key);
    }
  });
}
