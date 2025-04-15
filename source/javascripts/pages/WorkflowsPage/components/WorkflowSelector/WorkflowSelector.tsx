import { useMemo } from 'react';

import EntitySelector from '@/components/unified-editor/EntitySelector/EntitySelector';
import useSelectedWorkflow from '@/hooks/useSelectedWorkflow';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useWorkflowsPageStore, WorkflowsPageDialogType } from '@/pages/WorkflowsPage/WorkflowsPage.store';

const WorkflowSelector = () => {
  const workflows = useWorkflows();
  const workflowIds = Object.keys(workflows);
  const openDialog = useWorkflowsPageStore((s) => s.openDialog);
  const [{ id: selectedWorkflowId }, setSelectedWorkflow] = useSelectedWorkflow();

  const onCreateWorkflow = () => {
    openDialog({ type: WorkflowsPageDialogType.CREATE_WORKFLOW })();
  };

  const [utilityWorkflows, runnableWorkflows] = useMemo(() => {
    const utility: string[] = [];
    const runnable: string[] = [];

    workflowIds.forEach((workflowName) => {
      if (workflowName.startsWith('_')) {
        utility.push(workflowName);
      } else {
        runnable.push(workflowName);
      }
    });

    return [utility, runnable];
  }, [workflowIds]);

  return (
    <EntitySelector
      entityIds={runnableWorkflows}
      entityName="Workflow"
      onChange={setSelectedWorkflow}
      onCreate={onCreateWorkflow}
      secondaryEntities={{
        label: 'utility workflows',
        ids: utilityWorkflows,
      }}
      value={selectedWorkflowId}
    />
  );
};

export default WorkflowSelector;
