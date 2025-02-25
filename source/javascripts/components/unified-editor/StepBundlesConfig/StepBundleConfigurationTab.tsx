import { useState } from 'react';
import { Box, Button, EmptyState, Input, Text } from '@bitrise/bitkit';
import { ButtonGroup } from '@chakra-ui/react';
import StepInput from '@/components/unified-editor/StepConfigDrawer/components/StepInput';

const StepBundleConfigurationTab = () => {
  const [showInputs, setShowInputs] = useState(false);

  return (
    <>
      {!showInputs && (
        <EmptyState
          title="Bundle inputs"
          description="Define input variables to manage multiple Steps within a bundle. Reference their keys in Steps and assign custom
      values for each Workflow."
          p={48}
        >
          <Button
            leftIconName="Plus"
            variant="secondary"
            size="md"
            mt={24}
            onClick={() => {
              setShowInputs(true);
            }}
          >
            Add input
          </Button>
        </EmptyState>
      )}

      {showInputs && (
        <Box as="form" display="flex" flexDir="column" gap="16" height="100%">
          <Text textStyle="heading/h3">New bundle input</Text>
          <Input
            label="Title"
            helperText="This will be the label of the input. Keep it short and descriptive."
            size="md"
            isRequired
          />
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Input label="Key" helperText="Use this key as variable in Step inputs." size="md" flex={1} isRequired />
            <Text mx={8}>=</Text>
            <StepInput label="Default value" helperText="Value must be a string." flex={1} />
          </Box>
          <ButtonGroup display="flex" justifyContent="space-between" marginBlockStart="auto">
            <Button variant="tertiary" isDanger>
              Cancel
            </Button>
            <Button>Create</Button>
          </ButtonGroup>
        </Box>
      )}
    </>
  );
};

export default StepBundleConfigurationTab;
