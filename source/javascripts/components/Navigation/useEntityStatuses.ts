import { useMemo } from 'react';

import EntityIndexService from '@/core/services/EntityIndexService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import EntityStatus from './entityStatus';

export type EntityRowStatus = {
  // Plain-words summary of the active trigger types, e.g. "Starts on push and tag".
  triggers?: string;
  problem?: string;
};

// The config is only known to parse, not to have the right shape (it updates on every keystroke in the YAML
// editor), so a status that can't be worked out is left off rather than breaking the sidebar.
const safely = <T>(compute: () => T, fallback: T): T => {
  try {
    return compute();
  } catch {
    return fallback;
  }
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
    const triggers = safely(
      () => EntityStatus.activeTriggerTypes(yml.pipelines ?? {}, yml.workflows ?? {}, yml.trigger_map),
      {} as ReturnType<typeof EntityStatus.activeTriggerTypes>,
    );

    return {
      pipeline: (id: string): EntityRowStatus => ({
        triggers: EntityStatus.triggerSummary(triggers[`pipelines#${id}`]),
        problem: safely(() => EntityStatus.pipelineProblem(yml.pipelines?.[id], isDefined), undefined),
      }),
      workflow: (id: string): EntityRowStatus => ({
        triggers: EntityStatus.triggerSummary(triggers[`workflows#${id}`]),
        problem: safely(() => EntityStatus.workflowProblem(yml.workflows?.[id], isDefined), undefined),
      }),
      stepBundle: (id: string): EntityRowStatus => ({
        problem: safely(() => EntityStatus.stepBundleProblem(yml.step_bundles?.[id], isDefined), undefined),
      }),
    };
  }, [yml, entityIndex]);
};

export default useEntityStatuses;
