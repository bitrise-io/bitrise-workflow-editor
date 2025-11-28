import { toMerged } from 'es-toolkit';
import { PartialDeep } from 'type-fest';
import { Document } from 'yaml';

import StacksAndMachinesApi from '../api/StacksAndMachinesApi';
import { Meta } from '../models/BitriseYml';
import {
  MachineRegionName,
  MachineType,
  MachineTypeOption,
  MachineTypeOptionGroup,
  Stack,
  StackOption,
  StackOptionGroup,
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
  isInvalidMachineType: boolean;
  isMachineTypeSelectionDisabled: boolean;
  selectedMachineType: MachineTypeWithValue;
  stackOptionGroups: StackOptionGroup[];
  machineOptionGroups: MachineTypeOptionGroup[];
};

function getStackById(stacks: Stack[], id: string): Stack | undefined {
  return stacks.find((stack) => stack.id === id);
}

function isSelfHostedStack(stack: Stack) {
  return stack.id.startsWith('agent');
}

function getOsOfStack(stack: Stack): string {
  switch (stack.os) {
    case 'linux':
      return 'linux';
    case 'macos':
      // This is a workaround to keep it compatible with other data structures returned by the API.
      // The `stacks_and_machines` endpoint returns machine types grouped by OS, but it uses `osx` as the key for macOS at the moment.
      // It should be cleaned up once the API response uses `macos` everywhere.
      return 'osx';
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
    os: stack.os,
  };
}

function getMachineById(machines: MachineType[], id?: string): MachineType | undefined {
  return machines.find((m) => m.id === id);
}

export const toMachineTypeLabel = (machineType: MachineType) => {
  let label = `${machineType.name}`;

  if (machineType.creditPerMinute) {
    label += ` (${machineType.creditPerMinute} credits/min)`;
  }

  return label;
};

export const machineTypeHardwareVariesByRegion = (machineType: MachineType) => {
  const { availableInRegions } = machineType;

  const machineTypeInfoTexts = Object.values(availableInRegions);
  return machineTypeInfoTexts.some((machineTypeInfoText) => {
    return machineTypeInfoText !== machineTypeInfoTexts[0];
  });
};

function toMachineOption(machine: MachineType, region?: MachineRegionName): MachineTypeOption {
  let subtitle = '';
  if (!region && machineTypeHardwareVariesByRegion(machine)) {
    subtitle = Object.entries(machine.availableInRegions)
      .map(([regionName, machineTypeInfoText]) => {
        return `${regionName}: ${machineTypeInfoText}`;
      })
      .join(`\n`);
  } else {
    subtitle =
      machine.availableInRegions[region || (Object.keys(machine.availableInRegions)[0] as MachineRegionName)] || '';
  }

  return {
    isDisabled: machine.isPromoted,
    label: toMachineTypeLabel(machine),
    os: machine.os,
    subtitle,
    value: machine.id,
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
    availableInRegions: {},
    availableOnStacks: [],
    creditPerMinute: 0,
    id: '',
    value: '',
    name: '',
    isPromoted: false,
    os: 'unknown',
  };

  return toMerged(base, override || {}) as MachineTypeWithValue;
}

