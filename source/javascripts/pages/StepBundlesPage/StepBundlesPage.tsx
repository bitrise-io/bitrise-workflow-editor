import { useEffect } from 'react';
import { Box, Button, EmptyState } from '@bitrise/bitkit';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import { BitriseYml } from '@/core/models/BitriseYml';
import { useStepBundles } from '@/hooks/useStepBundles';
import useSelectedStepBundle from '@/hooks/useSelectedStepBundle';
import StepBundlesCanvasPanel from './components/StepBundlesCanvasPanel';
import { StepBundlesPageDialogType, useStepBundlesPageStore } from './StepBundlesPage.store';
import Drawers from './components/Drawers';
import StepBundlesConfigPanel from './components/StepBundlesConfigPanel/StepBundlesConfigPanel';

const StepBundlesPageContent = () => {
  const stepBundles = useStepBundles();
  const stepBundlesIds = Object.keys(stepBundles);
  const { closeDialog, openDialog } = useStepBundlesPageStore();
  const [{ id: selectedStepBundleId }] = useSelectedStepBundle();
  const hasStepBundles = stepBundlesIds.length > 0;

  useEffect(() => {
    closeDialog();
  }, [hasStepBundles, closeDialog]);

  if (!hasStepBundles) {
    return (
      <EmptyState
        iconName="Steps"
        title="Your Step bundles will appear here"
        description="With Step bundles, you can create reusable chunks of configuration. You can also create Step bundles in your Workflows."
        height="100%"
      >
        <Button
          leftIconName="PlusCircle"
          onClick={openDialog({
            type: StepBundlesPageDialogType.CREATE_STEP_BUNDLE,
          })}
        >
          Create Step bundle
        </Button>
      </EmptyState>
    );
  }

  return (
    <>
      <Box h="100%" display="grid" gridTemplateColumns="1fr minmax(0px, 1024px)" gridTemplateRows="100%">
        <StepBundlesCanvasPanel stepBundleId={selectedStepBundleId} />
        <StepBundlesConfigPanel stepBundleId={selectedStepBundleId} />
      </Box>
      <Drawers stepBundleId={selectedStepBundleId} />
    </>
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
    </BitriseYmlProvider>
  );
};

export default StepBundlesPage;
