import useBitriseYmlStore from './useBitriseYmlStore';

function useYmlValidationStatus() {
  return useBitriseYmlStore((state) => {
    // eslint-disable-next-line no-underscore-dangle
    if (state.__invalidYmlString !== undefined) {
      return 'invalid' as const;
    }
    if (state.ymlDocument.warnings.length > 0) {
      return 'warnings' as const;
    }
    return 'valid' as const;
  });
}

export default useYmlValidationStatus;
