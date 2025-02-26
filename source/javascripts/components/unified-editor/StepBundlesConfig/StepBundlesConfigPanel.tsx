import { Tabs } from '@bitrise/bitkit';
import { useStepBundlesPageStore } from '@/pages/StepBundlesPage/StepBundlesPage.store';
import useSelectedStepBundle from '@/hooks/useSelectedStepBundle';
import StepBundleConfigContent from './StepBundleConfigContent';
import StepBundleConfigHeader from './StepBundlesConfigHeader';
import StepBundlesConfigProvider from './StepBundlesConfig.context';

type Props = {
  id: string;
};

const StepBundlesConfigPanelContent = () => {
  const { closeDialog } = useStepBundlesPageStore();
  const [, setSelectedStepBundle] = useSelectedStepBundle();

  return (
    <Tabs display="flex" flexDir="column" flex={1} borderLeft="1px solid" borderColor="border/regular">
      <StepBundleConfigHeader variant="panel" />
      <StepBundleConfigContent onDelete={closeDialog} onRename={setSelectedStepBundle} p={24} flex="1" minH={0} />
    </Tabs>
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
