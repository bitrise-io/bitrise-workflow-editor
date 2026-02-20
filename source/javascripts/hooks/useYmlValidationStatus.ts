import useBitriseYmlStore from './useBitriseYmlStore';

function useYmlValidationStatus() {
  return useBitriseYmlStore((s) => {
    // The `__invalidYmlString` property is set when the YML string is initially invalid, so we can not able to parse.
    // Which means that the validation status should be 'invalid' regardless of the actual validation status.
    // In this case we don't need to wait for the Monaco editor to parse the YML string and update the validation
    // status, which would cause a flicker in the UI.
    if (s.__invalidYmlString !== undefined) {
      return 'invalid' as const;
    }

    return s.validationStatus;
  });
}

export default useYmlValidationStatus;
