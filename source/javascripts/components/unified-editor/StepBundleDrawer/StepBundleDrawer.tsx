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
import useNavigation from '@/hooks/useNavigation';

type Props = Omit<FloatingDrawerProps, 'size' | 'children'> & {
  size?: 'md' | 'lg';
  workflowId: string;
  stepIndex: number;
};

const StepBundleDrawer = ({ size = 'md', workflowId, stepIndex, ...props }: Props) => {
  const { replace } = useNavigation();
  const { data } = useStep(workflowId, stepIndex);
  const defaultStepLibrary = useDefaultStepLibrary();

  const title = data?.title;
  const isStepBundle = StepService.isStepBundle(data?.cvs || '', defaultStepLibrary, data?.userValues);

  if (!isStepBundle || !data) {
    return null;
  }

  return (
    <FloatingDrawer {...props}>
      <FloatingDrawerContent size={size}>
        <FloatingDrawerCloseButton />
        <FloatingDrawerHeader>
          <Text as="h3" textStyle="heading/h3">
            {title}
          </Text>
        </FloatingDrawerHeader>
        <FloatingDrawerBody>
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
        </FloatingDrawerBody>
      </FloatingDrawerContent>
    </FloatingDrawer>
  );
};

export default StepBundleDrawer;
