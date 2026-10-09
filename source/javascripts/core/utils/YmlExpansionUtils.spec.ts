import { parseDocument } from 'yaml';

import YmlExpansionUtils, { type TextEdit } from './YmlExpansionUtils';

const expandAt = (text: string, search: string) => YmlExpansionUtils.expander(text)?.at(text.indexOf(search));

function expandAtText(text: string, search: string) {
  const result = expandAt(text, search);
  if (!result || 'error' in result) {
    throw new Error(`Expected an edit, got ${JSON.stringify(result)}`);
  }
  const { start, end, text: newText } = result.edit;
  return text.slice(0, start) + newText + text.slice(end);
}

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

    // The file is reviewed in diffs, so every other line keeps its bytes.
    it('edits only the line of the alias or merge key it expands', () => {
      ['<<: *defaults\n    steps', '<<: *defaults\n    meta', '*clone', '*shared_envs', '*test_steps'].forEach(
        (search) => {
          const { start, end } = (expandAt(BITRISE_YML, search) as { edit: TextEdit }).edit;
          const replaced = BITRISE_YML.slice(start, end).replace(/\n$/, '');

          expect(replaced).not.toContain('\n');
          expect(replaced).toContain(search.split('\n')[0]);
        },
      );
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
      expect(expandAt(text, '*b]')?.kind).toBe('merge-key');
    });

    it('expands a merge key of a map written in place, with no alias', () => {
      const text = "wf:\n  <<: { title: 'asd', description: 'dsa' } # note\n  title: own\n";

      expect(expandAtText(text, '<<')).toBe("wf:\n  # note\n  description: 'dsa'\n  title: own\n");
      expect(expandAtText('wf:\n  <<:\n    title: asd\n  x: 1\n', '<<')).toBe('wf:\n  title: asd\n  x: 1\n');
      expect(expandAtText("a: &a { k: 1 }\nwf:\n  <<: [{ title: 'asd' }, *a]\n", '<<')).toBe(
        "a: &a { k: 1 }\nwf:\n  title: 'asd'\n  k: 1\n",
      );
    });

    it('expands an alias in a block map or list, whatever it points at', () => {
      const base = 's: &s one\nm: &m { k: 1 }\nl: &l [a, b]\n';
      const expand = (text: string, search: string) => expandAtText(base + text, search).slice(base.length);

      expect(expand('list:\n- *s\n- *l\n', '*s\n')).toBe('list:\n- one\n- *l\n');
      expect(expand('list:\n- *s\n- *l\n', '*l\n')).toBe('list:\n- *s\n- [ a, b ]\n');
      expect(expand('map:\n  a: *l\n', '*l\n')).toBe('map:\n  a: [ a, b ]\n');
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
      expect(expandAtText(`${base}mid: &mid\n  <<: *base\nvalue: *mid\n`, '*mid')).toContain('value: {}\n');
      expect(expandAtText('value:\n  <<: {}\n', '<<')).toBe('value:\n  {}\n');
    });

    it("lets the map's own keys win over merged ones, and earlier merge sources over later ones", () => {
      const text = ['a: &a { x: 1, y: 1 }', 'b: &b { y: 2, z: 2 }', 'c:', '  <<: [*a, *b]', '  x: 0', ''].join('\n');

      expect(parseDocument(expandAtText(text, '<<')).toJS().c).toEqual({
        x: 0,
        y: 1,
        z: 2,
      });
    });

    it("lets a merged map's own keys win over the ones it merges itself", () => {
      const text = ['a: &a { k: 0, j: 0 }', 'b: &b', '  <<: *a', '  k: 1', 'c:', '  <<: *b', ''].join('\n');

      expect(parseDocument(expandAtText(text, '<<: *b')).toJS().c).toEqual({
        k: 1,
        j: 0,
      });
    });

    it('copies what an alias pointed at where it was, even when a later anchor reuses the name', () => {
      const text = ['x: &i 1', 't: &t [*i]', 'y: &i 2', 'u: *t', ''].join('\n');

      expect(parseDocument(expandAtText(text, '*t')).toJS().u).toEqual([1]);
    });

    // Its copy would have to drop its comments and fold onto one line.
    it('refuses an alias or merge key inside [ … ] or { … }', () => {
      const alias = {
        kind: 'alias',
        error: "An alias inside [ … ] or { … } can't be expanded.",
      };

      expect(expandAt('a: &a 1\nl: [*a]\n', '*a]')).toEqual(alias);
      expect(expandAt('a: &a 1\nm: { k: *a }\n', '*a }')).toEqual(alias);
      expect(expandAt('a: &a { k: 1 }\nm: { <<: *a }\n', '<<')).toEqual({
        kind: 'merge-key',
        error: "A merge key inside { … } can't be expanded.",
      });
    });

    // A sequence of maps too, as the CLI does.
    it.each(['1', '[a, b]', '[{ k: 1 }]'])('refuses a merge key that points at %s, rather than guessing', (value) => {
      const text = `a: &a ${value}\nb:\n  <<: *a\n`;

      expect(expandAt(text, '<<')).toEqual({
        kind: 'merge-key',
        error: 'A merge key (<<) must point at a map.',
      });
    });

    it('copies the key an anchor is on, since an anchor marks a node and a key is one', () => {
      const text = '&k name: one\nother: *k\n';

      expect(expandAtText(text, '*k')).toBe('&k name: one\nother: name\n');
    });

    it('offers nothing where there is no alias or merge key', () => {
      expect(expandAt('a: &a 1\nb: *a\n', 'a:')).toBeUndefined();
    });

    it('offers nothing for YAML that does not parse', () => {
      expect(expandAt('a: *missing\n', '*')).toBeUndefined();
    });
  });
});
