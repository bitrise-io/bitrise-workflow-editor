import { useState } from 'react';
import { Input } from '@bitrise/bitkit';
import WorkflowService from '@/core/models/WorkflowService';
import { useWorkflows } from '@/hooks/useWorkflows';
import NoWorkflowsEmptyState from './NoWorkflowsEmptyState';
import SearchResultEmptyState from './SearchResultEmptyState';
import SelectableWorkflowCard from './SelectableWorkflowCard';

type Props = {
  onSelectWorkflow: (id: string) => void;
};

const WorkflowsList = ({ onSelectWorkflow }: Props) => {
  const workflows = useWorkflows();
  const [search, setSearch] = useState('');

  const workflowIds = Object.keys(workflows).filter((id) => {
    return !WorkflowService.isUtilityWorkflow(id) && id.toLowerCase().includes(search.toLowerCase());
  });

  const hasNoWorkflows = workflowIds.length === 0;
  const shouldShowNoWorkflowsEmptyState = !search && hasNoWorkflows;
  const shouldShowNoSearchResultsEmptyState = search && hasNoWorkflows;

  if (shouldShowNoWorkflowsEmptyState) {
    return <NoWorkflowsEmptyState />;
  }

  return (
    <>
      <Input
        size="md"
        autoFocus
        value={search}
        leftIconName="Magnifier"
        placeholder="Filter by name"
        onChange={(e) => setSearch(e.target.value)}
      />
      {shouldShowNoSearchResultsEmptyState ? (
        <SearchResultEmptyState onClickButton={() => setSearch('')} />
      ) : (
        workflowIds.map((id) => <SelectableWorkflowCard id={id} key={id} onClick={() => onSelectWorkflow(id)} />)
      )}
    </>
  );
};

export default WorkflowsList;
