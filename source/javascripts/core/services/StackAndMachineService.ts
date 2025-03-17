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
  initialStackId: string;
  selectedStackId: string;
  initialMachineTypeId: string;
  selectedMachineTypeId: string;
};

type SelectStackAndMachineResult = {
  selectedStack: StackWithValue;
  availableStackOptions: StackOption[];
  isInvalidInitialStack: boolean;
  selectedMachineType: MachineTypeWithValue;
  availableMachineTypeOptions: MachineTypeOption[];
  isInvalidInitialMachineType: boolean;
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

function selectStackAndMachine(props: SelectStackAndMachineProps): SelectStackAndMachineResult {
  const {
    defaultStackId = '',
    initialStackId,
    selectedStackId,
    availableStacks = [],
    defaultMachineTypeId = '',
    defaultMachineTypeIdOfOSs = {},
    initialMachineTypeId,
    selectedMachineTypeId,
    availableMachineTypes = [],
    hasDedicatedMachine,
  } = props;

  const result: SelectStackAndMachineResult = {
    selectedStack: createStack(),
    selectedMachineType: createMachineType(),
    availableStackOptions: availableStacks.map(StackService.toStackOption),
    availableMachineTypeOptions: availableMachineTypes.map(MachineTypeService.toMachineOption),
    isInvalidInitialStack: false,
    isInvalidInitialMachineType: false,
    isMachineTypeSelectionDisabled: false,
  };

  const initialStack = StackService.getStackById(availableStacks, initialStackId);
  const defaultStack = StackService.getStackById(availableStacks, defaultStackId);
  const selectedStack = StackService.getStackById(availableStacks, selectedStackId);

  const isAnotherStackSelected = initialStackId !== selectedStackId;
  const isInvalidInitialStack = !!initialStackId && !initialStack && !isAnotherStackSelected;

  if (isInvalidInitialStack) {
    result.selectedStack = createStack({
      id: initialStackId,
      name: initialStackId,
      value: initialStackId,
    });
    result.isInvalidInitialStack = isInvalidInitialStack;
    result.availableStackOptions.push({
      label: initialStackId,
      value: initialStackId,
    });
  } else if (selectedStack) {
    result.selectedStack = { ...selectedStack, value: selectedStack.id };
  } else if (defaultStack) {
    result.selectedStack = { ...defaultStack, value: '' };
  }

  if (defaultStack) {
    const defaultStackOption = {
      label: `Default (${defaultStack.name})`,
      value: '',
    };
    result.availableStackOptions = [defaultStackOption, ...result.availableStackOptions];
  }

  if (hasDedicatedMachine) {
    result.isMachineTypeSelectionDisabled = true;
    result.availableMachineTypeOptions = [{ label: 'Dedicated Machine', value: '' }];
  } else {
    const selectableMachines = MachineTypeService.getMachinesOfStack(availableMachineTypes, result.selectedStack);

    const initialMachineType = MachineTypeService.getMachineById(availableMachineTypes, initialMachineTypeId);
    const defaultMachineType = MachineTypeService.getMachineById(selectableMachines, defaultMachineTypeId);
    const selectedMachineType = MachineTypeService.getMachineById(selectableMachines, selectedMachineTypeId);

    const selectedStackOS = StackService.getOsOfStack(
      !result.selectedStack.id && defaultStack ? defaultStack : result.selectedStack,
    );
    const defaultMachineTypeIdOfOS = defaultMachineTypeIdOfOSs[selectedStackOS];
    const defaultMachineTypeOfOS = MachineTypeService.getMachineById(selectableMachines, defaultMachineTypeIdOfOS);

    const isSelfHostedPoolSelected = StackService.isSelfHosted(result.selectedStack);
    const isAnotherMachineTypeSelected = initialMachineTypeId !== selectedMachineTypeId;
    const isInvalidInitialMachineType = !!initialMachineTypeId && !initialMachineType && !isAnotherMachineTypeSelected;

    result.isMachineTypeSelectionDisabled = isSelfHostedPoolSelected;
    result.availableMachineTypeOptions = isSelfHostedPoolSelected
      ? [{ label: 'Self-Hosted Runner', value: '' }]
      : selectableMachines.map(MachineTypeService.toMachineOption);

    if (isInvalidInitialMachineType) {
      result.selectedMachineType = createMachineType({
        id: initialMachineTypeId,
        name: initialMachineTypeId,
        value: initialMachineTypeId,
      });
      result.isInvalidInitialMachineType = isInvalidInitialMachineType;
      result.availableMachineTypeOptions.push({
        label: initialMachineTypeId,
        value: initialMachineTypeId,
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

    if (defaultMachineType) {
      const defaultMachineTypeOption = {
        label: `Default (${defaultMachineType.name})`,
        value: '',
      };
      result.availableMachineTypeOptions = [defaultMachineTypeOption, ...result.availableMachineTypeOptions];
    } else if (defaultMachineTypeOfOS) {
      const defaultMachineTypeOption = {
        label: `Default (${defaultMachineTypeOfOS.name})`,
        value: '',
      };
      result.availableMachineTypeOptions = [defaultMachineTypeOption, ...result.availableMachineTypeOptions];
    }
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
  createMachineType,
  selectStackAndMachine,
};
