import { ClientError } from '../api/client';

jest.mock('monaco-editor', () => ({}), { virtual: true });
jest.mock('@monaco-editor/react', () => ({ loader: { config: jest.fn() } }));
jest.mock('monaco-yaml', () => ({ configureMonacoYaml: jest.fn() }));
jest.mock('@bitrise/languageserver/monaco', () => ({ configureBitriseYaml: jest.fn() }), { virtual: true });
jest.mock('../api/AlgoliaApi', () => ({
  __esModule: true,
  default: { getAllAvailableVersionsByIds: jest.fn(), getStepsByMultipleCvs: jest.fn() },
}));
jest.mock('../api/EnvVarsApi', () => ({ __esModule: true, default: { getEnvVars: jest.fn() } }));
jest.mock('../api/SecretApi', () => ({
  __esModule: true,
  default: { getSecrets: jest.fn(), getCodeSigningSecrets: jest.fn() },
}));
jest.mock('../stores/BitriseYmlStore', () => ({ getBitriseYml: jest.fn() }));
jest.mock('./PageProps', () => ({ __esModule: true, default: { appSlug: jest.fn() } }));
jest.mock('../services/BitriseYmlService', () => ({ __esModule: true, default: { getUniqueStepCvss: jest.fn() } }));
jest.mock('../services/StepService', () => ({
  __esModule: true,
  default: { isBitriseLibraryStep: jest.fn(), parseStepCVS: jest.fn() },
}));

import type { languages } from 'monaco-editor';

import EnvVarsApi from '../api/EnvVarsApi';
import SecretApi from '../api/SecretApi';
import BitriseYmlService from '../services/BitriseYmlService';
import { getBitriseYml } from '../stores/BitriseYmlStore';
import MonacoUtils from './MonacoUtils';
import PageProps from './PageProps';

describe('MonacoUtils.configureEnvVarsCompletionProvider', () => {
  let provideCompletionItems: NonNullable<languages.CompletionItemProvider['provideCompletionItems']>;

  const mockModel = {
    getLineContent: jest.fn(() => 'value: $'),
    getWordUntilPosition: jest.fn(() => ({ startColumn: 9, endColumn: 9 })),
  } as unknown as Parameters<typeof provideCompletionItems>[0];

  const mockPosition = { lineNumber: 1, column: 9 } as Parameters<typeof provideCompletionItems>[1];

  const mockContext = {} as Parameters<typeof provideCompletionItems>[2];

  const mockToken = {
    isCancellationRequested: false,
    onCancellationRequested: jest.fn(() => ({ dispose: jest.fn() })),
  } as unknown as Parameters<typeof provideCompletionItems>[3];

  beforeAll(() => {
    (getBitriseYml as jest.Mock).mockReturnValue({});
    (PageProps.appSlug as jest.Mock).mockReturnValue('test-app');
    (BitriseYmlService.getUniqueStepCvss as jest.Mock).mockReturnValue([]);

    let capturedProvider: languages.CompletionItemProvider | null = null;

    const mockMonacoInstance = {
      languages: {
        registerCompletionItemProvider: jest.fn((_langs: unknown, provider: languages.CompletionItemProvider) => {
          capturedProvider = provider;
        }),
        CompletionItemKind: { Variable: 6 },
      },
    } as unknown as Parameters<typeof MonacoUtils.configureEnvVarsCompletionProvider>[0];

    MonacoUtils.configureEnvVarsCompletionProvider(mockMonacoInstance);

    provideCompletionItems = capturedProvider!.provideCompletionItems!;
  });

  it('re-throws ClientError from an aborted fetch instead of returning empty suggestions', async () => {
    // client.ts wraps every thrown error — including the native AbortError from an aborted
    // fetch — in a ClientError (name === 'ClientError'). The catch in provideCompletionItems
    // only checks error.name === 'AbortError', so the ClientError is re-thrown.
    const nativeAbortError = new Error('The operation was aborted.');
    nativeAbortError.name = 'AbortError';
    const wrappedClientError = new ClientError(nativeAbortError);

    (EnvVarsApi.getEnvVars as jest.Mock).mockRejectedValue(wrappedClientError);
    (SecretApi.getSecrets as jest.Mock).mockResolvedValue([]);
    (SecretApi.getCodeSigningSecrets as jest.Mock).mockResolvedValue([]);

    await expect(provideCompletionItems(mockModel, mockPosition, mockContext, mockToken)).rejects.toThrow(ClientError);
  });
});
