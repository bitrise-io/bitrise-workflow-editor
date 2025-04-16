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
  onRename?: (name: string) => void;
  parentStepBundleId?: string;
  stepIndex: number;
  parentWorkflowId?: string;
};

const StepBundleConfigDrawer = ({ onRename, parentStepBundleId, stepIndex, parentWorkflowId, ...rest }: Props) => {
  return (
    <StepBundleConfigProvider
      parentStepBundleId={parentStepBundleId}
      stepIndex={stepIndex}
      parentWorkflowId={parentWorkflowId}
    >
      <Tabs>
        <FloatingDrawer {...rest}>
          <FloatingDrawerContent>
            <FloatingDrawerCloseButton />
            <FloatingDrawerHeader>
              <StepBundleConfigHeader variant="drawer" />
            </FloatingDrawerHeader>
            <FloatingDrawerBody>
              <StepBundleConfigContent onRename={onRename} />
            </FloatingDrawerBody>
          </FloatingDrawerContent>
        </FloatingDrawer>
      </Tabs>
    </StepBundleConfigProvider>
  );
};

export default StepBundleConfigDrawer;
