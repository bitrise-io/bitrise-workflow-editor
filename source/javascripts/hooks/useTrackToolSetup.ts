import { useEffect } from 'react';

import { clearToolSetupWrites, trackToolSetupSaved } from '@/core/analytics/ToolSetupAnalytics';
import { subscribeToSavedDocuments } from '@/core/stores/BitriseYmlStore';

/** Sends a Segment event for each tool entry a save changes. See `trackToolSetupSaved`. */
function useTrackToolSetup() {
  useEffect(
    () =>
      subscribeToSavedDocuments((next, prev, isSave) => {
        if (isSave) {
          trackToolSetupSaved(prev, next);
        }
        clearToolSetupWrites();
      }),
    [],
  );
}

export default useTrackToolSetup;
