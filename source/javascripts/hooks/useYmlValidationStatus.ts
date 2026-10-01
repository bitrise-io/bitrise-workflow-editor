import useBitriseYmlStore from './useBitriseYmlStore';

function useYmlValidationStatus() {
  return useBitriseYmlStore((s) => {
    // YAML that doesn't parse makes the config invalid whatever the markers say, and Monaco would
    // only report it after a flicker.
    if (s.ymlDocument.errors.length > 0) {
      return 'invalid' as const;
    }

    return s.validationStatus;
  });
}

export default useYmlValidationStatus;
