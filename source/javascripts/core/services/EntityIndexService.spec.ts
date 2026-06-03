import { EntityIndex } from '@/core/models/Tree';
import EntityIndexService from '@/core/services/EntityIndexService';

const index: EntityIndex = {
  workflows: {
    test: { nodeId: 'n_local' },
    release: { nodeId: 'n_pinned' },
  },
  pipelines: {},
  stepBundles: {
    common: { nodeId: 'n_shared' },
  },
};

describe('EntityIndexService', () => {
  describe('definingNodeId', () => {
    it('returns the defining node id for a known entity', () => {
      expect(EntityIndexService.definingNodeId(index, 'workflows', 'test')).toBe('n_local');
      expect(EntityIndexService.definingNodeId(index, 'stepBundles', 'common')).toBe('n_shared');
    });

    it('returns undefined for an unknown entity', () => {
      expect(EntityIndexService.definingNodeId(index, 'workflows', 'missing')).toBeUndefined();
      expect(EntityIndexService.definingNodeId(index, 'pipelines', 'anything')).toBeUndefined();
    });
  });

  describe('isGhost', () => {
    it('is true when the entity is defined in a different node', () => {
      expect(EntityIndexService.isGhost(index, 'workflows', 'release', 'n_local')).toBe(true);
    });

    it('is false when the entity is defined in the current node', () => {
      expect(EntityIndexService.isGhost(index, 'workflows', 'test', 'n_local')).toBe(false);
    });

    it('is false when the entity is not in the index', () => {
      expect(EntityIndexService.isGhost(index, 'workflows', 'missing', 'n_local')).toBe(false);
    });
  });
});
