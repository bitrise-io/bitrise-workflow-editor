import { BitkitTabs } from '@bitrise/bitkit-v2';

import useSelectedStepBundle from '@/hooks/useSelectedStepBundle';
import { useStepBundlesPageStore } from '@/pages/StepBundlesPage/StepBundlesPage.store';

import StepBundleConfigContent from './StepBundleConfigContent';
import StepBundleConfigHeader from './StepBundleConfigHeader';
import StepBundleConfigProvider from './StepBundleConfigProvider';
import { StepBundleConfigTab } from './types/StepBundle.types';

type Props = {
  stepBundleId: string;
};

const StepBundleConfigPanel = ({ stepBundleId }: Props) => {
  const { closeDialog } = useStepBundlesPageStore();
  const [, setSelectedStepBundle] = useSelectedStepBundle();

  return (
    <StepBundleConfigProvider stepBundleId={stepBundleId} stepIndex={-1}>
      <BitkitTabs.Root
        defaultValue={StepBundleConfigTab.CONFIGURATION}
        display="flex"
        flexDirection="column"
        borderInlineStart="1px solid"
        borderColor="border/regular"
      >
        <StepBundleConfigHeader variant="panel" />
        <StepBundleConfigContent
          height="100%"
          overflow="auto"
          padding="24"
          onDelete={closeDialog}
          onChangeId={setSelectedStepBundle}
          variant="panel"
        />
      </BitkitTabs.Root>
    </StepBundleConfigProvider>
  );
};

export default StepBundleConfigPanel;
