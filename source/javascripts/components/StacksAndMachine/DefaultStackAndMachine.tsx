import { Text } from '@bitrise/bitkit';
import { ReactNode } from 'react';

import StackAndMachine from '@/components/StacksAndMachine/StackAndMachine';
import StackAndMachineService, { StackAndMachineSource } from '@/core/services/StackAndMachineService';
import useProjectStackAndMachine from '@/hooks/useProjectStackAndMachine';

type DefaultStackValue = {
  stackId: string;
  machineTypeId: string;
  stackRollbackVersion: string;
};

type Props = {
  /** Shown as a subtitle under the title, e.g. "Defined in bitrise.yml" (modular views). */
  definingPath?: string;
  /** Trailing element in the selector row — the jump-to-definition arrow on modular read-only views. */
  selectsTrailing?: ReactNode;
  /** Force the selectors read-only (e.g. an inherited default shown in a module that doesn't define it). */
  readOnly?: boolean;
  /** Override the displayed values — used for the inherited default, whose values come from the
   * defining module, not the active file. Defaults to the active document's project default. */
  value?: DefaultStackValue;
};

const DefaultStackAndMachine = ({ definingPath, selectsTrailing, readOnly, value }: Props) => {
  const { projectStackId, projectMachineTypeId, projectStackRollbackVersion } = useProjectStackAndMachine();

  const stackId = value?.stackId ?? projectStackId;
  const machineTypeId = value?.machineTypeId ?? projectMachineTypeId;
  const stackRollbackVersion = value?.stackRollbackVersion ?? projectStackRollbackVersion;

  const updateDefaultMeta = (stack: string, machine_type_id: string, stack_rollback_version: string) => {
    StackAndMachineService.updateStackAndMachine(
      { stackId: stack, machineTypeId: machine_type_id, stackRollbackVersion: stack_rollback_version },
      StackAndMachineSource.Root,
    );
  };

  return (
    <div>
      <Text as="h4" textStyle="heading/h4" mb={definingPath ? '4' : '12'}>
        Default stack & machine
      </Text>
      {definingPath && (
        <Text textStyle="body/sm/regular" color="text/secondary" mb="12">
          Defined in {definingPath}
        </Text>
      )}
      <StackAndMachine
        stackId={stackId}
        machineTypeId={machineTypeId}
        withMachineFallbacks
        stackRollbackVersion={stackRollbackVersion}
        withoutDefaultOptions
        onChange={updateDefaultMeta}
        forceReadOnly={readOnly}
        selectsTrailing={selectsTrailing}
      />
    </div>
  );
};

export default DefaultStackAndMachine;
