import { Tabs } from '@bitrise/bitkit';
import { useStepBundlesPageStore } from '@/pages/StepBundlesPage/StepBundlesPage.store';
import useSelectedStepBundle from '@/hooks/useSelectedStepBundle';
import StepBundleConfigContent from './StepBundleConfigContent';
import StepBundleConfigHeader from './StepBundleConfigHeader';
import StepBundleConfigProvider from './StepBundleConfig.context';

type Props = {
  stepBundleId: string;
};

const StepBundleConfigPanel = ({ stepBundleId }: Props) => {
  const { closeDialog } = useStepBundlesPageStore();
  const [, setSelectedStepBundle] = useSelectedStepBundle();

  return (
    <StepBundleConfigProvider stepBundleId={stepBundleId} stepIndex={-1}>
      <Tabs display="flex" flexDirection="column" borderLeft="1px solid" borderColor="border/regular">
        <StepBundleConfigHeader variant="panel" />
        <StepBundleConfigContent
          height="100%"
          overflow="auto"
          padding="24"
          onDelete={closeDialog}
          onRename={setSelectedStepBundle}
        />
      </Tabs>
    </StepBundleConfigProvider>
  );
};

export default StepBundleConfigPanel;
