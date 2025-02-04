import { Box } from '@bitrise/bitkit';
import useSelectedStepBundle from '@/hooks/useSelectedStepBundle';
import { useStepBundles } from '@/hooks/useStepBundles';
import { useStepBundlesPageStore } from '../../../pages/StepBundlesPage/StepBundlesPage.store';
import StepBundlePropertiesTab from './StepBundlePropertiesTab';
import StepBundlesConfigHeader from './StepBundlesConfigHeader';
import StepBundlesConfigProvider from './StepBundlesConfig.context';

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
        <StepBundlePropertiesTab onDelete={handleOnDelete} onRename={setSelectedStepBundle} />
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
