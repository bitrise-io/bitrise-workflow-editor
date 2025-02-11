import { Box } from '@bitrise/bitkit';
import useSelectedStepBundle from '@/hooks/useSelectedStepBundle';
import { useStepBundles } from '@/hooks/useStepBundles';
import { useStepBundlesPageStore } from '../../../pages/StepBundlesPage/StepBundlesPage.store';
import StepBundlePropertiesTab from './StepBundlePropertiesTab';
import StepBundlesConfigHeader from './StepBundlesConfigHeader';
import StepBundlesConfigProvider from './StepBundlesConfig.context';

type Props = {
  id: string;
};

const StepBundlesConfigPanelContent = ({ id }: Props) => {
  const { closeDialog } = useStepBundlesPageStore();
  const [, setSelectedStepBundle] = useSelectedStepBundle();
  const stepBundles = useStepBundles();

  const handleOnDelete = (deletedId: string) => {
    setSelectedStepBundle(Object.keys(stepBundles).find((bundleId) => bundleId !== deletedId));
    closeDialog();
  };

  return (
    <Box borderLeft="1px solid" borderColor="border/regular">
      <StepBundlesConfigHeader id={id} />
      <Box padding="16px 24px">
        <StepBundlePropertiesTab onDelete={handleOnDelete} onRename={setSelectedStepBundle} />
      </Box>
    </Box>
  );
};

const StepBundlesConfigPanel = ({ id }: Props) => {
  return (
    <StepBundlesConfigProvider id={id} stepIndex={-1}>
      <StepBundlesConfigPanelContent id={id} />
    </StepBundlesConfigProvider>
  );
};

export default StepBundlesConfigPanel;
