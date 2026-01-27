import { Meta, StoryObj } from '@storybook/react-vite';
import { set } from 'es-toolkit/compat';
import { stringify } from 'yaml';

import YmlUtils from '@/core/utils/YmlUtils';

import ContainersPage from './ContainersPage';

const meta: Meta<typeof ContainersPage> = {
  component: ContainersPage,
  parameters: {
    layout: 'fullscreen',
  },
};

export const Default: StoryObj<typeof ContainersPage> = {
  parameters: {
    bitriseYmlStore: (() => {
      set(TEST_BITRISE_YML, 'containers', {
        golang: {
          type: 'execution',
          image: 'golang:1.22',
        },
        python: {
          type: 'execution',
          image: 'python:3.11',
          env: ['PYTHONUNBUFFERED=1'],
        },
        node: {
          type: 'execution',
          image: 'node:20-alpine',
          env: ['NODE_ENV=test'],
        },
        redis: {
          type: 'service',
          image: 'redis:latest',
          ports: ['6379:6379'],
          options: '--health-cmd "redis-cli ping" --health-interval 10s --health-timeout 5s --health-retries 5',
        },
        mongodb: {
          type: 'service',
          image: 'mongo:7',
          ports: ['27017:27017'],
          env: ['MONGO_INITDB_ROOT_USERNAME=admin', 'MONGO_INITDB_ROOT_PASSWORD=password'],
          options:
            '--health-cmd "mongosh --eval \'db.adminCommand({ping:1})\'" --health-interval 10s --health-timeout 5s --health-retries 5',
        },
        mysql: {
          type: 'service',
          image: 'mysql:8',
          ports: ['3306:3306'],
          env: ['MYSQL_ROOT_PASSWORD=rootpass', 'MYSQL_DATABASE=testdb'],
          options:
            '--health-cmd "mysqladmin ping -h localhost" --health-interval 10s --health-timeout 5s --health-retries 5',
        },
      });
      set(TEST_BITRISE_YML, 'workflows.golang-test', {
        steps: [
          {
            'script@1': {
              execution_container: 'golang',
              service_containers: ['redis', 'mongodb'],
            },
          },
        ],
      });
      set(TEST_BITRISE_YML, 'workflows.second-golang-test', {
        steps: [
          {
            'script@1': {
              execution_container: 'golang',
              service_containers: ['redis'],
            },
          },
        ],
      });
      set(TEST_BITRISE_YML, 'workflows.python-test', {
        steps: [
          {
            'script@1': {
              execution_container: 'python',
            },
          },
        ],
      });
      return { yml: TEST_BITRISE_YML, ymlDocument: YmlUtils.toDoc(stringify(TEST_BITRISE_YML)) };
    })(),
  },
};

export const EmptyState: StoryObj<typeof ContainersPage> = {
  parameters: {
    bitriseYmlStore: (() => {
      const yml = set(TEST_BITRISE_YML, 'containers', {});
      return { yml, ymlDocument: YmlUtils.toDoc(stringify(yml)) };
    })(),
  },
};

export default meta;
