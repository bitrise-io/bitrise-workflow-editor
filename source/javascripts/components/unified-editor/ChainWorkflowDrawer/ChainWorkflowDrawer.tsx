import { Box, Notification, SearchInput, Text } from '@bitrise/bitkit';
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
            <Box display="flex" flexDir="column" gap="16">
              <Text as="h3" textStyle="heading/h3" fontWeight="bold">
                Chain Workflows to '{workflowId}'
              </Text>
              <Text size="3">
                Add Workflows before or after the Steps of the selected Workflow. Each linked Workflow executes on the
                same VM, ensuring a cohesive build process.
              </Text>
              <Notification status="info" flexShrink="0">
                Changes to a chained Workflow affect all other Workflows using it.
              </Notification>
              <Controller<FormValues>
                name="search"
                render={({ field: { ref, onChange, ...rest } }) => (
                  <SearchInput
                    inputRef={ref}
                    placeholder="Filter by name "
                    onChange={(value) => onChange({ target: { value } })}
                    {...rest}
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
