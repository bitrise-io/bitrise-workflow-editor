import { EntityIndex, EntityKind, TreeNode } from '@/core/models/Tree';
import EntityIndexService from '@/core/services/EntityIndexService';
import YmlUtils from '@/core/utils/YmlUtils';

const index: EntityIndex = {
  workflows: {
    test: [{ nodeId: 'n_local' }],
    release: [{ nodeId: 'n_pinned' }],
    build: [{ nodeId: 'n_root' }, { nodeId: 'n_module' }], // two layers: root overrides an included module
  },
  pipelines: {},
  stepBundles: {
    common: [{ nodeId: 'n_shared' }],
  },
};

describe('EntityIndexService', () => {
  describe('definitionsOf', () => {
    it('returns every definition in merge order (topmost first)', () => {
      expect(EntityIndexService.definitionsOf(index, 'workflows', 'build')).toEqual([
        { nodeId: 'n_root' },
        { nodeId: 'n_module' },
      ]);
    });

    it('returns an empty array for an unknown entity', () => {
      expect(EntityIndexService.definitionsOf(index, 'workflows', 'missing')).toEqual([]);
    });
  });

  describe('definingNodeId', () => {
    it('returns the top-most defining node id for a known entity', () => {
      expect(EntityIndexService.definingNodeId(index, 'workflows', 'test')).toBe('n_local');
      expect(EntityIndexService.definingNodeId(index, 'stepBundles', 'common')).toBe('n_shared');
      expect(EntityIndexService.definingNodeId(index, 'workflows', 'build')).toBe('n_root');
    });

    it('returns undefined for an unknown entity', () => {
      expect(EntityIndexService.definingNodeId(index, 'workflows', 'missing')).toBeUndefined();
      expect(EntityIndexService.definingNodeId(index, 'pipelines', 'anything')).toBeUndefined();
    });
  });

  describe('buildFromFiles', () => {
    function node(nodeId: string, includes: TreeNode[] = []): TreeNode {
      return {
        nodeId,
        path: `${nodeId}.yml`,
        contents: '',
        source: null,
        commitSha: 'sha',
        editable: true,
        includes,
      };
    }

    function file(contents: string) {
      return { ymlDocument: YmlUtils.toDoc(contents) };
    }

    it('orders multi-layer definitions highest-precedence-first: parent over includes, later sibling over earlier', () => {
      const tree = node('n_root', [node('n_module_a'), node('n_module_b')]);
      const files = {
        n_root: file(yaml`
          workflows:
            build: {}
        `),
        n_module_a: file(yaml`
          workflows:
            build: {}
            deploy: {}
        `),
        n_module_b: file(yaml`
          pipelines:
            release: {}
          workflows:
            build: {}
        `),
      };

      const result = EntityIndexService.buildFromFiles(tree, files);

      // Parent (n_root) wins over its includes; among siblings the later one (n_module_b) wins over the earlier (n_module_a).
      expect(result.workflows.build).toEqual([
        { nodeId: 'n_root' },
        { nodeId: 'n_module_b' },
        { nodeId: 'n_module_a' },
      ]);
      expect(result.workflows.deploy).toEqual([{ nodeId: 'n_module_a' }]);
      expect(result.pipelines.release).toEqual([{ nodeId: 'n_module_b' }]);
    });

    it('camelCases the step_bundles section into stepBundles', () => {
      const tree = node('n_root');
      const files = {
        n_root: file(yaml`
          step_bundles:
            common: {}
        `),
      };

      const result = EntityIndexService.buildFromFiles(tree, files);

      expect(result.stepBundles.common).toEqual([{ nodeId: 'n_root' }]);
    });

    it('indexes execution + service containers from the one containers map, layered highest-precedence-first', () => {
      const tree = node('n_root', [node('n_module')]);
      const files = {
        n_root: file(yaml`
          containers:
            node: { type: execution, image: node:18 }
        `),
        n_module: file(yaml`
          containers:
            node: { type: execution, image: node:20 }
            db: { type: service, image: postgres:16 }
        `),
      };

      const result = EntityIndexService.buildFromFiles(tree, files);

      // Parent (n_root) outranks the module it includes for the shared `node` id.
      expect(result.containers?.node).toEqual([{ nodeId: 'n_root' }, { nodeId: 'n_module' }]);
      expect(result.containers?.db).toEqual([{ nodeId: 'n_module' }]);
    });

    it('indexes project env vars (app.envs) by var name, layered across files', () => {
      const tree = node('n_root', [node('n_module')]);
      const files = {
        n_root: file(yaml`
          app:
            envs:
              - SHARED: from-root
        `),
        n_module: file(yaml`
          app:
            envs:
              - SHARED: from-module
              - MODULE_ONLY: { opts: { is_expand: false } }
        `),
      };

      const result = EntityIndexService.buildFromFiles(tree, files);

      expect(result.appEnvs?.SHARED).toEqual([{ nodeId: 'n_root' }, { nodeId: 'n_module' }]);
      expect(result.appEnvs?.MODULE_ONLY).toEqual([{ nodeId: 'n_module' }]);
    });

    describe('aliases and merge keys', () => {
      const build = (...lines: string[]) =>
        EntityIndexService.buildFromFiles(node('n_root'), { n_root: file([...lines, ''].join('\n')) });
      const ids = (result: EntityIndex, kind: EntityKind) => Object.keys(result[kind] ?? {});

      describe('in a section', () => {
        it('indexes an entity whose value is an alias, holds a merge key, or both', () => {
          const result = build(
            'x_shared: &shared',
            '  title: Shared',
            'x_title: &title Title',
            'workflows:',
            '  plain: {}',
            '  aliased: *shared',
            '  merged:',
            '    <<: *shared',
            '  merged_and_aliased: &merged_and_aliased',
            '    <<: *shared',
            '    title: *title',
            '  aliased_twice: *merged_and_aliased',
          );

          expect(ids(result, 'workflows')).toEqual([
            'plain',
            'aliased',
            'merged',
            'merged_and_aliased',
            'aliased_twice',
          ]);
        });

        it.each([
          ['an alias', '  <<: *first'],
          ['a list of aliases', '  <<: [*first, *second]'],
          ['an inline map', '  <<: { inline: {} }'],
        ])('skips merge key entities from %s', (_, mergeKey) => {
          const result = build(
            'x_first: &first',
            '  from_first: {}',
            'x_second: &second',
            '  from_second: {}',
            'workflows:',
            mergeKey,
            '  own: {}',
          );

          expect(ids(result, 'workflows')).toEqual(['own']);
        });

        it.each([
          ['quoted', '  "<<": {}'],
          ['string-tagged', '  !!str <<: {}'],
        ])('indexes a %s `<<` key as an entity', (_, key) => {
          expect(ids(build('workflows:', key), 'workflows')).toEqual(['<<']);
        });

        it('skips the whole section when it is an alias, and indexes the rest of the file', () => {
          const result = build(
            'x_defs: &defs',
            '  from_anchor: {}',
            'workflows: *defs',
            'app:',
            '  envs:',
            '  - KEPT: "1"',
          );

          expect(ids(result, 'workflows')).toEqual([]);
          expect(ids(result, 'appEnvs')).toEqual(['KEPT']);
        });
      });

      it('skips an aliased key in a section', () => {
        const tree = node('n_root', [node('n_broken')]);
        const files = {
          n_root: file('workflows:\n  root_wf: {}\n'),
          // With `stringKeys`, an alias used as a key is a parse error.
          n_broken: file('x_key: &key aliased_key\nworkflows:\n  *key : {}\n  broken_wf: {}\n'),
        };

        const result = EntityIndexService.buildFromFiles(tree, files);

        expect(files.n_broken.ymlDocument.errors).not.toHaveLength(0);
        expect(ids(result, 'workflows')).toEqual(['root_wf', 'broken_wf']);
      });

      it('indexes a key a service set, which is a plain string rather than a Scalar node', () => {
        const doc = YmlUtils.toDoc('workflows:\n  parsed: {}\n');
        YmlUtils.setIn(doc, ['workflows', 'set_by_service'], {});

        const result = EntityIndexService.buildFromFiles(node('n_root'), { n_root: { ymlDocument: doc } });

        expect(ids(result, 'workflows')).toEqual(['parsed', 'set_by_service']);
      });

      describe('in app.envs', () => {
        it('indexes a var whose value is an alias, and a var next to a merge key in its entry', () => {
          const result = build(
            'x_value: &value "1"',
            'x_entry: &entry',
            '  FROM_ENTRY: "2"',
            'x_opts: &opts',
            '  is_expand: false',
            'app:',
            '  envs:',
            '  - ALIASED_VALUE: *value',
            '    opts: *opts',
            '  - <<: *entry',
            '    OWN: "3"',
          );

          expect(ids(result, 'appEnvs')).toEqual(['ALIASED_VALUE', 'OWN']);
        });

        it.each([
          ['an aliased entry', '  - *entry'],
          ['an entry that is only a merge key', '  - <<: *entry'],
        ])('skips %s', (_, entry) => {
          const result = build('x_entry: &entry', '  FROM_ENTRY: "2"', 'app:', '  envs:', entry, '  - OWN: "3"');

          expect(ids(result, 'appEnvs')).toEqual(['OWN']);
        });

        it.each([
          ['the env list is an alias', 'x_envs: &envs\n- FROM_ANCHOR: "1"\napp:\n  envs: *envs'],
          ['app is an alias', 'x_app: &app\n  envs:\n  - FROM_ANCHOR: "1"\napp: *app'],
        ])('skips every var when %s, and indexes the rest of the file', (_, source) => {
          const result = build(source, 'workflows:', '  kept: {}');

          expect(ids(result, 'appEnvs')).toEqual([]);
          expect(ids(result, 'workflows')).toEqual(['kept']);
        });
      });
    });

    it('skips nodes without a loaded document and tolerates docs without entity sections', () => {
      const tree = node('n_root', [node('n_not_loaded')]);
      const files = {
        n_root: file(yaml`
          format_version: '13'
        `),
      };

      expect(EntityIndexService.buildFromFiles(tree, files)).toEqual({
        workflows: {},
        pipelines: {},
        stepBundles: {},
        containers: {},
        appEnvs: {},
      });
    });

    it('returns an empty index for an undefined tree', () => {
      expect(EntityIndexService.buildFromFiles(undefined, {})).toEqual({
        workflows: {},
        pipelines: {},
        stepBundles: {},
        containers: {},
        appEnvs: {},
      });
    });
  });

  describe('equals', () => {
    function makeIndex(): EntityIndex {
      return {
        workflows: { build: [{ nodeId: 'n_root' }, { nodeId: 'n_module' }] },
        pipelines: {},
        stepBundles: { common: [{ nodeId: 'n_shared' }] },
      };
    }

    it('returns true for structurally identical indexes (different object identity)', () => {
      expect(EntityIndexService.equals(makeIndex(), makeIndex())).toBe(true);
    });

    it('returns false when an entity is added or removed', () => {
      const b = makeIndex();
      b.workflows.deploy = [{ nodeId: 'n_root' }];
      expect(EntityIndexService.equals(makeIndex(), b)).toBe(false);

      const c = makeIndex();
      delete c.stepBundles.common;
      expect(EntityIndexService.equals(makeIndex(), c)).toBe(false);
    });

    it('returns false when an entity is renamed (same count, different ids)', () => {
      const b = makeIndex();
      delete b.workflows.build;
      b.workflows.test = [{ nodeId: 'n_root' }];
      expect(EntityIndexService.equals(makeIndex(), b)).toBe(false);
    });

    it('returns false when definition layers differ in length or order', () => {
      const shorter = makeIndex();
      shorter.workflows.build = [{ nodeId: 'n_root' }];
      expect(EntityIndexService.equals(makeIndex(), shorter)).toBe(false);

      const reordered = makeIndex();
      reordered.workflows.build = [{ nodeId: 'n_module' }, { nodeId: 'n_root' }];
      expect(EntityIndexService.equals(makeIndex(), reordered)).toBe(false);
    });
  });
});
