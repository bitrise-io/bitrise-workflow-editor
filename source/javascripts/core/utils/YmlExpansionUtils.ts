import {
  Alias,
  CST,
  Document,
  isAlias,
  isCollection,
  isMap,
  isNode,
  isPair,
  isScalar,
  isSeq,
  Node,
  Pair,
  Parser,
  Range,
  Scalar,
  visit,
  YAMLMap,
  YAMLSeq,
} from 'yaml';

import YmlUtils from './YmlUtils';

/** Replace `text.slice(start, end)` with `text`. */
export type TextEdit = { start: number; end: number; text: string };

export type Expansion = { edits: TextEdit[] } | { error: string };

type Site = { kind: 'alias' | 'merge-key'; edit: () => TextEdit };

type SiteExpansion = Expansion & { kind: Site['kind'] };

const joinComments = (...comments: (string | null | undefined)[]) => comments.filter(Boolean).join('\n') || undefined;

const keyOf = (pair: Pair) => String(isScalar(pair.key) ? pair.key.value : pair.key);

const ownKeys = (map: YAMLMap) => new Set(map.items.filter((item) => !YmlUtils.isMergeKey(item)).map(keyOf));

const isBlank = (char: string | undefined) => char === ' ' || char === '\t' || char === '\n' || char === '\r';

const isAnchor = (token: CST.Token): token is CST.SourceToken => token.type === 'anchor';

const lineStart = (text: string, offset: number) => text.lastIndexOf('\n', offset - 1) + 1;

/** Comments make no sense inside `[…]` or `{…}`, so a copy that goes there is plain and forced to flow style. */
function toFlow(node: unknown) {
  visit(node as Node, {
    Node(_, child) {
      if (isCollection(child)) {
        child.flow = true;
      }
      child.commentBefore = undefined;
      child.comment = undefined;
      child.spaceBefore = false;
    },
  });
}

/**
 * Rewrites the YAML aliases and merge keys of one file as text edits. Each edit replaces the lines of one
 * alias or merge key, and every other line keeps its bytes: the file is reviewed in diffs, and turning the
 * whole document back into text would re-quote and re-indent lines nobody touched.
 *
 * Copies are fully expanded, follow YAML 1.1 merge rules as the CLI does (the map's own keys win, then
 * earlier merge sources over later ones), never carry an anchor, and take the alias's comments, not the
 * anchor's.
 */
class Expander {
  private readonly sites = new Map<number, Site>();

  private readonly expansions = new Map<Site, SiteExpansion>();

  private allExpansion?: Expansion;

  // Keyed by offset, since a cloned alias keeps its range and the original is what it resolves from.
  private readonly targets: ReadonlyMap<number, Node>;

  private readonly options: ReturnType<typeof YmlUtils.stringifyOptions>;

  constructor(
    private readonly text: string,
    doc: Document,
  ) {
    this.options = YmlUtils.stringifyOptions(doc);
    this.targets = YmlUtils.aliasTargets(doc);

    visit(doc, {
      Pair: (_, pair, path) => {
        const range = YmlUtils.isMergeKey(pair) ? pair.key.range : undefined;
        if (!range) {
          return undefined;
        }
        const site: Site = { kind: 'merge-key', edit: () => this.mergeKeyEdit(pair as Pair<Scalar>, range, path) };
        this.sites.set(range[0], site);
        // The aliases a merge key points at are expanded with it.
        visit(pair.value as Node, {
          Alias: (__, alias) => {
            if (alias.range) {
              this.sites.set(alias.range[0], site);
            }
          },
        });
        return visit.SKIP;
      },
      Alias: (_, alias, path) => {
        const { range } = alias;
        if (range) {
          this.sites.set(range[0], { kind: 'alias', edit: () => this.aliasEdit(alias, range, path) });
        }
      },
    });
  }

  /**
   * The expansion of the alias or merge key starting at `offset`, its own copy and nothing else. Anchors
   * stay, even one this leaves unused. `undefined` if nothing there can be expanded. A merge key and the
   * aliases it points at share one expansion, the same object.
   */
  at(offset: number): SiteExpansion | undefined {
    const site = this.sites.get(offset);
    return site && this.expand(site);
  }

  /** The edits that expand every alias and merge key and drop every anchor. */
  all(): Expansion {
    this.allExpansion ??= this.expandAll();
    return this.allExpansion;
  }

  private expand(site: Site) {
    let expansion = this.expansions.get(site);
    if (!expansion) {
      try {
        expansion = { kind: site.kind, edits: [site.edit()] };
      } catch (error) {
        expansion = { kind: site.kind, error: (error as Error).message };
      }
      this.expansions.set(site, expansion);
    }
    return expansion;
  }

