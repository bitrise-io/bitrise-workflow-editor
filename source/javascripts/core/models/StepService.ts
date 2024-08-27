import uniq from 'lodash/uniq';
import { Step, StepBundleYmlObject, Steps, StepYmlObject, WithGroupYmlObject } from '@/core/models/Step';
import type { StepInfo } from '@/core/api/StepApi';
import VersionUtils from '@/core/utils/VersionUtils';

function parseStepCVS(cvs: string) {
  const cleaned = cvs.replace(/^(git::|path::|bundle::|with)/g, '');
  const parts = cleaned.split('@');
  return [parts[0], parts[1] || undefined] as const;
}

function isStep(cvs: string, _step?: Steps[number][string]): _step is StepYmlObject {
  return isStepLibStep(cvs, _step) || isGitStep(cvs, _step) || isLocalStep(cvs, _step);
}

function isStepLibStep(cvs: string, _step?: Steps[number][string]): _step is StepYmlObject {
  return !/^(git::|path::|bundle::|with)/g.test(cvs);
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

  return step?.title || cvs.split('/').pop() || cvs;
}

function resolveIcon(step?: StepYmlObject, info?: StepInfo): string {
  return (
    step?.asset_urls?.['icon.svg'] ||
    step?.asset_urls?.['icon.png'] ||
    info?.asset_urls?.['icon.svg'] ||
    info?.asset_urls?.['icon.png'] ||
    ''
  );
}

function getSelectableVersions(step?: Step): Array<{ value: string; label: string }> {
  return Array.from(
    new Set([
      null,
      step?.resolvedInfo?.normalizedVersion,
      ...VersionUtils.getNormalizedVersions(step?.resolvedInfo?.versions),
    ]),
  )
    .sort()
    .reverse()
    .map((version) => ({
      value: version ?? '',
      label: version ? `${version} - ${VersionUtils.getVersionRemark(version)}` : 'Always latest',
    }));
}

function getStepCategories(steps: Step[]): string[] {
  return uniq(steps.flatMap((step) => step.userValues?.type_tags || [])).sort();
}

export default {
  resolveTitle,
  resolveIcon,
  parseStepCVS,
  isStep,
  isStepLibStep,
  isGitStep,
  isLocalStep,
  isStepBundle,
  isWithGroup,
  getSelectableVersions,
  getStepCategories,
};
