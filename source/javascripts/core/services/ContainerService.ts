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
import { bitriseYmlStore, updateBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';

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
    YmlUtils.deleteByValue(doc, [...keep, ContainerReferenceField.Execution], id, keep);
    YmlUtils.deleteByValue(doc, [...keep, ContainerReferenceField.Service, '*'], id, keep);

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
    throw new Error(`Container ${id} not found.`);
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

function getWorkflowsUsingContainer(containerId: string): string[] {
  const doc = bitriseYmlStore.getState().ymlDocument;
  const workflows = YmlUtils.getMapIn(doc, ['workflows']);
  const result: string[] = [];

  if (!workflows) {
    return result;
  }

  const executionContainerPath = ['workflows', '*', 'steps', '*', '*', ContainerReferenceField.Execution];
  const serviceContainerPath = ['workflows', '*', 'steps', '*', '*', ContainerReferenceField.Service, '*'];

  const checkPath = (path: (string | number)[], searchPath: (string | number)[]) => {
    if (path.length !== searchPath.length) {
      return false;
    }
    return path.every((segment, index) => searchPath[index] === '*' || searchPath[index] === segment);
  };

  YmlUtils.collectPaths(doc).forEach((path) => {
    if (!checkPath(path, executionContainerPath) && !checkPath(path, serviceContainerPath)) {
      return;
    }

    const node = doc.getIn(path, true);
    const matches = isMap(node) ? String(node.items[0]?.key) === containerId : String(node) === containerId;

    if (matches) {
      const workflowId = String(path[1]);
      if (!result.includes(workflowId)) {
        result.push(workflowId);
      }
    }
  });

  return result;
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

    const executionContainerPath = ['workflows', '*', 'steps', '*', '*', ContainerReferenceField.Execution];
    const serviceContainerPath = ['workflows', '*', 'steps', '*', '*', ContainerReferenceField.Service, '*'];

    YmlUtils.updateKeyByPath(doc, ['containers', id], newId);
    YmlUtils.updateValueByValue(doc, executionContainerPath, id, newId);
    YmlUtils.updateValueByValue(doc, serviceContainerPath, id, newId);

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

export default {
  addContainerReference,
  createContainer,
  deleteContainer,
  getAllContainers,
  getContainerOrThrowError,
  getWorkflowsUsingContainer,
  removeContainerReference,
  updateContainerId,
  updateContainerField,
  updateContainerReferenceRecreate,
  updateCredentialField,
};
