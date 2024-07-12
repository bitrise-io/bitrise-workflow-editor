import { Dropdown, DropdownGroup, DropdownOption, DropdownSearch } from '@bitrise/bitkit';
import { Workflows } from '@/models/Workflow';

type Props = {
  workflows: Workflows;
  selectedWorkflowId?: string;
  selectWorkflow: (workflowId: string) => void;
};

const WorkflowSelector = ({ workflows, selectWorkflow: __, selectedWorkflowId: ___ }: Props) => {
  const utilityWorkflows: string[] = [];
  const runnableWorkflows: string[] = [];

  Object.keys(workflows).forEach((id) => {
    if (id.startsWith('_')) {
      utilityWorkflows.push(id);
    } else {
      runnableWorkflows.push(id);
    }
  });

  const hasUtilityWorkflows = utilityWorkflows.length > 0;

  return (
    <Dropdown size="md" search={<DropdownSearch placeholder="Filter by name..." />}>
      {runnableWorkflows.map((id) => (
        <DropdownOption key={id} value={id}>
          {id}
        </DropdownOption>
      ))}

      {hasUtilityWorkflows && (
        <DropdownGroup label="utility workflows" labelProps={{ whiteSpace: 'nowrap' }}>
          {utilityWorkflows.map((id) => (
            <DropdownOption key={id} value={id}>
              {id}
            </DropdownOption>
          ))}
        </DropdownGroup>
      )}
    </Dropdown>
  );
};

export default WorkflowSelector;
