import { omitBy, uniq } from 'es-toolkit';
import { isEmpty } from 'es-toolkit/compat';
import { Document, isMap, isScalar, YAMLMap, YAMLSeq } from 'yaml';

import { EnvironmentItemModel, StepBundleModel, StepBundles, Workflows } from '../models/BitriseYml';
import { StepBundle } from '../models/Step';
import { STEP_BUNDLE_KEYS, StepBundleCreationSource } from '../models/StepBundle';
// eslint-disable-next-line import/no-cycle
import { updateBitriseYmlDocument } from '../stores/BitriseYmlStore';
import YamlUtils from '../utils/YamlUtils';

const STEP_BUNDLE_REGEX = /^[A-Za-z0-9-_.]+$/;

function sanitizeName(value: string) {
  return value.replace(/[^a-zA-Z0-9_.-]/g, '').trim();
}

function validateName(newStepBundleName: string, initStepBundleName: string, stepBundleNames: string[]) {
  if (!String(newStepBundleName).trim()) {
    return 'Step bundle name is required';
  }

  if (!STEP_BUNDLE_REGEX.test(newStepBundleName)) {
    return 'Step bundle name must only contain letters, numbers, dashes, underscores or periods';
  }

  if (newStepBundleName !== initStepBundleName && stepBundleNames?.includes(newStepBundleName)) {
    return 'Step bundle name should be unique';
  }

  return true;
}

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

