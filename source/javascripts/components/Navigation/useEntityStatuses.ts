import { useMemo } from 'react';

import EntityIndexService from '@/core/services/EntityIndexService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import EntityStatus from './entityStatus';

export type EntityRowStatus = {
  // Plain-words summary of the active trigger types, e.g. "Starts on push and tag".
  triggers?: string;
  problem?: string;
};

// Statuses for the CI blocks rows, from the config: active triggers and broken references.
const useEntityStatuses = () => {
  const yml = useBitriseYmlStore((s) => s.yml);
  const entityIndex = useBitriseYmlStore((s) => s.entityIndex);

  return useMemo(() => {
    // Defined here or, in a modular config, in any other file.
    const isDefined = (kind: 'workflows' | 'stepBundles', id: string) =>
      Boolean((kind === 'workflows' ? yml.workflows : yml.step_bundles)?.[id]) ||
      EntityIndexService.definitionsOf(entityIndex, kind, id).length > 0;
    const triggers = EntityStatus.activeTriggerTypes(yml.pipelines ?? {}, yml.workflows ?? {}, yml.trigger_map);

    return {
      pipeline: (id: string): EntityRowStatus => ({
        triggers: EntityStatus.triggerSummary(triggers[`pipelines#${id}`]),
        problem: EntityStatus.pipelineProblem(yml.pipelines?.[id], isDefined),
      }),
      workflow: (id: string): EntityRowStatus => ({
        triggers: EntityStatus.triggerSummary(triggers[`workflows#${id}`]),
        problem: EntityStatus.workflowProblem(yml.workflows?.[id], isDefined),
      }),
      stepBundle: (id: string): EntityRowStatus => ({
        problem: EntityStatus.stepBundleProblem(yml.step_bundles?.[id], isDefined),
      }),
    };
  }, [yml, entityIndex]);
};

export default useEntityStatuses;
