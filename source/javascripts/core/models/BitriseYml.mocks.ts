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
      ],
      meta: {
        'bitrise.io': {
          stack: 'Ubuntu 20.04',
          machine_type_id: 'Standard',
        },
      },
    },
    wf2: {
      steps: [{ 'save-cache@1.2.0': {} }, { 'script@1.1.5': {} }, { 'restore-cache@2.4.0': {} }],
    },
  },
  meta: {
    'bitrise.io': {
      stack: 'MacOS NextGen',
      machine_type_id: 'M4 MAX Pro',
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
