import { Document, isMap, YAMLMap } from 'yaml';

import { ContainerModel } from '@/core/models/BitriseYml';
import {
  Container,
  ContainerField,
  ContainerFieldValue,
  ContainerReferenceField,
  ContainerSource,
  CredentialField,
  CredentialFieldValue,
} from '@/core/models/Container';
import StepService from '@/core/services/StepService';
import WorkflowService from '@/core/services/WorkflowService';
import { updateBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';

function addContainerReference(workflowId: string, stepIndex: number, containerId: string, target: ContainerSource) {
  updateBitriseYmlDocument(({ doc }) => {
    getContainerOrThrowError(containerId, doc, target);
    WorkflowService.getWorkflowOrThrowError(workflowId, doc);
    const stepData = getStepDataOrThrowError(doc, workflowId, stepIndex);

    if (target === ContainerSource.Execution) {
      YmlUtils.setIn(stepData, ['execution_container'], containerId);
    }

    if (target === ContainerSource.Service) {
      if (YmlUtils.isInSeq(stepData, ['service_containers'], containerId)) {
        throw new Error(`Service container '${containerId}' is already added to the step`);
      }
      YmlUtils.addIn(stepData, ['service_containers'], containerId);
    }

    return doc;
  });
}

function cleanContainerData(container: ContainerModel) {
  const { image, credentials, ports, envs, options } = container;

  const containerData: ContainerModel = { image };

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

function createContainer(id: string, container: ContainerModel, target: ContainerSource) {
  updateBitriseYmlDocument(({ doc }) => {
    if (doc.hasIn([target, id])) {
      const containerType = target === ContainerSource.Execution ? 'Execution container' : 'Service container';
      throw new Error(`${containerType} '${id}' already exists`);
    }

    const containerData = cleanContainerData(container);

    YmlUtils.setIn(doc, [target, id], containerData);
    return doc;
  });
}

function deleteContainer(id: string, target: ContainerSource) {
  updateBitriseYmlDocument(({ doc }) => {
    getContainerOrThrowError(id, doc, target);

    YmlUtils.deleteByPath(doc, [target, id]);
    if (target === ContainerSource.Execution) {
      YmlUtils.deleteByValue(doc, ['workflows', '*', 'steps', '*', '*', ContainerReferenceField.Execution], id, [
        'workflows',
        '*',
        'steps',
        '*',
        '*',
      ]);
    } else if (target === ContainerSource.Service) {
      YmlUtils.deleteByValue(doc, ['workflows', '*', 'steps', '*', '*', ContainerReferenceField.Service, '*'], id, [
        'workflows',
        '*',
        'steps',
        '*',
        '*',
      ]);
    }

    return doc;
  });
}

function removeContainerReference(workflowId: string, stepIndex: number, target: ContainerSource, containerId: string) {
  updateBitriseYmlDocument(({ doc }) => {
    WorkflowService.getWorkflowOrThrowError(workflowId, doc);

    if (target === ContainerSource.Execution) {
      YmlUtils.deleteByPath(
        doc,
        ['workflows', workflowId, 'steps', stepIndex, '*', ContainerReferenceField.Execution],
        ['workflows', workflowId, 'steps', stepIndex, '*'],
      );
    } else if (target === ContainerSource.Service) {
      YmlUtils.deleteByValue(
        doc,
        ['workflows', workflowId, 'steps', stepIndex, '*', ContainerReferenceField.Service, '*'],
        containerId,
        ['workflows', workflowId, 'steps', stepIndex, '*'],
      );
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

function getAllContainers(doc: Document, target: ContainerSource) {
  const containers = YmlUtils.getMapIn(doc, [target]);

  if (!containers) {
    return [];
  }

  return containers.items.map((pair) => {
    const id = String(pair.key);
    const containerMap = pair.value as YAMLMap;
    const image = String(containerMap.get('image'));
    return { id, image };
  });
}

function getContainerOrThrowError(id: string, doc: Document, target: ContainerSource) {
  const container = YmlUtils.getMapIn(doc, [target, id]);

  if (!container) {
    throw new Error(`Container ${id} not found. Ensure that it exists in the '${target}' section.`);
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

function getWorkflowsUsingContainer(doc: Document, predicate: (stepData: YAMLMap) => boolean): string[] {
  const workflows = YmlUtils.getMapIn(doc, ['workflows']);
  const result: string[] = [];

  if (!workflows) {
    return result;
  }

  workflows.items.forEach((pair) => {
    const workflowId = String(pair.key);
    const workflow = pair.value as YAMLMap;

    const steps = YmlUtils.getSeqIn(workflow, ['steps']);

    const usesContainer = steps?.items.some((step, stepIndex) => {
      const stepMap = step as YAMLMap;
      const stepData = stepMap.items[0]?.value as YAMLMap;
      if (!isMap(stepData)) {
        throw new Error(`Invalid step data at index ${stepIndex} in workflow '${workflowId}'`);
      }

      return predicate(stepData);
    });

    if (usesContainer) {
      result.push(workflowId);
    }
  });

  return result;
}

function getWorkflowsUsingContainerByTarget(doc: Document, containerId: string, target: ContainerSource): string[] {
  return getWorkflowsUsingContainer(doc, (stepData) => {
    if (target === ContainerSource.Execution) {
      const executionContainer = stepData.get('execution_container');
      if (executionContainer) {
        if (isMap(executionContainer)) {
          const id = String(executionContainer.items[0]?.key);
          return id === containerId;
        }
        return String(executionContainer) === containerId;
      }
      return false;
    }

    if (target === ContainerSource.Service) {
      const serviceContainers = YmlUtils.getSeqIn(stepData, ['service_containers']);
      if (serviceContainers) {
        return serviceContainers.items.some((service) => {
          if (isMap(service)) {
            const id = String(service.items[0]?.key);
            return id === containerId;
          }
          return String(service) === containerId;
        });
      }
      return false;
    }

    return false;
  });
}

function updateContainerId(doc: Document, id: Container['id'], newId: Container['id'], target: ContainerSource) {
  if (id === newId) {
    return;
  }

  getContainerOrThrowError(id, doc, target);

  if (doc.hasIn([target, newId])) {
    throw new Error(`Container '${newId}' already exists`);
  }

  if (target === ContainerSource.Execution) {
    YmlUtils.updateKeyByPath(doc, ['execution_containers', id], newId);
    YmlUtils.updateValueByValue(doc, ['workflows', '*', 'steps', '*', '*', 'execution_container'], id, newId);
  } else if (target === ContainerSource.Service) {
    YmlUtils.updateKeyByPath(doc, ['service_containers', id], newId);
    YmlUtils.updateValueByValue(doc, ['workflows', '*', 'steps', '*', '*', 'service_containers', '*'], id, newId);
  }
}

function updateContainerField<T extends ContainerField>(
  doc: Document,
  id: Container['id'],
  field: T,
  value: ContainerFieldValue<T>,
  target: ContainerSource,
) {
  getContainerOrThrowError(id, doc, target);

  if (value) {
    YmlUtils.setIn(doc, [target, id, field], value);
  } else {
    YmlUtils.deleteByPath(doc, [target, id, field]);
  }
}

function updateCredentialField<T extends CredentialField>(
  doc: Document,
  id: Container['id'],
  field: T,
  value: CredentialFieldValue<T>,
  target: ContainerSource,
) {
  getContainerOrThrowError(id, doc, target);

  if (value) {
    YmlUtils.setIn(doc, [target, id, 'credentials', field], value);
  } else {
    YmlUtils.deleteByPath(doc, [target, id, 'credentials', field]);

    const credentials = YmlUtils.getMapIn(doc, [target, id, 'credentials']);
    if (credentials && credentials.items.length === 0) {
      YmlUtils.deleteByPath(doc, [target, id, 'credentials']);
    }
  }
}

function updateContainerReference(
  workflowId: string,
  stepIndex: number,
  target: ContainerSource,
  recreate: boolean,
  containerId: string,
) {
  updateBitriseYmlDocument(({ doc }) => {
    WorkflowService.getWorkflowOrThrowError(workflowId, doc);
    const stepData = getStepDataOrThrowError(doc, workflowId, stepIndex);

    if (target === ContainerSource.Execution) {
      if (!stepData.has(ContainerReferenceField.Execution)) {
        throw new Error(`No execution container found on step at index ${stepIndex}`);
      }

      const newValue = recreate ? { [containerId]: { recreate: true } } : containerId;

      YmlUtils.setIn(stepData, [ContainerReferenceField.Execution], newValue);
    }

    if (target === ContainerSource.Service) {
      if (!stepData.has(ContainerReferenceField.Service)) {
        throw new Error(`No service containers found on step at index ${stepIndex}`);
      }

      const newValue = recreate ? { [containerId]: { recreate: true } } : containerId;

      YmlUtils.updateValueByPredicate(
        doc,
        ['workflows', workflowId, 'steps', stepIndex, '*', ContainerReferenceField.Service, '*'],
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
    }

    return doc;
  });
}

export default {
  addContainerReference,
  createContainer,
  deleteContainer,
  getAllContainers,
  getContainerOrThrowError,
  getWorkflowsUsingContainer: getWorkflowsUsingContainerByTarget,
  removeContainerReference,
  updateContainerId,
  updateContainerField,
  updateContainerReference,
  updateCredentialField,
};
