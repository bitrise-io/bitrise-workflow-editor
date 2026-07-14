import * as monaco from 'monaco-editor';
import { useEffect } from 'react';

import { bitriseYmlStore, getYmlString, setValidationStatus } from '@/core/stores/BitriseYmlStore';
import MonacoUtils from '@/core/utils/MonacoUtils';
import useFeatureFlag from '@/hooks/useFeatureFlag';

export const BACKGROUND_MODEL_URI = monaco.Uri.parse('file:///bitrise.yml');

function useYmlLanguageServices() {
  const enableBitriseLsp = useFeatureFlag('enable-wfe-bitrise-lsp-integration');

  useEffect(() => {
    // Configure Monaco language services (idempotent — safe to call multiple times)
    MonacoUtils.configureForYaml(monaco);
    MonacoUtils.configureEnvVarsCompletionProvider(monaco);
    // The Bitrise LSP integration runs a Monaco worker that queries Algolia (steplib_steps)
    // on every document change for diagnostics/completion/hover. Gate it behind a flag so it
    // can be disabled without a deploy. When off, editing falls back to plain monaco-yaml.
    if (enableBitriseLsp) {
      MonacoUtils.configureBitriseLanguageServer(monaco);
    }

    // Create or reuse the background model
    let model = monaco.editor.getModel(BACKGROUND_MODEL_URI);
    if (!model) {
      model = monaco.editor.createModel(getYmlString(), 'yaml', BACKGROUND_MODEL_URI);
    }

    // Subscribe to marker changes
    const markerDisposable = MonacoUtils.onModelMarkerStatusChange(model, setValidationStatus);

    // Subscribe to BitriseYmlStore changes to keep the model in sync
    // when changes come from outside the editor (e.g., visual editor pages)
    const unsubscribeStore = bitriseYmlStore.subscribe(
      (state) => ({
        ymlDocument: state.ymlDocument,
        savedYmlDocument: state.savedYmlDocument,
        invalidYmlString: state.__invalidYmlString,
        savedInvalidYmlString: state.__savedInvalidYmlString,
        discardKey: state.discardKey,
      }),
      (curr, prev) => {
        const isDiscard = curr.discardKey !== prev.discardKey;
        const isExternalInit =
          curr.savedYmlDocument !== prev.savedYmlDocument || curr.savedInvalidYmlString !== prev.savedInvalidYmlString;

        const syncModel = () => {
          const newValue = getYmlString();
          if (model && model.getValue() !== newValue) {
            model.setValue(newValue);
          }
        };

        if (model.isAttachedToEditor()) {
          if (isDiscard || isExternalInit) {
            // Defer until after React's synchronous render cycle disposes the old editor.
            // Calling setValue() immediately would trigger async Monaco work that gets
            // canceled when the editor unmounts, causing "Canceled" errors.
            requestAnimationFrame(syncModel);
            return;
          }
          // Otherwise skip — user typing drives the model directly.
          // Calling setValue() would overwrite with YAML round-tripped text,
          // breaking cursor position and undo history.
          return;
        }

        syncModel();
      },
      {
        equalityFn: (a, b) =>
          a.ymlDocument === b.ymlDocument &&
          a.savedYmlDocument === b.savedYmlDocument &&
          a.invalidYmlString === b.invalidYmlString &&
          a.savedInvalidYmlString === b.savedInvalidYmlString &&
          a.discardKey === b.discardKey,
      },
    );

    return () => {
      markerDisposable.dispose();
      unsubscribeStore();
      // NOTE: We intentionally do NOT dispose the model here.
      // The model must survive effect re-runs (including React Strict Mode double-mount)
      // because configureMonacoYaml / configureBitriseYaml run async workers on it.
      // Disposing it while workers are in-flight causes "Model is disposed" errors.
      // The model lives for the entire app session — monaco.editor.getModel() reuses it.
    };
  }, [enableBitriseLsp]);
}

export default useYmlLanguageServices;
