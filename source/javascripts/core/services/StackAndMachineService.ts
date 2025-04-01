import { toMerged } from 'es-toolkit';
import { PartialDeep } from 'type-fest';

import { Stack, StackOption } from '../models/Stack';
import StacksAndMachinesApi from '../api/StacksAndMachinesApi';
import { MachineType, MachineTypeOption } from '../models/MachineType';

import StackService from './StackService';
import MachineTypeService from './MachineTypeService';

export type StackWithValue = Stack & {
  value: string;
};

export type MachineTypeWithValue = MachineType & {
  value: string;
};

type SelectStackAndMachineProps = Partial<Awaited<ReturnType<typeof StacksAndMachinesApi.getStacksAndMachines>>> & {
  selectedStackId: string;
  selectedMachineTypeId: string;
};

type SelectStackAndMachineResult = {
  selectedStack: StackWithValue;
  availableStackOptions: StackOption[];
  isInvalidStack: boolean;
  selectedMachineType: MachineTypeWithValue;
  availableMachineTypeOptions: MachineTypeOption[];
  isInvalidMachineType: boolean;
  isMachineTypeSelectionDisabled: boolean;
};

function createStack(override?: PartialDeep<StackWithValue>): StackWithValue {
  const base: StackWithValue = {
    id: '',
    value: '',
    name: '',
    description: '',
    machineTypes: [],
  };

  return toMerged(base, override || {}) as StackWithValue;
}

function createMachineType(override?: PartialDeep<MachineTypeWithValue>): MachineTypeWithValue {
  const base: MachineTypeWithValue = {
    id: '',
    value: '',
    name: '',
    ram: '',
    chip: '',
    cpuCount: '',
    cpuDescription: '',
    creditPerMinute: 0,
  };

  return toMerged(base, override || {}) as MachineTypeWithValue;
}

function prepareStackAndMachineSelectionData(props: SelectStackAndMachineProps): SelectStackAndMachineResult {
  const {
    defaultStackId = '',
    selectedStackId,
    availableStacks = [],
    defaultMachineTypeId = '',
    defaultMachineTypeIdOfOSs = {},
    selectedMachineTypeId,
    availableMachineTypes = [],
    hasDedicatedMachine,
  } = props;

  const result: SelectStackAndMachineResult = {
    selectedStack: createStack(),
    selectedMachineType: createMachineType(),
    availableStackOptions: availableStacks.map(StackService.toStackOption),
    availableMachineTypeOptions: availableMachineTypes.map(MachineTypeService.toMachineOption),
    isInvalidStack: false,
    isInvalidMachineType: false,
    isMachineTypeSelectionDisabled: false,
  };

  const defaultStack = StackService.getStackById(availableStacks, defaultStackId);
  const selectedStack = StackService.getStackById(availableStacks, selectedStackId);

  // Push the default stack to the beginning of the available options
  if (defaultStack) {
    result.availableStackOptions = [
      {
        value: '',
        label: `Default (${defaultStack.name})`,
      },
      ...result.availableStackOptions,
    ];
  }

  const isInvalidStack = !!selectedStackId && !selectedStack;

  if (isInvalidStack) {
    result.isInvalidStack = true;
    // Create the invalid dummy Stack object
    result.selectedStack = createStack({
      id: selectedStackId,
      name: selectedStackId,
      value: selectedStackId,
    });
    // Add the invalid stack to the available options
    result.availableStackOptions.push({
      value: selectedStackId,
      label: selectedStackId,
    });
  } else if (selectedStack) {
    result.selectedStack = { ...selectedStack, value: selectedStack.id };
  } else if (defaultStack) {
    result.selectedStack = { ...defaultStack, value: '' };
  }

  const isSelfHostedPoolSelected = StackService.isSelfHosted(result.selectedStack);
  if (isSelfHostedPoolSelected) {
    result.isMachineTypeSelectionDisabled = true;
    result.availableMachineTypeOptions = [{ label: 'Self-Hosted Runner', value: '' }];
    return result;
  }

  if (hasDedicatedMachine) {
    result.isMachineTypeSelectionDisabled = true;
    result.availableMachineTypeOptions = [{ label: 'Dedicated Machine', value: '' }];
    return result;
  }

  const selectableMachines = MachineTypeService.getMachinesOfStack(availableMachineTypes, result.selectedStack);

  const defaultMachineType = MachineTypeService.getMachineById(selectableMachines, defaultMachineTypeId);
  const selectedMachineType = MachineTypeService.getMachineById(selectableMachines, selectedMachineTypeId);

  const selectedStackOS = StackService.getOsOfStack(result.selectedStack);
  const defaultMachineTypeIdOfOS = defaultMachineTypeIdOfOSs[selectedStackOS];
  const defaultMachineTypeOfOS = MachineTypeService.getMachineById(selectableMachines, defaultMachineTypeIdOfOS);

  const isInvalidMachineType = !!selectedMachineTypeId && !selectedMachineType;

  // Machine type options
  result.availableMachineTypeOptions = selectableMachines.map(MachineTypeService.toMachineOption);
  if (defaultMachineType) {
    result.availableMachineTypeOptions = [
      {
        value: '',
        label: `Default (${defaultMachineType.name})`,
      },
      ...result.availableMachineTypeOptions,
    ];
  } else if (defaultMachineTypeOfOS) {
    result.availableMachineTypeOptions = [
      {
        value: '',
        label: `Default (${defaultMachineTypeOfOS.name})`,
      },
      ...result.availableMachineTypeOptions,
    ];
  }

  if (isInvalidMachineType) {
    result.isInvalidMachineType = true;
    result.selectedMachineType = createMachineType({
      id: selectedMachineTypeId,
      name: selectedMachineTypeId,
      value: selectedMachineTypeId,
    });
    result.availableMachineTypeOptions.push({
      label: selectedMachineTypeId,
      value: selectedMachineTypeId,
    });
  } else if (selectedMachineType) {
    result.selectedMachineType = {
      ...selectedMachineType,
      value: selectedMachineType.id,
    };
  } else if (defaultMachineType) {
    result.selectedMachineType = { ...defaultMachineType, value: '' };
  } else if (defaultMachineTypeOfOS) {
    result.selectedMachineType = { ...defaultMachineTypeOfOS, value: '' };
  }

  return result;
}

function changeStackAndMachine({
  stackId,
  machineTypeId,
  defaultStackId,
  availableStacks = [],
  availableMachineTypes = [],
}: {
  stackId: string;
  machineTypeId: string;
  defaultStackId: string;
  availableStacks?: Stack[];
  availableMachineTypes?: MachineType[];
}) {
  const newStack = StackService.getStackById(availableStacks, stackId);
  const defaultStack = StackService.getStackById(availableStacks, defaultStackId);

  const selectableMachines = MachineTypeService.getMachinesOfStack(availableMachineTypes, newStack ?? defaultStack);
  const currentMachine = MachineTypeService.getMachineById(selectableMachines, machineTypeId);

  return {
    stackId: newStack?.id ?? '',
    machineTypeId: currentMachine?.id ?? '',
  };
}

export default {
  changeStackAndMachine,
  prepareStackAndMachineSelectionData,
};
