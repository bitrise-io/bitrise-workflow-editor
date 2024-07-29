import { BitriseYml } from './BitriseYml';

type TriggerMap = Required<BitriseYml['trigger_map']>;

function deleteTrigger(trigger_map: TriggerMap, workflowId: string): TriggerMap {
  return trigger_map?.filter(({ workflow }) => workflow !== workflowId);
}

export { TriggerMap };
export default {
  deleteTrigger,
};
