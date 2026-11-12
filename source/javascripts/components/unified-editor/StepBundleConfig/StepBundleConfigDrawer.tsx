import { BitkitTabs } from '@bitrise/bitkit-v2';

import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerProps,
} from '../FloatingDrawer/FloatingDrawer';
import StepBundleConfigContent from './StepBundleConfigContent';
import StepBundleConfigHeader from './StepBundleConfigHeader';
import StepBundleConfigProvider from './StepBundleConfigProvider';
import { StepBundleConfigTab } from './types/StepBundle.types';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  stepBundleId?: string;
  parentWorkflowId?: string;
  parentStepBundleId?: string;
  stepIndex: number;
};

const StepBundleConfigDrawer = ({ stepBundleId, stepIndex, parentWorkflowId, parentStepBundleId, ...rest }: Props) => {
  return (
    <StepBundleConfigProvider
      stepBundleId={stepBundleId}
      parentWorkflowId={parentWorkflowId}
      parentStepBundleId={parentStepBundleId}
      stepIndex={stepIndex}
    >
      <BitkitTabs.Root defaultValue={StepBundleConfigTab.CONFIGURATION}>
        <FloatingDrawer {...rest}>
          <FloatingDrawerContent>
            <FloatingDrawerCloseButton />
            <FloatingDrawerHeader>
              <StepBundleConfigHeader variant="drawer" />
            </FloatingDrawerHeader>
            <FloatingDrawerBody>
              <StepBundleConfigContent variant="drawer" />
            </FloatingDrawerBody>
          </FloatingDrawerContent>
        </FloatingDrawer>
      </BitkitTabs.Root>
    </StepBundleConfigProvider>
  );
};

export default StepBundleConfigDrawer;
