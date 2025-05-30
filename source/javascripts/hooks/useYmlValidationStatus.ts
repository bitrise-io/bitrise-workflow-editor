/* eslint-disable no-underscore-dangle */
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { create } from 'zustand';

import YmlUtils from '@/core/utils/YmlUtils';

import useBitriseYmlStore from './useBitriseYmlStore';

const ajv = new Ajv({ strict: false, allErrors: true });
const SCHEMA_URL = 'https://json.schemastore.org/bitrise.json';

const useIsAjvValidatorReady = create(() => false);

(async function initializeSchemaValidator() {
  addFormats(ajv);
  ajv.addSchema(await fetch(SCHEMA_URL).then((response) => response.json()), SCHEMA_URL);
  useIsAjvValidatorReady.setState(true);
})();

function useYmlValidationStatus() {
  const isAjvValidatorReady = useIsAjvValidatorReady();

  return useBitriseYmlStore((s) => {
    // eslint-disable-next-line no-underscore-dangle
    if (s.__invalidYmlString !== undefined) {
      return 'invalid' as const;
    }

    if (s.ymlDocument.warnings.length > 0) {
      return 'warnings' as const;
    }

    if (isAjvValidatorReady && !ajv.validate(SCHEMA_URL, s.yml)) {
      return 'warnings' as const;
    }

    return 'valid' as const;
  });
}

export function getYmlValidationStatus(ymlString?: string) {
  if (!ymlString) {
    return 'valid' as const;
  }

  const doc = YmlUtils.toDoc(ymlString);
  if (doc.errors.length > 0) {
    return 'invalid' as const;
  }

  if (useIsAjvValidatorReady.getState() && !ajv.validate(SCHEMA_URL, doc.toJSON())) {
    return 'warnings' as const;
  }

  if (doc.warnings.length > 0) {
    return 'warnings' as const;
  }

  return 'valid' as const;
}

export default useYmlValidationStatus;
