import { uniq } from 'es-toolkit';
import { Document, isMap, YAMLMap } from 'yaml';

import { ContainerModel, Containers } from '@/core/models/BitriseYml';
import { Container, ContainerReference, ContainerReferenceField, ContainerType } from '@/core/models/Container';
import StepBundleService from '@/core/services/StepBundleService';
import StepService from '@/core/services/StepService';
import { updateBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';

const ExecutionContainerWildcardRefPath = ['workflows', '*', 'steps', '*', '*', ContainerReferenceField.Execution];
const ServiceContainerWildcardRefPath = ['workflows', '*', 'steps', '*', '*', ContainerReferenceField.Service, '*'];

function getContainerOrThrowError(id: string, doc: Document) {
  const container = YmlUtils.getMapIn(doc, ['containers', id]);

  if (!container) {
    throw new Error(`Container ${id} not found. Ensure that the container exists in the 'containers' section.`);
  }

  return container;
}

function getStepDataOrThrowError(
  doc: Document,
  source: 'workflows' | 'step_bundles',
  sourceId: string,
  stepIndex: number,
): YAMLMap {
  const step = StepService.getStepOrThrowError(source, sourceId, stepIndex, doc);
  const stepData = step.items[0]?.value;
  if (!isMap(stepData)) {
    throw new Error(`Invalid step data at index ${stepIndex} in ${source} '${sourceId}'`);
  }

  return stepData;
}

function addContainerReference(
  source: 'workflows' | 'step_bundles',
  sourceId: string,
  index: number,
  containerId: string,
  type: ContainerType,
) {
  updateBitriseYmlDocument(({ doc }) => {
    getContainerOrThrowError(containerId, doc);

    let yamlMap;
    if (index === -1) {
      yamlMap = StepBundleService.getStepBundleOrThrowError(doc, sourceId);
    } else {
      yamlMap = getStepDataOrThrowError(doc, source, sourceId, index);
    }

    if (type === ContainerType.Execution) {
      YmlUtils.setIn(yamlMap, [ContainerReferenceField.Execution], containerId);
    }

    if (type === ContainerType.Service) {
      if (YmlUtils.isInSeq(yamlMap, [ContainerReferenceField.Service], containerId)) {
        throw new Error(`Service container '${containerId}' is already added to the step`);
      }
      YmlUtils.addIn(yamlMap, [ContainerReferenceField.Service], containerId);
    }

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

function removeContainerReference(
  source: 'workflows' | 'step_bundles',
  sourceId: string,
  stepIndex: number,
  containerId: string,
  type: ContainerType,
) {
  updateBitriseYmlDocument(({ doc }) => {
    let yamlMap;
    if (stepIndex === -1) {
      yamlMap = StepBundleService.getStepBundleOrThrowError(doc, sourceId);
    } else {
      yamlMap = getStepDataOrThrowError(doc, source, sourceId, stepIndex);
    }

    if (type === ContainerType.Execution) {
      YmlUtils.deleteByValue(yamlMap, [ContainerReferenceField.Execution], containerId);
    }

    if (type === ContainerType.Service) {
      YmlUtils.deleteByValue(yamlMap, [ContainerReferenceField.Service, '*'], containerId);
    }

    YmlUtils.deleteByPredicate(yamlMap, [ContainerReferenceField.Execution], (node) => {
      if (isMap(node) && node.items.length > 0) {
        const key = String(node.items[0]?.key);
        return key === containerId;
      }
      return false;
    });
    YmlUtils.deleteByPredicate(yamlMap, [ContainerReferenceField.Service, '*'], (node) => {
      if (isMap(node) && node.items.length > 0) {
        const key = String(node.items[0]?.key);
        return key === containerId;
      }
      return false;
    });

    return doc;
  });
}

const identity = (_: Container) => true;

function getAllContainers(containers: Containers, selector: (container: Container) => boolean = identity): Container[] {
  return Object.entries(containers)
    .map(([id, userValues]) => ({ id, userValues }) as Container)
    .filter(selector);
}

type ContainerReferenceValue = string | Record<string, { recreate?: boolean }>;

function getContainerReferences(type: ContainerType, yamlMap: YAMLMap): ContainerReference[] | undefined {
  const parseReference = (value: ContainerReferenceValue): ContainerReference => {
    if (typeof value === 'string') {
      return { id: value, recreate: false };
    }

    const entries = Object.entries(value);
    if (entries.length > 0) {
      const [containerId, config] = entries[0];
      const recreate = config?.recreate === true;
      return { id: containerId, recreate };
    }

    return { id: String(value), recreate: false };
  };

  if (type === ContainerType.Execution) {
    const executionContainerNode = yamlMap.get(ContainerReferenceField.Execution);
    if (!executionContainerNode) {
      return undefined;
    }
    const executionContainer =
      typeof executionContainerNode === 'string'
        ? executionContainerNode
        : isMap(executionContainerNode)
          ? executionContainerNode.toJSON()
          : executionContainerNode;
    const ref = parseReference(executionContainer as ContainerReferenceValue);
    return ref ? [ref] : undefined;
  }

  if (type === ContainerType.Service) {
    const serviceContainers = YmlUtils.getSeqIn(yamlMap, [ContainerReferenceField.Service])?.toJSON() as
      | ContainerReferenceValue[]
      | undefined;
    if (serviceContainers && serviceContainers.length > 0) {
      return serviceContainers.map(parseReference);
    }

    return undefined;
  }

  return undefined;
}

function getContainerReferencesFromStepBundleDefinition(sourceId: string, type: ContainerType, doc: Document) {
  const yamlMap = StepBundleService.getStepBundleOrThrowError(doc, sourceId);
  return getContainerReferences(type, yamlMap);
}

function getContainerReferenceFromInstance(
  source: 'workflows' | 'step_bundles',
  sourceId: string,
  stepIndex: number,
  type: ContainerType,
  doc: Document,
) {
  const yamlMap = getStepDataOrThrowError(doc, source, sourceId, stepIndex);
  return getContainerReferences(type, yamlMap);
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

function updateCredentials(container: YAMLMap, newCredentials: ContainerModel['credentials']) {
  const oldCredentials = container.get('credentials');
  const hasOldCredentials = oldCredentials && isMap(oldCredentials);
  const filteredNewCredentials = filterCredentials(newCredentials);

  if (!filteredNewCredentials) {
    return;
  }

  if (!filteredNewCredentials && hasOldCredentials) {
    YmlUtils.deleteByPath(container, ['credentials']);
  }

  if (hasOldCredentials) {
    const oldCredKeys = oldCredentials.items.map((item) => String(item.key));
    const newCredKeys = Object.keys(filteredNewCredentials);

    // Remove old keys that are not in new credentials
    const keysToRemove = oldCredKeys.filter((key) => !newCredKeys.includes(key));
    keysToRemove.forEach((key) => {
      YmlUtils.deleteByPath(container, ['credentials', key]);
    });

    // Update or add credential keys
    Object.entries(filteredNewCredentials).forEach(([key, value]) => {
      YmlUtils.setIn(container, ['credentials', key], value);
    });
    return;
  }

  // Add new credentials if there were no credentials before
  YmlUtils.setIn(container, ['credentials'], filteredNewCredentials);
}

function updateContainer(id: Container['id'], newContainer: ContainerModel) {
  updateBitriseYmlDocument(({ doc }) => {
    const container = getContainerOrThrowError(id, doc);

    const containerData = cleanContainerData(newContainer);
    const oldKeys = Object.keys(container.toJSON());
    const newKeys = Object.keys(containerData);

    const removedKeys = oldKeys.filter((key) => !newKeys.includes(key));
    const addedKeys = newKeys.filter((key) => !oldKeys.includes(key));
    const updatedKeys = newKeys.filter((key) => oldKeys.includes(key));

    // Remove keys that are not in the new container
    removedKeys.forEach((key) => {
      YmlUtils.deleteByPath(container, [key]);
    });

    // Update and add keys
    [...updatedKeys, ...addedKeys].forEach((key) => {
      const value = containerData[key as keyof ContainerModel];

      if (key === 'credentials') {
        updateCredentials(container, newContainer.credentials);
      } else {
        YmlUtils.setIn(container, [key], value);
      }
    });

    return doc;
  });
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

    // Update container IDs in recreate flag references
    YmlUtils.updateKeyByPath(doc, [...ExecutionContainerWildcardRefPath, id], newId);
    YmlUtils.updateKeyByPath(doc, [...ServiceContainerWildcardRefPath, id], newId);

    return doc;
  });
}

function updateContainerReferenceRecreate(
  source: 'workflows' | 'step_bundles',
  sourceId: string,
  stepIndex: number,
  containerId: string,
  type: ContainerType,
  recreate: boolean,
) {
  updateBitriseYmlDocument(({ doc }) => {
    let yamlMap;
    if (stepIndex === -1) {
      yamlMap = StepBundleService.getStepBundleOrThrowError(doc, sourceId);
    } else {
      yamlMap = getStepDataOrThrowError(doc, source, sourceId, stepIndex);
    }

    const field =
      type === ContainerType.Execution ? ContainerReferenceField.Execution : ContainerReferenceField.Service;
    if (!yamlMap.has(field)) {
      throw new Error(`No '${field}' found on step at index ${stepIndex}`);
    }

    const newValue = recreate ? { [containerId]: { recreate: true } } : containerId;
    const path = field === ContainerReferenceField.Execution ? [field] : [field, '*'];

    YmlUtils.updateValueByPredicate(
      yamlMap,
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

function sanitizePort(port: string): string {
  const sanitize = (value: string) => value.replace(/^0+(?=\d)/, '');

  if (port.includes(':')) {
    const [host, container] = port.split(':');

    if (!host || !container) {
      return sanitize(port);
    }

    return `${sanitize(host)}:${sanitize(container)}`;
  }

  return sanitize(port);
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
  getContainerReferences,
  getContainerReferenceFromInstance,
  getContainerReferencesFromStepBundleDefinition,
  getWorkflowsUsingContainer,
  sanitizePort,
  removeContainerReference,
  sanitizeName,
  updateContainer,
  updateContainerId,
  updateContainerReferenceRecreate,
  validateName,
  validatePorts,
};
