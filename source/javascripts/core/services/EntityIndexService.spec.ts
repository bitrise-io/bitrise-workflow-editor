import { EntityIndex } from '@/core/models/Tree';
import EntityIndexService from '@/core/services/EntityIndexService';

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
});
