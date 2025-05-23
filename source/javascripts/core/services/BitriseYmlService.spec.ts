// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from '@jest/globals';
import type { MatcherFunction } from 'expect';

import { BitriseYml, EnvironmentItemModel } from '../models/BitriseYml';
import { ChainedWorkflowPlacement } from '../models/Workflow';
import BitriseYmlService from './BitriseYmlService';

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
          graph: {
            workflows: {
              wf1: { depends_on: ['wf2'] },
              wf2: {},
              variant1: { uses: 'wf1' },
              variant2: { uses: 'wf2' },
            },
          },
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
          graph: {
            workflows: {
              wf1: { depends_on: ['wf3'] },
              wf3: {},
              variant1: { uses: 'wf1' },
              variant2: { uses: 'wf3' },
            },
          },
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

      const actualYml = BitriseYmlService.updateStep('wf1', 0, { title: 'new title' }, sourceYml);

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

      const actualYml = BitriseYmlService.updateStep('wf1', 0, { title: '' }, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should keep the property if it did not change', () => {
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

      const actualYml = BitriseYmlService.updateStep('wf1', 0, { title: 'default title' }, sourceYml);

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

      const actualYml = BitriseYmlService.updateStep('wf2', 0, { title: 'new title' }, sourceYml);

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
              {
                script: {
                  inputs: [{ other: 'value' }, { contents: 'echo "Hello, World!"' }],
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
            steps: [
              { clone: {} },
              {
                script: {
                  inputs: [{ other: 'value' }, { contents: 'echo "Hello, Bitrise!"' }],
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
        [{ other: 'value' }, { contents: 'echo "Hello, Bitrise!"' }],
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

      const actualYml = BitriseYmlService.updateStepInputs('wf1', 1, [{ is_debug: 'false' }], sourceYml);

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

      const actualYml = BitriseYmlService.updateStepInputs('wf1', 1, [{ count: '123' }], sourceYml);

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

      const actualYml = BitriseYmlService.updateStepInputs('wf1', 1, [{ script_path: '/path/to/script' }], sourceYml);

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
        [{ script_path: '' }, { is_debug: 'true' }],
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should keep the input if the value did not change', () => {
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
            steps: [
              { clone: {} },
              {
                script: {
                  inputs: [{ contents: 'echo "Hello, Bitrise!' }, { is_debug: false }],
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
        [{ contents: 'echo "Hello, Bitrise!' }, { is_debug: 'false' }],
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

      const actualYml = BitriseYmlService.updateStepInputs('wf1', 1, [{ is_debug: '' }], sourceYml);
      expect(actualYml).toMatchBitriseYml(expectedYml);

      const actualYml2 = BitriseYmlService.updateStepInputs('wf1', 1, [], sourceYml);
      expect(actualYml2).toMatchBitriseYml(expectedYml);
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

      const actualYml = BitriseYmlService.updateStepInputs('wf1', 3, [], sourceYml);

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

      const actualYml = BitriseYmlService.deleteStep('wf1', [1], sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should delete multiple step at the given index', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }] },
        },
      };

      const actualYml = BitriseYmlService.deleteStep('wf1', [1, 2], sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should return the original YML if the workflow does not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const actualYml = BitriseYmlService.deleteStep('wf2', [1], sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should return the original YML if the step does not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const actualYml = BitriseYmlService.deleteStep('wf1', [3], sourceAndExpectedYml);

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

      const actualYml = BitriseYmlService.deleteStep('wf1', [0], sourceYml);

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
          graph1: {
            workflows: {
              wf1_variant: { uses: 'wf1' },
              wf1_variant_dependant: { depends_on: ['wf1_variant'] },
              wf2: { depends_on: ['wf1'] },
            },
          },
          graph2: {
            workflows: {
              wf1_variant: {},
            },
          },
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
          wf1_variant_dependant: {},
          wf2: { before_run: ['wf1'], after_run: ['wf1'] },
          wf3: { before_run: ['wf1', 'wf2'], after_run: ['wf1', 'wf2'] },
        },
        trigger_map: [{ workflow: 'wf1' }, { workflow: 'wf2' }, { workflow: 'wf3' }],
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          graph1: {
            workflows: {
              wf1_variant_dependant: {},
              wf2: {},
            },
          },
          graph2: {
            workflows: {
              wf1_variant: {},
            },
          },
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
          wf1_variant_dependant: {},
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

    it('should NOT remove the pipeline workflows property when last workflow removed in it', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {},
        },
        pipelines: {
          pl1: {
            workflows: {
              wf1: {},
            },
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {},
          },
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

          const actualYml = BitriseYmlService.addChainedWorkflow('wf1', placement, 'wf2', sourceYml);

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

          const actualYml = BitriseYmlService.addChainedWorkflow('wf1', placement, 'wf3', sourceYml);

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

          const actualYml = BitriseYmlService.addChainedWorkflow('wf1', placement, 'wf2', sourceYml);

          expect(actualYml).toMatchBitriseYml(expectedYml);
        });

        it('should not be able to insert chained workflow into a non-existent workflow', () => {
          const sourceAndExpectedYml: BitriseYml = {
            format_version: '',
            workflows: { wf1: { [placement]: ['wf2'] }, wf2: {} },
          };

          const actualYml = BitriseYmlService.addChainedWorkflow('wf3', placement, 'wf2', sourceAndExpectedYml);

          expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
        });

        it('should not be able to insert non-existent chained workflow', () => {
          const sourceAndExpectedYml: BitriseYml = {
            format_version: '',
            workflows: { wf1: { [placement]: ['wf2'] }, wf2: {} },
          };

          const actualYml = BitriseYmlService.addChainedWorkflow('wf1', placement, 'wf3', sourceAndExpectedYml);

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
      const actualYml = BitriseYmlService.addChainedWorkflow('wf1', placement, 'wf2', sourceAndExpectedYml);

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

    describe('when placement is invalid', () => {
      it('should return the original YML', () => {
        const sourceYmlAndExpectedYml: BitriseYml = {
          format_version: '',
          workflows: {
            wf1: {},
          },
        };

        const actualYml = BitriseYmlService.setChainedWorkflows(
          'wf2',
          'invalid_placement' as ChainedWorkflowPlacement,
          ['foo', 'bar'],
          sourceYmlAndExpectedYml,
        );

        expect(actualYml).toMatchBitriseYml(sourceYmlAndExpectedYml);
      });
    });
  });

  describe('removeChainedWorkflow', () => {
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

          const actualYml = BitriseYmlService.removeChainedWorkflow('wf1', placement, 'wf2', 0, sourceYml);

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

          const actualYml = BitriseYmlService.removeChainedWorkflow('wf1', placement, 'wf2', 0, sourceYml);

          expect(actualYml.workflows?.wf1?.[placement]).toBeUndefined();
        });

        it('should return the original yml if the parentWorkflowID does not exist', () => {
          const sourceAndExpectedYml: BitriseYml = {
            format_version: '',
            workflows: { wf1: { [placement]: ['wf2'] }, wf2: {} },
          };

          const actualYml = BitriseYmlService.removeChainedWorkflow('wf3', placement, 'wf2', 0, sourceAndExpectedYml);

          expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
        });

        it('should return the original yml if the chainedWorkflowID does not match the index', () => {
          const sourceAndExpectedYml: BitriseYml = {
            format_version: '',
            workflows: { wf1: { [placement]: ['wf2', 'wf3'] }, wf2: {} },
          };

          const actualYml = BitriseYmlService.removeChainedWorkflow('wf1', placement, 'wf3', 0, sourceAndExpectedYml);

          expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
        });

        it('should return the original yml if the index is out of range', () => {
          const sourceAndExpectedYml: BitriseYml = {
            format_version: '',
            workflows: { wf1: { [placement]: ['wf2', 'wf3'] }, wf2: {} },
          };

          const actualYml = BitriseYmlService.removeChainedWorkflow('wf1', placement, 'wf3', 2, sourceAndExpectedYml);

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
      const actualYml = BitriseYmlService.removeChainedWorkflow('wf1', placement, 'wf2', 0, sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
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

    it('should create a pipeline based on an other graph pipeline', () => {
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

    it('should create a pipeline based on a staged pipeline', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            title: 'Stage Pipeline',
            stages: [{ st1: {} }, { st2: {} }],
          },
        },
        stages: {
          st1: { workflows: [{ wf1: {} }] },
          st2: { workflows: [{ wf2: {} }, { wf3: {} }] },
        },
        workflows: {
          wf1: {},
          wf2: {},
          wf3: {},
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            title: 'Stage Pipeline',
            stages: [{ st1: {} }, { st2: {} }],
          },
          pl2: {
            title: 'Stage Pipeline',
            workflows: {
              wf1: {},
              wf2: { depends_on: ['wf1'] },
              wf3: { depends_on: ['wf1'] },
            },
          },
        },
        stages: {
          st1: { workflows: [{ wf1: {} }] },
          st2: { workflows: [{ wf2: {} }, { wf3: {} }] },
        },
        workflows: {
          wf1: {},
          wf2: {},
          wf3: {},
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
          pl1: {
            summary: 'summary',
            description: 'description',
            status_report_name: 'Executing <target_id> for <project_title>',
          },
          pl2: { title: 'title', summary: 'summary' },
        },
      };

      const actualYml = BitriseYmlService.updatePipeline(
        'pl1',
        {
          title: '',
          description: 'description',
          status_report_name: 'Executing <target_id> for <project_title>',
        },
        sourceYml,
      );

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

  describe('removeWorkflowFromPipeline', () => {
    it('should remove the workflow from the given pipeline', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf1: {},
              wf2: { depends_on: ['wf1'] },
            },
          },
          pl2: {
            workflows: {
              wf1: { depends_on: ['wf2'] },
              wf2: {},
            },
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf2: {},
            },
          },
          pl2: {
            workflows: {
              wf1: { depends_on: ['wf2'] },
              wf2: {},
            },
          },
        },
      };

      const actualYml = BitriseYmlService.removeWorkflowFromPipeline('pl1', 'wf1', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should return the original YML if the pipeline does not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf1: {},
            },
          },
        },
      };

      const actualYml = BitriseYmlService.removeWorkflowFromPipeline('pl2', 'wf1', sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should return the original YML if the workflow does not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf1: {},
            },
          },
        },
      };

      const actualYml = BitriseYmlService.removeWorkflowFromPipeline('pl1', 'wf2', sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should NOT remove the workflows field if it becomes empty after removal', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf1: {},
            },
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {},
          },
        },
      };

      const actualYml = BitriseYmlService.removeWorkflowFromPipeline('pl1', 'wf1', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

  describe('addPipelineWorkflowDependency', () => {
    it('should add the dependency to the workflow in the pipeline', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf1: {},
              wf2: {},
            },
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf1: { depends_on: ['wf2'] },
              wf2: {},
            },
          },
        },
      };

      const actualYml = BitriseYmlService.addPipelineWorkflowDependency('pl1', 'wf1', 'wf2', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should return the original YML if the pipeline does not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf1: {},
              wf2: {},
            },
          },
        },
      };

      const actualYml = BitriseYmlService.addPipelineWorkflowDependency('pl2', 'wf1', 'wf2', sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should return the original YML if the workflow does not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf1: {},
              wf2: {},
            },
          },
        },
      };

      const actualYml = BitriseYmlService.addPipelineWorkflowDependency('pl1', 'wf3', 'wf2', sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should return the original YML if the dependency workflow is not part of the pipeline', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf1: {},
            },
          },
        },
      };

      const actualYml = BitriseYmlService.addPipelineWorkflowDependency('pl1', 'wf1', 'wf2', sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should return the original YML if the workflow and the dependency is the same', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf1: {},
            },
          },
        },
      };

      const actualYml = BitriseYmlService.addPipelineWorkflowDependency('pl1', 'wf1', 'wf1', sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });
  });

  describe('removePipelineWorkflowDependency', () => {
    it('should delete the dependency from the workflow in the pipeline', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf1: { depends_on: ['wf2'] },
            },
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf1: {},
            },
          },
        },
      };

      const actualYml = BitriseYmlService.removePipelineWorkflowDependency('pl1', 'wf1', 'wf2', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should return the original YML if the pipeline does not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf1: { depends_on: ['wf2'] },
            },
          },
        },
      };

      const actualYml = BitriseYmlService.removePipelineWorkflowDependency('pl2', 'wf1', 'wf2', sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should return the original YML if the workflow does not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf1: { depends_on: ['wf2'] },
            },
          },
        },
      };

      const actualYml = BitriseYmlService.removePipelineWorkflowDependency('pl1', 'wf3', 'wf2', sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should return the original YML if the dependency does not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf1: { depends_on: ['wf2'] },
            },
          },
        },
      };

      const actualYml = BitriseYmlService.removePipelineWorkflowDependency('pl1', 'wf1', 'wf3', sourceAndExpectedYml);

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

  describe('updatePipelineWorkflowConditionShouldAlwaysRun', () => {
    it('should add should_always_run attribute if set to workflow', () => {
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
            workflows: { wf1: { should_always_run: 'workflow' }, wf2: {} },
          },
          pl2: {
            workflows: { wf1: {} },
          },
        },
      };

      const actualYml = BitriseYmlService.updatePipelineWorkflowConditionShouldAlwaysRun(
        'pl1',
        'wf1',
        'workflow',
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should remove should_always_run attribute if set to off', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: { wf1: { should_always_run: 'workflow' }, wf2: {} },
          },
          pl2: {
            workflows: { wf1: { should_always_run: 'workflow' } },
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
            workflows: { wf1: { should_always_run: 'workflow' } },
          },
        },
      };

      const actualYml = BitriseYmlService.updatePipelineWorkflowConditionShouldAlwaysRun(
        'pl1',
        'wf1',
        'off',
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

      const actualYml = BitriseYmlService.updatePipelineWorkflowConditionShouldAlwaysRun(
        'pl1',
        'wf2',
        'workflow',
        sourceAndExpectedYml,
      );

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });
  });

  describe('updatePipelineWorkflowConditionRunIfExpression', () => {
    it('should add set run_if.expression attribute if set', () => {
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
            workflows: {
              wf1: { run_if: { expression: 'some expression' } },
              wf2: {},
            },
          },
          pl2: {
            workflows: { wf1: {} },
          },
        },
      };

      const actualYml = BitriseYmlService.updatePipelineWorkflowConditionRunIfExpression(
        'pl1',
        'wf1',
        'some expression',
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should remove run_if attribute if set to empty string', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf1: { run_if: { expression: 'some expression' } },
              wf2: {},
            },
          },
          pl2: {
            workflows: { wf1: { run_if: { expression: 'some expression' } } },
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
            workflows: { wf1: { run_if: { expression: 'some expression' } } },
          },
        },
      };

      const actualYml = BitriseYmlService.updatePipelineWorkflowConditionRunIfExpression('pl1', 'wf1', '', sourceYml);

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

      const actualYml = BitriseYmlService.updatePipelineWorkflowConditionRunIfExpression(
        'pl1',
        'wf2',
        'some expression',
        sourceAndExpectedYml,
      );

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });
  });

  describe('updatePipelineWorkflowParallel', () => {
    it('should add parallel attribute with string value', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf1: {},
            },
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf1: {
                parallel: 3,
              },
            },
          },
        },
      };

      const actualYml = BitriseYmlService.updatePipelineWorkflowParallel('pl1', 'wf1', '3', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should update existing parallel attribute with new string value', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf1: {
                parallel: 3,
              },
            },
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf1: {
                parallel: 5,
              },
            },
          },
        },
      };

      const actualYml = BitriseYmlService.updatePipelineWorkflowParallel('pl1', 'wf1', '5', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should remove parallel attribute if empty string is provided', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf1: {
                parallel: 3,
              },
            },
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf1: {},
            },
          },
        },
      };

      const actualYml = BitriseYmlService.updatePipelineWorkflowParallel('pl1', 'wf1', '', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should remove parallel attribute if zero string is provided', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf1: {
                parallel: 3,
              },
            },
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf1: {},
            },
          },
        },
      };

      const actualYml = BitriseYmlService.updatePipelineWorkflowParallel('pl1', 'wf1', '0', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should accept any string value', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf1: {
                parallel: 3,
              },
            },
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf1: {
                parallel: 'any-string',
              },
            },
          },
        },
      };

      const actualYml = BitriseYmlService.updatePipelineWorkflowParallel('pl1', 'wf1', 'any-string', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should return the original YML if the pipeline does not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf1: {},
            },
          },
        },
      };

      const actualYml = BitriseYmlService.updatePipelineWorkflowParallel('pl2', 'wf1', '3', sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should return the original YML if the workflow does not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            workflows: {
              wf1: {},
            },
          },
        },
      };

      const actualYml = BitriseYmlService.updatePipelineWorkflowParallel('pl1', 'wf2', '3', sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });
  });

  describe('updateWorkflowMeta', () => {
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

      const actualYml = BitriseYmlService.updateWorkflowMeta(
        'wf1',
        { stack: 'my-stack', machine_type_id: 'my-machine' },
        sourceYml,
      );

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
                stack: 'my-old-stack',
                machine_type_id: 'my-machine',
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

      const actualYml = BitriseYmlService.updateWorkflowMeta('wf1', { stack: '' }, sourceYml);

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
                stack: 'my-stack',
              },
            },
          },
        },
      };

      const actualYml = BitriseYmlService.updateWorkflowMeta('wf1', { machine_type_id: '' }, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should remove license pool id definition if it is empty', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ script: {} }, { clone: {} }, { deploy: {} }],
            meta: {
              'bitrise.io': {
                license_pool_id: 'my-old-pool',
                stack: 'my-stack',
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

      const actualYml = BitriseYmlService.updateWorkflowMeta('wf1', { license_pool_id: '' }, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should remove bitrise.io section if every config is empty', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [{ script: {} }, { clone: {} }, { deploy: {} }],
            meta: {
              'bitrise.io': {
                machine_type_id: 'my-old-machine',
                stack: 'my-old-stack',
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

      const actualYml = BitriseYmlService.updateWorkflowMeta('wf1', { machine_type_id: '', stack: '' }, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

  describe('appendWorkflowEnvVar', () => {
    const newEnv: EnvironmentItemModel = {
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

  describe('appendProjectEnvVar', () => {
    it('should add an environment variable to the project', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        app: {
          envs: [{ EXISTING_VAR: 'value1', opts: { is_expand: true } }],
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        app: {
          envs: [{ EXISTING_VAR: 'value1', opts: { is_expand: true } }, { NEW_VAR: 'value2' }],
        },
      };

      const actualYml = BitriseYmlService.appendProjectEnvVar({ NEW_VAR: 'value2' }, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should add environment variable with opts if provided', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        app: {
          envs: [{ EXISTING_VAR: 'value1' }],
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        app: {
          envs: [{ EXISTING_VAR: 'value1' }, { NEW_VAR: 'value2', opts: { is_expand: true } }],
        },
      };

      const actualYml = BitriseYmlService.appendProjectEnvVar(
        {
          NEW_VAR: 'value2',
          opts: { is_expand: true },
        },
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should create app.envs array if it does not exist', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        app: {},
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        app: {
          envs: [{ NEW_VAR: 'value' }],
        },
      };

      const actualYml = BitriseYmlService.appendProjectEnvVar(
        {
          NEW_VAR: 'value',
        },
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should create app section if it does not exist', () => {
      const sourceYml: BitriseYml = { format_version: '' };

      const expectedYml: BitriseYml = {
        format_version: '',
        app: {
          envs: [{ NEW_VAR: 'value' }],
        },
      };

      const actualYml = BitriseYmlService.appendProjectEnvVar({ NEW_VAR: 'value' }, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

  describe('updateProjectEnvVars', () => {
    it('should add project envs if project is not exists in the yml', () => {
      const sourceYml: BitriseYml = { format_version: '' };
      const expectedYml: BitriseYml = {
        format_version: '',
        app: { envs: [{ ENV0: 'env0' }] },
      };
      const actualYml = BitriseYmlService.updateProjectEnvVars([{ ENV0: 'env0' }], sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should add project envs if project envs not exists in the yml', () => {
      const sourceYml: BitriseYml = { format_version: '', app: {} };
      const expectedYml: BitriseYml = {
        format_version: '',
        app: { envs: [{ ENV0: 'env0' }] },
      };
      const actualYml = BitriseYmlService.updateProjectEnvVars([{ ENV0: 'env0' }], sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should remove project envs field when the updated envs are empty', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        app: { title: 'title', envs: [{ ENV0: 'env0' }] },
      };
      const expectedYml: BitriseYml = {
        format_version: '',
        app: { title: 'title' },
      };
      const actualYml = BitriseYmlService.updateProjectEnvVars([], sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should remove project env item', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        app: {
          envs: [{ ENV0: 'env0' }, { ENV1: 'env1' }, { opts: { is_expand: true }, ENV2: 'env2' }],
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        app: {
          envs: [{ ENV0: 'env0' }, { ENV2: 'env2', opts: { is_expand: true } }],
        },
      };

      const actualYml = BitriseYmlService.updateProjectEnvVars(
        [{ ENV0: 'env0' }, { ENV2: 'env2', opts: { is_expand: true } }],
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should update existing project envs', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        app: { envs: [{ ENV0: 'env0' }, { ENV1: 'env1' }] },
      };
      const expectedYml: BitriseYml = {
        format_version: '',
        app: { envs: [{ ENV0: 'env0' }, { ENV1: 'envX' }] },
      };
      const actualYml = BitriseYmlService.updateProjectEnvVars([{ ENV0: 'env0' }, { ENV1: 'envX' }], sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should set and keep the existing position of the opts fields', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        app: {
          envs: [
            { opts: { is_expand: true }, ENV0: 'preserve-opts-key-position' },
            { ENV1: 'env-1' },
            { ENV2: 'env-2' },
          ],
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        app: {
          envs: [
            { opts: { is_expand: false }, ENV0: 'preserve-opts-key-position' },
            { ENV1: 'env-1' },
            { ENV2: 'env-2', opts: { is_expand: false } },
          ],
        },
      };

      const actualYml = BitriseYmlService.updateProjectEnvVars(
        [
          {
            ENV0: 'preserve-opts-key-position',
            opts: { is_expand: false }, // NOTE: Opts position is different here, but the service can keep the order of keys!
          },
          {
            ENV1: 'env-1',
          },
          {
            ENV2: 'env-2',
            opts: { is_expand: false },
          },
        ],
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should keep originally empty envs field', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        app: { envs: [] },
      };
      const actualYml = BitriseYmlService.updateProjectEnvVars([], sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
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
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        workflows: { wf1: { envs: [] } },
      };
      const actualYml = BitriseYmlService.updateWorkflowEnvVars('wf1', [], sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });
  });

  describe('updateWorkflowTriggers', () => {
    it('should add workflow triggers if workflow has no triggers before', () => {
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
            triggers: {
              push: [
                {
                  branch: 'main',
                },
              ],
            },
          },
        },
      };

      const actualYml = BitriseYmlService.updateWorkflowTriggers('wf1', { push: [{ branch: 'main' }] }, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should update workflow triggers', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            triggers: {
              push: [
                {
                  branch: 'main',
                },
              ],
            },
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            triggers: {
              push: [
                {
                  branch: 'main',
                },
              ],
              tag: [
                {
                  name: {
                    regex: '*',
                  },
                },
              ],
            },
          },
        },
      };

      const actualYml = BitriseYmlService.updateWorkflowTriggers(
        'wf1',
        { push: [{ branch: 'main' }], tag: [{ name: { regex: '*' } }] },
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

  describe('updateWorkflowTriggersEnabled', () => {
    it('should disable triggers (set enabled: false)', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            triggers: {},
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            triggers: {
              enabled: false,
            },
          },
        },
      };

      const actualYml = BitriseYmlService.updateWorkflowTriggersEnabled('wf1', false, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should enable triggers (remove enabled: false)', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            triggers: {
              enabled: false,
            },
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            triggers: {},
          },
        },
      };

      const actualYml = BitriseYmlService.updateWorkflowTriggersEnabled('wf1', true, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

  describe('updatePipelineTriggers', () => {
    it('should add pipeline triggers if pipeline has no triggers before', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {},
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            triggers: {
              push: [
                {
                  branch: 'main',
                },
              ],
            },
          },
        },
      };

      const actualYml = BitriseYmlService.updatePipelineTriggers('pl1', { push: [{ branch: 'main' }] }, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should update pipeline triggers', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            triggers: {
              push: [
                {
                  branch: 'main',
                },
              ],
            },
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            triggers: {
              push: [
                {
                  branch: 'main',
                },
              ],
              tag: [
                {
                  name: {
                    regex: '*',
                  },
                },
              ],
            },
          },
        },
      };

      const actualYml = BitriseYmlService.updatePipelineTriggers(
        'pl1',
        { push: [{ branch: 'main' }], tag: [{ name: { regex: '*' } }] },
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

  describe('updatePipelineTriggersEnabled', () => {
    it('should disable triggers (set enabled: false)', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            triggers: {},
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            triggers: {
              enabled: false,
            },
          },
        },
      };

      const actualYml = BitriseYmlService.updatePipelineTriggersEnabled('pl1', false, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should enable triggers (remove enabled: false)', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            triggers: {
              enabled: false,
            },
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: {
            triggers: {},
          },
        },
      };

      const actualYml = BitriseYmlService.updatePipelineTriggersEnabled('pl1', true, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

  describe('addStepToStepBundle', () => {
    it('should add step to a given index', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            steps: [{ script: {} }, { 'apk-info@1.4.6': {} }, { clone: {} }, { deploy: {} }],
          },
        },
      };

      const actualYml = BitriseYmlService.addStepToStepBundle('bundle1', 'apk-info@1.4.6', 1, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    describe('when step bundle does not exists', () => {
      it('should return the original YML', () => {
        const sourceYmlAndExpectedYml: BitriseYml = {
          format_version: '',
          step_bundles: {
            bundle1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
          },
        };

        const actualYml = BitriseYmlService.addStepToStepBundle(
          'bundle2',
          'apk-info@1.4.6',
          1,
          sourceYmlAndExpectedYml,
        );

        expect(actualYml).toMatchBitriseYml(sourceYmlAndExpectedYml);
      });
    });

    describe('when the given index too high', () => {
      it('should put the step to the end of the list', () => {
        const sourceYml: BitriseYml = {
          format_version: '',
          step_bundles: {
            bundle1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
          },
        };

        const expectedYml: BitriseYml = {
          format_version: '',
          step_bundles: {
            bundle1: {
              steps: [{ script: {} }, { clone: {} }, { deploy: {} }, { 'apk-info@1.4.6': {} }],
            },
          },
        };

        const actualYml = BitriseYmlService.addStepToStepBundle('bundle1', 'apk-info@1.4.6', 10, sourceYml);

        expect(actualYml).toMatchBitriseYml(expectedYml);
      });
    });

    describe('when the given index too low', () => {
      it('should put the step to the start of the list', () => {
        const sourceYml: BitriseYml = {
          format_version: '',
          step_bundles: {
            bundle1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
          },
        };

        const expectedYml: BitriseYml = {
          format_version: '',
          step_bundles: {
            bundle1: {
              steps: [{ 'apk-info@1.4.6': {} }, { script: {} }, { clone: {} }, { deploy: {} }],
            },
          },
        };

        const actualYml = BitriseYmlService.addStepToStepBundle('bundle1', 'apk-info@1.4.6', -5, sourceYml);

        expect(actualYml).toMatchBitriseYml(expectedYml);
      });
    });
  });

  describe('changeStepVersionInStepBundle', () => {
    it('should upgrade the step version at the given index', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            steps: [{ 'script@1.0.0': {} }, { 'clone@1.0.0': {} }, { 'deploy@1.0.0': {} }],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            steps: [{ 'script@1.0.0': {} }, { 'clone@2.1.0': {} }, { 'deploy@1.0.0': {} }],
          },
        },
      };

      const actualYml = BitriseYmlService.changeStepVersionInStepBundle('bundle1', 1, '2.1.0', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should append version if the step does not have one', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            steps: [{ script: {} }, { 'clone@2.0.0': {} }, { deploy: {} }],
          },
        },
      };

      const actualYml = BitriseYmlService.changeStepVersionInStepBundle('bundle1', 1, '2.0.0', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should remove the step version if empty string is given', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            steps: [{ 'script@1.0.0': {} }, { 'clone@1.0.0': {} }, { 'deploy@1.0.0': {} }],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            steps: [{ 'script@1.0.0': {} }, { clone: {} }, { 'deploy@1.0.0': {} }],
          },
        },
      };

      const actualYml = BitriseYmlService.changeStepVersionInStepBundle('bundle1', 1, '', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should return the original YML if the step bundle or step does not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const actualYml = BitriseYmlService.changeStepVersionInStepBundle('bundle2', 1, '2.0.0', sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });
  });

  describe('cloneStepInStepBundle', () => {
    it('should clone a step to the expected place', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            steps: [{ script: {} }, { clone: {} }, { clone: {} }, { deploy: {} }],
          },
        },
      };

      const actualYml = BitriseYmlService.cloneStepInStepBundle('bundle1', 1, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should return the original BitriseYml if step bundle is not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const actualYml = BitriseYmlService.cloneStepInStepBundle('bundle2', 1, sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should return the original BitriseYml if step on is not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const actualYml = BitriseYmlService.cloneStepInStepBundle('bundle1', 5, sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });
  });

  describe('createStepBundle', () => {
    it('should create an empty step bundle if base step bundle is missing', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: { bundle1: {} },
      };

      const actualYml = BitriseYmlService.createStepBundle('bundle1', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should create a step bundle based on an other step bundle', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ 'script@1': {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ 'script@1': {} }] },
          bundle2: { steps: [{ 'script@1': {} }] },
        },
      };

      const actualYml = BitriseYmlService.createStepBundle('bundle2', sourceYml, 'bundle1');

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should create a step bundle based on a utility workflow', () => {
      const workflows = {
        _util: {
          steps: [{ 'script@1': {} }],
          before_run: [],
          after_run: [],
          meta: {},
          triggers: {},
          envs: [
            {
              foo: 'bar',
              opts: {
                is_expand: true,
              },
            },
          ],
        },
      };

      const sourceYml: BitriseYml = {
        format_version: '',
        workflows,
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows,
        step_bundles: {
          bundle1: {
            steps: [{ 'script@1': {} }],
            inputs: [
              {
                foo: 'bar',
                opts: {
                  is_expand: true,
                },
              },
            ],
          },
        },
      };

      const actualYml = BitriseYmlService.createStepBundle('bundle1', sourceYml, undefined, '_util');

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should create an empty step bundle if the baseStepBundleId does not exist', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ 'script@1': {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ 'script@1': {} }] },
          bundle2: {},
        },
      };

      const actualYml = BitriseYmlService.createStepBundle('bundle2', sourceYml, 'nonExistingBundle');

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

  describe('deleteStepBundle', () => {
    it('should remove a step bundle in the whole yml completely', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {},
          bundle2: {},
          bundle3: {},
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle2: {},
          bundle3: {},
        },
      };

      const actualYml = BitriseYmlService.deleteStepBundle('bundle1', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should return the original YML if the step bundle does not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const actualYml = BitriseYmlService.deleteStepBundle('nonExistingStepBundle', sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should remove the step bundles property if it becomes empty after deletion', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ script: {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
      };

      const actualYml = BitriseYmlService.deleteStepBundle('bundle1', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

  describe('deleteStepInStepBundle', () => {
    it('should delete the step at the given index', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ script: {} }, { deploy: {} }] },
        },
      };

      const actualYml = BitriseYmlService.deleteStepInStepBundle('bundle1', [1], sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should return the original YML if the step bundle does not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const actualYml = BitriseYmlService.deleteStepInStepBundle('bundle2', [1], sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should return the original YML if the step does not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const actualYml = BitriseYmlService.deleteStepInStepBundle('bundle1', [3], sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should remove the steps property if it becomes empty after deletion', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ script: {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {},
        },
      };

      const actualYml = BitriseYmlService.deleteStepInStepBundle('bundle1', [0], sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

  describe('groupStepsToStepBundle', () => {
    it('should return the original YAML if no steps are selected', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const expectedYml: BitriseYml = { ...sourceYml };

      const actualYml = BitriseYmlService.groupStepsToStepBundle('wf1', undefined, 'step_bundle', [], sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('when a single step is selected, the selected step should be added to step bundles and removed from workflows', () => {
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
            steps: [{ script: {} }, { 'bundle::step_bundle': {} }, { deploy: {} }],
          },
        },
        step_bundles: {
          step_bundle: { steps: [{ clone: {} }] },
        },
      };

      const actualYml = BitriseYmlService.groupStepsToStepBundle('wf1', undefined, 'step_bundle', [1], sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('when a single step is selected in a nested step bundle, the selected step should be grouped into a new step bundle', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            steps: [{ script: {} }, { 'bundle::new_bundle': {} }, { deploy: {} }],
          },
          new_bundle: { steps: [{ clone: {} }] },
        },
      };

      const actualYml = BitriseYmlService.groupStepsToStepBundle('undefined', 'bundle1', 'new_bundle', [1], sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('when multiple consecutive steps are selected, the selected steps should be added to step bundles and removed from workflows', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ 'bundle::step_bundle': {} }, { deploy: {} }] },
        },
        step_bundles: {
          step_bundle: { steps: [{ script: {} }, { clone: {} }] },
        },
      };

      const actualYml = BitriseYmlService.groupStepsToStepBundle('wf1', undefined, 'step_bundle', [0, 1], sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('when multiple consecutive steps are selected in a nested step bundle, the selected steps should be grouped into a new step bundle', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ 'bundle::new_bundle': {} }, { deploy: {} }] },
          new_bundle: { steps: [{ script: {} }, { clone: {} }] },
        },
      };

      const actualYml = BitriseYmlService.groupStepsToStepBundle(
        'undefined',
        'bundle1',
        'new_bundle',
        [0, 1],
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('when multiple non-consecutive steps are selected, the selected steps should be added to step bundles and removed from workflows', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ 'bundle::step_bundle': {} }, { clone: {} }] },
        },
        step_bundles: {
          step_bundle: { steps: [{ script: {} }, { deploy: {} }] },
        },
      };

      const actualYml = BitriseYmlService.groupStepsToStepBundle('wf1', undefined, 'step_bundle', [0, 2], sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('when multiple non-consecutive steps are selected in a nested step bundle, the selected steps should be grouped into a new step bundle', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ 'bundle::new_bundle': {} }, { clone: {} }] },
          new_bundle: { steps: [{ script: {} }, { deploy: {} }] },
        },
      };

      const actualYml = BitriseYmlService.groupStepsToStepBundle(undefined, 'bundle1', 'new_bundle', [0, 2], sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

  describe('moveStepInStepBundle', () => {
    it('should move step to the expected place', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ deploy: {} }, { script: {} }, { clone: {} }] },
        },
      };

      const actualYml = BitriseYmlService.moveStepInStepBundle('bundle1', 2, 0, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should return the original BitriseYml if step bundle does not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const actualYml = BitriseYmlService.moveStepInStepBundle('bundle2', 2, 0, sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should return the original BitriseYml if stepIndex is out of range', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const actualYml = BitriseYmlService.moveStepInStepBundle('bundle1', 3, 0, sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should move the step to the bound if destination is out of range', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ clone: {} }, { deploy: {} }, { script: {} }] },
        },
      };

      const actualYml = BitriseYmlService.moveStepInStepBundle('bundle1', 0, 4, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

  describe('renameStepBundle', () => {
    it('should rename an existing step bundle', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ step1: {} }, { step2: {} }] },
          bundle2: { steps: [{ step3: {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ step1: {} }, { step2: {} }] },
          bundle3: { steps: [{ step3: {} }] },
        },
      };

      const actualYml = BitriseYmlService.renameStepBundle('bundle2', 'bundle3', sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    describe('when step bundle does not exist', () => {
      it('should return the original yml', () => {
        const sourceAndExpectedYml: BitriseYml = {
          format_version: '',
          step_bundles: {
            bundle1: { steps: [{ step1: {} }, { step2: {} }] },
          },
        };

        const actualYml = BitriseYmlService.renameStepBundle('bundle2', 'bundle3', sourceAndExpectedYml);

        expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
      });
    });
  });

  describe('updateStepInStepBundle', () => {
    it('should update the step at the given index', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
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
        step_bundles: {
          bundle1: {
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

      const actualYml = BitriseYmlService.updateStepInStepBundle('bundle1', 0, { title: 'new title' }, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should delete the property if the new value is empty', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
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
        step_bundles: {
          bundle1: {
            steps: [{ 'step-id@1.0.0': { source_code_url: 'https://source.code' } }],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepInStepBundle('bundle1', 0, { title: '' }, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should keep the property if it did not changed', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
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
        step_bundles: {
          bundle1: {
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

      const actualYml = BitriseYmlService.updateStepInStepBundle('bundle1', 0, { title: 'default title' }, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should return the original YML if the step bundle or step does not exist', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            steps: [{ 'step-id@1.0.0': { title: 'old title' } }],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepInStepBundle('bundle2', 0, { title: 'new title' }, sourceYml);

      expect(actualYml).toMatchBitriseYml(sourceYml);
    });
  });

  describe('updateStepInputsInStepBundle', () => {
    it('should update the inputs of the step at the given index', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            steps: [
              { clone: {} },
              {
                script: {
                  inputs: [{ other: 'value' }, { contents: 'echo "Hello, World!"' }],
                },
              },
              { test: {} },
            ],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            steps: [
              { clone: {} },
              {
                script: {
                  inputs: [{ other: 'value' }, { contents: 'echo "Hello, Bitrise!"' }],
                },
              },
              { test: {} },
            ],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepInputsInStepBundle(
        'bundle1',
        1,
        [{ other: 'value' }, { contents: 'echo "Hello, Bitrise!"' }],
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should write a boolean value correctly', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            steps: [{ clone: {} }, { script: {} }, { test: {} }],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            steps: [{ clone: {} }, { script: { inputs: [{ is_debug: false }] } }, { test: {} }],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepInputsInStepBundle(
        'bundle1',
        1,
        [{ is_debug: 'false' }],
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should write a number value correctly', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            steps: [{ clone: {} }, { script: {} }, { test: {} }],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            steps: [{ clone: {} }, { script: { inputs: [{ count: 123 }] } }, { test: {} }],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepInputsInStepBundle('bundle1', 1, [{ count: '123' }], sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should write a string value correctly', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            steps: [{ clone: {} }, { script: {} }, { test: {} }],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            steps: [{ clone: {} }, { script: { inputs: [{ script_path: '/path/to/script' }] } }, { test: {} }],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepInputsInStepBundle(
        'bundle1',
        1,
        [{ script_path: '/path/to/script' }],
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should not overwrite input opts', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
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

      const actualYml = BitriseYmlService.updateStepInputsInStepBundle(
        'bundle1',
        1,
        [
          {
            contents: '{{.isCI}}',
            opts: { is_template: true },
          },
        ],
        sourceAndExpectedYml,
      );

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should delete the input if the value is empty', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
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
        step_bundles: {
          bundle1: {
            steps: [{ clone: {} }, { script: { inputs: [{ is_debug: true }] } }, { test: {} }],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepInputsInStepBundle(
        'bundle1',
        1,
        [{ script_path: '' }, { is_debug: 'true' }],
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should keep the input if the value did not change', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
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
        step_bundles: {
          bundle1: {
            steps: [
              { clone: {} },
              {
                script: {
                  inputs: [{ contents: 'echo "Hello, Bitrise!' }, { is_debug: false }],
                },
              },
              { test: {} },
            ],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepInputsInStepBundle(
        'bundle1',
        1,
        [{ contents: 'echo "Hello, Bitrise!' }, { is_debug: 'false' }],
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should delete the inputs field if empty', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            steps: [{ clone: {} }, { script: { inputs: [{ is_debug: true }] } }, { test: {} }],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            steps: [{ clone: {} }, { script: {} }, { test: {} }],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepInputsInStepBundle('bundle1', 1, [{ is_debug: '' }], sourceYml);
      expect(actualYml).toMatchBitriseYml(expectedYml);

      const actualYml2 = BitriseYmlService.updateStepInputsInStepBundle('bundle1', 1, [], sourceYml);
      expect(actualYml2).toMatchBitriseYml(expectedYml);
    });

    it('should return the original YML if the step bundle or step does not exist', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const actualYml = BitriseYmlService.updateStepInputsInStepBundle('wf1', 3, [], sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

  describe('appendStepBundleInput', () => {
    it('should add input to step bundle', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {},
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            inputs: [{ INPUT0: 'input0', opts: { is_required: true } }],
          },
        },
      };

      const actualYml = BitriseYmlService.appendStepBundleInput(
        'bundle1',
        { INPUT0: 'input0', opts: { is_required: true } },
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

  describe('deleteStepBundleInput', () => {
    it('should delete input from step bundle', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            inputs: [{ INPUT0: 'input0', opts: { is_required: true } }, { INPUT1: 'input1' }],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            inputs: [{ INPUT1: 'input1' }],
          },
        },
      };

      const actualYml = BitriseYmlService.deleteStepBundleInput('bundle1', 0, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

  describe('updateStepBundleInput', () => {
    it('should update key of bundle input', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            inputs: [{ opts: { is_required: true }, INPUT0: 'input0' }],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            inputs: [{ opts: { is_required: true }, INPUT0_NEW: 'input0' }],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepBundleInput(
        'bundle1',
        0,
        { INPUT0_NEW: 'input0', opts: { is_required: true } },
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should update value of bundle input', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            inputs: [{ opts: { is_required: true }, INPUT0: 'input0' }],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            inputs: [{ opts: { is_required: true }, INPUT0: 'input0_new' }],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepBundleInput(
        'bundle1',
        0,
        { INPUT0: 'input0_new', opts: { is_required: true } },
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should update opts of bundle input and keep the original order', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            inputs: [
              {
                opts: {
                  title: 'oldTitle',
                  is_required: true,
                  value_options: ['foo'],
                  category: 'category',
                },
                INPUT0: 'input0',
              },
            ],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            inputs: [
              {
                opts: {
                  title: 'new long Title',
                  value_options: ['bar'],
                  category: 'category',
                },
                INPUT0: 'input0',
              },
            ],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepBundleInput(
        'bundle1',
        0,
        {
          INPUT0: 'input0',
          opts: {
            category: 'category',
            title: 'new long Title',
            value_options: ['bar'],
            is_required: false,
          },
        },
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should add opts to step bunde', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            inputs: [
              {
                INPUT0: 'input0',
              },
            ],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            inputs: [{ INPUT0: 'input0', opts: { title: 'title' } }],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepBundleInput(
        'bundle1',
        0,
        {
          INPUT0: 'input0',
          opts: { title: 'title' },
        },
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should remove opts to step bunde', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            inputs: [
              {
                INPUT0: 'input0',
                opts: { is_required: true, title: 'title' },
              },
            ],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: {
            inputs: [{ INPUT0: 'input0' }],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepBundleInput(
        'bundle1',
        0,
        {
          INPUT0: 'input0',
          opts: { title: '', is_required: false },
        },
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });

  describe('updateStepBundleInputInstanceValue', () => {
    const sourceYmlTemplate: BitriseYml = {
      format_version: '',
      step_bundles: {
        bundle1: {
          inputs: [{ INPUT0: 'input0' }, { INPUT1: 'input1' }],
        },
      },
    };
    it('should update value of bundle instance input', () => {
      const sourceYml: BitriseYml = {
        ...sourceYmlTemplate,
        workflows: {
          wf1: {
            steps: [
              {
                'bundle::bundle1': {
                  inputs: [{ INPUT0: 'input0' }, { INPUT1: 'input1' }],
                },
              },
            ],
          },
        },
      };

      const expectedYml: BitriseYml = {
        ...sourceYmlTemplate,
        workflows: {
          wf1: {
            steps: [
              {
                'bundle::bundle1': {
                  inputs: [{ INPUT0: 'new_input0' }, { INPUT1: 'input1' }],
                },
              },
            ],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepBundleInputInstanceValue(
        'INPUT0',
        'new_input0',
        undefined,
        'wf1',
        'bundle::bundle1',
        0,
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should add value to bundle instance input', () => {
      const sourceYml: BitriseYml = {
        ...sourceYmlTemplate,
        workflows: {
          wf1: {
            steps: [
              {
                'bundle::bundle1': {},
              },
            ],
          },
        },
      };

      const expectedYml: BitriseYml = {
        ...sourceYmlTemplate,
        workflows: {
          wf1: {
            steps: [
              {
                'bundle::bundle1': {
                  inputs: [{ INPUT0: 'new_input0' }],
                },
              },
            ],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepBundleInputInstanceValue(
        'INPUT0',
        'new_input0',
        undefined,
        'wf1',
        'bundle::bundle1',
        0,
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should remove value from bundle instance input', () => {
      const sourceYml: BitriseYml = {
        ...sourceYmlTemplate,
        workflows: {
          wf1: {
            steps: [
              {
                'bundle::bundle1': {
                  inputs: [{ INPUT0: 'input0' }],
                },
              },
            ],
          },
        },
      };

      const expectedYml: BitriseYml = {
        ...sourceYmlTemplate,
        workflows: {
          wf1: {
            steps: [
              {
                'bundle::bundle1': {},
              },
            ],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepBundleInputInstanceValue(
        'INPUT0',
        '',
        undefined,
        'wf1',
        'bundle::bundle1',
        0,
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should return the original YML when the step bundle does not exist', () => {
      const sourceYml: BitriseYml = {
        ...sourceYmlTemplate,
        workflows: {
          wf1: {
            steps: [
              {
                'bundle::bundle1': {
                  inputs: [{ INPUT0: 'input0' }],
                },
              },
            ],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepBundleInputInstanceValue(
        'INPUT0',
        '',
        undefined,
        'wf1',
        'bundle::bundle2',
        0,
        sourceYml,
      );

      expect(sourceYml).toMatchBitriseYml(actualYml);
    });

    it('should return the original YML when the input is not defined in the bundle', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: {
            steps: [
              {
                'bundle::bundle1': {
                  inputs: [{ INPUT0: 'input0' }],
                },
              },
            ],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepBundleInputInstanceValue(
        'INPUT1',
        '',
        undefined,
        'wf1',
        'bundle::bundle1',
        0,
        sourceYml,
      );

      expect(sourceYml).toMatchBitriseYml(actualYml);
    });

    it('should return the original YML when the parent workflow is not exists', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
      };

      const actualYml = BitriseYmlService.updateStepBundleInputInstanceValue(
        'INPUT1',
        '',
        undefined,
        'wf1',
        'bundle::bundle1',
        0,
        sourceYml,
      );

      expect(sourceYml).toMatchBitriseYml(actualYml);
    });

    it('should return the original YML when the parent step bundle is not exists', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
      };

      const actualYml = BitriseYmlService.updateStepBundleInputInstanceValue(
        'INPUT1',
        '',
        'stepBundle1',
        undefined,
        'bundle::bundle1',
        0,
        sourceYml,
      );

      expect(sourceYml).toMatchBitriseYml(actualYml);
    });

    it('should return the original YML when the parent step index is not exists', () => {
      const sourceYml: BitriseYml = {
        ...sourceYmlTemplate,
        workflows: {
          wf1: {
            steps: [
              {
                'bundle::bundle1': {
                  inputs: [{ INPUT0: 'input0' }],
                },
              },
            ],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepBundleInputInstanceValue(
        'INPUT0',
        '',
        undefined,
        'wf1',
        'bundle::bundle1',
        1,
        sourceYml,
      );

      expect(sourceYml).toMatchBitriseYml(actualYml);
    });

    it('should update instance value in nested bundle', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ 'bundle::bundle2': {} }] },
          bundle2: {
            steps: [
              {
                'bundle::bundle3': {
                  inputs: [{ INPUT0: 'input0' }],
                },
              },
            ],
          },
          bundle3: {
            inputs: [{ INPUT0: 'default_value' }],
          },
        },

        workflows: {
          wf1: {
            steps: [
              {
                'bundle::bundle1': {},
              },
            ],
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        step_bundles: {
          bundle1: { steps: [{ 'bundle::bundle2': {} }] },
          bundle2: {
            steps: [
              {
                'bundle::bundle3': {
                  inputs: [{ INPUT0: 'input1' }],
                },
              },
            ],
          },
          bundle3: {
            inputs: [{ INPUT0: 'default_value' }],
          },
        },

        workflows: {
          wf1: {
            steps: [
              {
                'bundle::bundle1': {},
              },
            ],
          },
        },
      };

      const actualYml = BitriseYmlService.updateStepBundleInputInstanceValue(
        'INPUT0',
        'input1',
        'bundle2',
        undefined,
        'bundle::bundle3',
        0,
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });
  });
  describe('updateStacksAndMachinesMeta', () => {
    it("when meta doesn't exist, should add meta with bitrise.io, and stack and machine definition", () => {
      const sourceYml: BitriseYml = {
        format_version: '',
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        meta: {
          'bitrise.io': {
            stack: 'my-stack',
            machine_type_id: 'my-machine',
          },
        },
      };

      const actualYml = BitriseYmlService.updateStacksAndMachinesMeta(
        { stack: 'my-stack', machine_type_id: 'my-machine' },
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('when meta exist, should add bitrise.io, and stack and machine definition', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        meta: {},
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        meta: {
          'bitrise.io': {
            stack: 'my-stack',
            machine_type_id: 'my-machine',
          },
        },
      };

      const actualYml = BitriseYmlService.updateStacksAndMachinesMeta(
        { stack: 'my-stack', machine_type_id: 'my-machine' },
        sourceYml,
      );

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('when no stack is provided, should return the original YML without modifications', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        meta: {
          'bitrise.io': {
            stack: 'my-stack',
            machine_type_id: 'my-machine',
          },
        },
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        meta: {
          'bitrise.io': {
            stack: 'my-stack',
            machine_type_id: 'my-machine',
          },
        },
      };

      const actualYml = BitriseYmlService.updateStacksAndMachinesMeta({ stack: undefined }, sourceYml);

      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should update stack when new value is provided', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        meta: {
          'bitrise.io': {
            stack: 'existing-stack',
            machine_type_id: 'existing-machine',
          },
        },
      };

      const newValues = {
        stack: 'new-stack',
        machine_type_id: 'existing-machine',
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        meta: {
          'bitrise.io': {
            stack: 'new-stack',
            machine_type_id: 'existing-machine',
          },
        },
      };

      const actualYml = BitriseYmlService.updateStacksAndMachinesMeta(newValues, sourceYml);
      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should update machine_type_id when new value is provided', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        meta: {
          'bitrise.io': {
            stack: 'existing-stack',
            machine_type_id: 'existing-machine',
          },
        },
      };

      const newValues = {
        stack: 'existing-stack',
        machine_type_id: 'new-machine',
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        meta: {
          'bitrise.io': {
            stack: 'existing-stack',
            machine_type_id: 'new-machine',
          },
        },
      };

      const actualYml = BitriseYmlService.updateStacksAndMachinesMeta(newValues, sourceYml);
      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should update stack_rollback_version when new value is provided', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        meta: {
          'bitrise.io': {
            stack: 'existing-stack',
            machine_type_id: 'existing-machine',
          },
        },
      };

      const newValues = {
        stack: 'existing-stack',
        machine_type_id: 'existing-machine',
        stack_rollback_version: '1.84.1',
      };

      const expectedYml: BitriseYml = {
        format_version: '',
        meta: {
          'bitrise.io': {
            stack: 'existing-stack',
            machine_type_id: 'existing-machine',
            stack_rollback_version: '1.84.1',
          },
        },
      };

      const actualYml = BitriseYmlService.updateStacksAndMachinesMeta(newValues, sourceYml);
      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should not modify existing values when new values are undefined', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        meta: {
          'bitrise.io': {
            stack: 'existing-stack',
            machine_type_id: 'existing-machine',
          },
        },
      };

      const newValues = { stack: undefined };

      const expectedYml: BitriseYml = {
        format_version: '',
        meta: {
          'bitrise.io': {
            stack: 'existing-stack',
            machine_type_id: 'existing-machine',
          },
        },
      };

      const actualYml = BitriseYmlService.updateStacksAndMachinesMeta(newValues, sourceYml);
      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should remove machine_type_id when the new machine_type_id is undefined', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        meta: {
          'bitrise.io': {
            stack: 'existing-stack',
            machine_type_id: 'existing-machine',
          },
        },
      };

      const newValues = { stack: 'new-stack' };

      const expectedYml: BitriseYml = {
        format_version: '',
        meta: {
          'bitrise.io': {
            stack: 'new-stack',
          },
        },
      };

      const actualYml = BitriseYmlService.updateStacksAndMachinesMeta(newValues, sourceYml);
      expect(actualYml).toMatchBitriseYml(expectedYml);
    });

    it('should remove machine_type_id when the new stack_rollback_version is undefined', () => {
      const sourceYml: BitriseYml = {
        format_version: '',
        meta: {
          'bitrise.io': {
            stack: 'existing-stack',
            stack_rollback_version: '1.84.1',
          },
        },
      };

      const newValues = { stack: 'new-stack' };

      const expectedYml: BitriseYml = {
        format_version: '',
        meta: {
          'bitrise.io': {
            stack: 'new-stack',
          },
        },
      };

      const actualYml = BitriseYmlService.updateStacksAndMachinesMeta(newValues, sourceYml);
      expect(actualYml).toMatchBitriseYml(expectedYml);
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
