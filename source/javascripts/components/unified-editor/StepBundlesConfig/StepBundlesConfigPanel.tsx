import { Box } from '@bitrise/bitkit';
import useSelectedStepBundle from '@/hooks/useSelectedStepBundle';
import { useStepBundlesPageStore } from '@/pages/StepBundlesPage/StepBundlesPage.store';
import StepBundlePropertiesTab from './StepBundlePropertiesTab';
import StepBundlesConfigHeader from './StepBundlesConfigHeader';
import StepBundlesConfigProvider from './StepBundlesConfig.context';

type Props = {
  id: string;
};

const StepBundlesConfigPanelContent = () => {
  const { closeDialog } = useStepBundlesPageStore();
  const [, setSelectedStepBundle] = useSelectedStepBundle();

  return (
    <Box padding="24" borderLeft="1px solid" borderColor="border/regular">
      <Box as="header" marginBlockEnd="24">
        <StepBundlesConfigHeader />
      </Box>
      <StepBundlePropertiesTab onDelete={() => closeDialog()} onRename={setSelectedStepBundle} />
    </Box>
  );
};

const StepBundlesConfigPanel = ({ id }: Props) => {
  return (
    <StepBundlesConfigProvider id={id} stepIndex={-1}>
      <StepBundlesConfigPanelContent />
    </StepBundlesConfigProvider>
  );
};

export default StepBundlesConfigPanel;
