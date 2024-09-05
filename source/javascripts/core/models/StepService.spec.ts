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
      expect(StepService.resolveIcon(step)).toBe('step-icon.svg');
    });

    it('should return step icon.png if icon.svg is not available', () => {
      const step = { asset_urls: { 'icon.png': 'step-icon.png' } };
      expect(StepService.resolveIcon(step)).toBe('step-icon.png');
    });

    it('should return info icon.svg if step icon is not available', () => {
      const info = { asset_urls: { 'icon.svg': 'info-icon.svg' } };
      expect(StepService.resolveIcon(undefined, info)).toBe('info-icon.svg');
    });

    it('should return info icon.png if step and info icon.svg are not available', () => {
      const info = { asset_urls: { 'icon.png': 'info-icon.png' } };
      expect(StepService.resolveIcon(undefined, info)).toBe('info-icon.png');
    });

    it('should return default icon if no icons are available', () => {
      expect(StepService.resolveIcon()).toBe('default-icon');
    });
  });

  describe('getSelectableVersions', () => {
    it('should return sorted and labeled versions', () => {
      const step = {
        cvs: 'script@1',
        resolvedInfo: {
          cvs: 'script@1',
          id: 'script',
          version: '1',
          icon: '',
          normalizedVersion: '1.x.x',
          versions: ['1.0.0', '1.1.0', '2.0.0', '2.2.2'],
        },
      };
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

    it('should return "Always latest" if no versions are available', () => {
      const step = {
        cvs: 'script',
        resolvedInfo: {
          cvs: 'script',
          id: 'script',
          version: '',
          icon: '',
          normalizedVersion: '',
          versions: [],
        },
      };
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
});
