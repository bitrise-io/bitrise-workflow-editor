import { omitBy, uniq } from 'es-toolkit';
import { isEmpty } from 'es-toolkit/compat';

import { EnvironmentItemModel, StepBundles, Workflows } from '../models/BitriseYml';

function getDirectDependants(workflows: Workflows, cvs: string) {
  const directDependants: string[] = [];
  Object.entries(workflows ?? {}).forEach(([workflowId, workflow]) => {
    workflow.steps?.forEach((step) => {
      if (Object.keys(step)[0] === cvs) {
        directDependants.push(workflowId);
      }
    });
  });

  return directDependants;
}

function getDependantWorkflows(workflows: Workflows, cvs: string, stepBundles: StepBundles) {
  let directDependants: string[] = getDirectDependants(workflows, cvs);

  const stepBundleChains = getStepBundleChains(stepBundles);

  Object.values(stepBundleChains).forEach((chain) => {
    if (chain.length > 1) {
      chain.forEach((bundle) => {
        directDependants = directDependants.concat(getDirectDependants(workflows, idToCvs(bundle)));
      });
    }
  });

  return uniq(directDependants);
}

function getUsedByText(count: number) {
  switch (count) {
    case 0:
      return 'Not used by any Workflows';
    case 1:
      return 'Used in 1 Workflow';
    default:
      return `Used by ${count} Workflows`;
  }
}

function sanitizeName(value: string) {
  return value.replace(/[^a-zA-Z0-9_.-]/g, '').trim();
}

function validateName(newStepBundleName: string, initStepBundleName: string, stepBundleNames?: string[]) {
  const WORKFLOW_NAME_REGEX = /^[A-Za-z0-9-_.]+$/;

  if (!String(newStepBundleName).trim()) {
    return 'Step bundle name is required';
  }

  if (!WORKFLOW_NAME_REGEX.test(newStepBundleName)) {
    return 'Step bundle name must only contain letters, numbers, dashes, underscores or periods';
  }

  if (newStepBundleName !== initStepBundleName && stepBundleNames?.includes(newStepBundleName)) {
    return 'Step bundle name should be unique.';
  }

  return true;
}

function getStepBundleChain(stepBundles: StepBundles, id: string) {
  let ids: string[] = [];
  stepBundles[id]?.steps?.forEach((step) => {
    const cvs = Object.keys(step)[0];
    if (cvs.startsWith('bundle::')) {
      ids = ids.concat(getStepBundleChain(stepBundles, cvs.replace('bundle::', '')));
    }
  });
  ids.unshift(id);
  return ids;
}

function getStepBundleChains(stepBundles: StepBundles) {
  const stepBundleChains: Record<string, string[]> = {};
  Object.keys(stepBundles).forEach((id) => {
    stepBundleChains[id] = getStepBundleChain(stepBundles, id);
  });

  return stepBundleChains;
}

function cvsToId(cvs: string) {
  return cvs.replace('bundle::', '');
}

function idToCvs(id: string) {
  if (id.startsWith('bundle::')) {
    return id;
  }
  return `bundle::${id}`;
}

function sanitizeInputOpts(input: EnvironmentItemModel) {
  const sanitizedInput = { ...input };
  sanitizedInput.opts = omitBy(input.opts || {}, (value) => {
    if (!value) {
      return true;
    }
    if (Array.isArray(value) && value.length === 0) {
      return true;
    }
    return false;
  });

  if (isEmpty(sanitizedInput.opts)) {
    delete sanitizedInput.opts;
  }

  return sanitizedInput;
}

function sanitizeInputKey(key: string) {
  return key.replace(/[^a-zA-Z0-9_]/g, '').trim();
}

export default {
  getDependantWorkflows,
  getUsedByText,
  sanitizeName,
  validateName,
  getStepBundleChains,
  getStepBundleChain,
  cvsToId,
  idToCvs,
  sanitizeInputOpts,
  sanitizeInputKey,
};
