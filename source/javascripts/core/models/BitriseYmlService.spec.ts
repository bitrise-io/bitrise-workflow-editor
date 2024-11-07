// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from '@jest/globals';
import type { MatcherFunction } from 'expect';
import { BitriseYml } from './BitriseYml';
import BitriseYmlService from './BitriseYmlService';
import { ChainedWorkflowPlacement } from './Workflow';
import { EnvVarYml } from './EnvVar';

const toMatchBitriseYml: MatcherFunction<[expected: BitriseYml]> = function m(actual, expected) {
  const objectsAreEquals = this.equals(actual, expected, undefined, true);

  if (!objectsAreEquals) {
    return {
      pass: false,
      message: () => this.utils.printDiffOrStringify(expected, actual, 'Expected', 'Received', false),
    };
  }

  const actualString = JSON.stringify(actual, null, 2);
  const expectedString = JSON.stringify(expected, null, 2);
  const stringsAreEquals = this.equals(actualString, expectedString);

  if (!stringsAreEquals) {
    return {
      pass: false,
      message: () => this.utils.printDiffOrStringify(expectedString, actualString, 'Expected', 'Received', false),
    };
  }

  return {
    pass: true,
    message: () => this.utils.printDiffOrStringify(expected, actual, 'Expected', 'Received', false),
  };
};

expect.extend({ toMatchBitriseYml });

