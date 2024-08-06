import { BitriseYml } from './BitriseYml';
import BitriseYmlService from './BitriseYmlService';

describe('BitriseYmlService', () => {
  describe('createWorkflow', () => {
    it('should create an empty workflow if base workflow is missing', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: { wf1: {} },
      };

      const actualYml = BitriseYmlService.createWorkflow('wf1', sourceYml);

      expect(actualYml).toStrictEqual(expectedYml);
    });

    it('should create a workflow based on an other workflow', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: { wf1: { title: 'Workflow Title', steps: [{ 'script@1': {} }] } },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { title: 'Workflow Title', steps: [{ 'script@1': {} }] },
          wf2: { title: 'Workflow Title', steps: [{ 'script@1': {} }] },
        },
      };

      const actualYml = BitriseYmlService.createWorkflow('wf2', sourceYml, 'wf1');

      expect(actualYml).toStrictEqual(expectedYml);
    });
  });

  describe('deleteWorkflow', () => {
    it('should remove a workflow in the whole yml completely', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            stages: [{ st1: {} }],
          },
          pl2: {
            stages: [{ st1: {} }, { st2: {} }],
          },
          pl3: {
            stages: [
              { st1: { workflows: [{ wf1: {} }] } },
              { st1: { workflows: [{ wf1: {} }, { wf2: {} }] } },
              { st2: { workflows: [{ wf1: {} }, { wf2: {} }] } },
            ],
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

      const expectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl2: {
            stages: [{ st2: {} }],
          },
          pl3: {
            stages: [{ st1: { workflows: [{ wf2: {} }] } }, { st2: { workflows: [{ wf2: {} }] } }],
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

      const updatedYml = BitriseYmlService.deleteWorkflow('wf1', sourceYml);
      const updatedYmlAsString = JSON.stringify(updatedYml, null, 2);
      const expectedYmlAsString = JSON.stringify(expectedYml, null, 2);

      expect(updatedYml).toStrictEqual(expectedYml);
      expect(updatedYmlAsString).toEqual(expectedYmlAsString);
    });

    it('should keep pipelines with stage references which have workflows', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {},
          wf2: {},
        },
        stages: {
          st1: { workflows: [{ wf1: {} }] },
          st2: { workflows: [{ wf1: {} }, { wf2: {} }] },
        },
        pipelines: {
          pl1: { stages: [{ st1: {} }] },
          pl2: { stages: [{ st1: {}, st2: {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf2: {},
        },
        stages: {
          st2: { workflows: [{ wf2: {} }] },
        },
        pipelines: {
          pl2: { stages: [{ st2: {} }] },
        },
      };

      expect(BitriseYmlService.deleteWorkflow('wf1', sourceYml)).toStrictEqual(expectedYml);
    });
  });
});
