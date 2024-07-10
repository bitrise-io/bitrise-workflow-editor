import { BitriseYml, Meta } from './BitriseYml';

export type Workflows = Required<BitriseYml>['workflows'];
export type Workflow = Workflows[string] & { meta?: Meta; run_if?: string };

export const extractBeforeRunChain = (workflows: Workflows, id: string): string[] => {
  const ids = workflows?.[id]?.before_run ?? [];

  return ids.reduce<string[]>((mergedIds, currentId) => {
    if (workflows[currentId]) {
      return [
        ...mergedIds,
        ...extractBeforeRunChain(workflows, currentId),
        currentId,
        ...extractAfterRunChain(workflows, currentId),
      ];
    }
    return mergedIds;
  }, []);
};

export const extractAfterRunChain = (workflows: Workflows, id: string): string[] => {
  const ids = workflows?.[id]?.after_run ?? [];

  return ids.reduce<string[]>((mergedIds, currentId) => {
    if (workflows[currentId]) {
      return [
        ...mergedIds,
        ...extractBeforeRunChain(workflows, currentId),
        currentId,
        ...extractAfterRunChain(workflows, currentId),
      ];
    }
    return mergedIds;
  }, []);
};

export const extractWorkflowChain = (workflows: Workflows, id: string): string[] => {
  if (!workflows?.[id]) {
    return [];
  }

  const beforeRuns = extractBeforeRunChain(workflows, id);
  const afterRuns = extractAfterRunChain(workflows, id);
  return [beforeRuns, id, afterRuns].flat();
};

export const extractAllWorkflowChains = (workflows: Workflows): Record<string, string[]> => {
  return Object.keys(workflows || {}).reduce<Record<string, string[]>>((chains, id) => {
    // eslint-disable-next-line no-param-reassign
    chains[id] = extractWorkflowChain(workflows, id);
    return chains;
  }, {});
};

export const extractChainableWorkflows = (workflows: Workflows, id: string): string[] => {
  const workflowChains = extractAllWorkflowChains(workflows);
  return Object.entries(workflowChains).reduce<string[]>((chainableWorkflows, [workflowId, chain]) => {
    if (!chain.includes(id)) {
      return [...chainableWorkflows, workflowId];
    }
    return chainableWorkflows;
  }, []);
};

export const extractUsedByWorkflows = (workflows: Workflows, id: string): string[] => {
  return Object.entries(workflows || {}).reduce<string[]>((usedByWorkflows, [workflowId, workflow]) => {
    if (workflow?.before_run?.includes(id) || workflow?.after_run?.includes(id)) {
      return [...usedByWorkflows, workflowId];
    }
    return usedByWorkflows;
  }, []);
};
