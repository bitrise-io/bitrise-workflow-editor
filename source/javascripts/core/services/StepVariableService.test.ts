import { EnvironmentItemModel, EnvModel } from '../models/BitriseYml';
import StepVariableService from './StepVariableService';

describe('StepVariableService', () => {
  describe('group', () => {
    it('should return empty object if inputs is undefined', () => {
      expect(StepVariableService.group(undefined)).toEqual({});
    });

    it('should group inputs by category', () => {
      const inputs: EnvModel = [
        { VARIABLE_1: 'value1', opts: { category: 'category1' } },
        { VARIABLE_2: 'value2', opts: { category: 'category1' } },
        { VARIABLE_3: 'value3', opts: { category: 'category2' } },
      ];

      const result = StepVariableService.group(inputs);
      expect(result).toEqual({
        category1: [
          { VARIABLE_1: 'value1', opts: { category: 'category1' } },
          { VARIABLE_2: 'value2', opts: { category: 'category1' } },
        ],
        category2: [{ VARIABLE_3: 'value3', opts: { category: 'category2' } }],
      });
    });

    it('should use empty string as default category for inputs without a category', () => {
      const inputs: EnvModel = [
        { VARIABLE_1: 'value1', opts: { category: 'category1' } },
        { VARIABLE_2: 'value2', opts: {} },
        { VARIABLE_3: 'value3' },
      ];

      const result = StepVariableService.group(inputs);
      expect(result).toEqual({
        category1: [{ VARIABLE_1: 'value1', opts: { category: 'category1' } }],
        '': [{ VARIABLE_2: 'value2', opts: {} }, { VARIABLE_3: 'value3' }],
      });
    });
  });

  describe('getName', () => {
    it('should get the name of an input', () => {
      const input: EnvironmentItemModel = { VARIABLE_NAME: 'value', opts: { description: 'Some description' } };
      expect(StepVariableService.getName(input)).toBe('VARIABLE_NAME');
    });
  });

  describe('getValue', () => {
    it('should get the value of an input as string', () => {
      const input: EnvironmentItemModel = { VARIABLE_NAME: 'value', opts: {} };
      expect(StepVariableService.getValue(input)).toBe('value');
    });

    it('should convert non-string values to string', () => {
      const input: EnvironmentItemModel = { VARIABLE_NAME: 123, opts: {} };
      expect(StepVariableService.getValue(input)).toBe('123');
    });

    it('should return empty string if value is undefined', () => {
      const input: EnvironmentItemModel = { VARIABLE_NAME: undefined, opts: {} };
      expect(StepVariableService.getValue(input)).toBe('');
    });
  });

  describe('findInput', () => {
    it('should find an input by name', () => {
      const inputs: EnvModel = [
        { VARIABLE_1: 'value1', opts: {} },
        { VARIABLE_2: 'value2', opts: {} },
      ];

      const result = StepVariableService.findInput(inputs, 'VARIABLE_2');
      expect(result).toEqual({ VARIABLE_2: 'value2', opts: {} });
    });

    it('should return undefined if input is not found', () => {
      const inputs: EnvModel = [
        { VARIABLE_1: 'value1', opts: {} },
        { VARIABLE_2: 'value2', opts: {} },
      ];

      const result = StepVariableService.findInput(inputs, 'VARIABLE_3');
      expect(result).toBeUndefined();
    });
  });
});
