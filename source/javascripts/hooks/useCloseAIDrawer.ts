import { useEffect } from 'react';

import WindowUtils from '@/core/utils/WindowUtils';
import { PipelinesPageDialogType, usePipelinesPageStore } from '@/pages/PipelinesPage/PipelinesPage.store';
import { useWorkflowsPageStore, WorkflowsPageDialogType } from '@/pages/WorkflowsPage/WorkflowsPage.store';

import { getAIDrawerOpen } from '../core/utils/AIDrawer';

function closeAIDrawer() {
  if (getAIDrawerOpen()) {
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
