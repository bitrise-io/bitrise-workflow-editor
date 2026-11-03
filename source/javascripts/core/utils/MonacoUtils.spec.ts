import * as monaco from 'monaco-editor';

import MonacoUtils from './MonacoUtils';

// monaco-editor ships ESM only, which Jest doesn't resolve, so it and its wrappers are virtual.
jest.mock(
  'monaco-editor',
  () => ({
    MarkerSeverity: { Error: 8, Warning: 4 },
    Uri: { parse: (uri: string) => uri },
    editor: { getModel: jest.fn(), setModelMarkers: jest.fn() },
  }),
  { virtual: true },
);
jest.mock('@monaco-editor/react', () => ({ loader: { config: jest.fn() } }), { virtual: true });
jest.mock('monaco-yaml', () => ({ configureMonacoYaml: jest.fn() }), { virtual: true });
jest.mock('@bitrise/languageserver/monaco', () => ({ configureBitriseYaml: jest.fn() }), { virtual: true });
// The completion providers' APIs read `window` on import.
jest.mock('../api/AlgoliaApi', () => ({}));
jest.mock('../api/EnvVarsApi', () => ({}));
jest.mock('../api/SecretApi', () => ({}));

const setModel = (text: string) => {
  jest.mocked(monaco.editor.getModel).mockReturnValue({
    getValue: () => text,
    getPositionAt: (offset: number) => ({ lineNumber: 1, column: offset + 1 }),
  } as unknown as monaco.editor.ITextModel);
};

const markers = () => jest.mocked(monaco.editor.setModelMarkers).mock.lastCall?.[2];

describe('MonacoUtils.setAliasMarkers', () => {
  it('warns on an alias without calling the Visual editor disabled', () => {
    setModel('a: &x 1\nb: *x\n');

    MonacoUtils.setAliasMarkers('bitrise://bitrise.yml');

    expect(markers()).toEqual([
      expect.objectContaining({
        severity: monaco.MarkerSeverity.Warning,
        message: "The Visual editor doesn't support YAML aliases or merge keys. Edit the parts that use them as YAML.",
      }),
    ]);
  });

  it('marks an alias with no anchor as an error with the parser message', () => {
    setModel('b: *missing\n');

    MonacoUtils.setAliasMarkers('bitrise://bitrise.yml');

    expect(markers()).toEqual([
      expect.objectContaining({
        severity: monaco.MarkerSeverity.Error,
        message: expect.stringContaining('missing'),
      }),
    ]);
  });
});
