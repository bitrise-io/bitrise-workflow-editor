import { datadogRum } from '@datadog/browser-rum';
import { isPlainObject } from 'es-toolkit';
import { Document } from 'yaml';

import ToolsService, { ToolScope } from '@/core/services/ToolsService';
import { activeFileKey, bitriseYmlStore, configDocumentsByFile } from '@/core/stores/BitriseYmlStore';
import GlobalProps from '@/core/utils/GlobalProps';
import YmlUtils from '@/core/utils/YmlUtils';

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
 * Remembers what a tool setup UI write left in the active file, so a save can tell the changes made
 * through the UI from those made in YAML. Read back from the document rather than taken from the write,
 * so a rename or a removal needs nothing of its own.
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
    const yml = YmlUtils.toJSON(document);
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
      return { strategy: parsed.strategy, version: parsed.version };
    case 'latest-of':
      return { strategy: parsed.strategy, version: parsed.prefix, preferInstalled: parsed.preferInstalled };
    default:
      return { strategy: parsed.strategy };
  }
}

/**
 * Records in RUM each tool entry a save added, changed or removed, and whether the tool setup UI made the
 * change, so how many people set up tools through the UI, and how, can be counted.
 */
export function trackToolSetupSaved(prevDocuments: Record<string, Document>, nextDocuments: Record<string, Document>) {
  const prev = snapshotTools(prevDocuments);
  const next = snapshotTools(nextDocuments);
  const workspaceSlug = GlobalProps.workspaceSlug();

  new Set([...prev.entries.keys(), ...next.entries.keys()]).forEach((key) => {
    const before = prev.entries.get(key);
    const after = next.entries.get(key);
    const entry = after ?? before;
    if (!entry || before?.value === after?.value) {
      return;
    }

    const { fileKey, workflowId, toolId, value } = entry;
    const viaUi = uiWrites.has(key) && uiWrites.get(key) === (after?.value ?? null);
    // A workflow or file that came or went with the save, renamed say, takes its tools along without
    // anyone touching them, so only an entry the UI wrote under its saved name counts there.
    const scope = scopeKey(fileKey, workflowId);
    if (!viaUi && !(prev.scopes.has(scope) && next.scopes.has(scope))) {
      return;
    }

    datadogRum.addAction('tool_setup_saved', {
      change: !before ? 'added' : !after ? 'removed' : 'updated',
      scope: workflowId === undefined ? 'root' : 'workflow',
      tool: toolId,
      ...describeVersion(value),
      ...(before && after && { previousStrategy: describeVersion(before.value).strategy }),
      viaUi,
      ...(workspaceSlug && { workspaceSlug }),
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
