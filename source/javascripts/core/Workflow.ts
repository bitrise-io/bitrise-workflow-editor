import { WithId } from './WithId';
import { BitriseYml, Meta } from './BitriseYml';

type Workflows = Required<BitriseYml>['workflows'];
type WorkflowObject = Workflows[string] & {
  meta?: Meta;
  run_if?: string;
};

type Workflow = WithId<WorkflowObject>;

const WORKFLOW_NAME_REQUIRED = 'Workflow name is required';
const WORKFLOW_NAME_SHOULD_NOT_BE_EMPTY = 'Workflow name should not be empty';
const WORKFLOW_NAME_PATTERN = {
  value: /^[A-Za-z0-9-_.]+$/,
  message: 'Workflow name must only contain letters, numbers, dashes, underscores or periods',
};

const getBeforeRunChain = (workflows: Workflows, id: string): string[] => {
  const ids = workflows?.[id]?.before_run ?? [];

  return ids.reduce<string[]>((mergedIds, currentId) => {
    if (workflows[currentId]) {
      return [
        ...mergedIds,
        ...getBeforeRunChain(workflows, currentId),
        currentId,
        ...getAfterRunChain(workflows, currentId),
      ];
    }
    return mergedIds;
  }, []);
};

const getAfterRunChain = (workflows: Workflows, id: string): string[] => {
  const ids = workflows?.[id]?.after_run ?? [];

  return ids.reduce<string[]>((mergedIds, currentId) => {
    if (workflows[currentId]) {
      return [
        ...mergedIds,
        ...getBeforeRunChain(workflows, currentId),
        currentId,
        ...getAfterRunChain(workflows, currentId),
      ];
    }
    return mergedIds;
  }, []);
};

const getWorkflowChain = (workflows: Workflows, id: string): string[] => {
  if (!workflows?.[id]) {
    return [];
  }

  const beforeRuns = getBeforeRunChain(workflows, id);
  const afterRuns = getAfterRunChain(workflows, id);
  return [beforeRuns, id, afterRuns].flat();
};

const getAllWorkflowChains = (workflows: Workflows): Record<string, string[]> => {
  return Object.keys(workflows || {}).reduce<Record<string, string[]>>((chains, id) => {
    // eslint-disable-next-line no-param-reassign
    chains[id] = getWorkflowChain(workflows, id);
    return chains;
  }, {});
};

const getChainableWorkflows = (workflows: Workflows, id: string): string[] => {
  const workflowChains = getAllWorkflowChains(workflows);
  return Object.entries(workflowChains).reduce<string[]>((chainableWorkflows, [workflowId, chain]) => {
    if (!chain.includes(id)) {
      return [...chainableWorkflows, workflowId];
    }
    return chainableWorkflows;
  }, []);
};

const getDependantWorkflows = (workflows: Workflows, id: string): string[] => {
  const workflowChains = getAllWorkflowChains(workflows);
  return Object.entries(workflowChains).reduce<string[]>((usedByWorkflows, [workflowId, chain]) => {
    if (chain.includes(id) && id !== workflowId) {
      return [...usedByWorkflows, workflowId];
    }
    return usedByWorkflows;
  }, []);
};

function deleteBeforeRun(workflow: Workflow, workflowId: string): Workflow {
  return {
    ...workflow,
    before_run: workflow.before_run?.filter((chainedWorkflowId) => chainedWorkflowId !== workflowId),
  };
}

function deleteAfterRun(workflow: Workflow, workflowId: string): Workflow {
  return {
    ...workflow,
    after_run: workflow.after_run?.filter((chainedWorkflowId) => chainedWorkflowId !== workflowId),
  };
}

export { Workflow, Workflows };
export default {
  WORKFLOW_NAME_REQUIRED,
  WORKFLOW_NAME_SHOULD_NOT_BE_EMPTY,
  WORKFLOW_NAME_PATTERN,
  getBeforeRunChain,
  getAfterRunChain,
  getWorkflowChain,
  getAllWorkflowChains,
  getChainableWorkflows,
  getDependantWorkflows,
  deleteBeforeRun,
  deleteAfterRun,
};
