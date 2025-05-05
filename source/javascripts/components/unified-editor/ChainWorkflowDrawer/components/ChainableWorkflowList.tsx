import { Box, Button, EmptyState } from '@bitrise/bitkit';
import { useFormContext } from 'react-hook-form';

import { useChainableWorkflows } from '@/hooks/useChainableWorkflows';
import useDebouncedFormValues from '@/hooks/useDebouncedFormValues';

import type { ChainWorkflowCallback, FormValues } from '../ChainWorkflowDrawer';
import ChainableWorkflowCard from './ChainableWorkflowCard';

const InitialValues: FormValues = {
  search: '',
};

type Props = {
  workflowId: string;
  onChainWorkflow: ChainWorkflowCallback;
};

const ChainableWorkflowList = ({ workflowId, onChainWorkflow }: Props) => {
  const { reset, watch } = useFormContext<FormValues>();
  const formValues = useDebouncedFormValues({
    watch,
    initialValues: InitialValues,
  });
  const workflows = useChainableWorkflows({
    id: workflowId,
    search: formValues.search,
  });
  const emptySearchResults = formValues.search && workflows.length === 0;

  if (emptySearchResults) {
    return (
      <EmptyState
        iconName="Magnifier"
        title="No Workflows are matching your filter"
        description="Modify your filters to get results."
        padding="48"
      >
        <Button variant="secondary" onClick={() => reset()}>
          Clear filters
        </Button>
      </EmptyState>
    );
  }

  if (workflows.length === 0) {
    return (
      <EmptyState
        iconName="Magnifier"
        title="There are 0 Workflows to chain"
        description="Create a new Workflow to enable chaining."
        padding="48"
      />
    );
  }

  return (
    <Box display="flex" flexDir="column" gap="12" maxH="100%" overflow="auto">
      {workflows.map((chainableId) => (
        <ChainableWorkflowCard
          key={chainableId}
          chainableWorkflowId={chainableId}
          parentWorkflowId={workflowId}
          onChainWorkflow={onChainWorkflow}
        />
      ))}
    </Box>
  );
};

export default ChainableWorkflowList;
