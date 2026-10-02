import { parseDocument } from 'yaml';

import YmlExpansionUtils, { type TextEdit } from './YmlExpansionUtils';
import YmlUtils from './YmlUtils';

const expandAt = (text: string, offset: number) => YmlExpansionUtils.expander(text)?.at(offset);

const expandAll = (text: string) => YmlExpansionUtils.expander(text)?.all();

const applyEdits = (text: string, edits: TextEdit[]) =>
  [...edits]
    .sort((a, b) => b.start - a.start)
    .reduce((result, { start, end, text: newText }) => result.slice(0, start) + newText + result.slice(end), text);

const resolved = (text: string) => parseDocument(text, { merge: true }).toJS();

// Throws on any alias and keeps `<<` as a plain key, so it only equals `resolved` once neither is left.
const literal = (text: string) => parseDocument(text, { merge: false }).toJS({ maxAliasCount: 0 });

const remaining = (text: string) => YmlUtils.findAliasesAndMergeKeys(YmlUtils.toDoc(text));

function expandAllText(text: string) {
  const result = expandAll(text);
  if (!result || 'error' in result) {
    throw new Error(`Expected edits, got ${JSON.stringify(result)}`);
  }
  return applyEdits(text, result.edits);
}

function expandAtText(text: string, search: string) {
  const result = expandAt(text, text.indexOf(search));
  if (!result || 'error' in result) {
    throw new Error(`Expected edits, got ${JSON.stringify(result)}`);
  }
  return applyEdits(text, result.edits);
}

// Odd quoting and spacing, padded and unpadded flow collections, both sequence indents, comments and
// block scalars, so a reformatted line shows up as a diff.
const CORPUS = `format_version: '11'
# top comment
app:
  envs: &app_envs
  - A: "double"   # odd spacing
  - B: 'single'
_shared: &shared   # anchor comment
  steps: &steps
    - git-clone@8: {}
    - script@1:
        inputs:
        - content: |-
            echo "hi"
            echo 'there'
  meta: {stack: xcode, machine: [m1,  m2]}
  description: >-
    folded
    text
workflows:
  primary:
    <<: *shared # inline merge
    envs: *app_envs
  deploy:
    # before merge
    <<: [*shared, {extra: 1}]
    steps:
    - *steps # whole list
    - [ *steps, x ]
  other:
    "<<": not a merge key
    steps: *steps
    flow: {a: *app_envs, b: 2}
`;

// The patterns Bitrise configs use most: shared workflow settings through a merge key, a shared step,
// a shared step list and shared envs.
const BITRISE_YML = `format_version: '13'
_defaults: &defaults
  meta:
    bitrise.io:
      stack: osx-xcode-16.0.x
      machine_type_id: g2.mac.medium
  envs: &shared_envs
  - PROJECT: App.xcodeproj
  - SCHEME: App
_steps:
  clone: &clone
    git-clone@8:
      inputs:
      - clone_depth: 1
  test_steps: &test_steps
  - xcode-test@6:
      inputs:
      - scheme: $SCHEME
workflows:
  test:
    <<: *defaults
    steps:
    - *clone
    - xcode-test@6: {}
  deploy:
    <<: *defaults
    meta:
      bitrise.io:
        stack: linux
    envs: *shared_envs
    steps: *test_steps
`;

