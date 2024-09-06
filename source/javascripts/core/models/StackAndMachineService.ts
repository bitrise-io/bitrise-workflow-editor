import { PartialDeep } from 'type-fest';
import merge from 'lodash/merge';
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
  isStackSelectorTouched: boolean;
  isMachineTypeSelectorTouched: boolean;
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

function createMachineType(override: PartialDeep<MachineType>): MachineType {
  const base: MachineType = {
    id: '',
    name: '',
    creditCost: 0,
    specs: { cpu: { chip: '', cpuCount: '', cpuDescription: '' }, ram: '' },
  };

  return merge({}, base, override);
}

function selectStackAndMachine(props: SelectStackAndMachineProps): SelectStackAndMachineResult {
  const {
    defaultStackId = '',
    initialStackId,
    selectedStackId,
    availableStacks = [],
    isStackSelectorTouched,
    defaultMachineId = '',
    initialMachineTypeId,
    selectedMachineTypeId,
    availableMachineTypes = [],
    isMachineTypeSelectorTouched,
    hasDedicatedMachine,
    hasSelfHostedRunner,
  } = props;

  const initialStack = StackService.getStackById(availableStacks, initialStackId);
  const defaultStack = StackService.getStackById(availableStacks, defaultStackId);
  const isInvalidInitialStack = !isStackSelectorTouched && !!initialStackId && !initialStack;

  let selectedStack: Stack = { id: initialStackId, name: initialStackId, machineTypes: [] };
  let availableStackOptions = availableStacks.map(StackService.toStackOption);

  if (isStackSelectorTouched) {
    selectedStack = StackService.selectStack(availableStacks, selectedStackId, defaultStackId) ?? selectedStack;
  } else if (initialStackId) {
    selectedStack = initialStack ?? selectedStack;
  } else if (defaultStack) {
    selectedStack = { ...defaultStack, id: '' };
  }

  if (defaultStack) {
    availableStackOptions = [{ value: '', label: `Default (${defaultStack.name})` }, ...availableStackOptions];
  }

  if (isInvalidInitialStack) {
    availableStackOptions = [...availableStackOptions, { value: initialStackId, label: initialStackId }];
  }

  const isMachineTypeSelectionDisabled = Boolean(hasDedicatedMachine || hasSelfHostedRunner);
  const selectableMachineTypes = MachineTypeService.getMachinesOfStack(availableMachineTypes, selectedStack);
  const initialMachineType = MachineTypeService.getMachineById(availableMachineTypes, initialMachineTypeId);
  const defaultMachineType = MachineTypeService.getMachineById(selectableMachineTypes, defaultMachineId);
  const isInvalidInitialMachineType =
    !isMachineTypeSelectorTouched && !!initialMachineTypeId && !initialMachineType && !isMachineTypeSelectionDisabled;

  let selectedMachineType = createMachineType({ id: initialMachineTypeId, name: initialMachineTypeId });
  let availableMachineTypeOptions = selectableMachineTypes.map(MachineTypeService.toMachineOption);

  if (hasDedicatedMachine) {
    selectedMachineType = createMachineType({ id: initialMachineTypeId, name: 'Dedicated machine' });
    availableMachineTypeOptions = [{ value: initialMachineTypeId, label: 'Dedicated machine' }];
  } else if (hasSelfHostedRunner) {
    selectedMachineType = createMachineType({ id: initialMachineTypeId, name: 'Self-hosted runner' });
    availableMachineTypeOptions = [{ value: initialMachineTypeId, label: 'Self-hosted runner' }];
  } else if (isMachineTypeSelectorTouched) {
    selectedMachineType =
      MachineTypeService.selectMachineType(selectableMachineTypes, selectedMachineTypeId, defaultMachineId, false) ??
      selectedMachineType;
  } else if (initialMachineTypeId) {
    selectedMachineType =
      MachineTypeService.getMachineById(selectableMachineTypes, initialMachineTypeId) ?? selectedMachineType;
  } else if (defaultMachineType) {
    selectedMachineType = { ...defaultMachineType, id: '' };
  }

  if (!isMachineTypeSelectionDisabled && defaultMachineType) {
    availableMachineTypeOptions = [
      { value: '', label: `Default (${defaultMachineType.name})` },
      ...availableMachineTypeOptions,
    ];
  }

  if (isInvalidInitialMachineType) {
    availableMachineTypeOptions = [
      ...availableMachineTypeOptions,
      { value: initialMachineTypeId, label: initialMachineTypeId },
    ];
  }

  return {
    selectedStack,
    availableStackOptions,
    isInvalidInitialStack,
    selectedMachineType,
    availableMachineTypeOptions,
    isInvalidInitialMachineType,
    isMachineTypeSelectionDisabled,
  };
}

export default { selectStackAndMachine };
