import { omitBy, uniq } from 'es-toolkit';
import { isEmpty } from 'es-toolkit/compat';
import { Document, isMap, isScalar, YAMLMap } from 'yaml';

import {
  EnvironmentItemModel,
  EnvironmentItemOptionsModel,
  StepBundleModel,
  StepBundles,
  Workflows,
} from '../models/BitriseYml';
import { StepBundleInstance } from '../models/Step';
import { STEP_BUNDLE_KEYS, StepBundleCreationSource } from '../models/StepBundle';
import { updateBitriseYmlDocument } from '../stores/BitriseYmlStore';
import YmlUtils from '../utils/YmlUtils';

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
    workflow?.steps?.forEach((step) => {
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

function ymlInstanceToStepBundle(
  id: string,
  stepBundle: StepBundleModel,
  defaultValues?: StepBundleModel,
  userValues?: StepBundleModel,
): StepBundleInstance {
  return {
    cvs: idToCvs(id),
    id,
    title: stepBundle.title,
    mergedValues: stepBundle,
    defaultValues: defaultValues || stepBundle,
    userValues: userValues || {},
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

  const entity = YmlUtils.getMapIn(doc, [source, sourceId]);
  if (!entity) {
    throw new Error(`${source}.${sourceId} not found`);
  }

  return entity;
}

function getSourceStepOrThrowError(
  doc: Document,
  at: { source: StepBundleCreationSource; sourceId: string; stepIndex: number },
) {
  const source = getCreationSourceOrThrowError(doc, at);
  const step = YmlUtils.getMapIn(source, ['steps', at.stepIndex]);

  if (!step) {
    throw new Error(`Step at index ${at.stepIndex} not found in ${at.source}.${at.sourceId}`);
  }

  return step;
}

function getStepBundleOrThrowError(doc: Document, id: string) {
  const stepBundle = YmlUtils.getMapIn(doc, ['step_bundles', id]);
  if (!stepBundle) {
    throw new Error(`Step bundle '${id}' not found`);
  }
  return stepBundle;
}

function throwIfStepBundleAlreadyExists(doc: Document, id: string) {
  if (YmlUtils.getMapIn(doc, ['step_bundles', id])) {
    throw new Error(`Step bundle '${id}' already exists`);
  }
}

function getStepBundleInputOrThrowError(doc: Document, at: { id: string; index: number }) {
  const stepBundle = getStepBundleOrThrowError(doc, at.id);

  const input = YmlUtils.getMapIn(stepBundle, ['inputs', at.index]);
  if (!input) {
    throw new Error(`Input at index '${at.index}' not found in step bundle '${at.id}'`);
  }

  return input;
}

function getStepBundleInputKeyOrThrowError(input: YAMLMap | EnvironmentItemModel) {
  const json = isMap(input) ? input.toJSON() : input;
  const key = Object.keys(json).find((k) => k !== 'opts');
  if (!key) {
    throw new Error('Input key not defined');
  }
  return key;
}

function createStepBundle(id: string, basedOn?: { source: StepBundleCreationSource; sourceId: string }) {
  updateBitriseYmlDocument(({ doc }) => {
    throwIfStepBundleAlreadyExists(doc, id);

    if (!basedOn) {
      YmlUtils.setIn(doc, ['step_bundles', id], {});
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

    YmlUtils.setIn(doc, ['step_bundles', id], baseEntity);

    return doc;
  });
}

function renameStepBundle(id: string, newId: string) {
  updateBitriseYmlDocument(({ doc }) => {
    getStepBundleOrThrowError(doc, id);
    throwIfStepBundleAlreadyExists(doc, newId);

    const cvs = idToCvs(id);
    const newCvs = idToCvs(newId);

    YmlUtils.updateKeyByPath(doc, ['step_bundles', id], newId);
    YmlUtils.updateKeyByPath(doc, ['workflows', '*', 'steps', '*', cvs], newCvs);
    YmlUtils.updateKeyByPath(doc, ['step_bundles', '*', 'steps', '*', cvs], newCvs);

    return doc;
  });
}

function deleteStepBundle(id: string) {
  updateBitriseYmlDocument(({ doc }) => {
    getStepBundleOrThrowError(doc, id);

    const cvs = idToCvs(id);
    function isStepBundleReference(node: unknown) {
      return isMap(node) ? node.has(cvs) : node === cvs;
    }

    YmlUtils.deleteByPath(doc, ['step_bundles', id]);
    YmlUtils.deleteByPredicate(doc, ['step_bundles', '*', 'steps', '*'], isStepBundleReference);
    YmlUtils.deleteByPredicate(doc, ['workflows', '*', 'steps', '*'], isStepBundleReference, ['workflows', '*']);

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
    YmlUtils.setIn(doc, ['step_bundles', id], { steps });
    YmlUtils.setIn(source, ['steps', indices[0]], { [cvs]: {} });

    const reverseIndices = indices.slice(1).reverse();
    reverseIndices.forEach((index) => {
      YmlUtils.deleteByPath(source, ['steps', index]);
    });

    return doc;
  });
}

function addStepBundleInput(id: string, input: EnvironmentItemModel) {
  updateBitriseYmlDocument(({ doc }) => {
    const stepBundle = getStepBundleOrThrowError(doc, id);
    const inputs = YmlUtils.getSeqIn(stepBundle, ['inputs'], true);

    const key = getStepBundleInputKeyOrThrowError(input);
    if (inputs.items.some((item) => isMap(item) && item.has(key))) {
      throw new Error(`Input '${key}' already exists in step bundle '${id}'`);
    }

    YmlUtils.addIn(inputs, [], sanitizeInputOpts(input));

    return doc;
  });
}

function deleteStepBundleInput(id: string, index: number) {
  updateBitriseYmlDocument(({ doc }) => {
    const stepBundle = getStepBundleOrThrowError(doc, id);

    if (!YmlUtils.getMapIn(stepBundle, ['inputs', index])) {
      throw new Error(`Input at index '${index}' not found in step bundle '${id}'`);
    }

    YmlUtils.deleteByPath(stepBundle, ['inputs', index]);

    return doc;
  });
}

function updateStepBundleInputKey(doc: Document, newKey: string, at: { id: string; index: number }) {
  const input = getStepBundleInputOrThrowError(doc, at);
  const key = getStepBundleInputKeyOrThrowError(input);

  const newKeySanitized = sanitizeInputKey(newKey);
  if (key !== newKeySanitized) {
    YmlUtils.updateKeyByPath(input, [key], newKeySanitized);
  }
}

function updateStepBundleInputValue(doc: Document, newValue: string, at: { id: string; index: number }) {
  const input = getStepBundleInputOrThrowError(doc, at);
  const key = getStepBundleInputKeyOrThrowError(input);

  if (!YmlUtils.isEqualValues(input.get(key), newValue)) {
    YmlUtils.setIn(input, [key], newValue);
  }
}

function updateStepBundleInputOpts(
  doc: Document,
  newOpts: EnvironmentItemOptionsModel,
  at: { id: string; index: number },
) {
  const input = getStepBundleInputOrThrowError(doc, at);
  if (isEmpty(newOpts)) {
    input.delete('opts');
    return;
  }

  const opts = YmlUtils.getMapIn(input, ['opts'], true);
  const oldKeys = Object.keys(opts.toJSON());
  const newKeys = Object.keys(newOpts);

  const removedKeys = oldKeys.filter(
    (key) => !newKeys.includes(key) || !newOpts[key as keyof EnvironmentItemOptionsModel],
  );
  const addedKeys = newKeys.filter(
    (key) => !oldKeys.includes(key) && newOpts[key as keyof EnvironmentItemOptionsModel],
  );
  const updatedKeys = newKeys.filter(
    (key) => oldKeys.includes(key) && newOpts[key as keyof EnvironmentItemOptionsModel],
  );

  // Remove keys that are not in the new opts
  removedKeys.forEach((key) => {
    YmlUtils.deleteByPath(opts, [key]);
  });

  // Update keys that are in both old and new opts
  updatedKeys.forEach((key) => {
    YmlUtils.setIn(opts, [key], newOpts[key as keyof EnvironmentItemOptionsModel]);
  });

  // Add keys that are in the new opts
  addedKeys.forEach((key) => {
    YmlUtils.setIn(opts, [key], newOpts[key as keyof EnvironmentItemOptionsModel]);
  });

  if (isEmpty(opts.items)) {
    YmlUtils.deleteByPath(input, ['opts']);
  }
}

function updateStepBundleInput(id: string, index: number, newInput: EnvironmentItemModel) {
  updateBitriseYmlDocument(({ doc }) => {
    getStepBundleInputOrThrowError(doc, { id, index });

    const { opts, ...keyValueObj } = newInput;
    const [key, value] = Object.entries(keyValueObj)[0];
    updateStepBundleInputKey(doc, key, { id, index });
    updateStepBundleInputValue(doc, value as string, { id, index });

    if (opts) {
      updateStepBundleInputOpts(doc, opts, { id, index });
    }

    return doc;
  });
}

type K = keyof StepBundleModel;
type V<T extends K> = StepBundleModel[T];
function updateStepBundleField<T extends K>(id: string, field: T, value: V<T>) {
  updateBitriseYmlDocument(({ doc }) => {
    const stepBundle = getStepBundleOrThrowError(doc, id);

    if (value) {
      YmlUtils.setIn(stepBundle, [field], value);
    } else {
      YmlUtils.deleteByPath(stepBundle, [field]);
    }

    return doc;
  });
}

function updateStepBundleInstanceField<T extends K>(
  field: T,
  value: V<T>,
  at: {
    cvs: string;
    source: StepBundleCreationSource;
    sourceId: string;
    stepIndex: number;
  },
) {
  const id = cvsToId(at.cvs);
  const { cvs, source, sourceId, stepIndex } = at;

  updateBitriseYmlDocument(({ doc }) => {
    const step = getSourceStepOrThrowError(doc, at);
    const stepValues = step?.toJSON()?.[cvs];

    if (stepValues === undefined) {
      throw new Error(`Step bundle instance '${id}' is not found in '${source}.${sourceId}' at index ${stepIndex}`);
    }

    if (value !== undefined && value !== '') {
      YmlUtils.setIn(step, [field], value);
    } else {
      YmlUtils.deleteByPath(step, [field]);
    }

    return doc;
  });
}

function updateStepBundleInputInstanceValue(
  key: string,
  newValue: string,
  at: {
    cvs: string;
    source: StepBundleCreationSource;
    sourceId: string;
    stepIndex: number;
  },
) {
  const id = cvsToId(at.cvs);
  const { cvs, source, sourceId, stepIndex } = at;

  updateBitriseYmlDocument(({ doc }) => {
    const step = getSourceStepOrThrowError(doc, at);
    const stepBundle = getStepBundleOrThrowError(doc, id);
    const stepValues = step?.toJSON()?.[cvs];

    if (stepValues === undefined) {
      throw new Error(`Step bundle instance '${id}' is not found in '${source}.${sourceId}' at index ${stepIndex}`);
    }

    if (stepValues === null) {
      YmlUtils.setIn(step, [cvs], {});
    }

    const inputsInInstance = YmlUtils.getSeqIn(step, [cvs, 'inputs']);
    const inputIndexInInstance = inputsInInstance?.items.findIndex((input) => isMap(input) && input.has(key)) ?? -1;

    const inputsInDefaults = YmlUtils.getSeqIn(stepBundle, ['inputs']);
    const inputIndexInDefaults = inputsInDefaults?.items.findIndex((input) => isMap(input) && input.has(key)) ?? -1;

    if (inputIndexInDefaults < 0) {
      throw new Error(`Input '${key}' not found in step bundle '${id}'`);
    }

    const shouldCreateInstanceInput = !!newValue && inputIndexInInstance < 0;
    const shouldUpdateInstanceInput = !!newValue && inputIndexInInstance >= 0;
    const shouldRemoveInstanceInput = !newValue && inputIndexInInstance >= 0;

    if (shouldCreateInstanceInput) {
      YmlUtils.addIn(step, [cvs, 'inputs'], { [key]: newValue });
    }

    if (shouldUpdateInstanceInput) {
      YmlUtils.updateValueByPath(step, [cvs, 'inputs', '*', key], newValue);
    }

    if (shouldRemoveInstanceInput) {
      YmlUtils.deleteByPath(step, [cvs, 'inputs', inputIndexInInstance]);
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
  updateStepBundleInput,
  updateStepBundleField,
  updateStepBundleInstanceField,
  updateStepBundleInputInstanceValue,
};
