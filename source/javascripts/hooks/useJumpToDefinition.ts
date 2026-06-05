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
};

const KIND_PARAM: Record<EntityKind, string> = {
  workflows: 'workflow_id',
  pipelines: 'pipeline',
  stepBundles: 'step_bundle_id',
};

/**
 * Jump to where a cross-file entity is defined: activate the defining file's tab
 * (which rebinds the whole WFE to that file), then navigate to the entity's page
 * with it selected. Used by the wf/pl/sb cross-file drawer headers. No-ops if the
 * entity isn't in the index.
 *
 * `targetNodeId` selects a specific defining layer; when omitted it defaults to
 * the **top-most** (highest-precedence) definition. An entity can be defined in
 * several layers — the `JumpToDefinitionLink` chooser passes the layer the user
 * picked; everyone else jumps to the top-most.
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

      // Remember the page the current tab is on before switching away, so
      // returning to it restores that page rather than this jump's target page.
      recordActiveTabLocation(window.parent.location.hash);

      openTab(nodeId, { preview: false });

      const params: Record<string, string> = { [KIND_PARAM[kind]]: id };
      if (searchParams.branch) {
        params.branch = searchParams.branch;
      }
      replace(KIND_PATH[kind], params);
    },
    [entityIndex, replace, searchParams.branch],
  );
}
