import { useEffect, useState } from 'react';
import { configureMonacoYaml, MonacoYaml } from 'monaco-yaml';
import { Monaco } from '@monaco-editor/react';

const MONACO_YAML_OPTIONS = {
  hover: true,
  format: true,
  validate: true,
  completion: true,
  enableSchemaRequest: true,
  schemas: [
    {
      uri: 'https://json.schemastore.org/bitrise.json',
      fileMatch: ['*'],
    },
  ],
};

const useMonacoYaml = (monaco: Monaco | undefined) => {
  const [monacoYaml, setMonacoYaml] = useState<MonacoYaml>();

  useEffect(() => {
    if (monaco) {
      setMonacoYaml(configureMonacoYaml(monaco, MONACO_YAML_OPTIONS));
    }
  }, [monaco]);

  useEffect(() => monacoYaml?.dispose, [monacoYaml]);
};

export default useMonacoYaml;
