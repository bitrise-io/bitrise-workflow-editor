import { PipelineYmlObject } from './Pipeline';
import PipelineService from './PipelineService';

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
      expect(PipelineService.convertToGraphPipeline(pipeline)).toBe(pipeline);
    });

    it('returns an empty pipeline if the input is a staged pipeline', () => {
      const pipeline: PipelineYmlObject = { stages: [] };
      expect(PipelineService.convertToGraphPipeline(pipeline)).toBe(PipelineService.EMPTY_PIPELINE);
    });
  });
});
