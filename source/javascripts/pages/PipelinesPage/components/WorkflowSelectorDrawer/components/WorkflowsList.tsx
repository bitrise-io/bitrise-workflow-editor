import { Input } from '@bitrise/bitkit';
import { useState } from 'react';

import WorkflowService from '@/core/services/WorkflowService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useWorkflows } from '@/hooks/useWorkflows';

import NoWorkflowsEmptyState from './NoWorkflowsEmptyState';
import SearchResultEmptyState from './SearchResultEmptyState';
import SelectableWorkflowCard from './SelectableWorkflowCard';

type Props = {
  pipelineId: string;
  onSelectWorkflow: (id: string) => void;
};

const WorkflowsList = ({ pipelineId, onSelectWorkflow }: Props) => {
  const [search, setSearch] = useState('');
  const allWorkflowIds = useWorkflows((s) => Object.keys(s));
  const workflowIdsInPipeline = useBitriseYmlStore((s) => Object.keys(s.yml.pipelines?.[pipelineId]?.workflows || {}));

  const workflowIds = allWorkflowIds.filter((id) => {
    return (
      !workflowIdsInPipeline.includes(id) &&
      !WorkflowService.isUtilityWorkflow(id) &&
      id.toLowerCase().includes(search.toLowerCase())
    );
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
