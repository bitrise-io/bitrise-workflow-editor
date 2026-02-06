import { uniq } from 'es-toolkit';
import { Document, isMap, YAMLMap } from 'yaml';

import { ContainerModel, Containers } from '@/core/models/BitriseYml';
import {
  Container,
  ContainerField,
  ContainerFieldValue,
  ContainerReferenceField,
  ContainerType,
  CredentialField,
  CredentialFieldValue,
} from '@/core/models/Container';
import StepService from '@/core/services/StepService';
import WorkflowService from '@/core/services/WorkflowService';
import { updateBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';

const ExecutionContainerWildcardRefPath = ['workflows', '*', 'steps', '*', '*', ContainerReferenceField.Execution];
const ServiceContainerWildcardRefPath = ['workflows', '*', 'steps', '*', '*', ContainerReferenceField.Service, '*'];

function addContainerReference(workflowId: string, stepIndex: number, containerId: string) {
  updateBitriseYmlDocument(({ doc }) => {
    WorkflowService.getWorkflowOrThrowError(workflowId, doc);
    const stepData = getStepDataOrThrowError(doc, workflowId, stepIndex);
    const container = getContainerOrThrowError(containerId, doc);

    const type = container.getIn(['type']) as string;

    if (type === ContainerType.Execution) {
      YmlUtils.setIn(stepData, [ContainerReferenceField.Execution], containerId);
    }

    if (type === ContainerType.Service) {
      if (YmlUtils.isInSeq(stepData, [ContainerReferenceField.Service], containerId)) {
        throw new Error(`Service container '${containerId}' is already added to the step`);
      }
      YmlUtils.addIn(stepData, [ContainerReferenceField.Service], containerId);
    }

    return doc;
  });
}

function cleanContainerData(container: ContainerModel) {
  const { type, image, credentials, ports, envs, options } = container;

  const containerData: ContainerModel = { type, image };

  if (ports && ports.length > 0) {
    containerData.ports = ports;
  }

  const filteredCredentials = filterCredentials(credentials);
  if (filteredCredentials) {
    containerData.credentials = filteredCredentials as ContainerModel['credentials'];
  }

  if (envs && envs.length > 0) {
    containerData.envs = envs;
  }

  if (options) {
    containerData.options = options;
  }

  return containerData;
}

function createContainer(id: string, container: ContainerModel) {
  updateBitriseYmlDocument(({ doc }) => {
    if (doc.hasIn(['containers', id])) {
      throw new Error(`Container '${id}' already exists`);
    }

    const containerData = cleanContainerData(container);

    YmlUtils.setIn(doc, ['containers', id], containerData);
    return doc;
  });
}

function deleteContainer(id: string) {
  updateBitriseYmlDocument(({ doc }) => {
    getContainerOrThrowError(id, doc);

    YmlUtils.deleteByPath(doc, ['containers', id]);

    const keep = ['workflows', '*', 'steps', '*', '*'];
    YmlUtils.deleteByValue(doc, ExecutionContainerWildcardRefPath, id, keep);
    YmlUtils.deleteByPath(doc, [...ExecutionContainerWildcardRefPath, id], keep);
    YmlUtils.deleteByValue(doc, ServiceContainerWildcardRefPath, id, keep);
    YmlUtils.deleteByPath(doc, [...ServiceContainerWildcardRefPath, id], keep);

    return doc;
  });
}

function removeContainerReference(workflowId: string, stepIndex: number, containerId: string) {
  updateBitriseYmlDocument(({ doc }) => {
    WorkflowService.getWorkflowOrThrowError(workflowId, doc);
    const stepData = getStepDataOrThrowError(doc, workflowId, stepIndex);

    YmlUtils.deleteByValue(stepData, [ContainerReferenceField.Execution], containerId);
    YmlUtils.deleteByValue(stepData, [ContainerReferenceField.Service, '*'], containerId);

    return doc;
  });
}

function filterCredentials(credentials: ContainerModel['credentials']) {
  if (!credentials) {
    return undefined;
  }

  const filteredCredentials = Object.entries(credentials)
    .filter(([_, value]) => !!value)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

  return Object.keys(filteredCredentials).length > 0 ? filteredCredentials : undefined;
}

const identity = (_: Container) => true;

function getAllContainers(containers: Containers, selector: (container: Container) => boolean = identity): Container[] {
  return Object.entries(containers)
    .map(([id, userValues]) => ({ id, userValues }) as Container)
    .filter(selector);
}

function getContainerOrThrowError(id: string, doc: Document) {
  const container = YmlUtils.getMapIn(doc, ['containers', id]);

  if (!container) {
    throw new Error(`Container ${id} not found. Ensure that the container exists in the 'containers' section.`);
  }

  return container;
}

function getStepDataOrThrowError(doc: Document, workflowId: string, stepIndex: number): YAMLMap {
  const step = StepService.getStepOrThrowError('workflows', workflowId, stepIndex, doc);
  const stepData = step.items[0]?.value;
  if (!isMap(stepData)) {
    throw new Error(`Invalid step data at index ${stepIndex} in workflow '${workflowId}'`);
  }

  return stepData;
}

function getWorkflowsUsingContainer(doc: Document, containerId: string): string[] {
  const possibleReferencePaths = [
    ...YmlUtils.getMatchingPaths(doc, ExecutionContainerWildcardRefPath),
    ...YmlUtils.getMatchingPaths(doc, ServiceContainerWildcardRefPath),
  ];
  const paths = possibleReferencePaths.filter(([path]) => {
    const node = doc.getIn(path);
    if (YmlUtils.isEqualValues(node, containerId)) {
      return true;
    }

    if (isMap(node) && node.items.length > 0) {
      const key = String(node.items[0]?.key);
      return key === containerId;
    }

    return false;
  });

  return uniq(paths.map((path) => String(path[0][1])));
}

function updateContainerId(id: Container['id'], newId: Container['id']) {
  updateBitriseYmlDocument(({ doc }) => {
    getContainerOrThrowError(id, doc);

    if (id === newId) {
      return doc;
    }

    if (doc.hasIn(['containers', newId])) {
      throw new Error(`Container '${newId}' already exists.`);
    }

    YmlUtils.updateKeyByPath(doc, ['containers', id], newId);
    YmlUtils.updateValueByValue(doc, ExecutionContainerWildcardRefPath, id, newId);
    YmlUtils.updateValueByValue(doc, ServiceContainerWildcardRefPath, id, newId);

    return doc;
  });
}

function updateContainerField<T extends ContainerField>(id: Container['id'], field: T, value: ContainerFieldValue<T>) {
  updateBitriseYmlDocument(({ doc }) => {
    const container = getContainerOrThrowError(id, doc);

    const shouldDelete = Array.isArray(value) && value.length === 0;

    if (!value || shouldDelete) {
      YmlUtils.deleteByPath(container, [field]);
    } else {
      YmlUtils.setIn(container, [field], value);
    }

    return doc;
  });
}

function updateCredentialField<T extends CredentialField>(
  id: Container['id'],
  field: T,
  value: CredentialFieldValue<T>,
) {
  updateBitriseYmlDocument(({ doc }) => {
    const container = getContainerOrThrowError(id, doc);

    if (value) {
      YmlUtils.setIn(container, ['credentials', field], value);
    } else {
      YmlUtils.deleteByPath(container, ['credentials', field]);
    }

    return doc;
  });
}

function updateContainerReferenceRecreate(
  workflowId: string,
  stepIndex: number,
  type: ContainerType,
  containerId: string,
  recreate: boolean,
) {
  updateBitriseYmlDocument(({ doc }) => {
    WorkflowService.getWorkflowOrThrowError(workflowId, doc);
    const stepData = getStepDataOrThrowError(doc, workflowId, stepIndex);

    const field =
      type === ContainerType.Execution ? ContainerReferenceField.Execution : ContainerReferenceField.Service;
    if (!stepData.has(field)) {
      throw new Error(`No '${field}' found on step at index ${stepIndex}`);
    }

    const newValue = recreate ? { [containerId]: { recreate: true } } : containerId;
    const path = field === ContainerReferenceField.Execution ? [field] : [field, '*'];

    YmlUtils.updateValueByPredicate(
      stepData,
      path,
      (node) => {
        if (YmlUtils.isEqualValues(node, containerId)) {
          return true;
        }
        if (isMap(node) && node.items.length > 0) {
          const key = String(node.items[0]?.key);
          return key === containerId;
        }
        return false;
      },
      newValue,
    );

    return doc;
  });
}

const CONTAINER_NAME_REGEX = /^[A-Za-z0-9-_.]+$/;

function sanitizeName(value: string) {
  return value.replace(/[^a-zA-Z0-9_.-]/g, '').trim();
}

function validateName(containerId: string, initialContainerName: string, containerNames: string[]) {
  if (!containerId.trim()) {
    return 'Unique id is required';
  }

  if (!CONTAINER_NAME_REGEX.test(containerId)) {
    return 'Unique id must only contain letters, numbers, dashes, underscores or periods';
  }

  if (containerId !== initialContainerName && containerNames?.includes(containerId)) {
    return 'Id should be unique';
  }

  return true;
}

function validatePorts(ports: Container['userValues']['ports']) {
  if (!ports || ports.length === 0) {
    return true;
  }

  const PORT_REGEX = /^\d+:\d+$/;
  const invalidPorts = ports.filter((port) => !PORT_REGEX.test(port));

  if (invalidPorts.length > 0) {
    return 'Port mappings must be in the format [HostPort]:[ContainerPort] (e.g., 3000:3000)';
  }

  const portNumbers = ports.flatMap((port) => port.split(':').map(Number));
  const invalidPortNumbers = portNumbers.filter((num) => num < 1 || num > 65535);

  if (invalidPortNumbers.length > 0) {
    return 'Port numbers must be between 1 and 65535';
  }

  const hostPorts = ports.map((port) => port.split(':')[0]);
  const duplicateHostPorts = hostPorts.filter((port, index) => hostPorts.indexOf(port) !== index);

  if (duplicateHostPorts.length > 0) {
    return 'Host ports must be unique';
  }

  return true;
}

export default {
  addContainerReference,
  createContainer,
  deleteContainer,
  getAllContainers,
  getContainerOrThrowError,
  getWorkflowsUsingContainer,
  removeContainerReference,
  sanitizeName,
  updateContainerId,
  updateContainerField,
  updateContainerReferenceRecreate,
  updateCredentialField,
  validateName,
  validatePorts,
};
