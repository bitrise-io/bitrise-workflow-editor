import { uniq } from 'es-toolkit';
import { Document, isMap, isScalar, isSeq, YAMLMap } from 'yaml';

import { ContainerModel, Containers } from '@/core/models/BitriseYml';
import { Container, ContainerReference, ContainerReferenceField, ContainerType } from '@/core/models/Container';
import StepBundleService from '@/core/services/StepBundleService';
import StepService from '@/core/services/StepService';
import { bitriseYmlStore, updateBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';
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

  const stepData = YmlUtils.resolveAlias(doc, pair.value);

  if (isMap(stepData)) {
    return stepData;
  }

  // An option-less step (`- script@1:`) has no map to write into yet; materialize one. Checked on
  // the raw value, not the resolved one, so a dangling alias isn't silently overwritten.
  if (pair.value == null || (isScalar(pair.value) && pair.value.value == null)) {
    const emptyMap = new YAMLMap();
    pair.value = emptyMap;
    return emptyMap;
  }

  throw new Error(`Invalid step data at index ${stepIndex} in ${source} '${sourceId}'`);
}

/**
 * The option map of a step (`- script@1: {...}` → the `{...}`), or `undefined` when the step is
 * absent — a cross-file workflow, a step bundle defined in another module — or isn't a
 * `{cvs: options}` map at all. Unlike `getStepDataOrThrowError` this neither throws nor materializes
 * a missing option map, so it is safe to call while rendering.
 */
function findStepData(
  doc: Document,
  source: 'workflows' | 'step_bundles',
  sourceId: string,
  stepIndex: number,
): YAMLMap | undefined {
  const step = YmlUtils.getIn(doc, [source, sourceId, 'steps', stepIndex], true);

  if (!isMap(step)) {
    return undefined;
  }

  const stepData = YmlUtils.resolveAlias(doc, step.items[0]?.value);

  return isMap(stepData) ? stepData : undefined;
}

