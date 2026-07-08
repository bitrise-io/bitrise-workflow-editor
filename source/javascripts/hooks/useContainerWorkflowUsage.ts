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

export default useContainerWorkflowUsage;
