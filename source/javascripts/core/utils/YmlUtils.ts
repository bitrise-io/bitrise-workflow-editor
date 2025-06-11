/* eslint-disable no-param-reassign */

import { isEqual, isNil, isPrimitive } from 'es-toolkit';
import { isEmpty } from 'es-toolkit/compat';
import {
  Document,
  isCollection,
  isDocument,
  isMap,
  isNode,
  isPair,
  isScalar,
  isSeq,
  Node,
  parseDocument,
  Scalar,
  stringify,
  visit,
  YAMLMap,
  YAMLSeq,
} from 'yaml';

import { BitriseYml } from '../models/BitriseYml';

type Root = Document | Node;

/**
 * Type representing a path in a YAML document.
 * It can be an array of strings or numbers, where each element represents a key or index in the YAML structure.
 */
type Path = (string | number)[];

/**
 * Wildcard path type, which can include '*' as a wildcard character.
 */
type WildcardPath = ('*' | string | number)[];

/**
 * Type for a function that checks if a node matches a certain condition.
 * @param node - The node to check.
 * @returns A boolean indicating whether the node matches the condition.
 */
type Where = (node: unknown, path: Path) => boolean;

/**
 * Callback type for functions that operate on nodes.
 * @param node - The node that was processed.
 * @param path - The path to the node in the YAML document.
 */
type Callback = (node: Node, path: Path) => void;

const PLACEHOLDER_DOC = new Document('', { stringKeys: true, keepSourceTokens: true });

function toDoc(raw: string) {
  return parseDocument(raw, {
    stringKeys: true,
    keepSourceTokens: true,
  });
}

function toYml(root: Root) {
  let indents = 0;
  let paddings = 0;

  visit(root, {
    Node(_, { srcToken }) {
      if (srcToken?.type === 'flow-collection') {
        const startOffset = srcToken.start.offset;
        const endOffset = srcToken.end.find((s) => ['flow-map-end', 'flow-seq-end'].includes(s.type))?.offset ?? 0;

        if (endOffset - startOffset > 2) {
          paddings += srcToken.items.some((item) => item.start.some((s) => s.type === 'space')) ? 1 : -1;
        }
      }
      if (srcToken?.type === 'block-map') {
        srcToken.items.forEach((blockMapItem) => {
          if (blockMapItem.value?.type === 'block-seq') {
            blockMapItem.value.items.forEach((item) => {
              indents += item.start.some((s) => s.type === 'seq-item-ind' && s.indent > srcToken.indent) ? 1 : -1;
            });
          }
        });
      }
    },
    Scalar(__, node) {
      if (typeof node.value === 'string' && /\t/.test(node.value)) {
        node.type = 'BLOCK_LITERAL';
        node.value = node.value.replace(/\t/g, '  ');
      }
    },
  });

  return stringify(root, {
    version: '1.1',
    schema: 'yaml-1.1',
    indentSeq: indents > 0,
    aliasDuplicateObjects: false,
    flowCollectionPadding: paddings >= 0,
  });
}

function toJSON(root: Root) {
  return root.toJSON() as BitriseYml;
}

function toNode(value: unknown, copyFlowOptionFrom?: unknown) {
  const flow = isCollection(copyFlowOptionFrom) && !isEmpty(toJSON(copyFlowOptionFrom)) && copyFlowOptionFrom.flow;
  return PLACEHOLDER_DOC.createNode(value, { flow, aliasDuplicateObjects: false });
}

