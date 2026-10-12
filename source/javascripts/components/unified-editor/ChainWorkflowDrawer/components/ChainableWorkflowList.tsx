import { Box, Button } from '@bitrise/bitkit';
import { BitkitEmptyState, IconMagnifier } from '@bitrise/bitkit-v2';
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
      <BitkitEmptyState
        icon={IconMagnifier}
        headingText="No Workflows are matching your filter"
        bodyText="Modify your filters to get results."
      >
        <Button variant="secondary" onClick={() => reset()}>
          Clear filters
        </Button>
      </BitkitEmptyState>
    );
  }

  if (workflows.length === 0) {
    return (
      <BitkitEmptyState
        icon={IconMagnifier}
        headingText="There are 0 Workflows to chain"
        bodyText="Create a new Workflow to enable chaining."
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
