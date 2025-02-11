import { Box, Button, EmptyState } from '@bitrise/bitkit';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import { BitriseYml } from '@/core/models/BitriseYml';
import { useStepBundles } from '@/hooks/useStepBundles';
import useSelectedStepBundle from '@/hooks/useSelectedStepBundle';
import StepBundlesConfigPanel from '../../components/unified-editor/StepBundlesConfig/StepBundlesConfigPanel';
import StepBundlesCanvasPanel from './components/StepBundlesCanvasPanel';
import { StepBundlesPageDialogType, useStepBundlesPageStore } from './StepBundlesPage.store';
import Drawers from './components/Drawers';

const StepBundlesPageContent = () => {
  const stepBundles = useStepBundles();
  const stepBundlesIds = Object.keys(stepBundles);
  const { openDialog } = useStepBundlesPageStore();
  const [{ id: selectedStepBundleId }] = useSelectedStepBundle();
  const hasStepBundles = stepBundlesIds.length > 0;

  const content = hasStepBundles ? (
    <Box h="100%" display="grid" gridTemplateColumns="1fr minmax(0px, 1024px)" gridTemplateRows="100%">
      <StepBundlesCanvasPanel selectedStepBundleId={selectedStepBundleId} />
      <StepBundlesConfigPanel id={selectedStepBundleId} />
    </Box>
  ) : (
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
  return (
    <>
      {content}
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