function toTypedValue(value: unknown) {
  if (typeof value !== 'string') {
    // Only strings need conversion here
    return value;
  }

  const trimmed = value.trim();
  const lowerValue = trimmed.toLowerCase();

  // Handle empty string
  if (trimmed === '') {
    return '';
  }

  // Null handling
  const nullVals = ['null', '~'];
  if (nullVals.includes(lowerValue)) {
    return null;
  }

  // Boolean handling
  const trueVals = ['true'];
  const falseVals = ['false'];
  if (trueVals.includes(lowerValue)) {
    return true;
  }
  if (falseVals.includes(lowerValue)) {
    return false;
  }

  // Special floats (.inf, -.inf, .nan)
  if (lowerValue === '.inf') return Infinity;
  if (lowerValue === '-.inf') return -Infinity;
  if (lowerValue === '.nan') return NaN;

  // DO NOT CONVERT: Leading +/- signs
  if (/^[+-]/.test(lowerValue)) {
    return value;
  }

  // DO NOT CONVERT: Treat scientific notation
  // If ends with exponent (e.g., 1e10, 1.5E-3), do NOT convert
  if (/[eE][-+]?\d+/.test(lowerValue)) {
    return value;
  }

  // DO NOT CONVERT: hex/octal/binary
  // If starts with 0x, 0o, 0b (case-insensitive),
  if (/^0[xob]/i.test(lowerValue)) {
    return value;
  }

  // DO NOT CONVERT: Integers with leading zeros
  // "0123" remains a string, but "0.123" becomes a number
  if (/^0\d+/.test(lowerValue)) {
    return value;
  }

  // DO NOT CONVERT: Floats with trailing zeros
  // "1.2300" remains a string, but "1.23" and "100" becomes a number
  if (lowerValue.includes('.') && lowerValue.endsWith('0')) {
    return value;
  }

  // DO NOT CONVERT: Comma-separated numbers
  if (/\d+,\d+/.test(lowerValue)) {
    return value;
  }

  // If it looks like a finite number (integer or float), convert to Number
  const number = Number(lowerValue);
  if (/^(\d+(\.\d*)?|\.\d+)$/.test(lowerValue) && !Number.isNaN(number)) {
    return number;
  }

  // Return original string unchanged
  return value;
}

function isWildcardPath(path: Path) {
  return path.includes('*');
}

function unflowEmptyCollection(node: unknown) {
  if (isCollection(node) && node.items.length === 0 && node.flow) {
    node.flow = false;
  }
}

function getIn(root: Root, path: Path, keepScalar = false) {
  if (!isDocument(root) && !isCollection(root)) {
    throw new Error('Root node must be a YAML Document or YAML Collection');
  }

  if (isWildcardPath(path)) {
    throw new Error('Path cannot contain wildcards when getting a value');
  }

  if (isEmpty(path)) {
    return root;
  }

  return root.getIn(path, keepScalar);
}

function hasIn(root: Root, path: Path) {
  if (!isDocument(root) && !isCollection(root)) {
    throw new Error('Root node must be a YAML Document or YAML Collection');
  }

  if (isWildcardPath(path)) {
    throw new Error('Path cannot contain wildcards when checking for existence');
  }

  if (isEmpty(path)) {
    return true;
  }

  return root.hasIn(path);
}

function setIn(root: Root, path: Path, value: unknown, stringToTypedValue = true) {
  if (!isDocument(root) && !isCollection(root)) {
    throw new Error('Root node must be a YAML Document or YAML Collection');
  }

  if (isWildcardPath(path)) {
    throw new Error('Path cannot contain wildcards when setting a value');
  }

  if (isEmpty(path)) {
    throw new Error('Path cannot be empty when setting a value');
  }

  let parentPath = [...path.slice(0, -1)];
  while (parentPath.length > 0 && isNil(root.getIn(parentPath))) {
    if (root.getIn(parentPath) === null) {
      const asIndex = Number(path[path.length - 1]);
      if (Number.isInteger(asIndex) && asIndex >= 0) {
        root.setIn(parentPath, new YAMLSeq());
      } else {
        root.setIn(parentPath, new YAMLMap());
      }
    }

    parentPath = parentPath.slice(0, -1);
  }

  unflowEmptyCollection(getIn(root, parentPath));

  const existingNode = getIn(root, path, true);
  const valueToWrite = stringToTypedValue ? toTypedValue(value) : value;

  if (isPrimitive(valueToWrite)) {
    let scalar: Scalar = new Scalar(valueToWrite);
    scalar.type = Scalar.PLAIN;

    if (isScalar(existingNode)) {
      scalar = existingNode;
      scalar.value = valueToWrite;
    }

    // If value is number, set the minFractionDigits to the number of digits in the value
    if (typeof valueToWrite === 'number' && String(value).includes('.')) {
      const digits = String(value).split('.')[1].length || 0;
      scalar.minFractionDigits = digits;
    } else {
      scalar.minFractionDigits = 0;
    }

    root.setIn(path, scalar);
    return;
  }

  root.setIn(path, toNode(valueToWrite, existingNode));
}

