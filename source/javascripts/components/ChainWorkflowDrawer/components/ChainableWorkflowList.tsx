import { useFormContext } from 'react-hook-form';
import { Box, Button, EmptyState } from '@bitrise/bitkit';

import { InitialValues, SearchFormValues } from '../ChainWorkflowDrawer.types';
import useSearchChainableWorkflows from '../hooks/useSearchChainableWorkflows';
import ChainableWorkflowCard from './ChainableWorkflowCard';
import useDebouncedFormValues from '@/hooks/useDebouncedFormValues';

type Props = {
  id: string;
  onChainBefore: (workflowId: string) => void;
  onChainAfter: (workflowId: string) => void;
};

const ChainableWorkflowList = ({ id: workflowId, onChainBefore, onChainAfter }: Props) => {
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
    <Box display="flex" flexDir="column" gap="12">
      {workflows.map(({ id: chainableId, usedBy }) => (
        <ChainableWorkflowCard
          key={chainableId}
          workflowId={chainableId}
          usedBy={usedBy}
          onChainBefore={onChainBefore}
          onChainAfter={onChainAfter}
        />
      ))}
    </Box>
  );
};

export default ChainableWorkflowList;
