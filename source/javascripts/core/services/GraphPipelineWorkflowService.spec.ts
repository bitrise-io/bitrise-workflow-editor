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
        'Parallel copies should be a positive number or a valid environment variable.',
      );
    });

    it('should return an error message when parallel is a negative number', () => {
      expect(GraphPipelineWorkflowService.validateParallel(-1)).toBe(
        'Parallel copies should be a positive number or a valid environment variable.',
      );
    });

    it('should return an error message when parallel is zero', () => {
      expect(GraphPipelineWorkflowService.validateParallel(0)).toBe(
        'Parallel copies should be a positive number or a valid environment variable.',
      );
    });
  });

  describe('isNumericParallel', () => {
    it('should return true for a numeric string', () => {
      expect(GraphPipelineWorkflowService.isNumericParallel('42')).toBe(true);
    });

    it('should return true for a number', () => {
      expect(GraphPipelineWorkflowService.isNumericParallel(42)).toBe(true);
    });

    it('should return false for a non-numeric string', () => {
      expect(GraphPipelineWorkflowService.isNumericParallel('foo')).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(GraphPipelineWorkflowService.isNumericParallel()).toBe(false);
    });
  });

  describe('castParallel', () => {
    it('should return a number when parallel is a numeric string', () => {
      expect(GraphPipelineWorkflowService.castParallel('42')).toBe(42);
    });

    it('should return a number when parallel is a number', () => {
      expect(GraphPipelineWorkflowService.castParallel(42)).toBe(42);
    });

    it('should return the original value when parallel is a non-numeric string', () => {
      expect(GraphPipelineWorkflowService.castParallel('foo')).toBe('foo');
    });

    it('should return the original value when parallel is an environment variable', () => {
      expect(GraphPipelineWorkflowService.castParallel('$FOO')).toBe('$FOO');
    });

    it('should return 0 when parallel is the string "0"', () => {
      expect(GraphPipelineWorkflowService.castParallel('0')).toBe(0);
    });

    it('should return 0 when parallel is the number 0', () => {
      expect(GraphPipelineWorkflowService.castParallel(0)).toBe(0);
    });

    it('should return undefined when parallel is undefined', () => {
      expect(GraphPipelineWorkflowService.castParallel()).toBeUndefined();
    });
  });
});
