import { uniq } from 'es-toolkit';
import { Document, isMap, isScalar, YAMLMap } from 'yaml';

import { ContainerModel, Containers } from '@/core/models/BitriseYml';
import { Container, ContainerReference, ContainerReferenceField, ContainerType } from '@/core/models/Container';
import StepBundleService from '@/core/services/StepBundleService';
import StepService from '@/core/services/StepService';
import { updateBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';

const ExecutionContainerWildcardRefPath = ['workflows', '*', 'steps', '*', '*', ContainerReferenceField.Execution];
const ServiceContainerWildcardRefPath = ['workflows', '*', 'steps', '*', '*', ContainerReferenceField.Service, '*'];
const StepBundleExecutionContainerWildcardRefPath = [
  'step_bundles',
  '*',
  'steps',
  '*',
  '*',
  ContainerReferenceField.Execution,
];
const StepBundleServiceContainerWildcardRefPath = [
  'step_bundles',
  '*',
  'steps',
  '*',
  '*',
  ContainerReferenceField.Service,
  '*',
];
const StepBundleDefinitionExecutionContainerWildcardRefPath = ['step_bundles', '*', ContainerReferenceField.Execution];
const StepBundleDefinitionServiceContainerWildcardRefPath = ['step_bundles', '*', ContainerReferenceField.Service, '*'];

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
  const pair = step.items[0];

  if (!pair) {
    throw new Error(`Invalid step data at index ${stepIndex} in ${source} '${sourceId}'`);
  }

  if (isMap(pair.value)) {
    return pair.value;
  }

  if (pair.value == null || (isScalar(pair.value) && pair.value.value == null)) {
    const emptyMap = new YAMLMap();
    pair.value = emptyMap;
    return emptyMap;
  }

  throw new Error(`Invalid step data at index ${stepIndex} in ${source} '${sourceId}'`);
}

