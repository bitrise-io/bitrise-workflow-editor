import '@xyflow/react/dist/style.css';

import { useMemo } from 'react';
import { Box } from '@bitrise/bitkit';

import PageProps from '@/core/utils/PageProps';
import GlobalProps from '@/core/utils/GlobalProps';

import Drawers from './components/Drawers/Drawers';
import usePipelineSelector from './hooks/usePipelineSelector';
import PipelineCanvas from './components/PipelineCanvas/PipelineCanvas';
import UpgradePlanEmptyState from './components/EmptyStates/UpgradePlanEmptyState';
import { PipelinesPageDialogType, usePipelinesPageStore } from './PipelinesPage.store';
import ReactivatePlanEmptyState from './components/EmptyStates/ReactivatePlanEmptyState';
import CreateFirstGraphPipelineEmptyState from './components/EmptyStates/CreateFirstGraphPipelineEmptyState';

const PipelinesPage = () => {
  const { keys } = usePipelineSelector();
  const openDialog = usePipelinesPageStore((s) => s.openDialog);

  const hasPipelines = keys.length > 0;
  const canAccessPipelines = PageProps.limits()?.isPipelinesAvailable;

  const upgradePlan = () => {
    window.location.assign(`/workspaces/${GlobalProps.workspaceSlug()}/credit_subscription/plan_selector_page`);
  };

  const content = useMemo(() => {
    if (canAccessPipelines === false) {
      if (hasPipelines) {
        return <ReactivatePlanEmptyState onReactivate={canAccessPipelines === false ? upgradePlan : undefined} />;
      }

      return <UpgradePlanEmptyState onUpgrade={canAccessPipelines === false ? upgradePlan : undefined} />;
    }

    if (hasPipelines) {
      return <PipelineCanvas />;
    }

    return (
      <CreateFirstGraphPipelineEmptyState onCreate={openDialog({ type: PipelinesPageDialogType.CREATE_PIPELINE })} />
    );
  }, [canAccessPipelines, hasPipelines, openDialog]);

  return (
    <Box display="flex" flexDir="column" h="100%">
      {content}
      <Drawers />
    </Box>
  );
};

export default PipelinesPage;
