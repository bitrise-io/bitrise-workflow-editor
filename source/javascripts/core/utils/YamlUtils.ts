/* eslint-disable guard-for-in */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */

import { isEmpty } from 'es-toolkit/compat';
import { Glob, isMatch } from 'picomatch';
import { Document, isCollection, isMap, isPair, isScalar, Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml';

import BitriseYmlApi from '../api/BitriseYmlApi';

type Args = { doc: Document; paths: string[] };
type AfterRemove = (removedNodePath: string[]) => void;

function toDotNotation(paths: unknown[]) {
  return paths.join('.');
}

function toArrayNotation(path: string) {
  return path.split('.');
}

function removeIfEmpty(doc: Document, path: string[], glob: Glob, afterRemove?: AfterRemove) {
  const node = doc.getIn(path);
  const nodeIsEmpty =
    (isCollection(node) && isEmpty(node.items)) || ((isScalar(node) || isPair(node)) && isEmpty(node.value));
  const shouldRemoveNode = nodeIsEmpty && isMatch(toDotNotation(path), glob);

  if (shouldRemoveNode) {
    doc.deleteIn(path);
    afterRemove?.(path);
    removeIfEmpty(doc, path.slice(0, -1), glob, afterRemove);
  } else if (nodeIsEmpty && isCollection(node)) {
    node.flow = true;
  }
}

function isScalarKeyEqual(pair: Pair, key: string): pair is Pair<Scalar> {
  return isScalar(pair.key) && pair.key.value === key;
}

function isNonScalarKeyEqual(pair: Pair, key: string) {
  return !isScalar(pair.key) && (pair.key as string).toString() === key;
}

function isPairKeyEqual(pair: Pair, key: string) {
  return isScalarKeyEqual(pair, key) || isNonScalarKeyEqual(pair, key);
}

function createMissingNodes(doc: Document, path: unknown[]) {
  const ancestorPath = [];

  for (const part of path.slice(0, -1)) {
    ancestorPath.push(part);

    const node = doc.getIn(ancestorPath);
    const shouldCreateEmptyNode = !node || (!isScalar(node) && !node) || (isScalar(node) && !node.value);

    if (shouldCreateEmptyNode) {
      const nextPart = path[ancestorPath.length];
      const shouldBeSequence = typeof nextPart === 'number' || (!isNaN(Number(nextPart)) && Number(nextPart) >= 0);
      const emptyNode = shouldBeSequence ? doc.createNode([], { flow: false }) : doc.createNode({}, { flow: false });
      doc.setIn(ancestorPath, emptyNode);
    }
  }
}

function getSeqIn(doc: Document, path: unknown[], createIfNotExists: true): YAMLSeq;
function getSeqIn(doc: Document, path: unknown[], createIfNotExists?: boolean): YAMLSeq | undefined;
function getSeqIn(doc: Document, path: unknown[], createIfNotExists = false): YAMLSeq | undefined {
  if (!doc.hasIn(path) && createIfNotExists) {
    createMissingNodes(doc, path);
    const parent = doc.getIn(path.slice(0, -1));
    if (isCollection(parent) && parent.items.length === 0) {
      parent.flow = false;
    }
    doc.setIn(path, doc.createNode([]));
  }

  if (!doc.hasIn(path)) {
    return undefined;
  }

  return doc.getIn(path, true) as YAMLSeq;
}

function getMapIn(doc: Document, path: unknown[], createIfNotExists: true): YAMLMap;
function getMapIn(doc: Document, path: unknown[], createIfNotExists?: boolean): YAMLMap | undefined;
function getMapIn(doc: Document, path: unknown[], createIfNotExists = false): YAMLMap | undefined {
  if (!doc.hasIn(path) && createIfNotExists) {
    createMissingNodes(doc, path);
    const parent = doc.getIn(path.slice(0, -1));
    if (isCollection(parent) && parent.items.length === 0) {
      parent.flow = false;
    }
    doc.setIn(path, doc.createNode({}));
  }

  if (!doc.hasIn(path)) {
    return undefined;
  }

  return doc.getIn(path) as YAMLMap;
}

function safeDeleteIn(doc: Document, path: unknown[], removeEmptyParent: boolean | unknown[] = false) {
  if (doc.hasIn(path)) {
    doc.deleteIn(path);
  }

  if (removeEmptyParent === true) {
    const parentPath = path.slice(0, -1);
    const parent = doc.getIn(parentPath);

    if (isCollection(parent) && parent.items.length === 0) {
      safeDeleteIn(doc, parentPath, parentPath.length > 1);
    }
  } else if (Array.isArray(removeEmptyParent) && removeEmptyParent.length > 0) {
    const parentPath = path.slice(0, -1);
    const parent = doc.getIn(parentPath);
    const parentKey = toDotNotation(parentPath);
    const removeKey = toDotNotation(removeEmptyParent);

    if (isCollection(parent) && parent.items.length === 0 && parentKey.endsWith(removeKey)) {
      safeDeleteIn(doc, parentPath, removeEmptyParent.slice(0, -1));
    }
  }
}

function updateMapKey(map: YAMLMap, oldKey: string, newKey: string) {
  map.items = map.items.map((pair) => {
    if (isScalarKeyEqual(pair, oldKey)) {
      pair.key.value = newKey;
    } else if (isNonScalarKeyEqual(pair, oldKey)) {
      pair.key = newKey;
    }

    return pair;
  });
}

// Memoization cache for areDocumentsEqual
const areDocumentsEqualCache = new WeakMap<Document, WeakMap<Document, boolean>>();

function areDocumentsEqual(a: Document, b: Document) {
  // Check if documents are the same instance
  if (a === b) return true;

  // Check if result is already cached
  if (!areDocumentsEqualCache.has(a)) {
    areDocumentsEqualCache.set(a, new WeakMap<Document, boolean>());
  }

  const aCache = areDocumentsEqualCache.get(a)!;

  if (aCache.has(b)) {
    return aCache.get(b)!;
  }

  // Compute the result
  const result = BitriseYmlApi.toYml(a) === BitriseYmlApi.toYml(b);

  // Cache the result
  aCache.set(b, result);

  return result;
}

function updateKey({ doc, paths }: Args, glob: Glob, newKey: string) {
  const filteredPaths = paths.filter((path) => isMatch(path, glob)).map(toArrayNotation);

  filteredPaths.forEach((path) => {
    if (path.length === 1 && isMap(doc.contents)) {
      updateMapKey(doc.contents, path[0], newKey);
      return;
    }

    const parentPath = path.slice(0, -1);
    const parent = doc.getIn(parentPath);

    if (isMap(parent)) {
      const key = path[path.length - 1];
      updateMapKey(parent, key, newKey);
    }
  });
}

function updateValue({ doc, paths }: Args, glob: Glob, newValue: unknown, oldValue?: unknown) {
  const filteredPaths = paths.filter((path) => isMatch(path, glob)).map(toArrayNotation);

  filteredPaths.forEach((path) => {
    const value = doc.getIn(path);

    if (value === oldValue || oldValue === undefined) {
      doc.setIn(path, newValue);
    }
  });
}

function deleteNodeByPath(ctx: Args, glob: Glob, removeIfEmptyGlob?: Glob, afterRemove?: AfterRemove) {
  const filteredPaths = ctx.paths.filter((path) => isMatch(path, glob)).map(toArrayNotation);

  filteredPaths.sort((a, b) => {
    return toDotNotation(b).localeCompare(toDotNotation(a), undefined, { numeric: true, sensitivity: 'base' });
  });

  filteredPaths.forEach((path) => {
    if (ctx.doc.deleteIn(path)) {
      afterRemove?.(path);
    }

    if (removeIfEmptyGlob) {
      removeIfEmpty(ctx.doc, path.slice(0, -1), removeIfEmptyGlob, afterRemove);
    }
  });
}

function deleteNodeByValue(ctx: Args, glob: Glob, value: unknown, removeIfEmptyGlob?: Glob, afterRemove?: AfterRemove) {
  const filteredPaths = ctx.paths.filter((path) => isMatch(path, glob)).map(toArrayNotation);

  filteredPaths.sort((a, b) => {
    return toDotNotation(b).localeCompare(toDotNotation(a), undefined, { numeric: true, sensitivity: 'base' });
  });

  filteredPaths.forEach((path) => {
    if (typeof value === 'function' ? !value(ctx.doc.getIn(path)) : ctx.doc.getIn(path) !== value) {
      return;
    }

    if (ctx.doc.deleteIn(path)) {
      afterRemove?.(path);
    }

    if (removeIfEmptyGlob) {
      removeIfEmpty(ctx.doc, path.slice(0, -1), removeIfEmptyGlob, afterRemove);
    }
  });
}

function collectPaths(obj: unknown, prefix = '') {
  const paths: string[] = [];

  if (Array.isArray(obj)) {
    if (prefix) paths.push(prefix);
    obj.forEach((item, index) => {
      const fullPath = prefix ? `${prefix}.${index}` : `${index}`;
      paths.push(...collectPaths(item, fullPath));
    });
  } else if (typeof obj === 'object' && obj !== null) {
    if (prefix) paths.push(prefix);
    for (const key in obj) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      paths.push(...collectPaths((obj as never)[key], fullPath));
    }
  } else if (prefix) paths.push(prefix);

  return paths;
}

