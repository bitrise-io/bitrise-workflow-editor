import { TargetBasedTrigger, TriggerSource } from '@/core/models/Trigger';
import TriggerService from '@/core/services/TriggerService';

import useBitriseYmlStore from './useBitriseYmlStore';

function useAllTargetBasedTriggers() {
  const pipelines = useBitriseYmlStore((state) => state.yml.pipelines || {});
  const workflows = useBitriseYmlStore((state) => state.yml.workflows || {});

  const triggers: TargetBasedTrigger[] = [];

  Object.entries(pipelines).forEach(([sourceId, pipelineObj]) => {
    const pipelineTriggers = TriggerService.toTargetBasedTriggers('pipelines', sourceId, pipelineObj?.triggers || {});
    triggers.push(...pipelineTriggers.push, ...pipelineTriggers.pull_request, ...pipelineTriggers.tag);
  });

  Object.entries(workflows).forEach(([sourceId, workflowObj]) => {
    const workflowTriggers = TriggerService.toTargetBasedTriggers('workflows', sourceId, workflowObj?.triggers || {});
    triggers.push(...workflowTriggers.push, ...workflowTriggers.pull_request, ...workflowTriggers.tag);
  });

  return triggers;
}

function useTargetBasedTriggers(source: TriggerSource, sourceId: string) {
  const triggersModel = useBitriseYmlStore((state) => state.yml[source]?.[sourceId]?.triggers);
  return {
    enabled: triggersModel?.enabled,
    items: TriggerService.toTargetBasedTriggers(source, sourceId, triggersModel),
  };
}

export { useAllTargetBasedTriggers };
export default useTargetBasedTriggers;
