import { Box } from '@bitrise/bitkit';
import StepBundlePropertiesTab from '@/components/unified-editor/StepBundleConfigDrawer/StepBundlePropertiesTab';
import useSelectedStepBundle from '@/hooks/useSelectedStepBundle';
import { useStepBundles } from '@/hooks/useStepBundles';
import { useStepBundlesPageStore } from '../../StepBundlesPage.store';
import StepBundlesConfigProvider from './StepBundlesConfig.context';
import StepBundlesConfigHeader from './StepBundlesConfigHeader';

type ConfigPanelContentProps = {
  stepBundleId: string;
};

const StepBundlesConfigPanelContent = ({ stepBundleId }: ConfigPanelContentProps) => {
  const { closeDialog } = useStepBundlesPageStore();
  const [, setSelectedStepBundle] = useSelectedStepBundle();
  const stepBundles = useStepBundles();

  const handleOnDelete = (deletedId: string) => {
    setSelectedStepBundle(Object.keys(stepBundles).find((bundleId) => bundleId !== deletedId));
    closeDialog();
  };

  return (
    <Box borderLeft="1px solid" borderColor="border/regular">
      <StepBundlesConfigHeader parentStepBundleId={stepBundleId} />
      <Box padding="16px 24px">
        <StepBundlePropertiesTab
          stepBundleId={stepBundleId}
          onDelete={handleOnDelete}
          onRename={setSelectedStepBundle}
        />
      </Box>
    </Box>
  );
};

type Props = {
  stepBundleId: string;
};

const StepBundlesConfigPanel = ({ stepBundleId }: Props) => {
  return (
    <StepBundlesConfigProvider stepBundleId={stepBundleId}>
      <StepBundlesConfigPanelContent stepBundleId={stepBundleId} />
    </StepBundlesConfigProvider>
  );
};

export default StepBundlesConfigPanel;
