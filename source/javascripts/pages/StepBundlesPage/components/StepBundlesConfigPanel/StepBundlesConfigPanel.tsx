import { Box } from '@bitrise/bitkit';
import useSelectedStepBundle from '@/pages/StepBundlesPage/hooks/useSelectedStepBundle';
import { useStepBundles } from '@/hooks/useStepBundles';
import { useStepBundlesPageStore } from '@/pages/StepBundlesPage/StepBundlesPage.store';
import StepBundlesConfigProvider from '@/pages/StepBundlesPage/components/StepBundlesConfigPanel/StepBundlesConfig.context';
import StepBundlePropertiesTab from '@/components/unified-editor/StepBundleDrawer/StepBundlePropertiesTab';
import StepBundlesConfigHeader from '@/pages/StepBundlesPage/components/StepBundlesConfigPanel/StepBundlesConfigHeader';

type ConfigPanelContentProps = {
  stepBundleId: string;
};

const StepBundlesConfigPanelContent = ({ stepBundleId }: ConfigPanelContentProps) => {
  const [, setSelectedStepBundle] = useSelectedStepBundle();
  const stepBundles = useStepBundles();
  const closeDialog = useStepBundlesPageStore((s) => s.closeDialog);
  const onDelete = (deletedId: string) => {
    setSelectedStepBundle(Object.keys(stepBundles).find((bundleId) => bundleId !== deletedId));
    closeDialog();
  };

  return (
    <Box borderLeft="1px solid" borderColor="border/regular">
      <StepBundlesConfigHeader parentStepBundleId={stepBundleId} />
      <Box padding="16px 24px">
        <StepBundlePropertiesTab stepBundleId={stepBundleId} onDelete={onDelete} />
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
