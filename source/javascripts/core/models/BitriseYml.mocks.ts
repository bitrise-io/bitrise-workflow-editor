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
    empty: {},
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
          'path::./spec/integration/fixture/test_local_step': {},
        },
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
          stack: 'stack-0',
          machine_type_id: 'machine-1',
        },
      },
    },
    wf2: {
      steps: [{ 'save-cache@1.2.0': {} }, { 'script@1.1.5': {} }, { 'restore-cache@2.4.0': {} }],
      meta: { 'bitrise.io': { stack: 'stack-invalid', machine_type_id: 'machine-invalid' } },
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
      meta: { 'bitrise.io': { machine_type_id: 'machine-invalid' } },
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
      stack: 'stack-1',
      machine_type_id: 'machine-2',
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

export { MockYml, ChainableMockYml };
