import { TreeNode, TreeNodeSource } from '@/core/models/Tree';

import FileTreeService from './FileTreeService';

const source = (partial: Partial<TreeNodeSource>): TreeNodeSource => ({
  path: null,
  repository: null,
  branch: null,
  tag: null,
  commit: null,
  ...partial,
});

const node = (nodeId: string, path: string, src: TreeNodeSource | null, includes: TreeNode[] = []): TreeNode => ({
  nodeId,
  path,
  contents: '',
  source: src,
  commitSha: 'a'.repeat(40),
  editable: src === null || (!src.repository && !src.branch && !src.tag && !src.commit),
  includes,
});

describe('FileTreeService.buildFileTree', () => {
  it('returns [] for a missing root', () => {
    expect(FileTreeService.buildFileTree(undefined, { projectRepoLabel: 'repo' })).toEqual([]);
  });

  it('puts the working repo first with the project label and no ref', () => {
    const root = node('n_root', 'bitrise.yml', null, [
      node('n_x', 'shared/build.yml', source({ path: 'shared/build.yml', repository: 'other-repo', branch: 'main' })),
    ]);

    const [project, crossRepo] = FileTreeService.buildFileTree(root, { projectRepoLabel: 'project-repo-name' });

    expect(project.header).toBe('project-repo-name');
    expect(project.isReadOnly).toBe(false);

    expect(crossRepo.header).toBe('other-repo@main');
    expect(crossRepo.isReadOnly).toBe(true);
  });

  it('collapses single-child directory chains into one folder entry', () => {
    const root = node('n_root', 'bitrise.yml', null, [
      node('n_t', 'e2e/bitrise/testing/testing.yml', source({ path: 'e2e/bitrise/testing/testing.yml' })),
      node(
        'n_p',
        'e2e/bitrise/testing/browserstack/pipelines.yml',
        source({ path: 'e2e/bitrise/testing/browserstack/pipelines.yml' }),
      ),
    ]);

    const [project] = FileTreeService.buildFileTree(root, { projectRepoLabel: 'repo' });

    expect(project.root.files.map((f) => f.fileName)).toEqual(['bitrise.yml']);
    expect(project.root.folders).toHaveLength(1);

    const collapsed = project.root.folders[0];
    expect(collapsed.label).toBe('e2e/bitrise/testing');
    expect(collapsed.files.map((f) => f.fileName)).toEqual(['testing.yml']);
    expect(collapsed.folders.map((f) => f.label)).toEqual(['browserstack']);
    expect(collapsed.folders[0].files.map((f) => f.fileName)).toEqual(['pipelines.yml']);
  });

  it('splits same-repo includes from a different ref into their own (read-only) groups, no markers on names', () => {
    const root = node('n_root', 'bitrise.yml', null, [
      node('n_plain', 'build.yml', source({ path: 'build.yml' })),
      node('n_b', 'pipelines.yml', source({ path: 'pipelines.yml', branch: 'branch-a' })),
      node('n_t', 'workflows2.yml', source({ path: 'workflows2.yml', tag: 'tag-a' })),
      node(
        'n_c',
        'workflows.yml',
        source({ path: 'workflows.yml', commit: '9d1df0011223344556677889900aabbccddeeff0' }),
      ),
    ]);

    const groups = FileTreeService.buildFileTree(root, { projectRepoLabel: 'repo' });
    const byHeader = Object.fromEntries(groups.map((g) => [g.header, g]));

    expect(groups[0].header).toBe('repo');
    expect(groups[0].isReadOnly).toBe(false);
    expect(groups[0].root.files.map((f) => f.fileName)).toEqual(['bitrise.yml', 'build.yml']);

    expect(byHeader['repo@branch-a'].isReadOnly).toBe(true);
    expect(byHeader['repo@branch-a'].root.files.map((f) => f.fileName)).toEqual(['pipelines.yml']);
    expect(byHeader['repo:tag-a'].root.files.map((f) => f.fileName)).toEqual(['workflows2.yml']);
    expect(byHeader['repo:9d1df00'].root.files.map((f) => f.fileName)).toEqual(['workflows.yml']);
  });

  it('groups a cross-repo include under its own read-only repo group', () => {
    const repoRoot = node('n_repo', 'bitrise.yml', source({ repository: 'other-repo', branch: 'main' }), [
      node('n_child', 'workflow_templates/workflows.yml', source({ path: 'workflow_templates/workflows.yml' })),
    ]);
    const root = node('n_root', 'bitrise.yml', null, [repoRoot]);

    const crossRepo = FileTreeService.buildFileTree(root, { projectRepoLabel: 'repo' })[1];

    expect(crossRepo.header).toBe('other-repo@main');
    expect(crossRepo.isReadOnly).toBe(true);
    expect(crossRepo.root.files.map((f) => f.fileName)).toEqual(['bitrise.yml']);
    const folder = crossRepo.root.folders[0];
    expect(folder.label).toBe('workflow_templates');
    expect(folder.files.map((f) => f.fileName)).toEqual(['workflows.yml']);
  });

  it('orders files (then folders) deterministically by name regardless of include order', () => {
    const root = node('n_root', 'bitrise.yml', null, [
      node('n_z', 'zebra.yml', source({ path: 'zebra.yml' })),
      node('n_dir_b', 'beta/b.yml', source({ path: 'beta/b.yml' })),
      node('n_a', 'alpha.yml', source({ path: 'alpha.yml' })),
      node('n_dir_a', 'alpha-dir/a.yml', source({ path: 'alpha-dir/a.yml' })),
      node('n_m', 'mid.yml', source({ path: 'mid.yml' })),
    ]);

    const [project] = FileTreeService.buildFileTree(root, { projectRepoLabel: 'repo' });

    expect(project.root.files.map((f) => f.fileName)).toEqual(['alpha.yml', 'bitrise.yml', 'mid.yml', 'zebra.yml']);
    expect(project.root.folders.map((f) => f.label)).toEqual(['alpha-dir', 'beta']);
  });

  it('keeps the cross-repo group + header when only an inherited child survives the filter', () => {
    const repoRoot = node('n_repo', 'bitrise.yml', source({ repository: 'other-repo', branch: 'main' }), [
      node('n_child', 'workflow_templates/workflows.yml', source({ path: 'workflow_templates/workflows.yml' })),
    ]);
    const root = node('n_root', 'bitrise.yml', null, [repoRoot]);

    const groups = FileTreeService.buildFileTree(root, {
      projectRepoLabel: 'repo',
      filter: (n) => n.nodeId === 'n_child',
    });

    expect(groups).toHaveLength(1);
    expect(groups[0].header).toBe('other-repo@main');
    expect(groups[0].root.folders[0].files.map((f) => f.fileName)).toEqual(['workflows.yml']);
  });

  it('honors the filter (e.g. dirty-only) and drops empty groups', () => {
    const root = node('n_root', 'bitrise.yml', null, [
      node('n_keep', 'a.yml', source({ path: 'a.yml' })),
      node('n_drop', 'b.yml', source({ path: 'b.yml' })),
      node('n_repo', 'c.yml', source({ path: 'c.yml', repository: 'other', branch: 'main' })),
    ]);

    const groups = FileTreeService.buildFileTree(root, {
      projectRepoLabel: 'repo',
      filter: (n) => n.nodeId === 'n_keep',
    });

    expect(groups).toHaveLength(1);
    expect(groups[0].header).toBe('repo');
    expect(groups[0].isReadOnly).toBe(false);
    expect(groups[0].root.files.map((f) => f.fileName)).toEqual(['a.yml']);
  });
});
