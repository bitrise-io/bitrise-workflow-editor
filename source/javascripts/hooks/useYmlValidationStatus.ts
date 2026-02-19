import useBitriseYmlStore from './useBitriseYmlStore';

function useYmlValidationStatus() {
  return useBitriseYmlStore((s) => {
    if (s.__invalidYmlString !== undefined) {
      return 'invalid' as const;
    }

    return s.validationStatus;
  });
}

export default useYmlValidationStatus;
