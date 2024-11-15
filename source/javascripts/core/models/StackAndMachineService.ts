import { PartialDeep } from 'type-fest';
import { toMerged } from 'es-toolkit';
import StacksAndMachinesApi from '../api/StacksAndMachinesApi';
import { MachineType, MachineTypeOption } from './MachineType';
import { Stack, StackOption } from './Stack';
import StackService from './StackService';
import MachineTypeService from './MachineTypeService';

type SelectStackAndMachineProps = Partial<Awaited<ReturnType<typeof StacksAndMachinesApi.getStacksAndMachines>>> & {
  initialStackId: string;
  selectedStackId: string;
  initialMachineTypeId: string;
  selectedMachineTypeId: string;
};

type SelectStackAndMachineResult = {
  selectedStack: Stack;
  availableStackOptions: StackOption[];
  isInvalidInitialStack: boolean;
  selectedMachineType: MachineType;
  availableMachineTypeOptions: MachineTypeOption[];
  isInvalidInitialMachineType: boolean;
  isMachineTypeSelectionDisabled: boolean;
};

function createStack(override?: PartialDeep<Stack>): Stack {
  const base: Stack = {
    id: '',
    name: '',
    machineTypes: [],
  };

  return toMerged(base, override || {});
}

function createMachineType(override?: PartialDeep<MachineType>): MachineType {
  const base: MachineType = {
    id: '',
    name: '',
    creditCost: 0,
    specs: { cpu: { chip: '', cpuCount: '', cpuDescription: '' }, ram: '' },
  };

  return toMerged(base, override || {}) as MachineType;
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
    });
    result.isInvalidInitialStack = isInvalidInitialStack;
    result.availableStackOptions.push({
      label: initialStackId,
      value: initialStackId,
    });
  } else if (selectedStack) {
    result.selectedStack = selectedStack;
  } else if (defaultStack) {
    result.selectedStack = { ...defaultStack, id: '' };
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
      });
      result.isInvalidInitialMachineType = isInvalidInitialMachineType;
      result.availableMachineTypeOptions.push({
        label: initialMachineTypeId,
        value: initialMachineTypeId,
      });
    } else if (selectedMachineType) {
      result.selectedMachineType = selectedMachineType;
    } else if (defaultMachineType) {
      result.selectedMachineType = { ...defaultMachineType, id: '' };
    } else if (defaultMachineTypeOfOS) {
      result.selectedMachineType = { ...defaultMachineTypeOfOS, id: '' };
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

export default { selectStackAndMachine, createMachineType };
