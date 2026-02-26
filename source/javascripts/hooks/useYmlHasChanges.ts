/* eslint-disable no-underscore-dangle */

import useBitriseYmlStore from './useBitriseYmlStore';
import useModularConfig from './useModularConfig';

export default function useYmlHasChanges() {
  const isModular = useModularConfig((s) => s.isModular);
  const modularFiles = useModularConfig((s) => s.files);

  const bitriseYmlHasChanges = useBitriseYmlStore((s) => {
    if (s.__invalidYmlString && s.__savedInvalidYmlString) {
      return s.__invalidYmlString !== s.__savedInvalidYmlString;
    }
    return !!s.__invalidYmlString || s.hasChanges;
  });

  if (isModular) {
    return modularFiles.some((f) => f.currentContents !== f.savedContents);
  }

  return bitriseYmlHasChanges;
}
