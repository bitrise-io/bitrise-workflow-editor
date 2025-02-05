import { Notification, Text } from '@bitrise/bitkit';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import StepBundleService from '@/core/models/StepBundleService';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import useNavigation from '@/hooks/useNavigation';
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

  const { replace } = useNavigation();
  const enableStepBundles = useFeatureFlag('enable-wfe-step-bundles-ui');

  return (
    <FloatingDrawer {...props}>
      <FloatingDrawerContent>
        <FloatingDrawerCloseButton />
        <FloatingDrawerHeader>
          <Text as="h3" textStyle="heading/h3">
            {data?.title}
          </Text>
          {enableStepBundles && (
            <Text color="text/secondary" textStyle="body/md/regular">
              {usedInWorkflowsText}
            </Text>
          )}
        </FloatingDrawerHeader>
        <FloatingDrawerBody>
          {enableStepBundles ? (
            <StepBundlesConfigProvider stepBundleId={data?.id || ''}>
              <StepBundlePropertiesTab onRename={onRename} />
            </StepBundlesConfigProvider>
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

export default StepBundleConfigDrawer;
