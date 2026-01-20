import { ContainerModel } from '@/core/models/BitriseYml';
import { ContainerSource } from '@/core/models/Container';
import { bitriseYmlStore, getYmlString, updateBitriseYmlDocumentByString } from '@/core/stores/BitriseYmlStore';

import ContainerService from './ContainerService';

describe('ContainerService', () => {
  describe('createContainer', () => {
    it('should create a new execution container', () => {
      updateBitriseYmlDocumentByString(yaml`
        workflows:
          wf1: {}
      `);

      const container: ContainerModel = {
        image: 'ubuntu:20.04',
      };

      ContainerService.createContainer('my-container', container, ContainerSource.Execution);

      const expectedYml = yaml`
        workflows:
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
        image: 'registry.example.com/private:latest',
        credentials: {
          username: '$DOCKER_USERNAME',
          password: '$DOCKER_PASSWORD',
        },
      };

      ContainerService.createContainer('private-container', container, ContainerSource.Execution);

      const expectedYml = yaml`
        execution_containers:
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
        image: 'nginx:latest',
        ports: ['8080:80', '8443:443'],
        envs: [{ ENV: 'production' }, { DEBUG: 'false' }],
        options: '--memory=2g --cpus=2',
      };

      ContainerService.createContainer('web-container', container, ContainerSource.Execution);

      const expectedYml = yaml`
        execution_containers:
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
        image: 'test:latest',
        credentials: {
          username: '$USERNAME',
          password: '',
        },
      };

      ContainerService.createContainer('test-container', container, ContainerSource.Execution);

      const expectedYml = yaml`
        execution_containers:
          test-container:
            image: test:latest
            credentials:
              username: $USERNAME
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if container already exists', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          existing-container:
            image: ubuntu:20.04
      `);

      const container: ContainerModel = {
        image: 'ubuntu:22.04',
      };

      expect(() =>
        ContainerService.createContainer('existing-container', container, ContainerSource.Execution),
      ).toThrow("Execution container 'existing-container' already exists");
    });
  });

  describe('createContainer with service target', () => {
    it('should create a new service container', () => {
      updateBitriseYmlDocumentByString(yaml`
        workflows:
          wf1: {}
      `);

      const service: ContainerModel = {
        image: 'postgres:13',
      };

      ContainerService.createContainer('postgres', service, ContainerSource.Service);

      const expectedYml = yaml`
        workflows:
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
        image: 'redis:6',
        ports: ['6379:6379'],
      };

      ContainerService.createContainer('redis', service, ContainerSource.Service);

      const expectedYml = yaml`
        service_containers:
          redis:
            image: redis:6
            ports:
            - 6379:6379
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if service already exists', () => {
      updateBitriseYmlDocumentByString(yaml`
        service_containers:
          existing-service:
            image: mysql:8
      `);

      const service: ContainerModel = {
        image: 'mysql:5',
      };

      expect(() => ContainerService.createContainer('existing-service', service, ContainerSource.Service)).toThrow(
        "Service container 'existing-service' already exists",
      );
    });
  });

  describe('updateContainer', () => {
    it('should update an existing container', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
      `);

      const updatedContainer: ContainerModel = {
        image: 'ubuntu:22.04',
        envs: [{ ENV: 'updated' }],
      };

      ContainerService.updateContainer(updatedContainer, 'my-container', 'new-container-id', ContainerSource.Execution);

      const expectedYml = yaml`
        execution_containers:
          new-container-id:
            image: ubuntu:22.04
            envs:
            - ENV: updated
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if container does not exist', () => {
      updateBitriseYmlDocumentByString(yaml``);

      const container: ContainerModel = {
        image: 'ubuntu:20.04',
      };

      expect(() =>
        ContainerService.updateContainer(container, 'non-existent', 'non-existent', ContainerSource.Execution),
      ).toThrow("Container non-existent not found. Ensure that it exists in the 'execution_containers' section.");
    });

    it('should throw an error if new name already exists', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          container-1:
            image: ubuntu:20.04
          container-2:
            image: ubuntu:22.04
      `);

      const container: ContainerModel = {
        image: 'ubuntu:20.04',
      };

      expect(() =>
        ContainerService.updateContainer(container, 'container-1', 'container-2', ContainerSource.Execution),
      ).toThrow("Container 'container-2' already exists");
    });
  });

  describe('updateContainer with service target', () => {
    it('should update an existing service', () => {
      updateBitriseYmlDocumentByString(yaml`
        service_containers:
          postgres:
            image: postgres:13
      `);

      const updatedService: ContainerModel = {
        image: 'postgres:14',
        ports: ['5432:5432'],
      };

      ContainerService.updateContainer(updatedService, 'postgres', 'new-postgres-id', ContainerSource.Service);

      const expectedYml = yaml`
        service_containers:
          new-postgres-id:
            image: postgres:14
            ports:
            - 5432:5432
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if service does not exist', () => {
      updateBitriseYmlDocumentByString(yaml``);

      const service: ContainerModel = {
        image: 'redis:6',
      };

      expect(() =>
        ContainerService.updateContainer(service, 'non-existent', 'non-existent', ContainerSource.Service),
      ).toThrow("Container non-existent not found. Ensure that it exists in the 'service_containers' section.");
    });

    it('should throw an error if new name already exists', () => {
      updateBitriseYmlDocumentByString(yaml`
        service_containers:
          service-1:
            image: redis:6
          service-2:
            image: postgres:13
      `);

      const service: ContainerModel = {
        image: 'redis:6',
      };

      expect(() =>
        ContainerService.updateContainer(service, 'service-1', 'service-2', ContainerSource.Service),
      ).toThrow("Container 'service-2' already exists");
    });
  });

  describe('deleteContainer', () => {
    it('should delete an existing container', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
          other-container:
            image: ubuntu:22.04
      `);

      ContainerService.deleteContainer('my-container', ContainerSource.Execution);

      const expectedYml = yaml`
        execution_containers:
          other-container:
            image: ubuntu:22.04
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should remove containers section when last container is deleted', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
        workflows:
          wf1: {}
      `);

      ContainerService.deleteContainer('my-container', ContainerSource.Execution);

      const expectedYml = yaml`workflows:
  wf1: {}
`;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if container does not exist', () => {
      updateBitriseYmlDocumentByString(yaml``);

      expect(() => ContainerService.deleteContainer('non-existent', ContainerSource.Execution)).toThrow(
        "Container non-existent not found. Ensure that it exists in the 'execution_containers' section.",
      );
    });
  });

  describe('deleteContainer with service target', () => {
    it('should delete an existing service', () => {
      updateBitriseYmlDocumentByString(yaml`
        service_containers:
          postgres:
            image: postgres:13
          redis:
            image: redis:6
      `);

      ContainerService.deleteContainer('postgres', ContainerSource.Service);

      const expectedYml = yaml`
        service_containers:
          redis:
            image: redis:6
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should remove services section when last service is deleted', () => {
      updateBitriseYmlDocumentByString(yaml`
        service_containers:
          postgres:
            image: postgres:13
        workflows:
          wf1: {}
      `);

      ContainerService.deleteContainer('postgres', ContainerSource.Service);

      const expectedYml = yaml`workflows:
  wf1: {}
`;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if service does not exist', () => {
      updateBitriseYmlDocumentByString(yaml``);

      expect(() => ContainerService.deleteContainer('non-existent', ContainerSource.Service)).toThrow(
        "Container non-existent not found. Ensure that it exists in the 'service_containers' section.",
      );
    });
  });

  describe('addContainer', () => {
    it('should add container reference to a workflow step', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
        workflows:
          wf1:
            steps:
              - script:
                  title: Test
      `);

      ContainerService.addContainer('wf1', 0, 'my-container', ContainerSource.Execution);

      const expectedYml = yaml`
        execution_containers:
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

    it('should add container reference to a step bundle', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
        workflows:
          wf1:
            steps:
              - bundle::setup_repo: {}
      `);

      ContainerService.addContainer('wf1', 0, 'my-container', ContainerSource.Execution);

      const expectedYml = yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
        workflows:
          wf1:
            steps:
              - bundle::setup_repo:
                  execution_container: my-container
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if container does not exist', () => {
      updateBitriseYmlDocumentByString(yaml`
        workflows:
          wf1:
            steps:
              - script:
                  title: Test
      `);

      expect(() => ContainerService.addContainer('wf1', 0, 'non-existent', ContainerSource.Execution)).toThrow(
        "Container non-existent not found. Ensure that it exists in the 'execution_containers' section.",
      );
    });

    it('should throw an error if workflow does not exist', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
      `);

      expect(() => ContainerService.addContainer('non-existent', 0, 'my-container', ContainerSource.Execution)).toThrow(
        "Workflow non-existent not found. Ensure that the workflow exists in the 'workflows' section.",
      );
    });

    it('should throw an error if step does not exist', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
        workflows:
          wf1:
            steps:
              - script:
                  title: Test
      `);

      expect(() => ContainerService.addContainer('wf1', 5, 'my-container', ContainerSource.Execution)).toThrow(
        'Step at index 5 not found in workflows.wf1',
      );
    });
  });

  describe('addContainer with service target', () => {
    it('should add service reference to a workflow step', () => {
      updateBitriseYmlDocumentByString(yaml`
        service_containers:
          postgres:
            image: postgres:13
        workflows:
          wf1:
            steps:
              - script:
                  title: Test
      `);

      ContainerService.addContainer('wf1', 0, 'postgres', ContainerSource.Service);

      const expectedYml = yaml`
        service_containers:
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
      updateBitriseYmlDocumentByString(yaml`
        service_containers:
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

      ContainerService.addContainer('wf1', 0, 'redis', ContainerSource.Service);

      const expectedYml = yaml`
        service_containers:
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
      updateBitriseYmlDocumentByString(yaml`
        service_containers:
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

      expect(() => ContainerService.addContainer('wf1', 0, 'postgres', ContainerSource.Service)).toThrow(
        "Service container 'postgres' is already added to the step",
      );
    });

    it('should throw an error if service does not exist', () => {
      updateBitriseYmlDocumentByString(yaml`
        workflows:
          wf1:
            steps:
              - script:
                  title: Test
      `);

      expect(() => ContainerService.addContainer('wf1', 0, 'non-existent', ContainerSource.Service)).toThrow(
        "Container non-existent not found. Ensure that it exists in the 'service_containers' section.",
      );
    });
  });

  describe('deleteContainerReference', () => {
    it('should remove container reference from a workflow step', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
        workflows:
          wf1:
            steps:
              - script:
                  title: Test
                  execution_container: my-container
      `);

      ContainerService.deleteContainerReference('wf1', 0, ContainerSource.Execution);

      const expectedYml = yaml`
        execution_containers:
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

      expect(() => ContainerService.deleteContainerReference('non-existent', 0, ContainerSource.Execution)).toThrow(
        "Workflow non-existent not found. Ensure that the workflow exists in the 'workflows' section.",
      );
    });

    it('should throw an error if step does not exist', () => {
      updateBitriseYmlDocumentByString(yaml`
        workflows:
          wf1:
            steps:
              - script:
                  title: Test
      `);

      expect(() => ContainerService.deleteContainerReference('wf1', 5, ContainerSource.Execution)).toThrow(
        'Step at index 5 not found in workflows.wf1',
      );
    });
  });

  describe('deleteContainerReference with service target', () => {
    it('should remove service reference from a workflow step', () => {
      updateBitriseYmlDocumentByString(yaml`
        service_containers:
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

      ContainerService.deleteContainerReference('wf1', 0, ContainerSource.Service, 'postgres');

      const expectedYml = yaml`
        service_containers:
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
      updateBitriseYmlDocumentByString(yaml`
        service_containers:
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

      ContainerService.deleteContainerReference('wf1', 0, ContainerSource.Service, 'postgres');

      const expectedYml = yaml`
        service_containers:
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
      updateBitriseYmlDocumentByString(yaml`
        workflows:
          wf1:
            steps:
              - script:
                  title: Test
      `);

      expect(() => ContainerService.deleteContainerReference('wf1', 0, ContainerSource.Service, 'postgres')).toThrow(
        'No service containers found on step at index 0',
      );
    });

    it('should throw an error if service is not in the list', () => {
      updateBitriseYmlDocumentByString(yaml`
        service_containers:
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

      expect(() => ContainerService.deleteContainerReference('wf1', 0, ContainerSource.Service, 'postgres')).toThrow(
        "Service container 'postgres' not found on step at index 0",
      );
    });
  });

  describe('updateContainerUsage', () => {
    it('should enable recreate flag for a container', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
        workflows:
          wf1:
            steps:
              - script:
                  title: Test
                  execution_container: my-container
      `);

      ContainerService.updateContainerUsage('wf1', 0, true, ContainerSource.Execution);

      const expectedYml = yaml`
        execution_containers:
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
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
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

      ContainerService.updateContainerUsage('wf1', 0, false, ContainerSource.Execution);

      const expectedYml = yaml`
        execution_containers:
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
      updateBitriseYmlDocumentByString(yaml`
        workflows:
          wf1:
            steps:
              - script:
                  title: Test
      `);

      expect(() => ContainerService.updateContainerUsage('wf1', 0, true, ContainerSource.Execution)).toThrow(
        'No execution container found on step at index 0',
      );
    });
  });

  describe('updateContainerUsage with service target', () => {
    it('should enable recreate flag for a service', () => {
      updateBitriseYmlDocumentByString(yaml`
        service_containers:
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

      ContainerService.updateContainerUsage('wf1', 0, true, ContainerSource.Service, 'postgres');

      const expectedYml = yaml`
        service_containers:
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
      updateBitriseYmlDocumentByString(yaml`
        service_containers:
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

      ContainerService.updateContainerUsage('wf1', 0, false, ContainerSource.Service, 'postgres');

      const expectedYml = yaml`
        service_containers:
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
      updateBitriseYmlDocumentByString(yaml`
        service_containers:
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

      ContainerService.updateContainerUsage('wf1', 0, true, ContainerSource.Service, 'redis');

      const expectedYml = yaml`
        service_containers:
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
      updateBitriseYmlDocumentByString(yaml`
        workflows:
          wf1:
            steps:
              - script:
                  title: Test
      `);

      expect(() => ContainerService.updateContainerUsage('wf1', 0, true, ContainerSource.Service, 'postgres')).toThrow(
        'No service containers found on step at index 0',
      );
    });
  });

  describe('getAllContainers', () => {
    it('should return all execution containers', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          container-1:
            image: ubuntu:20.04
          container-2:
            image: ubuntu:22.04
      `);

      const doc = bitriseYmlStore.getState().ymlDocument;
      const containers = ContainerService.getAllContainers(doc, ContainerSource.Execution);

      expect(containers).toEqual([
        { id: 'container-1', image: 'ubuntu:20.04' },
        { id: 'container-2', image: 'ubuntu:22.04' },
      ]);
    });

    it('should return empty array if no containers exist', () => {
      updateBitriseYmlDocumentByString(yaml`
        workflows:
          wf1: {}
      `);

      const doc = bitriseYmlStore.getState().ymlDocument;
      const containers = ContainerService.getAllContainers(doc, ContainerSource.Execution);

      expect(containers).toEqual([]);
    });
  });

  describe('getAllContainers with service target', () => {
    it('should return all service containers', () => {
      updateBitriseYmlDocumentByString(yaml`
        service_containers:
          postgres:
            image: postgres:13
          redis:
            image: redis:6
      `);

      const doc = bitriseYmlStore.getState().ymlDocument;
      const services = ContainerService.getAllContainers(doc, ContainerSource.Service);

      expect(services).toEqual([
        { id: 'postgres', image: 'postgres:13' },
        { id: 'redis', image: 'redis:6' },
      ]);
    });

    it('should return empty array if no services exist', () => {
      updateBitriseYmlDocumentByString(yaml`
        workflows:
          wf1: {}
      `);

      const doc = bitriseYmlStore.getState().ymlDocument;
      const services = ContainerService.getAllContainers(doc, ContainerSource.Service);

      expect(services).toEqual([]);
    });
  });

  describe('getWorkflowsUsingContainer', () => {
    it('should return workflows using a specific execution container', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
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
      const result1 = ContainerService.getWorkflowsUsingContainer(doc, 'golang_1', ContainerSource.Execution);
      const result2 = ContainerService.getWorkflowsUsingContainer(doc, 'golang_2', ContainerSource.Execution);

      expect(result1).toEqual(['test', 'build']);
      expect(result2).toEqual(['test']);
    });

    it('should handle execution containers with recreate flag', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
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
      const result = ContainerService.getWorkflowsUsingContainer(doc, 'my-container', ContainerSource.Execution);

      expect(result).toEqual(['wf1']);
    });

    it('should return empty array if no workflows use the container', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          golang:
            image: golang:1.22
        workflows:
          wf1:
            steps:
              - script:
                  title: Test
      `);

      const doc = bitriseYmlStore.getState().ymlDocument;
      const result = ContainerService.getWorkflowsUsingContainer(doc, 'golang', ContainerSource.Execution);

      expect(result).toEqual([]);
    });

    it('should return empty array if no workflows exist', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
      `);

      const doc = bitriseYmlStore.getState().ymlDocument;
      const result = ContainerService.getWorkflowsUsingContainer(doc, 'my-container', ContainerSource.Execution);

      expect(result).toEqual([]);
    });

    it('should return empty array if container does not exist', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          golang:
            image: golang:1.22
        workflows:
          test:
            steps:
              - script@1:
                  execution_container: golang
      `);

      const doc = bitriseYmlStore.getState().ymlDocument;
      const result = ContainerService.getWorkflowsUsingContainer(doc, 'non-existent', ContainerSource.Execution);

      expect(result).toEqual([]);
    });
  });

  describe('getWorkflowsUsingContainer with service target', () => {
    it('should return workflows using a specific service container', () => {
      updateBitriseYmlDocumentByString(yaml`
        service_containers:
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
      const result1 = ContainerService.getWorkflowsUsingContainer(doc, 'postgres', ContainerSource.Service);
      const result2 = ContainerService.getWorkflowsUsingContainer(doc, 'redis', ContainerSource.Service);

      expect(result1).toEqual(['test', 'integration']);
      expect(result2).toEqual(['test']);
    });

    it('should handle service containers with recreate flag', () => {
      updateBitriseYmlDocumentByString(yaml`
        service_containers:
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
      const result = ContainerService.getWorkflowsUsingContainer(doc, 'postgres', ContainerSource.Service);

      expect(result).toEqual(['test']);
    });

    it('should return empty array if no workflows use the service container', () => {
      updateBitriseYmlDocumentByString(yaml`
        service_containers:
          postgres:
            image: postgres:13
        workflows:
          wf1:
            steps:
              - script:
                  title: Test
      `);

      const doc = bitriseYmlStore.getState().ymlDocument;
      const result = ContainerService.getWorkflowsUsingContainer(doc, 'postgres', ContainerSource.Service);

      expect(result).toEqual([]);
    });

    it('should return empty array if no workflows exist', () => {
      updateBitriseYmlDocumentByString(yaml`
        service_containers:
          postgres:
            image: postgres:13
      `);

      const doc = bitriseYmlStore.getState().ymlDocument;
      const result = ContainerService.getWorkflowsUsingContainer(doc, 'postgres', ContainerSource.Service);

      expect(result).toEqual([]);
    });

    it('should return empty array if service container does not exist', () => {
      updateBitriseYmlDocumentByString(yaml`
        service_containers:
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
      const result = ContainerService.getWorkflowsUsingContainer(doc, 'redis', ContainerSource.Service);

      expect(result).toEqual([]);
    });

    it('should handle workflows with multiple steps using service containers', () => {
      updateBitriseYmlDocumentByString(yaml`
        service_containers:
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
      const result = ContainerService.getWorkflowsUsingContainer(doc, 'postgres', ContainerSource.Service);

      expect(result).toEqual(['test']);
    });
  });
});
