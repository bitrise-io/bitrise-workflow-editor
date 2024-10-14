import { StepApiResult } from '@/core/api/StepApi';
import StepService from './StepService';
import { Step } from './Step';

jest.mock('@/../images/step/icon-default.svg', () => 'default-icon');

const STEPLIB_STEP = 'https://github.com/bitrise-io/bitrise-steplib.git::script@1.2.3';
const CUSTOM_STEP = 'https://github.com/foo/bar.git::bazz@next';
const GIT_STEP = 'git::https://github.com/bitrise-steplib/steps-script@master';
const LOCAL_STEP = 'path::/path/to/my/local-step';
const STEP_BUNDLE = 'bundle::my-bundle';
const WITH_GROUP = 'with';

describe('StepService', () => {
  describe('parseStepCVS', () => {
    describe('Simple step', () => {
      it('with version', () => {
        expect(StepService.parseStepCVS('script@1.2.3')).toEqual({
          library: 'https://github.com/bitrise-io/bitrise-steplib.git',
          id: 'script',
          version: '1.2.3',
        });
      });

      it('without version', () => {
        expect(StepService.parseStepCVS('script')).toEqual({
          library: 'https://github.com/bitrise-io/bitrise-steplib.git',
          id: 'script',
          version: '',
        });
      });
    });

    describe('Default steplib step', () => {
      it('with version', () => {
        expect(StepService.parseStepCVS(STEPLIB_STEP)).toEqual({
          library: 'https://github.com/bitrise-io/bitrise-steplib.git',
          id: 'script',
          version: '1.2.3',
        });
      });

      it('without version', () => {
        expect(StepService.parseStepCVS(STEPLIB_STEP.split('@')[0])).toEqual({
          library: 'https://github.com/bitrise-io/bitrise-steplib.git',
          id: 'script',
          version: '',
        });
      });
    });

    describe('Custom steplib step', () => {
      it('with version', () => {
        expect(StepService.parseStepCVS(CUSTOM_STEP)).toEqual({
          library: 'https://github.com/foo/bar.git',
          id: 'bazz',
          version: 'next',
        });
      });

      it('without version', () => {
        expect(StepService.parseStepCVS(CUSTOM_STEP.split('@')[0])).toEqual({
          library: 'https://github.com/foo/bar.git',
          id: 'bazz',
          version: '',
        });
      });
    });

    describe('Git step (git::)', () => {
      it('with version', () => {
        expect(StepService.parseStepCVS(GIT_STEP)).toEqual({
          library: 'git',
          id: 'https://github.com/bitrise-steplib/steps-script',
          version: 'master',
        });
      });

      it('without version', () => {
        expect(StepService.parseStepCVS(GIT_STEP.split('@')[0])).toEqual({
          library: 'git',
          id: 'https://github.com/bitrise-steplib/steps-script',
          version: '',
        });
      });
    });

    describe('Local step (path::)', () => {
      it('without version', () => {
        expect(StepService.parseStepCVS(LOCAL_STEP)).toEqual({
          library: 'path',
          id: '/path/to/my/local-step',
          version: '',
        });
      });
    });

    describe('Step bundle (bundle::)', () => {
      it('without version', () => {
        expect(StepService.parseStepCVS(STEP_BUNDLE)).toEqual({
          library: 'bundle',
          id: 'my-bundle',
          version: '',
        });
      });
    });

    describe('With group (with)', () => {
      it('without version', () => {
        expect(StepService.parseStepCVS(WITH_GROUP)).toEqual({
          library: 'bundle',
          id: 'with',
          version: '',
        });
      });
    });
  });

  describe('createStepCVS', () => {
    it("should append version, if version wasn't present", () => {
      expect(StepService.createStepCVS('script', '2.0.0')).toBe('script@2.0.0');
    });

    it('should override existing version', () => {
      expect(StepService.createStepCVS('script@1.2.3', '2.0.0')).toBe('script@2.0.0');
    });

    it('should remove version if empty string is provided', () => {
      expect(StepService.createStepCVS('script@1.2.3', '')).toBe('script');
    });

    it('should work with default steplib step', () => {
      expect(StepService.createStepCVS(STEPLIB_STEP, '2.0.0')).toBe(
        'https://github.com/bitrise-io/bitrise-steplib.git::script@2.0.0',
      );
    });

    it('should work with custom steplib step', () => {
      expect(StepService.createStepCVS(CUSTOM_STEP, '2.0.0')).toBe('https://github.com/foo/bar.git::bazz@2.0.0');
    });

    it('should work with git step (git::)', () => {
      expect(StepService.createStepCVS(GIT_STEP, '2.0.0')).toBe(
        'git::https://github.com/bitrise-steplib/steps-script@2.0.0',
      );
    });

    it('should not update local step (path::)', () => {
      expect(StepService.createStepCVS(LOCAL_STEP, '2.0.0')).toBe('path::/path/to/my/local-step');
    });

    it('should not update step (bundle::)', () => {
      expect(StepService.createStepCVS(STEP_BUNDLE, '2.0.0')).toBe('bundle::my-bundle');
    });

    it('should not update with group (with)', () => {
      expect(StepService.createStepCVS(WITH_GROUP, '2.0.0')).toBe('with');
    });
  });

  describe('isStep', () => {
    describe('returns true', () => {
      it('should return true for step id', () => {
        expect(StepService.isStep('script')).toBe(true);
      });

      it('should return true for a default steplib step', () => {
        expect(StepService.isStep(STEPLIB_STEP)).toBe(true);
      });

      it('should return true for a custom steplib step', () => {
        expect(StepService.isStep(CUSTOM_STEP)).toBe(true);
      });

      it('should return true for a git step (git::)', () => {
        expect(StepService.isStep(GIT_STEP)).toBe(true);
      });

      it('should return true for local step (path::)', () => {
        expect(StepService.isStep(LOCAL_STEP)).toBe(true);
      });
    });

    describe('returns false', () => {
      it('should return false for step bundle', () => {
        expect(StepService.isStep(STEP_BUNDLE)).toBe(false);
      });

      it('should return false for with group', () => {
        expect(StepService.isStep(WITH_GROUP)).toBe(false);
      });
    });
  });

  describe('isStepLibStep', () => {
    describe('returns true', () => {
      it('should return true for step id only', () => {
        expect(StepService.isStepLibStep('script')).toBe(true);
      });

      it('should return true for default steplib step', () => {
        expect(StepService.isStepLibStep(STEPLIB_STEP)).toBe(true);
      });

      it('should return true for custom steplib step', () => {
        expect(StepService.isStepLibStep(CUSTOM_STEP)).toBe(true);
      });
    });

    describe('returns false', () => {
      it('should return false for git step (git::)', () => {
        expect(StepService.isStepLibStep(GIT_STEP)).toBe(false);
      });

      it('should return false for local step (path::)', () => {
        expect(StepService.isStepLibStep(LOCAL_STEP)).toBe(false);
      });

      it('should return false for step bundle (bundle::)', () => {
        expect(StepService.isStepLibStep(STEP_BUNDLE)).toBe(false);
      });

      it('should return false for with group (with)', () => {
        expect(StepService.isStepLibStep(WITH_GROUP)).toBe(false);
      });
    });
  });

  describe('isGitStep', () => {
    it('should return true for git step (git::)', () => {
      expect(StepService.isGitStep(GIT_STEP)).toBe(true);
    });

    describe('returns false', () => {
      it('should return false for step id only', () => {
        expect(StepService.isGitStep('script')).toBe(false);
      });

      it('should return false for default steplib step', () => {
        expect(StepService.isGitStep(STEPLIB_STEP)).toBe(false);
      });

      it('should return false for custom steplib step', () => {
        expect(StepService.isGitStep(CUSTOM_STEP)).toBe(false);
      });

      it('should return false for local step (path::)', () => {
        expect(StepService.isGitStep(LOCAL_STEP)).toBe(false);
      });

      it('should return false for step bundle (bundle::)', () => {
        expect(StepService.isGitStep(STEP_BUNDLE)).toBe(false);
      });

      it('should return false for with group (with)', () => {
        expect(StepService.isGitStep(WITH_GROUP)).toBe(false);
      });
    });
  });

  describe('isLocalStep', () => {
    it('should return true for local step (path::)', () => {
      expect(StepService.isLocalStep(LOCAL_STEP)).toBe(true);
    });

    describe('returns false', () => {
      it('should return false for step id only', () => {
        expect(StepService.isLocalStep('script')).toBe(false);
      });

      it('should return false for default steplib step', () => {
        expect(StepService.isLocalStep(STEPLIB_STEP)).toBe(false);
      });

      it('should return false for custom steplib step', () => {
        expect(StepService.isLocalStep(CUSTOM_STEP)).toBe(false);
      });

      it('should return false for git step (git::)', () => {
        expect(StepService.isLocalStep(GIT_STEP)).toBe(false);
      });

      it('should return false for step bundle (bundle::)', () => {
        expect(StepService.isLocalStep(STEP_BUNDLE)).toBe(false);
      });

      it('should return false for with group (with)', () => {
        expect(StepService.isLocalStep(WITH_GROUP)).toBe(false);
      });
    });
  });

  describe('isStepBundle', () => {
    it('should return true for step bundle', () => {
      expect(StepService.isStepBundle(STEP_BUNDLE)).toBe(true);
    });

    describe('returns false', () => {
      it('should return false for step id only', () => {
        expect(StepService.isStepBundle('script')).toBe(false);
      });

      it('should return false for default steplib step', () => {
        expect(StepService.isStepBundle(STEPLIB_STEP)).toBe(false);
      });

      it('should return false for custom steplib step', () => {
        expect(StepService.isStepBundle(CUSTOM_STEP)).toBe(false);
      });

      it('should return false for git step (git::)', () => {
        expect(StepService.isStepBundle(GIT_STEP)).toBe(false);
      });

      it('should return false for local step (path::)', () => {
        expect(StepService.isStepBundle(LOCAL_STEP)).toBe(false);
      });

      it('should return false for with group (with)', () => {
        expect(StepService.isStepBundle(WITH_GROUP)).toBe(false);
      });
    });
  });

  describe('isWithGroup', () => {
    it('should return true for with group (with)', () => {
      expect(StepService.isWithGroup(WITH_GROUP)).toBe(true);
    });

    describe('returns false', () => {
      it('should return false for step id only', () => {
        expect(StepService.isWithGroup('script')).toBe(false);
      });

      it('should return false for default steplib step', () => {
        expect(StepService.isWithGroup(STEPLIB_STEP)).toBe(false);
      });

      it('should return false for custom steplib step', () => {
        expect(StepService.isWithGroup(CUSTOM_STEP)).toBe(false);
      });

      it('should return false for git step (git::)', () => {
        expect(StepService.isWithGroup(GIT_STEP)).toBe(false);
      });

      it('should return false for local step (path::)', () => {
        expect(StepService.isWithGroup(LOCAL_STEP)).toBe(false);
      });

      it('should return false for step bundle (bundle::)', () => {
        expect(StepService.isWithGroup(STEP_BUNDLE)).toBe(false);
      });
    });
  });

  describe('resolveTitle', () => {
    it('should return step bundle title for step bundle (bundle::)', () => {
      expect(StepService.resolveTitle(STEP_BUNDLE)).toBe('Step bundle: my-bundle');
    });

    it('should return "With group" for with group (with)', () => {
      expect(StepService.resolveTitle(WITH_GROUP)).toBe('With group');
    });

    describe('simple step', () => {
      it('should return the step title', () => {
        expect(StepService.resolveTitle('script', { title: 'My script' })).toBe('My script');
      });

      it('should return the step id, if title is not defined', () => {
        expect(StepService.resolveTitle('script')).toBe('script');
      });
    });

    describe('default steplib step', () => {
      it('should return the step title', () => {
        expect(StepService.resolveTitle(STEPLIB_STEP, { title: 'My script' })).toBe('My script');
      });

      it('should return the step id, if title is not defined', () => {
        expect(StepService.resolveTitle(STEPLIB_STEP)).toBe('script');
      });
    });

    describe('custom steplib step', () => {
      it('should return the step title', () => {
        expect(StepService.resolveTitle(CUSTOM_STEP, { title: 'My script' })).toBe('My script');
      });

      it('should return the step id, if title is not defined', () => {
        expect(StepService.resolveTitle(CUSTOM_STEP)).toBe('bazz');
      });
    });

    describe('git step (git::)', () => {
      it('should return the step title', () => {
        expect(StepService.resolveTitle(GIT_STEP, { title: 'My script' })).toBe('My script');
      });

      it('should return the step id, if title is not defined', () => {
        expect(StepService.resolveTitle(GIT_STEP)).toBe('steps-script');
      });
    });

    describe('local step (path::)', () => {
      it('should return the step title', () => {
        expect(StepService.resolveTitle(LOCAL_STEP, { title: 'My script' })).toBe('My script');
      });

      it('should return the step id, if title is not defined', () => {
        expect(StepService.resolveTitle(LOCAL_STEP)).toBe('local-step');
      });
    });
  });

  describe('resolveIcon', () => {
    it('should return step icon.svg if available', () => {
      const step = { asset_urls: { 'icon.svg': 'step-icon.svg' } };
      expect(StepService.resolveIcon('script', step)).toBe('step-icon.svg');
    });

    it('should return step icon.png if icon.svg is not available', () => {
      const step = { asset_urls: { 'icon.png': 'step-icon.png' } };
      expect(StepService.resolveIcon('script', step)).toBe('step-icon.png');
    });

    it('should return info icon.svg if step icon is not available', () => {
      const info = { asset_urls: { 'icon.svg': 'info-icon.svg' } };
      expect(StepService.resolveIcon('script', undefined, info)).toBe('info-icon.svg');
    });

    it('should return info icon.png if step and info icon.svg are not available', () => {
      const info = { asset_urls: { 'icon.png': 'info-icon.png' } };
      expect(StepService.resolveIcon('script', undefined, info)).toBe('info-icon.png');
    });

    it('should return default icon if no icons are available', () => {
      expect(StepService.resolveIcon('script')).toBe('default-icon');
    });
  });

  describe('getSelectableVersions', () => {
    it('should return sorted and labeled versions', () => {
      const step = {
        cvs: 'script@1',
        resolvedInfo: {
          version: '1',
          normalizedVersion: '1.x.x',
          versions: ['1.0.0', '1.1.0', '2.0.0', '2.2.2'],
        },
      } as Step;
      expect(StepService.getSelectableVersions(step)).toStrictEqual([
        { value: '', label: 'Always latest' },
        { value: '2.2.x', label: '2.2.x - Patch updates only' },
        { value: '2.0.x', label: '2.0.x - Patch updates only' },
        { value: '2.x.x', label: '2.x.x - Minor and patch updates' },
        { value: '1.1.x', label: '1.1.x - Patch updates only' },
        { value: '1.0.x', label: '1.0.x - Patch updates only' },
        { value: '1.x.x', label: '1.x.x - Minor and patch updates' },
      ]);
    });

    it('should return the exact step version', () => {
      const step = {
        cvs: 'script@1',
        resolvedInfo: {
          version: '1.1.0',
          normalizedVersion: '1.1.0',
          versions: ['1.0.0', '1.1.0', '2.0.0', '2.2.2'],
        },
      } as Step;
      expect(StepService.getSelectableVersions(step)).toStrictEqual([
        { value: '', label: 'Always latest' },
        { value: '1.1.0', label: '1.1.0 - Version in bitrise.yml' },
        { value: '2.2.x', label: '2.2.x - Patch updates only' },
        { value: '2.0.x', label: '2.0.x - Patch updates only' },
        { value: '2.x.x', label: '2.x.x - Minor and patch updates' },
        { value: '1.1.x', label: '1.1.x - Patch updates only' },
        { value: '1.0.x', label: '1.0.x - Patch updates only' },
        { value: '1.x.x', label: '1.x.x - Minor and patch updates' },
      ]);
    });

    it('should return "Always latest" if no versions are available', () => {
      const step = {
        cvs: 'script',
        resolvedInfo: {
          version: '',
          normalizedVersion: '',
          versions: [] as string[],
        },
      } as Step;
      expect(StepService.getSelectableVersions(step)).toEqual([{ value: '', label: 'Always latest' }]);
    });
  });

  describe('getStepCategories', () => {
    it('should return unique and sorted categories', () => {
      const steps = [
        { defaultValues: { type_tags: ['build', 'test'] } },
        { defaultValues: { type_tags: ['deploy', 'build'] } },
      ] as Step[];
      expect(StepService.getStepCategories(steps)).toEqual(['build', 'deploy', 'test']);
    });

    it('should return an empty array if no steps are given', () => {
      expect(StepService.getStepCategories([])).toEqual([]);
    });

    it('should return an empty array if no categories are available', () => {
      expect(StepService.getStepCategories([])).toEqual([]);
    });
  });

  describe('getInputNames', () => {
    it('should return an empty array if step has no inputs', () => {
      const step = { defaultValues: {} } as StepApiResult;
      const result = StepService.getInputNames(step);
      expect(result).toEqual([]);
    });

    it('should return input names excluding "opts"', () => {
      const step = {
        defaultValues: {
          inputs: [{ input1: 'value1', opts: {} }, { input2: 'value2' }, { opts: {} }, { input3: 'value3' }],
        },
      } as StepApiResult;
      const result = StepService.getInputNames(step);
      expect(result).toEqual(['input1', 'input2', 'input3']);
    });
  });

  describe('calculateChange', () => {
    it('returns changes if major versions change', () => {
      const oldStep = {
        cvs: 'script@1',
        resolvedInfo: { resolvedVersion: '1.0.0' },
        defaultValues: { inputs: [{ input1: 'value1' }, { input2: 'value2' }] },
      } as unknown as StepApiResult;
      const newStep = {
        cvs: 'script@1',
        resolvedInfo: { resolvedVersion: '2.0.0' },
        defaultValues: { inputs: [{ input2: 'value2' }, { input3: 'value3' }] },
      } as unknown as StepApiResult;
      expect(StepService.calculateChange(oldStep, newStep)).toEqual({
        removedInputs: ['input1'],
        newInputs: ['input3'],
        change: 'major',
      });
    });

    it('returns changes if the inputs changed', () => {
      const oldStep = {
        cvs: 'script@1',
        resolvedInfo: { resolvedVersion: '1.0.0' },
        defaultValues: { inputs: [{ input1: 'value1' }, { input2: 'value2' }] },
      } as unknown as StepApiResult;
      const newStep = {
        cvs: 'script@1',
        resolvedInfo: { resolvedVersion: '1.2.0' },
        defaultValues: {
          inputs: [{ input1: 'value1' }, { input2: 'value2' }, { input3: 'value3' }],
        },
      } as unknown as StepApiResult;
      expect(StepService.calculateChange(oldStep, newStep)).toEqual({
        removedInputs: [],
        newInputs: ['input3'],
        change: 'inputs',
      });
    });

    it('returns no changes if oldStep or newStep is missing', () => {
      expect(StepService.calculateChange(undefined, {} as StepApiResult)).toEqual({
        removedInputs: [],
        newInputs: [],
        change: 'none',
      });
      expect(StepService.calculateChange({} as StepApiResult, undefined)).toEqual({
        removedInputs: [],
        newInputs: [],
        change: 'none',
      });
    });

    it('returns no changes if step IDs are different', () => {
      const oldStep = { cvs: 'script@1' } as StepApiResult;
      const newStep = { cvs: 'other-script@1' } as StepApiResult;
      expect(StepService.calculateChange(oldStep, newStep)).toEqual({
        removedInputs: [],
        newInputs: [],
        change: 'step-id',
      });
    });

    it('returns no changes if versions are the same', () => {
      const oldStep = {
        cvs: 'script@1',
        resolvedInfo: { resolvedVersion: '1.0.0' },
      } as StepApiResult;
      const newStep = {
        cvs: 'script@1',
        resolvedInfo: { resolvedVersion: '1.0.0' },
      } as StepApiResult;
      expect(StepService.calculateChange(oldStep, newStep)).toEqual({
        removedInputs: [],
        newInputs: [],
        change: 'none',
      });
    });

    it('returns no changes if the inputs are the same', () => {
      const oldStep = {
        cvs: 'script@1',
        resolvedInfo: { resolvedVersion: '1.0.0' },
        defaultValues: { inputs: [{ input1: 'value1' }, { input2: 'value2' }] },
      } as unknown as StepApiResult;
      const newStep = {
        cvs: 'script@1',
        resolvedInfo: { resolvedVersion: '1.2.0' },
        defaultValues: { inputs: [{ input1: 'value1' }, { input2: 'value2' }] },
      } as unknown as StepApiResult;
      expect(StepService.calculateChange(oldStep, newStep)).toEqual({
        removedInputs: [],
        newInputs: [],
        change: 'none',
      });
    });

    it('returns no changes if the versions are not semver version', () => {
      const oldStep = {
        cvs: 'script@1',
        resolvedInfo: { resolvedVersion: 'master' },
      } as StepApiResult;
      const newStep = {
        cvs: 'script@1',
        resolvedInfo: { resolvedVersion: 'master' },
      } as StepApiResult;
      expect(StepService.calculateChange(oldStep, newStep)).toEqual({
        removedInputs: [],
        newInputs: [],
        change: 'none',
      });
    });
  });

  describe('toYmlInput', () => {
    it('should return undefined if the new value is empty', () => {
      const result = StepService.toYmlInput('is_debug', '', false);
      expect(result).toBeUndefined();
    });

    it('should return undefined if the new value is the same as the default value', () => {
      let result = StepService.toYmlInput('is_debug', true, true);
      expect(result).toBeUndefined();

      result = StepService.toYmlInput('is_debug', 1, 1);
      expect(result).toBeUndefined();

      result = StepService.toYmlInput('is_debug', 'yes', 'yes');
      expect(result).toBeUndefined();
    });

    it('should return a boolean input if the new value is a boolean string', () => {
      let result = StepService.toYmlInput('is_debug', 'true', false);
      expect(result).toEqual({ is_debug: true });

      result = StepService.toYmlInput('is_debug', 'false', false);
      expect(result).toEqual({ is_debug: false });
    });

    it('should return a number input if the new value is a numeric string', () => {
      let result = StepService.toYmlInput('timeout', '0', 10);
      expect(result).toEqual({ timeout: 0 });

      result = StepService.toYmlInput('timeout', '1', 10);
      expect(result).toEqual({ timeout: 1 });

      result = StepService.toYmlInput('timeout', '30', 10);
      expect(result).toEqual({ timeout: 30 });
    });

    it('should return a string input if the new value is a non-numeric, non-boolean string', () => {
      const result = StepService.toYmlInput('name', 'new_name', 'old_name');
      expect(result).toEqual({ name: 'new_name' });
    });

    it('should include opts if provided and not empty', () => {
      const opts = { is_required: true };
      const result = StepService.toYmlInput('name', 'new_name', 'old_name', opts);
      expect(result).toEqual({ name: 'new_name', opts });
    });

    it('should not include opts if provided and empty', () => {
      const opts = {};
      const result = StepService.toYmlInput('name', 'new_name', 'old_name', opts);
      expect(result).toEqual({ name: 'new_name' });
    });
  });
});
