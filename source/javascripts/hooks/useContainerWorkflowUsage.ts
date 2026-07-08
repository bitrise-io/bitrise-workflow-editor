import { uniq } from 'es-toolkit';

import ContainerService from '@/core/services/ContainerService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

function useContainerWorkflowUsage(): Map<string, string[]>;
function useContainerWorkflowUsage(id: string): string[];

function useContainerWorkflowUsage(id?: string) {
  return useBitriseYmlStore((state) => {
    // Container usage spans the whole config: a container defined in one module can be used by a
    // workflow in another. Scan every module file (not just the active document) and union the
    // results, so a per-module view reports the same usage as the merged view — and each using
    // workflow is listed once.
    const documents = state.tree ? Object.values(state.files).map((slice) => slice.ymlDocument) : [state.ymlDocument];

    if (id) {
      return uniq(documents.flatMap((doc) => ContainerService.getWorkflowsUsingContainer(doc, id)));
    }

    // Whole-config usage lookup: scan each module file once for all container ids (a batch call), then
    // union across files — rather than re-scanning every file per container.
    const containerIds = Object.keys(state.yml.containers ?? {});
    const usage = new Map<string, string[]>(containerIds.map((containerId) => [containerId, []]));

    documents.forEach((doc) => {
      ContainerService.getWorkflowsUsingContainers(doc, containerIds).forEach((workflowIds, containerId) => {
        usage.set(containerId, [...(usage.get(containerId) ?? []), ...workflowIds]);
      });
    });

    containerIds.forEach((containerId) => usage.set(containerId, uniq(usage.get(containerId) ?? [])));
    return usage;
  });
}

/**
 * For a container, the modules in which each using workflow actually references it — keyed by
 * workflow id. Unlike jumping by the entity index (which lists every module that *defines* a
 * same-named workflow), this points only at the files where that workflow really uses the container,
 * so the usage jump-to-definition doesn't offer an unrelated same-named workflow from another module.
 * Empty node-id lists in single-file mode (there are no modules to jump between).
 */
function useContainerUsageByWorkflow(containerId: string): Map<string, string[]> {
  return useBitriseYmlStore((state) => {
    const usage = new Map<string, string[]>();
    const slices = state.tree ? Object.values(state.files) : [];

    if (slices.length === 0) {
      ContainerService.getWorkflowsUsingContainer(state.ymlDocument, containerId).forEach((workflowId) => {
        if (!usage.has(workflowId)) {
          usage.set(workflowId, []);
        }
      });
      return usage;
    }

    slices.forEach((slice) => {
      ContainerService.getWorkflowsUsingContainer(slice.ymlDocument, containerId).forEach((workflowId) => {
        const nodeIds = usage.get(workflowId) ?? [];
        if (!nodeIds.includes(slice.nodeId)) {
          nodeIds.push(slice.nodeId);
        }
        usage.set(workflowId, nodeIds);
      });
    });
    return usage;
  });
}

export { useContainerUsageByWorkflow };
export default useContainerWorkflowUsage;