function addContainerReference(
  source: 'workflows' | 'step_bundles',
  sourceId: string,
  stepIndex: number,
  containerId: string,
) {
  updateBitriseYmlDocument(({ doc }) => {
    const container = getContainerOrThrowError(containerId, doc);
    const type = container.get('type') as ContainerType;

    let yamlMap;
    if (source === 'step_bundles' && stepIndex === -1) {
      yamlMap = StepBundleService.getStepBundleOrThrowError(doc, sourceId);
    } else {
      yamlMap = getStepDataOrThrowError(doc, source, sourceId, stepIndex);
    }

    if (type === ContainerType.Execution) {
      YmlUtils.setIn(yamlMap, [ContainerReferenceField.Execution], containerId);
    }

    if (type === ContainerType.Service) {
      if (YmlUtils.isInSeq(yamlMap, [ContainerReferenceField.Service], containerId)) {
        const context = stepIndex === -1 ? `step bundle '${sourceId}'` : 'the step';
        throw new Error(`Service container '${containerId}' is already added to ${context}`);
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

    const keepWorkflow = ['workflows', '*', 'steps', '*', '*'];
    YmlUtils.deleteByValue(doc, ExecutionContainerWildcardRefPath, id, keepWorkflow);
    YmlUtils.deleteByPath(doc, [...ExecutionContainerWildcardRefPath, id], keepWorkflow);
    YmlUtils.deleteByValue(doc, ServiceContainerWildcardRefPath, id, keepWorkflow);
    YmlUtils.deleteByPath(doc, [...ServiceContainerWildcardRefPath, id], keepWorkflow);

    const keepStepBundle = ['step_bundles', '*', 'steps', '*', '*'];
    YmlUtils.deleteByValue(doc, StepBundleExecutionContainerWildcardRefPath, id, keepStepBundle);
    YmlUtils.deleteByPath(doc, [...StepBundleExecutionContainerWildcardRefPath, id], keepStepBundle);
    YmlUtils.deleteByValue(doc, StepBundleServiceContainerWildcardRefPath, id, keepStepBundle);
    YmlUtils.deleteByPath(doc, [...StepBundleServiceContainerWildcardRefPath, id], keepStepBundle);

    const keepStepBundleDefinition = ['step_bundles', '*'];
    YmlUtils.deleteByValue(doc, StepBundleDefinitionExecutionContainerWildcardRefPath, id, keepStepBundleDefinition);
    YmlUtils.deleteByPath(
      doc,
      [...StepBundleDefinitionExecutionContainerWildcardRefPath, id],
      keepStepBundleDefinition,
    );
    YmlUtils.deleteByValue(doc, StepBundleDefinitionServiceContainerWildcardRefPath, id, keepStepBundleDefinition);
    YmlUtils.deleteByPath(doc, [...StepBundleDefinitionServiceContainerWildcardRefPath, id], keepStepBundleDefinition);

    return doc;
  });
}

function removeContainerReference(
  source: 'workflows' | 'step_bundles',
  sourceId: string,
  stepIndex: number,
  containerId: string,
) {
  updateBitriseYmlDocument(({ doc }) => {
    let yamlMap;
    if (source === 'step_bundles' && stepIndex === -1) {
      yamlMap = StepBundleService.getStepBundleOrThrowError(doc, sourceId);
    } else {
      yamlMap = getStepDataOrThrowError(doc, source, sourceId, stepIndex);
    }

    YmlUtils.deleteByValue(yamlMap, [ContainerReferenceField.Execution], containerId, []);
    YmlUtils.deleteByPath(yamlMap, [ContainerReferenceField.Execution, containerId], []);

    YmlUtils.deleteByValue(yamlMap, [ContainerReferenceField.Service, '*'], containerId, []);
    YmlUtils.deleteByPath(yamlMap, [ContainerReferenceField.Service, '*', containerId], []);

    if (yamlMap.items.length === 0) {
      yamlMap.flow = true;
    }

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

function parseContainerReference(value: ContainerReferenceValue): ContainerReference {
  if (typeof value === 'string') {
    return { id: value, recreate: false };
  }

  const [containerId, config] = Object.entries(value)[0] ?? [];

  if (!containerId) {
    throw new Error(`Container not found. Ensure that the container exists in the 'containers' section.`);
  }

  return { id: containerId, recreate: config?.recreate === true };
}

function getContainerReferences(type: ContainerType, yamlMap: YAMLMap): ContainerReference[] | undefined {
  if (type === ContainerType.Execution) {
    const node = yamlMap.get(ContainerReferenceField.Execution);

    if (!node || (!isMap(node) && typeof node !== 'string')) {
      return undefined;
    }

    const value = isMap(node) ? node.toJSON() : node;
    return [parseContainerReference(value)];
  }

  if (type === ContainerType.Service) {
    const serviceContainers = YmlUtils.getSeqIn(yamlMap, [ContainerReferenceField.Service])?.toJSON() as
      | ContainerReferenceValue[]
      | undefined;

    if (serviceContainers && serviceContainers.length > 0) {
      return serviceContainers.map(parseContainerReference);
    }
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
  if (source === 'step_bundles' && stepIndex === -1) {
    return getContainerReferencesFromStepBundleDefinition(sourceId, type, doc);
  }
  const yamlMap = getStepDataOrThrowError(doc, source, sourceId, stepIndex);
  return getContainerReferences(type, yamlMap);
}

function referencesContainer(node: unknown, containerId: string): boolean {
  if (YmlUtils.isEqualValues(node, containerId)) {
    return true;
  }
  if (isMap(node) && node.items.length > 0) {
    return String(node.items[0]?.key) === containerId;
  }
  return false;
}

function getWorkflowsUsingContainer(doc: Document, containerId: string): string[] {
  const yml = doc.toJSON();

  // Workflows that directly reference the container in their steps
  const directWorkflowIds = [
    ...YmlUtils.getMatchingPaths(doc, ExecutionContainerWildcardRefPath),
    ...YmlUtils.getMatchingPaths(doc, ServiceContainerWildcardRefPath),
  ]
    .filter(([path]) => referencesContainer(doc.getIn(path), containerId))
    .map(([path]) => String(path[1]));

  // Step bundles that reference the container (definition-level or step-level)
  const stepBundleIds = uniq(
    [
      ...YmlUtils.getMatchingPaths(doc, StepBundleDefinitionExecutionContainerWildcardRefPath),
      ...YmlUtils.getMatchingPaths(doc, StepBundleDefinitionServiceContainerWildcardRefPath),
      ...YmlUtils.getMatchingPaths(doc, StepBundleExecutionContainerWildcardRefPath),
      ...YmlUtils.getMatchingPaths(doc, StepBundleServiceContainerWildcardRefPath),
    ]
      .filter(([path]) => referencesContainer(doc.getIn(path), containerId))
      .map(([path]) => String(path[1])),
  );

  const workflows = yml?.workflows ?? {};
  const stepBundles = yml?.step_bundles ?? {};
  const workflowsFromStepBundles = stepBundleIds.flatMap((stepBundleId) =>
    StepBundleService.getDependantWorkflows(workflows, StepBundleService.idToCvs(stepBundleId), stepBundles),
  );

  return uniq([...directWorkflowIds, ...workflowsFromStepBundles]);
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
  recreate: boolean,
) {
  updateBitriseYmlDocument(({ doc }) => {
    let yamlMap;
    if (source === 'step_bundles' && stepIndex === -1) {
      yamlMap = StepBundleService.getStepBundleOrThrowError(doc, sourceId);
    } else {
      yamlMap = getStepDataOrThrowError(doc, source, sourceId, stepIndex);
    }

    const predicate = (node: unknown) => {
      if (YmlUtils.isEqualValues(node, containerId)) {
        return true;
      }
      if (isMap(node) && node.items.length > 0) {
        const key = String(node.items[0]?.key);
        return key === containerId;
      }
      return false;
    };

    const newValue = recreate ? { [containerId]: { recreate: true } } : containerId;

    const container = getContainerOrThrowError(containerId, doc);
    const type = container.get('type') as ContainerType;
    const field =
      type === ContainerType.Execution ? ContainerReferenceField.Execution : ContainerReferenceField.Service;

    if (!yamlMap.has(field)) {
      const location =
        source === 'step_bundles' && stepIndex === -1
          ? `in step bundle '${sourceId}'`
          : `on step at index ${stepIndex}`;
      throw new Error(`No container reference found for '${containerId}' ${location}`);
    }

    const path = field === ContainerReferenceField.Execution ? [field] : [field, '*'];

    YmlUtils.updateValueByPredicate(yamlMap, path, predicate, newValue);

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
