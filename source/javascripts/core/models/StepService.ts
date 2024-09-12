import uniq from 'lodash/uniq';
import isEmpty from 'lodash/isEmpty';
import {
  Step,
  StepBundleYmlObject,
  StepInputVariable,
  Steps,
  StepYmlObject,
  VariableOpts,
  WithGroupYmlObject,
} from '@/core/models/Step';
import type { StepInfo } from '@/core/api/StepApi';
import VersionUtils from '@/core/utils/VersionUtils';
import defaultIcon from '@/../images/step/icon-default.svg';

const DEFAULT_STEPLIB_URL = 'https://github.com/bitrise-io/bitrise-steplib.git';

// https://devcenter.bitrise.io/en/references/steps-reference/step-reference-id-format.html
// <step_lib_source>::<step-id>@<version>:
function parseStepCVS(
  cvs: string,
  defaultStepLib: string = DEFAULT_STEPLIB_URL,
): {
  library: string;
  id: string;
  version: string;
} {
  const [source, version = ''] = cvs.split('@');
  const id = source.split('::').pop() || source;

  // Example: with
  if (/^(with)$/g.test(cvs)) {
    return { library: 'bundle', id, version: '' };
  }

  // Example: bundle::name
  if (/^bundle::/g.test(cvs)) {
    return { library: 'bundle', id, version: '' };
  }

  // Example: path::path/to/step
  if (/^path::/g.test(cvs)) {
    return { library: 'path', id, version: '' };
  }

  // Example: git::https://github.com/bitrise-io/steps-script.git@next:
  if (/^git::/g.test(cvs)) {
    return { library: 'git', id: id.replace('.git', ''), version };
  }

  // Example: https://github.com/bitrise-io/bitrise-steplib.git::script@1
  // Example: https://github.com/foo/bar-steplib.git::step@1
  if (/^https?:\/\/.+::(.+)/g.test(cvs)) {
    const [library, stepId] = source.split('::');
    return { library, id: stepId, version };
  }

  // Example: script@1
  return { library: defaultStepLib, id, version };
}

function createStepCVS(cvs: string, version?: string) {
  if (isLocalStep(cvs) || isStepBundle(cvs) || isWithGroup(cvs)) {
    return cvs;
  }

  const id = cvs.split('@')[0];
  const denormalizedVersion = VersionUtils.denormalizeVersion(version);
  return version ? `${id}@${denormalizedVersion}` : id;
}

function isStep(cvs: string, _step?: Steps[number][string]): _step is StepYmlObject {
  return (
    isStepLibStep(cvs, _step) || isCustomStepLibStep(cvs, _step) || isGitStep(cvs, _step) || isLocalStep(cvs, _step)
  );
}

function isStepLibStep(cvs: string, _step?: Steps[number][string]): _step is StepYmlObject {
  return !/^(git::|path::|bundle::|with)/g.test(cvs);
}

function isCustomStepLibStep(cvs: string, _step?: Steps[number][string]): _step is StepYmlObject {
  return /https?:\/\//.test(cvs) && !cvs.startsWith(DEFAULT_STEPLIB_URL);
}

function isGitStep(cvs: string, _step?: Steps[number][string]): _step is StepYmlObject {
  return /^git::/g.test(cvs);
}

function isLocalStep(cvs: string, _step?: Steps[number][string]): _step is StepYmlObject {
  return /^path::/g.test(cvs);
}

function isStepBundle(cvs: string, _step?: Steps[number][string]): _step is StepBundleYmlObject {
  return /^bundle::/g.test(cvs);
}

function isWithGroup(cvs: string, _step?: Steps[number][string]): _step is WithGroupYmlObject {
  return /^with$/g.test(cvs);
}

function resolveTitle(cvs: string, step?: StepYmlObject): string {
  if (isStepBundle(cvs, step)) {
    return `Step bundle: ${cvs.replace('bundle::', '')}`;
  }
  if (isWithGroup(cvs, step)) {
    return 'With group';
  }

  if (step?.title) {
    return step.title;
  }

  const { id } = parseStepCVS(cvs);
  return id.split('/').pop() || id;
}

function resolveIcon(step?: StepYmlObject, info?: StepInfo): string {
  return (
    step?.asset_urls?.['icon.svg'] ||
    step?.asset_urls?.['icon.png'] ||
    info?.asset_urls?.['icon.svg'] ||
    info?.asset_urls?.['icon.png'] ||
    defaultIcon
  );
}

function getSelectableVersions(step?: Step): Array<{ value: string; label: string }> {
  const results = [{ value: '', label: 'Always latest' }];

  if (step?.resolvedInfo?.version && /\d+\.\d+\.\d+/g.test(step.resolvedInfo.version)) {
    results.push({
      value: step.resolvedInfo.version,
      label: `${step.resolvedInfo.version} - ${VersionUtils.getVersionRemark(step.resolvedInfo.version)}`,
    });
  }

  const versions = step?.resolvedInfo?.versions;
  if (versions) {
    results.push(
      ...VersionUtils.getNormalizedVersions(versions).map((version) => ({
        value: version,
        label: `${version} - ${VersionUtils.getVersionRemark(version)}`,
      })),
    );
  }

  return results;
}

function getStepCategories(steps: Step[]): string[] {
  return uniq(steps.flatMap((step) => step.defaultValues?.type_tags || [])).sort();
}

function toYmlInput(
  name: string,
  newValue: unknown,
  defaultValue: unknown,
  opts?: VariableOpts,
): StepInputVariable | undefined {
  if (!newValue) {
    return undefined;
  }

  if (newValue === defaultValue) {
    return undefined;
  }

  if (typeof defaultValue === 'boolean' && ['true', 'false'].includes(String(newValue))) {
    return { [name]: Boolean(newValue), ...(!isEmpty(opts) ? { opts } : {}) };
  }

  if (typeof defaultValue === 'number' && !Number.isNaN(Number(newValue))) {
    return { [name]: Number(newValue), ...(!isEmpty(opts) ? { opts } : {}) };
  }

  return { [name]: newValue, ...(!isEmpty(opts) ? { opts } : {}) };
}

export default {
  parseStepCVS,
  createStepCVS,
  isStep,
  isStepLibStep,
  isCustomStepLibStep,
  isGitStep,
  isLocalStep,
  isStepBundle,
  isWithGroup,
  resolveTitle,
  resolveIcon,
  getSelectableVersions,
  getStepCategories,
  toYmlInput,
};
