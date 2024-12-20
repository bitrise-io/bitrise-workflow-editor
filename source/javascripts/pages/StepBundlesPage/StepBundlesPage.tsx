import { useEffect } from 'react';
import { Box } from '@bitrise/bitkit';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import { BitriseYml } from '@/core/models/BitriseYml';
import { useStepBundles } from '@/hooks/useStepBundles';
import StepBundlesCanvasPanel from './components/StepBundlesCanvasPanel';
import { StepBundlesPageDialogType, useStepBundlesPageStore } from './StepBundlesPage.store';
import StepBundleEmptyState from './components/StepBundleEmptyState/StepBundleEmptyState';
import Drawers from './components/Drawers/Drawers';

const StepBundlesPageContent = () => {
  const openDialog = useStepBundlesPageStore((s) => s.openDialog);
  const closeDialog = useStepBundlesPageStore((s) => s.closeDialog);
  const stepBundles = useStepBundles();
  const hasStepBundles = Object.keys(stepBundles).length > 0;

  useEffect(() => {
    closeDialog();
  }, [hasStepBundles, closeDialog]);

  if (!hasStepBundles) {
    return (
      <StepBundleEmptyState
        onCreateStepBundle={openDialog({
          type: StepBundlesPageDialogType.CREATE_STEP_BUNDLE,
        })}
      />
    );
  }

  return (
    <Box h="100%" display="grid" gridTemplateColumns="1fr minmax(0px, 1024px)" gridTemplateRows="100%">
      <StepBundlesCanvasPanel />
    </Box>
  );
};

type StepBundlesPageProps = {
  yml: BitriseYml;
};

const StepBundlesPage = (props: StepBundlesPageProps) => {
  const { yml } = props;
  return (
    <BitriseYmlProvider yml={yml}>
      <StepBundlesPageContent />
      <Drawers />
    </BitriseYmlProvider>
  );
};

export default StepBundlesPage;
