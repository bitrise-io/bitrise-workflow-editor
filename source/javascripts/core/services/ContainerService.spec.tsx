import { ContainerModel } from '@/core/models/BitriseYml';
import { bitriseYmlStore, getYmlString, updateBitriseYmlDocumentByString } from '@/core/stores/BitriseYmlStore';

import ContainerService from './ContainerService';

const yaml = String.raw;

describe('ContainerService', () => {
  describe('createExecutionContainer', () => {
    it('should create a new execution container', () => {
      updateBitriseYmlDocumentByString(yaml`workflows:
  wf1: {}
`);

      const container: ContainerModel = {
        id: 'my-container',
        image: 'ubuntu:20.04',
      };

      ContainerService.createExecutionContainer(container);

      const expectedYml = yaml`workflows:
  wf1: {}
execution_containers:
  my-container:
    image: ubuntu:20.04
`;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should create a container with credentials', () => {
      updateBitriseYmlDocumentByString(yaml``);

      const container: ContainerModel = {
        id: 'private-container',
        image: 'registry.example.com/private:latest',
        credentials: {
          username: '$DOCKER_USERNAME',
          password: '$DOCKER_PASSWORD',
        },
      };

      ContainerService.createExecutionContainer(container);

      const expectedYml = yaml`execution_containers:
  private-container:
    image: registry.example.com/private:latest
    credentials:
      username: $DOCKER_USERNAME
      password: $DOCKER_PASSWORD
`;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should create a container with ports, envs, and options', () => {
      updateBitriseYmlDocumentByString(yaml``);

      const container: ContainerModel = {
        id: 'web-container',
        image: 'nginx:latest',
        ports: ['8080:80', '8443:443'],
        envs: [{ ENV: 'production' }, { DEBUG: 'false' }],
        options: '--memory=2g --cpus=2',
      };

      ContainerService.createExecutionContainer(container);

      const expectedYml = yaml`execution_containers:
  web-container:
    image: nginx:latest
    ports:
    - 8080:80
    - 8443:443
    envs:
    - ENV: production
    - DEBUG: "false"
    options: --memory=2g --cpus=2
`;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should filter out empty credentials', () => {
      updateBitriseYmlDocumentByString(yaml``);

      const container: ContainerModel = {
        id: 'test-container',
        image: 'test:latest',
        credentials: {
          username: '$USERNAME',
          password: '',
        },
      };

      ContainerService.createExecutionContainer(container);

      const expectedYml = yaml`execution_containers:
  test-container:
    image: test:latest
    credentials:
      username: $USERNAME
`;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if container already exists', () => {
      updateBitriseYmlDocumentByString(yaml`execution_containers:
  existing-container:
    image: ubuntu:20.04
`);

      const container: ContainerModel = {
        id: 'existing-container',
        image: 'ubuntu:22.04',
      };

      expect(() => ContainerService.createExecutionContainer(container)).toThrow(
        "Execution container 'existing-container' already exists",
      );
    });
  });

  describe('createServiceContainer', () => {
    it('should create a new service container', () => {
      updateBitriseYmlDocumentByString(yaml`workflows:
  wf1: {}
`);

      const service: ContainerModel = {
        id: 'postgres',
        image: 'postgres:13',
      };

      ContainerService.createServiceContainer(service);

      const expectedYml = yaml`workflows:
  wf1: {}
service_containers:
  postgres:
    image: postgres:13
`;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should create a service container with ports by default', () => {
      updateBitriseYmlDocumentByString(yaml``);

      const service: ContainerModel = {
        id: 'redis',
        image: 'redis:6',
        ports: ['6379:6379'],
      };

      ContainerService.createServiceContainer(service);

      const expectedYml = yaml`service_containers:
  redis:
    image: redis:6
    ports:
    - 6379:6379
`;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if service already exists', () => {
      updateBitriseYmlDocumentByString(yaml`service_containers:
  existing-service:
    image: mysql:8
`);

      const service: ContainerModel = {
        id: 'existing-service',
        image: 'mysql:5',
      };

      expect(() => ContainerService.createServiceContainer(service)).toThrow(
        "Service container 'existing-service' already exists",
      );
    });
  });

  describe('updateExecutionContainer', () => {
    it('should update an existing container', () => {
      updateBitriseYmlDocumentByString(yaml`execution_containers:
  my-container:
    image: ubuntu:20.04
`);

      const updatedContainer: ContainerModel = {
        id: 'my-container',
        image: 'ubuntu:22.04',
        envs: [{ ENV: 'updated' }],
      };

      ContainerService.updateExecutionContainer(updatedContainer, 'my-container');

      const expectedYml = yaml`execution_containers:
  my-container:
    image: ubuntu:22.04
    envs:
    - ENV: updated
`;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should rename a container', () => {
      updateBitriseYmlDocumentByString(yaml`execution_containers:
  old-name:
    image: ubuntu:20.04
`);

      const container: ContainerModel = {
        id: 'old-name',
        image: 'ubuntu:20.04',
      };

      ContainerService.updateExecutionContainer(container, 'new-name');

      const expectedYml = yaml`execution_containers:
  new-name:
    image: ubuntu:20.04
`;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if container does not exist', () => {
      updateBitriseYmlDocumentByString(yaml``);

      const container: ContainerModel = {
        id: 'non-existent',
        image: 'ubuntu:20.04',
      };

      expect(() => ContainerService.updateExecutionContainer(container, 'non-existent')).toThrow(
        "Container non-existent not found. Ensure that the container exists in the 'execution_containers' section.",
      );
    });

    it('should throw an error if new name already exists', () => {
      updateBitriseYmlDocumentByString(yaml`execution_containers:
  container-1:
    image: ubuntu:20.04
  container-2:
    image: ubuntu:22.04
`);

      const container: ContainerModel = {
        id: 'container-1',
        image: 'ubuntu:20.04',
      };

      expect(() => ContainerService.updateExecutionContainer(container, 'container-2')).toThrow(
        "Execution container 'container-2' already exists",
      );
    });
  });

  describe('updateServiceContainer', () => {
    it('should update an existing service', () => {
      updateBitriseYmlDocumentByString(yaml`service_containers:
  postgres:
    image: postgres:13
`);

      const updatedService: ContainerModel = {
        id: 'postgres',
        image: 'postgres:14',
        ports: ['5432:5432'],
      };

      ContainerService.updateServiceContainer(updatedService, 'postgres');

      const expectedYml = yaml`service_containers:
  postgres:
    image: postgres:14
    ports:
    - 5432:5432
`;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should rename a service', () => {
      updateBitriseYmlDocumentByString(yaml`service_containers:
  old-service:
    image: redis:6
`);

      const service: ContainerModel = {
        id: 'old-service',
        image: 'redis:6',
      };

      ContainerService.updateServiceContainer(service, 'new-service');

      const expectedYml = yaml`service_containers:
  new-service:
    image: redis:6
`;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if service does not exist', () => {
      updateBitriseYmlDocumentByString(yaml``);

      const service: ContainerModel = {
        id: 'non-existent',
        image: 'redis:6',
      };

      expect(() => ContainerService.updateServiceContainer(service, 'non-existent')).toThrow(
        "Service non-existent not found. Ensure that the service exists in the 'service_containers' section.",
      );
    });

    it('should throw an error if new name already exists', () => {
      updateBitriseYmlDocumentByString(yaml`service_containers:
  service-1:
    image: redis:6
  service-2:
    image: postgres:13
`);

      const service: ContainerModel = {
        id: 'service-1',
        image: 'redis:6',
      };

      expect(() => ContainerService.updateServiceContainer(service, 'service-2')).toThrow(
        "Service container 'service-2' already exists",
      );
    });
  });

  describe('deleteExecutionContainer', () => {
    it('should delete an existing container', () => {
      updateBitriseYmlDocumentByString(yaml`execution_containers:
  my-container:
    image: ubuntu:20.04
  other-container:
    image: ubuntu:22.04
`);

      ContainerService.deleteExecutionContainer('my-container');

      const expectedYml = yaml`execution_containers:
  other-container:
    image: ubuntu:22.04
`;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should remove containers section when last container is deleted', () => {
      updateBitriseYmlDocumentByString(yaml`execution_containers:
  my-container:
    image: ubuntu:20.04
workflows:
  wf1: {}
`);

      ContainerService.deleteExecutionContainer('my-container');

      const expectedYml = yaml`workflows:
  wf1: {}
`;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if container does not exist', () => {
      updateBitriseYmlDocumentByString(yaml``);

      expect(() => ContainerService.deleteExecutionContainer('non-existent')).toThrow(
        "Container non-existent not found. Ensure that the container exists in the 'execution_containers' section.",
      );
    });
  });

  describe('deleteServiceContainer', () => {
    it('should delete an existing service', () => {
      updateBitriseYmlDocumentByString(yaml`service_containers:
  postgres:
    image: postgres:13
  redis:
    image: redis:6
`);

      ContainerService.deleteServiceContainer('postgres');

      const expectedYml = yaml`service_containers:
  redis:
    image: redis:6
`;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should remove services section when last service is deleted', () => {
      updateBitriseYmlDocumentByString(yaml`service_containers:
  postgres:
    image: postgres:13
workflows:
  wf1: {}
`);

      ContainerService.deleteServiceContainer('postgres');

      const expectedYml = yaml`workflows:
  wf1: {}
`;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if service does not exist', () => {
      updateBitriseYmlDocumentByString(yaml``);

      expect(() => ContainerService.deleteServiceContainer('non-existent')).toThrow(
        "Service non-existent not found. Ensure that the service exists in the 'service_containers' section.",
      );
    });
  });

  describe('addExecutionContainerToUsage', () => {
    it('should add container reference to a workflow step', () => {
      updateBitriseYmlDocumentByString(yaml`execution_containers:
  my-container:
    image: ubuntu:20.04
workflows:
  wf1:
    steps:
    - script:
        title: Test
`);

      ContainerService.addExecutionContainerToUsage('wf1', 0, 'my-container');

      const expectedYml = yaml`execution_containers:
  my-container:
    image: ubuntu:20.04
workflows:
  wf1:
    steps:
    - script:
        title: Test
        execution_container: my-container
`;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if container does not exist', () => {
      updateBitriseYmlDocumentByString(yaml`workflows:
  wf1:
    steps:
    - script:
        title: Test
`);

      expect(() => ContainerService.addExecutionContainerToUsage('wf1', 0, 'non-existent')).toThrow(
        "Container non-existent not found. Ensure that the container exists in the 'execution_containers' section.",
      );
    });

    it('should throw an error if workflow does not exist', () => {
      updateBitriseYmlDocumentByString(yaml`execution_containers:
  my-container:
    image: ubuntu:20.04
`);

      expect(() => ContainerService.addExecutionContainerToUsage('non-existent', 0, 'my-container')).toThrow(
        "Workflow non-existent not found. Ensure that the workflow exists in the 'workflows' section.",
      );
    });

    it('should throw an error if step does not exist', () => {
      updateBitriseYmlDocumentByString(yaml`execution_containers:
  my-container:
    image: ubuntu:20.04
workflows:
  wf1:
    steps:
    - script:
        title: Test
`);

      expect(() => ContainerService.addExecutionContainerToUsage('wf1', 5, 'my-container')).toThrow(
        "Step at index 5 not found in workflow 'wf1'",
      );
    });
  });

  describe('addServiceContainerToUsage', () => {
    it('should add service reference to a workflow step', () => {
      updateBitriseYmlDocumentByString(yaml`service_containers:
  postgres:
    image: postgres:13
workflows:
  wf1:
    steps:
    - script:
        title: Test
`);

      ContainerService.addServiceContainerToUsage('wf1', 0, 'postgres');

      const expectedYml = yaml`service_containers:
  postgres:
    image: postgres:13
workflows:
  wf1:
    steps:
    - script:
        title: Test
        service_containers:
        - postgres
`;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should add multiple services to a step', () => {
      updateBitriseYmlDocumentByString(yaml`service_containers:
  postgres:
    image: postgres:13
  redis:
    image: redis:6
workflows:
  wf1:
    steps:
    - script:
        title: Test
        service_containers:
        - postgres
`);

      ContainerService.addServiceContainerToUsage('wf1', 0, 'redis');

      const expectedYml = yaml`service_containers:
  postgres:
    image: postgres:13
  redis:
    image: redis:6
workflows:
  wf1:
    steps:
    - script:
        title: Test
        service_containers:
        - postgres
        - redis
`;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if service is already added', () => {
      updateBitriseYmlDocumentByString(yaml`service_containers:
  postgres:
    image: postgres:13
workflows:
  wf1:
    steps:
    - script:
        title: Test
        service_containers:
        - postgres
`);

      expect(() => ContainerService.addServiceContainerToUsage('wf1', 0, 'postgres')).toThrow(
        "Service container 'postgres' is already added to the step",
      );
    });

    it('should throw an error if service does not exist', () => {
      updateBitriseYmlDocumentByString(yaml`workflows:
  wf1:
    steps:
    - script:
        title: Test
`);

      expect(() => ContainerService.addServiceContainerToUsage('wf1', 0, 'non-existent')).toThrow(
        "Service non-existent not found. Ensure that the service exists in the 'service_containers' section.",
      );
    });
  });

  describe('deleteExecutionContainerFromUsage', () => {
    it('should remove container reference from a workflow step', () => {
      updateBitriseYmlDocumentByString(yaml`execution_containers:
  my-container:
    image: ubuntu:20.04
workflows:
  wf1:
    steps:
    - script:
        title: Test
        execution_container: my-container
`);

      ContainerService.deleteExecutionContainerFromUsage('wf1', 0);

      const expectedYml = yaml`execution_containers:
  my-container:
    image: ubuntu:20.04
workflows:
  wf1:
    steps:
    - script:
        title: Test
`;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if workflow does not exist', () => {
      updateBitriseYmlDocumentByString(yaml``);

      expect(() => ContainerService.deleteExecutionContainerFromUsage('non-existent', 0)).toThrow(
        "Workflow non-existent not found. Ensure that the workflow exists in the 'workflows' section.",
      );
    });

    it('should throw an error if step does not exist', () => {
      updateBitriseYmlDocumentByString(yaml`workflows:
  wf1:
    steps:
    - script:
        title: Test
`);

      expect(() => ContainerService.deleteExecutionContainerFromUsage('wf1', 5)).toThrow(
        "Step at index 5 not found in workflow 'wf1'",
      );
    });
  });

  describe('deleteServiceContainerFromUsage', () => {
    it('should remove service reference from a workflow step', () => {
      updateBitriseYmlDocumentByString(yaml`service_containers:
  postgres:
    image: postgres:13
  redis:
    image: redis:6
workflows:
  wf1:
    steps:
    - script:
        title: Test
        service_containers:
        - postgres
        - redis
`);

      ContainerService.deleteServiceContainerFromUsage('wf1', 0, 'postgres');

      const expectedYml = yaml`service_containers:
  postgres:
    image: postgres:13
  redis:
    image: redis:6
workflows:
  wf1:
    steps:
    - script:
        title: Test
        service_containers:
        - redis
`;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should remove services field when last service is removed', () => {
      updateBitriseYmlDocumentByString(yaml`service_containers:
  postgres:
    image: postgres:13
workflows:
  wf1:
    steps:
    - script:
        title: Test
        service_containers:
        - postgres
`);

      ContainerService.deleteServiceContainerFromUsage('wf1', 0, 'postgres');

      const expectedYml = yaml`service_containers:
  postgres:
    image: postgres:13
workflows:
  wf1:
    steps:
    - script:
        title: Test
`;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if services field does not exist', () => {
      updateBitriseYmlDocumentByString(yaml`workflows:
  wf1:
    steps:
    - script:
        title: Test
`);

      expect(() => ContainerService.deleteServiceContainerFromUsage('wf1', 0, 'postgres')).toThrow(
        'No service containers found on step at index 0',
      );
    });

    it('should throw an error if service is not in the list', () => {
      updateBitriseYmlDocumentByString(yaml`service_containers:
  redis:
    image: redis:6
workflows:
  wf1:
    steps:
    - script:
        title: Test
        service_containers:
        - redis
`);

      expect(() => ContainerService.deleteServiceContainerFromUsage('wf1', 0, 'postgres')).toThrow(
        "Service container 'postgres' not found on step at index 0",
      );
    });
  });

  describe('updateExecutionContainerUsage', () => {
    it('should enable recreate flag for a container', () => {
      updateBitriseYmlDocumentByString(yaml`execution_containers:
  my-container:
    image: ubuntu:20.04
workflows:
  wf1:
    steps:
    - script:
        title: Test
        execution_container: my-container
`);

      ContainerService.updateExecutionContainerUsage('wf1', 0, true);

      const expectedYml = yaml`execution_containers:
  my-container:
    image: ubuntu:20.04
workflows:
  wf1:
    steps:
    - script:
        title: Test
        execution_container:
          my-container:
            recreate: true
`;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should disable recreate flag for a container', () => {
      updateBitriseYmlDocumentByString(yaml`execution_containers:
  my-container:
    image: ubuntu:20.04
workflows:
  wf1:
    steps:
    - script:
        title: Test
        execution_container:
          my-container:
            recreate: true
`);

      ContainerService.updateExecutionContainerUsage('wf1', 0, false);

      const expectedYml = yaml`execution_containers:
  my-container:
    image: ubuntu:20.04
workflows:
  wf1:
    steps:
    - script:
        title: Test
        execution_container: my-container
`;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if container field does not exist', () => {
      updateBitriseYmlDocumentByString(yaml`workflows:
  wf1:
    steps:
    - script:
        title: Test
`);

      expect(() => ContainerService.updateExecutionContainerUsage('wf1', 0, true)).toThrow(
        'No execution container found on step at index 0',
      );
    });
  });

  describe('updateServiceContainerUsage', () => {
    it('should enable recreate flag for a service', () => {
      updateBitriseYmlDocumentByString(yaml`service_containers:
  postgres:
    image: postgres:13
workflows:
  wf1:
    steps:
    - script:
        title: Test
        service_containers:
        - postgres
`);

      ContainerService.updateServiceContainerUsage('wf1', 0, 'postgres', true);

      const expectedYml = yaml`service_containers:
  postgres:
    image: postgres:13
workflows:
  wf1:
    steps:
    - script:
        title: Test
        service_containers:
        - postgres:
            recreate: true
`;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should disable recreate flag for a service', () => {
      updateBitriseYmlDocumentByString(yaml`service_containers:
  postgres:
    image: postgres:13
workflows:
  wf1:
    steps:
    - script:
        title: Test
        service_containers:
        - postgres:
            recreate: true
`);

      ContainerService.updateServiceContainerUsage('wf1', 0, 'postgres', false);

      const expectedYml = yaml`service_containers:
  postgres:
    image: postgres:13
workflows:
  wf1:
    steps:
    - script:
        title: Test
        service_containers:
        - postgres
`;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should update only the specified service', () => {
      updateBitriseYmlDocumentByString(yaml`service_containers:
  postgres:
    image: postgres:13
  redis:
    image: redis:6
workflows:
  wf1:
    steps:
    - script:
        title: Test
        service_containers:
        - postgres
        - redis
`);

      ContainerService.updateServiceContainerUsage('wf1', 0, 'redis', true);

      const expectedYml = yaml`service_containers:
  postgres:
    image: postgres:13
  redis:
    image: redis:6
workflows:
  wf1:
    steps:
    - script:
        title: Test
        service_containers:
        - postgres
        - redis:
            recreate: true
`;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if services field does not exist', () => {
      updateBitriseYmlDocumentByString(yaml`workflows:
  wf1:
    steps:
    - script:
        title: Test
`);

      expect(() => ContainerService.updateServiceContainerUsage('wf1', 0, 'postgres', true)).toThrow(
        'No service containers found on step at index 0',
      );
    });
  });

  describe('getAllExecutionContainers', () => {
    it('should return all execution containers', () => {
      updateBitriseYmlDocumentByString(yaml`execution_containers:
  container-1:
    image: ubuntu:20.04
  container-2:
    image: ubuntu:22.04
`);

      const doc = bitriseYmlStore.getState().ymlDocument;
      const containers = ContainerService.getAllExecutionContainers(doc);

      expect(Object.keys(containers)).toEqual(['container-1', 'container-2']);
    });

    it('should return empty object if no containers exist', () => {
      updateBitriseYmlDocumentByString(yaml`workflows:
  wf1: {}
`);

      const doc = bitriseYmlStore.getState().ymlDocument;
      const containers = ContainerService.getAllExecutionContainers(doc);

      expect(containers).toEqual({});
    });
  });

  describe('getAllServiceContainers', () => {
    it('should return all service containers', () => {
      updateBitriseYmlDocumentByString(yaml`service_containers:
  postgres:
    image: postgres:13
  redis:
    image: redis:6
`);

      const doc = bitriseYmlStore.getState().ymlDocument;
      const services = ContainerService.getAllServiceContainers(doc);

      expect(Object.keys(services)).toEqual(['postgres', 'redis']);
    });

    it('should return empty object if no services exist', () => {
      updateBitriseYmlDocumentByString(yaml`workflows:
  wf1: {}
`);

      const doc = bitriseYmlStore.getState().ymlDocument;
      const services = ContainerService.getAllServiceContainers(doc);

      expect(services).toEqual({});
    });
  });

  describe('getWorkflowsUsingExecutionContainer', () => {
    it('should return workflows using a specific execution container', () => {
      updateBitriseYmlDocumentByString(yaml`execution_containers:
  golang_1:
    image: golang:1.22
  golang_2:
    image: golang:1.22
workflows:
  test:
    steps:
    - script@1:
        title: Run Unit tests
        execution_container: golang_1
        inputs:
        - content: go test ./unittests/...
    - script@1:
        title: Run Integration tests
        execution_container: golang_2
        inputs:
        - content: go test ./integrationtests/...
  build:
    steps:
    - script@1:
        title: Build
        execution_container: golang_1
        inputs:
        - content: go build
  deploy:
    steps:
    - script@1:
        title: Deploy
        inputs:
        - content: echo "deploying"
`);

      const doc = bitriseYmlStore.getState().ymlDocument;
      const result1 = ContainerService.getWorkflowsUsingExecutionContainer(doc, 'golang_1');
      const result2 = ContainerService.getWorkflowsUsingExecutionContainer(doc, 'golang_2');

      expect(result1).toEqual(['test', 'build']);
      expect(result2).toEqual(['test']);
    });

    it('should handle execution containers with recreate flag', () => {
      updateBitriseYmlDocumentByString(yaml`execution_containers:
  my-container:
    image: ubuntu:20.04
workflows:
  wf1:
    steps:
    - script:
        title: Test
        execution_container:
          my-container:
            recreate: true
`);

      const doc = bitriseYmlStore.getState().ymlDocument;
      const result = ContainerService.getWorkflowsUsingExecutionContainer(doc, 'my-container');

      expect(result).toEqual(['wf1']);
    });

    it('should return empty array if no workflows use the container', () => {
      updateBitriseYmlDocumentByString(yaml`execution_containers:
  golang:
    image: golang:1.22
workflows:
  wf1:
    steps:
    - script:
        title: Test
`);

      const doc = bitriseYmlStore.getState().ymlDocument;
      const result = ContainerService.getWorkflowsUsingExecutionContainer(doc, 'golang');

      expect(result).toEqual([]);
    });

    it('should return empty array if no workflows exist', () => {
      updateBitriseYmlDocumentByString(yaml`execution_containers:
  my-container:
    image: ubuntu:20.04
`);

      const doc = bitriseYmlStore.getState().ymlDocument;
      const result = ContainerService.getWorkflowsUsingExecutionContainer(doc, 'my-container');

      expect(result).toEqual([]);
    });

    it('should return empty array if container does not exist', () => {
      updateBitriseYmlDocumentByString(yaml`execution_containers:
  golang:
    image: golang:1.22
workflows:
  test:
    steps:
    - script@1:
        execution_container: golang
`);

      const doc = bitriseYmlStore.getState().ymlDocument;
      const result = ContainerService.getWorkflowsUsingExecutionContainer(doc, 'non-existent');

      expect(result).toEqual([]);
    });
  });

  describe('getWorkflowsUsingServiceContainer', () => {
    it('should return workflows using a specific service container', () => {
      updateBitriseYmlDocumentByString(yaml`service_containers:
  postgres:
    image: postgres:13
  redis:
    image: redis:6
workflows:
  test:
    steps:
    - script@1:
        title: Run tests
        service_containers:
        - postgres
        - redis
        inputs:
        - content: npm test
  integration:
    steps:
    - script@1:
        title: Run integration tests
        service_containers:
        - postgres
        inputs:
        - content: npm run test:integration
  build:
    steps:
    - script@1:
        title: Build
        inputs:
        - content: npm run build
`);

      const doc = bitriseYmlStore.getState().ymlDocument;
      const result1 = ContainerService.getWorkflowsUsingServiceContainer(doc, 'postgres');
      const result2 = ContainerService.getWorkflowsUsingServiceContainer(doc, 'redis');

      expect(result1).toEqual(['test', 'integration']);
      expect(result2).toEqual(['test']);
    });

    it('should handle service containers with recreate flag', () => {
      updateBitriseYmlDocumentByString(yaml`service_containers:
  postgres:
    image: postgres:13
workflows:
  test:
    steps:
    - script:
        title: Test
        service_containers:
        - postgres:
            recreate: true
`);

      const doc = bitriseYmlStore.getState().ymlDocument;
      const result = ContainerService.getWorkflowsUsingServiceContainer(doc, 'postgres');

      expect(result).toEqual(['test']);
    });

    it('should return empty array if no workflows use the service container', () => {
      updateBitriseYmlDocumentByString(yaml`service_containers:
  postgres:
    image: postgres:13
workflows:
  wf1:
    steps:
    - script:
        title: Test
`);

      const doc = bitriseYmlStore.getState().ymlDocument;
      const result = ContainerService.getWorkflowsUsingServiceContainer(doc, 'postgres');

      expect(result).toEqual([]);
    });

    it('should return empty array if no workflows exist', () => {
      updateBitriseYmlDocumentByString(yaml`service_containers:
  postgres:
    image: postgres:13
`);

      const doc = bitriseYmlStore.getState().ymlDocument;
      const result = ContainerService.getWorkflowsUsingServiceContainer(doc, 'postgres');

      expect(result).toEqual([]);
    });

    it('should return empty array if service container does not exist', () => {
      updateBitriseYmlDocumentByString(yaml`service_containers:
  postgres:
    image: postgres:13
workflows:
  test:
    steps:
    - script@1:
        service_containers:
        - postgres
`);

      const doc = bitriseYmlStore.getState().ymlDocument;
      const result = ContainerService.getWorkflowsUsingServiceContainer(doc, 'redis');

      expect(result).toEqual([]);
    });

    it('should handle workflows with multiple steps using service containers', () => {
      updateBitriseYmlDocumentByString(yaml`service_containers:
  postgres:
    image: postgres:13
workflows:
  test:
    steps:
    - script@1:
        title: Setup
    - script@1:
        title: Run tests
        service_containers:
        - postgres
    - script@1:
        title: Cleanup
`);

      const doc = bitriseYmlStore.getState().ymlDocument;
      const result = ContainerService.getWorkflowsUsingServiceContainer(doc, 'postgres');

      expect(result).toEqual(['test']);
    });
  });
});