function prepareStackAndMachineSelectionData(props: SelectStackAndMachineProps): SelectStackAndMachineResult {
  const {
    availableMachines = [],
    availableStacks = [],
    projectStackId = '',
    selectedStackId,
    selectedMachineTypeId,
    projectMachineTypeId = '',
    runningBuildsOnPrivateCloud,
    withoutDefaultOptions = false,
    defaultMachines = [],
    groupedStacks = [],
    groupedMachines = [],
    region,
  } = props;

  const result: SelectStackAndMachineResult = {
    selectedStack: createStack({
      id: selectedStackId,
      name: selectedStackId,
      value: selectedStackId,
      status: 'unknown',
    }),
    selectedMachineType: createMachineType({
      id: selectedMachineTypeId,
      name: selectedMachineTypeId,
      value: selectedMachineTypeId,
    }),
    isInvalidStack: false,
    isInvalidMachineType: false,
    isMachineTypeSelectionDisabled: false,
    stackOptionGroups: groupedStacks.map((group) => ({
      label: group.label,
      status: group.status,
      options: group.stacks.map(toStackOption),
    })),
    machineOptionGroups: groupedMachines.map((group) => ({
      label: group.label,
      options: group.machines.map((m) => toMachineOption(m, region)),
    })),
  };

  // Stack selection logic
  const defaultStack = getStackById(availableStacks, projectStackId);
  const selectedStack = getStackById(availableStacks, selectedStackId);

  if (defaultStack && !withoutDefaultOptions) {
    result.stackOptionGroups.unshift({
      label: 'Default Stack',
      status: defaultStack.status,
      options: [
        {
          value: '',
          label: `Default - ${defaultStack.name}`,
          status: defaultStack.status,
          os: defaultStack.os,
        },
      ],
    });
  }

  const isInvalidStack = !!selectedStackId && !selectedStack;
  const isInvalidDefaultStack = !!projectStackId && !defaultStack;

  if (isInvalidStack || isInvalidDefaultStack) {
    result.isInvalidStack = true;
    // Create the invalid dummy Stack object
    let name: string;
    if (isInvalidStack) {
      name = `Invalid Stack - ${selectedStackId}`;
    } else {
      name = `Invalid Default Stack - ${projectStackId}`;
    }
    result.selectedStack = createStack({
      id: selectedStackId,
      value: selectedStackId,
      name,
      status: 'unknown',
      os: 'unknown',
    });

    result.stackOptionGroups.unshift({
      label: 'Invalid Stack',
      status: 'unknown',
      options: [toStackOption(result.selectedStack)],
    });
  } else if (selectedStack) {
    result.selectedStack = { ...selectedStack, value: selectedStack.id };
  } else if (defaultStack) {
    result.selectedStack = { ...defaultStack, value: withoutDefaultOptions ? defaultStack.id : '' };
  }

  result.stackOptionGroups = result.stackOptionGroups.filter((group) => group.options.length > 0);
  result.machineOptionGroups = result.machineOptionGroups.map((group) => ({
    ...group,
    options: group.options.filter((option) => result.selectedStack.machineTypes.includes(option.value)),
  }));

  // Machine selection logic
  const selectableMachines = getMachinesOfStack(availableMachines, result.selectedStack);
  const selectableDefaultMachines = getMachinesOfStack(defaultMachines, result.selectedStack);

  // Self-hosted pool
  const isSelfHostedPoolSelected = isSelfHostedStack(result.selectedStack);
  if (isSelfHostedPoolSelected) {
    result.isMachineTypeSelectionDisabled = true;
    result.selectedMachineType = createMachineType({
      id: '',
      value: '',
      name: 'Self-Hosted Runner',
      os: result.selectedStack.os,
    });
    result.machineOptionGroups = [
      {
        label: 'Self-Hosted Runner',
        options: [toMachineOption(result.selectedMachineType, region)],
      },
    ];
    return result;
  }

  // Private cloud with no machines
  if (runningBuildsOnPrivateCloud && selectableMachines.length === 0) {
    result.isMachineTypeSelectionDisabled = true;
    result.selectedMachineType = createMachineType({
      id: '',
      value: '',
      name: 'Dedicated Machine',
      os: result.selectedStack.os,
    });
    result.machineOptionGroups = [
      {
        label: 'Dedicated Machine',
        options: [toMachineOption(result.selectedMachineType, region)],
      },
    ];
    return result;
  }

  const defaultMachineType = getMachineById(selectableMachines, projectMachineTypeId);
  const selectedMachineType = getMachineById(selectableMachines, selectedMachineTypeId);
  const osMachineId = selectableDefaultMachines.find((m) => m.os === result.selectedStack.os)?.id;
  const defaultMachineTypeOfOS = getMachineById(selectableDefaultMachines, osMachineId);

  const isInvalidMachineType = !!selectedMachineTypeId && !selectedMachineType;
  const isInvalidDefaultMachineType = !!projectMachineTypeId && !defaultMachineType;

  // Machine type options
  if (!withoutDefaultOptions && !isInvalidDefaultMachineType) {
    if (defaultMachineType) {
      result.machineOptionGroups.unshift({
        label: 'Default Machine',
        options: [
          {
            value: '',
            isDisabled: false,
            label: `Default - ${toMachineTypeLabel(defaultMachineType)}`,
            os: defaultMachineType.os,
            subtitle: '',
          },
        ],
      });
    } else if (defaultMachineTypeOfOS) {
      result.machineOptionGroups.unshift({
        label: `Default Machine`,
        options: [
          {
            value: '',
            isDisabled: false,
            label: `Default - ${toMachineTypeLabel(defaultMachineTypeOfOS)}`,
            os: defaultMachineTypeOfOS.os,
            subtitle: '',
          },
        ],
      });
    }
  }

  const isDefaultMachineTypeSelected = !selectedMachineType && !withoutDefaultOptions;

  if (
    isInvalidStack ||
    isInvalidDefaultStack ||
    isInvalidMachineType ||
    (isDefaultMachineTypeSelected && isInvalidDefaultMachineType)
  ) {
    result.isInvalidMachineType = true;
    // Create the invalid dummy MachineType object
    let name: string;
    if (isInvalidStack || isInvalidDefaultStack) {
      name = 'Invalid Machine';
    } else if (isInvalidMachineType) {
      name = `Invalid Machine - ${selectedMachineTypeId}`;
    } else {
      name = `Invalid Default Machine - ${projectMachineTypeId}`;
    }
    result.selectedMachineType = createMachineType({
      id: selectedMachineTypeId,
      value: selectedMachineTypeId,
      name,
      os: 'unknown',
    });

    // Add the invalid machine type to the available options
    result.machineOptionGroups.unshift({
      label: 'Invalid Machine',
      options: [toMachineOption(result.selectedMachineType, region)],
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
  result.machineOptionGroups = result.machineOptionGroups.filter((group) => group.options.length > 0);

  return result;
}

function changeStackAndMachine({
  stackId,
  machineTypeId,
  projectStackId,
  availableStacks,
  availableMachines,
  machineFallbackOptions,
}: {
  stackId: string;
  machineTypeId: string;
  projectStackId: string;
  availableStacks: Stack[];
  availableMachines: MachineType[];
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

  const selectableMachines = getMachinesOfStack(availableMachines, newStack ?? projectStack);
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
};