function addContainerReference(
  source: 'workflows' | 'step_bundles',
  sourceId: string,
  stepIndex: number,
  containerId: string,
  containerType: ContainerType,
) {
  // The container definition may live in a different module file than the step being edited, so
  // validate existence against the aggregated entity index (modular) or the active document
  // (single-file) — not the active file's `containers` — and fail fast on an unknown id rather than
  // writing a dangling reference. The reference itself is added to the active file (where the step
  // lives), and the caller supplies the type from the aggregated container list.
  const state = bitriseYmlStore.getState();
  const containerExists = state.tree
    ? Boolean(state.entityIndex.containers?.[containerId])
    : Boolean(YmlUtils.getMapIn(state.ymlDocument, ['containers', containerId]));
  if (!containerExists) {
    throw new Error(
      `Container ${containerId} not found. Ensure that the container exists in the 'containers' section.`,
    );
  }

  updateBitriseYmlDocument(({ doc }) => {
    let yamlMap;
    if (source === 'step_bundles' && stepIndex === -1) {
      yamlMap = StepBundleService.getStepBundleOrThrowError(doc, sourceId);
    } else {
      yamlMap = getStepDataOrThrowError(doc, source, sourceId, stepIndex);
    }

    if (containerType === ContainerType.Execution) {
      YmlUtils.setIn(yamlMap, [ContainerReferenceField.Execution], containerId);
    }

    if (containerType === ContainerType.Service) {
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

/** The plain value behind a node, resolving an alias first. */
function scalarValueOf(doc: Document, node: unknown) {
  const resolved = YmlUtils.resolveAlias(doc, node);

  return isScalar(resolved) ? resolved.value : resolved;
}

/**
 * A container reference — a bare id (`ubuntu`) or `{ id: { recreate: true } }` — or `undefined` when
 * the node names no container (an empty map, an empty seq item, a number).
 *
 * Read off the nodes rather than via `toJSON()`, and resolved against `doc` at every level: a
 * reference can be written as `*anchor` (or hold one), and a subtree containing an unresolved alias
 * serializes to `{ source: '<anchor>' }`, which would parse as a container literally named "source".
 * Every caller runs during render, where throwing would take down the whole card.
 */
function parseContainerReference(doc: Document, node: unknown): ContainerReference | undefined {
  const resolved = YmlUtils.resolveAlias(doc, node);

  if (isMap(resolved)) {
    const pair = resolved.items[0];
    const id = pair ? scalarValueOf(doc, pair.key) : undefined;

    if (typeof id !== 'string' || !id) {
      return undefined;
    }

    const options = YmlUtils.resolveAlias(doc, pair?.value);
    const recreate = isMap(options) ? scalarValueOf(doc, options.get('recreate', true)) : undefined;

    return { id, recreate: recreate === true };
  }

  const value = isScalar(resolved) ? resolved.value : resolved;

  return typeof value === 'string' && value ? { id: value, recreate: false } : undefined;
}

// `doc` is the alias-resolution root: an anchor referenced from a step is almost always declared
// elsewhere in the file, so resolving against `yamlMap` alone would never find it.
function getContainerReferences(
  type: ContainerType,
  yamlMap: YAMLMap,
  doc: Document,
): ContainerReference[] | undefined {
  if (type === ContainerType.Execution) {
    const reference = parseContainerReference(doc, yamlMap.get(ContainerReferenceField.Execution, true));

    return reference ? [reference] : undefined;
  }

  if (type === ContainerType.Service) {
    // Resolved first: `*anchor` pointing at a sequence is a config the CLI runs, not a bad shape.
    // What's left after that — a bare scalar, a map — is genuinely unusable here, and reporting it
    // is the YAML validator's job rather than something to throw over mid-render.
    const node = YmlUtils.resolveAlias(doc, yamlMap.get(ContainerReferenceField.Service, true));
    const references = (isSeq(node) ? node.items : [])
      .map((item) => parseContainerReference(doc, item))
      .filter((reference): reference is ContainerReference => Boolean(reference));

    if (references.length > 0) {
      return references;
    }
  }

  return undefined;
}

function getContainerReferencesFromStepBundleDefinition(sourceId: string, type: ContainerType, doc: Document) {
  // A cross-file bundle definition is absent here; return none rather than throwing (throwing crashes the card during render).
  const yamlMap = YmlUtils.getIn(doc, ['step_bundles', sourceId], true);
  if (!isMap(yamlMap)) {
    return undefined;
  }

  return getContainerReferences(type, yamlMap, doc);
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
  // This runs on every StepCard render, so it must not throw: a cross-file source (a workflow/step
  // bundle defined in another module) is absent from the active document, and a step can be written
  // in a shape this can't read. Either way the card renders without container references.
  const yamlMap = findStepData(doc, source, sourceId, stepIndex);
  if (!yamlMap) {
    return undefined;
  }

  return getContainerReferences(type, yamlMap, doc);
}

// The container id a reference node points at — a bare scalar id, or the first key of a
// `{ id: {opts} }` map — or undefined if it isn't a container reference. The inverse of the shapes
// `referencesContainer` matched (a scalar equal to the id, or a map whose first key is the id).
//
// Read the node with `YmlUtils.getIn`, never `doc.getIn`: the paths handed to this come from
// `getMatchingPaths`, which enumerates `toJSON()` and so happily matches a leaf written as
// `*anchor`. A native read hands back the raw `Alias` — neither a map nor a scalar — and the
// reference silently disappears from the usage counts.
function referencedContainerId(node: unknown): string | undefined {
  if (isMap(node)) {
    return node.items.length > 0 ? String(node.items[0]?.key) : undefined;
  }
  const value = isScalar(node) ? node.value : node;
  return typeof value === 'string' ? value : undefined;
}

/**
 * Workflows using each of `containerIds`, scanning the document once. `getMatchingPaths` and
 * `doc.toJSON()` depend only on the document, so bucketing the matches by their referenced container
 * avoids re-running them per container (which is O(containers × files) across a modular config).
 * Every requested id gets an entry (empty array when unused).
 */
function getWorkflowsUsingContainers(doc: Document, containerIds: string[]): Map<string, string[]> {
  const ids = new Set(containerIds);
  const yml = doc.toJSON();
  const workflows = yml?.workflows ?? {};
  const stepBundles = yml?.step_bundles ?? {};

  const directByContainer = new Map<string, string[]>();
  const stepBundleIdsByContainer = new Map<string, Set<string>>();

  const bucket = <T>(map: Map<string, T[] | Set<T>>, key: string, value: T, factory: () => T[] | Set<T>) => {
    const existing = map.get(key) ?? factory();
    if (Array.isArray(existing)) {
      existing.push(value);
    } else {
      existing.add(value);
    }
    map.set(key, existing);
  };

  // Workflows that directly reference a container in their steps.
  [
    ...YmlUtils.getMatchingPaths(doc, ExecutionContainerWildcardRefPath),
    ...YmlUtils.getMatchingPaths(doc, ServiceContainerWildcardRefPath),
  ].forEach(([path]) => {
    const containerId = referencedContainerId(YmlUtils.getIn(doc, path, true));
    if (containerId && ids.has(containerId)) {
      bucket(directByContainer, containerId, String(path[1]), () => []);
    }
  });

  // Step bundles that reference a container (definition-level or step-level).
  [
    ...YmlUtils.getMatchingPaths(doc, StepBundleDefinitionExecutionContainerWildcardRefPath),
    ...YmlUtils.getMatchingPaths(doc, StepBundleDefinitionServiceContainerWildcardRefPath),
    ...YmlUtils.getMatchingPaths(doc, StepBundleExecutionContainerWildcardRefPath),
    ...YmlUtils.getMatchingPaths(doc, StepBundleServiceContainerWildcardRefPath),
  ].forEach(([path]) => {
    const containerId = referencedContainerId(YmlUtils.getIn(doc, path, true));
    if (containerId && ids.has(containerId)) {
      bucket(stepBundleIdsByContainer, containerId, String(path[1]), () => new Set<string>());
    }
  });

  const result = new Map<string, string[]>();
  containerIds.forEach((containerId) => {
    const direct = directByContainer.get(containerId) ?? [];
    const workflowsFromStepBundles = [...(stepBundleIdsByContainer.get(containerId) ?? [])].flatMap((stepBundleId) =>
      StepBundleService.getDependantWorkflows(workflows, StepBundleService.idToCvs(stepBundleId), stepBundles),
    );
    result.set(containerId, uniq([...direct, ...workflowsFromStepBundles]));
  });
  return result;
}

function getWorkflowsUsingContainer(doc: Document, containerId: string): string[] {
  return getWorkflowsUsingContainers(doc, [containerId]).get(containerId) ?? [];
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
  containerType: ContainerType,
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

    // The container definition may live in another module, so the type comes from the caller (the
    // aggregated container list) rather than a lookup in the active document — the reference we're
    // toggling is on the active file's step.
    const field =
      containerType === ContainerType.Execution ? ContainerReferenceField.Execution : ContainerReferenceField.Service;

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
  getWorkflowsUsingContainers,
  sanitizePort,
  removeContainerReference,
  sanitizeName,
  updateContainer,
  updateContainerId,
  updateContainerReferenceRecreate,
  validateName,
  validatePorts,
};
