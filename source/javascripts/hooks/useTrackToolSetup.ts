import { useEffect } from 'react';

import { clearToolSetupWrites, trackToolSetupSaved } from '@/core/analytics/ToolSetupAnalytics';
import { subscribeToSavedDocuments } from '@/core/stores/BitriseYmlStore';
import RuntimeUtils from '@/core/utils/RuntimeUtils';

/** Sends a Segment event for each tool entry a save changes. See `trackToolSetupSaved`. */
function useTrackToolSetup() {
  useEffect(() => {
    // Segment drops events outside website mode, so the snapshots would be built for nothing.
    if (!RuntimeUtils.isWebsiteMode()) {
      return undefined;
    }

    return subscribeToSavedDocuments((next, prev, isSave) => {
      if (isSave) {
        trackToolSetupSaved(prev, next);
      }
      clearToolSetupWrites();
    });
  }, []);
}

export default useTrackToolSetup;
