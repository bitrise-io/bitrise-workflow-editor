import { EntityIndex } from '@/core/models/Tree';
import EntityIndexService from '@/core/services/EntityIndexService';

const index: EntityIndex = {
  workflows: {
    test: [{ nodeId: 'n_local' }],
    release: [{ nodeId: 'n_pinned' }],
    // Defined in two layers: root overrides an included module.
    build: [{ nodeId: 'n_root' }, { nodeId: 'n_module' }],
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
      // Top-most of a multi-layer entity.
      expect(EntityIndexService.definingNodeId(index, 'workflows', 'build')).toBe('n_root');
    });

    it('returns undefined for an unknown entity', () => {
      expect(EntityIndexService.definingNodeId(index, 'workflows', 'missing')).toBeUndefined();
      expect(EntityIndexService.definingNodeId(index, 'pipelines', 'anything')).toBeUndefined();
    });
  });

  describe('isGhost', () => {
    it('is true when the entity is defined only in other nodes', () => {
      expect(EntityIndexService.isGhost(index, 'workflows', 'release', 'n_local')).toBe(true);
    });

    it('is false when the entity is defined in the current node', () => {
      expect(EntityIndexService.isGhost(index, 'workflows', 'test', 'n_local')).toBe(false);
    });

    it('is false when one of several layers lives in the current node', () => {
      // `build` is defined in n_root + n_module; scoped to either is local.
      expect(EntityIndexService.isGhost(index, 'workflows', 'build', 'n_module')).toBe(false);
      expect(EntityIndexService.isGhost(index, 'workflows', 'build', 'n_root')).toBe(false);
      // …but cross-file from anywhere else.
      expect(EntityIndexService.isGhost(index, 'workflows', 'build', 'n_other')).toBe(true);
    });

    it('is false when the entity is not in the index', () => {
      expect(EntityIndexService.isGhost(index, 'workflows', 'missing', 'n_local')).toBe(false);
    });
  });
});
