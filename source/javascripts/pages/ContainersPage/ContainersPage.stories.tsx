import { Meta, StoryObj } from '@storybook/react-vite';
import { set } from 'es-toolkit/compat';
import { stringify } from 'yaml';

import { TreeNode } from '@/core/models/Tree';
import { FileSlice } from '@/core/stores/BitriseYmlStore';
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
        ruby: {
          type: 'execution',
          image: '1.1',
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

// Modular config with the root file (`bitrise.yml`) active. `shared-db` is defined in both the root
// and an included module (so it shows the "defined in …" provenance + jump-to-definition), while the
// module-only containers (`node`, `redis`) are hidden — the page is scoped to the active module.
export const Modular: StoryObj<typeof ContainersPage> = {
  parameters: {
    bitriseYmlStore: (() => {
      const SHA = 'a1b2c3d4e5f6789012345678901234567890abcd';

      const rootYml = [
        'containers:',
        '  golang:',
        '    type: execution',
        '    image: golang:1.22',
        '  shared-db:',
        '    type: service',
        '    image: postgres:16',
        '    ports: ["5432:5432"]',
        '',
      ].join('\n');

      const moduleYml = [
        'containers:',
        '  node:',
        '    type: execution',
        '    image: node:20',
        '  shared-db:',
        '    type: service',
        '    image: postgres:16',
        '  redis:',
        '    type: service',
        '    image: redis:latest',
        '    ports: ["6379:6379"]',
        '',
      ].join('\n');

      const rootDoc = YmlUtils.toDoc(rootYml);
      const moduleDoc = YmlUtils.toDoc(moduleYml);

      const slice = (nodeId: string, path: string, doc: typeof rootDoc): FileSlice => ({
        nodeId,
        path,
        source: null,
        commitSha: SHA,
        editable: true,
        ymlDocument: doc,
        savedYmlDocument: doc,
      });

      const tree: TreeNode = {
        nodeId: 'root',
        path: 'bitrise.yml',
        contents: rootYml,
        source: null,
        commitSha: SHA,
        editable: true,
        includes: [
          {
            nodeId: 'n_mod',
            path: 'ci/containers.yml',
            contents: moduleYml,
            source: { path: 'ci/containers.yml', repository: null, branch: null, tag: null, commit: null },
            commitSha: SHA,
            editable: true,
            includes: [],
          },
        ],
      };

      return {
        tree,
        files: {
          root: slice('root', 'bitrise.yml', rootDoc),
          n_mod: slice('n_mod', 'ci/containers.yml', moduleDoc),
        },
        selectedNodeId: 'root',
        ymlDocument: rootDoc,
        savedYmlDocument: rootDoc,
        yml: YmlUtils.toJSON(rootDoc),
        // Left empty on purpose: the store's live subscriber rebuilds the entity index from the file
        // documents above, so `shared-db` ends up defined in both the root and the module.
      };
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
