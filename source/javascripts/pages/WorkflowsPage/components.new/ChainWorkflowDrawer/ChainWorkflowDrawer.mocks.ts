import { BitriseYml } from '@/core/models/BitriseYml';

export const mockYml: BitriseYml = {
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