function addIn(root: Root, path: Path, value: unknown, stringToTypedValue = true) {
  if (!isDocument(root) && !isCollection(root)) {
    throw new Error('Root node must be a YAML Document or YAML Collection');
  }

  if (isWildcardPath(path)) {
    throw new Error('Path cannot contain wildcards when adding a value');
  }

  const existingNode = getIn(root, path);

  if (existingNode && !isSeq(existingNode)) {
    throw new Error(
      `Path should reference a YAMLSeq, but found ${existingNode.constructor.name} at path "${path.join('.')}"`,
    );
  }

  const valueToWrite = stringToTypedValue ? toTypedValue(value) : value;

  if (isSeq(existingNode)) {
    setIn(root, [...path, existingNode.items.length], valueToWrite, stringToTypedValue);
  } else {
    setIn(root, [...path, 0], valueToWrite, stringToTypedValue);
  }
}

function collectPaths(root: Root) {
  if (!isDocument(root) && !isCollection(root)) {
    throw new Error('Root node must be a YAML Document or YAML Collection');
  }

  function traverseAndCollectPaths(subject: unknown, ancestorPath: Path = []) {
    const paths: Path[] = [];

    if (Array.isArray(subject)) {
      subject.forEach((item, index) => {
        const path = [...ancestorPath, index];
        paths.push(path, ...traverseAndCollectPaths(item, path));
      });
    } else if (typeof subject === 'object' && subject !== null) {
      Object.entries(subject).forEach(([key, item]) => {
        const path = [...ancestorPath, key];
        paths.push(path, ...traverseAndCollectPaths(item, path));
      });
    }

    return paths;
  }

  return traverseAndCollectPaths(root.toJSON()).sort((a, b) => b.join('.').localeCompare(a.join('.')));
}

function getMatchingPaths(root: Root, path: WildcardPath, keep: WildcardPath = []) {
  return collectPaths(root).reduce<[Path, Path][]>((result, possiblePath) => {
    if (possiblePath.length !== path.length) {
      return result;
    }

    if (possiblePath.every((part, index) => [part, '*'].includes(path[index]))) {
      result.push([possiblePath, possiblePath.slice(0, keep.length)]);
    }

    return result;
  }, []);
}

const isEqualsCache = new WeakMap<Root, WeakMap<Root, boolean>>();
function isEquals(a: Root, b: Root) {
  if (a === b) return true;

  if (!isEqualsCache.has(a)) {
    isEqualsCache.set(a, new WeakMap<Root, boolean>());
  }

  const aCache = isEqualsCache.get(a)!;

  if (aCache.has(b)) {
    return aCache.get(b)!;
  }

  aCache.set(b, toYml(a) === toYml(b));

  return aCache.get(b)!;
}

function isEqualValues(a: unknown, b: unknown) {
  return isEqual(isNode(a) ? toJSON(a) : a, isNode(b) ? toJSON(b) : b);
}

