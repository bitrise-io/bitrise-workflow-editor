import { Tabs } from '@bitrise/bitkit';
import { useStepBundlesPageStore } from '@/pages/StepBundlesPage/StepBundlesPage.store';
import StepBundleConfigContent from '@/components/unified-editor/StepBundlesConfig/StepBundleConfigContent';
import useSelectedStepBundle from '@/hooks/useSelectedStepBundle';
import StepBundleConfigHeader from './StepBundlesConfigHeader';
import StepBundlesConfigProvider from './StepBundlesConfig.context';

type Props = {
  id: string;
};

const StepBundlesConfigPanelContent = () => {
  const { closeDialog } = useStepBundlesPageStore();
  const [, setSelectedStepBundle] = useSelectedStepBundle();

  return (
    <Tabs borderLeft="1px solid" borderColor="border/regular">
      <StepBundleConfigHeader variant="panel" />
      <StepBundleConfigContent onDelete={closeDialog} onRename={setSelectedStepBundle} p={24} />
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
