import { Document, isMap } from 'yaml';

import { ContainerModel } from '@/core/models/BitriseYml';
import WorkflowService from '@/core/services/WorkflowService';
import { updateBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';

function addExecutionContainerToUsage(workflowId: string, stepIndex: number, containerId: ContainerModel['id']) {
  updateBitriseYmlDocument(({ doc }) => {
    getExecutionContainerOrThrowError(containerId, doc);
    WorkflowService.getWorkflowOrThrowError(workflowId, doc);

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

    YmlUtils.setIn(stepData, ['container'], containerId);

    return doc;
  });
}

function addServiceContainerToUsage(workflowId: string, stepIndex: number, containerId: ContainerModel['id']) {
  updateBitriseYmlDocument(({ doc }) => {
    getServiceContainerOrThrowError(containerId, doc);
    WorkflowService.getWorkflowOrThrowError(workflowId, doc);

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

    const existingServices = YmlUtils.getSeqIn(stepData, ['services']);
    const currentServices = existingServices ? existingServices.items.map((item) => String(item)) : [];

    if (currentServices.includes(containerId)) {
      throw new Error(`Service '${containerId}' is already added to the step`);
    }

    YmlUtils.setIn(stepData, ['services'], [...currentServices, containerId]);

    return doc;
  });
}

function createExecutionContainer(container: ContainerModel) {
  updateBitriseYmlDocument(({ doc }) => {
    const { id, image, credentials, ports, envs, options } = container;

    if (doc.hasIn(['containers', id])) {
      throw new Error(`Container '${id}' already exists`);
    }

    const containerData: Record<string, unknown> = { image };

    if (credentials) {
      const filteredCredentials = Object.entries(credentials)
        .filter(([_, value]) => !!value)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      if (Object.keys(filteredCredentials).length > 0) {
        containerData.credentials = filteredCredentials;
      }
    }

    if (ports && ports.length > 0) {
      containerData.ports = ports;
    }

    if (envs && envs.length > 0) {
      containerData.envs = envs;
    }

    if (options) {
      containerData.options = options;
    }

    YmlUtils.setIn(doc, ['containers', id], containerData);
    return doc;
  });
}

function createServiceContainer(container: ContainerModel) {
  updateBitriseYmlDocument(({ doc }) => {
    const { id, image, credentials, ports, envs, options } = container;

    if (doc.hasIn(['services', id])) {
      throw new Error(`Service '${id}' already exists`);
    }

    const service: Record<string, unknown> = { image, ports };

    if (credentials) {
      const filteredCredentials = Object.entries(credentials)
        .filter(([_, value]) => !!value)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      if (Object.keys(filteredCredentials).length > 0) {
        service.credentials = filteredCredentials;
      }
    }

    if (envs && envs.length > 0) {
      service.envs = envs;
    }

    if (options) {
      service.options = options;
    }

    YmlUtils.setIn(doc, ['services', id], service);
    return doc;
  });
}

function deleteExecutionContainerFromUsage(workflowId: string, stepIndex: number) {
  updateBitriseYmlDocument(({ doc }) => {
    WorkflowService.getWorkflowOrThrowError(workflowId, doc);

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

    YmlUtils.deleteByPath(stepData, ['container']);

    return doc;
  });
}

function deleteServiceContainerFromUsage(workflowId: string, stepIndex: number, containerId: string) {
  updateBitriseYmlDocument(({ doc }) => {
    WorkflowService.getWorkflowOrThrowError(workflowId, doc);

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

    const existingServices = YmlUtils.getSeqIn(stepData, ['services']);
    if (!existingServices) {
      throw new Error(`No services found on step at index ${stepIndex}`);
    }

    const currentServices = existingServices.items.map((item) => String(item));
    const updatedServices = currentServices.filter((service) => service !== containerId);

    if (updatedServices.length === currentServices.length) {
      throw new Error(`Service '${containerId}' not found on step at index ${stepIndex}`);
    }

    if (updatedServices.length === 0) {
      YmlUtils.deleteByPath(stepData, ['services']);
    } else {
      YmlUtils.setIn(stepData, ['services'], updatedServices);
    }

    return doc;
  });
}

function deleteExecutionContainer(id: ContainerModel['id']) {
  updateBitriseYmlDocument(({ doc }) => {
    getExecutionContainerOrThrowError(id, doc);
    YmlUtils.deleteByPath(doc, ['containers', id]);

    if (doc.hasIn(['containers']) && Object.keys(YmlUtils.getMapIn(doc, ['containers']) || {}).length === 0) {
      YmlUtils.deleteByPath(doc, ['containers']);
    }

    return doc;
  });
}

function deleteServiceContainer(id: ContainerModel['id']) {
  updateBitriseYmlDocument(({ doc }) => {
    getServiceContainerOrThrowError(id, doc);
    YmlUtils.deleteByPath(doc, ['services', id]);

    if (doc.hasIn(['services']) && Object.keys(YmlUtils.getMapIn(doc, ['services']) || {}).length === 0) {
      YmlUtils.deleteByPath(doc, ['services']);
    }

    return doc;
  });
}

function getAllExecutionContainers(doc: Document) {
  const containers = YmlUtils.getMapIn(doc, ['containers']);

  if (!containers) {
    return {};
  }

  return containers;
}

function getAllServiceContainers(doc: Document) {
  const services = YmlUtils.getMapIn(doc, ['services']);

  if (!services) {
    return {};
  }

  return services;
}

function getExecutionContainerOrThrowError(id: ContainerModel['id'], doc: Document) {
  const container = YmlUtils.getMapIn(doc, ['containers', id]);

  if (!container) {
    throw new Error(`Container ${id} not found. Ensure that the container exists in the 'containers' section.`);
  }

  return container;
}

function getServiceContainerOrThrowError(id: ContainerModel['id'], doc: Document) {
  const service = YmlUtils.getMapIn(doc, ['services', id]);

  if (!service) {
    throw new Error(`Service ${id} not found. Ensure that the service exists in the 'services' section.`);
  }

  return service;
}

function updateExecutionContainer(container: ContainerModel, newId: string) {
  updateBitriseYmlDocument(({ doc }) => {
    const { id, image, credentials, ports, envs, options } = container;
    getExecutionContainerOrThrowError(id, doc);

    if (id !== newId && doc.hasIn(['containers', newId])) {
      throw new Error(`Container '${newId}' already exists`);
    }

    const containerData: Record<string, unknown> = { image };

    if (credentials) {
      const filteredCredentials = Object.entries(credentials)
        .filter(([_, value]) => !!value)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      if (Object.keys(filteredCredentials).length > 0) {
        containerData.credentials = filteredCredentials;
      }
    }

    if (ports && ports.length > 0) {
      containerData.ports = ports;
    }

    if (envs && envs.length > 0) {
      containerData.envs = envs;
    }

    if (options) {
      containerData.options = options;
    }

    if (id !== newId) {
      YmlUtils.deleteByPath(doc, ['containers', id]);
      YmlUtils.setIn(doc, ['containers', newId], containerData);
    } else {
      YmlUtils.setIn(doc, ['containers', id], containerData);
    }

    return doc;
  });
}

function updateServiceContainer(container: ContainerModel, newId: string) {
  updateBitriseYmlDocument(({ doc }) => {
    const { id, image, credentials, ports, envs, options } = container;

    getServiceContainerOrThrowError(id, doc);

    if (id !== newId && doc.hasIn(['services', newId])) {
      throw new Error(`Service '${newId}' already exists`);
    }

    const service: Record<string, unknown> = { image, ports };

    if (credentials) {
      const filteredCredentials = Object.entries(credentials)
        .filter(([_, value]) => !!value)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      if (Object.keys(filteredCredentials).length > 0) {
        service.credentials = filteredCredentials;
      }
    }

    if (envs && envs.length > 0) {
      service.envs = envs;
    }

    if (options) {
      service.options = options;
    }

    if (id !== newId) {
      YmlUtils.deleteByPath(doc, ['services', id]);
      YmlUtils.setIn(doc, ['services', newId], service);
    } else {
      YmlUtils.setIn(doc, ['services', id], service);
    }

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
  updateServiceContainer,
};
