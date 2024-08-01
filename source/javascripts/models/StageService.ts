import { Stage } from './Stage';
import deepCloneSimpleObject from '@/utils/deepCloneSimpleObject';

function deleteWorkflow(stage: Stage, workflowId: string): Stage {
  const copy = deepCloneSimpleObject(stage);

  copy.workflows = copy.workflows?.filter((workflowObj) => Object.keys(workflowObj)[0] !== workflowId);
  if (!copy.workflows?.length) delete copy.workflows;

  return copy;
}

export default {
  deleteWorkflow,
};
