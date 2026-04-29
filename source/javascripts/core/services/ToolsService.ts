import { ParsedToolVersion } from '../models/Tools';
import { bitriseYmlStore, updateBitriseYmlDocument } from '../stores/BitriseYmlStore';
import YmlUtils from '../utils/YmlUtils';
import WorkflowService from './WorkflowService';

enum ToolsSource {
  Root = 'root',
  Workflow = 'workflow',
}

function parseToolVersion(raw: string): ParsedToolVersion {
  if (raw === 'unset') {
    return { kind: 'unset' };
  }

  if (raw === 'latest') {
    return { strategy: 'absolute-latest' };
  }

  const colonIndex = raw.indexOf(':');
  if (colonIndex > 0) {
    const prefix = raw.slice(0, colonIndex);
    const suffix = raw.slice(colonIndex + 1);

    if (suffix === 'latest') {
      return { strategy: 'latest-of', prefix };
    }

    if (suffix === 'installed') {
      return { strategy: 'preinstalled', prefix };
    }
  }

  return { strategy: 'exact', version: raw };
}

function serializeToolVersion(parsed: ParsedToolVersion): string {
  if ('kind' in parsed) {
    return 'unset';
  }

  switch (parsed.strategy) {
    case 'absolute-latest':
      return 'latest';
    case 'latest-of':
      return `${parsed.prefix}:latest`;
    case 'preinstalled':
      return `${parsed.prefix}:installed`;
    case 'exact':
      return parsed.version;
  }
}

function validateSourceId(source: ToolsSource, workflowId?: string, doc = bitriseYmlStore.getState().ymlDocument) {
  if (source === ToolsSource.Workflow && !workflowId) {
    throw new Error('workflowId is required when source is Workflow');
  }

  if (source === ToolsSource.Workflow && workflowId) {
    WorkflowService.getWorkflowOrThrowError(workflowId, doc);
  }
}

function getToolsPath(source: ToolsSource, workflowId?: string): (string | number)[] {
  if (source === ToolsSource.Workflow && workflowId) {
    return ['workflows', workflowId, 'tools'];
  }
  return ['tools'];
}

function getKeepPath(source: ToolsSource, workflowId?: string): (string | number)[] {
  if (source === ToolsSource.Workflow && workflowId) {
    return ['workflows', workflowId];
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

function setTool(toolId: string, versionString: string, source: ToolsSource, workflowId?: string) {
  updateBitriseYmlDocument(({ doc }) => {
    validateSourceId(source, workflowId, doc);

    const path = getToolsPath(source, workflowId);
    const tools = YmlUtils.getMapIn(doc, path, true);
    YmlUtils.setIn(tools, [toolId], versionString, false);
    return doc;
  });
}

function deleteTool(toolId: string, source: ToolsSource, workflowId?: string) {
  updateBitriseYmlDocument(({ doc }) => {
    validateSourceId(source, workflowId, doc);

    const path = getToolsPath(source, workflowId);
    const keep = getKeepPath(source, workflowId);
    YmlUtils.deleteByPath(doc, [...path, toolId], keep);
    return doc;
  });
}

export { ToolsSource };
export default {
  parseToolVersion,
  serializeToolVersion,
  setTool,
  deleteTool,
  validateToolId,
};
