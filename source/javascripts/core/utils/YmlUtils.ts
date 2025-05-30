/* eslint-disable no-param-reassign */

import { flattenObject, isEqual } from 'es-toolkit';
import { isEmpty } from 'es-toolkit/compat';
import {
  Document,
  isCollection,
  isDocument,
  isMap,
  isNode,
  isSeq,
  Node,
  parseDocument,
  stringify,
  visit,
  YAMLMap,
  YAMLSeq,
} from 'yaml';

import { BitriseYml } from '../models/BitriseYml';

type Root = Document | Node;
type Path = (string | number)[];
type WildcardPath = ('*' | string | number)[];
type Where = (node?: unknown) => boolean;
type Callback = (node: Node, path: Path) => void;

const SAFE_DELIMITER = '!#{{SAFE_DELIMITER}}#!';

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

function unflowEmptyCollection(node: unknown) {
  if (isCollection(node) && node.items.length === 0 && node.flow) {
    node.flow = false;
  }
}

function collectPaths(root: Root, pathWithWildcard: WildcardPath = []) {
  if (!isDocument(root) && !isCollection(root)) {
    throw new Error('Root node must be a YAML Document or YAML Collection');
  }

  const flattened = Object.keys(flattenObject(toJSON(root), { delimiter: SAFE_DELIMITER }));
  const escapedPath = pathWithWildcard.map((part) => part.toString().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'));
  const widlcardPattern = new RegExp(`^${escapedPath.join(SAFE_DELIMITER).replace(/\\\*/g, '.*')}$`);

  const filterMatchingPaths = (path: string) => widlcardPattern.test(path);
  const sortPathsInDescendingOrder = (a: string, b: string) => b.localeCompare(a);

  const splitPath = (path: string) => {
    return path.split(SAFE_DELIMITER).reduce((result, part) => {
      const item = !isNaN(Number(part)) && isSeq(root.getIn(result)) ? Number(part) : part;
      return [...result, item];
    }, [] as Path);
  };

  return flattened.filter(filterMatchingPaths).sort(sortPathsInDescendingOrder).map(splitPath);
}

function getMatchingPaths(root: Root, path: WildcardPath, keep: WildcardPath = [], strict = false): [Path, Path][] {
  const matchingPaths = collectPaths(root, path);
  const matchingKeeps = collectPaths(root, keep);

  return matchingPaths.map((p) => {
    if (strict) {
      return [p.splice(0, path.length), matchingKeeps.find((kp) => isEqual(p, kp))?.splice(0, keep.length) || keep];
    }
    return [p, matchingKeeps.find((kp) => isEqual(p, kp))?.splice(0, keep.length) || keep];
  });
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

function getSeqIn(root: Root, path: Path): YAMLSeq | undefined;
function getSeqIn(root: Root, path: Path, createIfNotExists: true): YAMLSeq;
function getSeqIn(root: Root, path: Path, createIfNotExists?: boolean): YAMLSeq | undefined;
function getSeqIn(root: Root, path: Path, createIfNotExists = false) {
  if (!isDocument(root) && !isCollection(root)) {
    throw new Error('Root node must be a YAML Document or YAML Collection');
  }

  if (!root.hasIn(path) && !createIfNotExists) {
    return undefined;
  }

  if (!root.hasIn(path) && createIfNotExists) {
    let parentPath = path.slice(0, -1);

    while (parentPath.length > 0 && !root.hasIn(parentPath)) {
      parentPath = parentPath.slice(0, -1);
    }

    unflowEmptyCollection(root.getIn(parentPath));
    root.setIn(path, new YAMLSeq());
  }

  const node = root.getIn(path, true);

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

  if (!root.hasIn(path) && !createIfNotExists) {
    return undefined;
  }

  if (!root.hasIn(path) && createIfNotExists) {
    let parentPath = path.slice(0, -1);

    while (parentPath.length > 0 && !root.hasIn(parentPath)) {
      parentPath = parentPath.slice(0, -1);
    }

    unflowEmptyCollection(root.getIn(parentPath));
    root.setIn(path, new YAMLMap());
  }

  const node = root.getIn(path, true);

  if (!isMap(node)) {
    throw new Error(`Expected a YAMLMap at path "${path.join('.')}", but found ${node?.constructor.name}`);
  }

  return node;
}

function deleteByPath(root: Root, path: WildcardPath, keep: WildcardPath = [], cb?: Callback) {
  if (!isDocument(root) && !isCollection(root)) {
    throw new Error('Root node must be a YAML Document or YAML Collection');
  }

  if (path.includes('*')) {
    getMatchingPaths(root, path, keep).forEach((matchingPaths) => {
      deleteByPath(root, ...matchingPaths, cb);
    });

    return;
  }

  const deletedNode = root.getIn(path, true);
  if (isNode(deletedNode) && root.deleteIn(path)) {
    cb?.(deletedNode, path);
  }

  const parentPath = path.slice(0, -1);
  const parentNode = root.getIn(parentPath, true);

  if (!isEqual(parentPath, keep) && isNode(parentNode) && isEmpty(toJSON(parentNode))) {
    deleteByPath(root, parentPath, keep, cb);
  }
}

function deleteByValue(root: Root, path: WildcardPath, value: unknown, keep: WildcardPath = [], cb?: Callback) {
  if (!isDocument(root) && !isCollection(root)) {
    throw new Error('Root node must be a YAML Document or YAML Collection');
  }

  if (path.includes('*')) {
    getMatchingPaths(root, path, keep, true).forEach((matchingPaths) => {
      deleteByValue(root, matchingPaths[0], value, matchingPaths[1], cb);
    });

    return;
  }

  const deletedNode = root.getIn(path, true);
  if (isEqual(isNode(deletedNode) ? toJSON(deletedNode) : deletedNode, value)) {
    deleteByPath(root, path, keep, cb);
  }
}

function deleteByPredicate(root: Root, path: WildcardPath, where: Where, keep: WildcardPath = [], cb?: Callback) {
  if (!isDocument(root) && !isCollection(root)) {
    throw new Error('Root node must be a YAML Document or YAML Collection');
  }

  if (path.includes('*')) {
    getMatchingPaths(root, path, keep, true).forEach((matchingPaths) => {
      deleteByPredicate(root, matchingPaths[0], where, matchingPaths[1], cb);
    });

    return;
  }

  if (where(root.getIn(path, true))) {
    deleteByPath(root, path, keep, cb);
  }
}

export default {
  toDoc,
  toYml,
  toJSON,
  isEquals,
  getSeqIn,
  getMapIn,
  deleteByPath,
  deleteByValue,
  deleteByPredicate,
  collectPaths,
};
