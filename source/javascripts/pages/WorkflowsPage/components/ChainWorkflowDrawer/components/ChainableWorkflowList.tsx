import { useFormContext } from 'react-hook-form';
import { Box, Button, EmptyState } from '@bitrise/bitkit';

import { ChainWorkflowCallback, InitialValues, SearchFormValues } from '../ChainWorkflowDrawer.types';
import useSearchChainableWorkflows from '../hooks/useSearchChainableWorkflows';
import ChainableWorkflowCard from './ChainableWorkflowCard';
import useDebouncedFormValues from '@/hooks/useDebouncedFormValues';

type Props = {
  workflowId: string;
  onChainWorkflow: ChainWorkflowCallback;
};

const ChainableWorkflowList = ({ workflowId, onChainWorkflow }: Props) => {
  const { reset, watch } = useFormContext<SearchFormValues>();
  const formValues = useDebouncedFormValues({
    watch,
    initialValues: InitialValues,
  });
  const { data: workflows = [] } = useSearchChainableWorkflows({
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
        <ChainableWorkflowCard key={chainableId} workflowId={chainableId} onChainWorkflow={onChainWorkflow} />
      ))}
    </Box>
  );
};

export default ChainableWorkflowList;
