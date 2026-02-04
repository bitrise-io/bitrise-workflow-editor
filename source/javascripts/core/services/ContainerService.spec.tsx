import { ContainerModel, Containers } from '@/core/models/BitriseYml';
import { ContainerType } from '@/core/models/Container';
import { bitriseYmlStore, getYmlString, updateBitriseYmlDocumentByString } from '@/core/stores/BitriseYmlStore';

import ContainerService from './ContainerService';

describe('ContainerService', () => {
  describe('addContainerReference', () => {
    describe('execution container target', () => {
      it('should add container reference to a workflow step', () => {
        updateBitriseYmlDocumentByString(yaml`
        containers:
          my-container:
            type: execution
            image: ubuntu:20.04
        workflows:
          wf1:
            steps:
              - script:
                  title: Test
      `);

        ContainerService.addContainerReference('wf1', 0, 'my-container');

        const expectedYml = yaml`
        containers:
          my-container:
            type: execution
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

      it('should set the container reference even if one already exists', () => {
        updateBitriseYmlDocumentByString(yaml`
        containers:
          my-container:
            type: execution
            image: ubuntu:20.04
          other-container:
            type: execution
            image: ubuntu:22.04
        workflows:
          wf1:
            steps:
              - script:
                  title: Test
                  execution_container: other-container
      `);

        ContainerService.addContainerReference('wf1', 0, 'my-container');

        const expectedYml = yaml`
        containers:
          my-container:
            type: execution
            image: ubuntu:20.04
          other-container:
            type: execution
            image: ubuntu:22.04
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
        updateBitriseYmlDocumentByString(yaml`
        workflows:
          wf1:
            steps:
              - script:
                  title: Test
      `);

        expect(() => ContainerService.addContainerReference('wf1', 0, 'non-existent')).toThrow(
          "Container non-existent not found. Ensure that the container exists in the 'containers' section.",
        );
      });

      it('should throw an error if workflow does not exist', () => {
        updateBitriseYmlDocumentByString(yaml`
        containers:
          my-container:
            type: execution
            image: ubuntu:20.04
      `);

        expect(() => ContainerService.addContainerReference('non-existent', 0, 'my-container')).toThrow(
          "Workflow non-existent not found. Ensure that the workflow exists in the 'workflows' section.",
        );
      });

      it('should throw an error if step does not exist', () => {
        updateBitriseYmlDocumentByString(yaml`
        containers:
          my-container:
            type: execution
            image: ubuntu:20.04
        workflows:
          wf1:
            steps:
              - script:
                  title: Test
      `);

        expect(() => ContainerService.addContainerReference('wf1', 5, 'my-container')).toThrow(
          'Step at index 5 not found in workflows.wf1',
        );
      });
    });
    describe('service container target', () => {
      it('should add service reference to a workflow step', () => {
        updateBitriseYmlDocumentByString(yaml`
        containers:
          postgres:
            type: service
            image: postgres:13
        workflows:
          wf1:
            steps:
              - script:
                  title: Test
      `);

        ContainerService.addContainerReference('wf1', 0, 'postgres');

        const expectedYml = yaml`
        containers:
          postgres:
            type: service
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
        containers:
          postgres:
            type: service
            image: postgres:13
          redis:
            type: service
            image: redis:6
        workflows:
          wf1:
            steps:
              - script:
                  title: Test
                  service_containers:
                    - postgres
      `);

        ContainerService.addContainerReference('wf1', 0, 'redis');

        const expectedYml = yaml`
        containers:
          postgres:
            type: service
            image: postgres:13
          redis:
            type: service
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
        containers:
          postgres:
            type: service
            image: postgres:13
        workflows:
          wf1:
            steps:
              - script:
                  title: Test
                  service_containers:
                    - postgres
      `);

        expect(() => ContainerService.addContainerReference('wf1', 0, 'postgres')).toThrow(
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

        expect(() => ContainerService.addContainerReference('wf1', 0, 'non-existent')).toThrow(
          "Container non-existent not found. Ensure that the container exists in the 'containers' section.",
        );
      });
    });
  });

  describe('createContainer', () => {
    describe('execution container target', () => {
      it('should create a new execution container', () => {
        updateBitriseYmlDocumentByString(yaml`
        workflows:
          wf1: {}
      `);

        const container: ContainerModel = {
          type: ContainerType.Execution,
          image: 'ubuntu:20.04',
        };

        ContainerService.createContainer('my-container', container);

        const expectedYml = yaml`
        workflows:
          wf1: {}
        containers:
          my-container:
            type: execution
            image: ubuntu:20.04
      `;

        expect(getYmlString()).toEqual(expectedYml);
      });

      it('should create a container with credentials', () => {
        updateBitriseYmlDocumentByString(yaml``);

        const container: ContainerModel = {
          type: ContainerType.Execution,
          image: 'registry.example.com/private:latest',
          credentials: {
            username: '$DOCKER_USERNAME',
            password: '$DOCKER_PASSWORD',
          },
        };

        ContainerService.createContainer('private-container', container);

        const expectedYml = yaml`
        containers:
          private-container:
            type: execution
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
          type: ContainerType.Execution,
          image: 'nginx:latest',
          ports: ['8080:80', '8443:443'],
          envs: [{ ENV: 'production' }, { DEBUG: 'false' }],
          options: '--memory=2g --cpus=2',
        };

        ContainerService.createContainer('web-container', container);

        const expectedYml = yaml`
        containers:
          web-container:
            type: execution
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

      it('should create an execution container, if containers section exist', () => {
        updateBitriseYmlDocumentByString(yaml`
        containers:
          existing-container:
            type: execution
            image: existing:v1
      `);

        const container: ContainerModel = {
          type: ContainerType.Execution,
          image: 'test:latest',
          credentials: {
            username: '',
            password: '',
          },
          envs: [],
          options: '',
        };

        ContainerService.createContainer('test-container', container);

        const expectedYml = yaml`
        containers:
          existing-container:
            type: execution
            image: existing:v1
          test-container:
            type: execution
            image: test:latest
      `;

        expect(getYmlString()).toEqual(expectedYml);
      });

      it('should filter out empty credentials', () => {
        updateBitriseYmlDocumentByString(yaml``);

        const container: ContainerModel = {
          type: ContainerType.Execution,
          image: 'test:latest',
          credentials: {
            username: '$USERNAME',
            password: '',
          },
        };

        ContainerService.createContainer('test-container', container);

        const expectedYml = yaml`
        containers:
          test-container:
            type: execution
            image: test:latest
            credentials:
              username: $USERNAME
      `;

        expect(getYmlString()).toEqual(expectedYml);
      });

      it('should filter out empty fields', () => {
        updateBitriseYmlDocumentByString(yaml``);

        const container: ContainerModel = {
          type: ContainerType.Execution,
          image: 'test:latest',
          credentials: {
            username: '',
            password: '',
          },
          envs: [],
          options: '',
        };

        ContainerService.createContainer('test-container', container);

        const expectedYml = yaml`
        containers:
          test-container:
            type: execution
            image: test:latest
      `;

        expect(getYmlString()).toEqual(expectedYml);
      });

      it('should throw an error if container already exists', () => {
        updateBitriseYmlDocumentByString(yaml`
        containers:
          existing-container:
            type: execution
            image: ubuntu:20.04
      `);

        const container: ContainerModel = {
          type: ContainerType.Execution,
          image: 'ubuntu:22.04',
        };

        expect(() => ContainerService.createContainer('existing-container', container)).toThrow(
          "Container 'existing-container' already exists",
        );
      });
    });
    describe('service container target', () => {
      it('should create a new service container', () => {
        updateBitriseYmlDocumentByString(yaml`
        workflows:
          wf1: {}
      `);

        const service: ContainerModel = {
          type: ContainerType.Service,
          image: 'postgres:13',
        };

        ContainerService.createContainer('postgres', service);

        const expectedYml = yaml`
        workflows:
          wf1: {}
        containers:
          postgres:
            type: service
            image: postgres:13
      `;

        expect(getYmlString()).toEqual(expectedYml);
      });

      it('should create a service container with ports by default', () => {
        updateBitriseYmlDocumentByString(yaml``);

        const service: ContainerModel = {
          type: ContainerType.Service,
          image: 'redis:6',
          ports: ['6379:6379'],
        };

        ContainerService.createContainer('redis', service);

        const expectedYml = yaml`
        containers:
          redis:
            type: service
            image: redis:6
            ports:
            - 6379:6379
      `;

        expect(getYmlString()).toEqual(expectedYml);
      });

      it('should throw an error if service already exists', () => {
        updateBitriseYmlDocumentByString(yaml`
        containers:
          existing-service:
            type: service
            image: mysql:8
      `);

        const service: ContainerModel = {
          type: ContainerType.Service,
          image: 'mysql:5',
        };

        expect(() => ContainerService.createContainer('existing-service', service)).toThrow(
          "Container 'existing-service' already exists",
        );
      });
    });
  });

  describe('deleteContainer', () => {
    describe('execution container target', () => {
      it('should delete an existing container', () => {
        updateBitriseYmlDocumentByString(yaml`
        containers:
          my-container:
            type: execution
            image: ubuntu:20.04
          other-container:
            type: execution
            image: ubuntu:22.04
      `);

        ContainerService.deleteContainer('my-container');

        const expectedYml = yaml`
        containers:
          other-container:
            type: execution
            image: ubuntu:22.04
      `;

        expect(getYmlString()).toEqual(expectedYml);
      });

      it('should remove containers section when last container is deleted', () => {
        updateBitriseYmlDocumentByString(yaml`
        containers:
          my-container:
            type: execution
            image: ubuntu:20.04
        workflows:
          wf1: {}
      `);

        ContainerService.deleteContainer('my-container');

        const expectedYml = yaml`
        workflows:
          wf1: {}
      `;

        expect(getYmlString()).toEqual(expectedYml);
      });

      it('should remove the container references from all workflow steps', () => {
        updateBitriseYmlDocumentByString(yaml`
        containers:
          my-container:
            type: execution
            image: ubuntu:20.04
          other-container:
            type: execution
            image: ubuntu:22.04
        workflows:
          wf1:
            steps:
              - script:
                  execution_container: my-container
              - script:
                  execution_container: my-container
          wf2:
            steps:
              - script:
                  execution_container: my-container
              - script:
                  execution_container: other-container
      `);

        ContainerService.deleteContainer('my-container');

        const expectedYml = yaml`
        containers:
          other-container:
            type: execution
            image: ubuntu:22.04
        workflows:
          wf1:
            steps:
              - script: {}
              - script: {}
          wf2:
            steps:
              - script: {}
              - script:
                  execution_container: other-container
      `;

        expect(getYmlString()).toEqual(expectedYml);
      });

      it('should throw an error and not delete anything if container id not found', () => {
        updateBitriseYmlDocumentByString(yaml`
        containers:
          my-container:
            type: execution
            image: ubuntu:20.04
          other-container:
            type: execution
            image: ubuntu:22.04
        workflows:
          wf1:
            steps:
              - script:
                  execution_container: my-container
      `);

        expect(() => ContainerService.deleteContainer('third-container')).toThrow(
          "Container third-container not found. Ensure that the container exists in the 'containers' section.",
        );
      });

      it('should throw an error if container does not exist', () => {
        updateBitriseYmlDocumentByString(yaml`
        containers:
          my-container:
            type: execution
            image: ubuntu:20.04
        workflows:
          wf1: {}
      `);

        expect(() => ContainerService.deleteContainer('non-existent')).toThrow(
          "Container non-existent not found. Ensure that the container exists in the 'containers' section.",
        );
      });
    });
    describe('service container target', () => {
      it('should delete an existing service', () => {
        updateBitriseYmlDocumentByString(yaml`
        containers:
          postgres:
            type: service
            image: postgres:13
          redis:
            type: service
            image: redis:6
      `);

        ContainerService.deleteContainer('postgres');

        const expectedYml = yaml`
        containers:
          redis:
            type: service
            image: redis:6
      `;

        expect(getYmlString()).toEqual(expectedYml);
      });

      it('should remove services section when last service is deleted', () => {
        updateBitriseYmlDocumentByString(yaml`
        containers:
          postgres:
            type: service
            image: postgres:13
        workflows:
          wf1: {}
      `);

        ContainerService.deleteContainer('postgres');

        const expectedYml = yaml`
        workflows:
          wf1: {}
      `;

        expect(getYmlString()).toEqual(expectedYml);
      });

      it('should remove the container references from all workflow steps', () => {
        updateBitriseYmlDocumentByString(yaml`
        containers:
          ubuntu:
            type: execution
            image: ubuntu:20.04
          mysql:
            type: service
            ports:
            - "3306:3306"
          redis:
            type: service
            ports:
            - "6379:6379"
        workflows:
          wf1:
            steps:
            - script:
                execution_container: ubuntu
            - script:
                execution_container: ubuntu
                service_containers:
                - mysql
          wf2:
            steps:
            - script:
                execution_container: ubuntu
                service_containers:
                - mysql
                - redis
            - script:
                execution_container: ubuntu
                service_containers:
                - redis
      `);

        ContainerService.deleteContainer('mysql');

        const expectedYml = yaml`
        containers:
          ubuntu:
            type: execution
            image: ubuntu:20.04
          redis:
            type: service
            ports:
            - "6379:6379"
        workflows:
          wf1:
            steps:
            - script:
                execution_container: ubuntu
            - script:
                execution_container: ubuntu
          wf2:
            steps:
            - script:
                execution_container: ubuntu
                service_containers:
                - redis
            - script:
                execution_container: ubuntu
                service_containers:
                - redis
      `;

        expect(getYmlString()).toEqual(expectedYml);
      });

      it('should throw an error if service does not exist', () => {
        updateBitriseYmlDocumentByString(yaml``);

        expect(() => ContainerService.deleteContainer('non-existent')).toThrow(
          "Container non-existent not found. Ensure that the container exists in the 'containers' section.",
        );
      });
    });
  });

  describe('getAllContainers', () => {
    describe('execution container target', () => {
      it('should return all execution containers', () => {
        const containers: Containers = {
          'container-1': { type: 'execution', image: 'ubuntu:20.04' },
          'container-2': { type: 'execution', image: 'ubuntu:22.04' },
        };

        const result = ContainerService.getAllContainers(
          containers,
          (container) => container.userValues.type === ContainerType.Execution,
        );

        expect(result).toEqual([
          { id: 'container-1', userValues: { type: 'execution', image: 'ubuntu:20.04' } },
          { id: 'container-2', userValues: { type: 'execution', image: 'ubuntu:22.04' } },
        ]);
      });

      it('should return empty array if no containers exist', () => {
        const containers = ContainerService.getAllContainers({});
        expect(containers).toEqual([]);
      });

      it('should return all container fields including credentials, ports, envs, and options', () => {
        const containers: Containers = {
          'full-container': {
            type: 'execution',
            image: 'nginx:latest',
            credentials: {
              username: '$DOCKER_USER',
              password: '$DOCKER_PASS',
              server: 'registry.example.com',
            },
            ports: ['8080:80', '8443:443'],
            envs: [{ ENV: 'production' }, { DEBUG: 'false' }],
            options: '--memory=2g --cpus=2',
          },
          'minimal-container': {
            type: 'execution',
            image: 'ubuntu:20.04',
          },
        };

        const result = ContainerService.getAllContainers(
          containers,
          (container) => container.userValues.type === ContainerType.Execution,
        );

        expect(result).toEqual([
          {
            id: 'full-container',
            userValues: {
              type: 'execution',
              image: 'nginx:latest',
              credentials: {
                username: '$DOCKER_USER',
                password: '$DOCKER_PASS',
                server: 'registry.example.com',
              },
              ports: ['8080:80', '8443:443'],
              envs: [{ ENV: 'production' }, { DEBUG: 'false' }],
              options: '--memory=2g --cpus=2',
            },
          },
          {
            id: 'minimal-container',
            userValues: {
              type: 'execution',
              image: 'ubuntu:20.04',
            },
          },
        ]);
      });

      it('should filter out service containers', () => {
        const containers: Containers = {
          golang: { type: 'execution', image: 'golang:1.22' },
          redis: { type: 'service', image: 'redis:latest' },
          ubuntu: { type: 'execution', image: 'ubuntu:20.04' },
        };

        const result = ContainerService.getAllContainers(
          containers,
          (container) => container.userValues.type === ContainerType.Execution,
        );

        expect(result).toEqual([
          { id: 'golang', userValues: { type: 'execution', image: 'golang:1.22' } },
          { id: 'ubuntu', userValues: { type: 'execution', image: 'ubuntu:20.04' } },
        ]);
      });
    });

    describe('service container target', () => {
      it('should return all service containers', () => {
        const containers: Containers = {
          postgres: { type: 'service', image: 'postgres:13' },
          redis: { type: 'service', image: 'redis:6' },
        };

        const services = ContainerService.getAllContainers(
          containers,
          (container) => container.userValues.type === ContainerType.Service,
        );

        expect(services).toEqual([
          { id: 'postgres', userValues: { type: 'service', image: 'postgres:13' } },
          { id: 'redis', userValues: { type: 'service', image: 'redis:6' } },
        ]);
      });

      it('should return empty array if no services exist', () => {
        const services = ContainerService.getAllContainers({});
        expect(services).toEqual([]);
      });

      it('should filter out execution containers', () => {
        const containers: Containers = {
          postgres: { type: 'service', image: 'postgres:13' },
          golang: { type: 'execution', image: 'golang:1.22' },
          redis: { type: 'service', image: 'redis:6' },
        };

        const services = ContainerService.getAllContainers(
          containers,
          (container) => container.userValues.type === ContainerType.Service,
        );

        expect(services).toEqual([
          { id: 'postgres', userValues: { type: 'service', image: 'postgres:13' } },
          { id: 'redis', userValues: { type: 'service', image: 'redis:6' } },
        ]);
      });
    });
  });

  describe('getWorkflowsUsingContainer', () => {
    describe('execution container target', () => {
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

        const result1 = ContainerService.getWorkflowsUsingContainer(bitriseYmlStore.getState().ymlDocument, 'golang_1');
        const result2 = ContainerService.getWorkflowsUsingContainer(bitriseYmlStore.getState().ymlDocument, 'golang_2');

        expect(result1).toEqual(['test', 'build']);
        expect(result2).toEqual(['test']);
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

        const result = ContainerService.getWorkflowsUsingContainer(bitriseYmlStore.getState().ymlDocument, 'golang');

        expect(result).toEqual([]);
      });

      it('should return empty array if no workflows exist', () => {
        updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
      `);

        const result = ContainerService.getWorkflowsUsingContainer(
          bitriseYmlStore.getState().ymlDocument,
          'my-container',
        );

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

        const result = ContainerService.getWorkflowsUsingContainer(
          bitriseYmlStore.getState().ymlDocument,
          'non-existent',
        );

        expect(result).toEqual([]);
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

        const result = ContainerService.getWorkflowsUsingContainer(
          bitriseYmlStore.getState().ymlDocument,
          'my-container',
        );

        expect(result).toEqual(['wf1']);
      });
    });

    describe('service container target', () => {
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

        const result1 = ContainerService.getWorkflowsUsingContainer(bitriseYmlStore.getState().ymlDocument, 'postgres');
        const result2 = ContainerService.getWorkflowsUsingContainer(bitriseYmlStore.getState().ymlDocument, 'redis');

        expect(result1).toEqual(['test', 'integration']);
        expect(result2).toEqual(['test']);
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

        const result = ContainerService.getWorkflowsUsingContainer(bitriseYmlStore.getState().ymlDocument, 'postgres');

        expect(result).toEqual([]);
      });

      it('should return empty array if no workflows exist', () => {
        updateBitriseYmlDocumentByString(yaml`
        service_containers:
          postgres:
            image: postgres:13
      `);

        const result = ContainerService.getWorkflowsUsingContainer(bitriseYmlStore.getState().ymlDocument, 'postgres');

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

        const result = ContainerService.getWorkflowsUsingContainer(bitriseYmlStore.getState().ymlDocument, 'redis');

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

        const result = ContainerService.getWorkflowsUsingContainer(bitriseYmlStore.getState().ymlDocument, 'postgres');

        expect(result).toEqual(['test']);
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

        const result = ContainerService.getWorkflowsUsingContainer(bitriseYmlStore.getState().ymlDocument, 'postgres');

        expect(result).toEqual(['test']);
      });
    });
  });

  describe('removeContainerReference', () => {
    describe('execution container target', () => {
      it('should remove execution container reference from a workflow step', () => {
        updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
        workflows:
          wf1:
            steps:
              - script:
                  execution_container: my-container
              - second-step:
                  execution_container: my-container
      `);

        ContainerService.removeContainerReference('wf1', 0, 'my-container');

        const expectedYml = yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
        workflows:
          wf1:
            steps:
              - script: {}
              - second-step:
                  execution_container: my-container
      `;

        expect(getYmlString()).toEqual(expectedYml);
      });

      it('should not remove reference if container id not matched', () => {
        updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
          other-container:
            image: ubuntu:22.04
        workflows:
          wf1:
            steps:
              - script:
                  execution_container: my-container
      `);

        ContainerService.removeContainerReference('wf1', 0, 'other-container');

        const expectedYml = yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
          other-container:
            image: ubuntu:22.04
        workflows:
          wf1:
            steps:
              - script:
                  execution_container: my-container
      `;

        expect(getYmlString()).toEqual(expectedYml);
      });

      it('should throw an error if step does not exist', () => {
        updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
        workflows:
          wf1:
            steps:
              - script: {}
      `);

        expect(() => ContainerService.removeContainerReference('wf1', 5, 'my-container')).toThrow(
          'Step at index 5 not found in workflows.wf1',
        );
      });

      it('should throw an error if workflow does not exist', () => {
        updateBitriseYmlDocumentByString(yaml``);

        expect(() => ContainerService.removeContainerReference('non-existent', 0, 'my-container')).toThrow(
          "Workflow non-existent not found. Ensure that the workflow exists in the 'workflows' section.",
        );
      });
    });
    describe('service container target', () => {
      it('should not remove reference if container id not matched', () => {
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
                  service_containers:
                    - postgres
      `);

        ContainerService.removeContainerReference('wf1', 0, 'redis');

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
                  service_containers:
                    - postgres
      `;

        expect(getYmlString()).toEqual(expectedYml);
      });

      it('should not remove an empty step if no services remain', () => {
        updateBitriseYmlDocumentByString(yaml`
        service_containers:
          postgres:
            image: postgres:13
        workflows:
          wf1:
            steps:
              - script:
                  service_containers:
                    - postgres
      `);

        ContainerService.removeContainerReference('wf1', 0, 'postgres');

        const expectedYml = yaml`
        service_containers:
          postgres:
            image: postgres:13
        workflows:
          wf1:
            steps:
              - script: {}
      `;

        expect(getYmlString()).toEqual(expectedYml);
      });

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
                  service_containers:
                    - postgres
                    - redis
      `);

        ContainerService.removeContainerReference('wf1', 0, 'postgres');

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
                  service_containers:
                    - postgres
      `);

        ContainerService.removeContainerReference('wf1', 0, 'postgres');

        const expectedYml = yaml`
        service_containers:
          postgres:
            image: postgres:13
        workflows:
          wf1:
            steps:
              - script: {}
      `;

        expect(getYmlString()).toEqual(expectedYml);
      });

      it('should throw an error if step does not exist', () => {
        updateBitriseYmlDocumentByString(yaml`
        service_containers:
          my-container:
            image: ubuntu:20.04
        workflows:
          wf1:
            steps:
              - script: {}
      `);

        expect(() => ContainerService.removeContainerReference('wf1', 5, 'my-container')).toThrow(
          'Step at index 5 not found in workflows.wf1',
        );
      });

      it('should throw an error if workflow does not exist', () => {
        updateBitriseYmlDocumentByString(yaml``);

        expect(() => ContainerService.removeContainerReference('non-existent', 0, 'my-container')).toThrow(
          "Workflow non-existent not found. Ensure that the workflow exists in the 'workflows' section.",
        );
      });
    });
  });

  describe('updateContainerId', () => {
    it('should update container ID and all references in workflows', () => {
      updateBitriseYmlDocumentByString(yaml`
        containers:
          ubuntu:
            type: execution
            image: ubuntu:20.04
        workflows:
          wf1:
            steps:
            - script:
                execution_container: ubuntu
          wf2:
            steps:
            - deploy: {}
      `);

      ContainerService.updateContainerId('ubuntu', 'ubuntu20');

      const expectedYml = yaml`
        containers:
          ubuntu20:
            type: execution
            image: ubuntu:20.04
        workflows:
          wf1:
            steps:
            - script:
                execution_container: ubuntu20
          wf2:
            steps:
            - deploy: {}
      `;

      expect(getYmlString()).toBe(expectedYml);
    });

    it('should update service container ID and all references in workflows', () => {
      updateBitriseYmlDocumentByString(yaml`
        containers:
          ubuntu:
            type: service
            image: ubuntu:20.04
        workflows:
          wf1:
            steps:
            - script:
                service_containers:
                - ubuntu
          wf2:
            steps:
            - deploy:
                service_containers:
                - mysql
                - ubuntu
                - redis
      `);

      ContainerService.updateContainerId('ubuntu', 'ubuntu20');

      const expectedYml = yaml`
        containers:
          ubuntu20:
            type: service
            image: ubuntu:20.04
        workflows:
          wf1:
            steps:
            - script:
                service_containers:
                - ubuntu20
          wf2:
            steps:
            - deploy:
                service_containers:
                - mysql
                - ubuntu20
                - redis
      `;

      expect(getYmlString()).toBe(expectedYml);
    });

    it('should throw an error if container does not exist', () => {
      updateBitriseYmlDocumentByString(yaml`
        containers:
          ubuntu:
            type: execution
            image: ubuntu:20.04
      `);

      expect(() => ContainerService.updateContainerId('non-existent', 'new-id')).toThrow(
        "Container non-existent not found. Ensure that the container exists in the 'containers' section.",
      );
    });

    it('should throw an error if new container ID already exists', () => {
      updateBitriseYmlDocumentByString(yaml`
        containers:
          ubuntu:
            type: execution
            image: ubuntu:20.04
          ubuntu20:
            type: execution
            image: ubuntu:22.04
      `);

      expect(() => ContainerService.updateContainerId('ubuntu', 'ubuntu20')).toThrow(
        "Container 'ubuntu20' already exists.",
      );
    });
  });

  describe('updateContainerField', () => {
    it('should update a container field in an existing execution container', () => {
      updateBitriseYmlDocumentByString(yaml`
        containers:
          my-container:
            type: execution
            image: ubuntu:20.04
            envs:
            - ENV: updated
          other-container:
            type: execution
            image: ubuntu:23.00
      `);

      ContainerService.updateContainerField('my-container', 'image', 'ubuntu:22.04');

      const expectedYml = yaml`
        containers:
          my-container:
            type: execution
            image: ubuntu:22.04
            envs:
            - ENV: updated
          other-container:
            type: execution
            image: ubuntu:23.00
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should update a container field in an existing service container', () => {
      updateBitriseYmlDocumentByString(yaml`
        containers:
          postgres:
            type: service
            image: postgres:13
            envs:
            - ENV: updated
          golang:
            type: service
            image: golang:1.16
      `);

      ContainerService.updateContainerField('postgres', 'image', 'postgres:14');

      const expectedYml = yaml`
        containers:
          postgres:
            type: service
            image: postgres:14
            envs:
            - ENV: updated
          golang:
            type: service
            image: golang:1.16
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should add a new field to a container', () => {
      updateBitriseYmlDocumentByString(yaml`
        containers:
          my-container:
            type: execution
            image: ubuntu:20.04
      `);

      ContainerService.updateContainerField('my-container', 'options', '--memory=2g');

      const expectedYml = yaml`
        containers:
          my-container:
            type: execution
            image: ubuntu:20.04
            options: "--memory=2g"
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should remove a field when value is an empty array', () => {
      updateBitriseYmlDocumentByString(yaml`
        containers:
          my-container:
            type: execution
            image: nginx:latest
            ports:
              - 8080:80
              - 8443:443
      `);
      ContainerService.updateContainerField('my-container', 'ports', []);
      const expectedYml = yaml`
        containers:
          my-container:
            type: execution
            image: nginx:latest
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should remove a field when value is empty', () => {
      updateBitriseYmlDocumentByString(yaml`
        containers:
          my-container:
            type: execution
            image: ubuntu:20.04
            options: --memory=2g
      `);

      ContainerService.updateContainerField('my-container', 'options', '');

      const expectedYml = yaml`
        containers:
          my-container:
            type: execution
            image: ubuntu:20.04
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should remove a field when value is undefined', () => {
      updateBitriseYmlDocumentByString(yaml`
        containers:
          my-container:
            type: execution
            image: ubuntu:20.04
            options: --memory=2g
      `);

      ContainerService.updateContainerField('my-container', 'options', undefined);

      const expectedYml = yaml`
        containers:
          my-container:
            type: execution
            image: ubuntu:20.04
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should update ports field', () => {
      updateBitriseYmlDocumentByString(yaml`
        containers:
          my-container:
            type: execution
            image: nginx:latest
            ports:
            - 8080:80
      `);

      ContainerService.updateContainerField('my-container', 'ports', ['9090:80', '9443:443']);

      const expectedYml = yaml`
        containers:
          my-container:
            type: execution
            image: nginx:latest
            ports:
            - 9090:80
            - 9443:443
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should update envs field', () => {
      updateBitriseYmlDocumentByString(yaml`
        containers:
          my-container:
            type: execution
            image: ubuntu:20.04
      `);

      ContainerService.updateContainerField('my-container', 'envs', [{ ENV: 'production' }, { DEBUG: 'true' }]);

      const expectedYml = yaml`
        containers:
          my-container:
            type: execution
            image: ubuntu:20.04
            envs:
            - ENV: production
            - DEBUG: "true"
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if container does not exist', () => {
      updateBitriseYmlDocumentByString(yaml``);

      expect(() => ContainerService.updateContainerField('non-existent', 'image', 'ubuntu:20.04')).toThrow(
        "Container non-existent not found. Ensure that the container exists in the 'containers' section.",
      );
    });
  });

  describe('updateCredentialField', () => {
    it('should add username to container credentials', () => {
      updateBitriseYmlDocumentByString(yaml`
        containers:
          my-container:
            type: execution
            image: private.registry.com/image:latest
      `);

      ContainerService.updateCredentialField('my-container', 'username', '$DOCKER_USER');

      const expectedYml = yaml`
        containers:
          my-container:
            type: execution
            image: private.registry.com/image:latest
            credentials:
              username: $DOCKER_USER
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should update existing username', () => {
      updateBitriseYmlDocumentByString(yaml`
        containers:
          my-container:
            type: execution
            image: image:latest
            credentials:
              username: old-user
              password: pass
      `);

      ContainerService.updateCredentialField('my-container', 'username', 'new-user');

      const expectedYml = yaml`
        containers:
          my-container:
            type: execution
            image: image:latest
            credentials:
              username: new-user
              password: pass
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should add password to container credentials', () => {
      updateBitriseYmlDocumentByString(yaml`
        containers:
          my-container:
            type: execution
            image: private.registry.com/image:latest
            credentials:
              username: user
      `);

      ContainerService.updateCredentialField('my-container', 'password', '$DOCKER_PASS');

      const expectedYml = yaml`
        containers:
          my-container:
            type: execution
            image: private.registry.com/image:latest
            credentials:
              username: user
              password: $DOCKER_PASS
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should add registry server to container credentials', () => {
      updateBitriseYmlDocumentByString(yaml`
        containers:
          my-container:
            type: execution
            image: private.registry.com/image:latest
            credentials:
              username: user
              password: pass
      `);

      ContainerService.updateCredentialField('my-container', 'server', 'private.registry.com');

      const expectedYml = yaml`
        containers:
          my-container:
            type: execution
            image: private.registry.com/image:latest
            credentials:
              username: user
              password: pass
              server: private.registry.com
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should remove username when value is empty', () => {
      updateBitriseYmlDocumentByString(yaml`
        containers:
          my-container:
            type: execution
            image: image:latest
            credentials:
              username: user
              password: pass
      `);

      ContainerService.updateCredentialField('my-container', 'username', '');

      const expectedYml = yaml`
        containers:
          my-container:
            type: execution
            image: image:latest
            credentials:
              password: pass
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should remove password when value is empty', () => {
      updateBitriseYmlDocumentByString(yaml`
        containers:
          my-container:
            type: execution
            image: image:latest
            credentials:
              username: user
              password: pass
      `);

      ContainerService.updateCredentialField('my-container', 'password', '');

      const expectedYml = yaml`
        containers:
          my-container:
            type: execution
            image: image:latest
            credentials:
              username: user
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should remove credentials section when last credential is removed', () => {
      updateBitriseYmlDocumentByString(yaml`
        containers:
          my-container:
            type: execution
            image: image:latest
            credentials:
              username: user
      `);

      ContainerService.updateCredentialField('my-container', 'username', '');

      const expectedYml = yaml`
        containers:
          my-container:
            type: execution
            image: image:latest
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should work with service containers', () => {
      updateBitriseYmlDocumentByString(yaml`
        containers:
          postgres:
            type: service
            image: postgres:13
      `);

      ContainerService.updateCredentialField('postgres', 'username', '$DB_USER');
      ContainerService.updateCredentialField('postgres', 'password', '$DB_PASS');

      const expectedYml = yaml`
        containers:
          postgres:
            type: service
            image: postgres:13
            credentials:
              username: $DB_USER
              password: $DB_PASS
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if container does not exist', () => {
      updateBitriseYmlDocumentByString(yaml``);

      expect(() => ContainerService.updateCredentialField('non-existent', 'username', 'user')).toThrow(
        "Container non-existent not found. Ensure that the container exists in the 'containers' section.",
      );
    });
  });

  describe('updateContainerReferenceRecreate', () => {
    it('should update execution container recreate flag to true', () => {
      updateBitriseYmlDocumentByString(yaml`
        containers:
          my-container:
            type: execution
            image: ubuntu:20.04
          postgres:
            type: service
            image: postgres:13
          redis:
            type: service
            image: redis:6
        workflows:
          wf1:
            steps:
              - script:
                  execution_container: my-container
                  service_containers:
                    - postgres
              - script:
                  execution_container: my-container
                  service_containers:
                    - redis
      `);

      ContainerService.updateContainerReferenceRecreate('wf1', 0, ContainerType.Execution, 'my-container', true);

      const expectedYml = yaml`
        containers:
          my-container:
            type: execution
            image: ubuntu:20.04
          postgres:
            type: service
            image: postgres:13
          redis:
            type: service
            image: redis:6
        workflows:
          wf1:
            steps:
              - script:
                  execution_container:
                    my-container:
                      recreate: true
                  service_containers:
                    - postgres
              - script:
                  execution_container: my-container
                  service_containers:
                    - redis
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should update execution container recreate flag to false', () => {
      updateBitriseYmlDocumentByString(yaml`
        containers:
          my-container:
            type: execution
            image: ubuntu:20.04
          redis:
            type: service
            image: redis:6
        workflows:
          wf1:
            steps:
              - script:
                  execution_container:
                    my-container:
                      recreate: true
                  service_containers:
                    - redis
              - script:
                  execution_container:
                    my-container:
                      recreate: true
                  service_containers:
                    - redis
      `);

      ContainerService.updateContainerReferenceRecreate('wf1', 0, ContainerType.Execution, 'my-container', false);

      const expectedYml = yaml`
        containers:
          my-container:
            type: execution
            image: ubuntu:20.04
          redis:
            type: service
            image: redis:6
        workflows:
          wf1:
            steps:
              - script:
                  execution_container: my-container
                  service_containers:
                    - redis
              - script:
                  execution_container:
                    my-container:
                      recreate: true
                  service_containers:
                    - redis
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should update service container recreate flag to true', () => {
      updateBitriseYmlDocumentByString(yaml`
        containers:
          node:
            type: execution
            image: node:18
          postgres:
            type: service
            image: postgres:13
        workflows:
          wf1:
            steps:
              - script:
                  execution_container: node
                  service_containers:
                    - postgres
              - script:
                  execution_container: node
                  service_containers:
                    - postgres
      `);

      ContainerService.updateContainerReferenceRecreate('wf1', 0, ContainerType.Service, 'postgres', true);

      const expectedYml = yaml`
        containers:
          node:
            type: execution
            image: node:18
          postgres:
            type: service
            image: postgres:13
        workflows:
          wf1:
            steps:
              - script:
                  execution_container: node
                  service_containers:
                    - postgres:
                        recreate: true
              - script:
                  execution_container: node
                  service_containers:
                    - postgres
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should update service container recreate flag to false', () => {
      updateBitriseYmlDocumentByString(yaml`
        containers:
          python:
            type: execution
            image: python:3.9
          postgres:
            type: service
            image: postgres:13
        workflows:
          wf1:
            steps:
              - script:
                  execution_container: python
                  service_containers:
                    - postgres:
                        recreate: true
              - script:
                  execution_container: python
                  service_containers:
                    - postgres:
                        recreate: true
      `);

      ContainerService.updateContainerReferenceRecreate('wf1', 0, ContainerType.Service, 'postgres', false);

      const expectedYml = yaml`
        containers:
          python:
            type: execution
            image: python:3.9
          postgres:
            type: service
            image: postgres:13
        workflows:
          wf1:
            steps:
              - script:
                  execution_container: python
                  service_containers:
                    - postgres
              - script:
                  execution_container: python
                  service_containers:
                    - postgres:
                        recreate: true
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should update specific service container when multiple services exist', () => {
      updateBitriseYmlDocumentByString(yaml`
        containers:
          golang:
            type: execution
            image: golang:1.21
          postgres:
            type: service
            image: postgres:13
          redis:
            type: service
            image: redis:6
        workflows:
          wf1:
            steps:
              - script:
                  execution_container: golang
                  service_containers:
                    - postgres
                    - redis
              - script:
                  execution_container: golang
                  service_containers:
                    - postgres
                    - redis
      `);

      ContainerService.updateContainerReferenceRecreate('wf1', 0, ContainerType.Service, 'redis', true);

      const expectedYml = yaml`
        containers:
          golang:
            type: execution
            image: golang:1.21
          postgres:
            type: service
            image: postgres:13
          redis:
            type: service
            image: redis:6
        workflows:
          wf1:
            steps:
              - script:
                  execution_container: golang
                  service_containers:
                    - postgres
                    - redis:
                        recreate: true
              - script:
                  execution_container: golang
                  service_containers:
                    - postgres
                    - redis
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw error if execution container does not exist on step', () => {
      updateBitriseYmlDocumentByString(yaml`
        containers:
          my-container:
            type: execution
            image: ubuntu:20.04
          mysql:
            type: service
            image: mysql:8
        workflows:
          wf1:
            steps:
              - script:
                  service_containers:
                    - mysql
              - script:
                  execution_container: my-container
                  service_containers:
                    - mysql
      `);

      expect(() =>
        ContainerService.updateContainerReferenceRecreate('wf1', 0, ContainerType.Execution, 'my-container', true),
      ).toThrow("No 'execution_container' found on step at index 0");
    });

    it('should throw error if service containers do not exist on step', () => {
      updateBitriseYmlDocumentByString(yaml`
        containers:
          ruby:
            type: execution
            image: ruby:3.2
          postgres:
            type: service
            image: postgres:13
        workflows:
          wf1:
            steps:
              - script:
                  execution_container: ruby
              - script:
                  execution_container: ruby
                  service_containers:
                    - postgres
      `);

      expect(() =>
        ContainerService.updateContainerReferenceRecreate('wf1', 0, ContainerType.Service, 'postgres', true),
      ).toThrow("No 'service_containers' found on step at index 0");
    });

    it('should throw error if workflow does not exist', () => {
      updateBitriseYmlDocumentByString(yaml`
        containers:
          my-container:
            type: execution
            image: ubuntu:20.04
          mongodb:
            type: service
            image: mongo:6
        workflows:
          wf1:
            steps:
              - script:
                  execution_container: my-container
                  service_containers:
                    - mongodb
              - script:
                  execution_container: my-container
                  service_containers:
                    - mongodb
      `);

      expect(() =>
        ContainerService.updateContainerReferenceRecreate(
          'non-existent',
          0,
          ContainerType.Execution,
          'my-container',
          true,
        ),
      ).toThrow("Workflow non-existent not found. Ensure that the workflow exists in the 'workflows' section.");
    });
  });

  describe('validateName', () => {
    describe('when the initial name is empty', () => {
      it('returns true if container name is valid and unique', () => {
        const result = ContainerService.validateName('c4', '', ['c1', 'c2', 'c3']);
        expect(result).toBe(true);
      });

      it('returns error message when container name is empty', () => {
        const result = ContainerService.validateName('', '', ['c1', 'c2', 'c3']);
        expect(result).toBe('Container name is required');
      });

      it('returns error message when container name is whitespace only', () => {
        const result = ContainerService.validateName('   ', '', ['c1', 'c2', 'c3']);
        expect(result).toBe('Container name is required');
      });

      it('returns error message when container name contains invalid characters', () => {
        const result = ContainerService.validateName('invalid@name!', '', ['c1', 'c2', 'c3']);
        expect(result).toBe('Container name must only contain letters, numbers, dashes, underscores or periods');
      });

      it('returns error message when container name is not unique', () => {
        const result = ContainerService.validateName('c1', '', ['c1', 'c2', 'c3']);
        expect(result).toBe('Container name should be unique');
      });
    });

    describe('when the initial name is not empty', () => {
      it('returns true if container name is valid and unique', () => {
        const result = ContainerService.validateName('my-first-container', 'c1', ['c1', 'c2', 'c3']);
        expect(result).toBe(true);
      });

      it('returns error message when container name is empty', () => {
        const result = ContainerService.validateName('', 'c1', ['c1', 'c2', 'c3']);
        expect(result).toBe('Container name is required');
      });

      it('returns error message when container name is whitespace only', () => {
        const result = ContainerService.validateName('   ', 'c1', ['c1', 'c2', 'c3']);
        expect(result).toBe('Container name is required');
      });

      it('returns error message when container name contains invalid characters', () => {
        const result = ContainerService.validateName('invalid@name!', 'c1', ['c1', 'c2', 'c3']);
        expect(result).toBe('Container name must only contain letters, numbers, dashes, underscores or periods');
      });

      it('returns error message when container name is not unique', () => {
        const result = ContainerService.validateName('c2', 'c1', ['c1', 'c2', 'c3']);
        expect(result).toBe('Container name should be unique');
      });
    });
  });

  describe('sanitizeName', () => {
    it('returns the same name if it contains only valid characters', () => {
      const name = 'valid.name-123';
      const result = ContainerService.sanitizeName(name);
      expect(result).toBe('valid.name-123');
    });

    it('removes invalid characters from the name', () => {
      const name = '@name!';
      const result = ContainerService.sanitizeName(name);
      expect(result).toBe('name');
    });

    it('removes spaces from the name', () => {
      const name = ' name with spaces ';
      const result = ContainerService.sanitizeName(name);
      expect(result).toBe('namewithspaces');
    });

    it('returns an empty string if the name contains only invalid characters', () => {
      const name = '@!#$%^&*()';
      const result = ContainerService.sanitizeName(name);
      expect(result).toBe('');
    });
  });

  describe('validatePorts', () => {
    it('returns true for empty ports array', () => {
      const result = ContainerService.validatePorts([]);
      expect(result).toBe(true);
    });

    it('returns true for undefined ports', () => {
      const result = ContainerService.validatePorts(undefined);
      expect(result).toBe(true);
    });

    it('returns true for valid port ranges', () => {
      const result = ContainerService.validatePorts(['1:1', '65535:65535', '8080:8080']);
      expect(result).toBe(true);
    });

    it('returns error message for invalid port format without colon', () => {
      const result = ContainerService.validatePorts(['3000']);
      expect(result).toBe('Port mappings must be in the format [HostPort]:[ContainerPort] (e.g., 3000:3000)');
    });

    it('returns error message for invalid port format with multiple colons', () => {
      const result = ContainerService.validatePorts(['3000:8080:9090']);
      expect(result).toBe('Port mappings must be in the format [HostPort]:[ContainerPort] (e.g., 3000:3000)');
    });

    it('returns error message for invalid port format with letters', () => {
      const result = ContainerService.validatePorts(['abc:3000', '8080:def']);
      expect(result).toBe('Port mappings must be in the format [HostPort]:[ContainerPort] (e.g., 3000:3000)');
    });

    it('returns error message for port numbers below valid range', () => {
      const result = ContainerService.validatePorts(['0:3000']);
      expect(result).toBe('Port numbers must be between 1 and 65535');
    });

    it('returns error message for port numbers above valid range', () => {
      const result = ContainerService.validatePorts(['70000:3000']);
      expect(result).toBe('Port numbers must be between 1 and 65535');
    });

    it('returns error message for container port out of range', () => {
      const result = ContainerService.validatePorts(['3000:70000']);
      expect(result).toBe('Port numbers must be between 1 and 65535');
    });

    it('returns error message for duplicate host ports', () => {
      const result = ContainerService.validatePorts(['3000:8080', '3000:9090']);
      expect(result).toBe('Host ports must be unique');
    });

    it('allows same container port with different host ports', () => {
      const result = ContainerService.validatePorts(['3000:8080', '4000:8080']);
      expect(result).toBe(true);
    });

    it('returns error message for multiple invalid conditions', () => {
      const result = ContainerService.validatePorts(['invalid', '3000:3000', '3000:8080']);
      expect(result).toBe('Port mappings must be in the format [HostPort]:[ContainerPort] (e.g., 3000:3000)');
    });

    it('returns error message for empty strings in port array', () => {
      const result = ContainerService.validatePorts(['']);
      expect(result).toBe('Port mappings must be in the format [HostPort]:[ContainerPort] (e.g., 3000:3000)');
    });

    it('returns error message for port with only colon', () => {
      const result = ContainerService.validatePorts([':']);
      expect(result).toBe('Port mappings must be in the format [HostPort]:[ContainerPort] (e.g., 3000:3000)');
    });

    it('returns error message for negative port numbers', () => {
      const result = ContainerService.validatePorts(['-1:3000']);
      expect(result).toBe('Port mappings must be in the format [HostPort]:[ContainerPort] (e.g., 3000:3000)');
    });
  });
});
