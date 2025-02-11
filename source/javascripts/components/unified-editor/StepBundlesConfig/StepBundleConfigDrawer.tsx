import { Text } from '@bitrise/bitkit';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import StepBundleService from '@/core/models/StepBundleService';
import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerProps,
} from '../FloatingDrawer/FloatingDrawer';
import StepBundlePropertiesTab from './StepBundlePropertiesTab';
import StepBundlesConfigProvider, { useStepBundleConfigContext } from './StepBundlesConfig.context';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  onRename: (name: string) => void;
  stepBundleId?: string;
  stepIndex: number;
  workflowId?: string;
};

const StepBundleConfigDrawerContent = ({
  onRename,
  ...props
}: Omit<Props, 'stepBundleId' | 'stepIndex' | 'workflowId'>) => {
  const { cvs, id = '', userValues } = useStepBundleConfigContext() ?? {};

  const dependants = useDependantWorkflows({ stepBundleCvs: cvs });
  const usedInWorkflowsText = StepBundleService.getUsedByText(dependants.length);

  return (
    <FloatingDrawer {...props}>
      <FloatingDrawerContent>
        <FloatingDrawerCloseButton />
        <FloatingDrawerHeader>
          <Text as="h3" textStyle="heading/h3">
            {userValues?.title || id || 'Step bundle'}
          </Text>
          <Text color="text/secondary" textStyle="body/md/regular">
            {usedInWorkflowsText}
          </Text>
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
