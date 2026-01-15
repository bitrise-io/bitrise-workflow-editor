import { Document, isMap, YAMLMap } from 'yaml';

import { ContainerModel } from '@/core/models/BitriseYml';
import WorkflowService from '@/core/services/WorkflowService';
import { updateBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';

function addExecutionContainerToUsage(workflowId: string, stepIndex: number, containerId: ContainerModel['id']) {
  updateBitriseYmlDocument(({ doc }) => {
    getExecutionContainerOrThrowError(containerId, doc);
    WorkflowService.getWorkflowOrThrowError(workflowId, doc);
    const stepData = getStepDataOrThrowError(doc, workflowId, stepIndex);

    YmlUtils.setIn(stepData, ['execution_container'], containerId);

    return doc;
  });
}

function addServiceContainerToUsage(workflowId: string, stepIndex: number, containerId: ContainerModel['id']) {
  updateBitriseYmlDocument(({ doc }) => {
    getServiceContainerOrThrowError(containerId, doc);
    WorkflowService.getWorkflowOrThrowError(workflowId, doc);
    const stepData = getStepDataOrThrowError(doc, workflowId, stepIndex);

    const existingServices = YmlUtils.getSeqIn(stepData, ['service_containers']);
    const currentServices = existingServices ? existingServices.items.map((item) => String(item)) : [];

    if (currentServices.includes(containerId)) {
      throw new Error(`Service container '${containerId}' is already added to the step`);
    }

    YmlUtils.setIn(stepData, ['service_containers'], [...currentServices, containerId]);

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

function createExecutionContainer(container: ContainerModel) {
  updateBitriseYmlDocument(({ doc }) => {
    const { id } = container;

    if (doc.hasIn(['execution_containers', id])) {
      throw new Error(`Execution container '${id}' already exists`);
    }

    const containerData = buildContainerData(container);

    YmlUtils.setIn(doc, ['execution_containers', id], containerData);
    return doc;
  });
}

function createServiceContainer(container: ContainerModel) {
  updateBitriseYmlDocument(({ doc }) => {
    const { id } = container;

    if (doc.hasIn(['service_containers', id])) {
      throw new Error(`Service container '${id}' already exists`);
    }

    const service = buildContainerData(container, true);

    YmlUtils.setIn(doc, ['service_containers', id], service);
    return doc;
  });
}

function deleteExecutionContainerFromUsage(workflowId: string, stepIndex: number) {
  updateBitriseYmlDocument(({ doc }) => {
    WorkflowService.getWorkflowOrThrowError(workflowId, doc);
    const stepData = getStepDataOrThrowError(doc, workflowId, stepIndex);

    YmlUtils.deleteByPath(stepData, ['execution_container']);

    return doc;
  });
}

function deleteServiceContainerFromUsage(workflowId: string, stepIndex: number, containerId: string) {
  updateBitriseYmlDocument(({ doc }) => {
    WorkflowService.getWorkflowOrThrowError(workflowId, doc);
    const stepData = getStepDataOrThrowError(doc, workflowId, stepIndex);

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

    return doc;
  });
}

function deleteExecutionContainer(id: ContainerModel['id']) {
  updateBitriseYmlDocument(({ doc }) => {
    getExecutionContainerOrThrowError(id, doc);
    YmlUtils.deleteByPath(doc, ['execution_containers', id]);

    if (
      doc.hasIn(['execution_containers']) &&
      Object.keys(YmlUtils.getMapIn(doc, ['execution_containers']) || {}).length === 0
    ) {
      YmlUtils.deleteByPath(doc, ['execution_containers']);
    }

    return doc;
  });
}

function deleteServiceContainer(id: ContainerModel['id']) {
  updateBitriseYmlDocument(({ doc }) => {
    getServiceContainerOrThrowError(id, doc);
    YmlUtils.deleteByPath(doc, ['service_containers', id]);

    if (
      doc.hasIn(['service_containers']) &&
      Object.keys(YmlUtils.getMapIn(doc, ['service_containers']) || {}).length === 0
    ) {
      YmlUtils.deleteByPath(doc, ['service_containers']);
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

function getAllExecutionContainers(doc: Document) {
  const containers = YmlUtils.getMapIn(doc, ['execution_containers']);

  if (!containers) {
    return {};
  }

  return containers;
}

function getAllServiceContainers(doc: Document) {
  const services = YmlUtils.getMapIn(doc, ['service_containers']);

  if (!services) {
    return {};
  }

  return services;
}

function getExecutionContainerOrThrowError(id: ContainerModel['id'], doc: Document) {
  const container = YmlUtils.getMapIn(doc, ['execution_containers', id]);

  if (!container) {
    throw new Error(
      `Container ${id} not found. Ensure that the container exists in the 'execution_containers' section.`,
    );
  }

  return container;
}

function getServiceContainerOrThrowError(id: ContainerModel['id'], doc: Document) {
  const service = YmlUtils.getMapIn(doc, ['service_containers', id]);

  if (!service) {
    throw new Error(`Service ${id} not found. Ensure that the service exists in the 'service_containers' section.`);
  }

  return service;
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

function updateExecutionContainer(container: ContainerModel, newId: string) {
  updateBitriseYmlDocument(({ doc }) => {
    const { id } = container;
    getExecutionContainerOrThrowError(id, doc);

    if (id !== newId && doc.hasIn(['execution_containers', newId])) {
      throw new Error(`Execution container '${newId}' already exists`);
    }

    const containerData = buildContainerData(container);

    if (id !== newId) {
      YmlUtils.deleteByPath(doc, ['execution_containers', id]);
      YmlUtils.setIn(doc, ['execution_containers', newId], containerData);
    } else {
      YmlUtils.setIn(doc, ['execution_containers', id], containerData);
    }

    return doc;
  });
}

function updateExecutionContainerUsage(workflowId: string, stepIndex: number, recreate: boolean) {
  updateBitriseYmlDocument(({ doc }) => {
    WorkflowService.getWorkflowOrThrowError(workflowId, doc);

    const stepData = getStepDataOrThrowError(doc, workflowId, stepIndex);

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

    return doc;
  });
}

function updateServiceContainer(container: ContainerModel, newId: string) {
  updateBitriseYmlDocument(({ doc }) => {
    const { id } = container;

    getServiceContainerOrThrowError(id, doc);

    if (id !== newId && doc.hasIn(['service_containers', newId])) {
      throw new Error(`Service container '${newId}' already exists`);
    }

    const service = buildContainerData(container, true);

    if (id !== newId) {
      YmlUtils.deleteByPath(doc, ['service_containers', id]);
      YmlUtils.setIn(doc, ['service_containers', newId], service);
    } else {
      YmlUtils.setIn(doc, ['service_containers', id], service);
    }

    return doc;
  });
}

function updateServiceContainerUsage(workflowId: string, stepIndex: number, serviceId: string, recreate: boolean) {
  updateBitriseYmlDocument(({ doc }) => {
    WorkflowService.getWorkflowOrThrowError(workflowId, doc);

    const stepData = getStepDataOrThrowError(doc, workflowId, stepIndex);

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

    return doc;
  });
}

export default {
  addExecutionContainerToUsage,
  addServiceContainerToUsage,
  createExecutionContainer,
  createServiceContainer,
  deleteExecutionContainer,
  deleteExecutionContainerFromUsage,
  deleteServiceContainer,
  deleteServiceContainerFromUsage,
  getAllExecutionContainers,
  getAllServiceContainers,
  getExecutionContainerOrThrowError,
  getServiceContainerOrThrowError,
  updateExecutionContainer,
  updateExecutionContainerUsage,
  updateServiceContainer,
  updateServiceContainerUsage,
};
