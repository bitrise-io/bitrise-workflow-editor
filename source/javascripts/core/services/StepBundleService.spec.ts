import StepBundleService from '@/core/services/StepBundleService';

describe('validateName', () => {
  describe('when the initial name is empty', () => {
    it('returns true if the step bundle name is valid and unique', () => {
      expect(StepBundleService.validateName('sb4', '', ['sb1', 'sb2', 'sb3'])).toBe(true);
    });

    it('returns an error message if the step bundle name is empty', () => {
      expect(StepBundleService.validateName('', '', ['sb1', 'sb2', 'sb3'])).toBe('Step bundle name is required');
    });

    it('returns an error message if the step bundle name contains only whitespaces', () => {
      expect(StepBundleService.validateName('   ', '', ['sb1', 'sb2', 'sb3'])).toBe('Step bundle name is required');
    });

    it('returns an error message if the step bundle name contains invalid characters', () => {
      expect(StepBundleService.validateName('invalid!', '', ['sb1', 'sb2', 'sb3'])).toBe(
        'Step bundle name must only contain letters, numbers, dashes, underscores or periods',
      );
    });

    it('returns an error message if the step bundle name is not unique', () => {
      expect(StepBundleService.validateName('sb1', '', ['sb1', 'sb2', 'sb3'])).toBe(
        'Step bundle name should be unique',
      );
    });
  });

  describe('when the initial name is not empty', () => {
    it('returns true if the step bundle name is valid and unique', () => {
      expect(StepBundleService.validateName('sb4', 'sb1', ['sb1', 'sb2', 'sb3'])).toBe(true);
    });

    it('returns an error message if the step bundle name is empty', () => {
      expect(StepBundleService.validateName('', 'sb1', ['sb1', 'sb2', 'sb3'])).toBe('Step bundle name is required');
    });

    it('returns an error message if the step bundle name contains only whitespaces', () => {
      expect(StepBundleService.validateName('   ', 'sb1', ['sb1', 'sb2', 'sb3'])).toBe('Step bundle name is required');
    });

    it('returns an error message if the step bundle name contains invalid characters', () => {
      expect(StepBundleService.validateName('invalid!', 'sb1', ['sb1', 'sb2', 'sb3'])).toBe(
        'Step bundle name must only contain letters, numbers, dashes, underscores or periods',
      );
    });

    it('returns an error message if the step bundle name is not unique', () => {
      expect(StepBundleService.validateName('sb2', 'sb1', ['sb1', 'sb2', 'sb3'])).toBe(
        'Step bundle name should be unique',
      );
    });
  });
});
