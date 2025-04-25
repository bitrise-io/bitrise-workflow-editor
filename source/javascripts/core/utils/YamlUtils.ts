/* eslint-disable guard-for-in */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
import { isMatch } from 'picomatch';
import { Document, isMap, isScalar, isSeq, YAMLMap, YAMLSeq } from 'yaml';

type Args = { doc: Document; paths: string[] };

function getSeqIn(doc: Document, path: unknown[], force = false) {
  let seq = doc.getIn(path);

  if (!seq && force) {
    doc.setIn(path, doc.createNode([]));
    seq = doc.getIn(path);
  }

  return seq as YAMLSeq;
}

function getMapIn(doc: Document, path: unknown[], force = false) {
  let map = doc.getIn(path);

  if (!map && force) {
    doc.setIn(path, doc.createNode({}));
    map = doc.getIn(path);
  }

  return doc.getIn(path) as YAMLMap;
}

function safeDeleteIn(doc: Document, path: unknown[], recursive = false) {
  if (doc.hasIn(path)) {
    doc.deleteIn(path);
  }

  if (recursive) {
    const parentPath = path.slice(0, -1);
    const parent = doc.getIn(parentPath);

    if ((isSeq(parent) || isMap(parent)) && parent.items.length === 0) {
      safeDeleteIn(doc, parentPath, parentPath.length > 1);
    }
  }
}

function updateMapKey(map: YAMLMap, oldKey: string, newKey: string) {
  map.items = map.items.map((pair) => {
    if (isScalar(pair.key) && pair.key.value === oldKey) {
      pair.key.value = newKey;
    } else if (!isScalar(pair.key) && (pair.key as string).toString() === oldKey) {
      pair.key = newKey;
    }

    return pair;
  });
}

function areDocumentsEqual(a: Document, b: Document) {
  return a.toString() === b.toString();
}

function updateKey({ doc, paths }: Args, glob: string, newKey: string) {
  const filteredPaths = paths.filter((path) => isMatch(path, glob)).map((path) => path.split('.'));

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

function updateValue({ doc, paths }: Args, glob: string, newValue: unknown, oldValue?: unknown) {
  const filteredPaths = paths.filter((path) => isMatch(path, glob)).map((path) => path.split('.'));

  filteredPaths.forEach((path) => {
    const value = doc.getIn(path);

    if (value === oldValue || oldValue === undefined) {
      doc.setIn(path, newValue);
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

export default {
  getSeqIn,
  getMapIn,
  updateKey,
  updateValue,
  safeDeleteIn,
  updateMapKey,
  collectPaths,
  areDocumentsEqual,
};
