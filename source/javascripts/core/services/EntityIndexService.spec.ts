import { EntityIndex, TreeNode } from '@/core/models/Tree';
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

    it('accumulates multi-layer definitions in pre-order, so the top-most layer is first', () => {
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

      expect(result.workflows.build).toEqual([
        { nodeId: 'n_root' },
        { nodeId: 'n_module_a' },
        { nodeId: 'n_module_b' },
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
      });
    });

    it('returns an empty index for an undefined tree', () => {
      expect(EntityIndexService.buildFromFiles(undefined, {})).toEqual({
        workflows: {},
        pipelines: {},
        stepBundles: {},
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
