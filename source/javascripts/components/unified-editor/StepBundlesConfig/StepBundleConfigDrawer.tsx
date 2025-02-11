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
  workflowId: string;
  stepIndex: number;
};

const StepBundleConfigDrawer = ({ onRename, workflowId, stepIndex, ...props }: Props) => {
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
          <StepBundlesConfigProvider stepBundleId={id}>
            <StepBundlePropertiesTab onRename={onRename} />
          </StepBundlesConfigProvider>
        </FloatingDrawerBody>
      </FloatingDrawerContent>
    </FloatingDrawer>
  );
};

export default StepBundleConfigDrawer;
