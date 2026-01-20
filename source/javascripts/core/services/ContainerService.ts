import { Document, isMap, YAMLMap } from 'yaml';

import { ContainerModel } from '@/core/models/BitriseYml';
import { ContainerSource } from '@/core/models/Container';
import WorkflowService from '@/core/services/WorkflowService';
import { updateBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';

function addContainer(workflowId: string, stepIndex: number, containerId: string, target: ContainerSource) {
  updateBitriseYmlDocument(({ doc }) => {
    getContainerOrThrowError(containerId, doc, target);
    WorkflowService.getWorkflowOrThrowError(workflowId, doc);
    const stepData = getStepDataOrThrowError(doc, workflowId, stepIndex);

    if (target === ContainerSource.Execution) {
      YmlUtils.setIn(stepData, ['execution_container'], containerId);
    }

    if (target === ContainerSource.Service) {
      const existingServices = YmlUtils.getSeqIn(stepData, ['service_containers']);
      const currentServices = existingServices ? existingServices.items.map((item) => String(item)) : [];

      if (currentServices.includes(containerId)) {
        throw new Error(`Service container '${containerId}' is already added to the step`);
      }
      YmlUtils.setIn(stepData, ['service_containers'], [...currentServices, containerId]);
    }

    return doc;
  });
}

function buildContainerData(container: ContainerModel) {
  const { image, credentials, ports, envs, options } = container;

  const containerData: Record<string, unknown> = { image };

  if (ports && ports.length > 0) {
    containerData.ports = ports;
  }

  const filteredCredentials = filterCredentials(credentials);
  if (filteredCredentials) {
    containerData.credentials = filteredCredentials;
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

    const containerData = buildContainerData(container);

    YmlUtils.setIn(doc, [target, id], containerData);
    return doc;
  });
}

function deleteContainerReference(
  workflowId: string,
  stepIndex: number,
  target: ContainerSource,
  containerId?: string,
) {
  updateBitriseYmlDocument(({ doc }) => {
    WorkflowService.getWorkflowOrThrowError(workflowId, doc);
    const stepData = getStepDataOrThrowError(doc, workflowId, stepIndex);

    if (target === ContainerSource.Execution) {
      YmlUtils.deleteByPath(stepData, ['execution_container']);
    }

    if (target === ContainerSource.Service) {
      if (!containerId) {
        throw new Error('Container ID is required when deleting service container from usage');
      }

      const existingServices = YmlUtils.getSeqIn(stepData, ['service_containers']);
      if (!existingServices) {
        throw new Error(`No service containers found on step at index ${stepIndex}`);
      }

      const currentServices = existingServices.items.map((item) => String(item));
      const updatedServices = currentServices.filter((service) => service !== containerId);

      if (updatedServices.length === currentServices.length) {
        throw new Error(`Service container '${containerId}' not found on step at index ${stepIndex}`);
      }

      if (updatedServices.length === 0) {
        YmlUtils.deleteByPath(stepData, ['service_containers']);
      } else {
        YmlUtils.setIn(stepData, ['service_containers'], updatedServices);
      }
    }

    return doc;
  });
}

function deleteContainer(id: string, target: ContainerSource) {
  updateBitriseYmlDocument(({ doc }) => {
    getContainerOrThrowError(id, doc, target);
    YmlUtils.deleteByPath(doc, [target, id]);

    if (doc.hasIn([target]) && Object.keys(YmlUtils.getMapIn(doc, [target]) || {}).length === 0) {
      YmlUtils.deleteByPath(doc, [target]);
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
  const steps = YmlUtils.getSeqIn(doc, ['workflows', workflowId, 'steps']);
  if (!steps || stepIndex >= steps.items.length) {
    throw new Error(`Step at index ${stepIndex} not found in workflow '${workflowId}'`);
  }

  const step = steps.items[stepIndex];
  if (!step || !isMap(step)) {
    throw new Error(`Invalid step at index ${stepIndex} in workflow '${workflowId}'`);
  }

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

    const usesContainer = steps?.items.some((step) => {
      const stepMap = step as YAMLMap;
      const stepData = stepMap.items[0]?.value as YAMLMap;

      if (stepData) {
        return predicate(stepData);
      }
      return false;
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

function updateContainer(updatedContainer: ContainerModel, id: string, newId: string, target: ContainerSource) {
  updateBitriseYmlDocument(({ doc }) => {
    getContainerOrThrowError(id, doc, target);

    if (id !== newId && doc.hasIn([target, newId])) {
      throw new Error(`Container '${newId}' already exists`);
    }

    const containerData = buildContainerData(updatedContainer);

    if (id !== newId) {
      YmlUtils.deleteByPath(doc, [target, id]);
      YmlUtils.setIn(doc, [target, newId], containerData);
    } else {
      YmlUtils.setIn(doc, [target, id], containerData);
    }

    return doc;
  });
}

function updateContainerUsage(
  workflowId: string,
  stepIndex: number,
  recreate: boolean,
  target: ContainerSource,
  serviceId?: string,
) {
  updateBitriseYmlDocument(({ doc }) => {
    WorkflowService.getWorkflowOrThrowError(workflowId, doc);

    const stepData = getStepDataOrThrowError(doc, workflowId, stepIndex);

    if (target === ContainerSource.Execution) {
      const container = stepData.get('execution_container');
      if (!container) {
        throw new Error(`No execution container found on step at index ${stepIndex}`);
      }

      const containerId = isMap(container) ? String(container.items[0]?.key) : String(container);

      if (recreate) {
        YmlUtils.setIn(stepData, ['execution_container'], { [containerId]: { recreate: true } });
      } else {
        YmlUtils.setIn(stepData, ['execution_container'], containerId);
      }
    }

    if (target === ContainerSource.Service) {
      if (!serviceId) {
        throw new Error('Service ID is required when updating service container usage');
      }

      const existingServices = YmlUtils.getSeqIn(stepData, ['service_containers']);
      if (!existingServices) {
        throw new Error(`No service containers found on step at index ${stepIndex}`);
      }

      const updatedServices = existingServices.items.map((item) => {
        const currentServiceId = isMap(item) ? String(item.items[0]?.key) : String(item);

        if (currentServiceId === serviceId) {
          return recreate ? { [serviceId]: { recreate: true } } : serviceId;
        }

        return item;
      });

      YmlUtils.setIn(stepData, ['service_containers'], updatedServices);
    }

    return doc;
  });
}

export default {
  addContainer,
  createContainer,
  deleteContainer,
  deleteContainerReference,
  getAllContainers,
  getContainerOrThrowError,
  getWorkflowsUsingContainer: getWorkflowsUsingContainerByTarget,
  updateContainer,
  updateContainerUsage,
};
