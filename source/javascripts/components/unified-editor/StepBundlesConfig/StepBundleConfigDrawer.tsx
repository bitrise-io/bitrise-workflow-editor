import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerProps,
} from '../FloatingDrawer/FloatingDrawer';
import StepBundlePropertiesTab from './StepBundlePropertiesTab';
import StepBundlesConfigProvider from './StepBundlesConfig.context';
import StepBundlesConfigHeader from './StepBundlesConfigHeader';

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
    <FloatingDrawer {...props}>
      <FloatingDrawerContent>
        <FloatingDrawerCloseButton />
        <FloatingDrawerHeader>
          <StepBundlesConfigHeader />
        </FloatingDrawerHeader>
        <FloatingDrawerBody>
          <StepBundlePropertiesTab onRename={onRename} />
        </FloatingDrawerBody>
      </FloatingDrawerContent>
    </FloatingDrawer>
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
