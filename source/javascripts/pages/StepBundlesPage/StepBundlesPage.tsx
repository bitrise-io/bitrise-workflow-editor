import { useEffect } from 'react';
import { Box } from '@bitrise/bitkit';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import { BitriseYml } from '@/core/models/BitriseYml';
import { useStepBundles } from '@/hooks/useStepBundles';
import StepBundlesCanvasPanel from './components/StepBundlesCanvasPanel';
import { StepBundlesPageDialogType, useStepBundlesPageStore } from './StepBundlesPage.store';
import StepBundleEmptyState from './components/StepBundleEmptyState';
import Drawers from './components/Drawers';
import StepBundlesConfigPanel from './components/StepBundlesConfigPanel/StepBundlesConfigPanel';

const StepBundlesPageContent = () => {
  const stepBundles = useStepBundles();
  const stepBundlesIds = Object.keys(stepBundles);
  const { closeDialog, openDialog, stepBundleId } = useStepBundlesPageStore((s) => ({
    ...s,
    stepBundleId: s.stepBundleId || stepBundlesIds[0],
  }));
  const hasStepBundles = stepBundlesIds.length > 0;

  useEffect(() => {
    closeDialog();
  }, [hasStepBundles, closeDialog]);

  if (!hasStepBundles) {
    return (
      <Box h="100%" display="grid" gridTemplateRows="100%">
        <StepBundleEmptyState
          onCreateStepBundle={openDialog({
            type: StepBundlesPageDialogType.CREATE_STEP_BUNDLE,
          })}
        />
      </Box>
    );
  }

  return (
    <Box h="100%" display="grid" gridTemplateColumns="1fr minmax(0px, 1024px)" gridTemplateRows="100%">
      <StepBundlesCanvasPanel stepBundleId={stepBundleId} />
      <StepBundlesConfigPanel stepBundleId={stepBundleId} />
    </Box>
  );
};

type StepBundlesPageProps = {
  yml: BitriseYml;
  onChange: (yml: BitriseYml) => void;
};

const StepBundlesPage = (props: StepBundlesPageProps) => {
  const { yml, onChange } = props;
  return (
    <BitriseYmlProvider yml={yml} onChange={onChange}>
      <StepBundlesPageContent />
      <Drawers />
    </BitriseYmlProvider>
  );
};

export default StepBundlesPage;