function getSeqIn(root: Root, path: Path): YAMLSeq | undefined;
function getSeqIn(root: Root, path: Path, createIfNotExists: true): YAMLSeq;
function getSeqIn(root: Root, path: Path, createIfNotExists?: boolean): YAMLSeq | undefined;
function getSeqIn(root: Root, path: Path, createIfNotExists = false) {
  if (!isDocument(root) && !isCollection(root)) {
    throw new Error('Root node must be a YAML Document or YAML Collection');
  }

  if (isWildcardPath(path)) {
    throw new Error('Path cannot contain wildcards when getting a YAMLSeq');
  }

  if (!hasIn(root, path) && !createIfNotExists) {
    return undefined;
  }

  if (!hasIn(root, path) && createIfNotExists) {
    setIn(root, path, new YAMLSeq());
  }

  const node = getIn(root, path, true);

  if (!isSeq(node)) {
    throw new Error(`Expected a YAMLSeq at path "${path.join('.')}", but found ${node?.constructor.name}`);
  }

  return node;
}

function getMapIn(root: Root, path: Path): YAMLMap | undefined;
function getMapIn(root: Root, path: Path, createIfNotExists: true): YAMLMap;
function getMapIn(root: Root, path: Path, createIfNotExists: false): YAMLMap | undefined;
function getMapIn(root: Root, path: Path, createIfNotExists = false) {
  if (!isDocument(root) && !isCollection(root)) {
    throw new Error('Root node must be a YAML Document or YAML Collection');
  }

  if (isWildcardPath(path)) {
    throw new Error('Path cannot contain wildcards when getting a YAMLMap');
  }

  if (!root.hasIn(path) && !createIfNotExists) {
    return undefined;
  }

  if (!root.hasIn(path) && createIfNotExists) {
    setIn(root, path, new YAMLMap());
  }

  const node = getIn(root, path, true);

  if (!isMap(node)) {
    throw new Error(`Expected a YAMLMap at path "${path.join('.')}", but found ${node?.constructor.name}`);
  }

  return node;
}

function isInSeq(root: Root, path: Path, item: unknown, index?: number) {
  if (!isDocument(root) && !isCollection(root)) {
    throw new Error('Root node must be a YAML Document or YAML Collection');
  }

  if (isWildcardPath(path)) {
    throw new Error('Path cannot contain wildcards when checking if an item is in a YAMLSeq');
  }

  const seq = getIn(root, path);
  if (!isSeq(seq)) {
    return false;
  }

  return seq.items.some((node, i) => isEqualValues(node, item) && (index === undefined || i === index));
}

function deleteByPath(root: Root, path: WildcardPath, keep: WildcardPath = [], cb?: Callback) {
  if (!isDocument(root) && !isCollection(root)) {
    throw new Error('Root node must be a YAML Document or YAML Collection');
  }

  if (isWildcardPath(path)) {
    getMatchingPaths(root, path, keep).forEach((matchingPaths) => {
      deleteByPath(root, ...matchingPaths, cb);
    });

    return;
  }

  const deletedNode = getIn(root, path, true);
  if (isNode(deletedNode) && root.deleteIn(path)) {
    cb?.(deletedNode, path);
  }

  const parentPath = path.slice(0, -1);
  const parentNode = getIn(root, parentPath, true);

  if (!isEqual(parentPath, keep) && isNode(parentNode) && isEmpty(toJSON(parentNode))) {
    deleteByPath(root, parentPath, keep, cb);
  }
}

function deleteByPredicate(root: Root, path: WildcardPath, where: Where, keep: WildcardPath = [], cb?: Callback) {
  if (!isDocument(root) && !isCollection(root)) {
    throw new Error('Root node must be a YAML Document or YAML Collection');
  }

  if (isWildcardPath(path)) {
    getMatchingPaths(root, path, keep).forEach(([exactPath, exactKeep]) => {
      deleteByPredicate(root, exactPath, where, exactKeep, cb);
    });

    return;
  }

  if (where(getIn(root, path, true), path)) {
    deleteByPath(root, path, keep, cb);
  }
}

function deleteByValue(root: Root, path: WildcardPath, value: unknown, keep: WildcardPath = [], cb?: Callback) {
  return deleteByPredicate(root, path, (node) => isEqualValues(node, value), keep, cb);
}

