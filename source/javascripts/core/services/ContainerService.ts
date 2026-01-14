import { Document, isMap } from 'yaml';

import WorkflowService from '@/core/services/WorkflowService';
import { updateBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';

function addExecutionContainerToStep(workflowId: string, stepIndex: number, containerId: string) {
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

function addServiceContainerToStep(workflowId: string, stepIndex: number, containerId: string) {
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

function createExecutionContainer(
  id: string,
  image: string,
  credentials?: { username?: string; password?: string; server?: string },
  ports?: string[],
  envs?: Record<string, string>[],
  options?: string,
) {
  updateBitriseYmlDocument(({ doc }) => {
    if (doc.hasIn(['containers', id])) {
      throw new Error(`Container '${id}' already exists`);
    }

    const container: Record<string, unknown> = { image };

    if (credentials) {
      const filteredCredentials = Object.entries(credentials)
        .filter(([_, value]) => value !== undefined && value !== '')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      if (Object.keys(filteredCredentials).length > 0) {
        container.credentials = filteredCredentials;
      }
    }

    if (ports && ports.length > 0) {
      container.ports = ports;
    }

    if (envs && envs.length > 0) {
      container.envs = envs;
    }

    if (options) {
      container.options = options;
    }

    YmlUtils.setIn(doc, ['containers', id], container);
    return doc;
  });
}

function createServiceContainer(
  id: string,
  image: string,
  ports: string[],
  credentials?: { username?: string; password?: string; server?: string },
  envs?: Record<string, string>[],
  options?: string,
) {
  updateBitriseYmlDocument(({ doc }) => {
    if (doc.hasIn(['services', id])) {
      throw new Error(`Service '${id}' already exists`);
    }

    const service: Record<string, unknown> = { image, ports };

    if (credentials) {
      const filteredCredentials = Object.entries(credentials)
        .filter(([_, value]) => value !== undefined && value !== '')
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

function deleteExecutionContainerFromStep(workflowId: string, stepIndex: number) {
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

function deleteServiceContainerFromStep(workflowId: string, stepIndex: number, containerId: string) {
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

function deleteExecutionContainer(id: string) {
  updateBitriseYmlDocument(({ doc }) => {
    getExecutionContainerOrThrowError(id, doc);
    YmlUtils.deleteByPath(doc, ['containers', id]);

    return doc;
  });
}

function deleteServiceContainer(id: string) {
  updateBitriseYmlDocument(({ doc }) => {
    getServiceContainerOrThrowError(id, doc);
    YmlUtils.deleteByPath(doc, ['services', id]);

    return doc;
  });
}

function getExecutionContainerOrThrowError(id: string, doc: Document) {
  const container = YmlUtils.getMapIn(doc, ['containers', id]);

  if (!container) {
    throw new Error(`Container ${id} not found. Ensure that the container exists in the 'containers' section.`);
  }

  return container;
}

function getServiceContainerOrThrowError(id: string, doc: Document) {
  const service = YmlUtils.getMapIn(doc, ['services', id]);

  if (!service) {
    throw new Error(`Service ${id} not found. Ensure that the service exists in the 'services' section.`);
  }

  return service;
}

export default {
  addExecutionContainerToStep,
  addServiceContainerToStep,
  createExecutionContainer,
  createServiceContainer,
  deleteExecutionContainer,
  deleteExecutionContainerFromStep,
  deleteServiceContainer,
  deleteServiceContainerFromStep,
  getExecutionContainerOrThrowError,
  getServiceContainerOrThrowError,
};
