import '@xyflow/react/dist/style.css';

import { useMemo } from 'react';
import { Box } from '@bitrise/bitkit';
import { ReactFlowProvider } from '@xyflow/react';

import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import { BitriseYml } from '@/core/models/BitriseYml';
import PageProps from '@/core/utils/PageProps';
import GlobalProps from '@/core/utils/GlobalProps';

import Drawers from './components/Drawers/Drawers';
import usePipelineSelector from './hooks/usePipelineSelector';
import PipelineCanvas from './components/PipelineCanvas/PipelineCanvas';
import UpgradePlanEmptyState from './components/EmptyStates/UpgradePlanEmptyState';
import { PipelinesPageDialogType, usePipelinesPageStore } from './PipelinesPage.store';
import ReactivatePlanEmptyState from './components/EmptyStates/ReactivatePlanEmptyState';
import CreateFirstGraphPipelineEmptyState from './components/EmptyStates/CreateFirstGraphPipelineEmptyState';

type Props = {
  yml: BitriseYml;
  onChange: (yml: BitriseYml) => void;
};

const PipelinesPage = ({ yml, onChange }: Props) => {
  if (!yml) {
    return null;
  }

  return (
    <BitriseYmlProvider yml={yml} onChange={onChange}>
      <ReactFlowProvider>
        <Box display="flex" flexDir="column" h="100%">
          <PipelinesPageContent />
        </Box>
        <Drawers />
      </ReactFlowProvider>
    </BitriseYmlProvider>
  );
};

const PipelinesPageContent = () => {
  const { keys } = usePipelineSelector();
  const openDialog = usePipelinesPageStore((s) => s.openDialog);

  const hasPipelines = keys.length > 0;
  const canAccessPipelines = PageProps.limits()?.isPipelinesAvailable;

  const upgradePlan = () => {
    window.location.assign(`/workspaces/${GlobalProps.workspaceSlug()}/credit_subscription/plan_selector_page`);
  };

  const variant = useMemo(() => {
    if (canAccessPipelines === false) {
      if (hasPipelines) {
        return 'reactivate-your-pipelines';
      }

      return 'upgrade-to-access-pipelines';
    }

    if (hasPipelines) {
      return 'pipeline-canvas';
    }

    return 'create-first-graph-pipeline';
  }, [canAccessPipelines, hasPipelines]);

  switch (variant) {
    case 'pipeline-canvas':
      return <PipelineCanvas />;
    case 'upgrade-to-access-pipelines':
      // https://app.bitrise.io/organization/e7062d30d6735c1c/credit_subscription/plan_selector_page
      return <UpgradePlanEmptyState onUpgrade={canAccessPipelines === false ? upgradePlan : undefined} />;
    case 'reactivate-your-pipelines':
      return <ReactivatePlanEmptyState onReactivate={canAccessPipelines === false ? upgradePlan : undefined} />;
    case 'create-first-graph-pipeline':
      return (
        <CreateFirstGraphPipelineEmptyState
          onCreate={openDialog({
            type: PipelinesPageDialogType.CREATE_PIPELINE,
          })}
        />
      );
  }
};

export default PipelinesPage;
