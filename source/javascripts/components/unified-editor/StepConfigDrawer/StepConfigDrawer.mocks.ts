import { BitriseYml } from '@/core/models/BitriseYml';

export const mockYml: BitriseYml = {
  format_version: '13',
  workflows: {
    wf1: {
      steps: [{ 'git-clone@8.2.1': {} }, { 'script@1': {} }],
    },
  },
};
