import type { editor } from 'monaco-editor';
import { useRef, useState } from 'react';
import { useUnmount } from 'usehooks-ts';

import MonacoUtils, { type ValidationStatus } from '@/core/utils/MonacoUtils';

/**
 * Tracks validation status of a Monaco editor model by listening to its markers.
 *
 * Use this hook when:
 *   - You need validation status for a model that isn't the main background model
 *   - You want to avoid re-renders from BitriseYmlStore and only update on marker changes
 *
 * Example: DiffEditor and ConfigMergeEditor use this to track their modified models (changes what not saved in the BitriseYmlStore yet).
 *
 * Call `subscribeToModel(model)` after the editor mounts.
 * Cleanup happens automatically on unmount.
 */
function useModelValidationStatus(initialStatus: ValidationStatus = 'valid') {
  const [status, setStatus] = useState<ValidationStatus>(initialStatus);
  const disposableRef = useRef<{ dispose(): void }>();

  useUnmount(() => {
    disposableRef.current?.dispose();
  });

  const subscribeToModel = (model: editor.ITextModel) => {
    disposableRef.current?.dispose();
    disposableRef.current = MonacoUtils.onModelMarkerStatusChange(model, setStatus);
  };

  return [status, subscribeToModel] as const;
}

export default useModelValidationStatus;
