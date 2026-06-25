import { debounce } from 'es-toolkit';
import { useEffect, useState } from 'react';

import MonacoUtils, { type ValidationStatus } from '@/core/utils/MonacoUtils';

// Mirrors the model path ModularYmlEditor gives each module file's editor.
const fileModelUri = (nodeId: string) => `file:///modular/${nodeId}`;

/**
 * Validation status (`valid` | `warnings` | `invalid`) per open file tab, derived from its Monaco
 * model's markers and kept live via `onDidChangeMarkers`. Files without a loaded model (not yet
 * opened in the YAML editor) report `valid` — there are no markers to read.
 */
export default function useFileTabValidationStatuses(nodeIds: string[]): Record<string, ValidationStatus> {
  const [statuses, setStatuses] = useState<Record<string, ValidationStatus>>({});
  // Stable primitive dep so the effect only re-subscribes when the set of open tabs changes.
  const key = nodeIds.join('\n');

  useEffect(() => {
    const ids = key ? key.split('\n') : [];
    const tabUris = new Set(ids.map(fileModelUri));
    const recompute = () =>
      setStatuses(Object.fromEntries(ids.map((id) => [id, MonacoUtils.getValidationStatusForUri(fileModelUri(id))])));

    recompute();
    // Markers settle in two passes (monaco-yaml's schema layer + the slower Bitrise LS); debounce
    // the recompute so the dot doesn't flicker through a premature status.
    const debounced = debounce(recompute, 250);
    // Only react to marker changes for the open file tabs — ignore the background/merged models and
    // any other Monaco instances on the page.
    const subscription = MonacoUtils.onMarkersChange((changedUris) => {
      if (changedUris.some((uri) => tabUris.has(uri.toString()))) {
        debounced();
      }
    });
    return () => {
      debounced.cancel();
      subscription.dispose();
    };
  }, [key]);

  return statuses;
}
