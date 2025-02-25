import GraphPipelineWorkflowService from './GraphPipelineWorkflowService';

describe('GraphPipelineWorkflowService', () => {
  describe('validateParallel', () => {
    it('should return true when parallel is not provided', () => {
      expect(GraphPipelineWorkflowService.validateParallel()).toBe(true);
    });

    it('should return true when parallel starts with $', () => {
      expect(GraphPipelineWorkflowService.validateParallel('$FOO')).toBe(true);
      expect(GraphPipelineWorkflowService.validateParallel('$A123')).toBe(true);
    });

    it('should return true when parallel is a positive integer', () => {
      expect(GraphPipelineWorkflowService.validateParallel(42)).toBe(true);
      expect(GraphPipelineWorkflowService.validateParallel('42')).toBe(true);
      expect(GraphPipelineWorkflowService.validateParallel(1)).toBe(true);
    });

    it('should return error message for invalid values', () => {
      const expectedError = 'Parallel copies should be a positive integer or a valid environment variable.';
      expect(GraphPipelineWorkflowService.validateParallel('foo')).toBe(expectedError);
      expect(GraphPipelineWorkflowService.validateParallel(-1)).toBe(expectedError);
      expect(GraphPipelineWorkflowService.validateParallel(0)).toBe(expectedError);
      expect(GraphPipelineWorkflowService.validateParallel('0')).toBe(expectedError);
      expect(GraphPipelineWorkflowService.validateParallel(1.5)).toBe(expectedError);
      expect(GraphPipelineWorkflowService.validateParallel('1.5')).toBe(expectedError);
    });

    describe('collision detection when parallel is positive integer', () => {
      it('should return true when collision not detected', () => {
        expect(GraphPipelineWorkflowService.validateParallel(3, 'foo', ['bar'])).toBe(true);
      });

      it('should return error message when collision detected', () => {
        expect(GraphPipelineWorkflowService.validateParallel(3, 'foo', ['bar', 'foo', 'foo_1', 'foo_2'])).toBe(
          'Cannot create 3 parallel Workflows because the following IDs already exist: foo_1, foo_2.',
        );
      });
    });

    describe('collision detection when parallel is environment variable', () => {
      it('should return true when collision not detected', () => {
        expect(GraphPipelineWorkflowService.validateParallel('$ENV', 'foo', ['bar'])).toBe(true);
      });

      it('should return error message when possible collision detected', () => {
        expect(GraphPipelineWorkflowService.validateParallel('$ENV', 'foo', ['bar', 'foo', 'foo_1', 'foo_2'])).toBe(
          'The environment variable $ENV might create Workflow IDs that conflict with existing Workflows: foo_1, foo_2.',
        );
      });
    });
  });

  describe('isIntegerValue', () => {
    it('should return true for valid integers', () => {
      expect(GraphPipelineWorkflowService.isIntegerValue(42)).toBe(true);
      expect(GraphPipelineWorkflowService.isIntegerValue('42')).toBe(true);
      expect(GraphPipelineWorkflowService.isIntegerValue(0)).toBe(true);
      expect(GraphPipelineWorkflowService.isIntegerValue('0')).toBe(true);
      expect(GraphPipelineWorkflowService.isIntegerValue(-1)).toBe(true);
    });

    it('should return false for non-integers', () => {
      expect(GraphPipelineWorkflowService.isIntegerValue('foo')).toBe(false);
      expect(GraphPipelineWorkflowService.isIntegerValue(undefined)).toBe(false);
      expect(GraphPipelineWorkflowService.isIntegerValue(1.5)).toBe(false);
      expect(GraphPipelineWorkflowService.isIntegerValue('1.5')).toBe(false);
      expect(GraphPipelineWorkflowService.isIntegerValue('$FOO')).toBe(false);
    });
  });

  describe('asIntegerIfPossible', () => {
    it('should convert valid numbers to integers', () => {
      expect(GraphPipelineWorkflowService.asIntegerIfPossible('42')).toBe(42);
      expect(GraphPipelineWorkflowService.asIntegerIfPossible(42)).toBe(42);
      expect(GraphPipelineWorkflowService.asIntegerIfPossible('0')).toBe(0);
      expect(GraphPipelineWorkflowService.asIntegerIfPossible(0)).toBe(0);
      expect(GraphPipelineWorkflowService.asIntegerIfPossible('-1')).toBe(-1);
    });

    it('should return original value for non-integers', () => {
      expect(GraphPipelineWorkflowService.asIntegerIfPossible('foo')).toBe('foo');
      expect(GraphPipelineWorkflowService.asIntegerIfPossible('$FOO')).toBe('$FOO');
      expect(GraphPipelineWorkflowService.asIntegerIfPossible('1.5')).toBe('1.5');
      expect(GraphPipelineWorkflowService.asIntegerIfPossible(undefined)).toBeUndefined();
    });
  });
});
