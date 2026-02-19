import type { editor } from 'monaco-editor';
import { useRef, useState } from 'react';
import { useUnmount } from 'usehooks-ts';

import MonacoUtils, { type ValidationStatus } from '@/core/utils/MonacoUtils';

/**
 * Tracks marker-based validation status for a Monaco model.
 *
 * Call `subscribeToModel(model)` once the editor is mounted.
 * The subscription is automatically cleaned up on unmount.
 */
function useMonacoMarkerStatus(initialStatus: ValidationStatus = 'valid') {
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

export default useMonacoMarkerStatus;
