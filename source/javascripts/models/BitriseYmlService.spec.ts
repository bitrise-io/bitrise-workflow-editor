// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from '@jest/globals';
import type { MatcherFunction } from 'expect';
import { BitriseYml } from './BitriseYml';
import BitriseYmlService from './BitriseYmlService';
import { ChainedWorkflowPlacement } from './Workflow';

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

    describe('when workflow is not exists', () => {
      it('should returns the original YML', () => {
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

    it('should return the original BitriseYml if workflow is not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const actualYml = BitriseYmlService.moveStep('wf2', 2, 0, sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should return the original BitriseYml if step on is not exist', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const actualYml = BitriseYmlService.moveStep('wf1', 3, 0, sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
    });

    it('should return the original BitriseYml if destination index is out of range', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        workflows: {
          wf1: { steps: [{ script: {} }, { clone: {} }, { deploy: {} }] },
        },
      };

      const actualYml = BitriseYmlService.moveStep('wf1', 2, 3, sourceAndExpectedYml);

      expect(actualYml).toMatchBitriseYml(sourceAndExpectedYml);
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

    it('should not able to insert chaneind workflow to invalid placement', () => {
      const sourceAndExpectedYml: BitriseYml = {
        format_version: '',
        workflows: { wf1: {}, wf2: {} },
      };

      const placement = 'invalid_placement' as ChainedWorkflowPlacement;
      const actualYml = BitriseYmlService.addChainedWorkflow('wf2', 'wf3', placement, sourceAndExpectedYml);

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
});

declare module 'expect' {
  interface AsymmetricMatchers {
    toMatchBitriseYml(expected: BitriseYml): void;
  }

  interface Matchers<R> {
    toMatchBitriseYml(expected: BitriseYml): R;
  }
}
