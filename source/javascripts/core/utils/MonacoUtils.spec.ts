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

  // Simulates Monaco cancelling a prior request when a new one arrives (e.g. typing `$` twice quickly).
  // Immediately invoking the callback mirrors what Monaco does when the token is already cancelled
  // by the time onCancellationRequested is registered, which causes abortController.abort() to fire
  // before the async API calls settle.
  const mockToken = {
    isCancellationRequested: true,
    onCancellationRequested: jest.fn((callback: (e: unknown) => void) => {
      callback(undefined);
      return { dispose: jest.fn() };
    }),
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

  it('returns empty suggestions when the cancellation token fires and the fetch throws a ClientError', async () => {
    // client.ts wraps the native AbortError from an aborted fetch into a ClientError
    // (name === 'ClientError'). The fix checks abortController.signal.aborted directly
    // instead of relying on error.name === 'AbortError', so the wrapped error is handled correctly.
    const nativeAbortError = new Error('The operation was aborted.');
    nativeAbortError.name = 'AbortError';
    const wrappedClientError = new ClientError(nativeAbortError);

    (EnvVarsApi.getEnvVars as jest.Mock).mockRejectedValue(wrappedClientError);
    (SecretApi.getSecrets as jest.Mock).mockResolvedValue([]);
    (SecretApi.getCodeSigningSecrets as jest.Mock).mockResolvedValue([]);

    const result = await provideCompletionItems(mockModel, mockPosition, mockContext, mockToken);
    expect(result).toEqual({ suggestions: [] });
  });
});
