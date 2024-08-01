import { ChainedWorkflowPlacement, Workflow } from './Workflow';
import deepCloneSimpleObject from '@/utils/deepCloneSimpleObject';

function deleteChainedWorkflowById(workflow: Workflow, chainedWorkflowId: string): Workflow {
  const copy = deepCloneSimpleObject(workflow);

  if (copy.after_run) {
    copy.after_run = copy.after_run.filter((id) => id !== chainedWorkflowId);
    if (!copy.after_run.length) delete copy.after_run;
  }

  if (copy.before_run) {
    copy.before_run = copy.before_run.filter((id) => id !== chainedWorkflowId);
    if (!copy.before_run.length) delete copy.before_run;
  }

  return copy;
}

function deleteChainedWorkflowByPlacement(
  workflow: Workflow,
  chainedWorkflowIndex: number,
  placement: ChainedWorkflowPlacement,
): Workflow {
  const copy = deepCloneSimpleObject(workflow);

  if (copy[placement]?.[chainedWorkflowIndex]) {
    copy[placement].splice(chainedWorkflowIndex, 1);
    if (!copy[placement].length) delete copy[placement];
  }

  return copy;
}

export default {
  deleteChainedWorkflowById,
  deleteChainedWorkflowByPlacement,
};
