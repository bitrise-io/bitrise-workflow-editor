import { StepApiResult } from '@/core/api/StepApi';

import { BITRISE_STEP_LIBRARY_SSH_URL, BITRISE_STEP_LIBRARY_URL, Step } from '../models/Step';
import { getYmlString, updateBitriseYmlDocumentByString } from '../stores/BitriseYmlStore';
import StepService from './StepService';

jest.mock('@/../images/step/icon-default.svg', () => 'default-icon');

const STEPLIB_STEP = 'https://github.com/bitrise-io/bitrise-steplib.git::script@1.2.3';
const STEPLIB_SSH_STEP = 'git@github.com:bitrise-io/bitrise-steplib.git::script@1.2.3';
const CUSTOM_STEPLIB_URL = 'https://custom.step/foo/bar.git';
const CUSTOMLIB_STEP = 'https://custom.step/foo/bar.git::bazz@next';
const CUSTOMLIB_SSH_STEP = 'git@custom.step:foo/bar.git::bazz@next';
const GITHUB_HTTPS_STEP = 'git::https://github.com/bitrise-steplib/steps-script.git@master';
const GITHUB_SSH_STEP = 'git::git@github.com:bitrise-steplib/steps-script.git@master';
const GITLAB_HTTPS_STEP = 'git::https://gitlab.com/steplib/steps-script.git@master';
const GITLAB_SSH_STEP = 'git::git@gitlab.com:steplib/steps-script.git@master';
const BITBUCKET_HTTPS_STEP = 'git::https://bitbucket.org/steplib/steps-script.git@master';
const BITBUCKET_SSH_STEP = 'git::git@bitbucket.org:steplib/steps-script.git@master';
const LOCAL_STEP = 'path::/path/to/my/local-step';
const STEP_BUNDLE = 'bundle::my-bundle';
const WITH_GROUP = 'with';

function expectErrors(callbacks: VoidFunction[], errors: string[]) {
  callbacks.forEach((callback, i) => {
    expect(callback).toThrow(errors[i]);
  });
}

