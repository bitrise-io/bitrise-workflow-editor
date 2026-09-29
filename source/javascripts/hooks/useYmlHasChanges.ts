import useBitriseYmlStore from './useBitriseYmlStore';

export default function useYmlHasChanges() {
  return useBitriseYmlStore((s) => {
    if (s.__invalidYmlString && s.__savedInvalidYmlString) {
      // If the invalid YML strings are different, we consider it as a change. In a modular config the
      // other files can have changes too.
      return s.__invalidYmlString !== s.__savedInvalidYmlString || (!!s.tree && s.hasChanges);
    }

    // Check if the current YML document is different from the saved one
    return !!s.__invalidYmlString || s.hasChanges;
  });
}
