import { TargetBasedTrigger, TriggerSource } from '@/core/models/Trigger';
import EntityIndexService from '@/core/services/EntityIndexService';
import TreeService from '@/core/services/TreeService';
import TriggerService from '@/core/services/TriggerService';

import useBitriseYmlStore from './useBitriseYmlStore';

export type TriggerFileGroup = { nodeId: string; path: string; triggers: TargetBasedTrigger[] };

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

/**
 * Group triggers by the source file of their target workflow/pipeline (top-most defining layer), in
 * tree pre-order — for the merged view's per-file sections. Triggers whose target isn't in the index
 * are dropped. Input order is preserved within each group.
 */
function useTriggersGroupedByFile(triggers: TargetBasedTrigger[]): TriggerFileGroup[] {
  return useBitriseYmlStore((s) => {
    if (!s.tree) {
      return [];
    }
    const byNode = new Map<string, TargetBasedTrigger[]>();
    triggers.forEach((trigger) => {
      const [source, sourceId] = trigger.source.split('#') as [TriggerSource, string];
      const nodeId = EntityIndexService.definingNodeId(s.entityIndex, source, sourceId);
      if (!nodeId) {
        return;
      }
      const bucket = byNode.get(nodeId);
      if (bucket) {
        bucket.push(trigger);
      } else {
        byNode.set(nodeId, [trigger]);
      }
    });

    const groups: TriggerFileGroup[] = [];
    TreeService.walk(s.tree, (node) => {
      const groupTriggers = byNode.get(node.nodeId);
      if (groupTriggers?.length) {
        groups.push({ nodeId: node.nodeId, path: s.files[node.nodeId]?.path ?? node.path, triggers: groupTriggers });
      }
    });
    return groups;
  });
}

export { useAllTargetBasedTriggers, useTriggersGroupedByFile };
export default useTargetBasedTriggers;
