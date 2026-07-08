import { TriggersModel } from '@/core/models/BitriseYml';
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

    // Nothing groupable (empty input or no indexed targets) → skip the O(tree) walk.
    if (byNode.size === 0) {
      return [];
    }

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

/**
 * node_ids of the files that actually define a target-based trigger for each `${source}#${sourceId}`
 * target. Unlike the entity index (which lists every file *defining* a workflow/pipeline), this only
 * counts files whose `triggers` block yields at least one push/pull_request/tag trigger — so the
 * merged view's jump-to-definition can point at the modules that really carry a trigger, not every
 * module that happens to define the target. Empty in single-file mode. Only the merged view renders
 * the jump, so callers pass `enabled = isMergedView` to skip the per-file scan everywhere else.
 */
function useTriggerDefiningNodeIds(enabled = true): Map<string, string[]> {
  return useBitriseYmlStore((s) => {
    const result = new Map<string, string[]>();
    if (!enabled || !s.tree) {
      return result;
    }
    const sources: TriggerSource[] = ['workflows', 'pipelines'];
    Object.values(s.files).forEach((slice) => {
      const yml = slice.ymlDocument.toJSON() as Partial<
        Record<TriggerSource, Record<string, { triggers?: TriggersModel }>>
      > | null;
      sources.forEach((source) => {
        Object.entries(yml?.[source] ?? {}).forEach(([sourceId, target]) => {
          const items = TriggerService.toTargetBasedTriggers(source, sourceId, target?.triggers);
          if (items.push.length || items.pull_request.length || items.tag.length) {
            const key = `${source}#${sourceId}`;
            const nodeIds = result.get(key);
            if (nodeIds) {
              nodeIds.push(slice.nodeId);
            } else {
              result.set(key, [slice.nodeId]);
            }
          }
        });
      });
    });
    return result;
  });
}

export { useAllTargetBasedTriggers, useTriggerDefiningNodeIds, useTriggersGroupedByFile };
export default useTargetBasedTriggers;
