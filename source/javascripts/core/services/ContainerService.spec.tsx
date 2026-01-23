import { ContainerModel } from '@/core/models/BitriseYml';
import { ContainerSource } from '@/core/models/Container';
import { bitriseYmlStore, getYmlString, updateBitriseYmlDocumentByString } from '@/core/stores/BitriseYmlStore';

import ContainerService from './ContainerService';

describe('ContainerService', () => {
  describe('addContainerReference', () => {
    describe('execution container target', () => {
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

        ContainerService.addContainerReference('wf1', 0, 'my-container', ContainerSource.Execution);

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

      it('should set the container reference even if one already exists', () => {
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
                  title: Test
                  execution_container: other-container
      `);

        ContainerService.addContainerReference('wf1', 0, 'my-container', ContainerSource.Execution);

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

        expect(() =>
          ContainerService.addContainerReference('wf1', 0, 'non-existent', ContainerSource.Execution),
        ).toThrow("Container non-existent not found. Ensure that it exists in the 'execution_containers' section.");
      });

      it('should throw an error if workflow does not exist', () => {
        updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
      `);

        expect(() =>
          ContainerService.addContainerReference('non-existent', 0, 'my-container', ContainerSource.Execution),
        ).toThrow("Workflow non-existent not found. Ensure that the workflow exists in the 'workflows' section.");
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

        expect(() =>
          ContainerService.addContainerReference('wf1', 5, 'my-container', ContainerSource.Execution),
        ).toThrow('Step at index 5 not found in workflows.wf1');
      });
    });
    describe('service container target', () => {
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

        ContainerService.addContainerReference('wf1', 0, 'postgres', ContainerSource.Service);

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

        ContainerService.addContainerReference('wf1', 0, 'redis', ContainerSource.Service);

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

        expect(() => ContainerService.addContainerReference('wf1', 0, 'postgres', ContainerSource.Service)).toThrow(
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

        expect(() => ContainerService.addContainerReference('wf1', 0, 'non-existent', ContainerSource.Service)).toThrow(
          "Container non-existent not found. Ensure that it exists in the 'service_containers' section.",
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

      it('should create an execution container, if execution containers section exist', () => {
        updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          existing-container:
            image: existing:v1
      `);

        const container: ContainerModel = {
          image: 'test:latest',
          credentials: {
            username: '',
            password: '',
          },
          envs: [],
          options: '',
        };

        ContainerService.createContainer('test-container', container, ContainerSource.Execution);

        const expectedYml = yaml`
        execution_containers:
          existing-container:
            image: existing:v1
          test-container:
            image: test:latest
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

      it('should filter out empty fields', () => {
        updateBitriseYmlDocumentByString(yaml``);

        const container: ContainerModel = {
          image: 'test:latest',
          credentials: {
            username: '',
            password: '',
          },
          envs: [],
          options: '',
        };

        ContainerService.createContainer('test-container', container, ContainerSource.Execution);

        const expectedYml = yaml`
        execution_containers:
          test-container:
            image: test:latest
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
    describe('service container target', () => {
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
  });

  describe('deleteContainer', () => {
    describe('execution container target', () => {
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

        const expectedYml = yaml`
        workflows:
          wf1: {}
      `;

        expect(getYmlString()).toEqual(expectedYml);
      });

      it('should remove the container references from all workflow steps', () => {
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
              - script:
                  execution_container: my-container
          wf2:
            steps:
              - script:
                  execution_container: my-container
              - script:
                  execution_container: other-container
      `);

        ContainerService.deleteContainer('my-container', ContainerSource.Execution);

        const expectedYml = yaml`
        execution_containers:
          other-container:
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

        expect(() => ContainerService.deleteContainer('third-container', ContainerSource.Execution)).toThrow(
          "Container third-container not found. Ensure that it exists in the 'execution_containers' section.",
        );
      });

      it('should throw an error if container does not exist', () => {
        updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
        workflows:
          wf1: {}
      `);

        expect(() => ContainerService.deleteContainer('non-existent', ContainerSource.Execution)).toThrow(
          "Container non-existent not found. Ensure that it exists in the 'execution_containers' section.",
        );
      });
    });
    describe('service container target', () => {
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

        const expectedYml = yaml`
        workflows:
          wf1: {}
      `;

        expect(getYmlString()).toEqual(expectedYml);
      });

      it('should remove the container references from all workflow steps', () => {
        updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          ubuntu:
            image: ubuntu:20.04
        service_containers:
          mysql:
            ports:
            - "3306:3306"
          redis:
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

        ContainerService.deleteContainer('mysql', ContainerSource.Service);

        const expectedYml = yaml`
        execution_containers:
          ubuntu:
            image: ubuntu:20.04
        service_containers:
          redis:
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

        expect(() => ContainerService.deleteContainer('non-existent', ContainerSource.Service)).toThrow(
          "Container non-existent not found. Ensure that it exists in the 'service_containers' section.",
        );
      });
    });
  });

  describe('getAllContainers', () => {
    describe('execution container target', () => {
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
          { id: 'container-1', userValues: { image: 'ubuntu:20.04' } },
          { id: 'container-2', userValues: { image: 'ubuntu:22.04' } },
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

      it('should return all container fields including credentials, ports, envs, and options', () => {
        updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          full-container:
            image: nginx:latest
            credentials:
              username: $DOCKER_USER
              password: $DOCKER_PASS
              server: registry.example.com
            ports:
            - 8080:80
            - 8443:443
            envs:
            - ENV: production
            - DEBUG: "false"
            options: --memory=2g --cpus=2
          minimal-container:
            image: ubuntu:20.04
      `);

        const doc = bitriseYmlStore.getState().ymlDocument;
        const containers = ContainerService.getAllContainers(doc, ContainerSource.Execution);

        expect(containers).toEqual([
          {
            id: 'full-container',
            userValues: {
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
              image: 'ubuntu:20.04',
            },
          },
        ]);
      });
    });

    describe('service container target', () => {
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
          { id: 'postgres', userValues: { image: 'postgres:13' } },
          { id: 'redis', userValues: { image: 'redis:6' } },
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

        const doc = bitriseYmlStore.getState().ymlDocument;
        const result1 = ContainerService.getWorkflowsUsingContainer(doc, 'golang_1', ContainerSource.Execution);
        const result2 = ContainerService.getWorkflowsUsingContainer(doc, 'golang_2', ContainerSource.Execution);

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

        const doc = bitriseYmlStore.getState().ymlDocument;
        const result1 = ContainerService.getWorkflowsUsingContainer(doc, 'postgres', ContainerSource.Service);
        const result2 = ContainerService.getWorkflowsUsingContainer(doc, 'redis', ContainerSource.Service);

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

        ContainerService.removeContainerReference('wf1', 0, ContainerSource.Execution, 'my-container');

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

        ContainerService.removeContainerReference('wf1', 0, ContainerSource.Execution, 'other-container');

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

      it('should throw an error if container does not exist', () => {
        updateBitriseYmlDocumentByString(yaml`
        workflows:
          wf1:
            steps:
              - script: {}
      `);

        expect(() =>
          ContainerService.removeContainerReference('wf1', 0, ContainerSource.Execution, 'other-container'),
        ).toThrow(`Container other-container not found. Ensure that it exists in the 'execution_containers' section.`);
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

        expect(() =>
          ContainerService.removeContainerReference('wf1', 5, ContainerSource.Execution, 'my-container'),
        ).toThrow('Step at index 5 not found in workflows.wf1');
      });

      it('should throw an error if workflow does not exist', () => {
        updateBitriseYmlDocumentByString(yaml``);

        expect(() =>
          ContainerService.removeContainerReference('non-existent', 0, ContainerSource.Execution, 'my-container'),
        ).toThrow("Workflow non-existent not found. Ensure that the workflow exists in the 'workflows' section.");
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

        ContainerService.removeContainerReference('wf1', 0, ContainerSource.Service, 'redis');

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

        ContainerService.removeContainerReference('wf1', 0, ContainerSource.Service, 'postgres');

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

        ContainerService.removeContainerReference('wf1', 0, ContainerSource.Service, 'postgres');

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

        ContainerService.removeContainerReference('wf1', 0, ContainerSource.Service, 'postgres');

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

      it('should throw an error if container does not exist', () => {
        updateBitriseYmlDocumentByString(yaml`
        workflows:
          wf1:
            steps:
              - script: {}
      `);

        expect(() =>
          ContainerService.removeContainerReference('wf1', 0, ContainerSource.Service, 'other-container'),
        ).toThrow(`Container other-container not found. Ensure that it exists in the 'service_containers' section.`);
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

        expect(() =>
          ContainerService.removeContainerReference('wf1', 5, ContainerSource.Service, 'my-container'),
        ).toThrow('Step at index 5 not found in workflows.wf1');
      });

      it('should throw an error if workflow does not exist', () => {
        updateBitriseYmlDocumentByString(yaml``);

        expect(() =>
          ContainerService.removeContainerReference('non-existent', 0, ContainerSource.Service, 'my-container'),
        ).toThrow("Workflow non-existent not found. Ensure that the workflow exists in the 'workflows' section.");
      });
    });
  });

  describe('updateContainerId', () => {
    it('should update container ID and all references in workflows', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          ubuntu:
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

      ContainerService.updateContainerId('ubuntu', 'ubuntu20', ContainerSource.Execution);

      const expectedYml = yaml`
        execution_containers:
          ubuntu20:
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
        service_containers:
          ubuntu:
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

      ContainerService.updateContainerId('ubuntu', 'ubuntu20', ContainerSource.Service);

      const expectedYml = yaml`
        service_containers:
          ubuntu20:
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
        execution_containers:
          ubuntu:
            image: ubuntu:20.04
      `);

      expect(() => ContainerService.updateContainerId('non-existent', 'new-id', ContainerSource.Execution)).toThrow(
        "Container non-existent not found. Ensure that it exists in the 'execution_containers' section.",
      );
    });

    it('should throw an error if new container ID already exists', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          ubuntu:
            image: ubuntu:20.04
          ubuntu20:
            image: ubuntu:22.04
      `);

      expect(() => ContainerService.updateContainerId('ubuntu', 'ubuntu20', ContainerSource.Execution)).toThrow(
        "Container 'ubuntu20' already exists.",
      );
    });
  });

  describe('updateContainerField', () => {
    it('should update a container field in an existing execution container', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
            envs:
            - ENV: updated
          other-container:
            image: ubuntu:23.00
      `);

      ContainerService.updateContainerField('my-container', 'image', 'ubuntu:22.04', ContainerSource.Execution);

      const expectedYml = yaml`
        execution_containers:
          my-container:
            image: ubuntu:22.04
            envs:
            - ENV: updated
          other-container:
            image: ubuntu:23.00
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should update a container field in an existing service container', () => {
      updateBitriseYmlDocumentByString(yaml`
        service_containers:
          postgres:
            image: postgres:13
            envs:
            - ENV: updated
          golang:
            image: golang:1.16
      `);

      ContainerService.updateContainerField('postgres', 'image', 'postgres:14', ContainerSource.Service);

      const expectedYml = yaml`
        service_containers:
          postgres:
            image: postgres:14
            envs:
            - ENV: updated
          golang:
            image: golang:1.16
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should add a new field to a container', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
      `);

      ContainerService.updateContainerField('my-container', 'options', '--memory=2g', ContainerSource.Execution);

      const expectedYml = yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
            options: "--memory=2g"
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should remove a field when value is an empty array', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: nginx:latest
            ports:
              - 8080:80
              - 8443:443
      `);
      ContainerService.updateContainerField('my-container', 'ports', [], ContainerSource.Execution);
      const expectedYml = yaml`
        execution_containers:
          my-container:
            image: nginx:latest
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should remove a field when value is empty', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
            options: --memory=2g
      `);

      ContainerService.updateContainerField('my-container', 'options', '', ContainerSource.Execution);

      const expectedYml = yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should remove a field when value is undefined', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
            options: --memory=2g
      `);

      ContainerService.updateContainerField('my-container', 'options', undefined, ContainerSource.Execution);

      const expectedYml = yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should update ports field', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: nginx:latest
            ports:
            - 8080:80
      `);

      ContainerService.updateContainerField(
        'my-container',
        'ports',
        ['9090:80', '9443:443'],
        ContainerSource.Execution,
      );

      const expectedYml = yaml`
        execution_containers:
          my-container:
            image: nginx:latest
            ports:
            - 9090:80
            - 9443:443
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should update envs field', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
      `);

      ContainerService.updateContainerField(
        'my-container',
        'envs',
        [{ ENV: 'production' }, { DEBUG: 'true' }],
        ContainerSource.Execution,
      );

      const expectedYml = yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
            envs:
            - ENV: production
            - DEBUG: "true"
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if container does not exist', () => {
      updateBitriseYmlDocumentByString(yaml``);

      expect(() =>
        ContainerService.updateContainerField('non-existent', 'image', 'ubuntu:20.04', ContainerSource.Execution),
      ).toThrow("Container non-existent not found. Ensure that it exists in the 'execution_containers' section.");
    });
  });

  describe('updateCredentialField', () => {
    it('should add username to container credentials', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: private.registry.com/image:latest
      `);

      ContainerService.updateCredentialField('my-container', 'username', '$DOCKER_USER', ContainerSource.Execution);

      const expectedYml = yaml`
        execution_containers:
          my-container:
            image: private.registry.com/image:latest
            credentials:
              username: $DOCKER_USER
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should update existing username', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: image:latest
            credentials:
              username: old-user
              password: pass
      `);

      ContainerService.updateCredentialField('my-container', 'username', 'new-user', ContainerSource.Execution);

      const expectedYml = yaml`
        execution_containers:
          my-container:
            image: image:latest
            credentials:
              username: new-user
              password: pass
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should add password to container credentials', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: private.registry.com/image:latest
            credentials:
              username: user
      `);

      ContainerService.updateCredentialField('my-container', 'password', '$DOCKER_PASS', ContainerSource.Execution);

      const expectedYml = yaml`
        execution_containers:
          my-container:
            image: private.registry.com/image:latest
            credentials:
              username: user
              password: $DOCKER_PASS
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should add registry server to container credentials', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: private.registry.com/image:latest
            credentials:
              username: user
              password: pass
      `);

      ContainerService.updateCredentialField(
        'my-container',
        'server',
        'private.registry.com',
        ContainerSource.Execution,
      );

      const expectedYml = yaml`
        execution_containers:
          my-container:
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
        execution_containers:
          my-container:
            image: image:latest
            credentials:
              username: user
              password: pass
      `);

      ContainerService.updateCredentialField('my-container', 'username', '', ContainerSource.Execution);

      const expectedYml = yaml`
        execution_containers:
          my-container:
            image: image:latest
            credentials:
              password: pass
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should remove password when value is empty', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: image:latest
            credentials:
              username: user
              password: pass
      `);

      ContainerService.updateCredentialField('my-container', 'password', '', ContainerSource.Execution);

      const expectedYml = yaml`
        execution_containers:
          my-container:
            image: image:latest
            credentials:
              username: user
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should remove credentials section when last credential is removed', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: image:latest
            credentials:
              username: user
      `);

      ContainerService.updateCredentialField('my-container', 'username', '', ContainerSource.Execution);

      const expectedYml = yaml`
        execution_containers:
          my-container:
            image: image:latest
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should work with service containers', () => {
      updateBitriseYmlDocumentByString(yaml`
        service_containers:
          postgres:
            image: postgres:13
      `);

      ContainerService.updateCredentialField('postgres', 'username', '$DB_USER', ContainerSource.Service);
      ContainerService.updateCredentialField('postgres', 'password', '$DB_PASS', ContainerSource.Service);

      const expectedYml = yaml`
        service_containers:
          postgres:
            image: postgres:13
            credentials:
              username: $DB_USER
              password: $DB_PASS
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if container does not exist', () => {
      updateBitriseYmlDocumentByString(yaml``);

      expect(() =>
        ContainerService.updateCredentialField('non-existent', 'username', 'user', ContainerSource.Execution),
      ).toThrow("Container non-existent not found. Ensure that it exists in the 'execution_containers' section.");
    });
  });

  describe('updateContainerReference', () => {
    it('should update execution container recreate flag to true', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
        service_containers:
          postgres:
            image: postgres:13
          redis:
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

      ContainerService.updateContainerReference('wf1', 0, ContainerSource.Execution, true, 'my-container');

      const expectedYml = yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
        service_containers:
          postgres:
            image: postgres:13
          redis:
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
        execution_containers:
          my-container:
            image: ubuntu:20.04
        service_containers:
          redis:
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

      ContainerService.updateContainerReference('wf1', 0, ContainerSource.Execution, false, 'my-container');

      const expectedYml = yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
        service_containers:
          redis:
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
        execution_containers:
          node:
            image: node:18
        service_containers:
          postgres:
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

      ContainerService.updateContainerReference('wf1', 0, ContainerSource.Service, true, 'postgres');

      const expectedYml = yaml`
        execution_containers:
          node:
            image: node:18
        service_containers:
          postgres:
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
        execution_containers:
          python:
            image: python:3.9
        service_containers:
          postgres:
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

      ContainerService.updateContainerReference('wf1', 0, ContainerSource.Service, false, 'postgres');

      const expectedYml = yaml`
        execution_containers:
          python:
            image: python:3.9
        service_containers:
          postgres:
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
        execution_containers:
          golang:
            image: golang:1.21
        service_containers:
          postgres:
            image: postgres:13
          redis:
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

      ContainerService.updateContainerReference('wf1', 0, ContainerSource.Service, true, 'redis');

      const expectedYml = yaml`
        execution_containers:
          golang:
            image: golang:1.21
        service_containers:
          postgres:
            image: postgres:13
          redis:
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
        execution_containers:
          my-container:
            image: ubuntu:20.04
        service_containers:
          mysql:
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
        ContainerService.updateContainerReference('wf1', 0, ContainerSource.Execution, true, 'my-container'),
      ).toThrow('No execution container found on step at index 0');
    });

    it('should throw error if service containers do not exist on step', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          ruby:
            image: ruby:3.2
        service_containers:
          postgres:
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
        ContainerService.updateContainerReference('wf1', 0, ContainerSource.Service, true, 'postgres'),
      ).toThrow('No service containers found on step at index 0');
    });

    it('should throw error if workflow does not exist', () => {
      updateBitriseYmlDocumentByString(yaml`
        execution_containers:
          my-container:
            image: ubuntu:20.04
        service_containers:
          mongodb:
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
        ContainerService.updateContainerReference('non-existent', 0, ContainerSource.Execution, true, 'my-container'),
      ).toThrow("Workflow non-existent not found. Ensure that the workflow exists in the 'workflows' section.");
    });
  });
});
