import { BitkitAlert, BitkitHeading, BitkitSearchInput } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerProps,
} from '@/components/unified-editor/FloatingDrawer/FloatingDrawer';
import { ChainedWorkflowPlacement } from '@/core/models/Workflow';

import ChainableWorkflowList from './components/ChainableWorkflowList';

type FormValues = {
  search: string;
};

type ChainWorkflowCallback = (
  parentWorkflowId: string,
  placement: ChainedWorkflowPlacement,
  chainableWorkflowId: string,
) => void;

type Props = Omit<FloatingDrawerProps, 'children'> & {
  workflowId: string;
  onChainWorkflow: ChainWorkflowCallback;
};

const ChainWorkflowDrawer = ({ workflowId, onChainWorkflow, onCloseComplete, ...props }: Props) => {
  const form = useForm<FormValues>({ defaultValues: { search: '' } });

  const handleCloseCompete = () => {
    form.reset();
    onCloseComplete?.();
  };

  return (
    <FormProvider {...form}>
      <FloatingDrawer onCloseComplete={handleCloseCompete} {...props}>
        <FloatingDrawerContent>
          <FloatingDrawerCloseButton />
          <FloatingDrawerHeader>
            <Box display="flex" flexDirection="column" gap="16">
              <BitkitHeading as="h3">Chain Workflows to '{workflowId}'</BitkitHeading>
              <Text textStyle="body/lg/regular" data-clarity-unmask="true">
                Add Workflows before or after the Steps of the selected Workflow. Each linked Workflow executes on the
                same VM, ensuring a cohesive build process.
              </Text>
              <BitkitAlert
                variant="info"
                flexShrink="0"
                data-clarity-unmask="true"
                messageText="Changes to a chained Workflow affect all other Workflows using it."
              />
              <Controller<FormValues>
                name="search"
                render={({ field: { ref, onBlur, onChange, value } }) => (
                  <BitkitSearchInput
                    inputRef={ref}
                    label="Filter by name"
                    placeholder="Filter by name "
                    onBlur={onBlur}
                    onChange={(changedValue) => onChange({ target: { value: changedValue } })}
                    value={value}
                  />
                )}
              />
            </Box>
          </FloatingDrawerHeader>
          <FloatingDrawerBody>
            <ChainableWorkflowList workflowId={workflowId} onChainWorkflow={onChainWorkflow} />
          </FloatingDrawerBody>
        </FloatingDrawerContent>
      </FloatingDrawer>
    </FormProvider>
  );
};

export { ChainWorkflowCallback, FormValues };
export default ChainWorkflowDrawer;