describe('StepService', () => {
  beforeEach(() => {
    updateBitriseYmlDocumentByString(
      yaml`
        workflows:
          primary:
            steps:
            - script@1: {}
            - cache@2:
                inputs: []
        step_bundles:
          my_bundle:
            steps:
            - script@1: {}
            - cache@2: {}
      `,
    );
  });

  describe('parseStepCVS', () => {
    describe('Simple step', () => {
      describe('with Bitrise default library', () => {
        it('with id@version', () => {
          expect(StepService.parseStepCVS('script@1.2.3', BITRISE_STEP_LIBRARY_URL)).toEqual({
            library: 'bitrise',
            url: BITRISE_STEP_LIBRARY_URL,
            id: 'script',
            version: '1.2.3',
          });
        });

        it('with id only', () => {
          expect(StepService.parseStepCVS('script', BITRISE_STEP_LIBRARY_URL)).toEqual({
            library: 'bitrise',
            url: BITRISE_STEP_LIBRARY_URL,
            id: 'script',
            version: '',
          });
        });

        it('with id@', () => {
          expect(StepService.parseStepCVS('script@', BITRISE_STEP_LIBRARY_URL)).toEqual({
            library: 'bitrise',
            url: BITRISE_STEP_LIBRARY_URL,
            id: 'script',
            version: '',
          });
        });

        it('with ::id', () => {
          expect(StepService.parseStepCVS('::script', BITRISE_STEP_LIBRARY_URL)).toEqual({
            library: 'bitrise',
            url: BITRISE_STEP_LIBRARY_URL,
            id: 'script',
            version: '',
          });
        });

        it('with ::id@', () => {
          expect(StepService.parseStepCVS('::script@', BITRISE_STEP_LIBRARY_URL)).toEqual({
            library: 'bitrise',
            url: BITRISE_STEP_LIBRARY_URL,
            id: 'script',
            version: '',
          });
        });
      });

      describe('with a custom default library', () => {
        it('with id@version', () => {
          expect(StepService.parseStepCVS('script@1.2.3', CUSTOM_STEPLIB_URL)).toEqual({
            library: 'custom',
            url: CUSTOM_STEPLIB_URL,
            id: 'script',
            version: '1.2.3',
          });
        });

        it('with id only', () => {
          expect(StepService.parseStepCVS('script', CUSTOM_STEPLIB_URL)).toEqual({
            library: 'custom',
            url: CUSTOM_STEPLIB_URL,
            id: 'script',
            version: '',
          });
        });

        it('with id@', () => {
          expect(StepService.parseStepCVS('script@', CUSTOM_STEPLIB_URL)).toEqual({
            library: 'custom',
            url: CUSTOM_STEPLIB_URL,
            id: 'script',
            version: '',
          });
        });

        it('with ::id', () => {
          expect(StepService.parseStepCVS('::script', CUSTOM_STEPLIB_URL)).toEqual({
            library: 'custom',
            url: CUSTOM_STEPLIB_URL,
            id: 'script',
            version: '',
          });
        });

        it('with ::id@', () => {
          expect(StepService.parseStepCVS('::script@', CUSTOM_STEPLIB_URL)).toEqual({
            library: 'custom',
            url: CUSTOM_STEPLIB_URL,
            id: 'script',
            version: '',
          });
        });
      });
    });

    describe('explicit Bitrise library step', () => {
      describe('HTTPS URL', () => {
        it('with version', () => {
          expect(StepService.parseStepCVS(STEPLIB_STEP, BITRISE_STEP_LIBRARY_URL)).toEqual({
            library: 'bitrise',
            url: BITRISE_STEP_LIBRARY_URL,
            id: 'script',
            version: '1.2.3',
          });
        });

        it('without version', () => {
          expect(StepService.parseStepCVS(STEPLIB_STEP.replace('@1.2.3', ''), BITRISE_STEP_LIBRARY_URL)).toEqual({
            library: 'bitrise',
            url: BITRISE_STEP_LIBRARY_URL,
            id: 'script',
            version: '',
          });
        });
      });

      describe('SSH URL', () => {
        it('with version', () => {
          expect(StepService.parseStepCVS(STEPLIB_SSH_STEP, BITRISE_STEP_LIBRARY_URL)).toEqual({
            library: 'bitrise',
            url: BITRISE_STEP_LIBRARY_SSH_URL,
            id: 'script',
            version: '1.2.3',
          });
        });

        it('without version', () => {
          expect(StepService.parseStepCVS(STEPLIB_SSH_STEP.replace('@1.2.3', ''), BITRISE_STEP_LIBRARY_URL)).toEqual({
            library: 'bitrise',
            url: BITRISE_STEP_LIBRARY_SSH_URL,
            id: 'script',
            version: '',
          });
        });
      });
    });

    describe('explicit custom library step', () => {
      describe('HTTPS URL', () => {
        it('with version', () => {
          expect(StepService.parseStepCVS(CUSTOMLIB_STEP, BITRISE_STEP_LIBRARY_URL)).toEqual({
            library: 'custom',
            url: CUSTOM_STEPLIB_URL,
            id: 'bazz',
            version: 'next',
          });
        });

        it('without version', () => {
          expect(StepService.parseStepCVS(CUSTOMLIB_STEP.replace('@next', ''), BITRISE_STEP_LIBRARY_URL)).toEqual({
            library: 'custom',
            url: CUSTOM_STEPLIB_URL,
            id: 'bazz',
            version: '',
          });
        });
      });

      describe('SSH URL', () => {
        it('with version', () => {
          expect(StepService.parseStepCVS(CUSTOMLIB_SSH_STEP, BITRISE_STEP_LIBRARY_URL)).toEqual({
            library: 'custom',
            url: 'git@custom.step:foo/bar.git',
            id: 'bazz',
            version: 'next',
          });
        });

        it('without version', () => {
          expect(StepService.parseStepCVS(CUSTOMLIB_SSH_STEP.replace('@next', ''), BITRISE_STEP_LIBRARY_URL)).toEqual({
            library: 'custom',
            url: 'git@custom.step:foo/bar.git',
            id: 'bazz',
            version: '',
          });
        });
      });
    });

    describe('Git step (git::)', () => {
      it('with version', () => {
        expect(StepService.parseStepCVS(GITHUB_HTTPS_STEP, BITRISE_STEP_LIBRARY_URL)).toEqual({
          library: 'git',
          url: 'https://github.com/bitrise-steplib/steps-script.git',
          id: 'https://github.com/bitrise-steplib/steps-script.git',
          version: 'master',
        });
      });

      it('without version', () => {
        expect(StepService.parseStepCVS(GITHUB_HTTPS_STEP.split('@')[0], BITRISE_STEP_LIBRARY_URL)).toEqual({
          library: 'git',
          url: 'https://github.com/bitrise-steplib/steps-script.git',
          id: 'https://github.com/bitrise-steplib/steps-script.git',
          version: '',
        });
      });

      it('with ssh URL', () => {
        expect(StepService.parseStepCVS(GITHUB_SSH_STEP, BITRISE_STEP_LIBRARY_URL)).toEqual({
          library: 'git',
          url: 'git@github.com:bitrise-steplib/steps-script.git',
          id: 'git@github.com:bitrise-steplib/steps-script.git',
          version: 'master',
        });
      });
    });

    describe('Local step (path::)', () => {
      it('without version', () => {
        expect(StepService.parseStepCVS(LOCAL_STEP, BITRISE_STEP_LIBRARY_URL)).toEqual({
          library: 'path',
          url: '/path/to/my/local-step',
          id: '/path/to/my/local-step',
          version: '',
        });
      });
    });

    describe('Step bundle (bundle::)', () => {
      it('without version', () => {
        expect(StepService.parseStepCVS(STEP_BUNDLE, BITRISE_STEP_LIBRARY_URL)).toEqual({
          library: 'bundle',
          id: 'my-bundle',
          url: '',
          version: '',
        });
      });
    });

    describe('With group (with)', () => {
      it('without version', () => {
        expect(StepService.parseStepCVS(WITH_GROUP, BITRISE_STEP_LIBRARY_URL)).toEqual({
          library: 'with',
          id: 'with',
          url: '',
          version: '',
        });
      });
    });
  });

  describe('updateVersion', () => {
    it("should append version, if version wasn't present", () => {
      expect(StepService.updateVersion('script', BITRISE_STEP_LIBRARY_URL, '2.0.0')).toBe('script@2.0.0');
    });

    it('should override existing version', () => {
      expect(StepService.updateVersion('script@1.2.3', BITRISE_STEP_LIBRARY_URL, '2.0.0')).toBe('script@2.0.0');
    });

    it('should remove version if empty string is provided', () => {
      expect(StepService.updateVersion('script@1.2.3', BITRISE_STEP_LIBRARY_URL, '')).toBe('script');
    });

    it('should work with default steplib step', () => {
      expect(StepService.updateVersion(STEPLIB_STEP, BITRISE_STEP_LIBRARY_URL, '2.0.0')).toBe(
        'https://github.com/bitrise-io/bitrise-steplib.git::script@2.0.0',
      );
    });

    it('should work with custom steplib step', () => {
      expect(StepService.updateVersion(CUSTOMLIB_STEP, BITRISE_STEP_LIBRARY_URL, '2.0.0')).toBe(
        'https://custom.step/foo/bar.git::bazz@2.0.0',
      );
    });

    it('should work with git step (git::https)', () => {
      expect(StepService.updateVersion(GITHUB_HTTPS_STEP, BITRISE_STEP_LIBRARY_URL, '2.0.0')).toBe(
        'git::https://github.com/bitrise-steplib/steps-script.git@2.0.0',
      );
    });

    it('should work with git step (git::git@)', () => {
      expect(StepService.updateVersion(GITHUB_SSH_STEP, BITRISE_STEP_LIBRARY_URL, '2.0.0')).toBe(
        'git::git@github.com:bitrise-steplib/steps-script.git@2.0.0',
      );
    });

    it('should not update local step (path::)', () => {
      expect(StepService.updateVersion(LOCAL_STEP, BITRISE_STEP_LIBRARY_URL, '2.0.0')).toBe(
        'path::/path/to/my/local-step',
      );
    });

    it('should not update step (bundle::)', () => {
      expect(StepService.updateVersion(STEP_BUNDLE, BITRISE_STEP_LIBRARY_URL, '2.0.0')).toBe('bundle::my-bundle');
    });

    it('should not update with group (with)', () => {
      expect(StepService.updateVersion(WITH_GROUP, BITRISE_STEP_LIBRARY_URL, '2.0.0')).toBe('with');
    });
  });

  describe('isStep', () => {
    describe('returns true', () => {
      it('should return true for step id', () => {
        expect(StepService.isStep('script', BITRISE_STEP_LIBRARY_URL)).toBe(true);
      });

      it('should return true for a default steplib step', () => {
        expect(StepService.isStep(STEPLIB_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(true);
      });

      it('should return true for a custom steplib step', () => {
        expect(StepService.isStep(CUSTOMLIB_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(true);
      });

      it('should return true for a git step (git::)', () => {
        expect(StepService.isStep(GITHUB_HTTPS_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(true);
      });

      it('should return true for local step (path::)', () => {
        expect(StepService.isStep(LOCAL_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(true);
      });
    });

    describe('returns false', () => {
      it('should return false for step bundle', () => {
        expect(StepService.isStep(STEP_BUNDLE, BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });

      it('should return false for with group', () => {
        expect(StepService.isStep(WITH_GROUP, BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });
    });
  });

  describe('isBitriseLibraryStep', () => {
    describe('returns true', () => {
      it('should return true for step id only', () => {
        expect(StepService.isBitriseLibraryStep('script', BITRISE_STEP_LIBRARY_URL)).toBe(true);
      });

      it('should return true for default steplib step', () => {
        expect(StepService.isBitriseLibraryStep(STEPLIB_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(true);
      });

      it('should return true for custom steplib step', () => {
        expect(StepService.isBitriseLibraryStep(CUSTOMLIB_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });
    });

    describe('returns false', () => {
      it('should return false for git step (git::)', () => {
        expect(StepService.isBitriseLibraryStep(GITHUB_HTTPS_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });

      it('should return false for local step (path::)', () => {
        expect(StepService.isBitriseLibraryStep(LOCAL_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });

      it('should return false for step bundle (bundle::)', () => {
        expect(StepService.isBitriseLibraryStep(STEP_BUNDLE, BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });

      it('should return false for with group (with)', () => {
        expect(StepService.isBitriseLibraryStep(WITH_GROUP, BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });
    });
  });

  describe('isGitStep', () => {
    it('should return true for git step (git::)', () => {
      expect(StepService.isGitStep(GITHUB_HTTPS_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(true);
    });

    describe('returns false', () => {
      it('should return false for step id only', () => {
        expect(StepService.isGitStep('script', BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });

      it('should return false for default steplib step', () => {
        expect(StepService.isGitStep(STEPLIB_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });

      it('should return false for custom steplib step', () => {
        expect(StepService.isGitStep(CUSTOMLIB_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });

      it('should return false for local step (path::)', () => {
        expect(StepService.isGitStep(LOCAL_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });

      it('should return false for step bundle (bundle::)', () => {
        expect(StepService.isGitStep(STEP_BUNDLE, BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });

      it('should return false for with group (with)', () => {
        expect(StepService.isGitStep(WITH_GROUP, BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });
    });
  });

  describe('isLocalStep', () => {
    it('should return true for local step (path::)', () => {
      expect(StepService.isLocalStep(LOCAL_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(true);
    });

    describe('returns false', () => {
      it('should return false for step id only', () => {
        expect(StepService.isLocalStep('script', BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });

      it('should return false for default steplib step', () => {
        expect(StepService.isLocalStep(STEPLIB_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });

      it('should return false for custom steplib step', () => {
        expect(StepService.isLocalStep(CUSTOMLIB_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });

      it('should return false for git step (git::)', () => {
        expect(StepService.isLocalStep(GITHUB_HTTPS_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });

      it('should return false for step bundle (bundle::)', () => {
        expect(StepService.isLocalStep(STEP_BUNDLE, BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });

      it('should return false for with group (with)', () => {
        expect(StepService.isLocalStep(WITH_GROUP, BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });
    });
  });

  describe('isStepBundle', () => {
    it('should return true for step bundle', () => {
      expect(StepService.isStepBundle(STEP_BUNDLE, BITRISE_STEP_LIBRARY_URL)).toBe(true);
    });

    describe('returns false', () => {
      it('should return false for step id only', () => {
        expect(StepService.isStepBundle('script', BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });

      it('should return false for default steplib step', () => {
        expect(StepService.isStepBundle(STEPLIB_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });

      it('should return false for custom steplib step', () => {
        expect(StepService.isStepBundle(CUSTOMLIB_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });

      it('should return false for git step (git::)', () => {
        expect(StepService.isStepBundle(GITHUB_HTTPS_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });

      it('should return false for local step (path::)', () => {
        expect(StepService.isStepBundle(LOCAL_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });

      it('should return false for with group (with)', () => {
        expect(StepService.isStepBundle(WITH_GROUP, BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });
    });
  });

  describe('isWithGroup', () => {
    it('should return true for with group (with)', () => {
      expect(StepService.isWithGroup(WITH_GROUP, BITRISE_STEP_LIBRARY_URL)).toBe(true);
    });

    describe('returns false', () => {
      it('should return false for step id only', () => {
        expect(StepService.isWithGroup('script', BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });

      it('should return false for default steplib step', () => {
        expect(StepService.isWithGroup(STEPLIB_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });

      it('should return false for custom steplib step', () => {
        expect(StepService.isWithGroup(CUSTOMLIB_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });

      it('should return false for git step (git::)', () => {
        expect(StepService.isWithGroup(GITHUB_HTTPS_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });

      it('should return false for local step (path::)', () => {
        expect(StepService.isWithGroup(LOCAL_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });

      it('should return false for step bundle (bundle::)', () => {
        expect(StepService.isWithGroup(STEP_BUNDLE, BITRISE_STEP_LIBRARY_URL)).toBe(false);
      });
    });
  });

  describe('getHttpsGitUrl', () => {
    describe('local step', () => {
      it('should return an empy string', () => {
        expect(StepService.getHttpsGitUrl(LOCAL_STEP, BITRISE_STEP_LIBRARY_URL)).toBe('');
      });
    });

    describe('with group', () => {
      it('should return an empy string', () => {
        expect(StepService.getHttpsGitUrl(WITH_GROUP, BITRISE_STEP_LIBRARY_URL)).toBe('');
      });
    });

    describe('step bundle', () => {
      it('should return an empy string', () => {
        expect(StepService.getHttpsGitUrl(STEP_BUNDLE, BITRISE_STEP_LIBRARY_URL)).toBe('');
      });
    });

    describe('Bitrise steplib step', () => {
      it('should return the HTTPS URL for an implicit Bitrise steplib step', () => {
        expect(StepService.getHttpsGitUrl('script', BITRISE_STEP_LIBRARY_URL)).toBe(BITRISE_STEP_LIBRARY_URL);
      });

      it('should return the HTTPS URL for an explicit Bitrise steplib step', () => {
        expect(StepService.getHttpsGitUrl(STEPLIB_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(BITRISE_STEP_LIBRARY_URL);
      });
    });

    describe('Custom steplib step', () => {
      it('should return the HTTPS URL for an HTTP custom steplib step', () => {
        expect(
          StepService.getHttpsGitUrl(CUSTOMLIB_STEP.replace('https://', 'http://'), BITRISE_STEP_LIBRARY_URL),
        ).toBe('https://custom.step/foo/bar.git');
      });

      it('should return the HTTPS URL for a HTTPS custom steplib step', () => {
        expect(StepService.getHttpsGitUrl(CUSTOMLIB_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(
          'https://custom.step/foo/bar.git',
        );
      });

      it('should return the HTTPS URL for a git@ custom steplib step', () => {
        expect(StepService.getHttpsGitUrl(CUSTOMLIB_SSH_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(
          'https://custom.step/foo/bar.git',
        );
      });
    });

    describe('Git step', () => {
      describe('GitHub', () => {
        it('should return the HTTPS URL for a HTTPS GitHub repository', () => {
          expect(StepService.getHttpsGitUrl(GITHUB_HTTPS_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(
            'https://github.com/bitrise-steplib/steps-script.git',
          );
        });

        it('should return the HTTPS URL for a HTTP GitHub repository', () => {
          expect(
            StepService.getHttpsGitUrl(GITHUB_HTTPS_STEP.replace('https://', 'http://'), BITRISE_STEP_LIBRARY_URL),
          ).toBe('https://github.com/bitrise-steplib/steps-script.git');
        });

        it('should return the HTTPS URL for a git@ GitHub repository', () => {
          expect(StepService.getHttpsGitUrl(GITHUB_SSH_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(
            'https://github.com/bitrise-steplib/steps-script.git',
          );
        });
      });

      describe('GitLab', () => {
        it('should return the HTTPS URL for a HTTPS GitHub repository', () => {
          expect(StepService.getHttpsGitUrl(GITLAB_HTTPS_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(
            'https://gitlab.com/steplib/steps-script.git',
          );
        });

        it('should return the HTTPS URL for a HTTP GitHub repository', () => {
          expect(
            StepService.getHttpsGitUrl(GITLAB_HTTPS_STEP.replace('https://', 'http://'), BITRISE_STEP_LIBRARY_URL),
          ).toBe('https://gitlab.com/steplib/steps-script.git');
        });

        it('should return the HTTPS URL for a git@ GitHub repository', () => {
          expect(StepService.getHttpsGitUrl(GITLAB_SSH_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(
            'https://gitlab.com/steplib/steps-script.git',
          );
        });
      });

      describe('Bitbucket', () => {
        it('should return the HTTPS URL for a HTTPS GitHub repository', () => {
          expect(StepService.getHttpsGitUrl(BITBUCKET_HTTPS_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(
            'https://bitbucket.org/steplib/steps-script.git',
          );
        });

        it('should return the HTTPS URL for a HTTP GitHub repository', () => {
          expect(
            StepService.getHttpsGitUrl(BITBUCKET_HTTPS_STEP.replace('https://', 'http://'), BITRISE_STEP_LIBRARY_URL),
          ).toBe('https://bitbucket.org/steplib/steps-script.git');
        });

        it('should return the HTTPS URL for a git@ GitHub repository', () => {
          expect(StepService.getHttpsGitUrl(BITBUCKET_SSH_STEP, BITRISE_STEP_LIBRARY_URL)).toBe(
            'https://bitbucket.org/steplib/steps-script.git',
          );
        });
      });
    });
  });

  describe('getRawGitUrl', () => {
    describe('GitHub', () => {
      it('should return the raw URL for a HTTP GitHub repository', () => {
        const cvs = 'git::http://github.com/bitrise-io/steps-fastlane.git@master';
        expect(StepService.getRawGitUrl(cvs, BITRISE_STEP_LIBRARY_URL)).toBe(
          'https://raw.githubusercontent.com/bitrise-io/steps-fastlane/master/step.yml',
        );
      });

      it('should return the raw URL for a HTTPS GitHub repository', () => {
        const cvs = 'git::https://github.com/bitrise-io/steps-fastlane.git@master';
        expect(StepService.getRawGitUrl(cvs, BITRISE_STEP_LIBRARY_URL)).toBe(
          'https://raw.githubusercontent.com/bitrise-io/steps-fastlane/master/step.yml',
        );
      });

      it('should return the raw URL for a git@ GitHub repository', () => {
        const cvs = 'git::git@github.com:bitrise-io/steps-fastlane.git@master';
        expect(StepService.getRawGitUrl(cvs, BITRISE_STEP_LIBRARY_URL)).toBe(
          'https://raw.githubusercontent.com/bitrise-io/steps-fastlane/master/step.yml',
        );
      });

      it('should fallback to master branch if no branch is provided', () => {
        const cvs = 'git::https://github.com/bitrise-io/steps-fastlane.git';
        expect(StepService.getRawGitUrl(cvs, BITRISE_STEP_LIBRARY_URL)).toBe(
          'https://raw.githubusercontent.com/bitrise-io/steps-fastlane/master/step.yml',
        );
      });
    });

    describe('GitLab', () => {
      it('should return the raw URL for a HTTP GitLab repository', () => {
        const cvs = 'git::http://gitlab.com/steplib/steps-fastlane.git@master';
        expect(StepService.getRawGitUrl(cvs, BITRISE_STEP_LIBRARY_URL)).toBe(
          'https://gitlab.com/api/v4/projects/steplib%2Fsteps-fastlane/repository/files/step.yml?ref=master',
        );
      });

      it('should return the raw URL for a HTTPS GitLab repository', () => {
        const cvs = 'git::https://gitlab.com/steplib/steps-fastlane.git@master';
        expect(StepService.getRawGitUrl(cvs, BITRISE_STEP_LIBRARY_URL)).toBe(
          'https://gitlab.com/api/v4/projects/steplib%2Fsteps-fastlane/repository/files/step.yml?ref=master',
        );
      });

      it('should return the raw URL for a git@ GitLab repository', () => {
        const cvs = 'git::git@gitlab.com:steplib/steps-fastlane.git@master';
        expect(StepService.getRawGitUrl(cvs, BITRISE_STEP_LIBRARY_URL)).toBe(
          'https://gitlab.com/api/v4/projects/steplib%2Fsteps-fastlane/repository/files/step.yml?ref=master',
        );
      });

      it('should fallback to master branch if no branch is provided', () => {
        const cvs = 'git::https://gitlab.com/steplib/steps-fastlane.git';
        expect(StepService.getRawGitUrl(cvs, BITRISE_STEP_LIBRARY_URL)).toBe(
          'https://gitlab.com/api/v4/projects/steplib%2Fsteps-fastlane/repository/files/step.yml?ref=master',
        );
      });
    });

    describe('Bitbucket', () => {
      it('should return the raw URL for a HTTP Bitbucket repository', () => {
        const cvs = 'git::http://bitbucket.org/zoltan-szabo-bitrise/steps-fastlane.git@master';
        expect(StepService.getRawGitUrl(cvs, BITRISE_STEP_LIBRARY_URL)).toBe(
          'https://bitbucket.org/zoltan-szabo-bitrise/steps-fastlane/raw/master/step.yml',
        );
      });

      it('should return the raw URL for a HTTPS Bitbucket repository', () => {
        const cvs = 'git::https://bitbucket.org/zoltan-szabo-bitrise/steps-fastlane.git@master';
        expect(StepService.getRawGitUrl(cvs, BITRISE_STEP_LIBRARY_URL)).toBe(
          'https://bitbucket.org/zoltan-szabo-bitrise/steps-fastlane/raw/master/step.yml',
        );
      });

      it('should return the raw URL for a git@ Bitbucket repository', () => {
        const cvs = 'git::git@bitbucket.org:zoltan-szabo-bitrise/steps-fastlane.git@master';
        expect(StepService.getRawGitUrl(cvs, BITRISE_STEP_LIBRARY_URL)).toBe(
          'https://bitbucket.org/zoltan-szabo-bitrise/steps-fastlane/raw/master/step.yml',
        );
      });

      it('should fallback to master branch if no branch is provided', () => {
        const cvs = 'git::https://bitbucket.org/zoltan-szabo-bitrise/steps-fastlane.git';
        expect(StepService.getRawGitUrl(cvs, BITRISE_STEP_LIBRARY_URL)).toBe(
          'https://bitbucket.org/zoltan-szabo-bitrise/steps-fastlane/raw/master/step.yml',
        );
      });
    });

    it('should return the raw URL for a generic Git repository', () => {
      const cvs = 'git::https://example.com/steps-fastlane.git@master';
      expect(StepService.getRawGitUrl(cvs, BITRISE_STEP_LIBRARY_URL)).toBe(
        'https://example.com/steps-fastlane/step.yml',
      );
    });

    it('should handle URLs without .git suffix', () => {
      const cvs = 'git::https://github.com/bitrise-io/steps-fastlane@master';
      expect(StepService.getRawGitUrl(cvs, BITRISE_STEP_LIBRARY_URL)).toBe(
        'https://raw.githubusercontent.com/bitrise-io/steps-fastlane/master/step.yml',
      );
    });

    it('should handle URLs with different versions', () => {
      const cvs = 'git::https://github.com/bitrise-io/steps-fastlane.git@v1.2.3';
      expect(StepService.getRawGitUrl(cvs, BITRISE_STEP_LIBRARY_URL)).toBe(
        'https://raw.githubusercontent.com/bitrise-io/steps-fastlane/v1.2.3/step.yml',
      );
    });
  });

  describe('resolveTitle', () => {
    it('should return step bundle title for step bundle (bundle::)', () => {
      expect(
        StepService.resolveTitle('bundle::my-bundle', BITRISE_STEP_LIBRARY_URL, {
          title: 'My bundle',
        }),
      ).toBe('My bundle');
    });

    it('should return "With group" for with group (with)', () => {
      expect(StepService.resolveTitle(WITH_GROUP, BITRISE_STEP_LIBRARY_URL)).toBe('With group');
    });

    describe('simple step', () => {
      it('should return the step title', () => {
        expect(
          StepService.resolveTitle('script', BITRISE_STEP_LIBRARY_URL, {
            title: 'My script',
          }),
        ).toBe('My script');
      });

      it('should return the step id, if title is not defined', () => {
        expect(StepService.resolveTitle('script', BITRISE_STEP_LIBRARY_URL)).toBe('script');
      });
    });

    describe('default steplib step', () => {
      it('should return the step title', () => {
        expect(
          StepService.resolveTitle(STEPLIB_STEP, BITRISE_STEP_LIBRARY_URL, {
            title: 'My script',
          }),
        ).toBe('My script');
      });

      it('should return the step id, if title is not defined', () => {
        expect(StepService.resolveTitle(STEPLIB_STEP, BITRISE_STEP_LIBRARY_URL)).toBe('script');
      });
    });

    describe('custom steplib step', () => {
      it('should return the step title', () => {
        expect(
          StepService.resolveTitle(CUSTOMLIB_STEP, BITRISE_STEP_LIBRARY_URL, {
            title: 'My script',
          }),
        ).toBe('My script');
      });

      it('should return the step id, if title is not defined', () => {
        expect(StepService.resolveTitle(CUSTOMLIB_STEP, BITRISE_STEP_LIBRARY_URL)).toBe('bazz');
      });
    });

    describe('git step (git::)', () => {
      it('should return the step title', () => {
        expect(StepService.resolveTitle(GITHUB_HTTPS_STEP, BITRISE_STEP_LIBRARY_URL, { title: 'My script' })).toBe(
          'My script',
        );
      });

      it('should return the step id, if title is not defined', () => {
        expect(StepService.resolveTitle(GITHUB_HTTPS_STEP, BITRISE_STEP_LIBRARY_URL)).toBe('steps-script');
      });
    });

    describe('local step (path::)', () => {
      it('should return the step title', () => {
        expect(
          StepService.resolveTitle(LOCAL_STEP, BITRISE_STEP_LIBRARY_URL, {
            title: 'My script',
          }),
        ).toBe('My script');
      });

      it('should return the step id, if title is not defined', () => {
        expect(StepService.resolveTitle(LOCAL_STEP, BITRISE_STEP_LIBRARY_URL)).toBe('local-step');
      });
    });
  });

  describe('resolveIcon', () => {
    it('should return step icon.svg if available', () => {
      const step = { asset_urls: { 'icon.svg': 'step-icon.svg' } };
      expect(StepService.resolveIcon('script', BITRISE_STEP_LIBRARY_URL, step)).toBe('step-icon.svg');
    });

    it('should return step icon.png if icon.svg is not available', () => {
      const step = { asset_urls: { 'icon.png': 'step-icon.png' } };
      expect(StepService.resolveIcon('script', BITRISE_STEP_LIBRARY_URL, step)).toBe('step-icon.png');
    });

    it('should return info icon.svg if step icon is not available', () => {
      const info = { asset_urls: { 'icon.svg': 'info-icon.svg' } };
      expect(StepService.resolveIcon('script', BITRISE_STEP_LIBRARY_URL, undefined, info)).toBe('info-icon.svg');
    });

    it('should return info icon.png if step and info icon.svg are not available', () => {
      const info = { asset_urls: { 'icon.png': 'info-icon.png' } };
      expect(StepService.resolveIcon('script', BITRISE_STEP_LIBRARY_URL, undefined, info)).toBe('info-icon.png');
    });

    it('should return default icon if no icons are available', () => {
      expect(StepService.resolveIcon('script', BITRISE_STEP_LIBRARY_URL)).toBe('default-icon');
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
      expect(StepService.calculateChange(oldStep, newStep, BITRISE_STEP_LIBRARY_URL)).toEqual({
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
      expect(StepService.calculateChange(oldStep, newStep, BITRISE_STEP_LIBRARY_URL)).toEqual({
        removedInputs: [],
        newInputs: ['input3'],
        change: 'inputs',
      });
    });

    it('returns no changes if oldStep or newStep is missing', () => {
      expect(StepService.calculateChange(undefined, {} as StepApiResult, BITRISE_STEP_LIBRARY_URL)).toEqual({
        removedInputs: [],
        newInputs: [],
        change: 'none',
      });
      expect(StepService.calculateChange({} as StepApiResult, undefined, BITRISE_STEP_LIBRARY_URL)).toEqual({
        removedInputs: [],
        newInputs: [],
        change: 'none',
      });
    });

    it('returns no changes if step IDs are different', () => {
      const oldStep = { cvs: 'script@1' } as StepApiResult;
      const newStep = { cvs: 'other-script@1' } as StepApiResult;
      expect(StepService.calculateChange(oldStep, newStep, BITRISE_STEP_LIBRARY_URL)).toEqual({
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
      expect(StepService.calculateChange(oldStep, newStep, BITRISE_STEP_LIBRARY_URL)).toEqual({
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
      expect(StepService.calculateChange(oldStep, newStep, BITRISE_STEP_LIBRARY_URL)).toEqual({
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
      expect(StepService.calculateChange(oldStep, newStep, BITRISE_STEP_LIBRARY_URL)).toEqual({
        removedInputs: [],
        newInputs: [],
        change: 'none',
      });
    });
  });

  describe('moveStepIndices', () => {
    test('move a not selected before a selected', () => {
      const result = StepService.moveStepIndices('move', [0, 2], 3, 1);
      expect(result).toEqual([0, 3]);
    });

    test('move a selected after a selected', () => {
      const result = StepService.moveStepIndices('move', [0, 1], 0, 4);
      expect(result).toEqual([4, 0]);
    });

    test('move a selected before a not selected', () => {
      const result = StepService.moveStepIndices('move', [1, 2], 2, 0);
      expect(result).toEqual([2, 0]);
    });

    test('remove a selected', () => {
      const result = StepService.moveStepIndices('remove', [0, 2], 0);
      expect(result).toEqual([-1, 1]);
    });

    test('remove a not selected', () => {
      const result = StepService.moveStepIndices('remove', [0, 2], 1);
      expect(result).toEqual([0, 1]);
    });

    test('clone a selected', () => {
      const result = StepService.moveStepIndices('clone', [1], 1);
      expect(result).toEqual([2]);
    });

    test('clone a not selected', () => {
      const result = StepService.moveStepIndices('clone', [1], 0);
      expect(result).toEqual([2]);
    });
  });

  describe('addStep', () => {
    it('should add a step to an existing workflow', () => {
      StepService.addStep('workflows', 'primary', 'added@1', 1);

      const expectedYml = yaml`
        workflows:
          primary:
            steps:
            - script@1: {}
            - added@1: {}
            - cache@2:
                inputs: []
        step_bundles:
          my_bundle:
            steps:
            - script@1: {}
            - cache@2: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should add a step to an existing step bundle', () => {
      StepService.addStep('step_bundles', 'my_bundle', 'added@1', 1);

      const expectedYml = yaml`
        workflows:
          primary:
            steps:
            - script@1: {}
            - cache@2:
                inputs: []
        step_bundles:
          my_bundle:
            steps:
            - script@1: {}
            - added@1: {}
            - cache@2: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throws an error if the workflow or step bundle does not exist', () => {
      expectErrors(
        [
          () => StepService.addStep('workflows', 'non_existing', 'added@1', 2),
          () => StepService.addStep('step_bundles', 'non_existing', 'added@1', 2),
        ],
        ['workflows.non_existing not found', 'step_bundles.non_existing not found'],
      );
    });
  });

  describe('moveStep', () => {
    it('should move a step to a new position in an existing workflow', () => {
      StepService.moveStep('workflows', 'primary', 0, 1);

      const expectedYml = yaml`
        workflows:
          primary:
            steps:
            - cache@2:
                inputs: []
            - script@1: {}
        step_bundles:
          my_bundle:
            steps:
            - script@1: {}
            - cache@2: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should move a step to a new position in an existing step bundle', () => {
      StepService.moveStep('step_bundles', 'my_bundle', 0, 1);

      const expectedYml = yaml`
        workflows:
          primary:
            steps:
            - script@1: {}
            - cache@2:
                inputs: []
        step_bundles:
          my_bundle:
            steps:
            - cache@2: {}
            - script@1: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should move the step to end of the steps if the new index is out ouf bounds', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          workflows:
            primary:
              steps:
              - script@1: {}
              - cache@2: {}
              - build@2: {}
        `,
      );

      StepService.moveStep('workflows', 'primary', 1, 4);

      expect(getYmlString()).toEqual(
        yaml`
          workflows:
            primary:
              steps:
              - script@1: {}
              - build@2: {}
              - cache@2: {}
        `,
      );
    });

    it('should move the step relative to the end of the steps', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          workflows:
            primary:
              steps:
              - script@1: {}
              - cache@2: {}
              - build@2: {}
        `,
      );

      StepService.moveStep('workflows', 'primary', 0, -1);

      expect(getYmlString()).toEqual(
        yaml`
          workflows:
            primary:
              steps:
              - cache@2: {}
              - script@1: {}
              - build@2: {}
        `,
      );
    });

    it('should throw an error if the workflow or step bundle does not exist', () => {
      expectErrors(
        [
          () => StepService.moveStep('workflows', 'non_existing', 0, 1),
          () => StepService.moveStep('step_bundles', 'non_existing', 0, 1),
        ],
        ['workflows.non_existing not found', 'step_bundles.non_existing not found'],
      );
    });

    it('should throw an error if the step does not exist', () => {
      expectErrors(
        [() => StepService.moveStep('workflows', 'primary', 2, 1)],
        ['Step at index 2 not found in workflows.primary'],
      );
    });
  });

  describe('cloneStep', () => {
    it('should clone a step in an existing workflow', () => {
      StepService.cloneStep('workflows', 'primary', 0);

      const expectedYml = yaml`
        workflows:
          primary:
            steps:
            - script@1: {}
            - script@1: {}
            - cache@2:
                inputs: []
        step_bundles:
          my_bundle:
            steps:
            - script@1: {}
            - cache@2: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should clone a step in an existing step bundle', () => {
      StepService.cloneStep('step_bundles', 'my_bundle', 0);

      const expectedYml = yaml`
        workflows:
          primary:
            steps:
            - script@1: {}
            - cache@2:
                inputs: []
        step_bundles:
          my_bundle:
            steps:
            - script@1: {}
            - script@1: {}
            - cache@2: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if the workflow or step bundle does not exist', () => {
      expectErrors(
        [
          () => StepService.cloneStep('workflows', 'non_existing', 0),
          () => StepService.cloneStep('step_bundles', 'non_existing', 0),
        ],
        ['workflows.non_existing not found', 'step_bundles.non_existing not found'],
      );
    });

    it('should throw an error if the step does not exist', () => {
      expectErrors(
        [() => StepService.cloneStep('workflows', 'primary', 2)],
        ['Step at index 2 not found in workflows.primary'],
      );
    });
  });

  describe('deleteStep', () => {
    it('should delete a step in an existing workflow', () => {
      StepService.deleteStep('workflows', 'primary', 0);

      const expectedYml = yaml`
        workflows:
          primary:
            steps:
            - cache@2:
                inputs: []
        step_bundles:
          my_bundle:
            steps:
            - script@1: {}
            - cache@2: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should delete a step in an existing step bundle', () => {
      StepService.deleteStep('step_bundles', 'my_bundle', 0);

      const expectedYml = yaml`
        workflows:
          primary:
            steps:
            - script@1: {}
            - cache@2:
                inputs: []
        step_bundles:
          my_bundle:
            steps:
            - cache@2: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should be able to delete multiple steps', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          workflows:
            primary:
              steps:
              - script@1: {}
              - cache@2: {}
              - build@2: {}
              - deploy@2: {}
              - analyze@2: {}
        `,
      );

      StepService.deleteStep('workflows', 'primary', [1, 2, 3]);

      const expectedYml = yaml`
        workflows:
          primary:
            steps:
            - script@1: {}
            - analyze@2: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should delete steps field if it is empty', () => {
      StepService.deleteStep('workflows', 'primary', 0);
      StepService.deleteStep('workflows', 'primary', 0);

      const expectedYml = yaml`
        workflows:
          primary: {}
        step_bundles:
          my_bundle:
            steps:
            - script@1: {}
            - cache@2: {}
      `;
      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if the workflow or step bundle does not exist', () => {
      expectErrors(
        [
          () => StepService.deleteStep('workflows', 'non_existing', 0),
          () => StepService.deleteStep('step_bundles', 'non_existing', 0),
        ],
        ['workflows.non_existing not found', 'step_bundles.non_existing not found'],
      );
    });

    it('should throw an error if the step does not exist', () => {
      expectErrors(
        [() => StepService.deleteStep('workflows', 'primary', 2)],
        ['Step at index 2 not found in workflows.primary'],
      );
    });
  });

  describe('updateStepField', () => {
    it('should update a step field in an existing workflow', () => {
      StepService.updateStepField('workflows', 'primary', 0, 'title', 'New title');

      const expectedYml = yaml`
        workflows:
          primary:
            steps:
            - script@1:
                title: New title
            - cache@2:
                inputs: []
        step_bundles:
          my_bundle:
            steps:
            - script@1: {}
            - cache@2: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should update a step field in an existing step bundle', () => {
      StepService.updateStepField('step_bundles', 'my_bundle', 0, 'title', 'New title');

      const expectedYml = yaml`
        workflows:
          primary:
            steps:
            - script@1: {}
            - cache@2:
                inputs: []
        step_bundles:
          my_bundle:
            steps:
            - script@1:
                title: New title
            - cache@2: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should remove a step field if the new value is empty', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          workflows:
            primary:
              steps:
              - script@1:
                  title: Old title
        `,
      );

      StepService.updateStepField('workflows', 'primary', 0, 'title', '');

      const expectedYml = yaml`
        workflows:
          primary:
            steps:
            - script@1: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if the workflow or step bundle does not exist', () => {
      expectErrors(
        [
          () => StepService.updateStepField('workflows', 'non_existing', 0, 'run_if', '.CI'),
          () => StepService.updateStepField('step_bundles', 'non_existing', 0, 'run_if', '.CI'),
        ],
        ['workflows.non_existing not found', 'step_bundles.non_existing not found'],
      );
    });

    it('should throw an error if the step does not exist', () => {
      expectErrors(
        [() => StepService.updateStepField('workflows', 'primary', 2, 'run_if', '.CI')],
        ['Step at index 2 not found in workflows.primary'],
      );
    });
  });

  describe('updateStepInput', () => {
    it('should update an existing step input', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          workflows:
            primary:
              steps:
              - script@1:
                  inputs:
                  - is_debug: false
                  - is_test: false
        `,
      );

      StepService.updateStepInput('workflows', 'primary', 0, 'is_test', 'true');

      const expectedYml = yaml`
        workflows:
          primary:
            steps:
            - script@1:
                inputs:
                - is_debug: false
                - is_test: true
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should add a new step input if it does not exist', () => {
      // NOTE: Duplication is intentional here because it tests the deduplication of inputs
      StepService.updateStepInput('workflows', 'primary', 1, 'is_test', 'false');
      StepService.updateStepInput('workflows', 'primary', 1, 'is_test', 'true');

      const expectedYml = yaml`
        workflows:
          primary:
            steps:
            - script@1: {}
            - cache@2:
                inputs:
                - is_test: true
        step_bundles:
          my_bundle:
            steps:
            - script@1: {}
            - cache@2: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should remove the step input if empty string is given', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          workflows:
            primary:
              steps:
              - script@1:
                  inputs:
                  - is_debug: false
                  - is_test: true
        `,
      );

      StepService.updateStepInput('workflows', 'primary', 0, 'is_debug', '');

      const expectedYml = yaml`
        workflows:
          primary:
            steps:
            - script@1:
                inputs:
                - is_test: true
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should remove the step inputs field if remove the last input', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          workflows:
            primary:
              steps:
              - script@1:
                  inputs:
                  - is_debug: false
        `,
      );

      StepService.updateStepInput('workflows', 'primary', 0, 'is_debug', '');

      const expectedYml = yaml`
        workflows:
          primary:
            steps:
            - script@1: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should not override existing input opts', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          workflows:
            primary:
              steps:
              - script@1:
                  inputs:
                  - is_debug: false
                  - is_test: false
                    opts:
                      is_expand: true
        `,
      );

      StepService.updateStepInput('workflows', 'primary', 0, 'is_test', 'true');

      const expectedYml = yaml`
        workflows:
          primary:
            steps:
            - script@1:
                inputs:
                - is_debug: false
                - is_test: true
                  opts:
                    is_expand: true
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if the workflow or step bundle does not exist', () => {
      expectErrors(
        [
          () => StepService.updateStepInput('workflows', 'non_existing', 0, 'is_test', 'true'),
          () => StepService.updateStepInput('step_bundles', 'non_existing', 0, 'is_test', 'true'),
        ],
        ['workflows.non_existing not found', 'step_bundles.non_existing not found'],
      );
    });

    it('should throw an error if the step does not exist', () => {
      expectErrors(
        [() => StepService.updateStepInput('workflows', 'primary', 2, 'is_test', 'true')],
        ['Step at index 2 not found in workflows.primary'],
      );
    });
  });

  describe('changeStepVersion', () => {
    it('should upgrade the step version at the given index', () => {
      StepService.changeStepVersion('workflows', 'primary', 0, '1.2.3');
      StepService.changeStepVersion('step_bundles', 'my_bundle', 1, '2.3.x');

      const expectedYml = yaml`
        workflows:
          primary:
            steps:
            - script@1.2.3: {}
            - cache@2:
                inputs: []
        step_bundles:
          my_bundle:
            steps:
            - script@1: {}
            - cache@2.3: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should append version if the step does not have one', () => {
      updateBitriseYmlDocumentByString(
        yaml`
          workflows:
            primary:
              steps:
              - script: {}
              - cache@2: {}
          step_bundles:
            my_bundle:
              steps:
              - script@1: {}
              - cache: {}
        `,
      );

      StepService.changeStepVersion('workflows', 'primary', 0, '1.2.3');
      StepService.changeStepVersion('step_bundles', 'my_bundle', 1, '2.3.x');

      const expectedYml = yaml`
        workflows:
          primary:
            steps:
            - script@1.2.3: {}
            - cache@2: {}
        step_bundles:
          my_bundle:
            steps:
            - script@1: {}
            - cache@2.3: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should remove the step version is empty string is given', () => {
      StepService.changeStepVersion('workflows', 'primary', 0, '');
      StepService.changeStepVersion('step_bundles', 'my_bundle', 1, '');

      const expectedYml = yaml`
        workflows:
          primary:
            steps:
            - script: {}
            - cache@2:
                inputs: []
        step_bundles:
          my_bundle:
            steps:
            - script@1: {}
            - cache: {}
      `;

      expect(getYmlString()).toEqual(expectedYml);
    });

    it('should throw an error if the workflow or step bundle does not exist', () => {
      expectErrors(
        [
          () => StepService.changeStepVersion('workflows', 'non_existing', 0, '1.2.3'),
          () => StepService.changeStepVersion('step_bundles', 'non_existing', 0, '2.3.x'),
        ],
        ['workflows.non_existing not found', 'step_bundles.non_existing not found'],
      );
    });

    it('should throw an error if the step does not exist', () => {
      expectErrors(
        [() => StepService.changeStepVersion('workflows', 'primary', 2, '1.2.3')],
        ['Step at index 2 not found in workflows.primary'],
      );
    });
  });
});
