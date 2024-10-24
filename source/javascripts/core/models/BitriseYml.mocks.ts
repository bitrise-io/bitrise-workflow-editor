import { BitriseYml } from '@/core/models/BitriseYml';

const MockYml: BitriseYml = {
  format_version: '13',
  pipelines: {
    pl1: {
      stages: [{ st1: {} }],
    },
    pl2: {
      stages: [{ st1: {} }, { st2: {} }],
    },
  },
  stages: {
    st1: {
      workflows: [{ wf1: {} }],
    },
    st2: {
      workflows: [{ wf1: {} }, { wf2: {} }],
    },
  },
  workflows: {
    wf1: {
      steps: [
        { 'activate-ssh-key': {} },
        { 'git-clone@8.2.1': {} },
        {
          'script@1.1': {
            inputs: [
              {
                content: 'echo "Hello, World!"',
                script_file_path: './scripts/my-script',
              },
            ],
          },
        },
        {
          'script@1': {},
        },
        {
          npm: {
            title: 'NPM with custom icon',
            inputs: [{ command: 'install' }],
            asset_urls: {
              'icon.png': 'https://freepngimg.com/save/112753-garfield-free-png-hq/256x256.png',
            },
          },
        },
        {
          'chuck-norris': {},
        },
        {
          with: {
            container: 'ruby:3.2',
            services: ['postgres', 'redis'],
            steps: [{ 'script@1': {} }, { 'script@1': {} }],
          },
        },
        {
          'bundle::install_deps': {
            title: 'Bundled steps',
            steps: [{ 'script@1': {} }, { 'script@1': {} }],
          },
        },
        {
          'path::./spec/integration/fixture/test_local_step': {},
        },
        {
          'path::./spec/integration/fixture/test_local_step': {
            title: 'A local step with overwritten title',
            inputs: [{ company_name: 'Bitrise 2' }],
          },
        },
        { 'path::./spec/integration/fixture/test_local_step': { title: '' } },
        {
          'git::https://github.com/bitrise-steplib/steps-deploy-to-bitrise-io': {},
        },
        {
          'git::https://github.com/bitrise-steplib/steps-deploy-to-bitrise-io@next': {},
        },
        {
          'https://github.com/bitrise-steplib/steps-deploy-to-bitrise-io@master': {},
        },
      ],
      meta: {
        'bitrise.io': {
          stack: 'osx-stack',
        },
      },
    },
    wf2: {
      steps: [{ 'save-cache@1.2.0': {} }, { 'script@1.1.5': {} }, { 'restore-cache@2.4.0': {} }],
      meta: { 'bitrise.io': { stack: 'invalid-stack', machine_type_id: 'invalid-machine' } },
    },
    wf3: {
      before_run: ['_utility1'],
      steps: [
        { 'restore-dart-cache@2': { is_always_run: true, run_if: '.CI' } },
        { 'activate-ssh-key@4': {} },
        { 'flutter-installer@0': {} },
        { 'flutter-analyze@0': {} },
        { 'flutter-test@1': {} },
        { 'flutter-build@0': {} },
        { 'save-dart-cache@1': {} },
      ],
      after_run: ['_utility2'],
      envs: [{ '!TEST': 'hello', opts: { is_expand: true } }],
      meta: { 'bitrise.io': { machine_type_id: 'invalid-machine' } },
    },
    empty: {},
    'with-group': {
      steps: [
        {
          with: {
            container: 'ruby:3.2',
            services: ['postgres', 'redis'],
            steps: [{ 'script@1': {} }, { 'script@1': {} }],
          },
        },
      ],
    },
    'step-bundle': {
      steps: [
        {
          'bundle::install_deps': {
            title: 'Bundled steps',
            steps: [{ 'script@1': {} }, { 'script@1': {} }],
          },
        },
      ],
    },
    _utility1: {
      steps: [{ 'git-clone@8': { outputs: [{ title: 'Output' }] } }],
    },
    _utility2: {
      steps: [{ 'deploy-to-bitrise-io@2': {} }],
    },
    'invalid_wf !': {},
  },
  meta: {
    'bitrise.io': {
      stack: 'linux-stack',
      machine_type_id: 'machine-3',
    },
  },
};

const ChainableMockYml: BitriseYml = {
  format_version: '13',
  workflows: {
    'wf-1': {},
    'direct-before_run-wf-1': {
      before_run: ['wf-1'],
    },
    'direct-after_run-wf-1': {
      after_run: ['wf-1'],
    },
    'indirect-usage-of-wf-1': {
      before_run: ['direct-before_run-wf-1'],
      after_run: ['direct-after_run-wf-1'],
    },
    'wf-2': {
      before_run: ['wf-1'],
    },
    'wf-3': {
      before_run: ['wf-2'],
      after_run: ['wf-4'],
    },
    'wf-4': {
      after_run: ['wf-5'],
    },
    'wf-5': {},
    'this-is-an-unnecessarily-long-workflow-name-which-should-not-be-able-to-fit': {},
  },
};

const MockYmlWithTriggers: BitriseYml = {
  ...MockYml,
  trigger_map: [
    {
      workflow: 'wf1',
      push_branch: 'master',
    },
    {
      workflow: 'wf2',
      push_branch: 'release',
    },
    {
      workflow: 'wf3',
      pull_request_target_branch: '*',
    },
  ],
  workflows: {
    a_release_IOS: {
      triggers: {
        push: [
          {
            branch: 'main',
            enabled: false,
          },
        ],
        tag: [
          {
            name: {
              regex: '^\\d\\.\\d\\.\\d$',
            },
          },
        ],
        pull_request: [
          {
            comment: '[workflow: deploy]',
          },
          {
            commit_message: {
              regex: '.*\\[workflow: deploy\\].*',
            },
          },
        ],
      },
    },
    c_staging_IOS: {
      triggers: {
        pull_request: [
          {
            target_branch: 'main',
            source_branch: 'approved',
            enabled: false,
          },
        ],
      },
    },
  },
  pipelines: {
    b_staging_IOS: {
      triggers: {
        push: [
          {
            branch: 'staging',
            enabled: false,
          },
        ],
      },
    },
  },
};

export { MockYml, ChainableMockYml, MockYmlWithTriggers };
