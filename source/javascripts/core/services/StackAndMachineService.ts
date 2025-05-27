import { toMerged } from 'es-toolkit';
import { PartialDeep } from 'type-fest';

import StacksAndMachinesApi from '../api/StacksAndMachinesApi';
import { MachineType, MachineTypeOption, Stack, StackOption } from '../models/StackAndMachine';

export type StackWithValue = Stack & {
  value: string;
};

export type MachineTypeWithValue = MachineType & {
  value: string;
};

type SelectStackAndMachineProps = Omit<
  Partial<Awaited<ReturnType<typeof StacksAndMachinesApi.getStacksAndMachines>>>,
  'defaultMachineTypeId' | 'defaultStackId'
> & {
  projectStackId: string;
  projectMachineTypeId: string;
  selectedStackId: string;
  selectedMachineTypeId: string;
  withoutDefaultOptions?: boolean;
};

type SelectStackAndMachineResult = {
  isInvalidStack: boolean;
  selectedStack: StackWithValue;
  availableStackOptions: StackOption[];
  isInvalidMachineType: boolean;
  isMachineTypeSelectionDisabled: boolean;
  selectedMachineType: MachineTypeWithValue;
  availableMachineTypeOptions: MachineTypeOption[];
  promotedMachineTypeOptions: MachineTypeOption[];
  machineTypePromotionMode?: 'trial' | 'upsell';
};

function getStackById(stacks: Stack[], id: string): Stack | undefined {
  return stacks.find((stack) => stack.id === id);
}

function isSelfHostedStack(stack: Stack) {
  return stack.id.startsWith('agent');
}

function getOsOfStack(stack: Stack): string {
  return stack.id.split('-')[0];
}

function getMachinesOfStack(machines: MachineType[], stack?: Stack): MachineType[] {
  if (!stack) {
    return [];
  }

  return machines.filter((m) => stack.machineTypes.includes(m.id));
}

function toStackOption(stack: Stack): StackOption {
  return {
    value: stack.id,
    label: stack.name,
  };
}

function getMachineById(machines: MachineType[], id?: string): MachineType | undefined {
  return machines.find((m) => m.id === id);
}

function toMachineOption(machine: MachineType) {
  const { name, ram, cpuCount, cpuDescription, creditPerMinute, osId } = machine;
  let label = `${name} ${cpuCount} @${cpuDescription} ${ram}`;

  if (creditPerMinute) {
    label += ` (${creditPerMinute} credits/min)`;
  }

  return {
    osId,
    value: machine.id,
    label,
  };
}

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
    availableOnStacks: [],
    id: '',
    value: '',
    name: '',
    ram: '',
    chip: '',
    cpuCount: '',
    cpuDescription: '',
    creditPerMinute: 0,
    osId: 'Other',
  };

  return toMerged(base, override || {}) as MachineTypeWithValue;
}

