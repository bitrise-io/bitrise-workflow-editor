import { Text } from '@bitrise/bitkit';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import StepBundleService from '@/core/services/StepBundleService';
import useStep from '@/hooks/useStep';
import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerProps,
} from '../FloatingDrawer/FloatingDrawer';
import StepBundlePropertiesTab from './StepBundlePropertiesTab';
import StepBundlesConfigProvider from './StepBundlesConfig.context';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  onRename: (name: string) => void;
  workflowId: string;
  stepIndex: number;
};

const StepBundleConfigDrawer = ({ onRename, workflowId, stepIndex, ...props }: Props) => {
  const { data } = useStep({ workflowId, stepIndex });

  const dependants = useDependantWorkflows({ stepBundleCvs: data?.cvs });
  const usedInWorkflowsText = StepBundleService.getUsedByText(dependants.length);

  return (
    <FloatingDrawer {...props}>
      <FloatingDrawerContent>
        <FloatingDrawerCloseButton />
        <FloatingDrawerHeader>
          <Text as="h3" textStyle="heading/h3">
            {data?.title}
          </Text>
          <Text color="text/secondary" textStyle="body/md/regular">
            {usedInWorkflowsText}
          </Text>
        </FloatingDrawerHeader>
        <FloatingDrawerBody>
          <StepBundlesConfigProvider stepBundleId={data?.id || ''}>
            <StepBundlePropertiesTab onRename={onRename} />
          </StepBundlesConfigProvider>
        </FloatingDrawerBody>
      </FloatingDrawerContent>
    </FloatingDrawer>
  );
};

export default StepBundleConfigDrawer;
