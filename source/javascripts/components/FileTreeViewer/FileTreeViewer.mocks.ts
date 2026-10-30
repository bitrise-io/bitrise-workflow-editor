import { TreeNode } from '@/core/models/Tree';

const COMMIT_SHA = 'a1b2c3d4e5f6789012345678901234567890abcd';

const src = (partial: Partial<NonNullable<TreeNode['source']>>): TreeNode['source'] => ({
  path: null,
  repository: null,
  branch: null,
  tag: null,
  commit: null,
  ...partial,
});

const leaf = (nodeId: string, path: string, source: TreeNode['source'], editable = true): TreeNode => ({
  nodeId,
  path,
  contents: `# ${path}\n`,
  source,
  commitSha: COMMIT_SHA,
  editable,
  includes: [],
});

const ROOT_CONTENTS = `format_version: "13"
default_step_lib_source: https://github.com/bitrise-io/bitrise-steplib.git
project_type: other
workflows:
  build:
    steps:
    - git-clone@8: {}
    - script@1:
        title: Build
        inputs:
        - content: echo "build"
  test:
    steps:
    - git-clone@8: {}
    - script@1:
        title: Run tests
        inputs:
        - content: echo "test"
  deploy:
    steps:
    - deploy-to-bitrise-io@2: {}
`;

const root = (includes: TreeNode[]): TreeNode => ({
  nodeId: 'n_root',
  path: 'bitrise.yml',
  contents: ROOT_CONTENTS,
  source: null,
  commitSha: COMMIT_SHA,
  editable: true,
  includes,
});

const sharedRepoModules = {
  ...leaf('n_other', 'bitrise.yml', src({ repository: 'another-repo-name', branch: 'main' }), false),
  includes: [
    leaf('n_other_wf', 'workflow_templates/workflows.yml', src({ path: 'workflow_templates/workflows.yml' }), false),
  ],
};

export const MODULAR_ROOT = root([
  leaf('n_testing', 'e2e/bitrise/testing/testing.yml', src({ path: 'e2e/bitrise/testing/testing.yml' })),
  leaf(
    'n_pipelines',
    'e2e/bitrise/testing/browserstack/pipelines.yml',
    src({ path: 'e2e/bitrise/testing/browserstack/pipelines.yml', branch: 'branch-a' }),
  ),
  leaf(
    'n_wf',
    'e2e/bitrise/testing/browserstack/workflows/workflows.yml',
    src({ path: 'e2e/bitrise/testing/browserstack/workflows/workflows.yml', commit: '9d1df0011223344' }),
  ),
  leaf(
    'n_wf2',
    'e2e/bitrise/testing/browserstack/workflows/workflows2.yml',
    src({ path: 'e2e/bitrise/testing/browserstack/workflows/workflows2.yml', tag: 'tag-a' }),
  ),
  leaf(
    'n_build',
    'e2e/bitrise/testing/browserstack/workflows/build_app.yml',
    src({ path: 'e2e/bitrise/testing/browserstack/workflows/build_app.yml' }),
  ),
  sharedRepoModules,
]);

const LARGE_MODULE_PATHS = [
  ...['android', 'ios', 'web'].flatMap((platform) =>
    ['build', 'test', 'lint', 'deploy', 'release', 'nightly'].map((stage) => `ci/${platform}/${stage}.yml`),
  ),
  ...['unit', 'integration', 'ui', 'snapshot', 'performance'].map((suite) => `ci/shared/test-suites/${suite}.yml`),
  'ci/shared/step-bundles/setup.yml',
  'ci/shared/step-bundles/cache.yml',
  'ci/shared/step-bundles/notifications.yml',
  'ci/shared/containers.yml',
  'ci/shared/triggers.yml',
  'ci/experimental/very-long-folder-name-for-a-feature-team/another-nested-folder/workflows-with-a-long-name.yml',
];

/** Enough modules, nesting and long names to make the tree scroll on both axes. */
export const LARGE_MODULAR_ROOT = root([
  ...LARGE_MODULE_PATHS.map((path, index) => leaf(`n_large_${index}`, path, src({ path }))),
  sharedRepoModules,
]);
