import { Card, Text } from '@bitrise/bitkit';
import { IconPlus } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';

type Props = {
  onClick: VoidFunction;
};

// The first option in the Add Workflows list: a new, empty Workflow, named in the create dialog and added
// to the Pipeline right away. It matches the Workflow cards below it, with a plus in place of their details.
const CreateEmptyWorkflowOption = ({ onClick }: Props) => (
  <Card
    py="8"
    px="16"
    role="button"
    variant="outline"
    onClick={onClick}
    _hover={{ boxShadow: 'small', borderColor: 'border/hover' }}
    data-clarity-unmask="true"
  >
    <Box display="flex" alignItems="center" gap="8">
      <IconPlus size="16" color="icon/interactive" />
      <Text textStyle="body/lg/semibold">Empty Workflow</Text>
    </Box>
    <Text textStyle="body/sm/regular" color="text/secondary">
      Start from scratch and add Steps
    </Text>
  </Card>
);

export default CreateEmptyWorkflowOption;
