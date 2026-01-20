import { Document, isMap, YAMLMap } from 'yaml';

import { ContainerModel } from '@/core/models/BitriseYml';
import WorkflowService from '@/core/services/WorkflowService';
import { updateBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';

type ContainerTarget = 'execution' | 'service';

function addContainerToUsage(workflowId: string, stepIndex: number, containerId: string, target: ContainerTarget) {
  updateBitriseYmlDocument(({ doc }) => {
    getContainerOrThrowError(containerId, doc, target);
    WorkflowService.getWorkflowOrThrowError(workflowId, doc);
    const stepData = getStepDataOrThrowError(doc, workflowId, stepIndex);

    if (target === 'execution') {
      YmlUtils.setIn(stepData, ['execution_container'], containerId);
    }

    if (target === 'service') {
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

function buildContainerData(container: ContainerModel, includePortsByDefault = false) {
  const { image, credentials, ports, envs, options } = container;

  const containerData: Record<string, unknown> = { image };

  if (includePortsByDefault && ports) {
    containerData.ports = ports;
  }

  const filteredCredentials = filterCredentials(credentials);
  if (filteredCredentials) {
    containerData.credentials = filteredCredentials;
  }

  if (ports && ports.length > 0 && !includePortsByDefault) {
    containerData.ports = ports;
  }

  if (envs && envs.length > 0) {
    containerData.envs = envs;
  }

  if (options) {
    containerData.options = options;
  }

  return containerData;
}

function createContainer(id: string, container: ContainerModel, target: ContainerTarget) {
  updateBitriseYmlDocument(({ doc }) => {
    if (doc.hasIn([`${target}_containers`, id])) {
      const containerType = target === 'execution' ? 'Execution container' : 'Service container';
      throw new Error(`${containerType} '${id}' already exists`);
    }

    const includePortsByDefault = target === 'service';
    const containerData = buildContainerData(container, includePortsByDefault);

    YmlUtils.setIn(doc, [`${target}_containers`, id], containerData);
    return doc;
  });
}

function deleteContainerFromUsage(
  workflowId: string,
  stepIndex: number,
  target: ContainerTarget,
  containerId?: string,
) {
  updateBitriseYmlDocument(({ doc }) => {
    WorkflowService.getWorkflowOrThrowError(workflowId, doc);
    const stepData = getStepDataOrThrowError(doc, workflowId, stepIndex);

    if (target === 'execution') {
      YmlUtils.deleteByPath(stepData, ['execution_container']);
    }

    if (target === 'service') {
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

function deleteContainer(id: string, target: ContainerTarget) {
  updateBitriseYmlDocument(({ doc }) => {
    getContainerOrThrowError(id, doc, target);
    YmlUtils.deleteByPath(doc, [`${target}_containers`, id]);

    if (
      doc.hasIn([`${target}_containers`]) &&
      Object.keys(YmlUtils.getMapIn(doc, [`${target}_containers`]) || {}).length === 0
    ) {
      YmlUtils.deleteByPath(doc, [`${target}_containers`]);
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

function getAllContainers(doc: Document, target: ContainerTarget) {
  const containerPath = target === 'execution' ? 'execution_containers' : 'service_containers';
  const containers = YmlUtils.getMapIn(doc, [containerPath]);

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

function getContainerOrThrowError(id: string, doc: Document, target: ContainerTarget) {
  const container = YmlUtils.getMapIn(doc, [`${target}_containers`, id]);

  if (!container) {
    throw new Error(`Container ${id} not found. Ensure that it exists in the '${target}_containers' section.`);
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

function getWorkflowsUsingContainerByTarget(doc: Document, containerId: string, target: ContainerTarget): string[] {
  return getWorkflowsUsingContainer(doc, (stepData) => {
    if (target === 'execution') {
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

    if (target === 'service') {
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

function updateContainer(updatedContainer: ContainerModel, id: string, newId: string, target: ContainerTarget) {
  updateBitriseYmlDocument(({ doc }) => {
    getContainerOrThrowError(id, doc, target);

    if (id !== newId && doc.hasIn([`${target}_containers`, newId])) {
      throw new Error(`Container '${newId}' already exists`);
    }

    const includePortsByDefault = target === 'service';
    const containerData = buildContainerData(updatedContainer, includePortsByDefault);

    if (id !== newId) {
      YmlUtils.deleteByPath(doc, [`${target}_containers`, id]);
      YmlUtils.setIn(doc, [`${target}_containers`, newId], containerData);
    } else {
      YmlUtils.setIn(doc, [`${target}_containers`, id], containerData);
    }

    return doc;
  });
}

function updateContainerUsage(
  workflowId: string,
  stepIndex: number,
  recreate: boolean,
  target: ContainerTarget,
  serviceId?: string,
) {
  updateBitriseYmlDocument(({ doc }) => {
    WorkflowService.getWorkflowOrThrowError(workflowId, doc);

    const stepData = getStepDataOrThrowError(doc, workflowId, stepIndex);

    if (target === 'execution') {
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

    if (target === 'service') {
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
  addContainerToUsage,
  createContainer,
  deleteContainer,
  deleteContainerFromUsage,
  getAllContainers,
  getContainerOrThrowError,
  getWorkflowsUsingContainer: getWorkflowsUsingContainerByTarget,
  updateContainer,
  updateContainerUsage,
};
