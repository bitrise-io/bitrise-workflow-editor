import { ParsedToolVersion } from '../models/Tools';
import { bitriseYmlStore, updateBitriseYmlDocument } from '../stores/BitriseYmlStore';
import YmlUtils from '../utils/YmlUtils';
import WorkflowService from './WorkflowService';

type ToolScope = { type: 'root' } | { type: 'workflow'; workflowId: string };

const PARTIAL_VERSION_REGEX = /^\d+(\.\d+)*(\.x)*$/;
const COMPLETE_SEMVER_REGEX = /^\d+\.\d+\.\d+$/;

function parseToolVersion(raw: string): ParsedToolVersion {
  if (raw === 'unset') {
    return { kind: 'unset' };
  }

  if (raw === 'latest') {
    return { strategy: 'latest-released' };
  }

  if (raw === 'installed') {
    return { strategy: 'latest-installed' };
  }

  const colonIndex = raw.indexOf(':');
  if (colonIndex > 0) {
    const prefix = raw.slice(0, colonIndex);
    const suffix = raw.slice(colonIndex + 1);

    if (suffix === 'latest') {
      return { strategy: 'latest-released', prefix };
    }

    if (suffix === 'installed') {
      return { strategy: 'latest-installed', prefix };
    }
  }

  if (colonIndex < 0 && PARTIAL_VERSION_REGEX.test(raw) && !COMPLETE_SEMVER_REGEX.test(raw)) {
    const prefix = raw.replace(/(\.x)+$/, '');
    return { strategy: 'latest-installed', prefix };
  }

  return { strategy: 'exact', version: raw };
}

function serializeToolVersion(parsed: ParsedToolVersion): string {
  if ('kind' in parsed) {
    return 'unset';
  }

  switch (parsed.strategy) {
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

function getToolsPath(scope: ToolScope): (string | number)[] {
  if (scope.type === 'workflow') {
    return ['workflows', scope.workflowId, 'tools'];
  }
  return ['tools'];
}

function getKeepPath(scope: ToolScope): (string | number)[] {
  if (scope.type === 'workflow') {
    return ['workflows', scope.workflowId];
  }
  return [];
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

    if (suffix !== 'latest' && suffix !== 'installed') {
      return 'Tool version suffix must be "latest" or "installed"';
    }
  }

  return true;
}

function setTool(toolId: string, versionString: string, scope: ToolScope) {
  updateBitriseYmlDocument(({ doc }) => {
    validateScope(scope, doc);

    const path = getToolsPath(scope);
    const tools = YmlUtils.getMapIn(doc, path, true);
    YmlUtils.setIn(tools, [toolId], versionString, false);
    return doc;
  });
}

function deleteTool(toolId: string, scope: ToolScope) {
  updateBitriseYmlDocument(({ doc }) => {
    validateScope(scope, doc);

    const path = getToolsPath(scope);
    const keep = getKeepPath(scope);
    YmlUtils.deleteByPath(doc, [...path, toolId], keep);
    return doc;
  });
}

export type { ToolScope };
export default {
  parseToolVersion,
  serializeToolVersion,
  setTool,
  deleteTool,
  validateToolId,
  validateToolVersion,
};
