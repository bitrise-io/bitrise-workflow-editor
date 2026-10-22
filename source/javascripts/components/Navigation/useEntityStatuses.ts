import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import LatestRunsApi, { LatestRun, LatestRunStatus } from '@/core/api/LatestRunsApi';
import EntityIndexService from '@/core/services/EntityIndexService';
import PageProps from '@/core/utils/PageProps';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import EntityStatus from './entityStatus';

export type EntityRowStatus = {
  // Absent when run history isn't available (no endpoint yet); `never` when it is but there's no run.
  run?: { status: LatestRunStatus | 'never'; at?: string };
  // Plain-words summary of the active trigger types, e.g. "Starts on push and tag".
  triggers?: string;
  problem?: string;
};

const toRun = (run: LatestRun | undefined): EntityRowStatus['run'] => (run ? run : { status: 'never' });

// Statuses for the CI blocks rows: triggers and problems from the config, last runs from the
// (proposed) latest-runs endpoint.
const useEntityStatuses = () => {
  const appSlug = PageProps.appSlug();
  const { data: runs } = useQuery({
    queryKey: ['latest-runs', appSlug],
    queryFn: ({ signal }) => LatestRunsApi.getLatestRuns({ appSlug: appSlug ?? '', signal }),
    enabled: Boolean(appSlug) && RuntimeUtils.isWebsiteMode(),
    retry: false,
    staleTime: 60_000,
  });
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
        run: runs ? toRun(runs.pipelines[id]) : undefined,
        triggers: EntityStatus.triggerSummary(triggers[`pipelines#${id}`]),
        problem: EntityStatus.pipelineProblem(yml.pipelines?.[id], isDefined),
      }),
      workflow: (id: string): EntityRowStatus => ({
        run: runs ? toRun(runs.workflows[id]) : undefined,
        triggers: EntityStatus.triggerSummary(triggers[`workflows#${id}`]),
        problem: EntityStatus.workflowProblem(yml.workflows?.[id], isDefined),
      }),
      stepBundle: (id: string): EntityRowStatus => ({
        problem: EntityStatus.stepBundleProblem(yml.step_bundles?.[id], isDefined),
      }),
    };
  }, [runs, yml, entityIndex]);
};

export default useEntityStatuses;
