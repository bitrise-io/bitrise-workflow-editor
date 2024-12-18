import { Notification, Text } from '@bitrise/bitkit';
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
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import StepBundleService from '@/core/models/StepBundleService';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import useNavigation from '@/hooks/useNavigation';
import StepBundlePropertiesTab from './StepBundlePropertiesTab';

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
  const { replace } = useNavigation();
  const enableStepBundles = useFeatureFlag('enable-wfe-step-bundles-ui') && stepBundleId;

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
            {enableStepBundles ? stepBundleId : `Step bundle: ${stepBundleId}`}
          </Text>
          {enableStepBundles && (
            <Text color="text/secondary" textStyle="body/md/regular">
              {usedInWorkflowsText}
            </Text>
          )}
        </FloatingDrawerHeader>
        <FloatingDrawerBody>
          {enableStepBundles ? (
            <StepBundlePropertiesTab stepBundleId={stepBundleId} />
          ) : (
            <Notification
              action={{
                label: 'Go to YAML page',
                onClick: () => replace('/yml'),
              }}
              status="info"
            >
              <Text textStyle="comp/notification/title">Edit step bundle configuration</Text>
              <Text textStyle="comp/notification/message">
                View more details or edit step bundle configuration in the Configuration YAML page.
              </Text>
            </Notification>
          )}
        </FloatingDrawerBody>
      </FloatingDrawerContent>
    </FloatingDrawer>
  );
};

export default StepBundleDrawer;
