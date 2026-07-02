import ToolCatalogApi from '../api/ToolCatalogApi';
import { ParsedToolVersion, ToolCatalog, ToolVersions, VersionStrategy } from '../models/Tools';
import { bitriseYmlStore, updateBitriseYmlDocument } from '../stores/BitriseYmlStore';
import YmlUtils from '../utils/YmlUtils';
import WorkflowService from './WorkflowService';

type ToolScope = { type: 'root' } | { type: 'workflow'; workflowId: string };

/** Fetch the catalog index. Rejects with a `ToolCatalogError` when unavailable. */
function getToolCatalog(): Promise<ToolCatalog> {
  return ToolCatalogApi.getToolCatalog();
}

/** Fetch a single tool's version list. Rejects with a `ToolCatalogError` when unavailable. */
function getToolVersions(toolId: string): Promise<ToolVersions> {
  return ToolCatalogApi.getToolVersions(toolId);
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
};
