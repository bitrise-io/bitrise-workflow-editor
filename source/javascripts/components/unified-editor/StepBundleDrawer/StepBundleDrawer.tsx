import { Text } from '@bitrise/bitkit';
import useStep from '@/hooks/useStep';
import StepService from '@/core/models/StepService';
import useDefaultStepLibrary from '@/hooks/useDefaultStepLibrary';
import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerProps,
} from '@/components/unified-editor/FloatingDrawer/FloatingDrawer';
import StepBundlePropertiesTab from '@/components/unified-editor/StepBundleDrawer/StepBundlePropertiesTab';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import StepBundleService from '@/core/models/StepBundleService';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  workflowId: string;
  stepIndex: number;
};

const StepBundleDrawer = ({ workflowId, stepIndex, ...props }: Props) => {
  const { data } = useStep({ workflowId, stepIndex });
  const defaultStepLibrary = useDefaultStepLibrary();
  const stepBundleId = data?.title;
  const dependants = useDependantWorkflows({ stepBundleCvs: `bundle::${stepBundleId}` });
  const usedInWorkflowsText = StepBundleService.getUsedByText(dependants.length);

  const isStepBundle = StepService.isStepBundle(data?.cvs || '', defaultStepLibrary, data?.userValues);

  if (!isStepBundle || !data) {
    return null;
  }

  return (
    <FloatingDrawer {...props}>
      <FloatingDrawerContent>
        <FloatingDrawerCloseButton />
        <FloatingDrawerHeader>
          <Text as="h3" textStyle="heading/h3">
            {stepBundleId}
          </Text>
          <Text color="text/secondary" textStyle="body/md/regular">
            {usedInWorkflowsText}
          </Text>
        </FloatingDrawerHeader>
        <FloatingDrawerBody>
          {stepBundleId && <StepBundlePropertiesTab stepBundleId={stepBundleId} />}
        </FloatingDrawerBody>
      </FloatingDrawerContent>
    </FloatingDrawer>
  );
};

export default StepBundleDrawer;
