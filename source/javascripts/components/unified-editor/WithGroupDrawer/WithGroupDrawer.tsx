import { Input, TagsInput, Text } from '@bitrise/bitkit';
import { BitkitAlert } from '@bitrise/bitkit-v2';

import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerProps,
} from '@/components/unified-editor/FloatingDrawer/FloatingDrawer';
import { WithGroup } from '@/core/models/Step';
import StepService from '@/core/services/StepService';
import useDefaultStepLibrary from '@/hooks/useDefaultStepLibrary';
import useNavigation from '@/hooks/useNavigation';
import useStep from '@/hooks/useStep';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  workflowId: string;
  stepIndex: number;
};

const WithGroupDrawer = ({ workflowId, stepIndex, ...props }: Props) => {
  const { replace } = useNavigation();
  const { data } = useStep({ workflowId, stepIndex });
  const defaultStepLibrary = useDefaultStepLibrary();
  const isWithGroup = StepService.isWithGroup(data?.cvs || '', defaultStepLibrary, data?.userValues);

  if (!isWithGroup || !data) {
    return null;
  }

  const {
    title,
    userValues: { container = '', services = [] },
  } = data as WithGroup;

  return (
    <FloatingDrawer {...props}>
      <FloatingDrawerContent>
        <FloatingDrawerCloseButton />
        <FloatingDrawerHeader>
          <Text as="h3" textStyle="heading/h3">
            {title}
          </Text>
        </FloatingDrawerHeader>
        <FloatingDrawerBody>
          {!!container && (
            <Input
              isRequired
              isReadOnly
              label="Image"
              inputRef={(ref) => ref?.setAttribute('data-1p-ignore', '')}
              marginBlockEnd="24"
              value={container}
            />
          )}
          {services && services.length > 0 && (
            <TagsInput
              isReadOnly
              label="Service"
              isRequired
              marginBlockEnd="24"
              value={services}
              onNewValues={() => {}}
              onRemove={() => {}}
            />
          )}
          <BitkitAlert
            action={{
              label: 'Go to YAML page',
              onClick: () => replace('/yml'),
            }}
            variant="info"
            titleText="Edit container or service configuration"
            messageText="View more details or edit the container or service configuration on the Configuration YAML page."
          />
        </FloatingDrawerBody>
      </FloatingDrawerContent>
    </FloatingDrawer>
  );
};

export default WithGroupDrawer;
