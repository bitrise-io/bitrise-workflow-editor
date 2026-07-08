import { ReactNode } from 'react';

import StackAndMachine from '@/components/StacksAndMachine/StackAndMachine';
import StackAndMachineService, { StackAndMachineSource } from '@/core/services/StackAndMachineService';
import useWorkflowStackAndMachine from '@/hooks/useWorkflowStackAndMachine';

type Props = {
  workflowId: string;
  /** Trailing element in the selector row — the jump-to-definition arrow on the merged read-only view. */
  selectsTrailing?: ReactNode;
};

const WorkflowStackAndMachine = ({ workflowId, selectsTrailing }: Props) => {
  const { stackId, machineTypeId, stackRollbackVersion } = useWorkflowStackAndMachine(workflowId);

  const updateWorkflowMeta = (stack: string, machine_type_id: string, stack_rollback_version: string) => {
    StackAndMachineService.updateStackAndMachine(
      { stackId: stack, machineTypeId: machine_type_id, stackRollbackVersion: stack_rollback_version },
      StackAndMachineSource.Workflow,
      workflowId,
    );
  };

  return (
    <StackAndMachine
      stackId={stackId}
      machineTypeId={machineTypeId}
      stackRollbackVersion={stackRollbackVersion}
      workflowId={workflowId}
      onChange={updateWorkflowMeta}
      selectsTrailing={selectsTrailing}
    />
  );
};

export default WorkflowStackAndMachine;
