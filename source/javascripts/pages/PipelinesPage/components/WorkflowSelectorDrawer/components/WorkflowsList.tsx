import { Input } from '@bitrise/bitkit';
import { useState } from 'react';

import WorkflowService from '@/core/services/WorkflowService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import CreateEmptyWorkflowOption from './CreateEmptyWorkflowOption';
import NoWorkflowsEmptyState from './NoWorkflowsEmptyState';
import SearchResultEmptyState from './SearchResultEmptyState';
import SelectableWorkflowCard from './SelectableWorkflowCard';

type Props = {
  pipelineId: string;
  onSelectWorkflow: (id: string) => void;
  onCreateEmptyWorkflow: VoidFunction;
};

const WorkflowsList = ({ pipelineId, onSelectWorkflow, onCreateEmptyWorkflow }: Props) => {
  const [search, setSearch] = useState('');
  // Active-file workflows unioned with the entity index (other module files); the index
  // is empty in single-file mode, so this stays just the active file's workflows.
  const allWorkflowIds = useBitriseYmlStore((s) => [
    ...new Set([...Object.keys(s.yml.workflows || {}), ...Object.keys(s.entityIndex.workflows)]),
  ]);
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
    return (
      <>
        <CreateEmptyWorkflowOption onClick={onCreateEmptyWorkflow} />
        <NoWorkflowsEmptyState />
      </>
    );
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
      <CreateEmptyWorkflowOption onClick={onCreateEmptyWorkflow} />
      {shouldShowNoSearchResultsEmptyState ? (
        <SearchResultEmptyState onClickButton={() => setSearch('')} />
      ) : (
        workflowIds.map((id) => <SelectableWorkflowCard id={id} key={id} onClick={() => onSelectWorkflow(id)} />)
      )}
    </>
  );
};

export default WorkflowsList;
