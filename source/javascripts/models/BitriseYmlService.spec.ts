import { BitriseYml } from './BitriseYml';
import BitriseYmlService from './BitriseYmlService';

describe('BitriseYmlService', () => {
  describe('deleteWorkflow', () => {
    it('should remove a workflow in the whole yml completely', () => {
      const yml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            stages: [{ st1: {} }],
          },
          pl2: {
            stages: [{ st1: { workflows: [{ wf1: {} }] } }, { st2: { workflows: [{ wf1: {} }, { wf2: {} }] } }],
          },
        },
        stages: {
          st1: { workflows: [{ wf1: {} }] },
          st2: { workflows: [{ wf1: {} }, { wf2: {} }] },
        },
        workflows: {
          wf1: {},
          wf2: { before_run: ['wf1'], after_run: ['wf1'] },
          wf3: { before_run: ['wf1', 'wf2'], after_run: ['wf1', 'wf2'] },
        },
        trigger_map: [{ workflow: 'wf1' }, { workflow: 'wf2' }, { workflow: 'wf3' }],
      };

      const actual = BitriseYmlService.deleteWorkflow(yml, 'wf1');

      const expected: BitriseYml = {
        format_version: '',
        pipelines: {
          pl2: {
            stages: [{ st2: { workflows: [{ wf2: {} }] } }],
          },
        },
        stages: {
          st2: { workflows: [{ wf2: {} }] },
        },
        workflows: {
          wf2: {},
          wf3: { before_run: ['wf2'], after_run: ['wf2'] },
        },
        trigger_map: [{ workflow: 'wf2' }, { workflow: 'wf3' }],
      };

      expect(actual).toEqual(expected);
    });
  });
});
