import { useEffect } from 'react';

import { clearToolSetupWrites, pruneToolSetupWrites, trackToolSetupSaved } from '@/core/analytics/ToolSetupAnalytics';
import { subscribeToDiscards, subscribeToSavedDocuments } from '@/core/stores/BitriseYmlStore';

/** Records in RUM the tool entries each save changes. See `trackToolSetupSaved`. */
function useTrackToolSetup() {
  useEffect(() => {
    const unsubscribeSaves = subscribeToSavedDocuments((next, prev, isSave) => {
      if (isSave) {
        trackToolSetupSaved(prev, next);
      }
      clearToolSetupWrites();
    });
    const unsubscribeDiscards = subscribeToDiscards(pruneToolSetupWrites);

    return () => {
      unsubscribeSaves();
      unsubscribeDiscards();
    };
  }, []);
}

export default useTrackToolSetup;
