import { useCallback } from 'react';

import { EntityKind } from '@/core/models/Tree';
import EntityIndexService from '@/core/services/EntityIndexService';
import { openTab, recordActiveTabLocation } from '@/core/stores/BitriseYmlStore';
import { useEntityIndex } from '@/hooks/useEntityIndex';
import useNavigation from '@/hooks/useNavigation';
import useSearchParams from '@/hooks/useSearchParams';
import { paths } from '@/routes';

const KIND_PATH: Record<EntityKind, string> = {
  workflows: paths.workflows,
  pipelines: paths.pipelines,
  stepBundles: paths.stepBundles,
  containers: paths.containers,
  appEnvs: paths.envVars,
};

// Per-entity deep-link param. Container/appEnvs pages have no per-entity route param — opening the
// defining file's tab (below) lands the user on the right page, so they have no entry here.
const KIND_PARAM: Partial<Record<EntityKind, string>> = {
  workflows: 'workflow_id',
  pipelines: 'pipeline',
  stepBundles: 'step_bundle_id',
};

/**
 * Jump to where a cross-file entity is defined: activate the defining file's tab,
 * then navigate to the entity's page. No-ops if the entity isn't in the index.
 * `targetNodeId` picks a specific defining layer; omitted defaults to the top-most.
 */
export default function useJumpToDefinition() {
  const entityIndex = useEntityIndex();
  const { replace } = useNavigation();
  const [searchParams] = useSearchParams();

  return useCallback(
    (kind: EntityKind, id: string, targetNodeId?: string) => {
      const nodeId = targetNodeId ?? EntityIndexService.definingNodeId(entityIndex, kind, id);
      if (!nodeId) {
        return;
      }

      // Record the current tab's page before switching away, so return restores it.
      recordActiveTabLocation(window.parent.location.hash);

      openTab(nodeId, { preview: false });

      const params: Record<string, string> = {};
      const param = KIND_PARAM[kind];
      if (param) {
        params[param] = id;
      }
      if (searchParams.branch) {
        params.branch = searchParams.branch;
      }
      replace(KIND_PATH[kind], params);
    },
    [entityIndex, replace, searchParams.branch],
  );
}