function updateKeyByPath(root: Root, path: WildcardPath, newKey: string, cb?: Callback) {
  if (!isDocument(root) && !isCollection(root)) {
    throw new Error('Root node must be a YAML Document or YAML Collection');
  }

  if (isWildcardPath(path)) {
    getMatchingPaths(root, path).forEach(([exactPath]) => {
      updateKeyByPath(root, exactPath, newKey, cb);
    });

    return;
  }

  const node = getIn(root, path, true);
  if (!isNode(node)) {
    throw new Error(`Node at path "${path.join('.')}" is not a YAML Node`);
  }

  const parentPath = path.slice(0, -1);
  const parentNode = getIn(root, parentPath, true);

  if (!isMap(parentNode) && !isPair(parentNode)) {
    throw new Error(`Parent node at path "${parentPath.join('.')}" is not a YAMLMap or YAMLPair`);
  }

  if (isPair(parentNode)) {
    parentNode.key = newKey;
  } else {
    parentNode.items.forEach((item) => {
      item.key = isEqualValues(item.key, path[path.length - 1]) ? newKey : item.key;
    });
  }

  cb?.(node, path);
}

function updateKeyByPredicate(root: Root, path: WildcardPath, where: Where, newKey: string, cb?: Callback) {
  if (!isDocument(root) && !isCollection(root)) {
    throw new Error('Root node must be a YAML Document or YAML Collection');
  }

  if (isWildcardPath(path)) {
    getMatchingPaths(root, path).forEach(([exactPath]) => {
      updateKeyByPredicate(root, exactPath, where, newKey, cb);
    });

    return;
  }

  const node = getIn(root, path, true);
  if (!isNode(node)) {
    throw new Error(`Node at path "${path.join('.')}" is not a YAML Node`);
  }

  if (where(node, path)) {
    updateKeyByPath(root, path, newKey, cb);
  }
}

function updateValueByPath(root: Root, path: WildcardPath, newValue: unknown, cb?: Callback) {
  if (!isDocument(root) && !isCollection(root)) {
    throw new Error('Root node must be a YAML Document or YAML Collection');
  }

  if (isWildcardPath(path)) {
    getMatchingPaths(root, path).forEach(([exactPath]) => {
      updateValueByPath(root, exactPath, newValue, cb);
    });

    return;
  }

  const oldNode = getIn(root, path, true);
  if (!isNode(oldNode)) {
    throw new Error(`Node at path "${path.join('.')}" is not a YAML Node`);
  }

  setIn(root, path, newValue);
  const newNode = getIn(root, path, true) as Node;

  cb?.(newNode, path);
}

function updateValueByPredicate(root: Root, path: WildcardPath, where: Where, newValue: unknown, cb?: Callback) {
  if (!isDocument(root) && !isCollection(root)) {
    throw new Error('Root node must be a YAML Document or YAML Collection');
  }

  if (isWildcardPath(path)) {
    getMatchingPaths(root, path).forEach(([exactPath]) => {
      updateValueByPredicate(root, exactPath, where, newValue, cb);
    });

    return;
  }

  const oldNode = getIn(root, path, true);
  if (!isNode(oldNode)) {
    throw new Error(`Node at path "${path.join('.')}" is not a YAML Node`);
  }

  if (where(oldNode, path)) {
    updateValueByPath(root, path, newValue, cb);
  }
}

function updateValueByValue(root: Root, path: WildcardPath, oldValue: unknown, newValue: unknown, cb?: Callback) {
  return updateValueByPredicate(root, path, (node) => isEqualValues(node, oldValue), newValue, cb);
}

export default {
  toDoc,
  toYml,
  toJSON,
  toTypedValue,
  isEquals,
  isEqualValues,
  addIn,
  setIn,
  getSeqIn,
  getMapIn,
  isInSeq,
  deleteByPath,
  deleteByValue,
  deleteByPredicate,
  updateKeyByPath,
  updateKeyByPredicate,
  updateValueByPath,
  updateValueByValue,
  updateValueByPredicate,
  collectPaths,
  unflowEmptyCollection,
};
