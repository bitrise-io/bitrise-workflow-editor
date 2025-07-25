import { BitriseYml, PipelineModel, Stages } from '../models/BitriseYml';
import { getYmlString, updateBitriseYmlDocumentByString } from '../stores/BitriseYmlStore';
import PipelineService from './PipelineService';

describe('PipelineService', () => {
  describe('isIntegerValue', () => {
    it('should return true for valid integers', () => {
      expect(PipelineService.isIntegerValue(42)).toBe(true);
      expect(PipelineService.isIntegerValue('42')).toBe(true);
      expect(PipelineService.isIntegerValue(0)).toBe(true);
      expect(PipelineService.isIntegerValue('0')).toBe(true);
      expect(PipelineService.isIntegerValue(-1)).toBe(true);
    });

    it('should return false for non-integers', () => {
      expect(PipelineService.isIntegerValue('foo')).toBe(false);
      expect(PipelineService.isIntegerValue(undefined)).toBe(false);
      expect(PipelineService.isIntegerValue(1.5)).toBe(false);
      expect(PipelineService.isIntegerValue('1.5')).toBe(false);
      expect(PipelineService.isIntegerValue('$FOO')).toBe(false);
    });
  });

  describe('asIntegerIfPossible', () => {
    it('should convert valid numbers to integers', () => {
      expect(PipelineService.asIntegerIfPossible('42')).toBe(42);
      expect(PipelineService.asIntegerIfPossible(42)).toBe(42);
      expect(PipelineService.asIntegerIfPossible('0')).toBe(0);
      expect(PipelineService.asIntegerIfPossible(0)).toBe(0);
      expect(PipelineService.asIntegerIfPossible('-1')).toBe(-1);
    });

    it('should return original value for non-integers', () => {
      expect(PipelineService.asIntegerIfPossible('foo')).toBe('foo');
      expect(PipelineService.asIntegerIfPossible('$FOO')).toBe('$FOO');
      expect(PipelineService.asIntegerIfPossible('1.5')).toBe('1.5');
      expect(PipelineService.asIntegerIfPossible(undefined)).toBeUndefined();
    });
  });

  describe('isGraph', () => {
    it('returns true if the pipeline has workflows', () => {
      const pipeline: PipelineModel = { workflows: {} };
      expect(PipelineService.isGraph(pipeline)).toBe(true);
    });

    it('returns false if the pipeline does not have workflows', () => {
      const pipeline: PipelineModel = {};
      expect(PipelineService.isGraph(pipeline)).toBe(false);
    });
  });

  describe('getPipeline', () => {
    it('returns the pipeline when it exists', () => {
      const yml: BitriseYml = {
        format_version: '',
        pipelines: {
          pipeline1: { workflows: { wf1: {} } },
          pipeline2: { stages: [{ st1: {} }] },
        },
      };

      expect(PipelineService.getPipeline('pipeline1', yml)).toEqual({
        workflows: { wf1: {} },
      });
      expect(PipelineService.getPipeline('pipeline2', yml)).toEqual({
        stages: [{ st1: {} }],
      });
    });

    it('returns undefined when the pipeline does not exist', () => {
      const yml: BitriseYml = {
        format_version: '',
        pipelines: { pipeline1: { workflows: {} } },
      };

      expect(PipelineService.getPipeline('nonexistent', yml)).toBeUndefined();
    });

    it('returns undefined when pipelines is undefined', () => {
      const yml: BitriseYml = { format_version: '' };

      expect(PipelineService.getPipeline('pipeline1', yml)).toBeUndefined();
    });
  });

  describe('getPipelineType', () => {
    it('returns "graph" for pipelines with workflows', () => {
      const yml: BitriseYml = {
        format_version: '',
        pipelines: { graph: { workflows: {} } },
      };

      expect(PipelineService.getPipelineType('graph', yml)).toBe('graph');
    });

    it('returns "staged" for pipelines with stages', () => {
      const yml: BitriseYml = {
        format_version: '',
        pipelines: { staged: { stages: [] } },
      };

      expect(PipelineService.getPipelineType('staged', yml)).toBe('staged');
    });

    it('returns undefined when the pipeline does not exist', () => {
      const yml: BitriseYml = {
        format_version: '',
        pipelines: { pipeline1: { workflows: {} } },
      };

      expect(PipelineService.getPipelineType('nonexistent', yml)).toBeUndefined();
    });

    it('returns undefined when pipelines is undefined', () => {
      const yml: BitriseYml = { format_version: '' };

      expect(PipelineService.getPipelineType('pipeline', yml)).toBeUndefined();
    });
  });

  describe('validateName', () => {
    describe('when the initial name is empty', () => {
      it('returns true if the pipeline name is valid and unique', () => {
        expect(PipelineService.validateName('pl4', '', ['pl1', 'pl2', 'pl3'])).toBe(true);
      });

      it('returns an error message if the pipeline name is empty', () => {
        expect(PipelineService.validateName('', '', ['pl1', 'pl2', 'pl3'])).toBe('Pipeline name is required');
      });

      it('returns an error message if the pipeline name contains only whitespaces', () => {
        expect(PipelineService.validateName('   ', '', ['pl1', 'pl2', 'pl3'])).toBe('Pipeline name is required');
      });

      it('returns an error message if the pipeline name contains invalid characters', () => {
        expect(PipelineService.validateName('invalid!', '', ['pl1', 'pl2', 'pl3'])).toBe(
          'Pipeline name must only contain letters, numbers, dashes, underscores or periods',
        );
      });

      it('returns an error message if the pipeline name is not unique', () => {
        expect(PipelineService.validateName('pl1', '', ['pl1', 'pl2', 'pl3'])).toBe('Pipeline name should be unique');
      });
    });

    describe('when the initial name is not empty', () => {
      it('returns true if the pipeline name is valid and unique', () => {
        expect(PipelineService.validateName('pl4', 'pl1', ['pl1', 'pl2', 'pl3'])).toBe(true);
      });

      it('returns an error message if the pipeline name is empty', () => {
        expect(PipelineService.validateName('', 'pl1', ['pl1', 'pl2', 'pl3'])).toBe('Pipeline name is required');
      });

      it('returns an error message if the pipeline name contains only whitespaces', () => {
        expect(PipelineService.validateName('   ', 'pl1', ['pl1', 'pl2', 'pl3'])).toBe('Pipeline name is required');
      });

      it('returns an error message if the pipeline name contains invalid characters', () => {
        expect(PipelineService.validateName('invalid!', 'pl1', ['pl1', 'pl2', 'pl3'])).toBe(
          'Pipeline name must only contain letters, numbers, dashes, underscores or periods',
        );
      });

      it('returns an error message if the pipeline name is not unique', () => {
        expect(PipelineService.validateName('pl2', 'pl1', ['pl1', 'pl2', 'pl3'])).toBe(
          'Pipeline name should be unique',
        );
      });
    });
  });

  describe('sanitizeName', () => {
    it('removes invalid characters from the name', () => {
      expect(PipelineService.sanitizeName('invalid name!')).toBe('invalidname');
    });

    it('trims whitespace from the name', () => {
      expect(PipelineService.sanitizeName('  name  ')).toBe('name');
    });
  });

  describe('validateParallel', () => {
    it('should return true when parallel is not provided', () => {
      expect(PipelineService.validateParallel()).toBe(true);
    });

    it('should return true when parallel starts with $', () => {
      expect(PipelineService.validateParallel('$FOO')).toBe(true);
      expect(PipelineService.validateParallel('$A123')).toBe(true);
    });

    it('should return true when parallel is a positive integer', () => {
      expect(PipelineService.validateParallel(42)).toBe(true);
      expect(PipelineService.validateParallel('42')).toBe(true);
      expect(PipelineService.validateParallel(1)).toBe(true);
    });

    it('should return error message for invalid values', () => {
      const expectedError = 'Parallel copies should be a positive integer or a valid environment variable.';
      expect(PipelineService.validateParallel('foo')).toBe(expectedError);
      expect(PipelineService.validateParallel(-1)).toBe(expectedError);
      expect(PipelineService.validateParallel(0)).toBe(expectedError);
      expect(PipelineService.validateParallel('0')).toBe(expectedError);
      expect(PipelineService.validateParallel(1.5)).toBe(expectedError);
      expect(PipelineService.validateParallel('1.5')).toBe(expectedError);
    });

    describe('collision detection when parallel is positive integer', () => {
      it('should return true when collision not detected', () => {
        expect(PipelineService.validateParallel(3, 'foo', ['bar'])).toBe(true);
      });

      it('should return error message when collision detected', () => {
        expect(PipelineService.validateParallel(3, 'foo', ['bar', 'foo', 'foo_1', 'foo_2'])).toBe(
          'Cannot create 3 parallel Workflows because the following IDs already exist: foo_1, foo_2.',
        );
      });
    });

    describe('collision detection when parallel is environment variable', () => {
      it('should return true when collision not detected', () => {
        expect(PipelineService.validateParallel('$ENV', 'foo', ['bar'])).toBe(true);
      });

      it('should return error message when possible collision detected', () => {
        expect(PipelineService.validateParallel('$ENV', 'foo', ['bar', 'foo', 'foo_1', 'foo_2'])).toBe(
          'The environment variable $ENV might create Workflow IDs that conflict with existing Workflows: foo_1, foo_2.',
        );
      });
    });

    describe('maximum parallel copies', () => {
      it('should return true when parallel is less than or equal to 200', () => {
        expect(PipelineService.validateParallel(200)).toBe(true);
        expect(PipelineService.validateParallel('200')).toBe(true);
        expect(PipelineService.validateParallel(199)).toBe(true);
      });

      it('should return error message when parallel is greater than 200', () => {
        expect(PipelineService.validateParallel(201)).toBe('The maximum number of parallel copies is 200.');
        expect(PipelineService.validateParallel('201')).toBe('The maximum number of parallel copies is 200.');
      });
    });
  });

  describe('hasStepInside', () => {
    it('returns false if the pipeline does not exist', () => {
      const yml: BitriseYml = { format_version: '' };

      expect(PipelineService.hasStepInside('pl1', 'pull-intermediate-files', yml)).toBe(false);
    });

    it('returns false if the pipeline is not a graph pipeline', () => {
      const yml: BitriseYml = { format_version: '', pipelines: { pl1: {} } };

      expect(PipelineService.hasStepInside('pl1', 'pull-intermediate-files', yml)).toBe(false);
    });

    it('returns true if pipeline contains the step', () => {
      const yml: BitriseYml = {
        format_version: '',
        pipelines: { pl1: { workflows: { wf1: {} } } },
        workflows: { wf1: { steps: [{ 'pull-intermediate-files@1': {} }] } },
      };

      expect(PipelineService.hasStepInside('pl1', 'pull-intermediate-files', yml)).toBe(true);
    });

    it('returns false if the pipeline NOT contains the step', () => {
      const yml: BitriseYml = {
        format_version: '',
        pipelines: { pl1: { workflows: { wf1: {} } } },
        workflows: { wf1: { steps: [{ 'script@1': {} }] } },
      };

      expect(PipelineService.hasStepInside('pl1', 'pull-intermediate-files', yml)).toBe(false);
    });

    it('returns false if another pipeline contains the step', () => {
      const yml: BitriseYml = {
        format_version: '',
        pipelines: {
          pl1: { workflows: { wf1: {} } },
          pl2: { workflows: { wf2: {} } },
        },
        workflows: {
          wf1: { steps: [{ 'script@1': {} }] },
          wf2: { steps: [{ 'pull-intermediate-file@1': {} }] },
        },
      };

      expect(PipelineService.hasStepInside('pl1', 'pull-intermediate-files', yml)).toBe(false);
    });
  });

  describe('numberOfStages', () => {
    it('returns the correct number of stages', () => {
      const pipeline: PipelineModel = {
        stages: [{ st1: {} }, { st2: {} }, { st3: {} }],
      };
      expect(PipelineService.numberOfStages(pipeline)).toBe(3);
    });

    it('returns 0 if stages is an empty array', () => {
      const pipeline: PipelineModel = { stages: [] };
      expect(PipelineService.numberOfStages(pipeline)).toBe(0);
    });

    it('returns 0 if the pipeline has no stages', () => {
      const pipeline: PipelineModel = { workflows: { wf1: {} } };
      expect(PipelineService.numberOfStages(pipeline)).toBe(0);
    });
  });

  describe('convertToGraphPipeline', () => {
    it('returns the same pipeline if it is already a graph pipeline', () => {
      const pipeline: PipelineModel = { workflows: {} };
      expect(PipelineService.convertToGraphPipeline(pipeline, {})).toBe(pipeline);
    });

    it('returns an empty graph pipeline if the input is an empty staged pipeline', () => {
      const pipeline: PipelineModel = { stages: [] };
      expect(PipelineService.convertToGraphPipeline(pipeline, {})).toEqual(PipelineService.EMPTY_PIPELINE);
    });

    it('copy the workflows with dependencies set based on the stages', () => {
      const pipeline: PipelineModel = {
        stages: [{ st1: {} }, { st2: {} }, { st3: {} }],
      };
      const stages: Stages = {
        st1: { workflows: [{ wf1: {} }, { wf1: {} }] },
        st2: { workflows: [{ wf2: {} }, { wf5: {} }] },
        st3: { workflows: [{ wf3: {} }] },
        st4: { workflows: [{ wf4: {} }] },
        st5: { workflows: [{ wf5: {} }] },
        st6: { workflows: [{ wf6: {} }] },
      };

      const expected: PipelineModel = {
        workflows: {
          wf1: {},
          wf2: { depends_on: ['wf1'] },
          wf5: { depends_on: ['wf1'] },
          wf3: { depends_on: ['wf2', 'wf5'] },
        },
      };

      expect(PipelineService.convertToGraphPipeline(pipeline, stages)).toEqual(expected);
    });

    it('copy pipeline properties to the new graph pipeline', () => {
      const stagedPipeline: PipelineModel = {
        title: 'Staged Pipeline',
        stages: [],
        triggers: { push: [] },
      };
      const graphPipeline = PipelineService.convertToGraphPipeline(stagedPipeline, {});
      const expectedPipeline: PipelineModel = {
        title: 'Staged Pipeline',
        workflows: {},
        triggers: { push: [] },
      };
      expect(graphPipeline).toEqual(expectedPipeline);
    });

    it('copy the run_if, abort_on_fail, and should_always_run properties to the new graph pipeline', () => {
      const pipeline: PipelineModel = {
        stages: [{ st1: {} }, { st2: {} }, { st3: {} }],
      };
      const stages: Stages = {
        st1: {
          abort_on_fail: true,
          workflows: [{ wf1: { run_if: 'true' } }, { wf2: { run_if: 'false' } }, { wf3: {} }],
        },
        st2: {
          should_always_run: true,
          workflows: [{ wf4: {} }],
        },
        st3: {
          abort_on_fail: false,
          should_always_run: false,
          workflows: [{ wf5: {} }],
        },
      };

      const expected: PipelineModel = {
        workflows: {
          wf1: {
            abort_on_fail: true,
            run_if: { expression: 'true' },
          },
          wf2: {
            abort_on_fail: true,
            run_if: { expression: 'false' },
          },
          wf3: {
            abort_on_fail: true,
          },
          wf4: {
            should_always_run: 'workflow',
            depends_on: ['wf1', 'wf2', 'wf3'],
          },
          wf5: {
            abort_on_fail: false,
            should_always_run: 'off',
            depends_on: ['wf4'],
          },
        },
      };

      expect(PipelineService.convertToGraphPipeline(pipeline, stages)).toEqual(expected);
    });
  });

  describe('createPipeline', () => {
    it('should create a pipeline with empty workflows if base pipeline is missing', () => {
      updateBitriseYmlDocumentByString(
        yaml`
        `,
      );

      PipelineService.createPipeline('new_pipeline');

      const expectedYml = yaml`
        pipelines:
          new_pipeline:
            workflows: {}
        `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should create a pipeline based on an other graph pipeline', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            base_pipeline:
              workflows:
                wf1: {}
                wf2:
                  depends_on: [ wf1 ]
        `,
      );

      PipelineService.createPipeline('new_pipeline', 'base_pipeline');

      const expectedYml = yaml`
        pipelines:
          base_pipeline:
            workflows:
              wf1: {}
              wf2:
                depends_on: [ wf1 ]
          new_pipeline:
            workflows:
              wf1: {}
              wf2:
                depends_on: [ wf1 ]
        `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should create a pipeline based on a staged pipeline', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            base_pipeline:
              title: Staged Pipeline
              stages:
              - st1: {}
              - st2: {}
          stages:
            st1:
              workflows:
              - wf1: {}
              - wf2: {}
            st2:
              workflows:
              - wf3: {}
          workflows:
            wf1: {}
            wf2: {}
            wf3: {}
        `,
      );

      PipelineService.createPipeline('new_pipeline', 'base_pipeline');

      const expectedYml = yaml`
        pipelines:
          base_pipeline:
            title: Staged Pipeline
            stages:
            - st1: {}
            - st2: {}
          new_pipeline:
            title: Staged Pipeline
            workflows:
              wf1: {}
              wf2: {}
              wf3:
                depends_on:
                - wf1
                - wf2
        stages:
          st1:
            workflows:
            - wf1: {}
            - wf2: {}
          st2:
            workflows:
            - wf3: {}
        workflows:
          wf1: {}
          wf2: {}
          wf3: {}
        `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if the base pipeline is not found', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            base_pipeline:
              workflows:
                wf1: {}
                wf2:
                  depends_on: [ wf1 ]
        `,
      );

      expect(() => PipelineService.createPipeline('new_pipeline', 'non_existent_pipeline')).toThrow(
        "Pipeline non_existent_pipeline not found. Ensure that the pipeline exists in the 'pipelines' section.",
      );
    });

    it('should throw an error if the pipeline id already exists', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            existing_pipeline:
              workflows: {}
        `,
      );

      expect(() => PipelineService.createPipeline('existing_pipeline')).toThrow(
        'Pipeline existing_pipeline already exists',
      );
    });
  });

  describe('renamePipeline', () => {
    it('should rename the pipeline and update references', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            old_pipeline:
              workflows: {}
          trigger_map:
          - type: push
            pipeline: old_pipeline
        `,
      );

      PipelineService.renamePipeline('old_pipeline', 'new_pipeline');

      const expectedYml = yaml`
        pipelines:
          new_pipeline:
            workflows: {}
        trigger_map:
        - type: push
          pipeline: new_pipeline
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if the pipeline does not exist', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            existing_pipeline:
              workflows: {}
        `,
      );

      expect(() => PipelineService.renamePipeline('non_existent_pipeline', 'new_name')).toThrow(
        "Pipeline non_existent_pipeline not found. Ensure that the pipeline exists in the 'pipelines' section.",
      );
    });

    it('should throw an error if the new pipeline name already exists', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            existing_pipeline:
              workflows: {}
            another_pipeline:
              workflows: {}
        `,
      );

      expect(() => PipelineService.renamePipeline('existing_pipeline', 'another_pipeline')).toThrow(
        'Pipeline another_pipeline already exists',
      );
    });

    it('should be able to rename a newly created pipeline', () => {
      updateBitriseYmlDocumentByString(yaml`
        pipelines:
          pl1:
            workflows: {}
      `);

      PipelineService.createPipeline('new_pipeline');
      PipelineService.renamePipeline('new_pipeline', 'renamed_pipeline');

      const expectedYml = yaml`
        pipelines:
          pl1:
            workflows: {}
          renamed_pipeline:
            workflows: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });
  });

  describe('deletePipeline', () => {
    it('should delete the pipeline and its references', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            pipeline_to_delete:
              workflows: {}
            another_pipeline:
              workflows: {}
          trigger_map:
          - type: push
            pipeline: pipeline_to_delete
        `,
      );

      PipelineService.deletePipeline('pipeline_to_delete');

      const expectedYml = yaml`
        pipelines:
          another_pipeline:
            workflows: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should delete multiple pipelines and their references', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            pipeline1:
              workflows: {}
            pipeline3:
              workflows: {}
            pipeline2:
              workflows: {}
          trigger_map:
          - type: pull_request
            pipeline: pipeline2
          - type: push
            pipeline: pipeline1
          - type: tag
            pipeline: pipeline3
        `,
      );

      PipelineService.deletePipeline(['pipeline1', 'pipeline2']);

      const expectedYml = yaml`
        pipelines:
          pipeline3:
            workflows: {}
        trigger_map:
        - type: tag
          pipeline: pipeline3
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should remove pipelines section if all pipelines are deleted', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          format_version: '1.0'
          pipelines:
            pipeline1:
              workflows: {}
            pipeline2:
              workflows: {}
          trigger_map:
          - type: push
            pipeline: pipeline1
          - type: pull_request
            pipeline: pipeline2
        `,
      );

      PipelineService.deletePipeline(['pipeline1', 'pipeline2']);

      const expectedYml = yaml`
        format_version: '1.0'
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if the pipeline does not exist', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            existing_pipeline:
              workflows: {}
        `,
      );

      expect(() => PipelineService.deletePipeline('non_existent_pipeline')).toThrow(
        "Pipeline non_existent_pipeline not found. Ensure that the pipeline exists in the 'pipelines' section.",
      );
    });
  });

  describe('updatePipelineField', () => {
    it('should update an existing pipeline field', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            existing_pipeline:
              title: Old Title
              workflows: {}
        `,
      );

      PipelineService.updatePipelineField('existing_pipeline', 'title', 'New Title');

      const expectedYml = yaml`
        pipelines:
          existing_pipeline:
            title: New Title
            workflows: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should set a non-existing pipeline field', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            existing_pipeline:
              workflows: {}
        `,
      );

      PipelineService.updatePipelineField('existing_pipeline', 'title', 'New Title');

      const expectedYml = yaml`
        pipelines:
          existing_pipeline:
            workflows: {}
            title: New Title
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should delete the field if the value is empty', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            existing_pipeline:
              title: Old Title
              workflows: {}
        `,
      );

      PipelineService.updatePipelineField('existing_pipeline', 'title', '');

      const expectedYml = yaml`
        pipelines:
          existing_pipeline:
            workflows: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if the pipeline does not exist', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            existing_pipeline:
              workflows: {}
        `,
      );

      expect(() => PipelineService.updatePipelineField('non_existent_pipeline', 'title', 'New Title')).toThrow(
        "Pipeline non_existent_pipeline not found. Ensure that the pipeline exists in the 'pipelines' section.",
      );
    });
  });

  describe('addWorkflowToPipeline', () => {
    it('should add a root workflow to the given pipeline', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            pipeline1:
              workflows: {}
          workflows:
            wf1: {}
        `,
      );

      PipelineService.addWorkflowToPipeline('pipeline1', 'wf1');

      const expectedYml = yaml`
        pipelines:
          pipeline1:
            workflows:
              wf1: {}
        workflows:
          wf1: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should add a dependant workflow to the given pipeline', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            pipeline1:
              workflows:
                wf1: {}
          workflows:
            wf1: {}
            wf2: {}
        `,
      );

      PipelineService.addWorkflowToPipeline('pipeline1', 'wf2', 'wf1');

      const expectedYml = yaml`
        pipelines:
          pipeline1:
            workflows:
              wf1: {}
              wf2:
                depends_on:
                - wf1
        workflows:
          wf1: {}
          wf2: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if the workflow is already there', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            pipeline1:
              workflows:
                wf1: {}
          workflows:
            wf1: {}
        `,
      );

      expect(() => PipelineService.addWorkflowToPipeline('pipeline1', 'wf1')).toThrow(
        'Workflow wf1 already exists in pipeline pipeline1.',
      );
    });

    it('should throw an error if the pipeline does not exist', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            pipeline1:
              workflows: {}
          workflows:
            wf1: {}
        `,
      );

      expect(() => PipelineService.addWorkflowToPipeline('non_existent_pipeline', 'wf1')).toThrow(
        "Pipeline non_existent_pipeline not found. Ensure that the pipeline exists in the 'pipelines' section.",
      );
    });

    it('should throw an error if the workflow does not exist', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            pipeline1:
              workflows: {}
          workflows:
            wf1: {}
        `,
      );

      expect(() => PipelineService.addWorkflowToPipeline('pipeline1', 'non_existent_workflow')).toThrow(
        "Workflow non_existent_workflow not found. Ensure that the workflow exists in the 'workflows' section.",
      );
    });

    it('should throw an error if the depends_on workflow is not part of the pipeline', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            pipeline1:
              workflows: {}
          workflows:
            wf1: {}
            wf2: {}
        `,
      );

      expect(() => PipelineService.addWorkflowToPipeline('pipeline1', 'wf2', 'wf1')).toThrow(
        'Workflow wf1 not found in pipeline pipeline1.',
      );
    });
  });

  describe('removeWorkflowFromPipeline', () => {
    it('should remove the workflow and references from the given pipeline', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            pipeline1:
              workflows:
                wf1: {}
                wf2:
                  depends_on:
                  - wf1
            pipeline2:
              workflows:
                wf3: {}
          workflows:
            wf1: {}
            wf2: {}
            wf3: {}
        `,
      );

      PipelineService.removeWorkflowFromPipeline('pipeline1', 'wf1');
      PipelineService.removeWorkflowFromPipeline('pipeline2', 'wf3');

      const expectedYml = yaml`
        pipelines:
          pipeline1:
            workflows:
              wf2: {}
          pipeline2:
            workflows: {}
        workflows:
          wf1: {}
          wf2: {}
          wf3: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if the pipeline does not exist', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            pipeline1:
              workflows: {}
          workflows:
            wf1: {}
        `,
      );

      expect(() => PipelineService.removeWorkflowFromPipeline('non_existent_pipeline', 'wf1')).toThrow(
        "Pipeline non_existent_pipeline not found. Ensure that the pipeline exists in the 'pipelines' section.",
      );
    });

    it('should throw an error if the workflow does not exist', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            pipeline1:
              workflows: {}
          workflows:
            wf1: {}
        `,
      );

      expect(() => PipelineService.removeWorkflowFromPipeline('pipeline1', 'non_existent_workflow')).toThrow(
        'Workflow non_existent_workflow not found in pipeline pipeline1.',
      );
    });

    it('should NOT remove the workflows field if it becomes empty after removal', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            pipeline1:
              workflows:
                wf1: {}
          workflows:
            wf1: {}
        `,
      );

      PipelineService.removeWorkflowFromPipeline('pipeline1', 'wf1');

      const expectedYml = yaml`
        pipelines:
          pipeline1:
            workflows: {}
        workflows:
          wf1: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });
  });

  describe('updatePipelineWorkflowField', () => {
    it('should update the workflow field in the given pipeline', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            pipeline1:
              workflows:
                wf1: {}
          workflows:
            wf1: {}
        `,
      );

      PipelineService.updatePipelineWorkflowField('pipeline1', 'wf1', 'run_if.expression', '.CI');

      const expectedYml = yaml`
        pipelines:
          pipeline1:
            workflows:
              wf1:
                run_if:
                  expression: .CI
        workflows:
          wf1: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should remove the workflow field if the value is empty', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            pipeline1:
              workflows:
                wf1:
                  run_if:
                    expression: .CI
          workflows:
            wf1: {}
        `,
      );

      PipelineService.updatePipelineWorkflowField('pipeline1', 'wf1', 'run_if.expression', '');

      const expectedYml = yaml`
        pipelines:
          pipeline1:
            workflows:
              wf1: {}
        workflows:
          wf1: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if the pipeline does not exist', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            pipeline1:
              workflows: {}
          workflows:
            wf1: {}
        `,
      );

      expect(() =>
        PipelineService.updatePipelineWorkflowField('non_existent_pipeline', 'wf1', 'run_if.expression', '.CI'),
      ).toThrow(
        "Pipeline non_existent_pipeline not found. Ensure that the pipeline exists in the 'pipelines' section.",
      );
    });

    it('should throw an error if the workflow does not exist', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            pipeline1:
              workflows: {}
          workflows:
            wf1: {}
        `,
      );

      expect(() =>
        PipelineService.updatePipelineWorkflowField('pipeline1', 'non_existent_workflow', 'run_if.expression', '.CI'),
      ).toThrow('Workflow non_existent_workflow not found in pipeline pipeline1.');
    });
  });

  describe('addPipelineWorkflowDependency', () => {
    it('should add a dependency to the workflow in the given pipeline', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            pipeline1:
              workflows:
                wf1: {}
                wf2: {}
          workflows:
            wf1: {}
            wf2: {}
        `,
      );

      PipelineService.addPipelineWorkflowDependency('pipeline1', 'wf2', 'wf1');

      const expectedYml = yaml`
        pipelines:
          pipeline1:
            workflows:
              wf1: {}
              wf2:
                depends_on:
                - wf1
        workflows:
          wf1: {}
          wf2: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if the pipeline does not exist', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            pipeline1:
              workflows: {}
          workflows:
            wf1: {}
        `,
      );

      expect(() => PipelineService.addPipelineWorkflowDependency('non_existent_pipeline', 'wf1', 'wf2')).toThrow(
        "Pipeline non_existent_pipeline not found. Ensure that the pipeline exists in the 'pipelines' section.",
      );
    });

    it('should throw an error if the workflow does not exist', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            pipeline1:
              workflows: {}
          workflows:
            wf1: {}
        `,
      );

      expect(() => PipelineService.addPipelineWorkflowDependency('pipeline1', 'non_existent_workflow', 'wf2')).toThrow(
        'Workflow non_existent_workflow not found in pipeline pipeline1.',
      );
    });

    it('should throw an error if the depends_on workflow is not part of the pipeline', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            pipeline1:
              workflows:
                wf1: {}
          workflows:
            wf1: {}
            wf2: {}
        `,
      );

      expect(() => PipelineService.addPipelineWorkflowDependency('pipeline1', 'wf1', 'non_existent_workflow')).toThrow(
        'Workflow non_existent_workflow not found in pipeline pipeline1.',
      );
    });

    it('should throw an error if the workflow is already a dependency', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            pipeline1:
              workflows:
                wf1: {}
                wf2:
                  depends_on:
                  - wf1
          workflows:
            wf1: {}
            wf2: {}
        `,
      );

      expect(() => PipelineService.addPipelineWorkflowDependency('pipeline1', 'wf2', 'wf1')).toThrow(
        'Workflow wf2 already depends on wf1.',
      );
    });

    it('should throw error if workflow is dependent on itself', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            pipeline1:
              workflows:
                wf1: {}
          workflows:
            wf1: {}
        `,
      );

      expect(() => PipelineService.addPipelineWorkflowDependency('pipeline1', 'wf1', 'wf1')).toThrow(
        'Workflow wf1 cannot depend on itself.',
      );
    });
  });

  describe('removePipelineWorkflowDependency', () => {
    it('should remove the dependency from the workflow in the given pipeline', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            pipeline1:
              workflows:
                wf1: {}
                wf2:
                  depends_on:
                  - wf1
          workflows:
            wf1: {}
            wf2: {}
        `,
      );

      PipelineService.removePipelineWorkflowDependency('pipeline1', 'wf2', 'wf1');

      const expectedYml = yaml`
        pipelines:
          pipeline1:
            workflows:
              wf1: {}
              wf2: {}
        workflows:
          wf1: {}
          wf2: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if the pipeline does not exist', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            pipeline1:
              workflows: {}
          workflows:
            wf1: {}
        `,
      );

      expect(() => PipelineService.removePipelineWorkflowDependency('non_existent_pipeline', 'wf1', 'wf2')).toThrow(
        "Pipeline non_existent_pipeline not found. Ensure that the pipeline exists in the 'pipelines' section.",
      );
    });

    it('should throw an error if the workflow does not exist', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            pipeline1:
              workflows: {}
          workflows:
            wf1: {}
        `,
      );

      expect(() =>
        PipelineService.removePipelineWorkflowDependency('pipeline1', 'non_existent_workflow', 'wf2'),
      ).toThrow('Workflow non_existent_workflow not found in pipeline pipeline1.');
    });

    it('should throw an error if the depends_on workflow is not part of the pipeline', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          pipelines:
            pipeline1:
              workflows:
                wf1: {}
          workflows:
            wf1: {}
            wf2: {}
        `,
      );

      expect(() =>
        PipelineService.removePipelineWorkflowDependency('pipeline1', 'wf1', 'non_existent_workflow'),
      ).toThrow('Workflow non_existent_workflow not found in pipeline pipeline1.');
    });
  });
});
