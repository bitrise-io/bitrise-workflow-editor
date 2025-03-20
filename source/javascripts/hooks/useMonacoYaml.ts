import { useEffect, useState } from 'react';
import { configureMonacoYaml, MonacoYaml } from 'monaco-yaml';
import { Monaco } from '@monaco-editor/react';
import { useQuery } from '@tanstack/react-query';

const useMonacoYaml = (monaco: Monaco | undefined) => {
  const { data: schema } = useQuery({
    queryKey: ['bitrise-yml-schema'],
    queryFn: async ({ signal }) => {
      const response = await fetch('https://json.schemastore.org/bitrise.json', {
        signal,
        cache: 'no-cache',
      });

      return response.json();
    },
    gcTime: 1000 * 60 * 60 * 24, // 1 day
    staleTime: 1000 * 60 * 60 * 24, // 1 day
  });

  const [monacoYaml, setMonacoYaml] = useState<MonacoYaml>();

  useEffect(() => {
    if (monaco && schema) {
      setMonacoYaml(
        configureMonacoYaml(monaco, {
          hover: true,
          format: true,
          validate: true,
          completion: true,
          schemas: [
            {
              schema,
              fileMatch: ['*'],
              uri: 'https://json.schemastore.org/bitrise.json',
            },
          ],
        }),
      );
    }
  }, [monaco, schema]);

  useEffect(() => monacoYaml?.dispose, [monacoYaml]);
};

export default useMonacoYaml;
