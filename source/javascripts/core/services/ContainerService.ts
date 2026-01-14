import { Document } from 'yaml';

import { updateBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';

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

export default {
  createExecutionContainer,
  createServiceContainer,
  deleteExecutionContainer,
  deleteServiceContainer,
  getExecutionContainerOrThrowError,
  getServiceContainerOrThrowError,
};
