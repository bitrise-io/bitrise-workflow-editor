import BitriseYmlService, { BitriseYml } from './BitriseYml';

const yml: BitriseYml = {
  format_version: '',
  pipelines: {
    pl1: {
      stages: [{ st1: {} }],
    },
    pl2: {
      stages: [{ st1: {}, st2: {}, st3: { workflows: [{ wf1: {} }] } }],
    },
  },
  stages: {
    st1: { workflows: [{ wf1: {} }] },
    st2: { workflows: [{ wf1: {}, wf2: {} }] },
  },
  workflows: {
    wf1: {},
    wf2: { before_run: ['wf1'], after_run: ['wf1'] },
    wf3: { before_run: ['wf1', 'wf2'], after_run: ['wf1', 'wf2'] },
  },
  trigger_map: [{ workflow: 'wf1' }, { workflow: 'wf2' }, { workflow: 'wf3' }],
};

describe('BitriseYml', () => {
  describe('deleteWorkflow', () => {
    it('should remove a workflow in the whole yml completely', () => {
      const actual = BitriseYmlService.deleteWorkflow(yml, 'wf1');

      const expected: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            stages: [{ st1: {} }],
          },
          pl2: {
            stages: [{ st1: {}, st2: {}, st3: {} }],
          },
        },
        stages: {
          st1: {},
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
