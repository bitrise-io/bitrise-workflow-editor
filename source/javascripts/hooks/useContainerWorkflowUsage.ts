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

    const workflowsUsing = (containerId: string) =>
      uniq(documents.flatMap((doc) => ContainerService.getWorkflowsUsingContainer(doc, containerId)));

    if (id) {
      return workflowsUsing(id);
    }

    const containerIds = Object.keys(state.yml.containers ?? {});

    return containerIds.reduce((acc, containerId) => {
      acc.set(containerId, workflowsUsing(containerId));
      return acc;
    }, new Map<string, string[]>());
  });
}

export default useContainerWorkflowUsage;
