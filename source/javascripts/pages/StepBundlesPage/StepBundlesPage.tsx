import { BitkitButton, BitkitEmptyState, IconPlus, IconStep } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { useEffect } from 'react';

import { useIsFirstRunTourActive } from '@/components/FirstRunTour/FirstRunTour';
import { useIsBehindToolPanel } from '@/components/Navigation/ToolPanel';
import useCloseDialogsOnFileSwitch, { FileSwitchDialogRefs } from '@/hooks/useCloseDialogsOnFileSwitch';
import useSelectedStepBundle from '@/hooks/useSelectedStepBundle';
import { useStepBundles } from '@/hooks/useStepBundles';
import { useIsReadOnlyView } from '@/hooks/useTree';

import Drawers from './components/Drawers';
import StepBundlesCanvasPanel from './components/StepBundlesCanvasPanel';
import { StepBundlesPageDialogType, useStepBundlesPageStore } from './StepBundlesPage.store';

function fileSwitchDialogRefs(): FileSwitchDialogRefs | null {
  const { openedDialogType, stepBundleId, selectedStepIndices } = useStepBundlesPageStore.getState();

  if (openedDialogType === StepBundlesPageDialogType.NONE) {
    return null;
  }

  // Both the step-config and the nested-step-bundle drawer render at selectedStepIndices[0],
  // so a file switch must drop either if that step index no longer resolves in the new file.
  const usesStepIndex =
    openedDialogType === StepBundlesPageDialogType.STEP_CONFIG ||
    openedDialogType === StepBundlesPageDialogType.STEP_BUNDLE;

  return {
    stepBundleIds: [stepBundleId],
    steps:
      usesStepIndex && stepBundleId
        ? { source: 'step_bundles', sourceId: stepBundleId, indices: selectedStepIndices }
        : undefined,
  };
}

const StepBundlesPage = () => {
  const isReadOnlyView = useIsReadOnlyView();
  const stepBundlesIds = useStepBundles((s) => Object.keys(s));
  const { openDialog } = useStepBundlesPageStore();
  const { closeDialog } = useStepBundlesPageStore();
  const [stepBundleId] = useSelectedStepBundle();
  const hasStepBundles = stepBundlesIds.length > 0;

  // The bundle's settings live in a drawer now, so opening a Step bundle opens it.
  // Behind a tool panel the page stays on screen without its drawer; it opens once the panel closes. The same
  // goes while the first-run tour runs or is about to: the drawer opens when it ends.
  const isBehindToolPanel = useIsBehindToolPanel();
  const isTourActive = useIsFirstRunTourActive();
  useEffect(() => {
    if (isBehindToolPanel || isTourActive) {
      return;
    }
    if (stepBundleId) {
      // A Step selected in the previous bundle doesn't carry over (Backspace would delete it out of sight).
      openDialog({ type: StepBundlesPageDialogType.STEP_BUNDLE_DEFINITION, stepBundleId, selectedStepIndices: [] })();
    } else {
      closeDialog();
    }
  }, [stepBundleId, openDialog, closeDialog, isBehindToolPanel, isTourActive]);

  useCloseDialogsOnFileSwitch(fileSwitchDialogRefs, () => {
    const { closeDialog: close, setSelectedStepIndices } = useStepBundlesPageStore.getState();
    close();
    setSelectedStepIndices();
  });

  const content = hasStepBundles ? (
    <Box height="100%" display="grid" gridTemplateRows="100%">
      <StepBundlesCanvasPanel stepBundleId={stepBundleId} />
    </Box>
  ) : (
    <BitkitEmptyState
      data-clarity-unmask="true"
      icon={IconStep}
      headingText="Your Step bundles will appear here"
      bodyText="With Step bundles, you can create reusable chunks of configuration. You can also create Step bundles in your Workflows."
      height="100%"
    >
      {/* Read-only views (merged config, cross-repo/ref files) can't create — show no action. */}
      {!isReadOnlyView && (
        <BitkitButton
          size="md"
          icon={IconPlus}
          onClick={openDialog({
            type: StepBundlesPageDialogType.CREATE_STEP_BUNDLE,
          })}
        >
          Create Step bundle
        </BitkitButton>
      )}
    </BitkitEmptyState>
  );
  return (
    <>
      {content}
      <Drawers />
    </>
  );
};

export default StepBundlesPage;
