import { Box, Button, EmptyState } from '@bitrise/bitkit';
import { useEffect } from 'react';

import StepBundleConfigPanel from '@/components/unified-editor/StepBundleConfig/StepBundleConfigPanel';
import useSelectedStepBundle from '@/hooks/useSelectedStepBundle';
import { useStepBundles } from '@/hooks/useStepBundles';

import Drawers from './components/Drawers';
import StepBundlesCanvasPanel from './components/StepBundlesCanvasPanel';
import { StepBundlesPageDialogType, useStepBundlesPageStore } from './StepBundlesPage.store';

const StepBundlesPage = () => {
  const stepBundlesIds = useStepBundles((s) => Object.keys(s));
  const { openDialog } = useStepBundlesPageStore();
  const { closeDialog } = useStepBundlesPageStore();
  const [stepBundleId] = useSelectedStepBundle();
  const hasStepBundles = stepBundlesIds.length > 0;

  useEffect(() => {
    closeDialog();
  }, [stepBundleId, closeDialog]);

  const content = hasStepBundles ? (
    <Box h="100%" display="grid" gridTemplateColumns="1fr minmax(0px, 1024px)" gridTemplateRows="100%">
      <StepBundlesCanvasPanel stepBundleId={stepBundleId} />
      <StepBundleConfigPanel stepBundleId={stepBundleId} />
    </Box>
  ) : (
    <EmptyState
      iconName="Steps"
      title="Your Step bundles will appear here"
      description="With Step bundles, you can create reusable chunks of configuration. You can also create Step bundles in your Workflows."
      height="100%"
    >
      <Button
        size="md"
        leftIconName="Plus"
        onClick={openDialog({
          type: StepBundlesPageDialogType.CREATE_STEP_BUNDLE,
        })}
      >
        Create Step bundle
      </Button>
    </EmptyState>
  );
  return (
    <>
      {content}
      <Drawers />
    </>
  );
};

export default StepBundlesPage;
