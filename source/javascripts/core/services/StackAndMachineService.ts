import { toMerged } from 'es-toolkit';
import { PartialDeep } from 'type-fest';

import StacksAndMachinesApi from '../api/StacksAndMachinesApi';
import { MachineType, MachineTypeOption } from '../models/MachineType';
import { Stack, StackOption } from '../models/Stack';
import MachineTypeService from './MachineTypeService';
import StackService from './StackService';

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
    projectStackId = '',
    selectedStackId,
    availableStacks = [],
    projectMachineTypeId = '',
    defaultMachineTypeIdOfOSs = {},
    selectedMachineTypeId,
    availableMachineTypes = [],
    hasDedicatedMachine,
    withoutDefaultOptions = false,
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

  const defaultStack = StackService.getStackById(availableStacks, projectStackId);
  const selectedStack = StackService.getStackById(availableStacks, selectedStackId);

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

  const defaultMachineType = MachineTypeService.getMachineById(selectableMachines, projectMachineTypeId);
  const selectedMachineType = MachineTypeService.getMachineById(selectableMachines, selectedMachineTypeId);

  const selectedStackOS = StackService.getOsOfStack(result.selectedStack);
  const defaultMachineTypeIdOfOS = defaultMachineTypeIdOfOSs[selectedStackOS];
  const defaultMachineTypeOfOS = MachineTypeService.getMachineById(selectableMachines, defaultMachineTypeIdOfOS);

  const isInvalidMachineType = !!selectedMachineTypeId && !selectedMachineType;

  // Machine type options
  result.availableMachineTypeOptions = selectableMachines.map(MachineTypeService.toMachineOption);
  if (!withoutDefaultOptions) {
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
  const newStack = StackService.getStackById(availableStacks, stackId);
  const projectStack = StackService.getStackById(availableStacks, projectStackId);
  const newStackOS = StackService.getOsOfStack(newStack || projectStack || createStack());

  const selectableMachines = MachineTypeService.getMachinesOfStack(availableMachineTypes, newStack ?? projectStack);
  const currentMachine = MachineTypeService.getMachineById(selectableMachines, machineTypeId);

  const projectMachineType = MachineTypeService.getMachineById(
    selectableMachines,
    machineFallbackOptions?.projectMachineTypeId,
  );
  const defaultMachineTypeIdOfOS = machineFallbackOptions?.defaultMachineTypeIdOfOSs[newStackOS];
  const defaultMachineTypeOfOS = MachineTypeService.getMachineById(selectableMachines, defaultMachineTypeIdOfOS);

  const fallbackMachineIds = projectMachineType?.id || defaultMachineTypeOfOS?.id || selectableMachines?.[0]?.id || '';

  return {
    stackId: newStack?.id ?? '',
    machineTypeId: currentMachine?.id ?? (machineFallbackOptions ? fallbackMachineIds : ''),
  };
}

export default {
  changeStackAndMachine,
  prepareStackAndMachineSelectionData,
};
