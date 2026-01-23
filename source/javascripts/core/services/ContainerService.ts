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
    getStepDataOrThrowError(doc, workflowId, stepIndex);
    getContainerOrThrowError(containerId, doc, target);

    if (target === ContainerSource.Execution) {
      YmlUtils.deleteByValue(
        doc,
        ['workflows', workflowId, 'steps', stepIndex, '*', ContainerReferenceField.Execution],
        containerId,
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

function getAllContainers(doc: Document, target: ContainerSource): Container[] {
  const containers = YmlUtils.getMapIn(doc, [target]);

  if (!containers) {
    return [];
  }

  return containers.items.map((pair) => {
    const id = String(pair.key);
    const containerMap = pair.value as YAMLMap;
    const userValues: ContainerModel = containerMap.toJSON();
    return { id, userValues };
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

function getWorkflowsUsingContainer(doc: Document, containerId: string, target: ContainerSource): string[] {
  const workflows = YmlUtils.getMapIn(doc, ['workflows']);
  const result: string[] = [];

  if (!workflows) {
    return result;
  }

  workflows.items.forEach((pair) => {
    const workflowId = String(pair.key);
    const workflow = pair.value as YAMLMap;

    const steps = YmlUtils.getSeqIn(workflow, ['steps']);

    const usesContainer = steps?.items.some((_, stepIndex) => {
      const stepData = getStepDataOrThrowError(doc, workflowId, stepIndex);

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

    if (usesContainer) {
      result.push(workflowId);
    }
  });

  return result;
}

function updateContainerId(id: Container['id'], newId: Container['id'], target: ContainerSource) {
  updateBitriseYmlDocument(({ doc }) => {
    getContainerOrThrowError(id, doc, target);

    if (id === newId) {
      return doc;
    }

    if (doc.hasIn([target, newId])) {
      throw new Error(`Container '${newId}' already exists.`);
    }

    if (target === ContainerSource.Execution) {
      YmlUtils.updateKeyByPath(doc, [target, id], newId);
      YmlUtils.updateValueByValue(doc, ['workflows', '*', 'steps', '*', '*', 'execution_container'], id, newId);
    } else if (target === ContainerSource.Service) {
      YmlUtils.updateKeyByPath(doc, [target, id], newId);
      YmlUtils.updateValueByValue(doc, ['workflows', '*', 'steps', '*', '*', target, '*'], id, newId);
    }

    return doc;
  });
}

function updateContainerField<T extends ContainerField>(
  id: Container['id'],
  field: T,
  value: ContainerFieldValue<T>,
  target: ContainerSource,
) {
  updateBitriseYmlDocument(({ doc }) => {
    const container = getContainerOrThrowError(id, doc, target);

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
  target: ContainerSource,
) {
  updateBitriseYmlDocument(({ doc }) => {
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

    return doc;
  });
}

function updateContainerReferenceRecreate(
  workflowId: string,
  stepIndex: number,
  target: ContainerSource,
  containerId: string,
  recreate: boolean,
) {
  updateBitriseYmlDocument(({ doc }) => {
    WorkflowService.getWorkflowOrThrowError(workflowId, doc);
    const stepData = getStepDataOrThrowError(doc, workflowId, stepIndex);

    const field =
      target === ContainerSource.Execution ? ContainerReferenceField.Execution : ContainerReferenceField.Service;
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