type GetPairInSeqByKeyReturn = [Pair<Scalar, Scalar> | undefined, number | undefined];
function getPairInSeqByKey(seq: YAMLSeq, key: string, createIfNotExists: true): [Pair<Scalar, Scalar>, number];
function getPairInSeqByKey(seq: YAMLSeq, key: string, createIfNotExists?: boolean): GetPairInSeqByKeyReturn;
function getPairInSeqByKey(seq: YAMLSeq, key: string, createIfNotExists = false): GetPairInSeqByKeyReturn {
  for (let i = 0; i < seq.items.length; i++) {
    const maybeMap = seq.items[i];
    if (isMap(maybeMap)) {
      for (const maybePair of maybeMap.items) {
        if (isPairKeyEqual(maybePair, key)) {
          return [maybePair as Pair<Scalar, Scalar>, i];
        }
      }
    }
  }

  if (createIfNotExists) {
    const newMap = new YAMLMap();
    const newPair = new Pair(new Scalar(key), new Scalar(''));

    newMap.add(newPair);
    seq.add(newMap);

    return [newPair, seq.items.length - 1];
  }

  return [undefined, undefined];
}

export default {
  getSeqIn,
  getMapIn,
  updateKey,
  updateValue,
  safeDeleteIn,
  updateMapKey,
  collectPaths,
  toDotNotation,
  toArrayNotation,
  deleteNodeByPath,
  deleteNodeByValue,
  areDocumentsEqual,
  getPairInSeqByKey,
};
