import { PipelineYmlObject } from './Pipeline';
import PipelineService from './PipelineService';
import { StagesYml } from './Stage';

describe('PipelineService', () => {
  describe('isGraph', () => {
    it('returns true if the pipeline has workflows', () => {
      const pipeline: PipelineYmlObject = { workflows: {} };
      expect(PipelineService.isGraph(pipeline)).toBe(true);
    });

    it('returns false if the pipeline does not have workflows', () => {
      const pipeline: PipelineYmlObject = {};
      expect(PipelineService.isGraph(pipeline)).toBe(false);
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

  describe('convertToGraphPipeline', () => {
    it('returns the same pipeline if it is already a graph pipeline', () => {
      const pipeline: PipelineYmlObject = { workflows: {} };
      expect(PipelineService.convertToGraphPipeline(pipeline, {})).toBe(pipeline);
    });

    it('returns an empty graph pipeline if the input is an empty staged pipeline', () => {
      const pipeline: PipelineYmlObject = { stages: [] };
      expect(PipelineService.convertToGraphPipeline(pipeline, {})).toEqual(PipelineService.EMPTY_PIPELINE);
    });

    it('copy the workflows with dependencies set based on the stages', () => {
      const pipeline: PipelineYmlObject = {
        stages: [{ st1: {} }, { st2: {} }, { st3: {} }],
      };
      const stages: StagesYml = {
        st1: { workflows: [{ wf1: {} }] },
        st2: { workflows: [{ wf2: {} }, { wf5: {} }] },
        st3: { workflows: [{ wf3: {} }] },
        st4: { workflows: [{ wf4: {} }] },
        st5: { workflows: [{ wf5: {} }] },
        st6: { workflows: [{ wf6: {} }] },
      };
      expect(PipelineService.convertToGraphPipeline(pipeline, stages)).toEqual({
        workflows: {
          wf1: {},
          wf2: { depends_on: ['wf1'] },
          wf5: { depends_on: ['wf1'] },
          wf3: { depends_on: ['wf2', 'wf5'] },
        },
      });
    });

    it('copy pipeline properties to the new graph pipeline', () => {
      const stagedPipeline: PipelineYmlObject = {
        title: 'Staged Pipeline',
        stages: [],
        triggers: { push: [] },
      };
      const graphPipeline = PipelineService.convertToGraphPipeline(stagedPipeline, {});
      const expectedPipeline: PipelineYmlObject = {
        title: 'Staged Pipeline',
        workflows: {},
        triggers: { push: [] },
      };
      expect(graphPipeline).toEqual(expectedPipeline);
    });
  });
});
