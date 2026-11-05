import { isPlainObject } from 'es-toolkit';
import { Document } from 'yaml';

import ToolsService, { ToolScope } from '@/core/services/ToolsService';
import { activeFileKey, bitriseYmlStore, configDocumentsByFile } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';

import { segmentTrack } from './SegmentBaseTracking';

/** A tool entry as saved: where it sits and its raw version string. */
type ToolEntry = { fileKey: string; workflowId?: string; toolId: string; value: string };

type ToolSnapshot = { entries: Map<string, ToolEntry>; scopes: Set<string> };

const scopeKey = (fileKey: string, workflowId: string | undefined) => JSON.stringify([fileKey, workflowId ?? null]);

const entryKey = (fileKey: string, workflowId: string | undefined, toolId: string) =>
  JSON.stringify([fileKey, workflowId ?? null, toolId]);

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
  const workflowId = scope.type === 'workflow' ? scope.workflowId : undefined;
  const tools = ToolsService.getToolsForScope(state.yml, scope);

  toolIds.forEach((toolId) => {
    const value = Object.keys(tools).includes(toolId) ? toRawValue(tools[toolId]) : null;
    uiWrites.set(entryKey(activeFileKey(state), workflowId, toolId), value);
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

  const addScope = (fileKey: string, workflowId: string | undefined, tools: unknown) => {
    scopes.add(scopeKey(fileKey, workflowId));
    mapEntries(tools).forEach(([toolId, value]) => {
      entries.set(entryKey(fileKey, workflowId, toolId), { fileKey, workflowId, toolId, value: toRawValue(value) });
    });
  };

  Object.entries(documents).forEach(([fileKey, document]) => {
    const yml = readConfig(document);
    if (!yml) {
      return;
    }

    addScope(fileKey, undefined, yml.tools);
    mapEntries(yml.workflows).forEach(([workflowId, workflow]) => {
      addScope(fileKey, workflowId, isPlainObject(workflow) ? workflow.tools : undefined);
    });
  });

  return { entries, scopes };
}

function describeVersion(value: string) {
  const parsed = ToolsService.parseToolVersion(value);

  switch (parsed.strategy) {
    case 'exact':
      return { version_strategy: parsed.strategy, tool_version: parsed.version };
    case 'latest-of':
      return {
        version_strategy: parsed.strategy,
        tool_version: parsed.prefix,
        is_prefer_installed: parsed.preferInstalled,
      };
    default:
      return { version_strategy: parsed.strategy };
  }
}

/** Sends a Segment event per tool entry a save added, changed or removed, and whether the tool setup UI made it. */
export function trackToolSetupSaved(prevDocuments: Record<string, Document>, nextDocuments: Record<string, Document>) {
  const prev = snapshotTools(prevDocuments);
  const next = snapshotTools(nextDocuments);

  new Set([...prev.entries.keys(), ...next.entries.keys()]).forEach((key) => {
    const before = prev.entries.get(key);
    const after = next.entries.get(key);
    const entry = after ?? before;
    if (!entry || before?.value === after?.value) {
      return;
    }

    const { fileKey, workflowId, toolId, value } = entry;
    const viaUi = uiWrites.has(key) && uiWrites.get(key) === (after?.value ?? null);
    // A scope missing from either snapshot, such as a renamed workflow or a file with parse errors, has
    // nothing to compare with, so only entries the UI wrote count there.
    const scope = scopeKey(fileKey, workflowId);
    if (!viaUi && !(prev.scopes.has(scope) && next.scopes.has(scope))) {
      return;
    }

    segmentTrack('Tool Setup Changed', {
      event_type: 'product',
      change_type: !before ? 'added' : !after ? 'removed' : 'updated',
      tool_scope: workflowId === undefined ? 'root' : 'workflow',
      tool_id: toolId,
      ...describeVersion(value),
      ...(before && after && { previous_version_strategy: describeVersion(before.value).version_strategy }),
      is_edited_via_ui: viaUi,
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
