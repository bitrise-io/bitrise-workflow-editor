import { BitriseYml } from '@/core/models/BitriseYml';

export const mockYml: BitriseYml = {
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
