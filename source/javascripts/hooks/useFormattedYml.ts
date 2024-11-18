import { useEffect, useRef, useState } from 'react';

import { AppConfig } from '@/models/AppConfig';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import useMonolithApiCallback from '@/hooks/api/useMonolithApiCallback';

const identityParser = (result: string): any => result;

const useFormattedYml = (appConfig: AppConfig): string => {
  const [yml, setYml] = useState(typeof appConfig === 'string' ? appConfig : '');
  const formatAppConfigRef = useRef<(options?: RequestInit) => void>();
  const { failed, result, call } = useMonolithApiCallback<string>(
    '/api/cli/format',
    {
      method: 'POST',
      headers: {
        Accept: 'application/x-yaml, application/json',
      },
    },
    identityParser,
  );

  // NOTE: call function isn't referentially stable
  useEffect(() => {
    console.log(1);
    formatAppConfigRef.current = call;
  });

  // Set the js-yaml value as fallback, kick off format endpoint
  useEffect(() => {
    console.log(2);
    const yaml = BitriseYmlApi.toYml(appConfig);
    setYml(yaml);

    if (typeof appConfig === 'object') {
      formatAppConfigRef.current?.({
        body: JSON.stringify({
          app_config_datastore_yaml: yaml,
        }),
      });
    }
  }, [appConfig]);

  // When result finally comes in override the fallback value
  useEffect(() => {
    if (result && !failed) {
      setYml(result);
    }
  }, [result, failed]);

  return yml;
};

export default useFormattedYml;
