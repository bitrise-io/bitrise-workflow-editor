import { groupBy, sortBy, toMerged } from 'es-toolkit';
import { PartialDeep } from 'type-fest';
import { Document } from 'yaml';

import StacksAndMachinesApi from '../api/StacksAndMachinesApi';
import { Meta } from '../models/BitriseYml';
import {
  MachineType,
  MachineTypeOption,
  Stack,
  STACK_STATUS_MAPPING,
  StackGroup,
  StackOption,
} from '../models/StackAndMachine';
import { bitriseYmlStore, updateBitriseYmlDocument } from '../stores/BitriseYmlStore';
import YmlUtils from '../utils/YmlUtils';
import WorkflowService from './WorkflowService';

type FieldKeys = keyof Required<Meta>['bitrise.io'];

enum StackAndMachineSource {
  Root = 'root',
  Workflow = 'workflow',
}

type StackWithValue = Stack & {
  value: string;
};

type MachineTypeWithValue = MachineType & {
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
  switch (stack.os) {
    case 'macos':
      // This is a workaround to keep it compatible with other data structures returned by the API.
      // The `stacks_and_machines` endpoint returns machine types grouped by OS, but it uses `osx` as the key for macOS at the moment.
      // It should be cleaned up once the API response uses `macos` everywhere.
      return 'osx';
    case 'linux':
      return 'linux';
    default:
      // Fallback to the first part of the stack ID
      return stack.id.split('-')[0];
  }
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
    status: stack.status,
  };
}

function groupStackOptionsByStatus(options: StackOption[]): StackGroup[] {
  const statusMap = groupBy(options, (o) => o.status);
  const groups: StackGroup[] = Object.entries(statusMap).map(([status, values]) => {
    return {
      status: status as StackOption['status'],
      label: STACK_STATUS_MAPPING[status as StackOption['status']].label,
      options: values,
    };
  });

  return sortBy(groups, [(group) => STACK_STATUS_MAPPING[group.status].order]);
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
    os: 'unknown',
    status: 'unknown',
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
    machineTypePromotion,
    runningBuildsOnPrivateCloud,
    withoutDefaultOptions = false,
  } = props;

  const result: SelectStackAndMachineResult = {
    selectedStack: createStack(),
    selectedMachineType: createMachineType(),
    availableStackOptions: availableStacks.map(toStackOption),
    availableMachineTypeOptions: availableMachineTypes.map(toMachineOption),
    promotedMachineTypeOptions: machineTypePromotion?.promotedMachineTypes.map(toMachineOption) ?? [],
    machineTypePromotionMode: machineTypePromotion?.mode,
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
        status: defaultStack.status,
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
      status: 'unknown',
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

  result.promotedMachineTypeOptions = (machineTypePromotion?.promotedMachineTypes ?? [])
    .filter((machine) => {
      if (machine.osId !== selectedStackOS) {
        return false;
      }

      if (!machine.availableOnStacks) {
        return true;
      }

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

function validateSourceId(
  source?: StackAndMachineSource,
  sourceId?: string,
  doc = bitriseYmlStore.getState().ymlDocument,
) {
  if (source === StackAndMachineSource.Workflow && !sourceId) {
    throw new Error('sourceId is required when source is Workflow');
  }

  if (source === StackAndMachineSource.Workflow && sourceId) {
    WorkflowService.getWorkflowOrThrowError(sourceId, doc);
  }
}

function getMetaPath(source: StackAndMachineSource, sourceId?: string, field?: FieldKeys) {
  const path = ['meta', 'bitrise.io'];

  if (source === StackAndMachineSource.Workflow && sourceId) {
    path.unshift('workflows', sourceId);
  }

  if (field) {
    path.push(field);
  }
  return path;
}

function updateFieldValue(
  doc: Document,
  field: FieldKeys,
  value: string,
  source: StackAndMachineSource,
  sourceId?: string,
) {
  validateSourceId(source, sourceId, doc);

  const path = getMetaPath(source, sourceId);
  const meta = YmlUtils.getMapIn(doc, path, true);

  if (value) {
    YmlUtils.setIn(meta, [field], value);
  } else {
    YmlUtils.deleteByPath(doc, [...path, field], path.slice(0, -2));
  }
}

function updateStackAndMachine(
  value: { stackId?: string; machineTypeId?: string; stackRollbackVersion?: string },
  source: StackAndMachineSource,
  sourceId?: string,
) {
  updateBitriseYmlDocument(({ doc }) => {
    updateFieldValue(doc, 'stack', value.stackId || '', source, sourceId);
    updateFieldValue(doc, 'machine_type_id', value.machineTypeId || '', source, sourceId);
    updateFieldValue(doc, 'stack_rollback_version', value.stackRollbackVersion || '', source, sourceId);
    return doc;
  });
}

function updateLicensePoolId(licensePoolId: string, source: StackAndMachineSource, sourceId?: string) {
  updateBitriseYmlDocument(({ doc }) => {
    updateFieldValue(doc, 'license_pool_id', licensePoolId, source, sourceId);
    return doc;
  });
}

export { MachineTypeWithValue, StackAndMachineSource, StackWithValue };
export default {
  changeStackAndMachine,
  prepareStackAndMachineSelectionData,
  toStackOption,
  toMachineOption,
  getStackById,
  getMachinesOfStack,
  updateStackAndMachine,
  updateLicensePoolId,
  groupStackOptionsByStatus,
};
