import { BitriseYml } from '../models/BitriseYml';
import { ChainedWorkflowPlacement } from '../models/Workflow';
import BitriseYmlService from './BitriseYmlService';

describe('BitriseYmlService', () => {
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
});

declare module 'expect' {
  interface AsymmetricMatchers {
    toMatchBitriseYml(expected: BitriseYml): void;
  }

  interface Matchers<R> {
    toMatchBitriseYml(expected: BitriseYml): R;
  }
}
