import { BitriseYml } from '@/models/BitriseYml';

export const mockYml: BitriseYml = {
  format_version: '13',
  workflows: {
    wf1: {
      before_run: ['_utility1'],
      steps: [
        { 'restore-dart-cache@2': {} },
        { 'activate-ssh-key@4': {} },
        { 'flutter-installer@0': {} },
        { 'flutter-analyze@0': {} },
        { 'flutter-test@1': {} },
        { 'flutter-build@0': {} },
        { 'save-dart-cache@1': {} },
      ],
      after_run: ['_utility2'],
      envs: [{ TEST: 'hello', opts: { is_expand: true } }],
    },
    wf2: {},
    _utility1: {
      steps: [{ 'git-clone@8': {} }],
    },
    _utility2: {
      steps: [{ 'deploy-to-bitrise-io@2': {} }],
    },
  },
};
