import { TriggerMap } from './TriggerMap';

function deleteWorkflow(triggerMap: TriggerMap, workflowId: string): TriggerMap {
  return triggerMap.filter(({ workflow }) => workflow !== workflowId);
}

export default {
  deleteWorkflow,
};