function ymlInstanceToStepBundle(id: string, stepBundle: StepBundleModel): StepBundle {
  return {
    cvs: idToCvs(id),
    id,
    title: stepBundle.title,
    userValues: stepBundle,
  };
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

function getCreationSourceOrThrowError(doc: Document, at: { source: StepBundleCreationSource; sourceId: string }) {
  const { source, sourceId } = at;
  const entity = doc.getIn([source, sourceId]);

  if (!entity || !isMap(entity)) {
    throw new Error(`${source}.${sourceId} not found`);
  }

  return entity;
}

function getStepBundleOrThrowError(doc: Document, id: string) {
  const stepBundle = doc.getIn(['step_bundles', id]);
  if (!stepBundle || !isMap(stepBundle)) {
    throw new Error(`Step bundle '${id}' not found`);
  }
  return stepBundle;
}

function getSourceStepOrThrowError(
  doc: Document,
  at: { source: StepBundleCreationSource; sourceId: string; stepIndex: number },
) {
  const source = getCreationSourceOrThrowError(doc, at);
  const step = source.getIn(['steps', at.stepIndex]);

  if (!step || !isMap(step)) {
    throw new Error(`Step at index ${at.stepIndex} not found in ${at.source}.${at.sourceId}`);
  }

  return step;
}

function throwIfStepBundleAlreadyExists(doc: Document, id: string) {
  const stepBundle = doc.getIn(['step_bundles', id]);
  if (stepBundle) {
    throw new Error(`Step bundle '${id}' already exists`);
  }
}

function createStepBundle(id: string, basedOn?: { source: StepBundleCreationSource; sourceId: string }) {
  updateBitriseYmlDocument(({ doc }) => {
    throwIfStepBundleAlreadyExists(doc, id);

    if (!basedOn) {
      doc.setIn(['step_bundles', id], doc.createNode({}));
      return doc;
    }

    const baseEntity = getCreationSourceOrThrowError(doc, basedOn).clone() as YAMLMap;
    const keysToDelete = new Set();
    baseEntity.items.forEach((item) => {
      const key = isScalar(item.key) ? item.key.value : item.key;
      if (!STEP_BUNDLE_KEYS.includes(key as keyof StepBundleModel)) {
        keysToDelete.add(key);
      }
    });
    keysToDelete.forEach((key) => baseEntity.delete(key));

    doc.setIn(['step_bundles', id], baseEntity);

    return doc;
  });
}

function renameStepBundle(id: string, newId: string) {
  updateBitriseYmlDocument(({ doc, paths }) => {
    getStepBundleOrThrowError(doc, id);
    throwIfStepBundleAlreadyExists(doc, newId);

    const cvs = idToCvs(id);
    const newCvs = idToCvs(newId);

    YamlUtils.updateKey({ doc, paths }, `step_bundles.${id}`, newId);
    YamlUtils.updateKey({ doc, paths }, `step_bundles.*.steps.*.${cvs}`, newCvs);
    YamlUtils.updateKey({ doc, paths }, `workflows.*.steps.*.${cvs}`, newCvs);

    return doc;
  });
}

function deleteStepBundle(id: string) {
  updateBitriseYmlDocument(({ doc, paths }) => {
    getStepBundleOrThrowError(doc, id);

    const cvs = idToCvs(id);
    function isStepBundleReference(node: unknown) {
      return isMap(node) ? node.has(cvs) : node === cvs;
    }

    YamlUtils.deleteNodeByPath({ doc, paths }, `step_bundles.${id}`, '*');
    YamlUtils.deleteNodeByValue({ doc, paths }, `step_bundles.*.steps.*`, isStepBundleReference, '*');
    YamlUtils.deleteNodeByValue({ doc, paths }, `workflows.*.steps.*`, isStepBundleReference, 'workflows.*.steps');

    return doc;
  });
}

function groupStepsToStepBundle(
  id: string,
  from: { source: StepBundleCreationSource; sourceId: string; steps: number[] },
) {
  updateBitriseYmlDocument(({ doc }) => {
    const source = getCreationSourceOrThrowError(doc, from);
    throwIfStepBundleAlreadyExists(doc, id);

    function isWithGroup(node: unknown) {
      return isMap(node) ? node.has('with') : node === 'with';
    }

    const indices = [...from.steps].sort((a, b) => a - b);
    const sourceSteps = source.get('steps') as YAMLMap;
    const steps = indices.map((index) => {
      const step = getSourceStepOrThrowError(doc, { source: from.source, sourceId: from.sourceId, stepIndex: index });

      if (isWithGroup(step)) {
        throw new Error(
          `Step at index ${index} in ${from.source}.${from.sourceId} is a with group, and cannot be used in a step bundle`,
        );
      }

      return step;
    });

    const cvs = idToCvs(id);
    const stepBundle = doc.createNode({ steps }) as YAMLMap;
    doc.addIn(['step_bundles', id], stepBundle);

    sourceSteps.set(indices[0], doc.createNode({ [cvs]: {} }));

    const reverseIndices = indices.slice(1).reverse();
    reverseIndices.forEach((index) => {
      sourceSteps.delete(index);
    });

    return doc;
  });
}

function addStepBundleInput(id: string, input: EnvironmentItemModel) {
  updateBitriseYmlDocument(({ doc }) => {
    const stepBundle = getStepBundleOrThrowError(doc, id);

    if (!stepBundle.has('inputs')) {
      stepBundle.set('inputs', doc.createNode([]));
    }

    const inputs = stepBundle.get('inputs') as YAMLSeq;

    const key = Object.keys(input).find((k) => k !== 'opts');
    if (!key) {
      throw new Error('Input key not defined');
    }

    const hasKeyAlready = inputs.items.some((inputItem) => isMap(inputItem) && inputItem.has(key));
    if (hasKeyAlready) {
      throw new Error(`Input '${key}' already exists in step bundle '${id}'`);
    }

    inputs.add(doc.createNode(sanitizeInputOpts(input)));

    return doc;
  });
}

function deleteStepBundleInput(id: string, index: number) {
  updateBitriseYmlDocument(({ doc, paths }) => {
    const stepBundle = getStepBundleOrThrowError(doc, id);

    const inputs = stepBundle.get('inputs') as YAMLSeq;
    if (!inputs?.has(index)) {
      throw new Error(`Input at index '${index}' not found in step bundle '${id}'`);
    }

    YamlUtils.deleteNodeByPath({ doc, paths }, `step_bundles.${id}.inputs.${index}`, `step_bundles.${id}.inputs`);

    return doc;
  });
}

type K = keyof StepBundleModel;
type V<T extends K> = StepBundleModel[T];
function updateStepBundleField<T extends K>(id: string, field: T, value: V<T>) {
  updateBitriseYmlDocument(({ doc }) => {
    const stepBundle = getStepBundleOrThrowError(doc, id);

    if (value) {
      stepBundle.flow = false;
      stepBundle.set(field, value);
    } else {
      stepBundle.delete(field);
    }

    return doc;
  });
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
  ymlInstanceToStepBundle,
  sanitizeInputOpts,
  sanitizeInputKey,
  createStepBundle,
  renameStepBundle,
  deleteStepBundle,
  groupStepsToStepBundle,
  addStepBundleInput,
  deleteStepBundleInput,
  updateStepBundleField,
};
