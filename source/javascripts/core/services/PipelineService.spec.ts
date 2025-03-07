import { BitriseYml, PipelineModel, Stages } from '../models/BitriseYml';
import PipelineService from './PipelineService';

describe('PipelineService', () => {
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
    it('returns an error message if the pipeline name is empty', () => {
      expect(PipelineService.validateName('')).toBe('Pipeline name is required.');
    });

    it('returns an error message if the pipeline name contains invalid characters', () => {
      expect(PipelineService.validateName('invalid name!')).toBe(
        'Pipeline name must only contain letters, numbers, dashes, underscores or periods.',
      );
    });

    it('returns an error message if the pipeline name is not unique', () => {
      expect(PipelineService.validateName('pipeline1', ['pipeline1'])).toBe('Pipeline name should be unique.');
    });

    it('returns true if the pipeline name is valid', () => {
      expect(PipelineService.validateName('valid-name')).toBe(true);
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
});
