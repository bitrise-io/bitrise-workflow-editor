import { useEffect, useRef } from 'react';

import { BitriseYml } from '@/core/models/BitriseYml';
import { getBitriseYml } from '@/core/stores/BitriseYmlStore';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

/** Entity references a page dialog (or step selection) depends on, to be re-validated on file switch. */
export type FileSwitchDialogRefs = {
  workflowIds?: (string | undefined)[];
  pipelineIds?: (string | undefined)[];
  stepBundleIds?: (string | undefined)[];
  /** Step indices that must resolve within the container's `steps` list. */
  steps?: {
    source: 'workflows' | 'step_bundles';
    sourceId: string;
    indices: number[];
  };
};

function allExist(entities: Record<string, unknown> | undefined, ids: (string | undefined)[] = []) {
  return ids.every((id) => !id || Boolean(entities?.[id]));
}

/** True when every referenced entity (and step index) resolves in the given yml. Empty ids are skipped. */
export function dialogRefsResolve(yml: BitriseYml, refs: FileSwitchDialogRefs): boolean {
  if (!allExist(yml.workflows, refs.workflowIds)) {
    return false;
  }
  if (!allExist(yml.pipelines, refs.pipelineIds)) {
    return false;
  }
  if (!allExist(yml.step_bundles, refs.stepBundleIds)) {
    return false;
  }

  if (refs.steps && refs.steps.indices.length > 0) {
    const { source, sourceId, indices } = refs.steps;
    const container = source === 'step_bundles' ? yml.step_bundles?.[sourceId] : yml.workflows?.[sourceId];
    if (!container) {
      return false;
    }
    const stepCount = container.steps?.length ?? 0;
    return indices.every((index) => index >= 0 && index < stepCount);
  }

  return true;
}

/**
 * In modular YAML mode, switching the active file tab rebinds the document under any
 * open dialog. Dialogs whose referenced entities still exist in the new file stay open
 * (their content re-reads from the store); dialogs pointing at entities that don't
 * resolve anymore are stale — `onStale` is called so the page can close them and clear
 * the step selection. `getRefs` returns `null` when there's nothing to validate.
 */
const useCloseDialogsOnFileSwitch = (getRefs: () => FileSwitchDialogRefs | null, onStale: () => void) => {
  const activeFileId = useBitriseYmlStore((s) => s.selectedNodeId);
  const previousFileId = useRef(activeFileId);

  useEffect(() => {
    if (previousFileId.current === activeFileId) {
      return;
    }
    previousFileId.current = activeFileId;

    const refs = getRefs();
    if (refs && !dialogRefsResolve(getBitriseYml(), refs)) {
      onStale();
    }
  });
};

export default useCloseDialogsOnFileSwitch;
