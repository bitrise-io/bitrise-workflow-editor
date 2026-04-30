import { ParsedToolVersion } from '../models/Tools';
import { bitriseYmlStore, updateBitriseYmlDocument } from '../stores/BitriseYmlStore';
import YmlUtils from '../utils/YmlUtils';
import WorkflowService from './WorkflowService';

type ToolScope = { type: 'root' } | { type: 'workflow'; workflowId: string };

function parseToolVersion(raw: string): ParsedToolVersion {
  if (raw === 'unset') {
    return { kind: 'unset' };
  }

  if (raw === 'latest') {
    return { strategy: 'latest-released' };
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
      return `${parsed.prefix}:installed`;
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

function validateToolId(id: string, existingIds: string[] = []) {
  if (!id.trim()) {
    return 'Tool ID is required';
  }

  if (existingIds.includes(id)) {
    return 'Tool ID must be unique';
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
};
