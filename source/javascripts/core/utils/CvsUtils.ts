import { DockerStep, Step, StepBundle, Steps } from '@/core/models/Step';

const STEP_BUNDLE_PATTERN = /^bundle::/g;
const WITH_GROUP_PATTERN = /^with$/g;
const GIT_STEP_PATTERN = /^git::/g;
const LOCAL_STEP_PATTERN = /^path::/g;

function parseStepCVS(cvs: string) {
  const cleaned = cvs.replace(/^(git::|path::|bundle::|with)/g, '');
  const parts = cleaned.split('@');
  return [parts[0], parts[1] || undefined] as const;
}

function isStepLibStep(cvs: string, _step?: Steps[number][string]): _step is Step {
  return !isStepBundle(cvs) && !isDockerStep(cvs) && !isGitStep(cvs) && !isLocalStep(cvs);
}

function isGitStep(cvs: string, _step?: Steps[number][string]): _step is Step {
  return GIT_STEP_PATTERN.test(cvs);
}

function isLocalStep(cvs: string, _step?: Steps[number][string]): _step is Step {
  return LOCAL_STEP_PATTERN.test(cvs);
}

function isStepBundle(cvs: string, _step?: Steps[number][string]): _step is StepBundle {
  return STEP_BUNDLE_PATTERN.test(cvs);
}

function isDockerStep(cvs: string, _step?: Steps[number][string]): _step is DockerStep {
  return WITH_GROUP_PATTERN.test(cvs);
}

export default {
  parseStepCVS,
  isStepLibStep,
  isGitStep,
  isLocalStep,
  isStepBundle,
  isDockerStep,
};
