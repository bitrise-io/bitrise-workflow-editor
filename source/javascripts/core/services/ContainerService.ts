import { Document, isMap, YAMLMap } from 'yaml';

import { ContainerModel, DockerCredentialModel } from '@/core/models/BitriseYml';
import { Container, ContainerSource } from '@/core/models/Container';
import StepService from '@/core/services/StepService';
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

function updateContainer(
  updatedContainer: ContainerModel,
  id: Container['id'],
  target: ContainerSource,
  newId?: Container['id'],
) {
  updateBitriseYmlDocument(({ doc }) => {
    const container = getContainerOrThrowError(id, doc, target);
    const targetId = newId ?? id;

    if (newId && id !== newId && doc.hasIn([target, newId])) {
      throw new Error(`Container '${newId}' already exists`);
    }

    if (newId && id !== newId) {
      updateContainerId(doc, id, newId, target);
    }

    if (updatedContainer.image !== container.get('image')) {
      updateImage(doc, targetId, updatedContainer.image, target);
    }

    const portsChanged = JSON.stringify(updatedContainer.ports) !== JSON.stringify(container.get('ports'));
    if (portsChanged) {
      updatePorts(doc, targetId, updatedContainer.ports, target);
    }

    const newServer = updatedContainer.credentials?.server;
    if (newServer !== container.getIn(['credentials', 'server'])) {
      updateRegistryServer(doc, targetId, newServer, target);
    }

    const newUsername = updatedContainer.credentials?.username;
    if (newUsername !== container.getIn(['credentials', 'username'])) {
      updateUsername(doc, targetId, newUsername, target);
    }

    const newPassword = updatedContainer.credentials?.password;
    if (newPassword !== container.getIn(['credentials', 'password'])) {
      updatePassword(doc, targetId, newPassword, target);
    }

    const envsChanged = JSON.stringify(updatedContainer.envs) !== JSON.stringify(container.get('envs'));
    if (envsChanged) {
      updateEnvVars(doc, targetId, updatedContainer.envs, target);
    }

    if (updatedContainer.options !== container.get('options')) {
      updateOptions(doc, targetId, updatedContainer.options, target);
    }

    return doc;
  });
}

function updateContainerId(doc: Document, oldId: Container['id'], newId: Container['id'], target: ContainerSource) {
  if (oldId === newId) {
    return;
  }

  getContainerOrThrowError(oldId, doc, target);

  if (doc.hasIn([target, newId])) {
    throw new Error(`Container '${newId}' already exists`);
  }

  const containerData = YmlUtils.getMapIn(doc, [target, oldId]);
  YmlUtils.deleteByPath(doc, [target, oldId]);
  YmlUtils.setIn(doc, [target, newId], containerData);
}

function updateImage(doc: Document, id: Container['id'], image: ContainerModel['image'], target: ContainerSource) {
  YmlUtils.setIn(doc, [target, id, 'image'], image);
}

function updatePorts(doc: Document, id: Container['id'], ports: ContainerModel['ports'], target: ContainerSource) {
  if (!ports || ports.length === 0) {
    YmlUtils.deleteByPath(doc, [target, id, 'ports']);
  } else {
    YmlUtils.setIn(doc, [target, id, 'ports'], ports);
  }
}

function updateRegistryServer(
  doc: Document,
  id: Container['id'],
  server: DockerCredentialModel['server'],
  target: ContainerSource,
) {
  if (!server) {
    YmlUtils.deleteByPath(doc, [target, id, 'credentials', 'server']);

    const credentials = YmlUtils.getMapIn(doc, [target, id, 'credentials']);
    if (credentials && credentials.items.length === 0) {
      YmlUtils.deleteByPath(doc, [target, id, 'credentials']);
    }
  } else {
    YmlUtils.setIn(doc, [target, id, 'credentials', 'server'], server);
  }
}

function updateUsername(
  doc: Document,
  id: Container['id'],
  username: DockerCredentialModel['username'] | undefined,
  target: ContainerSource,
) {
  if (!username) {
    YmlUtils.deleteByPath(doc, [target, id, 'credentials', 'username']);

    const credentials = YmlUtils.getMapIn(doc, [target, id, 'credentials']);
    if (credentials && credentials.items.length === 0) {
      YmlUtils.deleteByPath(doc, [target, id, 'credentials']);
    }
  } else {
    YmlUtils.setIn(doc, [target, id, 'credentials', 'username'], username);
  }
}

function updatePassword(
  doc: Document,
  id: Container['id'],
  password: DockerCredentialModel['password'] | undefined,
  target: ContainerSource,
) {
  if (!password) {
    YmlUtils.deleteByPath(doc, [target, id, 'credentials', 'password']);

    const credentials = YmlUtils.getMapIn(doc, [target, id, 'credentials']);
    if (credentials && credentials.items.length === 0) {
      YmlUtils.deleteByPath(doc, [target, id, 'credentials']);
    }
  } else {
    YmlUtils.setIn(doc, [target, id, 'credentials', 'password'], password);
  }
}

function updateEnvVars(doc: Document, id: Container['id'], envs: ContainerModel['envs'], target: ContainerSource) {
  if (!envs || envs.length === 0) {
    YmlUtils.deleteByPath(doc, [target, id, 'envs']);
  } else {
    YmlUtils.setIn(doc, [target, id, 'envs'], envs);
  }
}

function updateOptions(
  doc: Document,
  id: Container['id'],
  options: ContainerModel['options'],
  target: ContainerSource,
) {
  if (!options) {
    YmlUtils.deleteByPath(doc, [target, id, 'options']);
  } else {
    YmlUtils.setIn(doc, [target, id, 'options'], options);
  }
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