  private expandAll(): Expansion {
    const siteEdits: TextEdit[] = [];
    for (const site of new Set(this.sites.values())) {
      const expansion = this.expand(site);
      if ('error' in expansion) {
        return { error: expansion.error };
      }
      siteEdits.push(...expansion.edits);
    }
    // A merge key's `{ … }` already expands the aliases inside it.
    const edits = siteEdits.filter(
      (edit) => !siteEdits.some((other) => other !== edit && other.start <= edit.start && edit.end <= other.end),
    );

    // With every alias gone, every anchor is unused.
    const inEdit = (offset: number) => edits.some(({ start, end }) => offset >= start && offset < end);
    for (const token of new Parser().parse(this.text)) {
      if (token.type !== 'document') {
        continue;
      }
      const anchors = token.start.filter(isAnchor);
      CST.visit(token, (item) => {
        anchors.push(...item.start.filter(isAnchor), ...(item.sep ?? []).filter(isAnchor));
      });
      anchors.filter(({ offset }) => !inEdit(offset)).forEach((anchor) => edits.push(this.anchorEdit(anchor)));
    }

    return { edits: edits.sort((a, b) => a.start - b.start) };
  }

  /** Deletes an anchor and the blanks that would be left dangling, or its line if it was alone on one. */
  private anchorEdit({ offset, source }: CST.SourceToken): TextEdit {
    let start = offset;
    let end = offset + source.length;
    while (this.text[end] === ' ' || this.text[end] === '\t') {
      end += 1;
    }
    if (end === this.text.length || this.text[end] === '\n' || this.text[end] === '\r') {
      while (this.text[start - 1] === ' ' || this.text[start - 1] === '\t') {
        start -= 1;
      }
      if (start === lineStart(this.text, start) && end < this.text.length) {
        end = this.text.indexOf('\n', end) + 1;
      }
    }
    return { start, end, text: '' };
  }

  private aliasEdit(alias: Alias, [start, end, nodeEnd]: Range, path: readonly unknown[]) {
    const parent = path[path.length - 1];
    const copy = this.copy(alias, []);

    if (path.some((node) => isCollection(node) && node.flow)) {
      return { start, end, text: this.renderFlow(copy) };
    }

    if (isPair(parent)) {
      // With `stringKeys`, an alias used as a key is a parse error.
      if (!isScalar(parent.key) || !parent.key.range) {
        throw new Error("This alias can't be expanded.");
      }
      const key = parent.key.clone() as Scalar;
      key.anchor = undefined;
      key.commentBefore = undefined;
      key.spaceBefore = false;
      this.takeAliasComments(alias, copy, key);
      const map = new YAMLMap();
      map.items = [new Pair(key, copy)];
      return this.blockEdit(parent.key.range[0], nodeEnd, map);
    }

    // A block sequence item: the edit starts at its `-`.
    const dash = this.skipBlanksBack(start);
    if (!isSeq(parent) || this.text[dash - 1] !== '-') {
      throw new Error("This alias can't be expanded.");
    }
    this.takeAliasComments(alias, copy);
    const seq = new YAMLSeq();
    seq.items = [copy];
    return this.blockEdit(dash - 1, nodeEnd, seq);
  }

  private mergeKeyEdit(pair: Pair<Scalar>, [keyStart, , keyEnd]: Range, path: readonly unknown[]) {
    const map = path[path.length - 1] as YAMLMap;
    // In `{ <<: *a, k: v }` the whole `{ … }` is rewritten, with everything in it expanded.
    if (map.flow && map.range) {
      return { start: map.range[0], end: map.range[1], text: this.renderFlow(this.copy(map, [])) };
    }

    // The map's own keys win. A second merge key in the same map is a duplicate key, so a parse error.
    const seen = ownKeys(map);
    const pairs = this.mergedPairs(pair, [map], seen);

    const value = isNode(pair.value) ? pair.value : undefined;
    const nodeEnd = value?.range?.[2] ?? keyEnd;
    // The comments on the merge key's own lines. The ones above it stay where they are.
    const comment = joinComments(pair.key.comment, value?.commentBefore, value?.comment);

    if (pairs.length > 0) {
      pairs[0].key.commentBefore = joinComments(comment, pairs[0].key.commentBefore);
      pairs[0].key.spaceBefore = false;
      const merged = new YAMLMap();
      merged.items = pairs;
      return this.blockEdit(keyStart, nodeEnd, merged);
    }

    const end = this.skipBlanksBack(nodeEnd);
    // It merges nothing and is the map's only key: the map stays, empty, rather than turning into null.
    if (map.items.length === 1) {
      return this.indented(keyStart, end, comment ? `${comment.replace(/^/gm, '#')}\n{}` : '{}');
    }

    // Every key it merges is shadowed: keep only its comment, or delete it with its line.
    if (comment) {
      return this.indented(keyStart, end, comment.replace(/^/gm, '#'));
    }
    const start = lineStart(this.text, keyStart);
    if (this.text.slice(start, keyStart).trim() === '') {
      const next = this.text.indexOf('\n', end);
      return { start, end: next === -1 ? this.text.length : next + 1, text: '' };
    }
    // `- <<: *a` keeps the `-`, and the item's next key stays where it was.
    return { start: this.skipBlanksBack(keyStart), end, text: '' };
  }

