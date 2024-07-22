import { BitriseYml } from '@/models/BitriseYml';

export const mockYml: BitriseYml = {
  format_version: '13',
  workflows: {
    wf1: {
      envs: [
        {
          TEST: 'hello',
          opts: { is_expand: true },
        },
      ],
    },
    wf2: {},
    wf3: {
      before_run: ['_utility1'],
      after_run: ['_utility2'],
    },
    _utility1: {},
    _utility2: {},
  },
};
