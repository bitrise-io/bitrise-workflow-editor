import { useEffect } from 'react';

import { useCiConfigExpertStore } from '@/core/stores/CiConfigExpertStore';
import WindowUtils from '@/core/utils/WindowUtils';
import { PipelinesPageDialogType, usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';
import { useWorkflowsPageStore, WorkflowsPageDialogType } from '@/pages/WorkflowsPage/WorkflowsPage.store';

function closeAIDrawer() {
  if (useCiConfigExpertStore.getState().isAIDrawerOpen) {
    WindowUtils.postMessageToParent('CLOSE_CI_CONFIG_EXPERT');
  }
}

function useCloseAIDrawer() {
  useEffect(() => {
    const unsubscribeWorkflows = useWorkflowsPageStore.subscribe((state) => {
      if (state.openedDialogType !== WorkflowsPageDialogType.NONE) {
        closeAIDrawer();
      }
    });

    const unsubscribePipelines = usePipelinesPageStore.subscribe((state) => {
      if (state.openedDialogType !== PipelinesPageDialogType.NONE) {
        closeAIDrawer();
      }
    });

    return () => {
      unsubscribeWorkflows();
      unsubscribePipelines();
    };
  }, []);
}

export default useCloseAIDrawer;