  /** The pairs a merge key adds that `seen` doesn't have yet, in order. Adds their keys to `seen`. */
  private mergedPairs(pair: Pair, stack: Node[], seen: Set<string>): Pair<Scalar>[] {
    const sources = isSeq(pair.value) ? pair.value.items : [pair.value];
    return sources
      .flatMap((source) => {
        const map = isAlias(source) ? this.target(source, stack) : source;
        if (!isMap(map)) {
          throw new Error('A merge key (<<) must point at a map.');
        }
        if (stack.includes(map)) {
          throw new Error("A merge key that merges the map it's in can't be expanded.");
        }
        return this.copyPairs(map, [...stack, map]);
      })
      .filter((source) => {
        const key = keyOf(source);
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
  }

  /** The pairs of `map` once its merge keys are expanded, each a full copy. */
  private copyPairs(map: YAMLMap, stack: Node[]) {
    const seen = ownKeys(map);
    return map.items.flatMap((item) => {
      if (YmlUtils.isMergeKey(item)) {
        return this.mergedPairs(item, stack, seen);
      }
      const copy = new Pair(this.copy(item.key, stack), this.copy(item.value, stack));
      if (isAlias(item.value) && isScalar(copy.key)) {
        this.takeAliasComments(item.value, copy.value, copy.key);
      }
      return [copy as Pair<Scalar>];
    });
  }

  private target(alias: Alias, stack: Node[]) {
    const target = alias.range && this.targets.get(alias.range[0]);
    if (!target || stack.includes(target)) {
      throw new Error(`The alias *${alias.source} can't be expanded.`);
    }
    return target;
  }

  /** A full copy of `node`: every alias inside it expanded, every merge key resolved, no anchors. */
  private copy(node: unknown, stack: Node[]): unknown {
    if (isAlias(node)) {
      const target = this.target(node, stack);
      const copy = this.copy(target, [...stack, target]) as Node;
      // The anchor's own comments stay where the anchor is.
      copy.commentBefore = undefined;
      copy.comment = undefined;
      copy.spaceBefore = false;
      return copy;
    }
    if (!isNode(node)) {
      return node;
    }
    // Shallow, as yaml's own `clone()` is for a scalar. A collection's `clone()` would deep-copy the
    // items this replaces with copies of their own.
    const copy = Object.create(Object.getPrototypeOf(node), Object.getOwnPropertyDescriptors(node)) as Node;
    copy.anchor = undefined;
    if (isMap(node)) {
      (copy as YAMLMap).items = this.copyPairs(node, stack);
    } else if (isSeq(node)) {
      (copy as YAMLSeq).items = node.items.map((item) => {
        const itemCopy = this.copy(item, stack);
        if (isAlias(item)) {
          this.takeAliasComments(item, itemCopy);
        }
        return itemCopy;
      });
    }
    return copy;
  }

  /** A copy takes the alias's comments. `steps: *shared # note` keeps the note on the `steps:` line. */
  private takeAliasComments(alias: Node, copy: unknown, key?: Scalar) {
    if (!isNode(copy)) {
      return;
    }
    copy.commentBefore = alias.commentBefore;
    copy.spaceBefore = alias.spaceBefore;
    if (!alias.comment) {
      return;
    }
    if (!isCollection(copy)) {
      copy.comment = alias.comment;
    } else if (key && !key.comment) {
      key.comment = alias.comment;
    } else {
      copy.commentBefore = joinComments(copy.commentBefore, alias.comment);
    }
  }

  private renderFlow(copy: unknown) {
    toFlow(copy);
    const seq = new YAMLSeq();
    seq.flow = true;
    seq.items = [copy];
    return this.render(seq, { lineWidth: 0 }).trim().slice(1, -1).trim();
  }

  private render(node: Node, options: { lineWidth?: number } = {}) {
    const doc = new Document();
    doc.contents = node;
    // The copy's aliases are expanded, but the ones a single expansion leaves around it aren't in `doc`.
    return doc.toString({ ...this.options, verifyAliasOrder: false, ...options }).replace(/\n+$/, '');
  }

  /** Replaces `start` up to the end of `nodeEnd`'s line with `node`, rendered at `start`'s column. */
  private blockEdit(start: number, nodeEnd: number, node: Node) {
    return this.indented(start, this.skipBlanksBack(nodeEnd), this.render(node));
  }

  private indented(start: number, end: number, text: string): TextEdit {
    const indent = ' '.repeat(start - lineStart(this.text, start));
    return { start, end, text: text.replace(/\n(?=.)/g, `\n${indent}`) };
  }

  /**
   * The offset before the blanks that end at `offset`. A node's end runs past its trailing comment and
   * newline, and an edit ends at the comment.
   */
  private skipBlanksBack(offset: number) {
    let start = offset;
    while (start > 0 && isBlank(this.text[start - 1])) {
      start -= 1;
    }
    return start;
  }
}

/** The expansions of the aliases and merge keys in `text`, or `undefined` if it doesn't parse. */
function expander(text: string) {
  const doc = YmlUtils.toDoc(text);
  return doc.errors.length > 0 ? undefined : new Expander(text, doc);
}

export default { expander };
