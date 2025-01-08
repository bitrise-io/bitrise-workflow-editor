import { Box } from '@bitrise/bitkit';
import StepBundlePropertiesTab from '@/components/unified-editor/StepBundleDrawer/StepBundlePropertiesTab';
import { useStepBundlesPageStore } from '../../StepBundlesPage.store';
import StepBundlesConfigProvider from './StepBundlesConfig.context';
import StepBundlesConfigHeader from './StepBundlesConfigHeader';

type ConfigPanelContentProps = {
  stepBundleId: string;
};

const StepBundlesConfigPanelContent = ({ stepBundleId }: ConfigPanelContentProps) => {
  const { closeDialog, setStepBundleId } = useStepBundlesPageStore();

  const handleOnDelete = () => {
    setStepBundleId('');
    closeDialog();
  };

  return (
    <Box borderLeft="1px solid" borderColor="border/regular">
      <StepBundlesConfigHeader parentStepBundleId={stepBundleId} />
      <Box padding="16px 24px">
        <StepBundlePropertiesTab stepBundleId={stepBundleId} onDelete={handleOnDelete} onRename={setStepBundleId} />
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
