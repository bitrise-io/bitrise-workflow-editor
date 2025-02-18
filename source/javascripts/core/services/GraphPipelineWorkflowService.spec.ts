import GraphPipelineWorkflowService from './GraphPipelineWorkflowService';

describe('GraphPipelineWorkflowService', () => {
  describe('validateParallel', () => {
    it('should return true when parallel is not provided', () => {
      expect(GraphPipelineWorkflowService.validateParallel()).toBe(true);
    });

    it('should return true when parallel starts with $', () => {
      expect(GraphPipelineWorkflowService.validateParallel('$FOO')).toBe(true);
    });

    it('should return true when parallel is a number', () => {
      expect(GraphPipelineWorkflowService.validateParallel(42)).toBe(true);
    });

    it('should return true when parallel is a string number', () => {
      expect(GraphPipelineWorkflowService.validateParallel('42')).toBe(true);
    });

    it('should return an error message when parallel is not a number or a valid environment variable', () => {
      expect(GraphPipelineWorkflowService.validateParallel('foo')).toBe(
        'Parallel copies should be a number or a valid environment variable.',
      );
    });
  });
});
