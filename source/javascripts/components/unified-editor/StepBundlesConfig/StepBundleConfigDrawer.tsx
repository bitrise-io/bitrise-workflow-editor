import { Notification, Text } from '@bitrise/bitkit';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import StepBundleService from '@/core/models/StepBundleService';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import useNavigation from '@/hooks/useNavigation';
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
  stepBundleId: string;
  onRename: (name: string) => void;
};

const StepBundleConfigDrawerContent = ({ onRename, stepBundleId, ...props }: Props) => {
  const dependants = useDependantWorkflows({ stepBundleCvs: `bundle::${stepBundleId}` });
  const usedInWorkflowsText = StepBundleService.getUsedByText(dependants.length);
  const { replace } = useNavigation();
  const enableStepBundles = useFeatureFlag('enable-wfe-step-bundles-ui') && stepBundleId;

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
            <StepBundlePropertiesTab onRename={onRename} />
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

const StepBundleConfigDrawer = ({ stepBundleId, ...props }: Props) => {
  return (
    <StepBundlesConfigProvider stepBundleId={stepBundleId}>
      <StepBundleConfigDrawerContent stepBundleId={stepBundleId} {...props} />
    </StepBundlesConfigProvider>
  );
};

export default StepBundleConfigDrawer;
