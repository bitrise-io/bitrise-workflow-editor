import '@xyflow/react/dist/style.css';
import { useMemo } from 'react';
import { Box } from '@bitrise/bitkit';
import { ReactFlowProvider } from '@xyflow/react';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import { BitriseYml } from '@/core/models/BitriseYml';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import WindowUtils from '@/core/utils/WindowUtils';

import Drawers from './components/Drawers/Drawers';
import usePipelineSelector from './hooks/usePipelineSelector';
import PipelineCanvas from './components/PipelineCanvas/PipelineCanvas';
import { PipelinesPageDialogType, usePipelinesPageStore } from './PipelinesPage.store';
import UpgradePlanEmptyState from './components/EmptyStates/UpgradePlanEmptyState';
import StagePipelineEmptyState from './components/EmptyStates/StagePipelineEmptyState';
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
  const isGraphPipelinesEnabled = useFeatureFlag('enable-dag-pipelines');

  const hasPipelines = keys.length > 0;
  const canAccessPipelines = WindowUtils.limits()?.isPipelinesAvailable;

  const upgradePlan = () => {
    window.location.assign(`/workspaces/${WindowUtils.workspaceSlug()}/credit_subscription/plan_selector_page`);
  };

  const variant = useMemo(() => {
    if (canAccessPipelines === false) {
      return hasPipelines ? 'reactivate-your-pipelines' : 'upgrade-to-access-pipelines';
    }

    if (hasPipelines) {
      return 'pipeline-canvas';
    }

    return isGraphPipelinesEnabled ? 'create-first-graph-pipeline' : 'create-first-staged-pipeline';
  }, [canAccessPipelines, hasPipelines, isGraphPipelinesEnabled]);

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
    case 'create-first-staged-pipeline':
      return <StagePipelineEmptyState />;
  }
};

export default PipelinesPage;
