import { useMemo } from 'react';

import EntitySelector from '@/components/unified-editor/EntitySelector/EntitySelector';
import { getYmlString } from '@/core/stores/BitriseYmlStore';
import WindowUtils from '@/core/utils/WindowUtils';
import useSelectedWorkflow from '@/hooks/useSelectedWorkflow';
import { useWorkflows } from '@/hooks/useWorkflows';
import { useWorkflowsPageStore, WorkflowsPageDialogType } from '@/pages/WorkflowsPage/WorkflowsPage.store';

const WorkflowSelector = () => {
  const workflowIds = useWorkflows((s) => Object.keys(s));
  const openDialog = useWorkflowsPageStore((s) => s.openDialog);
  const [selectedWorkflowId, setSelectedWorkflow] = useSelectedWorkflow();

  const onCreateWorkflow = () => {
    openDialog({ type: WorkflowsPageDialogType.CREATE_WORKFLOW })();
  };

  const onCreateWorkflowWithAI = () => {
    WindowUtils.postMessageToParent('OPEN_CI_CONFIG_EXPERT', {
      action: 'create',
      bitriseYmlContents: getYmlString(),
      selectedPage: 'workflows',
      yamlSelector: 'workflow',
    });
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
      onCreateWithAI={onCreateWorkflowWithAI}
      secondaryEntities={{
        label: 'utility workflows',
        ids: utilityWorkflows,
      }}
      value={selectedWorkflowId}
    />
  );
};

export default WorkflowSelector;
