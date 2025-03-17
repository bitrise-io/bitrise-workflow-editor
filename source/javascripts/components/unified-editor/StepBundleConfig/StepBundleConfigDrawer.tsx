import { Tabs } from '@bitrise/bitkit';
import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerProps,
} from '../FloatingDrawer/FloatingDrawer';
import StepBundleConfigHeader from './StepBundleConfigHeader';
import StepBundleConfigProvider from './StepBundleConfig.context';
import StepBundleConfigContent from './StepBundleConfigContent';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  onRename?: (name: string) => void;
  stepBundleId?: string;
  stepIndex: number;
  workflowId?: string;
};

const StepBundleConfigDrawer = ({ onRename, stepBundleId, stepIndex, workflowId, ...rest }: Props) => {
  return (
    <StepBundleConfigProvider parentStepBundleId={stepBundleId} stepIndex={stepIndex} parentWorkflowId={workflowId}>
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