function prepareStackAndMachineSelectionData(props: SelectStackAndMachineProps): SelectStackAndMachineResult {
  const {
    projectStackId = '',
    selectedStackId,
    availableStacks = [],
    projectMachineTypeId = '',
    defaultMachineTypeIdOfOSs = {},
    selectedMachineTypeId,
    availableMachineTypes = [],
    machineTypePromotion = {
      mode: 'trial',
      promotedMachineTypes: [],
    },
    runningBuildsOnPrivateCloud,
    withoutDefaultOptions = false,
  } = props;

  const result: SelectStackAndMachineResult = {
    selectedStack: createStack(),
    selectedMachineType: createMachineType(),
    availableStackOptions: availableStacks.map(toStackOption),
    availableMachineTypeOptions: availableMachineTypes.map(toMachineOption),
    promotedMachineTypeOptions: machineTypePromotion.promotedMachineTypes.map(toMachineOption),
    machineTypePromotionMode: machineTypePromotion.mode,
    isInvalidStack: false,
    isInvalidMachineType: false,
    isMachineTypeSelectionDisabled: false,
  };

  const defaultStack = getStackById(availableStacks, projectStackId);
  const selectedStack = getStackById(availableStacks, selectedStackId);

  // Push the default stack to the beginning of the available options
  if (defaultStack && !withoutDefaultOptions) {
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
    result.selectedStack = { ...defaultStack, value: withoutDefaultOptions ? defaultStack.id : '' };
  }

  const isSelfHostedPoolSelected = isSelfHostedStack(result.selectedStack);
  if (isSelfHostedPoolSelected) {
    result.isMachineTypeSelectionDisabled = true;
    result.availableMachineTypeOptions = [{ label: 'Self-Hosted Runner', value: '' }];
    return result;
  }

  const selectableMachines = getMachinesOfStack(availableMachineTypes, result.selectedStack);

  if (runningBuildsOnPrivateCloud && selectableMachines.length === 0) {
    result.isMachineTypeSelectionDisabled = true;
    result.availableMachineTypeOptions = [{ label: 'Dedicated Machine', value: '' }];
    return result;
  }

  const defaultMachineType = getMachineById(selectableMachines, projectMachineTypeId);
  const selectedMachineType = getMachineById(selectableMachines, selectedMachineTypeId);

  const selectedStackOS = getOsOfStack(result.selectedStack);
  const defaultMachineTypeIdOfOS = defaultMachineTypeIdOfOSs[selectedStackOS];
  const defaultMachineTypeOfOS = getMachineById(selectableMachines, defaultMachineTypeIdOfOS);

  const isInvalidMachineType = !!selectedMachineTypeId && !selectedMachineType;

  // Machine type options
  result.availableMachineTypeOptions = selectableMachines.map(toMachineOption);
  if (!withoutDefaultOptions) {
    if (defaultMachineType) {
      result.availableMachineTypeOptions = [
        {
          value: '',
          label: `Default (${defaultMachineType.name})`,
          osId: defaultMachineType.osId,
        },
        ...result.availableMachineTypeOptions,
      ];
    } else if (defaultMachineTypeOfOS) {
      result.availableMachineTypeOptions = [
        {
          value: '',
          label: `Default (${defaultMachineTypeOfOS.name})`,
          osId: defaultMachineTypeOfOS.osId,
        },
        ...result.availableMachineTypeOptions,
      ];
    }
  }

  result.promotedMachineTypeOptions = machineTypePromotion.promotedMachineTypes
    .filter((machine) => {
      return machine.availableOnStacks.includes(result.selectedStack.id);
    })
    .map(toMachineOption);

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
    result.selectedMachineType = { ...defaultMachineType, value: withoutDefaultOptions ? defaultMachineType.id : '' };
  } else if (defaultMachineTypeOfOS) {
    result.selectedMachineType = {
      ...defaultMachineTypeOfOS,
      value: withoutDefaultOptions ? defaultMachineTypeOfOS.id : '',
    };
  }

  return result;
}

function changeStackAndMachine({
  stackId,
  machineTypeId,
  projectStackId,
  availableStacks,
  availableMachineTypes,
  machineFallbackOptions,
}: {
  stackId: string;
  machineTypeId: string;
  projectStackId: string;
  availableStacks: Stack[];
  availableMachineTypes: MachineType[];
  machineFallbackOptions?: {
    defaultMachineTypeIdOfOSs: {
      [key: string]: string;
    };
    projectMachineTypeId: string;
  };
}) {
  const newStack = getStackById(availableStacks, stackId);
  const projectStack = getStackById(availableStacks, projectStackId);
  const newStackOS = getOsOfStack(newStack || projectStack || createStack());

  const selectableMachines = getMachinesOfStack(availableMachineTypes, newStack ?? projectStack);
  const currentMachine = getMachineById(selectableMachines, machineTypeId);

  const projectMachineType = getMachineById(selectableMachines, machineFallbackOptions?.projectMachineTypeId);
  const defaultMachineTypeIdOfOS = machineFallbackOptions?.defaultMachineTypeIdOfOSs[newStackOS];
  const defaultMachineTypeOfOS = getMachineById(selectableMachines, defaultMachineTypeIdOfOS);

  const fallbackMachineIds = projectMachineType?.id || defaultMachineTypeOfOS?.id || selectableMachines?.[0]?.id || '';

  return {
    stackId: newStack?.id ?? '',
    machineTypeId: currentMachine?.id ?? (machineFallbackOptions ? fallbackMachineIds : ''),
  };
}

export default {
  changeStackAndMachine,
  prepareStackAndMachineSelectionData,
  toStackOption,
  toMachineOption,
  getStackById,
  getMachinesOfStack,
};
