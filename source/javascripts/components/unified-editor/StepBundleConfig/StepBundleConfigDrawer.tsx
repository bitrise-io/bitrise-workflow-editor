import { Tabs } from '@bitrise/bitkit';

import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerProps,
} from '../FloatingDrawer/FloatingDrawer';
import StepBundleConfigProvider from './StepBundleConfig.context';
import StepBundleConfigContent from './StepBundleConfigContent';
import StepBundleConfigHeader from './StepBundleConfigHeader';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  onChangeID?: (name: string) => void;
  stepBundleId?: string;
  parentWorkflowId?: string;
  parentStepBundleId?: string;
  stepIndex: number;
};

const StepBundleConfigDrawer = ({
  onChangeID,
  stepBundleId,
  stepIndex,
  parentWorkflowId,
  parentStepBundleId,
  ...rest
}: Props) => {
  return (
    <StepBundleConfigProvider
      stepBundleId={stepBundleId}
      parentWorkflowId={parentWorkflowId}
      parentStepBundleId={parentStepBundleId}
      stepIndex={stepIndex}
    >
      <Tabs>
        <FloatingDrawer {...rest}>
          <FloatingDrawerContent>
            <FloatingDrawerCloseButton />
            <FloatingDrawerHeader>
              <StepBundleConfigHeader variant="drawer" />
            </FloatingDrawerHeader>
            <FloatingDrawerBody>
              <StepBundleConfigContent onChangeID={onChangeID} />
            </FloatingDrawerBody>
          </FloatingDrawerContent>
        </FloatingDrawer>
      </Tabs>
    </StepBundleConfigProvider>
  );
};

export default StepBundleConfigDrawer;