describe('BitriseYmlService', () => {
  describe('addStep', () => {
    it('should add step to a given index', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ script: {} }, { 'apk-info@1.4.6': {} }, { clone: {} }, { deploy: {} }],
          },
        },
      };

      const actualYml = BitriseYmlService.addStep('wf1', 'apk-info@1.4.6', 1, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    describe('when workflow does not exists', () => {
      it('should return the original YML', () => {
        const sourceYmlAndExpectedYml: BitriseYml = {
          format_version: '',
          workflows: {
            wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
          },
        };

        const actualYml = BitriseYmlService.addStep('wf2', 'apk-info@1.4.6', 1, sourceYmlAndExpectedYml);

        expect(actualYml).toMatchBitriseYml(sourceYmlAndExpectedYml);
      });
    });

    describe('when the given index too high', () => {
      it('should put the step to the end of the list', () => {
        const sourceYml: BitriseYml = {
          format_version: '',
          workflows: {
            wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
          },
        };

        const expectedYml: BitriseYml = {
          format_version: '',
          workflows: {
            wf1: {
              steps: [{ script: {} }, { clone: {} }, { deploy: {} }, { 'apk-info@1.4.6': {} }],
            },
          },
        };

        const actualYml = BitriseYmlService.addStep('wf1', 'apk-info@1.4.6', 10, sourceYml);

        expect(actualYml).toMatchBitriseYml(expectedYml);
      });
    });

    describe('when the given index too low', () => {
      it('should put the step to the start of the list', () => {
        const sourceYml: BitriseYml = {
          format_version: '',
          workflows: {
            wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
          },
        };

        const expectedYml: BitriseYml = {
          format_version: '',
          workflows: {
            wf1: {
              steps: [{ 'apk-info@1.4.6': {} }, { script: {} }, { clone: {} }, { deploy: {} }],
            },
          },
        };

        const actualYml = BitriseYmlService.addStep('wf1', 'apk-info@1.4.6', -5, sourceYml);

        expect(actualYml).toMatchBitriseYml(expectedYml);
      });
    });
  });

  describe('moveStep', () => {
    it('should move step to the expected place', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ deploy: {} }, { script: {} }, { clone: {} }] },
        },
      };

      const actualYml = BitriseYmlService.moveStep('wf1', 2, 0, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should return the original BitriseYml if workflow does not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const actualYml = BitriseYmlService.moveStep('wf2', 2, 0, sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should return the original BitriseYml if stepIndex is out of range', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const actualYml = BitriseYmlService.moveStep('wf1', 3, 0, sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should move the step to the bound if destination is out of range', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ clone: {} }, { deploy: {} }, { script: {} }] },
        },
      };

      const actualYml = BitriseYmlService.moveStep('wf1', 0, 4, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

  describe('renameWorkflow', () => {
    it('should be rename an existing workflow', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: { stages: [{ st1: {} }] },
          pl2: { stages: [{ st2: { workflows: [{ wf2: {} }] } }] },
        },
        stages: {
          st1: { workflows: [{ wf1: {} }] },
          st2: { workflows: [{ wf2: {} }] },
        },
        workflows: {
          wf1: { before_run: ['wf2'], after_run: ['wf2'] },
          wf2: {},
        },
        trigger_map: [{ workflow: 'wf1' }, { workflow: 'wf2' }],
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: { stages: [{ st1: {} }] },
          pl2: { stages: [{ st2: { workflows: [{ wf3: {} }] } }] },
        },
        stages: {
          st1: { workflows: [{ wf1: {} }] },
          st2: { workflows: [{ wf3: {} }] },
        },
        workflows: {
          wf1: { before_run: ['wf3'], after_run: ['wf3'] },
          wf3: {},
        },
        trigger_map: [{ workflow: 'wf1' }, { workflow: 'wf3' }],
      };

      const actualYml = BitriseYmlService.renameWorkflow('wf2', 'wf3', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    describe('when workflow does not exists', () => {
      it('should return the original yml', () => {
        const sourceAndExpectedYml: BitriseYml = {
          format_version: '',
          pipelines: {
            pl1: { stages: [{ st1: {} }] },
            pl2: { stages: [{ st2: { workflows: [{ wf2: {} }] } }] },
          },
          stages: {
            st1: { workflows: [{ wf1: {} }] },
            st2: { workflows: [{ wf2: {} }] },
          },
          workflows: {
            wf1: { before_run: ['wf2'], after_run: ['wf2'] },
            wf2: {},
          },
          trigger_map: [{ workflow: 'wf1' }, { workflow: 'wf2' }],
        };

        const actualYml = BitriseYmlService.renameWorkflow('wf3', 'wf4', sourceAndExpectedYml);

        expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
      });
    });
  });

  describe('cloneStep', () => {
    it('should clone a step to the expected place', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ script: {} }, { clone: {} }, { clone: {} }, { deploy: {} }],
          },
        },
      };

      const actualYml = BitriseYmlService.cloneStep('wf1', 1, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should return the original BitriseYml if workflow is not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const actualYml = BitriseYmlService.cloneStep('wf2', 1, sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should return the original BitriseYml if step on is not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const actualYml = BitriseYmlService.cloneStep('wf1', 5, sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });
  });

  describe('updateStep', () => {
    it('should update the step at the given index', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [
              {
                'step-id@1.0.0': {
                  title: 'old title',
                  source_code_url: 'https://source.code',
                },
              },
            ],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [
              {
                'step-id@1.0.0': {
                  title: 'new title',
                  source_code_url: 'https://source.code',
                },
              },
            ],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStep('wf1', 0, { title: 'new title' }, {}, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should delete the property if the new value is empty', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [
              {
                'step-id@1.0.0': {
                  title: 'old title',
                  source_code_url: 'https://source.code',
                },
              },
            ],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ 'step-id@1.0.0': { source_code_url: 'https://source.code' } }],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStep('wf1', 0, { title: '' }, {}, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should delete the property if it is the default value', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [
              {
                'step-id@1.0.0': {
                  title: 'default title',
                  source_code_url: 'https://source.code',
                },
              },
            ],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ 'step-id@1.0.0': { source_code_url: 'https://source.code' } }],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStep(
        'wf1',
        0,
        { title: 'default title' },
        { title: 'default title' },
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should return the original YML if the workflow or step does not exist', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ 'step-id@1.0.0': { title: 'old title' } }],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStep('wf2', 0, { title: 'new title' }, {}, sourceYml);

      expect(actualYml).toMatchBitriseYml(sourceYml);
    });
  });

  describe('changeStepVersion', () => {
    it('should upgrade the step version at the given index', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ 'script@1.0.0': {} }, { 'clone@1.0.0': {} }, { 'deploy@1.0.0': {} }],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ 'script@1.0.0': {} }, { 'clone@2.1.0': {} }, { 'deploy@1.0.0': {} }],
          },
        },
      };

      const actualYml = BitriseYmlService.changeStepVersion('wf1', 1, '2.1.0', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should append version if the step does not have one', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ script: {} }, { 'clone@2.0.0': {} }, { deploy: {} }],
          },
        },
      };

      const actualYml = BitriseYmlService.changeStepVersion('wf1', 1, '2.0.0', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should remove the step version is empty string is given', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ 'script@1.0.0': {} }, { 'clone@1.0.0': {} }, { 'deploy@1.0.0': {} }],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ 'script@1.0.0': {} }, { clone: {} }, { 'deploy@1.0.0': {} }],
          },
        },
      };

      const actualYml = BitriseYmlService.changeStepVersion('wf1', 1, '', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should return the original YML if the workflow does not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const actualYml = BitriseYmlService.changeStepVersion('wf2', 1, '2.0.0', sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should return the original YML if the step does not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const actualYml = BitriseYmlService.changeStepVersion('wf1', 3, '2.0.0', sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });
  });

  describe('updateStepInputs', () => {
    it('should update the inputs of the step at the given index', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [
              { clone: {} },
              { script: { inputs: [{ other: 'value' }, { contents: 'echo "Hello, World!"' }] } },
              { test: {} },
            ],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [
              { clone: {} },
              { script: { inputs: [{ other: 'value' }, { contents: 'echo "Hello, Bitrise!"' }] } },
              { test: {} },
            ],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepInputs(
        'wf1',
        1,
        [{ other: 'value' }, { contents: 'echo "Hello, Bitrise!"' }],
        [{ contents: '' }, { other: '' }],
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should write a boolean value correctly', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ clone: {} }, { script: {} }, { test: {} }],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ clone: {} }, { script: { inputs: [{ is_debug: false }] } }, { test: {} }],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepInputs(
        'wf1',
        1,
        [{ is_debug: 'false' }],
        [{ is_debug: true }],
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should write a number value correctly', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ clone: {} }, { script: {} }, { test: {} }],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ clone: {} }, { script: { inputs: [{ count: 123 }] } }, { test: {} }],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepInputs('wf1', 1, [{ count: '123' }], [{ count: 0 }], sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should write a string value correctly', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ clone: {} }, { script: {} }, { test: {} }],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ clone: {} }, { script: { inputs: [{ script_path: '/path/to/script' }] } }, { test: {} }],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepInputs(
        'wf1',
        1,
        [{ script_path: '/path/to/script' }],
        [{ script_path: '' }],
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should not overwrite input opts', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [
              { clone: {} },
              {
                script: {
                  inputs: [{ contents: '{{.isCI}}', opts: { is_template: false } }],
                },
              },
              { test: {} },
            ],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepInputs(
        'wf1',
        1,
        [
          {
            contents: '{{.isCI}}',
            opts: { is_template: true },
          },
        ],
        [{ contents: '' }],
        sourceAndExpectedYml,
      );

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should delete the input if the value is empty', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [
              { clone: {} },
              {
                script: {
                  inputs: [{ script_path: '/path/to/script' }, { is_debug: true }],
                },
              },
              { test: {} },
            ],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ clone: {} }, { script: { inputs: [{ is_debug: true }] } }, { test: {} }],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepInputs(
        'wf1',
        1,
        [{ script_path: '' }, { is_debug: true }],
        [{ script_path: 'default/script/path' }, { is_debug: false }],
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should delete the input if the value is the default value', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [
              { clone: {} },
              {
                script: {
                  inputs: [{ contents: 'echo "Hello, Bitrise!' }, { is_debug: true }],
                },
              },
              { test: {} },
            ],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ clone: {} }, { script: { inputs: [{ is_debug: true }] } }, { test: {} }],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepInputs(
        'wf1',
        1,
        [{ contents: 'echo "Hello, World!"' }, { is_debug: true }],
        [{ contents: 'echo "Hello, World!"' }, { is_debug: false }],
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should delete the inputs field if empty', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ clone: {} }, { script: { inputs: [{ is_debug: true }] } }, { test: {} }],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ clone: {} }, { script: {} }, { test: {} }],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepInputs(
        'wf1',
        1,
        [{ is_debug: false }],
        [{ is_debug: false }],
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should return the original YML if the workflow or step does not exist', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const actualYml = BitriseYmlService.updateStepInputs('wf1', 3, [], [], sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

  describe('deleteStep', () => {
    it('should delete the step at the given index', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }, { deploy: {} }] },
        },
      };

      const actualYml = BitriseYmlService.deleteStep('wf1', 1, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should return the original YML if the workflow does not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const actualYml = BitriseYmlService.deleteStep('wf2', 1, sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should return the original YML if the step does not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const actualYml = BitriseYmlService.deleteStep('wf1', 3, sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should remove the steps property if it becomes empty after deletion', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {},
        },
      };

      const actualYml = BitriseYmlService.deleteStep('wf1', 0, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

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

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should create a workflow based on an other workflow', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { title: 'Workflow Title', steps: [{ 'script@1': {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { title: 'Workflow Title', steps: [{ 'script@1': {} }] },
          wf2: { title: 'Workflow Title', steps: [{ 'script@1': {} }] },
        },
      };

      const actualYml = BitriseYmlService.createWorkflow('wf2', sourceYml, 'wf1');

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

  describe('updateWorkflow', () => {
    it('should be update the given workflow', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: { wf1: { title: 'title', summary: 'summary' } },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: { wf1: { summary: 'summary', description: 'description' } },
      };

      const actualYml = BitriseYmlService.updateWorkflow('wf1', { title: '', description: 'description' }, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    describe('when workflow does not exists', () => {
      it('should return the original yml', () => {
        const sourceAndExpectedYml: BitriseYml = {
          format_version: '',
          workflows: { wf1: { title: 'title', summary: 'summary' } },
        };

        const actualYml = BitriseYmlService.updateWorkflow('wf2', { description: 'description' }, sourceAndExpectedYml);

        expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
      });
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

      const actualYml = BitriseYmlService.deleteWorkflow('wf1', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
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

      const actualYml = BitriseYmlService.deleteWorkflow('wf1', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

  describe('deleteWorkflows', () => {
    it('should remove the given workflows', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: { wf1: {}, wf2: {}, wf3: {} },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: { wf2: {} },
      };

      const actualYml = BitriseYmlService.deleteWorkflows(['wf1', 'wf3'], sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

  describe('addChainedWorkflow', () => {
    const placements: ChainedWorkflowPlacement[] = ['after_run', 'before_run'];

    placements.forEach((placement) => {
      describe(`when placement is '${placement}'`, () => {
        it('should create placement with chained workflow', () => {
          const sourceYml: BitriseYml = {
            format_version: '',
            workflows: { wf1: {}, wf2: {} },
          };

          const expectedYml: BitriseYml = {
            format_version: '',
            workflows: { wf1: { [placement]: ['wf2'] }, wf2: {} },
          };

          const actualYml = BitriseYmlService.addChainedWorkflow('wf2', 'wf1', placement, sourceYml);

          expect(actualYml).toMatchBitriseYml(expectedYml);
        });

        it('should insert chainable workflow to the end of the list', () => {
          const sourceYml: BitriseYml = {
            format_version: '',
            workflows: { wf1: { [placement]: ['wf2'] }, wf2: {}, wf3: {} },
          };

          const expectedYml: BitriseYml = {
            format_version: '',
            workflows: {
              wf1: { [placement]: ['wf2', 'wf3'] },
              wf2: {},
              wf3: {},
            },
          };

          const actualYml = BitriseYmlService.addChainedWorkflow('wf3', 'wf1', placement, sourceYml);

          expect(actualYml).toMatchBitriseYml(expectedYml);
        });

        it('should be able to insert chained workflow multiple times', () => {
          const sourceYml: BitriseYml = {
            format_version: '',
            workflows: { wf1: { [placement]: ['wf2'] }, wf2: {} },
          };

          const expectedYml: BitriseYml = {
            format_version: '',
            workflows: { wf1: { [placement]: ['wf2', 'wf2'] }, wf2: {} },
          };

          const actualYml = BitriseYmlService.addChainedWorkflow('wf2', 'wf1', placement, sourceYml);

          expect(actualYml).toMatchBitriseYml(expectedYml);
        });

        it('should not be able to insert chained workflow into a non-existent workflow', () => {
          const sourceAndExpectedYml: BitriseYml = {
            format_version: '',
            workflows: { wf1: { [placement]: ['wf2'] }, wf2: {} },
          };

          const actualYml = BitriseYmlService.addChainedWorkflow('wf2', 'wf3', placement, sourceAndExpectedYml);

          expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
        });

        it('should not be able to insert non-existent chained workflow', () => {
          const sourceAndExpectedYml: BitriseYml = {
            format_version: '',
            workflows: { wf1: { [placement]: ['wf2'] }, wf2: {} },
          };

          const actualYml = BitriseYmlService.addChainedWorkflow('wf3', 'wf1', placement, sourceAndExpectedYml);

          expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
        });
      });
    });

    it('should not able to insert chained workflow to invalid placement', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        workflows: { wf1: {}, wf2: {} },
      };

      const placement = 'invalid_placement' as ChainedWorkflowPlacement;
      const actualYml = BitriseYmlService.addChainedWorkflow('wf2', 'wf3', placement, sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });
  });

  describe('deleteChainedWorkflow', () => {
    const placements: ChainedWorkflowPlacement[] = ['after_run', 'before_run'];

    placements.forEach((placement) => {
      describe(`when placement is '${placement}'`, () => {
        it('should remove workflow from the target placement', () => {
          const sourceYml: BitriseYml = {
            format_version: '',
            workflows: {
              wf1: {
                before_run: ['wf2', 'wf3', 'wf2'],
                after_run: ['wf2', 'wf3', 'wf2'],
              },
            },
          };

          const actualYml = BitriseYmlService.deleteChainedWorkflow(0, 'wf1', placement, sourceYml);

          expect(actualYml.workflows?.wf1?.[placement]).toEqual(['wf3', 'wf2']);
          // Check the other placement
          expect(actualYml.workflows?.wf1?.[placement === 'before_run' ? 'after_run' : 'before_run']).toEqual([
            'wf2',
            'wf3',
            'wf2',
          ]);
        });

        it('should remove placement when placement is empty', () => {
          const sourceYml: BitriseYml = {
            format_version: '',
            workflows: {
              wf1: {
                before_run: ['wf2'],
                after_run: ['wf2'],
              },
            },
          };

          const actualYml = BitriseYmlService.deleteChainedWorkflow(0, 'wf1', placement, sourceYml);

          expect(actualYml.workflows?.wf1?.[placement]).toBeUndefined();
        });

        it('should return the original yml if the parentWorkflowID does not exist', () => {
          const sourceAndExpectedYml: BitriseYml = {
            format_version: '',
            workflows: { wf1: { [placement]: ['wf2'] }, wf2: {} },
          };

          const actualYml = BitriseYmlService.deleteChainedWorkflow(0, 'wf3', placement, sourceAndExpectedYml);

          expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
        });
      });
    });

    it('should return the original if the placement is invalid', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        workflows: { wf1: {}, wf2: {} },
      };

      const placement = 'invalid_placement' as ChainedWorkflowPlacement;
      const actualYml = BitriseYmlService.deleteChainedWorkflow(0, 'wf2', placement, sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });
  });

  describe('setChainedWorkflows', () => {
    it('should set the before workflows for the target workflow', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            after_run: ['too', 'baz'],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            after_run: ['too', 'baz'],
            before_run: ['foo', 'bar'],
          },
        },
      };

      const actualYml = BitriseYmlService.setChainedWorkflows('wf1', 'before_run', ['foo', 'bar'], sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should set the after workflows for the target workflow', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            before_run: ['too', 'baz'],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            before_run: ['too', 'baz'],
            after_run: ['foo', 'bar'],
          },
        },
      };

      const actualYml = BitriseYmlService.setChainedWorkflows('wf1', 'after_run', ['foo', 'bar'], sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should replace the after workflows for the target workflow', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            after_run: ['too', 'baz'],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            after_run: ['foo', 'bar'],
          },
        },
      };

      const actualYml = BitriseYmlService.setChainedWorkflows('wf1', 'after_run', ['foo', 'bar'], sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should remove before workflows if it is empty', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            before_run: ['foo', 'bar'],
            after_run: ['bar'],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            after_run: ['bar'],
          },
        },
      };

      const actualYml = BitriseYmlService.setChainedWorkflows('wf1', 'before_run', [], sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    describe('when workflow does not exists', () => {
      it('should return the original YML', () => {
        const sourceYmlAndExpectedYml: BitriseYml = {
          format_version: '',
          workflows: {
            wf1: {},
          },
        };

        const actualYml = BitriseYmlService.setChainedWorkflows(
          'wf2',
          'after_run',
          ['foo', 'bar'],
          sourceYmlAndExpectedYml,
        );

        expect(actualYml).toMatchBitriseYml(sourceYmlAndExpectedYml);
      });
    });

    describe('when placement is not correct', () => {
      it('should return the original YML', () => {
        const sourceYmlAndExpectedYml: BitriseYml = {
          format_version: '',
          workflows: {
            wf1: {},
          },
        };

        const actualYml = BitriseYmlService.setChainedWorkflows(
          'wf2',
          'after_runs' as ChainedWorkflowPlacement,
          ['foo', 'bar'],
          sourceYmlAndExpectedYml,
        );

        expect(actualYml).toMatchBitriseYml(sourceYmlAndExpectedYml);
      });
    });
  });

  describe('createPipeline', () => {
    it('should create a pipeline with empty workflows if base pipeline is missing', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        pipelines: { p1: { workflows: {} } },
      };

      const actualYml = BitriseYmlService.createPipeline('p1', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should create a pipeline based on an other pipeline', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: { title: 'Pipeline Title', workflows: { wf1: {} } },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: { title: 'Pipeline Title', workflows: { wf1: {} } },
          pl2: { title: 'Pipeline Title', workflows: { wf1: {} } },
        },
      };

      const actualYml = BitriseYmlService.createPipeline('pl2', sourceYml, 'pl1');

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

  describe('renamePipeline', () => {
    it('should rename an existing pipeline', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: { workflows: { wf1: {} } },
          pl2: { workflows: { wf2: {} } },
        },
        trigger_map: [{ pipeline: 'pl1' }, { pipeline: 'pl2' }],
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: { workflows: { wf1: {} } },
          pl3: { workflows: { wf2: {} } },
        },
        trigger_map: [{ pipeline: 'pl1' }, { pipeline: 'pl3' }],
      };

      const actualYml = BitriseYmlService.renamePipeline('pl2', 'pl3', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    describe('when the pipeline does not exists', () => {
      it('should return the original yml', () => {
        const sourceAndExpectedYml: BitriseYml = {
          format_version: '',
          pipelines: {
            pl1: { workflows: { wf1: {} } },
            pl2: { workflows: { wf2: {} } },
          },
          trigger_map: [{ pipeline: 'pl1' }, { pipeline: 'pl2' }],
        };

        const actualYml = BitriseYmlService.renamePipeline('pl3', 'pl4', sourceAndExpectedYml);

        expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
      });
    });
  });

  describe('updatePipeline', () => {
    it('should update the given pipeline', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: { title: 'title', summary: 'summary' },
          pl2: { title: 'title', summary: 'summary' },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: { summary: 'summary', description: 'description' },
          pl2: { title: 'title', summary: 'summary' },
        },
      };

      const actualYml = BitriseYmlService.updatePipeline('pl1', { title: '', description: 'description' }, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    describe('when pipeline does not exists', () => {
      it('should return the original yml', () => {
        const sourceAndExpectedYml: BitriseYml = {
          format_version: '',
          pipelines: { pl1: { title: 'title', summary: 'summary' } },
        };

        const actualYml = BitriseYmlService.updatePipeline('pl2', { description: 'description' }, sourceAndExpectedYml);

        expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
      });
    });
  });

  describe('deletePipeline', () => {
    it('should remove a pipeline in the whole yml completely', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: { wf1: {} },
          },
          pl2: {
            workflows: { wf1: {}, wf2: {} },
          },
          pl3: {
            workflows: { wf1: {}, wf2: {} },
          },
        },
        trigger_map: [{ pipeline: 'pl1' }, { pipeline: 'pl2' }, { pipeline: 'pl3' }],
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl2: {
            workflows: { wf1: {}, wf2: {} },
          },
          pl3: {
            workflows: { wf1: {}, wf2: {} },
          },
        },
        trigger_map: [{ pipeline: 'pl2' }, { pipeline: 'pl3' }],
      };

      const actualYml = BitriseYmlService.deletePipeline('pl1', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

  describe('addWorkflowToPipeline', () => {
    it('should add a root workflow to the given pipeline', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: { wf1: {} },
          },
        },
        workflows: {
          wf1: {},
          wf2: {},
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: { wf1: {}, wf2: {} },
          },
        },
        workflows: {
          wf1: {},
          wf2: {},
        },
      };

      const actualYml = BitriseYmlService.addWorkflowToPipeline('pl1', 'wf2', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should add a dependant workflow to the given pipeline', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: { wf1: {} },
          },
        },
        workflows: {
          wf1: {},
          wf2: {},
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: { wf1: {}, wf2: { depends_on: ['wf1'] } },
          },
        },
        workflows: {
          wf1: {},
          wf2: {},
        },
      };

      const actualYml = BitriseYmlService.addWorkflowToPipeline('pl1', 'wf2', sourceYml, 'wf1');

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should not add a workflow to the given pipeline if the workflow is already there', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: { wf1: {}, wf2: {} },
          },
        },
        workflows: {
          wf1: {},
          wf2: {},
        },
      };

      const actualYml = BitriseYmlService.addWorkflowToPipeline('pl1', 'wf2', sourceAndExpectedYml, 'wf1');

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should return the original yml if the pipeline does not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: { wf1: {} },
          },
        },
        workflows: {
          wf1: {},
          wf2: {},
        },
      };

      const actualYml = BitriseYmlService.addWorkflowToPipeline('pl2', 'wf2', sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should return the original yml if the workflow does not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: { wf1: {} },
          },
        },
        workflows: {
          wf1: {},
        },
      };

      const actualYml = BitriseYmlService.addWorkflowToPipeline('pl1', 'wf2', sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should return the original yml if the parent workflow does not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: { wf1: {} },
          },
        },
        workflows: {
          wf1: {},
          wf2: {},
        },
      };

      const actualYml = BitriseYmlService.addWorkflowToPipeline('pl1', 'wf2', sourceAndExpectedYml, 'wf3');

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should return the original yml if the parent workflow is not part of the pipeline', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: { wf1: {} },
          },
        },
        workflows: {
          wf1: {},
          wf2: {},
          wf3: {},
        },
      };

      const actualYml = BitriseYmlService.addWorkflowToPipeline('pl1', 'wf2', sourceAndExpectedYml, 'wf3');

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });
  });

  describe('updatePipelineWorkflowConditionAbortPipelineOnFailure', () => {
    it('should add abort on fail attribute if set to true', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: { wf1: {}, wf2: {} },
          },
          pl2: {
            workflows: { wf1: {} },
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: { wf1: { abort_on_fail: true }, wf2: {} },
          },
          pl2: {
            workflows: { wf1: {} },
          },
        },
      };

      const actualYml = BitriseYmlService.updatePipelineWorkflowConditionAbortPipelineOnFailure(
        'pl1',
        'wf1',
        true,
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should remove abort on fail attribute if set to false', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: { wf1: { abort_on_fail: true }, wf2: {} },
          },
          pl2: {
            workflows: { wf1: { abort_on_fail: true } },
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: { wf1: {}, wf2: {} },
          },
          pl2: {
            workflows: { wf1: { abort_on_fail: true } },
          },
        },
      };

      const actualYml = BitriseYmlService.updatePipelineWorkflowConditionAbortPipelineOnFailure(
        'pl1',
        'wf1',
        false,
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should return the original yml if the workflow is not found in pipeline', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: { wf1: {} },
          },
          pl2: {
            workflows: { wf2: {} },
          },
        },
      };

      const actualYml = BitriseYmlService.updatePipelineWorkflowConditionAbortPipelineOnFailure(
        'pl1',
        'wf2',
        true,
        sourceAndExpectedYml,
      );

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });
  });

  describe('updateStackAndMachine', () => {
    it('should add stack and machine definition to a given workflow', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ script: {} }, { clone: {} }, { deploy: {} }],
            meta: {
              'bitrise.io': {
                stack: 'my-stack',
                machine_type_id: 'my-machine',
              },
            },
          },
        },
      };

      const actualYml = BitriseYmlService.updateStackAndMachine('wf1', 'my-stack', 'my-machine', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should remove stack definition if it is empty', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ script: {} }, { clone: {} }, { deploy: {} }],
            meta: {
              'bitrise.io': {
                stack: 'my-stack',
                machine_type_id: 'my-old-machine',
              },
            },
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ script: {} }, { clone: {} }, { deploy: {} }],
            meta: {
              'bitrise.io': {
                machine_type_id: 'my-machine',
              },
            },
          },
        },
      };

      const actualYml = BitriseYmlService.updateStackAndMachine('wf1', '', 'my-machine', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should remove machine type definition if it is empty', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ script: {} }, { clone: {} }, { deploy: {} }],
            meta: {
              'bitrise.io': {
                stack: 'my-old-stack',
                machine_type_id: 'my-old-machine',
              },
            },
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ script: {} }, { clone: {} }, { deploy: {} }],
            meta: {
              'bitrise.io': {
                stack: 'my-stack',
              },
            },
          },
        },
      };

      const actualYml = BitriseYmlService.updateStackAndMachine('wf1', 'my-stack', '', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should remove bitrise.io section if both stack and workflow config is empty', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ script: {} }, { clone: {} }, { deploy: {} }],
            meta: {
              'bitrise.io': {
                stack: 'my-stack',
                machine_type_id: 'my-old-machine',
              },
            },
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ script: {} }, { clone: {} }, { deploy: {} }],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStackAndMachine('wf1', '', '', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

  describe('appendWorkflowEnvVar', () => {
    const newEnv: EnvVarYml = {
      FOO: 'bar',
      opts: {
        is_expand: true,
      },
    };
    it('should add the envs with the new EnvVar to the workflow', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {},
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            envs: [{ FOO: 'bar', opts: { is_expand: true } }],
          },
        },
      };

      const actualYml = BitriseYmlService.appendWorkflowEnvVar('wf1', newEnv, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should expand the envs with the new EnvVar', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            envs: [{ abc: 'def', opts: { is_expand: true } }],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            envs: [
              { abc: 'def', opts: { is_expand: true } },
              { FOO: 'bar', opts: { is_expand: true } },
            ],
          },
        },
      };

      const actualYml = BitriseYmlService.appendWorkflowEnvVar('wf1', newEnv, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

  describe('updateWorkflowEnvVars', () => {
    it('should add workflow envs if workflow has no envs before', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {},
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            envs: [{ ENV0: 'env0' }],
          },
        },
      };

      const actualYml = BitriseYmlService.updateWorkflowEnvVars('wf1', [{ ENV0: 'env0' }], sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should remove workflow envs field when the updated envs are empty', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            envs: [{ ENV0: 'env0' }],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {},
        },
      };

      const actualYml = BitriseYmlService.updateWorkflowEnvVars('wf1', [], sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should remove workflow env field', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            envs: [
              {
                ENV0: 'env0',
              },
              {
                ENV1: 'env1',
              },
              {
                opts: { is_expand: true },
                ENV2: 'env2',
              },
            ],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            envs: [
              {
                ENV0: 'env0',
              },
              {
                ENV2: 'env2',
                opts: { is_expand: true },
              },
            ],
          },
        },
      };

      const actualYml = BitriseYmlService.updateWorkflowEnvVars(
        'wf1',
        [
          {
            ENV0: 'env0',
          },
          {
            ENV2: 'env2',
            opts: { is_expand: true },
          },
        ],
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should update existing workflow envs', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            envs: [{ ENV0: 'env0' }, { ENV1: 'env1' }],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            envs: [{ ENV0: 'env0' }, { ENV1: 'envX' }],
          },
        },
      };

      const actualYml = BitriseYmlService.updateWorkflowEnvVars('wf1', [{ ENV0: 'env0' }, { ENV1: 'envX' }], sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should set and keep the existing position of the opts fields', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            envs: [
              {
                opts: { is_expand: true },
                ENV0: 'preserve-opts-key-position',
              },
              {
                ENV1: 'env1',
              },
              {
                ENV2: 'env2',
              },
            ],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            envs: [
              {
                opts: { is_expand: false },
                ENV0: 'preserve-opts-key-position',
              },
              {
                ENV1: 'env1',
              },
              {
                ENV2: 'env2',
                opts: { is_expand: false },
              },
            ],
          },
        },
      };

      const actualYml = BitriseYmlService.updateWorkflowEnvVars(
        'wf1',
        [
          {
            ENV0: 'preserve-opts-key-position',
            opts: { is_expand: false }, // NOTE: Opts position is different here, but the service can keep the order of keys!
          },
          {
            ENV1: 'env1',
          },
          {
            ENV2: 'env2',
            opts: { is_expand: false },
          },
        ],
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should keep originally empty envs field', () => {
      const sourceAndExpectedYml: BitriseYml = { format_version: '', workflows: { wf1: { envs: [] } } };
      const actualYml = BitriseYmlService.updateWorkflowEnvVars('wf1', [], sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });
  });
});

declare module 'expect' {
  interface AsymmetricMatchers {
    toMatchBitriseYml(expected: BitriseYml): void;
  }

  interface Matchers<R> {
    toMatchBitriseYml(expected: BitriseYml): R;
  }
}
