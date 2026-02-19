import * as monaco from 'monaco-editor';
import { useEffect } from 'react';

import { bitriseYmlStore, getYmlString, setValidationStatus } from '@/core/stores/BitriseYmlStore';
import MonacoUtils from '@/core/utils/MonacoUtils';
import useFeatureFlag from '@/hooks/useFeatureFlag';

export const BACKGROUND_MODEL_URI = monaco.Uri.parse('file:///bitrise.yml');

function useBackgroundYmlValidation() {
  const enableBitriseLanguageServer = useFeatureFlag('enable-wfe-bitrise-language-server');

  useEffect(() => {
    // Configure Monaco language services (idempotent — safe to call multiple times)
    MonacoUtils.configureForYaml(monaco);
    MonacoUtils.configureEnvVarsCompletionProvider(monaco);
    if (enableBitriseLanguageServer) {
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
        invalidYmlString: state.__invalidYmlString,
      }),
      () => {
        // Skip when an editor widget is using the model — user typing drives it directly.
        // Calling setValue() would overwrite with YAML round-tripped text, breaking
        // cursor position and undo history.
        if (model.isAttachedToEditor()) {
          return;
        }
        const newValue = getYmlString();
        if (model && model.getValue() !== newValue) {
          model.setValue(newValue);
        }
      },
      {
        equalityFn: (a, b) => a.ymlDocument === b.ymlDocument && a.invalidYmlString === b.invalidYmlString,
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
  }, [enableBitriseLanguageServer]);
}

export default useBackgroundYmlValidation;
