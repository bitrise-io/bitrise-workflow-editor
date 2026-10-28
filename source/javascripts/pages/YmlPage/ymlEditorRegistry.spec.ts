import YmlEditorRegistry from './ymlEditorRegistry';

const yml = `format_version: '13'
pipelines:
  release:
    workflows:
      build: {}
workflows:
  build:
    steps: []
  _setup: {}
step_bundles:
  cache: {}
`;

describe('ymlEditorRegistry.findDefinitionOffset', () => {
  it('finds the key of a definition under its section', () => {
    const offset = YmlEditorRegistry.findDefinitionOffset(yml, 'workflows', 'build');
    expect(yml.slice(offset, offset + 'build'.length)).toBe('build');
    // The one under `workflows:`, not the reference inside the Pipeline.
    expect(offset).toBeGreaterThan(yml.indexOf('workflows:\n  build'));
  });

  it('finds Pipelines and Step bundles', () => {
    expect(yml.slice(YmlEditorRegistry.findDefinitionOffset(yml, 'pipelines', 'release')).startsWith('release:')).toBe(
      true,
    );
    expect(yml.slice(YmlEditorRegistry.findDefinitionOffset(yml, 'step_bundles', 'cache')).startsWith('cache:')).toBe(
      true,
    );
  });

  it('returns -1 for a missing definition or unreadable text', () => {
    expect(YmlEditorRegistry.findDefinitionOffset(yml, 'workflows', 'deploy')).toBe(-1);
    expect(YmlEditorRegistry.findDefinitionOffset('{{{', 'workflows', 'build')).toBe(-1);
  });
});
