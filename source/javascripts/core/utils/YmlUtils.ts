/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { isEqual, isNil, isPrimitive } from 'es-toolkit';
import { isEmpty } from 'es-toolkit/compat';
import {
  Document,
  isAlias,
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

// yaml's `Document.toString()` (and therefore `stringify()` and our `toYml`) throws
// "Document with errors cannot be stringified" once a document has parse errors, and node
// `.toString()` in `isEquals` throws the same way. A malformed module would then crash every
// serialization/equality path that touches it (e.g. the multi-file language service serializing
// every include file on load). Documents can only be parse-invalid at load time — edits route
// invalid YAML to `__invalidYmlString`, never into a stored document — so the raw source stashed
// here at parse time is a lossless, throw-free fallback for that exact document.
const rawSourceByErrorDoc = new WeakMap<Document, string>();

/** The raw source for a parse-error document (stashed in `toDoc`), or undefined for a valid one. */
function rawErrorSource(root: Root): string | undefined {
  return isDocument(root) && root.errors.length > 0 ? rawSourceByErrorDoc.get(root) : undefined;
}

function toDoc(raw: string) {
  const doc = parseDocument(raw, {
    stringKeys: true,
    keepSourceTokens: true,
  });
  if (doc.errors.length > 0) {
    rawSourceByErrorDoc.set(doc, raw);
  }
  return doc;
}

function toYml(root: Root) {
  const rawError = rawErrorSource(root);
  if (rawError !== undefined) {
    return rawError;
  }

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
  return (root.toJSON() ?? {}) as BitriseYml;
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

  // Return original string unchanged
  return value;
}

function toNode(value: unknown, copyFlowOptionFrom?: unknown) {
  const flow = isCollection(copyFlowOptionFrom) && !isEmpty(toJSON(copyFlowOptionFrom)) && copyFlowOptionFrom.flow;
  return PLACEHOLDER_DOC.createNode(value, { flow, aliasDuplicateObjects: false });
}

const quoteNeededIfMatches = [
  /^(on|off|yes|no|y|n)$/i, // Boolean literals
  /^(\d+)(\.\d+){0,2}(-[\w.-]+)?(\+[\w.-]+)?$/, // Semver-like versions (e.g., 0.9, 1.0.0, 1.2.3-alpha)
  /^[-+]?(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][-+]?\d+)?$/, // Numbers
  /^[-+]?(?:0x[\da-fA-F]+|0o[0-7]+|0b[01]+)$/i, // Binary numbers, Octal numbers, Hexadecimal numbers
  /^[+-]?(\d+(\.\d+)?)([,_]\d+(\.\d+)?)+$/, // Comma or underscore separated numbers
  /^(\d+)(:\d+)+$/, // Time format (HH:MM:SS)
  /^[&*%?:|>[\]{}\-!#@].*$/, // Special characters that may require quoting
];

function toScalar(value: unknown, scalar?: unknown, stringToTypedValue = true): Scalar {
  const valueToWrite = stringToTypedValue ? toTypedValue(value) : value;
  let result: Scalar = new Scalar(valueToWrite);
  result.type = Scalar.PLAIN;

  if (isScalar(scalar)) {
    result = scalar;
    result.value = valueToWrite;
  }

  const useQuotes = quoteNeededIfMatches.some((regex) => regex.test(String(valueToWrite)));
  if (useQuotes && result.type === Scalar.PLAIN) {
    result.type = Scalar.QUOTE_DOUBLE;
  }

  return result;
}

function isWildcardPath(path: Path) {
  return path.includes('*');
}

function unflowEmptyCollection(node: unknown) {
  if (isCollection(node) && node.items.length === 0 && node.flow) {
    node.flow = false;
  }
}

// yaml's own `getIn`/`hasIn` stop at an alias node (`*anchor`) because an alias is not a collection,
// while `toJSON()` — what the UI renders from — expands aliases. The two views of the same document
// then disagree: the UI shows the aliased workflow/step/meta block, but every document-level read of
// it hands back the raw `Alias`, so callers expecting a map or a seq blow up on YAML the CLI accepts.
// Resolving aliases while walking a path keeps both views on the same data.
//
// Cached per root object, like `collectPaths`: safe because `updateBitriseYmlDocument` clones the
// document before mutating it, and nothing in the editor creates or moves an anchor.
const anchorLookupCache = new WeakMap<Root, Node[]>();

// Most callers hand these helpers a nested collection (a workflow, a step's option map) rather than
// the document, but an anchor is declared at the document level — outside that subtree. Resolving
// against the subtree alone would report a perfectly valid `*anchor` as absent, and on a
// `createIfNotExists` path that means overwriting the alias and dropping the data it points at.
//
// So remember which document a node came from. A nested root is always obtained by reading from the
// document first (there is no other way to get hold of it), so indexing a document the first time it
// is used as a root always happens before any nested call that needs it.
const documentByNode = new WeakMap<Node, Document>();
const indexedDocuments = new WeakSet<Document>();

// One walk per document version, seeding both indexes at once. On a 12k-line config that is ~20ms,
// paid once when the document is first read from — reads after it are unaffected.
function trackDocument(root: Root) {
  if (!isDocument(root) || indexedDocuments.has(root)) {
    return;
  }

  indexedDocuments.add(root);

  const anchored: Node[] = [];
  visit(root, {
    Node(_, node) {
      documentByNode.set(node, root);
      if (isAlias(node) || node.anchor) {
        anchored.push(node);
      }
    },
  });
  anchorLookupCache.set(root, anchored);
}

/** The document `root` belongs to, falling back to `root` itself when the owner isn't known. */
function aliasScope(root: Root): Root {
  if (isDocument(root)) {
    return root;
  }

  return documentByNode.get(root) ?? root;
}

function anchorLookupNodes(root: Root) {
  const cached = anchorLookupCache.get(root);
  if (cached) {
    return cached;
  }

  const nodes: Node[] = [];
  visit(root, {
    Node(_, node) {
      if (isAlias(node) || node.anchor) {
        nodes.push(node);
      }
    },
  });
  anchorLookupCache.set(root, nodes);

  return nodes;
}

/**
 * Resolves an alias node to the node its anchor is declared on — the last matching anchor before the
 * alias, as YAML defines it. Returns `node` unchanged when it isn't an alias, and `undefined` when
 * the anchor isn't reachable from `root`: a dangling alias, or an anchor declared outside `root`
 * when `root` is a nested collection rather than the whole document.
 */
function resolveAlias(root: Root, node: unknown) {
  if (!isAlias(node)) {
    return node;
  }

  let resolved: unknown;
  for (const candidate of anchorLookupNodes(aliasScope(root))) {
    if (candidate === node) {
      break;
    }
    if (candidate.anchor === node.source) {
      resolved = candidate;
    }
  }

  return resolved;
}

function rootCollection(root: Root) {
  return resolveAlias(root, isDocument(root) ? root.contents : root);
}

function getIn(root: Root, path: Path, keepScalar = false) {
  if (!isDocument(root) && !isCollection(root)) {
    throw new Error('Root node must be a YAML Document or YAML Collection');
  }

  if (isWildcardPath(path)) {
    throw new Error('Path cannot contain wildcards when getting a value');
  }

  trackDocument(root);

  if (isEmpty(path)) {
    return root;
  }

  let node = rootCollection(root);

  for (let i = 0; i < path.length; i += 1) {
    if (!isCollection(node)) {
      return undefined;
    }
    node = resolveAlias(root, node.get(path[i], true));
  }

  return !keepScalar && isScalar(node) ? node.value : node;
}

/**
 * The node stored at `path`, with an alias in the *final* segment left unresolved — `getIn` resolves
 * it, which is what reading a value wants, but not what "what is written here?" wants. A last-segment
 * alias is the value being replaced or refused, never a hop on the way to a deeper key.
 */
function getRawIn(root: Root, path: Path) {
  const parentPath = path.slice(0, -1);
  const parent = isEmpty(parentPath) ? rootCollection(root) : getIn(root, parentPath, true);

  return isCollection(parent) ? parent.get(path[path.length - 1], true) : undefined;
}

/**
 * yaml's own `setIn`/`deleteIn` walk the path with native traversal, which stops at an alias node:
 * writing to or deleting a path that passes *through* `*anchor` throws "Expected YAML collection at
 * <key>". This finds the anchored collection that blocks such a walk and returns it as a new root
 * plus the rest of the path, so the caller can retry against a path that is alias-free at that hop.
 * Writing there is writing to the anchored node — the same node the CLI and `toJSON()` see through
 * the alias, and shared with every other alias pointing at it.
 *
 * Returns `undefined` when the path needs no re-rooting: no alias blocks it, or the alias resolves
 * to something that isn't a collection (left to the native call to report).
 */
function rebaseThroughAlias(root: Root, path: Path) {
  let current: unknown = rootCollection(root);

  // Only interior segments matter; the final segment is assigned/deleted on its parent, and an
  // alias sitting there is simply the value being replaced.
  for (let i = 0; i < path.length - 1; i += 1) {
    if (!isCollection(current)) {
      return undefined;
    }

    const child = current.get(path[i], true);

    if (isAlias(child)) {
      const resolved = resolveAlias(root, child);
      return isCollection(resolved) ? { root: resolved, path: path.slice(i + 1) } : undefined;
    }

    current = child;
  }

  return undefined;
}

/** `Collection.deleteIn`, retried through any alias that blocks the native walk. */
function deleteIn(root: Root, path: Path): boolean {
  const rebased = rebaseThroughAlias(root, path);

  if (rebased) {
    return deleteIn(rebased.root, rebased.path);
  }

  return (isDocument(root) || isCollection(root)) && root.deleteIn(path);
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

  const rebased = rebaseThroughAlias(root, path);
  if (rebased) {
    setIn(rebased.root, rebased.path, value, stringToTypedValue);
    return;
  }

  // An empty document has no usable root collection, so a nested `setIn` throws "Expected a YAML
  // collection as document contents" — e.g. adding the first workflow to an empty module file. This
  // covers both shapes of "empty": freshly created (`contents` is `null`) and saved-then-reloaded
  // (an empty doc serializes to the literal `null`, which reparses to a null-valued Scalar). Seed a
  // root collection via `createNode` (not a bare `new YAMLMap()`) so it's schema-bound and
  // auto-creates intermediate nodes. The first path segment decides seq vs map.
  const isEmptyDocument =
    isDocument(root) && (root.contents == null || (isScalar(root.contents) && root.contents.value == null));
  if (isEmptyDocument) {
    // A numeric path segment is a seq index; a string key (even a numeric-looking '0') is a map key.
    const firstSegmentIsIndex = typeof path[0] === 'number' && Number.isInteger(path[0]) && path[0] >= 0;
    root.contents = root.createNode(firstSegmentIsIndex ? [] : {});
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

  // Read alias-blind: `toScalar` reuses the node it is handed by mutating it in place, so reusing
  // the node an alias resolves to would rewrite the anchor's own value — corrupting every other
  // reference to it — and then seat that same node at the alias position, declaring the anchor
  // twice. A last-segment alias is the value being replaced; there is nothing here to carry over.
  const rawNode = getRawIn(root, path);
  const existingNode = isAlias(rawNode) ? undefined : rawNode;
  const valueToWrite = stringToTypedValue ? toTypedValue(value) : value;

  if (isPrimitive(valueToWrite)) {
    root.setIn(path, toScalar(valueToWrite, existingNode, stringToTypedValue));
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

const collectPathsCache = new WeakMap<Root, Path[]>();

/**
 * Collects all paths in a YAML document.
 *
 * **IMPORTANT: Caching behavior**
 * - Results are cached using WeakMap with the root object as the key
 * - Cache is based on object identity, not document content
 * - Safe across mutations because `updateBitriseYmlDocument` clones the document before mutating
 * - **UNSAFE** if called multiple times within a single mutation transaction after in-place modifications
 *
 * @example
 * // ✅ SAFE: Cache invalidated by clone
 * updateBitriseYmlDocument(({ doc }) => {
 *   const paths = collectPaths(doc);  // First call caches
 *   YmlUtils.setIn(doc, ['new'], 'value');
 *   return doc;
 * });
 * // Next transaction gets a new clone, so new cache entry
 *
 * @example
 * // ⚠️ UNSAFE: Returns stale cached data
 * updateBitriseYmlDocument(({ doc }) => {
 *   const paths1 = collectPaths(doc);     // Caches result
 *   YmlUtils.setIn(doc, ['new'], 'value'); // Mutates doc in-place
 *   const paths2 = collectPaths(doc);     // Returns stale cache (missing 'new' field)
 *   return doc;
 * });
 */
function collectPaths(root: Root) {
  if (collectPathsCache.has(root)) {
    return collectPathsCache.get(root)!;
  }

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

  const paths = traverseAndCollectPaths(root.toJSON()).sort((a, b) => b.join('.').localeCompare(a.join('.')));

  collectPathsCache.set(root, paths);

  return paths;
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

  // NOTE: Using toString() for equality check instead of toYml() as it's faster
  // and sufficient for our use case since it preserves all node structure and formatting.
  // A parse-error document can't be stringified (yaml throws), so fall back to its raw source.
  const aStr = rawErrorSource(a) ?? a.toString();
  const bStr = rawErrorSource(b) ?? b.toString();
  aCache.set(b, aStr === bStr);

  return aCache.get(b)!;
}

function isEqualValues(a: unknown, b: unknown) {
  return isEqual(isNode(a) ? toJSON(a) : a, isNode(b) ? toJSON(b) : b);
}

/**
 * Whether a path holds nothing to read. A key written without a value (`meta:` on its own line, or a
 * bare `-` seq item) parses to a null scalar rather than to a missing key, so the key looks present
 * while there is no collection there. Both shapes mean "absent" to the collection getters.
 */
function isEmptyNode(node: unknown) {
  return isNil(node) || (isScalar(node) && isNil(node.value));
}

/**
 * Guards the `createIfNotExists` branch. An alias whose anchor cannot be found reads as "absent", but
 * creating a collection over it would delete whatever that anchor points at — silent data loss, and a
 * far worse outcome than the error the caller used to get. "Can't handle" is not "absent", so say so.
 *
 * An alias that *does* resolve, to an empty node, is a different story: there is no data behind it to
 * lose, so it falls through and the reference is replaced locally.
 *
 * Reads stay lenient (`undefined`) because they run during render, where throwing takes down the
 * page. Only the write path refuses, and it always runs inside a mutation.
 */
function assertResolvableBeforeCreate(root: Root, path: Path) {
  const rawNode = getRawIn(root, path);

  if (isAlias(rawNode) && resolveAlias(root, rawNode) === undefined) {
    throw new Error(`Cannot resolve alias "*${rawNode.source}" at path "${path.join('.')}"`);
  }
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

  let node = getIn(root, path, true);

  if (isEmptyNode(node)) {
    if (!createIfNotExists) {
      return undefined;
    }

    assertResolvableBeforeCreate(root, path);
    setIn(root, path, new YAMLSeq());
    node = getIn(root, path, true);
  }

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

  let node = getIn(root, path, true);

  if (isEmptyNode(node)) {
    if (!createIfNotExists) {
      return undefined;
    }

    assertResolvableBeforeCreate(root, path);
    setIn(root, path, new YAMLMap());
    node = getIn(root, path, true);
  }

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
  if (isNode(deletedNode) && deleteIn(root, path)) {
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
  toScalar,
  isEquals,
  isEqualValues,
  addIn,
  setIn,
  getIn,
  getSeqIn,
  getMapIn,
  resolveAlias,
  isInSeq,
  deleteByPath,
  deleteByValue,
  deleteByPredicate,
  updateKeyByPath,
  updateKeyByPredicate,
  updateValueByPath,
  updateValueByValue,
  updateValueByPredicate,
  getMatchingPaths,
  collectPaths,
  unflowEmptyCollection,
};
