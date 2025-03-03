import { Tabs } from '@bitrise/bitkit';
import StepBundleConfigHeader from '@/components/unified-editor/StepBundlesConfig/StepBundlesConfigHeader';
import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerProps,
} from '../FloatingDrawer/FloatingDrawer';
import StepBundlesConfigProvider from './StepBundlesConfig.context';
import StepBundleConfigContent from './StepBundleConfigContent';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  onRename?: (name: string) => void;
  stepBundleId?: string;
  stepIndex: number;
  workflowId?: string;
};

const StepBundleConfigDrawerContent = ({
  onRename,
  ...props
}: Omit<Props, 'stepBundleId' | 'stepIndex' | 'workflowId'>) => {
  return (
    <Tabs>
      <FloatingDrawer {...props}>
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
  );
};

const StepBundleConfigDrawer = ({ stepBundleId, stepIndex, workflowId, ...props }: Props) => {
  return (
    <StepBundlesConfigProvider stepBundleId={stepBundleId} stepIndex={stepIndex} workflowId={workflowId}>
      <StepBundleConfigDrawerContent {...props} />
    </StepBundlesConfigProvider>
  );
};

export default StepBundleConfigDrawer;
