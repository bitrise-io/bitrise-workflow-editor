import { TreeNode } from '@/core/models/Tree';
import TreeService from '@/core/services/TreeService';

function node(nodeId: string, overrides: Partial<TreeNode> = {}): TreeNode {
  return {
    nodeId,
    path: `${nodeId}.yml`,
    contents: `# ${nodeId}\n`,
    source: null,
    commitSha: 'sha',
    editable: true,
    includes: [],
    ...overrides,
  };
}

function buildTree(): TreeNode {
  return node('root', {
    includes: [node('child-a', { includes: [node('grandchild')] }), node('child-b')],
  });
}

describe('TreeService', () => {
  describe('walk', () => {
    it('visits every node pre-order with parent and depth', () => {
      const visited: Array<[string, string | undefined, number]> = [];
      TreeService.walk(buildTree(), (n, parent, depth) => visited.push([n.nodeId, parent?.nodeId, depth]));

      expect(visited).toEqual([
        ['root', undefined, 0],
        ['child-a', 'root', 1],
        ['grandchild', 'child-a', 2],
        ['child-b', 'root', 1],
      ]);
    });

    it('is a no-op for an undefined root', () => {
      const visitor = jest.fn();
      TreeService.walk(undefined, visitor);
      expect(visitor).not.toHaveBeenCalled();
    });

    it('does not revisit a node when the graph contains a cycle', () => {
      const root = node('root');
      const child = node('child', { includes: [root] });
      root.includes = [child];

      const visited: string[] = [];
      TreeService.walk(root, (n) => visited.push(n.nodeId));

      expect(visited).toEqual(['root', 'child']);
    });
  });

  describe('findNode', () => {
    it('finds a nested node by id', () => {
      expect(TreeService.findNode(buildTree(), 'grandchild')?.path).toBe('grandchild.yml');
    });

    it('returns undefined for a missing id', () => {
      expect(TreeService.findNode(buildTree(), 'nope')).toBeUndefined();
    });

    it('returns undefined for an undefined tree', () => {
      expect(TreeService.findNode(undefined, 'root')).toBeUndefined();
    });
  });

  describe('flatten', () => {
    it('returns nodes in pre-order', () => {
      expect(TreeService.flatten(buildTree()).map((n) => n.nodeId)).toEqual([
        'root',
        'child-a',
        'grandchild',
        'child-b',
      ]);
    });
  });

  describe('sourceLabel', () => {
    const src = (overrides: Partial<NonNullable<TreeNode['source']>>): TreeNode['source'] => ({
      path: null,
      repository: null,
      branch: null,
      tag: null,
      commit: null,
      ...overrides,
    });

    it('returns null for the root and for path-only includes', () => {
      expect(TreeService.sourceLabel(null)).toBeNull();
      expect(TreeService.sourceLabel(src({ path: 'modules/a.yml' }))).toBeNull();
    });

    it('labels cross-repo and cross-branch includes', () => {
      expect(TreeService.sourceLabel(src({ repository: 'shared-modules', branch: 'main' }))).toBe('@shared-modules');
      expect(TreeService.sourceLabel(src({ branch: 'feature-x' }))).toBe('@feature-x');
    });

    it('prefers pinned refs (commit/tag) and shortens commits', () => {
      expect(TreeService.sourceLabel(src({ tag: 'v1.4.0' }))).toBe('tag: v1.4.0');
      expect(TreeService.sourceLabel(src({ repository: 'r', commit: 'abc1234567890' }))).toBe('commit: abc1234');
    });
  });

  describe('fileName', () => {
    it('returns the basename', () => {
      expect(TreeService.fileName('modules/workflows.yml')).toBe('workflows.yml');
      expect(TreeService.fileName('bitrise.yml')).toBe('bitrise.yml');
    });
  });

  describe('serializeTree', () => {
    it('splices live contents + the modified flag while preserving structure', () => {
      const result = TreeService.serializeTree(buildTree(), {
        'child-a': { contents: 'edited-a', modified: true },
      });

      const childA = TreeService.findNode(result, 'child-a');
      expect(childA?.contents).toBe('edited-a');
      expect(childA?.modified).toBe(true);
      expect(TreeService.findNode(result, 'grandchild')?.nodeId).toBe('grandchild');
    });

    it('keeps loaded contents and marks unmodified for nodes missing from the live map', () => {
      const result = TreeService.serializeTree(buildTree(), {});
      const childB = TreeService.findNode(result, 'child-b');
      expect(childB?.contents).toBe('# child-b\n');
      expect(childB?.modified).toBe(false);
    });

    it('does not mutate the input tree', () => {
      const tree = buildTree();
      TreeService.serializeTree(tree, { root: { contents: 'x', modified: true } });
      expect(tree.contents).toBe('# root\n');
    });
  });
});