describe('YmlExpansionUtils', () => {
  describe('common Bitrise patterns', () => {
    const workflows = (text: string) => text.slice(text.indexOf('workflows:'));

    it('expands shared workflow settings, letting the workflow override whole keys', () => {
      expect(workflows(expandAtText(BITRISE_YML, '<<: *defaults\n    steps'))).toBe(`workflows:
  test:
    meta:
      bitrise.io:
        stack: osx-xcode-16.0.x
        machine_type_id: g2.mac.medium
    envs:
    - PROJECT: App.xcodeproj
    - SCHEME: App
    steps:
    - *clone
    - xcode-test@6: {}
  deploy:
    <<: *defaults
    meta:
      bitrise.io:
        stack: linux
    envs: *shared_envs
    steps: *test_steps
`);
      // A merge is shallow: deploy's own meta replaces the shared one, so its merge key adds nothing.
      expect(workflows(expandAtText(BITRISE_YML, '<<: *defaults\n    meta'))).toContain(
        '  deploy:\n    meta:\n      bitrise.io:\n        stack: linux\n    envs: *shared_envs\n',
      );
    });

    it('expands a shared step into the list it is in', () => {
      expect(workflows(expandAtText(BITRISE_YML, '*clone'))).toContain(
        '    steps:\n    - git-clone@8:\n        inputs:\n        - clone_depth: 1\n    - xcode-test@6: {}\n',
      );
    });

    it('expands a shared step list and shared envs', () => {
      expect(workflows(expandAtText(BITRISE_YML, '*test_steps'))).toContain(
        '    steps:\n    - xcode-test@6:\n        inputs:\n        - scheme: $SCHEME\n',
      );
      expect(workflows(expandAtText(BITRISE_YML, '*shared_envs'))).toContain(
        '    envs:\n    - PROJECT: App.xcodeproj\n    - SCHEME: App\n    steps: *test_steps\n',
      );
    });

    it('expands all of them, and the config means the same', () => {
      const expanded = expandAllText(BITRISE_YML);

      expect(literal(expanded)).toEqual(resolved(BITRISE_YML));
      expect(workflows(expanded)).toBe(`workflows:
  test:
    meta:
      bitrise.io:
        stack: osx-xcode-16.0.x
        machine_type_id: g2.mac.medium
    envs:
    - PROJECT: App.xcodeproj
    - SCHEME: App
    steps:
    - git-clone@8:
        inputs:
        - clone_depth: 1
    - xcode-test@6: {}
  deploy:
    meta:
      bitrise.io:
        stack: linux
    envs:
    - PROJECT: App.xcodeproj
    - SCHEME: App
    steps:
    - xcode-test@6:
        inputs:
        - scheme: $SCHEME
`);
    });
  });

  describe('expandAll', () => {
    it('leaves no alias, merge key or anchor, and resolves to the same values', () => {
      const expanded = expandAllText(CORPUS);

      expect(literal(expanded)).toEqual(resolved(CORPUS));
      expect(remaining(expanded)).toEqual([]);
      expect(YmlUtils.toDoc(expanded).errors).toEqual([]);
      expect(expanded).not.toMatch(/&\w/);
      expect(expandAll(expanded)).toEqual({ edits: [] });
    });

    it('only edits the lines that have an alias, a merge key or an anchor', () => {
      const result = expandAll(CORPUS) as { edits: { start: number; end: number }[] };

      result.edits.forEach(({ start, end }) => {
        const line = CORPUS.slice(CORPUS.lastIndexOf('\n', start - 1) + 1, CORPUS.indexOf('\n', start));
        expect(line).toMatch(/[*&]|<<:/);
        expect(CORPUS.slice(start, end).replace(/\n$/, '')).not.toContain('\n');
      });
    });

    it('keeps the expanded file readable', () => {
      expect(expandAllText(CORPUS)).toBe(`format_version: '11'
# top comment
app:
  envs:
  - A: "double"   # odd spacing
  - B: 'single'
_shared: # anchor comment
  steps:
    - git-clone@8: {}
    - script@1:
        inputs:
        - content: |-
            echo "hi"
            echo 'there'
  meta: {stack: xcode, machine: [m1,  m2]}
  description: >-
    folded
    text
workflows:
  primary:
    # inline merge
    steps:
    - git-clone@8: {}
    - script@1:
        inputs:
        - content: |-
            echo "hi"
            echo 'there'
    meta: { stack: xcode, machine: [ m1, m2 ] }
    description: >-
      folded text
    envs:
    - A: "double" # odd spacing
    - B: 'single'
  deploy:
    # before merge
    meta: { stack: xcode, machine: [ m1, m2 ] }
    description: >-
      folded text
    extra: 1
    steps:
    # whole list
    - - git-clone@8: {}
      - script@1:
          inputs:
          - content: |-
              echo "hi"
              echo 'there'
    - [ [ { git-clone@8: {} }, { script@1: { inputs: [ { content: "echo \\"hi\\"\\necho 'there'" } ] } } ], x ]
  other:
    "<<": not a merge key
    steps:
    - git-clone@8: {}
    - script@1:
        inputs:
        - content: |-
            echo "hi"
            echo 'there'
    flow: {a: [ { A: "double" }, { B: 'single' } ], b: 2}
`);
    });

    it('deletes the line of an anchor that was alone on it', () => {
      expect(expandAllText('a:\n  # note\n  &a\n  k: 1\nb: *a\n')).toBe('a:\n  # note\n  k: 1\nb:\n  k: 1\n');
      expect(expandAllText('a: &a\n  k: 1\nb: *a\n')).toBe('a:\n  k: 1\nb:\n  k: 1\n');
    });

    it("lets the map's own keys win over merged ones, and earlier merge sources over later ones", () => {
      const text = ['a: &a { x: 1, y: 1 }', 'b: &b { y: 2, z: 2 }', 'c:', '  <<: [*a, *b]', '  x: 0', ''].join('\n');

      expect(parseDocument(expandAllText(text)).toJS().c).toEqual({ x: 0, y: 1, z: 2 });
    });

    it("lets a merged map's own keys win over the ones it merges itself", () => {
      const text = ['a: &a { k: 0, j: 0 }', 'b: &b', '  <<: *a', '  k: 1', 'c:', '  <<: *b', ''].join('\n');

      expect(parseDocument(expandAllText(text)).toJS().c).toEqual({ k: 1, j: 0 });
    });

    it('copies what an alias pointed at where it was, even when a later anchor reuses the name', () => {
      const text = ['x: &i 1', 't: &t [*i]', 'y: &i 2', 'u: *t', ''].join('\n');

      expect(parseDocument(expandAllText(text)).toJS()).toEqual({ x: 1, t: [1], y: 2, u: [1] });
    });

    it('refuses a merge key that does not point at a map, rather than guessing', () => {
      expect(expandAll('a: &a 1\nb:\n  <<: *a\n')).toEqual({ error: 'A merge key (<<) must point at a map.' });
    });

    it('offers nothing for YAML that does not parse', () => {
      expect(expandAll('a: *missing\n')).toBeUndefined();
    });
  });

  describe('expandAt', () => {
    it('expands only the alias at the offset, and keeps the anchor', () => {
      const text = 'a: &a\n  k: 1\nb: *a\nc: *a\n';

      expect(expandAtText(text, '*a\nc')).toBe('a: &a\n  k: 1\nb:\n  k: 1\nc: *a\n');
    });

    it('expands the alias a copy contains too', () => {
      const text = 'a: &a 1\nb: &b [*a, 2]\nc: *b\n';

      expect(expandAtText(text, '*b')).toBe('a: &a 1\nb: &b [*a, 2]\nc: [ 1, 2 ]\n');
    });

    it('expands a merge key from its own position or from an alias it points at', () => {
      const text = 'a: &a { k: 1 }\nb: &b { j: 2 }\nc:\n  <<: [*a, *b]\n';
      const expanded = 'a: &a { k: 1 }\nb: &b { j: 2 }\nc:\n  k: 1\n  j: 2\n';

      expect(expandAtText(text, '<<')).toBe(expanded);
      expect(expandAtText(text, '*b]')).toBe(expanded);
      expect(expandAt(text, text.indexOf('*b]'))?.kind).toBe('merge-key');
    });

    it('expands a merge key of a map written in place, with no alias', () => {
      const text = "wf:\n  <<: { title: 'asd', description: 'dsa' } # note\n  title: own\n";

      expect(expandAtText(text, '<<')).toBe("wf:\n  # note\n  description: 'dsa'\n  title: own\n");
      expect(expandAtText('wf:\n  <<:\n    title: asd\n  x: 1\n', '<<')).toBe('wf:\n  title: asd\n  x: 1\n');
      expect(expandAtText("a: &a { k: 1 }\nwf:\n  <<: [{ title: 'asd' }, *a]\n", '<<')).toBe(
        "a: &a { k: 1 }\nwf:\n  title: 'asd'\n  k: 1\n",
      );
      expect(expandAtText("wf: { <<: { title: 'asd' }, x: 1 }\n", '<<')).toBe("wf: { title: 'asd', x: 1 }\n");
      expect(remaining(expandAllText(text))).toEqual([]);
    });

    it('expands an alias in a map or a list of either style, whatever it points at', () => {
      const base = 's: &s one\nm: &m { k: 1 }\nl: &l [a, b]\n';
      const expand = (text: string, search: string) => expandAtText(base + text, search).slice(base.length);

      expect(expand('list:\n- *s\n- *l\n', '*s\n')).toBe('list:\n- one\n- *l\n');
      expect(expand('list:\n- *s\n- *l\n', '*l\n')).toBe('list:\n- *s\n- [ a, b ]\n');
      expect(expand('list: [*s, *m, *l]\n', '*s,')).toBe('list: [one, *m, *l]\n');
      expect(expand('list: [*s, *m, *l]\n', '*m,')).toBe('list: [*s, { k: 1 }, *l]\n');
      expect(expand('list: [*s, *m, *l]\n', '*l]')).toBe('list: [*s, *m, [ a, b ]]\n');
      expect(expand('map:\n  a: *l\n', '*l\n')).toBe('map:\n  a: [ a, b ]\n');
      expect(expand('map: { a: *m, b: *l }\n', '*m,')).toBe('map: { a: { k: 1 }, b: *l }\n');
    });

    it('turns an alias in a block sequence into an item', () => {
      const text = 'a: &a\n  k: 1\n  j: 2\nlist:\n  - x\n  - *a\n';

      expect(expandAtText(text, '*a\n')).toBe('a: &a\n  k: 1\n  j: 2\nlist:\n  - x\n  - k: 1\n    j: 2\n');
    });

    it("gives a copy the alias's comments, and leaves the anchor's comments where the anchor was", () => {
      const text = ['s: &s 1 # anchor', 't: *s # alias', 'x: &x # shared', '- one', 'y:', '  steps: *x # uses x', ''];

      expect(expandAtText(text.join('\n'), '*s #')).toContain('t: 1 # alias\n');
      expect(expandAtText(text.join('\n'), '*x #')).toContain('y:\n  steps: # uses x\n  - one\n');
    });

    it("keeps a merge key's comments, and deletes its line when every key it merges is shadowed", () => {
      const text = ['b: &b { k: 1, j: 1 }', 'm:', '  a: 1', '', '  # about', '  <<: *b # inline', '  k: 2', ''];

      expect(expandAtText(text.join('\n'), '<<')).toBe(
        ['b: &b { k: 1, j: 1 }', 'm:', '  a: 1', '', '  # about', '  # inline', '  j: 1', '  k: 2', ''].join('\n'),
      );
      expect(expandAtText('b: &b { k: 1 }\nm:\n  <<: *b # inline\n  k: 2\n', '<<')).toBe(
        'b: &b { k: 1 }\nm:\n  # inline\n  k: 2\n',
      );
      expect(expandAtText('b: &b { k: 1 }\nm:\n  <<: *b\n  k: 2\n', '<<')).toBe('b: &b { k: 1 }\nm:\n  k: 2\n');
      expect(expandAtText('b: &b { k: 1 }\nm:\n- <<: *b\n  k: 2\n', '<<')).toBe('b: &b { k: 1 }\nm:\n-\n  k: 2\n');
    });

    it('keeps a map empty, not null, when its only key is a merge key that adds nothing', () => {
      const base = 'base: &base {}\n';

      expect(expandAtText(`${base}value:\n  <<: *base\n`, '<<')).toBe(`${base}value:\n  {}\n`);
      expect(expandAtText(`${base}value:\n  <<: *base # note\n`, '<<')).toBe(`${base}value:\n  # note\n  {}\n`);
      expect(expandAtText(`${base}list:\n- <<: *base\n`, '<<')).toBe(`${base}list:\n- {}\n`);
      expect(expandAtText(`${base}value: { <<: *base }\n`, '<<')).toBe(`${base}value: {}\n`);
      expect(expandAtText(`${base}mid: &mid\n  <<: *base\nvalue: *mid\n`, '*mid')).toContain('value: {}\n');
      expect(expandAtText('value:\n  <<: {}\n', '<<')).toBe('value:\n  {}\n');

      const text = `${base}value:\n  <<: *base\nlist:\n- <<: *base\n`;
      expect(literal(expandAllText(text))).toEqual(resolved(text));
    });

    it('rewrites the { … } a merge key is in, with everything in it expanded', () => {
      const text = 'a: &a { k: 1, j: 1 }\nb: &b 2\nc: { <<: *a, j: *b } # note\n';

      expect(expandAtText(text, '<<')).toBe('a: &a { k: 1, j: 1 }\nb: &b 2\nc: { k: 1, j: 2 } # note\n');
      expect(expandAtText(text, '*b }')).toBe('a: &a { k: 1, j: 1 }\nb: &b 2\nc: { <<: *a, j: 2 } # note\n');
      expect(expandAllText(text)).toBe('a: { k: 1, j: 1 }\nb: 2\nc: { k: 1, j: 2 } # note\n');
    });

    it('refuses what it would have to guess at', () => {
      expect(expandAt('a: &a 1\nb:\n  <<: *a\n', 13)).toEqual({
        kind: 'merge-key',
        error: 'A merge key (<<) must point at a map.',
      });
    });

    it('refuses a merge key that points at a sequence, even one of maps, as the CLI does', () => {
      const error = { kind: 'merge-key', error: 'A merge key (<<) must point at a map.' };

      expect(expandAt('l: &l [a, b]\nm:\n  <<: *l\n', 'l: &l [a, b]\nm:\n  '.length)).toEqual(error);
      expect(expandAt('l: &l [{ k: 1 }]\nm:\n  <<: *l\n', 'l: &l [{ k: 1 }]\nm:\n  '.length)).toEqual(error);
    });

    it('copies the key an anchor is on, since an anchor marks a node and a key is one', () => {
      const text = '&k name: one\nother: *k\n';

      expect(expandAtText(text, '*k')).toBe('&k name: one\nother: name\n');
      expect(expandAllText(text)).toBe('name: one\nother: name\n');
    });

    it('offers nothing where there is no alias or merge key', () => {
      expect(expandAt('a: &a 1\nb: *a\n', 0)).toBeUndefined();
    });
  });
});
